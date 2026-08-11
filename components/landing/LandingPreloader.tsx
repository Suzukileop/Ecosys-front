'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NO_TEXT_CLASS } from '@/components/landing/landingEntranceNo';
import { landingRoboto } from '@/components/landing/landingFont';
import { toEntranceRect, type EntranceAnchorRects } from '@/components/landing/landingEntranceTypes';

const MIN_LOAD_MS = 5000;
const FILL_COLOR = '#F97316';
const TRACK_LIGHT = '#e5e5e5';
const TRACK_DARK = '#2a2a2a';
const BAR_FADE_MS = 320;
const WORD_INTERVAL_MS = 1600;
/** Lock final brand phrase near end of load (not mid-cycle on a question). */
const FINAL_LOCK_AT = 82;

const PRELOAD_WORDS = ['CODE?', 'PORTFOLIO?', 'PROBLEM'] as const;
/** End-of-load label: reads “NO PROBLEM”. */
const FINAL_WORD = 'PROBLEM' as const;
/** Widest label — locks layout width while words swap. */
const PRELOAD_WORD_PLACEHOLDER = 'PORTFOLIO?';
type PreloadWord = (typeof PRELOAD_WORDS)[number] | typeof FINAL_WORD;

function isDarkMode() {
  if (typeof document === 'undefined') return true;
  return document.documentElement.classList.contains('dark');
}

function trackColor() {
  return isDarkMode() ? TRACK_DARK : TRACK_LIGHT;
}

function setBarProgress(el: HTMLDivElement, progress: number, track = trackColor()) {
  const p = Math.min(100, Math.max(0, progress));
  el.style.background = `linear-gradient(to right, ${FILL_COLOR} 0%, ${FILL_COLOR} ${p}%, ${track} ${p}%, ${track} 100%)`;
}

type LandingPreloaderProps = {
  onBarComplete: (rects: EntranceAnchorRects) => void;
};

export function LandingPreloader({ onBarComplete }: LandingPreloaderProps) {
  const [activeWord, setActiveWord] = useState<PreloadWord>(PRELOAD_WORDS[0]);
  const [barVisible, setBarVisible] = useState(true);
  const [blockWidth, setBlockWidth] = useState<number | null>(null);
  const finalLockedRef = useRef(false);

  const measureRef = useRef<HTMLSpanElement>(null);
  const noRef = useRef<HTMLSpanElement>(null);
  const problemeRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pageReadyRef = useRef(false);
  const progressRef = useRef(0);
  const completedRef = useRef(false);

  const measureBlock = () => {
    if (!measureRef.current) return;
    const w = measureRef.current.getBoundingClientRect().width;
    setBlockWidth(Math.round(w));
  };

  useLayoutEffect(() => {
    measureBlock();
    void document.fonts?.ready?.then(measureBlock);
  }, []);

  useEffect(() => {
    pageReadyRef.current = document.readyState === 'complete';
    if (!pageReadyRef.current) {
      const onLoad = () => {
        pageReadyRef.current = true;
      };
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  const triggerComplete = useCallback(() => {
    if (completedRef.current) return;
    if (!noRef.current || !problemeRef.current) return;
    completedRef.current = true;

    const rects = {
      no: toEntranceRect(noRef.current.getBoundingClientRect()),
      probleme: toEntranceRect(problemeRef.current.getBoundingClientRect()),
    };

    setBarVisible(false);
    window.setTimeout(() => onBarComplete(rects), BAR_FADE_MS);
  }, [onBarComplete]);

  useEffect(() => {
    const wordTimer = window.setInterval(() => {
      if (finalLockedRef.current) return;
      setActiveWord((prev) => {
        const i = PRELOAD_WORDS.indexOf(prev as (typeof PRELOAD_WORDS)[number]);
        const nextIndex = i < 0 ? 0 : (i + 1) % PRELOAD_WORDS.length;
        return PRELOAD_WORDS[nextIndex];
      });
    }, WORD_INTERVAL_MS);
    return () => window.clearInterval(wordTimer);
  }, []);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;

    const lockFinalPhrase = () => {
      if (finalLockedRef.current) return;
      finalLockedRef.current = true;
      setActiveWord(FINAL_WORD);
    };

    const tryComplete = () => {
      if (progressRef.current < 100 || !pageReadyRef.current || completedRef.current) return;
      lockFinalPhrase();
      // Paint “NO PROBLEM”, then hand off for the fly animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => triggerComplete());
      });
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const linear = Math.min(1, elapsed / MIN_LOAD_MS);
      const eased = 1 - (1 - linear) ** 2;
      const progress = eased * 100;
      progressRef.current = progress;

      // Settle on “NO PROBLEM” before the bar finishes
      if (progress >= FINAL_LOCK_AT) {
        lockFinalPhrase();
      }

      if (barRef.current) {
        setBarProgress(barRef.current, progress);
      }

      if (linear >= 1) {
        tryComplete();
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    if (barRef.current) {
      setBarProgress(barRef.current, 0);
    }

    frame = requestAnimationFrame(tick);

    const onLoad = () => {
      pageReadyRef.current = true;
      tryComplete();
    };
    if (!pageReadyRef.current) {
      window.addEventListener('load', onLoad);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('load', onLoad);
    };
  }, [triggerComplete]);

  const widthStyle =
    blockWidth != null
      ? { width: blockWidth, minWidth: blockWidth, maxWidth: blockWidth }
      : undefined;

  return (
    <div
      className={`${landingRoboto.className} fixed inset-0 z-[200] bg-white transition-colors duration-300 dark:bg-[#0a0a0a]`}
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute whitespace-nowrap leading-none"
      >
        <span className={NO_TEXT_CLASS}>NO</span>
        <span className="ml-3 inline-block font-medium uppercase tracking-tight text-[1.6rem] sm:text-[1.9rem]">
          {PRELOAD_WORD_PLACEHOLDER}
        </span>
      </span>

      <div
        className="absolute left-1/2 top-1/2 flex flex-col gap-10"
        style={{
          ...widthStyle,
          transform: 'translate3d(-50%, -50%, 0)',
        }}
      >
        <p className="m-0 flex items-baseline whitespace-nowrap leading-none">
          <span ref={noRef} className={NO_TEXT_CLASS}>
            NO
          </span>
          <span className="relative ml-3 inline-block align-baseline">
            <span
              className="invisible font-medium uppercase tracking-tight text-[1.6rem] sm:text-[1.9rem]"
              aria-hidden="true"
            >
              {PRELOAD_WORD_PLACEHOLDER}
            </span>
            <span className="absolute left-0 top-0">
              <span
                ref={problemeRef}
                className="inline-block font-medium uppercase tracking-tight text-[#F97316] text-[1.6rem] sm:text-[1.9rem]"
              >
                {activeWord}
              </span>
            </span>
          </span>
        </p>

        <motion.div
          ref={barRef}
          animate={{ opacity: barVisible ? 1 : 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="h-3 w-full shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={100}
        />
      </div>
    </div>
  );
}
