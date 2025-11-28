"use client";

import Link from "next/link";
import { SectionHeader } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { getMerchantStatusMeta } from "@/data/merchant-status";
import type { MerchantDetailRes } from "@/lib/api/types";

interface TransactionMerchantInfoCardProps {
  merchant: MerchantDetailRes | null;
  mchtCode: string;
  loading?: boolean;
}

export function TransactionMerchantInfoCard({
  merchant,
  mchtCode,
  loading = false,
}: TransactionMerchantInfoCardProps) {
  const { t } = useTranslation();
  
  if (!mchtCode) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-6">
      <SectionHeader
        title={t("transactions:merchantInfo.title")}
        description={t("transactions:merchantInfo.description")}
        action={
          <Link
            href={`/merchants/${mchtCode}`}
            className="text-sm text-brand-primary hover:text-brand-primary-dark"
          >
            {t("transactions:merchantInfo.viewDetail")}
          </Link>
        }
      />
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : merchant ? (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-600 mb-1">{t("merchants:drawer.fields.mchtCode")}</dt>
              <dd className="text-sm text-gray-900 font-mono">{merchant.mchtCode}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600 mb-1">{t("merchants:drawer.fields.mchtName")}</dt>
              <dd className="text-sm text-gray-900">{merchant.mchtName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600 mb-1">{t("merchants:drawer.fields.status")}</dt>
              <dd className="text-sm text-gray-900">
                {(() => {
                  const meta = getMerchantStatusMeta(merchant.status);
                  return (
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}
                    >
                      {t(meta.labelKey)}
                    </span>
                  );
                })()}
              </dd>
            </div>
            {merchant.bizType && (
              <div>
                <dt className="text-sm font-medium text-gray-600 mb-1">{t("merchants:drawer.fields.bizType")}</dt>
                <dd className="text-sm text-gray-900">{merchant.bizType}</dd>
              </div>
            )}
          </dl>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

