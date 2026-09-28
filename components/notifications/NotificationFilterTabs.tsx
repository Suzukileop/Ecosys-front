'use client';

import type { NotificationFilter } from '@/lib/notifications';

const TABS: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
];

export function NotificationFilterTabs({
  value,
  onChange,
  compact = false,
  underline = false,
  unreadCount = 0,
}: {
  value: NotificationFilter;
  onChange: (value: NotificationFilter) => void;
  compact?: boolean;
  /** Text tabs with a coral underline — the page layout, matching the search results tabs. */
  underline?: boolean;
  unreadCount?: number;
}) {
  if (underline) {
    return (
      <div
        role="tablist"
        aria-label="Filter notifications"
        className={`flex border-b border-black/[0.06] dark:border-white/[0.08] ${compact ? 'mt-3 gap-5' : 'mt-6 gap-6'}`}
      >
        {TABS.map((tab) => {
          const active = value === tab.id;
          const count = tab.id === 'unread' && unreadCount > 0 ? unreadCount : null;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`relative inline-flex items-center gap-1.5 transition-colors duration-200 ${
                compact ? 'py-2.5 text-[14px]' : 'py-3.5 text-base'
              } ${
                active
                  ? 'font-semibold text-[#111111] dark:text-white'
                  : 'font-medium text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
              {count != null ? (
                <span className={`tabular-nums ${active ? 'text-[#FF5722]' : ''}`}>{count}</span>
              ) : null}
              {active ? (
                <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#FF5722]" />
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${compact ? 'mt-3' : 'pb-4'}`}>
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`notification-filter-tab ${
              active ? 'notification-filter-tab-active' : 'notification-filter-tab-idle'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
