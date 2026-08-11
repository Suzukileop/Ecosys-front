'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import type { PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';
import { servicesCardMaxWidthClass } from '@/components/portfolio/portfolio-services-settings';

/** Pause between auto-advances — leave room for the slow glide to finish. */
const AUTO_MS = 4800;
/** Hold a single stacked card in view, then fan out. */
const FAN_REVEAL_DELAY_MS = 700;
/** After the fan settles, wait this long then run the first card advance. */
const FAN_FIRST_ADVANCE_DELAY_MS = 600;
/** Fan open / close — all peeks move together from the front stack. */
const FAN_EXPAND = {
  type: 'tween' as const,
  duration: 1.05,
  ease: [0.16, 1, 0.3, 1] as const,
};
const FAN_EXPAND_MOVE = {
  x: FAN_EXPAND,
  y: FAN_EXPAND,
  scale: FAN_EXPAND,
  opacity: FAN_EXPAND,
  zIndex: { duration: 0 },
};
/**
 * Cascade must read as sequential peels — stagger ≈ motion so the next card
 * starts after the previous one has mostly left the stack (unlike Expand).
 */
const CASCADE_STAGGER_S = 0.32;
const FAN_CASCADE = {
  type: 'tween' as const,
  duration: 0.58,
  ease: [0.22, 1, 0.36, 1] as const,
};

function cascadeRevealTransition(delayS: number) {
  const step = { ...FAN_CASCADE, delay: delayS };
  return {
    x: step,
    y: step,
    scale: step,
    opacity: step,
    zIndex: { duration: 0 },
  };
}
/** Fan slides in sync while the front card collapses (no wait). */
const SLIDE_WITH_COLLAPSE = {
  type: 'tween' as const,
  duration: 1.15,
  ease: [0.22, 1, 0.36, 1] as const,
};
const SLIDE_MOVE_CONCURRENT = {
  x: SLIDE_WITH_COLLAPSE,
  y: SLIDE_WITH_COLLAPSE,
  scale: SLIDE_WITH_COLLAPSE,
  opacity: { ...SLIDE_WITH_COLLAPSE, duration: 0.95 },
  zIndex: { duration: 0 },
};
/** Front shell: collapse in place — opacity fades out quickly mid-collapse. */
const COLLAPSE_FRONT = {
  duration: 1.05,
  times: [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.86, 1] as number[],
  ease: 'linear' as const,
};
const COLLAPSE_FRONT_OPACITY = {
  duration: 0.52,
  times: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1] as number[],
  ease: 'linear' as const,
};
/** Rear shell: fully in place before the 2nd card finishes sliding to front (~1.15s). */
const APPEAR_BACK = {
  duration: 0.8,
  times: [0, 0.1, 0.22, 0.35, 0.48, 0.62, 0.76, 0.9, 1] as number[],
  ease: 'linear' as const,
};
/** Reverse: appear at front while the fan slides. */
const APPEAR_FRONT = APPEAR_BACK;
const COLLAPSE_REAR = COLLAPSE_FRONT;
/**
 * Ideal peek size (same px on the right and on top).
 * Horizontal peeks auto-scale down when the column is too narrow.
 */
const PEEK_RATIO = 0.24;
const MIN_PEEK = 10;

function stackDepth(index: number, active: number, count: number): number {
  return (index - active + count) % count;
}

function stageAlignClass(alignment: PortfolioServicesPresentationSettings['cardAlignment']): string {
  switch (alignment) {
    case 'right':
      return 'ml-auto';
    case 'center':
      return 'mx-auto';
    default:
      return 'mr-auto';
  }
}

/**
 * Diagonal fan / deck — front card fully visible, others cascade up-right.
 * Peek offsets auto-fit to the available column width so nothing overflows.
 * Off-screen: stacked behind the front card. On enter: brief single-card beat, then expand or
 * cascade fan, then a short beat and the first card advance.
 * All cards share one slow, fluid glide when the stack advances.
 * Front card collapses on a separate top layer; the same item reappears at the back.
 */
export function PortfolioServicesDeck({
  itemCount,
  presentation,
  renderItem,
  label = 'Deck',
}: {
  itemCount: number;
  presentation: PortfolioServicesPresentationSettings;
  renderItem: (index: number, isFront: boolean) => ReactNode;
  label?: string;
}) {
  const reducedMotion = useReducedMotion();
  const entranceEffect = presentation.deckEntranceEffect ?? 'expand';
  const entranceDisabled = entranceEffect === 'none' || Boolean(reducedMotion);
  const isCascade = entranceEffect === 'cascade';
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardSize, setCardSize] = useState({ w: 320, h: 280 });
  const [hostWidth, setHostWidth] = useState(0);
  /** 0 = stacked (one card); 1 = full diagonal fan. */
  const [fanOpen, setFanOpen] = useState(entranceDisabled ? 1 : 0);
  /** True while entrance open/close is playing (used for cascade stagger). */
  const [fanRevealing, setFanRevealing] = useState(false);
  /** When true, remounted peeks start stacked (read once on mount of fanCycleKey). */
  const [mountFromStack, setMountFromStack] = useState(false);
  /** Bumped on each expand so peeks remount from the stacked origin (fixes re-scroll glitch). */
  const [fanCycleKey, setFanCycleKey] = useState(0);
  const hoverPausedRef = useRef(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const measureCardRef = useRef<HTMLDivElement | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const prevDepthByIndex = useRef<Record<number, number>>({});
  const revealTimerRef = useRef<number | null>(null);
  const revealAnimTimerRef = useRef<number | null>(null);
  const firstAdvanceTimerRef = useRef<number | null>(null);
  const wasInViewRef = useRef(false);
  const goNextRef = useRef<() => void>(() => {});

  const goNext = useCallback(() => {
    if (itemCount < 2) return;
    setActiveIndex((prev) => {
      for (let i = 0; i < itemCount; i += 1) {
        prevDepthByIndex.current[i] = stackDepth(i, prev, itemCount);
      }
      return (prev + 1) % itemCount;
    });
  }, [itemCount]);
  goNextRef.current = goNext;

  const goPrev = useCallback(() => {
    if (itemCount < 2) return;
    setActiveIndex((prev) => {
      for (let i = 0; i < itemCount; i += 1) {
        prevDepthByIndex.current[i] = stackDepth(i, prev, itemCount);
      }
      return (prev - 1 + itemCount) % itemCount;
    });
  }, [itemCount]);

  const jumpTo = useCallback(
    (index: number) => {
      if (itemCount < 2) return;
      setActiveIndex((prev) => {
        for (let i = 0; i < itemCount; i += 1) {
          prevDepthByIndex.current[i] = stackDepth(i, prev, itemCount);
        }
        return index;
      });
    },
    [itemCount]
  );

  useEffect(() => {
    setActiveIndex((prev) => (itemCount === 0 ? 0 : Math.min(prev, itemCount - 1)));
  }, [itemCount]);

  /**
   * When the deck enters view: keep a single stacked card briefly, then fan out quickly.
   * When it leaves: collapse immediately behind the front card.
   * Skipped when deckEntranceEffect is `none` (or reduced motion).
   */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const clearRevealTimer = () => {
      if (revealTimerRef.current != null) {
        window.clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      if (revealAnimTimerRef.current != null) {
        window.clearTimeout(revealAnimTimerRef.current);
        revealAnimTimerRef.current = null;
      }
      if (firstAdvanceTimerRef.current != null) {
        window.clearTimeout(firstAdvanceTimerRef.current);
        firstAdvanceTimerRef.current = null;
      }
    };

    if (entranceDisabled) {
      clearRevealTimer();
      wasInViewRef.current = false;
      setFanRevealing(false);
      setFanOpen(1);
      return;
    }

    const startFanReveal = (nextOpen: 0 | 1) => {
      if (firstAdvanceTimerRef.current != null) {
        window.clearTimeout(firstAdvanceTimerRef.current);
        firstAdvanceTimerRef.current = null;
      }
      // Drop mid-cycle depth ghosts so collapse/appear shells don't fire on re-entry.
      prevDepthByIndex.current = {};
      // Remount peeks at the stacked origin, then animate open together / in cascade.
      setMountFromStack(true);
      setFanCycleKey((key) => key + 1);
      setFanRevealing(true);
      setFanOpen(nextOpen);
      const staggerMs =
        entranceEffect === 'cascade' ? Math.max(0, itemCount - 1) * CASCADE_STAGGER_S * 1000 : 0;
      const moveMs =
        (entranceEffect === 'cascade' ? FAN_CASCADE.duration : FAN_EXPAND.duration) * 1000;
      const animMs = moveMs + staggerMs + 80;
      revealAnimTimerRef.current = window.setTimeout(() => {
        revealAnimTimerRef.current = null;
        setFanRevealing(false);
        // Once the fan is fully open, wait briefly then run the first card transition.
        if (nextOpen === 1 && itemCount >= 2) {
          firstAdvanceTimerRef.current = window.setTimeout(() => {
            firstAdvanceTimerRef.current = null;
            if (hoverPausedRef.current) return;
            goNextRef.current();
          }, FAN_FIRST_ADVANCE_DELAY_MS);
        }
      }, animMs);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.18;
        if (!visible) {
          clearRevealTimer();
          wasInViewRef.current = false;
          startFanReveal(0);
          return;
        }
        // Already in view — don't restart the delay on threshold chatter.
        if (wasInViewRef.current) return;
        wasInViewRef.current = true;
        clearRevealTimer();
        // Beat: one card visible, then expand / cascade.
        setFanOpen(0);
        setFanRevealing(false);
        revealTimerRef.current = window.setTimeout(() => {
          revealTimerRef.current = null;
          startFanReveal(1);
        }, FAN_REVEAL_DELAY_MS);
      },
      {
        threshold: [0, 0.12, 0.18, 0.28, 0.5, 1],
        rootMargin: '0px 0px -8% 0px',
      }
    );
    observer.observe(host);
    return () => {
      clearRevealTimer();
      observer.disconnect();
    };
  }, [entranceDisabled, entranceEffect, itemCount]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const cardEl = measureCardRef.current;
    if (!host) return;

    const update = () => {
      const hostRect = host.getBoundingClientRect();
      if (hostRect.width > 40) {
        setHostWidth(Math.round(hostRect.width));
      }
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        if (cardRect.height > 40 && cardRect.width > 40) {
          setCardSize({ w: Math.round(cardRect.width), h: Math.round(cardRect.height) });
        }
      }
    };

    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(host);
    if (cardEl) ro?.observe(cardEl);
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [itemCount, activeIndex, presentation.cardMaxWidth]);

  useLayoutEffect(() => {
    // Clear after the remount commit so later card advances don't re-use stacked initial.
    if (!mountFromStack) return;
    setMountFromStack(false);
  }, [fanCycleKey, mountFromStack]);

  useEffect(() => {
    if (reducedMotion || itemCount < 2 || fanOpen < 1) return;
    const id = window.setInterval(() => {
      if (hoverPausedRef.current) return;
      goNext();
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, itemCount, goNext, fanOpen]);

  const onPointerDown = (event: ReactPointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: ReactPointerEvent) => {
    if (fanOpen < 1) {
      pointerStart.current = null;
      return;
    }
    if (!pointerStart.current) return;
    const dx = event.clientX - pointerStart.current.x;
    const dy = event.clientY - pointerStart.current.y;
    pointerStart.current = null;
    if (Math.abs(dx) < 36 && Math.abs(dy) < 36) return;
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    } else if (dy < 0) goNext();
    else goPrev();
  };

  if (itemCount === 0) return null;

  const cardMaxWidth =
    presentation.cardMaxWidth && presentation.cardMaxWidth !== 'full'
      ? presentation.cardMaxWidth
      : 'xl';
  const cardWidthClass = servicesCardMaxWidthClass(cardMaxWidth);
  const alignment = presentation.cardAlignment ?? 'left';

  if (reducedMotion || itemCount === 1) {
    return (
      <div
        className={`flex flex-col gap-4 ${cardWidthClass} ${stageAlignClass(alignment)}`}
        role="list"
        aria-label={label}
      >
        {Array.from({ length: itemCount }, (_, index) => (
          <div key={index} role="listitem" className="w-full">
            {renderItem(index, true)}
          </div>
        ))}
      </div>
    );
  }

  const maxDepth = itemCount - 1;
  const idealPeek = Math.max(MIN_PEEK, Math.round(cardSize.w * PEEK_RATIO));
  const availableForPeeks = Math.max(0, (hostWidth || cardSize.w) - cardSize.w - 12);
  const maxOffsetX = maxDepth > 0 ? Math.floor(availableForPeeks / maxDepth) : 0;
  const offsetX = maxDepth > 0 ? Math.min(idealPeek, Math.max(0, maxOffsetX)) : 0;
  const offsetY = -offsetX;
  /**
   * Keep the stage at full fan size and pin the front card.
   * Only rear peeks scale with fanOpen — avoids last-card jitter from resizing padY.
   */
  const padX = maxDepth * offsetX + 12;
  const padY = maxDepth * Math.abs(offsetY) + 12;
  const stageWidth = Math.min(cardSize.w + padX, hostWidth || cardSize.w + padX);
  const stageHeight = cardSize.h + padY;
  const peekT = fanOpen;

  const visibleCards = Array.from({ length: itemCount }, (_, index) => ({
    index,
    depth: stackDepth(index, activeIndex, itemCount),
  }));

  const fanCollapsing =
    fanOpen >= 1 &&
    visibleCards.some(
      ({ index, depth }) =>
        prevDepthByIndex.current[index] === 0 && depth === maxDepth && maxDepth > 0
    );

  // Collapsing front on top; rear cards paint underneath during the transition
  const renderOrder = fanCollapsing
    ? [...visibleCards].sort((a, b) => {
        const aCollapsing =
          prevDepthByIndex.current[a.index] === 0 && a.depth === maxDepth && maxDepth > 0;
        const bCollapsing =
          prevDepthByIndex.current[b.index] === 0 && b.depth === maxDepth && maxDepth > 0;
        if (aCollapsing) return 1;
        if (bCollapsing) return -1;
        return a.depth - b.depth;
      })
    : visibleCards;

  const positionTransition = fanCollapsing ? SLIDE_MOVE_CONCURRENT : FAN_EXPAND_MOVE;
  // Capture for this render's remounts — layout effect clears state after commit.
  const fromStack = mountFromStack;

  return (
    <div
      ref={hostRef}
      className="relative z-0 w-full min-w-0 isolate overflow-visible"
      onMouseEnter={() => {
        hoverPausedRef.current = true;
      }}
      onMouseLeave={() => {
        hoverPausedRef.current = false;
      }}
    >
      <div
        className={`pointer-events-none invisible absolute left-0 top-0 -z-10 ${cardWidthClass}`}
        aria-hidden
      >
        <div ref={measureCardRef} className="pf-deck-card w-full">
          {renderItem(activeIndex, true)}
        </div>
      </div>

      <div
        className={`relative touch-pan-y overflow-visible ${stageAlignClass(alignment)}`}
        style={{
          height: stageHeight,
          width: stageWidth,
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStart.current = null;
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
      >
        <AnimatePresence initial={false}>
          {renderOrder.flatMap(({ index, depth }) => {
            const isFront = depth === 0;
            // Front stays put; every rear card leaves from the same stacked origin.
            const x = depth * offsetX * peekT;
            const y = padY + depth * offsetY * peekT;
            const restScale = isFront ? 1 : 1 - depth * 0.008 * peekT;
            const restOpacity = isFront ? 1 : Math.max(0.9, 1 - depth * 0.02);
            const zIndex = 40 - depth;

            const prevDepth = prevDepthByIndex.current[index];
            const toBack = prevDepth === 0 && depth === maxDepth && maxDepth > 0 && fanOpen >= 1;
            const toFrontFromLast =
              prevDepth === maxDepth && depth === 0 && maxDepth > 0 && fanOpen >= 1;

            const backX = maxDepth * offsetX;
            const backY = padY + maxDepth * offsetY;
            const frontX = 0;
            const frontY = padY;

            const backZ = 40 - maxDepth;

            if (toBack) {
              return [
                <motion.div
                  key={`deck-${index}-rear`}
                  className="absolute left-0 flex justify-start"
                  style={{
                    top: 0,
                    zIndex: backZ,
                    width: cardSize.w || '100%',
                    transformOrigin: 'bottom left',
                  }}
                  initial={{ x: backX, y: backY, scale: 0.2, opacity: 0 }}
                  animate={{
                    x: backX,
                    y: backY,
                    scale: [0.2, 0.38, 0.52, 0.64, 0.74, 0.84, 0.92, restScale, restScale],
                    opacity: [0, 0.22, 0.42, 0.58, 0.72, 0.84, 0.93, restOpacity, restOpacity],
                  }}
                  transition={APPEAR_BACK}
                  aria-hidden
                >
                  <motion.div className="pf-deck-card pointer-events-auto w-full pf-deck-card--back cursor-pointer">
                    {renderItem(index, false)}
                  </motion.div>
                </motion.div>,
                <motion.div
                  key={`deck-${index}-collapse`}
                  className="absolute left-0 flex justify-start"
                  style={{
                    top: 0,
                    zIndex: 100,
                    width: cardSize.w || '100%',
                    transformOrigin: 'bottom left',
                  }}
                  initial={{ x: frontX, y: frontY, scale: 1, opacity: 1 }}
                  animate={{
                    x: frontX,
                    y: frontY,
                    scale: [1, 0.94, 0.86, 0.76, 0.66, 0.56, 0.46, 0.36, 0.2],
                    opacity: [1, 0.72, 0.38, 0.14, 0.04, 0, 0, 0],
                  }}
                  transition={{
                    x: COLLAPSE_FRONT,
                    y: COLLAPSE_FRONT,
                    scale: COLLAPSE_FRONT,
                    opacity: COLLAPSE_FRONT_OPACITY,
                  }}
                >
                  <motion.div className="pf-deck-card pointer-events-none w-full pf-deck-card--front">
                    {renderItem(index, true)}
                  </motion.div>
                </motion.div>,
              ];
            }

            if (toFrontFromLast) {
              return [
                <motion.div
                  key={`deck-${index}-rear-collapse`}
                  className="absolute left-0 flex justify-start"
                  style={{
                    top: 0,
                    zIndex: backZ,
                    width: cardSize.w || '100%',
                    transformOrigin: 'bottom left',
                  }}
                  initial={{ x: backX, y: backY, scale: restScale, opacity: restOpacity }}
                  animate={{
                    x: backX,
                    y: backY,
                    scale: [restScale, 0.88, 0.78, 0.66, 0.54, 0.42, 0.32, 0.24, 0.2],
                    opacity: [restOpacity, 0.9, 0.78, 0.62, 0.45, 0.3, 0.18, 0.08, 0],
                  }}
                  transition={COLLAPSE_REAR}
                  aria-hidden
                >
                  <motion.div className="pf-deck-card pointer-events-none w-full pf-deck-card--back">
                    {renderItem(index, false)}
                  </motion.div>
                </motion.div>,
                <motion.div
                  key={`deck-${index}-front`}
                  className="absolute left-0 flex justify-start"
                  style={{
                    top: 0,
                    zIndex: 100,
                    width: cardSize.w || '100%',
                    transformOrigin: 'bottom left',
                  }}
                  initial={{ x: frontX, y: frontY, scale: 0.2, opacity: 0 }}
                  animate={{
                    x: frontX,
                    y: frontY,
                    scale: [0.2, 0.32, 0.44, 0.56, 0.66, 0.74, 0.82, 0.9, 1],
                    opacity: [0, 0.14, 0.28, 0.42, 0.56, 0.68, 0.78, 0.88, 1],
                  }}
                  transition={APPEAR_FRONT}
                >
                  <motion.div className="pf-deck-card pointer-events-auto w-full pf-deck-card--front">
                    {renderItem(index, true)}
                  </motion.div>
                </motion.div>,
              ];
            }

            let animate: Record<string, number | number[]> = {
              x,
              y,
              scale: restScale,
              opacity: restOpacity,
              zIndex,
            };
            const transition: object = fanCollapsing
              ? SLIDE_MOVE_CONCURRENT
              : fanRevealing && isCascade
                ? cascadeRevealTransition(
                    fanOpen >= 1 ? depth * CASCADE_STAGGER_S : (maxDepth - depth) * CASCADE_STAGGER_S
                  )
                : positionTransition;

            if (fanCollapsing) {
              animate = { ...animate, zIndex: Math.min(zIndex, 95) };
            }

            const layerZ = fanCollapsing ? Math.min(zIndex, 95) : zIndex;

            return [
              <motion.div
                key={`fan-${fanCycleKey}-${index}`}
                className="absolute left-0 flex justify-start will-change-transform"
                style={{
                  top: 0,
                  zIndex: layerZ,
                  width: cardSize.w || '100%',
                  transformOrigin: 'bottom left',
                }}
                initial={
                  fromStack
                    ? {
                        x: 0,
                        y: padY,
                        scale: 1,
                        // Cascade: each rear card fades in as it peels (expand stays opaque).
                        opacity: isCascade && !isFront ? 0 : 1,
                      }
                    : false
                }
                animate={animate}
                transition={transition}
                aria-hidden={!isFront}
              >
                <div
                  role={isFront ? undefined : 'button'}
                  tabIndex={isFront ? undefined : 0}
                  onClick={
                    isFront || fanOpen < 1
                      ? undefined
                      : () => {
                          jumpTo(index);
                        }
                  }
                  onKeyDown={
                    isFront || fanOpen < 1
                      ? undefined
                      : (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            jumpTo(index);
                          }
                        }
                  }
                  className={`pf-deck-card pointer-events-auto w-full ${
                    isFront ? 'pf-deck-card--front' : 'pf-deck-card--back'
                  } ${isFront || fanOpen < 1 ? '' : 'cursor-pointer'}`}
                >
                  {renderItem(index, isFront)}
                </div>
              </motion.div>,
            ];
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
