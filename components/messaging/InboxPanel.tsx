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

/**
 * Every control in the panel head is a line of text with a hairline under it, never a box.
 * `+ New` in particular: the orange slab it replaces was the loudest object on the screen
 * and the least interesting one — an action that is used once a session does not get to
 * outweigh the conversation list it sits above.
 */
function InboxAction({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex shrink-0 items-center gap-2 text-[var(--msg-ink-faint)] transition-colors duration-300 hover:text-[var(--msg-ink)] focus-visible:text-[var(--msg-ink)] focus-visible:outline-none"
    >
      <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90">
        {icon}
      </span>
      <span className="msg-micro">{label}</span>
    </button>
  );
}

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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-6 pt-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[1.5rem] font-bold leading-none tracking-[-0.02em] text-[var(--msg-ink)]">
            Messages
          </h2>
          <button
            type="button"
            onClick={onNewMessage}
            title="New message"
            aria-label="New message"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--msg-ink)] text-[var(--msg-panel)] transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--msg-coral)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--msg-panel)]"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {SHOW_GROUP_CHAT && onNewGroup ? (
          <div className="mt-3">
            <InboxAction
              label="New group"
              onClick={onNewGroup}
              icon={
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM18 8v5M20.5 10.5h-5" />
                </svg>
              }
            />
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-2.5 rounded-lg bg-[var(--msg-wash)] px-3.5 py-2.5 ring-1 ring-transparent transition focus-within:bg-transparent focus-within:ring-[var(--msg-hairline-strong)]">
          <label htmlFor="inbox-search" className="sr-only">
            Search in messages
          </label>
          <svg
            className="h-4 w-4 shrink-0 text-[var(--msg-ink-faint)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4.2-4.2" />
          </svg>
          <input
            id="inbox-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-[var(--msg-ink)] outline-none ring-0 placeholder:text-[var(--msg-ink-faint)] focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>

        <div
          role="tablist"
          aria-label="Filter conversations"
          className="-mx-1 mt-4 flex gap-5 overflow-x-auto border-b border-[var(--msg-hairline)] px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {chips.map((chip) => {
            const active = chip.id === filter;
            return (
              <button
                key={chip.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(chip.id)}
                className={`relative inline-flex shrink-0 items-center gap-1.5 py-3 text-[14px] transition-colors duration-200 ${
                  active
                    ? 'font-semibold text-[var(--msg-ink)]'
                    : 'font-medium text-[var(--msg-ink-faint)] hover:text-[var(--msg-ink)]'
                }`}
              >
                {chip.label}
                {chip.count != null && chip.count > 0 ? (
                  <span className={`tabular-nums ${active ? 'text-[var(--msg-coral)]' : ''}`}>{chip.count}</span>
                ) : null}
                {active ? (
                  <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--msg-coral)]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {pendingInvites}
      {temporaryAvatars}

      <div className="msg-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">{children}</div>

      {footer}
    </div>
  );
}
