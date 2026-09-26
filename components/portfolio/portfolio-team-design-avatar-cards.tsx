'use client';

/**
 * Avatar cards — the family's dark-UI portrait card, at an editorial scale.
 *
 * Everything this design measures lives in ONE table, `AVATAR_CARDS_SCALE` below: the avatar's
 * diameter, the card's track width, its padding and minimum height, the grid's gutters, and the
 * type sizes that have to grow with the portrait. Each of the section's existing settings
 * (`Avatar size`, `Card width`, `Card padding`, `Gap`) indexes into that table instead of the
 * family-wide helpers, which are sized for the small card layouts and left this one looking lost
 * in the middle of the page. Re-scaling the design is one edit in one object.
 *
 * Two deliberate consequences of that table:
 *  - **The portrait leads.** Every `Avatar size` step is roughly twice the family default
 *    (`md` is 224px against 112px), and the name's clamp is indexed by the same step, so the
 *    typography grows with the face instead of being left behind by it.
 *  - **The composition is grouped, not scattered.** The grid's own max width is computed from the
 *    card width and the gutters (`columns × card + gutters`) and centred with `mx-auto`, so the
 *    cards sit as one block in the middle of the section rather than being spread across the full
 *    content width by `justify-items-center`. The gutters themselves are a third of what the
 *    shared grid used.
 *
 * Hovering runs one choreography on one easing: the card lifts while its hairline brightens and
 * its shadow spreads; the avatar grows and morphs out of its circle into the shape `Avatar shape`
 * names, with the portrait pushing in behind the mask; a halo lit from the palette's principal
 * colour blooms behind it; and the links rise in under the copy on a per-icon stagger. Three
 * separate layers carry that — the mask scales, the media layer zooms, the halo blurs — because a
 * blur or a scale on a layer that also holds text softens the text
 * (portfolio-services-pricing-grid-blurry-text-fix), and a morphing mask that also held the
 * portrait would re-clip it on every frame.
 *
 * Site-wide trap respected throughout: any node that animates transform/opacity through CSS
 * carries `data-pf-no-color-transition`, otherwise the global color-mode transition rule in
 * globals.css replaces its `transition-property` and the motion silently disappears.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EASE_CLS,
  META_CLS,
  TeamMemberImage,
  TeamSocialLinks,
  TeamViewToggleIcon,
} from '@/components/portfolio/portfolio-team-design-primitives';
import { servicesColorLuminance } from '@/components/portfolio/portfolio-services-settings';
import {
  PORTFOLIO_TEAM_AVATAR_VIEW_OPTIONS,
  teamCardFrameClass,
  teamCardStyle,
  teamContentAlignClass,
  teamFlexAlignClass,
  teamReadableCardText,
  teamSocialAlignClass,
  type PortfolioTeamAvatarShape,
  type PortfolioTeamAvatarColumnGap,
  type PortfolioTeamAvatarColumns,
  type PortfolioTeamAvatarGridWidth,
  type PortfolioTeamAvatarSize,
  type PortfolioTeamAvatarView,
  type PortfolioTeamCardMaxWidth,
  type PortfolioTeamCardPadding,
  type PortfolioTeamGap,
  type PortfolioTeamPresentationSettings,
} from '@/components/portfolio/portfolio-team-settings';
import type { ProfileTeamMember } from '@/types/ecosystem';

/* ---------------------------------------------------------------------- */
/* Scale — the single place this design is sized from                      */
/* ---------------------------------------------------------------------- */

/**
 * One entry per setting step. Lengths that only ever reach CSS are Tailwind classes; the two that
 * have to be *computed* with — the card's track width and the grid's gutters — are plain `rem`
 * numbers, because the grid's max width is `columns × cardWidth + (columns − 1) × gapX` and no
 * class can express that.
 *
 * Every avatar step is responsive on its own: a 21rem portrait is right on a desktop and absurd on
 * a phone, so each one steps up rather than being one fixed diameter.
 */
const AVATAR_CARDS_SCALE = {
  /**
   * Circular portrait, per `Avatar size` — roughly double the family-wide steps. Written as a
   * *cap* on a full-width square rather than a fixed diameter: a fixed one larger than the card's
   * inner width overflows the card and is clipped by it (live-confirmed at `xl` + four columns),
   * whereas a cap simply stops growing when the column runs out.
   */
  avatar: {
    sm: 'max-w-[8.5rem] sm:max-w-[10rem]',
    md: 'max-w-[10.5rem] sm:max-w-[12.5rem] lg:max-w-[14rem]',
    lg: 'max-w-[12rem] sm:max-w-[14.5rem] lg:max-w-[17rem]',
    xl: 'max-w-[13.5rem] sm:max-w-[17rem] lg:max-w-[20.5rem]',
  } satisfies Record<PortfolioTeamAvatarSize, string>,
  /** Card track width in `rem`, per `Card width`. The grid's own max width is built from it. */
  cardWidth: {
    xs: 19,
    sm: 23,
    md: 26.5,
    lg: 30,
    xl: 34,
    full: 38,
  } satisfies Record<PortfolioTeamCardMaxWidth, number>,
  /**
   * Inner padding, per `Card padding`. Symmetric, and a notch tighter than the portrait's own
   * scale would suggest: the links row is drawn at rest and only when the member has links, so
   * nothing below the copy supplies stray breathing room that the padding has to discount.
   */
  padding: {
    none: 'px-6 py-6 sm:px-7 sm:py-7',
    sm: 'px-7 py-7 sm:px-8 sm:py-8',
    md: 'px-8 py-8 sm:px-10 sm:py-9',
    lg: 'px-9 py-10 sm:px-12 sm:py-11',
  } satisfies Record<PortfolioTeamCardPadding, string>,
  /**
   * The desktop column gutter in `rem`, per `Horizontal spacing`. Applied from `lg` up only,
   * over the `gap` entry below: at one or two columns there is nothing for a desktop spacing
   * choice to space, and the row rhythm still belongs to `Gap`. `md` is deliberately the same
   * 1.5rem the default `Gap` already produced, so turning the control on moves nothing.
   */
  columnGap: {
    sm: 0.75,
    md: 1.5,
    lg: 2.5,
    xl: 4,
  } satisfies Record<PortfolioTeamAvatarColumnGap, number>,
  /** Grid gutters in `rem` as `[column, row]`, per `Gap` — about a third of the shared grid's. */
  gap: {
    sm: [0.75, 1.5],
    md: [1.125, 2],
    lg: [1.5, 2.75],
    xl: [2.25, 4],
  } satisfies Record<PortfolioTeamGap, readonly [number, number]>,
  /** The name, indexed by `Avatar size` so the typography grows with the face. */
  name: {
    sm: 'text-[calc(clamp(1.25rem,0.9vw+1rem,1.5rem)*var(--pf-team-font-scale,1))]',
    md: 'text-[calc(clamp(1.45rem,1.2vw+1.05rem,1.85rem)*var(--pf-team-font-scale,1))]',
    lg: 'text-[calc(clamp(1.6rem,1.5vw+1.1rem,2.15rem)*var(--pf-team-font-scale,1))]',
    xl: 'text-[calc(clamp(1.75rem,1.9vw+1.15rem,2.45rem)*var(--pf-team-font-scale,1))]',
  } satisfies Record<PortfolioTeamAvatarSize, string>,
  /** Gap between the portrait and the name, per `Avatar size`. */
  copyOffset: { sm: 'mt-7', md: 'mt-8', lg: 'mt-9', xl: 'mt-10' } satisfies Record<PortfolioTeamAvatarSize, string>,
  /**
   * The cascade's drop, per `Gap` — tied to the row gutter so the rhythm scales with the grid —
   * and per breakpoint, because the column count changes there and a drop that belonged to the
   * middle of two columns is nonsense in the middle of four. See `avatarCascadeClass`.
   */
  stagger: {
    sm: { sm: 'sm:mt-6', lg: 'lg:mt-8', xl: 'xl:mt-10' },
    md: { sm: 'sm:mt-8', lg: 'lg:mt-10', xl: 'xl:mt-12' },
    lg: { sm: 'sm:mt-10', lg: 'lg:mt-14', xl: 'xl:mt-16' },
    xl: { sm: 'sm:mt-14', lg: 'lg:mt-20', xl: 'xl:mt-24' },
  } satisfies Record<PortfolioTeamGap, Record<'sm' | 'lg' | 'xl', string>>,
} as const;

/** Small caps for the role. Wider tracking than the family's `META_CLS`, and a step larger. */
const AVATAR_ROLE_CLS = 'text-[calc(0.7rem*var(--pf-team-font-scale,1))] font-semibold uppercase leading-none tracking-[0.34em]';

/**
 * Avatar cards' easing: a long expo-out, slower to settle than the family default. The avatar's
 * morph, the halo and the links all ride it, which is what makes them read as one motion rather
 * than three effects firing at once.
 */
const AVATAR_EASE_CLS = 'ease-[cubic-bezier(0.19,1,0.22,1)]';

const size = (settings: PortfolioTeamPresentationSettings): PortfolioTeamAvatarSize =>
  settings.avatarSize ?? 'md';
const gapOf = (settings: PortfolioTeamPresentationSettings): readonly [number, number] =>
  AVATAR_CARDS_SCALE.gap[settings.gap ?? 'lg'];
const cardWidthOf = (settings: PortfolioTeamPresentationSettings): number =>
  AVATAR_CARDS_SCALE.cardWidth[settings.cardMaxWidth ?? 'sm'];
/** Members per row on a large screen. Falls back to the section-wide `columns` when unset. */
const columnsOf = (settings: PortfolioTeamPresentationSettings): PortfolioTeamAvatarColumns =>
  settings.avatarCardsColumns ?? ((settings.columns ?? 3) as PortfolioTeamAvatarColumns);
/** The desktop column gutter in `rem`. */
const columnGapOf = (settings: PortfolioTeamPresentationSettings): number =>
  AVATAR_CARDS_SCALE.columnGap[settings.avatarCardsColumnGap ?? 'md'];

/**
 * Columns per `Members per row`. One card per row on a phone and two from `sm` whatever the
 * setting says: at this scale a third column below `lg` would crush every portrait.
 */
function avatarGridColumnsClass(columns: PortfolioTeamAvatarColumns): string {
  if (columns === 1) return 'grid-cols-1';
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
 * a grid that has slipped.
 */
function avatarCascadeClass(
  index: number,
  columns: PortfolioTeamAvatarColumns,
  gap: PortfolioTeamGap
): string {
  if (columns <= 1) return '';
  const drop = AVATAR_CARDS_SCALE.stagger[gap];
  const steps = [index % 2 === 1 ? drop.sm : 'sm:mt-0'];
  if (columns >= 3) steps.push(index % 3 === 1 ? drop.lg : 'lg:mt-0');
  if (columns === 4) {
    const column = index % 4;
    steps.push(column === 1 || column === 2 ? drop.xl : 'xl:mt-0');
  }
  return steps.join(' ');
}

/**
 * The shape the avatar opens into while its card is hovered. `circle` keeps the circle (the avatar
 * only grows); the other two break it. The variant carries the whole `border-radius`, so it always
 * beats the resting `rounded-full` on specificity — no `!important` needed.
 */
function teamAvatarMorphClass(shape: PortfolioTeamAvatarShape): string {
  if (shape === 'arch') return 'group-hover:[border-radius:50%_50%_18%_18%]';
  if (shape === 'squircle') return 'group-hover:[border-radius:34%]';
  return '';
}

/**
 * Diffuse, low-lying drop shadow per `Card shadow`, deepening on hover — the demarcation that
 * detaches a card from a dark ground. Tailwind's own `shadow-*` scale is too tight and too grey
 * for that, hence the explicit pairs.
 */
function teamAvatarShadowClass(shadow: PortfolioTeamPresentationSettings['cardShadow']): string {
  if (shadow === 'none') return '';
  if (shadow === 'soft') {
    return 'shadow-[0_12px_32px_-22px_rgba(0,0,0,0.45)] hover:shadow-[0_24px_52px_-24px_rgba(0,0,0,0.55)]';
  }
  if (shadow === 'strong') {
    return 'shadow-[0_28px_64px_-28px_rgba(0,0,0,0.62)] hover:shadow-[0_48px_96px_-30px_rgba(0,0,0,0.75)]';
  }
  return 'shadow-[0_20px_46px_-26px_rgba(0,0,0,0.52)] hover:shadow-[0_34px_72px_-28px_rgba(0,0,0,0.64)]';
}

/* ---------------------------------------------------------------------- */
/* The card                                                               */
/* ---------------------------------------------------------------------- */

function TeamAvatarCard({
  member,
  presentation,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  const step = size(presentation);
  const shape = presentation.avatarCardsShape ?? 'squircle';
  const glowOn = presentation.avatarCardsGlow !== false;
  const accent = presentation.teamPalette?.principal?.trim() || presentation.socialIconColor;
  const onDark = servicesColorLuminance(presentation.cardBackgroundColor) < 0.5;
  const border = presentation.cardBorderColor;
  const hasCopy = presentation.showName || presentation.showResponsibility;
  // The shared `TeamSocialLinks` draws an empty, icon-sized slot for a member with no links, so
  // that stretched layouts keep a common baseline. This card is `h-auto` and wants the opposite:
  // no links, no row, and the card simply ends higher instead of holding a dead band open.
  const hasSocials =
    presentation.showSocials && (member.socialLinks ?? []).some((link) => link.url.trim());
  // The top sheen is the "gradient border" half of the demarcation: a hairline that only exists in
  // the middle of the card's top edge. White on a dark fill; on a light one white is invisible, so
  // it borrows the accent instead.
  const sheen = onDark ? 'rgba(255,255,255,0.5)' : `color-mix(in srgb, ${accent} 50%, transparent)`;
  return (
    <article
      className={`group relative flex h-auto w-full flex-col ${teamFlexAlignClass(align)} ${teamCardFrameClass(
        presentation
      )} ${teamAvatarShadowClass(presentation.cardShadow)} ${
        AVATAR_CARDS_SCALE.padding[presentation.cardPadding ?? 'md']
      } ${teamContentAlignClass(
        align
      )} transition-[transform,box-shadow,border-color] duration-[760ms] ${AVATAR_EASE_CLS} hover:-translate-y-2 hover:![border-color:var(--team-avatar-border-lit)]`}
      data-pf-no-color-transition=""
      data-team-reveal=""
      style={{
        ...teamCardStyle(presentation),
        // Semi-transparent at rest, near-solid on hover: the border still comes from `Card border
        // color`, it is simply held back until the card is the one being looked at.
        ...((presentation.cardBorder ?? 'thin') === 'none'
          ? null
          : {
              borderColor: `color-mix(in srgb, ${border} 45%, transparent)`,
              ['--team-avatar-border-lit' as string]: `color-mix(in srgb, ${border} 92%, transparent)`,
            }),
      }}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 block h-px opacity-60 transition-opacity duration-[760ms] ${AVATAR_EASE_CLS} group-hover:opacity-100`}
        data-pf-no-color-transition=""
        style={{ backgroundImage: `linear-gradient(90deg, transparent 0%, ${sheen} 50%, transparent 100%)` }}
      />
      {presentation.showImage ? (
        <div className={`relative aspect-square w-full shrink-0 ${AVATAR_CARDS_SCALE.avatar[step]}`}>
          {glowOn ? (
            // Sized in percentages of the avatar, so every `Avatar size` step keeps the same halo.
            <span
              aria-hidden
              className={`pointer-events-none absolute -inset-[30%] block rounded-full opacity-40 blur-2xl transition-[opacity,transform] duration-[1100ms] ${AVATAR_EASE_CLS} group-hover:scale-110 group-hover:opacity-90`}
              data-pf-no-color-transition=""
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, ${accent} 0%, color-mix(in srgb, ${accent} 35%, transparent) 46%, transparent 72%)`,
              }}
            />
          ) : null}
          <div
            className={`relative h-full w-full overflow-hidden rounded-full ${teamAvatarMorphClass(
              shape
            )} transition-[border-radius,transform] duration-[980ms] ${AVATAR_EASE_CLS} group-hover:scale-[1.05]`}
            data-pf-no-color-transition=""
            data-team-reveal-media=""
          >
            <div
              className={`h-full w-full transition-transform duration-[1300ms] ${AVATAR_EASE_CLS} group-hover:scale-[1.12]`}
              data-pf-no-color-transition=""
            >
              <TeamMemberImage member={member} presentation={{ ...presentation, imageAspect: 'square' }} fill />
            </div>
          </div>
        </div>
      ) : null}
      {presentation.showName ? (
        // Two lines' worth of room whether the name needs them or not, with the text centred in
        // it: without the floor a one-line name and a two-line one give their cards different
        // heights, and a row of cards whose bottoms do not agree reads as a layout bug rather
        // than as rhythm. The inner span is what carries the text, so `text-align` still applies
        // — a bare text node inside a flex box becomes an anonymous item and stops obeying it.
        <h3
          className={`${AVATAR_CARDS_SCALE.name[step]} flex min-h-[2.08em] w-full items-center font-semibold leading-[1.04] tracking-[-0.035em] ${
            align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'
          } ${
            presentation.showImage ? AVATAR_CARDS_SCALE.copyOffset[step] : ''
          } transition-transform duration-[760ms] ${AVATAR_EASE_CLS} group-hover:-translate-y-0.5`}
          data-pf-no-color-transition=""
          style={{ color: readable.strong }}
        >
          <span className="block w-full">{member.name}</span>
        </h3>
      ) : null}
      {presentation.showResponsibility ? (
        // Technical, widely tracked small caps — "D I R E C T O R". Letter-spacing is added after
        // the last glyph too, so a centered line needs that much indent back to look centered.
        <p
          className={`${AVATAR_ROLE_CLS} min-h-[0.7rem] ${
            presentation.showName ? 'mt-4' : presentation.showImage ? AVATAR_CARDS_SCALE.copyOffset[step] : ''
          }`}
          style={{
            color: readable.muted,
            textIndent: align === 'center' ? '0.34em' : undefined,
          }}
        >
          {member.responsibility.trim() || ' '}
        </p>
      ) : null}
      {hasSocials ? (
        // At rest, not on hover: revealed links still occupy their row while invisible, and under
        // a portrait this size that reads as a dead band rather than as restraint. They keep their
        // own per-icon hover lift, so the card still answers the pointer here.
        <div className={`w-full ${presentation.showImage || hasCopy ? 'pt-5' : ''}`}>
          <TeamSocialLinks member={member} presentation={presentation} align={teamSocialAlignClass(align)} />
        </div>
      ) : null}
    </article>
  );
}

/* ---------------------------------------------------------------------- */
/* The shell                                                              */
/* ---------------------------------------------------------------------- */

/**
 * Avatar cards' shell — the design's two navigations, on the same toolbar the Profile cards use
 * (one convention for the whole family): a labelled Rail/Grid switch, and the rail's chevrons
 * beside it whenever the rail actually overflows. The switch belongs to the visitor —
 * `avatarCardsView` only decides which view the section opens on.
 *
 * Rail: a trackpad-scrollable, snapping row. Stepping aligns the next card's own leading edge
 * rather than scrolling a fixed amount — the cards are a different width at every breakpoint and
 * at every `Card width` step.
 * Grid: rows per `Members per row`, capped and centred so the cards read as one block, optionally
 * on a staggered rhythm that breaks the columns' shared baseline. The offset sits on the grid
 * cell, never on the card: `data-team-reveal` writes an inline transform on the card through the
 * entrance, which would cancel a translate class on the same node.
 */
export function TeamAvatarCards({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const opensOn = presentation.avatarCardsView ?? 'grid';
  const [view, setView] = useState<PortfolioTeamAvatarView>(opensOn);
  const [lastOpensOn, setLastOpensOn] = useState<PortfolioTeamAvatarView>(opensOn);
  const [bounds, setBounds] = useState({ atStart: true, atEnd: false, scrollable: false });
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  const stagger = presentation.avatarCardsStagger !== false;
  const hairline = `color-mix(in srgb, ${presentation.cardBorderColor} 70%, transparent)`;
  const columns = columnsOf(presentation);
  const deskGapX = columnGapOf(presentation);
  const [gapX, gapY] = gapOf(presentation);
  const cardWidth = cardWidthOf(presentation);

  // Adjusting state during render — React's own recipe for "a prop changed, reset what was
  // derived from it". The editor's `Opens on` decides the opening view, so changing it in the
  // dashboard overrides whatever the visitor last toggled; in an effect this would lint (and run)
  // as a cascading render.
  if (lastOpensOn !== opensOn) {
    setLastOpensOn(opensOn);
    setView(opensOn);
  }

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

  // `view` is a dependency: the scroller only exists in rail view, so switching back mounts a new
  // node whose bounds have never been measured — without this the chevrons stay hidden.
  useEffect(() => {
    syncBounds();
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(syncBounds);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [syncBounds, view, members.length]);

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
  // The block the cards actually occupy. Capping the grid — rather than centring each card inside
  // an over-wide track — is what closes the void the design used to float in; `mx-auto` then keeps
  // that block centred, and `align` moves it when the owner wants it off-centre.
  // Built from the DESKTOP gutter: the cap is what holds the block together at the width where
  // every column is actually on screen, which is the same width the gutter setting applies at.
  // `centered` caps the block at the cards' own width so they read as one composition; `full` is
  // the plain arrangement the Portrait rail's "Show all" uses — the grid keeps the whole content
  // width and every card stretches to fill its column (`Card width` then has nothing to cap).
  const gridWidth: PortfolioTeamAvatarGridWidth = presentation.avatarCardsGridWidth ?? 'centered';
  const gridMaxWidth =
    gridWidth === 'full'
      ? undefined
      : `${columns * cardWidth + Math.max(0, columns - 1) * deskGapX}rem`;
  // Only a capped block can be pushed around inside the section; a full-width one already fills it.
  const gridAlign =
    gridWidth === 'full' ? '' : align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';

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
            {PORTFOLIO_TEAM_AVATAR_VIEW_OPTIONS.map((option) => {
              const selected = option.value === view;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setView(option.value)}
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
                  <TeamViewToggleIcon view={option.value} />
                  {option.label}
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
        <div
          // `Horizontal spacing` is desktop-only, and an inline style cannot carry a breakpoint.
          // So BOTH gutters ride custom properties and two utilities read them — an inline
          // `column-gap` would win over the `lg:` variant no matter what, which is exactly how
          // this first failed to take effect. Below `lg` the gutter stays the one this design's
          // scale derives from `Gap`.
          className={`grid w-full items-start justify-items-stretch [column-gap:var(--team-avatar-column-gap-base)] lg:[column-gap:var(--team-avatar-column-gap)] ${gridAlign} ${avatarGridColumnsClass(
            columns
          )}`}
          style={{
            maxWidth: gridMaxWidth,
            rowGap: `${gapY}rem`,
            ['--team-avatar-column-gap-base' as string]: `${gapX}rem`,
            ['--team-avatar-column-gap' as string]: `${deskGapX}rem`,
          }}
        >
          {members.map((member, index) => (
            <div
              key={member.id}
              // `h-auto`, never `h-full`: the cell ends where the card ends, which is what lets a
              // member with no links sit in a shorter card instead of padding one out to match.
              className={`flex h-auto w-full ${
                stagger ? avatarCascadeClass(index, columns, presentation.gap ?? 'lg') : ''
              }`}
            >
              <TeamAvatarCard member={member} presentation={presentation} />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollerRef}
          onScroll={syncBounds}
          // The card lifts on hover and its shadow spills, but an `overflow-x-auto` row cannot
          // keep `overflow-y: visible` — the room for both has to be padding, not overflow.
          className="flex min-w-0 max-w-full snap-x snap-mandatory items-start overflow-x-auto overscroll-x-contain px-1 pb-10 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ gap: `${Math.max(gapX, 1)}rem` }}
        >
          {members.map((member, index) => (
            <div
              key={member.id}
              // `snap-start`, not `snap-center`: the chevrons step by aligning the next card to the
              // rail's leading edge, and centre snapping pulls that target back to its own nearest
              // snap point — "previous" would simply do nothing.
              className={`flex shrink-0 snap-start justify-center ${
                stagger && index % 2 === 1 ? 'sm:pt-10' : ''
              }`}
              // One expression instead of a breakpoint ladder: the card takes its configured width
              // and never more than the viewport allows on a narrow screen.
              style={{ width: `min(82vw, ${cardWidth}rem)` }}
            >
              <TeamAvatarCard member={member} presentation={presentation} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
