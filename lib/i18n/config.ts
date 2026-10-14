/*
 * The interface languages. English is the source: every string in the code is written in English and
 * is its own translation key; the other languages map those English strings in `messages/<locale>.json`.
 * A string with no translation yet simply shows in English.
 */
export const LOCALES = ['en', 'fr', 'es', 'pt', 'ar', 'ru', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Remembers the viewer's pick (a year), read on the server so a page renders in it from the first byte. */
export const LOCALE_COOKIE = 'skraft-locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Each language under its own name (what a reader looks for), with the English name as a hint. */
export const LOCALE_NAMES: Record<Locale, { native: string; english: string }> = {
  en: { native: 'English', english: msg('English') },
  fr: { native: 'Français', english: msg('French') },
  es: { native: 'Español', english: msg('Spanish') },
  pt: { native: 'Português', english: msg('Portuguese') },
  ar: { native: 'العربية', english: msg('Arabic') },
  ru: { native: 'Русский', english: msg('Russian') },
  zh: { native: '简体中文', english: msg('Chinese (Simplified)') },
};

/** BCP 47 tags for Intl (dates, numbers, plurals) and the Open Graph locale. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
  pt: 'pt-BR',
  ar: 'ar',
  ru: 'ru-RU',
  zh: 'zh-CN',
};

const RTL_LOCALES: ReadonlySet<Locale> = new Set(['ar']);

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): 'ltr' | 'rtl' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

/** First supported language of an Accept-Language header ("fr-CA,fr;q=0.9,en;q=0.8" → fr). */
export function matchAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((param) => param.trim().startsWith('q='));
      return { base: tag.trim().toLowerCase().split('-')[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((entry) => entry.base && entry.q > 0)
    .sort((a, b) => b.q - a.q);
  return ranked.map((entry) => entry.base).find(isLocale) ?? null;
}

/**
 * Marks interface text kept outside a component (option lists, menus, labels in constants) so the
 * dictionary script finds it; the component still translates it where it shows: `t(option.label)`.
 */
export function msg<T extends string>(text: T): T {
  return text;
}
