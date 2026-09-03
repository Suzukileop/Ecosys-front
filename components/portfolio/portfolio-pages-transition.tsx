'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

const SLIDE_OFFSET_PX = 40;
const SLIDE_TRANSITION = { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const };

export function PortfolioPagesSlideViewport({
  pageId,
  direction,
  children,
}: {
  pageId: string;
  direction: 1 | -1;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const enterX = reduceMotion ? 0 : direction * SLIDE_OFFSET_PX;
  const exitX = reduceMotion ? 0 : -direction * SLIDE_OFFSET_PX;

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pageId}
          className="absolute inset-0 min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
          initial={reduceMotion ? false : { opacity: 0, x: enterX }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: exitX }}
          transition={SLIDE_TRANSITION}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
