"use client";

import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { SettingsSelect } from "./SettingsSelect";
import type { LanguageCode } from "@/lib/i18n-config";

interface LanguageSectionProps {
  language: LanguageCode;
  dateFormat: "YYYY-MM-DD" | "YYYY/MM/DD" | "MM/DD/YYYY";
  currency: "KRW" | "USD" | "JPY";
  onLanguageChange: (language: LanguageCode) => void;
  onDateFormatChange: (format: "YYYY-MM-DD" | "YYYY/MM/DD" | "MM/DD/YYYY") => void;
  onCurrencyChange: (currency: "KRW" | "USD" | "JPY") => void;
}

export function LanguageSection({
  language,
  dateFormat,
  currency,
  onLanguageChange,
  onDateFormatChange,
  onCurrencyChange,
}: LanguageSectionProps) {
  const { t } = useTranslation();

  const languageOptions: Array<{ value: LanguageCode; label: string }> = [
    { value: "ko", label: `${t("common:language.ko")} (KO)` },
    { value: "en", label: `${t("common:language.en")} (EN)` },
    { value: "ja", label: `${t("common:language.ja")} (JA)` },
  ];

  const dateFormatOptions = [
    { value: "YYYY-MM-DD", label: t("settings:dateFormats.YYYY-MM-DD") },
    { value: "YYYY/MM/DD", label: t("settings:dateFormats.YYYY_MM_DD") },
    { value: "MM/DD/YYYY", label: t("settings:dateFormats.MM_DD_YYYY") },
  ];

  const currencyOptions = [
    { value: "KRW", label: t("settings:currencies.KRW") },
    { value: "USD", label: t("settings:currencies.USD") },
    { value: "JPY", label: t("settings:currencies.JPY") },
  ];

  return (
    <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm">
      <SectionHeaderBlock
        title={t("settings:sections.language.title")}
        description={t("settings:sections.language.description")}
        containerClassName="px-6 pt-6"
      />

      <div className="px-6 pb-6 pt-4 space-y-5">
        <SettingsSelect
          label={t("settings:labels.interfaceLanguage")}
          value={language}
          onChange={(event) =>
            onLanguageChange(event.target.value as LanguageCode)
          }
          options={languageOptions}
        />
        <SettingsSelect
          label={t("settings:labels.dateFormat")}
          value={dateFormat}
          onChange={(event) => onDateFormatChange(event.target.value as "YYYY-MM-DD" | "YYYY/MM/DD" | "MM/DD/YYYY")}
          options={dateFormatOptions}
        />
        <SettingsSelect
          label={t("settings:labels.currency")}
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value as "KRW" | "USD" | "JPY")}
          options={currencyOptions}
        />
      </div>
    </div>
  );
}

