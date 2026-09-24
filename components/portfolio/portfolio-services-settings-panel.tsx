'use client';

import { useId, useState, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_SERVICES_COLOR_BINDINGS,
  DEFAULT_SERVICES_PALETTE,
  mergeServicesColorBindings,
  mergeServicesPalette,
  patchServicesColorBinding,
  patchServicesColorField,
  type ServicesColorSlot,
} from '@/components/portfolio/portfolio-services-palette-settings';
import {
  DEFAULT_SERVICES_PRICING_AURORA_SETTINGS,
  DEFAULT_SERVICES_PRICING_BENTO_SETTINGS,
  DEFAULT_SERVICES_PRICING_GRID_SETTINGS,
  DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS,
  PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS,
  PORTFOLIO_SERVICES_DISTINCT_SERVICES_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_SERVICES_DISTINCT_SERVICES_TITLE_PRESET_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_AURORA_COLUMNS_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_MONOLITH_COLUMNS_OPTIONS,
  PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS,
  SERVICES_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  SERVICES_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  SERVICES_HEADER_PALETTE_TOKEN_OPTIONS,
  servicesHeaderPaletteTokenColor,
  type PortfolioServicesHeaderAccentCountAlignment,
  type PortfolioServicesHeaderBillboardWordStyle,
  type PortfolioServicesHeaderDesign,
  type PortfolioServicesHeaderDesignAlignment,
  type PortfolioServicesHeaderPaletteToken,
  type PortfolioServicesHeaderTitleSize,
  type PortfolioServicesHeaderTitleWeight,
  type PortfolioServicesPricingAuroraColumns,
  type PortfolioServicesPricingAuroraPopularColorToken,
  type PortfolioServicesPricingGridPopularColorToken,
  type PortfolioServicesPricingMonolithColumns,
  type PortfolioServicesSectionDesign,
  type PortfolioServicesSectionSettings,
  PORTFOLIO_SERVICES_PREMIUM_FONT_SIZE_OPTIONS,
} from '@/components/portfolio/portfolio-services-settings';

/** Top-level settings entry: kept for API compatibility with callers, though only
 *  'services' is currently wired up anywhere in the app (no live 'skills' entry point). */
export type ServicesSettingsFocus = 'skills' | 'services';

export type ServicesSubSection = 'general' | 'design' | 'background' | 'header';

const SERVICES_SUB_SECTIONS: { id: ServicesSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility and defaults.' },
  { id: 'design', label: 'Design', description: 'Layout and visual style.' },
  { id: 'background', label: 'Background', description: 'Fill behind this section.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
];

const PRICING_GRID_POPULAR_COLOR_OPTIONS: {
  value: PortfolioServicesPricingGridPopularColorToken;
  label: string;
}[] = [
  { value: 'principal', label: 'Principal' },
  { value: 'secondaire', label: 'Secondary' },
  { value: 'texteFort', label: 'Contrast' },
  { value: 'neutre', label: 'Neutral' },
];

const PRICING_AURORA_POPULAR_COLOR_OPTIONS: {
  value: PortfolioServicesPricingAuroraPopularColorToken;
  label: string;
}[] = [
  { value: 'principal', label: 'Principal' },
  { value: 'secondaire', label: 'Secondary' },
  { value: 'texteFort', label: 'Contrast' },
  { value: 'neutre', label: 'Neutral' },
];

/** The only section designs with their own options band in the Design tab — every other one
 *  renders straight from the services themselves (same hint pattern as Gallery's). */
const SERVICES_DESIGNS_WITH_OPTIONS = new Set<PortfolioServicesSectionDesign>([
  'services-pricing-grid',
  'services-pricing-bento',
  'services-pricing-monolith',
  'services-pricing-aurora',
]);

/** Map legacy subsection ids (saved UI state / search) onto the current Services menu. */
export function normalizeServicesSubSection(value: string | undefined): ServicesSubSection {
  if (value === 'general' || value === 'design' || value === 'background' || value === 'header') {
    return value;
  }
  if (value === 'cards' || value === 'layout' || value === 'frame') return 'design';
  return 'general';
}

function asServicesPatch(
  patch: Record<string, unknown> | object
): Partial<PortfolioServicesSectionSettings> {
  return patch as Partial<PortfolioServicesSectionSettings>;
}

/** Same animated switch as Stack/Contact/Info's settings panels — shared settings-UI chrome. */
function ServicesSwitchTrack({ checked }: { checked: boolean }) {
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

/** Small keyboard-accessible "i" tooltip — same mechanism as Stack/Contact/Info. */
function ServicesInfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex shrink-0">
      <span
        role="button"
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={`More info: ${text}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => event.stopPropagation()}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-neutral-400 transition hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
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
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium leading-snug text-white shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

function ServicesToggleRow({
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
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer flex-col gap-1 text-left"
    >
      <span className="flex items-center justify-between gap-4">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate text-sm font-medium text-neutral-950">{label}</span>
          {info ? <ServicesInfoTooltip text={info} /> : null}
        </span>
        <ServicesSwitchTrack checked={checked} />
      </span>
    </button>
  );
}

/** One-per-line visibility row (hairline divider) — the same pattern as the Footer's,
 *  Gallery's and Team's General tabs. */
function ServicesVisibilityRow({
  label,
  info,
  checked,
  onChange,
}: {
  label: string;
  info?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200/80 py-3.5 last:border-b-0">
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <span
          className="min-w-0 cursor-pointer truncate text-sm font-medium text-neutral-950"
          onClick={() => onChange(!checked)}
        >
          {label}
        </span>
        {info ? <ServicesInfoTooltip text={info} /> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="shrink-0"
      >
        <ServicesSwitchTrack checked={checked} />
      </button>
    </div>
  );
}

function ServicesSectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{children}</p>;
}

function ServicesGroupLabel({ children }: { children: string }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{children}</p>;
}

const SERVICES_INPUT_CLASS =
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400';

/** Label + input — replaces the old "block heading, then a nested Text sub-label" shape
 *  the Header tab used, so a text field reads the same here as in Gallery/Team. */
function ServicesTextField({
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
      <ServicesSectionLabel>{label}</ServicesSectionLabel>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={2}
          aria-label={label}
          className={`mt-2 ${SERVICES_INPUT_CLASS} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`mt-2 ${SERVICES_INPUT_CLASS}`}
        />
      )}
    </div>
  );
}

function ServicesBandGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <ServicesGroupLabel>{title}</ServicesGroupLabel>
      {children}
    </div>
  );
}

/** Compact palette-token pills with the resolved color as a dot — replaces the old
 *  glyph preview cards, matching Gallery/Team/Footer's own palette pickers. */
function ServicesPaletteSwatches({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioServicesHeaderPaletteToken;
  onChange: (value: PortfolioServicesHeaderPaletteToken) => void;
}) {
  return (
    <div>
      <ServicesGroupLabel>{label}</ServicesGroupLabel>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-3 gap-1.5">
        {SERVICES_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => {
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
                style={{ backgroundColor: servicesHeaderPaletteTokenColor(option.value) }}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Mini wireframes for the "Section design" picker cards (`.pf-stack-mini-*` classes are
 *  generic shared settings-UI chrome, not Stack-specific — see the note below). */
function ServicesDesignWireframe({ design }: { design: PortfolioServicesSectionDesign }) {
  if (design === 'showcase-hero') {
    return (
      <ServicesMiniSlide>
        <path d="M6 36l-3 4 3 4" className="pf-stack-mini-ink" stroke="currentColor" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M114 36l3 4-3 4" className="pf-stack-mini-ink" stroke="currentColor" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect className="pf-stack-mini-mute" x="34" y="14" width="46" height="34" rx="2" transform="rotate(-4 57 31)" />
        <rect className="pf-stack-mini-ink" x="6" y="19" width="30" height="8" rx="2" />
        <rect className="pf-stack-mini-mute" x="64" y="54" width="30" height="3" rx="1.5" />
        <rect className="pf-stack-mini-mute" x="70" y="60" width="24" height="3" rx="1.5" />
        <rect className="pf-stack-mini-accent" x="6" y="58" width="20" height="6" rx="3" />
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-pricing-grid' || design === 'services-pricing-aurora') {
    return (
      <ServicesMiniSlide>
        <rect className="pf-stack-mini-mute" x="8" y="20" width="30" height="38" rx="4" />
        <rect className="pf-stack-mini-accent" x="45" y="12" width="30" height="46" rx="4" />
        <rect className="pf-stack-mini-mute" x="82" y="20" width="30" height="38" rx="4" />
        <rect className="pf-stack-mini-ink" x="12" y="26" width="18" height="3" rx="1.5" />
        <rect className="pf-stack-mini-ink" x="51" y="18" width="18" height="3" rx="1.5" />
        <rect className="pf-stack-mini-ink" x="86" y="26" width="18" height="3" rx="1.5" />
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-pricing-bento') {
    return (
      <ServicesMiniSlide>
        <rect className="pf-stack-mini-accent" x="8" y="10" width="50" height="48" rx="4" />
        <rect className="pf-stack-mini-mute" x="64" y="10" width="48" height="48" rx="4" />
        <rect className="pf-stack-mini-ink" x="14" y="16" width="30" height="8" rx="2" />
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-pricing-monolith') {
    return (
      <ServicesMiniSlide>
        <rect className="pf-stack-mini-ring" x="8" y="16" width="30" height="40" rx="3" />
        <rect className="pf-stack-mini-ring" x="45" y="16" width="30" height="40" rx="3" />
        <rect className="pf-stack-mini-ring" x="82" y="16" width="30" height="40" rx="3" />
        <rect className="pf-stack-mini-ink" x="14" y="38" width="18" height="8" rx="1" />
        <rect className="pf-stack-mini-ink" x="51" y="34" width="18" height="10" rx="1" />
        <rect className="pf-stack-mini-ink" x="88" y="38" width="18" height="8" rx="1" />
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-pricing-toggle') {
    return (
      <ServicesMiniSlide>
        <rect className="pf-stack-mini-mute" x="42" y="4" width="36" height="8" rx="4" />
        <rect className="pf-stack-mini-accent" x="8" y="16" width="104" height="14" rx="5" />
        <rect className="pf-stack-mini-mute" x="8" y="34" width="104" height="12" rx="5" />
        <rect className="pf-stack-mini-mute" x="8" y="50" width="104" height="12" rx="5" />
      </ServicesMiniSlide>
    );
  }
  return (
    <ServicesMiniSlide>
      <rect className="pf-stack-mini-mute" x="8" y="16" width="30" height="40" rx="2" />
      <rect className="pf-stack-mini-mute" x="45" y="16" width="30" height="40" rx="2" />
      <rect className="pf-stack-mini-mute" x="82" y="16" width="30" height="40" rx="2" />
      <rect className="pf-stack-mini-ink" x="12" y="46" width="22" height="4" rx="2" />
      <rect className="pf-stack-mini-ink" x="49" y="46" width="22" height="4" rx="2" />
      <rect className="pf-stack-mini-ink" x="86" y="46" width="22" height="4" rx="2" />
    </ServicesMiniSlide>
  );
}

/** The "Section design" picker — collapses to the selected design; click to expand and change. */
function ServicesDesignChoiceGrid({
  value,
  onChange,
  showGrid,
  setShowGrid,
}: {
  value: PortfolioServicesSectionDesign;
  onChange: (value: PortfolioServicesSectionDesign) => void;
  /** Owned by the panel so the selected design's options hide while the catalogue is open. */
  showGrid: boolean;
  setShowGrid: (open: boolean) => void;
}) {
  const selected =
    PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <ServicesSectionLabel>Section design</ServicesSectionLabel>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <ServicesPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <ServicesDesignWireframe design={option.value} />
              </ServicesPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <ServicesDesignSummaryRow label="Design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <ServicesDesignWireframe design={value} />
    </ServicesDesignSummaryRow>
  );
}

function ServicesManualColorField({
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
 *  manual hex picker when it's off. Same mechanism as FAQ/Stack's own color fields. */
function ServicesColorField({
  services,
  onChange,
  slot,
  label,
  value,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  slot: ServicesColorSlot;
  label: string;
  value: string;
}) {
  if (services.useHeroPalette === false) {
    return (
      <ServicesManualColorField
        label={label}
        value={value}
        onChange={(hex) => onChange(asServicesPatch(patchServicesColorField(services, slot, hex)))}
      />
    );
  }

  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
  const bindings = mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, services.servicesColorBindings);
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
          onChange(asServicesPatch(patchServicesColorBinding(services, slot, event.target.value as HeroPaletteTokenId)))
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

const SERVICES_BACKGROUND_LABEL_SLOTS: Record<string, ServicesColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Color A': 'sectionSplitA',
  'Color B': 'sectionSplitB',
};

/** Mini wireframe canvas — shared settings-UI chrome (`.pf-stack-*` classes are generic,
 *  not Stack-specific — reused across every section panel that has this Header mechanism). */
function ServicesMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function ServicesMiniType({
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

/** Expandable picker card — the Footer/Gallery/Team chrome: no visible border at rest, a
 *  hover brighten + 1px lift, and the selected card signalled only by its label turning the
 *  accent color (see `.pf-services-design-card` in globals.css). */
function ServicesPickerCard({
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
  /** Smaller padding/type for secondary thumbnail grids (cards per row, …). */
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
      className={`pf-services-design-card relative rounded-2xl text-left ${compact ? 'p-2' : 'p-2.5'}`}
    >
      {children}
      <span
        className={`pf-services-card-label mt-2 block font-semibold leading-none tracking-tight ${
          compact ? 'text-xs' : 'text-sm'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

/** Compact pill picker — for simple choices (alignment, weight, presets) where a big
 *  descriptive card is overkill. Same markup as Gallery's and Team's own OptionGrid. */
function ServicesOptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns,
  hideLabel = false,
}: {
  label: string;
  options: readonly { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  /** Keeps `label` as the accessible name only — for a pill that sits under its own heading. */
  hideLabel?: boolean;
}) {
  const count = options.length;
  const cols = columns ?? (count <= 4 ? Math.max(count, 1) : 2);
  return (
    <div>
      {hideLabel ? null : <ServicesGroupLabel>{label}</ServicesGroupLabel>}
      <div
        role="radiogroup"
        aria-label={label}
        className={`${hideLabel ? '' : 'mt-2'} grid gap-1.5`}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              title={option.description}
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

/** Visual-difference choice (cards per row) — a compact thumbnail card per option. Palette
 *  tokens and word styles use pills instead (see ServicesPaletteSwatches / ServicesOptionGrid). */
function ServicesPreviewCardGrid<T extends string>({
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
  const cols = columns ?? Math.min(options.length, 4);
  return (
    <div>
      <ServicesGroupLabel>{label}</ServicesGroupLabel>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-2 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <ServicesPickerCard
            key={option.value}
            active={option.value === value}
            label={option.label}
            onClick={() => onChange(option.value)}
            compact
          >
            <svg viewBox="0 0 64 34" className="pf-stack-mini h-full w-full" aria-hidden>
              <rect className="pf-stack-mini-stage" x="0.75" y="0.75" width="62.5" height="32.5" rx="6" />
              {option.glyph}
            </svg>
          </ServicesPickerCard>
        ))}
      </div>
    </div>
  );
}

/** Mini "N equal bars" preview for a cards-per-row picker — mirrors Work Board's
 *  `workColumnsGlyph`, adapted to the 64×34 stage used by `ServicesPreviewCardGrid`. */
function servicesPricingColumnsGlyph(n: 1 | 2 | 3 | 4): ReactNode {
  const stageX = 5;
  const stageWidth = 54;
  const gap = 3;
  const barWidth = (stageWidth - gap * (n - 1)) / n;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          className="pf-stack-mini-ink"
          x={stageX + i * (barWidth + gap)}
          y={9}
          width={barWidth}
          height={16}
          rx={2}
        />
      ))}
    </>
  );
}

/** Collapsed-state row shared by the Header design choice grid: a compact scaled-down
 *  thumbnail, the selected design's name, and a trailing chevron — the whole row opens
 *  the grid. Same mechanism as Stack/Contact's own design summary row. */
function ServicesDesignSummaryRow({
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
      <ServicesSectionLabel>{label}</ServicesSectionLabel>
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

/** S/M/L/XL, each button's own label rendered at the size it represents —
 *  the pill illustrates the scale directly, no separate value readout needed. */
const SERVICES_SIZE_PILL_OPTIONS: { value: PortfolioServicesHeaderTitleSize; label: string; fontPx: number }[] = [
  { value: 'sm', label: 'S', fontPx: 12 },
  { value: 'md', label: 'M', fontPx: 15 },
  { value: 'lg', label: 'L', fontPx: 18 },
  { value: 'xl', label: 'XL', fontPx: 22 },
];

function ServicesSizePill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioServicesHeaderTitleSize;
  onChange: (value: PortfolioServicesHeaderTitleSize) => void;
}) {
  return (
    <div>
      <ServicesGroupLabel>{label}</ServicesGroupLabel>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-4 gap-1.5">
        {SERVICES_SIZE_PILL_OPTIONS.map((option) => {
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

/** Mini wireframes for the 8 Header design picker cards — same ServicesMiniSlide mechanism
 *  as the generic shapes Stack/Contact use for their own Header design picker. */
function ServicesHeaderDesignWireframe({ design }: { design: PortfolioServicesHeaderDesign }) {
  switch (design) {
    case 'editorial':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="16" width="18" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="26" width="64" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="42" width="46" height="4" rx="2" />
        </ServicesMiniSlide>
      );
    case 'marquee':
      return (
        <ServicesMiniSlide>
          <text
            x="60"
            y="34"
            fontSize={22}
            fontWeight={800}
            textAnchor="middle"
            opacity={0.14}
            className="pf-stack-mini-ink"
          >
            SERVICES
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="84" height="10" rx="2" />
        </ServicesMiniSlide>
      );
    case 'index':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="4" height="4" />
          <rect className="pf-stack-mini-mute" x="20" y="13" width="90" height="1" />
          <ServicesMiniType x={10} y={40} size={22}>
            04
          </ServicesMiniType>
          <rect className="pf-stack-mini-mute" x="46" y="22" width="1" height="18" />
          <rect className="pf-stack-mini-ink" x="54" y="24" width="46" height="7" rx="2" />
        </ServicesMiniSlide>
      );
    case 'accent-count':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="12" width="26" height="8" rx="4" />
          <rect className="pf-stack-mini-mute" x="10" y="26" width="40" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="33" width="60" height="7" rx="2" />
        </ServicesMiniSlide>
      );
    case 'serif-lead':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="14" width="20" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="24" width="76" height="11" rx="2" />
        </ServicesMiniSlide>
      );
    case 'billboard':
      return (
        <ServicesMiniSlide>
          <text
            x="60"
            y="30"
            fontSize={26}
            fontWeight={900}
            textAnchor="middle"
            opacity={0.1}
            className="pf-stack-mini-ink"
          >
            SERVICES
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="60" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="18" y="42" width="40" height="3" rx="1.5" />
        </ServicesMiniSlide>
      );
    case 'masthead':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="100" height="1" />
          <rect className="pf-stack-mini-ink" x="10" y="20" width="100" height="12" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="38" width="100" height="1" />
        </ServicesMiniSlide>
      );
    case 'split-heading':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="20" width="58" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="86" y="18" width="24" height="3" rx="1.5" />
        </ServicesMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Same collapsed-preview / expand-to-grid mechanism as Stack/Contact's own Header design picker. */
function ServicesHeaderChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioServicesHeaderDesign;
  onChange: (value: PortfolioServicesHeaderDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <ServicesSectionLabel>Header design</ServicesSectionLabel>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <ServicesPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <ServicesHeaderDesignWireframe design={option.value} />
              </ServicesPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <ServicesDesignSummaryRow label="Header design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <ServicesHeaderDesignWireframe design={value} />
    </ServicesDesignSummaryRow>
  );
}

const SERVICES_HEADER_MARGIN_BOTTOM_OPTIONS = [
  { value: 'sm' as const, label: 'Small' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Large' },
  { value: 'xl' as const, label: 'XL' },
];

const SERVICES_HEADER_TITLE_WEIGHT_OPTIONS = [
  { value: 'light' as const, label: 'Light', description: 'Lighter than this design’s default.' },
  { value: 'regular' as const, label: 'Regular', description: 'This design’s default weight.' },
  { value: 'semibold' as const, label: 'Semibold', description: 'A step bolder.' },
  { value: 'bold' as const, label: 'Bold', description: 'The boldest step.' },
];

/** Bottom spacing and header motion — plus alignment and the shared title size/weight, but
 *  only where the chosen design actually reads them (dead controls left visible are
 *  confusing, so each branch passes `hideAlignment`/`hideTitleControls` to match). Same
 *  shape as Gallery's and Team's own shared header controls. */
function ServicesHeaderSharedAdvancedControls({
  services,
  onChange,
  hideAlignment = false,
  hideTitleControls = false,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  hideAlignment?: boolean;
  hideTitleControls?: boolean;
}) {
  return (
    <div className="space-y-5 border-t border-neutral-200/70 pt-6">
      {hideAlignment ? null : (
        <ServicesOptionGrid
          label="Header alignment"
          options={[
            { value: 'left' as const, label: 'Left' },
            { value: 'center' as const, label: 'Center' },
            { value: 'right' as const, label: 'Right' },
          ]}
          value={services.headerDesignAlignment}
          onChange={(headerDesignAlignment: PortfolioServicesHeaderDesignAlignment) => onChange({ headerDesignAlignment })}
          columns={3}
        />
      )}
      <ServicesOptionGrid
        label="Bottom spacing"
        options={SERVICES_HEADER_MARGIN_BOTTOM_OPTIONS}
        value={services.headerMarginBottom ?? 'md'}
        onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
        columns={4}
      />
      {hideTitleControls ? null : (
        <>
          <ServicesSizePill
            label="Title size"
            value={services.headerTitleSize ?? 'md'}
            onChange={(headerTitleSize) => onChange({ headerTitleSize })}
          />
          <ServicesOptionGrid
            label="Title weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerTitleWeight ?? 'regular'}
            onChange={(headerTitleWeight: PortfolioServicesHeaderTitleWeight) => onChange({ headerTitleWeight })}
            columns={4}
          />
        </>
      )}
      <div className="space-y-1.5">
        <ServicesToggleRow
          label="Header motion"
          checked={services.headerAnimationEnabled !== false}
          onChange={(headerAnimationEnabled) => onChange({ headerAnimationEnabled })}
        />
        <p className="text-xs text-neutral-400">Reduced-motion preferences are always respected.</p>
      </div>
    </div>
  );
}

/** Titled band grouping a picker's settings — remounts (via `motionKey`) when the selection
 *  changes so per-design fields don't carry stale focus/state. Same `pf-exp-layout-settings`
 *  band as Footer/Gallery/Team. */
function ServicesLayoutSettingsBand({
  children,
  motionKey,
  id = 'services-layout-settings-title',
  title = 'Header settings',
}: {
  children: ReactNode;
  motionKey: string;
  id?: string;
  title?: string;
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

/* ---------------------------------------------------------------------- */
/* Header tab — per-design fields, then the controls every design shares.   */
/* Same shape as Gallery's and Team's own Header tabs.                      */
/* ---------------------------------------------------------------------- */

function ServicesHeaderDesignFields({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const design = services.headerDesign ?? 'editorial';

  if (design === 'index') {
    return (
      <>
        <ServicesTextField
          label="Rule label"
          value={services.headerIndexLabelText}
          placeholder="Index"
          onChange={(headerIndexLabelText) => onChange({ headerIndexLabelText })}
        />
        <ServicesTextField
          label="Title"
          value={services.headerIndexTitleText}
          placeholder="Core services"
          onChange={(headerIndexTitleText) => onChange({ headerIndexTitleText })}
        />
        <ServicesTextField
          label="Subtitle"
          value={services.headerIndexSubtitleText}
          placeholder="A clear breakdown of what you can hire me for."
          onChange={(headerIndexSubtitleText) => onChange({ headerIndexSubtitleText })}
          multiline
        />
        <ServicesTextField
          label="Count label"
          value={services.headerIndexCountLabelText}
          placeholder="Services"
          onChange={(headerIndexCountLabelText) => onChange({ headerIndexCountLabelText })}
        />
        <ServicesBandGroup title="Label">
          <ServicesPaletteSwatches
            label="Color"
            value={services.headerIndexLabelColor ?? 'texteFort'}
            onChange={(headerIndexLabelColor) => onChange({ headerIndexLabelColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerIndexLabelSize ?? 'md'}
            onChange={(headerIndexLabelSize) => onChange({ headerIndexLabelSize })}
          />
          <ServicesOptionGrid
            label="Weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerIndexLabelWeight ?? 'regular'}
            onChange={(headerIndexLabelWeight: PortfolioServicesHeaderTitleWeight) =>
              onChange({ headerIndexLabelWeight })
            }
            columns={4}
          />
        </ServicesBandGroup>
        <ServicesBandGroup title="Title">
          <ServicesPaletteSwatches
            label="Color"
            value={services.headerIndexTitleColor ?? 'texteFort'}
            onChange={(headerIndexTitleColor) => onChange({ headerIndexTitleColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerIndexTitleSize ?? 'md'}
            onChange={(headerIndexTitleSize) => onChange({ headerIndexTitleSize })}
          />
          <ServicesOptionGrid
            label="Weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerIndexTitleWeight ?? 'regular'}
            onChange={(headerIndexTitleWeight: PortfolioServicesHeaderTitleWeight) =>
              onChange({ headerIndexTitleWeight })
            }
            columns={4}
          />
        </ServicesBandGroup>
        <ServicesBandGroup title="Subtitle">
          <ServicesPaletteSwatches
            label="Color"
            value={services.headerIndexSubtitleColor ?? 'texteFort'}
            onChange={(headerIndexSubtitleColor) => onChange({ headerIndexSubtitleColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerIndexSubtitleSize ?? 'md'}
            onChange={(headerIndexSubtitleSize) => onChange({ headerIndexSubtitleSize })}
          />
          <ServicesOptionGrid
            label="Weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerIndexSubtitleWeight ?? 'regular'}
            onChange={(headerIndexSubtitleWeight: PortfolioServicesHeaderTitleWeight) =>
              onChange({ headerIndexSubtitleWeight })
            }
            columns={4}
          />
        </ServicesBandGroup>
        <ServicesBandGroup title="Counter">
          <ServicesPaletteSwatches
            label="Numeral color"
            value={services.headerIndexNumberColor ?? 'principal'}
            onChange={(headerIndexNumberColor) => onChange({ headerIndexNumberColor })}
          />
        </ServicesBandGroup>
        <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'marquee') {
    return (
      <>
        <ServicesBandGroup title="Words">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ServicesTextField
              label="Word 1"
              value={services.headerMarqueeWord1Text}
              placeholder="Core"
              onChange={(headerMarqueeWord1Text) => onChange({ headerMarqueeWord1Text })}
            />
            <ServicesTextField
              label="Word 2"
              value={services.headerMarqueeWord2Text}
              placeholder="Services"
              onChange={(headerMarqueeWord2Text) => onChange({ headerMarqueeWord2Text })}
            />
            <ServicesTextField
              label="Word 3"
              value={services.headerMarqueeWord3Text}
              placeholder="Optional"
              onChange={(headerMarqueeWord3Text) => onChange({ headerMarqueeWord3Text })}
            />
            <ServicesTextField
              label="Word 4"
              value={services.headerMarqueeWord4Text}
              placeholder="Optional"
              onChange={(headerMarqueeWord4Text) => onChange({ headerMarqueeWord4Text })}
            />
          </div>
        </ServicesBandGroup>
        <ServicesBandGroup title="Style">
          <ServicesPaletteSwatches
            label="Word color"
            value={services.headerMarqueeWordColor ?? 'principal'}
            onChange={(headerMarqueeWordColor) => onChange({ headerMarqueeWordColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerMarqueeSize ?? 'md'}
            onChange={(headerMarqueeSize) => onChange({ headerMarqueeSize })}
          />
        </ServicesBandGroup>
        <ServicesHeaderSharedAdvancedControls
          services={services}
          onChange={onChange}
          hideAlignment
          hideTitleControls
        />
      </>
    );
  }

  if (design === 'accent-count') {
    return (
      <>
        <ServicesTextField
          label="Badge text"
          value={services.headerAccentCountBadgeText}
          placeholder="{count}+ services"
          onChange={(headerAccentCountBadgeText) => onChange({ headerAccentCountBadgeText })}
        />
        <ServicesTextField
          label="Lead text"
          value={services.headerAccentCountLeadText}
          placeholder="A curated set of services, ready when you need them."
          onChange={(headerAccentCountLeadText) => onChange({ headerAccentCountLeadText })}
          multiline
        />
        <ServicesBandGroup title="Style">
          <ServicesPaletteSwatches
            label="Badge color"
            value={services.headerAccentCountBadgeColor ?? 'principal'}
            onChange={(headerAccentCountBadgeColor) => onChange({ headerAccentCountBadgeColor })}
          />
          <ServicesPaletteSwatches
            label="Lead color"
            value={services.headerAccentCountLeadColor ?? 'secondaire'}
            onChange={(headerAccentCountLeadColor) => onChange({ headerAccentCountLeadColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerAccentCountSize ?? 'md'}
            onChange={(headerAccentCountSize) => onChange({ headerAccentCountSize })}
          />
          <ServicesOptionGrid
            label="Lead weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerAccentCountWeight ?? 'regular'}
            onChange={(headerAccentCountWeight: PortfolioServicesHeaderTitleWeight) =>
              onChange({ headerAccentCountWeight })
            }
            columns={4}
          />
          <ServicesOptionGrid
            label="Alignment"
            options={SERVICES_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
            value={services.headerAccentCountAlignment ?? 'left'}
            onChange={(headerAccentCountAlignment: PortfolioServicesHeaderAccentCountAlignment) =>
              onChange({ headerAccentCountAlignment })
            }
            columns={3}
          />
        </ServicesBandGroup>
        <ServicesHeaderSharedAdvancedControls
          services={services}
          onChange={onChange}
          hideAlignment
          hideTitleControls
        />
      </>
    );
  }

  if (design === 'serif-lead') {
    return (
      <>
        <ServicesTextField
          label="Label"
          value={services.headerSerifLeadLabelText}
          placeholder="Services"
          onChange={(headerSerifLeadLabelText) => onChange({ headerSerifLeadLabelText })}
        />
        <ServicesTextField
          label="Title"
          value={services.headerSerifLeadTitleText}
          placeholder="A focused set of services, built around what you need."
          onChange={(headerSerifLeadTitleText) => onChange({ headerSerifLeadTitleText })}
          multiline
        />
        <ServicesBandGroup title="Label">
          <ServicesPaletteSwatches
            label="Color"
            value={services.headerSerifLeadLabelColor ?? 'texteFort'}
            onChange={(headerSerifLeadLabelColor) => onChange({ headerSerifLeadLabelColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerSerifLeadLabelSize ?? 'md'}
            onChange={(headerSerifLeadLabelSize) => onChange({ headerSerifLeadLabelSize })}
          />
          <ServicesOptionGrid
            label="Weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerSerifLeadLabelWeight ?? 'regular'}
            onChange={(headerSerifLeadLabelWeight: PortfolioServicesHeaderTitleWeight) =>
              onChange({ headerSerifLeadLabelWeight })
            }
            columns={4}
          />
        </ServicesBandGroup>
        <ServicesBandGroup title="Title">
          <ServicesPaletteSwatches
            label="Color"
            value={services.headerSerifLeadTitleColor ?? 'texteFort'}
            onChange={(headerSerifLeadTitleColor) => onChange({ headerSerifLeadTitleColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerSerifLeadTitleSize ?? 'md'}
            onChange={(headerSerifLeadTitleSize) => onChange({ headerSerifLeadTitleSize })}
          />
          <ServicesOptionGrid
            label="Weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerSerifLeadTitleWeight ?? 'regular'}
            onChange={(headerSerifLeadTitleWeight: PortfolioServicesHeaderTitleWeight) =>
              onChange({ headerSerifLeadTitleWeight })
            }
            columns={4}
          />
        </ServicesBandGroup>
        <ServicesBandGroup title="Subtitle">
          <ServicesPaletteSwatches
            label="Color"
            value={services.headerSerifLeadSubtitleColor ?? 'texteFort'}
            onChange={(headerSerifLeadSubtitleColor) => onChange({ headerSerifLeadSubtitleColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerSerifLeadSubtitleSize ?? 'md'}
            onChange={(headerSerifLeadSubtitleSize) => onChange({ headerSerifLeadSubtitleSize })}
          />
          <ServicesOptionGrid
            label="Weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerSerifLeadSubtitleWeight ?? 'regular'}
            onChange={(headerSerifLeadSubtitleWeight: PortfolioServicesHeaderTitleWeight) =>
              onChange({ headerSerifLeadSubtitleWeight })
            }
            columns={4}
          />
        </ServicesBandGroup>
        <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'billboard') {
    return (
      <>
        <ServicesTextField
          label="Big background word"
          value={services.headerBillboardBigWord}
          placeholder="SERVICES"
          onChange={(headerBillboardBigWord) => onChange({ headerBillboardBigWord })}
        />
        <ServicesTextField
          label="Title"
          value={services.headerBillboardTitleText}
          placeholder="Core services"
          onChange={(headerBillboardTitleText) => onChange({ headerBillboardTitleText })}
        />
        <ServicesTextField
          label="Count line"
          value={services.headerBillboardCountText}
          placeholder="{count} services"
          onChange={(headerBillboardCountText) => onChange({ headerBillboardCountText })}
        />
        <ServicesBandGroup title="Style">
          <ServicesOptionGrid
            label="Big word style"
            options={SERVICES_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
            value={services.headerBillboardWordStyle ?? 'outline'}
            onChange={(headerBillboardWordStyle: PortfolioServicesHeaderBillboardWordStyle) =>
              onChange({ headerBillboardWordStyle })
            }
            columns={3}
          />
          <ServicesPaletteSwatches
            label="Big word color"
            value={services.headerBillboardWordColor ?? 'principal'}
            onChange={(headerBillboardWordColor) => onChange({ headerBillboardWordColor })}
          />
          <ServicesPaletteSwatches
            label="Title color"
            value={services.headerBillboardTitleColor ?? 'principal'}
            onChange={(headerBillboardTitleColor) => onChange({ headerBillboardTitleColor })}
          />
          <ServicesPaletteSwatches
            label="Count line color"
            value={services.headerBillboardMetaColor ?? 'secondaire'}
            onChange={(headerBillboardMetaColor) => onChange({ headerBillboardMetaColor })}
          />
        </ServicesBandGroup>
        <ServicesHeaderSharedAdvancedControls
          services={services}
          onChange={onChange}
          hideAlignment
          hideTitleControls
        />
      </>
    );
  }

  if (design === 'masthead') {
    return (
      <>
        <ServicesTextField
          label="Line 1"
          value={services.headerMastheadLine1Text}
          placeholder="Core services."
          onChange={(headerMastheadLine1Text) => onChange({ headerMastheadLine1Text })}
        />
        <ServicesTextField
          label="Line 2"
          value={services.headerMastheadLine2Text}
          placeholder="Chosen with intent."
          onChange={(headerMastheadLine2Text) => onChange({ headerMastheadLine2Text })}
        />
        <ServicesTextField
          label="Line 3"
          value={services.headerMastheadLine3Text}
          placeholder="Kept up to date."
          onChange={(headerMastheadLine3Text) => onChange({ headerMastheadLine3Text })}
        />
        <ServicesBandGroup title="Headline">
          <ServicesPaletteSwatches
            label="Color"
            value={services.headerMastheadHeadlineColor ?? 'principal'}
            onChange={(headerMastheadHeadlineColor) => onChange({ headerMastheadHeadlineColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerMastheadHeadlineSize ?? 'md'}
            onChange={(headerMastheadHeadlineSize) => onChange({ headerMastheadHeadlineSize })}
          />
          <ServicesOptionGrid
            label="Weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerMastheadHeadlineWeight ?? 'regular'}
            onChange={(headerMastheadHeadlineWeight: PortfolioServicesHeaderTitleWeight) =>
              onChange({ headerMastheadHeadlineWeight })
            }
            columns={4}
          />
        </ServicesBandGroup>
        <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'split-heading') {
    return (
      <>
        <ServicesTextField
          label="Title"
          value={services.headerSplitHeadingTitleText}
          placeholder="Core services"
          onChange={(headerSplitHeadingTitleText) => onChange({ headerSplitHeadingTitleText })}
        />
        <ServicesTextField
          label="Label"
          value={services.headerSplitHeadingLabelText}
          placeholder="Services"
          onChange={(headerSplitHeadingLabelText) => onChange({ headerSplitHeadingLabelText })}
        />
        <ServicesBandGroup title="Title">
          <ServicesPaletteSwatches
            label="Color"
            value={services.headerSplitHeadingTitleColor ?? 'principal'}
            onChange={(headerSplitHeadingTitleColor) => onChange({ headerSplitHeadingTitleColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerSplitHeadingTitleSize ?? 'md'}
            onChange={(headerSplitHeadingTitleSize) => onChange({ headerSplitHeadingTitleSize })}
          />
          <ServicesOptionGrid
            label="Weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerSplitHeadingTitleWeight ?? 'regular'}
            onChange={(headerSplitHeadingTitleWeight: PortfolioServicesHeaderTitleWeight) =>
              onChange({ headerSplitHeadingTitleWeight })
            }
            columns={4}
          />
        </ServicesBandGroup>
        <ServicesBandGroup title="Label">
          <ServicesPaletteSwatches
            label="Color"
            value={services.headerSplitHeadingLabelColor ?? 'secondaire'}
            onChange={(headerSplitHeadingLabelColor) => onChange({ headerSplitHeadingLabelColor })}
          />
          <ServicesSizePill
            label="Size"
            value={services.headerSplitHeadingLabelSize ?? 'md'}
            onChange={(headerSplitHeadingLabelSize) => onChange({ headerSplitHeadingLabelSize })}
          />
          <ServicesOptionGrid
            label="Weight"
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerSplitHeadingLabelWeight ?? 'regular'}
            onChange={(headerSplitHeadingLabelWeight: PortfolioServicesHeaderTitleWeight) =>
              onChange({ headerSplitHeadingLabelWeight })
            }
            columns={4}
          />
        </ServicesBandGroup>
        <ServicesHeaderSharedAdvancedControls
          services={services}
          onChange={onChange}
          hideAlignment
          hideTitleControls
        />
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
      <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} />
    </>
  );
}

export function ServicesSettingsPanel({
  services,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  availableServices = [],
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  subSection?: ServicesSubSection;
  onSubSectionChange?: (value: ServicesSubSection) => void;
  settingsFocus?: ServicesSettingsFocus;
  /** Real service items (id + title) from the live preview — powers the "Featured card"
   *  picker below so the creator picks by actual title instead of a bare index. */
  availableServices?: { id: string; title: string }[];
}) {
  const [designCatalogOpen, setDesignCatalogOpen] = useState(false);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ServicesSubSection>('general');
  const subSection = normalizeServicesSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: ServicesSubSection) => {
    const next = normalizeServicesSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {SERVICES_SUB_SECTIONS.map((section) => (
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
            <ServicesSectionLabel>Visibility</ServicesSectionLabel>
            <div className="mt-4">
              <ServicesVisibilityRow
                label="Show Services section"
                checked={services.showServices !== false}
                onChange={(showServices) =>
                  onChange({
                    showServices,
                    enabled: showServices || services.showSkills !== false,
                    sectionOrganization: 'distinct',
                    layoutMode: 'separated',
                  })
                }
              />
              <ServicesVisibilityRow
                label="Subheading"
                checked={services.showServicesSubheading !== false}
                onChange={(showServicesSubheading) => onChange({ showServicesSubheading })}
              />
              <ServicesVisibilityRow
                label="Response time"
                info="Typically replies label in the section header."
                checked={services.showResponseTime}
                onChange={(showResponseTime) => onChange({ showResponseTime })}
              />
            </div>
          </div>

          <div>
            <ServicesGroupLabel>Card elements</ServicesGroupLabel>
            <div className="mt-3">
              <ServicesVisibilityRow
                label="Title"
                checked={services.showServiceTitle !== false}
                onChange={(showServiceTitle) => onChange({ showServiceTitle })}
              />
              <ServicesVisibilityRow
                label="Description"
                checked={services.showServiceDescription !== false}
                onChange={(showServiceDescription) => onChange({ showServiceDescription })}
              />
              <ServicesVisibilityRow
                label="Price"
                checked={services.showServicePrice !== false}
                onChange={(showServicePrice) => onChange({ showServicePrice })}
              />
              <ServicesVisibilityRow
                label="Delivery time"
                checked={services.showServiceDelivery !== false}
                onChange={(showServiceDelivery) => onChange({ showServiceDelivery })}
              />
              <ServicesVisibilityRow
                label="Tasks checklist"
                checked={services.showServiceTasks !== false}
                onChange={(showServiceTasks) => onChange({ showServiceTasks })}
              />
              <ServicesVisibilityRow
                label="Order / contact button"
                checked={services.showServiceCta !== false}
                onChange={(showServiceCta) => onChange({ showServiceCta })}
              />
            </div>
          </div>

          <SectionColorModeControl
            value={services.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />

          <ServicesOptionGrid
            label="Font size"
            options={PORTFOLIO_SERVICES_PREMIUM_FONT_SIZE_OPTIONS}
            value={services.premiumFontSize ?? 'medium'}
            onChange={(premiumFontSize) => onChange({ premiumFontSize })}
            columns={3}
          />
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-6">
          <ServicesDesignChoiceGrid
            showGrid={designCatalogOpen}
            setShowGrid={setDesignCatalogOpen}
            value={services.sectionDesign ?? 'showcase-hero'}
            onChange={(sectionDesign) => onChange({ sectionDesign })}
          />

          {designCatalogOpen ? null : services.sectionDesign === 'services-pricing-grid' ? (
            <ServicesLayoutSettingsBand
              motionKey="services-pricing-grid"
              id="services-design-options-title"
              title="Pricing Grid options"
            >
              <div>
                <span className="flex items-center gap-1.5">
                  <ServicesGroupLabel>Featured card color</ServicesGroupLabel>
                  <ServicesInfoTooltip text="Fills the popular card with one of 4 colors from the active theme palette." />
                </span>
                <div className="mt-3 flex flex-wrap gap-3">
                  {PRICING_GRID_POPULAR_COLOR_OPTIONS.map((option) => {
                    const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
                    const hex = resolveHeroPaletteColor(palette, option.value);
                    const current = (services.pricingGrid ?? DEFAULT_SERVICES_PRICING_GRID_SETTINGS)
                      .popularColorToken;
                    const active = current === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          onChange({
                            pricingGrid: {
                              ...(services.pricingGrid ?? DEFAULT_SERVICES_PRICING_GRID_SETTINGS),
                              popularColorToken: option.value,
                            },
                          })
                        }
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
            </ServicesLayoutSettingsBand>
          ) : null}

          {designCatalogOpen ? null : services.sectionDesign === 'services-pricing-bento' ? (
            <ServicesLayoutSettingsBand
              motionKey="services-pricing-bento"
              id="services-design-options-title"
              title="Pricing Bento options"
            >
              <div>
                <span className="flex items-center gap-1.5">
                  <ServicesGroupLabel>Featured card</ServicesGroupLabel>
                  <ServicesInfoTooltip text="The featured card gets the textured graphic header that sets it apart from the others." />
                </span>
                {availableServices.length > 0 ? (
                  <ServicesOptionGrid
                    label="Featured card"
                    hideLabel
                    options={availableServices.map((service, index) => ({
                      value: String(index),
                      label: service.title.trim() || `Service ${index + 1}`,
                    }))}
                    value={String(
                      Math.min(
                        (services.pricingBento ?? DEFAULT_SERVICES_PRICING_BENTO_SETTINGS).graphicHeaderIndex,
                        availableServices.length - 1
                      )
                    )}
                    onChange={(next) =>
                      onChange({
                        pricingBento: {
                          ...(services.pricingBento ?? DEFAULT_SERVICES_PRICING_BENTO_SETTINGS),
                          graphicHeaderIndex: Number(next),
                        },
                      })
                    }
                    columns={2}
                  />
                ) : (
                  <p className="mt-3 text-xs text-neutral-400">
                    Add a service to choose which card is featured.
                  </p>
                )}
              </div>
            </ServicesLayoutSettingsBand>
          ) : null}

          {designCatalogOpen ? null : services.sectionDesign === 'services-pricing-monolith' ? (
            <ServicesLayoutSettingsBand
              motionKey="services-pricing-monolith"
              id="services-design-options-title"
              title="Pricing Monolith options"
            >
              <ServicesPreviewCardGrid
                label="Cards per row"
                options={PORTFOLIO_SERVICES_PRICING_MONOLITH_COLUMNS_OPTIONS.map((option) => ({
                  value: String(option.value) as '1' | '2' | '3' | '4',
                  label: option.label,
                  glyph: servicesPricingColumnsGlyph(option.value),
                }))}
                value={String(
                  (services.servicesPricingMonolith ?? DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS).cardsPerRow ?? 3
                ) as '1' | '2' | '3' | '4'}
                onChange={(next) =>
                  onChange({
                    servicesPricingMonolith: {
                      ...(services.servicesPricingMonolith ?? DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS),
                      cardsPerRow: (next === '1' ? 1 : next === '2' ? 2 : next === '4' ? 4 : 3) as PortfolioServicesPricingMonolithColumns,
                    },
                  })
                }
                columns={4}
              />
            </ServicesLayoutSettingsBand>
          ) : null}

          {designCatalogOpen ? null : services.sectionDesign === 'services-pricing-aurora' ? (
            <ServicesLayoutSettingsBand
              motionKey="services-pricing-aurora"
              id="services-design-options-title"
              title="Pricing Aurora options"
            >
              <ServicesPreviewCardGrid
                label="Cards per row"
                options={PORTFOLIO_SERVICES_PRICING_AURORA_COLUMNS_OPTIONS.map((option) => ({
                  value: String(option.value) as '1' | '2' | '3' | '4',
                  label: option.label,
                  glyph: servicesPricingColumnsGlyph(option.value),
                }))}
                value={String(
                  (services.servicesPricingAurora ?? DEFAULT_SERVICES_PRICING_AURORA_SETTINGS).cardsPerRow ?? 3
                ) as '1' | '2' | '3' | '4'}
                onChange={(next) =>
                  onChange({
                    servicesPricingAurora: {
                      ...(services.servicesPricingAurora ?? DEFAULT_SERVICES_PRICING_AURORA_SETTINGS),
                      cardsPerRow: (next === '1' ? 1 : next === '2' ? 2 : next === '4' ? 4 : 3) as PortfolioServicesPricingAuroraColumns,
                    },
                  })
                }
                columns={4}
              />

              <div>
                <span className="flex items-center gap-1.5">
                  <ServicesGroupLabel>Featured card</ServicesGroupLabel>
                  <ServicesInfoTooltip text="The featured card gets the accent gradient border and glass tint that sets it apart from the others." />
                </span>
                {availableServices.length > 0 ? (
                  <ServicesOptionGrid
                    label="Featured card"
                    hideLabel
                    options={availableServices.map((service, index) => ({
                      value: String(index),
                      label: service.title.trim() || `Service ${index + 1}`,
                    }))}
                    value={String(
                      Math.min(
                        (services.servicesPricingAurora ?? DEFAULT_SERVICES_PRICING_AURORA_SETTINGS).popularIndex,
                        availableServices.length - 1
                      )
                    )}
                    onChange={(next) =>
                      onChange({
                        servicesPricingAurora: {
                          ...(services.servicesPricingAurora ?? DEFAULT_SERVICES_PRICING_AURORA_SETTINGS),
                          popularIndex: Number(next),
                        },
                      })
                    }
                    columns={2}
                  />
                ) : (
                  <p className="mt-3 text-xs text-neutral-400">
                    Add a service to choose which card is featured.
                  </p>
                )}
              </div>

              <div>
                <span className="flex items-center gap-1.5">
                  <ServicesGroupLabel>Featured card color</ServicesGroupLabel>
                  <ServicesInfoTooltip text="Colors the featured card's gradient border and glass tint from the active theme palette." />
                </span>
                <div className="mt-3 flex flex-wrap gap-3">
                  {PRICING_AURORA_POPULAR_COLOR_OPTIONS.map((option) => {
                    const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
                    const hex = resolveHeroPaletteColor(palette, option.value);
                    const current = (services.servicesPricingAurora ?? DEFAULT_SERVICES_PRICING_AURORA_SETTINGS)
                      .popularColorToken;
                    const active = current === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          onChange({
                            servicesPricingAurora: {
                              ...(services.servicesPricingAurora ?? DEFAULT_SERVICES_PRICING_AURORA_SETTINGS),
                              popularColorToken: option.value,
                            },
                          })
                        }
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
            </ServicesLayoutSettingsBand>
          ) : null}

          {designCatalogOpen || SERVICES_DESIGNS_WITH_OPTIONS.has(services.sectionDesign) ? null : (
            <p className="text-xs text-neutral-400">
              This design has no options of its own — what shows on a card is set in General → Card elements.
            </p>
          )}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-4">
          <SectionBackgroundSettingsFields
            settings={services}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onColorChange }) => {
              const slot = SERVICES_BACKGROUND_LABEL_SLOTS[label];
              if (!slot) {
                return <ServicesManualColorField label={label} value={value} onChange={onColorChange} />;
              }
              return (
                <ServicesColorField services={services} onChange={onChange} slot={slot} label={label} value={value} />
              );
            }}
          />
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <ServicesHeaderChoiceGrid
            value={services.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
          />

          <ServicesLayoutSettingsBand
            motionKey={services.headerDesign ?? 'editorial'}
            id="services-header-settings-title"
            title="Header settings"
          >
            <ServicesBandGroup title="Section title">
              <ServicesOptionGrid
                label="Title preset"
                hideLabel
                options={PORTFOLIO_SERVICES_DISTINCT_SERVICES_TITLE_PRESET_OPTIONS}
                value={services.titlePreset}
                onChange={(titlePreset) => onChange({ titlePreset })}
                columns={2}
              />
              {services.titlePreset === 'custom' ? (
                <input
                  type="text"
                  value={services.titleCustom}
                  placeholder="Services"
                  aria-label="Custom section title"
                  onChange={(event) => onChange({ titleCustom: event.target.value })}
                  className={SERVICES_INPUT_CLASS}
                />
              ) : null}
            </ServicesBandGroup>

            <ServicesBandGroup title="Subtitle">
              <ServicesOptionGrid
                label="Subtitle preset"
                hideLabel
                options={PORTFOLIO_SERVICES_DISTINCT_SERVICES_SUBTITLE_PRESET_OPTIONS}
                value={services.subtitlePreset}
                onChange={(subtitlePreset) => onChange({ subtitlePreset })}
                columns={2}
              />
              {services.subtitlePreset === 'custom' ? (
                <textarea
                  value={services.subtitleCustom}
                  rows={2}
                  placeholder="What I can help you with."
                  aria-label="Custom subtitle"
                  onChange={(event) => onChange({ subtitleCustom: event.target.value })}
                  className={`${SERVICES_INPUT_CLASS} resize-y`}
                />
              ) : null}
            </ServicesBandGroup>

            <ServicesHeaderDesignFields services={services} onChange={onChange} />
          </ServicesLayoutSettingsBand>
        </div>
      ) : null}
    </div>
  );
}
