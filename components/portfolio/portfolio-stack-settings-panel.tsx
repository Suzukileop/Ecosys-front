'use client';
import { TextSizeSlider, SECTION_TEXT_SIZE_OPTIONS } from './portfolio-text-size-slider';
import { StackRailControls } from './portfolio-stack-rail-controls';
import { StackTagsControls } from './portfolio-stack-tags-controls';
import { StackBrandControls } from './portfolio-stack-brand-controls';
import { StackIndexControls } from './portfolio-stack-index-controls';
import { StackRowControls } from './portfolio-stack-row-controls';
import { StackProgressControls } from './portfolio-stack-progress-controls';
import { StackCircularControls } from './portfolio-stack-circular-controls';
import { StackStarControls } from './portfolio-stack-star-controls';
import { StackBentoControls } from './portfolio-stack-bento-controls';
import { PortfolioDesignLivePreview, usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { StackPreviewSkeleton } from './portfolio-stack-preview-skeleton';
import { StackHeaderSkeleton } from './portfolio-stack-header-skeleton';
import { StackDesignWireframe } from './portfolio-stack-design-skeleton';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { ColorSwatchRow } from '@/components/portfolio/portfolio-color-swatch-row';
import { CardsStyleControls } from '@/components/portfolio/portfolio-cards-style-controls';
import { DEFAULT_CARDS_STYLE } from '@/components/portfolio/portfolio-cards-style';
import { useId, useState, type ReactNode } from 'react';
import { stackDesignSettingsPatch } from '@/components/portfolio/portfolio-stack-design-patch';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { DEFAULT_STACK_PRESENTATION, PORTFOLIO_STACK_ASIDE_TITLE_PLACEMENT_OPTIONS, PORTFOLIO_STACK_DESIGN_OPTIONS, PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS, PORTFOLIO_STACK_SECTION_LAYOUT_OPTIONS, STACK_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS, STACK_HEADER_BILLBOARD_WORD_STYLE_OPTIONS, STACK_HEADER_PALETTE_TOKEN_OPTIONS, stackHeaderPaletteTokenColor, stackLevelIndicatorDesignSupportsCardFrame, stackSectionLayoutIsAside, type PortfolioStackAsideTitlePlacement, type PortfolioStackDesign, type PortfolioStackHeaderDesign, type PortfolioStackSectionLayout, type PortfolioStackSectionSettings } from '@/components/portfolio/portfolio-stack-settings';
import {
  PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS,
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
  PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS,
  resolveToolsLevelIndicatorFullWidth,
  resolveToolsLevelIndicatorShowCategoryFilter,
  type PortfolioToolsCardGap,
  type PortfolioToolsContentAlignment,
  type PortfolioToolsLevelBarSize,
  type PortfolioToolsLevelBarStyle,
  type PortfolioToolsLevelBentoGridMode,
  type PortfolioToolsLevelIndicatorCardStyle,
  type PortfolioToolsLevelIndicatorDisplayStyle,
  type PortfolioToolsLevelProgressRowGap,
  type PortfolioToolsLevelTableGroupBy,
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
  { value: 'secondaire', label: msg('Secondary') },
  { value: 'texteFort', label: msg('Strong text') },
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
        title: option.description ? t(option.description) : undefined,
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
function _StackDesignSummaryRow({
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
function StackDesignChoiceGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioStackDesign;onChange:(value:PortfolioStackDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const theme=useThumbnailTheme('stack');
 const selected=PORTFOLIO_STACK_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_STACK_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return (
  <div className="flex flex-col gap-8" aria-label={t('Choose a design')}>
   {PORTFOLIO_STACK_DESIGN_OPTIONS.map(option => {
    const skeleton = (
     <StackPreviewSkeleton>
      <StackDesignWireframe design={option.value} />
     </StackPreviewSkeleton>
    );
    return (
     <DesignCatalogueCard key={option.value} label={t(option.label)} selected={value === option.value} previewBackground={theme.background}
      onSelect={() => onChange(option.value)}
      onCustomize={() => { if (value !== option.value) onChange(option.value); setShowGrid(false); }}>
      <span className="relative block aspect-[3/1] w-full" style={{backgroundColor:theme.background}}>
       {previewSource ? <PortfolioDesignLivePreview
        src={`${withDesignPreview(previewSource.portfolioPath, { section: 'stack', design: option.value })}&previewRevision=stack-compact-v4`}
        settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={skeleton} animateSkeleton={false} backgroundColor={theme.background}
       /> : skeleton}
      </span>
     </DesignCatalogueCard>
    );
   })}
  </div>
 );
}


/** Header catalogue: matching neutral skeletons and larger real previews. */
function StackHeaderChoiceGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioStackHeaderDesign;onChange:(value:PortfolioStackHeaderDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const theme=useThumbnailTheme('stack');
 const selected=PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return <div className="flex flex-col gap-8" aria-label={t('Choose a header')}>{PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS.map(option=>{
  if(option.value==='none')return <button key={option.value} type="button" aria-pressed={value===option.value} onClick={()=>onChange(option.value)} className="flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-sm font-medium transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2" style={{borderColor:value===option.value?'var(--pf-palette-principal,#f97316)':'color-mix(in srgb,currentColor 18%,transparent)'}}>{t(option.label)}</button>;
   const skeleton = <StackPreviewSkeleton><StackHeaderSkeleton design={option.value} compact/></StackPreviewSkeleton>;
  return <PortfolioHeaderDesignOption key={option.value} design={option.value}><DesignCatalogueCard label={t(option.label)} selected={value===option.value} previewBackground={theme.background} onSelect={()=>onChange(option.value)} onCustomize={()=>{if(value!==option.value)onChange(option.value);setShowGrid(false);}}>
    <span className="relative block aspect-[3/1] w-full" style={{backgroundColor:theme.background}}>
      {previewSource ? <PortfolioDesignLivePreview
        src={withDesignPreview(previewSource.portfolioPath,{section:'stackHeader',design:option.value})+'&previewRevision=stack-header-compact-v7'}
        settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={skeleton} animateSkeleton={false} backgroundColor={theme.background}
      /> : skeleton}
    </span>
  </DesignCatalogueCard></PortfolioHeaderDesignOption>;
 })}</div>;
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
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(true);
  const [previousSubSection,setPreviousSubSection]=useState(current);
  if(previousSubSection!==current){setPreviousSubSection(current);if(current==='design')setDesignCatalogOpen(true);if(current==='header')setHeaderCatalogOpen(true);}
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
      onTabChange={(value) => {if(value==='design')setDesignCatalogOpen(true);if(value==='header')setHeaderCatalogOpen(true);onSubSectionChange?.(value);}}
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
          <div className="pb-6"><SectionColorModeControl hideLabel
              label={t('Color mode')}
              value={stack.colorModeOverride}
              onChange={(colorModeOverride) => onChange({ colorModeOverride })}
            /></div>
          <div
            className="np-dimmable"
            data-disabled={stack.enabled ? 'false' : 'true'}
            aria-disabled={!stack.enabled}
            inert={!stack.enabled}
          >
          <NpCollapsibleSection title={t('Style')}>
            <TextSizeSlider label={t('Text size')} options={SECTION_TEXT_SIZE_OPTIONS}
              value={stack.textSize??'medium'} onChange={textSize=>onChange({textSize})}/>
          </NpCollapsibleSection>
          {stack.design !== 'stack-tags' ? <NpCollapsibleSection title={t('Content shown')}>
            <NpToggleRow title={t('Show the name under the logo')} checked={stack.showLabels !== false} onChange={showLabels => onChange({ showLabels })} />
            <NpToggleRow title={t('Show the icon background')} checked={stack.iconBackgroundEnabled === true} onChange={iconBackgroundEnabled => onChange({ iconBackgroundEnabled, iconBackgroundOptIn: true })} />
            <NpToggleRow title={t('Black & white logos')} checked={stack.logosGrayscale === true} onChange={logosGrayscale => onChange({ logosGrayscale })} />
          </NpCollapsibleSection> : null}
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
          {(['brand-cards', 'level-circular-cards', 'level-bento-categories', 'level-star-cards', 'level-svg-rings'] as readonly string[]).includes(stack.design) ? (
            <CardsStyleControls
              value={stack.cardsStyle ?? DEFAULT_CARDS_STYLE}
              onChange={(cardsStyle) => onChange({ cardsStyle })}
              palette={stack.toolsPalette}
            />
          ) : null}

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
          </NpCollapsibleSection>
          {stack.design === 'workflow-rail' ? <StackRailControls stack={stack} onChange={onChange} /> : stack.design === 'stack-tags' ? <StackTagsControls stack={stack} onChange={onChange} /> : stack.design === 'brand-cards' ? <StackBrandControls stack={stack} onChange={onChange} aside={stackAside} /> : stack.design === 'brand-index' ? <StackIndexControls stack={stack} onChange={onChange} /> : stack.design === 'brand-row' ? <StackRowControls stack={stack} onChange={onChange} aside={stackAside} /> : (['level-progress-rows', 'level-category-rows', 'level-table-rows'] as readonly string[]).includes(stack.design) ? <StackProgressControls stack={stack} onChange={onChange} aside={stackAside} /> : (['level-circular-cards', 'level-svg-rings'] as readonly string[]).includes(stack.design) ? <StackCircularControls stack={stack} onChange={onChange} aside={stackAside} /> : (['level-star-cards'] as readonly string[]).includes(stack.design) ? <StackStarControls stack={stack} onChange={onChange} /> : (['level-bento-categories'] as readonly string[]).includes(stack.design) ? <StackBentoControls stack={stack} onChange={onChange} /> : <NpCollapsibleSection title={t('Layout options')}>
          <StackSlider
            label={t('Logo size')}
            value={stack.tileSize}
            options={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS}
            onChange={(tileSize: PortfolioToolsTileSize) => onChange({ tileSize })}
          />
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
          ) : !isLevelIndicatorDesign ? (
            <StackSlider
              label={t('Card spacing')}
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
          </NpCollapsibleSection>}
        </div>
        )
      ) : null}

      {current === 'background' && stack.enabled ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl
              value={stack.paletteFamily ?? 'global'}
              onChange={(paletteFamily) => onChange({ paletteFamily })}
              mode={stack.colorModeOverride === 'light' ? 'light' : 'dark'}
            />
          </NpCollapsibleSection>
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
          {stack.headerDesign === 'none' ? null : <NpCollapsibleSection title={t('Header settings')}>
            <StackHeaderDesignFields stack={stack} onChange={onChange} />
          </NpCollapsibleSection>}
        </div>
        )
      ) : null}
    </NpPanelShell>
  );
}
