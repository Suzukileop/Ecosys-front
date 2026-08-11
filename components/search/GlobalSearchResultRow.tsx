'use client';

import { Avatar } from '@/components/ui/Avatar';
import type { GlobalSearchItem } from '@/lib/global-search';

function HashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3h4M7 21h4m3-18l-2 18M14 3l-2 18M5 9h14M4 15h14" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function isPeopleCategory(category: GlobalSearchItem['category']) {
  return category === 'users' || category === 'creators';
}

export function GlobalSearchResultThumbnail({ item }: { item: GlobalSearchItem }) {
  if (isPeopleCategory(item.category)) {
    const avatarUrl = item.avatarUrl?.trim();
    if (avatarUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-11 w-11 shrink-0 rounded-full bg-neutral-100 object-cover ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700"
        />
      );
    }
    return (
      <div className="shrink-0">
        <Avatar name={item.title} size="md" tone="muted" />
      </div>
    );
  }

  if (item.thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.thumbnailUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
      />
    );
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
      <HashIcon className="h-4 w-4" />
    </span>
  );
}

type GlobalSearchResultRowProps = {
  item: GlobalSearchItem;
  onClick: () => void;
  onMouseEnter?: () => void;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
};

export function GlobalSearchResultRow({
  item,
  onClick,
  onMouseEnter,
  selected = false,
  disabled = false,
  compact = false,
}: GlobalSearchResultRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl px-3 text-left transition disabled:opacity-60 ${
        compact ? 'py-2.5' : 'py-3'
      } ${
        selected
          ? 'bg-neutral-100 text-neutral-900 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-white dark:ring-neutral-700'
          : 'text-neutral-900 hover:bg-neutral-50 dark:text-white dark:hover:bg-neutral-800/60'
      }`}
    >
      <GlobalSearchResultThumbnail item={item} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{item.title}</p>
        {item.subtitle ? (
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{item.subtitle}</p>
        ) : null}
      </div>
      {item.badge ? (
        <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {item.badge}
        </span>
      ) : null}
      <ChevronIcon className="h-4 w-4 shrink-0 text-neutral-400" />
    </button>
  );
}

export function getGlobalSearchItemHref(item: GlobalSearchItem): string {
  switch (item.category) {
    case 'creators':
      return `/marketplace/${item.id}`;
    case 'products':
      return `/marketplace/products/${item.id}`;
    case 'content':
      return `/marketplace/content/${item.id}`;
    default:
      return '/dashboard/discussions';
  }
}
