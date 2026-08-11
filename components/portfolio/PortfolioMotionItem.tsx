'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  isMotionProfileActive,
  motionProfileBaseDelaySeconds,
  motionProfileDurationSeconds,
  motionProfileEntryOffset,
  motionProfileHoverBoxShadow,
  motionProfileHoverLift,
  motionProfileStaggerSeconds,
  motionProfileSupportsHover,
  type PortfolioGlobalMotionProfile,
  type PortfolioMotionTiming,
} from '@/components/portfolio/portfolio-motion-settings';

type PortfolioMotionContextValue = {
  timing: PortfolioMotionTiming | null;
};

const PortfolioMotionContext = createContext<PortfolioMotionContextValue>({ timing: null });

export function PortfolioMotionProvider({
  timing,
  children,
}: {
  timing?: PortfolioMotionTiming | null;
  children: ReactNode;
}) {
  return (
    <PortfolioMotionContext.Provider value={{ timing: timing ?? null }}>
      {children}
    </PortfolioMotionContext.Provider>
  );
}

function isElementInView(el: HTMLElement, root: Element | null): boolean {
  const rect = el.getBoundingClientRect();
  if (root && root instanceof HTMLElement) {
    const rootRect = root.getBoundingClientRect();
    return rect.top < rootRect.bottom && rect.bottom > rootRect.top;
  }
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/** Nearest scrollable ancestor (pages mode uses nested overflow-y-auto). */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export function PortfolioMotionItem({
  profile,
  index = 0,
  className = '',
  revealKey,
  timing: timingProp,
  children,
}: {
  profile: PortfolioGlobalMotionProfile;
  index?: number;
  className?: string;
  /** Change this (e.g. active page id) to re-run the entry animation. */
  revealKey?: string | number;
  /** Optional local override; otherwise uses PortfolioMotionProvider timing. */
  timing?: PortfolioMotionTiming | null;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { timing: contextTiming } = useContext(PortfolioMotionContext);
  const timing = timingProp ?? contextTiming;
  const active = isMotionProfileActive(profile) && prefersReducedMotion !== true;
  const [visible, setVisible] = useState(!active);
  const hoverEnabled = motionProfileSupportsHover(profile) && active;
  const hoverLift = hoverEnabled ? motionProfileHoverLift(profile, timing) : 0;
  const hoverShadow = hoverEnabled ? motionProfileHoverBoxShadow(profile, timing) : undefined;

  useEffect(() => {
    if (!active) {
      setVisible(true);
      return;
    }

    setVisible(false);
    const el = ref.current;
    if (!el) return;

    let revealed = false;
    let observer: IntersectionObserver | null = null;
    let scrollRoot: HTMLElement | null = null;
    let raf = 0;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setVisible(true);
      observer?.disconnect();
      observer = null;
      if (scrollRoot) {
        scrollRoot.removeEventListener('scroll', onScroll);
      } else {
        window.removeEventListener('scroll', onScroll);
      }
      window.removeEventListener('resize', onScroll);
    };

    const onScroll = () => {
      if (isElementInView(el, scrollRoot)) reveal();
    };

    raf = requestAnimationFrame(() => {
      scrollRoot = getScrollParent(el);

      if (isElementInView(el, scrollRoot)) {
        reveal();
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) reveal();
        },
        {
          root: scrollRoot,
          threshold: 0.08,
          rootMargin: '0px 0px -4% 0px',
        }
      );
      observer.observe(el);

      if (scrollRoot) {
        scrollRoot.addEventListener('scroll', onScroll, { passive: true });
      } else {
        window.addEventListener('scroll', onScroll, { passive: true });
      }
      window.addEventListener('resize', onScroll, { passive: true });
    });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      if (scrollRoot) {
        scrollRoot.removeEventListener('scroll', onScroll);
      } else {
        window.removeEventListener('scroll', onScroll);
      }
      window.removeEventListener('resize', onScroll);
    };
  }, [active, revealKey, index, profile]);

  if (!active) {
    return <div className={`h-full min-h-0 ${className}`.trim()}>{children}</div>;
  }

  const y = motionProfileEntryOffset(profile, timing);
  const duration = motionProfileDurationSeconds(profile, timing);
  const delay = visible
    ? motionProfileBaseDelaySeconds(profile, timing) +
      motionProfileStaggerSeconds(profile, index, timing)
    : 0;

  return (
    <div ref={ref} className={`h-full min-h-0 ${className}`.trim()}>
      <motion.div
        initial={{ y, opacity: 0 }}
        animate={visible ? { y: 0, opacity: 1 } : { y, opacity: 0 }}
        whileHover={
          hoverEnabled && (hoverLift > 0 || hoverShadow)
            ? {
                y: hoverLift > 0 ? -hoverLift : 0,
                boxShadow: hoverShadow ?? '0 0 0 0 transparent',
              }
            : undefined
        }
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={
          hoverEnabled
            ? 'h-full min-h-0 w-full min-w-0 rounded-[inherit] will-change-transform'
            : 'h-full min-h-0 w-full min-w-0 will-change-transform'
        }
        style={{ pointerEvents: visible ? undefined : 'none' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
