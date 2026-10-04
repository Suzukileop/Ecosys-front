'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

export type FormSelectOption = { value: string; label: string };

type FormSelectProps = {
  id?: string;
  value: string;
  options: readonly FormSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
};

/**
 * Themed replacement for a native `<select>` — the OS popup ignores dark mode on Windows and renders
 * light-on-white options, so the list is drawn by us.
 */
export function FormSelect({
  id,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}: FormSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const openList = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    setOpen(false);
    if (option.value !== value) onChange(option.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      setOpen(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(activeIndex);
    } else if (event.key.length === 1) {
      const key = event.key.toLowerCase();
      const match = options.findIndex((option) => option.label.toLowerCase().startsWith(key));
      if (match >= 0) setActiveIndex(match);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-transparent px-3.5 text-left text-[15px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          open
            ? 'border-[#111111] dark:border-white/70'
            : 'border-black/[0.1] hover:border-black/20 focus-visible:border-[#111111] dark:border-white/[0.12] dark:hover:border-white/25 dark:focus-visible:border-white/70'
        } focus:outline-none`}
      >
        <span className={`truncate ${selected ? 'text-[#111111] dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}`}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-64 overflow-y-auto overscroll-contain rounded-lg border border-black/[0.08] bg-white p-1 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.25)] dark:border-white/[0.1] dark:bg-[#161616] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value || '__empty'}
                id={`${listId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActiveIndex(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-[14px] transition-colors ${
                  isActive ? 'bg-black/[0.05] dark:bg-white/[0.07]' : ''
                } ${
                  isSelected
                    ? 'font-medium text-[#111111] dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? (
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
