"use client";

import { useTranslation } from "@hua-labs/i18n-core";
import { usePreferencesStore } from "@/store/preferences-store";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ThemeSection } from "@/components/settings/ThemeSection";
import { LivePreview } from "@/components/settings/LivePreview";
import { LanguageSection } from "@/components/settings/LanguageSection";
import { AccessibilitySection } from "@/components/settings/AccessibilitySection";


export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    dateFormat,
    setDateFormat,
    currency: preferredCurrency,
    setCurrency,
    fontScale,
    setFontScale,
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
  } = usePreferencesStore();


  return (
    <DashboardLayout
      title={t("settings:page.title")}
      description={t("settings:page.description")}
      activeItem="settings"
      showPreferenceBadges
    >
      <div className="flex flex-col gap-6">
        {/* 테마 & 타이포그래피 섹션 */}
        <section className="grid gap-6 lg:grid-cols-3">
          <ThemeSection
            theme={theme}
            fontScale={fontScale}
            onThemeChange={setTheme}
            onFontScaleChange={setFontScale}
          />

          {/* 미리보기 패널 */}
          <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm">
            <div className="p-6">
              <LivePreview fontScale={fontScale} />
            </div>
          </div>
        </section>

        {/* 지역 및 데이터 형식, 접근성 섹션 */}
        <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          <LanguageSection
            language={language}
            dateFormat={dateFormat}
            currency={preferredCurrency}
            onLanguageChange={setLanguage}
            onDateFormatChange={setDateFormat}
            onCurrencyChange={setCurrency}
          />

          <AccessibilitySection
            highContrast={highContrast}
            reducedMotion={reducedMotion}
            onToggleHighContrast={toggleHighContrast}
            onToggleReducedMotion={toggleReducedMotion}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
