'use client';

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  resolveToolLevelPercent,
  useToolLevelBarColor,
} from '@/components/creator/studio/creator-tool-logo-color';
import type { ProfileStrengthToolLevel } from '@/types/ecosystem';
import {
  resolveSkillDescription,
  resolveSkillIconUrl,
  resolveSkillLevel,
  resolveSkillLevelLabel,
  resolveSkillName,
  resolveSkillCategory,
  resolveSkillCategoryDisplay,
  compareSkillsByCategoryThenName,
  compareSkillsByLevelThenName,
  collectSkillCategories,
  groupSkillsByCategory,
  resolveSkillUseCases,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import {
  ToolsBrandDirectoryLevelIndicator,
  ToolsLevelCircularRingWithLogo,
  ToolsLevelIndicatorDisplay,
  ToolsLevelProgressBar,
  ToolsLevelStarRating,
  ToolsLevelSvgRingWithLabel,
  resolveToolsLevelBarColors,
  resolveToolsLevelSemanticColor,
} from '@/components/portfolio/portfolio-tools-level-indicators';
import {
  toolsBrandCardLogoPx,
  toolsBrandCardLogoTilePx,
  toolsBrandCardsGapClass,
  toolsBrandDirectoryGridClass,
  toolsBrandDirectoryRowPadClass,
  toolsBrandGridLargeColumnsClass,
  toolsBrandRowCellPadClass,
  toolsBrandRowGridClass,
  toolsBrandRowGridGapClass,
  toolsBrandFloatFixedGridClass,
  toolsBrandFloatGapClass,
  toolsBrandFloatMinTilePx,
  toolsContentAlignWrapperClass,
  toolsLabelColorStyle,
  resolveToolsDesignBrandColumnsPerRow,
  resolveToolsDesignContentAlignment,
  toolsLevelCircularCardsGridClass,
  LEVEL_STAR_CARDS_COLUMNS_PER_ROW,
  toolsLevelStarCardsGridClass,
  toolsLevelCircularLogoPx,
  toolsLevelCircularRingPx,
  toolsLevelSvgRingPx,
  toolsLevelIndicatorGridGapClass,
  toolsLevelBentoEqualColumnsClass,
  toolsLevelBentoGridGapClass,
  toolsLevelProgressRowsGridGapClass,
  toolsLevelProgressRowsRowClass,
  toolsLogoSizePx,
  toolsShowcaseLogoPx,
  toolsTileSizePx,
  toolsWorkflowRailGapClass,
  toolsWorkflowRailJustifyClass,
  resolveToolsIconBackgroundEnabled,
  resolveToolsLevelBarSize,
  resolveToolsLevelBarStyle,
  resolveToolsLevelIndicatorCardFramed,
  resolveToolsCardSurfaceColor,
  resolveToolsLevelIndicatorDisplayStyle,
  resolveToolsLevelIndicatorFullWidth,
  resolveToolsLevelIndicatorShowCategoryFilter,
  resolveToolsLevelTableGroupBy,
  resolveToolsShowLevel,
  isToolsLevelIndicatorDesign,
  toolsDesignSupportsCategoryFilter,
  toolsLevelBarPercentClass,
  type PortfolioToolsCardGap,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

/** Visible tile fill behind the icon (transparent when chip bg is off). */
function toolsIconFrameBackground(presentation: PortfolioToolsPresentationSettings): string {
  return resolveToolsIconBackgroundEnabled(presentation)
    ? presentation.tileBackgroundColor
    : 'transparent';
}

/**
 * Solid surface hex for logo contrast — never `"transparent"`.
 * Uses chip fill when enabled, else card surface, else mode proxy.
 */
function toolsLogoContrastBackground(
  presentation: PortfolioToolsPresentationSettings
): string {
  if (resolveToolsIconBackgroundEnabled(presentation)) {
    return presentation.tileBackgroundColor;
  }
  const card = presentation.cardBackgroundColor?.trim();
  if (card && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(card)) {
    return card;
  }
  return presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#ffffff';
}

function toolsLogoColorMode(
  presentation: PortfolioToolsPresentationSettings
): 'light' | 'dark' {
  return presentation.activeColorMode === 'light' ? 'light' : 'dark';
}

function toolsLogosGrayscaleEnabled(presentation: PortfolioToolsPresentationSettings): boolean {
  return presentation.logosGrayscale === true;
}

/** Level bars / % — follow palette ink when logos are grayscale (no brand tints). */
function toolsLevelIndicatorFillColor(
  presentation: PortfolioToolsPresentationSettings,
  logoDerivedColor: string
): string {
  if (!toolsLogosGrayscaleEnabled(presentation)) {
    return logoDerivedColor;
  }
  const label = presentation.labelColor?.trim();
  if (label) return label;
  return presentation.activeColorMode === 'dark' ? '#f5f5f5' : '#171717';
}

const TABLE_LEVEL_TEXT_COLORS: Record<ProfileStrengthToolLevel, string> = {
  beginner: '#f87171',
  intermediate: '#fb923c',
  advanced: '#60a5fa',
  expert: '#34d399',
};

function toolsTableLevelTextColor(
  level: ProfileStrengthToolLevel,
  presentation: PortfolioToolsPresentationSettings
): string {
  if (toolsLogosGrayscaleEnabled(presentation)) {
    const label = presentation.labelColor?.trim();
    if (label) return label;
    return presentation.activeColorMode === 'dark' ? '#f5f5f5' : '#171717';
  }
  return TABLE_LEVEL_TEXT_COLORS[level];
}

function ToolsLevelCategoryFilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  presentation,
}: {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  presentation: PortfolioToolsPresentationSettings;
}) {
  const filterAccent =
    presentation.levelAccentColor?.trim() || presentation.labelColor?.trim() || '#ea580c';
  const filterInactiveText = presentation.descriptionColor?.trim() || '#737373';
  const filterBorder = presentation.cardBorderColor?.trim() || '#e5e5e5';

  return (
    <div
      className="mb-5 flex flex-wrap gap-2 sm:mb-6"
      role="tablist"
      aria-label="Filter by category"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeCategory === 'all'}
        onClick={() => onCategoryChange('all')}
        className="rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition sm:text-sm"
        style={
          activeCategory === 'all'
            ? {
                borderColor: filterAccent,
                backgroundColor: filterAccent,
                color: presentation.chipTextColor?.trim() || '#ffffff',
              }
            : {
                borderColor: filterBorder,
                color: filterInactiveText,
                backgroundColor: 'transparent',
              }
        }
      >
        All
      </button>
      {categories.map((category) => {
        const selected = activeCategory.toLocaleLowerCase() === category.toLocaleLowerCase();
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onCategoryChange(category)}
            className="rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition sm:text-sm"
            style={
              selected
                ? {
                    borderColor: filterAccent,
                    backgroundColor: filterAccent,
                    color: presentation.chipTextColor?.trim() || '#ffffff',
                  }
                : {
                    borderColor: filterBorder,
                    color: filterInactiveText,
                    backgroundColor: 'transparent',
                  }
            }
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

export function EditorialToolsGallery({ tools, presentation }: ToolsGalleryProps) {
  const isLevelDesign = isToolsLevelIndicatorDesign(presentation.design);
  const supportsCategoryFilter = toolsDesignSupportsCategoryFilter(presentation.design);
  const categories = useMemo(
    () => (supportsCategoryFilter ? collectSkillCategories(tools) : []),
    [supportsCategoryFilter, tools]
  );
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (!supportsCategoryFilter || activeCategory === 'all') return;
    const stillExists = categories.some(
      (category) => category.toLocaleLowerCase() === activeCategory.toLocaleLowerCase()
    );
    if (!stillExists) setActiveCategory('all');
  }, [activeCategory, categories, supportsCategoryFilter]);

  const displayTools = useMemo(() => {
    if (!supportsCategoryFilter) return tools;
    const sorted = [...tools].sort(
      isLevelDesign && resolveToolsLevelTableGroupBy(presentation) === 'level'
        ? compareSkillsByLevelThenName
        : compareSkillsByCategoryThenName
    );
    const showFilter =
      resolveToolsLevelIndicatorShowCategoryFilter(presentation) && categories.length > 0;
    if (!showFilter || activeCategory === 'all') return sorted;
    return sorted.filter(
      (tool) =>
        resolveSkillCategory(tool).toLocaleLowerCase() === activeCategory.toLocaleLowerCase()
    );
  }, [activeCategory, categories, isLevelDesign, presentation, supportsCategoryFilter, tools]);

  const showCategoryFilter =
    supportsCategoryFilter &&
    resolveToolsLevelIndicatorShowCategoryFilter(presentation) &&
    categories.length > 0;

  let gallery: ReactNode;
  if (presentation.design === 'brand-cards') {
    gallery = <EditorialToolsBrandCards tools={tools} presentation={presentation} />;
  } else if (presentation.design === 'brand-directory') {
    gallery = <EditorialToolsBrandDirectory tools={tools} presentation={presentation} />;
  } else if (presentation.design === 'brand-index') {
    gallery = <EditorialToolsBrandIndex tools={displayTools} presentation={presentation} />;
  } else if (presentation.design === 'brand-row') {
    gallery = <EditorialToolsBrandRow tools={tools} presentation={presentation} />;
  } else if (presentation.design === 'brand-float') {
    gallery = <EditorialToolsBrandFloat tools={tools} presentation={presentation} />;
  } else if (presentation.design === 'level-stat-bars') {
    gallery = <EditorialToolsLevelStatBars tools={displayTools} presentation={presentation} />;
  } else if (presentation.design === 'level-progress-rows') {
    gallery = <EditorialToolsLevelProgressRows tools={displayTools} presentation={presentation} />;
  } else if (presentation.design === 'level-category-rows') {
    gallery = <EditorialToolsLevelCategoryRows tools={displayTools} presentation={presentation} />;
  } else if (presentation.design === 'level-table-rows') {
    gallery = <EditorialToolsLevelTableRows tools={displayTools} presentation={presentation} />;
  } else if (presentation.design === 'level-circular-cards') {
    gallery = <EditorialToolsLevelCircularCards tools={displayTools} presentation={presentation} />;
  } else if (presentation.design === 'level-star-cards') {
    gallery = <EditorialToolsLevelStarCards tools={displayTools} presentation={presentation} />;
  } else if (presentation.design === 'level-svg-rings') {
    gallery = <EditorialToolsLevelSvgRings tools={displayTools} presentation={presentation} />;
  } else if (presentation.design === 'level-bento-categories') {
    gallery = <EditorialToolsLevelBentoCategories tools={displayTools} presentation={presentation} />;
  } else {
    gallery = <EditorialToolsWorkflow tools={tools} presentation={presentation} />;
  }

  return (
    <div
      className={`${toolsContentAlignWrapperClass(presentation.design, presentation)}${
        presentation.design === 'level-table-rows' ? ' text-left' : ''
      }`}
    >
      {showCategoryFilter ? (
        <ToolsLevelCategoryFilterBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          presentation={presentation}
        />
      ) : null}
      {gallery}
    </div>
  );
}

/** Logo tiles + name — first Tools design. */
export function EditorialToolsWorkflow({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const tilePx = toolsTileSizePx(presentation.tileSize);
  const logoPx = toolsLogoSizePx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showLabels = presentation.showLabels !== false;

  return (
    <ul
      className={`flex w-full list-none flex-wrap items-start p-0 ${toolsWorkflowRailJustifyClass(resolveToolsDesignContentAlignment('workflow-rail', presentation))} ${toolsWorkflowRailGapClass(presentation.cardGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;
        return (
          <li
            key={key}
            className="flex flex-col items-center gap-3 sm:flex-none"
            style={{ minWidth: framePx }}
          >
            <div
              className="flex shrink-0 items-center justify-center rounded-[1.25rem]"
              style={{
                width: framePx,
                height: framePx,
                backgroundColor: tileBg,
              }}
            >
              <CreatorToolLogo
                label={name}
                iconUrl={resolveSkillIconUrl(tool)}
                size={logoPx}
                className="rounded-md"
                bgColor={logoContrastBg}
                colorMode={logoColorMode}
                grayscale={toolsLogosGrayscaleEnabled(presentation)}
              />
            </div>
            {showLabels ? (
              <span
                className="max-w-[7.5rem] text-center text-[0.8125rem] font-medium leading-snug tracking-tight sm:max-w-[8.5rem]"
                style={toolsLabelColorStyle(presentation.labelColor)}
              >
                {name}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Brand / Landbook / Framer-inspired dossier cards:
 * logo tile, level badge, name, description, use-case chips.
 */
export function EditorialToolsBrandCards({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const iconPlacement = presentation.brandCardsIconPlacement ?? 'top';
  const isHorizontal = iconPlacement === 'left';
  const logoPx = isHorizontal
    ? toolsShowcaseLogoPx(presentation.tileSize)
    : toolsBrandCardLogoPx(presentation.tileSize);
  const tilePx = isHorizontal
    ? Math.round(logoPx * 1.55)
    : toolsBrandCardLogoTilePx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showDescription = presentation.showDescription !== false;
  const showUseCases = presentation.showUseCases !== false;
  const showCategory = presentation.showCategory !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const showName = presentation.showLabels !== false;
  const columnsPerRow = resolveToolsDesignBrandColumnsPerRow('brand-cards', presentation);

  return (
    <ul
      className={`grid w-full list-none grid-cols-1 p-0 ${toolsBrandGridLargeColumnsClass(columnsPerRow)} ${toolsBrandCardsGapClass(presentation.cardGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const description = resolveSkillDescription(tool);
        const useCases = resolveSkillUseCases(tool);
        const level = resolveSkillLevelLabel(tool);
        const category = resolveSkillCategory(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        const logoTile = (
          <div
            className={`flex shrink-0 items-center justify-center rounded-2xl ${isHorizontal ? 'self-start transition duration-300 group-hover:scale-[1.03]' : ''}`}
            style={{
              width: framePx,
              height: framePx,
              backgroundColor: tileBg,
            }}
          >
            <CreatorToolLogo
              label={name}
              iconUrl={resolveSkillIconUrl(tool)}
              size={logoPx}
              className={isHorizontal ? 'rounded-xl' : 'rounded-lg'}
              bgColor={logoContrastBg}
              colorMode={logoColorMode}
              grayscale={toolsLogosGrayscaleEnabled(presentation)}
            />
          </div>
        );

        const levelBadge =
          showLevel && level ? (
            <span
              className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide"
              style={{
                color: presentation.levelAccentColor,
                backgroundColor: `${presentation.levelAccentColor}14`,
              }}
            >
              {level}
            </span>
          ) : null;

        const copyBlock = (
          <div className={`flex min-w-0 flex-1 flex-col ${isHorizontal ? 'gap-3.5' : 'gap-3'}`}>
            {isHorizontal ? (
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                {showName ? (
                  <div className="min-w-0">
                    {showCategory && category ? (
                      <p
                        className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: presentation.levelAccentColor }}
                      >
                        {category}
                      </p>
                    ) : null}
                    <h3
                      className="text-[1.05rem] font-semibold leading-snug tracking-tight sm:text-[1.125rem]"
                      style={toolsLabelColorStyle(presentation.labelColor)}
                    >
                      {name}
                    </h3>
                  </div>
                ) : (
                  <span />
                )}
                {levelBadge}
              </div>
            ) : (
              <>
                {showName ? (
                  <div>
                    {showCategory && category ? (
                      <p
                        className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: presentation.levelAccentColor }}
                      >
                        {category}
                      </p>
                    ) : null}
                    <h3
                      className="text-[1.05rem] font-semibold leading-snug tracking-tight sm:text-[1.125rem]"
                      style={toolsLabelColorStyle(presentation.labelColor)}
                    >
                      {name}
                    </h3>
                  </div>
                ) : null}
              </>
            )}

            {showDescription && description ? (
              <p
                className="text-[0.875rem] leading-relaxed sm:text-[0.9375rem]"
                style={{ color: presentation.descriptionColor }}
              >
                {description}
              </p>
            ) : null}

            {showUseCases && useCases.length > 0 ? (
              <ul className="mt-auto flex list-none flex-wrap gap-1.5 p-0 pt-1">
                {useCases.map((useCase) => (
                  <li
                    key={useCase}
                    className="rounded-full px-2.5 py-1 text-[0.6875rem] font-medium leading-none tracking-tight"
                    style={{
                      backgroundColor: presentation.chipBackgroundColor,
                      color: presentation.chipTextColor,
                    }}
                  >
                    {useCase}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );

        return (
          <li key={key} className={`min-w-0 ${isHorizontal ? 'group' : ''}`}>
            <article
              className={
                isHorizontal
                  ? 'flex h-full gap-5 rounded-[1.35rem] border p-4 transition duration-300 hover:-translate-y-0.5 sm:gap-6 sm:p-5'
                  : 'flex h-full flex-col gap-4 rounded-[1.35rem] border p-5 transition duration-300 hover:-translate-y-0.5 sm:p-6'
              }
              style={{
                backgroundColor: presentation.cardBackgroundColor,
                borderColor: presentation.cardBorderColor,
              }}
            >
              {isHorizontal ? (
                <>
                  {logoTile}
                  {copyBlock}
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    {logoTile}
                    {levelBadge}
                  </div>
                  {copyBlock}
                </>
              )}
            </article>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Webflow / Framer directory rows — open list with hairline rules,
 * logo left, copy + chips, level aligned right.
 */
export function EditorialToolsBrandDirectory({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const tilePx = toolsBrandCardLogoTilePx(presentation.tileSize);
  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showDescription = presentation.showDescription !== false;
  const showUseCases = presentation.showUseCases !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const showName = presentation.showLabels !== false;
  const levelStyle = presentation.brandDirectoryLevelStyle ?? 'percentage';
  const columnsPerRow = resolveToolsDesignBrandColumnsPerRow('brand-directory', presentation);
  const multiColumn = columnsPerRow > 1;
  const gridClass = toolsBrandDirectoryGridClass(columnsPerRow, presentation.cardGap);

  return (
    <ul
      className={`w-full list-none border-t p-0 ${gridClass}${multiColumn ? ' lg:border-t-0' : ''}`}
      role="list"
      style={{ borderColor: presentation.cardBorderColor }}
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const description = resolveSkillDescription(tool);
        const useCases = resolveSkillUseCases(tool);
        const levelRaw = resolveSkillLevel(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;
        const hasLevel = showLevel && Boolean(levelRaw);

        return (
          <li
            key={key}
            className={`group min-w-0 border-b ${
              multiColumn
                ? 'lg:h-full lg:rounded-[1.125rem] lg:border lg:transition-colors lg:duration-300 lg:hover:bg-black/[0.015]'
                : ''
            }`}
            style={{ borderColor: presentation.cardBorderColor }}
          >
            <article
              className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 transition duration-300 ease-out group-hover:bg-black/[0.015] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-6 md:gap-8 ${
                multiColumn
                  ? 'lg:p-5 lg:group-hover:bg-transparent xl:p-6'
                  : toolsBrandDirectoryRowPadClass(presentation.cardGap)
              }`}
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-[1.03]"
                style={{
                  width: framePx,
                  height: framePx,
                  backgroundColor: tileBg,
                }}
              >
                <CreatorToolLogo
                  label={name}
                  iconUrl={resolveSkillIconUrl(tool)}
                  size={logoPx}
                  className="rounded-lg"
                  bgColor={logoContrastBg}
                  colorMode={logoColorMode}
                  grayscale={toolsLogosGrayscaleEnabled(presentation)}
                />
              </div>

              <div className="min-w-0 space-y-2.5 self-center">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {showName ? (
                    <h3
                      className="text-[1.05rem] font-semibold leading-snug tracking-tight sm:text-[1.2rem]"
                      style={toolsLabelColorStyle(presentation.labelColor)}
                    >
                      {name}
                    </h3>
                  ) : null}
                  {hasLevel ? (
                    <span className="sm:hidden">
                      <ToolsBrandDirectoryLevelIndicator
                        tool={tool}
                        presentation={presentation}
                        style={levelStyle}
                        compact
                      />
                    </span>
                  ) : null}
                </div>

                {showDescription && description ? (
                  <p
                    className="max-w-2xl text-[0.875rem] leading-relaxed sm:text-[0.95rem]"
                    style={{ color: presentation.descriptionColor }}
                  >
                    {description}
                  </p>
                ) : null}

                {showUseCases && useCases.length > 0 ? (
                  <ul className="flex list-none flex-wrap gap-1.5 p-0 pt-0.5">
                    {useCases.map((useCase) => (
                      <li
                        key={useCase}
                        className="rounded-full px-2.5 py-1 text-[0.6875rem] font-medium leading-none tracking-tight"
                        style={{
                          backgroundColor: presentation.chipBackgroundColor,
                          color: presentation.chipTextColor,
                        }}
                      >
                        {useCase}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {hasLevel ? (
                <div className="hidden self-center sm:flex sm:justify-end">
                  <ToolsBrandDirectoryLevelIndicator
                    tool={tool}
                    presentation={presentation}
                    style={levelStyle}
                  />
                </div>
              ) : (
                <span className="hidden sm:block" aria-hidden />
              )}
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function toolsBrandIndexRowPadClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'tight') return 'py-7 sm:py-8';
  if (gap === 'large') return 'py-12 sm:py-14 lg:py-16';
  if (gap === 'xlarge') return 'py-14 sm:py-16 lg:py-20';
  if (gap === 'medium') return 'py-10 sm:py-11 lg:py-12';
  return 'py-10 sm:py-12 lg:py-14';
}

/**
 * Portfolio index rows — logo left, name, category center (left-aligned), description right.
 */
export function EditorialToolsBrandIndex({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const tilePx = toolsBrandCardLogoTilePx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showDescription = presentation.showDescription !== false;
  const showUseCases = presentation.showUseCases !== false;
  const showCategory = presentation.showCategory !== false;
  const showName = presentation.showLabels !== false;
  const rule = presentation.cardBorderColor;
  const rowPad = toolsBrandIndexRowPadClass(presentation.cardGap);

  return (
    <div className="w-full">
      <div className="h-px w-full" style={{ backgroundColor: rule }} aria-hidden />
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const description = resolveSkillDescription(tool);
        const category = resolveSkillCategory(tool);
        const useCases = resolveSkillUseCases(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <div key={key}>
            <div
              className={`grid grid-cols-1 gap-5 sm:gap-6 ${rowPad} lg:grid-cols-[auto_minmax(0,1.15fr)_minmax(0,0.75fr)_minmax(0,0.85fr)] lg:gap-x-10 xl:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,0.72fr)_minmax(0,0.78fr)] xl:gap-x-14`}
            >
              <div className="flex justify-start lg:justify-center">
                <div
                  className="flex shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    width: framePx,
                    height: framePx,
                    backgroundColor: tileBg,
                  }}
                >
                  <CreatorToolLogo
                    label={name}
                    iconUrl={resolveSkillIconUrl(tool)}
                    size={logoPx}
                    className="rounded-lg"
                    bgColor={logoContrastBg}
                    colorMode={logoColorMode}
                    grayscale={toolsLogosGrayscaleEnabled(presentation)}
                  />
                </div>
              </div>

              <div className="min-w-0">
                {showName ? (
                  <h3
                    className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl lg:text-[2.15rem] lg:leading-[1.15]"
                    style={toolsLabelColorStyle(presentation.labelColor)}
                  >
                    {name}
                  </h3>
                ) : null}
                {showUseCases && useCases.length > 0 ? (
                  <ul className="mt-4 flex list-none flex-wrap gap-2 p-0" aria-label="Use cases">
                    {useCases.map((useCase) => (
                      <li
                        key={useCase}
                        className="rounded-full px-3 py-1.5 text-xs font-medium sm:text-[13px]"
                        style={{
                          backgroundColor: presentation.chipBackgroundColor,
                          color: presentation.chipTextColor,
                          border: `1px solid ${presentation.cardBorderColor}`,
                        }}
                      >
                        {useCase}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {showCategory && category ? (
                <p
                  className="text-left text-sm leading-relaxed sm:text-[15px] lg:pt-1"
                  style={{ color: presentation.descriptionColor }}
                >
                  {category}
                </p>
              ) : (
                <span className="hidden lg:block" aria-hidden />
              )}

              {showDescription && description ? (
                <p
                  className="max-w-md text-sm leading-relaxed sm:text-[15px] lg:pt-1 xl:max-w-sm"
                  style={{ color: presentation.descriptionColor }}
                >
                  {description}
                </p>
              ) : (
                <span className="hidden lg:block" aria-hidden />
              )}
            </div>
            <div className="h-px w-full" style={{ backgroundColor: rule }} aria-hidden />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Compact horizontal grid — logo + name per cell.
 * `dividers`: top rule + vertical column separators.
 * `frames`: bordered filled cell per tool (no shared grid lines).
 * `none`: no lines — logo + name grid with spacing only.
 */
export function EditorialToolsBrandRow({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const tilePx = toolsBrandCardLogoTilePx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showName = presentation.showLabels !== false;
  const rule = presentation.cardBorderColor;
  const columnsPerRow = resolveToolsDesignBrandColumnsPerRow('brand-row', presentation);
  const cellPad = toolsBrandRowCellPadClass(presentation.cardGap);
  const cellStyle = presentation.brandRowCellStyle ?? 'dividers';
  const useFrames = cellStyle === 'frames';
  const useDividers = cellStyle === 'dividers';
  const useGap = cellStyle === 'frames' || cellStyle === 'none';

  return (
    <ul
      className={`grid w-full list-none p-0 ${toolsBrandRowGridClass(columnsPerRow)} ${
        useGap
          ? toolsBrandRowGridGapClass(presentation.cardGap)
          : useDividers
            ? 'border-t border-[var(--brand-row-border)]'
            : ''
      }`}
      role="list"
      style={useDividers ? { ['--brand-row-border' as string]: rule } : undefined}
    >
      {tools.map((tool, index) => {
        const name = resolveSkillName(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;
        const col = index % columnsPerRow;
        const isLastInRow = col === columnsPerRow - 1 || index === tools.length - 1;

        return (
          <li
            key={key}
            className={`flex h-full min-w-0 items-center ${cellPad}${
              useFrames ? ' rounded-xl border' : ''
            }`}
            style={
              useFrames
                ? {
                    borderColor: rule,
                    backgroundColor: presentation.cardBackgroundColor,
                  }
                : useDividers && !isLastInRow
                  ? { borderRight: `1px solid ${rule}` }
                  : undefined
            }
          >
            <div
              className="flex shrink-0 items-center justify-center rounded-xl"
              style={{
                width: framePx,
                height: framePx,
                backgroundColor: tileBg,
              }}
            >
              <CreatorToolLogo
                label={name}
                iconUrl={resolveSkillIconUrl(tool)}
                size={logoPx}
                className="rounded-lg"
                bgColor={logoContrastBg}
                colorMode={logoColorMode}
                grayscale={toolsLogosGrayscaleEnabled(presentation)}
              />
            </div>
            {showName ? (
              <span
                className="min-w-0 truncate text-base font-semibold leading-snug tracking-tight sm:text-[1.05rem]"
                style={toolsLabelColorStyle(presentation.labelColor)}
              >
                {name}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function ToolsBrandFloatDescription({
  description,
  descriptionColor,
  surfaceColor,
  borderColor,
  className = '',
}: {
  description: string;
  descriptionColor: string;
  surfaceColor: string;
  borderColor: string;
  className?: string;
}) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const descId = useId();
  const tooltipId = useId();

  useEffect(() => {
    const node = textRef.current;
    if (!node) return;

    const measure = () => {
      setIsTruncated(node.scrollHeight > node.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [description]);

  return (
    <div className={`relative w-full min-w-0 ${className}`}>
      <p
        ref={textRef}
        id={descId}
        className={`line-clamp-3 text-[0.8125rem] leading-relaxed sm:text-[0.875rem] ${isTruncated ? 'cursor-help' : ''}`}
        style={{ color: descriptionColor }}
        aria-describedby={isTruncated ? tooltipId : undefined}
        tabIndex={isTruncated ? 0 : undefined}
      >
        {description}
      </p>
      {isTruncated ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-[min(100%,18rem)] -translate-x-1/2 rounded-xl border px-3.5 py-2.5 text-left text-[0.8125rem] leading-relaxed opacity-0 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.65)] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 sm:text-[0.875rem]"
          style={{
            color: descriptionColor,
            backgroundColor: surfaceColor,
            borderColor: borderColor,
          }}
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Framer / Landbook fluid tile grid — logo-centered cards, hover lift & soft glow.
 */
export function EditorialToolsBrandFloat({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const logoPx = toolsShowcaseLogoPx(presentation.tileSize);
  const tilePx = Math.round(logoPx * 1.45);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showDescription = presentation.showDescription !== false;
  const showUseCases = presentation.showUseCases !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const showName = presentation.showLabels !== false;
  const gridMode = presentation.brandFloatGridMode ?? 'fluid';
  const isFluid = gridMode === 'fluid';
  const gridClass = isFluid
    ? 'grid w-full'
    : `grid w-full ${toolsBrandFloatFixedGridClass(presentation.brandFloatColumnsPerRow)}`;
  const gridStyle = isFluid
    ? {
        gridTemplateColumns: `repeat(auto-fill, minmax(${toolsBrandFloatMinTilePx(presentation.brandFloatTileDensity)}px, 1fr))`,
      }
    : undefined;
  const border = presentation.cardBorderColor;
  const framed = (presentation.brandFloatCardStyle ?? 'framed') === 'framed';

  return (
    <ul
      className={`w-full list-none p-0 ${gridClass} ${toolsBrandFloatGapClass(presentation.cardGap)}`}
      role="list"
      style={gridStyle}
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const description = resolveSkillDescription(tool);
        const useCases = resolveSkillUseCases(tool);
        const level = resolveSkillLevelLabel(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="relative z-0 min-w-0 hover:z-10 focus-within:z-10">
            <article
              className={`group relative flex h-full flex-col items-center overflow-visible rounded-[1.35rem] px-4 pb-5 pt-6 transition-all duration-300 ease-out sm:px-5 sm:pb-6 sm:pt-7 ${
                framed
                  ? 'border hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.45)]'
                  : 'border border-transparent'
              }`}
              style={{
                backgroundColor: framed ? presentation.cardBackgroundColor : 'transparent',
                borderColor: framed ? border : 'transparent',
              }}
            >
              {framed ? (
                <div
                  className="pointer-events-none absolute inset-0 rounded-[1.35rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${border}55, 0 0 0 1px ${border}22`,
                  }}
                  aria-hidden
                />
              ) : null}

              {showLevel && level ? (
                <div className="relative z-[1] mb-2.5 flex w-full justify-end sm:mb-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide"
                    style={{
                      color: presentation.levelAccentColor,
                      backgroundColor: `${presentation.levelAccentColor}14`,
                    }}
                  >
                    {level}
                  </span>
                </div>
              ) : null}

              <div
                className="relative z-[1] mb-4 flex shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 ease-out group-hover:scale-[1.04] sm:mb-5"
                style={{
                  width: framePx,
                  height: framePx,
                  backgroundColor: tileBg,
                }}
              >
                <CreatorToolLogo
                  label={name}
                  iconUrl={resolveSkillIconUrl(tool)}
                  size={logoPx}
                  className="rounded-xl"
                  bgColor={logoContrastBg}
                  colorMode={logoColorMode}
                  grayscale={toolsLogosGrayscaleEnabled(presentation)}
                />
              </div>

              <div className="relative z-[1] flex w-full min-w-0 flex-1 flex-col items-center text-center">
                {showName ? (
                  <h3
                    className="text-[0.9375rem] font-semibold leading-snug tracking-tight sm:text-base"
                    style={toolsLabelColorStyle(presentation.labelColor)}
                  >
                    {name}
                  </h3>
                ) : null}

                {showDescription && description ? (
                  <ToolsBrandFloatDescription
                    description={description}
                    descriptionColor={presentation.descriptionColor}
                    surfaceColor={presentation.cardBackgroundColor}
                    borderColor={presentation.cardBorderColor}
                    className={showName ? 'mt-2' : ''}
                  />
                ) : null}

                {showUseCases && useCases.length > 0 ? (
                  <ul className="mt-3 flex list-none flex-wrap justify-center gap-1.5 p-0">
                    {useCases.slice(0, 3).map((useCase) => (
                      <li
                        key={useCase}
                        className="rounded-full px-2 py-0.5 text-[0.625rem] font-medium leading-none"
                        style={{
                          backgroundColor: presentation.chipBackgroundColor,
                          color: presentation.chipTextColor,
                        }}
                      >
                        {useCase}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Card grid item — stat bar color follows logo or palette accent (same as progress rows).
 */
function ToolLevelStatBarCardItem({
  tool,
  presentation,
  logoPx,
  framePx,
  tileBg,
  logoContrastBg,
  logoColorMode,
  showName,
  showLevel,
  levelTrackColor,
  levelFallbackColor,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  logoPx: number;
  framePx: number;
  tileBg: string;
  logoContrastBg: string;
  logoColorMode: 'light' | 'dark';
  showName: boolean;
  showLevel: boolean;
  levelTrackColor: string;
  levelFallbackColor: string;
}) {
  const name = resolveSkillName(tool);
  const level = resolveSkillLevel(tool);
  const iconUrl = resolveSkillIconUrl(tool);
  const { barColor: logoBarColor, fromLogo } = useToolLevelBarColor(
    name,
    iconUrl,
    levelFallbackColor,
    presentation.cardBackgroundColor
  );
  const barColor = toolsLevelIndicatorFillColor(presentation, logoBarColor);
  const logoBrandColor = !toolsLogosGrayscaleEnabled(presentation) && fromLogo ? logoBarColor : undefined;
  const levelBarStyle = resolveToolsLevelBarStyle(presentation);
  const levelBarSize = resolveToolsLevelBarSize(presentation);
  const percent = resolveToolLevelPercent(level);
  const framed = resolveToolsLevelIndicatorCardFramed(presentation, 'level-stat-bars');
  const cardSurface = resolveToolsCardSurfaceColor(presentation);

  return (
    <article
      className={`group flex h-full flex-col items-center rounded-[1.125rem] p-4 transition duration-300 sm:p-[1.125rem] ${
        framed ? 'border hover:-translate-y-0.5 hover:shadow-sm' : 'border border-transparent'
      }`}
      style={{
        backgroundColor: framed ? cardSurface : 'transparent',
        borderColor: framed ? presentation.cardBorderColor : 'transparent',
      }}
    >
      <div
        className="mb-3 flex shrink-0 items-center justify-center rounded-2xl"
        style={{
          width: framePx,
          height: framePx,
          backgroundColor: tileBg,
        }}
      >
        <CreatorToolLogo
          label={name}
          iconUrl={iconUrl}
          size={logoPx}
          className="rounded-lg"
          bgColor={logoContrastBg}
          colorMode={logoColorMode}
          brandColor={logoBrandColor}
          grayscale={toolsLogosGrayscaleEnabled(presentation)}
        />
      </div>

      {showName ? (
        <span
          className="mb-2.5 max-w-[6.5rem] truncate text-center text-[0.8125rem] font-medium leading-snug tracking-tight"
          style={toolsLabelColorStyle(presentation.labelColor)}
        >
          {name}
        </span>
      ) : null}

      {showLevel ? (
        <ToolsLevelProgressBar
          level={level}
          toolName={name}
          fillColor={barColor}
          trackColor={levelTrackColor}
          percent={percent}
          barStyle={levelBarStyle}
          barSize={levelBarSize}
          className="w-full"
        />
      ) : null}
    </article>
  );
}

/**
 * Card grid — circular proficiency ring around the logo (no inner square tile),
 * name below, percentage in ring color.
 */
function ToolLevelCircularCardItem({
  tool,
  presentation,
  ringPx,
  logoPx,
  logoColorMode,
  showName,
  showLevel,
  levelTrackColor,
  levelFallbackColor,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  ringPx: number;
  logoPx: number;
  logoColorMode: 'light' | 'dark';
  showName: boolean;
  showLevel: boolean;
  levelTrackColor: string;
  levelFallbackColor: string;
}) {
  const name = resolveSkillName(tool);
  const level = resolveSkillLevel(tool);
  const iconUrl = resolveSkillIconUrl(tool);
  const { barColor: logoBarColor, fromLogo } = useToolLevelBarColor(
    name,
    iconUrl,
    levelFallbackColor,
    presentation.cardBackgroundColor
  );
  const ringColor = toolsLevelIndicatorFillColor(presentation, logoBarColor);
  const percent = resolveToolLevelPercent(level);
  const levelBarSize = resolveToolsLevelBarSize(presentation);
  const logoBrandColor =
    !toolsLogosGrayscaleEnabled(presentation) && fromLogo ? logoBarColor : undefined;
  const framed = resolveToolsLevelIndicatorCardFramed(presentation, 'level-circular-cards');
  const cardSurface = framed
    ? resolveToolsCardSurfaceColor(presentation)
    : toolsLogoContrastBackground(presentation);

  return (
    <article
      className={`flex h-full flex-col items-center rounded-[1.35rem] px-4 py-6 text-center transition duration-300 sm:px-5 sm:py-7 ${
        framed ? 'border hover:-translate-y-0.5' : 'border border-transparent'
      }`}
      style={{
        backgroundColor: framed ? cardSurface : 'transparent',
        borderColor: framed ? presentation.cardBorderColor : 'transparent',
      }}
    >
      {showLevel && level ? (
        <ToolsLevelCircularRingWithLogo
          percent={percent}
          fillColor={ringColor}
          trackColor={levelTrackColor}
          size={ringPx}
          className="mb-4"
          logo={
            <CreatorToolLogo
              label={name}
              iconUrl={iconUrl}
              size={logoPx}
              className="rounded-md"
              bgColor={cardSurface}
              colorMode={logoColorMode}
              brandColor={logoBrandColor}
              grayscale={toolsLogosGrayscaleEnabled(presentation)}
            />
          }
        />
      ) : (
        <div className="mb-4 flex items-center justify-center" style={{ width: ringPx, height: ringPx }}>
          <CreatorToolLogo
            label={name}
            iconUrl={iconUrl}
            size={logoPx}
            className="rounded-md"
            bgColor={cardSurface}
            colorMode={logoColorMode}
            brandColor={logoBrandColor}
            grayscale={toolsLogosGrayscaleEnabled(presentation)}
          />
        </div>
      )}

      {showName ? (
        <h3
          className="text-[0.9375rem] font-semibold leading-snug tracking-tight sm:text-base"
          style={toolsLabelColorStyle(presentation.labelColor)}
        >
          {name}
        </h3>
      ) : null}

      {showLevel && level ? (
        <p
          className={`tabular-nums font-semibold leading-none ${toolsLevelBarPercentClass(levelBarSize)} ${showName ? 'mt-2' : ''}`}
          style={{ color: ringColor }}
        >
          {percent}%
        </p>
      ) : null}
    </article>
  );
}

export function EditorialToolsLevelCircularCards({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const ringPx = toolsLevelCircularRingPx(presentation.tileSize);
  const logoPx = toolsLevelCircularLogoPx(presentation.tileSize);
  const logoColorMode = toolsLogoColorMode(presentation);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const levelBarColors = resolveToolsLevelBarColors(presentation);
  const columnsPerRow = resolveToolsDesignBrandColumnsPerRow('level-circular-cards', presentation);

  return (
    <ul
      className={`grid w-full list-none p-0 ${toolsLevelCircularCardsGridClass(columnsPerRow)} ${toolsLevelIndicatorGridGapClass(presentation.levelProgressRowGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="min-w-0">
            <ToolLevelCircularCardItem
              tool={tool}
              presentation={presentation}
              ringPx={ringPx}
              logoPx={logoPx}
              logoColorMode={logoColorMode}
              showName={showName}
              showLevel={showLevel}
              levelTrackColor={levelBarColors.trackColor}
              levelFallbackColor={presentation.labelColor}
            />
          </li>
        );
      })}
    </ul>
  );
}

/** Horizontal cards — skill name left, 5-star rating right (no logos). */
function ToolLevelStarCardItem({
  tool,
  presentation,
  showName,
  showLevel,
  starFillColor,
  starTrackColor,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  showName: boolean;
  showLevel: boolean;
  starFillColor: string;
  starTrackColor: string;
}) {
  const name = resolveSkillName(tool);
  const level = resolveSkillLevel(tool);
  const framed = resolveToolsLevelIndicatorCardFramed(presentation, 'level-star-cards');
  const cardSurface = resolveToolsCardSurfaceColor(presentation);

  return (
    <article
      className={`flex min-h-[3.25rem] items-center justify-between gap-3 rounded-[1.25rem] px-4 py-3.5 transition duration-300 sm:gap-4 sm:px-5 sm:py-4 ${
        framed ? 'border hover:-translate-y-0.5' : 'border border-transparent'
      }`}
      style={{
        backgroundColor: framed ? cardSurface : 'transparent',
        borderColor: framed ? presentation.cardBorderColor : 'transparent',
      }}
    >
      {showName ? (
        <h3
          className="min-w-0 truncate text-sm font-semibold leading-snug tracking-tight sm:text-[0.9375rem]"
          style={toolsLabelColorStyle(presentation.labelColor)}
        >
          {name}
        </h3>
      ) : (
        <span className="min-w-0 flex-1" aria-hidden />
      )}
      {showLevel && level ? (
        <ToolsLevelStarRating
          level={level}
          toolName={name}
          fillColor={starFillColor}
          trackColor={starTrackColor}
          className="shrink-0"
        />
      ) : null}
    </article>
  );
}

export function EditorialToolsLevelStarCards({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const levelBarColors = resolveToolsLevelBarColors(presentation);
  const starFillColor =
    presentation.levelAccentColor?.trim() || levelBarColors.fillColor;
  const columnsPerRow = LEVEL_STAR_CARDS_COLUMNS_PER_ROW;
  const gridGapClass = toolsBrandCardsGapClass(presentation.cardGap);

  const toolRows = useMemo(() => {
    const rows: PortfolioSkillRef[][] = [];
    for (let index = 0; index < tools.length; index += columnsPerRow) {
      rows.push(tools.slice(index, index + columnsPerRow));
    }
    return rows;
  }, [tools, columnsPerRow]);

  return (
    <div className={`flex w-full flex-col ${gridGapClass}`}>
      {toolRows.map((row, rowIndex) => (
        <ul
          key={`star-cards-row-${rowIndex}`}
          className={`grid w-full list-none p-0 ${toolsLevelStarCardsGridClass()} ${gridGapClass}`}
          role="list"
        >
          {row.map((tool) => {
            const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

            return (
              <li key={key} className="min-w-0">
                <ToolLevelStarCardItem
                  tool={tool}
                  presentation={presentation}
                  showName={showName}
                  showLevel={showLevel}
                  starFillColor={starFillColor}
                  starTrackColor={levelBarColors.trackColor}
                />
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}

/**
 * Card grid — SVG progress ring with tool name centered inside (no logo, no %).
 */
function ToolLevelSvgRingCardItem({
  tool,
  presentation,
  ringPx,
  showName,
  showLevel,
  levelTrackColor,
  levelFallbackColor,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  ringPx: number;
  showName: boolean;
  showLevel: boolean;
  levelTrackColor: string;
  levelFallbackColor: string;
}) {
  const name = resolveSkillName(tool);
  const level = resolveSkillLevel(tool);
  const iconUrl = resolveSkillIconUrl(tool);
  const { barColor: logoBarColor, fromLogo } = useToolLevelBarColor(
    name,
    iconUrl,
    levelFallbackColor,
    presentation.cardBackgroundColor
  );
  const semanticColor =
    level != null
      ? resolveToolsLevelSemanticColor(level, presentation, toolsLogosGrayscaleEnabled(presentation))
      : levelFallbackColor;
  const ringColor =
    !toolsLogosGrayscaleEnabled(presentation) && fromLogo ? logoBarColor : semanticColor;
  const percent = resolveToolLevelPercent(level);
  const framed = resolveToolsLevelIndicatorCardFramed(presentation, 'level-svg-rings');
  const cardSurface = resolveToolsCardSurfaceColor(presentation);

  return (
    <article
      className={`flex h-full flex-col items-center justify-center rounded-[1.35rem] px-4 py-6 text-center transition duration-300 sm:px-5 sm:py-7 ${
        framed ? 'border hover:-translate-y-0.5' : 'border border-transparent'
      }`}
      style={{
        backgroundColor: framed ? cardSurface : 'transparent',
        borderColor: framed ? presentation.cardBorderColor : 'transparent',
      }}
    >
      {showLevel && level ? (
        <ToolsLevelSvgRingWithLabel
          label={showName ? name : ''}
          percent={percent}
          fillColor={ringColor}
          trackColor={levelTrackColor}
          size={ringPx}
        />
      ) : showName ? (
        <div
          className="flex items-center justify-center px-2 text-center text-[0.9375rem] font-semibold leading-snug tracking-tight sm:text-base"
          style={{ width: ringPx, height: ringPx, color: ringColor }}
        >
          <span className="max-w-full truncate">{name}</span>
        </div>
      ) : null}
    </article>
  );
}

export function EditorialToolsLevelSvgRings({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const ringPx = toolsLevelSvgRingPx(presentation.tileSize);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const levelBarColors = resolveToolsLevelBarColors(presentation);
  const columnsPerRow = resolveToolsDesignBrandColumnsPerRow('level-svg-rings', presentation);

  return (
    <ul
      className={`grid w-full list-none p-0 ${toolsLevelCircularCardsGridClass(columnsPerRow)} ${toolsLevelIndicatorGridGapClass(presentation.levelProgressRowGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="min-w-0">
            <ToolLevelSvgRingCardItem
              tool={tool}
              presentation={presentation}
              ringPx={ringPx}
              showName={showName}
              showLevel={showLevel}
              levelTrackColor={levelBarColors.trackColor}
              levelFallbackColor={presentation.labelColor}
            />
          </li>
        );
      })}
    </ul>
  );
}

/** Bento grid — one framed card per category with logo, name, and colored level label. */
export function EditorialToolsLevelBentoCategories({ tools, presentation }: ToolsGalleryProps) {
  const groups = useMemo(() => {
    const grouped = groupSkillsByCategory(tools);
    if (resolveToolsLevelTableGroupBy(presentation) === 'level') {
      return grouped;
    }
    return grouped.map((group) => ({
      ...group,
      tools: [...group.tools].sort((a, b) =>
        resolveSkillName(a).localeCompare(resolveSkillName(b), undefined, { sensitivity: 'base' })
      ),
    }));
  }, [presentation, tools]);

  if (groups.length === 0) return null;

  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const framed = resolveToolsLevelIndicatorCardFramed(presentation, 'level-bento-categories');
  const cardSurface = resolveToolsCardSurfaceColor(presentation);
  const mutedColor = presentation.descriptionColor?.trim() || '#737373';
  const rowGap = presentation.levelProgressRowGap;
  const rowPadClass =
    rowGap === 'tight'
      ? 'py-2.5'
      : rowGap === 'large'
        ? 'py-4'
        : rowGap === 'xlarge'
          ? 'py-5'
          : 'py-3';

  const groupRows = useMemo(() => {
    const rows: (typeof groups)[] = [];
    for (let index = 0; index < groups.length; index += 4) {
      rows.push(groups.slice(index, index + 4));
    }
    return rows;
  }, [groups]);
  const gridGapClass = toolsLevelBentoGridGapClass(presentation.cardGap);
  const levelDisplayStyle = resolveToolsLevelIndicatorDisplayStyle(presentation);
  const stackedLevelBar = levelDisplayStyle === 'progress-bar';
  const grayscale = toolsLogosGrayscaleEnabled(presentation);

  return (
    <div className={`flex w-full flex-col ${gridGapClass}`}>
      {groupRows.map((row, rowIndex) => (
        <div
          key={`bento-row-${rowIndex}`}
          className={`grid w-full grid-cols-1 ${toolsLevelBentoEqualColumnsClass(row.length)} ${gridGapClass}`}
        >
          {row.map((group) => {
        const countLabel = `${group.tools.length} ${group.tools.length === 1 ? 'skill' : 'skills'}`;

        return (
          <article
            key={group.category}
            className={`flex h-full min-w-0 flex-col rounded-[1.25rem] px-4 py-5 sm:px-5 sm:py-6 ${
              framed ? 'border' : 'border border-transparent'
            }`}
            style={{
              backgroundColor: framed ? cardSurface : 'transparent',
              borderColor: framed ? presentation.cardBorderColor : 'transparent',
            }}
          >
            <header className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
              <h3
                className="text-base font-semibold leading-tight tracking-tight sm:text-lg"
                style={toolsLabelColorStyle(presentation.labelColor)}
              >
                {group.category}
              </h3>
              <span className="shrink-0 text-xs font-medium tabular-nums sm:text-sm" style={{ color: mutedColor }}>
                {countLabel}
              </span>
            </header>

            <ul className="m-0 flex list-none flex-col p-0" role="list">
              {group.tools.map((tool) => {
                const name = resolveSkillName(tool);
                const level = resolveSkillLevel(tool);
                const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

                return (
                  <li
                    key={key}
                    className={`${stackedLevelBar ? 'flex flex-col gap-2.5' : 'flex items-center gap-3 sm:gap-3.5'} ${rowPadClass} ${
                      showName || (showLevel && level) ? '' : 'justify-center'
                    }`}
                  >
                    <div className={`flex min-w-0 items-center gap-3 sm:gap-3.5 ${stackedLevelBar ? 'w-full' : ''}`}>
                      <CreatorToolLogo
                        label={name}
                        iconUrl={resolveSkillIconUrl(tool)}
                        size={logoPx}
                        className="shrink-0 rounded-md"
                        bgColor={logoContrastBg}
                        colorMode={logoColorMode}
                        grayscale={grayscale}
                      />
                      {showName ? (
                        <span
                          className="min-w-0 flex-1 truncate text-sm font-semibold leading-snug sm:text-[0.9375rem]"
                          style={toolsLabelColorStyle(presentation.labelColor)}
                        >
                          {name}
                        </span>
                      ) : (
                        <span className="min-w-0 flex-1" />
                      )}
                      {showLevel && level && !stackedLevelBar ? (
                        <ToolsLevelIndicatorDisplay
                          tool={tool}
                          presentation={presentation}
                          logosGrayscale={grayscale}
                        />
                      ) : null}
                    </div>
                    {showLevel && level && stackedLevelBar ? (
                      <ToolsLevelIndicatorDisplay
                        tool={tool}
                        presentation={presentation}
                        layout="stacked"
                        showPercent
                        logosGrayscale={grayscale}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </article>
        );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Landbook / Framer minimal grid — logo, name, 4-segment stat bar (no text level).
 */
export function EditorialToolsLevelStatBars({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const tilePx = toolsBrandCardLogoTilePx(presentation.tileSize);
  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const levelBarColors = resolveToolsLevelBarColors(presentation);

  return (
    <ul
      className={`grid w-full list-none grid-cols-2 p-0 sm:grid-cols-3 lg:grid-cols-4 ${toolsLevelIndicatorGridGapClass(presentation.levelProgressRowGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="min-w-0">
            <ToolLevelStatBarCardItem
              tool={tool}
              presentation={presentation}
              logoPx={logoPx}
              framePx={framePx}
              tileBg={tileBg}
              logoContrastBg={logoContrastBg}
              logoColorMode={logoColorMode}
              showName={showName}
              showLevel={showLevel}
              levelTrackColor={levelBarColors.trackColor}
              levelFallbackColor={presentation.labelColor}
            />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Landbook list — logo, name + %, bar tinted from dominant logo color.
 */
function ToolLevelProgressRowItem({
  tool,
  presentation,
  logoPx,
  showIconBg,
  tileBg,
  logoContrastBg,
  logoColorMode,
  showName,
  showLevel,
  levelTrackColor,
  levelFallbackColor,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  logoPx: number;
  showIconBg: boolean;
  tileBg: string;
  logoContrastBg: string;
  logoColorMode: 'light' | 'dark';
  showName: boolean;
  showLevel: boolean;
  levelTrackColor: string;
  levelFallbackColor: string;
}) {
  const name = resolveSkillName(tool);
  const level = resolveSkillLevel(tool);
  const iconUrl = resolveSkillIconUrl(tool);
  const { barColor: logoBarColor, fromLogo } = useToolLevelBarColor(
    name,
    iconUrl,
    levelFallbackColor,
    presentation.cardBackgroundColor
  );
  const barColor = toolsLevelIndicatorFillColor(presentation, logoBarColor);
  const percent = resolveToolLevelPercent(level);
  const logoBrandColor = !toolsLogosGrayscaleEnabled(presentation) && fromLogo ? logoBarColor : undefined;
  const levelBarStyle = resolveToolsLevelBarStyle(presentation);
  const levelBarSize = resolveToolsLevelBarSize(presentation);

  return (
    <>
      {showIconBg ? (
        <div
          className="flex shrink-0 items-center justify-center rounded-lg"
          style={{
            width: logoPx,
            height: logoPx,
            backgroundColor: tileBg,
          }}
        >
          <CreatorToolLogo
            label={name}
            iconUrl={iconUrl}
            size={logoPx}
            className="rounded-md"
            bgColor={logoContrastBg}
            colorMode={logoColorMode}
            brandColor={logoBrandColor}
            grayscale={toolsLogosGrayscaleEnabled(presentation)}
          />
        </div>
      ) : (
        <CreatorToolLogo
          label={name}
          iconUrl={iconUrl}
          size={logoPx}
          className="shrink-0 rounded-md"
          bgColor={logoContrastBg}
          colorMode={logoColorMode}
          brandColor={logoBrandColor}
          grayscale={toolsLogosGrayscaleEnabled(presentation)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
        {showName || (showLevel && level) ? (
          <div className="flex min-w-0 items-center justify-between gap-3">
            {showName ? (
              <span
                className="truncate text-sm font-medium leading-none"
                style={toolsLabelColorStyle(presentation.labelColor)}
              >
                {name}
              </span>
            ) : (
              <span className="min-w-0 flex-1" />
            )}
            {showLevel && level ? (
              <span
                className={`shrink-0 font-semibold tabular-nums leading-none ${toolsLevelBarPercentClass(levelBarSize)}`}
                style={{ color: barColor }}
              >
                {percent}%
              </span>
            ) : null}
          </div>
        ) : null}

        {showLevel ? (
          <ToolsLevelProgressBar
            level={level}
            toolName={name}
            fillColor={barColor}
            trackColor={levelTrackColor}
            percent={percent}
            barStyle={levelBarStyle}
            barSize={levelBarSize}
          />
        ) : null}
      </div>
    </>
  );
}

function ToolLevelCategoryRowItem({
  tool,
  presentation,
  logoPx,
  logoContrastBg,
  logoColorMode,
  showName,
  showLevel,
  levelTrackColor,
  levelFallbackColor,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  logoPx: number;
  logoContrastBg: string;
  logoColorMode: 'light' | 'dark';
  showName: boolean;
  showLevel: boolean;
  levelTrackColor: string;
  levelFallbackColor: string;
}) {
  const name = resolveSkillName(tool);
  const level = resolveSkillLevel(tool);
  const iconUrl = resolveSkillIconUrl(tool);
  const category = resolveSkillCategoryDisplay(tool);
  const { barColor: logoBarColor, fromLogo } = useToolLevelBarColor(
    name,
    iconUrl,
    levelFallbackColor,
    presentation.cardBackgroundColor
  );
  const barColor = toolsLevelIndicatorFillColor(presentation, logoBarColor);
  const percent = resolveToolLevelPercent(level);
  const logoBrandColor = !toolsLogosGrayscaleEnabled(presentation) && fromLogo ? logoBarColor : undefined;
  const levelBarStyle = resolveToolsLevelBarStyle(presentation);
  const levelBarSize = resolveToolsLevelBarSize(presentation);
  const categoryColor = presentation.descriptionColor?.trim() || '#737373';

  return (
    <>
      <CreatorToolLogo
        label={name}
        iconUrl={iconUrl}
        size={logoPx}
        className="shrink-0 rounded-md"
        bgColor={logoContrastBg}
        colorMode={logoColorMode}
        brandColor={logoBrandColor}
        grayscale={toolsLogosGrayscaleEnabled(presentation)}
      />

      <div className="min-w-0 shrink-0 sm:w-[7.5rem]">
        {showName ? (
          <p
            className="truncate text-sm font-semibold leading-tight tracking-tight sm:text-[0.9375rem]"
            style={toolsLabelColorStyle(presentation.labelColor)}
          >
            {name}
          </p>
        ) : null}
        {category ? (
          <p
            className={`truncate text-[0.625rem] font-semibold uppercase tracking-[0.16em] sm:text-[0.6875rem] ${
              showName ? 'mt-1' : ''
            }`}
            style={{ color: categoryColor }}
          >
            {category}
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        {showLevel && level ? (
          <>
            <ToolsLevelProgressBar
              level={level}
              toolName={name}
              fillColor={barColor}
              trackColor={levelTrackColor}
              percent={percent}
              barStyle={levelBarStyle}
              barSize={levelBarSize}
              barHeightVariant="thin"
              className="min-w-0 flex-1"
            />
            <span
              className={`shrink-0 font-semibold tabular-nums leading-none ${toolsLevelBarPercentClass(levelBarSize)}`}
              style={{ color: barColor }}
            >
              {percent}%
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1" />
        )}
      </div>
    </>
  );
}

/** Editorial rows — logo, name + category, thin bar and % on the right. */
export function EditorialToolsLevelCategoryRows({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const levelBarColors = resolveToolsLevelBarColors(presentation);
  const twoColumn = (presentation.levelProgressColumnsPerRow ?? 1) === 2;
  const rowGap = presentation.levelProgressRowGap;
  const rowClass = toolsLevelProgressRowsRowClass(rowGap);

  return (
    <ul
      className={
        twoColumn
          ? `grid w-full list-none grid-cols-1 p-0 lg:grid-cols-2 ${toolsLevelProgressRowsGridGapClass(rowGap)}`
          : 'w-full list-none p-0'
      }
      role="list"
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li
            key={key}
            className={`group grid grid-cols-[auto_minmax(0,5.5rem)_minmax(0,1fr)] items-center gap-x-3 px-1 transition-colors duration-150 hover:bg-black/[0.02] sm:grid-cols-[auto_7.5rem_minmax(0,1fr)] sm:gap-x-4 sm:px-2 ${rowClass} ${
              twoColumn ? '' : 'border-b last:border-b-0'
            }`}
            style={twoColumn ? undefined : { borderColor: presentation.cardBorderColor }}
          >
            <ToolLevelCategoryRowItem
              tool={tool}
              presentation={presentation}
              logoPx={logoPx}
              logoContrastBg={logoContrastBg}
              logoColorMode={logoColorMode}
              showName={showName}
              showLevel={showLevel}
              levelTrackColor={levelBarColors.trackColor}
              levelFallbackColor={presentation.labelColor}
            />
          </li>
        );
      })}
    </ul>
  );
}

/** Table layout — no column header, no experience: logo + name | category | level | %. */
export function EditorialToolsLevelTableRows({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const rowGap = presentation.levelProgressRowGap;
  const rowClass = toolsLevelProgressRowsRowClass(rowGap);
  const levelBarSize = resolveToolsLevelBarSize(presentation);
  const percentClass = toolsLevelBarPercentClass(levelBarSize);
  const categoryColor = presentation.descriptionColor?.trim() || '#737373';
  const fullWidth = resolveToolsLevelIndicatorFullWidth(presentation);
  const levelDisplayStyle = resolveToolsLevelIndicatorDisplayStyle(presentation);
  const showPercentColumn = showLevel && levelDisplayStyle === 'text';
  const tableGridWithLevel = fullWidth
    ? showPercentColumn
      ? 'grid w-full grid-cols-[minmax(0,1fr)_6.5rem_8.5rem_3.5rem] items-center justify-items-start gap-x-8 sm:grid-cols-[minmax(0,1fr)_7.5rem_10rem_4rem] sm:gap-x-14 lg:gap-x-20'
      : 'grid w-full grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,10rem)] items-center justify-items-start gap-x-8 sm:grid-cols-[minmax(0,1fr)_7.5rem_minmax(0,12rem)] sm:gap-x-14 lg:gap-x-20'
    : showPercentColumn
      ? 'grid w-full grid-cols-[minmax(0,1fr)_5.5rem_7rem_3.25rem] items-center justify-items-start gap-x-6 sm:grid-cols-[minmax(0,1fr)_6.5rem_8.5rem_3.5rem] sm:gap-x-10'
      : 'grid w-full grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,8rem)] items-center justify-items-start gap-x-6 sm:grid-cols-[minmax(0,1fr)_6.5rem_minmax(0,10rem)] sm:gap-x-10';
  const tableGridWithoutLevel = fullWidth
    ? 'grid w-full grid-cols-[minmax(0,1fr)_7.5rem] items-center justify-items-start gap-x-8 sm:gap-x-14 lg:gap-x-20'
    : 'grid w-full grid-cols-[minmax(0,1fr)_6.5rem] items-center justify-items-start gap-x-6 sm:gap-x-10';

  return (
    <div className="w-full text-left">
    <ul
      className="w-full list-none border-t p-0 text-left"
      role="list"
      style={{ borderColor: presentation.cardBorderColor, textAlign: 'left' }}
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const category = resolveSkillCategory(tool);
        const level = resolveSkillLevel(tool);
        const percent = resolveToolLevelPercent(level);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;
        const rowHasLevel = showLevel && Boolean(level);
        const grayscale = toolsLogosGrayscaleEnabled(presentation);

        return (
          <li
            key={key}
            className={`border-b transition-colors duration-150 last:border-b-0 hover:bg-black/[0.02] ${rowClass}`}
            style={{ borderColor: presentation.cardBorderColor }}
          >
            <div className={rowHasLevel ? tableGridWithLevel : tableGridWithoutLevel}>
              <div className="flex min-w-0 items-center justify-self-start gap-3 sm:gap-3.5">
                <CreatorToolLogo
                  label={name}
                  iconUrl={resolveSkillIconUrl(tool)}
                  size={logoPx}
                  className="shrink-0 rounded-md"
                  bgColor={logoContrastBg}
                  colorMode={logoColorMode}
                  grayscale={toolsLogosGrayscaleEnabled(presentation)}
                />
                {showName ? (
                  <span
                    className="truncate text-sm font-semibold leading-snug tracking-tight sm:text-[0.9375rem]"
                    style={toolsLabelColorStyle(presentation.labelColor)}
                  >
                    {name}
                  </span>
                ) : null}
              </div>

              <span
                className="block w-full truncate text-left text-sm leading-snug"
                style={{ color: categoryColor, textAlign: 'left' }}
              >
                {category || '\u00a0'}
              </span>

              {rowHasLevel && level ? (
                <>
                  <div className="flex w-full min-w-0 justify-self-start">
                    <ToolsLevelIndicatorDisplay
                      tool={tool}
                      presentation={presentation}
                      showPercent={levelDisplayStyle === 'progress-bar'}
                      logosGrayscale={grayscale}
                      className="w-full max-w-full"
                    />
                  </div>
                  {showPercentColumn ? (
                    <span
                      className={`block w-full text-right font-semibold tabular-nums leading-none ${percentClass}`}
                      style={{ ...toolsLabelColorStyle(presentation.labelColor), textAlign: 'right' }}
                    >
                      {percent}%
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
    </div>
  );
}

export function EditorialToolsLevelProgressRows({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const levelBarColors = resolveToolsLevelBarColors(presentation);
  const twoColumn = (presentation.levelProgressColumnsPerRow ?? 1) === 2;
  const rowGap = presentation.levelProgressRowGap;
  const rowClass = toolsLevelProgressRowsRowClass(rowGap);

  return (
    <ul
      className={
        twoColumn
          ? `grid w-full list-none grid-cols-1 p-0 lg:grid-cols-2 ${toolsLevelProgressRowsGridGapClass(rowGap)}`
          : 'w-full list-none p-0'
      }
      role="list"
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li
            key={key}
            className={`group flex items-center px-4 transition-colors duration-150 hover:bg-black/[0.02] sm:px-5 ${rowClass} ${
              twoColumn ? '' : 'border-b last:border-b-0'
            }`}
            style={twoColumn ? undefined : { borderColor: presentation.cardBorderColor }}
          >
            <ToolLevelProgressRowItem
              tool={tool}
              presentation={presentation}
              logoPx={logoPx}
              showIconBg={showIconBg}
              tileBg={tileBg}
              logoContrastBg={logoContrastBg}
              logoColorMode={logoColorMode}
              showName={showName}
              showLevel={showLevel}
              levelTrackColor={levelBarColors.trackColor}
              levelFallbackColor={presentation.labelColor}
            />
          </li>
        );
      })}
    </ul>
  );
}
