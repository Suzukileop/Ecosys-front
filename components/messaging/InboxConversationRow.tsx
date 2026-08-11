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
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => onSelect(conversation.id)}
        className={`flex w-full items-start gap-3 rounded-2xl px-3 text-left transition ${
          compact ? 'py-2.5' : 'py-3'
        } ${
          selected
            ? 'bg-white dark:bg-neutral-800'
            : 'hover:bg-gray-200/70 dark:hover:bg-neutral-800/80'
        }`}
      >
        <div className="relative shrink-0">
          <div
            className={`rounded-full ${isGroup ? 'ring-2 ring-[#F97316]/35 dark:ring-[#FB923C]/40' : ''}`}
          >
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
          {selected && (
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-900"
              aria-hidden
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`truncate text-sm ${
                unread || selected
                  ? 'font-bold text-gray-900 dark:text-white'
                  : 'font-semibold text-gray-800 dark:text-neutral-200'
              }`}
            >
              {conversation.otherUserName}
            </span>
            <span className="shrink-0 text-[11px] text-gray-400 dark:text-neutral-500">
              {formatRelativeTime(conversation.lastMessageAt)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            {conversation.guestSession ? (
              <p className="truncate text-xs text-gray-600 dark:text-neutral-400">
                Guest · {formatGuestExpiry(conversation.guestExpiresAt)}
              </p>
            ) : typingName ? (
              <p className="truncate text-xs italic text-gray-600 dark:text-neutral-400">{typingName} is typing…</p>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <p
                  className={`min-w-0 flex-1 truncate text-xs ${
                    unread ? 'text-gray-700 dark:text-neutral-300' : 'text-gray-500 dark:text-neutral-400'
                  }`}
                >
                  {groupLabel ? (
                    <span className="font-medium text-neutral-500 dark:text-neutral-400">{groupLabel} · </span>
                  ) : null}
                  {preview}
                </p>
                {outgoingStatus ? <InboxMessageStatus status={outgoingStatus} /> : null}
              </div>
            )}
            {unread && (
              <span className="inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-neutral-800 px-1.5 text-[10px] font-semibold text-white dark:bg-neutral-200 dark:text-neutral-900">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}
