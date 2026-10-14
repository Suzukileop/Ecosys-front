'use client';

import Link from 'next/link';
import { CONTAINER } from '@/components/landing/home/shared';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { Wordmark } from '@/components/landing/home/SiteNav';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

const COLUMNS = [
  {
    title: msg('Product'),
    links: [
      { label: msg('Features'), href: '/#features' },
      { label: msg('Designs'), href: '/#templates' },
      { label: msg('Pricing'), href: '/#pricing' },
      { label: msg('FAQ'), href: '/#faq' },
    ],
  },
  {
    title: msg('Explore'),
    links: [
      { label: msg('Find a provider'), href: '/providers' },
      { label: msg('Marketplace'), href: '/marketplace' },
      { label: msg('Create an account'), href: '/register' },
      { label: msg('Log in'), href: '/login' },
    ],
  },
  {
    title: msg('Company'),
    links: [
      { label: msg('Legal notice'), href: '/legal' },
      { label: msg('Terms of service'), href: '/terms' },
      { label: msg('Privacy'), href: '/privacy' },
      { label: msg('Contact'), href: 'mailto:leopardjuliocesar8@gmail.com' },
    ],
  },
] as const;

export function SiteFooter() {
  const t = useT();
  return (
    <footer data-nav-dark className="bg-[#111111] text-white">
      <div className={`${CONTAINER} pb-10 pt-16 sm:pt-20`}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-12 md:gap-10">
          <div className="col-span-2 md:col-span-6">
            <Wordmark onDark className="!text-[26px]" />
            <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-white/60">
              {t('Create your portfolio, showcase your services or launch your shop — and talk to clients directly.')}
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="md:col-span-2">
              <h4 className="text-[13px] font-medium uppercase tracking-[0.14em] text-white/45">{t(column.title)}</h4>
              <ul className="mt-6 space-y-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[16px] text-white/80 transition-colors hover:text-white"
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-[14px] text-white/50 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Skraft</span>
          <span>{t('Made for people who make things.')}</span>
          <LanguageSwitcher tone="dark" placement="top" className="self-start sm:self-auto" />
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 self-start font-medium text-white transition-opacity hover:opacity-60 sm:self-auto"
          >
            {t('Back to top')}
            <span aria-hidden>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
