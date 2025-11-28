"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, Pagination, SkeletonTable } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { PageSizeDropdown } from "@/components/pagination/PageSizeDropdown";
import { SortIndicator } from "@/components/tables/SortIndicator";
import { getMerchantStatusMeta } from "@/data/merchant-status";
import { exportMerchants } from "@/lib/utils/export";
import { MerchantDetailDrawer } from "@/components/merchants/MerchantDetailDrawer";
import type { MerchantListRes } from "@/lib/api/types";
import { ExportFormatSelect } from "@/components/common/ExportFormatSelect";

type MerchantSortField = "mchtCode" | "mchtName" | "status" | "bizType";
type MerchantSortDirection = "asc" | "desc" | null;

interface MerchantTableProps {
  merchants: MerchantListRes[];
  loading: boolean;
  error: Error | null;
  totalFiltered: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  displayStart: number;
  displayEnd: number;
  sortField: MerchantSortField | null;
  sortDirection: MerchantSortDirection;
  showFilters: boolean;
  hasActiveFilters?: boolean;
  onSort: (field: MerchantSortField) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onToggleFilters: () => void;
  panelClass: string;
}

export function MerchantTable({
  merchants,
  loading,
  error,
  totalFiltered,
  currentPage,
  pageSize,
  totalPages,
  displayStart,
  displayEnd,
  sortField,
  sortDirection,
  showFilters,
  hasActiveFilters = false,
  onSort,
  onPageChange,
  onPageSizeChange,
  onToggleFilters,
  panelClass,
}: MerchantTableProps) {
  const { t, tWithParams } = useTranslation();
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("excel");
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantListRes | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const renderSortIndicator = (field: MerchantSortField) => (
    <SortIndicator
      active={sortField === field && !!sortDirection}
      direction={sortField === field ? sortDirection : null}
    />
  );

  const handleExport = async () => {
    const allMerchants = merchants.map((m) => ({
      mchtCode: m.mchtCode,
      mchtName: m.mchtName,
      status: m.status,
      bizType: m.bizType,
    }));
    await exportMerchants(allMerchants, undefined, exportFormat, t);
  };

  return (
    <div className={`micro-card ${panelClass}`}>
      <SectionHeaderBlock
        title={t("merchants:table.title")}
        description={t("merchants:table.description")}
        actionSlot={
          <div className="flex items-center gap-2">
            <Link
              href="/merchants/new"
              className="micro-button inline-flex items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark transition-colors"
            >
              <Icon name="add" size={16} />
              {t("merchants:table.register")}
            </Link>
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
              {showFilters ? t("merchants:table.hideFilters") : t("merchants:table.showFilters")}
              {hasActiveFilters && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white">
                  !
                </span>
              )}
            </button>
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
              {t("merchants:table.export")}
            </button>
          </div>
        }
      />
      {loading ? (
        <div className="px-6 pb-6 pt-4">
          <SkeletonTable />
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="mb-2 text-red-600">{t("merchants:table.error")}</p>
          <p className="text-sm text-[var(--text-subtle)]">{error.message}</p>
        </div>
      ) : totalFiltered === 0 ? (
        <div className="p-8 text-center text-[var(--text-subtle)]">{t("merchants:table.empty")}</div>
      ) : (
        <>
          <div className="flex flex-col gap-2 px-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[var(--text-subtle)]">
              {totalFiltered === 0 
                ? t("merchants:table.pagination.pageInfoEmpty")
                : tWithParams("merchants:table.pagination.pageInfo", {
                    total: totalFiltered.toLocaleString(),
                    start: displayStart,
                    end: displayEnd,
                  })
              }
            </div>
            <PageSizeDropdown
              value={pageSize}
              onChange={(size) => {
                onPageSizeChange(size);
                onPageChange(0);
              }}
              className="w-full sm:w-auto"
            />
          </div>

          <div className="overflow-x-auto px-6 pb-6">
            <table className="w-full">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)]">
                <tr>
                  <th
                    className="select-none px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)]/70"
                    onClick={() => onSort("mchtCode")}
                  >
                    <div className="flex items-center gap-1.5">
                      {t("merchants:table.headers.mchtCode")}
                      {renderSortIndicator("mchtCode")}
                    </div>
                  </th>
                  <th
                    className="select-none px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)]/70"
                    onClick={() => onSort("mchtName")}
                  >
                    <div className="flex items-center gap-1.5">
                      {t("merchants:table.headers.mchtName")}
                      {renderSortIndicator("mchtName")}
                    </div>
                  </th>
                  <th
                    className="select-none px-4 py-3 text-center text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)]/70"
                    onClick={() => onSort("status")}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {t("merchants:table.headers.status")}
                      {renderSortIndicator("status")}
                    </div>
                  </th>
                  <th
                    className="select-none px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)]/70"
                    onClick={() => onSort("bizType")}
                  >
                    <div className="flex items-center gap-1.5">
                      {t("merchants:table.headers.bizType")}
                      {renderSortIndicator("bizType")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {merchants.map((merchant) => {
                  const statusMeta = getMerchantStatusMeta(merchant.status);
                  return (
                    <tr
                      key={merchant.mchtCode}
                      className="micro-link cursor-pointer hover:bg-[var(--surface-muted)]/50"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("a")) {
                          return;
                        }
                        setSelectedMerchant(merchant);
                        setDrawerOpen(true);
                      }}
                    >
                      <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                        <Link
                          href={`/merchants/${merchant.mchtCode}`}
                          className="text-[var(--text-strong)] hover:text-brand-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {merchant.mchtCode}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                        <Link
                          href={`/merchants/${merchant.mchtCode}`}
                          className="text-[var(--text-strong)] hover:text-brand-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {merchant.mchtName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                        >
                          {t(statusMeta.labelKey)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                        {merchant.bizType}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalFiltered > 0 && totalPages > 1 && (
            <div className="border-t border-[var(--border-subtle)] px-4 py-4">
              <Pagination
                currentPage={currentPage + 1}
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

      {/* 가맹점 상세 Drawer */}
      <MerchantDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        merchant={selectedMerchant}
      />
    </div>
  );
}

