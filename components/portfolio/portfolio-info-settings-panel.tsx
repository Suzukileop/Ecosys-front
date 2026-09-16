'use client';

import { useState, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import {
  infoDesignSettingsPatch,
  portfolioInfoDesignHasPortrait,
  resolveInfoPortraitGrayscale,
  DEFAULT_ABOUT_BANNER_HEADLINE,
  DEFAULT_ABOUT_PLATFORM_HEADLINE,
  PORTFOLIO_INFO_ABOUT_MANIFESTO_BLOCKS_LAYOUT_OPTIONS,
  PORTFOLIO_INFO_ABOUT_MANIFESTO_PORTRAIT_FRAME_OPTIONS,
  PORTFOLIO_INFO_ABOUT_SPLIT_PORTRAIT_SIDE_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_STEPS_VALUES_LAYOUT_OPTIONS,
  PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS,
  PORTFOLIO_INFO_CONTENT_SIZE_OPTIONS,
  PORTFOLIO_INFO_DESIGN_OPTIONS,
  PORTFOLIO_INFO_EDUCATION_DISPLAY_OPTIONS,
  type PortfolioInfoDesign,
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

/** Same general / design / background pill-switcher mechanism as the Stack section settings panel. */
export type InfoSubSection = 'general' | 'design' | 'background';

const INFO_SUB_SECTIONS: { id: InfoSubSection; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'design', label: 'Design' },
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
      className="pf-stack-design-card rounded-2xl px-3 pb-3 pt-2.5 text-left"
    >
      {children}
      <span className="mt-2.5 block">
        <span className="pf-stack-card-label min-w-0 text-sm font-semibold leading-none tracking-tight">
          {label}
        </span>
      </span>
    </button>
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

function InfoToggleRow({
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
        <span className="min-w-0 text-sm font-medium text-neutral-950">{label}</span>
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
          <rect className="pf-stack-mini-ink" x="14" y="14" width="92" height="9" rx="2" />
          <rect className="pf-stack-mini-ink" x="26" y="27" width="68" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="48" width="18" height="18" rx="9" />
          <rect className="pf-stack-mini-mute" x="66" y="52" width="46" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="66" y="58" width="34" height="2" rx="1" />
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

function InfoDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioInfoDesign;
  onChange: (value: PortfolioInfoDesign) => void;
}) {
  return (
    <div>
      <p className="pf-stack-block-label">Design Info</p>
      <div className="grid grid-cols-2 gap-2">
        {PORTFOLIO_INFO_DESIGN_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <InfoPickerCard
              key={option.value}
              active={active}
              label={option.label}
              onClick={() => onChange(option.value)}
            >
              <InfoDesignWireframe design={option.value} />
            </InfoPickerCard>
          );
        })}
      </div>
    </div>
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
            label="Element size"
            value={info.contentSize ?? info.aboutManifestoContentSize ?? info.aboutMeTraitContentSize ?? 'md'}
            options={PORTFOLIO_INFO_CONTENT_SIZE_OPTIONS}
            onChange={(contentSize) => onChange({ contentSize })}
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
                {(info.design ?? 'about-me') !== 'about-portrait-skills' ? (
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
                ) : null}
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
          <InfoToggleRow
            label="Language flags"
            checked={info.showLanguageFlags !== false}
            onChange={(showLanguageFlags) => onChange({ showLanguageFlags })}
          />

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
              <InfoToggleRow
                label="Zigzag stagger (right)"
                checked={info.aboutPlatformStaggerLayout !== false}
                onChange={(aboutPlatformStaggerLayout) => onChange({ aboutPlatformStaggerLayout })}
              />
            </div>
          ) : null}

          {(info.design ?? 'about-me') === 'about-manifesto' ? (
            <div className="space-y-4">
              <InfoOptionGrid
                label="Block layout"
                value={info.aboutManifestoBlocksLayout ?? 'grid'}
                options={PORTFOLIO_INFO_ABOUT_MANIFESTO_BLOCKS_LAYOUT_OPTIONS}
                onChange={(aboutManifestoBlocksLayout) => onChange({ aboutManifestoBlocksLayout })}
              />

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

            {(info.design ?? 'about-me') === 'about-banner' ? (
              <div className="space-y-3">
                <InfoToggleRow
                  label="Show large headline"
                  checked={info.aboutBannerHeadlineEnabled !== false}
                  onChange={(aboutBannerHeadlineEnabled) =>
                    onChange({ aboutBannerHeadlineEnabled })
                  }
                />
                <textarea
                  value={info.aboutBannerHeadlineCustomText ?? ''}
                  placeholder={DEFAULT_ABOUT_BANNER_HEADLINE}
                  onChange={(event) =>
                    onChange({ aboutBannerHeadlineCustomText: event.target.value })
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
