'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { DEFAULT_CONTACT_PRESENTATION, type PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';
import {
  CONTACT_HEADER_MARGIN_BOTTOM_REM,
  contactHeaderPaletteTokenColor,
  type PortfolioContactHeaderTitleSize,
} from '@/components/portfolio/portfolio-contact-header-settings';

/** Nearest scrollable ancestor — ScrollTrigger needs this explicitly inside an
 *  embedded/iframe dashboard preview, where `window` isn't the real scroller. */
function contactHeaderScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

// Two short default words — a user who hasn't touched any of the 4 word
// fields yet still sees a live band. As soon as any field is filled in,
// only the filled slots show (each is independently droppable).
const DEFAULT_WORD_1 = 'Say';
const DEFAULT_WORD_2 = 'Hello';
const MARQUEE_REPEATS = 4;
const MARQUEE_SPEED_PX = 44; // Experience's "medium" default
const MARQUEE_GAP = '1rem'; // "md" default

const WORD_SIZE: Record<PortfolioContactHeaderTitleSize, string> = {
  sm: 'clamp(1.9rem, 4.6vw, 3.4rem)',
  md: 'clamp(2.35rem, 5.6vw, 4.35rem)',
  lg: 'clamp(2.8rem, 6.6vw, 5.3rem)',
  xl: 'clamp(3.3rem, 7.6vw, 6.3rem)',
};

function ContactHeaderMarqueeTrack({
  words,
  ink,
  fontSize,
  hidden = false,
}: {
  words: string[];
  ink: string;
  fontSize: string;
  hidden?: boolean;
}) {
  const sequence = Array.from({ length: MARQUEE_REPEATS }, () => words).flat();
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {sequence.map((word, index) => {
        const outline = index % 2 === 1;
        return (
          <span key={`${word}-${index}`} className="flex shrink-0 items-center" style={{ gap: MARQUEE_GAP, paddingRight: MARQUEE_GAP }}>
            <span
              className="whitespace-nowrap uppercase leading-none"
              style={{
                fontSize,
                fontWeight: 400,
                letterSpacing: '-0.04em',
                ...(outline
                  ? { color: 'transparent', WebkitTextFillColor: 'transparent', WebkitTextStroke: `1px ${ink}` }
                  : { color: ink, opacity: 0.85 }),
              }}
            >
              {word}
            </span>
            <span aria-hidden className="h-[0.55rem] w-[0.55rem] shrink-0 rounded-full" style={{ backgroundColor: ink }} />
          </span>
        );
      })}
    </div>
  );
}

/**
 * Marquee — exact disposition + motion copy of Portfolio/Work's Marquee header
 * (`WorkMarqueeHeader`): an infinite, kinetic band of the header's own
 * dedicated words (independent of the section title), alternating
 * fill/outline, looping via a GSAP tween that slows to a stop on hover. On
 * scroll the whole band drifts up and fades.
 */
export function ContactHeaderMarqueeHeader({
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioContactPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_CONTACT_PRESENTATION;
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const rawWords = [
    presentation.headerMarqueeWord1Text,
    presentation.headerMarqueeWord2Text,
    presentation.headerMarqueeWord3Text,
    presentation.headerMarqueeWord4Text,
  ].map((word) => (word ?? '').trim());
  const anyWordProvided = rawWords.some(Boolean);
  const displayWords = anyWordProvided ? rawWords.filter(Boolean) : [DEFAULT_WORD_1, DEFAULT_WORD_2];
  const wordsKey = displayWords.join('|');
  const ink = contactHeaderPaletteTokenColor(presentation.headerMarqueeWordColor ?? 'principal');
  const fontSize = WORD_SIZE[presentation.headerMarqueeSize ?? 'md'];

  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const root = rootRef.current;
    const row = rowRef.current;
    if (!root || !row) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !animationEnabled) return;

    gsap.registerPlugin(ScrollTrigger);

    let loop: ReturnType<typeof gsap.to> | null = null;

    const buildLoop = () => {
      const first = row.firstElementChild as HTMLElement | null;
      const wrapWidth = first?.offsetWidth ?? 0;
      if (wrapWidth < 8) return;
      loop?.kill();
      gsap.set(row, { x: -wrapWidth });
      loop = gsap.to(row, { x: 0, duration: Math.max(12, wrapWidth / MARQUEE_SPEED_PX), ease: 'none', repeat: -1 });
    };

    const scroller = contactHeaderScrollParent(root);

    const ctx = gsap.context(() => {
      buildLoop();
      gsap.fromTo(
        root,
        { y: 0, opacity: 1 },
        {
          y: -18,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: root, scroller, start: 'top 16%', end: 'top -22%', scrub: 0.5, invalidateOnRefresh: true },
        }
      );
    }, root);

    const onEnter = () => {
      if (loop) gsap.to(loop, { timeScale: 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
    };
    const onLeave = () => {
      if (loop) gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
    };
    root.addEventListener('mouseenter', onEnter);
    root.addEventListener('mouseleave', onLeave);

    const resize = new ResizeObserver(() => {
      buildLoop();
      ScrollTrigger.refresh();
    });
    resize.observe(row);

    void document.fonts?.ready?.then(() => {
      buildLoop();
      ScrollTrigger.refresh();
    });

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // GSAP's ScrollTrigger.refresh() can throw internally on an edge case
        // (e.g. "Cannot read properties of undefined (reading 'end')") during
        // its own init-time recompute; uncaught, that crash propagates up
        // through this deferred setTimeout with no React boundary to catch it
        // and takes down the whole page. Never let a best-effort refresh do that.
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      root.removeEventListener('mouseenter', onEnter);
      root.removeEventListener('mouseleave', onLeave);
      resize.disconnect();
      loop?.kill();
      ctx.revert();
    };
  }, [animationEnabled, wordsKey, fontSize]);

  return (
    <div
      className="w-full"
      style={{ marginBottom: `${CONTACT_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-contact-header="marquee"
    >
      <div
        ref={rootRef}
        className="w-full overflow-hidden"
        style={{
          padding: '1.35rem 0 1.5rem',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)',
        }}
      >
        <div ref={rowRef} className="flex w-max whitespace-nowrap will-change-transform">
          <ContactHeaderMarqueeTrack words={displayWords} ink={ink} fontSize={fontSize} />
          <ContactHeaderMarqueeTrack words={displayWords} ink={ink} fontSize={fontSize} hidden />
        </div>
      </div>
      {trailing ? <div className="mt-4">{trailing}</div> : null}
    </div>
  );
}
