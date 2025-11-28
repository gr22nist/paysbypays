"use client";

import { useState } from "react";
import { Icon, Pagination, SkeletonTable } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { PageSizeDropdown } from "@/components/pagination/PageSizeDropdown";
import { exportSettlements } from "@/lib/utils/export";
import { ExportFormatSelect } from "@/components/common/ExportFormatSelect";

interface SettlementRecord {
  id: string;
  merchantCode: string;
  merchantName: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  scheduledDate: string;
  payoutDate?: string;
  status: "scheduled" | "processing" | "completed" | "delayed";
}

interface SettlementRecordsTableProps {
  records: SettlementRecord[];
  allRecords?: SettlementRecord[];
  loading: boolean;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  displayStart: number;
  displayEnd: number;
  formatFullAmount: (amount: number) => string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  panelClass: string;
}

// statusMeta는 컴포넌트 내부에서 t()를 사용하여 동적으로 생성

export function SettlementRecordsTable({
  records,
  allRecords,
  loading,
  totalRecords,
  currentPage,
  pageSize,
  totalPages,
  displayStart,
  displayEnd,
  formatFullAmount,
  onPageChange,
  onPageSizeChange,
  panelClass,
}: SettlementRecordsTableProps) {
  const { t, tWithParams } = useTranslation();
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("excel");

  const statusMeta = {
    scheduled: { 
      label: t("settlements:statuses.scheduled"), 
      className: "bg-orange-100 text-orange-800" 
    },
    processing: { 
      label: t("settlements:statuses.processing"), 
      className: "bg-blue-100 text-blue-800" 
    },
    completed: { 
      label: t("settlements:statuses.completed"), 
      className: "bg-emerald-100 text-emerald-800" 
    },
    delayed: { 
      label: t("settlements:statuses.delayed"), 
      className: "bg-red-100 text-red-800" 
    },
  } as const;

  const handleExport = async () => {
    const recordsToExport = allRecords || records;
    
    // 상태를 번역된 텍스트로 변환
    const statusMap: Record<string, string> = {
      scheduled: t("settlements:statuses.scheduled"),
      processing: t("settlements:statuses.processing"),
      completed: t("settlements:statuses.completed"),
      delayed: t("settlements:statuses.delayed"),
    };
    
    const settlementsWithStatus = recordsToExport.map((r) => ({
      ...r,
      status: statusMap[r.status] || r.status,
    }));
    
    await exportSettlements(settlementsWithStatus, undefined, exportFormat, t);
  };

  return (
    <div className={`micro-card ${panelClass}`}>
      <SectionHeaderBlock
        title={t("settlements:table.title")}
        description={t("settlements:table.description")}
        containerClassName="px-0 pt-0"
        actionSlot={
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-subtle)]">
              {tWithParams("settlements:table.totalRecords", { total: totalRecords.toLocaleString() })}
            </span>
            <ExportFormatSelect
              value={exportFormat}
              onChange={(value) => setExportFormat(value)}
              size="sm"
            />
            <button
              type="button"
              onClick={handleExport}
              className="micro-button rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-strong)] transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              {t("common:actions.export")}
            </button>
          </div>
        }
      />
      <div className="px-3 pb-6 pt-4 sm:px-6">
        {loading ? (
          <div className="py-4">
            <SkeletonTable />
          </div>
        ) : totalRecords === 0 ? (
          <div className="py-8 text-center text-[var(--text-subtle)]">{t("settlements:table.empty")}</div>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[var(--text-subtle)]">
                {totalRecords === 0 
                  ? t("settlements:table.pagination.zeroDisplay")
                  : tWithParams("settlements:table.pagination.pageInfo", {
                      total: totalRecords.toLocaleString(),
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
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">{t("settlements:table.headers.merchant")}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t("settlements:table.headers.grossAmount")}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t("settlements:table.headers.feeAmount")}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t("settlements:table.headers.netAmount")}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("settlements:table.headers.scheduledDate")}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("settlements:table.headers.status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-[var(--surface-muted)]/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--text-strong)]">{record.merchantName}</p>
                        <p className="text-xs text-[var(--text-subtle)]">{record.merchantCode}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-strong)]">
                        {formatFullAmount(record.grossAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-muted)]">
                        {formatFullAmount(record.feeAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-primary">
                        {formatFullAmount(record.netAmount)}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">
                        {record.scheduledDate}
                        {record.payoutDate && (
                          <span className="block text-xs text-[var(--text-subtle)]">
                            {t("settlements:table.payoutDateLabel")} {record.payoutDate}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta[record.status].className}`}
                        >
                          {statusMeta[record.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {totalRecords > 0 && (
        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[var(--text-subtle)]">
            {tWithParams("settlements:table.pagination.pageInfo", {
              total: totalRecords.toLocaleString(),
              start: displayStart,
              end: displayEnd,
            })}
          </div>
          {totalRecords > 0 && totalPages > 1 && (
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
          )}
        </div>
      )}
    </div>
  );
}

