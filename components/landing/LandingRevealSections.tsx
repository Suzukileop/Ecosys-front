'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useLandingEntrance } from '@/components/landing/LandingEntranceContext';

export function LandingRevealSections({ children }: { children: ReactNode }) {
  const { phase } = useLandingEntrance();

  if (phase === 'loading' || phase === 'flying' || phase === 'settled') {
    return <div className="pointer-events-none invisible h-0 overflow-hidden" aria-hidden="true" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
