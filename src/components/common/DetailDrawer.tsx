"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter, Icon } from "@hua-labs/ui";

export interface DetailSection {
  title: string;
  fields: DetailField[];
}

export interface DetailField {
  label: string;
  value: ReactNode;
  span?: 1 | 2; // grid column span (1 or 2)
  className?: string;
}

export interface DetailAction {
  label: string;
  href: string;
  icon?: string;
  onClick?: () => void;
}

export interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  sections: DetailSection[];
  actions?: DetailAction[];
  loading?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  sections,
  actions = [],
  loading = false,
  size = "xl",
}: DetailDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      size={size}
      showBackdrop={true}
      closeOnBackdropClick={true}
      closeOnEscape={true}
      className="detail-drawer"
    >
      <DrawerHeader showCloseButton onClose={() => onOpenChange(false)} className="px-4 sm:px-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-strong)]">{title}</h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[var(--text-subtle)] mt-1">{subtitle}</p>
          )}
        </div>
      </DrawerHeader>

      <DrawerContent maxWidth="sm" align="center" className="px-4 sm:px-6">
        {loading ? (
          <div className="space-y-4 sm:space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
                <div className="h-5 w-24 mb-4 bg-[var(--surface-muted)] rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex flex-col gap-1.5">
                      <div className="h-3 w-16 bg-[var(--surface-muted)] rounded animate-pulse" />
                      <div className="h-4 w-full bg-[var(--surface-muted)] rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {sections.map((section, index) => (
              <DetailSection key={index} section={section} />
            ))}
          </div>
        )}
      </DrawerContent>

      {actions.length > 0 && (
        <DrawerFooter className="px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full">
            {actions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="micro-button inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[var(--text-strong)] transition-all hover:border-brand-primary hover:text-brand-primary"
                onClick={() => {
                  action.onClick?.();
                  onOpenChange(false);
                }}
              >
                {action.icon && <Icon name={action.icon as "externalLink" | "list" | "arrowRight"} size={14} className="sm:w-4 sm:h-4" />}
                {action.label}
              </Link>
            ))}
          </div>
        </DrawerFooter>
      )}
    </Drawer>
  );
}

function DetailSection({ section }: { section: DetailSection }) {
  return (
    <div className="border-b border-[var(--border-subtle)] pb-4 sm:pb-6 last:border-b-0">
      <h3 className="text-base sm:text-lg font-semibold text-[var(--text-strong)] mb-3 sm:mb-4">
        {section.title}
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {section.fields.map((field, index) => (
          <div
            key={index}
            className={`flex flex-col gap-1.5 ${field.span === 2 ? "sm:col-span-2" : ""} ${field.className || ""}`}
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
              {field.label}
            </dt>
            <dd className="text-sm text-[var(--text-strong)] break-words">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// 헬퍼 함수: 날짜 포맷팅 (일반 함수로 변경 - hook이 아님)
export function formatDateString(
  dateString: string | null | undefined,
  formatDate: (input: Date | string | number) => string
): string {
  if (!dateString) return "-";
  try {
    return formatDate(new Date(dateString));
  } catch {
    return "-";
  }
}

