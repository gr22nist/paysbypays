"use client";

import Link from "next/link";

interface QuickActionCardProps {
  href: string;
  title: string;
  description: string;
}

export function QuickActionCard({
  href,
  title,
  description,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="micro-card flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 transition hover:border-brand-primary hover:text-brand-primary"
    >
      <div>
        <p className="text-sm font-semibold text-[var(--text-strong)]">{title}</p>
        <p className="text-xs text-[var(--text-subtle)]">{description}</p>
      </div>
      <span className="text-[var(--text-subtle)]">→</span>
    </Link>
  );
}

