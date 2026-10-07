'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Controls shared by the Header tab of the portfolio sections (Tools today; Services carries its own
 * copies of the same pieces). They are settings-agnostic: a section hands over the keys it stores
 * each value under and receives plain `{ key: value }` patches back.
 */

export type HeaderPaletteToken = 'principal' | 'secondaire' | 'texteFort';
export type HeaderTextSize = 'sm' | 'md' | 'lg' | 'xl';
export type HeaderTextWeight = 'light' | 'regular' | 'semibold' | 'bold';
export type HeaderPatch = Record<string, string | boolean | number>;

/** Chosen option: a light border and a faint tint instead of a solid fill — reads the same in light and dark. */
const PILL_ACTIVE =
  'border border-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_40%,transparent)] bg-[color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_7%,transparent)] text-[color:var(--pf-palette-texte-fort,#171717)]';
const PILL_IDLE = 'border border-transparent bg-neutral-100 text-neutral-600 hover:bg-neutral-200';

export const HEADER_INPUT_CLASS =
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400';

export function HeaderGroupLabel({ children }: { children: string }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{children}</p>;
}

function HeaderFieldLabel({ children }: { children: string }) {
  return <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{children}</p>;
}

/** Hairline-separated block under a design's text fields. */
export function HeaderBlock({ children }: { children: ReactNode }) {
  return <div className="border-t border-neutral-200/70 pt-9">{children}</div>;
}

export function HeaderTextField({
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
      <HeaderFieldLabel>{label}</HeaderFieldLabel>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={2}
          aria-label={label}
          className={`mt-2 ${HEADER_INPUT_CLASS} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`mt-2 ${HEADER_INPUT_CLASS}`}
        />
      )}
    </div>
  );
}

/** Compact pill picker for simple choices (alignment, spacing, word style). */
export function HeaderOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
}) {
  const cols = columns ?? Math.min(Math.max(options.length, 1), 4);
  return (
    <div>
      <HeaderGroupLabel>{label}</HeaderGroupLabel>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-3 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
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
              className={`rounded-lg px-2.5 py-2 text-center text-xs font-semibold transition ${
                active ? PILL_ACTIVE : PILL_IDLE
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

export const HEADER_SIZE_STEPS: { value: HeaderTextSize; tick: string; name: string }[] = [
  { value: 'sm', tick: 'S', name: 'Small' },
  { value: 'md', tick: 'M', name: 'Medium' },
  { value: 'lg', tick: 'L', name: 'Large' },
  { value: 'xl', tick: 'XL', name: 'Extra large' },
];

/** `css` is the real font-weight each step is drawn in, so the scale can be read at a glance. */
export const HEADER_WEIGHT_STEPS: { value: HeaderTextWeight; tick: string; css: number }[] = [
  { value: 'light', tick: 'Light', css: 300 },
  { value: 'regular', tick: 'Regular', css: 400 },
  { value: 'semibold', tick: 'Semibold', css: 600 },
  { value: 'bold', tick: 'Bold', css: 800 },
];

/** Horizontal bar with one stop per option; the current step is named on the right of the label. */
export function HeaderSteppedSlider<T extends string>({
  label,
  steps,
  value,
  currentName,
  onChange,
  stepStyle,
}: {
  label: string;
  steps: { value: T; tick: string }[];
  value: T;
  currentName: string;
  onChange: (value: T) => void;
  stepStyle?: (step: { value: T; tick: string }) => CSSProperties;
}) {
  const index = Math.max(0, steps.findIndex((step) => step.value === value));
  const current = steps[index]!;
  return (
    <div>
      <div className="pf-exp-centered-slider-head">
        <HeaderGroupLabel>{label}</HeaderGroupLabel>
        <span className="text-[13px] font-medium text-neutral-600" style={stepStyle ? stepStyle(current) : undefined}>
          {currentName}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={steps.length - 1}
        step={1}
        value={index}
        aria-label={label}
        aria-valuetext={currentName}
        onChange={(event) => {
          const next = steps[Number(event.target.value)];
          if (next) onChange(next.value);
        }}
        className="pf-exp-centered-slider pf-exp-centered-slider--thick"
        style={{ '--pf-exp-slider-fill': `${(index / Math.max(steps.length - 1, 1)) * 100}%` } as CSSProperties}
      />
      <div
        className="pf-exp-centered-slider-ticks"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step) => (
          <button
            key={step.value}
            type="button"
            data-active={step.value === value ? 'true' : 'false'}
            onClick={() => onChange(step.value)}
            style={{ ...(stepStyle ? stepStyle(step) : null), fontSize: 11, textTransform: 'none', letterSpacing: 0 }}
          >
            {step.tick}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Palette token picker: equal buttons with the dot centered, the chosen name on the right of the label. */
export function HeaderColorRow({
  label = 'Color',
  value,
  options,
  resolveColor,
  onChange,
}: {
  label?: string;
  value: HeaderPaletteToken;
  options: readonly { value: HeaderPaletteToken; label: string }[];
  resolveColor: (token: HeaderPaletteToken) => string;
  onChange: (value: HeaderPaletteToken) => void;
}) {
  return (
    <div>
      <div className="pf-exp-centered-slider-head">
        <HeaderGroupLabel>{label}</HeaderGroupLabel>
        <span className="text-[13px] font-medium text-neutral-600">
          {options.find((option) => option.value === value)?.label}
        </span>
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-3 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
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
              className={`flex h-10 w-full items-center justify-center rounded-lg transition ${
                active ? PILL_ACTIVE : PILL_IDLE
              }`}
            >
              <span
                aria-hidden
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ backgroundColor: resolveColor(option.value) }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** One styleable text of a header: which settings keys hold its color / size / weight (any can be absent). */
export type HeaderStyleTarget = {
  id: string;
  label: string;
  color?: { key: string; fallback: HeaderPaletteToken };
  size?: { key: string; fallback: HeaderTextSize };
  weight?: { key: string; fallback: HeaderTextWeight };
};

/**
 * Style editor shared by every header design: pick the text to style (radio — hidden when there is
 * only one), then set only the controls that text actually has: color, size, weight.
 */
export function HeaderStyleTargetsEditor({
  settings,
  onPatch,
  targets,
  initialId,
  title = 'Text style',
  colorOptions,
  resolveColor,
}: {
  settings: object;
  onPatch: (patch: HeaderPatch) => void;
  targets: HeaderStyleTarget[];
  initialId?: string;
  title?: string;
  colorOptions: readonly { value: HeaderPaletteToken; label: string }[];
  resolveColor: (token: HeaderPaletteToken) => string;
}) {
  const [targetId, setTargetId] = useState(initialId ?? targets[0]!.id);
  const target = targets.find((item) => item.id === targetId) ?? targets[0]!;
  const record = settings as Record<string, unknown>;
  const read = <T,>(field: { key: string; fallback: T }): T => (record[field.key] as T | undefined) ?? field.fallback;

  const color = target.color ? read(target.color) : null;
  const size = target.size ? read(target.size) : null;
  const weight = target.weight ? read(target.weight) : null;
  const styled =
    (target.color && color !== target.color.fallback) ||
    (target.size && size !== target.size.fallback) ||
    (target.weight && weight !== target.weight.fallback);

  return (
    <div className="pf-exp-centered-config space-y-8">
      <div className="flex items-center justify-between gap-3">
        <HeaderGroupLabel>{title}</HeaderGroupLabel>
        {styled ? (
          <button
            type="button"
            onClick={() => {
              const patch: HeaderPatch = {};
              for (const field of [target.color, target.size, target.weight]) {
                if (field) patch[field.key] = field.fallback;
              }
              onPatch(patch);
            }}
            className="text-xs font-medium text-neutral-400 underline-offset-2 transition hover:text-neutral-700 hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>

      {targets.length > 1 ? (
        <div
          role="radiogroup"
          aria-label="Text to style"
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${targets.length}, minmax(0, 1fr))` }}
        >
          {targets.map((item) => {
            const on = item.id === target.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTargetId(item.id)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-2 text-[13px] font-semibold transition ${
                  on ? PILL_ACTIVE : PILL_IDLE
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    on ? 'border-current' : 'border-neutral-400'
                  }`}
                >
                  {on ? <span className="h-2 w-2 rounded-full bg-current" /> : null}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {target.color && color ? (
        <HeaderColorRow
          value={color}
          options={colorOptions}
          resolveColor={resolveColor}
          onChange={(next) => onPatch({ [target.color!.key]: next })}
        />
      ) : null}

      {target.size && size ? (
        <HeaderSteppedSlider
          label="Size"
          steps={HEADER_SIZE_STEPS}
          value={size}
          currentName={HEADER_SIZE_STEPS.find((step) => step.value === size)?.name ?? ''}
          onChange={(next) => onPatch({ [target.size!.key]: next })}
        />
      ) : null}

      {target.weight && weight ? (
        <HeaderSteppedSlider
          label="Weight"
          steps={HEADER_WEIGHT_STEPS}
          value={weight}
          currentName={HEADER_WEIGHT_STEPS.find((step) => step.value === weight)?.tick ?? ''}
          onChange={(next) => onPatch({ [target.weight!.key]: next })}
          stepStyle={(step) => ({ fontWeight: HEADER_WEIGHT_STEPS.find((item) => item.value === step.value)?.css })}
        />
      ) : null}
    </div>
  );
}

/** Label / Title / Subtitle, each with color + size + weight, stored as `${prefix}${Label|Title|Subtitle}${Color|Size|Weight}`. */
export function HeaderTextStyleEditor({
  settings,
  onPatch,
  prefix,
  colorOptions,
  resolveColor,
}: {
  settings: object;
  onPatch: (patch: HeaderPatch) => void;
  prefix: string;
  colorOptions: readonly { value: HeaderPaletteToken; label: string }[];
  resolveColor: (token: HeaderPaletteToken) => string;
}) {
  const targets: HeaderStyleTarget[] = (['Label', 'Title', 'Subtitle'] as const).map((name) => ({
    id: name,
    label: name,
    color: { key: `${prefix}${name}Color`, fallback: 'texteFort' },
    size: { key: `${prefix}${name}Size`, fallback: 'md' },
    weight: { key: `${prefix}${name}Weight`, fallback: 'regular' },
  }));
  return (
    <HeaderStyleTargetsEditor
      settings={settings}
      onPatch={onPatch}
      targets={targets}
      initialId="Title"
      colorOptions={colorOptions}
      resolveColor={resolveColor}
    />
  );
}

/**
 * Marquee's words, added one at a time: only Word 1 to start, "Add word" up to four, the last one
 * removable. A removed word is cleared, so the saved header never keeps text the editor no longer shows.
 */
export function HeaderMarqueeWords({
  settings,
  onPatch,
  keys,
  placeholders,
}: {
  settings: object;
  onPatch: (patch: HeaderPatch) => void;
  /** The four settings keys, in order. */
  keys: readonly [string, string, string, string];
  placeholders: readonly [string, string, string, string];
}) {
  const record = settings as Record<string, unknown>;
  const text = (key: string) => (typeof record[key] === 'string' ? (record[key] as string) : '');
  const lastFilled = keys.reduce((last, key, index) => (text(key).trim() ? index : last), -1);
  const [count, setCount] = useState(Math.max(1, lastFilled + 1));

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
      {keys.slice(0, count).map((key, index) => {
        const isLast = index === count - 1;
        return (
          <div key={key}>
            <div className="flex h-5 items-center justify-between gap-2">
              <HeaderFieldLabel>{`Word ${index + 1}`}</HeaderFieldLabel>
              {isLast && count > 1 ? (
                <button
                  type="button"
                  aria-label={`Remove word ${index + 1}`}
                  title="Remove word"
                  onClick={() => {
                    onPatch({ [key]: '' });
                    setCount(count - 1);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              ) : null}
            </div>
            <input
              type="text"
              value={text(key)}
              placeholder={placeholders[index]}
              aria-label={`Word ${index + 1}`}
              onChange={(event) => onPatch({ [key]: event.target.value })}
              className={`mt-2 ${HEADER_INPUT_CLASS}`}
            />
          </div>
        );
      })}
      {count < keys.length ? (
        <div className="flex flex-col">
          <div className="h-5" aria-hidden />
          <button
            type="button"
            onClick={() => setCount(count + 1)}
            className="mt-2 flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 text-sm font-medium text-neutral-500 transition hover:border-neutral-500 hover:text-neutral-800"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add word
          </button>
        </div>
      ) : null}
    </div>
  );
}
