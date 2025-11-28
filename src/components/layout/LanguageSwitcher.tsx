"use client";

import { useCallback, useEffect } from "react";
import { Icon } from "@hua-labs/ui";
import { useLanguageChange, useTranslation } from "@hua-labs/i18n-core";
import {
  SUPPORTED_LANGUAGE_CODES,
  type LanguageCode,
  preloadTranslations,
} from "@/lib/i18n-config";
import { usePreferencesStore } from "@/store/preferences-store";

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { currentLanguage = "ko", changeLanguage } = useLanguageChange();
  const preferenceLanguage = usePreferencesStore((state) => state.language);
  const setLanguagePreference = usePreferencesStore((state) => state.setLanguage);

  useEffect(() => {
    if (
      currentLanguage &&
      preferenceLanguage &&
      currentLanguage !== preferenceLanguage
    ) {
      setLanguagePreference(currentLanguage as LanguageCode);
    }
  }, [currentLanguage, preferenceLanguage, setLanguagePreference]);

  const toggleLanguage = useCallback(async () => {
    const order = SUPPORTED_LANGUAGE_CODES;
    const currentIndex = order.indexOf(currentLanguage as LanguageCode);
    const nextLanguage =
      order[(currentIndex + 1) % order.length] ?? order[0];

    await preloadTranslations(nextLanguage);
    changeLanguage(nextLanguage);
    setLanguagePreference(nextLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("language", nextLanguage);
    }
  }, [changeLanguage, currentLanguage, setLanguagePreference]);

  const labelKey = `common:language.${currentLanguage}`;

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="micro-button inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] shadow-sm transition hover:border-brand-primary/50 hover:text-brand-primary"
      aria-label={t("layout:languageSwitcher.label")}
    >
      <Icon name="globe" size={16} />
      <span className="hidden sm:inline">{t(labelKey)}</span>
    </button>
  );
}

