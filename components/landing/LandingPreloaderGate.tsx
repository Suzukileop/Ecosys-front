'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { LandingEntranceFly } from '@/components/landing/LandingEntranceFly';
import { LandingEntranceProvider } from '@/components/landing/LandingEntranceContext';
import { LandingPreloader } from '@/components/landing/LandingPreloader';
import { landingRoboto } from '@/components/landing/landingFont';
import { NO_FLY_DURATION, NO_HANDOFF_DURATION } from '@/components/landing/landingEntranceNo';
import type { EntranceAnchorRects, LandingEntrancePhase } from '@/components/landing/landingEntranceTypes';

const SETTLED_TO_REVEAL_MS = 580;
const FLYING_FALLBACK_MS = Math.ceil((NO_FLY_DURATION + NO_HANDOFF_DURATION) * 1000) + 400;

export function LandingPreloaderGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<LandingEntrancePhase>('loading');
  const [startRects, setStartRects] = useState<EntranceAnchorRects | null>(null);
  const [endRects, setEndRects] = useState<EntranceAnchorRects | null>(null);
  const [flyMounted, setFlyMounted] = useState(false);
  const [handoffDone, setHandoffDone] = useState(false);
  const [problemeReady, setProblemeReady] = useState(false);

  const handleBarComplete = useCallback((rects: EntranceAnchorRects) => {
    setStartRects(rects);
    setEndRects(null);
    setHandoffDone(false);
    setProblemeReady(false);
    setFlyMounted(true);
    setPhase('flying');
  }, []);

  const reportTargetRects = useCallback((rects: EntranceAnchorRects) => {
    setEndRects(rects);
  }, []);

  const handleProblemeLanded = useCallback(() => {
    setProblemeReady(true);
  }, []);

  const handleNoLanded = useCallback(() => {
    setPhase('settled');
  }, []);

  const handleHandoffComplete = useCallback(() => {
    setFlyMounted(false);
    setHandoffDone(true);
  }, []);

  useEffect(() => {
    if (phase === 'flying') {
      const timer = window.setTimeout(() => {
        setPhase('settled');
        setFlyMounted(false);
        setHandoffDone(true);
        setProblemeReady(true);
      }, FLYING_FALLBACK_MS);
      return () => window.clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'settled' && handoffDone) {
      const timer = window.setTimeout(() => setPhase('revealed'), SETTLED_TO_REVEAL_MS);
      return () => window.clearTimeout(timer);
    }
  }, [phase, handoffDone]);

  useEffect(() => {
    if (phase !== 'revealed') {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.scrollbarGutter = 'stable';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = '';
        document.documentElement.style.scrollbarGutter = '';
        document.body.style.overflow = '';
      };
    }
    document.documentElement.style.overflow = '';
    document.documentElement.style.scrollbarGutter = '';
    document.body.style.overflow = '';
  }, [phase]);

  return (
    <div className={`lp-roboto-zone ${landingRoboto.variable} ${landingRoboto.className}`}>
      {phase !== 'loading' && (
        <LandingEntranceProvider
          phase={phase}
          problemeReady={problemeReady}
          startRects={startRects}
          reportTargetRects={reportTargetRects}
        >
          {children}
        </LandingEntranceProvider>
      )}

      {phase === 'loading' && <LandingPreloader onBarComplete={handleBarComplete} />}

      {phase === 'flying' && (
        <div
          className={`pointer-events-none fixed inset-0 z-[200] bg-white transition-opacity duration-300 ease-out dark:bg-[#0a0a0a] ${
            endRects ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
        />
      )}

      {flyMounted && startRects && (
        <LandingEntranceFly
          startRects={startRects}
          endRects={endRects}
          onNoLanded={handleNoLanded}
          onProblemeLanded={handleProblemeLanded}
          onHandoffComplete={handleHandoffComplete}
        />
      )}
    </div>
  );
}
