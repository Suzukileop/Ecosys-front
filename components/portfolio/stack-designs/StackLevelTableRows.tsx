'use client';

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
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
  resolveToolsIconBackgroundEnabled,
  resolveToolsLevelBarSize,
  resolveToolsLevelBarStyle,
  resolveToolsLevelIndicatorDisplayStyle,
  resolveToolsLevelIndicatorFullWidth,
  resolveToolsLevelTableGroupBy,
  resolveToolsShowLevel,
  toolsBrandCardLogoPx,
  type PortfolioToolsLevelIndicatorDisplayStyle,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  resolveSkillCategory,
  resolveSkillCategoryDisplay,
  resolveSkillIconUrl,
  resolveSkillLevel,
  resolveSkillLevelLabel,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function stackTableScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function stackTableInk(presentation: PortfolioToolsPresentationSettings): string {
  const label = presentation.labelColor?.trim();
  if (label) return label;
  return presentation.activeColorMode === 'dark' ? '#f5f5f5' : '#171717';
}

function stackTableMuted(presentation: PortfolioToolsPresentationSettings, ink: string): string {
  const muted = presentation.descriptionColor?.trim();
  if (muted) return muted;
  return `color-mix(in srgb, ${ink} 48%, transparent)`;
}

function mixSemantic(hue: string, ink: string, amount: number): string {
  return `color-mix(in srgb, ${hue} ${amount}%, ${ink})`;
}

function sameTableGroup(
  a: PortfolioSkillRef,
  b: PortfolioSkillRef,
  groupBy: 'category' | 'level'
): boolean {
  if (groupBy === 'level') {
    return resolveSkillLevel(a) === resolveSkillLevel(b);
  }
  return (
    resolveSkillCategory(a).toLocaleLowerCase() === resolveSkillCategory(b).toLocaleLowerCase()
  );
}

function stackTableRowPadClass(gap: PortfolioToolsPresentationSettings['levelProgressRowGap']): string {
  if (gap === 'tight') return 'pf-stack-table-row--tight';
  if (gap === 'large') return 'pf-stack-table-row--large';
  if (gap === 'xlarge') return 'pf-stack-table-row--xlarge';
  return 'pf-stack-table-row--medium';
}

function TableLevelRead({
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
        className="pf-stack-table-bar w-full"
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
        className="pf-stack-table-stars"
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
        className="pf-stack-table-dots"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="pf-stack-table-dot"
            data-on={index < filled ? 'true' : 'false'}
          />
        ))}
      </div>
    );
  }

  return <span className="pf-stack-table-level-label">{resolveSkillLevelLabel(tool)}</span>;
}

/**
 * Headerless stack ledger — optically locked columns, whispered level hue, muted %.
 */
export function EditorialToolsLevelTableRows({ tools, presentation }: ToolsGalleryProps) {
  const listRef = useRef<HTMLUListElement>(null);

  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const grayscale = toolsLogosGrayscaleEnabled(presentation);
  const fullWidth = resolveToolsLevelIndicatorFullWidth(presentation);
  const levelDisplayStyle = resolveToolsLevelIndicatorDisplayStyle(presentation);
  const groupBy = resolveToolsLevelTableGroupBy(presentation);
  const levelBarSize = resolveToolsLevelBarSize(presentation);
  const { trackColor } = resolveToolsLevelBarColors(presentation);
  const ink = stackTableInk(presentation);
  const muted = stackTableMuted(presentation, ink);
  const border = presentation.cardBorderColor?.trim() || ink;
  const hairline = `color-mix(in srgb, ${border} 42%, transparent)`;
  const wash = `color-mix(in srgb, ${ink} 3%, transparent)`;
  const cols = showLevel ? '4' : '2';
  const rowPadClass = stackTableRowPadClass(presentation.levelProgressRowGap);

  const listStyle = {
    '--pf-stack-table-ink': ink,
    '--pf-stack-table-muted': muted,
    '--pf-stack-table-line': hairline,
    '--pf-stack-table-wash': wash,
  } as CSSProperties;

  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root || tools.length === 0) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = stackTableScrollParent(root);
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.pf-stack-table-row'));
      if (items.length === 0) return;

      // Hide immediately (pre-paint) so rows never flash at their static/visible
      // state before ScrollTrigger fires — only the reveal is scroll-gated.
      gsap.set(items, { y: 12, opacity: 0.28 });

      ScrollTrigger.batch(items, {
        start: 'top 92%',
        once: true,
        ...(scroller ? { scroller } : {}),
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.68,
            stagger: 0.05,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        },
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, [tools, showLevel, presentation.levelProgressRowGap, fullWidth]);

  if (tools.length === 0) return null;

  return (
    <ul
      ref={listRef}
      className="pf-stack-table"
      role="list"
      data-cols={cols}
      data-full={fullWidth ? 'true' : 'false'}
      data-pct={levelBarSize}
      data-level-style={levelDisplayStyle}
      style={listStyle}
    >
      {tools.map((tool, index) => {
        const name = resolveSkillName(tool);
        const category = resolveSkillCategoryDisplay(tool);
        const level = resolveSkillLevel(tool);
        const percent = resolveToolLevelPercent(level);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;
        const previous = index > 0 ? tools[index - 1] : undefined;
        const groupBreak =
          previous != null ? !sameTableGroup(previous, tool, groupBy) : false;
        const semanticHue =
          level != null
            ? resolveToolsLevelSemanticColor(level, presentation, grayscale)
            : ink;

        return (
          <li
            key={key}
            className={`pf-stack-table-row ${rowPadClass}`}
            data-break={groupBreak ? 'on' : 'off'}
            data-pf-no-color-transition=""
            style={
              {
                '--pf-stack-table-level': semanticHue,
              } as CSSProperties
            }
          >
            <div className="pf-stack-table-identity">
              <CreatorToolLogo
                label={name}
                iconUrl={resolveSkillIconUrl(tool)}
                size={logoPx}
                className="pf-stack-table-logo shrink-0"
                bgColor={logoContrastBg}
                colorMode={logoColorMode}
                grayscale={grayscale}
              />
              {showName ? <span className="pf-stack-table-name">{name}</span> : null}
            </div>

            <span className="pf-stack-table-category">{category || '\u00a0'}</span>

            {showLevel ? (
              <>
                <div className="pf-stack-table-level">
                  {level ? (
                    <TableLevelRead
                      tool={tool}
                      name={name}
                      level={level}
                      displayStyle={levelDisplayStyle}
                      presentation={presentation}
                      semanticHue={semanticHue}
                      ink={ink}
                      trackColor={trackColor}
                    />
                  ) : (
                    <span aria-hidden="true">&nbsp;</span>
                  )}
                </div>
                <span
                  className="pf-stack-table-percent"
                  aria-label={level ? `${percent} percent` : undefined}
                >
                  {level ? (
                    <>
                      {percent}
                      <span className="pf-stack-table-percent-mark" aria-hidden="true">
                        %
                      </span>
                    </>
                  ) : (
                    '\u00a0'
                  )}
                </span>
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
