'use client';

import { useSyncExternalStore } from 'react';

/*
 * Recent searches — the last few queries the viewer actually ran (opened the results page or a
 * result from the overlay), newest first. A per-viewer convenience, so it lives in localStorage:
 * every read and write is guarded (private windows, blocked storage) and the UI simply shows no
 * "Recent" block when nothing can be read.
 *
 * Exposed as a tiny external store so the overlay and the empty results page re-render together
 * when a query is added or removed, without an effect that copies storage into state.
 */

const STORAGE_KEY = 'skraft:recent-searches';
const MAX_RECENT = 8;
const EMPTY: readonly string[] = [];

const listeners = new Set<() => void>();
let cache: readonly string[] | null = null;

function read(): readonly string[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0).slice(0, MAX_RECENT)
      : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: readonly string[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Storage unavailable: the list still lives for this page view. */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Puts `query` at the top of the list (case-insensitive de-duplication). */
export function addRecentSearch(query: string) {
  const term = query.trim();
  if (!term) return;
  const needle = term.toLowerCase();
  write([term, ...read().filter((item) => item.toLowerCase() !== needle)].slice(0, MAX_RECENT));
}

export function removeRecentSearch(query: string) {
  const needle = query.trim().toLowerCase();
  write(read().filter((item) => item.toLowerCase() !== needle));
}

export function clearRecentSearches() {
  write(EMPTY);
}

export function useRecentSearches(): readonly string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
