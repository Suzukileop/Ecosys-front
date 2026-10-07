'use client';

import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import {
  SV_TEXT_FAINT,
  SV_TEXT_MUTED,
  SV_TEXT_STRONG,
  SettingsVariantSwitcher,
  useSettingsVariant,
  type SettingsVariant,
} from '@/components/portfolio/portfolio-settings-variants';

/**
 * Retrofits the Expanded / Compact settings views onto a panel's existing controls.
 *
 * Wrap a Design tab's options in `<SettingsRowsScope>`; inside it every control that renders
 * through `<SettingRow>` (each panel's OptionGrid / Slider / Toggle / swatch pickers do) becomes a
 * row of the chosen view:
 * - Expanded — label + current value on one line, the control under it, hairline between rows.
 * - Compact  — a one-line summary (label, value, chevron); one row opens at a time.
 * Outside a scope `SettingRow` is not used and the controls keep their usual look, so General /
 * Background / Header tabs are untouched.
 */

type RowsState = { view: SettingsVariant; openId: string | null; setOpenId: (id: string | null) => void };

const SettingsRowsContext = createContext<RowsState | null>(null);

/** True inside a `SettingsRowsScope` — a control then renders through `SettingRow`. */
export function useSettingsRows(): boolean {
  return useContext(SettingsRowsContext) !== null;
}

const ROW_DIVIDER = 'border-b border-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_9%,transparent)] last:border-b-0';
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_45%,transparent)]';

function RowSwitch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${FOCUS_RING}`}
      style={{
        backgroundColor: checked
          ? 'var(--pf-palette-texte-fort,#171717)'
          : 'color-mix(in srgb, var(--pf-palette-texte-fort,#171717) 20%, transparent)',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full transition-[left] duration-200 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
        style={{ left: checked ? '1.125rem' : '0.125rem', backgroundColor: 'var(--pf-palette-fond,#ffffff)' }}
      />
    </button>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${SV_TEXT_FAINT}`}
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

/**
 * One setting inside a `SettingsRowsScope`. Pass `toggle` for an on/off setting (rendered as a
 * switch on the label's line in both views); otherwise `children` is the control.
 */
export function SettingRow({
  label,
  value,
  preview,
  info,
  toggle,
  children,
}: {
  label: string;
  /** Current value in words, shown on the label's line. */
  value?: string;
  /** Tiny visual of the value (swatch, glyph) for the compact summary. */
  preview?: ReactNode;
  info?: ReactNode;
  toggle?: { checked: boolean; onChange: (checked: boolean) => void };
  children?: ReactNode;
}) {
  const state = useContext(SettingsRowsContext);
  const id = useId();
  if (!state) return <>{children}</>;

  const labelNode = (size: string, weight: string) => (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className={`truncate ${size} ${weight} ${SV_TEXT_STRONG}`}>{label}</span>
      {info}
    </span>
  );

  if (toggle) {
    return (
      <div data-setting-row className={`flex items-center justify-between gap-4 ${state.view === 'focus' ? 'min-h-14' : 'py-5'} ${ROW_DIVIDER}`}>
        {state.view === 'focus' ? labelNode('text-[14.5px]', 'font-medium') : labelNode('text-[14px]', 'font-semibold')}
        <RowSwitch checked={toggle.checked} onChange={toggle.onChange} label={label} />
      </div>
    );
  }

  if (state.view === 'focus') {
    const open = state.openId === id;
    return (
      <div data-setting-row className={ROW_DIVIDER}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => state.setOpenId(open ? null : id)}
          className={`flex min-h-14 w-full items-center gap-3 rounded-md text-left ${FOCUS_RING}`}
        >
          <span className="flex min-w-0 flex-1">{labelNode('text-[14.5px]', 'font-medium')}</span>
          {preview ? <span className={`flex shrink-0 items-center ${SV_TEXT_MUTED}`}>{preview}</span> : null}
          {value ? (
            <span className={`max-w-[45%] shrink-0 truncate text-[13px] font-medium ${SV_TEXT_MUTED}`}>{value}</span>
          ) : null}
          <Chevron open={open} />
        </button>
        {open ? <div className="pb-6 pt-1">{children}</div> : null}
      </div>
    );
  }

  return (
    <div data-setting-row className={`py-6 ${ROW_DIVIDER}`}>
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        {labelNode('text-[14px]', 'font-semibold')}
        {value ? <span className={`shrink-0 truncate text-[13px] font-medium ${SV_TEXT_MUTED}`}>{value}</span> : null}
      </div>
      {children}
    </div>
  );
}

/**
 * A Design tab's options with the Expanded / Compact switch above them. The chosen view is shared
 * with every other section (remembered in this browser).
 */
export function SettingsRowsScope({ title, children }: { title: string; children: ReactNode }) {
  const [view, setView] = useSettingsVariant();
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <SettingsVariantSwitcher title={title} value={view} onChange={setView} />
      <SettingsRowsContext.Provider value={{ view, openId, setOpenId }}>
        <div key={view} className="pf-settings-rows" style={{ animation: 'pf-exp-layout-body-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
          {children}
        </div>
      </SettingsRowsContext.Provider>
    </div>
  );
}

/** Label of the option whose value is `value` (for a row's summary). */
export function settingValueLabel<T extends string | number>(
  options: readonly { value: T; label: string }[],
  value: T
): string {
  return options.find((option) => option.value === value)?.label ?? '';
}
