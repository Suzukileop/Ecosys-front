'use client';

import type { CSSProperties } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  resolveToolLevelPercent,
  useToolLevelBarColor,
} from '@/components/creator/studio/creator-tool-logo-color';
import {
  resolveToolsLevelBarColors,
  ToolsLevelProgressBar,
} from '@/components/portfolio/portfolio-tools-level-indicators';
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
import {
  resolveSkillCategoryDisplay,
  resolveSkillIconUrl,
  resolveSkillLevel,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

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

function stackCatRowsInk(presentation: PortfolioToolsPresentationSettings): string {
  const label = presentation.labelColor?.trim();
  if (label) return label;
  return presentation.activeColorMode === 'dark' ? '#f5f5f5' : '#171717';
}

function stackCatRowsListStyle(
  presentation: PortfolioToolsPresentationSettings
): CSSProperties {
  return {
    '--pf-stack-cat-rows-ink': stackCatRowsInk(presentation),
    '--pf-stack-cat-rows-rule': presentation.cardBorderColor,
    '--pf-stack-cat-rows-track': presentation.cardBorderColor,
  } as CSSProperties;
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
  const logoBrandColor =
    !toolsLogosGrayscaleEnabled(presentation) && fromLogo ? logoBarColor : undefined;
  const levelBarStyle = resolveToolsLevelBarStyle(presentation);
  const levelBarSize = resolveToolsLevelBarSize(presentation);
  const rowHasLevel = showLevel && Boolean(level);
  const hasKicker = category.length > 0;
  const hasName = showName && name.length > 0;

  return (
    <li
      className={`pf-stack-cat-rows-row group ${toolsLevelProgressRowsRowClass(presentation.levelProgressRowGap)}`}
      data-kicker={hasKicker ? 'on' : 'off'}
      data-name={hasName ? 'on' : 'off'}
      data-meter={rowHasLevel ? 'on' : 'off'}
      style={
        {
          '--pf-stack-cat-rows-fill': barColor,
          '--pf-stack-cat-rows-track': levelTrackColor,
        } as CSSProperties
      }
    >
      <CreatorToolLogo
        label={name}
        iconUrl={iconUrl}
        size={logoPx}
        className="pf-stack-cat-rows-logo shrink-0 rounded-md"
        bgColor={logoContrastBg}
        colorMode={logoColorMode}
        brandColor={logoBrandColor}
        grayscale={toolsLogosGrayscaleEnabled(presentation)}
      />

      {hasKicker ? (
        <p className="pf-stack-cat-rows-kicker min-w-0 truncate">{category}</p>
      ) : null}

      {hasName ? (
        <p className="pf-stack-cat-rows-name min-w-0 truncate" title={name}>
          {name}
        </p>
      ) : null}

      {rowHasLevel && level ? (
        <>
          <div className="pf-stack-cat-rows-meter min-w-0">
            <ToolsLevelProgressBar
              level={level}
              toolName={name}
              fillColor={barColor}
              trackColor={levelTrackColor}
              percent={percent}
              barStyle={levelBarStyle}
              barSize={levelBarSize}
              barHeightVariant="thin"
              className="pf-stack-cat-rows-bar min-w-0"
            />
          </div>
          <span className="pf-stack-cat-rows-percent tabular-nums" aria-hidden="true">
            {percent}%
          </span>
        </>
      ) : null}
    </li>
  );
}

/** Editorial index — kicker above the name, thin bar and % on one right column. */
export function EditorialToolsLevelCategoryRows({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const showName = presentation.showLabels !== false;
  const showLevel = resolveToolsShowLevel(presentation);
  const twoColumn = (presentation.levelProgressColumnsPerRow ?? 1) === 2;
  const rowGap = presentation.levelProgressRowGap;
  const levelBarColors = resolveToolsLevelBarColors(presentation);

  return (
    <ul
      className={
        twoColumn
          ? `pf-stack-cat-rows pf-stack-cat-rows-list grid w-full list-none grid-cols-1 p-0 lg:grid-cols-2 ${toolsLevelProgressRowsGridGapClass(rowGap)}`
          : 'pf-stack-cat-rows pf-stack-cat-rows-list w-full list-none p-0'
      }
      role="list"
      data-columns={twoColumn ? '2' : '1'}
      style={stackCatRowsListStyle(presentation)}
    >
      {tools.map((tool) => {
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <ToolLevelCategoryRowItem
            key={key}
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
        );
      })}
    </ul>
  );
}
