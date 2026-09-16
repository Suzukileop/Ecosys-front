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
  headerDesignAlignClass,
  headerBottomSpacingClass,
  type PortfolioHeaderDesignProps as StackHeaderProps,
} from '@/components/portfolio/portfolio-header-design-shared';

/**
 * Reveal mask — a solid curtain wipes off the title on scroll-enter, then the
 * subtitle fades up. Curtain defaults to scaleX(0) (title fully visible) so a
 * no-JS/reduced-motion viewer never sees a blank covered title.
 */
export function StackMaskHeader({ title, subtitle, presentation }: StackHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const accent = presentation.levelAccentColor?.trim() || titleColor;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const curtain = root.querySelector<HTMLElement>('.pf-stack-mask-curtain');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-stack-mask-subtitle');
    if (!curtain) return;

    const ctx = gsap.context(() => {
      // Cover the title immediately (pre-paint) — only then does the reveal wipe
      // play on scroll, so nothing flashes visible-then-covered-then-revealed.
      gsap.set(curtain, { scaleX: 1 });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 14 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      tl.to(curtain, {
        scaleX: 0,
        duration: 0.95,
        ease: 'power4.inOut',
        transformOrigin: 'right center',
      });
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.35');
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle]);

  return (
    <div
      ref={rootRef}
      className={`pf-stack-header pf-stack-header-mask flex w-full flex-col ${headerDesignAlignClass(presentation.headerAlignment)} ${headerBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <div className="relative inline-block overflow-hidden">
        <h2
          className={`text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${stackHeaderFontClass(presentation.titleFont, 'title')}`}
          style={{ color: titleColor, ...stackHeaderFontStyle(presentation.titleFont) }}
        >
          {title}
        </h2>
        <span
          className="pf-stack-mask-curtain pointer-events-none absolute inset-0"
          style={{ backgroundColor: accent, transform: 'scaleX(0)', transformOrigin: 'right center' }}
          aria-hidden
        />
      </div>
      {subtitle ? (
        <p
          className={`pf-stack-mask-subtitle mt-4 max-w-xl text-base sm:text-lg ${stackHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
          style={{ color: subtitleColor, ...stackHeaderFontStyle(presentation.subtitleFont) }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
