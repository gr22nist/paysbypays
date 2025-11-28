"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { useSettlements } from "@/hooks/useSettlements";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";

interface SettlementAlertCardProps {
  className?: string;
}

export function SettlementAlertCard({ className = "" }: SettlementAlertCardProps) {
  const { t } = useTranslation();
  const { data: settlementData, isLoading } = useSettlements();
  const { formatCurrency } = useDisplayFormat();

  const settlementInfo = useMemo(() => {
    if (!settlementData?.records) {
      return {
        todayCount: 0,
        todayAmount: 0,
        tomorrowCount: 0,
        tomorrowAmount: 0,
        delayedCount: 0,
        delayedAmount: 0,
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    let todayCount = 0;
    let todayAmount = 0;
    let tomorrowCount = 0;
    let tomorrowAmount = 0;
    let delayedCount = 0;
    let delayedAmount = 0;

    settlementData.records.forEach((record) => {
      const scheduledDate = new Date(record.scheduledDate);
      const isToday =
        scheduledDate >= today && scheduledDate < tomorrow;
      const isTomorrow =
        scheduledDate >= tomorrow && scheduledDate < dayAfterTomorrow;
      const isDelayed = record.status === "delayed";

      if (isDelayed) {
        delayedCount++;
        delayedAmount += record.netAmount;
      } else if (isToday) {
        todayCount++;
        todayAmount += record.netAmount;
      } else if (isTomorrow) {
        tomorrowCount++;
        tomorrowAmount += record.netAmount;
      }
    });

    return {
      todayCount,
      todayAmount,
      tomorrowCount,
      tomorrowAmount,
      delayedCount,
      delayedAmount,
    };
  }, [settlementData]);

  if (isLoading) {
    return (
      <div
        className={`micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-sm ${className}`}
      >
        <div className="h-5 w-32 mb-4 bg-[var(--surface-muted)] rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-24 bg-[var(--surface-muted)] rounded animate-pulse" />
              <div className="h-6 w-16 bg-[var(--surface-muted)] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasAlerts = settlementInfo.delayedCount > 0 || settlementInfo.todayCount > 0 || settlementInfo.tomorrowCount > 0;

  return (
    <div
      className={`micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm ${className}`}
    >
      <SectionHeaderBlock
        title={t("dashboard:sections.settlementAlert.title")}
        containerClassName="px-0 pt-0"
        actionSlot={
          <Link
            href="/settlements"
            className="micro-button inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-brand-primary hover:text-brand-primary"
          >
            <span className="sr-only">{t("common:actions.viewAll")}</span>
            <Icon name="arrowRight" size={16} variant="secondary" />
          </Link>
        }
      />

      <div className="px-6 pb-6 pt-4">
        {!hasAlerts ? (
          <div className="py-4 text-center text-sm text-[var(--text-subtle)]">
            {t("dashboard:sections.settlementAlert.empty")}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 지연된 정산 */}
            {settlementInfo.delayedCount > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <div className="mb-1 flex items-center gap-2">
                  <Icon name="warning" size={16} className="text-red-600 dark:text-red-400" />
                  <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                    {t("dashboard:sections.settlementAlert.delayed")}
                  </span>
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  {settlementInfo.delayedCount}{t("common:units.transactions")} · {formatCurrency(settlementInfo.delayedAmount)}
                </div>
              </div>
            )}

            {/* 오늘 정산 예정 */}
            {settlementInfo.todayCount > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="mb-1 flex items-center gap-2">
                  <Icon name="timer" size={16} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    {t("dashboard:sections.settlementAlert.today")}
                  </span>
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  {settlementInfo.todayCount}{t("common:units.transactions")} · {formatCurrency(settlementInfo.todayAmount)}
                </div>
              </div>
            )}

            {/* 내일 정산 예정 */}
            {settlementInfo.tomorrowCount > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="mb-1 flex items-center gap-2">
                  <Icon name="calendar" size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    {t("dashboard:sections.settlementAlert.tomorrow")}
                  </span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {settlementInfo.tomorrowCount}{t("common:units.transactions")} · {formatCurrency(settlementInfo.tomorrowAmount)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

