'use client';

import { Avatar } from '@/components/ui/Avatar';
import { InboxMessageStatus } from '@/components/messaging/InboxMessageStatus';
import { getOutgoingMessageStatus } from '@/lib/messaging-status';
import type { ConversationSummary } from '@/types/messaging';

type InboxConversationRowProps = {
  conversation: ConversationSummary;
  selected: boolean;
  currentUserId?: string | null;
  typingName?: string;
  deliveredUserIds?: Set<string>;
  onSelect: (conversationId: string) => void;
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

export function InboxConversationRow({
  conversation,
  selected,
  currentUserId = null,
  typingName,
  deliveredUserIds,
  onSelect,
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

  return (
    <li className="px-3 sm:px-4">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => onSelect(conversation.id)}
        className={`flex w-full items-start gap-3 rounded-[10px] px-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 sm:px-3.5 ${
          compact ? 'py-3' : 'min-h-[4.5rem] py-3.5'
        } ${selected ? 'bg-neutral-100 dark:bg-neutral-950' : 'hover:bg-neutral-100/80 dark:hover:bg-neutral-950/80'}`}
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
            <span className="shrink-0 text-[11px] text-[var(--msg-muted)]">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            {conversation.guestSession ? (
              <p className="min-w-0 truncate text-xs text-[var(--msg-muted)]">
                Guest · {formatGuestExpiry(conversation.guestExpiresAt)}
              </p>
            ) : typingName ? (
              <p className="min-w-0 truncate text-xs italic text-[var(--msg-muted)]">
                {typingName} is typing…
              </p>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <p
                  className={`min-w-0 flex-1 truncate text-xs ${
                    unread ? 'font-medium text-[var(--msg-text)]' : 'text-[var(--msg-muted)]'
                  }`}
                >
                  {groupLabel ? (
                    <span className="font-medium text-[var(--msg-muted)]">{groupLabel} · </span>
                  ) : null}
                  {preview}
                </p>
                {outgoingStatus ? <InboxMessageStatus status={outgoingStatus} /> : null}
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
    </li>
  );
}
