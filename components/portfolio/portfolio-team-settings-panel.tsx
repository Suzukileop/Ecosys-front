'use client';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import {StackPreviewSkeleton} from './portfolio-stack-preview-skeleton';
import {StackHeaderSkeleton} from './portfolio-stack-header-skeleton';
import {useThumbnailTheme} from './portfolio-thumbnail-theme';
import {TeamPortraitThumbnailFrame} from '@/components/portfolio/portfolio-team-portrait-thumbnail-frame';
import {TeamSpotlightThumbnailFrame} from '@/components/portfolio/portfolio-team-spotlight-thumbnail-frame';
import {TeamSplitScreenThumbnailFrame} from '@/components/portfolio/portfolio-team-split-screen-thumbnail-frame';
import {TeamEditorialRhythmThumbnailFrame} from '@/components/portfolio/portfolio-team-editorial-rhythm-thumbnail-frame';
import {TeamDirectoryThumbnailFrame} from '@/components/portfolio/portfolio-team-directory-thumbnail-frame';
import {LayoutOptionSchematic} from '@/components/portfolio/layout-option-schematic';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { TextSizeSlider } from '@/components/portfolio/portfolio-text-size-slider';
import { ColorSwatchRow } from '@/components/portfolio/portfolio-color-swatch-row';
import { CardsStyleControls } from '@/components/portfolio/portfolio-cards-style-controls';
import { DEFAULT_CARDS_STYLE } from '@/components/portfolio/portfolio-cards-style';
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { PortfolioDesignLivePreview, usePortfolioDesignPreviewSource } from '@/components/portfolio/PortfolioDesignLivePreview';
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
  DEFAULT_TEAM_PRESENTATION,
  PORTFOLIO_TEAM_AVATAR_COLUMN_GAP_OPTIONS,
  PORTFOLIO_TEAM_AVATAR_COLUMN_OPTIONS,
  PORTFOLIO_TEAM_AVATAR_GRID_WIDTH_OPTIONS,
  PORTFOLIO_TEAM_AVATAR_SHAPE_OPTIONS,
  PORTFOLIO_TEAM_AVATAR_VIEW_OPTIONS,
  PORTFOLIO_TEAM_LAYOUT_OPTIONS,
  PORTFOLIO_TEAM_POLAROID_PHOTO_TONE_OPTIONS,
  PORTFOLIO_TEAM_PROFILE_GUTTER_OPTIONS,
  TEAM_PROFILE_GUTTER_PX,
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
} from '@/components/portfolio/portfolio-team-header-settings';
import { PortfolioHeaderDesignOption } from '@/components/portfolio/portfolio-header-design-lock';
import { HeaderDesignFields, type HeaderCopy } from '@/components/portfolio/portfolio-header-design-fields';
import type { HeaderPatch } from '@/components/portfolio/portfolio-header-style-controls';
import { SettingRow, useSettingsRows } from '@/components/portfolio/portfolio-settings-rows';
import { useT } from '@/lib/i18n/I18nProvider';
import { teamHoverVeilPresentation, teamProfilePatchToHoverVeil } from '@/components/portfolio/portfolio-team-hover-veil-settings';
import { msg } from '@/lib/i18n/config';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { NpBackRow, NpCollapsibleSection, NpPanelShell, NpToggleRow, type NpPanelChrome } from '@/components/portfolio/portfolio-nav-panel-ui';

/* ---------------------------------------------------------------------- */
/* Sub-sections — the same four tabs, in the same order, with the same     */
/* labels as the Footer panel (this repo's reference implementation of the */
/* "Settings design standard"), matching the Gallery panel's own rebuild.  */
/* ---------------------------------------------------------------------- */

export type TeamSubSection = 'general' | 'design' | 'background' | 'header';

const TEAM_SUB_SECTIONS: { id: TeamSubSection; label: string }[] = [
  { id: 'general', label: msg('General') },
  { id: 'design', label: msg('Design') },
  { id: 'header', label: msg('Header') },
  { id: 'background', label: msg('Background') },
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
  'w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]';

function TeamSectionLabel({ children }: { children: string }) {
  return <p className="pf-stack-block-label">{children}</p>;
}

function TeamGroupLabel({ children }: { children: string }) {
  return <p className="text-[13px] font-medium text-[color:var(--pf-palette-texte-muted)]">{children}</p>;
}

/** Same animated switch as the Footer/Gallery/Contact panels — shared settings-UI chrome. */
function TeamSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span className="np-switch" aria-checked={checked} aria-hidden data-switch-track="">
      <span className="np-switch-knob" />
    </span>
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
  const rows = useSettingsRows();
  if (rows) return <SettingRow label={label} toggle={{ checked, onChange }} />;
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:var(--pf-palette-bordure)] py-3.5 last:border-b-0">
      <span
        className="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium text-[color:var(--pf-palette-texte-fort)]"
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
  const t = useT();
    const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={String(options.find((option) => option.value === value)?.label ?? '')}>
    <div>
      {hideLabel ? null : (rows ? null : <TeamGroupLabel>{label}</TeamGroupLabel>)}
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
              {t(option.label)}
            </button>
          );
        })}
      </div>
    </div>
    </SettingRow>
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
  const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={String(value ?? '')}>
    <div>
      {rows ? null : (<TeamSectionLabel>{label}</TeamSectionLabel>)}
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
    </SettingRow>
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
  const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={typeof value === 'string' && value.startsWith('#') ? value.toUpperCase() : String(value ?? '')}>
    <div>
      {rows ? null : (<TeamSectionLabel>{label}</TeamSectionLabel>)}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent p-1"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2.5 text-sm font-mono text-[color:var(--pf-palette-texte-fort)]"
          aria-label={`${label} hex`}
        />
      </div>
    </div>
    </SettingRow>
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
    return (
    <ColorSwatchRow
      label={label}
      options={PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        color: resolveHeroPaletteColor(palette, option.value),
      }))}
      value={token}
      onChange={(next) => onChange(asTeamPatch(patchTeamColorBinding(team, slot, next as HeroPaletteTokenId)))}
    />
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
function _TeamDesignSummaryRow({
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
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-[color:var(--pf-palette-bordure)] px-3 py-2.5 text-left transition hover:border-[color:var(--pf-palette-texte-muted)]"
      >
        <span className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent">
          <span className="flex w-[116px] shrink-0 origin-center scale-[1.05] items-center justify-center">
            {children}
          </span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{name}</span>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[color:var(--pf-palette-texte-muted)]" aria-hidden>
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

function TeamCatalogueThumbnail({layout}:{layout:PortfolioTeamLayout}){
  if(layout==='portrait-rail')return <TeamPortraitThumbnailFrame/>;
  if(layout==='polaroid'||layout==='profile-cards'||layout==='cover-cards'||layout==='avatar-cards'||layout==='float-cards'||layout==='floating-canvas')return <TeamPortraitThumbnailFrame design={layout}/>;
  if(layout==='spotlight')return <TeamSpotlightThumbnailFrame/>;
  if(layout==='split-screen')return <TeamSplitScreenThumbnailFrame/>;
  if(layout==='editorial-rhythm')return <TeamEditorialRhythmThumbnailFrame/>;
  if(layout==='directory')return <TeamDirectoryThumbnailFrame/>;
  return <LayoutOptionSchematic design={layout} section="team"/>;
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
  const t = useT();
  const selected =
    PORTFOLIO_TEAM_LAYOUT_OPTIONS.find((option) => option.value === value) ?? PORTFOLIO_TEAM_LAYOUT_OPTIONS[0];
  if (showGrid) {
    return (
      <div className="np-stack">
        <div className="flex flex-col gap-7" aria-label={t('Choose a design')}>
          {PORTFOLIO_TEAM_LAYOUT_OPTIONS.map((option) => (
            <div key={option.value} className="group relative">
              <button type="button" aria-pressed={value === option.value}
                onClick={() => onChange(option.value)}
                className="w-full overflow-hidden rounded-xl border p-1.5 text-left transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{borderColor:value === option.value ? 'var(--pf-palette-principal,#f97316)' : 'color-mix(in srgb,currentColor 18%,transparent)'}}>
                <TeamCatalogueThumbnail layout={option.value}/>
                <span className="block py-3 pl-2 pr-36 text-sm font-medium">{t(option.label)}</span>
              </button>
              <button type="button" aria-label={`${t('Settings')} — ${t(option.label)}`} title={t('Settings')}
                onClick={() => { onChange(option.value); setShowGrid(false); }}
                className="absolute bottom-1.5 right-3 flex min-h-11 items-center gap-2 rounded-sm px-1 text-xs font-medium text-[var(--np-muted,#a1a1aa)] opacity-0 transition-opacity hover:text-[var(--np-text,#fafafa)] group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 [@media(hover:none)]:opacity-100">
                <span>{t('Customize')}</span>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <NpBackRow title={t(selected.label)} onBack={() => setShowGrid(true)} />
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
  const t = useT();
  return (
<>
<NpCollapsibleSection title={t("Appearance")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Print color')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Print color')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_POLAROID_PHOTO_TONE_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.polaroidPhotoTone ?? 'hover')}
              label={t(option.label)}
              onClick={() => onChange({ polaroidPhotoTone: option.value })}
            >
              <TeamPolaroidToneWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div></div></NpCollapsibleSection>
<NpCollapsibleSection title={t("Layout")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Prints per row')}</TeamSectionLabel>
        <p className="mt-2 text-xs text-[color:var(--pf-palette-texte-muted)]">
          {t('Only applies to the “View all” grid — visitors toggle it from the button above the rail.')}
        </p>
        <div role="radiogroup" aria-label={t('Prints per row')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.polaroidColumns ?? 3)}
              label={t(option.label)}
              onClick={() => onChange({ polaroidColumns: option.value as PortfolioTeamRailColumns })}
            >
              <TeamRailColumnsWireframe columns={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div></div></NpCollapsibleSection>
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
  const t = useT();
  const navigation = team.railNavigation ?? 'drag';
  return (
<>
<NpCollapsibleSection title={t("Details")}><div className="space-y-5"><TeamVisibilityRow
        label={t('Show portrait numbers')}
        checked={team.railShowNumbers !== false}
        onChange={(railShowNumbers) => onChange({ railShowNumbers })}
      /></div></NpCollapsibleSection>
<NpCollapsibleSection title={t("Layout")}><div className="space-y-5"><div>
          <TeamSectionLabel>{t('Navigation')}</TeamSectionLabel>
          <div role="radiogroup" aria-label={t('Navigation')} className="mt-3 grid grid-cols-3 gap-3">
            {PORTFOLIO_TEAM_RAIL_NAVIGATION_OPTIONS.map((option) => (
              <TeamPickerCard
                key={option.value}
                active={option.value === navigation}
                label={t(option.label)}
                onClick={() => onChange({ railNavigation: option.value })}
              >
                <TeamRailNavigationWireframe value={option.value} />
              </TeamPickerCard>
            ))}
          </div>
        </div>
<div>
          <TeamSectionLabel>{t('Image height')}</TeamSectionLabel>
          <div role="radiogroup" aria-label={t('Image height')} className="mt-3 grid grid-cols-3 gap-3">
            {PORTFOLIO_TEAM_IMAGE_HEIGHT_OPTIONS.map((option) => (
              <TeamPickerCard
                key={option.value}
                active={option.value === (team.railImageHeight ?? 'tall')}
                label={t(option.label)}
                onClick={() => onChange({ railImageHeight: option.value })}
              >
                <TeamRailHeightWireframe value={option.value} />
              </TeamPickerCard>
            ))}
          </div>
        </div>
<div>
          <TeamSectionLabel>{t('Image corners')}</TeamSectionLabel>
          <div role="radiogroup" aria-label={t('Image corners')} className="mt-3 grid grid-cols-4 gap-2">
            {PORTFOLIO_TEAM_CORNER_RADIUS_OPTIONS.map((option) => (
              <TeamPickerCard
                key={option.value}
                active={option.value === (team.railImageRadius ?? 'md')}
                label={t(option.label)}
                onClick={() => onChange({ railImageRadius: option.value })}
              >
                <TeamRailRadiusWireframe value={option.value} />
              </TeamPickerCard>
            ))}
          </div>
        </div>
{navigation === 'show-all' ? (
          <div>
            <TeamSectionLabel>{t('Portraits per row')}</TeamSectionLabel>
            <div role="radiogroup" aria-label={t('Portraits per row')} className="mt-3 grid grid-cols-3 gap-3">
              {PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS.map((option) => (
                <TeamPickerCard
                  key={option.value}
                  active={option.value === (team.railColumns ?? 3)}
                  label={t(option.label)}
                  onClick={() => onChange({ railColumns: option.value as PortfolioTeamRailColumns })}
                >
                  <TeamRailColumnsWireframe columns={option.value} />
                </TeamPickerCard>
              ))}
            </div>
          </div>
        ) : null}</div></NpCollapsibleSection>
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
  const t = useT();
  const view = team.floatCardsView ?? 'grid';
  return (
<>
<NpCollapsibleSection title={t("Layout")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Opening view')}</TeamSectionLabel>
        <p className="mt-2 text-xs text-[color:var(--pf-palette-texte-muted)]">
          {t('Visitors can switch between both from the toolbar under the cards.')}
        </p>
        <div role="radiogroup" aria-label={t('Opening view')} className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_PROFILE_VIEW_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === view}
              label={t(option.label)}
              onClick={() => onChange({ floatCardsView: option.value })}
            >
              <TeamHoverViewWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Card alignment')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Card alignment')} className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_FLOAT_ALIGN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.floatCardsAlign ?? 'center')}
              label={t(option.label)}
              onClick={() => onChange({ floatCardsAlign: option.value })}
            >
              <TeamFloatAlignWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<TeamPxSlider
        label={t('Horizontal spacing')}
        value={team.floatCardsColumnGap ?? teamFloatDefaultColumnGap(team.gap)}
        min={TEAM_FLOAT_COLUMN_GAP.min}
        max={TEAM_FLOAT_COLUMN_GAP.max}
        step={TEAM_FLOAT_COLUMN_GAP.step}
        onChange={(floatCardsColumnGap) => onChange({ floatCardsColumnGap })}
      />
<div>
        <TeamSectionLabel>{t('Cards per row')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Cards per row')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.floatCardsColumns ?? 3)}
              label={t(option.label)}
              onClick={() => onChange({ floatCardsColumns: option.value as PortfolioTeamRailColumns })}
            >
              <TeamRailColumnsWireframe columns={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Grid baseline')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Grid baseline')} className="mt-3 grid grid-cols-2 gap-3">
          {[
            { value: true, label: t('Staggered') },
            { value: false, label: t('Aligned') },
          ].map((option) => (
            <TeamPickerCard
              key={String(option.value)}
              active={option.value === (team.floatCardsStagger !== false)}
              label={t(option.label)}
              onClick={() => onChange({ floatCardsStagger: option.value })}
            >
              <TeamHoverStaggerWireframe staggered={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div></div></NpCollapsibleSection>
<NpCollapsibleSection title={t("Animation")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Card motion')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Card motion')} className="mt-3 grid grid-cols-2 gap-3">
          {[
            { value: true, label: t('3D tilt') },
            { value: false, label: t('Flat') },
          ].map((option) => (
            <TeamPickerCard
              key={String(option.value)}
              active={option.value === (team.floatCardsTilt !== false)}
              label={t(option.label)}
              onClick={() => onChange({ floatCardsTilt: option.value })}
            >
              <TeamFloatTiltWireframe tilted={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div></div></NpCollapsibleSection>
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
  const t = useT();
  return (
<>
<NpCollapsibleSection title={t("Layout")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Navigation')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Navigation')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_SPOTLIGHT_NAVIGATION_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.spotlightNavigation ?? 'thumbnails')}
              label={t(option.label)}
              onClick={() => onChange({ spotlightNavigation: option.value })}
            >
              <TeamSpotlightNavigationWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Portrait side')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Portrait side')} className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_SPOTLIGHT_SIDE_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.spotlightPortraitSide ?? 'left')}
              label={t(option.label)}
              onClick={() => onChange({ spotlightPortraitSide: option.value })}
            >
              <TeamSpotlightSideWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Panel corners')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Panel corners')} className="mt-3 grid grid-cols-4 gap-2">
          {PORTFOLIO_TEAM_CORNER_RADIUS_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.spotlightPanelRadius ?? 'md')}
              label={t(option.label)}
              onClick={() => onChange({ spotlightPanelRadius: option.value })}
            >
              <TeamRailRadiusWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div></div></NpCollapsibleSection>
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
  const t = useT();
  return (
<>
<NpCollapsibleSection title={t("Portrait")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Portrait')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Portrait')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_DIRECTORY_PORTRAIT_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.directoryPortrait ?? 'cursor')}
              label={t(option.label)}
              onClick={() => onChange({ directoryPortrait: option.value })}
            >
              <TeamDirectoryPortraitWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Portrait corners')}</TeamSectionLabel>
        {/* Three per row like the Portrait group above: five across would squeeze the labels below
            the 13px minimum, and matching widths keep the band on one grid. */}
        <div role="radiogroup" aria-label={t('Portrait corners')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_AVATAR_RADIUS_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.directoryPortraitRadius ?? 'md')}
              label={t(option.label)}
              onClick={() => onChange({ directoryPortraitRadius: option.value })}
            >
              <TeamDirectoryRadiusWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div></div></NpCollapsibleSection>
<NpCollapsibleSection title={t("Layout")}><div className="space-y-5"><TeamPxSlider
        label={t('Card spacing')}
        value={team.directoryCardGap ?? teamDirectoryDefaultCardGap(team.gap)}
        min={TEAM_DIRECTORY_CARD_GAP.min}
        max={TEAM_DIRECTORY_CARD_GAP.max}
        step={TEAM_DIRECTORY_CARD_GAP.step}
        onChange={(directoryCardGap) => onChange({ directoryCardGap })}
      /></div></NpCollapsibleSection>
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
  const rows = useSettingsRows();
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <SettingRow label={label} value={String(value ?? '')}>
    <div>
      {rows ? null : (<div className="flex items-baseline justify-between gap-3">
        <TeamSectionLabel>{label}</TeamSectionLabel>
        <span className="text-[13px] font-semibold tabular-nums text-[color:var(--pf-palette-texte-muted)]">{`${value}px`}</span>
      </div>)}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={`${value}px`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="np-range mt-2"
        style={{ ['--np-fill' as string]: `${percent}%` }}
      />
    </div>
    </SettingRow>
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
  const t = useT();
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex shrink-0">
      <span
        role="button"
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={t('More info: {text}', { text })}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[color:var(--pf-palette-texte-muted)] transition hover:text-[color:var(--pf-palette-texte-fort)] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-400"
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
  getDetail,
}: {
  label: string;
  hint?: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  getDetail?: (value: T) => string;
}) {
  const t = useT();
  const rows = useSettingsRows();
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const current = options[index];
  const currentLabel = `${t(current?.label)}${current && getDetail ? ` · ${getDetail(current.value)}` : ''}`;
  return (
    <SettingRow label={label} value={currentLabel}>
    <div>
      <div className="pf-exp-centered-slider-head">
        {rows ? null : (<span className="inline-flex items-center gap-1.5">
          <TeamSectionLabel>{label}</TeamSectionLabel>
          {hint ? <TeamInfoTooltip text={hint} /> : null}
        </span>)}
        <span className="pf-exp-centered-slider-value">{currentLabel}</span>
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(options.length - 1, 0)}
        step={1}
        value={index}
        aria-label={label}
        aria-valuetext={currentLabel}
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
            {t(option.label)}
            {getDetail && <span className="mt-1 block font-normal">{getDetail(option.value)}</span>}
          </button>
        ))}
      </div>
    </div>
    </SettingRow>
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
  const t = useT();
  return (
<>
<NpCollapsibleSection title={t("Layout")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Opens on')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Opens on')} className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_PROFILE_VIEW_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.profileCardsView ?? 'grid')}
              label={t(option.label)}
              onClick={() => onChange({ profileCardsView: option.value })}
            >
              <TeamProfileViewWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Cards per row')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Cards per row')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.profileCardsColumns ?? 3)}
              label={t(option.label)}
              onClick={() => onChange({ profileCardsColumns: option.value })}
            >
              <TeamRailColumnsWireframe columns={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Card ratio')}</TeamSectionLabel>
        {/* Five steps, widest → tallest: three per row keeps every card the same size (rule 3). */}
        <div role="radiogroup" aria-label={t('Card ratio')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_PROFILE_RATIO_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.profileCardsRatio ?? 'portrait')}
              label={t(option.label)}
              onClick={() => onChange({ profileCardsRatio: option.value })}
            >
              <TeamProfileRatioWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamOptionSlider
          label={t('Column spacing')}
          hint={t('Controls the visible horizontal gap between cards in both grid and rail views.')}
          options={PORTFOLIO_TEAM_PROFILE_GUTTER_OPTIONS}
          getDetail={(value) => `${TEAM_PROFILE_GUTTER_PX[value]} px`}
          value={(team.profileCardsGutter ?? 'md') as PortfolioTeamProfileGutter}
          onChange={(profileCardsGutter) => onChange({ profileCardsGutter })}
        />
      </div></div></NpCollapsibleSection>
<NpCollapsibleSection title={t("Details")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Info panel')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Info panel')} className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_PROFILE_PANEL_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.profileCardsPanel ?? 'always')}
              label={t(option.label)}
              onClick={() => onChange({ profileCardsPanel: option.value })}
            >
              <TeamProfilePanelWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Visible at first')}</TeamSectionLabel>
        <div className="mt-3">
          <TeamOptionGrid
            label={t('Visible at first')}
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
          label={t('Staggered columns')}
          checked={team.profileCardsStagger !== false}
          onChange={(profileCardsStagger) => onChange({ profileCardsStagger })}
        />
      </div>
<div>
        <TeamVisibilityRow
          label={t('Show numbering')}
          checked={team.profileCardsShowNumbers !== false}
          onChange={(profileCardsShowNumbers) => onChange({ profileCardsShowNumbers })}
        />
      </div></div></NpCollapsibleSection>
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
  const t = useT();
  return (
<>
<NpCollapsibleSection title={t("Layout")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Opens on')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Opens on')} className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_AVATAR_VIEW_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.avatarCardsView ?? 'grid')}
              label={t(option.label)}
              onClick={() => onChange({ avatarCardsView: option.value })}
            >
              <TeamAvatarViewWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Members per row')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Members per row')} className="mt-3 grid grid-cols-4 gap-2">
          {PORTFOLIO_TEAM_AVATAR_COLUMN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.avatarCardsColumns ?? (team.columns as PortfolioTeamAvatarColumns) ?? 3)}
              label={t(option.label)}
              onClick={() => onChange({ avatarCardsColumns: option.value })}
            >
              <TeamRailColumnsWireframe columns={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Horizontal spacing')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Horizontal spacing')} className="mt-3 grid grid-cols-4 gap-2">
          {PORTFOLIO_TEAM_AVATAR_COLUMN_GAP_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.avatarCardsColumnGap ?? 'md')}
              label={`${t(option.label)} · ${TEAM_PROFILE_GUTTER_PX[option.value]} px`}
              onClick={() => onChange({ avatarCardsColumnGap: option.value })}
            >
              <TeamAvatarColumnGapWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Grid width')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Grid width')} className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_AVATAR_GRID_WIDTH_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.avatarCardsGridWidth ?? 'centered')}
              label={t(option.label)}
              onClick={() => onChange({ avatarCardsGridWidth: option.value })}
            >
              <TeamAvatarGridWidthWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div></div></NpCollapsibleSection>
<NpCollapsibleSection title={t("Appearance")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Hover shape')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Hover shape')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_AVATAR_SHAPE_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.avatarCardsShape ?? 'squircle')}
              label={t(option.label)}
              onClick={() => onChange({ avatarCardsShape: option.value })}
            >
              <TeamAvatarShapeWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamVisibilityRow
          label={t('Staggered rows')}
          checked={team.avatarCardsStagger !== false}
          onChange={(avatarCardsStagger) => onChange({ avatarCardsStagger })}
        />
        <TeamVisibilityRow
          label={t('Avatar glow')}
          checked={team.avatarCardsGlow !== false}
          onChange={(avatarCardsGlow) => onChange({ avatarCardsGlow })}
        />
      </div></div></NpCollapsibleSection>
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
  const t = useT();
  return (
<>
<NpCollapsibleSection title={t("Portrait")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Portrait side')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Portrait side')} className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_SPOTLIGHT_SIDE_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.splitPortraitSide ?? 'right')}
              label={t(option.label)}
              onClick={() => onChange({ splitPortraitSide: option.value })}
            >
              <TeamSplitSideWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Portrait tone')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Portrait tone')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_POLAROID_PHOTO_TONE_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.splitPhotoTone ?? 'monochrome')}
              label={t(option.label)}
              onClick={() => onChange({ splitPhotoTone: option.value })}
            >
              <TeamSplitToneWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Portrait corners')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Portrait corners')} className="mt-3 grid grid-cols-4 gap-2">
          {PORTFOLIO_TEAM_CORNER_RADIUS_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.splitPanelRadius ?? 'none')}
              label={t(option.label)}
              onClick={() => onChange({ splitPanelRadius: option.value })}
            >
              <TeamSplitRadiusWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div></div></NpCollapsibleSection>
<NpCollapsibleSection title={t("Details")}><div className="space-y-5"><div>
        <TeamVisibilityRow
          label={t('Show numbering')}
          checked={team.splitShowNumbers !== false}
          onChange={(splitShowNumbers) => onChange({ splitShowNumbers })}
        />
      </div>
<div>
        <TeamVisibilityRow
          label={t('Social links behind a button')}
          checked={team.splitSocialsReveal !== false}
          onChange={(splitSocialsReveal) => onChange({ splitSocialsReveal })}
        />
      </div></div></NpCollapsibleSection>
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
  const t = useT();
  return (
<>
<NpCollapsibleSection title={t("Layout")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Cards per row')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Cards per row')} className="mt-3 grid grid-cols-3 gap-3">
          {PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.canvasColumns ?? 3)}
              label={t(option.label)}
              onClick={() => onChange({ canvasColumns: option.value as PortfolioTeamRailColumns })}
            >
              <TeamRailColumnsWireframe columns={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div>
<div>
        <TeamSectionLabel>{t('Composition width')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Composition width')} className="mt-3 grid grid-cols-2 gap-3">
          {PORTFOLIO_TEAM_FLOAT_ALIGN_OPTIONS.map((option) => (
            <TeamPickerCard
              key={option.value}
              active={option.value === (team.canvasAlign ?? 'center')}
              label={t(option.label)}
              onClick={() => onChange({ canvasAlign: option.value })}
            >
              <TeamFloatAlignWireframe value={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div></div></NpCollapsibleSection>
<NpCollapsibleSection title={t("Animation")}><div className="space-y-5"><div>
        <TeamSectionLabel>{t('Scroll parallax')}</TeamSectionLabel>
        <div role="radiogroup" aria-label={t('Scroll parallax')} className="mt-3 grid grid-cols-2 gap-3">
          {[
            { value: true, label: t('On') },
            { value: false, label: t('Off') },
          ].map((option) => (
            <TeamPickerCard
              key={String(option.value)}
              active={option.value === (team.canvasParallax !== false)}
              label={t(option.label)}
              onClick={() => onChange({ canvasParallax: option.value })}
            >
              <TeamCanvasParallaxWireframe active={option.value} />
            </TeamPickerCard>
          ))}
        </div>
      </div></div></NpCollapsibleSection>
<NpCollapsibleSection title={t("Text")}><div className="space-y-5"><TeamTextField
        label={t('Editorial label')}
        value={team.canvasEditorialLabel}
        placeholder={t('Studio note')}
        onChange={(canvasEditorialLabel) => onChange({ canvasEditorialLabel })}
      />
<TeamTextField
        label={t('Editorial text')}
        value={team.canvasEditorialText}
        placeholder={t('A small collective of specialists who each choose their own tools…')}
        onChange={(canvasEditorialText) => onChange({ canvasEditorialText })}
        multiline
      /></div></NpCollapsibleSection>
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
    ) : team.layout === 'cover-cards' ? (
      <TeamProfileCardsLayoutFields team={teamHoverVeilPresentation(team)} onChange={patch => onChange(teamProfilePatchToHoverVeil(patch))} />
    ) : team.layout === 'avatar-cards' ? (
      <TeamAvatarCardsLayoutFields team={team} onChange={onChange} />
    ) : team.layout === 'floating-canvas' ? (
      <TeamFloatingCanvasLayoutFields team={team} onChange={onChange} />
    ) : null;
  if (!fields) return null;
  return (
    <div className="pf-team-design-settings">{fields}</div>
  );
}

/** One wireframe per Header design — the shared 8-design GSAP header mounted above the
 *  Team section, independent of the section's own member `layout`. */
function TeamHeaderWireframe({design}:{design:PortfolioTeamHeaderDesign}){
 return <StackPreviewSkeleton section="team"><StackHeaderSkeleton design={design} compact word="TEAM" title="Notre équipe" lead="Notre" count="04"/></StackPreviewSkeleton>;
}

function TeamHeaderDesignGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioTeamHeaderDesign;onChange:(value:PortfolioTeamHeaderDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const theme=useThumbnailTheme('team');
 const selected=PORTFOLIO_TEAM_HEADER_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_TEAM_HEADER_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return <div className="flex flex-col gap-8" aria-label={t('Choose a header')}>
  {PORTFOLIO_TEAM_HEADER_DESIGN_OPTIONS.map(option=>{
   if(option.value==='none')return <button
    key={option.value}
    type="button"
    aria-pressed={value===option.value}
    onClick={()=>onChange(option.value)}
    className="flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-sm font-medium transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2"
    style={{borderColor:value===option.value?'var(--pf-palette-principal,#f97316)':'color-mix(in srgb,currentColor 18%,transparent)'}}
   >{t(option.label)}</button>;
   const skeleton=<TeamHeaderWireframe design={option.value}/>;
   return <PortfolioHeaderDesignOption key={option.value} design={option.value}><DesignCatalogueCard label={t(option.label)} selected={value===option.value} previewBackground={theme.background} onSelect={()=>onChange(option.value)} onCustomize={()=>{if(value!==option.value)onChange(option.value);setShowGrid(false);}}><span className="relative block aspect-[3/1] w-full" style={{backgroundColor:theme.background}}>{previewSource?<PortfolioDesignLivePreview src={withDesignPreview(previewSource.portfolioPath,{section:'teamHeader',design:option.value})+'&previewRevision=team-header-compact-v3'} settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={skeleton} animateSkeleton={false} backgroundColor={theme.background}/>:skeleton}</span></DesignCatalogueCard></PortfolioHeaderDesignOption>;
  })}
 </div>;
}


/** The Footer's settings band — one titled card under a design picker. */
function _TeamSettingsBand({
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
      <h3 id={id} className="sr-only">
        {title}
      </h3>
      <div key={motionKey} className="pf-exp-layout-settings-body space-y-7">
        {children}
      </div>
    </section>
  );
}

const TEAM_HEADER_COPY: HeaderCopy = {
  editorial: { label: msg('Team'), title: msg('Meet the team'), subtitle: msg('The people behind every project, in one place.') },
  index: { rule: 'Index', title: msg('Meet the team'), subtitle: msg('The people behind every project, in one place.'), count: 'Members' },
  marquee: ['Team', 'Optional', 'Optional', 'Optional'],
  accent: { badge: '{count}+ members', lead: 'A small team of people who make it happen.' },
  serif: { label: msg('Team'), title: msg('A small group of people who make everything happen.'), subtitle: msg('The people behind every project, in one place.') },
  billboard: { word: 'TEAM', title: msg('Meet the team'), count: '{count} people — meet the team below' },
  masthead: ['Real people.', 'Chosen with care.', 'Built to deliver.'],
  split: { title: msg('Meet the team'), label: msg('Team') },
};

/** The Header tab body: this design's texts, one style editor, then the controls every design shares. */
function TeamHeaderDesignFields({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: (patch: Partial<PortfolioTeamSectionSettings>) => void;
}) {
  const onPatch = (patch: HeaderPatch) => onChange(patch as Partial<PortfolioTeamSectionSettings>);
  return (
    <HeaderDesignFields
      settings={team}
      onPatch={onPatch}
      copy={TEAM_HEADER_COPY}
      colorOptions={TEAM_HEADER_PALETTE_TOKEN_OPTIONS}
      resolveColor={teamHeaderPaletteTokenColor}
      accentAlignmentOptions={TEAM_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
      billboardStyleOptions={TEAM_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
    />
  );
}

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
  chrome,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: TeamPatch;
  subSection?: TeamSubSection;
  onSubSectionChange?: (value: TeamSubSection) => void;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const backgroundTheme = useThumbnailTheme('team');
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(true);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<TeamSubSection>('general');
  const subSection = normalizeTeamSubSection(controlledSubSection ?? uncontrolledSubSection);
  const [previousSubSection, setPreviousSubSection] = useState(subSection);
  if (previousSubSection !== subSection) {
    setPreviousSubSection(subSection);
    if (subSection === 'design') setDesignCatalogOpen(true);
    if (subSection === 'header') setHeaderCatalogOpen(true);
  }
  const setSubSection = (value: TeamSubSection) => {
    const next = normalizeTeamSubSection(value);
    if (next === 'design') setDesignCatalogOpen(true);
    if (next === 'header') setHeaderCatalogOpen(true);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };

  const defaults: PortfolioTeamSectionSettings = { enabled: true, title: 'Team', subtitle: 'The people who bring every project to life.', ...DEFAULT_TEAM_PRESENTATION };
  return (
    <NpPanelShell title={t('Team')} modified={JSON.stringify(team) !== JSON.stringify(defaults)} tabs={TEAM_SUB_SECTIONS.map((item) => ({ id: item.id, label: t(item.label) }))} activeTab={subSection} onTabChange={setSubSection} onReset={() => onChange(defaults)} chrome={chrome}>

      {subSection === 'general' ? (
        <div className="np-stack">
          <NpToggleRow card title={t('Show Team section')} description={team.enabled !== false ? undefined : t('Visitors go straight to the next section.')} checked={team.enabled !== false} onChange={(enabled) => onChange({ enabled })} />
          <div className="pb-6"><SectionColorModeControl hideLabel
              label={t('Color mode')}
              value={team.colorModeOverride}
              onChange={(colorModeOverride) => onChange({ colorModeOverride })}
            /></div>
          <div className="np-dimmable" data-disabled={team.enabled !== false ? 'false' : 'true'} inert={team.enabled === false}>
          <NpCollapsibleSection title={t('Content shown')}>
              {/* Split screen is built around the portrait — it always shows it. */}
              {team.layout === 'split-screen' ? null : (
                <NpToggleRow
                  title={t('Member photo')}
                  checked={team.showImage}
                  onChange={(showImage) => onChange({ showImage })}
                />
              )}
              <NpToggleRow
                title={t('Member name')}
                checked={team.showName}
                onChange={(showName) => onChange({ showName })}
              />
              <NpToggleRow
                title={t('Role')}
                checked={team.showResponsibility}
                onChange={(showResponsibility) => onChange({ showResponsibility })}
              />
              <NpToggleRow
                title={t('Social links')}
                checked={team.showSocials}
                onChange={(showSocials) => onChange({ showSocials })}
              />
          </NpCollapsibleSection>
          
          </div>
        </div>
      ) : null}

      {subSection !== 'general' && team.enabled === false ? <div className="np-stack"><NpToggleRow card title={t('This section is hidden')} description={t('Enable it to edit its settings and make it visible on the portfolio.')} checked={false} onChange={() => onChange({ enabled: true })} /></div> : null}

      {subSection === 'design' && team.enabled !== false ? (
        <div className="np-stack">
          <TeamLayoutChoiceGrid
            showGrid={designCatalogOpen}
            setShowGrid={setDesignCatalogOpen}
            value={team.layout}
            onChange={(layout) => onChange({ layout })}
          />
          {designCatalogOpen ? null : (
            <>
              <TeamLayoutSettingsBand team={team} onChange={onChange} />
            </>
          )}
          {designCatalogOpen ? null : (
            <CardsStyleControls
              value={team.cardsStyle ?? DEFAULT_CARDS_STYLE}
              onChange={(cardsStyle) => onChange({ cardsStyle })}
              palette={team.teamPalette}
            />
          )}
          {designCatalogOpen ? null : (
          <NpCollapsibleSection title={t('Style')}>

          <TextSizeSlider label={t('Text size')} options={PORTFOLIO_TEAM_PREMIUM_FONT_SIZE_OPTIONS} value={team.premiumFontSize ?? 'medium'} onChange={(premiumFontSize) => onChange({ premiumFontSize })} />
          </NpCollapsibleSection>
          )}
        </div>
      ) : null}

      {subSection === 'background' && team.enabled !== false ? (
        <div className="np-stack"><NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl
              value={team.paletteFamily ?? 'global'}
              onChange={(paletteFamily) => onChange({ paletteFamily })}
              mode={backgroundTheme.mode}
            />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Background')}>
          <SectionBackgroundSettingsFields
            settings={team}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onColorChange }) => {
              const slot = Object.entries(TEAM_BACKGROUND_LABEL_SLOTS).find(([key]) => t(key) === label)?.[1];
              const options = ([['fond', 'Background'], ['neutre', 'Surface'], ['principal', 'Primary'], ['secondaire', 'Secondary'], ['texteFort', 'Strong text']] as const).map(([token, text]) => ({ value: token, label: t(text), color: backgroundTheme.palette[token] }));
              const bindings = mergeTeamColorBindings(DEFAULT_TEAM_COLOR_BINDINGS, team.teamColorBindings);
              return <ColorSwatchRow label={label} options={options} value={slot ? bindings[slot] : options.find(option => option.color.toLowerCase() === value.toLowerCase())?.value ?? ''} onChange={token => {
                if (slot) onChange({ useHeroPalette: true, teamPalette: backgroundTheme.palette, ...asTeamPatch(patchTeamColorBinding({ ...team, teamPalette: backgroundTheme.palette }, slot, token as HeroPaletteTokenId)) });
                else { const option = options.find(option => option.value === token); if (option) onColorChange(option.color); }
              }} />;
            }}
          />
        </NpCollapsibleSection></div>
      ) : null}

      {subSection === 'header' && team.enabled !== false ? (
        <div className="np-stack">
          <TeamHeaderDesignGrid
            value={team.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
            open={headerCatalogOpen}
            onOpenChange={setHeaderCatalogOpen}
          />

          {/* Browsing the catalog is a different task from tuning the chosen design: no settings below it. */}
          {headerCatalogOpen || team.headerDesign === 'none' ? null : (
            <NpCollapsibleSection title={t('Header settings')}>
              <TeamHeaderDesignFields team={team} onChange={onChange} />
            </NpCollapsibleSection>
          )}
        </div>
      ) : null}
    </NpPanelShell>
  );
}
