'use client';

import type { ReactNode } from 'react';

type ContextSummaryProps = {
  items: Array<{
    label: string;
    value: number | string;
    onClick?: () => void;
  }>;
};

export function ContextSummary({ items }: ContextSummaryProps) {
  return (
    <div className="flex items-stretch divide-x divide-[var(--cw-border)] rounded-[8px] border border-[var(--cw-border)] bg-[var(--cw-surface)]">
      {items.map((item) =>
        item.onClick ? (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 transition hover:bg-[var(--cw-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--cw-accent)]/35"
          >
            <span className="text-base font-semibold tabular-nums text-[var(--cw-text-primary)]">
              {item.value}
            </span>
            <span className="text-[10px] text-[var(--cw-text-muted)]">{item.label}</span>
          </button>
        ) : (
          <div
            key={item.label}
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2"
          >
            <span className="text-base font-semibold tabular-nums text-[var(--cw-text-primary)]">
              {item.value}
            </span>
            <span className="text-[10px] text-[var(--cw-text-muted)]">{item.label}</span>
          </div>
        )
      )}
    </div>
  );
}

type ContextShortcutProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

export function ContextShortcut({ icon, label, onClick }: ContextShortcutProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left transition hover:bg-[var(--cw-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cw-accent)]/35"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--cw-surface-soft)] text-[var(--cw-text-secondary)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium text-[var(--cw-text-primary)]">{label}</span>
      <svg className="h-4 w-4 shrink-0 text-[var(--cw-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
