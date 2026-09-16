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
 * Terminal — a small "$" prompt blinks in, then the title wipes on in mechanical
 * steps (stepped clip-path reveal, not a smooth ease) as if being typed to a screen,
 * and the subtitle appears as command output with a live blinking caret at the end.
 * Defaults fully revealed so reduced-motion viewers see the final state immediately.
 */
export function ToolsTerminalHeader({ title, subtitle, presentation }: ToolsHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleColor = presentation.titleColor?.trim() || '#171717';
  const subtitleColor = presentation.subtitleColor?.trim() || '#737373';
  const accent = presentation.levelAccentColor?.trim() || titleColor;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const prompt = root.querySelector<HTMLElement>('.pf-tools-terminal-prompt');
    const promptCursor = root.querySelector<HTMLElement>('.pf-tools-terminal-prompt-cursor');
    const titleWrap = root.querySelector<HTMLElement>('.pf-tools-terminal-titlewrap');
    const subtitleEl = root.querySelector<HTMLElement>('.pf-tools-terminal-subtitle');
    const trailingCaret = root.querySelector<HTMLElement>('.pf-tools-terminal-caret');
    if (!titleWrap) return;

    const ctx = gsap.context(() => {
      // Hide immediately (pre-paint) — the prompt blinks in first, the title wipes on
      // in mechanical steps, then output text appears with a live trailing caret.
      if (prompt) gsap.set(prompt, { opacity: 0 });
      gsap.set(titleWrap, { clipPath: 'inset(0 100% 0 0)' });
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 10 });
      if (trailingCaret) gsap.set(trailingCaret, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
      if (prompt) tl.to(prompt, { opacity: 1, duration: 0.2, ease: 'none' });
      if (promptCursor) {
        tl.to(
          promptCursor,
          { opacity: 0, duration: 0.4, repeat: 3, yoyo: true, ease: 'steps(1)' },
          '<'
        );
      }
      tl.to(
        titleWrap,
        { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'steps(20)' },
        '+=0.15'
      );
      if (subtitleEl) {
        tl.to(subtitleEl, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.1');
      }
      if (trailingCaret) {
        tl.to(trailingCaret, { opacity: 1, duration: 0.01 }).to(trailingCaret, {
          opacity: 0,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'steps(1)',
        });
      }
    }, root);

    return () => ctx.revert();
  }, [title, subtitle]);

  return (
    <div
      ref={rootRef}
      className={`pf-tools-header pf-tools-header-terminal flex w-full flex-col ${toolsHeaderAlignClass(presentation.headerAlignment)} ${toolsHeaderBottomSpacingClass(presentation.headerBottomSpacing)}`}
    >
      <div
        className="pf-tools-terminal-prompt mb-2 flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.22em]"
        style={{ color: accent }}
        aria-hidden
      >
        <span>$</span>
        <span className="pf-tools-terminal-prompt-cursor inline-block h-3 w-[7px]" style={{ backgroundColor: accent }} />
      </div>
      <div className="pf-tools-terminal-titlewrap relative inline-block">
        <h2
          className={`text-4xl font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-5xl lg:text-6xl ${toolsHeaderFontClass(presentation.titleFont, 'title')}`}
          style={{ color: titleColor, ...toolsHeaderFontStyle(presentation.titleFont) }}
        >
          {title}
        </h2>
      </div>
      {subtitle ? (
        <p
          className={`pf-tools-terminal-subtitle mt-4 flex max-w-xl items-baseline gap-2 text-base sm:text-lg ${toolsHeaderFontClass(presentation.subtitleFont, 'subtitle')}`}
          style={{ color: subtitleColor, ...toolsHeaderFontStyle(presentation.subtitleFont) }}
        >
          <span className="font-mono text-[0.85em]" style={{ color: accent }} aria-hidden>
            &gt;
          </span>
          <span>{subtitle}</span>
          <span
            className="pf-tools-terminal-caret inline-block h-[1em] w-[2px] shrink-0 translate-y-[2px]"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
        </p>
      ) : null}
    </div>
  );
}
