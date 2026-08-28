'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsCarouselAspect,
  PortfolioWorkProjectsCarouselImageSize,
  PortfolioWorkProjectsCarouselRadius,
  PortfolioWorkProjectsCarouselSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_CAROUSEL_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsCarouselSettings,
} from '@/components/portfolio/portfolio-work-settings';

function carouselRadiusClass(radius: PortfolioWorkProjectsCarouselRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'md') return 'rounded-2xl';
  return 'rounded-[1.75rem] sm:rounded-[2rem]';
}

function carouselAspectClass(aspect: PortfolioWorkProjectsCarouselAspect): string {
  if (aspect === 'landscape') return 'aspect-[4/3]';
  if (aspect === 'portrait') return 'aspect-[3/4]';
  return 'aspect-square';
}

function carouselImageSizeClass(size: PortfolioWorkProjectsCarouselImageSize): string {
  switch (size) {
    case 'sm':
      return 'w-[14rem] sm:w-[16rem] lg:w-[18rem]';
    case 'md':
      return 'w-[18rem] sm:w-[22rem] lg:w-[24rem]';
    case 'xl':
      return 'w-[min(100%,28rem)] sm:w-[34rem] lg:w-[40rem] xl:w-[44rem]';
    default:
      return 'w-[22rem] sm:w-[28rem] lg:w-[32rem]';
  }
}

function carouselGapClass(gap: PortfolioWorkProjectsCarouselSettings['gap']): string {
  if (gap === 'tight') return 'gap-4 sm:gap-5';
  if (gap === 'xl') return 'gap-16 sm:gap-24 lg:gap-32 xl:gap-40';
  return 'gap-10 sm:gap-14 lg:gap-16';
}

function ProjectsCarouselNavButtons({
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
            aria-label={direction === -1 ? 'Previous project' : 'Next project'}
          >
            {direction === -1 ? '‹' : '›'}
          </button>
        );
      })}
    </div>
  );
}

type SlideMetrics = {
  stepPx: number;
  maxIndex: number;
};

function useCarouselSlideMetrics(
  viewportRef: RefObject<HTMLDivElement | null>,
  itemCount: number,
  imageSize: PortfolioWorkProjectsCarouselImageSize,
  gap: PortfolioWorkProjectsCarouselSettings['gap']
): SlideMetrics {
  const [metrics, setMetrics] = useState<SlideMetrics>({ stepPx: 0, maxIndex: 0 });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || itemCount === 0) {
      setMetrics({ stepPx: 0, maxIndex: 0 });
      return;
    }

    const measure = () => {
      const track = viewport.querySelector<HTMLElement>('[data-projects-carousel-track]');
      const first = viewport.querySelector<HTMLElement>('[data-projects-carousel-item]');
      if (!track || !first) return;

      const gapPx =
        Number.parseFloat(
          window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '0'
        ) || 0;
      const stepPx = first.offsetWidth + gapPx;
      const overflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const maxIndex =
        stepPx > 0 ? Math.max(0, Math.min(itemCount - 1, Math.ceil(overflow / stepPx - 0.01))) : 0;

      setMetrics({ stepPx, maxIndex });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [viewportRef, itemCount, imageSize, gap]);

  return metrics;
}

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function CarouselStackStrip({
  tools,
  ink,
  rule,
}: {
  tools: string[];
  ink: string;
  rule: string;
}) {
  if (tools.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-x-0 gap-y-1.5" aria-label="Stack">
      {tools.map((tool, index) => (
        <li key={tool} className="flex items-center">
          {index > 0 ? (
            <span
              className="mx-2 h-3 w-px shrink-0 sm:mx-2.5"
              style={{ backgroundColor: rule }}
              aria-hidden
            />
          ) : null}
          <span
            className="text-[11px] font-medium lowercase tracking-[0.04em] sm:text-xs"
            style={{ color: ink }}
          >
            {tool}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CarouselSlide({
  item,
  presentation,
  settings,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsCarouselSettings;
}) {
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const borderColor = presentation.cardBorderColor || muted;
  const stackInk = presentation.elementStyles?.toolsList?.color || muted;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const href = item.linkUrl?.trim() || null;
  const title = item.title?.trim() || '';
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item, presentation.maxToolsShown ?? 12);
  const hoverReveal = settings.hoverReveal !== false;
  const hoverStack = settings.hoverStack !== false && tools.length > 0;
  const radiusClass = carouselRadiusClass(settings.imageRadius ?? 'none');
  const sizeClass = carouselImageSizeClass(settings.imageSize ?? 'lg');
  const aspectClass = carouselAspectClass(settings.aspectRatio ?? 'square');

  const media = (
    <div className={`flex flex-col ${sizeClass}`}>
      <div
        className={`relative w-full overflow-hidden ${aspectClass} ${radiusClass}`}
        style={{ backgroundColor: `${borderColor}44` }}
      >
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={title || 'Project'}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 40vw"
            className={`object-cover object-center transition-transform duration-500 ease-out ${
              hoverReveal ? 'group-hover:scale-125 group-focus-within:scale-125' : ''
            }`}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-6 text-center text-sm"
            style={{ color: muted }}
          >
            Add a thumbnail in Information → Portfolio
          </div>
        )}
        {hoverReveal ? (
          <>
            <div
              className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/45 group-focus-within:bg-black/45"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-within:opacity-100 sm:gap-3 sm:px-8">
              {title ? (
                <p className="max-w-md text-base font-semibold leading-snug tracking-[-0.02em] text-white sm:text-lg lg:text-xl">
                  {title}
                </p>
              ) : null}
              {description ? (
                <p className="max-w-sm text-sm leading-relaxed text-white/85 sm:text-base">
                  {description}
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
      {hoverStack ? (
        <div className="mt-3 min-h-[1.75rem] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
          <CarouselStackStrip tools={tools} ink={stackInk} rule={`${stackInk}55`} />
        </div>
      ) : null}
    </div>
  );

  const wrapClass =
    'group block shrink-0 outline-none transition duration-300 ease-out focus-visible:ring-2 focus-visible:ring-current';

  if (href) {
    const external = /^https?:\/\//i.test(href);
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={wrapClass}
          aria-label={title || 'Project'}
        >
          {media}
        </a>
      );
    }
    return (
      <Link href={href} className={wrapClass} aria-label={title || 'Project'}>
        {media}
      </Link>
    );
  }

  return <div className="group shrink-0">{media}</div>;
}

export function ProjectsCarouselSectionHeader({
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

/** Header + image-only carousel with prev/next — Projects carousel design only. */
export function ProjectsCarouselSection({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  trailing,
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  trailing?: ReactNode;
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const settings = mergeProjectsCarouselSettings(
    DEFAULT_PROJECTS_CAROUSEL_SETTINGS,
    presentation.projectsCarousel
  );
  const [carouselIndex, setCarouselIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { stepPx, maxIndex } = useCarouselSlideMetrics(
    viewportRef,
    items.length,
    settings.imageSize ?? 'lg',
    settings.gap ?? 'md'
  );
  const activeIndex = Math.max(0, Math.min(carouselIndex, maxIndex));
  const translateX = stepPx > 0 ? activeIndex * stepPx : 0;
  const canNav = items.length > 1 && maxIndex > 0;
  const color = presentation.titleColor;
  const borderColor = presentation.cardBorderColor || presentation.subtitleColor;
  const surfaceColor = presentation.cardBackgroundColor || '#ffffff';

  useEffect(() => {
    setCarouselIndex(0);
  }, [items.length, settings.imageSize, settings.gap, settings.aspectRatio]);

  useEffect(() => {
    setCarouselIndex((index) => Math.max(0, Math.min(index, maxIndex)));
  }, [maxIndex]);

  const carouselNav = canNav ? (
    <ProjectsCarouselNavButtons
      color={color}
      borderColor={borderColor}
      surfaceColor={surfaceColor}
      canPrev={activeIndex > 0}
      canNext={activeIndex < maxIndex}
      onPrev={() => setCarouselIndex((index) => Math.max(0, index - 1))}
      onNext={() => setCarouselIndex((index) => Math.min(maxIndex, index + 1))}
    />
  ) : null;

  const headerTrailing =
    trailing || carouselNav ? (
      <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
        {trailing}
        {carouselNav}
      </div>
    ) : null;

  if (items.length === 0) {
    return (
      <ProjectsCarouselSectionHeader
        title={title}
        subtitle={subtitle}
        titleColor={titleColor}
        subtitleColor={subtitleColor}
        trailing={headerTrailing}
      />
    );
  }

  const focusBlurSiblings = settings.focusBlurSiblings !== false;

  return (
    <div className="w-full">
      <ProjectsCarouselSectionHeader
        title={title}
        subtitle={subtitle}
        titleColor={titleColor}
        subtitleColor={subtitleColor}
        trailing={headerTrailing}
      />
      <div
        ref={viewportRef}
        className="overflow-hidden"
        aria-roledescription="carousel"
        aria-label={title.trim() || 'Selected work'}
      >
        <div
          data-projects-carousel-track
          className={`group/carousel flex ${carouselGapClass(settings.gap ?? 'md')} transform-gpu will-change-transform [transition:transform_520ms_cubic-bezier(0.33,1,0.68,1)]`}
          style={{ transform: `translate3d(-${translateX}px, 0, 0)` }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              data-projects-carousel-item
              className={`shrink-0 transition-[filter,opacity] duration-500 ease-out ${
                focusBlurSiblings
                  ? 'group-hover/carousel:opacity-70 group-hover/carousel:blur-[1.5px] group-focus-within/carousel:opacity-70 group-focus-within/carousel:blur-[1.5px] hover:!opacity-100 hover:!blur-none focus-within:!opacity-100 focus-within:!blur-none'
                  : ''
              }`}
            >
              <CarouselSlide item={item} presentation={presentation} settings={settings} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function isProjectsCarouselDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-carousel';
}
