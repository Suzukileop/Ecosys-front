'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/ecosystem';

/**
 * Prism Cards — the fourth deliberately un-templated FAQ design (see also
 * `FaqKineticSplitDesign`, `FaqFloatingGalleryDesign`, `FaqEditorialMasonryDesign`).
 * Big premium accordion cards on a soft neutral stage: the active card
 * liquid-fades from pure white to a deep violet/electric-blue fill — driven
 * by an expanding radial mask seeded at the click/tap point, not a flat
 * color swap — while its question, answer and "+" badge invert to white in
 * sync. Every sibling card dims to reduce visual noise around the open one.
 * Opening springs the card's height open (elastic ease, so the cards below
 * feel pushed with real inertia) and reveals the answer with a masked
 * line-by-line rise, 40ms apart.
 *
 * Unlike the other three (deliberately fixed-identity, ignore both palette
 * and light/dark mode), Prism Cards follows the section's resolved light/dark
 * mode — the neutral stage/card/text tokens swap via `[data-pf-faq-mode]` in
 * globals.css, while the violet-electric active fill stays the same signature
 * color in both (it already reads fine on either surface).
 */
export function FaqPrismCardsDesign({
  items,
  header,
  activeColorMode = 'light',
  fontSizeScale = 1,
}: {
  items: FaqItem[];
  header?: ReactNode;
  /** Section's resolved light/dark mode (Global → Theme, or this section's own override). */
  activeColorMode?: 'light' | 'dark';
  /** Multiplies every font-size in this design via `--pf-faq-font-scale` — see the FAQ
   *  General tab's "Font size" control (`faqPremiumFontScale` in portfolio-faq-settings.ts). */
  fontSizeScale?: number;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const iconBarRefs = useRef<(SVGLineElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answerRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const desktopInteractive = () =>
    window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches;
  const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    gsap.registerPlugin(ScrollTrigger);
    const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (reducedMotion() || cards.length === 0) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(cards, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', stagger: 0.07 }
          ),
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
      return () => window.clearTimeout(refreshId);
    }, list);

    return () => ctx.revert();
  }, [items.length]);

  const dimSiblings = (activeIndex: number | null) => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const target = activeIndex === null || i === activeIndex ? 1 : 0.6;
      gsap.to(card, { opacity: target, duration: 0.5, ease: 'power2.out' });
    });
  };

  const handleEnter = (index: number) => {
    if (!desktopInteractive() || openIndex !== null) return;
    const card = cardRefs.current[index];
    if (card) gsap.to(card, { y: -3, duration: 0.4, ease: 'power2.out' });
  };

  const handleLeave = (index: number) => {
    if (!desktopInteractive()) return;
    const card = cardRefs.current[index];
    if (card && openIndex !== index) gsap.to(card, { y: 0, duration: 0.45, ease: 'power2.out' });
  };

  const handleToggle = (index: number, origin: { xPercent: number; yPercent: number }) => {
    const wasOpen = openIndex === index;
    if (openIndex !== null && openIndex !== index) closeRow(openIndex);

    if (wasOpen) {
      closeRow(index);
      setOpenIndex(null);
      dimSiblings(null);
    } else {
      openRow(index, origin);
      setOpenIndex(index);
      dimSiblings(index);
    }
  };

  function openRow(index: number, origin: { xPercent: number; yPercent: number }) {
    const card = cardRefs.current[index];
    const fill = fillRefs.current[index];
    const icon = iconRefs.current[index];
    const bar = iconBarRefs.current[index];
    const panel = panelRefs.current[index];
    const answerEl = answerRefs.current[index];
    if (!card || !panel || !answerEl) return;
    card.classList.add('is-open');
    card.querySelector('.pf-faq-prism-trigger')?.setAttribute('aria-expanded', 'true');
    gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });

    if (reducedMotion()) {
      if (fill) {
        fill.style.clipPath = 'circle(150% at 50% 50%)';
        fill.style.opacity = '1';
      }
      if (icon) gsap.set(icon, { rotate: 180 });
      if (bar) gsap.set(bar, { scaleY: 0 });
      gsap.set(panel, { height: 'auto' });
      return;
    }

    if (fill) {
      gsap.set(fill, {
        clipPath: `circle(0% at ${origin.xPercent}% ${origin.yPercent}%)`,
        opacity: 1,
      });
      gsap.to(fill, {
        clipPath: `circle(150% at ${origin.xPercent}% ${origin.yPercent}%)`,
        duration: 0.6,
        ease: 'power3.inOut',
      });
    }
    if (icon) gsap.to(icon, { rotate: 180, duration: 0.6, ease: 'back.out(1.6)' });
    if (bar) gsap.to(bar, { scaleY: 0, duration: 0.45, ease: 'power2.inOut', transformOrigin: 'center' });

    gsap.set(panel, { height: 'auto' });
    const target = panel.offsetHeight;
    gsap.fromTo(panel, { height: 0 }, { height: target, duration: 0.95, ease: 'elastic.out(1, 0.8)' });

    const lines = buildMaskedLines(answerEl);
    gsap.set(lines, { yPercent: 100 });
    gsap.to(lines, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.04, delay: 0.16 });

    if (isMobileViewport()) {
      window.setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 260);
    }
  }

  function closeRow(index: number) {
    const card = cardRefs.current[index];
    if (!card || !card.classList.contains('is-open')) return;
    card.classList.remove('is-open');
    card.querySelector('.pf-faq-prism-trigger')?.setAttribute('aria-expanded', 'false');
    const fill = fillRefs.current[index];
    const icon = iconRefs.current[index];
    const bar = iconBarRefs.current[index];
    const panel = panelRefs.current[index];

    if (fill) gsap.to(fill, { opacity: 0, duration: 0.4, ease: 'power2.inOut' });
    if (icon) gsap.to(icon, { rotate: 0, duration: 0.45, ease: 'power2.out' });
    if (bar) gsap.to(bar, { scaleY: 1, duration: 0.4, ease: 'power2.out', transformOrigin: 'center' });
    if (panel) gsap.to(panel, { height: 0, duration: 0.5, ease: 'power3.inOut' });
  }

  if (items.length === 0) return null;

  return (
    <div
      className="pf-faq-prism w-full"
      data-pf-faq-mode={activeColorMode === 'dark' ? 'dark' : 'light'}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}
    >
      {header ? <div className="pf-faq-prism-head">{header}</div> : null}
      <div className="pf-faq-prism-list" ref={listRef}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="pf-faq-prism-card"
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
          >
            <span className="pf-faq-prism-fill" aria-hidden="true" ref={(node) => { fillRefs.current[index] = node; }} />
            <button
              type="button"
              className="pf-faq-prism-trigger"
              aria-expanded={openIndex === index}
              onMouseEnter={() => handleEnter(index)}
              onMouseLeave={() => handleLeave(index)}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const xPercent = rect.width > 0 ? ((event.clientX - rect.left) / rect.width) * 100 : 50;
                const yPercent = rect.height > 0 ? ((event.clientY - rect.top) / rect.height) * 100 : 50;
                handleToggle(index, { xPercent, yPercent });
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  handleToggle(index, { xPercent: 50, yPercent: 50 });
                }
              }}
            >
              <span className="pf-faq-prism-q">{item.question}</span>
              <span
                className="pf-faq-prism-icon"
                aria-hidden="true"
                ref={(node) => {
                  iconRefs.current[index] = node;
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <line x1="9" y1="2.5" x2="9" y2="15.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" ref={(node) => { iconBarRefs.current[index] = node; }} />
                  <line x1="2.5" y1="9" x2="15.5" y2="9" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div
              className="pf-faq-prism-panel"
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
            >
              <div className="pf-faq-prism-panel-inner">
                <p
                  className="pf-faq-prism-answer"
                  ref={(node) => {
                    answerRefs.current[index] = node;
                  }}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Line-accurate text reveal: wraps every word, buckets words into their
 * rendered lines by comparing `offsetTop`, then rebuilds the paragraph as
 * one overflow-hidden mask per real line — adapts to any column width
 * instead of guessing a fixed character count. Same technique as the other
 * three FAQ designs, duplicated rather than shared since each is a
 * deliberately self-contained file.
 */
function buildMaskedLines(el: HTMLElement): HTMLElement[] {
  const words = el.textContent?.trim().split(/\s+/) ?? [];
  el.innerHTML = words.map((w) => `<span class="pfp-word">${w}</span>`).join(' ');
  const wordEls = Array.from(el.querySelectorAll<HTMLElement>('.pfp-word'));

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
    mask.className = 'pf-faq-prism-line-mask';
    const inner = document.createElement('span');
    inner.className = 'pf-faq-prism-line-inner';
    inner.textContent = lineWords.join(' ');
    mask.appendChild(inner);
    el.appendChild(mask);
    el.appendChild(document.createTextNode(' '));
  });
  return Array.from(el.querySelectorAll<HTMLElement>('.pf-faq-prism-line-inner'));
}
