'use client';

import { useState, type ReactNode } from 'react';
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
  DEFAULT_FOOTER_LINK_COLUMNS,
  DEFAULT_FOOTER_LANDING_BRAND_GAP_PX,
  isLegacyLandingMarketingColumns,
  type PortfolioFooterDesign,
  type PortfolioFooterSectionSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import { FooterHeroColumnsWireframe } from '@/components/portfolio/portfolio-footer-design-hero-columns';
import { FooterSplitFormWireframe } from '@/components/portfolio/portfolio-footer-design-split-form';
import { FooterTimezoneEditorialWireframe } from '@/components/portfolio/portfolio-footer-design-timezone-editorial';
import { FooterInvertedWordmarkWireframe } from '@/components/portfolio/portfolio-footer-design-inverted-wordmark';
import { FooterServicesRevealWireframe } from '@/components/portfolio/portfolio-footer-design-services-reveal';
import { FooterEditorialGridWireframe } from '@/components/portfolio/portfolio-footer-design-editorial-grid';
import { FooterHeadlineRevealWireframe } from '@/components/portfolio/portfolio-footer-design-headline-reveal';
import { FooterCompactWireframe } from '@/components/portfolio/portfolio-footer-design-compact';
import { FooterCenteredMinimalWireframe } from '@/components/portfolio/portfolio-footer-design-centered-minimal';
import { FooterLandingWireframe } from '@/components/portfolio/portfolio-footer-design-landing';
import { FooterContactCardWireframe } from '@/components/portfolio/portfolio-footer-design-contact-card';
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
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
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
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
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
    case 'compact':
      return <FooterCompactWireframe />;
    default:
      return null;
  }
}

/** Expanded-grid card: wireframe + name only — no description paragraph (see the
 *  "Settings design standard" text-reduction rule). Same visual chrome as every other
 *  section's design picker (2px accent border + tint + circular check badge when active). */
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
      className="pf-stack-design-card relative rounded-2xl px-3 pb-3 pt-2.5 text-left"
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
      <span className="mt-2.5 block">
        <span className="pf-stack-card-label block text-sm font-semibold leading-none tracking-tight">
          {label}
        </span>
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
}: {
  value: PortfolioFooterDesign;
  onChange: (value: PortfolioFooterDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
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
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
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

function FooterHeaderOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4;
}) {
  return (
    <div>
      <FooterGroupLabel>{label}</FooterGroupLabel>
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
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {design === 'billboard' ? (
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
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
  subSection?: FooterSubSection;
  onSubSectionChange?: (value: FooterSubSection) => void;
}) {
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
        <div className="space-y-6">
          <FooterToggleRow
            label="Show Footer section"
            checked={footer.enabled !== false}
            onChange={(enabled) => onChange({ enabled })}
          />

          <SectionColorModeControl
            value={footer.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />

          <div className="space-y-5">
            <FooterSectionLabel>Content visibility</FooterSectionLabel>

            <div className="space-y-2">
              <FooterGroupLabel>Section</FooterGroupLabel>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <FooterToggleRow
                  label="Brand name"
                  checked={footer.showBrand !== false}
                  onChange={(showBrand) => onChange({ showBrand })}
                />
                <FooterToggleRow
                  label="Avatar"
                  checked={footer.showAvatar === true}
                  onChange={(showAvatar) => onChange({ showAvatar })}
                />
                <FooterToggleRow
                  label="Description"
                  checked={footer.showDescription === true}
                  onChange={(showDescription) => onChange({ showDescription })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <FooterGroupLabel>Contact info</FooterGroupLabel>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <FooterToggleRow
                  label="Email"
                  checked={footer.showEmail !== false}
                  onChange={(showEmail) => onChange({ showEmail })}
                />
                <FooterToggleRow
                  label="Phone"
                  checked={footer.showPhone !== false}
                  onChange={(showPhone) => onChange({ showPhone })}
                />
                <FooterToggleRow
                  label="Location"
                  checked={footer.showLocation !== false}
                  onChange={(showLocation) => onChange({ showLocation })}
                />
                <FooterToggleRow
                  label="Hours"
                  checked={footer.showHours !== false}
                  onChange={(showHours) => onChange({ showHours })}
                />
                <FooterToggleRow
                  label="Contact icons"
                  checked={footer.showContactIcons !== false}
                  onChange={(showContactIcons) => onChange({ showContactIcons })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <FooterGroupLabel>Meta</FooterGroupLabel>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <FooterToggleRow
                  label="Copyright"
                  checked={footer.showCopyright !== false}
                  onChange={(showCopyright) => onChange({ showCopyright })}
                />
                <FooterToggleRow
                  label="Design credit"
                  checked={footer.showDesignCredit !== false}
                  onChange={(showDesignCredit) => onChange({ showDesignCredit })}
                />
                <FooterToggleRow
                  label="Marketplace link"
                  checked={footer.showMarketplaceLink === true}
                  onChange={(showMarketplaceLink) => onChange({ showMarketplaceLink })}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-6">
          <FooterDesignChoiceGrid
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
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <FooterHeaderDesignGrid
            value={footer.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
          />
          <div key={footer.headerDesign ?? 'editorial'} className="space-y-6 border-t border-neutral-200/70 pt-6">
            {(footer.headerDesign ?? 'editorial') === 'editorial' ? (
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
                <FooterHeaderOptionGrid
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

            <div className="space-y-6 border-t border-neutral-200/70 pt-6">
              <FooterHeaderOptionGrid
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
              <FooterHeaderOptionGrid
                label="Bottom spacing"
                options={[
                  { value: 'sm' as const, label: 'Small' },
                  { value: 'md' as const, label: 'Medium' },
                  { value: 'lg' as const, label: 'Large' },
                  { value: 'xl' as const, label: 'XL' },
                ]}
                value={footer.headerMarginBottom ?? 'md'}
                onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
                columns={4}
              />
              <FooterHeaderSizePill
                label="Title size"
                value={footer.headerTitleSize ?? 'xl'}
                onChange={(headerTitleSize) => onChange({ headerTitleSize })}
              />
              <FooterHeaderOptionGrid
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
