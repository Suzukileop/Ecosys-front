'use client';

import type { ReactNode } from 'react';
import { SHOW_GROUP_CHAT } from '@/lib/messaging-feature-flags';

export type InboxFilterId = 'all' | 'unread' | 'groups' | 'temporary';

type InboxFilterChip = {
  id: InboxFilterId;
  label: string;
  count?: number;
};

type InboxPanelProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filter: InboxFilterId;
  onFilterChange: (filter: InboxFilterId) => void;
  filterCounts: { unread: number; groups: number; temporary: number };
  onNewMessage: () => void;
  onNewGroup?: () => void;
  pendingInvites?: ReactNode;
  children: ReactNode;
};

export function InboxPanel({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  filterCounts,
  onNewMessage,
  onNewGroup,
  pendingInvites,
  children,
}: InboxPanelProps) {
  const chips: InboxFilterChip[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: filterCounts.unread },
    ...(SHOW_GROUP_CHAT ? [{ id: 'groups' as const, label: 'Groups', count: filterCounts.groups }] : []),
    { id: 'temporary', label: 'Temporary', count: filterCounts.temporary },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-3 border-b border-neutral-200 p-3 sm:p-4 dark:border-neutral-800">
        <button
          type="button"
          onClick={onNewMessage}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--msg-brand,#F47B20)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--msg-brand-hover,#E06E18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msg-brand)]/40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
            />
          </svg>
          New message
        </button>

        {SHOW_GROUP_CHAT && onNewGroup ? (
          <button
            type="button"
            onClick={onNewGroup}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-[10px] border border-[var(--msg-border)] bg-[var(--msg-card)] px-3 text-xs font-medium text-[var(--msg-text)] transition hover:bg-[var(--msg-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40"
          >
            New group
          </button>
        ) : null}

        <div className="relative">
          <label htmlFor="inbox-search" className="sr-only">
            Search messages
          </label>
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--msg-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="inbox-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages"
            className="h-11 w-full rounded-[10px] border border-neutral-200 bg-neutral-100 py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-400"
          />
        </div>

        <div
          className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter conversations"
        >
          {chips.map((chip) => {
            const active = filter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(chip.id)}
                className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 ${
                  active
                    ? 'border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100'
                    : 'border-neutral-200 bg-transparent text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-950'
                }`}
              >
                {chip.label}
                {chip.count != null && chip.count > 0 ? (
                  <span className="ml-1.5 tabular-nums opacity-80">{chip.count}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {pendingInvites}

      <div className="min-h-0 flex-1 overflow-y-auto py-1 [scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600">
        {children}
      </div>
    </div>
  );
}
