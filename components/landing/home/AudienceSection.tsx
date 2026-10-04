'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { CONTAINER } from '@/components/landing/home/shared';

type Audience = {
  key: string;
  label: string;
  title: string;
  text: string;
  image: { src: string; alt: string };
};

const AUDIENCES: readonly Audience[] = [
  {
    key: 'students',
    label: 'Students',
    title: 'Turn your coursework into a portfolio that gets you hired.',
    text: 'Showcase projects, internships and skills on a clean page recruiters actually read. Start free, publish in minutes and share one link with every application.',
    image: { src: '/landing/audience/student-v2.jpg', alt: 'A university student taking notes in a library' },
  },
  {
    key: 'clients',
    label: 'Clients',
    title: 'Find the right talent — and talk to them directly.',
    text: 'Browse portfolios, compare services and message providers without a middleman. See real work before you commit, and keep every conversation in a single inbox.',
    image: { src: '/landing/audience/client-v2.jpg', alt: 'A client choosing a provider on his phone in a café' },
  },
  {
    key: 'sellers',
    label: 'Sellers',
    title: 'Open a store that looks as good as what you make.',
    text: 'List physical and digital products, manage stock and orders, and get discovered in the Skraft marketplace — from the same place as your portfolio.',
    image: { src: '/landing/audience/seller-v2.jpg', alt: 'A shop owner holding a parcel ready to ship' },
  },
  {
    key: 'recruiters',
    label: 'Recruiters',
    title: 'Hire from real work, not from a CV.',
    text: 'Review projects, skills and experience on structured profiles. Shortlist candidates and reach them directly, in one place built for clear hiring decisions.',
    image: { src: '/landing/audience/recruiter-v2.jpg', alt: 'A recruiter interviewing a candidate' },
  },
  {
    key: 'freelancers',
    label: 'Freelancers',
    title: 'Sell your services with a page that closes deals.',
    text: 'Present your offers with clear pricing, show the work behind them and handle client conversations right next to your portfolio. Less admin, more booked projects.',
    image: {
      src: '/landing/audience/freelancer-v3.jpg',
      alt: 'A freelancer working on her laptop in a coffee shop',
    },
  },
];

const AUTOPLAY_MS = 5000;

/** Editorial audience switcher: a typographic list of who Skraft is for, with a detail panel per audience. */
export function AudienceSection() {
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
      className="scroll-mt-20 bg-white pb-20 pt-28 text-[#111111] sm:pb-28 sm:pt-36 lg:pb-36 lg:pt-48"
    >
      <div className={CONTAINER}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <h2
            id={`${baseId}-label`}
            className="whitespace-nowrap text-[clamp(2.25rem,4.5vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.05em]"
          >
            Made for you
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
            className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-8 md:justify-end md:pb-1"
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
                  className={`rounded-sm py-1 text-[14px] tracking-[-0.015em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 sm:text-[17px] lg:text-[20px] ${
                    selected ? 'underline decoration-1 underline-offset-[8px]' : 'text-neutral-400 hover:text-[#111111]'
                  }`}
                >
                  {audience.label}
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
                alt={i === active ? audience.image.alt : ''}
                aria-hidden={i !== active}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className={`object-cover grayscale-[20%] sepia-[15%] transition-opacity duration-700 ease-out ${i === active ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>

          <div className="flex max-w-xl flex-col">
            <div key={current.key} className="flex flex-1 animate-[audience-in_0.6s_ease-out] flex-col md:justify-end">
              <h3 className="text-[clamp(2rem,3.9vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
                {current.title}
              </h3>
              <p className="mt-7 text-[17px] leading-relaxed text-neutral-600 sm:mt-8 sm:text-[19px] lg:text-[20px]">
                {current.text}
              </p>
            </div>

            <div className="mt-8 flex justify-end md:hidden">
              {/* On small screens the audience list has scrolled out of view by the time you reach this row. */}
              <button
                type="button"
                onClick={() => setActive((active + 1) % AUDIENCES.length)}
                aria-label="Next audience"
                aria-controls={`${baseId}-panel`}
                className="-mr-3 inline-flex h-11 w-11 items-center justify-center rounded-full active:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 md:hidden"
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
