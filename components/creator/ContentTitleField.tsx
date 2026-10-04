'use client';

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { EmojiPicker } from '@/components/ui/EmojiPicker';

type ContentTitleFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
  /** Freeform compose (Notion/X): larger type, no chrome */
  size?: 'default' | 'compose';
  /** Inline emoji button (prefer tools bar in compose). Default: hidden for compose. */
  showEmojiButton?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
};

export type ContentTitleFieldHandle = {
  insertEmoji: (emoji: string) => void;
  focus: () => void;
};

export const ContentTitleField = forwardRef<ContentTitleFieldHandle, ContentTitleFieldProps>(
  function ContentTitleField(
    {
      id,
      value,
      onChange,
      placeholder = 'Post headline',
      error,
      rows = 2,
      size = 'default',
      showEmojiButton,
      maxLength,
      autoFocus,
    },
    ref
  ) {
    const pickerId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [open, setOpen] = useState(false);
    const isCompose = size === 'compose';
    const emojiVisible = showEmojiButton ?? !isCompose;

    const insertEmoji = (emoji: string) => {
      const el = textareaRef.current;
      const current = el?.value ?? value;
      const start = el?.selectionStart ?? current.length;
      const end = el?.selectionEnd ?? current.length;
      if (maxLength != null && current.length - (end - start) + emoji.length > maxLength) return;
      if (!el) {
        onChange(current + emoji);
        setOpen(false);
        return;
      }
      const next = current.slice(0, start) + emoji + current.slice(end);
      onChange(next);
      setOpen(false);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + emoji.length;
        el.setSelectionRange(pos, pos);
      });
    };

    useImperativeHandle(
      ref,
      () => ({
        insertEmoji,
        focus: () => textareaRef.current?.focus(),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- insertEmoji always reads live textarea/value
      [value, onChange, maxLength]
    );

    useEffect(() => {
      if (!emojiVisible) return;
      const onDocClick = (e: MouseEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, [emojiVisible]);

    return (
      <div ref={rootRef} className="relative shrink-0">
        <label htmlFor={id} className="sr-only">
          {placeholder}
        </label>
        <textarea
          ref={textareaRef}
          id={id}
          rows={rows}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full resize-none border-0 bg-transparent px-0 focus:outline-none focus:ring-0 ${
            isCompose
              ? 'min-h-[6.5rem] py-2 text-[20px] font-normal leading-[1.45] text-[#111111] caret-[#FF5722] [field-sizing:content] placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500'
              : `py-0.5 text-base font-medium text-neutral-900 placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500 ${
                  emojiVisible ? 'pr-10' : ''
                }`
          }`}
        />
        {emojiVisible && (
          <>
            <button
              type="button"
              title="Insert emoji"
              aria-label="Insert emoji"
              aria-expanded={open}
              aria-controls={pickerId}
              onClick={() => setOpen((o) => !o)}
              className="absolute bottom-1 right-0 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {open && (
              <div
                id={pickerId}
                className="absolute bottom-full right-0 z-20 mb-1 overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
              >
                <EmojiPicker onSelect={insertEmoji} />
              </div>
            )}
          </>
        )}

        {error && <p className="mt-1 text-[14px] font-medium text-[#FF5722]">{error}</p>}
      </div>
    );
  }
);
