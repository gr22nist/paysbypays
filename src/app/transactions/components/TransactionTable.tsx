"use client";

import { useMemo, useState } from "react";
import { Pagination, SkeletonTable } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import type { Transaction } from "@/lib/api/types";
import { TransactionStatusBadge } from "@/components/badges/TransactionStatusBadge";
import { PaymentMethodBadge } from "@/components/badges/PaymentMethodBadge";
import { SortIndicator } from "@/components/tables/SortIndicator";
import { PageSizeDropdown } from "@/components/pagination/PageSizeDropdown";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { Icon } from "@hua-labs/ui";
import { exportTransactions } from "@/lib/utils/export";
import { ExportFormatSelect } from "@/components/common/ExportFormatSelect";

type SortField = "id" | "merchant" | "amount" | "status" | "paymentMethod" | "createdAt";
type SortDirection = "asc" | "desc" | null;

interface TransactionTableProps {
  transactions: Transaction[]; // 현재 페이지의 거래 목록
  allFilteredTransactions?: Transaction[]; // 필터링된 전체 거래 목록 (내보내기용)
  isLoading: boolean;
  error: Error | null;
  merchantNameMap: Map<string, string>;
  payTypeMap: Map<string, string>;
  formatCurrency: (amount: number) => string;
  formatDateTime: (dateString: string) => string;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRowClick: (tx: Transaction) => void;
  pageSize: number;
  currentPage: number;
  totalTransactions: number;
  totalPages: number;
  displayStart: number;
  displayEnd: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
  mchtCodeFilter?: string;
  panelClass: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function TransactionTable({
  transactions,
  allFilteredTransactions,
  isLoading,
  error,
  merchantNameMap,
  payTypeMap,
  formatCurrency,
  formatDateTime,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  pageSize,
  currentPage,
  totalTransactions,
  totalPages,
  displayStart,
  displayEnd,
  onPageSizeChange,
  onPageChange,
  mchtCodeFilter,
  panelClass,
  showFilters = false,
  onToggleFilters,
  hasActiveFilters = false,
}: TransactionTableProps) {
  const { t, tWithParams } = useTranslation();

  const renderSortIndicator = (field: SortField) => (
    <SortIndicator
      active={sortField === field && !!sortDirection}
      direction={sortField === field ? sortDirection : null}
    />
  );

  const normalizedPage = useMemo(() => Math.max(0, Math.min(currentPage, totalPages - 1)), [currentPage, totalPages]);

  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("excel");

  const handleExport = async () => {
    // 필터링된 전체 거래 내역 내보내기 (현재 페이지가 아닌 전체)
    const transactionsToExport = allFilteredTransactions || transactions;
    
    // 가맹점 이름 매핑 적용
    const transactionsWithMerchantNames = transactionsToExport.map((tx) => ({
      ...tx,
      merchantName: tx.merchantName || (tx.merchantId ? merchantNameMap.get(tx.merchantId) : undefined),
    }));
    
    await exportTransactions(transactionsWithMerchantNames, undefined, exportFormat, t);
  };

  return (
    <div className={`micro-card ${panelClass}`}>
      <SectionHeaderBlock
        title={t("transactions:table.title")}
        description={t("transactions:table.description")}
        containerClassName="px-6 pt-6"
        actionSlot={
          <div className="flex items-center gap-2">
            {onToggleFilters && (
              <button
                type="button"
                onClick={onToggleFilters}
                className={`micro-button inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                  hasActiveFilters
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-[var(--border-subtle)] text-[var(--text-strong)] hover:border-brand-primary hover:text-brand-primary"
                }`}
              >
                <Icon name="settings" size={16} />
                {showFilters ? t("transactions:filters.hide") : t("transactions:filters.show")}
                {hasActiveFilters && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white">
                    !
                  </span>
                )}
              </button>
            )}
            <ExportFormatSelect
              value={exportFormat}
              onChange={(value) => setExportFormat(value)}
              size="md"
            />
            <button
              type="button"
              onClick={handleExport}
              className="micro-button rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              {t("common:actions.export")}
            </button>
          </div>
        }
      />
      {isLoading ? (
        <div className="px-6 pb-6 pt-4">
          <SkeletonTable />
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="mb-2 text-red-600">
            {t("transactions:table.errorTitle")}
          </p>
          <p className="text-sm text-[var(--text-subtle)]">{error.message}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-8 text-center text-[var(--text-subtle)]">
          {mchtCodeFilter
            ? t("transactions:table.emptyMerchant")
            : t("transactions:table.empty")}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 px-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[var(--text-subtle)]">
              {totalTransactions === 0
                ? t("transactions:pagination.pageInfoEmpty")
                : tWithParams("transactions:pagination.pageInfo", {
                    start: displayStart,
                    end: displayEnd,
                    total: totalTransactions.toLocaleString(),
                  })}
            </div>
            <PageSizeDropdown
              value={pageSize}
              label={t("transactions:pagination.pageSize")}
              onChange={(size) => {
                onPageSizeChange(size);
                onPageChange(0);
              }}
              className="w-full sm:w-auto"
            />
          </div>
          <div className="overflow-x-auto px-3 pb-6 sm:px-6">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)]">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)] cursor-pointer transition-colors hover:bg-[var(--surface-muted)]/70"
                    onClick={() => onSort("id")}
                  >
                    <div className="flex items-center gap-1.5">
                      {t("transactions:table.headers.id")}
                      {renderSortIndicator("id")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)] cursor-pointer transition-colors hover:bg-[var(--surface-muted)]/70"
                    onClick={() => onSort("merchant")}
                  >
                    <div className="flex items-center gap-1.5">
                      {t("transactions:table.headers.merchant")}
                      {renderSortIndicator("merchant")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)] cursor-pointer transition-colors hover:bg-[var(--surface-muted)]/70"
                    onClick={() => onSort("amount")}
                  >
                    <div className="flex items-center gap-1.5">
                      {t("transactions:table.headers.amount")}
                      {renderSortIndicator("amount")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)] cursor-pointer transition-colors hover:bg-[var(--surface-muted)]/70"
                    onClick={() => onSort("status")}
                  >
                    <div className="flex items-center gap-1.5">
                      {t("transactions:table.headers.status")}
                      {renderSortIndicator("status")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-center text-sm font-medium text-[var(--text-muted)] cursor-pointer transition-colors hover:bg-[var(--surface-muted)]/70"
                    onClick={() => onSort("paymentMethod")}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {t("transactions:table.headers.payMethod")}
                      {renderSortIndicator("paymentMethod")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)] cursor-pointer transition-colors hover:bg-[var(--surface-muted)]/70"
                    onClick={() => onSort("createdAt")}
                  >
                    <div className="flex items-center gap-1.5">
                      {t("transactions:table.headers.createdAt")}
                      {renderSortIndicator("createdAt")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {transactions.map((tx) => {
                  const merchantName =
                    tx.merchantName ||
                    (tx.merchantId ? merchantNameMap.get(tx.merchantId) : undefined) ||
                    t("transactions:table.unknownMerchant");
                  return (
                    <tr
                      key={tx.id}
                      className="cursor-pointer transition-colors duration-100 hover:bg-[var(--surface-muted)]/60 active:bg-[var(--surface-muted)]/80"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).tagName !== "A") {
                          onRowClick(tx);
                        }
                      }}
                    >
                      <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                        <span className="font-mono text-brand-primary">{tx.id}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-strong)]">{merchantName}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                        {formatCurrency(tx.amount || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <TransactionStatusBadge status={tx.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-center">
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

          {/* 페이징 - 필터링된 거래 기준 */}
          {totalTransactions > 0 && totalPages > 1 && (
            <div className="border-t border-[var(--border-subtle)] px-4 py-4">
              <Pagination
                currentPage={normalizedPage + 1}
                totalPages={totalPages}
                onPageChange={(page) => onPageChange(page - 1)}
                showFirstLast
                showPrevNext
                variant="outlined"
                shape="square"
                className="w-full justify-center gap-2 sm:justify-end"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

