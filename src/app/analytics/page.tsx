"use client";

import { useMemo } from "react";
import { useTranslation } from "@hua-labs/i18n-core";
import type { DatePreset } from "@/types/date-preset";
import { useTransactions } from "@/hooks/useTransactions";
import { useMerchants } from "@/hooks/useMerchants";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { useTransactionChart } from "@/hooks/useTransactionChart";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useFilterStore } from "@/store/filter-store";
import type { Transaction } from "@/lib/api/types";
import { AnalyticsStatsPanel } from "@/components/analytics/AnalyticsStatsPanel";
import { AverageAmountCard } from "@/components/analytics/AverageAmountCard";
import { AnalyticsTransactionTrendChart } from "@/components/analytics/TransactionTrendChart";
import { ApprovalRateChart } from "@/components/analytics/ApprovalRateChart";
import { PayTypeStatsPanel } from "@/components/analytics/PayTypeStatsPanel";
import { TopMerchantsTable } from "@/components/analytics/TopMerchantsTable";
import { StatusDistributionPanel } from "@/components/analytics/StatusDistributionPanel";

const datePresets: DatePreset[] = [
  { label: "common:dateRanges.today", value: "today" },
  { label: "common:dateRanges.7d", value: "7d" },
  { label: "common:dateRanges.month", value: "month" },
  { label: "common:dateRanges.prevMonth", value: "prev-month" },
  { label: "common:dateRanges.all", value: "all" },
];

function getPresetRanges(): Record<string, { from: Date; to: Date }> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  return {
    today: { from: today, to: now },
    "7d": { from: sevenDaysAgo, to: now },
    month: {
      from: currentMonthStart,
      to: now,
    },
    "prev-month": {
      from: prevMonthStart,
      to: prevMonthEnd,
    },
    all: {
      from: new Date("2020-01-01T00:00:00Z"),
      to: now,
    },
  };
}

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { selectedDatePreset, setSelectedDatePreset } = useFilterStore();
  const selectedPreset = selectedDatePreset || datePresets[2];

  const presetRanges = useMemo(() => getPresetRanges(), []);
  const dateRange = useMemo(() => presetRanges[selectedPreset.value], [presetRanges, selectedPreset]);
  const fromDate = dateRange.from.toISOString().split("T")[0];
  const toDate = dateRange.to.toISOString().split("T")[0];

  const { data: transactionsData, isLoading, error } = useTransactions({
    page: 0,
    size: 1000,
    from: fromDate,
    to: toDate,
  });

  const { data: merchantsData } = useMerchants({ size: 1000 });
  const merchantNameMap = useMemo(() => {
    if (!merchantsData?.content) return new Map();
    return new Map(merchantsData.content.map((m) => [m.mchtCode, m.mchtName]));
  }, [merchantsData]);

  const { payTypes } = useCommonCodes();

  const payTypeStats = useMemo(() => {
    if (!transactionsData?.content) return [];
    
    const statsMap = new Map<string, { count: number; amount: number }>();
    
    transactionsData.content.forEach((tx) => {
      const payType = (tx.paymentMethod || tx.payType || "UNKNOWN").toUpperCase();
      const current = statsMap.get(payType) || { count: 0, amount: 0 };
      statsMap.set(payType, {
        count: current.count + 1,
        amount: current.amount + (tx.amount || 0),
      });
    });

    return Array.from(statsMap.entries())
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        amount: stats.amount,
        percentage: (stats.count / transactionsData.content.length) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactionsData, payTypes]);

  const chartData = useTransactionChart(
    transactionsData?.content || [],
    "day"
  );

  const approvalRateTrend = useMemo<{ series: { label: string; data: number[] }[]; categories: string[] }>(() => {
    if (!transactionsData?.content) {
      return { series: [], categories: [] };
    }
    
    const dailyMap = new Map<string, { approved: number; total: number }>();
    
    transactionsData.content.forEach((tx) => {
      const date = new Date(tx.createdAt || tx.updatedAt || Date.now());
      const dateKey = date.toISOString().split("T")[0];
      const current = dailyMap.get(dateKey) || { approved: 0, total: 0 };
      
      const status = (tx.status || "").toLowerCase();
      const isApproved = status === "success" || status === "approved";
      
      dailyMap.set(dateKey, {
        approved: current.approved + (isApproved ? 1 : 0),
        total: current.total + 1,
      });
    });

    // useTransactionChart와 동일한 형식으로 변환
    const sortedKeys = Array.from(dailyMap.keys()).sort();
    const categories = sortedKeys.map((key) => {
      const date = new Date(key);
      const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const dayKey = dayKeys[date.getDay()];
      const dayLabel = t(`common:weekdays.${dayKey}`);
      return `${date.getMonth() + 1}/${date.getDate()}(${dayLabel})`;
    });
    
    const rateData: number[] = [];
    sortedKeys.forEach((key) => {
      const stats = dailyMap.get(key)!;
      rateData.push(stats.total > 0 ? (stats.approved / stats.total) * 100 : 0);
    });

    return {
      series: [
        { label: t("analytics:approvalRate.label"), data: rateData },
      ],
      categories,
    };
  }, [transactionsData]);

  const merchantStats = useMemo(() => {
    if (!transactionsData?.content) return [];
    
    type TransactionWithMchtCode = Transaction & { mchtCode?: string };
    
    const merchantMap = new Map<string, { count: number; amount: number }>();
    
    transactionsData.content.forEach((tx) => {
      const txWithMchtCode = tx as TransactionWithMchtCode;
      const mchtCode = txWithMchtCode.mchtCode || tx.merchantId || "UNKNOWN";
      const current = merchantMap.get(mchtCode) || { count: 0, amount: 0 };
      merchantMap.set(mchtCode, {
        count: current.count + 1,
        amount: current.amount + (tx.amount || 0),
      });
    });

    return Array.from(merchantMap.entries())
      .map(([code, stats]) => ({
        code,
        name: merchantNameMap.get(code) || code,
        count: stats.count,
        amount: stats.amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [transactionsData, merchantNameMap]);

  const statusDistribution = useMemo(() => {
    if (!transactionsData?.content) return [];
    
    const statusMap = new Map<string, number>();
    
    transactionsData.content.forEach((tx) => {
      const status = (tx.status || "UNKNOWN").toLowerCase();
      let statusKey = "other";
      
      if (status === "success" || status === "approved") {
        statusKey = "approved";
      } else if (status === "failed" || status.includes("fail")) {
        statusKey = "failed";
      } else if (status === "pending") {
        statusKey = "pending";
      } else if (status === "cancelled" || status === "cancel") {
        statusKey = "cancelled";
      }
      
      statusMap.set(statusKey, (statusMap.get(statusKey) || 0) + 1);
    });

    return Array.from(statusMap.entries())
      .map(([statusKey, count]) => ({
        status: t(`analytics:statusMapping.${statusKey}`),
        count,
        percentage: (count / transactionsData.content.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [transactionsData]);

  const overallStats = useMemo(() => {
    if (!transactionsData?.content) return null;
    
    const totalCount = transactionsData.content.length;
    const totalAmount = transactionsData.content.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const approvedCount = transactionsData.content.filter((tx) => {
      const status = (tx.status || "").toLowerCase();
      return status === "success" || status === "approved";
    }).length;
    const failedCount = transactionsData.content.filter((tx) => {
      const status = (tx.status || "").toLowerCase();
      return status === "failed" || status.includes("fail");
    }).length;
    const approvalRate = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    return {
      totalCount,
      totalAmount,
      approvedCount,
      failedCount,
      approvalRate,
      averageAmount,
    };
  }, [transactionsData]);

  const selectedPresetLabel = t(selectedPreset.label);
  const panelClass = "rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm";

  return (
    <DashboardLayout
      title={t("layout:pages.analytics.title")}
      description={t("layout:pages.analytics.description")}
      activeItem="analytics"
    >
      <div className="flex flex-col gap-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
                <div className="h-6 w-32 mb-4 bg-[var(--surface-muted)] rounded animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="h-3 w-16 bg-[var(--surface-muted)] rounded animate-pulse" />
                      <div className="h-8 w-24 bg-[var(--surface-muted)] rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
                <div className="h-6 w-40 mb-4 bg-[var(--surface-muted)] rounded animate-pulse" />
                <div className="h-[300px] w-full bg-[var(--surface-muted)] rounded animate-pulse" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">{t("common:states.loadingError")}</p>
              <p className="text-gray-500 text-sm">{error.message}</p>
            </div>
          ) : !transactionsData?.content || transactionsData.content.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {t("analytics:page.emptyData")}
            </div>
          ) : (
            <>
              <AnalyticsStatsPanel stats={overallStats} />

              {overallStats && <AverageAmountCard averageAmount={overallStats.averageAmount} />}

              <AnalyticsTransactionTrendChart
                chartData={chartData}
                selectedPresetLabel={selectedPresetLabel}
                panelClass={panelClass}
              />

              <ApprovalRateChart
                trend={approvalRateTrend}
                selectedPresetLabel={selectedPresetLabel}
                panelClass={panelClass}
              />

              <PayTypeStatsPanel stats={payTypeStats} panelClass={panelClass} />

              <TopMerchantsTable merchants={merchantStats} panelClass={panelClass} />

              <StatusDistributionPanel distribution={statusDistribution} panelClass={panelClass} />
            </>
          )}
      </div>
    </DashboardLayout>
  );
}

