'use client';

import type { ReactNode } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';

type ContextSummaryProps = {
  items: Array<{
    label: string;
    value: number | string;
    onClick?: () => void;
  }>;
};

/** Three count tiles (kept for callers; the details overview now lists its counts on `ContextShortcut` rows). */
export function ContextSummary({ items }: ContextSummaryProps) {
  const t = useT();
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) =>
        item.onClick ? (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            title={t('Open {label}', { label: item.label })}
            className="group relative flex min-h-16 flex-col items-center justify-center gap-0.5 bg-[var(--msg-field)] px-2 py-2 transition-colors hover:bg-[var(--msg-wash)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--msg-ink)]"
          >
            <span className="text-[17px] font-bold tabular-nums text-[var(--cw-text-primary)]">{item.value}</span>
            <span className="text-[13px] text-[var(--cw-text-secondary)]">{t(item.label)}</span>
          </button>
        ) : (
          <div
            key={item.label}
            className="flex min-h-16 flex-col items-center justify-center gap-0.5 bg-[var(--msg-field)] px-2 py-2"
          >
            <span className="text-[17px] font-bold tabular-nums text-[var(--cw-text-primary)]">{item.value}</span>
            <span className="text-[13px] text-[var(--cw-text-muted)]">{t(item.label)}</span>
          </div>
        )
      )}
    </div>
  );
}

type ContextShortcutProps = {
  icon: ReactNode;
  label: string;
  /** A count or short value shown before the chevron ("3"). */
  meta?: ReactNode;
  onClick: () => void;
};

/**
 * One row of the details overview, as a News rail row: full width on the panel's gutters, 48px+,
 * the 20px stroke glyph in ink, 15px label, the count in secondary ink, a chevron — and the fill
 * tone only under the pointer. No rule between rows.
 */
export function ContextShortcut({ icon, label, meta, onClick }: ContextShortcutProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-12 w-full items-center gap-3 px-5 py-3 text-left text-[15px] leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--xm-row-hover)] active:bg-[color:var(--xm-row-selected)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] lg:px-6"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {meta != null ? (
        <span className="shrink-0 text-[14px] tabular-nums text-[color:var(--gn-ink2)]">{meta}</span>
      ) : null}
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px] shrink-0 text-[color:var(--gn-ink2)] transition-transform duration-200 group-hover:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}
