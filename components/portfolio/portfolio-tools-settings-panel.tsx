'use client';
import { TextSizeSlider, SECTION_TEXT_SIZE_OPTIONS } from './portfolio-text-size-slider';
import { StackRailControls } from './portfolio-stack-rail-controls';
import { StackBrandControls } from './portfolio-stack-brand-controls';
import { StackBentoControls } from './portfolio-stack-bento-controls';
import { StackCircularControls } from './portfolio-stack-circular-controls';
import { StackStarControls } from './portfolio-stack-star-controls';
import { ToolsControlGroups } from './portfolio-tools-control-groups';
import { LevelSample, TableLevelSample } from './portfolio-stack-progress-controls';
import controlStyles from './portfolio-stack-rail-controls.module.css';
import { PortfolioDesignLivePreview, usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import {StackPreviewSkeleton} from './portfolio-stack-preview-skeleton';
import {StackHeaderSkeleton} from './portfolio-stack-header-skeleton';
import { ToolsDesignWireframe } from './portfolio-tools-design-skeleton';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { ColorSwatchRow } from '@/components/portfolio/portfolio-color-swatch-row';
import { CardsStyleControls } from '@/components/portfolio/portfolio-cards-style-controls';
import { DEFAULT_CARDS_STYLE } from '@/components/portfolio/portfolio-cards-style';
import { useId, useState, type ReactNode } from 'react';
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
  PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS,
  PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS,
  TOOLS_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  TOOLS_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  TOOLS_HEADER_PALETTE_TOKEN_OPTIONS,
  DEFAULT_TOOLS_PRESENTATION,
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
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import {
  NpCollapsibleSection,
  NpBackRow,
  NpPanelShell,
  NpSegmentedControl,
  NpToggleRow,
  type NpPanelChrome,
} from '@/components/portfolio/portfolio-nav-panel-ui';

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
  { value: 'secondaire', label: msg('Secondary') },
  { value: 'texteFort', label: msg('Strong text') },
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
    const options = tokens.map((token) => ({
    value: token.value as string,
    label: token.label,
    color: resolveHeroPaletteColor(palette, token.value),
  }));
  const current = activeToken
    ? (activeToken as string)
    : (options.find((option) => option.color.toLowerCase() === activeHex?.trim().toLowerCase())?.value ?? '');
  return (
    <ColorSwatchRow
      label={label}
      options={options}
      value={current}
      onChange={(next) => onPickToken(next as HeroPaletteTokenId)}
    />
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
    <div className="np-field">
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
    </div>
  );
}


function _ToolsPickerCard({
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


/** Same animated switch + segmented option grid as Stack's layout settings (StackSwitchTrack/StackOptionGrid). */
function _ToolsSwitchTrack({ checked }: { checked: boolean }) {
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
  return <NpToggleRow title={label} adornment={info ? <ToolsInfoTooltip text={info} /> : undefined} checked={checked} onChange={onChange} />;
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
  const count = columns ?? Math.min(options.length, 4);
  return <div><p className={controlStyles.label}>{label}</p><div className={count===4?controlStyles.spacing:count===3?controlStyles.alignment:controlStyles.colors} role="group" aria-label={label}>
    {options.map((option,index)=><button key={option.value} type="button" className={controlStyles.choice} aria-pressed={value===option.value}
      title={option.description?t(option.description):undefined} onClick={()=>onChange(option.value)}>
      {icons?.[String(option.value)] ?? <svg width="42" height="28" viewBox="0 0 42 28" fill="currentColor" aria-hidden>
        {[0,1,2].map(row=><rect key={row} x="3" y={4+row*8} width={String(option.value)==='level'?34-row*9:String(option.value)==='category'&&row===0?12:30-index*4} height="3" rx="1"/>)}</svg>}
      <span>{t(option.label)}</span></button>)}
  </div></div>;
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
  if (options===PORTFOLIO_TOOLS_CARD_GAP_OPTIONS || options===PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS) {
    return <div><p className={controlStyles.label}>{label}</p><div className={controlStyles.spacing} role="group" aria-label={label}>
      {options.map((option,index)=><button key={option.value} type="button" className={controlStyles.choice} aria-pressed={value===option.value} onClick={()=>onChange(option.value)}>
        <svg width="36" height="32" viewBox="0 0 36 32" fill="currentColor" aria-hidden>{[-1,0,1].map(row=><rect key={row} x="4" y={14+row*[4,7,10,13][index]} width="28" height="3" rx="1"/>)}</svg>
        <span>{index===3?'XL':t(option.label)}</span></button>)}
    </div></div>;
  }
  const current=options.find(option=>option.value===value)??options[0];
  const ticks=options.length===5?['XS','S','M','L','XL']:options.length===4?['S','M','L','XL']:options.map(option=>t(option.label));
  return <div className="np-text-size-slider"><HeaderSteppedSlider label={label} value={current.value} currentName={t(current.label)}
    steps={options.map((option,index)=>({value:option.value,tick:ticks[index]}))} onChange={onChange}/></div>;
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
  const cols = columns ?? Math.min(options.length, 4);
  return (
    <div><p className={controlStyles.label}>{label}</p><div className={cols===4?controlStyles.spacing:cols===3?controlStyles.alignment:controlStyles.colors} role="group" aria-label={label}>
        {options.map((option) => (
          <button type="button" className={controlStyles.choice}
            key={option.value}
            aria-pressed={option.value === value}
            title={t(option.label)}
            onClick={() => onChange(option.value)}
          >{options.some(item=>item.value==='pill-gradient') ? <LevelSample value={option.value}/> : options.some(item=>item.value==='progress-bar') ? <TableLevelSample value={option.value}/> : <svg viewBox="0 0 64 34" className={`pf-stack-mini ${controlStyles.neutralPreview}`} width="64" height="34" aria-hidden>
              {option.glyph}
            </svg>}<span>{t(option.label)}</span></button>
        ))}
    </div></div>
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
  return <><rect className="pf-stack-mini-ring" x="6" y="3" width="52" height="28" rx="4" strokeWidth={1.8} /><rect className="pf-stack-mini-ink" x="13" y="10" width="9" height="9" rx="2"/><path d="M28 12h22M28 19h16M13 25h37" stroke="currentColor" strokeWidth="2"/></>;
}

function toolsCardFramePlainGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-stack-mini-ink" x="13" y="10" width="9" height="9" rx="2"/>
      <path d="M28 12h22M28 19h16M13 25h37" stroke="currentColor" strokeWidth="2"/>
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
function _ToolsDesignSummaryRow({
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

function ToolsDesignChoiceGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid,options=PORTFOLIO_TOOLS_DESIGN_OPTIONS}:{value:PortfolioToolsDesign;onChange:(value:PortfolioToolsDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void;options: {value:PortfolioToolsDesign;label:string;description:string}[]}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const theme=useThumbnailTheme('tools');
 const selected=options.find(option=>option.value===value)??PORTFOLIO_TOOLS_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_TOOLS_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return (
  <div className="flex flex-col gap-8" aria-label={t('Choose a design')}>
   {options.map(option => {
    const skeleton = <StackPreviewSkeleton section="tools"><ToolsDesignWireframe design={option.value}/></StackPreviewSkeleton>;
    return (
     <DesignCatalogueCard key={option.value} label={t(option.label)} selected={value === option.value} previewBackground={theme.background}
      onSelect={() => onChange(option.value)}
      onCustomize={() => { if (value !== option.value) onChange(option.value); setShowGrid(false); }}>
      <span className="relative block aspect-[3/1] w-full" style={{backgroundColor:theme.background}}>
       {previewSource ? <PortfolioDesignLivePreview
        src={`${withDesignPreview(previewSource.portfolioPath, { section: 'tools', design: option.value })}&previewRevision=tools-fictional-compact-v5`}
        settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={skeleton} animateSkeleton={false} backgroundColor={theme.background}
       /> : skeleton}
      </span>
     </DesignCatalogueCard>
    );
   })}
  </div>
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
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[color:var(--pf-palette-texte-muted)] transition hover:text-[color:var(--pf-palette-texte-fort)] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-400"
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

/** Large header anatomy shared with the Stack and Info catalogues. */
function ToolsHeaderDesignWireframe({ design }: { design: PortfolioToolsHeaderDesign }) {
 return <StackPreviewSkeleton section="tools"><StackHeaderSkeleton design={design} compact word="TOOLS" title="My tools" lead="My" count="08"/></StackPreviewSkeleton>;
}

/** Same collapsed-preview / expand-to-grid mechanism as Design above and Hero > Design Banner. */
function ToolsHeaderDesignChoiceGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioToolsHeaderDesign;onChange:(value:PortfolioToolsHeaderDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const theme=useThumbnailTheme('tools');
 const selected=PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return <div className="flex flex-col gap-8" aria-label={t('Choose a header')}>{PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS.map(option=>{
  if(option.value==='none')return <button key={option.value} type="button" aria-pressed={value===option.value} onClick={()=>onChange(option.value)} className="flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-sm font-medium transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2" style={{borderColor:value===option.value?'var(--pf-palette-principal,#f97316)':'color-mix(in srgb,currentColor 18%,transparent)'}}>{t(option.label)}</button>;
  const skeleton=<ToolsHeaderDesignWireframe design={option.value}/>;
  return <PortfolioHeaderDesignOption key={option.value} design={option.value}><DesignCatalogueCard label={t(option.label)} selected={value===option.value} previewBackground={theme.background} onSelect={()=>onChange(option.value)} onCustomize={()=>{if(value!==option.value)onChange(option.value);setShowGrid(false);}}><span className="relative block aspect-[3/1] w-full" style={{backgroundColor:theme.background}}>{previewSource?<PortfolioDesignLivePreview src={withDesignPreview(previewSource.portfolioPath,{section:'toolsHeader',design:option.value})+'&previewRevision=tools-header-compact-v4'} settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={skeleton} animateSkeleton={false} backgroundColor={theme.background}/>:skeleton}</span></DesignCatalogueCard></PortfolioHeaderDesignOption>;
 })}</div>;
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
        {/* The index layout (counter | rule | title) is always left-aligned. */}
        {shared({ hideAlignment: true, hideTitleControls: true })}
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
  chrome?: NpPanelChrome;
};

const DEFAULT_TOOLS_SECTION_SETTINGS: PortfolioToolsSectionSettings = {
  enabled: true,
  title: 'Workflow & Tools',
  subtitle: '',
  ...DEFAULT_TOOLS_PRESENTATION,
};

export function ToolsSettingsPanel({
  tools,
  onChange,
  subSection = 'design',
  onSubSectionChange,
  designOptions: designOptionsProp,
  designOptionsFilter,
  sectionToggleLabel,
  chrome,
}: ToolsSettingsPanelProps) {
  const t = useT();
  const palette = mergeToolsPalette(DEFAULT_TOOLS_PALETTE, tools.toolsPalette);
  const bindings = mergeToolsColorBindings(DEFAULT_TOOLS_COLOR_BINDINGS, tools.toolsColorBindings);
  const current = normalizeToolsSubSection(subSection);
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(true);
  const [previousSubSection, setPreviousSubSection] = useState(current);
  if(previousSubSection !== current){
    setPreviousSubSection(current);
    if(current === 'design')setDesignCatalogOpen(true);
    if(current === 'header')setHeaderCatalogOpen(true);
  }
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
  const modified = JSON.stringify(tools) !== JSON.stringify(DEFAULT_TOOLS_SECTION_SETTINGS);

  return (
    <NpPanelShell
      title={t('Tools')}
      modified={modified}
      tabs={SUBSECTIONS.map((item) => ({ id: item.value, label: t(item.label) }))}
      activeTab={current}
      onTabChange={(value) => {if(value === 'design')setDesignCatalogOpen(true);if(value === 'header')setHeaderCatalogOpen(true);onSubSectionChange?.(value);}}
      onReset={() => onChange({ ...DEFAULT_TOOLS_SECTION_SETTINGS })}
      chrome={chrome}
    >

      {current === 'general' ? (
        <div className="np-stack">
          <NpToggleRow
            card
            title={sectionToggleLabel ?? t('Show Tools section')}
            description={tools.enabled ? undefined : t('Visitors go straight to the next section.')}
            checked={tools.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <div className="pb-6"><SectionColorModeControl hideLabel
              label={t('Color mode')}
              value={tools.colorModeOverride}
              onChange={(colorModeOverride) => onChange({ colorModeOverride })}
            /></div>
          <div
            className="np-dimmable"
            data-disabled={tools.enabled ? 'false' : 'true'}
            aria-disabled={!tools.enabled}
            inert={!tools.enabled}
          >
          <NpCollapsibleSection title={t('Style')}>
            <TextSizeSlider label={t('Text size')} options={SECTION_TEXT_SIZE_OPTIONS}
              value={tools.textSize??'medium'} onChange={textSize=>onChange({textSize})}/>
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Layout')}>
            <ToolsPreviewCardGrid
              label={t('Title / list layout')}
              value={tools.sectionLayout ?? 'stacked'}
              columns={3}
              options={([
                { value: 'stacked', label: 'Stacked' },
                { value: 'aside-left', label: 'Title left' },
                { value: 'aside-right', label: 'Title right' },
              ] as const).map(option => ({ ...option, glyph: option.value === 'stacked' ? <>
                <rect className="pf-stack-mini-ink" x="10" y="7" width="44" height="7" rx="2" />
                <rect className="pf-stack-mini-mute" x="10" y="18" width="44" height="3" rx="1.5" />
                <rect className="pf-stack-mini-mute" x="10" y="24" width="34" height="3" rx="1.5" />
              </> : <>
                <rect className="pf-stack-mini-ink" x={option.value === 'aside-left' ? 8 : 34} y="9" width="22" height="16" rx="2" />
                {[10, 16, 22].map((y, index) => <rect key={y} className="pf-stack-mini-mute" x={option.value === 'aside-left' ? 36 : 8} y={y} width={index === 2 ? 14 : 20} height="3" rx="1.5" />)}
              </> }))}
              onChange={sectionLayout => onChange({ sectionLayout })}
            />
            {tools.sectionLayout === 'aside-left' || tools.sectionLayout === 'aside-right' ? <>
              <NpSegmentedControl label={t('Vertical title alignment')} value={tools.asideTitlePlacement ?? 'center'} options={[{ value: 'top', label: t('Top') }, { value: 'center', label: t('Centered with list') }]} onChange={asideTitlePlacement => onChange({ asideTitlePlacement: asideTitlePlacement as 'top' | 'center' })} />
              <NpToggleRow title={t('Sticky title on scroll')} checked={tools.asideTitleSticky !== false} onChange={asideTitleSticky => onChange({ asideTitleSticky })} />
            </> : null}
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Content shown')}>
            <NpToggleRow
              title={
                isLevelIndicatorDesign
                  ? t('Show the name')
                  : isRichToolsDesign
                    ? t('Show the name')
                    : t('Show the name under the logo')
              }
              checked={tools.showLabels !== false}
              onChange={(showLabels) => onChange({ showLabels })}
            />
            <NpToggleRow
              title={t('Show the icon background')}
              checked={resolveToolsIconBackgroundEnabled(tools)}
              onChange={(iconBackgroundEnabled) =>
                onChange({ iconBackgroundEnabled, iconBackgroundOptIn: true })
              }
            />
            <NpToggleRow
              title={t('Black & white logos')}
              checked={tools.logosGrayscale === true}
              onChange={(logosGrayscale) => onChange({ logosGrayscale })}
            />
            {isRichToolsDesign ? (
              <>
                <NpToggleRow
                  title={t('Show the description')}
                  checked={tools.showDescription !== false}
                  onChange={(showDescription) => onChange({ showDescription })}
                />
                {tools.design !== 'brand-index' ? (
                  <NpToggleRow
                    title={t('Show the level')}
                    checked={resolveToolsShowLevel(tools)}
                    onChange={(showLevel) => onChange({ showLevel, showLevelOptIn: showLevel })}
                  />
                ) : null}
              </>
            ) : isLevelIndicatorDesign ? (
              <NpToggleRow
                title={t('Show the level indicator')}
                checked={resolveToolsShowLevel(tools)}
                onChange={(showLevel) => onChange({ showLevel, showLevelOptIn: showLevel })}
              />
            ) : null}
          </NpCollapsibleSection>
          {(['brand-cards', 'brand-float', 'level-stat-bars', 'level-circular-cards', 'level-bento-categories', 'level-star-cards', 'level-svg-rings'] as readonly string[]).includes(tools.design) ? (
            <CardsStyleControls
              value={tools.cardsStyle ?? DEFAULT_CARDS_STYLE}
              onChange={(cardsStyle) => onChange({ cardsStyle })}
              palette={tools.toolsPalette}
            />
          ) : null}

          </div>
        </div>
      ) : null}

      {current !== 'general' && !tools.enabled ? <div className="np-stack"><NpToggleRow card title={t('This section is hidden')} description={t('Enable it to edit its settings and make it visible on the portfolio.')} checked={false} onChange={() => onChange({ enabled: true })} /></div> : null}

      {current === 'design' && tools.enabled ? (
        <div className="np-stack">
          {designCatalogOpen ? (
            <ToolsDesignChoiceGrid
              options={designOptions}
              value={tools.design}
              onChange={(design) => handleToolsDesignChange(tools, design, onChange)}
              open
              onOpenChange={setDesignCatalogOpen}
            />
          ) : (
          <>
          {designOptions.length > 1 ? (
            <ToolsDesignChoiceGrid
              options={designOptions}
              value={tools.design}
              onChange={(design) => handleToolsDesignChange(tools, design, onChange)}
              open={designCatalogOpen}
              onOpenChange={setDesignCatalogOpen}
            />
          ) : null}
          {(['workflow-rail'] as readonly string[]).includes(tools.design) ? <StackRailControls stack={tools} onChange={onChange} /> : (['brand-cards'] as readonly string[]).includes(tools.design) ? <StackBrandControls stack={tools} onChange={onChange} aside={tools.sectionLayout === 'aside-left' || tools.sectionLayout === 'aside-right'} /> : (['level-bento-categories'] as readonly string[]).includes(tools.design) ? <StackBentoControls stack={tools} onChange={onChange} /> : (['level-svg-rings', 'level-circular-cards'] as readonly string[]).includes(tools.design) ? <StackCircularControls stack={tools} onChange={onChange} aside={tools.sectionLayout === 'aside-left' || tools.sectionLayout === 'aside-right'} /> : (['level-star-cards'] as readonly string[]).includes(tools.design) ? <StackStarControls stack={tools} onChange={onChange} /> : <ToolsControlGroups>
            <ToolsSlider
              label={t(tools.design==='level-star-cards'?'Card size':tools.design==='level-svg-rings'?'Ring size':'Logo size')}
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
                {(['level-table-rows', 'level-bento-categories', 'level-stat-bars'] as readonly string[]).includes(tools.design) ? (
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
            {tools.design === 'level-stat-bars' ? <NpToggleRow
              title={t('Show level name')}
              checked={tools.levelStatShowLevelName !== false}
              onChange={levelStatShowLevelName=>onChange({levelStatShowLevelName})}
            /> : null}
            {toolsLevelIndicatorDesignSupportsCardFrame(tools.design) && tools.design!=='level-circular-cards' && tools.design!=='level-svg-rings' ? (
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
            {(tools.design === 'level-stat-bars' && (tools.levelIndicatorDisplayStyle ?? 'text') === 'progress-bar') ||
            ((tools.design === 'level-table-rows' || tools.design === 'level-bento-categories') && (tools.levelIndicatorDisplayStyle ?? (tools.design === 'level-bento-categories' ? 'progress-bar' : 'text')) === 'progress-bar') ||
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
            tools.design === 'level-table-rows' ||
            tools.design === 'level-bento-categories' ||
            tools.design === 'level-progress-rows' ||
            tools.design === 'level-category-rows' ||
            tools.design === 'level-circular-cards' ||
            tools.design === 'level-svg-rings' ||
            (tools.design === 'brand-directory' &&
              (tools.brandDirectoryLevelStyle ?? 'tag') === 'stat') ? (
              <ToolsSlider
                label={
                  tools.design === 'level-bento-categories' ? t('Level display size') : tools.design === 'level-svg-rings' ? t('Thickness') : tools.design === 'level-circular-cards'
                    ? t('Thickness & % size') : tools.design === 'brand-directory' ? t('Bar size')
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
                  value={String(Math.min(tools.brandCardsColumnsPerRow ?? 1, 3)) as '1' | '2' | '3'}
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
          </ToolsControlGroups>}
          </>
          )}
        </div>
      ) : null}

      {current === 'header' && tools.enabled ? (
        <div className="np-stack">
          {headerCatalogOpen ? (
            <ToolsHeaderDesignChoiceGrid value={tools.headerDesign ?? 'editorial'} onChange={(headerDesign) => onChange({ headerDesign })} open onOpenChange={setHeaderCatalogOpen} />
          ) : (
          <>
          <NpCollapsibleSection title={t('Header design')}>
          <ToolsHeaderDesignChoiceGrid
            value={tools.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
            open={headerCatalogOpen}
            onOpenChange={setHeaderCatalogOpen}
          />
          </NpCollapsibleSection>

          {/* Browsing the catalog is a different task from tuning the chosen design: no settings below it. */}
            {tools.headerDesign === 'none' ? null : <NpCollapsibleSection title={t('Header settings')}>
              <ToolsHeaderDesignFields tools={tools} onChange={onChange} />
            </NpCollapsibleSection>}
          </>
          )}
        </div>
      ) : null}

      {current === 'background' && tools.enabled ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl
              value={tools.paletteFamily ?? 'global'}
              onChange={(paletteFamily) => onChange({ paletteFamily })}
              mode={tools.colorModeOverride === 'light' ? 'light' : 'dark'}
            />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Background')}>
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
          </NpCollapsibleSection>
        </div>
      ) : null}
    </NpPanelShell>
  );
}
