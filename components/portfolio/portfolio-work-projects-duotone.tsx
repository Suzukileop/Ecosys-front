'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsDuotoneSlideNavStyle,
  PortfolioWorkProjectsDuotoneThumbnailEffect,
  PortfolioWorkProjectsDuotoneThumbnailHeight,
  PortfolioWorkProjectsDuotoneVerticalGap,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_DUOTONE_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsDuotoneSettings,
} from '@/components/portfolio/portfolio-work-settings';

const DUOTONE_SERIF = "'Fraunces', serif";
const DUOTONE_SANS = "'Inter', sans-serif";

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function workRoleLabel(item: MarketplaceContentItem): string {
  const role = item.role?.trim();
  if (role) return role;
  if (!item.category?.trim() && item.genre?.trim()) return item.genre.trim();
  return '';
}

function workDuotoneMetaLine(item: MarketplaceContentItem): string {
  const role = workRoleLabel(item);
  const category = item.category?.trim() || '';
  return [role, category].filter(Boolean).join('  ·  ');
}

function workDuotoneThumbnailAspectRatio(height: PortfolioWorkProjectsDuotoneThumbnailHeight): string {
  switch (height) {
    case 'sm':
      return '16 / 9';
    case 'lg':
      return '1 / 1';
    default:
      return '4 / 3';
  }
}

function workDuotoneThumbnailMaxHeight(height: PortfolioWorkProjectsDuotoneThumbnailHeight): string {
  switch (height) {
    case 'sm':
      return '32vh';
    case 'lg':
      return '52vh';
    default:
      return '42vh';
  }
}

function workDuotoneStickyLeftGapClass(gap: PortfolioWorkProjectsDuotoneVerticalGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-7 sm:gap-10';
    case 'lg':
      return 'gap-14 sm:gap-20';
    case 'xl':
      return 'gap-16 sm:gap-24';
    default:
      return 'gap-10 sm:gap-14';
  }
}

function workDuotoneEditorialSpacing(
  flushTop: boolean,
  gap: PortfolioWorkProjectsDuotoneVerticalGap
): { stackMt: string; stackGap: string; stackPt: string } {
  if (flushTop) {
    switch (gap) {
      case 'sm':
        return { stackMt: 'mt-9', stackGap: 'gap-5', stackPt: 'pt-6' };
      case 'lg':
        return { stackMt: 'mt-14', stackGap: 'gap-10', stackPt: 'pt-10' };
      case 'xl':
        return { stackMt: 'mt-16', stackGap: 'gap-12', stackPt: 'pt-12' };
      default:
        return { stackMt: 'mt-11', stackGap: 'gap-8', stackPt: 'pt-8' };
    }
  }
  switch (gap) {
    case 'sm':
      return { stackMt: 'mt-7', stackGap: 'gap-4', stackPt: 'pt-5' };
    case 'lg':
      return { stackMt: 'mt-11', stackGap: 'gap-8', stackPt: 'pt-8' };
    case 'xl':
      return { stackMt: 'mt-14', stackGap: 'gap-10', stackPt: 'pt-10' };
    default:
      return { stackMt: 'mt-9', stackGap: 'gap-6', stackPt: 'pt-7' };
  }
}

function workDuotoneScrollTitleThumbGapClass(gap: PortfolioWorkProjectsDuotoneVerticalGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-y-6 sm:gap-y-8';
    case 'lg':
      return 'gap-y-10 sm:gap-y-14';
    case 'xl':
      return 'gap-y-12 sm:gap-y-16';
    default:
      return 'gap-y-8 sm:gap-y-10';
  }
}

function workDuotoneScrollRoleStackClass(gap: PortfolioWorkProjectsDuotoneVerticalGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-20 sm:gap-24';
    case 'lg':
      return 'gap-32 sm:gap-40';
    case 'xl':
      return 'gap-40 sm:gap-52';
    default:
      return 'gap-24 sm:gap-32';
  }
}

function workDuotoneStickySectionVh(gap: PortfolioWorkProjectsDuotoneVerticalGap): number {
  switch (gap) {
    case 'sm':
      return 92;
    case 'lg':
      return 112;
    case 'xl':
      return 124;
    default:
      return 100;
  }
}

function WorkDuotoneChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-7 w-7" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M10 3.5 5 8l5 4.5' : 'M6 3.5 11 8l-5 4.5'}
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WorkDuotoneLinkButton({ href, ink }: { href: string; ink: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold underline-offset-4 hover:underline"
      style={{ color: ink, fontFamily: DUOTONE_SANS }}
    >
      View project
      <span aria-hidden>→</span>
    </a>
  );
}

function WorkDuotoneIntroPanel({ ink, muted, accent }: { ink: string; muted: string; accent: string }) {
  return (
    <div className="flex w-full flex-col pt-[20vh] pb-[5vh] max-[800px]:pt-16 max-[800px]:pb-6">
      <span className="text-[0.85rem] font-semibold" style={{ color: accent, fontFamily: DUOTONE_SANS }}>
        Portfolio
      </span>
      <h2
        className="mt-3 max-w-[16ch] text-[clamp(2.6rem,6vw,5.2rem)]"
        style={{
          color: ink,
          fontFamily: DUOTONE_SERIF,
          fontWeight: 440,
          lineHeight: 1.08,
          letterSpacing: '-0.015em',
        }}
      >
        Selected work, one project at a time.
      </h2>
      <p className="mt-3 max-w-[34rem] text-[1.1rem]" style={{ color: muted, fontFamily: DUOTONE_SANS }}>
        A closer look at a few recent projects.
      </p>
    </div>
  );
}

function WorkDuotoneLeftPanel({
  item,
  ink,
  muted,
  border,
  registerRef,
  showTitle = true,
  naturalHeight = false,
  premium = false,
  accent,
  thumbnailEffect = 'grayscale',
  thumbnailHeight = 'md',
  verticalGap,
  inView = false,
  scrollPart = 'all',
}: {
  item: MarketplaceContentItem;
  ink: string;
  muted: string;
  border: string;
  registerRef?: (el: HTMLElement | null) => void;
  showTitle?: boolean;
  /** Size to content instead of forcing min-h-screen — Slide's frame is shorter than a
   *  full viewport and vertically centered within it. */
  naturalHeight?: boolean;
  /** Sticky / Scroll modes only: massive title, thumbnail as its own block below it,
   *  no divider, no meta line (meta moves into the right panel there instead). */
  premium?: boolean;
  /** Only needed for the 'tint' thumbnail effect. */
  accent?: string;
  thumbnailEffect?: PortfolioWorkProjectsDuotoneThumbnailEffect;
  thumbnailHeight?: PortfolioWorkProjectsDuotoneThumbnailHeight;
  /** Sticky mode only — drives title ↔ media vertical air. */
  verticalGap?: PortfolioWorkProjectsDuotoneVerticalGap;
  /** Sticky mode: this panel is the centered active project — drives the image reveal. */
  inView?: boolean;
  scrollPart?: 'all' | 'title' | 'thumb';
}) {
  const title = item.title?.trim() || 'Untitled';
  const metaLine = workDuotoneMetaLine(item);
  const mediaUrl = premium ? item.mediaUrl?.trim() || '' : '';
  const showTitleBlock = scrollPart !== 'thumb' && showTitle && Boolean(title);
  const showThumbBlock = scrollPart !== 'title' && premium && Boolean(mediaUrl);
  const premiumGapClass =
    premium && scrollPart === 'all'
      ? verticalGap
        ? workDuotoneStickyLeftGapClass(verticalGap)
        : 'gap-10 sm:gap-14'
      : '';
  const panelMinHeight =
    !naturalHeight && verticalGap && scrollPart === 'all'
      ? `${workDuotoneStickySectionVh(verticalGap)}vh`
      : undefined;

  const titleNode = showTitleBlock ? (
    <h3
      data-pf-no-color-transition=""
      className="pf-duotone-left-title max-[800px]:text-[1.9rem]"
      style={{
        color: ink,
        fontFamily: DUOTONE_SERIF,
        fontWeight: premium ? 400 : 640,
        lineHeight: premium ? 0.95 : 1.08,
        letterSpacing: '-0.02em',
        fontSize: premium ? 'clamp(3rem, 6vw, 5.5rem)' : 'clamp(2rem, 3vw, 3.1rem)',
      }}
    >
      {title}
    </h3>
  ) : null;

  const thumbNode = showThumbBlock ? (
    <div
      className="pf-duotone-thumb-frame relative w-full shrink-0 overflow-hidden"
      style={{
        aspectRatio: workDuotoneThumbnailAspectRatio(thumbnailHeight),
        maxHeight: workDuotoneThumbnailMaxHeight(thumbnailHeight),
      }}
    >
      <div data-pf-no-color-transition="" className="pf-duotone-thumb-reveal absolute inset-0 origin-center">
        {/* Zoom on this wrapper, not <Image> — color-mode transition overrides can't strip a
         *  transform living here since it's opted out via data-pf-no-color-transition. */}
        <div data-pf-no-color-transition="" className="pf-duotone-thumb-zoom relative h-full w-full">
          <Image
            src={mediaUrl}
            alt={title}
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
            className={thumbnailEffect === 'none' ? 'object-cover' : 'pf-duotone-media-filter object-cover'}
          />
        </div>
        {thumbnailEffect === 'tint' ? (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: accent, mixBlendMode: 'color', opacity: 0.65 }}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  ) : null;

  if (scrollPart === 'title') {
    return titleNode ? (
      <div ref={registerRef} data-pf-no-color-transition="" className="pf-duotone-left-panel w-full">
        {titleNode}
      </div>
    ) : (
      <div ref={registerRef} className="hidden" />
    );
  }

  if (scrollPart === 'thumb') {
    return thumbNode ? (
      <div data-pf-no-color-transition="" data-in-view="true" className="pf-duotone-left-panel w-full">
        {thumbNode}
      </div>
    ) : null;
  }

  return (
    <div
      ref={registerRef}
      data-pf-no-color-transition=""
      data-in-view={premium && inView ? 'true' : 'false'}
      className={`pf-duotone-left-panel relative flex w-full flex-col justify-center overflow-hidden max-[800px]:min-h-0 ${
        naturalHeight || panelMinHeight ? '' : 'min-h-screen'
      } ${premiumGapClass}`}
      style={panelMinHeight ? { minHeight: panelMinHeight } : undefined}
    >
      {titleNode}
      {thumbNode}

      {!premium ? (
        <div className="my-4 h-px w-full shrink-0" style={{ backgroundColor: border }} aria-hidden />
      ) : null}

      {!premium && metaLine ? (
        <p className="text-[0.95rem]" style={{ color: muted, fontFamily: DUOTONE_SANS }}>
          {metaLine}
        </p>
      ) : null}
    </div>
  );
}

function WorkDuotoneToolTags({ tools, muted }: { tools: string[]; muted: string }) {
  if (tools.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((tool) => (
        <span
          key={tool}
          className="rounded-none border px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.04em]"
          style={{ borderColor: `color-mix(in srgb, ${muted} 45%, transparent)`, color: muted }}
        >
          {tool}
        </span>
      ))}
    </div>
  );
}

function WorkDuotoneRightPanel({
  item,
  ink,
  muted,
  accent,
  border,
  background,
  active,
  className = '',
  enhanced = false,
  showDescription = true,
  showTools = true,
  showProof = true,
  premium = false,
  verticalGap,
  lane = 'active',
  flushTop = false,
}: {
  item: MarketplaceContentItem;
  ink: string;
  muted: string;
  accent: string;
  border: string;
  background: string;
  active?: boolean;
  /** Extra classes for the plain (active === undefined) layout only. */
  className?: string;
  /** Slide-mode-only polish: card depth. Off elsewhere. */
  enhanced?: boolean;
  showDescription?: boolean;
  showTools?: boolean;
  showProof?: boolean;
  /** Sticky / Scroll modes only: squared stack chips and a horizontal meta row (moved
   *  here from the left panel) instead of the plain card layout. */
  premium?: boolean;
  /** Sticky mode only — vertical editorial rhythm between description / stack. */
  verticalGap?: PortfolioWorkProjectsDuotoneVerticalGap;
  /** Sticky fade direction: above = already scrolled past, below = still ahead. */
  lane?: 'active' | 'above' | 'below';
  /** Scroll mode: drop top padding so editorial top edges align with the thumbnail. */
  flushTop?: boolean;
}) {
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item);
  const href = item.linkUrl?.trim() || null;
  const metaLine = workDuotoneMetaLine(item);
  const displayDescription = showDescription ? description : null;
  const displayTools = showTools ? tools : [];
  const repoLink = showProof ? href : null;
  const hasMetaRow = premium && Boolean(metaLine);
  const cardBg = `color-mix(in srgb, ${ink} 4%, ${background})`;
  const spacing = workDuotoneEditorialSpacing(Boolean(flushTop), verticalGap ?? 'md');
  const stackMtClass = verticalGap || flushTop ? spacing.stackMt : 'mt-9';
  const stackGapClass = verticalGap || flushTop ? spacing.stackGap : 'gap-6';
  const stackPtClass = verticalGap || flushTop ? spacing.stackPt : 'pt-7';

  return (
    <div
      data-pf-no-color-transition=""
      data-active={active === undefined ? undefined : active ? 'true' : 'false'}
      data-lane={active === undefined ? undefined : lane}
      className={
        active === undefined
          ? `flex w-full flex-col justify-center ${className}`
          // No extra left padding here on top of the column gap — that stacks with the flex
          // gap between the two columns and blows the middle gutter out past Scroll mode's.
          : 'pf-duotone-right-panel absolute inset-0 flex flex-col justify-center translate-y-8 lg:translate-y-12 xl:translate-y-16'
      }
      aria-hidden={active === false}
    >
      <div
        className={
          premium
            ? // No left inset (top/right/bottom only) — same reasoning as the outer wrapper.
              `w-full ${flushTop ? 'p-0' : 'pt-10 pr-10 pb-10 max-[800px]:p-6'}`
            : `w-full rounded-[14px] border p-10 max-[800px]:p-6 ${enhanced ? 'transition-shadow duration-300' : ''}`
        }
        style={
          premium
            ? undefined
            : {
                backgroundColor: cardBg,
                borderColor: border,
                boxShadow: enhanced ? '0 8px 20px -14px rgba(0,0,0,0.35)' : undefined,
              }
        }
      >
        {(() => {
          const animate = active !== undefined;
          const layerProps = (index: 0 | 1, extraClass = '') =>
            animate
              ? {
                  'data-pf-no-color-transition': '' as const,
                  'data-layer': String(index),
                  className: `pf-duotone-story-layer${extraClass ? ` ${extraClass}` : ''}`,
                }
              : { className: extraClass || undefined };

          return (
            <>
              {hasMetaRow ? (
                <div {...layerProps(0, 'mb-8')}>
                  <span className="text-[0.85rem]" style={{ color: muted, fontFamily: DUOTONE_SANS }}>
                    {metaLine}
                  </span>
                </div>
              ) : null}

              {displayDescription ? (
                <div {...layerProps(1)}>
                  <p
                    className={
                      premium
                        ? 'max-w-[38ch] text-[1.02rem] leading-[2.3]'
                        : 'text-[1.02rem] leading-[1.85]'
                    }
                    style={{ color: ink, fontFamily: DUOTONE_SANS }}
                  >
                    {displayDescription}
                  </p>
                </div>
              ) : null}
            </>
          );
        })()}

        {premium ? (
          displayTools.length > 0 || repoLink ? (
            <div
              data-pf-no-color-transition=""
              data-layer={active !== undefined ? '2' : undefined}
              className={`${active !== undefined ? 'pf-duotone-story-layer ' : ''}pf-duotone-chrome ${stackMtClass} flex flex-col ${stackGapClass} border-t ${stackPtClass}`}
              style={{ borderColor: `color-mix(in srgb, ${muted} 12%, transparent)` }}
            >
              <WorkDuotoneToolTags tools={displayTools} muted={muted} />
              {repoLink ? <WorkDuotoneLinkButton href={repoLink} ink={accent} /> : null}
            </div>
          ) : null
        ) : (
          <>
            {displayTools.length > 0 ? (
              <div className="mt-9">
                <WorkDuotoneToolTags tools={displayTools} muted={muted} />
              </div>
            ) : null}
            {repoLink ? (
              <div className="mt-9">
                <WorkDuotoneLinkButton href={repoLink} ink={accent} />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/** Duotone "Scroll" mode — plain stack, no pinning; each project and its story move together. */
function WorkDuotoneScrollRoles({
  items,
  ink,
  muted,
  accent,
  border,
  background,
  thumbnailEffect,
  thumbnailHeight,
  swapSides = false,
  alternateSides = false,
  verticalGap = 'md',
  fullWidthTitle = false,
}: {
  items: MarketplaceContentItem[];
  ink: string;
  muted: string;
  accent: string;
  border: string;
  background: string;
  thumbnailEffect: PortfolioWorkProjectsDuotoneThumbnailEffect;
  thumbnailHeight: PortfolioWorkProjectsDuotoneThumbnailHeight;
  swapSides?: boolean;
  alternateSides?: boolean;
  verticalGap?: PortfolioWorkProjectsDuotoneVerticalGap;
  fullWidthTitle?: boolean;
}) {
  const titleThumbRowGap = workDuotoneScrollTitleThumbGapClass(verticalGap);
  const roleStackGap = workDuotoneScrollRoleStackClass(verticalGap);
  return (
    <div className={`flex w-full flex-col ${roleStackGap}`}>
      {items.map((item, index) => {
        const flipped = alternateSides && index % 2 === 1;
        const infoFirst = flipped ? !swapSides : swapSides;
        const mediaCol = infoFirst ? 2 : 1;
        const infoCol = infoFirst ? 1 : 2;
        return (
          <div
            key={item.id}
            className={`grid w-full items-start gap-x-14 lg:gap-x-20 xl:gap-x-28 ${titleThumbRowGap}`}
            style={{
              gridTemplateColumns: infoFirst
                ? 'minmax(0,0.95fr) minmax(0,1.1fr)'
                : 'minmax(0,1.1fr) minmax(0,0.95fr)',
            }}
          >
            <div
              className="w-full"
              style={
                fullWidthTitle
                  ? { gridColumn: '1 / -1', gridRow: 1 }
                  : { gridColumn: mediaCol, gridRow: 1 }
              }
            >
              <WorkDuotoneLeftPanel
                item={item}
                ink={ink}
                muted={muted}
                border={border}
                premium
                accent={accent}
                thumbnailEffect={thumbnailEffect}
                thumbnailHeight={thumbnailHeight}
                naturalHeight
                scrollPart="title"
              />
            </div>
            <div className="w-full self-start" style={{ gridColumn: mediaCol, gridRow: 2 }}>
              <WorkDuotoneLeftPanel
                item={item}
                ink={ink}
                muted={muted}
                border={border}
                premium
                accent={accent}
                thumbnailEffect={thumbnailEffect}
                thumbnailHeight={thumbnailHeight}
                naturalHeight
                scrollPart="thumb"
              />
            </div>
            <div
              className="min-w-0 w-full self-start mt-10 lg:mt-16 xl:mt-24"
              style={{ gridColumn: infoCol, gridRow: 2 }}
            >
              <WorkDuotoneRightPanel
                item={item}
                ink={ink}
                muted={muted}
                accent={accent}
                border={border}
                background={background}
                premium
                flushTop
                verticalGap={verticalGap}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WorkDuotoneSlideNav({
  navStyle,
  items,
  activeIndex,
  accent,
  border,
  onNavigate,
}: {
  navStyle: PortfolioWorkProjectsDuotoneSlideNavStyle;
  items: MarketplaceContentItem[];
  activeIndex: number;
  accent: string;
  border: string;
  onNavigate: (index: number) => void;
}) {
  if (navStyle === 'text') {
    const linkClass = 'group relative text-[0.85rem] font-semibold disabled:opacity-30 disabled:after:hidden';
    const underline = (
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 h-px w-0 transition-[width] duration-200 ease-out group-hover:w-full"
        data-pf-no-color-transition=""
        style={{ backgroundColor: accent }}
      />
    );
    return (
      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Previous project"
          disabled={activeIndex === 0}
          onClick={() => onNavigate(activeIndex - 1)}
          className={linkClass}
          style={{ color: accent, fontFamily: DUOTONE_SANS }}
        >
          Previous
          {underline}
        </button>
        <span className="h-4 w-px" style={{ backgroundColor: border }} aria-hidden />
        <button
          type="button"
          aria-label="Next project"
          disabled={activeIndex === items.length - 1}
          onClick={() => onNavigate(activeIndex + 1)}
          className={linkClass}
          style={{ color: accent, fontFamily: DUOTONE_SANS }}
        >
          Next
          {underline}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Previous project"
        disabled={activeIndex === 0}
        onClick={() => onNavigate(activeIndex - 1)}
        className="flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,opacity,transform] duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
        data-pf-no-color-transition=""
        style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = `color-mix(in srgb, ${accent} 22%, transparent)`;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = `color-mix(in srgb, ${accent} 12%, transparent)`;
        }}
      >
        <WorkDuotoneChevronIcon direction="left" />
      </button>
      <button
        type="button"
        aria-label="Next project"
        disabled={activeIndex === items.length - 1}
        onClick={() => onNavigate(activeIndex + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,opacity,transform] duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
        data-pf-no-color-transition=""
        style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = `color-mix(in srgb, ${accent} 22%, transparent)`;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = `color-mix(in srgb, ${accent} 12%, transparent)`;
        }}
      >
        <WorkDuotoneChevronIcon direction="right" />
      </button>
    </div>
  );
}

/** Duotone "Slide" mode — one project at a time, chevrons top-right, smooth horizontal slide. */
function WorkDuotoneSlideRoles({
  items,
  ink,
  muted,
  accent,
  border,
  background,
  activeIndex,
  onNavigate,
  navStyle,
  frameBorderColor,
  frameRadiusPx,
  autoAdvance = false,
}: {
  items: MarketplaceContentItem[];
  ink: string;
  muted: string;
  accent: string;
  border: string;
  background: string;
  activeIndex: number;
  onNavigate: (index: number) => void;
  navStyle: PortfolioWorkProjectsDuotoneSlideNavStyle;
  frameBorderColor: string | null;
  frameRadiusPx: number;
  autoAdvance?: boolean;
}) {
  const frameStyle = frameBorderColor
    ? {
        border: `1px solid ${frameBorderColor}`,
        borderRadius: frameRadiusPx,
        padding: '1.75rem',
        backgroundColor: `color-mix(in srgb, ${ink} 3%, ${background})`,
      }
    : undefined;
  const frameInset = frameStyle ? '1.75rem' : '0px';

  const [frameHovered, setFrameHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!autoAdvance || frameHovered || reduceMotion === true || items.length <= 1) return;
    const id = window.setInterval(() => {
      onNavigate((activeIndex + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [autoAdvance, frameHovered, reduceMotion, activeIndex, items.length, onNavigate]);

  return (
    <div className="relative w-full">
      <div className="mb-4 flex w-full justify-end">
        <WorkDuotoneSlideNav
          navStyle={navStyle}
          items={items}
          activeIndex={activeIndex}
          accent={accent}
          border={border}
          onNavigate={onNavigate}
        />
      </div>

      <div className="relative w-full">
        <div
          className="pointer-events-none absolute z-20 flex items-baseline gap-1.5"
          style={{ left: frameInset, bottom: frameInset }}
        >
          <span className="text-[0.78rem] font-semibold tracking-[0.06em]" style={{ color: accent, fontFamily: DUOTONE_SANS }}>
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-[0.78rem] tracking-[0.06em]" style={{ color: muted, fontFamily: DUOTONE_SANS }}>
            / {String(items.length).padStart(2, '0')}
          </span>
        </div>

        <div
          className="box-border w-full"
          style={frameStyle}
          onMouseEnter={() => setFrameHovered(true)}
          onMouseLeave={() => setFrameHovered(false)}
        >
          <div className="overflow-hidden">
            <div className="grid w-full grid-cols-1 items-stretch">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="col-start-1 row-start-1 flex min-h-0 w-full items-stretch justify-center"
                  style={{
                    transform: `translateX(${(index - activeIndex) * 100}%)`,
                    opacity: index === activeIndex ? 1 : 0.4,
                    pointerEvents: index === activeIndex ? 'auto' : 'none',
                    transition: 'transform 650ms cubic-bezier(0.65, 0, 0.35, 1), opacity 500ms ease',
                    willChange: 'transform',
                  }}
                >
                  <div className="flex h-full min-h-0 w-full">
                    <div className="flex w-[50%] shrink-0 flex-col pr-6">
                      <div className="flex flex-1 flex-col justify-center">
                        <WorkDuotoneLeftPanel item={item} ink={ink} muted={muted} border={border} naturalHeight />
                      </div>
                    </div>
                    <div className="flex w-[50%] flex-1 flex-col justify-center">
                      <WorkDuotoneRightPanel
                        item={item}
                        ink={ink}
                        muted={muted}
                        accent={accent}
                        border={border}
                        background={background}
                        enhanced
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Duotone — split 50/50 layout, one flat background. Three scroll modes on desktop:
 *  Sticky (story panel pinned, crossfades as you scroll the project list), Scroll (plain,
 *  no pinning), Slide (one project at a time, chevron-navigated). Mobile always uses the
 *  simple stacked layout regardless of the chosen mode — same visual language as the
 *  Experience section's "Duotone" design. */
export function ProjectsDuotoneGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const settings = mergeProjectsDuotoneSettings(
    DEFAULT_PROJECTS_DUOTONE_SETTINGS,
    presentation.projectsDuotone
  );
  const scrollMode = settings.scrollMode;
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (scrollMode !== 'sticky') return;
    const sections = sectionRefs.current.filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;
    // Center-band observer: switch projects when a left panel owns the middle of the
    // viewport, with fine thresholds so the handoff stays smooth instead of snapping.
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const entryIndex = sections.indexOf(entry.target as HTMLElement);
          if (entryIndex === -1) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index: entryIndex, ratio: entry.intersectionRatio };
          }
        }
        if (best) {
          setActiveIndex((current) => (current === best!.index ? current : best!.index));
        }
      },
      { threshold: [0.2, 0.35, 0.5, 0.65, 0.8], rootMargin: '-18% 0px -18% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items.length, scrollMode]);

  if (items.length === 0) return null;

  const ink = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || ink;
  const border = presentation.cardBorderColor || muted;
  const background = presentation.cardBackgroundColor || '#ffffff';

  const frameColorSetting = settings.frameColor;
  const frameRadiusSetting = settings.frameRadius;
  const frameBorderColor =
    frameColorSetting === 'none' ? null : frameColorSetting === 'muted' ? muted : border;
  const frameRadiusPx = frameRadiusSetting === 'none' ? 0 : frameRadiusSetting === 'lg' ? 28 : 16;

  const thumbnailEffect = settings.thumbnailEffect;
  const thumbnailHeight = settings.thumbnailHeight;
  const swapSides = settings.swapSides;
  const verticalGap = settings.verticalGap;
  const stickySectionVh = workDuotoneStickySectionVh(verticalGap);

  return (
    <div className="relative isolate w-full">
      {/* Desktop: optional intro screen, then the selected scroll mode. */}
      <div className="relative z-[1] flex w-full flex-col max-[800px]:hidden">
        {settings.showIntro ? <WorkDuotoneIntroPanel ink={ink} muted={muted} accent={accent} /> : null}
        {scrollMode === 'scroll' ? (
          <div style={{ marginTop: '10vh' }}>
            <WorkDuotoneScrollRoles
              items={items}
              ink={ink}
              muted={muted}
              accent={accent}
              border={border}
              background={background}
              thumbnailEffect={thumbnailEffect}
              thumbnailHeight={thumbnailHeight}
              swapSides={swapSides}
              alternateSides={settings.alternateSides}
              verticalGap={verticalGap}
              fullWidthTitle={settings.scrollFullWidthTitle}
            />
          </div>
        ) : scrollMode === 'slide' ? (
          <WorkDuotoneSlideRoles
            items={items}
            ink={ink}
            muted={muted}
            accent={accent}
            border={border}
            background={background}
            activeIndex={activeIndex}
            onNavigate={(next) => setActiveIndex(Math.max(0, Math.min(items.length - 1, next)))}
            navStyle={settings.slideNavStyle}
            frameBorderColor={frameBorderColor}
            frameRadiusPx={frameRadiusPx}
            autoAdvance={settings.autoAdvance}
          />
        ) : (
          <div style={{ marginTop: '10vh' }}>
            {/* Explicit height (not min-height) so the sticky panel always ends exactly at
             *  the last entry, regardless of how an ancestor sizes this section. */}
            <div
              className="relative flex w-full gap-14 lg:gap-20 xl:gap-28"
              style={{ height: `${items.length * stickySectionVh}vh` }}
            >
              {(() => {
                const titleColumn = (
                  <div key="title" className="flex h-full w-[46%] shrink-0 flex-col lg:w-[48%]">
                    {items.map((item, index) => (
                      <WorkDuotoneLeftPanel
                        key={item.id}
                        item={item}
                        ink={ink}
                        muted={muted}
                        border={border}
                        registerRef={(el) => {
                          sectionRefs.current[index] = el;
                        }}
                        premium
                        accent={accent}
                        thumbnailEffect={thumbnailEffect}
                        thumbnailHeight={thumbnailHeight}
                        verticalGap={verticalGap}
                        inView={index === activeIndex}
                      />
                    ))}
                  </div>
                );
                const infoColumn = (
                  <div key="info" className="relative h-full min-w-0 flex-1">
                    <div className="sticky top-0 h-screen w-full">
                      {items.map((item, index) => (
                        <WorkDuotoneRightPanel
                          key={item.id}
                          item={item}
                          ink={ink}
                          muted={muted}
                          accent={accent}
                          border={border}
                          background={background}
                          active={index === activeIndex}
                          lane={
                            index === activeIndex
                              ? 'active'
                              : index < activeIndex
                                ? 'above'
                                : 'below'
                          }
                          premium
                          verticalGap={verticalGap}
                        />
                      ))}
                    </div>
                  </div>
                );
                return swapSides ? [infoColumn, titleColumn] : [titleColumn, infoColumn];
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: optional intro screen, then simple stacked pairs, no pinning. */}
      <div className="relative z-[1] hidden w-full flex-col max-[800px]:flex">
        {settings.showIntro ? <WorkDuotoneIntroPanel ink={ink} muted={muted} accent={accent} /> : null}
        {items.map((item) => (
          <div key={item.id} className="py-10">
            <WorkDuotoneLeftPanel item={item} ink={ink} muted={muted} border={border} />
            <WorkDuotoneRightPanel
              item={item}
              ink={ink}
              muted={muted}
              accent={accent}
              border={border}
              background={background}
              className="mt-8"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function isProjectsDuotoneDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-duotone';
}
