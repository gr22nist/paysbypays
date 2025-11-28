"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@hua-labs/i18n-core";
import { useSettlements } from "@/hooks/useSettlements";
import { useMerchants } from "@/hooks/useMerchants";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { SettlementStatsPanel } from "@/components/settlements/SettlementStatsPanel";
import { SettlementTimelineChart } from "@/components/settlements/SettlementTimelineChart";
import { QuickActionCard } from "@/components/settlements/QuickActionCard";
import { SettlementRecordsTable } from "@/components/settlements/SettlementRecordsTable";

const PANEL_CLASS =
  "rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm";

export default function SettlementsPage() {
  const { t, tWithParams } = useTranslation();
  const { data, isLoading } = useSettlements();
  
  const { data: merchantsData } = useMerchants({ size: 1000 });

  const merchantNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (merchantsData?.content) {
      merchantsData.content.forEach((merchant) => {
        map.set(merchant.mchtCode, merchant.mchtName);
      });
    }
    return map;
  }, [merchantsData]);
  
  const settlements = useMemo(() => data?.records ?? [], [data?.records]);
  const summary = data?.summary ?? {
    totalGross: 0,
    totalNet: 0,
    scheduledCount: 0,
    completedCount: 0,
    delayedCount: 0,
  };
  const timeline = data?.timeline ?? { categories: [], series: [] };
  
  const enrichedRecords = useMemo(
    () =>
      settlements.map((record) => ({
        ...record,
        merchantName:
          record.merchantName ||
          merchantNameMap.get(record.merchantCode) ||
          tWithParams("settlements:merchant.fallback", { code: record.merchantCode.slice(-4) }),
      })),
    [settlements, merchantNameMap, tWithParams]
  );

  const { formatCurrency: formatUserCurrency } = useDisplayFormat();

  const formatSummaryAmount = useCallback(
    (amount: number) => formatUserCurrency(amount, { notation: "compact" }),
    [formatUserCurrency]
  );

  const formatFullAmount = useCallback(
    (amount: number) => formatUserCurrency(amount),
    [formatUserCurrency]
  );

  const formatAxisAmount = useCallback(
    (value: number) => formatUserCurrency(value, { notation: "compact" }),
    [formatUserCurrency]
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const totalRecords = enrichedRecords.length;
  const totalPages = Math.max(1, Math.ceil(Math.max(totalRecords, 1) / pageSize));
  const effectivePage = Math.min(currentPage, totalPages - 1);
  const startIndex = Math.max(0, effectivePage * pageSize);
const displayStart = totalRecords === 0 ? 0 : startIndex + 1;
const displayEnd = totalRecords === 0 ? 0 : Math.min(startIndex + pageSize, totalRecords);
const paginatedRecords = useMemo(
  () => enrichedRecords.slice(startIndex, startIndex + pageSize),
  [enrichedRecords, startIndex, pageSize]
);

  return (
    <DashboardLayout
      title={t("layout:pages.settlements.title")}
      description={t("layout:pages.settlements.description")}
      activeItem="settlements"
    >
      <div className="flex flex-col gap-6">
        <SettlementStatsPanel
          summary={summary}
          loading={isLoading}
          formatSummaryAmount={formatSummaryAmount}
          panelClass={PANEL_CLASS}
        />

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SettlementTimelineChart
            categories={timeline.categories}
            series={timeline.series}
            formatAxisAmount={formatAxisAmount}
            formatFullAmount={formatFullAmount}
            panelClass={PANEL_CLASS}
          />
          <div className={`micro-card ${PANEL_CLASS}`}>
            <SectionHeaderBlock
              title={t("settlements:page.quickActions.title")}
              description={t("settlements:page.quickActions.description")}
              containerClassName="px-0 pt-0"
            />
            <div className="space-y-3 px-6 pb-6 pt-4">
              <QuickActionCard
                href="/merchants"
                title={t("settlements:page.quickActions.merchantSettlements.title")}
                description={t("settlements:page.quickActions.merchantSettlements.description")}
              />
              <QuickActionCard
                href="/transactions"
                title={t("settlements:page.quickActions.reviewTransactions.title")}
                description={t("settlements:page.quickActions.reviewTransactions.description")}
              />
              <QuickActionCard
                href="/system-health"
                title={t("settlements:page.quickActions.monitorSystem.title")}
                description={t("settlements:page.quickActions.monitorSystem.description")}
              />
            </div>
          </div>
        </section>

        <SettlementRecordsTable
          records={paginatedRecords}
          allRecords={enrichedRecords as Array<{
            id: string;
            merchantCode: string;
            merchantName: string;
            grossAmount: number;
            feeAmount: number;
            netAmount: number;
            scheduledDate: string;
            payoutDate?: string;
            status: "scheduled" | "processing" | "completed" | "delayed";
          }>}
          loading={isLoading}
          totalRecords={totalRecords}
          currentPage={effectivePage}
          pageSize={pageSize}
          totalPages={totalPages}
          displayStart={displayStart}
          displayEnd={displayEnd}
          formatFullAmount={formatFullAmount}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          panelClass={PANEL_CLASS}
        />
      </div>
    </DashboardLayout>
  );
}

