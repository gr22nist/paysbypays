"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";

interface FilterOption {
  label: string;
  value?: string;
  description?: string;
}

interface FilterDropdownProps {
  label: string;
  placeholder?: string;
  value?: string;
  options: FilterOption[];
  onChange: (value?: string) => void;
  allowClear?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function FilterDropdown({
  label,
  placeholder,
  value,
  options,
  onChange,
  allowClear = true,
  clearLabel,
  disabled = false,
  className,
}: FilterDropdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const defaultPlaceholder = placeholder ?? t("common:filters.placeholder");
  const defaultClearLabel = clearLabel ?? t("common:filters.allView");

  const selectedOption = options.find((option) => option.value === value);

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
      className={["flex min-w-[200px] flex-1 flex-col gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <label className="text-sm font-semibold text-[var(--text-strong)]">{label}</label>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={`micro-button flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-semibold transition-[border-color,color] ${
            disabled
              ? "cursor-not-allowed border-[var(--border-subtle)]/40 bg-[var(--surface-muted)] text-[var(--text-subtle)]"
              : "border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] hover:border-brand-primary hover:text-brand-primary"
          }`}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={selectedOption ? "text-[var(--text-strong)]" : "text-[var(--text-muted)]"}>
            {selectedOption?.label ?? defaultPlaceholder}
          </span>
          <Icon
            name="chevronDown"
            size={16}
            variant="secondary"
            className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {!disabled && open && (
          <div className="absolute left-0 top-full z-[100] mt-2 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="max-h-64 overflow-y-auto py-1">
              {allowClear && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(undefined);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)]/70"
                >
                  <span>{defaultClearLabel}</span>
                  {!value && <Icon name="check" size={14} variant="secondary" />}
                </button>
              )}
              {options.map((option) => {
                const isActive = option.value === value;
                return (
                  <button
                    key={option.value ?? "__empty"}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                      isActive
                        ? "bg-brand-primary/15 text-brand-primary"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)]/70"
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
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

