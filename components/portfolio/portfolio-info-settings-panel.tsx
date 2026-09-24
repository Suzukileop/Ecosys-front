'use client';

import { useId, useState, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import {
  infoDesignSettingsPatch,
  portfolioInfoDesignHasPortrait,
  resolveInfoPortraitGrayscale,
  DEFAULT_ABOUT_PLATFORM_HEADLINE,
  DEFAULT_INFO_SUBTITLE,
  PORTFOLIO_INFO_ABOUT_MANIFESTO_PORTRAIT_FRAME_OPTIONS,
  PORTFOLIO_INFO_ABOUT_SPLIT_PORTRAIT_SIDE_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_STEPS_VALUES_LAYOUT_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS,
  PORTFOLIO_INFO_PREMIUM_FONT_SIZE_OPTIONS,
  PORTFOLIO_INFO_DESIGN_OPTIONS,
  PORTFOLIO_INFO_EDUCATION_DISPLAY_OPTIONS,
  PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS,
  INFO_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  INFO_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  INFO_HEADER_PALETTE_TOKEN_OPTIONS,
  infoHeaderPaletteTokenColor,
  type PortfolioInfoDesign,
  type PortfolioInfoHeaderAccentCountAlignment,
  type PortfolioInfoHeaderBillboardWordStyle,
  type PortfolioInfoHeaderDesign,
  type PortfolioInfoHeaderDesignAlignment,
  type PortfolioInfoHeaderPaletteToken,
  type PortfolioInfoHeaderTitleSize,
  type PortfolioInfoHeaderTitleWeight,
  type PortfolioInfoSectionSettings,
  resolveInfoAboutValueValuesLayout,
} from '@/components/portfolio/portfolio-info-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import {
  DEFAULT_HERO_PALETTE,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';

/** Same general / design / header / background pill-switcher mechanism as the Stack section settings panel.
 *  Header is one shared, GSAP-animated header (copied from the Portfolio/Work section's Header mechanism)
 *  mounted above the section, independent of Design's per-design layout. */
export type InfoSubSection = 'general' | 'design' | 'header' | 'background';

const INFO_SUB_SECTIONS: { id: InfoSubSection; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'design', label: 'Design' },
  { id: 'header', label: 'Header' },
  { id: 'background', label: 'Background' },
];

export function normalizeInfoSubSection(value: string | undefined): InfoSubSection {
  return INFO_SUB_SECTIONS.some((item) => item.id === value)
    ? (value as InfoSubSection)
    : 'general';
}

const INFO_LABELS_MODE_OPTIONS: { value: 'standard' | 'custom'; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'custom', label: 'Custom' },
];

function InfoTextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
      />
    </label>
  );
}

/** Same curated 4-token swatch set as the Stack section's background color pickers
 *  (STACK_BACKGROUND_PALETTE_TOKENS) — no free-form hex anywhere in Info: every color comes
 *  from the portfolio's own Hero palette, picked as a swatch. */
const INFO_PALETTE_SWATCH_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: 'Fond' },
  { value: 'neutre', label: 'Neutre' },
  { value: 'principal', label: 'Principal' },
  { value: 'texteMuted', label: 'Texte muted' },
];

function InfoPaletteSwatchPicker({
  label,
  palette,
  value,
  tokens = INFO_PALETTE_SWATCH_TOKENS,
  onChange,
}: {
  label: string;
  palette: PortfolioHeroPalette;
  value: string;
  tokens?: { value: HeroPaletteTokenId; label: string }[];
  onChange: (hex: string) => void;
}) {
  const activeHex = value.trim().toLowerCase();
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="mt-2 flex flex-wrap gap-3">
        {tokens.map((token) => {
          const hex = resolveHeroPaletteColor(palette, token.value);
          const active = hex.toLowerCase() === activeHex;
          return (
            <button
              key={token.value}
              type="button"
              onClick={() => onChange(hex)}
              aria-pressed={active}
              aria-label={token.label}
              title={token.label}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition ${
                active ? 'ring-2 ring-neutral-900 ring-offset-2' : 'hover:bg-neutral-100'
              }`}
            >
              <span
                className="h-9 w-9 rounded-full border border-neutral-200/80 shadow-inner"
                style={{ backgroundColor: hex }}
              />
              <span className="text-[11px] font-medium text-neutral-500">{token.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Same mini-wireframe/picker-card mechanism as Stack's design grid (see StackDesignWireframe). */
function InfoMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function InfoMiniType({
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

function InfoPickerCard({
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
  /** Smaller padding/type for secondary preview-card grids (colors, styles, …). */
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
      <span className={compact ? 'mt-1.5 block' : 'mt-2.5 block'}>
        <span
          className={`pf-stack-card-label min-w-0 font-semibold leading-none tracking-tight ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

function InfoPreviewCardGrid<T extends string>({
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
      <p className="pf-stack-block-label pf-stack-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <InfoPickerCard
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
          </InfoPickerCard>
        ))}
      </div>
    </div>
  );
}

/** Same animated switch + row as the Stack section settings panel's design controls
 *  (StackSwitchTrack/StackToggleRow) — used for boolean settings inside the Design band,
 *  where the plain checkbox Toggle (General tab) would feel out of place. */
function InfoSwitchTrack({ checked }: { checked: boolean }) {
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

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus
 *  instead of a permanent line of text under a toggle. Same mechanism as Stack/Contact. */
function InfoInfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex shrink-0">
      {/* `span` not `button` — this can sit inside InfoToggleRow's own <button>,
       *  and a <button> can never nest another <button> (invalid HTML / hydration error). */}
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

function InfoToggleRow({
  label,
  description,
  info,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  /** Non-obvious info (where to find something, hidden behavior) shown as a hover/focus
   *  tooltip instead of a permanent line of text — same mechanism as Stack/Contact. */
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
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="block truncate text-sm font-medium text-neutral-950">{label}</span>
            {info ? <InfoInfoTooltip text={info} /> : null}
          </span>
          {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
        </span>
        <InfoSwitchTrack checked={checked} />
      </span>
    </button>
  );
}

/** Same minimal segmented-pill control as the Stack section settings panel's sub-choice pickers
 *  (StackOptionGrid) — text (+ optional icon) pills, no wireframe. The wireframe/picker-card
 *  mechanism above is reserved for the top-level Design picker only. */
function InfoOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns,
  icons,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  icons?: Partial<Record<string, ReactNode>>;
}) {
  const count = options.length;
  const cols = columns ?? (count <= 4 ? Math.max(count, 1) : 2);
  const compact = cols === count && count >= 2 && count <= 5;
  return (
    <div>
      <p className="pf-stack-block-label pf-stack-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-stack-segment grid gap-[3px] p-[3px]"
        data-compact={compact ? 'true' : 'false'}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value;
          const icon = icons?.[String(option.value)];
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={option.description}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-stack-segment-btn flex items-center justify-center px-2.5 py-1.5 text-center text-[13px] font-medium tracking-tight"
            >
              {icon ? <span className="pf-stack-segment-icon">{icon}</span> : null}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** One mini-wireframe per PortfolioInfoDesign — same StackDesignWireframe mechanism, tuned to each
 *  About layout's actual anatomy so the picker card reads as a preview, not a generic placeholder. */
function InfoDesignWireframe({ design }: { design: PortfolioInfoDesign }) {
  switch (design) {
    case 'about-me':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-accent" x="8" y="8" width="26" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="15" width="66" height="6" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="26" width="104" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="8" y="31" width="88" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="8" y="42" width="24" height="22" rx="3" />
          <rect className="pf-stack-mini-mute" x="36" y="42" width="24" height="22" rx="3" />
          <rect className="pf-stack-mini-mute" x="64" y="42" width="24" height="22" rx="3" />
          <rect className="pf-stack-mini-mute" x="92" y="42" width="20" height="22" rx="3" />
        </InfoMiniSlide>
      );
    case 'about-me-trait':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="8" width="24" height="24" rx="4" />
          <rect className="pf-stack-mini-accent" x="38" y="8" width="1.6" height="24" rx="0.8" />
          <rect className="pf-stack-mini-ink" x="46" y="10" width="60" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="46" y="17" width="64" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="46" y="22" width="52" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="46" y="27" width="30" height="4" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="42" width="1" height="20" rx="0.5" />
          <circle className="pf-stack-mini-accent" cx="8" cy="44" r="2" />
          <rect className="pf-stack-mini-mute" x="16" y="42.5" width="60" height="2.4" rx="1.2" />
          <circle className="pf-stack-mini-mute" cx="8" cy="53" r="2" />
          <rect className="pf-stack-mini-mute" x="16" y="51.5" width="50" height="2.4" rx="1.2" />
          <circle className="pf-stack-mini-mute" cx="8" cy="61" r="2" />
          <rect className="pf-stack-mini-mute" x="16" y="59.5" width="56" height="2.4" rx="1.2" />
        </InfoMiniSlide>
      );
    case 'about-split':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="8" width="30" height="56" rx="4" />
          <rect className="pf-stack-mini-ink" x="46" y="10" width="58" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="46" y="22" width="64" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="46" y="27" width="50" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="46" y="36" width="16" height="7" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="65" y="36" width="18" height="7" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="46" y="47" width="60" height="2" rx="1" />
          <circle className="pf-stack-mini-accent" cx="48" cy="58" r="2" />
          <rect className="pf-stack-mini-mute" x="54" y="56.5" width="16" height="2.4" rx="1.2" />
          <circle className="pf-stack-mini-mute" cx="76" cy="58" r="2" />
          <rect className="pf-stack-mini-mute" x="82" y="56.5" width="16" height="2.4" rx="1.2" />
        </InfoMiniSlide>
      );
    case 'about-banner':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="10" width="26" height="34" rx="3" />
          <rect className="pf-stack-mini-mute" x="40" y="30" width="72" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="40" y="36" width="64" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="40" y="42" width="56" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="52" width="20" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="8" y="58" width="34" height="6" rx="2" />
          <rect className="pf-stack-mini-mute" x="48" y="58" width="34" height="6" rx="2" />
          <rect className="pf-stack-mini-mute" x="88" y="58" width="24" height="6" rx="2" />
        </InfoMiniSlide>
      );
    case 'about-platform':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-accent" x="8" y="8" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="13" width="42" height="16" rx="2" />
          <rect className="pf-stack-mini-mute" x="58" y="14" width="54" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="58" y="19" width="46" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="58" y="24" width="50" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="8" y="36" width="24" height="26" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="34" y="36" width="24" height="26" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="60" y="36" width="24" height="26" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="86" y="36" width="24" height="26" rx="3.5" />
        </InfoMiniSlide>
      );
    case 'about-portrait-skills':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="9" width="52" height="9" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="22" width="40" height="9" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="35" width="46" height="9" rx="2" />
          <rect className="pf-stack-mini-ring" x="8" y="49" width="20" height="7" rx="3.5" strokeWidth={1.2} />
          <rect className="pf-stack-mini-ring" x="32" y="49" width="20" height="7" rx="3.5" strokeWidth={1.2} />
          <rect className="pf-stack-mini-mute" x="70" y="8" width="42" height="42" rx="4" />
          <rect className="pf-stack-mini-mute" x="70" y="54" width="42" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="70" y="59" width="30" height="2" rx="1" />
        </InfoMiniSlide>
      );
    case 'about-manifesto':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="8" width="104" height="8" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="19" width="80" height="8" rx="2" />
          <rect className="pf-stack-mini-accent" x="8" y="30" width="26" height="1.6" rx="0.8" />
          <rect className="pf-stack-mini-mute" x="8" y="40" width="44" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="8" y="46" width="36" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="8" y="52" width="40" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="62" y="40" width="24" height="7" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="88" y="40" width="24" height="7" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="62" y="50" width="24" height="7" rx="3.5" />
          <rect className="pf-stack-mini-mute" x="88" y="50" width="24" height="7" rx="3.5" />
        </InfoMiniSlide>
      );
    case 'about-terminal':
      return (
        <InfoMiniSlide>
          <circle className="pf-stack-mini-mute" cx="12" cy="10" r="2" />
          <circle className="pf-stack-mini-mute" cx="19" cy="10" r="2" />
          <circle className="pf-stack-mini-accent" cx="26" cy="10" r="2" />
          <rect className="pf-stack-mini-mute" x="8" y="18" width="1.6" height="2.4" rx="0.5" />
          <InfoMiniType x={13} y={20.5} size={5}>
            about --bio
          </InfoMiniType>
          <rect className="pf-stack-mini-mute" x="8" y="26" width="70" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="8" y="32" width="1.6" height="2.4" rx="0.5" />
          <InfoMiniType x={13} y={34.5} size={5}>
            skills //
          </InfoMiniType>
          <rect className="pf-stack-mini-mute" x="8" y="40" width="56" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="8" y="46" width="44" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="8" y="52" width="1.6" height="2.4" rx="0.5" />
          <InfoMiniType x={13} y={54.5} size={5}>
            education.log
          </InfoMiniType>
          <rect className="pf-stack-mini-mute" x="8" y="60" width="30" height="2" rx="1" />
        </InfoMiniSlide>
      );
    case 'about-index':
      return (
        <InfoMiniSlide>
          <InfoMiniType x={9} y={15} size={6}>
            [ 01 ]
          </InfoMiniType>
          <rect className="pf-stack-mini-ink" x="30" y="9" width="82" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="30" y="21" width="72" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="30" y="26" width="58" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="8" y="38" width="104" height="1" />
          <rect className="pf-stack-mini-mute" x="30" y="42" width="20" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="52" y="42" width="20" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="74" y="42" width="20" height="2" rx="1" />
          <InfoMiniType x={30} y={62} size={13}>
            EN
          </InfoMiniType>
          <InfoMiniType x={62} y={62} size={13}>
            FR
          </InfoMiniType>
          <InfoMiniType x={94} y={62} size={13}>
            ES
          </InfoMiniType>
        </InfoMiniSlide>
      );
    case 'about-value-steps':
      return (
        <InfoMiniSlide>
          <InfoMiniType x={9} y={16} size={9}>
            01
          </InfoMiniType>
          <rect className="pf-stack-mini-mute" x="24" y="10" width="56" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="24" y="16" width="44" height="2" rx="1" />
          <InfoMiniType x={9} y={35} size={9}>
            02
          </InfoMiniType>
          <rect className="pf-stack-mini-mute" x="24" y="29" width="56" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="24" y="35" width="40" height="2" rx="1" />
          <InfoMiniType x={9} y={54} size={9}>
            03
          </InfoMiniType>
          <rect className="pf-stack-mini-accent" x="24" y="48" width="56" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="24" y="54" width="48" height="2" rx="1" />
        </InfoMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Collapsed-state row shared by every design/header choice grid: a compact scaled-down
 *  thumbnail, the selected design's name, and a trailing chevron — the whole row opens the
 *  grid. The thumbnail wraps whatever wireframe is passed (sized for a full-width card) in a
 *  fixed 128×80 box and scales it down, instead of the old wide preview box that left a lot of
 *  empty space on both sides of the much narrower mini-schema it centered. */
function InfoDesignSummaryRow({
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
        className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200/80 px-3 py-2.5 text-left transition hover:border-neutral-300"
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

function InfoDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioInfoDesign;
  onChange: (value: PortfolioInfoDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_INFO_DESIGN_OPTIONS.find((option) => option.value === value) ?? PORTFOLIO_INFO_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-stack-block-label !mb-0">Design Info</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_INFO_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <InfoPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <InfoDesignWireframe design={option.value} />
              </InfoPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <InfoDesignSummaryRow label="Design Info" name={selected.label} onOpen={() => setShowGrid(true)}>
      <InfoDesignWireframe design={value} />
    </InfoDesignSummaryRow>
  );
}

/** Mini swatch for a palette-token color picker — the actual resolved color,
 *  not just a text label. Same mechanism as Stack/Tools/Contact. */
function infoHeaderPaletteTokenGlyph(token: PortfolioInfoHeaderPaletteToken): ReactNode {
  return (
    <circle
      cx="32"
      cy="17"
      r="8"
      fill={infoHeaderPaletteTokenColor(token)}
      style={{
        stroke: 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 22%, transparent)',
        strokeWidth: 1,
      }}
    />
  );
}

function infoHeaderBillboardWordStyleGlyph(style: PortfolioInfoHeaderBillboardWordStyle): ReactNode {
  switch (style) {
    case 'outline':
      return (
        <text
          x="32"
          y="23"
          textAnchor="middle"
          fontSize="19"
          fontWeight={900}
          stroke="currentColor"
          strokeWidth="1"
          className="pf-stack-mini-ink"
          style={{ fill: 'none' }}
        >
          Aa
        </text>
      );
    case 'fill':
      return (
        <>
          <text
            x="32"
            y="23"
            textAnchor="middle"
            fontSize="19"
            fontWeight={900}
            className="pf-stack-mini-ink"
            opacity={0.4}
            style={{ filter: 'blur(2px)' }}
          >
            Aa
          </text>
          <text x="32" y="23" textAnchor="middle" fontSize="19" fontWeight={900} className="pf-stack-mini-ink">
            Aa
          </text>
        </>
      );
    case 'simple':
      return (
        <text x="32" y="23" textAnchor="middle" fontSize="19" fontWeight={900} className="pf-stack-mini-ink">
          Aa
        </text>
      );
    default: {
      const _exhaustive: never = style;
      return _exhaustive;
    }
  }
}

/** Mini wireframes for the 8 Header design picker cards — same InfoMiniSlide mechanism
 *  as the generic shapes Stack/Tools/Contact use for their own Header design picker. */
function InfoHeaderDesignWireframe({ design }: { design: PortfolioInfoHeaderDesign }) {
  switch (design) {
    case 'editorial':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="16" width="18" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="26" width="64" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="42" width="46" height="4" rx="2" />
        </InfoMiniSlide>
      );
    case 'marquee':
      return (
        <InfoMiniSlide>
          <text
            x="60"
            y="34"
            fontSize={22}
            fontWeight={800}
            textAnchor="middle"
            opacity={0.14}
            className="pf-stack-mini-ink"
          >
            INFO
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="84" height="10" rx="2" />
        </InfoMiniSlide>
      );
    case 'index':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="4" height="4" />
          <rect className="pf-stack-mini-mute" x="20" y="13" width="90" height="1" />
          <InfoMiniType x={10} y={40} size={22}>
            04
          </InfoMiniType>
          <rect className="pf-stack-mini-mute" x="46" y="22" width="1" height="18" />
          <rect className="pf-stack-mini-ink" x="54" y="24" width="46" height="7" rx="2" />
        </InfoMiniSlide>
      );
    case 'accent-count':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="12" width="26" height="8" rx="4" />
          <rect className="pf-stack-mini-mute" x="10" y="26" width="40" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="33" width="60" height="7" rx="2" />
        </InfoMiniSlide>
      );
    case 'serif-lead':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="14" width="20" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="24" width="76" height="11" rx="2" />
        </InfoMiniSlide>
      );
    case 'billboard':
      return (
        <InfoMiniSlide>
          <text
            x="60"
            y="30"
            fontSize={26}
            fontWeight={900}
            textAnchor="middle"
            opacity={0.1}
            className="pf-stack-mini-ink"
          >
            INFO
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="60" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="18" y="42" width="40" height="3" rx="1.5" />
        </InfoMiniSlide>
      );
    case 'masthead':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="100" height="1" />
          <rect className="pf-stack-mini-ink" x="10" y="20" width="100" height="12" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="38" width="100" height="1" />
        </InfoMiniSlide>
      );
    case 'split-heading':
      return (
        <InfoMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="20" width="58" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="86" y="18" width="24" height="3" rx="1.5" />
        </InfoMiniSlide>
      );
    case 'chapter':
      return (
        <InfoMiniSlide>
          <text x="10" y="32" fontSize={15} fontStyle="italic" fontWeight={700} className="pf-stack-mini-accent">
            02 /
          </text>
          <text x="10" y="52" fontSize={13} fontStyle="italic" fontWeight={600} className="pf-stack-mini-ink">
            Expertise
          </text>
          <rect className="pf-stack-mini-accent" x="10" y="60" width="22" height="2.5" rx="1.25" />
        </InfoMiniSlide>
      );
    case 'cover':
      return (
        <InfoMiniSlide>
          <text x="60" y="30" fontSize={13} fontStyle="italic" fontWeight={700} textAnchor="middle" className="pf-stack-mini-ink">
            Built To Ship
          </text>
          <text x="60" y="46" fontSize={13} fontStyle="italic" fontWeight={700} textAnchor="middle" className="pf-stack-mini-ink">
            Designed To
          </text>
          <text x="60" y="62" fontSize={13} fontStyle="italic" fontWeight={700} textAnchor="middle" className="pf-stack-mini-ink">
            Scale
          </text>
        </InfoMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Same collapsed-preview / expand-to-grid mechanism as Design above and Stack/Tools/Contact's
 *  own Header design picker. */
function InfoHeaderDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioInfoHeaderDesign;
  onChange: (value: PortfolioInfoHeaderDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-stack-block-label !mb-0">Header design</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <InfoPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <InfoHeaderDesignWireframe design={option.value} />
              </InfoPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <InfoDesignSummaryRow label="Header design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <InfoHeaderDesignWireframe design={value} />
    </InfoDesignSummaryRow>
  );
}

/** Ordered-scale slider — for size/spacing progressions. Same mechanism as Stack/Tools/Contact's
 *  Slider: one drag surface snapping between steps. */
function InfoSlider<T extends string>({
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
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const lastIndex = options.length - 1;
  const percent = lastIndex > 0 ? (index / lastIndex) * 100 : 0;
  const current = options[index] ?? options[0];
  return (
    <div>
      <div className="pf-stack-slider-row">
        <span className="pf-stack-slider-label">{label}</span>
        <span className="pf-stack-slider-value">{current?.label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(lastIndex, 0)}
        step={1}
        value={index}
        onChange={(event) => {
          const next = options[Number(event.target.value)];
          if (next) onChange(next.value);
        }}
        aria-label={label}
        className="pf-stack-slider-input"
        style={{
          background: `linear-gradient(to right, var(--pf-palette-texte-fort, #f5f5f5) ${percent}%, color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 16%, var(--pf-palette-fond, #0a0a0a)) ${percent}%)`,
        }}
      />
    </div>
  );
}

/** S/M/L/XL, each button's own label rendered at the size it represents —
 *  the pill illustrates the scale directly, no separate value readout needed. */
const INFO_SIZE_PILL_OPTIONS: { value: PortfolioInfoHeaderTitleSize; label: string; fontPx: number }[] = [
  { value: 'sm', label: 'S', fontPx: 12 },
  { value: 'md', label: 'M', fontPx: 15 },
  { value: 'lg', label: 'L', fontPx: 18 },
  { value: 'xl', label: 'XL', fontPx: 22 },
];

function InfoSizePill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioInfoHeaderTitleSize;
  onChange: (value: PortfolioInfoHeaderTitleSize) => void;
}) {
  return (
    <div>
      <p className="pf-stack-block-label pf-stack-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-stack-segment grid grid-cols-4 gap-[3px] p-[3px]"
        data-compact="true"
      >
        {INFO_SIZE_PILL_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={option.label}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-stack-segment-btn flex items-center justify-center px-2.5 py-2 font-semibold leading-none"
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

const INFO_HEADER_MARGIN_BOTTOM_OPTIONS = [
  { value: 'sm' as const, label: 'Small' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Large' },
  { value: 'xl' as const, label: 'XL' },
];

const INFO_HEADER_TITLE_WEIGHT_OPTIONS = [
  { value: 'light' as const, label: 'Light', description: 'Lighter than this design’s default.' },
  { value: 'regular' as const, label: 'Regular', description: 'This design’s default weight.' },
  { value: 'semibold' as const, label: 'Semibold', description: 'A step bolder.' },
  { value: 'bold' as const, label: 'Bold', description: 'The boldest step.' },
];

/** Shared across every header design — bottom spacing, title size, and title weight.
 *  Appended to each design's own advanced-settings branch in the Header tab.
 *  `hideAlignment`/`hideTitleControls` drop controls a given design doesn't
 *  actually consume (e.g. Billboard has no adjustable title size/weight and
 *  ignores header alignment) — dead controls left visible are confusing. */
function InfoHeaderSharedAdvancedControls({
  info,
  onChange,
  hideAlignment = false,
  hideTitleControls = false,
}: {
  info: PortfolioInfoSectionSettings;
  onChange: (patch: Partial<PortfolioInfoSectionSettings>) => void;
  hideAlignment?: boolean;
  hideTitleControls?: boolean;
}) {
  return (
    <>
      {hideAlignment ? null : (
        <InfoOptionGrid
          label="Header alignment"
          options={[
            { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
            { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
            { value: 'right' as const, label: 'Right', description: 'Right-aligned title and subtitle.' },
          ]}
          value={info.headerDesignAlignment}
          onChange={(headerDesignAlignment: PortfolioInfoHeaderDesignAlignment) =>
            onChange({ headerDesignAlignment })
          }
          columns={3}
        />
      )}
      <InfoSlider
        label="Bottom spacing"
        options={INFO_HEADER_MARGIN_BOTTOM_OPTIONS}
        value={info.headerMarginBottom ?? 'md'}
        onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
      />
      {hideTitleControls ? null : (
        <>
          <InfoSizePill
            label="Title size"
            value={info.headerTitleSize ?? 'md'}
            onChange={(headerTitleSize) => onChange({ headerTitleSize })}
          />
          <InfoOptionGrid
            label="Title weight"
            options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
            value={info.headerTitleWeight ?? 'regular'}
            onChange={(headerTitleWeight: PortfolioInfoHeaderTitleWeight) => onChange({ headerTitleWeight })}
            columns={4}
          />
        </>
      )}
    </>
  );
}

/** Same titled "Design settings" band as the Stack section settings panel — re-plays its fade-in
 *  whenever the design variant changes (motionKey), so switching Info designs feels identical to
 *  switching Stack designs. */
function InfoLayoutSettingsBand({
  children,
  motionKey,
  title = 'Design settings',
}: {
  children: ReactNode;
  motionKey: string;
  title?: string;
}) {
  return (
    <section className="pf-stack-layout-settings" aria-labelledby="info-layout-settings-title">
      <h3 id="info-layout-settings-title" className="pf-stack-layout-settings-title">
        {title}
      </h3>
      <div key={motionKey} className="pf-stack-layout-settings-body space-y-6">
        {children}
      </div>
    </section>
  );
}

export function InfoSettingsPanel({
  info,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  heroPalette,
}: {
  info: PortfolioInfoSectionSettings;
  onChange: (patch: Partial<PortfolioInfoSectionSettings>) => void;
  subSection?: InfoSubSection;
  onSubSectionChange?: (value: InfoSubSection) => void;
  heroPalette?: PortfolioHeroPalette;
}) {
  const [uncontrolled, setUncontrolled] = useState<InfoSubSection>('general');
  const subSection = normalizeInfoSubSection(controlledSubSection ?? uncontrolled);
  const setSubSection = (value: InfoSubSection) => {
    const next = normalizeInfoSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection == null) setUncontrolled(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {INFO_SUB_SECTIONS.map((section) => (
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
        <div className="space-y-4">
          <InfoToggleRow
            label="Show Info section"
            checked={info.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />

          <SectionColorModeControl
            value={info.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />

          <InfoOptionGrid
            label="Font size"
            value={info.premiumFontSize ?? 'medium'}
            options={PORTFOLIO_INFO_PREMIUM_FONT_SIZE_OPTIONS}
            onChange={(premiumFontSize) => onChange({ premiumFontSize })}
            columns={3}
          />

          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Content visibility
            </p>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Background
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <InfoToggleRow
                  label="Education"
                  checked={
                    (info.design ?? 'about-me') === 'about-value-steps' ||
                    (info.design ?? 'about-me') === 'about-manifesto'
                      ? info.showEducation === true
                      : info.showEducation !== false
                  }
                  onChange={(showEducation) => onChange({ showEducation })}
                />
                {(info.design ?? 'about-me') === 'about-portrait-skills' ? (
                  <InfoToggleRow
                    label="Interests + languages"
                    checked={info.aboutPortraitSkillsMetaEnabled !== false}
                    onChange={(aboutPortraitSkillsMetaEnabled) =>
                      onChange({ aboutPortraitSkillsMetaEnabled })
                    }
                  />
                ) : (
                  <InfoToggleRow
                    label="Interests"
                    checked={info.showInterests !== false}
                    onChange={(showInterests) => onChange({ showInterests })}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Capabilities
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <InfoToggleRow
                  label="Skills"
                  checked={info.showSkills !== false}
                  onChange={(showSkills) => onChange({ showSkills })}
                />
                <InfoToggleRow
                  label="Strengths"
                  checked={info.showStrengths !== false}
                  onChange={(showStrengths) => onChange({ showStrengths })}
                />
                {(info.design ?? 'about-me') !== 'about-portrait-skills' ? (
                  <>
                    <InfoToggleRow
                      label="Languages"
                      checked={
                        (info.design ?? 'about-me') === 'about-value-steps'
                          ? info.showLanguages === true
                          : info.showLanguages !== false
                      }
                      onChange={(showLanguages) => onChange({ showLanguages })}
                    />
                    <InfoToggleRow
                      label="Systems & tools"
                      checked={
                        (info.design ?? 'about-me') === 'about-value-steps'
                          ? info.showSystemsTools === true
                          : info.showSystemsTools !== false
                      }
                      onChange={(showSystemsTools) => onChange({ showSystemsTools })}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-6">
          <InfoDesignChoiceGrid
            value={info.design ?? 'about-me'}
            onChange={(design) => onChange(infoDesignSettingsPatch(design))}
          />

          <InfoLayoutSettingsBand motionKey={info.design ?? 'about-me'}>
          {(info.design ?? 'about-me') !== 'about-manifesto' ? (
            <InfoToggleRow
              label="Language flags"
              checked={info.showLanguageFlags !== false}
              onChange={(showLanguageFlags) => onChange({ showLanguageFlags })}
            />
          ) : null}

          {portfolioInfoDesignHasPortrait(info.design) ? (
            <InfoToggleRow
              label="Black & white portrait"
              checked={resolveInfoPortraitGrayscale(info)}
              onChange={(infoPortraitGrayscale) =>
                onChange({
                  infoPortraitGrayscale,
                  aboutManifestoAvatarGrayscale: infoPortraitGrayscale,
                })
              }
            />
          ) : null}

          {(info.design ?? 'about-me') === 'about-value-steps' ? (
            <InfoOptionGrid
              label="Values display"
              value={resolveInfoAboutValueValuesLayout(info)}
              options={PORTFOLIO_INFO_ABOUT_VALUE_STEPS_VALUES_LAYOUT_OPTIONS}
              onChange={(aboutValueValuesLayout) => onChange({ aboutValueValuesLayout })}
            />
          ) : null}

          {(info.design ?? 'about-me') === 'about-value-steps' &&
          resolveInfoAboutValueValuesLayout(info) === 'editorial' ? (
            <InfoOptionGrid
              label="List bullets"
              value={info.aboutValueListMarkerStyle ?? 'dot'}
              options={PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS}
              icons={Object.fromEntries(
                PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS.map((option) => [
                  option.value,
                  <span key={option.value}>{option.preview}</span>,
                ])
              )}
              onChange={(aboutValueListMarkerStyle) => onChange({ aboutValueListMarkerStyle })}
            />
          ) : null}

          {(info.design ?? 'about-me') === 'about-split' ? (
            <InfoOptionGrid
              label="Portrait position"
              value={info.aboutSplitPortraitSide ?? 'left'}
              options={PORTFOLIO_INFO_ABOUT_SPLIT_PORTRAIT_SIDE_OPTIONS}
              onChange={(aboutSplitPortraitSide) => onChange({ aboutSplitPortraitSide })}
            />
          ) : null}

          {(info.design ?? 'about-me') === 'about-split' ? (
            <div>
              <InfoOptionGrid
                label="Block titles"
                value={info.aboutSplitLabelsMode ?? 'standard'}
                options={INFO_LABELS_MODE_OPTIONS}
                onChange={(aboutSplitLabelsMode) => onChange({ aboutSplitLabelsMode })}
              />
              {info.aboutSplitLabelsMode === 'custom' ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <InfoTextField
                    label="Skills"
                    value={info.aboutSplitCustomSkillsLabel ?? ''}
                    placeholder="Skills"
                    onChange={(aboutSplitCustomSkillsLabel) =>
                      onChange({ aboutSplitCustomSkillsLabel })
                    }
                  />
                  <InfoTextField
                    label="Strengths"
                    value={info.aboutSplitCustomStrengthsLabel ?? ''}
                    placeholder="Strengths"
                    onChange={(aboutSplitCustomStrengthsLabel) =>
                      onChange({ aboutSplitCustomStrengthsLabel })
                    }
                  />
                  <InfoTextField
                    label="Languages"
                    value={info.aboutSplitCustomLanguagesLabel ?? ''}
                    placeholder="Languages"
                    onChange={(aboutSplitCustomLanguagesLabel) =>
                      onChange({ aboutSplitCustomLanguagesLabel })
                    }
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-platform' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Main title (left)
                </p>
                <textarea
                  value={info.aboutPlatformHeadlineCustomText ?? ''}
                  placeholder={DEFAULT_ABOUT_PLATFORM_HEADLINE}
                  onChange={(event) =>
                    onChange({ aboutPlatformHeadlineCustomText: event.target.value })
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                />
              </div>
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-manifesto' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Statement text
                </p>
                <textarea
                  value={info.subtitle}
                  placeholder={DEFAULT_INFO_SUBTITLE}
                  onChange={(event) => onChange({ subtitle: event.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                />
              </div>

              <InfoToggleRow
                label="Customize statement typography"
                info="Override the color, size, weight and italics of the statement text above."
                checked={info.aboutManifestoStatementStyleEnabled === true}
                onChange={(aboutManifestoStatementStyleEnabled) =>
                  onChange({ aboutManifestoStatementStyleEnabled })
                }
              />

              {info.aboutManifestoStatementStyleEnabled === true ? (
                <PortfolioElementStyleFields
                  targets={[]}
                  activeTarget=""
                  onTargetChange={() => {}}
                  hideTargetPicker
                  hideFontPicker
                  textRole="title"
                  style={info.aboutManifestoStatementStyle}
                  onStyleChange={(patch) =>
                    onChange({
                      aboutManifestoStatementStyle: { ...info.aboutManifestoStatementStyle, ...patch },
                    })
                  }
                />
              ) : null}

              <InfoToggleRow
                label="Scroll focus"
                checked={info.aboutManifestoBlocksScrollFocus === true}
                onChange={(aboutManifestoBlocksScrollFocus) =>
                  onChange({ aboutManifestoBlocksScrollFocus })
                }
              />

              <InfoOptionGrid
                label="Portrait frame"
                value={info.aboutManifestoPortraitFrame ?? 'square'}
                options={PORTFOLIO_INFO_ABOUT_MANIFESTO_PORTRAIT_FRAME_OPTIONS}
                onChange={(aboutManifestoPortraitFrame) => onChange({ aboutManifestoPortraitFrame })}
              />
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-terminal' ? (
            <InfoToggleRow
              label="Always dark"
              info="Keeps the terminal window dark even when the global theme switches to light."
              checked={info.aboutTerminalAlwaysDark === true}
              onChange={(aboutTerminalAlwaysDark) => onChange({ aboutTerminalAlwaysDark })}
            />
          ) : null}

          {(info.design ?? 'about-me') === 'about-value-steps' ? (
            <div className="space-y-4">
              <InfoToggleRow
                label="Show intro"
                checked={info.aboutValueStepsIntroEnabled !== false}
                onChange={(aboutValueStepsIntroEnabled) =>
                  onChange({ aboutValueStepsIntroEnabled })
                }
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Intro text
                </p>
                <textarea
                  value={[info.aboutValueStepsIntroParagraph1, info.aboutValueStepsIntroParagraph2]
                    .filter(Boolean)
                    .join('\n\n')}
                  placeholder={'Intro text — paragraph 1.\n\nIntro text — paragraph 2.'}
                  onChange={(event) => {
                    const raw = event.target.value;
                    const separator = raw.match(/\n{2,}/);
                    onChange({
                      aboutValueStepsIntroParagraph1: separator ? raw.slice(0, separator.index) : raw,
                      aboutValueStepsIntroParagraph2: separator
                        ? raw.slice((separator.index ?? 0) + separator[0].length)
                        : '',
                    });
                  }}
                  rows={6}
                  className="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-neutral-900"
                />
              </div>
            </div>
          ) : null}

            {(info.design ?? 'about-me') === 'about-me-trait' ? (
              <div className="space-y-3">
                <InfoToggleRow
                  label="Show large headline"
                  checked={info.aboutMeTraitHeadlineEnabled !== false}
                  onChange={(aboutMeTraitHeadlineEnabled) =>
                    onChange({ aboutMeTraitHeadlineEnabled })
                  }
                />
                <textarea
                  value={info.aboutMeTraitHeadlineCustomText ?? ''}
                  placeholder={'Turning Hard\nProblems Into\nSimple Software'}
                  onChange={(event) =>
                    onChange({ aboutMeTraitHeadlineCustomText: event.target.value })
                  }
                  rows={4}
                  className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-neutral-900"
                />
              </div>
            ) : null}

            {(info.design ?? 'about-me') === 'about-me-trait' && info.showEducation !== false ? (
              <div className="space-y-4">
                <InfoOptionGrid
                  label="Education design"
                  value={info.educationDisplayStyle ?? 'editorial'}
                  options={PORTFOLIO_INFO_EDUCATION_DISPLAY_OPTIONS}
                  onChange={(educationDisplayStyle) => onChange({ educationDisplayStyle })}
                />
                {(info.educationDisplayStyle ?? 'editorial') === 'cascade' ? (
                  <InfoToggleRow
                    label="Cascade scroll animation"
                    checked={info.educationCascadeScrollShift === true}
                    onChange={(educationCascadeScrollShift) =>
                      onChange({ educationCascadeScrollShift })
                    }
                  />
                ) : null}
              </div>
            ) : null}
          </InfoLayoutSettingsBand>
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <div>
            <InfoHeaderDesignChoiceGrid
              value={info.headerDesign ?? 'editorial'}
              onChange={(headerDesign) => onChange({ headerDesign })}
            />

            <InfoLayoutSettingsBand motionKey={info.headerDesign ?? 'editorial'} title="Header design settings">
              {info.headerDesign === 'index' ? (
                <>
                  <div>
                    <p className="pf-stack-block-label">Rule label</p>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Text</p>
                        <input
                          type="text"
                          value={info.headerIndexLabelText}
                          onChange={(event) => onChange({ headerIndexLabelText: event.target.value })}
                          placeholder="Index"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <InfoPreviewCardGrid
                        label="Color"
                        options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: infoHeaderPaletteTokenGlyph(option.value),
                        }))}
                        value={info.headerIndexLabelColor ?? 'texteFort'}
                        onChange={(headerIndexLabelColor) => onChange({ headerIndexLabelColor })}
                        columns={3}
                      />
                      <InfoSizePill
                        label="Size"
                        value={info.headerIndexLabelSize ?? 'md'}
                        onChange={(headerIndexLabelSize) => onChange({ headerIndexLabelSize })}
                      />
                      <InfoOptionGrid
                        label="Weight"
                        options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                        value={info.headerIndexLabelWeight ?? 'regular'}
                        onChange={(headerIndexLabelWeight: PortfolioInfoHeaderTitleWeight) =>
                          onChange({ headerIndexLabelWeight })
                        }
                        columns={4}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <p className="pf-stack-block-label">Counter</p>
                    <div className="mt-3 space-y-4">
                      <InfoPreviewCardGrid
                        label="Numeral color"
                        options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: infoHeaderPaletteTokenGlyph(option.value),
                        }))}
                        value={info.headerIndexNumberColor ?? 'principal'}
                        onChange={(headerIndexNumberColor) => onChange({ headerIndexNumberColor })}
                        columns={3}
                      />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Count label</p>
                        <input
                          type="text"
                          value={info.headerIndexCountLabelText}
                          onChange={(event) => onChange({ headerIndexCountLabelText: event.target.value })}
                          placeholder="Highlights"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <p className="pf-stack-block-label">Title</p>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Text</p>
                        <input
                          type="text"
                          value={info.headerIndexTitleText}
                          onChange={(event) => onChange({ headerIndexTitleText: event.target.value })}
                          placeholder="About me"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <InfoPreviewCardGrid
                        label="Color"
                        options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: infoHeaderPaletteTokenGlyph(option.value),
                        }))}
                        value={info.headerIndexTitleColor ?? 'texteFort'}
                        onChange={(headerIndexTitleColor) => onChange({ headerIndexTitleColor })}
                        columns={3}
                      />
                      <InfoSizePill
                        label="Size"
                        value={info.headerIndexTitleSize ?? 'md'}
                        onChange={(headerIndexTitleSize) => onChange({ headerIndexTitleSize })}
                      />
                      <InfoOptionGrid
                        label="Weight"
                        options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                        value={info.headerIndexTitleWeight ?? 'regular'}
                        onChange={(headerIndexTitleWeight: PortfolioInfoHeaderTitleWeight) =>
                          onChange({ headerIndexTitleWeight })
                        }
                        columns={4}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <p className="pf-stack-block-label">Subtitle</p>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Text</p>
                        <input
                          type="text"
                          value={info.headerIndexSubtitleText}
                          onChange={(event) => onChange({ headerIndexSubtitleText: event.target.value })}
                          placeholder="Background, education, and how I work."
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <InfoPreviewCardGrid
                        label="Color"
                        options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: infoHeaderPaletteTokenGlyph(option.value),
                        }))}
                        value={info.headerIndexSubtitleColor ?? 'texteFort'}
                        onChange={(headerIndexSubtitleColor) => onChange({ headerIndexSubtitleColor })}
                        columns={3}
                      />
                      <InfoSizePill
                        label="Size"
                        value={info.headerIndexSubtitleSize ?? 'md'}
                        onChange={(headerIndexSubtitleSize) => onChange({ headerIndexSubtitleSize })}
                      />
                      <InfoOptionGrid
                        label="Weight"
                        options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                        value={info.headerIndexSubtitleWeight ?? 'regular'}
                        onChange={(headerIndexSubtitleWeight: PortfolioInfoHeaderTitleWeight) =>
                          onChange({ headerIndexSubtitleWeight })
                        }
                        columns={4}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <InfoHeaderSharedAdvancedControls info={info} onChange={onChange} hideTitleControls />
                  </div>
                </>
              ) : info.headerDesign === 'marquee' ? (
                <>
                  <div>
                    <p className="pf-stack-block-label">Words</p>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 1</p>
                        <input
                          type="text"
                          value={info.headerMarqueeWord1Text}
                          onChange={(event) => onChange({ headerMarqueeWord1Text: event.target.value })}
                          placeholder="About"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 2</p>
                        <input
                          type="text"
                          value={info.headerMarqueeWord2Text}
                          onChange={(event) => onChange({ headerMarqueeWord2Text: event.target.value })}
                          placeholder="Me"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 3</p>
                        <input
                          type="text"
                          value={info.headerMarqueeWord3Text}
                          onChange={(event) => onChange({ headerMarqueeWord3Text: event.target.value })}
                          placeholder="Optional"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 4</p>
                        <input
                          type="text"
                          value={info.headerMarqueeWord4Text}
                          onChange={(event) => onChange({ headerMarqueeWord4Text: event.target.value })}
                          placeholder="Optional"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <p className="pf-stack-block-label">Style</p>
                    <div className="mt-3 space-y-4">
                      <InfoPreviewCardGrid
                        label="Word color"
                        options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: infoHeaderPaletteTokenGlyph(option.value),
                        }))}
                        value={info.headerMarqueeWordColor ?? 'principal'}
                        onChange={(headerMarqueeWordColor) => onChange({ headerMarqueeWordColor })}
                        columns={3}
                      />
                      <InfoSizePill
                        label="Size"
                        value={info.headerMarqueeSize ?? 'md'}
                        onChange={(headerMarqueeSize) => onChange({ headerMarqueeSize })}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <InfoHeaderSharedAdvancedControls info={info} onChange={onChange} hideAlignment hideTitleControls />
                  </div>
                </>
              ) : info.headerDesign === 'accent-count' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Badge text</p>
                    <input
                      type="text"
                      value={info.headerAccentCountBadgeText}
                      onChange={(event) => onChange({ headerAccentCountBadgeText: event.target.value })}
                      placeholder="{count}+ highlights"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Lead text</p>
                    <input
                      type="text"
                      value={info.headerAccentCountLeadText}
                      onChange={(event) => onChange({ headerAccentCountLeadText: event.target.value })}
                      placeholder="A few things worth knowing about me."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <InfoPreviewCardGrid
                    label="Badge color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerAccentCountBadgeColor ?? 'principal'}
                    onChange={(headerAccentCountBadgeColor) => onChange({ headerAccentCountBadgeColor })}
                    columns={3}
                  />
                  <InfoPreviewCardGrid
                    label="Lead color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerAccentCountLeadColor ?? 'secondaire'}
                    onChange={(headerAccentCountLeadColor) => onChange({ headerAccentCountLeadColor })}
                    columns={3}
                  />
                  <InfoSizePill
                    label="Size"
                    value={info.headerAccentCountSize ?? 'md'}
                    onChange={(headerAccentCountSize) => onChange({ headerAccentCountSize })}
                  />
                  <InfoOptionGrid
                    label="Lead weight"
                    options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={info.headerAccentCountWeight ?? 'regular'}
                    onChange={(headerAccentCountWeight: PortfolioInfoHeaderTitleWeight) =>
                      onChange({ headerAccentCountWeight })
                    }
                    columns={4}
                  />
                  <InfoOptionGrid
                    label="Alignment"
                    options={INFO_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
                    value={info.headerAccentCountAlignment ?? 'left'}
                    onChange={(headerAccentCountAlignment: PortfolioInfoHeaderAccentCountAlignment) =>
                      onChange({ headerAccentCountAlignment })
                    }
                    columns={3}
                  />
                  <InfoHeaderSharedAdvancedControls info={info} onChange={onChange} hideAlignment hideTitleControls />
                </>
              ) : info.headerDesign === 'serif-lead' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Label</p>
                    <input
                      type="text"
                      value={info.headerSerifLeadLabelText}
                      onChange={(event) => onChange({ headerSerifLeadLabelText: event.target.value })}
                      placeholder="Info"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <InfoPreviewCardGrid
                    label="Label color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerSerifLeadLabelColor ?? 'texteFort'}
                    onChange={(headerSerifLeadLabelColor) => onChange({ headerSerifLeadLabelColor })}
                    columns={3}
                  />
                  <InfoSizePill
                    label="Label size"
                    value={info.headerSerifLeadLabelSize ?? 'md'}
                    onChange={(headerSerifLeadLabelSize) => onChange({ headerSerifLeadLabelSize })}
                  />
                  <InfoOptionGrid
                    label="Label weight"
                    options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={info.headerSerifLeadLabelWeight ?? 'regular'}
                    onChange={(headerSerifLeadLabelWeight: PortfolioInfoHeaderTitleWeight) =>
                      onChange({ headerSerifLeadLabelWeight })
                    }
                    columns={4}
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Title</p>
                    <input
                      type="text"
                      value={info.headerSerifLeadTitleText}
                      onChange={(event) => onChange({ headerSerifLeadTitleText: event.target.value })}
                      placeholder="A closer look at who I am and how I work."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <InfoPreviewCardGrid
                    label="Title color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerSerifLeadTitleColor ?? 'texteFort'}
                    onChange={(headerSerifLeadTitleColor) => onChange({ headerSerifLeadTitleColor })}
                    columns={3}
                  />
                  <InfoSizePill
                    label="Title size"
                    value={info.headerSerifLeadTitleSize ?? 'md'}
                    onChange={(headerSerifLeadTitleSize) => onChange({ headerSerifLeadTitleSize })}
                  />
                  <InfoOptionGrid
                    label="Title weight"
                    options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={info.headerSerifLeadTitleWeight ?? 'regular'}
                    onChange={(headerSerifLeadTitleWeight: PortfolioInfoHeaderTitleWeight) =>
                      onChange({ headerSerifLeadTitleWeight })
                    }
                    columns={4}
                  />
                  <InfoPreviewCardGrid
                    label="Subtitle color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerSerifLeadSubtitleColor ?? 'texteFort'}
                    onChange={(headerSerifLeadSubtitleColor) => onChange({ headerSerifLeadSubtitleColor })}
                    columns={3}
                  />
                  <InfoSizePill
                    label="Subtitle size"
                    value={info.headerSerifLeadSubtitleSize ?? 'md'}
                    onChange={(headerSerifLeadSubtitleSize) => onChange({ headerSerifLeadSubtitleSize })}
                  />
                  <InfoOptionGrid
                    label="Subtitle weight"
                    options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={info.headerSerifLeadSubtitleWeight ?? 'regular'}
                    onChange={(headerSerifLeadSubtitleWeight: PortfolioInfoHeaderTitleWeight) =>
                      onChange({ headerSerifLeadSubtitleWeight })
                    }
                    columns={4}
                  />
                  <InfoHeaderSharedAdvancedControls info={info} onChange={onChange} hideTitleControls />
                </>
              ) : info.headerDesign === 'billboard' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Big background word</p>
                    <input
                      type="text"
                      value={info.headerBillboardBigWord}
                      onChange={(event) => onChange({ headerBillboardBigWord: event.target.value })}
                      placeholder="INFO"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Count line</p>
                    <input
                      type="text"
                      value={info.headerBillboardCountText}
                      onChange={(event) => onChange({ headerBillboardCountText: event.target.value })}
                      placeholder="{count} things worth knowing"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Title</p>
                    <input
                      type="text"
                      value={info.headerBillboardTitleText}
                      onChange={(event) => onChange({ headerBillboardTitleText: event.target.value })}
                      placeholder="About me"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <InfoPreviewCardGrid
                    label="Big word style"
                    options={INFO_HEADER_BILLBOARD_WORD_STYLE_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderBillboardWordStyleGlyph(option.value),
                    }))}
                    value={info.headerBillboardWordStyle ?? 'outline'}
                    onChange={(headerBillboardWordStyle: PortfolioInfoHeaderBillboardWordStyle) =>
                      onChange({ headerBillboardWordStyle })
                    }
                    columns={3}
                  />
                  <InfoPreviewCardGrid
                    label="Big word color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerBillboardWordColor ?? 'principal'}
                    onChange={(headerBillboardWordColor) => onChange({ headerBillboardWordColor })}
                    columns={3}
                  />
                  <InfoPreviewCardGrid
                    label="Title color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerBillboardTitleColor ?? 'principal'}
                    onChange={(headerBillboardTitleColor) => onChange({ headerBillboardTitleColor })}
                    columns={3}
                  />
                  <InfoPreviewCardGrid
                    label="Count line color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerBillboardMetaColor ?? 'secondaire'}
                    onChange={(headerBillboardMetaColor) => onChange({ headerBillboardMetaColor })}
                    columns={3}
                  />
                  <InfoHeaderSharedAdvancedControls info={info} onChange={onChange} hideAlignment hideTitleControls />
                </>
              ) : info.headerDesign === 'masthead' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 1</p>
                    <input
                      type="text"
                      value={info.headerMastheadLine1Text}
                      onChange={(event) => onChange({ headerMastheadLine1Text: event.target.value })}
                      placeholder="Get to know me."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 2</p>
                    <input
                      type="text"
                      value={info.headerMastheadLine2Text}
                      onChange={(event) => onChange({ headerMastheadLine2Text: event.target.value })}
                      placeholder="A bit of my story."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 3</p>
                    <input
                      type="text"
                      value={info.headerMastheadLine3Text}
                      onChange={(event) => onChange({ headerMastheadLine3Text: event.target.value })}
                      placeholder="Background, skills, and how I work."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <InfoPreviewCardGrid
                    label="Headline color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerMastheadHeadlineColor ?? 'principal'}
                    onChange={(headerMastheadHeadlineColor) => onChange({ headerMastheadHeadlineColor })}
                    columns={3}
                  />
                  <InfoSizePill
                    label="Headline size"
                    value={info.headerMastheadHeadlineSize ?? 'md'}
                    onChange={(headerMastheadHeadlineSize) => onChange({ headerMastheadHeadlineSize })}
                  />
                  <InfoOptionGrid
                    label="Headline weight"
                    options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={info.headerMastheadHeadlineWeight ?? 'regular'}
                    onChange={(headerMastheadHeadlineWeight: PortfolioInfoHeaderTitleWeight) =>
                      onChange({ headerMastheadHeadlineWeight })
                    }
                    columns={4}
                  />
                  <InfoHeaderSharedAdvancedControls info={info} onChange={onChange} hideTitleControls />
                </>
              ) : info.headerDesign === 'split-heading' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Title</p>
                    <input
                      type="text"
                      value={info.headerSplitHeadingTitleText}
                      onChange={(event) => onChange({ headerSplitHeadingTitleText: event.target.value })}
                      placeholder="About me"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Label</p>
                    <input
                      type="text"
                      value={info.headerSplitHeadingLabelText}
                      onChange={(event) => onChange({ headerSplitHeadingLabelText: event.target.value })}
                      placeholder="Info"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <InfoPreviewCardGrid
                    label="Title color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerSplitHeadingTitleColor ?? 'principal'}
                    onChange={(headerSplitHeadingTitleColor) => onChange({ headerSplitHeadingTitleColor })}
                    columns={3}
                  />
                  <InfoSizePill
                    label="Title size"
                    value={info.headerSplitHeadingTitleSize ?? 'md'}
                    onChange={(headerSplitHeadingTitleSize) => onChange({ headerSplitHeadingTitleSize })}
                  />
                  <InfoOptionGrid
                    label="Title weight"
                    options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={info.headerSplitHeadingTitleWeight ?? 'regular'}
                    onChange={(headerSplitHeadingTitleWeight: PortfolioInfoHeaderTitleWeight) =>
                      onChange({ headerSplitHeadingTitleWeight })
                    }
                    columns={4}
                  />
                  <InfoPreviewCardGrid
                    label="Label color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerSplitHeadingLabelColor ?? 'secondaire'}
                    onChange={(headerSplitHeadingLabelColor) => onChange({ headerSplitHeadingLabelColor })}
                    columns={3}
                  />
                  <InfoSizePill
                    label="Label size"
                    value={info.headerSplitHeadingLabelSize ?? 'md'}
                    onChange={(headerSplitHeadingLabelSize) => onChange({ headerSplitHeadingLabelSize })}
                  />
                  <InfoOptionGrid
                    label="Label weight"
                    options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={info.headerSplitHeadingLabelWeight ?? 'regular'}
                    onChange={(headerSplitHeadingLabelWeight: PortfolioInfoHeaderTitleWeight) =>
                      onChange({ headerSplitHeadingLabelWeight })
                    }
                    columns={4}
                  />
                  <InfoHeaderSharedAdvancedControls info={info} onChange={onChange} hideAlignment hideTitleControls />
                </>
              ) : info.headerDesign === 'chapter' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Index</p>
                    <input
                      type="text"
                      value={info.headerChapterIndexText}
                      onChange={(event) => onChange({ headerChapterIndexText: event.target.value })}
                      placeholder="02 /"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Title</p>
                    <input
                      type="text"
                      value={info.headerChapterTitleText}
                      onChange={(event) => onChange({ headerChapterTitleText: event.target.value })}
                      placeholder="Expertise & Mindset"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <InfoPreviewCardGrid
                    label="Index color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerChapterIndexColor ?? 'principal'}
                    onChange={(headerChapterIndexColor) => onChange({ headerChapterIndexColor })}
                    columns={3}
                  />
                  <InfoPreviewCardGrid
                    label="Title color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerChapterTitleColor ?? 'texteFort'}
                    onChange={(headerChapterTitleColor) => onChange({ headerChapterTitleColor })}
                    columns={3}
                  />
                  <InfoSizePill
                    label="Title size"
                    value={info.headerChapterTitleSize ?? 'md'}
                    onChange={(headerChapterTitleSize) => onChange({ headerChapterTitleSize })}
                  />
                  <InfoOptionGrid
                    label="Title weight"
                    options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={info.headerChapterTitleWeight ?? 'regular'}
                    onChange={(headerChapterTitleWeight: PortfolioInfoHeaderTitleWeight) =>
                      onChange({ headerChapterTitleWeight })
                    }
                    columns={4}
                  />
                  <InfoHeaderSharedAdvancedControls info={info} onChange={onChange} hideTitleControls />
                </>
              ) : info.headerDesign === 'cover' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 1</p>
                    <input
                      type="text"
                      value={info.headerCoverLine1Text}
                      onChange={(event) => onChange({ headerCoverLine1Text: event.target.value })}
                      placeholder="Built To Ship"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 2</p>
                    <input
                      type="text"
                      value={info.headerCoverLine2Text}
                      onChange={(event) => onChange({ headerCoverLine2Text: event.target.value })}
                      placeholder="Designed To"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 3</p>
                    <input
                      type="text"
                      value={info.headerCoverLine3Text}
                      onChange={(event) => onChange({ headerCoverLine3Text: event.target.value })}
                      placeholder="Scale"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <InfoPreviewCardGrid
                    label="Headline color"
                    options={INFO_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: infoHeaderPaletteTokenGlyph(option.value),
                    }))}
                    value={info.headerCoverHeadlineColor ?? 'texteFort'}
                    onChange={(headerCoverHeadlineColor) => onChange({ headerCoverHeadlineColor })}
                    columns={3}
                  />
                  <InfoSizePill
                    label="Headline size"
                    value={info.headerCoverHeadlineSize ?? 'md'}
                    onChange={(headerCoverHeadlineSize) => onChange({ headerCoverHeadlineSize })}
                  />
                  <InfoOptionGrid
                    label="Headline weight"
                    options={INFO_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={info.headerCoverHeadlineWeight ?? 'regular'}
                    onChange={(headerCoverHeadlineWeight: PortfolioInfoHeaderTitleWeight) =>
                      onChange({ headerCoverHeadlineWeight })
                    }
                    columns={4}
                  />
                  <InfoHeaderSharedAdvancedControls info={info} onChange={onChange} hideAlignment hideTitleControls />
                </>
              ) : (
                <>
                  <InfoToggleRow
                    label="Header motion"
                    info="Respects reduced-motion preference"
                    checked={info.headerAnimationEnabled !== false}
                    onChange={(headerAnimationEnabled) => onChange({ headerAnimationEnabled })}
                  />
                  <InfoHeaderSharedAdvancedControls info={info} onChange={onChange} />
                </>
              )}
            </InfoLayoutSettingsBand>
          </div>
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-4">
          <SectionBackgroundSettingsFields
            settings={info}
            onChange={(patch) => onChange(patch)}
            title="Info section background"
            renderColorField={({ label, value, onChange: onColorChange }) => (
              <InfoPaletteSwatchPicker
                label={label}
                palette={heroPalette ?? DEFAULT_HERO_PALETTE}
                value={value}
                onChange={onColorChange}
              />
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
