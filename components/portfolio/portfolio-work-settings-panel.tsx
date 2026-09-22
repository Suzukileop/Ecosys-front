'use client';

import { useId, useState, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
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
  PORTFOLIO_WORK_PROJECTS_BOARD_COLUMNS_OPTIONS,
  PORTFOLIO_WORK_PROJECTS_BOARD_THUMBNAIL_SIZE_OPTIONS,
  DEFAULT_PROJECTS_GRID_SETTINGS,
  DEFAULT_PROJECTS_SPLIT_SETTINGS,
  DEFAULT_PROJECTS_CAROUSEL_SETTINGS,
  DEFAULT_PROJECTS_SHOWCASE_SETTINGS,
  DEFAULT_PROJECTS_LEDGER_SETTINGS,
  DEFAULT_PROJECTS_SPEC_SETTINGS,
  DEFAULT_PROJECTS_CASE_SETTINGS,
  DEFAULT_PROJECTS_PRESS_SETTINGS,
  PORTFOLIO_WORK_PRESS_EYEBROW_SIZE_OPTIONS,
  DEFAULT_PROJECTS_DUOTONE_SETTINGS,
  PORTFOLIO_WORK_DUOTONE_SCROLL_MODE_OPTIONS,
  PORTFOLIO_WORK_DUOTONE_THUMBNAIL_EFFECT_OPTIONS,
  PORTFOLIO_WORK_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS,
  PORTFOLIO_WORK_DUOTONE_FRAME_COLOR_OPTIONS,
  PORTFOLIO_WORK_DUOTONE_FRAME_RADIUS_OPTIONS,
  PORTFOLIO_WORK_DUOTONE_SLIDE_NAV_STYLE_OPTIONS,
  PORTFOLIO_WORK_DUOTONE_VERTICAL_GAP_OPTIONS,
  PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS,
  PORTFOLIO_WORK_SPEC_CONSULT_DESIGN_OPTIONS,
  PORTFOLIO_WORK_SPEC_COLUMNS_OPTIONS,
  PORTFOLIO_WORK_SPEC_FRAME_OPTIONS,
  PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS,
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
  PORTFOLIO_WORK_SHOWCASE_MEDIA_SIDE_OPTIONS,
  PORTFOLIO_WORK_SHOWCASE_RADIUS_OPTIONS,
  PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS,
  DEFAULT_PROJECTS_CASCADE_SETTINGS,
  PORTFOLIO_WORK_CASCADE_STACK_EFFECT_OPTIONS,
  PORTFOLIO_WORK_CASCADE_CARD_WIDTH_OPTIONS,
  PORTFOLIO_WORK_CASCADE_VERTICAL_GAP_OPTIONS,
  PORTFOLIO_WORK_CASCADE_IMAGE_RADIUS_OPTIONS,
  PORTFOLIO_WORK_CASCADE_CARD_HEIGHT_OPTIONS,
  WORK_PALETTE_TOKEN_OPTIONS,
  WORK_BILLBOARD_WORD_STYLE_OPTIONS,
  WORK_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  workPaletteTokenColor,
  type PortfolioWorkBillboardWordStyle,
  type PortfolioWorkHeaderDesign,
  type PortfolioWorkHeaderTitleSize,
  type PortfolioWorkPaletteToken,
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
          className="min-w-0 cursor-pointer truncate text-sm font-medium text-neutral-950"
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

/** S/M/L/XL, each button's own label rendered at the size it represents —
 *  the pill illustrates the scale directly, no separate value readout needed. */
const WORK_SIZE_PILL_OPTIONS: { value: PortfolioWorkHeaderTitleSize; label: string; fontPx: number }[] = [
  { value: 'sm', label: 'S', fontPx: 12 },
  { value: 'md', label: 'M', fontPx: 15 },
  { value: 'lg', label: 'L', fontPx: 18 },
  { value: 'xl', label: 'XL', fontPx: 22 },
];

function WorkSizePill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioWorkHeaderTitleSize;
  onChange: (value: PortfolioWorkHeaderTitleSize) => void;
}) {
  return (
    <div>
      <p className="pf-work-block-label pf-work-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-work-segment grid grid-cols-4 gap-[3px] p-[3px]"
        data-compact="true"
      >
        {WORK_SIZE_PILL_OPTIONS.map((option) => {
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
              className="pf-work-segment-btn flex items-center justify-center px-2.5 py-2 font-semibold leading-none"
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

/** Mini previews for the Billboard "Big word style" picker — a real "Aa" rendered
 *  in each treatment instead of a plain label. */
function workBillboardWordStyleGlyph(style: PortfolioWorkBillboardWordStyle): ReactNode {
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
          className="pf-work-mini-ink"
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
            className="pf-work-mini-ink"
            opacity={0.4}
            style={{ filter: 'blur(2px)' }}
          >
            Aa
          </text>
          <text x="32" y="23" textAnchor="middle" fontSize="19" fontWeight={900} className="pf-work-mini-ink">
            Aa
          </text>
        </>
      );
    case 'simple':
      return (
        <text x="32" y="23" textAnchor="middle" fontSize="19" fontWeight={900} className="pf-work-mini-ink">
          Aa
        </text>
      );
    default: {
      const _exhaustive: never = style;
      return _exhaustive;
    }
  }
}

/** Mini swatch for a palette-token color picker — the actual resolved color,
 *  not just a text label. */
function workPaletteTokenGlyph(token: PortfolioWorkPaletteToken): ReactNode {
  return (
    <circle
      cx="32"
      cy="17"
      r="8"
      fill={workPaletteTokenColor(token)}
      style={{
        stroke: 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 22%, transparent)',
        strokeWidth: 1,
      }}
    />
  );
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
          <rect className="pf-work-mini-mute" x="4" y="4" width="112" height="64" rx="4" opacity={0.45} />
          <WorkMiniType x={10} y={17} size={6}>
            001
          </WorkMiniType>
          <rect className="pf-work-mini-ink" x="10" y="45" width="72" height="8" rx="2" />
          <rect className="pf-work-mini-ink" x="10" y="56" width="52" height="8" rx="2" />
          <rect className="pf-work-mini-accent" x="86" y="59" width="24" height="2" rx="1" />
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
    case 'projects-spec':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="10" y="10" width="58" height="7" rx="2" />
          <rect className="pf-work-mini-mute" x="10" y="25" width="70" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="10" y="32" width="60" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="10" y="43" width="40" height="2.4" rx="1.2" opacity={0.55} />
          <rect
            className="pf-work-mini-ring"
            x="80"
            y="8"
            width="30"
            height="22"
            rx="3"
            strokeDasharray="2.5 2.5"
          />
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
    case 'projects-press':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-mute" x="6" y="6" width="108" height="1" />
          {[0, 1].map((i) => (
            <g key={i}>
              <rect className="pf-work-mini-ink" x="8" y={12 + i * 24} width="20" height="20" rx="1" />
              <rect className="pf-work-mini-mute" x="34" y={14 + i * 24} width="30" height="3" rx="1.5" />
              <rect className="pf-work-mini-ink" x="34" y={21 + i * 24} width="50" height="4" rx="2" />
            </g>
          ))}
        </WorkMiniSlide>
      );
    case 'projects-duotone':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="8" y="10" width="48" height="6" rx="2" />
          <rect className="pf-work-mini-mute" x="8" y="22" width="36" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="8" y="29" width="30" height="3" rx="1.5" />
          <rect className="pf-work-mini-ring" x="62" y="8" width="48" height="48" rx="2" />
          <rect className="pf-work-mini-mute" x="8" y="6" width="1" height="52" />
        </WorkMiniSlide>
      );
    case 'projects-cascade':
      return (
        <WorkMiniSlide>
          {/* A second, slightly offset card peeking out behind — the stacking cascade cue. */}
          <rect className="pf-work-mini-mute" x="4" y="4" width="108" height="44" rx="2" opacity="0.35" />
          <rect className="pf-work-mini-ink" x="8" y="10" width="42" height="6" rx="2" />
          <rect className="pf-work-mini-mute" x="8" y="22" width="34" height="3" rx="1.5" />
          <rect className="pf-work-mini-mute" x="8" y="29" width="26" height="3" rx="1.5" />
          <rect className="pf-work-mini-ring" x="66" y="8" width="42" height="34" rx="2" />
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

/** Collapsed-state row shared by every design/header choice grid: a compact scaled-down
 *  thumbnail, the selected design's name, and a trailing chevron — the whole row opens the
 *  grid. The thumbnail wraps whatever wireframe is passed (sized for a full-width card) in a
 *  fixed 64×40 box and scales it down, instead of the old wide preview box that left a lot of
 *  empty space on both sides of the much narrower mini-schema it centered. */
function WorkDesignSummaryRow({
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
      <p className="pf-work-block-label">{label}</p>
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

/** The main "Section design" picker — collapses to the selected design; click to expand and change. */
function WorkDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioWorkSectionDesign;
  onChange: (value: PortfolioWorkSectionDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-work-block-label !mb-0">Section design</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <WorkPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <WorkDesignWireframe design={option.value} />
              </WorkPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <WorkDesignSummaryRow label="Section design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <WorkDesignWireframe design={value} />
    </WorkDesignSummaryRow>
  );
}

/** Mini wireframes for the 5 "Header design" picker cards. */
function WorkHeaderWireframe({ design }: { design: PortfolioWorkHeaderDesign }) {
  switch (design) {
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
          <rect className="pf-work-mini-mute" x="10" y="12" width="4" height="4" />
          <rect className="pf-work-mini-mute" x="20" y="13" width="90" height="1" />
          <WorkMiniType x={10} y={40} size={22}>
            04
          </WorkMiniType>
          <rect className="pf-work-mini-mute" x="46" y="22" width="1" height="18" />
          <rect className="pf-work-mini-ink" x="54" y="24" width="46" height="7" rx="2" />
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
    case 'split-heading':
      return (
        <WorkMiniSlide>
          <rect className="pf-work-mini-ink" x="10" y="20" width="58" height="10" rx="2" />
          <rect className="pf-work-mini-mute" x="86" y="18" width="24" height="3" rx="1.5" />
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
  const [showGrid, setShowGrid] = useState(false);
  const selected =
    PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-work-block-label !mb-0">Header design</p>
          <button
            type="button"
            onClick={() => setShowGrid(false)}
            className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
          >
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <WorkPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <WorkHeaderWireframe design={option.value} />
              </WorkPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <WorkDesignSummaryRow label="Header design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <WorkHeaderWireframe design={value} />
    </WorkDesignSummaryRow>
  );
}

const WORK_HEADER_MARGIN_BOTTOM_OPTIONS = [
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
 *  Appended to each design's own advanced-settings branch in the Header tab.
 *  `hideAlignment`/`hideTitleControls` drop controls a given design doesn't
 *  actually consume (e.g. Billboard has no adjustable title size/weight and
 *  ignores header alignment) — dead controls left visible are confusing. */
function WorkHeaderSharedAdvancedControls({
  work,
  onChange,
  hideAlignment = false,
  hideTitleControls = false,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  hideAlignment?: boolean;
  hideTitleControls?: boolean;
}) {
  return (
    <>
      {hideAlignment ? null : (
        <WorkOptionGrid
          label="Header alignment"
          options={[
            { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
            { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
            { value: 'right' as const, label: 'Right', description: 'Right-aligned title and subtitle.' },
          ]}
          value={work.headerAlignment}
          onChange={(headerAlignment) => onChange({ headerAlignment })}
          columns={3}
        />
      )}
      <WorkSlider
        label="Bottom spacing"
        options={WORK_HEADER_MARGIN_BOTTOM_OPTIONS}
        value={work.headerMarginBottom ?? 'md'}
        onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
      />
      {hideTitleControls ? null : (
        <>
          <WorkSizePill
            label="Title size"
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
      )}
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
  // Press's own options (Eyebrow, Intro text, Thumbnail radius) live in the Design tab now,
  // alongside every other design's layout settings — nothing left to show here.
  if (design === 'projects-press') return null;
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
            label="Case study link"
            info="Text link at the bottom of the card, links to the project"
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
                Case study link label
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
                placeholder="View project"
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
            info="Survol : zoom + assombrit + affiche la description"
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
      : design === 'projects-duotone' ? (
        <>
          <WorkOptionGrid
            label="Scroll mode"
            options={PORTFOLIO_WORK_DUOTONE_SCROLL_MODE_OPTIONS}
            value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).scrollMode}
            onChange={(scrollMode) =>
              onChange({
                projectsDuotone: {
                  ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                  scrollMode,
                },
              })
            }
            columns={3}
          />

          <WorkToggleRow
            label="Intro screen"
            checked={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).showIntro}
            onChange={(showIntro) =>
              onChange({
                projectsDuotone: {
                  ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                  showIntro,
                },
              })
            }
          />

          <WorkOptionGrid
            label="Thumbnail effect"
            options={PORTFOLIO_WORK_DUOTONE_THUMBNAIL_EFFECT_OPTIONS}
            value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).thumbnailEffect}
            onChange={(thumbnailEffect) =>
              onChange({
                projectsDuotone: {
                  ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                  thumbnailEffect,
                },
              })
            }
            columns={3}
          />

          <WorkOptionGrid
            label="Thumbnail height"
            options={PORTFOLIO_WORK_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS}
            value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).thumbnailHeight}
            onChange={(thumbnailHeight) =>
              onChange({
                projectsDuotone: {
                  ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                  thumbnailHeight,
                },
              })
            }
            columns={3}
          />

          {(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).scrollMode === 'slide' ? (
            <>
              <WorkOptionGrid
                label="Frame color"
                options={PORTFOLIO_WORK_DUOTONE_FRAME_COLOR_OPTIONS}
                value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).frameColor}
                onChange={(frameColor) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      frameColor,
                    },
                  })
                }
                columns={3}
              />

              <WorkOptionGrid
                label="Frame radius"
                options={PORTFOLIO_WORK_DUOTONE_FRAME_RADIUS_OPTIONS}
                value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).frameRadius}
                onChange={(frameRadius) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      frameRadius,
                    },
                  })
                }
                columns={3}
              />

              <WorkOptionGrid
                label="Slide navigation"
                options={PORTFOLIO_WORK_DUOTONE_SLIDE_NAV_STYLE_OPTIONS}
                value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).slideNavStyle}
                onChange={(slideNavStyle) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      slideNavStyle,
                    },
                  })
                }
                columns={2}
              />

              <WorkToggleRow
                label="Auto-advance"
                checked={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).autoAdvance}
                onChange={(autoAdvance) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      autoAdvance,
                    },
                  })
                }
              />
            </>
          ) : null}

          {(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).scrollMode !== 'slide' ? (
            <>
              <WorkToggleRow
                label="Swap sides"
                checked={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).swapSides}
                onChange={(swapSides) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      swapSides,
                    },
                  })
                }
              />

              <WorkOptionGrid
                label="Vertical rhythm"
                options={PORTFOLIO_WORK_DUOTONE_VERTICAL_GAP_OPTIONS}
                value={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).verticalGap}
                onChange={(verticalGap) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      verticalGap,
                    },
                  })
                }
                columns={4}
              />
            </>
          ) : null}

          {(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).scrollMode === 'scroll' ? (
            <>
              <WorkToggleRow
                label="Alternate sides"
                checked={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).alternateSides}
                onChange={(alternateSides) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      alternateSides,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Full-width title"
                checked={(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS).scrollFullWidthTitle}
                onChange={(scrollFullWidthTitle) =>
                  onChange({
                    projectsDuotone: {
                      ...(work.projectsDuotone ?? DEFAULT_PROJECTS_DUOTONE_SETTINGS),
                      scrollFullWidthTitle,
                    },
                  })
                }
              />
            </>
          ) : null}
        </>
      )
      : design === 'projects-cascade' ? (
        <>
          <WorkToggleRow
            label="Scroll cascade effect"
            info="Sticky cards that cover each other while scrolling — same as Experience > Cards. Disable for a simple stack."
            checked={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).stackEffect !== 'static'}
            onChange={(enabled) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  stackEffect: enabled ? 'cascade' : 'static',
                },
              })
            }
          />

          <WorkToggleRow
            label="Equal card height"
            info="Stretches every card to the height of the tallest one."
            checked={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).equalHeight}
            onChange={(equalHeight) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  equalHeight,
                },
              })
            }
          />

          <WorkOptionGrid
            label="Card width"
            options={PORTFOLIO_WORK_CASCADE_CARD_WIDTH_OPTIONS}
            value={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).cardWidth}
            onChange={(cardWidth) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  cardWidth,
                },
              })
            }
            columns={3}
          />

          <WorkOptionGrid
            label="Vertical rhythm"
            options={PORTFOLIO_WORK_CASCADE_VERTICAL_GAP_OPTIONS}
            value={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).verticalGap}
            onChange={(verticalGap) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  verticalGap,
                },
              })
            }
            columns={3}
          />

          <WorkOptionGrid
            label="Thumbnail radius"
            options={PORTFOLIO_WORK_CASCADE_IMAGE_RADIUS_OPTIONS}
            value={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).imageRadius}
            onChange={(imageRadius) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  imageRadius,
                },
              })
            }
            columns={3}
          />

          <WorkOptionGrid
            label="Thumbnail height"
            options={PORTFOLIO_WORK_CASCADE_CARD_HEIGHT_OPTIONS}
            value={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).cardHeight}
            onChange={(cardHeight) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  cardHeight,
                },
              })
            }
            columns={4}
          />

          <WorkToggleRow
            label="Category"
            checked={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).showCategory}
            onChange={(showCategory) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  showCategory,
                },
              })
            }
          />

          <WorkToggleRow
            label="Role"
            checked={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).showRole}
            onChange={(showRole) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  showRole,
                },
              })
            }
          />

          <WorkToggleRow
            label="Description"
            checked={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).showDescription}
            onChange={(showDescription) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  showDescription,
                },
              })
            }
          />

          <WorkToggleRow
            label="Tags"
            info="Dash-separated list — the project's tags field."
            checked={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).showTags}
            onChange={(showTags) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  showTags,
                },
              })
            }
          />

          <WorkToggleRow
            label="Tools"
            checked={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).showTools}
            onChange={(showTools) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  showTools,
                },
              })
            }
          />

          <WorkToggleRow
            label="Project link"
            checked={(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS).showLink}
            onChange={(showLink) =>
              onChange({
                projectsCascade: {
                  ...(work.projectsCascade ?? DEFAULT_PROJECTS_CASCADE_SETTINGS),
                  showLink,
                },
              })
            }
          />
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
              <WorkToggleRow
                label="Project description"
                checked={work.showCardDescription !== false}
                onChange={(showCardDescription) => onChange({ showCardDescription })}
              />
              <WorkToggleRow
                label="Tools"
                checked={work.showCardTools !== false}
                onChange={(showCardTools) => onChange({ showCardTools })}
              />
            </div>
          </div>

          <SectionColorModeControl
            value={work.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />

          <WorkLayoutDisplayOptions work={work} onChange={onChange} />
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <div>
            <WorkHeaderChoiceGrid
              value={work.headerDesign ?? 'editorial'}
              onChange={(headerDesign) => onChange({ headerDesign })}
            />

            <WorkLayoutSettingsBand motionKey={work.headerDesign ?? 'editorial'}>
              {work.headerDesign === 'index' ? (
                <>
                  <div>
                    <WorkSectionLabel>Rule label</WorkSectionLabel>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Text</p>
                        <input
                          type="text"
                          value={work.indexLabelText}
                          onChange={(event) => onChange({ indexLabelText: event.target.value })}
                          placeholder="Index"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <WorkPreviewCardGrid
                        label="Color"
                        options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: workPaletteTokenGlyph(option.value),
                        }))}
                        value={work.indexLabelColor ?? 'texteFort'}
                        onChange={(indexLabelColor) => onChange({ indexLabelColor })}
                        columns={3}
                      />
                      <WorkSizePill
                        label="Size"
                        value={work.indexLabelSize ?? 'md'}
                        onChange={(indexLabelSize) => onChange({ indexLabelSize })}
                      />
                      <WorkOptionGrid
                        label="Weight"
                        options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
                        value={work.indexLabelWeight ?? 'regular'}
                        onChange={(indexLabelWeight) => onChange({ indexLabelWeight })}
                        columns={4}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <WorkSectionLabel>Counter</WorkSectionLabel>
                    <div className="mt-3 space-y-4">
                      <WorkPreviewCardGrid
                        label="Numeral color"
                        options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: workPaletteTokenGlyph(option.value),
                        }))}
                        value={work.indexNumberColor ?? 'principal'}
                        onChange={(indexNumberColor) => onChange({ indexNumberColor })}
                        columns={3}
                      />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Count label</p>
                        <input
                          type="text"
                          value={work.indexCountLabelText}
                          onChange={(event) => onChange({ indexCountLabelText: event.target.value })}
                          placeholder="Projects"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <WorkSectionLabel>Title</WorkSectionLabel>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Text</p>
                        <input
                          type="text"
                          value={work.indexTitleText}
                          onChange={(event) => onChange({ indexTitleText: event.target.value })}
                          placeholder="Selected work"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <WorkPreviewCardGrid
                        label="Color"
                        options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: workPaletteTokenGlyph(option.value),
                        }))}
                        value={work.indexTitleColor ?? 'texteFort'}
                        onChange={(indexTitleColor) => onChange({ indexTitleColor })}
                        columns={3}
                      />
                      <WorkSizePill
                        label="Size"
                        value={work.indexTitleSize ?? 'md'}
                        onChange={(indexTitleSize) => onChange({ indexTitleSize })}
                      />
                      <WorkOptionGrid
                        label="Weight"
                        options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
                        value={work.indexTitleWeight ?? 'regular'}
                        onChange={(indexTitleWeight) => onChange({ indexTitleWeight })}
                        columns={4}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <WorkSectionLabel>Subtitle</WorkSectionLabel>
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Text</p>
                        <input
                          type="text"
                          value={work.indexSubtitleText}
                          onChange={(event) => onChange({ indexSubtitleText: event.target.value })}
                          placeholder="Selected projects."
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <WorkPreviewCardGrid
                        label="Color"
                        options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: workPaletteTokenGlyph(option.value),
                        }))}
                        value={work.indexSubtitleColor ?? 'texteFort'}
                        onChange={(indexSubtitleColor) => onChange({ indexSubtitleColor })}
                        columns={3}
                      />
                      <WorkSizePill
                        label="Size"
                        value={work.indexSubtitleSize ?? 'md'}
                        onChange={(indexSubtitleSize) => onChange({ indexSubtitleSize })}
                      />
                      <WorkOptionGrid
                        label="Weight"
                        options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
                        value={work.indexSubtitleWeight ?? 'regular'}
                        onChange={(indexSubtitleWeight) => onChange({ indexSubtitleWeight })}
                        columns={4}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} hideTitleControls />
                  </div>
                </>
              ) : work.headerDesign === 'marquee' ? (
                <>
                  <div>
                    <WorkSectionLabel>Words</WorkSectionLabel>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 1</p>
                        <input
                          type="text"
                          value={work.marqueeWord1Text}
                          onChange={(event) => onChange({ marqueeWord1Text: event.target.value })}
                          placeholder="Selected"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 2</p>
                        <input
                          type="text"
                          value={work.marqueeWord2Text}
                          onChange={(event) => onChange({ marqueeWord2Text: event.target.value })}
                          placeholder="Work"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 3</p>
                        <input
                          type="text"
                          value={work.marqueeWord3Text}
                          onChange={(event) => onChange({ marqueeWord3Text: event.target.value })}
                          placeholder="Optional"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Word 4</p>
                        <input
                          type="text"
                          value={work.marqueeWord4Text}
                          onChange={(event) => onChange({ marqueeWord4Text: event.target.value })}
                          placeholder="Optional"
                          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <WorkSectionLabel>Style</WorkSectionLabel>
                    <div className="mt-3 space-y-4">
                      <WorkPreviewCardGrid
                        label="Word color"
                        options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                          ...option,
                          glyph: workPaletteTokenGlyph(option.value),
                        }))}
                        value={work.marqueeWordColor ?? 'principal'}
                        onChange={(marqueeWordColor) => onChange({ marqueeWordColor })}
                        columns={3}
                      />
                      <WorkSizePill
                        label="Size"
                        value={work.marqueeSize ?? 'md'}
                        onChange={(marqueeSize) => onChange({ marqueeSize })}
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-6">
                    <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} hideAlignment hideTitleControls />
                  </div>
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
                  <WorkPreviewCardGrid
                    label="Badge color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.accentCountBadgeColor ?? 'principal'}
                    onChange={(accentCountBadgeColor) => onChange({ accentCountBadgeColor })}
                    columns={3}
                  />
                  <WorkPreviewCardGrid
                    label="Lead color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.accentCountLeadColor ?? 'secondaire'}
                    onChange={(accentCountLeadColor) => onChange({ accentCountLeadColor })}
                    columns={3}
                  />
                  <WorkSizePill
                    label="Size"
                    value={work.accentCountSize ?? 'md'}
                    onChange={(accentCountSize) => onChange({ accentCountSize })}
                  />
                  <WorkOptionGrid
                    label="Lead weight"
                    options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={work.accentCountWeight ?? 'regular'}
                    onChange={(accentCountWeight) => onChange({ accentCountWeight })}
                    columns={4}
                  />
                  <WorkOptionGrid
                    label="Alignment"
                    options={WORK_ACCENT_COUNT_ALIGNMENT_OPTIONS}
                    value={work.accentCountAlignment ?? 'left'}
                    onChange={(accentCountAlignment) => onChange({ accentCountAlignment })}
                    columns={3}
                  />
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} hideAlignment hideTitleControls />
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
                  <WorkPreviewCardGrid
                    label="Label color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.serifLeadLabelColor ?? 'texteFort'}
                    onChange={(serifLeadLabelColor) => onChange({ serifLeadLabelColor })}
                    columns={3}
                  />
                  <WorkSizePill
                    label="Label size"
                    value={work.serifLeadLabelSize ?? 'md'}
                    onChange={(serifLeadLabelSize) => onChange({ serifLeadLabelSize })}
                  />
                  <WorkOptionGrid
                    label="Label weight"
                    options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={work.serifLeadLabelWeight ?? 'regular'}
                    onChange={(serifLeadLabelWeight) => onChange({ serifLeadLabelWeight })}
                    columns={4}
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Title</p>
                    <input
                      type="text"
                      value={work.serifLeadTitleText}
                      onChange={(event) => onChange({ serifLeadTitleText: event.target.value })}
                      placeholder="A curated collection of work, built with care."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <WorkPreviewCardGrid
                    label="Title color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.serifLeadTitleColor ?? 'texteFort'}
                    onChange={(serifLeadTitleColor) => onChange({ serifLeadTitleColor })}
                    columns={3}
                  />
                  <WorkSizePill
                    label="Title size"
                    value={work.serifLeadTitleSize ?? 'md'}
                    onChange={(serifLeadTitleSize) => onChange({ serifLeadTitleSize })}
                  />
                  <WorkOptionGrid
                    label="Title weight"
                    options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={work.serifLeadTitleWeight ?? 'regular'}
                    onChange={(serifLeadTitleWeight) => onChange({ serifLeadTitleWeight })}
                    columns={4}
                  />
                  <WorkPreviewCardGrid
                    label="Subtitle color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.serifLeadSubtitleColor ?? 'texteFort'}
                    onChange={(serifLeadSubtitleColor) => onChange({ serifLeadSubtitleColor })}
                    columns={3}
                  />
                  <WorkSizePill
                    label="Subtitle size"
                    value={work.serifLeadSubtitleSize ?? 'md'}
                    onChange={(serifLeadSubtitleSize) => onChange({ serifLeadSubtitleSize })}
                  />
                  <WorkOptionGrid
                    label="Subtitle weight"
                    options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={work.serifLeadSubtitleWeight ?? 'regular'}
                    onChange={(serifLeadSubtitleWeight) => onChange({ serifLeadSubtitleWeight })}
                    columns={4}
                  />
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} hideTitleControls />
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
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Title</p>
                    <input
                      type="text"
                      value={work.billboardTitleText}
                      onChange={(event) => onChange({ billboardTitleText: event.target.value })}
                      placeholder="Selected work"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <WorkPreviewCardGrid
                    label="Big word style"
                    options={WORK_BILLBOARD_WORD_STYLE_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workBillboardWordStyleGlyph(option.value),
                    }))}
                    value={work.billboardWordStyle ?? 'outline'}
                    onChange={(billboardWordStyle) => onChange({ billboardWordStyle })}
                    columns={3}
                  />
                  <WorkPreviewCardGrid
                    label="Big word color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.billboardWordColor ?? 'principal'}
                    onChange={(billboardWordColor) => onChange({ billboardWordColor })}
                    columns={3}
                  />
                  <WorkPreviewCardGrid
                    label="Title color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.billboardTitleColor ?? 'principal'}
                    onChange={(billboardTitleColor) => onChange({ billboardTitleColor })}
                    columns={3}
                  />
                  <WorkPreviewCardGrid
                    label="Count line color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.billboardMetaColor ?? 'secondaire'}
                    onChange={(billboardMetaColor) => onChange({ billboardMetaColor })}
                    columns={3}
                  />
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} hideAlignment hideTitleControls />
                </>
              ) : work.headerDesign === 'masthead' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 1</p>
                    <input
                      type="text"
                      value={work.mastheadLine1Text}
                      onChange={(event) => onChange({ mastheadLine1Text: event.target.value })}
                      placeholder="Selected work."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 2</p>
                    <input
                      type="text"
                      value={work.mastheadLine2Text}
                      onChange={(event) => onChange({ mastheadLine2Text: event.target.value })}
                      placeholder="Crafted with intent."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Line 3</p>
                    <input
                      type="text"
                      value={work.mastheadLine3Text}
                      onChange={(event) => onChange({ mastheadLine3Text: event.target.value })}
                      placeholder="Delivered with care."
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <WorkPreviewCardGrid
                    label="Headline color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.mastheadHeadlineColor ?? 'principal'}
                    onChange={(mastheadHeadlineColor) => onChange({ mastheadHeadlineColor })}
                    columns={3}
                  />
                  <WorkSizePill
                    label="Headline size"
                    value={work.mastheadHeadlineSize ?? 'md'}
                    onChange={(mastheadHeadlineSize) => onChange({ mastheadHeadlineSize })}
                  />
                  <WorkOptionGrid
                    label="Headline weight"
                    options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={work.mastheadHeadlineWeight ?? 'regular'}
                    onChange={(mastheadHeadlineWeight) => onChange({ mastheadHeadlineWeight })}
                    columns={4}
                  />
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} hideTitleControls />
                </>
              ) : work.headerDesign === 'split-heading' ? (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Title</p>
                    <input
                      type="text"
                      value={work.splitHeadingTitleText}
                      onChange={(event) => onChange({ splitHeadingTitleText: event.target.value })}
                      placeholder="Selected work"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Label</p>
                    <input
                      type="text"
                      value={work.splitHeadingLabelText}
                      onChange={(event) => onChange({ splitHeadingLabelText: event.target.value })}
                      placeholder="Portfolio"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </div>
                  <WorkPreviewCardGrid
                    label="Title color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.splitHeadingTitleColor ?? 'principal'}
                    onChange={(splitHeadingTitleColor) => onChange({ splitHeadingTitleColor })}
                    columns={3}
                  />
                  <WorkSizePill
                    label="Title size"
                    value={work.splitHeadingTitleSize ?? 'md'}
                    onChange={(splitHeadingTitleSize) => onChange({ splitHeadingTitleSize })}
                  />
                  <WorkOptionGrid
                    label="Title weight"
                    options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={work.splitHeadingTitleWeight ?? 'regular'}
                    onChange={(splitHeadingTitleWeight) => onChange({ splitHeadingTitleWeight })}
                    columns={4}
                  />
                  <WorkPreviewCardGrid
                    label="Label color"
                    options={WORK_PALETTE_TOKEN_OPTIONS.map((option) => ({
                      ...option,
                      glyph: workPaletteTokenGlyph(option.value),
                    }))}
                    value={work.splitHeadingLabelColor ?? 'secondaire'}
                    onChange={(splitHeadingLabelColor) => onChange({ splitHeadingLabelColor })}
                    columns={3}
                  />
                  <WorkSizePill
                    label="Label size"
                    value={work.splitHeadingLabelSize ?? 'md'}
                    onChange={(splitHeadingLabelSize) => onChange({ splitHeadingLabelSize })}
                  />
                  <WorkOptionGrid
                    label="Label weight"
                    options={WORK_HEADER_TITLE_WEIGHT_OPTIONS}
                    value={work.splitHeadingLabelWeight ?? 'regular'}
                    onChange={(splitHeadingLabelWeight) => onChange({ splitHeadingLabelWeight })}
                    columns={4}
                  />
                  <WorkHeaderSharedAdvancedControls work={work} onChange={onChange} hideAlignment hideTitleControls />
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
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Board options
                </p>
              </div>

              <WorkPreviewCardGrid
                label="Cards per row (desktop)"
                options={PORTFOLIO_WORK_PROJECTS_BOARD_COLUMNS_OPTIONS.map((option) => ({
                  value: String(option.value) as '1' | '2' | '3' | '4',
                  label: option.label,
                  glyph: workColumnsGlyph(option.value),
                }))}
                value={String(
                  (work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).columnsPerRow ?? 2
                ) as '1' | '2' | '3' | '4'}
                onChange={(columnsPerRow) =>
                  onChange({
                    projectsBoard: {
                      ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                      columnsPerRow: (columnsPerRow === '1'
                        ? 1
                        : columnsPerRow === '3'
                          ? 3
                          : columnsPerRow === '4'
                            ? 4
                            : 2) as 1 | 2 | 3 | 4,
                    },
                  })
                }
                columns={4}
              />

              <WorkToggleRow
                label="Thumbnail"
                info="Also available in General → Display options"
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

              {(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showThumbnail &&
              ((work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).columnsPerRow ?? 2) === 1 ? (
                <WorkSlider
                  label="Thumbnail size"
                  options={PORTFOLIO_WORK_PROJECTS_BOARD_THUMBNAIL_SIZE_OPTIONS}
                  value={
                    (work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).thumbnailSize ?? 'standard'
                  }
                  onChange={(thumbnailSize) =>
                    onChange({
                      projectsBoard: {
                        ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                        thumbnailSize,
                      },
                    })
                  }
                />
              ) : null}
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-accordion' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Accordion options
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

              <WorkToggleRow
                label="Striped rows"
                info="Fond légèrement teinté une ligne sur deux, comme un vrai registre comptable."
                checked={
                  (work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).stripedRows === true
                }
                onChange={(stripedRows) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      stripedRows,
                    },
                  })
                }
              />
            </div>
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

              <WorkToggleRow
                label="Zig-zag layout"
                info="Alterne le côté image/texte à chaque ligne. Désactivé = image toujours à gauche."
                checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).zigzagEnabled !== false}
                onChange={(zigzagEnabled) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      zigzagEnabled,
                    },
                  })
                }
              />
            </div>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-press' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Eyebrow
                </p>
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                  value={(work.projectsPress ?? DEFAULT_PROJECTS_PRESS_SETTINGS).eyebrowText}
                  placeholder="Project"
                  onChange={(event) =>
                    onChange({
                      projectsPress: {
                        ...(work.projectsPress ?? DEFAULT_PROJECTS_PRESS_SETTINGS),
                        eyebrowText: event.target.value,
                      },
                    })
                  }
                />
                <p className="mt-1.5 text-xs text-neutral-400">
                  Small left-column label, aligned with the first thumbnail. Large screens only.
                </p>
              </div>

              <WorkToggleRow
                label="Sticky"
                info="Pins the eyebrow in place while the row feed scrolls past it — large screens only."
                checked={(work.projectsPress ?? DEFAULT_PROJECTS_PRESS_SETTINGS).eyebrowSticky !== false}
                onChange={(eyebrowSticky) =>
                  onChange({
                    projectsPress: {
                      ...(work.projectsPress ?? DEFAULT_PROJECTS_PRESS_SETTINGS),
                      eyebrowSticky,
                    },
                  })
                }
              />

              <WorkOptionGrid
                label="Eyebrow size"
                options={PORTFOLIO_WORK_PRESS_EYEBROW_SIZE_OPTIONS}
                value={(work.projectsPress ?? DEFAULT_PROJECTS_PRESS_SETTINGS).eyebrowSize ?? 'md'}
                onChange={(eyebrowSize) =>
                  onChange({
                    projectsPress: {
                      ...(work.projectsPress ?? DEFAULT_PROJECTS_PRESS_SETTINGS),
                      eyebrowSize,
                    },
                  })
                }
                columns={3}
              />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Intro text
                </p>
                <textarea
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                  value={(work.projectsPress ?? DEFAULT_PROJECTS_PRESS_SETTINGS).introText}
                  placeholder="Optional left-column blurb, under the eyebrow."
                  onChange={(event) =>
                    onChange({
                      projectsPress: {
                        ...(work.projectsPress ?? DEFAULT_PROJECTS_PRESS_SETTINGS),
                        introText: event.target.value,
                      },
                    })
                  }
                />
              </div>

              <WorkOptionGrid
                label="Thumbnail radius"
                options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
                value={(work.projectsPress ?? DEFAULT_PROJECTS_PRESS_SETTINGS).thumbnailRadius ?? 'md'}
                onChange={(thumbnailRadius) =>
                  onChange({
                    projectsPress: {
                      ...(work.projectsPress ?? DEFAULT_PROJECTS_PRESS_SETTINGS),
                      thumbnailRadius,
                    },
                  })
                }
                columns={3}
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
