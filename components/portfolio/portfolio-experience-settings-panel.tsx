'use client';
import { LayoutControlGroups } from './portfolio-tools-control-groups';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import { ExperienceDesignIllustration } from './portfolio-experience-design-illustration';
import { useThumbnailTheme } from './portfolio-thumbnail-theme';
import { SectionBackgroundSettingsFields } from './portfolio-section-background-controls';
import { ColorSwatchRow } from './portfolio-color-swatch-row';
import { DEFAULT_EXPERIENCE_COLOR_BINDINGS, mergeExperienceColorBindings } from './portfolio-experience-palette-settings';
import type { HeroPaletteTokenId } from './portfolio-hero-palette-settings';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { TextSizeSlider } from '@/components/portfolio/portfolio-text-size-slider';
import { HeaderDesignFields, type HeaderCopy } from '@/components/portfolio/portfolio-header-design-fields';
import { HeaderDesignPicker } from '@/components/portfolio/portfolio-header-design-picker';
import type { HeaderPatch } from '@/components/portfolio/portfolio-header-style-controls';
import {
  EXPERIENCE_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  EXPERIENCE_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  EXPERIENCE_HEADER_PALETTE_TOKEN_OPTIONS,
  experienceHeaderPaletteTokenColor,
} from '@/components/portfolio/portfolio-experience-header-settings';
import { CardsStyleControls } from '@/components/portfolio/portfolio-cards-style-controls';
import { DEFAULT_CARDS_STYLE } from '@/components/portfolio/portfolio-cards-style';
import { useId, useState, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { DEFAULT_EXPERIENCE_PRESENTATION } from '@/components/portfolio/portfolio-experience-settings';
import { PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS, PORTFOLIO_EXPERIENCE_CARDS_CARD_WIDTH_OPTIONS, PORTFOLIO_EXPERIENCE_KINETIC_TITLE_WEIGHT_OPTIONS, PORTFOLIO_EXPERIENCE_KINETIC_SPACING_OPTIONS, PORTFOLIO_EXPERIENCE_CARDS_TITLE_SIZE_OPTIONS, PORTFOLIO_EXPERIENCE_CARDS_ELEMENT_SPACING_OPTIONS, PORTFOLIO_EXPERIENCE_CARDS_VERTICAL_GAP_OPTIONS, PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_COLOR_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_RADIUS_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_EFFECT_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_STICKY_VERTICAL_GAP_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_SCROLL_MODE_OPTIONS, PORTFOLIO_EXPERIENCE_DUOTONE_SLIDE_NAV_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_ENTRY_EXPAND_MODE_OPTIONS, PORTFOLIO_EXPERIENCE_EDITORIAL_DETAIL_LAYOUT_OPTIONS, PORTFOLIO_EXPERIENCE_GALLERY_COLUMNS_OPTIONS, PORTFOLIO_EXPERIENCE_GALLERY_THUMBNAIL_FIT_OPTIONS, PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_FIT_OPTIONS, PORTFOLIO_EXPERIENCE_LOFT_HOVER_EFFECT_OPTIONS, PORTFOLIO_EXPERIENCE_LOFT_COLUMNS_OPTIONS, PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_FIXED_SIDE_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_ITEM_GAP_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_HEIGHT_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_WIDTH_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_ANIMATION_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_PREFIX_WEIGHT_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_SIZE_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_UNDERLINE_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_LEGACY_SUBTITLE_STYLE_OPTIONS, PORTFOLIO_EXPERIENCE_PERIOD_DESIGN_OPTIONS, PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS, DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY, type PortfolioExperienceCardsBorderRadius, type PortfolioExperienceGalleryColumns, type PortfolioExperienceItemGap, type PortfolioExperienceLoftColumns, type PortfolioExperienceLoftHoverEffect, type PortfolioExperienceDesign, type PortfolioExperienceSectionSettings, type PortfolioExperienceTasksDisplay, PORTFOLIO_EXPERIENCE_PREMIUM_FONT_SIZE_OPTIONS } from '@/components/portfolio/portfolio-experience-settings';
import { PortfolioLinkArrowProvider } from '@/components/portfolio/portfolio-link-buttons';
import { SettingRow, SettingsRowsScope, useSettingsRows } from '@/components/portfolio/portfolio-settings-rows';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { NpBackRow, NpCollapsibleSection, NpPanelShell, NpToggleRow, type NpPanelChrome } from '@/components/portfolio/portfolio-nav-panel-ui';

export type ExperienceSubSection = 'general' | 'header' | 'design' | 'background';

function MiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-exp-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-exp-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function MiniType({
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
      className="pf-exp-mini-type"
      x={x}
      y={y}
      fontSize={size}
      fontWeight={700}
      letterSpacing="0.14em"
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

function ExperiencePickerCard({
  active,
  label,
  onClick,
  children,
  showLabel = true,
  compact = false,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
  showLabel?: boolean;
  /** Smaller padding/type for secondary preview-card grids (e.g. Thumbnail corners). */
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
      className={`pf-exp-design-card rounded-2xl text-left ${
        compact ? 'pf-exp-preview-card' : `px-3 pt-2.5 ${showLabel ? 'pb-3' : 'pb-2.5'}`
      }`}
    >
      {children}
      {showLabel ? (
        <span className={compact ? 'mt-1.5 block' : 'mt-2.5 block'}>
          <span
            className={`pf-exp-card-label min-w-0 font-semibold leading-none tracking-tight ${compact ? 'text-xs' : 'text-sm'}`}
          >
            {label}
          </span>
        </span>
      ) : null}
    </button>
  );
}

const EXPERIENCE_SUB_SECTIONS: { id: ExperienceSubSection; label: string; description: string }[] = [
  {
    id: 'general',
    label: msg('General'),
    description: msg('Section visibility and how responsibilities are shown.'),
  },
  {
    id: 'design',
    label: msg('Design'),
    description: msg('Choose the Experience layout design.'),
  },
  {
    id: 'header',
    label: msg('Header'),
    description: msg('Pick a header design — it applies above every Experience layout.'),
  },
  { id: 'background', label: msg('Background'), description: msg('Section background and palette.') },
];

/** Maps any legacy subsection id (media, palette, etc.) to a known Experience subsection. */
const EXPERIENCE_HEADER_COPY: HeaderCopy = {
  editorial: { label: msg('Experience'), title: msg('Experience'), subtitle: msg('Where I have worked and what I built.') },
  index: { rule: 'Index', title: msg('Experience'), subtitle: msg('Where I have worked and what I built.'), count: 'Roles' },
  marquee: ['Experience', 'Optional', 'Optional', 'Optional'],
  accent: { badge: '{count}+ roles', lead: 'Where I have worked and what I built.' },
  serif: { label: msg('Experience'), title: msg('A career built role by role.'), subtitle: msg('Where I have worked and what I built.') },
  billboard: { word: 'EXPERIENCE', title: msg('Experience'), count: '{count} roles' },
  masthead: ['Real work.', 'Real results.', 'Real teams.'],
  split: { title: msg('Experience'), label: msg('Career') },
};

export function normalizeExperienceSubSection(value: string | undefined): ExperienceSubSection {
  if (value === 'general' || value === 'header' || value === 'design' || value === 'background') return value;
  return 'design';
}

function ExperienceSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span className="np-switch" aria-checked={checked} aria-hidden data-switch-track="">
      <span className="np-switch-knob" />
    </span>
  );
}

function ExperienceToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
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
        <span className="min-w-0 text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{label}</span>
        <ExperienceSwitchTrack checked={checked} />
      </span>
      {description ? <span className="text-sm text-[color:var(--pf-palette-texte-muted)]">{description}</span> : null}
    </button>
  );
}

function ExperienceOptionalTextField({
  label,
  value,
  placeholder,
  checked,
  onCheckedChange,
  onValueChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onValueChange: (value: string) => void;
}) {
  return (
    <div>
      <ExperienceToggleRow label={label} checked={checked} onChange={onCheckedChange} />
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          checked ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!checked}
      >
        <div className="overflow-hidden">
          <input
            type="text"
            value={value}
            disabled={!checked}
            tabIndex={checked ? 0 : -1}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={placeholder}
            className="mt-2 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
          />
        </div>
      </div>
    </div>
  );
}

function ExperienceVisibilityBadge({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return <NpToggleRow title={label} checked={checked} onChange={onChange} />;
}


function ExperienceDesignChoiceGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioExperienceDesign;onChange:(value:PortfolioExperienceDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const theme=useThumbnailTheme('experience');
 const selected=PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return (
  <div className="flex flex-col gap-8" aria-label={t('Choose a design')}>
   {PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS.map(option => (
    <DesignCatalogueCard
     key={option.value}
     label={t(option.label)}
     selected={value === option.value}
     previewBackground={theme.background}
     onSelect={() => onChange(option.value)}
     onCustomize={() => {
      if (value !== option.value) onChange(option.value);
      setShowGrid(false);
     }}
    >
      <span className="relative block aspect-[8/5] w-full" style={{backgroundColor:theme.background}}>
       <ExperienceDesignIllustration design={option.value}/>
      </span>
    </DesignCatalogueCard>
   ))}
  </div>
 );
}


function ExperienceTasksDisplayWireframe({
  display,
}: {
  display: PortfolioExperienceTasksDisplay;
}) {
  switch (display) {
    case 'engineering-grid':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="12" y="16" width="44" height="18" rx="2.5" />
          <rect className="pf-exp-mini-mute" x="64" y="16" width="44" height="18" rx="2.5" />
          <rect className="pf-exp-mini-mute" x="12" y="40" width="44" height="18" rx="2.5" />
          <rect className="pf-exp-mini-ink" x="64" y="40" width="44" height="18" rx="2.5" />
        </MiniSlide>
      );
    case 'editorial-dash':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-ink" x="14" y="20" width="18" height="1.6" rx="0.8" />
          <rect className="pf-exp-mini-mute" x="38" y="18" width="68" height="5.5" rx="1.5" />
          <rect className="pf-exp-mini-ink" x="14" y="36" width="18" height="1.6" rx="0.8" />
          <rect className="pf-exp-mini-mute" x="38" y="34" width="58" height="5.5" rx="1.5" />
          <rect className="pf-exp-mini-ink" x="14" y="52" width="18" height="1.6" rx="0.8" />
          <rect className="pf-exp-mini-mute" x="38" y="50" width="64" height="5.5" rx="1.5" />
        </MiniSlide>
      );
    case 'accordion-stack':
      return (
        <MiniSlide>
          <rect className="pf-exp-mini-mute" x="14" y="16" width="92" height="1" rx="0.5" />
          <rect className="pf-exp-mini-ink" x="14" y="22" width="10" height="4" rx="1" />
          <rect className="pf-exp-mini-mute" x="30" y="21" width="76" height="5.5" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="14" y="34" width="92" height="1" rx="0.5" />
          <rect className="pf-exp-mini-ink" x="14" y="40" width="10" height="4" rx="1" />
          <rect className="pf-exp-mini-mute" x="30" y="39" width="64" height="5.5" rx="1.4" />
          <rect className="pf-exp-mini-mute" x="14" y="52" width="92" height="1" rx="0.5" />
          <rect className="pf-exp-mini-ink" x="14" y="58" width="10" height="4" rx="1" />
          <rect className="pf-exp-mini-mute" x="30" y="57" width="70" height="5.5" rx="1.4" />
        </MiniSlide>
      );
    case 'architectural-index':
      return (
        <MiniSlide>
          <MiniType x={14} y={24} size={7}>
            01
          </MiniType>
          <rect className="pf-exp-mini-mute" x="36" y="18" width="70" height="5" rx="1.4" />
          <MiniType x={14} y={40} size={7}>
            02
          </MiniType>
          <rect className="pf-exp-mini-mute" x="36" y="34" width="58" height="5" rx="1.4" />
          <MiniType x={14} y={56} size={7}>
            03
          </MiniType>
          <rect className="pf-exp-mini-mute" x="36" y="50" width="64" height="5" rx="1.4" />
        </MiniSlide>
      );
    default: {
      const _exhaustive: never = display;
      return _exhaustive;
    }
  }
}

function ExperienceTasksDisplayChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceTasksDisplay;
  onChange: (value: PortfolioExperienceTasksDisplay) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Tasks display')}</p>
      <div
        role="radiogroup"
        aria-label={t('Tasks display')}
        className="grid grid-cols-2 gap-2"
      >
        {PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              onClick={() => onChange(option.value)}
            >
              <ExperienceTasksDisplayWireframe display={option.value} />
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact alternative to a slider for an ordered axis with few options (e.g. small → large)
 * in space-constrained settings panels: each option's label is rendered at a progressively
 * larger size so the scale reads at a glance, without needing a live-preview slider.
 */
function ExperienceOptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T | '';
  onChange: (value: T) => void;
  columns?: number;
}) {
  const t = useT();
  const rows = useSettingsRows();
  const count = options.length;
  const cols = columns ?? (count <= 3 ? Math.max(count, 1) : 2);
  const compact = cols === count && count >= 2 && count <= 4;
  return (
    <SettingRow label={label} value={String(options.find((option) => option.value === value)?.label ?? '')}>
    <div>
      {rows ? null : (<p className="pf-exp-block-label pf-exp-option-label">{label}</p>)}
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-exp-segment grid gap-[3px] p-[3px]"
        data-compact={compact ? 'true' : 'false'}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              title={t(option.description)}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-exp-segment-btn px-2.5 py-1.5 text-center text-[13px] font-medium tracking-tight"
              style={
                active
                  ? undefined
                  : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }
              }
            >
              {t(option.label)}
            </button>
          );
        })}
      </div>
    </div>
    </SettingRow>
  );
}

/** Actual rounded-rect preview for a given thumbnail radius, used inside the "Thumbnail corners" picker. */
function ExperienceThumbnailRadiusWireframe({
  radius,
}: {
  radius: PortfolioExperienceCardsBorderRadius;
}) {
  const rx = radius === 'none' ? 0 : radius === 'xl' ? 14 : 6;
  return (
    <MiniSlide>
      <rect className="pf-exp-mini-ink" x="36" y="10" width="48" height="38" rx={rx} />
      <rect className="pf-exp-mini-mute" x="36" y="54" width="30" height="3" rx="1.4" />
      <rect className="pf-exp-mini-mute" x="36" y="60" width="20" height="2.4" rx="1.2" />
    </MiniSlide>
  );
}

function ExperienceThumbnailRadiusChoiceGrid({
  value,
  onChange,
  label = 'Thumbnail corners',
}: {
  value: PortfolioExperienceCardsBorderRadius;
  onChange: (value: PortfolioExperienceCardsBorderRadius) => void;
  label?: string;
}) {
  const t = useT();
  const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={String(value ?? '')}>
    <div>
      {rows ? null : (<p className="pf-exp-block-label pf-exp-option-label">{label}</p>)}
      <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2">
        {PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              compact
              onClick={() => onChange(option.value)}
            >
              <ExperienceThumbnailRadiusWireframe radius={option.value} />
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
    </SettingRow>
  );
}

/** N evenly spaced bars — glyph for "columns per row" preview cards (same idea as the
 * Work/Stack/Tools panels' own columns glyph, ported to the pf-exp-mini-* palette). */
function experienceColumnsGlyph(n: number) {
  const gap = 6;
  const totalWidth = 92;
  const startX = 14;
  const barWidth = (totalWidth - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => (
    <rect
      key={i}
      className="pf-exp-mini-ink"
      x={startX + i * (barWidth + gap)}
      y={18}
      width={barWidth}
      height={36}
      rx={2.5}
    />
  ));
}

function ExperienceLoftColumnsChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceLoftColumns;
  onChange: (value: PortfolioExperienceLoftColumns) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Columns per row')}</p>
      <div role="radiogroup" aria-label={t('Columns per row')} className="grid grid-cols-3 gap-2">
        {PORTFOLIO_EXPERIENCE_LOFT_COLUMNS_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              compact
              onClick={() => onChange(option.value)}
            >
              <MiniSlide>{experienceColumnsGlyph(option.value)}</MiniSlide>
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceGalleryColumnsChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceGalleryColumns;
  onChange: (value: PortfolioExperienceGalleryColumns) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Columns per row')}</p>
      <div role="radiogroup" aria-label={t('Columns per row')} className="grid grid-cols-2 gap-2">
        {PORTFOLIO_EXPERIENCE_GALLERY_COLUMNS_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              compact
              onClick={() => onChange(option.value)}
            >
              <MiniSlide>{experienceColumnsGlyph(option.value)}</MiniSlide>
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
  );
}

/** Two bars with a gap sized per tier — same "2 mini-blocks, real gap" idea as Global's
 * section-spacing preview, as a static card grid instead of a slider (keeps this reading
 * as one family with the Columns-per-row cards right above it). */
function ExperienceItemGapWireframe({ gap }: { gap: PortfolioExperienceItemGap }) {
  const gapPx = gap === 'sm' ? 4 : gap === 'lg' ? 18 : gap === 'xl' ? 30 : 10;
  const barHeight = 10;
  const startY = (72 - (barHeight * 2 + gapPx)) / 2;
  return (
    <MiniSlide>
      <rect className="pf-exp-mini-ink" x="14" y={startY} width="92" height={barHeight} rx="2.5" />
      <rect className="pf-exp-mini-ink" x="14" y={startY + barHeight + gapPx} width="92" height={barHeight} rx="2.5" />
    </MiniSlide>
  );
}

function ExperienceItemGapChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceItemGap;
  onChange: (value: PortfolioExperienceItemGap) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Gap')}</p>
      <div role="radiogroup" aria-label={t('Gap')} className="grid grid-cols-4 gap-2">
        {PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <ExperiencePickerCard
              key={option.value}
              active={active}
              label={t(option.label)}
              compact
              onClick={() => onChange(option.value)}
            >
              <ExperienceItemGapWireframe gap={option.value} />
            </ExperiencePickerCard>
          );
        })}
      </div>
    </div>
  );
}

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus.
 * A `span` trigger, not `button`: this sits inside ExperienceOptionGridWithInfo's own
 * <button role="radio">, and a <button> can never nest another <button>. */
function ExperienceInfoTooltip({ text }: { text: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex shrink-0">
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

/** Same pill grid as ExperienceOptionGrid, plus a per-option info tooltip — for choices
 * whose names are too abstract to guess from a single word alone (e.g. Loft's "Hover
 * moment": Project Curtain / Magnetic Cue / Press In). Kept separate from the generic
 * ExperienceOptionGrid so every other design's plain pill grids are untouched. */
function ExperienceOptionGridWithInfo<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T | '';
  onChange: (value: T) => void;
  columns?: number;
}) {
  const t = useT();
  const count = options.length;
  const cols = columns ?? (count <= 3 ? Math.max(count, 1) : 2);
  const compact = cols === count && count >= 2 && count <= 4;
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-exp-segment grid gap-[3px] p-[3px]"
        data-compact={compact ? 'true' : 'false'}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-exp-segment-btn flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-center text-[13px] font-medium tracking-tight"
              style={active ? undefined : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }}
            >
              <span className="truncate">{t(option.label)}</span>
              {option.description ? <ExperienceInfoTooltip text={t(option.description)} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The actual micro-animation for one "Hover moment" preview card — plays on real hover,
 * keyboard focus, and (via CSS only, no JS) on a slow auto-loop on touch devices that have
 * no hover at all. Purely decorative, so it's aria-hidden — the option's own label + the
 * radio button semantics on the card carry the real accessible name. */
function ExperienceHoverMomentPreview({ effect }: { effect: PortfolioExperienceLoftHoverEffect }) {
  if (effect === 'curtain') {
    return (
      <div className="pf-exp-hover-preview" aria-hidden>
        <span className="pf-exp-hover-curtain-panel" />
      </div>
    );
  }
  if (effect === 'magnetic') {
    return (
      <div className="pf-exp-hover-preview" aria-hidden>
        <span className="pf-exp-hover-magnetic-dot" />
      </div>
    );
  }
  return (
    <div className="pf-exp-hover-preview" aria-hidden>
      <span className="pf-exp-hover-press-square" />
    </div>
  );
}

/** Loft "Hover moment" — each option shows the actual micro-interaction instead of an
 * abstract name (Project Curtain / Magnetic Cue / Press In don't self-explain otherwise). */
function ExperienceHoverMomentChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioExperienceLoftHoverEffect;
  onChange: (value: PortfolioExperienceLoftHoverEffect) => void;
}) {
  const t = useT();
  return (
    <div>
      <p className="pf-exp-block-label pf-exp-option-label">{t('Hover moment')}</p>
      <p className="-mt-2 mb-3 hidden text-[10px] italic text-[color:var(--pf-palette-texte-muted)] sm:block">
        {t('Hover to preview')}
      </p>
      <div role="radiogroup" aria-label={t('Hover moment')} className="grid grid-cols-3 gap-2">
        {PORTFOLIO_EXPERIENCE_LOFT_HOVER_EFFECT_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={t(option.description)}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-exp-hover-card rounded-xl text-left"
            >
              <ExperienceHoverMomentPreview effect={option.value} />
              <span className="pf-exp-hover-card-label mt-1.5 block truncate">{t(option.label)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Designs that render an entry image — the "Media / image" toggle is a no-op elsewhere. */
const EXPERIENCE_DESIGNS_WITH_ENTRY_MEDIA: ReadonlySet<PortfolioExperienceDesign> = new Set([
  'duotone',
  'gallery',
  'loft',
  'press',
  'legacy',
]);

export function ExperienceSettingsPanel({
  experience,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  chrome,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
  subSection?: ExperienceSubSection;
  onSubSectionChange?: (value: ExperienceSubSection) => void;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const backgroundTheme = useThumbnailTheme('experience');
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(true);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ExperienceSubSection>('design');
  const subSection = normalizeExperienceSubSection(controlledSubSection ?? uncontrolledSubSection);
  const [previousSubSection, setPreviousSubSection] = useState(subSection);
  if(previousSubSection !== subSection){
    setPreviousSubSection(subSection);
    if(subSection === 'design')setDesignCatalogOpen(true);
    if(subSection === 'header')setHeaderCatalogOpen(true);
  }
  const setSubSection = (value: ExperienceSubSection) => {
    const next = normalizeExperienceSubSection(value);
    if(next === 'design')setDesignCatalogOpen(true);
    if(next === 'header')setHeaderCatalogOpen(true);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const design = experience.experienceDesign;
  const isEditorial = design === 'editorial';
  const isTable = design === 'table';
  const isCards = design === 'cards';
  const isReel = design === 'reel';
  const isDuotone = design === 'duotone';
  const isGallery = design === 'gallery';
  const isLoft = design === 'loft';
  const isPress = design === 'press';
  const isLegacy = design === 'legacy';
  const showStackLabel = isEditorial || design === 'milestone' || design === 'kinetic' || isCards || isReel || isDuotone || isGallery;
  const defaults: PortfolioExperienceSectionSettings = { enabled: true, title: 'Experience', subtitle: 'Roles, milestones, and the path that shaped my craft.', ...DEFAULT_EXPERIENCE_PRESENTATION };

  return (
    <PortfolioLinkArrowProvider value={experience.linkArrowStyle ?? 'northeast'}>
    <NpPanelShell title={t('Experience')} modified={JSON.stringify(experience) !== JSON.stringify(defaults)} tabs={EXPERIENCE_SUB_SECTIONS.map((item) => ({ id: item.id, label: t(item.label) }))} activeTab={subSection} onTabChange={setSubSection} onReset={() => onChange(defaults)} chrome={chrome}>

      {subSection === 'general' ? (
        <div className="np-stack"><NpToggleRow card title={t('Show Experience section')} description={experience.enabled ? undefined : t('Visitors go straight to the next section.')} checked={experience.enabled} onChange={(enabled) => onChange({ enabled })} />
          <div className="pb-6"><SectionColorModeControl hideLabel
            label={t('Color mode')}
            value={experience.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          /></div><div className="np-dimmable" data-disabled={experience.enabled ? 'false' : 'true'} inert={!experience.enabled}>
          <NpCollapsibleSection title={t('Content shown')}>
            <div className="flex flex-col gap-2.5">
              <ExperienceVisibilityBadge
                label={t('Title')}
                checked={experience.showTitle !== false}
                onChange={(showTitle) => onChange({ showTitle })}
              />
              <ExperienceVisibilityBadge
                label={t('Period')}
                checked={experience.showPeriod !== false}
                onChange={(showPeriod) => onChange({ showPeriod })}
              />
              <ExperienceVisibilityBadge
                label={t('Organization')}
                checked={experience.showOrganization !== false}
                onChange={(showOrganization) => onChange({ showOrganization })}
              />
              <ExperienceVisibilityBadge
                label={t('Status & meta')}
                checked={experience.showMeta !== false}
                onChange={(showMeta) => onChange({ showMeta })}
              />
              <ExperienceVisibilityBadge
                label={t('Description')}
                checked={experience.showDescription !== false}
                onChange={(showDescription) => onChange({ showDescription })}
              />
              <ExperienceVisibilityBadge
                label={t('Tasks')}
                checked={experience.showTasks !== false}
                onChange={(showTasks) => onChange({ showTasks })}
              />
              <ExperienceVisibilityBadge
                label={t('Tools')}
                checked={experience.showTools !== false}
                onChange={(showTools) => onChange({ showTools })}
              />
              <ExperienceVisibilityBadge
                label={t('Proof / links')}
                checked={experience.showProof !== false}
                onChange={(showProof) => onChange({ showProof })}
              />
              {EXPERIENCE_DESIGNS_WITH_ENTRY_MEDIA.has(design) ? (
                <ExperienceVisibilityBadge
                  label={t('Media / image')}
                  checked={experience.showEntryMedia !== false}
                  onChange={(showEntryMedia) => onChange({ showEntryMedia })}
                />
              ) : null}
            </div>
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Style')}>
          
          <TextSizeSlider label={t('Text size')} options={PORTFOLIO_EXPERIENCE_PREMIUM_FONT_SIZE_OPTIONS} value={experience.premiumFontSize ?? 'medium'} onChange={(premiumFontSize) => onChange({ premiumFontSize })} />
          </NpCollapsibleSection>
          <NpCollapsibleSection title="Libellés des statuts">
            <div className="space-y-4">
              <label className="block text-sm">
                <span>{t('Ongoing')}</span>
                <input type="text" maxLength={80} value={experience.ongoingStatusLabel ?? ''} placeholder={t('Ongoing')} onChange={(event) => onChange({ ongoingStatusLabel: event.target.value })} className="mt-2 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm" />
              </label>
              <label className="block text-sm">
                <span>{t('Done')}</span>
                <input type="text" maxLength={80} value={experience.finishedStatusLabel ?? ''} placeholder={t('Done')} onChange={(event) => onChange({ finishedStatusLabel: event.target.value })} className="mt-2 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm" />
              </label>
              <p className="text-xs opacity-60">Laissez vide pour utiliser le libellé traduit par défaut.</p>
            </div>
          </NpCollapsibleSection>
        </div></div>
      ) : !experience.enabled ? (
        <div className="np-stack"><NpToggleRow card title={t('This section is hidden')} description={t('Enable it to edit its settings and make it visible on the portfolio.')} checked={false} onChange={() => onChange({ enabled: true })} /></div>
      ) : subSection === 'background' ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl value={experience.paletteFamily ?? 'global'} onChange={paletteFamily => onChange({ paletteFamily })} mode={backgroundTheme.mode} />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Background')}>
            <SectionBackgroundSettingsFields settings={experience} onChange={onChange} renderColorField={({ label }) => <ColorSwatchRow label={label}
              options={([['fond', 'Background'], ['neutre', 'Surface'], ['principal', 'Primary'], ['secondaire', 'Secondary'], ['texteFort', 'Strong text']] as const).map(([token, text]) => ({ value: token, label: t(text), color: backgroundTheme.palette[token] }))}
              value={mergeExperienceColorBindings(DEFAULT_EXPERIENCE_COLOR_BINDINGS, experience.experienceColorBindings).sectionBackground}
              onChange={token => onChange({ useHeroPalette: true, experiencePalette: backgroundTheme.palette, sectionBackgroundColor: backgroundTheme.palette[token as HeroPaletteTokenId], experienceColorBindings: { ...mergeExperienceColorBindings(DEFAULT_EXPERIENCE_COLOR_BINDINGS, experience.experienceColorBindings), sectionBackground: token as HeroPaletteTokenId } })} />}
            />
          </NpCollapsibleSection>
        </div>
      ) : subSection === 'header' ? (
        <div className="np-stack">
            <HeaderDesignPicker
              catalogueMode
              previewSection="experienceHeader"
              value={experience.headerDesign ?? 'none'}
              onChange={(headerDesign) => onChange({ headerDesign })}
              open={headerCatalogOpen}
              onOpenChange={setHeaderCatalogOpen}
              word={t('EXPERIENCE')}
              allowNone
            />
          {headerCatalogOpen || (experience.headerDesign ?? 'none') === 'none' ? null : (
            <NpCollapsibleSection title={t('Header settings')}>
              <HeaderDesignFields
                settings={experience}
                onPatch={(patch: HeaderPatch) => onChange(patch as Partial<PortfolioExperienceSectionSettings>)}
                copy={EXPERIENCE_HEADER_COPY}
                colorOptions={EXPERIENCE_HEADER_PALETTE_TOKEN_OPTIONS}
                resolveColor={experienceHeaderPaletteTokenColor}
                accentAlignmentOptions={EXPERIENCE_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
                billboardStyleOptions={EXPERIENCE_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
              />
            </NpCollapsibleSection>
          )}
        </div>
      ) : (
        <div className="np-stack">
          <ExperienceDesignChoiceGrid
            value={experience.experienceDesign}
            onChange={(experienceDesign) => onChange({ experienceDesign })}
            open={designCatalogOpen}
            onOpenChange={setDesignCatalogOpen}
          />
          {designCatalogOpen ? null : <>
          <SettingsRowsScope title={t('Layout options')}>
          <LayoutControlGroups>
          {isCards ? <>
            <ExperienceOptionGrid label="Présentation du stack" options={[{ value: 'text' as const, label: 'Texte' }, { value: 'pill' as const, label: 'Pilules' }, { value: 'rectangle' as const, label: 'Rectangles' }]} value={experience.cardsStackStyle ?? 'text'} onChange={(cardsStackStyle) => onChange({ cardsStackStyle })} columns={3} />
            <ExperienceOptionGrid label="Forme du bouton" options={[{ value: 'link' as const, label: 'Lien discret' }, { value: 'rectangle' as const, label: 'Rectangle' }, { value: 'pill' as const, label: 'Pilule' }]} value={experience.cardsButtonShape ?? 'link'} onChange={(cardsButtonShape) => onChange({ cardsButtonShape })} columns={3} />
            {experience.cardsButtonShape && experience.cardsButtonShape !== 'link' ? <ExperienceOptionGrid label="Survol du bouton" options={[{ value: 'wipe' as const, label: 'Remplissage glissant' }, { value: 'roll' as const, label: 'Texte déroulant' }]} value={experience.cardsButtonHover ?? 'roll'} onChange={(cardsButtonHover) => onChange({ cardsButtonHover })} columns={2} /> : null}
            <ColorSwatchRow label="Fond des cartes" options={([['fond','Background'],['neutre','Surface'],['principal','Primary'],['secondaire','Secondary']] as const).map(([value,label])=>({value,label:t(label),color:backgroundTheme.palette[value]}))} value={experience.cardsFrameColor ?? 'neutre'} onChange={(value)=>onChange({cardsFrameColor:value as 'fond'|'neutre'|'principal'|'secondaire'})} />
            <label className="block text-sm">Opacité du fond : {experience.cardsFrameOpacity ?? 100}%<input aria-label="Opacité du fond des cartes" type="range" min={0} max={100} step={1} value={experience.cardsFrameOpacity ?? 100} onChange={(event)=>onChange({cardsFrameOpacity:Number(event.target.value)})} className="mt-3 w-full" /></label>
          </> : null}
          {isTable ? <>
            <div className="space-y-3">
              <p className="text-sm font-medium">En-têtes des colonnes</p>
              {([
                ['tablePeriodLabel', 'Period'],
                ['tableRoleLabel', 'Role'],
                ['tableOrganizationLabel', 'Organization'],
                ['tableStatusLabel', 'Status'],
              ] as const).map(([key, label]) => (
                <label key={key} className="block text-xs">
                  {t(label)}
                  <input type="text" maxLength={60} value={experience[key] ?? ''} placeholder={t(label)} onChange={(event) => onChange({ [key]: event.target.value })} className="mt-2 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2.5 text-sm" />
                </label>
              ))}
              <p className="text-xs opacity-60">Un champ vide conserve le libellé traduit par défaut.</p>
            </div>
            <ExperienceOptionGrid label="Présentation du stack" options={[{ value: 'text' as const, label: 'Texte' }, { value: 'pill' as const, label: 'Pilules' }, { value: 'rectangle' as const, label: 'Rectangles' }]} value={experience.tableStackStyle ?? 'text'} onChange={(tableStackStyle) => onChange({ tableStackStyle })} columns={3} />
            <ExperienceOptionGrid label="Forme du bouton" options={[{ value: 'link' as const, label: 'Lien discret' }, { value: 'rectangle' as const, label: 'Rectangle' }, { value: 'pill' as const, label: 'Pilule' }]} value={experience.tableButtonShape ?? 'link'} onChange={(tableButtonShape) => onChange({ tableButtonShape })} columns={3} />
            {experience.tableButtonShape && experience.tableButtonShape !== 'link' ? <ExperienceOptionGrid label="Survol du bouton" options={[{ value: 'wipe' as const, label: 'Remplissage glissant' }, { value: 'roll' as const, label: 'Texte déroulant' }]} value={experience.tableButtonHover ?? 'wipe'} onChange={(tableButtonHover) => onChange({ tableButtonHover })} columns={2} /> : null}
          </> : null}
          {design === 'milestone' ? <>
            <ExperienceOptionGrid label="Forme du bouton" options={[{ value: 'link' as const, label: 'Lien discret' }, { value: 'rectangle' as const, label: 'Rectangle' }, { value: 'pill' as const, label: 'Pilule' }]} value={experience.milestoneButtonShape ?? 'link'} onChange={(milestoneButtonShape) => onChange({ milestoneButtonShape })} columns={3} />
            {experience.milestoneButtonShape && experience.milestoneButtonShape !== 'link' ? <ExperienceOptionGrid label="Survol du bouton" options={[{ value: 'wipe' as const, label: 'Remplissage glissant' }, { value: 'roll' as const, label: 'Texte déroulant' }]} value={experience.milestoneButtonHover ?? 'wipe'} onChange={(milestoneButtonHover) => onChange({ milestoneButtonHover })} columns={2} /> : null}
          </> : null}
          {isEditorial ? <>
            <ExperienceOptionGrid label="Forme du bouton" options={[{ value: 'link' as const, label: 'Lien discret' }, { value: 'rectangle' as const, label: 'Rectangle' }, { value: 'pill' as const, label: 'Pilule' }]} value={experience.editorialButtonShape ?? 'link'} onChange={(editorialButtonShape) => onChange({ editorialButtonShape })} columns={3} />
            {experience.editorialButtonShape && experience.editorialButtonShape !== 'link' ? <ExperienceOptionGrid label="Survol du bouton" options={[{ value: 'wipe' as const, label: 'Remplissage glissant' }, { value: 'roll' as const, label: 'Texte déroulant' }]} value={experience.editorialButtonHover ?? 'wipe'} onChange={(editorialButtonHover) => onChange({ editorialButtonHover })} columns={2} /> : null}
            <ExperienceOptionGrid label="Présentation du statut" options={[{ value: 'watermark' as const, label: 'Filigrane' }, { value: 'signature' as const, label: 'Signature' }, { value: 'vertical' as const, label: 'Vertical' }]} value={experience.editorialStatusStyle ?? 'watermark'} onChange={(editorialStatusStyle) => onChange({ editorialStatusStyle })} columns={3} />
            <ExperienceToggleRow label="Focus au survol" description="Atténuer les autres expériences pour mettre en valeur celle survolée." checked={experience.editorialFocusMode !== false} onChange={(editorialFocusMode) => onChange({ editorialFocusMode })} />
            {experience.editorialFocusMode !== false ? <ExperienceToggleRow label="Flou des autres expériences" description="Ajouter un flou léger à l’atténuation." checked={experience.editorialFocusBlur !== false} onChange={(editorialFocusBlur) => onChange({ editorialFocusBlur })} /> : null}
          </> : null}
          {isEditorial || design === 'kinetic' || design === 'milestone' ? (
            <ExperienceOptionGrid
              label="Présentation du stack"
              options={[
                { value: 'text' as const, label: 'Texte' },
                { value: 'pill' as const, label: 'Pilules' },
                { value: 'rectangle' as const, label: 'Rectangles' },
              ]}
              value={design === 'milestone' ? (experience.milestoneStackStyle ?? 'rectangle') : design === 'kinetic' ? (experience.kineticStackStyle ?? 'rectangle') : (experience.editorialStackStyle ?? 'text')}
              onChange={(stackStyle) => onChange(design === 'milestone' ? { milestoneStackStyle: stackStyle } : design === 'kinetic' ? { kineticStackStyle: stackStyle } : { editorialStackStyle: stackStyle })}
              columns={3}
            />
          ) : null}
          {design === 'kinetic' ? (
            <>
              <ExperienceOptionGrid
                label={t('Title weight')}
                options={PORTFOLIO_EXPERIENCE_KINETIC_TITLE_WEIGHT_OPTIONS}
                value={experience.kineticTitleWeight ?? 'semibold'}
                onChange={(kineticTitleWeight) => onChange({ kineticTitleWeight })}
                columns={4}
              />
              <ExperienceOptionGrid
                label={t('Vertical spacing')}
                options={PORTFOLIO_EXPERIENCE_KINETIC_SPACING_OPTIONS}
                value={experience.kineticSpacing ?? 'standard'}
                onChange={(kineticSpacing) => onChange({ kineticSpacing })}
                columns={4}
              />
              <ExperienceToggleRow label="Animation des blocs au scroll" description="Apparition et disparition progressives de chaque expérience selon le défilement." checked={experience.kineticScrollMotion !== false} onChange={(kineticScrollMotion) => onChange({ kineticScrollMotion })} />
              <ExperienceOptionGrid
                label="Présentation du statut"
                options={[
                  { value: 'watermark' as const, label: 'Filigrane' },
                  { value: 'signature' as const, label: 'Signature' },
                  { value: 'vertical' as const, label: 'Vertical' },
                ]}
                value={experience.kineticStatusStyle ?? 'watermark'}
                onChange={(kineticStatusStyle) => onChange({ kineticStatusStyle })}
                columns={3}
              />
              <ExperienceOptionGrid label="Forme du bouton" options={[{ value: 'link' as const, label: 'Lien discret' }, { value: 'rectangle' as const, label: 'Rectangle' }, { value: 'pill' as const, label: 'Pilule' }]} value={experience.kineticButtonShape ?? 'rectangle'} onChange={(kineticButtonShape) => onChange({ kineticButtonShape })} columns={3} />
              <ExperienceOptionGrid label="Survol du bouton" options={[{ value: 'wipe' as const, label: 'Remplissage glissant' }, { value: 'roll' as const, label: 'Texte déroulant' }]} value={experience.kineticButtonHover ?? 'wipe'} onChange={(kineticButtonHover) => onChange({ kineticButtonHover })} columns={2} />
            </>
          ) : null}
          {isTable ? (
            <>
            <ExperienceToggleRow
              label={t('Focus mode')}
              description={t('Soften other experiences when hovering or focusing a row.')}
              checked={experience.tableFocusMode !== false}
              onChange={(tableFocusMode) => onChange({ tableFocusMode })}
            />
            {experience.tableFocusMode !== false ? <ExperienceToggleRow label="Flou des autres expériences" checked={experience.tableFocusBlur !== false} onChange={(tableFocusBlur) => onChange({ tableFocusBlur })} /> : null}
            <ExperienceToggleRow
              label={t('Striped rows')}
              description={t('Alternate subtle row backgrounds for easier scanning.')}
              checked={experience.tableStripedRows === true}
              onChange={(tableStripedRows) => onChange({ tableStripedRows })}
            />
            </>
          ) : null}
          {isReel ? (
            <>
              <ExperienceOptionGrid label="Présentation du stack" options={[{value:'text' as const,label:'Texte'},{value:'pill' as const,label:'Pilules'},{value:'rectangle' as const,label:'Rectangles'}]} value={experience.reelStackStyle ?? 'text'} onChange={(reelStackStyle)=>onChange({reelStackStyle})} columns={3} />
              <ExperienceOptionGrid label="Forme du bouton" options={[{value:'link' as const,label:'Lien discret'},{value:'rectangle' as const,label:'Rectangle'},{value:'pill' as const,label:'Pilule'}]} value={experience.reelButtonShape ?? 'link'} onChange={(reelButtonShape)=>onChange({reelButtonShape})} columns={3} />
              {experience.reelButtonShape && experience.reelButtonShape !== 'link' ? <ExperienceOptionGrid label="Survol du bouton" options={[{value:'wipe' as const,label:'Remplissage glissant'},{value:'roll' as const,label:'Texte déroulant'}]} value={experience.reelButtonHover ?? 'wipe'} onChange={(reelButtonHover)=>onChange({reelButtonHover})} columns={2} /> : null}
              <p className="text-xs opacity-60">Défilement : Index distort.</p>
            </>
          ) : null}
          {isCards ? (
            <>
              <ExperienceOptionGrid
                label={t('Card width')}
                options={PORTFOLIO_EXPERIENCE_CARDS_CARD_WIDTH_OPTIONS}
                columns={3}
                value={experience.cardsCardWidth ?? 'medium'}
                onChange={(cardsCardWidth) => onChange({ cardsCardWidth })}
              />
              <ExperienceOptionGrid
                label={t('Title size')}
                options={PORTFOLIO_EXPERIENCE_CARDS_TITLE_SIZE_OPTIONS}
                columns={4}
                value={experience.cardsTitleSize ?? 'md'}
                onChange={(cardsTitleSize) => onChange({ cardsTitleSize })}
              />
              <ExperienceOptionGrid
                label={t('Element spacing')}
                options={PORTFOLIO_EXPERIENCE_CARDS_ELEMENT_SPACING_OPTIONS}
                columns={3}
                value={experience.cardsElementSpacing ?? 'md'}
                onChange={(cardsElementSpacing) => onChange({ cardsElementSpacing })}
              />
              <ExperienceOptionGrid
                label={t('Vertical gap')}
                options={PORTFOLIO_EXPERIENCE_CARDS_VERTICAL_GAP_OPTIONS}
                columns={3}
                value={experience.cardsVerticalGap ?? 'md'}
                onChange={(cardsVerticalGap) => onChange({ cardsVerticalGap })}
              />
              <ExperienceToggleRow label="Ombre diffuse autour des cartes" description="Afficher une ombre douce autour du cadre." checked={experience.cardsFrameShadow === true} onChange={(cardsFrameShadow) => onChange({ cardsFrameShadow })} />
              <CardsStyleControls
 collapsible={false}
                value={experience.cardsStyle ?? DEFAULT_CARDS_STYLE}
                onChange={(cardsStyle) => onChange({ cardsStyle })}
                palette={experience.experiencePalette}
              />
              <ExperienceToggleRow
                label={t('Scroll cascade effect')}
                checked={(experience.cardsStackEffect ?? 'cascade') === 'cascade'}
                onChange={(checked) =>
                  onChange({ cardsStackEffect: checked ? 'cascade' : 'static' })
                }
              />
              {(experience.cardsStackEffect ?? 'cascade') === 'static' ? <ExperienceToggleRow
                label={t('Equal card height')}
                checked={experience.cardsEqualHeight === true}
                onChange={(cardsEqualHeight) => onChange({ cardsEqualHeight })}
              /> : <p className="text-xs opacity-60">Les cartes empilées adoptent automatiquement la même hauteur sur ordinateur.</p>}
            </>
          ) : null}
          {isEditorial ? (
            <>
              <ExperienceOptionGrid
                label={t('Entry expand')}
                options={PORTFOLIO_EXPERIENCE_ENTRY_EXPAND_MODE_OPTIONS}
                value={experience.entryExpandMode ?? 'accordion'}
                onChange={(entryExpandMode) => onChange({ entryExpandMode })}
                columns={2}
              />
              <ExperienceOptionGrid
                label={t('Detail layout')}
                options={PORTFOLIO_EXPERIENCE_EDITORIAL_DETAIL_LAYOUT_OPTIONS}
                value={experience.editorialDetailLayout ?? 'split-actions'}
                onChange={(editorialDetailLayout) => onChange({ editorialDetailLayout })}
                columns={2}
              />
              <ExperienceOptionGrid
                label={t('Period / timeline')}
                options={PORTFOLIO_EXPERIENCE_PERIOD_DESIGN_OPTIONS}
                value={experience.periodDesign ?? 'plain'}
                onChange={(periodDesign) => onChange({ periodDesign })}
                columns={2}
              />
            </>
          ) : null}
          {isDuotone ? (
            <>
              <ExperienceOptionGrid label="Alignement des tâches" options={[{value:'offset' as const,label:'Décalé'},{value:'aligned' as const,label:'Aligné'}]} value={experience.duotoneTaskAlignment ?? 'offset'} onChange={(duotoneTaskAlignment)=>onChange({duotoneTaskAlignment})} columns={2} />
              <ExperienceOptionGrid label="Présentation du stack" options={[{value:'text' as const,label:'Texte'},{value:'pill' as const,label:'Pilules'},{value:'rectangle' as const,label:'Rectangles'}]} value={experience.duotoneStackStyle ?? 'text'} onChange={(duotoneStackStyle)=>onChange({duotoneStackStyle})} columns={3} />
              <label className="block text-sm">Libellé du curseur de la miniature
                <input type="text" maxLength={120} value={experience.duotoneButtonLabel ?? ''} placeholder={t('Consult')} onChange={(event)=>onChange({duotoneButtonLabel:event.target.value})} className="mt-2 h-10 w-full rounded border border-[color:var(--pf-palette-bordure)] bg-transparent px-3" />
              </label>
            </>
          ) : null}
          {isDuotone ? (
            <ExperienceOptionGrid
              label={t('Scroll mode')}
              options={PORTFOLIO_EXPERIENCE_DUOTONE_SCROLL_MODE_OPTIONS}
              value={experience.duotoneScrollMode ?? 'sticky'}
              onChange={(duotoneScrollMode) => onChange({ duotoneScrollMode })}
              columns={3}
            />
          ) : null}
          {isDuotone && (experience.duotoneScrollMode ?? 'sticky') === 'slide' ? (
            <>
              <ExperienceOptionGrid
                label={t('Slide navigation')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_SLIDE_NAV_STYLE_OPTIONS}
                value={experience.duotoneSlideNavStyle ?? 'chevron'}
                onChange={(duotoneSlideNavStyle) => onChange({ duotoneSlideNavStyle })}
                columns={3}
              />
              <ExperienceToggleRow
                label={t('Auto-advance')}
                description={t('Move to the next role every 5s — pauses while the frame is hovered.')}
                checked={experience.duotoneAutoAdvance === true}
                onChange={(duotoneAutoAdvance) => onChange({ duotoneAutoAdvance })}
              />
            </>
          ) : null}
          {isDuotone && experience.duotoneScrollMode === 'slide' ? (
            <>
              <ExperienceOptionGrid
                label={t('Screen frame color')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_COLOR_OPTIONS}
                value={experience.duotoneFrameColor ?? 'none'}
                onChange={(duotoneFrameColor) => onChange({ duotoneFrameColor })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Screen frame radius')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_RADIUS_OPTIONS}
                value={experience.duotoneFrameRadius ?? 'sm'}
                onChange={(duotoneFrameRadius) => onChange({ duotoneFrameRadius })}
                columns={3}
              />
            </>
          ) : null}
          {isDuotone &&
          (experience.duotoneScrollMode === 'scroll' || (experience.duotoneScrollMode ?? 'sticky') === 'sticky') ? (
            <>
              <ExperienceOptionGrid
                label={t('Thumbnail effect')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_EFFECT_OPTIONS}
                value={experience.duotoneThumbnailEffect ?? 'grayscale'}
                onChange={(duotoneThumbnailEffect) => onChange({ duotoneThumbnailEffect })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Thumbnail height')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS}
                value={experience.duotoneThumbnailHeight ?? 'md'}
                onChange={(duotoneThumbnailHeight) => onChange({ duotoneThumbnailHeight })}
                columns={3}
              />
            </>
          ) : null}
          {isDuotone &&
          (experience.duotoneScrollMode === 'scroll' ||
            (experience.duotoneScrollMode ?? 'sticky') === 'sticky') ? (
            <>
              <ExperienceOptionGrid
                label={t('Vertical spacing')}
                options={PORTFOLIO_EXPERIENCE_DUOTONE_STICKY_VERTICAL_GAP_OPTIONS}
                value={experience.duotoneStickyVerticalGap ?? 'md'}
                onChange={(duotoneStickyVerticalGap) => onChange({ duotoneStickyVerticalGap })}
                columns={2}
              />
              <ExperienceToggleRow
                label={t('Swap columns')}
                description={t('Title & thumbnail on the right, info card on the left.')}
                checked={experience.duotoneStickySwapSides === true}
                onChange={(duotoneStickySwapSides) => onChange({ duotoneStickySwapSides })}
              />
              {experience.duotoneScrollMode === 'scroll' ? (
                <>
                  <ExperienceToggleRow
                    label={t('Full-width title')}
                    description={t('Role title spans the full width above both columns.')}
                    checked={experience.duotoneScrollFullWidthTitle === true}
                    onChange={(duotoneScrollFullWidthTitle) =>
                      onChange({ duotoneScrollFullWidthTitle })
                    }
                  />
                  <ExperienceToggleRow
                    label={t('Alternate sides')}
                    description={t('Flip title/info columns on every other role.')}
                    checked={experience.duotoneAlternateSides === true}
                    onChange={(duotoneAlternateSides) => onChange({ duotoneAlternateSides })}
                  />
                </>
              ) : null}
            </>
          ) : null}
          {isGallery ? (
            <>
              <ExperienceToggleRow label="Fenêtre de détails" description="Ouvrir les détails au clic sur une carte. Désactivez pour une galerie sans fenêtre flottante." checked={experience.galleryDetailsEnabled !== false} onChange={(galleryDetailsEnabled)=>onChange({galleryDetailsEnabled})} />
              <ExperienceToggleRow label="Composition décalée" description="Décaler légèrement les cartes sur grand écran." checked={experience.galleryStaggered !== false} onChange={(galleryStaggered)=>onChange({galleryStaggered})} />
              <ExperienceOptionGrid label="Présentation du stack" options={[{value:'text' as const,label:'Texte'},{value:'pill' as const,label:'Pilules'},{value:'rectangle' as const,label:'Rectangles'}]} value={experience.galleryStackStyle ?? 'text'} onChange={(galleryStackStyle)=>onChange({galleryStackStyle})} columns={3} />
              {experience.galleryDetailsEnabled !== false ? <>
                <ExperienceOptionGrid label="Forme du bouton" options={[{value:'link' as const,label:'Lien discret'},{value:'rectangle' as const,label:'Rectangle'},{value:'pill' as const,label:'Pilule'}]} value={experience.galleryButtonShape ?? 'link'} onChange={(galleryButtonShape)=>onChange({galleryButtonShape})} columns={3} />
                <label className="block text-sm">Libellé du bouton<input type="text" maxLength={120} value={experience.galleryButtonLabel ?? ''} placeholder={t('View project')} onChange={(event)=>onChange({galleryButtonLabel:event.target.value})} className="mt-2 h-10 w-full rounded border border-[color:var(--pf-palette-bordure)] bg-transparent px-3" /></label>
                {experience.galleryButtonShape && experience.galleryButtonShape !== 'link' ? <ExperienceOptionGrid label="Survol du bouton" options={[{value:'wipe' as const,label:'Remplissage glissant'},{value:'roll' as const,label:'Texte déroulant'}]} value={experience.galleryButtonHover ?? 'wipe'} onChange={(galleryButtonHover)=>onChange({galleryButtonHover})} columns={2} /> : null}
              </> : null}
            </>
          ) : null}
          {isGallery ? (
            <ExperienceOptionGridWithInfo
              label={t('Thumbnail')}
              options={PORTFOLIO_EXPERIENCE_GALLERY_THUMBNAIL_FIT_OPTIONS}
              value={experience.galleryThumbnailFit ?? 'cover'}
              onChange={(galleryThumbnailFit) => onChange({ galleryThumbnailFit })}
              columns={2}
            />
          ) : null}
          {isGallery ? (
            <ExperienceThumbnailRadiusChoiceGrid
              value={experience.galleryThumbnailRadius ?? 'md'}
              onChange={(galleryThumbnailRadius) => onChange({ galleryThumbnailRadius })}
            />
          ) : null}
          {isGallery ? (
            <ExperienceHoverMomentChoiceGrid
              value={experience.galleryHoverEffect ?? 'curtain'}
              onChange={(galleryHoverEffect) => onChange({ galleryHoverEffect })}
            />
          ) : null}
          {isGallery ? (
            <ExperienceGalleryColumnsChoiceGrid
              value={experience.galleryColumns ?? 3}
              onChange={(galleryColumns) => onChange({ galleryColumns })}
            />
          ) : null}
          {isGallery ? (
            <ExperienceItemGapChoiceGrid
              value={experience.galleryGap ?? 'md'}
              onChange={(galleryGap) => onChange({ galleryGap })}
            />
          ) : null}
          {isLoft ? (
            <ExperienceOptionGridWithInfo
              label={t('Thumbnail')}
              options={PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_FIT_OPTIONS}
              value={experience.loftThumbnailFit ?? 'cover'}
              onChange={(loftThumbnailFit) => onChange({ loftThumbnailFit })}
              columns={2}
            />
          ) : null}
          {isLoft ? (
            <ExperienceThumbnailRadiusChoiceGrid
              value={experience.loftThumbnailRadius ?? 'md'}
              onChange={(loftThumbnailRadius) => onChange({ loftThumbnailRadius })}
            />
          ) : null}
          {isLoft ? (
            <ExperienceHoverMomentChoiceGrid
              value={experience.loftHoverEffect ?? 'curtain'}
              onChange={(loftHoverEffect) => onChange({ loftHoverEffect })}
            />
          ) : null}
          {isLoft ? (
            <ExperienceLoftColumnsChoiceGrid
              value={experience.loftColumns ?? 3}
              onChange={(loftColumns) => onChange({ loftColumns })}
            />
          ) : null}
          {isLoft ? (
            <ExperienceItemGapChoiceGrid
              value={experience.loftGap ?? 'md'}
              onChange={(loftGap) => onChange({ loftGap })}
            />
          ) : null}
          {isPress ? (
            <ExperienceThumbnailRadiusChoiceGrid
              value={experience.pressThumbnailRadius ?? 'md'}
              onChange={(pressThumbnailRadius) => onChange({ pressThumbnailRadius })}
            />
          ) : null}

          {isLegacy ? (
            <ExperienceToggleRow
              label={t('Hero title')}
              description={t('The two-tone headline above the feature blocks.')}
              checked={experience.legacyHeadingEnabled !== false}
              onChange={(legacyHeadingEnabled) => onChange({ legacyHeadingEnabled })}
            />
          ) : null}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="pf-exp-block-label block">
                    {t('Title')}
                  </label>
                  <input
                    type="text"
                    value={experience.legacyHeadingText ?? 'A Career Built on'}
                    onChange={(event) => onChange({ legacyHeadingText: event.target.value })}
                    placeholder={t('A Career Built on')}
                    className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
                  />
                </div>
                <div>
                  <label className="pf-exp-block-label block">
                    {t('Title (accent)')}
                  </label>
                  <input
                    type="text"
                    value={experience.legacyHeadingAccentText ?? 'Craft'}
                    onChange={(event) => onChange({ legacyHeadingAccentText: event.target.value })}
                    placeholder={t('Craft')}
                    className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
                  />
                </div>
              </div>
              <div>
                <label className="pf-exp-block-label block">
                  {t('Intro sentence')}
                </label>
                <input
                  type="text"
                  value={experience.legacyIntroText ?? ''}
                  onChange={(event) => onChange({ legacyIntroText: event.target.value })}
                  placeholder={t('A selection of roles, teams, and problems solved along the way.')}
                  className="mt-3 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]"
                />
              </div>
            </>
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label={t('Image corners')}
              options={PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS}
              value={experience.legacyThumbnailRadius ?? 'xl'}
              onChange={(legacyThumbnailRadius) => onChange({ legacyThumbnailRadius })}
              columns={3}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label={t('Image height')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_HEIGHT_OPTIONS}
              value={experience.legacyThumbnailHeight ?? 'lg'}
              onChange={(legacyThumbnailHeight) => onChange({ legacyThumbnailHeight })}
              columns={3}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label={t('Image width')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_WIDTH_OPTIONS}
              value={experience.legacyThumbnailWidth ?? 'lg'}
              onChange={(legacyThumbnailWidth) => onChange({ legacyThumbnailWidth })}
              columns={3}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceOptionGrid
              label={t('Spacing between entries')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_ITEM_GAP_OPTIONS}
              value={experience.legacyItemGap ?? 'md'}
              onChange={(legacyItemGap) => onChange({ legacyItemGap })}
              columns={4}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceToggleRow
              label={t('Alternate image side')}
              description={t('Switch the image left/right on every other entry. Off keeps it on the same side.')}
              checked={experience.legacyAlternateSides !== false}
              onChange={(legacyAlternateSides) => onChange({ legacyAlternateSides })}
            />
          ) : null}
          {isLegacy && experience.legacyAlternateSides === false ? (
            <ExperienceOptionGrid
              label={t('Image side')}
              options={PORTFOLIO_EXPERIENCE_LEGACY_FIXED_SIDE_OPTIONS}
              value={experience.legacyFixedSide ?? 'left'}
              onChange={(legacyFixedSide) => onChange({ legacyFixedSide })}
              columns={2}
            />
          ) : null}
          {isLegacy ? (
            <ExperienceToggleRow
              label={t('Show tasks')}
              description={t('Off by default for this design — the task list stays hidden unless turned on.')}
              checked={experience.legacyShowTasks === true}
              onChange={(legacyShowTasks) => onChange({ legacyShowTasks })}
            />
          ) : null}
          {/* ========== LEGACY HEADER PREMIUM OPTIONS ========== */}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="mt-6 pt-4 border-t border-[color:var(--pf-palette-bordure)]">
                <p className="pf-exp-block-label block mb-3">{t('Header Animation')}</p>
              </div>
              <ExperienceToggleRow
                label={t('Entry animation')}
                description={t('GSAP-powered reveal animations when the header enters the viewport.')}
                checked={experience.legacyHeaderAnimationEnabled !== false}
                onChange={(legacyHeaderAnimationEnabled) => onChange({ legacyHeaderAnimationEnabled })}
              />
              {experience.legacyHeaderAnimationEnabled !== false ? (
                <ExperienceOptionGrid
                  label={t('Animation style')}
                  options={PORTFOLIO_EXPERIENCE_LEGACY_ANIMATION_STYLE_OPTIONS}
                  value={experience.legacyHeaderAnimationStyle ?? 'bloom'}
                  onChange={(legacyHeaderAnimationStyle) => onChange({ legacyHeaderAnimationStyle })}
                  columns={3}
                />
              ) : null}
              <ExperienceToggleRow
                label={t('Scroll parallax')}
                description={t('Asymmetric parallax effect on scroll — accent word stays longer.')}
                checked={experience.legacyScrollParallaxEnabled !== false}
                onChange={(legacyScrollParallaxEnabled) => onChange({ legacyScrollParallaxEnabled })}
              />
            </>
          ) : null}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="mt-6 pt-4 border-t border-[color:var(--pf-palette-bordure)]">
                <p className="pf-exp-block-label block mb-3">{t('Typography')}</p>
              </div>
              <ExperienceOptionGrid
                label={t('Prefix weight')}
                options={PORTFOLIO_EXPERIENCE_LEGACY_PREFIX_WEIGHT_OPTIONS}
                value={experience.legacyPrefixWeight ?? 'light'}
                onChange={(legacyPrefixWeight) => onChange({ legacyPrefixWeight })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Accent style')}
                options={PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_STYLE_OPTIONS}
                value={experience.legacyAccentStyle ?? 'italic-bold'}
                onChange={(legacyAccentStyle) => onChange({ legacyAccentStyle })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Accent size')}
                options={PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_SIZE_OPTIONS}
                value={experience.legacyAccentSize ?? 'dramatic'}
                onChange={(legacyAccentSize) => onChange({ legacyAccentSize })}
                columns={3}
              />
              <ExperienceOptionGrid
                label={t('Subtitle style')}
                options={PORTFOLIO_EXPERIENCE_LEGACY_SUBTITLE_STYLE_OPTIONS}
                value={experience.legacySubtitleStyle ?? 'micro'}
                onChange={(legacySubtitleStyle) => onChange({ legacySubtitleStyle })}
                columns={3}
              />
            </>
          ) : null}
          {isLegacy && experience.legacyHeadingEnabled !== false ? (
            <>
              <div className="mt-6 pt-4 border-t border-[color:var(--pf-palette-bordure)]">
                <p className="pf-exp-block-label block mb-3">{t('Decorative Elements')}</p>
              </div>
              <ExperienceToggleRow
                label={t('Accent underline')}
                description={t('Show a decorative line under the accent word.')}
                checked={experience.legacyAccentUnderline !== false}
                onChange={(legacyAccentUnderline) => onChange({ legacyAccentUnderline })}
              />
              {experience.legacyAccentUnderline !== false ? (
                <ExperienceOptionGrid
                  label={t('Underline style')}
                  options={PORTFOLIO_EXPERIENCE_LEGACY_UNDERLINE_STYLE_OPTIONS}
                  value={experience.legacyAccentUnderlineStyle ?? 'solid'}
                  onChange={(legacyAccentUnderlineStyle) => onChange({ legacyAccentUnderlineStyle })}
                  columns={2}
                />
              ) : null}
            </>
          ) : null}
          {showStackLabel ? (
            <>
              <ExperienceOptionalTextField
                label={t('Stack label')}
                value={experience.toolsLabel}
                placeholder={t('Stack')}
                checked={experience.blockLabelVisibility?.tools !== false && experience.showBlockLabels !== false}
                onCheckedChange={(visible) =>
                  onChange({
                    showBlockLabels: true,
                    blockLabelVisibility: {
                      ...DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY,
                      ...experience.blockLabelVisibility,
                      tools: visible,
                    },
                  })
                }
                onValueChange={(toolsLabel) => onChange({ toolsLabel })}
              />
              <ExperienceOptionalTextField
                label={t('Responsibilities label')}
                value={experience.tasksLabel}
                placeholder={t('Responsibilities')}
                checked={experience.blockLabelVisibility?.tasks !== false && experience.showBlockLabels !== false}
                onCheckedChange={(visible) =>
                  onChange({
                    showBlockLabels: true,
                    blockLabelVisibility: {
                      ...DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY,
                      ...experience.blockLabelVisibility,
                      tasks: visible,
                    },
                  })
                }
                onValueChange={(tasksLabel) => onChange({ tasksLabel })}
              />
              {(design === 'kinetic' || design === 'milestone' || isCards || isDuotone || isGallery) && experience.showBlockLabels !== false && (experience.blockLabelVisibility?.tasks !== false || experience.blockLabelVisibility?.tools !== false) ? (
                <div className="grid grid-cols-2 gap-3">
                  <ColorSwatchRow
                    label="Couleur des libellés"
                    options={([
                      ['primary', 'Primary', 'principal'],
                      ['secondary', 'Secondary', 'secondaire'],
                      ['strong', 'Strong text', 'texteFort'],
                      ['muted', 'Muted text', 'texteMuted'],
                    ] as const).map(([value, label, token]) => ({ value, label: t(label), color: backgroundTheme.palette[token] }))}
                    value={isCards ? (experience.cardsLabelColor ?? 'muted') : design === 'milestone' ? (experience.milestoneLabelColor ?? 'muted') : (experience.kineticTasksLabelColor || 'muted')}
                    onChange={(labelColor) => onChange(isCards ? { cardsLabelColor: labelColor as 'primary' | 'secondary' | 'strong' | 'muted' } : design === 'milestone' ? { milestoneLabelColor: labelColor as 'primary' | 'secondary' | 'strong' | 'muted' } : { kineticTasksLabelColor: labelColor })}
                  />
                  <label className="block text-xs">
                    Taille des libellés (px)
                    <input aria-label="Taille des libellés Stack et Responsibilities" type="number" min={8} max={40} step={1} value={isCards ? (experience.cardsLabelSize ?? 12) : design === 'milestone' ? (experience.milestoneLabelSize ?? 12) : (experience.kineticTasksLabelSize ?? 12)} onChange={(event) => { const size = event.target.valueAsNumber; if (Number.isFinite(size)) onChange(isCards ? { cardsLabelSize: Math.max(8, Math.min(40, size)) } : design === 'milestone' ? { milestoneLabelSize: Math.max(8, Math.min(40, size)) } : { kineticTasksLabelSize: Math.max(8, Math.min(40, size)) }); }} className="mt-2 h-10 w-full rounded border border-[color:var(--pf-palette-bordure)] bg-transparent px-3" />
                  </label>
                </div>
              ) : null}
            </>
          ) : null}
          </LayoutControlGroups>
          </SettingsRowsScope>
          <NpCollapsibleSection title={t('Details')}>
          <ExperienceTasksDisplayChoiceGrid
            value={experience.tasksDisplay ?? 'editorial-dash'}
            onChange={(tasksDisplay) => onChange({ tasksDisplay })}
          />
          <ExperienceToggleRow
            label="Afficher les numéros et puces"
            description="Masquer les marqueurs et réaligner le texte des tâches."
            checked={experience.showTaskMarkers !== false}
            onChange={(showTaskMarkers) => onChange({ showTaskMarkers })}
          />
          </NpCollapsibleSection>
          </>}
        </div>
      )}
    </NpPanelShell>
    </PortfolioLinkArrowProvider>
  );
}
