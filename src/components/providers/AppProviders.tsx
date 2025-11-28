"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, useTheme } from "@hua-labs/ui";
import { FONT_SCALE_MAP, usePreferencesStore } from "@/store/preferences-store";
import {
  createClientI18nProvider,
  preloadTranslations,
  warmFallbackLanguage,
} from "@/lib/i18n-config";

interface AppProvidersProps {
  children: ReactNode;
}

function ThemeSyncBridge() {
  const selectedTheme = usePreferencesStore((state) => state.theme);
  const { setTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    // 초기 시스템 테마 감지 (SSR 안전)
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // 시스템 테마 감지
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (matches: boolean) => setSystemTheme(matches ? "dark" : "light");
    const handleChange = (event: MediaQueryListEvent) => apply(event.matches);

    apply(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // 실제 적용될 테마 계산
  const effectiveTheme =
    selectedTheme === "system" ? systemTheme : selectedTheme;

  // Zustand store의 테마 변경을 ThemeProvider에 동기화
  // effectiveTheme이 변경될 때마다 ThemeProvider에 반영
  useEffect(() => {
    setTheme(effectiveTheme);
  }, [effectiveTheme, setTheme]);

  // DOM에 테마 적용 (ThemeProvider와 별도로 직접 적용하여 즉시 반영)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", effectiveTheme === "dark");
    root.dataset.theme = effectiveTheme;
  }, [effectiveTheme]);

  return null;
}

function AccessibilitySyncBridge() {
  const fontScale = usePreferencesStore((state) => state.fontScale);
  const highContrast = usePreferencesStore((state) => state.highContrast);
  const reducedMotion = usePreferencesStore((state) => state.reducedMotion);

  // 폰트 스케일 적용
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--font-scale", String(FONT_SCALE_MAP[fontScale]));
  }, [fontScale]);

  // 고대비 모드 적용 (초기 렌더링 시에도 즉시 적용)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.dataset.contrast = highContrast ? "high" : "normal";
    // 고대비 모드가 켜지면 즉시 반영되도록 강제
    if (highContrast) {
      root.setAttribute("data-contrast", "high");
    } else {
      root.removeAttribute("data-contrast");
    }
  }, [highContrast]);

  // 감소된 모션 적용
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.dataset.motion = reducedMotion ? "reduce" : "normal";
  }, [reducedMotion]);

  return null;
}

function I18nBridge({ children }: { children: ReactNode }) {
  const language = usePreferencesStore((state) => state.language);
  const I18nProvider = useMemo(
    () => createClientI18nProvider(language),
    [language]
  );

  // 초기 마운트 및 언어 변경 시 모든 네임스페이스를 미리 로드
  useEffect(() => {
    // 모든 네임스페이스를 비동기로 로드 (블로킹하지 않음)
    if (process.env.NODE_ENV === "development") {
      console.log(`[i18n] Preloading translations for language: ${language}`);
    }
    preloadTranslations(language)
      .then(() => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[i18n] Preloaded all namespaces for language: ${language}`);
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[i18n] Failed to preload translations", error);
        }
      });
  }, [language]);

  // 추가로 fallback 언어도 워밍업 (비동기, 블로킹하지 않음)
  useEffect(() => {
    warmFallbackLanguage(language);
  }, [language]);

  // i18n-core가 자동으로 네임스페이스를 로드하므로 바로 렌더링
  // Missing Key는 초기 로딩 중에만 발생하고, 로드되면 자동으로 해결됨
  return <I18nProvider>{children}</I18nProvider>;
}

export function AppProviders({ children }: AppProvidersProps) {
  const theme = usePreferencesStore((state) => state.theme);
  // ThemeProvider의 초기 테마는 Zustand store에서 가져오되, system일 경우 light로 설정
  const initialTheme = theme === "system" ? "light" : theme;

  return (
    <I18nBridge>
      <ThemeProvider
        defaultTheme={initialTheme}
        storageKey="dashboard-theme-ui" // ThemeProvider의 localStorage 키를 별도로 설정 (Zustand와 분리)
        enableSystem={false} // system 모드는 Zustand store에서 직접 처리
      >
        <ThemeSyncBridge />
        <AccessibilitySyncBridge />
        {children}
      </ThemeProvider>
    </I18nBridge>
  );
}

