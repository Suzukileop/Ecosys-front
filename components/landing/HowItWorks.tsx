'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { brandCtaClass, brandFrameRadiusClass, brandGradientBg, brandGradientText, brandSolidBg } from '@/components/landing/landingBrand';

const ORANGE = '#F97316';
const ORANGE_RGB = '249,115,22';
const STEP_COUNT = 4;
const AUTO_MS = 2500;
const TRANSITION = { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const };

type Slot = 'center' | 'left' | 'right' | 'back';

type SlotLayout = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotateX: number;
  rotateY: number;
  opacity: number;
  zIndex: number;
  blur: number;
};

/** Cartes latérales côte à côte du centre, légère courbure cylindrique */
const SIDE_ROTATE_Y = 26;

function getSlotLayouts(spacing: number): Record<Slot, SlotLayout> {
  return {
    center: {
      x: 0,
      y: 20,
      z: 130,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      opacity: 1,
      zIndex: 40,
      blur: 0,
    },
    right: {
      x: spacing,
      y: -14,
      z: -95,
      scale: 0.86,
      rotateX: 6,
      rotateY: SIDE_ROTATE_Y,
      opacity: 0.74,
      zIndex: 15,
      blur: 0.3,
    },
    left: {
      x: -spacing,
      y: -14,
      z: -95,
      scale: 0.86,
      rotateX: 6,
      rotateY: -SIDE_ROTATE_Y,
      opacity: 0.74,
      zIndex: 15,
      blur: 0.3,
    },
    back: {
      x: 0,
      y: -36,
      z: -260,
      scale: 0.48,
      rotateX: 0,
      rotateY: 180,
      opacity: 0,
      zIndex: 0,
      blur: 2,
    },
  };
}

function slotForCard(cardIndex: number, activeIndex: number): Slot {
  const offset = (cardIndex - activeIndex + STEP_COUNT) % STEP_COUNT;
  if (offset === 0) return 'center';
  if (offset === 1) return 'right';
  if (offset === STEP_COUNT - 1) return 'left';
  return 'back';
}

const steps = [
  {
    number: '01',
    title: 'Submit a viral video',
    description:
      'Upload a file or paste a TikTok, Instagram, or YouTube URL. Our AI takes over instantly.',
    illustration: (
      <div className={`border border-black/5 bg-neutral-50 p-3 dark:border-white/5 dark:bg-neutral-900 ${brandFrameRadiusClass}`}>
        <div className="mb-2 flex gap-2">
          <span className="rounded-md border border-[#F97316]/30 bg-[#F97316]/10 px-2.5 py-1 text-xs font-semibold text-[#F97316]">
            Upload
          </span>
          <span className="rounded-md border border-black/10 px-2.5 py-1 text-xs font-medium lp-muted dark:border-white/10">
            Paste URL
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 dark:bg-white/5">
          <span className="text-xs lp-muted">https://tiktok.com/...</span>
          <div className={`ml-auto rounded-md px-3 py-1 text-xs font-semibold text-white ${brandSolidBg}`}>
            Analyze
          </div>
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'Frame-by-frame video analysis',
    description:
      'Multiple dimensions analyzed per sequence: hooks, transitions, pacing, text, emotion, color, structure.',
    illustration: (
      <div className={`border border-black/5 bg-neutral-50 p-3 dark:border-white/5 dark:bg-neutral-900 ${brandFrameRadiusClass}`}>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-2 py-0.5 text-xs font-bold text-[#F97316]">
            AI
          </span>
          <span className="text-xs lp-muted">Analysis in progress...</span>
        </div>
        <div className="flex gap-1">
          {['S1', 'S2', 'S3', 'S4', 'S5'].map((s, i) => (
            <div key={s} className="flex-1 text-center">
              <div
                className="flex h-8 items-center justify-center rounded-md text-xs font-medium text-white"
                style={{ background: `rgba(${ORANGE_RGB},${0.25 + i * 0.12})` }}
              >
                {s}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Generate multiple variants',
    description:
      'From analyzed dimensions: backgrounds, text, transitions, reusable audio URLs, and transition cues for every sequence.',
    illustration: (
      <div className={`border border-black/5 bg-neutral-50 p-3 dark:border-white/5 dark:bg-neutral-900 ${brandFrameRadiusClass}`}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { label: 'Background', tone: 0.35 },
            { label: 'Text', tone: 0.45 },
            { label: 'Transition', tone: 0.55 },
            { label: 'Audio', tone: 0.65 },
            { label: 'Seq. 1→2', tone: 0.75 },
            { label: 'Seq. 2→3', tone: 0.85 },
          ].map((item) => (
            <div
              key={item.label}
              className="flex h-10 items-center justify-center rounded-lg border text-[10px] font-medium sm:text-xs"
              style={{
                background: `rgba(${ORANGE_RGB},${item.tone * 0.18})`,
                borderColor: `rgba(${ORANGE_RGB},${item.tone * 0.35})`,
                color: item.tone > 0.6 ? '#fff' : ORANGE,
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '04',
    title: 'Edit with the editor',
    description:
      'Intuitive timeline, layers, transitions, and effects. Export directly to TikTok, Instagram, or YouTube.',
    illustration: (
      <div className={`border border-black/5 bg-neutral-50 p-3 dark:border-white/5 dark:bg-neutral-900 ${brandFrameRadiusClass}`}>
        <div className="space-y-1.5">
          {['Video', 'Audio', 'Text'].map((track, i) => (
            <div key={track} className="flex items-center gap-2">
              <span className="w-10 shrink-0 text-xs lp-muted">{track}</span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
                <div
                  className="absolute inset-y-0 left-0 rounded-md"
                  style={{
                    width: `${70 - i * 15}%`,
                    background: `linear-gradient(90deg, rgba(${ORANGE_RGB},${0.55 - i * 0.1}), rgba(${ORANGE_RGB},${0.25 - i * 0.05}))`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-medium lp-text shadow-sm transition-all hover:border-[#F97316]/40 hover:text-[#F97316] dark:border-white/10 dark:bg-neutral-900 dark:hover:border-[#F97316]/50"
    >
      {children}
    </button>
  );
}

function StepCarouselCard({
  step,
  cardIndex,
  activeIndex,
  reducedMotion,
  sideX,
  onSelect,
}: {
  step: (typeof steps)[number];
  cardIndex: number;
  activeIndex: number;
  reducedMotion: boolean;
  sideX: number;
  onSelect: (index: number) => void;
}) {
  const slot = slotForCard(cardIndex, activeIndex);
  const layout = getSlotLayouts(sideX)[slot];
  const isCenter = slot === 'center';
  const isSide = slot === 'left' || slot === 'right';
  const isVisible = slot !== 'back';

  return (
    <motion.div
      className="absolute left-1/2 top-[42%] w-[15.5rem] sm:w-[19rem] md:w-[21rem]"
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin:
          slot === 'left' ? 'right center' : slot === 'right' ? 'left center' : 'center center',
        zIndex: layout.zIndex,
        pointerEvents: slot === 'back' ? 'none' : 'auto',
      }}
      initial={false}
      animate={{
        x: `calc(-50% + ${layout.x}px)`,
        y: `calc(-50% + ${layout.y}px)`,
        z: layout.z,
        scale: layout.scale,
        rotateX: layout.rotateX,
        rotateY: layout.rotateY,
        opacity: layout.opacity,
        filter: `blur(${layout.blur}px)`,
      }}
      transition={reducedMotion ? { duration: 0 } : TRANSITION}
      onClick={() => {
        if (!isCenter) onSelect(cardIndex);
      }}
    >
      <div
        className={`relative border bg-white p-5 transition-shadow dark:bg-neutral-900 sm:p-6 ${brandFrameRadiusClass} ${
          isCenter
            ? 'border-[#F97316]/30 shadow-[0_28px_70px_rgba(249,115,22,0.22)] dark:border-[#F97316]/40'
            : isSide
              ? 'border-neutral-200/90 bg-neutral-50/95 shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:border-neutral-700/80 dark:bg-neutral-900/90 dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)]'
              : 'border-black/8 dark:border-white/8'
        } ${!isCenter && isVisible ? 'cursor-pointer' : ''}`}
        style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
      >
        {isSide && (
          <>
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-white/55 via-transparent to-neutral-200/25 dark:from-white/6 dark:to-neutral-800/35 ${brandFrameRadiusClass}`}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-3 w-4 rounded-full bg-gradient-to-r from-neutral-300/25 to-transparent dark:from-neutral-600/20"
              style={slot === 'left' ? { right: 0 } : { left: 0, transform: 'scaleX(-1)' }}
              aria-hidden="true"
            />
          </>
        )}
        <div className={`mb-3 flex items-center gap-3 ${isSide ? 'gap-2' : ''}`}>
          <span
            className={`flex shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              isCenter
                ? 'h-10 w-10 border-2 border-[#F97316]/40 bg-[#F97316]/10 text-[#F97316]'
                : isSide
                  ? 'h-8 w-8 border border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800'
                  : 'h-10 w-10 border border-neutral-200 bg-neutral-50 text-neutral-500'
            }`}
          >
            {step.number}
          </span>
          <h3
            className={`font-bold leading-snug ${
              isCenter ? 'text-base sm:text-lg lp-text' : isSide ? 'text-sm lp-muted' : 'text-base lp-text'
            }`}
          >
            {step.title}
          </h3>
        </div>

        {isVisible && (
          <div className={`relative ${isSide ? 'pointer-events-none' : ''}`}>
            <p className={`mb-4 leading-relaxed lp-muted ${isSide ? 'text-xs' : 'text-sm'}`}>
              {step.description}
            </p>
            {step.illustration}
          </div>
        )}
      </div>
    </motion.div>
  );
}

type HowItWorksProps = {
  /** Layout for 100dvh horizontal snap panel (Features → HowItWorks bridge). */
  snapViewport?: boolean;
};

export function HowItWorks({ snapViewport = false }: HowItWorksProps) {
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sideSpacing, setSideSpacing] = useState(340);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  pausedRef.current = paused;

  useEffect(() => {
    const updateSpacing = () => {
      const w = window.innerWidth;
      if (w < 480) setSideSpacing(218);
      else if (w < 640) setSideSpacing(262);
      else if (w < 768) setSideSpacing(302);
      else if (w < 1024) setSideSpacing(342);
      else if (w < 1280) setSideSpacing(368);
      else setSideSpacing(388);
    };

    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % STEP_COUNT);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + STEP_COUNT) % STEP_COUNT);
  }, []);

  const goTo = useCallback((index: number) => {
    setActiveIndex(((index % STEP_COUNT) + STEP_COUNT) % STEP_COUNT);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    timerRef.current = setInterval(() => {
      if (!pausedRef.current) goNext();
    }, AUTO_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, goNext]);

  return (
    <section
      id="how-it-works"
      className={`lp-bg w-full transition-colors duration-300 ${
        snapViewport
          ? 'flex h-full min-h-full flex-col overflow-hidden pb-5 pt-20 sm:pb-6 sm:pt-24'
          : 'py-24 lg:py-32'
      }`}
    >
      <div className={`lp-container-x mx-auto w-full max-w-6xl ${snapViewport ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`shrink-0 text-center ${snapViewport ? 'mb-3 sm:mb-4' : 'mb-4 lg:mb-6'}`}
        >
          <h2
            className={`mb-3 font-bold leading-tight tracking-tight lp-text sm:mb-4 ${
              snapViewport ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl'
            }`}
          >
            From viral video to template
            <br />
            <span className={brandGradientText}>in 4 steps</span>
          </h2>
          <p className={`lp-muted ${snapViewport ? 'text-sm md:text-base' : 'text-lg'}`}>
            Our AI handles 95% of the work.
          </p>
        </motion.div>

        <div
          className={`relative mx-auto w-full max-w-[100vw] overflow-visible px-3 sm:px-6 ${
            snapViewport ? 'flex min-h-0 flex-1 flex-col' : '-mt-2'
          }`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className={`relative mx-auto w-full overflow-visible ${
              snapViewport
                ? 'min-h-0 flex-1'
                : 'h-[min(62vh,32rem)] max-h-[32rem] min-h-[22rem]'
            }`}
            style={{ perspective: '1800px', perspectiveOrigin: '50% 40%' }}
          >
            <div
              className="absolute inset-0 overflow-visible"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {steps.map((step, i) => (
                <StepCarouselCard
                  key={step.number}
                  step={step}
                  cardIndex={i}
                  activeIndex={activeIndex}
                  reducedMotion={!!reducedMotion}
                  sideX={sideSpacing}
                  onSelect={goTo}
                />
              ))}
            </div>
          </div>

          <div
            className={`flex shrink-0 flex-col items-center gap-3 ${
              snapViewport ? 'mt-2 pb-1 sm:mt-3' : 'mt-1'
            }`}
          >
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <NavButton label="Previous step" onClick={goPrev}>
                ‹
              </NavButton>

              <div className="flex items-center gap-2" role="tablist" aria-label="Process steps">
                {steps.map((step, i) => (
                  <button
                    key={step.number}
                    type="button"
                    role="tab"
                    aria-selected={activeIndex === i}
                    aria-label={`Step ${step.number}`}
                    onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeIndex === i ? `w-8 ${brandGradientBg}` : 'w-2 bg-neutral-300 dark:bg-neutral-600'
                    }`}
                  />
                ))}
              </div>

              <NavButton label="Next step" onClick={goNext}>
                ›
              </NavButton>
            </div>

            <Link
              href="/register"
              className={`inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold ${brandCtaClass}`}
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
