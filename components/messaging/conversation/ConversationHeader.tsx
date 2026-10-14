'use client';

import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { useT } from '@/lib/i18n/I18nProvider';

type ConversationHeaderProps = {
  title: string;
  subtitle?: string | null;
  /** The other person's portrait (direct chats) — shown beside the name. */
  avatarUrl?: string | null;
  /** Direct-chat partner presence: true draws the green dot and says "Online" when nothing else is said. */
  online?: boolean;
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

/** X icon button: 40px circle, ink glyph, hover tint; "on" = ink glyph on the tint. */
function HeaderIconButton({
  label,
  onClick,
  active,
  className = '',
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
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
      className={`h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? 'bg-[var(--msg-wash)] text-[var(--msg-ink)]'
          : 'text-[var(--msg-ink)] hover:bg-[var(--msg-wash)]'
      } ${className || 'inline-flex'}`}
    >
      {children}
    </button>
  );
}

function HeaderGlyph({ children }: { children: ReactNode }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

/**
 * The thread's head, X DM style in the News palette: back (phones), then WHO — a 36px portrait with
 * the green presence dot, the name in bold over one line of status ("Online", "Ana is typing…") —
 * and the tools at the right. The whole identity block is a button that opens the conversation's
 * details, the gesture people expect from every messenger.
 *
 * Phones get one tool, Details: search and pins live in the details sheet already (its first two
 * rows), and four 40px icons beside a back arrow left the name about 120px. From sm the search and
 * pin shortcuts come back. No rule under the header — the thread below sits on the same ground.
 */
export function ConversationHeader({
  title,
  subtitle = null,
  avatarUrl,
  online = false,
  detailsOpen = false,
  titleCentered = false,
  leadingActions,
  onBack,
  onSearch,
  onPin,
  onToggleDetails,
  extraActions,
}: ConversationHeaderProps) {
  const t = useT();
  const statusLine = subtitle?.trim() || (online ? t('Online') : '');
  const showAvatar = avatarUrl !== undefined && !titleCentered;

  const titleText = (
    <span className="min-w-0 leading-tight">
      <h3
        id="discussion-chat-heading"
        className="truncate text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-[var(--msg-ink)]"
        title={title}
      >
        {title}
      </h3>
      {statusLine ? (
        <span className="block truncate text-[13px] leading-[18px] text-[var(--msg-ink-faint)]">{statusLine}</span>
      ) : null}
    </span>
  );

  const identity = (
    <>
      {showAvatar ? (
        <span className="relative shrink-0">
          <span className="block [&>*]:!h-9 [&>*]:!w-9 [&>*]:!text-[13px]">
            <Avatar avatarUrl={avatarUrl} name={title} size="md" tone="muted" />
          </span>
          {online ? (
            <span
              aria-hidden
              className="absolute -bottom-px -right-px h-3 w-3 rounded-full bg-[var(--msg-online)] ring-2 ring-[color:var(--msg-ground)]"
            />
          ) : null}
        </span>
      ) : null}
      {titleText}
    </>
  );

  const identityBlock = onToggleDetails ? (
    <button
      type="button"
      onClick={onToggleDetails}
      aria-label={t('{title} — conversation details', { title })}
      className="-mx-1.5 flex min-h-11 min-w-0 items-center gap-2.5 rounded-full px-1.5 text-left transition-colors hover:bg-[var(--msg-wash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
    >
      {identity}
    </button>
  ) : (
    <div className="flex min-w-0 items-center gap-2.5">{identity}</div>
  );

  return (
    <header className="relative flex h-[calc(3.75rem+env(safe-area-inset-top))] shrink-0 items-center justify-between gap-2 bg-[var(--msg-ground)] pl-2 pr-3 pt-[env(safe-area-inset-top)] sm:px-4 lg:h-16 lg:px-5 lg:pt-0">
      <div className={`flex min-w-0 items-center gap-1 ${titleCentered ? 'z-10 shrink-0' : 'flex-1'}`}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            title={t('Back to inbox')}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--msg-ink)] transition-colors duration-200 hover:bg-[var(--msg-wash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] lg:hidden"
            aria-label={t('Back to inbox')}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
          </button>
        ) : null}
        {leadingActions ? <div className="flex shrink-0 items-center gap-1.5">{leadingActions}</div> : null}
        {!titleCentered ? <div className="ml-1 flex min-w-0 lg:ml-0">{identityBlock}</div> : null}
      </div>

      {titleCentered ? (
        <div className="pointer-events-none absolute inset-x-20 top-1/2 z-0 min-w-0 -translate-y-1/2 px-2 text-center sm:inset-x-28 [&_h3]:text-center">
          {titleText}
        </div>
      ) : null}

      <div className="relative z-10 flex shrink-0 items-center gap-0.5">
        {extraActions}
        <HeaderIconButton label={t('Search in conversation')} onClick={onSearch} className="hidden sm:inline-flex">
          <HeaderGlyph>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4.2-4.2" />
          </HeaderGlyph>
        </HeaderIconButton>
        <HeaderIconButton label={t('Pinned messages')} onClick={onPin} className="hidden sm:inline-flex">
          <HeaderGlyph>
            <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-4.5L5.5 20V5.5a1 1 0 0 1 1-1z" />
          </HeaderGlyph>
        </HeaderIconButton>
        <HeaderIconButton label={t('Conversation details')} onClick={onToggleDetails} active={detailsOpen}>
          <HeaderGlyph>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 7.6h.01" />
          </HeaderGlyph>
        </HeaderIconButton>
      </div>
    </header>
  );
}
