import { landingRoboto } from '@/components/landing/landingFont';

/** @deprecated Use landingRoboto — kept for entrance animation imports */
export const landingGrotesk = landingRoboto;

export const NO_TEXT_CLASS =
  'inline-block font-black uppercase leading-none tracking-[-0.03em] text-black dark:text-white text-2xl sm:text-4xl';

export const HERO_PROBLEME_CLASS =
  'inline-block font-black lowercase leading-none tracking-[-0.03em] text-2xl sm:text-3xl';

export const NO_CIRCLE_CLASS =
  'flex shrink-0 items-center justify-center rounded-full border-2 h-[4.5rem] w-[4.5rem] sm:h-[5.5rem] sm:w-[5.5rem] md:h-24 md:w-24';

export const IDEA_SLOT_CLASS =
  'relative inline-block align-middle text-[2.35rem] font-black uppercase leading-none tracking-tight sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem]';

export const NO_FLY_EASE = [0.16, 1, 0.3, 1] as const;
/** Snappier handoff so the NO doesn’t linger mid-viewport */
export const NO_FLY_DURATION = 0.95;
export const PROBLEME_FLY_DURATION = 0.85;
export const NO_HANDOFF_DURATION = 0.35;
export const PROBLEME_HANDOFF_DURATION = 0.3;
