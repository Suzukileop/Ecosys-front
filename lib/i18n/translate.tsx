import { Fragment, type ReactNode } from 'react';
import { LOCALE_TAGS, type Locale } from '@/lib/i18n/config';

/*
 * The translator, shared by server and client components.
 *
 *   t('Save changes')                        → "Enregistrer les modifications"
 *   t('Hello {name}', { name })              → placeholders in braces
 *   t.plural(n, '{count} product', '{count} products')
 *                                            → keyed by the plural ("other") English form; its
 *                                              translation is an object of CLDR forms
 *                                              ({ one, few, many, other }) picked by Intl.PluralRules
 *   t.rich('Read our {terms}.', { terms: <Link …>{t('terms')}</Link> })
 *                                            → placeholders may be elements
 *   t.date(iso, { month: 'long', day: 'numeric' }) / t.number(1234.5)
 *                                            → Intl formatting in the viewer's language
 *   t.country('FR', 'France') / t.currency('EUR', 'Euro')
 *                                            → names from Intl.DisplayNames (the English one in English)
 *
 * A string without a translation falls back to its English source, so untranslated parts of the app
 * keep working while the dictionaries fill in.
 */

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>>;
export type Messages = Record<string, string | PluralForms>;
export type Vars = Record<string, string | number | null | undefined>;

export type Translator = {
  /** A missing source (an optional label) gives '' — it renders nothing, as before. */
  (source: string | null | undefined, vars?: Vars): string;
  plural: (count: number, one: string, other: string, vars?: Vars) => string;
  rich: (source: string, vars: Record<string, ReactNode>) => ReactNode;
  date: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  number: (value: number, options?: Intl.NumberFormatOptions) => string;
  country: (iso2: string, fallback: string) => string;
  currency: (code: string, fallback: string) => string;
  locale: Locale;
  /** BCP 47 tag of the locale, for Intl APIs called directly. */
  tag: string;
};

const PLACEHOLDER = /\{(\w+)\}/g;

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(PLACEHOLDER, (match, name: string) => (name in vars ? String(vars[name] ?? '') : match));
}

export function createTranslator(locale: Locale, messages: Messages): Translator {
  const tag = LOCALE_TAGS[locale];
  const rules = new Intl.PluralRules(tag);

  const lookup = (source: string | null | undefined): string => {
    if (source == null) return '';
    const entry = messages[source];
    if (typeof entry === 'string' && entry) return entry;
    if (entry && typeof entry === 'object') return entry.other ?? source;
    return source;
  };

  const t = ((source: string | null | undefined, vars?: Vars) => interpolate(lookup(source), vars)) as Translator;

  t.plural = (count, one, other, vars) => {
    const all = { count, ...vars };
    const entry = messages[other];
    if (entry && typeof entry === 'object') {
      const form = entry[rules.select(count)] ?? entry.other;
      if (form) return interpolate(form, all);
    } else if (typeof entry === 'string' && entry) {
      return interpolate(entry, all);
    }
    return interpolate(count === 1 ? one : other, all);
  };

  t.rich = (source, vars) => {
    const parts = lookup(source).split(PLACEHOLDER);
    /* split() with a capture group alternates text and placeholder names. */
    return parts.map((part, index) =>
      index % 2 === 1 ? <Fragment key={index}>{part in vars ? vars[part] : `{${part}}`}</Fragment> : part,
    );
  };

  t.date = (value, options) => new Date(value).toLocaleString(tag, options);
  const displayName = (type: 'region' | 'currency') => {
    let names: Intl.DisplayNames | null | undefined;
    return (code: string, fallback: string) => {
      if (locale === 'en' || !code) return fallback;
      if (names === undefined) {
        try {
          names = new Intl.DisplayNames([tag], { type, fallback: 'none' });
        } catch {
          names = null;
        }
      }
      try {
        const name = names?.of(code.toUpperCase());
        return name ? name.charAt(0).toLocaleUpperCase(tag) + name.slice(1) : fallback;
      } catch {
        return fallback;
      }
    };
  };
  t.country = displayName('region');
  t.currency = displayName('currency');
  t.number = (value, options) => value.toLocaleString(tag, options);
  t.locale = locale;
  t.tag = tag;
  return t;
}
