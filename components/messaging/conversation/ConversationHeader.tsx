'use client';

import type { ReactNode } from 'react';

type ConversationHeaderProps = {
  title: string;
  subtitle: string;
  detailsOpen?: boolean;
  onBack?: () => void;
  onSearch?: () => void;
  onPin?: () => void;
  onToggleDetails?: () => void;
  extraActions?: ReactNode;
};

function HeaderIconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-[8px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cw-accent)]/35 disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-[var(--cw-surface-soft)] text-[var(--cw-text-primary)]'
          : 'text-[var(--cw-text-secondary)] hover:bg-[var(--cw-surface-soft)] hover:text-[var(--cw-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}

export function ConversationHeader({
  title,
  subtitle,
  detailsOpen = false,
  onBack,
  onSearch,
  onPin,
  onToggleDetails,
  extraActions,
}: ConversationHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--cw-border)] px-3 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] text-[var(--cw-text-secondary)] transition hover:bg-[var(--cw-surface-soft)] hover:text-[var(--cw-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cw-accent)]/35 lg:hidden"
            aria-label="Back to inbox"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : null}
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--cw-accent)]" aria-hidden />
        <div className="min-w-0 leading-tight">
          <h3
            id="discussion-chat-heading"
            className="truncate text-sm font-semibold text-[var(--cw-text-primary)]"
          >
            {title}
          </h3>
          <p className="truncate text-xs text-[var(--cw-text-secondary)]">{subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {extraActions}
        <HeaderIconButton label="Search" onClick={onSearch}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </HeaderIconButton>
        <HeaderIconButton label="Pin" onClick={onPin}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </HeaderIconButton>
        <HeaderIconButton label="Details" onClick={onToggleDetails} active={detailsOpen}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </HeaderIconButton>
      </div>
    </header>
  );
}
