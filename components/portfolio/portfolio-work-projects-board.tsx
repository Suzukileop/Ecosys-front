'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type { PortfolioWorkPresentationSettings } from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_BOARD_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
} from '@/components/portfolio/portfolio-work-settings';

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

/**
 * Header for Projects board: small accent title → short headline.
 * No separator rule (keeps spacing tight above the grid).
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
  const kicker = title.trim();
  const headline = subtitle?.trim() || '';

  return (
    <header className={`mb-8 w-full sm:mb-10 ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          {kicker ? (
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: accentColor }}
            >
              {kicker}
            </p>
          ) : null}
          {headline ? (
            <h2
              className={`text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15] ${
                kicker ? 'mt-2.5' : ''
              }`}
              style={{ color: titleColor || subtitleColor }}
            >
              {headline}
            </h2>
          ) : kicker ? (
            <h2
              className="mt-2.5 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
              style={{ color: titleColor }}
            >
              {kicker}
            </h2>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}

function ConsultHoverButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const external = /^https?:\/\//i.test(href);
  const className =
    'pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold tracking-[-0.01em] text-neutral-950 shadow-[0_8px_28px_rgba(0,0,0,0.28)] backdrop-blur-sm transition duration-300 ease-out translate-y-1 opacity-0 group-hover/thumb:translate-y-0 group-hover/thumb:opacity-100';

  const content = (
    <>
      <span>{label}</span>
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3.5 8h9M8.5 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function ProjectsBoardThumbnail({
  url,
  alt,
  surface,
  consultHref,
  consultLabel,
  showConsult,
}: {
  url: string;
  alt: string;
  surface: string;
  consultHref?: string | null;
  consultLabel: string;
  showConsult: boolean;
}) {
  const consult = showConsult && consultHref?.trim();

  return (
    <div
      className="group/thumb relative aspect-[16/10] w-full overflow-hidden"
      style={{ backgroundColor: surface }}
    >
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover/thumb:scale-[1.12]"
      />
      {consult ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-950/0 transition-colors duration-500 ease-out group-hover/thumb:bg-neutral-950/45"
          aria-hidden={!consult}
        >
          <ConsultHoverButton href={consultHref!.trim()} label={consultLabel} />
        </div>
      ) : null}
    </div>
  );
}

function ProjectsBoardCard({
  item,
  presentation,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
}) {
  const board = presentation.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS;
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const tools = workToolLabels(item, presentation.maxToolsShown ?? 12);
  const description = item.description?.trim() || '';
  const href = item.linkUrl?.trim() || null;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const showThumb = board.showThumbnail && Boolean(mediaUrl);
  const showRole = board.showRole && Boolean(role);
  const showCategory = board.showCategory && Boolean(category);
  const showMetaRow = showRole || showCategory;
  const showConsult = board.showConsultOnHover && Boolean(href);

  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const mutedMeta = presentation.subtitleColor || presentation.categoryMutedColor;
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const descriptionColor =
    presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const tagInk = presentation.elementStyles?.toolsList?.color || presentation.subtitleColor;
  const tagSurface = presentation.cardBorderColor;
  const cardBg = presentation.cardBackgroundEnabled
    ? presentation.cardBackgroundColor
    : 'transparent';
  const cardBorder =
    presentation.cardBorder === 'none' ? 'transparent' : presentation.cardBorderColor;

  const consultLabel = board.consultLabel?.trim() || 'Consult';

  const textBlock = (
    <div className={`flex flex-1 flex-col ${showThumb ? 'p-6 sm:p-7' : ''}`}>
      {showMetaRow ? (
        <div className="flex items-baseline justify-between gap-3">
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
              style={{ color: mutedMeta }}
            >
              {category}
            </p>
          ) : null}
        </div>
      ) : null}
      {presentation.showCardTitle !== false ? (
        <h3
          className={`text-xl font-bold tracking-[-0.02em] sm:text-2xl ${
            showMetaRow ? 'mt-2.5' : ''
          }`}
          style={{ color: titleColor }}
        >
          {item.title}
        </h3>
      ) : null}
      {presentation.showCardDescription !== false && description ? (
        <p
          className="mt-3 text-sm leading-relaxed sm:text-[15px]"
          style={{ color: descriptionColor }}
        >
          {description}
        </p>
      ) : null}
      {presentation.showCardTools !== false && tools.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {tools.map((tool) => (
            <li
              key={tool}
              className="rounded-md px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: tagSurface,
                color: tagInk,
              }}
            >
              {tool}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  const shellStyle: CSSProperties = {
    backgroundColor: cardBg,
    borderColor: cardBorder,
  };

  const shellClass = showThumb
    ? 'flex h-full flex-col overflow-hidden rounded-2xl border transition-colors'
    : 'flex h-full flex-col rounded-2xl border p-6 sm:p-7 transition-colors';

  return (
    <article className={shellClass} style={shellStyle}>
      {showThumb && mediaUrl ? (
        <ProjectsBoardThumbnail
          url={mediaUrl}
          alt={item.title}
          surface={tagSurface || cardBg}
          consultHref={href}
          consultLabel={consultLabel}
          showConsult={showConsult}
        />
      ) : null}
      {textBlock}
    </article>
  );
}

/** Two-up project cards — Projects board design only. */
export function ProjectsBoardGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
  forceSingleColumn = false,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
  forceSingleColumn?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div
      className={
        forceSingleColumn
          ? 'grid grid-cols-1 gap-4 sm:gap-5'
          : 'grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2'
      }
    >
      {items.map((item) => (
        <ProjectsBoardCard key={item.id} item={item} presentation={presentation} />
      ))}
    </div>
  );
}

export function isProjectsBoardDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-board';
}
