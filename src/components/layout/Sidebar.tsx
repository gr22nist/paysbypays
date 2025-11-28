"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@hua-labs/ui";
import type { IconName } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { useUIStore } from "@/store/ui-store";
import { LogoutConfirmModal } from "@/components/common/LogoutConfirmModal";

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 264;
const MOBILE_BREAKPOINT = 1024;
const AUTO_COLLAPSE_BREAKPOINT = 1280;
const FAVORITE_LIMIT = 5;

interface SidebarItemConfig {
  id: string;
  labelKey: string;
  href: string;
  icon: IconName;
}

interface SidebarSection {
  id: string;
  labelKey: string;
  items: SidebarItemConfig[];
}

const sidebarSections: SidebarSection[] = [
  {
    id: "overview",
    labelKey: "layout:sidebar.sections.overview",
    items: [
      {
        id: "dashboard",
        labelKey: "layout:sidebar.items.dashboard",
        href: "/",
        icon: "gauge",
      },
      {
        id: "transactions",
        labelKey: "layout:sidebar.items.transactions",
        href: "/transactions",
        icon: "list",
      },
      {
        id: "analytics",
        labelKey: "layout:sidebar.items.analytics",
        href: "/analytics",
        icon: "lineChart",
      },
    ],
  },
  {
    id: "system",
    labelKey: "layout:sidebar.sections.system",
    items: [
      {
        id: "merchants",
        labelKey: "layout:sidebar.items.merchants",
        href: "/merchants",
        icon: "store",
      },
      {
        id: "settlements",
        labelKey: "layout:sidebar.items.settlements",
        href: "/settlements",
        icon: "wallet",
      },
      {
        id: "system-health",
        labelKey: "layout:sidebar.items.systemHealth",
        href: "/system-health",
        icon: "activity",
      },
    ],
  },
];

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

interface SidebarProps {
  activeItem?: string;
}

export function Sidebar({ activeItem }: SidebarProps) {
  const { t } = useTranslation();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobilePanelWidth, setMobilePanelWidth] = useState(320);
  const [isForcedCollapsed, setIsForcedCollapsed] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const preferredCollapsedRef = useRef(sidebarCollapsed);

  useEffect(() => {
    if (!isForcedCollapsed) {
      preferredCollapsedRef.current = sidebarCollapsed;
    }
  }, [sidebarCollapsed, isForcedCollapsed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobileView(width <= MOBILE_BREAKPOINT);
      setMobilePanelWidth(Math.min(Math.max(Math.round(width * 0.82), 280), 360));
      const shouldForceCollapse = width <= AUTO_COLLAPSE_BREAKPOINT;
      setIsForcedCollapsed(shouldForceCollapse);
      if (shouldForceCollapse) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(preferredCollapsedRef.current);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarCollapsed]);

  const toggleCollapsed = () => {
    const nextState = !sidebarCollapsed;
    preferredCollapsedRef.current = nextState;
    setSidebarCollapsed(nextState);
  };

  const handleLogout = () => {
    // Mock 로그아웃 기능 (장식용)
    console.log("로그아웃 요청 (Mock)");
    // 실제 구현 시: 로그아웃 API 호출, 세션 정리, 리다이렉트 등
  };

  const sections = useMemo(() => {
    return sidebarSections.map((section) => ({
      ...section,
      label: t(section.labelKey),
      items: section.items.map((item) => ({
        ...item,
        label: t(item.labelKey),
        active: item.id === activeItem,
      })),
    }));
  }, [activeItem, t]);

  const favoriteItems = useMemo(() => {
    const flattened = sections.flatMap((section) => section.items);
    return flattened.slice(0, FAVORITE_LIMIT);
  }, [sections]);

  const widthValue = isMobileView
    ? mobilePanelWidth
    : sidebarCollapsed
    ? COLLAPSED_WIDTH
    : EXPANDED_WIDTH;

  return (
    <>
      {isMobileView && !sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/30"
          aria-hidden="true"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <aside
        className={cx(
          "relative z-40 flex h-screen flex-col overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] transition-[width,transform] duration-200 ease-out",
          isMobileView ? "fixed left-0 top-0 shadow-xl" : "sticky top-0",
          isMobileView && sidebarCollapsed ? "pointer-events-none" : "pointer-events-auto"
        )}
        style={{
          width: widthValue,
          transform: isMobileView && sidebarCollapsed ? "translateX(-110%)" : "translateX(0)",
          maxWidth: isMobileView ? 360 : undefined,
        }}
      >
        <div
          className="flex w-full items-center border-b border-[var(--border-subtle)] bg-[var(--surface)] px-4"
          style={{ height: "var(--header-height)" }}
        >
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center gap-3 flex-1 min-w-0">
              <svg
                width="40"
                height="40"
                viewBox="0 0 75 75"
                role="img"
                aria-label={t("common:app.name")}
                className="flex-shrink-0"
              >
                <g transform="rotate(-15, 37.5, 37.5)">
                  <path
                    d="M10 30C10 18.9543 18.9543 10 30 10H45C47.7614 10 50 12.2386 50 15V25L65 15L50 5V15C44.4772 15 40 19.4772 40 25H30C27.2386 25 25 27.2386 25 30V35H15C12.2386 35 10 32.7614 10 30Z"
                    fill="#0052CC"
                  />
                  <path
                    d="M65 40C65 51.0457 56.0457 60 45 60H30C27.2386 60 25 57.7614 25 55V45L10 55L25 65V55C30.5228 55 35 50.5228 35 45H45C47.7614 45 50 42.7614 50 40V35H60C62.7614 35 65 37.2386 65 40Z"
                    fill="#00C897"
                  />
                  <path d="M24 34H51V36H24V34Z" fill="white" />
                </g>
              </svg>
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="text-base font-semibold tracking-tight text-[var(--text-strong)] truncate">
                  {t("common:app.name")}
                </span>
                <span className="text-[10px] font-medium tracking-wide text-[var(--text-subtle)] truncate">
                  {t("common:app.tagline")}
                </span>
              </div>
            </Link>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="micro-button ml-auto flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] transition-colors hover:text-brand-primary"
            aria-label={
              sidebarCollapsed
                ? t("layout:sidebar.aria.expand")
                : t("layout:sidebar.aria.collapse")
            }
          >
            {sidebarCollapsed ? (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {!isMobileView && sidebarCollapsed && favoriteItems.length > 0 && (
          <div className="border-b border-[var(--border-subtle)] px-2.5 pb-4 pt-5">
            <div className="flex flex-col items-center gap-3">
              {favoriteItems.map((item) => {
                const isActive = Boolean(item.active);
                return (
                  <Link
                    key={`fav-${item.id}`}
                    href={item.href ?? "#"}
                    className={cx(
                      "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                      isActive
                        ? "border-brand-primary/50 bg-[var(--surface-muted)] shadow-sm"
                        : "border-[var(--border-subtle)] bg-[var(--surface)] hover:border-brand-primary/30"
                    )}
                    title={item.label}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      variant={isActive ? "primary" : "secondary"}
                    />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {!sidebarCollapsed && (
          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <div className="flex flex-col gap-6">
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="flex flex-col gap-2">
                  <h3 className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                    {section.label}
                  </h3>
                  <div className="divide-y divide-[var(--border-subtle)] rounded-lg">
                    {section.items.map((item) => {
                      const isActive = Boolean(item.active);
                      return (
                        <Link
                          key={item.id}
                          href={item.href ?? "#"}
                          className={cx(
                            "group relative flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors",
                            isActive
                              ? "text-brand-primary"
                              : "text-[var(--text-muted)] hover:text-brand-primary"
                          )}
                        >
                          {isActive && (
                            <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-brand-primary" />
                          )}
                          <span
                            className={cx(
                              "flex h-8 w-8 items-center justify-center rounded-lg text-brand-primary transition-colors",
                              isActive ? "bg-[var(--surface-muted)]" : "bg-transparent"
                            )}
                          >
                            <Icon
                              name={item.icon}
                              size={18}
                              variant={isActive ? "primary" : "secondary"}
                            />
                          </span>
                          <span className="flex-1 truncate text-[var(--text-strong)]">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  {sectionIndex < sections.length - 1 && (
                    <div className="border-b border-dashed border-[var(--border-subtle)]" />
                  )}
                </div>
              ))}
            </div>
          </nav>
        )}

        <div className="border-t border-[var(--border-subtle)]">
          <div className="flex flex-col">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-3 py-3">
                <Link
                  href="/settings"
                  className={cx(
                    "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                    activeItem === "settings"
                      ? "border-brand-primary/50 bg-[var(--surface-muted)] shadow-sm"
                      : "border-[var(--border-subtle)] bg-[var(--surface-muted)] hover:border-brand-primary/30"
                  )}
                  title={t("layout:sidebar.items.settings")}
                >
                  <Icon
                    name="settings"
                    size={18}
                    variant={activeItem === "settings" ? "primary" : "secondary"}
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                  title={t("layout:sidebar.items.logout")}
                >
                  <Icon name="logOut" size={18} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/settings"
                  className={cx(
                    "group relative flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors",
                    activeItem === "settings"
                      ? "bg-[var(--surface-muted)] text-brand-primary"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-brand-primary"
                  )}
                >
                  {activeItem === "settings" && (
                    <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-brand-primary" />
                  )}
                  <span
                    className={cx(
                      "flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-brand-primary",
                      activeItem === "settings" && "border-brand-primary/40 bg-[var(--surface)] shadow-sm"
                    )}
                  >
                    <Icon
                      name="settings"
                      size={18}
                      variant={activeItem === "settings" ? "primary" : "secondary"}
                    />
                  </span>
                  <span className="flex-1 text-[var(--text-strong)]">
                    {t("layout:sidebar.items.settings")}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(true)}
                  className="group relative flex items-center gap-3 px-3 py-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-red-600 dark:hover:text-red-400"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-red-600 dark:text-red-400">
                    <Icon name="logOut" size={18} />
                  </span>
                  <span className="flex-1 text-left text-[var(--text-strong)]">
                    {t("layout:sidebar.items.logout")}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

      </aside>

      {/* 로그아웃 확인 모달 - 사이드바 밖에 렌더링하여 전체 화면 중앙에 표시 */}
      <LogoutConfirmModal
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}

