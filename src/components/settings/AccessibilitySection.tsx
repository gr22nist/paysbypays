"use client";

import { useTranslation } from "@hua-labs/i18n-core";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { PreferenceToggle } from "./PreferenceToggle";

interface AccessibilitySectionProps {
  highContrast: boolean;
  reducedMotion: boolean;
  onToggleHighContrast: () => void;
  onToggleReducedMotion: () => void;
}

export function AccessibilitySection({
  highContrast,
  reducedMotion,
  onToggleHighContrast,
  onToggleReducedMotion,
}: AccessibilitySectionProps) {
  const { t } = useTranslation();

  return (
    <div className="micro-card rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm">
      <SectionHeaderBlock
        title={t("settings:sections.accessibility.title")}
        description={t("settings:sections.accessibility.description")}
        containerClassName="px-6 pt-6"
      />

      <div className="px-6 pb-6 pt-4 space-y-4">
        <PreferenceToggle
          label={t("settings:sections.accessibility.highContrast.label")}
          description={t("settings:sections.accessibility.highContrast.description")}
          checked={highContrast}
          onChange={onToggleHighContrast}
        />
        <PreferenceToggle
          label={t("settings:sections.accessibility.reducedMotion.label")}
          description={t("settings:sections.accessibility.reducedMotion.description")}
          checked={reducedMotion}
          onChange={onToggleReducedMotion}
        />
      </div>
    </div>
  );
}

