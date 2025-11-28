"use client";

const STATUS_META = {
  ACTIVE: {
    labelKey: "merchants:statuses.active",
    badgeClass:
      "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50",
    textClass: "text-green-800 dark:text-green-400",
  },
  READY: {
    labelKey: "merchants:statuses.ready",
    badgeClass:
      "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50",
    textClass: "text-blue-800 dark:text-blue-400",
  },
  SUSPENDED: {
    labelKey: "merchants:statuses.suspended",
    badgeClass: "bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50",
    textClass: "text-orange-800 dark:text-orange-400",
  },
  INACTIVE: {
    labelKey: "merchants:statuses.inactive",
    badgeClass: "bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700/50",
    textClass: "text-gray-800 dark:text-gray-400",
  },
  CLOSED: {
    labelKey: "merchants:statuses.closed",
    badgeClass: "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50",
    textClass: "text-red-800 dark:text-red-400",
  },
} as const;

type StatusKey = keyof typeof STATUS_META;

export function getMerchantStatusMeta(status?: string) {
  const key = (status || "").toUpperCase() as StatusKey;
  if (STATUS_META[key]) {
    return STATUS_META[key];
  }

  return {
    labelKey: "merchants:statuses.unknown",
    badgeClass: "bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700/50",
    textClass: "text-gray-800 dark:text-gray-400",
  };
}

export function isMerchantStatus(
  status: string | undefined,
  target: StatusKey
) {
  return (status || "").toUpperCase() === target;
}


