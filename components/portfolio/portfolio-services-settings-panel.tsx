'use client';

import { createContext, useContext, useId, useState, type CSSProperties, type ReactNode } from 'react';
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
  DEFAULT_SERVICES_PRICING_STYLE_SETTINGS,
  PORTFOLIO_SERVICES_PRICING_BORDER_COLOR_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CARD_RADIUS_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CTA_LINK_MODE_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CTA_SECTION_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CTA_SHAPE_OPTIONS,
  type PortfolioServicesPricingStyleSettings,
} from '@/components/portfolio/portfolio-services-pricing-style';
import {
  DEFAULT_SERVICES_INDEX_LIST_SETTINGS,
  DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_COUNT_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_GAP_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_HOVER_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_MOBILE_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_RADIUS_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_RATIO_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_TEXT_ALIGN_OPTIONS,
  type PortfolioServicesMediaColumnsRadius,
  type PortfolioServicesMediaColumnsRatio,
  type PortfolioServicesMediaColumnsSettings,
  DEFAULT_SERVICES_PRICING_AURORA_SETTINGS,
  DEFAULT_SERVICES_PRICING_BENTO_SETTINGS,
  PORTFOLIO_SERVICES_INDEX_LIST_LAYOUT_OPTIONS,
  PORTFOLIO_SERVICES_INDEX_LIST_MEDIA_RATIO_OPTIONS,
  PORTFOLIO_SERVICES_INDEX_LIST_TASKS_STYLE_OPTIONS,
  type PortfolioServicesIndexListLayout,
  type PortfolioServicesIndexListSettings,
  type PortfolioServicesIndexListTasksStyle,
  DEFAULT_SERVICES_PRICING_GRID_SETTINGS,
  DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS,
  DEFAULT_SERVICES_PRICING_TOGGLE_SETTINGS,
  PORTFOLIO_SERVICES_PRICING_BENTO_MOTIF_OPTIONS,
  PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS,
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
import { PortfolioHeaderDesignOption } from '@/components/portfolio/portfolio-header-design-lock';
import {
  SettingsWithViews,
  SvChoiceTiles,
  SvPickOne,
  SvSwatches,
  SvTextInput,
  useSettingsVariant,
  type SettingGroup,
  type SettingItem,
} from '@/components/portfolio/portfolio-settings-variants';

/** Top-level settings entry: kept for API compatibility with callers, though only
 *  'services' is currently wired up anywhere in the app (no live 'skills' entry point). */
type ServicesSettingsFocus = 'skills' | 'services';

export type ServicesSubSection = 'general' | 'design' | 'background' | 'header';

const SERVICES_SUB_SECTIONS: { id: ServicesSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility and defaults.' },
  { id: 'design', label: 'Design', description: 'Layout and visual style.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
  { id: 'background', label: 'Background', description: 'Fill behind this section.' },
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
  'services-index-list',
  'services-media-columns',
  'services-pricing-grid',
  'services-pricing-bento',
  'services-pricing-monolith',
  'services-pricing-aurora',
  'services-pricing-toggle',
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

/**
 * How field labels read: small uppercase captions by default, or plain sentence-case row titles
 * inside a settings block (the grouped-rows look of a phone's system settings).
 */
const ServicesLabelStyleContext = createContext<'caps' | 'row'>('caps');

const SERVICES_ROW_LABEL_CLASS =
  'text-[14px] font-medium leading-snug text-[color:var(--pf-palette-texte-fort,#171717)]';

function ServicesSectionLabel({ children }: { children: string }) {
  const mode = useContext(ServicesLabelStyleContext);
  if (mode === 'row') return <p className={SERVICES_ROW_LABEL_CLASS}>{children}</p>;
  return <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{children}</p>;
}

function ServicesGroupLabel({ children }: { children: string }) {
  const mode = useContext(ServicesLabelStyleContext);
  if (mode === 'row') return <p className={SERVICES_ROW_LABEL_CLASS}>{children}</p>;
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
  if (design === 'services-media-columns') {
    return (
      <ServicesMiniSlide>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect className="pf-stack-mini-mute" x={8 + i * 26} y={10} width={22} height={34} rx={3} />
            <rect className="pf-stack-mini-ink" x={8 + i * 26} y={49} width={16} height={3} rx={1.5} />
            <rect className="pf-stack-mini-mute" x={8 + i * 26} y={55} width={21} height={2} rx={1} />
            <rect className="pf-stack-mini-mute" x={8 + i * 26} y={60} width={14} height={2} rx={1} />
          </g>
        ))}
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-index-list') {
    return (
      <ServicesMiniSlide>
        <rect className="pf-stack-mini-ink" x="8" y="10" width="40" height="1.5" />
        <rect className="pf-stack-mini-mute" x="8" y="15" width="6" height="2" rx="1" />
        <rect className="pf-stack-mini-ink" x="8" y="21" width="30" height="5" rx="2" />
        <rect className="pf-stack-mini-mute" x="8" y="30" width="36" height="2" rx="1" />
        <rect className="pf-stack-mini-ring" x="8" y="36" width="14" height="5" rx="2.5" />
        <rect className="pf-stack-mini-ring" x="25" y="36" width="18" height="5" rx="2.5" />
        <rect className="pf-stack-mini-mute" x="56" y="10" width="56" height="30" rx="1" />
        <rect className="pf-stack-mini-ink" x="8" y="50" width="40" height="1.5" />
        <rect className="pf-stack-mini-mute" x="56" y="50" width="56" height="14" rx="1" />
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
      className={`pf-services-design-card relative text-left ${compact ? 'p-2' : 'p-3'}`}
    >
      {children}
      <span
        className={`pf-services-card-label block font-semibold leading-tight ${
          compact ? 'mt-2 text-xs' : 'mt-3 text-[13.5px]'
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
                active ? SERVICES_STYLE_PILL_ACTIVE : SERVICES_STYLE_PILL_IDLE
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

/** Mini media-side previews for Index List's layout picker (64×34 stage): text bars + a media block. */
function servicesIndexListLayoutGlyph(layout: PortfolioServicesIndexListLayout): ReactNode {
  const row = (y: number, h: number, mediaLeft: boolean) => (
    <>
      <rect className="pf-stack-mini-mute" x={mediaLeft ? 6 : 36} y={y} width={22} height={h} rx={1.5} />
      <rect className="pf-stack-mini-ink" x={mediaLeft ? 34 : 6} y={y} width={16} height={2} rx={1} />
      <rect className="pf-stack-mini-ink" x={mediaLeft ? 34 : 6} y={y + 5} width={11} height={1.5} rx={0.75} />
      <rect className="pf-stack-mini-ink" x={mediaLeft ? 34 : 6} y={y + 9} width={14} height={1.5} rx={0.75} />
    </>
  );
  if (layout === 'zigzag') {
    return (
      <>
        {row(5, 11, false)}
        {row(19, 11, true)}
      </>
    );
  }
  return row(9, 16, layout === 'media-left');
}

/** Media Columns' ratio picker: a media block of the real proportion plus a text line. */
function servicesMediaColumnsRatioGlyph(ratio: PortfolioServicesMediaColumnsRatio): ReactNode {
  const dims: Record<PortfolioServicesMediaColumnsRatio, [number, number]> = {
    portrait: [18, 22],
    square: [20, 20],
    landscape: [26, 19],
    wide: [32, 18],
  };
  const [w, h] = dims[ratio];
  const x = 32 - w / 2;
  const y = 3 + (24 - h) / 2;
  return (
    <>
      <rect className="pf-stack-mini-ink" x={x} y={y} width={w} height={h} rx={2} />
      <rect className="pf-stack-mini-mute" x={x} y={29} width={w * 0.7} height={2} rx={1} />
    </>
  );
}

/** Media Columns' radius picker: a block drawn with the real rounding (scaled to the stage). */
function servicesMediaColumnsRadiusGlyph(radius: PortfolioServicesMediaColumnsRadius): ReactNode {
  const rx: Record<PortfolioServicesMediaColumnsRadius, number> = {
    none: 0,
    small: 1.5,
    medium: 3.5,
    large: 7,
    round: 11,
  };
  return <rect className="pf-stack-mini-ink" x={20} y={5} width={24} height={24} rx={rx[radius]} />;
}

/** Mini previews for Index List's task presentations (64×34 stage). */
function servicesIndexListTasksGlyph(style: PortfolioServicesIndexListTasksStyle): ReactNode {
  switch (style) {
    case 'ledger':
      return (
        <>
          {[8, 16, 24].map((y) => (
            <g key={y}>
              <rect className="pf-stack-mini-ink" x={6} y={y} width={52} height={0.8} />
              <rect className="pf-stack-mini-ink" x={8} y={y + 3} width={20} height={2} rx={1} />
              <rect className="pf-stack-mini-accent" x={52} y={y + 3} width={4} height={2} rx={1} />
            </g>
          ))}
        </>
      );
    case 'numbered':
      return (
        <>
          {[0, 1].map((col) =>
            [8, 16, 24].map((y) => (
              <g key={`${col}-${y}`}>
                <rect className="pf-stack-mini-ink" x={6 + col * 28} y={y} width={24} height={0.8} />
                <rect className="pf-stack-mini-accent" x={7 + col * 28} y={y + 3} width={3} height={2} rx={1} />
                <rect className="pf-stack-mini-ink" x={12 + col * 28} y={y + 3} width={12} height={2} rx={1} />
              </g>
            ))
          )}
        </>
      );
    case 'inline':
      return (
        <>
          <rect className="pf-stack-mini-ink" x={6} y={11} width={14} height={2.5} rx={1.25} />
          <rect className="pf-stack-mini-mute" x={23} y={10} width={1.5} height={5} />
          <rect className="pf-stack-mini-ink" x={27} y={11} width={18} height={2.5} rx={1.25} />
          <rect className="pf-stack-mini-mute" x={48} y={10} width={1.5} height={5} />
          <rect className="pf-stack-mini-ink" x={52} y={11} width={6} height={2.5} rx={1.25} />
          <rect className="pf-stack-mini-ink" x={6} y={20} width={20} height={2.5} rx={1.25} />
          <rect className="pf-stack-mini-mute" x={29} y={19} width={1.5} height={5} />
          <rect className="pf-stack-mini-ink" x={33} y={20} width={12} height={2.5} rx={1.25} />
        </>
      );
    default:
      return (
        <>
          <rect className="pf-stack-mini-ring" x={6} y={9} width={20} height={6.5} rx={3.25} />
          <rect className="pf-stack-mini-ring" x={29} y={9} width={14} height={6.5} rx={3.25} />
          <rect className="pf-stack-mini-ring" x={46} y={9} width={12} height={6.5} rx={3.25} />
          <rect className="pf-stack-mini-ring" x={6} y={19} width={14} height={6.5} rx={3.25} />
          <rect className="pf-stack-mini-ring" x={23} y={19} width={22} height={6.5} rx={3.25} />
        </>
      );
  }
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
                active ? 'pf-choice pf-choice--active' : 'pf-choice'
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

/** Chosen option: a light border and a faint tint instead of a solid fill — reads the same in light and dark. */
const SERVICES_STYLE_PILL_ACTIVE =
  'border border-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_40%,transparent)] bg-[color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_7%,transparent)] text-[color:var(--pf-palette-texte-fort,#171717)]';
const SERVICES_STYLE_PILL_IDLE = 'border border-transparent bg-neutral-100 text-neutral-600 hover:bg-neutral-200';

const SERVICES_SIZE_STEPS: { value: PortfolioServicesHeaderTitleSize; tick: string; name: string }[] = [
  { value: 'sm', tick: 'S', name: 'Small' },
  { value: 'md', tick: 'M', name: 'Medium' },
  { value: 'lg', tick: 'L', name: 'Large' },
  { value: 'xl', tick: 'XL', name: 'Extra large' },
];

/** `css` is the real font-weight each step is drawn in, so the scale can be read at a glance. */
const SERVICES_WEIGHT_STEPS: { value: PortfolioServicesHeaderTitleWeight; tick: string; css: number }[] = [
  { value: 'light', tick: 'Light', css: 300 },
  { value: 'regular', tick: 'Regular', css: 400 },
  { value: 'semibold', tick: 'Semibold', css: 600 },
  { value: 'bold', tick: 'Bold', css: 800 },
];

/** Horizontal bar with one stop per option — same `.pf-exp-centered-slider` control as the
 *  Experience panel's stepped sliders. The current step is named on the right of the label. */
function ServicesSteppedSlider<T extends string>({
  label,
  steps,
  value,
  currentName,
  onChange,
  stepStyle,
}: {
  label: string;
  steps: { value: T; tick: string }[];
  value: T;
  currentName: string;
  onChange: (value: T) => void;
  stepStyle?: (step: { value: T; tick: string }) => CSSProperties;
}) {
  const index = Math.max(0, steps.findIndex((step) => step.value === value));
  const current = steps[index]!;
  return (
    <div>
      <div className="pf-exp-centered-slider-head">
        <ServicesGroupLabel>{label}</ServicesGroupLabel>
        <span className="text-[13px] font-medium text-neutral-600" style={stepStyle ? stepStyle(current) : undefined}>
          {currentName}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={steps.length - 1}
        step={1}
        value={index}
        aria-label={label}
        aria-valuetext={currentName}
        onChange={(event) => {
          const next = steps[Number(event.target.value)];
          if (next) onChange(next.value);
        }}
        className="pf-exp-centered-slider pf-exp-centered-slider--thick"
        style={{ '--pf-exp-slider-fill': `${(index / Math.max(steps.length - 1, 1)) * 100}%` } as CSSProperties}
      />
      <div
        className="pf-exp-centered-slider-ticks"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step) => (
          <button
            key={step.value}
            type="button"
            data-active={step.value === value ? 'true' : 'false'}
            onClick={() => onChange(step.value)}
            style={{ ...(stepStyle ? stepStyle(step) : null), fontSize: 11, textTransform: 'none', letterSpacing: 0 }}
          >
            {step.tick}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Palette token picker: three equal buttons (dot centered), the chosen name on the right of the label. */
function ServicesColorRow({
  label = 'Color',
  value,
  onChange,
}: {
  label?: string;
  value: PortfolioServicesHeaderPaletteToken;
  onChange: (value: PortfolioServicesHeaderPaletteToken) => void;
}) {
  return (
    <div>
      <div className="pf-exp-centered-slider-head">
        <ServicesGroupLabel>{label}</ServicesGroupLabel>
        <span className="text-[13px] font-medium text-neutral-600">
          {SERVICES_HEADER_PALETTE_TOKEN_OPTIONS.find((option) => option.value === value)?.label}
        </span>
      </div>
      <div role="radiogroup" aria-label={label} className="mt-3 grid grid-cols-3 gap-2">
        {SERVICES_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={option.label}
              title={option.label}
              onClick={() => onChange(option.value)}
              className={`flex h-10 w-full items-center justify-center rounded-lg transition ${
                active ? SERVICES_STYLE_PILL_ACTIVE : SERVICES_STYLE_PILL_IDLE
              }`}
            >
              <span
                aria-hidden
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ backgroundColor: servicesHeaderPaletteTokenColor(option.value) }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const SERVICES_MARQUEE_WORD_PLACEHOLDERS = ['Services', 'Optional', 'Optional', 'Optional'] as const;
const SERVICES_MARQUEE_MAX_WORDS = 4;

/**
 * Marquee's words, added one at a time: only Word 1 to start, "Add word" up to four, the last one removable. A removed word is cleared, so the
 * saved header never keeps text the editor no longer shows.
 */
function ServicesMarqueeWords({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const keys = [
    'headerMarqueeWord1Text',
    'headerMarqueeWord2Text',
    'headerMarqueeWord3Text',
    'headerMarqueeWord4Text',
  ] as const;
  const lastFilled = keys.reduce((last, key, index) => (services[key]?.trim() ? index : last), -1);
  const [count, setCount] = useState(Math.max(1, lastFilled + 1));

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
      {keys.slice(0, count).map((key, index) => {
        const isLast = index === count - 1;
        return (
          <div key={key}>
            <div className="flex h-5 items-center justify-between gap-2">
              <ServicesSectionLabel>{`Word ${index + 1}`}</ServicesSectionLabel>
              {isLast && count > 1 ? (
                <button
                  type="button"
                  aria-label={`Remove word ${index + 1}`}
                  title="Remove word"
                  onClick={() => {
                    onChange({ [key]: '' } as Partial<PortfolioServicesSectionSettings>);
                    setCount(count - 1);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              ) : null}
            </div>
            <input
              type="text"
              value={services[key]}
              placeholder={SERVICES_MARQUEE_WORD_PLACEHOLDERS[index]}
              aria-label={`Word ${index + 1}`}
              onChange={(event) => onChange({ [key]: event.target.value } as Partial<PortfolioServicesSectionSettings>)}
              className={`mt-2 ${SERVICES_INPUT_CLASS}`}
            />
          </div>
        );
      })}
      {count < SERVICES_MARQUEE_MAX_WORDS ? (
        <div className="flex flex-col">
          <div className="h-5" aria-hidden />
          <button
            type="button"
            onClick={() => setCount(count + 1)}
            className="mt-2 flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 text-sm font-medium text-neutral-500 transition hover:border-neutral-500 hover:text-neutral-800"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add word
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Marquee's words share one style: a single color and size for the whole running line. */
function ServicesMarqueeStyle({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const color = services.headerMarqueeWordColor ?? 'principal';
  const size = services.headerMarqueeSize ?? 'md';
  const styled = color !== 'principal' || size !== 'md';
  return (
    <div className="pf-exp-centered-config space-y-8">
      <div className="flex items-center justify-between gap-3">
        <ServicesGroupLabel>Text style</ServicesGroupLabel>
        {styled ? (
          <button
            type="button"
            onClick={() => onChange({ headerMarqueeWordColor: 'principal', headerMarqueeSize: 'md' })}
            className="text-xs font-medium text-neutral-400 underline-offset-2 transition hover:text-neutral-700 hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>
      <ServicesColorRow value={color} onChange={(headerMarqueeWordColor) => onChange({ headerMarqueeWordColor })} />
      <ServicesSteppedSlider
        label="Size"
        steps={SERVICES_SIZE_STEPS}
        value={size}
        currentName={SERVICES_SIZE_STEPS.find((step) => step.value === size)?.name ?? ''}
        onChange={(headerMarqueeSize) => onChange({ headerMarqueeSize })}
      />
    </div>
  );
}

/** One styleable text of a header: which settings hold its color / size / weight (any can be absent). */
type ServicesStyleTarget = {
  id: string;
  label: string;
  color?: { key: string; fallback: PortfolioServicesHeaderPaletteToken };
  size?: { key: string; fallback: PortfolioServicesHeaderTitleSize };
  weight?: { key: string; fallback: PortfolioServicesHeaderTitleWeight };
};

/**
 * Style editor shared by every Services header design: pick the text to style (radio — hidden when
 * there is only one), then set only the controls that text actually has: color, size, weight.
 * Replaces a Color / Size / Weight triplet per text, so each design reads the same way.
 */
function ServicesStyleTargetsEditor({
  services,
  onChange,
  targets,
  initialId,
  title = 'Text style',
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  targets: ServicesStyleTarget[];
  initialId?: string;
  title?: string;
}) {
  const [targetId, setTargetId] = useState(initialId ?? targets[0]!.id);
  const target = targets.find((item) => item.id === targetId) ?? targets[0]!;
  const record = services as unknown as Record<string, unknown>;
  const read = <T,>(field: { key: string; fallback: T }): T => (record[field.key] as T | undefined) ?? field.fallback;
  const apply = (key: string, value: string) =>
    onChange({ [key]: value } as Partial<PortfolioServicesSectionSettings>);

  const color = target.color ? read(target.color) : null;
  const size = target.size ? read(target.size) : null;
  const weight = target.weight ? read(target.weight) : null;
  const styled =
    (target.color && color !== target.color.fallback) ||
    (target.size && size !== target.size.fallback) ||
    (target.weight && weight !== target.weight.fallback);

  return (
    <div className="pf-exp-centered-config space-y-8">
      <div className="flex items-center justify-between gap-3">
        <ServicesGroupLabel>{title}</ServicesGroupLabel>
        {styled ? (
          <button
            type="button"
            onClick={() => {
              const patch: Record<string, string> = {};
              for (const field of [target.color, target.size, target.weight]) {
                if (field) patch[field.key] = field.fallback;
              }
              onChange(patch as Partial<PortfolioServicesSectionSettings>);
            }}
            className="text-xs font-medium text-neutral-400 underline-offset-2 transition hover:text-neutral-700 hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>

      {targets.length > 1 ? (
        <div
          role="radiogroup"
          aria-label="Text to style"
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${targets.length}, minmax(0, 1fr))` }}
        >
          {targets.map((item) => {
            const on = item.id === target.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTargetId(item.id)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-2 text-[13px] font-semibold transition ${
                  on ? SERVICES_STYLE_PILL_ACTIVE : SERVICES_STYLE_PILL_IDLE
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    on ? 'border-current' : 'border-neutral-400'
                  }`}
                >
                  {on ? <span className="h-2 w-2 rounded-full bg-current" /> : null}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {target.color && color ? (
        <ServicesColorRow value={color} onChange={(next) => apply(target.color!.key, next)} />
      ) : null}

      {target.size && size ? (
        <ServicesSteppedSlider
          label="Size"
          steps={SERVICES_SIZE_STEPS}
          value={size}
          currentName={SERVICES_SIZE_STEPS.find((step) => step.value === size)?.name ?? ''}
          onChange={(next) => apply(target.size!.key, next)}
        />
      ) : null}

      {target.weight && weight ? (
        <ServicesSteppedSlider
          label="Weight"
          steps={SERVICES_WEIGHT_STEPS}
          value={weight}
          currentName={SERVICES_WEIGHT_STEPS.find((step) => step.value === weight)?.tick ?? ''}
          onChange={(next) => apply(target.weight!.key, next)}
          stepStyle={(step) => ({ fontWeight: SERVICES_WEIGHT_STEPS.find((item) => item.value === step.value)?.css })}
        />
      ) : null}
    </div>
  );
}

/** Label / Title / Subtitle, each with color + size + weight (Editorial, Index, Serif lead). */
function ServicesTextStyleEditor({
  services,
  onChange,
  prefix,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  /** Settings key prefix of the header design, e.g. `headerEditorial` -> `headerEditorialTitleColor`. */
  prefix: 'headerEditorial' | 'headerIndex' | 'headerSerifLead';
}) {
  const targets: ServicesStyleTarget[] = (['Label', 'Title', 'Subtitle'] as const).map((name) => ({
    id: name,
    label: name,
    color: { key: `${prefix}${name}Color`, fallback: 'texteFort' },
    size: { key: `${prefix}${name}Size`, fallback: 'md' },
    weight: { key: `${prefix}${name}Weight`, fallback: 'regular' },
  }));
  return <ServicesStyleTargetsEditor services={services} onChange={onChange} targets={targets} initialId="Title" />;
}

/** Hairline-separated block under a design's text fields. */
function ServicesHeaderBlock({ children }: { children: ReactNode }) {
  return <div className="border-t border-neutral-200/70 pt-9">{children}</div>;
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
  open: showGrid,
  onOpenChange: setShowGrid,
}: {
  value: PortfolioServicesHeaderDesign;
  onChange: (value: PortfolioServicesHeaderDesign) => void;
  /** Whether the catalog of designs is open (owned by the panel so it can hide the settings below). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
              <PortfolioHeaderDesignOption key={option.value} design={option.value}>
                <ServicesPickerCard
                  active={active}
                  label={option.label}
                  onClick={() => {
                    onChange(option.value);
                    setShowGrid(false);
                  }}
                >
                  <ServicesHeaderDesignWireframe design={option.value} />
                </ServicesPickerCard>
              </PortfolioHeaderDesignOption>
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

/** Bottom spacing — plus alignment and the shared title size/weight, but
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
    <div className="space-y-7 border-t border-neutral-200/70 pt-9">
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
    </div>
  );
}

const SERVICES_RADIUS_GLYPH_PX: Record<string, number> = { auto: 6, square: 0, soft: 3, rounded: 7, xl: 11 };
const SERVICES_BORDER_GLYPH_STROKE: Record<string, number> = { auto: 1.6, none: 0, thin: 1, medium: 2.2, thick: 3.6 };

function servicesRadiusGlyph(value: string): ReactNode {
  return (
    <rect
      x="6"
      y="5"
      width="28"
      height="18"
      rx={SERVICES_RADIUS_GLYPH_PX[value] ?? 6}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeDasharray={value === 'auto' ? '3 2.5' : undefined}
    />
  );
}

function servicesBorderGlyph(value: string): ReactNode {
  const stroke = SERVICES_BORDER_GLYPH_STROKE[value] ?? 1.6;
  return (
    <rect
      x="6"
      y="5"
      width="28"
      height="18"
      rx="5"
      fill={value === 'none' ? 'currentColor' : 'none'}
      fillOpacity={value === 'none' ? 0.14 : undefined}
      stroke={value === 'none' ? 'none' : 'currentColor'}
      strokeWidth={stroke}
      strokeDasharray={value === 'auto' ? '3 2.5' : undefined}
    />
  );
}

function ServicesLayoutSettingsBand({
  children,
  motionKey,
  id = 'services-layout-settings-title',
  title = 'Header settings',
  ariaTitle,
  flush = false,
}: {
  children: ReactNode;
  motionKey: string;
  id?: string;
  /** Visible heading; pass '' to hide it (the band then announces `ariaTitle` instead). */
  title?: string;
  ariaTitle?: string;
  /** Drops the boxed frame so the fields use the dock's full width. */
  flush?: boolean;
}) {
  return (
    <section
      className={`pf-exp-layout-settings${flush ? ' pf-exp-layout-settings--flush' : ''}`}
      aria-labelledby={id}
    >
      {title ? (
        <h3 id={id} className="pf-exp-layout-settings-title">
          {title}
        </h3>
      ) : (
        <h3 id={id} className="sr-only">
          {ariaTitle}
        </h3>
      )}
      <div key={motionKey} className={`pf-exp-layout-settings-body ${flush ? 'space-y-9' : 'space-y-7'}`}>
        {children}
      </div>
    </section>
  );
}


/* ---------------------------------------------------------------------- */
/* Pricing designs — the card / border / button options they all share.     */
/* ---------------------------------------------------------------------- */

type ServicesPricingDesignKey = 'grid' | 'bento' | 'monolith' | 'aurora' | 'toggle';

function servicesPricingButtonLabel(
  services: PortfolioServicesSectionSettings,
  design: ServicesPricingDesignKey
): string {
  switch (design) {
    case 'grid':
      return (services.pricingGrid ?? DEFAULT_SERVICES_PRICING_GRID_SETTINGS).ctaLabel;
    case 'bento':
      return (services.pricingBento ?? DEFAULT_SERVICES_PRICING_BENTO_SETTINGS).ctaLabel;
    case 'monolith':
      return (services.servicesPricingMonolith ?? DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS).ctaLabel;
    case 'aurora':
      return (services.servicesPricingAurora ?? DEFAULT_SERVICES_PRICING_AURORA_SETTINGS).ctaLabel;
    default:
      return (services.pricingToggle ?? DEFAULT_SERVICES_PRICING_TOGGLE_SETTINGS).ctaLabel;
  }
}

function servicesPricingButtonLabelPatch(
  services: PortfolioServicesSectionSettings,
  design: ServicesPricingDesignKey,
  ctaLabel: string
): Partial<PortfolioServicesSectionSettings> {
  switch (design) {
    case 'grid':
      return { pricingGrid: { ...(services.pricingGrid ?? DEFAULT_SERVICES_PRICING_GRID_SETTINGS), ctaLabel } };
    case 'bento':
      return { pricingBento: { ...(services.pricingBento ?? DEFAULT_SERVICES_PRICING_BENTO_SETTINGS), ctaLabel } };
    case 'monolith':
      return {
        servicesPricingMonolith: {
          ...(services.servicesPricingMonolith ?? DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS),
          ctaLabel,
        },
      };
    case 'aurora':
      return {
        servicesPricingAurora: {
          ...(services.servicesPricingAurora ?? DEFAULT_SERVICES_PRICING_AURORA_SETTINGS),
          ctaLabel,
        },
      };
    default:
      return { pricingToggle: { ...(services.pricingToggle ?? DEFAULT_SERVICES_PRICING_TOGGLE_SETTINGS), ctaLabel } };
  }
}

function ServicesHeaderDesignFields({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const design = services.headerDesign ?? 'editorial';

  if (design === 'index') {
    const numberColor = services.headerIndexNumberColor ?? 'principal';
    return (
      <>
        <div className="space-y-6">
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
        </div>
        <div className="border-t border-neutral-200/70 pt-9">
          <ServicesTextStyleEditor services={services} onChange={onChange} prefix="headerIndex" />
        </div>
        <div className="pf-exp-centered-config border-t border-neutral-200/70 pt-9">
          <div className="mb-8 flex items-center justify-between gap-3">
            <ServicesGroupLabel>Counter</ServicesGroupLabel>
            {numberColor !== 'principal' ? (
              <button
                type="button"
                onClick={() => onChange({ headerIndexNumberColor: 'principal' })}
                className="text-xs font-medium text-neutral-400 underline-offset-2 transition hover:text-neutral-700 hover:underline"
              >
                Reset
              </button>
            ) : null}
          </div>
          <ServicesColorRow
            label="Numeral color"
            value={numberColor}
            onChange={(headerIndexNumberColor) => onChange({ headerIndexNumberColor })}
          />
        </div>
        <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'marquee') {
    return (
      <>
        <ServicesMarqueeWords services={services} onChange={onChange} />
        <div className="border-t border-neutral-200/70 pt-9">
          <ServicesMarqueeStyle services={services} onChange={onChange} />
        </div>
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
        <div className="space-y-6">
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
        </div>
        <ServicesHeaderBlock>
          <ServicesStyleTargetsEditor
            services={services}
            onChange={onChange}
            initialId="lead"
            targets={[
              { id: 'badge', label: 'Badge', color: { key: 'headerAccentCountBadgeColor', fallback: 'principal' } },
              {
                id: 'lead',
                label: 'Lead',
                color: { key: 'headerAccentCountLeadColor', fallback: 'secondaire' },
                weight: { key: 'headerAccentCountWeight', fallback: 'regular' },
              },
            ]}
          />
        </ServicesHeaderBlock>
        <ServicesHeaderBlock>
          <div className="pf-exp-centered-config space-y-8">
            <ServicesSteppedSlider
              label="Size (badge and lead)"
              steps={SERVICES_SIZE_STEPS}
              value={services.headerAccentCountSize ?? 'md'}
              currentName={SERVICES_SIZE_STEPS.find((step) => step.value === (services.headerAccentCountSize ?? 'md'))?.name ?? ''}
              onChange={(headerAccentCountSize) => onChange({ headerAccentCountSize })}
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
          </div>
        </ServicesHeaderBlock>
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
        <div className="space-y-6">
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
          <ServicesTextField
            label="Subtitle"
            value={services.headerSerifLeadSubtitleText}
            placeholder="What I can help you with."
            onChange={(headerSerifLeadSubtitleText) => onChange({ headerSerifLeadSubtitleText })}
            multiline
          />
        </div>
        <ServicesHeaderBlock>
          <ServicesTextStyleEditor services={services} onChange={onChange} prefix="headerSerifLead" />
        </ServicesHeaderBlock>
        <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'billboard') {
    return (
      <>
        <div className="space-y-6">
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
        </div>
        <ServicesHeaderBlock>
          <ServicesStyleTargetsEditor
            services={services}
            onChange={onChange}
            initialId="title"
            targets={[
              { id: 'word', label: 'Big word', color: { key: 'headerBillboardWordColor', fallback: 'principal' } },
              { id: 'title', label: 'Title', color: { key: 'headerBillboardTitleColor', fallback: 'principal' } },
              { id: 'count', label: 'Count line', color: { key: 'headerBillboardMetaColor', fallback: 'secondaire' } },
            ]}
          />
        </ServicesHeaderBlock>
        <ServicesHeaderBlock>
          <ServicesOptionGrid
            label="Big word style"
            options={SERVICES_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
            value={services.headerBillboardWordStyle ?? 'outline'}
            onChange={(headerBillboardWordStyle: PortfolioServicesHeaderBillboardWordStyle) =>
              onChange({ headerBillboardWordStyle })
            }
            columns={3}
          />
        </ServicesHeaderBlock>
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
        <div className="space-y-6">
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
        </div>
        <ServicesHeaderBlock>
          <ServicesStyleTargetsEditor
            services={services}
            onChange={onChange}
            title="Headline style"
            targets={[
              {
                id: 'headline',
                label: 'Headline',
                color: { key: 'headerMastheadHeadlineColor', fallback: 'principal' },
                size: { key: 'headerMastheadHeadlineSize', fallback: 'md' },
                weight: { key: 'headerMastheadHeadlineWeight', fallback: 'regular' },
              },
            ]}
          />
        </ServicesHeaderBlock>
        <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'split-heading') {
    return (
      <>
        <div className="space-y-6">
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
        </div>
        <ServicesHeaderBlock>
          <ServicesStyleTargetsEditor
            services={services}
            onChange={onChange}
            initialId="title"
            targets={[
              {
                id: 'title',
                label: 'Title',
                color: { key: 'headerSplitHeadingTitleColor', fallback: 'principal' },
                size: { key: 'headerSplitHeadingTitleSize', fallback: 'md' },
                weight: { key: 'headerSplitHeadingTitleWeight', fallback: 'regular' },
              },
              {
                id: 'label',
                label: 'Label',
                color: { key: 'headerSplitHeadingLabelColor', fallback: 'secondaire' },
                size: { key: 'headerSplitHeadingLabelSize', fallback: 'md' },
                weight: { key: 'headerSplitHeadingLabelWeight', fallback: 'regular' },
              },
            ]}
          />
        </ServicesHeaderBlock>
        <ServicesHeaderSharedAdvancedControls
          services={services}
          onChange={onChange}
          hideAlignment
          hideTitleControls
        />
      </>
    );
  }

  // Editorial — kicker + title + subtitle: the three texts first, then one shared style editor.
  // An empty text falls back to the kicker "Services" / the section title / the section subtitle.
  return (
    <>
      <div className="space-y-6">
        <ServicesTextField
          label="Label"
          value={services.headerEditorialLabelText}
          placeholder="Services"
          onChange={(headerEditorialLabelText) => onChange({ headerEditorialLabelText })}
        />
        <ServicesTextField
          label="Title"
          value={services.headerEditorialTitleText}
          placeholder="What I offer"
          onChange={(headerEditorialTitleText) => onChange({ headerEditorialTitleText })}
        />
        <ServicesTextField
          label="Subtitle"
          value={services.headerEditorialSubtitleText}
          placeholder="What I can help you with."
          onChange={(headerEditorialSubtitleText) => onChange({ headerEditorialSubtitleText })}
          multiline
        />
      </div>
      <div className="border-t border-neutral-200/70 pt-9">
        <ServicesTextStyleEditor services={services} onChange={onChange} prefix="headerEditorial" />
      </div>
      <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
    </>
  );
}

type ServicesSettingsChange = (patch: Partial<PortfolioServicesSectionSettings>) => void;

function servicesLabelOf(options: readonly { value: string | number; label: string }[], value: string | number): string {
  return options.find((option) => String(option.value) === String(value))?.label ?? '';
}

function servicesSettingDot(color: string, auto = false): ReactNode {
  return (
    <span
      aria-hidden
      className={`block h-3.5 w-3.5 rounded-full ${auto ? 'border border-dashed border-current' : 'border border-black/10'}`}
      style={auto ? undefined : { backgroundColor: color }}
    />
  );
}

function servicesSettingGlyph(shape: ReactNode): ReactNode {
  return (
    <svg viewBox="0 0 40 28" className="h-5 w-7" fill="none" aria-hidden>
      {shape}
    </svg>
  );
}

function servicesPaletteColor(services: PortfolioServicesSectionSettings, token: string): string {
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
  return resolveHeroPaletteColor(palette, token as HeroPaletteTokenId);
}

/** "Cards per row" item shared by the column-based designs. */
function servicesColumnsItem<T extends number>(
  options: readonly { value: T; label: string }[],
  value: T,
  onPick: (value: T) => void,
  label = 'Cards per row'
): SettingItem {
  return {
    id: 'cards-per-row',
    label,
    value: servicesLabelOf(options, value),
    render: (density) => (
      <SvChoiceTiles
        label={label}
        density={density}
        glyphViewBox="0 0 64 34"
        stage
        options={options.map((option) => ({
          value: String(option.value),
          label: option.label,
          glyph: servicesPricingColumnsGlyph(option.value as 1 | 2 | 3 | 4),
        }))}
        value={String(value)}
        onChange={(next) => onPick(Number(next) as T)}
      />
    ),
  };
}

/** "Featured card" + featured color items for the pricing designs that highlight one card. */
function servicesFeaturedItems(
  services: PortfolioServicesSectionSettings,
  availableServices: { id: string; title: string }[],
  featured: { index: number; info: string; onPick: (index: number) => void } | null,
  color: {
    options: readonly { value: string; label: string }[];
    value: string;
    info: string;
    onPick: (value: string) => void;
  } | null
): SettingItem[] {
  const items: SettingItem[] = [];
  if (featured) {
    const options = availableServices.map((service, index) => ({
      value: String(index),
      label: service.title.trim() || `Service ${index + 1}`,
    }));
    const value = String(Math.min(featured.index, Math.max(availableServices.length - 1, 0)));
    items.push({
      id: 'featured',
      label: 'Featured card',
      info: featured.info,
      value: options.length ? servicesLabelOf(options, value) : 'None yet',
      wide: true,
      render: (density) =>
        options.length ? (
          <SvPickOne
            label="Featured card"
            density={density}
            options={options}
            value={value}
            onChange={(next) => featured.onPick(Number(next))}
          />
        ) : (
          <p className="text-xs text-neutral-400">Add a service to choose which card is featured.</p>
        ),
    });
  }
  if (color) {
    const options = color.options.map((option) => ({
      value: option.value,
      label: option.label,
      color: servicesPaletteColor(services, option.value),
    }));
    items.push({
      id: 'featured-color',
      label: 'Featured color',
      info: color.info,
      value: servicesLabelOf(options, color.value),
      preview: servicesSettingDot(servicesPaletteColor(services, color.value)),
      render: (density) => (
        <SvSwatches
          label="Featured card color"
          density={density}
          options={options}
          value={color.value}
          onChange={color.onPick}
        />
      ),
    });
  }
  return items;
}

/** Cards / Order button / Background groups shared by the five pricing designs. */
function servicesPricingStyleGroups(
  services: PortfolioServicesSectionSettings,
  onChange: ServicesSettingsChange,
  design: ServicesPricingDesignKey
): SettingGroup[] {
  const style = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  const setStyle = (patch: Partial<PortfolioServicesPricingStyleSettings>) =>
    onChange({ pricingStyle: { ...style, ...patch } });
  // Grid / Bento / Toggle render a filled button; Monolith / Aurora render a bracketed text link.
  const filledButton = design === 'grid' || design === 'bento' || design === 'toggle';
  // Grid has no backdrop of its own to switch on.
  const hasFrame = design !== 'grid';
  const borderColorOptions = PORTFOLIO_SERVICES_PRICING_BORDER_COLOR_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    auto: option.value === 'auto',
    color: option.value === 'auto' ? 'transparent' : servicesPaletteColor(services, option.value),
  }));
  const buttonText = servicesPricingButtonLabel(services, design);

  const cards: SettingItem[] = [
    {
      id: 'radius',
      label: 'Corner radius',
      value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_CARD_RADIUS_OPTIONS, style.cardRadius),
      preview: servicesSettingGlyph(servicesRadiusGlyph(style.cardRadius)),
      render: (density) => (
        <SvChoiceTiles
          label="Corner radius"
          density={density}
          options={PORTFOLIO_SERVICES_PRICING_CARD_RADIUS_OPTIONS.map((option) => ({
            ...option,
            glyph: servicesRadiusGlyph(option.value),
          }))}
          value={style.cardRadius}
          onChange={(cardRadius) => setStyle({ cardRadius })}
        />
      ),
    },
    {
      id: 'border',
      label: 'Border',
      value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_BORDER_WIDTH_OPTIONS, style.cardBorderWidth),
      preview: servicesSettingGlyph(servicesBorderGlyph(style.cardBorderWidth)),
      render: (density) => (
        <SvChoiceTiles
          label="Border"
          density={density}
          options={PORTFOLIO_SERVICES_PRICING_BORDER_WIDTH_OPTIONS.map((option) => ({
            ...option,
            glyph: servicesBorderGlyph(option.value),
          }))}
          value={style.cardBorderWidth}
          onChange={(cardBorderWidth) => setStyle({ cardBorderWidth })}
        />
      ),
    },
  ];
  if (style.cardBorderWidth !== 'none') {
    cards.push({
      id: 'border-color',
      label: 'Border color',
      value: servicesLabelOf(borderColorOptions, style.cardBorderColor),
      preview: servicesSettingDot(
        servicesPaletteColor(services, style.cardBorderColor),
        style.cardBorderColor === 'auto'
      ),
      render: (density) => (
        <SvSwatches
          label="Border color"
          density={density}
          options={borderColorOptions}
          value={style.cardBorderColor}
          onChange={(next) => setStyle({ cardBorderColor: next as typeof style.cardBorderColor })}
        />
      ),
    });
  }

  const button: SettingItem[] = [
    {
      id: 'button-text',
      label: 'Button text',
      value: buttonText,
      wide: true,
      render: (density) => (
        <SvTextInput
          label="Button text"
          density={density}
          value={buttonText}
          maxLength={32}
          onCommit={(ctaLabel) => onChange(servicesPricingButtonLabelPatch(services, design, ctaLabel))}
        />
      ),
    },
  ];
  if (filledButton) {
    button.push({
      id: 'button-shape',
      label: 'Button shape',
      value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_CTA_SHAPE_OPTIONS, style.ctaShape),
      render: (density) => (
        <SvChoiceTiles
          label="Button shape"
          density={density}
          options={PORTFOLIO_SERVICES_PRICING_CTA_SHAPE_OPTIONS}
          value={style.ctaShape}
          onChange={(ctaShape) => setStyle({ ctaShape })}
        />
      ),
    });
  }
  button.push({
    id: 'button-link',
    label: 'Links to',
    value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_CTA_LINK_MODE_OPTIONS, style.ctaLinkMode),
    wide: true,
    render: (density) => (
      <SvChoiceTiles
        label="Button links to"
        density={density}
        options={PORTFOLIO_SERVICES_PRICING_CTA_LINK_MODE_OPTIONS}
        value={style.ctaLinkMode}
        onChange={(ctaLinkMode) => setStyle({ ctaLinkMode })}
      />
    ),
  });
  if (style.ctaLinkMode === 'section') {
    button.push({
      id: 'button-section',
      label: 'Section',
      value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_CTA_SECTION_OPTIONS, style.ctaLinkSection),
      render: (density) => (
        <SvPickOne
          label="Section"
          density={density}
          options={PORTFOLIO_SERVICES_PRICING_CTA_SECTION_OPTIONS}
          value={style.ctaLinkSection}
          onChange={(ctaLinkSection) => setStyle({ ctaLinkSection })}
        />
      ),
    });
  }
  if (style.ctaLinkMode === 'url') {
    button.push(
      {
        id: 'button-url',
        label: 'Link',
        value: style.ctaLinkUrl || 'Not set',
        wide: true,
        render: (density) => (
          <SvTextInput
            label="Link"
            density={density}
            allowEmpty
            value={style.ctaLinkUrl}
            placeholder="https://cal.com/you or you@mail.com"
            onCommit={(ctaLinkUrl) => setStyle({ ctaLinkUrl })}
          />
        ),
      },
      {
        id: 'button-new-tab',
        label: 'Open in a new tab',
        toggle: { checked: style.ctaLinkNewTab, onChange: (ctaLinkNewTab) => setStyle({ ctaLinkNewTab }) },
      }
    );
  }

  const groups: SettingGroup[] = [
    { id: 'cards', title: 'Cards', items: cards },
    { id: 'button', title: 'Order button', items: button },
  ];
  if (hasFrame) {
    groups.push({
      id: 'background',
      title: 'Background',
      items: [
        {
          id: 'frame',
          label: 'Background frame',
          info: 'Paints a full-width backdrop behind the cards. Off by default so your page background shows through.',
          toggle: { checked: style.showFrame, onChange: (showFrame) => setStyle({ showFrame }) },
        },
      ],
    });
  }
  return groups;
}

/**
 * Every Services design's own options as one description (`SettingGroup[]`), so the two views
 * (Expanded / Compact) render exactly the same settings. `null` when the design has none.
 */
function servicesDesignSettingGroups(
  services: PortfolioServicesSectionSettings,
  onChange: ServicesSettingsChange,
  availableServices: { id: string; title: string }[]
): SettingGroup[] | null {
  switch (services.sectionDesign) {
    case 'services-pricing-aurora': {
      const aurora = services.servicesPricingAurora ?? DEFAULT_SERVICES_PRICING_AURORA_SETTINGS;
      const setAurora = (patch: Partial<typeof aurora>) =>
        onChange({ servicesPricingAurora: { ...aurora, ...patch } });
      return [
        {
          id: 'layout',
          title: 'Layout',
          items: [
            servicesColumnsItem(PORTFOLIO_SERVICES_PRICING_AURORA_COLUMNS_OPTIONS, aurora.cardsPerRow ?? 3, (cardsPerRow) =>
              setAurora({ cardsPerRow: cardsPerRow as PortfolioServicesPricingAuroraColumns })
            ),
            ...servicesFeaturedItems(
              services,
              availableServices,
              {
                index: aurora.popularIndex,
                info: 'The featured card gets the accent gradient border and glass tint that sets it apart from the others.',
                onPick: (popularIndex) => setAurora({ popularIndex }),
              },
              {
                options: PRICING_AURORA_POPULAR_COLOR_OPTIONS,
                value: aurora.popularColorToken,
                info: "Colors the featured card's gradient border and glass tint from the active theme palette.",
                onPick: (next) =>
                  setAurora({
                    popularColorToken: next as (typeof PRICING_AURORA_POPULAR_COLOR_OPTIONS)[number]['value'],
                  }),
              }
            ),
          ],
        },
        ...servicesPricingStyleGroups(services, onChange, 'aurora'),
      ];
    }
    case 'services-pricing-grid': {
      const grid = services.pricingGrid ?? DEFAULT_SERVICES_PRICING_GRID_SETTINGS;
      return [
        {
          id: 'layout',
          title: 'Featured card',
          items: servicesFeaturedItems(services, availableServices, null, {
            options: PRICING_GRID_POPULAR_COLOR_OPTIONS,
            value: grid.popularColorToken,
            info: 'Fills the popular card with one of 4 colors from the active theme palette.',
            onPick: (next) =>
              onChange({
                pricingGrid: {
                  ...grid,
                  popularColorToken: next as (typeof PRICING_GRID_POPULAR_COLOR_OPTIONS)[number]['value'],
                },
              }),
          }),
        },
        ...servicesPricingStyleGroups(services, onChange, 'grid'),
      ];
    }
    case 'services-pricing-bento': {
      const bento = services.pricingBento ?? DEFAULT_SERVICES_PRICING_BENTO_SETTINGS;
      const setBento = (patch: Partial<typeof bento>) => onChange({ pricingBento: { ...bento, ...patch } });
      return [
        {
          id: 'layout',
          title: 'Featured card',
          items: [
            ...servicesFeaturedItems(
              services,
              availableServices,
              {
                index: bento.graphicHeaderIndex,
                info: 'The featured card gets the textured graphic header that sets it apart from the others.',
                onPick: (graphicHeaderIndex) => setBento({ graphicHeaderIndex }),
              },
              null
            ),
            {
              id: 'pattern',
              label: 'Pattern',
              info: "The pattern drawn in the featured card's header. Pick None to remove it.",
              value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_BENTO_MOTIF_OPTIONS, bento.graphicMotif),
              render: (density) => (
                <SvChoiceTiles
                  label="Featured card pattern"
                  density={density}
                  columns={3}
                  options={PORTFOLIO_SERVICES_PRICING_BENTO_MOTIF_OPTIONS}
                  value={bento.graphicMotif}
                  onChange={(graphicMotif) => setBento({ graphicMotif })}
                />
              ),
            },
          ],
        },
        ...servicesPricingStyleGroups(services, onChange, 'bento'),
      ];
    }
    case 'services-pricing-monolith': {
      const monolith = services.servicesPricingMonolith ?? DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS;
      return [
        {
          id: 'layout',
          title: 'Layout',
          items: [
            servicesColumnsItem(PORTFOLIO_SERVICES_PRICING_MONOLITH_COLUMNS_OPTIONS, monolith.cardsPerRow ?? 3, (cardsPerRow) =>
              onChange({
                servicesPricingMonolith: {
                  ...monolith,
                  cardsPerRow: cardsPerRow as PortfolioServicesPricingMonolithColumns,
                },
              })
            ),
          ],
        },
        ...servicesPricingStyleGroups(services, onChange, 'monolith'),
      ];
    }
    case 'services-pricing-toggle':
      return servicesPricingStyleGroups(services, onChange, 'toggle');
    case 'services-media-columns': {
      const media = services.mediaColumns ?? DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS;
      const setMedia = (patch: Partial<PortfolioServicesMediaColumnsSettings>) =>
        onChange({ mediaColumns: { ...media, ...patch } });
      return [
        {
          id: 'grid',
          title: 'Grid',
          items: [
            servicesColumnsItem(PORTFOLIO_SERVICES_MEDIA_COLUMNS_COUNT_OPTIONS, media.columns, (columns) =>
              setMedia({ columns: columns as 2 | 3 | 4 })
            ),
            {
              id: 'mobile-columns',
              label: 'On phones',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_MOBILE_OPTIONS, media.mobileColumns),
              render: (density) => (
                <SvChoiceTiles
                  label="Cards per row on phones"
                  density={density}
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_MOBILE_OPTIONS.map((option) => ({
                    value: String(option.value),
                    label: option.label,
                  }))}
                  value={String(media.mobileColumns)}
                  onChange={(next) =>
                    setMedia({ mobileColumns: Number(next) as PortfolioServicesMediaColumnsSettings['mobileColumns'] })
                  }
                />
              ),
            },
            {
              id: 'gap',
              label: 'Gap',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_GAP_OPTIONS, media.gap),
              render: (density) => (
                <SvChoiceTiles
                  label="Gap"
                  density={density}
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_GAP_OPTIONS}
                  value={media.gap}
                  onChange={(gap) => setMedia({ gap })}
                />
              ),
            },
            {
              id: 'center-last-row',
              label: 'Center incomplete rows',
              info: 'When the last row has fewer cards than the others, center it instead of leaving it flush left.',
              toggle: { checked: media.centerLastRow, onChange: (centerLastRow) => setMedia({ centerLastRow }) },
            },
          ],
        },
        {
          id: 'media',
          title: 'Media',
          items: [
            {
              id: 'ratio',
              label: 'Media ratio',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_RATIO_OPTIONS, media.mediaRatio),
              render: (density) => (
                <SvChoiceTiles
                  label="Media ratio"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_RATIO_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesMediaColumnsRatioGlyph(option.value),
                  }))}
                  value={media.mediaRatio}
                  onChange={(mediaRatio) => setMedia({ mediaRatio })}
                />
              ),
            },
            {
              id: 'radius',
              label: 'Corner radius',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_RADIUS_OPTIONS, media.cardRadius),
              render: (density) => (
                <SvChoiceTiles
                  label="Corner radius"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_RADIUS_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesMediaColumnsRadiusGlyph(option.value),
                  }))}
                  value={media.cardRadius}
                  onChange={(cardRadius) => setMedia({ cardRadius })}
                />
              ),
            },
            {
              id: 'hover',
              label: 'Hover effect',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_HOVER_OPTIONS, media.hoverEffect),
              render: (density) => (
                <SvChoiceTiles
                  label="Hover effect"
                  density={density}
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_HOVER_OPTIONS}
                  value={media.hoverEffect}
                  onChange={(hoverEffect) => setMedia({ hoverEffect })}
                />
              ),
            },
          ],
        },
        {
          id: 'text',
          title: 'Text',
          items: [
            {
              id: 'align',
              label: 'Text alignment',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_TEXT_ALIGN_OPTIONS, media.textAlign),
              render: (density) => (
                <SvChoiceTiles
                  label="Text alignment"
                  density={density}
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_TEXT_ALIGN_OPTIONS}
                  value={media.textAlign}
                  onChange={(textAlign) => setMedia({ textAlign })}
                />
              ),
            },
            {
              id: 'description',
              label: 'Show description',
              toggle: { checked: media.showDescription, onChange: (showDescription) => setMedia({ showDescription }) },
            },
          ],
        },
      ];
    }
    case 'services-index-list': {
      const list = services.indexList ?? DEFAULT_SERVICES_INDEX_LIST_SETTINGS;
      const setList = (patch: Partial<PortfolioServicesIndexListSettings>) =>
        onChange({ indexList: { ...list, ...patch } });
      return [
        {
          id: 'layout',
          title: 'Layout',
          items: [
            {
              id: 'layout',
              label: 'Layout',
              value: servicesLabelOf(PORTFOLIO_SERVICES_INDEX_LIST_LAYOUT_OPTIONS, list.layout),
              render: (density) => (
                <SvChoiceTiles
                  label="Layout"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_INDEX_LIST_LAYOUT_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesIndexListLayoutGlyph(option.value),
                  }))}
                  value={list.layout}
                  onChange={(layout) => setList({ layout })}
                />
              ),
            },
            {
              id: 'ratio',
              label: 'Media ratio',
              value: servicesLabelOf(PORTFOLIO_SERVICES_INDEX_LIST_MEDIA_RATIO_OPTIONS, list.mediaRatio),
              render: (density) => (
                <SvChoiceTiles
                  label="Media ratio"
                  density={density}
                  options={PORTFOLIO_SERVICES_INDEX_LIST_MEDIA_RATIO_OPTIONS}
                  value={list.mediaRatio}
                  onChange={(mediaRatio) => setList({ mediaRatio })}
                />
              ),
            },
          ],
        },
        {
          id: 'content',
          title: 'Content',
          items: [
            {
              id: 'tasks',
              label: 'Tasks style',
              value: servicesLabelOf(PORTFOLIO_SERVICES_INDEX_LIST_TASKS_STYLE_OPTIONS, list.tasksStyle),
              render: (density) => (
                <SvChoiceTiles
                  label="Tasks style"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_INDEX_LIST_TASKS_STYLE_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesIndexListTasksGlyph(option.value),
                  }))}
                  value={list.tasksStyle}
                  onChange={(tasksStyle) => setList({ tasksStyle })}
                />
              ),
            },
            {
              id: 'show-index',
              label: 'Show index numbers',
              toggle: { checked: list.showIndex, onChange: (showIndex) => setList({ showIndex }) },
            },
          ],
        },
      ];
    }
    default:
      return null;
  }
}

/** Visible caption above each design's options. */
const SERVICES_DESIGN_OPTIONS_TITLE: Partial<Record<PortfolioServicesSectionDesign, string>> = {
  'services-pricing-aurora': 'Aurora options',
  'services-pricing-grid': 'Pricing Grid options',
  'services-pricing-bento': 'Pricing Bento options',
  'services-pricing-monolith': 'Monolith options',
  'services-pricing-toggle': 'Pricing Toggle options',
  'services-media-columns': 'Media Columns options',
  'services-index-list': 'Index List options',
};

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
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(false);
  const [settingsVariant, setSettingsVariant] = useSettingsVariant();
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ServicesSubSection>('general');
  const subSection = normalizeServicesSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: ServicesSubSection) => {
    const next = normalizeServicesSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  return (
    <div className="space-y-6">
      <div className="pf-subtabs" role="tablist" aria-label="Settings sections">
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

          {designCatalogOpen
            ? null
            : (() => {
                const groups = servicesDesignSettingGroups(services, onChange, availableServices);
                if (!groups) return null;
                const title = SERVICES_DESIGN_OPTIONS_TITLE[services.sectionDesign] ?? 'Options';
                return (
                  <ServicesLayoutSettingsBand
                    motionKey={services.sectionDesign}
                    id="services-design-options-title"
                    title=""
                    ariaTitle={title}
                    flush
                  >
                    <SettingsWithViews
                      title={title}
                      groups={groups}
                      variant={settingsVariant}
                      onVariantChange={setSettingsVariant}
                    />
                  </ServicesLayoutSettingsBand>
                );
              })()}

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
            open={headerCatalogOpen}
            onOpenChange={setHeaderCatalogOpen}
          />

          {/* Browsing the catalog is a different task from tuning the chosen design: no settings below it. */}
          {headerCatalogOpen ? null : (
            <ServicesLayoutSettingsBand
              motionKey={services.headerDesign ?? 'editorial'}
              id="services-header-settings-title"
              title="Header settings"
              flush
            >
              <ServicesHeaderDesignFields services={services} onChange={onChange} />
            </ServicesLayoutSettingsBand>
          )}
        </div>
      ) : null}
    </div>
  );
}
