'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { CurrencyOption } from '@/lib/currencies';

type CurrencyPickerProps = {
  value: string;
  options: CurrencyOption[];
  onChange: (code: string) => void;
  id?: string;
};

export function CurrencyPicker({ value, options, onChange, id }: CurrencyPickerProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q));
  }, [options, query]);

  const openPicker = () => {
    setQuery('');
    setActiveIndex(Math.max(0, options.findIndex((o) => o.code === value)));
    setOpen(true);
  };

  const close = () => setOpen(false);

  const select = (code: string) => {
    onChange(code);
    close();
  };

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, filtered]);

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) select(option.code);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };

  return (
    <div ref={rootRef} className="relative h-full">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${value}`}
        onClick={() => (open ? close() : openPicker())}
        className="flex h-full items-center gap-1.5 pl-3.5 pr-3 text-[14px] font-medium text-[#111111] outline-none dark:text-white"
      >
        {value}
        <svg
          className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)] dark:border-white/[0.1] dark:bg-[#161616]">
          <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 dark:border-white/[0.08]">
            <svg className="h-4 w-4 shrink-0 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Search currency"
              aria-label="Search currency"
              aria-controls={listId}
              className="h-11 min-w-0 flex-1 bg-transparent text-[14px] text-[#111111] outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" className="max-h-64 overflow-y-auto overscroll-contain py-1.5 [scrollbar-width:thin]">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-[13px] text-neutral-500 dark:text-neutral-400">No currency found</li>
            ) : (
              filtered.map((option, index) => {
                const selected = option.code === value;
                const active = index === activeIndex;
                return (
                  <li
                    key={option.code}
                    data-index={index}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(option.code)}
                    className={`mx-1.5 flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 ${
                      active ? 'bg-black/[0.05] dark:bg-white/[0.07]' : ''
                    }`}
                  >
                    <span className="w-10 shrink-0 text-[13px] font-semibold tabular-nums text-[#111111] dark:text-white">
                      {option.code}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-500 dark:text-neutral-400">{option.name}</span>
                    {selected ? (
                      <svg className="h-4 w-4 shrink-0 text-[#111111] dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m5 12 5 5 9-10" />
                      </svg>
                    ) : null}
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
