'use client';

import { useState } from 'react';
import {
  MAX_SPECIALTY_TAG_LENGTH,
  MAX_SPECIALTY_TAGS,
  parseSpecialtyTags,
} from '@/lib/specialties';

type SkillTagsEditorProps = {
  tags: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  /** When false, chips only (no add/remove controls). */
  editable?: boolean;
  className?: string;
};

/** Keyword skill tags (Skilled in) — separate from Tools with logos/levels. */
export function SkillTagsEditor({
  tags,
  onChange,
  disabled = false,
  editable = true,
  className = '',
}: SkillTagsEditorProps) {
  const [draft, setDraft] = useState('');
  const normalized = parseSpecialtyTags(tags);
  const atCap = normalized.length >= MAX_SPECIALTY_TAGS;

  const addTag = () => {
    if (disabled || !editable) return;
    const trimmed = draft.trim().slice(0, MAX_SPECIALTY_TAG_LENGTH);
    if (!trimmed || atCap) return;
    if (normalized.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...normalized, trimmed]);
    setDraft('');
  };

  return (
    <div className={className}>
      {normalized.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {normalized.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {tag}
              {editable ? (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(normalized.filter((item) => item !== tag))}
                  className="text-neutral-400 hover:text-neutral-700 disabled:opacity-40 dark:hover:text-white"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : editable ? null : (
        <p className="text-sm italic text-neutral-500 dark:text-neutral-400">No skill tags.</p>
      )}
      {editable ? (
        <div className={`${normalized.length > 0 ? 'mt-2' : ''} flex gap-2`}>
          <input
            type="text"
            value={draft}
            maxLength={MAX_SPECIALTY_TAG_LENGTH}
            disabled={disabled || atCap}
            placeholder="e.g. React, Python"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTag();
              }
            }}
            className="h-10 min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-orange-400 dark:border-neutral-600 dark:bg-neutral-950 dark:text-white"
          />
          <button
            type="button"
            disabled={disabled || !draft.trim() || atCap}
            onClick={addTag}
            className="rounded-xl bg-neutral-900 px-3 text-sm font-semibold text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
          >
            Add
          </button>
        </div>
      ) : null}
      {editable ? (
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {normalized.length}/{MAX_SPECIALTY_TAGS} tags · shown under Skills in Profile info
        </p>
      ) : null}
    </div>
  );
}
