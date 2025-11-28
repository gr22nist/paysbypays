"use client";

import { useTranslation } from "@hua-labs/i18n-core";

// 통일된 결제수단 뱃지 스타일 (모든 결제수단에 동일하게 적용)
// 다크/라이트 모드에 맞게 조정된 색상
const UNIFIED_BADGE_CLASS =
  "border border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300";

// 하위 호환성을 위해 PAY_TYPE_BADGE_CLASSES 유지 (모두 통일된 스타일 사용)
const PAY_TYPE_BADGE_CLASSES = {
  CARD: UNIFIED_BADGE_CLASS,
  TERMINAL: UNIFIED_BADGE_CLASS,
  MOBILE: UNIFIED_BADGE_CLASS,
  BANK_TRANSFER: UNIFIED_BADGE_CLASS,
  VIRTUAL_ACCOUNT: UNIFIED_BADGE_CLASS,
  QR: UNIFIED_BADGE_CLASS,
  CASH: UNIFIED_BADGE_CLASS,
} as const;

type PayTypeKey = keyof typeof PAY_TYPE_BADGE_CLASSES;

const DEFAULT_BADGE = UNIFIED_BADGE_CLASS;

export function getPayTypeTranslationKey(type: string): string | null {
  if (!type) return null;
  
  const upperType = type.toUpperCase();
  
  const keyMap: Record<string, string> = {
    // 표준 결제 수단 코드 (대문자)
    CARD: "transactions:payTypes.card",
    TERMINAL: "transactions:payTypes.terminal",
    MOBILE: "transactions:payTypes.mobile",
    BANK_TRANSFER: "transactions:payTypes.bankTransfer",
    VIRTUAL_ACCOUNT: "transactions:payTypes.virtualAccount",
    VACT: "transactions:payTypes.virtualAccount", // VACT는 VIRTUAL_ACCOUNT의 약자
    QR: "transactions:payTypes.qr",
    CASH: "transactions:payTypes.cash",
    ONLINE: "transactions:payTypes.online",
    DEVICE: "transactions:payTypes.device",
    EASY_PAY: "transactions:payTypes.easyPay",
    SUBSCRIPTION: "transactions:payTypes.subscription",
    BILLING: "transactions:payTypes.subscription", // BILLING은 SUBSCRIPTION의 별칭
    
    // 한글 description 매핑 (API에서 한글로 오는 경우)
    신용카드: "transactions:payTypes.card",
    카드: "transactions:payTypes.card",
    단말기: "transactions:payTypes.terminal",
    모바일: "transactions:payTypes.mobile",
    계좌이체: "transactions:payTypes.bankTransfer",
    가상계좌: "transactions:payTypes.virtualAccount",
    QR코드: "transactions:payTypes.qr",
    현금: "transactions:payTypes.cash",
    온라인: "transactions:payTypes.online",
    디바이스: "transactions:payTypes.device",
    간편결제: "transactions:payTypes.easyPay",
    정기결제: "transactions:payTypes.subscription",
    정기구독: "transactions:payTypes.subscription",
    구독: "transactions:payTypes.subscription",
  };
  
  return keyMap[upperType] || keyMap[type] || null;
}

export interface PayTypeMeta {
  label: string;
  labelKey: string | undefined;
  badgeClass: string;
}

export function getPayTypeMeta(type?: string, fallbackLabel?: string): PayTypeMeta {
  const key = (type || "").toUpperCase() as PayTypeKey;
  const badgeClass = PAY_TYPE_BADGE_CLASSES[key] || DEFAULT_BADGE;
  
  // method로 먼저 번역 키 찾기
  let translationKey = getPayTypeTranslationKey(type || "");
  
  // method에서 번역 키를 찾지 못했고, fallbackLabel이 있으면 fallbackLabel로도 시도
  if (!translationKey && fallbackLabel) {
    translationKey = getPayTypeTranslationKey(fallbackLabel);
  }
  
  const labelKey: string | undefined = translationKey === null ? undefined : translationKey;

  return {
    label: fallbackLabel || type || "기타", // fallback용 (번역 실패 시 사용)
    labelKey, // 번역 키 (매핑되지 않은 경우 undefined)
    badgeClass,
  };
}

// useTranslation을 사용할 수 없는 경우를 위한 fallback 함수
export function getPayTypeFallbackLabel(type?: string): string {
  try {
    // 이 함수는 클라이언트 컴포넌트에서만 사용 가능
    if (typeof window === "undefined") return type || "기타";
    // 실제로는 PaymentMethodBadge에서 useTranslation을 사용하므로 여기서는 기본값만 반환
    return type || "기타";
  } catch {
    return type || "기타";
  }
}


