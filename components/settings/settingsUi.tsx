'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

export const SETTINGS_CARD_CLASS =
  'overflow-hidden rounded-lg border border-black/10 bg-white dark:border-0 dark:bg-white/[0.06]';

export const PRIMARY_BUTTON_CLASS =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#111111] px-4 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#111111] dark:hover:bg-neutral-200';

export const SECONDARY_BUTTON_CLASS =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-[14px] font-medium text-[#111111] transition-colors duration-200 hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/[0.06]';

export const DANGER_BUTTON_CLASS =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-600/25 bg-white px-4 text-[14px] font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-400/30 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10';

export function SettingsSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-8">
      <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-white">{title}</h2>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[#666666] dark:text-neutral-400">{description}</p>
    </header>
  );
}

export function SettingsCard({
  title,
  description,
  children,
  footer,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className={SETTINGS_CARD_CLASS}>
      {title ? (
        <div className="border-b border-black/[0.05] px-6 py-5 dark:border-white/[0.05]">
          <h3 className="text-[16px] font-semibold text-[#111111] dark:text-white">{title}</h3>
          {description ? (
            <p className="mt-1 text-[14px] leading-relaxed text-[#666666] dark:text-neutral-400">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">{children}</div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-black/[0.05] bg-black/[0.015] px-6 py-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

export function SettingRow({
  label,
  description,
  htmlFor,
  children,
  stacked = false,
}: {
  label: string;
  description?: ReactNode;
  htmlFor?: string;
  children?: ReactNode;
  stacked?: boolean;
}) {
  const labelClass = 'block text-[15px] font-medium text-[#111111] dark:text-white';
  return (
    <div
      className={`flex gap-4 px-6 py-5 ${
        stacked ? 'flex-col' : 'flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-8'
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
          <div className="mt-1 text-[14px] leading-relaxed text-[#666666] dark:text-neutral-400">{description}</div>
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
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? 'bg-[#111111] dark:bg-white' : 'bg-black/[0.12] dark:bg-white/[0.16]'
      }`}
    >
      <span
        aria-hidden
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 dark:bg-[#111111] ${
          checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5 dark:bg-neutral-300'
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
    <SettingRow label={label} description={description}>
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
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex w-full flex-wrap gap-1 rounded-lg border border-black/10 p-1 sm:w-auto dark:border-white/10"
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
            className={`h-9 flex-1 whitespace-nowrap rounded-md px-3.5 text-[14px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 disabled:cursor-not-allowed sm:flex-none ${
              active
                ? 'bg-[#111111] font-medium text-white dark:bg-white dark:text-[#111111]'
                : 'text-[#444444] hover:bg-black/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.06]'
            }`}
          >
            {option.label}
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
      <label htmlFor={id} className="text-[14px] font-medium text-[#111111] dark:text-white">
        {label}
      </label>
      <div
        className={`flex h-11 items-center rounded-lg border bg-white transition-colors duration-200 focus-within:border-[#111111] dark:bg-white/[0.03] dark:focus-within:border-white/60 ${
          error ? 'border-red-500/60' : 'border-black/10 dark:border-white/10'
        } ${input.disabled || input.readOnly ? 'bg-black/[0.02] dark:bg-white/[0.02]' : ''}`}
      >
        {prefix ? <span className="pl-3.5 text-[15px] text-[#888888] dark:text-neutral-500">{prefix}</span> : null}
        <input
          {...input}
          id={id}
          aria-invalid={error ? true : undefined}
          className={`h-full w-full min-w-0 bg-transparent text-[15px] text-[#111111] outline-none placeholder:text-[#999999] read-only:text-[#666666] disabled:text-[#888888] dark:text-white dark:placeholder:text-neutral-600 dark:read-only:text-neutral-400 ${
            prefix ? 'pl-0.5 pr-3.5' : 'px-3.5'
          }`}
        />
      </div>
      {error ? (
        <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-[13px] text-[#888888] dark:text-neutral-500">{hint}</p>
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

export function formatSettingsDate(value: string | null | undefined, withTime = false): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}
