'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsFramesCardGap,
  PortfolioWorkProjectsFramesRadius,
  PortfolioWorkProjectsFramesThumbnailSize,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_FRAMES_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsFramesSettings,
} from '@/components/portfolio/portfolio-work-settings';

function workToolLabels(item: MarketplaceContentItem, max = 10): string[] {
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

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  const genre = item.genre?.trim();
  const role = item.role?.trim();
  if (genre && genre !== role) return genre;
  return '';
}

function framesThumbSizeClass(size: PortfolioWorkProjectsFramesThumbnailSize): string {
  const base = 'relative aspect-[16/10] w-full shrink-0 overflow-hidden md:aspect-auto';
  switch (size) {
    case 'md':
      return `${base} md:w-[min(48%,26rem)] md:min-h-[16rem] lg:w-[min(46%,28rem)] lg:min-h-[17rem] xl:min-h-[18rem]`;
    case 'lg':
      return `${base} md:w-[min(58%,34rem)] md:min-h-[20rem] lg:w-[min(56%,38rem)] lg:min-h-[22rem] xl:min-h-[23rem]`;
    case 'xl':
      return `${base} md:w-[min(74%,48rem)] md:min-h-[26rem] lg:w-[min(72%,52rem)] lg:min-h-[28rem] xl:w-[min(70%,56rem)] xl:min-h-[30rem]`;
    case 'half':
      return `${base} md:w-1/2 md:min-h-[26rem] lg:min-h-[30rem] xl:min-h-[34rem]`;
    case 'xxl':
    default:
      return `${base} md:w-[min(86%,60rem)] md:min-h-[30rem] lg:w-[min(84%,68rem)] lg:min-h-[34rem] xl:w-[min(82%,74rem)] xl:min-h-[38rem]`;
  }
}

function framesCardRadiusClass(radius: PortfolioWorkProjectsFramesRadius): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'md') return 'rounded-2xl';
  return 'rounded-[1.75rem] sm:rounded-[2rem]';
}

/** Thumbnail corners follow the card; flush images only round the outer edge. */
function framesThumbRadiusClass(
  radius: PortfolioWorkProjectsFramesRadius,
  flush: boolean,
  imageOnRight: boolean
): string {
  if (radius === 'none') return 'rounded-none';

  if (!flush) {
    if (radius === 'md') return 'rounded-xl';
    return 'rounded-[1.15rem] sm:rounded-[1.35rem]';
  }

  // Flush to card edge — round only the outer corners that meet the card shell.
  if (radius === 'md') {
    return imageOnRight
      ? 'rounded-t-2xl md:rounded-t-none md:rounded-r-2xl'
      : 'rounded-t-2xl md:rounded-t-none md:rounded-l-2xl';
  }
  return imageOnRight
    ? 'rounded-t-[1.75rem] md:rounded-t-none md:rounded-r-[2rem]'
    : 'rounded-t-[1.75rem] md:rounded-t-none md:rounded-l-[2rem]';
}
function framesCardGapClass(gap: PortfolioWorkProjectsFramesCardGap): string {
  if (gap === 'md') return 'gap-16 sm:gap-20 lg:gap-24';
  if (gap === 'xl') return 'gap-24 sm:gap-32 lg:gap-40';
  return 'gap-7 sm:gap-9 lg:gap-10';
}

/**
 * Frames design header — compact title + optional subtitle.
 */
export function ProjectsFramesSectionHeader({
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

/** Stack as plain labels separated by hairlines — not pill tags. */
function FramesStackLine({
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
    <ul className="flex flex-wrap items-center gap-x-0 gap-y-2" aria-label="Stack">
      {tools.map((tool, index) => (
        <li key={tool} className="flex items-center">
          {index > 0 ? (
            <span
              className="mx-2.5 h-3 w-px shrink-0 sm:mx-3"
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

function FramesCard({
  item,
  presentation,
  imageOnRight,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  imageOnRight: boolean;
}) {
  const board = mergeProjectsFramesSettings(
    DEFAULT_PROJECTS_FRAMES_SETTINGS,
    presentation.projectsFrames
  );
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item);
  const href = item.linkUrl?.trim() || null;
  const mediaUrl = item.mediaUrl?.trim() || null;

  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const cardBg = presentation.cardBackgroundEnabled
    ? presentation.cardBackgroundColor
    : 'transparent';
  const border =
    presentation.cardBorder === 'none' ? 'transparent' : presentation.cardBorderColor;

  const showRole = board.showRole && Boolean(role);
  const showCategory = board.showCategory && Boolean(category);
  const showMeta = showRole || showCategory;
  const showDescription = board.showDescription && Boolean(description);
  const showStack = board.showStack && tools.length > 0;
  const showConsult = board.showConsult && Boolean(href);
  const consultLabel = board.consultLabel.trim() || 'Consult';
  const flushImage = board.imagePadding === false;
  const radius = board.radius;
  const halfSplit = board.thumbnailSize === 'half';

  const media = (
    <div
      className={`${framesThumbSizeClass(board.thumbnailSize)} ${framesThumbRadiusClass(
        radius,
        flushImage,
        imageOnRight
      )} ${halfSplit ? 'md:basis-1/2 md:grow-0' : ''}`}
      style={{ backgroundColor: border === 'transparent' ? `${muted}22` : `${border}66` }}
    >
      {mediaUrl ? (
        <Image
          src={mediaUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 70vw"
          className="object-cover object-center"
        />
      ) : (
        <div
          className="flex h-full min-h-[11rem] w-full items-center justify-center px-6 text-center text-sm"
          style={{ color: muted }}
        >
          Add a thumbnail in Information → Portfolio
        </div>
      )}
    </div>
  );

  const info = (
    <div
      className={`flex min-w-0 flex-col ${
        halfSplit ? 'md:w-1/2 md:basis-1/2 md:grow-0 md:shrink-0' : 'flex-1'
      } ${
        flushImage
          ? 'px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-5'
          : 'px-1 pb-1 pt-0.5 sm:px-1.5 md:py-1'
      }`}
    >
      {showMeta ? (
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          {showRole ? (
            <p
              className="min-w-0 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ color: accent }}
            >
              {role}
            </p>
          ) : (
            <span />
          )}
          {showCategory ? (
            <p
              className="shrink-0 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ color: muted }}
            >
              {category}
            </p>
          ) : null}
        </div>
      ) : null}

      <h3
        className="text-xl font-bold tracking-[-0.02em] sm:text-2xl"
        style={{ color: titleColor }}
      >
        {item.title}
      </h3>

      {showDescription ? (
        <p
          className="mt-3 max-w-xl text-sm leading-relaxed sm:text-[15px]"
          style={{ color: muted }}
        >
          {description}
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-4 pt-6 sm:pt-8">
        {showStack ? (
          <FramesStackLine
            tools={tools}
            ink={muted}
            rule={border === 'transparent' ? muted : border}
          />
        ) : null}
        {showConsult && href ? (
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
            style={{ color: accent || titleColor }}
          >
            <span>{consultLabel}</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  );

  return (
    <article
      className={`overflow-hidden ${
        presentation.cardBorder === 'none' ? 'border-0' : 'border'
      } ${framesCardRadiusClass(radius)}`}
      style={{
        backgroundColor: cardBg,
        borderColor: border,
      }}
    >
      <div
        className={`flex flex-col md:items-stretch ${
          flushImage
            ? 'gap-0 p-0 md:gap-0'
            : 'gap-4 p-3 sm:gap-5 sm:p-3.5 md:gap-6 md:p-4'
        } ${imageOnRight ? 'md:flex-row-reverse' : 'md:flex-row'}`}
      >
        {media}
        {info}
      </div>
    </article>
  );
}

/** Horizontal image + info frames — Projects frames design only. */
export function ProjectsFramesGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  if (items.length === 0) return null;

  const board = mergeProjectsFramesSettings(
    DEFAULT_PROJECTS_FRAMES_SETTINGS,
    presentation.projectsFrames
  );

  return (
    <div className={`flex w-full flex-col ${framesCardGapClass(board.cardGap)}`}>
      {items.map((item, index) => {
        const baseRight = board.imageSide === 'right';
        const imageOnRight = board.alternateSides
          ? index % 2 === 1
            ? !baseRight
            : baseRight
          : baseRight;
        return (
          <FramesCard
            key={item.id}
            item={item}
            presentation={presentation}
            imageOnRight={imageOnRight}
          />
        );
      })}
    </div>
  );
}

export function isProjectsFramesDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-frames';
}
