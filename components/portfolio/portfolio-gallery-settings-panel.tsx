'use client';

import { useState, type ReactNode } from 'react';
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
  galleryDesignUsesCarouselNav,
  galleryDesignUsesCaptionCardWidth,
  PORTFOLIO_GALLERY_DESIGN_OPTIONS,
  PORTFOLIO_GALLERY_FEATURED_RAIL_OPTIONS,
  PORTFOLIO_GALLERY_FEATURED_WIDTH_SCOPE_OPTIONS,
  PORTFOLIO_GALLERY_PREMIUM_FONT_SIZE_OPTIONS,
  PORTFOLIO_GALLERY_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_GALLERY_TITLE_PRESET_OPTIONS,
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
  type PortfolioGalleryHeaderPaletteToken,
  type PortfolioGalleryHeaderTitleSize,
  type PortfolioGalleryHeaderTitleWeight,
} from '@/components/portfolio/portfolio-gallery-header-settings';

/* ---------------------------------------------------------------------- */
/* Sub-sections — the same four tabs, in the same order, with the same     */
/* labels as the Footer panel, which is this repo's reference              */
/* implementation of the "Settings design standard".                       */
/* ---------------------------------------------------------------------- */

export type GallerySubSection = 'general' | 'design' | 'background' | 'header';
/** Legacy alias — the settings modal still imports the panel's type under this name. */
export type GallerySettingsSubSection = GallerySubSection;

const GALLERY_SUB_SECTIONS: { id: GallerySubSection; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'design', label: 'Design' },
  { id: 'background', label: 'Background' },
  { id: 'header', label: 'Header' },
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

const GALLERY_INPUT_CLASS =
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400';

function GallerySectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{children}</p>;
}

function GalleryGroupLabel({ children }: { children: string }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{children}</p>;
}

/** Same animated switch as the Footer/Services/Contact panels — shared settings-UI chrome. */
function GallerySwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span
      className="relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        backgroundColor: checked
          ? 'var(--pf-palette-texte-fort, #171717)'
          : 'color-mix(in srgb, var(--pf-palette-texte-fort, #171717) 22%, var(--pf-palette-fond, #ffffff))',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full transition-[left,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: checked ? '1.125rem' : '0.125rem',
          backgroundColor: checked
            ? 'var(--pf-palette-fond, #ffffff)'
            : 'var(--pf-palette-texte-fort, #171717)',
        }}
      />
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
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer flex-col gap-1 text-left"
    >
      <span className="flex items-center justify-between gap-4">
        <span className="min-w-0 truncate text-sm font-medium text-neutral-950">{label}</span>
        <GallerySwitchTrack checked={checked} />
      </span>
    </button>
  );
}

/** One-per-line visibility row (hairline divider), same pattern as the Footer's General tab. */
function GalleryVisibilityRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200/80 py-3.5 last:border-b-0">
      <span
        className="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium text-neutral-950"
        onClick={() => onChange(!checked)}
      >
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="shrink-0"
      >
        <GallerySwitchTrack checked={checked} />
      </button>
    </div>
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
  return (
    <div>
      {hideLabel ? null : <GalleryGroupLabel>{label}</GalleryGroupLabel>}
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
                active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const GALLERY_SIZE_PILL_OPTIONS: { value: PortfolioGalleryHeaderTitleSize; label: string; fontPx: number }[] = [
  { value: 'sm', label: 'S', fontPx: 12 },
  { value: 'md', label: 'M', fontPx: 15 },
  { value: 'lg', label: 'L', fontPx: 18 },
  { value: 'xl', label: 'XL', fontPx: 22 },
];

function GallerySizePill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioGalleryHeaderTitleSize;
  onChange: (value: PortfolioGalleryHeaderTitleSize) => void;
}) {
  return (
    <div>
      <GalleryGroupLabel>{label}</GalleryGroupLabel>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-4 gap-1.5">
        {GALLERY_SIZE_PILL_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`rounded-lg px-2.5 py-2 text-center font-semibold leading-none transition ${
                active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
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

function GalleryPaletteSwatches({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioGalleryHeaderPaletteToken;
  onChange: (value: PortfolioGalleryHeaderPaletteToken) => void;
}) {
  return (
    <div>
      <GalleryGroupLabel>{label}</GalleryGroupLabel>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-3 gap-1.5">
        {GALLERY_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: galleryHeaderPaletteTokenColor(option.value) }}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GalleryTextField({
  label,
  value,
  placeholder,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <GallerySectionLabel>{label}</GallerySectionLabel>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={2}
          aria-label={label}
          className={`mt-2 ${GALLERY_INPUT_CLASS} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`mt-2 ${GALLERY_INPUT_CLASS}`}
        />
      )}
    </div>
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
        <span className="text-[11px] font-semibold tabular-nums text-neutral-400">
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
        className="mt-2.5 h-2 w-full cursor-pointer accent-neutral-900"
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
  return (
    <div>
      <GallerySectionLabel>{label}</GallerySectionLabel>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-mono text-neutral-900"
          aria-label={`${label} hex`}
        />
      </div>
    </div>
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
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <GallerySectionLabel>{label}</GallerySectionLabel>
        <span
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-neutral-200"
          style={{ backgroundColor: resolved }}
          title={resolved}
          aria-hidden
        />
      </div>
      <select
        value={token}
        onChange={(event) =>
          onChange(patchGalleryColorBinding(gallery, 'sectionBackground', event.target.value as HeroPaletteTokenId))
        }
        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
        aria-label={`${label} palette token`}
      >
        {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Design pickers — a collapsed summary row that expands into a thumbnail  */
/* grid, exactly like the Footer's Section design / Header design pickers. */
/* ---------------------------------------------------------------------- */

/** Expanded-grid card: wireframe + name only, no description paragraph (Settings design
 *  standard, text-reduction rule). See `.pf-gallery-design-card` in globals.css. */
function GalleryPickerCard({
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
function GalleryDesignSummaryRow({
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
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-neutral-200/80 px-3 py-2.5 text-left transition hover:border-neutral-300"
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

function GalleryMiniStage({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

/** One abstract mini-wireframe per gallery layout — every option gets one, no exceptions
 *  (the thumbnail convention the Footer/Work/Services pickers already follow). */
function GalleryDesignWireframe({ design }: { design: PortfolioGalleryDesign }) {
  switch (design) {
    case 'framed-grid':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="10" width="32" height="22" rx="2.5" opacity={0.75} />
          <rect className="pf-stack-mini-ink" x="44" y="10" width="32" height="22" rx="2.5" opacity={0.6} />
          <rect className="pf-stack-mini-ink" x="80" y="10" width="32" height="22" rx="2.5" opacity={0.45} />
          <rect className="pf-stack-mini-mute" x="8" y="35" width="20" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-mute" x="44" y="35" width="20" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-mute" x="80" y="35" width="20" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="8" y="42" width="32" height="22" rx="2.5" opacity={0.55} />
          <rect className="pf-stack-mini-ink" x="44" y="42" width="32" height="22" rx="2.5" opacity={0.4} />
          <rect className="pf-stack-mini-ink" x="80" y="42" width="32" height="22" rx="2.5" opacity={0.28} />
        </GalleryMiniStage>
      );
    case 'caption-carousel':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="12" width="34" height="30" rx="3" opacity={0.75} />
          <rect className="pf-stack-mini-mute" x="8" y="46" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="48" y="12" width="34" height="30" rx="3" opacity={0.55} />
          <rect className="pf-stack-mini-mute" x="48" y="46" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="88" y="12" width="30" height="30" rx="3" opacity={0.3} />
          <circle className="pf-stack-mini-ring" cx="52" cy="61" r="4" strokeWidth={1.2} />
          <circle className="pf-stack-mini-ring" cx="66" cy="61" r="4" strokeWidth={1.2} />
        </GalleryMiniStage>
      );
    case 'cinema-strip':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="18" width="54" height="34" rx="3" opacity={0.75} />
          <rect className="pf-stack-mini-ink" x="68" y="18" width="54" height="34" rx="3" opacity={0.45} />
          <circle className="pf-stack-mini-ring" cx="14" cy="35" r="5" strokeWidth={1.2} />
          <circle className="pf-stack-mini-ring" cx="106" cy="35" r="5" strokeWidth={1.2} />
        </GalleryMiniStage>
      );
    case 'hero-mosaic':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="10" width="104" height="30" rx="3" opacity={0.75} />
          <rect className="pf-stack-mini-ink" x="8" y="44" width="32" height="20" rx="2.5" opacity={0.5} />
          <rect className="pf-stack-mini-ink" x="44" y="44" width="32" height="20" rx="2.5" opacity={0.38} />
          <rect className="pf-stack-mini-ink" x="80" y="44" width="32" height="20" rx="2.5" opacity={0.26} />
        </GalleryMiniStage>
      );
    case 'featured-strip':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="10" width="72" height="54" rx="3" opacity={0.75} />
          <rect className="pf-stack-mini-ink" x="86" y="10" width="26" height="16" rx="2.5" opacity={0.5} />
          <rect className="pf-stack-mini-ink" x="86" y="29" width="26" height="16" rx="2.5" opacity={0.38} />
          <rect className="pf-stack-mini-ink" x="86" y="48" width="26" height="16" rx="2.5" opacity={0.26} />
        </GalleryMiniStage>
      );
    case 'tall-row':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="8" width="42" height="56" rx="3" opacity={0.75} />
          <rect className="pf-stack-mini-ink" x="56" y="26" width="18" height="38" rx="2.5" opacity={0.5} />
          <rect className="pf-stack-mini-ink" x="78" y="26" width="18" height="38" rx="2.5" opacity={0.38} />
          <rect className="pf-stack-mini-ink" x="100" y="26" width="12" height="38" rx="2.5" opacity={0.26} />
        </GalleryMiniStage>
      );
    case 'editorial-split':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="10" width="66" height="26" rx="3" opacity={0.75} />
          <rect className="pf-stack-mini-ink" x="80" y="10" width="32" height="26" rx="3" opacity={0.45} />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="32" height="24" rx="3" opacity={0.38} />
          <rect className="pf-stack-mini-ink" x="46" y="40" width="66" height="24" rx="3" opacity={0.6} />
        </GalleryMiniStage>
      );
    default: {
      const exhaustive: never = design;
      return exhaustive;
    }
  }
}

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
  const selected =
    PORTFOLIO_GALLERY_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_GALLERY_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <GallerySectionLabel>Section design</GallerySectionLabel>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_GALLERY_DESIGN_OPTIONS.map((option) => (
            <GalleryPickerCard
              key={option.value}
              active={option.value === value}
              label={option.label}
              onClick={() => {
                onChange(option.value);
                setShowGrid(false);
              }}
            >
              <GalleryDesignWireframe design={option.value} />
            </GalleryPickerCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <GalleryDesignSummaryRow label="Design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <GalleryDesignWireframe design={value} />
    </GalleryDesignSummaryRow>
  );
}

/** One wireframe per Header design — the shared 8-design GSAP header mounted above the
 *  Gallery section, independent of the gallery's own layout `design`. */
function GalleryHeaderWireframe({ design }: { design: PortfolioGalleryHeaderDesign }) {
  switch (design) {
    case 'editorial':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-accent" x="8" y="14" width="18" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="24" width="86" height="12" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="44" width="50" height="3" rx="1.5" />
        </GalleryMiniStage>
      );
    case 'marquee':
      return (
        <GalleryMiniStage>
          <text
            x="60"
            y="42"
            fontSize={22}
            fontWeight={800}
            textAnchor="middle"
            opacity={0.14}
            className="pf-stack-mini-ink"
          >
            GALLERY
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="84" height="11" rx="2" />
        </GalleryMiniStage>
      );
    case 'index':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-mute" x="8" y="14" width="104" height="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="22" height="18" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="40" y="26" width="1.5" height="18" />
          <rect className="pf-stack-mini-ink" x="50" y="28" width="60" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="50" y="40" width="36" height="2.5" rx="1.25" />
        </GalleryMiniStage>
      );
    case 'accent-count':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-accent" x="8" y="14" width="30" height="9" rx="4.5" />
          <rect className="pf-stack-mini-mute" x="8" y="30" width="46" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="39" width="70" height="9" rx="2" />
        </GalleryMiniStage>
      );
    case 'serif-lead':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-mute" x="8" y="14" width="24" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="100" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="70" height="10" rx="2" opacity={0.5} />
        </GalleryMiniStage>
      );
    case 'billboard':
      return (
        <GalleryMiniStage>
          <text
            x="60"
            y="38"
            fontSize={25}
            fontWeight={900}
            textAnchor="middle"
            opacity={0.1}
            className="pf-stack-mini-ink"
          >
            GALLERY
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="60" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="18" y="44" width="40" height="3" rx="1.5" />
        </GalleryMiniStage>
      );
    case 'masthead':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="12" width="90" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="70" height="10" rx="2" opacity={0.6} />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="80" height="10" rx="2" opacity={0.3} />
        </GalleryMiniStage>
      );
    case 'split-heading':
      return (
        <GalleryMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="26" width="58" height="11" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="41" width="36" height="11" rx="2" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="86" y="16" width="26" height="3" rx="1.5" />
        </GalleryMiniStage>
      );
    default: {
      const exhaustive: never = design;
      return exhaustive;
    }
  }
}

function GalleryHeaderDesignGrid({
  value,
  onChange,
}: {
  value: PortfolioGalleryHeaderDesign;
  onChange: (value: PortfolioGalleryHeaderDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <GallerySectionLabel>Header design</GallerySectionLabel>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS.map((option) => (
            <GalleryPickerCard
              key={option.value}
              active={option.value === value}
              label={option.label}
              onClick={() => {
                onChange(option.value);
                setShowGrid(false);
              }}
            >
              <GalleryHeaderWireframe design={option.value} />
            </GalleryPickerCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <GalleryDesignSummaryRow label="Header design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <GalleryHeaderWireframe design={value} />
    </GalleryDesignSummaryRow>
  );
}

/** The Footer's settings band — one titled card under a design picker. */
function GallerySettingsBand({
  id,
  title,
  motionKey,
  children,
}: {
  id: string;
  title: string;
  motionKey: string;
  children: ReactNode;
}) {
  return (
    <section className="pf-exp-layout-settings" aria-labelledby={id}>
      <h3 id={id} className="pf-exp-layout-settings-title">
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
    <div className="space-y-4">
      <GalleryGroupLabel>{title}</GalleryGroupLabel>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Header tab — per-design fields, then the controls every design shares.  */
/* ---------------------------------------------------------------------- */

const GALLERY_WEIGHT_OPTIONS: { value: PortfolioGalleryHeaderTitleWeight; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'regular', label: 'Regular' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
];

const GALLERY_HEADER_MARGIN_BOTTOM_OPTIONS = [
  { value: 'sm' as const, label: 'Small' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Large' },
  { value: 'xl' as const, label: 'XL' },
];

/** Bottom spacing and header motion — plus alignment and the shared title size/weight, but
 *  only where the chosen design actually reads them (dead controls left visible are
 *  confusing, so each branch passes `hideAlignment`/`hideTitleControls` to match). */
function GalleryHeaderSharedControls({
  gallery,
  onChange,
  hideAlignment = false,
  hideTitleControls = false,
}: {
  gallery: PortfolioGallerySectionSettings;
  onChange: GalleryPatch;
  hideAlignment?: boolean;
  hideTitleControls?: boolean;
}) {
  return (
    <div className="space-y-5 border-t border-neutral-200/70 pt-6">
      {hideAlignment ? null : (
        <GalleryOptionGrid
          label="Header alignment"
          options={[
            { value: 'left' as const, label: 'Left' },
            { value: 'center' as const, label: 'Center' },
            { value: 'right' as const, label: 'Right' },
          ]}
          value={gallery.headerDesignAlignment ?? 'left'}
          onChange={(headerDesignAlignment) => onChange({ headerDesignAlignment })}
          columns={3}
        />
      )}
      <GalleryOptionGrid
        label="Bottom spacing"
        options={GALLERY_HEADER_MARGIN_BOTTOM_OPTIONS}
        value={gallery.headerMarginBottom ?? 'md'}
        onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
        columns={4}
      />
      {hideTitleControls ? null : (
        <>
          <GallerySizePill
            label="Title size"
            value={gallery.headerTitleSize ?? 'md'}
            onChange={(headerTitleSize) => onChange({ headerTitleSize })}
          />
          <GalleryOptionGrid
            label="Title weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerTitleWeight ?? 'regular'}
            onChange={(headerTitleWeight) => onChange({ headerTitleWeight })}
            columns={4}
          />
        </>
      )}
      <div className="space-y-1.5">
        <GalleryToggleRow
          label="Header motion"
          checked={gallery.headerAnimationEnabled !== false}
          onChange={(headerAnimationEnabled) => onChange({ headerAnimationEnabled })}
        />
        <p className="text-xs text-neutral-400">Reduced-motion preferences are always respected.</p>
      </div>
    </div>
  );
}

function GalleryHeaderDesignFields({
  gallery,
  onChange,
}: {
  gallery: PortfolioGallerySectionSettings;
  onChange: GalleryPatch;
}) {
  const design = gallery.headerDesign ?? 'editorial';

  if (design === 'index') {
    return (
      <>
        <GalleryTextField
          label="Rule label"
          value={gallery.headerIndexLabelText}
          placeholder="Index"
          onChange={(headerIndexLabelText) => onChange({ headerIndexLabelText })}
        />
        <GalleryTextField
          label="Title"
          value={gallery.headerIndexTitleText}
          placeholder="Visual journal"
          onChange={(headerIndexTitleText) => onChange({ headerIndexTitleText })}
        />
        <GalleryTextField
          label="Subtitle"
          value={gallery.headerIndexSubtitleText}
          placeholder="Images, films, and chosen moments."
          onChange={(headerIndexSubtitleText) => onChange({ headerIndexSubtitleText })}
          multiline
        />
        <GalleryTextField
          label="Count label"
          value={gallery.headerIndexCountLabelText}
          placeholder="Images"
          onChange={(headerIndexCountLabelText) => onChange({ headerIndexCountLabelText })}
        />
        <GalleryBandGroup title="Label">
          <GalleryPaletteSwatches
            label="Color"
            value={gallery.headerIndexLabelColor ?? 'texteFort'}
            onChange={(headerIndexLabelColor) => onChange({ headerIndexLabelColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerIndexLabelSize ?? 'md'}
            onChange={(headerIndexLabelSize) => onChange({ headerIndexLabelSize })}
          />
          <GalleryOptionGrid
            label="Weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerIndexLabelWeight ?? 'regular'}
            onChange={(headerIndexLabelWeight) => onChange({ headerIndexLabelWeight })}
            columns={4}
          />
        </GalleryBandGroup>
        <GalleryBandGroup title="Title">
          <GalleryPaletteSwatches
            label="Color"
            value={gallery.headerIndexTitleColor ?? 'texteFort'}
            onChange={(headerIndexTitleColor) => onChange({ headerIndexTitleColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerIndexTitleSize ?? 'md'}
            onChange={(headerIndexTitleSize) => onChange({ headerIndexTitleSize })}
          />
          <GalleryOptionGrid
            label="Weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerIndexTitleWeight ?? 'regular'}
            onChange={(headerIndexTitleWeight) => onChange({ headerIndexTitleWeight })}
            columns={4}
          />
        </GalleryBandGroup>
        <GalleryBandGroup title="Subtitle">
          <GalleryPaletteSwatches
            label="Color"
            value={gallery.headerIndexSubtitleColor ?? 'texteFort'}
            onChange={(headerIndexSubtitleColor) => onChange({ headerIndexSubtitleColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerIndexSubtitleSize ?? 'md'}
            onChange={(headerIndexSubtitleSize) => onChange({ headerIndexSubtitleSize })}
          />
          <GalleryOptionGrid
            label="Weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerIndexSubtitleWeight ?? 'regular'}
            onChange={(headerIndexSubtitleWeight) => onChange({ headerIndexSubtitleWeight })}
            columns={4}
          />
        </GalleryBandGroup>
        <GalleryBandGroup title="Counter">
          <GalleryPaletteSwatches
            label="Numeral color"
            value={gallery.headerIndexNumberColor ?? 'principal'}
            onChange={(headerIndexNumberColor) => onChange({ headerIndexNumberColor })}
          />
        </GalleryBandGroup>
        <GalleryHeaderSharedControls gallery={gallery} onChange={onChange} hideAlignment hideTitleControls />
      </>
    );
  }

  if (design === 'marquee') {
    return (
      <>
        <GalleryBandGroup title="Words">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <GalleryTextField
              label="Word 1"
              value={gallery.headerMarqueeWord1Text}
              placeholder="Visual"
              onChange={(headerMarqueeWord1Text) => onChange({ headerMarqueeWord1Text })}
            />
            <GalleryTextField
              label="Word 2"
              value={gallery.headerMarqueeWord2Text}
              placeholder="Gallery"
              onChange={(headerMarqueeWord2Text) => onChange({ headerMarqueeWord2Text })}
            />
            <GalleryTextField
              label="Word 3"
              value={gallery.headerMarqueeWord3Text}
              placeholder="Optional"
              onChange={(headerMarqueeWord3Text) => onChange({ headerMarqueeWord3Text })}
            />
            <GalleryTextField
              label="Word 4"
              value={gallery.headerMarqueeWord4Text}
              placeholder="Optional"
              onChange={(headerMarqueeWord4Text) => onChange({ headerMarqueeWord4Text })}
            />
          </div>
        </GalleryBandGroup>
        <GalleryBandGroup title="Style">
          <GalleryPaletteSwatches
            label="Word color"
            value={gallery.headerMarqueeWordColor ?? 'principal'}
            onChange={(headerMarqueeWordColor) => onChange({ headerMarqueeWordColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerMarqueeSize ?? 'md'}
            onChange={(headerMarqueeSize) => onChange({ headerMarqueeSize })}
          />
        </GalleryBandGroup>
        <GalleryHeaderSharedControls gallery={gallery} onChange={onChange} hideAlignment hideTitleControls />
      </>
    );
  }

  if (design === 'accent-count') {
    return (
      <>
        <GalleryTextField
          label="Badge text"
          value={gallery.headerAccentCountBadgeText}
          placeholder="{count}+ moments"
          onChange={(headerAccentCountBadgeText) => onChange({ headerAccentCountBadgeText })}
        />
        <GalleryTextField
          label="Lead text"
          value={gallery.headerAccentCountLeadText}
          placeholder="A curated set of images and moments worth revisiting."
          onChange={(headerAccentCountLeadText) => onChange({ headerAccentCountLeadText })}
          multiline
        />
        <GalleryBandGroup title="Style">
          <GalleryPaletteSwatches
            label="Badge color"
            value={gallery.headerAccentCountBadgeColor ?? 'principal'}
            onChange={(headerAccentCountBadgeColor) => onChange({ headerAccentCountBadgeColor })}
          />
          <GalleryPaletteSwatches
            label="Lead color"
            value={gallery.headerAccentCountLeadColor ?? 'secondaire'}
            onChange={(headerAccentCountLeadColor) => onChange({ headerAccentCountLeadColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerAccentCountSize ?? 'md'}
            onChange={(headerAccentCountSize) => onChange({ headerAccentCountSize })}
          />
          <GalleryOptionGrid
            label="Lead weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerAccentCountWeight ?? 'regular'}
            onChange={(headerAccentCountWeight) => onChange({ headerAccentCountWeight })}
            columns={4}
          />
          <GalleryOptionGrid
            label="Alignment"
            options={GALLERY_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
            value={gallery.headerAccentCountAlignment ?? 'left'}
            onChange={(headerAccentCountAlignment) => onChange({ headerAccentCountAlignment })}
            columns={3}
          />
        </GalleryBandGroup>
        <GalleryHeaderSharedControls gallery={gallery} onChange={onChange} hideAlignment hideTitleControls />
      </>
    );
  }

  if (design === 'serif-lead') {
    return (
      <>
        <GalleryTextField
          label="Label"
          value={gallery.headerSerifLeadLabelText}
          placeholder="Gallery"
          onChange={(headerSerifLeadLabelText) => onChange({ headerSerifLeadLabelText })}
        />
        <GalleryTextField
          label="Title"
          value={gallery.headerSerifLeadTitleText}
          placeholder="A curated collection of images, films, and chosen moments."
          onChange={(headerSerifLeadTitleText) => onChange({ headerSerifLeadTitleText })}
          multiline
        />
        <GalleryBandGroup title="Label">
          <GalleryPaletteSwatches
            label="Color"
            value={gallery.headerSerifLeadLabelColor ?? 'texteFort'}
            onChange={(headerSerifLeadLabelColor) => onChange({ headerSerifLeadLabelColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerSerifLeadLabelSize ?? 'md'}
            onChange={(headerSerifLeadLabelSize) => onChange({ headerSerifLeadLabelSize })}
          />
          <GalleryOptionGrid
            label="Weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerSerifLeadLabelWeight ?? 'regular'}
            onChange={(headerSerifLeadLabelWeight) => onChange({ headerSerifLeadLabelWeight })}
            columns={4}
          />
        </GalleryBandGroup>
        <GalleryBandGroup title="Title">
          <GalleryPaletteSwatches
            label="Color"
            value={gallery.headerSerifLeadTitleColor ?? 'texteFort'}
            onChange={(headerSerifLeadTitleColor) => onChange({ headerSerifLeadTitleColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerSerifLeadTitleSize ?? 'md'}
            onChange={(headerSerifLeadTitleSize) => onChange({ headerSerifLeadTitleSize })}
          />
          <GalleryOptionGrid
            label="Weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerSerifLeadTitleWeight ?? 'regular'}
            onChange={(headerSerifLeadTitleWeight) => onChange({ headerSerifLeadTitleWeight })}
            columns={4}
          />
        </GalleryBandGroup>
        <GalleryBandGroup title="Subtitle">
          <GalleryPaletteSwatches
            label="Color"
            value={gallery.headerSerifLeadSubtitleColor ?? 'texteFort'}
            onChange={(headerSerifLeadSubtitleColor) => onChange({ headerSerifLeadSubtitleColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerSerifLeadSubtitleSize ?? 'md'}
            onChange={(headerSerifLeadSubtitleSize) => onChange({ headerSerifLeadSubtitleSize })}
          />
          <GalleryOptionGrid
            label="Weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerSerifLeadSubtitleWeight ?? 'regular'}
            onChange={(headerSerifLeadSubtitleWeight) => onChange({ headerSerifLeadSubtitleWeight })}
            columns={4}
          />
        </GalleryBandGroup>
        <GalleryHeaderSharedControls gallery={gallery} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'billboard') {
    return (
      <>
        <GalleryTextField
          label="Big background word"
          value={gallery.headerBillboardBigWord}
          placeholder="GALLERY"
          onChange={(headerBillboardBigWord) => onChange({ headerBillboardBigWord })}
        />
        <GalleryTextField
          label="Title"
          value={gallery.headerBillboardTitleText}
          placeholder="Visual journal"
          onChange={(headerBillboardTitleText) => onChange({ headerBillboardTitleText })}
        />
        <GalleryTextField
          label="Count line"
          value={gallery.headerBillboardCountText}
          placeholder="{count} images — visual journal below"
          onChange={(headerBillboardCountText) => onChange({ headerBillboardCountText })}
        />
        <GalleryBandGroup title="Style">
          <GalleryOptionGrid
            label="Big word style"
            options={GALLERY_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
            value={gallery.headerBillboardWordStyle ?? 'outline'}
            onChange={(headerBillboardWordStyle) => onChange({ headerBillboardWordStyle })}
            columns={3}
          />
          <GalleryPaletteSwatches
            label="Big word color"
            value={gallery.headerBillboardWordColor ?? 'principal'}
            onChange={(headerBillboardWordColor) => onChange({ headerBillboardWordColor })}
          />
          <GalleryPaletteSwatches
            label="Title color"
            value={gallery.headerBillboardTitleColor ?? 'principal'}
            onChange={(headerBillboardTitleColor) => onChange({ headerBillboardTitleColor })}
          />
          <GalleryPaletteSwatches
            label="Count line color"
            value={gallery.headerBillboardMetaColor ?? 'secondaire'}
            onChange={(headerBillboardMetaColor) => onChange({ headerBillboardMetaColor })}
          />
        </GalleryBandGroup>
        <GalleryHeaderSharedControls gallery={gallery} onChange={onChange} hideAlignment hideTitleControls />
      </>
    );
  }

  if (design === 'masthead') {
    return (
      <>
        <GalleryTextField
          label="Line 1"
          value={gallery.headerMastheadLine1Text}
          placeholder="Visual stories."
          onChange={(headerMastheadLine1Text) => onChange({ headerMastheadLine1Text })}
        />
        <GalleryTextField
          label="Line 2"
          value={gallery.headerMastheadLine2Text}
          placeholder="Chosen with intent."
          onChange={(headerMastheadLine2Text) => onChange({ headerMastheadLine2Text })}
        />
        <GalleryTextField
          label="Line 3"
          value={gallery.headerMastheadLine3Text}
          placeholder="Captured over time."
          onChange={(headerMastheadLine3Text) => onChange({ headerMastheadLine3Text })}
        />
        <GalleryBandGroup title="Headline">
          <GalleryPaletteSwatches
            label="Color"
            value={gallery.headerMastheadHeadlineColor ?? 'principal'}
            onChange={(headerMastheadHeadlineColor) => onChange({ headerMastheadHeadlineColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerMastheadHeadlineSize ?? 'md'}
            onChange={(headerMastheadHeadlineSize) => onChange({ headerMastheadHeadlineSize })}
          />
          <GalleryOptionGrid
            label="Weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerMastheadHeadlineWeight ?? 'regular'}
            onChange={(headerMastheadHeadlineWeight) => onChange({ headerMastheadHeadlineWeight })}
            columns={4}
          />
        </GalleryBandGroup>
        <GalleryHeaderSharedControls gallery={gallery} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'split-heading') {
    return (
      <>
        <GalleryTextField
          label="Title"
          value={gallery.headerSplitHeadingTitleText}
          placeholder="Visual journal"
          onChange={(headerSplitHeadingTitleText) => onChange({ headerSplitHeadingTitleText })}
        />
        <GalleryTextField
          label="Label"
          value={gallery.headerSplitHeadingLabelText}
          placeholder="Gallery"
          onChange={(headerSplitHeadingLabelText) => onChange({ headerSplitHeadingLabelText })}
        />
        <GalleryBandGroup title="Title">
          <GalleryPaletteSwatches
            label="Color"
            value={gallery.headerSplitHeadingTitleColor ?? 'principal'}
            onChange={(headerSplitHeadingTitleColor) => onChange({ headerSplitHeadingTitleColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerSplitHeadingTitleSize ?? 'md'}
            onChange={(headerSplitHeadingTitleSize) => onChange({ headerSplitHeadingTitleSize })}
          />
          <GalleryOptionGrid
            label="Weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerSplitHeadingTitleWeight ?? 'regular'}
            onChange={(headerSplitHeadingTitleWeight) => onChange({ headerSplitHeadingTitleWeight })}
            columns={4}
          />
        </GalleryBandGroup>
        <GalleryBandGroup title="Label">
          <GalleryPaletteSwatches
            label="Color"
            value={gallery.headerSplitHeadingLabelColor ?? 'secondaire'}
            onChange={(headerSplitHeadingLabelColor) => onChange({ headerSplitHeadingLabelColor })}
          />
          <GallerySizePill
            label="Size"
            value={gallery.headerSplitHeadingLabelSize ?? 'md'}
            onChange={(headerSplitHeadingLabelSize) => onChange({ headerSplitHeadingLabelSize })}
          />
          <GalleryOptionGrid
            label="Weight"
            options={GALLERY_WEIGHT_OPTIONS}
            value={gallery.headerSplitHeadingLabelWeight ?? 'regular'}
            onChange={(headerSplitHeadingLabelWeight) => onChange({ headerSplitHeadingLabelWeight })}
            columns={4}
          />
        </GalleryBandGroup>
        <GalleryHeaderSharedControls gallery={gallery} onChange={onChange} hideAlignment hideTitleControls />
      </>
    );
  }

  // Editorial — the one design with no text of its own: it renders the section title and
  // subtitle set above, so it only exposes the shared controls.
  return (
    <>
      <p className="text-sm text-neutral-500">
        Editorial renders the section title and subtitle — set them in Section title and Subtitle above.
      </p>
      <GalleryHeaderSharedControls gallery={gallery} onChange={onChange} />
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* Design tab → Layout settings — one band per selected design, listing    */
/* only the options that design actually renders.                          */
/* ---------------------------------------------------------------------- */

const GALLERY_PLACEMENT_OPTIONS = [
  { value: 'left' as const, label: 'Left' },
  { value: 'center' as const, label: 'Center' },
  { value: 'right' as const, label: 'Right' },
];

const GALLERY_CAPTION_PAGER_OPTIONS = [
  { value: 'chevrons' as const, label: 'Chevrons' },
  { value: 'dots' as const, label: 'Dots' },
];

function GalleryLayoutSettingsBand({
  gallery,
  onChange,
}: {
  gallery: PortfolioGallerySectionSettings;
  onChange: GalleryPatch;
}) {
  const usesCarouselNav = galleryDesignUsesCarouselNav(gallery.design);
  const usesCardWidth = galleryDesignUsesCaptionCardWidth(gallery.design);
  const isFeaturedStrip = gallery.design === 'featured-strip';
  const isCaptionCarousel = gallery.design === 'caption-carousel';
  const featuredBottom = isFeaturedStrip && gallery.featuredRailPlacement === 'bottom';
  const featuredScopeIsGlobal = (gallery.featuredHeroWidthScope ?? 'hero') === 'global';
  const hasComposition = isFeaturedStrip || usesCardWidth;
  const hasNavigation = usesCarouselNav || isCaptionCarousel;

  if (!hasComposition && !hasNavigation) {
    return (
      <p className="text-xs text-neutral-400">
        This design has no options of its own — it renders straight from your media.
      </p>
    );
  }

  return (
    <GallerySettingsBand id="gallery-layout-settings-title" title="Layout settings" motionKey={gallery.design}>
      {hasComposition ? (
        <GalleryBandGroup title="Composition">
          {isFeaturedStrip ? (
            <>
              <GalleryOptionGrid
                label="Thumbnail placement"
                options={PORTFOLIO_GALLERY_FEATURED_RAIL_OPTIONS}
                value={gallery.featuredRailPlacement}
                onChange={(featuredRailPlacement) => onChange({ featuredRailPlacement })}
                columns={2}
              />
              {featuredBottom ? (
                <>
                  <GalleryOptionGrid
                    label="Apply width and placement to"
                    options={PORTFOLIO_GALLERY_FEATURED_WIDTH_SCOPE_OPTIONS}
                    value={gallery.featuredHeroWidthScope ?? 'hero'}
                    onChange={(featuredHeroWidthScope) => onChange({ featuredHeroWidthScope })}
                    columns={2}
                  />
                  <GalleryRange
                    label={featuredScopeIsGlobal ? 'Block width' : 'Main image width'}
                    value={gallery.featuredHeroWidthPercent}
                    min={50}
                    max={100}
                    suffix="%"
                    onChange={(featuredHeroWidthPercent) => onChange({ featuredHeroWidthPercent })}
                  />
                  <GalleryOptionGrid
                    label={featuredScopeIsGlobal ? 'Block placement' : 'Main image placement'}
                    options={GALLERY_PLACEMENT_OPTIONS}
                    value={gallery.featuredHeroPlacement}
                    onChange={(featuredHeroPlacement) => onChange({ featuredHeroPlacement })}
                    columns={3}
                  />
                </>
              ) : null}
            </>
          ) : null}
          {usesCardWidth ? (
            <div className="space-y-1.5">
              <GalleryRange
                label="Card width"
                value={gallery.captionCardWidthPx}
                min={180}
                max={420}
                onChange={(captionCardWidthPx) => onChange({ captionCardWidthPx })}
              />
              <p className="text-xs text-neutral-400">
                Card width only — each image keeps its own ratio: portraits get taller, cinema flatter.
              </p>
            </div>
          ) : null}
        </GalleryBandGroup>
      ) : null}

      {hasNavigation ? (
        <GalleryBandGroup title="Navigation">
          {usesCarouselNav ? (
            <div className="space-y-1.5">
              <GalleryToggleRow
                label="Navigation arrows"
                checked={gallery.showCarouselNav}
                onChange={(showCarouselNav) => onChange({ showCarouselNav })}
              />
              <p className="text-xs text-neutral-400">Previous / next buttons for scrolling galleries.</p>
            </div>
          ) : null}
          {isCaptionCarousel ? (
            <>
              <div className="space-y-1.5">
                <GalleryToggleRow
                  label="Carousel controls"
                  checked={gallery.showPagination}
                  onChange={(showPagination) => onChange({ showPagination })}
                />
                <p className="text-xs text-neutral-400">Shows the controls under the cards.</p>
              </div>
              {gallery.showPagination ? (
                <GalleryOptionGrid
                  label="Control style"
                  options={GALLERY_CAPTION_PAGER_OPTIONS}
                  value={gallery.captionPager ?? 'chevrons'}
                  onChange={(captionPager) => onChange({ captionPager })}
                  columns={2}
                />
              ) : null}
              {gallery.useHeroPalette === false ? (
                <GalleryManualColorField
                  label="Card background"
                  value={gallery.cardSurfaceColor}
                  onChange={(cardSurfaceColor) => onChange({ cardSurfaceColor })}
                />
              ) : null}
            </>
          ) : null}
        </GalleryBandGroup>
      ) : null}
    </GallerySettingsBand>
  );
}

/* ---------------------------------------------------------------------- */

export function GallerySettingsPanel({
  gallery,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  gallery: PortfolioGallerySectionSettings;
  onChange: GalleryPatch;
  subSection?: GallerySubSection;
  onSubSectionChange?: (value: GallerySubSection) => void;
}) {
  const [designCatalogOpen, setDesignCatalogOpen] = useState(false);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<GallerySubSection>('general');
  const subSection = normalizeGallerySubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: GallerySubSection) => {
    const next = normalizeGallerySubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {GALLERY_SUB_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setSubSection(section.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              subSection === section.id
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {subSection === 'general' ? (
        <div className="space-y-8">
          <div>
            <GallerySectionLabel>Visibility</GallerySectionLabel>
            <div className="mt-4">
              <GalleryVisibilityRow
                label="Show Gallery section"
                checked={gallery.enabled !== false}
                onChange={(enabled) => onChange({ enabled })}
              />
              <GalleryVisibilityRow
                label="Media titles"
                checked={gallery.showTitle}
                onChange={(showTitle) => onChange({ showTitle })}
              />
              <GalleryVisibilityRow
                label="Lightbox"
                checked={gallery.lightboxEnabled}
                onChange={(lightboxEnabled) => onChange({ lightboxEnabled })}
              />
              <GalleryVisibilityRow
                label="Hover zoom"
                checked={gallery.hoverZoom}
                onChange={(hoverZoom) => onChange({ hoverZoom })}
              />
            </div>
          </div>

          <SectionColorModeControl
            value={gallery.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />

          <GalleryOptionGrid
            label="Font size"
            options={PORTFOLIO_GALLERY_PREMIUM_FONT_SIZE_OPTIONS}
            value={gallery.premiumFontSize ?? 'medium'}
            onChange={(premiumFontSize) => onChange({ premiumFontSize })}
            columns={3}
          />
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-6">
          <GalleryDesignChoiceGrid
            showGrid={designCatalogOpen}
            setShowGrid={setDesignCatalogOpen}
            value={gallery.design}
            onChange={(design) => onChange({ design })}
          />
          {designCatalogOpen ? null : <GalleryLayoutSettingsBand gallery={gallery} onChange={onChange} />}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-4">
          <SectionBackgroundSettingsFields
            settings={gallery}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onColorChange }) => {
              // Only the solid fill has a palette binding (`sectionBackground`) — gradient and
              // split colors are stored as plain hex, so they stay on the manual picker.
              if (label === 'Color' && gallery.useHeroPalette !== false) {
                return <GalleryBackgroundColorField gallery={gallery} onChange={onChange} label={label} />;
              }
              return <GalleryManualColorField label={label} value={value} onChange={onColorChange} />;
            }}
          />
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <GalleryHeaderDesignGrid
            value={gallery.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
          />

          <GallerySettingsBand
            id="gallery-header-settings-title"
            title="Header settings"
            motionKey={gallery.headerDesign ?? 'editorial'}
          >
            <GalleryBandGroup title="Section title">
              <GalleryOptionGrid
                label="Title preset"
                hideLabel
                options={PORTFOLIO_GALLERY_TITLE_PRESET_OPTIONS}
                value={gallery.titlePreset}
                onChange={(titlePreset) => onChange({ titlePreset })}
                columns={3}
              />
              {gallery.titlePreset === 'custom' ? (
                <input
                  type="text"
                  value={gallery.titleCustom}
                  placeholder="Gallery"
                  aria-label="Custom section title"
                  onChange={(event) => onChange({ titleCustom: event.target.value })}
                  className={GALLERY_INPUT_CLASS}
                />
              ) : null}
            </GalleryBandGroup>

            <GalleryBandGroup title="Subtitle">
              <GalleryOptionGrid
                label="Subtitle preset"
                hideLabel
                options={PORTFOLIO_GALLERY_SUBTITLE_PRESET_OPTIONS}
                value={gallery.subtitlePreset}
                onChange={(subtitlePreset) => onChange({ subtitlePreset })}
                columns={3}
              />
              {gallery.subtitlePreset === 'custom' ? (
                <textarea
                  value={gallery.subtitleCustom}
                  rows={2}
                  placeholder="Images, films, and chosen moments."
                  aria-label="Custom subtitle"
                  onChange={(event) => onChange({ subtitleCustom: event.target.value })}
                  className={`${GALLERY_INPUT_CLASS} resize-y`}
                />
              ) : null}
              <p className="text-xs text-neutral-400">
                With both the title and the subtitle set to None, no header is shown at all.
              </p>
            </GalleryBandGroup>

            <GalleryHeaderDesignFields gallery={gallery} onChange={onChange} />
          </GallerySettingsBand>
        </div>
      ) : null}
    </div>
  );
}
