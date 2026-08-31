'use client';

import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';
import {
  PORTFOLIO_STACK_ASIDE_TITLE_PLACEMENT_OPTIONS,
  PORTFOLIO_STACK_DESIGN_OPTIONS,
  PORTFOLIO_STACK_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_STACK_SUBTITLE_SIZE_OPTIONS,
  PORTFOLIO_STACK_TAGS_SIZE_OPTIONS,
  PORTFOLIO_STACK_TITLE_PRESET_OPTIONS,
  PORTFOLIO_STACK_TITLE_SIZE_OPTIONS,
  stackBrandCardsDesignDefaults,
  stackBrandIndexDesignDefaults,
  stackBrandRowDesignDefaults,
  stackLevelBentoCategoriesDesignDefaults,
  stackLevelCategoryRowsDesignDefaults,
  stackLevelCircularCardsDesignDefaults,
  stackLevelIndicatorDesignSupportsCardFrame,
  stackLevelProgressRowsDesignDefaults,
  stackLevelStarCardsDesignDefaults,
  stackLevelSvgRingsDesignDefaults,
  stackLevelTableRowsDesignDefaults,
  stackSectionLayoutIsAside,
  resolveStackIconBackgroundEnabled,
  resolveStackShowLevel,
  DEFAULT_STACK_TITLE,
  type PortfolioStackAsideTitlePlacement,
  type PortfolioStackDesign,
  type PortfolioStackSectionLayout,
  type PortfolioStackSectionSettings,
  type PortfolioStackSubtitleSize,
  type PortfolioStackTagsSize,
  type PortfolioStackTitleSize,
} from '@/components/portfolio/portfolio-stack-settings';
import {
  PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_ROW_CELL_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_CARD_GAP_OPTIONS,
  PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS,
  PORTFOLIO_TOOLS_HEADER_ALIGNMENT_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_BENTO_GRID_MODE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_PROGRESS_COLUMNS_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS,
  PORTFOLIO_TOOLS_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS,
  resolveToolsLevelIndicatorFullWidth,
  resolveToolsLevelIndicatorShowCategoryFilter,
  type PortfolioToolsBrandCardsIconPlacement,
  type PortfolioToolsBrandRowCellStyle,
  type PortfolioToolsCardGap,
  type PortfolioToolsContentAlignment,
  type PortfolioToolsLevelBarSize,
  type PortfolioToolsLevelBarStyle,
  type PortfolioToolsLevelBentoGridMode,
  type PortfolioToolsLevelIndicatorCardStyle,
  type PortfolioToolsLevelIndicatorDisplayStyle,
  type PortfolioToolsLevelProgressRowGap,
  type PortfolioToolsLevelTableGroupBy,
  type PortfolioToolsSubtitlePreset,
  type PortfolioToolsTileSize,
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

export type StackSubSection = 'general' | 'palette' | 'background';

const SUBSECTIONS: { value: StackSubSection; label: string }[] = [
  { value: 'general', label: 'Général' },
  { value: 'palette', label: 'Palette' },
  { value: 'background', label: 'Arrière-plan' },
];

export function normalizeStackSubSection(value: string | undefined): StackSubSection {
  return SUBSECTIONS.some((item) => item.value === value) ? (value as StackSubSection) : 'general';
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

function handleStackDesignChange(
  stack: PortfolioStackSectionSettings,
  design: PortfolioStackDesign,
  onChange: (patch: Partial<PortfolioStackSectionSettings>) => void
) {
  if (design === 'brand-cards') {
    onChange(stackBrandCardsDesignDefaults());
    return;
  }
  if (design === 'brand-index') {
    onChange(stackBrandIndexDesignDefaults());
    return;
  }
  if (design === 'brand-row') {
    onChange(stackBrandRowDesignDefaults());
    return;
  }
  if (design === 'level-progress-rows') {
    onChange(stackLevelProgressRowsDesignDefaults());
    return;
  }
  if (design === 'level-category-rows') {
    onChange(stackLevelCategoryRowsDesignDefaults());
    return;
  }
  if (design === 'level-table-rows') {
    onChange(stackLevelTableRowsDesignDefaults());
    return;
  }
  if (design === 'level-circular-cards') {
    onChange(stackLevelCircularCardsDesignDefaults());
    return;
  }
  if (design === 'level-star-cards') {
    onChange(stackLevelStarCardsDesignDefaults());
    return;
  }
  if (design === 'level-svg-rings') {
    onChange(stackLevelSvgRingsDesignDefaults());
    return;
  }
  if (design === 'level-bento-categories') {
    onChange(stackLevelBentoCategoriesDesignDefaults());
    return;
  }
  if (design === 'stack-tags') {
    onChange({
      design,
      headerAlignment: 'center',
      contentAlignment: 'center',
      showDescription: false,
      showUseCases: false,
      showCategory: false,
      ...(stack.titlePreset !== 'custom'
        ? { titlePreset: 'core-stack', title: DEFAULT_STACK_TITLE }
        : {}),
    });
    return;
  }
  onChange({ design });
}

type StackSettingsPanelProps = {
  stack: PortfolioStackSectionSettings;
  onChange: (patch: Partial<PortfolioStackSectionSettings>) => void;
  subSection?: StackSubSection;
  onSubSectionChange?: (value: StackSubSection) => void;
};

export function StackSettingsPanel({
  stack,
  onChange,
  subSection = 'general',
  onSubSectionChange,
}: StackSettingsPanelProps) {
  const palette = mergeToolsPalette(DEFAULT_TOOLS_PALETTE, stack.toolsPalette);
  const bindings = mergeToolsColorBindings(DEFAULT_TOOLS_COLOR_BINDINGS, stack.toolsColorBindings);
  const current = normalizeStackSubSection(subSection);
  const sectionLayout = stack.sectionLayout ?? 'stacked';
  const stackAside = stackSectionLayoutIsAside(sectionLayout);
  const isRichStackDesign = stack.design === 'brand-cards' || stack.design === 'brand-index';
  const isLevelIndicatorDesign =
    stack.design === 'level-progress-rows' ||
    stack.design === 'level-category-rows' ||
    stack.design === 'level-table-rows' ||
    stack.design === 'level-circular-cards' ||
    stack.design === 'level-star-cards' ||
    stack.design === 'level-svg-rings' ||
    stack.design === 'level-bento-categories';
  const isBrandRowFrames =
    stack.design === 'brand-row' && (stack.brandRowCellStyle ?? 'dividers') === 'frames';
  const paletteSlots = PORTFOLIO_TOOLS_COLOR_SLOT_OPTIONS.filter((slot) => {
    if (
      slot.value === 'title' ||
      slot.value === 'tileBackground' ||
      slot.value === 'label' ||
      slot.value === 'sectionBackground'
    ) {
      return true;
    }
    if (!isRichStackDesign && !isLevelIndicatorDesign && !isBrandRowFrames) return false;
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
          <Toggle
            label="Afficher la section Stack"
            checked={stack.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          {PORTFOLIO_STACK_DESIGN_OPTIONS.length > 1 ? (
            <>
              <SelectField
                label="Design"
                value={stack.design}
                options={PORTFOLIO_STACK_DESIGN_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(design) => handleStackDesignChange(stack, design, onChange)}
              />
              <p className="text-sm text-neutral-500">
                {PORTFOLIO_STACK_DESIGN_OPTIONS.find((item) => item.value === stack.design)?.description}
              </p>
            </>
          ) : null}
          <SelectField
            label="Titre"
            value={stack.titlePreset}
            options={PORTFOLIO_STACK_TITLE_PRESET_OPTIONS.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            onChange={(titlePreset) => onChange({ titlePreset })}
          />
          {stack.titlePreset === 'custom' ? (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                Titre personnalisé
              </span>
              <input
                type="text"
                value={stack.titleCustom}
                onChange={(event) => onChange({ titleCustom: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
                placeholder="Core Stack"
              />
            </label>
          ) : null}
          {stackAside ? null : (
            <SelectField
              label="Alignement du titre"
              value={stack.headerAlignment}
              options={PORTFOLIO_TOOLS_HEADER_ALIGNMENT_OPTIONS}
              onChange={(headerAlignment) => onChange({ headerAlignment })}
            />
          )}
          <SelectField
            label="Disposition titre / liste"
            value={sectionLayout}
            options={PORTFOLIO_STACK_SECTION_LAYOUT_OPTIONS}
            onChange={(layout: PortfolioStackSectionLayout) =>
              onChange({
                sectionLayout: layout,
                ...(stackSectionLayoutIsAside(layout)
                  ? {
                      levelProgressColumnsPerRow: 1,
                      brandCardsColumnsPerRow: 1,
                      brandRowColumnsPerRow: 1,
                    }
                  : {}),
              })
            }
          />
          {stackAside ? (
            <>
              <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                Écran coupé en deux : le titre occupe une moitié (
                {sectionLayout === 'aside-right' ? 'droite' : 'gauche'}), la liste l’autre. Sur grand
                écran uniquement (empilé sur mobile). Une colonne forcée pour la liste.
              </p>
              <SelectField
                label="Alignement vertical du titre"
                value={stack.asideTitlePlacement ?? 'center'}
                options={PORTFOLIO_STACK_ASIDE_TITLE_PLACEMENT_OPTIONS}
                onChange={(asideTitlePlacement: PortfolioStackAsideTitlePlacement) =>
                  onChange({ asideTitlePlacement })
                }
              />
              <p className="text-sm text-neutral-500">
                {
                  PORTFOLIO_STACK_ASIDE_TITLE_PLACEMENT_OPTIONS.find(
                    (item) => item.value === (stack.asideTitlePlacement ?? 'center')
                  )?.description
                }
              </p>
              <Toggle
                label="Titre sticky au scroll"
                checked={stack.asideTitleSticky !== false}
                onChange={(asideTitleSticky) => onChange({ asideTitleSticky })}
              />
              {stack.asideTitleSticky !== false ? (
                <p className="text-sm text-neutral-500">
                  Le titre reste fixe dans sa moitié pendant le scroll de la liste Stack, jusqu’à la
                  fin de la section.
                </p>
              ) : null}
            </>
          ) : null}
          <SelectField
            label="Taille du titre"
            value={stack.titleSize ?? 'md'}
            options={PORTFOLIO_STACK_TITLE_SIZE_OPTIONS.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            onChange={(titleSize: PortfolioStackTitleSize) => onChange({ titleSize })}
          />
          <p className="text-sm text-neutral-500">
            {
              PORTFOLIO_STACK_TITLE_SIZE_OPTIONS.find((item) => item.value === (stack.titleSize ?? 'md'))
                ?.description
            }
          </p>
          <SelectField
            label="Sous-titre"
            value={stack.subtitlePreset ?? 'none'}
            options={PORTFOLIO_TOOLS_SUBTITLE_PRESET_OPTIONS}
            onChange={(subtitlePreset: PortfolioToolsSubtitlePreset) => onChange({ subtitlePreset })}
          />
          {stack.subtitlePreset === 'custom' ? (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                Texte du sous-titre
              </span>
              <textarea
                rows={3}
                value={stack.subtitleCustom || stack.subtitle}
                onChange={(event) =>
                  onChange({ subtitleCustom: event.target.value, subtitle: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
                placeholder="Languages, frameworks, and platforms I use to ship reliable products."
              />
            </label>
          ) : null}
          <SelectField
            label="Taille du sous-titre"
            value={stack.subtitleSize ?? 'md'}
            options={PORTFOLIO_STACK_SUBTITLE_SIZE_OPTIONS.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            onChange={(subtitleSize: PortfolioStackSubtitleSize) => onChange({ subtitleSize })}
          />
          <p className="text-sm text-neutral-500">
            {
              PORTFOLIO_STACK_SUBTITLE_SIZE_OPTIONS.find(
                (item) => item.value === (stack.subtitleSize ?? 'md')
              )?.description
            }
          </p>
          {stack.design === 'stack-tags' ? (
            <SelectField
              label="Alignement des tags"
              value={stack.contentAlignment ?? 'center'}
              options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
              onChange={(contentAlignment: PortfolioToolsContentAlignment) =>
                onChange({ contentAlignment })
              }
            />
          ) : null}
          {stack.design === 'stack-tags' ? (
            <>
              <SelectField
                label="Taille des tags"
                value={stack.stackTagsSize ?? 'medium'}
                options={PORTFOLIO_STACK_TAGS_SIZE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(stackTagsSize: PortfolioStackTagsSize) => onChange({ stackTagsSize })}
              />
              <p className="text-sm text-neutral-500">
                {
                  PORTFOLIO_STACK_TAGS_SIZE_OPTIONS.find(
                    (item) => item.value === (stack.stackTagsSize ?? 'medium')
                  )?.description
                }
              </p>
              <SelectField
                label="Espacement des tags"
                value={stack.cardGap}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
            </>
          ) : (
            <SelectField
              label="Taille des logos"
              value={stack.tileSize}
              options={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS}
              onChange={(tileSize: PortfolioToolsTileSize) => onChange({ tileSize })}
            />
          )}
          {isLevelIndicatorDesign ? (
            <>
              {stack.design !== 'level-star-cards' ? (
                <SelectField
                  label="Vertical spacing"
                  value={stack.levelProgressRowGap ?? 'large'}
                  options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS}
                  onChange={(levelProgressRowGap: PortfolioToolsLevelProgressRowGap) =>
                    onChange({ levelProgressRowGap })
                  }
                />
              ) : null}
              {stack.design !== 'level-progress-rows' && stack.design !== 'level-category-rows' ? (
                <Toggle
                  label="Full width"
                  checked={resolveToolsLevelIndicatorFullWidth(stack)}
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
                value={stack.levelTableGroupBy ?? 'category'}
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
                    (item) => item.value === (stack.levelTableGroupBy ?? 'category')
                  )?.description
                }
              </p>
              <Toggle
                label="Category filter"
                checked={resolveToolsLevelIndicatorShowCategoryFilter(stack)}
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
                  stack.levelIndicatorDisplayStyle ??
                  (stack.design === 'level-bento-categories' ? 'progress-bar' : 'text')
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
                      (stack.levelIndicatorDisplayStyle ??
                        (stack.design === 'level-bento-categories' ? 'progress-bar' : 'text'))
                  )?.description
                }
              </p>
            </>
          ) : null}
          {stackLevelIndicatorDesignSupportsCardFrame(stack.design) ? (
            <>
              <SelectField
                label="Card frame"
                value={stack.levelIndicatorCardStyle ?? 'framed'}
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
                    (item) => item.value === (stack.levelIndicatorCardStyle ?? 'framed')
                  )?.description
                }
              </p>
            </>
          ) : null}
          {stack.design === 'level-progress-rows' ||
          stack.design === 'level-category-rows' ||
          stack.design === 'level-table-rows' ? (
            <>
              <SelectField
                label="Alignement de la liste"
                value={stack.levelProgressContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(levelProgressContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ levelProgressContentAlignment })
                }
              />
              {stack.design === 'level-table-rows' ? (
                <p className="text-sm text-neutral-500">
                  Single-column table — no header row and no experience column.
                </p>
              ) : stackAside ? (
                <p className="text-sm text-neutral-500">
                  Colonnes : 1 par ligne (forcé en disposition titre à gauche / droite).
                </p>
              ) : (
                <SelectField
                  label="Colonnes (écran large)"
                  value={String(stack.levelProgressColumnsPerRow ?? 1) as '1' | '2'}
                  options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_COLUMNS_OPTIONS}
                  onChange={(value) =>
                    onChange({
                      levelProgressColumnsPerRow: value === '2' ? 2 : 1,
                    })
                  }
                />
              )}
              {stack.design === 'level-progress-rows' || stack.design === 'level-category-rows' ? (
                <Toggle
                  label="Pleine largeur"
                  checked={resolveToolsLevelIndicatorFullWidth(stack)}
                  onChange={(levelIndicatorFullWidth) =>
                    onChange({
                      levelIndicatorFullWidth,
                      levelTableFullWidth: levelIndicatorFullWidth,
                    })
                  }
                />
              ) : null}
            </>
          ) : stack.design === 'level-bento-categories' ? (
            <>
              <SelectField
                label="Card spacing"
                value={stack.cardGap ?? 'medium'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
              <SelectField
                label="Grid layout"
                value={stack.levelBentoGridMode ?? 'equal'}
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
                    (item) => item.value === (stack.levelBentoGridMode ?? 'equal')
                  )?.description
                }
              </p>
              <SelectField
                label="Content alignment"
                value={stack.brandCardsContentAlignment ?? 'left'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
            </>
          ) : !isLevelIndicatorDesign ? (
            <SelectField
              label={
                stack.design === 'brand-index'
                  ? 'Espacement entre les lignes'
                  : stack.design === 'brand-row'
                    ? (stack.brandRowCellStyle ?? 'dividers') === 'frames'
                      ? 'Espacement entre les cadres'
                      : (stack.brandRowCellStyle ?? 'dividers') === 'none'
                        ? 'Espacement entre les cellules'
                        : 'Espacement des cellules'
                    : 'Écart entre les cartes'
              }
              value={stack.cardGap ?? 'tight'}
              options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
              onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
            />
          ) : null}
          {stack.design === 'level-progress-rows' || stack.design === 'level-category-rows' ? (
            <>
              <SelectField
                label="Bar style"
                value={stack.levelBarStyle ?? 'rectangle'}
                options={PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(levelBarStyle: PortfolioToolsLevelBarStyle) => onChange({ levelBarStyle })}
              />
              <p className="text-sm text-neutral-500">
                {
                  PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS.find(
                    (item) => item.value === (stack.levelBarStyle ?? 'rectangle')
                  )?.description
                }
              </p>
            </>
          ) : null}
          {stack.design === 'level-progress-rows' ||
          stack.design === 'level-category-rows' ||
          stack.design === 'level-circular-cards' ||
          stack.design === 'level-star-cards' ||
          stack.design === 'level-svg-rings' ? (
            <>
              <SelectField
                label="Bar & % size"
                value={stack.levelBarSize ?? 'small'}
                options={PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onChange={(levelBarSize: PortfolioToolsLevelBarSize) => onChange({ levelBarSize })}
              />
              <p className="text-sm text-neutral-500">
                {
                  PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.find(
                    (item) => item.value === (stack.levelBarSize ?? 'small')
                  )?.description
                }
              </p>
            </>
          ) : null}
          {stack.design === 'brand-cards' ? (
            <>
              <SelectField
                label="Emplacement de l'icône"
                value={stack.brandCardsIconPlacement ?? 'left'}
                options={PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS}
                onChange={(brandCardsIconPlacement: PortfolioToolsBrandCardsIconPlacement) =>
                  onChange({ brandCardsIconPlacement })
                }
              />
              {stackAside ? (
                <p className="text-sm text-neutral-500">
                  Colonnes : 1 par ligne (forcé en disposition titre à gauche / droite).
                </p>
              ) : (
                <SelectField
                  label="Colonnes (écran large)"
                  value={String(stack.brandCardsColumnsPerRow ?? 2) as '1' | '2' | '3'}
                  options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS}
                  onChange={(value) =>
                    onChange({
                      brandCardsColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                    })
                  }
                />
              )}
              <SelectField
                label="Alignement du contenu"
                value={stack.brandCardsContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
              <Toggle
                label="Pleine largeur"
                checked={stack.brandCardsFullWidth === true}
                onChange={(brandCardsFullWidth) => onChange({ brandCardsFullWidth })}
              />
            </>
          ) : null}
          {stack.design === 'level-star-cards' ? (
            <>
              <SelectField
                label="Card spacing"
                value={stack.cardGap ?? 'medium'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
              <p className="text-sm text-neutral-500">
                4 cartes par ligne sur grand écran — pleine largeur.
              </p>
              <SelectField
                label="Alignement du contenu"
                value={stack.brandCardsContentAlignment ?? 'left'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
            </>
          ) : stack.design === 'level-circular-cards' || stack.design === 'level-svg-rings' ? (
            <>
              {stackAside ? (
                <p className="text-sm text-neutral-500">
                  Colonnes : 2 max (forcé en disposition titre à gauche / droite).
                </p>
              ) : (
                <SelectField
                  label="Colonnes (écran large)"
                  value={String(stack.brandCardsColumnsPerRow ?? 3) as '1' | '2' | '3'}
                  options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS.filter(
                    (item) => item.value !== '4'
                  )}
                  onChange={(value) =>
                    onChange({
                      brandCardsColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                    })
                  }
                />
              )}
              <SelectField
                label="Alignement du contenu"
                value={stack.brandCardsContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
            </>
          ) : null}
          {stack.design === 'brand-index' ? (
            <>
              <SelectField
                label="Alignement du contenu"
                value={stack.brandIndexContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandIndexContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandIndexContentAlignment })
                }
              />
              <Toggle
                label="Pleine largeur (1 par ligne)"
                checked={stack.brandIndexFullWidth !== false}
                onChange={(brandIndexFullWidth) => onChange({ brandIndexFullWidth })}
              />
              <Toggle
                label="Filtre par catégorie"
                checked={resolveToolsLevelIndicatorShowCategoryFilter(stack)}
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
          {stack.design === 'brand-row' ? (
            <>
              <SelectField
                label="Style des cellules"
                value={stack.brandRowCellStyle ?? 'dividers'}
                options={PORTFOLIO_TOOLS_BRAND_ROW_CELL_STYLE_OPTIONS}
                onChange={(brandRowCellStyle: PortfolioToolsBrandRowCellStyle) =>
                  onChange({ brandRowCellStyle })
                }
              />
              <SelectField
                label="Colonnes (écran large)"
                value={String(stack.brandRowColumnsPerRow ?? 3) as '1' | '2' | '3'}
                options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS}
                onChange={(value) =>
                  onChange({
                    brandRowColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                  })
                }
              />
              <SelectField
                label="Alignement du contenu"
                value={stack.brandRowContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                onChange={(brandRowContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandRowContentAlignment })
                }
              />
            </>
          ) : null}
          {stack.design === 'workflow-rail' ? (
            <SelectField
              label="Alignement du contenu"
              value={stack.workflowRailContentAlignment ?? 'center'}
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
                : isRichStackDesign
                  ? 'Afficher le nom'
                  : 'Afficher le nom sous le logo'
            }
            checked={stack.showLabels !== false}
            onChange={(showLabels) => onChange({ showLabels })}
          />
          {stack.design !== 'stack-tags' ? (
            <Toggle
              label="Afficher le fond de l'icône"
              checked={resolveStackIconBackgroundEnabled(stack)}
              onChange={(iconBackgroundEnabled) =>
                onChange({ iconBackgroundEnabled, iconBackgroundOptIn: true })
              }
            />
          ) : null}
          {stack.design !== 'stack-tags' ? (
            <Toggle
              label="Logos en noir & blanc"
              checked={stack.logosGrayscale === true}
              onChange={(logosGrayscale) => onChange({ logosGrayscale })}
            />
          ) : null}
          {isRichStackDesign ? (
            <>
              <Toggle
                label="Afficher la description"
                checked={stack.showDescription !== false}
                onChange={(showDescription) => onChange({ showDescription })}
              />
              {stack.design !== 'brand-index' ? (
                <Toggle
                  label="Afficher le niveau"
                  checked={resolveStackShowLevel(stack)}
                  onChange={(showLevel) => onChange({ showLevel, showLevelOptIn: showLevel })}
                />
              ) : null}
            </>
          ) : isLevelIndicatorDesign ? (
            <Toggle
              label="Afficher l'indicateur de niveau"
              checked={resolveStackShowLevel(stack)}
              onChange={(showLevel) => onChange({ showLevel, showLevelOptIn: showLevel })}
            />
          ) : null}
          <p className="rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900">
            {stack.design === 'level-progress-rows'
              ? 'Level progress rows : liste éditoriale — logo, nom, % et barre (couleur logo). Réglage « Espacement entre les lignes » ci-dessus.'
              : stack.design === 'level-category-rows'
                ? 'Level category rows : logo, nom + catégorie (FRONTEND, BACKEND…), barre fine et % à droite. Renseigne la catégorie sur chaque élément Stack.'
                : stack.design === 'level-table-rows'
                  ? 'Level table rows: headerless table — logo + name, category, colored level label, and % (no experience column). Row order by category or level; optional full width.'
                  : stack.design === 'level-circular-cards'
                    ? 'Level circular cards : grille de cartes — anneau circulaire autour du logo (sans carré intérieur), nom et % en dessous.'
                    : stack.design === 'level-star-cards'
                      ? 'Level star cards : cartes horizontales — nom à gauche, notation 5 étoiles à droite (sans logos).'
                      : stack.design === 'level-svg-rings'
                        ? 'Level SVG rings : grille de cartes — anneau SVG de progression avec le nom de l\'outil centré à l\'intérieur (sans logo, sans %).'
                        : stack.design === 'level-bento-categories'
                          ? 'Level bento categories: one card per skill category in a bento grid — logo, name, and colored level label per row. Assign a category on each stack item.'
                          : stack.design === 'brand-index'
                            ? 'Brand index : lignes type portfolio index — logo à gauche, nom, catégorie au centre (alignée à gauche), description à droite, séparateurs fins. Filtre par catégorie optionnel.'
                            : stack.design === 'brand-row'
                              ? (stack.brandRowCellStyle ?? 'dividers') === 'frames'
                                ? 'Brand row — cadres : chaque outil dans un cadre avec fond et bordure (sans lignes de séparation partagées).'
                                : (stack.brandRowCellStyle ?? 'dividers') === 'none'
                                  ? 'Brand row — sans traits : grille logo + nom, aucune ligne ni cadre.'
                                  : 'Brand row — séparateurs : logo + nom, trait du haut et séparateurs verticaux entre colonnes.'
                              : stack.design === 'brand-cards'
                                ? 'Brand cards : cartes avec logo au-dessus ou à gauche, description et niveau.'
                                : stack.design === 'stack-tags'
                                  ? 'Core stack tags : kicker accent et pastilles de noms sur fond sombre — sans logos.'
                                  : 'Core stack rail : logos en rangée. Les éléments viennent du profil.'}
          </p>
        </div>
      ) : null}

      {current === 'palette' ? (
        <div className="space-y-4">
          <SectionHeroPaletteToggle
            enabled={stack.useHeroPalette !== false}
            onChange={(useHeroPalette) =>
              onChange(
                useHeroPalette
                  ? { useHeroPalette, ...applyToolsPaletteToSettings(stack) }
                  : { useHeroPalette }
              )
            }
          />
          {stack.useHeroPalette !== false ? (
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
                        stack,
                        slot.value as ToolsColorSlot,
                        event.target.value as HeroPaletteTokenId
                      )
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
              <ColorField
                label="Titre"
                value={stack.titleColor}
                onChange={(titleColor) => onChange({ titleColor })}
              />
              <ColorField
                label="Sous-titre"
                value={stack.subtitleColor}
                onChange={(subtitleColor) => onChange({ subtitleColor })}
              />
              <ColorField
                label="Fond des tuiles"
                value={stack.tileBackgroundColor}
                onChange={(tileBackgroundColor) => onChange({ tileBackgroundColor })}
              />
              <ColorField
                label="Noms"
                value={stack.labelColor}
                onChange={(labelColor) => onChange({ labelColor })}
              />
              {isRichStackDesign ? (
                <>
                  <ColorField
                    label="Description"
                    value={stack.descriptionColor}
                    onChange={(descriptionColor) => onChange({ descriptionColor })}
                  />
                  <ColorField
                    label="Fond cartes"
                    value={stack.cardBackgroundColor}
                    onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
                  />
                  <ColorField
                    label="Bordure / séparateurs"
                    value={stack.cardBorderColor}
                    onChange={(cardBorderColor) => onChange({ cardBorderColor })}
                  />
                  <ColorField
                    label="Badge niveau"
                    value={stack.levelAccentColor}
                    onChange={(levelAccentColor) => onChange({ levelAccentColor })}
                  />
                </>
              ) : null}
              {isBrandRowFrames ? (
                <>
                  <ColorField
                    label="Fond cadres"
                    value={stack.cardBackgroundColor}
                    onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
                  />
                  <ColorField
                    label="Bordure cadres"
                    value={stack.cardBorderColor}
                    onChange={(cardBorderColor) => onChange({ cardBorderColor })}
                  />
                </>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {current === 'background' ? (
        <SectionBackgroundSettingsFields settings={stack} onChange={onChange} />
      ) : null}
    </div>
  );
}
