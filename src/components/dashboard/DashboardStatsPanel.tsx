"use client";

import { StatsPanel } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";

interface DashboardStatsPanelProps {
  totalVolume: number;
  totalCount: number;
  approvalRate: number;
  averageAmount: number;
  loading: boolean;
  formatCurrency: (amount: number) => string;
  panelClass: string;
}

export function DashboardStatsPanel({
  totalVolume,
  totalCount,
  approvalRate,
  averageAmount,
  loading,
  formatCurrency,
  panelClass,
}: DashboardStatsPanelProps) {
  const { t } = useTranslation();
  return (
    <div className={panelClass}>
      <SectionHeaderBlock
        title={t("dashboard:sections.summary.title")}
        description={t("dashboard:sections.summary.description")}
        descriptionSize="xs"
      />
      <div className="px-6 pb-6 pt-4">
        <StatsPanel
          columns={2}
          className="grid-cols-2"
          loading={loading}
          items={[
            {
              label: t("dashboard:sections.summary.metrics.totalVolume.label"),
              value: totalVolume > 0 ? (
                <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                  {formatCurrency(totalVolume)}
                </span>
              ) : (
                <span className="!text-[var(--text-subtle)] !text-3xl sm:!text-4xl !font-semibold">₩0</span>
              ),
              description: t("dashboard:sections.summary.metrics.totalVolume.description"),
            },
            {
              label: t("dashboard:sections.summary.metrics.totalCount.label"),
              value: (
                <span>
                  <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                    {totalCount.toLocaleString()}
                  </span>
                  <span className="text-lg text-[var(--text-subtle)] ml-1">{t("common:units.transactions")}</span>
                </span>
              ),
              description: t("dashboard:sections.summary.metrics.totalCount.description"),
            },
            {
              label: t("dashboard:sections.summary.metrics.approvalRate.label"),
              value: (
                <span className="!text-brand-secondary !text-3xl sm:!text-4xl !font-semibold">
                  {approvalRate.toFixed(1)}%
                </span>
              ),
              description: t("dashboard:sections.summary.metrics.approvalRate.description"),
            },
            {
              label: t("dashboard:sections.summary.metrics.averageAmount.label"),
              value: averageAmount > 0 ? (
                <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                  {formatCurrency(Math.round(averageAmount))}
                </span>
              ) : (
                <span className="!text-[var(--text-subtle)] !text-3xl sm:!text-4xl !font-semibold">₩0</span>
              ),
              description: t("dashboard:sections.summary.metrics.averageAmount.description"),
            },
          ]}
        />
      </div>
    </div>
  );
}

