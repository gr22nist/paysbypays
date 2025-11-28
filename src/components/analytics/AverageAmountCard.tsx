"use client";

import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { useTranslation } from "@hua-labs/i18n-core";

interface AverageAmountCardProps {
  averageAmount: number;
}

export function AverageAmountCard({ averageAmount }: AverageAmountCardProps) {
  const { formatCurrency } = useDisplayFormat();
  const { t } = useTranslation();

  return (
    <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="mb-1 text-sm font-medium text-[var(--text-muted)]">{t("common:labels.averageTransactionAmount")}</div>
      <div className="text-brand-primary text-3xl sm:text-4xl font-semibold">
        {formatCurrency(averageAmount)}
      </div>
      <div className="mt-1 text-xs text-[var(--text-subtle)]">{t("common:labels.averagePerTransaction")}</div>
    </div>
  );
}

