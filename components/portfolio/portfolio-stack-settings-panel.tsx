'use client';

import { useId, useState, type ReactNode } from 'react';
import { stackDesignSettingsPatch } from '@/components/portfolio/portfolio-stack-design-patch';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { DEFAULT_STACK_PRESENTATION, PORTFOLIO_STACK_ASIDE_TITLE_PLACEMENT_OPTIONS, PORTFOLIO_STACK_DESIGN_OPTIONS, PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS, PORTFOLIO_STACK_SECTION_LAYOUT_OPTIONS, PORTFOLIO_STACK_TAGS_SIZE_OPTIONS, PORTFOLIO_STACK_TITLE_PRESET_OPTIONS, STACK_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS, STACK_HEADER_BILLBOARD_WORD_STYLE_OPTIONS, STACK_HEADER_PALETTE_TOKEN_OPTIONS, stackHeaderPaletteTokenColor, stackLevelIndicatorDesignSupportsCardFrame, stackSectionLayoutIsAside, type PortfolioStackAsideTitlePlacement, type PortfolioStackDesign, type PortfolioStackHeaderDesign, type PortfolioStackSectionLayout, type PortfolioStackSectionSettings, type PortfolioStackTagsSize } from '@/components/portfolio/portfolio-stack-settings';
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
import { DEFAULT_TOOLS_COLOR_BINDINGS, DEFAULT_TOOLS_PALETTE, mergeToolsColorBindings, mergeToolsPalette, patchToolsColorBinding, type ToolsColorSlot } from '@/components/portfolio/portfolio-tools-palette-settings';
import { resolveHeroPaletteColor, type HeroPaletteTokenId } from '@/components/portfolio/portfolio-hero-palette-settings';
import { PortfolioHeaderDesignOption } from '@/components/portfolio/portfolio-header-design-lock';
import { HeaderDesignFields, type HeaderCopy } from '@/components/portfolio/portfolio-header-design-fields';
import type { HeaderPatch } from '@/components/portfolio/portfolio-header-style-controls';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import {
  NpBackRow,
  NpCollapsibleSection,
  NpOptionCard,
  NpOptionCardGroup,
  NpPanelShell,
  NpPickerRow,
  NpSegmentedControl,
  NpToggleRow,
  type NpPanelChrome,
} from '@/components/portfolio/portfolio-nav-panel-ui';

/** Same general / design / header mechanism as the Experience section settings panel, plus its own Background tab.
 *  Header is one shared, GSAP-animated header (copied from the Portfolio/Work section's Header mechanism)
 *  mounted above the section, independent of Design's per-design layout. */
export type StackSubSection = 'general' | 'design' | 'header' | 'background';

const SUBSECTIONS: { value: StackSubSection; label: string }[] = [
  { value: 'general', label: msg('General') },
  { value: 'design', label: msg('Design') },
  { value: 'header', label: msg('Header') },
  { value: 'background', label: msg('Background') },
];

export function normalizeStackSubSection(value: string | undefined): StackSubSection {
  return SUBSECTIONS.some((item) => item.value === value) ? (value as StackSubSection) : 'design';
}

/** Curated 3-option quick palette for Name / Description text colors — separate from the full 8-token dropdown. */
const STACK_QUICK_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'principal', label: msg('Primary') },
  { value: 'texteFort', label: msg('Strong text') },
  { value: 'texteMuted', label: msg('Muted text') },
];

/** For section-background-style fields (fill, gradient stops, split zones) — "fond"/"neutre"
 *  fit that context better than "texte fort", which is why this isn't just STACK_QUICK_PALETTE_TOKENS. */
const STACK_BACKGROUND_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: msg('Background') },
  { value: 'neutre', label: msg('Neutral') },
  { value: 'principal', label: msg('Primary') },
  { value: 'texteMuted', label: msg('Muted text') },
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
  const t = useT();
  return (
    <div className="np-field">
      <p className="np-field-label">{label}</p>
      <div className="flex flex-wrap items-center gap-3">
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
              className="group flex min-w-[58px] flex-col items-center gap-1.5"
            >
              <span
                className="h-8 w-8 rounded-full border-2 transition"
                style={{
                  backgroundColor: hex,
                  borderColor: active ? 'var(--np-accent)' : 'var(--np-border)',
                  boxShadow: active ? '0 0 0 2px color-mix(in srgb, var(--np-accent) 22%, transparent)' : 'none',
                }}
              />
              <span className={`text-[11px] font-medium ${active ? 'text-[color:var(--np-text)]' : 'text-[color:var(--np-muted)]'}`}>
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

function StackDesignWireframe({ design }: { design: PortfolioStackDesign }) {
  const t = useT();
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
            {t('CSS')}
          </StackMiniType>
          <circle className="pf-stack-mini-ring" cx="60" cy="32" r="16" strokeWidth={3} />
          <StackMiniType x={60} y={34} size={6} anchor="middle">
            {t('JS')}
          </StackMiniType>
          <circle className="pf-stack-mini-ring" cx="96" cy="32" r="16" strokeWidth={3} />
          <StackMiniType x={96} y={34} size={6} anchor="middle">
            {t('GO')}
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

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus
 *  instead of a permanent line of text under a toggle. */
function StackInfoTooltip({ text }: { text: string }) {
  const t = useT();
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
        aria-label={t('More info: {text}', { text })}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => event.stopPropagation()}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[color:var(--np-muted)] transition hover:text-[color:var(--np-text)] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--np-accent)]"
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
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-[color:var(--np-primary-bg,#171717)] px-2.5 py-1.5 text-xs font-medium leading-snug text-[color:var(--np-primary-ink,#ffffff)] shadow-lg"
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
    <NpToggleRow
      title={label}
      checked={checked}
      onChange={onChange}
      adornment={info ? <StackInfoTooltip text={info} /> : undefined}
    />
  );
}

function StackOptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns: _columns,
  icons: _icons,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  icons?: Partial<Record<string, ReactNode>>;
}) {
  const t = useT();
  return (
    <NpSegmentedControl
      label={label}
      value={String(value)}
      options={options.map((option) => ({
        value: String(option.value),
        label: t(option.label),
        title: t(option.description),
      }))}
      onChange={(next) => {
        const option = options.find((item) => String(item.value) === next);
        if (option) onChange(option.value);
      }}
    />
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
  const t = useT();
  if (options.length > 4) {
    return (
      <div className="np-field">
        <p className="np-field-label">{label}</p>
        <div className="np-chips" role="group" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="np-chip"
              aria-pressed={option.value === value}
              onClick={() => onChange(option.value)}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <NpSegmentedControl
      label={label}
      value={value}
      options={options.map((option) => ({
        value: option.value,
        label: t(option.label),
      }))}
      onChange={onChange}
    />
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
  const t = useT();
  const cols = (columns ?? Math.min(options.length, 4)) as 2 | 3 | 4;
  return (
    <NpOptionCardGroup label={label} columns={cols}>
        {options.map((option) => (
          <NpOptionCard
            key={option.value}
            selected={option.value === value}
            title={t(option.label)}
            onClick={() => onChange(option.value)}
            compact
            illustration={<svg viewBox="0 0 64 34" className="pf-stack-mini h-full w-full" aria-hidden>
              <rect className="pf-stack-mini-stage" x="0.75" y="0.75" width="62.5" height="32.5" rx="6" />
              {option.glyph}
            </svg>}
          />
        ))}
    </NpOptionCardGroup>
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
    <NpPickerRow
      label={label}
      value={name}
      onClick={onOpen}
      thumbnail={
        <span className="flex w-[116px] shrink-0 origin-center scale-[1.05] items-center justify-center">
          {children}
        </span>
      }
    />
  );
}

/** Same collapsed-preview / expand-to-grid mechanism as Hero > Design Banner: shows only the
 *  active design at a glance, with a "Change" affordance that reveals the full grid to pick
 *  from — picking a card re-collapses back to the single preview. */
function StackDesignChoiceGrid({
  value,
  onChange,
  open: showGrid,
  onOpenChange: setShowGrid,
}: {
  value: PortfolioStackDesign;
  onChange: (value: PortfolioStackDesign) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const selected =
    PORTFOLIO_STACK_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_STACK_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div className="np-stack">
        <NpBackRow title={t('Stack design')} onBack={() => setShowGrid(false)} />
        <NpOptionCardGroup label={t('Choose a design')} columns={2}>
          {PORTFOLIO_STACK_DESIGN_OPTIONS.map((option) => (
            <NpOptionCard
              key={option.value}
              selected={option.value === value}
              title={t(option.label)}
              illustration={<StackDesignWireframe design={option.value} />}
              onClick={() => {
                onChange(option.value);
                setShowGrid(false);
              }}
            />
          ))}
        </NpOptionCardGroup>
      </div>
    );
  }

  return (
    <StackDesignSummaryRow label={t('Design')} name={selected.label} onOpen={() => setShowGrid(true)}>
      <StackDesignWireframe design={value} />
    </StackDesignSummaryRow>
  );
}

/** Mini wireframes for the 8 Header design picker cards — same StackMiniSlide mechanism as Header. */
function StackHeaderDesignWireframe({ design }: { design: PortfolioStackHeaderDesign }) {
  const t = useT();
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
            {t('STACK')}
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
            {t('STACK')}
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
  open: showGrid,
  onOpenChange: setShowGrid,
}: {
  value: PortfolioStackHeaderDesign;
  onChange: (value: PortfolioStackHeaderDesign) => void;
  /** Whether the catalog of designs is open (owned by the panel so it can hide the settings below). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const selected =
    PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div className="np-stack">
        <NpBackRow title={t('Header design')} onBack={() => setShowGrid(false)} />
        <NpOptionCardGroup label={t('Choose a header')} columns={2}>
          {PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS.map((option) => (
            <PortfolioHeaderDesignOption key={option.value} design={option.value}>
              <NpOptionCard
                selected={option.value === value}
                title={t(option.label)}
                illustration={<StackHeaderDesignWireframe design={option.value} />}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              />
            </PortfolioHeaderDesignOption>
          ))}
        </NpOptionCardGroup>
      </div>
    );
  }

  return (
    <StackDesignSummaryRow label={t('Header design')} name={selected.label} onOpen={() => setShowGrid(true)}>
      <StackHeaderDesignWireframe design={value} />
    </StackDesignSummaryRow>
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

function handleStackDesignChange(
  stack: PortfolioStackSectionSettings,
  design: PortfolioStackDesign,
  onChange: (patch: Partial<PortfolioStackSectionSettings>) => void
) {
  onChange(stackDesignSettingsPatch(stack, design));
}

type StackSettingsPanelProps = {
  stack: PortfolioStackSectionSettings;
  onChange: (patch: Partial<PortfolioStackSectionSettings>) => void;
  subSection?: StackSubSection;
  onSubSectionChange?: (value: StackSubSection) => void;
  chrome?: NpPanelChrome;
};

const DEFAULT_STACK_SECTION_SETTINGS: PortfolioStackSectionSettings = {
  enabled: true,
  title: 'Core Stack',
  subtitle: '',
  ...DEFAULT_STACK_PRESENTATION,
};

function stackSettingsModified(stack: PortfolioStackSectionSettings) {
  const keys = Object.keys({ ...DEFAULT_STACK_SECTION_SETTINGS, ...stack }) as (
    keyof PortfolioStackSectionSettings
  )[];
  return keys.some((key) => {
    const current = stack[key] === undefined ? DEFAULT_STACK_SECTION_SETTINGS[key] : stack[key];
    return JSON.stringify(current) !== JSON.stringify(DEFAULT_STACK_SECTION_SETTINGS[key]);
  });
}

function StackHiddenNotice({ onEnable }: { onEnable: () => void }) {
  const t = useT();
  return (
    <div className="np-toggle-card flex-col !items-stretch gap-4">
      <div>
        <p className="np-card-title">{t('Stack section is hidden')}</p>
        <p className="np-subtle mt-1">{t('Enable it to edit this tab and show it in the portfolio.')}</p>
      </div>
      <button type="button" className="np-primary-btn" onClick={onEnable}>
        {t('Show Stack section')}
      </button>
    </div>
  );
}

const STACK_HEADER_COPY: HeaderCopy = {
  editorial: { label: msg('Stack'), title: msg('Core stack'), subtitle: msg('Languages, frameworks, and tools.') },
  index: { rule: 'Index', title: msg('Core stack'), subtitle: msg('Languages, frameworks, and tools.'), count: 'Technologies' },
  marquee: ['Stack', 'Optional', 'Optional', 'Optional'],
  accent: { badge: '{count}+ technologies', lead: 'A curated set of tools I rely on.' },
  serif: { label: msg('Stack'), title: msg('A curated set of languages, frameworks, and tools.'), subtitle: msg('Languages, frameworks, and tools.') },
  billboard: { word: 'STACK', title: msg('Core stack'), count: '{count} technologies' },
  masthead: ['Core stack.', 'Chosen with intent.', 'Kept up to date.'],
  split: { title: msg('Core stack'), label: msg('Stack') },
};

/** The Header tab body: this design's texts, one style editor, then the controls every design shares. */
function StackHeaderDesignFields({
  stack,
  onChange,
}: {
  stack: PortfolioStackSectionSettings;
  onChange: (patch: Partial<PortfolioStackSectionSettings>) => void;
}) {
  const onPatch = (patch: HeaderPatch) => onChange(patch as Partial<PortfolioStackSectionSettings>);
  return (
    <HeaderDesignFields
      settings={stack}
      onPatch={onPatch}
      copy={STACK_HEADER_COPY}
      colorOptions={STACK_HEADER_PALETTE_TOKEN_OPTIONS}
      resolveColor={stackHeaderPaletteTokenColor}
      accentAlignmentOptions={STACK_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
      billboardStyleOptions={STACK_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
    />
  );
}

export function StackSettingsPanel({
  stack,
  onChange,
  subSection = 'design',
  onSubSectionChange,
  chrome,
}: StackSettingsPanelProps) {
  const t = useT();
  const palette = mergeToolsPalette(DEFAULT_TOOLS_PALETTE, stack.toolsPalette);
  const bindings = mergeToolsColorBindings(DEFAULT_TOOLS_COLOR_BINDINGS, stack.toolsColorBindings);
  const current = normalizeStackSubSection(subSection);
  const [designCatalogOpen, setDesignCatalogOpen] = useState(false);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(false);
  const sectionLayout = stack.sectionLayout ?? 'stacked';
  const stackAside = stackSectionLayoutIsAside(sectionLayout);
  const isLevelIndicatorDesign =
    stack.design === 'level-progress-rows' ||
    stack.design === 'level-category-rows' ||
    stack.design === 'level-table-rows' ||
    stack.design === 'level-circular-cards' ||
    stack.design === 'level-star-cards' ||
    stack.design === 'level-svg-rings' ||
    stack.design === 'level-bento-categories';
  const modified = stackSettingsModified(stack);

  return (
    <NpPanelShell
      title={t('Stack')}
      modified={modified}
      tabs={SUBSECTIONS.map((item) => ({ id: item.value, label: t(item.label) }))}
      activeTab={current}
      onTabChange={(value) => onSubSectionChange?.(value)}
      onReset={() => onChange({ ...DEFAULT_STACK_SECTION_SETTINGS })}
      chrome={chrome}
    >

      {current === 'general' ? (
        <div className="np-stack">
          <NpToggleRow
            card
            title={t('Show Stack section')}
            description={stack.enabled ? undefined : t('Visitors go straight to the next section.')}
            checked={stack.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <div
            className="np-dimmable"
            data-disabled={stack.enabled ? 'false' : 'true'}
            aria-disabled={!stack.enabled}
            inert={!stack.enabled}
          >
          <NpCollapsibleSection title={t('Title')}>
            <StackOptionGrid
              label={t('Wording')}
              value={stack.titlePreset}
              options={PORTFOLIO_STACK_TITLE_PRESET_OPTIONS}
              onChange={(titlePreset) => onChange({ titlePreset })}
            />
            {stack.titlePreset === 'custom' ? (
              <label className="np-field block">
                <span className="np-field-label">{t('Custom title')}</span>
                <input
                  type="text"
                  value={stack.titleCustom}
                  onChange={(event) => onChange({ titleCustom: event.target.value })}
                  className="np-input"
                  placeholder={t('Core Stack')}
                />
              </label>
            ) : null}
            <StackOptionGrid
              label={t('Subtitle')}
              value={stack.subtitlePreset ?? 'none'}
              options={PORTFOLIO_TOOLS_SUBTITLE_PRESET_OPTIONS}
              onChange={(subtitlePreset: PortfolioToolsSubtitlePreset) => onChange({ subtitlePreset })}
            />
            {stack.subtitlePreset === 'custom' ? (
              <label className="np-field block">
                <span className="np-field-label">{t('Subtitle text')}</span>
                <textarea
                  rows={3}
                  value={stack.subtitleCustom || stack.subtitle}
                  onChange={(event) =>
                    onChange({ subtitleCustom: event.target.value, subtitle: event.target.value })
                  }
                  className="np-input min-h-24 resize-y"
                  placeholder={t('Languages, frameworks, and platforms I use to ship reliable products.')}
                />
              </label>
            ) : null}
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Layout')}>
            <StackPreviewCardGrid
              label={t('Title / list layout')}
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
                  label={t('Vertical title alignment')}
                  value={stack.asideTitlePlacement ?? 'center'}
                  options={PORTFOLIO_STACK_ASIDE_TITLE_PLACEMENT_OPTIONS}
                  onChange={(asideTitlePlacement: PortfolioStackAsideTitlePlacement) =>
                    onChange({ asideTitlePlacement })
                  }
                />
                <StackToggleRow
                  label={t('Sticky title on scroll')}
                  checked={stack.asideTitleSticky !== false}
                  onChange={(asideTitleSticky) => onChange({ asideTitleSticky })}
                />
              </>
            ) : null}
          </NpCollapsibleSection>
          </div>
        </div>
      ) : null}

      {current !== 'general' && !stack.enabled ? <StackHiddenNotice onEnable={() => onChange({ enabled: true })} /> : null}

      {current === 'design' && stack.enabled ? (
        designCatalogOpen ? (
          <StackDesignChoiceGrid
            value={stack.design}
            onChange={(design) => handleStackDesignChange(stack, design, onChange)}
            open
            onOpenChange={setDesignCatalogOpen}
          />
        ) : (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Presentation')}>
          {PORTFOLIO_STACK_DESIGN_OPTIONS.length > 1 ? (
            <StackDesignChoiceGrid
              value={stack.design}
              onChange={(design) => handleStackDesignChange(stack, design, onChange)}
              open={false}
              onOpenChange={setDesignCatalogOpen}
            />
          ) : null}
            <SectionColorModeControl
              label={t('Color mode')}
              value={stack.colorModeOverride}
              onChange={(colorModeOverride) => onChange({ colorModeOverride })}
            />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Layout options')}>
          {stack.design === 'stack-tags' ? (
            <StackOptionGrid
              label={t('Tag alignment')}
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
                label={t('Tag size')}
                value={stack.stackTagsSize ?? 'medium'}
                options={PORTFOLIO_STACK_TAGS_SIZE_OPTIONS}
                onChange={(stackTagsSize: PortfolioStackTagsSize) => onChange({ stackTagsSize })}
              />
              <StackSlider
                label={t('Tag spacing')}
                value={stack.cardGap}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
            </>
          ) : (
            <StackSlider
              label={t('Logo size')}
              value={stack.tileSize}
              options={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS}
              onChange={(tileSize: PortfolioToolsTileSize) => onChange({ tileSize })}
            />
          )}
          {isLevelIndicatorDesign ? (
            <>
              {stack.design !== 'level-star-cards' ? (
                <StackSlider
                  label={t('Vertical spacing')}
                  value={stack.levelProgressRowGap ?? 'large'}
                  options={PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS}
                  onChange={(levelProgressRowGap: PortfolioToolsLevelProgressRowGap) =>
                    onChange({ levelProgressRowGap })
                  }
                />
              ) : null}
              {stack.design !== 'level-progress-rows' && stack.design !== 'level-category-rows' ? (
                <StackToggleRow
                  label={t('Full width')}
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
                label={t('Row order')}
                value={stack.levelTableGroupBy ?? 'category'}
                options={PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS}
                onChange={(levelTableGroupBy: PortfolioToolsLevelTableGroupBy) =>
                  onChange({ levelTableGroupBy })
                }
              />
              <StackToggleRow
                label={t('Category filter')}
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
                  label={t('Level display')}
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
                label={t('Card frame')}
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
                label={t('List alignment')}
                value={stack.levelProgressContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(levelProgressContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ levelProgressContentAlignment })
                }
              />
              {stack.design === 'level-table-rows' ? null : stackAside ? null : (
                <StackPreviewCardGrid
                  label={t('Columns (large screen)')}
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
                  label={t('Full width')}
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
                label={t('Card spacing')}
                value={stack.cardGap ?? 'medium'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
              <StackPreviewCardGrid
                label={t('Grid layout')}
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
                label={t('Content alignment')}
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
                  ? t('Row spacing')
                  : stack.design === 'brand-row'
                    ? (stack.brandRowCellStyle ?? 'dividers') === 'frames'
                      ? t('Spacing between frames')
                      : (stack.brandRowCellStyle ?? 'dividers') === 'none'
                        ? t('Spacing between cells')
                        : t('Cell spacing')
                    : t('Card spacing')
              }
              value={stack.cardGap ?? 'tight'}
              options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
              onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
            />
          ) : null}
          {stack.design === 'level-progress-rows' || stack.design === 'level-category-rows' ? (
            <>
              <StackPreviewCardGrid
                label={t('Bar style')}
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
                    ? t('Thickness & % size')
                    : t('Bar & % size')
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
                label={t('Icon placement')}
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
                  label={t('Columns (large screen)')}
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
                label={t('Content alignment')}
                value={stack.brandCardsContentAlignment ?? 'left'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(brandCardsContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandCardsContentAlignment })
                }
              />
              <StackSlider
                label={t('Card spacing')}
                value={stack.cardGap ?? 'tight'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
              <StackToggleRow
                label={t('Full width')}
                checked={stack.brandCardsFullWidth === true}
                onChange={(brandCardsFullWidth) => onChange({ brandCardsFullWidth })}
              />
            </>
          ) : null}
          {stack.design === 'level-star-cards' ? (
            <>
              <StackSlider
                label={t('Card spacing')}
                value={stack.cardGap ?? 'medium'}
                options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
                onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
              />
              <StackOptionGrid
                label={t('Content alignment')}
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
                  label={t('Columns (large screen)')}
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
                label={t('Content alignment')}
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
                label={t('Content alignment')}
                value={stack.brandIndexContentAlignment ?? 'left'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(brandIndexContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ brandIndexContentAlignment })
                }
              />
              <StackToggleRow
                label={t('Full width (1 per row)')}
                checked={stack.brandIndexFullWidth !== false}
                onChange={(brandIndexFullWidth) => onChange({ brandIndexFullWidth })}
              />
              <StackToggleRow
                label={t('Category filter')}
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
                label={t('Cell style')}
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
                label={t('Columns (large screen)')}
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
                label={t('Content alignment')}
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
            <>
              <StackOptionGrid
                label={t('Logo visibility')}
                value={stack.workflowRailLogoTreatment ?? 'vivid'}
                options={[
                  {
                    value: 'vivid',
                    label: msg('Vivid colors'),
                    description: msg('Maximum clarity and faithful brand colors.'),
                  },
                  {
                    value: 'soft',
                    label: msg('Soft colors'),
                    description: msg('Lower saturation for a quieter editorial look.'),
                  },
                ]}
                onChange={(workflowRailLogoTreatment: 'vivid' | 'soft') =>
                  onChange({ workflowRailLogoTreatment })
                }
              />
              <StackOptionGrid
                label={t('Content alignment')}
                value={stack.workflowRailContentAlignment ?? 'center'}
                options={PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS}
                icons={STACK_ALIGNMENT_ICONS}
                onChange={(workflowRailContentAlignment: PortfolioToolsContentAlignment) =>
                  onChange({ workflowRailContentAlignment })
                }
              />
            </>
          ) : null}
          </NpCollapsibleSection>
        </div>
        )
      ) : null}

      {current === 'background' && stack.enabled ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Background')}>
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
          </NpCollapsibleSection>
        </div>
      ) : null}

      {current === 'header' && stack.enabled ? (
        headerCatalogOpen ? (
          <StackHeaderChoiceGrid
            value={stack.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
            open
            onOpenChange={setHeaderCatalogOpen}
          />
        ) : (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Header design')}>
          <StackHeaderChoiceGrid
            value={stack.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
            open={false}
            onOpenChange={setHeaderCatalogOpen}
          />
          </NpCollapsibleSection>

          {/* Browsing the catalog is a different task from tuning the chosen design: no settings below it. */}
          <NpCollapsibleSection title={t('Header settings')}>
            <StackHeaderDesignFields stack={stack} onChange={onChange} />
          </NpCollapsibleSection>
        </div>
        )
      ) : null}
    </NpPanelShell>
  );
}
