'use client';

import type { ReactNode } from 'react';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
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
  PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS,
  PORTFOLIO_TOOLS_HEADER_BOTTOM_SPACING_OPTIONS,
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
  type PortfolioToolsHeaderDesign,
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
  DEFAULT_TOOLS_COLOR_BINDINGS,
  DEFAULT_TOOLS_PALETTE,
  mergeToolsColorBindings,
  mergeToolsPalette,
  patchToolsColorBinding,
  type ToolsColorSlot,
} from '@/components/portfolio/portfolio-tools-palette-settings';
import {
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';

/** Same general / design / header mechanism as the Stack section settings panel, plus its own Background tab. */
export type ToolsSubSection = 'general' | 'design' | 'header' | 'background';

const SUBSECTIONS: { value: ToolsSubSection; label: string }[] = [
  { value: 'general', label: 'Général' },
  { value: 'design', label: 'Design' },
  { value: 'header', label: 'Header' },
  { value: 'background', label: 'Arrière-plan' },
];

export function normalizeToolsSubSection(value: string | undefined): ToolsSubSection {
  return SUBSECTIONS.some((item) => item.value === value) ? (value as ToolsSubSection) : 'design';
}


/** Curated 3-option quick palette for Name / Description text colors — separate from the full 8-token dropdown. */
const TOOLS_QUICK_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'principal', label: 'Principal' },
  { value: 'texteFort', label: 'Texte fort' },
  { value: 'texteMuted', label: 'Texte muted' },
];

/** For section-background-style fields (fill, gradient stops, split zones) — "fond"/"neutre"
 *  fit that context better than "texte fort", which is why this isn't just TOOLS_QUICK_PALETTE_TOKENS. */
const TOOLS_BACKGROUND_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: 'Fond' },
  { value: 'neutre', label: 'Neutre' },
  { value: 'principal', label: 'Principal' },
  { value: 'texteMuted', label: 'Texte muted' },
];

function ToolsQuickColorPicker({
  label,
  palette,
  activeToken,
  activeHex,
  onPickToken,
  tokens = TOOLS_QUICK_PALETTE_TOKENS,
}: {
  label: string;
  palette: Record<HeroPaletteTokenId, string>;
  /** Bound to a live palette token (hero-palette mode) — takes priority over activeHex for the active state. */
  activeToken?: HeroPaletteTokenId;
  /** Concrete hex in use (custom-color mode) — matched against each swatch's resolved color. */
  activeHex?: string;
  onPickToken: (token: HeroPaletteTokenId) => void;
  tokens?: { value: HeroPaletteTokenId; label: string }[];
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        {tokens.map((token) => {
          const hex = resolveHeroPaletteColor(palette, token.value);
          const active = activeToken
            ? activeToken === token.value
            : activeHex?.trim().toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={token.value}
              type="button"
              title={token.label}
              aria-label={token.label}
              aria-pressed={active}
              onClick={() => onPickToken(token.value)}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className="h-8 w-8 rounded-full border-2 transition"
                style={{
                  backgroundColor: hex,
                  borderColor: active ? '#171717' : '#e5e5e5',
                  boxShadow: active ? '0 0 0 2px rgba(23,23,23,0.15)' : 'none',
                }}
              />
              <span
                className={`text-[11px] font-medium ${active ? 'text-neutral-900' : 'text-neutral-500'}`}
              >
                {token.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Maps SectionBackgroundFillControls' field labels to the matching ToolsColorSlot and, for the
 *  custom-color fallback (useHeroPalette off), the concrete settings field it should write to. */
const TOOLS_BACKGROUND_LABEL_SLOTS: Record<
  string,
  { slot: ToolsColorSlot; field: keyof PortfolioToolsSectionSettings }
> = {
  Color: { slot: 'sectionBackground', field: 'sectionBackgroundColor' },
  'Gradient start': { slot: 'sectionGradientFrom', field: 'sectionBackgroundGradientFrom' },
  'Gradient end': { slot: 'sectionGradientTo', field: 'sectionBackgroundGradientTo' },
  'Color A': { slot: 'sectionSplitA', field: 'sectionBackgroundColorA' },
  'Color B': { slot: 'sectionSplitB', field: 'sectionBackgroundColorB' },
};

/** Section-background color fields, bound to the same toolsPalette/toolsColorBindings system
 *  as the rest of Tools' Palette block — "Fond", "Neutre", "Principal", "Texte muted" swatches,
 *  no free-form hex. */
function ToolsBackgroundColorField({
  tools,
  onChange,
  palette,
  bindings,
  label,
  value,
}: {
  tools: PortfolioToolsSectionSettings;
  onChange: (patch: Partial<PortfolioToolsSectionSettings>) => void;
  palette: Record<HeroPaletteTokenId, string>;
  bindings: Record<ToolsColorSlot, HeroPaletteTokenId>;
  label: string;
  value: string;
}) {
  const mapping = TOOLS_BACKGROUND_LABEL_SLOTS[label] ?? TOOLS_BACKGROUND_LABEL_SLOTS.Color;
  const usingPalette = tools.useHeroPalette !== false;
  return (
    <ToolsQuickColorPicker
      label={label}
      palette={palette}
      tokens={TOOLS_BACKGROUND_PALETTE_TOKENS}
      activeToken={usingPalette ? bindings[mapping.slot] : undefined}
      activeHex={value}
      onPickToken={(token) =>
        onChange(
          usingPalette
            ? patchToolsColorBinding(tools, mapping.slot, token)
            : { [mapping.field]: resolveHeroPaletteColor(palette, token) }
        )
      }
    />
  );
}

/** Same mini-wireframe/picker-card mechanism as Stack's design grid (see StackDesignWireframe). */
function ToolsMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function ToolsMiniType({
  x,
  y,
  children,
  size = 8,
  anchor = 'start',
}: {
  x: number;
  y: number;
  children: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text
      className="pf-stack-mini-type"
      x={x}
      y={y}
      fontSize={size}
      fontWeight={700}
      letterSpacing="0.1em"
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

function ToolsPickerCard({
  active,
  label,
  onClick,
  children,
  compact,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
  /** Smaller padding/type for secondary preview-card grids (Cell style, Columns, …). */
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      className={`pf-stack-design-card rounded-2xl text-left ${compact ? 'pf-stack-preview-card' : 'px-3 pb-3 pt-2.5'}`}
    >
      {children}
      <span className={compact ? 'mt-1.5 block' : 'mt-2.5 block'}>
        <span
          className={`pf-stack-card-label min-w-0 font-semibold leading-none tracking-tight ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

function ToolsDesignWireframe({ design }: { design: PortfolioToolsDesign }) {
  switch (design) {
    case 'workflow-rail':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="18" width="14" height="14" rx="4" />
          <rect className="pf-stack-mini-mute" x="9" y="38" width="12" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="31" y="18" width="14" height="14" rx="4" />
          <rect className="pf-stack-mini-mute" x="32" y="38" width="12" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="54" y="18" width="14" height="14" rx="4" />
          <rect className="pf-stack-mini-mute" x="55" y="38" width="12" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="77" y="18" width="14" height="14" rx="4" />
          <rect className="pf-stack-mini-mute" x="78" y="38" width="12" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="100" y="18" width="14" height="14" rx="4" />
          <rect className="pf-stack-mini-mute" x="101" y="38" width="12" height="2.2" rx="1.1" />
        </ToolsMiniSlide>
      );
    case 'brand-cards':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="8" width="48" height="56" rx="4" />
          <rect className="pf-stack-mini-ink" x="14" y="15" width="12" height="12" rx="3" />
          <rect className="pf-stack-mini-mute" x="14" y="34" width="28" height="3" rx="1.4" />
          <rect className="pf-stack-mini-mute" x="14" y="41" width="32" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="14" y="49" width="16" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-mute" x="64" y="8" width="48" height="56" rx="4" />
          <rect className="pf-stack-mini-ink" x="70" y="15" width="12" height="12" rx="3" />
          <rect className="pf-stack-mini-mute" x="70" y="34" width="28" height="3" rx="1.4" />
          <rect className="pf-stack-mini-mute" x="70" y="41" width="24" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="70" y="49" width="16" height="2.2" rx="1.1" />
        </ToolsMiniSlide>
      );
    case 'brand-directory':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="21" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="37" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="53" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-ink" x="8" y="10" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="10" width="26" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="22" y="15.5" width="18" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="96" y="9" width="16" height="7" rx="3.5" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="26" width="22" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="22" y="31.5" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="96" y="25" width="16" height="7" rx="3.5" />
          <rect className="pf-stack-mini-ink" x="8" y="42" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="42" width="20" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="22" y="47.5" width="18" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="96" y="41" width="16" height="7" rx="3.5" />
        </ToolsMiniSlide>
      );
    case 'brand-index':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="21" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="37" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="53" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-ink" x="8" y="10" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="12" width="22" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="50" y="12" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="78" y="12" width="30" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="28" width="18" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="50" y="28" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="78" y="28" width="24" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="42" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="44" width="24" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="50" y="44" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="78" y="44" width="28" height="2" rx="1" />
        </ToolsMiniSlide>
      );
    case 'brand-row':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="9" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="41" y="9" width="1" height="54" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="74" y="9" width="1" height="54" rx="0.5" />
          <rect className="pf-stack-mini-ink" x="18" y="18" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="15" y="30" width="14" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="51" y="18" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="48" y="30" width="14" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="84" y="18" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="81" y="30" width="14" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="18" y="44" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="15" y="56" width="14" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="51" y="44" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="48" y="56" width="14" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-ink" x="84" y="44" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="81" y="56" width="14" height="2.2" rx="1.1" />
        </ToolsMiniSlide>
      );
    case 'brand-float':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="7" y="7" width="33" height="28" rx="5" />
          <rect className="pf-stack-mini-ink" x="17" y="14" width="13" height="13" rx="4" />
          <rect className="pf-stack-mini-mute" x="43" y="7" width="33" height="28" rx="5" />
          <rect className="pf-stack-mini-ink" x="53" y="14" width="13" height="13" rx="4" />
          <rect className="pf-stack-mini-mute" x="79" y="7" width="33" height="28" rx="5" />
          <rect className="pf-stack-mini-ink" x="89" y="14" width="13" height="13" rx="4" />
          <rect className="pf-stack-mini-mute" x="7" y="39" width="33" height="26" rx="5" />
          <rect className="pf-stack-mini-ink" x="17" y="45" width="13" height="13" rx="4" />
          <rect className="pf-stack-mini-mute" x="43" y="39" width="33" height="26" rx="5" />
          <rect className="pf-stack-mini-ink" x="53" y="45" width="13" height="13" rx="4" />
          <rect className="pf-stack-mini-mute" x="79" y="39" width="33" height="26" rx="5" />
          <rect className="pf-stack-mini-ink" x="89" y="45" width="13" height="13" rx="4" />
        </ToolsMiniSlide>
      );
    case 'level-stat-bars':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="7" y="7" width="33" height="34" rx="5" />
          <rect className="pf-stack-mini-ink" x="14" y="13" width="10" height="10" rx="3" />
          <rect className="pf-stack-mini-mute" x="14" y="27" width="19" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="14" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="19" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="24" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-mute" x="29" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-mute" x="43" y="7" width="33" height="34" rx="5" />
          <rect className="pf-stack-mini-ink" x="50" y="13" width="10" height="10" rx="3" />
          <rect className="pf-stack-mini-mute" x="50" y="27" width="19" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="50" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="55" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-mute" x="60" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-mute" x="65" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-mute" x="79" y="7" width="33" height="34" rx="5" />
          <rect className="pf-stack-mini-ink" x="86" y="13" width="10" height="10" rx="3" />
          <rect className="pf-stack-mini-mute" x="86" y="27" width="19" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="86" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="91" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="96" y="31.5" width="3.5" height="3" rx="1" />
          <rect className="pf-stack-mini-accent" x="101" y="31.5" width="3.5" height="3" rx="1" />
        </ToolsMiniSlide>
      );
    case 'level-progress-rows':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="9" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="11" width="26" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="8" y="21" width="104" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="21" width="76" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="32" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="34" width="20" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="8" y="44" width="104" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="44" width="52" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="55" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="57" width="24" height="2.4" rx="1.2" />
        </ToolsMiniSlide>
      );
    case 'level-category-rows':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="9" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="10" width="18" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="42" y="10.4" width="14" height="1.6" rx="0.8" />
          <rect className="pf-stack-mini-mute" x="8" y="20" width="88" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="20" width="60" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="32" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="33" width="22" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="46" y="33.4" width="14" height="1.6" rx="0.8" />
          <rect className="pf-stack-mini-mute" x="8" y="43" width="88" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="43" width="40" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="55" width="8" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="22" y="56" width="16" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-accent" x="40" y="56.4" width="14" height="1.6" rx="0.8" />
        </ToolsMiniSlide>
      );
    case 'level-table-rows':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="20" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="36" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-mute" x="8" y="52" width="104" height="1" rx="0.5" />
          <rect className="pf-stack-mini-ink" x="8" y="9" width="7" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="20" y="10.5" width="20" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-mute" x="46" y="10.5" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="94" y="9" width="14" height="7" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="25" width="7" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="20" y="26.5" width="24" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-mute" x="52" y="26.5" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="94" y="25" width="14" height="7" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="41" width="7" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="20" y="42.5" width="18" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-mute" x="44" y="42.5" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="94" y="41" width="14" height="7" rx="2" />
        </ToolsMiniSlide>
      );
    case 'level-circular-cards':
      return (
        <ToolsMiniSlide>
          <circle className="pf-stack-mini-ring" cx="24" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="24" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="14" y="46" width="20" height="2.2" rx="1.1" />
          <circle className="pf-stack-mini-ring" cx="60" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="60" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="50" y="46" width="20" height="2.2" rx="1.1" />
          <circle className="pf-stack-mini-ring" cx="96" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="96" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="86" y="46" width="20" height="2.2" rx="1.1" />
        </ToolsMiniSlide>
      );
    case 'level-star-cards':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="10" width="104" height="22" rx="4" />
          <rect className="pf-stack-mini-mute" x="16" y="18" width="26" height="3" rx="1.5" />
          <circle className="pf-stack-mini-accent" cx="70" cy="19.5" r="2.2" />
          <circle className="pf-stack-mini-accent" cx="78" cy="19.5" r="2.2" />
          <circle className="pf-stack-mini-accent" cx="86" cy="19.5" r="2.2" />
          <circle className="pf-stack-mini-mute" cx="94" cy="19.5" r="2.2" />
          <circle className="pf-stack-mini-mute" cx="102" cy="19.5" r="2.2" />
          <rect className="pf-stack-mini-mute" x="8" y="40" width="104" height="22" rx="4" />
          <rect className="pf-stack-mini-mute" x="16" y="48" width="22" height="3" rx="1.5" />
          <circle className="pf-stack-mini-accent" cx="70" cy="49.5" r="2.2" />
          <circle className="pf-stack-mini-accent" cx="78" cy="49.5" r="2.2" />
          <circle className="pf-stack-mini-accent" cx="86" cy="49.5" r="2.2" />
          <circle className="pf-stack-mini-accent" cx="94" cy="49.5" r="2.2" />
          <circle className="pf-stack-mini-mute" cx="102" cy="49.5" r="2.2" />
        </ToolsMiniSlide>
      );
    case 'level-svg-rings':
      return (
        <ToolsMiniSlide>
          <circle className="pf-stack-mini-ring" cx="24" cy="32" r="16" strokeWidth={3} />
          <ToolsMiniType x={24} y={34} size={6} anchor="middle">
            CSS
          </ToolsMiniType>
          <circle className="pf-stack-mini-ring" cx="60" cy="32" r="16" strokeWidth={3} />
          <ToolsMiniType x={60} y={34} size={6} anchor="middle">
            JS
          </ToolsMiniType>
          <circle className="pf-stack-mini-ring" cx="96" cy="32" r="16" strokeWidth={3} />
          <ToolsMiniType x={96} y={34} size={6} anchor="middle">
            GO
          </ToolsMiniType>
        </ToolsMiniSlide>
      );
    case 'level-bento-categories':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="8" width="50" height="26" rx="3.5" />
          <rect className="pf-stack-mini-ink" x="14" y="14" width="7" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="14" y="26" width="28" height="2.2" rx="1.1" />
          <rect className="pf-stack-mini-mute" x="62" y="8" width="50" height="14" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="62" y="26" width="24" height="8" rx="3" />
          <rect className="pf-stack-mini-mute" x="90" y="26" width="22" height="8" rx="3" />
          <rect className="pf-stack-mini-mute" x="8" y="38" width="24" height="26" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="36" y="38" width="24" height="26" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="64" y="38" width="48" height="26" rx="3.5" />
          <rect className="pf-stack-mini-ink" x="70" y="44" width="7" height="7" rx="2" />
        </ToolsMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Same animated switch + segmented option grid as Stack's layout settings (StackSwitchTrack/StackOptionGrid). */
function ToolsSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        backgroundColor: checked
          ? 'var(--pf-palette-texte-fort, #171717)'
          : 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 22%, var(--pf-palette-fond, #0a0a0a))',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full transition-[left,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: checked ? '1.125rem' : '0.125rem',
          backgroundColor: checked
            ? 'var(--pf-palette-fond, #ffffff)'
            : 'var(--pf-palette-texte-fort, #ffffff)',
        }}
      />
    </span>
  );
}

function ToolsToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer flex-col gap-1 text-left"
    >
      <span className="flex items-center justify-between gap-4">
        <span className="min-w-0 text-sm font-semibold text-neutral-950">{label}</span>
        <ToolsSwitchTrack checked={checked} />
      </span>
    </button>
  );
}

function ToolsOptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns,
  icons,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  icons?: Partial<Record<string, ReactNode>>;
}) {
  const count = options.length;
  const cols = columns ?? (count <= 4 ? Math.max(count, 1) : 2);
  const compact = cols === count && count >= 2 && count <= 5;
  return (
    <div>
      <p className="pf-stack-block-label pf-stack-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-stack-segment grid gap-[3px] p-[3px]"
        data-compact={compact ? 'true' : 'false'}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const active = option.value === value;
          const icon = icons?.[String(option.value)];
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              title={option.description}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-stack-segment-btn flex items-center justify-center px-2.5 py-1.5 text-center text-[13px] font-medium tracking-tight"
              style={
                active
                  ? undefined
                  : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }
              }
            >
              {icon ? <span className="pf-stack-segment-icon">{icon}</span> : null}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Ordered/continuous-scale control (size, spacing, gap) — a single drag surface
 * snapping between the option's discrete steps, with the current step named live.
 */
function ToolsSlider<T extends string>({
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
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const lastIndex = options.length - 1;
  const percent = lastIndex > 0 ? (index / lastIndex) * 100 : 0;
  const current = options[index] ?? options[0];
  return (
    <div>
      <div className="pf-stack-slider-row">
        <span className="pf-stack-slider-label">{label}</span>
        <span className="pf-stack-slider-value">{current?.label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(lastIndex, 0)}
        step={1}
        value={index}
        onChange={(event) => {
          const next = options[Number(event.target.value)];
          if (next) onChange(next.value);
        }}
        aria-label={label}
        className="pf-stack-slider-input"
        style={{
          background: `linear-gradient(to right, var(--pf-palette-texte-fort, #f5f5f5) ${percent}%, color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 16%, var(--pf-palette-fond, #0a0a0a)) ${percent}%)`,
        }}
      />
    </div>
  );
}

/**
 * Visual-difference choice (style, layout) — a compact preview card per option so the
 * difference reads at a glance instead of via a label alone.
 */
function ToolsPreviewCardGrid<T extends string>({
  label,
  value,
  options,
  onChange,
  columns,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; glyph: ReactNode }[];
  onChange: (value: T) => void;
  columns?: number;
}) {
  const cols = columns ?? Math.min(options.length, 4);
  return (
    <div>
      <p className="pf-stack-block-label pf-stack-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <ToolsPickerCard
            key={option.value}
            active={option.value === value}
            label={option.label}
            onClick={() => onChange(option.value)}
            compact
          >
            <svg viewBox="0 0 64 34" className="pf-stack-mini h-full w-full" aria-hidden>
              <rect className="pf-stack-mini-stage" x="0.75" y="0.75" width="62.5" height="32.5" rx="6" />
              {option.glyph}
            </svg>
          </ToolsPickerCard>
        ))}
      </div>
    </div>
  );
}

/** N evenly spaced bars — glyph for "columns per row" preview cards. */
function toolsColumnsGlyph(n: 1 | 2 | 3 | 4): ReactNode {
  const gap = 4;
  const totalWidth = 48;
  const startX = 8;
  const barWidth = (totalWidth - gap * (n - 1)) / n;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          className="pf-stack-mini-ink"
          x={startX + i * (barWidth + gap)}
          y={8}
          width={barWidth}
          height={18}
          rx={2}
        />
      ))}
    </>
  );
}

function toolsCellStyleDividersGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="8" y="10" width="20" height="14" rx="2" />
      <rect className="pf-stack-mini-accent" x="31" y="8" width="1.4" height="18" rx="0.7" />
      <rect className="pf-stack-mini-mute" x="36" y="10" width="20" height="14" rx="2" />
    </>
  );
}

function toolsCellStyleFramesGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ring" x="9" y="9" width="20" height="16" rx="3" strokeWidth={1.4} />
      <rect className="pf-stack-mini-ring" x="35" y="9" width="20" height="16" rx="3" strokeWidth={1.4} />
    </>
  );
}

function toolsCellStyleNoneGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="9" y="10" width="20" height="14" rx="2" />
      <rect className="pf-stack-mini-mute" x="35" y="10" width="20" height="14" rx="2" />
    </>
  );
}

function toolsIconPlacementTopGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="26" y="6" width="12" height="12" rx="3" />
      <rect className="pf-stack-mini-mute" x="18" y="22" width="28" height="3" rx="1.5" />
    </>
  );
}

function toolsIconPlacementLeftGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="8" y="11" width="12" height="12" rx="3" />
      <rect className="pf-stack-mini-mute" x="26" y="12" width="30" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="26" y="19" width="22" height="2.4" rx="1.2" />
    </>
  );
}

function toolsLevelDisplayTextGlyph(): ReactNode {
  return <rect className="pf-stack-mini-accent" x="16" y="14" width="32" height="6" rx="3" />;
}

function toolsLevelDisplayStarsGlyph(): ReactNode {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          className={i < 3 ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute'}
          cx={14 + i * 9.5}
          cy={17}
          r={2.6}
        />
      ))}
    </>
  );
}

function toolsLevelDisplayDotsGlyph(): ReactNode {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          className={i < 3 ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute'}
          cx={14 + i * 9.5}
          cy={17}
          r={2.1}
        />
      ))}
    </>
  );
}

function toolsLevelDisplayBarGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="10" y="15" width="44" height="4" rx="2" />
      <rect className="pf-stack-mini-accent" x="10" y="15" width="28" height="4" rx="2" />
    </>
  );
}

function toolsBarStyleRectangleGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="8" y="15" width="48" height="4" />
      <rect className="pf-stack-mini-accent" x="8" y="15" width="30" height="4" />
    </>
  );
}

function toolsBarStylePillGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="8" y="14.5" width="48" height="5" rx="2.5" />
      <rect className="pf-stack-mini-accent" x="8" y="14.5" width="30" height="5" rx="2.5" />
    </>
  );
}

function toolsBarStyleGradientGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="8" y="14.5" width="48" height="5" rx="2.5" />
      <rect className="pf-stack-mini-accent" x="8" y="14.5" width="30" height="5" rx="2.5" opacity={0.5} />
      <rect className="pf-stack-mini-accent" x="8" y="14.5" width="14" height="5" rx="2.5" />
    </>
  );
}

function toolsBarStyleSegmentsGlyph(): ReactNode {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={i}
          className={i < 4 ? 'pf-stack-mini-accent' : 'pf-stack-mini-mute'}
          x={8 + i * 8}
          y={14.5}
          width={6}
          height={5}
          rx={1.6}
        />
      ))}
    </>
  );
}

function toolsCardFrameFramedGlyph(): ReactNode {
  return <rect className="pf-stack-mini-ring" x="14" y="6" width="36" height="22" rx="4" strokeWidth={1.4} />;
}

function toolsCardFramePlainGlyph(): ReactNode {
  return (
    <>
      <circle className="pf-stack-mini-ink" cx="32" cy="13" r="5" />
      <rect className="pf-stack-mini-mute" x="22" y="23" width="20" height="2.4" rx="1.2" />
    </>
  );
}

function toolsGridLayoutAsymmetricGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="8" y="8" width="28" height="18" rx="3" />
      <rect className="pf-stack-mini-mute" x="39" y="8" width="17" height="18" rx="3" />
    </>
  );
}

function toolsGridLayoutEqualGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="8" y="8" width="22" height="18" rx="3" />
      <rect className="pf-stack-mini-ink" x="34" y="8" width="22" height="18" rx="3" />
    </>
  );
}

/** Minimalist text-alignment glyphs for content-alignment option grids. */
function ToolsAlignLeftIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="0" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="0" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function ToolsAlignCenterIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="3" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="1.5" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function ToolsAlignRightIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="6" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="3" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

const TOOLS_ALIGNMENT_ICONS: Partial<Record<string, ReactNode>> = {
  left: <ToolsAlignLeftIcon />,
  center: <ToolsAlignCenterIcon />,
  right: <ToolsAlignRightIcon />,
};

function ToolsDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioToolsDesign;
  onChange: (value: PortfolioToolsDesign) => void;
}) {
  return (
    <div>
      <p className="pf-stack-block-label">Design</p>
      <div className="grid grid-cols-2 gap-2">
        {PORTFOLIO_TOOLS_DESIGN_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ToolsPickerCard
              key={option.value}
              active={active}
              label={option.label}
              onClick={() => onChange(option.value)}
            >
              <ToolsDesignWireframe design={option.value} />
            </ToolsPickerCard>
          );
        })}
      </div>
    </div>
  );
}

/** Mini wireframes for the 4 Header design picker cards — same ToolsMiniSlide mechanism as Design. */
function ToolsHeaderDesignWireframe({ design }: { design: PortfolioToolsHeaderDesign }) {
  switch (design) {
    case 'focus':
      return (
        <ToolsMiniSlide>
          <circle className="pf-stack-mini-ring" cx="24" cy="15" r="6" strokeWidth={1.4} />
          <line className="pf-stack-mini-ring" x1="24" y1="7" x2="24" y2="10.5" strokeWidth={1.4} />
          <line className="pf-stack-mini-ring" x1="24" y1="19.5" x2="24" y2="23" strokeWidth={1.4} />
          <rect className="pf-stack-mini-ink" x="20" y="28" width="60" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="20" y="46" width="40" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'terminal':
      return (
        <ToolsMiniSlide>
          <ToolsMiniType x={18} y={20} size={7}>
            $
          </ToolsMiniType>
          <rect className="pf-stack-mini-accent" x="27" y="14" width="3" height="8" rx="1" />
          <rect className="pf-stack-mini-ink" x="18" y="28" width="58" height="10" rx="2" />
          <ToolsMiniType x={18} y={51} size={6}>
            &gt;
          </ToolsMiniType>
          <rect className="pf-stack-mini-mute" x="27" y="46" width="34" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'bracket':
      return (
        <ToolsMiniSlide>
          <path className="pf-stack-mini-ring" d="M16 20 V14 H22" fill="none" strokeWidth={2} />
          <path className="pf-stack-mini-ring" d="M84 20 V14 H78" fill="none" strokeWidth={2} />
          <path className="pf-stack-mini-ring" d="M16 46 V52 H22" fill="none" strokeWidth={2} />
          <path className="pf-stack-mini-ring" d="M84 46 V52 H78" fill="none" strokeWidth={2} />
          <rect className="pf-stack-mini-ink" x="24" y="26" width="52" height="12" rx="2" />
          <rect className="pf-stack-mini-mute" x="24" y="46" width="36" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'underline':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-ink" x="20" y="24" width="60" height="10" rx="2" />
          <path
            className="pf-stack-mini-ring"
            d="M20 40 C 40 37, 60 43, 80 39"
            fill="none"
            strokeWidth={2}
          />
          <rect className="pf-stack-mini-mute" x="20" y="48" width="40" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'cascade':
      return (
        <ToolsMiniSlide>
          <circle className="pf-stack-mini-accent" cx="20" cy="14" r="2.1" />
          <circle className="pf-stack-mini-accent" cx="28" cy="14" r="2.1" />
          <circle className="pf-stack-mini-accent" cx="36" cy="14" r="2.1" />
          <rect className="pf-stack-mini-ink" x="18" y="26" width="24" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="46" y="26" width="30" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="80" y="26" width="20" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="18" y="50" width="40" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'mosaic':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="10" width="6" height="6" />
          <rect className="pf-stack-mini-mute" x="18" y="10" width="6" height="6" opacity={0.55} />
          <rect className="pf-stack-mini-mute" x="10" y="18" width="6" height="6" opacity={0.32} />
          <rect className="pf-stack-mini-mute" x="18" y="18" width="6" height="6" opacity={0.18} />
          <rect className="pf-stack-mini-ink" x="34" y="24" width="60" height="16" rx="2" />
          <rect className="pf-stack-mini-mute" x="34" y="24" width="14" height="8" />
          <rect className="pf-stack-mini-mute" x="62" y="24" width="14" height="8" opacity={0.6} />
          <rect className="pf-stack-mini-mute" x="80" y="32" width="14" height="8" opacity={0.35} />
          <rect className="pf-stack-mini-mute" x="34" y="48" width="40" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'mask':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-ink" x="20" y="28" width="60" height="10" rx="2" />
          <rect className="pf-stack-mini-accent" x="58" y="28" width="22" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="20" y="46" width="40" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'split':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-ink" x="12" y="26" width="36" height="14" rx="2" />
          <rect className="pf-stack-mini-mute" x="59" y="20" width="1.4" height="28" rx="0.7" />
          <rect className="pf-stack-mini-mute" x="72" y="30" width="36" height="4" rx="2" />
          <rect className="pf-stack-mini-mute" x="72" y="38" width="28" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'typewriter':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="8" height="10" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="29" y="30" width="8" height="10" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="40" y="30" width="8" height="10" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="51" y="30" width="8" height="10" rx="1.5" />
          <rect className="pf-stack-mini-accent" x="63" y="29" width="2" height="12" rx="1" />
          <rect className="pf-stack-mini-mute" x="18" y="48" width="40" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'index':
      return (
        <ToolsMiniSlide>
          <text x="18" y="52" fontSize={40} fontWeight={800} opacity={0.45} className="pf-stack-mini-mute">
            0
          </text>
          <rect className="pf-stack-mini-ink" x="48" y="30" width="46" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="48" y="46" width="32" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'masthead':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-accent" x="30" y="18" width="60" height="1.6" rx="0.8" />
          <rect className="pf-stack-mini-ink" x="36" y="30" width="48" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="42" y="46" width="36" height="4" rx="2" />
          <rect className="pf-stack-mini-accent" x="30" y="54" width="60" height="1.6" rx="0.8" />
        </ToolsMiniSlide>
      );
    case 'marquee':
      return (
        <ToolsMiniSlide>
          <g transform="rotate(-4 60 36)" opacity={0.35}>
            <rect className="pf-stack-mini-mute" x="0" y="30" width="26" height="10" rx="2" />
            <rect className="pf-stack-mini-mute" x="32" y="30" width="26" height="10" rx="2" />
            <rect className="pf-stack-mini-mute" x="64" y="30" width="26" height="10" rx="2" />
            <rect className="pf-stack-mini-mute" x="96" y="30" width="26" height="10" rx="2" />
          </g>
          <rect className="pf-stack-mini-ink" x="30" y="28" width="60" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="38" y="46" width="44" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

function ToolsHeaderDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioToolsHeaderDesign;
  onChange: (value: PortfolioToolsHeaderDesign) => void;
}) {
  return (
    <div>
      <p className="pf-stack-block-label">Header design</p>
      <div className="grid grid-cols-2 gap-2">
        {PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ToolsPickerCard
              key={option.value}
              active={active}
              label={option.label}
              onClick={() => onChange(option.value)}
            >
              <ToolsHeaderDesignWireframe design={option.value} />
            </ToolsPickerCard>
          );
        })}
      </div>
    </div>
  );
}

function ToolsLayoutSettingsBand({
  children,
  motionKey,
  title = 'Design settings',
}: {
  children: ReactNode;
  motionKey: string;
  title?: string;
}) {
  return (
    <section className="pf-stack-layout-settings" aria-labelledby="tools-layout-settings-title">
      <h3 id="tools-layout-settings-title" className="pf-stack-layout-settings-title">
        {title}
      </h3>
      <div key={motionKey} className="pf-stack-layout-settings-body space-y-6">
        {children}
      </div>
    </section>
  );
}

function handleToolsDesignChange(
  tools: PortfolioToolsSectionSettings,
  design: PortfolioToolsDesign,
  onChange: (patch: Partial<PortfolioToolsSectionSettings>) => void
) {
  if (design === 'brand-float' && tools.iconBackgroundOptIn !== false) {
    onChange({ design, iconBackgroundEnabled: true });
    return;
  }
  if (design === 'level-bento-categories') {
    onChange({ ...toolsLevelBentoCategoriesDesignDefaults(), design });
    return;
  }
  if (design === 'level-star-cards') {
    onChange({ ...toolsLevelStarCardsDesignDefaults(), design });
    return;
  }
  if (design === 'level-svg-rings') {
    onChange({ ...toolsLevelSvgRingsDesignDefaults(), design });
    return;
  }
  onChange({ design });
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
  subSection = 'design',
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
          <ToolsToggleRow
            label={sectionToggleLabel}
            checked={tools.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <ToolsLayoutSettingsBand motionKey={`${tools.design}-visibility`} title="Content visibility">
            <ToolsToggleRow
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
            <ToolsToggleRow
              label="Afficher le fond de l'icône"
              checked={resolveToolsIconBackgroundEnabled(tools)}
              onChange={(iconBackgroundEnabled) =>
                onChange({ iconBackgroundEnabled, iconBackgroundOptIn: true })
              }
            />
            <ToolsToggleRow
              label="Logos en noir & blanc"
              checked={tools.logosGrayscale === true}
              onChange={(logosGrayscale) => onChange({ logosGrayscale })}
            />
            {isRichToolsDesign ? (
              <>
                <ToolsToggleRow
                  label="Afficher la description"
                  checked={tools.showDescription !== false}
                  onChange={(showDescription) => onChange({ showDescription })}
                />
                <ToolsToggleRow
                  label="Afficher les use cases"
                  checked={tools.showUseCases !== false}
                  onChange={(showUseCases) => onChange({ showUseCases })}
                />
                {tools.design !== 'brand-index' ? (
                  <ToolsToggleRow
                    label="Afficher le niveau"
                    checked={resolveToolsShowLevel(tools)}
                    onChange={(showLevel) => onChange({ showLevel, showLevelOptIn: showLevel })}
                  />
                ) : null}
              </>
            ) : isLevelIndicatorDesign ? (
              <ToolsToggleRow
                label="Afficher l'indicateur de niveau"
                checked={resolveToolsShowLevel(tools)}
                onChange={(showLevel) => onChange({ showLevel, showLevelOptIn: showLevel })}
              />
            ) : null}
          </ToolsLayoutSettingsBand>
        </div>
      ) : null}

      {current === 'design' ? (
        <div className="space-y-4">
          {designOptions.length > 1 ? (
            <ToolsDesignChoiceGrid
              value={tools.design}
              onChange={(design) => handleToolsDesignChange(tools, design, onChange)}
            />
          ) : null}
          <ToolsLayoutSettingsBand motionKey={tools.design}>
            <ToolsSlider
              label="Logo size"
              value={tools.tileSize}
              options={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS}
              onChange={(tileSize: PortfolioToolsTileSize) => onChange({ tileSize })}
            />
            {isLevelIndicatorDesign ? (
              <>
                {tools.design !== 'level-star-cards' ? (
                  <ToolsSlider
                    label="Vertical spacing"
                    value={tools.levelProgressRowGap ?? 'large'}
                    options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS}
                    onChange={(levelProgressRowGap: PortfolioToolsLevelProgressRowGap) =>
                      onChange({ levelProgressRowGap })
                    }
                  />
                ) : null}
                {tools.design !== 'level-progress-rows' && tools.design !== 'level-category-rows' ? (
                  <ToolsToggleRow
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
                <ToolsOptionGrid
                  label="Row order"
                  value={tools.levelTableGroupBy ?? 'category'}
                  options={PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS}
                  onChange={(levelTableGroupBy: PortfolioToolsLevelTableGroupBy) =>
                    onChange({ levelTableGroupBy })
                  }
                />
                <ToolsToggleRow
                  label="Category filter"
                  checked={resolveToolsLevelIndicatorShowCategoryFilter(tools)}
                  onChange={(levelIndicatorShowCategoryFilter) =>
                    onChange({
                      levelIndicatorShowCategoryFilter,
                      levelTableShowCategoryFilter: levelIndicatorShowCategoryFilter,
                    })
                  }
                />
                {tools.design !== 'level-circular-cards' && tools.design !== 'level-svg-rings' ? (
                  // Both designs always render their own fixed ring regardless of this
                  // setting — they never read levelIndicatorDisplayStyle.
                  <ToolsPreviewCardGrid
                    label="Level display"
                    value={
                      tools.levelIndicatorDisplayStyle ??
                      (tools.design === 'level-bento-categories' ? 'progress-bar' : 'text')
                    }
                    options={PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS.map((option) => ({
                      ...option,
                      glyph:
                        option.value === 'stars'
                          ? toolsLevelDisplayStarsGlyph()
                          : option.value === 'dots'
                            ? toolsLevelDisplayDotsGlyph()
                            : option.value === 'progress-bar'
                              ? toolsLevelDisplayBarGlyph()
                              : toolsLevelDisplayTextGlyph(),
                    }))}
                    onChange={(levelIndicatorDisplayStyle: PortfolioToolsLevelIndicatorDisplayStyle) =>
                      onChange({ levelIndicatorDisplayStyle })
                    }
                  />
                ) : null}
              </>
            ) : null}
            {toolsLevelIndicatorDesignSupportsCardFrame(tools.design) ? (
              <ToolsPreviewCardGrid
                label="Card frame"
                value={tools.levelIndicatorCardStyle ?? 'framed'}
                options={PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS.map((option) => ({
                  ...option,
                  glyph:
                    option.value === 'framed'
                      ? toolsCardFrameFramedGlyph()
                      : toolsCardFramePlainGlyph(),
                }))}
                columns={2}
                onChange={(levelIndicatorCardStyle: PortfolioToolsLevelIndicatorCardStyle) =>
                  onChange({ levelIndicatorCardStyle })
                }
              />
            ) : null}
            {tools.design === 'level-progress-rows' ||
            tools.design === 'level-category-rows' ||
            tools.design === 'level-table-rows' ? (
              <>
                <ToolsOptionGrid
                  label="List alignment"
                  value={tools.levelProgressContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(levelProgressContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ levelProgressContentAlignment })
                  }
                />
                {tools.design === 'level-table-rows' ? null : (
                  <ToolsPreviewCardGrid
                    label="Columns (large screen)"
                    value={String(tools.levelProgressColumnsPerRow ?? 1) as '1' | '2'}
                    options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_COLUMNS_OPTIONS.map((option) => ({
                      ...option,
                      glyph: toolsColumnsGlyph(option.value === '2' ? 2 : 1),
                    }))}
                    columns={2}
                    onChange={(value) =>
                      onChange({
                        levelProgressColumnsPerRow: value === '2' ? 2 : 1,
                      })
                    }
                  />
                )}
                {tools.design === 'level-progress-rows' || tools.design === 'level-category-rows' ? (
                  <ToolsToggleRow
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
              </>
            ) : tools.design === 'level-bento-categories' ? (
              <>
                <ToolsSlider
                  label="Card spacing"
                  value={tools.cardGap ?? 'medium'}
                  options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                  onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
                />
                <ToolsPreviewCardGrid
                  label="Grid layout"
                  value={tools.levelBentoGridMode ?? 'equal'}
                  options={PORTFOLIO_TOOLS_LEVEL_BENTO_GRID_MODE_OPTIONS.map((option) => ({
                    ...option,
                    glyph:
                      option.value === 'asymmetric'
                        ? toolsGridLayoutAsymmetricGlyph()
                        : toolsGridLayoutEqualGlyph(),
                  }))}
                  columns={2}
                  onChange={(levelBentoGridMode: PortfolioToolsLevelBentoGridMode) =>
                    onChange({ levelBentoGridMode })
                  }
                />
                <ToolsOptionGrid
                  label="Content alignment"
                  value={tools.brandCardsContentAlignment ?? 'left'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandCardsContentAlignment })
                  }
                />
              </>
            ) : tools.design === 'level-stat-bars' ? (
              <ToolsSlider
                label="Card spacing"
                value={tools.cardGap ?? 'tight'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
            ) : !isLevelIndicatorDesign ? (
              <ToolsSlider
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
              <ToolsPreviewCardGrid
                label="Bar style"
                value={tools.levelBarStyle ?? 'rectangle'}
                options={PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS.map((option) => ({
                  ...option,
                  glyph:
                    option.value === 'pill'
                      ? toolsBarStylePillGlyph()
                      : option.value === 'pill-gradient'
                        ? toolsBarStyleGradientGlyph()
                        : option.value === 'segments'
                          ? toolsBarStyleSegmentsGlyph()
                          : toolsBarStyleRectangleGlyph(),
                }))}
                onChange={(levelBarStyle: PortfolioToolsLevelBarStyle) => onChange({ levelBarStyle })}
              />
            ) : null}
            {tools.design === 'level-stat-bars' ||
            tools.design === 'level-progress-rows' ||
            tools.design === 'level-category-rows' ||
            tools.design === 'level-circular-cards' ||
            tools.design === 'level-star-cards' ||
            tools.design === 'level-svg-rings' ||
            (tools.design === 'brand-directory' &&
              (tools.brandDirectoryLevelStyle ?? 'tag') === 'stat') ? (
              <ToolsSlider
                label={
                  tools.design === 'level-circular-cards' || tools.design === 'level-svg-rings'
                    ? 'Thickness & % size'
                    : 'Bar & % size'
                }
                value={tools.levelBarSize ?? 'small'}
                options={
                  tools.design === 'level-circular-cards' || tools.design === 'level-svg-rings'
                    ? PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.filter((item) => item.value !== 'tight')
                    : PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS
                }
                onChange={(levelBarSize: PortfolioToolsLevelBarSize) => onChange({ levelBarSize })}
              />
            ) : null}
            {tools.design === 'brand-directory' ? (
              <>
                <ToolsOptionGrid
                  label="Affichage du niveau"
                  value={tools.brandDirectoryLevelStyle ?? 'percentage'}
                  options={PORTFOLIO_TOOLS_BRAND_DIRECTORY_LEVEL_STYLE_OPTIONS}
                  onChange={(brandDirectoryLevelStyle: PortfolioToolsBrandDirectoryLevelStyle) =>
                    onChange({ brandDirectoryLevelStyle })
                  }
                />
                <ToolsPreviewCardGrid
                  label="Colonnes (écran large)"
                  value={String(tools.brandDirectoryColumnsPerRow ?? 1) as '1' | '2' | '3'}
                  options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS.filter(
                    (item) => item.value !== '4'
                  ).map((option) => ({
                    ...option,
                    glyph: toolsColumnsGlyph(Number(option.value) as 1 | 2 | 3),
                  }))}
                  onChange={(value) =>
                    onChange({
                      brandDirectoryColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                    })
                  }
                />
                <ToolsOptionGrid
                  label="Alignement du contenu"
                  value={tools.brandDirectoryContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandDirectoryContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandDirectoryContentAlignment })
                  }
                />
                <ToolsToggleRow
                  label="Pleine largeur"
                  checked={tools.brandDirectoryFullWidth === true}
                  onChange={(brandDirectoryFullWidth) => onChange({ brandDirectoryFullWidth })}
                />
              </>
            ) : null}
            {tools.design === 'brand-cards' ? (
              <>
                <ToolsPreviewCardGrid
                  label="Emplacement de l'icône"
                  value={tools.brandCardsIconPlacement ?? 'top'}
                  options={PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS.map((option) => ({
                    ...option,
                    glyph:
                      option.value === 'top'
                        ? toolsIconPlacementTopGlyph()
                        : toolsIconPlacementLeftGlyph(),
                  }))}
                  columns={2}
                  onChange={(brandCardsIconPlacement: PortfolioToolsBrandCardsIconPlacement) =>
                    onChange({ brandCardsIconPlacement })
                  }
                />
                <ToolsPreviewCardGrid
                  label="Colonnes (écran large)"
                  value={String(tools.brandCardsColumnsPerRow ?? 1) as '1' | '2' | '3'}
                  options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS.filter(
                    (item) => item.value !== '4'
                  ).map((option) => ({
                    ...option,
                    glyph: toolsColumnsGlyph(Number(option.value) as 1 | 2 | 3),
                  }))}
                  onChange={(value) =>
                    onChange({
                      brandCardsColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                    })
                  }
                />
                <ToolsOptionGrid
                  label="Alignement du contenu"
                  value={tools.brandCardsContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandCardsContentAlignment })
                  }
                />
                <ToolsToggleRow
                  label="Pleine largeur"
                  checked={tools.brandCardsFullWidth === true}
                  onChange={(brandCardsFullWidth) => onChange({ brandCardsFullWidth })}
                />
              </>
            ) : null}
            {tools.design === 'level-star-cards' ? (
              <>
                <ToolsSlider
                  label="Card spacing"
                  value={tools.cardGap ?? 'medium'}
                  options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                  onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
                />
                <p className="text-sm text-neutral-500">
                  4 cartes par ligne sur grand écran — pleine largeur.
                </p>
                <ToolsOptionGrid
                  label="Alignement du contenu"
                  value={tools.brandCardsContentAlignment ?? 'left'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandCardsContentAlignment })
                  }
                />
              </>
            ) : tools.design === 'level-circular-cards' || tools.design === 'level-svg-rings' ? (
              <>
                <ToolsPreviewCardGrid
                  label="Colonnes (écran large)"
                  value={String(tools.brandCardsColumnsPerRow ?? 3) as '1' | '2' | '3'}
                  options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS.filter(
                    (item) => item.value !== '4'
                  ).map((option) => ({
                    ...option,
                    glyph: toolsColumnsGlyph(Number(option.value) as 1 | 2 | 3),
                  }))}
                  onChange={(value) =>
                    onChange({
                      brandCardsColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                    })
                  }
                />
                <ToolsOptionGrid
                  label="Alignement du contenu"
                  value={tools.brandCardsContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandCardsContentAlignment })
                  }
                />
              </>
            ) : null}
            {tools.design === 'brand-index' ? (
              <>
                <ToolsOptionGrid
                  label="Alignement du contenu"
                  value={tools.brandIndexContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandIndexContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandIndexContentAlignment })
                  }
                />
                <ToolsToggleRow
                  label="Pleine largeur (1 par ligne)"
                  checked={tools.brandIndexFullWidth !== false}
                  onChange={(brandIndexFullWidth) => onChange({ brandIndexFullWidth })}
                />
                <ToolsToggleRow
                  label="Filtre par catégorie"
                  checked={resolveToolsLevelIndicatorShowCategoryFilter(tools)}
                  onChange={(levelIndicatorShowCategoryFilter) =>
                    onChange({
                      levelIndicatorShowCategoryFilter,
                      levelTableShowCategoryFilter: levelIndicatorShowCategoryFilter,
                    })
                  }
                />
              </>
            ) : null}
            {tools.design === 'brand-row' ? (
              <>
                <ToolsPreviewCardGrid
                  label="Style des cellules"
                  value={tools.brandRowCellStyle ?? 'dividers'}
                  options={PORTFOLIO_TOOLS_BRAND_ROW_CELL_STYLE_OPTIONS.map((option) => ({
                    ...option,
                    glyph:
                      option.value === 'frames'
                        ? toolsCellStyleFramesGlyph()
                        : option.value === 'none'
                          ? toolsCellStyleNoneGlyph()
                          : toolsCellStyleDividersGlyph(),
                  }))}
                  onChange={(brandRowCellStyle: PortfolioToolsBrandRowCellStyle) =>
                    onChange({ brandRowCellStyle })
                  }
                />
                <ToolsPreviewCardGrid
                  label="Colonnes (écran large)"
                  value={String(tools.brandRowColumnsPerRow ?? 3) as '1' | '2' | '3'}
                  options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS.filter(
                    (item) => item.value !== '4'
                  ).map((option) => ({
                    ...option,
                    glyph: toolsColumnsGlyph(Number(option.value) as 1 | 2 | 3),
                  }))}
                  onChange={(value) =>
                    onChange({
                      brandRowColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                    })
                  }
                />
                <ToolsOptionGrid
                  label="Alignement du contenu"
                  value={tools.brandRowContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandRowContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandRowContentAlignment })
                  }
                />
              </>
            ) : null}
            {tools.design === 'brand-float' ? (
              <>
                <ToolsPreviewCardGrid
                  label="Style de carte"
                  value={tools.brandFloatCardStyle ?? 'framed'}
                  options={PORTFOLIO_TOOLS_BRAND_FLOAT_CARD_STYLE_OPTIONS.map((option) => ({
                    ...option,
                    glyph:
                      option.value === 'framed'
                        ? toolsCardFrameFramedGlyph()
                        : toolsCardFramePlainGlyph(),
                  }))}
                  columns={2}
                  onChange={(brandFloatCardStyle: PortfolioToolsBrandFloatCardStyle) =>
                    onChange({ brandFloatCardStyle })
                  }
                />
                <ToolsOptionGrid
                  label="Mode de grille"
                  value={tools.brandFloatGridMode ?? 'fluid'}
                  options={PORTFOLIO_TOOLS_BRAND_FLOAT_GRID_MODE_OPTIONS}
                  onChange={(brandFloatGridMode: PortfolioToolsBrandFloatGridMode) =>
                    onChange({ brandFloatGridMode })
                  }
                />
                {(tools.brandFloatGridMode ?? 'fluid') === 'fluid' ? (
                  <ToolsSlider
                    label="Densité des tuiles"
                    value={tools.brandFloatTileDensity ?? 'comfortable'}
                    options={PORTFOLIO_TOOLS_BRAND_FLOAT_TILE_DENSITY_OPTIONS}
                    onChange={(brandFloatTileDensity: PortfolioToolsBrandFloatTileDensity) =>
                      onChange({ brandFloatTileDensity })
                    }
                  />
                ) : (
                  <ToolsPreviewCardGrid
                    label="Colonnes (écran large)"
                    value={String(tools.brandFloatColumnsPerRow ?? 3) as '2' | '3' | '4'}
                    options={PORTFOLIO_TOOLS_BRAND_FLOAT_COLUMNS_OPTIONS.map((option) => ({
                      ...option,
                      glyph: toolsColumnsGlyph(Number(option.value) as 2 | 3 | 4),
                    }))}
                    onChange={(value) =>
                      onChange({
                        brandFloatColumnsPerRow: value === '4' ? 4 : value === '2' ? 2 : 3,
                      })
                    }
                  />
                )}
                <ToolsOptionGrid
                  label="Alignement du contenu"
                  value={tools.brandFloatContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandFloatContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandFloatContentAlignment })
                  }
                />
              </>
            ) : null}
            {tools.design === 'workflow-rail' ? (
              <ToolsOptionGrid
                label="Alignement du contenu"
                value={tools.workflowRailContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={TOOLS_ALIGNMENT_ICONS}
                onChange={(workflowRailContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ workflowRailContentAlignment })
                }
              />
            ) : null}
          </ToolsLayoutSettingsBand>
        </div>
      ) : null}

      {current === 'header' ? (
        <div className="space-y-4">
          <ToolsHeaderDesignChoiceGrid
            value={tools.headerDesign ?? 'focus'}
            onChange={(headerDesign) => onChange({ headerDesign })}
          />
          <ToolsLayoutSettingsBand motionKey={tools.headerDesign ?? 'focus'} title="Header settings">
            <ToolsOptionGrid
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
                <span className="pf-stack-block-label pf-stack-option-label">Titre personnalisé</span>
                <input
                  type="text"
                  value={tools.titleCustom}
                  onChange={(event) => onChange({ titleCustom: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
                  placeholder="Workflow & Tools"
                />
              </label>
            ) : null}
            <ToolsOptionGrid
              label="Alignement du titre"
              value={tools.headerAlignment}
              options={PORTFOLIO_TOOLS_HEADER_ALIGNMENT_OPTIONS}
              icons={TOOLS_ALIGNMENT_ICONS}
              onChange={(headerAlignment) => onChange({ headerAlignment })}
            />
            <ToolsOptionGrid
              label="Sous-titre"
              value={tools.subtitlePreset ?? 'none'}
              options={PORTFOLIO_TOOLS_SUBTITLE_PRESET_OPTIONS}
              onChange={(subtitlePreset: PortfolioToolsSubtitlePreset) => onChange({ subtitlePreset })}
            />
            {tools.subtitlePreset === 'custom' ? (
              <label className="block">
                <span className="pf-stack-block-label pf-stack-option-label">Texte du sous-titre</span>
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
            <ToolsSlider
              label="Espacement sous le header"
              value={tools.headerBottomSpacing ?? 'medium'}
              options={PORTFOLIO_TOOLS_HEADER_BOTTOM_SPACING_OPTIONS}
              onChange={(headerBottomSpacing) => onChange({ headerBottomSpacing })}
            />
          </ToolsLayoutSettingsBand>
        </div>
      ) : null}

      {current === 'background' ? (
        <div className="space-y-4">
          <SectionBackgroundSettingsFields
            settings={tools}
            onChange={onChange}
            renderColorField={({ label, value }) => (
              <ToolsBackgroundColorField
                tools={tools}
                onChange={onChange}
                palette={palette}
                bindings={bindings}
                label={label}
                value={value}
              />
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
