"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { Sidebar } from "@/components/layout/Sidebar";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { usePreferencesStore, type ThemeMode } from "@/store/preferences-store";
import { useUIStore } from "@/store/ui-store";
import { AlertBanner } from "@/components/dashboard/AlertBanner";

interface DashboardLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  activeItem?: string;
  actions?: ReactNode;
  maxWidth?: "default" | "full";
  showPreferenceBadges?: boolean;
}

const widthClassMap = {
  default: "max-w-[1920px]",
  full: "max-w-none",
} as const;

export function DashboardLayout({
  title,
  description,
  children,
  actions,
  activeItem,
  maxWidth = "default",
  showPreferenceBadges = false,
}: DashboardLayoutProps) {
  const contentWidth = widthClassMap[maxWidth];

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--text-strong)]">
      <div className="sticky top-0 h-screen overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--surface)]">
        <Sidebar activeItem={activeItem} />
      </div>

      <div className="flex flex-1 flex-col">
        <DashboardHeader
          title={title}
          description={description}
          actions={actions}
          showPreferenceBadges={showPreferenceBadges}
          activeItem={activeItem}
        />

        <main className="flex-1 overflow-y-auto bg-[var(--background)]">
          <div className={`mx-auto w-full px-6 py-8 ${contentWidth}`}>
            {children}
          </div>
        </main>
      </div>

      {/* 플로팅 알림 - CLS 방지를 위해 fixed position 사용 */}
      <AlertBanner />
    </div>
  );
}

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  showPreferenceBadges?: boolean;
  activeItem?: string;
}

function DashboardHeader({
  title,
  description,
  actions,
  showPreferenceBadges,
  activeItem,
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const showBackButton = activeItem !== "dashboard";
  
  return (
    <header
      className="relative z-10 border-b border-[var(--border-subtle)] bg-[var(--surface)]/80 backdrop-blur-md"
      style={{ minHeight: "var(--header-height)" }}
    >
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-primary">
            {t("layout:header.tagline")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">{title}</h1>
          {description && (
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-subtle)]">{description}</p>
          )}
          {showPreferenceBadges && <PreferenceBadges />}
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {showBackButton && <BackButton />}
          <MobileSidebarButton />
          {actions}
          {showPreferenceBadges && (
            <>
              <LanguageSwitcher />
              <ThemeQuickToggle />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function PreferenceBadges() {
  const { t } = useTranslation();
  const language = usePreferencesStore((state) => state.language);
  const dateFormat = usePreferencesStore((state) => state.dateFormat);
  const currency = usePreferencesStore((state) => state.currency);

  const languageLabel = t(
    `common:language.${language ?? "ko"}`
  );

  const badges = [
    { label: t("layout:header.languageBadge"), value: languageLabel },
    { label: t("layout:header.dateBadge"), value: dateFormat },
    { label: t("layout:header.currencyBadge"), value: currency },
  ];

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={`${badge.label}-${badge.value}`}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 px-3 py-1 text-xs font-medium text-[var(--text-muted)]"
        >
          <span className="text-[var(--text-strong)]">{badge.value}</span>
          <span className="text-[var(--text-subtle)]/80">{badge.label}</span>
        </span>
      ))}
    </div>
  );
}

const THEME_ICON: Record<ThemeMode, "sun" | "moon" | "monitor"> = {
  light: "sun",
  dark: "moon",
  system: "monitor",
};

function ThemeQuickToggle() {
  const { t } = useTranslation();
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const order: ThemeMode[] = ["light", "dark", "system"];
  const nextTheme = order[(order.indexOf(theme) + 1) % order.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="micro-button inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-strong)] shadow-sm transition hover:border-brand-primary/50 hover:text-brand-primary"
      aria-label={t("layout:header.themeToggle.label")}
    >
      <Icon name={THEME_ICON[theme]} size={16} />
      <span className="hidden sm:inline">{t(`layout:header.themeToggle.${theme}`)}</span>
    </button>
  );
}

function MobileSidebarButton() {
  const { t } = useTranslation();
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);

  return (
    <button
      type="button"
      className="micro-button inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] shadow-sm transition hover:border-brand-primary/50 hover:text-brand-primary xl:hidden"
      onClick={() => setSidebarCollapsed(false)}
      aria-label={t("layout:sidebar.aria.open")}
    >
      <Icon name="menu" size={18} />
    </button>
  );
}

function BackButton() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className="micro-button inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] shadow-sm transition hover:border-brand-primary hover:text-brand-primary"
      aria-label={t("layout:header.back")}
    >
      <Icon name="arrowLeft" size={18} />
    </button>
  );
}


