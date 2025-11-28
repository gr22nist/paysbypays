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
      // /payments/list를 호출하여 전체 데이터 가져오기 (summary API가 없으므로)
      const result = await transactionsApi.getTransactions({
        from: params.from,
        to: params.to,
        mchtCode: params.mchtCode || params.merchantId,
        // 페이징 없이 전체 데이터 가져오기 (실제로는 size를 크게 설정)
        size: 1000, // 충분히 큰 값
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

      // API 응답이 필터를 무시할 수 있으므로 클라이언트에서 한 번 더 필터링
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

  // 클라이언트에서 집계 계산
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

    // 원본 rawData의 status 값 확인 (변환 전)
    const rawStatuses = [...new Set(rawData.map(tx => tx.status))];
    console.log("useTransactionSummary - Raw statuses before conversion:", rawStatuses);
    
    // 각 status별 개수 확인
    const statusCounts = rawData.reduce((acc, tx) => {
      const status = tx.status || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("useTransactionSummary - Status counts (raw):", statusCounts);
    
    const transactions = rawData.map(paymentListResToTransaction);
    
    // 디버깅: 변환 후 status 값 확인
    if (transactions.length > 0) {
      const uniqueStatuses = [...new Set(transactions.map(tx => tx.status))];
      console.log("useTransactionSummary - Statuses after conversion:", uniqueStatuses);
    }
    
    const totalAmount = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const totalCount = transactions.length;
    
    // SUCCESS = 승인, FAILED = 실패
    const approvedTransactions = transactions.filter((tx) => {
      const status = (tx.status || "").toLowerCase().trim();
      return status === "success";
    });
    const approvedCount = approvedTransactions.length;
    
    const failedCount = transactions.filter((tx) => {
      const status = (tx.status || "").toLowerCase().trim();
      return status === "failed";
    }).length;
    
    // 이 API에서는 PENDING이 없으므로 0
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

