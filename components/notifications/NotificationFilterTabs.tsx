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
    <div className={`flex gap-2 ${compact ? 'px-4 pb-3' : 'pb-4'}`}>
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              active
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
