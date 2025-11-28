"use client";

import { useState, useEffect } from "react";
import { transactionsApi } from "@/lib/api/client";
import type { Transaction } from "@/lib/api/types";
import { paymentListResToTransaction } from "@/lib/api/types";

interface UseTransactionsParams {
  page?: number;
  size?: number;
  status?: string;
  merchantId?: string;
  mchtCode?: string; // 가맹점 코드로 필터링
  from?: string;
  to?: string;
  enabled?: boolean;
}

interface UseTransactionsResult {
  data: {
    content: Transaction[];
    totalElements: number;
    totalPages: number;
  } | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTransactions(params: UseTransactionsParams = {}): UseTransactionsResult {
  const [data, setData] = useState<{
    content: Transaction[];
    totalElements: number;
    totalPages: number;
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (params.enabled === false) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await transactionsApi.getTransactions({
        ...params,
        mchtCode: params.mchtCode || params.merchantId, // mchtCode 우선, 없으면 merchantId 사용
      });
      
      console.log("useTransactions - API Result:", result);
      
      // API 응답 구조 확인
      if (!result || !result.data) {
        console.warn("useTransactions - No data in response:", result);
        setData({
          content: [],
          totalElements: 0,
          totalPages: 0,
        });
        return;
      }
      
      // API 응답을 변환
      const transactions = result.data.map(paymentListResToTransaction);
      console.log("useTransactions - Converted transactions:", transactions);
      
      setData({
        content: transactions,
        totalElements: result.data.length, // 실제 API에서 페이징 정보 제공 시 수정 필요
        totalPages: 1, // 실제 API에서 페이징 정보 제공 시 수정 필요
      });
    } catch (err) {
      console.error("useTransactions - Error:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch transactions"));
      setData({
        content: [],
        totalElements: 0,
        totalPages: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

