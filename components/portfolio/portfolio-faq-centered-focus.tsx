'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/ecosystem';

/**
 * Centered Focus — the eighth deliberately un-templated FAQ design (see also
 * `FaqKineticSplitDesign`, `FaqFloatingGalleryDesign`, `FaqEditorialMasonryDesign`,
 * `FaqPrismCardsDesign`, `FaqStarScrollDesign`, `FaqTriGridDesign`,
 * `FaqSplitIndexDesign`). No rule under the title, no dividers between
 * questions — a single centered column where every question sits at a
 * faint opacity .2 until hovered, at which point it snaps to full contrast
 * and a gentle `scale(1.05)`, while every sibling melts further to opacity
 * .08 with a hair of blur. Opening springs the answer's height open and
 * reveals it as real rendered lines rising out of a mask, 30ms apart.
 *
 * Follows the section's resolved light/dark mode (like `FaqPrismCardsDesign`
 * / `FaqStarScrollDesign`) via `[data-pf-faq-mode]` in globals.css — pure
 * white stage in light mode, pure black in dark mode, every color
 * transitioning `.5s ease` so a mode flip crossfades.
 */
export function FaqCenteredFocusDesign({
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
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answerRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const desktopInteractive = () =>
    window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rows = rowRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (rows.length === 0) return;
    if (reducedMotion) {
      // The design's premise rests every question at opacity .2 until
      // hovered — fine for pointer users, but a reduced-motion visitor may
      // never trigger that reveal, so give them a readable floor instead.
      gsap.set(rows, { opacity: 0.6 });
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(rows, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(batch, { y: 16, opacity: 0 }, { y: 0, opacity: 0.2, duration: 0.7, ease: 'power3.out', stagger: 0.05 }),
      });
      const refreshId = window.setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('[ScrollTrigger] deferred refresh() failed', error);
        }
      }, 90);
      return () => window.clearTimeout(refreshId);
    }, list);

    return () => ctx.revert();
  }, [items.length]);

  const handleEnter = (index: number) => {
    if (!desktopInteractive()) return;
    const rows = rowRefs.current;
    const hovered = rows[index];
    if (!hovered) return;
    gsap.to(hovered, {
      opacity: 1,
      scale: 1.05,
      filter: 'blur(0px)',
      duration: 0.5,
      ease: 'back.out(1.6)',
    });
    const q = hovered.querySelector<HTMLElement>('.pf-faq-focus-q');
    // `--pff-q` / `--pff-q-rest` already fold in General → Text colors (see globals.css).
    if (q) gsap.to(q, { color: 'var(--pff-q)', duration: 0.3, ease: 'power2.out' });
    rows.forEach((row, i) => {
      if (i === index || !row || row.classList.contains('is-open')) return;
      gsap.to(row, { opacity: 0.08, scale: 1, filter: 'blur(1.5px)', duration: 0.45, ease: 'power2.out' });
    });
  };

  const handleLeave = (index: number) => {
    if (!desktopInteractive()) return;
    const rows = rowRefs.current;
    rows.forEach((row, i) => {
      if (!row) return;
      const isOpen = row.classList.contains('is-open');
      gsap.to(row, {
        opacity: isOpen ? 1 : 0.2,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'power2.out',
      });
      if (i === index) {
        const q = row.querySelector<HTMLElement>('.pf-faq-focus-q');
        if (q && !isOpen) gsap.to(q, { color: 'var(--pff-q-rest)', duration: 0.4, ease: 'power2.out' });
      }
    });
  };

  const handleToggle = (index: number) => {
    if (openIndex !== null && openIndex !== index) closeRow(openIndex);
    if (openIndex === index) {
      closeRow(index);
      setOpenIndex(null);
    } else {
      openRow(index);
      setOpenIndex(index);
    }
  };

  function openRow(index: number) {
    const row = rowRefs.current[index];
    const panel = panelRefs.current[index];
    const answerEl = answerRefs.current[index];
    if (!row || !panel || !answerEl) return;
    row.classList.add('is-open');
    row.querySelector('.pf-faq-focus-trigger')?.setAttribute('aria-expanded', 'true');
    gsap.to(row, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' });
    const q = row.querySelector<HTMLElement>('.pf-faq-focus-q');
    if (q) gsap.to(q, { color: 'var(--pff-q)', duration: 0.3, ease: 'power2.out' });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      gsap.set(panel, { height: 'auto' });
      return;
    }

    gsap.set(panel, { height: 'auto' });
    const target = panel.offsetHeight;
    gsap.fromTo(panel, { height: 0 }, { height: target, duration: 0.85, ease: 'power3.out' });

    const lines = buildMaskedLines(answerEl);
    gsap.set(lines, { yPercent: 100 });
    gsap.to(lines, { yPercent: 0, duration: 0.65, ease: 'power3.out', stagger: 0.03, delay: 0.1 });
  }

  function closeRow(index: number) {
    const row = rowRefs.current[index];
    if (!row || !row.classList.contains('is-open')) return;
    row.classList.remove('is-open');
    row.querySelector('.pf-faq-focus-trigger')?.setAttribute('aria-expanded', 'false');
    const panel = panelRefs.current[index];
    if (panel) gsap.to(panel, { height: 0, duration: 0.45, ease: 'power3.inOut' });
    gsap.to(row, { opacity: 0.2, duration: 0.45, ease: 'power2.out' });
    const q = row.querySelector<HTMLElement>('.pf-faq-focus-q');
    if (q) gsap.to(q, { color: 'var(--pff-q-rest)', duration: 0.4, ease: 'power2.out' });
  }

  if (items.length === 0) return null;

  return (
    <div
      className="pf-faq-focus w-full"
      data-pf-faq-mode={activeColorMode === 'dark' ? 'dark' : 'light'}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}
    >
      <div className="pf-faq-focus-head">{header}</div>
      <div className="pf-faq-focus-list" ref={listRef}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="pf-faq-focus-row"
            ref={(node) => {
              rowRefs.current[index] = node;
            }}
          >
            <button
              type="button"
              className="pf-faq-focus-trigger"
              aria-expanded={openIndex === index}
              onMouseEnter={() => handleEnter(index)}
              onMouseLeave={() => handleLeave(index)}
              onClick={() => handleToggle(index)}
            >
              <span className="pf-faq-focus-q">{item.question}</span>
            </button>
            <div
              className="pf-faq-focus-panel"
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
            >
              <div className="pf-faq-focus-panel-inner">
                <p
                  className="pf-faq-focus-answer"
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
 * Line-accurate text reveal — same technique as the sibling FAQ designs,
 * duplicated rather than shared since each is a deliberately self-contained
 * file.
 */
function buildMaskedLines(el: HTMLElement): HTMLElement[] {
  const words = el.textContent?.trim().split(/\s+/) ?? [];
  el.innerHTML = words.map((w) => `<span class="pff-word">${w}</span>`).join(' ');
  const wordEls = Array.from(el.querySelectorAll<HTMLElement>('.pff-word'));

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
    mask.className = 'pf-faq-focus-line-mask';
    const inner = document.createElement('span');
    inner.className = 'pf-faq-focus-line-inner';
    inner.textContent = lineWords.join(' ');
    mask.appendChild(inner);
    el.appendChild(mask);
    el.appendChild(document.createTextNode(' '));
  });
  return Array.from(el.querySelectorAll<HTMLElement>('.pf-faq-focus-line-inner'));
}
