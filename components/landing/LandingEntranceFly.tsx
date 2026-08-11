'use client';

import { motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  HERO_PROBLEME_CLASS,
  NO_FLY_DURATION,
  NO_FLY_EASE,
  NO_HANDOFF_DURATION,
  NO_TEXT_CLASS,
  PROBLEME_FLY_DURATION,
  PROBLEME_HANDOFF_DURATION,
} from '@/components/landing/landingEntranceNo';
import { landingRoboto } from '@/components/landing/landingFont';
import type { EntranceAnchorRects } from '@/components/landing/landingEntranceTypes';
import { boxMotionStyle } from '@/components/landing/landingEntranceTypes';

type LandingEntranceFlyProps = {
  startRects: EntranceAnchorRects;
  endRects: EntranceAnchorRects | null;
  onNoLanded: () => void;
  onProblemeLanded: () => void;
  onHandoffComplete: () => void;
};

/**
 * Continuous handoff: fly NO/problem from preloader rects straight to hero rects.
 * Starts as soon as hero measures targets — no deliberate mid-screen hold.
 */
export function LandingEntranceFly({
  startRects,
  endRects,
  onNoLanded,
  onProblemeLanded,
  onHandoffComplete,
}: LandingEntranceFlyProps) {
  const noLandedRef = useRef(false);
  const problemeLandedRef = useRef(false);
  const handoffRef = useRef(false);
  const [noHandoff, setNoHandoff] = useState(false);
  const [problemeHandoff, setProblemeHandoff] = useState(false);
  const [problemeDone, setProblemeDone] = useState(false);

  const ready = Boolean(endRects);

  useLayoutEffect(() => {
    if (!ready || noLandedRef.current) return;

    const noTimer = window.setTimeout(() => {
      if (noLandedRef.current) return;
      noLandedRef.current = true;
      setNoHandoff(true);
      onNoLanded();
    }, NO_FLY_DURATION * 1000);

    const problemeTimer = window.setTimeout(() => {
      if (problemeLandedRef.current) return;
      problemeLandedRef.current = true;
      setProblemeHandoff(true);
      onProblemeLanded();
      window.setTimeout(() => setProblemeDone(true), PROBLEME_HANDOFF_DURATION * 1000);
    }, PROBLEME_FLY_DURATION * 1000);

    return () => {
      window.clearTimeout(noTimer);
      window.clearTimeout(problemeTimer);
    };
  }, [ready, onNoLanded, onProblemeLanded]);

  useEffect(() => {
    if (!noHandoff || handoffRef.current) return;
    const timer = window.setTimeout(() => {
      if (handoffRef.current) return;
      handoffRef.current = true;
      onHandoffComplete();
    }, NO_HANDOFF_DURATION * 1000);
    return () => window.clearTimeout(timer);
  }, [noHandoff, onHandoffComplete]);

  const noStart = boxMotionStyle(startRects.no);
  const noEnd = endRects ? boxMotionStyle(endRects.no) : noStart;
  const problemeStart = boxMotionStyle(startRects.probleme);
  const problemeEnd = endRects ? boxMotionStyle(endRects.probleme) : problemeStart;

  return (
    <div
      className={`${landingRoboto.className} pointer-events-none fixed inset-0 z-[260] [--lp-entrance-probleme-land:#a3a3a3] dark:[--lp-entrance-probleme-land:#525252]`}
      aria-hidden="true"
    >
      <motion.div
        className="fixed z-[262] flex items-center justify-center will-change-transform"
        initial={noStart}
        animate={{
          ...noEnd,
          opacity: noHandoff ? 0 : 1,
        }}
        transition={{
          left: { duration: ready ? NO_FLY_DURATION : 0, ease: NO_FLY_EASE },
          top: { duration: ready ? NO_FLY_DURATION : 0, ease: NO_FLY_EASE },
          width: { duration: ready ? NO_FLY_DURATION : 0, ease: NO_FLY_EASE },
          height: { duration: ready ? NO_FLY_DURATION : 0, ease: NO_FLY_EASE },
          opacity: { duration: NO_HANDOFF_DURATION, ease: [0.4, 0, 0.2, 1] },
        }}
      >
        <span className={NO_TEXT_CLASS}>NO</span>
      </motion.div>

      {!problemeDone && (
        <motion.div
          className="fixed z-[261] flex items-center justify-center will-change-transform"
          initial={problemeStart}
          animate={{
            ...problemeEnd,
            opacity: problemeHandoff ? 0 : 1,
            color: ready ? 'var(--lp-entrance-probleme-land)' : '#F97316',
          }}
          transition={{
            left: { duration: ready ? PROBLEME_FLY_DURATION : 0, ease: NO_FLY_EASE },
            top: { duration: ready ? PROBLEME_FLY_DURATION : 0, ease: NO_FLY_EASE },
            width: { duration: ready ? PROBLEME_FLY_DURATION : 0, ease: NO_FLY_EASE },
            height: { duration: ready ? PROBLEME_FLY_DURATION : 0, ease: NO_FLY_EASE },
            color: { duration: ready ? PROBLEME_FLY_DURATION : 0, ease: NO_FLY_EASE },
            opacity: { duration: PROBLEME_HANDOFF_DURATION, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          <span className={HERO_PROBLEME_CLASS}>problem</span>
        </motion.div>
      )}
    </div>
  );
}
