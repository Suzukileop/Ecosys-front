'use client';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import {StackPreviewSkeleton} from './portfolio-stack-preview-skeleton';
import {StackHeaderSkeleton} from './portfolio-stack-header-skeleton';
import {useThumbnailTheme} from './portfolio-thumbnail-theme';
import {GalleryFramedThumbnail} from '@/components/portfolio/portfolio-gallery-framed-thumbnail';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { TextSizeSlider } from '@/components/portfolio/portfolio-text-size-slider';
import { ColorSwatchRow } from '@/components/portfolio/portfolio-color-swatch-row';
import { CardsStyleControls } from '@/components/portfolio/portfolio-cards-style-controls';
import { DEFAULT_CARDS_STYLE } from '@/components/portfolio/portfolio-cards-style';
import { useState, type ReactNode } from 'react';
import { PortfolioDesignLivePreview, usePortfolioDesignPreviewSource } from '@/components/portfolio/PortfolioDesignLivePreview';
import { MediaImage } from '@/components/ui/MediaImage';
import type { ProfileGalleryItem } from '@/types/profile';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  mergeGalleryColorBindings,
  patchGalleryColorBinding,
} from '@/components/portfolio/portfolio-gallery-palette-settings';
import {
  DEFAULT_GALLERY_PRESENTATION,
  galleryDesignUsesCarouselNav,
  galleryDesignUsesCaptionCardWidth,
  PORTFOLIO_GALLERY_DESIGN_OPTIONS,
  PORTFOLIO_GALLERY_FLOATING_CANVAS_BADGE_OPTIONS,
  PORTFOLIO_GALLERY_FLOATING_CANVAS_DISPERSION_OPTIONS,
  PORTFOLIO_GALLERY_FLOATING_CANVAS_LANE_OPTIONS,
  PORTFOLIO_GALLERY_FLOATING_CANVAS_PARALLAX_OPTIONS,
  PORTFOLIO_GALLERY_FRAMED_GRID_PARALLAX_OPTIONS,
  PORTFOLIO_GALLERY_FRAMED_GRID_TITLE_STYLE_OPTIONS,
  PORTFOLIO_GALLERY_PREMIUM_FONT_SIZE_OPTIONS,
  type PortfolioGalleryDesign,
  type PortfolioGallerySectionSettings,
} from '@/components/portfolio/portfolio-gallery-settings';
import {
  GALLERY_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  GALLERY_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  GALLERY_HEADER_PALETTE_TOKEN_OPTIONS,
  galleryHeaderPaletteTokenColor,
  PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS,
  type PortfolioGalleryHeaderDesign,
} from '@/components/portfolio/portfolio-gallery-header-settings';
import { PortfolioHeaderDesignOption } from '@/components/portfolio/portfolio-header-design-lock';
import { HeaderDesignFields, type HeaderCopy } from '@/components/portfolio/portfolio-header-design-fields';
import type { HeaderPatch } from '@/components/portfolio/portfolio-header-style-controls';
import { SettingRow, SettingsRowsScope, useSettingsRows } from '@/components/portfolio/portfolio-settings-rows';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { NpBackRow, NpCollapsibleSection, NpPanelShell, NpToggleRow, type NpPanelChrome } from '@/components/portfolio/portfolio-nav-panel-ui';

/* ---------------------------------------------------------------------- */
/* Sub-sections — the same four tabs, in the same order, with the same     */
/* labels as the Footer panel, which is this repo's reference              */
/* implementation of the "Settings design standard".                       */
/* ---------------------------------------------------------------------- */

export type GallerySubSection = 'general' | 'design' | 'background' | 'header';
/** Legacy alias — the settings modal still imports the panel's type under this name. */
export type GallerySettingsSubSection = GallerySubSection;

const GALLERY_SUB_SECTIONS: { id: GallerySubSection; label: string }[] = [
  { id: 'general', label: msg('General') },
  { id: 'design', label: msg('Design') },
  { id: 'header', label: msg('Header') },
  { id: 'background', label: msg('Background') },
];

/** Maps legacy subsection ids (saved UI state / search) onto the current Gallery menu. */
export function normalizeGallerySubSection(value: string | undefined): GallerySubSection {
  if (value === 'general' || value === 'design' || value === 'background' || value === 'header') {
    return value;
  }
  // "Disposition" / `layout` was the old name of what is now the Design tab.
  if (value === 'layout') return 'design';
  return 'general';
}

type GalleryPatch = (patch: Partial<PortfolioGallerySectionSettings>) => void;

/* ---------------------------------------------------------------------- */
/* Shared settings chrome — the Footer panel's controls, Gallery-scoped.   */
/* ---------------------------------------------------------------------- */

function GallerySectionLabel({ children }: { children: string }) {
  return <p className="pf-stack-block-label">{children}</p>;
}

function GalleryGroupLabel({ children }: { children: string }) {
  return <p className="text-[13px] font-medium text-[color:var(--pf-palette-texte-muted)]">{children}</p>;
}

/** Same animated switch as the Footer/Services/Contact panels — shared settings-UI chrome. */
function GallerySwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span className="np-switch" aria-checked={checked} aria-hidden data-switch-track="">
      <span className="np-switch-knob" />
    </span>
  );
}

function GalleryToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
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
        <span className="min-w-0 truncate text-sm font-medium text-[color:var(--pf-palette-texte-fort)]">{label}</span>
        <GallerySwitchTrack checked={checked} />
      </span>
    </button>
  );
}

function GalleryOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
  hideLabel = false,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4 | 5;
  /** Keeps `label` as the accessible name only — for a pill that sits right under its own heading. */
  hideLabel?: boolean;
}) {
  const t = useT();
    const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={String(options.find((option) => option.value === value)?.label ?? '')}>
    <div>
      {hideLabel ? null : (rows ? null : <GalleryGroupLabel>{label}</GalleryGroupLabel>)}
      <div
        role="radiogroup"
        aria-label={label}
        className={`${hideLabel ? '' : 'mt-2'} grid gap-1.5`}
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
              onClick={() => onChange(option.value)}
              className={`rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold transition ${
                active ? 'pf-choice pf-choice--active' : 'pf-choice'
              }`}
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

function GalleryRange({
  label,
  value,
  min,
  max,
  onChange,
  suffix = 'px',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <GalleryGroupLabel>{label}</GalleryGroupLabel>
        <span className="text-[11px] font-semibold tabular-nums text-[color:var(--pf-palette-texte-muted)]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className="np-range mt-2" style={{ ['--np-fill' as string]: `${max > min ? ((value - min) / (max - min)) * 100 : 0}%` }}
      />
    </div>
  );
}

function GalleryManualColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={typeof value === 'string' && value.startsWith('#') ? value.toUpperCase() : String(value ?? '')}>
    <div>
      {rows ? null : (<GallerySectionLabel>{label}</GallerySectionLabel>)}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent p-1"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2.5 text-sm font-mono text-[color:var(--pf-palette-texte-fort)]"
          aria-label={`${label} hex`}
        />
      </div>
    </div>
    </SettingRow>
  );
}

/** Palette-bound section-background field — a dropdown of theme tokens while the site palette
 *  drives the Gallery, a manual hex picker when it doesn't. Same mechanism as the Footer's. */
function GalleryBackgroundColorField({
  gallery,
  onChange,
  label,
}: {
  gallery: PortfolioGallerySectionSettings;
  onChange: GalleryPatch;
  label: string;
}) {
    const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, gallery.galleryPalette);
  const bindings = mergeGalleryColorBindings(gallery.galleryColorBindings);
  const token = bindings.sectionBackground;
    return (
    <ColorSwatchRow
      label={label}
      options={PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        color: resolveHeroPaletteColor(palette, option.value),
      }))}
      value={token}
      onChange={(next) => onChange(patchGalleryColorBinding(gallery, 'sectionBackground', next as HeroPaletteTokenId))}
    />
  );
}

/* ---------------------------------------------------------------------- */
/* Design pickers — a collapsed summary row that expands into a thumbnail  */
/* grid, exactly like the Footer's Section design / Header design pickers. */
/* ---------------------------------------------------------------------- */

/** Expanded-grid card: wireframe + name only, no description paragraph (Settings design
 *  standard, text-reduction rule). See `.pf-gallery-design-card` in globals.css. */
function _GalleryPickerCard({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      className="pf-gallery-design-card relative rounded-2xl p-2.5 text-left"
    >
      {children}
      <span className="pf-gallery-card-label mt-2 block text-sm font-semibold leading-none tracking-tight">
        {label}
      </span>
    </button>
  );
}

/** Collapsed-state row: a compact thumbnail, the selected design's name, a trailing chevron. */
function _GalleryDesignSummaryRow({
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
      <GallerySectionLabel>{label}</GallerySectionLabel>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Change ${label.toLowerCase()}`}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-[color:var(--pf-palette-bordure)] px-3 py-2.5 text-left transition hover:border-[color:var(--pf-palette-texte-muted)]"
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

/** One abstract mini-wireframe per gallery layout — every option gets one, no exceptions
 *  (the thumbnail convention the Footer/Work/Services pickers already follow). */

function GalleryDesignChoiceGrid({
  value,
  onChange,
  showGrid,
  setShowGrid,
}: {
  value: PortfolioGalleryDesign;
  onChange: (value: PortfolioGalleryDesign) => void;
  /** Owned by the panel so the selected design's Layout settings hide while the catalogue is open. */
  showGrid: boolean;
  setShowGrid: (open: boolean) => void;
}) {
  const t = useT();
  const selected =
    PORTFOLIO_GALLERY_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_GALLERY_DESIGN_OPTIONS[0];
  if (showGrid) {
    return (
      <div className="np-stack">
        <div className="flex flex-col gap-7" aria-label={t('Choose a design')}>
          {PORTFOLIO_GALLERY_DESIGN_OPTIONS.map((option) => (
            <div key={option.value} className="group relative">
              <button type="button" aria-pressed={value === option.value}
                onClick={() => onChange(option.value)}
                className="w-full overflow-hidden rounded-xl border p-1.5 text-left transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{borderColor:value === option.value ? 'var(--pf-palette-principal,#f97316)' : 'color-mix(in srgb,currentColor 18%,transparent)'}}>
                <GalleryFramedThumbnail design={option.value}/>
                <span className="block py-3 pl-2 pr-36 text-sm font-medium">{t(option.label)}</span>
              </button>
              <button type="button" aria-label={`${t('Settings')} — ${t(option.label)}`} title={t('Settings')}
                onClick={() => { onChange(option.value); setShowGrid(false); }}
                className="absolute bottom-1.5 right-3 flex min-h-11 items-center gap-2 rounded-sm px-1 text-xs font-medium text-[var(--np-muted,#a1a1aa)] opacity-0 transition-opacity hover:text-[var(--np-text,#fafafa)] group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 [@media(hover:none)]:opacity-100">
                <span>{t('Customize')}</span>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <NpBackRow title={t(selected.label)} onBack={() => setShowGrid(true)} />
  );
}

/** One wireframe per Header design — the shared 8-design GSAP header mounted above the
 *  Gallery section, independent of the gallery's own layout `design`. */
function GalleryHeaderWireframe({design}:{design:PortfolioGalleryHeaderDesign}){
 return <StackPreviewSkeleton section="gallery"><StackHeaderSkeleton design={design} compact word="GALLERY" title="Instants choisis" lead="Nos" count="04"/></StackPreviewSkeleton>;
}

function GalleryHeaderDesignGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioGalleryHeaderDesign;onChange:(value:PortfolioGalleryHeaderDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const theme=useThumbnailTheme('gallery');
 const selected=PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return <div className="flex flex-col gap-8" aria-label={t('Choose a header')}>
  {PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS.map(option=>{
   if(option.value==='none')return <button
    key={option.value}
    type="button"
    aria-pressed={value===option.value}
    onClick={()=>onChange(option.value)}
    className="flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-sm font-medium transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2"
    style={{borderColor:value===option.value?'var(--pf-palette-principal,#f97316)':'color-mix(in srgb,currentColor 18%,transparent)'}}
   >{t(option.label)}</button>;
   const skeleton=<GalleryHeaderWireframe design={option.value}/>;
   return <PortfolioHeaderDesignOption key={option.value} design={option.value}><DesignCatalogueCard label={t(option.label)} selected={value===option.value} previewBackground={theme.background} onSelect={()=>onChange(option.value)} onCustomize={()=>{if(value!==option.value)onChange(option.value);setShowGrid(false);}}><span className="relative block aspect-[3/1] w-full" style={{backgroundColor:theme.background}}>{previewSource?<PortfolioDesignLivePreview src={withDesignPreview(previewSource.portfolioPath,{section:'galleryHeader',design:option.value})+'&previewRevision=gallery-header-compact-v3'} settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={skeleton} animateSkeleton={false} backgroundColor={theme.background}/>:skeleton}</span></DesignCatalogueCard></PortfolioHeaderDesignOption>;
  })}
 </div>;
}


/** The Footer's settings band — one titled card under a design picker. */
function GallerySettingsBand({
  flush = false,
  id,
  title,
  motionKey,
  children,
}: {
  id: string;
  title: string;
  motionKey: string;
  children: ReactNode;
  /** Drops the boxed frame so the fields use the dock's full width. */
  flush?: boolean;
}) {
  return (
    <section className={`pf-exp-layout-settings${flush ? ' pf-exp-layout-settings--flush' : ''}`} aria-labelledby={id}>
      <h3 id={id} className="sr-only">
        {title}
      </h3>
      <div key={motionKey} className="pf-exp-layout-settings-body space-y-7">
        {children}
      </div>
    </section>
  );
}

function GalleryBandGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <NpCollapsibleSection title={title}>
      <div className="space-y-5">{children}</div>
    </NpCollapsibleSection>
  );
}

/* ---------------------------------------------------------------------- */
/* Header tab — per-design fields, then the controls every design shares.  */
/* ---------------------------------------------------------------------- */

const GALLERY_HEADER_COPY: HeaderCopy = {
  editorial: { label: msg('Gallery'), title: msg('Visual journal'), subtitle: msg('Images, films, and chosen moments.') },
  index: { rule: 'Index', title: msg('Visual journal'), subtitle: msg('Images, films, and chosen moments.'), count: 'Images' },
  marquee: ['Gallery', 'Optional', 'Optional', 'Optional'],
  accent: { badge: '{count}+ moments', lead: 'A curated set of images and moments worth revisiting.' },
  serif: { label: msg('Gallery'), title: msg('A curated collection of images, films, and chosen moments.'), subtitle: msg('Images, films, and chosen moments.') },
  billboard: { word: 'GALLERY', title: msg('Visual journal'), count: '{count} images — visual journal below' },
  masthead: ['Visual stories.', 'Chosen with intent.', 'Captured over time.'],
  split: { title: msg('Visual journal'), label: msg('Gallery') },
};

/** The Header tab body: this design's texts, one style editor, then the controls every design shares. */
function GalleryHeaderDesignFields({
  gallery,
  onChange,
}: {
  gallery: PortfolioGallerySectionSettings;
  onChange: (patch: Partial<PortfolioGallerySectionSettings>) => void;
}) {
  const onPatch = (patch: HeaderPatch) => onChange(patch as Partial<PortfolioGallerySectionSettings>);
  return (
    <HeaderDesignFields
      settings={gallery}
      onPatch={onPatch}
      copy={GALLERY_HEADER_COPY}
      colorOptions={GALLERY_HEADER_PALETTE_TOKEN_OPTIONS}
      resolveColor={galleryHeaderPaletteTokenColor}
      accentAlignmentOptions={GALLERY_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
      billboardStyleOptions={GALLERY_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
    />
  );
}

const GALLERY_CAPTION_PAGER_OPTIONS = [
  { value: 'chevrons' as const, label: msg('Chevrons') },
  { value: 'dots' as const, label: msg('Dots') },
];

function GalleryLayoutSettingsBand({
  gallery,
  onChange,
}: {
  gallery: PortfolioGallerySectionSettings;
  onChange: GalleryPatch;
}) {
  const t = useT();
  const usesCarouselNav = galleryDesignUsesCarouselNav(gallery.design);
  const usesCardWidth = galleryDesignUsesCaptionCardWidth(gallery.design);
  const isCaptionCarousel = gallery.design === 'caption-carousel';
  const hasComposition = usesCardWidth;
  const hasNavigation = usesCarouselNav || isCaptionCarousel;
  // Caption cards drive their chevrons from "Carousel controls" alone — a second arrows switch
  // that could never hide them on its own would only contradict it.
  const showArrowsSwitch = usesCarouselNav && !isCaptionCarousel;
  const isHeroMosaic = gallery.design === 'hero-mosaic';
  const isFramedGrid = gallery.design === 'framed-grid';
  const isFloatingCanvas = gallery.design === 'floating-canvas';

  if (gallery.design === 'visual-index') {
    return <GallerySettingsBand flush id="gallery-layout-settings-title" title={t('Layout settings')} motionKey={gallery.design}>
      <GalleryBandGroup title={t('Thumbnails')}>
      <NpToggleRow title={t('Smart thumbnail fit')} description={t('Fit every thumbnail to the main image height on desktop, without scrolling.')}
        checked={gallery.visualIndexSmartFit !== false} onChange={(visualIndexSmartFit) => onChange({ visualIndexSmartFit })} />
      </GalleryBandGroup>
    </GallerySettingsBand>;
  }

  if (!hasComposition && !hasNavigation && !isHeroMosaic && !isFramedGrid && !isFloatingCanvas) {
    return (
      <p className="text-xs text-[color:var(--pf-palette-texte-muted)]">
        {t('This design has no options of its own — it renders straight from your media.')}
      </p>
    );
  }

  return (
    <GallerySettingsBand flush id="gallery-layout-settings-title" title={t('Layout settings')} motionKey={gallery.design}>
<SettingsRowsScope title={t('Layout options')}>
      {isHeroMosaic ? (
        <GalleryBandGroup title={t('Hover')}>
          <GalleryToggleRow
            label={t('Focus on hover')}
            checked={gallery.mosaicFocusEnabled !== false}
            onChange={(mosaicFocusEnabled) => onChange({ mosaicFocusEnabled })}
          />
        </GalleryBandGroup>
      ) : null}
      {isFloatingCanvas ? (
        <>
          <GalleryBandGroup title={t('Canvas')}>
            <GalleryOptionGrid
              label={t('Lanes')}
              options={PORTFOLIO_GALLERY_FLOATING_CANVAS_LANE_OPTIONS}
              value={gallery.floatingCanvasLanes ?? '3'}
              onChange={(floatingCanvasLanes) => onChange({ floatingCanvasLanes })}
              columns={2}
            />
            <GalleryOptionGrid
              label={t('Dispersion')}
              options={PORTFOLIO_GALLERY_FLOATING_CANVAS_DISPERSION_OPTIONS}
              value={gallery.floatingCanvasDispersion ?? 'medium'}
              onChange={(floatingCanvasDispersion) => onChange({ floatingCanvasDispersion })}
              columns={4}
            />
            <GalleryOptionGrid
              label={t('Scroll parallax')}
              options={PORTFOLIO_GALLERY_FLOATING_CANVAS_PARALLAX_OPTIONS}
              value={gallery.floatingCanvasParallax ?? 'medium'}
              onChange={(floatingCanvasParallax) => onChange({ floatingCanvasParallax })}
              columns={4}
            />
          </GalleryBandGroup>
          <GalleryBandGroup title={t('Title badge')}>
            <GalleryOptionGrid
              label={t('Badge style')}
              hideLabel
              options={PORTFOLIO_GALLERY_FLOATING_CANVAS_BADGE_OPTIONS}
              value={gallery.floatingCanvasBadge ?? 'dark'}
              onChange={(floatingCanvasBadge) => onChange({ floatingCanvasBadge })}
              columns={2}
            />
          </GalleryBandGroup>
        </>
      ) : null}
      {isFramedGrid ? (
        <GalleryBandGroup title={t('Motion & title')}>
          <GalleryOptionGrid
            label={t('Scroll parallax')}
            options={PORTFOLIO_GALLERY_FRAMED_GRID_PARALLAX_OPTIONS}
            value={gallery.framedGridParallax ?? 'medium'}
            onChange={(framedGridParallax) => onChange({ framedGridParallax })}
            columns={4}
          />
          <GalleryOptionGrid
            label={t('Hover title style')}
            options={PORTFOLIO_GALLERY_FRAMED_GRID_TITLE_STYLE_OPTIONS}
            value={gallery.framedGridTitleStyle ?? 'serif'}
            onChange={(framedGridTitleStyle) => onChange({ framedGridTitleStyle })}
            columns={2}
          />
          <div className="space-y-1.5">
            <GalleryToggleRow
              label={t('Monochrome-to-color hover')}
              checked={gallery.framedGridColorReveal !== false}
              onChange={(framedGridColorReveal) => onChange({ framedGridColorReveal })}
            />
            <p className="text-xs text-[color:var(--pf-palette-texte-muted)]">
              {t('Images cool to a muted monochrome at rest, then bloom to full color on hover.')}
            </p>
          </div>
        </GalleryBandGroup>
      ) : null}
      {hasComposition ? (
        <GalleryBandGroup title={t('Composition')}>
          {usesCardWidth ? (
            <div className="space-y-1.5">
              <GalleryRange
                label={t('Image size')}
                value={gallery.captionCardWidthPx}
                min={180}
                max={420}
                onChange={(captionCardWidthPx) => onChange({ captionCardWidthPx })}
              />
              <p className="text-xs text-[color:var(--pf-palette-texte-muted)]">
                {t('Scales the plates. With a ratio set they share one height and their widths vary; with Original ratio each keeps its own proportions.')}
              </p>
            </div>
          ) : null}
        </GalleryBandGroup>
      ) : null}

      {hasNavigation ? (
        <GalleryBandGroup title={t('Navigation')}>
          {showArrowsSwitch ? (
            <div className="space-y-1.5">
              <GalleryToggleRow
                label={t('Navigation arrows')}
                checked={gallery.showCarouselNav}
                onChange={(showCarouselNav) => onChange({ showCarouselNav })}
              />
              <p className="text-xs text-[color:var(--pf-palette-texte-muted)]">{t('Previous / next buttons for scrolling galleries.')}</p>
            </div>
          ) : null}
          {isCaptionCarousel ? (
            <>
              <div className="space-y-1.5">
                <GalleryToggleRow
                  label={t('Carousel controls')}
                  checked={gallery.showPagination}
                  onChange={(showPagination) => onChange({ showPagination })}
                />
                <p className="text-xs text-[color:var(--pf-palette-texte-muted)]">{t('Shows the controls under the cards.')}</p>
              </div>
              {gallery.showPagination ? (
                <GalleryOptionGrid
                  label={t('Control style')}
                  options={GALLERY_CAPTION_PAGER_OPTIONS}
                  value={gallery.captionPager ?? 'chevrons'}
                  onChange={(captionPager) => onChange({ captionPager })}
                  columns={2}
                />
              ) : null}
            </>
          ) : null}
        </GalleryBandGroup>
      ) : null}
    </SettingsRowsScope>
</GallerySettingsBand>
  );
}

/* ---------------------------------------------------------------------- */

function GalleryMediaOrder({ gallery, onChange }: { gallery: PortfolioGallerySectionSettings; onChange: GalleryPatch }) {
  const t = useT();
  const source = usePortfolioDesignPreviewSource();
  const ranks = new Map((gallery.mediaOrder ?? []).map((id, index) => [id, index]));
  const items = [...(source?.availableGallery ?? [])].sort((a, b) =>
    (ranks.get(a.id) ?? Infinity) - (ranks.get(b.id) ?? Infinity) || a.sortOrder - b.sortOrder);
  const move = (from: number, to: number) => {
    if (from < 0 || to < 0 || from >= items.length || to >= items.length || from === to) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ mediaOrder: next.map((media) => media.id) });
  };
  if (items.length < 2) return null;
  return (
    <NpCollapsibleSection title={t('Media order')}>
      <p className="text-xs leading-relaxed text-[color:var(--np-muted)]">{t('Drag photos or use the arrows to change their order.')}</p>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((item: ProfileGalleryItem, index) => (
          <li key={item.id} draggable
            onDragStart={(event) => { event.dataTransfer.setData('application/x-gallery-media', item.id); event.dataTransfer.effectAllowed = 'move'; }}
            onDragOver={(event) => { if (event.dataTransfer.types.includes('application/x-gallery-media')) event.preventDefault(); }}
            onDrop={(event) => { event.preventDefault(); move(items.findIndex((media) => media.id === event.dataTransfer.getData('application/x-gallery-media')), index); }}
            className="flex items-center gap-3 rounded-lg bg-[var(--np-card)] p-2 transition-colors hover:bg-[var(--np-well)] focus-within:bg-[var(--np-well)]">
            <span aria-hidden="true" className="text-xs tabular-nums text-[color:var(--np-muted)]">{index + 1}</span>
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-[color:var(--np-surface)]">
              {item.mediaType === 'VIDEO' ? <span className="flex h-full items-center justify-center text-xs">▶</span> : <MediaImage src={item.mediaUrl} width={48} className="h-full w-full object-cover" />}
            </div>
            <span className="min-w-0 flex-1 truncate text-sm text-[color:var(--np-text)]">{item.title?.trim() || t('Gallery media')}</span>
            <div className="flex shrink-0">
              <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={t('Move up')} className="h-10 w-9 rounded disabled:opacity-25 focus-visible:outline-2">↑</button>
              <button type="button" disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label={t('Move down')} className="h-10 w-9 rounded disabled:opacity-25 focus-visible:outline-2">↓</button>
            </div>
          </li>
        ))}
      </ol>
    </NpCollapsibleSection>
  );
}

export function GallerySettingsPanel({
  gallery,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  chrome,
}: {
  gallery: PortfolioGallerySectionSettings;
  onChange: GalleryPatch;
  subSection?: GallerySubSection;
  onSubSectionChange?: (value: GallerySubSection) => void;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const backgroundTheme = useThumbnailTheme('gallery');
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(true);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<GallerySubSection>('general');
  const subSection = normalizeGallerySubSection(controlledSubSection ?? uncontrolledSubSection);
  const [previousSubSection, setPreviousSubSection] = useState(subSection);
  if (previousSubSection !== subSection) {
    setPreviousSubSection(subSection);
    if (subSection === 'design') setDesignCatalogOpen(true);
    if (subSection === 'header') setHeaderCatalogOpen(true);
  }
  const setSubSection = (value: GallerySubSection) => {
    const next = normalizeGallerySubSection(value);
    if (next === 'design') setDesignCatalogOpen(true);
    if (next === 'header') setHeaderCatalogOpen(true);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };

  const defaults: PortfolioGallerySectionSettings = { enabled: true, title: 'Gallery', subtitle: 'Images, films, and chosen moments.', ...DEFAULT_GALLERY_PRESENTATION };
  return (
    <NpPanelShell title={t('Gallery')} modified={JSON.stringify(gallery) !== JSON.stringify(defaults)} tabs={GALLERY_SUB_SECTIONS.map((item) => ({ id: item.id, label: t(item.label) }))} activeTab={subSection} onTabChange={setSubSection} onReset={() => onChange(defaults)} chrome={chrome}>

      {subSection === 'general' ? (
        <div className="np-stack"><NpToggleRow card title={t('Show Gallery section')} description={gallery.enabled !== false ? undefined : t('Visitors go straight to the next section.')} checked={gallery.enabled !== false} onChange={(enabled) => onChange({ enabled })} /><div className="np-dimmable" data-disabled={gallery.enabled !== false ? 'false' : 'true'} inert={gallery.enabled === false}>
          <div className="pb-6">
            <SectionColorModeControl label={t('Color mode')} hideLabel value={gallery.colorModeOverride} onChange={colorModeOverride => onChange({ colorModeOverride })} />
          </div>
          <NpCollapsibleSection title={t('Content shown')}>
              <NpToggleRow
                title={t('Media titles')}
                checked={gallery.showTitle}
                onChange={(showTitle) => onChange({ showTitle })}
              />
              <NpToggleRow
                title={t('Lightbox')}
                checked={gallery.lightboxEnabled}
                onChange={(lightboxEnabled) => onChange({ lightboxEnabled })}
              />
                <NpToggleRow
                  title={t('Hover zoom')}
                  checked={gallery.hoverZoom}
                  onChange={(hoverZoom) => onChange({ hoverZoom })}
                />

          </NpCollapsibleSection>
          <GalleryMediaOrder gallery={gallery} onChange={onChange} />
        </div></div>
      ) : null}

      {subSection !== 'general' && gallery.enabled === false ? <div className="np-stack"><NpToggleRow card title={t('This section is hidden')} description={t('Enable it to edit its settings and make it visible on the portfolio.')} checked={false} onChange={() => onChange({ enabled: true })} /></div> : null}

      {subSection === 'design' && gallery.enabled !== false ? (
        <div className="np-stack">
          <GalleryDesignChoiceGrid
            showGrid={designCatalogOpen}
            setShowGrid={setDesignCatalogOpen}
            value={gallery.design}
            onChange={(design) => onChange({ design })}
          />
          {designCatalogOpen ? null : <GalleryLayoutSettingsBand gallery={gallery} onChange={onChange} />}
          {designCatalogOpen ? null : (
            <CardsStyleControls
              value={gallery.cardsStyle ?? DEFAULT_CARDS_STYLE}
              onChange={(cardsStyle) => onChange({ cardsStyle })}
              palette={gallery.galleryPalette}
            />
          )}
          {designCatalogOpen ? null : (
          <NpCollapsibleSection title={t('Style')}>


          <TextSizeSlider label={t('Text size')} options={PORTFOLIO_GALLERY_PREMIUM_FONT_SIZE_OPTIONS} value={gallery.premiumFontSize ?? 'medium'} onChange={(premiumFontSize) => onChange({ premiumFontSize })} />
          </NpCollapsibleSection>
          )}
        </div>
      ) : null}

      {subSection === 'background' && gallery.enabled !== false ? (
        <div className="np-stack"><NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl
              value={gallery.paletteFamily ?? 'global'}
              onChange={(paletteFamily) => onChange({ paletteFamily })}
              mode={backgroundTheme.mode}
            />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Background')}>
          <SectionBackgroundSettingsFields
            settings={gallery}
            onChange={onChange}
            renderColorField={({ label }) => <ColorSwatchRow label={label}
              options={([['fond', 'Background'], ['neutre', 'Surface'], ['principal', 'Primary'], ['secondaire', 'Secondary'], ['texteFort', 'Strong text']] as const).map(([token, text]) => ({ value: token, label: t(text), color: backgroundTheme.palette[token] }))}
              value={mergeGalleryColorBindings(gallery.galleryColorBindings).sectionBackground}
              onChange={token => onChange({ useHeroPalette: true, ...patchGalleryColorBinding({ ...gallery, galleryPalette: backgroundTheme.palette }, 'sectionBackground', token as HeroPaletteTokenId) })} />}
          />
        </NpCollapsibleSection></div>
      ) : null}

      {subSection === 'header' && gallery.enabled !== false ? (
        <div className="np-stack">
          <GalleryHeaderDesignGrid
            value={gallery.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
            open={headerCatalogOpen}
            onOpenChange={setHeaderCatalogOpen}
          />

          {/* Browsing the catalog is a different task from tuning the chosen design: no settings below it. */}
          {headerCatalogOpen || gallery.headerDesign === 'none' ? null : (
            <NpCollapsibleSection title={t('Header settings')}>
              <GalleryHeaderDesignFields gallery={gallery} onChange={onChange} />
            </NpCollapsibleSection>
          )}
        </div>
      ) : null}
    </NpPanelShell>
  );
}
