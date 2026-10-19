'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * Settings in the News skin (X palette): the page root carries `news-theme news-feed news-mono`, so the
 * pieces below read the --gn-* tokens. Like My Profile's forms, blocks are not cards: each section sits
 * straight on the page, opened by the same hairline that closes the profile header (`.gn-rail-under`:
 * #E1E8ED / #2F3336). From lg a titled section is two columns — its title and description on the left,
 * its controls on the right — so the wide column reads as a settings sheet rather than a stretched form.
 * Buttons are pills, like My Profile's "Save information" and the rail's "Publish a post".
 */
export const SETTINGS_SECTION_CLASS = 'border-t border-[#E1E8ED] py-6 dark:border-[#2F3336] sm:py-8';

const FOCUS_RING = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

export const PRIMARY_BUTTON_CLASS = `inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[color:var(--gn-primary)] px-5 text-[15px] font-semibold leading-5 text-[color:var(--gn-primary-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`;

export const SECONDARY_BUTTON_CLASS = `inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#CFD9DE] bg-transparent px-5 text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)] transition-colors duration-150 hover:bg-[color:var(--gn-hover)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#536471] ${FOCUS_RING}`;

export const DANGER_BUTTON_CLASS = `inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#F4212E]/50 bg-transparent px-5 text-[15px] font-semibold leading-5 text-[#F4212E] transition-colors duration-150 hover:bg-[#F4212E]/10 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`;

export function SettingsSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-4 px-4 sm:mb-6 sm:px-0">
      <h2 className="text-[24px] font-extrabold leading-[30px] tracking-[-0.015em] text-[color:var(--gn-ink)]">{title}</h2>
      <p className="mt-1.5 max-w-xl text-[15px] leading-5 text-[color:var(--gn-ink2)]">{description}</p>
    </header>
  );
}

export function SettingsCard({
  title,
  description,
  children,
  footer,
  tone = 'default',
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** `danger` sets the title in red (the "Danger zone"). */
  tone?: 'default' | 'danger';
}) {
  /* Rows pad themselves (py-4); the section's own padding replaces theirs at its edges. Untitled, and
     beside the title from lg, the first row starts flush with the section's top. */
  const body = (
    <div className={`min-w-0 [&>*:last-child]:pb-0 ${title ? 'lg:[&>*:first-child]:pt-0' : '[&>*:first-child]:pt-0'}`}>
      {children}
    </div>
  );
  return (
    <section className={`${SETTINGS_SECTION_CLASS} ${title ? 'lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12' : ''}`}>
      {title ? (
        <div className="px-4 pb-1 sm:px-0">
          <h3
            className={`text-[17px] font-bold leading-[22px] ${
              tone === 'danger' ? 'text-[#F4212E]' : 'text-[color:var(--gn-ink)]'
            }`}
          >
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="min-w-0">
        {body}
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-3 px-4 pt-5 sm:px-0">{footer}</div>
        ) : null}
      </div>
    </section>
  );
}

export function SettingRow({
  label,
  description,
  htmlFor,
  children,
  stacked = false,
  inline = false,
}: {
  label: string;
  description?: ReactNode;
  htmlFor?: string;
  children?: ReactNode;
  stacked?: boolean;
  /** Keep the control on the right even on phones (toggles). */
  inline?: boolean;
}) {
  const labelClass = 'block text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)] [overflow-wrap:anywhere]';
  return (
    <div
      className={`flex gap-3 px-4 py-4 sm:px-0 ${
        stacked
          ? 'flex-col'
          : inline
            ? 'flex-row items-center justify-between sm:gap-8'
            : 'flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-8'
      }`}
    >
      <div className="min-w-0">
        {htmlFor ? (
          <label htmlFor={htmlFor} className={labelClass}>
            {label}
          </label>
        ) : (
          <p className={labelClass}>{label}</p>
        )}
        {description ? (
          <div className="mt-1 text-[14px] leading-5 text-[color:var(--gn-ink2)]">{description}</div>
        ) : null}
      </div>
      {children ? <div className={stacked ? 'w-full' : 'shrink-0'}>{children}</div> : null}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      data-pf-no-color-transition
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING} ${
        checked ? 'bg-[color:var(--gn-primary)]' : 'bg-[#CFD9DE] dark:bg-[#3E4144]'
      }`}
    >
      <span
        aria-hidden
        className={`inline-block h-5 w-5 rounded-full shadow-[0_1px_2px_rgba(15,20,25,0.25)] transition-transform duration-200 ${
          checked
            ? 'translate-x-[1.375rem] bg-[color:var(--gn-primary-ink)] rtl:-translate-x-[1.375rem]'
            : 'translate-x-0.5 bg-white dark:bg-[#E7E9EA] rtl:-translate-x-0.5'
        }`}
      />
    </button>
  );
}

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <SettingRow label={label} description={description} inline>
      <Toggle label={label} checked={checked} onChange={onChange} disabled={disabled} />
    </SettingRow>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  label: string;
  disabled?: boolean;
}) {
  const t = useT();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex w-full flex-wrap gap-1 rounded-full bg-[color:var(--gn-field)] p-1 sm:w-auto"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            data-pf-no-color-transition
            className={`h-9 flex-1 whitespace-nowrap rounded-full px-4 text-[14px] leading-5 transition-colors duration-150 disabled:cursor-not-allowed sm:flex-none ${FOCUS_RING} ${
              active
                ? 'bg-[color:var(--gn-primary)] font-semibold text-[color:var(--gn-primary-ink)]'
                : 'font-medium text-[color:var(--gn-ink2)] hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]'
            }`}
          >
            {t(option.label)}
          </button>
        );
      })}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  prefix,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string | null;
  prefix?: string;
}) {
  const generatedId = useId();
  const id = input.id ?? generatedId;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]">
        {label}
      </label>
      <div
        className={`flex h-11 items-center rounded-md bg-[color:var(--gn-field)] transition-shadow duration-150 focus-within:shadow-[inset_0_0_0_2px_var(--gn-ink)] ${
          error ? 'shadow-[inset_0_0_0_1px_#F4212E]' : ''
        } ${input.disabled || input.readOnly ? 'opacity-70' : ''}`}
      >
        {prefix ? <span className="ps-3.5 text-[15px] text-[color:var(--gn-ink2)]">{prefix}</span> : null}
        <input
          {...input}
          id={id}
          aria-invalid={error ? true : undefined}
          className={`h-full w-full min-w-0 bg-transparent text-[15px] text-[color:var(--gn-ink)] outline-hidden placeholder:text-[color:var(--gn-ink3)] read-only:text-[color:var(--gn-ink2)] disabled:text-[color:var(--gn-ink2)] ${
            prefix ? 'pe-3.5 ps-0.5' : 'px-3.5'
          }`}
        />
      </div>
      {error ? (
        <p className="text-[13px] leading-[18px] text-[#F4212E]">{error}</p>
      ) : hint ? (
        <p className="text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function formatSettingsDate(value: string | null | undefined, withTime = false, localeTag = 'en-US'): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(localeTag, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}
