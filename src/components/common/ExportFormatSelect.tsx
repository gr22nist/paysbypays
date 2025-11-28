"use client";

import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";

interface ExportFormatSelectProps {
  value: "csv" | "excel";
  onChange: (value: "csv" | "excel") => void;
  size?: "sm" | "md";
  className?: string;
}

export function ExportFormatSelect({
  value,
  onChange,
  size = "md",
  className,
}: ExportFormatSelectProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: "px-2.5 py-1 pr-7 text-xs",
    md: "px-3 py-2 pr-8 text-sm",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
  };

  const iconRightPositions = {
    sm: "right-2.5",
    md: "right-3",
  };

  return (
    <div className={`relative ${className || ""}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as "csv" | "excel")}
        className={`export-format-select micro-input appearance-none rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] ${sizeClasses[size]} font-medium text-[var(--text-strong)] transition-colors hover:border-brand-primary/50 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20`}
      >
        <option value="excel">{t("common:actions.excel")}</option>
        <option value="csv">{t("common:actions.csv")}</option>
      </select>
      <div
        className={`absolute ${iconRightPositions[size]} top-[52%] transform -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500`}
      >
        <Icon name="chevronDown" size={iconSizes[size]} />
      </div>
    </div>
  );
}

