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
  { id: 'header', label: 'Header' },
  { id: 'background', label: 'Background' },
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
  const rows = useSettingsRows();
  if (rows) return <SettingRow label={label} toggle={{ checked, onChange }} />;
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
              {option.label}
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
          {/* Irregular masonry columns, deliberately unequal heights — the redesign's whole
              point (rule 1b: show the look, not a uniform grid that no longer exists). */}
          <rect className="pf-stack-mini-ink" x="8" y="8" width="32" height="34" rx="2.5" opacity={0.75} />
          <rect className="pf-stack-mini-ink" x="8" y="46" width="32" height="18" rx="2.5" opacity={0.5} />
          <rect className="pf-stack-mini-ink" x="44" y="8" width="32" height="20" rx="2.5" opacity={0.6} />
          <rect className="pf-stack-mini-ink" x="44" y="32" width="32" height="32" rx="2.5" opacity={0.4} />
          <rect className="pf-stack-mini-ink" x="80" y="8" width="32" height="26" rx="2.5" opacity={0.45} />
          <rect className="pf-stack-mini-ink" x="80" y="38" width="32" height="26" rx="2.5" opacity={0.28} />
        </GalleryMiniStage>
      );
    case 'floating-canvas':
      return (
        <GalleryMiniStage>
          {/* Dispersed lanes, unequal formats, nothing sharing a baseline — plus the accent pill
              sunk into the big card's bottom edge, which is the design's signature. */}
          <rect className="pf-stack-mini-ink" x="8" y="6" width="34" height="38" rx="3" opacity={0.75} />
          <rect className="pf-stack-mini-accent" x="15" y="41" width="20" height="6" rx="3" />
          <rect className="pf-stack-mini-ink" x="50" y="20" width="34" height="30" rx="3" opacity={0.5} />
          <rect className="pf-stack-mini-ink" x="58" y="56" width="26" height="10" rx="2.5" opacity={0.3} />
          <rect className="pf-stack-mini-ink" x="90" y="10" width="22" height="26" rx="2.5" opacity={0.42} />
          <rect className="pf-stack-mini-ink" x="94" y="44" width="18" height="20" rx="2.5" opacity={0.26} />
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
  open: showGrid,
  onOpenChange: setShowGrid,
}: {
  value: PortfolioGalleryHeaderDesign;
  onChange: (value: PortfolioGalleryHeaderDesign) => void;
  /** Whether the catalog of designs is open (owned by the panel so it can hide the settings below). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
            <PortfolioHeaderDesignOption key={option.value} design={option.value}>
              <GalleryPickerCard
                active={option.value === value}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <GalleryHeaderWireframe design={option.value} />
              </GalleryPickerCard>
            </PortfolioHeaderDesignOption>
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

const GALLERY_HEADER_COPY: HeaderCopy = {
  editorial: { label: 'Gallery', title: 'Visual journal', subtitle: 'Images, films, and chosen moments.' },
  index: { rule: 'Index', title: 'Visual journal', subtitle: 'Images, films, and chosen moments.', count: 'Images' },
  marquee: ['Gallery', 'Optional', 'Optional', 'Optional'],
  accent: { badge: '{count}+ moments', lead: 'A curated set of images and moments worth revisiting.' },
  serif: { label: 'Gallery', title: 'A curated collection of images, films, and chosen moments.', subtitle: 'Images, films, and chosen moments.' },
  billboard: { word: 'GALLERY', title: 'Visual journal', count: '{count} images — visual journal below' },
  masthead: ['Visual stories.', 'Chosen with intent.', 'Captured over time.'],
  split: { title: 'Visual journal', label: 'Gallery' },
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
  const isCaptionCarousel = gallery.design === 'caption-carousel';
  const hasComposition = usesCardWidth;
  const hasNavigation = usesCarouselNav || isCaptionCarousel;
  const isHeroMosaic = gallery.design === 'hero-mosaic';
  const isFramedGrid = gallery.design === 'framed-grid';
  const isFloatingCanvas = gallery.design === 'floating-canvas';

  if (!hasComposition && !hasNavigation && !isHeroMosaic && !isFramedGrid && !isFloatingCanvas) {
    return (
      <p className="text-xs text-neutral-400">
        This design has no options of its own — it renders straight from your media.
      </p>
    );
  }

  return (
    <GallerySettingsBand id="gallery-layout-settings-title" title="Layout settings" motionKey={gallery.design}>
<SettingsRowsScope title="Layout options">
      {isHeroMosaic ? (
        <GalleryBandGroup title="Hover">
          <GalleryToggleRow
            label="Focus on hover"
            checked={gallery.mosaicFocusEnabled !== false}
            onChange={(mosaicFocusEnabled) => onChange({ mosaicFocusEnabled })}
          />
        </GalleryBandGroup>
      ) : null}
      {isFloatingCanvas ? (
        <>
          <GalleryBandGroup title="Canvas">
            <GalleryOptionGrid
              label="Lanes"
              options={PORTFOLIO_GALLERY_FLOATING_CANVAS_LANE_OPTIONS}
              value={gallery.floatingCanvasLanes ?? '3'}
              onChange={(floatingCanvasLanes) => onChange({ floatingCanvasLanes })}
              columns={2}
            />
            <GalleryOptionGrid
              label="Dispersion"
              options={PORTFOLIO_GALLERY_FLOATING_CANVAS_DISPERSION_OPTIONS}
              value={gallery.floatingCanvasDispersion ?? 'medium'}
              onChange={(floatingCanvasDispersion) => onChange({ floatingCanvasDispersion })}
              columns={4}
            />
            <GalleryOptionGrid
              label="Scroll parallax"
              options={PORTFOLIO_GALLERY_FLOATING_CANVAS_PARALLAX_OPTIONS}
              value={gallery.floatingCanvasParallax ?? 'medium'}
              onChange={(floatingCanvasParallax) => onChange({ floatingCanvasParallax })}
              columns={4}
            />
          </GalleryBandGroup>
          <GalleryBandGroup title="Title badge">
            <GalleryOptionGrid
              label="Badge style"
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
        <GalleryBandGroup title="Motion & title">
          <GalleryOptionGrid
            label="Scroll parallax"
            options={PORTFOLIO_GALLERY_FRAMED_GRID_PARALLAX_OPTIONS}
            value={gallery.framedGridParallax ?? 'medium'}
            onChange={(framedGridParallax) => onChange({ framedGridParallax })}
            columns={4}
          />
          <GalleryOptionGrid
            label="Hover title style"
            options={PORTFOLIO_GALLERY_FRAMED_GRID_TITLE_STYLE_OPTIONS}
            value={gallery.framedGridTitleStyle ?? 'serif'}
            onChange={(framedGridTitleStyle) => onChange({ framedGridTitleStyle })}
            columns={2}
          />
          <div className="space-y-1.5">
            <GalleryToggleRow
              label="Monochrome-to-color hover"
              checked={gallery.framedGridColorReveal !== false}
              onChange={(framedGridColorReveal) => onChange({ framedGridColorReveal })}
            />
            <p className="text-xs text-neutral-400">
              Images cool to a muted monochrome at rest, then bloom to full color on hover.
            </p>
          </div>
        </GalleryBandGroup>
      ) : null}
      {hasComposition ? (
        <GalleryBandGroup title="Composition">
          {usesCardWidth ? (
            <div className="space-y-1.5">
              <GalleryRange
                label="Image size"
                value={gallery.captionCardWidthPx}
                min={180}
                max={420}
                onChange={(captionCardWidthPx) => onChange({ captionCardWidthPx })}
              />
              <p className="text-xs text-neutral-400">
                Scales the plates. With a ratio set they share one height and their widths vary; with
                Original ratio each keeps its own proportions.
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
            </>
          ) : null}
        </GalleryBandGroup>
      ) : null}
    </SettingsRowsScope>
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
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(false);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<GallerySubSection>('general');
  const subSection = normalizeGallerySubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: GallerySubSection) => {
    const next = normalizeGallerySubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };

  return (
    <div className="space-y-6">
      <div className="pf-subtabs" role="tablist" aria-label="Settings sections">
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
            open={headerCatalogOpen}
            onOpenChange={setHeaderCatalogOpen}
          />

          {/* Browsing the catalog is a different task from tuning the chosen design: no settings below it. */}
          {headerCatalogOpen ? null : (
            <GallerySettingsBand id="gallery-header-settings-title" title="Header settings" motionKey={gallery.headerDesign ?? 'editorial'} flush>
              <GalleryHeaderDesignFields gallery={gallery} onChange={onChange} />
            </GallerySettingsBand>
          )}
        </div>
      ) : null}
    </div>
  );
}
