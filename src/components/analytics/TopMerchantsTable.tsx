"use client";

import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { useTranslation } from "@hua-labs/i18n-core";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";

interface MerchantStat {
  code: string;
  name: string;
  count: number;
  amount: number;
}

interface TopMerchantsTableProps {
  merchants: MerchantStat[];
  panelClass: string;
}

export function TopMerchantsTable({ merchants, panelClass }: TopMerchantsTableProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useDisplayFormat();

  if (merchants.length === 0) return null;

  const countUnit = t("common:units.transactions");

  return (
    <div className={`micro-card ${panelClass}`}>
      <SectionHeaderBlock
        title={t("analytics:panels.topMerchants.title")}
        description={t("analytics:panels.topMerchants.description")}
        containerClassName="px-6 pt-6"
      />
      <div className="px-6 pb-6 pt-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                  {t("analytics:panels.topMerchants.headers.rank")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                  {t("analytics:panels.topMerchants.headers.merchantName")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                  {t("analytics:panels.topMerchants.headers.transactionCount")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                  {t("analytics:panels.topMerchants.headers.transactionAmount")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {merchants.map((merchant, index) => (
                <tr key={merchant.code} className="hover:bg-[var(--surface-muted)]/60">
                  <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                    {merchant.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                    {merchant.count.toLocaleString()}{countUnit}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                    {formatCurrency(merchant.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

