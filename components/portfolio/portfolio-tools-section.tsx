'use client';

import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  resolveSkillDescription,
  resolveSkillIconUrl,
  resolveSkillLevelLabel,
  resolveSkillName,
  resolveSkillUseCases,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import {
  toolsBrandCardLogoPx,
  toolsBrandCardLogoTilePx,
  toolsBrandCardsGapClass,
  toolsBrandDirectoryRowPadClass,
  toolsBrandShowcaseGapClass,
  toolsBrandTilesGapClass,
  toolsBrandTilesIconFramePx,
  toolsBrandTilesLogoPx,
  toolsLabelColorStyle,
  toolsLogoSizePx,
  toolsShowcaseLogoPx,
  toolsTileSizePx,
  toolsWorkflowRailGapClass,
  type PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';

type ToolsGalleryProps = {
  tools: PortfolioSkillRef[];
  presentation: PortfolioToolsPresentationSettings;
};

/** Visible tile fill behind the icon (transparent when chip bg is off). */
function toolsIconFrameBackground(presentation: PortfolioToolsPresentationSettings): string {
  return presentation.iconBackgroundEnabled === true
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
  if (presentation.iconBackgroundEnabled === true) {
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

export function EditorialToolsGallery({ tools, presentation }: ToolsGalleryProps) {
  if (presentation.design === 'brand-cards') {
    return <EditorialToolsBrandCards tools={tools} presentation={presentation} />;
  }
  if (presentation.design === 'brand-directory') {
    return <EditorialToolsBrandDirectory tools={tools} presentation={presentation} />;
  }
  if (presentation.design === 'brand-showcase') {
    return <EditorialToolsBrandShowcase tools={tools} presentation={presentation} />;
  }
  if (presentation.design === 'brand-tiles') {
    return <EditorialToolsBrandTiles tools={tools} presentation={presentation} />;
  }
  return <EditorialToolsWorkflow tools={tools} presentation={presentation} />;
}

/** Logo tiles + name — first Tools design. */
export function EditorialToolsWorkflow({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const tilePx = toolsTileSizePx(presentation.tileSize);
  const logoPx = toolsLogoSizePx(presentation.tileSize);
  const showIconBg = presentation.iconBackgroundEnabled === true;
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showLabels = presentation.showLabels !== false;

  return (
    <ul
      className={`flex w-full list-none flex-wrap items-start justify-start p-0 sm:justify-between ${toolsWorkflowRailGapClass(presentation.cardGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;
        return (
          <li
            key={key}
            className="flex min-w-[4.5rem] max-w-[7.5rem] flex-1 flex-col items-center gap-3 sm:min-w-0 sm:max-w-none sm:flex-none"
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

  const tilePx = toolsBrandCardLogoTilePx(presentation.tileSize);
  const logoPx = toolsBrandCardLogoPx(presentation.tileSize);
  const showIconBg = presentation.iconBackgroundEnabled === true;
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showDescription = presentation.showDescription !== false;
  const showUseCases = presentation.showUseCases !== false;
  const showLevel = presentation.showLevel !== false;
  const showName = presentation.showLabels !== false;

  return (
    <ul
      className={`grid w-full list-none grid-cols-1 p-0 sm:grid-cols-2 lg:grid-cols-3 ${toolsBrandCardsGapClass(presentation.cardGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const description = resolveSkillDescription(tool);
        const useCases = resolveSkillUseCases(tool);
        const level = resolveSkillLevelLabel(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="min-w-0">
            <article
              className="flex h-full flex-col gap-4 rounded-[1.35rem] border p-5 transition duration-300 hover:-translate-y-0.5 sm:p-6"
              style={{
                backgroundColor: presentation.cardBackgroundColor,
                borderColor: presentation.cardBorderColor,
              }}
            >
              <div className="flex items-start justify-between gap-3">
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
                  />
                </div>
                {showLevel && level ? (
                  <span
                    className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide"
                    style={{
                      color: presentation.levelAccentColor,
                      backgroundColor: `${presentation.levelAccentColor}14`,
                    }}
                  >
                    {level}
                  </span>
                ) : null}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                {showName ? (
                  <h3
                    className="text-[1.05rem] font-semibold leading-snug tracking-tight sm:text-[1.125rem]"
                    style={toolsLabelColorStyle(presentation.labelColor)}
                  >
                    {name}
                  </h3>
                ) : null}

                {showDescription && description ? (
                  <p
                    className="text-[0.875rem] leading-relaxed sm:text-[0.9375rem]"
                    style={{ color: presentation.descriptionColor }}
                  >
                    {description}
                  </p>
                ) : null}

                {showUseCases && useCases.length > 0 ? (
                  <ul className="mt-auto flex list-none flex-wrap gap-1.5 pt-1 p-0">
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
  const showIconBg = presentation.iconBackgroundEnabled === true;
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showDescription = presentation.showDescription !== false;
  const showUseCases = presentation.showUseCases !== false;
  const showLevel = presentation.showLevel !== false;
  const showName = presentation.showLabels !== false;

  return (
    <ul
      className="w-full list-none border-t p-0"
      role="list"
      style={{ borderColor: presentation.cardBorderColor }}
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const description = resolveSkillDescription(tool);
        const useCases = resolveSkillUseCases(tool);
        const level = resolveSkillLevelLabel(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li
            key={key}
            className="group min-w-0 border-b"
            style={{ borderColor: presentation.cardBorderColor }}
          >
            <article
              className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 transition duration-300 ease-out group-hover:bg-black/[0.015] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-6 md:gap-8 ${toolsBrandDirectoryRowPadClass(presentation.cardGap)}`}
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
                  {showLevel && level ? (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide sm:hidden"
                      style={{
                        color: presentation.levelAccentColor,
                        backgroundColor: `${presentation.levelAccentColor}14`,
                      }}
                    >
                      {level}
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

              {showLevel && level ? (
                <div className="hidden self-center sm:block">
                  <span
                    className="inline-flex min-w-[6.5rem] items-center justify-center rounded-full px-3 py-1.5 text-[0.75rem] font-semibold tracking-wide"
                    style={{
                      color: presentation.levelAccentColor,
                      border: `1px solid ${presentation.levelAccentColor}33`,
                      backgroundColor: `${presentation.levelAccentColor}0f`,
                    }}
                  >
                    {level}
                  </span>
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

/**
 * Framer / Landbook horizontal showcase — logo in a tight tile (not a huge empty stage),
 * name + level, description, and use-case chips beside it.
 */
export function EditorialToolsBrandShowcase({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const logoPx = toolsShowcaseLogoPx(presentation.tileSize);
  const showIconBg = presentation.iconBackgroundEnabled === true;
  const tilePx = Math.round(logoPx * 1.55);
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const framePx = showIconBg ? tilePx : logoPx;
  const showDescription = presentation.showDescription !== false;
  const showUseCases = presentation.showUseCases !== false;
  const showLevel = presentation.showLevel !== false;
  const showName = presentation.showLabels !== false;

  return (
    <ul
      className={`grid w-full list-none grid-cols-1 p-0 lg:grid-cols-2 ${toolsBrandShowcaseGapClass(presentation.cardGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const description = resolveSkillDescription(tool);
        const useCases = resolveSkillUseCases(tool);
        const level = resolveSkillLevelLabel(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="group min-w-0">
            <article
              className="flex h-full gap-4 rounded-[1.35rem] border p-4 transition duration-300 hover:-translate-y-0.5 sm:gap-5 sm:p-5"
              style={{
                backgroundColor: presentation.cardBackgroundColor,
                borderColor: presentation.cardBorderColor,
              }}
            >
              <div
                className="flex shrink-0 items-center justify-center self-start rounded-2xl transition duration-300 group-hover:scale-[1.03]"
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
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  {showName ? (
                    <h3
                      className="text-[1.05rem] font-semibold leading-snug tracking-tight sm:text-[1.125rem]"
                      style={toolsLabelColorStyle(presentation.labelColor)}
                    >
                      {name}
                    </h3>
                  ) : (
                    <span />
                  )}
                  {showLevel && level ? (
                    <span
                      className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide"
                      style={{
                        color: presentation.levelAccentColor,
                        backgroundColor: `${presentation.levelAccentColor}14`,
                      }}
                    >
                      {level}
                    </span>
                  ) : null}
                </div>

                {showDescription && description ? (
                  <p
                    className="text-[0.875rem] leading-relaxed sm:text-[0.9375rem]"
                    style={{ color: presentation.descriptionColor }}
                  >
                    {description}
                  </p>
                ) : null}

                {showUseCases && useCases.length > 0 ? (
                  <ul className="mt-auto flex list-none flex-wrap gap-1.5 pt-0.5 p-0">
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
            </article>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Social-style compact tiles — icon left, bold name right,
 * optional description / chips / level when toggles are on.
 */
export function EditorialToolsBrandTiles({ tools, presentation }: ToolsGalleryProps) {
  if (tools.length === 0) return null;

  const framePx = toolsBrandTilesIconFramePx(presentation.tileSize);
  const logoPx = toolsBrandTilesLogoPx(presentation.tileSize);
  const showIconBg = presentation.iconBackgroundEnabled === true;
  const tileBg = toolsIconFrameBackground(presentation);
  const logoContrastBg = toolsLogoContrastBackground(presentation);
  const logoColorMode = toolsLogoColorMode(presentation);
  const iconFramePx = showIconBg ? framePx : logoPx;
  const showDescription = presentation.showDescription !== false;
  const showUseCases = presentation.showUseCases !== false;
  const showLevel = presentation.showLevel !== false;
  const showName = presentation.showLabels !== false;

  return (
    <ul
      className={`grid w-full list-none grid-cols-1 p-0 sm:grid-cols-2 lg:grid-cols-3 ${toolsBrandTilesGapClass(presentation.cardGap)}`}
      role="list"
    >
      {tools.map((tool) => {
        const name = resolveSkillName(tool);
        const description = resolveSkillDescription(tool);
        const useCases = resolveSkillUseCases(tool);
        const level = resolveSkillLevelLabel(tool);
        const key = typeof tool === 'string' ? tool : `${tool.name}-${tool.iconUrl ?? ''}`;

        return (
          <li key={key} className="min-w-0">
            <article
              className="flex h-full flex-col rounded-xl border px-3.5 py-3 transition duration-200 hover:-translate-y-px sm:px-4 sm:py-3.5"
              style={{
                backgroundColor: presentation.cardBackgroundColor,
                borderColor: presentation.cardBorderColor,
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-black/[0.06]"
                  style={{
                    width: iconFramePx,
                    height: iconFramePx,
                    backgroundColor: tileBg,
                  }}
                >
                  <CreatorToolLogo
                    label={name}
                    iconUrl={resolveSkillIconUrl(tool)}
                    size={logoPx}
                    className="rounded-full"
                    bgColor={logoContrastBg}
                    colorMode={logoColorMode}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {showName || (showLevel && level) ? (
                    <div className="flex min-w-0 items-center gap-2">
                      {showName ? (
                        <span
                          className="truncate text-[0.9375rem] font-bold leading-tight tracking-tight"
                          style={toolsLabelColorStyle(presentation.labelColor)}
                        >
                          {name}
                        </span>
                      ) : null}
                      {showLevel && level ? (
                        <span
                          className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide"
                          style={{
                            color: presentation.levelAccentColor,
                            backgroundColor: `${presentation.levelAccentColor}14`,
                          }}
                        >
                          {level}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {showDescription && description ? (
                    <p
                      className="line-clamp-2 text-[0.75rem] leading-snug"
                      style={{ color: presentation.descriptionColor }}
                    >
                      {description}
                    </p>
                  ) : null}

                  {showUseCases && useCases.length > 0 ? (
                    <ul className="mt-0.5 flex list-none flex-wrap gap-1 p-0">
                      {useCases.map((useCase) => (
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
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
