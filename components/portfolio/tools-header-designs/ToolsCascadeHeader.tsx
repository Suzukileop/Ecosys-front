'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  toolsHeaderFontClass,
  toolsHeaderFontStyle,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  prefersReducedMotion,
  toolsHeaderAlignClass,
  toolsHeaderBottomSpacingClass,
  type ToolsHeaderProps,
} from '@/components/portfolio/tools-header-designs/shared';

/**
 * Word cascade — a row of small step dots (one per word) sits above the title as the
 * design's permanent static signature; each word of the title rises into place from
 * its own overflow-hidden mask on scroll-enter, and its dot pops in at the same beat,
 * like a sequence being checked off. Defaults fully settled so reduced-motion viewers
 * see the final title immediately.
 */
export function ToolsCascadeHeader({ title, subtitle, presentation }: ToolsHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const accent = presentation.levelAccentColor?.trim() || titleColor;
  const words = useMemo(() => title.split(' ').filter(Boolean), [title]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const dotEls = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.pf-tools-cascade-dot'));
    const wordEls = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.pf-tools-cascade-word'));
    const subtitleEl = root.querySelector<HTMLElement>('.pf-tools-cascade-subtitle');
    if (wordEls.length === 0) return;

    const ctx = gsap.context(() => {
      // Each word sits below its mask, each dot is collapsed (pre-paint) — only the
      // rise/pop is scroll-gated, staggered in lockstep so a dot lands with its word.
      if (dotEls.length) gsap.set(dotEls, { opacity: 0, scale: 0.3 });
      gsap.set(wordEls, { yPercent: 112 });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 12 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      if (dotEls.length) {
        tl.to(dotEls, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.07,
          ease: 'back.out(2.4)',
        });
      }
      tl.to(
        wordEls,
        {
          yPercent: 0,
          duration: 0.82,
          stagger: 0.07,
          ease: 'power4.out',
        },
        dotEls.length ? '-=0.32' : 0
      );
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.35');
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle, words.length]);

  return (
    <div
      ref={rootRef}
      className={`pf-tools-header pf-tools-header-cascade flex w-full flex-col ${toolsHeaderAlignClass(presentation.headerAlignment)} ${toolsHeaderBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <div className="mb-3 flex items-center gap-1.5" aria-hidden>
        {words.map((_, index) => (
          <span
            key={index}
            className="pf-tools-cascade-dot h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
        ))}
      </div>
      <h2
        className={`text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${toolsHeaderFontClass(presentation.titleFont, 'title')}`}
        style={{ color: titleColor, ...toolsHeaderFontStyle(presentation.titleFont) }}
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`}>
            <span className="inline-block overflow-hidden align-bottom">
              <span className="pf-tools-cascade-word inline-block">{word}</span>
            </span>
            {index < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </h2>
      {subtitle ? (
        <p
          className={`pf-tools-cascade-subtitle mt-4 max-w-xl text-base sm:text-lg ${toolsHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
          style={{ color: subtitleColor, ...toolsHeaderFontStyle(presentation.subtitleFont) }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
