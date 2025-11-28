"use client";

import { useState, useEffect } from "react";
import { metadataApi } from "@/lib/api/client";
import type { StatusRes, PayTypeRes } from "@/lib/api/types";

interface UseCommonCodesResult {
  paymentStatuses: StatusRes[];
  payTypes: PayTypeRes[];
  merchantStatuses: StatusRes[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCommonCodes(): UseCommonCodesResult {
  const [paymentStatuses, setPaymentStatuses] = useState<StatusRes[]>([]);
  const [payTypes, setPayTypes] = useState<PayTypeRes[]>([]);
  const [merchantStatuses, setMerchantStatuses] = useState<StatusRes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [paymentStatusRes, payTypeRes, merchantStatusRes] = await Promise.all([
        metadataApi.getPaymentStatuses(),
        metadataApi.getPayTypes(),
        metadataApi.getMerchantStatuses(),
      ]);

      const paymentStatusesData = paymentStatusRes.data || [];
      const payTypesData = payTypeRes.data || [];
      const merchantStatusesData = merchantStatusRes.data || [];
      
      // 디버깅: 실제 API 응답 확인
      console.log("Payment Statuses from API:", paymentStatusesData);
      console.log("Pay Types from API:", payTypesData);
      console.log("Merchant Statuses from API:", merchantStatusesData);
      
      // Pay Types 상세 로깅 (실제 코드 형식 확인용)
      if (payTypesData && payTypesData.length > 0) {
        console.log("Pay Types 상세:", payTypesData.map(pt => ({
          type: pt.type,
          description: pt.description,
          upperType: pt.type.toUpperCase()
        })));
      }
      
      setPaymentStatuses(paymentStatusesData);
      setPayTypes(payTypesData);
      setMerchantStatuses(merchantStatusesData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch common codes"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    paymentStatuses,
    payTypes,
    merchantStatuses,
    isLoading,
    error,
    refetch: fetchData,
  };
}

