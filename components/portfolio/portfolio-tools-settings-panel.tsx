'use client';

import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';
import {
  PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_ROW_CELL_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_FLOAT_GRID_MODE_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_FLOAT_TILE_DENSITY_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_FLOAT_COLUMNS_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_FLOAT_CARD_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_HEADER_ALIGNMENT_OPTIONS,
  PORTFOLIO_TOOLS_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_DIRECTORY_LEVEL_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_CARD_GAP_OPTIONS,
  PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS,
  PORTFOLIO_TOOLS_DESIGN_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_PROGRESS_COLUMNS_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_BENTO_GRID_MODE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS,
  PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS,
  PORTFOLIO_TOOLS_TITLE_PRESET_OPTIONS,
  type PortfolioToolsDesign,
  type PortfolioToolsBrandCardsIconPlacement,
  type PortfolioToolsBrandDirectoryLevelStyle,
  type PortfolioToolsBrandRowCellStyle,
  type PortfolioToolsBrandFloatGridMode,
  type PortfolioToolsBrandFloatTileDensity,
  type PortfolioToolsBrandFloatCardStyle,
  type PortfolioToolsCardGap,
  type PortfolioToolsContentAlignment,
  type PortfolioToolsLevelProgressRowGap,
  type PortfolioToolsLevelBarStyle,
  type PortfolioToolsLevelBarSize,
  type PortfolioToolsLevelIndicatorDisplayStyle,
  type PortfolioToolsLevelIndicatorCardStyle,
  type PortfolioToolsLevelBentoGridMode,
  type PortfolioToolsLevelTableGroupBy,
  type PortfolioToolsSectionSettings,
  type PortfolioToolsSubtitlePreset,
  type PortfolioToolsTileSize,
  type PortfolioToolsTitlePreset,
  resolveToolsIconBackgroundEnabled,
  resolveToolsLevelIndicatorFullWidth,
  resolveToolsLevelIndicatorShowCategoryFilter,
  resolveToolsShowLevel,
  toolsLevelBentoCategoriesDesignDefaults,
  toolsLevelStarCardsDesignDefaults,
  toolsLevelSvgRingsDesignDefaults,
  toolsLevelIndicatorDesignSupportsCardFrame,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  applyToolsPaletteToSettings,
  DEFAULT_TOOLS_COLOR_BINDINGS,
  DEFAULT_TOOLS_PALETTE,
  mergeToolsColorBindings,
  mergeToolsPalette,
  patchToolsColorBinding,
  PORTFOLIO_TOOLS_COLOR_SLOT_OPTIONS,
  type ToolsColorSlot,
} from '@/components/portfolio/portfolio-tools-palette-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';

export type ToolsSubSection = 'general' | 'palette' | 'background';

const SUBSECTIONS: { value: ToolsSubSection; label: string }[] = [
  { value: 'general', label: 'Général' },
  { value: 'palette', label: 'Palette' },
  { value: 'background', label: 'Arrière-plan' },
];

export function normalizeToolsSubSection(value: string | undefined): ToolsSubSection {
  return SUBSECTIONS.some((item) => item.value === value) ? (value as ToolsSubSection) : 'general';
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-3">
      <span className="text-sm font-semibold text-neutral-900">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <select
        value={value}
        onChange={(event) => {
          const option = options.find((item) => item.value === event.target.value);
          if (option) onChange(option.value);
        }}
        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
        />
      </div>
    </label>
  );
}

type ToolsSettingsPanelProps = {
  tools: PortfolioToolsSectionSettings;
  onChange: (patch: Partial<PortfolioToolsSectionSettings>) => void;
  subSection?: ToolsSubSection;
  onSubSectionChange?: (value: ToolsSubSection) => void;
  designOptions?: { value: PortfolioToolsDesign; label: string; description: string }[];
  designOptionsFilter?: (design: PortfolioToolsDesign) => boolean;
  titlePresetOptions?: { value: PortfolioToolsTitlePreset; label: string; description?: string }[];
  sectionToggleLabel?: string;
};

export function ToolsSettingsPanel({
  tools,
  onChange,
  subSection = 'general',
  onSubSectionChange,
  designOptions: designOptionsProp,
  designOptionsFilter,
  titlePresetOptions: titlePresetOptionsProp,
  sectionToggleLabel = 'Afficher la section Tools',
}: ToolsSettingsPanelProps) {
  const palette = mergeToolsPalette(DEFAULT_TOOLS_PALETTE, tools.toolsPalette);
  const bindings = mergeToolsColorBindings(DEFAULT_TOOLS_COLOR_BINDINGS, tools.toolsColorBindings);
  const current = normalizeToolsSubSection(subSection);
  const isRichToolsDesign =
    tools.design === 'brand-cards' ||
    tools.design === 'brand-directory' ||
    tools.design === 'brand-index' ||
    tools.design === 'brand-float';
  const isLevelIndicatorDesign =
    tools.design === 'level-stat-bars' ||
    tools.design === 'level-progress-rows' ||
    tools.design === 'level-category-rows' ||
    tools.design === 'level-table-rows' ||
    tools.design === 'level-circular-cards' ||
    tools.design === 'level-star-cards' ||
    tools.design === 'level-svg-rings' ||
    tools.design === 'level-bento-categories';
  const isBrandRowFrames =
    tools.design === 'brand-row' && (tools.brandRowCellStyle ?? 'dividers') === 'frames';
  const paletteSlots = PORTFOLIO_TOOLS_COLOR_SLOT_OPTIONS.filter((slot) => {
    if (
      slot.value === 'title' ||
      slot.value === 'tileBackground' ||
      slot.value === 'label' ||
      slot.value === 'sectionBackground'
    ) {
      return true;
    }
    if (!isRichToolsDesign && !isLevelIndicatorDesign && !isBrandRowFrames) return false;
    if (isLevelIndicatorDesign) {
      return (
        slot.value === 'cardBackground' ||
        slot.value === 'cardBorder' ||
        slot.value === 'levelAccent'
      );
    }
    if (isBrandRowFrames) {
      return slot.value === 'cardBackground' || slot.value === 'cardBorder';
    }
    return (
      slot.value === 'description' ||
      slot.value === 'cardBackground' ||
      slot.value === 'cardBorder' ||
      slot.value === 'chipBackground' ||
      slot.value === 'chipText' ||
      slot.value === 'levelAccent'
    );
  });

  const designOptions = designOptionsProp
    ? designOptionsProp
    : designOptionsFilter
      ? PORTFOLIO_TOOLS_DESIGN_OPTIONS.filter((item) => designOptionsFilter(item.value))
      : PORTFOLIO_TOOLS_DESIGN_OPTIONS;
  const titlePresetOptions = titlePresetOptionsProp ?? PORTFOLIO_TOOLS_TITLE_PRESET_OPTIONS;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {SUBSECTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onSubSectionChange?.(item.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              current === item.value
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {current === 'general' ? (
        <div className="space-y-4">
          <Toggle label={sectionToggleLabel} checked={tools.enabled} onChange={(enabled) => onChange({ enabled })} />
          {designOptions.length > 1 ? (
          <>
          <SelectField
            label="Design"
            value={tools.design}
            options={designOptions.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            onChange={(design) => {
              if (design === 'brand-float' && tools.iconBackgroundOptIn !== false) {
                onChange({ design, iconBackgroundEnabled: true });
                return;
              }
              if (design === 'level-bento-categories') {
                onChange({
                  ...toolsLevelBentoCategoriesDesignDefaults(),
                  design,
                });
                return;
              }
              if (design === 'level-star-cards') {
                onChange({
                  ...toolsLevelStarCardsDesignDefaults(),
                  design,
                });
                return;
              }
              if (design === 'level-svg-rings') {
                onChange({
                  ...toolsLevelSvgRingsDesignDefaults(),
                  design,
                });
                return;
              }
              onChange({ design });
            }}
          />
          <p className="text-sm text-neutral-500">
            {designOptions.find((item) => item.value === tools.design)?.description}
          </p>
          </>
          ) : null}
          <SelectField
            label="Titre"
            value={tools.titlePreset}
            options={titlePresetOptions.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            onChange={(titlePreset: PortfolioToolsTitlePreset) => onChange({ titlePreset })}
          />
          {tools.titlePreset === 'custom' ? (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                Titre personnalisé
              </span>
              <input
                type="text"
                value={tools.titleCustom}
                onChange={(event) => onChange({ titleCustom: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
                placeholder="Workflow & Tools"
              />
            </label>
          ) : null}
          <SelectField
            label="Alignement du titre"
            value={tools.headerAlignment}
            options={PORTFOLIO_TOOLS_HEADER_ALIGNMENT_OPTIONS}
            onChange={(headerAlignment) => onChange({ headerAlignment })}
          />
          <SelectField
            label="Sous-titre"
            value={tools.subtitlePreset ?? 'none'}
            options={PORTFOLIO_TOOLS_SUBTITLE_PRESET_OPTIONS}
            onChange={(subtitlePreset: PortfolioToolsSubtitlePreset) => onChange({ subtitlePreset })}
          />
          {tools.subtitlePreset === 'custom' ? (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                Texte du sous-titre
              </span>
              <textarea
                rows={3}
                value={tools.subtitleCustom || tools.subtitle}
                onChange={(event) =>
                  onChange({ subtitleCustom: event.target.value, subtitle: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
                placeholder="Outils et technologies que j'utilise au quotidien."
              />
            </label>
          ) : null}
          <SelectField
            label="Taille des logos"
              value={tools.tileSize}
              options={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS}
            onChange={(tileSize: PortfolioToolsTileSize) => onChange({ tileSize })}
          />
          {isLevelIndicatorDesign ? (
            <>
              {tools.design !== 'level-star-cards' ? (
                <SelectField
                  label="Vertical spacing"
                  value={tools.levelProgressRowGap ?? 'large'}
                  options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS}
                  onChange={(levelProgressRowGap: PortfolioToolsLevelProgressRowGap) =>
                    onChange({ levelProgressRowGap })
                  }
                />
              ) : null}
              {tools.design !== 'level-progress-rows' &&
              tools.design !== 'level-category-rows' ? (
                <Toggle
                  label="Full width"
                  checked={resolveToolsLevelIndicatorFullWidth(tools)}
                  onChange={(levelIndicatorFullWidth) =>
                    onChange({
                      levelIndicatorFullWidth,
                      levelTableFullWidth: levelIndicatorFullWidth,
                    })
                  }
                />
              ) : null}
              <SelectField
                label="Row order"
                value={tools.levelTableGroupBy ?? 'category'}
                options={PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(levelTableGroupBy: PortfolioToolsLevelTableGroupBy) =>
                  onChange({ levelTableGroupBy })
                }
              />
              <p className="text-sm text-neutral-500">
                {
                  PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS.find(
                    (item) => item.value === (tools.levelTableGroupBy ?? 'category')
                  )?.description
                }
              </p>
              <Toggle
                label="Category filter"
                checked={resolveToolsLevelIndicatorShowCategoryFilter(tools)}
                onChange={(levelIndicatorShowCategoryFilter) =>
                  onChange({
                    levelIndicatorShowCategoryFilter,
                    levelTableShowCategoryFilter: levelIndicatorShowCategoryFilter,
                  })
                }
              />
              <p className="text-sm text-neutral-500">
                Shows category chips above the list so visitors can filter items (All + each category).
              </p>
              <SelectField
                label="Level display"
                value={
                  tools.levelIndicatorDisplayStyle ??
                  (tools.design === 'level-bento-categories' ? 'progress-bar' : 'text')
                }
                options={PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(levelIndicatorDisplayStyle: PortfolioToolsLevelIndicatorDisplayStyle) =>
                  onChange({ levelIndicatorDisplayStyle })
                }
              />
              <p className="text-sm text-neutral-500">
                {
                  PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS.find(
                    (item) =>
                      item.value ===
                      (tools.levelIndicatorDisplayStyle ??
                        (tools.design === 'level-bento-categories' ? 'progress-bar' : 'text'))
                  )?.description
                }
              </p>
            </>
          ) : null}
          {toolsLevelIndicatorDesignSupportsCardFrame(tools.design) ? (
            <>
              <SelectField
                label="Card frame"
                value={tools.levelIndicatorCardStyle ?? 'framed'}
                options={PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(levelIndicatorCardStyle: PortfolioToolsLevelIndicatorCardStyle) =>
                  onChange({ levelIndicatorCardStyle })
                }
              />
              <p className="text-sm text-neutral-500">
                {
                  PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS.find(
                    (item) => item.value === (tools.levelIndicatorCardStyle ?? 'framed')
                  )?.description
                }
              </p>
            </>
          ) : null}
          {tools.design === 'level-progress-rows' ||
          tools.design === 'level-category-rows' ||
          tools.design === 'level-table-rows' ? (
            <>
              <SelectField
                label="Alignement de la liste"
                value={tools.levelProgressContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(levelProgressContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ levelProgressContentAlignment })
                }
              />
              {tools.design === 'level-table-rows' ? (
                <p className="text-sm text-neutral-500">
                  Single-column table — no header row and no experience column.
                </p>
              ) : (
                <SelectField
                  label="Colonnes (écran large)"
                  value={String(tools.levelProgressColumnsPerRow ?? 1) as '1' | '2'}
                  options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_COLUMNS_OPTIONS}
                  onChange={(value) =>
                    onChange({
                      levelProgressColumnsPerRow: value === '2' ? 2 : 1,
                    })
                  }
                />
              )}
              {tools.design === 'level-progress-rows' ||
              tools.design === 'level-category-rows' ? (
                <Toggle
                  label="Pleine largeur"
                  checked={resolveToolsLevelIndicatorFullWidth(tools)}
                  onChange={(levelIndicatorFullWidth) =>
                    onChange({
                      levelIndicatorFullWidth,
                      levelTableFullWidth: levelIndicatorFullWidth,
                    })
                  }
                />
              ) : null}
            </>
          ) : tools.design === 'level-bento-categories' ? (
            <>
              <SelectField
                label="Card spacing"
                value={tools.cardGap ?? 'medium'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
              <SelectField
                label="Grid layout"
                value={tools.levelBentoGridMode ?? 'equal'}
                options={PORTFOLIO_TOOLS_LEVEL_BENTO_GRID_MODE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(levelBentoGridMode: PortfolioToolsLevelBentoGridMode) =>
                  onChange({ levelBentoGridMode })
                }
              />
              <p className="text-sm text-neutral-500">
                {
                  PORTFOLIO_TOOLS_LEVEL_BENTO_GRID_MODE_OPTIONS.find(
                    (item) => item.value === (tools.levelBentoGridMode ?? 'equal')
                  )?.description
                }
              </p>
              <SelectField
                label="Content alignment"
                value={tools.brandCardsContentAlignment ?? 'left'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
            </>
          ) : !isLevelIndicatorDesign ? (
            <SelectField
              label={
                tools.design === 'brand-index' || tools.design === 'brand-directory'
                  ? 'Espacement entre les lignes'
                  : tools.design === 'brand-row'
                    ? (tools.brandRowCellStyle ?? 'dividers') === 'frames'
                      ? 'Espacement entre les cadres'
                      : (tools.brandRowCellStyle ?? 'dividers') === 'none'
                        ? 'Espacement entre les cellules'
                        : 'Espacement des cellules'
                    : tools.design === 'brand-float'
                      ? 'Espacement entre les tuiles'
                      : 'Écart entre les cartes'
              }
              value={tools.cardGap ?? 'tight'}
              options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
              onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
            />
          ) : null}
          {tools.design === 'level-stat-bars' ||
          tools.design === 'level-progress-rows' ||
          tools.design === 'level-category-rows' ||
          (tools.design === 'brand-directory' &&
            (tools.brandDirectoryLevelStyle ?? 'tag') === 'stat') ? (
            <>
              <SelectField
                label="Bar style"
                value={tools.levelBarStyle ?? 'rectangle'}
                options={PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(levelBarStyle: PortfolioToolsLevelBarStyle) => onChange({ levelBarStyle })}
              />
              <p className="text-sm text-neutral-500">
                {
                  PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS.find(
                    (item) => item.value === (tools.levelBarStyle ?? 'rectangle')
                  )?.description
                }
              </p>
            </>
          ) : null}
          {tools.design === 'level-stat-bars' ||
          tools.design === 'level-progress-rows' ||
          tools.design === 'level-category-rows' ||
    tools.design === 'level-circular-cards' ||
    tools.design === 'level-star-cards' ||
    tools.design === 'level-svg-rings' ||
          (tools.design === 'brand-directory' &&
            (tools.brandDirectoryLevelStyle ?? 'tag') === 'stat') ? (
            <>
              <SelectField
                label="Bar & % size"
                value={tools.levelBarSize ?? 'small'}
                options={PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(levelBarSize: PortfolioToolsLevelBarSize) => onChange({ levelBarSize })}
              />
              <p className="text-sm text-neutral-500">
                {
                  PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.find(
                    (item) => item.value === (tools.levelBarSize ?? 'small')
                  )?.description
                }
              </p>
            </>
          ) : null}
          {tools.design === 'brand-directory' ? (
            <>
              <SelectField
                label="Affichage du niveau"
                value={tools.brandDirectoryLevelStyle ?? 'percentage'}
                options={PORTFOLIO_TOOLS_BRAND_DIRECTORY_LEVEL_STYLE_OPTIONS}
                onChange={(brandDirectoryLevelStyle: PortfolioToolsBrandDirectoryLevelStyle) =>
                  onChange({ brandDirectoryLevelStyle })
                }
              />
              <SelectField
                label="Colonnes (écran large)"
                value={String(tools.brandDirectoryColumnsPerRow ?? 1) as '1' | '2' | '3'}
                options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS}
                onChange={(value) =>
                  onChange({
                    brandDirectoryColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                  })
                }
              />
              <SelectField
                label="Alignement du contenu"
                value={tools.brandDirectoryContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandDirectoryContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandDirectoryContentAlignment })
                }
              />
              <Toggle
                label="Pleine largeur"
                checked={tools.brandDirectoryFullWidth === true}
                onChange={(brandDirectoryFullWidth) => onChange({ brandDirectoryFullWidth })}
              />
            </>
          ) : null}
          {tools.design === 'brand-cards' ? (
            <>
              <SelectField
                label="Emplacement de l'icône"
                value={tools.brandCardsIconPlacement ?? 'top'}
                options={PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS}
                onChange={(brandCardsIconPlacement: PortfolioToolsBrandCardsIconPlacement) =>
                  onChange({ brandCardsIconPlacement })
                }
              />
              <SelectField
                label="Colonnes (écran large)"
                value={String(tools.brandCardsColumnsPerRow ?? 1) as '1' | '2' | '3'}
                options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS}
                onChange={(value) =>
                  onChange({
                    brandCardsColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                  })
                }
              />
              <SelectField
                label="Alignement du contenu"
                value={tools.brandCardsContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
              <Toggle
                label="Pleine largeur"
                checked={tools.brandCardsFullWidth === true}
                onChange={(brandCardsFullWidth) => onChange({ brandCardsFullWidth })}
              />
            </>
          ) : null}
          {tools.design === 'level-star-cards' ? (
            <>
              <SelectField
                label="Card spacing"
                value={tools.cardGap ?? 'medium'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
              <p className="text-sm text-neutral-500">
                4 cartes par ligne sur grand écran — pleine largeur.
              </p>
              <SelectField
                label="Alignement du contenu"
                value={tools.brandCardsContentAlignment ?? 'left'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
            </>
          ) : tools.design === 'level-circular-cards' ||
          tools.design === 'level-svg-rings' ? (
            <>
              <SelectField
                label="Colonnes (écran large)"
                value={String(tools.brandCardsColumnsPerRow ?? 3) as '1' | '2' | '3'}
                options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS.filter(
                  (item) => item.value !== '4'
                )}
                onChange={(value) =>
                  onChange({
                    brandCardsColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                  })
                }
              />
              <SelectField
                label="Alignement du contenu"
                value={tools.brandCardsContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
            </>
          ) : null}
          {tools.design === 'brand-index' ? (
            <>
              <SelectField
                label="Alignement du contenu"
                value={tools.brandIndexContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandIndexContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandIndexContentAlignment })
                }
              />
              <Toggle
                label="Pleine largeur (1 par ligne)"
                checked={tools.brandIndexFullWidth !== false}
                onChange={(brandIndexFullWidth) => onChange({ brandIndexFullWidth })}
              />
              <Toggle
                label="Filtre par catégorie"
                checked={resolveToolsLevelIndicatorShowCategoryFilter(tools)}
                onChange={(levelIndicatorShowCategoryFilter) =>
                  onChange({
                    levelIndicatorShowCategoryFilter,
                    levelTableShowCategoryFilter: levelIndicatorShowCategoryFilter,
                  })
                }
              />
              <p className="text-sm text-neutral-500">
                Affiche des pastilles au-dessus de la liste pour filtrer par catégorie (Tout + chaque
                catégorie renseignée sur les éléments Stack).
              </p>
            </>
          ) : null}
          {tools.design === 'brand-row' ? (
            <>
              <SelectField
                label="Style des cellules"
                value={tools.brandRowCellStyle ?? 'dividers'}
                options={PORTFOLIO_TOOLS_BRAND_ROW_CELL_STYLE_OPTIONS}
                onChange={(brandRowCellStyle: PortfolioToolsBrandRowCellStyle) =>
                  onChange({ brandRowCellStyle })
                }
              />
              <SelectField
                label="Colonnes (écran large)"
                value={String(tools.brandRowColumnsPerRow ?? 3) as '1' | '2' | '3'}
                options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS}
                onChange={(value) =>
                  onChange({
                    brandRowColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                  })
                }
              />
              <SelectField
                label="Alignement du contenu"
                value={tools.brandRowContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandRowContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandRowContentAlignment })
                }
              />
            </>
          ) : null}
          {tools.design === 'brand-float' ? (
            <>
              <SelectField
                label="Style de carte"
                value={tools.brandFloatCardStyle ?? 'framed'}
                options={PORTFOLIO_TOOLS_BRAND_FLOAT_CARD_STYLE_OPTIONS}
                onChange={(brandFloatCardStyle: PortfolioToolsBrandFloatCardStyle) =>
                  onChange({ brandFloatCardStyle })
                }
              />
              <SelectField
                label="Mode de grille"
                value={tools.brandFloatGridMode ?? 'fluid'}
                options={PORTFOLIO_TOOLS_BRAND_FLOAT_GRID_MODE_OPTIONS}
                onChange={(brandFloatGridMode: PortfolioToolsBrandFloatGridMode) =>
                  onChange({ brandFloatGridMode })
                }
              />
              {(tools.brandFloatGridMode ?? 'fluid') === 'fluid' ? (
                <SelectField
                  label="Densité des tuiles"
                  value={tools.brandFloatTileDensity ?? 'comfortable'}
                  options={PORTFOLIO_TOOLS_BRAND_FLOAT_TILE_DENSITY_OPTIONS}
                  onChange={(brandFloatTileDensity: PortfolioToolsBrandFloatTileDensity) =>
                    onChange({ brandFloatTileDensity })
                  }
                />
              ) : (
                <SelectField
                  label="Colonnes (écran large)"
                  value={String(tools.brandFloatColumnsPerRow ?? 3) as '2' | '3' | '4'}
                  options={PORTFOLIO_TOOLS_BRAND_FLOAT_COLUMNS_OPTIONS}
                  onChange={(value) =>
                    onChange({
                      brandFloatColumnsPerRow: value === '4' ? 4 : value === '2' ? 2 : 3,
                    })
                  }
                />
              )}
              <SelectField
                label="Alignement du contenu"
                value={tools.brandFloatContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandFloatContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandFloatContentAlignment })
                }
              />
            </>
          ) : null}
          {tools.design === 'workflow-rail' ? (
            <SelectField
              label="Alignement du contenu"
              value={tools.workflowRailContentAlignment ?? 'center'}
              options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
              onChange={(workflowRailContentAlignment: PortfolioToolsContentAlignment) =>
                onChange({ workflowRailContentAlignment })
              }
            />
          ) : null}
          <Toggle
            label={
              isLevelIndicatorDesign
                ? 'Afficher le nom'
                : isRichToolsDesign
                  ? 'Afficher le nom'
                  : 'Afficher le nom sous le logo'
            }
            checked={tools.showLabels !== false}
            onChange={(showLabels) => onChange({ showLabels })}
          />
          <Toggle
            label="Afficher le fond de l'icône"
            checked={resolveToolsIconBackgroundEnabled(tools)}
            onChange={(iconBackgroundEnabled) =>
              onChange({ iconBackgroundEnabled, iconBackgroundOptIn: true })
            }
          />
          <Toggle
            label="Logos en noir & blanc"
            checked={tools.logosGrayscale === true}
            onChange={(logosGrayscale) => onChange({ logosGrayscale })}
          />
          {isRichToolsDesign ? (
            <>
              <Toggle
                label="Afficher la description"
                checked={tools.showDescription !== false}
                onChange={(showDescription) => onChange({ showDescription })}
              />
              <Toggle
                label="Afficher les use cases"
                checked={tools.showUseCases !== false}
                onChange={(showUseCases) => onChange({ showUseCases })}
              />
              {tools.design !== 'brand-index' ? (
                <Toggle
                  label="Afficher le niveau"
                  checked={resolveToolsShowLevel(tools)}
                  onChange={(showLevel) => onChange({ showLevel, showLevelOptIn: showLevel })}
                />
              ) : null}
            </>
          ) : isLevelIndicatorDesign ? (
            <Toggle
              label="Afficher l'indicateur de niveau"
              checked={resolveToolsShowLevel(tools)}
              onChange={(showLevel) => onChange({ showLevel, showLevelOptIn: showLevel })}
            />
          ) : null}
          <p className="rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900">
            {tools.design === 'level-stat-bars'
              ? 'Level stat bars : grille minimaliste — logo, nom, barre à 4 segments (sans texte Beginner/Expert).'
              : tools.design === 'level-progress-rows'
                ? 'Level progress rows : liste éditoriale — logo, nom, % et barre (couleur logo). Réglage « Espacement entre les lignes » ci-dessus.'
                : tools.design === 'level-category-rows'
                  ? 'Level category rows : logo, nom + catégorie (FRONTEND, BACKEND…), barre fine et % à droite. Renseigne la catégorie sur chaque élément Stack.'
                  : tools.design === 'level-table-rows'
                    ? 'Level table rows: headerless table — logo + name, category, colored level label, and % (no experience column). Row order by category or level; optional full width.'
                    : tools.design === 'level-circular-cards'
                  ? 'Level circular cards : grille de cartes — anneau circulaire autour du logo (sans carré intérieur), nom et % en dessous.'
                  : tools.design === 'level-star-cards'
                    ? 'Level star cards : cartes horizontales — nom à gauche, notation 5 étoiles à droite (sans logos).'
                  : tools.design === 'level-svg-rings'
                    ? 'Level SVG rings : grille de cartes — anneau SVG de progression avec le nom de l\'outil centré à l\'intérieur (sans logo, sans %).'
                  : tools.design === 'level-bento-categories'
                    ? 'Level bento categories: one card per skill category in a bento grid — logo, name, and colored level label per row. Assign a category on each stack item.'
                  : tools.design === 'brand-directory'
                ? 'Brand directory : lignes éditoriales (logo · détails · niveau). Style du niveau : tag, pourcentage, statistique ou points.'
                : tools.design === 'brand-index'
                  ? 'Brand index : lignes type portfolio index — logo à gauche, nom, catégorie au centre (alignée à gauche), description à droite, séparateurs fins. Filtre par catégorie optionnel. « Pleine largeur » étend la liste sur toute la section (désactivé = largeur max actuelle).'
                  : tools.design === 'brand-row'
                    ? (tools.brandRowCellStyle ?? 'dividers') === 'frames'
                      ? 'Brand row — cadres : chaque outil dans un cadre avec fond et bordure (sans lignes de séparation partagées).'
                      : (tools.brandRowCellStyle ?? 'dividers') === 'none'
                        ? 'Brand row — sans traits : grille logo + nom, aucune ligne ni cadre.'
                        : 'Brand row — séparateurs : logo + nom, trait du haut et séparateurs verticaux entre colonnes.'
                    : tools.design === 'brand-float'
                      ? (tools.brandFloatCardStyle ?? 'framed') === 'plain'
                        ? 'Brand float : tuiles ouvertes sans cadre — logo, nom, description (tooltip au survol si tronquée).'
                        : 'Brand float : grille fluide Framer / Landbook — cartes avec cadre, hover lift & glow, description et tags optionnels.'
                    : tools.design === 'brand-cards'
                  ? 'Brand cards : cartes avec logo au-dessus ou à gauche, description, use cases et niveau.'
                  : 'Workflow rail : logos en rangée. Pas de sous-titre. Les outils viennent du profil.'}
          </p>
        </div>
      ) : null}

      {current === 'palette' ? (
        <div className="space-y-4">
          <SectionHeroPaletteToggle
            enabled={tools.useHeroPalette !== false}
            onChange={(useHeroPalette) =>
              onChange(
                (useHeroPalette
                  ? { useHeroPalette, ...applyToolsPaletteToSettings(tools) }
                  : { useHeroPalette }) as Partial<PortfolioToolsSectionSettings>
              )
            }
          />
          {tools.useHeroPalette !== false ? (
            paletteSlots.map((slot) => (
              <label
                key={slot.value}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3"
              >
                <span className="text-sm font-semibold">{slot.label}</span>
                <span
                  className="h-5 w-5 rounded-full border"
                  style={{ backgroundColor: resolveHeroPaletteColor(palette, bindings[slot.value]) }}
                />
                <select
                  value={bindings[slot.value]}
                  onChange={(event) =>
                    onChange(
                      patchToolsColorBinding(
                        tools,
                        slot.value as ToolsColorSlot,
                        event.target.value as HeroPaletteTokenId
                      ) as Partial<PortfolioToolsSectionSettings>
                    )
                  }
                  className="col-span-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                >
                  {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                    <option key={token.value} value={token.value}>
                      {token.label}
                    </option>
                  ))}
                </select>
              </label>
            ))
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField label="Titre" value={tools.titleColor} onChange={(titleColor) => onChange({ titleColor })} />
              <ColorField
                label="Sous-titre"
                value={tools.subtitleColor}
                onChange={(subtitleColor) => onChange({ subtitleColor })}
              />
              <ColorField
                label="Fond des tuiles"
                value={tools.tileBackgroundColor}
                onChange={(tileBackgroundColor) => onChange({ tileBackgroundColor })}
              />
              <ColorField label="Noms" value={tools.labelColor} onChange={(labelColor) => onChange({ labelColor })} />
              {isRichToolsDesign ? (
                <>
                  <ColorField
                    label="Description"
                    value={tools.descriptionColor}
                    onChange={(descriptionColor) => onChange({ descriptionColor })}
                  />
                  <ColorField
                    label="Fond cartes"
                    value={tools.cardBackgroundColor}
                    onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
                  />
                  <ColorField
                    label="Bordure / séparateurs"
                    value={tools.cardBorderColor}
                    onChange={(cardBorderColor) => onChange({ cardBorderColor })}
                  />
                  <ColorField
                    label="Fond use cases"
                    value={tools.chipBackgroundColor}
                    onChange={(chipBackgroundColor) => onChange({ chipBackgroundColor })}
                  />
                  <ColorField
                    label="Texte use cases"
                    value={tools.chipTextColor}
                    onChange={(chipTextColor) => onChange({ chipTextColor })}
                  />
                  <ColorField
                    label="Badge niveau"
                    value={tools.levelAccentColor}
                    onChange={(levelAccentColor) => onChange({ levelAccentColor })}
                  />
                </>
              ) : null}
              {isBrandRowFrames ? (
                <>
                  <ColorField
                    label="Fond cadres"
                    value={tools.cardBackgroundColor}
                    onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
                  />
                  <ColorField
                    label="Bordure cadres"
                    value={tools.cardBorderColor}
                    onChange={(cardBorderColor) => onChange({ cardBorderColor })}
                  />
                </>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {current === 'background' ? (
        <SectionBackgroundSettingsFields settings={tools} onChange={onChange} />
      ) : null}
    </div>
  );
}
