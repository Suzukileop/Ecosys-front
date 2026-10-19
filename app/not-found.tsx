import Link from 'next/link';
import type { Metadata } from 'next';
import { Wordmark } from '@/components/landing/home/SiteNav';
import { CONTAINER, PrimaryCta } from '@/components/landing/home/shared';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Page not found — Skraft',
  robots: { index: false, follow: true },
};

/** Unmatched URLs and notFound() calls: the brand, a plain explanation and two ways back. */
export default async function NotFound() {
  const t = await getT();
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111111]">
      <header className="border-b border-black/[0.08]">
        <div className={`${CONTAINER} flex h-16 items-center`}>
          <Wordmark />
        </div>
      </header>
      <main className={`${CONTAINER} flex flex-1 flex-col justify-center py-20`}>
        <p className="font-mono text-[13px] uppercase tracking-[0.16em] text-neutral-400">404</p>
        <h1 className="mt-4 max-w-[18ch] text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.03em]">
          {t('This page does not exist.')}
        </h1>
        <p className="mt-5 max-w-md text-[17px] leading-relaxed text-neutral-600">
          {t('The link may be broken, or the page was moved or removed.')}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
          <PrimaryCta href="/">{t('Back to home')}</PrimaryCta>
          <Link
            href="/providers"
            className="text-[15px] font-medium underline decoration-black/20 underline-offset-[6px] hover:decoration-[#111111]"
          >
            {t('Find a provider')}
          </Link>
        </div>
      </main>
    </div>
  );
}
