'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { CONTAINER, PrimaryCta } from '@/components/landing/home/shared';

const BILLBOARD_FACES = [
  '/landing/audience/student-v2.jpg',
  '/landing/audience/seller-v2.jpg',
  '/landing/audience/recruiter-v2.jpg',
  '/landing/audience/freelancer-v3.jpg',
];

const SHOWCASE_LABELS = {
  portfolio: 'Portfolio',
  store: 'Store',
  hiring: 'Hiring',
  services: 'Services',
} as const;

const SHOWCASES = [
  {
    key: 'portfolio',
    thumb: '/landing/showcase/portfolio.jpg',
    headline: 'Show your best work on a page built to impress.',
    steps: ['Add your info', 'Pick and configure a template', 'Build and publish'],
    cta: { label: 'Create your portfolio', href: '/register' },
  },
  {
    key: 'store',
    thumb: '/landing/showcase/store.jpg',
    headline: 'Create your online store, starting today.',
    steps: ['Add your products', 'Set up your storefront', 'Publish and get paid'],
    cta: { label: 'Open your store', href: '/register' },
  },
  {
    key: 'hiring',
    thumb: '/landing/showcase/hiring.jpg',
    headline: 'Find proven talent and hire in a few messages.',
    steps: ['Browse portfolios', 'Shortlist profiles', 'Reach out directly'],
    cta: { label: 'Start hiring', href: '/marketplace/creators' },
  },
  {
    key: 'services',
    thumb: '/landing/showcase/services.jpg',
    headline: 'Turn your skills into booked clients.',
    steps: ['Describe your services', 'Showcase past work', 'Close deals by message'],
    cta: { label: 'Offer your services', href: '/register' },
  },
] as const;

type Showcase = (typeof SHOWCASES)[number];

/* Placeholder for the upcoming walkthrough video. */
function VideoFrame({ thumb }: { thumb: string }) {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#F4F4F4]">
      <Image src={thumb} alt="" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
      <span
        aria-hidden
        className="relative inline-flex h-16 w-16 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] items-center justify-center rounded-full bg-[#111111] text-white"
      >
        <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.5v13l10.5-6.5L8 5.5z" />
        </svg>
      </span>
    </div>
  );
}

function ShowcaseLabel({ index, showcase }: { index: number; showcase: Showcase }) {
  return (
    <p className="mb-5 flex items-center gap-3 text-[13px] font-medium uppercase tracking-[0.16em] text-neutral-500 sm:mb-6">
      <span className="font-mono text-[#111111]">0{index + 1}</span>
      <span aria-hidden className="h-px w-6 bg-black/20" />
      {SHOWCASE_LABELS[showcase.key]}
    </p>
  );
}

function Question({ showcase }: { showcase: Showcase }) {
  return (
    <h3 className="text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.04em]">
      {showcase.headline}
    </h3>
  );
}

function Details({ showcase }: { showcase: Showcase }) {
  return (
    <>
      <ol className="border-t border-black/[0.08]">
        {showcase.steps.map((step) => (
          <li
            key={step}
            className="flex items-center gap-4 border-b border-black/[0.08] py-5 text-[17px] font-medium tracking-[-0.015em] sm:gap-5 sm:text-[19px]"
          >
            <span
              aria-hidden
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-[#FF5722] text-white"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            {step}
          </li>
        ))}
      </ol>

      <div className="mt-10 sm:mt-14 md:mt-10">
        <PrimaryCta href={showcase.cta.href}>{showcase.cta.label}</PrimaryCta>
      </div>
    </>
  );
}

export function FeatureRows() {
  const desktopRefs = useRef<(HTMLElement | null)[]>([]);
  const mobileRefs = useRef<(HTMLElement | null)[]>([]);

  /* Only one of the two layouts is rendered visibly, so scroll to whichever copy has a box. */
  const scrollToShowcase = (index: number) => {
    const desktop = desktopRefs.current[index];
    const target = desktop && desktop.offsetParent ? desktop : mobileRefs.current[index];
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="product" className="relative scroll-mt-20 bg-white py-20 text-[#111111] sm:py-28 lg:py-36">
      <div className={`${CONTAINER} relative`}>
        <div className="mb-20 sm:mb-28 md:mb-0">
          <h2 className="text-[clamp(3.25rem,11.5vw,11.5rem)] font-semibold leading-[0.86] tracking-[-0.065em]">
            <span className="block">Built for</span>
            <span className="flex items-center justify-end gap-[0.18em]">
              <span aria-hidden className="flex h-[0.72em] items-center rounded-full bg-[#EDEDED] p-[0.06em]">
                {BILLBOARD_FACES.map((src, i) => (
                  <span
                    key={src}
                    className={`relative block aspect-square h-full overflow-hidden rounded-full ring-[0.04em] ring-white ${
                      i === 0 ? '' : '-ml-[0.16em]'
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="120px" className="object-cover grayscale-[20%] sepia-[15%]" />
                  </span>
                ))}
              </span>
              every way
            </span>
            <span className="block">
              you work
              <span
                aria-hidden
                className="ml-[0.05em] inline-block h-[0.15em] w-[0.15em] rounded-full bg-[#FF5722] align-baseline"
              />
            </span>
          </h2>

          <div className="mt-10 flex flex-col gap-6 border-t border-black/[0.08] pt-6 sm:mt-14 sm:flex-row sm:items-start sm:justify-between">
            <p className="max-w-xs text-[15px] leading-relaxed text-neutral-600 sm:text-[16px]">
              One platform, four ways to use it. Pick yours and go live in minutes.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-medium sm:text-[15px]">
              {SHOWCASES.map((showcase, i) => (
                <li key={showcase.key}>
                  <button
                    type="button"
                    onClick={() => scrollToShowcase(i)}
                    className="underline decoration-transparent underline-offset-[6px] transition-colors hover:decoration-current"
                  >
                    {SHOWCASE_LABELS[showcase.key]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Small screens: one stacked block per audience. */}
        <div className="space-y-24 sm:space-y-32 md:hidden">
          {SHOWCASES.map((showcase, i) => (
            <article
              key={showcase.key}
              ref={(el) => {
                mobileRefs.current[i] = el;
              }}
              className="scroll-mt-24"
            >
              <ShowcaseLabel index={i} showcase={showcase} />
              <Question showcase={showcase} />
              <div className="mt-10 sm:mt-16">
                <VideoFrame thumb={showcase.thumb} />
              </div>
              <div className="mt-10">
                <Details showcase={showcase} />
              </div>
            </article>
          ))}
        </div>

        {/* Desktop: classic zigzag, the video alternates sides from one row to the next. */}
        <div className="mt-28 hidden space-y-32 md:block lg:mt-36 lg:space-y-44">
          {SHOWCASES.map((showcase, i) => (
            <article
              key={showcase.key}
              ref={(el) => {
                desktopRefs.current[i] = el;
              }}
              className="grid scroll-mt-24 grid-cols-12 items-center gap-12 lg:gap-16"
            >
              <div className={`col-span-7 ${i % 2 ? 'order-2' : ''}`}>
                <ShowcaseLabel index={i} showcase={showcase} />
                <VideoFrame thumb={showcase.thumb} />
              </div>
              <div className="col-span-5">
                <Question showcase={showcase} />
                <div className="mt-8 lg:mt-10">
                  <Details showcase={showcase} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
