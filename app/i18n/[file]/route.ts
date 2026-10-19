import { gzipSync } from 'node:zlib';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/server';
import { dictionaryVersion } from '@/lib/i18n/dictionary-version';

/*
 * GET /i18n/<locale>.js?v=<hash> — the interface dictionary as a script that fills
 * globalThis.__SKRAFT_I18N__ (see lib/i18n/dictionary-store.ts). Loaded by the root layout before
 * hydration; the URL changes with the content, so browsers keep it for a year.
 *
 * Route handler responses are not compressed by `next start`, and the French dictionary is ~350 KB
 * of text (~60 KB gzipped): the body is gzipped here, once per locale per server process.
 */
const bodies = new Map<Locale, { plain: string; gzipped: Buffer }>();

async function scriptFor(locale: Locale) {
  let entry = bodies.get(locale);
  if (!entry) {
    const messages = await getMessages(locale);
    const plain =
      `(self.__SKRAFT_I18N__=self.__SKRAFT_I18N__||{})[${JSON.stringify(locale)}]=${JSON.stringify(messages)};` +
      `/* ${dictionaryVersion(locale, messages)} */\n`;
    entry = { plain, gzipped: gzipSync(plain, { level: 9 }) };
    bodies.set(locale, entry);
  }
  return entry;
}

export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const locale = file.replace(/\.js$/, '');
  if (!file.endsWith('.js') || !isLocale(locale)) {
    return new Response('Not found', { status: 404 });
  }
  const { plain, gzipped } = await scriptFor(locale);
  const headers: Record<string, string> = {
    'Content-Type': 'text/javascript; charset=utf-8',
    'Cache-Control': 'public, max-age=31536000, immutable',
    Vary: 'Accept-Encoding',
  };
  if (/\bgzip\b/.test(request.headers.get('accept-encoding') ?? '')) {
    return new Response(new Uint8Array(gzipped), { headers: { ...headers, 'Content-Encoding': 'gzip' } });
  }
  return new Response(plain, { headers });
}
