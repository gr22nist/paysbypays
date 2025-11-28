"use client";

import { useTranslation } from "@hua-labs/i18n-core";
import type { MerchantDetailRes } from "@/lib/api/types";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";

interface MerchantContactInfoCardProps {
  merchant: MerchantDetailRes;
}

export function MerchantContactInfoCard({ merchant }: MerchantContactInfoCardProps) {
  const { t } = useTranslation();
  const { formatDateTime } = useDisplayFormat();
  
  return (
    <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
        {t("merchants:drawer.sections.contactInfo")}
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {merchant.bizNo && (
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t("merchants:drawer.fields.bizNo")}
            </dt>
            <dd className="text-sm text-[var(--text-strong)]">{merchant.bizNo}</dd>
          </div>
        )}
        {merchant.address && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t("merchants:drawer.fields.address")}
            </dt>
            <dd className="text-sm text-[var(--text-strong)]">{merchant.address}</dd>
          </div>
        )}
        {merchant.phone && (
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t("merchants:drawer.fields.phone")}
            </dt>
            <dd className="text-sm text-[var(--text-strong)]">{merchant.phone}</dd>
          </div>
        )}
        {merchant.email && (
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t("merchants:drawer.fields.email")}
            </dt>
            <dd className="text-sm text-[var(--text-strong)]">{merchant.email}</dd>
          </div>
        )}
        {merchant.registeredAt && (
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t("merchants:drawer.fields.registeredAt")}
            </dt>
            <dd className="text-sm text-[var(--text-strong)]">
              {formatDateTime(merchant.registeredAt)}
            </dd>
          </div>
        )}
        {merchant.updatedAt && (
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {t("merchants:drawer.fields.updatedAt")}
            </dt>
            <dd className="text-sm text-[var(--text-strong)]">
              {formatDateTime(merchant.updatedAt)}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

