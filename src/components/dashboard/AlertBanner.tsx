"use client";

import { useMemo, useState, useEffect } from "react";
import { Icon } from "@hua-labs/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@hua-labs/i18n-core";
import { useHealthStore } from "@/store/health-store";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettlements } from "@/hooks/useSettlements";

export type AlertSeverity = "warning" | "error" | "info";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  href?: string;
  dismissible?: boolean;
}

interface AlertBannerProps {
  className?: string;
}

const DISMISS_STORAGE_KEY = "alert-dismissed-until";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getDismissedUntil(alertId: string): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(`${DISMISS_STORAGE_KEY}-${alertId}`);
  if (!stored) return null;
  const timestamp = parseInt(stored, 10);
  if (isNaN(timestamp)) return null;
  return timestamp;
}

function isDismissed(alertId: string): boolean {
  const dismissedUntil = getDismissedUntil(alertId);
  if (!dismissedUntil) return false;
  return Date.now() < dismissedUntil;
}

function setDismissedForDay(alertId: string) {
  if (typeof window === "undefined") return;
  const dismissedUntil = Date.now() + ONE_DAY_MS;
  localStorage.setItem(`${DISMISS_STORAGE_KEY}-${alertId}`, dismissedUntil.toString());
}

export function AlertBanner({ className = "" }: AlertBannerProps) {
  const { t, tWithParams } = useTranslation();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const { groups } = useHealthStore();

  const today = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return {
      from: start.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    };
  }, []);

  const { data: todayTransactions } = useTransactions({
    page: 0,
    size: 1000,
    from: today.from,
    to: today.to,
  });

  const { data: settlementData } = useSettlements();
  const settlementRecords = settlementData?.records;

  const alerts = useMemo<Alert[]>(() => {
    const result: Alert[] = [];

    if (groups) {
      const degradedGroups = Object.entries(groups).filter(
        ([, group]) => group.status === "degraded" || group.status === "down"
      );

      if (degradedGroups.length > 0) {
        const downCount = degradedGroups.filter(([, g]) => g.status === "down").length;
        const degradedCount = degradedGroups.filter(([, g]) => g.status === "degraded").length;

        if (downCount > 0) {
          result.push({
            id: "health-down",
            severity: "error",
            title: t("common:alerts.healthDown.title"),
            message: tWithParams("common:alerts.healthDown.message", { count: downCount.toString() }),
            href: "/system-health",
            dismissible: true,
          });
        } else if (degradedCount > 0) {
          result.push({
            id: "health-degraded",
            severity: "warning",
            title: t("common:alerts.healthDegraded.title"),
            message: tWithParams("common:alerts.healthDegraded.message", { count: degradedCount.toString() }),
            href: "/system-health",
            dismissible: true,
          });
        }
      }
    }

    if (todayTransactions?.content) {
      const total = todayTransactions.content.length;
      const failed = todayTransactions.content.filter(
        (tx) => (tx.status || "").toLowerCase() === "failed"
      ).length;
      const failureRate = total > 0 ? (failed / total) * 100 : 0;

      if (failureRate > 10) {
        result.push({
          id: "high-failure-rate",
          severity: "error",
          title: t("common:alerts.highFailureRate.title"),
          message: tWithParams("common:alerts.highFailureRate.message", { rate: failureRate.toFixed(1) }),
          href: "/transactions?status=failed",
          dismissible: true,
        });
      } else if (failureRate > 5) {
        result.push({
          id: "moderate-failure-rate",
          severity: "warning",
          title: t("common:alerts.moderateFailureRate.title"),
          message: tWithParams("common:alerts.moderateFailureRate.message", { rate: failureRate.toFixed(1) }),
          href: "/transactions?status=failed",
          dismissible: true,
        });
      }
    }

    if (settlementRecords) {
      const delayedCount = settlementRecords.filter((r) => r.status === "delayed").length;
      if (delayedCount > 0) {
        result.push({
          id: "settlement-delayed",
          severity: "warning",
          title: t("common:alerts.settlementDelayed.title"),
          message: tWithParams("common:alerts.settlementDelayed.message", { count: delayedCount.toString() }),
          href: "/settlements?status=delayed",
          dismissible: true,
        });
      }
    }

    return result.filter(
      (alert) => !dismissedAlerts.has(alert.id) && !isDismissed(alert.id)
    );
  }, [groups, todayTransactions, settlementRecords, dismissedAlerts]);

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  const handleDismissForDay = (alertId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissedForDay(alertId);
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (alerts.length === 0 || !mounted) return null;

  const handleAlertClick = (href?: string) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <div
      className={`fixed right-6 top-6 z-50 flex flex-col gap-3 max-w-md ${className}`}
      style={{
        // CLS 방지를 위해 초기 높이 예약
        minHeight: alerts.length > 0 ? "auto" : "0",
      }}
    >
      {alerts.map((alert, index) => {
        const severityStyles = {
          warning:
            "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/90 dark:text-amber-200 dark:border-amber-700 shadow-lg",
          error:
            "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/90 dark:text-red-200 dark:border-red-700 shadow-lg",
          info: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/90 dark:text-blue-200 dark:border-blue-700 shadow-lg",
        };

        const iconName = {
          warning: "warning",
          error: "error",
          info: "info",
        }[alert.severity] as "warning" | "error" | "info";

        return (
          <div
            key={alert.id}
            onClick={() => handleAlertClick(alert.href)}
            className={`
              flex items-start gap-3 rounded-xl border p-4 backdrop-blur-sm
              ${severityStyles[alert.severity]}
              ${alert.href ? "cursor-pointer hover:shadow-xl transition-shadow duration-150" : ""}
              animate-in slide-in-from-right-full fade-in duration-200
            `}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <Icon 
              name={iconName} 
              size={20} 
              className={`mt-0.5 flex-shrink-0 ${
                alert.severity === "error" 
                  ? "text-red-800 dark:text-red-400" 
                  : alert.severity === "warning"
                  ? "text-amber-800 dark:text-amber-400"
                  : "text-blue-800 dark:text-blue-400"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm font-bold">{alert.title}</div>
              <div className="text-xs font-medium mt-1 opacity-95">
                {alert.message && alert.message.includes(":") && !alert.message.includes(" ")
                  ? t(alert.message)
                  : alert.message}
              </div>
            </div>
            {alert.dismissible && (
              <div className="flex flex-col gap-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDismiss(alert.id);
                  }}
                  className="flex-shrink-0 rounded-lg p-1.5 opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  aria-label={t("common:alerts.close")}
                  title={t("common:alerts.close")}
                >
                  <Icon name="close" size={16} />
                </button>
                <button
                  onClick={(e) => handleDismissForDay(alert.id, e)}
                  className="flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium text-amber-800 dark:text-amber-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-100"
                  aria-label={t("common:alerts.dismissForDay")}
                  title={t("common:alerts.dismissForDay")}
                >
                  {t("common:alerts.dismissForDay")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

