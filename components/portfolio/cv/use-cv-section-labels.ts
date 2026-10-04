'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { CV_SECTIONS, type CvSectionLabels } from '@/lib/cv-data';

const CHANGE_EVENT = 'skraft:cv-section-labels';
const MAX_LABEL_LENGTH = 40;

function storageKey(userId: string) {
  return `noprobleme.cv-section-labels.${userId}`;
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function parseLabels(raw: string | null): CvSectionLabels {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const labels: CvSectionLabels = {};
    for (const { id } of CV_SECTIONS) {
      const value = (parsed as Record<string, unknown>)[id];
      if (typeof value === 'string' && value.trim()) labels[id] = value.slice(0, MAX_LABEL_LENGTH);
    }
    return labels;
  } catch {
    return {};
  }
}

/** Custom CV section headings, kept in this browser per account and shared by every layout. */
export function useCvSectionLabels(userId: string | null | undefined) {
  const key = userId ? storageKey(userId) : null;
  const raw = useSyncExternalStore(
    subscribe,
    () => (key ? window.localStorage.getItem(key) : null),
    () => null
  );
  const labels = useMemo(() => parseLabels(raw), [raw]);

  const setLabels = useCallback(
    (next: CvSectionLabels) => {
      if (!key) return;
      const cleaned = Object.fromEntries(
        Object.entries(next)
          .filter(([, value]) => typeof value === 'string' && value.trim())
          .map(([id, value]) => [id, (value as string).slice(0, MAX_LABEL_LENGTH)])
      );
      if (Object.keys(cleaned).length === 0) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, JSON.stringify(cleaned));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [key]
  );

  return { labels, setLabels, maxLength: MAX_LABEL_LENGTH };
}
