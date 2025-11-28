"use client";

import { useMemo } from "react";
import Link from "next/link";
import { SkeletonTable } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { PaymentMethodBadge } from "@/components/badges/PaymentMethodBadge";
import type { Transaction } from "@/lib/api/types";

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  merchantNameMap: Map<string, string>;
  payTypeMap: Map<string, string>;
  loading: boolean;
  formatCurrency: (amount: number) => string;
  formatDateTime: (dateString: string) => string;
  panelClass: string;
}

export function RecentTransactionsTable({
  transactions,
  merchantNameMap,
  payTypeMap,
  loading,
  formatCurrency,
  formatDateTime,
  panelClass,
}: RecentTransactionsTableProps) {
  const { t } = useTranslation();
  
  const mapStatus = (status: string): string => {
    const lower = status.toLowerCase();
    if (lower === "success") return t("common:statuses.success");
    if (lower === "failed") return t("common:statuses.failed");
    if (lower === "cancelled" || lower === "cancel") return t("common:statuses.cancelled");
    return status;
  };

  const getStatusColor = (status: string): string => {
    const lower = status.toLowerCase();
    if (lower === "success") return "text-brand-secondary";
    if (lower === "failed") return "text-red-600";
    if (lower === "cancelled" || lower === "cancel") return "text-[var(--text-subtle)]";
    return "text-[var(--text-muted)]";
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [transactions]);

  const displayTransactions = sortedTransactions.slice(0, 5);

  return (
    <div className={panelClass}>
      <SectionHeaderBlock
        title={t("dashboard:sections.recent.title")}
        description={t("dashboard:sections.recent.description")}
        actionSlot={
          <Link
            href="/transactions"
            className="micro-button inline-flex h-9 items-center rounded-full border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-strong)] hover:border-brand-primary hover:text-brand-primary"
          >
            {t("common:actions.viewAll")}
          </Link>
        }
      />
      <div className="px-6 pb-6 pt-4">
        {loading ? (
          <SkeletonTable className="mt-3" />
        ) : displayTransactions.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-subtle)]">
            {t("dashboard:sections.recent.empty")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-sm text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 text-left">{t("dashboard:sections.recent.tableHeaders.id")}</th>
                    <th className="px-4 py-3 text-left">{t("dashboard:sections.recent.tableHeaders.merchant")}</th>
                    <th className="px-4 py-3 text-left">{t("dashboard:sections.recent.tableHeaders.amount")}</th>
                    <th className="px-4 py-3 text-left">{t("dashboard:sections.recent.tableHeaders.status")}</th>
                    <th className="px-4 py-3 text-left">{t("dashboard:sections.recent.tableHeaders.paymentMethod")}</th>
                    <th className="px-4 py-3 text-left">{t("dashboard:sections.recent.tableHeaders.createdAt")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {displayTransactions.map((tx) => {
                    const merchantName =
                      tx.merchantName ||
                      (tx.merchantId
                        ? merchantNameMap.get(tx.merchantId)
                        : undefined) ||
                      "Unknown";
                    return (
                      <tr key={tx.id} className="hover:bg-[var(--surface-muted)]/60">
                        <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                          {tx.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                          {merchantName}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                          {formatCurrency(tx.amount || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm font-medium ${getStatusColor(
                              tx.status || ""
                            )}`}
                          >
                            {mapStatus(tx.status || "")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <PaymentMethodBadge
                            method={tx.paymentMethod || tx.payType}
                            fallbackLabel={payTypeMap.get((tx.paymentMethod || tx.payType || "").toUpperCase())}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                          {formatDateTime(tx.createdAt || "")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

