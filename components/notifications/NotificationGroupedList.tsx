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
import type { NotificationDto } from '@/types/profile';

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

function NotificationLeadingIcon({ n, size = 'md' }: { n: NotificationDto; size?: 'md' | 'lg' }) {
  const discClass = size === 'lg' ? 'h-11 w-11' : 'mt-0.5 h-9 w-9';
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
      <span className={size === 'lg' ? 'shrink-0' : 'mt-0.5 shrink-0'}>
        <PersonAvatar name={name} avatarUrl={n.actorAvatarUrl} size={size} />
      </span>
    );
  }

  if (n.type === CREATOR_PROFILE_VISIT_GROUP_TYPE) {
    const count = n.aggregatedNotificationIds?.length ?? 0;
    return (
      <span
        className={`${discClass} flex shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300`}
        aria-hidden
      >
        {count > 0 ? count : '···'}
      </span>
    );
  }

  return (
    <span
      className={`${discClass} flex shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400`}
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

function canView(n: NotificationDto): boolean {
  const href = resolveNotificationHref(n.type, n.refId, n.refSecondaryId, {
    actorProfileAvailable: n.actorProfileAvailable,
  });
  return (
    Boolean(href) ||
    (n.type === CREATOR_PROFILE_VISIT_TYPE && Boolean(n.refSecondaryId)) ||
    (n.type === CREATOR_NEW_FOLLOWER_TYPE && Boolean(n.refSecondaryId))
  );
}

/** Full-page layout: one white frame per time group, airy rows, reading-size type. */
function NotificationPageList({
  groups,
  onItemClick,
  emptyMessage,
}: {
  groups: ReturnType<typeof groupNotificationsByTime>;
  onItemClick: (n: NotificationDto) => void;
  emptyMessage: string;
}) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <span
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-full bg-black/[0.04] text-neutral-400 dark:bg-white/[0.06] dark:text-neutral-500"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </span>
        <p className="mt-5 text-base font-medium text-neutral-500 dark:text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-4 text-lg font-bold text-[#111111] dark:text-white">
            {NOTIFICATION_GROUP_LABELS[group.key]}
            <span className="font-bold text-neutral-400 dark:text-neutral-500">
              {' · '}
              {String(group.items.length).padStart(2, '0')}
            </span>
          </h2>
          <ul className="overflow-hidden rounded-lg border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-[#111111]">
            {group.items.map((n) => {
              const display = formatNotificationDisplay(n);
              const kindLabel = followerKindLabel(n.type);
              const showView = canView(n);
              return (
                <li key={n.id} className="border-b border-black/[0.06] last:border-b-0 dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => onItemClick(n)}
                    className="group/n flex w-full items-center gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] sm:gap-5"
                  >
                    <NotificationLeadingIcon n={n} size="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span
                          className={`text-base ${
                            n.isRead
                              ? 'font-medium text-neutral-700 dark:text-neutral-300'
                              : 'font-semibold text-[#111111] dark:text-white'
                          }`}
                        >
                          {display.title}
                        </span>
                        {kindLabel ? (
                          <span className="text-[14px] font-medium text-neutral-400 dark:text-neutral-500">
                            · {kindLabel}
                          </span>
                        ) : null}
                      </span>
                      {display.message ? (
                        <span className="mt-1 block line-clamp-2 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                          {display.message}
                        </span>
                      ) : null}
                      <span className="mt-1.5 block text-[13.5px] text-neutral-400 dark:text-neutral-500">
                        {formatNotificationTimestamp(n.createdAt)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-4">
                      {showView ? (
                        <span className="hidden text-[14px] font-medium text-neutral-500 transition-colors group-hover/n:text-[#FF5722] dark:text-neutral-400 sm:inline">
                          {viewLabel(n)} →
                        </span>
                      ) : null}
                      <span
                        aria-label={n.isRead ? undefined : 'Unread'}
                        className={`h-2 w-2 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-[#FF5722]'}`}
                      />
                    </span>
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

export function NotificationGroupedList({
  items,
  onItemClick,
  emptyMessage = 'No notifications',
  variant = 'panel',
}: {
  items: NotificationDto[];
  onItemClick: (n: NotificationDto) => void;
  emptyMessage?: string;
  variant?: 'panel' | 'page';
}) {
  const groups = groupNotificationsByTime(items);

  if (variant === 'page') {
    return <NotificationPageList groups={groups} onItemClick={onItemClick} emptyMessage={emptyMessage} />;
  }

  if (groups.length === 0) {
    return (
      <p className="px-5 py-12 text-center text-[14px] font-medium text-neutral-500 dark:text-neutral-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="px-2 pb-2">
      {groups.map((group) => (
        <section key={group.key}>
          <h3 className="px-3 pb-1.5 pt-4 text-[13px] font-semibold text-neutral-500 dark:text-neutral-400">
            {NOTIFICATION_GROUP_LABELS[group.key]}
          </h3>
          <ul>
            {group.items.map((n) => {
              const showView = canView(n);
              const display = formatNotificationDisplay(n);
              const kindLabel = followerKindLabel(n.type);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onItemClick(n)}
                    className="group/n flex w-full items-center gap-3.5 rounded-lg px-3 py-3 text-left transition-colors duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  >
                    <NotificationLeadingIcon n={n} size="lg" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-1.5">
                        <span
                          className={`text-[15px] ${
                            n.isRead
                              ? 'font-medium text-neutral-700 dark:text-neutral-300'
                              : 'font-semibold text-[#111111] dark:text-white'
                          }`}
                        >
                          {display.title}
                        </span>
                        {kindLabel ? (
                          <span className="text-[13px] font-medium text-neutral-400 dark:text-neutral-500">
                            · {kindLabel}
                          </span>
                        ) : null}
                      </span>
                      {display.message ? (
                        <span className="mt-0.5 block line-clamp-2 text-[14px] leading-snug text-neutral-600 dark:text-neutral-400">
                          {display.message}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-[12.5px] text-neutral-400 dark:text-neutral-500">
                        {formatNotificationTimestamp(n.createdAt)}
                        {showView ? (
                          <span className="font-medium text-neutral-500 transition-colors group-hover/n:text-[#FF5722] dark:text-neutral-400">
                            {' · '}
                            {viewLabel(n)} →
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span
                      aria-label={n.isRead ? undefined : 'Unread'}
                      className={`h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-[#FF5722]'}`}
                    />
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
