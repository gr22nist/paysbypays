"use client";

import type { ChangeEventHandler } from "react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";

interface SettingsSelectProps {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: Array<{ value: string; label: string }>;
}

export function SettingsSelect({
  label,
  value,
  onChange,
  options,
}: SettingsSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

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

  // 드롭다운 위치 계산 (위로 열릴지 아래로 열릴지)
  useEffect(() => {
    if (!open || !containerRef.current || !dropdownRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - containerRect.bottom;
    const spaceAbove = containerRect.top;
    
    // 아래 공간이 부족하고 위 공간이 더 많으면 위로 열기
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      dropdownRef.current.style.bottom = "100%";
      dropdownRef.current.style.top = "auto";
      dropdownRef.current.style.marginTop = "0";
      dropdownRef.current.style.marginBottom = "0.5rem";
    } else {
      dropdownRef.current.style.top = "100%";
      dropdownRef.current.style.bottom = "auto";
      dropdownRef.current.style.marginTop = "0.5rem";
      dropdownRef.current.style.marginBottom = "0";
    }
  }, [open]);

  return (
    <div className="space-y-2.5">
      <label className="text-sm font-semibold text-[var(--text-strong)]">{label}</label>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="micro-button flex h-12 w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 text-left text-sm font-semibold text-[var(--text-strong)] transition-all hover:border-brand-primary hover:text-brand-primary"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={selectedOption ? "text-[var(--text-strong)]" : "text-[var(--text-muted)]"}>
            {selectedOption?.label ?? t("common:actions.select")}
          </span>
          <Icon
            name="chevronDown"
            size={16}
            variant="secondary"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div 
            ref={dropdownRef}
            className="absolute left-0 z-20 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl"
          >
            <div className="max-h-64 overflow-y-auto py-1">
              {options.map((option) => {
                const isActive = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: option.value } } as React.ChangeEvent<HTMLSelectElement>);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-brand-primary/15 font-semibold text-brand-primary"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)]/70"
                    }`}
                  >
                    <span>{option.label}</span>
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

