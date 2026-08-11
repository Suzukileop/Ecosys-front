'use client';

import { createContext, useContext } from 'react';
import type { EntranceAnchorRects, LandingEntrancePhase } from '@/components/landing/landingEntranceTypes';

type LandingEntranceContextValue = {
  phase: LandingEntrancePhase;
  problemeReady: boolean;
  startRects: EntranceAnchorRects | null;
  reportTargetRects: (rects: EntranceAnchorRects) => void;
};

const LandingEntranceContext = createContext<LandingEntranceContextValue>({
  phase: 'revealed',
  problemeReady: true,
  startRects: null,
  reportTargetRects: () => {},
});

export function LandingEntranceProvider({
  phase,
  problemeReady,
  startRects,
  reportTargetRects,
  children,
}: {
  phase: LandingEntrancePhase;
  problemeReady: boolean;
  startRects: EntranceAnchorRects | null;
  reportTargetRects: (rects: EntranceAnchorRects) => void;
  children: React.ReactNode;
}) {
  return (
    <LandingEntranceContext.Provider
      value={{ phase, problemeReady, startRects, reportTargetRects }}
    >
      {children}
    </LandingEntranceContext.Provider>
  );
}

export function useLandingEntrance() {
  return useContext(LandingEntranceContext);
}
