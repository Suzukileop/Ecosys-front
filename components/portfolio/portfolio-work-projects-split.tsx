'use client';

import Image from 'next/image';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsSplitSettings,
  PortfolioWorkProjectsSplitRadius,
  PortfolioWorkProjectsSplitThumbnailSize,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_SPLIT_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsSplitSettings,
} from '@/components/portfolio/portfolio-work-settings';

function splitThumbRadiusClass(radius: PortfolioWorkProjectsSplitRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'md') return 'rounded-2xl';
  return 'rounded-[1.75rem] sm:rounded-[2rem]';
}

function splitThumbSizeClass(size: PortfolioWorkProjectsSplitThumbnailSize): string {
  const base = 'relative aspect-square w-full shrink-0 overflow-hidden sm:aspect-[5/4] lg:aspect-square';
  switch (size) {
    case 'lg':
      return `${base} sm:w-[min(44%,22rem)] md:w-[min(42%,26rem)] lg:w-[min(40%,30rem)] xl:w-[min(38%,34rem)]`;
    case 'half':
      return `${base} sm:w-1/2`;
    default:
      return `${base} sm:w-[min(52%,28rem)] md:w-[min(50%,32rem)] lg:w-[min(48%,36rem)] xl:w-[min(46%,40rem)]`;
  }
}

function splitRowGapClass(gap: PortfolioWorkProjectsSplitSettings['rowGap']): string {
  if (gap === 'tight') return 'gap-y-10 sm:gap-y-12';
  if (gap === 'xl') return 'gap-y-16 sm:gap-y-20 lg:gap-y-24';
  return 'gap-y-12 sm:gap-y-16 lg:gap-y-20';
}

export function ProjectsSplitSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  className?: string;
}) {
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  if (!heading && !sub) return null;

  return (
    <header className={`mb-10 w-full sm:mb-12 ${className}`.trim()}>
      {heading ? (
        <h2
          className="max-w-3xl text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-5xl lg:leading-[1.12]"
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
    </header>
  );
}

function SplitRow({
  item,
  presentation,
  settings,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsSplitSettings;
}) {
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const borderColor = presentation.cardBorderColor || muted;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const description = item.description?.trim() || '';
  const showDescription = settings.showDescription !== false;
  const radiusClass = splitThumbRadiusClass(settings.thumbnailRadius ?? 'none');
  const thumbClass = splitThumbSizeClass(settings.thumbnailSize ?? 'xl');

  return (
    <article className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8 lg:gap-10 xl:gap-12">
      <div className={`${thumbClass} ${radiusClass}`} style={{ backgroundColor: `${borderColor}44` }}>
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
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

      <div className="min-w-0 flex-1 sm:pt-0.5 lg:pt-1">
        <h3
          className="text-2xl font-bold leading-[1.15] tracking-[-0.02em] sm:text-[1.65rem] lg:text-3xl xl:text-[2rem]"
          style={{ color: titleColor }}
        >
          {item.title}
        </h3>
        {showDescription && description ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed sm:mt-4 sm:text-base" style={{ color: muted }}>
            {description}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** Large thumbnail left + top-aligned title right — Split design only. */
export function ProjectsSplitGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  if (items.length === 0) return null;

  const settings = mergeProjectsSplitSettings(
    DEFAULT_PROJECTS_SPLIT_SETTINGS,
    presentation.projectsSplit
  );

  return (
    <div className={`flex flex-col ${splitRowGapClass(settings.rowGap ?? 'md')}`}>
      {items.map((item) => (
        <SplitRow key={item.id} item={item} presentation={presentation} settings={settings} />
      ))}
    </div>
  );
}

export function isProjectsSplitDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-split';
}
