'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { brandCtaClass, brandFrameRadiusClass, landingSectionShellClass } from '@/components/landing/landingBrand';

const comparisons = [
  {
    before: 'Days spent building a professional page',
    after: 'Your site ready in a few minutes',
  },
  {
    before: 'No clear way to present your work',
    after: 'Showcase your work in one clean page',
  },
  {
    before: 'Services scattered across multiple apps',
    after: 'Portfolio, services & shop in one place',
  },
  {
    before: 'Hard for clients to find what you offer',
    after: 'Clients see your offers instantly',
  },
  {
    before: 'Costly tools just to look professional',
    after: 'Look professional without the cost',
  },
  {
    before: 'No direct chat without intermediaries',
    after: 'Chat and sell directly—no middleman',
  },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

function ComparisonBullet({
  text,
  tone,
}: {
  text: string;
  tone: 'before' | 'after';
}) {
  const isAfter = tone === 'after';
  return (
    <li className="flex items-start gap-3 sm:gap-3.5">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full sm:mt-1 sm:h-6 sm:w-6 ${
          isAfter
            ? 'bg-[#F97316] text-white'
            : 'border border-neutral-400 text-neutral-500 dark:border-neutral-500 dark:text-neutral-400'
        }`}
        aria-hidden="true"
      >
        <FontAwesomeIcon
          icon={isAfter ? faCheck : faXmark}
          className="h-2.5 w-2.5 sm:h-3 sm:w-3"
        />
      </span>
      <span className="text-base font-medium leading-snug lp-text sm:text-lg md:text-xl">
        {text}
      </span>
    </li>
  );
}

export function ProblemSolution() {
  return (
    <div className="relative w-full">
      {/*
        One natural viewport — title in document flow.
        No pin track / fixed overlay / negative margin (those made scroll feel like snap).
      */}
      <div className="relative flex min-h-[100svh] w-full items-center justify-center px-5 lp-bg sm:px-8">
        <motion.h2
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="whitespace-nowrap text-center text-[clamp(2.5rem,8vw,7.5rem)] font-bold leading-none tracking-tight lp-text"
        >
          Stop wasting time.
        </motion.h2>
      </div>

      <section
        aria-label="Before and after comparison"
        className="relative z-10 w-full overflow-x-hidden lp-bg pt-16 pb-16 transition-colors duration-300 md:pt-24 md:pb-24"
      >
        <div className={landingSectionShellClass}>
          <p className="mx-auto mb-10 max-w-xl text-center text-sm lp-muted sm:text-base md:mb-14">
            See the difference between building alone and launching with NoProbleme.
          </p>

          <div
            className={`relative border border-neutral-200 bg-neutral-100 px-5 py-8 dark:border-neutral-700 dark:bg-neutral-900/60 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:px-12 lg:py-14 ${brandFrameRadiusClass}`}
          >
            <div className="relative grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-0">
              <div
                className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-px -translate-x-1/2 bg-neutral-300 dark:bg-neutral-700 lg:block"
                aria-hidden="true"
              />

              <div className="flex w-full min-w-0 flex-col lg:pr-12 xl:pr-16 2xl:pr-20">
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500 sm:text-xs">
                  Before
                </span>
                <div className="mb-6 md:mb-8">
                  <h3 className="text-2xl font-bold tracking-tight lp-text sm:text-3xl md:text-4xl">
                    Without our platform
                  </h3>
                </div>

                <ul className="flex flex-col gap-9 sm:gap-10 md:gap-12">
                  {comparisons.map((item) => (
                    <ComparisonBullet key={item.before} text={item.before} tone="before" />
                  ))}
                </ul>

                <div className="mt-8 md:mt-10">
                  <span className="text-sm text-neutral-500 underline decoration-neutral-400/80 underline-offset-4 dark:text-neutral-400 dark:decoration-neutral-500 sm:text-base">
                    Keep doing it manually
                  </span>
                </div>
              </div>

              <div className="flex w-full min-w-0 flex-col border-t border-neutral-300 pt-10 dark:border-neutral-700 lg:border-t-0 lg:pl-12 lg:pt-0 xl:pl-16 2xl:pl-20">
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.22em] text-[#F97316] sm:text-xs">
                  After
                </span>
                <div className="mb-6 md:mb-8">
                  <h3 className="text-2xl font-bold tracking-tight lp-text sm:text-3xl md:text-4xl">
                    With our platform
                  </h3>
                </div>

                <ul className="flex flex-col gap-9 sm:gap-10 md:gap-12">
                  {comparisons.map((item) => (
                    <ComparisonBullet key={item.after} text={item.after} tone="after" />
                  ))}
                </ul>

                <div className="mt-8 md:mt-10">
                  <Link
                    href="/register"
                    className={`inline-flex items-center px-6 py-3 text-sm font-semibold sm:px-8 sm:py-3.5 sm:text-base ${brandCtaClass}`}
                  >
                    I want to stop wasting time →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
