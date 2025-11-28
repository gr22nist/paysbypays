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
        // 시간 단위: YYYY-MM-DD HH:00
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:00`;
      } else {
        // 일 단위: YYYY-MM-DD
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { approved: 0, failed: 0 });
      }

      const group = grouped.get(key)!;
      const status = tx.status.toLowerCase();

      // 실제 API는 SUCCESS와 FAILED만 사용
      if (status === "success") {
        group.approved++;
      } else {
        // FAILED 또는 알 수 없는 상태는 실패로 처리
        group.failed++;
      }
    });

    // 날짜순으로 정렬
    const sortedKeys = Array.from(grouped.keys()).sort();

    // 카테고리 생성 (번역 키 포함)
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

    // 시리즈 데이터 생성
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

