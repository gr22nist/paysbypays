"use client";

import { useTranslation } from "@hua-labs/i18n-core";

type StatusKey = keyof typeof STATUS_CLASSES;
type BadgeSize = "sm" | "md";

const STATUS_CLASSES = {
  approved: "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50",
  failed: "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50",
  cancelled: "bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50",
  pending: "bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700/50",
  review: "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50",
} as const;

function getStatusTranslationKey(status: StatusKey): string {
  const keyMap: Record<StatusKey, string> = {
    approved: "common:statuses.approved",
    failed: "common:statuses.failed",
    cancelled: "common:statuses.cancelled",
    pending: "common:statuses.pending",
    review: "common:statuses.review",
  };
  return keyMap[status] || "common:statuses.unknown";
}

const STATUS_ALIASES: Record<string, StatusKey> = {
  success: "approved",
  approved: "approved",
  approval: "approved",
  fail: "failed",
  failed: "failed",
  failure: "failed",
  error: "failed",
  cancel: "cancelled",
  cancelled: "cancelled",
  void: "cancelled",
  pending: "pending",
  hold: "pending",
  review: "review",
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: "px-2.5 py-0.5 text-[11px]",
  md: "px-3 py-1 text-xs",
};

function normalizeStatus(value?: string | null): StatusKey | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return STATUS_ALIASES[normalized] ?? null;
}

export interface TransactionStatusBadgeProps {
  status?: string | null;
  size?: BadgeSize;
  className?: string;
}

export function TransactionStatusBadge({
  status,
  size = "md",
  className = "",
}: TransactionStatusBadgeProps) {
  const { t } = useTranslation();
  const normalized = normalizeStatus(status);

  if (!normalized) {
    return <span className="text-xs text-gray-400 dark:text-gray-500">-</span>;
  }

  const badgeClass = STATUS_CLASSES[normalized] || STATUS_CLASSES.pending;
  const labelKey = getStatusTranslationKey(normalized);

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${SIZE_STYLES[size]} ${badgeClass} ${className}`.trim()}
    >
      {t(labelKey)}
    </span>
  );
}

