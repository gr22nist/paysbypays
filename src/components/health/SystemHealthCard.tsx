"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { useHealthStore } from "@/store/health-store";
import { useHealthMonitoring } from "@/hooks/useHealthMonitoring";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import type { HealthStatus } from "@/types/health";
import { useShallow } from "zustand/react/shallow";

// STATUS_META와 STATUS_THRESHOLD는 컴포넌트 내부에서 t()를 사용하여 동적으로 생성

interface SystemHealthCardProps {
  className?: string;
}

export function SystemHealthCard({ className }: SystemHealthCardProps = {}) {
  const { t, tWithParams } = useTranslation();
  const { formatDateTime } = useDisplayFormat();
  useHealthMonitoring();
  const infoRef = useRef<HTMLDivElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const { overallStatus, groups, lastUpdated, pollingStatus, manualRefresh } =
    useHealthStore(
      useShallow((state) => ({
        overallStatus: state.overallStatus,
        groups: state.groups,
        lastUpdated: state.lastUpdated,
        pollingStatus: state.pollingStatus,
        manualRefresh: state.manualRefresh,
      }))
    );

  const STATUS_META: Record<
    HealthStatus,
    { label: string; badge: string; dot: string }
  > = {
    healthy: {
      label: t("common:statuses.healthy"),
      badge:
        "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700",
      dot: "bg-emerald-500 dark:bg-emerald-400",
    },
    degraded: {
      label: t("common:statuses.degraded"),
      badge:
        "bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
      dot: "bg-orange-500 dark:bg-orange-400",
    },
    down: {
      label: t("common:statuses.down"),
      badge:
        "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
      dot: "bg-red-500 dark:bg-red-400",
    },
    unknown: {
      label: t("common:statuses.needsAttention"),
      badge:
        "bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600",
      dot: "bg-gray-400 dark:bg-slate-400",
    },
  };

  const STATUS_THRESHOLD = [
    { 
      label: t("common:statuses.healthy"), 
      range: "≤ 800ms", 
      description: t("dashboard:sections.systemHealth.threshold.healthy.description") 
    },
    { 
      label: t("common:statuses.degraded"), 
      range: "800 ~ 1,500ms", 
      description: t("dashboard:sections.systemHealth.threshold.degraded.description") 
    },
    { 
      label: t("common:statuses.down"), 
      range: "≥ 1,500ms", 
      description: t("dashboard:sections.systemHealth.threshold.down.description") 
    },
  ];

  const formatTimestamp = (value?: string) => {
    if (!value) return t("dashboard:sections.systemHealth.noUpdate");
    try {
      const formatted = formatDateTime(value);
      if (formatted === "-") return t("dashboard:sections.systemHealth.noUpdate");
      // formatDateTime은 "YYYY-MM-DD HH:mm" 형식이므로 시간 부분만 추출
      const timePart = formatted.split(" ")[1] || "";
      return timePart 
        ? tWithParams("dashboard:sections.systemHealth.updated", { time: timePart })
        : t("dashboard:sections.systemHealth.noUpdate");
    } catch {
      return t("dashboard:sections.systemHealth.noUpdate");
    }
  };

  const groupList = useMemo(() => {
    return Object.values(groups).map((group) => {
      // group.label이 번역 키인지 확인 (health:로 시작하는지)
      const isTranslationKey = typeof group.label === "string" && group.label.startsWith("health:");
      let translatedLabel: string;
      
      if (isTranslationKey) {
        translatedLabel = t(group.label);
      } else {
        // group.id를 기반으로 번역 키 생성 시도
        const labelKey = group.id === "common-codes" 
          ? "health:groups.commonCodes"
          : `health:groups.${group.id}`;
        translatedLabel = t(labelKey) || group.label || group.id;
      }
      
      // message도 번역 키인지 확인
      const translatedMessage = group.message && typeof group.message === "string" && group.message.startsWith("health:")
        ? t(group.message)
        : group.message;
      
      return {
        ...group,
        label: translatedLabel,
        message: translatedMessage,
      };
    });
  }, [groups, t]);

  useEffect(() => {
    if (!infoOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (
        infoRef.current &&
        !infoRef.current.contains(event.target as Node)
      ) {
        setInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [infoOpen]);

  const wrapperClassName = [
    "micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] flex flex-col h-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName}>
      <SectionHeaderBlock
        title={t("dashboard:sections.systemHealth.title")}
        description={t("dashboard:sections.systemHealth.description")}
        actionSlot={
          <div className="flex items-center gap-3">
            <div className="relative" ref={infoRef}>
              <button
                type="button"
                aria-label={t("dashboard:sections.systemHealth.latencyInfo")}
                className="micro-button h-8 w-8 rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-brand-primary flex items-center justify-center"
                onClick={() => setInfoOpen((prev) => !prev)}
              >
                <Icon name="info" size={16} variant="secondary" />
              </button>
              {infoOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 text-xs text-[var(--text-muted)] shadow-xl">
                  <p className="text-xs font-semibold text-[var(--text-strong)]">
                    {t("dashboard:sections.systemHealth.latencyInfo")}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {STATUS_THRESHOLD.map((item) => (
                      <li key={item.label} className="flex items-start gap-2">
                        <span className="w-12 font-medium text-[var(--text-strong)]">
                          {item.label}
                        </span>
                        <span>{item.range}</span>
                        <span className="text-[var(--text-subtle)]">
                          ({item.description})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${STATUS_META[overallStatus].badge}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${STATUS_META[overallStatus].dot}`}
              />
              {STATUS_META[overallStatus].label}
            </span>
          </div>
        }
      />

      <div className="flex flex-col gap-4 px-6 pb-6 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groupList.length === 0 && (
            <div className="col-span-2 text-sm text-[var(--text-subtle)]">
              {t("common:states.noHealth")}
            </div>
          )}
          {groupList.map((group) => {
            const meta = STATUS_META[group.status];
            return (
              <div
                key={group.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/40 p-3 flex-1"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-[var(--text-strong)]">
                  <span className="truncate font-bold">{group.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${meta.badge}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-[var(--text-subtle)]">
                  {group.latencyMs 
                    ? tWithParams("dashboard:sections.systemHealth.latency", { latency: group.latencyMs })
                    : t("dashboard:sections.systemHealth.noLatency")
                  }
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-sm text-[var(--text-subtle)] pt-1">
          <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)]">
            <span className="font-medium text-[var(--text-strong)]">
              {formatTimestamp(lastUpdated)}
            </span>
            <span>
              {pollingStatus === "running" 
                ? t("dashboard:sections.systemHealth.auto.running")
                : t("dashboard:sections.systemHealth.auto.idle")
              }
            </span>
            <button
              type="button"
              onClick={() => manualRefresh()}
              className="micro-button inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-brand-primary hover:text-brand-primary transition-colors"
              aria-label={t("dashboard:sections.systemHealth.refresh")}
            >
              <Icon name="refresh" size={16} variant="secondary" />
            </button>
          </div>
          <Link
            href="/system-health"
            className="micro-button inline-flex h-9 items-center rounded-full border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-strong)] hover:border-brand-primary hover:text-brand-primary transition-colors"
          >
            {t("dashboard:sections.systemHealth.viewDetail")}
          </Link>
        </div>
      </div>
    </div>
  );
}

