'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import {
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import type { PortfolioStackPresentationSettings } from '@/components/portfolio/portfolio-stack-settings';
import {
  resolveStackTagsContentAlignment,
  resolveStackTagsSize,
  stackTagsChipClass,
  stackTagsListClass,
} from '@/components/portfolio/portfolio-stack-settings';
import type { PortfolioToolsCardGap, PortfolioToolsContentAlignment } from '@/components/portfolio/portfolio-tools-settings';

function stackTagsJustifyClass(alignment: PortfolioToolsContentAlignment): string {
  switch (alignment) {
    case 'right':
      return 'justify-end';
    case 'center':
      return 'justify-center';
    default:
      return 'justify-start';
  }
}

function stackTagsGapClass(gap: PortfolioToolsCardGap): string {
  switch (gap) {
    case 'medium':
      return 'gap-3 sm:gap-3.5';
    case 'large':
      return 'gap-3.5 sm:gap-4';
    case 'xlarge':
      return 'gap-4 sm:gap-5';
    default:
      return 'gap-2.5 sm:gap-3';
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

function stackTagsScrollParent(el: HTMLElement | null): HTMLElement | undefined {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return undefined;
}

export function EditorialStackTags({
  items,
  presentation,
}: {
  items: PortfolioSkillRef[];
  presentation: PortfolioStackPresentationSettings;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const names = items.map(resolveSkillName).map((name) => name.trim()).filter(Boolean);
  const contentAlignment = resolveStackTagsContentAlignment(presentation);
  const accent = presentation.levelAccentColor;
  const chipBg = presentation.chipBackgroundColor;
  const chipText = presentation.chipTextColor;
  const tagSize = resolveStackTagsSize(presentation.stackTagsSize);
  const namesKey = names.join('\u001f');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || namesKey.length === 0) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = stackTagsScrollParent(root);
    const chips = [...root.querySelectorAll<HTMLElement>('.pf-stack-tags-chip')].filter(isLaidOut);
    if (chips.length === 0) return;

    const ctx = gsap.context(() => {
      // Hide immediately (pre-paint) so chips never flash at their static/visible
      // state before ScrollTrigger fires — only the reveal is scroll-gated.
      gsap.set(chips, { opacity: 0, y: 10 });

      // Trigger per chip (not blindly on mount) — this design previously animated
      // as soon as it mounted, regardless of scroll position, so on a section that
      // starts off-screen the reveal played out before it was ever visible.
      ScrollTrigger.batch(chips, {
        start: 'top 94%',
        once: true,
        ...(scroller ? { scroller } : {}),
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.62,
            stagger: 0.07,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        },
      });
    }, root);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [namesKey]);

  if (names.length === 0) {
    return null;
  }

  const rootStyle = {
    '--pf-stack-tags-ink': chipText,
    '--pf-stack-tags-fill': chipBg,
    '--pf-stack-tags-accent': accent,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className="pf-stack-tags flex w-full max-w-none flex-col"
      data-size={tagSize}
      data-content-align={contentAlignment}
      style={rootStyle}
    >
      <ul
        className={`pf-stack-tags-list ${stackTagsListClass(tagSize)} flex w-full max-w-none list-none flex-wrap p-0 ${stackTagsGapClass(presentation.cardGap)} ${stackTagsJustifyClass(contentAlignment)}`}
        aria-label="Stack"
      >
        {names.map((name, index) => (
          <li
            key={`${name}-${String(index)}`}
            className={`pf-stack-tags-chip ${stackTagsChipClass(tagSize)}`}
            data-pf-no-color-transition=""
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
