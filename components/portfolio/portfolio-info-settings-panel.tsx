'use client';

import { useId, useState, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import {
  infoDesignSettingsPatch,
  portfolioInfoDesignContent,
  portfolioInfoDesignHasPortrait,
  resolveInfoPortraitGrayscale,
  DEFAULT_ABOUT_PLATFORM_HEADLINE,
  DEFAULT_INFO_SUBTITLE,
  DEFAULT_INFO_PRESENTATION,
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
  infoBlockLabelSwatchColor,
  INFO_DESIGNS_WITH_BLOCK_LABEL_COLOR,
  PORTFOLIO_INFO_BLOCK_LABEL_COLOR_OPTIONS,
  type PortfolioInfoDesign,
  type PortfolioInfoHeaderDesign,
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
import { PortfolioHeaderDesignOption } from '@/components/portfolio/portfolio-header-design-lock';
import { HeaderDesignFields, type HeaderCopy } from '@/components/portfolio/portfolio-header-design-fields';
import type { HeaderPatch } from '@/components/portfolio/portfolio-header-style-controls';
import {
  HeaderBlock,
  HeaderColorRow,
  HeaderStyleTargetsEditor,
  HeaderTextField,
} from '@/components/portfolio/portfolio-header-style-controls';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import {
  NpBackRow,
  NpCollapsibleSection,
  NpOptionCard,
  NpOptionCardGroup,
  NpPanelShell,
  NpPickerRow,
  NpSegmentedControl,
  NpToggleRow,
  type NpPanelChrome,
} from '@/components/portfolio/portfolio-nav-panel-ui';

/** Same general / design / header / background pill-switcher mechanism as the Stack section settings panel.
 *  Header is one shared, GSAP-animated header (copied from the Portfolio/Work section's Header mechanism)
 *  mounted above the section, independent of Design's per-design layout. */
export type InfoSubSection = 'general' | 'design' | 'header' | 'background';

const INFO_SUB_SECTIONS: { id: InfoSubSection; label: string }[] = [
  { id: 'general', label: msg('General') },
  { id: 'design', label: msg('Design') },
  { id: 'header', label: msg('Header') },
  { id: 'background', label: msg('Background') },
];

function normalizeInfoSubSection(value: string | undefined): InfoSubSection {
  return INFO_SUB_SECTIONS.some((item) => item.id === value)
    ? (value as InfoSubSection)
    : 'general';
}

const INFO_LABELS_MODE_OPTIONS: { value: 'standard' | 'custom'; label: string }[] = [
  { value: 'standard', label: msg('Standard') },
  { value: 'custom', label: msg('Custom') },
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
    <label className="np-field block">
      <span className="np-field-label">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="np-input"
      />
    </label>
  );
}

/** Same curated 4-token swatch set as the Stack section's background color pickers
 *  (STACK_BACKGROUND_PALETTE_TOKENS) — no free-form hex anywhere in Info: every color comes
 *  from the portfolio's own Hero palette, picked as a swatch. */
const INFO_PALETTE_SWATCH_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: msg('Background') },
  { value: 'neutre', label: msg('Neutral') },
  { value: 'principal', label: msg('Primary') },
  { value: 'texteMuted', label: msg('Muted text') },
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
  const t = useT();
  const activeHex = value.trim().toLowerCase();
  return (
    <div className="np-field">
      <p className="np-field-label">{label}</p>
      <div className="flex flex-wrap gap-3">
        {tokens.map((token) => {
          const hex = resolveHeroPaletteColor(palette, token.value);
          const active = hex.toLowerCase() === activeHex;
          return (
            <button
              key={token.value}
              type="button"
              onClick={() => onChange(hex)}
              aria-pressed={active}
              aria-label={t(token.label)}
              title={t(token.label)}
              className="group flex min-w-[58px] flex-col items-center gap-1.5"
            >
              <span
                className="h-8 w-8 rounded-full border-2 shadow-inner transition"
                style={{
                  backgroundColor: hex,
                  borderColor: active ? 'var(--np-accent)' : 'var(--np-border)',
                  boxShadow: active ? '0 0 0 2px color-mix(in srgb, var(--np-accent) 22%, transparent)' : undefined,
                }}
              />
              <span className={`text-[11px] font-medium ${active ? 'text-[color:var(--np-text)]' : 'text-[color:var(--np-muted)]'}`}>{t(token.label)}</span>
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

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus
 *  instead of a permanent line of text under a toggle. Same mechanism as Stack/Contact. */
function InfoInfoTooltip({ text }: { text: string }) {
  const t = useT();
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
        aria-label={t('More info: {text}', { text })}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => event.stopPropagation()}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[color:var(--np-muted)] transition hover:text-[color:var(--np-text)] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--np-accent)]"
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
    <NpToggleRow
      title={label}
      description={description}
      checked={checked}
      onChange={onChange}
      adornment={info ? <InfoInfoTooltip text={info} /> : undefined}
    />
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
  columns: _columns,
  icons: _icons,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  icons?: Partial<Record<string, ReactNode>>;
}) {
  const t = useT();
  return (
    <NpSegmentedControl
      label={label}
      value={value}
      options={options.map((option) => ({
        value: option.value,
        label: t(option.label),
        title: t(option.description),
      }))}
      onChange={onChange}
    />
  );
}

/** One mini-wireframe per PortfolioInfoDesign — same StackDesignWireframe mechanism, tuned to each
 *  About layout's actual anatomy so the picker card reads as a preview, not a generic placeholder. */
function InfoDesignWireframe({ design }: { design: PortfolioInfoDesign }) {
  const t = useT();
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
            {t('about --bio')}
          </InfoMiniType>
          <rect className="pf-stack-mini-mute" x="8" y="26" width="70" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="8" y="32" width="1.6" height="2.4" rx="0.5" />
          <InfoMiniType x={13} y={34.5} size={5}>
            {t('skills //')}
          </InfoMiniType>
          <rect className="pf-stack-mini-mute" x="8" y="40" width="56" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="8" y="46" width="44" height="2" rx="1" />
          <rect className="pf-stack-mini-accent" x="8" y="52" width="1.6" height="2.4" rx="0.5" />
          <InfoMiniType x={13} y={54.5} size={5}>
            {t('education.log')}
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
            {t('EN')}
          </InfoMiniType>
          <InfoMiniType x={62} y={62} size={13}>
            {t('FR')}
          </InfoMiniType>
          <InfoMiniType x={94} y={62} size={13}>
            {t('ES')}
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
    <NpPickerRow
      label={label}
      value={name}
      onClick={onOpen}
      thumbnail={
        <span className="flex w-[116px] shrink-0 origin-center scale-[1.05] items-center justify-center">
          {children}
        </span>
      }
    />
  );
}

function InfoDesignChoiceGrid({
  value,
  onChange,
  open: showGrid,
  onOpenChange: setShowGrid,
}: {
  value: PortfolioInfoDesign;
  onChange: (value: PortfolioInfoDesign) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const selected =
    PORTFOLIO_INFO_DESIGN_OPTIONS.find((option) => option.value === value) ?? PORTFOLIO_INFO_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div className="np-stack">
        <NpBackRow title={t('Info design')} onBack={() => setShowGrid(false)} />
        <NpOptionCardGroup label={t('Choose a design')} columns={2}>
          {PORTFOLIO_INFO_DESIGN_OPTIONS.map((option) => (
            <NpOptionCard
              key={option.value}
              selected={option.value === value}
              title={t(option.label)}
              illustration={<InfoDesignWireframe design={option.value} />}
              onClick={() => {
                onChange(option.value);
                setShowGrid(false);
              }}
            />
          ))}
        </NpOptionCardGroup>
      </div>
    );
  }

  return (
    <InfoDesignSummaryRow label={t('Design Info')} name={selected.label} onOpen={() => setShowGrid(true)}>
      <InfoDesignWireframe design={value} />
    </InfoDesignSummaryRow>
  );
}

/** Mini wireframes for the 8 Header design picker cards — same InfoMiniSlide mechanism
 *  as the generic shapes Stack/Tools/Contact use for their own Header design picker. */
function InfoHeaderDesignWireframe({ design }: { design: PortfolioInfoHeaderDesign }) {
  const t = useT();
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
            {t('INFO')}
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
            {t('INFO')}
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
            {t('Expertise')}
          </text>
          <rect className="pf-stack-mini-accent" x="10" y="60" width="22" height="2.5" rx="1.25" />
        </InfoMiniSlide>
      );
    case 'cover':
      return (
        <InfoMiniSlide>
          <text x="60" y="30" fontSize={13} fontStyle="italic" fontWeight={700} textAnchor="middle" className="pf-stack-mini-ink">
            {t('Built To Ship')}
          </text>
          <text x="60" y="46" fontSize={13} fontStyle="italic" fontWeight={700} textAnchor="middle" className="pf-stack-mini-ink">
            {t('Designed To')}
          </text>
          <text x="60" y="62" fontSize={13} fontStyle="italic" fontWeight={700} textAnchor="middle" className="pf-stack-mini-ink">
            {t('Scale')}
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
  open: showGrid,
  onOpenChange: setShowGrid,
}: {
  value: PortfolioInfoHeaderDesign;
  onChange: (value: PortfolioInfoHeaderDesign) => void;
  /** Whether the catalog of designs is open (owned by the panel so it can hide the settings below). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const selected =
    PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div className="np-stack">
        <NpBackRow title={t('Header design')} onBack={() => setShowGrid(false)} />
        <NpOptionCardGroup label={t('Choose a header')} columns={2}>
          {PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS.map((option) => (
            <PortfolioHeaderDesignOption key={option.value} design={option.value}>
              <NpOptionCard
                selected={option.value === value}
                title={t(option.label)}
                illustration={<InfoHeaderDesignWireframe design={option.value} />}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              />
            </PortfolioHeaderDesignOption>
          ))}
        </NpOptionCardGroup>
      </div>
    );
  }

  return (
    <InfoDesignSummaryRow label={t('Header design')} name={selected.label} onOpen={() => setShowGrid(true)}>
      <InfoHeaderDesignWireframe design={value} />
    </InfoDesignSummaryRow>
  );
}

function InfoLayoutSettingsBand({
  children,
  motionKey,
  title,
}: {
  children: ReactNode;
  motionKey: string;
  title?: string;
}) {
  const t = useT();
  return (
    <NpCollapsibleSection title={title ?? t('Design settings')}>
      <div key={motionKey} className="np-stack">
        {children}
      </div>
    </NpCollapsibleSection>
  );
}


/** Info's two own header designs (chapter, cover) — same layout as the shared ones. */
function infoExtraHeaderDesign(
  design: string,
  info: PortfolioInfoSectionSettings,
  onPatch: (patch: HeaderPatch) => void,
  shared: (opts?: { hideAlignment?: boolean; hideTitleControls?: boolean }) => ReactNode,
  toggles: ReactNode
): ReactNode {
  const colorProps = { colorOptions: INFO_HEADER_PALETTE_TOKEN_OPTIONS, resolveColor: infoHeaderPaletteTokenColor };
  if (design === 'chapter') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField
            label="Index"
            value={info.headerChapterIndexText}
            placeholder="02 /"
            onChange={(headerChapterIndexText) => onPatch({ headerChapterIndexText })}
          />
          <HeaderTextField
            label="Title"
            value={info.headerChapterTitleText}
            placeholder="Expertise & Mindset"
            onChange={(headerChapterTitleText) => onPatch({ headerChapterTitleText })}
          />
        </div>
        {toggles}
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={info}
            onPatch={onPatch}
            initialId="title"
            targets={[
              { id: 'index', label: 'Index', color: { key: 'headerChapterIndexColor', fallback: 'principal' } },
              {
                id: 'title',
                label: 'Title',
                color: { key: 'headerChapterTitleColor', fallback: 'texteFort' },
                size: { key: 'headerChapterTitleSize', fallback: 'md' },
                weight: { key: 'headerChapterTitleWeight', fallback: 'regular' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideTitleControls: true })}
      </>
    );
  }
  if (design === 'cover') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField
            label="Line 1"
            value={info.headerCoverLine1Text}
            placeholder="Built To Ship"
            onChange={(headerCoverLine1Text) => onPatch({ headerCoverLine1Text })}
          />
          <HeaderTextField
            label="Line 2"
            value={info.headerCoverLine2Text}
            placeholder="Designed To"
            onChange={(headerCoverLine2Text) => onPatch({ headerCoverLine2Text })}
          />
          <HeaderTextField
            label="Line 3"
            value={info.headerCoverLine3Text}
            placeholder="Scale"
            onChange={(headerCoverLine3Text) => onPatch({ headerCoverLine3Text })}
          />
        </div>
        {toggles}
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={info}
            onPatch={onPatch}
            title="Headline style"
            targets={[
              {
                id: 'headline',
                label: 'Headline',
                color: { key: 'headerCoverHeadlineColor', fallback: 'texteFort' },
                size: { key: 'headerCoverHeadlineSize', fallback: 'md' },
                weight: { key: 'headerCoverHeadlineWeight', fallback: 'regular' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideAlignment: true, hideTitleControls: true })}
      </>
    );
  }
  return null;
}

const INFO_HEADER_COPY: HeaderCopy = {
  editorial: { label: msg('Info'), title: msg('About me'), subtitle: msg('Background, education, and how I work.') },
  index: { rule: 'Index', title: msg('About me'), subtitle: msg('Background, education, and how I work.'), count: 'Highlights' },
  marquee: ['About', 'Optional', 'Optional', 'Optional'],
  accent: { badge: '{count}+ highlights', lead: 'A few things worth knowing about me.' },
  serif: { label: msg('Info'), title: msg('A closer look at who I am and how I work.'), subtitle: msg('Background, education, and how I work.') },
  billboard: { word: 'INFO', title: msg('About me'), count: '{count} things worth knowing' },
  masthead: ['Get to know me.', 'A bit of my story.', 'Background, skills, and how I work.'],
  split: { title: msg('About me'), label: msg('Info') },
};

/** The Header tab body: this design's texts, one style editor, then the controls every design shares. */
function InfoHeaderDesignFields({
  info,
  onChange,
}: {
  info: PortfolioInfoSectionSettings;
  onChange: (patch: Partial<PortfolioInfoSectionSettings>) => void;
}) {
  const onPatch = (patch: HeaderPatch) => onChange(patch as Partial<PortfolioInfoSectionSettings>);
  return (
    <HeaderDesignFields
      settings={info}
      onPatch={onPatch}
      copy={INFO_HEADER_COPY}
      colorOptions={INFO_HEADER_PALETTE_TOKEN_OPTIONS}
      resolveColor={infoHeaderPaletteTokenColor}
      accentAlignmentOptions={INFO_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
      billboardStyleOptions={INFO_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
      extra={(design, shared, toggles) => infoExtraHeaderDesign(design, info, onPatch, shared, toggles)}
    />
  );
}

const DEFAULT_INFO_SECTION_SETTINGS: PortfolioInfoSectionSettings = {
  enabled: true,
  title: 'About me',
  subtitle: 'Background, education and how I work.',
  ...DEFAULT_INFO_PRESENTATION,
};

function infoSettingsModified(info: PortfolioInfoSectionSettings) {
  const keys = Object.keys({ ...DEFAULT_INFO_SECTION_SETTINGS, ...info }) as (
    keyof PortfolioInfoSectionSettings
  )[];
  return keys.some((key) => {
    const current = info[key] === undefined ? DEFAULT_INFO_SECTION_SETTINGS[key] : info[key];
    return JSON.stringify(current) !== JSON.stringify(DEFAULT_INFO_SECTION_SETTINGS[key]);
  });
}

function InfoHiddenNotice({ onEnable }: { onEnable: () => void }) {
  const t = useT();
  return (
    <div className="np-toggle-card flex-col !items-stretch gap-4">
      <div>
        <p className="np-card-title">{t('Info section is hidden')}</p>
        <p className="np-subtle mt-1">{t('Enable it to edit this tab and show it in the portfolio.')}</p>
      </div>
      <button type="button" className="np-primary-btn" onClick={onEnable}>
        {t('Show Info section')}
      </button>
    </div>
  );
}

export function InfoSettingsPanel({
  info,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  heroPalette,
  chrome,
}: {
  info: PortfolioInfoSectionSettings;
  onChange: (patch: Partial<PortfolioInfoSectionSettings>) => void;
  subSection?: InfoSubSection;
  onSubSectionChange?: (value: InfoSubSection) => void;
  heroPalette?: PortfolioHeroPalette;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const [uncontrolled, setUncontrolled] = useState<InfoSubSection>('general');
  const [designCatalogOpen, setDesignCatalogOpen] = useState(false);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(false);
  const subSection = normalizeInfoSubSection(controlledSubSection ?? uncontrolled);
  const design = info.design ?? 'about-me';
  const designContent = portfolioInfoDesignContent(design);
  const setSubSection = (value: InfoSubSection) => {
    const next = normalizeInfoSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection == null) setUncontrolled(next);
  };
  const modified = infoSettingsModified(info);

  return (
    <NpPanelShell
      title={t('Info')}
      modified={modified}
      tabs={INFO_SUB_SECTIONS.map((item) => ({ ...item, label: t(item.label) }))}
      activeTab={subSection}
      onTabChange={setSubSection}
      onReset={() => onChange({ ...DEFAULT_INFO_SECTION_SETTINGS })}
      chrome={chrome}
    >

      {subSection === 'general' ? (
        <div className="np-stack">
          <NpToggleRow
            card
            title={t('Show Info section')}
            description={info.enabled ? undefined : t('Visitors go straight to the next section.')}
            checked={info.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <div
            className="np-dimmable"
            data-disabled={info.enabled ? 'false' : 'true'}
            aria-disabled={!info.enabled}
            inert={!info.enabled}
          >
              {/* Section-wide, shared by every design — so they live with the other section switches. */}
              <SectionColorModeControl
                label={t('Color mode')}
                value={info.colorModeOverride}
                onChange={(colorModeOverride) => onChange({ colorModeOverride })}
              />
              <InfoOptionGrid
                label={t('Text size')}
                value={info.premiumFontSize ?? 'medium'}
                options={PORTFOLIO_INFO_PREMIUM_FONT_SIZE_OPTIONS}
                onChange={(premiumFontSize) => onChange({ premiumFontSize })}
                columns={3}
              />
              {INFO_DESIGNS_WITH_BLOCK_LABEL_COLOR.includes(design) ? (
                <HeaderColorRow
                  label={t('Block label color')}
                  value={info.blockLabelColor ?? 'muted'}
                  options={PORTFOLIO_INFO_BLOCK_LABEL_COLOR_OPTIONS.map((option) => ({
                    ...option,
                    label: t(option.label),
                  }))}
                  resolveColor={infoBlockLabelSwatchColor}
                  onChange={(blockLabelColor) => onChange({ blockLabelColor })}
                />
              ) : null}
              {/* Each design draws its own set of blocks: only the switches it honours are offered. */}
              <NpCollapsibleSection title={t('Education & interests')}>
                <NpToggleRow
                  title={t('Education')}
                  checked={
                    design === 'about-value-steps' || design === 'about-manifesto'
                      ? info.showEducation === true
                      : info.showEducation !== false
                  }
                  onChange={(showEducation) => onChange({ showEducation })}
                />
                {design === 'about-portrait-skills' ? (
                  <NpToggleRow
                    title={t('Interests + languages')}
                    checked={info.aboutPortraitSkillsMetaEnabled !== false}
                    onChange={(aboutPortraitSkillsMetaEnabled) =>
                      onChange({ aboutPortraitSkillsMetaEnabled })
                    }
                  />
                ) : designContent.interests ? (
                  <NpToggleRow
                    title={t('Interests')}
                    checked={info.showInterests !== false}
                    onChange={(showInterests) => onChange({ showInterests })}
                  />
                ) : null}
              </NpCollapsibleSection>
              <NpCollapsibleSection title={t('Skills & tools')}>
                <NpToggleRow
                  title={t('Skills')}
                  checked={info.showSkills !== false}
                  onChange={(showSkills) => onChange({ showSkills })}
                />
                <NpToggleRow
                  title={t('Strengths')}
                  checked={info.showStrengths !== false}
                  onChange={(showStrengths) => onChange({ showStrengths })}
                />
                {designContent.languages && design !== 'about-portrait-skills' ? (
                  <NpToggleRow
                    title={t('Languages')}
                    checked={
                      design === 'about-value-steps'
                        ? info.showLanguages === true
                        : info.showLanguages !== false
                    }
                    onChange={(showLanguages) => onChange({ showLanguages })}
                  />
                ) : null}
                {designContent.systemsTools ? (
                  <NpToggleRow
                    title={t('Systems & tools')}
                    checked={
                      design === 'about-value-steps'
                        ? info.showSystemsTools === true
                        : info.showSystemsTools !== false
                    }
                    onChange={(showSystemsTools) => onChange({ showSystemsTools })}
                  />
                ) : null}
              </NpCollapsibleSection>
          </div>
        </div>
      ) : null}

      {subSection !== 'general' && !info.enabled ? <InfoHiddenNotice onEnable={() => onChange({ enabled: true })} /> : null}

      {subSection === 'design' && info.enabled ? (
        designCatalogOpen ? (
          <InfoDesignChoiceGrid
            value={info.design ?? 'about-me'}
            onChange={(design) => onChange(infoDesignSettingsPatch(design))}
            open
            onOpenChange={setDesignCatalogOpen}
          />
        ) : (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Presentation')}>
            <InfoDesignChoiceGrid
              value={info.design ?? 'about-me'}
              onChange={(design) => onChange(infoDesignSettingsPatch(design))}
              open={false}
              onOpenChange={setDesignCatalogOpen}
            />

          </NpCollapsibleSection>

          {/* About me and Index have no options of their own (no design draws language flags, so that
              switch is gone): no empty band. */}
          {design === 'about-me' || design === 'about-index' ? null : (
          <InfoLayoutSettingsBand motionKey={design}>
          {portfolioInfoDesignHasPortrait(info.design) ? (
            <InfoToggleRow
              label={t('Black & white portrait')}
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
              label={t('Values display')}
              value={resolveInfoAboutValueValuesLayout(info)}
              options={PORTFOLIO_INFO_ABOUT_VALUE_STEPS_VALUES_LAYOUT_OPTIONS}
              onChange={(aboutValueValuesLayout) => onChange({ aboutValueValuesLayout })}
            />
          ) : null}

          {(info.design ?? 'about-me') === 'about-value-steps' &&
          resolveInfoAboutValueValuesLayout(info) === 'editorial' ? (
            <InfoOptionGrid
              label={t('List bullets')}
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
              label={t('Portrait position')}
              value={info.aboutSplitPortraitSide ?? 'left'}
              options={PORTFOLIO_INFO_ABOUT_SPLIT_PORTRAIT_SIDE_OPTIONS}
              onChange={(aboutSplitPortraitSide) => onChange({ aboutSplitPortraitSide })}
            />
          ) : null}

          {(info.design ?? 'about-me') === 'about-split' ? (
            <div>
              <InfoOptionGrid
                label={t('Block titles')}
                value={info.aboutSplitLabelsMode ?? 'standard'}
                options={INFO_LABELS_MODE_OPTIONS}
                onChange={(aboutSplitLabelsMode) => onChange({ aboutSplitLabelsMode })}
              />
              {info.aboutSplitLabelsMode === 'custom' ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <InfoTextField
                    label={t('Skills')}
                    value={info.aboutSplitCustomSkillsLabel ?? ''}
                    placeholder={t('Skills')}
                    onChange={(aboutSplitCustomSkillsLabel) =>
                      onChange({ aboutSplitCustomSkillsLabel })
                    }
                  />
                  <InfoTextField
                    label={t('Strengths')}
                    value={info.aboutSplitCustomStrengthsLabel ?? ''}
                    placeholder={t('Strengths')}
                    onChange={(aboutSplitCustomStrengthsLabel) =>
                      onChange({ aboutSplitCustomStrengthsLabel })
                    }
                  />
                  <InfoTextField
                    label={t('Languages')}
                    value={info.aboutSplitCustomLanguagesLabel ?? ''}
                    placeholder={t('Languages')}
                    onChange={(aboutSplitCustomLanguagesLabel) =>
                      onChange({ aboutSplitCustomLanguagesLabel })
                    }
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-platform' ? (
            <div className="np-stack">
              <label className="np-field block">
                <span className="np-field-label">{t('Main title (left)')}</span>
                <textarea
                  value={info.aboutPlatformHeadlineCustomText ?? ''}
                  placeholder={DEFAULT_ABOUT_PLATFORM_HEADLINE}
                  onChange={(event) =>
                    onChange({ aboutPlatformHeadlineCustomText: event.target.value })
                  }
                  rows={3}
                  className="np-input min-h-24 resize-y"
                />
              </label>
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-manifesto' ? (
            <div className="np-stack">
              <label className="np-field block">
                <span className="np-field-label">{t('Statement text')}</span>
                <textarea
                  value={info.subtitle}
                  placeholder={DEFAULT_INFO_SUBTITLE}
                  onChange={(event) => onChange({ subtitle: event.target.value })}
                  rows={3}
                  className="np-input min-h-24 resize-y"
                />
              </label>

              <InfoToggleRow
                label={t('Customize statement typography')}
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
                label={t('Scroll focus')}
                checked={info.aboutManifestoBlocksScrollFocus === true}
                onChange={(aboutManifestoBlocksScrollFocus) =>
                  onChange({ aboutManifestoBlocksScrollFocus })
                }
              />

              <InfoOptionGrid
                label={t('Portrait frame')}
                value={info.aboutManifestoPortraitFrame ?? 'square'}
                options={PORTFOLIO_INFO_ABOUT_MANIFESTO_PORTRAIT_FRAME_OPTIONS}
                onChange={(aboutManifestoPortraitFrame) => onChange({ aboutManifestoPortraitFrame })}
              />
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-terminal' ? (
            <InfoToggleRow
              label={t('Always dark')}
              info="Keeps the terminal window dark even when the global theme switches to light."
              checked={info.aboutTerminalAlwaysDark === true}
              onChange={(aboutTerminalAlwaysDark) => onChange({ aboutTerminalAlwaysDark })}
            />
          ) : null}

          {(info.design ?? 'about-me') === 'about-value-steps' ? (
            <div className="np-stack">
              <InfoToggleRow
                label={t('Show intro')}
                checked={info.aboutValueStepsIntroEnabled !== false}
                onChange={(aboutValueStepsIntroEnabled) =>
                  onChange({ aboutValueStepsIntroEnabled })
                }
              />
              <label className="np-field block">
                <span className="np-field-label">{t('Intro text')}</span>
                <textarea
                  value={[info.aboutValueStepsIntroParagraph1, info.aboutValueStepsIntroParagraph2]
                    .filter(Boolean)
                    .join('\n\n')}
                  placeholder={t('Intro text — paragraph 1.\n\nIntro text — paragraph 2.')}
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
                  className="np-input min-h-36 resize-y leading-relaxed"
                />
              </label>
            </div>
          ) : null}

            {(info.design ?? 'about-me') === 'about-me-trait' ? (
              <div className="np-stack">
                <InfoToggleRow
                  label={t('Show large headline')}
                  checked={info.aboutMeTraitHeadlineEnabled !== false}
                  onChange={(aboutMeTraitHeadlineEnabled) =>
                    onChange({ aboutMeTraitHeadlineEnabled })
                  }
                />
                <label className="np-field block">
                  <span className="np-field-label">{t('Headline text')}</span>
                  <textarea
                    value={info.aboutMeTraitHeadlineCustomText ?? ''}
                    placeholder={t('Turning Hard\nProblems Into\nSimple Software')}
                    onChange={(event) =>
                      onChange({ aboutMeTraitHeadlineCustomText: event.target.value })
                    }
                    rows={4}
                    className="np-input min-h-28 resize-y leading-relaxed"
                  />
                </label>
              </div>
            ) : null}

            {(info.design ?? 'about-me') === 'about-me-trait' && info.showEducation !== false ? (
              <div className="np-stack">
                <InfoOptionGrid
                  label={t('Education design')}
                  value={info.educationDisplayStyle ?? 'editorial'}
                  options={PORTFOLIO_INFO_EDUCATION_DISPLAY_OPTIONS}
                  onChange={(educationDisplayStyle) => onChange({ educationDisplayStyle })}
                />
                {(info.educationDisplayStyle ?? 'editorial') === 'cascade' ? (
                  <InfoToggleRow
                    label={t('Cascade scroll animation')}
                    checked={info.educationCascadeScrollShift === true}
                    onChange={(educationCascadeScrollShift) =>
                      onChange({ educationCascadeScrollShift })
                    }
                  />
                ) : null}
              </div>
            ) : null}
</InfoLayoutSettingsBand>
          )}
        </div>
        )
      ) : null}

      {subSection === 'header' && info.enabled ? (
        headerCatalogOpen ? (
          <InfoHeaderDesignChoiceGrid
            value={info.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
            open
            onOpenChange={setHeaderCatalogOpen}
          />
        ) : (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Header design')}>
            <InfoHeaderDesignChoiceGrid
              value={info.headerDesign ?? 'editorial'}
              onChange={(headerDesign) => onChange({ headerDesign })}
              open={false}
              onOpenChange={setHeaderCatalogOpen}
            />
          </NpCollapsibleSection>
            <InfoLayoutSettingsBand motionKey={info.headerDesign ?? 'editorial'} title={t('Header settings')}>
              <InfoHeaderDesignFields info={info} onChange={onChange} />
            </InfoLayoutSettingsBand>
        </div>
        )
      ) : null}

      {subSection === 'background' && info.enabled ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Background')}>
          <SectionBackgroundSettingsFields
            settings={info}
            onChange={(patch) => onChange(patch)}
            title={t('Info section background')}
            renderColorField={({ label, value, onChange: onColorChange }) => (
              <InfoPaletteSwatchPicker
                label={label}
                palette={heroPalette ?? DEFAULT_HERO_PALETTE}
                value={value}
                onChange={onColorChange}
              />
            )}
          />
          </NpCollapsibleSection>
        </div>
      ) : null}
    </NpPanelShell>
  );
}
