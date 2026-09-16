'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { useToolLevelBarColor } from '@/components/creator/studio/creator-tool-logo-color';
import {
  resolveSkillDescription,
  resolveSkillIconUrl,
  resolveSkillLevel,
  resolveSkillLevelLabel,
  resolveSkillName,
  resolveSkillCategory,
  compareSkillsByCategoryThenName,
  compareSkillsByLevelThenName,
  collectSkillCategories,
  resolveSkillUseCases,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import {
  ToolsBrandDirectoryLevelIndicator,
  ToolsLevelStatBar,
  resolveToolsLevelBarColors,
} from '@/components/portfolio/portfolio-tools-level-indicators';
import { EditorialToolsWorkflow } from '@/components/portfolio/stack-designs/StackWorkflowRail';
import { EditorialToolsBrandIndex } from '@/components/portfolio/stack-designs/StackBrandIndex';
import { EditorialToolsBrandCards } from '@/components/portfolio/stack-designs/StackBrandCards';
import { EditorialToolsBrandRow } from '@/components/portfolio/stack-designs/StackBrandRow';
import { EditorialToolsLevelCircularCards } from '@/components/portfolio/stack-designs/StackLevelCircularCards';
import { EditorialToolsLevelProgressRows } from '@/components/portfolio/stack-designs/StackLevelProgressRows';
import { EditorialToolsLevelCategoryRows } from '@/components/portfolio/stack-designs/StackLevelCategoryRows';
import { EditorialToolsLevelTableRows } from '@/components/portfolio/stack-designs/StackLevelTableRows';
import { EditorialToolsLevelStarCards } from '@/components/portfolio/stack-designs/StackLevelStarCards';
import { EditorialToolsLevelSvgRings } from '@/components/portfolio/stack-designs/StackLevelSvgRings';
import { EditorialToolsLevelBentoCategories } from '@/components/portfolio/stack-designs/StackLevelBentoCategories';
import {
  toolsBrandCardLogoPx,
  toolsBrandCardLogoTilePx,
  toolsBrandDirectoryGridClass,
  toolsBrandDirectoryRowPadClass,
  toolsBrandFloatFixedGridClass,
  toolsBrandFloatGapClass,
  toolsBrandFloatMinTilePx,
  toolsContentAlignWrapperClass,
  toolsLabelColorStyle,
  resolveToolsDesignBrandColumnsPerRow,
  toolsLevelIndicatorGridGapClass,
  toolsShowcaseLogoPx,
  resolveToolsIconBackgroundEnabled,
  resolveToolsLevelIndicatorCardFramed,
  resolveToolsCardSurfaceColor,
  resolveToolsLevelIndicatorShowCategoryFilter,
  resolveToolsLevelTableGroupBy,
  resolveToolsShowLevel,
  isToolsLevelIndicatorDesign,
  toolsDesignSupportsCategoryFilter,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

function toolsGalleryScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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
  return undefined;
}

/**
 * Same scroll-gated reveal as the shared Stack/Tools designs (see StackBrandCards) —
 * items sit hidden pre-paint and animate in once their row enters the viewport.
 */
function useToolsGalleryReveal(
  listRef: React.RefObject<HTMLUListElement | null>,
  itemSelector: string,
  deps: unknown[]
) {
  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = toolsGalleryScrollParent(root);
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(itemSelector)).filter(isLaidOut);
      if (items.length === 0) return;

      gsap.set(items, { y: 18, opacity: 0.22 });

      ScrollTrigger.batch(items, {
        start: 'top 90%',
        once: true,
        ...(scroller ? { scroller } : {}),
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.72,
            stagger: 0.08,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        },
      });
    }, root);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

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
      className="pf-tools-filter mb-6 flex flex-wrap items-baseline gap-x-5 gap-y-2 sm:mb-7"
      role="tablist"
      aria-label="Filter by category"
      style={
        {
          '--pf-tools-filter-ink': filterAccent,
          '--pf-tools-filter-muted': filterInactiveText,
          '--pf-tools-filter-rule': filterBorder,
        } as CSSProperties
      }
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeCategory === 'all'}
        data-on={activeCategory === 'all' ? 'true' : 'false'}
        onClick={() => onCategoryChange('all')}
        className="pf-tools-filter-chip"
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
            data-on={selected ? 'true' : 'false'}
            onClick={() => onCategoryChange(category)}
            className="pf-tools-filter-chip"
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

/**
 * Webflow / Framer directory rows — open list with hairline rules,
 * logo left, copy + chips, level aligned right.
 */
export function EditorialToolsBrandDirectory({ tools, presentation }: ToolsGalleryProps) {
  const listRef = useRef<HTMLUListElement>(null);

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

  const ink = presentation.labelColor?.trim() || 'currentColor';
  const rule = presentation.cardBorderColor;

  useToolsGalleryReveal(listRef, '.pf-tools-directory-row', [tools, presentation.cardGap, columnsPerRow]);

  if (tools.length === 0) return null;

  return (
    <ul
      ref={listRef}
      className={`pf-tools-directory w-full list-none p-0 ${gridClass}${multiColumn ? ' lg:border-t-0' : ''}`}
      role="list"
      data-columns={multiColumn ? 'multi' : '1'}
      style={
        {
          '--pf-tools-directory-ink': ink,
          '--pf-tools-directory-muted': presentation.descriptionColor,
          '--pf-tools-directory-rule': rule,
        } as CSSProperties
      }
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
            className={`pf-tools-directory-row min-w-0 ${multiColumn ? 'lg:h-full' : ''}`}
          >
            <article
              className={`pf-tools-directory-article grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-6 md:gap-8 ${
                multiColumn ? 'lg:p-5 xl:p-6' : toolsBrandDirectoryRowPadClass(presentation.cardGap)
              }`}
            >
              <div
                className="pf-tools-directory-mark flex shrink-0 items-center justify-center"
                data-pf-no-color-transition=""
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

              <div className="min-w-0 space-y-2 self-center">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {showName ? (
                    <h3
                      className="pf-tools-directory-name"
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
                    className="pf-tools-directory-desc max-w-2xl"
                    style={{ color: presentation.descriptionColor }}
                  >
                    {description}
                  </p>
                ) : null}

                {showUseCases && useCases.length > 0 ? (
                  <ul className="pf-tools-directory-chips flex list-none flex-wrap p-0">
                    {useCases.map((useCase) => (
                      <li
                        key={useCase}
                        className="pf-tools-directory-chip"
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
          data-pf-no-color-transition=""
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
 * Centered tile grid — logo, name, optional copy. Hairline frame, no lift.
 */
export function EditorialToolsBrandFloat({ tools, presentation }: ToolsGalleryProps) {
  const listRef = useRef<HTMLUListElement>(null);

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

  useToolsGalleryReveal(listRef, '.pf-tools-float-cell', [
    tools,
    presentation.cardGap,
    gridMode,
    presentation.brandFloatColumnsPerRow,
    presentation.brandFloatTileDensity,
  ]);

  if (tools.length === 0) return null;

  return (
    <ul
      ref={listRef}
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
          <li key={key} className="pf-tools-float-cell relative z-0 min-w-0 hover:z-10 focus-within:z-10">
            <article
              className={`pf-tools-float-card group relative flex h-full flex-col items-center overflow-visible px-4 pb-5 pt-6 sm:px-5 sm:pb-6 sm:pt-7 ${
                framed ? 'pf-tools-float-card--framed' : 'pf-tools-float-card--open'
              }`}
              data-pf-no-color-transition=""
              style={
                {
                  '--pf-tools-float-surface': framed ? presentation.cardBackgroundColor : 'transparent',
                  '--pf-tools-float-rule': framed ? border : 'transparent',
                  backgroundColor: framed ? presentation.cardBackgroundColor : 'transparent',
                } as CSSProperties
              }
            >
              {showLevel && level ? (
                <div className="relative z-[1] mb-2.5 flex w-full justify-end sm:mb-3">
                  <span
                    className="pf-tools-float-level"
                    style={{ color: presentation.levelAccentColor }}
                  >
                    {level}
                  </span>
                </div>
              ) : null}

              <div
                className="pf-tools-float-mark relative z-[1] mb-4 flex shrink-0 items-center justify-center sm:mb-5"
                data-pf-no-color-transition=""
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

              <div className="relative z-[1] flex w-full min-w-0 flex-1 flex-col items-center text-center">
                {showName ? (
                  <h3
                    className="pf-tools-float-name"
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
                  <ul className="pf-tools-float-chips mt-3 flex list-none flex-wrap justify-center p-0">
                    {useCases.slice(0, 3).map((useCase) => (
                      <li
                        key={useCase}
                        className="pf-tools-float-chip"
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
  const framed = resolveToolsLevelIndicatorCardFramed(presentation, 'level-stat-bars');
  const cardSurface = resolveToolsCardSurfaceColor(presentation);

  return (
    <article
      className={`pf-tools-stat-card group flex h-full flex-col items-center p-4 sm:p-[1.125rem] ${
        framed ? 'pf-tools-stat-card--framed' : 'pf-tools-stat-card--open'
      }`}
      data-pf-no-color-transition=""
      style={
        {
          '--pf-tools-stat-rule': presentation.cardBorderColor,
          backgroundColor: framed ? cardSurface : 'transparent',
        } as CSSProperties
      }
    >
      <div
        className="mb-3 flex shrink-0 items-center justify-center rounded-sm"
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
          className="pf-tools-stat-name mb-2.5 max-w-[8.5rem] text-center"
          style={toolsLabelColorStyle(presentation.labelColor)}
        >
          {name}
        </span>
      ) : null}

      {showLevel ? (
        <ToolsLevelStatBar
          level={level}
          toolName={name}
          fillColor={barColor}
          trackColor={levelTrackColor}
          className="mx-auto w-full"
        />
      ) : null}
    </article>
  );
}

/**
 * Landbook / Framer minimal grid — logo, name, 4-segment stat bar (no text level).
 */
export function EditorialToolsLevelStatBars({ tools, presentation }: ToolsGalleryProps) {
  const listRef = useRef<HTMLUListElement>(null);

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

  useToolsGalleryReveal(listRef, '.pf-tools-stat-cell', [tools, presentation.levelProgressRowGap]);

  if (tools.length === 0) return null;

  return (
    <ul
      ref={listRef}
      className={`grid w-full list-none grid-cols-2 p-0 sm:grid-cols-3 lg:grid-cols-4 ${toolsLevelIndicatorGridGapClass(presentation.levelProgressRowGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="pf-tools-stat-cell min-w-0">
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

