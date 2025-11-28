"use client";

import { useDisplayFormat } from "@/hooks/useDisplayFormat";

interface AverageAmountCardProps {
  averageAmount: number;
}

export function AverageAmountCard({ averageAmount }: AverageAmountCardProps) {
  const { formatCurrency } = useDisplayFormat();

  return (
    <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="mb-1 text-sm font-medium text-[var(--text-muted)]">평균 거래 금액</div>
      <div className="text-brand-primary text-3xl sm:text-4xl font-semibold">
        {formatCurrency(averageAmount)}
      </div>
      <div className="mt-1 text-xs text-[var(--text-subtle)]">건당 평균</div>
    </div>
  );
}

