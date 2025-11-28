"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Pagination } from "@hua-labs/ui";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { getPayTypeTranslationKey } from "@/data/pay-types";
import { TransactionStatusBadge } from "@/components/badges/TransactionStatusBadge";
import { PaymentMethodBadge } from "@/components/badges/PaymentMethodBadge";
import type { Transaction } from "@/lib/api/types";
import { useTranslation } from "@hua-labs/i18n-core";

interface TransactionListItem {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  status: "approved" | "pending" | "failed";
  method: string;
  date: string;
}

interface MerchantTransactionsTableProps {
  transactions: TransactionListItem[];
  mchtCode: string;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onTransactionClick: (transaction: Transaction) => void;
}

export function MerchantTransactionsTable({
  transactions,
  mchtCode,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onTransactionClick,
}: MerchantTransactionsTableProps) {
  const { formatCurrency, formatDateTime } = useDisplayFormat();
  const { t } = useTranslation();
  const { payTypes } = useCommonCodes();

  // 결제수단 매핑 (번역 키가 없을 때만 API description 사용)
  const payTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    payTypes.forEach((pt) => {
      const upperType = pt.type.toUpperCase();
      // 번역 키가 없을 때만 API description 사용
      const translationKey = getPayTypeTranslationKey(pt.type);
      if (!translationKey && pt.description) {
        map.set(upperType, pt.description);
      }
    });
    return map;
  }, [payTypes]);

  return (
    <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] flex flex-col">
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-subtle)]">
        <h3 className="text-lg font-semibold text-[var(--text-strong)]">{t("merchants:transactions.title")}</h3>
        <Link
          href={`/transactions?mchtCode=${mchtCode}`}
          className="text-sm text-brand-primary hover:text-brand-primary-dark"
        >
          {t("merchants:transactions.viewAll")}
        </Link>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-8">
          {t("merchants:transactions.loading")}
        </div>
      ) : transactions.length > 0 ? (
        <>
          {/* 거래 테이블 - 고정 높이 + 스크롤 */}
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "600px" }}>
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-muted)] sm:px-4">
                    {t("merchants:transactions.headers.id")}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-muted)] sm:px-4">
                    {t("merchants:transactions.headers.amount")}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-muted)] sm:px-4">
                    {t("merchants:transactions.headers.status")}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-muted)] sm:px-4">
                    {t("merchants:transactions.headers.payMethod")}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-muted)] sm:px-4">
                    {t("merchants:transactions.headers.createdAt")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx) => {
                  // Transaction 타입으로 변환
                  const transaction: Transaction = {
                    id: tx.id,
                    merchantId: mchtCode,
                    merchantName: tx.merchant,
                    amount: tx.amount,
                    currency: tx.currency,
                    status: tx.status === "approved" ? "success" : tx.status === "failed" ? "failed" : "pending",
                    paymentMethod: tx.method,
                    createdAt: tx.date,
                  };

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onTransactionClick(transaction)}
                    >
                      <td className="px-3 py-3 text-sm text-[var(--text-strong)] sm:px-4">
                        <span className="font-mono text-brand-primary">
                          {tx.id}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--text-strong)] sm:px-4">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <TransactionStatusBadge status={tx.status} size="sm" />
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <PaymentMethodBadge 
                          method={tx.method} 
                          fallbackLabel={payTypeMap.get((tx.method || "").toUpperCase())}
                          size="sm" 
                        />
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--text-muted)] sm:px-4">
                        {formatDateTime(tx.date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-muted)]/40 px-4 py-4">
              <Pagination
                currentPage={currentPage + 1}
                totalPages={totalPages}
                onPageChange={(page) => onPageChange(page - 1)}
                showFirstLast
                showPrevNext
                variant="outlined"
                shape="square"
                className="w-full justify-center gap-2"
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          {t("merchants:transactions.empty")}
        </div>
      )}
    </div>
  );
}

