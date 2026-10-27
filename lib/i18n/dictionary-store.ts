import type { Locale } from '@/lib/i18n/config';
import type { Messages } from '@/lib/i18n/translate';

/*
 * Where I18nProvider finds the active dictionary, instead of receiving it as a prop.
 *
 * As a prop, the whole dictionary (~370 KB for French) was serialized into every HTML page. Now:
 * - in the browser, /i18n/<locale>.js (app/i18n/[file]/route.ts) fills it through the provider's
 *   Suspense gate and is cached for a year under a content hash;
 * - on the server, the root layout registers it before rendering. One dictionary per locale and they
 *   never change while the server runs, so concurrent requests in different languages cannot clash.
 */
const GLOBAL_KEY = '__SKRAFT_I18N__';

type Store = Partial<Record<Locale, Messages>>;

function store(): Store {
  const holder = globalThis as unknown as Record<string, Store | undefined>;
  return (holder[GLOBAL_KEY] ??= {});
}

export function registerDictionary(locale: Locale, messages: Messages): void {
  store()[locale] = messages;
}

export function getDictionary(locale: Locale): Messages | undefined {
  return store()[locale];
}

/** The script URL serving a locale's dictionary; `version` is its content hash (cache busting). */
export function dictionaryScriptUrl(locale: Locale, version: string): string {
  return `/i18n/${locale}.js?v=${version}`;
}

const loading = new Map<string, Promise<void>>();

/** Browser only: loads a dictionary before mounting the resolved provider. */
export function loadDictionary(locale: Locale, version: string): Promise<void> {
  const url = dictionaryScriptUrl(locale, version);
  let promise = loading.get(url);
  if (!promise) {
    promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        script.remove();
        if (getDictionary(locale)) resolve();
        else {
          loading.delete(url);
          reject(new Error(`The ${locale} dictionary script loaded without registering its messages`));
        }
      };
      script.onerror = () => {
        script.remove();
        loading.delete(url);
        reject(new Error(`Could not load the ${locale} dictionary`));
      };
      document.head.appendChild(script);
    });
    loading.set(url, promise);
  }
  return promise;
}
