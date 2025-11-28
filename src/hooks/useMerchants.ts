"use client";

import { useState, useEffect } from "react";
import { merchantsApi } from "@/lib/api/client";
import type { MerchantListRes, MerchantDetailRes } from "@/lib/api/types";
import { merchantListResToMerchant } from "@/lib/api/types";

interface UseMerchantsParams {
  page?: number;
  size?: number;
  search?: string;
  enabled?: boolean;
}

interface UseMerchantsResult {
  data: {
    content: MerchantListRes[];
    totalElements: number;
    totalPages: number;
  } | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMerchants(params: UseMerchantsParams = {}): UseMerchantsResult {
  const [data, setData] = useState<{
    content: MerchantListRes[];
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
      const result = await merchantsApi.getMerchants({
        page: params.page,
        size: params.size,
        search: params.search,
      });

      setData({
        content: result.data || [],
        totalElements: result.data?.length || 0, // 실제 API에서 페이징 정보 제공 시 수정 필요
        totalPages: 1, // 실제 API에서 페이징 정보 제공 시 수정 필요
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch merchants"));
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

