'use client';

/** An asymmetric portrait canvas, contained by the site's shared content margins. */

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import {
  META_CLS,
  TeamMemberImage,
  TeamSocialLinks,
} from '@/components/portfolio/portfolio-team-design-primitives';
import {
  runTeamDesignMotion,
  teamIndexLabel,
} from '@/components/portfolio/portfolio-team-design-motion';
import type {
  PortfolioTeamFloatAlign,
  PortfolioTeamPresentationSettings,
  PortfolioTeamRailColumns,
} from '@/components/portfolio/portfolio-team-settings';
import type { PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';
import { readableMix } from '@/components/portfolio/stack-designs/readable-ink';
import { useT } from '@/lib/i18n/I18nProvider';
import type { ProfileTeamMember } from '@/types/profile';

const DEFAULT_EDITORIAL_TEXT =
  'A small collective of specialists who each choose their own tools — and still land on one signature, because every project passes through every hand before it ships.';

/** The editorial slot's kicker when the owner has not written their own. */
const DEFAULT_EDITORIAL_LABEL = 'Studio note';

/**
 * Each card's drop at `lg`, in rem, cycling by its position in the canvas — never a clean arch or
 * a two-beat stagger, which is what would make an irregular canvas read as a grid in disguise.
 */
const CANVAS_OFFSET_PATTERN = [0, 5.5, 2, 7.5, 0.5, 4.5, 6.5, 1.5] as const;
/** The portrait's own proportion cycles too, for the same reason. */
const CANVAS_ASPECT_PATTERN = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-square', 'aspect-[2/3]'] as const;
/**
 * Scroll drift per slot, in px — this is the *half* amplitude: each card travels from `-v` to `+v`
 * across its whole pass through the viewport, so it sits at exactly its designed offset when it is
 * centred and the drift reads as depth rather than as a layout that never settles.
 *
 * Alternating sign is what separates "top of the canvas" from "bottom of the canvas" instead of
 * moving as one sheet. Keep the largest value well under the grid's row gap (`lg:gap-y-28`, 112px):
 * the drift must never close the gap that tells a caption which portrait it belongs to.
 */
const CANVAS_PARALLAX_PATTERN = [12, -8, 14, -10, 6, -12] as const;


/**
 * Per-card ceiling for the aligned (non-`full`) composition widths, in rem — the one that stops
 * cards growing into posters on a very wide monitor.
 */
const CANVAS_CARD_MAX_REM = 40;

/**
 * Share of the available width the aligned composition widths take, from `lg` up.
 *
 * The rem cap on its own was why "Composition width" did nothing: at three columns it works out to
 * 128rem / 2048px, so on every ordinary monitor the capped grid was already narrower than its cap
 * and `left`/`center`/`right` rendered pixel-identical to `full`. This percentage is what leaves
 * real slack for the block to sit inside, at any column count; the rem cap still takes over past
 * ~2600px. Deliberately generous — the aligned widths are a placement choice, not a narrow column.
 */
const CANVAS_ALIGNED_WIDTH_PCT = 76;

function canvasOffset(slot: number): number {
  return CANVAS_OFFSET_PATTERN[slot % CANVAS_OFFSET_PATTERN.length];
}
function canvasAspect(slot: number): string {
  return CANVAS_ASPECT_PATTERN[slot % CANVAS_ASPECT_PATTERN.length];
}
function canvasParallaxPx(slot: number): number {
  return CANVAS_PARALLAX_PATTERN[slot % CANVAS_PARALLAX_PATTERN.length];
}

function canvasBlockAlignClass(align: PortfolioTeamFloatAlign): string {
  if (align === 'left') return 'mr-auto';
  if (align === 'right') return 'ml-auto';
  if (align === 'full') return '';
  return 'mx-auto';
}

function canvasColumnsClass(columns: PortfolioTeamRailColumns): string {
  if (columns === 2) return 'sm:grid-cols-2';
  if (columns === 4) return 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return 'sm:grid-cols-2 lg:grid-cols-3';
}

/**
 * The cap the three aligned composition widths sit inside — the smaller of the rem ceiling and a
 * share of the available width, so one of the two always bites and the placement is always visible.
 *
 * It is applied through a CSS variable behind an `lg:` prefix, never as a plain inline `max-width`:
 * below `lg` the composition remains full width so tablets and phones keep readable tracks.
 */
function canvasAlignedMaxWidth(columns: PortfolioTeamRailColumns): string {
  const remCap = columns * CANVAS_CARD_MAX_REM + (columns - 1) * 4;
  return `min(${remCap}rem, ${CANVAS_ALIGNED_WIDTH_PCT}%)`;
}

/** Role, name + micro social icons, and the plate index standing in for a location field this
 *  data model has no equivalent of — always the far element in the row, flanking the name.
 *
 *  The hairline always sits on the edge facing the portrait, so the rule reads as a bracket
 *  closing the caption onto its own face rather than as a divider between two cards. */
function CanvasCaption({
  member,
  presentation,
  memberIndex,
  textAbove,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  memberIndex: number;
  textAbove: boolean;
}) {
  const surface = presentation.teamPalette?.fond ?? (presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#fff');
  const readable = { strong: readableMix(presentation.nameColor, 100, surface), muted: readableMix(presentation.responsibilityColor, 100, surface) };
  const hasSocials = presentation.showSocials && (member.socialLinks ?? []).some((link) => link.url.trim());
  const rule = (
    <span
      aria-hidden
      className="block h-px w-full"
      style={{ background: `linear-gradient(to right, ${presentation.teamPalette?.principal ?? presentation.socialIconColor} 0 22px, ${presentation.cardBorderColor} 22px)` }}
    />
  );
  return (
    <div className="team-canvas-caption flex min-w-0 flex-col gap-3">
      {textAbove ? null : rule}
      {presentation.showResponsibility && member.responsibility.trim() ? (
        <span className="text-[calc(0.875rem*var(--pf-team-font-scale,1))] font-normal leading-relaxed [overflow-wrap:anywhere]" style={{ color: readable.muted }}>
          {member.responsibility}
        </span>
      ) : null}
      <div className="flex w-full min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          {presentation.showName ? (
            <h3
              className="min-w-0 w-full [overflow-wrap:anywhere] font-serif text-[calc(clamp(1.3rem,1.7vw,1.9rem)*var(--pf-team-font-scale,1))] font-medium leading-[1.25] tracking-[-0.02em]"
              style={{ color: readable.strong }}
            >
              {member.name}
            </h3>
          ) : null}
          {hasSocials ? (
            /* Separate links from the name so neither is squeezed or truncated. */
            <TeamSocialLinks
              member={member}
              presentation={{ ...presentation, socialIconSize: 'md', socialIconStyle: 'minimal', socialIconColor: readableMix(presentation.socialIconColor, 100, surface) }}
              align="justify-start"
              glyphSizeClass="h-[1.15rem] w-[1.15rem]"
            />
          ) : null}
        </div>
        <span className={`${META_CLS} shrink-0`} style={{ color: readable.muted }} aria-hidden>
          {teamIndexLabel(memberIndex)}
        </span>
      </div>
      {textAbove ? rule : null}
    </div>
  );
}

/** The pure-text slot: a paragraph standing in place of a portrait, rhythming the composition.
 *
 *  The kicker is the owner's own words (`canvasEditorialLabel`); the em rule in front of it belongs
 *  to the design, so a custom label never has to carry the typography itself. Left empty it falls
 *  back to the built-in line rather than collapsing — the slot needs its kicker to read as a note
 *  rather than as a stray paragraph. */
function TeamCanvasEditorial({ presentation }: { presentation: PortfolioTeamPresentationSettings }) {
  const surface = presentation.teamPalette?.fond ?? (presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#fff');
  const readable = { strong: readableMix(presentation.nameColor, 100, surface), muted: readableMix(presentation.responsibilityColor, 100, surface) };
  const t = useT();
  const text = presentation.canvasEditorialText.trim() || t(DEFAULT_EDITORIAL_TEXT);
  const label = (presentation.canvasEditorialLabel ?? '').trim() || t(DEFAULT_EDITORIAL_LABEL);
  return (
    <div className="flex h-full min-h-[10rem] flex-col justify-center gap-5 py-6" data-team-reveal="">
      <span className={META_CLS} style={{ color: readable.muted }}>
        — {label}
      </span>
      <p
        className="max-w-[26rem] font-serif text-[calc(clamp(1.2rem,1.7vw,1.7rem)*var(--pf-team-font-scale,1))] font-medium leading-[1.4] tracking-[-0.01em]"
        style={{ color: readable.strong }}
      >
        {text}
      </p>
    </div>
  );
}

function TeamCanvasCard({
  member,
  presentation,
  memberIndex,
  slot,
  textAbove,
  imageSizes,
  portrait,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  memberIndex: number;
  /** Position in the composition, not in the roster — the drift cycles on the canvas' rhythm. */
  slot: number;
  textAbove: boolean;
  imageSizes: string;
  portrait?: ReactNode;
}) {
  const caption = (
    <CanvasCaption
      member={member}
      presentation={presentation}
      memberIndex={memberIndex}
      textAbove={textAbove}
    />
  );
  return (
    <article className="group flex w-full min-w-0 flex-col" data-team-reveal="">
      {/* The parallax wrapper is its own node, never the reveal or media one: the shared entrance
          clears its inline transform by name once it settles, which would take a scroll-driven
          transform on the same element down with it. */}
      {/* Intra-card gap, deliberately a fraction of the grid's row gap — the pair only reads as a
          pair as long as that ratio holds. */}
      <div
        className="flex flex-col gap-3"
        data-pf-canvas-parallax={slot}
        data-pf-no-color-transition=""
      >
        {textAbove ? caption : null}
        {presentation.showImage ? (
          <div className={`relative w-full overflow-hidden ${canvasAspect(memberIndex)}`}>
            {portrait ?? <TeamMemberImage
              member={member}
              presentation={{ ...presentation, imageFit: 'cover' }}
              fill
              reveal
              sizes={imageSizes}
            />}
          </div>
        ) : null}
        {textAbove ? null : caption}
      </div>
    </article>
  );
}

type CanvasItem =
  | { kind: 'member'; member: ProfileTeamMember; memberIndex: number }
  | { kind: 'editorial' };

export function TeamFloatingCanvas({
  members,
  presentation,
  renderPortrait,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
  /** Kept for caller compatibility; the parent now owns the global content gutter. */
  contentGutter?: PortfolioContentGutter;
  renderPortrait?: (member: ProfileTeamMember, index: number) => ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const columns = Math.min(presentation.canvasColumns ?? 3, Math.max(2, members.length)) as PortfolioTeamRailColumns;
  const align = presentation.canvasAlign ?? 'center';
  const parallaxOn = presentation.canvasParallax !== false;
  // Lazy images use their measured slot via sizes="auto" where supported. These viewport
  // bounds remain safe on older browsers and follow the grid's actual column breakpoints.
  const imageSizes = `(max-width: 639px) 100vw, (max-width: 1023px) 50vw, ${
    columns === 2 ? '50vw' : columns === 4 ? '(max-width: 1279px) 33.34vw, 25vw' : '33.34vw'
  }`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !parallaxOn) return undefined;
    // Rebuild/revert on viewport and reduced-motion changes, not only at initial mount.
    return runTeamDesignMotion(
      root,
      'Team floating canvas',
      (_observers) => {
        const media = gsap.matchMedia();
        media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-pf-canvas-parallax]'));
        cards.forEach((card) => {
          // The slot comes off the element, not off this list's index: the editorial slot drifts
          // too, so a filtered index would no longer line up with the composition's rhythm.
          const depth = canvasParallaxPx(Number(card.dataset.pfCanvasParallax) || 0);
          gsap.fromTo(
            card,
            { y: -depth },
            {
              y: depth,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            }
          );
        });
        });
        return () => media.revert();
      },
      '[data-pf-canvas-parallax]'
    );
  }, [parallaxOn, members.length, columns, presentation.showImage]);

  if (members.length === 0) return null;

  // The editorial slot lands mid-roster — a rest beat in the rhythm — and only when there is
  // enough of a roster either side of it for the insertion to read as composition, not padding.
  const midpoint = Math.floor(members.length / 2);
  const items: CanvasItem[] = [];
  members.forEach((member, memberIndex) => {
    if (memberIndex === midpoint && members.length > 2) items.push({ kind: 'editorial' });
    items.push({ kind: 'member', member, memberIndex });
  });

  return (
    <div
      ref={rootRef}
      className="team-floating-canvas w-full min-w-0"
    >
      <div
        className={`grid w-full grid-cols-1 items-start gap-x-8 gap-y-14 sm:gap-y-20 lg:gap-x-12 lg:gap-y-24 ${canvasColumnsClass(
          columns
        )} ${canvasBlockAlignClass(align)} ${
          align === 'full' ? '' : 'lg:[max-width:var(--pf-canvas-max)]'
        }`}
        style={{ '--pf-canvas-max': canvasAlignedMaxWidth(columns) } as CSSProperties}
      >
        {items.map((item, slot) =>
          item.kind === 'editorial' ? (
            <div
              key="editorial"
              style={{ '--pf-canvas-offset': `${canvasOffset(slot)}rem` } as CSSProperties}
              className="min-w-0 lg:[margin-top:var(--pf-canvas-offset)]"
            >
              <div
                data-pf-canvas-parallax={slot}
                data-pf-no-color-transition=""
                className="h-full"
              >
                <TeamCanvasEditorial presentation={presentation} />
              </div>
            </div>
          ) : (
            <div
              key={item.member.id}
              style={{ '--pf-canvas-offset': `${canvasOffset(slot)}rem` } as CSSProperties}
              className="lg:[margin-top:var(--pf-canvas-offset)]"
            >
              <TeamCanvasCard
                member={item.member}
                presentation={presentation}
                memberIndex={item.memberIndex}
                slot={slot}
                textAbove={slot % 2 === 0}
                imageSizes={imageSizes}
                portrait={renderPortrait?.(item.member, item.memberIndex)}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
