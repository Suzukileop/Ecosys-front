'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type { PortfolioWorkPresentationSettings } from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_GRID_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsGridSettings,
  type PortfolioWorkProjectsGridRadius,
} from '@/components/portfolio/portfolio-work-settings';

const GRID_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const GRID_DESKTOP_MQ = '(min-width: 768px)';
const GRID_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 28px, 0)',
};

function gridRadiusClass(radius: PortfolioWorkProjectsGridRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'sm') return 'rounded-lg';
  if (radius === 'md') return 'rounded-xl';
  if (radius === 'xl') return 'rounded-2xl sm:rounded-3xl';
  return 'rounded-2xl';
}

function gridColumnsClass(columns: 2 | 3, forceSingleColumn: boolean): string {
  if (forceSingleColumn) return 'grid-cols-1';
  return columns === 3
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2';
}

function gridGapClass(columns: 2 | 3, forceSingleColumn: boolean): string {
  if (forceSingleColumn) return 'gap-y-16 sm:gap-y-20 lg:gap-y-24';
  if (columns === 3) return 'gap-x-8 gap-y-16 sm:gap-x-10 sm:gap-y-20 lg:gap-x-12 lg:gap-y-8';
  return 'gap-x-10 gap-y-16 sm:gap-x-14 sm:gap-y-24 lg:gap-x-16 lg:gap-y-10';
}

function carouselTrackGapClass(forceSingleColumn: boolean): string {
  return forceSingleColumn ? 'gap-10 sm:gap-12' : 'gap-10 sm:gap-12 lg:gap-14';
}

function gridMediaAspectClass(index: number): string {
  const cycle = index % 3;
  if (cycle === 0) return 'aspect-[3/4]';
  if (cycle === 1) return 'aspect-square';
  return 'aspect-[4/3]';
}

function gridOffsetClass(
  index: number,
  columns: 2 | 3,
  enabled: boolean
): string {
  if (!enabled) return '';
  if (columns === 3) {
    if (index % 3 === 1) return 'lg:mt-12 xl:mt-14';
    if (index % 3 === 2) return 'lg:mt-24 xl:mt-28';
    return '';
  }
  return index % 2 === 1 ? 'lg:mt-16 xl:mt-24' : '';
}

function gridTitleClass(columns: 2 | 3): string {
  if (columns === 3) {
    return 'text-[1.28rem] font-semibold leading-[1.22] tracking-[-0.035em] sm:text-[1.42rem] sm:leading-[1.2]';
  }
  return 'text-[1.4rem] font-semibold leading-[1.22] tracking-[-0.038em] sm:text-[1.7rem] sm:leading-[1.18] lg:text-[1.85rem] lg:leading-[1.18]';
}

function gridImageSizes(columns: 2 | 3, forceSingleColumn: boolean): string {
  if (forceSingleColumn) return '100vw';
  if (columns === 3) return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  return '(max-width: 640px) 100vw, 50vw';
}

function formatGridIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function gridScrollRoot(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function gridScrollRoots(el: HTMLElement | null): EventTarget[] {
  const targets: EventTarget[] = [window];
  const nested = gridScrollRoot(el);
  if (nested) targets.push(nested);
  return targets;
}

function wordLetterCount(word: string): number {
  return (word.match(/\p{L}/gu) ?? []).length;
}

function splitEditorialTitle(title: string): { lead: string; italic: string } | null {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  const last = words[words.length - 1];
  if (wordLetterCount(last) < 4) return null;
  return { lead: words.slice(0, -1).join(' '), italic: last };
}

function EditorialTitleText({ text }: { text: string }) {
  const parts = splitEditorialTitle(text);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.lead}{' '}
      <span className="font-medium italic tracking-[-0.03em]">{parts.italic}</span>
    </>
  );
}

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.85s ${GRID_EASE} ${delayMs}ms, transform 0.95s ${GRID_EASE} ${delayMs}ms`;
  el.style.opacity = '1';
  el.style.transform = 'translate3d(0, 0, 0)';
  el.dataset.revealed = 'true';
}

function showElementNow(el: HTMLElement): void {
  el.style.transition = 'none';
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.dataset.revealed = 'true';
}

type CarouselMetrics = {
  cardWidthPx: number;
  stepPx: number;
};

function useCarouselMetrics(
  viewportRef: RefObject<HTMLDivElement | null>,
  visibleCount: number,
  enabled: boolean
): CarouselMetrics {
  const [metrics, setMetrics] = useState<CarouselMetrics>({ cardWidthPx: 0, stepPx: 0 });

  useLayoutEffect(() => {
    if (!enabled) {
      setMetrics({ cardWidthPx: 0, stepPx: 0 });
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      const track = viewport.querySelector<HTMLElement>('[data-grid-carousel-track]');
      if (!track) return;

      const gapPx =
        Number.parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '0') ||
        0;
      const viewportWidth = viewport.clientWidth;
      const cardWidthPx = (viewportWidth - gapPx * Math.max(0, visibleCount - 1)) / visibleCount;

      setMetrics({
        cardWidthPx: Math.max(0, cardWidthPx),
        stepPx: Math.max(0, cardWidthPx + gapPx),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [viewportRef, visibleCount, enabled]);

  return metrics;
}

function useProjectsGridVisibleCount(configured: 2 | 3, forceSingleColumn: boolean): number {
  const [pageSize, setPageSize] = useState(() => (forceSingleColumn ? 1 : configured));

  useEffect(() => {
    if (forceSingleColumn) {
      setPageSize(1);
      return;
    }
    const lg = window.matchMedia('(min-width: 1024px)');
    const sm = window.matchMedia('(min-width: 640px)');
    const update = () => {
      if (lg.matches) setPageSize(configured);
      else if (sm.matches) setPageSize(Math.min(2, configured));
      else setPageSize(1);
    };
    update();
    lg.addEventListener('change', update);
    sm.addEventListener('change', update);
    return () => {
      lg.removeEventListener('change', update);
      sm.removeEventListener('change', update);
    };
  }, [configured, forceSingleColumn]);

  return pageSize;
}

function useGridEntrance(
  rootRef: RefObject<HTMLElement | null>,
  readyKey: string,
  batchReveal: boolean
): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const nodes = [...root.querySelectorAll<HTMLElement>('[data-grid-enter]')];
    if (nodes.length === 0) return;

    if (prefersReducedMotion()) {
      nodes.forEach(showElementNow);
      return;
    }

    const revealNode = (el: HTMLElement) => {
      if (el.dataset.revealed === 'true') return;
      const delay = Number(el.dataset.gridStagger) || 0;
      revealElement(el, delay);
    };

    const ioRoot = gridScrollRoot(root);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (batchReveal) {
            nodes.forEach(revealNode);
            observer.disconnect();
            return;
          }
          revealNode(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, root: ioRoot, rootMargin: '0px 0px -6% 0px' }
    );

    if (batchReveal) {
      observer.observe(root);
    } else {
      nodes.forEach((node) => observer.observe(node));
    }

    const failSafe = window.setTimeout(() => {
      nodes.forEach((node) => {
        if (node.dataset.revealed !== 'true') showElementNow(node);
      });
    }, 1800);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [readyKey, batchReveal]);
}

function useGridScrollPolish(rootRef: RefObject<HTMLElement | null>, readyKey: string): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const desktop = window.matchMedia(GRID_DESKTOP_MQ);
    const scrollRoots = gridScrollRoots(root);
    let frame = 0;

    const resetKinetic = () => {
      root.querySelectorAll<HTMLElement>('[data-grid-media-shift], [data-grid-copy]').forEach((el) => {
        el.style.transform = '';
      });
    };

    const applyKinetic = () => {
      if (prefersReducedMotion() || !desktop.matches) {
        resetKinetic();
        return;
      }
      const vh = window.innerHeight || 1;
      const cards = root.querySelectorAll<HTMLElement>('[data-grid-card]');
      cards.forEach((card) => {
        if (card.dataset.revealed !== 'true') return;
        const media = card.querySelector<HTMLElement>('[data-grid-media-shift]');
        const copy = card.querySelector<HTMLElement>('[data-grid-copy]');
        if (!media && !copy) return;
        const rect = card.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const centered = (rect.top + rect.height * 0.5 - vh * 0.5) / vh;
        const clamped = Math.max(-1.1, Math.min(1.1, centered));
        const odd = (Number(card.dataset.gridIndex) || 0) % 2 === 1;
        if (media) {
          media.style.transform = `translate3d(0, ${(clamped * (odd ? 16 : 11)).toFixed(2)}px, 0)`;
        }
        if (copy) {
          copy.style.transform = `translate3d(0, ${(clamped * (odd ? -12 : -7)).toFixed(2)}px, 0)`;
        }
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyKinetic();
      });
    };

    const bind = () => {
      if (prefersReducedMotion() || !desktop.matches) {
        resetKinetic();
        return;
      }
      applyKinetic();
    };

    scrollRoots.forEach((target) => {
      target.addEventListener('scroll', onScroll, { passive: true });
    });
    desktop.addEventListener('change', bind);
    bind();

    return () => {
      scrollRoots.forEach((target) => {
        target.removeEventListener('scroll', onScroll);
      });
      desktop.removeEventListener('change', bind);
      if (frame) window.cancelAnimationFrame(frame);
      resetKinetic();
    };
  }, [readyKey]);
}

function GridMediaLink({
  href,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  className: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  const external = /^https?:\/\//i.test(href);
  const style: CSSProperties = { color: 'inherit', textDecoration: 'none' };
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        aria-label={ariaLabel}
        data-pf-no-color-transition=""
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={className}
      style={style}
      aria-label={ariaLabel}
      data-pf-no-color-transition=""
    >
      {children}
    </Link>
  );
}

function GridConsultLink({
  href,
  color,
}: {
  href: string;
  color: string;
}) {
  const external = /^https?:\/\//i.test(href);
  const className =
    'group/grid-cta mt-6 inline-flex items-center gap-2.5 bg-transparent text-[11px] font-medium uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-60 focus:outline-none focus-visible:opacity-60 sm:mt-7';
  const body = (
    <>
      <span
        className="border-b pb-[0.12em] transition-[border-color,opacity] duration-300"
        style={{ borderColor: color }}
        data-pf-no-color-transition=""
      >
        View
      </span>
      <span
        aria-hidden
        className="inline-block transition-transform duration-300 group-hover/grid-cta:translate-x-1"
      >
        →
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
        style={{ color, backgroundColor: 'transparent' }}
        data-pf-no-color-transition=""
      >
        {body}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      style={{ color, backgroundColor: 'transparent' }}
      data-pf-no-color-transition=""
    >
      {body}
    </Link>
  );
}

function ProjectsGridNavButtons({
  onPrev,
  onNext,
  canPrev,
  canNext,
  color,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  color: string;
}) {
  const ghostClass =
    'bg-transparent px-0 py-1 text-[11px] font-medium uppercase tracking-[0.22em] transition-opacity duration-300 hover:opacity-60 focus:outline-none focus-visible:opacity-60 disabled:pointer-events-none disabled:opacity-28';

  return (
    <div className="flex shrink-0 items-center gap-5 sm:gap-6">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        className={ghostClass}
        style={{ color, backgroundColor: 'transparent' }}
        aria-label="Previous projects"
        data-pf-no-color-transition=""
      >
        ‹ Prev
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className={ghostClass}
        style={{ color, backgroundColor: 'transparent' }}
        aria-label="Next projects"
        data-pf-no-color-transition=""
      >
        Next ›
      </button>
    </div>
  );
}

/**
 * Grid design header — kicker + editorial title + airy subtitle.
 * Hidden in JSX (FOUC-safe), revealed via IntersectionObserver.
 */
export function ProjectsGridSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  trailing,
  className = '',
  entryCount,
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  trailing?: ReactNode;
  className?: string;
  entryCount?: number;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  const isEmpty = !heading && !sub && !trailing;
  const countLabel =
    typeof entryCount === 'number' && entryCount > 0
      ? String(entryCount).padStart(2, '0')
      : '';

  useEffect(() => {
    const header = headerRef.current;
    if (!header || isEmpty) return;

    if (prefersReducedMotion()) {
      showElementNow(header);
      return;
    }

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      revealElement(header, 0);
    };

    const ioRoot = gridScrollRoot(header);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, root: ioRoot, rootMargin: '40px 0px' }
    );
    observer.observe(header);
    const failSafe = window.setTimeout(reveal, 1600);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [heading, sub, isEmpty]);

  if (isEmpty) return null;

  return (
    <header
      ref={headerRef}
      className={`pf-work-grid-header mb-14 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={GRID_HIDDEN}
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-12 lg:gap-16">
        <div className="min-w-0 max-w-3xl">
          {countLabel ? (
            <div className="mb-5 flex items-center gap-3 sm:mb-6">
              <span
                className="h-px w-7 shrink-0 sm:w-9"
                style={{ backgroundColor: titleColor, opacity: 0.45 }}
                aria-hidden
              />
              <p
                className="text-[10px] font-medium uppercase tracking-[0.28em] sm:text-[11px]"
                style={{ color: subtitleColor, opacity: 0.78 }}
              >
                {countLabel}
              </p>
            </div>
          ) : null}
          {heading ? (
            <h2
              className="font-semibold tracking-[-0.045em]"
              style={{
                color: titleColor,
                fontSize: 'clamp(2.15rem, 5.1vw, 3.85rem)',
                lineHeight: 1.16,
              }}
            >
              <EditorialTitleText text={heading} />
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-md text-[15px] font-normal leading-[1.7] sm:text-base sm:leading-[1.72] ${
                heading ? 'mt-4 sm:mt-5' : ''
              }`}
              style={{ color: subtitleColor, opacity: 0.84 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0 pb-0.5 sm:pb-1">{trailing}</div> : null}
      </div>
    </header>
  );
}

function GridCard({
  item,
  index,
  presentation,
  showDescription,
  cardBorder,
  cardRadius,
  columns,
  offsetEnabled,
  forceSingleColumn,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  showDescription: boolean;
  cardBorder: PortfolioWorkPresentationSettings['cardBorder'];
  cardRadius: PortfolioWorkProjectsGridRadius;
  columns: 2 | 3;
  offsetEnabled: boolean;
  forceSingleColumn: boolean;
}) {
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const borderColor = presentation.cardBorderColor || muted;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || titleColor;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const description = item.description?.trim() || '';
  const href = item.linkUrl?.trim() || null;
  const title = item.title?.trim() || '';
  const radiusClass = gridRadiusClass(cardRadius);
  const aspectClass = gridMediaAspectClass(index);
  const offsetClass = gridOffsetClass(index, columns, offsetEnabled);
  const showMediaFrame = cardBorder !== 'none';
  const frameColor = cardBorder === 'accent' ? accent || borderColor : borderColor;
  const frameBorderColor =
    cardBorder === 'soft'
      ? `color-mix(in srgb, ${frameColor} 34%, transparent)`
      : frameColor;
  const stagger = Math.min(40 + index * 70, 320);

  const mediaInner = mediaUrl ? (
    <div data-grid-media-shift className="absolute -inset-[12%]">
      <Image
        src={mediaUrl}
        alt={title || 'Project'}
        fill
        sizes={gridImageSizes(columns, forceSingleColumn)}
        className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/grid-card:scale-[1.045]"
        data-pf-no-color-transition=""
      />
    </div>
  ) : (
    <div
      className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm font-light leading-[1.7]"
      style={{ color: muted }}
    >
      Add a thumbnail in Information → Portfolio
    </div>
  );

  return (
    <article
      className={`group/grid-card pf-work-grid-card flex flex-col ${offsetClass}`.trim()}
      data-grid-card=""
      data-grid-enter=""
      data-grid-index={String(index)}
      data-grid-stagger={String(stagger)}
      data-pf-no-color-transition=""
      style={GRID_HIDDEN}
    >
      <div
        className={`relative w-full overflow-hidden ${aspectClass} ${radiusClass}`}
        style={{
          backgroundColor: `${borderColor}44`,
          ...(showMediaFrame
            ? {
                borderColor: frameBorderColor,
                borderWidth: 1,
                borderStyle: 'solid',
              }
            : undefined),
        }}
      >
        {href && mediaUrl ? (
          <GridMediaLink
            href={href}
            className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
            ariaLabel={title || 'Project'}
          >
            {mediaInner}
          </GridMediaLink>
        ) : (
          mediaInner
        )}
      </div>

      <div data-grid-copy className="flex min-w-0 flex-col pt-6 sm:pt-8">
        <div className="flex items-center gap-3">
          <p
            className="text-[10px] font-medium tracking-[0.22em] tabular-nums sm:text-[11px]"
            style={{ color: muted, opacity: 0.48 }}
          >
            {formatGridIndex(index)}
          </p>
          <span
            className="pf-work-grid-rule block h-px"
            style={{ backgroundColor: accent || muted }}
            aria-hidden
          />
        </div>

        {title ? (
          <h3 className={`mt-4 sm:mt-5 ${gridTitleClass(columns)}`} style={{ color: titleColor }}>
            {href ? (
              <GridMediaLink
                href={href}
                className="rounded-sm text-inherit no-underline outline-none transition-opacity duration-300 hover:opacity-70 focus-visible:opacity-70"
                ariaLabel={title}
              >
                <EditorialTitleText text={title} />
              </GridMediaLink>
            ) : (
              <EditorialTitleText text={title} />
            )}
          </h3>
        ) : null}

        {showDescription && description ? (
          <p
            className={`max-w-[36em] text-[0.92rem] font-normal leading-[1.7] sm:text-[0.98rem] sm:leading-[1.72] ${
              title ? 'mt-3 sm:mt-3.5' : 'mt-3'
            }`}
            style={{ color: muted, opacity: 0.82 }}
          >
            {description}
          </p>
        ) : null}

        {href ? <GridConsultLink href={href} color={accent} /> : null}
      </div>
    </article>
  );
}

/** Thumbnail + title + description grid — Projects grid design only. */
export function ProjectsGridGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
  forceSingleColumn = false,
  carouselIndex = 0,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
  forceSingleColumn?: boolean;
  carouselIndex?: number;
}) {
  const board = mergeProjectsGridSettings(
    DEFAULT_PROJECTS_GRID_SETTINGS,
    presentation.projectsGrid
  );
  const columns = board.columnsPerRow === 3 ? 3 : 2;
  const showDescription = board.showDescription !== false;
  const cardBorder = board.cardBorder ?? 'none';
  const cardRadius = board.cardRadius ?? 'none';
  const visibleCount = useProjectsGridVisibleCount(columns, forceSingleColumn);
  const canCarousel = board.carouselEnabled === true && items.length > visibleCount;
  const maxIndex = Math.max(0, items.length - visibleCount);
  const activeIndex = Math.max(0, Math.min(carouselIndex, maxIndex));
  const viewportRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { cardWidthPx, stepPx } = useCarouselMetrics(viewportRef, visibleCount, canCarousel);
  const translateX = stepPx > 0 ? activeIndex * stepPx : 0;
  const motionRootRef = canCarousel ? viewportRef : gridRef;
  const motionKey = `${items.map((item) => item.id).join('|')}:${canCarousel ? 'c' : 'g'}:${columns}`;

  useGridEntrance(motionRootRef, motionKey, canCarousel);
  useGridScrollPolish(motionRootRef, motionKey);

  if (items.length === 0) return null;

  const gridClass = `grid items-start ${gridColumnsClass(columns, forceSingleColumn)} ${gridGapClass(columns, forceSingleColumn)}`;

  const renderCard = (item: MarketplaceContentItem, index: number) => (
    <GridCard
      item={item}
      index={index}
      presentation={presentation}
      showDescription={showDescription}
      cardBorder={cardBorder}
      cardRadius={cardRadius}
      columns={columns}
      offsetEnabled={!canCarousel && !forceSingleColumn}
      forceSingleColumn={forceSingleColumn}
    />
  );

  if (!canCarousel) {
    return (
      <div ref={gridRef} className={gridClass}>
        {items.map((item, index) => (
          <GridCard
            key={item.id}
            item={item}
            index={index}
            presentation={presentation}
            showDescription={showDescription}
            cardBorder={cardBorder}
            cardRadius={cardRadius}
            columns={columns}
            offsetEnabled={!forceSingleColumn}
            forceSingleColumn={forceSingleColumn}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={viewportRef} className="overflow-hidden">
      <div
        data-grid-carousel-track
        className={`flex items-start ${carouselTrackGapClass(forceSingleColumn)} transform-gpu will-change-transform [transition:transform_520ms_cubic-bezier(0.33,1,0.68,1)]`}
        style={{
          transform: `translate3d(-${translateX}px, 0, 0)`,
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            data-grid-carousel-item
            className="shrink-0"
            style={cardWidthPx > 0 ? { width: `${cardWidthPx}px` } : undefined}
          >
            {renderCard(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Header + gallery with optional carousel navigation — Projects grid design only. */
export function ProjectsGridSection({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  className = '',
  trailing,
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
  forceSingleColumn = false,
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  className?: string;
  trailing?: ReactNode;
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
  forceSingleColumn?: boolean;
}) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const board = mergeProjectsGridSettings(
    DEFAULT_PROJECTS_GRID_SETTINGS,
    presentation.projectsGrid
  );
  const columns = board.columnsPerRow === 3 ? 3 : 2;
  const visibleCount = useProjectsGridVisibleCount(columns, forceSingleColumn);
  const canCarousel = board.carouselEnabled === true && items.length > visibleCount;
  const maxIndex = Math.max(0, items.length - visibleCount);

  useEffect(() => {
    setCarouselIndex(0);
  }, [items.length, board.carouselEnabled, visibleCount]);

  useEffect(() => {
    setCarouselIndex((index) => Math.max(0, Math.min(index, maxIndex)));
  }, [maxIndex]);
  const navColor = presentation.titleColor;

  const carouselNav = canCarousel ? (
    <ProjectsGridNavButtons
      color={navColor}
      canPrev={carouselIndex > 0}
      canNext={carouselIndex < maxIndex}
      onPrev={() => setCarouselIndex((index) => Math.max(0, index - 1))}
      onNext={() => setCarouselIndex((index) => Math.min(maxIndex, index + 1))}
    />
  ) : null;

  const headerTrailing =
    trailing || carouselNav ? (
      <div className="flex flex-col items-start gap-5 sm:items-end sm:gap-6">
        {trailing}
        {carouselNav}
      </div>
    ) : null;

  return (
    <div className="pf-work-grid w-full" data-pf-no-color-transition="">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .pf-work-grid-header,
          .pf-work-grid-card {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .pf-work-grid [data-grid-media-shift],
          .pf-work-grid [data-grid-copy] {
            transform: none !important;
          }
        }
        .pf-work-grid-rule {
          width: 2.25rem;
          opacity: 0.32;
          transition: width 0.5s ${GRID_EASE}, opacity 0.5s ${GRID_EASE};
        }
        .pf-work-grid-card:hover .pf-work-grid-rule,
        .pf-work-grid-card:focus-within .pf-work-grid-rule {
          width: 3.75rem;
          opacity: 0.7;
        }
      `}</style>
      <ProjectsGridSectionHeader
        title={title}
        subtitle={subtitle}
        titleColor={titleColor}
        subtitleColor={subtitleColor}
        trailing={headerTrailing}
        className={className}
        entryCount={items.length}
      />
      <ProjectsGridGallery
        items={items}
        presentation={presentation}
        forceSingleColumn={forceSingleColumn}
        carouselIndex={carouselIndex}
      />
    </div>
  );
}

export function isProjectsGridDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-grid';
}
