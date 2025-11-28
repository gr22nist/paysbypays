"use client";

import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { useTranslation } from "@hua-labs/i18n-core";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";

interface PayTypeStat {
  type: string;
  count: number;
  amount: number;
  percentage: number;
}

interface PayTypeStatsPanelProps {
  stats: PayTypeStat[];
  panelClass: string;
}

export function PayTypeStatsPanel({ stats, panelClass }: PayTypeStatsPanelProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useDisplayFormat();

  if (stats.length === 0) return null;

  const totalAmount = stats.reduce((sum, s) => sum + s.amount, 0);
  const countUnit = t("common:units.transactions");

  return (
    <div className={`grid gap-5 xl:grid-cols-2`}>
      <div className={`micro-card ${panelClass}`}>
        <SectionHeaderBlock
          title={t("analytics:panels.payTypeStats.count.title")}
          description={t("analytics:panels.payTypeStats.count.description")}
          containerClassName="px-6 pt-6"
        />
        <div className="px-6 pb-6 pt-4">
          <div className="space-y-3">
            {stats.map((stat) => (
              <div key={stat.type} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-strong)]">
                      {stat.type}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {stat.count.toLocaleString()}{countUnit} ({stat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-brand-primary transition-all"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`micro-card ${panelClass}`}>
        <SectionHeaderBlock
          title={t("analytics:panels.payTypeStats.amount.title")}
          description={t("analytics:panels.payTypeStats.amount.description")}
          containerClassName="px-6 pt-6"
        />
        <div className="px-6 pb-6 pt-4">
          <div className="space-y-3">
            {stats.map((stat) => {
              const amountPercentage = totalAmount > 0 ? (stat.amount / totalAmount) * 100 : 0;
              return (
                <div key={stat.type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text-strong)]">
                        {stat.type}
                      </span>
                      <span className="text-sm text-[var(--text-muted)]">
                        {formatCurrency(stat.amount)} ({amountPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${amountPercentage}%`,
                          background: `linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

