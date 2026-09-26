'use client';

/**
 * Profile cards — the Team design where the portrait is the card and everything else floats on it.
 *
 * Extracted out of portfolio-team-designs.tsx into its own module, like the other reworked
 * designs, and built in layers:
 *
 *  1. **Depth without a box.** The frame is a gradient hairline (bright at the top-left corner,
 *     gone across the middle, back at the bottom-right) and the shadow is wide and diffuse, so a
 *     card reads as lit rather than outlined — the demarcation a dark page needs.
 *  2. **A glass caption.** The name/role block is a frosted pane (`backdrop-blur`) floating inset
 *     over the portrait's lower edge, seated on a gradient foot so the blur has something to sit
 *     against. It opens on hover — a `0fr → 1fr` grid row, the only way to transition to a
 *     content-driven height — to release the social row on a per-icon stagger.
 *  3. **Light that follows you.** A radial bloom tracks the cursor across the card, screened on a
 *     dark surface and soft-lit on a light one, with a white specular core so it reads whatever
 *     the accent hue is.
 *  4. **Two navigations, one design.** `Opens on` picks the view the section loads with and the
 *     visitor switches freely: a rail that scrolls natively (trackpad and touch keep their
 *     momentum) and steps one card at a time from two chevrons, or an asymmetric grid that breaks
 *     its own baseline. The grid can also hold back the long tail of a large team behind a
 *     magnetic `View all` pill, so the section never becomes a wall of faces.
 *  5. **One curve.** Every transition here runs on `cubic-bezier(0.16, 1, 0.3, 1)`.
 *
 * Site-wide trap respected throughout: any node that animates transform/opacity/grid-template
 * through CSS carries `data-pf-no-color-transition`, otherwise the global color-mode transition
 * rule in globals.css replaces its `transition-property` and the motion silently disappears.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import gsap from 'gsap';
import {
  EASE_CLS,
  HOVER_CLS,
  META_CLS,
  TOUCH_REVEAL_CLS,
  TeamMemberImage,
  TeamSocialLinks,
  TeamViewToggleIcon,
} from '@/components/portfolio/portfolio-team-design-primitives';
import {
  TEAM_CLEAR_PROPS,
  teamIndexLabel,
  teamPrefersReducedMotion,
} from '@/components/portfolio/portfolio-team-design-motion';
import {
  teamCardFooterPaddingClass,
  teamContentAlignClass,
  teamListAlignClass,
  teamReadableCardText,
  teamSocialAlignClass,
  type PortfolioTeamAvatarSize,
  type PortfolioTeamCardMaxWidth,
  type PortfolioTeamGap,
  type PortfolioTeamListAlign,
  type PortfolioTeamPresentationSettings,
  type PortfolioTeamProfileGutter,
  type PortfolioTeamProfileRatio,
  type PortfolioTeamProfileView,
  type PortfolioTeamRailColumns,
} from '@/components/portfolio/portfolio-team-settings';
import { servicesColorLuminance } from '@/components/portfolio/portfolio-services-settings';
import type { ProfileTeamMember } from '@/types/ecosystem';

/* ---------------------------------------------------------------------- */
/* Proportions                                                             */
/* ---------------------------------------------------------------------- */

/**
 * Fades get their own curve. The family easing (`cubic-bezier(0.16,1,0.3,1)`) is an expo-out: it
 * is already ~90% done at a third of its duration, which is exactly right for something that
 * MOVES and reads as a pop for something that only changes alpha (measured on the filmstrip: the
 * pane looked fully opaque 160ms into a 420ms fade). Opacity therefore rides a standard ease.
 */
const FADE_EASE_CLS = `ease-[cubic-bezier(0.4,0,0.2,1)]`;

/**
 * `Info panel: On hover` — the frosted glass is switched on only in the revealed state.
 * `backdrop-filter` is not free while it is invisible: the browser still samples and blurs the
 * region behind every pane it finds, so a grid of twelve hidden ones taxes every frame of a
 * cursor sweep. Declared through the Tailwind utilities (never a raw `[backdrop-filter:…]`) so the
 * `-webkit-` pair is emitted for Safari.
 */
const TEAM_PROFILE_GLASS_ON_REVEAL =
  'group-hover:backdrop-blur-[22px] group-hover:backdrop-saturate-150 group-focus-within:backdrop-blur-[22px] group-focus-within:backdrop-saturate-150 [@media(hover:none)]:backdrop-blur-[22px] [@media(hover:none)]:backdrop-saturate-150';

/** Height ÷ width for each step of `Card ratio`, widest first. */
const TEAM_PROFILE_RATIO_FACTOR: Record<PortfolioTeamProfileRatio, number> = {
  square: 1,
  soft: 5 / 4,
  portrait: 4 / 3,
  tall: 3 / 2,
  xtall: 16 / 9,
};

const TEAM_PROFILE_RATIO_ASPECT: Record<PortfolioTeamProfileRatio, string> = {
  square: 'aspect-square',
  soft: 'aspect-[4/5]',
  portrait: 'aspect-[3/4]',
  tall: 'aspect-[2/3]',
  xtall: 'aspect-[9/16]',
};

/** `Photo size` as a width the floor is derived from — every card cap is wider than its step. */
const TEAM_PROFILE_FLOOR_REM: Record<PortfolioTeamAvatarSize, number> = {
  sm: 13.5,
  md: 16,
  lg: 19,
  xl: 22,
};

/**
 * The card's proportion comes from `Card ratio`, its floor from `Photo size` — the portrait IS
 * the card here, so the two controls stack instead of competing.
 *
 * The floor is derived from the ratio rather than fixed: a floor taller than the height the ratio
 * itself produces simply wins, and the ratio becomes a lie (measured once: a 20rem-wide square
 * card against a 22rem floor came out at 0.82, not 1:1). Keeping the base under every card width
 * cap and multiplying it by the ratio guarantees the aspect always decides.
 */
function teamProfileCardHeight(
  size: PortfolioTeamAvatarSize | undefined,
  ratio: PortfolioTeamProfileRatio | undefined
): { className: string; minHeight: string } {
  const step = ratio ?? 'portrait';
  const base = TEAM_PROFILE_FLOOR_REM[size ?? 'md'] ?? TEAM_PROFILE_FLOOR_REM.md;
  return {
    className: TEAM_PROFILE_RATIO_ASPECT[step] ?? TEAM_PROFILE_RATIO_ASPECT.portrait,
    minHeight: `${(base * (TEAM_PROFILE_RATIO_FACTOR[step] ?? 1)).toFixed(2)}rem`,
  };
}

/** Grid card width — one notch wider than the shared card cap, which left the portrait small. */
function teamProfileGridWidthClass(width: PortfolioTeamCardMaxWidth | undefined): string {
  if (width === 'xs') return 'max-w-[15rem]';
  if (width === 'md') return 'max-w-[23rem]';
  if (width === 'lg') return 'max-w-[26rem]';
  if (width === 'xl') return 'max-w-[30rem]';
  if (width === 'full') return 'max-w-none';
  return 'max-w-[20rem]';
}

/** Rail card width, one notch per `Card width` — wider than the grid's, the rail is the showcase. */
function teamProfileRailWidthClass(width: PortfolioTeamCardMaxWidth | undefined): string {
  if (width === 'xs') return 'sm:w-[15rem]';
  if (width === 'md') return 'sm:w-[21rem]';
  if (width === 'lg') return 'sm:w-[24rem]';
  if (width === 'xl') return 'sm:w-[27rem]';
  if (width === 'full') return 'sm:w-[30rem]';
  return 'sm:w-[18rem]';
}

/**
 * `Column spacing`, from `lg` up only. Below that the grid keeps one comfortable gap whatever the
 * setting says: a phone has no air to spend, and spending it there is how a two-column grid ends
 * up with cards too narrow to read.
 */
function teamProfileGutterClass(gutter: PortfolioTeamProfileGutter | undefined, kind: 'grid' | 'rail'): string {
  const step = gutter ?? 'md';
  if (kind === 'rail') {
    if (step === 'sm') return 'lg:gap-6';
    if (step === 'lg') return 'lg:gap-16';
    if (step === 'xl') return 'lg:gap-24';
    return 'lg:gap-10';
  }
  if (step === 'sm') return 'lg:gap-x-6';
  if (step === 'lg') return 'lg:gap-x-20';
  if (step === 'xl') return 'lg:gap-x-28';
  return 'lg:gap-x-12';
}

/**
 * The grid, from the design's own `Cards per row` — never the shared `columns`, and never more
 * than four at any breakpoint: past that the portraits stop being portraits. The row gap stays on
 * the section's shared `Gap`; only the column gap is this design's own.
 */
function teamProfileGridClass(
  columns: PortfolioTeamRailColumns,
  gap: PortfolioTeamGap,
  align: PortfolioTeamListAlign,
  gutter: PortfolioTeamProfileGutter | undefined
): string {
  const cols =
    columns === 2 ? 'sm:grid-cols-2' : columns === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3';
  const rows = gap === 'sm' ? 'gap-y-10' : gap === 'md' ? 'gap-y-14' : gap === 'xl' ? 'gap-y-24' : 'gap-y-20';
  const justify =
    align === 'left' ? 'justify-items-start' : align === 'right' ? 'justify-items-end' : 'justify-items-center';
  return `grid grid-cols-1 items-start ${cols} gap-x-6 sm:gap-x-8 ${teamProfileGutterClass(
    gutter,
    'grid'
  )} ${rows} ${justify}`;
}

/** Diffuse, wide-radius drop shadows — the depth cue that lifts a card off a flat ground. */
function teamProfileShadowClass(shadow: PortfolioTeamPresentationSettings['cardShadow']): string {
  if (shadow === 'soft') return 'shadow-[0_18px_44px_-30px_rgba(0,0,0,0.55)]';
  if (shadow === 'medium') return 'shadow-[0_26px_60px_-34px_rgba(0,0,0,0.7)]';
  if (shadow === 'strong') return 'shadow-[0_34px_80px_-36px_rgba(0,0,0,0.85)]';
  return '';
}

function teamProfileRadiusClass(radius: PortfolioTeamPresentationSettings['cardRadius']): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'sm') return 'rounded-xl';
  if (radius === 'md') return 'rounded-2xl';
  if (radius === 'lg') return 'rounded-[1.75rem]';
  return 'rounded-[2.25rem]';
}

/** `Visible at first` is stored as a label, since `all` shares the axis with the counts. */
function teamProfileVisibleCount(value: PortfolioTeamPresentationSettings['profileCardsVisible']): number | null {
  if (value === '4') return 4;
  if (value === '6') return 6;
  if (value === '8') return 8;
  return null;
}

/* ---------------------------------------------------------------------- */
/* The card                                                                */
/* ---------------------------------------------------------------------- */

function TeamProfileCard({
  member,
  presentation,
  index,
  widthClass,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
  /** The view owns the width: a cap in the grid, none in the rail (its track sets an exact one). */
  widthClass: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  const fillOn = presentation.cardBackgroundEnabled !== false;
  const surface = presentation.cardBackgroundColor;
  const border = presentation.cardBorder ?? 'thin';
  const accent = presentation.teamPalette?.principal?.trim() || presentation.socialIconColor;
  const darkSurface = servicesColorLuminance(surface) < 0.5;
  const radius = teamProfileRadiusClass(presentation.cardRadius);
  /** The portrait is the panel's backdrop — without one there is nothing to blur, so it sits in flow. */
  const overlay = presentation.showImage;
  /**
   * `Info panel: On hover` only makes sense over a portrait — with no image the panel IS the card,
   * and hiding it would leave an empty box. On a pointer that cannot hover the reveal is simply
   * the resting state, so a phone never loses the name and role.
   */
  const panelOnHover = overlay && (presentation.profileCardsPanel ?? 'always') === 'hover';
  const height = teamProfileCardHeight(presentation.avatarSize, presentation.profileCardsRatio);

  /**
   * The glow follows the pointer through two custom properties rather than React state: a
   * re-render per pointermove would drop frames across a grid of cards, and the shared entrance's
   * `clearProps` only clears the properties it set, never custom ones.
   */
  const trackGlow = (event: ReactPointerEvent<HTMLElement>) => {
    const node = cardRef.current;
    if (!node || event.pointerType !== 'mouse') return;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    node.style.setProperty('--team-card-glow-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    node.style.setProperty('--team-card-glow-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  const caption = (
    <div
      className={`${
        overlay
          ? `absolute inset-x-3 bottom-3 z-20 border ${
              presentation.cardRadius === 'none' ? 'rounded-none' : 'rounded-xl'
            } ${
              panelOnHover
                ? // The blur is declared only in the revealed state, so a grid of hidden panes
                  // costs nothing while the cursor travels across it: `backdrop-filter` samples
                  // and blurs its backdrop every frame it exists, visible or not.
                  // Asymmetric on purpose: the long duration lives in the hover rule, so leaving
                  // falls back to the short one. A panel that takes as long to go as to arrive is
                  // what reads as lag when the cursor is already two cards away.
                  `${TEAM_PROFILE_GLASS_ON_REVEAL} pointer-events-none opacity-0 transition-opacity duration-[220ms] ${FADE_EASE_CLS} group-hover:pointer-events-auto group-hover:opacity-100 group-hover:duration-[420ms] group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:duration-[420ms] [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100`
                : 'backdrop-blur-[22px] backdrop-saturate-150'
            }`
          : 'relative z-20 flex-1 border-t'
      } ${teamCardFooterPaddingClass(presentation.cardPadding)} ${teamContentAlignClass(align)}`}
      data-team-panel=""
      data-pf-no-color-transition=""
      style={{
        backgroundColor: overlay
          ? `color-mix(in srgb, ${surface} ${fillOn ? 72 : 52}%, transparent)`
          : fillOn
            ? surface
            : 'transparent',
        borderColor: `color-mix(in srgb, ${readable.strong} 12%, transparent)`,
        boxShadow: overlay ? '0 20px 40px -32px rgba(0,0,0,0.9)' : undefined,
      }}
    >
      {/* The pane fades in place; the copy is what rises. Only unblurred nodes move, so the whole
          reveal stays on the compositor — moving the glass itself re-blurs the portrait behind it
          on every frame (measured: 21 fps sweeping a row of cards, against 61 idle). */}
      <div
        className={
          panelOnHover
            ? `translate-y-3 opacity-0 transition-[transform,opacity] duration-[240ms] ${EASE_CLS} group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-[60ms] group-hover:duration-[520ms] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:duration-[520ms] ${TOUCH_REVEAL_CLS}`
            : ''
        }
        data-pf-no-color-transition=""
      >
        {presentation.showName ? (
          <h3
            className="text-[calc(clamp(1.15rem,1.25vw,1.4rem)*var(--pf-team-font-scale,1))] font-semibold leading-[1.08] tracking-[-0.03em]"
            style={{ color: readable.strong }}
          >
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility ? (
          <p
            // Wider tracking than the family's small-caps default: at this size the role is a
            // label, not a sentence. The lead indent compensates the trailing letter-space when
            // the copy is centred.
            className={`mt-2.5 min-h-[0.7rem] text-[calc(0.62rem*var(--pf-team-font-scale,1))] font-medium uppercase leading-none tracking-[0.3em] ${
              align === 'center' ? 'pl-[0.3em]' : ''
            }`}
            style={{ color: readable.muted }}
          >
            {member.responsibility.trim() || ' '}
          </p>
        ) : null}
      </div>
      {presentation.showSocials ? (
        // The row opens the panel instead of sitting in permanently reserved empty space: a
        // 0fr → 1fr grid row is the only way to transition to a content-driven height. When the
        // panel itself is the reveal there is nothing left to open — the links ride in with it.
        <div
          className={`grid ${
            overlay && !panelOnHover
              ? 'grid-rows-[0fr] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]'
              : 'grid-rows-[1fr]'
          } transition-[grid-template-rows] duration-[620ms] ${EASE_CLS}`}
          data-pf-no-color-transition=""
        >
          <div className="min-h-0 overflow-hidden">
            <div className="pt-4">
              <TeamSocialLinks
                member={member}
                presentation={presentation}
                align={teamSocialAlignClass(align)}
                // No per-icon stagger when the panel itself is the reveal: that stagger is an
                // inline `transition-delay`, so it applies on the way OUT too — the pane fades
                // while the icons are still waiting 90-200ms to begin. They ride the panel's own
                // rise instead, and the exit stays in one piece.
                revealOnHover={overlay && !panelOnHover}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <article
      className={`group relative w-full ${widthClass} ${teamListAlignClass(align)}`}
      data-team-reveal=""
    >
      <div
        ref={cardRef}
        onPointerMove={trackGlow}
        className={`relative isolate flex w-full flex-col ${radius} ${teamProfileShadowClass(
          presentation.cardShadow
        )} ${border === 'medium' ? 'p-[2px]' : border === 'none' ? '' : 'p-px'} ${HOVER_CLS} group-hover:-translate-y-2`}
        data-pf-no-color-transition=""
        style={{
          // A gradient hairline instead of a flat border: bright at the top-left corner, gone
          // across the middle, back at the bottom-right — the frame reads as a lit edge.
          backgroundImage:
            border === 'none'
              ? undefined
              : `linear-gradient(145deg, color-mix(in srgb, ${presentation.cardBorderColor} 95%, transparent) 0%, color-mix(in srgb, ${presentation.cardBorderColor} 12%, transparent) 42%, color-mix(in srgb, ${presentation.cardBorderColor} 70%, transparent) 100%)`,
        }}
      >
        <div
          className="relative flex w-full flex-col overflow-hidden rounded-[inherit]"
          style={{ backgroundColor: fillOn ? surface : 'transparent' }}
        >
          {overlay ? (
            <div
              // No `will-change` on the zoom layer: an interleaved A/B (4 sweeps per variant in one
              // page, so recompiles hit both) put it at 18 fps median against 17 with it — Chrome
              // already promotes an element with a running transform transition, and pinning a
              // layer per portrait only costs memory.
              className={`relative w-full overflow-hidden ${height.className}`}
              style={{ minHeight: height.minHeight }}
              data-team-reveal-media=""
            >
              <TeamMemberImage
                member={member}
                presentation={{ ...presentation, imageAspect: 'portrait' }}
                fill
                zoom
              />
              {/* Seats the glass panel: without a darker foot the blur has nothing to sit against.
                  With the panel on hover the foot arrives with it, so the resting card is pure
                  portrait. */}
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 bottom-0 z-[5] block h-2/5 ${
                  panelOnHover
                    ? `opacity-0 transition-opacity duration-[220ms] ${FADE_EASE_CLS} group-hover:opacity-100 group-hover:duration-[460ms] group-focus-within:opacity-100 group-focus-within:duration-[460ms] [@media(hover:none)]:opacity-100`
                    : ''
                }`}
                data-pf-no-color-transition=""
                style={{
                  backgroundImage:
                    'linear-gradient(to top, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0) 100%)',
                }}
              />
            </div>
          ) : null}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-10 block opacity-0 transition-opacity duration-[520ms] ${EASE_CLS} group-hover:opacity-100`}
            data-pf-no-color-transition=""
            style={{
              // Deliberately no `mix-blend-mode`: a blended layer forces its own render surface and
              // re-composites the whole card on every frame any hover transition runs. Measured
              // over three sweeps per variant — screen 35 fps median against 45 without it, for a
              // difference in the bloom nobody can see. The alphas below are tuned to land in the
              // same place unblended.
              background: [
                `radial-gradient(9rem circle at var(--team-card-glow-x, 50%) var(--team-card-glow-y, 0%), ${
                  darkSurface ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.22)'
                } 0%, transparent 72%)`,
                `radial-gradient(17rem circle at var(--team-card-glow-x, 50%) var(--team-card-glow-y, 0%), color-mix(in srgb, ${accent} ${
                  darkSurface ? 38 : 26
                }%, transparent) 0%, transparent 70%)`,
              ].join(', '),
            }}
          />
          {overlay ? (
            <span
              className={`${META_CLS} pointer-events-none absolute left-5 top-5 z-[15] font-semibold tabular-nums text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] transition-opacity duration-[520ms] ${EASE_CLS} group-hover:opacity-0`}
              data-pf-no-color-transition=""
              aria-hidden
            >
              {teamIndexLabel(index)}
            </span>
          ) : null}
          {caption}
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------- */
/* Chrome                                                                  */
/* ---------------------------------------------------------------------- */

/**
 * The reveal control for a held-back team: an inverted-fill pill that leans towards the cursor.
 * The magnetism is written to custom properties on the node, never to React state — the same
 * reason the card's glow is.
 */
function TeamProfileRevealPill({
  expanded,
  total,
  readable,
  surface,
  hairline,
  onToggle,
}: {
  expanded: boolean;
  total: number;
  readable: { strong: string; muted: string };
  surface: string;
  hairline: string;
  onToggle: () => void;
}) {
  const pillRef = useRef<HTMLButtonElement | null>(null);

  const magnetize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const node = pillRef.current;
    if (!node || event.pointerType !== 'mouse') return;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0) return;
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    node.style.setProperty('--team-magnet-x', `${(dx * 7).toFixed(2)}px`);
    node.style.setProperty('--team-magnet-y', `${(dy * 5).toFixed(2)}px`);
  };

  const release = () => {
    const node = pillRef.current;
    if (!node) return;
    node.style.setProperty('--team-magnet-x', '0px');
    node.style.setProperty('--team-magnet-y', '0px');
  };

  return (
    <button
      ref={pillRef}
      type="button"
      onClick={onToggle}
      onPointerMove={magnetize}
      onPointerLeave={release}
      aria-expanded={expanded}
      className={`group/pill relative inline-flex items-center gap-4 overflow-hidden rounded-full border px-8 py-4 transition-transform duration-[520ms] ${EASE_CLS} focus:outline-none focus-visible:ring-2 focus-visible:ring-current`}
      data-pf-no-color-transition=""
      style={
        {
          borderColor: hairline,
          transform: 'translate(var(--team-magnet-x, 0px), var(--team-magnet-y, 0px))',
          // Declared on the button so every child inherits it: when the fill sweeps up, the label
          // and the arrow both flip to the card color. Declared on the arrow alone (as it first
          // was) the label kept `var(--team-pill-ink)` undefined and stayed invisible on the fill.
          '--team-pill-ink': surface,
        } as CSSProperties
      }
    >
      {/* Inverted fill: a scaled layer wipes up, so the pill fills instead of cross-fading. */}
      <span
        aria-hidden
        className={`absolute inset-0 z-0 block origin-bottom scale-y-0 transition-transform duration-[620ms] ${EASE_CLS} group-hover/pill:scale-y-100 group-focus-visible/pill:scale-y-100`}
        data-pf-no-color-transition=""
        style={{ backgroundColor: readable.strong }}
      />
      <span
        className={`${META_CLS} relative z-[1] transition-colors duration-[420ms]`}
        data-pf-no-color-transition=""
        style={{ color: readable.strong }}
      >
        <span className="group-hover/pill:![color:var(--team-pill-ink)] group-focus-visible/pill:![color:var(--team-pill-ink)]">
          {expanded ? 'Show less' : `View all — ${total}`}
        </span>
      </span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={`relative z-[1] h-4 w-4 transition-transform duration-[520ms] ${EASE_CLS} ${
          expanded ? 'rotate-180 group-hover/pill:-translate-y-0.5' : 'group-hover/pill:translate-y-0.5'
        } group-hover/pill:![color:var(--team-pill-ink)] group-focus-visible/pill:![color:var(--team-pill-ink)]`}
        data-pf-no-color-transition=""
        style={{ color: readable.strong }}
      >
        <path d="M12 5v14" />
        <path d="m6 13 6 6 6-6" />
      </svg>
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* The gallery                                                             */
/* ---------------------------------------------------------------------- */

export function TeamProfileCardsGallery({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const opensOn = presentation.profileCardsView ?? 'grid';
  const [view, setView] = useState<PortfolioTeamProfileView>(opensOn);
  const [lastOpensOn, setLastOpensOn] = useState<PortfolioTeamProfileView>(opensOn);
  const [expanded, setExpanded] = useState(false);
  const [bounds, setBounds] = useState({ atStart: true, atEnd: false, scrollable: false });
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  const stagger = presentation.profileCardsStagger !== false;
  const columns = presentation.profileCardsColumns ?? 3;
  const hairline = `color-mix(in srgb, ${presentation.cardBorderColor} 70%, transparent)`;

  // Adjusting state during render — React's own recipe for "a prop changed, reset what was
  // derived from it". The editor's `Opens on` decides the opening view, so changing it in the
  // dashboard overrides whatever the visitor last toggled; in an effect this would lint (and run)
  // as a cascading render.
  if (lastOpensOn !== opensOn) {
    setLastOpensOn(opensOn);
    setView(opensOn);
  }

  const cap = teamProfileVisibleCount(presentation.profileCardsVisible);
  /** The cap is a grid affordance: the rail already holds everyone, one swipe away. */
  const capped = view === 'grid' && cap != null && members.length > cap;
  const shown = capped && !expanded ? members.slice(0, cap) : members;

  const syncBounds = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const travel = scroller.scrollWidth - scroller.clientWidth;
    setBounds({
      atStart: scroller.scrollLeft <= 2,
      atEnd: travel <= 4 || scroller.scrollLeft >= travel - 2,
      scrollable: travel > 4,
    });
  }, []);

  useEffect(() => {
    syncBounds();
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncBounds);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [syncBounds, view, members.length]);

  /**
   * The cards released by `View all` arrive after the section's shared entrance has already run,
   * so they would otherwise pop in fully formed. They get the same rise-and-settle, keyed off the
   * count that was visible when the click happened — and, like every tween in this family, it
   * clears the exact properties it set (never `clearProps: 'all'`, which would take the palette
   * colors React rendered inline with it).
   */
  useEffect(() => {
    if (!expanded || cap == null) return;
    const root = gridRef.current;
    if (!root || teamPrefersReducedMotion()) return;
    const revealed = Array.from(root.children).slice(cap) as HTMLElement[];
    if (revealed.length === 0) return;
    let tween: gsap.core.Tween | undefined;
    try {
      tween = gsap.fromTo(
        revealed,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.06,
          clearProps: TEAM_CLEAR_PROPS,
        }
      );
    } catch (error) {
      console.error('[Team profile cards] reveal tween failed', error);
      gsap.set(revealed, { clearProps: TEAM_CLEAR_PROPS });
    }
    return () => {
      tween?.kill();
    };
  }, [expanded, cap]);

  /** Step to the next card's own leading edge — card widths change with every breakpoint. */
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

  const toolbarAlign =
    align === 'center' ? 'justify-center' : align === 'right' ? 'flex-row-reverse justify-between' : 'justify-between';
  const pillAlign = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  return (
    // `min-w-0` on the root and the scroller both: a horizontally scrollable flex row otherwise
    // reports its full content width to an auto-sized parent and stretches the whole page.
    <div className="w-full min-w-0">
      {members.length > 1 ? (
        <div className={`mb-10 flex w-full flex-wrap items-center gap-4 ${toolbarAlign}`}>
          <div
            className="inline-flex items-center gap-1 rounded-full border p-1"
            style={{ borderColor: hairline }}
            role="group"
            aria-label="Team layout"
          >
            {(['rail', 'grid'] as const).map((option) => {
              const selected = option === view;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  aria-pressed={selected}
                  className={`${META_CLS} inline-flex items-center gap-2 rounded-full px-4 py-2.5 transition-[background-color,color,opacity] duration-[420ms] ${EASE_CLS} focus:outline-none focus-visible:ring-2 focus-visible:ring-current ${
                    selected ? '' : 'opacity-55 hover:opacity-100'
                  }`}
                  data-pf-no-color-transition=""
                  style={{
                    color: selected ? readable.strong : readable.muted,
                    backgroundColor: selected
                      ? `color-mix(in srgb, ${readable.strong} 10%, transparent)`
                      : 'transparent',
                  }}
                >
                  <TeamViewToggleIcon view={option} />
                  {option === 'rail' ? 'Rail' : 'Grid'}
                </button>
              );
            })}
          </div>
          {view === 'rail' && bounds.scrollable ? (
            <div className="flex shrink-0 items-center gap-3">
              {([-1, 1] as const).map((direction) => {
                const disabled = direction === -1 ? bounds.atStart : bounds.atEnd;
                return (
                  <button
                    key={direction}
                    type="button"
                    onClick={() => stepRail(direction)}
                    disabled={disabled}
                    aria-label={direction === -1 ? 'Previous members' : 'Next members'}
                    className={`group/nav flex h-12 w-12 items-center justify-center rounded-full border transition-[transform,opacity] duration-[520ms] ${EASE_CLS} focus:outline-none focus-visible:ring-2 focus-visible:ring-current ${
                      disabled ? 'cursor-default opacity-25' : 'hover:-translate-y-0.5'
                    }`}
                    data-pf-no-color-transition=""
                    style={{ borderColor: hairline, color: readable.strong }}
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
      ) : null}

      {view === 'grid' ? (
        <>
          <div
            ref={gridRef}
            className={`w-full ${teamProfileGridClass(
              columns,
              presentation.gap,
              align,
              presentation.profileCardsGutter
            )}`}
          >
            {shown.map((member, index) => (
              <div key={member.id} className={`w-full ${stagger && index % 2 === 1 ? 'lg:mt-14' : ''}`}>
                <TeamProfileCard
                  member={member}
                  presentation={presentation}
                  index={index}
                  widthClass={teamProfileGridWidthClass(presentation.cardMaxWidth)}
                />
              </div>
            ))}
          </div>
          {capped ? (
            <div className={`mt-16 flex w-full ${pillAlign}`}>
              <TeamProfileRevealPill
                expanded={expanded}
                total={members.length}
                readable={readable}
                surface={presentation.cardBackgroundColor}
                hairline={hairline}
                onToggle={() => setExpanded((current) => !current)}
              />
            </div>
          ) : null}
        </>
      ) : (
        <div
          ref={scrollerRef}
          onScroll={syncBounds}
          // The card lifts on hover and its shadow spills, but an `overflow-x-auto` row cannot
          // keep `overflow-y: visible` — the room for both has to be padding, not overflow.
          className={`flex min-w-0 max-w-full snap-x snap-mandatory items-start gap-6 overflow-x-auto overscroll-x-contain px-1 pb-10 pt-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-8 ${teamProfileGutterClass(
            presentation.profileCardsGutter,
            'rail'
          )}`}
        >
          {members.map((member, index) => (
            <div
              key={member.id}
              className={`flex w-[78vw] shrink-0 snap-start ${teamProfileRailWidthClass(presentation.cardMaxWidth)} ${
                stagger && index % 2 === 1 ? 'sm:pt-12' : ''
              }`}
            >
              <TeamProfileCard
                member={member}
                presentation={presentation}
                index={index}
                widthClass="max-w-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
