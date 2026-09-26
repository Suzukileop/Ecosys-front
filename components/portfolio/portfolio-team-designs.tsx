'use client';

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
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
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
  teamHoverPhotoClass,
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
import { TeamProfileCardsGallery } from '@/components/portfolio/portfolio-team-design-profile-cards';
import {
  TEAM_CLEAR_PROPS,
  teamIndexLabel,
  teamPrefersReducedMotion,
  teamPremiumEase,
  useTeamEntrance,
  useTeamSwipe,
} from '@/components/portfolio/portfolio-team-design-motion';
import type { ProfileTeamMember } from '@/types/ecosystem';
import { TeamAvatarCards } from '@/components/portfolio/portfolio-team-design-avatar-cards';
import { TeamFloatCardsGallery } from '@/components/portfolio/portfolio-team-design-float-cards';
import { TeamSplitScreen } from '@/components/portfolio/portfolio-team-design-split-screen';
import type { PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';
import { TeamEditorialRhythm } from '@/components/portfolio/portfolio-team-design-editorial-rhythm';
import { TeamFloatingCanvas } from '@/components/portfolio/portfolio-team-design-floating-canvas';
import {
  EASE_CLS,
  HOVER_CLS,
  META_CLS,
  TOUCH_REVEAL_CLS,
  TeamMemberImage,
  TeamSocialLinks,
} from '@/components/portfolio/portfolio-team-design-primitives';


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
 * True only on a pointer that can actually hover (a real mouse). Read through
 * `useSyncExternalStore` so it is SSR-safe and never sets state from an effect; a narrow desktop
 * window still reports `hover: hover`, which is exactly the distinction the hover-only affordances
 * below depend on.
 */
function useHoverPointer(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia('(hover: hover) and (pointer: fine)');
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
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
  if (shadow === 'soft') return 'shadow-sm';
  if (shadow === 'medium') return 'shadow-lg shadow-black/10';
  if (shadow === 'strong') return 'shadow-2xl shadow-black/20';
  return '';
}

/**
 * Spotlight frame. What actually keeps the panel rigid is that no dimension depends on the member
 * on screen: the name and role boxes below reserve a fixed number of lines, so the copy measures
 * the same whoever is selected. The desktop height is therefore a `min-h` with a floor, not a hard
 * `h`: the frame still never moves between members, but a short viewport grows it instead of
 * clipping the counter off the top (measured: a hard height cut 23px at a 760px viewport).
 * Below `lg` the *image* carries the fixed height and the stacked copy flows underneath.
 */
const TEAM_SPOTLIGHT_PANEL_CLASS = 'lg:min-h-[clamp(34rem,62vh,44rem)]';
/** The portrait fills its half of that locked frame — never the other way round. */
const TEAM_SPOTLIGHT_PORTRAIT_CLASS = 'aspect-[4/5] sm:aspect-auto sm:h-[22rem] lg:h-full';
/**
 * Two lines of the name are reserved at every breakpoint (`1.88 = 2 × the 0.94 line-height`), so a
 * one-word name and a two-line one occupy exactly the same box and everything below them — role,
 * links, navigation — keeps its position when you switch member.
 */
const TEAM_SPOTLIGHT_NAME_BOX_CLASS =
  'h-[calc(1.88*clamp(2.5rem,5.4vw,5rem))] overflow-hidden';

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
  '-rotate-[3deg]',
  'rotate-[2.25deg]',
  '-rotate-[1.5deg]',
  'rotate-[3.5deg]',
  '-rotate-[2.75deg]',
  'rotate-[1.25deg]',
  '-rotate-[4deg]',
  'rotate-[1.75deg]',
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
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
  /** Grid ("View all") mode only — the rail keeps every print level with its neighbors. */
  gridded?: boolean;
}) {
  const readable = teamReadableCardText(presentation);
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
      className={`group relative shrink-0 ${gridded ? 'w-full' : `w-[72vw] ${teamRailCardWidthClass(presentation.cardMaxWidth)}`} ${rotation} ${lift} shadow-[0_1px_2px_rgba(0,0,0,0.35),0_10px_20px_-6px_rgba(0,0,0,0.45),0_32px_56px_-18px_rgba(0,0,0,0.55)] transition-[transform,box-shadow] duration-[820ms] ${POLAROID_EASE_CLS} hover:z-20 hover:translate-y-0 hover:rotate-0 hover:scale-[1.055] hover:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_20px_36px_-8px_rgba(0,0,0,0.5),0_48px_80px_-16px_rgba(0,0,0,0.6)]`}
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
      <div className="relative p-3 pb-0 sm:p-4 sm:pb-0">
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
          {presentation.showImage ? (
            <div
              className={`relative h-full w-full transition-[filter] duration-[900ms] ${POLAROID_EASE_CLS} ${toneCls}`}
              data-pf-no-color-transition=""
            >
              <TeamMemberImage
                member={member}
                presentation={{ ...presentation, imageAspect: 'square' }}
                fill
                zoom
                reveal
              />
            </div>
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-[2.5rem] font-semibold tracking-[-0.04em] text-neutral-500"
              aria-hidden
            >
              {member.name.trim().charAt(0).toUpperCase() || '—'}
            </div>
          )}
          {/* Print grain — heavier than the paper's, and blended so it reads on both the dark
              placeholder and a bright photo instead of just muddying one of the two. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{ backgroundImage: `url("${POLAROID_GRAIN_URL}")`, backgroundSize: '140px 140px' }}
          />
        </div>
      </div>
      <div className="relative flex items-start justify-between gap-3 px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
        <div className="min-w-0">
          {presentation.showName ? (
            <h3
              className="truncate text-[calc(1.05rem*var(--pf-team-font-scale,1))] font-semibold leading-[1.15] tracking-[-0.015em]"
              style={{ color: readable.strong }}
            >
              {member.name}
            </h3>
          ) : null}
          {presentation.showResponsibility ? (
            <p
              className="mt-1 min-h-[0.65rem] truncate font-mono text-[calc(0.62rem*var(--pf-team-font-scale,1))] font-medium uppercase leading-none tracking-[0.16em]"
              style={{ color: readable.muted }}
            >
              {member.responsibility.trim() || ' '}
            </p>
          ) : null}
        </div>
        {presentation.showSocials ? (
          <div className="shrink-0">
            <TeamSocialLinks
              member={member}
              presentation={presentation}
              align="justify-end"
              revealOnHover
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
function TeamPolaroidWall({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
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
  }, [syncBounds, gridView]);

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
    scroller.scrollTo({ left: Math.max(0, Math.min(travel, target)), behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setGridView((value) => !value)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[calc(0.68rem*var(--pf-team-font-scale,1))] font-semibold uppercase tracking-[0.18em] transition-transform duration-[420ms] ${POLAROID_EASE_CLS} hover:-translate-y-0.5`}
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
          {gridView ? 'Scroll view' : 'View all'}
        </button>
      </div>

      {gridView ? (
        <div
          className={`grid w-full items-start gap-x-8 gap-y-20 overflow-visible sm:gap-x-10 sm:gap-y-24 lg:gap-x-12 ${teamPolaroidGridColumnsClass(presentation.polaroidColumns ?? 3)}`}
        >
          {members.map((member, index) => (
            <TeamPolaroidCard key={member.id} member={member} presentation={presentation} index={index} gridded />
          ))}
        </div>
      ) : (
        <div className="w-full min-w-0">
          <div
            ref={scrollerRef}
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
                <TeamPolaroidCard member={member} presentation={presentation} index={index} />
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
                    aria-label={direction === -1 ? 'Previous member' : 'Next member'}
                    className={`group/nav flex h-11 w-11 items-center justify-center rounded-full border transition-[transform,opacity] duration-[520ms] ${POLAROID_EASE_CLS} focus:outline-none focus-visible:ring-2 focus-visible:ring-current ${
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
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
  /** `Show all` navigation: the column governs the size, so the portrait uses a ratio, not vh. */
  gridded?: boolean;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  const height = presentation.railImageHeight ?? 'tall';
  const radius = teamCornerRadiusClass(presentation.railImageRadius ?? 'md');
  return (
    <article className="group relative flex h-full w-full flex-col" data-team-reveal="">
      {presentation.showImage ? (
        <div
          className={`relative w-full overflow-hidden ${radius} ${teamShadowClass(presentation.cardShadow)} ${
            gridded ? teamRailPortraitAspectClass(height) : teamRailPortraitClass(height)
          }`}
          data-team-reveal-media=""
        >
          <TeamMemberImage
            member={member}
            presentation={{ ...presentation, imageAspect: 'portrait' }}
            fill
            zoom
          />
          {/* Deep scrim + index: the numeral belongs on the image, where it reads as a plate
              number rather than a label floating above the copy. */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 block h-1/3 opacity-0 transition-opacity duration-[760ms] ${EASE_CLS} group-hover:opacity-100`}
            data-pf-no-color-transition=""
            style={{
              backgroundImage:
                'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0) 100%)',
            }}
          />
          <span
            className={`${META_CLS} pointer-events-none absolute left-6 top-6 font-semibold tabular-nums text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]`}
            data-pf-no-color-transition=""
            aria-hidden
          >
            {teamIndexLabel(index)}
          </span>
        </div>
      ) : null}
      <div
        className={`${gridded ? 'mt-6' : 'mt-8'} flex flex-1 flex-col ${
          align === 'right' ? 'items-end text-right' : align === 'center' ? 'items-center text-center' : 'items-start text-left'
        }`}
      >
        {presentation.showName ? (
          <h3
            className={`${
              gridded ? 'text-[calc(clamp(1.35rem,1.9vw,1.95rem)*var(--pf-team-font-scale,1))]' : 'text-[calc(clamp(1.75rem,2.6vw,2.6rem)*var(--pf-team-font-scale,1))]'
            } font-semibold leading-[1.02] tracking-[-0.035em] transition-transform duration-[760ms] ${EASE_CLS} group-hover:-translate-y-0.5`}
            data-pf-no-color-transition=""
            style={{ color: readable.strong }}
          >
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility ? (
          <p className={`${META_CLS} mt-4`} style={{ color: readable.muted }}>
            {member.responsibility.trim() || ' '}
          </p>
        ) : null}
        {presentation.showSocials ? (
          <div className="mt-auto w-full">
            <TeamHoverRule color={presentation.cardBorderColor} align={align} />
            <div className="pt-6">
              <TeamSocialLinks member={member} presentation={presentation} align={teamSocialAlignClass(align)} />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TeamPortraitRail({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ pointerId: number; startX: number; startLeft: number; moved: boolean } | null>(null);
  const scrubbing = useRef(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [bounds, setBounds] = useState({ atStart: true, atEnd: false });
  const readable = teamReadableCardText(presentation);
  const accent = presentation.socialIconColor;
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
    setActive(members.length > 1 ? Math.round(ratio * (members.length - 1)) : 0);
    setBounds({ atStart: scroller.scrollLeft <= 2, atEnd: travel <= 4 || scroller.scrollLeft >= travel - 2 });
  }, [members.length]);

  useEffect(() => {
    syncProgress();
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncProgress);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [syncProgress]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    // Mouse only — touch and pen keep the native, momentum-preserving scroll.
    if (!scroller || event.pointerType !== 'mouse' || event.button !== 0) return;
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
      scroller.setPointerCapture?.(event.pointerId);
    }
    if (!drag.moved) return;
    scroller.scrollLeft = drag.startLeft - delta;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    scrollerRef.current?.releasePointerCapture?.(event.pointerId);
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
    scroller.scrollTo({ left: ratio * travel, behavior: smooth ? 'smooth' : 'auto' });
  };

  const scrollToIndex = (index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller || members.length < 2) return;
    const travel = scroller.scrollWidth - scroller.clientWidth;
    scroller.scrollTo({ left: (index / (members.length - 1)) * travel, behavior: 'smooth' });
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
    scroller.scrollTo({ left: Math.max(0, Math.min(travel, target)), behavior: 'smooth' });
  };

  // `Show all` — no traversal at all: every portrait laid out in rows, sized by its column.
  if (navigation === 'show-all') {
    const columns = presentation.railColumns ?? 3;
    const columnClass =
      columns === 2
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
      <div className={`grid w-full grid-cols-1 items-stretch ${columnClass} ${gaps} ${justify}`}>
        {members.map((member, index) => (
          <TeamRailCard key={member.id} member={member} presentation={presentation} index={index} gridded />
        ))}
      </div>
    );
  }

  return (
    // `min-w-0` on both the rail and its scroller: a horizontally scrollable flex row otherwise
    // reports its full content width to an `auto`-sized grid/flex parent and stretches the whole
    // page instead of scrolling inside it.
    <div className="w-full min-w-0">
      <div
        ref={scrollerRef}
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
        className={`flex min-w-0 max-w-full snap-x snap-mandatory items-stretch gap-8 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-14 sm:cursor-grab sm:active:cursor-grabbing ${railAlign}`}
      >
        {members.map((member, index) => (
          <div
            key={member.id}
            // `snap-start`, not `snap-center`: the arrows step by aligning the next portrait to the
            // rail's leading edge, and with centre snapping the browser pulled that target back to
            // its own nearest snap point — pressing "previous" simply did nothing.
            className={`flex w-[84vw] shrink-0 snap-start self-stretch ${teamRailCardWidthClass(presentation.cardMaxWidth)}`}
          >
            <TeamRailCard member={member} presentation={presentation} index={index} />
          </div>
        ))}
      </div>
      {members.length > 1 ? (
        <div className={`mt-14 flex flex-wrap items-end gap-x-10 gap-y-6 ${footerAlign}`}>
          <p className="flex items-baseline gap-3" aria-live="polite">
            <TeamOdometer
              value={teamIndexLabel(active)}
              className="text-[calc(clamp(2.25rem,4vw,3.5rem)*var(--pf-team-font-scale,1))] font-semibold leading-none tracking-[-0.04em]"
              style={{ color: readable.strong }}
            />
            <span className={`${META_CLS}`} style={{ color: readable.muted, opacity: 0.6 }}>
              / {teamIndexLabel(members.length - 1)}
            </span>
          </p>
          <div className="flex min-w-[12rem] flex-1 items-center gap-6 sm:min-w-[18rem]">
            <div
              ref={trackRef}
              role={arrows ? undefined : 'slider'}
              tabIndex={arrows ? undefined : 0}
              aria-label={arrows ? undefined : 'Scroll through the team'}
              aria-valuemin={arrows ? undefined : 1}
              aria-valuemax={arrows ? undefined : members.length}
              aria-valuenow={arrows ? undefined : active + 1}
              aria-hidden={arrows ? true : undefined}
              onPointerDown={
                arrows
                  ? undefined
                  : (event) => {
                      scrubbing.current = true;
                      event.currentTarget.setPointerCapture?.(event.pointerId);
                      scrubTo(event.clientX, true);
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
                      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                      event.preventDefault();
                      scrollToIndex(
                        Math.min(members.length - 1, Math.max(0, active + (event.key === 'ArrowRight' ? 1 : -1)))
                      );
                    }
              }
              // With arrows the line is a read-only progress bar — the buttons are the control, and
              // two competing controls for one rail is exactly the ambiguity this setting removes.
              className={`group/track relative w-full py-4 ${
                arrows ? '' : 'cursor-pointer touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-current'
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
                className={`absolute left-0 top-1/2 block h-[2px] -translate-y-1/2 transition-[height] duration-[420ms] ${EASE_CLS} ${
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
                      aria-label={direction === -1 ? 'Previous member' : 'Next member'}
                      className={`group/nav flex h-12 w-12 items-center justify-center rounded-full border transition-[transform,opacity] duration-[520ms] ${EASE_CLS} focus:outline-none focus-visible:ring-2 focus-visible:ring-current ${
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
 * Spotlight — one monumental portrait, every member reachable from a thumbnail strip. Switching
 * is choreographed with GSAP: the portrait wipes up out of an inset clip while the name and role
 * rise behind it, so the swap reads as a page turn rather than an instant image replacement.
 */
function TeamSpotlight({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  const [activeId, setActiveId] = useState(members[0]?.id ?? '');
  const active = members.find((member) => member.id === activeId) ?? members[0];
  const portraitRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLSpanElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const firstRender = useRef(true);
  const hoverIntent = useRef<number | undefined>(undefined);
  const activeIndex = Math.max(0, members.findIndex((member) => member.id === active?.id));
  const previousIndex = useRef(activeIndex);

  /** Wraps, so a swipe (or a keyboard step) never dead-ends on the first or last member. */
  const step = useCallback(
    (direction: 1 | -1) => {
      if (members.length < 2) return;
      setActiveId((current) => {
        const index = members.findIndex((member) => member.id === current);
        const from = index < 0 ? 0 : index;
        return members[(from + direction + members.length) % members.length].id;
      });
    },
    [members]
  );

  // Mobile: the panel is one immersive card you swipe through.
  useTeamSwipe(portraitRef, step, members.length < 2);

  useEffect(() => () => window.clearTimeout(hoverIntent.current), []);

  useEffect(() => {
    const direction = activeIndex >= previousIndex.current ? 1 : -1;
    previousIndex.current = activeIndex;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const portrait = portraitRef.current;
    const copy = copyRef.current;
    if (!portrait || !copy || teamPrefersReducedMotion()) return;
    const ease = teamPremiumEase();
    const veil = veilRef.current;
    const words = copy.querySelectorAll<HTMLElement>('[data-spotlight-word]');
    const lines = copy.querySelectorAll<HTMLElement>('[data-spotlight-line]');
    let tween: gsap.core.Timeline | undefined;
    try {
      tween = gsap.timeline();
      // Directional curtain: the new portrait is uncovered from the side you moved towards, with a
      // slight counter-slide, so the swap carries the direction of the choice.
      tween.fromTo(
        portrait,
        {
          clipPath: direction === 1 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)',
          scale: 1.08,
          xPercent: direction * 3,
        },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          xPercent: 0,
          duration: 1.05,
          ease,
          clearProps: TEAM_CLEAR_PROPS,
        }
      );
      if (veil) {
        // A veil that lifts off the new portrait rather than a crossfade: the image arrives already
        // in place and simply clears, which is what makes the swap read as one move, not two.
        tween.fromTo(
          veil,
          { opacity: 0.55 },
          { opacity: 0, duration: 1.15, ease, clearProps: 'opacity' },
          0
        );
      }
      if (words.length > 0) {
        // Per-word mask: each word rides up out of its own overflow-hidden slot, so a name that
        // wraps still reveals cleanly line by line.
        tween.fromTo(
          words,
          { yPercent: 115 },
          { yPercent: 0, duration: 0.95, ease, stagger: 0.055, clearProps: 'transform' },
          0.08
        );
      }
      if (lines.length > 0) {
        tween.fromTo(
          lines,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.8, ease, stagger: 0.08, clearProps: TEAM_CLEAR_PROPS },
          0.14
        );
      }
    } catch (error) {
      console.error('[Team spotlight] GSAP swap failed', error);
      gsap.set([portrait, ...(veil ? [veil] : []), ...words, ...lines], { clearProps: TEAM_CLEAR_PROPS });
    }
    return () => {
      tween?.kill();
    };
  }, [activeId, activeIndex]);

  if (!active) return null;
  const readable = teamReadableCardText(presentation);
  const portraitRight = (presentation.spotlightPortraitSide ?? 'left') === 'right';
  const navigation = presentation.spotlightNavigation ?? 'thumbnails';
  /** The prev/next pair, shared by `arrows` and `both`. `sm` is the size it takes when it sits
   *  above the thumbnails, where it must stay secondary to them. */
  const arrowPair = (size: 'sm' | 'lg') =>
    ([-1, 1] as const).map((direction) => (
      <button
        key={direction}
        type="button"
        onClick={() => step(direction)}
        aria-label={direction === -1 ? 'Previous member' : 'Next member'}
        className={`group/nav flex items-center justify-center rounded-full border transition-transform duration-[520ms] ${EASE_CLS} hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-current ${
          size === 'lg' ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-10 w-10 sm:h-11 sm:w-11'
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
            direction === -1 ? 'rotate-180 group-hover/nav:-translate-x-1' : 'group-hover/nav:translate-x-1'
          }`}
          data-pf-no-color-transition=""
        >
          <path d="M4 12h15" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </button>
    ));
  // The panel's own frame, drawn without the settings padding: the portrait has to bleed to the
  // panel edge for the composition to read as monumental, so the copy column carries the padding.
  const panelFrame = `${teamCornerRadiusClass(presentation.spotlightPanelRadius ?? 'md')} ${teamShadowClass(presentation.cardShadow)} ${
    presentation.cardBorder === 'none' ? 'border-0' : presentation.cardBorder === 'medium' ? 'border-2' : 'border'
  } overflow-hidden`;
  const copyPad =
    presentation.cardPadding === 'lg'
      ? 'px-8 py-12 lg:px-16 lg:py-20'
      : presentation.cardPadding === 'none' || presentation.cardPadding === 'sm'
        ? 'px-6 py-8 lg:px-10 lg:py-12'
        : 'px-7 py-10 lg:px-12 lg:py-16';
  // Socials one step up: at this scale the default icons read as an afterthought.
  const socialPresentation = {
    ...presentation,
    socialIconSize:
      presentation.socialIconSize === 'sm'
        ? ('md' as const)
        : presentation.socialIconSize === 'md'
          ? ('lg' as const)
          : ('xl' as const),
  };
  return (
    <article
      /* The panel's height is LOCKED per breakpoint, never derived from the member currently
         shown: a one-line name next to a two-line one would otherwise resize the whole frame on
         every switch. Mobile keeps an aspect-ratio card (fixed for a given width), tablet and
         desktop get explicit heights. */
      className={`grid w-full gap-0 ${panelFrame} ${teamSpotlightMaxWidthClass(presentation.cardMaxWidth)} ${teamListAlignClass(presentation.listAlign)} ${
        portraitRight
          ? 'lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]'
          : 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]'
      } ${TEAM_SPOTLIGHT_PANEL_CLASS} lg:items-stretch`}
      data-team-reveal=""
      style={teamCardStyle(presentation)}
    >
      {/* Order, not source order: stacked on small screens the portrait always comes first, so the
          side setting can only apply from `lg` up, where the two columns actually exist. */}
      <div
        ref={portraitRef}
        className={`relative w-full shrink-0 overflow-hidden ${
          portraitRight ? 'lg:order-2' : 'lg:order-1'
        } ${TEAM_SPOTLIGHT_PORTRAIT_CLASS}`}
        data-team-reveal-media=""
      >
        {/* `cover` is forced, not read from the settings: this frame is fixed, so a `contain` fit
            would letterbox a landscape photo inside it instead of filling it. */}
        <TeamMemberImage
          member={active}
          presentation={{ ...presentation, imageAspect: 'portrait', imageFit: 'cover' }}
          fill
        />
        <span
          ref={veilRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] block opacity-0"
          data-pf-no-color-transition=""
          style={{ backgroundColor: '#0a0a0a' }}
        />
      </div>
      {/* `overflow-hidden` guards the locked frame: whatever a member's copy measures, it can never
          push the panel taller than the height set above. */}
      <div
        className={`flex min-h-0 min-w-0 flex-col justify-center overflow-hidden ${copyPad} ${
          portraitRight ? 'lg:order-1' : 'lg:order-2'
        }`}
      >
        <div ref={copyRef} className="text-left">
          {/* Mechanical counter + a rule running to the far edge: the width beside a short name
              becomes a deliberate measure instead of a gap. */}
          <span className="flex items-baseline gap-5" data-spotlight-line="">
            <TeamOdometer
              value={teamIndexLabel(activeIndex)}
              className="text-[calc(clamp(1.5rem,2.4vw,2.25rem)*var(--pf-team-font-scale,1))] font-semibold leading-none tracking-[-0.04em]"
              style={{ color: readable.strong }}
            />
            <span className={`${META_CLS} shrink-0`} style={{ color: readable.muted, opacity: 0.6 }}>
              / {teamIndexLabel(members.length - 1)}
            </span>
            <span
              className="h-px flex-1 translate-y-[-0.35em]"
              style={{ backgroundColor: presentation.cardBorderColor }}
              aria-hidden
            />
          </span>
          {presentation.showName ? (
            // One mask per word so a wrapping name still reveals line by line; the heading keeps an
            // aria-label and the slots are hidden, so it is read as one name, not a pile of words.
            <h3
              className={`mt-8 font-serif text-[calc(clamp(2.5rem,5.4vw,5rem)*var(--pf-team-font-scale,1))] font-semibold leading-[0.94] tracking-[-0.04em] lg:mt-10 ${TEAM_SPOTLIGHT_NAME_BOX_CLASS}`}
              style={{ color: readable.strong }}
              aria-label={active.name}
            >
              {active.name.split(/\s+/).filter(Boolean).map((word, index, all) => (
                <span
                  key={`${activeId}-${index}`}
                  aria-hidden
                  className="inline-block overflow-hidden align-bottom"
                >
                  <span data-spotlight-word="" className="inline-block">
                    {word}
                    {index < all.length - 1 ? ' ' : ''}
                  </span>
                </span>
              ))}
            </h3>
          ) : null}
          {presentation.showResponsibility ? (
            // Two lines reserved here too, for the same reason as the name box above.
            <p
              className="mt-6 h-[2.8em] overflow-hidden text-[calc(0.8rem*var(--pf-team-font-scale,1))] font-medium uppercase leading-[1.4] tracking-[0.24em] sm:text-[calc(0.9rem*var(--pf-team-font-scale,1))] lg:mt-8"
              style={{ color: readable.muted }}
              data-spotlight-line=""
            >
              {active.responsibility}
            </p>
          ) : null}
          <div className="mt-10 lg:mt-14" data-spotlight-line="">
            <TeamSocialLinks
              member={active}
              presentation={socialPresentation}
              align="justify-start"
              spacing="wide"
            />
          </div>
        </div>
        {/* `mt-auto` pins the navigation to the bottom of the column, so a tall panel reads as a
            composition that fills its height instead of a centred block floating in a void. */}
        {members.length > 1 && navigation === 'arrows' ? (
          <div className="mt-12 flex shrink-0 items-center gap-3 lg:mt-auto lg:pt-16">{arrowPair('lg')}</div>
        ) : null}
        {/* `both`: the pair sits above the strip, aligned right — a header for the thumbnails
            rather than a second control competing with them, so they read as one block. */}
        {members.length > 1 && navigation === 'both' ? (
          <div className="mt-12 flex shrink-0 justify-end gap-3 lg:mt-auto lg:pt-16">{arrowPair('sm')}</div>
        ) : null}
        {members.length > 1 && (navigation === 'thumbnails' || navigation === 'both') ? (
          <div
            // Past four members the strip scrolls; the fade tells you so, instead of leaving a
            // thumbnail looking accidentally guillotined by the panel edge.
            className={`flex shrink-0 gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
              // In `both` the arrows above already carry the top spacing and the `mt-auto`.
              navigation === 'both' ? 'mt-5' : 'mt-12 lg:mt-auto lg:pt-16'
            } ${
              members.length > 4
                ? '[mask-image:linear-gradient(to_right,black_84%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_84%,transparent_100%)]'
                : ''
            }`}
            role="tablist"
            aria-label="Choose a team member"
          >
            {members.map((member, index) => {
              const isActive = member.id === active.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(member.id)}
                  // Hover is a trigger too, not just a highlight — but only after a short intent
                  // delay, so sweeping the pointer across the strip does not fire every portrait.
                  onPointerEnter={(event) => {
                    if (event.pointerType !== 'mouse' || presentation.spotlightHoverSwitch === false) return;
                    window.clearTimeout(hoverIntent.current);
                    hoverIntent.current = window.setTimeout(() => setActiveId(member.id), 140);
                  }}
                  onPointerLeave={() => window.clearTimeout(hoverIntent.current)}
                  /* Fixed size, scrolling strip: shrinking thumbnails to fit a large team turned
                     them into specks — at this scale they have to stay legible triggers. */
                  className={`group relative aspect-[3/4] w-[4.25rem] shrink-0 overflow-hidden rounded-xl transition-[transform,opacity] duration-[520ms] ${EASE_CLS} sm:w-[5.25rem] ${
                    isActive ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-50 hover:scale-100 hover:opacity-100'
                  } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
                  data-pf-no-color-transition=""
                >
                  <TeamMemberImage
                    member={member}
                    presentation={{ ...presentation, imageAspect: 'portrait', showImage: true }}
                    fill
                  />
                  {/* Hairline frame on the selected thumbnail — a 1px inset line reads as "this one"
                      without the heaviness of a border that would shift the image inside it. */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 z-[2] block rounded-xl border transition-opacity duration-[520ms] ${EASE_CLS} ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                    data-pf-no-color-transition=""
                    style={{ borderColor: readable.strong }}
                  />
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 bottom-0 z-[3] block h-[3px] origin-left transition-transform duration-[520ms] ${EASE_CLS} ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                    data-pf-no-color-transition=""
                    style={{ backgroundColor: presentation.socialIconColor }}
                  />
                  <span className="sr-only">{`${teamIndexLabel(index)} — ${member.name}`}</span>
                </button>
              );
            })}
          </div>
        ) : null}
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
 * Directory — a monumental numbered index, not a list of dashboard pills. Names are set at display
 * size on hairline rows with real vertical rhythm. By default, on a hovering pointer the portrait
 * leaves the row entirely and becomes a plate that follows the cursor (see `TeamDirectoryList`);
 * the `left`/`right` modes instead pin a print into every row, so each face is visible at rest.
 */
function TeamDirectoryRow({
  member,
  presentation,
  detached,
  index,
  portrait,
  socialsOnHover,
  onPreview,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  detached: boolean;
  index: number;
  portrait: TeamDirectoryRowPortrait;
  /** On a hovering pointer the links wait for the row to be addressed; on touch they always show. */
  socialsOnHover: boolean;
  onPreview?: (memberId: string | null) => void;
}) {
  const readable = teamReadableCardText(presentation);
  const side = portrait === 'left' || portrait === 'right' ? portrait : null;
  const radius = presentation.directoryPortraitRadius ?? 'md';
  const pad = detached
    ? presentation.cardPadding === 'lg'
      ? 'px-8 py-9 sm:px-10 sm:py-11'
      : presentation.cardPadding === 'none' || presentation.cardPadding === 'sm'
        ? 'px-5 py-6 sm:px-7 sm:py-7'
        : 'px-6 py-7 sm:px-9 sm:py-9'
    : presentation.cardPadding === 'lg'
      ? 'py-10 sm:py-12'
      : presentation.cardPadding === 'none' || presentation.cardPadding === 'sm'
        ? 'py-6 sm:py-7'
        : 'py-8 sm:py-10';
  // With a fixed print, the index still leads the desktop row (index · print · name …); the
  // `order` classes do that so the DOM keeps reading index → name → role → links → portrait.
  const indexNode = (
    <span
      className={`${META_CLS} shrink-0 tabular-nums transition-opacity duration-[760ms] ${EASE_CLS} group-hover:opacity-100 sm:w-10 ${
        side ? 'sm:-order-2' : ''
      }`}
      data-pf-no-color-transition=""
      style={{ color: readable.muted, opacity: 0.55 }}
    >
      {teamIndexLabel(index)}
    </span>
  );
  // Name and role sit on the same axis, not stacked: an index reads across the row, and the
  // measure between them is what makes the whitespace look deliberate.
  const copyNodes = (
    <>
      {presentation.showName ? (
        <h3
          className={`min-w-0 text-left text-[calc(clamp(1.85rem,4.4vw,3.35rem)*var(--pf-team-font-scale,1))] font-semibold leading-[0.98] tracking-[-0.04em] transition-transform duration-[760ms] ${EASE_CLS} group-hover:translate-x-2 ${
            side ? 'sm:flex-1' : 'flex-1'
          }`}
          data-pf-no-color-transition=""
          style={{ color: readable.strong }}
        >
          {member.name}
        </h3>
      ) : null}
      {presentation.showResponsibility ? (
        <p
          className={`${META_CLS} min-h-[0.7rem] shrink-0 sm:max-w-[16rem] sm:text-right`}
          style={{ color: readable.muted }}
        >
          {member.responsibility.trim() || ' '}
        </p>
      ) : null}
      {/* Socials stay out of the name's way until the row is addressed, then arrive from the right;
          on a pointer that cannot hover they are simply always there. */}
      <div
        className={`shrink-0 transition-[opacity,transform] duration-[620ms] ${EASE_CLS} sm:min-w-[6rem] ${
          side ? 'mt-1 sm:mt-0' : ''
        } ${
          socialsOnHover
            ? 'sm:translate-x-3 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-x-0 sm:group-focus-within:opacity-100'
            : ''
        }`}
        data-pf-no-color-transition=""
      >
        <TeamSocialLinks member={member} presentation={presentation} align="justify-start sm:justify-end" />
      </div>
    </>
  );
  return (
    <article
      className={`group relative flex h-full ${
        side ? 'items-center gap-5 sm:gap-10' : 'flex-col gap-6 sm:flex-row sm:items-center sm:gap-10'
      } ${
        detached
          ? `${teamCardFrameClass(presentation)} ${pad} ${HOVER_CLS} hover:-translate-y-1`
          : `border-b last:border-b-0 ${pad}`
      }`}
      data-pf-no-color-transition=""
      data-team-reveal=""
      style={detached ? teamCardStyle(presentation) : { borderColor: presentation.cardBorderColor }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') onPreview?.(member.id);
      }}
      onPointerLeave={() => onPreview?.(null)}
    >
      {side ? (
        <>
          {/* Phones: print beside a stacked text column. From `sm` the column dissolves
              (`display: contents`) and its children join the row itself. */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:contents">
            {indexNode}
            {copyNodes}
          </div>
          {presentation.showImage ? (
            // The print leans into the row from the edge it is anchored to while the photo pushes
            // in behind it — transform only, so a long name never re-wraps mid-hover.
            <div
              className={`relative shrink-0 overflow-hidden ${teamDirectoryPlateSizeClass(radius)} ${teamDirectoryPlateRadiusClass(radius)} transition-transform duration-[760ms] ${EASE_CLS} group-hover:scale-[1.06] ${
                side === 'left' ? '-order-1 origin-left' : 'origin-right'
              }`}
              data-pf-no-color-transition=""
            >
              <TeamMemberImage
                member={member}
                presentation={{ ...presentation, imageAspect: 'portrait' }}
                fill
                zoom
                reveal
              />
            </div>
          ) : null}
        </>
      ) : (
        <>
          {indexNode}
          {portrait === 'inline' && presentation.showImage ? (
            <div
              className={`shrink-0 overflow-hidden transition-transform duration-[760ms] ${EASE_CLS} group-hover:scale-[1.06] ${teamDirectoryAvatarRadiusClass(radius)} ${teamAvatarSizeClass(presentation.avatarSize)}`}
              data-pf-no-color-transition=""
              data-team-reveal-media=""
            >
              <TeamMemberImage
                member={member}
                presentation={{ ...presentation, imageAspect: 'square' }}
                className="h-full min-h-0"
              />
            </div>
          ) : null}
          {copyNodes}
        </>
      )}
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-0 left-0 block h-px w-full origin-left scale-x-0 transition-transform duration-[860ms] ${EASE_CLS} group-hover:scale-x-100`}
        data-pf-no-color-transition=""
        style={{ backgroundColor: presentation.socialIconColor }}
      />
    </article>
  );
}

/**
 * Directory shell. In `cursor` mode, on a hovering pointer it owns a portrait plate that trails the
 * cursor through the whole index (GSAP `quickTo`, so it eases rather than snapping); on touch the
 * rows keep their inline avatars. In `left`/`right` mode every row carries its own fixed print on
 * every pointer type and the plate is never mounted.
 */
function TeamDirectoryList({
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
  // A fixed print means "the whole row at rest", so its links show too: kept hidden until hover,
  // their reserved slot would leave a hole between the role and a right-hand print.
  const socialsOnHover = canHover && mode === 'cursor';
  const plateRadius = presentation.directoryPortraitRadius ?? 'md';
  const previewMember = members.find((member) => member.id === previewId) ?? null;

  useEffect(() => {
    if (!cursorPortrait) return;
    const plate = plateRef.current;
    if (!plate) return;
    try {
      moveX.current = gsap.quickTo(plate, 'x', { duration: 0.65, ease: 'power3.out' });
      moveY.current = gsap.quickTo(plate, 'y', { duration: 0.65, ease: 'power3.out' });
    } catch (error) {
      console.error('[Team directory] cursor plate failed to initialize', error);
    }
    return () => {
      moveX.current = null;
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
    });
  }, [cursorPortrait, previewMember]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      onPointerMove={(event) => {
        if (!cursorPortrait || event.pointerType !== 'mouse') return;
        const wrap = wrapRef.current;
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        moveX.current?.(event.clientX - rect.left);
        moveY.current?.(event.clientY - rect.top);
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
              socialsOnHover={socialsOnHover}
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
              socialsOnHover={socialsOnHover}
              onPreview={cursorPortrait ? setPreviewId : undefined}
            />
          ))}
        </div>
      )}
      {cursorPortrait ? (
        <div
          ref={plateRef}
          aria-hidden
          className={`pointer-events-none absolute left-0 top-0 z-20 hidden overflow-hidden opacity-0 shadow-2xl shadow-black/25 lg:block ${teamDirectoryCursorPlateRadiusClass(plateRadius)}`}
          data-pf-no-color-transition=""
          // `Full` makes the plate a circle, so it goes square; the margins keep the cursor at its centre.
          style={{
            width: '17rem',
            height: plateRadius === 'full' ? '17rem' : '21.5rem',
            marginLeft: '-8.5rem',
            marginTop: plateRadius === 'full' ? '-8.5rem' : '-10.75rem',
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

/**
 * Hover veil — the portrait stays the subject: a bottom-weighted gradient veil wipes up from the
 * lower edge and the copy rises out of it, instead of a flat grey wash over the whole face.
 */
function TeamCoverCard({
  member,
  presentation,
  index,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
}) {
  const align = presentation.listAlign ?? 'center';
  const overlayAlign =
    align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';
  const riseCls = `translate-y-5 opacity-0 transition-[transform,opacity] duration-[640ms] ${EASE_CLS} group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${TOUCH_REVEAL_CLS}`;
  return (
    <article
      className={`group relative h-full w-full ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardFrameClass(presentation)} ${teamHoverPhotoClass(presentation.avatarSize)}`}
      data-team-reveal=""
      style={teamCardStyle(presentation)}
    >
      {presentation.showImage ? (
        <TeamMemberImage
          member={member}
          presentation={{ ...presentation, imageAspect: 'portrait' }}
          fill
          zoom
          reveal
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[2.75rem] font-semibold tracking-[-0.04em] text-neutral-300" aria-hidden>
          {member.name.trim().charAt(0).toUpperCase() || '—'}
        </div>
      )}
      {/* The veil, in three layers that each do one job.
          1. A soft frost across the whole card — 6px, not more: enough to read as a treated
             surface, light enough that the portrait keeps its texture behind the type. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-[5] block rounded-[inherit] backdrop-blur-[6px] opacity-0 transition-opacity duration-[720ms] ${EASE_CLS} group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100`}
        data-pf-no-color-transition=""
        style={{ backgroundColor: 'rgba(0,0,0,0.3)', transform: 'translateZ(0)', willChange: 'opacity' }}
      />
      {/* 2. A bottom-weighted scrim under the copy. The flat 30% above is a look, not a contrast
             guarantee: over a near-white photo it only reaches ~1.4:1 for white text. Composited
             with this, the copy block sits past 0.9 alpha — comfortably AA at any photo. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-[6] block rounded-[inherit] opacity-0 transition-opacity duration-[720ms] ${EASE_CLS} group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100`}
        data-pf-no-color-transition=""
        style={{
          backgroundImage:
            'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.52) 34%, rgba(0,0,0,0.16) 62%, rgba(0,0,0,0) 82%)',
        }}
      />
      {/* 3. A corner vignette for the index alone. Same reasoning: 0.78 there composites with the
             flat veil to ~0.85 total, which is where white 11px type clears 4.5:1 over white. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-[6] block rounded-[inherit] opacity-0 transition-opacity duration-[720ms] ${EASE_CLS} group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100`}
        data-pf-no-color-transition=""
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.34) 28%, rgba(0,0,0,0) 55%)',
        }}
      />
      {/* The index is the card's plate number: top-left, inside the veil, never over a bare photo. */}
      <span
        className={`${META_CLS} pointer-events-none absolute left-5 top-5 z-20 font-semibold tabular-nums text-white ${riseCls}`}
        data-pf-no-color-transition=""
        style={{ transitionDelay: '40ms' }}
        aria-hidden
      >
        {teamIndexLabel(index)}
      </span>
      <div
        className={`absolute inset-0 z-10 flex flex-col justify-end px-6 pb-7 pt-6 ${overlayAlign} pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto`}
      >
        {presentation.showName ? (
          <h3
            className={`mt-3 text-[calc(1.45rem*var(--pf-team-font-scale,1))] font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-[calc(1.7rem*var(--pf-team-font-scale,1))] ${riseCls}`}
            data-pf-no-color-transition=""
            style={{ transitionDelay: '90ms' }}
          >
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility ? (
          <p
            className={`${META_CLS} mt-3 min-h-[0.7rem] text-white/75 ${riseCls}`}
            data-pf-no-color-transition=""
            style={{ transitionDelay: '150ms' }}
          >
            {member.responsibility.trim() || ' '}
          </p>
        ) : null}
        {presentation.showSocials ? (
          // Bare white glyphs, no pill: on a veiled portrait a solid white disc is the loudest
          // thing on the card. The idle 80% keeps them present without competing with the name,
          // and the row rises as one block (the per-icon stagger owns opacity, which this needs).
          <div
            className={`${presentation.showName || presentation.showResponsibility ? 'mt-6' : ''} ${riseCls} [&_a:hover]:opacity-100 [&_a]:opacity-80 [&_a]:transition-opacity [&_a]:duration-[320ms]`}
            data-pf-no-color-transition=""
            style={{ transitionDelay: '210ms' }}
          >
            <TeamSocialLinks
              member={member}
              presentation={{
                ...presentation,
                socialIconColor: '#ffffff',
                socialBackgroundColor: 'transparent',
                socialIconStyle: 'minimal',
              }}
              align={teamSocialAlignClass(align)}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

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

  if (presentation.layout === 'profile-cards') {
    return (
      <div ref={rootRef} className="w-full min-w-0">
        <TeamProfileCardsGallery members={members} presentation={presentation} />
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`w-full overflow-visible ${teamGridClass(presentation.columns, presentation.gap, presentation.listAlign)}`}
    >
      {members.map((member, index) =>
        presentation.layout === 'cover-cards' ? (
          <TeamCoverCard key={member.id} member={member} presentation={presentation} index={index} />
        ) : (
          <TeamStandardCard key={member.id} member={member} presentation={presentation} />
        )
      )}
    </div>
  );
}
