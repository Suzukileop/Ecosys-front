'use client';

import Link from 'next/link';
import { FooterFeedbackForm } from '@/components/landing/FooterFeedbackForm';
import { CONTAINER } from '@/components/landing/home/shared';
import { Wordmark } from '@/components/landing/home/SiteNav';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#product' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Legal notice', href: '/legal' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Contact', href: 'mailto:leopardjuliocesar8@gmail.com' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className={`${CONTAINER} pb-10 pt-24 sm:pt-32 lg:pt-40`}>
        <h2 className="text-[clamp(3.25rem,9vw,8.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em]">
          Let&apos;s build
          <br />
          together.
        </h2>

        <div className="mt-20 grid gap-14 sm:mt-28 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <Wordmark onDark className="!text-[26px]" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/55">
              Create your portfolio, showcase your services or launch your shop — and talk to clients directly.
            </p>
            <a
              href="mailto:leopardjuliocesar8@gmail.com"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14px] font-medium text-white ring-1 ring-inset ring-white/40 transition-colors hover:bg-white hover:text-[#111111]"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
              </svg>
              Contact us
            </a>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="md:col-span-2">
              <h4 className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/40">{column.title}</h4>
              <ul className="mt-5 space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] font-medium text-white transition-opacity hover:opacity-60"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-4">
            <FooterFeedbackForm />
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-4 border-t border-white/10 pt-8 text-[12px] font-medium uppercase tracking-[0.14em] text-white/45 sm:mt-32 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Skraft</span>
          <span>Made for people who make things.</span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 self-start uppercase text-white transition-opacity hover:opacity-60 sm:self-auto"
          >
            Back to top
            <span aria-hidden>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
