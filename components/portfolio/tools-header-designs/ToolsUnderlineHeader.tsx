'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
 * Ink underline — a hand-drawn stroke draws itself beneath the title on scroll-enter
 * (SVG strokeDashoffset "pen draw", same battle-tested technique as the Level SVG
 * rings gallery design), sized to track the title's rendered width. Defaults to a
 * fully-drawn stroke so reduced-motion viewers see the final state immediately.
 */
export function ToolsUnderlineHeader({ title, subtitle, presentation }: ToolsHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleWidth, setTitleWidth] = useState(0);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const accent = presentation.levelAccentColor?.trim() || titleColor;

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return undefined;
    const measure = () => setTitleWidth(el.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [title]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const titleEl = root.querySelector<HTMLElement>('.pf-tools-underline-title');
    const path = root.querySelector<SVGPathElement>('.pf-tools-underline-path');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-tools-underline-subtitle');
    if (!titleEl || !path) return;

    const ctx = gsap.context(() => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(titleEl, { opacity: 0, y: 12 });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 10 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      tl.to(titleEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
      tl.to(path, { strokeDashoffset: 0, duration: 0.85, ease: 'power2.inOut' }, '-=0.2');
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.35');
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle, titleWidth]);

  return (
    <div
      ref={rootRef}
      className={`pf-tools-header pf-tools-header-underline flex w-full flex-col ${toolsHeaderAlignClass(presentation.headerAlignment)} ${toolsHeaderBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <h2
        ref={titleRef}
        className={`pf-tools-underline-title inline-block text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${toolsHeaderFontClass(presentation.titleFont, 'title')}`}
        style={{ color: titleColor, ...toolsHeaderFontStyle(presentation.titleFont) }}
      >
        {title}
      </h2>
      <svg
        className="pf-tools-underline-svg mt-1.5 block h-3"
        style={{ width: titleWidth ? `${titleWidth}px` : '60%' }}
        viewBox="0 0 280 14"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          className="pf-tools-underline-path"
          d="M4 8 C 60 2, 120 11, 276 6"
          fill="none"
          stroke={accent}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
      {subtitle ? (
        <p
          className={`pf-tools-underline-subtitle mt-3 max-w-xl text-base sm:text-lg ${toolsHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
          style={{ color: subtitleColor, ...toolsHeaderFontStyle(presentation.subtitleFont) }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
