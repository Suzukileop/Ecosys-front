'use client';

import { useId, useState, type ReactNode } from 'react';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import {
  mergeFaqColorBindings,
  mergeFaqPalette,
  patchFaqColorBinding,
  DEFAULT_FAQ_COLOR_BINDINGS,
  DEFAULT_FAQ_PALETTE,
  type FaqColorSlot,
} from '@/components/portfolio/portfolio-faq-palette-settings';
import { resolveHeroPaletteColor, type HeroPaletteTokenId } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  PORTFOLIO_FAQ_DESIGN_OPTIONS,
  PORTFOLIO_FAQ_BENTO_DUAL_CARD_COLOR_OPTIONS,
  PORTFOLIO_FAQ_BENTO_DUAL_CARD_RADIUS_OPTIONS,
  PORTFOLIO_FAQ_BENTO_DUAL_CARD_BORDER_OPTIONS,
  PORTFOLIO_FAQ_PREMIUM_FONT_SIZE_OPTIONS,
  FAQ_TEXT_COLOR_TOKENS,
  defaultsForFaqDesign,
  type PortfolioFaqSectionSettings,
  type PortfolioFaqDesign,
  type PortfolioFaqBentoDualCardColorToken,
  type PortfolioFaqTextColorToken,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  FAQ_HEADER_DESIGNS_SELECTABLE,
  PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS,
  type PortfolioFaqHeaderDesign,
  type PortfolioFaqHeaderDesignSelectable,
} from '@/components/portfolio/portfolio-faq-header-settings';
import {
  FAQ_HEADER_LAYOUT_GROUP_TITLES,
  FAQ_HEADER_LAYOUT_SPECS,
  faqHeaderLayoutOverride,
  patchFaqHeaderLayoutElement,
  resolveFaqHeaderLayoutOption,
  resolveFaqHeaderLayoutVisible,
  type FaqHeaderLayoutElementSpec,
  type FaqHeaderLayoutGroup,
} from '@/components/portfolio/portfolio-faq-header-layout';
import {
  DEFAULT_FAQ_FRAME,
  FAQ_FRAME_BORDER_COLORS,
  FAQ_FRAME_BORDER_PX,
  FAQ_FRAME_BORDER_WIDTHS,
  FAQ_FRAME_FILL_DEFAULT_OPACITY,
  FAQ_FRAME_FILLS,
  FAQ_FRAME_PADDINGS,
  FAQ_FRAME_RADII,
  FAQ_FRAME_RADIUS_PX,
  FAQ_FRAME_SHADOWS,
  type PortfolioFaqFrameBorderColor,
  type PortfolioFaqFrameBorderWidth,
  type PortfolioFaqFrameFill,
  type PortfolioFaqFramePadding,
  type PortfolioFaqFrameRadius,
  type PortfolioFaqFrameSettings,
  type PortfolioFaqFrameShadow,
} from '@/components/portfolio/portfolio-faq-frame';

export type FaqSubSection = 'general' | 'design' | 'background' | 'header';

const FAQ_SUB_SECTIONS: { id: FaqSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility and defaults.' },
  { id: 'design', label: 'Design', description: 'Layout and visual style.' },
  { id: 'header', label: 'Header', description: 'The title block above the FAQ list.' },
  { id: 'background', label: 'Background', description: 'Fill behind this section.' },
];

/** Map legacy subsection ids (saved UI state / search) onto the current FAQ menu. */
export function normalizeFaqSubSection(value: string | undefined): FaqSubSection {
  if (value === 'general' || value === 'design' || value === 'background' || value === 'header') {
    return value;
  }
  return 'general';
}

/* ---------------------------------------------------------------------- */
/* Shared local building blocks — reuse the same pf-stack-* CSS classes    */
/* every other section's settings panel already draws on (Stack, Info,    */
/* Tools, Team, Gallery), per the design standard's "never recreate a      */
/* standardized component" rule.                                          */
/* ---------------------------------------------------------------------- */

function FaqToggleRow({
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
          <span className="min-w-0 truncate text-sm font-semibold text-neutral-950">{label}</span>
          {info ? <FaqInfoTooltip text={info} /> : null}
        </span>
        <FaqSwitchTrack checked={checked} />
      </span>
    </button>
  );
}

function FaqSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        backgroundColor: checked
          ? 'var(--pf-palette-texte-fort, #171717)'
          : 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 22%, var(--pf-palette-fond, #0a0a0a))',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full transition-[left,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: checked ? '1.125rem' : '0.125rem',
          backgroundColor: checked
            ? 'var(--pf-palette-fond, #ffffff)'
            : 'var(--pf-palette-texte-fort, #ffffff)',
        }}
      />
    </span>
  );
}

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus
 *  instead of a permanent line of text under a toggle. */
function FaqInfoTooltip({ text }: { text: string }) {
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

function FaqMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function FaqPickerCard({
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
            <path d="M4 10.5l3.5 3.5L16 6" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : null}
      {children}
      <span className={compact ? 'mt-1.5 block' : 'mt-2.5 block'}>
        <span className={`pf-stack-card-label min-w-0 font-semibold leading-none tracking-tight ${compact ? 'text-xs' : 'text-sm'}`}>
          {label}
        </span>
      </span>
    </button>
  );
}

function FaqDesignSummaryRow({
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
          <span className="flex w-[116px] shrink-0 origin-center scale-[1.05] items-center justify-center">{children}</span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-950">{name}</span>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden>
          <path d="M7.5 4.5l5 5.5-5 5.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/** Bento Dual's own "Layout" controls — real palette tokens only, no ad-hoc hex field
 *  (matching the Footer Header mechanism's own palette-token convention). Fallbacks
 *  mirror the `@property --pf-palette-*` `initial-value`s in globals.css. */
function faqBentoDualPaletteTokenColor(token: PortfolioFaqBentoDualCardColorToken): string {
  if (token === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  if (token === 'neutre') return 'var(--pf-palette-neutre, #171717)';
  if (token === 'texteMuted') return 'var(--pf-palette-texte-muted, #a3a3a3)';
  return 'var(--pf-palette-principal, #ea580c)';
}

function FaqBentoDualColorSwatches({
  value,
  onChange,
}: {
  value: PortfolioFaqBentoDualCardColorToken;
  onChange: (value: PortfolioFaqBentoDualCardColorToken) => void;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Card color</span>
      <div role="radiogroup" aria-label="Card color" className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {PORTFOLIO_FAQ_BENTO_DUAL_CARD_COLOR_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={option.description}
              onClick={() => onChange(option.value)}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: faqBentoDualPaletteTokenColor(option.value) }}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Generic radiogroup pill picker — used by Bento Dual's own card options and the
 *  General tab's "Font size" scale control. */
function FaqOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-2 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
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

/** 0–100% slider with the live value beside its label (standard rule 1a) — Bento Dual's
 *  card opacity and General → Frame's border/fill opacity. */
function FaqPercentSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-neutral-500">{Math.round(value)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-neutral-900"
      />
    </div>
  );
}

function FaqLayoutSettingsBand({
  children,
  motionKey,
  title = 'Design settings',
}: {
  children: ReactNode;
  motionKey: string;
  title?: string;
}) {
  return (
    <section className="pf-stack-layout-settings" aria-labelledby="faq-layout-settings-title">
      <h3 id="faq-layout-settings-title" className="pf-stack-layout-settings-title">
        {title}
      </h3>
      <div key={motionKey} className="pf-stack-layout-settings-body space-y-6">
        {children}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* DESIGN tab — the top-level layout catalog (same collapsed-preview /     */
/* expand-to-grid mechanism as Stack/Info's own Design tab), plus the      */
/* per-design settings band below it.                                     */
/* ---------------------------------------------------------------------- */

function FaqDesignWireframe({ design }: { design: PortfolioFaqDesign }) {
  switch (design) {
    case 'kinetic-split':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-accent" x="8" y="14" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="22" width="40" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="36" width="30" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="64" y="12" width="48" height="6" rx="2" />
          <rect className="pf-stack-mini-mute" x="64" y="26" width="40" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="64" y="38" width="44" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="64" y="50" width="36" height="3" rx="1.5" />
        </FaqMiniSlide>
      );
    case 'floating-gallery':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="10" width="104" height="1" />
          <rect className="pf-stack-mini-mute" x="8" y="26" width="104" height="1" />
          <rect className="pf-stack-mini-mute" x="8" y="42" width="104" height="1" />
          <rect className="pf-stack-mini-mute" x="8" y="58" width="104" height="1" />
          <rect className="pf-stack-mini-mute" x="10" y="14" width="60" height="4" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="46" width="60" height="4" rx="2" />
          <rect className="pf-stack-mini-ink" x="24" y="24" width="72" height="20" rx="6" opacity={0.9} />
        </FaqMiniSlide>
      );
    case 'editorial-masonry':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="8" width="18" height="2" rx="1" />
          <rect className="pf-stack-mini-ink" x="8" y="20" width="46" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="8" y="27" width="46" height="1" />
          <rect className="pf-stack-mini-mute" x="8" y="35" width="46" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="8" y="42" width="46" height="1" />
          <rect className="pf-stack-mini-mute" x="8" y="50" width="46" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="8" y="57" width="46" height="1" />
          <rect className="pf-stack-mini-mute" x="66" y="30" width="46" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="66" y="37" width="46" height="1" />
          <rect className="pf-stack-mini-mute" x="66" y="45" width="46" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="66" y="52" width="46" height="1" />
          <rect className="pf-stack-mini-mute" x="66" y="60" width="46" height="3" rx="1.5" />
        </FaqMiniSlide>
      );
    case 'prism-cards':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="6" width="104" height="12" rx="5" opacity={0.45} />
          <rect className="pf-stack-mini-ink" x="14" y="10.5" width="48" height="3" rx="1.5" />
          <rect className="pf-stack-mini-accent" x="8" y="22" width="104" height="34" rx="7" />
          <rect className="pf-stack-mini-stage" x="14" y="28.5" width="58" height="4" rx="2" opacity={0.95} />
          <circle className="pf-stack-mini-stage" cx="104" cy="30.5" r="5" opacity={0.95} />
          <rect className="pf-stack-mini-stage" x="14" y="39" width="80" height="2" rx="1" opacity={0.55} />
          <rect className="pf-stack-mini-stage" x="14" y="45" width="64" height="2" rx="1" opacity={0.55} />
          <rect className="pf-stack-mini-mute" x="8" y="60" width="104" height="8" rx="4" opacity={0.3} />
        </FaqMiniSlide>
      );
    case 'star-scroll':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="8" width="46" height="9" rx="2" />
          <text x="106" y="21" textAnchor="middle" fontSize="17" className="pf-stack-mini-ink">
            ✳
          </text>
          <rect className="pf-stack-mini-mute" x="8" y="32" width="104" height="10" rx="5" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="8" y="46" width="104" height="10" rx="5" opacity={0.32} />
          <rect className="pf-stack-mini-mute" x="8" y="60" width="104" height="10" rx="5" opacity={0.32} />
        </FaqMiniSlide>
      );
    case 'tri-grid':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="18" width="30" height="8" rx="2" opacity={0.9} />
          <rect className="pf-stack-mini-mute" x="8" y="30" width="30" height="16" rx="1" opacity={0.5} />
          <rect className="pf-stack-mini-ink" x="45" y="28" width="30" height="8" rx="2" opacity={0.9} />
          <rect className="pf-stack-mini-mute" x="45" y="40" width="30" height="16" rx="1" opacity={0.5} />
          <rect className="pf-stack-mini-ink" x="82" y="18" width="30" height="8" rx="2" opacity={0.9} />
          <rect className="pf-stack-mini-mute" x="82" y="30" width="30" height="16" rx="1" opacity={0.5} />
        </FaqMiniSlide>
      );
    case 'split-index':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="8" width="40" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="30" width="20" height="3" rx="1.5" opacity={0.6} />
          <rect className="pf-stack-mini-ink" x="38" y="26" width="10" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="52" y="28" width="60" height="4" rx="2" />
          <rect className="pf-stack-mini-mute" x="38" y="42" width="10" height="10" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="52" y="44" width="60" height="4" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="38" y="58" width="10" height="10" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="52" y="60" width="60" height="4" rx="2" opacity={0.7} />
        </FaqMiniSlide>
      );
    case 'centered-focus':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-ink" x="30" y="10" width="60" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="20" y="30" width="80" height="4" rx="2" opacity={0.35} />
          <rect className="pf-stack-mini-ink" x="28" y="42" width="64" height="5" rx="2" opacity={0.95} />
          <rect className="pf-stack-mini-mute" x="24" y="54" width="72" height="4" rx="2" opacity={0.3} />
        </FaqMiniSlide>
      );
    case 'bento-dual':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-accent" x="8" y="8" width="50" height="26" rx="6" />
          <rect className="pf-stack-mini-accent" x="62" y="8" width="50" height="26" rx="6" opacity={0.75} />
          <rect className="pf-stack-mini-accent" x="8" y="38" width="50" height="26" rx="6" opacity={0.75} />
          <rect className="pf-stack-mini-accent" x="62" y="38" width="50" height="26" rx="6" />
        </FaqMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Same collapsed-preview / expand-to-grid mechanism as every other
 *  section's own Design tab (Stack, Info, …). */
function FaqDesignChoiceGrid({
  value,
  onChange,
}: {
  value: PortfolioFaqDesign;
  onChange: (value: PortfolioFaqDesign) => void;
}) {
  const [showGrid, setShowGrid] = useState(false);
  const selected = PORTFOLIO_FAQ_DESIGN_OPTIONS.find((option) => option.value === value) ?? PORTFOLIO_FAQ_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-stack-block-label !mb-0">Design</p>
          <button type="button" onClick={() => setShowGrid(false)} className="text-sm font-semibold text-neutral-500 hover:text-neutral-800">
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_FAQ_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <FaqPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <FaqDesignWireframe design={option.value} />
              </FaqPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <FaqDesignSummaryRow label="Design" name={selected.label} onOpen={() => setShowGrid(true)}>
      <FaqDesignWireframe design={value} />
    </FaqDesignSummaryRow>
  );
}

/* ---------------------------------------------------------------------- */
/* HEADER tab — 3 purpose-built title-block designs for FAQ specifically.  */
/* The original 8-design shared header mechanism is frozen (still renders  */
/* for any account with one already saved) but no longer selectable here — */
/* see faq-settings-header-removed-pill-tabs memory.                       */
/* ---------------------------------------------------------------------- */

function FaqHeaderDesignWireframe({ design }: { design: PortfolioFaqHeaderDesignSelectable }) {
  switch (design) {
    case 'editorial':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="9" width="20" height="3" rx="1.5" opacity={0.55} />
          <rect className="pf-stack-mini-ink" x="8" y="20" width="64" height="9" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="32" width="46" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="50" width="80" height="3" rx="1.5" opacity={0.5} />
        </FaqMiniSlide>
      );
    case 'signal':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-mute" x="8" y="8" width="30" height="9" rx="4.5" opacity={0.6} />
          <circle className="pf-stack-mini-accent" cx="14" cy="12.5" r="1.6" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="60" height="9" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="38" width="40" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="82" y="42" width="30" height="3" rx="1.5" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="82" y="48" width="24" height="3" rx="1.5" opacity={0.5} />
        </FaqMiniSlide>
      );
    case 'query':
      return (
        <FaqMiniSlide>
          <text x="98" y="52" textAnchor="middle" fontSize="52" fontWeight={900} className="pf-stack-mini-mute" opacity={0.35}>
            ?
          </text>
          <rect className="pf-stack-mini-mute" x="10" y="14" width="3" height="34" opacity={0.5} />
          <rect className="pf-stack-mini-ink" x="20" y="16" width="52" height="9" rx="2" />
          <rect className="pf-stack-mini-ink" x="20" y="28" width="38" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="20" y="44" width="44" height="3" rx="1.5" opacity={0.5} />
        </FaqMiniSlide>
      );
    case 'dialogue':
      return (
        <FaqMiniSlide>
          <rect className="pf-stack-mini-ink" x="8" y="14" width="34" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="46" y="14" width="26" height="9" rx="2" opacity={0.45} />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="24" height="9" rx="2" />
          <circle className="pf-stack-mini-accent" cx="100" cy="18" r="10" />
          <rect className="pf-stack-mini-mute" x="8" y="42" width="60" height="3" rx="1.5" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="8" y="52" width="104" height="1" opacity={0.4} />
        </FaqMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Same collapsed-preview / expand-to-grid mechanism as the Design tab's own picker. Falls
 *  back to the first selectable design for display when the saved `headerDesign` is one of
 *  the frozen legacy 8 (or unset) — purely a display fallback, doesn't write anything until
 *  the creator actually picks a card, same convention as `FaqDesignChoiceGrid`. */
function FaqHeaderChoiceGrid({
  value,
  onChange,
  showGrid,
  setShowGrid,
}: {
  value: PortfolioFaqHeaderDesign;
  onChange: (value: PortfolioFaqHeaderDesignSelectable) => void;
  /** Owned by the panel so the header's Layout settings can hide while the catalogue is open. */
  showGrid: boolean;
  setShowGrid: (open: boolean) => void;
}) {
  const selected =
    PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS[0];

  if (showGrid) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="pf-stack-block-label !mb-0">Header</p>
          <button type="button" onClick={() => setShowGrid(false)} className="text-sm font-semibold text-neutral-500 hover:text-neutral-800">
            ← Back
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS.map((option) => {
            const active = option.value === value;
            return (
              <FaqPickerCard
                key={option.value}
                active={active}
                label={option.label}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              >
                <FaqHeaderDesignWireframe design={option.value} />
              </FaqPickerCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <FaqDesignSummaryRow label="Header" name={selected.label} onOpen={() => setShowGrid(true)}>
      <FaqHeaderDesignWireframe design={selected.value} />
    </FaqDesignSummaryRow>
  );
}

/* ---------------------------------------------------------------------- */
/* HEADER tab → Layout settings — generated from FAQ_HEADER_LAYOUT_SPECS:  */
/* "This header" (owned by the selected design) + "All headers" (shared).  */
/* ---------------------------------------------------------------------- */

type FaqPatch = (patch: Partial<PortfolioFaqSectionSettings>) => void;

const FAQ_LAYOUT_INPUT_CLASS =
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400';

function FaqLayoutPills({
  label,
  options,
  value,
  onChange,
  columns: columnsProp,
}: {
  label: string;
  options: {
    value: string;
    label: string;
    swatch?: string;
    fontPx?: number;
    fontWeight?: number;
    /** Tiny mini-schema drawn before the label (corner radius, stroke weight, shadow…). */
    preview?: ReactNode;
  }[];
  value: string;
  onChange: (value: string) => void;
  /** Swatch grids with longer names pass 3 so labels never truncate. */
  columns?: number;
}) {
  // One row up to 5 steps (e.g. the 5-step weight scale) — a 4+1 wrap would break the axis.
  const columns = columnsProp ?? Math.min(options.length, 5);
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-2 grid gap-1.5"
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
              aria-label={option.label}
              onClick={() => onChange(option.value)}
              className={`flex items-center justify-center gap-2 rounded-lg py-1.5 font-semibold leading-none transition ${
                columns > 4 ? 'px-1' : 'px-2.5'
              } ${option.fontPx ? 'py-2' : 'text-xs'} ${
                active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
              style={{
                fontSize: option.fontPx ? `${option.fontPx}px` : undefined,
                fontWeight: option.fontWeight,
              }}
            >
              {option.swatch ? (
                <span
                  aria-hidden
                  // Light outline on the dark active pill, or a dark palette color would vanish.
                  className={`h-3 w-3 shrink-0 rounded-full border ${active ? 'border-white/50' : 'border-black/10'}`}
                  style={{ backgroundColor: option.swatch }}
                />
              ) : null}
              {option.preview}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* GENERAL tab → Frame — one opt-in outer frame for whichever design is    */
/* active (the designs draw no stage of their own). portfolio-faq-frame.   */
/* ---------------------------------------------------------------------- */

const FAQ_FRAME_BORDER_WIDTH_LABELS: Record<PortfolioFaqFrameBorderWidth, string> = {
  none: 'None',
  hairline: '1px',
  thin: '2px',
  bold: '4px',
};
const FAQ_FRAME_BORDER_COLOR_LABELS: Record<PortfolioFaqFrameBorderColor, string> = {
  bordure: 'Border',
  texteFort: 'Text',
  texteMuted: 'Muted',
  principal: 'Principal',
  secondaire: 'Secondary',
};
const FAQ_FRAME_FILL_LABELS: Record<PortfolioFaqFrameFill, string> = {
  none: 'None',
  fond: 'Background',
  neutre: 'Neutral',
  texteFort: 'Text',
  principal: 'Principal',
  secondaire: 'Secondary',
};
const FAQ_FRAME_RADIUS_LABELS: Record<PortfolioFaqFrameRadius, string> = { none: 'None', sm: 'S', md: 'M', lg: 'L', xl: 'XL' };
const FAQ_FRAME_PADDING_LABELS: Record<PortfolioFaqFramePadding, string> = { sm: 'S', md: 'M', lg: 'L', xl: 'XL' };
const FAQ_FRAME_SHADOW_LABELS: Record<PortfolioFaqFrameShadow, string> = { none: 'None', soft: 'Soft', deep: 'Deep' };
/** Panel-scale stand-ins for the real shadows (a 12px chip can't carry a 40px blur). */
const FAQ_FRAME_SHADOW_PREVIEW: Record<PortfolioFaqFrameShadow, string> = {
  none: '0 0 0 1px rgba(0, 0, 0, 0.12)',
  soft: '0 1px 3px rgba(0, 0, 0, 0.35)',
  deep: '0 3px 6px rgba(0, 0, 0, 0.55)',
};

/* ---------------------------------------------------------------------- */
/* GENERAL tab → Text colors — one palette token for the questions and one */
/* for the answers, read by all 9 designs (faqTextColorVars + globals.css). */
/* ---------------------------------------------------------------------- */

/** Same short names as the Frame's color pills, so one panel speaks one vocabulary. */
const FAQ_TEXT_COLOR_LABELS: Record<PortfolioFaqTextColorToken, string> = {
  auto: 'Auto',
  principal: 'Principal',
  secondaire: 'Secondary',
  texteFort: 'Text',
};

function FaqTextColorsGroup({
  faq,
  onChange,
  palette,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: FaqPatch;
  palette: Record<HeroPaletteTokenId, string>;
}) {
  const options = FAQ_TEXT_COLOR_TOKENS.map((token) => ({
    value: token,
    label: FAQ_TEXT_COLOR_LABELS[token],
    // "Auto" has no swatch of its own: it is whatever the active design already draws.
    swatch: token === 'auto' ? undefined : resolveHeroPaletteColor(palette, token),
  }));
  return (
    <div className="space-y-5 pt-4">
      <FaqLayoutPills
        label="Question color"
        columns={2}
        value={faq.questionColorToken ?? 'auto'}
        onChange={(value) => onChange({ questionColorToken: value as PortfolioFaqTextColorToken })}
        options={options}
      />
      <FaqLayoutPills
        label="Answer color"
        columns={2}
        value={faq.answerColorToken ?? 'auto'}
        onChange={(value) => onChange({ answerColorToken: value as PortfolioFaqTextColorToken })}
        options={options}
      />
    </div>
  );
}

function FaqFrameGroup({
  faq,
  onChange,
  palette,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: FaqPatch;
  palette: Record<HeroPaletteTokenId, string>;
}) {
  const frame = faq.designFrame ?? DEFAULT_FAQ_FRAME;
  const set = (patch: Partial<PortfolioFaqFrameSettings>) => onChange({ designFrame: { ...frame, ...patch } });
  const swatch = (token: HeroPaletteTokenId) => resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-5 pt-4">
      <FaqToggleRow label="Frame" checked={frame.enabled} onChange={(enabled) => set({ enabled })} />
      {frame.enabled ? (
        <>
          <FaqLayoutPills
            label="Border"
            value={frame.borderWidth}
            onChange={(value) => set({ borderWidth: value as PortfolioFaqFrameBorderWidth })}
            options={FAQ_FRAME_BORDER_WIDTHS.map((width) => ({
              value: width,
              label: FAQ_FRAME_BORDER_WIDTH_LABELS[width],
              // Stroke weight drawn at its real thickness — the scale reads at a glance.
              preview:
                width === 'none' ? undefined : (
                  <span aria-hidden className="block w-3.5 shrink-0 rounded-full bg-current" style={{ height: FAQ_FRAME_BORDER_PX[width] }} />
                ),
            }))}
          />
          {frame.borderWidth !== 'none' ? (
            <>
              <FaqLayoutPills
                label="Border color"
                columns={3}
                value={frame.borderColor}
                onChange={(value) => set({ borderColor: value as PortfolioFaqFrameBorderColor })}
                options={FAQ_FRAME_BORDER_COLORS.map((token) => ({
                  value: token,
                  label: FAQ_FRAME_BORDER_COLOR_LABELS[token],
                  swatch: swatch(token),
                }))}
              />
              <FaqPercentSlider label="Border opacity" value={frame.borderOpacity} onChange={(borderOpacity) => set({ borderOpacity })} />
            </>
          ) : null}
          <FaqLayoutPills
            label="Fill"
            columns={3}
            value={frame.fill}
            onChange={(value) => {
              const fill = value as PortfolioFaqFrameFill;
              // A new fill starts at a readable opacity (text/accent colors low, surfaces solid).
              set({ fill, fillOpacity: fill === 'none' ? frame.fillOpacity : FAQ_FRAME_FILL_DEFAULT_OPACITY[fill] });
            }}
            options={FAQ_FRAME_FILLS.map((token) => ({
              value: token,
              label: FAQ_FRAME_FILL_LABELS[token],
              swatch: token === 'none' ? undefined : swatch(token),
            }))}
          />
          {frame.fill !== 'none' ? (
            <FaqPercentSlider label="Fill opacity" value={frame.fillOpacity} onChange={(fillOpacity) => set({ fillOpacity })} />
          ) : null}
          <FaqLayoutPills
            label="Corners"
            value={frame.radius}
            onChange={(value) => set({ radius: value as PortfolioFaqFrameRadius })}
            options={FAQ_FRAME_RADII.map((radius) => ({
              value: radius,
              label: FAQ_FRAME_RADIUS_LABELS[radius],
              // One corner of the frame, at a proportional radius.
              preview: (
                <span
                  aria-hidden
                  className="block h-3 w-3 shrink-0 border-l-[1.5px] border-t-[1.5px] border-current"
                  style={{ borderTopLeftRadius: Math.min(12, Math.round(FAQ_FRAME_RADIUS_PX[radius] / 3)) }}
                />
              ),
            }))}
          />
          <FaqLayoutPills
            label="Padding"
            value={frame.padding}
            onChange={(value) => set({ padding: value as PortfolioFaqFramePadding })}
            options={FAQ_FRAME_PADDINGS.map((padding) => ({ value: padding, label: FAQ_FRAME_PADDING_LABELS[padding] }))}
          />
          <FaqLayoutPills
            label="Shadow"
            value={frame.shadow}
            onChange={(value) => set({ shadow: value as PortfolioFaqFrameShadow })}
            options={FAQ_FRAME_SHADOWS.map((shadow) => ({
              value: shadow,
              label: FAQ_FRAME_SHADOW_LABELS[shadow],
              preview: (
                <span
                  aria-hidden
                  className="block h-3 w-3 shrink-0 rounded-[3px] bg-white"
                  style={{ boxShadow: FAQ_FRAME_SHADOW_PREVIEW[shadow] }}
                />
              ),
            }))}
          />
          <FaqToggleRow
            label="Glass blur"
            info="Blurs the section background behind the frame. Visible over an image or gradient Background."
            checked={frame.blur}
            onChange={(blur) => set({ blur })}
          />
        </>
      ) : null}
    </div>
  );
}

function FaqHeaderLayoutControl({
  faq,
  design,
  spec,
  onChange,
}: {
  faq: PortfolioFaqSectionSettings;
  design: PortfolioFaqHeaderDesignSelectable;
  spec: FaqHeaderLayoutElementSpec;
  onChange: FaqPatch;
}) {
  const setOverride = (patch: { visible?: boolean; text?: string; choice?: string }) =>
    onChange(patchFaqHeaderLayoutElement(faq, design, spec.key, patch));

  switch (spec.kind) {
    case 'toggle':
      return (
        <FaqToggleRow
          label={spec.label}
          checked={resolveFaqHeaderLayoutVisible(faq, design, spec.key)}
          onChange={(visible) => setOverride({ visible })}
        />
      );
    case 'fieldToggle':
      return (
        <FaqToggleRow
          label={spec.label}
          checked={faq[spec.field] !== false}
          onChange={(checked) => onChange({ [spec.field]: checked })}
        />
      );
    case 'option':
      return (
        <FaqLayoutPills
          label={spec.label}
          options={spec.options}
          value={resolveFaqHeaderLayoutOption(faq, design, spec.key)}
          onChange={(choice) => setOverride({ choice })}
        />
      );
    case 'fieldOption':
      return (
        <FaqLayoutPills
          label={spec.label}
          options={spec.options}
          value={String(faq[spec.field] ?? spec.options[0].value)}
          onChange={(value) => onChange({ [spec.field]: value } as Partial<PortfolioFaqSectionSettings>)}
        />
      );
    case 'text': {
      const hideable = spec.hideable !== false;
      const visible = resolveFaqHeaderLayoutVisible(faq, design, spec.key);
      return (
        <div className="space-y-2">
          {hideable ? (
            <FaqToggleRow label={spec.label} checked={visible} onChange={(next) => setOverride({ visible: next })} />
          ) : (
            <p className="text-sm font-semibold text-neutral-950">{spec.label}</p>
          )}
          {visible ? (
            <input
              type="text"
              value={faqHeaderLayoutOverride(faq, design, spec.key)?.text ?? ''}
              placeholder={spec.placeholder || spec.defaultText}
              aria-label={spec.label}
              onChange={(event) => setOverride({ text: event.target.value })}
              className={FAQ_LAYOUT_INPUT_CLASS}
            />
          ) : null}
        </div>
      );
    }
  }
}

const FAQ_HEADER_LAYOUT_GROUP_ORDER: FaqHeaderLayoutGroup[] = ['this', 'all'];

function FaqHeaderLayoutSettingsBand({ faq, onChange }: { faq: PortfolioFaqSectionSettings; onChange: FaqPatch }) {
  // A saved legacy (frozen) header has no Layout settings of its own — nothing to show.
  if (!(FAQ_HEADER_DESIGNS_SELECTABLE as string[]).includes(faq.headerDesign)) return null;
  const design = faq.headerDesign as PortfolioFaqHeaderDesignSelectable;
  const specs = FAQ_HEADER_LAYOUT_SPECS[design].filter((spec) => !spec.showWhen || spec.showWhen(faq));

  return (
    <FaqLayoutSettingsBand motionKey={design} title="Layout settings">
      {FAQ_HEADER_LAYOUT_GROUP_ORDER.map((group) => {
        const groupSpecs = specs.filter((spec) => spec.group === group);
        if (groupSpecs.length === 0) return null;
        return (
          <div key={group} className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              {FAQ_HEADER_LAYOUT_GROUP_TITLES[group]}
            </p>
            {groupSpecs.map((spec) => (
              <FaqHeaderLayoutControl key={spec.key} faq={faq} design={design} spec={spec} onChange={onChange} />
            ))}
          </div>
        );
      })}
    </FaqLayoutSettingsBand>
  );
}

/** Section-background color fields, bound to FAQ's own hero-shaped palette
 *  (faqPalette / faqColorBindings) — "Fond", "Neutre", "Principal", "Texte
 *  muted" swatches, no free-form hex, same as every other section's
 *  Background tab. */
const FAQ_BACKGROUND_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: 'Fond' },
  { value: 'neutre', label: 'Neutre' },
  { value: 'principal', label: 'Principal' },
  { value: 'texteMuted', label: 'Texte muted' },
];

const FAQ_BACKGROUND_LABEL_SLOTS: Record<string, { slot: FaqColorSlot; field: keyof PortfolioFaqSectionSettings }> = {
  Color: { slot: 'sectionBackground', field: 'sectionBackgroundColor' },
  'Gradient start': { slot: 'sectionGradientFrom', field: 'sectionBackgroundGradientFrom' },
  'Gradient end': { slot: 'sectionGradientTo', field: 'sectionBackgroundGradientTo' },
  'Color A': { slot: 'sectionSplitA', field: 'sectionBackgroundColorA' },
  'Color B': { slot: 'sectionSplitB', field: 'sectionBackgroundColorB' },
};

function FaqBackgroundColorField({
  faq,
  onChange,
  palette,
  bindings,
  label,
  value,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: (patch: Partial<PortfolioFaqSectionSettings>) => void;
  palette: Record<HeroPaletteTokenId, string>;
  bindings: Record<FaqColorSlot, HeroPaletteTokenId>;
  label: string;
  value: string;
}) {
  const mapping = FAQ_BACKGROUND_LABEL_SLOTS[label] ?? FAQ_BACKGROUND_LABEL_SLOTS.Color;
  const usingPalette = faq.useHeroPalette !== false;
  const activeHex = value.trim().toLowerCase();
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        {FAQ_BACKGROUND_PALETTE_TOKENS.map((token) => {
          const hex = resolveHeroPaletteColor(palette, token.value);
          const active = usingPalette ? bindings[mapping.slot] === token.value : hex.toLowerCase() === activeHex;
          return (
            <button
              key={token.value}
              type="button"
              title={token.label}
              aria-label={token.label}
              aria-pressed={active}
              onClick={() =>
                onChange(
                  usingPalette
                    ? (patchFaqColorBinding(faq, mapping.slot, token.value) as Partial<PortfolioFaqSectionSettings>)
                    : { [mapping.field]: hex }
                )
              }
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className="h-8 w-8 rounded-full border-2 transition"
                style={{
                  backgroundColor: hex,
                  borderColor: active ? '#171717' : '#e5e5e5',
                  boxShadow: active ? '0 0 0 2px rgba(23,23,23,0.15)' : 'none',
                }}
              />
              <span className={`text-[11px] font-medium ${active ? 'text-neutral-900' : 'text-neutral-500'}`}>{token.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FaqSettingsPanel({
  faq,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: (patch: Partial<PortfolioFaqSectionSettings>) => void;
  subSection?: FaqSubSection;
  onSubSectionChange?: (value: FaqSubSection) => void;
}) {
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(false);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<FaqSubSection>('general');
  const subSection = normalizeFaqSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: FaqSubSection) => {
    const next = normalizeFaqSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };

  const faqPalette = mergeFaqPalette(DEFAULT_FAQ_PALETTE, faq.faqPalette);
  const faqBindings = mergeFaqColorBindings(DEFAULT_FAQ_COLOR_BINDINGS, faq.faqColorBindings);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FAQ_SUB_SECTIONS.map((section) => (
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
          <FaqToggleRow label="Show FAQ section" checked={faq.enabled} onChange={(enabled) => onChange({ enabled })} />
          <SectionColorModeControl value={faq.colorModeOverride} onChange={(colorModeOverride) => onChange({ colorModeOverride })} />
          <FaqOptionGrid
            label="Font size"
            options={PORTFOLIO_FAQ_PREMIUM_FONT_SIZE_OPTIONS}
            value={faq.premiumFontSize ?? 'medium'}
            onChange={(premiumFontSize) => onChange({ premiumFontSize })}
            columns={3}
          />
          <FaqTextColorsGroup faq={faq} onChange={onChange} palette={faqPalette} />
          <FaqFrameGroup faq={faq} onChange={onChange} palette={faqPalette} />
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-4">
          <FaqDesignChoiceGrid value={faq.design} onChange={(design) => onChange(defaultsForFaqDesign(design))} />

          <FaqLayoutSettingsBand motionKey={faq.design}>
            {faq.design === 'bento-dual' ? (
              <div className="space-y-6">
                <FaqBentoDualColorSwatches
                  value={faq.bentoDualCardColorToken ?? 'secondaire'}
                  onChange={(bentoDualCardColorToken) => onChange({ bentoDualCardColorToken })}
                />
                <FaqOptionGrid
                  label="Card radius"
                  options={PORTFOLIO_FAQ_BENTO_DUAL_CARD_RADIUS_OPTIONS}
                  value={faq.bentoDualCardRadius ?? 'md'}
                  onChange={(bentoDualCardRadius) => onChange({ bentoDualCardRadius })}
                />
                <FaqOptionGrid
                  label="Card border"
                  options={PORTFOLIO_FAQ_BENTO_DUAL_CARD_BORDER_OPTIONS}
                  value={faq.bentoDualCardBorder ?? 'soft'}
                  onChange={(bentoDualCardBorder) => onChange({ bentoDualCardBorder })}
                />
                <FaqPercentSlider
                  label="Card opacity"
                  value={faq.bentoDualCardOpacity ?? 100}
                  onChange={(bentoDualCardOpacity) => onChange({ bentoDualCardOpacity })}
                />
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-neutral-500">
                This design ships with its own fixed visual identity — hover focus, spring-open
                answers, and{' '}
                {faq.design === 'floating-gallery'
                  ? 'a frosted glass panel are'
                  : faq.design === 'editorial-masonry'
                    ? 'an asymmetric offset grid are'
                    : faq.design === 'prism-cards'
                      ? 'a violet-electric color flip are'
                      : faq.design === 'star-scroll'
                        ? 'a scroll-driven spinning star are'
                        : faq.design === 'tri-grid'
                          ? 'an asynchronous three-column parallax are'
                          : faq.design === 'split-index'
                            ? 'a filled index badge on every row are'
                            : faq.design === 'centered-focus'
                              ? 'a soft hover zoom are'
                              : 'a line-by-line reveal are'}{' '}
                all built in. It doesn&rsquo;t expose extra styling controls.
              </p>
            )}
          </FaqLayoutSettingsBand>
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-4">
          <FaqHeaderChoiceGrid
            value={faq.headerDesign}
            onChange={(headerDesign) => onChange({ headerDesign })}
            showGrid={headerCatalogOpen}
            setShowGrid={setHeaderCatalogOpen}
          />
          {headerCatalogOpen ? null : <FaqHeaderLayoutSettingsBand faq={faq} onChange={onChange} />}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-4">
          <SectionBackgroundSettingsFields
            settings={faq}
            onChange={onChange}
            renderColorField={({ label, value }) => (
              <FaqBackgroundColorField faq={faq} onChange={onChange} palette={faqPalette} bindings={faqBindings} label={label} value={value} />
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
