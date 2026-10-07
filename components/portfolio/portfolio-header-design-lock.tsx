'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Whether the portfolio's global "Animations" switch is on (Settings → Global → Animations).
 * Provided once by the settings modal; defaults to `true` so a panel mounted outside it is never
 * locked by accident.
 */
const PortfolioGlobalMotionContext = createContext(true);

export const PortfolioGlobalMotionProvider = PortfolioGlobalMotionContext.Provider;

export function useGlobalMotionEnabled(): boolean {
  return useContext(PortfolioGlobalMotionContext);
}

/**
 * Wraps one card of a Header design picker. The Marquee design is a kinetic band that only makes
 * sense in motion, so while the global Animations switch is off its card is dimmed, not
 * focusable or clickable, and says why. Every other design passes straight through.
 */
export function PortfolioHeaderDesignOption({ design, children }: { design: string; children: ReactNode }) {
  const motionEnabled = useGlobalMotionEnabled();
  if (design !== 'marquee' || motionEnabled) return <>{children}</>;

  return (
    <div className="relative" title="Turn on Animations in Global settings to use Marquee">
      <div inert aria-disabled="true" className="pointer-events-none select-none opacity-40 grayscale">
        {children}
      </div>
      <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-full bg-neutral-900 px-2 py-1 text-[10px] font-semibold uppercase leading-none tracking-wide text-white ring-1 ring-white/15">
        Animations off
      </span>
    </div>
  );
}
