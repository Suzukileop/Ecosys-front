import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** Shared by every premium Contact design's own motion effect. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Plays `play()` the moment `trigger` is actually visible, via WHICHEVER mechanism notices
 * first: GSAP's ScrollTrigger (the polished, precisely-timed path) or a plain
 * IntersectionObserver running independently alongside it as a guaranteed backstop.
 *
 * ScrollTrigger alone isn't reliable enough for a one-shot "reveal on enter": on a long,
 * image-heavy page a trigger position calculated before layout above it fully settles
 * (fonts/images still loading) can end up stale, and a one-shot "enter" edge that's never
 * crossed at the (wrong) calculated pixel leaves content stuck permanently hidden with
 * nothing left to re-trigger it — confirmed live in Contact's "Sequential reveal" design
 * (the word "CONTACT" stayed invisible while its own "©" and the tagline showed fine, since
 * only the char spans were gated this way that time). The IntersectionObserver doesn't
 * depend on any of ScrollTrigger's position math, only the element's real rendered bounding
 * box vs. the viewport, so it can't drift stale the same way — it's the backstop, not a
 * replacement for the polished ScrollTrigger timing.
 *
 * `startPercent` matches ScrollTrigger's own `'top N%'` convention; the IntersectionObserver's
 * `rootMargin` is derived from the same number so both mechanisms fire at roughly the same
 * scroll position, whichever notices first — not the instant any pixel appears.
 */
export function revealOnceVisible(
  observers: IntersectionObserver[],
  trigger: HTMLElement,
  startPercent: number,
  play: () => void
): void {
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    play();
  };
  ScrollTrigger.create({ trigger, start: `top ${startPercent}%`, once: true, onEnter: fire });
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        fire();
        io.disconnect();
      }
    },
    { threshold: 0, rootMargin: `0px 0px -${100 - startPercent}% 0px` }
  );
  io.observe(trigger);
  observers.push(io);
}

/**
 * Runs `setup(observers)` inside a `gsap.context()`, contained in try/catch — an uncaught
 * GSAP/ScrollTrigger init error (observed once as a genuine GSAP-internal edge case, see
 * portfolio-header-mechanism-rollout) would otherwise crash the whole React tree, not just
 * this section. On error, reverts whatever partially initialized and clears inline styles
 * on `failSafeSelector` so the section falls back to its plain, fully visible, non-animated
 * state instead of staying stuck mid-animation. Returns a cleanup function.
 */
export function runContactDesignMotion(
  root: HTMLElement,
  label: string,
  setup: (observers: IntersectionObserver[]) => void,
  failSafeSelector?: string
): () => void {
  const observers: IntersectionObserver[] = [];
  let ctx: gsap.Context | undefined;
  try {
    ctx = gsap.context(() => setup(observers), root);
  } catch (error) {
    console.error(`[${label}] GSAP failed to initialize`, error);
    ctx?.revert();
    if (failSafeSelector) {
      gsap.set(root.querySelectorAll(failSafeSelector), { clearProps: 'all' });
    }
  }

  const refreshId = window.setTimeout(() => {
    try {
      ScrollTrigger.refresh();
    } catch (error) {
      console.error(`[${label}] deferred ScrollTrigger.refresh() failed`, error);
    }
  }, 80);

  return () => {
    window.clearTimeout(refreshId);
    observers.forEach((io) => io.disconnect());
    ctx?.revert();
  };
}

export type ContactLightDarkTokens = {
  isLight: boolean;
  bg: string;
  ink: string;
  muted: string;
  faint: string;
  border: string;
  placeholderBg: string;
};

/** The one shared light/dark recipe every premium Contact design in this family uses —
 *  pure white/black canvas, synced text tones. Driven by settings.global.colorMode (see
 *  contact-studio-overlap-design memory for why this, not prefers-color-scheme or a CSS
 *  `.dark` class, is the correct mechanism in this codebase). */
export function contactLightDarkTokens(colorMode: 'light' | 'dark'): ContactLightDarkTokens {
  const isLight = colorMode === 'light';
  return {
    isLight,
    bg: isLight ? '#ffffff' : '#000000',
    ink: isLight ? '#0a0a0a' : '#ffffff',
    muted: isLight ? '#8f8f8f' : '#7d7d7d',
    faint: isLight ? 'rgba(10,10,10,0.35)' : 'rgba(255,255,255,0.35)',
    border: isLight ? 'rgba(10,10,10,0.12)' : 'rgba(255,255,255,0.14)',
    placeholderBg: isLight ? '#ececec' : '#141414',
  };
}

export function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}
