'use client';

import { PersonAvatar } from '@/components/ui/PersonAvatar';
import {
  CREATOR_NEW_FOLLOWER_TYPE,
  CREATOR_PROFILE_VISIT_GROUP_TYPE,
  CREATOR_PROFILE_VISIT_TYPE,
  FOLLOWER_NEW_CONTENT_TYPE,
  FOLLOWER_NEW_PRODUCT_TYPE,
  FOLLOWER_NEW_SERVICE_TYPE,
  extractFollowerNameFromFollowMessage,
  extractVisitorNameFromVisitMessage,
  formatNotificationDisplay,
  formatNotificationTimestamp,
  groupNotificationsByTime,
  NOTIFICATION_GROUP_LABELS,
  resolveNotificationHref,
} from '@/lib/notifications';
import type { NotificationDto } from '@/types/ecosystem';

function followerKindLabel(type: string): string | null {
  switch (type) {
    case FOLLOWER_NEW_PRODUCT_TYPE:
      return 'Product';
    case FOLLOWER_NEW_CONTENT_TYPE:
      return 'Content';
    case FOLLOWER_NEW_SERVICE_TYPE:
      return 'Service';
    default:
      return null;
  }
}

function NotificationLeadingIcon({ n }: { n: NotificationDto }) {
  const isFollowerPublish =
    n.type === FOLLOWER_NEW_PRODUCT_TYPE ||
    n.type === FOLLOWER_NEW_CONTENT_TYPE ||
    n.type === FOLLOWER_NEW_SERVICE_TYPE;

  if (
    isFollowerPublish ||
    n.type === CREATOR_PROFILE_VISIT_TYPE ||
    n.type === CREATOR_NEW_FOLLOWER_TYPE
  ) {
    const name =
      n.actorFullName?.trim() ||
      (isFollowerPublish
        ? n.message?.match(/^(.+?)\s+(?:published|shared|added)\b/i)?.[1]?.trim()
        : null) ||
      (n.type === CREATOR_NEW_FOLLOWER_TYPE
        ? extractFollowerNameFromFollowMessage(n.message)
        : extractVisitorNameFromVisitMessage(n.message)) ||
      (isFollowerPublish ? 'Creator' : n.type === CREATOR_NEW_FOLLOWER_TYPE ? 'Follower' : 'Visitor');
    return (
      <span className="mt-0.5 shrink-0">
        <PersonAvatar name={name} avatarUrl={n.actorAvatarUrl} size="md" />
      </span>
    );
  }

  if (n.type === CREATOR_PROFILE_VISIT_GROUP_TYPE) {
    const count = n.aggregatedNotificationIds?.length ?? 0;
    return (
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
        aria-hidden
      >
        {count > 0 ? count : '···'}
      </span>
    );
  }

  return (
    <span
      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
      aria-hidden
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    </span>
  );
}

function viewLabel(n: NotificationDto): string {
  return n.type === CREATOR_PROFILE_VISIT_GROUP_TYPE ? 'View all' : 'View';
}

export function NotificationGroupedList({
  items,
  isAgent,
  onItemClick,
  emptyMessage = 'No notifications',
  variant = 'panel',
}: {
  items: NotificationDto[];
  isAgent: boolean;
  onItemClick: (n: NotificationDto) => void;
  emptyMessage?: string;
  variant?: 'panel' | 'page';
}) {
  const groups = groupNotificationsByTime(items);

  if (groups.length === 0) {
    return (
      <p
        className={`text-center text-sm text-neutral-500 ${
          variant === 'panel' ? 'px-4 py-8' : 'py-16'
        }`}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={variant === 'panel' ? 'py-1' : ''}>
      {groups.map((group, groupIndex) => (
        <section
          key={group.key}
          className={groupIndex > 0 ? 'mt-1 border-t border-neutral-100 dark:border-neutral-800' : ''}
        >
          <div className="flex items-center justify-between px-4 pb-1 pt-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {NOTIFICATION_GROUP_LABELS[group.key]}
            </h3>
          </div>
          <ul>
            {group.items.map((n) => {
              const href = resolveNotificationHref(n.type, n.refId, isAgent, n.refSecondaryId, {
                actorProfileAvailable: n.actorProfileAvailable,
              });
              const showView =
                Boolean(href) ||
                (n.type === CREATOR_PROFILE_VISIT_TYPE && Boolean(n.refSecondaryId)) ||
                (n.type === CREATOR_NEW_FOLLOWER_TYPE && Boolean(n.refSecondaryId));
              const display = formatNotificationDisplay(n);
              const kindLabel = followerKindLabel(n.type);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onItemClick(n)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/80 ${
                      !n.isRead ? 'bg-neutral-50 dark:bg-neutral-800/45' : ''
                    } ${variant === 'page' ? 'border-b border-neutral-100 last:border-b-0 dark:border-neutral-800' : ''}`}
                  >
                    <NotificationLeadingIcon n={n} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {display.title}
                        </span>
                        {kindLabel ? (
                          <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            {kindLabel}
                          </span>
                        ) : null}
                      </span>
                      {display.message && (
                        <span className="mt-0.5 block text-xs leading-snug text-neutral-600 line-clamp-2 dark:text-neutral-400">
                          {display.message}
                        </span>
                      )}
                      <span className="mt-1 block text-[11px] text-neutral-400 dark:text-neutral-500">
                        {formatNotificationTimestamp(n.createdAt)}
                        {showView ? (
                          <>
                            {' · '}
                            <span className="font-medium text-neutral-600 dark:text-neutral-300">
                              {viewLabel(n)}
                            </span>
                          </>
                        ) : null}
                      </span>
                    </span>
                    {!n.isRead && (
                      <span className="notification-unread-dot mt-2" aria-label="Unread" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
