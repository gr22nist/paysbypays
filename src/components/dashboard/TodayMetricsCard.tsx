"use client";

import { useMemo } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";

interface TodayMetricsCardProps {
  className?: string;
}

export function TodayMetricsCard({ className = "" }: TodayMetricsCardProps) {
  const { formatCurrency } = useDisplayFormat();
  const { t } = useTranslation();

  // 오늘 날짜 범위 계산
  const today = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return {
      from: start.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    };
  }, []);

  // 어제 날짜 범위 계산
  const yesterday = useMemo(() => {
    const now = new Date();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const start = new Date(
      yesterdayDate.getFullYear(),
      yesterdayDate.getMonth(),
      yesterdayDate.getDate()
    );
    const end = new Date(
      yesterdayDate.getFullYear(),
      yesterdayDate.getMonth(),
      yesterdayDate.getDate(),
      23,
      59,
      59
    );
    return {
      from: start.toISOString().split("T")[0],
      to: end.toISOString().split("T")[0],
    };
  }, []);

  // 오늘 거래 데이터
  const { data: todayData, isLoading: todayLoading } = useTransactions({
    page: 0,
    size: 1000,
    from: today.from,
    to: today.to,
  });

  // 어제 거래 데이터
  const { data: yesterdayData } = useTransactions({
    page: 0,
    size: 1000,
    from: yesterday.from,
    to: yesterday.to,
  });

  // 오늘 지표 계산
  const todayMetrics = useMemo(() => {
    if (!todayData?.content) {
      return {
        amount: 0,
        count: 0,
        approvedCount: 0,
        approvalRate: 0,
        averageAmount: 0,
      };
    }

    const totalAmount = todayData.content.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const totalCount = todayData.content.length;
    const approvedCount = todayData.content.filter(
      (tx) => (tx.status || "").toLowerCase() === "success" || (tx.status || "").toLowerCase() === "approved"
    ).length;
    const approvalRate = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    return {
      amount: totalAmount,
      count: totalCount,
      approvedCount,
      approvalRate,
      averageAmount,
    };
  }, [todayData]);

  // 어제 지표 계산
  const yesterdayMetrics = useMemo(() => {
    if (!yesterdayData?.content) {
      return {
        amount: 0,
        count: 0,
        approvalRate: 0,
        averageAmount: 0,
      };
    }

    const totalAmount = yesterdayData.content.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const totalCount = yesterdayData.content.length;
    const approvedCount = yesterdayData.content.filter(
      (tx) => (tx.status || "").toLowerCase() === "success" || (tx.status || "").toLowerCase() === "approved"
    ).length;
    const approvalRate = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    return {
      amount: totalAmount,
      count: totalCount,
      approvalRate,
      averageAmount,
    };
  }, [yesterdayData]);

  // 증감률 계산
  const changes = useMemo(() => {
    const amountChange =
      yesterdayMetrics.amount > 0
        ? ((todayMetrics.amount - yesterdayMetrics.amount) / yesterdayMetrics.amount) * 100
        : 0;
    const countChange =
      yesterdayMetrics.count > 0
        ? ((todayMetrics.count - yesterdayMetrics.count) / yesterdayMetrics.count) * 100
        : 0;
    const approvalRateChange = todayMetrics.approvalRate - yesterdayMetrics.approvalRate;
    const averageAmountChange =
      yesterdayMetrics.averageAmount > 0
        ? ((todayMetrics.averageAmount - yesterdayMetrics.averageAmount) / yesterdayMetrics.averageAmount) * 100
        : 0;

    return {
      amount: amountChange,
      count: countChange,
      approvalRate: approvalRateChange,
      averageAmount: averageAmountChange,
    };
  }, [todayMetrics, yesterdayMetrics]);

  const formatChange = (value: number, isPercentage = false) => {
    const sign = value > 0 ? "+" : "";
    const formatted = isPercentage ? `${sign}${value.toFixed(1)}%` : `${sign}${value.toFixed(1)}%`;
    const color =
      value > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : value < 0
          ? "text-red-600 dark:text-red-400"
          : "text-[var(--text-muted)]";
    return { formatted, color };
  };

  if (todayLoading) {
    return (
      <div className={`micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-sm ${className}`}>
        <div className="text-sm text-[var(--text-muted)]">오늘의 지표를 불러오는 중...</div>
      </div>
    );
  }

  const amountChange = formatChange(changes.amount);
  const countChange = formatChange(changes.count);
  const approvalRateChange = formatChange(changes.approvalRate, true);
  const averageAmountChange = formatChange(changes.averageAmount);

  return (
    <div
      className={`micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-strong)]">오늘의 주요 지표</h3>
        <Icon name="calendar" size={16} className="text-[var(--text-muted)]" />
      </div>

      <div className="space-y-4">
        {/* 거래 금액 */}
        <div>
          <div className="mb-1 text-xs text-[var(--text-muted)]">{t("dashboard:sections.summary.metrics.totalVolume.label")}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[var(--text-strong)]">
              {formatCurrency(todayMetrics.amount)}
            </span>
            <span className={`text-xs font-medium ${amountChange.color}`}>
              {amountChange.formatted}
            </span>
          </div>
        </div>

        {/* 거래 건수 */}
        <div>
          <div className="mb-1 text-xs text-[var(--text-muted)]">{t("dashboard:sections.summary.metrics.totalCount.label")}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[var(--text-strong)]">
              {todayMetrics.count.toLocaleString()}건
            </span>
            <span className={`text-xs font-medium ${countChange.color}`}>
              {countChange.formatted}
            </span>
          </div>
        </div>

        {/* 승인률 */}
        <div>
          <div className="mb-1 text-xs text-[var(--text-muted)]">{t("dashboard:sections.summary.metrics.approvalRate.label")}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[var(--text-strong)]">
              {todayMetrics.approvalRate.toFixed(1)}%
            </span>
            <span className={`text-xs font-medium ${approvalRateChange.color}`}>
              {approvalRateChange.formatted}
            </span>
          </div>
        </div>

        {/* 평균 거래금액 */}
        <div>
          <div className="mb-1 text-xs text-[var(--text-muted)]">{t("dashboard:sections.summary.metrics.averageAmount.label")}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[var(--text-strong)]">
              {formatCurrency(Math.round(todayMetrics.averageAmount))}
            </span>
            <span className={`text-xs font-medium ${averageAmountChange.color}`}>
              {averageAmountChange.formatted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

