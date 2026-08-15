'use client';

import { PROFILE_SPECIALTIES } from '@/lib/specialties';

/** Interests shown in the News discover rail (2-column grid, 12 items). */
export const NEWS_INTERESTS = PROFILE_SPECIALTIES;

export type NewsInterest = (typeof NEWS_INTERESTS)[number];

/** Shared row height with the “Don’t stay a spectator” bar for vertical alignment. */
export const NEWS_TOP_ROW_CLASS = 'flex min-h-[3.5rem] shrink-0 items-center';

const COLLAPSED_COUNT = 5;

/** Same footprint for every catalogue chip (expanded grid + folded list). */
const CHIP_BASE =
  'flex h-10 w-full max-w-[8.25rem] shrink-0 items-center justify-center rounded-xl border px-2 text-center text-xs font-semibold leading-snug transition';

const CHIP_BASE_EXPANDED = `${CHIP_BASE} justify-self-center`;

function chipTone(active: boolean) {
  return active
    ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
    : 'border-neutral-300 bg-transparent text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-500';
}

type NewsDiscoverRailProps = {
  selected: string | null;
  onSelect: (value: string | null) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  /** Bottom search field — hidden on Service Provider catalog. */
  showSearch?: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  className?: string;
};

export function NewsDiscoverRail({
  selected,
  onSelect,
  search = '',
  onSearchChange,
  showSearch = true,
  expanded,
  onExpandedChange,
  className = '',
}: NewsDiscoverRailProps) {
  const visible = expanded ? NEWS_INTERESTS : NEWS_INTERESTS.slice(0, COLLAPSED_COUNT);

  return (
    <aside
      className={`flex min-h-0 flex-col transition-[width,max-width,min-width] duration-300 ease-out ${
        expanded
          ? 'w-full xl:w-[19rem] xl:min-w-[19rem] xl:max-w-[19rem]'
          : 'w-full xl:w-[11rem] xl:min-w-[11rem] xl:max-w-[11rem]'
      } xl:shrink-0 ${className}`}
      aria-label="Discover"
      data-expanded={expanded ? 'true' : 'false'}
    >
      <div
        className={`flex min-h-0 flex-col overflow-hidden ${
          expanded
            ? 'min-h-0 flex-1 basis-1/2 border-b border-neutral-200/80 dark:border-neutral-800'
            : 'shrink-0 pr-1'
        }`}
      >
        {expanded ? (
          <div className={`${NEWS_TOP_ROW_CLASS} gap-2`}>
            <h2 className="min-w-0 flex-1 text-sm font-semibold tracking-tight text-neutral-900 sm:text-base dark:text-white">
              What are you looking for?
            </h2>
            <button
              type="button"
              onClick={() => onExpandedChange(false)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-expanded
              aria-label="Collapse catalogue"
              title="Collapse"
            >
              <svg
                className="h-3.5 w-3.5 rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.25}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative flex min-h-[3.5rem] shrink-0 items-center justify-center px-1">
            <p className="px-7 text-center text-xs font-bold uppercase leading-snug tracking-wide text-neutral-950 dark:text-white sm:text-sm">
              Looking for
            </p>
            <button
              type="button"
              onClick={() => onExpandedChange(true)}
              className="absolute right-0 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-expanded={false}
              aria-label="Expand catalogue"
              title="Expand"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.25}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <div
          className={
            expanded
              ? 'mt-2 flex min-h-0 flex-1 flex-col'
              : 'mt-1 shrink-0 pb-3'
          }
        >
          <div
            className={
              expanded
                ? 'min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]'
                : ''
            }
          >
            <div
              className={
                expanded
                  ? 'grid grid-cols-2 gap-x-4 gap-y-2.5 px-1'
                  : 'mx-auto flex w-[calc(100%-0.35rem)] max-w-[9.5rem] flex-col gap-2.5 pr-1 sm:gap-3'
              }
            >
              {visible.map((label) => {
                const active = selected === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onSelect(active ? null : label)}
                    aria-pressed={active}
                    title={label}
                    className={`${expanded ? CHIP_BASE_EXPANDED : CHIP_BASE} ${chipTone(active)}`}
                  >
                    <span className="line-clamp-2 px-0.5">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {expanded && showSearch ? (
            <div className="mt-3 shrink-0 pb-3">
              <label htmlFor="news-discover-search" className="sr-only">
                Search content
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                  />
                </svg>
                <input
                  id="news-discover-search"
                  type="search"
                  value={search}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Search content…"
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-100 py-2 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-orange-500/60"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {expanded ? <div className="min-h-0 flex-1 basis-1/2" aria-hidden /> : null}
    </aside>
  );
}
