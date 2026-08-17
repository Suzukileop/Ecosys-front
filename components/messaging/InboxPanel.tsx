'use client';

import type { ReactNode } from 'react';
import { SHOW_GROUP_CHAT } from '@/lib/messaging-feature-flags';

export type InboxFilterId = 'all' | 'unread' | 'groups' | 'temporary' | 'archived';

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
  filterCounts: { unread: number; groups: number; temporary: number; archived: number };
  onNewMessage: () => void;
  onNewGroup?: () => void;
  pendingInvites?: ReactNode;
  temporaryAvatars?: ReactNode;
  /** Sticky footer under the conversation list (e.g. Audience strip). */
  footer?: ReactNode;
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
  temporaryAvatars,
  footer,
  children,
}: InboxPanelProps) {
  const chips: InboxFilterChip[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: filterCounts.unread },
    ...(SHOW_GROUP_CHAT ? [{ id: 'groups' as const, label: 'Groups', count: filterCounts.groups }] : []),
    { id: 'temporary', label: 'Temporary', count: filterCounts.temporary },
    { id: 'archived', label: 'Archived', count: filterCounts.archived },
  ];

  const activeFilterLabel = chips.find((chip) => chip.id === filter)?.label ?? 'All';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-3 border-b border-neutral-200 p-3 sm:p-4 dark:border-neutral-800">
        <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] items-center gap-x-2 gap-y-3">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
            Messages
          </h2>
          <button
            type="button"
            onClick={onNewMessage}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--msg-brand,#F47B20)] px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--msg-brand-hover,#E06E18)] hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msg-brand)]/50 focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
              />
            </svg>
            New
          </button>

          {SHOW_GROUP_CHAT && onNewGroup ? (
            <button
              type="button"
              onClick={onNewGroup}
              className="col-span-2 inline-flex min-h-9 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              New group
            </button>
          ) : null}

          <div className="relative min-w-0">
            <label htmlFor="inbox-search" className="sr-only">
              Search in messages
            </label>
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
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
              placeholder="Search in messages..."
              className="h-11 w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>

          <div className="relative w-full">
            <label htmlFor="inbox-filter" className="sr-only">
              Filter conversations
            </label>
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </span>
            <select
              id="inbox-filter"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as InboxFilterId)}
              aria-label={`Filter: ${activeFilterLabel}`}
              className="h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-white py-2 pl-8 pr-8 text-sm font-medium text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            >
              {chips.map((chip) => (
                <option key={chip.id} value={chip.id}>
                  {chip.label}
                  {chip.count != null && chip.count > 0 ? ` (${chip.count})` : ''}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {pendingInvites}
      {temporaryAvatars}

      <div className="min-h-0 flex-1 overflow-y-auto py-1 [scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600">
        {children}
      </div>

      {footer}
    </div>
  );
}
