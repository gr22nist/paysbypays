"use client";

import { useState, useEffect, useMemo } from "react";
import { transactionsApi } from "@/lib/api/client";
import type { TransactionSummary } from "@/lib/api/types";
import { paymentListResToTransaction } from "@/lib/api/types";

interface UseTransactionSummaryParams {
  from?: string;
  to?: string;
  mchtCode?: string;  // merchantId 대신 mchtCode 사용
  merchantId?: string; // 호환성을 위해 유지
}

interface UseTransactionSummaryResult {
  data: TransactionSummary | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTransactionSummary(params: UseTransactionSummaryParams = {}): UseTransactionSummaryResult {
  const [rawData, setRawData] = useState<Array<{
    paymentCode: string;
    mchtCode: string;
    amount: string;
    currency: string;
    payType: string;
    status: string;
    paymentAt: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await transactionsApi.getTransactions({
        from: params.from,
        to: params.to,
        mchtCode: params.mchtCode || params.merchantId,
        size: 1000,
        page: 0,
      });
      
      console.log("useTransactionSummary - API Result:", result);
      
      if (!result || !result.data) {
        console.warn("useTransactionSummary - No data in response:", result);
        setRawData([]);
        return;
      }
      
      const responseData = result.data || [];

      const fromTime = params.from ? new Date(params.from).getTime() : null;
      const toTime = params.to
        ? new Date(`${params.to}T23:59:59`).getTime()
        : null;

      const filteredData = responseData.filter((tx: { mchtCode?: string; paymentAt?: string }) => {
        const matchesMerchant = params.mchtCode
          ? tx.mchtCode === params.mchtCode
          : params.merchantId
          ? tx.mchtCode === params.merchantId
          : true;

        if (!matchesMerchant) return false;

        if (!fromTime && !toTime) return true;

        if (!tx.paymentAt) return false;
        const paymentTime = new Date(tx.paymentAt).getTime();
        if (Number.isNaN(paymentTime)) return false;

        if (fromTime && paymentTime < fromTime) return false;
        if (toTime && paymentTime > toTime) return false;

        return true;
      });

      if (filteredData.length > 0) {
        const rawStatuses = [...new Set(filteredData.map((tx: { status: string }) => tx.status))];
        console.log("useTransactionSummary - Raw API statuses:", rawStatuses);
        console.log("useTransactionSummary - Sample transaction:", filteredData[0]);
      }
      
      setRawData(filteredData);
    } catch (err) {
      console.error("useTransactionSummary - Error:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch transaction summary"));
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const summaryData = useMemo(() => {
    if (rawData.length === 0) {
      return {
        totalAmount: 0,
        totalCount: 0,
        approvedCount: 0,
        failedCount: 0,
        pendingCount: 0,
        approvalRate: 0,
        averageAmount: 0,
      };
    }

    const rawStatuses = [...new Set(rawData.map(tx => tx.status))];
    console.log("useTransactionSummary - Raw statuses before conversion:", rawStatuses);
    
    const statusCounts = rawData.reduce((acc, tx) => {
      const status = tx.status || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("useTransactionSummary - Status counts (raw):", statusCounts);
    
    const transactions = rawData.map(paymentListResToTransaction);
    
    if (transactions.length > 0) {
      const uniqueStatuses = [...new Set(transactions.map(tx => tx.status))];
      console.log("useTransactionSummary - Statuses after conversion:", uniqueStatuses);
    }
    
    const totalAmount = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const totalCount = transactions.length;
    
    const approvedTransactions = transactions.filter((tx) => {
      const status = (tx.status || "").toLowerCase().trim();
      return status === "success";
    });
    const approvedCount = approvedTransactions.length;
    
    const failedCount = transactions.filter((tx) => {
      const status = (tx.status || "").toLowerCase().trim();
      return status === "failed";
    }).length;
    
    const pendingCount = 0;
    
    const approvalRate = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;
    
    console.log("useTransactionSummary - Stats:", {
      totalCount,
      approvedCount,
      failedCount,
      pendingCount,
      approvalRate: approvalRate.toFixed(2) + "%",
      approvedStatuses: [...new Set(approvedTransactions.map(tx => tx.status))],
    });
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    return {
      totalAmount,
      totalCount,
      approvedCount,
      failedCount,
      pendingCount,
      approvalRate,
      averageAmount,
    };
  }, [rawData]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return {
    data: summaryData,
    isLoading,
    error,
    refetch: fetchData,
  };
}

