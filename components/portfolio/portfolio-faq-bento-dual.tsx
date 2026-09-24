'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/ecosystem';
import type {
  PortfolioFaqBentoDualCardBorder,
  PortfolioFaqBentoDualCardRadius,
} from '@/components/portfolio/portfolio-faq-settings';

const CARD_RADIUS_PX: Record<PortfolioFaqBentoDualCardRadius, string> = {
  sm: '12px',
  md: '22px',
  lg: '30px',
  xl: '40px',
};

/** `none` zeroes the border width; `soft` keeps the CSS default (a subtle
 *  color-mix tint blended into the card); `solid` widens it and swaps to a
 *  crisper, higher-contrast tint of the card's own ink. */
const CARD_BORDER_WIDTH_PX: Record<PortfolioFaqBentoDualCardBorder, string> = {
  none: '0px',
  soft: '1px',
  solid: '1.5px',
};

/**
 * Bento Dual — the ninth deliberately un-templated FAQ design (see also
 * `FaqKineticSplitDesign`, `FaqFloatingGalleryDesign`, `FaqEditorialMasonryDesign`,
 * `FaqPrismCardsDesign`, `FaqStarScrollDesign`, `FaqTriGridDesign`,
 * `FaqSplitIndexDesign`, `FaqCenteredFocusDesign`). A bento grid of vividly
 * colored cards, each hiding a second, contrasting "answer" background
 * behind its question — hovering slides the question layer up and out
 * while the answer layer slides up from below to fully replace it, its text
 * revealing line-by-line. The active card also tilts gently toward the
 * cursor (a soft 3D lag, max 5°). Below 768px the tilt and mouse-tracking
 * disappear; a tap flips the card instead of a hover.
 *
 * Follows the section's resolved light/dark mode (like `FaqPrismCardsDesign`
 * / `FaqStarScrollDesign`) via `[data-pf-faq-mode]` in globals.css — the
 * neutral stage flips white/black, and the card fill itself is driven by
 * `cardColor` (the resolved hex of whichever palette token the "Layout"
 * settings picked — Principal/Secondary/Neutral/Muted, replacing the old
 * hardcoded/"raw" Secondary-only fill), applied in both modes, all
 * transitioning `.5s ease`.
 */
export function FaqBentoDualDesign({
  items,
  header,
  activeColorMode = 'light',
  cardColor,
  cardRadius = 'md',
  cardBorder = 'soft',
  cardOpacity = 100,
  fontSizeScale = 1,
}: {
  items: FaqItem[];
  header?: ReactNode;
  /** Section's resolved light/dark mode (Global → Theme, or this section's own override). */
  activeColorMode?: 'light' | 'dark';
  /** Resolved hex of the settings-picked palette token (Principal/Secondary/Neutral/Muted)
   *  — overrides the card's fixed default fill via inline custom-property, in both
   *  light and dark mode, so the card stays wired to the portfolio's real theme. */
  cardColor?: string;
  cardRadius?: PortfolioFaqBentoDualCardRadius;
  cardBorder?: PortfolioFaqBentoDualCardBorder;
  /** 0–100 — blended via `color-mix` against the section background, not raw CSS
   *  `opacity`, so the question/answer text layers stay fully legible at any value. */
  cardOpacity?: number;
  /** Multiplies every font-size in this design via `--pf-faq-font-scale` — see the FAQ
   *  General tab's "Font size" control (`faqPremiumFontScale` in portfolio-faq-settings.ts). */
  fontSizeScale?: number;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const layerARefs = useRef<(HTMLDivElement | null)[]>([]);
  const layerBRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answerRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  const desktopInteractive = () =>
    window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches;

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    gsap.registerPlugin(ScrollTrigger);
    // Prime GSAP's own transform cache with plain pixel `y` for both layers
    // instead of leaving their position to the CSS-only `transform:
    // translateY(100%)` they start with — reading a percentage-based
    // transform back out for a later `y`/`yPercent` tween proved unreliable
    // (the very first flip silently no-op'd on layer B), so every flip
    // below also re-measures and uses plain pixels.
    const layerAEls = layerARefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const layerBEls = layerBRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    gsap.set(layerAEls, { y: 0 });
    layerBEls.forEach((el) => gsap.set(el, { y: el.offsetHeight }));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (reducedMotion || cards.length === 0) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(cards, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(batch, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', stagger: 0.06 }),
      });
      const refreshId = window.setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('[ScrollTrigger] deferred refresh() failed', error);
        }
      }, 90);
      return () => window.clearTimeout(refreshId);
    }, grid);

    return () => ctx.revert();
  }, [items.length]);

  const revealAnswer = (index: number) => {
    const answerEl = answerRefs.current[index];
    if (!answerEl || answerEl.dataset.revealed === 'true') return;
    answerEl.dataset.revealed = 'true';
    const lines = buildMaskedLines(answerEl);
    gsap.set(lines, { yPercent: 100, opacity: 0 });
    gsap.to(lines, { yPercent: 0, opacity: 1, duration: 0.55, ease: 'power2.out', stagger: 0.03 });
  };

  const flipOpen = (index: number) => {
    const layerA = layerARefs.current[index];
    const layerB = layerBRefs.current[index];
    // Plain pixel `y`, not `yPercent` — measured fresh from the card's own
    // rendered height every time, since both layers are `position: absolute;
    // inset: 0` overlays of identical size.
    const height = layerA?.offsetHeight || layerB?.offsetHeight || 0;
    if (layerA) gsap.to(layerA, { y: -height, duration: 0.55, ease: 'power3.inOut' });
    if (layerB) gsap.to(layerB, { y: 0, duration: 0.55, ease: 'power3.inOut' });
    revealAnswer(index);
  };

  const flipClose = (index: number) => {
    const layerA = layerARefs.current[index];
    const layerB = layerBRefs.current[index];
    const height = layerA?.offsetHeight || layerB?.offsetHeight || 0;
    if (layerA) gsap.to(layerA, { y: 0, duration: 0.5, ease: 'power3.inOut' });
    if (layerB) gsap.to(layerB, { y: height, duration: 0.5, ease: 'power3.inOut' });
  };

  const handleEnter = (index: number) => {
    if (!desktopInteractive()) return;
    flipOpen(index);
  };

  const handleMove = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (!desktopInteractive()) return;
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateX: py * -10,
      rotateY: px * 10,
      duration: 0.6,
      ease: 'power3.out',
      transformPerspective: 800,
    });
  };

  const handleLeave = (index: number) => {
    if (!desktopInteractive()) return;
    flipClose(index);
    const card = cardRefs.current[index];
    if (card) gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
  };

  const handleTap = (index: number) => {
    if (desktopInteractive()) return;
    if (flippedIndex === index) {
      flipClose(index);
      setFlippedIndex(null);
      return;
    }
    if (flippedIndex !== null) flipClose(flippedIndex);
    flipOpen(index);
    setFlippedIndex(index);
  };

  if (items.length === 0) return null;

  const cardStyle: CSSProperties = {
    '--pfbd-radius': CARD_RADIUS_PX[cardRadius],
    '--pfbd-border-width': CARD_BORDER_WIDTH_PX[cardBorder],
    '--pfbd-card-opacity': `${Math.min(100, Math.max(0, cardOpacity))}%`,
    '--pf-faq-font-scale': fontSizeScale,
    ...(cardColor ? { '--pfbd-card': cardColor } : null),
    ...(cardBorder === 'solid'
      ? { '--pfbd-border': 'color-mix(in srgb, var(--pfbd-card-ink) 35%, var(--pfbd-card))' }
      : null),
  } as CSSProperties;

  return (
    <div
      className="pf-faq-bento w-full"
      data-pf-faq-mode={activeColorMode === 'dark' ? 'dark' : 'light'}
      style={cardStyle}
    >
      <div className="pf-faq-bento-head">{header}</div>
      <div className="pf-faq-bento-grid" ref={gridRef}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="pf-faq-bento-card"
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            onMouseEnter={() => handleEnter(index)}
            onMouseMove={(event) => handleMove(index, event)}
            onMouseLeave={() => handleLeave(index)}
            onClick={() => handleTap(index)}
            role="button"
            tabIndex={0}
          >
            <div
              className="pf-faq-bento-layer pf-faq-bento-layer-a"
              ref={(node) => {
                layerARefs.current[index] = node;
              }}
            >
              <p className="pf-faq-bento-q">{item.question}</p>
            </div>
            <div
              className="pf-faq-bento-layer pf-faq-bento-layer-b"
              ref={(node) => {
                layerBRefs.current[index] = node;
              }}
            >
              <p
                className="pf-faq-bento-a"
                ref={(node) => {
                  answerRefs.current[index] = node;
                }}
              >
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Line-accurate text reveal — same technique as the sibling FAQ designs,
 * duplicated rather than shared since each is a deliberately self-contained
 * file.
 */
function buildMaskedLines(el: HTMLElement): HTMLElement[] {
  const words = el.textContent?.trim().split(/\s+/) ?? [];
  el.innerHTML = words.map((w) => `<span class="pfbd-word">${w}</span>`).join(' ');
  const wordEls = Array.from(el.querySelectorAll<HTMLElement>('.pfbd-word'));

  const lines: string[][] = [];
  let currentTop: number | null = null;
  let current: string[] = [];
  wordEls.forEach((w) => {
    const top = w.offsetTop;
    if (currentTop === null || Math.abs(top - currentTop) < 2) {
      current.push(w.textContent ?? '');
      currentTop = top;
    } else {
      lines.push(current);
      current = [w.textContent ?? ''];
      currentTop = top;
    }
  });
  if (current.length) lines.push(current);

  el.innerHTML = '';
  lines.forEach((lineWords) => {
    const mask = document.createElement('span');
    mask.className = 'pf-faq-bento-line-mask';
    const inner = document.createElement('span');
    inner.className = 'pf-faq-bento-line-inner';
    inner.textContent = lineWords.join(' ');
    mask.appendChild(inner);
    el.appendChild(mask);
    el.appendChild(document.createTextNode(' '));
  });
  return Array.from(el.querySelectorAll<HTMLElement>('.pf-faq-bento-line-inner'));
}
