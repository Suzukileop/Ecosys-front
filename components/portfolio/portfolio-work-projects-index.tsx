'use client';

import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsIndexSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_INDEX_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsIndexSettings,
} from '@/components/portfolio/portfolio-work-settings';

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function formatIndexNumber(index: number): string {
  return String(index + 1).padStart(3, '0');
}

function indexRowPaddingClass(gap: PortfolioWorkProjectsIndexSettings['rowGap']): string {
  if (gap === 'tight') return 'py-7 sm:py-8';
  if (gap === 'xl') return 'py-14 sm:py-16 lg:py-20';
  return 'py-10 sm:py-12 lg:py-14';
}

/**
 * Index design header — title + optional subtitle.
 */
export function ProjectsIndexSectionHeader({
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
    <header className={`mb-10 w-full sm:mb-14 ${className}`.trim()}>
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

function IndexStack({
  tools,
  surface,
  ink,
  border,
}: {
  tools: string[];
  surface: string;
  ink: string;
  border: string;
}) {
  if (tools.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stack">
      {tools.map((tool) => (
        <li
          key={tool}
          className="rounded-full px-3 py-1.5 text-xs font-medium sm:text-[13px]"
          style={{
            backgroundColor: surface,
            color: ink,
            border: `1px solid ${border}`,
          }}
        >
          {tool}
        </li>
      ))}
    </ul>
  );
}

function IndexMarker({
  index,
  marker,
  accent,
  muted,
}: {
  index: number;
  marker: 'number' | 'bullet';
  accent: string;
  muted: string;
}) {
  if (marker === 'bullet') {
    return (
      <span
        className="mt-2.5 inline-flex h-2 w-2 shrink-0 rounded-full lg:mt-3"
        style={{ backgroundColor: accent || muted }}
        aria-hidden
      />
    );
  }
  return (
    <p
      className="pt-1 text-sm font-medium tracking-[0.04em] tabular-nums lg:pt-2"
      style={{ color: muted }}
    >
      {formatIndexNumber(index)}
    </p>
  );
}

function IndexRow({
  item,
  index,
  presentation,
  board,
  showRule,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  board: PortfolioWorkProjectsIndexSettings;
  showRule: boolean;
}) {
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const rule = presentation.cardBorderColor || muted;
  const chipSurface = presentation.cardBackgroundEnabled
    ? presentation.cardBackgroundColor
    : `${rule}33`;
  const tools = workToolLabels(item);
  const description = item.description?.trim() || '';
  const showStack = board.showStack && tools.length > 0;
  const showDescription = board.showDescription && Boolean(description);

  return (
    <div>
      <div
        className={`grid grid-cols-1 gap-5 sm:gap-6 ${indexRowPaddingClass(board.rowGap)} lg:grid-cols-[3.25rem_minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-x-10 xl:grid-cols-[3.5rem_minmax(0,1.45fr)_minmax(0,0.78fr)] xl:gap-x-14`}
      >
        {board.showNumber ? (
          <div className="flex justify-start lg:justify-center">
            <IndexMarker
              index={index}
              marker={board.indexMarker ?? 'number'}
              accent={accent}
              muted={muted}
            />
          </div>
        ) : (
          <span className="hidden lg:block" aria-hidden />
        )}

        <div className="min-w-0">
          <h3
            className="text-2xl font-extrabold uppercase tracking-[-0.03em] sm:text-3xl lg:text-[2.15rem] lg:leading-[1.15]"
            style={{ color: titleColor }}
          >
            {item.title}
          </h3>
          {showStack ? (
            <IndexStack tools={tools} surface={chipSurface} ink={muted} border={rule} />
          ) : null}
        </div>

        {showDescription ? (
          <p
            className="max-w-md text-sm leading-relaxed sm:text-[15px] lg:justify-self-end lg:pt-1 lg:text-right xl:max-w-sm"
            style={{ color: muted }}
          >
            {description}
          </p>
        ) : (
          <span className="hidden lg:block" aria-hidden />
        )}
      </div>

      {showRule ? (
        <div className="h-px w-full" style={{ backgroundColor: rule }} aria-hidden />
      ) : null}
    </div>
  );
}

/** Numbered rows + thin separators — Projects index design only. */
export function ProjectsIndexGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  if (items.length === 0) return null;

  const board = mergeProjectsIndexSettings(
    DEFAULT_PROJECTS_INDEX_SETTINGS,
    presentation.projectsIndex
  );
  const rule = presentation.cardBorderColor || presentation.subtitleColor;

  return (
    <div className="w-full">
      <div className="h-px w-full" style={{ backgroundColor: rule }} aria-hidden />
      {items.map((item, index) => (
        <IndexRow
          key={item.id}
          item={item}
          index={index}
          presentation={presentation}
          board={board}
          showRule
        />
      ))}
    </div>
  );
}

export function isProjectsIndexDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-index';
}
