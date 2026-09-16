'use client';

import { useLayoutEffect, useRef } from 'react';
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

const CORNERS = [
  { key: 'tl', pos: 'left-0 top-0 border-l-2 border-t-2', from: { x: -8, y: -8 } },
  { key: 'tr', pos: 'right-0 top-0 border-r-2 border-t-2', from: { x: 8, y: -8 } },
  { key: 'bl', pos: 'left-0 bottom-0 border-b-2 border-l-2', from: { x: -8, y: 8 } },
  { key: 'br', pos: 'right-0 bottom-0 border-b-2 border-r-2', from: { x: 8, y: 8 } },
] as const;

/**
 * Bracket frame — four viewfinder-style corner marks converge onto the title on
 * scroll-enter, like a camera locking focus on its subject, while the title itself
 * settles in from a slight scale/offset. Defaults fully settled/framed so reduced-
 * motion viewers see the final composition immediately.
 */
export function ToolsBracketHeader({ title, subtitle, presentation }: ToolsHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const accent = presentation.levelAccentColor?.trim() || titleColor;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const corners = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.pf-tools-bracket-corner'));
    const titleEl = root.querySelector<HTMLElement>('.pf-tools-bracket-title');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-tools-bracket-subtitle');
    if (corners.length === 0 || !titleEl) return;

    const ctx = gsap.context(() => {
      corners.forEach((corner) => {
        const from = CORNERS.find((c) => corner.classList.contains(`pf-tools-bracket-corner--${c.key}`))?.from;
        gsap.set(corner, { opacity: 0, x: from?.x ?? 0, y: from?.y ?? 0 });
      });
      gsap.set(titleEl, { opacity: 0, y: 10, scale: 0.975 });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 10 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      tl.to(corners, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: 'power3.out',
      });
      tl.to(
        titleEl,
        { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power3.out' },
        '-=0.4'
      );
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.3');
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle]);

  return (
    <div
      ref={rootRef}
      className={`pf-tools-header pf-tools-header-bracket flex w-full flex-col ${toolsHeaderAlignClass(presentation.headerAlignment)} ${toolsHeaderBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <div className="relative inline-block px-3 py-2.5">
        {CORNERS.map((corner) => (
          <span
            key={corner.key}
            className={`pf-tools-bracket-corner pf-tools-bracket-corner--${corner.key} pointer-events-none absolute h-3.5 w-3.5 ${corner.pos}`}
            style={{ borderColor: accent }}
            aria-hidden
          />
        ))}
        <h2
          className={`pf-tools-bracket-title text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${toolsHeaderFontClass(presentation.titleFont, 'title')}`}
          style={{ color: titleColor, ...toolsHeaderFontStyle(presentation.titleFont) }}
        >
          {title}
        </h2>
      </div>
      {subtitle ? (
        <p
          className={`pf-tools-bracket-subtitle mt-4 max-w-xl text-base sm:text-lg ${toolsHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
          style={{ color: subtitleColor, ...toolsHeaderFontStyle(presentation.subtitleFont) }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
