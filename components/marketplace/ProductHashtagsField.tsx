'use client';

import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
const PRODUCT_HASHTAGS_MAX = 15;
const PRODUCT_HASHTAG_MAX_LENGTH = 40;

const HASHTAG_INVALID_CHARS = new RegExp('[^\\p{L}\\p{N}_-]', 'gu');

/** Mirrors the backend normalisation: no leading `#`, letters/digits/`_`/`-` only. */
export function normalizeHashtag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, '')
    .replace(HASHTAG_INVALID_CHARS, '')
    .slice(0, PRODUCT_HASHTAG_MAX_LENGTH);
}

type ProductHashtagsFieldProps = {
  value: string[];
  onChange: (next: string[]) => void;
  boxClassName: string;
};

export function ProductHashtagsField({ value, onChange, boxClassName }: ProductHashtagsFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');
  const full = value.length >= PRODUCT_HASHTAGS_MAX;

  const addMany = (raws: string[]) => {
    const next = [...value];
    const taken = new Set(next.map((tag) => tag.toLowerCase()));
    for (const raw of raws) {
      if (next.length >= PRODUCT_HASHTAGS_MAX) break;
      const tag = normalizeHashtag(raw);
      if (!tag || taken.has(tag.toLowerCase())) continue;
      taken.add(tag.toLowerCase());
      next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
  };

  const commitDraft = () => {
    if (!draft.trim()) return;
    addMany([draft]);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',' || event.key === ' ' || event.key === 'Tab') {
      if (!draft.trim()) return;
      event.preventDefault();
      commitDraft();
      return;
    }
    if (event.key === 'Backspace' && draft.length === 0 && value.length > 0) {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text');
    if (!/[\s,#]/.test(text.trim())) return;
    event.preventDefault();
    addMany(text.split(/[\s,]+|(?=#)/));
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    inputRef.current?.focus();
  };

  return (
    <div>
      <label htmlFor={inputId} className="sr-only">
        Hashtags
      </label>
      <div
        className={`flex min-h-[2.875rem] cursor-text flex-wrap items-center gap-1.5 px-2 py-1.5 ${boxClassName}`}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <span
            key={tag.toLowerCase()}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-black/[0.05] pl-2.5 pr-1 text-[14px] font-medium text-[#111111] dark:bg-white/[0.08] dark:text-white"
          >
            <span className="text-neutral-400 dark:text-neutral-500">#</span>
            {tag}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                remove(index);
              }}
              className="ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-black/[0.06] hover:text-[#111111] dark:hover:bg-white/[0.1] dark:hover:text-white"
              aria-label={`Remove #${tag}`}
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </span>
        ))}
        <div className="flex min-w-[8rem] flex-1 items-center">
          {!full ? <span className="pl-1.5 text-[15px] text-neutral-400 dark:text-neutral-500">#</span> : null}
          <input
            ref={inputRef}
            id={inputId}
            value={draft}
            disabled={full}
            maxLength={PRODUCT_HASHTAG_MAX_LENGTH + 1}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setDraft(event.target.value.replace(/^#+/, ''))}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={commitDraft}
            placeholder={full ? 'Limit reached' : value.length === 0 ? 'Add a hashtag and press Enter' : 'Add another'}
            className="h-8 min-w-0 flex-1 bg-transparent px-0.5 text-[15px] text-[#111111] outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-neutral-500"
          />
          {value.length > 0 ? (
            <span className="shrink-0 pr-1.5 text-[12px] tabular-nums text-neutral-400 dark:text-neutral-500">
              {value.length}/{PRODUCT_HASHTAGS_MAX}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
