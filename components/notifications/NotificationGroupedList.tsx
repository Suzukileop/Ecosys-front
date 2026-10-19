'use client';

import { localeTag, trPlural } from '@/lib/i18n/active';
import { useMemo, type ReactNode } from 'react';
import { formatPostTime } from '@/components/home/NewsFeedPostParts';
import { RailGlyph } from '@/components/home/NewsDiscoverRail';
import { PersonAvatar } from '@/components/ui/PersonAvatar';
import {
  CREATOR_NEW_FOLLOWER_TYPE,
  CREATOR_PROFILE_VISIT_GROUP_TYPE,
  CREATOR_PROFILE_VISIT_TYPE,
  FOLLOWER_NEW_CONTENT_TYPE,
  FOLLOWER_NEW_PRODUCT_TYPE,
  FOLLOWER_NEW_SERVICE_TYPE,
  MARKETPLACE_NEW_COMMENT_TYPE,
  extractFollowerNameFromFollowMessage,
  extractVisitorNameFromVisitMessage,
  formatNotificationDisplay,
} from '@/lib/notifications';
import { KIND_GLYPHS, notificationKind, type NotificationKind } from '@/components/notifications/notificationViews';
import type { NotificationDto } from '@/types/profile';
import '@/app/(app)/notifications/x-notifications.css';
import { msg } from '@/lib/i18n/config';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * Notifications in News's X palette (black & white), shared by the page and the bell's panel:
 *  - grouped by day — Today, Yesterday, Last 7 days, Earlier — under News's small-caps kicker with
 *    its 6px square ink marker ("■ TODAY · 2 NEW");
 *  - on the page, one square tonal block per day (edge to edge on phones); in the panel, rows sit on
 *    the sheet. No hairlines: rows are set apart by air, the fill tone only under the pointer;
 *  - each row: the actor's avatar with a small ink badge saying what happened (follow, visit,
 *    product, post, service, comment), a bold actor leading a plain sentence, the item itself as a
 *    grey preview line, then News-style relative time ("3h", "2d", "Sep 29");
 *  - unread: the sentence a step heavier and one ink dot at the right — no accent hue.
 * Repeated notifications from the same person (profile visits, re-follows) collapse into one row:
 * "Stapa Kola visited your profile" · "3h · 10 times".
 * Colours come from the News tokens; the row tone the badge is cut out of comes from
 * `--xn-row-bg` / `--xn-row-hover` (x-notifications.css), which differ between page and panel.
 */

type DisplayNotification = NotificationDto & { repeatCount: number };

function isFollowerPublish(type: string): boolean {
  return (
    type === FOLLOWER_NEW_PRODUCT_TYPE ||
    type === FOLLOWER_NEW_CONTENT_TYPE ||
    type === FOLLOWER_NEW_SERVICE_TYPE
  );
}

/** The person behind a notification, when there is one. */
function actorName(n: NotificationDto): string | null {
  const fromApi = n.actorFullName?.trim();
  if (fromApi) return fromApi;
  if (isFollowerPublish(n.type)) {
    return n.message?.match(/^(.+?)\s+(?:published|shared|added)\b/i)?.[1]?.trim() || null;
  }
  if (n.type === CREATOR_NEW_FOLLOWER_TYPE) return extractFollowerNameFromFollowMessage(n.message);
  if (n.type === CREATOR_PROFILE_VISIT_TYPE) return extractVisitorNameFromVisitMessage(n.message);
  return null;
}

/** Only per-person events repeat meaningfully; everything else stays one row per notification. */
function repeatKey(n: NotificationDto): string | null {
  if (n.type !== CREATOR_PROFILE_VISIT_TYPE && n.type !== CREATOR_NEW_FOLLOWER_TYPE) return null;
  if (n.aggregatedNotificationIds?.length) return null;
  const who = n.refSecondaryId?.trim() || actorName(n)?.toLowerCase();
  return who ? `${n.type}:${who}` : null;
}

/**
 * Collapse repeats into the most recent one (the API lists newest first). The row carries every
 * collapsed id in `aggregatedNotificationIds`, so opening it marks them all read.
 */
function collapseRepeats(items: NotificationDto[]): DisplayNotification[] {
  const out: DisplayNotification[] = [];
  const byKey = new Map<string, DisplayNotification>();
  for (const n of items) {
    const key = repeatKey(n);
    const existing = key ? byKey.get(key) : undefined;
    if (existing) {
      existing.repeatCount += 1;
      existing.aggregatedNotificationIds = [...(existing.aggregatedNotificationIds ?? [existing.id]), n.id];
      existing.isRead = existing.isRead && n.isRead;
      continue;
    }
    const row: DisplayNotification = { ...n, repeatCount: 1 };
    if (key) byKey.set(key, row);
    out.push(row);
  }
  return out;
}

type DayGroup = { key: string; label: string; items: DisplayNotification[] };

const DAY_MS = 86_400_000;

/**
 * Calendar buckets, newest first: Today, Yesterday, Last 7 days, Earlier. Unread rows stay in their
 * own day (the dot marks them) — the old "New" bucket pulled a month-old unread visit above this
 * morning's follower.
 */
function groupByDay(items: DisplayNotification[]): DayGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const buckets: DayGroup[] = [
    { key: 'today', label: msg('Today'), items: [] },
    { key: 'yesterday', label: msg('Yesterday'), items: [] },
    { key: 'week', label: msg('Last 7 days'), items: [] },
    { key: 'earlier', label: msg('Earlier'), items: [] },
  ];
  for (const n of items) {
    const at = new Date(n.createdAt).getTime();
    if (Number.isNaN(at)) buckets[3].items.push(n);
    else if (at >= today) buckets[0].items.push(n);
    else if (at >= today - DAY_MS) buckets[1].items.push(n);
    else if (at >= today - 6 * DAY_MS) buckets[2].items.push(n);
    else buckets[3].items.push(n);
  }
  return buckets.filter((bucket) => bucket.items.length > 0);
}

/** A small glyph box for the 20px avatar badge (12px glyph, a heavier stroke so it holds). */
function BadgeGlyph({ kind }: { kind: NotificationKind }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {KIND_GLYPHS[kind]}
    </svg>
  );
}

function NotificationAvatar({ n, dense }: { n: DisplayNotification; dense: boolean }) {
  const kind = notificationKind(n.type);
  const name = actorName(n);
  const disc = dense ? 'h-9 w-9' : 'h-11 w-11';

  /* A person did it: their face, and an ink badge for what they did. */
  if (name || isFollowerPublish(n.type) || n.type === CREATOR_PROFILE_VISIT_TYPE || n.type === CREATOR_NEW_FOLLOWER_TYPE) {
    return (
      <span className="relative shrink-0">
        <PersonAvatar name={name || 'Member'} avatarUrl={n.actorAvatarUrl} size={dense ? 'md' : 'lg'} />
        <span
          aria-hidden
          className="xn-badge absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--gn-ink)]"
        >
          <BadgeGlyph kind={kind} />
        </span>
      </span>
    );
  }

  /* A visit bundle: the count in an outlined disc. */
  if (n.type === CREATOR_PROFILE_VISIT_GROUP_TYPE) {
    const count = n.aggregatedNotificationIds?.length ?? 0;
    return (
      <span
        aria-hidden
        className={`xn-disc ${disc} flex shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums text-[color:var(--gn-ink)]`}
      >
        {count > 0 ? count : <RailGlyph>{KIND_GLYPHS.visit}</RailGlyph>}
      </span>
    );
  }

  /* No person (system, invites): the type glyph alone, in an outlined disc like News's portfolio row. */
  return (
    <span aria-hidden className={`xn-disc ${disc} flex shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink)]`}>
      <RailGlyph>{KIND_GLYPHS[kind]}</RailGlyph>
    </span>
  );
}

/**
 * Publishes ("X published a new product: Logo pack") and comments carry the item after a colon: the
 * sentence stays one short line, the item becomes a grey preview under it — like a quoted post.
 */
function splitPreview(n: NotificationDto, message: string): { head: string; preview: string | null } {
  if (!isFollowerPublish(n.type) && n.type !== MARKETPLACE_NEW_COMMENT_TYPE) return { head: message, preview: null };
  const at = message.indexOf(': ');
  if (at <= 0) return { head: message, preview: null };
  const preview = message.slice(at + 2).trim();
  return preview ? { head: message.slice(0, at), preview } : { head: message, preview: null };
}

/** "**Name** visited your profile" — the actor in bold when the sentence starts with them. */
function NotificationSentence({ n, dense }: { n: DisplayNotification; dense: boolean }) {
  const display = formatNotificationDisplay(n);
  const message = display.message?.trim().replace(/\.$/, '') ?? '';
  const name = actorName(n);
  const { head, preview } = splitPreview(n, message);
  const weight = n.isRead ? 'font-normal' : 'font-medium';

  let body: ReactNode;
  let secondary: string | null = preview;
  if (name && head.toLowerCase().startsWith(name.toLowerCase())) {
    body = (
      <>
        <span className="font-bold">{head.slice(0, name.length)}</span>
        {head.slice(name.length)}
      </>
    );
  } else if (head) {
    /* No actor at the start: the type's title leads, the message becomes the preview. */
    body = <span className="font-bold">{display.title}</span>;
    secondary = preview ? `${head}: ${preview}` : head;
  } else {
    body = <span className="font-bold">{display.title}</span>;
  }

  return (
    <>
      <span
        className={`block text-[15px] leading-5 text-[color:var(--gn-ink)] [overflow-wrap:anywhere] ${weight} ${
          dense ? 'line-clamp-2' : 'line-clamp-3'
        }`}
      >
        {body}
      </span>
      {secondary ? (
        <span
          className={`mt-0.5 block text-[14px] leading-5 text-[color:var(--gn-ink2)] [overflow-wrap:anywhere] ${
            dense ? 'line-clamp-1' : 'line-clamp-2'
          }`}
        >
          {secondary}
        </span>
      ) : null}
    </>
  );
}

function fullDate(iso: string): string | undefined {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleString(localeTag(), { dateStyle: 'medium', timeStyle: 'short' });
}

function NotificationRow({
  n,
  onItemClick,
  dense,
}: {
  n: DisplayNotification;
  onItemClick: (n: NotificationDto) => void;
  dense: boolean;
}) {
  const t = useT();
  const time = formatPostTime(n.createdAt);
  const meta = [time, n.repeatCount > 1 ? trPlural(n.repeatCount, '{count} time', '{count} times') : null].filter(Boolean).join(' · ');
  return (
    <li>
      <button
        type="button"
        onClick={() => onItemClick(n)}
        data-pf-no-color-transition
        className={`xn-row flex w-full items-start gap-3 text-left transition-colors duration-150 focus-visible:outline-hidden ${
          dense ? 'min-h-[60px] px-5 py-3' : 'min-h-[76px] px-5 py-4 sm:gap-4 sm:px-6'
        }`}
      >
        <NotificationAvatar n={n} dense={dense} />
        <span className="min-w-0 flex-1 pt-px">
          {n.isRead ? null : <span className="sr-only">{t('Unread:')} </span>}
          <NotificationSentence n={n} dense={dense} />
          {meta ? (
            <time
              dateTime={n.createdAt}
              title={fullDate(n.createdAt)}
              className={`mt-1 block text-[13px] leading-[18px] tabular-nums ${
                n.isRead ? 'text-[color:var(--gn-ink2)]' : 'font-semibold text-[color:var(--gn-ink)]'
              }`}
            >
              {meta}
            </time>
          ) : null}
        </span>
        <span aria-hidden className={`flex w-2 shrink-0 items-center ${dense ? 'h-9' : 'h-11'}`}>
          {n.isRead ? null : <span className="h-2 w-2 rounded-full bg-[color:var(--gn-ink)]" />}
        </span>
      </button>
    </li>
  );
}

export type NotificationEmptyState = {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
};

function EmptyNotifications({ empty, page }: { empty: NotificationEmptyState; page: boolean }) {
  const t = useT();
  const glyph = (
    <span aria-hidden className="xn-disc mx-auto flex h-12 w-12 items-center justify-center rounded-full text-[color:var(--gn-ink)]">
      <RailGlyph>{KIND_GLYPHS.other}</RailGlyph>
    </span>
  );
  if (!page) {
    return (
      <div className="px-6 py-10 text-center">
        {glyph}
        <p className="mt-3 text-[15px] font-bold leading-5 text-[color:var(--gn-ink)]">{t(empty.title)}</p>
        {empty.description ? (
          <p className="mx-auto mt-1 max-w-[18rem] text-[14px] leading-5 text-[color:var(--gn-ink2)]">{t(empty.description)}</p>
        ) : null}
      </div>
    );
  }
  return (
    <div className="gn-card px-6 py-16 text-center">
      {glyph}
      <p className="mt-5 text-[20px] font-extrabold leading-6 tracking-[-0.015em] text-[color:var(--gn-ink)]">{t(empty.title)}</p>
      {empty.description ? (
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-5 text-[color:var(--gn-ink2)]">{t(empty.description)}</p>
      ) : null}
      {empty.action ? (
        <button
          type="button"
          onClick={empty.action.onClick}
          className="mt-6 inline-flex h-10 items-center rounded-full px-5 text-[14px] font-semibold text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] dark:shadow-[inset_0_0_0_1px_#536471]"
        >
          {t(empty.action.label)}
        </button>
      ) : null}
    </div>
  );
}

/** The day's section line: "■ TODAY · 2 NEW". */
function DayKicker({ id, label, unread, panel }: { id: string; label: string; unread: number; panel: boolean }) {
  const t = useT();
  return (
    <h2 id={id} className={`gn-kicker flex items-center gap-2.5 ${panel ? 'px-5 pb-1 pt-4' : 'px-5 pb-3 sm:px-1'}`}>
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-[color:var(--gn-ink)]" />
      <span className="truncate">
        {label}
        {unread > 0 ? <span className="text-[color:var(--gn-ink)]"> {t('· {unread} new', { unread })}</span> : null}
      </span>
    </h2>
  );
}

export function NotificationGroupedList({
  items,
  onItemClick,
  empty = { title: msg('No notifications yet') },
  variant = 'panel',
}: {
  items: NotificationDto[];
  onItemClick: (n: NotificationDto) => void;
  empty?: NotificationEmptyState;
  variant?: 'panel' | 'page';
}) {
  const t = useT();
  const groups = useMemo(() => groupByDay(collapseRepeats(items)), [items]);
  const page = variant === 'page';

  if (groups.length === 0) return <EmptyNotifications empty={empty} page={page} />;

  if (page) {
    /* One square tonal block per day, 24px apart (32px from sm); edge to edge on phones. */
    return (
      <div className="flex flex-col gap-6 sm:gap-8">
        {groups.map((group) => (
          <section key={group.key} aria-labelledby={`xn-day-${group.key}`}>
            <DayKicker
              id={`xn-day-${group.key}`}
              label={t(group.label)}
              unread={group.items.filter((n) => !n.isRead).length}
              panel={false}
            />
            <ul className="gn-card py-1 sm:py-2">
              {group.items.map((n) => (
                <NotificationRow key={n.id} n={n} onItemClick={onItemClick} dense={false} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="pb-2">
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`xn-panel-day-${group.key}`}>
          <DayKicker
            id={`xn-panel-day-${group.key}`}
            label={t(group.label)}
            unread={group.items.filter((n) => !n.isRead).length}
            panel
          />
          <ul>
            {group.items.map((n) => (
              <NotificationRow key={n.id} n={n} onItemClick={onItemClick} dense />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/*
 * Loading placeholders with the list's anatomy: the day kicker, then a tonal block of rows (avatar,
 * two text lines, the time). Written in literal colours (the news-mono card tone #F7F9F9 / #16181C)
 * so it can render before any token scope exists — the route's loading.tsx uses it too.
 */
const SKELETON_BLOCK = 'animate-pulse rounded-md bg-black/[0.07] dark:bg-white/[0.08]';

export function NotificationListSkeleton({ rows = 5, variant = 'page' }: { rows?: number; variant?: 'panel' | 'page' }) {
  const t = useT();
  const page = variant === 'page';
  const widths = ['w-11/12', 'w-3/4', 'w-5/6', 'w-2/3', 'w-4/5'];
  const list = (
    <div className={page ? 'bg-[#F7F9F9] py-1 dark:bg-[#16181C] sm:py-2' : ''}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={`flex items-start gap-3 ${page ? 'px-5 py-4 sm:gap-4 sm:px-6' : 'px-5 py-3'}`}>
          <div className={`${page ? 'h-11 w-11' : 'h-9 w-9'} shrink-0 !rounded-full ${SKELETON_BLOCK}`} />
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <div className={`h-[14px] ${widths[index % widths.length]} ${SKELETON_BLOCK}`} />
            <div className={`h-[12px] w-16 ${SKELETON_BLOCK}`} />
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <div aria-busy="true" aria-label={t('Loading notifications')}>
      <div className={`flex items-center gap-2.5 ${page ? 'px-5 pb-3 sm:px-1' : 'px-5 pb-1 pt-4'}`} aria-hidden>
        <span className="h-1.5 w-1.5 bg-[#CFD9DE] dark:bg-[#333639]" />
        <div className={`h-[11px] w-14 ${SKELETON_BLOCK}`} />
      </div>
      {list}
    </div>
  );
}
