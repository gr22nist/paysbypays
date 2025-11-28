"use client";

interface SortIndicatorProps {
  active?: boolean;
  direction?: "asc" | "desc" | null;
  className?: string;
}

export function SortIndicator({
  active = false,
  direction = null,
  className = "",
}: SortIndicatorProps) {
  const baseColor = active ? "text-brand-primary" : "text-gray-300";
  const symbol = active ? (direction === "asc" ? "↑" : "↓") : "⇅";

  return (
    <span
      className={`text-[11px] font-semibold leading-none ${baseColor} ${className}`.trim()}
      aria-hidden="true"
    >
      {symbol}
    </span>
  );
}

