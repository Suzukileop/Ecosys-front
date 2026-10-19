'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import heroPro from '@/public/landing/hero/hero-pro.jpg';
import heroStudent from '@/public/landing/hero/hero-student.jpg';
import heroFreelance from '@/public/landing/hero/hero-freelance.jpg';

/**
 * Professional, student, freelancer — each on the right of the frame, the left kept dark for the
 * copy. 2560px exports of Unsplash photos (free Unsplash License): 7AgqAZbogOQ by Alex Hudson,
 * 8OZh33HlFq4 by Daniel Maraventano, sgzFhiSUoII by Akram Huseyn.
 */
const SLIDES = [
  { src: heroPro, frame: 'object-[62%_center] md:object-center' },
  { src: heroStudent, frame: 'object-[72%_center] md:object-center' },
  { src: heroFreelance, frame: 'object-[75%_center] md:object-center' },
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

  /* Only the first photo competes with the page's first paint; the two others are mounted once the
     page has loaded, well before the first cross-fade (INTERVAL_MS). */
  const [restMounted, setRestMounted] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0;
    const mountRest = () => {
      timer = window.setTimeout(() => setRestMounted(true), 1500);
    };
    if (document.readyState === 'complete') mountRest();
    else window.addEventListener('load', mountRest, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', mountRest);
    };
  }, []);

  useEffect(() => {
    if (!restMounted) return;
    const timer = window.setInterval(() => {
      setSlides(({ active: current }) => ({ active: (current + 1) % SLIDES.length, previous: current }));
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [restMounted]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {SLIDES.map(({ src, frame }, i) => {
        if (i > 0 && !restMounted) return null;
        const isActive = i === active;
        /* The outgoing slide stays opaque underneath, so the fade never dips into the black background. */
        const isPrevious = i === previous;
        return (
          <Image
            key={src.src}
            src={src}
            placeholder={i === 0 ? 'blur' : 'empty'}
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
