"use client";

import { SectionHeader } from "@hua-labs/ui";
import type { ComponentProps, ReactNode } from "react";

type SectionHeaderProps = ComponentProps<typeof SectionHeader>;

interface SectionHeaderBlockProps extends SectionHeaderProps {
  containerClassName?: string;
  descriptionSize?: "sm" | "xs";
  actionSlot?: ReactNode;
  showDivider?: boolean;
}

export function SectionHeaderBlock({
  containerClassName,
  className,
  description,
  action,
  descriptionSize = "sm",
  actionSlot,
  showDivider = false,
  ...sectionProps
}: SectionHeaderBlockProps) {
  const baseClass = "px-6 pt-6";
  const mergedClassName = containerClassName
    ? `${baseClass} ${containerClassName}`
    : baseClass;
  const dividerClass = showDivider ? "" : "!border-b-0 !pb-0";
  const headerClassName = className
    ? `px-0 py-0 ${dividerClass} ${className}`
    : `px-0 py-0 ${dividerClass}`;

  const descriptionClass =
    descriptionSize === "xs" ? "text-xs" : "text-sm";

  const renderedAction = actionSlot ? (
    <div className="shrink-0">{actionSlot}</div>
  ) : action ? (
    <div className="shrink-0 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors">
      {action}
    </div>
  ) : null;

  return (
    <div className={mergedClassName}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionHeader
            {...sectionProps}
            description={undefined}
            className={headerClassName}
          />
          {description && (
            <p className={`mt-1 text-gray-500 ${descriptionClass}`}>{description}</p>
          )}
        </div>
        {renderedAction}
      </div>
    </div>
  );
}


