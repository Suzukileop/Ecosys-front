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
  resolveSkillLevelLabel,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import { readableMix } from '@/components/portfolio/stack-designs/readable-ink';
import { toolDisplayName } from '@/components/portfolio/stack-designs/tool-display-name';
import {
  resolveToolsIconBackgroundEnabled,
  resolveToolsLevelBarSize,
  resolveToolsLevelBarStyle,
  resolveToolsShowLevel,
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

/**
 * Own scale for the row mark: a fraction of the card logo size made "Very large"
 * (33px) barely bigger than "Standard". The mark spans name + bar, so it can grow.
 */
function stackProgressMarkPx(tileSize: PortfolioToolsPresentationSettings['tileSize']): number {
  if (tileSize === 'sm') return 24;
  if (tileSize === 'lg') return 40;
  if (tileSize === 'xl') return 48;
  return 32;
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
  // Brand tints are accepted from 1.4:1 upstream (JavaScript yellow ≈ 1.3:1 on white):
  // deepen the same hue until the bar clears 3:1 on the row surface.
  const barColor = readableMix(
    toolsLevelIndicatorFillColor(presentation, logoBarColor),
    100,
    logoContrastBg,
    3
  );
  const percent = resolveToolLevelPercent(level);
  const levelLabel = resolveSkillLevelLabel(tool);
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
      className="pf-stack-progress-logo shrink-0 rounded-xs"
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
            className="flex items-center justify-center rounded-xs"
            style={{
              width: Math.round(logoPx * 1.25),
              height: Math.round(logoPx * 1.25),
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
              <span className="pf-stack-progress-name min-w-0 font-medium leading-[1.3] tracking-[-0.02em]">
                {toolDisplayName(name)}
              </span>
            ) : (
              <span className="min-w-0 flex-1" />
            )}
            {showLevel && level ? (
              // Four levels printed as 25–100 % read as false precision ("100 %" = total
              // mastery): the bar carries the proportion, the text names the level.
              <span
                aria-hidden="true"
                className="pf-stack-progress-percent shrink-0 font-semibold uppercase leading-none tracking-[0.1em]"
                style={{ color: readableMix(labelColor, 62, logoContrastBg) }}
              >
                {levelLabel}
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
              valueText={levelLabel}
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
  // In the grid layout the grid gap already spaces rows (no dividers to pad away from), so
  // keeping the row padding too doubled the rhythm — ~140px per row on a phone.
  const rowClass = twoColumn
    ? `${toolsLevelProgressRowsRowClass(rowGap).replace(/(^|\s)(sm:)?py-\S+/g, '').trim()} content-center`
    : toolsLevelProgressRowsRowClass(rowGap);
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

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // GSAP's ScrollTrigger.refresh() can throw internally on an edge case
        // (e.g. "Cannot read properties of undefined (reading 'end')") during
        // its own init-time recompute; uncaught, that crash propagates up
        // through this deferred setTimeout with no React boundary to catch it
        // and takes down the whole page. Never let a best-effort refresh do that.
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);
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
            style={twoColumn ? undefined : { borderColor: 'var(--pf-stack-progress-line)' }}
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
              // The track shows where 100 % is: see --pf-stack-progress-line in globals.css.
              levelTrackColor="var(--pf-stack-progress-line)"
              levelFallbackColor={presentation.labelColor}
            />
          </li>
        );
      })}
    </ul>
  );
}
