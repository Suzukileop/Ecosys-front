import { createHash } from 'node:crypto';
import type { Locale } from '@/lib/i18n/config';
import type { Messages } from '@/lib/i18n/translate';

const versions = new Map<Locale, string>();

/** Short content hash of a dictionary, computed once per locale per server process. */
export function dictionaryVersion(locale: Locale, messages: Messages): string {
  let version = versions.get(locale);
  if (!version) {
    version = createHash('sha1').update(JSON.stringify(messages)).digest('hex').slice(0, 12);
    versions.set(locale, version);
  }
  return version;
}
