'use client';

import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const FIELD =
  'block h-12 w-full rounded-lg border bg-white px-4 text-[15px] text-[#111111] outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 dark:bg-[#111111] dark:text-white dark:placeholder:text-neutral-500';
const FIELD_OK =
  'border-black/[0.12] hover:border-black/25 focus:border-[#FF5722] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.16)] dark:border-white/[0.14] dark:hover:border-white/25 dark:focus:border-[#FF5722]';
const FIELD_ERROR =
  'border-[#E0431A] focus:shadow-[0_0_0_3px_rgba(224,67,26,0.16)] dark:border-[#FF7A52]';

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-[13px] text-[#E0431A] dark:text-[#FF7A52]" role="alert">
      {children}
    </p>
  );
}

type AuthTextFieldProps = {
  id: string;
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
  labelAside?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className' | keyof UseFormRegisterReturn>;

export function AuthTextField({ id, label, error, registration, labelAside, ...inputProps }: AuthTextFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label htmlFor={id} className="text-[14px] font-medium text-[#111111] dark:text-white">
          {label}
        </label>
        {labelAside}
      </div>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={`${FIELD} ${error ? FIELD_ERROR : FIELD_OK}`}
        {...inputProps}
        {...registration}
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}

type AuthPasswordFieldProps = {
  id: string;
  label: string;
  error?: string;
  autoComplete: string;
  registration: UseFormRegisterReturn;
  placeholder?: string;
  children?: ReactNode;
};

export function AuthPasswordField({
  id,
  label,
  error,
  autoComplete,
  registration,
  placeholder = '••••••••',
  children,
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[14px] font-medium text-[#111111] dark:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`${FIELD} pr-16 ${error ? FIELD_ERROR : FIELD_OK}`}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 inline-flex h-8 -translate-y-1/2 items-center rounded-md px-2.5 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}

export function AuthSubmitButton({
  busy,
  busyLabel,
  children,
}: {
  busy: boolean;
  busyLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#111111] px-5 text-[15px] font-medium text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#111111]"
    >
      {busy ? (
        <>
          <LoadingSpinner size="sm" />
          {busyLabel}
        </>
      ) : (
        <>
          {children}
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </>
      )}
    </button>
  );
}

export function AuthErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-[#E0431A]/25 bg-[#E0431A]/[0.06] px-4 py-3 text-[14px] leading-relaxed text-[#B8330F] dark:border-[#FF7A52]/25 dark:bg-[#FF7A52]/[0.08] dark:text-[#FF9C7D]"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded opacity-70 transition-opacity hover:opacity-100"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
