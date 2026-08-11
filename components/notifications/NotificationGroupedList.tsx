'use client';

import {
  formatNotificationDisplay,
  groupNotificationsByTime,
  NOTIFICATION_GROUP_LABELS,
  resolveNotificationHref,
} from '@/lib/notifications';
import type { NotificationDto } from '@/types/ecosystem';

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
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
        <section key={group.key} className={groupIndex > 0 ? 'mt-1 border-t border-neutral-100 dark:border-neutral-800' : ''}>
          <div className="flex items-center justify-between px-4 pb-1 pt-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {NOTIFICATION_GROUP_LABELS[group.key]}
            </h3>
          </div>
          <ul>
            {group.items.map((n) => {
              const href = resolveNotificationHref(n.type, n.refId, isAgent, n.refSecondaryId);
              const display = formatNotificationDisplay(n);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onItemClick(n)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/80 ${
                      !n.isRead ? 'bg-orange-50/70 dark:bg-orange-950/20' : ''
                    } ${variant === 'page' ? 'border-b border-neutral-100 last:border-b-0 dark:border-neutral-800' : ''}`}
                  >
                    <span
                      className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7ED] text-[#EA580C] dark:bg-orange-950/50 dark:text-[#FB923C]"
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
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-neutral-900 dark:text-white">{display.title}</span>
                      {display.message && (
                        <span className="mt-0.5 block text-xs leading-snug text-neutral-600 line-clamp-2 dark:text-neutral-400">
                          {display.message}
                        </span>
                      )}
                      <span className="mt-1 block text-[11px] text-neutral-400 dark:text-neutral-500">
                        {formatRelativeTime(n.createdAt)}
                        {href ? (
                          <>
                            {' · '}
                            <span className="text-[#EA580C] dark:text-[#FB923C]">View</span>
                          </>
                        ) : null}
                      </span>
                    </span>
                    {!n.isRead && (
                      <span
                        className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#F97316]"
                        aria-label="Unread"
                      />
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
