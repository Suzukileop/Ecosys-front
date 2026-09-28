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
  const textClass = unread ? 'font-medium text-[var(--msg-ink)]' : 'text-[var(--msg-ink-faint)]';

  return (
    <p className={`flex min-w-0 flex-1 items-center gap-1.5 truncate text-[14px] ${textClass}`}>
      {groupLabel ? <span className="shrink-0">{groupLabel} · </span> : null}
      {icon ? (
        <FontAwesomeIcon icon={icon} className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
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
    <li className="group/row relative">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => onSelect(conversation.id)}
        className={`relative flex w-full items-center gap-4 rounded-lg px-3 text-left transition-colors duration-200 focus-visible:outline-none ${
          compact ? 'py-3' : 'py-3.5'
        } ${
          selected
            ? 'bg-[var(--msg-wash)]'
            : 'hover:bg-[var(--msg-wash)] focus-visible:bg-[var(--msg-wash)]'
        }`}
      >
        <span
          aria-hidden
          className={`absolute inset-y-4 left-0 w-[3px] rounded-full bg-[var(--msg-coral)] transition-opacity duration-200 ${
            selected ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="relative shrink-0">
          <span
            data-portrait-active={selected ? 'true' : 'false'}
            className={`msg-portrait block overflow-hidden rounded-full ring-1 ${
              selected ? 'ring-[var(--msg-hairline-strong)]' : 'ring-[var(--msg-hairline)]'
            }`}
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
              className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[var(--msg-panel)] bg-[var(--msg-online)]"
              title={online ? 'Online' : 'Offline'}
              aria-hidden
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={`min-w-0 truncate text-base transition-colors duration-200 ${
                selected || unread
                  ? 'font-semibold text-[var(--msg-ink)]'
                  : 'font-medium text-[var(--msg-ink)]'
              }`}
            >
              {conversation.otherUserName}
            </span>
            <span
              className={`msg-micro shrink-0 text-[var(--msg-ink-faint)] ${
                showMenu ? 'pr-7 transition-opacity duration-300 group-hover/row:opacity-0' : ''
              }`}
            >
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between gap-3">
            {conversation.guestSession ? (
              <p className="min-w-0 truncate text-[14px] text-[var(--msg-ink-faint)]">
                Guest · {formatGuestExpiry(conversation.guestExpiresAt)}
              </p>
            ) : typingName ? (
              <p className="min-w-0 truncate text-[14px] italic text-[var(--msg-ink-soft)]">
                {typingName} is typing…
              </p>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <InboxPreviewText raw={preview} unread={unread} groupLabel={groupLabel} />
                {outgoingStatus ? (
                  <span
                    className={`text-[var(--msg-ink-faint)] ${
                      showMenu ? 'transition-opacity duration-300 group-hover/row:opacity-0' : ''
                    }`}
                  >
                    <InboxMessageStatus status={outgoingStatus} />
                  </span>
                ) : null}
              </div>
            )}
            {unread ? (
              <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--msg-coral)] px-1.5 text-[11.5px] font-semibold tabular-nums text-white">
                {conversation.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </button>

      {showMenu ? (
        <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-[var(--msg-ink-faint)]">
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
