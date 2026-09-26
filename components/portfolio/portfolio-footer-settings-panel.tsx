'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { PortfolioSettingsPhotoField } from '@/components/portfolio/portfolio-settings-photo-field';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_FOOTER_COLOR_BINDINGS,
  DEFAULT_FOOTER_PALETTE,
  mergeFooterColorBindings,
  mergeFooterPalette,
  patchFooterColorBinding,
  patchFooterColorFieldManual,
  type FooterColorSlot,
} from '@/components/portfolio/portfolio-footer-palette-settings';
import {
  PORTFOLIO_FOOTER_DESIGN_OPTIONS,
  PORTFOLIO_FOOTER_MINI_BAR_DESIGN_OPTIONS,
  PORTFOLIO_FOOTER_PREMIUM_FONT_SIZE_OPTIONS,
  FOOTER_CONTACT_CARD_COLOR_TOKEN_OPTIONS,
  DEFAULT_FOOTER_LINK_COLUMNS,
  DEFAULT_FOOTER_LANDING_BRAND_GAP_PX,
  isLegacyLandingMarketingColumns,
  type PortfolioFooterDesign,
  type PortfolioFooterMiniBarDesign,
  type PortfolioFooterContactCardColorToken,
  type PortfolioFooterSectionSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import { FooterMiniBarMinimalWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-minimal';
import { FooterMiniBarKineticWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-kinetic';
import { FooterMiniBarSplitCapsWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-split-caps';
import { FooterMiniBarLandingWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-landing';
import { FooterMiniBarContactCtaWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-contact-cta';
import { FooterMiniBarHeroColumnsWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-hero-columns';
import { FooterMiniBarInvertedWordmarkWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-inverted-wordmark';
import { FooterMiniBarServicesRevealWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-services-reveal';
import { FooterHeroColumnsWireframe } from '@/components/portfolio/portfolio-footer-design-hero-columns';
import { FooterSplitFormWireframe } from '@/components/portfolio/portfolio-footer-design-split-form';
import { FooterTimezoneEditorialWireframe } from '@/components/portfolio/portfolio-footer-design-timezone-editorial';
import { FooterInvertedWordmarkWireframe } from '@/components/portfolio/portfolio-footer-design-inverted-wordmark';
import { FooterServicesRevealWireframe } from '@/components/portfolio/portfolio-footer-design-services-reveal';
import { FooterEditorialGridWireframe } from '@/components/portfolio/portfolio-footer-design-editorial-grid';
import { FooterHeadlineRevealWireframe } from '@/components/portfolio/portfolio-footer-design-headline-reveal';
import { FooterDispatchWireframe } from '@/components/portfolio/portfolio-footer-design-dispatch';
import { FooterCompactWireframe } from '@/components/portfolio/portfolio-footer-design-compact';
import { FooterCenteredMinimalWireframe } from '@/components/portfolio/portfolio-footer-design-centered-minimal';
import { FooterLandingWireframe } from '@/components/portfolio/portfolio-footer-design-landing';
import { FooterContactCardWireframe } from '@/components/portfolio/portfolio-footer-design-contact-card';
import {
  FOOTER_DESIGN_LAYOUT_SPECS,
  footerLayoutOverride,
  patchFooterLayoutElement,
  patchFooterSectionLink,
  resolveFooterLayoutBioCustom,
  resolveFooterLayoutBioSource,
  resolveFooterLayoutOption,
  resolveFooterLayoutTarget,
  resolveFooterLayoutVisible,
  resolveFooterSelectedSectionIds,
  type FooterContactTargetMode,
  type FooterLayoutBioSpec,
  type FooterLayoutElementSpec,
  type FooterLayoutOptionSpec,
  type FooterLayoutTargetSpec,
  type FooterLayoutTextSpec,
  type PortfolioFooterSectionLinkOption,
} from '@/components/portfolio/portfolio-footer-design-layout';
import {
  PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS,
  FOOTER_HEADER_PALETTE_TOKEN_OPTIONS,
  FOOTER_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  footerHeaderPaletteTokenColor,
  type PortfolioFooterHeaderDesign,
  type PortfolioFooterHeaderTitleSize,
  type PortfolioFooterHeaderPaletteToken,
} from '@/components/portfolio/portfolio-footer-header-settings';

function FooterMinimalCtaWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <rect className="pf-stack-mini-ink" x="8" y="12" width="30" height="6" rx="2" />
      <rect className="pf-stack-mini-mute" x="8" y="24" width="60" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="8" y="30" width="46" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-accent" x="8" y="40" width="26" height="8" rx="4" />
      <rect className="pf-stack-mini-mute" x="8" y="58" width="20" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x="32" y="58" width="20" height="2" rx="1" />
      <circle className="pf-stack-mini-ring" cx="100" cy="59" r="4" strokeWidth={1.2} />
      <circle className="pf-stack-mini-ring" cx="110" cy="59" r="4" strokeWidth={1.2} />
    </svg>
  );
}

function FooterMonumentalWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <rect className="pf-stack-mini-ink" x="6" y="10" width="70" height="11" rx="2" />
      <rect className="pf-stack-mini-ink" x="6" y="24" width="46" height="11" rx="2" opacity={0.55} />
      <rect className="pf-stack-mini-mute" x="80" y="14" width="32" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="80" y="21" width="32" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="80" y="28" width="20" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="6" y="50" width="108" height="16" rx="3" opacity={0.18} />
    </svg>
  );
}

/** Abstract mini-schema preview for every "Section design" option — one wireframe per
 *  design, no exceptions, matching the thumbnail convention already used by Info/Stack/
 *  Services/Work's own design pickers (see the "Settings design standard" rules). */
function FooterDesignWireframe({ design }: { design: PortfolioFooterDesign }) {
  switch (design) {
    case 'centered-minimal':
      return <FooterCenteredMinimalWireframe />;
    case 'landing':
      return <FooterLandingWireframe />;
    case 'minimal':
      return <FooterMinimalCtaWireframe />;
    case 'contact-card':
      return <FooterContactCardWireframe />;
    case 'monumental':
      return <FooterMonumentalWireframe />;
    case 'hero-columns':
      return <FooterHeroColumnsWireframe />;
    case 'split-form':
      return <FooterSplitFormWireframe />;
    case 'timezone-editorial':
      return <FooterTimezoneEditorialWireframe />;
    case 'inverted-wordmark':
      return <FooterInvertedWordmarkWireframe />;
    case 'services-reveal':
      return <FooterServicesRevealWireframe />;
    case 'editorial-grid':
      return <FooterEditorialGridWireframe />;
    case 'headline-reveal':
      return <FooterHeadlineRevealWireframe />;
    case 'dispatch':
      return <FooterDispatchWireframe />;
    case 'compact':
      return <FooterCompactWireframe />;
    default:
      return null;
  }
}

/** Expanded-grid card: wireframe + name only — no description paragraph (see the
 *  "Settings design standard" text-reduction rule). Tinted background (no visible border on
 *  rest); the selected card's only signal is its label switching to the accent color (plus a
 *  faint accent-tinted card background) — no stripe, no floating badge. Hover lift/brighten —
 *  see `.pf-footer-design-card` in globals.css. */
function FooterPickerCard({
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
      className="pf-footer-design-card relative rounded-2xl p-2.5 text-left"
    >
      {children}
      <span
        className="pf-footer-card-label mt-2 block text-sm font-semibold leading-none tracking-tight"
      >
        {label}
      </span>
    </button>
  );
}

/** Collapsed-state row: a compact thumbnail, the selected design's name, and a trailing
 *  chevron — the whole row opens the grid. Mirrors Work/Services' own summary row 1:1. */
function FooterDesignSummaryRow({
  name,
  onOpen,
  children,
}: {
  name: string;
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <FooterSectionLabel>Design</FooterSectionLabel>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Change section design"
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

/** The main "Section design" picker — collapses to the selected design; click to expand
 *  and change. Mirrors Work/Services' `*DesignChoiceGrid` pattern 1:1 for consistency. */
function FooterDesignChoiceGrid({
  value,
  onChange,
  showGrid,
  setShowGrid,
}: {
  value: PortfolioFooterDesign;
  onChange: (value: PortfolioFooterDesign) => void;
  /** Owned by the panel so the selected design's Layout settings can hide while the catalogue is open. */
  showGrid: boolean;
  setShowGrid: (open: boolean) => void;
}) {
  const selected =
    PORTFOLIO_FOOTER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_FOOTER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <FooterSectionLabel>Section design</FooterSectionLabel>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_FOOTER_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <FooterPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <FooterDesignWireframe design={option.value} />
              </FooterPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <FooterDesignSummaryRow name={selected.label} onOpen={() => setShowGrid(true)}>
      <FooterDesignWireframe design={value} />
    </FooterDesignSummaryRow>
  );
}

function FooterMiniBarWireframe({ design }: { design: PortfolioFooterMiniBarDesign }) {
  switch (design) {
    case 'kinetic':
      return <FooterMiniBarKineticWireframe />;
    case 'split-caps':
      return <FooterMiniBarSplitCapsWireframe />;
    case 'landing':
      return <FooterMiniBarLandingWireframe />;
    case 'contact-cta':
      return <FooterMiniBarContactCtaWireframe />;
    case 'hero-columns':
      return <FooterMiniBarHeroColumnsWireframe />;
    case 'inverted-wordmark':
      return <FooterMiniBarInvertedWordmarkWireframe />;
    case 'services-reveal':
      return <FooterMiniBarServicesRevealWireframe />;
    default:
      return <FooterMiniBarMinimalWireframe />;
  }
}

/** 8 options — a static inline grid (no expand/collapse summary row needed, unlike the
 *  main 13-option Section design picker above). */
function FooterMiniBarDesignGrid({
  value,
  onChange,
}: {
  value: PortfolioFooterMiniBarDesign;
  onChange: (value: PortfolioFooterMiniBarDesign) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {PORTFOLIO_FOOTER_MINI_BAR_DESIGN_OPTIONS.map((option) => (
        <FooterPickerCard
          key={option.value}
          active={option.value === value}
          label={option.label}
          onClick={() => onChange(option.value)}
        >
          <FooterMiniBarWireframe design={option.value} />
        </FooterPickerCard>
      ))}
    </div>
  );
}

export type FooterSubSection = 'general' | 'design' | 'background' | 'header';

const FOOTER_SUB_SECTIONS: { id: FooterSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility and defaults.' },
  { id: 'design', label: 'Design', description: 'Layout and visual style.' },
  { id: 'background', label: 'Background', description: 'Fill behind this section.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
];

/** Map legacy subsection ids (saved UI state / search) onto the current Footer menu. */
export function normalizeFooterSubSection(value: string | undefined): FooterSubSection {
  if (value === 'general' || value === 'design' || value === 'background' || value === 'header') {
    return value;
  }
  return 'general';
}

function asFooterPatch(patch: Record<string, unknown> | object): Partial<PortfolioFooterSectionSettings> {
  return patch as Partial<PortfolioFooterSectionSettings>;
}

/** Same animated switch as Services/Contact/Info's settings panels — shared settings-UI chrome. */
function FooterSwitchTrack({ checked }: { checked: boolean }) {
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

function FooterToggleRow({
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
        <FooterSwitchTrack checked={checked} />
      </span>
    </button>
  );
}

/** One-per-line visibility row (hairline divider), same pattern as Contact's General tab. */
function FooterVisibilityRow({
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
        <FooterSwitchTrack checked={checked} />
      </button>
    </div>
  );
}

function FooterSectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{children}</p>;
}

function FooterGroupLabel({ children }: { children: string }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{children}</p>;
}

/* ---------------------------------------------------------------------- */
/* Header tab — the shared 8-design GSAP Header mechanism (see Info/Work/  */
/* Team/etc.), mounted above the Footer section independent of its own    */
/* `design`. Small local segmented/pill/swatch controls, matching this     */
/* file's own Tailwind-inline styling rather than Work's CSS-class set.    */
/* ---------------------------------------------------------------------- */

function FooterOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
  hideLabel = false,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4 | 5;
  /** Keeps `label` as the accessible name only — for a pill that sits right under its toggle. */
  hideLabel?: boolean;
}) {
  return (
    <div>
      {hideLabel ? null : <FooterGroupLabel>{label}</FooterGroupLabel>}
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

const FOOTER_HEADER_SIZE_PILL_OPTIONS: { value: PortfolioFooterHeaderTitleSize; label: string; fontPx: number }[] = [
  { value: 'sm', label: 'S', fontPx: 12 },
  { value: 'md', label: 'M', fontPx: 15 },
  { value: 'lg', label: 'L', fontPx: 18 },
  { value: 'xl', label: 'XL', fontPx: 22 },
];

function FooterHeaderSizePill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioFooterHeaderTitleSize;
  onChange: (value: PortfolioFooterHeaderTitleSize) => void;
}) {
  return (
    <div>
      <FooterGroupLabel>{label}</FooterGroupLabel>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-4 gap-1.5">
        {FOOTER_HEADER_SIZE_PILL_OPTIONS.map((option) => {
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

function FooterHeaderPaletteSwatches({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioFooterHeaderPaletteToken;
  onChange: (value: PortfolioFooterHeaderPaletteToken) => void;
}) {
  return (
    <div>
      <FooterGroupLabel>{label}</FooterGroupLabel>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-3 gap-1.5">
        {FOOTER_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => {
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
                style={{ backgroundColor: footerHeaderPaletteTokenColor(option.value) }}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FooterHeaderTextField({
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
      <FooterSectionLabel>{label}</FooterSectionLabel>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={2}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
        />
      )}
    </div>
  );
}

function FooterHeaderMiniWireframe({ design }: { design: PortfolioFooterHeaderDesign }) {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {design === 'none' ? (
        <rect className="pf-stack-mini-mute" x="44" y="34" width="32" height="2.5" rx="1.25" opacity={0.5} />
      ) : design === 'billboard' ? (
        <>
          <rect className="pf-stack-mini-mute" x="4" y="10" width="112" height="24" rx="2" opacity={0.35} />
          <rect className="pf-stack-mini-ink" x="8" y="46" width="50" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="58" width="30" height="2.5" rx="1.25" />
        </>
      ) : design === 'masthead' ? (
        <>
          <rect className="pf-stack-mini-ink" x="8" y="12" width="90" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="70" height="10" rx="2" opacity={0.6} />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="80" height="10" rx="2" opacity={0.3} />
        </>
      ) : design === 'index' ? (
        <>
          <rect className="pf-stack-mini-mute" x="8" y="14" width="104" height="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="22" height="18" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="40" y="26" width="1.5" height="18" />
          <rect className="pf-stack-mini-ink" x="50" y="28" width="60" height="8" rx="2" />
        </>
      ) : design === 'serif-lead' ? (
        <>
          <rect className="pf-stack-mini-mute" x="8" y="14" width="24" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="100" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="70" height="10" rx="2" opacity={0.5} />
        </>
      ) : design === 'hero' ? (
        <>
          <rect className="pf-stack-mini-ink" x="22" y="14" width="76" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="30" y="28" width="60" height="10" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-accent" x="42" y="48" width="36" height="10" rx="5" />
        </>
      ) : design === 'name' ? (
        <>
          <rect className="pf-stack-mini-ink" x="4" y="24" width="112" height="24" rx="2" />
        </>
      ) : design === 'timezone' ? (
        <>
          <rect className="pf-stack-mini-mute" x="8" y="12" width="18" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="8" y="20" width="44" height="8" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="30" width="36" height="8" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="8" y="42" width="30" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="86" y="12" width="24" height="6" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="92" y="20" width="18" height="2.5" rx="1.25" />
        </>
      ) : (
        <>
          <rect className="pf-stack-mini-ink" x="8" y="16" width="104" height="12" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="34" width="70" height="12" rx="2" opacity={0.55} />
          <rect className="pf-stack-mini-mute" x="8" y="54" width="46" height="2.5" rx="1.25" />
        </>
      )}
    </svg>
  );
}

function FooterHeaderDesignGrid({
  value,
  onChange,
}: {
  value: PortfolioFooterHeaderDesign;
  onChange: (value: PortfolioFooterHeaderDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <FooterSectionLabel>Header design</FooterSectionLabel>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <FooterPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <FooterHeaderMiniWireframe design={option.value} />
              </FooterPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <FooterDesignSummaryRow name={selected.label} onOpen={() => setShowGrid(true)}>
      <FooterHeaderMiniWireframe design={value} />
    </FooterDesignSummaryRow>
  );
}

function FooterManualColorField({
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
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
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

/** Palette-bound color field — dropdown of theme tokens when the Hero palette is on,
 *  manual hex picker when it's off. Same mechanism as Services/FAQ/Stack's own color fields. */
function FooterColorField({
  footer,
  onChange,
  slot,
  label,
  value,
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
  slot: FooterColorSlot;
  label: string;
  value: string;
}) {
  if (footer.useHeroPalette === false) {
    return (
      <FooterManualColorField
        label={label}
        value={value}
        onChange={(hex) => onChange(asFooterPatch(patchFooterColorFieldManual(footer, slot, hex)))}
      />
    );
  }

  const palette = mergeFooterPalette(DEFAULT_FOOTER_PALETTE, footer.footerPalette);
  const bindings = mergeFooterColorBindings(DEFAULT_FOOTER_COLOR_BINDINGS, footer.footerColorBindings);
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
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
          onChange(asFooterPatch(patchFooterColorBinding(footer, slot, event.target.value as HeroPaletteTokenId)))
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
/* Design tab → Layout settings — one band per selected design, generated  */
/* from FOOTER_DESIGN_LAYOUT_SPECS so each design only lists what it       */
/* actually renders (links, identity, editable words).                     */
/* ---------------------------------------------------------------------- */

type FooterLayoutPatch = (patch: Partial<PortfolioFooterSectionSettings>) => void;

const FOOTER_LAYOUT_INPUT_CLASS =
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400';

const FOOTER_BIO_SOURCE_OPTIONS = [
  { value: 'bio' as const, label: 'Profile bio' },
  { value: 'custom' as const, label: 'Custom' },
];

/** Groups longer than this start collapsed (Settings design standard, rule 5). */
const FOOTER_LAYOUT_COLLAPSE_AFTER = 5;

function FooterSectionLinksPicker({
  footer,
  options,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  options: PortfolioFooterSectionLinkOption[];
  onChange: FooterLayoutPatch;
}) {
  const selected = new Set(resolveFooterSelectedSectionIds(footer, footer.design));
  const selectedCount = options.filter((option) => selected.has(option.id)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <FooterGroupLabel>Section links</FooterGroupLabel>
        {options.length > 0 ? (
          <span className="text-[11px] font-semibold tabular-nums text-neutral-400">
            {selectedCount}/{options.length}
          </span>
        ) : null}
      </div>
      {options.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {options.map((option) => (
            <FooterToggleRow
              key={option.id}
              label={option.label}
              checked={selected.has(option.id)}
              onChange={(checked) => onChange(patchFooterSectionLink(footer, footer.design, option.id, checked))}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-400">Visible sections will appear here.</p>
      )}
    </div>
  );
}

function FooterLayoutTextField({
  footer,
  spec,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  spec: FooterLayoutTextSpec;
  onChange: FooterLayoutPatch;
}) {
  const design = footer.design;
  const hideable = spec.hideable !== false;
  const visible = resolveFooterLayoutVisible(footer, design, spec.key);
  const value = footerLayoutOverride(footer, design, spec.key)?.text ?? '';
  const placeholder = spec.defaultText(footer).trim() || spec.placeholder || '';
  const setText = (text: string) => onChange(patchFooterLayoutElement(footer, design, spec.key, { text }));

  return (
    <div className="space-y-2">
      {hideable ? (
        <FooterToggleRow
          label={spec.label}
          checked={visible}
          onChange={(checked) => onChange(patchFooterLayoutElement(footer, design, spec.key, { visible: checked }))}
        />
      ) : (
        <p className="text-sm font-medium text-neutral-950">{spec.label}</p>
      )}
      {visible ? (
        spec.multiline ? (
          <textarea
            value={value}
            placeholder={placeholder}
            rows={2}
            aria-label={spec.label}
            onChange={(event) => setText(event.target.value)}
            className={`${FOOTER_LAYOUT_INPUT_CLASS} resize-y`}
          />
        ) : (
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            aria-label={spec.label}
            onChange={(event) => setText(event.target.value)}
            className={FOOTER_LAYOUT_INPUT_CLASS}
          />
        )
      ) : null}
    </div>
  );
}

function FooterLayoutBioField({
  footer,
  spec,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  spec: FooterLayoutBioSpec;
  onChange: FooterLayoutPatch;
}) {
  const design = footer.design;
  const visible = resolveFooterLayoutVisible(footer, design, spec.key);
  const source = resolveFooterLayoutBioSource(footer, design, spec.key);

  return (
    <div className="space-y-2.5">
      <FooterToggleRow
        label={spec.label}
        checked={visible}
        onChange={(checked) => onChange(patchFooterLayoutElement(footer, design, spec.key, { visible: checked }))}
      />
      {visible ? (
        <>
          <FooterOptionGrid
            label={`${spec.label} source`}
            hideLabel
            options={FOOTER_BIO_SOURCE_OPTIONS}
            value={source}
            onChange={(next) => onChange(patchFooterLayoutElement(footer, design, spec.key, { source: next }))}
          />
          {source === 'custom' ? (
            <textarea
              value={resolveFooterLayoutBioCustom(footer, design, spec.key)}
              rows={3}
              aria-label={`${spec.label} text`}
              onChange={(event) =>
                onChange(patchFooterLayoutElement(footer, design, spec.key, { text: event.target.value }))
              }
              className={`${FOOTER_LAYOUT_INPUT_CLASS} resize-y`}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function FooterLayoutOptionField({
  footer,
  spec,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  spec: FooterLayoutOptionSpec;
  onChange: FooterLayoutPatch;
}) {
  const value = resolveFooterLayoutOption(footer, footer.design, spec.key);
  const setValue = (choice: string) =>
    onChange(patchFooterLayoutElement(footer, footer.design, spec.key, { choice }));

  if (!spec.options.some((option) => option.swatch)) {
    return (
      <FooterOptionGrid
        label={spec.label}
        options={spec.options}
        value={value}
        onChange={setValue}
        columns={Math.min(spec.options.length, 4) as 2 | 3 | 4}
      />
    );
  }

  return (
    <div>
      <FooterGroupLabel>{spec.label}</FooterGroupLabel>
      <div role="radiogroup" aria-label={spec.label} className="mt-2 grid grid-cols-2 gap-1.5">
        {spec.options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setValue(option.value)}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
                active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
                style={{ backgroundColor: option.swatch }}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type FooterContactLinkOption = { id: string; label: string; href: string };

/** The profile's own contact links (from the live preview) — offered by "Button link" pickers. */
const FooterContactLinkOptionsContext = createContext<FooterContactLinkOption[]>([]);

const FOOTER_CONTACT_TARGET_OPTIONS: { value: FooterContactTargetMode; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'link', label: 'Link' },
];

const FOOTER_CUSTOM_LINK_VALUE = '__custom';

function FooterLayoutTargetField({
  footer,
  spec,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  spec: FooterLayoutTargetSpec;
  onChange: FooterLayoutPatch;
}) {
  const design = footer.design;
  const linkOptions = useContext(FooterContactLinkOptionsContext);
  const target = resolveFooterLayoutTarget(footer, design, spec.key);
  // Raw saved text (not the sanitized href) so the input never rewrites what the creator types.
  const rawUrl = footerLayoutOverride(footer, design, spec.key)?.text ?? '';
  const matchesProfileLink = linkOptions.some((option) => option.href === rawUrl);
  const [customLink, setCustomLink] = useState(Boolean(rawUrl.trim()) && !matchesProfileLink);
  const showCustomInput = customLink || linkOptions.length === 0;
  const patch = (next: { choice?: string; text?: string }) =>
    onChange(patchFooterLayoutElement(footer, design, spec.key, next));

  return (
    <div className="space-y-2">
      <FooterOptionGrid
        label={spec.label}
        options={FOOTER_CONTACT_TARGET_OPTIONS}
        value={target.mode}
        onChange={(mode) => patch({ choice: mode })}
        columns={3}
      />
      {target.mode === 'link' ? (
        <>
          {linkOptions.length > 0 ? (
            <select
              aria-label={`${spec.label} destination`}
              value={showCustomInput ? FOOTER_CUSTOM_LINK_VALUE : matchesProfileLink ? rawUrl : ''}
              onChange={(event) => {
                const value = event.target.value;
                if (value === FOOTER_CUSTOM_LINK_VALUE) {
                  setCustomLink(true);
                  patch({ text: '' });
                  return;
                }
                setCustomLink(false);
                patch({ text: value });
              }}
              className={FOOTER_LAYOUT_INPUT_CLASS}
            >
              <option value="" disabled>
                Choose a link
              </option>
              {linkOptions.map((option) => (
                <option key={option.id} value={option.href}>
                  {option.label}
                </option>
              ))}
              <option value={FOOTER_CUSTOM_LINK_VALUE}>Custom URL</option>
            </select>
          ) : null}
          {showCustomInput ? (
            <input
              type="url"
              value={matchesProfileLink ? '' : rawUrl}
              placeholder="https://"
              aria-label={`${spec.label} URL`}
              onChange={(event) => patch({ text: event.target.value })}
              className={FOOTER_LAYOUT_INPUT_CLASS}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function FooterLayoutElementControl({
  footer,
  spec,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  spec: FooterLayoutElementSpec;
  onChange: FooterLayoutPatch;
}) {
  switch (spec.kind) {
    case 'target':
      return <FooterLayoutTargetField footer={footer} spec={spec} onChange={onChange} />;
    case 'toggle':
      return (
        <FooterToggleRow
          label={spec.label}
          checked={resolveFooterLayoutVisible(footer, footer.design, spec.key)}
          onChange={(checked) =>
            onChange(patchFooterLayoutElement(footer, footer.design, spec.key, { visible: checked }))
          }
        />
      );
    case 'choice':
      return (
        <FooterOptionGrid
          label={spec.label}
          hideLabel
          options={spec.options}
          value={footer[spec.field] ?? spec.options[0].value}
          onChange={(value) => onChange({ [spec.field]: value })}
          columns={spec.options.length as 2 | 3 | 4}
        />
      );
    case 'option':
      return <FooterLayoutOptionField footer={footer} spec={spec} onChange={onChange} />;
    case 'bio':
      return <FooterLayoutBioField footer={footer} spec={spec} onChange={onChange} />;
    case 'text':
      return <FooterLayoutTextField footer={footer} spec={spec} onChange={onChange} />;
  }
}

function FooterLayoutGroup({
  title,
  elements,
  footer,
  onChange,
}: {
  title: string;
  elements: FooterLayoutElementSpec[];
  footer: PortfolioFooterSectionSettings;
  onChange: FooterLayoutPatch;
}) {
  const collapsible = elements.length > FOOTER_LAYOUT_COLLAPSE_AFTER;
  const [open, setOpen] = useState(!collapsible);
  const toggles = elements.filter((element) => element.kind === 'toggle');
  const rest = elements.filter((element) => element.kind !== 'toggle');

  return (
    <div className="space-y-3">
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-baseline gap-2">
            <FooterGroupLabel>{title}</FooterGroupLabel>
            <span className="text-[11px] font-semibold tabular-nums text-neutral-400">{elements.length}</span>
          </span>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
            className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <FooterGroupLabel>{title}</FooterGroupLabel>
      )}
      {open ? (
        <div className="space-y-5">
          {toggles.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {toggles.map((spec) => (
                <FooterLayoutElementControl key={spec.key} footer={footer} spec={spec} onChange={onChange} />
              ))}
            </div>
          ) : null}
          {rest.map((spec) => (
            <FooterLayoutElementControl key={spec.key} footer={footer} spec={spec} onChange={onChange} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Contact card design only — 4 palette-token swatches for the left info card's fill.
 *  Same big-circle-swatch pattern as Services Pricing Grid/Aurora's "Featured card color". */
function FooterContactCardColorBand({
  footer,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
}) {
  const palette = mergeFooterPalette(DEFAULT_FOOTER_PALETTE, footer.footerPalette);
  const current: PortfolioFooterContactCardColorToken = footer.contactCardColorToken ?? 'principal';

  return (
    <section className="pf-exp-layout-settings" aria-labelledby="footer-contact-card-color-title">
      <h3 id="footer-contact-card-color-title" className="pf-exp-layout-settings-title">
        Contact card options
      </h3>
      <div className="pf-exp-layout-settings-body">
        <FooterGroupLabel>Card background color</FooterGroupLabel>
        <div className="mt-3 flex flex-wrap gap-3">
          {FOOTER_CONTACT_CARD_COLOR_TOKEN_OPTIONS.map((option) => {
            const hex = resolveHeroPaletteColor(palette, option.value);
            const active = current === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ contactCardColorToken: option.value })}
                aria-pressed={active}
                aria-label={option.label}
                title={option.label}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition ${
                  active ? 'ring-2 ring-neutral-900 ring-offset-2' : 'hover:bg-neutral-100'
                }`}
              >
                <span
                  className="h-9 w-9 rounded-full border border-neutral-200/80 shadow-inner"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-[11px] font-medium text-neutral-500">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FooterLayoutSettingsBand({
  footer,
  sectionLinkOptions,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  sectionLinkOptions: PortfolioFooterSectionLinkOption[];
  onChange: FooterLayoutPatch;
}) {
  const spec = FOOTER_DESIGN_LAYOUT_SPECS[footer.design];
  if (!spec) return null;
  // "Identity" (name/avatar/portrait/bio/watermark show-hide + style) is intentionally not
  // surfaced here — identity content is configured once in the account's own General/profile
  // settings, so exposing a second per-design override for it in Layout settings was redundant.
  // Elements still render at their spec default (`defaultVisible`/`defaultText`/`defaultValue`);
  // only the ability to override them per Footer design from this panel was removed.
  const elements = spec.elements.filter(
    (element) => element.group !== 'identity' && (!element.showWhen || element.showWhen(footer))
  );
  // The giant decorative name (Inverted wordmark, Monumental / Timezone watermark) is styling, not
  // identity — it keeps its own group so hiding Identity doesn't take these controls with it.
  const wordmark = elements.filter((element) => element.group === 'wordmark');
  const text = elements.filter((element) => element.group === 'text');
  const headings = elements.filter((element) => element.group === 'labels');
  const hasLayoutContent = Boolean(spec.sectionLinks) || elements.length > 0;
  if (!hasLayoutContent) return null;

  return (
    <section className="pf-exp-layout-settings" aria-labelledby="footer-layout-settings-title">
      <h3 id="footer-layout-settings-title" className="pf-exp-layout-settings-title">
        Layout settings
      </h3>
      <div key={footer.design} className="pf-exp-layout-settings-body space-y-7">
        {spec.sectionLinks ? (
          <FooterSectionLinksPicker footer={footer} options={sectionLinkOptions} onChange={onChange} />
        ) : null}
        {wordmark.length > 0 ? (
          <FooterLayoutGroup title="Wordmark" elements={wordmark} footer={footer} onChange={onChange} />
        ) : null}
        {text.length > 0 ? (
          <FooterLayoutGroup title="Text" elements={text} footer={footer} onChange={onChange} />
        ) : null}
        {headings.length > 0 ? (
          <FooterLayoutGroup title="Headings" elements={headings} footer={footer} onChange={onChange} />
        ) : null}
      </div>
    </section>
  );
}

const FOOTER_BACKGROUND_LABEL_SLOTS: Record<string, FooterColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Color A': 'sectionSplitA',
  'Color B': 'sectionSplitB',
};

export function FooterSettingsPanel({
  footer,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  sectionLinkOptions = [],
  profileAvatarUrl = null,
  contactLinkOptions = [],
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
  subSection?: FooterSubSection;
  onSubSectionChange?: (value: FooterSubSection) => void;
  /** Sections currently visible in the live preview — the Layout settings link picker. */
  sectionLinkOptions?: PortfolioFooterSectionLinkOption[];
  /** Account profile photo — shown in General → Photo until a custom one replaces it. */
  profileAvatarUrl?: string | null;
  /** Profile contact links — destinations offered by Layout settings "Button link" pickers. */
  contactLinkOptions?: FooterContactLinkOption[];
}) {
  const [designCatalogOpen, setDesignCatalogOpen] = useState(false);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<FooterSubSection>('general');
  const subSection = normalizeFooterSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: FooterSubSection) => {
    const next = normalizeFooterSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FOOTER_SUB_SECTIONS.map((section) => (
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Visibility</p>
            <div className="mt-4">
              <FooterVisibilityRow
                label="Show Footer section"
                checked={footer.enabled !== false}
                onChange={(enabled) => onChange({ enabled })}
              />
              <FooterVisibilityRow
                label="Email"
                checked={footer.showEmail !== false}
                onChange={(showEmail) => onChange({ showEmail })}
              />
              <FooterVisibilityRow
                label="Phone"
                checked={footer.showPhone !== false}
                onChange={(showPhone) => onChange({ showPhone })}
              />
              <FooterVisibilityRow
                label="Location"
                checked={footer.showLocation !== false}
                onChange={(showLocation) => onChange({ showLocation })}
              />
              <FooterVisibilityRow
                label="Hours"
                checked={footer.showHours !== false}
                onChange={(showHours) => onChange({ showHours })}
              />
              <FooterVisibilityRow
                label="Contact icons"
                checked={footer.showContactIcons !== false}
                onChange={(showContactIcons) => onChange({ showContactIcons })}
              />
              <FooterVisibilityRow
                label="Copyright"
                checked={footer.showCopyright !== false}
                onChange={(showCopyright) => onChange({ showCopyright })}
              />
              <FooterVisibilityRow
                label="Design credit"
                checked={footer.showDesignCredit !== false}
                onChange={(showDesignCredit) => onChange({ showDesignCredit })}
              />
              <FooterVisibilityRow
                label="Marketplace link"
                checked={footer.showMarketplaceLink === true}
                onChange={(showMarketplaceLink) => onChange({ showMarketplaceLink })}
              />
            </div>
          </div>

          <PortfolioSettingsPhotoField
            photoUrl={footer.photoUrl ?? ''}
            profileAvatarUrl={profileAvatarUrl}
            onChange={(photoUrl) => onChange({ photoUrl })}
          />

          <SectionColorModeControl
            value={footer.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />

          <FooterOptionGrid
            label="Font size"
            options={PORTFOLIO_FOOTER_PREMIUM_FONT_SIZE_OPTIONS}
            value={footer.premiumFontSize ?? 'medium'}
            onChange={(premiumFontSize) => onChange({ premiumFontSize })}
            columns={3}
          />

          <div className="space-y-3">
            <FooterSectionLabel>Mini bottom bar</FooterSectionLabel>
            <FooterToggleRow
              label="Show mini bottom bar"
              checked={footer.showMiniBar === true}
              onChange={(showMiniBar) => onChange({ showMiniBar })}
            />
            <p className="text-xs text-neutral-400">
              An independent, edge-to-edge bar below the Footer — works with every design.
            </p>
            {footer.showMiniBar === true ? (
              <FooterMiniBarDesignGrid
                value={footer.miniBarDesign}
                onChange={(miniBarDesign) => onChange({ miniBarDesign })}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-6">
          <FooterDesignChoiceGrid
            showGrid={designCatalogOpen}
            setShowGrid={setDesignCatalogOpen}
            value={footer.design}
            onChange={(design) => {
              if (design === 'centered-minimal') {
                onChange({
                  design,
                  showBrand: true,
                  showDescription: false,
                  showContactLinks: true,
                  showContactCta: false,
                  showMarketplaceLink: false,
                  showCopyright: true,
                  showDesignCredit: false,
                  showTopBorder: false,
                  showContentDivider: true,
                  showEmail: true,
                  showPhone: true,
                  showLocation: false,
                  showHours: false,
                  showContactIcons: true,
                });
                return;
              }
              if (design === 'contact-card') {
                const existing = footer.linkColumns ?? [];
                const useDefaults =
                  existing.length === 0 || isLegacyLandingMarketingColumns(existing);
                onChange({
                  design,
                  showBrand: true,
                  showDescription: false,
                  showContactLinks: true,
                  showCopyright: true,
                  showDesignCredit: false,
                  showMarketplaceLink: false,
                  showLandingMarketplaceLink: false,
                  showMarketplaceColumnLink: false,
                  showNopbProfileLink: false,
                  showEmail: true,
                  showPhone: true,
                  showLocation: true,
                  showHours: false,
                  showContactIcons: true,
                  showContactCta: false,
                  linkColumns: useDefaults
                    ? DEFAULT_FOOTER_LINK_COLUMNS.map((col) => ({
                        ...col,
                        links: col.links.map((link) => ({ ...link })),
                      }))
                    : existing,
                });
                return;
              }
              if (design === 'landing') {
                const existing = footer.linkColumns ?? [];
                const useDefaults =
                  existing.length === 0 || isLegacyLandingMarketingColumns(existing);
                onChange({
                  design,
                  showBrand: true,
                  showDescription: true,
                  showContactLinks: true,
                  showCopyright: true,
                  showDesignCredit: false,
                  showMarketplaceLink: false,
                  showLandingMarketplaceLink: false,
                  showMarketplaceColumnLink: false,
                  showNopbProfileLink: false,
                  showProfileVisits: false,
                  showEmail: true,
                  showPhone: true,
                  showLocation: true,
                  showHours: true,
                  contactIconSize: 'lg',
                  landingBrandGapPx: DEFAULT_FOOTER_LANDING_BRAND_GAP_PX,
                  linkColumns: useDefaults
                    ? DEFAULT_FOOTER_LINK_COLUMNS.map((col) => ({
                        ...col,
                        links: col.links.map((link) => ({ ...link })),
                      }))
                    : existing,
                });
                return;
              }
              onChange({ design });
            }}
          />
          {designCatalogOpen ? null : (
            <>
              <FooterContactLinkOptionsContext.Provider value={contactLinkOptions}>
                <FooterLayoutSettingsBand footer={footer} sectionLinkOptions={sectionLinkOptions} onChange={onChange} />
              </FooterContactLinkOptionsContext.Provider>
              {footer.design === 'contact-card' ? (
                <FooterContactCardColorBand footer={footer} onChange={onChange} />
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-4">
          <SectionBackgroundSettingsFields
            settings={footer}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onColorChange }) => {
              const slot = FOOTER_BACKGROUND_LABEL_SLOTS[label];
              if (!slot) {
                return <FooterManualColorField label={label} value={value} onChange={onColorChange} />;
              }
              return <FooterColorField footer={footer} onChange={onChange} slot={slot} label={label} value={value} />;
            }}
          />
          {footer.sectionBackgroundEnabled ? (
            <FooterToggleRow
              label="Unify header background"
              checked={footer.headerBackgroundUnified === true}
              onChange={(headerBackgroundUnified) => onChange({ headerBackgroundUnified })}
            />
          ) : null}
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <FooterHeaderDesignGrid
            value={footer.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
          />
          <div key={footer.headerDesign ?? 'editorial'} className="space-y-6 border-t border-neutral-200/70 pt-6">
            {footer.headerDesign === 'none' ? (
              <p className="text-sm text-neutral-500">
                No header is shown above the footer — the section&rsquo;s own layout starts right away.
              </p>
            ) : (footer.headerDesign ?? 'editorial') === 'editorial' ? (
              <>
                <FooterHeaderTextField
                  label="Title"
                  value={footer.headerEditorialTitleText}
                  placeholder="Let's work together."
                  onChange={(headerEditorialTitleText) => onChange({ headerEditorialTitleText })}
                  multiline
                />
                <FooterHeaderTextField
                  label="Subtitle (optional)"
                  value={footer.headerEditorialSubtitleText}
                  placeholder=""
                  onChange={(headerEditorialSubtitleText) => onChange({ headerEditorialSubtitleText })}
                />
                <FooterHeaderPaletteSwatches
                  label="Title color"
                  value={footer.headerEditorialTitleColor ?? 'texteFort'}
                  onChange={(headerEditorialTitleColor) => onChange({ headerEditorialTitleColor })}
                />
              </>
            ) : footer.headerDesign === 'index' ? (
              <>
                <FooterHeaderTextField label="Rule label" value={footer.headerIndexLabelText} placeholder="Contact" onChange={(headerIndexLabelText) => onChange({ headerIndexLabelText })} />
                <FooterHeaderTextField label="Title" value={footer.headerIndexTitleText} placeholder="Let's talk" onChange={(headerIndexTitleText) => onChange({ headerIndexTitleText })} />
                <FooterHeaderTextField label="Subtitle" value={footer.headerIndexSubtitleText} placeholder="Reach out — I read every message." onChange={(headerIndexSubtitleText) => onChange({ headerIndexSubtitleText })} multiline />
                <FooterHeaderTextField label="Count label (optional)" value={footer.headerIndexCountLabelText} placeholder="Links" onChange={(headerIndexCountLabelText) => onChange({ headerIndexCountLabelText })} />
                <FooterHeaderPaletteSwatches label="Number color" value={footer.headerIndexNumberColor ?? 'principal'} onChange={(headerIndexNumberColor) => onChange({ headerIndexNumberColor })} />
                <FooterHeaderPaletteSwatches label="Title color" value={footer.headerIndexTitleColor ?? 'texteFort'} onChange={(headerIndexTitleColor) => onChange({ headerIndexTitleColor })} />
              </>
            ) : footer.headerDesign === 'serif-lead' ? (
              <>
                <FooterHeaderTextField label="Label" value={footer.headerSerifLeadLabelText} placeholder="Contact" onChange={(headerSerifLeadLabelText) => onChange({ headerSerifLeadLabelText })} />
                <FooterHeaderTextField label="Title" value={footer.headerSerifLeadTitleText} placeholder="A few ways to start a conversation and say hello." onChange={(headerSerifLeadTitleText) => onChange({ headerSerifLeadTitleText })} multiline />
                <FooterHeaderPaletteSwatches label="Title color" value={footer.headerSerifLeadTitleColor ?? 'texteFort'} onChange={(headerSerifLeadTitleColor) => onChange({ headerSerifLeadTitleColor })} />
              </>
            ) : footer.headerDesign === 'billboard' ? (
              <>
                <FooterHeaderTextField label="Big word" value={footer.headerBillboardBigWord} placeholder="TALK" onChange={(headerBillboardBigWord) => onChange({ headerBillboardBigWord })} />
                <FooterOptionGrid
                  label="Word style"
                  options={FOOTER_HEADER_BILLBOARD_WORD_STYLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  value={footer.headerBillboardWordStyle ?? 'outline'}
                  onChange={(headerBillboardWordStyle) => onChange({ headerBillboardWordStyle })}
                  columns={3}
                />
                <FooterHeaderPaletteSwatches label="Word color" value={footer.headerBillboardWordColor ?? 'principal'} onChange={(headerBillboardWordColor) => onChange({ headerBillboardWordColor })} />
              </>
            ) : footer.headerDesign === 'masthead' ? (
              <>
                <FooterHeaderTextField label="Line 1" value={footer.headerMastheadLine1Text} placeholder="Always open." onChange={(headerMastheadLine1Text) => onChange({ headerMastheadLine1Text })} />
                <FooterHeaderTextField label="Line 2" value={footer.headerMastheadLine2Text} placeholder="Quick to reply." onChange={(headerMastheadLine2Text) => onChange({ headerMastheadLine2Text })} />
                <FooterHeaderTextField label="Line 3" value={footer.headerMastheadLine3Text} placeholder="Easy to reach." onChange={(headerMastheadLine3Text) => onChange({ headerMastheadLine3Text })} />
                <FooterHeaderPaletteSwatches label="Headline color" value={footer.headerMastheadHeadlineColor ?? 'principal'} onChange={(headerMastheadHeadlineColor) => onChange({ headerMastheadHeadlineColor })} />
              </>
            ) : footer.headerDesign === 'hero' ? (
              <>
                <FooterHeaderTextField
                  label="Title"
                  value={footer.headerHeroTitleText}
                  placeholder={"Let's build a space\nthat feels alive."}
                  onChange={(headerHeroTitleText) => onChange({ headerHeroTitleText })}
                  multiline
                />
                <FooterHeaderTextField label="Button label" value={footer.headerHeroCtaLabel} placeholder="Get in touch" onChange={(headerHeroCtaLabel) => onChange({ headerHeroCtaLabel })} />
                <FooterHeaderPaletteSwatches label="Title & button color" value={footer.headerHeroTitleColor ?? 'texteFort'} onChange={(headerHeroTitleColor) => onChange({ headerHeroTitleColor })} />
              </>
            ) : footer.headerDesign === 'name' ? (
              <>
                <p className="text-sm text-neutral-500">Always shows your creator name — nothing to type here.</p>
                <FooterHeaderPaletteSwatches label="Name color" value={footer.headerNameColor ?? 'texteFort'} onChange={(headerNameColor) => onChange({ headerNameColor })} />
              </>
            ) : footer.headerDesign === 'timezone' ? (
              <>
                <FooterHeaderTextField label="Kicker" value={footer.headerTimezoneKickerText} placeholder="( Get in touch )" onChange={(headerTimezoneKickerText) => onChange({ headerTimezoneKickerText })} />
                <FooterHeaderTextField
                  label="Title"
                  value={footer.headerTimezoneTitleText}
                  placeholder={"Let's start\na conversation."}
                  onChange={(headerTimezoneTitleText) => onChange({ headerTimezoneTitleText })}
                  multiline
                />
                <FooterHeaderTextField
                  label="Description"
                  value={footer.headerTimezoneDescriptionText}
                  placeholder="Reach out and tell us about your project — we read every message."
                  onChange={(headerTimezoneDescriptionText) => onChange({ headerTimezoneDescriptionText })}
                  multiline
                />
                <FooterHeaderPaletteSwatches label="Title color" value={footer.headerTimezoneTitleColor ?? 'texteFort'} onChange={(headerTimezoneTitleColor) => onChange({ headerTimezoneTitleColor })} />
                <p className="text-sm text-neutral-500">The clock and location on the right always come from your real profile data.</p>
              </>
            ) : null}

            {footer.headerDesign === 'none' ? null : (
            <div className="space-y-6 border-t border-neutral-200/70 pt-6">
              <FooterOptionGrid
                label="Header alignment"
                options={[
                  { value: 'left' as const, label: 'Left' },
                  { value: 'center' as const, label: 'Center' },
                  { value: 'right' as const, label: 'Right' },
                ]}
                value={footer.headerDesignAlignment ?? 'left'}
                onChange={(headerDesignAlignment) => onChange({ headerDesignAlignment })}
                columns={3}
              />
              <FooterOptionGrid
                label="Bottom spacing"
                options={[
                  { value: 'none' as const, label: 'None' },
                  { value: 'sm' as const, label: 'Small' },
                  { value: 'md' as const, label: 'Medium' },
                  { value: 'lg' as const, label: 'Large' },
                  { value: 'xl' as const, label: 'XL' },
                ]}
                value={footer.headerMarginBottom ?? 'md'}
                onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
                columns={5}
              />
              <FooterOptionGrid
                label="Top padding"
                options={[
                  { value: 'none' as const, label: 'None' },
                  { value: 'sm' as const, label: 'Small' },
                  { value: 'md' as const, label: 'Medium' },
                  { value: 'lg' as const, label: 'Large' },
                  { value: 'xl' as const, label: 'XL' },
                ]}
                value={footer.headerPaddingTop ?? 'none'}
                onChange={(headerPaddingTop) => onChange({ headerPaddingTop })}
                columns={5}
              />
              <FooterOptionGrid
                label="Bottom padding"
                options={[
                  { value: 'none' as const, label: 'None' },
                  { value: 'sm' as const, label: 'Small' },
                  { value: 'md' as const, label: 'Medium' },
                  { value: 'lg' as const, label: 'Large' },
                  { value: 'xl' as const, label: 'XL' },
                ]}
                value={footer.headerPaddingBottom ?? 'none'}
                onChange={(headerPaddingBottom) => onChange({ headerPaddingBottom })}
                columns={5}
              />
              <FooterHeaderSizePill
                label="Title size"
                value={footer.headerTitleSize ?? 'xl'}
                onChange={(headerTitleSize) => onChange({ headerTitleSize })}
              />
              <FooterOptionGrid
                label="Title weight"
                options={[
                  { value: 'light' as const, label: 'Light' },
                  { value: 'regular' as const, label: 'Regular' },
                  { value: 'semibold' as const, label: 'Semibold' },
                  { value: 'bold' as const, label: 'Bold' },
                ]}
                value={footer.headerTitleWeight ?? 'bold'}
                onChange={(headerTitleWeight) => onChange({ headerTitleWeight })}
                columns={4}
              />
            </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
