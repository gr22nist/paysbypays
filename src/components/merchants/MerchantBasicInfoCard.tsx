"use client";

import { useTranslation } from "@hua-labs/i18n-core";
import { getMerchantStatusMeta } from "@/data/merchant-status";
import type { MerchantDetailRes } from "@/lib/api/types";

interface MerchantBasicInfoCardProps {
  merchant: MerchantDetailRes;
}

export function MerchantBasicInfoCard({ merchant }: MerchantBasicInfoCardProps) {
  const { t } = useTranslation();
  const statusMeta = getMerchantStatusMeta(merchant.status);

  return (
    <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
        {t("merchants:drawer.sections.basicInfo")}
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {t("merchants:drawer.fields.mchtCode")}
          </dt>
          <dd className="text-sm text-gray-900">{merchant.mchtCode}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {t("merchants:drawer.fields.mchtName")}
          </dt>
          <dd className="text-sm text-gray-900">{merchant.mchtName}</dd>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {t("merchants:drawer.fields.status")}
          </dt>
          <dd>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
            >
              {t(statusMeta.labelKey)}
            </span>
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {t("merchants:drawer.fields.bizType")}
          </dt>
          <dd className="text-sm text-gray-900">{merchant.bizType}</dd>
        </div>
      </dl>
    </div>
  );
}

