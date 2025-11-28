"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import type { DatePreset } from "@/types/date-preset";
import { useTransactions } from "@/hooks/useTransactions";
import { useMerchants } from "@/hooks/useMerchants";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { getPayTypeTranslationKey } from "@/data/pay-types";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useFilterStore } from "@/store/filter-store";
import { TransactionDetailDrawer } from "@/components/transactions/TransactionDetailDrawer";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { useTransactionTable } from "@/hooks/useTransactionTable";
import { useTransactionDrawer } from "@/hooks/useTransactionDrawer";
import { TransactionStatsPanel } from "./components/TransactionStatsPanel";
import { TransactionFilterPanel } from "./components/TransactionFilterPanel";
import { TransactionTable } from "./components/TransactionTable";

const datePresets: DatePreset[] = [
  { label: "common:dateRanges.today", value: "today" },
  { label: "common:dateRanges.7d", value: "7d" },
  { label: "common:dateRanges.month", value: "month" },
  { label: "common:dateRanges.prevMonth", value: "prev-month" },
  { label: "common:dateRanges.all", value: "all" },
];

const PANEL_CLASS =
  "rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm";

function getPresetRanges(): Record<string, { from: Date; to: Date }> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  return {
    today: { from: today, to: now },
    "7d": { from: sevenDaysAgo, to: now },
    month: {
      from: currentMonthStart,
      to: now,
    },
    "prev-month": {
      from: prevMonthStart,
      to: prevMonthEnd,
    },
    all: {
      from: new Date("2020-01-01T00:00:00Z"),
      to: now,
    },
  };
}

export default function TransactionsPage() {
  const { t } = useTranslation();
  const {
    selectedDatePreset,
    transactionStatus,
    transactionPayType,
    setTransactionStatus,
    setTransactionPayType,
    resetTransactionFilters,
  } = useFilterStore();
  const selectedPreset = selectedDatePreset || datePresets[2]; // 이번 달
  const [showFilters, setShowFilters] = useState(true);
  const { formatCurrency, formatDateTime } = useDisplayFormat();
  
  const { selectedTransaction, drawerOpen, openDrawer, setDrawerOpen } = useTransactionDrawer();
  
  const [mchtCodeFilter, setMchtCodeFilter] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    return params.get("mchtCode") || undefined;
  });
  
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const mchtCode = params.get("mchtCode") || undefined;
      setMchtCodeFilter(mchtCode);
    };
    
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const { paymentStatuses, payTypes, isLoading: codesLoading } = useCommonCodes();

  const paymentStatusOptions = useMemo(
    () =>
      paymentStatuses.map((status) => {
        const statusKey = status.code.toUpperCase();
        const translationKey = `transactions:statuses.${statusKey}`;
        const translatedLabel = t(translationKey);
        // 번역 키가 없으면 (MISSING으로 표시되거나 키 자체가 반환되면) 원본 description 사용
        const isMissing = translatedLabel.includes("[MISSING:") || translatedLabel === translationKey;
        return {
          value: status.code,
          label: isMissing ? status.description : translatedLabel,
        };
      }),
    [paymentStatuses, t]
  );

  const payTypeOptions = useMemo(
    () =>
      payTypes.map((type) => {
        // getPayTypeTranslationKey를 사용하여 VACT, BILLING 등의 매핑도 처리
        const translationKey = getPayTypeTranslationKey(type.type);
        if (translationKey) {
          const translatedLabel = t(translationKey);
          const isMissing = translatedLabel.includes("[MISSING:") || translatedLabel === translationKey;
          return {
            value: type.type,
            label: isMissing ? type.description : translatedLabel,
          };
        }
        // 번역 키가 없으면 원본 description 사용
        return {
          value: type.type,
          label: type.description,
        };
      }),
    [payTypes, t]
  );

  const hasActiveFilters = useMemo(
    () => Boolean(transactionStatus || transactionPayType),
    [transactionStatus, transactionPayType]
  );

  const payTypeMap = useMemo(() => {
    const map = new Map<string, string>();

    payTypes.forEach((pt) => {
      const upperType = pt.type.toUpperCase();
      const translationKey = getPayTypeTranslationKey(pt.type);
      if (!translationKey && pt.description) {
        map.set(upperType, pt.description);
      }
    });

    return map;
  }, [payTypes]);

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

  const presetRanges = useMemo(() => getPresetRanges(), []);
  const dateRange = useMemo(() => presetRanges[selectedPreset.value], [presetRanges, selectedPreset]);
  const fromDate = dateRange.from.toISOString().split("T")[0];
  const toDate = dateRange.to.toISOString().split("T")[0];

  const { data: transactionsData, isLoading, error } = useTransactions({
    page: 0,
    size: 1000,
    from: selectedPreset.value === "all" ? undefined : fromDate,
    to: selectedPreset.value === "all" ? undefined : toDate,
    status: transactionStatus,
    mchtCode: mchtCodeFilter,
    // payType 필터는 API 파라미터 확인 필요, 일단 클라이언트 필터링
  });

  // 디버깅: 실제 거래 데이터의 결제수단 코드 확인
  useEffect(() => {
    if (transactionsData?.content && transactionsData.content.length > 0) {
      const payTypeSet = new Set<string>();
      transactionsData.content.forEach(tx => {
        const payType = tx.paymentMethod || tx.payType;
        if (payType) {
          payTypeSet.add(payType);
        }
      });
      console.log("📊 실제 거래 데이터의 결제수단 코드 목록:", Array.from(payTypeSet).sort());
      
      const virtualAndSub = Array.from(payTypeSet).filter(pt => 
        pt.toUpperCase().includes("VIRTUAL") || 
        pt.toUpperCase().includes("SUBSCRIPTION") || 
        pt.toUpperCase().includes("VACT") || 
        pt.toUpperCase().includes("SUB") ||
        pt === "가상계좌" || 
        pt === "정기결제"
      );
      if (virtualAndSub.length > 0) {
        console.log("🎯 가상계좌/정기결제 관련 코드:", virtualAndSub);
      }
    }
  }, [transactionsData]);

  const overallStats = useMemo(() => {
    const txs = transactionsData?.content || [];
    const totalAmount = txs.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    const approvedCount = txs.filter((tx) => {
      const status = (tx.status || "").toLowerCase();
      return status === "success" || status === "approved";
    }).length;
    const failedCount = txs.filter((tx) => {
      const status = (tx.status || "").toLowerCase();
      return status === "failed" || status.includes("fail");
    }).length;
    const approvalRate = txs.length > 0 ? (approvedCount / txs.length) * 100 : 0;

    return {
      totalAmount,
      totalCount: txs.length,
      approvedCount,
      failedCount,
      approvalRate,
    };
  }, [transactionsData?.content]);

  const {
    sortField,
    sortDirection,
    handleSort,
    pageSize,
    setCurrentPage,
    setPageSize,
    filteredTransactions,
    paginatedTransactions,
    totalTransactions,
    totalPages,
    displayStart,
    displayEnd,
    normalizedPage,
  } = useTransactionTable({
    transactions: transactionsData?.content || [],
    merchantNameMap,
    mchtCodeFilter,
    transactionPayType,
    transactionStatus,
    initialPageSize: 25,
  });

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [mchtCodeFilter, transactionPayType, transactionStatus, setCurrentPage]);

  const pageTitle = mchtCodeFilter
    ? t("transactions:page.merchantTitle")
    : t("transactions:page.title");
  const pageDescription = mchtCodeFilter
    ? t("transactions:page.merchantDescription")
    : t("transactions:page.description");

  const headerAction = mchtCodeFilter ? (
    <Link
      href="/transactions"
      className="micro-button inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-brand-primary"
    >
      {t("transactions:page.viewAll")}
      <Icon name="arrowRight" size={16} />
    </Link>
  ) : undefined;

  const handleStatusFilterChange = (value?: string) => {
    setTransactionStatus(value);
    setCurrentPage(0);
  };

  const handlePayTypeFilterChange = (value?: string) => {
    setTransactionPayType(value);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    resetTransactionFilters();
    setCurrentPage(0);
  };

  const handleToggleFilters = () => setShowFilters((prev) => !prev);

  const selectedPresetLabel = t(selectedPreset.label);

  return (
    <DashboardLayout
      title={pageTitle}
      description={pageDescription}
      activeItem="transactions"
      actions={headerAction}
    >
      <div className="flex flex-col gap-6">
        <TransactionStatsPanel
          panelClass={PANEL_CLASS}
          stats={overallStats}
          presetLabel={selectedPresetLabel}
          formatCurrency={formatCurrency}
          loading={isLoading}
        />

        {/* 필터 패널 - 테이블 위에 배치 */}
        <TransactionFilterPanel
          panelClass={PANEL_CLASS}
          showFilters={showFilters}
          statusValue={transactionStatus}
          payTypeValue={transactionPayType}
          paymentStatusOptions={paymentStatusOptions}
          payTypeOptions={payTypeOptions}
          onStatusChange={handleStatusFilterChange}
          onPayTypeChange={handlePayTypeFilterChange}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          codesLoading={codesLoading}
        />

        <TransactionTable
          transactions={paginatedTransactions}
          allFilteredTransactions={filteredTransactions}
          isLoading={isLoading}
          error={error}
          merchantNameMap={merchantNameMap}
          payTypeMap={payTypeMap}
          formatCurrency={formatCurrency}
          formatDateTime={formatDateTime}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={openDrawer}
          pageSize={pageSize}
          currentPage={normalizedPage}
          totalTransactions={totalTransactions}
          totalPages={totalPages}
          displayStart={displayStart}
          displayEnd={displayEnd}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(0);
          }}
          onPageChange={setCurrentPage}
          mchtCodeFilter={mchtCodeFilter}
          panelClass={PANEL_CLASS}
          showFilters={showFilters}
          onToggleFilters={handleToggleFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
      <TransactionDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        transaction={selectedTransaction}
      />
    </DashboardLayout>
  );
}

