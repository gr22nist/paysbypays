"use client";

import { StatsPanel } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";

interface MerchantStats {
  totalCount: number;
  activeCount: number;
  readyCount: number;
  closedCount: number;
  suspendedCount: number;
  inactiveCount: number;
}

interface MerchantStatsPanelProps {
  stats: MerchantStats;
  loading?: boolean;
}

export function MerchantStatsPanel({ stats, loading = false }: MerchantStatsPanelProps) {
  const { t, tWithParams } = useTranslation();
  const countUnit = t("common:units.count");

  return (
    <StatsPanel
      title={t("merchants:stats.title")}
      columns={4}
      loading={loading}
      items={[
        {
          label: t("merchants:stats.total.label"),
          value: (
            <span>
              <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                {stats.totalCount.toLocaleString()}
              </span>
              <span className="ml-1 text-lg text-[var(--text-subtle)]">{countUnit}</span>
            </span>
          ),
          description: t("merchants:stats.total.description"),
        },
        {
          label: t("merchants:stats.active.label"),
          value: (
            <span>
              <span className="!text-brand-secondary !text-3xl sm:!text-4xl !font-semibold">
                {stats.activeCount.toLocaleString()}
              </span>
              <span className="ml-1 text-lg text-[var(--text-subtle)]">{countUnit}</span>
            </span>
          ),
          description: t("merchants:stats.active.description"),
        },
        {
          label: t("merchants:stats.ready.label"),
          value: (
            <span>
              <span className="!text-brand-primary !text-3xl sm:!text-4xl !font-semibold">
                {stats.readyCount.toLocaleString()}
              </span>
              <span className="ml-1 text-lg text-[var(--text-subtle)]">{countUnit}</span>
            </span>
          ),
          description: t("merchants:stats.ready.description"),
        },
        {
          label: t("merchants:stats.closed.label"),
          value: (
            <span>
              <span className="!text-red-500 !text-3xl sm:!text-4xl !font-semibold">
                {stats.closedCount.toLocaleString()}
              </span>
              <span className="ml-1 text-lg text-[var(--text-subtle)]">{countUnit}</span>
            </span>
          ),
          description: tWithParams("merchants:stats.closed.description", {
            suspended: stats.suspendedCount,
            inactive: stats.inactiveCount,
          }),
        },
      ]}
    />
  );
}

