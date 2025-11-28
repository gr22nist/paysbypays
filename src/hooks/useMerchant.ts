"use client";

import { useState, useEffect } from "react";
import { merchantsApi } from "@/lib/api/client";
import type { MerchantDetailRes } from "@/lib/api/types";

interface UseMerchantResult {
  data: MerchantDetailRes | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMerchant(mchtCode: string | null): UseMerchantResult {
  const [data, setData] = useState<MerchantDetailRes>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!mchtCode) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await merchantsApi.getMerchant(mchtCode);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch merchant"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mchtCode]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

