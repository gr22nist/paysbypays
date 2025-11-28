"use client";

import { useCallback, useMemo } from "react";
import { usePreferencesStore } from "@/store/preferences-store";

type CurrencyFormatOptions = {
  notation?: "standard" | "compact";
  maximumFractionDigits?: number;
  sourceCurrency?: "KRW" | "USD" | "JPY"; // 원본 통화 (기본값: KRW)
};

// 환율 (KRW 기준)
const EXCHANGE_RATES = {
  KRW: 1,
  USD: 1470, // 1 USD = 1,470 KRW
  JPY: 9, // 1 JPY = 9 KRW (약 1,470 / 160)
} as const;

/**
 * 통화 변환 함수
 * @param amount 원본 금액
 * @param from 원본 통화 (기본값: KRW)
 * @param to 대상 통화
 * @returns 변환된 금액
 */
function convertCurrency(
  amount: number,
  from: "KRW" | "USD" | "JPY" = "KRW",
  to: "KRW" | "USD" | "JPY"
): number {
  if (from === to) return amount;
  
  // 먼저 KRW로 변환
  const amountInKRW = amount * EXCHANGE_RATES[from];
  
  // 그 다음 대상 통화로 변환
  return amountInKRW / EXCHANGE_RATES[to];
}

export function useDisplayFormat() {
  // Subscribe to individual slices to avoid returning a new object on every render,
  // which was causing getSnapshot to loop.
  const language = usePreferencesStore((state) => state.language);
  const currency = usePreferencesStore((state) => state.currency);
  const dateFormat = usePreferencesStore((state) => state.dateFormat);

  const localeMap: Record<typeof language, string> = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
  };
  const locale = localeMap[language] ?? "en-US";
  const maxFractionDigits = currency === "JPY" ? 0 : 2;

  const standardFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: maxFractionDigits,
      }),
    [locale, currency, maxFractionDigits]
  );

  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    [locale, currency]
  );

  const formatCurrency = useCallback(
    (value: number, options: CurrencyFormatOptions = {}) => {
      if (Number.isNaN(value) || value === undefined || value === null) {
        return standardFormatter.format(0);
      }

      // 통화 변환 (기본값: KRW -> 선택된 통화)
      const sourceCurrency = options.sourceCurrency || "KRW";
      const convertedValue = convertCurrency(value, sourceCurrency, currency);

      const formatter =
        options.notation === "compact" ? compactFormatter : standardFormatter;

      if (typeof options.maximumFractionDigits === "number") {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          notation: options.notation === "compact" ? "compact" : "standard",
          maximumFractionDigits: options.maximumFractionDigits,
        }).format(convertedValue);
      }

      return formatter.format(convertedValue);
    },
    [standardFormatter, compactFormatter, locale, currency]
  );

  const formatDate = useCallback(
    (input: Date | string | number) => {
      const date = input instanceof Date ? input : new Date(input);
      if (Number.isNaN(date.getTime())) return "-";

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      switch (dateFormat) {
        case "YYYY/MM/DD":
          return `${yyyy}/${mm}/${dd}`;
        case "MM/DD/YYYY":
          return `${mm}/${dd}/${yyyy}`;
        default:
          return `${yyyy}-${mm}-${dd}`;
      }
    },
    [dateFormat]
  );

  const formatDateTime = useCallback(
    (input: Date | string | number) => {
      const date = input instanceof Date ? input : new Date(input);
      if (Number.isNaN(date.getTime())) return "-";

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      const datePart = (() => {
        switch (dateFormat) {
          case "YYYY/MM/DD":
            return `${yyyy}/${mm}/${dd}`;
          case "MM/DD/YYYY":
            return `${mm}/${dd}/${yyyy}`;
          default:
            return `${yyyy}-${mm}-${dd}`;
        }
      })();

      return `${datePart} ${hours}:${minutes}`;
    },
    [dateFormat]
  );

  return {
    locale,
    currency,
    dateFormat,
    formatCurrency,
    formatDate,
    formatDateTime,
  };
}

