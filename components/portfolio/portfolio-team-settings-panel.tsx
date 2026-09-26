'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';
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
  PORTFOLIO_TEAM_AVATAR_COLUMN_GAP_OPTIONS,
  PORTFOLIO_TEAM_AVATAR_COLUMN_OPTIONS,
  PORTFOLIO_TEAM_AVATAR_GRID_WIDTH_OPTIONS,
  PORTFOLIO_TEAM_AVATAR_SHAPE_OPTIONS,
  PORTFOLIO_TEAM_AVATAR_VIEW_OPTIONS,
  PORTFOLIO_TEAM_LAYOUT_OPTIONS,
  PORTFOLIO_TEAM_POLAROID_PHOTO_TONE_OPTIONS,
  PORTFOLIO_TEAM_PROFILE_GUTTER_OPTIONS,
  PORTFOLIO_TEAM_PROFILE_PANEL_OPTIONS,
  PORTFOLIO_TEAM_PROFILE_RATIO_OPTIONS,
  PORTFOLIO_TEAM_FLOAT_ALIGN_OPTIONS,
  PORTFOLIO_TEAM_PROFILE_VIEW_OPTIONS,
  PORTFOLIO_TEAM_PROFILE_VISIBLE_OPTIONS,
  PORTFOLIO_TEAM_PREMIUM_FONT_SIZE_OPTIONS,
  PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS,
  PORTFOLIO_TEAM_IMAGE_HEIGHT_OPTIONS,
  PORTFOLIO_TEAM_CORNER_RADIUS_OPTIONS,
  PORTFOLIO_TEAM_DIRECTORY_PORTRAIT_OPTIONS,
  PORTFOLIO_TEAM_AVATAR_RADIUS_OPTIONS,
  TEAM_DIRECTORY_CARD_GAP,
  TEAM_FLOAT_COLUMN_GAP,
  teamDirectoryDefaultCardGap,
  teamFloatDefaultColumnGap,
  PORTFOLIO_TEAM_RAIL_NAVIGATION_OPTIONS,
  PORTFOLIO_TEAM_SPOTLIGHT_NAVIGATION_OPTIONS,
  PORTFOLIO_TEAM_SPOTLIGHT_SIDE_OPTIONS,
  PORTFOLIO_TEAM_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_TEAM_TITLE_PRESET_OPTIONS,
  type PortfolioTeamAvatarColumnGap,
  type PortfolioTeamAvatarColumns,
  type PortfolioTeamAvatarGridWidth,
  type PortfolioTeamAvatarShape,
  type PortfolioTeamAvatarView,
  type PortfolioTeamLayout,
  type PortfolioTeamPolaroidPhotoTone,
  type PortfolioTeamProfileGutter,
  type PortfolioTeamProfilePanel,
  type PortfolioTeamProfileRatio,
  type PortfolioTeamProfileView,
  type PortfolioTeamProfileVisible,
  type PortfolioTeamRailColumns,
  type PortfolioTeamImageHeight,
  type PortfolioTeamCornerRadius,
  type PortfolioTeamDirectoryPortrait,
  type PortfolioTeamFloatAlign,
  type PortfolioTeamAvatarRadius,
  type PortfolioTeamRailNavigation,
  type PortfolioTeamSectionSettings,
  type PortfolioTeamSpotlightNavigation,
  type PortfolioTeamSpotlightSide,
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
      {/* The app-wide segmented control (globals.css), not a local re-skin of it: one component
          everywhere is rule 4 of the settings design standard, and the hardcoded black/neutral
          pills this used to draw were the only ones in the panel that ignored the palette. */}
      <div
        role="radiogroup"
        aria-label={label}
        data-compact="true"
        className={`${hideLabel ? '' : 'mt-2'} pf-exp-segment grid gap-1 p-1`}
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
              data-active={active ? 'true' : 'false'}
              onClick={() => onChange(option.value)}
              className="pf-exp-segment-btn px-2.5 py-2 text-center text-[13px] font-semibold"
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
    case 'split-screen':
      return (
        <TeamMiniStage>
          <rect className="pf-stack-mini-ink" x="8" y="12" width="44" height="7" rx="2" opacity={0.9} />
          <rect className="pf-stack-mini-ink" x="8" y="23" width="36" height="7" rx="2" opacity={0.22} />
          <rect className="pf-stack-mini-ink" x="8" y="34" width="40" height="7" rx="2" opacity={0.22} />
          <rect className="pf-stack-mini-mute" x="8" y="52" width="30" height="1" opacity={0.6} />
          <rect className="pf-stack-mini-mute" x="8" y="58" width="20" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="66" y="8" width="46" height="56" rx="2" opacity={0.75} />
        </TeamMiniStage>
      );
    case 'editorial-rhythm':
      return (
        <TeamMiniStage>
          {/* Unequal plates on a broken baseline; the first one carries its own name. */}
          <rect className="pf-stack-mini-ink" x="8" y="8" width="42" height="52" rx="2" opacity={0.75} />
          <rect className="pf-stack-mini-mute" x="13" y="13" width="30" height="5" rx="1" opacity={0.95} />
          <rect className="pf-stack-mini-mute" x="13" y="21" width="20" height="5" rx="1" opacity={0.95} />
          <rect className="pf-stack-mini-mute" x="58" y="22" width="22" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="58" y="29" width="26" height="26" rx="2" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="90" y="10" width="18" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="90" y="17" width="22" height="32" rx="2" opacity={0.32} />
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
          <g transform="rotate(-7 20 36)">
            <rect className="pf-stack-mini-ink" x="6" y="16" width="28" height="34" rx="1.5" opacity={0.75} />
            <rect className="pf-stack-mini-mute" x="9" y="52" width="16" height="2.5" rx="1.25" />
          </g>
          <g transform="rotate(3 62 30)">
            <rect className="pf-stack-mini-ink" x="48" y="10" width="28" height="34" rx="1.5" opacity={0.6} />
            <rect className="pf-stack-mini-mute" x="51" y="46" width="16" height="2.5" rx="1.25" />
          </g>
          <g transform="rotate(-3 100 40)">
            <rect className="pf-stack-mini-ink" x="86" y="20" width="28" height="34" rx="1.5" opacity={0.4} />
            <rect className="pf-stack-mini-mute" x="89" y="56" width="16" height="2.5" rx="1.25" />
          </g>
        </TeamMiniStage>
      );
    // `meet-cards` and `hover-cards` are retired values that can still arrive from storage; they
    // never appear in the picker, and the merge remaps them, so any wireframe here will do.
    case 'profile-cards':
    case 'meet-cards':
    case 'hover-cards':
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
    case 'floating-canvas':
      return (
        <TeamMiniStage>
          {/* Three plates at three different heights, captions flipped above/below, a text-only
              slot standing in for a face in the middle — the irregular canvas at a glance. */}
          <rect className="pf-stack-mini-mute" x="8" y="8" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="15" width="22" height="24" rx="1.5" opacity={0.75} />
          <rect className="pf-stack-mini-ink" x="44" y="24" width="22" height="24" rx="1.5" opacity={0.4} />
          <rect className="pf-stack-mini-mute" x="44" y="50" width="18" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="80" y="14" width="26" height="2.5" rx="1.25" opacity={0.9} />
          <rect className="pf-stack-mini-mute" x="80" y="20" width="30" height="2.5" rx="1.25" opacity={0.6} />
          <rect className="pf-stack-mini-mute" x="80" y="26" width="20" height="2.5" rx="1.25" opacity={0.6} />
          <rect className="pf-stack-mini-ink" x="80" y="38" width="30" height="20" rx="1.5" opacity={0.3} />
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

/* ---------------------------------------------------------------------- */
/* Design tab → Layout settings — the selected design's own options, using  */
/* the shared `pf-exp-layout-settings` band the Contact/Experience panels   */
/* already use. Hidden while the design catalogue is open.                  */
/* ---------------------------------------------------------------------- */

/** Each navigation option drawn as what it actually does (mini-schema rule), never as plain text. */
function TeamRailNavigationWireframe({ value }: { value: PortfolioTeamRailNavigation }) {
  if (value === 'show-all') {
    return (
      <TeamMiniStage>
        {[0, 1, 2].map((column) =>
          [0, 1].map((row) => (
            <rect
              key={`${column}-${row}`}
              className="pf-stack-mini-ink"
              x={12 + column * 34}
              y={12 + row * 28}
              width={28}
              height={22}
              rx={3}
              opacity={0.85}
            />
          ))
        )}
      </TeamMiniStage>
    );
  }
  return (
    <TeamMiniStage>
      {/* The rail itself: three portraits, the last one running off the frame. */}
      <rect className="pf-stack-mini-ink" x={10} y={12} width={30} height={38} rx={4} />
      <rect className="pf-stack-mini-ink" x={46} y={12} width={30} height={38} rx={4} opacity={0.8} />
      <rect className="pf-stack-mini-ink" x={82} y={12} width={30} height={38} rx={4} opacity={0.45} />
      {value === 'chevrons' ? (
        <>
          <circle className="pf-stack-mini-mute" cx={76} cy={61} r={7} />
          <circle className="pf-stack-mini-accent" cx={96} cy={61} r={7} />
        </>
      ) : (
        <>
          <rect className="pf-stack-mini-mute" x={10} y={60} width={100} height={2} rx={1} />
          <rect className="pf-stack-mini-accent" x={10} y={59} width={34} height={4} rx={2} />
        </>
      )}
    </TeamMiniStage>
  );
}

/** N evenly spaced bars — the shared "per row" glyph (same idea as the Experience/Work panels). */
function TeamRailColumnsWireframe({ columns }: { columns: number }) {
  const gap = 6;
  const totalWidth = 96;
  const startX = 12;
  const barWidth = (totalWidth - gap * (columns - 1)) / columns;
  return (
    <TeamMiniStage>
      {Array.from({ length: columns }, (_, index) => (
        <rect
          key={index}
          className="pf-stack-mini-ink"
          x={startX + index * (barWidth + gap)}
          y={16}
          width={barWidth}
          height={40}
          rx={3}
        />
      ))}
    </TeamMiniStage>
  );
}

/** A single portrait drawn with the real corner radius (rule 1b: show the look, don't name it). */
function TeamRailRadiusWireframe({ value }: { value: PortfolioTeamCornerRadius }) {
  const radius = value === 'none' ? 0 : value === 'sm' ? 4 : value === 'lg' ? 16 : 10;
  return (
    <TeamMiniStage>
      <rect className="pf-stack-mini-ink" x={38} y={10} width={44} height={52} rx={radius} opacity={0.9} />
    </TeamMiniStage>
  );
}

/** Three portraits of decreasing height, sharing one baseline — the axis IS the preview. */
function TeamRailHeightWireframe({ value }: { value: PortfolioTeamImageHeight }) {
  const height = value === 'short' ? 26 : value === 'medium' ? 38 : 52;
  return (
    <TeamMiniStage>
      <rect
        className="pf-stack-mini-ink"
        x={38}
        y={62 - height}
        width={44}
        height={height}
        rx={6}
        opacity={0.9}
      />
    </TeamMiniStage>
  );
}

/** The portrait on one side of the panel, copy on the other — the whole point of the setting. */
function TeamSpotlightSideWireframe({ value }: { value: PortfolioTeamSpotlightSide }) {
  const imageX = value === 'right' ? 62 : 10;
  const copyX = value === 'right' ? 14 : 66;
  return (
    <TeamMiniStage>
      <rect className="pf-stack-mini-ink" x={imageX} y={10} width={48} height={52} rx={5} opacity={0.9} />
      <rect className="pf-stack-mini-mute" x={copyX} y={24} width={16} height={3} rx={1.5} />
      <rect className="pf-stack-mini-ink" x={copyX} y={32} width={40} height={8} rx={2} opacity={0.75} />
      <rect className="pf-stack-mini-mute" x={copyX} y={45} width={26} height={3} rx={1.5} />
    </TeamMiniStage>
  );
}

/** Left half of the print in the muted tone, right half in the accent — `monochrome` shows only
 *  the mute half, `color` only the accent half, `hover` shows the split (rule 1b: show the look). */
function TeamPolaroidToneWireframe({ value }: { value: PortfolioTeamPolaroidPhotoTone }) {
  const accentWidth = value === 'color' ? 44 : value === 'hover' ? 22 : 0;
  return (
    <TeamMiniStage>
      <g transform="rotate(-3 60 30)">
        <rect className="pf-stack-mini-mute" x="38" y="8" width="44" height="34" rx="2" opacity={0.55} />
        {accentWidth > 0 ? (
          <rect className="pf-stack-mini-accent" x="38" y="8" width={accentWidth} height="34" rx="2" />
        ) : null}
        <rect className="pf-stack-mini-mute" x="44" y="46" width="30" height="3" rx="1.5" />
      </g>
    </TeamMiniStage>
  );
}

function TeamPolaroidLayoutFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  return (
    <>
      <div>
        <TeamSectionLabel>Print color</TeamSectionLabel>
        <div role="radiogroup" aria-label="Print color" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_POLAROID_PHOTO_TONE_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.polaroidPhotoTone ?? 'hover')}
              label={option.label}
              onClick={() => onChange({ polaroidPhotoTone: option.value })}
            >
              <TeamPolaroidToneWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Prints per row</TeamSectionLabel>
        <p className="mt-2 text-xs text-neutral-500">
          Only applies to the “View all” grid — visitors toggle it from the button above the rail.
        </p>
        <div role="radiogroup" aria-label="Prints per row" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.polaroidColumns ?? 3)}
              label={option.label}
              onClick={() => onChange({ polaroidColumns: option.value as PortfolioTeamRailColumns })}
            >
              <TeamRailColumnsWireframe columns={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
    </>
  );
}

function TeamRailLayoutFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  const navigation = team.railNavigation ?? 'drag';
  return (
    <>
      <div>
          <TeamSectionLabel>Navigation</TeamSectionLabel>
          <div role="radiogroup" aria-label="Navigation" className="mt-3 grid grid-cols-3 gap-3">
            {PORTFOLIO_TEAM_RAIL_NAVIGATION_OPTIONS.map((option) => (
              <TeamPickerCard
                key={option.value}
                active={option.value === navigation}
                label={option.label}
                onClick={() => onChange({ railNavigation: option.value })}
              >
                <TeamRailNavigationWireframe value={option.value} />
              </TeamPickerCard>
            ))}
          </div>
        </div>
        <div>
          <TeamSectionLabel>Image height</TeamSectionLabel>
          <div role="radiogroup" aria-label="Image height" className="mt-3 grid grid-cols-3 gap-3">
            {PORTFOLIO_TEAM_IMAGE_HEIGHT_OPTIONS.map((option) => (
              <TeamPickerCard
                key={option.value}
                active={option.value === (team.railImageHeight ?? 'tall')}
                label={option.label}
                onClick={() => onChange({ railImageHeight: option.value })}
              >
                <TeamRailHeightWireframe value={option.value} />
              </TeamPickerCard>
            ))}
          </div>
        </div>
        <div>
          <TeamSectionLabel>Image corners</TeamSectionLabel>
          <div role="radiogroup" aria-label="Image corners" className="mt-3 grid grid-cols-4 gap-2">
            {PORTFOLIO_TEAM_CORNER_RADIUS_OPTIONS.map((option) => (
              <TeamPickerCard
                key={option.value}
                active={option.value === (team.railImageRadius ?? 'md')}
                label={option.label}
                onClick={() => onChange({ railImageRadius: option.value })}
              >
                <TeamRailRadiusWireframe value={option.value} />
              </TeamPickerCard>
            ))}
          </div>
        </div>
        {navigation === 'show-all' ? (
          <div>
            <TeamSectionLabel>Portraits per row</TeamSectionLabel>
            <div role="radiogroup" aria-label="Portraits per row" className="mt-3 grid grid-cols-3 gap-3">
              {PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS.map((option) => (
                <TeamPickerCard
                  key={option.value}
                  active={option.value === (team.railColumns ?? 3)}
                  label={option.label}
                  onClick={() => onChange({ railColumns: option.value as PortfolioTeamRailColumns })}
                >
                  <TeamRailColumnsWireframe columns={option.value} />
                </TeamPickerCard>
              ))}
            </div>
          </div>
        ) : null}
    </>
  );
}

/** Rail versus grid — the glyph shows what the visitor gets, not what the mode is called. */
function TeamHoverViewWireframe({ value }: { value: PortfolioTeamProfileView }) {
  if (value === 'grid') {
    return (
      <TeamMiniStage>
        {[0, 1, 2].map((column) => (
          <g key={column}>
            <rect
              className="pf-stack-mini-ink"
              x={12 + column * 34}
              y={column % 2 === 1 ? 18 : 10}
              width={28}
              height={26}
              rx={3}
              opacity={0.85}
            />
            <rect
              className="pf-stack-mini-ink"
              x={12 + column * 34}
              y={column % 2 === 1 ? 48 : 40}
              width={28}
              height={22}
              rx={3}
              opacity={0.45}
            />
          </g>
        ))}
      </TeamMiniStage>
    );
  }
  return (
    <TeamMiniStage>
      {/* Three portraits, the last running off the frame, and the pair of chevrons below. */}
      <rect className="pf-stack-mini-ink" x={10} y={12} width={30} height={38} rx={4} />
      <rect className="pf-stack-mini-ink" x={46} y={12} width={30} height={38} rx={4} opacity={0.8} />
      <rect className="pf-stack-mini-ink" x={82} y={12} width={30} height={38} rx={4} opacity={0.45} />
      <circle className="pf-stack-mini-mute" cx={76} cy={61} r={7} />
      <circle className="pf-stack-mini-accent" cx={96} cy={61} r={7} />
    </TeamMiniStage>
  );
}

/** The asymmetry itself: one column dropped against its neighbours, or a flat baseline. */
function TeamHoverStaggerWireframe({ staggered }: { staggered: boolean }) {
  return (
    <TeamMiniStage>
      {[0, 1, 2].map((column) => (
        <rect
          key={column}
          className="pf-stack-mini-ink"
          x={12 + column * 34}
          y={staggered && column % 2 === 1 ? 22 : 12}
          width={28}
          height={38}
          rx={3}
          opacity={column === 1 ? 0.85 : 0.6}
        />
      ))}
    </TeamMiniStage>
  );
}

/** The 3D tilt, drawn as what it does: a card caught mid-rotation, with its portrait ahead of it. */
function TeamFloatTiltWireframe({ tilted }: { tilted: boolean }) {
  return (
    <TeamMiniStage>
      <g transform={tilted ? 'matrix(1,0.085,-0.16,1,22,-4)' : ''}>
        <rect className="pf-stack-mini-ink" x={34} y={22} width={52} height={40} rx={5} opacity={0.75} />
        <circle className="pf-stack-mini-accent" cx={60} cy={22} r={11} />
      </g>
    </TeamMiniStage>
  );
}

/**
 * Where the block of cards lands in the section — drawn as the block itself against the frame, so
 * the difference between the three placements and `full` is the picture rather than the label.
 */
function TeamFloatAlignWireframe({ value }: { value: PortfolioTeamFloatAlign }) {
  const full = value === 'full';
  const cards = full ? 3 : 2;
  const cardWidth = full ? 32 : 24;
  const gutter = 5;
  const blockWidth = cards * cardWidth + (cards - 1) * gutter;
  const x = value === 'center' ? (120 - blockWidth) / 2 : value === 'right' ? 120 - blockWidth - 8 : 8;
  return (
    <TeamMiniStage>
      {Array.from({ length: cards }, (_, index) => {
        const left = x + index * (cardWidth + gutter);
        const top = index % 2 === 1 ? 26 : 20;
        return (
          <g key={index}>
            <rect
              className="pf-stack-mini-ink"
              x={left}
              y={top}
              width={cardWidth}
              height={30}
              rx={4}
              opacity={0.85}
            />
            {/* The overhanging portrait — what makes this design recognisable at thumbnail size. */}
            <circle className="pf-stack-mini-accent" cx={left + cardWidth / 2} cy={top} r={7} />
          </g>
        );
      })}
    </TeamMiniStage>
  );
}

function TeamFloatCardsLayoutFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  const view = team.floatCardsView ?? 'grid';
  return (
    <>
      <div>
        <TeamSectionLabel>Opening view</TeamSectionLabel>
        <p className="mt-2 text-xs text-neutral-500">
          Visitors can switch between both from the toolbar under the cards.
        </p>
        <div role="radiogroup" aria-label="Opening view" className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_PROFILE_VIEW_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === view}
              label={option.label}
              onClick={() => onChange({ floatCardsView: option.value })}
            >
              <TeamHoverViewWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Card alignment</TeamSectionLabel>
        <div role="radiogroup" aria-label="Card alignment" className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_FLOAT_ALIGN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.floatCardsAlign ?? 'center')}
              label={option.label}
              onClick={() => onChange({ floatCardsAlign: option.value })}
            >
              <TeamFloatAlignWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <TeamPxSlider
        label="Horizontal spacing"
        value={team.floatCardsColumnGap ?? teamFloatDefaultColumnGap(team.gap)}
        min={TEAM_FLOAT_COLUMN_GAP.min}
        max={TEAM_FLOAT_COLUMN_GAP.max}
        step={TEAM_FLOAT_COLUMN_GAP.step}
        onChange={(floatCardsColumnGap) => onChange({ floatCardsColumnGap })}
      />
      <div>
        <TeamSectionLabel>Cards per row</TeamSectionLabel>
        <div role="radiogroup" aria-label="Cards per row" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.floatCardsColumns ?? 3)}
              label={option.label}
              onClick={() => onChange({ floatCardsColumns: option.value as PortfolioTeamRailColumns })}
            >
              <TeamRailColumnsWireframe columns={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Grid baseline</TeamSectionLabel>
        <div role="radiogroup" aria-label="Grid baseline" className="mt-3 grid grid-cols-2 gap-3">
          {[
            { value: true, label: 'Staggered' },
            { value: false, label: 'Aligned' },
          ].map((option) => (
            <TeamPickerCard
              key={String(option.value)}
              active={option.value === (team.floatCardsStagger !== false)}
              label={option.label}
              onClick={() => onChange({ floatCardsStagger: option.value })}
            >
              <TeamHoverStaggerWireframe staggered={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Card motion</TeamSectionLabel>
        <div role="radiogroup" aria-label="Card motion" className="mt-3 grid grid-cols-2 gap-3">
          {[
            { value: true, label: '3D tilt' },
            { value: false, label: 'Flat' },
          ].map((option) => (
            <TeamPickerCard
              key={String(option.value)}
              active={option.value === (team.floatCardsTilt !== false)}
              label={option.label}
              onClick={() => onChange({ floatCardsTilt: option.value })}
            >
              <TeamFloatTiltWireframe tilted={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
    </>
  );
}

/** The three ways out of the spotlight, drawn as the panel's own bottom-left corner. */
function TeamSpotlightNavigationWireframe({ value }: { value: PortfolioTeamSpotlightNavigation }) {
  return (
    <TeamMiniStage>
      <rect className="pf-stack-mini-ink" x={10} y={10} width={40} height={52} rx={5} opacity={0.75} />
      <rect className="pf-stack-mini-mute" x={58} y={18} width={40} height={4} rx={2} />
      <rect className="pf-stack-mini-mute" x={58} y={28} width={26} height={4} rx={2} />
      {value === 'thumbnails' ? (
        <>
          <rect className="pf-stack-mini-accent" x={58} y={44} width={13} height={18} rx={2.5} />
          <rect className="pf-stack-mini-ink" x={75} y={44} width={13} height={18} rx={2.5} opacity={0.5} />
          <rect className="pf-stack-mini-ink" x={92} y={44} width={13} height={18} rx={2.5} opacity={0.5} />
        </>
      ) : value === 'arrows' ? (
        <>
          <circle className="pf-stack-mini-mute" cx={66} cy={53} r={8} />
          <circle className="pf-stack-mini-accent" cx={88} cy={53} r={8} />
        </>
      ) : (
        // Both: the pair above the strip, pushed to the right edge.
        <>
          <circle className="pf-stack-mini-mute" cx={87} cy={40} r={5.5} />
          <circle className="pf-stack-mini-accent" cx={100} cy={40} r={5.5} />
          <rect className="pf-stack-mini-accent" x={58} y={50} width={11} height={14} rx={2} />
          <rect className="pf-stack-mini-ink" x={72} y={50} width={11} height={14} rx={2} opacity={0.5} />
          <rect className="pf-stack-mini-ink" x={86} y={50} width={11} height={14} rx={2} opacity={0.5} />
          <rect className="pf-stack-mini-ink" x={100} y={50} width={11} height={14} rx={2} opacity={0.5} />
        </>
      )}
    </TeamMiniStage>
  );
}

function TeamSpotlightLayoutFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  return (
    <>
      <div>
        <TeamSectionLabel>Navigation</TeamSectionLabel>
        <div role="radiogroup" aria-label="Navigation" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_SPOTLIGHT_NAVIGATION_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.spotlightNavigation ?? 'thumbnails')}
              label={option.label}
              onClick={() => onChange({ spotlightNavigation: option.value })}
            >
              <TeamSpotlightNavigationWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Portrait side</TeamSectionLabel>
        <div role="radiogroup" aria-label="Portrait side" className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_SPOTLIGHT_SIDE_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.spotlightPortraitSide ?? 'left')}
              label={option.label}
              onClick={() => onChange({ spotlightPortraitSide: option.value })}
            >
              <TeamSpotlightSideWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Panel corners</TeamSectionLabel>
        <div role="radiogroup" aria-label="Panel corners" className="mt-3 grid grid-cols-4 gap-2">
          {PORTFOLIO_TEAM_CORNER_RADIUS_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.spotlightPanelRadius ?? 'md')}
              label={option.label}
              onClick={() => onChange({ spotlightPanelRadius: option.value })}
            >
              <TeamRailRadiusWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamVisibilityRow
          label="Switch on hover"
          checked={team.spotlightHoverSwitch !== false}
          onChange={(spotlightHoverSwitch) => onChange({ spotlightHoverSwitch })}
        />
      </div>
    </>
  );
}

/**
 * Three index rows drawn as the design produces them: a plate hovering off the addressed row
 * (`cursor`), or a print pinned at the start / end of every row.
 */
function TeamDirectoryPortraitWireframe({ value }: { value: PortfolioTeamDirectoryPortrait }) {
  const rows = [
    { y: 16, width: 50 },
    { y: 36, width: 64 },
    { y: 56, width: 42 },
  ];
  if (value === 'cursor') {
    return (
      <TeamMiniStage>
        {rows.map((row, index) => (
          <rect
            key={row.y}
            className={index === 1 ? 'pf-stack-mini-ink' : 'pf-stack-mini-mute'}
            x={12}
            y={row.y - 3}
            width={row.width + 8}
            height={6}
            rx={2}
          />
        ))}
        <rect className="pf-stack-mini-accent" x={66} y={18} width={34} height={30} rx={4} />
        <circle className="pf-stack-mini-ink" cx={103} cy={51} r={2.5} />
      </TeamMiniStage>
    );
  }
  // The stage stretches to the card (preserveAspectRatio="none") and a three-up card is narrow,
  // so plates are drawn wider than tall in viewBox units to still read as 4:5 prints on screen.
  const plateX = value === 'left' ? 10 : 92;
  const barX = value === 'left' ? 34 : 12;
  return (
    <TeamMiniStage>
      {rows.map((row) => (
        <g key={row.y}>
          <rect className="pf-stack-mini-ink" x={plateX} y={row.y - 7} width={18} height={14} rx={2} />
          <rect
            className="pf-stack-mini-ink"
            x={barX}
            y={row.y - 3}
            width={row.width}
            height={6}
            rx={2}
            opacity={0.55}
          />
        </g>
      ))}
    </TeamMiniStage>
  );
}

/**
 * One portrait with its real corner. The shape sits on its own `meet` SVG over the stage: the stage
 * stretches (preserveAspectRatio="none"), which would squash `Full` into an oval and every print
 * into a sliver. Corner radii are scaled from the real ~6rem print so each step reads true.
 */
function TeamDirectoryRadiusWireframe({ value }: { value: PortfolioTeamAvatarRadius }) {
  const round = value === 'full';
  const width = round ? 30 : 26;
  const height = round ? 30 : 32.5;
  const rx = round ? 15 : value === 'none' ? 0 : value === 'sm' ? 1.8 : value === 'lg' ? 6.8 : 3.4;
  return (
    <div className="relative">
      <TeamMiniStage>{null}</TeamMiniStage>
      <svg
        viewBox="0 0 48 48"
        className="pf-stack-mini pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <rect
          className="pf-stack-mini-ink"
          x={(48 - width) / 2}
          y={(48 - height) / 2}
          width={width}
          height={height}
          rx={rx}
          opacity={0.9}
        />
      </svg>
    </div>
  );
}

function TeamDirectoryLayoutFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  return (
    <>
      <div>
        <TeamSectionLabel>Portrait</TeamSectionLabel>
        <div role="radiogroup" aria-label="Portrait" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_DIRECTORY_PORTRAIT_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.directoryPortrait ?? 'cursor')}
              label={option.label}
              onClick={() => onChange({ directoryPortrait: option.value })}
            >
              <TeamDirectoryPortraitWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Portrait corners</TeamSectionLabel>
        {/* Three per row like the Portrait group above: five across would squeeze the labels below
            the 13px minimum, and matching widths keep the band on one grid. */}
        <div role="radiogroup" aria-label="Portrait corners" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_AVATAR_RADIUS_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.directoryPortraitRadius ?? 'md')}
              label={option.label}
              onClick={() => onChange({ directoryPortraitRadius: option.value })}
            >
              <TeamDirectoryRadiusWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <TeamPxSlider
        label="Card spacing"
        value={team.directoryCardGap ?? teamDirectoryDefaultCardGap(team.gap)}
        min={TEAM_DIRECTORY_CARD_GAP.min}
        max={TEAM_DIRECTORY_CARD_GAP.max}
        step={TEAM_DIRECTORY_CARD_GAP.step}
        onChange={(directoryCardGap) => onChange({ directoryCardGap })}
      />
    </>
  );
}

/**
 * Ordered axis → slider (settings standard, rule 1a): title with the live value on its right, and
 * every drag step patched straight through so the preview follows the thumb. Track and thumb are the
 * shared `.pf-stack-slider-input` used by the other panels' sliders.
 */
function TeamPxSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <TeamSectionLabel>{label}</TeamSectionLabel>
        <span className="text-[13px] font-semibold tabular-nums text-neutral-700">{`${value}px`}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={`${value}px`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="pf-stack-slider-input mt-4"
        style={{
          background: `linear-gradient(to right, var(--pf-palette-texte-fort, #f5f5f5) ${percent}%, color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 16%, var(--pf-palette-fond, #0a0a0a)) ${percent}%)`,
        }}
      />
    </div>
  );
}

/** The two navigations, drawn: a rail running off the frame with its chevrons, or staggered rows. */
function TeamProfileViewWireframe({ value }: { value: PortfolioTeamProfileView }) {
  if (value === 'grid') {
    return (
      <TeamMiniStage>
        <rect className="pf-stack-mini-ink" x={14} y={10} width={30} height={26} rx={4} />
        <rect className="pf-stack-mini-ink" x={50} y={18} width={30} height={26} rx={4} opacity={0.75} />
        <rect className="pf-stack-mini-ink" x={86} y={10} width={26} height={26} rx={4} opacity={0.55} />
        <rect className="pf-stack-mini-mute" x={14} y={42} width={30} height={12} rx={3} />
        <rect className="pf-stack-mini-mute" x={50} y={50} width={30} height={12} rx={3} opacity={0.75} />
        <rect className="pf-stack-mini-mute" x={86} y={42} width={26} height={12} rx={3} opacity={0.55} />
      </TeamMiniStage>
    );
  }
  return (
    <TeamMiniStage>
      <rect className="pf-stack-mini-ink" x={10} y={10} width={32} height={30} rx={4} />
      <rect className="pf-stack-mini-mute" x={10} y={44} width={32} height={10} rx={3} />
      <rect className="pf-stack-mini-ink" x={48} y={10} width={32} height={30} rx={4} opacity={0.7} />
      <rect className="pf-stack-mini-mute" x={48} y={44} width={32} height={10} rx={3} opacity={0.7} />
      <rect className="pf-stack-mini-ink" x={86} y={10} width={26} height={30} rx={4} opacity={0.35} />
      <circle className="pf-stack-mini-mute" cx={96} cy={60} r={6} />
      <circle className="pf-stack-mini-accent" cx={110} cy={60} r={6} />
    </TeamMiniStage>
  );
}

/** The standard "i" affordance: a hint that is needed but does not deserve a permanent line. */
function TeamInfoTooltip({ text }: { text: string }) {
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

/**
 * An ordered axis is a slider, not a row of pills (rule 1a of the settings design standard) —
 * same control, same shared `.pf-exp-centered-slider` styling, as the Experience panel's.
 */
function TeamOptionSlider<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const current = options[index];
  return (
    <div>
      <div className="pf-exp-centered-slider-head">
        <span className="inline-flex items-center gap-1.5">
          <TeamSectionLabel>{label}</TeamSectionLabel>
          {hint ? <TeamInfoTooltip text={hint} /> : null}
        </span>
        <span className="pf-exp-centered-slider-value">{current?.label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(options.length - 1, 0)}
        step={1}
        value={index}
        aria-label={label}
        aria-valuetext={current?.label}
        onChange={(event) => {
          const next = options[Number(event.target.value)];
          if (next) onChange(next.value);
        }}
        className="pf-exp-centered-slider"
        style={
          {
            '--pf-exp-slider-fill': `${(index / Math.max(options.length - 1, 1)) * 100}%`,
          } as CSSProperties
        }
      />
      <div
        className="pf-exp-centered-slider-ticks"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            data-active={option.value === value ? 'true' : 'false'}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The panel at rest on the portrait, or only arriving under the cursor. */
function TeamProfilePanelWireframe({ value }: { value: PortfolioTeamProfilePanel }) {
  return (
    <TeamMiniStage>
      <rect className="pf-stack-mini-ink" x={34} y={8} width={52} height={56} rx={6} opacity={0.9} />
      {value === 'always' ? (
        <>
          <rect className="pf-stack-mini-mute" x={39} y={44} width={42} height={15} rx={4} />
          <rect className="pf-stack-mini-accent" x={44} y={49} width={20} height={2.5} rx={1.25} />
        </>
      ) : (
        <>
          <rect className="pf-stack-mini-mute" x={39} y={50} width={42} height={9} rx={3} opacity={0.45} />
          {/* The cursor is the whole point of the option — it is why the panel is there at all. */}
          <path className="pf-stack-mini-accent" d="M62 30 L62 45 L66 41 L69 47 L72 45 L69 39 L74 39 Z" />
        </>
      )}
    </TeamMiniStage>
  );
}

/**
 * The ratio preview is an HTML box with a real `aspect-ratio`, not a rect in the shared mini
 * stage: that stage is an SVG with `preserveAspectRatio="none"`, so it squashes its own user
 * units horizontally and a 1:1 rect drawn there renders as a portrait — measured, and it made
 * every step of this control look the same. The frame repeats the stage's own tokens so the card
 * still matches every other picker in the panel.
 */
function TeamProfileRatioWireframe({ value }: { value: PortfolioTeamProfileRatio }) {
  const aspect =
    value === 'square'
      ? '1 / 1'
      : value === 'soft'
        ? '4 / 5'
        : value === 'tall'
          ? '2 / 3'
          : value === 'xtall'
            ? '9 / 16'
            : '3 / 4';
  return (
    <span className="pf-stack-mini block h-[4.35rem] w-full">
      <span
        className="flex h-full w-full items-center justify-center rounded-[9px] border"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 5.5%, var(--pf-palette-fond, #0a0a0a))',
          borderColor: 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 10%, transparent)',
        }}
      >
        <span
          className="relative block h-[3.1rem] max-w-[85%] rounded-[4px]"
          style={{
            aspectRatio: aspect,
            backgroundColor: 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 20%, transparent)',
          }}
        >
          {/* The caption pane, so the miniature reads as this design's card and not a blank tile. */}
          <span
            className="absolute inset-x-[12%] bottom-[8%] block h-[20%] rounded-[2px]"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 22%, transparent)',
            }}
          />
        </span>
      </span>
    </span>
  );
}

function TeamProfileCardsLayoutFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  return (
    <>
      <div>
        <TeamSectionLabel>Opens on</TeamSectionLabel>
        <div role="radiogroup" aria-label="Opens on" className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_PROFILE_VIEW_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.profileCardsView ?? 'grid')}
              label={option.label}
              onClick={() => onChange({ profileCardsView: option.value })}
            >
              <TeamProfileViewWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Cards per row</TeamSectionLabel>
        <div role="radiogroup" aria-label="Cards per row" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.profileCardsColumns ?? 3)}
              label={option.label}
              onClick={() => onChange({ profileCardsColumns: option.value })}
            >
              <TeamRailColumnsWireframe columns={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Card ratio</TeamSectionLabel>
        {/* Five steps, widest → tallest: three per row keeps every card the same size (rule 3). */}
        <div role="radiogroup" aria-label="Card ratio" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_PROFILE_RATIO_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.profileCardsRatio ?? 'portrait')}
              label={option.label}
              onClick={() => onChange({ profileCardsRatio: option.value })}
            >
              <TeamProfileRatioWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamOptionSlider
          label="Column spacing"
          hint="Applies on desktop only — phones and tablets keep one comfortable gap."
          options={PORTFOLIO_TEAM_PROFILE_GUTTER_OPTIONS}
          value={(team.profileCardsGutter ?? 'md') as PortfolioTeamProfileGutter}
          onChange={(profileCardsGutter) => onChange({ profileCardsGutter })}
        />
      </div>
      <div>
        <TeamSectionLabel>Info panel</TeamSectionLabel>
        <div role="radiogroup" aria-label="Info panel" className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_PROFILE_PANEL_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.profileCardsPanel ?? 'always')}
              label={option.label}
              onClick={() => onChange({ profileCardsPanel: option.value })}
            >
              <TeamProfilePanelWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Visible at first</TeamSectionLabel>
        <div className="mt-3">
          <TeamOptionGrid
            label="Visible at first"
            hideLabel
            columns={4}
            options={PORTFOLIO_TEAM_PROFILE_VISIBLE_OPTIONS}
            value={(team.profileCardsVisible ?? 'all') as PortfolioTeamProfileVisible}
            onChange={(profileCardsVisible) => onChange({ profileCardsVisible })}
          />
        </div>
      </div>
      <div>
        <TeamVisibilityRow
          label="Staggered columns"
          checked={team.profileCardsStagger !== false}
          onChange={(profileCardsStagger) => onChange({ profileCardsStagger })}
        />
      </div>
    </>
  );
}

/** The two navigations, drawn with this design's own object — the avatar, not a portrait card. */
function TeamAvatarViewWireframe({ value }: { value: PortfolioTeamAvatarView }) {
  if (value === 'grid') {
    return (
      <TeamMiniStage>
        {[0, 1, 2].map((column) => (
          <g key={column} opacity={1 - column * 0.22}>
            <circle className="pf-stack-mini-ink" cx={26 + column * 34} cy={22 + (column % 2) * 8} r={11} />
            <rect
              className="pf-stack-mini-mute"
              x={14 + column * 34}
              y={38 + (column % 2) * 8}
              width={24}
              height={3}
              rx={1.5}
            />
          </g>
        ))}
        <circle className="pf-stack-mini-ink" cx={26} cy={58} r={6} opacity={0.35} />
        <circle className="pf-stack-mini-ink" cx={60} cy={66} r={6} opacity={0.25} />
      </TeamMiniStage>
    );
  }
  return (
    <TeamMiniStage>
      <circle className="pf-stack-mini-ink" cx={26} cy={26} r={13} />
      <rect className="pf-stack-mini-mute" x={12} y={44} width={28} height={3} rx={1.5} />
      <circle className="pf-stack-mini-ink" cx={64} cy={26} r={13} opacity={0.7} />
      <rect className="pf-stack-mini-mute" x={50} y={44} width={28} height={3} rx={1.5} opacity={0.7} />
      <circle className="pf-stack-mini-ink" cx={102} cy={26} r={13} opacity={0.35} />
      <circle className="pf-stack-mini-mute" cx={96} cy={60} r={6} />
      <circle className="pf-stack-mini-accent" cx={110} cy={60} r={6} />
    </TeamMiniStage>
  );
}

/** The block against the section's own edges — capped and centred, or filling the width. */
function TeamAvatarGridWidthWireframe({ value }: { value: PortfolioTeamAvatarGridWidth }) {
  const full = value === 'full';
  const startX = full ? 8 : 26;
  const span = full ? 104 : 68;
  const card = (span - 2 * 5) / 3;
  return (
    <TeamMiniStage>
      {[0, 1, 2].map((column) => (
        <g key={column} opacity={0.85 - column * 0.16}>
          <rect
            className="pf-stack-mini-ink"
            x={startX + column * (card + 5)}
            y={14}
            width={card}
            height={44}
            rx={4}
          />
          <circle
            className="pf-stack-mini-stage"
            cx={startX + column * (card + 5) + card / 2}
            cy={30}
            r={Math.min(10, card / 2.6)}
          />
        </g>
      ))}
    </TeamMiniStage>
  );
}

/** Two cards at the real gutter — the whole point of the setting is the space between them. */
function TeamAvatarColumnGapWireframe({ value }: { value: PortfolioTeamAvatarColumnGap }) {
  const gutter = value === 'sm' ? 4 : value === 'md' ? 9 : value === 'lg' ? 16 : 26;
  const card = (96 - gutter) / 2;
  return (
    <TeamMiniStage>
      {[0, 1].map((column) => (
        <g key={column} opacity={column === 0 ? 0.85 : 0.6}>
          <rect
            className="pf-stack-mini-ink"
            x={12 + column * (card + gutter)}
            y={12}
            width={card}
            height={48}
            rx={5}
          />
          <circle
            className="pf-stack-mini-stage"
            cx={12 + column * (card + gutter) + card / 2}
            cy={30}
            r={Math.min(13, card / 2.6)}
          />
        </g>
      ))}
    </TeamMiniStage>
  );
}

/** The shape itself, at the radius it actually morphs to — the look is the label. */
function TeamAvatarShapeWireframe({ value }: { value: PortfolioTeamAvatarShape }) {
  if (value === 'arch') {
    return (
      <TeamMiniStage>
        <path
          className="pf-stack-mini-ink"
          d="M40 36 A20 20 0 0 1 80 36 L80 49 A7 7 0 0 1 73 56 L47 56 A7 7 0 0 1 40 49 Z"
        />
      </TeamMiniStage>
    );
  }
  if (value === 'squircle') {
    return (
      <TeamMiniStage>
        <rect className="pf-stack-mini-ink" x={40} y={16} width={40} height={40} rx={13.5} />
      </TeamMiniStage>
    );
  }
  return (
    <TeamMiniStage>
      <circle className="pf-stack-mini-ink" cx={60} cy={36} r={20} />
    </TeamMiniStage>
  );
}

function TeamAvatarCardsLayoutFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  return (
    <>
      <div>
        <TeamSectionLabel>Opens on</TeamSectionLabel>
        <div role="radiogroup" aria-label="Opens on" className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_AVATAR_VIEW_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.avatarCardsView ?? 'grid')}
              label={option.label}
              onClick={() => onChange({ avatarCardsView: option.value })}
            >
              <TeamAvatarViewWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Members per row</TeamSectionLabel>
        <div role="radiogroup" aria-label="Members per row" className="mt-3 grid grid-cols-4 gap-2">
          {PORTFOLIO_TEAM_AVATAR_COLUMN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.avatarCardsColumns ?? (team.columns as PortfolioTeamAvatarColumns) ?? 3)}
              label={option.label}
              onClick={() => onChange({ avatarCardsColumns: option.value })}
            >
              <TeamRailColumnsWireframe columns={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Horizontal spacing</TeamSectionLabel>
        <div role="radiogroup" aria-label="Horizontal spacing" className="mt-3 grid grid-cols-4 gap-2">
          {PORTFOLIO_TEAM_AVATAR_COLUMN_GAP_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.avatarCardsColumnGap ?? 'md')}
              label={option.label}
              onClick={() => onChange({ avatarCardsColumnGap: option.value })}
            >
              <TeamAvatarColumnGapWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Grid width</TeamSectionLabel>
        <div role="radiogroup" aria-label="Grid width" className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_AVATAR_GRID_WIDTH_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.avatarCardsGridWidth ?? 'centered')}
              label={option.label}
              onClick={() => onChange({ avatarCardsGridWidth: option.value })}
            >
              <TeamAvatarGridWidthWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Hover shape</TeamSectionLabel>
        <div role="radiogroup" aria-label="Hover shape" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_AVATAR_SHAPE_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.avatarCardsShape ?? 'squircle')}
              label={option.label}
              onClick={() => onChange({ avatarCardsShape: option.value })}
            >
              <TeamAvatarShapeWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamVisibilityRow
          label="Staggered rows"
          checked={team.avatarCardsStagger !== false}
          onChange={(avatarCardsStagger) => onChange({ avatarCardsStagger })}
        />
        <TeamVisibilityRow
          label="Avatar glow"
          checked={team.avatarCardsGlow !== false}
          onChange={(avatarCardsGlow) => onChange({ avatarCardsGlow })}
        />
      </div>
    </>
  );
}

/**
 * The portrait plate with its real corner. The shape rides its own `meet` SVG over the stage: the
 * stage stretches (`preserveAspectRatio="none"`) and a four-up card is narrow, which would squash
 * a stage-drawn plate into a sliver and `Large` into an oval. Radii are scaled from the plate's
 * real proportion, so each step reads true.
 */
function TeamSplitRadiusWireframe({ value }: { value: PortfolioTeamCornerRadius }) {
  const rx = value === 'none' ? 0 : value === 'sm' ? 2 : value === 'lg' ? 8 : 4.5;
  return (
    <div className="relative">
      <TeamMiniStage>{null}</TeamMiniStage>
      <svg
        viewBox="0 0 48 48"
        className="pf-stack-mini pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <rect className="pf-stack-mini-ink" x={14} y={6} width={20} height={36} rx={rx} opacity={0.9} />
      </svg>
    </div>
  );
}

/** Stacked names on one side, the full-height plate on the other — the setting IS the composition. */
function TeamSplitSideWireframe({ value }: { value: PortfolioTeamSpotlightSide }) {
  const plateX = value === 'right' ? 70 : 6;
  const namesX = value === 'right' ? 8 : 52;
  return (
    <TeamMiniStage>
      <rect className="pf-stack-mini-ink" x={plateX} y={8} width={44} height={56} rx={3} opacity={0.75} />
      <rect className="pf-stack-mini-ink" x={namesX} y={14} width={40} height={6} rx={2} opacity={0.9} />
      <rect className="pf-stack-mini-ink" x={namesX} y={24} width={32} height={6} rx={2} opacity={0.22} />
      <rect className="pf-stack-mini-ink" x={namesX} y={34} width={36} height={6} rx={2} opacity={0.22} />
      <rect className="pf-stack-mini-mute" x={namesX} y={52} width={28} height={1} opacity={0.6} />
      <rect className="pf-stack-mini-mute" x={namesX} y={58} width={18} height={3} rx={1.5} />
    </TeamMiniStage>
  );
}

/** The plate itself, half muted and half accent: `Black & white` shows no accent at all, `Full
 *  color` the whole plate, `Hover to reveal` the split between the two (rule 1b: show the look). */
function TeamSplitToneWireframe({ value }: { value: PortfolioTeamPolaroidPhotoTone }) {
  const accentWidth = value === 'color' ? 44 : value === 'hover' ? 22 : 0;
  return (
    <TeamMiniStage>
      <rect className="pf-stack-mini-mute" x="38" y="8" width="44" height="56" rx="2" opacity={0.55} />
      {accentWidth > 0 ? (
        <rect className="pf-stack-mini-accent" x="38" y="8" width={accentWidth} height="56" rx="2" />
      ) : null}
    </TeamMiniStage>
  );
}

function TeamSplitScreenLayoutFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  return (
    <>
      <div>
        <TeamSectionLabel>Portrait side</TeamSectionLabel>
        <div role="radiogroup" aria-label="Portrait side" className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_SPOTLIGHT_SIDE_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.splitPortraitSide ?? 'right')}
              label={option.label}
              onClick={() => onChange({ splitPortraitSide: option.value })}
            >
              <TeamSplitSideWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Portrait tone</TeamSectionLabel>
        <div role="radiogroup" aria-label="Portrait tone" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_POLAROID_PHOTO_TONE_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.splitPhotoTone ?? 'monochrome')}
              label={option.label}
              onClick={() => onChange({ splitPhotoTone: option.value })}
            >
              <TeamSplitToneWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Portrait corners</TeamSectionLabel>
        <div role="radiogroup" aria-label="Portrait corners" className="mt-3 grid grid-cols-4 gap-2">
          {PORTFOLIO_TEAM_CORNER_RADIUS_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.splitPanelRadius ?? 'none')}
              label={option.label}
              onClick={() => onChange({ splitPanelRadius: option.value })}
            >
              <TeamSplitRadiusWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamVisibilityRow
          label="Social links behind a button"
          checked={team.splitSocialsReveal !== false}
          onChange={(splitSocialsReveal) => onChange({ splitSocialsReveal })}
        />
      </div>
    </>
  );
}

/** Three plates at three different heights (or the same one, `Off`) — the parallax setting shown
 *  as the effect it actually produces (rule 1b: show the look, don't name it). */
function TeamCanvasParallaxWireframe({ active }: { active: boolean }) {
  const drop = active ? 10 : 0;
  return (
    <TeamMiniStage>
      <rect className="pf-stack-mini-ink" x="14" y="10" width="26" height="30" rx="3" opacity={0.85} />
      <rect className="pf-stack-mini-ink" x="47" y={10 + drop} width="26" height="30" rx="3" opacity={0.55} />
      <rect className="pf-stack-mini-ink" x="80" y={10 + drop * 2} width="26" height="30" rx="3" opacity={0.3} />
    </TeamMiniStage>
  );
}

function TeamFloatingCanvasLayoutFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  return (
    <>
      <div>
        <TeamSectionLabel>Cards per row</TeamSectionLabel>
        <div role="radiogroup" aria-label="Cards per row" className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.canvasColumns ?? 3)}
              label={option.label}
              onClick={() => onChange({ canvasColumns: option.value as PortfolioTeamRailColumns })}
            >
              <TeamRailColumnsWireframe columns={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Composition width</TeamSectionLabel>
        <div role="radiogroup" aria-label="Composition width" className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_FLOAT_ALIGN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.canvasAlign ?? 'center')}
              label={option.label}
              onClick={() => onChange({ canvasAlign: option.value })}
            >
              <TeamFloatAlignWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <div>
        <TeamSectionLabel>Scroll parallax</TeamSectionLabel>
        <div role="radiogroup" aria-label="Scroll parallax" className="mt-3 grid grid-cols-2 gap-3">
          {[
            { value: true, label: 'On' },
            { value: false, label: 'Off' },
          ].map((option) => (
            <TeamPickerCard
              key={String(option.value)}
              active={option.value === (team.canvasParallax !== false)}
              label={option.label}
              onClick={() => onChange({ canvasParallax: option.value })}
            >
              <TeamCanvasParallaxWireframe active={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
      <TeamTextField
        label="Editorial label"
        value={team.canvasEditorialLabel}
        placeholder="Studio note"
        onChange={(canvasEditorialLabel) => onChange({ canvasEditorialLabel })}
      />
      <TeamTextField
        label="Editorial text"
        value={team.canvasEditorialText}
        placeholder="A small collective of specialists who each choose their own tools…"
        onChange={(canvasEditorialText) => onChange({ canvasEditorialText })}
        multiline
      />
    </>
  );
}

/**
 * One band, one fields component per design. A design with no fields renders nothing at all —
 * add a new `Team<Design>LayoutFields` and a branch here rather than growing this switch inline.
 */
function TeamLayoutSettingsBand({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
}) {
  const fields =
    team.layout === 'portrait-rail' ? (
      <TeamRailLayoutFields team={team} onChange={onChange} />
    ) : team.layout === 'polaroid' ? (
      <TeamPolaroidLayoutFields team={team} onChange={onChange} />
    ) : team.layout === 'float-cards' ? (
      <TeamFloatCardsLayoutFields team={team} onChange={onChange} />
    ) : team.layout === 'spotlight' ? (
      <TeamSpotlightLayoutFields team={team} onChange={onChange} />
    ) : team.layout === 'split-screen' ? (
      <TeamSplitScreenLayoutFields team={team} onChange={onChange} />
    ) : team.layout === 'directory' ? (
      <TeamDirectoryLayoutFields team={team} onChange={onChange} />
    ) : team.layout === 'profile-cards' ? (
      <TeamProfileCardsLayoutFields team={team} onChange={onChange} />
    ) : team.layout === 'avatar-cards' ? (
      <TeamAvatarCardsLayoutFields team={team} onChange={onChange} />
    ) : team.layout === 'floating-canvas' ? (
      <TeamFloatingCanvasLayoutFields team={team} onChange={onChange} />
    ) : null;
  if (!fields) return null;
  return (
    <section className="pf-exp-layout-settings" aria-labelledby="team-layout-settings-title">
      <h3 id="team-layout-settings-title" className="pf-exp-layout-settings-title">
        Layout settings
      </h3>
      <div className="pf-exp-layout-settings-body space-y-7">{fields}</div>
    </section>
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

          <TeamOptionGrid
            label="Font size"
            options={PORTFOLIO_TEAM_PREMIUM_FONT_SIZE_OPTIONS}
            value={team.premiumFontSize ?? 'medium'}
            onChange={(premiumFontSize) => onChange({ premiumFontSize })}
            columns={3}
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
            <>
              <p className="text-xs text-neutral-400">
                Each design renders straight from your members — what shows on a card is set in General → Visibility.
              </p>
              <TeamLayoutSettingsBand team={team} onChange={onChange} />
            </>
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
