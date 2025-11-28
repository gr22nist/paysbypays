"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { useTransactions } from "@/hooks/useTransactions";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { getPayTypeTranslationKey } from "@/data/pay-types";
import { TransactionStatusBadge } from "@/components/badges/TransactionStatusBadge";
import { PaymentMethodBadge } from "@/components/badges/PaymentMethodBadge";

interface RecentTransactionsFeedProps {
  className?: string;
  limit?: number;
}

export function RecentTransactionsFeed({
  className = "",
  limit = 10,
}: RecentTransactionsFeedProps) {
  const { t, tWithParams } = useTranslation();
  const { data: transactionsData, isLoading } = useTransactions({
    page: 0,
    size: limit,
  });
  const { formatCurrency } = useDisplayFormat();
  const { payTypes } = useCommonCodes();

  const payTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    payTypes.forEach((pt) => {
      const upperType = pt.type.toUpperCase();
      const translationKey = getPayTypeTranslationKey(pt.type);
      if (!translationKey && pt.description) {
        map.set(upperType, pt.description);
      }
    });
    return map;
  }, [payTypes]);

  // 최근 거래 정렬 (시간순)
  const recentTransactions = useMemo(() => {
    if (!transactionsData?.content) return [];

    return [...transactionsData.content]
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, limit);
  }, [transactionsData, limit]);

  // 시간 포맷팅
  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("common:time.justNow");
    if (diffMins < 60) return tWithParams("common:time.minutesAgo", { minutes: diffMins });
    if (diffHours < 24) return tWithParams("common:time.hoursAgo", { hours: diffHours });
    if (diffDays < 7) return tWithParams("common:time.daysAgo", { days: diffDays });

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}-${day} ${hours}:${minutes}`;
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-[var(--surface-muted)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <div className={`flex h-[200px] items-center justify-center ${className}`}>
        <p className="text-sm text-[var(--text-subtle)]">{t("dashboard:sections.recent.empty")}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {recentTransactions.map((tx) => (
          <Link
            key={tx.id}
            href={`/transactions?txId=${tx.id}`}
            className="micro-link flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] p-3 transition-colors hover:bg-[var(--surface-muted)]/60 hover:border-brand-primary/30"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {tx.id.slice(0, 8)}...
                </span>
                <TransactionStatusBadge status={tx.status || "unknown"} />
              <PaymentMethodBadge
                method={tx.paymentMethod || tx.payType || "UNKNOWN"}
                fallbackLabel={payTypeMap.get((tx.paymentMethod || tx.payType || "").toUpperCase())}
              />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-strong)]">
                  {formatCurrency(tx.amount || 0)}
                </span>
                {tx.merchantName && (
                  <span className="text-xs text-[var(--text-subtle)]">
                    · {tx.merchantName}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-[var(--text-subtle)]">
                {formatTime(tx.createdAt || tx.updatedAt)}
              </span>
              <Icon
                name="chevronRight"
                size={16}
                className="text-[var(--text-muted)]"
              />
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/transactions"
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-brand-primary hover:text-brand-primary"
      >
        {t("common:actions.viewAll")}
        <Icon name="arrowRight" size={16} />
      </Link>
    </div>
  );
}

