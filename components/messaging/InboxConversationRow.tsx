'use client';

import { localeTag } from '@/lib/i18n/active';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { InboxConversationMenu } from '@/components/messaging/InboxConversationMenu';
import { InboxMessageStatus } from '@/components/messaging/InboxMessageStatus';
import { getOutgoingMessageStatus } from '@/lib/messaging-status';
import { parseInboxPreview, type InboxPreviewKind } from '@/lib/messaging-preview';
import type { ConversationSummary } from '@/types/messaging';
import { useT } from '@/lib/i18n/I18nProvider';

type InboxConversationRowProps = {
  conversation: ConversationSummary;
  selected: boolean;
  currentUserId?: string | null;
  /** Direct-chat partner presence; omit for groups. */
  partnerOnline?: boolean | null;
  typingName?: string;
  deliveredUserIds?: Set<string>;
  onSelect: (conversationId: string) => void;
  onMarkUnread?: (conversationId: string) => void;
  onArchive?: (conversationId: string) => void;
  onUnarchive?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
  menuBusy?: boolean;
  compact?: boolean;
};

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return date.toLocaleTimeString(localeTag(), { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString(localeTag(), { weekday: 'short' });
  return date.toLocaleDateString(localeTag(), { month: 'short', day: 'numeric' });
}

function formatGuestExpiry(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h left`;
  return `${Math.ceil(hours / 24)}d left`;
}

/*
 * What the last message was, as a 14px glyph in front of its label ("Photo", "Voice call"…) — the
 * rail's stroke vocabulary instead of the solid Font Awesome icons, which were the only filled
 * shapes left in the list and read heavier than the names above them.
 */
const PREVIEW_GLYPHS: Partial<Record<InboxPreviewKind, ReactNode>> = {
  photo: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m21 16-5-5-9 8.5" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2.5" />
      <path d="m16 10.5 5-3v9l-5-3z" />
    </>
  ),
  audio: (
    <>
      <path d="M9 18V5.5l11-2V16" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  call: (
    <path d="M5 4h3.3l1.6 4.2-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z" />
  ),
};

function InboxPreviewText({
  raw,
  unread,
  groupLabel,
}: {
  raw: string;
  unread: boolean;
  groupLabel: string | null;
}) {
  const parts = parseInboxPreview(raw);
  const glyph = PREVIEW_GLYPHS[parts.kind];
  const textClass = unread ? 'font-semibold text-[color:var(--gn-ink)]' : 'text-[color:var(--gn-ink2)]';

  return (
    <p className={`flex min-w-0 flex-1 items-center gap-1.5 truncate text-[15px] leading-5 ${textClass}`}>
      {groupLabel ? <span className="shrink-0">{groupLabel} · </span> : null}
      {glyph ? (
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {glyph}
        </svg>
      ) : null}
      <span className="min-w-0 truncate">{parts.label}</span>
    </p>
  );
}

/**
 * One conversation, as an X DM row in the News palette: a 48px portrait, the name in bold over a
 * one-line preview, the time at the right. No rule between rows and no accent bar on the open one:
 * the open conversation holds the fill tone (the rail's "selected" tone), the others take it only
 * under the pointer. Unread is said three ways, all in ink — the preview goes semibold, the time
 * turns ink, and a solid count pill closes the line. 20px gutters on phones, 24px in the column.
 */
export function InboxConversationRow({
  conversation,
  selected,
  currentUserId = null,
  partnerOnline = null,
  typingName,
  deliveredUserIds,
  onSelect,
  onMarkUnread,
  onArchive,
  onUnarchive,
  onDelete,
  menuBusy = false,
  compact = false,
}: InboxConversationRowProps) {
  const t = useT();
  const unread = (conversation.unreadCount ?? 0) > 0 && !selected;
  const preview = conversation.guestSession
    ? 'Temporary guest access'
    : conversation.lastMessagePreview?.trim() || 'No messages yet';
  const outgoingStatus = getOutgoingMessageStatus(conversation, currentUserId, deliveredUserIds);
  const isGroup = conversation.type === 'GROUP';
  const groupLabel =
    isGroup && (conversation.participantCount ?? 0) > 0
      ? `Group · ${conversation.participantCount}`
      : isGroup
        ? t('Group')
        : null;
  const showMenu = Boolean(onMarkUnread && onArchive && onUnarchive && onDelete);
  const showPresenceDot = !isGroup && partnerOnline != null;
  const online = partnerOnline === true;
  /* The time (and receipt) step aside under the pointer so the options button can take their
     place; on touch screens the button is always shown, so its room is always kept. */
  const yieldToMenu = showMenu ? 'transition-opacity duration-200 group-hover/row:opacity-0' : '';

  return (
    <li className="group/row relative">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => onSelect(conversation.id)}
        title={conversation.otherUserName}
        className={`relative flex w-full items-center gap-3 px-5 text-left lg:group-data-[folded=true]/inbox:justify-center lg:group-data-[folded=true]/inbox:px-0 transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] lg:px-6 ${
          compact ? 'py-2.5' : 'py-3'
        } ${
          selected
            ? 'bg-[color:var(--xm-row-selected)]'
            : 'hover:bg-[color:var(--xm-row-hover)] active:bg-[color:var(--xm-row-selected)]'
        }`}
      >
        <div className="relative shrink-0">
          <span
            data-portrait-active={selected ? 'true' : 'false'}
            className="msg-portrait block overflow-hidden rounded-full"
          >
            <Avatar
              avatarUrl={
                isGroup
                  ? conversation.coverUrl ?? conversation.otherUserAvatarUrl
                  : conversation.otherUserAvatarUrl
              }
              name={conversation.otherUserName}
              size={compact ? 'md' : 'lg'}
              tone="muted"
            />
          </span>
          {showPresenceDot && online ? (
            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[var(--msg-online)] ring-[3px] ${
                selected
                  ? 'ring-[color:var(--xm-row-selected)]'
                  : 'ring-[color:var(--msg-panel)] group-hover/row:ring-[color:var(--xm-row-hover)]'
              }`}
              title={t('Online')}
              aria-label={t('Online')}
            />
          ) : null}
          {unread ? (
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 hidden h-3 w-3 rounded-full bg-[color:var(--gn-primary)] ring-2 ring-[color:var(--msg-panel)] lg:group-data-[folded=true]/inbox:block"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 lg:group-data-[folded=true]/inbox:hidden">
          <div className="flex items-baseline justify-between gap-3">
            <span className={`min-w-0 truncate text-[15px] leading-5 text-[color:var(--gn-ink)] ${unread ? 'font-bold' : 'font-semibold'}`}>
              {conversation.otherUserName}
            </span>
            <span
              className={`shrink-0 text-[13px] leading-5 tabular-nums ${
                unread ? 'font-semibold text-[color:var(--gn-ink)]' : 'text-[color:var(--gn-ink2)]'
              } ${showMenu ? `pr-8 [@media(hover:none)]:pr-9 ${yieldToMenu}` : ''}`}
            >
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>

          <div className="mt-0.5 flex items-center justify-between gap-3">
            {conversation.guestSession ? (
              <p className="min-w-0 truncate text-[15px] leading-5 text-[color:var(--gn-ink2)]">
                {t('Guest · {formatGuestExpiry}', { formatGuestExpiry: formatGuestExpiry(conversation.guestExpiresAt) })}
              </p>
            ) : typingName ? (
              <p className="min-w-0 truncate text-[15px] italic leading-5 text-[color:var(--gn-ink)]">
                {t('{typingName} is typing…', { typingName })}
              </p>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                {outgoingStatus ? (
                  <span className={`shrink-0 text-[color:var(--gn-ink2)] ${yieldToMenu}`}>
                    <InboxMessageStatus status={outgoingStatus} />
                  </span>
                ) : null}
                <InboxPreviewText raw={preview} unread={unread} groupLabel={groupLabel} />
              </div>
            )}
            {unread ? (
              <span
                className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--gn-primary)] px-1.5 text-[12px] font-bold tabular-nums text-[color:var(--gn-primary-ink)]"
                aria-label={`${conversation.unreadCount} unread`}
              >
                {(conversation.unreadCount ?? 0) > 99 ? '99+' : conversation.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </button>

      {showMenu ? (
        <div className="absolute right-3 top-1 z-10 text-[color:var(--gn-ink2)] lg:right-4 lg:group-data-[folded=true]/inbox:hidden">
          <InboxConversationMenu
            conversationId={conversation.id}
            otherUserId={conversation.otherUserId}
            isDirect={!isGroup}
            archived={Boolean(conversation.archived)}
            busy={menuBusy}
            onMarkUnread={() => onMarkUnread?.(conversation.id)}
            onArchive={() => onArchive?.(conversation.id)}
            onUnarchive={() => onUnarchive?.(conversation.id)}
            onDelete={() => onDelete?.(conversation.id)}
          />
        </div>
      ) : null}
    </li>
  );
}
