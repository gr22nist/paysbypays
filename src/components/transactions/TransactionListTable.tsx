"use client";

import Link from "next/link";
import type { Transaction } from "@/lib/api/types";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { TransactionStatusBadge } from "@/components/badges/TransactionStatusBadge";
import { PaymentMethodBadge } from "@/components/badges/PaymentMethodBadge";
import { useTranslation } from "@hua-labs/i18n-core";

export interface TransactionListTableProps {
  transactions: Transaction[];
  merchantNameMap: Map<string, string>;
  payTypeMap: Map<string, string>;
  isLoading?: boolean;
  error?: Error | null;
  showHeader?: boolean;
  maxRows?: number;
  onRowClick?: (transaction: Transaction) => void;
}

export function TransactionListTable({
  transactions,
  merchantNameMap,
  payTypeMap,
  isLoading = false,
  error = null,
  showHeader = true,
  maxRows,
  onRowClick,
}: TransactionListTableProps) {
  const { formatDateTime } = useDisplayFormat();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        {t("common:states.loadingData")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-2">{t("common:states.loadingError")}</p>
        <p className="text-gray-500 text-sm">{error.message}</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        {t("transactions:table.empty")}
      </div>
    );
  }

  const displayTransactions = maxRows ? transactions.slice(0, maxRows) : transactions;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              {t("transactions:table.headers.id")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              {t("transactions:table.headers.merchant")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              {t("transactions:table.headers.amount")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              {t("transactions:table.headers.status")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              {t("transactions:table.headers.payMethod")}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              {t("transactions:table.headers.createdAt")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {displayTransactions.map((tx) => {
            const merchantName =
              tx.merchantName ||
              (tx.merchantId ? merchantNameMap.get(tx.merchantId) : undefined) ||
              "Unknown";

            return (
              <tr
                key={tx.id}
                className={
                  onRowClick
                    ? "hover:bg-gray-50 cursor-pointer"
                    : "hover:bg-gray-50"
                }
                onClick={onRowClick ? () => onRowClick(tx) : undefined}
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {tx.id}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {merchantName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ₩{tx.amount?.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <TransactionStatusBadge status={tx.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <PaymentMethodBadge
                    method={tx.paymentMethod || tx.payType}
                    fallbackLabel={
                      payTypeMap.get((tx.paymentMethod || tx.payType || "").toUpperCase()) ||
                      tx.paymentMethod ||
                      tx.payType
                    }
                    size="sm"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDateTime(tx.createdAt || "")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

