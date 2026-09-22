'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLandingEntrance } from '@/components/landing/LandingEntranceContext';
import {
  HERO_PROBLEME_CLASS,
  IDEA_SLOT_CLASS,
  NO_CIRCLE_CLASS,
  NO_HANDOFF_DURATION,
  NO_TEXT_CLASS,
} from '@/components/landing/landingEntranceNo';
import { toEntranceRect } from '@/components/landing/landingEntranceTypes';

import { BRAND_ORANGE } from '@/components/landing/landingBrand';
const WORD_INTERVAL_MS = 2500;
const WORDS = ['CODE?', 'PORTFOLIO?', 'PROBLEM'] as const;
/** Widest label — reserves layout width so the headline does not jump. */
const WORD_SLOT_PLACEHOLDER = 'PORTFOLIO?';

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

const HERO_IMAGE_WIDTH = 5056;
const HERO_IMAGE_HEIGHT = 3392;

const heroGalleryItems = [
  {
    src: '/landing/hero/image0.png',
    alt: 'Creator building a portfolio at their desk',
    marketingTerm: 'Creators',
    description:
      'Turn your skills into a professional page. Present your work, list your services, and let clients reach you directly.',
  },
  {
    src: '/landing/hero/image1.png',
    alt: 'Graduate showcasing achievements',
    marketingTerm: 'Students',
    description:
      'Highlight your projects, experience, and achievements in a clean portfolio ready to share with schools and employers.',
  },
  {
    src: '/landing/hero/image2.png',
    alt: 'Business team presenting their brand',
    marketingTerm: 'Businesses',
    description:
      'Give your company a clear online identity. Showcase your brand, team, and offers in one professional space.',
  },
  {
    src: '/landing/hero/image3.png',
    alt: 'Seller managing an online shop',
    marketingTerm: 'Sellers',
    description:
      'Launch a simple storefront, display your products, and talk to buyers without leaving the platform.',
  },
  {
    src: '/landing/hero/portrait-pro-freelan.png',
    alt: 'Freelancers collaborating in a professional workspace',
    marketingTerm: 'Freelancers',
    description:
      'Show your expertise, get discovered by clients, and run your freelance work from one professional profile.',
  },
] as const;

const GALLERY_ROTATE_MS = 4000;
const GALLERY_FADE = {
  duration: 0.65,
  ease: REVEAL_EASE,
} as const;

function HeroInteractiveGallery() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const active = heroGalleryItems[selectedIndex];

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % heroGalleryItems.length);
    }, GALLERY_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [selectedIndex, isPaused]);

  return (
    <div
      className="relative mx-auto w-full max-w-[100rem]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Monumental backdrop word — full width, sits above the photo; the row below is pulled up
          into its lower half so the photo overlaps it, exposing only its top edge (never the list). */}
      <div
        aria-hidden
        className="relative z-0 -mb-[9vw] flex overflow-hidden select-none sm:-mb-[6.4vw] lg:-mb-[3.4vw]"
      >
        <div className="flex w-full items-end justify-center lg:w-[60%] xl:w-[57%]">
          <span className="whitespace-nowrap text-[20vw] font-black uppercase leading-none tracking-tighter text-neutral-100 dark:text-neutral-900 sm:text-[14vw] lg:text-[8.6vw]">
            Portfolio
          </span>
        </div>
        <div className="hidden lg:block lg:w-[40%]" />
      </div>

      <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-6 xl:gap-10">
        {/* Photo — asymmetric, left-anchored, overlapping the backdrop word. No text/CTA inside. */}
        <div className="relative w-full lg:w-[60%] xl:w-[57%]">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 sm:aspect-[19/10]">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={active.src}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={GALLERY_FADE}
                className="absolute inset-0"
              >
                <Image
                  src={active.src}
                  alt={active.alt}
                  width={HERO_IMAGE_WIDTH}
                  height={HERO_IMAGE_HEIGHT}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority={selectedIndex === 0}
                  loading={selectedIndex === 0 ? 'eager' : 'lazy'}
                  fetchPriority={selectedIndex === 0 ? 'high' : 'auto'}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Persona menu — vertical exhibition-style list, right of the photo */}
        <div
          className="relative z-20 flex w-full justify-start lg:w-[40%] lg:justify-end"
          role="tablist"
          aria-label="Target personas"
        >
          <div className="flex flex-col items-start gap-5 sm:gap-6 lg:items-end">
            {heroGalleryItems.map((item, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={item.src}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Show ${item.marketingTerm}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onFocus={() => setSelectedIndex(index)}
                  onClick={() => setSelectedIndex(index)}
                  className="group flex items-baseline gap-3 text-left transition-all duration-500"
                >
                  <span
                    className={`shrink-0 font-mono text-[0.7rem] tracking-widest transition-colors duration-500 ${
                      isActive ? 'text-[#F97316]' : 'text-neutral-400 dark:text-neutral-600'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')} /
                  </span>
                  <span
                    className={`text-2xl font-black uppercase leading-none tracking-tight transition-all duration-500 sm:text-3xl lg:text-4xl ${
                      isActive
                        ? 'text-neutral-950 opacity-100 dark:text-white'
                        : 'text-neutral-400 opacity-30 group-hover:opacity-60 dark:text-neutral-600'
                    }`}
                  >
                    {item.marketingTerm}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Description + CTA — outside the photo, asymmetric bottom-left */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${active.marketingTerm}-copy`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4, ease: REVEAL_EASE }}
          className="relative z-20 mt-8 flex w-full flex-col items-start gap-5 sm:mt-10 lg:w-[52%] xl:w-[46%]"
        >
          <p className="text-base leading-snug lp-muted sm:text-lg md:text-xl">
            {active.description}
          </p>
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 pb-1 text-xs font-semibold uppercase tracking-[0.25em] lp-text"
          >
            <span>Start for free</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              ↗
            </span>
            <span className="absolute bottom-0 left-0 h-px w-full bg-current opacity-30 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function HeroDecorations({
  problemeRef,
  showProbleme,
}: {
  problemeRef: React.RefObject<HTMLSpanElement | null>;
  showProbleme: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      <div className="absolute bottom-6 left-0 right-0 px-6 sm:bottom-8 sm:px-10 md:px-16 lg:px-20">
        <div
          className={`absolute bottom-0 right-6 flex items-baseline gap-1.5 pb-1 sm:right-10 md:right-16 lg:right-20 ${HERO_PROBLEME_CLASS} text-neutral-300 dark:text-neutral-700`}
        >
          <motion.span
            initial={false}
            animate={{ opacity: showProbleme ? 1 : 0 }}
            transition={{ duration: 0.4, delay: showProbleme ? 0.2 : 0, ease: [0.4, 0, 0.2, 1] }}
            className="tabular-nums"
          >
            0
          </motion.span>
          <motion.span
            ref={problemeRef}
            initial={false}
            animate={{ opacity: showProbleme ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            problem
          </motion.span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const { phase, problemeReady, reportTargetRects } = useLandingEntrance();
  const isSettled = phase === 'settled';
  const isRevealed = phase === 'revealed';
  const [wordIndex, setWordIndex] = useState(0);
  const [circleVisible, setCircleVisible] = useState(false);

  const noTextRef = useRef<HTMLSpanElement>(null);
  const problemeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isSettled) {
      const timer = window.setTimeout(
        () => setCircleVisible(true),
        NO_HANDOFF_DURATION * 1000 + 60,
      );
      return () => window.clearTimeout(timer);
    }
    if (!isSettled && !isRevealed) {
      setCircleVisible(false);
    }
  }, [isSettled, isRevealed]);

  useLayoutEffect(() => {
    if (phase !== 'flying') return;

    let cancelled = false;
    const measure = () => {
      if (cancelled || !noTextRef.current || !problemeRef.current) return;
      reportTargetRects({
        no: toEntranceRect(noTextRef.current.getBoundingClientRect()),
        probleme: toEntranceRect(problemeRef.current.getBoundingClientRect()),
      });
    };

    // Measure as soon as hero paints so the fly never idles mid-screen
    measure();
    const f1 = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    void document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(f1);
    };
  }, [phase, reportTargetRects]);

  useEffect(() => {
    if (!isRevealed) return;
    const timer = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, WORD_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isRevealed]);

  const activeWord = WORDS[wordIndex];

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-x-hidden lp-bg pt-28 pb-14 sm:pt-32 sm:pb-16 lg:overflow-x-visible">
      <HeroDecorations problemeRef={problemeRef} showProbleme={problemeReady} />

      <div className="relative z-10 mx-auto flex w-full max-w-[100rem] flex-col items-center px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Badge — NO / CODE? */}
        <div className="mb-4 flex items-center justify-center gap-3 sm:mb-5 sm:gap-4">
          <span
            className={`${NO_CIRCLE_CLASS} ${
              circleVisible
                ? 'border-black dark:border-neutral-500'
                : 'border-transparent'
            }`}
          >
            <motion.span
              ref={noTextRef}
              className={NO_TEXT_CLASS}
              initial={false}
              animate={{ opacity: isSettled || isRevealed ? 1 : 0 }}
              transition={{
                duration: NO_HANDOFF_DURATION,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              NO
            </motion.span>
          </span>

          {isRevealed ? (
            <motion.span
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.06, ease: REVEAL_EASE }}
              className={IDEA_SLOT_CLASS}
            >
              <span className="invisible" aria-hidden="true">
                {WORD_SLOT_PLACEHOLDER}
              </span>
              <span className="absolute left-0 top-1/2 -translate-y-1/2">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={activeWord}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32, ease: REVEAL_EASE }}
                    className="inline-block"
                    style={{ color: BRAND_ORANGE }}
                  >
                    {activeWord}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.span>
          ) : (
            <span className={`${IDEA_SLOT_CLASS} invisible select-none`} aria-hidden="true">
              {WORD_SLOT_PLACEHOLDER}
            </span>
          )}
        </div>

        {/* Title — single line when possible, smaller size */}
        <motion.h1
          initial={false}
          animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : 18 }}
          transition={{ delay: isRevealed ? 0.12 : 0, duration: 0.55, ease: REVEAL_EASE }}
          aria-hidden={!isRevealed}
          className={`mb-5 w-full text-center text-xl font-bold tracking-tight lp-text sm:mb-6 sm:text-2xl md:text-3xl lg:text-[2rem] xl:text-[2.25rem] xl:leading-tight ${
            !isRevealed ? 'pointer-events-none' : ''
          }`}
        >
          <span className="inline-block whitespace-normal text-balance sm:whitespace-nowrap">
            The absolute easiest way to build, showcase, and sell.
          </span>
        </motion.h1>

        {/* Gallery: title description · centered image + catalog · CTA */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: REVEAL_EASE }}
              className="pointer-events-auto w-full"
            >
              <HeroInteractiveGallery />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
