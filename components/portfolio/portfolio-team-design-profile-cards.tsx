'use client';

/**
 * Profile cards keep portraits prominent with solid, contrast-safe inset captions.
 * Caption and photo share a grid cell: long copy can grow the card instead of being clipped.
 * Rail/grid, initial visibility, optional hover panels and reduced motion remain supported.
 */

import { cardsRadiusClass, cardsStyleCss } from '@/components/portfolio/portfolio-cards-style';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import gsap from 'gsap';
import {
  EASE_CLS,
  META_CLS,
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
  TEAM_PROFILE_GUTTER_PX,
  teamCardFooterPaddingClass,
  teamContentAlignClass,
  teamListAlignClass,
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
import { readableMix } from '@/components/portfolio/stack-designs/readable-ink';
import { TeamHoverVeilCard } from '@/components/portfolio/portfolio-team-design-hover-veil';
import type { ProfileTeamMember } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

/* ---------------------------------------------------------------------- */
/* Proportions                                                             */
/* ---------------------------------------------------------------------- */

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

/** Shared visible spacing scale for the grid and rail, including tablet widths. */
function teamProfileGutterClass(gutter: PortfolioTeamProfileGutter | undefined, kind: 'grid' | 'rail'): string {
  return `team-profile-${kind}-gap-${gutter ?? 'md'}`;
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
  const cols = columns === 2
    ? 'sm:grid-cols-[repeat(2,minmax(0,var(--team-profile-card-max)))]'
    : columns === 4
      ? 'sm:grid-cols-[repeat(2,minmax(0,var(--team-profile-card-max)))] xl:grid-cols-[repeat(4,minmax(0,var(--team-profile-card-max)))]'
      : 'sm:grid-cols-[repeat(2,minmax(0,var(--team-profile-card-max)))] lg:grid-cols-[repeat(3,minmax(0,var(--team-profile-card-max)))]';
  const rows = gap === 'sm' ? 'gap-y-10' : gap === 'md' ? 'gap-y-14' : gap === 'xl' ? 'gap-y-24' : 'gap-y-20';
  const justify =
    align === 'left' ? 'justify-items-start' : align === 'right' ? 'justify-items-end' : 'justify-items-center';
  return `team-profile-grid grid grid-cols-1 ${cols} items-start ${teamProfileGutterClass(
    gutter,
    'grid'
  )} ${rows} ${justify}`;
}

/** Diffuse, wide-radius drop shadows — the depth cue that lifts a card off a flat ground. */
function teamProfileShadowClass(shadow: PortfolioTeamPresentationSettings['cardShadow']): string {
  if (shadow === 'soft') return 'shadow-[0_2px_6px_rgba(0,0,0,0.06)]';
  if (shadow === 'medium') return 'shadow-[0_6px_18px_-8px_rgba(0,0,0,0.16)]';
  if (shadow === 'strong') return 'shadow-[0_10px_26px_-10px_rgba(0,0,0,0.24)]';
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
  member, presentation, index, widthClass, renderPortrait,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  index: number;
  widthClass: string;
  renderPortrait?: (member: ProfileTeamMember, index: number) => ReactNode;
}) {
  const align = presentation.listAlign ?? 'center';
  const overlay = presentation.showImage;
  const panelOnHover = overlay && presentation.profileCardsPanel === 'hover';
  const surface = presentation.cardBackgroundColor;
  const readable = {
    strong: readableMix(presentation.nameColor, 100, surface),
    muted: readableMix(presentation.responsibilityColor, 100, surface),
  };
  const hasSocials = presentation.showSocials && member.socialLinks?.some(link => link.url.trim());
  const socialSurface = ['minimal', 'outline'].includes(presentation.socialIconStyle) ? surface : presentation.socialBackgroundColor;
  const socialPresentation = { ...presentation, socialIconColor: readableMix(presentation.socialIconColor, 100, socialSurface) };
  const height = teamProfileCardHeight(presentation.avatarSize, presentation.profileCardsRatio);
  const factor = TEAM_PROFILE_RATIO_FACTOR[presentation.profileCardsRatio ?? 'portrait'];
  const radius = cardsRadiusClass(presentation.cardsStyle) ?? teamProfileRadiusClass(presentation.cardRadius);
  const border = presentation.cardBorder ?? 'thin';
  return (
    <article className={`team-profile-card group relative w-full ${widthClass} ${teamListAlignClass(align)}`}
      tabIndex={panelOnHover ? 0 : undefined} aria-label={panelOnHover ? member.name : undefined}
      data-panel-hover={panelOnHover} data-with-image={overlay} data-team-reveal="">
      <div className={`team-profile-frame relative w-full ${radius} ${teamProfileShadowClass(presentation.cardShadow)}`}
        style={{ borderStyle: border === 'none' ? 'none' : 'solid', borderWidth: border === 'none' ? 0 : border === 'medium' ? 2 : 1,
          borderColor: presentation.cardBorderColor, backgroundColor: surface,
          ...cardsStyleCss(presentation.cardsStyle, presentation.teamPalette) }} data-pf-no-color-transition="">
        <div className="team-profile-stack">
          {overlay && (
            <div className={`team-profile-media ${height.className}`}
              style={{ minHeight: `min(${height.minHeight}, calc(100cqw * ${factor}))` }}>
              {renderPortrait ? renderPortrait(member, index) : <TeamMemberImage member={member} presentation={presentation} fill
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />}
            </div>
          )}
          <div className={`team-profile-caption ${teamCardFooterPaddingClass(presentation.cardPadding)} ${teamContentAlignClass(align)}`}
            data-team-panel="" data-align={align} data-pf-no-color-transition=""
            style={{ backgroundColor: surface, color: readable.strong }}>
            <span className="team-profile-accent" aria-hidden="true" />
            {presentation.showName && <h3 className="team-profile-name" style={{ color: readable.strong }}>{member.name}</h3>}
            {presentation.showResponsibility && member.responsibility.trim() && (
              <p className="team-profile-role" style={{ color: readable.muted }}>{member.responsibility}</p>
            )}
            {hasSocials && <div className="team-profile-socials">
              <TeamSocialLinks member={member} presentation={socialPresentation} align={teamSocialAlignClass(align)} />
            </div>}
          </div>
          {overlay && presentation.profileCardsShowNumbers !== false && <span className="team-profile-index" aria-hidden="true">{teamIndexLabel(index)}</span>}
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
  const t = useT();
  const pillRef = useRef<HTMLButtonElement | null>(null);

  const magnetize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const node = pillRef.current;
    if (!node || event.pointerType !== 'mouse' || teamPrefersReducedMotion()) return;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0) return;
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    node.style.setProperty('--team-magnet-x', `${(dx * 3).toFixed(2)}px`);
    node.style.setProperty('--team-magnet-y', `${(dy * 2).toFixed(2)}px`);
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
      className={`group/pill relative inline-flex items-center gap-4 overflow-hidden rounded-full border px-8 py-4 transition-transform duration-[520ms] ${EASE_CLS} focus:outline-hidden focus-visible:ring-2 focus-visible:ring-current`}
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
          {expanded ? t('Show less') : `${t('View all')} — ${total}`}
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
  variant = 'profile',
  renderPortrait,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
  variant?: 'profile' | 'veil';
  renderPortrait?: (member: ProfileTeamMember, index: number) => ReactNode;
}) {
  const Card = variant === 'veil' ? TeamHoverVeilCard : TeamProfileCard;
  const t = useT();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const opensOn = presentation.profileCardsView ?? 'grid';
  const [view, setView] = useState<PortfolioTeamProfileView>(opensOn);
  const [lastOpensOn, setLastOpensOn] = useState<PortfolioTeamProfileView>(opensOn);
  const [expanded, setExpanded] = useState(false);
  const [bounds, setBounds] = useState({ atStart: true, atEnd: false, scrollable: false });
  const sectionSurface = presentation.teamPalette?.fond ?? (presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#fff');
  const readable = { strong: readableMix(presentation.nameColor, 100, sectionSurface), muted: readableMix(presentation.responsibilityColor, 100, sectionSurface) };
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
    scroller.scrollTo({ left: Math.max(0, Math.min(travel, target)), behavior: teamPrefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const toolbarAlign =
    align === 'center' ? 'justify-center' : align === 'right' ? 'flex-row-reverse justify-between' : 'justify-between';
  const pillAlign = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  return (
    // `min-w-0` on the root and the scroller both: a horizontally scrollable flex row otherwise
    // reports its full content width to an auto-sized parent and stretches the whole page.
    <div className="team-profile w-full min-w-0" style={{ '--team-profile-column-gap': `${TEAM_PROFILE_GUTTER_PX[presentation.profileCardsGutter ?? 'md']}px` } as CSSProperties}>
      {members.length > 1 ? (
        <div className={`mb-10 flex w-full flex-wrap items-center gap-4 ${toolbarAlign}`}>
          <div
            className="inline-flex items-center gap-1 rounded-full border p-1"
            style={{ borderColor: hairline }}
            role="group"
            aria-label={t('Team layout')}
          >
            {(['rail', 'grid'] as const).map((option) => {
              const selected = option === view;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  aria-pressed={selected}
                  className="team-profile-view-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-current"
                  data-pf-no-color-transition=""
                  style={{
                    color: selected ? readable.strong : readable.muted,
                    backgroundColor: selected
                      ? `color-mix(in srgb, ${readable.strong} 10%, transparent)`
                      : 'transparent',
                  }}
                >
                  <TeamViewToggleIcon view={option} />
                  {option === 'rail' ? t('Rail') : t('Grid')}
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
                    aria-label={direction === -1 ? t('Previous members') : t('Next members')}
                    className={`group/nav flex h-12 w-12 items-center justify-center rounded-full border transition-[transform,translate,scale,rotate,opacity] duration-[520ms] ${EASE_CLS} focus:outline-hidden focus-visible:ring-2 focus-visible:ring-current ${
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
            style={{
              '--team-profile-card-max': { xs: '15rem', sm: '20rem', md: '23rem', lg: '26rem', xl: '30rem', full: '1fr' }[presentation.cardMaxWidth] ?? '20rem',
              justifyContent: align === 'left' ? 'start' : align === 'right' ? 'end' : 'center',
            } as CSSProperties}
            className={`w-full ${teamProfileGridClass(
              columns,
              presentation.gap,
              align,
              presentation.profileCardsGutter
            )}`}
          >
            {shown.map((member, index) => (
              <div key={member.id} className={`w-full ${stagger && index % 2 === 1 ? 'lg:mt-14' : ''}`}>
                <Card
                  member={member}
                  presentation={presentation}
                  index={index}
                  widthClass={teamProfileGridWidthClass(presentation.cardMaxWidth)}
                  renderPortrait={renderPortrait}
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
          role="region"
          aria-label={t('Team members')}
          tabIndex={0}
          onKeyDown={event => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault(); stepRail(event.key === 'ArrowRight' ? 1 : -1);
            } else if (event.key === 'Home' || event.key === 'End') {
              event.preventDefault();
              event.currentTarget.scrollTo({left:event.key === 'Home' ? 0 : event.currentTarget.scrollWidth,
                behavior:teamPrefersReducedMotion() ? 'auto' : 'smooth'});
            }
          }}
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
              <Card
                member={member}
                presentation={presentation}
                index={index}
                widthClass="max-w-none"
                renderPortrait={renderPortrait}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
