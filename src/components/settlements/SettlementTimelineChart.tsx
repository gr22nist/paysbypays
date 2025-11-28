"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@hua-labs/i18n-core";
import { RechartsTrendChart } from "@/components/charts/RechartsTrendChart";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import type { RechartsTrendChartProps } from "@/components/charts/RechartsTrendChart";
import type { TrendSeries } from "@/types/trend-chart";

interface SettlementTimelineChartProps {
  categories: string[];
  series: TrendSeries[];
  formatAxisAmount: (value: number) => string;
  formatFullAmount: (value: number) => string;
  panelClass: string;
}

export function SettlementTimelineChart({
  categories,
  series,
  formatAxisAmount,
  formatFullAmount,
  panelClass,
}: SettlementTimelineChartProps) {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const checkDarkMode = () => {
      const root = document.documentElement;
      setIsDark(root.classList.contains("dark"));
    };

    checkDarkMode();
    
    // MutationObserver로 다크 모드 변경 감지
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);
  
  const CHART_PALETTE = {
    [t("settlements:timeline.series.scheduled")]: isDark
      ? {
          stroke: "#60a5fa",
          gradient: ["#93c5fd", "#60a5fa"] as const,
          startOpacity: 0.4,
          endOpacity: 0.08,
        }
      : {
          stroke: "#0ea5e9",
          gradient: ["#38bdf8", "#0ea5e9"] as const,
          startOpacity: 0.35,
          endOpacity: 0.05,
        },
    [t("settlements:timeline.series.completed")]: isDark
      ? {
          stroke: "#34d399",
          gradient: ["#6ee7b7", "#34d399"] as const,
          startOpacity: 0.4,
          endOpacity: 0.08,
        }
      : {
          stroke: "#10b981",
          gradient: ["#6ee7b7", "#10b981"] as const,
          startOpacity: 0.35,
          endOpacity: 0.05,
        },
  } satisfies NonNullable<RechartsTrendChartProps["palette"]>;
  
  return (
    <div className={`micro-card ${panelClass} xl:col-span-2`}>
      <SectionHeaderBlock
        title={t("settlements:timeline.title")}
        description={t("settlements:timeline.description")}
        containerClassName="px-0 pt-0"
      />
      <div className="px-6 pb-6 pt-4">
        {categories.length > 0 ? (
          <RechartsTrendChart
            className="mt-4"
            categories={categories}
            series={series}
            height={240}
            showLegend
            palette={CHART_PALETTE}
            yTickFormatter={(value) => formatAxisAmount(Number(value))}
            tooltipFormatter={(value) => formatFullAmount(Number(value))}
          />
        ) : (
          <div className="py-8 text-center text-sm text-[var(--text-subtle)]">
            {t("settlements:timeline.empty")}
          </div>
        )}
      </div>
    </div>
  );
}

