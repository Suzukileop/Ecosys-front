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
import { servicesCardMaxWidthShellClass } from '@/components/portfolio/portfolio-services-settings';

const AUTO_MS = 4200;
/** Soft spring — cards slide through slots instead of hard-swapping content. */
const SPRING = { type: 'spring' as const, stiffness: 240, damping: 30, mass: 0.85 };
const FADE = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };
const VISIBLE_RADIUS = 2;
/**
 * Distance between consecutive card centers as a fraction of card height.
 * ~0.55 keeps majority of each card readable while still overlapping.
 */
const STEP_RATIO = 0.55;

type SlotVisual = {
  width: string;
  opacity: number;
  zIndex: number;
};

function shortestOffset(index: number, active: number, count: number): number {
  let raw = index - active;
  while (raw > count / 2) raw -= count;
  while (raw < -count / 2) raw += count;
  return raw;
}

function visualForOffset(offset: number): SlotVisual {
  const abs = Math.abs(offset);
  if (offset === 0) {
    return { width: '100%', opacity: 1, zIndex: 40 };
  }
  if (abs === 1) {
    return { width: '92%', opacity: 0.94, zIndex: 25 };
  }
  return { width: '84%', opacity: 0.86, zIndex: 10 };
}

/**
 * Vertical pyramid coverflow — 5 cards (center + 2 above + 2 below),
 * each mostly readable. Cards keep their identity and spring between slots.
 */
export function PortfolioServicesCoverflow({
  itemCount,
  presentation,
  renderItem,
  label = 'Coverflow',
}: {
  itemCount: number;
  presentation: PortfolioServicesPresentationSettings;
  renderItem: (index: number, isCenter: boolean) => ReactNode;
  label?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardH, setCardH] = useState(160);
  const hoverPausedRef = useRef(false);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const pointerStartY = useRef<number | null>(null);

  const goNext = useCallback(() => {
    if (itemCount < 2) return;
    setActiveIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const goPrev = useCallback(() => {
    if (itemCount < 2) return;
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  useEffect(() => {
    setActiveIndex((prev) => (itemCount === 0 ? 0 : Math.min(prev, itemCount - 1)));
  }, [itemCount]);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 40) setCardH(Math.round(h));
    };
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [itemCount, activeIndex]);

  useEffect(() => {
    if (reducedMotion || itemCount < 2) return;
    const id = window.setInterval(() => {
      if (hoverPausedRef.current) return;
      goNext();
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, itemCount, goNext]);

  const onPointerDown = (event: ReactPointerEvent) => {
    pointerStartY.current = event.clientY;
  };

  const onPointerUp = (event: ReactPointerEvent) => {
    if (pointerStartY.current == null) return;
    const delta = event.clientY - pointerStartY.current;
    pointerStartY.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  if (itemCount === 0) return null;

  if (reducedMotion || itemCount === 1) {
    return (
      <div
        className={`flex flex-col gap-4 ${servicesCardMaxWidthShellClass(
          presentation.cardMaxWidth,
          presentation.cardAlignment
        )}`}
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

  const step = Math.round(cardH * STEP_RATIO);
  const stageHeight = Math.max(440, Math.round(cardH + step * 4 + 16));

  const visibleCards = Array.from({ length: itemCount }, (_, index) => {
    const offset = shortestOffset(index, activeIndex, itemCount);
    return { index, offset };
  }).filter(({ offset }) => Math.abs(offset) <= VISIBLE_RADIUS);

  return (
    <div
      className={`relative z-0 min-w-0 isolate ${servicesCardMaxWidthShellClass(
        presentation.cardMaxWidth,
        presentation.cardAlignment
      )}`}
      onMouseEnter={() => {
        hoverPausedRef.current = true;
      }}
      onMouseLeave={() => {
        hoverPausedRef.current = false;
      }}
    >
      <div
        ref={measureRef}
        className="pointer-events-none invisible absolute left-0 top-0 -z-10 w-full"
        aria-hidden
      >
        <div className="pf-coverflow-card w-full">{renderItem(activeIndex, true)}</div>
      </div>

      <div
        className="relative w-full touch-pan-y overflow-hidden"
        style={{ height: stageHeight }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStartY.current = null;
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
      >
        <AnimatePresence initial={false}>
          {visibleCards.map(({ index, offset }) => {
            const visual = visualForOffset(offset);
            const isCenter = offset === 0;
            return (
              <motion.div
                key={index}
                className="absolute left-0 right-0 flex justify-center px-1"
                initial={{ opacity: 0, y: offset * step }}
                animate={{
                  y: offset * step,
                  opacity: visual.opacity,
                  zIndex: visual.zIndex,
                }}
                exit={{ opacity: 0, transition: FADE }}
                transition={SPRING}
                style={{
                  top: `calc(50% - ${cardH / 2}px)`,
                  zIndex: visual.zIndex,
                }}
                aria-hidden={!isCenter}
              >
                <motion.div
                  role={isCenter ? undefined : 'button'}
                  tabIndex={isCenter ? undefined : 0}
                  onClick={
                    isCenter
                      ? undefined
                      : () => {
                          setActiveIndex(index);
                        }
                  }
                  onKeyDown={
                    isCenter
                      ? undefined
                      : (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setActiveIndex(index);
                          }
                        }
                  }
                  className={`pf-coverflow-card pointer-events-auto overflow-hidden ${
                    isCenter ? '' : 'cursor-pointer'
                  }`}
                  initial={false}
                  animate={{
                    width: visual.width,
                    boxShadow: isCenter
                      ? '0 20px 44px -18px rgba(0,0,0,0.55)'
                      : '0 10px 24px -16px rgba(0,0,0,0.35)',
                  }}
                  transition={SPRING}
                >
                  {renderItem(index, isCenter)}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
