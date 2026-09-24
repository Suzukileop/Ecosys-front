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
  DEFAULT_TEAM_COLOR_BINDINGS,
  DEFAULT_TEAM_PALETTE,
  mergeTeamColorBindings,
  mergeTeamPalette,
  patchTeamColorBinding,
  type TeamColorSlot,
} from '@/components/portfolio/portfolio-team-palette-settings';
import {
  PORTFOLIO_TEAM_LAYOUT_OPTIONS,
  PORTFOLIO_TEAM_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_TEAM_TITLE_PRESET_OPTIONS,
  type PortfolioTeamLayout,
  type PortfolioTeamSectionSettings,
} from '@/components/portfolio/portfolio-team-settings';
import {
  PORTFOLIO_TEAM_HEADER_DESIGN_OPTIONS,
  TEAM_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  TEAM_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  TEAM_HEADER_PALETTE_TOKEN_OPTIONS,
  teamHeaderPaletteTokenColor,
  type PortfolioTeamHeaderDesign,
  type PortfolioTeamHeaderPaletteToken,
  type PortfolioTeamHeaderTitleSize,
  type PortfolioTeamHeaderTitleWeight,
} from '@/components/portfolio/portfolio-team-header-settings';

/* ---------------------------------------------------------------------- */
/* Sub-sections — the same four tabs, in the same order, with the same     */
/* labels as the Footer panel (this repo's reference implementation of the */
/* "Settings design standard"), matching the Gallery panel's own rebuild.  */
/* ---------------------------------------------------------------------- */

export type TeamSubSection = 'general' | 'design' | 'background' | 'header';

const TEAM_SUB_SECTIONS: { id: TeamSubSection; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'design', label: 'Design' },
  { id: 'background', label: 'Background' },
  { id: 'header', label: 'Header' },
];

/** Maps legacy subsection ids (saved UI state / search) onto the current Team menu. */
export function normalizeTeamSubSection(value: string | undefined): TeamSubSection {
  if (value === 'general' || value === 'design' || value === 'background' || value === 'header') {
    return value;
  }
  // Older ids from when Team had Cards/Images/Socials/Palette subsections.
  if (value === 'layout' || value === 'cards' || value === 'images' || value === 'socials') return 'design';
  if (value === 'palette') return 'background';
  return 'general';
}

type TeamPatch = (patch: Partial<PortfolioTeamSectionSettings>) => void;

function asTeamPatch(patch: Record<string, unknown> | object): Partial<PortfolioTeamSectionSettings> {
  return patch as Partial<PortfolioTeamSectionSettings>;
}

/* ---------------------------------------------------------------------- */
/* Shared settings chrome — the Footer panel's controls, Team-scoped.      */
/* ---------------------------------------------------------------------- */

const TEAM_INPUT_CLASS =
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400';

function TeamSectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{children}</p>;
}

function TeamGroupLabel({ children }: { children: string }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{children}</p>;
}

/** Same animated switch as the Footer/Gallery/Contact panels — shared settings-UI chrome. */
function TeamSwitchTrack({ checked }: { checked: boolean }) {
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

function TeamToggleRow({
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
        <TeamSwitchTrack checked={checked} />
      </span>
    </button>
  );
}

/** One-per-line visibility row (hairline divider), same pattern as the Footer's General tab. */
function TeamVisibilityRow({
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
        <TeamSwitchTrack checked={checked} />
      </button>
    </div>
  );
}

function TeamOptionGrid<T extends string>({
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
      {hideLabel ? null : <TeamGroupLabel>{label}</TeamGroupLabel>}
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

const TEAM_SIZE_PILL_OPTIONS: { value: PortfolioTeamHeaderTitleSize; label: string; fontPx: number }[] = [
  { value: 'sm', label: 'S', fontPx: 12 },
  { value: 'md', label: 'M', fontPx: 15 },
  { value: 'lg', label: 'L', fontPx: 18 },
  { value: 'xl', label: 'XL', fontPx: 22 },
];

function TeamSizePill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioTeamHeaderTitleSize;
  onChange: (value: PortfolioTeamHeaderTitleSize) => void;
}) {
  return (
    <div>
      <TeamGroupLabel>{label}</TeamGroupLabel>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-4 gap-1.5">
        {TEAM_SIZE_PILL_OPTIONS.map((option) => {
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

function TeamPaletteSwatches({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioTeamHeaderPaletteToken;
  onChange: (value: PortfolioTeamHeaderPaletteToken) => void;
}) {
  return (
    <div>
      <TeamGroupLabel>{label}</TeamGroupLabel>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-3 gap-1.5">
        {TEAM_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => {
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
                style={{ backgroundColor: teamHeaderPaletteTokenColor(option.value) }}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TeamTextField({
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
      <TeamSectionLabel>{label}</TeamSectionLabel>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={2}
          aria-label={label}
          className={`mt-2 ${TEAM_INPUT_CLASS} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`mt-2 ${TEAM_INPUT_CLASS}`}
        />
      )}
    </div>
  );
}

function TeamManualColorField({
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
      <TeamSectionLabel>{label}</TeamSectionLabel>
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

/** Palette-bound color field — a dropdown of theme tokens while the site palette drives the
 *  Team section, a manual hex picker when it doesn't. Same mechanism as the Footer's. */
function TeamColorField({
  team,
  onChange,
  slot,
  label,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
  slot: TeamColorSlot;
  label: string;
}) {
  const palette = mergeTeamPalette(DEFAULT_TEAM_PALETTE, team.teamPalette);
  const bindings = mergeTeamColorBindings(DEFAULT_TEAM_COLOR_BINDINGS, team.teamColorBindings);
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <TeamSectionLabel>{label}</TeamSectionLabel>
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
          onChange(asTeamPatch(patchTeamColorBinding(team, slot, event.target.value as HeroPaletteTokenId)))
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
 *  standard, text-reduction rule). See `.pf-team-design-card` in globals.css. */
function TeamPickerCard({
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
      className="pf-team-design-card relative rounded-2xl p-2.5 text-left"
    >
      {children}
      <span className="pf-team-card-label mt-2 block text-sm font-semibold leading-none tracking-tight">
        {label}
      </span>
    </button>
  );
}

/** Collapsed-state row: a compact thumbnail, the selected design's name, a trailing chevron. */
function TeamDesignSummaryRow({
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
      <TeamSectionLabel>{label}</TeamSectionLabel>
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

function TeamMiniStage({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

/** One abstract mini-wireframe per team layout — every option gets one, no exceptions
 *  (the thumbnail convention the Footer/Gallery/Work pickers already follow). */
function TeamLayoutWireframe({ layout }: { layout: PortfolioTeamLayout }) {
  switch (layout) {
    case 'portrait-rail':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="10" width="30" height="46" rx="3" opacity={0.75} />
          <rect className="pf-stack-mini-ink" x="44" y="10" width="30" height="46" rx="3" opacity={0.55} />
          <rect className="pf-stack-mini-ink" x="80" y="10" width="30" height="46" rx="3" opacity={0.35} />
          <rect className="pf-stack-mini-mute" x="8" y="62" width="40" height="2.5" rx="1.25" />
        </TeamMiniStage>
      );
    case 'spotlight':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="10" width="46" height="52" rx="3" opacity={0.75} />
          <rect className="pf-stack-mini-ink" x="62" y="14" width="38" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="62" y="26" width="28" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="62" y="44" width="16" height="18" rx="2.5" opacity={0.45} />
          <rect className="pf-stack-mini-ink" x="82" y="44" width="16" height="18" rx="2.5" opacity={0.3} />
          <rect className="pf-stack-mini-ink" x="102" y="44" width="10" height="18" rx="2.5" opacity={0.2} />
        </TeamMiniStage>
      );
    case 'directory':
      return (
        <TeamMiniStage>
          <circle className="pf-stack-mini-ink" cx="17" cy="19" r="7" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="30" y="16" width="44" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="94" y="17" width="18" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-mute" x="8" y="30" width="104" height="1" opacity={0.5} />
          <circle className="pf-stack-mini-ink" cx="17" cy="42" r="7" opacity={0.55} />
          <rect className="pf-stack-mini-mute" x="30" y="39" width="44" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="94" y="40" width="18" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-mute" x="8" y="53" width="104" height="1" opacity={0.5} />
          <circle className="pf-stack-mini-ink" cx="17" cy="63" r="6" opacity={0.4} />
          <rect className="pf-stack-mini-mute" x="30" y="61" width="44" height="3" rx="1.5" />
        </TeamMiniStage>
      );
    case 'polaroid':
      return (
        <TeamMiniStage>
          <g transform="rotate(-5 30 34)">
            <rect className="pf-stack-mini-ink" x="12" y="14" width="34" height="42" rx="2" opacity={0.7} />
            <rect className="pf-stack-mini-mute" x="16" y="48" width="20" height="3" rx="1.5" />
          </g>
          <g transform="rotate(4 84 34)">
            <rect className="pf-stack-mini-ink" x="66" y="14" width="34" height="42" rx="2" opacity={0.5} />
            <rect className="pf-stack-mini-mute" x="70" y="48" width="20" height="3" rx="1.5" />
          </g>
        </TeamMiniStage>
      );
    case 'profile-cards':
    case 'meet-cards':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-ink" x="10" y="10" width="46" height="30" rx="3" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="22" y="46" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="26" y="54" width="14" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="64" y="10" width="46" height="30" rx="3" opacity={0.45} />
          <rect className="pf-stack-mini-mute" x="76" y="46" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="80" y="54" width="14" height="2.5" rx="1.25" />
        </TeamMiniStage>
      );
    case 'hover-cards':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-ink" x="10" y="10" width="46" height="52" rx="3" opacity={0.7} />
          <rect className="pf-stack-mini-ink" x="64" y="10" width="46" height="52" rx="3" opacity={0.45} />
        </TeamMiniStage>
      );
    case 'cover-cards':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-ink" x="10" y="10" width="46" height="52" rx="3" opacity={0.7} />
          <rect className="pf-stack-mini-ink" x="10" y="42" width="46" height="20" rx="0" opacity={0.95} />
          <rect className="pf-stack-mini-mute" x="16" y="48" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="16" y="55" width="14" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="64" y="10" width="46" height="52" rx="3" opacity={0.45} />
        </TeamMiniStage>
      );
    case 'avatar-cards':
      return (
        <TeamMiniStage>
          <circle className="pf-stack-mini-ink" cx="33" cy="26" r="13" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="22" y="46" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="26" y="54" width="14" height="2.5" rx="1.25" />
          <circle className="pf-stack-mini-ink" cx="87" cy="26" r="13" opacity={0.45} />
          <rect className="pf-stack-mini-mute" x="76" y="46" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="80" y="54" width="14" height="2.5" rx="1.25" />
        </TeamMiniStage>
      );
    case 'float-cards':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-ink" x="10" y="24" width="46" height="38" rx="4" opacity={0.35} />
          <circle className="pf-stack-mini-ink" cx="33" cy="24" r="11" opacity={0.8} />
          <rect className="pf-stack-mini-mute" x="22" y="42" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="26" y="50" width="14" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="64" y="24" width="46" height="38" rx="4" opacity={0.22} />
          <circle className="pf-stack-mini-ink" cx="87" cy="24" r="11" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="76" y="42" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="80" y="50" width="14" height="2.5" rx="1.25" />
        </TeamMiniStage>
      );
    default: {
      const exhaustive: never = layout;
      return exhaustive;
    }
  }
}

function TeamLayoutChoiceGrid({
  value,
  onChange,
  showGrid,
  setShowGrid,
}: {
  value: PortfolioTeamLayout;
  onChange: (value: PortfolioTeamLayout) => void;
  /** Owned by the panel so anything below the picker hides while the catalogue is open. */
  showGrid: boolean;
  setShowGrid: (open: boolean) => void;
}) {
  const selected =
    PORTFOLIO_TEAM_LAYOUT_OPTIONS.find((option) => option.value === value) ?? PORTFOLIO_TEAM_LAYOUT_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <TeamSectionLabel>Section design</TeamSectionLabel>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_TEAM_LAYOUT_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === value}
              label={option.label}
              onClick={() => {
                onChange(option.value);
                setShowGrid(false);
              }}
            >
              <TeamLayoutWireframe layout={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TeamDesignSummaryRow label="Design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <TeamLayoutWireframe layout={value} />
    </TeamDesignSummaryRow>
  );
}

/** One wireframe per Header design — the shared 8-design GSAP header mounted above the
 *  Team section, independent of the section's own member `layout`. */
function TeamHeaderWireframe({ design }: { design: PortfolioTeamHeaderDesign }) {
  switch (design) {
    case 'editorial':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-accent" x="8" y="14" width="18" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="24" width="86" height="12" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="44" width="50" height="3" rx="1.5" />
        </TeamMiniStage>
      );
    case 'marquee':
      return (
        <TeamMiniStage>
          <text
            x="60"
            y="42"
            fontSize={22}
            fontWeight={800}
            textAnchor="middle"
            opacity={0.14}
            className="pf-stack-mini-ink"
          >
            TEAM
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="84" height="11" rx="2" />
        </TeamMiniStage>
      );
    case 'index':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-mute" x="8" y="14" width="104" height="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="22" height="18" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="40" y="26" width="1.5" height="18" />
          <rect className="pf-stack-mini-ink" x="50" y="28" width="60" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="50" y="40" width="36" height="2.5" rx="1.25" />
        </TeamMiniStage>
      );
    case 'accent-count':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-accent" x="8" y="14" width="30" height="9" rx="4.5" />
          <rect className="pf-stack-mini-mute" x="8" y="30" width="46" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="39" width="70" height="9" rx="2" />
        </TeamMiniStage>
      );
    case 'serif-lead':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-mute" x="8" y="14" width="24" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="100" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="70" height="10" rx="2" opacity={0.5} />
        </TeamMiniStage>
      );
    case 'billboard':
      return (
        <TeamMiniStage>
          <text
            x="60"
            y="38"
            fontSize={25}
            fontWeight={900}
            textAnchor="middle"
            opacity={0.1}
            className="pf-stack-mini-ink"
          >
            TEAM
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="60" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="18" y="44" width="40" height="3" rx="1.5" />
        </TeamMiniStage>
      );
    case 'masthead':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="12" width="90" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="70" height="10" rx="2" opacity={0.6} />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="80" height="10" rx="2" opacity={0.3} />
        </TeamMiniStage>
      );
    case 'split-heading':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="26" width="58" height="11" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="41" width="36" height="11" rx="2" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="86" y="16" width="26" height="3" rx="1.5" />
        </TeamMiniStage>
      );
    default: {
      const exhaustive: never = design;
      return exhaustive;
    }
  }
}

function TeamHeaderDesignGrid({
  value,
  onChange,
}: {
  value: PortfolioTeamHeaderDesign;
  onChange: (value: PortfolioTeamHeaderDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_TEAM_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_TEAM_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <TeamSectionLabel>Header design</TeamSectionLabel>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_TEAM_HEADER_DESIGN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === value}
              label={option.label}
              onClick={() => {
                onChange(option.value);
                setShowGrid(false);
              }}
            >
              <TeamHeaderWireframe design={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <TeamDesignSummaryRow label="Header design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <TeamHeaderWireframe design={value} />
    </TeamDesignSummaryRow>
  );
}

/** The Footer's settings band — one titled card under a design picker. */
function TeamSettingsBand({
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

function TeamBandGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <TeamGroupLabel>{title}</TeamGroupLabel>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Header tab — per-design fields, then the controls every design shares.  */
/* ---------------------------------------------------------------------- */

const TEAM_WEIGHT_OPTIONS: { value: PortfolioTeamHeaderTitleWeight; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'regular', label: 'Regular' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
];

const TEAM_HEADER_MARGIN_BOTTOM_OPTIONS = [
  { value: 'sm' as const, label: 'Small' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Large' },
  { value: 'xl' as const, label: 'XL' },
];

/** Bottom spacing and header motion — plus alignment and the shared title size/weight, but
 *  only where the chosen design actually reads them (dead controls left visible are
 *  confusing, so each branch passes `hideAlignment`/`hideTitleControls` to match). */
function TeamHeaderSharedControls({
  team,
  onChange,
  hideAlignment = false,
  hideTitleControls = false,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
  hideAlignment?: boolean;
  hideTitleControls?: boolean;
}) {
  return (
    <div className="space-y-5 border-t border-neutral-200/70 pt-6">
      {hideAlignment ? null : (
        <TeamOptionGrid
          label="Header alignment"
          options={[
            { value: 'left' as const, label: 'Left' },
            { value: 'center' as const, label: 'Center' },
            { value: 'right' as const, label: 'Right' },
          ]}
          value={team.headerDesignAlignment ?? 'left'}
          onChange={(headerDesignAlignment) => onChange({ headerDesignAlignment })}
          columns={3}
        />
      )}
      <TeamOptionGrid
        label="Bottom spacing"
        options={TEAM_HEADER_MARGIN_BOTTOM_OPTIONS}
        value={team.headerMarginBottom ?? 'md'}
        onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
        columns={4}
      />
      {hideTitleControls ? null : (
        <>
          <TeamSizePill
            label="Title size"
            value={team.headerTitleSize ?? 'md'}
            onChange={(headerTitleSize) => onChange({ headerTitleSize })}
          />
          <TeamOptionGrid
            label="Title weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerTitleWeight ?? 'regular'}
            onChange={(headerTitleWeight) => onChange({ headerTitleWeight })}
            columns={4}
          />
        </>
      )}
      <div className="space-y-1.5">
        <TeamToggleRow
          label="Header motion"
          checked={team.headerAnimationEnabled !== false}
          onChange={(headerAnimationEnabled) => onChange({ headerAnimationEnabled })}
        />
        <p className="text-xs text-neutral-400">Reduced-motion preferences are always respected.</p>
      </div>
    </div>
  );
}

function TeamHeaderDesignFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  const design = team.headerDesign ?? 'editorial';

  if (design === 'index') {
    return (
      <>
        <TeamTextField
          label="Rule label"
          value={team.headerIndexLabelText}
          placeholder="Index"
          onChange={(headerIndexLabelText) => onChange({ headerIndexLabelText })}
        />
        <TeamTextField
          label="Title"
          value={team.headerIndexTitleText}
          placeholder="Meet the team"
          onChange={(headerIndexTitleText) => onChange({ headerIndexTitleText })}
        />
        <TeamTextField
          label="Subtitle"
          value={team.headerIndexSubtitleText}
          placeholder="The people behind every project, in one place."
          onChange={(headerIndexSubtitleText) => onChange({ headerIndexSubtitleText })}
          multiline
        />
        <TeamTextField
          label="Count label"
          value={team.headerIndexCountLabelText}
          placeholder="Members"
          onChange={(headerIndexCountLabelText) => onChange({ headerIndexCountLabelText })}
        />
        <TeamBandGroup title="Label">
          <TeamPaletteSwatches
            label="Color"
            value={team.headerIndexLabelColor ?? 'texteFort'}
            onChange={(headerIndexLabelColor) => onChange({ headerIndexLabelColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerIndexLabelSize ?? 'md'}
            onChange={(headerIndexLabelSize) => onChange({ headerIndexLabelSize })}
          />
          <TeamOptionGrid
            label="Weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerIndexLabelWeight ?? 'regular'}
            onChange={(headerIndexLabelWeight) => onChange({ headerIndexLabelWeight })}
            columns={4}
          />
        </TeamBandGroup>
        <TeamBandGroup title="Title">
          <TeamPaletteSwatches
            label="Color"
            value={team.headerIndexTitleColor ?? 'texteFort'}
            onChange={(headerIndexTitleColor) => onChange({ headerIndexTitleColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerIndexTitleSize ?? 'md'}
            onChange={(headerIndexTitleSize) => onChange({ headerIndexTitleSize })}
          />
          <TeamOptionGrid
            label="Weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerIndexTitleWeight ?? 'regular'}
            onChange={(headerIndexTitleWeight) => onChange({ headerIndexTitleWeight })}
            columns={4}
          />
        </TeamBandGroup>
        <TeamBandGroup title="Subtitle">
          <TeamPaletteSwatches
            label="Color"
            value={team.headerIndexSubtitleColor ?? 'texteFort'}
            onChange={(headerIndexSubtitleColor) => onChange({ headerIndexSubtitleColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerIndexSubtitleSize ?? 'md'}
            onChange={(headerIndexSubtitleSize) => onChange({ headerIndexSubtitleSize })}
          />
          <TeamOptionGrid
            label="Weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerIndexSubtitleWeight ?? 'regular'}
            onChange={(headerIndexSubtitleWeight) => onChange({ headerIndexSubtitleWeight })}
            columns={4}
          />
        </TeamBandGroup>
        <TeamBandGroup title="Counter">
          <TeamPaletteSwatches
            label="Numeral color"
            value={team.headerIndexNumberColor ?? 'principal'}
            onChange={(headerIndexNumberColor) => onChange({ headerIndexNumberColor })}
          />
        </TeamBandGroup>
        <TeamHeaderSharedControls team={team} onChange={onChange} hideAlignment hideTitleControls />
      </>
    );
  }

  if (design === 'marquee') {
    return (
      <>
        <TeamBandGroup title="Words">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TeamTextField
              label="Word 1"
              value={team.headerMarqueeWord1Text}
              placeholder="Meet"
              onChange={(headerMarqueeWord1Text) => onChange({ headerMarqueeWord1Text })}
            />
            <TeamTextField
              label="Word 2"
              value={team.headerMarqueeWord2Text}
              placeholder="Team"
              onChange={(headerMarqueeWord2Text) => onChange({ headerMarqueeWord2Text })}
            />
            <TeamTextField
              label="Word 3"
              value={team.headerMarqueeWord3Text}
              placeholder="Optional"
              onChange={(headerMarqueeWord3Text) => onChange({ headerMarqueeWord3Text })}
            />
            <TeamTextField
              label="Word 4"
              value={team.headerMarqueeWord4Text}
              placeholder="Optional"
              onChange={(headerMarqueeWord4Text) => onChange({ headerMarqueeWord4Text })}
            />
          </div>
        </TeamBandGroup>
        <TeamBandGroup title="Style">
          <TeamPaletteSwatches
            label="Word color"
            value={team.headerMarqueeWordColor ?? 'principal'}
            onChange={(headerMarqueeWordColor) => onChange({ headerMarqueeWordColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerMarqueeSize ?? 'md'}
            onChange={(headerMarqueeSize) => onChange({ headerMarqueeSize })}
          />
        </TeamBandGroup>
        <TeamHeaderSharedControls team={team} onChange={onChange} hideAlignment hideTitleControls />
      </>
    );
  }

  if (design === 'accent-count') {
    return (
      <>
        <TeamTextField
          label="Badge text"
          value={team.headerAccentCountBadgeText}
          placeholder="{count}+ members"
          onChange={(headerAccentCountBadgeText) => onChange({ headerAccentCountBadgeText })}
        />
        <TeamTextField
          label="Lead text"
          value={team.headerAccentCountLeadText}
          placeholder="A small team of people who make it happen."
          onChange={(headerAccentCountLeadText) => onChange({ headerAccentCountLeadText })}
          multiline
        />
        <TeamBandGroup title="Style">
          <TeamPaletteSwatches
            label="Badge color"
            value={team.headerAccentCountBadgeColor ?? 'principal'}
            onChange={(headerAccentCountBadgeColor) => onChange({ headerAccentCountBadgeColor })}
          />
          <TeamPaletteSwatches
            label="Lead color"
            value={team.headerAccentCountLeadColor ?? 'secondaire'}
            onChange={(headerAccentCountLeadColor) => onChange({ headerAccentCountLeadColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerAccentCountSize ?? 'md'}
            onChange={(headerAccentCountSize) => onChange({ headerAccentCountSize })}
          />
          <TeamOptionGrid
            label="Lead weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerAccentCountWeight ?? 'regular'}
            onChange={(headerAccentCountWeight) => onChange({ headerAccentCountWeight })}
            columns={4}
          />
          <TeamOptionGrid
            label="Alignment"
            options={TEAM_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
            value={team.headerAccentCountAlignment ?? 'left'}
            onChange={(headerAccentCountAlignment) => onChange({ headerAccentCountAlignment })}
            columns={3}
          />
        </TeamBandGroup>
        <TeamHeaderSharedControls team={team} onChange={onChange} hideAlignment hideTitleControls />
      </>
    );
  }

  if (design === 'serif-lead') {
    return (
      <>
        <TeamTextField
          label="Label"
          value={team.headerSerifLeadLabelText}
          placeholder="Team"
          onChange={(headerSerifLeadLabelText) => onChange({ headerSerifLeadLabelText })}
        />
        <TeamTextField
          label="Title"
          value={team.headerSerifLeadTitleText}
          placeholder="A small group of people who make everything happen."
          onChange={(headerSerifLeadTitleText) => onChange({ headerSerifLeadTitleText })}
          multiline
        />
        <TeamBandGroup title="Label">
          <TeamPaletteSwatches
            label="Color"
            value={team.headerSerifLeadLabelColor ?? 'texteFort'}
            onChange={(headerSerifLeadLabelColor) => onChange({ headerSerifLeadLabelColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerSerifLeadLabelSize ?? 'md'}
            onChange={(headerSerifLeadLabelSize) => onChange({ headerSerifLeadLabelSize })}
          />
          <TeamOptionGrid
            label="Weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerSerifLeadLabelWeight ?? 'regular'}
            onChange={(headerSerifLeadLabelWeight) => onChange({ headerSerifLeadLabelWeight })}
            columns={4}
          />
        </TeamBandGroup>
        <TeamBandGroup title="Title">
          <TeamPaletteSwatches
            label="Color"
            value={team.headerSerifLeadTitleColor ?? 'texteFort'}
            onChange={(headerSerifLeadTitleColor) => onChange({ headerSerifLeadTitleColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerSerifLeadTitleSize ?? 'md'}
            onChange={(headerSerifLeadTitleSize) => onChange({ headerSerifLeadTitleSize })}
          />
          <TeamOptionGrid
            label="Weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerSerifLeadTitleWeight ?? 'regular'}
            onChange={(headerSerifLeadTitleWeight) => onChange({ headerSerifLeadTitleWeight })}
            columns={4}
          />
        </TeamBandGroup>
        <TeamBandGroup title="Subtitle">
          <TeamPaletteSwatches
            label="Color"
            value={team.headerSerifLeadSubtitleColor ?? 'texteFort'}
            onChange={(headerSerifLeadSubtitleColor) => onChange({ headerSerifLeadSubtitleColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerSerifLeadSubtitleSize ?? 'md'}
            onChange={(headerSerifLeadSubtitleSize) => onChange({ headerSerifLeadSubtitleSize })}
          />
          <TeamOptionGrid
            label="Weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerSerifLeadSubtitleWeight ?? 'regular'}
            onChange={(headerSerifLeadSubtitleWeight) => onChange({ headerSerifLeadSubtitleWeight })}
            columns={4}
          />
        </TeamBandGroup>
        <TeamHeaderSharedControls team={team} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'billboard') {
    return (
      <>
        <TeamTextField
          label="Big background word"
          value={team.headerBillboardBigWord}
          placeholder="TEAM"
          onChange={(headerBillboardBigWord) => onChange({ headerBillboardBigWord })}
        />
        <TeamTextField
          label="Title"
          value={team.headerBillboardTitleText}
          placeholder="Meet the team"
          onChange={(headerBillboardTitleText) => onChange({ headerBillboardTitleText })}
        />
        <TeamTextField
          label="Count line"
          value={team.headerBillboardCountText}
          placeholder="{count} people — meet the team below"
          onChange={(headerBillboardCountText) => onChange({ headerBillboardCountText })}
        />
        <TeamBandGroup title="Style">
          <TeamOptionGrid
            label="Big word style"
            options={TEAM_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
            value={team.headerBillboardWordStyle ?? 'outline'}
            onChange={(headerBillboardWordStyle) => onChange({ headerBillboardWordStyle })}
            columns={3}
          />
          <TeamPaletteSwatches
            label="Big word color"
            value={team.headerBillboardWordColor ?? 'principal'}
            onChange={(headerBillboardWordColor) => onChange({ headerBillboardWordColor })}
          />
          <TeamPaletteSwatches
            label="Title color"
            value={team.headerBillboardTitleColor ?? 'principal'}
            onChange={(headerBillboardTitleColor) => onChange({ headerBillboardTitleColor })}
          />
          <TeamPaletteSwatches
            label="Count line color"
            value={team.headerBillboardMetaColor ?? 'secondaire'}
            onChange={(headerBillboardMetaColor) => onChange({ headerBillboardMetaColor })}
          />
        </TeamBandGroup>
        <TeamHeaderSharedControls team={team} onChange={onChange} hideAlignment hideTitleControls />
      </>
    );
  }

  if (design === 'masthead') {
    return (
      <>
        <TeamTextField
          label="Line 1"
          value={team.headerMastheadLine1Text}
          placeholder="Real people."
          onChange={(headerMastheadLine1Text) => onChange({ headerMastheadLine1Text })}
        />
        <TeamTextField
          label="Line 2"
          value={team.headerMastheadLine2Text}
          placeholder="Chosen with care."
          onChange={(headerMastheadLine2Text) => onChange({ headerMastheadLine2Text })}
        />
        <TeamTextField
          label="Line 3"
          value={team.headerMastheadLine3Text}
          placeholder="Built to deliver."
          onChange={(headerMastheadLine3Text) => onChange({ headerMastheadLine3Text })}
        />
        <TeamBandGroup title="Headline">
          <TeamPaletteSwatches
            label="Color"
            value={team.headerMastheadHeadlineColor ?? 'principal'}
            onChange={(headerMastheadHeadlineColor) => onChange({ headerMastheadHeadlineColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerMastheadHeadlineSize ?? 'md'}
            onChange={(headerMastheadHeadlineSize) => onChange({ headerMastheadHeadlineSize })}
          />
          <TeamOptionGrid
            label="Weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerMastheadHeadlineWeight ?? 'regular'}
            onChange={(headerMastheadHeadlineWeight) => onChange({ headerMastheadHeadlineWeight })}
            columns={4}
          />
        </TeamBandGroup>
        <TeamHeaderSharedControls team={team} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'split-heading') {
    return (
      <>
        <TeamTextField
          label="Title"
          value={team.headerSplitHeadingTitleText}
          placeholder="Meet the team"
          onChange={(headerSplitHeadingTitleText) => onChange({ headerSplitHeadingTitleText })}
        />
        <TeamTextField
          label="Label"
          value={team.headerSplitHeadingLabelText}
          placeholder="Team"
          onChange={(headerSplitHeadingLabelText) => onChange({ headerSplitHeadingLabelText })}
        />
        <TeamBandGroup title="Title">
          <TeamPaletteSwatches
            label="Color"
            value={team.headerSplitHeadingTitleColor ?? 'principal'}
            onChange={(headerSplitHeadingTitleColor) => onChange({ headerSplitHeadingTitleColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerSplitHeadingTitleSize ?? 'md'}
            onChange={(headerSplitHeadingTitleSize) => onChange({ headerSplitHeadingTitleSize })}
          />
          <TeamOptionGrid
            label="Weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerSplitHeadingTitleWeight ?? 'regular'}
            onChange={(headerSplitHeadingTitleWeight) => onChange({ headerSplitHeadingTitleWeight })}
            columns={4}
          />
        </TeamBandGroup>
        <TeamBandGroup title="Label">
          <TeamPaletteSwatches
            label="Color"
            value={team.headerSplitHeadingLabelColor ?? 'secondaire'}
            onChange={(headerSplitHeadingLabelColor) => onChange({ headerSplitHeadingLabelColor })}
          />
          <TeamSizePill
            label="Size"
            value={team.headerSplitHeadingLabelSize ?? 'md'}
            onChange={(headerSplitHeadingLabelSize) => onChange({ headerSplitHeadingLabelSize })}
          />
          <TeamOptionGrid
            label="Weight"
            options={TEAM_WEIGHT_OPTIONS}
            value={team.headerSplitHeadingLabelWeight ?? 'regular'}
            onChange={(headerSplitHeadingLabelWeight) => onChange({ headerSplitHeadingLabelWeight })}
            columns={4}
          />
        </TeamBandGroup>
        <TeamHeaderSharedControls team={team} onChange={onChange} hideAlignment hideTitleControls />
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
      <TeamHeaderSharedControls team={team} onChange={onChange} />
    </>
  );
}

/* ---------------------------------------------------------------------- */

/** Background fill labels → the Team palette slot each one writes through. */
const TEAM_BACKGROUND_LABEL_SLOTS: Record<string, TeamColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Color A': 'sectionSplitA',
  'Color B': 'sectionSplitB',
};

export function TeamSettingsPanel({
  team,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
  subSection?: TeamSubSection;
  onSubSectionChange?: (value: TeamSubSection) => void;
}) {
  const [designCatalogOpen, setDesignCatalogOpen] = useState(false);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<TeamSubSection>('general');
  const subSection = normalizeTeamSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: TeamSubSection) => {
    const next = normalizeTeamSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TEAM_SUB_SECTIONS.map((section) => (
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
            <TeamSectionLabel>Visibility</TeamSectionLabel>
            <div className="mt-4">
              <TeamVisibilityRow
                label="Show Team section"
                checked={team.enabled !== false}
                onChange={(enabled) => onChange({ enabled })}
              />
              <TeamVisibilityRow
                label="Member photo"
                checked={team.showImage}
                onChange={(showImage) => onChange({ showImage })}
              />
              <TeamVisibilityRow
                label="Member name"
                checked={team.showName}
                onChange={(showName) => onChange({ showName })}
              />
              <TeamVisibilityRow
                label="Role"
                checked={team.showResponsibility}
                onChange={(showResponsibility) => onChange({ showResponsibility })}
              />
              <TeamVisibilityRow
                label="Social links"
                checked={team.showSocials}
                onChange={(showSocials) => onChange({ showSocials })}
              />
            </div>
          </div>

          <SectionColorModeControl
            value={team.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-6">
          <TeamLayoutChoiceGrid
            showGrid={designCatalogOpen}
            setShowGrid={setDesignCatalogOpen}
            value={team.layout}
            onChange={(layout) => onChange({ layout })}
          />
          {designCatalogOpen ? null : (
            <p className="text-xs text-neutral-400">
              Each design renders straight from your members — what shows on a card is set in General → Visibility.
            </p>
          )}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-4">
          <SectionBackgroundSettingsFields
            settings={team}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onColorChange }) => {
              const slot = TEAM_BACKGROUND_LABEL_SLOTS[label];
              // Every background fill color has a Team palette slot; anything else (and the
              // palette turned off) falls back to a manual hex picker.
              if (!slot || team.useHeroPalette === false) {
                return <TeamManualColorField label={label} value={value} onChange={onColorChange} />;
              }
              return <TeamColorField team={team} onChange={onChange} slot={slot} label={label} />;
            }}
          />
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <TeamHeaderDesignGrid
            value={team.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
          />

          <TeamSettingsBand
            id="team-header-settings-title"
            title="Header settings"
            motionKey={team.headerDesign ?? 'editorial'}
          >
            <TeamBandGroup title="Section title">
              <TeamOptionGrid
                label="Title preset"
                hideLabel
                options={PORTFOLIO_TEAM_TITLE_PRESET_OPTIONS}
                value={team.titlePreset}
                onChange={(titlePreset) => onChange({ titlePreset })}
                columns={2}
              />
              {team.titlePreset === 'custom' ? (
                <input
                  type="text"
                  value={team.titleCustom}
                  placeholder="Our team"
                  aria-label="Custom section title"
                  onChange={(event) => onChange({ titleCustom: event.target.value })}
                  className={TEAM_INPUT_CLASS}
                />
              ) : null}
            </TeamBandGroup>

            <TeamBandGroup title="Subtitle">
              <TeamOptionGrid
                label="Subtitle preset"
                hideLabel
                options={PORTFOLIO_TEAM_SUBTITLE_PRESET_OPTIONS}
                value={team.subtitlePreset}
                onChange={(subtitlePreset) => onChange({ subtitlePreset })}
                columns={3}
              />
              {team.subtitlePreset === 'custom' ? (
                <textarea
                  value={team.subtitleCustom}
                  rows={2}
                  placeholder="The people behind every project."
                  aria-label="Custom subtitle"
                  onChange={(event) => onChange({ subtitleCustom: event.target.value })}
                  className={`${TEAM_INPUT_CLASS} resize-y`}
                />
              ) : null}
            </TeamBandGroup>

            <TeamHeaderDesignFields team={team} onChange={onChange} />
          </TeamSettingsBand>
        </div>
      ) : null}
    </div>
  );
}
