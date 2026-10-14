'use client';

import { useId, useState, type ReactNode } from 'react';
import {
  PortfolioDesignLivePreviewCard,
  usePortfolioDesignPreviewSource,
} from '@/components/portfolio/PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import {
  PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_ROW_CELL_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_FLOAT_GRID_MODE_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_FLOAT_TILE_DENSITY_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_FLOAT_COLUMNS_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_FLOAT_CARD_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_DIRECTORY_LEVEL_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_CARD_GAP_OPTIONS,
  PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS,
  PORTFOLIO_TOOLS_DESIGN_OPTIONS,
  PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_PROGRESS_COLUMNS_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_BENTO_GRID_MODE_OPTIONS,
  PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS,
  PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS,
  TOOLS_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  TOOLS_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  TOOLS_HEADER_PALETTE_TOKEN_OPTIONS,
  toolsHeaderPaletteTokenColor,
  type PortfolioToolsDesign,
  type PortfolioToolsBrandCardsIconPlacement,
  type PortfolioToolsBrandDirectoryLevelStyle,
  type PortfolioToolsBrandRowCellStyle,
  type PortfolioToolsBrandFloatGridMode,
  type PortfolioToolsBrandFloatTileDensity,
  type PortfolioToolsBrandFloatCardStyle,
  type PortfolioToolsCardGap,
  type PortfolioToolsContentAlignment,
  type PortfolioToolsHeaderAccentCountAlignment,
  type PortfolioToolsHeaderBillboardWordStyle,
  type PortfolioToolsHeaderDesign,
  type PortfolioToolsHeaderDesignAlignment,
  type PortfolioToolsLevelProgressRowGap,
  type PortfolioToolsLevelBarStyle,
  type PortfolioToolsLevelBarSize,
  type PortfolioToolsLevelIndicatorDisplayStyle,
  type PortfolioToolsLevelIndicatorCardStyle,
  type PortfolioToolsLevelBentoGridMode,
  type PortfolioToolsLevelTableGroupBy,
  type PortfolioToolsSectionSettings,
  type PortfolioToolsTileSize,
  resolveToolsIconBackgroundEnabled,
  resolveToolsLevelIndicatorFullWidth,
  resolveToolsLevelIndicatorShowCategoryFilter,
  resolveToolsShowLevel,
  toolsDesignSettingsPatch,
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
import { PortfolioHeaderDesignOption } from '@/components/portfolio/portfolio-header-design-lock';
import {
  HEADER_SIZE_STEPS,
  HEADER_WEIGHT_STEPS,
  HeaderBlock,
  HeaderElementToggles,
  HeaderMarqueeWords,
  HeaderOptionGrid,
  HeaderStyleTargetsEditor,
  HeaderSteppedSlider,
  HeaderTextField,
  HeaderTextStyleEditor,
  type HeaderPatch,
} from '@/components/portfolio/portfolio-header-style-controls';
import { SettingRow, SettingsRowsScope, useSettingsRows } from '@/components/portfolio/portfolio-settings-rows';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { SectionHiddenNotice, SettingsGroup, SettingsSwitchRow, SettingsTabs } from '@/components/portfolio/portfolio-settings-ui';

/** Same general / design / header mechanism as the Stack section settings panel, plus its own Background tab. */
export type ToolsSubSection = 'general' | 'design' | 'header' | 'background';

const SUBSECTIONS: { value: ToolsSubSection; label: string }[] = [
  { value: 'general', label: msg('General') },
  { value: 'design', label: msg('Design') },
  { value: 'header', label: msg('Header') },
  { value: 'background', label: msg('Background') },
];

export function normalizeToolsSubSection(value: string | undefined): ToolsSubSection {
  return SUBSECTIONS.some((item) => item.value === value) ? (value as ToolsSubSection) : 'design';
}


/** Curated 3-option quick palette for Name / Description text colors — separate from the full 8-token dropdown. */
const TOOLS_QUICK_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'principal', label: msg('Primary') },
  { value: 'texteFort', label: msg('Strong text') },
  { value: 'texteMuted', label: msg('Muted text') },
];

/** For section-background-style fields (fill, gradient stops, split zones) — "fond"/"neutre"
 *  fit that context better than "texte fort", which is why this isn't just TOOLS_QUICK_PALETTE_TOKENS. */
const TOOLS_BACKGROUND_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: msg('Background') },
  { value: 'neutre', label: msg('Neutral') },
  { value: 'principal', label: msg('Primary') },
  { value: 'texteMuted', label: msg('Muted text') },
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
  const t = useT();
  return (
    <div>
      <span className="pf-stack-block-label">{label}</span>
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
              title={t(token.label)}
              aria-label={t(token.label)}
              aria-pressed={active}
              onClick={() => onPickToken(token.value)}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className="h-8 w-8 rounded-full border-2 transition"
                style={{
                  backgroundColor: hex,
                  borderColor: active ? 'var(--pf-palette-texte-fort)' : 'var(--pf-palette-bordure)',
                  boxShadow: active ? '0 0 0 2px color-mix(in srgb, var(--pf-palette-texte-fort) 18%, transparent)' : 'none',
                }}
              />
              <span
                className={`text-[11px] font-medium ${active ? 'text-[color:var(--pf-palette-texte-fort)]' : 'text-[color:var(--pf-palette-texte-muted)]'}`}
              >
                {t(token.label)}
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
    <SettingRow label={label} value={typeof value === 'string' && value.startsWith('#') ? value.toUpperCase() : String(value ?? '')}>
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
    </SettingRow>
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
      {active ? (
        <span
          aria-hidden
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--pf-palette-principal, #f97316)' }}
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5">
            <path
              d="M4 10.5l3.5 3.5L16 6"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : null}
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
  const t = useT();
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
            {t('CSS')}
          </ToolsMiniType>
          <circle className="pf-stack-mini-ring" cx="60" cy="32" r="16" strokeWidth={3} />
          <ToolsMiniType x={60} y={34} size={6} anchor="middle">
            {t('JS')}
          </ToolsMiniType>
          <circle className="pf-stack-mini-ring" cx="96" cy="32" r="16" strokeWidth={3} />
          <ToolsMiniType x={96} y={34} size={6} anchor="middle">
            {t('GO')}
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
  info,
  checked,
  onChange,
}: {
  label: string;
  /** Non-obvious info (where to find something, hidden behavior) shown as a hover/focus tooltip. */
  info?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const rows = useSettingsRows();
  if (rows) return <SettingRow label={label} toggle={{ checked, onChange }} />;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer flex-col gap-1 text-left"
    >
      <span className="flex items-center justify-between gap-4">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{label}</span>
          {info ? <ToolsInfoTooltip text={info} /> : null}
        </span>
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
  const t = useT();
  const rows = useSettingsRows();
  const count = options.length;
  const cols = columns ?? (count <= 4 ? Math.max(count, 1) : 2);
  const compact = cols === count && count >= 2 && count <= 5;
  return (
    <SettingRow label={label} value={String(options.find((option) => option.value === value)?.label ?? '')}>
    <div>
      {rows ? null : (<p className="pf-stack-block-label pf-stack-option-label">{label}</p>)}
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
              title={t(option.description)}
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
              <span>{t(option.label)}</span>
            </button>
          );
        })}
      </div>
    </div>
    </SettingRow>
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
  const t = useT();
  const rows = useSettingsRows();
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const lastIndex = options.length - 1;
  const percent = lastIndex > 0 ? (index / lastIndex) * 100 : 0;
  const current = options[index] ?? options[0];
  return (
    <SettingRow label={label} value={String(options.find((option) => option.value === value)?.label ?? '')}>
    <div>
      {rows ? null : (<div className="pf-stack-slider-row">
        <span className="pf-stack-slider-label">{label}</span>
        <span className="pf-stack-slider-value">{t(current?.label)}</span>
      </div>)}
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
    </SettingRow>
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
  const t = useT();
  const rows = useSettingsRows();
  const cols = columns ?? Math.min(options.length, 4);
  return (
    <SettingRow label={label} value={String(options.find((option) => option.value === value)?.label ?? '')}>
    <div>
      {rows ? null : (<p className="pf-stack-block-label pf-stack-option-label">{label}</p>)}
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
            label={t(option.label)}
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
    </SettingRow>
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

/** Collapsed-state row shared by every design/header choice grid: a compact scaled-down
 *  thumbnail, the selected design's name, and a trailing chevron — the whole row opens the
 *  grid. The thumbnail wraps whatever wireframe is passed (sized for a full-width card) in a
 *  fixed 128×80 box and scales it down, instead of the old wide preview box that left a lot of
 *  empty space on both sides of the much narrower mini-schema it centered. */
function ToolsDesignSummaryRow({
  label,
  name,
  onOpen,
  children,
}: {
  label: string;
  name: string;
  onOpen: () => void;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-stack-block-label">{label}</p>
      <button
        type="button"
        onClick={onOpen}
        aria-label={t('Change {toLowerCase}', { toLowerCase: label.toLowerCase() })}
        className="flex w-full items-center gap-3 rounded-2xl border border-[color:var(--pf-palette-bordure)] px-3 py-2.5 text-left transition hover:border-[color:var(--pf-palette-texte-muted)]"
      >
        <span className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent">
          <span className="flex w-[116px] shrink-0 origin-center scale-[1.05] items-center justify-center">
            {children}
          </span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{name}</span>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[color:var(--pf-palette-texte-muted)]" aria-hidden>
          <path
            d="M7.5 4.5l5 5.5-5 5.5"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function ToolsDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioToolsDesign;
  onChange: (value: PortfolioToolsDesign) => void;
}) {
  const t = useT();
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_TOOLS_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_TOOLS_DESIGN_OPTIONS[0];
  const previewSource = usePortfolioDesignPreviewSource();

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-stack-block-label !mb-0">{t('Design')}</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-[color:var(--pf-palette-texte-muted)] hover:text-[color:var(--pf-palette-texte-fort)]"
          >
            {t('← Back')}
          </button>
        </div>
        {previewSource ? (
          /* In the studio: every design rendered for real, one per row. */
          <div className="mt-3 flex flex-col gap-3">
            {PORTFOLIO_TOOLS_DESIGN_OPTIONS.map((option) => (
              <PortfolioDesignLivePreviewCard
                key={option.value}
                cardClassName="pf-stack-design-card"
                labelClassName="pf-stack-card-label"
                active={option.value === value}
                label={t(option.label)}
                src={withDesignPreview(previewSource.portfolioPath, { section: 'tools', design: option.value })}
                settings={previewSource.settings}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              />
            ))}
          </div>
        ) : (
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_TOOLS_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <ToolsPickerCard
                key={option.value}
                active={active}
                label={t(option.label)}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <ToolsDesignWireframe design={option.value} />
              </ToolsPickerCard>
            );
          })}
        </div>
        )}
      </div>
    );
  }

  return (
    <ToolsDesignSummaryRow label={t('Design')} name={selected.label} onOpen={() => setShowGrid(true)}>
      <ToolsDesignWireframe design={value} />
    </ToolsDesignSummaryRow>
  );
}

/** Mini wireframes for the 4 Header design picker cards — same ToolsMiniSlide mechanism as Design. */
/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus
 *  instead of a permanent line of text under a toggle. */
function ToolsInfoTooltip({ text }: { text: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex shrink-0">
      {/* `span` not `button` — this can sit inside ToolsToggleRow's own <button>,
       *  and a <button> can never nest another <button> (invalid HTML / hydration error). */}
      <span
        role="button"
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={t('More info: {text}', { text })}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => event.stopPropagation()}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[color:var(--pf-palette-texte-muted)] transition hover:text-[color:var(--pf-palette-texte-fort)] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      >
        <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6.1" stroke="currentColor" strokeWidth="1.15" />
          <circle cx="7" cy="4.35" r="0.95" fill="currentColor" />
          <rect x="6.3" y="6.05" width="1.4" height="4.4" rx="0.7" fill="currentColor" />
        </svg>
      </span>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium leading-snug text-white shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

/** Mini wireframes for the 8 Header design picker cards — same ToolsMiniSlide mechanism as Design. */
function ToolsHeaderDesignWireframe({ design }: { design: PortfolioToolsHeaderDesign }) {
  const t = useT();
  switch (design) {
    case 'editorial':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="16" width="18" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="26" width="64" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="42" width="46" height="4" rx="2" />
        </ToolsMiniSlide>
      );
    case 'marquee':
      return (
        <ToolsMiniSlide>
          <text
            x="60"
            y="34"
            fontSize={22}
            fontWeight={800}
            textAnchor="middle"
            opacity={0.14}
            className="pf-stack-mini-ink"
          >
            {t('TOOLS')}
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="84" height="10" rx="2" />
        </ToolsMiniSlide>
      );
    case 'index':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="4" height="4" />
          <rect className="pf-stack-mini-mute" x="20" y="13" width="90" height="1" />
          <ToolsMiniType x={10} y={40} size={22}>
            04
          </ToolsMiniType>
          <rect className="pf-stack-mini-mute" x="46" y="22" width="1" height="18" />
          <rect className="pf-stack-mini-ink" x="54" y="24" width="46" height="7" rx="2" />
        </ToolsMiniSlide>
      );
    case 'accent-count':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="12" width="26" height="8" rx="4" />
          <rect className="pf-stack-mini-mute" x="10" y="26" width="40" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="33" width="60" height="7" rx="2" />
        </ToolsMiniSlide>
      );
    case 'serif-lead':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="14" width="20" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="24" width="76" height="11" rx="2" />
        </ToolsMiniSlide>
      );
    case 'billboard':
      return (
        <ToolsMiniSlide>
          <text
            x="60"
            y="30"
            fontSize={26}
            fontWeight={900}
            textAnchor="middle"
            opacity={0.1}
            className="pf-stack-mini-ink"
          >
            {t('TOOLS')}
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="60" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="18" y="42" width="40" height="3" rx="1.5" />
        </ToolsMiniSlide>
      );
    case 'masthead':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="100" height="1" />
          <rect className="pf-stack-mini-ink" x="10" y="20" width="100" height="12" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="38" width="100" height="1" />
        </ToolsMiniSlide>
      );
    case 'split-heading':
      return (
        <ToolsMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="20" width="58" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="86" y="18" width="24" height="3" rx="1.5" />
        </ToolsMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Same collapsed-preview / expand-to-grid mechanism as Design above and Hero > Design Banner. */
function ToolsHeaderDesignChoiceGrid({
  value,
  onChange,
  open: showGrid,
  onOpenChange: setShowGrid,
}: {
  value: PortfolioToolsHeaderDesign;
  onChange: (value: PortfolioToolsHeaderDesign) => void;
  /** Whether the catalog of designs is open (owned by the panel so it can hide the settings below). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const selected =
    PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-stack-block-label !mb-0">{t('Header design')}</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-[color:var(--pf-palette-texte-muted)] hover:text-[color:var(--pf-palette-texte-fort)]"
          >
            {t('← Back')}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <PortfolioHeaderDesignOption key={option.value} design={option.value}>
                <ToolsPickerCard
                  active={active}
                  label={t(option.label)}
                  onClick={() => {
                    onChange(option.value);
                    setShowGrid(false);
                  }}
                >
                  <ToolsHeaderDesignWireframe design={option.value} />
                </ToolsPickerCard>
              </PortfolioHeaderDesignOption>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <ToolsDesignSummaryRow label={t('Header design')} name={selected.label} onOpen={() => setShowGrid(true)}>
      <ToolsHeaderDesignWireframe design={value} />
    </ToolsDesignSummaryRow>
  );
}

const TOOLS_HEADER_MARGIN_BOTTOM_OPTIONS = [
  { value: 'sm' as const, label: msg('Small') },
  { value: 'md' as const, label: msg('Medium') },
  { value: 'lg' as const, label: msg('Large') },
  { value: 'xl' as const, label: 'XL' },
];

/** Shared across every header design — alignment, bottom spacing, (title size / weight) and motion.
 *  `hideAlignment`/`hideTitleControls` drop controls a given design doesn't actually consume —
 *  dead controls left visible are confusing. */
function ToolsHeaderSharedAdvancedControls({
  tools,
  onChange,
  hideAlignment = false,
  hideTitleControls = false,
}: {
  tools: PortfolioToolsSectionSettings;
  onChange: (patch: Partial<PortfolioToolsSectionSettings>) => void;
  hideAlignment?: boolean;
  hideTitleControls?: boolean;
}) {
  const t = useT();
  const titleSize = tools.headerTitleSize ?? 'md';
  const titleWeight = tools.headerTitleWeight ?? 'regular';
  return (
    <div className="pf-exp-centered-config space-y-8 border-t border-[color:var(--pf-palette-bordure)] pt-9">
      {hideAlignment ? null : (
        <HeaderOptionGrid
          label={t('Header alignment')}
          options={[
            { value: 'left' as const, label: t('Left') },
            { value: 'center' as const, label: t('Center') },
            { value: 'right' as const, label: t('Right') },
          ]}
          value={tools.headerDesignAlignment}
          onChange={(headerDesignAlignment: PortfolioToolsHeaderDesignAlignment) => onChange({ headerDesignAlignment })}
          columns={3}
        />
      )}
      <HeaderOptionGrid
        label={t('Bottom spacing')}
        options={TOOLS_HEADER_MARGIN_BOTTOM_OPTIONS}
        value={tools.headerMarginBottom ?? 'md'}
        onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
        columns={4}
      />
      {hideTitleControls ? null : (
        <>
          <HeaderSteppedSlider
            label={t('Title size')}
            steps={HEADER_SIZE_STEPS}
            value={titleSize}
            currentName={HEADER_SIZE_STEPS.find((step) => step.value === titleSize)?.name ?? ''}
            onChange={(headerTitleSize) => onChange({ headerTitleSize })}
          />
          <HeaderSteppedSlider
            label={t('Title weight')}
            steps={HEADER_WEIGHT_STEPS}
            value={titleWeight}
            currentName={HEADER_WEIGHT_STEPS.find((step) => step.value === titleWeight)?.tick ?? ''}
            onChange={(headerTitleWeight) => onChange({ headerTitleWeight })}
            stepStyle={(step) => ({ fontWeight: HEADER_WEIGHT_STEPS.find((item) => item.value === step.value)?.css })}
          />
        </>
      )}
    </div>
  );
}

function ToolsLayoutSettingsBand({
  children,
  motionKey,
  title = 'Design settings',
  flush = false,
}: {
  children: ReactNode;
  motionKey: string;
  title?: string;
  /** Drops the boxed frame so the fields use the dock's full width. */
  flush?: boolean;
}) {
  return (
    <section
      className={`pf-stack-layout-settings${flush ? ' pf-stack-layout-settings--flush' : ''}`}
      aria-labelledby="tools-layout-settings-title"
    >
      <h3 id="tools-layout-settings-title" className="pf-stack-layout-settings-title">
        {title}
      </h3>
      <div key={motionKey} className={`pf-stack-layout-settings-body ${flush ? 'space-y-9' : 'space-y-6'}`}>
        {children}
      </div>
    </section>
  );
}

/**
 * The Header tab's per-design fields: the design's texts first, then one style editor (pick the text,
 * set only the color / size / weight it has), then the controls every design shares.
 */
function ToolsHeaderDesignFields({
  tools,
  onChange,
}: {
  tools: PortfolioToolsSectionSettings;
  onChange: (patch: Partial<PortfolioToolsSectionSettings>) => void;
}) {
  const t = useT();
  const design = tools.headerDesign ?? 'editorial';
  const onPatch = (patch: HeaderPatch) => onChange(patch as Partial<PortfolioToolsSectionSettings>);
  const colorProps = { colorOptions: TOOLS_HEADER_PALETTE_TOKEN_OPTIONS, resolveColor: toolsHeaderPaletteTokenColor };
  const shared = (opts?: { hideAlignment?: boolean; hideTitleControls?: boolean }) => (
    <ToolsHeaderSharedAdvancedControls tools={tools} onChange={onChange} {...opts} />
  );

  if (design === 'index') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField
            label={t('Rule label')}
            value={tools.headerIndexLabelText}
            placeholder={t('Index')}
            onChange={(headerIndexLabelText) => onChange({ headerIndexLabelText })}
          />
          <HeaderTextField
            label={t('Title')}
            value={tools.headerIndexTitleText}
            placeholder={t('Daily workflow')}
            onChange={(headerIndexTitleText) => onChange({ headerIndexTitleText })}
          />
          <HeaderTextField
            label={t('Subtitle')}
            value={tools.headerIndexSubtitleText}
            placeholder={t('Apps and platforms I rely on daily.')}
            onChange={(headerIndexSubtitleText) => onChange({ headerIndexSubtitleText })}
            multiline
          />
          <HeaderTextField
            label={t('Count label')}
            value={tools.headerIndexCountLabelText}
            placeholder={t('Tools')}
            onChange={(headerIndexCountLabelText) => onChange({ headerIndexCountLabelText })}
          />
        </div>
        <HeaderBlock>
          <HeaderElementToggles design={design} settings={tools} onPatch={onPatch} />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderTextStyleEditor settings={tools} onPatch={onPatch} prefix="headerIndex" {...colorProps} />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={tools}
            onPatch={onPatch}
            title={t('Counter')}
            targets={[
              { id: 'numeral', label: t('Numeral'), color: { key: 'headerIndexNumberColor', fallback: 'principal' } },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideTitleControls: true })}
      </>
    );
  }

  if (design === 'marquee') {
    return (
      <>
        <HeaderMarqueeWords
          settings={tools}
          onPatch={onPatch}
          keys={['headerMarqueeWord1Text', 'headerMarqueeWord2Text', 'headerMarqueeWord3Text', 'headerMarqueeWord4Text']}
          placeholders={['Tools', 'Optional', 'Optional', 'Optional']}
        />
        <HeaderBlock>
          <HeaderElementToggles design={design} settings={tools} onPatch={onPatch} />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={tools}
            onPatch={onPatch}
            targets={[
              {
                id: 'words',
                label: t('Words'),
                color: { key: 'headerMarqueeWordColor', fallback: 'principal' },
                size: { key: 'headerMarqueeSize', fallback: 'md' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideAlignment: true, hideTitleControls: true })}
      </>
    );
  }

  if (design === 'accent-count') {
    const size = tools.headerAccentCountSize ?? 'md';
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField
            label={t('Badge text')}
            value={tools.headerAccentCountBadgeText}
            placeholder={t('{count}+ tools')}
            onChange={(headerAccentCountBadgeText) => onChange({ headerAccentCountBadgeText })}
          />
          <HeaderTextField
            label={t('Lead text')}
            value={tools.headerAccentCountLeadText}
            placeholder={t('A curated set of apps that keep me productive.')}
            onChange={(headerAccentCountLeadText) => onChange({ headerAccentCountLeadText })}
            multiline
          />
        </div>
        <HeaderBlock>
          <HeaderElementToggles design={design} settings={tools} onPatch={onPatch} />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={tools}
            onPatch={onPatch}
            initialId="lead"
            targets={[
              { id: 'badge', label: t('Badge'), color: { key: 'headerAccentCountBadgeColor', fallback: 'principal' } },
              {
                id: 'lead',
                label: t('Lead'),
                color: { key: 'headerAccentCountLeadColor', fallback: 'secondaire' },
                weight: { key: 'headerAccentCountWeight', fallback: 'regular' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        <HeaderBlock>
          <div className="pf-exp-centered-config space-y-8">
            <HeaderSteppedSlider
              label={t('Size (badge and lead)')}
              steps={HEADER_SIZE_STEPS}
              value={size}
              currentName={HEADER_SIZE_STEPS.find((step) => step.value === size)?.name ?? ''}
              onChange={(headerAccentCountSize) => onChange({ headerAccentCountSize })}
            />
            <HeaderOptionGrid
              label={t('Alignment')}
              options={TOOLS_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
              value={tools.headerAccentCountAlignment ?? 'left'}
              onChange={(headerAccentCountAlignment: PortfolioToolsHeaderAccentCountAlignment) =>
                onChange({ headerAccentCountAlignment })
              }
              columns={3}
            />
          </div>
        </HeaderBlock>
        {shared({ hideAlignment: true, hideTitleControls: true })}
      </>
    );
  }

  if (design === 'serif-lead') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField
            label={t('Label')}
            value={tools.headerSerifLeadLabelText}
            placeholder={t('Tools')}
            onChange={(headerSerifLeadLabelText) => onChange({ headerSerifLeadLabelText })}
          />
          <HeaderTextField
            label={t('Title')}
            value={tools.headerSerifLeadTitleText}
            placeholder={t('A curated set of apps, platforms, and daily tools.')}
            onChange={(headerSerifLeadTitleText) => onChange({ headerSerifLeadTitleText })}
            multiline
          />
          <HeaderTextField
            label={t('Subtitle')}
            value={tools.headerSerifLeadSubtitleText}
            placeholder={t('Apps and platforms I rely on daily.')}
            onChange={(headerSerifLeadSubtitleText) => onChange({ headerSerifLeadSubtitleText })}
            multiline
          />
        </div>
        <HeaderBlock>
          <HeaderElementToggles design={design} settings={tools} onPatch={onPatch} />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderTextStyleEditor settings={tools} onPatch={onPatch} prefix="headerSerifLead" {...colorProps} />
        </HeaderBlock>
        {shared({ hideTitleControls: true })}
      </>
    );
  }

  if (design === 'billboard') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField
            label={t('Big background word')}
            value={tools.headerBillboardBigWord}
            placeholder="TOOLS"
            onChange={(headerBillboardBigWord) => onChange({ headerBillboardBigWord })}
          />
          <HeaderTextField
            label={t('Title')}
            value={tools.headerBillboardTitleText}
            placeholder={t('Daily workflow')}
            onChange={(headerBillboardTitleText) => onChange({ headerBillboardTitleText })}
          />
          <HeaderTextField
            label={t('Count line')}
            value={tools.headerBillboardCountText}
            placeholder={t('{count} tools')}
            onChange={(headerBillboardCountText) => onChange({ headerBillboardCountText })}
          />
        </div>
        <HeaderBlock>
          <HeaderElementToggles design={design} settings={tools} onPatch={onPatch} />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={tools}
            onPatch={onPatch}
            initialId="title"
            targets={[
              { id: 'word', label: t('Big word'), color: { key: 'headerBillboardWordColor', fallback: 'principal' } },
              { id: 'title', label: t('Title'), color: { key: 'headerBillboardTitleColor', fallback: 'principal' } },
              { id: 'count', label: t('Count line'), color: { key: 'headerBillboardMetaColor', fallback: 'secondaire' } },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderOptionGrid
            label={t('Big word style')}
            options={TOOLS_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
            value={tools.headerBillboardWordStyle ?? 'outline'}
            onChange={(headerBillboardWordStyle: PortfolioToolsHeaderBillboardWordStyle) =>
              onChange({ headerBillboardWordStyle })
            }
            columns={3}
          />
        </HeaderBlock>
        {shared({ hideAlignment: true, hideTitleControls: true })}
      </>
    );
  }

  if (design === 'masthead') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField
            label={t('Line 1')}
            value={tools.headerMastheadLine1Text}
            placeholder={t('Daily tools.')}
            onChange={(headerMastheadLine1Text) => onChange({ headerMastheadLine1Text })}
          />
          <HeaderTextField
            label={t('Line 2')}
            value={tools.headerMastheadLine2Text}
            placeholder={t('Chosen with intent.')}
            onChange={(headerMastheadLine2Text) => onChange({ headerMastheadLine2Text })}
          />
          <HeaderTextField
            label={t('Line 3')}
            value={tools.headerMastheadLine3Text}
            placeholder={t('Kept up to date.')}
            onChange={(headerMastheadLine3Text) => onChange({ headerMastheadLine3Text })}
          />
        </div>
        <HeaderBlock>
          <HeaderElementToggles design={design} settings={tools} onPatch={onPatch} />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={tools}
            onPatch={onPatch}
            title={t('Headline style')}
            targets={[
              {
                id: 'headline',
                label: t('Headline'),
                color: { key: 'headerMastheadHeadlineColor', fallback: 'principal' },
                size: { key: 'headerMastheadHeadlineSize', fallback: 'md' },
                weight: { key: 'headerMastheadHeadlineWeight', fallback: 'regular' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideTitleControls: true })}
      </>
    );
  }

  if (design === 'split-heading') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField
            label={t('Title')}
            value={tools.headerSplitHeadingTitleText}
            placeholder={t('Daily workflow')}
            onChange={(headerSplitHeadingTitleText) => onChange({ headerSplitHeadingTitleText })}
          />
          <HeaderTextField
            label={t('Label')}
            value={tools.headerSplitHeadingLabelText}
            placeholder={t('Tools')}
            onChange={(headerSplitHeadingLabelText) => onChange({ headerSplitHeadingLabelText })}
          />
        </div>
        <HeaderBlock>
          <HeaderElementToggles design={design} settings={tools} onPatch={onPatch} />
        </HeaderBlock>
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={tools}
            onPatch={onPatch}
            initialId="title"
            targets={[
              {
                id: 'title',
                label: t('Title'),
                color: { key: 'headerSplitHeadingTitleColor', fallback: 'principal' },
                size: { key: 'headerSplitHeadingTitleSize', fallback: 'md' },
                weight: { key: 'headerSplitHeadingTitleWeight', fallback: 'regular' },
              },
              {
                id: 'label',
                label: t('Label'),
                color: { key: 'headerSplitHeadingLabelColor', fallback: 'secondaire' },
                size: { key: 'headerSplitHeadingLabelSize', fallback: 'md' },
                weight: { key: 'headerSplitHeadingLabelWeight', fallback: 'regular' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideAlignment: true, hideTitleControls: true })}
      </>
    );
  }

  // Editorial — kicker + title + subtitle. An empty text falls back to "Tools" / the section title / the section subtitle.
  return (
    <>
      <div className="space-y-6">
        <HeaderTextField
          label={t('Label')}
          value={tools.headerEditorialLabelText}
          placeholder={t('Tools')}
          onChange={(headerEditorialLabelText) => onChange({ headerEditorialLabelText })}
        />
        <HeaderTextField
          label={t('Title')}
          value={tools.headerEditorialTitleText}
          placeholder={t('Daily workflow')}
          onChange={(headerEditorialTitleText) => onChange({ headerEditorialTitleText })}
        />
        <HeaderTextField
          label={t('Subtitle')}
          value={tools.headerEditorialSubtitleText}
          placeholder={t('Apps and platforms I rely on daily.')}
          onChange={(headerEditorialSubtitleText) => onChange({ headerEditorialSubtitleText })}
          multiline
        />
      </div>
      <HeaderBlock>
        <HeaderElementToggles design={design} settings={tools} onPatch={onPatch} />
      </HeaderBlock>
      <HeaderBlock>
        <HeaderTextStyleEditor settings={tools} onPatch={onPatch} prefix="headerEditorial" {...colorProps} />
      </HeaderBlock>
      {shared({ hideTitleControls: true })}
    </>
  );
}

function handleToolsDesignChange(
  tools: PortfolioToolsSectionSettings,
  design: PortfolioToolsDesign,
  onChange: (patch: Partial<PortfolioToolsSectionSettings>) => void
) {
  onChange(toolsDesignSettingsPatch(tools, design));
}

type ToolsSettingsPanelProps = {
  tools: PortfolioToolsSectionSettings;
  onChange: (patch: Partial<PortfolioToolsSectionSettings>) => void;
  subSection?: ToolsSubSection;
  onSubSectionChange?: (value: ToolsSubSection) => void;
  designOptions?: { value: PortfolioToolsDesign; label: string; description: string }[];
  designOptionsFilter?: (design: PortfolioToolsDesign) => boolean;
  sectionToggleLabel?: string;
};

export function ToolsSettingsPanel({
  tools,
  onChange,
  subSection = 'design',
  onSubSectionChange,
  designOptions: designOptionsProp,
  designOptionsFilter,
  sectionToggleLabel,
}: ToolsSettingsPanelProps) {
  const t = useT();
  const palette = mergeToolsPalette(DEFAULT_TOOLS_PALETTE, tools.toolsPalette);
  const bindings = mergeToolsColorBindings(DEFAULT_TOOLS_COLOR_BINDINGS, tools.toolsColorBindings);
  const current = normalizeToolsSubSection(subSection);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(false);
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

  return (
    <div className="space-y-6">
      <SettingsTabs tabs={SUBSECTIONS.map((item) => ({ id: item.value, label: item.label }))} value={current} onChange={(value) => onSubSectionChange?.(value)} />

      {current === 'general' ? (
        <div className="space-y-4">
          <SettingsSwitchRow
            label={sectionToggleLabel ?? t('Show section')}
            description={tools.enabled ? undefined : t('Visitors go straight to the next section.')}
            checked={tools.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          {tools.enabled ? (
          <SettingsGroup label={t('Content shown')}>
            <ToolsToggleRow
              label={
                isLevelIndicatorDesign
                  ? t('Show the name')
                  : isRichToolsDesign
                    ? t('Show the name')
                    : t('Show the name under the logo')
              }
              checked={tools.showLabels !== false}
              onChange={(showLabels) => onChange({ showLabels })}
            />
            <ToolsToggleRow
              label={t('Show the icon background')}
              checked={resolveToolsIconBackgroundEnabled(tools)}
              onChange={(iconBackgroundEnabled) =>
                onChange({ iconBackgroundEnabled, iconBackgroundOptIn: true })
              }
            />
            <ToolsToggleRow
              label={t('Black & white logos')}
              checked={tools.logosGrayscale === true}
              onChange={(logosGrayscale) => onChange({ logosGrayscale })}
            />
            {isRichToolsDesign ? (
              <>
                <ToolsToggleRow
                  label={t('Show the description')}
                  checked={tools.showDescription !== false}
                  onChange={(showDescription) => onChange({ showDescription })}
                />
                <ToolsToggleRow
                  label={t('Show use cases')}
                  checked={tools.showUseCases !== false}
                  onChange={(showUseCases) => onChange({ showUseCases })}
                />
                {tools.design !== 'brand-index' ? (
                  <ToolsToggleRow
                    label={t('Show the level')}
                    checked={resolveToolsShowLevel(tools)}
                    onChange={(showLevel) => onChange({ showLevel, showLevelOptIn: showLevel })}
                  />
                ) : null}
              </>
            ) : isLevelIndicatorDesign ? (
              <ToolsToggleRow
                label={t('Show the level indicator')}
                checked={resolveToolsShowLevel(tools)}
                onChange={(showLevel) => onChange({ showLevel, showLevelOptIn: showLevel })}
              />
            ) : null}
          </SettingsGroup>
          ) : null}
        </div>
      ) : null}

      {current !== 'general' && !tools.enabled ? <SectionHiddenNotice onEnable={() => onChange({ enabled: true })} /> : null}

      {current === 'design' && tools.enabled ? (
        <div className="space-y-4">
          {designOptions.length > 1 ? (
            <ToolsDesignChoiceGrid
              value={tools.design}
              onChange={(design) => handleToolsDesignChange(tools, design, onChange)}
            />
          ) : null}
          <SettingsGroup label={t('Style')}>
            <SectionColorModeControl
              label={t('Color mode')}
              value={tools.colorModeOverride}
              onChange={(colorModeOverride) => onChange({ colorModeOverride })}
            />
          </SettingsGroup>
          <ToolsLayoutSettingsBand motionKey={tools.design}>
<SettingsRowsScope title={t('Layout options')}>
            <ToolsSlider
              label={t('Logo size')}
              value={tools.tileSize}
              options={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS}
              onChange={(tileSize: PortfolioToolsTileSize) => onChange({ tileSize })}
            />
            {isLevelIndicatorDesign ? (
              <>
                {tools.design !== 'level-star-cards' ? (
                  <ToolsSlider
                    label={t('Vertical spacing')}
                    value={tools.levelProgressRowGap ?? 'large'}
                    options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS}
                    onChange={(levelProgressRowGap: PortfolioToolsLevelProgressRowGap) =>
                      onChange({ levelProgressRowGap })
                    }
                  />
                ) : null}
                {tools.design !== 'level-progress-rows' && tools.design !== 'level-category-rows' ? (
                  <ToolsToggleRow
                    label={t('Full width')}
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
                  label={t('Row order')}
                  value={tools.levelTableGroupBy ?? 'category'}
                  options={PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS}
                  onChange={(levelTableGroupBy: PortfolioToolsLevelTableGroupBy) =>
                    onChange({ levelTableGroupBy })
                  }
                />
                <ToolsToggleRow
                  label={t('Category filter')}
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
                    label={t('Level display')}
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
                label={t('Card frame')}
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
                  label={t('List alignment')}
                  value={tools.levelProgressContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(levelProgressContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ levelProgressContentAlignment })
                  }
                />
                {tools.design === 'level-table-rows' ? null : (
                  <ToolsPreviewCardGrid
                    label={t('Columns (large screen)')}
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
                    label={t('Full width')}
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
                  label={t('Card spacing')}
                  value={tools.cardGap ?? 'medium'}
                  options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                  onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
                />
                <ToolsPreviewCardGrid
                  label={t('Grid layout')}
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
                  label={t('Content alignment')}
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
                label={t('Card spacing')}
                value={tools.cardGap ?? 'tight'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
            ) : !isLevelIndicatorDesign ? (
              <ToolsSlider
                label={
                  tools.design === 'brand-index' || tools.design === 'brand-directory'
                    ? t('Spacing between rows')
                    : tools.design === 'brand-row'
                      ? (tools.brandRowCellStyle ?? 'dividers') === 'frames'
                        ? t('Spacing between frames')
                        : (tools.brandRowCellStyle ?? 'dividers') === 'none'
                          ? t('Spacing between cells')
                          : t('Cell spacing')
                      : tools.design === 'brand-float'
                        ? t('Spacing between tiles')
                        : t('Gap between cards')
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
                label={t('Bar style')}
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
                    ? t('Thickness & % size')
                    : t('Bar & % size')
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
                  label={t('Level display')}
                  value={tools.brandDirectoryLevelStyle ?? 'percentage'}
                  options={PORTFOLIO_TOOLS_BRAND_DIRECTORY_LEVEL_STYLE_OPTIONS}
                  onChange={(brandDirectoryLevelStyle: PortfolioToolsBrandDirectoryLevelStyle) =>
                    onChange({ brandDirectoryLevelStyle })
                  }
                />
                <ToolsPreviewCardGrid
                  label={t('Columns (wide screen)')}
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
                  label={t('Content alignment')}
                  value={tools.brandDirectoryContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandDirectoryContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandDirectoryContentAlignment })
                  }
                />
                <ToolsToggleRow
                  label={t('Full width')}
                  checked={tools.brandDirectoryFullWidth === true}
                  onChange={(brandDirectoryFullWidth) => onChange({ brandDirectoryFullWidth })}
                />
              </>
            ) : null}
            {tools.design === 'brand-cards' ? (
              <>
                <ToolsPreviewCardGrid
                  label={t('Icon placement')}
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
                  label={t('Columns (wide screen)')}
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
                  label={t('Content alignment')}
                  value={tools.brandCardsContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandCardsContentAlignment })
                  }
                />
                <ToolsToggleRow
                  label={t('Full width')}
                  checked={tools.brandCardsFullWidth === true}
                  onChange={(brandCardsFullWidth) => onChange({ brandCardsFullWidth })}
                />
              </>
            ) : null}
            {tools.design === 'level-star-cards' ? (
              <>
                <ToolsSlider
                  label={t('Card spacing')}
                  value={tools.cardGap ?? 'medium'}
                  options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                  onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
                />
                <p className="text-sm text-[color:var(--pf-palette-texte-muted)]">
                  {t('4 cards per row on large screens — full width.')}
                </p>
                <ToolsOptionGrid
                  label={t('Content alignment')}
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
                  label={t('Columns (wide screen)')}
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
                  label={t('Content alignment')}
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
                  label={t('Content alignment')}
                  value={tools.brandIndexContentAlignment ?? 'center'}
                  options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                  icons={TOOLS_ALIGNMENT_ICONS}
                  onChange={(brandIndexContentAlignment: PortfolioToolsContentAlignment) =>
                    onChange({ brandIndexContentAlignment })
                  }
                />
                <ToolsToggleRow
                  label={t('Full width (1 per row)')}
                  checked={tools.brandIndexFullWidth !== false}
                  onChange={(brandIndexFullWidth) => onChange({ brandIndexFullWidth })}
                />
                <ToolsToggleRow
                  label={t('Category filter')}
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
                  label={t('Cell style')}
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
                  label={t('Columns (wide screen)')}
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
                  label={t('Content alignment')}
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
                  label={t('Card style')}
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
                  label={t('Grid mode')}
                  value={tools.brandFloatGridMode ?? 'fluid'}
                  options={PORTFOLIO_TOOLS_BRAND_FLOAT_GRID_MODE_OPTIONS}
                  onChange={(brandFloatGridMode: PortfolioToolsBrandFloatGridMode) =>
                    onChange({ brandFloatGridMode })
                  }
                />
                {(tools.brandFloatGridMode ?? 'fluid') === 'fluid' ? (
                  <ToolsSlider
                    label={t('Tile density')}
                    value={tools.brandFloatTileDensity ?? 'comfortable'}
                    options={PORTFOLIO_TOOLS_BRAND_FLOAT_TILE_DENSITY_OPTIONS}
                    onChange={(brandFloatTileDensity: PortfolioToolsBrandFloatTileDensity) =>
                      onChange({ brandFloatTileDensity })
                    }
                  />
                ) : (
                  <ToolsPreviewCardGrid
                    label={t('Columns (wide screen)')}
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
                  label={t('Content alignment')}
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
                label={t('Content alignment')}
                value={tools.workflowRailContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={TOOLS_ALIGNMENT_ICONS}
                onChange={(workflowRailContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ workflowRailContentAlignment })
                }
              />
            ) : null}
          </SettingsRowsScope>
</ToolsLayoutSettingsBand>
        </div>
      ) : null}

      {current === 'header' && tools.enabled ? (
        <div className="space-y-6">
          <ToolsHeaderDesignChoiceGrid
            value={tools.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
            open={headerCatalogOpen}
            onOpenChange={setHeaderCatalogOpen}
          />

          {/* Browsing the catalog is a different task from tuning the chosen design: no settings below it. */}
          {headerCatalogOpen ? null : (
            <ToolsLayoutSettingsBand motionKey={tools.headerDesign ?? 'editorial'} title={t('Header settings')} flush>
              <ToolsHeaderDesignFields tools={tools} onChange={onChange} />
            </ToolsLayoutSettingsBand>
          )}
        </div>
      ) : null}

      {current === 'background' && tools.enabled ? (
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
