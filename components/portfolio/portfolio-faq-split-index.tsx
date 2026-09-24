'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/ecosystem';

/**
 * Split Index — the seventh deliberately un-templated FAQ design (see also
 * `FaqKineticSplitDesign`, `FaqFloatingGalleryDesign`, `FaqEditorialMasonryDesign`,
 * `FaqPrismCardsDesign`, `FaqStarScrollDesign`, `FaqTriGridDesign`). A giant
 * "FAQ" title sits above a borderless two-zone row: a narrow index rail on
 * the left, a wide accordion list on the right. Each row carries a small
 * filled index badge (01, 02…), a question, and a hairline "+" — separated
 * from its neighbors only by a 1px rule. Hovering a row pushes its question
 * 8px right into full contrast while every other row melts to opacity .15
 * with a hair of blur; opening rotates the "+" into a "×", springs the row's
 * height open (pushing the rows below with real inertia), and reveals the
 * answer as real rendered lines rising out of a mask.
 *
 * Follows the section's resolved light/dark mode (like `FaqPrismCardsDesign`
 * / `FaqStarScrollDesign`) via `[data-pf-faq-mode]` in globals.css — pure
 * white/cream stage in light mode, pure black in dark mode, every color
 * transitioning `.5s ease` so a mode flip crossfades.
 */
export function FaqSplitIndexDesign({
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
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
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
    if (reducedMotion || rows.length === 0) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(rows, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(batch, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 }),
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
    const q = hovered.querySelector<HTMLElement>('.pf-faq-split-q');
    if (q) gsap.to(q, { x: 8, color: 'var(--pfsi-ink)', duration: 0.45, ease: 'power3.out' });
    rows.forEach((row, i) => {
      if (i === index) return;
      gsap.to(row, { opacity: 0.15, filter: 'blur(1px)', duration: 0.45, ease: 'power3.out' });
    });
  };

  const handleLeave = (index: number) => {
    if (!desktopInteractive()) return;
    const rows = rowRefs.current;
    const hovered = rows[index];
    const q = hovered?.querySelector<HTMLElement>('.pf-faq-split-q');
    if (q) gsap.to(q, { x: 0, color: 'var(--pfsi-muted)', duration: 0.5, ease: 'power3.out' });
    rows.forEach((row) => {
      gsap.to(row, { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' });
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
    const icon = iconRefs.current[index];
    const panel = panelRefs.current[index];
    const answerEl = answerRefs.current[index];
    if (!row || !panel || !answerEl) return;
    row.classList.add('is-open');
    row.querySelector('.pf-faq-split-trigger')?.setAttribute('aria-expanded', 'true');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      if (icon) gsap.set(icon, { rotate: 45 });
      gsap.set(panel, { height: 'auto' });
      return;
    }

    if (icon) gsap.to(icon, { rotate: 45, duration: 0.5, ease: 'back.out(1.7)' });
    gsap.set(panel, { height: 'auto' });
    const target = panel.offsetHeight;
    gsap.fromTo(panel, { height: 0 }, { height: target, duration: 0.85, ease: 'power3.out' });

    const lines = buildMaskedLines(answerEl);
    gsap.set(lines, { yPercent: 100 });
    gsap.to(lines, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.045, delay: 0.12 });
  }

  function closeRow(index: number) {
    const row = rowRefs.current[index];
    if (!row || !row.classList.contains('is-open')) return;
    row.classList.remove('is-open');
    row.querySelector('.pf-faq-split-trigger')?.setAttribute('aria-expanded', 'false');
    const icon = iconRefs.current[index];
    const panel = panelRefs.current[index];
    if (icon) gsap.to(icon, { rotate: 0, duration: 0.4, ease: 'power2.out' });
    if (panel) gsap.to(panel, { height: 0, duration: 0.45, ease: 'power3.inOut' });
  }

  if (items.length === 0) return null;

  return (
    <div
      className="pf-faq-split w-full"
      data-pf-faq-mode={activeColorMode === 'dark' ? 'dark' : 'light'}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}
    >
      <div className="pf-faq-split-head">{header}</div>
      <div className="pf-faq-split-row">
        <div className="pf-faq-split-rail">
          <span className="pf-faq-split-rail-label">Index</span>
        </div>
        <div className="pf-faq-split-list" ref={listRef}>
          {items.map((item, index) => (
            <div
              key={item.id}
              className="pf-faq-split-item"
              ref={(node) => {
                rowRefs.current[index] = node;
              }}
            >
              <button
                type="button"
                className="pf-faq-split-trigger"
                aria-expanded={openIndex === index}
                onMouseEnter={() => handleEnter(index)}
                onMouseLeave={() => handleLeave(index)}
                onClick={() => handleToggle(index)}
              >
                <span className="pf-faq-split-badge">{String(index + 1).padStart(2, '0')}</span>
                <span className="pf-faq-split-q">{item.question}</span>
                <span
                  className="pf-faq-split-icon"
                  aria-hidden="true"
                  ref={(node) => {
                    iconRefs.current[index] = node;
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div
                className="pf-faq-split-panel"
                ref={(node) => {
                  panelRefs.current[index] = node;
                }}
              >
                <div className="pf-faq-split-panel-inner">
                  <p
                    className="pf-faq-split-answer"
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
  el.innerHTML = words.map((w) => `<span class="pfsi-word">${w}</span>`).join(' ');
  const wordEls = Array.from(el.querySelectorAll<HTMLElement>('.pfsi-word'));

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
    mask.className = 'pf-faq-split-line-mask';
    const inner = document.createElement('span');
    inner.className = 'pf-faq-split-line-inner';
    inner.textContent = lineWords.join(' ');
    mask.appendChild(inner);
    el.appendChild(mask);
    el.appendChild(document.createTextNode(' '));
  });
  return Array.from(el.querySelectorAll<HTMLElement>('.pf-faq-split-line-inner'));
}
