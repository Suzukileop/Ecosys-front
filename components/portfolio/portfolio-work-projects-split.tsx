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

function splitThumbSizeClass(
  size: PortfolioWorkProjectsSplitThumbnailSize,
  centered: boolean
): string {
  const base = 'relative aspect-square shrink-0 overflow-hidden sm:aspect-[5/4] lg:aspect-square';
  if (centered) {
    switch (size) {
      case 'lg':
        return `${base} w-[min(100%,22rem)] sm:w-[26rem] lg:w-[30rem]`;
      case 'half':
        return `${base} w-[min(100%,36rem)] sm:w-[min(50vw,34rem)] lg:w-[min(48vw,38rem)]`;
      default:
        return `${base} w-[min(100%,28rem)] sm:w-[32rem] lg:w-[36rem] xl:w-[40rem]`;
    }
  }
  switch (size) {
    case 'lg':
      return `${base} w-full sm:w-[min(44%,22rem)] md:w-[min(42%,26rem)] lg:w-[min(40%,30rem)] xl:w-[min(38%,34rem)]`;
    case 'half':
      return `${base} w-full sm:w-1/2`;
    default:
      return `${base} w-full sm:w-[min(52%,28rem)] md:w-[min(50%,32rem)] lg:w-[min(48%,36rem)] xl:w-[min(46%,40rem)]`;
  }
}

function splitRowGapClass(gap: PortfolioWorkProjectsSplitSettings['rowGap']): string {
  if (gap === 'tight') return 'gap-y-10 sm:gap-y-12';
  if (gap === 'xl') return 'gap-y-32 sm:gap-y-44 lg:gap-y-56 xl:gap-y-64';
  return 'gap-y-20 sm:gap-y-32 lg:gap-y-40 xl:gap-y-48';
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
          className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl lg:leading-[1.12]"
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
  index,
  presentation,
  settings,
}: {
  item: MarketplaceContentItem;
  index: number;
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

  const centered = settings.imageSide === 'center';
  const titleOnLeft = centered
    ? (settings.titleSide ?? 'left') !== 'right'
    : settings.imageSide === 'right';
  const titleAtBottom = centered && (settings.titleVerticalAlign ?? 'top') === 'bottom';
  const descriptionOpposite =
    centered && settings.descriptionPlacement === 'opposite' && showDescription && Boolean(description);
  const descriptionOnLeft = descriptionOpposite ? !titleOnLeft : titleOnLeft;
  const descriptionAtBottom =
    descriptionOpposite
      ? (settings.descriptionVerticalAlign ?? 'bottom') === 'bottom'
      : titleAtBottom;
  const baseRight = settings.imageSide === 'right';
  const imageOnRight =
    !centered &&
    (settings.alternateSides ? (index % 2 === 1 ? !baseRight : baseRight) : baseRight);
  const thumbClass = splitThumbSizeClass(settings.thumbnailSize ?? 'xl', centered);

  const titleOnly = (
    <div className={`min-w-0 ${centered ? 'w-full max-w-md' : 'flex-1 sm:pt-0.5 lg:pt-1'}`}>
      <h3
        className="text-2xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[1.65rem] lg:text-3xl xl:text-[2rem]"
        style={{ color: titleColor }}
      >
        {item.title}
      </h3>
      {!descriptionOpposite && showDescription && description ? (
        <p className="mt-3 max-w-xl text-sm leading-relaxed sm:mt-4 sm:text-base" style={{ color: muted }}>
          {description}
        </p>
      ) : null}
    </div>
  );

  const descriptionOnly =
    descriptionOpposite && description ? (
      <div className="min-w-0 w-full max-w-md">
        <p className="m-0 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: muted }}>
          {description}
        </p>
      </div>
    ) : null;

  const titleBlock = titleOnly;

  const mediaBlock = (
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
  );

  if (centered) {
    const renderSide = (side: 'left' | 'right') => {
      const isLeft = side === 'left';
      const hasTitle = titleOnLeft === isLeft;
      const hasDesc = Boolean(descriptionOpposite && descriptionOnLeft === isLeft);
      const isRight = !isLeft;
      const sideClass = isRight ? 'justify-self-end' : 'justify-self-start';
      // Title on the right stays right-aligned; description is always left-aligned.
      const titleAlignClass = isRight ? `${sideClass} text-right` : sideClass;

      if (!hasTitle && !hasDesc) {
        return <div className="min-w-0" aria-hidden />;
      }

      if (hasTitle && !hasDesc) {
        return (
          <div className={`min-w-0 ${titleAtBottom ? 'self-end' : 'self-start'} ${titleAlignClass}`}>
            {titleBlock}
          </div>
        );
      }

      if (!hasTitle && hasDesc) {
        return (
          <div
            className={`min-w-0 text-left ${descriptionAtBottom ? 'self-end' : 'self-start'} ${sideClass}`}
          >
            {descriptionOnly}
          </div>
        );
      }

      return (
        <div
          className={`flex min-w-0 flex-col ${titleAtBottom ? 'self-end' : 'self-start'} ${titleAlignClass}`}
        >
          {titleBlock}
        </div>
      );
    };

    return (
      <article className="w-full">
        <div className="flex flex-col gap-5 sm:hidden">
          {titleBlock}
          <div className="flex w-full justify-center">{mediaBlock}</div>
          {descriptionOpposite ? descriptionOnly : null}
        </div>
        <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch sm:gap-x-8 lg:gap-x-10 xl:gap-x-12">
          {renderSide('left')}
          <div className="w-max max-w-full justify-self-center self-start">{mediaBlock}</div>
          {renderSide('right')}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`flex flex-col gap-5 sm:items-start sm:gap-8 lg:gap-10 xl:gap-12 ${
        imageOnRight ? 'sm:flex-row-reverse' : 'sm:flex-row'
      }`}
    >
      {mediaBlock}
      {titleBlock}
    </article>
  );
}

/** Large thumbnail + top-aligned title — Split design only. */
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
      {items.map((item, index) => (
        <SplitRow
          key={item.id}
          item={item}
          index={index}
          presentation={presentation}
          settings={settings}
        />
      ))}
    </div>
  );
}

export function isProjectsSplitDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-split';
}
