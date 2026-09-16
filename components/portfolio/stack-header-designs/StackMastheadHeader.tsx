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

/** Masthead — hairlines draw outward from center above and below the title, newspaper-nameplate style. */
export function StackMastheadHeader({ title, subtitle, presentation }: StackHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const rule = presentation.cardBorderColor?.trim() || titleColor;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const rules = [...root.querySelectorAll<HTMLElement>('.pf-stack-masthead-rule')];
    const titleEl = root.querySelector<HTMLElement>('.pf-stack-masthead-title');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-stack-masthead-subtitle');

    const ctx = gsap.context(() => {
      if (rules.length > 0) gsap.set(rules, { scaleX: 0 });
      if (titleEl) gsap.set(titleEl, { opacity: 0, y: 10 });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 8 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      if (rules.length > 0) {
        tl.to(rules, { scaleX: 1, duration: 0.85, ease: 'power3.inOut', stagger: 0.08 });
      }
      if (titleEl) {
        tl.to(titleEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.45');
      }
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.35');
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle]);

  return (
    <div
      ref={rootRef}
      className={`pf-stack-header pf-stack-header-masthead flex w-full flex-col items-center text-center ${headerBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <span
        className="pf-stack-masthead-rule h-px w-24 sm:w-32"
        style={{ backgroundColor: rule, transformOrigin: 'center' }}
        aria-hidden
      />
      <h2
        className={`pf-stack-masthead-title mt-4 text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${stackHeaderFontClass(presentation.titleFont, 'title')}`}
        style={{ color: titleColor, ...stackHeaderFontStyle(presentation.titleFont) }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`pf-stack-masthead-subtitle mt-4 max-w-xl text-base sm:text-lg ${stackHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
          style={{ color: subtitleColor, ...stackHeaderFontStyle(presentation.subtitleFont) }}
        >
          {subtitle}
        </p>
      ) : null}
      <span
        className="pf-stack-masthead-rule mt-4 h-px w-24 sm:w-32"
        style={{ backgroundColor: rule, transformOrigin: 'center' }}
        aria-hidden
      />
    </div>
  );
}
