"use client";

import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { useTranslation } from "@hua-labs/i18n-core";

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface StatusDistributionPanelProps {
  distribution: StatusDistribution[];
  panelClass: string;
}

export function StatusDistributionPanel({
  distribution,
  panelClass,
}: StatusDistributionPanelProps) {
  const { t } = useTranslation();
  
  if (distribution.length === 0) return null;

  const countUnit = t("common:units.transactions");

  return (
    <div className={`micro-card ${panelClass}`}>
      <SectionHeaderBlock
        title={t("analytics:panels.statusDistribution.title")}
        description={t("analytics:panels.statusDistribution.description")}
        containerClassName="px-6 pt-6"
      />
      <div className="px-6 pb-6 pt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {distribution.map((stat) => (
            <div
              key={stat.status}
              className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 p-4"
            >
              <div className="mb-1 text-sm font-medium text-[var(--text-muted)]">
                {stat.status}
              </div>
              <div className="mb-1 text-2xl font-bold text-[var(--text-strong)]">
                {stat.count.toLocaleString()}{countUnit}
              </div>
              <div className="text-xs text-[var(--text-subtle)]">
                {stat.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

