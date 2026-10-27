'use client';

import { useSyncExternalStore } from 'react';
import { type LanguageProficiencyLevel, type ProfileSpokenLanguage } from '@/types/profile';

/** Portraits and photos in this section are user uploads; serve a derivative, not the original. */
export const ABOUT_MEDIA_WIDTHS = [256, 384, 640, 828] as const;
export const ABOUT_MEDIA_SIZES = '(min-width: 1024px) 420px, 90vw';


export function infoPortraitImageClass(baseClass: string, grayscale: boolean): string {
  return grayscale ? `${baseClass} grayscale` : baseClass;
}

export type LanguageDisplayItem = {
  name: string;
  level?: LanguageProficiencyLevel | null;
};

export function resolveLanguageItems(
  languages: ProfileSpokenLanguage[] | null | undefined,
  languagesFallback: string | null | undefined
): LanguageDisplayItem[] {
  const fromSpoken: LanguageDisplayItem[] = [];
  for (const entry of languages ?? []) {
    const name = entry.name?.trim() || '';
    if (!name) continue;
    fromSpoken.push({ name, level: entry.level ?? null });
  }
  if (fromSpoken.length > 0) return fromSpoken;
  const fallback = languagesFallback?.trim();
  if (!fallback) return [];
  return fallback
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => ({ name, level: null }));
}

export function InfoBulletList({
  items,
  accent,
  body,
  square = false,
  showBullets = true,
  bodySizeClass,
}: {
  items: string[];
  accent: string;
  body: string;
  square?: boolean;
  showBullets?: boolean;
  bodySizeClass?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className={`${showBullets ? 'flex gap-3' : ''} leading-relaxed ${bodySizeClass ?? 'text-[0.95rem]'}`}
          style={{ color: body }}
        >
          {showBullets ? (
          <span
            aria-hidden
            className={`mt-[0.55em] h-1.5 w-1.5 shrink-0 ${square ? 'rounded-none' : 'rounded-full'}`}
            style={{ backgroundColor: accent }}
          />
          ) : null}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
/** Same answer as framer's `useReducedMotion`, but `false` during hydration. Framer's hook is
 *  `false` on the server and already `true` on the first client render for a reduced-motion
 *  visitor — the armed (hidden) SSR markup then never matches, and React won't patch it up. */
export function useHydrationSafeReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}
