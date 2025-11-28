"use client";

import { useMemo } from "react";
import { useTranslation } from "@hua-labs/i18n-core";
import { useMerchant } from "@/hooks/useMerchant";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { useCommonCodes } from "@/hooks/useCommonCodes";
import { getPayTypeTranslationKey } from "@/data/pay-types";
import type { Transaction } from "@/lib/api/types";
import { TransactionStatusBadge } from "@/components/badges/TransactionStatusBadge";
import { PaymentMethodBadge } from "@/components/badges/PaymentMethodBadge";
import { DetailDrawer, type DetailSection, type DetailAction, type DetailField } from "@/components/common/DetailDrawer";
import { getMerchantStatusMeta } from "@/data/merchant-status";

interface TransactionDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function TransactionDetailDrawer({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailDrawerProps) {
  const { t } = useTranslation();
  const { formatCurrency, formatDateTime } = useDisplayFormat();
  const { payTypes } = useCommonCodes();
  type TransactionWithMchtCode = Transaction & { mchtCode?: string };
  
  const transactionWithMchtCode = transaction as TransactionWithMchtCode | null;
  const mchtCode = transactionWithMchtCode?.mchtCode || transaction?.merchantId;
  const { data: merchant } = useMerchant(mchtCode || "");

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
  const sections = useMemo((): DetailSection[] => {
    if (!transaction) return [];
    
    const paymentMethodValue = transaction.paymentMethod || transaction.payType || "";

    const transactionFields: DetailField[] = [
      {
        label: t("transactions:detail.transactionCodeLabel"),
        value: <span className="font-mono">{transaction.id}</span>,
      },
      {
        label: t("transactions:detail.transactionAmount"),
        value: (
          <span className="text-base sm:text-lg font-semibold text-brand-primary">
            {formatCurrency(transaction.amount || 0)}
            {transaction.currency && (
              <span className="text-xs sm:text-sm font-normal text-[var(--text-subtle)] ml-1">
                {transaction.currency}
              </span>
            )}
          </span>
        ),
        span: 2,
      },
      {
        label: t("transactions:detail.transactionStatus"),
        value: <TransactionStatusBadge status={transaction.status} size="sm" />,
      },
      {
        label: t("transactions:detail.paymentMethod"),
        value: (
          <PaymentMethodBadge
            method={transaction.paymentMethod || transaction.payType}
            fallbackLabel={payTypeMap.get((transaction.paymentMethod || transaction.payType || "").toUpperCase())}
            size="sm"
          />
        ),
      },
      {
        label: t("transactions:detail.paymentTime"),
        value: formatDateTime(transaction.createdAt || ""),
        span: 2,
      },
    ];

    if (transaction.updatedAt && transaction.updatedAt !== transaction.createdAt) {
      transactionFields.push({
        label: t("transactions:detail.updatedTime"),
        value: formatDateTime(transaction.updatedAt),
      });
    }

    const result: DetailSection[] = [
      {
        title: t("transactions:detail.transactionInfo"),
        fields: transactionFields,
      },
    ];

    if (mchtCode) {
      const merchantFields: DetailField[] = [];
      
      if (merchant) {
        const statusMeta = getMerchantStatusMeta(merchant.status);
        merchantFields.push(
          {
            label: t("transactions:detail.merchantCode"),
            value: <span className="font-mono">{merchant.mchtCode}</span>,
          },
          {
            label: t("transactions:detail.merchantName"),
            value: merchant.mchtName,
          },
          {
            label: t("transactions:detail.merchantStatus"),
            value: (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
              >
                {t(statusMeta.labelKey)}
              </span>
            ),
          }
        );
        
        if (merchant.bizType) {
          merchantFields.push({
            label: t("transactions:detail.businessType"),
            value: merchant.bizType,
          });
        }
      } else {
        merchantFields.push({
          label: t("transactions:detail.loadingMerchant"),
          value: (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-[var(--border-subtle)] border-t-brand-primary rounded-full animate-spin" />
              <span className="text-[var(--text-subtle)] text-sm">{t("common:states.loading")}</span>
            </div>
          ),
          span: 2,
        });
      }

      result.push({
        title: t("transactions:detail.merchantInfo"),
        fields: merchantFields,
      });
    }

    return result;
  }, [transaction, merchant, mchtCode, formatCurrency, formatDateTime, t, payTypeMap]);

  const actions: DetailAction[] = useMemo(() => {
    if (!transaction) return [];
    
    const result: DetailAction[] = [
      {
        label: t("transactions:detail.viewDetailPage"),
        href: `/transactions/${transaction.id}`,
        icon: "externalLink",
      },
    ];

    if (mchtCode) {
      result.push(
        {
          label: t("transactions:detail.viewMerchantDetail"),
          href: `/merchants/${mchtCode}`,
          icon: "externalLink",
        },
        {
          label: t("transactions:detail.viewMerchantTransactions"),
          href: `/transactions?mchtCode=${encodeURIComponent(mchtCode)}`,
          icon: "list",
        }
      );
    } else {
      result.push({
        label: t("transactions:detail.viewAllTransactions"),
        href: "/transactions",
        icon: "list",
      });
    }

    return result;
  }, [transaction, mchtCode, t]);

  if (!transaction) return null;

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t("transactions:detail.title")}
      subtitle={`${t("transactions:detail.transactionCode")}: ${transaction.id}`}
      sections={sections}
      actions={actions}
    />
  );
}

