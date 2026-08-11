'use client';

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';

export const TITLE_EMOJIS = [
  '😀', '😊', '😂', '🥰', '😍', '🤩', '😎', '🤔', '😢', '😡',
  '👍', '👏', '🙏', '💪', '🔥', '❤️', '✨', '🎉', '🎨', '💡',
  '🚀', '⭐', '✅', '👀', '💯', '🌟', '🎵', '📸', '🏆', '💬',
] as const;

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
      if (!el) {
        onChange(current + emoji);
        setOpen(false);
        return;
      }
      const start = el.selectionStart ?? current.length;
      const end = el.selectionEnd ?? current.length;
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
      [value, onChange]
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
          Post headline
        </label>
        <textarea
          ref={textareaRef}
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full resize-none border-0 bg-transparent px-0 focus:outline-none focus:ring-0 ${
            isCompose
              ? 'min-h-[4.5rem] py-1 text-2xl font-semibold leading-snug tracking-tight text-neutral-950 placeholder:font-medium placeholder:text-neutral-300 dark:text-white dark:placeholder:text-neutral-600'
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
                className="absolute bottom-full right-0 z-20 mb-1 w-64 rounded-xl border border-neutral-200/70 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div className="grid grid-cols-6 gap-0.5">
                  {TITLE_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
