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

const MOSAIC_COLUMNS = 4;
const MOSAIC_ROWS = 2;
const MOSAIC_CELLS = Array.from({ length: MOSAIC_COLUMNS * MOSAIC_ROWS });

/** Opacity ramp for the small 2x2 mark's four tiles — one full-strength "live" tile,
 *  three fading fainter, so it reads as a tile mid-resolve rather than a flat swatch. */
const MOSAIC_MARK_OPACITY = [1, 0.55, 0.32, 0.18];

/**
 * Mosaic reveal — a small 2x2 pixel/tile glyph sits beside the title as the design's
 * permanent static signature, while a larger grid of accent-colored tiles covers the
 * title itself and clears in a staggered diagonal wave (like a loading grid resolving)
 * on scroll-enter. Defaults fully cleared so reduced-motion viewers see the title
 * immediately.
 */
export function ToolsMosaicHeader({ title, subtitle, presentation }: ToolsHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const accent = presentation.levelAccentColor?.trim() || titleColor;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const markEl = root.querySelector<HTMLElement>('.pf-tools-mosaic-mark');
    const cells = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.pf-tools-mosaic-cell'));
    const titleEl = root.querySelector<HTMLElement>('.pf-tools-mosaic-title');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-tools-mosaic-subtitle');
    if (cells.length === 0 || !titleEl) return;

    const ctx = gsap.context(() => {
      // Cover the title with opaque tiles immediately (pre-paint) — only the clear
      // wave is scroll-gated, so the title never flashes visible-then-covered. The
      // small mark glyph pops in first, like a preview of the tile grid to come.
      if (markEl) gsap.set(markEl, { opacity: 0, scale: 0.5 });
      gsap.set(cells, { opacity: 1, scale: 1 });
      gsap.set(titleEl, { opacity: 0.6, scale: 1.015 });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 12 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      if (markEl) {
        tl.to(markEl, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.6)' });
      }
      tl.to(
        cells,
        {
          opacity: 0,
          scale: 0.15,
          duration: 0.5,
          ease: 'power2.in',
          stagger: { amount: 0.55, grid: [MOSAIC_ROWS, MOSAIC_COLUMNS], from: 'start' },
        },
        markEl ? '-=0.1' : 0
      );
      tl.to(titleEl, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, '-=0.7');
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.25');
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle]);

  return (
    <div
      ref={rootRef}
      className={`pf-tools-header pf-tools-header-mosaic flex w-full flex-col ${toolsHeaderAlignClass(presentation.headerAlignment)} ${toolsHeaderBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <div
        className="pf-tools-mosaic-mark mb-3 grid h-[18px] w-[18px] grid-cols-2 gap-[3px]"
        aria-hidden
      >
        {MOSAIC_MARK_OPACITY.map((opacity, index) => (
          <span key={index} style={{ backgroundColor: accent, opacity }} />
        ))}
      </div>
      <div className="relative inline-block">
        <h2
          className={`pf-tools-mosaic-title text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${toolsHeaderFontClass(presentation.titleFont, 'title')}`}
          style={{ color: titleColor, ...toolsHeaderFontStyle(presentation.titleFont) }}
        >
          {title}
        </h2>
        <div
          className="pointer-events-none absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${MOSAIC_COLUMNS}, 1fr)`, gridTemplateRows: `repeat(${MOSAIC_ROWS}, 1fr)` }}
          aria-hidden
        >
          {MOSAIC_CELLS.map((_, index) => (
            <span key={index} className="pf-tools-mosaic-cell" style={{ backgroundColor: accent }} />
          ))}
        </div>
      </div>
      {subtitle ? (
        <p
          className={`pf-tools-mosaic-subtitle mt-4 max-w-xl text-base sm:text-lg ${toolsHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
          style={{ color: subtitleColor, ...toolsHeaderFontStyle(presentation.subtitleFont) }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
