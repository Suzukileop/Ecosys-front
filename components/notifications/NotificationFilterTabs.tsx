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
}: {
  value: NotificationFilter;
  onChange: (value: NotificationFilter) => void;
  compact?: boolean;
}) {
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
