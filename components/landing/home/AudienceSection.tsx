'use client';

import Image from 'next/image';
import { PrimaryCta } from '@/components/landing/home/shared';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { CONTAINER } from '@/components/landing/home/shared';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

type Audience = {
  key: string;
  label: string;
  title: string;
  text: string;
  image: { src: string; alt: string };
  cta: { label: string; href: string };
};

/**
 * Photos: 1600px exports from Unsplash (free Unsplash License) — MZNZ4yBiG9E by Simeon Frank,
 * J_wqNE9abJw by MBA studio, s-aRz4D_b5I by Tim van der Kuip, IESB4iFVuzA by Resume Genius,
 * 2j8ygLo8cqE by Sanni Sahil.
 */
const AUDIENCES: readonly Audience[] = [
  {
    key: 'students',
    label: msg('Students'),
    title: msg('Turn your coursework into a portfolio that gets you hired.'),
    text: msg('Showcase projects, internships and skills on a clean page recruiters actually read. Start free, publish in minutes and share one link with every application.'),
    image: { src: '/landing/audience/student-glasses.jpg', alt: msg('A student with glasses focused on her laptop') },
    cta: { label: msg('Create your portfolio'), href: '/register' },
  },
  {
    key: 'clients',
    label: msg('Clients'),
    title: msg('Find the right talent — and talk to them directly.'),
    text: msg('Browse portfolios, compare services and message providers without a middleman. See real work before you commit, and keep every conversation in a single inbox.'),
    image: { src: '/landing/audience/client.jpg', alt: msg('A client looking for a provider on her phone by a window') },
    cta: { label: msg('Find a provider'), href: '/providers' },
  },
  {
    key: 'sellers',
    label: msg('Sellers'),
    title: msg('Open a store that looks as good as what you make.'),
    text: msg('List physical and digital products, manage stock and orders, and get discovered in the Skraft marketplace — from the same place as your portfolio.'),
    image: { src: '/landing/audience/seller.jpg', alt: msg('A shop owner holding a parcel ready to ship') },
    cta: { label: msg('Open your store'), href: '/register' },
  },
  {
    key: 'recruiters',
    label: msg('Recruiters'),
    title: msg('Hire from real work, not from a CV.'),
    text: msg('Review projects, skills and experience on structured profiles. Shortlist candidates and reach them directly, in one place built for clear hiring decisions.'),
    image: { src: '/landing/audience/recruiter.jpg', alt: msg('A recruiter interviewing a candidate') },
    cta: { label: msg('Browse portfolios'), href: '/providers' },
  },
  {
    key: 'freelancers',
    label: msg('Freelancers'),
    title: msg('Sell your services with a page that closes deals.'),
    text: msg('Present your offers with clear pricing, show the work behind them and handle client conversations right next to your portfolio. Less admin, more booked projects.'),
    image: {
      src: '/landing/audience/freelancer-dev.jpg',
      alt: msg('A freelance developer working on code at his desk'),
    },
    cta: { label: msg('Offer your services'), href: '/register' },
  },
];

const AUTOPLAY_MS = 5000;

/** Editorial audience switcher: a typographic list of who Skraft is for, with a detail panel per audience. */
export function AudienceSection() {
  const t = useT();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const baseId = useId();
  const current = AUDIENCES[active];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* Re-armed on every change, so a manual pick always gets a full interval before the next step. */
  useEffect(() => {
    if (hovered || focused || !inView) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % AUDIENCES.length), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [active, hovered, focused, inView]);

  const pauseProps = {
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === 'mouse') setHovered(true);
    },
    onPointerLeave: () => setHovered(false),
  };

  const select = (index: number) => {
    const next = (index + AUDIENCES.length) % AUDIENCES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') select(active + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') select(active - 1);
    else if (e.key === 'Home') select(0);
    else if (e.key === 'End') select(AUDIENCES.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <section
      ref={sectionRef}
      id="audience"
      className="scroll-mt-20 bg-white py-20 text-[#111111] sm:py-28 lg:py-36"
    >
      <div className={CONTAINER}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <h2
            id={`${baseId}-label`}
            className="whitespace-nowrap text-[clamp(2rem,3.2vw,2.875rem)] font-medium leading-[1.1] tracking-[-0.03em]"
          >
            {t('Made for you')}
            <span className="text-neutral-300">.</span>
          </h2>

          <div
            role="tablist"
            aria-labelledby={`${baseId}-label`}
            {...pauseProps}
            onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
            }}
            className="-mx-6 flex snap-x items-center gap-x-6 overflow-x-auto px-6 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-x-8 sm:gap-y-2 sm:overflow-visible sm:px-0 md:justify-end md:pb-1 [&::-webkit-scrollbar]:hidden"
          >
            {AUDIENCES.map((audience, i) => {
              const selected = i === active;
              return (
                <button
                  key={audience.key}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${audience.key}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={onKeyDown}
                  className={`shrink-0 snap-start whitespace-nowrap rounded-sm py-1 text-[16px] tracking-[-0.015em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 sm:text-[17px] lg:text-[20px] ${
                    selected ? 'underline decoration-1 underline-offset-[8px]' : 'text-neutral-400 hover:text-[#111111]'
                  }`}
                >
                  {t(audience.label)}
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${current.key}`}
          className="mt-10 grid items-stretch gap-10 sm:mt-16 md:grid-cols-2 md:gap-12 lg:gap-20"
        >
          <div {...pauseProps} className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#EDEDED]">
            {AUDIENCES.map((audience, i) => (
              <Image
                key={audience.key}
                src={audience.image.src}
                alt={i === active ? t(audience.image.alt) : ''}
                aria-hidden={i !== active}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className={`object-cover grayscale-[20%] sepia-[15%] transition-opacity duration-700 ease-out ${i === active ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>

          <div className="flex max-w-xl flex-col">
            <div key={current.key} className="flex flex-1 animate-[audience-in_0.6s_ease-out] flex-col md:justify-end">
              <h3 className="text-[clamp(1.375rem,1.8vw,1.625rem)] font-medium leading-[1.25] tracking-[-0.015em]">
                {t(current.title)}
              </h3>
              <p className="mt-4 text-[16px] leading-relaxed text-neutral-600 sm:text-[17px]">
                {t(current.text)}
              </p>
              <PrimaryCta href={current.cta.href} className="mt-8 sm:mt-10">
                {t(current.cta.label)}
              </PrimaryCta>
            </div>

            <div className="mt-8 flex justify-end md:hidden">
              {/* On small screens the audience list has scrolled out of view by the time you reach this row. */}
              <button
                type="button"
                onClick={() => setActive((active + 1) % AUDIENCES.length)}
                aria-label={t('Next audience')}
                aria-controls={`${baseId}-panel`}
                className="-me-3 inline-flex h-11 w-11 items-center justify-center rounded-full active:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 md:hidden"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
