'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  stackHeaderFontClass,
  stackHeaderFontStyle,
} from '@/components/portfolio/portfolio-stack-settings';
import {
  prefersReducedMotion,
  headerBottomSpacingClass,
  type PortfolioHeaderDesignProps as StackHeaderProps,
} from '@/components/portfolio/portfolio-header-design-shared';

/** Marquee — a slow, continuous rotated word-strip runs behind the title; title/subtitle fade in over it. */
export function StackMarqueeHeader({ title, subtitle, presentation }: StackHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const accent = presentation.levelAccentColor?.trim() || titleColor;
  const marqueeWord = (title || 'STACK').toUpperCase();
  const words = useMemo(() => Array.from({ length: 8 }, () => marqueeWord), [marqueeWord]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const titleEl = root.querySelector<HTMLElement>('.pf-stack-marquee-title');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-stack-marquee-subtitle');

    let loopTween: gsap.core.Tween | undefined;
    const ctx = gsap.context(() => {
      if (track) {
        loopTween = gsap.to(track, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
      }
      if (titleEl) gsap.set(titleEl, { opacity: 0, y: 14 });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 10 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      if (titleEl) tl.to(titleEl, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');
      }
    }, root);

    return () => {
      loopTween?.kill();
      ctx.revert();
    };
  }, [title, subtitle, marqueeWord]);

  return (
    <div
      ref={rootRef}
      className={`pf-stack-header pf-stack-header-marquee relative w-full overflow-hidden ${headerBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <div
        className="pf-stack-marquee-band pointer-events-none absolute inset-x-[-10%] top-1/2 -translate-y-1/2 -rotate-2 select-none overflow-hidden"
        aria-hidden
      >
        <div ref={trackRef} className="flex w-max items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {words.map((word, index) => (
                <span
                  key={`${copy}-${index}`}
                  className="mx-4 text-6xl font-black uppercase leading-none tracking-tight opacity-10 sm:text-7xl lg:text-8xl"
                  style={{ color: accent }}
                >
                  {word}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="relative py-10 sm:py-14">
        <h2
          className={`pf-stack-marquee-title text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${stackHeaderFontClass(presentation.titleFont, 'title')}`}
          style={{ color: titleColor, ...stackHeaderFontStyle(presentation.titleFont) }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className={`pf-stack-marquee-subtitle mt-4 max-w-xl text-base sm:text-lg ${stackHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
            style={{ color: subtitleColor, ...stackHeaderFontStyle(presentation.subtitleFont) }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
