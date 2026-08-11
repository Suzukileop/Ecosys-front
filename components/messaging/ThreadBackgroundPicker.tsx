'use client';

import { useState } from 'react';
import { useDiscussionThreadTheme } from '@/hooks/useDiscussionThreadTheme';
import {
  DISCUSSION_THREAD_BASIC_PATTERNS,
  DISCUSSION_THREAD_PATTERNS,
  getDiscussionThreadPatternClass,
  type DiscussionThreadPattern,
  type DiscussionThreadPatternId,
} from '@/lib/discussion-thread-theme';

const PREVIEW_BOX_CLASS = 'absolute inset-0 rounded-2xl';

function BackIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function ThemeSwatch({
  patternId,
  className = '',
  preview = true,
}: {
  patternId: DiscussionThreadPatternId;
  className?: string;
  preview?: boolean;
}) {
  return (
    <span
      className={`block overflow-hidden ring-1 ring-black/10 dark:ring-white/10 ${preview ? 'discussion-thread-theme-preview' : ''} ${getDiscussionThreadPatternClass(patternId)} ${className}`}
      aria-hidden
    />
  );
}

function ThemePreviewBox({
  patternId,
  selected,
}: {
  patternId: DiscussionThreadPatternId;
  selected: boolean;
}) {
  return (
    <span className="relative block aspect-square w-full">
      <ThemeSwatch patternId={patternId} className={PREVIEW_BOX_CLASS} />
      {selected && (
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900">
          <CheckIcon />
        </span>
      )}
    </span>
  );
}

function ThemeGridTile({
  pattern,
  selected,
  onSelect,
}: {
  pattern: DiscussionThreadPattern;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col items-stretch gap-1.5 rounded-xl p-1.5 text-center transition ${
        selected ? 'bg-neutral-100 dark:bg-neutral-900' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/60'
      }`}
      aria-pressed={selected}
    >
      <ThemePreviewBox patternId={pattern.id} selected={selected} />
      <span className="w-full truncate text-[11px] font-medium leading-tight text-neutral-700 dark:text-neutral-200">
        {pattern.label}
      </span>
    </button>
  );
}

function SeeMoreTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-stretch gap-1.5 rounded-xl p-1.5 text-center transition hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
    >
      <span className="relative block aspect-square w-full">
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-neutral-100 ring-1 ring-black/10 dark:bg-neutral-900 dark:ring-white/10">
          <svg className="h-5 w-5 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </span>
      <span className="w-full truncate text-[11px] font-medium leading-tight text-neutral-700 dark:text-neutral-200">
        Voir plus
      </span>
    </button>
  );
}

type ThreadBackgroundPickerProps = {
  onSeeMore?: () => void;
};

export function ThreadBackgroundPicker({ onSeeMore }: ThreadBackgroundPickerProps) {
  const { patternId, setPatternId } = useDiscussionThreadTheme();
  const [expanded, setExpanded] = useState(true);
  const active = DISCUSSION_THREAD_PATTERNS.find((pattern) => pattern.id === patternId);

  return (
    <section className="shrink-0 px-5 py-2">
      <div className="relative px-1 pb-2 pt-1">
        <div className="min-w-0 pr-8">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">Chat theme</p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{active?.label ?? 'Bubbles'}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="absolute bottom-1 right-0 flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
          aria-expanded={expanded}
          aria-controls="chat-theme-grid"
          aria-label={expanded ? 'Replier les thèmes' : 'Déplier les thèmes'}
        >
          <ChevronIcon open={expanded} />
        </button>
      </div>

      {expanded && (
        <div
          id="chat-theme-grid"
          className="mt-1 grid grid-cols-3 gap-2"
          role="listbox"
          aria-label="Chat theme previews"
        >
          {DISCUSSION_THREAD_BASIC_PATTERNS.map((pattern) => (
            <div key={pattern.id} role="option" aria-selected={patternId === pattern.id}>
              <ThemeGridTile
                pattern={pattern}
                selected={patternId === pattern.id}
                onSelect={() => setPatternId(pattern.id)}
              />
            </div>
          ))}
          {onSeeMore && (
            <div role="presentation">
              <SeeMoreTile onClick={onSeeMore} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

type ThreadBackgroundGalleryProps = {
  onBack: () => void;
};

export function ThreadBackgroundGallery({ onBack }: ThreadBackgroundGalleryProps) {
  const { patternId, patterns, setPatternId } = useDiscussionThreadTheme();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-neutral-200 px-3 py-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
          aria-label="Back to thread"
        >
          <BackIcon />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#EA580C] dark:text-[#FB923C]">
            Chat theme
          </p>
          <h2 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">All backgrounds</h2>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:[scrollbar-color:#525252_transparent] [&::-webkit-scrollbar-thumb]:dark:bg-neutral-600">
        <div className="grid grid-cols-3 gap-3" role="listbox" aria-label="All chat themes">
          {patterns.map((pattern) => (
            <div key={pattern.id} role="option" aria-selected={patternId === pattern.id}>
              <ThemeGridTile
                pattern={pattern}
                selected={patternId === pattern.id}
                onSelect={() => setPatternId(pattern.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
