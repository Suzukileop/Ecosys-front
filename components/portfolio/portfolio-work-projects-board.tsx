'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsBoardThumbnailSize,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_BOARD_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
} from '@/components/portfolio/portfolio-work-settings';

const BOARD_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const ENTER_KICKER: CSSProperties = { opacity: 0, transform: 'translateY(14px)' };
const ENTER_HEADLINE: CSSProperties = { opacity: 0, transform: 'translateY(22px)' };
const ENTER_TRAIL: CSSProperties = { opacity: 0, transform: 'translateY(12px)' };
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

/** Nested portfolio shells (pages mode) often scroll instead of `window`. */
function boardScrollRoots(el: HTMLElement | null): EventTarget[] {
  const targets: EventTarget[] = [window];
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const overflowY = String(getComputedStyle(node).overflowY);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      targets.push(node);
    }
    node = node.parentElement;
  }
  return targets;
}

function editorialHeadline(text: string): ReactNode {
  const trimmed = text.trim();
  const idx = trimmed.search(/\s+/);
  if (idx === -1) {
    return <span className="font-semibold">{trimmed}</span>;
  }
  return (
    <>
      <span className="font-light italic">{trimmed.slice(0, idx)}</span>{' '}
      <span className="font-semibold">{trimmed.slice(idx).trimStart()}</span>
    </>
  );
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

function useBoardScrollKinetic(
  rootRef: RefObject<HTMLElement | null>,
  onFrame: (root: HTMLElement, relative: number) => void,
  readyKey: string | number
): void {
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const mq = window.matchMedia('(min-width: 768px)');
    const scrollRoots = boardScrollRoots(root);
    let raf = 0;

    const tick = () => {
      raf = 0;
      if (!mq.matches) {
        onFrameRef.current(root, 0);
        return;
      }
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const relative = Math.max(0, vh * 0.4 - rect.top);
      onFrameRef.current(root, relative);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(tick);
    };

    scrollRoots.forEach((target) => {
      target.addEventListener('scroll', onScroll, { passive: true });
    });
    mq.addEventListener('change', onScroll);
    tick();

    return () => {
      scrollRoots.forEach((target) => {
        target.removeEventListener('scroll', onScroll);
      });
      mq.removeEventListener('change', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      onFrameRef.current(root, 0);
    };
  }, [readyKey]);
}

/**
 * Header for Projects board: micro kicker → editorial headline.
 * Extra space below the title lets the grid breathe.
 */
export function ProjectsBoardSectionHeader({
  title,
  subtitle,
  accentColor,
  titleColor,
  subtitleColor,
  trailing,
  className = '',
}: {
  title: string;
  subtitle?: string;
  accentColor: string;
  titleColor: string;
  subtitleColor: string;
  trailing?: ReactNode;
  className?: string;
}) {
  const headerRef = useRef<HTMLElement | null>(null);
  const kicker = title.trim();
  const headline = subtitle?.trim() || '';
  const ink = titleColor || subtitleColor;
  const { entered, instant } = useBoardInView(headerRef, `${kicker}|${headline}`);

  useBoardScrollKinetic(
    headerRef,
    (root, relative) => {
      const kickerEl = root.querySelector<HTMLElement>('[data-board-scroll="kicker"]');
      const headlineEl = root.querySelector<HTMLElement>('[data-board-scroll="headline"]');
      const trailEl = root.querySelector<HTMLElement>('[data-board-scroll="trail"]');
      if (kickerEl) {
        kickerEl.style.transform = `translateY(${(-relative * 0.04).toFixed(2)}px)`;
      }
      if (headlineEl) {
        headlineEl.style.transform = `translateY(${(-relative * 0.08).toFixed(2)}px)`;
      }
      if (trailEl) {
        trailEl.style.transform = `translateY(${(-relative * 0.03).toFixed(2)}px)`;
      }
    },
    `${kicker}|${headline}`
  );

  const headingClass =
    'max-w-[19ch] text-[2.05rem] font-normal leading-[1.12] tracking-[-0.038em] sm:text-[2.75rem] lg:text-[3.35rem] lg:leading-[1.06]';

  return (
    <header
      ref={headerRef}
      className={`mb-16 w-full pt-2 sm:mb-24 sm:pt-4 lg:mb-32 lg:pt-6 ${className}`.trim()}
    >
      <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between sm:gap-12 lg:gap-20">
        <div className="min-w-0 max-w-3xl">
          {kicker && headline ? (
            <div data-board-scroll="kicker">
              <p
                className="text-[0.68rem] font-medium uppercase tracking-[0.22em]"
                style={{
                  color: accentColor,
                  ...boardEnterStyle(entered, ENTER_KICKER, 40, instant),
                }}
              >
                {kicker}
              </p>
            </div>
          ) : null}
          {headline ? (
            <div data-board-scroll="headline">
              <h2
                className={`${headingClass} ${kicker ? 'mt-5 sm:mt-6' : ''}`}
                style={{
                  color: ink,
                  ...boardEnterStyle(entered, ENTER_HEADLINE, 140, instant),
                }}
              >
                {editorialHeadline(headline)}
              </h2>
            </div>
          ) : kicker ? (
            <div data-board-scroll="headline">
              <h2
                className={headingClass}
                style={{
                  color: titleColor,
                  ...boardEnterStyle(entered, ENTER_HEADLINE, 80, instant),
                }}
              >
                {editorialHeadline(kicker)}
              </h2>
            </div>
          ) : null}
        </div>
        {trailing ? (
          <div data-board-scroll="trail" className="shrink-0 sm:pt-1.5">
            <div style={boardEnterStyle(entered, ENTER_TRAIL, 240, instant)}>{trailing}</div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

/** Minimalist bottom-of-card CTA: uppercase text + a 1px underline that grows in from
 * the left on hover, instead of the old boxed button floating on the thumbnail. */
function CaseStudyLink({ href, label }: { href: string; label: string }) {
  const external = /^https?:\/\//i.test(href);
  const className =
    'group/cta inline-flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-neutral-400 transition-colors duration-300 hover:text-white';

  const content = (
    <>
      <span className="relative pb-0.5">
        {label}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover/cta:scale-x-100"
        />
      </span>
      <span aria-hidden className="translate-y-[-1px]">
        ↗
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        data-pf-no-color-transition=""
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className} data-pf-no-color-transition="">
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
}: {
  url: string | null;
  alt: string;
  surface: string;
  size: PortfolioWorkProjectsBoardThumbnailSize;
}) {
  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden ${boardThumbnailAspectClass(size)}`}
      style={{ backgroundColor: surface }}
    >
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-700 ease-out will-change-transform group-hover/board-card:scale-[1.04]"
          data-pf-no-color-transition=""
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/50 via-neutral-950/0 to-transparent transition-opacity duration-500 ease-out group-hover/board-card:from-neutral-950/60"
        aria-hidden
      />
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
  const board = presentation.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS;
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

  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const descriptionColor =
    presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const tagInk = presentation.elementStyles?.toolsList?.color || presentation.subtitleColor;
  const tagSurface = presentation.cardBorderColor;

  const caseStudyLabel = board.consultLabel?.trim() || 'View project';
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
  };

  return (
    <article
      data-board-card=""
      className={`group/board-card pf-projects-board-card flex min-h-0 flex-col overflow-hidden rounded-xl ${spanClass}`}
      style={cardVars}
      data-pf-no-color-transition=""
    >
      {showThumb ? (
        <ProjectsBoardThumbnail
          url={mediaUrl}
          alt={item.title}
          surface={tagSurface || 'transparent'}
          size={thumbnailSize}
        />
      ) : null}

      <div
        className={`flex min-h-0 flex-1 flex-col ${
          showThumb ? 'px-6 pb-7 pt-8 sm:px-8 sm:pb-8 sm:pt-10' : 'p-6 sm:p-8'
        }`}
      >
        {presentation.showCardTitle !== false ? (
          <h3
            className="text-2xl font-bold leading-[1.05] tracking-tight md:text-3xl lg:text-4xl"
            style={{ color: titleColor }}
          >
            {item.title}
          </h3>
        ) : null}

        {presentation.showCardDescription !== false && description ? (
          <p
            className={`max-w-md text-[1.02rem] leading-relaxed sm:text-[1.0625rem] ${
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
              <ul
                className="group/tags flex flex-wrap items-baseline gap-x-2 gap-y-1.5"
                aria-label="Role and tools"
              >
                {metaItems.map((meta, metaIndex) => (
                  <li
                    key={`${meta.text}-${metaIndex}`}
                    className="flex items-baseline gap-2 text-[0.66rem] font-medium uppercase tracking-[0.14em] opacity-70 transition-opacity duration-300 hover:!opacity-100 group-hover/tags:opacity-40"
                    style={{ color: meta.accent ? accent : tagInk }}
                  >
                    {metaIndex > 0 ? (
                      <span aria-hidden className="font-normal opacity-35">
                        •
                      </span>
                    ) : null}
                    <span>{meta.text}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {showCaseStudyLink ? <CaseStudyLink href={href!.trim()} label={caseStudyLabel} /> : null}
          </div>
        ) : null}
      </div>
    </article>
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

  return (
    <div ref={rootRef} className={gridClass}>
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

export function isProjectsBoardDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-board';
}
