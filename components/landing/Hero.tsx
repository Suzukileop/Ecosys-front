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

import {
  BRAND_ORANGE,
  brandCtaInvertedClass,
  brandCtaOrangeClass,
  brandFrameRadiusClass,
} from '@/components/landing/landingBrand';
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
    title: 'Portfolio & services',
    description:
      'Turn your skills into a professional page. Present your work, list your services, and let clients reach you directly.',
  },
  {
    src: '/landing/hero/image1.png',
    alt: 'Graduate showcasing achievements',
    marketingTerm: 'Students',
    title: 'Student portfolio',
    description:
      'Highlight your projects, experience, and achievements in a clean portfolio ready to share with schools and employers.',
  },
  {
    src: '/landing/hero/image2.png',
    alt: 'Business team presenting their brand',
    marketingTerm: 'Businesses',
    title: 'Business presence',
    description:
      'Give your company a clear online identity. Showcase your brand, team, and offers in one professional space.',
  },
  {
    src: '/landing/hero/image3.png',
    alt: 'Seller managing an online shop',
    marketingTerm: 'Sellers',
    title: 'Online shop',
    description:
      'Launch a simple storefront, display your products, and talk to buyers without leaving the platform.',
  },
  {
    src: '/landing/hero/portrait-pro-freelan.png',
    alt: 'Freelancers collaborating in a professional workspace',
    marketingTerm: 'Freelancers',
    title: 'Service Provider',
    description:
      'Show your expertise, get discovered by clients, and run your freelance work from one professional profile.',
  },
] as const;

const GALLERY_ROTATE_MS = 4000;
const GALLERY_FADE = {
  duration: 0.65,
  ease: REVEAL_EASE,
} as const;

function GalleryArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10.5 3.5 6 8l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      className="mx-auto flex w-full max-w-[100rem] flex-col items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Large image · same size language as before · catalog hangs right, vertically centered */}
      <div className="relative flex w-full justify-center overflow-x-clip lg:overflow-x-visible">
        <div className="relative w-full min-w-0 max-w-none flex-1 lg:max-w-[min(100%,64rem)] xl:max-w-[70rem] 2xl:max-w-[76rem]">
          <div className={`relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 sm:aspect-[19/10] ${brandFrameRadiusClass}`}>
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
                  sizes="(max-width: 1024px) 100vw, 76rem"
                  priority={selectedIndex === 0}
                  loading={selectedIndex === 0 ? 'eager' : 'lazy'}
                  fetchPriority={selectedIndex === 0 ? 'high' : 'auto'}
                />
              </motion.div>
            </AnimatePresence>

            {/* Left edge only — ~22% of the photo, rest stays untouched */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[34%] bg-gradient-to-r from-black/50 to-transparent"
              aria-hidden
            />

            {/* Role title — top left */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.h3
                key={`${active.marketingTerm}-title`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: REVEAL_EASE }}
                className="absolute left-4 top-4 z-10 max-w-[min(100%,18rem)] text-lg font-bold leading-snug text-white sm:left-5 sm:top-5 sm:max-w-[20rem] sm:text-xl md:left-6 md:top-6 md:text-2xl lg:text-[1.75rem] [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]"
              >
                {active.title}
              </motion.h3>
            </AnimatePresence>

            {/* Description + CTA — bottom left inside image (tablet / desktop) */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${active.marketingTerm}-bottom`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.35, ease: REVEAL_EASE }}
                className="absolute bottom-7 left-4 z-10 hidden w-[min(100%,18rem)] flex-col items-start gap-4 sm:bottom-8 sm:left-5 sm:flex sm:w-[min(100%,20.5rem)] sm:gap-5 md:bottom-9 md:left-6 md:w-[22rem] lg:w-[24rem]"
              >
                <p className="text-base leading-snug text-white sm:text-lg sm:leading-snug md:text-xl md:leading-snug [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]">
                  {active.description}
                </p>
                <Link
                  href="/register"
                  className={`inline-flex items-center justify-center px-7 py-2.5 text-sm font-semibold sm:px-8 sm:py-3 sm:text-base ${brandCtaInvertedClass}`}
                >
                  Start for free
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Description + CTA — outside image on mobile */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${active.marketingTerm}-mobile-copy`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.35, ease: REVEAL_EASE }}
              className="mt-5 flex w-full flex-col items-start gap-4 sm:hidden"
            >
              <p className="text-base leading-snug text-zinc-600 dark:text-zinc-400">
                {active.description}
              </p>
              <Link
                href="/register"
                className={`inline-flex items-center justify-center px-7 py-2.5 text-sm font-semibold ${brandCtaOrangeClass}`}
              >
                Start for free
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Catalog — right of image, vertically centered to image */}
          <div
            className="mt-6 flex w-full justify-center lg:absolute lg:left-full lg:top-1/2 lg:mt-0 lg:ml-6 lg:w-auto lg:-translate-y-1/2 xl:ml-8 2xl:ml-10"
            role="tablist"
            aria-label="Target personas"
          >
            <div className="flex flex-row flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:gap-x-6 lg:flex-col lg:items-start lg:gap-5 xl:gap-6">
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
                    className={`group flex items-center gap-2 text-left transition-colors duration-300 sm:gap-2.5 ${
                      isActive
                        ? 'text-[#F97316] lg:text-zinc-900 lg:dark:text-white'
                        : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                    }`}
                  >
                    <GalleryArrowIcon
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 sm:h-5 sm:w-5 ${
                        isActive ? '-translate-x-0.5' : 'opacity-50 group-hover:opacity-80'
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold tracking-wide sm:text-base md:text-lg ${
                        isActive
                          ? 'underline decoration-[#F97316]/50 underline-offset-4 lg:decoration-zinc-900/50 lg:dark:decoration-white/50'
                          : ''
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
      </div>
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
