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

/**
 * Header controls carry no surface of their own — not at rest, not on hover, not when active.
 * A tinted square behind an icon is a fourth grey in a palette that has three, and it puts a
 * box back into a header whose whole job is to be a line of type and three marks.
 *
 * State is ink instead: faint at rest, black on hover, black plus a coral underline when the
 * control is on. One accent, used once.
 */
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
      className={`group/hdr relative inline-flex h-10 w-10 items-center justify-center transition-colors duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? 'text-[var(--msg-ink)]'
          : 'text-[var(--msg-ink-faint)] hover:text-[var(--msg-ink)] focus-visible:text-[var(--msg-ink)]'
      }`}
    >
      {children}
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-1 left-1/2 h-0.5 w-4 rounded-full -translate-x-1/2 bg-[var(--msg-coral)] transition-opacity duration-300 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      />
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

  const titleBlock = (
    <>
      <h3
        id="discussion-chat-heading"
        className="truncate text-lg font-semibold tracking-[-0.01em] text-[var(--msg-ink)]"
        title={title}
      >
        {title}
      </h3>
      {showSubtitle ? (
        <p className="msg-micro mt-1 text-[var(--msg-ink-faint)]">{subtitle}</p>
      ) : null}
    </>
  );

  return (
    <header className="relative flex h-[4.75rem] shrink-0 items-center justify-between gap-2 border-b border-[var(--msg-hairline)] px-5 sm:px-7">
      <div className={`flex min-w-0 items-center gap-2 ${titleCentered ? 'z-10 shrink-0' : 'flex-1'}`}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            title="Back to inbox"
            className="-ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center text-[var(--msg-ink-faint)] transition-colors duration-300 hover:text-[var(--msg-ink)] focus-visible:text-[var(--msg-ink)] focus-visible:outline-none lg:hidden"
            aria-label="Back to inbox"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : null}
        {leadingActions ? <div className="flex shrink-0 items-center gap-1.5">{leadingActions}</div> : null}
        {!titleCentered ? <div className="min-w-0 leading-tight">{titleBlock}</div> : null}
      </div>

      {titleCentered ? (
        <div className="pointer-events-none absolute inset-x-20 top-1/2 z-0 min-w-0 -translate-y-1/2 px-2 text-center sm:inset-x-28">
          {titleBlock}
        </div>
      ) : null}

      <div className="relative z-10 -mr-2 flex shrink-0 items-center">
        {extraActions}
        <HeaderIconButton label="Search in conversation" onClick={onSearch}>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4.2-4.2" />
          </svg>
        </HeaderIconButton>
        <HeaderIconButton label="Pinned messages" onClick={onPin}>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 4h12v16l-6-3.6L6 20V4Z" />
          </svg>
        </HeaderIconButton>
        <HeaderIconButton label="Conversation details" onClick={onToggleDetails} active={detailsOpen}>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 7.6h.01" />
          </svg>
        </HeaderIconButton>
      </div>
    </header>
  );
}
