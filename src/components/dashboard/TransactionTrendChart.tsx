"use client";

import { SkeletonRounded } from "@hua-labs/ui";
import { useTranslation } from "@hua-labs/i18n-core";
import { RechartsTrendChart } from "@/components/charts/RechartsTrendChart";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import type { TrendSeries } from "@/types/trend-chart";

interface TransactionTrendChartProps {
  series: TrendSeries[];
  categories: string[];
  loading: boolean;
  panelClass: string;
}

export function TransactionTrendChart({
  series,
  categories,
  loading,
  panelClass,
}: TransactionTrendChartProps) {
  const { t } = useTranslation();
  
  // series의 label을 번역
  const translatedSeries = series.map((s) => ({
    ...s,
    label: s.label.includes(":") ? t(s.label) : s.label, // 번역 키 형식인 경우만 번역
  }));
  
  // categories의 번역 키를 번역
  const translatedCategories = categories.map((cat) => {
    let translated = cat;
    
    // "common:weekdays.xxx" 형식의 번역 키가 포함된 경우 번역
    const weekdayMatch = cat.match(/\(common:weekdays\.(\w+)\)/);
    if (weekdayMatch) {
      const dayKey = weekdayMatch[1];
      const translatedDay = t(`common:weekdays.${dayKey}`);
      translated = translated.replace(`(common:weekdays.${dayKey})`, `(${translatedDay})`);
    }
    
    // "common:time.hour" 형식의 번역 키가 포함된 경우 번역
    if (translated.includes("common:time.hour")) {
      const hourMatch = translated.match(/(\d+)common:time\.hour/);
      if (hourMatch) {
        const hour = hourMatch[1];
        translated = translated.replace(`${hour}common:time.hour`, `${hour}${t("common:units.hour")}`);
      }
    }
    
    return translated;
  });
  
  return (
    <div className={`${panelClass} sm:col-span-2 lg:col-span-2 xl:col-span-2`}>
      <SectionHeaderBlock
        title={t("dashboard:sections.trend.title")}
        description={t("dashboard:sections.trend.description")}
        action={<span className="text-sm text-[var(--text-subtle)]">{t("dashboard:sections.trend.unit")}</span>}
      />
      <div className="px-6 pb-6 pt-4">
        {loading ? (
          <div className="mt-4">
            <SkeletonRounded className="h-[260px] w-full" />
          </div>
        ) : categories.length > 0 ? (
          <RechartsTrendChart
            className="mt-6"
            series={translatedSeries}
            categories={translatedCategories}
            height={260}
            showTooltip
            showLegend
          />
        ) : (
          <div className="mt-10 text-center text-sm text-[var(--text-subtle)]">
            {t("dashboard:sections.trend.empty")}
          </div>
        )}
      </div>
    </div>
  );
}

