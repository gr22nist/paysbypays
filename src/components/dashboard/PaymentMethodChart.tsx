"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTransactions } from "@/hooks/useTransactions";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { SkeletonRounded } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { getPayTypeTranslationKey } from "@/data/pay-types";

interface PaymentMethodChartProps {
  className?: string;
}

const COLORS = [
  "var(--brand-primary)",
  "var(--brand-secondary)",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export function PaymentMethodChart({ className = "" }: PaymentMethodChartProps) {
  const { data: transactionsData, isLoading } = useTransactions({
    page: 0,
    size: 1000,
  });

  const { payTypes } = useCommonCodes();
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!transactionsData?.content) return [];

    const statsMap = new Map<string, { count: number; name: string }>();

    transactionsData.content.forEach((tx) => {
      const payType = (tx.paymentMethod || tx.payType || "UNKNOWN").toUpperCase();
      const current = statsMap.get(payType) || { count: 0, name: payType };
      statsMap.set(payType, { count: current.count + 1, name: payType });
    });

    const sorted = Array.from(statsMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([type]) => statsMap.get(type)!);

    const others = Array.from(statsMap.entries())
      .slice(5)
      .reduce((sum, [, item]) => sum + item.count, 0);

    if (others > 0) {
      sorted.push({ name: "OTHER", count: others });
    }

    return sorted.map((item, index) => {
      const translationKey = getPayTypeTranslationKey(item.name);
      return {
        name: translationKey ? t(translationKey) : item.name,
        value: item.count,
        color: COLORS[index % COLORS.length],
      };
    });
  }, [transactionsData, payTypes, t]);

  if (isLoading) {
    return (
      <div className={className}>
        <SkeletonRounded className="h-[200px] w-full" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={`flex h-[200px] items-center justify-center ${className}`}>
        <p className="text-sm text-[var(--text-subtle)]">{t("common:states.empty")}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value}${t("common:units.transactions")}`, t("transactions:stats.totalCount")]}
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

