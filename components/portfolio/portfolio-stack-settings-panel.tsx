'use client';

import { useId, useState, type ReactNode } from 'react';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import {
  PORTFOLIO_STACK_ASIDE_TITLE_PLACEMENT_OPTIONS,
  PORTFOLIO_STACK_DESIGN_OPTIONS,
  PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS,
  PORTFOLIO_STACK_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_STACK_TAGS_SIZE_OPTIONS,
  PORTFOLIO_STACK_TITLE_PRESET_OPTIONS,
  STACK_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  STACK_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  STACK_HEADER_PALETTE_TOKEN_OPTIONS,
  stackHeaderPaletteTokenColor,
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
  type PortfolioStackHeaderAccentCountAlignment,
  type PortfolioStackHeaderBillboardWordStyle,
  type PortfolioStackHeaderDesign,
  type PortfolioStackHeaderPaletteToken,
  type PortfolioStackHeaderTitleSize,
  type PortfolioStackHeaderTitleWeight,
  type PortfolioStackSectionLayout,
  type PortfolioStackSectionSettings,
  type PortfolioStackTagsSize,
} from '@/components/portfolio/portfolio-stack-settings';
import {
  PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS,
  PORTFOLIO_TOOLS_BRAND_ROW_CELL_STYLE_OPTIONS,
  PORTFOLIO_TOOLS_CARD_GAP_OPTIONS,
  PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS,
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

/** Same general / design / header mechanism as the Experience section settings panel, plus its own Background tab.
 *  Header is one shared, GSAP-animated header (copied from the Portfolio/Work section's Header mechanism)
 *  mounted above the section, independent of Design's per-design layout. */
export type StackSubSection = 'general' | 'design' | 'header' | 'background';

const SUBSECTIONS: { value: StackSubSection; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'design', label: 'Design' },
  { value: 'header', label: 'Header' },
  { value: 'background', label: 'Background' },
];

export function normalizeStackSubSection(value: string | undefined): StackSubSection {
  return SUBSECTIONS.some((item) => item.value === value) ? (value as StackSubSection) : 'design';
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

/** Curated 3-option quick palette for Name / Description text colors — separate from the full 8-token dropdown. */
const STACK_QUICK_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'principal', label: 'Principal' },
  { value: 'texteFort', label: 'Texte fort' },
  { value: 'texteMuted', label: 'Texte muted' },
];

/** For section-background-style fields (fill, gradient stops, split zones) — "fond"/"neutre"
 *  fit that context better than "texte fort", which is why this isn't just STACK_QUICK_PALETTE_TOKENS. */
const STACK_BACKGROUND_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: 'Fond' },
  { value: 'neutre', label: 'Neutre' },
  { value: 'principal', label: 'Principal' },
  { value: 'texteMuted', label: 'Texte muted' },
];

function StackQuickColorPicker({
  label,
  palette,
  activeToken,
  activeHex,
  onPickToken,
  tokens = STACK_QUICK_PALETTE_TOKENS,
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

function StackSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{children}</p>
  );
}

/** Maps SectionBackgroundFillControls' field labels to the matching ToolsColorSlot and, for the
 *  custom-color fallback (useHeroPalette off), the concrete settings field it should write to —
 *  same label-keyed pattern portfolio-work-settings-panel.tsx uses for its own background fields. */
const STACK_BACKGROUND_LABEL_SLOTS: Record<
  string,
  { slot: ToolsColorSlot; field: keyof PortfolioStackSectionSettings }
> = {
  Color: { slot: 'sectionBackground', field: 'sectionBackgroundColor' },
  'Gradient start': { slot: 'sectionGradientFrom', field: 'sectionBackgroundGradientFrom' },
  'Gradient end': { slot: 'sectionGradientTo', field: 'sectionBackgroundGradientTo' },
  'Color A': { slot: 'sectionSplitA', field: 'sectionBackgroundColorA' },
  'Color B': { slot: 'sectionSplitB', field: 'sectionBackgroundColorB' },
};

/** Section-background color fields, bound to the same toolsPalette/toolsColorBindings system
 *  as the rest of Stack's Palette tab — "Fond", "Neutre", "Principal", "Texte muted" swatches,
 *  no free-form hex. */
function StackBackgroundColorField({
  stack,
  onChange,
  palette,
  bindings,
  label,
  value,
}: {
  stack: PortfolioStackSectionSettings;
  onChange: (patch: Partial<PortfolioStackSectionSettings>) => void;
  palette: Record<HeroPaletteTokenId, string>;
  bindings: Record<ToolsColorSlot, HeroPaletteTokenId>;
  label: string;
  value: string;
}) {
  const mapping = STACK_BACKGROUND_LABEL_SLOTS[label] ?? STACK_BACKGROUND_LABEL_SLOTS.Color;
  const usingPalette = stack.useHeroPalette !== false;
  return (
    <StackQuickColorPicker
      label={label}
      palette={palette}
      tokens={STACK_BACKGROUND_PALETTE_TOKENS}
      activeToken={usingPalette ? bindings[mapping.slot] : undefined}
      activeHex={value}
      onPickToken={(token) =>
        onChange(
          usingPalette
            ? patchToolsColorBinding(stack, mapping.slot, token)
            : { [mapping.field]: resolveHeroPaletteColor(palette, token) }
        )
      }
    />
  );
}

/** Same mini-wireframe/picker-card mechanism as Experience's design grid (see ExperienceDesignWireframe). */
function StackMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function StackMiniType({
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

function StackPickerCard({
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

function StackDesignWireframe({ design }: { design: PortfolioStackDesign }) {
  switch (design) {
    case 'workflow-rail':
      return (
        <StackMiniSlide>
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
        </StackMiniSlide>
      );
    case 'stack-tags':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-accent" x="44" y="10" width="32" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="18" y="24" width="22" height="9" rx="4.5" />
          <rect className="pf-stack-mini-mute" x="44" y="24" width="28" height="9" rx="4.5" />
          <rect className="pf-stack-mini-ink" x="76" y="24" width="20" height="9" rx="4.5" />
          <rect className="pf-stack-mini-mute" x="12" y="38" width="26" height="9" rx="4.5" />
          <rect className="pf-stack-mini-ink" x="42" y="38" width="18" height="9" rx="4.5" />
          <rect className="pf-stack-mini-mute" x="64" y="38" width="30" height="9" rx="4.5" />
          <rect className="pf-stack-mini-ink" x="28" y="52" width="24" height="9" rx="4.5" />
          <rect className="pf-stack-mini-mute" x="56" y="52" width="22" height="9" rx="4.5" />
        </StackMiniSlide>
      );
    case 'brand-cards':
      return (
        <StackMiniSlide>
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
        </StackMiniSlide>
      );
    case 'brand-index':
      return (
        <StackMiniSlide>
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
        </StackMiniSlide>
      );
    case 'brand-row':
      return (
        <StackMiniSlide>
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
        </StackMiniSlide>
      );
    case 'level-progress-rows':
      return (
        <StackMiniSlide>
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
        </StackMiniSlide>
      );
    case 'level-category-rows':
      return (
        <StackMiniSlide>
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
        </StackMiniSlide>
      );
    case 'level-table-rows':
      return (
        <StackMiniSlide>
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
        </StackMiniSlide>
      );
    case 'level-circular-cards':
      return (
        <StackMiniSlide>
          <circle className="pf-stack-mini-ring" cx="24" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="24" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="14" y="46" width="20" height="2.2" rx="1.1" />
          <circle className="pf-stack-mini-ring" cx="60" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="60" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="50" y="46" width="20" height="2.2" rx="1.1" />
          <circle className="pf-stack-mini-ring" cx="96" cy="28" r="12" strokeWidth={2.5} />
          <circle className="pf-stack-mini-ink" cx="96" cy="28" r="4" />
          <rect className="pf-stack-mini-mute" x="86" y="46" width="20" height="2.2" rx="1.1" />
        </StackMiniSlide>
      );
    case 'level-star-cards':
      return (
        <StackMiniSlide>
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
        </StackMiniSlide>
      );
    case 'level-svg-rings':
      return (
        <StackMiniSlide>
          <circle className="pf-stack-mini-ring" cx="24" cy="32" r="16" strokeWidth={3} />
          <StackMiniType x={24} y={34} size={6} anchor="middle">
            CSS
          </StackMiniType>
          <circle className="pf-stack-mini-ring" cx="60" cy="32" r="16" strokeWidth={3} />
          <StackMiniType x={60} y={34} size={6} anchor="middle">
            JS
          </StackMiniType>
          <circle className="pf-stack-mini-ring" cx="96" cy="32" r="16" strokeWidth={3} />
          <StackMiniType x={96} y={34} size={6} anchor="middle">
            GO
          </StackMiniType>
        </StackMiniSlide>
      );
    case 'level-bento-categories':
      return (
        <StackMiniSlide>
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
        </StackMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Same animated switch + segmented option grid as Experience's layout settings (ExperienceSwitchTrack/ExperienceOptionGrid). */
function StackSwitchTrack({ checked }: { checked: boolean }) {
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

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus
 *  instead of a permanent line of text under a toggle. */
function StackInfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex shrink-0">
      {/* `span` not `button` — this can sit inside StackToggleRow's own <button>,
       *  and a <button> can never nest another <button> (invalid HTML / hydration error). */}
      <span
        role="button"
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={`More info: ${text}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => event.stopPropagation()}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-neutral-400 transition hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
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

function StackToggleRow({
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
          <span className="min-w-0 truncate text-sm font-semibold text-neutral-950">{label}</span>
          {info ? <StackInfoTooltip text={info} /> : null}
        </span>
        <StackSwitchTrack checked={checked} />
      </span>
    </button>
  );
}

function StackOptionGrid<T extends string | number>({
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
  // Keep every option on one horizontal row up to 4 choices (Taille/Espacement/Écart-style fields);
  // larger sets fall back to a 2-column wrap so buttons don't get too cramped.
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
function StackSlider<T extends string>({
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
function StackPreviewCardGrid<T extends string>({
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
          <StackPickerCard
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
          </StackPickerCard>
        ))}
      </div>
    </div>
  );
}

/** N evenly spaced bars — glyph for "columns per row" preview cards. */
function stackColumnsGlyph(n: 1 | 2 | 3 | 4): ReactNode {
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

function stackCellStyleDividersGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="8" y="10" width="20" height="14" rx="2" />
      <rect className="pf-stack-mini-accent" x="31" y="8" width="1.4" height="18" rx="0.7" />
      <rect className="pf-stack-mini-mute" x="36" y="10" width="20" height="14" rx="2" />
    </>
  );
}

function stackCellStyleFramesGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ring" x="9" y="9" width="20" height="16" rx="3" strokeWidth={1.4} />
      <rect className="pf-stack-mini-ring" x="35" y="9" width="20" height="16" rx="3" strokeWidth={1.4} />
    </>
  );
}

function stackCellStyleNoneGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="9" y="10" width="20" height="14" rx="2" />
      <rect className="pf-stack-mini-mute" x="35" y="10" width="20" height="14" rx="2" />
    </>
  );
}

function stackIconPlacementTopGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="26" y="6" width="12" height="12" rx="3" />
      <rect className="pf-stack-mini-mute" x="18" y="22" width="28" height="3" rx="1.5" />
    </>
  );
}

function stackIconPlacementLeftGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="8" y="11" width="12" height="12" rx="3" />
      <rect className="pf-stack-mini-mute" x="26" y="12" width="30" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="26" y="19" width="22" height="2.4" rx="1.2" />
    </>
  );
}

function stackLevelDisplayTextGlyph(): ReactNode {
  return <rect className="pf-stack-mini-accent" x="16" y="14" width="32" height="6" rx="3" />;
}

function stackLevelDisplayStarsGlyph(): ReactNode {
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

function stackLevelDisplayDotsGlyph(): ReactNode {
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

function stackLevelDisplayBarGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="10" y="15" width="44" height="4" rx="2" />
      <rect className="pf-stack-mini-accent" x="10" y="15" width="28" height="4" rx="2" />
    </>
  );
}

function stackBarStyleRectangleGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="8" y="15" width="48" height="4" />
      <rect className="pf-stack-mini-accent" x="8" y="15" width="30" height="4" />
    </>
  );
}

function stackBarStylePillGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="8" y="14.5" width="48" height="5" rx="2.5" />
      <rect className="pf-stack-mini-accent" x="8" y="14.5" width="30" height="5" rx="2.5" />
    </>
  );
}

function stackBarStyleGradientGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="8" y="14.5" width="48" height="5" rx="2.5" />
      <rect className="pf-stack-mini-accent" x="8" y="14.5" width="30" height="5" rx="2.5" opacity={0.5} />
      <rect className="pf-stack-mini-accent" x="8" y="14.5" width="14" height="5" rx="2.5" />
    </>
  );
}

function stackBarStyleSegmentsGlyph(): ReactNode {
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

function stackCardFrameFramedGlyph(): ReactNode {
  return <rect className="pf-stack-mini-ring" x="14" y="6" width="36" height="22" rx="4" strokeWidth={1.4} />;
}

function stackCardFramePlainGlyph(): ReactNode {
  return (
    <>
      <circle className="pf-stack-mini-ink" cx="32" cy="13" r="5" />
      <rect className="pf-stack-mini-mute" x="22" y="23" width="20" height="2.4" rx="1.2" />
    </>
  );
}

function stackGridLayoutAsymmetricGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="8" y="8" width="28" height="18" rx="3" />
      <rect className="pf-stack-mini-mute" x="39" y="8" width="17" height="18" rx="3" />
    </>
  );
}

function stackGridLayoutEqualGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="8" y="8" width="22" height="18" rx="3" />
      <rect className="pf-stack-mini-ink" x="34" y="8" width="22" height="18" rx="3" />
    </>
  );
}

/** Minimalist text-alignment glyphs for content-alignment option grids. */
function StackAlignLeftIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="0" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="0" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function StackAlignCenterIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="3" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="1.5" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function StackAlignRightIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="6" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="3" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

const STACK_ALIGNMENT_ICONS: Partial<Record<string, ReactNode>> = {
  left: <StackAlignLeftIcon />,
  center: <StackAlignCenterIcon />,
  right: <StackAlignRightIcon />,
};

/** Collapsed-state row shared by every design/header choice grid: a compact scaled-down
 *  thumbnail, the selected design's name, and a trailing chevron — the whole row opens the
 *  grid. The thumbnail wraps whatever wireframe is passed (sized for a full-width card) in a
 *  fixed 128×80 box and scales it down, instead of the old wide preview box that left a lot of
 *  empty space on both sides of the much narrower mini-schema it centered. */
function StackDesignSummaryRow({
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
  return (
    <div>
      <p className="pf-stack-block-label">{label}</p>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Change ${label.toLowerCase()}`}
        className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200/80 px-3 py-2.5 text-left transition hover:border-neutral-300"
      >
        <span className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200/80 bg-white">
          <span className="flex w-[116px] shrink-0 origin-center scale-[1.05] items-center justify-center">
            {children}
          </span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-950">{name}</span>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden>
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

/** Same collapsed-preview / expand-to-grid mechanism as Hero > Design Banner: shows only the
 *  active design at a glance, with a "Change" affordance that reveals the full grid to pick
 *  from — picking a card re-collapses back to the single preview. */
function StackDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioStackDesign;
  onChange: (value: PortfolioStackDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_STACK_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_STACK_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-stack-block-label !mb-0">Design</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_STACK_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <StackPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <StackDesignWireframe design={option.value} />
              </StackPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <StackDesignSummaryRow label="Design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <StackDesignWireframe design={value} />
    </StackDesignSummaryRow>
  );
}

/** S/M/L/XL, each button's own label rendered at the size it represents —
 *  the pill illustrates the scale directly, no separate value readout needed. */
const STACK_SIZE_PILL_OPTIONS: { value: PortfolioStackHeaderTitleSize; label: string; fontPx: number }[] = [
  { value: 'sm', label: 'S', fontPx: 12 },
  { value: 'md', label: 'M', fontPx: 15 },
  { value: 'lg', label: 'L', fontPx: 18 },
  { value: 'xl', label: 'XL', fontPx: 22 },
];

function StackSizePill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioStackHeaderTitleSize;
  onChange: (value: PortfolioStackHeaderTitleSize) => void;
}) {
  return (
    <div>
      <p className="pf-stack-block-label pf-stack-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-stack-segment grid grid-cols-4 gap-[3px] p-[3px]"
        data-compact="true"
      >
        {STACK_SIZE_PILL_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={option.label}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-stack-segment-btn flex items-center justify-center px-2.5 py-2 font-semibold leading-none"
              style={{ fontSize: `${option.fontPx}px` }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Mini swatch for a palette-token color picker — the actual resolved color,
 *  not just a text label. */
function stackHeaderPaletteTokenGlyph(token: PortfolioStackHeaderPaletteToken): ReactNode {
  return (
    <circle
      cx="32"
      cy="17"
      r="8"
      fill={stackHeaderPaletteTokenColor(token)}
      style={{
        stroke: 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 22%, transparent)',
        strokeWidth: 1,
      }}
    />
  );
}

function stackHeaderBillboardWordStyleGlyph(style: PortfolioStackHeaderBillboardWordStyle): ReactNode {
  switch (style) {
    case 'outline':
      return (
        <text
          x="32"
          y="23"
          textAnchor="middle"
          fontSize="19"
          fontWeight={900}
          stroke="currentColor"
          strokeWidth="1"
          className="pf-stack-mini-ink"
          style={{ fill: 'none' }}
        >
          Aa
        </text>
      );
    case 'fill':
      return (
        <>
          <text
            x="32"
            y="23"
            textAnchor="middle"
            fontSize="19"
            fontWeight={900}
            className="pf-stack-mini-ink"
            opacity={0.4}
            style={{ filter: 'blur(2px)' }}
          >
            Aa
          </text>
          <text x="32" y="23" textAnchor="middle" fontSize="19" fontWeight={900} className="pf-stack-mini-ink">
            Aa
          </text>
        </>
      );
    case 'simple':
      return (
        <text x="32" y="23" textAnchor="middle" fontSize="19" fontWeight={900} className="pf-stack-mini-ink">
          Aa
        </text>
      );
    default: {
      const _exhaustive: never = style;
      return _exhaustive;
    }
  }
}

/** Mini wireframes for the 8 Header design picker cards — same StackMiniSlide mechanism as Header. */
function StackHeaderDesignWireframe({ design }: { design: PortfolioStackHeaderDesign }) {
  switch (design) {
    case 'editorial':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="16" width="18" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="26" width="64" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="42" width="46" height="4" rx="2" />
        </StackMiniSlide>
      );
    case 'marquee':
      return (
        <StackMiniSlide>
          <text
            x="60"
            y="34"
            fontSize={22}
            fontWeight={800}
            textAnchor="middle"
            opacity={0.14}
            className="pf-stack-mini-ink"
          >
            STACK
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="84" height="10" rx="2" />
        </StackMiniSlide>
      );
    case 'index':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="4" height="4" />
          <rect className="pf-stack-mini-mute" x="20" y="13" width="90" height="1" />
          <StackMiniType x={10} y={40} size={22}>
            04
          </StackMiniType>
          <rect className="pf-stack-mini-mute" x="46" y="22" width="1" height="18" />
          <rect className="pf-stack-mini-ink" x="54" y="24" width="46" height="7" rx="2" />
        </StackMiniSlide>
      );
    case 'accent-count':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="12" width="26" height="8" rx="4" />
          <rect className="pf-stack-mini-mute" x="10" y="26" width="40" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="33" width="60" height="7" rx="2" />
        </StackMiniSlide>
      );
    case 'serif-lead':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="14" width="20" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="24" width="76" height="11" rx="2" />
        </StackMiniSlide>
      );
    case 'billboard':
      return (
        <StackMiniSlide>
          <text
            x="60"
            y="30"
            fontSize={26}
            fontWeight={900}
            textAnchor="middle"
            opacity={0.1}
            className="pf-stack-mini-ink"
          >
            STACK
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="60" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="18" y="42" width="40" height="3" rx="1.5" />
        </StackMiniSlide>
      );
    case 'masthead':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="100" height="1" />
          <rect className="pf-stack-mini-ink" x="10" y="20" width="100" height="12" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="38" width="100" height="1" />
        </StackMiniSlide>
      );
    case 'split-heading':
      return (
        <StackMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="20" width="58" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="86" y="18" width="24" height="3" rx="1.5" />
        </StackMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Same collapsed-preview / expand-to-grid mechanism as Header above — a second,
 *  independent header slot copied from the Portfolio/Work section's Header. */
function StackHeaderChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioStackHeaderDesign;
  onChange: (value: PortfolioStackHeaderDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-stack-block-label !mb-0">Header design</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <StackPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <StackHeaderDesignWireframe design={option.value} />
              </StackPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <StackDesignSummaryRow label="Header design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <StackHeaderDesignWireframe design={value} />
    </StackDesignSummaryRow>
  );
}

const STACK_HEADER_MARGIN_BOTTOM_OPTIONS = [
  { value: 'sm' as const, label: 'Small' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Large' },
  { value: 'xl' as const, label: 'XL' },
];

const STACK_HEADER_TITLE_WEIGHT_OPTIONS = [
  { value: 'light' as const, label: 'Light', description: 'Lighter than this design’s default.' },
  { value: 'regular' as const, label: 'Regular', description: 'This design’s default weight.' },
  { value: 'semibold' as const, label: 'Semibold', description: 'A step bolder.' },
  { value: 'bold' as const, label: 'Bold', description: 'The boldest step.' },
];

/** Shared across every Header design — bottom spacing, title size, and title weight.
 *  Appended to each design's own advanced-settings branch in the Header tab.
 *  `hideAlignment`/`hideTitleControls` drop controls a given design doesn't
 *  actually consume (e.g. Billboard has no adjustable title size/weight and
 *  ignores header alignment) — dead controls left visible are confusing. */
function StackHeaderSharedAdvancedControls({
  stack,
  onChange,
  hideAlignment = false,
  hideTitleControls = false,
}: {
  stack: PortfolioStackSectionSettings;
  onChange: (patch: Partial<PortfolioStackSectionSettings>) => void;
  hideAlignment?: boolean;
  hideTitleControls?: boolean;
}) {
  return (
    <>
      {hideAlignment ? null : (
        <StackOptionGrid
          label="Header alignment"
          options={[
            { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
            { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
            { value: 'right' as const, label: 'Right', description: 'Right-aligned title and subtitle.' },
          ]}
          value={stack.headerDesignAlignment}
          onChange={(headerDesignAlignment: PortfolioStackHeaderAccentCountAlignment) => onChange({ headerDesignAlignment })}
          columns={3}
        />
      )}
      <StackSlider
        label="Bottom spacing"
        options={STACK_HEADER_MARGIN_BOTTOM_OPTIONS}
        value={stack.headerMarginBottom ?? 'md'}
        onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
      />
      {hideTitleControls ? null : (
        <>
          <StackSizePill
            label="Title size"
            value={stack.headerTitleSize ?? 'md'}
            onChange={(headerTitleSize) => onChange({ headerTitleSize })}
          />
          <StackOptionGrid
            label="Title weight"
            options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
            value={stack.headerTitleWeight ?? 'regular'}
            onChange={(headerTitleWeight: PortfolioStackHeaderTitleWeight) => onChange({ headerTitleWeight })}
            columns={4}
          />
        </>
      )}
    </>
  );
}

function stackSectionLayoutStackedGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="10" y="7" width="44" height="7" rx="2" />
      <rect className="pf-stack-mini-mute" x="10" y="18" width="44" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="10" y="24" width="34" height="3" rx="1.5" />
    </>
  );
}

function stackSectionLayoutAsideLeftGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="8" y="9" width="22" height="16" rx="2" />
      <rect className="pf-stack-mini-mute" x="36" y="10" width="20" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="36" y="16" width="20" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="36" y="22" width="14" height="3" rx="1.5" />
    </>
  );
}

function stackSectionLayoutAsideRightGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-mute" x="8" y="10" width="20" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="8" y="16" width="20" height="3" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="8" y="22" width="14" height="3" rx="1.5" />
      <rect className="pf-stack-mini-ink" x="34" y="9" width="22" height="16" rx="2" />
    </>
  );
}

function StackLayoutSettingsBand({
  children,
  motionKey,
}: {
  children: ReactNode;
  motionKey: string;
}) {
  return (
    <section className="pf-stack-layout-settings" aria-labelledby="stack-layout-settings-title">
      <h3 id="stack-layout-settings-title" className="pf-stack-layout-settings-title">
        Design settings
      </h3>
      <div key={motionKey} className="pf-stack-layout-settings-body space-y-6">
        {children}
      </div>
    </section>
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
  subSection = 'design',
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
  // Core stack tags renders names as chips (chipText/chipBackground), not the generic label ink —
  // point the "Nom" quick picker at whichever slot actually drives that design's name color.
  const nameColorSlot: ToolsColorSlot = stack.design === 'stack-tags' ? 'chipText' : 'label';
  const nameColorHex = nameColorSlot === 'chipText' ? stack.chipTextColor : stack.labelColor;
  const paletteSlots = PORTFOLIO_TOOLS_COLOR_SLOT_OPTIONS.filter((slot) => {
    // Nom / Description get their own dedicated 3-swatch quick picker (StackQuickColorPicker) below.
    if (slot.value === 'label' || slot.value === 'description') return false;
    if (
      slot.value === 'title' ||
      slot.value === 'tileBackground' ||
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
            label="Show Stack section"
            checked={stack.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <SectionColorModeControl
            value={stack.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />
          <div className="space-y-4 border-t border-neutral-200 pt-6">
            <StackOptionGrid
              label="Title"
              value={stack.titlePreset}
              options={PORTFOLIO_STACK_TITLE_PRESET_OPTIONS}
              onChange={(titlePreset) => onChange({ titlePreset })}
            />
            {stack.titlePreset === 'custom' ? (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                  Custom title
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
            <StackPreviewCardGrid
              label="Title / list layout"
              value={sectionLayout}
              options={PORTFOLIO_STACK_SECTION_LAYOUT_OPTIONS.map((option) => ({
                ...option,
                glyph:
                  option.value === 'aside-left'
                    ? stackSectionLayoutAsideLeftGlyph()
                    : option.value === 'aside-right'
                      ? stackSectionLayoutAsideRightGlyph()
                      : stackSectionLayoutStackedGlyph(),
              }))}
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
                <StackOptionGrid
                  label="Vertical title alignment"
                  value={stack.asideTitlePlacement ?? 'center'}
                  options={PORTFOLIO_STACK_ASIDE_TITLE_PLACEMENT_OPTIONS}
                  onChange={(asideTitlePlacement: PortfolioStackAsideTitlePlacement) =>
                    onChange({ asideTitlePlacement })
                  }
                />
                <StackToggleRow
                  label="Sticky title on scroll"
                  checked={stack.asideTitleSticky !== false}
                  onChange={(asideTitleSticky) => onChange({ asideTitleSticky })}
                />
              </>
            ) : null}
            <StackOptionGrid
              label="Subtitle"
              value={stack.subtitlePreset ?? 'none'}
              options={PORTFOLIO_TOOLS_SUBTITLE_PRESET_OPTIONS}
              onChange={(subtitlePreset: PortfolioToolsSubtitlePreset) => onChange({ subtitlePreset })}
            />
            {stack.subtitlePreset === 'custom' ? (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                  Subtitle text
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
          </div>
        </div>
      ) : null}

      {current === 'design' ? (
        <div className="space-y-4">
          {PORTFOLIO_STACK_DESIGN_OPTIONS.length > 1 ? (
            <StackDesignChoiceGrid
              value={stack.design}
              onChange={(design) => handleStackDesignChange(stack, design, onChange)}
            />
          ) : null}
          <StackLayoutSettingsBand motionKey={stack.design}>
          {stack.design === 'stack-tags' ? (
            <StackOptionGrid
              label="Tag alignment"
              value={stack.contentAlignment ?? 'center'}
              options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
              onChange={(contentAlignment: PortfolioToolsContentAlignment) =>
                onChange({ contentAlignment })
              }
            />
          ) : null}
          {stack.design === 'stack-tags' ? (
            <>
              <StackSlider
                label="Tag size"
                value={stack.stackTagsSize ?? 'medium'}
                options={PORTFOLIO_STACK_TAGS_SIZE_OPTIONS}
                onChange={(stackTagsSize: PortfolioStackTagsSize) => onChange({ stackTagsSize })}
              />
              <StackSlider
                label="Tag spacing"
                value={stack.cardGap}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
            </>
          ) : (
            <StackSlider
              label="Logo size"
              value={stack.tileSize}
              options={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS}
              onChange={(tileSize: PortfolioToolsTileSize) => onChange({ tileSize })}
            />
          )}
          {isLevelIndicatorDesign ? (
            <>
              {stack.design !== 'level-star-cards' ? (
                <StackSlider
                  label="Vertical spacing"
                  value={stack.levelProgressRowGap ?? 'large'}
                  options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS}
                  onChange={(levelProgressRowGap: PortfolioToolsLevelProgressRowGap) =>
                    onChange({ levelProgressRowGap })
                  }
                />
              ) : null}
              {stack.design !== 'level-progress-rows' && stack.design !== 'level-category-rows' ? (
                <StackToggleRow
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
              <StackOptionGrid
                label="Row order"
                value={stack.levelTableGroupBy ?? 'category'}
                options={PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS}
                onChange={(levelTableGroupBy: PortfolioToolsLevelTableGroupBy) =>
                  onChange({ levelTableGroupBy })
                }
              />
              <StackToggleRow
                label="Category filter"
                checked={resolveToolsLevelIndicatorShowCategoryFilter(stack)}
                onChange={(levelIndicatorShowCategoryFilter) =>
                  onChange({
                    levelIndicatorShowCategoryFilter,
                    levelTableShowCategoryFilter: levelIndicatorShowCategoryFilter,
                  })
                }
              />
              {stack.design !== 'level-circular-cards' && stack.design !== 'level-svg-rings' ? (
                // Both designs always render their own fixed ring regardless of this
                // setting — level-circular-cards and level-svg-rings never read
                // levelIndicatorDisplayStyle, so the control had no effect there.
                <StackPreviewCardGrid
                  label="Level display"
                  value={
                    stack.levelIndicatorDisplayStyle ??
                    (stack.design === 'level-bento-categories' ? 'progress-bar' : 'text')
                  }
                  options={PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS.map((option) => ({
                    ...option,
                    glyph:
                      option.value === 'stars'
                        ? stackLevelDisplayStarsGlyph()
                        : option.value === 'dots'
                          ? stackLevelDisplayDotsGlyph()
                          : option.value === 'progress-bar'
                            ? stackLevelDisplayBarGlyph()
                            : stackLevelDisplayTextGlyph(),
                  }))}
                  onChange={(levelIndicatorDisplayStyle: PortfolioToolsLevelIndicatorDisplayStyle) =>
                    onChange({ levelIndicatorDisplayStyle })
                  }
                />
              ) : null}
            </>
          ) : null}
          {stackLevelIndicatorDesignSupportsCardFrame(stack.design) ? (
            <>
              <StackPreviewCardGrid
                label="Card frame"
                value={stack.levelIndicatorCardStyle ?? 'framed'}
                options={PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS.map((option) => ({
                  ...option,
                  glyph:
                    option.value === 'framed'
                      ? stackCardFrameFramedGlyph()
                      : stackCardFramePlainGlyph(),
                }))}
                columns={2}
                onChange={(levelIndicatorCardStyle: PortfolioToolsLevelIndicatorCardStyle) =>
                  onChange({ levelIndicatorCardStyle })
                }
              />
            </>
          ) : null}
          {stack.design === 'level-progress-rows' ||
          stack.design === 'level-category-rows' ||
          stack.design === 'level-table-rows' ? (
            <>
              <StackOptionGrid
                label="List alignment"
                value={stack.levelProgressContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(levelProgressContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ levelProgressContentAlignment })
                }
              />
              {stack.design === 'level-table-rows' ? null : stackAside ? null : (
                <StackPreviewCardGrid
                  label="Columns (large screen)"
                  value={String(stack.levelProgressColumnsPerRow ?? 1) as '1' | '2'}
                  options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_COLUMNS_OPTIONS.map((option) => ({
                    ...option,
                    glyph: stackColumnsGlyph(option.value === '2' ? 2 : 1),
                  }))}
                  columns={2}
                  onChange={(value) =>
                    onChange({
                      levelProgressColumnsPerRow: value === '2' ? 2 : 1,
                    })
                  }
                />
              )}
              {stack.design === 'level-progress-rows' || stack.design === 'level-category-rows' ? (
                <StackToggleRow
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
            </>
          ) : stack.design === 'level-bento-categories' ? (
            <>
              <StackSlider
                label="Card spacing"
                value={stack.cardGap ?? 'medium'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
              <StackPreviewCardGrid
                label="Grid layout"
                value={stack.levelBentoGridMode ?? 'equal'}
                options={PORTFOLIO_TOOLS_LEVEL_BENTO_GRID_MODE_OPTIONS.map((option) => ({
                  ...option,
                  glyph:
                    option.value === 'asymmetric'
                      ? stackGridLayoutAsymmetricGlyph()
                      : stackGridLayoutEqualGlyph(),
                }))}
                columns={2}
                onChange={(levelBentoGridMode: PortfolioToolsLevelBentoGridMode) =>
                  onChange({ levelBentoGridMode })
                }
              />
              <StackOptionGrid
                label="Content alignment"
                value={stack.brandCardsContentAlignment ?? 'left'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
            </>
          ) : !isLevelIndicatorDesign && stack.design !== 'stack-tags' ? (
            // stack-tags already has its own "Tag spacing" slider above (same
            // cardGap field) — showing this generic one too just duplicated it.
            <StackSlider
              label={
                stack.design === 'brand-index'
                  ? 'Row spacing'
                  : stack.design === 'brand-row'
                    ? (stack.brandRowCellStyle ?? 'dividers') === 'frames'
                      ? 'Spacing between frames'
                      : (stack.brandRowCellStyle ?? 'dividers') === 'none'
                        ? 'Spacing between cells'
                        : 'Cell spacing'
                    : 'Card spacing'
              }
              value={stack.cardGap ?? 'tight'}
              options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
              onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
            />
          ) : null}
          {stack.design === 'level-progress-rows' || stack.design === 'level-category-rows' ? (
            <>
              <StackPreviewCardGrid
                label="Bar style"
                value={stack.levelBarStyle ?? 'rectangle'}
                options={PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS.map((option) => ({
                  ...option,
                  glyph:
                    option.value === 'pill'
                      ? stackBarStylePillGlyph()
                      : option.value === 'pill-gradient'
                        ? stackBarStyleGradientGlyph()
                        : option.value === 'segments'
                          ? stackBarStyleSegmentsGlyph()
                          : stackBarStyleRectangleGlyph(),
                }))}
                onChange={(levelBarStyle: PortfolioToolsLevelBarStyle) => onChange({ levelBarStyle })}
              />
            </>
          ) : null}
          {stack.design === 'level-progress-rows' ||
          stack.design === 'level-category-rows' ||
          stack.design === 'level-circular-cards' ||
          stack.design === 'level-star-cards' ||
          stack.design === 'level-svg-rings' ? (
            <>
              <StackSlider
                label={
                  stack.design === 'level-circular-cards' || stack.design === 'level-svg-rings'
                    ? 'Thickness & % size'
                    : 'Bar & % size'
                }
                value={stack.levelBarSize ?? 'small'}
                options={
                  stack.design === 'level-circular-cards' || stack.design === 'level-svg-rings'
                    ? PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS.filter((item) => item.value !== 'tight')
                    : PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS
                }
                onChange={(levelBarSize: PortfolioToolsLevelBarSize) => onChange({ levelBarSize })}
              />
            </>
          ) : null}
          {stack.design === 'brand-cards' ? (
            <>
              <StackPreviewCardGrid
                label="Icon placement"
                value={stack.brandCardsIconPlacement ?? 'left'}
                options={PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS.map((option) => ({
                  ...option,
                  glyph:
                    option.value === 'top'
                      ? stackIconPlacementTopGlyph()
                      : stackIconPlacementLeftGlyph(),
                }))}
                columns={2}
                onChange={(brandCardsIconPlacement: PortfolioToolsBrandCardsIconPlacement) =>
                  onChange({ brandCardsIconPlacement })
                }
              />
              {stackAside ? null : (
                <StackPreviewCardGrid
                  label="Columns (large screen)"
                  value={String(stack.brandCardsColumnsPerRow ?? 2) as '1' | '2' | '3'}
                  options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS.map((option) => ({
                    ...option,
                    glyph: stackColumnsGlyph(Number(option.value) as 1 | 2 | 3 | 4),
                  }))}
                  onChange={(value) =>
                    onChange({
                      brandCardsColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                    })
                  }
                />
              )}
              <StackOptionGrid
                label="Content alignment"
                value={stack.brandCardsContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
              <StackToggleRow
                label="Full width"
                checked={stack.brandCardsFullWidth === true}
                onChange={(brandCardsFullWidth) => onChange({ brandCardsFullWidth })}
              />
            </>
          ) : null}
          {stack.design === 'level-star-cards' ? (
            <>
              <StackSlider
                label="Card spacing"
                value={stack.cardGap ?? 'medium'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
              <StackOptionGrid
                label="Content alignment"
                value={stack.brandCardsContentAlignment ?? 'left'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
            </>
          ) : stack.design === 'level-circular-cards' || stack.design === 'level-svg-rings' ? (
            <>
              {stackAside ? null : (
                <StackPreviewCardGrid
                  label="Columns (large screen)"
                  value={String(stack.brandCardsColumnsPerRow ?? 3) as '1' | '2' | '3'}
                  options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS.filter(
                    (item) => item.value !== '4'
                  ).map((option) => ({
                    ...option,
                    glyph: stackColumnsGlyph(Number(option.value) as 1 | 2 | 3),
                  }))}
                  onChange={(value) =>
                    onChange({
                      brandCardsColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                    })
                  }
                />
              )}
              <StackOptionGrid
                label="Content alignment"
                value={stack.brandCardsContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
            </>
          ) : null}
          {stack.design === 'brand-index' ? (
            <>
              <StackOptionGrid
                label="Content alignment"
                value={stack.brandIndexContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(brandIndexContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandIndexContentAlignment })
                }
              />
              <StackToggleRow
                label="Full width (1 per row)"
                checked={stack.brandIndexFullWidth !== false}
                onChange={(brandIndexFullWidth) => onChange({ brandIndexFullWidth })}
              />
              <StackToggleRow
                label="Category filter"
                checked={resolveToolsLevelIndicatorShowCategoryFilter(stack)}
                onChange={(levelIndicatorShowCategoryFilter) =>
                  onChange({
                    levelIndicatorShowCategoryFilter,
                    levelTableShowCategoryFilter: levelIndicatorShowCategoryFilter,
                  })
                }
              />
            </>
          ) : null}
          {stack.design === 'brand-row' ? (
            <>
              <StackPreviewCardGrid
                label="Cell style"
                value={stack.brandRowCellStyle ?? 'dividers'}
                options={PORTFOLIO_TOOLS_BRAND_ROW_CELL_STYLE_OPTIONS.map((option) => ({
                  ...option,
                  glyph:
                    option.value === 'frames'
                      ? stackCellStyleFramesGlyph()
                      : option.value === 'none'
                        ? stackCellStyleNoneGlyph()
                        : stackCellStyleDividersGlyph(),
                }))}
                onChange={(brandRowCellStyle: PortfolioToolsBrandRowCellStyle) =>
                  onChange({ brandRowCellStyle })
                }
              />
              <StackPreviewCardGrid
                label="Columns (large screen)"
                value={String(stack.brandRowColumnsPerRow ?? 3) as '1' | '2' | '3'}
                options={PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS.map((option) => ({
                  ...option,
                  glyph: stackColumnsGlyph(Number(option.value) as 1 | 2 | 3 | 4),
                }))}
                onChange={(value) =>
                  onChange({
                    brandRowColumnsPerRow: value === '3' ? 3 : value === '2' ? 2 : 1,
                  })
                }
              />
              <StackOptionGrid
                label="Content alignment"
                value={stack.brandRowContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(brandRowContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandRowContentAlignment })
                }
              />
            </>
          ) : null}
          {stack.design === 'workflow-rail' ? (
            <StackOptionGrid
              label="Content alignment"
              value={stack.workflowRailContentAlignment ?? 'center'}
              options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
              onChange={(workflowRailContentAlignment: PortfolioToolsContentAlignment) =>
                onChange({ workflowRailContentAlignment })
              }
            />
          ) : null}
          </StackLayoutSettingsBand>
        </div>
      ) : null}

      {current === 'background' ? (
        <div className="space-y-4">
          <SectionBackgroundSettingsFields
            settings={stack}
            onChange={onChange}
            renderColorField={({ label, value }) => (
              <StackBackgroundColorField
                stack={stack}
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

      {current === 'header' ? (
        <div className="space-y-6">
          <div>
            <StackHeaderChoiceGrid
              value={stack.headerDesign ?? 'editorial'}
              onChange={(headerDesign) => onChange({ headerDesign })}
            />

            <StackLayoutSettingsBand motionKey={stack.headerDesign ?? 'editorial'}>
              {stack.headerDesign === 'index' ? (
                <>
                  <div>
                    <StackSectionLabel>Rule label</StackSectionLabel>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Text</p>
                        <input
                          type="text"
                          value={stack.headerIndexLabelText}
                          onChange={(event) => onChange({ headerIndexLabelText: event.target.value })}
                          placeholder="Index"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <StackPreviewCardGrid
                        label="Color"
                        options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: stackHeaderPaletteTokenGlyph(option.value),
                        }))}
                        value={stack.headerIndexLabelColor ?? 'texteFort'}
                        onChange={(headerIndexLabelColor) => onChange({ headerIndexLabelColor })}
                        columns={3}
                      />
                      <StackSizePill
                        label="Size"
                        value={stack.headerIndexLabelSize ?? 'md'}
                        onChange={(headerIndexLabelSize) => onChange({ headerIndexLabelSize })}
                      />
                      <StackOptionGrid
                        label="Weight"
                        options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
                        value={stack.headerIndexLabelWeight ?? 'regular'}
                        onChange={(headerIndexLabelWeight: PortfolioStackHeaderTitleWeight) =>
                          onChange({ headerIndexLabelWeight })
                        }
                        columns={4}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <StackSectionLabel>Counter</StackSectionLabel>
                    <div className="mt-3 space-y-4">
                      <StackPreviewCardGrid
                        label="Numeral color"
                        options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: stackHeaderPaletteTokenGlyph(option.value),
                        }))}
                        value={stack.headerIndexNumberColor ?? 'principal'}
                        onChange={(headerIndexNumberColor) => onChange({ headerIndexNumberColor })}
                        columns={3}
                      />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Count label</p>
                        <input
                          type="text"
                          value={stack.headerIndexCountLabelText}
                          onChange={(event) => onChange({ headerIndexCountLabelText: event.target.value })}
                          placeholder="Technologies"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <StackSectionLabel>Title</StackSectionLabel>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Text</p>
                        <input
                          type="text"
                          value={stack.headerIndexTitleText}
                          onChange={(event) => onChange({ headerIndexTitleText: event.target.value })}
                          placeholder="Core stack"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <StackPreviewCardGrid
                        label="Color"
                        options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: stackHeaderPaletteTokenGlyph(option.value),
                        }))}
                        value={stack.headerIndexTitleColor ?? 'texteFort'}
                        onChange={(headerIndexTitleColor) => onChange({ headerIndexTitleColor })}
                        columns={3}
                      />
                      <StackSizePill
                        label="Size"
                        value={stack.headerIndexTitleSize ?? 'md'}
                        onChange={(headerIndexTitleSize) => onChange({ headerIndexTitleSize })}
                      />
                      <StackOptionGrid
                        label="Weight"
                        options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
                        value={stack.headerIndexTitleWeight ?? 'regular'}
                        onChange={(headerIndexTitleWeight: PortfolioStackHeaderTitleWeight) =>
                          onChange({ headerIndexTitleWeight })
                        }
                        columns={4}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <StackSectionLabel>Subtitle</StackSectionLabel>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Text</p>
                        <input
                          type="text"
                          value={stack.headerIndexSubtitleText}
                          onChange={(event) => onChange({ headerIndexSubtitleText: event.target.value })}
                          placeholder="Languages, frameworks, and tools."
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <StackPreviewCardGrid
                        label="Color"
                        options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: stackHeaderPaletteTokenGlyph(option.value),
                        }))}
                        value={stack.headerIndexSubtitleColor ?? 'texteFort'}
                        onChange={(headerIndexSubtitleColor) => onChange({ headerIndexSubtitleColor })}
                        columns={3}
                      />
                      <StackSizePill
                        label="Size"
                        value={stack.headerIndexSubtitleSize ?? 'md'}
                        onChange={(headerIndexSubtitleSize) => onChange({ headerIndexSubtitleSize })}
                      />
                      <StackOptionGrid
                        label="Weight"
                        options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
                        value={stack.headerIndexSubtitleWeight ?? 'regular'}
                        onChange={(headerIndexSubtitleWeight: PortfolioStackHeaderTitleWeight) =>
                          onChange({ headerIndexSubtitleWeight })
                        }
                        columns={4}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <StackHeaderSharedAdvancedControls stack={stack} onChange={onChange} hideTitleControls />
                  </div>
                </>
              ) : stack.headerDesign === 'marquee' ? (
                <>
                  <div>
                    <StackSectionLabel>Words</StackSectionLabel>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 1</p>
                        <input
                          type="text"
                          value={stack.headerMarqueeWord1Text}
                          onChange={(event) => onChange({ headerMarqueeWord1Text: event.target.value })}
                          placeholder="Core"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 2</p>
                        <input
                          type="text"
                          value={stack.headerMarqueeWord2Text}
                          onChange={(event) => onChange({ headerMarqueeWord2Text: event.target.value })}
                          placeholder="Stack"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 3</p>
                        <input
                          type="text"
                          value={stack.headerMarqueeWord3Text}
                          onChange={(event) => onChange({ headerMarqueeWord3Text: event.target.value })}
                          placeholder="Optional"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 4</p>
                        <input
                          type="text"
                          value={stack.headerMarqueeWord4Text}
                          onChange={(event) => onChange({ headerMarqueeWord4Text: event.target.value })}
                          placeholder="Optional"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <StackSectionLabel>Style</StackSectionLabel>
                    <div className="mt-3 space-y-4">
                      <StackPreviewCardGrid
                        label="Word color"
                        options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: stackHeaderPaletteTokenGlyph(option.value),
                        }))}
                        value={stack.headerMarqueeWordColor ?? 'principal'}
                        onChange={(headerMarqueeWordColor) => onChange({ headerMarqueeWordColor })}
                        columns={3}
                      />
                      <StackSizePill
                        label="Size"
                        value={stack.headerMarqueeSize ?? 'md'}
                        onChange={(headerMarqueeSize) => onChange({ headerMarqueeSize })}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <StackHeaderSharedAdvancedControls stack={stack} onChange={onChange} hideAlignment hideTitleControls />
                  </div>
                </>
              ) : stack.headerDesign === 'accent-count' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Badge text</p>
                    <input
                      type="text"
                      value={stack.headerAccentCountBadgeText}
                      onChange={(event) => onChange({ headerAccentCountBadgeText: event.target.value })}
                      placeholder="{count}+ technologies"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Lead text</p>
                    <input
                      type="text"
                      value={stack.headerAccentCountLeadText}
                      onChange={(event) => onChange({ headerAccentCountLeadText: event.target.value })}
                      placeholder="A curated set of tools I rely on."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <StackPreviewCardGrid
                    label="Badge color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerAccentCountBadgeColor ?? 'principal'}
                    onChange={(headerAccentCountBadgeColor) => onChange({ headerAccentCountBadgeColor })}
                    columns={3}
                  />
                  <StackPreviewCardGrid
                    label="Lead color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerAccentCountLeadColor ?? 'secondaire'}
                    onChange={(headerAccentCountLeadColor) => onChange({ headerAccentCountLeadColor })}
                    columns={3}
                  />
                  <StackSizePill
                    label="Size"
                    value={stack.headerAccentCountSize ?? 'md'}
                    onChange={(headerAccentCountSize) => onChange({ headerAccentCountSize })}
                  />
                  <StackOptionGrid
                    label="Lead weight"
                    options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={stack.headerAccentCountWeight ?? 'regular'}
                    onChange={(headerAccentCountWeight: PortfolioStackHeaderTitleWeight) =>
                      onChange({ headerAccentCountWeight })
                    }
                    columns={4}
                  />
                  <StackOptionGrid
                    label="Alignment"
                    options={STACK_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
                    value={stack.headerAccentCountAlignment ?? 'left'}
                    onChange={(headerAccentCountAlignment: PortfolioStackHeaderAccentCountAlignment) =>
                      onChange({ headerAccentCountAlignment })
                    }
                    columns={3}
                  />
                  <StackHeaderSharedAdvancedControls stack={stack} onChange={onChange} hideAlignment hideTitleControls />
                </>
              ) : stack.headerDesign === 'serif-lead' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Label</p>
                    <input
                      type="text"
                      value={stack.headerSerifLeadLabelText}
                      onChange={(event) => onChange({ headerSerifLeadLabelText: event.target.value })}
                      placeholder="Stack"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <StackPreviewCardGrid
                    label="Label color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerSerifLeadLabelColor ?? 'texteFort'}
                    onChange={(headerSerifLeadLabelColor) => onChange({ headerSerifLeadLabelColor })}
                    columns={3}
                  />
                  <StackSizePill
                    label="Label size"
                    value={stack.headerSerifLeadLabelSize ?? 'md'}
                    onChange={(headerSerifLeadLabelSize) => onChange({ headerSerifLeadLabelSize })}
                  />
                  <StackOptionGrid
                    label="Label weight"
                    options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={stack.headerSerifLeadLabelWeight ?? 'regular'}
                    onChange={(headerSerifLeadLabelWeight: PortfolioStackHeaderTitleWeight) =>
                      onChange({ headerSerifLeadLabelWeight })
                    }
                    columns={4}
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Title</p>
                    <input
                      type="text"
                      value={stack.headerSerifLeadTitleText}
                      onChange={(event) => onChange({ headerSerifLeadTitleText: event.target.value })}
                      placeholder="A curated set of languages, frameworks, and tools."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <StackPreviewCardGrid
                    label="Title color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerSerifLeadTitleColor ?? 'texteFort'}
                    onChange={(headerSerifLeadTitleColor) => onChange({ headerSerifLeadTitleColor })}
                    columns={3}
                  />
                  <StackSizePill
                    label="Title size"
                    value={stack.headerSerifLeadTitleSize ?? 'md'}
                    onChange={(headerSerifLeadTitleSize) => onChange({ headerSerifLeadTitleSize })}
                  />
                  <StackOptionGrid
                    label="Title weight"
                    options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={stack.headerSerifLeadTitleWeight ?? 'regular'}
                    onChange={(headerSerifLeadTitleWeight: PortfolioStackHeaderTitleWeight) =>
                      onChange({ headerSerifLeadTitleWeight })
                    }
                    columns={4}
                  />
                  <StackPreviewCardGrid
                    label="Subtitle color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerSerifLeadSubtitleColor ?? 'texteFort'}
                    onChange={(headerSerifLeadSubtitleColor) => onChange({ headerSerifLeadSubtitleColor })}
                    columns={3}
                  />
                  <StackSizePill
                    label="Subtitle size"
                    value={stack.headerSerifLeadSubtitleSize ?? 'md'}
                    onChange={(headerSerifLeadSubtitleSize) => onChange({ headerSerifLeadSubtitleSize })}
                  />
                  <StackOptionGrid
                    label="Subtitle weight"
                    options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={stack.headerSerifLeadSubtitleWeight ?? 'regular'}
                    onChange={(headerSerifLeadSubtitleWeight: PortfolioStackHeaderTitleWeight) =>
                      onChange({ headerSerifLeadSubtitleWeight })
                    }
                    columns={4}
                  />
                  <StackHeaderSharedAdvancedControls stack={stack} onChange={onChange} hideTitleControls />
                </>
              ) : stack.headerDesign === 'billboard' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Big background word</p>
                    <input
                      type="text"
                      value={stack.headerBillboardBigWord}
                      onChange={(event) => onChange({ headerBillboardBigWord: event.target.value })}
                      placeholder="STACK"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Count line</p>
                    <input
                      type="text"
                      value={stack.headerBillboardCountText}
                      onChange={(event) => onChange({ headerBillboardCountText: event.target.value })}
                      placeholder="{count} technologies"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Title</p>
                    <input
                      type="text"
                      value={stack.headerBillboardTitleText}
                      onChange={(event) => onChange({ headerBillboardTitleText: event.target.value })}
                      placeholder="Core stack"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <StackPreviewCardGrid
                    label="Big word style"
                    options={STACK_HEADER_BILLBOARD_WORD_STYLE_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderBillboardWordStyleGlyph(option.value),
                    }))}
                    value={stack.headerBillboardWordStyle ?? 'outline'}
                    onChange={(headerBillboardWordStyle: PortfolioStackHeaderBillboardWordStyle) =>
                      onChange({ headerBillboardWordStyle })
                    }
                    columns={3}
                  />
                  <StackPreviewCardGrid
                    label="Big word color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerBillboardWordColor ?? 'principal'}
                    onChange={(headerBillboardWordColor) => onChange({ headerBillboardWordColor })}
                    columns={3}
                  />
                  <StackPreviewCardGrid
                    label="Title color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerBillboardTitleColor ?? 'principal'}
                    onChange={(headerBillboardTitleColor) => onChange({ headerBillboardTitleColor })}
                    columns={3}
                  />
                  <StackPreviewCardGrid
                    label="Count line color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerBillboardMetaColor ?? 'secondaire'}
                    onChange={(headerBillboardMetaColor) => onChange({ headerBillboardMetaColor })}
                    columns={3}
                  />
                  <StackHeaderSharedAdvancedControls stack={stack} onChange={onChange} hideAlignment hideTitleControls />
                </>
              ) : stack.headerDesign === 'masthead' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 1</p>
                    <input
                      type="text"
                      value={stack.headerMastheadLine1Text}
                      onChange={(event) => onChange({ headerMastheadLine1Text: event.target.value })}
                      placeholder="Core stack."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 2</p>
                    <input
                      type="text"
                      value={stack.headerMastheadLine2Text}
                      onChange={(event) => onChange({ headerMastheadLine2Text: event.target.value })}
                      placeholder="Chosen with intent."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 3</p>
                    <input
                      type="text"
                      value={stack.headerMastheadLine3Text}
                      onChange={(event) => onChange({ headerMastheadLine3Text: event.target.value })}
                      placeholder="Kept up to date."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <StackPreviewCardGrid
                    label="Headline color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerMastheadHeadlineColor ?? 'principal'}
                    onChange={(headerMastheadHeadlineColor) => onChange({ headerMastheadHeadlineColor })}
                    columns={3}
                  />
                  <StackSizePill
                    label="Headline size"
                    value={stack.headerMastheadHeadlineSize ?? 'md'}
                    onChange={(headerMastheadHeadlineSize) => onChange({ headerMastheadHeadlineSize })}
                  />
                  <StackOptionGrid
                    label="Headline weight"
                    options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={stack.headerMastheadHeadlineWeight ?? 'regular'}
                    onChange={(headerMastheadHeadlineWeight: PortfolioStackHeaderTitleWeight) =>
                      onChange({ headerMastheadHeadlineWeight })
                    }
                    columns={4}
                  />
                  <StackHeaderSharedAdvancedControls stack={stack} onChange={onChange} hideTitleControls />
                </>
              ) : stack.headerDesign === 'split-heading' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Title</p>
                    <input
                      type="text"
                      value={stack.headerSplitHeadingTitleText}
                      onChange={(event) => onChange({ headerSplitHeadingTitleText: event.target.value })}
                      placeholder="Core stack"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Label</p>
                    <input
                      type="text"
                      value={stack.headerSplitHeadingLabelText}
                      onChange={(event) => onChange({ headerSplitHeadingLabelText: event.target.value })}
                      placeholder="Stack"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <StackPreviewCardGrid
                    label="Title color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerSplitHeadingTitleColor ?? 'principal'}
                    onChange={(headerSplitHeadingTitleColor) => onChange({ headerSplitHeadingTitleColor })}
                    columns={3}
                  />
                  <StackSizePill
                    label="Title size"
                    value={stack.headerSplitHeadingTitleSize ?? 'md'}
                    onChange={(headerSplitHeadingTitleSize) => onChange({ headerSplitHeadingTitleSize })}
                  />
                  <StackOptionGrid
                    label="Title weight"
                    options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={stack.headerSplitHeadingTitleWeight ?? 'regular'}
                    onChange={(headerSplitHeadingTitleWeight: PortfolioStackHeaderTitleWeight) =>
                      onChange({ headerSplitHeadingTitleWeight })
                    }
                    columns={4}
                  />
                  <StackPreviewCardGrid
                    label="Label color"
                    options={STACK_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: stackHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={stack.headerSplitHeadingLabelColor ?? 'secondaire'}
                    onChange={(headerSplitHeadingLabelColor) => onChange({ headerSplitHeadingLabelColor })}
                    columns={3}
                  />
                  <StackSizePill
                    label="Label size"
                    value={stack.headerSplitHeadingLabelSize ?? 'md'}
                    onChange={(headerSplitHeadingLabelSize) => onChange({ headerSplitHeadingLabelSize })}
                  />
                  <StackOptionGrid
                    label="Label weight"
                    options={STACK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={stack.headerSplitHeadingLabelWeight ?? 'regular'}
                    onChange={(headerSplitHeadingLabelWeight: PortfolioStackHeaderTitleWeight) =>
                      onChange({ headerSplitHeadingLabelWeight })
                    }
                    columns={4}
                  />
                  <StackHeaderSharedAdvancedControls stack={stack} onChange={onChange} hideAlignment hideTitleControls />
                </>
              ) : (
                <>
                  <StackToggleRow
                    label="Header motion"
                    info="Respects reduced-motion preference"
                    checked={stack.headerAnimationEnabled !== false}
                    onChange={(headerAnimationEnabled) => onChange({ headerAnimationEnabled })}
                  />
                  <StackHeaderSharedAdvancedControls stack={stack} onChange={onChange} />
                </>
              )}
            </StackLayoutSettingsBand>
          </div>
        </div>
      ) : null}
    </div>
  );
}
