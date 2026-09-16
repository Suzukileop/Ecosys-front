'use client';

import { useLayoutEffect, useRef } from 'react';
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

/** Index numeral — an oversized faint "01" settles behind the title as it fades in. */
export function StackIndexHeader({ title, subtitle, presentation }: StackHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const accent = presentation.levelAccentColor?.trim() || titleColor;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const numeral = root.querySelector<HTMLElement>('.pf-stack-index-numeral');
    const titleEl = root.querySelector<HTMLElement>('.pf-stack-index-title');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-stack-index-subtitle');

    const ctx = gsap.context(() => {
      if (numeral) gsap.set(numeral, { opacity: 0, scale: 1.18 });
      if (titleEl) gsap.set(titleEl, { opacity: 0, y: 16 });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 12 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      if (numeral) tl.to(numeral, { opacity: 0.14, scale: 1, duration: 1, ease: 'power3.out' });
      if (titleEl) {
        tl.to(titleEl, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.75');
      }
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle]);

  return (
    <div
      ref={rootRef}
      className={`pf-stack-header pf-stack-header-index relative w-full ${headerBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <span
        className="pf-stack-index-numeral pointer-events-none absolute -top-6 left-0 select-none text-[5.5rem] font-black leading-none tracking-tighter opacity-0 sm:-top-8 sm:text-[8rem] lg:-top-10 lg:text-[10rem]"
        style={{ color: accent }}
        aria-hidden
      >
        01
      </span>
      <div className="relative">
        <h2
          className={`pf-stack-index-title text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${stackHeaderFontClass(presentation.titleFont, 'title')}`}
          style={{ color: titleColor, ...stackHeaderFontStyle(presentation.titleFont) }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className={`pf-stack-index-subtitle mt-4 max-w-xl text-base sm:text-lg ${stackHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
            style={{ color: subtitleColor, ...stackHeaderFontStyle(presentation.subtitleFont) }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
