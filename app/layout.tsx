import type { Metadata } from 'next';
import '@/lib/fonts/app-fonts';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/landing/ThemeProvider';
import { ChunkLoadRecovery } from '@/components/ChunkLoadRecovery';
import { ThemeInitScript } from '@/components/ThemeInitScript';
import { localeDir } from '@/lib/i18n/config';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { getLocale, getMessages, getT } from '@/lib/i18n/server';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { dictionaryScriptUrl, registerDictionary } from '@/lib/i18n/dictionary-store';
import { dictionaryVersion } from '@/lib/i18n/dictionary-version';

const initThemeScript = `
  (function(){
    try {
      if (location.pathname.indexOf('/portfolio') === 0) {
        document.documentElement.classList.remove('dark');
        return;
      }
      var t = localStorage.getItem('lp-theme');
      if(!t || t === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch(e){
      document.documentElement.classList.add('dark');
    }
  })();
`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: t('Skraft — Build, showcase and sell'),
    description: t('Create your portfolio, sell physical and digital products, and talk to clients directly — all in one place, with no middleman.'),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  /* Server render reads it from the registry; the browser gets it from the cached script below. */
  registerDictionary(locale, messages);
  const dictVersion = dictionaryVersion(locale, messages);
  /* HttpOnly, so only the server can see it: tells the client whether a session is worth restoring. */
  const hasSession = Boolean((await cookies()).get('refresh_token')?.value);
  return (
    <html lang={locale} dir={localeDir(locale)} suppressHydrationWarning>
      <head>
        <Script src={dictionaryScriptUrl(locale, dictVersion)} strategy="beforeInteractive" />
        {/* Must stay last in <head>: it renders only on the server (null in the browser), and any
            element after it would be matched against its <script> during hydration. */}
        <ThemeInitScript code={initThemeScript} />
      </head>
      <body spellCheck={false} className="font-sans antialiased">
        <ChunkLoadRecovery />
        <I18nProvider locale={locale} version={dictVersion}>
          <ThemeProvider>
            <AuthProvider initialHasSession={hasSession}>{children}</AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
