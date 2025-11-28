"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface TrendSeries {
  label: string;
  data: number[];
  area?: boolean;
}

type PaletteEntry = {
  stroke: string;
  gradient?: readonly [string, string];
  startOpacity?: number;
  endOpacity?: number;
};

export interface RechartsTrendChartProps {
  series: TrendSeries[];
  categories: string[];
  height?: number;
  className?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  palette?: Record<string, PaletteEntry>;
  yTickFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number, name: string) => string;
}

// 라이트 모드 색상 (번역 키 기반)
const COLORS_LIGHT: Record<string, PaletteEntry> = {
  "common:statuses.approved": {
    stroke: "#0ea5e9",
    gradient: ["#38bdf8", "#0ea5e9"],
    startOpacity: 0.35,
    endOpacity: 0.05,
  },
  "common:statuses.failed": {
    stroke: "#6b7280",
    gradient: ["#d1d5db", "#6b7280"],
    startOpacity: 0.28,
    endOpacity: 0.05,
  },
  "common:statuses.pending": {
    stroke: "#fbbf24",
    gradient: ["#fde68a", "#fbbf24"],
    startOpacity: 0.35,
    endOpacity: 0.05,
  },
  // 하위 호환성을 위한 fallback (번역된 텍스트)
  "승인": {
    stroke: "#0ea5e9",
    gradient: ["#38bdf8", "#0ea5e9"],
    startOpacity: 0.35,
    endOpacity: 0.05,
  },
  "실패": {
    stroke: "#6b7280",
    gradient: ["#d1d5db", "#6b7280"],
    startOpacity: 0.28,
    endOpacity: 0.05,
  },
  "대기": {
    stroke: "#fbbf24",
    gradient: ["#fde68a", "#fbbf24"],
    startOpacity: 0.35,
    endOpacity: 0.05,
  },
};

// 다크 모드 색상 (더 밝고 대비가 좋은 색상)
const COLORS_DARK: Record<string, PaletteEntry> = {
  "common:statuses.approved": {
    stroke: "#60a5fa",
    gradient: ["#93c5fd", "#60a5fa"],
    startOpacity: 0.4,
    endOpacity: 0.08,
  },
  "common:statuses.failed": {
    stroke: "#9ca3af",
    gradient: ["#d1d5db", "#9ca3af"],
    startOpacity: 0.35,
    endOpacity: 0.08,
  },
  "common:statuses.pending": {
    stroke: "#fbbf24",
    gradient: ["#fde68a", "#fbbf24"],
    startOpacity: 0.4,
    endOpacity: 0.08,
  },
  // 하위 호환성을 위한 fallback (번역된 텍스트)
  "승인": {
    stroke: "#60a5fa",
    gradient: ["#93c5fd", "#60a5fa"],
    startOpacity: 0.4,
    endOpacity: 0.08,
  },
  "실패": {
    stroke: "#9ca3af",
    gradient: ["#d1d5db", "#9ca3af"],
    startOpacity: 0.35,
    endOpacity: 0.08,
  },
  "대기": {
    stroke: "#fbbf24",
    gradient: ["#fde68a", "#fbbf24"],
    startOpacity: 0.4,
    endOpacity: 0.08,
  },
};

const FALLBACK_COLOR_LIGHT = {
  stroke: "#94a3b8",
  gradient: ["#cbd5f5", "#94a3b8"],
  startOpacity: 0.3,
  endOpacity: 0.05,
};

const FALLBACK_COLOR_DARK = {
  stroke: "#cbd5f5",
  gradient: ["#e2e8f0", "#cbd5f5"],
  startOpacity: 0.35,
  endOpacity: 0.08,
};

export function RechartsTrendChart({
  series,
  categories,
  height = 260,
  className = "",
  showTooltip = true,
  showLegend = true,
  palette,
  yTickFormatter,
  tooltipFormatter,
}: RechartsTrendChartProps) {
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

  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT;
  const FALLBACK_COLOR = isDark ? FALLBACK_COLOR_DARK : FALLBACK_COLOR_LIGHT;

  const resolvePalette = (label: string): PaletteEntry => {
    // 번역 키 또는 번역된 텍스트 모두 지원
    return palette?.[label] ?? COLORS[label] ?? FALLBACK_COLOR;
  };

  // 다크 모드에 따른 그리드 및 축 색상
  const gridColor = isDark ? "rgba(203, 213, 245, 0.15)" : "#e5e7eb";
  const axisColor = isDark ? "#cbd5f5" : "#6b7280";
  const tooltipBg = isDark ? "#0f1525" : "white";
  const tooltipBorder = isDark ? "#1a2436" : "#e5e7eb";
  const tooltipLabelColor = isDark ? "#f8fafc" : "#374151";
  const legendColor = isDark ? "#cbd5f5" : "#6b7280";

  // recharts 형식으로 데이터 변환
  const chartData = categories.map((category, index) => {
    const dataPoint: Record<string, string | number> = {
      name: category,
    };
    series.forEach((s) => {
      dataPoint[s.label] = s.data[index] || 0;
    });
    return dataPoint;
  });

  // Area 차트가 있는지 확인
  const hasArea = series.some((s) => s.area);

  // 안전한 그라데이션 ID 생성 (한글, 공백, 특수문자 제거)
  const getGradientId = (label: string, index: number): string => {
    // 한글, 공백, 특수문자를 제거하고 안전한 ID 생성
    const safeId = label
      .replace(/[^\w]/g, "") // 영문자, 숫자, 언더스코어만 유지
      .toLowerCase();
    // 안전한 ID가 비어있으면 인덱스 사용
    return safeId ? `gradient-${safeId}-${index}` : `gradient-${index}`;
  };

  if (hasArea) {
    return (
      <div className={className} style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s, index) => {
                const paletteEntry = resolvePalette(s.label);
                const gradientId = getGradientId(s.label, index);
                return (
                  <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={paletteEntry.gradient?.[0] ?? paletteEntry.stroke}
                      stopOpacity={paletteEntry.startOpacity ?? 0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={paletteEntry.gradient?.[1] ?? paletteEntry.stroke}
                      stopOpacity={paletteEntry.endOpacity ?? 0.05}
                    />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="name"
              stroke={axisColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={axisColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={yTickFormatter}
            />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "6px",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: tooltipLabelColor, fontWeight: 600, marginBottom: "4px" }}
                formatter={(value, name) =>
                  tooltipFormatter
                    ? [tooltipFormatter(Number(value), name as string), name]
                    : [value as number, name]
                }
              />
            )}
            {showLegend && (
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
                formatter={(value) => <span style={{ color: legendColor, fontSize: "12px" }}>{value}</span>}
              />
            )}
            {series.map((s, index) => {
              const paletteEntry = resolvePalette(s.label);
              const gradientId = getGradientId(s.label, index);

              return (
              <Area
                key={s.label}
                type="monotone"
                dataKey={s.label}
                  stroke={paletteEntry.stroke}
                fillOpacity={1}
                  fill={
                    s.area
                      ? `url(#${gradientId})`
                      : paletteEntry.gradient
                      ? paletteEntry.gradient[0]
                      : "transparent"
                  }
                strokeWidth={3}
              />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Line 차트
  return (
    <div className={className} style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={yTickFormatter}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "6px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: tooltipLabelColor, fontWeight: 600, marginBottom: "4px" }}
              formatter={(value, name) =>
                tooltipFormatter
                  ? [tooltipFormatter(Number(value), name as string), name]
                  : [value as number, name]
              }
            />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
              formatter={(value) => <span style={{ color: legendColor, fontSize: "12px" }}>{value}</span>}
            />
          )}
          {series.map((s) => {
            const paletteEntry = resolvePalette(s.label);

            return (
            <Line
              key={s.label}
              type="monotone"
              dataKey={s.label}
                stroke={paletteEntry.stroke}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

