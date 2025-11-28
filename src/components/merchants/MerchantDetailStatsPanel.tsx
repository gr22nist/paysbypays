"use client";

import { StatsPanel } from "@hua-labs/ui";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { useTranslation } from "@hua-labs/i18n-core";

interface MerchantStats {
  totalTransactions: number;
  totalAmount: number;
  approvedCount: number;
  failedCount: number;
}

interface MerchantDetailStatsPanelProps {
  stats: MerchantStats;
  merchantName: string;
  approvalRate: number;
  loading: boolean;
}

export function MerchantDetailStatsPanel({
  stats,
  merchantName,
  approvalRate,
  loading,
}: MerchantDetailStatsPanelProps) {
  const { formatCurrency } = useDisplayFormat();
  const { t, tWithParams } = useTranslation();

  return (
    <StatsPanel
      title={t("merchants:detail.stats.title")}
      columns={4}
      loading={loading}
      items={[
        {
          label: t("merchants:detail.stats.totalTransactions"),
          value: (
            <span>
              <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                {stats.totalTransactions.toLocaleString()}
              </span>
              <span className="text-lg text-[var(--text-subtle)] ml-1">
                {t("common:units.transactions")}
              </span>
            </span>
          ),
          description: tWithParams("merchants:detail.stats.totalTransactionsDesc", { merchantName }),
        },
        {
          label: t("merchants:detail.stats.totalAmount"),
          value: stats.totalAmount > 0 ? (
            <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
              {formatCurrency(stats.totalAmount)}
            </span>
          ) : (
            <span className="!text-[var(--text-subtle)] !text-3xl sm:!text-4xl !font-semibold">₩0</span>
          ),
          description: tWithParams("merchants:detail.stats.totalAmountDesc", { merchantName }),
        },
        {
          label: t("merchants:detail.stats.approvalRate"),
          value: (
            <span className="!text-brand-secondary !text-3xl sm:!text-4xl !font-semibold">
              {approvalRate.toFixed(1)}%
            </span>
          ),
          description: tWithParams("merchants:detail.stats.approvalRateDesc", { count: stats.approvedCount.toLocaleString() }),
        },
        {
          label: t("merchants:detail.stats.failedCount"),
          value: (
            <span>
              <span className="!text-red-500 !text-3xl sm:!text-4xl !font-semibold">
                {stats.failedCount.toLocaleString()}
              </span>
              <span className="text-lg text-[var(--text-subtle)] ml-1">
                {t("common:units.transactions")}
              </span>
            </span>
          ),
          description: tWithParams("merchants:detail.stats.failedCountDesc", { merchantName }),
        },
      ]}
      className="mb-6"
    />
  );
}

