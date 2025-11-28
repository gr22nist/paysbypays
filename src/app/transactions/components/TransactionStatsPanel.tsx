"use client";

import { StatsPanel } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";

interface StatSnapshot {
  totalAmount: number;
  totalCount: number;
  approvedCount: number;
  failedCount: number;
  approvalRate: number;
}

interface TransactionStatsPanelProps {
  stats: StatSnapshot;
  presetLabel: string;
  formatCurrency: (value: number) => string;
  panelClass: string;
  loading?: boolean;
}

export function TransactionStatsPanel({
  stats,
  presetLabel,
  formatCurrency,
  panelClass,
  loading = false,
}: TransactionStatsPanelProps) {
  const { t, tWithParams } = useTranslation();

  return (
    <div className={`micro-card ${panelClass}`}>
      <SectionHeaderBlock
        title={t("transactions:stats.title")}
        description={tWithParams("transactions:stats.period", { label: presetLabel })}
        containerClassName="px-6 pt-6"
      />
      <div className="px-6 pb-6 pt-4">
        <StatsPanel
          columns={4}
          loading={loading}
          items={[
            {
              label: t("transactions:stats.totalAmount"),
              value: (
                <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                  {formatCurrency(stats.totalAmount)}
                </span>
              ),
              description: tWithParams("transactions:stats.totalAmountDesc", {
                label: presetLabel,
              }),
            },
            {
              label: t("transactions:stats.totalCount"),
              value: (
                <span>
                  <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                    {stats.totalCount.toLocaleString()}
                  </span>
                  <span className="text-lg text-[var(--text-subtle)] ml-1">
                    {t("common:units.transactions")}
                  </span>
                </span>
              ),
              description: t("transactions:stats.totalCountDesc"),
            },
            {
              label: t("transactions:stats.approved"),
              value: (
                <span>
                  <span className="!text-brand-secondary !text-3xl sm:!text-4xl !font-semibold">
                    {stats.approvedCount.toLocaleString()}
                  </span>
                  <span className="text-lg text-[var(--text-subtle)] ml-1">
                    {t("common:units.transactions")}
                  </span>
                </span>
              ),
              description: tWithParams("transactions:stats.approvalRateLabel", {
                rate: stats.approvalRate.toFixed(1),
              }),
            },
            {
              label: t("transactions:stats.failed"),
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
              description: t("transactions:stats.failedDesc"),
            },
          ]}
        />
      </div>
    </div>
  );
}

