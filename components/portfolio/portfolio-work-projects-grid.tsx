'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import Image from 'next/image';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type { PortfolioWorkPresentationSettings } from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_GRID_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsGridSettings,
  type PortfolioWorkProjectsGridRadius,
} from '@/components/portfolio/portfolio-work-settings';

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

function gridGapClass(forceSingleColumn: boolean): string {
  return forceSingleColumn ? 'gap-8 sm:gap-10' : 'gap-8 sm:gap-10 lg:gap-12';
}

function carouselTrackGapClass(forceSingleColumn: boolean): string {
  return forceSingleColumn ? 'gap-8 sm:gap-10' : 'gap-8 sm:gap-10 lg:gap-12';
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

function ProjectsGridNavButtons({
  onPrev,
  onNext,
  canPrev,
  canNext,
  color,
  borderColor,
  surfaceColor,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  color: string;
  borderColor: string;
  surfaceColor: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
      {([-1, 1] as const).map((direction) => {
        const enabled = direction === -1 ? canPrev : canNext;
        return (
          <button
            key={direction}
            type="button"
            onClick={direction === -1 ? onPrev : onNext}
            disabled={!enabled}
            className="flex h-12 w-12 items-center justify-center rounded-full border text-2xl transition duration-300 ease-out hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-current disabled:pointer-events-none disabled:opacity-35 sm:h-14 sm:w-14 sm:text-3xl"
            style={{
              color,
              borderColor,
              backgroundColor: surfaceColor,
            }}
            aria-label={direction === -1 ? 'Previous projects' : 'Next projects'}
          >
            {direction === -1 ? '‹' : '›'}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Grid design header — title + optional subtitle.
 */
export function ProjectsGridSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  trailing,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  trailing?: ReactNode;
  className?: string;
}) {
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  if (!heading && !sub && !trailing) return null;

  return (
    <header className={`mb-10 w-full sm:mb-12 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-4 sm:gap-6">
        <div className="min-w-0 max-w-3xl">
          {heading ? (
            <h2
              className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl lg:leading-[1.12]"
              style={{ color: titleColor }}
            >
              {heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-2xl text-base leading-relaxed sm:text-lg ${heading ? 'mt-3' : ''}`}
              style={{ color: subtitleColor }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="pt-1 sm:pt-2">{trailing}</div> : null}
      </div>
    </header>
  );
}

function GridCard({
  item,
  presentation,
  showDescription,
  cardBorder,
  cardRadius,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  showDescription: boolean;
  cardBorder: PortfolioWorkPresentationSettings['cardBorder'];
  cardRadius: PortfolioWorkProjectsGridRadius;
}) {
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const borderColor = presentation.cardBorderColor || muted;
  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const description = item.description?.trim() || '';
  const showBorder = cardBorder !== 'none';
  const resolvedBorderColor = cardBorder === 'accent' ? accent || borderColor : borderColor;
  const radiusClass = gridRadiusClass(cardRadius);

  return (
    <article
      className={`flex h-full flex-col ${radiusClass} ${showBorder ? 'border p-3 sm:p-4' : ''}`}
      style={
        showBorder
          ? {
              borderColor: resolvedBorderColor,
              borderWidth: cardBorder === 'solid' ? 2 : 1,
            }
          : undefined
      }
    >
      <div
        className={`relative aspect-square w-full overflow-hidden ${radiusClass}`}
        style={{ backgroundColor: `${borderColor}44` }}
      >
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-6 text-center text-sm"
            style={{ color: muted }}
          >
            Add a thumbnail in Information → Portfolio
          </div>
        )}
      </div>

      <h3
        className="mt-4 text-lg font-bold tracking-[-0.02em] sm:mt-5 sm:text-xl"
        style={{ color: titleColor }}
      >
        {item.title}
      </h3>

      {showDescription && description ? (
        <p className="mt-2 text-sm leading-relaxed sm:text-[15px]" style={{ color: muted }}>
          {description}
        </p>
      ) : null}
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
  const { cardWidthPx, stepPx } = useCarouselMetrics(viewportRef, visibleCount, canCarousel);
  const translateX = stepPx > 0 ? activeIndex * stepPx : 0;

  if (items.length === 0) return null;

  const gridClass = `grid ${gridColumnsClass(columns, forceSingleColumn)} ${gridGapClass(forceSingleColumn)}`;

  const renderCard = (item: MarketplaceContentItem) => (
    <GridCard
      item={item}
      presentation={presentation}
      showDescription={showDescription}
      cardBorder={cardBorder}
      cardRadius={cardRadius}
    />
  );

  if (!canCarousel) {
    return (
      <div className={gridClass}>
        {items.map((item) => (
          <GridCard
            key={item.id}
            item={item}
            presentation={presentation}
            showDescription={showDescription}
            cardBorder={cardBorder}
            cardRadius={cardRadius}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={viewportRef} className="overflow-hidden">
      <div
        data-grid-carousel-track
        className={`flex ${carouselTrackGapClass(forceSingleColumn)} transform-gpu will-change-transform [transition:transform_520ms_cubic-bezier(0.33,1,0.68,1)]`}
        style={{
          transform: `translate3d(-${translateX}px, 0, 0)`,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-grid-carousel-item
            className="shrink-0"
            style={cardWidthPx > 0 ? { width: `${cardWidthPx}px` } : undefined}
          >
            {renderCard(item)}
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
  const navBorder =
    presentation.cardBorderColor ||
    presentation.elementStyles?.cardDescription?.color ||
    presentation.subtitleColor;
  const navSurface =
    presentation.cardBackgroundEnabled && presentation.cardBackgroundColor
      ? presentation.cardBackgroundColor
      : 'transparent';

  const carouselNav = canCarousel ? (
    <ProjectsGridNavButtons
      color={navColor}
      borderColor={navBorder}
      surfaceColor={navSurface}
      canPrev={carouselIndex > 0}
      canNext={carouselIndex < maxIndex}
      onPrev={() => setCarouselIndex((index) => Math.max(0, index - 1))}
      onNext={() => setCarouselIndex((index) => Math.min(maxIndex, index + 1))}
    />
  ) : null;

  const headerTrailing =
    trailing || carouselNav ? (
      <div className="flex items-center gap-4">
        {trailing}
        {carouselNav}
      </div>
    ) : null;

  return (
    <>
      <ProjectsGridSectionHeader
        title={title}
        subtitle={subtitle}
        titleColor={titleColor}
        subtitleColor={subtitleColor}
        trailing={headerTrailing}
        className={className}
      />
      <ProjectsGridGallery
        items={items}
        presentation={presentation}
        forceSingleColumn={forceSingleColumn}
        carouselIndex={carouselIndex}
      />
    </>
  );
}

export function isProjectsGridDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-grid';
}
