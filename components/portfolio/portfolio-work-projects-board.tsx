'use client';
import { workButtonColor } from './portfolio-work-button-color';
import { workPaletteTokenColor } from './portfolio-work-settings';

import Image from 'next/image';
import mediaStyles from './portfolio-work-board-media.module.css';
import ctaStyles from './portfolio-work-board-cta.module.css';
import buttonStyles from './portfolio-work-grid-cta.module.css';
import { GridButtonContent, gridButtonVars } from './portfolio-work-grid-button';
import { FramesViewCursor } from './portfolio-project-view-cursor';
import { DEFAULT_HERO_PALETTE, mergeHeroPalette, resolveHeroPaletteColor } from './portfolio-hero-palette-settings';
import { resolveSectionVisibleSurface } from './portfolio-section-color-mode';
import { readableMix } from './stack-designs/readable-ink';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsBoardThumbnailSize,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_BOARD_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
} from '@/components/portfolio/portfolio-work-settings';
import { sectionFillMode } from '@/components/portfolio/portfolio-section-color-mode';
import { useT } from '@/lib/i18n/I18nProvider';

const BOARD_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const ENTER_CARD: CSSProperties = { opacity: 0, transform: 'translateY(28px)' };

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(0, max);
}

function workRoleLabel(item: MarketplaceContentItem): string {
  return item.role?.trim() || '';
}

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  const genre = item.genre?.trim();
  const role = item.role?.trim();
  if (genre && genre !== role) return genre;
  return '';
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function boardEnterStyle(
  entered: boolean,
  hidden: CSSProperties,
  delayMs: number,
  instant: boolean
): CSSProperties {
  if (!entered) {
    return hidden;
  }
  if (instant) {
    return { opacity: 1, transform: 'translateY(0px)', transition: 'none' };
  }
  return {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: `opacity 0.8s ${BOARD_EASE} ${delayMs}ms, transform 0.95s ${BOARD_EASE} ${delayMs}ms`,
  };
}

function useBoardInView(
  rootRef: RefObject<HTMLElement | null>,
  readyKey: string | number
): { entered: boolean; instant: boolean } {
  const [entered, setEntered] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      setInstant(true);
      setEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '80px 0px' }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [readyKey]);

  return { entered, instant };
}

/** Minimalist bottom-of-card CTA: uppercase text + a 1px underline (creator's main color)
 * that grows in from the left on hover. Its ::after covers the whole card, so the card is
 * one target (the image zoom promises that) while the link stays the only focus stop.
 * Colors come from the card palette: the old fixed neutral-400 → white read ~2.3:1 on a
 * light card and vanished on hover. */
function CaseStudyLink({
  href,
  label,
  ink,
  hoverInk,
  accent,
  variant = 'underline',
  display = 'always',
  surface,
}: {
  href: string;
  label: string;
  ink: string;
  hoverInk: string;
  accent: string;
  variant?: 'underline' | 'outline' | 'solid' | 'pill';
  display?: 'always' | 'hover';
  surface: string;
}) {
  const external = /^https?:\/\//i.test(href);
  const className =
    ctaStyles.cta + ' ' + buttonStyles.cta + ' self-start';
  const style = {
    ...gridButtonVars(ink),
    '--board-cta-ink': ink,
    '--board-cta-hover': hoverInk,
    '--board-cta-accent': accent,
    '--board-cta-surface': surface,
  } as CSSProperties;

  const content = <GridButtonContent label={label}/>;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        data-pf-no-color-transition=""
        data-variant={variant} data-display={display}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style} data-pf-no-color-transition="" data-variant={variant} data-display={display}>
      {content}
    </Link>
  );
}

/** Aspect ratio only (no fixed pixel heights) so the thumbnail scales naturally with
 *  the card's fluid width at every breakpoint — matters most at 1 per row, where the
 *  card spans the full row and a fixed 3/2 ratio would otherwise look oversized. */
function boardThumbnailAspectClass(size: PortfolioWorkProjectsBoardThumbnailSize): string {
  if (size === 'compact') return 'aspect-[16/9]';
  if (size === 'large') return 'aspect-[4/3]';
  return 'aspect-[3/2]';
}

function ProjectsBoardThumbnail({
  url,
  alt,
  surface,
  size,
  interactive,
  singleColumn,
  imageFit,
}: {
  url: string | null;
  alt: string;
  surface: string;
  size: PortfolioWorkProjectsBoardThumbnailSize;
  /** Zoom on hover only when the card links somewhere: otherwise it promises a click. */
  interactive: boolean;
  singleColumn: boolean;
  imageFit: 'cover' | 'contain';
}) {
  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden ${boardThumbnailAspectClass(size)} ${singleColumn ? mediaStyles.singleColumn : ''}`}
      data-size={size}
      style={{ backgroundColor: singleColumn && imageFit === 'contain' ? 'transparent' : surface }}
    >
      {url ? (
        <Image
          src={resolveStorageMediaUrl(url)}
          alt={alt}
          fill
          sizes={singleColumn ? '100vw' : '(max-width: 1024px) 100vw, 50vw'}
          className={`${singleColumn && imageFit === 'contain' ? 'object-contain' : 'object-cover'} object-center ${
            interactive && !(singleColumn && imageFit === 'contain')
              ? 'transition-transform duration-700 ease-out will-change-transform group-hover/board-card:scale-[1.04]'
              : ''
          }`}
          data-pf-no-color-transition=""
        />
      ) : null}
      {!(singleColumn && imageFit === 'contain') ? <div
        className="pf-projects-board-overlay pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(15,15,15,0.5),rgba(15,15,15,0),transparent)]"
        aria-hidden
      /> : null}
    </div>
  );
}

function ProjectsBoardCard({
  item,
  presentation,
  index,
  entered,
  instant,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  index: number;
  entered: boolean;
  instant: boolean;
}) {
  const t = useT();
  const board = presentation.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS;
  const cardRef=useRef<HTMLElement>(null);
  const [cursorAnchor,setCursorAnchor]=useState<{x:number;y:number}|null>(null);
  const dismissCursor=useCallback(()=>setCursorAnchor(null),[]);
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const tools = workToolLabels(item, presentation.maxToolsShown ?? 12);
  const description = item.description?.trim() || '';
  const href = item.linkUrl?.trim() || null;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const showThumb = board.showThumbnail;
  const thumbnailSize = board.thumbnailSize ?? DEFAULT_PROJECTS_BOARD_SETTINGS.thumbnailSize;
  const showRole = board.showRole && Boolean(role);
  const showCategory = board.showCategory && Boolean(category);
  const showTools = presentation.showCardTools !== false && tools.length > 0;
  const showCaseStudyLink = board.showConsultOnHover && Boolean(href);
  // One flat, single-line list — role first (accent ink), everything else (category,
  // tools) grey — instead of a separate role/category row stacked on top of a tools
  // row, which read as clutter (two differently-colored rows of small caps).
  const metaItems: { text: string; accent: boolean }[] = [
    ...(showRole ? [{ text: role, accent: true }] : []),
    ...(showCategory ? [{ text: category, accent: false }] : []),
    ...(showTools ? tools.map((tool) => ({ text: tool, accent: false })) : []),
  ];
  const showMetaLine = metaItems.length > 0;
  const showBottomBlock = showMetaLine || showCaseStudyLink;

  const unframed = (board.columnsPerRow ?? 2) === 1 && board.singleColumnImageFit === 'contain' && showThumb;
  const infoTone = board.infoBackground ?? 'neutre';
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, presentation.workPalette);
  const infoOpacity=board.infoBackgroundOpacity??100;
  const infoBase=resolveHeroPaletteColor(palette,infoTone);
  const infoSurface=unframed?undefined:resolveSectionVisibleSurface({sectionBackgroundEnabled:true,sectionBackgroundFill:'solid',sectionBackgroundColor:infoBase,sectionBackgroundOpacity:infoOpacity},presentation.sectionBackgroundColor||palette.fond);
  const infoPaint=unframed?undefined:`color-mix(in srgb, ${infoBase} ${infoOpacity}%, transparent)`;
  const infoInk = infoSurface ? readableMix(presentation.titleColor, 100, infoSurface) : undefined;
  const infoMuted = infoSurface ? readableMix(presentation.subtitleColor, 100, infoSurface) : undefined;
  const accent = infoSurface ? readableMix(presentation.ctaColor || presentation.categoryActiveColor, 100, infoSurface) : presentation.ctaColor || presentation.categoryActiveColor;
  const titleColor = infoInk || presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const descriptionColor =
    infoMuted || presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const tagInk = infoMuted || presentation.elementStyles?.toolsList?.color || presentation.subtitleColor;
  const tagSurface = presentation.cardBorderColor;

  const caseStudyLabel = board.consultLabel?.trim() || t('View project');
  const enterDelay = 90 + Math.min(index, 8) * 95;
  // Asymmetric rhythm (2 per row, default): wide/high card on the left, narrower
  // card nudged down on the right — breaks the old perfectly-aligned 2-up row
  // (desktop only; mobile stays a single stacked column via the grid's base
  // grid-cols-1). 1, 3 and 4 per row use an even, non-offset grid instead — the
  // base container grid always stays 12-wide so each column-count is just a
  // col-span fraction of it (12, 6+6 is skipped in favor of the signature 7+5,
  // 4+4+4, and 3+3+3+3). 3 and 4 per row additionally ramp down responsively: 1
  // column below tablet, 2 from tablet (md), 3 from desktop (lg), 4 only from
  // large desktop (xl) — see the container's gridClass.
  const columnsPerRow = board.columnsPerRow ?? DEFAULT_PROJECTS_BOARD_SETTINGS.columnsPerRow;
  const bareImage = unframed;
  const isAsymmetric = columnsPerRow === 2;
  const isWide = isAsymmetric && index % 2 === 0;
  const spanClass =
    columnsPerRow === 1
      ? 'lg:col-span-12'
      : columnsPerRow === 3
        ? 'md:col-span-6 lg:col-span-4'
        : columnsPerRow === 4
          ? 'md:col-span-6 lg:col-span-4 xl:col-span-3'
          : isWide
            ? 'lg:col-span-7'
            : 'lg:col-span-5 lg:mt-24';

  // Deliberately NOT reading presentation.cardBackgroundColor/cardBorderColor here —
  // Projects board's near-invisible "fused with the rock texture" card chrome is a
  // fixed trait of this design, not a themeable one. Those fields are driven by the
  // active site theme's card token and could resolve to a solid, clearly visible
  // color, which is exactly what this design should never show. The CSS fallback in
  // .pf-projects-board-card (globals.css) always applies instead.
  const cardVars: CSSProperties = {
    ...boardEnterStyle(entered, ENTER_CARD, enterDelay, instant),
    borderStyle:'solid',
    borderWidth:board.borderWidth??1,
    borderColor:resolveHeroPaletteColor(palette,board.borderColorToken??'bordure'),
  };

  return (
    <><article
      ref={cardRef}
      data-hover-cursor={board.consultDisplay==='hover'&&showCaseStudyLink?'true':undefined}
      onMouseEnter={event=>{if(board.consultDisplay==='hover'&&showCaseStudyLink&&window.matchMedia('(hover:hover) and (pointer:fine)').matches)setCursorAnchor({x:event.clientX,y:event.clientY});}}
      onMouseLeave={dismissCursor}
      data-board-card=""
      className={`group/board-card pf-projects-board-card relative flex min-h-0 flex-col ${bareImage ? mediaStyles.bareCard : 'overflow-hidden rounded-xl'} ${spanClass}`}
      style={cardVars}
      data-pf-no-color-transition=""
    >
      {showThumb ? (
        <ProjectsBoardThumbnail
          url={mediaUrl}
          alt={item.title}
          surface={tagSurface || 'transparent'}
          size={thumbnailSize}
          interactive={showCaseStudyLink}
          singleColumn={columnsPerRow === 1}
          imageFit={board.singleColumnImageFit ?? 'cover'}
        />
      ) : null}

      <div
        data-board-info-tone={infoTone}
        style={{ backgroundColor: infoPaint }}
        className={`flex min-h-0 flex-1 flex-col ${
          bareImage ? 'pt-6 sm:pt-8' : showThumb ? 'px-6 pb-7 pt-8 sm:px-8 sm:pb-8 sm:pt-10' : 'p-6 sm:p-8'
        }`}
      >
        {presentation.showCardTitle !== false ? (
          <h3
            className="text-2xl font-bold leading-[1.15] tracking-tight [text-wrap:balance] md:text-3xl lg:text-4xl"
            style={{ color: titleColor }}
          >
            {item.title}
          </h3>
        ) : null}

        {presentation.showCardDescription !== false && description ? (
          <p
            className={`max-w-[60ch] text-[1.02rem] leading-[1.7] sm:text-[1.0625rem] ${
              presentation.showCardTitle !== false ? 'mt-4 sm:mt-5' : ''
            }`}
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        ) : null}

        {showBottomBlock ? (
          <div className="mt-auto flex flex-col gap-4 pt-8 sm:pt-10">
            {showMetaLine ? (
              // Spacing instead of "•" separators: a wrapped line used to start with an
              // orphan bullet. Tags stay fully legible — no 70 % rest / 40 % sibling dimming.
              <ul
                className="flex flex-wrap items-baseline gap-x-4 gap-y-2"
                aria-label={t('Role and tools')}
              >
                {metaItems.map((meta, metaIndex) => (
                  <li
                    key={`${meta.text}-${metaIndex}`}
                    className={`text-xs uppercase leading-[1.5] tracking-[0.08em] ${
                      meta.accent ? 'font-semibold' : 'font-medium'
                    }`}
                    style={{
                      color: meta.accent
                        ? `color-mix(in srgb, ${accent} 80%, ${tagInk})`
                        : tagInk,
                    }}
                  >
                    {meta.text}
                  </li>
                ))}
              </ul>
            ) : null}
            {showCaseStudyLink ? (
              <CaseStudyLink
                href={href!.trim()}
                label={caseStudyLabel}
                ink={workButtonColor(board.buttonColor ? workPaletteTokenColor(board.buttonColor) : tagInk, board.buttonColorOpacity)}
                hoverInk={workButtonColor(board.buttonColor ? workPaletteTokenColor(board.buttonColor) : titleColor, board.buttonColorOpacity)}
                accent={accent}
                variant={board.consultStyle??'underline'}
                display={board.consultDisplay??'always'}
                surface={infoSurface||palette.fond}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
    {board.consultDisplay==='hover'&&showCaseStudyLink?<FramesViewCursor anchor={cursorAnchor} containerRef={cardRef} onDismiss={dismissCursor} label={caseStudyLabel}/>:null}
    </>
  );
}

/** Two-up project cards — Projects board design only. Asymmetric diagonal rhythm on
 * desktop (wide card left, narrower card right and nudged down); stacks to a single
 * natural-height column below `lg`. */
export function ProjectsBoardGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
  forceSingleColumn = false,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
  forceSingleColumn?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { entered, instant } = useBoardInView(
    rootRef,
    `${items.length}:${forceSingleColumn ? '1' : '2'}`
  );
  const board = presentation.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS;
  const columnsPerRow = board.columnsPerRow ?? DEFAULT_PROJECTS_BOARD_SETTINGS.columnsPerRow;

  if (items.length === 0) return null;

  // 3 and 4 per row get their own responsive ramp (1 column below tablet, 2 from
  // tablet (md), 3 from desktop (lg), 4 only from large desktop (xl) — see the
  // card's spanClass) and keep `items-stretch` at every breakpoint — unlike the
  // asymmetric 2-per-row grid, every card in an even row should share the row's
  // height so the `mt-auto` bottom block lines up across the row instead of each
  // card trailing off at its own natural height. 1 per row and the default 2 per
  // row are untouched (identical to before).
  const gridClass = forceSingleColumn
    ? 'grid grid-cols-1 items-stretch gap-y-12 sm:gap-y-16'
    : columnsPerRow === 3 || columnsPerRow === 4
      ? 'grid grid-cols-1 items-stretch gap-y-12 sm:gap-y-16 md:grid-cols-12 md:gap-x-8 md:gap-y-16 lg:gap-y-20 xl:gap-x-10'
      : 'grid grid-cols-1 items-stretch gap-y-12 sm:gap-y-16 lg:grid-cols-12 lg:items-start lg:gap-x-8 lg:gap-y-20 xl:gap-x-10';

  // The card surface is CSS keyed on the site-wide mode. A section pinned to the other mode
  // (Color mode → Dark on a light site) gets an opaque fill instead: follow that fill, or
  // the card stayed light under white text.
  const fillMode = sectionFillMode(presentation);
  const boardStyle: CSSProperties | undefined =
    fillMode && presentation.sectionBackgroundFill === 'solid'
      ? ({ '--pf-palette-fond': presentation.sectionBackgroundColor } as CSSProperties)
      : undefined;

  return (
    <div
      ref={rootRef}
      className={gridClass}
      data-board-mode={fillMode ?? undefined}
      style={boardStyle}
    >
      {items.map((item, index) => (
        <ProjectsBoardCard
          key={item.id}
          item={item}
          presentation={presentation}
          index={index}
          entered={entered}
          instant={instant}
        />
      ))}
    </div>
  );
}
