'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import {
  faCamera,
  faChartBar,
  faCompass,
  faFileCode,
  faFileVideo,
  faFolderOpen,
  faLightbulb,
  faNewspaper,
  faObjectGroup,
  faPenToSquare,
} from '@fortawesome/free-regular-svg-icons';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
/** The eight most in-demand fields, offered as News feed filters. */
export const NEWS_INTERESTS = [
  'AI',
  'Developer',
  'Video editor',
  'Data analyst',
  'UI / UX',
  'Design',
  'Marketing',
  'Photography',
] as const;

export type NewsInterest = (typeof NEWS_INTERESTS)[number];

const INTEREST_ICONS: Record<NewsInterest, IconDefinition> = {
  AI: faLightbulb,
  Developer: faFileCode,
  'Video editor': faFileVideo,
  'Data analyst': faChartBar,
  'UI / UX': faObjectGroup,
  Design: faPenToSquare,
  Marketing: faNewspaper,
  Photography: faCamera,
};

type NewsDiscoverProps = {
  selected: string | null;
  onSelect: (value: string | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
};

function chipClass(active: boolean) {
  return `inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[15px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/30 ${
    active
      ? 'bg-[#111111] font-medium text-white dark:bg-white dark:text-[#111111]'
      : 'border border-black/[0.08] text-neutral-700 hover:border-black/20 hover:text-[#111111] dark:border-white/[0.1] dark:text-neutral-300 dark:hover:border-white/25 dark:hover:text-white'
  }`;
}

function SearchField({ search, onSearchChange, id }: Pick<NewsDiscoverProps, 'search' | 'onSearchChange'> & { id: string }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        Search content
      </label>
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
      </svg>
      <input
        id={id}
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search content…"
        autoComplete="off"
        className="h-11 w-full rounded-lg border border-black/[0.08] bg-white pl-10 dark:bg-transparent pr-3 text-[15px] text-[#111111] outline-none transition-colors placeholder:text-neutral-400 focus:border-black/25 dark:border-white/[0.08] dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-white/25"
      />
    </div>
  );
}

export function PortfolioCta() {
  return (
    <Link
      href="/dashboard/portfolio"
      className="group flex items-center gap-3.5 bg-[#EEF0F2] px-6 py-4 md:rounded-lg md:px-4 transition-[filter] hover:brightness-[0.97] dark:hover:brightness-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 dark:bg-[#111111] dark:hover:bg-white/[0.04]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#111111] text-white dark:bg-white dark:text-[#111111]">
        <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-medium text-[#111111] dark:text-white">Build your portfolio</span>
        <span className="mt-0.5 block truncate text-[14px] text-neutral-500 dark:text-neutral-400">
          Showcase your best work
        </span>
      </span>
      <FontAwesomeIcon
        icon={faChevronRight}
        className="h-3 w-3 shrink-0 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-neutral-500"
      />
    </Link>
  );
}

function InterestNavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: IconDefinition;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[3.25rem] w-full items-center gap-3.5 rounded-lg px-3 py-3.5 text-left text-[16px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
        active
          ? 'font-medium text-[#FF5722]'
          : 'font-normal text-[#222222] hover:bg-black/[0.03] hover:text-[#0A0A0A] dark:text-neutral-300 dark:hover:bg-white/[0.05] dark:hover:text-white'
      }`}
    >
      <FontAwesomeIcon
        icon={icon}
        className={`h-[1.05rem] w-[1.05rem] shrink-0 ${active ? '' : 'text-[#555555] dark:text-neutral-400'}`}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

/** Desktop right rail — portfolio shortcut on top, then a Discover panel styled like the studio "Manage" nav. */
export function NewsDiscoverRail(props: NewsDiscoverProps) {
  return (
    <ProfileSectionStickyAside className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-5">
      <PortfolioCta />
      <div className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex h-14 shrink-0 items-center px-5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-neutral-500">
            Discover
          </p>
        </div>
        <div className="px-4 pt-4">
          <SearchField id="news-discover-search" search={props.search} onSearchChange={props.onSearchChange} />
        </div>
        <nav
          aria-label="Filter by interest"
          className="flex min-h-0 w-full flex-col gap-2 overflow-y-auto px-2.5 pb-3 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <InterestNavItem
            label="All"
            icon={faCompass}
            active={!props.selected}
            onClick={() => props.onSelect(null)}
          />
          {NEWS_INTERESTS.map((label) => {
            const active = props.selected === label;
            return (
              <InterestNavItem
                key={label}
                label={label}
                icon={INTEREST_ICONS[label]}
                active={active}
                onClick={() => props.onSelect(active ? null : label)}
              />
            );
          })}
        </nav>
      </div>
    </ProfileSectionStickyAside>
  );
}

/** Mobile / tablet counterpart shown above the feed. */
export function NewsDiscoverBar(props: NewsDiscoverProps) {
  return (
    <div className="space-y-4">
      <SearchField id="news-discover-search-mobile" search={props.search} onSearchChange={props.onSearchChange} />
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Filter by interest"
      >
        <button type="button" onClick={() => props.onSelect(null)} aria-pressed={!props.selected} className={chipClass(!props.selected)}>
          All
        </button>
        {NEWS_INTERESTS.map((label) => {
          const active = props.selected === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => props.onSelect(active ? null : label)}
              aria-pressed={active}
              className={chipClass(active)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
