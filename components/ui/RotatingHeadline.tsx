'use client';

import { useEffect, useState } from 'react';

type RotatingHeadlineProps = {
  phrases: readonly string[];
  intervalMs?: number;
  className?: string;
};

export function RotatingHeadline({ phrases, intervalMs = 30_000, className = '' }: RotatingHeadlineProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length < 2) return;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % phrases.length), intervalMs);
    return () => window.clearInterval(id);
  }, [phrases.length, intervalMs]);

  return (
    <h1 className={`grid ${className}`}>
      {phrases.map((phrase, i) => {
        const active = i === index;
        return (
          <span
            key={phrase}
            aria-hidden={!active}
            className={`col-start-1 row-start-1 transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-opacity motion-reduce:duration-300 ${
              active
                ? 'translate-y-0 opacity-100 blur-0'
                : 'pointer-events-none translate-y-2 opacity-0 blur-[6px] motion-reduce:translate-y-0 motion-reduce:blur-0'
            }`}
          >
            {phrase}
          </span>
        );
      })}
    </h1>
  );
}
