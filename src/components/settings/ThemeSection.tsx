"use client";

import { Icon, type IconName } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import type { ThemeMode, FontScale } from "@/store/preferences-store";
import { FONT_SCALE_MAP } from "@/store/preferences-store";

interface ThemeSectionProps {
  theme: ThemeMode;
  fontScale: FontScale;
  onThemeChange: (theme: ThemeMode) => void;
  onFontScaleChange: (scale: FontScale) => void;
}

export function ThemeSection({
  theme,
  fontScale,
  onThemeChange,
  onFontScaleChange,
}: ThemeSectionProps) {
  const { t } = useTranslation();

  const themeOptions: Array<{
    value: ThemeMode;
    label: string;
    description: string;
    icon: IconName;
  }> = [
    {
      value: "system",
      label: t("settings:sections.theme.options.system.label"),
      description: t("settings:sections.theme.options.system.description"),
      icon: "monitor",
    },
    {
      value: "light",
      label: t("settings:sections.theme.options.light.label"),
      description: t("settings:sections.theme.options.light.description"),
      icon: "sun",
    },
    {
      value: "dark",
      label: t("settings:sections.theme.options.dark.label"),
      description: t("settings:sections.theme.options.dark.description"),
      icon: "moon",
    },
  ];

  const fontScaleOptions: Array<{
    value: FontScale;
    label: string;
    description: string;
  }> = [
    {
      value: "small",
      label: t("settings:fontScale.small.label"),
      description: t("settings:fontScale.small.description"),
    },
    {
      value: "medium",
      label: t("settings:fontScale.medium.label"),
      description: t("settings:fontScale.medium.description"),
    },
    {
      value: "large",
      label: t("settings:fontScale.large.label"),
      description: t("settings:fontScale.large.description"),
    },
    {
      value: "xlarge",
      label: t("settings:fontScale.xlarge.label"),
      description: t("settings:fontScale.xlarge.description"),
    },
  ];

  return (
    <div className="micro-card lg:col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm">
      <SectionHeaderBlock
        title={t("settings:sections.theme.title")}
        description={t("settings:sections.theme.description")}
        containerClassName="px-6 pt-6"
      />

      <div className="px-6 pb-6 pt-4 space-y-8">
        {/* 테마 선택 */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)] mb-4">
            {t("settings:sections.theme.interfaceThemeLabel")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {themeOptions.map((option) => {
              const isSelected = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onThemeChange(option.value)}
                  className={`micro-button relative rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-brand-primary bg-brand-primary-soft/30 shadow-sm ring-2 ring-brand-primary/20"
                      : "border-[var(--border-subtle)] hover:border-brand-primary/40 hover:bg-[var(--surface-muted)]/50"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-3 top-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary">
                        <Icon name="check" size={12} className="text-white" />
                      </div>
                    </div>
                  )}
                  <div className={`mb-3 flex items-center gap-2 ${isSelected ? "text-brand-primary" : "text-[var(--text-muted)]"}`}>
                    <Icon name={option.icon} size={16} />
                    <span className={`text-xs font-semibold uppercase tracking-wide ${isSelected ? "text-brand-primary" : "text-[var(--text-subtle)]"}`}>
                      {option.value}
                    </span>
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${isSelected ? "text-[var(--text-strong)]" : "text-[var(--text-muted)]"}`}>
                      {option.label}
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-subtle)]">
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 폰트 스케일 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
              {t("settings:sections.theme.fontScaleLabel")}
            </p>
            <span className="text-xs font-mono font-semibold text-brand-secondary">
              {Math.round(FONT_SCALE_MAP[fontScale] * 100)}%
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {fontScaleOptions.map((option) => {
              const isActive = option.value === fontScale;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onFontScaleChange(option.value)}
                  className={`micro-button relative rounded-xl border p-4 text-left transition-all ${
                    isActive
                      ? "border-brand-secondary bg-brand-secondary-soft shadow-sm ring-2 ring-brand-secondary/20"
                      : "border-[var(--border-subtle)] bg-[var(--surface)] hover:border-brand-secondary/40 hover:bg-[var(--surface-muted)]/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute right-3 top-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-secondary">
                        <Icon name="check" size={12} className="text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-semibold ${isActive ? "text-[var(--text-strong)]" : "text-[var(--text-muted)]"}`}>
                      {option.label}
                    </p>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {Math.round(FONT_SCALE_MAP[option.value] * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-subtle)]">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

