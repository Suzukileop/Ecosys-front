'use client';

import { createContext, useContext, useMemo, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, localeDir, type Locale } from '@/lib/i18n/config';
import { createTranslator, type Messages, type Translator } from '@/lib/i18n/translate';
import { setBrowserTranslator } from '@/lib/i18n/active';

type I18nContextValue = {
  t: Translator;
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** True while the page re-renders in a newly picked language. */
  switching: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export { tr, localeTag } from '@/lib/i18n/active';

/** Mounted once in the root layout with the dictionary the server picked for this viewer. */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const router = useRouter();
  const [switching, startTransition] = useTransition();
  const t = useMemo(() => createTranslator(locale, messages), [locale, messages]);
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
