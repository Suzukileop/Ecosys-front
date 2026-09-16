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
  headerDesignAlignClass,
  headerBottomSpacingClass,
  type PortfolioHeaderDesignProps as StackHeaderProps,
} from '@/components/portfolio/portfolio-header-design-shared';

/** Typewriter — title types in character by character with a caret, then the subtitle fades in. */
export function StackTypewriterHeader({ title, subtitle, presentation }: StackHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const accent = presentation.levelAccentColor?.trim() || titleColor;
  const characters = useMemo(() => Array.from(title), [title]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const chars = [...root.querySelectorAll<HTMLElement>('.pf-stack-type-char')];
    const caret = root.querySelector<HTMLElement>('.pf-stack-type-caret');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-stack-type-subtitle');
    if (chars.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(chars, { opacity: 0 });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 10 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      tl.to(chars, { opacity: 1, duration: 0.02, stagger: 0.045, ease: 'none' });
      if (caret) {
        tl.to(caret, { opacity: 0, duration: 0.3 }, '+=0.45');
      }
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.15');
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle]);

  return (
    <div
      ref={rootRef}
      className={`pf-stack-header pf-stack-header-typewriter flex w-full flex-col ${headerDesignAlignClass(presentation.headerAlignment)} ${headerBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <h2
        className={`inline-flex flex-wrap text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${stackHeaderFontClass(presentation.titleFont, 'title')}`}
        style={{ color: titleColor, ...stackHeaderFontStyle(presentation.titleFont) }}
      >
        {characters.map((char, index) => (
          <span key={`${char}-${index}`} className="pf-stack-type-char">
            {char === ' ' ? ' ' : char}
          </span>
        ))}
        <span
          className="pf-stack-type-caret ml-1 inline-block w-[0.07em] translate-y-[0.05em]"
          style={{ backgroundColor: accent, height: '0.92em' }}
          aria-hidden
        />
      </h2>
      {subtitle ? (
        <p
          className={`pf-stack-type-subtitle mt-4 max-w-xl text-base sm:text-lg ${stackHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
          style={{ color: subtitleColor, ...stackHeaderFontStyle(presentation.subtitleFont) }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
