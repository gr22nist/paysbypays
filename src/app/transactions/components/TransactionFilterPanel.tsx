"use client";

import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { FilterDropdown } from "@/components/filters/FilterDropdown";

interface FilterOption {
  value: string;
  label: string;
}

interface TransactionFilterPanelProps {
  showFilters: boolean;
  statusValue?: string;
  payTypeValue?: string;
  paymentStatusOptions: FilterOption[];
  payTypeOptions: FilterOption[];
  onStatusChange: (value?: string) => void;
  onPayTypeChange: (value?: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  codesLoading?: boolean;
  panelClass: string;
}

export function TransactionFilterPanel({
  showFilters,
  statusValue,
  payTypeValue,
  paymentStatusOptions,
  payTypeOptions,
  onStatusChange,
  onPayTypeChange,
  onResetFilters,
  hasActiveFilters,
  codesLoading = false,
  panelClass,
}: TransactionFilterPanelProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`micro-card ${panelClass} ${
        showFilters
          ? "max-h-[500px] opacity-100 mb-0"
          : "max-h-0 opacity-0 mb-0"
      }`}
    >
      <div className={`px-6 py-4 ${
        showFilters 
          ? "opacity-100" 
          : "opacity-0"
      }`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <div className="w-full sm:flex-1 sm:min-w-[200px]">
            <FilterDropdown
              label={t("transactions:filters.status")}
              value={statusValue}
              onChange={onStatusChange}
              options={paymentStatusOptions}
              disabled={codesLoading}
              placeholder={t("transactions:filters.all")}
              clearLabel={t("transactions:filters.clear")}
            />
          </div>
          <div className="w-full sm:flex-1 sm:min-w-[200px]">
            <FilterDropdown
              label={t("transactions:filters.payType")}
              value={payTypeValue}
              onChange={onPayTypeChange}
              options={payTypeOptions}
              disabled={codesLoading}
              placeholder={t("transactions:filters.all")}
              clearLabel={t("transactions:filters.clear")}
            />
          </div>
          <div className="flex w-full sm:w-auto sm:min-w-[200px] items-end">
            <button
              type="button"
              disabled={!hasActiveFilters}
              onClick={onResetFilters}
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
              {t("transactions:filters.reset")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

