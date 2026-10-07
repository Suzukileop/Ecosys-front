'use client';

import { useState, type ReactNode } from 'react';

/**
 * Two ways to read the same list of settings, switchable by the user:
 *
 * - `flat`  — Expanded: every control visible, one setting after the other, hairline between rows.
 * - `focus` — Compact: each setting is a one-line summary (label, preview, value); one opens at a time.
 *
 * Both read one description (`SettingGroup[]`), so a section describes its settings once.
 *
 * Colors come only from the portfolio palette tokens (`--pf-palette-texte-fort`, `--pf-palette-fond`)
 * mixed at fixed strengths, so every variant reads the same in light and dark.
 */

export type SettingsVariant = 'flat' | 'focus';
export type SettingDensity = 'regular' | 'compact';

export type SettingItem = {
  id: string;
  label: string;
  /** One short hint, shown as an "i" tooltip. */
  info?: string;
  /** Current value in words, for summaries. */
  value?: string;
  /** Tiny visual of the current value (swatch, glyph) for summaries. */
  preview?: ReactNode;
  /** The control. Omit for a switch row (use `toggle`). */
  render?: (density: SettingDensity) => ReactNode;
  /** A plain on/off setting: rendered as a switch on the label's row in every variant. */
  toggle?: { checked: boolean; onChange: (checked: boolean) => void };
  /** Inspector: put the control under the label (text inputs, long lists) instead of beside it. */
  wide?: boolean;
};

export type SettingGroup = { id: string; title: string; items: SettingItem[] };

/* ------------------------------------------------------------------ tokens */

const INK = 'var(--pf-palette-texte-fort,#171717)';
export const SV_TEXT_STRONG = 'text-[color:var(--pf-palette-texte-fort,#171717)]';
export const SV_TEXT_MUTED = 'text-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_58%,transparent)]';
export const SV_TEXT_FAINT = 'text-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_42%,transparent)]';
/** Hairline between rows — a literal class so Tailwind generates it. */
const DIVIDE = 'divide-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_9%,transparent)]';
const CHIP_IDLE =
  'border border-transparent bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_5%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_9%,transparent)]';
const CHIP_ACTIVE =
  'border border-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_42%,transparent)] bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_8%,transparent)]';
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_45%,transparent)]';

/* ------------------------------------------------------------------ shared controls */

/** Equal tiles: a drawn glyph (shape pickers, cards per row) or a short word. */
export function SvChoiceTiles<T extends string>({
  label,
  options,
  value,
  onChange,
  density,
  glyphViewBox = '0 0 40 28',
  stage = false,
  columns,
}: {
  label: string;
  options: readonly { value: T; label: string; glyph?: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  density: SettingDensity;
  glyphViewBox?: string;
  /** Draw the glyph on the small card "stage" used by the 64×34 wireframes. */
  stage?: boolean;
  /** Tiles per row (defaults to one row holding every option). */
  columns?: number;
}) {
  const compact = density === 'compact';
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`grid ${compact ? 'gap-1' : 'gap-2'}`}
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
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={`flex w-full min-w-0 items-center justify-center rounded-lg transition-colors ${FOCUS_RING} ${
              compact ? 'h-8' : option.glyph ? 'h-12' : 'h-10'
            } ${active ? `${CHIP_ACTIVE} ${SV_TEXT_STRONG}` : `${CHIP_IDLE} ${SV_TEXT_MUTED}`}`}
          >
            {option.glyph ? (
              stage ? (
                <svg viewBox={glyphViewBox} className="pf-stack-mini h-8 w-[3.75rem]" aria-hidden>
                  <rect className="pf-stack-mini-stage" x="0.75" y="0.75" width="62.5" height="32.5" rx="6" />
                  {option.glyph}
                </svg>
              ) : (
                <svg viewBox={glyphViewBox} className={compact ? 'h-5 w-8' : 'h-7 w-11'} fill="none" aria-hidden>
                  {option.glyph}
                </svg>
              )
            ) : (
              <span className={`truncate px-1 font-semibold ${compact ? 'text-[12px]' : 'text-[13px]'}`}>
                {option.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Palette swatches: equal buttons (regular) or a row of circles (compact). */
export function SvSwatches({
  label,
  options,
  value,
  onChange,
  density,
}: {
  label: string;
  options: readonly { value: string; label: string; color: string; auto?: boolean }[];
  value: string;
  onChange: (value: string) => void;
  density: SettingDensity;
}) {
  const compact = density === 'compact';
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={compact ? 'flex items-center gap-2' : 'grid gap-2'}
      style={compact ? undefined : { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value;
        const dot = (
          <span
            aria-hidden
            className={`block rounded-full ${compact ? 'h-[18px] w-[18px]' : 'h-4 w-4'} ${
              option.auto ? 'border border-dashed border-current opacity-70' : 'border border-black/10'
            }`}
            style={option.auto ? undefined : { backgroundColor: option.color }}
          />
        );
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={
              compact
                ? `flex h-7 w-7 items-center justify-center rounded-full transition ${FOCUS_RING} ${SV_TEXT_MUTED} ${
                    active ? 'ring-[1.5px] ring-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_55%,transparent)]' : ''
                  }`
                : `flex h-10 w-full items-center justify-center rounded-lg transition-colors ${FOCUS_RING} ${SV_TEXT_MUTED} ${
                    active ? CHIP_ACTIVE : CHIP_IDLE
                  }`
            }
          >
            {dot}
          </button>
        );
      })}
    </div>
  );
}

/** One choice among named items: full-width radio rows (regular) or a native select (compact). */
export function SvPickOne({
  label,
  options,
  value,
  onChange,
  density,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  density: SettingDensity;
}) {
  if (density === 'compact') {
    return (
      <SvSelect label={label} options={options} value={value} onChange={onChange} />
    );
  }
  return (
    <div role="radiogroup" aria-label={label} className="space-y-1.5">
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(option.value)}
            className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold transition-colors ${FOCUS_RING} ${
              on ? `${CHIP_ACTIVE} ${SV_TEXT_STRONG}` : `${CHIP_IDLE} ${SV_TEXT_MUTED}`
            }`}
          >
            <span
              aria-hidden
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                on ? 'border-current' : 'border-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_35%,transparent)]'
              }`}
            >
              {on ? <span className="h-2 w-2 rounded-full bg-current" /> : null}
            </span>
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SvSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <span className="relative block">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-8 w-full cursor-pointer appearance-none truncate rounded-lg pl-2.5 pr-7 text-[12.5px] font-semibold ${FOCUS_RING} ${CHIP_IDLE} ${SV_TEXT_STRONG}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        className={`pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${SV_TEXT_MUTED}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}

/** Text input that only commits non-empty values (a cleared field restores the saved text on blur). */
export function SvTextInput({
  label,
  value,
  placeholder,
  onCommit,
  density,
  maxLength,
  allowEmpty = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onCommit: (value: string) => void;
  density: SettingDensity;
  maxLength?: number;
  /** Commit every keystroke, empty included (links), instead of keeping the saved text. */
  allowEmpty?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (!focused) setDraft(value);
  }
  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      aria-label={label}
      maxLength={maxLength}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        if (!allowEmpty) setDraft(value);
      }}
      onChange={(event) => {
        setDraft(event.target.value);
        if (allowEmpty || event.target.value.trim()) onCommit(event.target.value);
      }}
      className={`w-full rounded-lg font-medium outline-none transition-colors placeholder:text-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_38%,transparent)] focus:border-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_45%,transparent)] ${CHIP_IDLE} ${SV_TEXT_STRONG} ${
        density === 'compact' ? 'h-8 px-2.5 text-[12.5px]' : 'h-11 px-3.5 text-[14px]'
      }`}
    />
  );
}

function SvSwitch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${FOCUS_RING}`}
      style={{
        backgroundColor: checked ? INK : `color-mix(in srgb, ${INK} 20%, transparent)`,
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full transition-[left] duration-200 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
        style={{
          left: checked ? '1.125rem' : '0.125rem',
          backgroundColor: checked ? 'var(--pf-palette-fond,#ffffff)' : 'var(--pf-palette-fond,#ffffff)',
        }}
      />
    </button>
  );
}

function SvInfo({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex shrink-0">
      <span
        role="button"
        tabIndex={0}
        aria-label={`More info: ${text}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => event.stopPropagation()}
        className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full ${SV_TEXT_FAINT} ${FOCUS_RING}`}
      >
        <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="6.1" stroke="currentColor" strokeWidth="1.15" />
          <circle cx="7" cy="4.35" r="0.95" fill="currentColor" />
          <rect x="6.3" y="6.05" width="1.4" height="4.4" rx="0.7" fill="currentColor" />
        </svg>
      </span>
      {open ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium leading-snug text-white shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

function Chevron({ open, className = '' }: { open: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ view switcher */

const VARIANT_STORAGE_KEY = 'pf-settings-variant';

/** The chosen view, remembered in this browser only (a per-viewer convenience). */
export function useSettingsVariant(): [SettingsVariant, (next: SettingsVariant) => void] {
  const [variant, setVariant] = useState<SettingsVariant>(() => {
    try {
      const stored = typeof window === 'undefined' ? null : window.localStorage.getItem(VARIANT_STORAGE_KEY);
      return stored === 'focus' ? 'focus' : 'flat';
    } catch {
      return 'flat';
    }
  });
  const set = (next: SettingsVariant) => {
    setVariant(next);
    try {
      window.localStorage.setItem(VARIANT_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the choice just isn't remembered */
    }
  };
  return [variant, set];
}

function ExpandedIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
      <rect x="2" y="2.5" width="12" height="4.5" rx="1.2" />
      <rect x="2" y="9" width="12" height="4.5" rx="1.2" />
    </svg>
  );
}

function CompactIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
      <path d="M2.5 4h7M2.5 8h7M2.5 12h7" />
      <path d="m12 3.2 1.4 1.4L12 6M12 7.2l1.4 1.4L12 10" />
    </svg>
  );
}

const VIEW_OPTIONS: { value: SettingsVariant; label: string; hint: string; icon: ReactNode }[] = [
  { value: 'flat', label: 'Expanded', hint: 'Every control visible', icon: <ExpandedIcon /> },
  { value: 'focus', label: 'Compact', hint: 'One-line summaries, open one at a time', icon: <CompactIcon /> },
];

/**
 * Two-way view switch, as a segmented control on the right of a small caption — one tap, the
 * current view always visible, nothing hidden in a menu.
 */
export function SettingsVariantSwitcher({
  value,
  onChange,
  title,
}: {
  value: SettingsVariant;
  onChange: (value: SettingsVariant) => void;
  /** Caption on the left (e.g. "Aurora options"). */
  title?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.12em] ${SV_TEXT_FAINT}`}>
        {title ?? 'Options'}
      </span>
      <div
        role="radiogroup"
        aria-label="Settings view"
        className="flex shrink-0 items-center gap-0.5 rounded-full bg-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_6%,transparent)] p-0.5"
      >
        {VIEW_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={option.hint}
              onClick={() => onChange(option.value)}
              data-pf-no-color-transition
              className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold transition-colors ${FOCUS_RING} ${
                active
                  ? `bg-[color:var(--pf-palette-fond,#ffffff)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_16%,transparent)] ${SV_TEXT_STRONG}`
                  : `${SV_TEXT_MUTED} hover:text-[color:var(--pf-palette-texte-fort,#171717)]`
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Expanded */

function FlatView({ groups }: { groups: SettingGroup[] }) {
  return (
    <div className="space-y-11">
      {groups.map((group) => (
        <section key={group.id} aria-label={group.title}>
          <h4 className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${SV_TEXT_FAINT}`}>{group.title}</h4>
          <div className={`divide-y ${DIVIDE}`}>
            {group.items.map((item) =>
              item.toggle ? (
                <div key={item.id} className="flex items-center justify-between gap-4 py-5">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className={`truncate text-[14px] font-semibold ${SV_TEXT_STRONG}`}>{item.label}</span>
                    {item.info ? <SvInfo text={item.info} /> : null}
                  </span>
                  <SvSwitch checked={item.toggle.checked} onChange={item.toggle.onChange} label={item.label} />
                </div>
              ) : (
                <div key={item.id} className="py-6">
                  <div className="mb-3.5 flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className={`truncate text-[14px] font-semibold ${SV_TEXT_STRONG}`}>{item.label}</span>
                      {item.info ? <SvInfo text={item.info} /> : null}
                    </span>
                    {item.value ? (
                      <span className={`shrink-0 truncate text-[13px] font-medium ${SV_TEXT_MUTED}`}>{item.value}</span>
                    ) : null}
                  </div>
                  {item.render?.('regular')}
                </div>
              )
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Compact */

function FocusView({ groups }: { groups: SettingGroup[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="space-y-9">
      {groups.map((group) => (
        <section key={group.id} aria-label={group.title}>
          <h4 className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${SV_TEXT_FAINT}`}>{group.title}</h4>
          <div className={`divide-y ${DIVIDE}`}>
            {group.items.map((item) => {
              if (item.toggle) {
                return (
                  <div key={item.id} className="flex min-h-14 items-center justify-between gap-4">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className={`truncate text-[14.5px] font-medium ${SV_TEXT_STRONG}`}>{item.label}</span>
                      {item.info ? <SvInfo text={item.info} /> : null}
                    </span>
                    <SvSwitch checked={item.toggle.checked} onChange={item.toggle.onChange} label={item.label} />
                  </div>
                );
              }
              const open = openId === item.id;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className={`flex min-h-14 w-full items-center gap-3 rounded-md text-left ${FOCUS_RING}`}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-1.5">
                      <span className={`truncate text-[14.5px] font-medium ${SV_TEXT_STRONG}`}>{item.label}</span>
                      {item.info ? <SvInfo text={item.info} /> : null}
                    </span>
                    {item.preview ? <span className={`flex shrink-0 items-center ${SV_TEXT_MUTED}`}>{item.preview}</span> : null}
                    {item.value ? (
                      <span className={`max-w-[42%] shrink-0 truncate text-[13px] font-medium ${SV_TEXT_MUTED}`}>{item.value}</span>
                    ) : null}
                    <Chevron open={open} className={SV_TEXT_FAINT} />
                  </button>
                  {open ? <div className="pb-6 pt-1">{item.render?.('regular')}</div> : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function SettingsVariantView({ variant, groups }: { variant: SettingsVariant; groups: SettingGroup[] }) {
  const visible = groups.filter((group) => group.items.length > 0);
  return (
    // Re-keyed on the view, so switching plays the same short rise-in as a newly opened band.
    <div key={variant} style={{ animation: 'pf-exp-layout-body-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
      {variant === 'focus' ? <FocusView groups={visible} /> : <FlatView groups={visible} />}
    </div>
  );
}

/** A section's options with the view switch above them — the one thing a design band renders. */
export function SettingsWithViews({
  title,
  groups,
  variant,
  onVariantChange,
}: {
  title: string;
  groups: SettingGroup[];
  variant: SettingsVariant;
  onVariantChange: (value: SettingsVariant) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingsVariantSwitcher title={title} value={variant} onChange={onVariantChange} />
      <SettingsVariantView variant={variant} groups={groups} />
    </div>
  );
}
