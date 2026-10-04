'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

/** `frame` nudges each photo so the subject sits just below the hero title. */
const SLIDES = [
  { src: '/landing/v4/hero-pro-v8.jpg', frame: 'object-[68%_top] sm:object-[50%_0%]' },
  { src: '/landing/v4/hero-graduate-v6.jpg', frame: 'object-[68%_top] sm:object-[50%_0%]' },
  { src: '/landing/v4/hero-laptop.jpg', frame: 'object-[68%_top] sm:object-[50%_35%]' },
] as const;

const INTERVAL_MS = 5000;
const TRANSITION = 'opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1), transform 7s ease-out';

/** Hero background that cross-fades between the audiences Skraft serves. */
export function HeroBackdrop() {
  const [{ active, previous }, setSlides] = useState<{ active: number; previous: number | null }>({
    active: 0,
    previous: null,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlides(({ active: current }) => ({ active: (current + 1) % SLIDES.length, previous: current }));
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[28%] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_22%)] sm:top-[27%]">
      {SLIDES.map(({ src, frame }, i) => {
        const isActive = i === active;
        /* The outgoing slide stays opaque underneath, so the fade never dips into the black background. */
        const isPrevious = i === previous;
        return (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            style={{ transition: isActive || isPrevious ? TRANSITION : 'none' }}
            className={`object-cover contrast-[1.08] motion-reduce:!transition-none ${frame} ${
              isActive
                ? 'z-[2] scale-100 opacity-100'
                : isPrevious
                  ? 'z-[1] scale-100 opacity-100'
                  : 'z-0 scale-[1.04] opacity-0'
            }`}
          />
        );
      })}
    </div>
  );
}
