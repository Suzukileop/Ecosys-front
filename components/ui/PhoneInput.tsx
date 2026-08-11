'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { COUNTRY_DIAL_CODES, type CountryDialCode } from '@/lib/countryDialCodes';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { formatPhoneNumber, parsePhoneNumber } from '@/lib/phone';

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
};

export function PhoneInput({ value, onChange, disabled = false, id }: PhoneInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const parsed = useMemo(() => parsePhoneNumber(value), [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_DIAL_CODES;
    return COUNTRY_DIAL_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.iso2.toLowerCase().includes(q)
    );
  }, [query]);

  const selectCountry = (country: CountryDialCode) => {
    onChange(formatPhoneNumber(country, parsed.nationalNumber));
    setOpen(false);
    setQuery('');
  };

  const updateNational = (national: string) => {
    onChange(formatPhoneNumber(parsed.country, national));
  };

  return (
    <div ref={rootRef} className="relative flex">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-label="Country code"
        aria-expanded={open}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-l-xl border border-r-0 border-neutral-200 bg-neutral-50 px-2.5 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <CountryFlag iso2={parsed.country.iso2} size="sm" />
        <span className="tabular-nums">{parsed.country.dial}</span>
        <svg className="h-3.5 w-3.5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <input
        id={inputId}
        type="tel"
        inputMode="tel"
        disabled={disabled}
        value={parsed.nationalNumber}
        onChange={(e) => updateNational(e.target.value)}
        placeholder="6 12 34 56 78"
        className="min-w-0 flex-1 rounded-r-xl border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
      />

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[min(100%,320px)] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 p-2 dark:border-neutral-800">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
            {filtered.map((country) => (
              <li key={country.iso2}>
                <button
                  type="button"
                  role="option"
                  aria-selected={country.iso2 === parsed.country.iso2}
                  onClick={() => selectCountry(country)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                    country.iso2 === parsed.country.iso2 ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300' : ''
                  }`}
                >
                  <CountryFlag iso2={country.iso2} />
                  <span className="min-w-0 flex-1 truncate font-medium text-neutral-800 dark:text-neutral-100">
                    {country.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-neutral-500">{country.dial}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-neutral-500">No country found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
