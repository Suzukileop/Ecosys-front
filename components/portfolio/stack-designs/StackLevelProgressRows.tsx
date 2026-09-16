'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  resolveToolLevelPercent,
  useToolLevelBarColor,
} from '@/components/creator/studio/creator-tool-logo-color';
import { ToolsLevelProgressBar } from '@/components/portfolio/portfolio-tools-level-indicators';
import {
  resolveSkillIconUrl,
  resolveSkillLevel,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import {
  resolveToolsIconBackgroundEnabled,
  resolveToolsLevelBarSize,
  resolveToolsLevelBarStyle,
  resolveToolsShowLevel,
  toolsBrandCardLogoPx,
  toolsLevelProgressRowsGridGapClass,
  toolsLevelProgressRowsRowClass,
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

function stackProgressScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function toolsIconFrameBackground(presentation: PortfolioToolsPresentationSettings): string {
  return resolveToolsIconBackgroundEnabled(presentation)
    ? presentation.tileBackgroundColor
    : 'transparent';
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

function toolsLogoColorMode(
  presentation: PortfolioToolsPresentationSettings
): 'light' | 'dark' {
  return presentation.activeColorMode === 'light' ? 'light' : 'dark';
}

function toolsLogosGrayscaleEnabled(presentation: PortfolioToolsPresentationSettings): boolean {
  return presentation.logosGrayscale === true;
}

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

function stackProgressMarkPx(tileSize: PortfolioToolsPresentationSettings['tileSize']): number {
  return Math.max(16, Math.round(toolsBrandCardLogoPx(tileSize) * 0.42));
}

function mixInk(color: string, amountPercent: number): string {
  return `color-mix(in srgb, ${color} ${amountPercent}%, transparent)`;
}

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
  const logoBrandColor =
    !toolsLogosGrayscaleEnabled(presentation) && fromLogo ? logoBarColor : undefined;
  const levelBarStyle = resolveToolsLevelBarStyle(presentation);
  const levelBarSize = resolveToolsLevelBarSize(presentation);
  const labelColor = presentation.labelColor;

  const logo = (
    <CreatorToolLogo
      label={name}
      iconUrl={iconUrl}
      size={logoPx}
      className="pf-stack-progress-logo shrink-0 rounded-sm"
      bgColor={logoContrastBg}
      colorMode={logoColorMode}
      brandColor={logoBrandColor}
      grayscale={toolsLogosGrayscaleEnabled(presentation)}
    />
  );

  return (
    <>
      <div className="pf-stack-progress-mark flex shrink-0 items-center">
        {showIconBg ? (
          <div
            className="flex items-center justify-center rounded-sm"
            style={{
              width: logoPx + 6,
              height: logoPx + 6,
              backgroundColor: tileBg,
            }}
          >
            {logo}
          </div>
        ) : (
          logo
        )}
      </div>

      <div className="pf-stack-progress-copy min-w-0">
        {showName || (showLevel && level) ? (
          <div className="pf-stack-progress-meta flex min-w-0 items-baseline justify-between gap-3">
            {showName ? (
              <span className="pf-stack-progress-name truncate font-medium leading-[1.3] tracking-[-0.02em]">
                {name}
              </span>
            ) : (
              <span className="min-w-0 flex-1" />
            )}
            {showLevel && level ? (
              <span
                className="pf-stack-progress-percent shrink-0 font-medium tabular-nums leading-none tracking-[0.04em]"
                style={{ color: mixInk(labelColor, 52) }}
              >
                {percent}%
              </span>
            ) : null}
          </div>
        ) : null}

        {showLevel ? (
          <div className="pf-stack-progress-bar w-full min-w-0">
            <ToolsLevelProgressBar
              level={level}
              toolName={name}
              fillColor={barColor}
              trackColor={levelTrackColor}
              percent={percent}
              barStyle={levelBarStyle}
              barSize={levelBarSize}
              barHeightVariant="thin"
              className="pf-stack-progress-track w-full min-w-0"
              fillClassName="pf-stack-progress-fill"
            />
          </div>
        ) : null}
      </div>
    </>
  );
}

export function EditorialToolsLevelProgressRows({ tools, presentation }: ToolsGalleryProps) {
  const listRef = useRef<HTMLUListElement>(null);

  const logoPx = stackProgressMarkPx(presentation.tileSize);
  const showIconBg = resolveToolsIconBackgroundEnabled(presentation);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const twoColumn = (presentation.levelProgressColumnsPerRow ?? 1) === 2;
  const rowGap = presentation.levelProgressRowGap;
  const rowClass = toolsLevelProgressRowsRowClass(rowGap);
  const ink = presentation.labelColor;
  const rule = presentation.cardBorderColor;
  const trackColor = presentation.cardBorderColor;

  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      root.removeAttribute('data-pf-gsap');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const scroller = stackProgressScrollParent(root);
    const rows = [...root.querySelectorAll<HTMLElement>('.pf-stack-progress-row')].filter(isLaidOut);
    if (rows.length === 0) return;

    root.setAttribute('data-pf-gsap', 'active');

    const ctx = gsap.context(() => {
      rows.forEach((row) => {
        const fills = [...row.querySelectorAll<HTMLElement>('.pf-stack-progress-fill')];
        if (fills.length === 0) return;

        fills.forEach((fill) => {
          fill.style.animation = 'none';
        });

        gsap.fromTo(
          fills,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.92,
            ease: 'power3.out',
            stagger: fills.length > 1 ? 0.045 : 0,
            transformOrigin: 'left center',
            force3D: false,
            overwrite: 'auto',
            immediateRender: true,
            scrollTrigger: {
              trigger: row,
              scroller,
              start: 'top 88%',
              once: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    }, root);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 90);
    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
      root.removeAttribute('data-pf-gsap');
    };
  }, [
    tools,
    showLevel,
    twoColumn,
    rowGap,
    presentation.levelBarStyle,
    presentation.levelBarSize,
  ]);

  if (tools.length === 0) return null;

  const listVars = {
    '--pf-stack-progress-ink': ink,
    '--pf-stack-progress-rule': rule,
    '--pf-stack-progress-track': trackColor,
  } as CSSProperties;

  return (
    <ul
      ref={listRef}
      className={
        twoColumn
          ? `pf-stack-progress-rows grid w-full list-none grid-cols-1 p-0 lg:grid-cols-2 ${toolsLevelProgressRowsGridGapClass(rowGap)}`
          : 'pf-stack-progress-rows w-full list-none p-0'
      }
      role="list"
      style={listVars}
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li
            key={key}
            className={`pf-stack-progress-row group ${rowClass} ${
              twoColumn ? '' : 'border-b last:border-b-0'
            }`}
            style={twoColumn ? undefined : { borderColor: mixInk(rule, 55) }}
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
              levelTrackColor={mixInk(trackColor, 42)}
              levelFallbackColor={presentation.labelColor}
            />
          </li>
        );
      })}
    </ul>
  );
}
