'use client';

import { useId, useState, type ReactNode } from 'react';
import {
  PORTFOLIO_WORK_CARD_BORDER_OPTIONS,
  PORTFOLIO_WORK_CARD_RADIUS_OPTIONS,
  PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS,
  PORTFOLIO_WORK_ACCORDION_ALIGN_OPTIONS,
  PORTFOLIO_WORK_ACCORDION_PREVIEW_SIDE_OPTIONS,
  PORTFOLIO_WORK_FRAMES_THUMBNAIL_SIZE_OPTIONS,
  PORTFOLIO_WORK_FRAMES_IMAGE_SIDE_OPTIONS,
  PORTFOLIO_WORK_FRAMES_RADIUS_OPTIONS,
  PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS,
  PORTFOLIO_WORK_INDEX_ROW_GAP_OPTIONS,
  PORTFOLIO_WORK_INDEX_MARKER_OPTIONS,
  workSectionDesignSettingsPatch,
  DEFAULT_PROJECTS_BOARD_SETTINGS,
  DEFAULT_PROJECTS_ACCORDION_SETTINGS,
  DEFAULT_PROJECTS_FRAMES_SETTINGS,
  DEFAULT_PROJECTS_INDEX_SETTINGS,
  PORTFOLIO_WORK_GRID_COLUMNS_OPTIONS,
  DEFAULT_PROJECTS_GRID_SETTINGS,
  DEFAULT_PROJECTS_SPLIT_SETTINGS,
  DEFAULT_PROJECTS_CAROUSEL_SETTINGS,
  DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS,
  DEFAULT_PROJECTS_SHOWCASE_SETTINGS,
  DEFAULT_PROJECTS_EDITORIAL_SETTINGS,
  DEFAULT_PROJECTS_LEDGER_SETTINGS,
  DEFAULT_PROJECTS_FOLIO_SETTINGS,
  DEFAULT_PROJECTS_SPEC_SETTINGS,
  DEFAULT_PROJECTS_CASE_SETTINGS,
  PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS,
  PORTFOLIO_WORK_SPEC_CONSULT_DESIGN_OPTIONS,
  PORTFOLIO_WORK_SPEC_COLUMNS_OPTIONS,
  PORTFOLIO_WORK_SPEC_FRAME_OPTIONS,
  PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS,
  PORTFOLIO_WORK_FOLIO_STACK_DESIGN_OPTIONS,
  PORTFOLIO_WORK_EDITORIAL_RIGHT_PANEL_OPTIONS,
  PORTFOLIO_WORK_LEDGER_EXPAND_OPTIONS,
  PORTFOLIO_WORK_SPLIT_THUMBNAIL_SIZE_OPTIONS,
  PORTFOLIO_WORK_SPLIT_RADIUS_OPTIONS,
  PORTFOLIO_WORK_SPLIT_ROW_GAP_OPTIONS,
  PORTFOLIO_WORK_SPLIT_IMAGE_SIDE_OPTIONS,
  PORTFOLIO_WORK_SPLIT_TITLE_SIDE_OPTIONS,
  PORTFOLIO_WORK_SPLIT_TITLE_VERTICAL_OPTIONS,
  PORTFOLIO_WORK_SPLIT_DESCRIPTION_PLACEMENT_OPTIONS,
  PORTFOLIO_WORK_SPLIT_DESCRIPTION_VERTICAL_OPTIONS,
  PORTFOLIO_WORK_CAROUSEL_IMAGE_SIZE_OPTIONS,
  PORTFOLIO_WORK_CAROUSEL_RADIUS_OPTIONS,
  PORTFOLIO_WORK_CAROUSEL_ASPECT_OPTIONS,
  PORTFOLIO_WORK_CAROUSEL_GAP_OPTIONS,
  PORTFOLIO_WORK_SPOTLIGHT_LIST_SIDE_OPTIONS,
  PORTFOLIO_WORK_SPOTLIGHT_STACK_STYLE_OPTIONS,
  PORTFOLIO_WORK_SHOWCASE_MEDIA_SIDE_OPTIONS,
  PORTFOLIO_WORK_SHOWCASE_RADIUS_OPTIONS,
  PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS,
  PORTFOLIO_WORK_SECTION_LAYOUT_OPTIONS,
  workSectionLayoutIsAside,
  type PortfolioWorkHeaderDesign,
  type PortfolioWorkProjectsSpecConsultDesign,
  type PortfolioWorkSectionDesign,
  type PortfolioWorkSectionSettings,
} from '@/components/portfolio/portfolio-work-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import {
  DEFAULT_WORK_COLOR_BINDINGS,
  DEFAULT_WORK_PALETTE,
  mergeWorkColorBindings,
  mergeWorkPalette,
  patchWorkColorBinding,
  patchWorkColorField,
  patchWorkColorFieldManual,
  type WorkColorSlot,
} from '@/components/portfolio/portfolio-work-palette-settings';

export type WorkSettingsSubSection =
  | 'general'
  | 'header'
  | 'design'
  | 'background'
  /** @deprecated Categories / Cards / Media / Title / Description / Tools / CTA / Palette now live under Design */
  | 'categories'
  | 'cards'
  | 'media'
  | 'title'
  | 'description'
  | 'tools'
  | 'cta'
  | 'palette'
  /** @deprecated Prefer Design */
  | 'style';

const WORK_SETTINGS_SUB_SECTIONS: {
  id: Exclude<WorkSettingsSubSection, 'style' | 'categories' | 'cards' | 'media' | 'title' | 'description' | 'tools' | 'cta' | 'palette'>;
  label: string;
  description: string;
}[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Content is edited in Creator Studio → Information — this tab only controls visibility & presentation.',
  },
  { id: 'header', label: 'Header', description: 'Title and subtitle presets, fonts, and colors.' },
  {
    id: 'design',
    label: 'Design',
    description: 'Named Portfolio layouts — projects board, accordion, frames, and more.',
  },
  { id: 'background', label: 'Background', description: 'Section fill, gradients, and opacity.' },
];

/** Map legacy subsection ids (saved UI state / search) to the current 4-tab menu. */
export function normalizeWorkSettingsSubSection(value: string | undefined): WorkSettingsSubSection {
  if (value === 'general' || value === 'header' || value === 'design' || value === 'background') {
    return value;
  }
  if (
    value === 'style' ||
    value === 'categories' ||
    value === 'cards' ||
    value === 'media' ||
    value === 'title' ||
    value === 'description' ||
    value === 'tools' ||
    value === 'cta' ||
    value === 'palette'
  ) {
    return 'design';
  }
  return 'header';
}

const WORK_BACKGROUND_LABEL_SLOTS: Record<string, WorkColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Couleur zone haut': 'sectionSplitA',
  'Couleur zone gauche': 'sectionSplitA',
  'Couleur zone bas': 'sectionSplitB',
  'Couleur zone droite': 'sectionSplitB',
  'Couleur de la ligne': 'sectionDivider',
};

function asWorkPatch(
  patch: Record<string, unknown> | object
): Partial<PortfolioWorkSectionSettings> {
  return patch as Partial<PortfolioWorkSectionSettings>;
}

function WorkColorField({
  work,
  onChange,
  slot,
  label,
  description,
  value,
  allowManualHex = false,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  slot: WorkColorSlot;
  label: string;
  description?: string;
  value: string;
  /** When palette is on, also show a hex picker that overrides the token until rebound. */
  allowManualHex?: boolean;
}) {
  const paletteOn = work.useHeroPalette !== false;
  const isManualOverride =
    (slot === 'contentFrameBackground' && work.contentFrameBackgroundManual) ||
    (slot === 'contentFrameBorder' && work.contentFrameBorderManual) ||
    (slot === 'overlayBottomRule' && work.overlayBottomRuleManual);

  if (!paletteOn) {
    return (
      <WorkManualColorField
        label={label}
        description={description}
        value={value}
        onChange={(hex) => onChange(asWorkPatch(patchWorkColorField(work, slot, hex)))}
      />
    );
  }

  const palette = mergeWorkPalette(DEFAULT_WORK_PALETTE, work.workPalette);
  const bindings = mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, work.workColorBindings);
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
            {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
          </div>
          <span
            className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-neutral-200"
            style={{ backgroundColor: isManualOverride ? value : resolved }}
            title={isManualOverride ? value : resolved}
            aria-hidden
          />
        </div>
        <select
          value={token}
          onChange={(event) =>
            onChange(
              asWorkPatch(
                patchWorkColorBinding(work, slot, event.target.value as HeroPaletteTokenId)
              )
            )
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
        {!allowManualHex ? (
          <p className="text-xs text-neutral-500">
            Bound to token · edit hex under{' '}
            <span className="font-semibold text-neutral-700">Global → Theme</span>
          </p>
        ) : (
          <p className="text-xs text-neutral-500">
            Token palette{isManualOverride ? ' · override manuel actif' : ''} · changez le token pour
            resynchroniser.
          </p>
        )}
      </div>

      {allowManualHex ? (
        <WorkManualColorField
          label="Couleur manuelle"
          description="Hex indépendant du token. Changer le token ci-dessus annule l’override."
          value={value}
          onChange={(hex) => onChange(asWorkPatch(patchWorkColorFieldManual(work, slot, hex)))}
        />
      ) : null}
    </div>
  );
}

function WorkManualColorField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
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
        <span
          className="h-11 w-20 rounded-xl border border-neutral-200/80 shadow-inner"
          style={{ backgroundColor: value }}
          aria-hidden
        />
      </div>
    </div>
  );
}

/** Premium switch track. The off-state fill is mixed toward `transparent` (not toward
 *  `--pf-palette-fond`) plus a visible border, so it never blends into a page whose
 *  background happens to be close to the same token — off-state contrast is guaranteed
 *  regardless of light/dark theme, not just on-state. */
function WorkSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span className="pf-work-switch" data-checked={checked ? 'true' : 'false'}>
      <span className="pf-work-switch-thumb" />
    </span>
  );
}

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus
 *  instead of a permanent line of text under a toggle. */
function WorkInfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
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
      </button>
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

function WorkSectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{children}</p>;
}

function WorkToggleRow({
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
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200/80 py-3.5 last:border-b-0">
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className="min-w-0 cursor-pointer truncate text-sm font-semibold text-neutral-950"
          onClick={() => onChange(!checked)}
        >
          {label}
        </span>
        {info ? <WorkInfoTooltip text={info} /> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="shrink-0"
      >
        <WorkSwitchTrack checked={checked} />
      </button>
    </div>
  );
}

function WorkOptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns = 2,
  icons,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4;
  icons?: Partial<Record<string, ReactNode>>;
}) {
  const compact = columns === options.length && options.length >= 2 && options.length <= 5;
  return (
    <div>
      <p className="pf-work-block-label pf-work-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-work-segment grid gap-[3px] p-[3px]"
        data-compact={compact ? 'true' : 'false'}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value;
          const icon = icons?.[String(option.value)];
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              title={option.description}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-work-segment-btn flex items-center justify-center gap-1 px-2.5 py-1.5 text-center text-[13px] font-medium tracking-tight"
            >
              {icon ? <span className="pf-work-segment-icon">{icon}</span> : null}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Ordered/continuous-scale control (size, spacing) — a single drag surface snapping
 *  between the option's discrete steps, with the current step named live. */
function WorkSlider<T extends string>({
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
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const lastIndex = options.length - 1;
  const percent = lastIndex > 0 ? (index / lastIndex) * 100 : 0;
  const current = options[index] ?? options[0];
  return (
    <div>
      <div className="pf-work-slider-row">
        <span className="pf-work-slider-label">{label}</span>
        <span className="pf-work-slider-value">{current?.label}</span>
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
        className="pf-work-slider-input"
        style={{
          background: `linear-gradient(to right, var(--pf-palette-texte-fort, #f5f5f5) ${percent}%, color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 16%, var(--pf-palette-fond, #0a0a0a)) ${percent}%)`,
        }}
      />
    </div>
  );
}

function WorkMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-work-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-work-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function WorkPickerCard({
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
  /** Smaller padding/type for secondary preview-card grids. */
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
      className={`pf-work-design-card rounded-2xl text-left ${compact ? 'pf-work-preview-card' : 'px-3 pb-3 pt-2.5'}`}
    >
      {children}
      <span className={compact ? 'mt-1.5 block' : 'mt-2.5 block'}>
        <span
          className={`pf-work-card-label min-w-0 font-semibold leading-none tracking-tight ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

/** Visual-difference choice (style, layout) — a compact preview card per option so the
 *  difference reads at a glance instead of via a label alone. */
function WorkPreviewCardGrid<T extends string>({
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
      <p className="pf-work-block-label pf-work-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <WorkPickerCard
            key={option.value}
            active={option.value === value}
            label={option.label}
            onClick={() => onChange(option.value)}
            compact
          >
            <svg viewBox="0 0 64 34" className="pf-work-mini h-full w-full" aria-hidden>
              <rect className="pf-work-mini-stage" x="0.75" y="0.75" width="62.5" height="32.5" rx="6" />
              {option.glyph}
            </svg>
          </WorkPickerCard>
        ))}
      </div>
    </div>
  );
}

/** Wraps the per-layout settings body, remounted (via `motionKey`) so switching the
 *  chosen Portfolio layout cross-fades/slides the settings body in. */
function WorkLayoutSettingsBand({
  children,
  motionKey,
  title = 'Design settings',
}: {
  children: ReactNode;
  motionKey: string;
  title?: string;
}) {
  if (!children) return null;
  return (
    <section className="pf-work-layout-settings" aria-labelledby="work-layout-settings-title">
      <h3 id="work-layout-settings-title" className="pf-work-layout-settings-title">
        {title}
      </h3>
      <div key={motionKey} className="pf-work-layout-settings-body space-y-6">
        {children}
      </div>
    </section>
  );
}

/** Minimalist text-alignment glyphs, shared by every alignment-type WorkOptionGrid via `icons`. */
function WorkAlignLeftIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="0" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="0" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function WorkAlignCenterIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="3" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="1.5" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function WorkAlignRightIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="6" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="3" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

const WORK_ALIGNMENT_ICONS: Partial<Record<string, ReactNode>> = {
  left: <WorkAlignLeftIcon />,
  center: <WorkAlignCenterIcon />,
  right: <WorkAlignRightIcon />,
};

/** N evenly spaced bars — glyph for "columns per row" preview cards. */
function workColumnsGlyph(n: 1 | 2 | 3 | 4): ReactNode {
  const gap = 4;
  const totalWidth = 48;
  const startX = 8;
  const barWidth = (totalWidth - gap * (n - 1)) / n;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          className="pf-work-mini-ink"
          x={startX + i * (barWidth + gap)}
          y={8}
          width={barWidth}
          height={18}
          rx={2}
        />
      ))}
    </>
  );
}

/** Media-on-left / media-on-right glyphs for the various image-side pickers. */
function workSideLeftGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-work-mini-ink" x="8" y="9" width="22" height="16" rx="2" />
      <rect className="pf-work-mini-mute" x="36" y="10" width="20" height="3" rx="1.5" />
      <rect className="pf-work-mini-mute" x="36" y="16" width="20" height="3" rx="1.5" />
      <rect className="pf-work-mini-mute" x="36" y="22" width="14" height="3" rx="1.5" />
    </>
  );
}

function workSideRightGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-work-mini-mute" x="8" y="10" width="20" height="3" rx="1.5" />
      <rect className="pf-work-mini-mute" x="8" y="16" width="20" height="3" rx="1.5" />
      <rect className="pf-work-mini-mute" x="8" y="22" width="14" height="3" rx="1.5" />
      <rect className="pf-work-mini-ink" x="34" y="9" width="22" height="16" rx="2" />
    </>
  );
}

/** A small "Go" label rendered in the button-preview glyphs below. */
function workConsultGoLabel(fill?: string): ReactNode {
  return (
    <text
      x="32"
      y="20.5"
      textAnchor="middle"
      fontSize="9"
      fontWeight={700}
      className={fill ? undefined : 'pf-work-mini-ink'}
      fill={fill}
    >
      Go
    </text>
  );
}

/** Mini button-style previews for the "Consult design" picker — one real rendering
 *  of each button treatment instead of a plain word. */
function workConsultDesignGlyph(design: PortfolioWorkProjectsSpecConsultDesign): ReactNode {
  switch (design) {
    case 'bracket':
      return (
        <>
          <path d="M21 12 L17 12 L17 22 L21 22" className="pf-work-mini-mute" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M43 12 L47 12 L47 22 L43 22" className="pf-work-mini-mute" fill="none" stroke="currentColor" strokeWidth="1.2" />
          {workConsultGoLabel()}
        </>
      );
    case 'link':
      return (
        <>
          {workConsultGoLabel()}
          <path
            d="M44 15 L49 10 M49 10 L45 10 M49 10 L49 14"
            className="pf-work-mini-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case 'underline':
      return (
        <>
          {workConsultGoLabel()}
          <rect className="pf-work-mini-accent" x="24" y="23.5" width="16" height="1.4" rx="0.7" />
        </>
      );
    case 'footer':
      return (
        <>
          <rect className="pf-work-mini-mute" x="10" y="8" width="44" height="1" />
          {workConsultGoLabel()}
        </>
      );
    case 'pill':
      return (
        <>
          <rect className="pf-work-mini-accent" x="18" y="11" width="28" height="12" rx="6" />
          {workConsultGoLabel('var(--pf-palette-fond, #ffffff)')}
        </>
      );
    case 'outline':
      return (
        <>
          <rect className="pf-work-mini-ring" x="18" y="11" width="28" height="12" rx="3" strokeWidth="1.2" />
          {workConsultGoLabel()}
        </>
      );
    case 'ghost':
      return (
        <>
          <rect className="pf-work-mini-mute" x="18" y="11" width="28" height="12" rx="3" opacity={0.6} />
          {workConsultGoLabel()}
        </>
      );
    case 'solid':
      return (
        <>
          <rect className="pf-work-mini-ink" x="18" y="11" width="28" height="12" rx="2.5" />
          {workConsultGoLabel('var(--pf-palette-fond, #ffffff)')}
        </>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Mini wireframes for the 14 "Section design" picker cards. */
function WorkDesignWireframe({ design }: { design: PortfolioWorkSectionDesign }) {
  switch (design) {
    case 'projects-board':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="10" y="10" width="44" height="26" rx="2" />
          <rect className="pf-work-mini-ink" x="66" y="10" width="44" height="26" rx="2" />
          <rect className="pf-work-mini-mute" x="10" y="42" width="40" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="66" y="42" width="40" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="10" y="49" width="28" height="2.4" rx="1.2" />
          <rect className="pf-work-mini-mute" x="66" y="49" width="28" height="2.4" rx="1.2" />
        </WorkMiniSlide>
      );
    case 'projects-accordion':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="10" y="10" width="34" height="8" rx="2" />
          <rect className="pf-work-mini-mute" x="10" y="22" width="34" height="8" rx="2" />
          <rect className="pf-work-mini-mute" x="10" y="34" width="34" height="8" rx="2" />
          <rect className="pf-work-mini-mute" x="10" y="46" width="34" height="8" rx="2" />
          <rect className="pf-work-mini-ring" x="52" y="10" width="58" height="44" rx="3" />
        </WorkMiniSlide>
      );
    case 'projects-frames':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="10" y="10" width="34" height="34" rx="2" />
          <rect className="pf-work-mini-mute" x="52" y="14" width="50" height="4" rx="2" />
          <rect className="pf-work-mini-mute" x="52" y="24" width="40" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="52" y="31" width="44" height="3" rx="1.5" />
          <rect className="pf-work-mini-accent" x="52" y="40" width="20" height="3" rx="1.5" />
        </WorkMiniSlide>
      );
    case 'projects-index':
      return (
        <WorkMiniSlide>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <WorkMiniType x={10} y={16 + i * 15} size={7}>{`0${i + 1}`}</WorkMiniType>
              <rect className="pf-work-mini-ink" x="26" y={12 + i * 15} width="34" height="4" rx="2" />
              <rect className="pf-work-mini-mute" x="66" y={12 + i * 15} width="40" height="4" rx="2" />
              <rect className="pf-work-mini-mute" x="10" y={22 + i * 15} width="96" height="1" />
            </g>
          ))}
        </WorkMiniSlide>
      );
    case 'projects-grid':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="9" y="9" width="30" height="20" rx="2" />
          <rect className="pf-work-mini-ink" x="45" y="9" width="30" height="20" rx="2" />
          <rect className="pf-work-mini-ink" x="81" y="9" width="30" height="20" rx="2" />
          <rect className="pf-work-mini-mute" x="9" y="33" width="26" height="2.4" rx="1.2" />
          <rect className="pf-work-mini-mute" x="45" y="33" width="26" height="2.4" rx="1.2" />
          <rect className="pf-work-mini-mute" x="81" y="33" width="26" height="2.4" rx="1.2" />
        </WorkMiniSlide>
      );
    case 'projects-split':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="10" y="8" width="48" height="48" rx="2" />
          <rect className="pf-work-mini-mute" x="66" y="10" width="42" height="4" rx="2" />
          <rect className="pf-work-mini-mute" x="66" y="19" width="34" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="66" y="26" width="38" height="3" rx="1.5" />
        </WorkMiniSlide>
      );
    case 'projects-carousel':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-mute" x="4" y="14" width="26" height="36" rx="2" />
          <rect className="pf-work-mini-ink" x="35" y="10" width="34" height="44" rx="2" />
          <rect className="pf-work-mini-mute" x="74" y="14" width="26" height="36" rx="2" />
          <rect className="pf-work-mini-mute" x="105" y="18" width="14" height="28" rx="2" opacity={0.5} />
        </WorkMiniSlide>
      );
    case 'projects-spotlight':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ring" x="9" y="9" width="42" height="46" rx="3" />
          <rect className="pf-work-mini-mute" x="17" y="18" width="26" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="17" y="26" width="22" height="2.4" rx="1.2" />
          <rect className="pf-work-mini-ink" x="60" y="10" width="46" height="7" rx="2" />
          <rect className="pf-work-mini-mute" x="60" y="22" width="46" height="7" rx="2" />
          <rect className="pf-work-mini-mute" x="60" y="34" width="46" height="7" rx="2" />
        </WorkMiniSlide>
      );
    case 'projects-showcase':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="14" y="8" width="92" height="30" rx="2" />
          <rect className="pf-work-mini-mute" x="14" y="42" width="26" height="18" rx="2" />
          <rect className="pf-work-mini-mute" x="43" y="42" width="26" height="18" rx="2" />
          <rect className="pf-work-mini-mute" x="72" y="42" width="26" height="18" rx="2" />
          <path className="pf-work-mini-mute" d="M6 23l4-4-4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path className="pf-work-mini-mute" d="M114 15l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </WorkMiniSlide>
      );
    case 'projects-editorial':
      return (
        <WorkMiniSlide>
          <WorkMiniType x={10} y={44} size={30}>01</WorkMiniType>
          <rect className="pf-work-mini-mute" x="10" y="50" width="28" height="3" rx="1.5" />
          <rect className="pf-work-mini-ink" x="62" y="12" width="44" height="4" rx="2" />
          <rect className="pf-work-mini-mute" x="62" y="22" width="44" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="62" y="29" width="36" height="3" rx="1.5" />
          <rect className="pf-work-mini-accent" x="62" y="40" width="20" height="3" rx="1.5" />
        </WorkMiniSlide>
      );
    case 'projects-ledger':
      return (
        <WorkMiniSlide>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect className="pf-work-mini-ink" x="10" y={11 + i * 15} width="46" height="4" rx="2" />
              <rect className="pf-work-mini-mute" x="66" y={11 + i * 15} width="30" height="4" rx="2" />
              <rect className="pf-work-mini-mute" x="10" y={21 + i * 15} width="96" height="1" />
            </g>
          ))}
        </WorkMiniSlide>
      );
    case 'projects-folio':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ring" x="9" y="9" width="32" height="46" rx="3" />
          <rect className="pf-work-mini-mute" x="15" y="17" width="20" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="15" y="24" width="14" height="2.4" rx="1.2" />
          {[0, 1, 2].map((i) => (
            <rect key={i} className="pf-work-mini-mute" x="52" y={12 + i * 12} width="54" height="4" rx="2" />
          ))}
        </WorkMiniSlide>
      );
    case 'projects-spec':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="10" y="9" width="50" height="6" rx="2" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect className="pf-work-mini-mute" x="10" y={24 + i * 10} width="26" height="3" rx="1.5" />
              <rect className="pf-work-mini-accent" x="42" y={24 + i * 10} width="30" height="3" rx="1.5" />
            </g>
          ))}
        </WorkMiniSlide>
      );
    case 'projects-case':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="6" y="8" width="50" height="48" rx="2" />
          <rect className="pf-work-mini-mute" x="64" y="10" width="46" height="5" rx="2" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect className="pf-work-mini-mute" x="64" y={24 + i * 10} width="20" height="3" rx="1.5" />
              <rect className="pf-work-mini-accent" x="88" y={24 + i * 10} width="22" height="3" rx="1.5" />
            </g>
          ))}
        </WorkMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

function WorkMiniType({
  x,
  y,
  children,
  size = 8,
}: {
  x: number;
  y: number;
  children: string;
  size?: number;
}) {
  return (
    <text className="pf-work-mini-type" x={x} y={y} fontSize={size} fontWeight={800} opacity={0.45}>
      {children}
    </text>
  );
}

/** The main "Section design" picker — visual wireframe cards instead of a plain option grid. */
function WorkDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioWorkSectionDesign;
  onChange: (value: PortfolioWorkSectionDesign) => void;
}) {
  return (
    <div>
      <p className="pf-work-block-label">Section design</p>
      <div className="grid grid-cols-2 gap-2">
        {PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <WorkPickerCard
              key={option.value}
              active={active}
              label={option.label}
              onClick={() => onChange(option.value)}
            >
              <WorkDesignWireframe design={option.value} />
            </WorkPickerCard>
          );
        })}
      </div>
    </div>
  );
}

/** Mini wireframes for the 5 "Header design" picker cards. */
function WorkHeaderWireframe({ design }: { design: PortfolioWorkHeaderDesign }) {
  switch (design) {
    case 'minimal':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="10" y="24" width="52" height="8" rx="2" />
          <rect className="pf-work-mini-mute" x="10" y="38" width="70" height="4" rx="2" />
        </WorkMiniSlide>
      );
    case 'editorial':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-accent" x="10" y="16" width="18" height="3" rx="1.5" />
          <rect className="pf-work-mini-ink" x="10" y="26" width="64" height="9" rx="2" />
          <rect className="pf-work-mini-mute" x="10" y="42" width="46" height="4" rx="2" />
        </WorkMiniSlide>
      );
    case 'marquee':
      return (
        <WorkMiniSlide>
          <text
            x="60"
            y="34"
            fontSize={22}
            fontWeight={800}
            textAnchor="middle"
            opacity={0.14}
            className="pf-work-mini-ink"
          >
            WORK
          </text>
          <rect className="pf-work-mini-ink" x="18" y="30" width="84" height="10" rx="2" />
        </WorkMiniSlide>
      );
    case 'index':
      return (
        <WorkMiniSlide>
          <WorkMiniType x={10} y={46} size={28}>
            01
          </WorkMiniType>
          <rect className="pf-work-mini-ink" x="46" y="26" width="46" height="8" rx="2" />
          <rect className="pf-work-mini-mute" x="46" y="40" width="32" height="4" rx="2" />
        </WorkMiniSlide>
      );
    case 'accent-count':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-accent" x="10" y="12" width="26" height="8" rx="4" />
          <rect className="pf-work-mini-mute" x="10" y="26" width="40" height="3" rx="1.5" />
          <rect className="pf-work-mini-ink" x="10" y="33" width="60" height="7" rx="2" />
        </WorkMiniSlide>
      );
    case 'serif-lead':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-mute" x="10" y="14" width="20" height="3" rx="1.5" />
          <rect className="pf-work-mini-ink" x="10" y="24" width="76" height="11" rx="2" />
        </WorkMiniSlide>
      );
    case 'billboard':
      return (
        <WorkMiniSlide>
          <text
            x="60"
            y="30"
            fontSize={26}
            fontWeight={900}
            textAnchor="middle"
            opacity={0.1}
            className="pf-work-mini-ink"
          >
            WORK
          </text>
          <rect className="pf-work-mini-ink" x="18" y="30" width="60" height="8" rx="2" />
          <rect className="pf-work-mini-mute" x="18" y="42" width="40" height="3" rx="1.5" />
        </WorkMiniSlide>
      );
    case 'masthead':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-mute" x="10" y="12" width="100" height="1" />
          <rect className="pf-work-mini-ink" x="10" y="20" width="100" height="12" rx="2" />
          <rect className="pf-work-mini-mute" x="10" y="38" width="100" height="1" />
        </WorkMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** The "Header design" picker — one shared, GSAP-animated header applied above every layout. */
function WorkHeaderChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioWorkHeaderDesign;
  onChange: (value: PortfolioWorkHeaderDesign) => void;
}) {
  return (
    <div>
      <p className="pf-work-block-label">Header design</p>
      <div className="grid grid-cols-2 gap-2">
        {PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <WorkPickerCard
              key={option.value}
              active={active}
              label={option.label}
              onClick={() => onChange(active ? 'minimal' : option.value)}
            >
              <WorkHeaderWireframe design={option.value} />
            </WorkPickerCard>
          );
        })}
      </div>
    </div>
  );
}

const WORK_HEADER_MARGIN_BOTTOM_OPTIONS = [
  { value: 'sm' as const, label: 'Small' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Large' },
  { value: 'xl' as const, label: 'XL' },
];

const WORK_HEADER_TITLE_SIZE_OPTIONS = [
  { value: 'sm' as const, label: 'Small' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Large' },
  { value: 'xl' as const, label: 'XL' },
];

const WORK_HEADER_TITLE_WEIGHT_OPTIONS = [
  { value: 'light' as const, label: 'Light', description: 'Lighter than this design’s default.' },
  { value: 'regular' as const, label: 'Regular', description: 'This design’s default weight.' },
  { value: 'semibold' as const, label: 'Semibold', description: 'A step bolder.' },
  { value: 'bold' as const, label: 'Bold', description: 'The boldest step.' },
];

/** Shared across every header design — bottom spacing, title size, and title weight.
 *  Appended to each design's own advanced-settings branch in the Header tab. */
function WorkHeaderSharedAdvancedControls({
  work,
  onChange,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
}) {
  return (
    <>
      <WorkSlider
        label="Bottom spacing"
        options={WORK_HEADER_MARGIN_BOTTOM_OPTIONS}
        value={work.headerMarginBottom ?? 'md'}
        onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
      />
      <WorkSlider
        label="Title size"
        options={WORK_HEADER_TITLE_SIZE_OPTIONS}
        value={work.headerTitleSize ?? 'md'}
        onChange={(headerTitleSize) => onChange({ headerTitleSize })}
      />
      <WorkOptionGrid
        label="Title weight"
        options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
        value={work.headerTitleWeight ?? 'regular'}
        onChange={(headerTitleWeight) => onChange({ headerTitleWeight })}
        columns={4}
      />
    </>
  );
}

function WorkLayoutDisplayOptions({
  work,
  onChange,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
}) {
  const design = work.sectionDesign ?? 'projects-board';
  const layoutLabel =
    PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS.find((option) => option.value === design)?.label ?? '';
  return (
    <div>
      <WorkSectionLabel>{`Display options — ${layoutLabel}`}</WorkSectionLabel>
      <div className="mt-4" key={design}>
      {design === 'projects-board' ? (
        <>
          <WorkToggleRow
            label="Thumbnails"
            info="Upload in Information → Portfolio"
            checked={(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showThumbnail}
            onChange={(showThumbnail) =>
              onChange({
                projectsBoard: {
                  ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                  showThumbnail,
                },
              })
            }
          />

          <WorkToggleRow
            label="Role"
            checked={(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showRole}
            onChange={(showRole) =>
              onChange({
                projectsBoard: {
                  ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                  showRole,
                },
              })
            }
          />

          <WorkToggleRow
            label="Category"
            checked={(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showCategory}
            onChange={(showCategory) =>
              onChange({
                projectsBoard: {
                  ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                  showCategory,
                },
              })
            }
          />

          <WorkToggleRow
            label="Consult button on thumbnail"
            info="Corner of the image, links to the project"
            checked={(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showConsultOnHover}
            onChange={(showConsultOnHover) =>
              onChange({
                projectsBoard: {
                  ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                  showConsultOnHover,
                },
              })
            }
          />

          {(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showConsultOnHover ? (
            <div className="border-t border-neutral-200/80 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Consult button label
              </p>
              <input
                type="text"
                value={(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).consultLabel}
                onChange={(event) =>
                  onChange({
                    projectsBoard: {
                      ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                      consultLabel: event.target.value,
                    },
                  })
                }
                placeholder="Consult"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
              />
            </div>
          ) : null}
        </>
      )
      : design === 'projects-accordion' ? (
        <>
          <WorkToggleRow
            label="Tools under preview"
            checked={(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).showTools}
            onChange={(showTools) =>
              onChange({
                projectsAccordion: {
                  ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                  showTools,
                },
              })
            }
          />

          {(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).showTools ? (
            <>
              <WorkToggleRow
                label="Tools label"
                info="Heading above the chips — off by default"
                checked={
                  (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS)
                    .showToolsLabel === true
                }
                onChange={(showToolsLabel) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      showToolsLabel,
                    },
                  })
                }
              />

              {(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS)
                .showToolsLabel === true ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Tools label
                  </p>
                  <input
                    type="text"
                    value={
                      (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).toolsLabel
                    }
                    onChange={(event) =>
                      onChange({
                        projectsAccordion: {
                          ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                          toolsLabel: event.target.value,
                        },
                      })
                    }
                    placeholder="Tools I use"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
              ) : null}
            </>
          ) : null}
          <WorkToggleRow
            label="Description in panel"
            checked={
              (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).showDescription
            }
            onChange={(showDescription) =>
              onChange({
                projectsAccordion: {
                  ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                  showDescription,
                },
              })
            }
          />

          <WorkToggleRow
            label="Role"
            info="Left side, under the description"
            checked={
              (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS)
                .showRoleInPanel !== false
            }
            onChange={(showRoleInPanel) =>
              onChange({
                projectsAccordion: {
                  ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                  showRoleInPanel,
                },
              })
            }
          />

          <WorkToggleRow
            label="Category"
            info="Right side, under the description"
            checked={
              (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS)
                .showCategoryInPanel !== false
            }
            onChange={(showCategoryInPanel) =>
              onChange({
                projectsAccordion: {
                  ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                  showCategoryInPanel,
                },
              })
            }
          />

          <WorkToggleRow
            label="Consult link"
            info="Text link under the preview, not a hover overlay"
            checked={
              (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).showConsult !==
              false
            }
            onChange={(showConsult) =>
              onChange({
                projectsAccordion: {
                  ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                  showConsult,
                },
              })
            }
          />

          {(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).showConsult !==
          false ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Consult button label
              </p>
              <input
                type="text"
                value={
                  (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).consultLabel
                }
                onChange={(event) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      consultLabel: event.target.value,
                    },
                  })
                }
                placeholder="Consult"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
              />
            </div>
          ) : null}
        </>
      )
      : design === 'projects-frames' ? (
        <>
          <WorkToggleRow
            label="Image padding"
            info="Off = flush to edge, on = small gap"
            checked={
              (work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).imagePadding !== false
            }
            onChange={(imagePadding) =>
              onChange({
                projectsFrames: {
                  ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                  imagePadding,
                },
              })
            }
          />

          <WorkToggleRow
            label="Alternate image sides"
            info="Even cards flip left ↔ right"
            checked={
              (work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).alternateSides === true
            }
            onChange={(alternateSides) =>
              onChange({
                projectsFrames: {
                  ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                  alternateSides,
                },
              })
            }
          />

          <WorkToggleRow
            label="Role"
            info="Above the title"
            checked={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showRole}
            onChange={(showRole) =>
              onChange({
                projectsFrames: {
                  ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                  showRole,
                },
              })
            }
          />

          <WorkToggleRow
            label="Category"
            info="Same row as role, right-aligned"
            checked={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showCategory}
            onChange={(showCategory) =>
              onChange({
                projectsFrames: {
                  ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                  showCategory,
                },
              })
            }
          />

          <WorkToggleRow
            label="Description"
            checked={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showDescription}
            onChange={(showDescription) =>
              onChange({
                projectsFrames: {
                  ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                  showDescription,
                },
              })
            }
          />

          <WorkToggleRow
            label="Stack"
            info="Plain text with separators, not pill tags"
            checked={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showStack}
            onChange={(showStack) =>
              onChange({
                projectsFrames: {
                  ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                  showStack,
                },
              })
            }
          />

          <WorkToggleRow
            label="Consult link"
            info="Text link under the stack"
            checked={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showConsult}
            onChange={(showConsult) =>
              onChange({
                projectsFrames: {
                  ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                  showConsult,
                },
              })
            }
          />

          {(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showConsult ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Consult button label
              </p>
              <input
                type="text"
                value={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).consultLabel}
                onChange={(event) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      consultLabel: event.target.value,
                    },
                  })
                }
                placeholder="Consult"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
              />
            </div>
          ) : null}
        </>
      )
      : design === 'projects-index' ? (
        <>
          <WorkToggleRow
            label="Index marker"
            info="Number or bullet, left column"
            checked={(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).showNumber !== false}
            onChange={(showNumber) =>
              onChange({
                projectsIndex: {
                  ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS),
                  showNumber,
                },
              })
            }
          />

          {(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).showNumber !== false ? (
            <WorkOptionGrid
              label="Index marker style"
              options={PORTFOLIO_WORK_INDEX_MARKER_OPTIONS}
              value={
                (work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).indexMarker ?? 'number'
              }
              onChange={(indexMarker) =>
                onChange({
                  projectsIndex: {
                    ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS),
                    indexMarker,
                  },
                })
              }
              columns={2}
            />
          ) : null}

          <WorkToggleRow
            label="Stack"
            info="Chips directly under the title"
            checked={(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).showStack !== false}
            onChange={(showStack) =>
              onChange({
                projectsIndex: {
                  ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS),
                  showStack,
                },
              })
            }
          />

          <WorkToggleRow
            label="Description"
            info="Right column"
            checked={
              (work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).showDescription !== false
            }
            onChange={(showDescription) =>
              onChange({
                projectsIndex: {
                  ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS),
                  showDescription,
                },
              })
            }
          />
        </>
      )
      : design === 'projects-grid' ? (
        <>
          <WorkToggleRow
            label="Carousel navigation"
            info="Arrow-button slide when a row overflows"
            checked={
              (work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS).carouselEnabled === true
            }
            onChange={(carouselEnabled) =>
              onChange({
                projectsGrid: {
                  ...(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS),
                  carouselEnabled,
                },
              })
            }
          />

          <WorkToggleRow
            label="Description"
            checked={
              (work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS).showDescription !== false
            }
            onChange={(showDescription) =>
              onChange({
                projectsGrid: {
                  ...(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS),
                  showDescription,
                },
              })
            }
          />
        </>
      )
      : design === 'projects-split' ? (
        <>
          {(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).imageSide !== 'center' ? (
            <WorkToggleRow
              label="Alternate image sides"
              info="Even rows flip image ↔ title"
              checked={
                (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).alternateSides === true
              }
              onChange={(alternateSides) =>
                onChange({
                  projectsSplit: {
                    ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                    alternateSides,
                  },
                })
              }
            />
          ) : null}

          <WorkToggleRow
            label="Description"
            checked={
              (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).showDescription === true
            }
            onChange={(showDescription) =>
              onChange({
                projectsSplit: {
                  ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                  showDescription,
                },
              })
            }
          />
        </>
      )
      : design === 'projects-carousel' ? (
        <>
          <WorkToggleRow
            label="Hover reveal"
            info="Survol : zoom, assombrit, affiche titre + description"
            checked={
              (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).hoverReveal !== false
            }
            onChange={(hoverReveal) =>
              onChange({
                projectsCarousel: {
                  ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                  hoverReveal,
                },
              })
            }
          />

          <WorkToggleRow
            label="Focus blur"
            info="Floute les autres images au survol"
            checked={
              (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS)
                .focusBlurSiblings !== false
            }
            onChange={(focusBlurSiblings) =>
              onChange({
                projectsCarousel: {
                  ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                  focusBlurSiblings,
                },
              })
            }
          />

          <WorkToggleRow
            label="Hover stack"
            info="Survol : stack sous l'image, sans bordure"
            checked={
              (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).hoverStack !== false
            }
            onChange={(hoverStack) =>
              onChange({
                projectsCarousel: {
                  ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                  hoverStack,
                },
              })
            }
          />
        </>
      )
      : design === 'projects-spotlight' ? (
        <>
          <WorkToggleRow
            label="Role"
            info="Au-dessus du titre"
            checked={
              (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showRole !== false
            }
            onChange={(showRole) =>
              onChange({
                projectsSpotlight: {
                  ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                  showRole,
                },
              })
            }
          />

          <WorkToggleRow
            label="Description"
            checked={
              (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS)
                .showDescription !== false
            }
            onChange={(showDescription) =>
              onChange({
                projectsSpotlight: {
                  ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                  showDescription,
                },
              })
            }
          />

          <WorkToggleRow
            label="Consult"
            checked={
              (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showConsult !==
              false
            }
            onChange={(showConsult) =>
              onChange({
                projectsSpotlight: {
                  ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                  showConsult,
                },
              })
            }
          />

          {(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showConsult !==
          false ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Consult label
              </p>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                value={
                  (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).consultLabel ||
                  'Consult'
                }
                onChange={(event) =>
                  onChange({
                    projectsSpotlight: {
                      ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                      consultLabel: event.target.value,
                    },
                  })
                }
              />
            </div>
          ) : null}

          <WorkToggleRow
            label="Stack"
            checked={
              (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showStack !== false
            }
            onChange={(showStack) =>
              onChange({
                projectsSpotlight: {
                  ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                  showStack,
                },
              })
            }
          />

          {(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showStack !==
          false ? (
            <WorkOptionGrid
              label="Stack style"
              options={PORTFOLIO_WORK_SPOTLIGHT_STACK_STYLE_OPTIONS}
              value={
                (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).stackStyle ??
                'tags'
              }
              onChange={(stackStyle) =>
                onChange({
                  projectsSpotlight: {
                    ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                    stackStyle,
                  },
                })
              }
              columns={3}
            />
          ) : null}

          <WorkToggleRow
            label="Frame fill"
            info="Désactiver = layout à plat"
            checked={
              (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showFrameFill !==
              false
            }
            onChange={(showFrameFill) =>
              onChange({
                projectsSpotlight: {
                  ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                  showFrameFill,
                },
              })
            }
          />
        </>
      )
      : design === 'projects-showcase' ? (
        <>
          <WorkToggleRow
            label="Role on media"
            info="Compact label overlaid on the image"
            checked={
              (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).showRole !== false
            }
            onChange={(showRole) =>
              onChange({
                projectsShowcase: {
                  ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                  showRole,
                },
              })
            }
          />

          <WorkToggleRow
            label="Description"
            checked={
              (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).showDescription !==
              false
            }
            onChange={(showDescription) =>
              onChange({
                projectsShowcase: {
                  ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                  showDescription,
                },
              })
            }
          />

          <WorkToggleRow
            label="Category"
            info="Label + value, under the description"
            checked={
              (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).showCategory !==
              false
            }
            onChange={(showCategory) =>
              onChange({
                projectsShowcase: {
                  ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                  showCategory,
                },
              })
            }
          />

          {(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).showCategory !==
          false ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Category label
              </p>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                value={
                  (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).categoryLabel ||
                  'Category'
                }
                onChange={(event) =>
                  onChange({
                    projectsShowcase: {
                      ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                      categoryLabel: event.target.value,
                    },
                  })
                }
              />
            </div>
          ) : null}
        </>
      )
      : design === 'projects-editorial' ? (
        <>
          <WorkToggleRow
            label="Role"
            info="Sous le numéro, avec un trait"
            checked={
              (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).showRole !== false
            }
            onChange={(showRole) =>
              onChange({
                projectsEditorial: {
                  ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                  showRole,
                },
              })
            }
          />

          {(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).rightPanel !==
          'thumbnail' ? (
            <>
              <WorkToggleRow
                label="Description"
                info="Colonne de droite"
                checked={
                  (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                    .showDescription !== false
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsEditorial: {
                      ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Stack"
                info="Outils du projet, à droite"
                checked={
                  (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).showStack !==
                  false
                }
                onChange={(showStack) =>
                  onChange({
                    projectsEditorial: {
                      ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                      showStack,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Consult"
                info="Pill + flèche, sous les infos"
                checked={
                  (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).showConsult !==
                  false
                }
                onChange={(showConsult) =>
                  onChange({
                    projectsEditorial: {
                      ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                      showConsult,
                    },
                  })
                }
              />

              {(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).showConsult !==
              false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Consult label
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Phrase du lien (ex. « Consult this project ») + flèche ↗.
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                    value={
                      (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                        .consultLabel || 'Consult this project'
                    }
                    placeholder="Consult this project"
                    onChange={(event) =>
                      onChange({
                        projectsEditorial: {
                          ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                          consultLabel: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null}
            </>
          ) : (
            <>
              <WorkToggleRow
                label="Hover reveal"
                info="Survol : assombrit et révèle les infos"
                checked={
                  (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                    .thumbnailHoverReveal !== false
                }
                onChange={(thumbnailHoverReveal) =>
                  onChange({
                    projectsEditorial: {
                      ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                      thumbnailHoverReveal,
                    },
                  })
                }
              />

              {(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                .thumbnailHoverReveal !== false ? (
                <>
                  <WorkToggleRow
                    label="Description"
                    checked={
                      (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                        .showDescription !== false
                    }
                    onChange={(showDescription) =>
                      onChange({
                        projectsEditorial: {
                          ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                          showDescription,
                        },
                      })
                    }
                  />

                  <WorkToggleRow
                    label="Stack"
                    checked={
                      (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                        .showStack !== false
                    }
                    onChange={(showStack) =>
                      onChange({
                        projectsEditorial: {
                          ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                          showStack,
                        },
                      })
                    }
                  />

                  <WorkToggleRow
                    label="Consult"
                    checked={
                      (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                        .showConsult !== false
                    }
                    onChange={(showConsult) =>
                      onChange({
                        projectsEditorial: {
                          ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                          showConsult,
                        },
                      })
                    }
                  />

                  {(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                    .showConsult !== false ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Consult label
                      </p>
                      <input
                        type="text"
                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                        value={
                          (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                            .consultLabel || 'Consult this project'
                        }
                        placeholder="Consult this project"
                        onChange={(event) =>
                          onChange({
                            projectsEditorial: {
                              ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                              consultLabel: event.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Hover désactivé : la miniature s’affiche seule, sans overlay.
                </p>
              )}
            </>
          )}
        </>
      )
      : design === 'projects-ledger' ? (
        <>
          <WorkToggleRow
            label="Count"
            info="Compteur à droite du titre"
            checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showCount !== false}
            onChange={(showCount) =>
              onChange({
                projectsLedger: {
                  ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                  showCount,
                },
              })
            }
          />

          <WorkToggleRow
            label="Index"
            info="01, 02… à gauche de chaque ligne"
            checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showIndex !== false}
            onChange={(showIndex) =>
              onChange({
                projectsLedger: {
                  ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                  showIndex,
                },
              })
            }
          />

          <WorkToggleRow
            label="Role"
            info="Rôle/catégorie, aligné à droite (desktop)"
            checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showRole !== false}
            onChange={(showRole) =>
              onChange({
                projectsLedger: {
                  ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                  showRole,
                },
              })
            }
          />

          <WorkToggleRow
            label="Description"
            info="Dans le panneau déplié"
            checked={
              (work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showDescription !== false
            }
            onChange={(showDescription) =>
              onChange({
                projectsLedger: {
                  ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                  showDescription,
                },
              })
            }
          />

          <WorkToggleRow
            label="Stack"
            info="Mono uppercase, sous la description"
            checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showStack !== false}
            onChange={(showStack) =>
              onChange({
                projectsLedger: {
                  ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                  showStack,
                },
              })
            }
          />

          <WorkToggleRow
            label="Consult"
            info="Lien texte + flèche, sous les détails"
            checked={
              (work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showConsult !== false
            }
            onChange={(showConsult) =>
              onChange({
                projectsLedger: {
                  ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                  showConsult,
                },
              })
            }
          />

          {(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showConsult !== false ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Consult label
              </p>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                value={
                  (work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).consultLabel ||
                  'Consult this project'
                }
                placeholder="Consult this project"
                onChange={(event) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      consultLabel: event.target.value,
                    },
                  })
                }
              />
            </div>
          ) : null}
        </>
      )
      : design === 'projects-folio' ? (
        <>
          <WorkToggleRow
            label="Role"
            info="Micro-label au-dessus du trait d'accent"
            checked={(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showRole !== false}
            onChange={(showRole) =>
              onChange({
                projectsFolio: {
                  ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                  showRole,
                },
              })
            }
          />

          <WorkToggleRow
            label="Description"
            checked={
              (work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showDescription !== false
            }
            onChange={(showDescription) =>
              onChange({
                projectsFolio: {
                  ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                  showDescription,
                },
              })
            }
          />

          <WorkToggleRow
            label="Stack"
            info="5 designs au choix, ci-dessous"
            checked={(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showStack !== false}
            onChange={(showStack) =>
              onChange({
                projectsFolio: {
                  ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                  showStack,
                },
              })
            }
          />

          {(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showStack !== false ? (
            <>
              <WorkOptionGrid
                label="Stack design"
                options={PORTFOLIO_WORK_FOLIO_STACK_DESIGN_OPTIONS}
                value={
                  (work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).stackDesign ??
                  'tags-outline'
                }
                onChange={(stackDesign) =>
                  onChange({
                    projectsFolio: {
                      ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                      stackDesign,
                    },
                  })
                }
                columns={2}
              />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Stack label
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Titre du bloc (ex. « Core stack »).
                </p>
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                  value={
                    (work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).stackLabel ||
                    'Core stack'
                  }
                  placeholder="Core stack"
                  onChange={(event) =>
                    onChange({
                      projectsFolio: {
                        ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                        stackLabel: event.target.value,
                      },
                    })
                  }
                />
              </div>
            </>
          ) : null}

          <WorkToggleRow
            label="Consult"
            info="Lien texte + flèche, sous le dossier"
            checked={(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showConsult !== false}
            onChange={(showConsult) =>
              onChange({
                projectsFolio: {
                  ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                  showConsult,
                },
              })
            }
          />

          {(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showConsult !== false ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Consult label
              </p>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                value={
                  (work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).consultLabel ||
                  'Consult this project'
                }
                placeholder="Consult this project"
                onChange={(event) =>
                  onChange({
                    projectsFolio: {
                      ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                      consultLabel: event.target.value,
                    },
                  })
                }
              />
            </div>
          ) : null}
        </>
      )
      : design === 'projects-spec' ? (
        <>
          <WorkToggleRow
            label="Thumbnail"
            info="Désactive auto « 2 par ligne »"
            checked={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showThumbnail === true}
            onChange={(showThumbnail) =>
              onChange({
                projectsSpec: {
                  ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                  showThumbnail,
                  ...(showThumbnail ? { columnsPerRow: 1 as const } : {}),
                },
              })
            }
          />

          <WorkToggleRow
            label="Category"
            info="À gauche, couleur CTA"
            checked={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showCategory !== false}
            onChange={(showCategory) =>
              onChange({
                projectsSpec: {
                  ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                  showCategory,
                },
              })
            }
          />

          <WorkToggleRow
            label="Role"
            info="À droite du micro-header"
            checked={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showRole !== false}
            onChange={(showRole) =>
              onChange({
                projectsSpec: {
                  ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                  showRole,
                },
              })
            }
          />

          <WorkToggleRow
            label="Field labels"
            info="Labels Summary / Stack / Link"
            checked={
              (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showFieldLabels !== false
            }
            onChange={(showFieldLabels) =>
              onChange({
                projectsSpec: {
                  ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                  showFieldLabels,
                },
              })
            }
          />

          <WorkToggleRow
            label="Description"
            info="Ligne Summary"
            checked={
              (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showDescription !== false
            }
            onChange={(showDescription) =>
              onChange({
                projectsSpec: {
                  ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                  showDescription,
                },
              })
            }
          />

          {(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showDescription !== false &&
          (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showFieldLabels !== false ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Description label
              </p>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                value={
                  (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).descriptionLabel ||
                  'Summary'
                }
                placeholder="Summary"
                onChange={(event) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      descriptionLabel: event.target.value,
                    },
                  })
                }
              />
            </div>
          ) : null}

          <WorkToggleRow
            label="Stack"
            info="Tags, comme Projects board"
            checked={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showStack !== false}
            onChange={(showStack) =>
              onChange({
                projectsSpec: {
                  ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                  showStack,
                },
              })
            }
          />

          {(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showStack !== false &&
          (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showFieldLabels !== false ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Stack label
              </p>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                value={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).stackLabel || 'Stack'}
                placeholder="Stack"
                onChange={(event) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      stackLabel: event.target.value,
                    },
                  })
                }
              />
            </div>
          ) : null}

          <WorkToggleRow
            label="Consult"
            info="Plusieurs designs au choix, ci-dessous"
            checked={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showConsult !== false}
            onChange={(showConsult) =>
              onChange({
                projectsSpec: {
                  ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                  showConsult,
                },
              })
            }
          />

          {(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showConsult !== false ? (
            <>
              <WorkPreviewCardGrid
                label="Consult design"
                options={PORTFOLIO_WORK_SPEC_CONSULT_DESIGN_OPTIONS.map((option) => ({
                  ...option,
                  glyph: workConsultDesignGlyph(option.value),
                }))}
                columns={4}
                value={
                  (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).consultDesign ??
                  'bracket'
                }
                onChange={(consultDesign) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      consultDesign,
                    },
                  })
                }
              />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Consult label
                </p>
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                  value={
                    (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).consultLabel ||
                    'Consult this project'
                  }
                  placeholder="Consult this project"
                  onChange={(event) =>
                    onChange({
                      projectsSpec: {
                        ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                        consultLabel: event.target.value,
                      },
                    })
                  }
                />
              </div>
            </>
          ) : null}
        </>
      )
      : design === 'projects-case' ? (
        <>
          <WorkToggleRow
            label="Thumbnail"
            info="~50% à gauche; désactivé = pleine largeur"
            checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showThumbnail !== false}
            onChange={(showThumbnail) =>
              onChange({
                projectsCase: {
                  ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                  showThumbnail,
                },
              })
            }
          />

          <WorkToggleRow
            label="Category"
            info="À gauche, couleur CTA"
            checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showCategory !== false}
            onChange={(showCategory) =>
              onChange({
                projectsCase: {
                  ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                  showCategory,
                },
              })
            }
          />

          <WorkToggleRow
            label="Role"
            info="À droite du micro-header"
            checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showRole !== false}
            onChange={(showRole) =>
              onChange({
                projectsCase: {
                  ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                  showRole,
                },
              })
            }
          />

          <WorkToggleRow
            label="Field labels"
            info="Labels Summary / Stack / Link"
            checked={
              (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showFieldLabels !== false
            }
            onChange={(showFieldLabels) =>
              onChange({
                projectsCase: {
                  ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                  showFieldLabels,
                },
              })
            }
          />

          <WorkToggleRow
            label="Description"
            info="Ligne Summary"
            checked={
              (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showDescription !== false
            }
            onChange={(showDescription) =>
              onChange({
                projectsCase: {
                  ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                  showDescription,
                },
              })
            }
          />

          {(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showDescription !== false &&
          (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showFieldLabels !== false ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Description label
              </p>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                value={
                  (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).descriptionLabel ||
                  'Summary'
                }
                placeholder="Summary"
                onChange={(event) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      descriptionLabel: event.target.value,
                    },
                  })
                }
              />
            </div>
          ) : null}

          <WorkToggleRow
            label="Stack"
            info="Tags, comme Projects board"
            checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showStack !== false}
            onChange={(showStack) =>
              onChange({
                projectsCase: {
                  ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                  showStack,
                },
              })
            }
          />

          {(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showStack !== false &&
          (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showFieldLabels !== false ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Stack label
              </p>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                value={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).stackLabel || 'Stack'}
                placeholder="Stack"
                onChange={(event) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      stackLabel: event.target.value,
                    },
                  })
                }
              />
            </div>
          ) : null}

          <WorkToggleRow
            label="Consult"
            info="Plusieurs designs au choix, ci-dessous"
            checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showConsult !== false}
            onChange={(showConsult) =>
              onChange({
                projectsCase: {
                  ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                  showConsult,
                },
              })
            }
          />

          {(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showConsult !== false ? (
            <>
              <WorkPreviewCardGrid
                label="Consult design"
                options={PORTFOLIO_WORK_SPEC_CONSULT_DESIGN_OPTIONS.map((option) => ({
                  ...option,
                  glyph: workConsultDesignGlyph(option.value),
                }))}
                columns={4}
                value={
                  (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).consultDesign ??
                  'bracket'
                }
                onChange={(consultDesign) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      consultDesign,
                    },
                  })
                }
              />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Consult label
                </p>
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                  value={
                    (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).consultLabel ||
                    'Consult this project'
                  }
                  placeholder="Consult this project"
                  onChange={(event) =>
                    onChange({
                      projectsCase: {
                        ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                        consultLabel: event.target.value,
                      },
                    })
                  }
                />
              </div>

              {(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showFieldLabels !==
              false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Link label
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                    value={
                      (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).linkLabel || 'Link'
                    }
                    placeholder="Link"
                    onChange={(event) =>
                      onChange({
                        projectsCase: {
                          ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                          linkLabel: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </>
      )
      : null}
      </div>
    </div>
  );
}

export function WorkSettingsPanel({
  work,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  subSection?: WorkSettingsSubSection;
  onSubSectionChange?: (value: WorkSettingsSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<WorkSettingsSubSection>('header');
  const subSection = normalizeWorkSettingsSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: WorkSettingsSubSection) => {
    const next = normalizeWorkSettingsSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {WORK_SETTINGS_SUB_SECTIONS.map((section) => (
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
            <WorkSectionLabel>Visibility</WorkSectionLabel>
            <div className="mt-4">
              <WorkToggleRow
                label="Portfolio section"
                checked={work.enabled}
                onChange={(enabled) => onChange({ enabled })}
              />
              <WorkToggleRow
                label="Marketplace link"
                checked={work.showMarketplaceLink}
                onChange={(showMarketplaceLink) => onChange({ showMarketplaceLink })}
              />
              <WorkToggleRow
                label="Subtitle"
                checked={work.subtitlePreset !== 'minimal'}
                onChange={(show) => onChange({ subtitlePreset: show ? 'default' : 'minimal' })}
              />
            </div>
          </div>

          <WorkLayoutDisplayOptions work={work} onChange={onChange} />
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <div>
            <WorkHeaderChoiceGrid
              value={work.headerDesign ?? 'minimal'}
              onChange={(headerDesign) => onChange({ headerDesign })}
            />

            <WorkLayoutSettingsBand motionKey={work.headerDesign ?? 'minimal'}>
              {(work.headerDesign ?? 'minimal') === 'minimal' ? (
                <>
                  {workSectionLayoutIsAside(work.sectionLayout) ? (
                    <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                      Alignement horizontal masqué : le titre est déjà placé{' '}
                      {work.sectionLayout === 'aside-right' ? 'à droite' : 'à gauche'} de la galerie.
                    </p>
                  ) : (
                    <WorkOptionGrid
                      label="Header alignment"
                      options={[
                        { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
                        { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
                      ]}
                      value={work.headerAlignment}
                      onChange={(headerAlignment) => onChange({ headerAlignment })}
                      columns={2}
                    />
                  )}
                  <WorkOptionGrid
                    label="Disposition titre / contenu"
                    options={PORTFOLIO_WORK_SECTION_LAYOUT_OPTIONS}
                    value={work.sectionLayout ?? 'stacked'}
                    onChange={(sectionLayout) => onChange({ sectionLayout })}
                    columns={1}
                  />
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} />
                </>
              ) : work.headerDesign === 'accent-count' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Badge text</p>
                    <input
                      type="text"
                      value={work.accentCountBadgeText}
                      onChange={(event) => onChange({ accentCountBadgeText: event.target.value })}
                      placeholder="{count}+ projects"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                    <p className="mt-1.5 text-sm text-neutral-500">Use {'{count}'} to insert the project count.</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Lead text</p>
                    <input
                      type="text"
                      value={work.accentCountLeadText}
                      onChange={(event) => onChange({ accentCountLeadText: event.target.value })}
                      placeholder="A selection of recent work."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <WorkOptionGrid
                    label="Badge color"
                    options={[
                      { value: 'accent' as const, label: 'Accent', description: 'Uses the CTA/accent color.' },
                      { value: 'principal' as const, label: 'Principal', description: 'Global principal token.' },
                      { value: 'secondaire' as const, label: 'Secondaire', description: 'Global secondary token.' },
                    ]}
                    value={work.accentCountBadgeColor}
                    onChange={(accentCountBadgeColor) => onChange({ accentCountBadgeColor })}
                    columns={3}
                  />
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} />
                </>
              ) : work.headerDesign === 'serif-lead' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Label</p>
                    <input
                      type="text"
                      value={work.serifLeadLabelText}
                      onChange={(event) => onChange({ serifLeadLabelText: event.target.value })}
                      placeholder="Portfolio"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} />
                </>
              ) : work.headerDesign === 'billboard' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Big background word</p>
                    <input
                      type="text"
                      value={work.billboardBigWord}
                      onChange={(event) => onChange({ billboardBigWord: event.target.value })}
                      placeholder="WORK"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Project count line</p>
                    <input
                      type="text"
                      value={work.billboardCountText}
                      onChange={(event) => onChange({ billboardCountText: event.target.value })}
                      placeholder="{count} projects"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                    <p className="mt-1.5 text-sm text-neutral-500">Use {'{count}'} to insert the project count.</p>
                  </div>
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} />
                </>
              ) : work.headerDesign === 'masthead' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Headline</p>
                    <input
                      type="text"
                      value={work.mastheadHeadlineText}
                      onChange={(event) => onChange({ mastheadHeadlineText: event.target.value })}
                      placeholder={work.title || 'PORTFOLIO'}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                    <p className="mt-1.5 text-sm text-neutral-500">Defaults to the title above when left empty.</p>
                  </div>
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} />
                </>
              ) : (
                <>
                  <WorkToggleRow
                    label="Header motion"
                    info="Respects reduced-motion preference"
                    checked={work.headerAnimationEnabled !== false}
                    onChange={(headerAnimationEnabled) => onChange({ headerAnimationEnabled })}
                  />
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} />
                </>
              )}
            </WorkLayoutSettingsBand>
          </div>
        </div>
      ) : null}

      {subSection === 'design' ? (
        <>
        <div className="space-y-6">
          <WorkDesignChoiceGrid
            value={work.sectionDesign ?? 'projects-board'}
            onChange={(sectionDesign) => onChange(workSectionDesignSettingsPatch(sectionDesign))}
          />

          <WorkLayoutSettingsBand motionKey={work.sectionDesign ?? 'projects-board'}>
          {(work.sectionDesign ?? 'projects-board') === 'projects-board' ? (
            null
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-accordion' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Accordion options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Titles open one at a time; the preview column shows a large thumbnail and stacks.
                  Content comes from Information → Portfolio.
                </p>
              </div>

              <WorkOptionGrid
                label="Title / subtitle alignment"
                options={PORTFOLIO_WORK_ACCORDION_ALIGN_OPTIONS}
                icons={WORK_ALIGNMENT_ICONS}
                value={(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).headerAlign}
                onChange={(headerAlign) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      headerAlign,
                    },
                  })
                }
                columns={3}
              />

              <WorkOptionGrid
                label="Preview placement"
                options={PORTFOLIO_WORK_ACCORDION_PREVIEW_SIDE_OPTIONS}
                value={
                  (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).previewSide ??
                  'right'
                }
                onChange={(previewSide) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      previewSide,
                    },
                  })
                }
                columns={2}
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-frames' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Frames options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Horizontal cards — image + info. Stack shows as plain text with hairline
                  separators (not tags). Content from Information → Portfolio.
                </p>
              </div>

              <WorkSlider
                label="Thumbnail size"
                options={PORTFOLIO_WORK_FRAMES_THUMBNAIL_SIZE_OPTIONS}
                value={
                  (work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).thumbnailSize ?? 'xl'
                }
                onChange={(thumbnailSize) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      thumbnailSize,
                    },
                  })
                }
              />

              <WorkPreviewCardGrid
                label="Image placement"
                options={PORTFOLIO_WORK_FRAMES_IMAGE_SIDE_OPTIONS.map((option) => ({
                  ...option,
                  glyph: option.value === 'left' ? workSideLeftGlyph() : workSideRightGlyph(),
                }))}
                value={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).imageSide ?? 'left'}
                onChange={(imageSide) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      imageSide,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Corner radius"
                options={PORTFOLIO_WORK_FRAMES_RADIUS_OPTIONS}
                value={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).radius ?? 'xl'}
                onChange={(radius) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      radius,
                    },
                  })
                }
                columns={3}
              />

              <WorkSlider
                label="Espacement vertical"
                options={PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS}
                value={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).cardGap ?? 'tight'}
                onChange={(cardGap) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      cardGap,
                    },
                  })
                }
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-index' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Index options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Numbered rows with thin separators — narrow index, wide title + stack, description
                  on the right. Content from Information → Portfolio.
                </p>
              </div>

              <WorkSlider
                label="Espacement des lignes"
                options={PORTFOLIO_WORK_INDEX_ROW_GAP_OPTIONS}
                value={(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).rowGap ?? 'md'}
                onChange={(rowGap) =>
                  onChange({
                    projectsIndex: {
                      ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS),
                      rowGap,
                    },
                  })
                }
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-grid' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Grid options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Thumbnail, title, and description only. Content from Information → Portfolio.
                </p>
              </div>

              <WorkPreviewCardGrid
                label="Columns on large screens"
                options={PORTFOLIO_WORK_GRID_COLUMNS_OPTIONS.map((option) => ({
                  value: String(option.value) as '2' | '3',
                  label: option.label,
                  glyph: workColumnsGlyph(option.value),
                }))}
                value={String(
                  (work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS).columnsPerRow ?? 2
                ) as '2' | '3'}
                onChange={(columnsPerRow) =>
                  onChange({
                    projectsGrid: {
                      ...(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS),
                      columnsPerRow: columnsPerRow === '3' ? 3 : 2,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Card border"
                options={PORTFOLIO_WORK_CARD_BORDER_OPTIONS}
                value={(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS).cardBorder ?? 'none'}
                onChange={(cardBorder) =>
                  onChange({
                    cardBorder,
                    projectsGrid: {
                      ...(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS),
                      cardBorder,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Arrondi"
                options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
                value={(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS).cardRadius ?? 'none'}
                onChange={(cardRadius) =>
                  onChange({
                    projectsGrid: {
                      ...(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS),
                      cardRadius,
                    },
                  })
                }
                columns={2}
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-split' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Split options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Large thumbnail beside the title. Choose sides and optional row alternation.
                </p>
              </div>

              <WorkOptionGrid
                label="Image placement"
                options={PORTFOLIO_WORK_SPLIT_IMAGE_SIDE_OPTIONS}
                value={(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).imageSide ?? 'left'}
                onChange={(imageSide) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      imageSide,
                      ...(imageSide === 'center'
                        ? {
                            alternateSides: false,
                            titleSide: 'left',
                            titleVerticalAlign: 'top',
                            descriptionPlacement: 'with-title',
                          }
                        : {}),
                    },
                  })
                }
                columns={3}
              />

              {(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).imageSide === 'center' ? (
                <>
                  <WorkOptionGrid
                    label="Title placement"
                    options={PORTFOLIO_WORK_SPLIT_TITLE_SIDE_OPTIONS}
                    value={(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).titleSide ?? 'left'}
                    onChange={(titleSide) =>
                      onChange({
                        projectsSplit: {
                          ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                          titleSide,
                        },
                      })
                    }
                    columns={2}
                  />
                  <WorkOptionGrid
                    label="Title vertical"
                    options={PORTFOLIO_WORK_SPLIT_TITLE_VERTICAL_OPTIONS}
                    value={
                      (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).titleVerticalAlign ??
                      'top'
                    }
                    onChange={(titleVerticalAlign) =>
                      onChange({
                        projectsSplit: {
                          ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                          titleVerticalAlign,
                        },
                      })
                    }
                    columns={2}
                  />
                  <WorkOptionGrid
                    label="Description placement"
                    options={PORTFOLIO_WORK_SPLIT_DESCRIPTION_PLACEMENT_OPTIONS}
                    value={
                      (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).descriptionPlacement ??
                      'with-title'
                    }
                    onChange={(descriptionPlacement) =>
                      onChange({
                        projectsSplit: {
                          ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                          descriptionPlacement,
                          ...(descriptionPlacement === 'opposite'
                            ? { showDescription: true }
                            : {}),
                        },
                      })
                    }
                    columns={2}
                  />
                  {(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).descriptionPlacement ===
                  'opposite' ? (
                    <WorkOptionGrid
                      label="Description vertical"
                      options={PORTFOLIO_WORK_SPLIT_DESCRIPTION_VERTICAL_OPTIONS}
                      value={
                        (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS)
                          .descriptionVerticalAlign ?? 'bottom'
                      }
                      onChange={(descriptionVerticalAlign) =>
                        onChange({
                          projectsSplit: {
                            ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                            descriptionVerticalAlign,
                          },
                        })
                      }
                      columns={2}
                    />
                  ) : null}
                </>
              ) : null}

              <WorkSlider
                label="Thumbnail size"
                options={PORTFOLIO_WORK_SPLIT_THUMBNAIL_SIZE_OPTIONS}
                value={
                  (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).thumbnailSize ?? 'xl'
                }
                onChange={(thumbnailSize) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      thumbnailSize,
                    },
                  })
                }
              />

              <WorkOptionGrid
                label="Thumbnail radius"
                options={PORTFOLIO_WORK_SPLIT_RADIUS_OPTIONS}
                value={
                  (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).thumbnailRadius ?? 'none'
                }
                onChange={(thumbnailRadius) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      thumbnailRadius,
                    },
                  })
                }
                columns={2}
              />

              <WorkSlider
                label="Row spacing"
                options={PORTFOLIO_WORK_SPLIT_ROW_GAP_OPTIONS}
                value={(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).rowGap ?? 'md'}
                onChange={(rowGap) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      rowGap,
                    },
                  })
                }
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-carousel' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Carousel options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Image-only horizontal carousel. Configure slide size, ratio, radius, and spacing.
                </p>
              </div>

              <WorkSlider
                label="Image size"
                options={PORTFOLIO_WORK_CAROUSEL_IMAGE_SIZE_OPTIONS}
                value={
                  (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).imageSize ?? 'lg'
                }
                onChange={(imageSize) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      imageSize,
                    },
                  })
                }
              />

              <WorkOptionGrid
                label="Aspect ratio"
                options={PORTFOLIO_WORK_CAROUSEL_ASPECT_OPTIONS}
                value={
                  (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).aspectRatio ??
                  'square'
                }
                onChange={(aspectRatio) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      aspectRatio,
                    },
                  })
                }
                columns={3}
              />

              <WorkOptionGrid
                label="Image radius"
                options={PORTFOLIO_WORK_CAROUSEL_RADIUS_OPTIONS}
                value={
                  (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).imageRadius ?? 'none'
                }
                onChange={(imageRadius) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      imageRadius,
                    },
                  })
                }
                columns={3}
              />

              <WorkSlider
                label="Gap between images"
                options={PORTFOLIO_WORK_CAROUSEL_GAP_OPTIONS}
                value={(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).gap ?? 'md'}
                onChange={(gap) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      gap,
                    },
                  })
                }
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-spotlight' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Spotlight options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Cadre fin — détails à gauche, sélecteur de titres à droite. Palette Work
                  respectée.
                </p>
              </div>

              <WorkPreviewCardGrid
                label="Disposition"
                options={PORTFOLIO_WORK_SPOTLIGHT_LIST_SIDE_OPTIONS.map((option) => ({
                  ...option,
                  // Details (the "ink" block) sit opposite the title list.
                  glyph: option.value === 'right' ? workSideLeftGlyph() : workSideRightGlyph(),
                }))}
                value={
                  (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).listSide ?? 'right'
                }
                onChange={(listSide) =>
                  onChange({
                    projectsSpotlight: {
                      ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                      listSide,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Frame radius"
                options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
                value={
                  (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).frameRadius ?? 'xl'
                }
                onChange={(frameRadius) =>
                  onChange({
                    projectsSpotlight: {
                      ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                      frameRadius,
                    },
                  })
                }
                columns={3}
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-showcase' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Showcase options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Large media + details. Chevrons and three thumbnails switch the active project.
                </p>
              </div>

              <WorkPreviewCardGrid
                label="Media placement"
                options={PORTFOLIO_WORK_SHOWCASE_MEDIA_SIDE_OPTIONS.map((option) => ({
                  ...option,
                  glyph: option.value === 'left' ? workSideLeftGlyph() : workSideRightGlyph(),
                }))}
                value={
                  (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).mediaSide ?? 'left'
                }
                onChange={(mediaSide) =>
                  onChange({
                    projectsShowcase: {
                      ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                      mediaSide,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Media radius"
                options={PORTFOLIO_WORK_SHOWCASE_RADIUS_OPTIONS}
                value={
                  (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).mediaRadius ?? 'xl'
                }
                onChange={(mediaRadius) =>
                  onChange({
                    projectsShowcase: {
                      ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                      mediaRadius,
                    },
                  })
                }
                columns={3}
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-editorial' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Editorial options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Grand numéro + rôle + titre à gauche. À droite : infos sticky, ou miniature seule
                  (sans bordure / radius).
                </p>
              </div>

              <WorkOptionGrid
                label="Panneau droit"
                options={PORTFOLIO_WORK_EDITORIAL_RIGHT_PANEL_OPTIONS}
                value={
                  (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).rightPanel ??
                  'info'
                }
                onChange={(rightPanel) =>
                  onChange({
                    projectsEditorial: {
                      ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                      rightPanel,
                    },
                  })
                }
                columns={2}
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-ledger' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Ledger options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Index typographique (style Framer) — titres, rôles et détails. Aucune miniature.
                </p>
              </div>

              <WorkOptionGrid
                label="Reveal details"
                options={PORTFOLIO_WORK_LEDGER_EXPAND_OPTIONS}
                value={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).expandMode ?? 'hover'}
                onChange={(expandMode) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      expandMode,
                    },
                  })
                }
                columns={3}
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-folio' ? (
            null
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-spec' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Spec options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Fiche technique / datasheet — titre + grille label/valeur. Données seulement, sans
                  miniature.
                </p>
              </div>

              <WorkPreviewCardGrid
                label="Colonnes (écran large)"
                options={PORTFOLIO_WORK_SPEC_COLUMNS_OPTIONS.map((option) => ({
                  ...option,
                  glyph: workColumnsGlyph(option.value === '2' ? 2 : 1),
                }))}
                value={
                  (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showThumbnail === true
                    ? '1'
                    : (String(
                        (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).columnsPerRow ?? 1
                      ) as '1' | '2')
                }
                onChange={(value) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      columnsPerRow: value === '2' ? 2 : 1,
                      // 2-up and outside-left thumbnail are mutually exclusive
                      ...(value === '2' ? { showThumbnail: false } : {}),
                    },
                  })
                }
                columns={2}
              />

              {(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showThumbnail === true ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Miniature activée : affichage forcé en <span className="font-semibold text-neutral-700">1 par ligne</span>,
                  image à l’extérieur à gauche.
                </p>
              ) : null}

              <WorkOptionGrid
                label="Encadrement"
                options={PORTFOLIO_WORK_SPEC_FRAME_OPTIONS}
                value={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).sheetFrame ?? 'none'}
                onChange={(sheetFrame) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      sheetFrame,
                    },
                  })
                }
                columns={2}
              />

              <WorkSlider
                label="Espacement entre projets"
                options={PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS}
                value={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).sheetGap ?? 'xl'}
                onChange={(sheetGap) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      sheetGap,
                    },
                  })
                }
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-case' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Case options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Grande miniature 50/50 à gauche + fiche Spec à droite. Réglage « Hauteur miniature »
                  juste sous Show thumbnail.
                </p>
              </div>

              <WorkSlider
                label="Espacement entre projets"
                options={PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS}
                value={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).sheetGap ?? 'xl'}
                onChange={(sheetGap) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      sheetGap,
                    },
                  })
                }
              />

              <WorkOptionGrid
                label="Encadrement"
                options={PORTFOLIO_WORK_SPEC_FRAME_OPTIONS}
                value={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).sheetFrame ?? 'thin'}
                onChange={(sheetFrame) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      sheetFrame,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Hauteur miniature"
                options={PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS}
                value={
                    (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).thumbnailHeight ?? 'xl'
                  }
                onChange={(thumbnailHeight) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      thumbnailHeight,
                      // Ensure thumbnail is on when picking a height
                      showThumbnail: true,
                    },
                  })
                }
                columns={2}
              />
            </div>
          ) : null}
          </WorkLayoutSettingsBand>
        </div>
        </>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-4">
          <SectionBackgroundSettingsFields
            settings={work}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onBgColorChange }) => {
              const slot = WORK_BACKGROUND_LABEL_SLOTS[label];
              if (!slot) {
                return (
                  <WorkManualColorField
                    label={label}
                    value={value}
                    onChange={onBgColorChange}
                  />
                );
              }
              return (
                <WorkColorField
                  work={work}
                  onChange={onChange}
                  slot={slot}
                  label={label}
                  value={value}
                />
              );
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
