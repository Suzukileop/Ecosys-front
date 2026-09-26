'use client';

/**
 * Floating cards — the Team design where the portrait floats over the card's top edge.
 *
 * The rework turns the flat "black card that turns red" into a piece of interactive depth:
 *
 *  1. **3D tilt + parallax.** The card body and the portrait live on one `preserve-3d` stage that
 *     the pointer rotates. The portrait is pushed forward on its own Z plane (and drifts a few
 *     pixels against the pointer), so the rotation alone separates it from the card — real
 *     parallax, not a second animation to keep in sync. On hover the stage also lifts and a
 *     blurred slab of the accent colour blooms behind it as a wide, diffuse, tinted shadow.
 *  2. **The accent arrives as a wave.** Instead of swapping `background-color`, a gradient layer
 *     is clipped to `circle(0%)` at the exact point the pointer entered and expands past the
 *     card's far corner. Leaving collapses it back toward the exit point — at full radius the
 *     origin swap is invisible, so the wipe always reads as coming from the cursor. Copy and
 *     icons re-ink to a tone picked from the accent's luminance, so contrast holds either way.
 *  3. **Two navigations, one design.** `Opening view` picks the one the section loads with and
 *     the visitor switches freely: a grid that breaks its own baseline with a staggered rhythm,
 *     or a rail that scrolls natively (trackpad and touch keep their momentum), drags with the
 *     mouse and steps one card at a time from two minimal chevrons.
 *  4. **One curve.** Every transition here runs on `cubic-bezier(0.25, 1, 0.5, 1)`.
 *
 * Site-wide trap respected throughout: any node that animates transform/opacity/clip-path through
 * CSS carries `data-pf-no-color-transition`, otherwise the global color-mode transition rule in
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
import {
  META_CLS,
  TeamMemberImage,
  TeamSocialLinks,
} from '@/components/portfolio/portfolio-team-design-primitives';
import { servicesColorLuminance } from '@/components/portfolio/portfolio-services-settings';
import {
  PORTFOLIO_TEAM_PROFILE_VIEW_OPTIONS,
  teamFloatDefaultColumnGap,
  teamCardFrameClass,
  teamCardStyle,
  teamContentAlignClass,
  teamFlexAlignClass,
  teamReadableCardText,
  teamSocialAlignClass,
  type PortfolioTeamAvatarSize,
  type PortfolioTeamCardMaxWidth,
  type PortfolioTeamCardPadding,
  type PortfolioTeamFloatAlign,
  type PortfolioTeamGap,
  type PortfolioTeamPresentationSettings,
  type PortfolioTeamProfileView,
  type PortfolioTeamRailColumns,
} from '@/components/portfolio/portfolio-team-settings';
import type { ProfileTeamMember } from '@/types/ecosystem';

/** The one curve for this design — nothing here eases on anything else. */
const FLOAT_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)';
const FLOAT_EASE_CLS = 'ease-[cubic-bezier(0.25,1,0.5,1)]';

/** Rotation at the very corner of a card. Past ~8deg the portrait's border starts to read as bent. */
const TILT_MAX_DEG = 7;
/** How far the portrait drifts against the pointer, in px — the parallax you actually notice. */
const AVATAR_DRIFT_PX = 12;
/** Depth of the portrait's own Z plane. The card body stays at Z 0, the glow sits behind it. */
const AVATAR_DEPTH_PX = 72;
/** Following lag while the pointer is down on the card, then the long settle when it leaves. */
const TILT_TRACK_MS = 260;
const TILT_RELEASE_MS = 900;
/** No pointer tracking in play (the hover lift on its own, or tilt turned off). */
const TILT_IDLE_MS = 620;

/* ---------------------------------------------------------------------- */
/* Environment                                                             */
/* ---------------------------------------------------------------------- */

/**
 * `(hover: hover) and (pointer: fine)` — the honest test for "tilting this card is reachable".
 * A narrow desktop window is still a hovering pointer; per the carousel mobile pass, resizing a
 * desktop viewport does not flip this query, it takes real device emulation to verify.
 */
function useFineHoverPointer(): boolean {
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

/** Read through a subscription rather than at render time — the server has no `matchMedia`. */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );
}

/* ---------------------------------------------------------------------- */
/* Scale — the single place this design is sized from                      */
/* ---------------------------------------------------------------------- */

/**
 * One entry per setting step: the portrait's diameter, the card's track width, its padding, the
 * grid's gutters, the name's clamp and the cascade's drop. The section's existing settings
 * (`Avatar size`, `Card width`, `Card padding`, `Gap`) index into this table instead of the
 * family-wide helpers, which are sized for the small card layouts and left this one stranded in
 * the middle of the page. Re-scaling the design is one edit in one object.
 *
 * Lengths that only ever reach CSS are Tailwind classes; the ones that have to be *computed* with
 * are plain `rem` numbers, because the grid's max width is `columns × cardWidth + gutters` and the
 * card's top padding is half the portrait — no class can express either.
 */
const FLOAT_CARDS_SCALE = {
  /**
   * Portrait diameter in `rem`, per `Avatar size` — roughly double the family-wide steps. Used as
   * the first half of `min(cap, share-of-the-card)`: a fixed diameter wider than the card it hangs
   * off overflows it, so the cap simply stops growing when the card runs out of width.
   */
  avatar: { sm: 9, md: 13, lg: 16, xl: 19 } satisfies Record<PortfolioTeamAvatarSize, number>,
  /** The share of the card's own width the portrait may never exceed. */
  avatarShare: '70%',
  /** Card track width in `rem`, per `Card width`. The grid's max width is built from it. */
  cardWidth: { xs: 18, sm: 22, md: 25, lg: 28, xl: 32, full: 36 } satisfies Record<
    PortfolioTeamCardMaxWidth,
    number
  >,
  /**
   * Inner padding in `rem`, per `Card padding`, as `[sides, bottom, gap under the portrait]`. The
   * top is not in here: it is `half the portrait + that gap`, computed, because the portrait's own
   * size is the thing that decides how much room the copy needs to clear it.
   */
  padding: {
    none: [1.25, 1.5, 1.25],
    sm: [1.5, 1.75, 1.5],
    md: [2, 2, 1.75],
    lg: [2.5, 2.5, 2],
  } satisfies Record<PortfolioTeamCardPadding, readonly [number, number, number]>,
  /**
   * Grid gutters in `rem` as `[column, row]`, per `Gap`. Far tighter than the shared grid's — and
   * the row step is the smaller of the two on purpose: every card already carries half a portrait
   * of padding above its body, which is the real distance between one row and the next.
   */
  gap: {
    sm: [0.75, 1],
    md: [1.125, 1.25],
    lg: [1.5, 1.75],
    xl: [2.25, 2.5],
  } satisfies Record<PortfolioTeamGap, readonly [number, number]>,
  /** The name, indexed by `Avatar size` so the typography grows with the face. */
  name: {
    sm: 'text-[calc(clamp(1.2rem,0.8vw+0.95rem,1.45rem)*var(--pf-team-font-scale,1))]',
    md: 'text-[calc(clamp(1.4rem,1.1vw+1rem,1.75rem)*var(--pf-team-font-scale,1))]',
    lg: 'text-[calc(clamp(1.55rem,1.4vw+1.05rem,2rem)*var(--pf-team-font-scale,1))]',
    xl: 'text-[calc(clamp(1.7rem,1.7vw+1.1rem,2.3rem)*var(--pf-team-font-scale,1))]',
  } satisfies Record<PortfolioTeamAvatarSize, string>,
  /**
   * The cascade's drop, per `Gap` and per breakpoint — the column count changes at each one, and a
   * drop that belonged to the middle of two columns is nonsense in the middle of four.
   */
  stagger: {
    sm: { sm: 'sm:mt-6', lg: 'lg:mt-8', xl: 'xl:mt-10' },
    md: { sm: 'sm:mt-8', lg: 'lg:mt-10', xl: 'xl:mt-12' },
    lg: { sm: 'sm:mt-10', lg: 'lg:mt-14', xl: 'xl:mt-16' },
    xl: { sm: 'sm:mt-14', lg: 'lg:mt-20', xl: 'xl:mt-24' },
  } satisfies Record<PortfolioTeamGap, Record<'sm' | 'lg' | 'xl', string>>,
} as const;

/** Small caps for the role — a step larger and more widely tracked than the family's `META_CLS`. */
const FLOAT_ROLE_CLS = 'text-[calc(0.7rem*var(--pf-team-font-scale,1))] font-semibold uppercase leading-none tracking-[0.3em]';

const avatarStep = (settings: PortfolioTeamPresentationSettings): PortfolioTeamAvatarSize =>
  settings.avatarSize ?? 'md';
const gapOf = (settings: PortfolioTeamPresentationSettings): readonly [number, number] =>
  FLOAT_CARDS_SCALE.gap[settings.gap ?? 'lg'];
const cardWidthOf = (settings: PortfolioTeamPresentationSettings): number =>
  FLOAT_CARDS_SCALE.cardWidth[settings.cardMaxWidth ?? 'sm'];
/** `min(cap, share)` — the one expression the portrait's width and the card's top padding share. */
const avatarSizeExpr = (settings: PortfolioTeamPresentationSettings): string =>
  `min(${FLOAT_CARDS_SCALE.avatar[avatarStep(settings)]}rem, ${FLOAT_CARDS_SCALE.avatarShare})`;

/* ---------------------------------------------------------------------- */
/* Layout metrics                                                          */
/* ---------------------------------------------------------------------- */

/**
 * Where the block of cards sits. `full` is the odd one out on purpose: it drops the block's own
 * cap so the cards spread across the whole content width, which is the one case where "grouped in
 * the middle" is not what the owner wants.
 */
function floatBlockAlignClass(align: PortfolioTeamFloatAlign): string {
  if (align === 'left') return 'mr-auto';
  if (align === 'right') return 'ml-auto';
  if (align === 'full') return '';
  return 'mx-auto';
}

/**
 * The rail's edge margins. Centring a scrollable flex row through `justify-center` clips its first
 * card outside the scrollable area, where no amount of scrolling reaches it; auto margins on the
 * edge children do the same job and collapse to 0 the moment the rail overflows.
 */
function floatRailAlignClass(align: PortfolioTeamFloatAlign): string {
  if (align === 'center') return '[&>*:first-child]:ml-auto [&>*:last-child]:mr-auto';
  if (align === 'right') return '[&>*:first-child]:ml-auto';
  return '';
}

function floatToolbarAlignClass(align: PortfolioTeamFloatAlign): string {
  if (align === 'center') return 'justify-center';
  if (align === 'right') return 'justify-end';
  return 'justify-start';
}

/**
 * Grid columns. The steps are deliberate: one card per row on a phone, two from `sm`, and never
 * more than the chosen count — nor more than four — on a large screen.
 */
function floatGridColumnsClass(columns: PortfolioTeamRailColumns): string {
  if (columns === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (columns === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
}

/**
 * The cascade, resolved per breakpoint because the column count itself changes there: one column
 * below `sm` (no cascade), two at `sm`, three at `lg`, four at `xl`. Every step also cancels the
 * previous one's drop, so a card never keeps an offset that belonged to a column it no longer
 * sits in — that is what holds the rhythm together while the window is resized.
 *
 * The shape is an arch, not a staircase: the middle column (or, at four columns, the middle pair)
 * rides low and the outer columns stay on the baseline, which reads as deliberate rather than as
 * a grid that has slipped. Margin, never `translate-y`: the shared entrance tweens an inline
 * transform on these very nodes, and an inline transform beats the class outright.
 */
function floatCascadeClass(index: number, columns: PortfolioTeamRailColumns, gap: PortfolioTeamGap): string {
  const drop = FLOAT_CARDS_SCALE.stagger[gap];
  const steps = [index % 2 === 1 ? drop.sm : 'sm:mt-0'];
  if (columns >= 3) steps.push(index % 3 === 1 ? drop.lg : 'lg:mt-0');
  if (columns === 4) {
    const column = index % 4;
    steps.push(column === 1 || column === 2 ? drop.xl : 'xl:mt-0');
  }
  return steps.join(' ');
}

/* ---------------------------------------------------------------------- */
/* Colour                                                                  */
/* ---------------------------------------------------------------------- */

type FloatAccent = {
  /** Where the wave starts from — the raw accent. */
  from: string;
  /** Where it lands — the same accent, pushed a step deeper, so the fill has a direction. */
  to: string;
  /** Copy colour over the accent, picked from its luminance (WCAG-safe either way). */
  ink: string;
  /** Icon chip fill over the accent — a tint of the ink, never a second hardcoded colour. */
  iconBg: string;
  /** The tinted bloom behind the card. */
  glow: string;
};

function floatAccent(presentation: PortfolioTeamPresentationSettings): FloatAccent {
  const base = presentation.teamPalette?.principal?.trim() || presentation.socialIconColor;
  const light = servicesColorLuminance(base) > 0.55;
  return {
    from: base,
    // A light accent deepens toward black, a dark one lifts toward white: either way the gradient
    // reads as one colour with a light source, never as two colours fighting.
    to: light ? `color-mix(in srgb, ${base} 82%, #000000)` : `color-mix(in srgb, ${base} 86%, #ffffff)`,
    ink: light ? '#111827' : '#ffffff',
    iconBg: light
      ? 'color-mix(in srgb, #111827 12%, transparent)'
      : 'color-mix(in srgb, #ffffff 22%, transparent)',
    glow: `color-mix(in srgb, ${base} 55%, transparent)`,
  };
}

/* ---------------------------------------------------------------------- */
/* The card                                                                */
/* ---------------------------------------------------------------------- */

/**
 * One member. All the interaction state is written straight to the DOM as custom properties on
 * two refs — the pointer never goes through React state, so moving across a grid of twelve cards
 * costs one rAF-batched style write per card and no re-render at all.
 */
function TeamFloatCard({
  member,
  presentation,
  tilt,
  cascade = '',
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  /** Off on coarse pointers, when the owner disabled it, and under `prefers-reduced-motion`. */
  tilt: boolean;
  /** Grid view only: this card's drop in the cascade, as breakpoint-scoped margin classes. */
  cascade?: string;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const waveRef = useRef<HTMLSpanElement | null>(null);
  const frame = useRef(0);
  const pending = useRef<{ rx: number; ry: number; ax: number; ay: number } | null>(null);

  const readable = teamReadableCardText(presentation);
  const accent = floatAccent(presentation);
  const align = presentation.listAlign ?? 'center';
  const avatar = avatarSizeExpr(presentation);
  const [padX, padBottom, padCopy] = FLOAT_CARDS_SCALE.padding[presentation.cardPadding ?? 'md'];
  // Drawn at rest, and only when the member actually has somewhere to link to: an empty links row
  // still takes its height, which under a portrait this size is a visible band of nothing.
  const hasSocials =
    presentation.showSocials && (member.socialLinks ?? []).some((link) => link.url.trim());

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    []
  );

  /** One style write per frame, whatever the pointer's sampling rate. */
  const flush = useCallback(() => {
    frame.current = 0;
    const stage = stageRef.current;
    const next = pending.current;
    if (!stage || !next) return;
    stage.style.setProperty('--pf-float-rx', `${next.rx}deg`);
    stage.style.setProperty('--pf-float-ry', `${next.ry}deg`);
    stage.style.setProperty('--pf-float-ax', `${next.ax}px`);
    stage.style.setProperty('--pf-float-ay', `${next.ay}px`);
  }, []);

  const track = (event: ReactPointerEvent<HTMLElement>) => {
    if (!tilt) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    // Normalised to [-0.5, 0.5] from the card's centre.
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    pending.current = {
      // rotateX follows the vertical axis inverted: pushing the pointer up tips the top away.
      rx: -y * TILT_MAX_DEG * 2,
      ry: x * TILT_MAX_DEG * 2,
      ax: -x * AVATAR_DRIFT_PX * 2,
      ay: -y * AVATAR_DRIFT_PX,
    };
    if (!frame.current) frame.current = requestAnimationFrame(flush);
  };

  /** The wave's origin, in % of the card — where the pointer crossed the edge. */
  const setWaveOrigin = (event: ReactPointerEvent<HTMLElement>) => {
    const wave = waveRef.current;
    if (!wave) return;
    const rect = wave.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    wave.style.setProperty('--pf-float-ox', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    wave.style.setProperty('--pf-float-oy', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  const onEnter = (event: ReactPointerEvent<HTMLElement>) => {
    setWaveOrigin(event);
    const stage = stageRef.current;
    if (!stage || !tilt) return;
    stage.style.setProperty('--pf-float-ms', `${TILT_TRACK_MS}ms`);
    stage.style.willChange = 'transform';
    track(event);
  };

  const onLeave = (event: ReactPointerEvent<HTMLElement>) => {
    // Re-anchoring on the way out is free: at full radius the circle covers the card from any
    // inner point, so the origin swap is invisible and the wave retreats toward the exit.
    setWaveOrigin(event);
    const stage = stageRef.current;
    if (!stage) return;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    pending.current = null;
    stage.style.setProperty('--pf-float-ms', `${TILT_RELEASE_MS}ms`);
    stage.style.removeProperty('--pf-float-rx');
    stage.style.removeProperty('--pf-float-ry');
    stage.style.removeProperty('--pf-float-ax');
    stage.style.removeProperty('--pf-float-ay');
    stage.style.willChange = '';
  };

  return (
    <article
      // No `h-full` here: `height: 100%` on a grid item resolves against the whole row, so the
      // card the stagger pushed down would stretch every one of its neighbours and open a dead
      // band under their copy. In the rail its wrapper is a flex box, which stretches it anyway.
      className={`group relative flex w-full flex-col overflow-visible [perspective:1200px] ${cascade}`}
      data-team-reveal=""
      style={
        {
          // One expression drives the portrait's width, the room the card leaves above itself for
          // the overhang, and the body's top padding. Both percentages resolve against the same
          // width — the card's — so they can never disagree with each other.
          '--pf-float-avatar': avatar,
          paddingTop: presentation.showImage ? 'calc(var(--pf-float-avatar) / 2)' : undefined,
        } as CSSProperties
      }
      onPointerEnter={onEnter}
      onPointerMove={track}
      onPointerLeave={onLeave}
    >
      {/* The tilt stage. `preserve-3d` is what turns one rotation into parallax for everything
          standing on its own Z plane — no second animation to keep in sync with the first. */}
      <div
        ref={stageRef}
        // The lift is a custom property set by `group-hover`, so it rides the same transform
        // and the same transition as the tilt instead of needing a second animation.
        className="relative flex h-full w-full flex-col [transform-style:preserve-3d] group-hover:[--pf-float-lift:-10px]"
        data-pf-no-color-transition=""
        style={
          {
            transform:
              'rotateX(var(--pf-float-rx, 0deg)) rotateY(var(--pf-float-ry, 0deg)) translate3d(0, var(--pf-float-lift, 0px), 0)',
            transition: `transform var(--pf-float-ms, ${TILT_IDLE_MS}ms) ${FLOAT_EASE}`,
          } as CSSProperties
        }
      >
        {presentation.showImage ? (
          <div
            // `top-0` is the stage's top edge, which is the card's own top edge: the article's
            // padding above it is exactly the overhang this avatar needs.
            className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]"
            data-pf-no-color-transition=""
            style={{ width: 'var(--pf-float-avatar)' }}
          >
            <div
              className="[transform-style:preserve-3d]"
              data-pf-no-color-transition=""
              style={{
                // Drift first, depth last: the portrait is pushed forward onto its own plane, and
                // the stage's rotation does the rest of the parallax for free.
                transform: `translate3d(var(--pf-float-ax, 0px), var(--pf-float-ay, 0px), ${AVATAR_DEPTH_PX}px)`,
                transition: `transform var(--pf-float-ms, ${TILT_IDLE_MS}ms) ${FLOAT_EASE}`,
              }}
            >
              {/* The entrance's media node is deliberately its own element: GSAP writes an inline
                  transform here and clears it by name when the tween ends, which would take the
                  parallax transform with it if the two shared an element. */}
              <div
                className="aspect-square w-full overflow-hidden rounded-full border-[6px]"
                data-pf-no-color-transition=""
                data-team-reveal-media=""
                style={{
                  borderColor: presentation.cardBackgroundColor,
                  boxShadow: `0 0 0 1px ${presentation.cardBorderColor}, 0 24px 44px -26px rgba(0,0,0,0.55)`,
                }}
              >
                <TeamMemberImage member={member} presentation={{ ...presentation, imageAspect: 'square' }} fill />
              </div>
            </div>
          </div>
        ) : null}

        {/* The tinted bloom: a blurred slab of the accent set behind the card, which is what a
            wide diffuse coloured shadow actually is. Kept off the card's own `box-shadow` so the
            owner's `Shadow` setting still applies at rest and the two never fight. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-3 bottom-1 top-6 block rounded-[2rem] opacity-0 blur-2xl ${FLOAT_EASE_CLS} transition-opacity duration-[760ms] group-hover:opacity-70`}
          data-pf-no-color-transition=""
          style={{ backgroundColor: accent.glow, transform: 'translateZ(-40px)' }}
        />

        <div
          className={`relative flex h-full w-full flex-col overflow-hidden ${teamCardFrameClass(presentation)} ${teamFlexAlignClass(
            align
          )} ${teamContentAlignClass(align)} group-hover:border-transparent`}
          data-pf-no-color-transition=""
          style={
            {
              ...teamCardStyle(presentation),
              paddingLeft: `${padX}rem`,
              paddingRight: `${padX}rem`,
              paddingBottom: `${padBottom}rem`,
              // Half the portrait hangs over this edge, so the copy has to clear that before the
              // gap under it even begins.
              paddingTop: presentation.showImage
                ? `calc(var(--pf-float-avatar) / 2 + ${padCopy}rem)`
                : `${padCopy}rem`,
              '--team-float-hover': accent.from,
              '--team-float-hover-ink': accent.ink,
              '--team-float-hover-icon-bg': accent.iconBg,
              transition: `border-color 560ms ${FLOAT_EASE}`,
            } as CSSProperties
          }
        >
          {/* The wave. A directional gradient clipped to a circle that grows from wherever the
              pointer crossed the edge — 150% of the box diagonal always clears the far corner. */}
          <span
            ref={waveRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 block [clip-path:circle(0%_at_var(--pf-float-ox,50%)_var(--pf-float-oy,100%))] group-hover:[clip-path:circle(150%_at_var(--pf-float-ox,50%)_var(--pf-float-oy,100%))] group-focus-within:[clip-path:circle(150%_at_var(--pf-float-ox,50%)_var(--pf-float-oy,100%))]"
            data-pf-no-color-transition=""
            style={{
              backgroundImage: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
              transition: `clip-path 860ms ${FLOAT_EASE}`,
            }}
          />
          <div className={`relative z-[1] flex w-full flex-1 flex-col ${teamFlexAlignClass(align)}`}>
            {presentation.showName ? (
              <h3
                // Two lines' worth of room whether the name needs them or not, with the text
                // centred in it: without the floor a one-line name and a two-line one give their
                // cards different heights, and a row whose bottoms disagree reads as a bug rather
                // than as rhythm. The inner span carries the text so `text-align` still applies —
                // a bare text node in a flex box becomes an anonymous item and stops obeying it.
                //
                // The re-ink trails the wave by a beat, so the copy never turns light while the
                // fill is still on its way across it, and never lags once it has arrived.
                className={`${FLOAT_CARDS_SCALE.name[avatarStep(presentation)]} flex min-h-[2.16em] w-full items-center font-semibold leading-[1.08] tracking-[-0.03em] ${
                  align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
                } group-hover:![color:var(--team-float-hover-ink)] group-focus-within:![color:var(--team-float-hover-ink)]`}
                data-pf-no-color-transition=""
                style={{ color: readable.strong, transition: `color 440ms ${FLOAT_EASE} 80ms` }}
              >
                <span className="block w-full">{member.name}</span>
              </h3>
            ) : null}
            {presentation.showResponsibility ? (
              <p
                className={`${FLOAT_ROLE_CLS} min-h-[0.7rem] group-hover:![color:color-mix(in_srgb,var(--team-float-hover-ink)_82%,transparent)] group-focus-within:![color:color-mix(in_srgb,var(--team-float-hover-ink)_82%,transparent)] ${
                  presentation.showName ? 'mt-3.5' : ''
                }`}
                data-pf-no-color-transition=""
                style={{ color: readable.muted, transition: `color 440ms ${FLOAT_EASE} 110ms` }}
              >
                {member.responsibility.trim() || ' '}
              </p>
            ) : null}
            {hasSocials ? (
              <div className={`mt-auto w-full ${presentation.showName || presentation.showResponsibility ? 'pt-6' : ''}`}>
                <TeamSocialLinks
                  member={member}
                  presentation={presentation}
                  align={teamSocialAlignClass(align)}
                  hoverLight
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------- */
/* Chevrons                                                                */
/* ---------------------------------------------------------------------- */

/** Minimal directional chevron — a hairline ring, no fill, the glyph doing all the talking. */
function TeamFloatChevron({
  direction,
  disabled,
  onClick,
  borderColor,
  color,
}: {
  direction: -1 | 1;
  disabled: boolean;
  onClick: () => void;
  borderColor: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === -1 ? 'Previous member' : 'Next member'}
      className={`group/nav flex h-12 w-12 shrink-0 items-center justify-center rounded-full border focus:outline-none focus-visible:ring-2 focus-visible:ring-current ${
        disabled ? 'cursor-default opacity-25' : 'hover:-translate-y-0.5'
      }`}
      data-pf-no-color-transition=""
      style={{
        borderColor,
        color,
        transition: `transform 520ms ${FLOAT_EASE}, opacity 520ms ${FLOAT_EASE}`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 ${
          disabled ? '' : direction === -1 ? 'group-hover/nav:-translate-x-0.5' : 'group-hover/nav:translate-x-0.5'
        }`}
        data-pf-no-color-transition=""
        style={{ transition: `transform 520ms ${FLOAT_EASE}` }}
        aria-hidden
      >
        <path d={direction === -1 ? 'M14.5 5 7.5 12l7 7' : 'M9.5 5l7 7-7 7'} />
      </svg>
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Gallery                                                                 */
/* ---------------------------------------------------------------------- */

/**
 * The design's two navigations. `Opening view` picks the one the section loads with; the visitor
 * can switch at any time from the toolbar, so neither mode ever hides members from anyone.
 */
export function TeamFloatCardsGallery({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ pointerId: number; startX: number; startLeft: number; moved: boolean } | null>(null);
  const opensOn = presentation.floatCardsView ?? 'grid';
  const [view, setView] = useState<PortfolioTeamProfileView>(opensOn);
  const [lastOpensOn, setLastOpensOn] = useState<PortfolioTeamProfileView>(opensOn);
  const [progress, setProgress] = useState(0);
  const [bounds, setBounds] = useState({ atStart: true, atEnd: false });
  const hoverPointer = useFineHoverPointer();
  const reducedMotion = usePrefersReducedMotion();
  const readable = teamReadableCardText(presentation);
  const accent = presentation.socialIconColor;
  const tilt = (presentation.floatCardsTilt ?? true) && hoverPointer && !reducedMotion;

  // Adjusting state during render — React's own recipe for "a prop changed, reset what was
  // derived from it". `Opening view` decides which navigation the section loads with, so editing
  // it overrides whatever the visitor last toggled; in an effect this would lint (and run) as a
  // cascading render.
  if (lastOpensOn !== opensOn) {
    setLastOpensOn(opensOn);
    setView(opensOn);
  }

  const syncBounds = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const travel = scroller.scrollWidth - scroller.clientWidth;
    setProgress(travel > 4 ? Math.min(1, Math.max(0, scroller.scrollLeft / travel)) : 0);
    setBounds({ atStart: scroller.scrollLeft <= 2, atEnd: travel <= 4 || scroller.scrollLeft >= travel - 2 });
  }, []);

  useEffect(() => {
    syncBounds();
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncBounds);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [syncBounds, view]);

  /** Step by the next card's own edge — the slots are a different width at every breakpoint. */
  const step = (direction: -1 | 1) => {
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
    // One frame longer, so the click that ends a drag never opens a social link.
    if (drag.moved) window.setTimeout(() => { dragState.current = null; }, 0);
    else dragState.current = null;
  };

  // `Card alignment` places the composition; `listAlign` stays what it always was — how the copy
  // sits inside each card. The two are deliberately separate: wanting the block on the left is not
  // the same as wanting every name ragged-left.
  const blockAlign = presentation.floatCardsAlign ?? 'center';
  const railAlign = floatRailAlignClass(blockAlign);
  const toolbarAlign = floatToolbarAlignClass(blockAlign);
  const stagger = presentation.floatCardsStagger !== false;
  const columns = presentation.floatCardsColumns ?? 3;
  const [, gapY] = gapOf(presentation);
  const columnGap = presentation.floatCardsColumnGap ?? teamFloatDefaultColumnGap(presentation.gap);
  const cardWidth = cardWidthOf(presentation);
  // The block the cards actually occupy. Capping the grid — rather than centring each card inside
  // an over-wide track — is what closes the void the design used to float in; the alignment class
  // then places that block. `full` opts out of the cap entirely.
  const gridMaxWidth =
    blockAlign === 'full'
      ? undefined
      : `calc(${columns * cardWidth}rem + ${Math.max(0, columns - 1) * columnGap}px)`;
  const gridAlign = floatBlockAlignClass(blockAlign);

  return (
    // `min-w-0`: a horizontally scrollable flex row otherwise reports its full content width to an
    // auto-sized parent and stretches the whole page instead of scrolling inside it.
    <div className="w-full min-w-0">
      {view === 'rail' ? (
        <div
          ref={scrollerRef}
          onScroll={syncBounds}
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
          // `pb-10`: the hover lift and the tinted bloom both bleed below the card, and a
          // horizontal scroller clips its cross axis.
          className={`flex min-w-0 max-w-full snap-x snap-mandatory items-stretch overflow-x-auto pb-10 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:cursor-grab sm:active:cursor-grabbing ${railAlign}`}
          // A rail with no gutter at all reads as one strip of cards, so it keeps a floor the grid
          // does not need.
          style={{ gap: `${Math.max(columnGap, 16)}px` }}
        >
          {members.map((member) => (
            <div
              key={member.id}
              // `snap-start`, not `snap-center`: the chevrons align the next card to the rail's
              // leading edge, and centre snapping pulls that target back to its own snap point.
              className="flex shrink-0 snap-start self-stretch"
              // One expression instead of a breakpoint ladder: the card takes its configured width
              // and never more than a narrow viewport allows.
              style={{ width: `min(84vw, ${cardWidth}rem)` }}
            >
              <TeamFloatCard member={member} presentation={presentation} tilt={tilt} />
            </div>
          ))}
        </div>
      ) : (
        <div
          // `items-start`, not `items-stretch`: stretching makes every card in a row as tall as
          // the one the cascade pushed down, which opens a dead band under the copy of all its
          // neighbours. Each card keeps its own height instead, which is the point of the rhythm.
          className={`grid w-full items-start justify-items-stretch overflow-visible ${gridAlign} ${floatGridColumnsClass(
            columns
          )}`}
          style={{ maxWidth: gridMaxWidth, columnGap: `${columnGap}px`, rowGap: `${gapY}rem` }}
        >
          {members.map((member, index) => (
            <TeamFloatCard
              key={member.id}
              member={member}
              presentation={presentation}
              tilt={tilt}
              cascade={stagger ? floatCascadeClass(index, columns, presentation.gap ?? 'lg') : ''}
            />
          ))}
        </div>
      )}

      {members.length > 1 ? (
        <div className={`mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 ${toolbarAlign}`}>
          <div role="tablist" aria-label="Team view" className="flex shrink-0 items-center gap-6">
            {PORTFOLIO_TEAM_PROFILE_VIEW_OPTIONS.map((option) => {
              const active = option.value === view;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setView(option.value)}
                  className={`${META_CLS} relative pb-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-current`}
                  data-pf-no-color-transition=""
                  style={{
                    color: active ? readable.strong : readable.muted,
                    opacity: active ? 1 : 0.65,
                    transition: `color 420ms ${FLOAT_EASE}, opacity 420ms ${FLOAT_EASE}`,
                  }}
                >
                  {option.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 block h-px"
                    data-pf-no-color-transition=""
                    style={{
                      backgroundColor: accent,
                      transform: active ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: `transform 520ms ${FLOAT_EASE}`,
                    }}
                  />
                </button>
              );
            })}
          </div>
          {view === 'rail' ? (
            <>
              <div className="flex min-w-[8rem] flex-1 items-center sm:min-w-[14rem]" aria-hidden>
                <span className="relative block h-px w-full" style={{ backgroundColor: presentation.cardBorderColor }}>
                  <span
                    className="absolute left-0 top-1/2 block h-[2px] -translate-y-1/2"
                    data-pf-no-color-transition=""
                    style={{
                      backgroundColor: accent,
                      width: `${100 / members.length}%`,
                      transform: `translate(${progress * (members.length - 1) * 100}%, -50%)`,
                      transition: `transform 520ms ${FLOAT_EASE}`,
                    }}
                  />
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {([-1, 1] as const).map((direction) => (
                  <TeamFloatChevron
                    key={direction}
                    direction={direction}
                    disabled={direction === -1 ? bounds.atStart : bounds.atEnd}
                    onClick={() => step(direction)}
                    borderColor={presentation.cardBorderColor}
                    color={readable.strong}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
