"use client";

import { Switch, Icon } from "@hua-labs/ui";

interface PreferenceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

export function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: PreferenceToggleProps) {
  return (
    <div
      className={`micro-button rounded-xl border px-4 py-3.5 transition-all ${
        checked
          ? "border-brand-primary bg-brand-primary-soft/50 shadow-md ring-2 ring-brand-primary/30"
          : "border-[var(--border-subtle)] bg-[var(--surface-muted)]/30 hover:border-brand-primary/40"
      }`}
    >
      <div 
        className="flex items-center justify-between gap-4 cursor-pointer"
        onClick={(e) => {
          // Switch 버튼 자체를 클릭한 경우는 이벤트 전파 방지
          if ((e.target as HTMLElement).closest('button[role="switch"]')) {
            e.stopPropagation();
            return;
          }
          onChange();
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 [&_button[role='switch']]:shrink-0">
            <Switch
              checked={checked}
              onChange={onChange}
              label={label}
              description={description}
            />
          </div>
        </div>
        {checked && (
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary shadow-sm ring-2 ring-brand-primary/20">
            <Icon name="check" size={16} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

