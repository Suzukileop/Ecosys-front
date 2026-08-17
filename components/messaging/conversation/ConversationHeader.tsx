'use client';

import type { ReactNode } from 'react';

type ConversationHeaderProps = {
  title: string;
  subtitle?: string | null;
  detailsOpen?: boolean;
  /** Center the title block in the header (temporary sessions). */
  titleCentered?: boolean;
  /** Content placed on the left (e.g. Temporary badge). */
  leadingActions?: ReactNode;
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
      className={`inline-flex h-11 w-11 items-center justify-center rounded-[8px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50 disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
          : 'text-[var(--cw-text-secondary)] hover:bg-neutral-100 hover:text-[var(--cw-text-primary)] active:bg-neutral-200/80 dark:hover:bg-neutral-800 dark:active:bg-neutral-700'
      }`}
    >
      {children}
    </button>
  );
}

export function ConversationHeader({
  title,
  subtitle = null,
  detailsOpen = false,
  titleCentered = false,
  leadingActions,
  onBack,
  onSearch,
  onPin,
  onToggleDetails,
  extraActions,
}: ConversationHeaderProps) {
  const showSubtitle = Boolean(subtitle?.trim());

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--cw-border)] bg-[var(--cw-surface)] px-3 sm:px-5">
      <div className={`flex min-w-0 items-center gap-2 ${titleCentered ? 'z-10 shrink-0' : 'flex-1'}`}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            title="Back to inbox"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] text-[var(--cw-text-secondary)] transition hover:bg-neutral-100 hover:text-[var(--cw-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50 dark:hover:bg-neutral-800 lg:hidden"
            aria-label="Back to inbox"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : null}
        {leadingActions ? <div className="flex shrink-0 items-center gap-1.5">{leadingActions}</div> : null}
        {!titleCentered ? (
          <div className="min-w-0 leading-tight">
            <h3
              id="discussion-chat-heading"
              className="truncate text-sm font-semibold text-[var(--cw-text-primary)]"
            >
              {title}
            </h3>
            {showSubtitle ? (
              <p className="truncate text-[13px] text-[var(--cw-text-secondary)]">{subtitle}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {titleCentered ? (
        <div className="pointer-events-none absolute inset-x-20 top-1/2 z-0 min-w-0 -translate-y-1/2 px-2 text-center sm:inset-x-28">
          <h3
            id="discussion-chat-heading"
            className="truncate text-sm font-semibold text-[var(--cw-text-primary)]"
            title={title}
          >
            {title}
          </h3>
          {showSubtitle ? (
            <p className="truncate text-[13px] text-[var(--cw-text-secondary)]">{subtitle}</p>
          ) : null}
        </div>
      ) : null}

      <div className="relative z-10 flex shrink-0 items-center gap-0.5">
        {extraActions}
        <HeaderIconButton label="Search in conversation" onClick={onSearch}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </HeaderIconButton>
        <HeaderIconButton label="Pinned messages" onClick={onPin}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </HeaderIconButton>
        <HeaderIconButton label="Conversation details" onClick={onToggleDetails} active={detailsOpen}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </HeaderIconButton>
      </div>
    </header>
  );
}
