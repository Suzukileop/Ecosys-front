'use client';

import { useEffect, useRef, useState } from 'react';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';

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

type MarketplaceFilterDropdownProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Value treated as "no filter": hides the value chip and the clear button. */
  defaultValue?: string;
  clearable?: boolean;
  size?: 'md' | 'sm';
  align?: 'left' | 'right';
  placement?: 'bottom' | 'top';
};

/** Hairline trigger ("Label · Value") with a floating listbox; keyboard: arrows, Enter, Escape. */
export function MarketplaceFilterDropdown({
  id,
  label,
  value,
  onChange,
  options,
  defaultValue = '',
  clearable = true,
  size = 'md',
  align = 'left',
  placement = 'bottom',
}: MarketplaceFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const current = options.find((option) => option.value === value);
  const active = Boolean(current) && value !== defaultValue;

  const openMenu = () => {
    setCursor(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
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
    setOpen(false);
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
      setOpen(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((prev) => Math.min(prev + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = options[cursor];
      if (option) pick(option.value);
    }
  };

  return (
    <div ref={rootRef} className="relative min-w-0 shrink-0" onKeyDown={onKeyDown}>
      <div
        className={`group/sel inline-flex items-center rounded-lg border bg-white transition-colors duration-200 dark:bg-[#111111] ${
          size === 'sm' ? 'h-10' : 'h-11'
        } ${
          active
            ? 'border-[#111111]/25 dark:border-white/25'
            : 'border-black/[0.08] hover:border-black/15 dark:border-white/[0.1] dark:hover:border-white/20'
        }`}
      >
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => (open ? setOpen(false) : openMenu())}
          className={`inline-flex h-full items-center gap-2 text-[14px] outline-none ${
            size === 'sm' ? 'pl-3.5 pr-3' : 'pl-4 pr-3.5'
          }`}
        >
          <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
          {active && current ? (
            <span className="max-w-[11rem] truncate font-medium text-[#111111] dark:text-white">{current.label}</span>
          ) : null}
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''} ${
              active ? 'text-[#FF5722]' : 'text-neutral-400 group-hover/sel:text-[#FF5722]'
            }`}
          />
        </button>
        {active && clearable ? (
          <button
            type="button"
            aria-label={`Clear ${label.toLowerCase()}`}
            title="Clear"
            onClick={() => onChange(defaultValue)}
            className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-black/[0.06] hover:text-[#111111] dark:hover:bg-white/10 dark:hover:text-white"
          >
            <XIcon className="h-3 w-3" />
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className={`absolute z-50 w-64 overflow-hidden rounded-lg border border-black/[0.06] bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#141414]/95 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          style={STUDIO_FLOAT_IN_STYLE}
        >
          <ul
            ref={listRef}
            role="listbox"
            aria-labelledby={id}
            className="max-h-72 overflow-y-auto p-1.5 [scrollbar-width:thin]"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value || 'any'} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => pick(option.value)}
                    className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-[14px] transition-colors duration-150 ${
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
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
