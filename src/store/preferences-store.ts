"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LanguageCode } from "@/lib/i18n-config";

export type ThemeMode = "light" | "dark" | "system";
export type FontScale = "small" | "medium" | "large" | "xlarge";

interface PreferencesState {
  theme: ThemeMode;
  language: LanguageCode;
  dateFormat: "YYYY-MM-DD" | "YYYY/MM/DD" | "MM/DD/YYYY";
  currency: "KRW" | "USD" | "JPY";
  fontScale: FontScale;
  highContrast: boolean;
  reducedMotion: boolean;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: LanguageCode) => void;
  setDateFormat: (format: PreferencesState["dateFormat"]) => void;
  setCurrency: (currency: PreferencesState["currency"]) => void;
  setFontScale: (scale: FontScale) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
}

export const FONT_SCALE_MAP: Record<FontScale, number> = {
  small: 0.95,
  medium: 1,
  large: 1.08,
  xlarge: 1.15,
};

// 언어별 기본 통화 매핑
const LANGUAGE_CURRENCY_MAP: Record<LanguageCode, "KRW" | "USD" | "JPY"> = {
  ko: "KRW",
  en: "USD",
  ja: "JPY",
};

const initialState: Omit<PreferencesState, "setTheme" | "setLanguage" | "setDateFormat" | "setCurrency" | "setFontScale" | "toggleHighContrast" | "toggleReducedMotion"> = {
  theme: "system",
  language: "ko",
  dateFormat: "YYYY-MM-DD",
  currency: "KRW",
  fontScale: "medium",
  highContrast: false,
  reducedMotion: false,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initialState,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => {
        // 언어 변경 시 해당 언어의 기본 통화로 자동 변경
        const defaultCurrency = LANGUAGE_CURRENCY_MAP[language];
        set({ language, currency: defaultCurrency });
      },
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setCurrency: (currency) => set({ currency }),
      setFontScale: (fontScale) => set({ fontScale }),
      toggleHighContrast: () =>
        set((state) => ({
          highContrast: !state.highContrast,
        })),
      toggleReducedMotion: () =>
        set((state) => ({
          reducedMotion: !state.reducedMotion,
        })),
    }),
    {
      name: "dashboard-preferences",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => window.localStorage)
          : undefined,
    }
  )
);

