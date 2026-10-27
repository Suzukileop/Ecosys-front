'use client';

import { createContext, use, useContext, useMemo, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, localeDir, type Locale } from '@/lib/i18n/config';
import { createTranslator, type Translator } from '@/lib/i18n/translate';
import { getDictionary, loadDictionary } from '@/lib/i18n/dictionary-store';
import { setBrowserTranslator } from '@/lib/i18n/active';

type I18nContextValue = {
  t: Translator;
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** True while the page re-renders in a newly picked language. */
  switching: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const EMPTY_MESSAGES = {};

export { tr, localeTag } from '@/lib/i18n/active';

/**
 * Mounted once in the root layout with the language the server picked for this viewer. The
 * dictionary itself is not a prop (it would be serialized into every page): see dictionary-store.
 */
export function I18nProvider({
  locale,
  version,
  children,
}: {
  locale: Locale;
  /** Content hash of the locale's dictionary, for its script URL. */
  version: string;
  children: ReactNode;
}) {
  // This gate intentionally has no state/router hooks. Suspending a cold
  // dictionary load must not interrupt initialization of the provider's hooks.
  if (!getDictionary(locale) && typeof window !== 'undefined') {
    use(loadDictionary(locale, version));
  }
  return <ResolvedI18nProvider locale={locale}>{children}</ResolvedI18nProvider>;
}

function ResolvedI18nProvider({locale, children}: {locale: Locale; children: ReactNode}) {
  const dictionary = getDictionary(locale) ?? EMPTY_MESSAGES;
  const router = useRouter();
  const [switching, startTransition] = useTransition();
  const t = useMemo(() => createTranslator(locale, dictionary), [locale, dictionary]);
  setBrowserTranslator(t);

  const value = useMemo<I18nContextValue>(
    () => ({
      t,
      locale,
      switching,
      setLocale: (next) => {
        if (next === locale) return;
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
        document.documentElement.lang = next;
        document.documentElement.dir = localeDir(next);
        /* The root layout reads the cookie again and sends the new dictionary; client state is kept. */
        startTransition(() => router.refresh());
      },
    }),
    [t, locale, switching, router],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Replaces the text of a few source strings for everything rendered inside (e.g. the creator's own names
 * for the Info block labels). A replaced string is shown as typed, untranslated; every other string
 * falls through to the surrounding translator. `overrides` must be memoized by the caller.
 */
export function TranslationOverrides({
  overrides,
  children,
}: {
  overrides: Readonly<Record<string, string>>;
  children: ReactNode;
}) {
  const parent = useContext(I18nContext);
  const value = useMemo<I18nContextValue | null>(() => {
    if (!parent) return null;
    if (Object.keys(overrides).length === 0) return parent;
    const t = Object.assign(
      ((source: string | null | undefined, vars?: Parameters<Translator>[1]) =>
        source != null && Object.prototype.hasOwnProperty.call(overrides, source)
          ? overrides[source]
          : parent.t(source, vars)) as Translator,
      parent.t
    );
    return { ...parent, t };
  }, [parent, overrides]);
  if (!value) return <>{children}</>;
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useT / useLocale must be used inside <I18nProvider>.');
  return value;
}

/** For Client Components: `const t = useT(); … {t('Save changes')}`. */
export function useT(): Translator {
  return useI18n().t;
}

export function useLocale() {
  const { locale, setLocale, switching } = useI18n();
  return { locale, setLocale, switching };
}
