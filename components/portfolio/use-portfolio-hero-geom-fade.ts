'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Fades with scroll progress as the hero (or section) leaves through the top
 * of the viewport. Same math for geom motifs and full hero content dissolve.
 */
export function usePortfolioHeroGeomFade(enabled: boolean): {
  sectionRef: RefObject<HTMLElement | null>;
  opacity: number;
} {
  const sectionRef = useRef<HTMLElement>(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!enabled) {
      setOpacity(1);
      return;
    }

    let raf = 0;

    const update = () => {
      const el = sectionRef.current;
      if (!el) return;

      // Dissolve over ~45% of the hero height once the top leaves the screen.
      const fadeEnd = Math.max(el.offsetHeight * 0.45, window.innerHeight * 0.35);
      const scrolled = Math.max(0, -el.getBoundingClientRect().top);
      const progress = Math.min(1, scrolled / fadeEnd);
      setOpacity(1 - progress);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    // Capture phase: catch scroll on window and nested overflow panes.
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled]);

  return { sectionRef, opacity };
}
