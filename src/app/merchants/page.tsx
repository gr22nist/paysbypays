"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@hua-labs/i18n-core";
import { useMerchants } from "@/hooks/useMerchants";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useFilterStore } from "@/store/filter-store";
import { MerchantStatsPanel } from "@/components/merchants/MerchantStatsPanel";
import { MerchantFilterPanel } from "@/components/merchants/MerchantFilterPanel";
import { MerchantTable } from "@/components/merchants/MerchantTable";
import { getMerchantStatusMeta } from "@/data/merchant-status";

type MerchantSortField = "mchtCode" | "mchtName" | "status" | "bizType";
type MerchantSortDirection = "asc" | "desc" | null;

export default function MerchantsPage() {
  const { t } = useTranslation();
  const { merchantSearchQuery, merchantStatus, setMerchantSearchQuery, setMerchantStatus, resetMerchantFilters } =
    useFilterStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<MerchantSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<MerchantSortDirection>(null);

  const { data: merchantsData, isLoading, error } = useMerchants({
    page: currentPage,
    size: pageSize,
    search: merchantSearchQuery || undefined,
  });

  const hasActiveFilters = useMemo(
    () => Boolean((merchantSearchQuery || "").trim()) || Boolean(merchantStatus),
    [merchantSearchQuery, merchantStatus]
  );

  const stats = useMemo(() => {
    const merchants = merchantsData?.content || [];
    const normalize = (status?: string) => (status || "").toUpperCase();

    const activeCount = merchants.filter((m) => normalize(m.status) === "ACTIVE").length;
    const readyCount = merchants.filter((m) => normalize(m.status) === "READY").length;
    const suspendedCount = merchants.filter((m) => normalize(m.status) === "SUSPENDED").length;
    const inactiveCount = merchants.filter((m) => normalize(m.status) === "INACTIVE").length;
    const closedCount = merchants.filter((m) => normalize(m.status) === "CLOSED").length;

    return {
      totalCount: merchants.length,
      activeCount,
      readyCount,
      closedCount,
      suspendedCount,
      inactiveCount,
    };
  }, [merchantsData]);

  const filteredMerchants = useMemo(() => {
    let merchants = merchantsData?.content || [];

    if (merchantSearchQuery && merchantSearchQuery.trim()) {
      const searchLower = merchantSearchQuery.trim().toLowerCase();
      merchants = merchants.filter((m) => {
        const codeMatch = (m.mchtCode || "").toLowerCase().includes(searchLower);
        const nameMatch = (m.mchtName || "").toLowerCase().includes(searchLower);
        return codeMatch || nameMatch;
      });
    }

    if (merchantStatus) {
      const normalize = (status?: string) => (status || "").toUpperCase();
      merchants = merchants.filter((m) => normalize(m.status) === merchantStatus.toUpperCase());
    }

    if (sortField && sortDirection) {
      merchants = [...merchants].sort((a, b) => {
        let aValue: string = "";
        let bValue: string = "";

        switch (sortField) {
          case "mchtCode":
            aValue = a.mchtCode || "";
            bValue = b.mchtCode || "";
            break;
          case "mchtName":
            aValue = a.mchtName || "";
            bValue = b.mchtName || "";
            break;
          case "status":
            aValue = a.status || "";
            bValue = b.status || "";
            break;
          case "bizType":
            aValue = a.bizType || "";
            bValue = b.bizType || "";
            break;
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return merchants;
  }, [merchantsData, merchantSearchQuery, merchantStatus, sortField, sortDirection]);

  const handleSort = (field: MerchantSortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(0); // 정렬 변경 시 첫 페이지로
  };

  const totalFiltered = filteredMerchants.length;
  const totalPages = Math.max(1, Math.ceil(Math.max(totalFiltered, 1) / pageSize));
  const normalizedPage = Math.min(currentPage, totalPages - 1);
  const pageStart = totalFiltered === 0 ? 0 : normalizedPage * pageSize;
  const pageEnd = totalFiltered === 0 ? 0 : Math.min(pageStart + pageSize, totalFiltered);
  const displayStart = totalFiltered === 0 ? 0 : pageStart + 1;
  const displayEnd = totalFiltered === 0 ? 0 : pageEnd;

  useEffect(() => {
    if (currentPage === normalizedPage) return;
    const frame = requestAnimationFrame(() => setCurrentPage(normalizedPage));
    return () => cancelAnimationFrame(frame);
  }, [currentPage, normalizedPage]);

  const paginatedMerchants = useMemo(() => {
    return filteredMerchants.slice(pageStart, pageEnd);
  }, [filteredMerchants, pageStart, pageEnd]);

  const statusOptions = useMemo(() => {
    const statuses = ["ACTIVE", "READY", "SUSPENDED", "INACTIVE", "CLOSED"] as const;
    return statuses.map((status) => {
      const meta = getMerchantStatusMeta(status);
      return {
        value: status,
        label: t(meta.labelKey),
      };
    });
  }, [t]);

  return (
    <DashboardLayout
      title={t("layout:pages.merchants.title")}
      description={t("layout:pages.merchants.description")}
      activeItem="merchants"
    >
      <div className="flex flex-col gap-6">
        <MerchantStatsPanel 
          stats={stats} 
          loading={isLoading} 
          panelClass="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm"
        />

        <MerchantFilterPanel
          searchQuery={merchantSearchQuery}
          statusValue={merchantStatus}
          hasActiveFilters={hasActiveFilters}
          showFilters={showFilters}
          statusOptions={statusOptions}
          onSearchChange={(value) => {
            setMerchantSearchQuery(value);
            setCurrentPage(0);
          }}
          onStatusChange={(value) => {
            setMerchantStatus(value);
            setCurrentPage(0);
          }}
          onReset={() => {
            resetMerchantFilters();
            setCurrentPage(0);
          }}
        />

        <MerchantTable
          merchants={paginatedMerchants}
          loading={isLoading}
          error={error}
          totalFiltered={totalFiltered}
          currentPage={normalizedPage}
          pageSize={pageSize}
          totalPages={totalPages}
          displayStart={displayStart}
          displayEnd={displayEnd}
          sortField={sortField}
          sortDirection={sortDirection}
          showFilters={showFilters}
          hasActiveFilters={hasActiveFilters}
          onSort={handleSort}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          onToggleFilters={() => setShowFilters((prev) => !prev)}
          panelClass="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm"
        />
      </div>
    </DashboardLayout>
  );
}

