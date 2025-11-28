"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@hua-labs/i18n-core";
import { transactionsApi, merchantsApi } from "@/lib/api/client";
import { paymentListResToTransaction, type Transaction } from "@/lib/api/types";
import {
  buildSettlementTimeline,
  deriveSettlementsFromTransactions,
  mergeSettlementRecords,
  summarizeSettlements,
  type SettlementRecord,
  type SettlementSummary,
} from "@/data/settlements";
import type { TrendSeries } from "@/types/trend-chart";

interface SettlementTimeline {
  categories: string[];
  series: TrendSeries[];
}

interface SettlementData {
  summary: SettlementSummary;
  records: SettlementRecord[];
  timeline: SettlementTimeline;
}

interface UseSettlementsResult {
  data: SettlementData | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSettlements(): UseSettlementsResult {
  const { t } = useTranslation();
  const [data, setData] = useState<SettlementData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const buildTimeline = useCallback((records: SettlementRecord[]): SettlementTimeline => {
    const timelinePoints = buildSettlementTimeline(records);
    const categories = timelinePoints.map((point) => point.label);
    const scheduledSeries: TrendSeries = {
      label: t("settlements:timeline.series.scheduled"),
      data: timelinePoints.map((point) => point.scheduled),
      area: true,
    };
    const completedSeries: TrendSeries = {
      label: t("settlements:timeline.series.completed"),
      data: timelinePoints.map((point) => point.completed),
      area: true,
    };

    return {
      categories,
      series: [scheduledSeries, completedSeries],
    };
  }, [t]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [transactionsResponse, merchantsResponse] = await Promise.all([
        transactionsApi.getTransactions({
          page: 0,
          size: 200,
        }),
        merchantsApi.getMerchants({
          page: 0,
          size: 1000,
        }),
      ]);

      const raw = transactionsResponse?.data ?? [];
      const transactions: Transaction[] = raw.map(paymentListResToTransaction);

      const merchantNameMap = new Map<string, string>();
      if (merchantsResponse?.data) {
        merchantsResponse.data.forEach((merchant) => {
          merchantNameMap.set(merchant.mchtCode, merchant.mchtName);
        });
      }

      transactions.forEach((tx) => {
        if (tx.merchantId && tx.merchantName && !merchantNameMap.has(tx.merchantId)) {
          merchantNameMap.set(tx.merchantId, tx.merchantName);
        }
      });

      const realRecords = deriveSettlementsFromTransactions(transactions, merchantNameMap);
      const records = mergeSettlementRecords(realRecords);
      const summary = summarizeSettlements(records);
      const timeline = buildTimeline(records);

      setData({
        summary,
        records,
        timeline,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(t("settlements:errors.loadFailed")));
      const fallbackRecords = mergeSettlementRecords([]);
      setData({
        summary: summarizeSettlements(fallbackRecords),
        records: fallbackRecords,
        timeline: buildTimeline(fallbackRecords),
      });
    } finally {
      setIsLoading(false);
    }
  }, [buildTimeline, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}


