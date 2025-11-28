"use client";

import { SectionHeader } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { getPayTypeTranslationKey } from "@/data/pay-types";
import { useMemo } from "react";
import { TransactionStatusBadge } from "@/components/badges/TransactionStatusBadge";
import { PaymentMethodBadge } from "@/components/badges/PaymentMethodBadge";
import type { Transaction } from "@/lib/api/types";

interface TransactionBasicInfoCardProps {
  transaction: Transaction;
}

export function TransactionBasicInfoCard({ transaction }: TransactionBasicInfoCardProps) {
  const { t } = useTranslation();
  const { formatCurrency, formatDateTime } = useDisplayFormat();
  const { payTypes } = useCommonCodes();

  // 결제수단 매핑 (번역 키가 없을 때만 API description 사용)
  const payTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    payTypes.forEach((pt) => {
      const upperType = pt.type.toUpperCase();
      // 번역 키가 없을 때만 API description 사용
      const translationKey = getPayTypeTranslationKey(pt.type);
      if (!translationKey && pt.description) {
        map.set(upperType, pt.description);
      }
    });
    return map;
  }, [payTypes]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-6">
      <SectionHeader
        title={t("transactions:basicInfo.title")}
        description={t("transactions:basicInfo.description")}
      />
      <div className="p-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-600 mb-1">{t("transactions:detail.transactionCodeLabel")}</dt>
            <dd className="text-sm text-gray-900 font-mono">{transaction.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 mb-1">{t("transactions:detail.transactionAmount")}</dt>
            <dd className="text-lg font-semibold text-gray-900">
              {formatCurrency(transaction.amount || 0)}
              {transaction.currency && (
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {transaction.currency}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 mb-1">{t("transactions:detail.transactionStatus")}</dt>
            <dd className="mt-1">
              <TransactionStatusBadge status={transaction.status} size="sm" />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 mb-1">{t("transactions:detail.paymentMethod")}</dt>
            <dd className="mt-1">
              <PaymentMethodBadge
                method={transaction.paymentMethod || transaction.payType}
                fallbackLabel={payTypeMap.get((transaction.paymentMethod || transaction.payType || "").toUpperCase())}
                size="sm"
              />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-600 mb-1">{t("transactions:detail.paymentTime")}</dt>
            <dd className="text-sm text-gray-900">
              {formatDateTime(transaction.createdAt || "")}
            </dd>
          </div>
          {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
            <div>
              <dt className="text-sm font-medium text-gray-600 mb-1">{t("transactions:detail.updatedTime")}</dt>
              <dd className="text-sm text-gray-900">
                {formatDateTime(transaction.updatedAt)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

