'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * Professional, student, freelancer — each on the right of the frame, the left kept dark for the
 * copy. 2560px exports of Unsplash photos (free Unsplash License): 7AgqAZbogOQ by Alex Hudson,
 * 8OZh33HlFq4 by Daniel Maraventano, sgzFhiSUoII by Akram Huseyn.
 */
const SLIDES = [
  { src: '/landing/hero/hero-pro.jpg', frame: 'object-[62%_center] md:object-center' },
  { src: '/landing/hero/hero-student.jpg', frame: 'object-[72%_center] md:object-center' },
  { src: '/landing/hero/hero-freelance.jpg', frame: 'object-[75%_center] md:object-center' },
] as const;

const INTERVAL_MS = 5000;
const TRANSITION = 'opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1), transform 7s ease-out';

/**
 * Full-bleed hero background that cross-fades between the audiences Skraft serves; the hero lays
 * its own scrims on top. With reduced motion it stays on the first photo.
 */
export function HeroBackdrop() {
  const [{ active, previous }, setSlides] = useState<{ active: number; previous: number | null }>({
    active: 0,
    previous: null,
  });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setSlides(({ active: current }) => ({ active: (current + 1) % SLIDES.length, previous: current }));
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
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
            className={`object-cover motion-reduce:!transition-none ${frame} ${
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
