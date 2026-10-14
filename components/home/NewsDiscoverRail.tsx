'use client';

import { msg } from '@/lib/i18n/config';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { useAuth } from '@/context/AuthContext';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { useT } from '@/lib/i18n/I18nProvider';

/** The most in-demand fields, offered as News feed filters. */
const NEWS_INTERESTS = [
  msg('Developer'),
  msg('Video editor'),
  msg('UI / UX'),
  msg('Design'),
  msg('Marketing'),
  msg('Photography'),
] as const;

type NewsInterest = (typeof NEWS_INTERESTS)[number];

/* The filter value is the field (it matches the creators' specialties); the label names the
   person, so the list reads as one kind of thing: Developer, Video editor, Designer, Photographer… */
const INTEREST_LABELS: Record<NewsInterest, string> = {
  Developer: msg('Developer'),
  'Video editor': msg('Video editor'),
  'UI / UX': msg('UI / UX designer'),
  Design: msg('Designer'),
  Marketing: msg('Marketer'),
  Photography: msg('Photographer'),
};

/**
 * The rail's icons (the portfolio folder and the interests), drawn like X's menu glyphs and the
 * navbar's chat and bell: 20px, one 24-unit box, round caps and joins, no fill, one simple picture
 * per field — so no two of them share an outline (the old Font Awesome set drew three interests as
 * the same sheet of paper). The selected interest draws its icon a step heavier, to match its bold
 * label.
 */
export function RailGlyph({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Build your portfolio: a folder. */
const FOLDER_ICON = <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />;

/** All: a compass. */
export const ALL_ICON = (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </>
);

export const INTEREST_ICONS: Record<NewsInterest, ReactNode> = {
  /* </> */
  Developer: (
    <>
      <path d="m7.5 7.5-4.5 4.5 4.5 4.5" />
      <path d="m16.5 7.5 4.5 4.5-4.5 4.5" />
      <path d="m13.5 4.5-3 15" />
    </>
  ),
  /* A video camera — not a clapperboard, whose top bar made it UI / UX's twin at 20px. */
  'Video editor': (
    <>
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="m15.5 10.5 5-3v9l-5-3z" />
    </>
  ),
  /* A window with a header bar and a sidebar. */
  'UI / UX': (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M9 9v11" />
    </>
  ),
  /* A painter's palette. */
  Design: (
    <>
      <path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.3s-.5-.8-.5-1.3c0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z" />
      <circle cx="7.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7.8" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.8" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  /* A megaphone and one sound wave. */
  Marketing: (
    <>
      <path d="M4 10a1 1 0 0 1 1-1h3l8-4v14l-8-4H5a1 1 0 0 1-1-1z" />
      <path d="M8 15v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2.5" />
      <path d="M19 9.5a3.5 3.5 0 0 1 0 5" />
    </>
  ),
  /* A camera. */
  Photography: (
    <>
      <path d="M3 8.5a2 2 0 0 1 2-2h2.2l1.4-2h6.8l1.4 2H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
};

type NewsDiscoverProps = {
  selected: string | null;
  onSelect: (value: string | null) => void;
};

type NewsComposeProps = {
  /** Creators can post; everyone else is offered to become one. */
  canPublish: boolean;
  onCompose: () => void;
};

/**
 * The way to post on News from `lg`: one full-width primary pill (ink fill, the label alone, like
 * X's "Post") at the foot of the sticky rail, so it stays in view while the feed scrolls. Also used
 * by Creator Studio. Non-creators get "Become a creator" in the same place. `!rounded-full` because
 * the news-mono theme squares every `.gn-primary` (globals.css).
 */
export function NewsPublishButton({ canPublish, onCompose }: NewsComposeProps) {
  const t = useT();
  const className =
    'gn-primary inline-flex h-12 w-full items-center justify-center !rounded-full bg-[color:var(--gn-primary)] text-[15px] font-semibold leading-5 text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';
  if (!canPublish) {
    return (
      <Link href="/profile" className={className}>
        {t('Become a creator')}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onCompose} className={className}>
      {t('Publish a post')}
    </button>
  );
}

/**
 * Phones / tablets (< lg, no rail): the Facebook "What's on your mind?" row — your avatar, a soft
 * pill that opens the composer, and a photo shortcut. From `lg` the rail's publish button takes
 * over. Members who can't publish yet get the same row pointing to their profile ("Become a
 * creator").
 */
export function NewsComposerRow({ canPublish, onCompose }: NewsComposeProps) {
  const t = useT();
  const { user } = useAuth();
  const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? '';
  const prompt = canPublish ? (firstName ? `What's new, ${firstName}?` : t('What\'s new?')) : t('Become a creator to publish');
  const field =
    'flex h-10 min-w-0 flex-1 items-center rounded-full bg-[color:var(--gn-surface)] px-4 text-left text-[15px] leading-5 text-[color:var(--gn-ink2)] transition-colors active:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';
  const initials = (user?.fullName ?? '?').trim().slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <AvatarImage
        src={user?.avatarUrl}
        displayWidth={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
        fallback={
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--gn-surface)] text-[15px] font-semibold text-[color:var(--gn-ink)]">
            {initials}
          </span>
        }
      />
      {canPublish ? (
        <>
          <button type="button" onClick={onCompose} className={field}>
            <span className="truncate">{prompt}</span>
          </button>
          <button
            type="button"
            onClick={onCompose}
            aria-label={t('Publish a photo or video')}
            title={t('Publish a photo or video')}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] active:bg-[color:var(--gn-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
          >
            <svg aria-hidden className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2.5" />
              <circle cx="8.5" cy="9.5" r="1.6" />
              <path d="m21 16-5-5-9 9" />
            </svg>
          </button>
        </>
      ) : (
        <Link href="/profile" className={field}>
          <span className="truncate">{prompt}</span>
        </Link>
      )}
    </div>
  );
}

/**
 * "Build your portfolio" — a compact row (the owner's pick, variant A): a round outlined folder
 * icon, the title over one short line, a chevron. The whole row is the link. Sized against the
 * "Looking for?" box below it: the same 24px inset (so the 44px circle lines up with the interest
 * icons), the same 20px stroke glyph, and a 17px title — between the 15px rows and the 20px
 * heading. `stacked` (the rail) frames it with the hairline and no fill, like that box; on phones
 * it is a plain card row. Under the pointer it takes the fill tone (#EFF3F4), the page's
 * "interactive" grey.
 */
export function PortfolioCta({ stacked = false }: { stacked?: boolean }) {
  const t = useT();
  const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';
  return (
    <Link
      href="/studio"
      className={`${stacked ? 'gn-rail-box' : 'gn-card'} group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] ${focus}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_var(--gn-line)]">
        <RailGlyph>{FOLDER_ICON}</RailGlyph>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">
          {t('Build your portfolio')}
        </span>
        <span className="mt-0.5 block truncate text-[14px] leading-5 text-[color:var(--gn-ink2)]">
          {t('Showcase your best work')}
        </span>
      </span>
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[color:var(--gn-ink2)] transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}

/**
 * One interest, as an X trend row: full module width, no box — just text on the module, the fill
 * tone (#EFF3F4, same as the navbar's search) only under the pointer. 48px rows (14px above and
 * below the label) so the list breathes. The 20px icon is in ink like the label, never greyed. The
 * selected row is bold ink with a check: weight and a mark, no fill.
 */
function InterestNavItem({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-pf-no-color-transition
      className={`flex w-full items-center gap-3 px-6 py-3.5 text-left text-[15px] leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] ${
        active ? 'font-bold' : 'font-semibold'
      }`}
    >
      <RailGlyph active={active}>{icon}</RailGlyph>
      <span className="min-w-0 flex-1 truncate">{t(label)}</span>
      {active ? (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      ) : null}
    </button>
  );
}

const quickButton =
  'inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

/**
 * The feed's quick bar, in the gutter left of the posts (wide screens only — HomeNewsFeed decides):
 * 40px round buttons stacked, no box, the rail's 20px stroke glyphs, split by a short hairline —
 * your saved posts, then tools for the feed (refresh, back to the top). Messages, notifications and
 * settings are left out: the navbar and the account menu have them. Filtering stays in the
 * right rail. Sticks under the navbar like the rail.
 *
 * Saved swaps the feed column for your saved posts in place (`/feed?view=saved`, so Back returns to
 * the feed); while they are open the button holds the fill tone and the bookmark is drawn heavier,
 * and a second click goes back to the feed.
 */
export function NewsQuickBar({ onRefresh, savedActive }: { onRefresh: () => void; savedActive: boolean }) {
  const t = useT();
  return (
    <ProfileSectionStickyAside className="w-10" surfaceClassName="flex w-10 flex-col items-center gap-2">
      <Link
        href={savedActive ? '/feed' : '/feed?view=saved'}
        aria-label={savedActive ? t('Back to News') : t('Saved posts')}
        aria-current={savedActive ? 'page' : undefined}
        title={savedActive ? t('Back to News') : t('Saved posts')}
        className={`${quickButton} ${savedActive ? 'bg-[color:var(--gn-hover-strong,var(--gn-hover))]' : ''}`}
      >
        <RailGlyph active={savedActive}>
          <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-4.5L5.5 20V5.5a1 1 0 0 1 1-1z" />
        </RailGlyph>
      </Link>

      <span aria-hidden className="my-1 h-px w-6 bg-[#d6dee3] dark:bg-[#2f3336]" />

      <button
        type="button"
        onClick={onRefresh}
        aria-label={savedActive ? t('Refresh saved posts') : t('Refresh feed')}
        title={savedActive ? t('Refresh saved posts') : t('Refresh feed')}
        className={quickButton}
      >
        <RailGlyph>
          <path d="M20 12a8 8 0 1 1-8-8c2.2 0 4.3.9 5.8 2.4L20 8.5" />
          <path d="M20 4v4.5h-4.5" />
        </RailGlyph>
      </button>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t('Back to top')}
        title={t('Back to top')}
        className={quickButton}
      >
        <RailGlyph>
          <path d="M5 4h14" />
          <path d="M12 20V8" />
          <path d="m6.5 13.5 5.5-5.5 5.5 5.5" />
        </RailGlyph>
      </button>
    </ProfileSectionStickyAside>
  );
}

/**
 * Discover for phones and tablets. The right rail only exists from `lg`, so smaller screens get the
 * same interests as a swipeable chip row: 36px chips, 14/20 medium; idle chips sit on the card tone,
 * the selected one is solid ink — tone only, no outline.
 */
export function NewsInterestChips({
  selected,
  onSelect,
}: Pick<NewsDiscoverProps, 'selected' | 'onSelect'>) {
  const t = useT();
  const chips: { label: string; value: string | null }[] = [
    { label: t('All'), value: null },
    ...NEWS_INTERESTS.map((value) => ({ label: INTEREST_LABELS[value], value: value as string })),
  ];
  return (
    <nav
      aria-label={t('Filter by interest')}
      className="flex gap-2 overflow-x-auto px-4 sm:px-0 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
            className={`inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[14px] font-semibold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
              active
                ? 'bg-[color:var(--gn-ink)] text-[color:var(--gn-surface)]'
                : 'bg-[color:var(--gn-surface)] text-[color:var(--gn-ink)] active:bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
            }`}
          >
            {t(chip.label)}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Desktop right rail (340px, 400px from xl, sticky): the portfolio card, then "Looking for?" — both
 * unfilled boxes framed by the hairline (`.gn-rail-box`): a bold 20px title over plain trend rows.
 * The feed's posts are filled cards; the rail's tools are outlined boxes. Then the publish button,
 * which the sticky rail keeps in view. No search field: the navbar's search covers posts.
 */
export function NewsDiscoverRail(props: NewsDiscoverProps & NewsComposeProps) {
  const t = useT();
  return (
    <ProfileSectionStickyAside className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-6">
      <PortfolioCta stacked />
      <section
        className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5"
        aria-labelledby="news-discover-title"
      >
        <h2
          id="news-discover-title"
          className="px-6 pb-2 pt-1 text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]"
        >
          {t('Looking for?')}
        </h2>
        <nav aria-label={t('Filter by interest')} className="flex w-full flex-col">
          <InterestNavItem
            label={t('All')}
            icon={ALL_ICON}
            active={!props.selected}
            onClick={() => props.onSelect(null)}
          />
          {NEWS_INTERESTS.map((label) => {
            const active = props.selected === label;
            return (
              <InterestNavItem
                key={label}
                label={INTEREST_LABELS[label]}
                icon={INTEREST_ICONS[label]}
                active={active}
                onClick={() => props.onSelect(active ? null : label)}
              />
            );
          })}
        </nav>
      </section>
      <NewsPublishButton canPublish={props.canPublish} onCompose={props.onCompose} />
    </ProfileSectionStickyAside>
  );
}
