'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fragment, useLayoutEffect, useRef, type ReactNode } from 'react';
import { DEFAULT_STACK_PRESENTATION, type PortfolioStackPresentationSettings } from '@/components/portfolio/portfolio-stack-settings';
import {
  STACK_HEADER_MARGIN_BOTTOM_REM,
  stackHeaderPaletteTokenColor,
  type PortfolioStackHeaderTitleSize,
  type PortfolioStackHeaderTitleWeight,
} from '@/components/portfolio/portfolio-stack-header-settings';
import { usePortfolioHeaderMotionOff } from '@/components/portfolio/portfolio-motion-off';
import { headerElementVisibility } from '@/components/portfolio/portfolio-header-elements';

/** Nearest scrollable ancestor — the Studio preview scrolls inside a nested container, not `window`. */
function scrollParent(el: HTMLElement | null): HTMLElement | undefined {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return undefined;
}

/** Badge wipe states (clip-path), round so the pill keeps its shape while it opens. */
const CLIP_OPEN = 'inset(0% 0% 0% 0% round 999px)';
const CLIP_FROM_LEFT = 'inset(0% 100% 0% 0% round 999px)';
const CLIP_FROM_RIGHT = 'inset(0% 0% 0% 100% round 999px)';

const DEFAULT_BADGE_TEXT = '{count}+ technologies';
const DEFAULT_LEAD_TEXT = 'A curated set of tools I rely on.';

const SIZE_CLASS: Record<PortfolioStackHeaderTitleSize, string> = {
  sm: 'text-[clamp(1.7rem,3.2vw,2.8rem)]',
  md: 'text-[clamp(2.25rem,4.2vw,3.75rem)]',
  lg: 'text-[clamp(2.8rem,5.2vw,4.7rem)]',
  xl: 'text-[clamp(3.4rem,6.2vw,5.6rem)]',
};

/** The badge stays a fixed bold pill — "weight" governs the lead text next to it. */
const LEAD_WEIGHT_CLASS: Record<PortfolioStackHeaderTitleWeight, string> = {
  light: 'font-normal',
  regular: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const ALIGN_CLASS: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const ALIGN_MARGIN: Record<'left' | 'center' | 'right', { marginInlineStart: string; marginInlineEnd: string }> = {
  left: { marginInlineStart: '0', marginInlineEnd: 'auto' },
  center: { marginInlineStart: 'auto', marginInlineEnd: 'auto' },
  right: { marginInlineStart: 'auto', marginInlineEnd: '0' },
};

/**
 * Accent count — a badge (item count) inline with a lead sentence, one
 * flowing line. Badge and lead each have their own color; the line shares
 * one size, and "weight" governs the lead's boldness (the badge stays a
 * fixed bold pill).
 *
 * Motion — its own grammar, unlike Editorial's masked rise or Index's count-up: the badge WIPES open like a
 * highlighter stroke, then the sentence comes into focus word by word (each word un-blurs and settles). It
 * replays on every pass and is direction-aware: scrolling down, the stroke opens from the left and the words
 * resolve from the first; scrolling back up, the stroke opens from the right and the words resolve from the
 * last. Leaving, the words lose focus and drift out the way the page moves, then the stroke wipes away.
 */
export function StackHeaderAccentCountHeader({
  presentation: presentationProp,
  trailing,
  itemCount,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioStackPresentationSettings;
  trailing?: ReactNode;
  itemCount?: number;
}) {
  const presentation = presentationProp ?? DEFAULT_STACK_PRESENTATION;
  const motionOff = usePortfolioHeaderMotionOff();
  const animationEnabled = presentation.headerAnimationEnabled !== false && !motionOff;
  const show = headerElementVisibility(presentation.headerHiddenElements, 'accent-count');
  const align = presentation.headerAccentCountAlignment ?? 'left';
  const lead = show('lead') ? (presentation.headerAccentCountLeadText || DEFAULT_LEAD_TEXT).trim() : '';
  const badgeTemplate = presentation.headerAccentCountBadgeText || DEFAULT_BADGE_TEXT;
  const badgeText = show('badge') ? badgeTemplate.replace('{count}', String(itemCount ?? 0)) : '';
  const badgeColor = stackHeaderPaletteTokenColor(presentation.headerAccentCountBadgeColor ?? 'principal');
  const leadColor = stackHeaderPaletteTokenColor(presentation.headerAccentCountLeadColor ?? 'secondaire');

  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !animationEnabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const badge = section.querySelector<HTMLElement>('[data-stack-header-badge]');
    const words = [...section.querySelectorAll<HTMLElement>('[data-stack-header-word]')];

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        // Hidden until the line first reaches the viewport (set before paint: no flash).
        if (badge) gsap.set(badge, { clipPath: CLIP_FROM_LEFT });
        if (words.length) gsap.set(words, { opacity: 0, filter: 'blur(10px)', y: 12 });

        // dir 1: arriving from below (scrolling down); -1: arriving from above (scrolling up).
        const enter = (dir: 1 | -1) => {
          if (badge) {
            gsap.fromTo(
              badge,
              { clipPath: dir === 1 ? CLIP_FROM_LEFT : CLIP_FROM_RIGHT },
              { clipPath: CLIP_OPEN, duration: 0.85, ease: 'expo.out', overwrite: true }
            );
          }
          if (words.length) {
            gsap.fromTo(
              words,
              { opacity: 0, filter: 'blur(10px)', y: 12 * dir },
              {
                opacity: 1,
                filter: 'blur(0px)',
                y: 0,
                duration: 0.75,
                ease: 'power3.out',
                stagger: { each: 0.045, from: dir === 1 ? 'start' : 'end' },
                delay: badge ? 0.22 : 0,
                overwrite: true,
              }
            );
          }
        };
        // dir 1: out through the top; -1: out through the bottom. Faster than the entrance, words first.
        const leave = (dir: 1 | -1) => {
          if (words.length) {
            gsap.to(words, {
              opacity: 0,
              filter: 'blur(8px)',
              y: -10 * dir,
              duration: 0.42,
              ease: 'power2.in',
              stagger: { each: 0.02, from: dir === 1 ? 'start' : 'end' },
              overwrite: true,
            });
          }
          if (badge) {
            gsap.to(badge, {
              clipPath: dir === 1 ? CLIP_FROM_RIGHT : CLIP_FROM_LEFT,
              duration: 0.5,
              ease: 'expo.in',
              delay: 0.12,
              overwrite: true,
            });
          }
        };

        ScrollTrigger.create({
          trigger: section,
          scroller: scrollParent(section),
          start: 'top 85%',
          end: 'bottom 25%',
          onEnter: () => enter(1),
          onLeave: () => leave(1),
          onEnterBack: () => enter(-1),
          onLeaveBack: () => leave(-1),
        });
      }, section);
    } catch (error) {
      // Never leave the line invisible because the trigger failed to initialise.
      console.error('[StackHeaderAccentCountHeader] motion setup failed', error);
      ctx?.revert();
    }

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[StackHeaderAccentCountHeader] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [animationEnabled, badgeText, lead]);

  const leadWords = lead ? lead.split(/\s+/).filter(Boolean) : [];

  return (
    <div
      ref={sectionRef}
      className={`w-full ${ALIGN_CLASS[align]}`}
      style={{ marginBottom: `${STACK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-stack-header="accent-count"
    >
      <p
        className={`mb-0 max-w-3xl ${SIZE_CLASS[presentation.headerAccentCountSize ?? 'md']}`}
        style={{
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          ...ALIGN_MARGIN[align],
        }}
      >
        {badgeText ? (
          <span
            data-stack-header-badge
            className="inline-block whitespace-nowrap align-baseline font-bold text-white"
            style={{
              padding: '0.1em 0.5em',
              borderRadius: '20px',
              backgroundColor: badgeColor,
              lineHeight: 'inherit',
            }}
          >
            {badgeText}
          </span>
        ) : null}
        {lead ? (
          <span
            data-stack-header-lead
            className={`inline ${LEAD_WEIGHT_CLASS[presentation.headerAccentCountWeight ?? 'regular']}`}
            style={{ color: leadColor }}
          >
            {badgeText ? ' ' : null}
            {/* One inline-block per word so each can come into focus on its own; the spaces stay real text,
                so the sentence still wraps like a sentence. */}
            {leadWords.map((word, index) => (
              <Fragment key={`${word}-${index}`}>
                {index > 0 ? ' ' : null}
                <span data-stack-header-word="" className="inline-block">
                  {word}
                </span>
              </Fragment>
            ))}
          </span>
        ) : null}
      </p>
      {trailing ? <div className="mt-4 shrink-0">{trailing}</div> : null}
    </div>
  );
}
