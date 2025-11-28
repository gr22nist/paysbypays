"use client";

import { useTranslation } from "@hua-labs/i18n-core";
import { useDisplayFormat } from "@/hooks/useDisplayFormat";
import type { FontScale } from "@/store/preferences-store";
import { FONT_SCALE_MAP } from "@/store/preferences-store";

interface LivePreviewProps {
  fontScale: FontScale;
}

export function LivePreview({ fontScale }: LivePreviewProps) {
  const { t } = useTranslation();
  const { formatCurrency, formatDate, locale } = useDisplayFormat();
  const formattedDate = formatDate(new Date());
  const sampleAmount = formatCurrency(95_832_000);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
          {t("settings:preview.title")}
        </p>
        <h2 className="text-xl font-semibold text-[var(--text-strong)]">
          {t("settings:preview.subtitle")}
        </h2>
        <p className="text-sm text-[var(--text-subtle)]">
          {t("settings:preview.description")}
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-between rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            {t("settings:preview.badge")}
          </p>
          <p
            className="mt-2 text-4xl font-bold text-[var(--text-strong)]"
            style={{ fontSize: `calc(2.25rem * ${FONT_SCALE_MAP[fontScale]})` }}
          >
            98.45%
          </p>
          <p className="mt-1 text-sm text-[var(--text-subtle)]">
            {formattedDate} · {t("settings:preview.amountLabel")}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--surface)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">
                {t("settings:preview.projectedPayout")}
              </p>
              <p
                className="text-2xl font-semibold text-[var(--text-strong)]"
                style={{ fontSize: `calc(1.5rem * ${FONT_SCALE_MAP[fontScale]})` }}
              >
                {sampleAmount}
              </p>
            </div>
            <span className="rounded-full bg-brand-primary-soft px-3 py-1 text-xs font-semibold text-brand-primary">
              +4.2%
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)]/70 px-3 py-2"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-[var(--text-strong)]">
                    {`${t("settings:preview.metricPrefix")} ${index}`}
                  </span>
                  <span className="text-xs text-[var(--text-subtle)]">•</span>
                  <span className="text-xs text-[var(--text-subtle)]">{formattedDate}</span>
                </div>
                <span className="text-sm font-semibold text-brand-primary">
                  {index === 1
                    ? sampleAmount
                    : `${(120 - index * 12).toLocaleString(locale)}${t("settings:preview.unit")}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

