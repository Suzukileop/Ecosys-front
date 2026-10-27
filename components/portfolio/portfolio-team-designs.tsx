'use client';

import dynamic from 'next/dynamic';
/**
 * The Team section's nine member layouts, extracted out of portfolio-section-primitives.tsx and
 * reworked as a premium family: editorial typography (monumental names, small-caps meta,
 * hairlines instead of boxes), generous whitespace, a shared GSAP entrance
 * (portfolio-team-design-motion.ts) and one hover choreography per design.
 *
 * Every layout keeps reading the exact same settings model as before (columns, gap, radius,
 * padding, max width, alignment, avatar size, shadow, border, colors, image aspect/fit/position
 * and the four show* toggles) — nothing here introduces a new setting.
 *
 * Site-wide trap to respect when editing: any node that animates transform/opacity through CSS
 * needs `data-pf-no-color-transition`, otherwise the global color-mode transition rule in
 * globals.css replaces its `transition-property` and the motion silently disappears.
 */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import gsap from 'gsap';
import {
  teamAvatarSizeClass,
  teamCardClass,
  teamCardFrameClass,
  teamCardMaxWidthClass,
  teamCardStyle,
  teamContentAlignClass,
  teamDirectoryMaxWidthClass,
  teamDirectoryDefaultCardGap,
  teamGridClass,
  teamListAlignClass,
  teamReadableCardText,
  teamSocialAlignClass,
  teamSpotlightMaxWidthClass,
  type PortfolioTeamListAlign,
  type PortfolioTeamPresentationSettings,
  type PortfolioTeamImageHeight,
  type PortfolioTeamCornerRadius,
  type PortfolioTeamAvatarRadius,
  type PortfolioTeamRailColumns,
} from '@/components/portfolio/portfolio-team-settings';
import {
  teamIndexLabel,
  teamPrefersReducedMotion,
  useTeamEntrance,
  useTeamSwipe,
} from '@/components/portfolio/portfolio-team-design-motion';
import type { ProfileTeamMember } from '@/types/profile';
import type { PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';
import {
  EASE_CLS,
  HOVER_CLS,
  META_CLS,
  TeamMemberImage,
  TeamSocialLinks,
} from '@/components/portfolio/portfolio-team-design-primitives';
import { useT } from '@/lib/i18n/I18nProvider';
import { readableMix } from '@/components/portfolio/stack-designs/readable-ink';
import { teamHoverVeilPresentation } from '@/components/portfolio/portfolio-team-hover-veil-settings';

/** The section renders one Team design, so each design is its own chunk. */
const TeamProfileCardsGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-team-design-profile-cards').then((m) => m.TeamProfileCardsGallery)
);
const TeamAvatarCards = dynamic(() =>
  import('@/components/portfolio/portfolio-team-design-avatar-cards').then((m) => m.TeamAvatarCards)
);
const TeamFloatCardsGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-team-design-float-cards').then((m) => m.TeamFloatCardsGallery)
);
const TeamSplitScreen = dynamic(() =>
  import('@/components/portfolio/portfolio-team-design-split-screen').then((m) => m.TeamSplitScreen)
);
const TeamEditorialRhythm = dynamic(() =>
  import('@/components/portfolio/portfolio-team-design-editorial-rhythm').then((m) => m.TeamEditorialRhythm)
);
const TeamFloatingCanvas = dynamic(() =>
  import('@/components/portfolio/portfolio-team-design-floating-canvas').then((m) => m.TeamFloatingCanvas)
);


function TeamMemberCopy({
  member,
  presentation,
  align = 'text-center',
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  align?: string;
}) {
  const readable = teamReadableCardText(presentation);
  return (
    <div className={align}>
      {presentation.showName ? (
        <h3
          className="text-[calc(1.3rem*var(--pf-team-font-scale,1))] font-semibold leading-[1.1] tracking-[-0.02em]"
          style={{ color: readable.strong }}
        >
          {member.name}
        </h3>
      ) : null}
      {presentation.showResponsibility ? (
        <p className={`${META_CLS} mt-2.5 min-h-[0.7rem]`} style={{ color: readable.muted }}>
          {member.responsibility.trim() || ' '}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Mechanical counter: every digit rides its own 0-9 column behind a one-line mask, so the number
 * rolls into place instead of being swapped out. Used by the rail and the spotlight counters.
 */
function TeamOdometer({
  value,
  className = '',
  style,
}: {
  value: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`inline-flex tabular-nums ${className}`} style={style} role="img" aria-label={value}>
      {value.split('').map((char, position) => {
        const digit = Number(char);
        if (Number.isNaN(digit)) {
          return (
            <span key={`${char}-${position}`} aria-hidden>
              {char}
            </span>
          );
        }
        return (
          // 1.15em, not 1em: at display sizes an exactly-1em mask shaves the digits' baseline.
          // The mask and each slot share the value, so the roll distance stays one slot exactly.
          <span
            key={`${char}-${position}`}
            className="relative inline-block h-[1.15em] overflow-hidden"
            aria-hidden
          >
            <span
              className={`flex flex-col transition-transform duration-[720ms] ${EASE_CLS}`}
              data-pf-no-color-transition=""
              style={{ transform: `translateY(-${digit * 10}%)` }}
            >
              {Array.from({ length: 10 }, (_, slot) => (
                <span key={slot} className="block h-[1.15em] leading-[1.15em]">
                  {slot}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Cursor previews need a fine hovering pointer and motion enabled.
 * Touch and reduced-motion users keep visible portraits within each row.
 */
function useHoverPointer(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches,
    () => false
  );
}

/**
 * Rail — the portrait is the subject, so its height is read off the viewport, not a card box.
 * Driven by the design's own `Image height` (Layout settings); `tall` is the original size.
 */
function teamRailPortraitClass(height: PortfolioTeamImageHeight): string {
  if (height === 'short') return 'h-[34vh] min-h-[16rem]';
  if (height === 'medium') return 'h-[44vh] min-h-[20rem]';
  return 'h-[54vh] min-h-[24rem]';
}

/** `Show all` — the column sets the width, so the same control reads as a ratio instead. */
function teamRailPortraitAspectClass(height: PortfolioTeamImageHeight): string {
  if (height === 'short') return 'aspect-square';
  if (height === 'medium') return 'aspect-[4/5]';
  return 'aspect-[3/4]';
}

/** Rail portraits carry their own corner radius — the rail is frameless, so this IS the image. */
function teamCornerRadiusClass(radius: PortfolioTeamCornerRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'sm') return 'rounded-xl';
  if (radius === 'lg') return 'rounded-[3rem]';
  return 'rounded-[2rem]';
}

/** Rail card width. Immersive scale: even the smallest step is wider than a classic card. */
function teamRailCardWidthClass(width: PortfolioTeamPresentationSettings['cardMaxWidth']): string {
  if (width === 'xs') return 'sm:w-[20rem]';
  if (width === 'md') return 'sm:w-[29rem]';
  if (width === 'lg') return 'sm:w-[34rem]';
  if (width === 'xl') return 'sm:w-[40rem]';
  if (width === 'full') return 'sm:w-[46rem]';
  return 'sm:w-[25rem]';
}

function teamShadowClass(shadow: PortfolioTeamPresentationSettings['cardShadow']): string {
  if (shadow === 'soft') return 'shadow-xs';
  if (shadow === 'medium') return 'shadow-lg shadow-black/10';
  if (shadow === 'strong') return 'shadow-2xl shadow-black/20';
  return '';
}


/** Hairline that draws itself left-to-right under the copy on hover. */
function TeamHoverRule({ color, align }: { color: string; align: PortfolioTeamListAlign }) {
  const origin = align === 'right' ? 'origin-right' : align === 'center' ? 'origin-center' : 'origin-left';
  return (
    <span
      aria-hidden
      className={`mt-5 block h-px w-full scale-x-0 ${origin} transition-transform duration-[760ms] ${EASE_CLS} group-hover:scale-x-100`}
      data-pf-no-color-transition=""
      style={{ backgroundColor: color }}
    />
  );
}

function TeamStandardCard({
  member,
  presentation,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
}) {
  const align = presentation.listAlign ?? 'center';
  return (
    <article
      className={`group flex h-full w-full flex-col ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardClass(presentation)} ${HOVER_CLS} hover:-translate-y-2`}
      data-pf-no-color-transition=""
      data-team-reveal=""
      style={teamCardStyle(presentation)}
    >
      <TeamMemberImage
        member={member}
        presentation={presentation}
        className="rounded-[calc(2rem-0.75rem)]"
        zoom
        reveal
      />
      <div className={`flex min-h-0 flex-1 flex-col ${presentation.showImage ? 'mt-6' : ''}`}>
        <TeamMemberCopy member={member} presentation={presentation} align={teamContentAlignClass(align)} />
        {presentation.showSocials ? (
          <div className="mt-auto">
            <TeamHoverRule color={presentation.cardBorderColor} align={align} />
            <div className="pt-5">
              <TeamSocialLinks member={member} presentation={presentation} align={teamSocialAlignClass(align)} />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Polaroid — instant-print cards scattered on a dark work table. Tilt and vertical lift come from
 * fixed, index-based tables (never `Math.random()` at render time, which would mismatch between
 * server and client and throw a hydration error); the shared entrance's `scatter` flag reads each
 * card's computed CSS rotation as its resting value, so these tables are the single source of truth
 * for both the resting tilt and the entrance's starting offset.
 */
const POLAROID_ROTATIONS = [
  '[transform:rotate(-1.5deg)]',
  '[transform:rotate(1.25deg)]',
  '[transform:rotate(-1deg)]',
  '[transform:rotate(1.75deg)]',
  '[transform:rotate(-1.5deg)]',
  '[transform:rotate(1deg)]',
  '[transform:rotate(-2deg)]',
  '[transform:rotate(1.25deg)]',
];
/** Grid view only: a per-card vertical offset so the rows read as loosely thrown, not ruled. */
const POLAROID_LIFTS = [
  '',
  'sm:translate-y-5',
  'sm:translate-y-2',
  'sm:-translate-y-4',
  'sm:translate-y-7',
  'sm:-translate-y-2',
  'sm:translate-y-1',
  'sm:-translate-y-5',
];
/** The brief's own easing for this design's motion — the rest of the family uses `EASE_CLS`. */
const POLAROID_EASE_CLS = 'ease-[cubic-bezier(0.25,1,0.5,1)]';
/** One small `feTurbulence` tile, reused at two opacities: a faint mottle on the paper, a heavier
 *  grain over the print itself. Inline SVG data URI — no extra asset request per card. */
const POLAROID_GRAIN_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/** "View all" grid only — never more than the chosen count, and never more than four, at any
 *  breakpoint (same three-step scale as the rail's/hover cards'/float cards' own `Columns`). */
function teamPolaroidGridColumnsClass(columns: PortfolioTeamRailColumns): string {
  if (columns === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (columns === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
}

function TeamPolaroidCard({
  member,
  presentation,
  index,
  gridded = false,
  renderPortrait,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
  /** Grid ("View all") mode only — the rail keeps every print level with its neighbors. */
  gridded?: boolean;
  renderPortrait?: (member: ProfileTeamMember, index: number) => ReactNode;
}) {
  const surface = presentation.cardBackgroundColor;
  const readable = {
    strong: readableMix(presentation.nameColor, 100, surface),
    muted: readableMix(presentation.responsibilityColor, 100, surface),
  };
  const socialSurface = ['minimal', 'outline'].includes(presentation.socialIconStyle) ? surface : presentation.socialBackgroundColor;
  const socialPresentation = { ...presentation, socialIconColor: readableMix(presentation.socialIconColor, 100, socialSurface) };
  const hasSocials = presentation.showSocials && member.socialLinks?.some(link => link.url.trim());
  const rotation = POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length];
  const lift = gridded ? POLAROID_LIFTS[index % POLAROID_LIFTS.length] : '';
  const tone = presentation.polaroidPhotoTone ?? 'hover';
  const toneCls =
    tone === 'color'
      ? ''
      : tone === 'monochrome'
        ? 'grayscale-[0.9] contrast-[1.05] saturate-[0.85]'
        : 'grayscale-[0.9] contrast-[1.05] saturate-[0.85] group-hover:grayscale-0 group-hover:contrast-100 group-hover:saturate-100';
  return (
    <article
      className={`team-polaroid-card group relative shrink-0 ${gridded ? 'w-full' : `w-[72vw] ${teamRailCardWidthClass(presentation.cardMaxWidth)}`} ${rotation} ${lift}`}
      data-pf-no-color-transition=""
      data-team-reveal=""
      style={{ backgroundColor: presentation.cardBackgroundColor }}
    >
      {/* Faint mottle on the paper itself — painted first, so the opaque print and caption below
          simply cover it where they overlap, leaving the grain visible only on the exposed border. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: `url("${POLAROID_GRAIN_URL}")`, backgroundSize: '140px 140px' }}
      />
      {presentation.showImage && <div className="relative p-3 pb-0 sm:p-4 sm:pb-0">
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
            <div
              data-polaroid-tone={tone}
              className={`relative h-full w-full transition-[filter] duration-[900ms] ${POLAROID_EASE_CLS} ${toneCls}`}
              data-pf-no-color-transition=""
            >
              {renderPortrait ? renderPortrait(member,index) : <TeamMemberImage
                member={member}
                presentation={{ ...presentation, imageAspect: 'square' }}
                fill
                reveal
                sizes={gridded ? '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw' : '(max-width: 639px) 72vw, 640px'}
              />}
            </div>
          {/* Print grain — heavier than the paper's, and blended so it reads on both the dark
              placeholder and a bright photo instead of just muddying one of the two. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{ backgroundImage: `url("${POLAROID_GRAIN_URL}")`, backgroundSize: '140px 140px' }}
          />
        </div>
      </div>}
      <div className="team-polaroid-caption relative px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
        <div className="min-w-0">
          {presentation.showName ? (
            <h3
              className="team-polaroid-name"
              style={{ color: readable.strong }}
            >
              {member.name}
            </h3>
          ) : null}
          {presentation.showResponsibility && member.responsibility.trim() ? (
            <p
              className="team-polaroid-role"
              style={{ color: readable.muted }}
            >
              {member.responsibility.trim() || ' '}
            </p>
          ) : null}
        </div>
        {hasSocials ? (
          <div className="team-polaroid-socials">
            <TeamSocialLinks
              member={member}
              presentation={socialPresentation}
              align="justify-start"
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Polaroid wall — the resting state is a drag/scroll rail (mouse-drag or trackpad, stepped by a
 * pair of chevrons); a "View all" toggle swaps it for a full scattered grid. Reuses the exact
 * drag/scrub mechanics of `TeamPortraitRail` below, minus the progress track — this design's own
 * grid toggle already gives the viewer the "see everything" escape hatch the track exists for.
 */
export function TeamPolaroidWall({
  members,
  presentation,
  renderPortrait,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
  renderPortrait?: (member: ProfileTeamMember, index: number) => ReactNode;
}) {
  const t = useT();
  const [gridView, setGridView] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ pointerId: number; startX: number; startLeft: number; moved: boolean } | null>(null);
  const [bounds, setBounds] = useState({ atStart: true, atEnd: false });
  const readable = teamReadableCardText(presentation);

  const syncBounds = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const travel = scroller.scrollWidth - scroller.clientWidth;
    setBounds({ atStart: scroller.scrollLeft <= 2, atEnd: travel <= 4 || scroller.scrollLeft >= travel - 2 });
  }, []);

  useEffect(() => {
    if (gridView) return;
    syncBounds();
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncBounds);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [syncBounds, gridView, members.length]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller || event.pointerType !== 'mouse' || event.button !== 0) return;
    dragState.current = { pointerId: event.pointerId, startX: event.clientX, startLeft: scroller.scrollLeft, moved: false };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    const drag = dragState.current;
    if (!scroller || !drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) > 4) {
      drag.moved = true;
      scroller.setPointerCapture?.(event.pointerId);
    }
    if (!drag.moved) return;
    scroller.scrollLeft = drag.startLeft - delta;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    scrollerRef.current?.releasePointerCapture?.(event.pointerId);
    if (drag.moved) window.setTimeout(() => { dragState.current = null; }, 0);
    else dragState.current = null;
  };

  /** Step to the next/previous print's own edge — never a fixed pixel amount, see `stepRail`. */
  const stepWall = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = Array.from(scroller.children) as HTMLElement[];
    if (cards.length === 0) return;
    const origin = scroller.getBoundingClientRect().left;
    const leftOf = (card: HTMLElement) => card.getBoundingClientRect().left - origin + scroller.scrollLeft;
    const current = scroller.scrollLeft;
    const next =
      direction === 1
        ? cards.find((card) => leftOf(card) > current + 4)
        : [...cards].reverse().find((card) => leftOf(card) < current - 4);
    const travel = scroller.scrollWidth - scroller.clientWidth;
    const target = next ? leftOf(next) : direction === 1 ? travel : 0;
    scroller.scrollTo({ left: Math.max(0, Math.min(travel, target)), behavior: teamPrefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <div className="team-polaroid w-full">
      <div className="mb-8 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setGridView((value) => !value)}
          className="team-polaroid-toggle inline-flex items-center gap-2 rounded-full border px-4 py-2"
          data-pf-no-color-transition=""
          style={{ borderColor: presentation.cardBorderColor, color: readable.strong }}
          aria-pressed={gridView}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-3.5 w-3.5" aria-hidden>
            {gridView ? (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            ) : (
              <>
                <rect x="4" y="4" width="7" height="7" rx="1" />
                <rect x="13" y="4" width="7" height="7" rx="1" />
                <rect x="4" y="13" width="7" height="7" rx="1" />
                <rect x="13" y="13" width="7" height="7" rx="1" />
              </>
            )}
          </svg>
          {gridView ? t('Scroll view') : t('View all')}
        </button>
      </div>

      {gridView ? (
        <div
          className={`grid w-full items-start gap-x-8 gap-y-20 overflow-visible sm:gap-x-10 sm:gap-y-24 lg:gap-x-12 ${teamPolaroidGridColumnsClass(presentation.polaroidColumns ?? 3)}`}
        >
          {members.map((member, index) => (
            <TeamPolaroidCard key={member.id} member={member} presentation={presentation} index={index} gridded renderPortrait={renderPortrait}/>
          ))}
        </div>
      ) : (
        <div className="w-full min-w-0">
          <div
            ref={scrollerRef}
            role="region"
            aria-label={t('Team members')}
            tabIndex={0}
            onKeyDown={event => {
              if (event.target !== event.currentTarget) return;
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault(); stepWall(event.key === 'ArrowRight' ? 1 : -1);
              } else if (event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                event.currentTarget.scrollTo({ left: event.key === 'Home' ? 0 : event.currentTarget.scrollWidth,
                  behavior: teamPrefersReducedMotion() ? 'auto' : 'smooth' });
              }
            }}
            onScroll={syncBounds}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDragStart={(event) => event.preventDefault()}
            onClickCapture={(event) => {
              if (dragState.current?.moved) {
                event.preventDefault();
                event.stopPropagation();
              }
            }}
            className="flex min-w-0 max-w-full snap-x snap-mandatory items-start gap-8 overflow-x-auto px-1 py-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-10 sm:cursor-grab sm:active:cursor-grabbing"
          >
            {members.map((member, index) => (
              <div key={member.id} className="snap-start">
                <TeamPolaroidCard member={member} presentation={presentation} index={index} renderPortrait={renderPortrait}/>
              </div>
            ))}
          </div>
          {members.length > 1 ? (
            <div className="mt-2 flex justify-end gap-3">
              {([-1, 1] as const).map((direction) => {
                const disabled = direction === -1 ? bounds.atStart : bounds.atEnd;
                return (
                  <button
                    key={direction}
                    type="button"
                    onClick={() => stepWall(direction)}
                    disabled={disabled}
                    aria-label={direction === -1 ? t('Previous member') : t('Next member')}
                    className={`group/nav flex h-11 w-11 items-center justify-center rounded-full border transition-[transform,translate,scale,rotate,opacity] duration-[520ms] ${POLAROID_EASE_CLS} focus:outline-hidden focus-visible:ring-2 focus-visible:ring-current ${
                      disabled ? 'cursor-default opacity-30' : 'hover:-translate-y-0.5'
                    }`}
                    data-pf-no-color-transition=""
                    style={{ borderColor: presentation.cardBorderColor, color: readable.strong }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className={`h-[38%] w-[38%] transition-transform duration-[520ms] ${POLAROID_EASE_CLS} ${
                        direction === -1 ? 'rotate-180 group-hover/nav:-translate-x-1' : 'group-hover/nav:translate-x-1'
                      }`}
                      data-pf-no-color-transition=""
                    >
                      <path d="M4 12h15" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/**
 * Portrait rail — a draggable editorial rail. The native scrollbar is replaced by a hairline
 * progress track with a moving thumb plus an "03 / 08" counter, so the rail reads as a
 * deliberate piece of the composition instead of a browser affordance.
 */
/**
 * One rail card. Deliberately frameless: the portrait itself is the object, carrying the card's
 * radius and shadow, with the copy set on the section's own ground underneath. `cardBackgroundColor`
 * and `cardBorderColor` therefore do not draw a box here — the border color still tints the rules
 * and the scrub track, so both settings keep meaning without putting the portrait back in a frame.
 */
function TeamRailCard({
  member,
  presentation,
  index,
  gridded = false,
  renderPortrait,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
  /** `Show all` navigation: the column governs the size, so the portrait uses a ratio, not vh. */
  gridded?: boolean;
  renderPortrait?: (member: ProfileTeamMember, index: number) => ReactNode;
}) {
  const surface = presentation.sectionBackgroundEnabled && presentation.sectionBackgroundFill === 'solid'
    ? presentation.sectionBackgroundColor
    : presentation.teamPalette?.fond ?? (presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#ffffff');
  const readable = {
    strong: readableMix(presentation.nameColor, 100, surface),
    muted: readableMix(presentation.responsibilityColor, 100, surface),
  };
  const hasSocials = presentation.showSocials && member.socialLinks?.some(link => link.url.trim());
  const socialSurface = presentation.socialIconStyle === 'minimal' || presentation.socialIconStyle === 'outline'
    ? surface : presentation.socialBackgroundColor;
  const socialPresentation = {
    ...presentation,
    socialIconColor: readableMix(presentation.socialIconColor, 100, socialSurface),
  };
  const mediaWidth = { xs: 320, sm: 400, md: 464, lg: 544, xl: 640, full: 736 }[presentation.cardMaxWidth ?? 'sm'];
  const align = presentation.listAlign ?? 'center';
  const height = presentation.railImageHeight ?? 'tall';
  const radius = teamCornerRadiusClass(presentation.railImageRadius ?? 'md');
  return (
    <article className="team-rail-card group relative flex h-full w-full min-w-0 flex-col" data-team-reveal="">
      {presentation.showImage ? (
        <div
          className={`team-rail-portrait relative w-full overflow-hidden ${radius} ${teamShadowClass(presentation.cardShadow)} ${
            gridded ? teamRailPortraitAspectClass(height) : teamRailPortraitClass(height)
          }`}
          data-team-reveal-media=""
          data-rail-height={height}
          data-rail-grid={gridded}
        >
          {renderPortrait ? renderPortrait(member,index) : <TeamMemberImage
            member={member}
            presentation={{ ...presentation, imageAspect: 'portrait' }}
            fill
            zoom
            sizes={gridded ? '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw' : `(max-width: 640px) 84vw, ${mediaWidth}px`}
          />}
          {presentation.railShowNumbers !== false ? <span
            className="team-rail-index pointer-events-none absolute left-4 top-4 tabular-nums"
            data-pf-no-color-transition=""
            aria-hidden
          >
            {teamIndexLabel(index)}
          </span> : null}
        </div>
      ) : null}
      <div
        className={`team-rail-copy ${presentation.showImage ? 'mt-5' : ''} flex min-w-0 flex-1 flex-col ${
          align === 'right' ? 'items-end text-right' : align === 'center' ? 'items-center text-center' : 'items-start text-left'
        }`}
      >
        {presentation.showName ? (
          <h3
            className="team-rail-name"
            data-pf-no-color-transition=""
            style={{ color: readable.strong }}
          >
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility && member.responsibility.trim() ? (
          <p className="team-rail-role" style={{ color: readable.muted }}>
            {member.responsibility}
          </p>
        ) : null}
        {hasSocials ? (
          <div className="team-rail-socials mt-auto w-full pt-4">
            <TeamSocialLinks member={member} presentation={socialPresentation} align={teamSocialAlignClass(align)} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function TeamPortraitRail({
  members,
  presentation,
  renderPortrait,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
  renderPortrait?: (member: ProfileTeamMember, index: number) => ReactNode;
}) {
  const t = useT();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ pointerId: number; startX: number; startLeft: number; moved: boolean } | null>(null);
  const scrubbing = useRef(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [bounds, setBounds] = useState({ atStart: true, atEnd: true, overflowing: false });
  const surface = presentation.sectionBackgroundEnabled && presentation.sectionBackgroundFill === 'solid'
    ? presentation.sectionBackgroundColor
    : presentation.teamPalette?.fond ?? (presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#ffffff');
  const readable = {
    strong: readableMix(presentation.nameColor, 100, surface),
    muted: readableMix(presentation.responsibilityColor, 100, surface),
  };
  const accent = 'var(--pf-palette-principal, currentColor)';
  const navigation = presentation.railNavigation ?? 'drag';
  const arrows = navigation === 'chevrons';
  // Centering through auto margins on the edge children, never `justify-center`: a centered flex
  // row whose content overflows clips its first item outside the scrollable area, where no amount
  // of scrolling can reach it. Auto margins collapse to 0 as soon as the rail overflows.
  const railAlign =
    presentation.listAlign === 'left'
      ? ''
      : presentation.listAlign === 'right'
        ? '[&>*:first-child]:ml-auto'
        : '[&>*:first-child]:ml-auto [&>*:last-child]:mr-auto';
  const footerAlign =
    presentation.listAlign === 'left'
      ? 'justify-start'
      : presentation.listAlign === 'right'
        ? 'justify-end'
        : 'justify-center';

  const syncProgress = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const travel = scroller.scrollWidth - scroller.clientWidth;
    const ratio = travel > 4 ? Math.min(1, Math.max(0, scroller.scrollLeft / travel)) : 0;
    setProgress(ratio);
    const atEnd = travel <= 4 || scroller.scrollLeft >= travel - 2;
    const origin = scroller.getBoundingClientRect().left;
    let nearest = 0;
    let distance = Infinity;
    Array.from(scroller.children).forEach((card, index) => {
      const delta = Math.abs(card.getBoundingClientRect().left - origin);
      if (delta < distance) { distance = delta; nearest = index; }
    });
    setActive(travel <= 4 ? 0 : atEnd ? members.length - 1 : nearest);
    setBounds({ atStart: scroller.scrollLeft <= 2, atEnd, overflowing: travel > 4 });
  }, [members.length]);

  useEffect(() => {
    syncProgress();
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncProgress);
    observer.observe(scroller);
    Array.from(scroller.children).forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [syncProgress, navigation, presentation.cardMaxWidth]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    // Mouse only — touch and pen keep the native, momentum-preserving scroll.
    if (!scroller || event.pointerType !== 'mouse' || event.button !== 0) return;
    if ((event.target as HTMLElement).closest('a, button, input')) return;
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: scroller.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    const drag = dragState.current;
    if (!scroller || !drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) > 4) {
      drag.moved = true;
      scroller.style.scrollSnapType = 'none';
      scroller.setPointerCapture?.(event.pointerId);
    }
    if (!drag.moved) return;
    scroller.scrollLeft = drag.startLeft - delta;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const scroller = scrollerRef.current;
    if (scroller?.hasPointerCapture?.(event.pointerId)) scroller.releasePointerCapture(event.pointerId);
    if (scroller) scroller.style.scrollSnapType = '';
    // Keep the flag one frame longer so the click that ends a drag never opens a social link.
    if (drag.moved) window.setTimeout(() => { dragState.current = null; }, 0);
    else dragState.current = null;
  };

  /** Scrub: the indicator is a control, not a readout — press or drag anywhere on the track. */
  const scrubTo = (clientX: number, smooth: boolean) => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const travel = scroller.scrollWidth - scroller.clientWidth;
    scroller.scrollTo({ left: ratio * travel, behavior: smooth && !teamPrefersReducedMotion() ? 'smooth' : 'auto' });
  };

  const scrollToIndex = (index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller || members.length < 2) return;
    const travel = scroller.scrollWidth - scroller.clientWidth;
    const card = scroller.children[index] as HTMLElement | undefined;
    if (!card) return;
    const target = card.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft;
    scroller.scrollTo({ left: Math.max(0, Math.min(travel, target)), behavior: teamPrefersReducedMotion() ? 'auto' : 'smooth' });
  };

  /** Arrow navigation: land on the next portrait's own edge, never a fixed pixel amount — the
   *  cards are a different width on every breakpoint and at every `Card width` setting. */
  const stepRail = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = Array.from(scroller.children) as HTMLElement[];
    if (cards.length === 0) return;
    const origin = scroller.getBoundingClientRect().left;
    const leftOf = (card: HTMLElement) => card.getBoundingClientRect().left - origin + scroller.scrollLeft;
    const current = scroller.scrollLeft;
    const next =
      direction === 1
        ? cards.find((card) => leftOf(card) > current + 4)
        : [...cards].reverse().find((card) => leftOf(card) < current - 4);
    const travel = scroller.scrollWidth - scroller.clientWidth;
    const target = next ? leftOf(next) : direction === 1 ? travel : 0;
    scroller.scrollTo({ left: Math.max(0, Math.min(travel, target)), behavior: teamPrefersReducedMotion() ? 'auto' : 'smooth' });
  };

  // `Show all` — no traversal at all: every portrait laid out in rows, sized by its column.
  if (navigation === 'show-all') {
    const columns = Math.min(presentation.railColumns ?? 3, members.length);
    const columnClass =
      columns === 1
        ? 'grid-cols-1'
        : columns === 2
        ? 'sm:grid-cols-2'
        : columns === 4
          ? 'sm:grid-cols-2 xl:grid-cols-4'
          : 'sm:grid-cols-2 lg:grid-cols-3';
    const justify =
      presentation.listAlign === 'left'
        ? 'justify-items-start'
        : presentation.listAlign === 'right'
          ? 'justify-items-end'
          : 'justify-items-stretch';
    const gaps =
      presentation.gap === 'sm'
        ? 'gap-x-6 gap-y-10'
        : presentation.gap === 'md'
          ? 'gap-x-8 gap-y-14'
          : presentation.gap === 'xl'
            ? 'gap-x-16 gap-y-24'
            : 'gap-x-12 gap-y-20';
    return (
      <div className={`team-portrait-rail team-rail-grid grid w-full grid-cols-1 items-stretch ${columnClass} ${gaps} ${justify} ${members.length === 1 ? `max-w-md ${teamListAlignClass(presentation.listAlign)}` : ''}`}>
        {members.map((member, index) => (
          <TeamRailCard key={member.id} member={member} presentation={presentation} index={index} gridded renderPortrait={renderPortrait}/>
        ))}
      </div>
    );
  }

  return (
    // `min-w-0` on both the rail and its scroller: a horizontally scrollable flex row otherwise
    // reports its full content width to an `auto`-sized grid/flex parent and stretches the whole
    // page instead of scrolling inside it.
    <div className="team-portrait-rail w-full min-w-0" style={{ color: readable.strong }}>
      <div
        ref={scrollerRef}
        data-member-count={members.length}
        role="region"
        aria-label={t('Scroll through the team')}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            scrollToIndex(event.key === 'Home' ? 0 : members.length - 1);
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            stepRail(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}
        onScroll={syncProgress}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        // Without this the browser starts its own native image drag as soon as the pointer moves
        // over a portrait, which swallows the pointermove stream and the rail never scrolls.
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (dragState.current?.moved) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        className={`team-rail-scroller flex min-w-0 max-w-full snap-x snap-mandatory items-stretch gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-8 sm:cursor-grab sm:active:cursor-grabbing ${railAlign}`}
      >
        {members.map((member, index) => (
          <div
            key={member.id}
            // `snap-start`, not `snap-center`: the arrows step by aligning the next portrait to the
            // rail's leading edge, and with centre snapping the browser pulled that target back to
            // its own nearest snap point — pressing "previous" simply did nothing.
            className={`flex w-[min(84vw,100%)] max-w-full shrink-0 snap-start self-stretch ${teamRailCardWidthClass(presentation.cardMaxWidth)}`}
          >
            <TeamRailCard member={member} presentation={presentation} index={index} renderPortrait={renderPortrait}/>
          </div>
        ))}
      </div>
      {members.length > 1 && bounds.overflowing ? (
        <div className={`team-rail-footer mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 ${footerAlign}`}>
          <p className="flex items-baseline gap-3" aria-live="polite">
            <TeamOdometer
              value={teamIndexLabel(active)}
              className="text-[calc(1rem*var(--pf-team-font-scale,1))] font-medium leading-none"
              style={{ color: readable.strong }}
            />
            <span className="team-rail-total" style={{ color: readable.muted }}>
              / {teamIndexLabel(members.length - 1)}
            </span>
          </p>
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div
              ref={trackRef}
              role={arrows ? undefined : 'slider'}
              tabIndex={arrows ? undefined : 0}
              aria-label={arrows ? undefined : t('Scroll through the team')}
              aria-valuemin={arrows ? undefined : 1}
              aria-valuemax={arrows ? undefined : members.length}
              aria-valuenow={arrows ? undefined : active + 1}
              aria-valuetext={arrows ? undefined : members[active]?.name}
              aria-hidden={arrows ? true : undefined}
              onPointerDown={
                arrows
                  ? undefined
                  : (event) => {
                      scrubbing.current = true;
                      event.currentTarget.setPointerCapture?.(event.pointerId);
                      scrubTo(event.clientX, false);
                    }
              }
              onPointerMove={
                arrows
                  ? undefined
                  : (event) => {
                      if (scrubbing.current) scrubTo(event.clientX, false);
                    }
              }
              onPointerUp={
                arrows
                  ? undefined
                  : (event) => {
                      scrubbing.current = false;
                      event.currentTarget.releasePointerCapture?.(event.pointerId);
                    }
              }
              onPointerCancel={
                arrows
                  ? undefined
                  : () => {
                      scrubbing.current = false;
                    }
              }
              onKeyDown={
                arrows
                  ? undefined
                  : (event) => {
                      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                      event.preventDefault();
                      if (event.key === 'Home' || event.key === 'End') {
                        scrollToIndex(event.key === 'Home' ? 0 : members.length - 1);
                      } else {
                        stepRail(event.key === 'ArrowRight' ? 1 : -1);
                      }
                    }
              }
              // With arrows the line is a read-only progress bar — the buttons are the control, and
              // two competing controls for one rail is exactly the ambiguity this setting removes.
              className={`team-rail-track group/track relative w-full py-4 ${
                arrows ? '' : 'cursor-pointer touch-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-current'
              }`}
            >
              <span
                className={`block h-px w-full transition-[height] duration-[420ms] ${EASE_CLS} ${
                  arrows ? '' : 'group-hover/track:h-[2px]'
                }`}
                data-pf-no-color-transition=""
                style={{ backgroundColor: presentation.cardBorderColor }}
                aria-hidden
              />
              <span
                className={`absolute left-0 top-1/2 block h-[2px] [transform:translateY(-50%)] transition-[height] duration-[420ms] ${EASE_CLS} ${
                  arrows ? '' : 'group-hover/track:h-[3px]'
                }`}
                data-pf-no-color-transition=""
                style={{
                  backgroundColor: accent,
                  width: `${100 / members.length}%`,
                  transform: `translate(${progress * (members.length - 1) * 100}%, -50%)`,
                  transition: 'transform 420ms cubic-bezier(0.16,1,0.3,1), height 420ms cubic-bezier(0.16,1,0.3,1)',
                }}
                aria-hidden
              />
            </div>
            {arrows ? (
              <div className="flex shrink-0 items-center gap-3">
                {([-1, 1] as const).map((direction) => {
                  const disabled = direction === -1 ? bounds.atStart : bounds.atEnd;
                  return (
                    <button
                      key={direction}
                      type="button"
                      onClick={() => stepRail(direction)}
                      disabled={disabled}
                      aria-label={direction === -1 ? t('Previous member') : t('Next member')}
                      className={`group/nav flex h-12 w-12 items-center justify-center rounded-full border transition-[transform,translate,scale,rotate,opacity] duration-[520ms] ${EASE_CLS} focus:outline-hidden focus-visible:ring-2 focus-visible:ring-current ${
                        disabled ? 'cursor-default opacity-30' : 'hover:-translate-y-0.5'
                      }`}
                      data-pf-no-color-transition=""
                      style={{ borderColor: presentation.cardBorderColor, color: readable.strong }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                        className={`h-[38%] w-[38%] transition-transform duration-[520ms] ${EASE_CLS} ${
                          direction === -1
                            ? 'rotate-180 group-hover/nav:-translate-x-1'
                            : 'group-hover/nav:translate-x-1'
                        }`}
                        data-pf-no-color-transition=""
                      >
                        <path d="M4 12h15" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Spotlight keeps a single portrait prominent, with untruncated copy and keyboard-operable tabs.
 */
export function TeamSpotlight({
  members, presentation, renderPortrait,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
  renderPortrait?: (member: ProfileTeamMember, index: number) => ReactNode;
}) {
  const t = useT();
  const prefix = useId();
  const [memberOrder, setMemberOrder] = useState(() => members.map(member => member.id));
  const orderedIds = [...memberOrder.filter(id => members.some(member => member.id === id)),
    ...members.filter(member => !memberOrder.includes(member.id)).map(member => member.id)];
  const active = members.find(member => member.id === orderedIds[0]);
  const queuedMembers = orderedIds.slice(1).map(id => members.find(member => member.id === id)!);
  const activeIndex = Math.max(0, members.findIndex(member => member.id === active?.id));
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navigation = presentation.spotlightNavigation ?? 'thumbnails';
  const hasTabs = members.length > 1 && navigation !== 'arrows';
  const thumbnailPositions = useRef(new Map<string, number>());
  const capturePositions = useCallback(() => {
    thumbnailPositions.current = new Map(thumbRefs.current.filter(node => node !== null)
      .map(node => [node!.id, node!.getBoundingClientRect().left]));
  }, []);

  useLayoutEffect(() => {
    const positions = thumbnailPositions.current;
    if (!positions.size || teamPrefersReducedMotion()) return;
    for (const node of thumbRefs.current) {
      if (!node) continue;
      gsap.killTweensOf(node);
      gsap.set(node, { clearProps: 'transform' });
      const oldLeft = positions.get(node.id);
      if (oldLeft !== undefined) gsap.fromTo(node, { x: oldLeft - node.getBoundingClientRect().left },
        { x: 0, duration: 0.45, ease: 'power3.out', clearProps: 'transform' });
    }
    positions.clear();
  }, [active?.id]);

  const select = (id: string) => {
    if (id === active?.id) return;
    capturePositions();
    const focusedIndex = thumbRefs.current.findIndex(node => node === document.activeElement);
    setMemberOrder([id, ...orderedIds.slice(1).filter(queuedId => queuedId !== id), orderedIds[0]]);
    if (focusedIndex >= 0) requestAnimationFrame(() => thumbRefs.current[Math.min(focusedIndex, queuedMembers.length - 1)]?.focus());
  };
  const step = useCallback((direction: 1 | -1) => {
    if (members.length < 2) return;
    capturePositions();
    setMemberOrder(current => {
      const order = [...current.filter(id => members.some(member => member.id === id)),
        ...members.filter(member => !current.includes(member.id)).map(member => member.id)];
      return direction === 1 ? [...order.slice(1), order[0]] : [order[order.length - 1], ...order.slice(0, -1)];
    });
  }, [members, capturePositions]);
  useTeamSwipe(portraitRef, step, members.length < 2);

  useEffect(() => {
    const tab = thumbRefs.current[0];
    const strip = tab?.parentElement;
    if (!tab || !strip) return;
    const rect = tab.getBoundingClientRect();
    const bounds = strip.getBoundingClientRect();
    if (rect.left < bounds.left || rect.right > bounds.right) {
      strip.scrollTo({
        left: strip.scrollLeft + rect.left - bounds.left - (strip.clientWidth - rect.width) / 2,
        behavior: teamPrefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  }, [activeIndex, hasTabs]);

  if (!active) return null;
  const surface = presentation.cardBackgroundEnabled !== false
    ? presentation.cardBackgroundColor
    : presentation.teamPalette?.fond ?? (presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#ffffff');
  const readable = {
    strong: readableMix(presentation.nameColor, 100, surface),
    muted: readableMix(presentation.responsibilityColor, 100, surface),
  };
  const socialSurface = presentation.socialIconStyle === 'minimal' || presentation.socialIconStyle === 'outline'
    ? surface : presentation.socialBackgroundColor;
  const socialPresentation = {
    ...presentation, socialIconColor: readableMix(presentation.socialIconColor, 100, socialSurface),
  };
  const portraitRight = presentation.spotlightPortraitSide === 'right';
  const panelId = `${prefix}-member`;
  const hasSocials = presentation.showSocials && active.socialLinks?.some(link => link.url.trim());
  const frame = `${teamCornerRadiusClass(presentation.spotlightPanelRadius ?? 'md')} ${teamShadowClass(presentation.cardShadow)} ${
    presentation.cardBorder === 'none' ? 'border-0' : presentation.cardBorder === 'medium' ? 'border-2' : 'border'
  }`;

  return (
    <article
      className={`team-spotlight w-full ${frame} ${teamSpotlightMaxWidthClass(presentation.cardMaxWidth)} ${teamListAlignClass(presentation.listAlign)}`}
      data-team-reveal="" data-portrait-right={portraitRight} data-with-image={presentation.showImage}
      data-padding={presentation.cardPadding} style={teamCardStyle(presentation)}
    >
      {presentation.showImage && (
        <div ref={portraitRef} className="team-spotlight-portrait" data-pf-no-color-transition>
          {members.map((member, index) => (
            <div key={member.id} className="team-spotlight-image-layer" data-pf-no-color-transition
              data-active={member.id === active.id} aria-hidden={member.id !== active.id}>
              {renderPortrait ? renderPortrait(member, index) : <TeamMemberImage member={member} presentation={presentation} fill
                sizes="(max-width: 1023px) 100vw, 50vw" />}
            </div>
          ))}
        </div>
      )}
      <div className="team-spotlight-copy" style={{ color: readable.strong }}>
        {members.length > 1 && (
          <div className="team-spotlight-navigation">
            {(navigation === 'arrows' || navigation === 'both') && (
              <div className="team-spotlight-arrows">
                {([-1, 1] as const).map(direction => (
                  <button key={direction} type="button" onClick={() => step(direction)}
                    aria-controls={panelId}
                    aria-label={direction === -1 ? t('Previous member') : t('Next member')}
                    className="team-spotlight-arrow" data-pf-no-color-transition
                    style={{ borderColor: presentation.cardBorderColor }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                      strokeLinecap="round" strokeLinejoin="round" aria-hidden
                      style={{ transform: direction === -1 ? 'rotate(180deg)' : undefined }}>
                      <path d="M4 12h15M13 6l6 6-6 6" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
            {hasTabs && (
              <div className="team-spotlight-tabs" role="group" aria-label={t('Choose a team member')}>
                {queuedMembers.map((member, index) => (
                  <button key={member.id} id={`${prefix}-tab-${member.id}`}
                    ref={node => { thumbRefs.current[index] = node; }}
                    type="button"
                    aria-controls={panelId} aria-label={member.name}
                    className="team-spotlight-tab" data-pf-no-color-transition
                    data-with-image={presentation.showImage}
                    onClick={() => select(member.id)}
                    onKeyDown={event => {
                      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                      event.preventDefault();
                      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? queuedMembers.length - 1 :
                        (index + (event.key === 'ArrowRight' ? 1 : -1) + queuedMembers.length) % queuedMembers.length;
                      thumbRefs.current[nextIndex]?.focus();
                    }}
                    >
                    {presentation.showImage ? (
                      renderPortrait ? renderPortrait(member, members.findIndex(item => item.id === member.id)) : <TeamMemberImage member={member} presentation={presentation} fill sizes="(min-width: 1024px) 104px, 88px" />
                    ) : <span>{member.name}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div ref={copyRef} id={panelId} className="team-spotlight-content"
          data-pf-no-color-transition>
          {members.length > 1 && (
            <p className="team-spotlight-count" role="status" aria-live="polite" aria-atomic="true">
              {teamIndexLabel(activeIndex)} <span style={{ color: readable.muted }}>/ {teamIndexLabel(members.length - 1)}</span>
              <span className="sr-only"> — {active.name}</span>
            </p>
          )}
          {presentation.showName && <h3 className="team-spotlight-name">{active.name}</h3>}
          {presentation.showResponsibility && active.responsibility.trim() && (
            <p className="team-spotlight-role" style={{ color: readable.muted }}>{active.responsibility}</p>
          )}
          {hasSocials && (
            <div className="team-spotlight-socials">
              <TeamSocialLinks member={active} presentation={socialPresentation} align="justify-start" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Directory's fixed portrait: a 4:5 print sized against the display-size name (about two lines of
 * it). `Full` corners make it a true circle, so it turns square too — a fully rounded 4:5 would
 * read as a pill, not an avatar. The circle's diameter sits between the print's width and height,
 * so switching shape keeps roughly the same visual weight in the row.
 */
function teamDirectoryPlateSizeClass(radius: PortfolioTeamAvatarRadius): string {
  if (radius === 'full') {
    return 'h-[5.5rem] w-[5.5rem] sm:h-[clamp(5rem,7.2vw,6.75rem)] sm:w-[clamp(5rem,7.2vw,6.75rem)]';
  }
  return 'h-[6.25rem] w-[5rem] sm:h-[clamp(5.5rem,8vw,7.5rem)] sm:w-[clamp(4.4rem,6.4vw,6rem)]';
}

/**
 * `Portrait corners` (Layout settings), one scale per portrait size so each step reads the same:
 * the ~6rem print, the 17rem cursor plate (its `md` is the plate's original 2rem corner) and the
 * square touch avatar.
 */
function teamDirectoryPlateRadiusClass(radius: PortfolioTeamAvatarRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'sm') return 'rounded-md';
  if (radius === 'lg') return 'rounded-[1.5rem]';
  if (radius === 'full') return 'rounded-full';
  return 'rounded-xl';
}

function teamDirectoryCursorPlateRadiusClass(radius: PortfolioTeamAvatarRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'sm') return 'rounded-xl';
  if (radius === 'lg') return 'rounded-[4rem]';
  if (radius === 'full') return 'rounded-full';
  return 'rounded-[2rem]';
}

function teamDirectoryAvatarRadiusClass(radius: PortfolioTeamAvatarRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'sm') return 'rounded-lg';
  if (radius === 'lg') return 'rounded-[34%]';
  if (radius === 'full') return 'rounded-full';
  return 'rounded-[22%]';
}

/**
 * Where a row's portrait goes: `none` when the list's cursor plate carries it, `inline` for the
 * touch fallback of that cursor mode, `left`/`right` for the fixed print (Layout settings).
 */
type TeamDirectoryRowPortrait = 'none' | 'inline' | 'left' | 'right';

/**
 * Directory — a numbered editorial roster with medium-weight names and readable roles.
 * By default, on a large screen with a hovering pointer the portrait
 * leaves the row entirely and becomes a plate that follows the cursor (see `TeamDirectoryList`);
 * the `left`/`right` modes instead pin a print into every row, so each face is visible at rest.
 */
function TeamDirectoryRow({
  member, presentation, detached, index, portrait, onPreview,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  detached: boolean;
  index: number;
  portrait: TeamDirectoryRowPortrait;
  onPreview?: (memberId: string | null) => void;
}) {
  const surface = detached && presentation.cardBackgroundEnabled !== false
    ? presentation.cardBackgroundColor
    : presentation.teamPalette?.fond ?? (presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#fff');
  const strong = readableMix(presentation.nameColor, 100, surface);
  const muted = readableMix(presentation.responsibilityColor, 100, surface);
  const socialSurface = ['minimal', 'outline'].includes(presentation.socialIconStyle)
    ? surface : presentation.socialBackgroundColor;
  const socialPresentation = { ...presentation, socialIconColor: readableMix(presentation.socialIconColor, 100, socialSurface) };
  const radius = presentation.directoryPortraitRadius ?? 'md';
  const hasPortrait = portrait !== 'none' && presentation.showImage;
  const hasSocials = presentation.showSocials && member.socialLinks?.some(link => link.url.trim());
  return (
    <article className={`team-directory-row group relative ${detached ? teamCardFrameClass(presentation) : 'border-b last:border-b-0'}`}
      data-detached={detached} data-padding={presentation.cardPadding} data-portrait={hasPortrait ? portrait : 'none'}
      data-team-reveal="" data-pf-no-color-transition=""
      style={detached ? teamCardStyle(presentation) : { borderColor: presentation.cardBorderColor }}
      onPointerEnter={event => { if (event.pointerType === 'mouse') onPreview?.(member.id); }}
      onPointerLeave={() => onPreview?.(null)}>
      <span className="team-directory-index" style={{ color: muted }} aria-hidden="true">{teamIndexLabel(index)}</span>
      {hasPortrait && (
        <div data-pf-no-color-transition="" className={`team-directory-portrait ${portrait === 'inline'
          ? `${teamDirectoryAvatarRadiusClass(radius)} ${teamAvatarSizeClass(presentation.avatarSize)}`
          : `${teamDirectoryPlateSizeClass(radius)} ${teamDirectoryPlateRadiusClass(radius)}`}`}>
          <TeamMemberImage member={member} presentation={presentation} fill sizes="120px" />
        </div>
      )}
      <div className="team-directory-copy" data-pf-no-color-transition="">
        {presentation.showName && <h3 className="team-directory-name" style={{ color: strong }}>{member.name}</h3>}
        {presentation.showResponsibility && member.responsibility.trim() && (
          <p className="team-directory-role" style={{ color: muted }}>{member.responsibility}</p>
        )}
      </div>
      {hasSocials && (
        <div className="team-directory-socials">
          <TeamSocialLinks member={member} presentation={socialPresentation} align="justify-start" />
        </div>
      )}
      <span className="team-directory-accent" aria-hidden="true" data-pf-no-color-transition="" />
    </article>
  );
}

/**
 * Directory shell. In `cursor` mode, on a hovering pointer it owns a portrait plate that trails the
 * cursor through the whole index (GSAP `quickTo`, so it eases rather than snapping); on touch the
 * rows keep their inline avatars. In `left`/`right` mode every row carries its own fixed print on
 * every pointer type and the plate is never mounted.
 */
export function TeamDirectoryList({
  members,
  presentation,
  detached,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
  detached: boolean;
}) {
  const canHover = useHoverPointer();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const plateRef = useRef<HTMLDivElement | null>(null);
  const moveX = useRef<((value: number) => void) | null>(null);
  const moveY = useRef<((value: number) => void) | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const mode = presentation.directoryPortrait ?? 'cursor';
  // The trailing plate exists only in `cursor` mode on a hovering pointer — a fixed print and a
  // cursor plate never show together.
  const cursorPortrait = mode === 'cursor' && canHover && presentation.showImage !== false;
  const rowPortrait: TeamDirectoryRowPortrait =
    mode !== 'cursor' ? mode : cursorPortrait ? 'none' : 'inline';
  // Links remain available at rest in every portrait mode.
  const plateRadius = presentation.directoryPortraitRadius ?? 'md';
  const previewMember = members.find((member) => member.id === previewId) ?? null;

  useEffect(() => {
    if (!cursorPortrait) return;
    const plate = plateRef.current;
    if (!plate) return;
    try {
      gsap.set(plate, { x: plate.offsetWidth / 2, y: plate.offsetHeight / 2 });
      moveX.current = gsap.quickTo(plate, 'x', { duration: 0.65, ease: 'power3.out' });
      moveY.current = gsap.quickTo(plate, 'y', { duration: 0.65, ease: 'power3.out' });
    } catch (error) {
      console.error('[Team directory] cursor plate failed to initialize', error);
    }
    return () => {
      moveX.current = null;
      gsap.killTweensOf(plate);
      moveY.current = null;
    };
  }, [cursorPortrait]);

  useEffect(() => {
    const plate = plateRef.current;
    if (!cursorPortrait || !plate) return;
    gsap.to(plate, {
      autoAlpha: previewMember ? 1 : 0,
      scale: previewMember ? 1 : 0.92,
      duration: previewMember ? 0.5 : 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }, [cursorPortrait, previewMember]);

  return (
    <div
      ref={wrapRef}
      className="team-directory relative w-full"
      onPointerMove={(event) => {
        if (!cursorPortrait || event.pointerType !== 'mouse') return;
        const wrap = wrapRef.current;
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const plate = plateRef.current;
        if (!plate) return;
        const halfWidth = plate.offsetWidth / 2;
        const halfHeight = plate.offsetHeight / 2;
        moveX.current?.(Math.max(halfWidth, Math.min(rect.width - halfWidth, event.clientX - rect.left + halfWidth + 32)));
        moveY.current?.(Math.max(halfHeight, Math.min(Math.max(halfHeight, rect.height - halfHeight), event.clientY - rect.top)));
      }}
      onPointerLeave={() => setPreviewId(null)}
    >
      {detached ? (
        <div
          className="flex w-full flex-col"
          // Layout settings → Card spacing (px); the settings merge supplies the old `gap` step when unset.
          style={{ rowGap: `${presentation.directoryCardGap ?? teamDirectoryDefaultCardGap(presentation.gap)}px` }}
        >
          {members.map((member, index) => (
            <TeamDirectoryRow
              key={member.id}
              member={member}
              presentation={presentation}
              detached
              index={index}
              portrait={rowPortrait}
              onPreview={cursorPortrait ? setPreviewId : undefined}
            />
          ))}
        </div>
      ) : (
        <div
          className={detached ? '' : 'border-t'}
          style={{ borderColor: presentation.cardBorderColor }}
        >
          {members.map((member, index) => (
            <TeamDirectoryRow
              key={member.id}
              member={member}
              presentation={presentation}
              detached={false}
              index={index}
              portrait={rowPortrait}
              onPreview={cursorPortrait ? setPreviewId : undefined}
            />
          ))}
        </div>
      )}
      {cursorPortrait ? (
        <div
          ref={plateRef}
          aria-hidden
          className={`team-directory-cursor pointer-events-none absolute left-0 top-0 z-20 overflow-hidden opacity-0 shadow-lg shadow-black/10 ${teamDirectoryCursorPlateRadiusClass(plateRadius)}`}
          data-pf-no-color-transition=""
          // `Full` makes the plate a circle, so it goes square; the margins keep the cursor at its centre.
          style={{
            width: 'min(17rem, 65vw)',
            height: plateRadius === 'full' ? 'min(17rem, 65vw)' : 'min(21.5rem, 82vw)',
            marginLeft: 'max(-8.5rem, -32.5vw)',
            marginTop: plateRadius === 'full' ? 'max(-8.5rem, -32.5vw)' : 'max(-10.75rem, -41vw)',
            willChange: 'transform',
          }}
        >
          {previewMember ? (
            <TeamMemberImage
              member={previewMember}
              presentation={{ ...presentation, imageAspect: 'portrait', showImage: true }}
              fill
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Public Team design dispatcher. */

export function EditorialTeamGallery({
  members,
  presentation,
  contentGutter,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
  /** Site-wide editorial gutter (settings.global.contentGutter) — only the full-bleed layouts read
   *  it, to cancel the gutter their own container inherits from `<main>`. */
  contentGutter?: PortfolioContentGutter;
}) {
  const rootRef = useTeamEntrance<HTMLDivElement>(
    `${presentation.layout}:${members.length}`,
    presentation.layout === 'polaroid'
  );
  if (members.length === 0) return null;

  if (presentation.layout === 'spotlight') {
    return (
      <div ref={rootRef} className="w-full">
        <TeamSpotlight members={members} presentation={presentation} />
      </div>
    );
  }

  if (presentation.layout === 'split-screen') {
    return (
      <div ref={rootRef} className="w-full min-w-0">
        <TeamSplitScreen members={members} presentation={presentation} contentGutter={contentGutter} />
      </div>
    );
  }

  if (presentation.layout === 'editorial-rhythm') {
    return (
      <div ref={rootRef} className="w-full min-w-0">
        <TeamEditorialRhythm members={members} presentation={presentation} />
      </div>
    );
  }

  if (presentation.layout === 'floating-canvas') {
    return (
      <div ref={rootRef} className="w-full min-w-0">
        <TeamFloatingCanvas members={members} presentation={presentation} contentGutter={contentGutter} />
      </div>
    );
  }

  if (presentation.layout === 'portrait-rail') {
    return (
      <div ref={rootRef} className="w-full">
        <TeamPortraitRail members={members} presentation={presentation} />
      </div>
    );
  }

  if (presentation.layout === 'float-cards') {
    return (
      <div ref={rootRef} className="w-full min-w-0 overflow-visible">
        <TeamFloatCardsGallery members={members} presentation={presentation} />
      </div>
    );
  }

  if (presentation.layout === 'avatar-cards') {
    return (
      <div ref={rootRef} className="w-full min-w-0 overflow-visible">
        <TeamAvatarCards members={members} presentation={presentation} />
      </div>
    );
  }

  if (presentation.layout === 'directory') {
    const detached = presentation.directoryDetachedCards !== false;
    return (
      <div
        ref={rootRef}
        className={`w-full ${teamDirectoryMaxWidthClass(presentation.cardMaxWidth)} ${teamListAlignClass(presentation.listAlign)}`}
      >
        <TeamDirectoryList members={members} presentation={presentation} detached={detached} />
      </div>
    );
  }

  if (presentation.layout === 'polaroid') {
    return (
      <div ref={rootRef} className="w-full">
        <TeamPolaroidWall members={members} presentation={presentation} />
      </div>
    );
  }

  if (presentation.layout === 'profile-cards' || presentation.layout === 'cover-cards') {
    return (
      <div ref={rootRef} className="w-full min-w-0">
        <TeamProfileCardsGallery key={presentation.layout} members={members}
          presentation={presentation.layout === 'cover-cards' ? teamHoverVeilPresentation(presentation) : presentation}
          variant={presentation.layout === 'cover-cards' ? 'veil' : 'profile'} />
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`w-full overflow-visible ${teamGridClass(presentation.columns, presentation.gap, presentation.listAlign)}`}
    >
      {members.map(member => <TeamStandardCard key={member.id} member={member} presentation={presentation} />)}
    </div>
  );
}
