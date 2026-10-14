import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, matchAcceptLanguage, type Locale } from '@/lib/i18n/config';
import { createTranslator, type Messages, type Translator } from '@/lib/i18n/translate';

/* Only the active language's dictionary is loaded (and sent to the browser). English is the source;
   its small dictionary only covers interface text still written in French in the code. */
const LOADERS: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: () => import('@/lib/i18n/messages/en.json'),
  fr: () => import('@/lib/i18n/messages/fr.json'),
  es: () => import('@/lib/i18n/messages/es.json'),
  pt: () => import('@/lib/i18n/messages/pt.json'),
  ar: () => import('@/lib/i18n/messages/ar.json'),
  ru: () => import('@/lib/i18n/messages/ru.json'),
  zh: () => import('@/lib/i18n/messages/zh.json'),
};

/** The viewer's language: their pick (cookie), else their browser's first supported one, else English. */
export async function getLocale(): Promise<Locale> {
  const picked = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(picked)) return picked;
  return matchAcceptLanguage((await headers()).get('accept-language')) ?? DEFAULT_LOCALE;
}

export async function getMessages(locale: Locale): Promise<Messages> {
  return (await LOADERS[locale]()).default;
}

/** For Server Components and generateMetadata: `const t = await getT();`. */
export async function getT(): Promise<Translator> {
  const locale = await getLocale();
  return createTranslator(locale, await getMessages(locale));
}
