'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import {
  faCamera,
  faCompass,
  faFileCode,
  faFileVideo,
  faFolderOpen,
  faNewspaper,
  faObjectGroup,
  faPenToSquare,
} from '@fortawesome/free-regular-svg-icons';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
/** The most in-demand fields, offered as News feed filters. */
const NEWS_INTERESTS = [
  'Developer',
  'Video editor',
  'UI / UX',
  'Design',
  'Marketing',
  'Photography',
] as const;

type NewsInterest = (typeof NEWS_INTERESTS)[number];

const INTEREST_ICONS: Record<NewsInterest, IconDefinition> = {
  Developer: faFileCode,
  'Video editor': faFileVideo,
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
        className="gn-inset h-11 w-full rounded-full pl-10 pr-3 text-[15px] text-[#111111] outline-none transition-colors placeholder:text-neutral-400 focus:border-black/25 dark:border-white/[0.08] dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-white/25"
      />
    </div>
  );
}

export function PortfolioCta() {
  return (
    <Link
      href="/studio"
      className="gn-card group flex items-center gap-3.5 px-6 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 md:px-4"
    >
      <span className="gn-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
        <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-[#111111] dark:text-white">Build your portfolio</span>
        <span className="mt-0.5 block truncate text-[13px] text-neutral-500 dark:text-neutral-400">
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
      className={`gn-nav-item flex min-h-[3rem] w-full items-center gap-3.5 rounded-lg px-3 py-3 text-left text-[15px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 ${
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

/**
 * Discover for phones and tablets. The right rail only exists from `lg`, which used to leave every
 * smaller screen without any way to filter the feed by field — the most direct discovery tool the
 * page has. Same interests, as a swipeable chip row under the tabs (44px touch height on phones).
 */
export function NewsInterestChips({
  selected,
  onSelect,
}: Pick<NewsDiscoverProps, 'selected' | 'onSelect'>) {
  const chips: { label: string; value: string | null }[] = [
    { label: 'All', value: null },
    ...NEWS_INTERESTS.map((label) => ({ label, value: label as string })),
  ];
  return (
    <nav
      aria-label="Filter by interest"
      className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:px-8 md:px-0 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {chips.map((chip) => {
        const active = (selected ?? null) === chip.value;
        return (
          <button
            key={chip.label}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active && chip.value !== null ? null : chip.value)}
            data-pf-no-color-transition
            className={`inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 sm:h-9 ${
              active
                ? 'bg-[#FF5722]/10 text-[#FF5722]'
                : 'gn-soft text-neutral-600 hover:text-[#111111] dark:text-neutral-300 dark:hover:text-white'
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </nav>
  );
}

/** Desktop right rail — portfolio shortcut on top, then a Discover panel styled like the studio "Manage" nav. */
export function NewsDiscoverRail(props: NewsDiscoverProps) {
  return (
    <ProfileSectionStickyAside className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-5">
      <PortfolioCta />
      <div className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex h-14 shrink-0 items-center px-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-neutral-500">
            Discover
          </p>
        </div>
        <div className="gn-card mt-3 flex min-h-0 flex-col overflow-hidden">
        <div className="px-2.5 pt-3">
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
      </div>
    </ProfileSectionStickyAside>
  );
}
