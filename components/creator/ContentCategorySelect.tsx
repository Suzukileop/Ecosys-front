'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CREATOR_CONTENT_GENRES } from '@/components/creator/creator-content-form';

type ContentCategorySelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  labelClass: string;
  fieldClass: string;
  disabled?: boolean;
  placeholder?: string;
};

export function ContentCategorySelect({
  id,
  value,
  onChange,
  labelClass,
  fieldClass,
  disabled = false,
  placeholder = 'Branding, Motion, Tech…',
}: ContentCategorySelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number } | null>(null);

  const updateMenuBox = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuBox({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setMenuBox(null);
      return;
    }
    updateMenuBox();
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if ((target as Element).closest?.(`[data-category-menu="${id}"]`)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onReposition = () => updateMenuBox();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, id, updateMenuBox]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const list = (
    <ul
      id={`${id}-listbox`}
      role="listbox"
      aria-labelledby={id}
      data-category-menu={id}
      style={
        menuBox
          ? {
              position: 'fixed',
              top: menuBox.top,
              left: menuBox.left,
              width: menuBox.width,
              zIndex: 260,
            }
          : undefined
      }
      className="max-h-56 overflow-y-auto rounded-xl border border-neutral-200/80 bg-white py-1 shadow-lg [scrollbar-width:thin] [scrollbar-color:theme(colors.neutral.300)_transparent] dark:border-neutral-700 dark:bg-neutral-900 dark:[scrollbar-color:theme(colors.neutral.600)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600 dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
    >
      {value.trim() ? (
        <li role="option">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="flex w-full px-3 py-2 text-left text-sm text-neutral-400 transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Clear
          </button>
        </li>
      ) : null}
      {CREATOR_CONTENT_GENRES.map((genre) => {
        const selected = value === genre;
        return (
          <li key={genre} role="option" aria-selected={selected}>
            <button
              type="button"
              onClick={() => {
                onChange(genre);
                setOpen(false);
              }}
              className={`flex w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                selected
                  ? 'font-semibold text-orange-600 dark:text-orange-400'
                  : 'text-neutral-800 dark:text-neutral-100'
              }`}
            >
              {genre}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div ref={rootRef} className="relative space-y-1.5">
      <label htmlFor={id} className={labelClass}>
        Category
      </label>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        className={`${fieldClass} flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span
          className={
            value.trim()
              ? 'truncate text-neutral-900 dark:text-white'
              : 'truncate text-neutral-500 dark:text-neutral-400'
          }
        >
          {value.trim() || placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-400 transition ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && menuBox && typeof document !== 'undefined'
        ? createPortal(list, document.body)
        : null}
    </div>
  );
}
