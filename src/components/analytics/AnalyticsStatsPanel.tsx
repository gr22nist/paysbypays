"use client";

import { StatsPanel } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";

interface OverallStats {
  totalCount: number;
  totalAmount: number;
  approvedCount: number;
  failedCount: number;
  approvalRate: number;
  averageAmount: number;
}

interface AnalyticsStatsPanelProps {
  stats: OverallStats | null;
  panelClass: string;
}

export function AnalyticsStatsPanel({ stats, panelClass }: AnalyticsStatsPanelProps) {
  const { t, tWithParams } = useTranslation();
  const { formatCurrency } = useDisplayFormat();

  if (!stats) return null;

  const countUnit = t("common:units.transactions");

  return (
    <div className={`micro-card ${panelClass}`}>
      <SectionHeaderBlock
        title={t("analytics:panels.overallStats.title")}
        description={t("analytics:panels.overallStats.description")}
        containerClassName="px-6 pt-6"
      />
      <div className="px-6 pb-6 pt-4">
        <StatsPanel
          columns={4}
          items={[
        {
          label: t("analytics:panels.overallStats.totalCount.label"),
          value: (
            <span>
              <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                {stats.totalCount.toLocaleString()}
              </span>
              <span className="text-lg text-[var(--text-subtle)] ml-1">{countUnit}</span>
            </span>
          ),
          description: t("analytics:panels.overallStats.totalCount.description"),
        },
        {
          label: t("analytics:panels.overallStats.totalAmount.label"),
          value: (
            <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
              {formatCurrency(stats.totalAmount)}
            </span>
          ),
          description: t("analytics:panels.overallStats.totalAmount.description"),
        },
        {
          label: t("analytics:panels.overallStats.approvedCount.label"),
          value: (
            <span>
              <span className="!text-brand-secondary !text-3xl sm:!text-4xl !font-semibold">
                {stats.approvedCount.toLocaleString()}
              </span>
              <span className="text-lg text-[var(--text-subtle)] ml-1">{countUnit}</span>
            </span>
          ),
          description: tWithParams("analytics:panels.overallStats.approvedCount.description", {
            rate: stats.approvalRate.toFixed(1),
          }),
        },
        {
          label: t("analytics:panels.overallStats.failedCount.label"),
          value: (
            <span>
              <span className="!text-red-500 !text-3xl sm:!text-4xl !font-semibold">
                {stats.failedCount.toLocaleString()}
              </span>
              <span className="text-lg text-[var(--text-subtle)] ml-1">{countUnit}</span>
            </span>
          ),
          description: t("analytics:panels.overallStats.failedCount.description"),
        },
      ]}
        />
      </div>
    </div>
  );
}

