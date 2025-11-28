"use client";

import { useMemo } from "react";
import type { Transaction } from "@/lib/api/types";
import type { TrendSeries } from "@/types/trend-chart";

interface UseTransactionChartParams {
  transactions: Transaction[];
  bucket: "hour" | "day";
}

interface ChartData {
  series: TrendSeries[];
  categories: string[];
}

/**
 * 거래 데이터를 시간대별로 집계하여 차트 데이터 생성
 */
export function useTransactionChart(
  transactions: Transaction[],
  bucket: "hour" | "day" = "day"
): ChartData {
  return useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        series: [
          { label: "common:statuses.approved", data: [], area: true },
          { label: "common:statuses.failed", data: [] },
        ],
        categories: [],
      };
    }

 
    const grouped = new Map<string, { approved: number; failed: number }>();

    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      let key: string;

      if (bucket === "hour") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:00`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { approved: 0, failed: 0 });
      }

      const group = grouped.get(key)!;
      const status = tx.status.toLowerCase();

      if (status === "success") {
        group.approved++;
      } else {
        group.failed++;
      }
    });

    const sortedKeys = Array.from(grouped.keys()).sort();

    const categories = sortedKeys.map((key) => {
      const date = new Date(key);
      if (bucket === "hour") {
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}common:time.hour`; // 번역 키 포함
      } else {
        const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        const dayKey = dayKeys[date.getDay()];
        return `${date.getMonth() + 1}/${date.getDate()}(common:weekdays.${dayKey})`;
      }
    });

    const approvedData: number[] = [];
    const failedData: number[] = [];

    sortedKeys.forEach((key) => {
      const group = grouped.get(key)!;
      approvedData.push(group.approved);
      failedData.push(group.failed);
    });

    return {
      series: [
        { label: "common:statuses.approved", data: approvedData, area: true },
        { label: "common:statuses.failed", data: failedData },
      ],
      categories,
    };
  }, [transactions, bucket]);
}

