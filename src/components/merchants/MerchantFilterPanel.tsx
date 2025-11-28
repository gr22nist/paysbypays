"use client";

import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { FilterDropdown } from "@/components/filters/FilterDropdown";

interface FilterOption {
  value: string;
  label: string;
}

interface MerchantFilterPanelProps {
  searchQuery: string;
  statusValue?: string;
  hasActiveFilters: boolean;
  showFilters: boolean;
  statusOptions: FilterOption[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: string) => void;
  onReset: () => void;
}

export function MerchantFilterPanel({
  searchQuery,
  statusValue,
  hasActiveFilters,
  showFilters,
  statusOptions,
  onSearchChange,
  onStatusChange,
  onReset,
}: MerchantFilterPanelProps) {
  const { t } = useTranslation();
  
  return (
    <div
      className={`micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm transition-all duration-300 ease-in-out ${
        showFilters
          ? "max-h-[500px] opacity-100 translate-y-0 mb-0 overflow-visible"
          : "max-h-0 opacity-0 -translate-y-2 mb-0 overflow-hidden"
      }`}
    >
      <div className={`px-4 py-4 transition-all duration-300 ease-in-out ${
        showFilters 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 -translate-y-2"
      }`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <div className="w-full sm:min-w-[200px] sm:flex-1">
            <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">
              {t("merchants:filters.search")}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("merchants:filters.searchPlaceholder")}
              className="h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="w-full sm:flex-1 sm:min-w-[200px]">
            <FilterDropdown
              label={t("merchants:filters.status")}
              value={statusValue}
              onChange={onStatusChange}
              options={statusOptions}
              placeholder={t("merchants:filters.all")}
              clearLabel={t("merchants:filters.clear")}
            />
          </div>

          <div className="flex w-full sm:w-auto sm:min-w-[200px] items-end">
            <button
              type="button"
              disabled={!hasActiveFilters}
              onClick={onReset}
              className={`micro-button inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                hasActiveFilters
                  ? "border-[var(--border-subtle)] text-[var(--text-strong)] hover:border-brand-primary hover:text-brand-primary"
                  : "cursor-not-allowed border-[var(--border-subtle)]/40 text-[var(--text-subtle)]"
              }`}
            >
              <Icon
                name="rotateCcw"
                size={16}
                variant={hasActiveFilters ? "secondary" : "muted"}
              />
              {t("merchants:filters.reset")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

