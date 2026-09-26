'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
}

/** Every Team design's motion respects the OS setting, regardless of any local toggle. */
export function teamPrefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let premiumEaseName: string | undefined;

/**
 * The family's single curve, `cubic-bezier(0.16, 1, 0.3, 1)`, registered with GSAP so the
 * JS-driven motion and the CSS transitions decelerate on exactly the same easing instead of two
 * lookalike curves. Resolved lazily: `CustomEase.create` needs the browser, and a module-scope
 * call would run during SSR. Falls back to the nearest built-in if registration ever fails.
 */
export function teamPremiumEase(): string {
  if (typeof window === 'undefined') return 'power3.out';
  if (!premiumEaseName) {
    try {
      CustomEase.create('teamPremium', 'M0,0 C0.16,1 0.3,1 1,1');
      premiumEaseName = 'teamPremium';
    } catch (error) {
      console.error('[Team motion] CustomEase registration failed', error);
      premiumEaseName = 'power3.out';
    }
  }
  return premiumEaseName;
}

const SWIPE_TRIGGER_PX = 46;
const SWIPE_AXIS_LOCK_PX = 8;

/**
 * Native (non-passive) touch listeners so a confirmed horizontal drag can call `preventDefault`
 * and stay a swipe instead of also scrolling the page underneath it — React's synthetic touch
 * handlers are passive and cannot. The axis locks within the first few pixels, so a vertical
 * scroll started inside the element is never hijacked. Same recipe as the Work showcase's own
 * mobile swipe (portfolio-work-projects-showcase-mobile-redesign).
 */
export function useTeamSwipe(
  elRef: RefObject<HTMLElement | null>,
  onSwipe: (direction: 1 | -1) => void,
  disabled: boolean
): void {
  const onSwipeRef = useRef(onSwipe);
  useLayoutEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    const el = elRef.current;
    if (!el || disabled) return undefined;

    let startX = 0;
    let startY = 0;
    let axis: 'x' | 'y' | null = null;

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      axis = null;
    };

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) < SWIPE_AXIS_LOCK_PX && Math.abs(dy) < SWIPE_AXIS_LOCK_PX) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (axis === 'x' && event.cancelable) event.preventDefault();
    };

    const onEnd = (event: TouchEvent) => {
      const wasHorizontal = axis === 'x';
      const touch = event.changedTouches[0];
      axis = null;
      if (!wasHorizontal || !touch) return;
      const dx = touch.clientX - startX;
      if (Math.abs(dx) < SWIPE_TRIGGER_PX) return;
      onSwipeRef.current(dx < 0 ? 1 : -1);
    };

    const onCancel = () => {
      axis = null;
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onCancel);
    };
  }, [elRef, disabled]);
}

/**
 * Plays `play()` as soon as `trigger` is genuinely visible, through whichever mechanism notices
 * first: ScrollTrigger (precise, polished timing) or a plain IntersectionObserver running
 * alongside as a backstop. Same recipe as the Contact/Footer design families — ScrollTrigger
 * alone can compute a stale start position on an image-heavy page and then never cross its
 * one-shot "enter" edge, which would leave the whole team grid permanently invisible.
 */
export function revealTeamOnceVisible(
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
    { threshold: 0, rootMargin: `0px 0px -${Math.max(0, 100 - startPercent)}% 0px` }
  );
  io.observe(trigger);
  observers.push(io);
}

/**
 * The properties this family's motion ever writes inline. Always clear by name, never with
 * `clearProps: 'all'` — "all" empties the whole inline style attribute, which here would take the
 * card background and border colors React rendered from the palette with it.
 */
export const TEAM_CLEAR_PROPS = 'opacity,visibility,transform,clipPath';

/**
 * Runs `setup(observers)` inside a `gsap.context()`, wrapped in try/catch — an uncaught GSAP
 * init error would otherwise blank the whole React tree instead of just this section. On error
 * the context is reverted and the motion properties are cleared off `failSafeSelector`, so the
 * team grid degrades to its plain, fully visible, non-animated state. Returns a cleanup function.
 */
export function runTeamDesignMotion(
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
      gsap.set(root.querySelectorAll(failSafeSelector), { clearProps: TEAM_CLEAR_PROPS });
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

export const TEAM_REVEAL_ATTR = 'data-team-reveal';
export const TEAM_REVEAL_MEDIA_ATTR = 'data-team-reveal-media';

/**
 * Shared entrance for every Team layout: each `[data-team-reveal]` node rises and fades in on a
 * stagger while its `[data-team-reveal-media]` portrait settles out of a slight over-scale.
 *
 * Every tween ends by clearing the exact properties it set. Clearing matters: a finished GSAP
 * tween otherwise leaves inline `opacity`/`transform` on the node, and inline styles beat the CSS
 * hover rules each design relies on — the hover choreography would silently stop working (same
 * trap as portfolio-info-about-platform-internal-polish). But it has to be a property list, never
 * `clearProps: 'all'`: "all" wipes the whole inline style attribute, including the card
 * background/border colors React itself rendered from the palette — live-confirmed, the cards
 * turned transparent the moment the entrance finished.
 *
 * `signature` re-arms the entrance when the layout itself changes; once a grid has been revealed
 * it is never hidden again, so a settings edit mid-view cannot flash the members out.
 */
export function useTeamEntrance<T extends HTMLElement = HTMLDivElement>(
  signature: string,
  /** Polaroid only: the prints come in scattered and settle onto the tilt their own CSS class
   *  defines (GSAP reads that computed rotation as the tween's end value). */
  scatter = false
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const revealedSignature = useRef<string | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(`[${TEAM_REVEAL_ATTR}]`));
    if (items.length === 0) return;
    const media = items
      .map((item) => item.querySelector<HTMLElement>(`[${TEAM_REVEAL_MEDIA_ATTR}]`))
      .filter((node): node is HTMLElement => node != null);

    if (revealedSignature.current === signature || teamPrefersReducedMotion()) {
      gsap.set([...items, ...media], { clearProps: TEAM_CLEAR_PROPS });
      return;
    }

    return runTeamDesignMotion(
      root,
      'Team entrance',
      (observers) => {
        const resting = scatter
          ? items.map((item) => Number(gsap.getProperty(item, 'rotation')) || 0)
          : [];
        gsap.set(items, {
          autoAlpha: 0,
          y: 34,
          ...(scatter ? { rotation: (i: number) => resting[i] + (i % 2 === 0 ? -7 : 7) } : {}),
        });
        if (media.length > 0) gsap.set(media, { scale: 1.07, transformOrigin: '50% 50%' });
        revealTeamOnceVisible(observers, root, 88, () => {
          revealedSignature.current = signature;
          const timeline = gsap.timeline();
          timeline.to(items, {
            autoAlpha: 1,
            y: 0,
            ...(scatter ? { rotation: (i: number) => resting[i] } : {}),
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.075,
            clearProps: TEAM_CLEAR_PROPS,
          });
          if (media.length > 0) {
            timeline.to(
              media,
              {
                scale: 1,
                duration: 1.25,
                ease: 'power3.out',
                stagger: 0.075,
                clearProps: TEAM_CLEAR_PROPS,
              },
              0
            );
          }
        });
      },
      `[${TEAM_REVEAL_ATTR}], [${TEAM_REVEAL_MEDIA_ATTR}]`
    );
  }, [signature, scatter]);

  return ref;
}

/** Two-digit editorial index ("01", "02", … "12"). */
export function teamIndexLabel(index: number): string {
  return String(index + 1).padStart(2, '0');
}
