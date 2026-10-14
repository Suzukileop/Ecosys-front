'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faEarthAfrica, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { NATIONALITY_SELECT_OPTIONS } from '@/lib/countries';
import { PROVIDER_INK_CLASS, PROVIDER_MUTED_CLASS } from '@/components/marketplace/ProviderDirectoryPrimitives';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/* X filter pill: 1px outline (#CFD9DE / #536471), ink text; a set filter takes an ink outline. */
/* Soft filled pills (the chips' tone); a set filter keeps the tone and gains an ink ring. */
const TRIGGER_CLASS =
  'group/sel flex h-9 w-full items-center rounded-full border-0 bg-[#EFF3F4] transition-colors duration-200 hover:bg-[#E1E8ED] dark:bg-[#202327] dark:hover:bg-[#2A2D32] sm:inline-flex sm:w-auto';
const TRIGGER_IDLE_CLASS = '';
const TRIGGER_ACTIVE_CLASS = 'shadow-[inset_0_0_0_1.5px_#0F1419] dark:shadow-[inset_0_0_0_1.5px_#E7E9EA]';

/* "line" variant (the directory's filters column): no fill, no pill — a full-width row with one
   hairline under it, like the column's switch rows; a set filter takes an ink hairline. */
const LINE_TRIGGER_CLASS =
  'group/sel flex h-12 w-full items-center border-b border-[#EFF3F4] bg-transparent transition-colors duration-200 hover:border-[#CFD9DE] dark:border-[#2F3336] dark:hover:border-[#536471]';
const LINE_TRIGGER_ACTIVE_CLASS = '!border-[#0F1419] dark:!border-[#E7E9EA]';

/* "rail" variant (the directory's right rail, News style): a 48px row on the rail box, no line —
   the label left, the value (or "Any") right; the fill tone only under the pointer. */
const RAIL_TRIGGER_CLASS =
  'group/sel flex h-12 w-full items-center px-6 transition-colors duration-150 hover:bg-[#EFF3F4] dark:hover:bg-[#2A2D32]';

type FilterVariant = 'pill' | 'line' | 'rail';

const nationalityOptions = [
  { value: '', label: msg('All nationalities') },
  ...NATIONALITY_SELECT_OPTIONS.map((option) => ({ value: option.code, label: option.label })),
];

const SERVICE_PROVIDER_MIN_YEARS_OPTIONS = [
  { value: '', label: msg('Any experience') },
  { value: '1', label: msg('1+ years') },
  { value: '3', label: msg('3+ years') },
  { value: '5', label: msg('5+ years') },
  { value: '10', label: msg('10+ years') },
  { value: '15', label: msg('15+ years') },
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
 * long lists get a search field and full keyboard support (arrows, Enter, Escape). Exported for the
 * other News-style rails (Products' "Refine" box uses the `rail` variant).
 */
export function FilterDropdown({
  id,
  label,
  value,
  onChange,
  options,
  icon,
  searchable = false,
  variant = 'pill',
}: {
  id: string;
  label: string;
  /** The pill variant's leading glyph; the line and rail variants draw none. */
  icon?: IconDefinition;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  searchable?: boolean;
  variant?: FilterVariant;
}) {
  const t = useT();
  const line = variant === 'line';
  const rail = variant === 'rail';
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  /* Opens upward when the space under the trigger can't hold the list but the space above can. */
  const [dropUp, setDropUp] = useState(false);
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
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const needed = searchable ? 360 : 320;
      const below = window.innerHeight - rect.bottom;
      setDropUp(below < needed && rect.top > below);
    }
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
    <div ref={rootRef} className={`min-w-0 ${line || rail ? 'relative' : 'sm:relative'}`} onKeyDown={onKeyDown}>
      {rail ? (
        <div className={`${RAIL_TRIGGER_CLASS} ${open ? 'bg-[#EFF3F4] dark:bg-[#2A2D32]' : ''}`}>
          <button
            id={id}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={selected ? `${label}: ${selected.label}` : label}
            onClick={() => (open ? close() : openMenu())}
            className={`flex h-full min-w-0 flex-1 items-center gap-3 text-[15px] leading-5 outline-none ${PROVIDER_INK_CLASS}`}
          >
            <span className={`truncate ${selected ? 'font-bold' : ''}`}>{label}</span>
            <span className={`ml-auto min-w-0 truncate text-[14px] ${selected ? `font-medium ${PROVIDER_INK_CLASS}` : PROVIDER_MUTED_CLASS}`}>
              {selected ? selected.label : t('Any')}
            </span>
            {selected ? null : (
              <ChevronDownIcon
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''} ${PROVIDER_MUTED_CLASS}`}
              />
            )}
          </button>
          {selected ? (
            <button
              type="button"
              aria-label={t('Clear {toLowerCase}', { toLowerCase: label.toLowerCase() })}
              title={t('Clear')}
              onClick={() => onChange('')}
              className="-mr-2 ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#536471] transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:text-[#8B98A5] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]"
            >
              <XIcon className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      ) : (
      <div
        className={
          line
            ? `${LINE_TRIGGER_CLASS} ${selected || open ? LINE_TRIGGER_ACTIVE_CLASS : ''}`
            : `${TRIGGER_CLASS} ${selected ? TRIGGER_ACTIVE_CLASS : TRIGGER_IDLE_CLASS}`
        }
      >
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={selected ? `${label}: ${selected.label}` : label}
          onClick={() => (open ? close() : openMenu())}
          className={`flex h-full min-w-0 flex-1 items-center gap-2 outline-none ${
            line ? 'text-[15px]' : 'rounded-full pl-3.5 pr-2.5 text-[14px] sm:pl-4 sm:pr-3'
          }`}
        >
          {line || !icon ? null : (
            <FontAwesomeIcon
              icon={icon}
              className={`h-3.5 w-3.5 shrink-0 ${PROVIDER_INK_CLASS}`}
              aria-hidden
            />
          )}
          <span
            className={`truncate ${
              selected
                ? `${line ? '' : 'hidden sm:inline'} ${PROVIDER_MUTED_CLASS}`
                : `${line ? '' : 'font-medium'} ${PROVIDER_INK_CLASS}`
            }`}
          >
            {label}
          </span>
          {selected ? (
            <span className={`min-w-0 truncate font-medium sm:max-w-[11rem] ${PROVIDER_INK_CLASS}`}>
              {t(selected.label)}
            </span>
          ) : null}
          <ChevronDownIcon
            className={`ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${line ? '' : 'sm:ml-0'} ${
              open ? 'rotate-180' : ''
            } ${selected ? PROVIDER_INK_CLASS : PROVIDER_MUTED_CLASS}`}
          />
        </button>
        {selected ? (
          <button
            type="button"
            aria-label={t('Clear {toLowerCase}', { toLowerCase: label.toLowerCase() })}
            title={t('Clear')}
            onClick={() => onChange('')}
            className={`${line ? '-mr-1.5 ml-1' : 'mr-1'} inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#536471] transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]`}
          >
            <XIcon className="h-3 w-3" />
          </button>
        ) : null}
      </div>
      )}

      {open ? (
        <div
          className={`absolute z-50 overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_#E1E8ED,0_8px_20px_-14px_rgba(15,20,25,0.18)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336] ${
            rail ? 'inset-x-3' : 'inset-x-0'
          } ${line || rail ? '' : 'sm:right-auto sm:w-72'} ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          style={{ animation: 'pf-float-in 220ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {searchable ? (
            <div className="px-3 pb-1 pt-3">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCursor(0);
                }}
                placeholder={t('Search {toLowerCase}…', { toLowerCase: label.toLowerCase() })}
                aria-label={t('Search {toLowerCase}', { toLowerCase: label.toLowerCase() })}
                className={`h-10 w-full rounded-full bg-[#EFF3F4] px-4 text-[15px] ${PROVIDER_INK_CLASS} outline-none placeholder:text-[#536471] focus:bg-white focus:shadow-[inset_0_0_0_2px_#0F1419] dark:bg-[#202327] dark:placeholder:text-[#71767B] dark:focus:bg-black dark:focus:shadow-[inset_0_0_0_2px_#E7E9EA]`}
              />
            </div>
          ) : null}
          <ul
            ref={listRef}
            role="listbox"
            aria-labelledby={id}
            className="max-h-72 overflow-y-auto py-1.5 [scrollbar-color:rgba(0,0,0,0.18)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgba(255,255,255,0.16)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20 dark:[&::-webkit-scrollbar-thumb]:bg-white/15"
          >
            {visible.length === 0 ? (
              <li className={`px-3 py-6 text-center text-[14px] ${PROVIDER_MUTED_CLASS}`}>{t('No match')}</li>
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
                      className={`flex min-h-10 w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[15px] transition-colors duration-150 ${
                        index === cursor ? 'bg-[rgba(15,20,25,0.06)] dark:bg-[rgba(231,233,234,0.1)]' : ''
                      } ${
                        isSelected
                          ? `font-bold ${PROVIDER_INK_CLASS}`
                          : PROVIDER_INK_CLASS
                      }`}
                    >
                      <span className="truncate">{t(option.label)}</span>
                      {isSelected ? <CheckIcon className={`h-4 w-4 shrink-0 ${PROVIDER_INK_CLASS}`} /> : null}
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
  /** `line`: stacked full-width rows with one hairline each; `rail`: stacked 48px rows with no line
   *  (the directory's right rail). Neither shows the Closest first switch — the directory offers it
   *  as a sort order. */
  variant?: FilterVariant;
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
  variant = 'pill',
}: ServiceProviderFilterPillsProps) {
  const t = useT();
  const yearsValue = minYearsExperience != null ? String(minYearsExperience) : '';
  const line = variant === 'line' || variant === 'rail';

  return (
    <div
      data-surface-tray
      className={`relative ${
        line
          ? 'flex flex-col'
          : 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3'
      } ${className}`}
      aria-label={t('Provider filters')}
    >
      <FilterDropdown
        id={`${idPrefix}-years`}
        label={variant === 'rail' ? t('Experience') : t('Years')}
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
        variant={variant}
      />

      <FilterDropdown
        id={`${idPrefix}-nationality`}
        label={t('Nationality')}
        icon={faEarthAfrica}
        value={nationality}
        onChange={onNationalityChange}
        searchable
        options={nationalityOptions}
        variant={variant}
      />

      {line ? null : (
        <button
          type="button"
          role="switch"
          aria-checked={closestFirst}
          aria-label={t('Closest first')}
          title={t('Closest first')}
          onClick={() => onClosestFirstChange(!closestFirst)}
          className={`${TRIGGER_CLASS} ${closestFirst ? TRIGGER_ACTIVE_CLASS : TRIGGER_IDLE_CLASS} !w-9 shrink-0 justify-center gap-2 px-0 text-[14px] outline-none sm:!w-auto sm:px-4`}
        >
          <FontAwesomeIcon
            icon={faLocationCrosshairs}
            className={`h-3.5 w-3.5 shrink-0 ${PROVIDER_INK_CLASS}`}
            aria-hidden
          />
          <span className={`hidden truncate font-medium sm:inline ${PROVIDER_INK_CLASS}`}>
            {t('Closest first')}
          </span>
        </button>
      )}
    </div>
  );
}
