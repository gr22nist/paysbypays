"use client";

import { useTranslation } from "@hua-labs/i18n-core";
import { getPayTypeMeta } from "@/data/pay-types";

type BadgeSize = "sm" | "md";

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: "px-2.5 py-0.5 text-[11px]",
  md: "px-3 py-1 text-xs",
};

export interface PaymentMethodBadgeProps {
  method?: string | null;
  fallbackLabel?: string | null;
  size?: BadgeSize;
  className?: string;
}

export function PaymentMethodBadge({
  method,
  fallbackLabel,
  size = "md",
  className = "",
}: PaymentMethodBadgeProps) {
  const { t } = useTranslation();
  
  if (!method && !fallbackLabel) {
    return <span className="text-xs text-gray-400 dark:text-gray-500">-</span>;
  }

  // 디버깅: 실제 결제수단 코드 확인
  if (method && (method.toUpperCase().includes("VIRTUAL") || method.toUpperCase().includes("SUBSCRIPTION") || method.toUpperCase().includes("VACT") || method.toUpperCase().includes("SUB") || method === "가상계좌" || method === "정기결제")) {
    console.log("🔍 PaymentMethodBadge - 결제수단 코드:", {
      method,
      fallbackLabel,
      upperMethod: method.toUpperCase(),
      hasTranslationKey: !!getPayTypeMeta(method ?? undefined, fallbackLabel ?? undefined).labelKey
    });
  }

  const meta = getPayTypeMeta(method ?? undefined, fallbackLabel ?? undefined);
  
  // 번역 키를 우선 사용, 그 다음 fallbackLabel, 마지막으로 원본 method
  const displayLabel = meta.labelKey 
    ? t(meta.labelKey)
    : (fallbackLabel 
      ? fallbackLabel
      : (method || t("transactions:payTypes.other")));

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${SIZE_STYLES[size]} ${meta.badgeClass} ${className}`.trim()}
    >
      {displayLabel}
    </span>
  );
}

