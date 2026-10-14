'use client';

import type { ReactNode } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * The building blocks every section's settings panel shares, so Hero, Stack, Info… read like
 * Global, Navigation and Footer: one tab row, titled groups on a hairline rhythm, one switch,
 * one text field, one chip, and the same "this section is hidden" notice. Palette tokens only
 * (--pf-*), so the panel reads in dark and light alike.
 */

/** The panel's one text field: card tone, hairline, a heavier ring on focus. */
export const PF_TEXT_INPUT =
  'w-full rounded-xl bg-[color:var(--pf-surface)] px-3 py-2.5 text-[14px] text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)] shadow-[inset_0_0_0_1px_var(--pf-palette-bordure)] outline-none transition-shadow focus:shadow-[inset_0_0_0_2px_var(--pf-palette-texte-muted)]';

/** A pill the user toggles (tools, suggestions…): ink when on, hairline when off. */
export function pfChipClass(active: boolean) {
  return `inline-flex min-h-8 items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pf-palette-texte-muted)] disabled:cursor-not-allowed disabled:opacity-40 ${
    active
      ? 'bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]'
      : 'text-[color:var(--pf-palette-texte-fort)] shadow-[inset_0_0_0_1px_var(--pf-palette-bordure)] hover:bg-[color:var(--pf-surface)]'
  }`;
}

/** The settings tabs' pill row: ink pill for the open tab. */
export function SettingsTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const t = useT();
  return (
    <div role="tablist" aria-label={t('Settings sections')} className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`h-8 rounded-full px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pf-palette-texte-muted)] ${
              active
                ? 'bg-[color:var(--pf-palette-texte-fort)] text-[color:var(--pf-palette-fond)]'
                : 'bg-[color:var(--pf-surface)] text-[color:var(--pf-palette-texte-fort)] hover:bg-[color:var(--pf-palette-neutre)]'
            }`}
          >
            {t(tab.label)}
          </button>
        );
      })}
    </div>
  );
}

/** A titled group of settings: hairline above, small label, then its controls. */
export function SettingsGroup({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="pf-gs-section">
      <div className="pf-gs-section-header flex items-center justify-between gap-3">
        <p className="pf-stack-block-label">{label}</p>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/** A field's label: sentence case, quiet — group titles carry the small caps, fields don't. */
export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="block text-[13px] font-medium text-[color:var(--pf-palette-texte-muted)]">{children}</span>;
}

/** The switch every panel uses (same track as Global — see .pf-global-switch-* in globals.css). */
export function SettingsSwitch({ checked }: { checked: boolean }) {
  return (
    <span
      data-checked={checked ? 'true' : 'false'}
      className="pf-global-switch-track relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <span
        data-checked={checked ? 'true' : 'false'}
        className="pf-global-switch-thumb absolute top-0.5 h-4 w-4 rounded-full transition-[left,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ left: checked ? '1.125rem' : '0.125rem' }}
      />
    </span>
  );
}

/** One labelled on/off row; an optional quiet line under it explains the setting. */
export function SettingsSwitchRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="flex w-full items-center justify-between gap-4 py-1 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pf-palette-texte-muted)]"
      >
        <span className="min-w-0 text-[14px] font-medium text-[color:var(--pf-palette-texte-fort)]">{label}</span>
        <SettingsSwitch checked={checked} />
      </button>
      {description ? <span className="text-[13px] leading-5 text-[color:var(--pf-palette-texte-muted)]">{description}</span> : null}
    </div>
  );
}

/** Shown on a tab whose settings change nothing while the section is off — with the way back. */
export function SectionHiddenNotice({ onEnable }: { onEnable: () => void }) {
  const t = useT();
  return (
    <div className="rounded-2xl px-4 py-5 text-center shadow-[inset_0_0_0_1px_var(--pf-palette-bordure)]">
      <p className="text-[14px] font-medium text-[color:var(--pf-palette-texte-fort)]">{t('This section is hidden')}</p>
      <p className="mt-1 text-[13px] text-[color:var(--pf-palette-texte-muted)]">{t('Turn it on to change how it looks.')}</p>
      <button
        type="button"
        onClick={onEnable}
        className="mt-4 inline-flex h-9 items-center rounded-full bg-[color:var(--pf-palette-texte-fort)] px-4 text-[13px] font-semibold text-[color:var(--pf-palette-fond)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pf-palette-texte-muted)]"
      >
        {t('Show section')}
      </button>
    </div>
  );
}

/** The one "selected" mark on picker cards: ink disc, check in the page colour. */
export function SelectedBadge() {
  return (
    <span
      aria-hidden
      className="absolute right-2 top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[color:var(--pf-palette-texte-fort)]"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5">
        <path d="M4 10.5l3.5 3.5L16 6" stroke="var(--pf-palette-fond, #ffffff)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

