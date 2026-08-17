'use client';

import { NATIONALITY_SELECT_OPTIONS } from '@/lib/countries';

export const SERVICE_PROVIDER_MIN_YEARS_OPTIONS = [
  { value: '', label: 'Any experience' },
  { value: '1', label: '1+ years' },
  { value: '3', label: '3+ years' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
  { value: '15', label: '15+ years' },
] as const;

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ClosestFirstToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 whitespace-nowrap">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-orange-500' : 'bg-gray-200 dark:bg-neutral-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Closest first</span>
    </label>
  );
}

function IconFilterSelect({
  id,
  label,
  value,
  active,
  onChange,
  options,
  icon,
  className = '',
}: {
  id: string;
  label: string;
  value: string;
  active: boolean;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
        {icon}
      </span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-10 min-w-[11rem] max-w-full cursor-pointer appearance-none rounded-2xl border bg-white py-2 pl-10 pr-9 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:bg-neutral-950 dark:[color-scheme:dark] ${
          active
            ? 'border-orange-500 text-neutral-900 dark:border-orange-400 dark:text-white'
            : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-500'
        }`}
      >
        {options.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

type ServiceProviderFilterPillsProps = {
  minYearsExperience: number | null;
  nationality: string;
  closestFirst: boolean;
  onYearsChange: (years: number | null) => void;
  onNationalityChange: (code: string) => void;
  onClosestFirstChange: (enabled: boolean) => void;
  idPrefix?: string;
  className?: string;
};

/** Experience · nationality dropdowns + Closest first toggle (Service Provider search). */
export function ServiceProviderFilterPills({
  minYearsExperience,
  nationality,
  closestFirst,
  onYearsChange,
  onNationalityChange,
  onClosestFirstChange,
  idPrefix = 'sp-filter',
  className = '',
}: ServiceProviderFilterPillsProps) {
  const yearsValue = minYearsExperience != null ? String(minYearsExperience) : '';

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`} aria-label="Provider filters">
      <IconFilterSelect
        id={`${idPrefix}-years`}
        label="Years of experience"
        value={yearsValue}
        active={Boolean(yearsValue)}
        onChange={(raw) => {
          const parsed = raw ? Number.parseInt(raw, 10) : null;
          onYearsChange(parsed != null && Number.isFinite(parsed) ? parsed : null);
        }}
        options={SERVICE_PROVIDER_MIN_YEARS_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        icon={<PersonIcon className="h-4 w-4" />}
      />

      <IconFilterSelect
        id={`${idPrefix}-nationality`}
        label="Nationality"
        value={nationality}
        active={Boolean(nationality.trim())}
        onChange={onNationalityChange}
        options={[
          { value: '', label: 'All nationalities' },
          ...NATIONALITY_SELECT_OPTIONS.map((option) => ({
            value: option.code,
            label: option.label,
          })),
        ]}
        icon={<GlobeIcon className="h-4 w-4" />}
        className="min-w-[12rem]"
      />

      <ClosestFirstToggle checked={closestFirst} onChange={onClosestFirstChange} />
    </div>
  );
}
