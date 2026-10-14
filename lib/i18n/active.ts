import { createTranslator, type Translator } from '@/lib/i18n/translate';

/*
 * The current translator, for code outside components (prices and dates built in lib/, toasts from
 * event handlers). Set by I18nProvider each time it renders — in the browser, and on the server too
 * so server-rendered HTML matches what the browser renders. On the server one module serves every
 * request: if two visitors with different languages render at the same moment, a helper may briefly
 * use the other one's language; React then re-renders that part in the browser, so it self-heals.
 * Server components must use getT() instead. A plain module (not 'use client') so lib code can import it.
 */
let browserTranslator: Translator = createTranslator('en', {});

export function setBrowserTranslator(t: Translator) {
  browserTranslator = t;
}

/** Translate outside a component: `tr('Something went wrong.')`. Prefer useT() in components. */
export function tr(source: string | null | undefined, vars?: Parameters<Translator>[1]): string {
  return browserTranslator(source, vars);
}

/** BCP 47 tag of the viewer's language (`fr-FR`…), for Intl / toLocale*String outside components. */
export function localeTag(): string {
  return browserTranslator.tag;
}

/** `tr` for counted text: `trPlural(n, '{count} product', '{count} products')`. */
export function trPlural(count: number, one: string, other: string, vars?: Parameters<Translator>[1]): string {
  return browserTranslator.plural(count, one, other, vars);
}
