'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectDropdownProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  maxSelections?: number;
  id?: string;
  'aria-label'?: string;
  triggerClassName?: string;
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6l2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MultiSelectDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchable = true,
  maxSelections,
  id,
  'aria-label': ariaLabel,
  triggerClassName = '',
}: MultiSelectDropdownProps) {
  const autoId = useId();
  const listboxId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

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
    if (open && searchable) {
      searchRef.current?.focus();
    }
  }, [open, searchable]);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? options.filter(
          (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
        )
      : options;

    if (!open) return matches;

    const selected = matches.filter((opt) => selectedSet.has(opt.value));
    const unselected = matches.filter((opt) => !selectedSet.has(opt.value));
    return [...selected, ...unselected];
  }, [options, query, open, selectedSet]);

  const toggleOption = (optionValue: string) => {
    if (selectedSet.has(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
      return;
    }
    if (maxSelections === 1) {
      onChange([optionValue]);
      return;
    }
    if (maxSelections && value.length >= maxSelections) return;
    onChange([...value, optionValue]);
  };

  const clearAll = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange([]);
    setQuery('');
  };

  const selectedCount = value.length;
  const selectedOptions = useMemo(
    () => options.filter((opt) => selectedSet.has(opt.value)),
    [options, selectedSet]
  );
  const showDividerIndex =
    open && selectedCount > 0
      ? filteredOptions.findIndex((opt) => !selectedSet.has(opt.value))
      : -1;

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`ecosystem-form-field flex min-h-[2.625rem] w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${triggerClassName || 'bg-white dark:bg-neutral-900'} ${
          open
            ? 'border-[#F97316]/60 ring-2 ring-[#F97316]/15'
            : 'border-neutral-200 dark:border-neutral-700'
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex shrink-0 items-center rounded-full bg-[#FFF7ED] px-2.5 py-0.5 text-xs font-medium text-[#EA580C] ring-1 ring-[#F97316]/15 dark:bg-[#F97316]/10"
            >
              {opt.label}
            </span>
          ))}

          {open && searchable ? (
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={selectedCount ? 'Search…' : placeholder}
              aria-label={ariaLabel}
              className="min-w-[5rem] flex-1 bg-transparent py-0.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
            />
          ) : selectedCount === 0 ? (
            <button
              type="button"
              id={listboxId}
              aria-label={ariaLabel}
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="py-0.5 text-neutral-400"
            >
              {placeholder}
            </button>
          ) : (
            <button
              type="button"
              id={listboxId}
              aria-label={ariaLabel}
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="min-h-[1.25rem] min-w-[1.25rem] flex-1"
            />
          )}
        </div>

        {selectedCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            aria-label="Clear selection"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F97316] px-2 py-0.5 text-xs font-semibold text-white transition hover:bg-[#EA580C]"
          >
            {selectedCount}
            <span aria-hidden="true">×</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? 'Close list' : 'Open list'}
          className="shrink-0 text-neutral-400 transition hover:text-neutral-600"
        >
          <svg
            className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <ul role="listbox" aria-multiselectable="true" className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-neutral-500">No results</li>
            ) : (
              filteredOptions.map((opt, index) => {
                const checked = selectedSet.has(opt.value);
                const atCapacity =
                  !checked && !!maxSelections && maxSelections > 1 && value.length >= maxSelections;

                return (
                  <li key={opt.value} role="presentation">
                    {showDividerIndex === index && (
                      <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={checked}
                      disabled={atCapacity}
                      onClick={() => toggleOption(opt.value)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${
                        checked
                          ? 'bg-neutral-50 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                          : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      } ${atCapacity ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          checked
                            ? 'border-[#F97316] bg-[#F97316] text-white'
                            : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900'
                        }`}
                      >
                        {checked && <CheckIcon className="h-3 w-3" />}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
