"use client";

import { RechartsTrendChart } from "@/components/charts/RechartsTrendChart";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { useTranslation } from "@hua-labs/i18n-core";
import type { TrendSeries } from "@/types/trend-chart";

interface TransactionTrendChartProps {
  chartData: {
    series: TrendSeries[];
    categories: string[];
  };
  selectedPresetLabel: string;
  panelClass: string;
}

export function AnalyticsTransactionTrendChart({
  chartData,
  selectedPresetLabel,
  panelClass,
}: TransactionTrendChartProps) {
  const { t, tWithParams } = useTranslation();

  if (chartData.categories.length === 0) return null;
  
  // series의 label을 번역
  const translatedSeries = chartData.series.map((s) => ({
    ...s,
    label: s.label.includes(":") ? t(s.label) : s.label, // 번역 키 형식인 경우만 번역
  }));
  
  // categories의 번역 키를 번역
  const translatedCategories = chartData.categories.map((cat) => {
    let translated = cat;
    
    // "common:weekdays.xxx" 형식의 번역 키가 포함된 경우 번역
    const weekdayMatch = cat.match(/\(common:weekdays\.(\w+)\)/);
    if (weekdayMatch) {
      const dayKey = weekdayMatch[1];
      const translatedDay = t(`common:weekdays.${dayKey}`);
      translated = translated.replace(`common:weekdays.${dayKey}`, translatedDay);
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
    <div className={`micro-card ${panelClass}`}>
      <SectionHeaderBlock
        title={t("analytics:panels.transactionTrend.title")}
        description={tWithParams("analytics:panels.transactionTrend.description", {
          period: selectedPresetLabel,
        })}
        containerClassName="px-6 pt-6"
      />
      <div className="px-6 pb-6 pt-4">
        <RechartsTrendChart
          series={translatedSeries}
          categories={translatedCategories}
          height={300}
          showTooltip
          showLegend
        />
      </div>
    </div>
  );
}

