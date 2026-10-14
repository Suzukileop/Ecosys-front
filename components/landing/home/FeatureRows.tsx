'use client';

import Link from 'next/link';
import { useRef, useState, type KeyboardEvent } from 'react';
import { CONTAINER, VideoSlot } from '@/components/landing/home/shared';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/** Four ways to use Skraft — each with what it actually gives you (not the same three steps four times). */
const SHOWCASES: {
  key: string;
  label: string;
  headline: string;
  intro: string;
  benefits: string[];
  video: string;
  cta: { label: string; href: string };
}[] = [
  {
    key: 'portfolio',
    label: msg('Portfolio'),
    headline: msg('Show your best work on a page built to impress.'),
    intro: msg('Everything a client needs to say yes, on one link you can share anywhere.'),
    benefits: [
      msg('Professional designs, ready in minutes'),
      msg('Projects, experience, tools and contact on one page'),
      msg('See who visits your profile'),
    ],
    video: msg('Video: building a portfolio'),
    cta: { label: msg('Create your portfolio'), href: '/register' },
  },
  {
    key: 'store',
    label: msg('Store'),
    headline: msg('Open a store that looks as good as what you make.'),
    intro: msg('Sell from your own page and reach buyers already browsing Skraft.'),
    benefits: [
      msg('Physical and digital products, stock tracked'),
      msg('Discovered in the Skraft marketplace'),
      msg('Sales recorded in one click'),
    ],
    video: msg('Video: setting up a store'),
    cta: { label: msg('Open your store'), href: '/register' },
  },
  {
    key: 'services',
    label: msg('Services'),
    headline: msg('Turn your skills into booked clients.'),
    intro: msg('Package what you do into offers clients can order in a few messages.'),
    benefits: [
      msg('Clear offers with prices and delivery times'),
      msg('Questions and orders handled by message'),
      msg('Listed for clients searching on Skraft'),
    ],
    video: msg('Video: publishing a service'),
    cta: { label: msg('Offer your services'), href: '/register' },
  },
  {
    key: 'hiring',
    label: msg('Hiring'),
    headline: msg('Hire from real work, not from a CV.'),
    intro: msg('See what people have actually built before you reach out.'),
    benefits: [
      msg('Portfolios with real projects and skills'),
      msg('Filter by specialty, experience and distance'),
      msg('Message candidates directly'),
    ],
    video: msg('Video: finding a provider from their portfolio'),
    cta: { label: msg('Find a provider'), href: '/providers' },
  },
];

/** "How it works": one tab per offer; the card under the tabs shows that offer's pitch, benefits and video. */
export function FeatureRows() {
  const t = useT();
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const showcase = SHOWCASES[tab];
  const selectTab = (next: number) => setTab(next);

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (tab + delta + SHOWCASES.length) % SHOWCASES.length;
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="how-it-works" className="relative scroll-mt-20 bg-white py-20 text-[#111111] sm:py-28 lg:py-36">
      <div className={CONTAINER}>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[clamp(2rem,3.2vw,2.875rem)] font-medium leading-[1.1] tracking-[-0.03em]">
              {t('One platform, four ways to grow.')}
            </h2>
          </div>

          <div
            role="tablist"
            aria-label={t('How it works')}
            className="flex max-w-full shrink-0 self-start overflow-x-auto rounded-full bg-[#EDEDED] p-1 md:self-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {SHOWCASES.map((item, i) => {
              const active = i === tab;
              return (
                <button
                  key={item.key}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`how-tab-${item.key}`}
                  aria-selected={active}
                  aria-controls="how-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectTab(i)}
                  onKeyDown={onTabKey}
                  className={`inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-[15px] font-medium transition-colors sm:px-5 ${
                    active
                      ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                      : 'text-neutral-500 hover:text-[#111111]'
                  }`}
                >
                  {t(item.label)}
                </button>
              );
            })}
          </div>
        </div>

        {/* A hairline frame on the page's own white (no tinted fill), so it reads light next to "Made for you". */}
        <div
          id="how-panel"
          role="tabpanel"
          aria-labelledby={`how-tab-${showcase.key}`}
          className="mt-10 grid items-stretch gap-6 rounded-3xl border border-black/[0.08] p-3 sm:mt-14 sm:p-4 md:grid-cols-2 md:gap-8"
        >
          <div key={`${showcase.key}-video`} className="animate-[audience-in_0.5s_ease-out] md:order-2">
            <VideoSlot slot={`use-${showcase.key}`} label={t(showcase.video)} ratio="aspect-[4/3]" className="!rounded-xl" />
          </div>

          <div key={showcase.key} className="flex animate-[audience-in_0.5s_ease-out] flex-col justify-between gap-10 px-4 pb-4 sm:px-6 sm:pb-6 md:py-6 md:pl-6 md:pr-0 lg:py-8 lg:pl-8">
            <div>
              <h3 className="text-[clamp(1.375rem,1.8vw,1.625rem)] font-medium leading-[1.25] tracking-[-0.015em]">
                {t(showcase.headline)}
              </h3>
              <p className="mt-4 text-[16px] leading-relaxed text-neutral-600 sm:text-[17px]">{t(showcase.intro)}</p>
              <Link
                href={showcase.cta.href}
                className="mt-6 inline-block text-[15px] font-medium text-[#F54E00] transition-colors hover:text-[#C93F00]"
              >
                {t(showcase.cta.label)} <span aria-hidden>→</span>
              </Link>
            </div>

            <ul className="border-t border-black/[0.08]">
              {showcase.benefits.map((benefit) => (
                <li key={benefit} className="border-b border-black/[0.08] py-4 text-[16px] font-medium leading-snug">
                  {t(benefit)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
