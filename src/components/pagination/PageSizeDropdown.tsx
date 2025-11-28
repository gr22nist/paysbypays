"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";

const DEFAULT_PAGE_SIZES = [10, 25, 100];

interface PageSizeDropdownProps {
  value: number;
  onChange: (size: number) => void;
  label?: string;
  options?: number[];
  className?: string;
  hintCount?: number;
}

export function PageSizeDropdown({
  value,
  onChange,
  label,
  options = DEFAULT_PAGE_SIZES,
  className,
  hintCount = 3,
}: PageSizeDropdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const defaultLabel = label ?? t("common:pagination.pageSize");
  const countLabel = t("common:units.transactions");

  const pageSizeOptions = useMemo(() => {
    if (options.includes(value)) {
      return options;
    }
    return [...options, value].sort((a, b) => a - b);
  }, [options, value]);

  const hintText = pageSizeOptions
    .slice(0, Math.max(1, hintCount))
    .map((size) => size.toLocaleString())
    .join(" · ");

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div
      className={["flex items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
        {defaultLabel}
      </span>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="micro-button flex w-24 items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-left transition hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-sm font-semibold text-[var(--text-strong)]">
            {value.toLocaleString()}{countLabel}
          </span>
          <Icon
            name="chevronDown"
            size={16}
            variant="secondary"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="absolute left-0 top-full z-10 mt-2 w-24 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl">
            <div className="max-h-60 overflow-y-auto py-1">
              {pageSizeOptions.map((size) => {
                const isActive = size === value;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      onChange(size);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-sm ${
                      isActive
                        ? "bg-brand-primary/15 text-brand-primary"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)]/70"
                    }`}
                  >
                    <span>{size.toLocaleString()}{countLabel}</span>
                    {isActive && (
                      <Icon name="check" size={14} variant="primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

