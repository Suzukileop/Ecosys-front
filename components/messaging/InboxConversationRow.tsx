'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCamera,
  faFileLines,
  faMusic,
  faPhone,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Avatar } from '@/components/ui/Avatar';
import { InboxConversationMenu } from '@/components/messaging/InboxConversationMenu';
import { InboxMessageStatus } from '@/components/messaging/InboxMessageStatus';
import { getOutgoingMessageStatus } from '@/lib/messaging-status';
import { parseInboxPreview, type InboxPreviewKind } from '@/lib/messaging-preview';
import type { ConversationSummary } from '@/types/messaging';

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
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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

const PREVIEW_ICONS: Partial<Record<InboxPreviewKind, IconDefinition>> = {
  photo: faCamera,
  video: faVideo,
  audio: faMusic,
  document: faFileLines,
  call: faPhone,
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
  const icon = PREVIEW_ICONS[parts.kind];
  const textClass = unread ? 'font-medium text-[var(--msg-text)]' : 'text-[var(--msg-muted)]';

  return (
    <p className={`flex min-w-0 flex-1 items-center gap-1.5 truncate text-[13px] ${textClass}`}>
      {groupLabel ? (
        <span className="shrink-0 font-medium text-[var(--msg-muted)]">{groupLabel} · </span>
      ) : null}
      {icon ? (
        <FontAwesomeIcon
          icon={icon}
          className="h-3.5 w-3.5 shrink-0 text-[var(--msg-muted)]"
          aria-hidden
        />
      ) : null}
      <span className="min-w-0 truncate">{parts.label}</span>
    </p>
  );
}

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
        ? 'Group'
        : null;
  const showMenu = Boolean(onMarkUnread && onArchive && onUnarchive && onDelete);
  const showPresenceDot = !isGroup && partnerOnline != null;
  const online = partnerOnline === true;

  return (
    <li className="group/row relative px-3 sm:px-4">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => onSelect(conversation.id)}
        className={`flex w-full items-start gap-3 rounded-[10px] px-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 sm:px-3.5 ${
          compact ? 'py-3' : 'min-h-[4.5rem] py-3.5'
        } ${
          selected
            ? 'bg-neutral-100 dark:bg-neutral-950'
            : 'hover:bg-neutral-100/80 focus-visible:bg-neutral-100/80 dark:hover:bg-neutral-950/80 dark:focus-visible:bg-neutral-950/80'
        }`}
      >
        <div className="relative shrink-0">
          <div className={isGroup ? 'rounded-full ring-2 ring-neutral-200 dark:ring-neutral-700' : undefined}>
            <Avatar
              avatarUrl={
                isGroup
                  ? conversation.coverUrl ?? conversation.otherUserAvatarUrl
                  : conversation.otherUserAvatarUrl
              }
              name={conversation.otherUserName}
              size={compact ? 'sm' : 'md'}
              tone="muted"
            />
          </div>
          {showPresenceDot ? (
            <span
              className={
                online
                  ? 'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-950'
                  : 'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-neutral-400 dark:border-neutral-950 dark:bg-neutral-500'
              }
              title={online ? 'Online' : 'Offline'}
              aria-hidden
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`min-w-0 truncate text-sm ${
                unread || selected
                  ? 'font-semibold text-[var(--msg-text)]'
                  : 'font-medium text-[var(--msg-text)]'
              }`}
            >
              {conversation.otherUserName}
            </span>
            <span
              className={`shrink-0 text-[13px] text-[var(--msg-muted)] ${
                showMenu ? 'pr-9 group-hover/row:opacity-0' : ''
              }`}
            >
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            {conversation.guestSession ? (
              <p className="min-w-0 truncate text-[13px] text-[var(--msg-muted)]">
                Guest · {formatGuestExpiry(conversation.guestExpiresAt)}
              </p>
            ) : typingName ? (
              <p className="min-w-0 truncate text-[13px] italic text-[var(--msg-muted)]">
                {typingName} is typing…
              </p>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <InboxPreviewText raw={preview} unread={unread} groupLabel={groupLabel} />
                {outgoingStatus ? (
                  <span className={showMenu ? 'group-hover/row:opacity-0' : undefined}>
                    <InboxMessageStatus status={outgoingStatus} />
                  </span>
                ) : null}
              </div>
            )}
            {unread ? (
              <span className="inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-[var(--msg-brand)] px-1.5 text-[10px] font-semibold text-white">
                {conversation.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </button>
      {showMenu ? (
        <div className="absolute right-5 top-3.5 z-10 sm:right-6">
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
