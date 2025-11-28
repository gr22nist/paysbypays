"use client";

import { useMemo } from "react";
import { useTranslation } from "@hua-labs/i18n-core";
import { useMerchant } from "@/hooks/useMerchant";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import { getMerchantStatusMeta } from "@/data/merchant-status";
import { DetailDrawer, formatDateString, type DetailSection, type DetailAction, type DetailField } from "@/components/common/DetailDrawer";
import type { MerchantListRes } from "@/lib/api/types";

interface MerchantDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: MerchantListRes | null;
}

type MerchantDetail = MerchantListRes & {
  bizNo?: string;
  address?: string;
  phone?: string;
  email?: string;
  registeredAt?: string;
  updatedAt?: string;
};

export function MerchantDetailDrawer({
  open,
  onOpenChange,
  merchant,
}: MerchantDetailDrawerProps) {
  const { t } = useTranslation();
  const { formatDate } = useDisplayFormat();
  const mchtCode = merchant?.mchtCode || "";
  const { data: merchantDetail, isLoading } = useMerchant(mchtCode);

  const sections = useMemo((): DetailSection[] => {
    if (!merchant) return [];
    
    const statusMeta = getMerchantStatusMeta(merchant.status);
    const detail = merchantDetail || merchant;
    const merchantDetailTyped = detail as MerchantDetail;
    const formattedRegisteredAt = formatDateString(merchantDetailTyped.registeredAt, formatDate);
    const formattedUpdatedAt = formatDateString(merchantDetailTyped.updatedAt, formatDate);
    const basicInfoFields: DetailField[] = [
      {
        label: t("merchants:drawer.fields.mchtCode"),
        value: <span className="font-mono">{detail.mchtCode}</span>,
      },
      {
        label: t("merchants:drawer.fields.mchtName"),
        value: detail.mchtName,
      },
      {
        label: t("merchants:drawer.fields.status"),
        value: (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
          >
            {t(statusMeta.labelKey)}
          </span>
        ),
      },
      {
        label: t("merchants:drawer.fields.bizType"),
        value: detail.bizType || "-",
      },
    ];

    const contactFields: DetailField[] = [];
    if (merchantDetailTyped.bizNo) {
      contactFields.push({
        label: t("merchants:drawer.fields.bizNo"),
        value: merchantDetailTyped.bizNo,
      });
    }
    if (merchantDetailTyped.address) {
      contactFields.push({
        label: t("merchants:drawer.fields.address"),
        value: merchantDetailTyped.address,
        span: 2,
      });
    }
    if (merchantDetailTyped.phone) {
      contactFields.push({
        label: t("merchants:drawer.fields.phone"),
        value: merchantDetailTyped.phone,
      });
    }
    if (merchantDetailTyped.email) {
      contactFields.push({
        label: t("merchants:drawer.fields.email"),
        value: merchantDetailTyped.email,
      });
    }

    const timestampFields: DetailField[] = [];
    if (merchantDetailTyped.registeredAt) {
      timestampFields.push({
        label: t("merchants:drawer.fields.registeredAt"),
        value: formattedRegisteredAt,
      });
    }
    if (merchantDetailTyped.updatedAt) {
      timestampFields.push({
        label: t("merchants:drawer.fields.updatedAt"),
        value: formattedUpdatedAt,
      });
    }

    const result: DetailSection[] = [
      {
        title: t("merchants:drawer.sections.basicInfo"),
        fields: basicInfoFields,
      },
    ];

    if (!isLoading && contactFields.length > 0) {
      result.push({
        title: t("merchants:drawer.sections.contactInfo"),
        fields: contactFields,
      });
    }

    if (!isLoading && timestampFields.length > 0) {
      result.push({
        title: t("merchants:drawer.sections.timestamps"),
        fields: timestampFields,
      });
    }

    return result;
  }, [merchant, merchantDetail, isLoading, t, formatDate]);

  const actions: DetailAction[] = useMemo(
    () => {
      if (!merchant) return [];
      return [
        {
          label: t("merchants:drawer.actions.viewDetail"),
          href: `/merchants/${merchant.mchtCode}`,
          icon: "externalLink",
        },
        {
          label: t("merchants:drawer.actions.viewTransactions"),
          href: `/transactions?mchtCode=${encodeURIComponent(merchant.mchtCode)}`,
          icon: "list",
        },
      ];
    },
    [merchant, t]
  );

  if (!merchant) return null;

  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t("merchants:drawer.title")}
      subtitle={`${t("merchants:drawer.subtitle")}: ${merchant.mchtCode}`}
      sections={sections}
      actions={actions}
      loading={isLoading}
    />
  );
}

