"use client";

import { RechartsTrendChart } from "@/components/charts/RechartsTrendChart";
import { SectionHeaderBlock } from "@/components/sections/SectionHeaderBlock";
import { useTranslation } from "@hua-labs/i18n-core";

interface ApprovalRateTrend {
  series: { label: string; data: number[] }[];
  categories: string[];
}

interface ApprovalRateChartProps {
  trend: ApprovalRateTrend;
  selectedPresetLabel: string;
  panelClass: string;
}

export function ApprovalRateChart({
  trend,
  selectedPresetLabel,
  panelClass,
}: ApprovalRateChartProps) {
  const { t, tWithParams } = useTranslation();
  
  if (trend.categories.length === 0) return null;

  return (
    <div className={`micro-card ${panelClass}`}>
      <SectionHeaderBlock
        title={t("analytics:panels.approvalRate.title")}
        description={tWithParams("analytics:panels.approvalRate.description", {
          period: selectedPresetLabel,
        })}
        containerClassName="px-6 pt-6"
      />
      <div className="px-6 pb-6 pt-4">
        <RechartsTrendChart
          series={trend.series}
          categories={trend.categories}
          height={300}
          showTooltip
          showLegend
        />
      </div>
    </div>
  );
}

