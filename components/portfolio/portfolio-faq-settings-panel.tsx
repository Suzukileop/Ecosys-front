'use client';
import { PortfolioDesignLivePreview, usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import {StackPreviewSkeleton} from './portfolio-stack-preview-skeleton';
import {FaqHeaderSkeleton} from './portfolio-faq-header-skeleton';
import {useThumbnailTheme} from './portfolio-thumbnail-theme';
import {FaqDesignThumbnail} from '@/components/portfolio/portfolio-faq-design-thumbnail';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { HeaderDesignFields, type HeaderCopy } from '@/components/portfolio/portfolio-header-design-fields';
import { HeaderSteppedSlider, type HeaderPatch } from '@/components/portfolio/portfolio-header-style-controls';
import { TextSizeSlider } from '@/components/portfolio/portfolio-text-size-slider';
import { ColorSwatchRow } from '@/components/portfolio/portfolio-color-swatch-row';
import { useId, useState, type ReactNode } from 'react';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import {
  mergeFaqColorBindings,
  mergeFaqPalette,
  patchFaqColorBinding,
  DEFAULT_FAQ_COLOR_BINDINGS,
  DEFAULT_FAQ_PALETTE,
  type FaqColorSlot,
} from '@/components/portfolio/portfolio-faq-palette-settings';
import { resolveHeroPaletteColor, type HeroPaletteTokenId } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_FAQ_PRESENTATION,
  PORTFOLIO_FAQ_DESIGN_OPTIONS,
  PORTFOLIO_FAQ_PREMIUM_FONT_SIZE_OPTIONS,
  FAQ_TEXT_COLOR_TOKENS,
  FAQ_FONT_WEIGHT_CHOICES,
  FAQ_DESIGNS_WITH_LAYOUT_SETTINGS,
  FAQ_GAPS,
  FAQ_HEADER_INKS,
  FAQ_HEADER_SUBTITLE_SIZES,
  type PortfolioFaqHeaderInk,
  type PortfolioFaqHeaderSubtitleSize,
  resolveFaqHeaderPosition,
  type PortfolioFaqHeaderPosition,
  type PortfolioFaqMarker,
  FAQ_GAP_FACTOR,
  type PortfolioFaqGap,
  FAQ_FONT_WEIGHT_NUMBER,
  type PortfolioFaqFontWeight,
  defaultsForFaqDesign,
  type PortfolioFaqSectionSettings,
  type PortfolioFaqDesign,
  type PortfolioFaqTextColorToken,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  FAQ_HEADER_DESIGNS_SELECTABLE,
  PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS,
  type PortfolioFaqHeaderDesign,
  type PortfolioFaqHeaderDesignSelectable,
  faqHeaderPaletteTokenColor,
} from '@/components/portfolio/portfolio-faq-header-settings';
import {
  FAQ_HEADER_LAYOUT_SPECS,
  faqHeaderLayoutOverride,
  patchFaqHeaderLayoutElement,
  resolveFaqHeaderLayoutOption,
  resolveFaqHeaderLayoutVisible,
  type FaqHeaderLayoutElementSpec,
  type FaqHeaderLayoutGroup,
} from '@/components/portfolio/portfolio-faq-header-layout';
import {
  DEFAULT_FAQ_FRAME,
  faqDesignAllowsFrame,
  FAQ_FRAME_BORDER_COLORS,
  FAQ_FRAME_BORDER_PX,
  FAQ_FRAME_BORDER_WIDTHS,
  FAQ_FRAME_FILL_DEFAULT_OPACITY,
  FAQ_FRAME_FILLS,
  FAQ_FRAME_PADDINGS,
  FAQ_FRAME_RADII,
  FAQ_FRAME_RADIUS_PX,
  FAQ_FRAME_SHADOWS,
  type PortfolioFaqFrameBorderColor,
  type PortfolioFaqFrameBorderWidth,
  type PortfolioFaqFrameFill,
  type PortfolioFaqFramePadding,
  type PortfolioFaqFrameRadius,
  type PortfolioFaqFrameSettings,
  type PortfolioFaqFrameShadow,
} from '@/components/portfolio/portfolio-faq-frame';
import { SettingRow, useSettingsRows } from '@/components/portfolio/portfolio-settings-rows';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { NpBackRow, NpCollapsibleSection, NpPanelShell, NpToggleRow, type NpPanelChrome } from '@/components/portfolio/portfolio-nav-panel-ui';

export type FaqSubSection = 'general' | 'design' | 'background' | 'header';

const FAQ_SUB_SECTIONS: { id: FaqSubSection; label: string; description: string }[] = [
  { id: 'general', label: msg('General'), description: msg('Visibility, color mode and text size.') },
  { id: 'design', label: msg('Design'), description: msg('Layout and visual style.') },
  { id: 'header', label: msg('Header'), description: msg('The title block above the FAQ list.') },
  { id: 'background', label: msg('Background'), description: msg('Fill behind this section.') },
];

/** Map legacy subsection ids (saved UI state / search) onto the current FAQ menu. */
export function normalizeFaqSubSection(value: string | undefined): FaqSubSection {
  if (value === 'general' || value === 'design' || value === 'background' || value === 'header') return value;
  return 'general';
}

/* ---------------------------------------------------------------------- */
/* Shared local building blocks — reuse the same pf-stack-* CSS classes    */
/* every other section's settings panel already draws on (Stack, Info,    */
/* Tools, Team, Gallery), per the design standard's "never recreate a      */
/* standardized component" rule.                                          */
/* ---------------------------------------------------------------------- */

function FaqToggleRow({
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
          {info ? <FaqInfoTooltip text={info} /> : null}
        </span>
        <FaqSwitchTrack checked={checked} />
      </span>
    </button>
  );
}

function FaqSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span className="np-switch" aria-checked={checked} aria-hidden data-switch-track="">
      <span className="np-switch-knob" />
    </span>
  );
}

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus
 *  instead of a permanent line of text under a toggle. */
function FaqInfoTooltip({ text }: { text: string }) {
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

function _FaqPickerCard({
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
        <span className={`pf-stack-card-label min-w-0 font-semibold leading-none tracking-tight ${compact ? 'text-xs' : 'text-sm'}`}>
          {label}
        </span>
      </span>
    </button>
  );
}

function _FaqDesignSummaryRow({
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
          <span className="flex w-[116px] shrink-0 origin-center scale-[1.05] items-center justify-center">{children}</span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{name}</span>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[color:var(--pf-palette-texte-muted)]" aria-hidden>
          <path d="M7.5 4.5l5 5.5-5 5.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/** 0–100% slider with the live value beside its label (standard rule 1a). */
function FaqPercentSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const rows = useSettingsRows();
    return (
    <SettingRow label={label} value={String(value ?? '')}>
    <div>
      {rows ? null : (<div className="flex items-center justify-between gap-4">
        <span className="pf-stack-block-label">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-[color:var(--pf-palette-texte-muted)]">{Math.round(value)}%</span>
      </div>)}
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="np-range mt-2" style={{ ['--np-fill' as string]: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
    </SettingRow>
  );
}

function FaqLayoutSettingsBand({
  children,
  motionKey,
  title = 'Design settings',
}: {
  children: ReactNode;
  motionKey: string;
  title?: string;
}) {
  return (
    <section className="pf-stack-layout-settings" aria-labelledby="faq-layout-settings-title">
      <h3 id="faq-layout-settings-title" className="sr-only">
        {title}
      </h3>
      <div key={motionKey} className="pf-stack-layout-settings-body space-y-6">
        {children}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* DESIGN tab — the top-level layout catalog (same collapsed-preview /     */
/* expand-to-grid mechanism as Stack/Info's own Design tab), plus the      */
/* per-design settings band below it.                                     */
/* ---------------------------------------------------------------------- */


/** Same collapsed-preview / expand-to-grid mechanism as every other
 *  section's own Design tab (Stack, Info, …). */
function FaqKineticPreviewSkeleton({ dark }: { dark: boolean }) {
  return (
    <svg viewBox="0 0 640 320" className="h-full w-full" aria-hidden="true" style={{ backgroundColor: dark ? '#171717' : '#f5f5f5', color: dark ? '#f5f5f5' : '#171717' }}>
      <g fill="currentColor">
        <rect x="44" y="86" width="22" height="4" rx="2" opacity="0.18" />
        <rect x="44" y="105" width="106" height="16" rx="3" opacity="0.2" />
        <rect x="44" y="129" width="75" height="16" rx="3" opacity="0.2" />
        <rect x="44" y="166" width="132" height="4" rx="2" opacity="0.1" />
        <rect x="44" y="178" width="96" height="4" rx="2" opacity="0.1" />
        {[108, 158, 208].map((y, index) => (
          <g key={y}>
            <rect x="326" y={y} width="8" height="4" rx="2" opacity="0.12" />
            <rect x="351" y={y - 2} width={[204, 168, 188][index]} height="7" rx="3" opacity="0.18" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function FaqDesignPreviewSkeleton({ design, dark }: { design: PortfolioFaqDesign; dark: boolean }) {
  if (design === 'kinetic-split') return <FaqKineticPreviewSkeleton dark={dark} />;
  const centered = design === 'centered-focus' || design === 'floating-gallery';
  const grid = design === 'tri-grid' || design === 'editorial-masonry' || design === 'bento-dual';
  const titleX = centered ? 228 : 44;
  return (
    <svg viewBox="0 0 640 320" className="h-full w-full" aria-hidden="true" style={{ backgroundColor: dark ? '#171717' : '#f5f5f5', color: dark ? '#f5f5f5' : '#171717' }}>
      <g fill="currentColor">
        <rect x={titleX} y="48" width="24" height="4" rx="2" opacity="0.12" />
        <rect x={titleX} y="65" width="184" height="14" rx="3" opacity="0.22" />
        <rect x={titleX} y="90" width="132" height="4" rx="2" opacity="0.1" />
        {design === 'floating-gallery' ? <>
          <rect x="108" y="125" width="424" height="134" rx="12" opacity="0.06" />
          <circle cx="510" cy="143" r="5" opacity="0.15" />
          <rect x="136" y="157" width="246" height="9" rx="3" opacity="0.2" />
          <rect x="136" y="183" width="344" height="4" rx="2" opacity="0.1" />
          <rect x="136" y="197" width="286" height="4" rx="2" opacity="0.1" />
        </> : grid ? Array.from({ length: design === 'tri-grid' ? 3 : 4 }, (_, index) => {
          const columns = design === 'tri-grid' ? 3 : 2;
          const width = columns === 3 ? 164 : 260;
          const x = 44 + (index % columns) * (width + 16);
          const y = 126 + Math.floor(index / columns) * 82 + (design === 'editorial-masonry' && index % 2 ? 12 : 0);
          return <g key={index}>
            {design === 'bento-dual' ? <rect x={x} y={y} width={width} height="70" rx="8" opacity="0.06" /> : null}
            <rect x={x + 12} y={y + 12} width={width * 0.72} height="7" rx="3" opacity="0.2" />
            <rect x={x + 12} y={y + 32} width={width * 0.84} height="4" rx="2" opacity="0.1" />
            <rect x={x + 12} y={y + 44} width={width * 0.6} height="4" rx="2" opacity="0.1" />
          </g>;
        }) : [132, 182, 232].map((y, index) => <g key={y}>
          {design === 'prism-cards' ? <rect x="44" y={y - 14} width="552" height="40" rx="7" opacity="0.05" /> : null}
          {design === 'split-index' ? <rect x="44" y={y} width="15" height="7" rx="2" opacity="0.2" /> : null}
          <rect x={design === 'split-index' ? 146 : centered ? 132 : 64} y={y} width={[288, 242, 266][index]} height="7" rx="3" opacity="0.18" />
          <rect x="558" y={y} width="8" height="7" rx="2" opacity="0.12" />
        </g>)}
      </g>
    </svg>
  );
}

function FaqDesignChoiceGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioFaqDesign;onChange:(value:PortfolioFaqDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const selected=PORTFOLIO_FAQ_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_FAQ_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return <div className="flex flex-col gap-8" aria-label={t('Choose a design')}>{PORTFOLIO_FAQ_DESIGN_OPTIONS.map(option=><DesignCatalogueCard key={option.value} label={t(option.label)} selected={option.value===value} onSelect={()=>onChange(option.value)} onCustomize={FAQ_DESIGNS_WITH_LAYOUT_SETTINGS.has(option.value)?()=>{if(value!==option.value)onChange(option.value);setShowGrid(false);}:undefined}>{previewSource?<span className="relative block aspect-[2/1] w-full overflow-hidden rounded-lg"><PortfolioDesignLivePreview src={withDesignPreview(previewSource.portfolioPath,{section:'faq',design:option.value})} settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={<FaqDesignPreviewSkeleton design={option.value} dark={(previewSource.settings.faq.colorModeOverride === 'auto' ? previewSource.settings.global.colorMode : previewSource.settings.faq.colorModeOverride) !== 'light'} />}/></span>:<FaqDesignThumbnail design={option.value}/>}</DesignCatalogueCard>)}</div>;
}



function FaqHeaderDesignWireframe({design}:{design:PortfolioFaqHeaderDesignSelectable}){
 return <StackPreviewSkeleton section="faq"><FaqHeaderSkeleton design={design} compact/></StackPreviewSkeleton>;
}

/** Same collapsed-preview / expand-to-grid mechanism as the Design tab's own picker. Falls
 *  back to the first selectable design for display when the saved `headerDesign` is one of
 *  the frozen legacy 8 (or unset) — purely a display fallback, doesn't write anything until
 *  the creator actually picks a card, same convention as `FaqDesignChoiceGrid`. */
function FaqHeaderChoiceGrid({value,onChange,showGrid,setShowGrid}:{value:PortfolioFaqHeaderDesign;onChange:(value:PortfolioFaqHeaderDesignSelectable)=>void;showGrid:boolean;setShowGrid:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const theme=useThumbnailTheme('faq');
 const selected=PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS.find(option=>option.value===value)??PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return <div className="flex flex-col gap-8" aria-label={t('Choose a header')}>{PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS.map(option=>{
  if(option.value==='none')return <button key={option.value} type="button" aria-pressed={value===option.value} onClick={()=>onChange(option.value)} className="flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-sm font-medium transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2" style={{borderColor:value===option.value?'var(--pf-palette-principal,#f97316)':'color-mix(in srgb,currentColor 18%,transparent)'}}>{t(option.label)}</button>;
  const skeleton=<FaqHeaderDesignWireframe design={option.value}/>;
  return <DesignCatalogueCard key={option.value} label={t(option.label)} selected={value===option.value} previewBackground={theme.background} onSelect={()=>onChange(option.value)} onCustomize={()=>{if(value!==option.value)onChange(option.value);setShowGrid(false);}}><span className="relative block aspect-[3/1] w-full" style={{backgroundColor:theme.background}}>{previewSource?<PortfolioDesignLivePreview src={withDesignPreview(previewSource.portfolioPath,{section:'faqHeader',design:option.value})+'&previewRevision=faq-header-compact-v3'} settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={skeleton} animateSkeleton={false} backgroundColor={theme.background}/>:skeleton}</span></DesignCatalogueCard>;
 })}</div>;
}



type FaqPatch = (patch: Partial<PortfolioFaqSectionSettings>) => void;

const FAQ_LAYOUT_INPUT_CLASS =
  'w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]';

function FaqLayoutPills({
  label,
  options,
  value,
  onChange,
  columns: columnsProp,
}: {
  label: string;
  options: {
    value: string;
    label: string;
    swatch?: string;
    fontPx?: number;
    fontWeight?: number;
    /** Tiny mini-schema drawn before the label (corner radius, stroke weight, shadow…). */
    preview?: ReactNode;
  }[];
  value: string;
  onChange: (value: string) => void;
  /** Swatch grids with longer names pass 3 so labels never truncate. */
  columns?: number;
}) {
  const t = useT();
  // One row up to 5 steps (e.g. the 5-step weight scale) — a 4+1 wrap would break the axis.
  const columns = columnsProp ?? Math.min(options.length, 5);
  if (options.some((option) => option.swatch) && options.every((option) => option.swatch || option.value === 'auto' || option.value === 'none')) {
    return (
      <ColorSwatchRow
        label={label}
        options={options.map((option) => ({
          value: option.value,
          label: option.label,
          color: option.swatch ?? 'transparent',
          auto: !option.swatch,
        }))}
        value={value}
        onChange={onChange}
      />
    );
  }
  return (
    <div>
      <span className="pf-stack-block-label">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-2 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t(option.label)}
              onClick={() => onChange(option.value)}
              className={`flex items-center justify-center gap-2 rounded-lg py-1.5 font-semibold leading-none transition ${
                columns > 4 ? 'px-1' : 'px-2.5'
              } ${option.fontPx ? 'py-2' : 'text-xs'} ${
                active ? 'pf-choice pf-choice--active' : 'pf-choice'
              }`}
              style={{
                fontSize: option.fontPx ? `${option.fontPx}px` : undefined,
                fontWeight: option.fontWeight,
              }}
            >
              {option.swatch ? (
                <span
                  aria-hidden
                  // Light outline on the dark active pill, or a dark palette color would vanish.
                  className={`h-3 w-3 shrink-0 rounded-full border ${active ? 'border-white/50' : 'border-black/10'}`}
                  style={{ backgroundColor: option.swatch }}
                />
              ) : null}
              {option.preview}
              {t(option.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* GENERAL tab → Frame — one opt-in outer frame for whichever design is    */
/* active (the designs draw no stage of their own). portfolio-faq-frame.   */
/* ---------------------------------------------------------------------- */

const FAQ_FRAME_BORDER_WIDTH_LABELS: Record<PortfolioFaqFrameBorderWidth, string> = {
  none: 'None',
  hairline: '1px',
  thin: '2px',
  bold: '4px',
};
const FAQ_FRAME_BORDER_COLOR_LABELS: Record<PortfolioFaqFrameBorderColor, string> = {
  bordure: 'Border',
  texteFort: 'Text',
  texteMuted: 'Muted',
  principal: 'Principal',
  secondaire: 'Secondary',
};
const FAQ_FRAME_FILL_LABELS: Record<PortfolioFaqFrameFill, string> = {
  none: 'None',
  fond: 'Background',
  neutre: 'Neutral',
  texteFort: 'Text',
  principal: 'Principal',
  secondaire: 'Secondary',
};
const FAQ_FRAME_RADIUS_LABELS: Record<PortfolioFaqFrameRadius, string> = { none: 'None', sm: 'S', md: 'M', lg: 'L', xl: 'XL' };
const FAQ_FRAME_PADDING_LABELS: Record<PortfolioFaqFramePadding, string> = { sm: 'S', md: 'M', lg: 'L', xl: 'XL' };
const FAQ_FRAME_SHADOW_LABELS: Record<PortfolioFaqFrameShadow, string> = { none: 'None', soft: 'Soft', deep: 'Deep' };
/** Panel-scale stand-ins for the real shadows (a 12px chip can't carry a 40px blur). */
const FAQ_FRAME_SHADOW_PREVIEW: Record<PortfolioFaqFrameShadow, string> = {
  none: '0 0 0 1px rgba(0, 0, 0, 0.12)',
  soft: '0 1px 3px rgba(0, 0, 0, 0.35)',
  deep: '0 3px 6px rgba(0, 0, 0, 0.55)',
};

/* ---------------------------------------------------------------------- */
/* GENERAL tab → Text colors — one palette token for the questions and one */
/* for the answers, read by all 9 designs (faqTextColorVars + globals.css). */
/* ---------------------------------------------------------------------- */

/** Same short names as the Frame's color pills, so one panel speaks one vocabulary. */
const FAQ_FONT_WEIGHT_LABELS: Record<PortfolioFaqFontWeight, string> = {
  auto: 'Auto',
  light: 'Light',
  regular: 'Regular',
  medium: 'Medium',
  semibold: 'Semibold',
  bold: 'Bold',
};

const FAQ_GAP_LABELS: Record<PortfolioFaqGap, string> = {
  tight: 'Tight',
  normal: 'Normal',
  airy: 'Airy',
  wide: 'Wide',
};

const FAQ_TEXT_COLOR_LABELS: Record<PortfolioFaqTextColorToken, string> = {
  auto: 'Auto',
  texteFort: 'Text',
  secondaire: 'Secondary',
  texteFaint: 'Faint',
  // Legacy choices: no longer offered, kept so the type stays total.
  texteMuted: 'Muted',
  principal: 'Principal',
};

/**
 * Font-weight picker in the manner of a video editor's style panel: four tiles, each a live "Aa" drawn at its
 * own weight with the name beneath, so the choice is made by eye. Choosing the active tile again returns to Auto
 * (the design's own weight); the current state is always written on the right of the label.
 */
function FaqWeightTiles({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioFaqFontWeight;
  onChange: (value: PortfolioFaqFontWeight) => void;
}) {
  const t = useT();
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="pf-stack-block-label">{label}</span>
        <span className="text-xs font-semibold text-[color:var(--pf-palette-texte-muted)]">{t(FAQ_FONT_WEIGHT_LABELS[value])}</span>
      </div>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-4 gap-1.5">
        {FAQ_FONT_WEIGHT_CHOICES.map((weight) => {
          const active = value === weight;
          return (
            <button
              key={weight}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t(FAQ_FONT_WEIGHT_LABELS[weight])}
              onClick={() => onChange(active ? 'auto' : weight)}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2.5 transition ${
                active ? 'pf-choice pf-choice--active' : 'pf-choice'
              }`}
            >
              <span aria-hidden className="text-[1.35rem] leading-none" style={{ fontWeight: FAQ_FONT_WEIGHT_NUMBER[weight] }}>
                Aa
              </span>
              <span className="text-[0.66rem] font-medium leading-none opacity-70">{t(FAQ_FONT_WEIGHT_LABELS[weight])}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const FAQ_MARKER_CHOICES = ['dot', 'dash', 'number', 'none'] as const;
const FAQ_MARKER_LABELS: Record<PortfolioFaqMarker, string> = {
  auto: 'Auto',
  dot: 'Dot',
  dash: 'Dash',
  number: 'Number',
  none: 'None',
};

/** List-marker picker: four tiles drawn with the real marker (a dot, a short dash, "01", nothing); the active tile
 *  chosen again returns to Auto, i.e. whatever each design draws by default. */
function FaqMarkerTiles({ value, onChange }: { value: PortfolioFaqMarker; onChange: (value: PortfolioFaqMarker) => void }) {
  const t = useT();
  const glyph = (kind: (typeof FAQ_MARKER_CHOICES)[number]) =>
    kind === 'dot' ? (
      <span aria-hidden className="block h-2 w-2 rounded-full bg-current" />
    ) : kind === 'dash' ? (
      <span aria-hidden className="block h-[2px] w-4 rounded-full bg-current" />
    ) : kind === 'number' ? (
      <span aria-hidden className="font-mono text-[0.8rem] leading-none tabular-nums">01</span>
    ) : (
      <span aria-hidden className="block text-[0.9rem] leading-none opacity-60">–</span>
    );
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="pf-stack-block-label">{t('List marker')}</span>
        <span className="text-xs font-semibold text-[color:var(--pf-palette-texte-muted)]">{t(FAQ_MARKER_LABELS[value])}</span>
      </div>
      <div role="radiogroup" aria-label={t('List marker')} className="mt-2 grid grid-cols-4 gap-1.5">
        {FAQ_MARKER_CHOICES.map((kind) => {
          const active = value === kind;
          return (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t(FAQ_MARKER_LABELS[kind])}
              onClick={() => onChange(active ? 'auto' : kind)}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg px-1 py-2.5 transition ${
                active ? 'pf-choice pf-choice--active' : 'pf-choice'
              }`}
            >
              <span className="flex h-4 items-center justify-center">{glyph(kind)}</span>
              <span className="text-[0.66rem] font-medium leading-none opacity-70">{t(FAQ_MARKER_LABELS[kind])}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Title position: where the header sits relative to the questions, for every header design and every FAQ design.
 * Three tiles drawn as the layout itself (title block + list). The native placement of the current design is the
 * highlighted one until the creator picks; side positions stack on top on tablet and phone.
 */
function FaqHeaderPositionTiles({ faq, onChange }: { faq: PortfolioFaqSectionSettings; onChange: FaqPatch }) {
  const t = useT();
  const effective = resolveFaqHeaderPosition(faq.headerPosition, faq.design);
  const choices: { value: 'left' | 'top'; label: string }[] = [
    { value: 'left', label: 'Left' },
    { value: 'top', label: 'Top' },
  ];
  const diagram = (position: 'left' | 'top') => {
    const title = <span className="block h-[5px] w-[14px] rounded-[2px] bg-current" />;
    const lines = (
      <span className="flex flex-col gap-[3px]">
        <span className="block h-[3px] w-[22px] rounded-[2px] bg-current opacity-50" />
        <span className="block h-[3px] w-[22px] rounded-[2px] bg-current opacity-50" />
        <span className="block h-[3px] w-[22px] rounded-[2px] bg-current opacity-50" />
      </span>
    );
    return position === 'top' ? (
      <span aria-hidden className="flex flex-col items-start gap-[5px]">{title}{lines}</span>
    ) : (
      <span aria-hidden className="flex items-start gap-[6px]">{title}{lines}</span>
    );
  };
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="pf-stack-block-label">{t('Title position')}</span>
        <span className="text-xs font-semibold text-[color:var(--pf-palette-texte-muted)]">
          {faq.headerPosition === 'auto' || !faq.headerPosition ? `${t('Auto')} · ${t(effective === 'top' ? 'Top' : 'Left')}` : t(effective === 'top' ? 'Top' : 'Left')}
        </span>
      </div>
      <div role="radiogroup" aria-label={t('Title position')} className="mt-2 grid grid-cols-2 gap-1.5">
        {choices.map((choice) => {
          const active = effective === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t(choice.label)}
              onClick={() => onChange({ headerPosition: choice.value as PortfolioFaqHeaderPosition })}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg px-1 py-3 transition ${
                active ? 'pf-choice pf-choice--active' : 'pf-choice'
              }`}
            >
              <span className="flex h-8 items-center justify-center">{diagram(choice.value)}</span>
              <span className="text-[0.66rem] font-medium leading-none opacity-70">{t(choice.label)}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[0.72rem] leading-snug text-[color:var(--pf-palette-texte-muted)]">
        {t('Beside the questions on desktop; on tablet and phone the title always sits on top.')}
      </p>
    </div>
  );
}

function FaqTextColorsGroup({
  faq,
  onChange,
  palette,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: FaqPatch;
  palette: Record<HeroPaletteTokenId, string>;
}) {
  const t = useT();
  const options = FAQ_TEXT_COLOR_TOKENS.map((token) => ({
    value: token,
    label: FAQ_TEXT_COLOR_LABELS[token],
    // "Auto" has no swatch of its own: it is whatever the active design already draws.
    swatch: token === 'auto' ? undefined : resolveHeroPaletteColor(palette, token as HeroPaletteTokenId),
  }));
  return (
    <div className="space-y-5 pt-4">
      <ColorSwatchRow
        label={t('Question color')}
        value={faq.questionColorToken ?? 'auto'}
        onChange={(value) => onChange({ questionColorToken: value as PortfolioFaqTextColorToken })}
        options={options.map((option) => ({
          value: option.value,
          label: option.label,
          color: option.swatch ?? 'transparent',
          auto: !option.swatch,
        }))}
      />
      {(faq.questionColorToken ?? 'auto') !== 'auto' ? (
        <FaqPercentSlider
          label={t('Question color opacity')}
          value={faq.questionColorOpacity ?? 100}
          onChange={(questionColorOpacity) => onChange({ questionColorOpacity })}
        />
      ) : null}
      <ColorSwatchRow
        label={t('Answer color')}
        value={faq.answerColorToken ?? 'auto'}
        onChange={(value) => onChange({ answerColorToken: value as PortfolioFaqTextColorToken })}
        options={options.map((option) => ({
          value: option.value,
          label: option.label,
          color: option.swatch ?? 'transparent',
          auto: !option.swatch,
        }))}
      />
      {(faq.answerColorToken ?? 'auto') !== 'auto' ? (
        <FaqPercentSlider
          label={t('Answer color opacity')}
          value={faq.answerColorOpacity ?? 100}
          onChange={(answerColorOpacity) => onChange({ answerColorOpacity })}
        />
      ) : null}
      <FaqWeightTiles
        label={t('Question weight')}
        value={faq.questionFontWeight ?? 'auto'}
        onChange={(questionFontWeight) => onChange({ questionFontWeight })}
      />
      <FaqWeightTiles
        label={t('Answer weight')}
        value={faq.answerFontWeight ?? 'auto'}
        onChange={(answerFontWeight) => onChange({ answerFontWeight })}
      />
      <FaqLayoutPills
        label={t('Vertical gap')}
        value={faq.verticalGap ?? 'normal'}
        onChange={(value) => onChange({ verticalGap: value as PortfolioFaqGap })}
        options={FAQ_GAPS.map((gap) => ({
          value: gap,
          label: FAQ_GAP_LABELS[gap],
          // Two mini cards with the real proportion of space between them.
          preview: (
            <span aria-hidden className="flex flex-col items-stretch" style={{ gap: Math.max(1, Math.round(FAQ_GAP_FACTOR[gap] * 3)) }}>
              <span className="block h-[5px] w-5 rounded-[2px] bg-current opacity-80" />
              <span className="block h-[5px] w-5 rounded-[2px] bg-current opacity-80" />
            </span>
          ),
        }))}
      />
      <FaqMarkerTiles value={faq.questionMarker ?? 'auto'} onChange={(questionMarker) => onChange({ questionMarker })} />
    </div>
  );
}

function FaqFrameGroup({
  faq,
  onChange,
  palette,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: FaqPatch;
  palette: Record<HeroPaletteTokenId, string>;
}) {
  const t = useT();
  const frame = faq.designFrame ?? DEFAULT_FAQ_FRAME;
  const set = (patch: Partial<PortfolioFaqFrameSettings>) => onChange({ designFrame: { ...frame, ...patch } });
  const swatch = (token: HeroPaletteTokenId) => resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-5 pt-4">
      <FaqToggleRow label={t('Frame')} checked={frame.enabled} onChange={(enabled) => set({ enabled })} />
      {frame.enabled ? (
        <>
          <FaqLayoutPills
            label={t('Border')}
            value={frame.borderWidth}
            onChange={(value) => set({ borderWidth: value as PortfolioFaqFrameBorderWidth })}
            options={FAQ_FRAME_BORDER_WIDTHS.map((width) => ({
              value: width,
              label: FAQ_FRAME_BORDER_WIDTH_LABELS[width],
              // Stroke weight drawn at its real thickness — the scale reads at a glance.
              preview:
                width === 'none' ? undefined : (
                  <span aria-hidden className="block w-3.5 shrink-0 rounded-full bg-current" style={{ height: FAQ_FRAME_BORDER_PX[width] }} />
                ),
            }))}
          />
          {frame.borderWidth !== 'none' ? (
            <>
              <FaqLayoutPills
                label={t('Border color')}
                columns={3}
                value={frame.borderColor}
                onChange={(value) => set({ borderColor: value as PortfolioFaqFrameBorderColor })}
                options={FAQ_FRAME_BORDER_COLORS.map((token) => ({
                  value: token,
                  label: FAQ_FRAME_BORDER_COLOR_LABELS[token],
                  swatch: swatch(token),
                }))}
              />
              <FaqPercentSlider label={t('Border opacity')} value={frame.borderOpacity} onChange={(borderOpacity) => set({ borderOpacity })} />
            </>
          ) : null}
          <FaqLayoutPills
            label={t('Fill')}
            columns={3}
            value={frame.fill}
            onChange={(value) => {
              const fill = value as PortfolioFaqFrameFill;
              // A new fill starts at a readable opacity (text/accent colors low, surfaces solid).
              set({ fill, fillOpacity: fill === 'none' ? frame.fillOpacity : FAQ_FRAME_FILL_DEFAULT_OPACITY[fill] });
            }}
            options={FAQ_FRAME_FILLS.map((token) => ({
              value: token,
              label: FAQ_FRAME_FILL_LABELS[token],
              swatch: token === 'none' ? undefined : swatch(token),
            }))}
          />
          {frame.fill !== 'none' ? (
            <FaqPercentSlider label={t('Fill opacity')} value={frame.fillOpacity} onChange={(fillOpacity) => set({ fillOpacity })} />
          ) : null}
          <FaqLayoutPills
            label={t('Corners')}
            value={frame.radius}
            onChange={(value) => set({ radius: value as PortfolioFaqFrameRadius })}
            options={FAQ_FRAME_RADII.map((radius) => ({
              value: radius,
              label: FAQ_FRAME_RADIUS_LABELS[radius],
              // One corner of the frame, at a proportional radius.
              preview: (
                <span
                  aria-hidden
                  className="block h-3 w-3 shrink-0 border-l-[1.5px] border-t-[1.5px] border-current"
                  style={{ borderTopLeftRadius: Math.min(12, Math.round(FAQ_FRAME_RADIUS_PX[radius] / 3)) }}
                />
              ),
            }))}
          />
          <FaqLayoutPills
            label={t('Padding')}
            value={frame.padding}
            onChange={(value) => set({ padding: value as PortfolioFaqFramePadding })}
            options={FAQ_FRAME_PADDINGS.map((padding) => ({ value: padding, label: FAQ_FRAME_PADDING_LABELS[padding] }))}
          />
          <FaqLayoutPills
            label={t('Shadow')}
            value={frame.shadow}
            onChange={(value) => set({ shadow: value as PortfolioFaqFrameShadow })}
            options={FAQ_FRAME_SHADOWS.map((shadow) => ({
              value: shadow,
              label: FAQ_FRAME_SHADOW_LABELS[shadow],
              preview: (
                <span
                  aria-hidden
                  className="block h-3 w-3 shrink-0 rounded-[3px] bg-transparent"
                  style={{ boxShadow: FAQ_FRAME_SHADOW_PREVIEW[shadow] }}
                />
              ),
            }))}
          />
          <FaqToggleRow
            label={t('Glass blur')}
            info="Blurs the section background behind the frame. Visible over an image or gradient Background."
            checked={frame.blur}
            onChange={(blur) => set({ blur })}
          />
        </>
      ) : null}
    </div>
  );
}

/** Ordered scales (weight, size, spacing: four steps or more) read as a stepped bar; short
 *  choices (alignment, left / center) stay as pills. */
function FaqStepOrPills({
  label,
  options,
  value,
  onChange,
  forcePills = false,
}: {
  label: string;
  options: { value: string; label: string; fontWeight?: number }[];
  value: string;
  onChange: (value: string) => void;
  /** Keeps the button group even for a long scale (spacing below the header). */
  forcePills?: boolean;
}) {
  const t = useT();
  if (forcePills || options.length < 4) return <FaqLayoutPills label={label} options={options} value={value} onChange={onChange} />;
  const current = options.find((option) => option.value === value) ?? options[0]!;
  return (
    <HeaderSteppedSlider
      label={label}
      steps={options.map((option) => ({ value: option.value, tick: t(option.label) }))}
      value={current.value}
      currentName={t(current.label)}
      onChange={onChange}
      stepStyle={(step) => ({ fontWeight: options.find((option) => option.value === step.value)?.fontWeight })}
    />
  );
}

function FaqHeaderLayoutControl({
  faq,
  design,
  spec,
  onChange,
}: {
  faq: PortfolioFaqSectionSettings;
  design: PortfolioFaqHeaderDesignSelectable;
  spec: FaqHeaderLayoutElementSpec;
  onChange: FaqPatch;
}) {
  const t = useT();
  const setOverride = (patch: { visible?: boolean; text?: string; choice?: string }) =>
    onChange(patchFaqHeaderLayoutElement(faq, design, spec.key, patch));

  switch (spec.kind) {
    case 'toggle':
      return (
        <FaqToggleRow
          label={t(spec.label)}
          checked={resolveFaqHeaderLayoutVisible(faq, design, spec.key)}
          onChange={(visible) => setOverride({ visible })}
        />
      );
    case 'option':
      return (
        <FaqStepOrPills
          label={t(spec.label)}
          options={spec.options}
          value={resolveFaqHeaderLayoutOption(faq, design, spec.key)}
          onChange={(choice) => setOverride({ choice })}
        />
      );
    case 'fieldOption':
      return (
        <FaqStepOrPills
          label={t(spec.label)}
          options={spec.options}
          value={String(faq[spec.field] ?? spec.options[0].value)}
          onChange={(value) => onChange({ [spec.field]: value } as Partial<PortfolioFaqSectionSettings>)}
          forcePills={spec.field === 'headerMarginBottom'}
        />
      );
    case 'text': {
      const hideable = spec.hideable !== false;
      const visible = resolveFaqHeaderLayoutVisible(faq, design, spec.key);
      return (
        <div className="space-y-2">
          {hideable ? (
            <FaqToggleRow label={t(spec.label)} checked={visible} onChange={(next) => setOverride({ visible: next })} />
          ) : (
            <p className="text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(spec.label)}</p>
          )}
          {visible ? (
            <input
              type="text"
              value={faqHeaderLayoutOverride(faq, design, spec.key)?.text ?? ''}
              placeholder={spec.placeholder || spec.defaultText}
              aria-label={t(spec.label)}
              onChange={(event) => setOverride({ text: event.target.value })}
              className={FAQ_LAYOUT_INPUT_CLASS}
            />
          ) : null}
        </div>
      );
    }
  }
}

const FAQ_HEADER_LAYOUT_GROUP_ORDER: FaqHeaderLayoutGroup[] = ['this', 'all'];

/** FAQ stores the editorial title's size / weight under the older shared `headerTitleSize` /
 *  `headerTitleWeight` keys; everything else uses the shared `headerEditorial*` keys. */
const FAQ_EDITORIAL_KEY_MAP: Record<string, string> = {
  headerEditorialTitleSize: 'headerTitleSize',
  headerEditorialTitleWeight: 'headerTitleWeight',
};

const FAQ_HEADER_COPY: HeaderCopy = {
  editorial: { label: msg('FAQ'), title: msg('Frequently asked questions'), subtitle: msg('Everything you need to know before getting in touch.') },
  index: { rule: 'Index', title: '', subtitle: '', count: '' },
  marquee: ['FAQ', 'Optional', 'Optional', 'Optional'],
  accent: { badge: '', lead: '' },
  serif: { label: 'FAQ', title: '', subtitle: '' },
  billboard: { word: 'FAQ', title: '', count: '' },
  masthead: ['', '', ''],
  split: { title: '', label: 'FAQ' },
};

const FAQ_HEADER_COLOR_OPTIONS = [
  { value: 'principal' as const, label: msg('Principal') },
  { value: 'secondaire' as const, label: msg('Secondary') },
  { value: 'texteFort' as const, label: msg('Strong text') },
];

function FaqEditorialHeaderFields({ faq, onChange }: { faq: PortfolioFaqSectionSettings; onChange: FaqPatch }) {
  const view = new Proxy(faq as object, {
    get: (target, prop) =>
      typeof prop === 'string' ? (target as Record<string, unknown>)[FAQ_EDITORIAL_KEY_MAP[prop] ?? prop] : undefined,
  });
  return (
    <HeaderDesignFields
      settings={view}
      onPatch={(patch: HeaderPatch) => {
        const mapped: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(patch)) mapped[FAQ_EDITORIAL_KEY_MAP[key] ?? key] = value;
        onChange(mapped as Partial<PortfolioFaqSectionSettings>);
      }}
      copy={FAQ_HEADER_COPY}
      colorOptions={FAQ_HEADER_COLOR_OPTIONS}
      resolveColor={faqHeaderPaletteTokenColor}
      accentAlignmentOptions={[{ value: 'left' as const, label: msg('Left') }]}
      billboardStyleOptions={[{ value: 'outline' as const, label: msg('Outline') }]}
    />
  );
}

const FAQ_HEADER_INK_LABELS: Record<PortfolioFaqHeaderInk, string> = {
  auto: 'Auto',
  principal: 'Principal',
  secondaire: 'Secondary',
  texteFort: 'Strong text',
};
const FAQ_HEADER_SUBTITLE_SIZE_LABELS: Record<PortfolioFaqHeaderSubtitleSize, string> = {
  auto: 'Auto',
  sm: 'S',
  md: 'M',
  lg: 'L',
  xl: 'XL',
};

/**
 * Text settings of the Signal, Query and Dialogue headers, organised as a title block and a subtitle block:
 * wording, colour (palette swatches), size and weight in the same order as the other sections' header tab.
 * Everything defaults to Auto, the header's own look.
 */
function FaqHeaderTextSettings({ faq, onChange }: { faq: PortfolioFaqSectionSettings; onChange: FaqPatch }) {
  const t = useT();
  const inkOptions = FAQ_HEADER_INKS.map((ink) => ({
    value: ink,
    label: FAQ_HEADER_INK_LABELS[ink],
    color: ink === 'auto' ? 'transparent' : faqHeaderPaletteTokenColor(ink),
    auto: ink === 'auto',
  }));
  const hasTitle = resolveFaqHeaderLayoutVisible(faq, faq.headerDesign as PortfolioFaqHeaderDesignSelectable, 'title');
  const hasSubtitle = resolveFaqHeaderLayoutVisible(faq, faq.headerDesign as PortfolioFaqHeaderDesignSelectable, 'subtitle');
  return (
    <div className="space-y-6">
      {hasTitle ? (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t('Title')}</p>
          <input
            type="text"
            value={faq.headerTextTitle ?? ''}
            placeholder={faq.title || t('Frequently asked questions')}
            aria-label={t('Title text')}
            maxLength={160}
            onChange={(event) => onChange({ headerTextTitle: event.target.value })}
            className={FAQ_LAYOUT_INPUT_CLASS}
          />
          <ColorSwatchRow
            label={t('Title color')}
            options={inkOptions}
            value={faq.headerTitleInk ?? 'auto'}
            onChange={(value) => onChange({ headerTitleInk: value as PortfolioFaqHeaderInk })}
          />
          <FaqLayoutPills
            label={t('Title size')}
            options={[
              { value: 'sm', label: 'S', fontPx: 12 },
              { value: 'md', label: 'M', fontPx: 15 },
              { value: 'lg', label: 'L', fontPx: 18 },
              { value: 'xl', label: 'XL', fontPx: 22 },
            ]}
            value={faq.headerTitleSize ?? 'md'}
            onChange={(value) => onChange({ headerTitleSize: value as PortfolioFaqSectionSettings['headerTitleSize'] })}
          />
          <FaqWeightTiles
            label={t('Title weight')}
            value={faq.headerTitleFontWeight ?? 'auto'}
            onChange={(headerTitleFontWeight) => onChange({ headerTitleFontWeight })}
          />
        </div>
      ) : null}
      {hasSubtitle ? (
        <div className={`space-y-4 ${hasTitle ? 'border-t border-[color:var(--pf-palette-bordure)] pt-6' : ''}`}>
          <p className="text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t('Subtitle')}</p>
          <textarea
            rows={3}
            value={faq.headerTextSubtitle ?? ''}
            placeholder={faq.subtitle || t('Quick answers to common questions before we start working together.')}
            aria-label={t('Subtitle text')}
            maxLength={400}
            onChange={(event) => onChange({ headerTextSubtitle: event.target.value })}
            className={`${FAQ_LAYOUT_INPUT_CLASS} resize-none`}
          />
          <ColorSwatchRow
            label={t('Subtitle color')}
            options={inkOptions}
            value={faq.headerSubtitleInk ?? 'auto'}
            onChange={(value) => onChange({ headerSubtitleInk: value as PortfolioFaqHeaderInk })}
          />
          <FaqLayoutPills
            label={t('Subtitle size')}
            value={faq.headerSubtitleSizeStep ?? 'auto'}
            onChange={(value) => onChange({ headerSubtitleSizeStep: value as PortfolioFaqHeaderSubtitleSize })}
            options={FAQ_HEADER_SUBTITLE_SIZES.map((size) => ({ value: size, label: FAQ_HEADER_SUBTITLE_SIZE_LABELS[size] }))}
          />
          <FaqWeightTiles
            label={t('Subtitle weight')}
            value={faq.headerSubtitleFontWeight ?? 'auto'}
            onChange={(headerSubtitleFontWeight) => onChange({ headerSubtitleFontWeight })}
          />
        </div>
      ) : null}
    </div>
  );
}

function FaqHeaderLayoutSettingsBand({ faq, onChange }: { faq: PortfolioFaqSectionSettings; onChange: FaqPatch }) {
  const t = useT();
  // A saved legacy (frozen) header has no Layout settings of its own — nothing to show.
  if (!(FAQ_HEADER_DESIGNS_SELECTABLE as string[]).includes(faq.headerDesign)) return null;
  const design = faq.headerDesign as PortfolioFaqHeaderDesignSelectable;
  // Editorial is the shared header: same fields as every other section's Header tab.
  if (design === 'editorial') return <FaqEditorialHeaderFields faq={faq} onChange={onChange} />;
  const specs = FAQ_HEADER_LAYOUT_SPECS[design].filter(
    (spec) => (!spec.showWhen || spec.showWhen(faq)) && spec.key !== 'titleSize'
  );

  return (
    <FaqLayoutSettingsBand motionKey={design} title={t('Layout settings')}>
      <div className="space-y-6 border-b border-[color:var(--pf-palette-bordure)] pb-6">
        <FaqHeaderTextSettings faq={faq} onChange={onChange} />
      </div>
      {FAQ_HEADER_LAYOUT_GROUP_ORDER.map((group, groupIndex) => {
        const groupSpecs = specs.filter((spec) => spec.group === group);
        if (groupSpecs.length === 0) return null;
        return (
          <div
            key={group}
            className={`space-y-4 ${groupIndex > 0 ? 'border-t border-[color:var(--pf-palette-bordure)] pt-6' : ''}`}
          >
            {groupSpecs.map((spec) => (
              <FaqHeaderLayoutControl key={spec.key} faq={faq} design={design} spec={spec} onChange={onChange} />
            ))}
          </div>
        );
      })}
    </FaqLayoutSettingsBand>
  );
}

/** Section-background color fields, bound to FAQ's own hero-shaped palette
 *  (faqPalette / faqColorBindings) — "Fond", "Neutre", "Principal", "Texte
 *  muted" swatches, no free-form hex, same as every other section's
 *  Background tab. */
const FAQ_BACKGROUND_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: msg('Background') },
  { value: 'neutre', label: msg('Neutral') },
  { value: 'principal', label: msg('Primary') },
  { value: 'secondaire', label: msg('Secondary') },
  { value: 'texteFort', label: msg('Strong text') },
];

const FAQ_BACKGROUND_LABEL_SLOTS: Record<string, { slot: FaqColorSlot; field: keyof PortfolioFaqSectionSettings }> = {
  Color: { slot: 'sectionBackground', field: 'sectionBackgroundColor' },
  'Gradient start': { slot: 'sectionGradientFrom', field: 'sectionBackgroundGradientFrom' },
  'Gradient end': { slot: 'sectionGradientTo', field: 'sectionBackgroundGradientTo' },
  'Color A': { slot: 'sectionSplitA', field: 'sectionBackgroundColorA' },
  'Color B': { slot: 'sectionSplitB', field: 'sectionBackgroundColorB' },
};

function FaqBackgroundColorField({
  faq,
  onChange,
  palette,
  bindings,
  label,
  value,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: (patch: Partial<PortfolioFaqSectionSettings>) => void;
  palette: Record<HeroPaletteTokenId, string>;
  bindings: Record<FaqColorSlot, HeroPaletteTokenId>;
  label: string;
  value: string;
}) {
    const mapping = FAQ_BACKGROUND_LABEL_SLOTS[label] ?? FAQ_BACKGROUND_LABEL_SLOTS.Color;
  const usingPalette = faq.useHeroPalette !== false;
  const activeHex = value.trim().toLowerCase();
  const options = FAQ_BACKGROUND_PALETTE_TOKENS.map((token) => ({
    value: token.value as string,
    label: token.label,
    color: resolveHeroPaletteColor(palette, token.value),
  }));
  const current = usingPalette
    ? (bindings[mapping.slot] as string)
    : (options.find((option) => option.color.toLowerCase() === activeHex)?.value ?? '');
  return (
    <ColorSwatchRow
      label={label}
      options={options}
      value={current}
      onChange={(next) => {
        const token = next as HeroPaletteTokenId;
        onChange(
          usingPalette
            ? (patchFaqColorBinding(faq, mapping.slot, token) as Partial<PortfolioFaqSectionSettings>)
            : { [mapping.field]: resolveHeroPaletteColor(palette, token) }
        );
      }}
    />
  );
}

export function FaqSettingsPanel({
  faq,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  chrome,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: (patch: Partial<PortfolioFaqSectionSettings>) => void;
  subSection?: FaqSubSection;
  onSubSectionChange?: (value: FaqSubSection) => void;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const backgroundTheme = useThumbnailTheme('faq');
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(true);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<FaqSubSection>('general');
  const subSection = normalizeFaqSubSection(controlledSubSection ?? uncontrolledSubSection);
  const [previousSubSection, setPreviousSubSection] = useState(subSection);
  if(previousSubSection !== subSection){
    setPreviousSubSection(subSection);
    if(subSection === 'design')setDesignCatalogOpen(true);
    if(subSection === 'header')setHeaderCatalogOpen(true);
  }
  const setSubSection = (value: FaqSubSection) => {
    const next = normalizeFaqSubSection(value);
    if(next === 'design')setDesignCatalogOpen(true);
    if(next === 'header')setHeaderCatalogOpen(true);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };

  const faqPalette = mergeFaqPalette(DEFAULT_FAQ_PALETTE, faq.faqPalette);
  const faqBindings = mergeFaqColorBindings(DEFAULT_FAQ_COLOR_BINDINGS, faq.faqColorBindings);
  const defaults: PortfolioFaqSectionSettings = { enabled: true, title: 'FAQ', subtitle: 'Quick answers to common questions before we start working together.', ...DEFAULT_FAQ_PRESENTATION };

  return (
    <NpPanelShell title={t('FAQ')} modified={JSON.stringify(faq) !== JSON.stringify(defaults)} tabs={FAQ_SUB_SECTIONS.map((item) => ({ id: item.id, label: t(item.label) }))} activeTab={subSection} onTabChange={setSubSection} onReset={() => onChange(defaults)} chrome={chrome}>

      {subSection === 'general' ? (
        <div className="np-stack">
          <NpToggleRow card
            title={t('Show FAQ section')}
            description={faq.enabled ? undefined : t('Visitors go straight to the next section.')}
            checked={faq.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <div className="pb-6"><SectionColorModeControl hideLabel label={t('Color mode')} value={faq.colorModeOverride} onChange={(colorModeOverride) => onChange({ colorModeOverride })} /></div>
          {faq.enabled ? (
            <NpCollapsibleSection title={t('Style')}>
              <TextSizeSlider label={t('Text size')} options={PORTFOLIO_FAQ_PREMIUM_FONT_SIZE_OPTIONS} value={faq.premiumFontSize ?? 'medium'} onChange={(premiumFontSize) => onChange({ premiumFontSize })} />
            </NpCollapsibleSection>
          ) : null}
          {/* Shared by every design: colour, weight and the vertical gap between questions. */}
          {faq.enabled ? (
            <NpCollapsibleSection title={t('Questions & answers')}>
              <FaqTextColorsGroup faq={faq} onChange={onChange} palette={faqPalette} />
            </NpCollapsibleSection>
          ) : null}
          {faq.enabled && faqDesignAllowsFrame(faq.design) ? (
            <NpCollapsibleSection title={t('Frame')}>
              <FaqFrameGroup faq={faq} onChange={onChange} palette={faqPalette} />
            </NpCollapsibleSection>
          ) : null}
        </div>
      ) : null}

      {subSection === 'design' && faq.enabled ? (
        <div className="np-stack">
          <FaqDesignChoiceGrid value={faq.design} onChange={(design) => onChange(defaultsForFaqDesign(design))} open={designCatalogOpen} onOpenChange={setDesignCatalogOpen} />

          {designCatalogOpen ? null : <>
          </>}
        </div>
      ) : null}

      {subSection !== 'general' && !faq.enabled ? <div className="np-stack"><NpToggleRow card title={t('This section is hidden')} description={t('Enable it to edit its settings and make it visible on the portfolio.')} checked={false} onChange={() => onChange({ enabled: true })} /></div> : null}

      {subSection === 'header' && faq.enabled ? (
        <div className="np-stack">
            <FaqHeaderChoiceGrid
              value={faq.headerDesign}
              onChange={(headerDesign) => onChange({ headerDesign })}
              showGrid={headerCatalogOpen}
              setShowGrid={setHeaderCatalogOpen}
            />
          {faq.headerDesign === 'none' ? null : (
            <NpCollapsibleSection title={t('Placement')}>
              <FaqHeaderPositionTiles faq={faq} onChange={onChange} />
            </NpCollapsibleSection>
          )}
          {headerCatalogOpen || faq.headerDesign === 'none' ? null : <NpCollapsibleSection title={t('Header settings')}><FaqHeaderLayoutSettingsBand faq={faq} onChange={onChange} /></NpCollapsibleSection>}
        </div>
      ) : null}

      {subSection === 'background' && faq.enabled ? (
        <div className="np-stack"><NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl
              value={faq.paletteFamily ?? 'global'}
              onChange={(paletteFamily) => onChange({ paletteFamily })}
              mode={backgroundTheme.mode}
            />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Background')}>
          <SectionBackgroundSettingsFields
            settings={faq}
            onChange={onChange}
            renderColorField={({ label, value }) => (
              <FaqBackgroundColorField faq={{ ...faq, faqPalette: backgroundTheme.palette }} onChange={onChange} palette={backgroundTheme.palette} bindings={faqBindings} label={label} value={value} />
            )}
          />
        </NpCollapsibleSection></div>
      ) : null}
    </NpPanelShell>
  );
}
