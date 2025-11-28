"use client";

import { useMemo } from "react";
import { StatsPanel } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { useHealthStore } from "@/store/health-store";
import { useHealthMonitoring } from "@/hooks/useHealthMonitoring";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { useShallow } from "zustand/react/shallow";

const STATUS_META = {
  healthy: "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700",
  degraded: "bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
  down: "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  unknown: "bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600",
} as const;

export default function SystemHealthPage() {
  const { t } = useTranslation();
  const { formatDateTime } = useDisplayFormat();
  useHealthMonitoring();
  const {
    groups,
    snapshotHistory,
    overallStatus,
    lastUpdated,
    pollingStatus,
    manualRefresh,
  } = useHealthStore(
    useShallow((state) => ({
      groups: state.groups,
      snapshotHistory: state.snapshotHistory,
      overallStatus: state.overallStatus,
      lastUpdated: state.lastUpdated,
      pollingStatus: state.pollingStatus,
      manualRefresh: state.manualRefresh,
    }))
  );

  const STATUS_LABEL: Record<string, string> = {
    healthy: t("common:statuses.healthy"),
    degraded: t("common:statuses.degraded"),
    down: t("common:statuses.down"),
    unknown: t("common:statuses.needsAttention"),
  };

  const summary = useMemo(() => {
    const list = Object.values(groups);
    const counts = list.reduce(
      (acc, group) => {
        acc[group.status] = (acc[group.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageLatency =
      list.reduce((acc, group) => acc + (group.latencyMs || 0), 0) /
      (list.length || 1);

    return {
      counts,
      averageLatency: Math.round(averageLatency),
    };
  }, [groups]);

  const refreshAction = (
    <button
      type="button"
      onClick={() => manualRefresh()}
      className="micro-button inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] shadow-sm transition hover:border-brand-primary hover:text-brand-primary"
    >
      {t("health:actions.refreshNow")}
      <span className="text-xs text-[var(--text-subtle)]">⌘R</span>
    </button>
  );

  return (
    <DashboardLayout
      title={t("layout:pages.systemHealth.title")}
      description={t("layout:pages.systemHealth.description")}
      activeItem="system-health"
      actions={refreshAction}
    >
      <div className="flex flex-col gap-6">
        <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)]">
          <SectionHeaderBlock
            title={t("health:page.stats.title")}
            description={t("health:page.stats.description")}
            descriptionSize="xs"
          />
          <div className="px-6 pb-6 pt-4">
            <StatsPanel
              columns={4}
              items={[
                {
                  label: t("health:page.stats.overallStatus"),
                  value: (
                    <span className="text-brand-primary text-3xl sm:text-4xl font-semibold">
                      {STATUS_LABEL[overallStatus]}
                    </span>
                  ),
                  description: lastUpdated ? formatDateTime(lastUpdated) : "-",
                },
                {
                  label: t("common:statuses.healthy"),
                  value: (
                    <span className="text-brand-primary text-3xl sm:text-4xl font-semibold">
                      {summary.counts.healthy ?? 0}
                    </span>
                  ),
                  description: t("common:statuses.healthy"),
                  accent: "secondary",
                },
                {
                  label: t("common:statuses.degraded"),
                  value: (
                    <span className="text-brand-primary text-3xl sm:text-4xl font-semibold">
                      {summary.counts.degraded ?? 0}
                    </span>
                  ),
                  description: t("common:statuses.degraded"),
                  accent: "warning",
                },
                {
                  label: t("common:statuses.down"),
                  value: (
                    <span className="text-brand-primary text-3xl sm:text-4xl font-semibold">
                      {summary.counts.down ?? 0}
                    </span>
                  ),
                  description: t("common:statuses.down"),
                  accent: "neutral",
                },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-6 py-6">
            <SectionHeaderBlock
              title={t("health:page.serviceGroups.title")}
              description={t("health:page.serviceGroups.description")}
              containerClassName="px-0 pt-0"
              actionSlot={
                <span className="text-sm text-[var(--text-subtle)]">
                  {pollingStatus === "running" ? t("health:page.polling.running") : t("health:page.polling.idle")}
                </span>
              }
            />
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm">
                <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">{t("health:page.table.headers.group")}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("health:page.table.headers.status")}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("health:page.table.headers.responseTime")}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("health:page.table.headers.lastChecked")}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("health:page.table.headers.message")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)]">
                  {Object.values(groups).map((group) => {
                    // group.label이 번역 키인지 확인
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
                    
                    const translatedMessage = group.message && typeof group.message === "string" && group.message.startsWith("health:")
                      ? t(group.message)
                      : group.message;
                    
                    return (
                      <tr key={group.id}>
                        <td className="px-4 py-3 font-medium">{translatedLabel}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              STATUS_META[group.status]
                            }`}
                          >
                            {STATUS_LABEL[group.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">
                          {group.latencyMs ? `${group.latencyMs}ms` : "-"}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">
                          {group.lastCheckedAt ? formatDateTime(group.lastCheckedAt) : "-"}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-subtle)]">
                          {translatedMessage ?? "-"}
                        </td>
                      </tr>
                    );
                  })}
                  {Object.values(groups).length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-[var(--text-subtle)]"
                      >
                        {t("health:page.loading")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-6 py-6">
            <SectionHeaderBlock
              title={t("health:page.recentLogs.title")}
              description={t("health:page.recentLogs.description")}
              containerClassName="px-0 pt-0"
            />
            <div className="mt-4 space-y-4">
              {snapshotHistory.slice(0, 8).map((snapshot) => (
                <div
                  key={snapshot.timestamp}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/50 p-4"
                >
                  <p className="text-sm font-semibold text-[var(--text-strong)]">
                    {snapshot.timestamp ? formatDateTime(snapshot.timestamp) : "-"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-subtle)]">
                    {t("health:page.recentLogs.overallStatus")}: {STATUS_LABEL[snapshot.overallStatus]}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {snapshot.groups.map((group) => {
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
                      
                      return (
                        <span
                          key={group.id}
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_META[group.status]}`}
                        >
                          {translatedLabel}: {STATUS_LABEL[group.status]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
              {snapshotHistory.length === 0 && (
                <p className="text-sm text-[var(--text-subtle)]">
                  {t("health:page.recentLogs.empty")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


