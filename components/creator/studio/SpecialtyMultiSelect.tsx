'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  MAX_PROFILE_SPECIALTIES,
  MAX_SPECIALTY_LENGTH,
  MAX_SPECIALTY_TAG_LENGTH,
  MAX_SPECIALTY_TAGS,
  canonicalizeSpecialty,
  specialtyKey,
} from '@/lib/specialties';
import { suggestSpecialties } from '@/lib/creator-profile-api';

type SpecialtyMultiSelectProps = {
  specialties: string[];
  tags: string[];
  onSpecialtiesChange: (next: string[]) => void;
  onTagsChange: (next: string[]) => void;
  disabled?: boolean;
  /** Keyword tags live under Skills & Tools — hide them from Specialty when false. */
  showTags?: boolean;
  /** `studio`: hairline input, quiet chips and a glass list for the portfolio inline editor. */
  variant?: 'default' | 'studio';
};

const VARIANT_CLASSES = {
  default: {
    hint: 'text-xs text-neutral-500 dark:text-neutral-400',
    chip: 'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold sm:text-sm',
    chipPrimary: 'border-orange-500 bg-orange-500 text-white',
    chipIdle: 'border-neutral-300 bg-transparent text-neutral-700 dark:border-neutral-700 dark:text-neutral-200',
    chipRemovePrimary: 'text-white/80 hover:text-white',
    chipRemoveIdle: 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white',
    input:
      'h-10 min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-orange-400 dark:border-neutral-600 dark:bg-neutral-950 dark:text-white',
    addButton:
      'rounded-xl bg-neutral-900 px-3 text-sm font-semibold text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900',
    list: 'absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900',
    optionActive: 'bg-orange-50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-100',
    optionIdle: 'text-neutral-800 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800',
  },
  studio: {
    hint: 'text-[14px] text-neutral-500 dark:text-neutral-400',
    chip: 'inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[14px] transition-colors duration-200',
    chipPrimary: 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black',
    chipIdle:
      'border-black/[0.08] text-neutral-700 hover:border-black/30 dark:border-white/[0.1] dark:text-neutral-200 dark:hover:border-white/30',
    chipRemovePrimary: 'text-white/60 hover:text-[#FF5722] dark:text-black/50',
    chipRemoveIdle: 'text-neutral-400 hover:text-[#FF5722]',
    input:
      'min-w-0 flex-1 border-b border-black/[0.08] bg-transparent pb-2 text-base text-black caret-[#FF5722] outline-none placeholder:text-neutral-400 focus:border-[#FF5722] disabled:opacity-50 dark:border-white/[0.08] dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-[#FF5722]',
    addButton:
      'inline-flex shrink-0 items-center self-end rounded-full border border-neutral-300 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-700 transition-colors duration-200 hover:border-[#FF5722] hover:text-[#FF5722] disabled:pointer-events-none disabled:opacity-40 dark:border-white/20 dark:text-white/75',
    list: 'absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-black/[0.06] bg-white/90 py-1.5 shadow-2xl backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0D0D0D]/80',
    optionActive: 'bg-black/[0.04] text-black dark:bg-white/[0.06] dark:text-white',
    optionIdle: 'text-neutral-600 dark:text-neutral-300',
  },
} as const;

export function SpecialtyMultiSelect({
  specialties,
  tags,
  onSpecialtiesChange,
  onTagsChange,
  disabled = false,
  showTags = true,
  variant = 'default',
}: SpecialtyMultiSelectProps) {
  const ui = VARIANT_CLASSES[variant];
  const [specialtyDraft, setSpecialtyDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const primary = specialties[0] ?? null;
  const atSpecialtyCap = specialties.length >= MAX_PROFILE_SPECIALTIES;

  useEffect(() => {
    const query = specialtyDraft.trim();
    if (disabled || atSpecialtyCap || query.length < 1) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void suggestSpecialties(query)
        .then((items) => {
          if (cancelled) return;
          const selected = new Set(specialties.map(specialtyKey));
          const next = items.filter((item) => !selected.has(specialtyKey(item)));
          setSuggestions(next);
          setActiveIndex(next.length > 0 ? 0 : -1);
        })
        .catch(() => {
          if (!cancelled) {
            setSuggestions([]);
            setActiveIndex(-1);
          }
        });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [specialtyDraft, specialties, disabled, atSpecialtyCap]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const addSpecialty = (raw: string) => {
    if (disabled) return;
    const trimmed = raw.trim().replace(/\s+/g, ' ').slice(0, MAX_SPECIALTY_LENGTH);
    if (!trimmed) return;
    const key = specialtyKey(trimmed);
    const reused =
      suggestions.find((item) => specialtyKey(item) === key) ??
      specialties.find((item) => specialtyKey(item) === key);
    const label = canonicalizeSpecialty(reused ?? trimmed) ?? reused ?? trimmed;
    const existing = specialties.find((item) => specialtyKey(item) === specialtyKey(label));
    if (existing) {
      onSpecialtiesChange([existing, ...specialties.filter((item) => item !== existing)]);
      setSpecialtyDraft('');
      setOpen(false);
      return;
    }
    if (specialties.length >= MAX_PROFILE_SPECIALTIES) return;
    onSpecialtiesChange([...specialties, label]);
    setSpecialtyDraft('');
    setOpen(false);
  };

  const setPrimary = (label: string) => {
    if (disabled || !specialties.includes(label)) return;
    onSpecialtiesChange([label, ...specialties.filter((item) => item !== label)]);
  };

  const removeSpecialty = (label: string) => {
    if (disabled) return;
    onSpecialtiesChange(specialties.filter((item) => item !== label));
  };

  const addTag = () => {
    const trimmed = tagDraft.trim().slice(0, MAX_SPECIALTY_TAG_LENGTH);
    if (!trimmed || tags.length >= MAX_SPECIALTY_TAGS) return;
    if (tags.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setTagDraft('');
      return;
    }
    onTagsChange([...tags, trimmed]);
    setTagDraft('');
  };

  const showSuggestions = open && !atSpecialtyCap && suggestions.length > 0;

  return (
    <div className="space-y-4">
      <p className={ui.hint}>
        Add 1 to {MAX_PROFILE_SPECIALTIES} specialties. Click a chip to place it first.
      </p>
      <div className="flex flex-wrap gap-2">
        {specialties.map((label) => {
          const isPrimary = primary === label;
          return (
            <span key={label} className={`${ui.chip} ${isPrimary ? ui.chipPrimary : ui.chipIdle}`}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => (isPrimary ? removeSpecialty(label) : setPrimary(label))}
                className="inline-flex items-center gap-1.5"
              >
                {label}
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  removeSpecialty(label);
                }}
                className={isPrimary ? ui.chipRemovePrimary : ui.chipRemoveIdle}
                aria-label={`Remove ${label}`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      <div ref={boxRef} className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={specialtyDraft}
            maxLength={MAX_SPECIALTY_LENGTH}
            disabled={disabled || atSpecialtyCap}
            placeholder="e.g. Motion Designer, DevOps Engineer"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              showSuggestions && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
            }
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setSpecialtyDraft(event.target.value);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && showSuggestions) {
                event.preventDefault();
                setActiveIndex((current) =>
                  current < suggestions.length - 1 ? current + 1 : 0
                );
                return;
              }
              if (event.key === 'ArrowUp' && showSuggestions) {
                event.preventDefault();
                setActiveIndex((current) =>
                  current > 0 ? current - 1 : suggestions.length - 1
                );
                return;
              }
              if (event.key === 'Escape') {
                setOpen(false);
                return;
              }
              if (event.key === 'Enter') {
                event.preventDefault();
                if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
                  addSpecialty(suggestions[activeIndex]);
                  return;
                }
                addSpecialty(specialtyDraft);
              }
            }}
            className={ui.input}
            data-studio-underline={variant === 'studio' ? '' : undefined}
          />
          <button
            type="button"
            disabled={disabled || !specialtyDraft.trim() || atSpecialtyCap}
            onClick={() => addSpecialty(specialtyDraft)}
            className={ui.addButton}
          >
            Add
          </button>
        </div>
        {showSuggestions ? (
          <ul
            id={listId}
            role="listbox"
            className={ui.list}
          >
            {suggestions.map((item, index) => (
              <li key={item} role="option" aria-selected={index === activeIndex} id={`${listId}-${index}`}>
                <button
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    index === activeIndex ? ui.optionActive : ui.optionIdle
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => addSpecialty(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {showTags ? (
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Keyword tags
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              {tag}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onTagsChange(tags.filter((item) => item !== tag))}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={tagDraft}
            maxLength={MAX_SPECIALTY_TAG_LENGTH}
            disabled={disabled || tags.length >= MAX_SPECIALTY_TAGS}
            placeholder="e.g. React, Python"
            onChange={(event) => setTagDraft(event.target.value)}
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
            disabled={disabled || !tagDraft.trim() || tags.length >= MAX_SPECIALTY_TAGS}
            onClick={addTag}
            className="rounded-xl bg-neutral-900 px-3 text-sm font-semibold text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
          >
            Add
          </button>
        </div>
      </div>
      ) : null}
    </div>
  );
}
