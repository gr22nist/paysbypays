"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { useMerchants } from "@/hooks/useMerchants";
import { useTransactions } from "@/hooks/useTransactions";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";

interface MerchantStatusSummaryProps {
  className?: string;
}

export function MerchantStatusSummary({ className = "" }: MerchantStatusSummaryProps) {
  const { data: merchantsData, isLoading: merchantsLoading } = useMerchants({ size: 1000 });
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
    page: 0,
    size: 1000,
  });

  const merchantStatus = useMemo(() => {
    if (!merchantsData?.content || !transactionsData?.content) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        new: 0,
      };
    }

    const total = merchantsData.content.length;

    const activeMerchantIds = new Set<string>();
    transactionsData.content.forEach((tx) => {
      if (tx.merchantId) activeMerchantIds.add(tx.merchantId);
      type TransactionWithMchtCode = typeof tx & { mchtCode?: string };
      const txWithMchtCode = tx as TransactionWithMchtCode;
      if (txWithMchtCode.mchtCode) activeMerchantIds.add(txWithMchtCode.mchtCode);
    });

    const active = activeMerchantIds.size;
    const inactive = total - active;

    const newMerchants = 0;

    return {
      total,
      active,
      inactive,
      new: newMerchants,
    };
  }, [merchantsData, transactionsData]);

  const { t } = useTranslation();

  if (merchantsLoading || transactionsLoading) {
    return (
      <div
        className={`micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-sm ${className}`}
      >
        <div className="h-5 w-32 mb-4 bg-[var(--surface-muted)] rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3 w-16 bg-[var(--surface-muted)] rounded animate-pulse" />
              <div className="h-6 w-12 bg-[var(--surface-muted)] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm ${className}`}
    >
      <SectionHeaderBlock
        title={t("dashboard:sections.merchantStatus.title")}
        containerClassName="px-0 pt-0"
        actionSlot={
          <Link
            href="/merchants"
            className="micro-button inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-brand-primary hover:text-brand-primary"
          >
            <span className="sr-only">{t("common:actions.viewAll")}</span>
            <Icon name="arrowRight" size={16} variant="secondary" />
          </Link>
        }
      />

      <div className="px-6 pb-6 pt-4">
        <div className="space-y-4">
          {/* 전체 가맹점 */}
          <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 p-3">
            <div className="flex items-center gap-2">
              <Icon name="building" size={16} className="text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-strong)]">{t("dashboard:sections.merchantStatus.total")}</span>
            </div>
            <span className="text-lg font-bold text-[var(--text-strong)]">
              {merchantStatus.total.toLocaleString()}{t("common:units.count")}
            </span>
          </div>

          {/* 활성 가맹점 */}
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
            <div className="flex items-center gap-2">
              <Icon name="check" size={16} className="text-emerald-800 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                {t("dashboard:sections.merchantStatus.active")}
              </span>
            </div>
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
              {merchantStatus.active.toLocaleString()}{t("common:units.count")}
            </span>
          </div>

          {/* 비활성 가맹점 */}
          {merchantStatus.inactive > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50/50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
              <div className="flex items-center gap-2">
                <Icon name="warning" size={16} className="text-orange-800 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  {t("dashboard:sections.merchantStatus.inactive")}
                </span>
              </div>
              <span className="text-lg font-bold text-orange-800 dark:text-orange-300">
                {merchantStatus.inactive.toLocaleString()}{t("common:units.count")}
              </span>
              <span className="text-xs text-orange-800 dark:text-orange-400">
                {t("dashboard:sections.merchantStatus.inactiveNote")}
              </span>
            </div>
          )}

          {/* 신규 가맹점 */}
          {merchantStatus.new > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <Icon name="star" size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t("dashboard:sections.merchantStatus.new")}
                </span>
              </div>
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {merchantStatus.new.toLocaleString()}{t("common:units.count")}
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">{t("dashboard:sections.merchantStatus.newNote")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

