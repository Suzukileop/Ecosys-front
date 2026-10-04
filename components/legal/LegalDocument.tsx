import Link from 'next/link';
import type { ReactNode } from 'react';
import { CONTAINER, Eyebrow } from '@/components/landing/home/shared';
import { Wordmark } from '@/components/landing/home/SiteNav';
import { SiteFooter } from '@/components/landing/home/SiteFooter';
import { LEGAL, formatLegalDate } from '@/lib/legal';

export type LegalSection = { id: string; title: string; content: ReactNode };

const DOCUMENTS = [
  { href: '/terms', label: 'Terms of service', short: 'Terms' },
  { href: '/privacy', label: 'Privacy policy', short: 'Privacy' },
] as const;

const PROSE =
  'text-[16px] leading-[1.75] text-neutral-600 sm:text-[17px] ' +
  '[&_p]:mt-4 [&_p:first-child]:mt-0 ' +
  '[&_ul]:mt-4 [&_ul]:space-y-2.5 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:pl-1 [&_li::marker]:text-neutral-300 ' +
  '[&_h3]:mt-8 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:tracking-[-0.01em] [&_h3]:text-[#111111] ' +
  '[&_strong]:font-medium [&_strong]:text-[#111111] ' +
  '[&_a]:font-medium [&_a]:text-[#111111] [&_a]:underline [&_a]:decoration-black/20 [&_a]:underline-offset-4 hover:[&_a]:decoration-[#111111]';

/** Long-form legal page in the landing's visual language: numbered sections and a sticky index. */
export function LegalDocument({
  current,
  title,
  intro,
  sections,
}: {
  current: (typeof DOCUMENTS)[number]['href'];
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <>
      <header className="border-b border-black/[0.08]">
        <nav className={`${CONTAINER} flex h-16 items-center justify-between gap-6`} aria-label="Legal">
          <Wordmark />
          <ul className="flex items-center gap-1">
            {DOCUMENTS.map((doc) => (
              <li key={doc.href}>
                <Link
                  href={doc.href}
                  aria-current={doc.href === current ? 'page' : undefined}
                  className={`inline-flex h-10 items-center rounded-full px-4 text-[14px] transition-colors ${
                    doc.href === current
                      ? 'bg-[#111111] font-medium text-white'
                      : 'text-neutral-500 hover:text-[#111111]'
                  }`}
                >
                  <span className="sm:hidden">{doc.short}</span>
                  <span className="hidden sm:inline">{doc.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className={`${CONTAINER} pb-24 pt-16 sm:pb-32 sm:pt-24`}>
        <div className="max-w-3xl">
          <Eyebrow>Legal</Eyebrow>
          <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[1] tracking-[-0.045em] text-[#111111]">
            {title}
          </h1>
          <p className="mt-6 text-[13px] font-medium uppercase tracking-[0.14em] text-neutral-400">
            Last updated {formatLegalDate(LEGAL.lastUpdated)}
          </p>
          <div className={`mt-10 ${PROSE}`}>{intro}</div>
        </div>

        <div className="mt-16 grid gap-12 border-t border-black/[0.08] pt-12 sm:mt-20 lg:grid-cols-12 lg:gap-16 lg:pt-16">
          <aside className="lg:col-span-4 xl:col-span-3">
            <nav aria-label="On this page" className="lg:sticky lg:top-10">
              <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-neutral-400">On this page</p>
              <ol className="mt-5 space-y-1">
                {sections.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex items-baseline gap-3 py-1.5 text-[14px] text-neutral-500 transition-colors hover:text-[#111111]"
                    >
                      <span className="font-mono text-[11px] text-neutral-300 group-hover:text-[#FF5722]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="space-y-16 lg:col-span-8 xl:col-span-7">
            {sections.map((section, i) => (
              <section key={section.id} id={section.id} className="scroll-mt-10">
                <h2 className="flex items-baseline gap-4 text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[#111111]">
                  <span className="font-mono text-[13px] font-normal tracking-normal text-neutral-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </h2>
                <div className={`mt-6 ${PROSE}`}>{section.content}</div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

export function ContactLink() {
  return <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>;
}
