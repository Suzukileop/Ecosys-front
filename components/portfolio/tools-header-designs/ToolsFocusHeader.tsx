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

/**
 * Focus pull — a lens/aperture mark racks into place while the title itself starts
 * soft (blurred, scaled up, tracking wide) and settles into sharp focus on scroll-enter,
 * like a camera locking onto its subject. The aperture glyph is the design's permanent
 * static signature — it stays visible at rest, not just during the reveal. Defaults to
 * the sharp/settled state so a no-JS or reduced-motion viewer never sees a blurred title.
 */
export function ToolsFocusHeader({ title, subtitle, presentation }: ToolsHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const accent = presentation.levelAccentColor?.trim() || titleColor;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const markEl = root.querySelector<HTMLElement>('.pf-tools-focus-mark');
    const titleEl = root.querySelector<HTMLElement>('.pf-tools-focus-title');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-tools-focus-subtitle');
    if (!titleEl) return;

    const ctx = gsap.context(() => {
      // Soft + scaled-up + slightly loosened tracking (pre-paint) — only the rack-into-
      // focus tween is scroll-gated, so the title never flashes sharp-then-blurred. The
      // aperture glyph racks in alongside it (a small counter-rotation, like it's
      // physically turning to pull focus) then stays put as the design's static mark.
      if (markEl) gsap.set(markEl, { opacity: 0, scale: 0.7, rotate: -24 });
      gsap.set(titleEl, {
        filter: 'blur(16px)',
        opacity: 0.32,
        scale: 1.045,
        letterSpacing: '0.012em',
      });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 12 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      if (markEl) {
        tl.to(markEl, { opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: 'power3.out' });
      }
      tl.to(
        titleEl,
        {
          filter: 'blur(0px)',
          opacity: 1,
          scale: 1,
          letterSpacing: '0em',
          duration: 1.05,
          ease: 'power3.out',
        },
        markEl ? '-=0.55' : 0
      );
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.42');
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle]);

  return (
    <div
      ref={rootRef}
      className={`pf-tools-header pf-tools-header-focus flex w-full flex-col ${toolsHeaderAlignClass(presentation.headerAlignment)} ${toolsHeaderBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <span className="pf-tools-focus-mark mb-3 inline-flex h-6 w-6" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <circle cx="12" cy="12" r="8.4" stroke={accent} strokeWidth="1.4" />
          <circle cx="12" cy="12" r="2.8" stroke={accent} strokeWidth="1.4" />
          <line x1="12" y1="1.4" x2="12" y2="4.4" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="12" y1="19.6" x2="12" y2="22.6" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="1.4" y1="12" x2="4.4" y2="12" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="19.6" y1="12" x2="22.6" y2="12" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      <h2
        className={`pf-tools-focus-title text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] will-change-[filter,transform,opacity] sm:text-5xl lg:text-6xl ${toolsHeaderFontClass(presentation.titleFont, 'title')}`}
        style={{ color: titleColor, ...toolsHeaderFontStyle(presentation.titleFont) }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`pf-tools-focus-subtitle mt-4 max-w-xl text-base sm:text-lg ${toolsHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
          style={{ color: subtitleColor, ...toolsHeaderFontStyle(presentation.subtitleFont) }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
