'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { SHOW_GROUP_CHAT } from '@/lib/messaging-feature-flags';
import { useT } from '@/lib/i18n/I18nProvider';

const DESKTOP_QUERY = '(min-width: 1024px)';

function subscribeDesktop(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** `lg` and up — where the inbox is a column with room for a sticky footer. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false
  );
}

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
  /**
   * The small-caps section line above the list ("■ 12 conversations"). Omitted when the list
   * brings its own (the temporary inbox).
   */
  sectionLabel?: ReactNode;
  pendingInvites?: ReactNode;
  temporaryAvatars?: ReactNode;
  /** Sticky footer under the conversation list (e.g. Audience strip). */
  footer?: ReactNode;
  children: ReactNode;
};

/** The 20px stroke glyphs of the News rail (RailGlyph): one 24-unit box, round caps, no fill. */
function Glyph({ children, className = 'h-5 w-5' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} shrink-0`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** "New message": a square being written into — X's compose glyph, drawn on the rail grid. */
const COMPOSE_GLYPH = (
  <>
    <path d="M11 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V13" />
    <path d="M17.6 3.9a1.9 1.9 0 0 1 2.7 2.7L12.5 14.4 9 15l.6-3.5z" />
  </>
);

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

/**
 * A group's label inside the inbox ("Temporary invites"): 15px semibold ink, sentence case — the
 * label level of the app's type scale (My Profile, News), on the inbox gutters. Shared by the
 * temporary strips so every block in the column opens the same way.
 */
export function InboxSectionKicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`flex min-w-0 items-center px-5 pb-1 pt-3 text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)] lg:px-6 ${className}`}>
      <span className="truncate">{children}</span>
    </h2>
  );
}

/**
 * Empty / resting states of the inbox, in the Providers page's voice: a bold 20px line, one short
 * sentence in secondary ink, then — when there is something to do about it — one pill.
 */
export function InboxEmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center" role="status">
      <p className="text-[20px] font-extrabold leading-6 tracking-[-0.015em] text-[color:var(--gn-ink)]">{title}</p>
      {body ? <p className="mt-2 max-w-[18rem] text-[15px] leading-5 text-[color:var(--gn-ink2)]">{body}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/** The pill shapes of the section — News's primary (ink) and secondary (outlined 1px #CFD9DE /
 *  #536471, drawn inset so it takes no room). `_SM` are the 40px row actions (Accept / Decline). */
export const INBOX_PRIMARY_PILL = `inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--gn-primary)] px-6 text-[15px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] disabled:opacity-50 ${FOCUS_RING}`;
export const INBOX_SECONDARY_PILL = `inline-flex h-10 items-center justify-center rounded-full px-5 text-[14px] font-semibold text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] disabled:opacity-50 dark:shadow-[inset_0_0_0_1px_#536471] ${FOCUS_RING}`;
export const INBOX_PRIMARY_PILL_SM = `inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[color:var(--gn-primary)] px-4 text-[14px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] disabled:opacity-50 ${FOCUS_RING}`;
export const INBOX_SECONDARY_PILL_SM = `inline-flex h-10 items-center justify-center rounded-full px-4 text-[14px] font-semibold text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[color:var(--gn-hover)] disabled:opacity-50 dark:shadow-[inset_0_0_0_1px_#536471] ${FOCUS_RING}`;

/** Loading: five rows in the conversation row's own geometry, so nothing jumps when they land. */
export function InboxSkeleton({ rows = 5 }: { rows?: number }) {
  const t = useT();
  return (
    <ul aria-busy="true" aria-label={t('Loading conversations')} className="flex flex-col">
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="flex items-center gap-3 px-5 py-3 lg:px-6">
          <span className="xm-skeleton h-12 w-12 shrink-0 rounded-full" />
          <span className="min-w-0 flex-1 space-y-2">
            <span className="xm-skeleton block h-3.5 w-2/5 rounded-full" />
            <span className="xm-skeleton block h-3 w-4/5 rounded-full" style={{ opacity: 0.7 }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The inbox column, X's DM column in the app's type scale:
 *  - a quiet head: the 20px title with a round compose icon (desktop; phones float the compose
 *    button in thumb reach), an outlined search pill, and the filters as text tabs on one hairline;
 *  - then, inside the scrolling area, the temporary strips and a 13px count line over the list, so
 *    on a phone the fixed head stays short and the conversations get the screen.
 * 20px gutters on phones, 24px in the desktop column.
 */
export function InboxPanel({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  filterCounts,
  onNewMessage,
  onNewGroup,
  sectionLabel,
  pendingInvites,
  temporaryAvatars,
  footer,
  children,
}: InboxPanelProps) {
  const t = useT();
  const chips: InboxFilterChip[] = [
    { id: 'all', label: t('All') },
    { id: 'unread', label: t('Unread'), count: filterCounts.unread },
    ...(SHOW_GROUP_CHAT ? [{ id: 'groups' as const, label: t('Groups'), count: filterCounts.groups }] : []),
    { id: 'temporary', label: t('Temporary'), count: filterCounts.temporary },
    { id: 'archived', label: t('Archived'), count: filterCounts.archived },
  ];
  const query = search.trim();
  /*
   * The footer (a creator's Audience strip) is sticky under the list on desktop. On phones it would
   * sit under the floating compose button and take a fixed band of a short screen, so it opens the
   * scrolling list instead — Instagram's row of faces at the top of the inbox. Rendered in one place
   * only, so its presence subscription is not doubled.
   */
  const isDesktop = useIsDesktop();

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/*
       * The head, X's DM column: three quiet lines.
       *  1. "Messages" (20px extrabold) with the compose action as a 36px round icon on the right — not
       *     a filled pill competing with the title (phones keep the floating compose button);
       *  2. the search as an outlined pill (1px line, no fill), an ink ring while typing;
       *  3. the filters as plain text tabs sharing the column's width — secondary ink, the open one
       *     ink with a 2px bar on the hairline that closes the head (the profile menu's idiom).
       */}
      <div className="shrink-0 pt-3 lg:pt-5">
        <div className="flex min-h-10 items-center justify-between gap-3 px-5 lg:px-6 lg:group-data-[folded=true]/inbox:justify-center lg:group-data-[folded=true]/inbox:px-0">
          <h1 className="text-[20px] font-extrabold leading-6 tracking-[-0.015em] text-[color:var(--gn-ink)] lg:group-data-[folded=true]/inbox:sr-only">{t('Messages')}</h1>
          <div className="-mr-2 flex items-center gap-1 lg:group-data-[folded=true]/inbox:mr-0">
            {SHOW_GROUP_CHAT && onNewGroup ? (
              <button
                type="button"
                onClick={onNewGroup}
                aria-label={t('New group')}
                title={t('New group')}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] ${FOCUS_RING}`}
              >
                <Glyph className="h-5 w-5">
                  <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM18 8v5M20.5 10.5h-5" />
                </Glyph>
              </button>
            ) : null}
            <button
              type="button"
              onClick={onNewMessage}
              aria-label={t('New message')}
              title={t('New message')}
              className={`hidden h-9 w-9 items-center justify-center rounded-full text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] lg:inline-flex ${FOCUS_RING}`}
            >
              <Glyph className="h-5 w-5">{COMPOSE_GLYPH}</Glyph>
            </button>
          </div>
        </div>

        <div className="px-5 pt-3 lg:px-6 lg:group-data-[folded=true]/inbox:hidden">
          <div className="relative h-10 rounded-full shadow-[inset_0_0_0_1px_var(--xm-bubble-line)] transition-shadow focus-within:shadow-[inset_0_0_0_2px_var(--gn-ink)]">
            <label htmlFor="inbox-search" className="sr-only">
              {t('Search in messages')}
            </label>
            <Glyph className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--gn-ink2)]">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4.2-4.2" />
            </Glyph>
            <input
              id="inbox-search"
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('Search messages')}
              enterKeyHint="search"
              autoComplete="off"
              className="h-full w-full rounded-full border-0 bg-transparent p-0 pl-10 pr-11 text-[16px] text-[color:var(--gn-ink)] outline-none ring-0 placeholder:text-[color:var(--gn-ink2)] focus:outline-none focus:ring-0 lg:text-[15px] [&::-webkit-search-cancel-button]:appearance-none"
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label={t('Clear search')}
                title={t('Clear search')}
                className="absolute right-0.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]"
              >
                <Glyph className="h-4 w-4">
                  <path d="M6 6l12 12M18 6 6 18" />
                </Glyph>
              </button>
            ) : null}
          </div>
        </div>

        <nav aria-label={t('Filter conversations')} className="mt-2 flex border-b border-[color:var(--xm-frame)] px-2 lg:px-3 lg:group-data-[folded=true]/inbox:hidden">
          {chips.map((chip) => {
            const active = chip.id === filter;
            const count = chip.count != null && chip.count > 0 ? chip.count : null;
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange(chip.id)}
                data-pf-no-color-transition
                className={`flex h-11 min-w-0 flex-1 items-center justify-center px-1 text-[14px] leading-5 transition-colors hover:bg-[color:var(--gn-hover)] ${FOCUS_RING} ${
                  active ? 'font-bold text-[color:var(--gn-ink)]' : 'font-semibold text-[color:var(--gn-ink2)]'
                }`}
              >
                <span className="relative inline-flex h-full items-center gap-1 whitespace-nowrap">
                  {t(chip.label)}
                  {count != null ? <span className="font-normal tabular-nums text-[color:var(--gn-ink2)]">{count}</span> : null}
                  {active ? (
                    <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[color:var(--gn-ink)]" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Everything below the head scrolls as one: invites, the temporary strip, the section line,
          the list. Bottom room on phones clears the floating compose button and the home bar. */}
      <div className="msg-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(6rem+env(safe-area-inset-bottom))] pt-2 lg:pb-4">
        {!isDesktop ? footer : null}
        <div className="lg:group-data-[folded=true]/inbox:hidden">
          {pendingInvites}
          {temporaryAvatars}
        </div>

        {sectionLabel || query ? (
          <header className="flex flex-col gap-1 px-5 pb-1 pt-3 lg:px-6 lg:group-data-[folded=true]/inbox:hidden">
            {sectionLabel ? (
              <h2 className="min-w-0 truncate text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">{sectionLabel}</h2>
            ) : null}
            {query ? (
              <p className="flex min-w-0 items-center gap-1.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
                <span className="shrink-0">{t('Filtered by:')}</span>
                <span className="truncate font-semibold text-[color:var(--gn-ink)]">“{query}”</span>
                <span aria-hidden className="shrink-0 text-[color:var(--gn-ink3)]">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className={`inline-flex min-h-8 shrink-0 items-center font-medium text-[color:var(--gn-ink)] underline-offset-4 hover:underline ${FOCUS_RING}`}
                >
                  {t('Clear')}
                </button>
              </p>
            ) : null}
          </header>
        ) : null}

        {children}
      </div>

      {isDesktop ? <div className="lg:group-data-[folded=true]/inbox:hidden">{footer}</div> : null}

      {/* Phones: compose floats in thumb reach (X's DM pattern) — the page hides the app-wide chat
          button here, so this takes its exact place and shape. Hidden with the inbox when a thread
          is open (the parent column is `display: none` then). */}
      <button
        type="button"
        onClick={onNewMessage}
        aria-label={t('New message')}
        title={t('New message')}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0F1419] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419] focus-visible:ring-offset-2 dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:focus-visible:ring-[#EFF3F4] lg:hidden"
      >
        <Glyph className="h-6 w-6">{COMPOSE_GLYPH}</Glyph>
      </button>
    </div>
  );
}
