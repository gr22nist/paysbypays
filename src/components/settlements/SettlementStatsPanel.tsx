"use client";

import { StatsPanel } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";

interface SettlementSummary {
  totalGross: number;
  totalNet: number;
  scheduledCount: number;
  completedCount: number;
  delayedCount: number;
}

interface SettlementStatsPanelProps {
  summary: SettlementSummary;
  loading: boolean;
  formatSummaryAmount: (amount: number) => string;
  panelClass: string;
}

export function SettlementStatsPanel({
  summary,
  loading,
  formatSummaryAmount,
  panelClass,
}: SettlementStatsPanelProps) {
  const { t, tWithParams } = useTranslation();
  
  return (
    <div className={`micro-card ${panelClass}`}>
      <SectionHeaderBlock
        title={t("settlements:stats.title")}
        description={t("settlements:stats.description")}
        containerClassName="px-6 pt-6"
      />
      <div className="px-6 pb-6 pt-4">
        <StatsPanel
        columns={4}
        loading={loading}
        items={[
          {
            label: t("settlements:stats.totalScheduled.label"),
            value: (
              <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                {formatSummaryAmount(summary.totalGross)}
              </span>
            ),
            description: t("settlements:stats.totalScheduled.description"),
          },
          {
            label: t("settlements:stats.netAmount.label"),
            value: (
              <span className="!text-brand-secondary !text-3xl sm:!text-4xl !font-semibold">
                {formatSummaryAmount(summary.totalNet)}
              </span>
            ),
            description: t("settlements:stats.netAmount.description"),
          },
          {
            label: t("settlements:stats.scheduledProcessing.label"),
            value: (
              <span>
                <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                  {summary.scheduledCount.toLocaleString()}
                </span>
                <span className="text-lg text-[var(--text-subtle)] ml-1">
                  {t("common:units.transactions")}
                </span>
              </span>
            ),
            description: t("settlements:stats.scheduledProcessing.description"),
          },
          {
            label: t("settlements:stats.completedDelayed.label"),
            value: (
              <span>
                <span className="!text-brand-secondary !text-3xl sm:!text-4xl !font-semibold">
                  {summary.completedCount.toLocaleString()}
                </span>
                <span className="text-lg text-[var(--text-subtle)] ml-1">
                  {t("common:units.transactions")}
                </span>
                <span className="text-sm text-[var(--text-subtle)] ml-2">
                  ({t("settlements:statuses.delayed")} {summary.delayedCount.toLocaleString()}{t("common:units.transactions")})
                </span>
              </span>
            ),
            description: t("settlements:stats.completedDelayed.description"),
          },
        ]}
        />
      </div>
    </div>
  );
}

