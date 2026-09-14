'use client';

import { useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { resolveToolLevelPercent } from '@/components/creator/studio/creator-tool-logo-color';
import type { ProfileStrengthToolLevel } from '@/types/ecosystem';
import {
  resolveLevelDotCount,
  resolveToolsLevelBarColors,
  resolveToolsLevelSemanticColor,
  ToolsLevelProgressBar,
  ToolsLevelStarRating,
} from '@/components/portfolio/portfolio-tools-level-indicators';
import {
  resolveToolsDesignContentAlignment,
  resolveToolsIconBackgroundEnabled,
  resolveToolsLevelBarSize,
  resolveToolsLevelBarStyle,
  resolveToolsLevelIndicatorCardFramed,
  resolveToolsCardSurfaceColor,
  resolveToolsLevelIndicatorDisplayStyle,
  resolveToolsLevelTableGroupBy,
  resolveToolsShowLevel,
  toolsBrandCardLogoPx,
  toolsLevelBentoEqualColumnsClass,
  toolsLevelBentoGridGapClass,
  type PortfolioToolsCardGap,
  type PortfolioToolsLevelBentoGridMode,
  type PortfolioToolsLevelIndicatorDisplayStyle,
  type PortfolioToolsLevelProgressRowGap,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  groupSkillsByCategory,
  resolveSkillIconUrl,
  resolveSkillLevel,
  resolveSkillLevelLabel,
  resolveSkillName,
  type PortfolioSkillRef,
  type SkillCategoryGroup,
} from '@/components/portfolio/skill-usage-descriptions';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

type BentoRootStyle = CSSProperties & {
  '--pf-stack-bento-ink': string;
  '--pf-stack-bento-line': string;
  '--pf-stack-bento-fill': string;
  '--pf-stack-bento-accent': string;
  '--pf-stack-bento-logo': string;
  '--pf-stack-bento-level': string;
  '--pf-stack-bento-row-min': string;
  '--pf-stack-bento-row-pad': string;
  '--pf-stack-bento-pad': string;
  '--pf-stack-bento-pad-x': string;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

function stackBentoScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function toolsLogoContrastBackground(presentation: PortfolioToolsPresentationSettings): string {
  if (resolveToolsIconBackgroundEnabled(presentation)) {
    return presentation.tileBackgroundColor;
  }
  const card = presentation.cardBackgroundColor?.trim();
  if (card && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(card)) {
    return card;
  }
  return presentation.activeColorMode === 'dark' ? '#0a0a0a' : '#ffffff';
}

function toolsLogoColorMode(presentation: PortfolioToolsPresentationSettings): 'light' | 'dark' {
  return presentation.activeColorMode === 'light' ? 'light' : 'dark';
}

function toolsLogosGrayscaleEnabled(presentation: PortfolioToolsPresentationSettings): boolean {
  return presentation.logosGrayscale === true;
}

function stackBentoInk(presentation: PortfolioToolsPresentationSettings): string {
  const label = presentation.labelColor?.trim();
  if (label) return label;
  return presentation.activeColorMode === 'dark' ? '#f5f5f5' : '#171717';
}

function mixInk(color: string, amountPercent: number): string {
  return `color-mix(in srgb, ${color} ${amountPercent}%, transparent)`;
}

function mixSemantic(hue: string, ink: string, amount: number): string {
  return `color-mix(in srgb, ${hue} ${amount}%, ${ink})`;
}

function bentoPadVars(gap: PortfolioToolsCardGap | undefined): { pad: string; padX: string } {
  if (gap === 'large') return { pad: '1.45rem', padX: '1.5rem' };
  if (gap === 'xlarge') return { pad: '1.7rem', padX: '1.75rem' };
  if (gap === 'medium') return { pad: '1.3rem', padX: '1.35rem' };
  return { pad: '1.1rem', padX: '1.2rem' };
}

function bentoRowVars(rowGap: PortfolioToolsLevelProgressRowGap | undefined): {
  min: string;
  pad: string;
} {
  if (rowGap === 'tight') return { min: '2.35rem', pad: '0.38rem' };
  if (rowGap === 'large') return { min: '3.15rem', pad: '0.7rem' };
  if (rowGap === 'xlarge') return { min: '3.5rem', pad: '0.85rem' };
  return { min: '2.75rem', pad: '0.52rem' };
}

function bentoLevelTrack(
  style: PortfolioToolsLevelIndicatorDisplayStyle,
  showLevel: boolean
): string {
  if (!showLevel) return '0px';
  if (style === 'progress-bar') return '4.35rem';
  if (style === 'stars') return '5.85rem';
  if (style === 'dots') return '4.85rem';
  return '6.35rem';
}

function resolveFeaturedCategory(
  groups: SkillCategoryGroup[],
  mode: PortfolioToolsLevelBentoGridMode | undefined,
  columnCount: number
): string | null {
  if (mode !== 'asymmetric' || groups.length < 2 || columnCount < 3) return null;

  const ranked = [...groups].sort((a, b) => b.tools.length - a.tools.length);
  const lead = ranked[0];
  const runner = ranked[1];
  if (!lead || lead.tools.length < 4) return null;
  if (runner && lead.tools.length - runner.tools.length < 2) return null;
  return lead.category;
}

function BentoLevelRead({
  tool,
  name,
  level,
  displayStyle,
  presentation,
  semanticHue,
  ink,
  trackColor,
}: {
  tool: PortfolioSkillRef;
  name: string;
  level: ProfileStrengthToolLevel;
  displayStyle: PortfolioToolsLevelIndicatorDisplayStyle;
  presentation: PortfolioToolsPresentationSettings;
  semanticHue: string;
  ink: string;
  trackColor: string;
}): ReactNode {
  if (displayStyle === 'progress-bar') {
    return (
      <ToolsLevelProgressBar
        level={level}
        toolName={name}
        fillColor={mixSemantic(semanticHue, ink, 52)}
        trackColor={trackColor}
        percent={resolveToolLevelPercent(level)}
        barStyle={resolveToolsLevelBarStyle(presentation)}
        barSize={resolveToolsLevelBarSize(presentation)}
        barHeightVariant="thin"
        className="pf-stack-bento-bar w-full"
      />
    );
  }

  if (displayStyle === 'stars') {
    return (
      <ToolsLevelStarRating
        level={level}
        toolName={name}
        fillColor={mixSemantic(semanticHue, ink, 62)}
        trackColor={trackColor}
        className="pf-stack-bento-stars"
      />
    );
  }

  if (displayStyle === 'dots') {
    const filled = resolveLevelDotCount(level);
    return (
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={filled}
        aria-label={`${name} proficiency`}
        className="pf-stack-bento-dots"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="pf-stack-bento-dot"
            data-on={index < filled ? 'true' : 'false'}
          />
        ))}
      </div>
    );
  }

  return <span className="pf-stack-bento-level-label">{resolveSkillLevelLabel(tool)}</span>;
}

function BentoSkillRow({
  tool,
  presentation,
  logoPx,
  logoContrastBg,
  logoColorMode,
  grayscale,
  showName,
  showLevel,
  displayStyle,
  ink,
  trackColor,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  logoPx: number;
  logoContrastBg: string;
  logoColorMode: 'light' | 'dark';
  grayscale: boolean;
  showName: boolean;
  showLevel: boolean;
  displayStyle: PortfolioToolsLevelIndicatorDisplayStyle;
  ink: string;
  trackColor: string;
}) {
  const name = resolveSkillName(tool);
  const level = resolveSkillLevel(tool);
  const semanticHue =
    level != null ? resolveToolsLevelSemanticColor(level, presentation, grayscale) : ink;

  return (
    <li
      className="pf-stack-bento-skill"
      data-pf-no-color-transition=""
      style={{ '--pf-stack-bento-level-hue': semanticHue } as CSSProperties}
    >
      <div className="pf-stack-bento-mark">
        <CreatorToolLogo
          label={name}
          iconUrl={resolveSkillIconUrl(tool)}
          size={logoPx}
          className="pf-stack-bento-logo"
          bgColor={logoContrastBg}
          colorMode={logoColorMode}
          grayscale={grayscale}
        />
      </div>

      {showName ? (
        <span className="pf-stack-bento-name">{name}</span>
      ) : (
        <span className="pf-stack-bento-name pf-stack-bento-name--empty" aria-hidden="true" />
      )}

      {showLevel ? (
        <div className="pf-stack-bento-level">
          {level ? (
            <BentoLevelRead
              tool={tool}
              name={name}
              level={level}
              displayStyle={displayStyle}
              presentation={presentation}
              semanticHue={semanticHue}
              ink={ink}
              trackColor={trackColor}
            />
          ) : (
            <span aria-hidden="true">&nbsp;</span>
          )}
        </div>
      ) : null}
    </li>
  );
}

/**
 * Level bento — one quiet hairline panel per category.
 * Inner rows share one invisible logo | name | level grid; hover lives on the row.
 */
export function EditorialToolsLevelBentoCategories({ tools, presentation }: ToolsGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);

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

  const columnCount = Math.min(4, Math.max(groups.length, 1));
  const featuredCategory = useMemo(
    () => resolveFeaturedCategory(groups, presentation.levelBentoGridMode, columnCount),
    [columnCount, groups, presentation.levelBentoGridMode]
  );

  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const framed = resolveToolsLevelIndicatorCardFramed(presentation, 'level-bento-categories');
  const cardSurface = resolveToolsCardSurfaceColor(presentation);
  const grayscale = toolsLogosGrayscaleEnabled(presentation);
  const displayStyle = resolveToolsLevelIndicatorDisplayStyle(presentation);
  const { trackColor } = resolveToolsLevelBarColors(presentation);
  const alignment = resolveToolsDesignContentAlignment('level-bento-categories', presentation);
  const ink = stackBentoInk(presentation);
  const line = presentation.cardBorderColor?.trim() || ink;
  const accent = presentation.levelAccentColor?.trim() || ink;
  const pad = bentoPadVars(presentation.cardGap);
  const row = bentoRowVars(presentation.levelProgressRowGap);
  const motionKey = groups
    .map((group) => `${group.category}:${group.tools.length}`)
    .join('|');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || groups.length === 0) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = stackBentoScrollParent(root);
    const panels = [...root.querySelectorAll<HTMLElement>('.pf-stack-bento-panel')].filter(
      isLaidOut
    );
    if (panels.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panels,
        { opacity: 0.22 },
        {
          opacity: 1,
          duration: 0.62,
          stagger: 0.05,
          ease: 'power2.out',
          overwrite: 'auto',
          immediateRender: false,
          scrollTrigger: {
            trigger: root,
            start: 'top 90%',
            once: true,
            invalidateOnRefresh: true,
            ...(scroller ? { scroller } : {}),
          },
        }
      );
    }, root);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [motionKey, groups.length]);

  if (groups.length === 0) return null;

  const rootStyle: BentoRootStyle = {
    '--pf-stack-bento-ink': ink,
    '--pf-stack-bento-line': line,
    '--pf-stack-bento-fill': framed ? cardSurface : 'transparent',
    '--pf-stack-bento-accent': accent,
    '--pf-stack-bento-logo': `${logoPx}px`,
    '--pf-stack-bento-level': bentoLevelTrack(displayStyle, showLevel),
    '--pf-stack-bento-row-min': row.min,
    '--pf-stack-bento-row-pad': row.pad,
    '--pf-stack-bento-pad': pad.pad,
    '--pf-stack-bento-pad-x': pad.padX,
  };

  return (
    <div
      ref={rootRef}
      className={`pf-stack-bento grid w-full grid-cols-1 items-stretch ${toolsLevelBentoEqualColumnsClass(columnCount)} ${toolsLevelBentoGridGapClass(presentation.cardGap)}`}
      data-framed={framed ? 'true' : 'false'}
      data-show-name={showName ? 'true' : 'false'}
      data-show-level={showLevel ? 'true' : 'false'}
      data-level-style={displayStyle}
      data-align={alignment}
      style={rootStyle}
    >
      {groups.map((group) => {
        const featured = featuredCategory === group.category;
        const countLabel = String(group.tools.length).padStart(2, '0');

        return (
          <article
            key={group.category}
            className="pf-stack-bento-panel"
            data-featured={featured ? 'true' : 'false'}
            data-span={featured ? '2' : '1'}
            aria-label={`${group.category}, ${group.tools.length} ${
              group.tools.length === 1 ? 'skill' : 'skills'
            }`}
          >
            <header className="pf-stack-bento-kicker">
              <h3 className="pf-stack-bento-kicker-title">{group.category}</h3>
              <span className="pf-stack-bento-kicker-count" aria-hidden="true">
                {countLabel}
              </span>
            </header>

            <ul className="pf-stack-bento-list" role="list">
              {group.tools.map((tool) => {
                const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;
                return (
                  <BentoSkillRow
                    key={key}
                    tool={tool}
                    presentation={presentation}
                    logoPx={logoPx}
                    logoContrastBg={logoContrastBg}
                    logoColorMode={logoColorMode}
                    grayscale={grayscale}
                    showName={showName}
                    showLevel={showLevel}
                    displayStyle={displayStyle}
                    ink={ink}
                    trackColor={mixInk(trackColor, 42)}
                  />
                );
              })}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
