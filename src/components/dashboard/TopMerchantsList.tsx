"use client";

import Link from "next/link";
import { SkeletonList } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { Icon } from "@hua-labs/ui";

interface MerchantStat {
  mchtCode: string;
  mchtName: string;
  totalAmount: number;
  approvedCount: number;
  totalCount: number;
}

interface TopMerchantsListProps {
  merchants: MerchantStat[];
  type: "amount" | "approval";
  loading: boolean;
  panelClass: string;
}

export function TopMerchantsList({
  merchants,
  type,
  loading,
  panelClass,
}: TopMerchantsListProps) {
  const { t } = useTranslation();
  const title = type === "amount" ? t("dashboard:sections.topAmount.title") : t("dashboard:sections.topApproval.title");
  const description =
    type === "amount"
      ? t("dashboard:sections.topAmount.description")
      : t("dashboard:sections.topApproval.description");
  const emptyText = type === "amount" ? t("dashboard:sections.topAmount.empty") : t("dashboard:sections.topApproval.empty");

  return (
    <div className={panelClass}>
      <SectionHeaderBlock
        title={title}
        description={description}
        descriptionSize="xs"
        actionSlot={
          <Link
            href="/merchants"
            className="micro-button inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-brand-primary hover:text-brand-primary"
          >
            <span className="sr-only">{t("common:actions.viewAll")}</span>
            <Icon name="arrowRight" size={16} variant="secondary" />
          </Link>
        }
      />
      <div className="px-6 pb-6 pt-4">
        {loading ? (
          <SkeletonList className="mt-2" />
        ) : merchants.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-subtle)]">
            {emptyText}
          </div>
        ) : (
          <div className="space-y-3">
            {merchants.map((merchant, index) => {
              const approvalRatio =
                merchant.totalCount > 0
                  ? (merchant.approvedCount / merchant.totalCount) * 100
                  : 0;

              return (
                <Link
                  key={merchant.mchtCode}
                  href={`/merchants/${merchant.mchtCode}`}
                  className="micro-link flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--surface-muted)]/60"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        type === "amount"
                          ? "bg-brand-primary-soft text-brand-primary"
                          : "bg-brand-secondary-soft text-brand-secondary"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-strong)]">
                        {merchant.mchtName}
                      </p>
                      <p className="truncate text-xs text-[var(--text-subtle)]">
                        {merchant.mchtCode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {type === "amount" ? (
                      <>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">
                          ₩{merchant.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-[var(--text-subtle)]">
                          {merchant.totalCount}{t("common:units.transactions")}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">
                          {merchant.approvedCount.toLocaleString()}{t("common:units.transactions")}
                        </p>
                        <p className="text-xs text-[var(--text-subtle)]">
                          {t("dashboard:sections.summary.metrics.approvalRate.label")} {approvalRatio.toFixed(1)}%
                        </p>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

