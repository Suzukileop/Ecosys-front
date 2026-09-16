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

/** Split rule — title left, a hairline draws down the middle, subtitle right. */
export function StackSplitHeader({ title, subtitle, presentation }: StackHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const rule = presentation.cardBorderColor?.trim() || titleColor;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const titleEl = root.querySelector<HTMLElement>('.pf-stack-split-title');
    const ruleEl = root.querySelector<HTMLElement>('.pf-stack-split-rule');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-stack-split-subtitle');

    const ctx = gsap.context(() => {
      if (titleEl) gsap.set(titleEl, { opacity: 0, x: -24 });
      if (ruleEl) gsap.set(ruleEl, { scaleY: 0, transformOrigin: 'top center' });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, x: 24 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      if (titleEl) tl.to(titleEl, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
      if (ruleEl) tl.to(ruleEl, { scaleY: 1, duration: 0.7, ease: 'power2.out' }, '-=0.5');
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55');
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle]);

  return (
    <div
      ref={rootRef}
      className={`pf-stack-header pf-stack-header-split grid w-full grid-cols-1 items-start gap-6 sm:grid-cols-[1fr_auto_1fr] sm:gap-8 ${headerBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <h2
        className={`pf-stack-split-title text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${stackHeaderFontClass(presentation.titleFont, 'title')}`}
        style={{ color: titleColor, ...stackHeaderFontStyle(presentation.titleFont) }}
      >
        {title}
      </h2>
      <span
        className="pf-stack-split-rule hidden w-px self-stretch sm:block"
        style={{ backgroundColor: rule }}
        aria-hidden
      />
      {subtitle ? (
        <p
          className={`pf-stack-split-subtitle self-end text-base sm:text-lg ${stackHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
          style={{ color: subtitleColor, ...stackHeaderFontStyle(presentation.subtitleFont) }}
        >
          {subtitle}
        </p>
      ) : (
        <span aria-hidden />
      )}
    </div>
  );
}
