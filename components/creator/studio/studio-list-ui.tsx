'use client';

import { localeTag, tr } from '@/lib/i18n/active';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * Shared pieces of the My Profile tabs, in the News design (X palette): a 20px extrabold section
 * title over a 15px secondary line, people lists set straight on the page — no box around them —
 * grouped by day under small-caps kickers, rows taking the fill tone under the pointer, relative
 * dates like the feed, X's "Show more" at the foot. Colours are the `.news-theme` tokens of the
 * studio shell.
 */

export function StudioSectionHeading({
  title,
  description,
  action,
  stat,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** The section's headline figure, set large on the right ("562 visitors"). */
  stat?: { value: number; label: string };
}) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h2 className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-xl text-[15px] leading-5 text-[color:var(--gn-ink2)]">{description}</p>
        ) : null}
      </div>
      {stat ? (
        <p className="flex shrink-0 items-baseline gap-2">
          <span className="text-[40px] font-extrabold leading-none tracking-[-0.03em] tabular-nums text-[color:var(--gn-ink)]">
            {stat.value.toLocaleString(localeTag())}
          </span>
          <span className="text-[14px] font-medium leading-5 text-[color:var(--gn-ink2)]">{t(stat.label)}</span>
        </p>
      ) : null}
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Splits a newest-first list into the day groups a people list shows: Today, Yesterday, This week,
 * then one group per month ("September 2026"). Order is kept; empty groups never appear.
 */
export function groupByDay<T>(items: T[], getDate: (item: T) => string): { label: string; items: T[] }[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const day = 86_400_000;
  const groups: { label: string; items: T[] }[] = [];
  for (const item of items) {
    const date = new Date(getDate(item));
    let label: string;
    if (Number.isNaN(date.getTime())) label = tr('Earlier');
    else if (date.getTime() >= startOfToday.getTime()) label = tr('Today');
    else if (date.getTime() >= startOfToday.getTime() - day) label = tr('Yesterday');
    else if (date.getTime() >= startOfToday.getTime() - 6 * day) label = tr('This week');
    else label = date.toLocaleDateString(localeTag(), { month: 'long', year: 'numeric' });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

/** One day group of a people list: a small-caps kicker, then its rows. */
export function StudioPeopleGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label}>
      <h3 className="gn-kicker px-4 pb-1 sm:px-0">{label}</h3>
      <ul>{children}</ul>
    </section>
  );
}

/** "3h", "2d", "Sep 29" — the News feed's dates. */
export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return tr('now');
  if (seconds < 3600) return tr('{count}m', { count: Math.floor(seconds / 60) });
  if (seconds < 86400) return tr('{count}h', { count: Math.floor(seconds / 3600) });
  if (seconds < 7 * 86400) return tr('{count}d', { count: Math.floor(seconds / 86400) });
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(localeTag(), { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SilhouetteAvatar() {
  return (
    <span
      aria-hidden
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--gn-surface)] text-[color:var(--gn-ink3)]"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.5-8 5.5V21h16v-1.5c0-3-3.6-5.5-8-5.5Z" />
      </svg>
    </span>
  );
}

/**
 * One person: 44px avatar, name 15/20 bold, meta 13/18 secondary, date on the right. On the page
 * itself (no card): from sm the row reaches 16px past the column on both sides, so its hover fill
 * frames the avatar and the date instead of cutting flush against them.
 */
export function StudioPersonRow({
  name,
  avatarUrl,
  anonymous = false,
  meta,
  date,
  href,
}: {
  name: string;
  avatarUrl?: string | null;
  anonymous?: boolean;
  meta: ReactNode;
  date: string;
  href?: string | null;
}) {
  const body = (
    <>
      {anonymous ? (
        <SilhouetteAvatar />
      ) : (
        <AvatarImage
          src={avatarUrl}
          displayWidth={44}
          className="h-11 w-11 shrink-0 rounded-full object-cover"
          fallback={
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--gn-surface)] text-[14px] font-semibold text-[color:var(--gn-ink)]">
              {initials(name)}
            </span>
          }
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold leading-5 text-[color:var(--gn-ink)]">{name}</span>
        <span className="mt-0.5 block truncate text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">{meta}</span>
      </span>
      <time
        dateTime={date}
        title={new Date(date).toLocaleString()}
        className="shrink-0 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]"
      >
        {formatRelativeDate(date)}
      </time>
    </>
  );
  const rowClass = 'flex min-h-[68px] items-center gap-3.5 px-4 py-3 sm:-mx-4';
  return (
    <li>
      {href ? (
        <Link
          href={href}
          className={`${rowClass} transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)]`}
        >
          {body}
        </Link>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}

/**
 * A people list, open on the page: its day groups (StudioPeopleGroup) 24px apart, then "Show more"
 * as a full-width hairline-topped row — no card around any of it.
 */
export function StudioPeopleList({
  children,
  hasMore,
  loadingMore,
  onShowMore,
}: {
  children: ReactNode;
  hasMore: boolean;
  loadingMore: boolean;
  onShowMore: () => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-6">
      {children}
      {hasMore ? (
        <button
          type="button"
          disabled={loadingMore}
          onClick={onShowMore}
          className="flex h-12 w-full items-center justify-center gap-2 border-t border-[color:var(--gn-line)] text-[15px] font-semibold text-[color:var(--gn-ink)] underline-offset-4 transition-colors hover:underline disabled:opacity-60"
        >
          {loadingMore ? <LoadingSpinner size="sm" /> : null}
          {t('Show more')}
        </button>
      ) : null}
    </div>
  );
}

/** Empty state: a title and one secondary sentence, centred in a card block (News style). */
export function StudioEmptyBlock({
  title,
  children,
  action,
  bleed = true,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  /** Cancel a 16px phone gutter to run edge to edge (off where the parent has no gutter). */
  bleed?: boolean;
}) {
  return (
    <div className={`gn-card px-6 py-12 text-center ${bleed ? '-mx-4 sm:mx-0' : ''}`}>
      <p className="text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-[color:var(--gn-ink)]">{title}</p>
      {children ? (
        <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-5 text-[color:var(--gn-ink2)]">{children}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** Square page-level primary (News' "Publish a post"). */
export const STUDIO_PRIMARY_BUTTON =
  'inline-flex h-10 items-center justify-center gap-2 bg-[color:var(--gn-primary)] px-5 text-[15px] font-bold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

/** Square secondary: X's hairline outline. */
export const STUDIO_SECONDARY_BUTTON =
  'inline-flex h-10 items-center justify-center gap-2 border border-[#CFD9DE] px-4 text-[14px] font-bold text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] disabled:opacity-50 dark:border-[#536471]';
