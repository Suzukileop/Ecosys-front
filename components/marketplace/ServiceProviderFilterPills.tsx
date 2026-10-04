'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faEarthAfrica, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { NATIONALITY_SELECT_OPTIONS } from '@/lib/countries';
import {
  PROVIDER_HAIRLINE_CLASS,
  PROVIDER_INK_CLASS,
  PROVIDER_SURFACE_CLASS,
} from '@/components/marketplace/ProviderDirectoryPrimitives';

const TRIGGER_CLASS = `group/sel flex h-10 w-full items-center rounded-lg border transition-colors duration-200 sm:inline-flex sm:w-auto ${PROVIDER_SURFACE_CLASS}`;
const TRIGGER_IDLE_CLASS = `${PROVIDER_HAIRLINE_CLASS} hover:border-black/15 dark:hover:border-white/20`;
const TRIGGER_ACTIVE_CLASS = 'border-[#111111]/25 dark:border-white/25';

const nationalityOptions = [
  { value: '', label: 'All nationalities' },
  ...NATIONALITY_SELECT_OPTIONS.map((option) => ({ value: option.code, label: option.label })),
];

export const SERVICE_PROVIDER_MIN_YEARS_OPTIONS = [
  { value: '', label: 'Any experience' },
  { value: '1', label: '1+ years' },
  { value: '3', label: '3+ years' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
  { value: '15', label: '15+ years' },
] as const;

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9.5l6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Hairline trigger + glass listbox. Shows "Label · Value" once a value is set, with a quick clear;
 * long lists get a search field and full keyboard support (arrows, Enter, Escape).
 */
function FilterDropdown({
  id,
  label,
  value,
  onChange,
  options,
  icon,
  searchable = false,
}: {
  id: string;
  label: string;
  icon: IconDefinition;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((option) => option.value === value && option.value !== '');
  const visible = useMemo(() => {
    const needle = normalizeForSearch(query.trim());
    if (!needle) return options;
    return options.filter((option) => option.value && normalizeForSearch(option.label).includes(needle));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const openMenu = () => {
    const index = Math.max(
      0,
      options.findIndex((option) => option.value === value),
    );
    setCursor(index);
    setOpen(true);
  };

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
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor, open]);

  const pick = (next: string) => {
    onChange(next);
    close();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((prev) => Math.min(prev + 1, visible.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = visible[cursor];
      if (option) pick(option.value);
    }
  };

  return (
    <div ref={rootRef} className="min-w-0 sm:relative" onKeyDown={onKeyDown}>
      <div className={`${TRIGGER_CLASS} ${selected ? TRIGGER_ACTIVE_CLASS : TRIGGER_IDLE_CLASS}`}>
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={selected ? `${label}: ${selected.label}` : label}
          onClick={() => (open ? close() : openMenu())}
          className="flex h-full min-w-0 flex-1 items-center gap-2 pl-3 pr-2.5 text-[14px] outline-none sm:pl-4 sm:pr-3"
        >
          <FontAwesomeIcon
            icon={icon}
            className={`h-3.5 w-3.5 shrink-0 ${selected ? 'text-[#FF5722]' : 'text-[#222222] dark:text-neutral-300'}`}
            aria-hidden
          />
          <span className={`truncate text-[#222222] dark:text-neutral-300 ${selected ? 'hidden sm:inline' : ''}`}>
            {label}
          </span>
          {selected ? (
            <span className={`min-w-0 truncate font-medium sm:max-w-[11rem] ${PROVIDER_INK_CLASS}`}>
              {selected.label}
            </span>
          ) : null}
          <ChevronDownIcon
            className={`ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-300 sm:ml-0 ${open ? 'rotate-180' : ''} ${
              selected ? 'text-[#FF5722]' : 'text-neutral-400 group-hover/sel:text-[#FF5722]'
            }`}
          />
        </button>
        {selected ? (
          <button
            type="button"
            aria-label={`Clear ${label.toLowerCase()}`}
            title="Clear"
            onClick={() => onChange('')}
            className="mr-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:mr-2 text-neutral-400 transition-colors hover:bg-black/[0.06] hover:text-[#111111] dark:hover:bg-white/10 dark:hover:text-white"
          >
            <XIcon className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden sm:right-auto sm:w-72 rounded-xl border border-black/[0.06] bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#141414]/95"
          style={{ animation: 'pf-float-in 220ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {searchable ? (
            <div className="border-b border-black/[0.06] px-3 py-2.5 dark:border-white/[0.06]">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCursor(0);
                }}
                placeholder={`Search ${label.toLowerCase()}…`}
                aria-label={`Search ${label.toLowerCase()}`}
                className="w-full bg-transparent text-[14px] text-[#111111] caret-[#FF5722] outline-none placeholder:text-neutral-400 dark:text-white"
              />
            </div>
          ) : null}
          <ul
            ref={listRef}
            role="listbox"
            aria-labelledby={id}
            className="max-h-72 overflow-y-auto p-1.5 [scrollbar-color:rgba(0,0,0,0.18)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgba(255,255,255,0.16)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20 dark:[&::-webkit-scrollbar-thumb]:bg-white/15"
          >
            {visible.length === 0 ? (
              <li className="px-3 py-6 text-center text-[14px] text-neutral-400">No match</li>
            ) : (
              visible.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value || 'any'} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      data-index={index}
                      onMouseEnter={() => setCursor(index)}
                      onClick={() => pick(option.value)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[14px] transition-colors duration-150 ${
                        index === cursor ? 'bg-black/[0.05] dark:bg-white/[0.07]' : ''
                      } ${
                        isSelected
                          ? 'font-semibold text-[#111111] dark:text-white'
                          : 'text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected ? <CheckIcon className="h-4 w-4 shrink-0 text-[#FF5722]" /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
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

/** Experience / nationality selects + Closest first switch (Service Provider directory). */
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
    <div
      data-surface-tray
      className={`relative grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3 ${className}`}
      aria-label="Provider filters"
    >
      <FilterDropdown
        id={`${idPrefix}-years`}
        label="Years"
        icon={faBriefcase}
        value={yearsValue}
        onChange={(raw) => {
          const parsed = raw ? Number.parseInt(raw, 10) : null;
          onYearsChange(parsed != null && Number.isFinite(parsed) ? parsed : null);
        }}
        options={SERVICE_PROVIDER_MIN_YEARS_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />

      <FilterDropdown
        id={`${idPrefix}-nationality`}
        label="Nationality"
        icon={faEarthAfrica}
        value={nationality}
        onChange={onNationalityChange}
        searchable
        options={nationalityOptions}
      />

      <button
        type="button"
        role="switch"
        aria-checked={closestFirst}
        aria-label="Closest first"
        title="Closest first"
        onClick={() => onClosestFirstChange(!closestFirst)}
        className={`${TRIGGER_CLASS} ${closestFirst ? TRIGGER_ACTIVE_CLASS : TRIGGER_IDLE_CLASS} !w-10 shrink-0 justify-center gap-2 px-0 text-[14px] outline-none sm:!w-auto sm:px-4`}
      >
        <FontAwesomeIcon
          icon={faLocationCrosshairs}
          className={`h-3.5 w-3.5 shrink-0 ${closestFirst ? 'text-[#FF5722]' : 'text-[#222222] group-hover/sel:text-[#FF5722] dark:text-neutral-300'}`}
          aria-hidden
        />
        <span
          className={`hidden truncate sm:inline ${closestFirst ? `font-medium ${PROVIDER_INK_CLASS}` : 'text-[#222222] dark:text-neutral-300'}`}
        >
          Closest first
        </span>
      </button>
    </div>
  );
}
