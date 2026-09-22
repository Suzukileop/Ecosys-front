'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/ecosystem';

/**
 * Kinetic Split — one of two deliberately un-templated FAQ designs (the
 * other is `FaqFloatingGalleryDesign`). Fixed left column (this section's
 * own Header block) + a right-hand question list with zero boxes: hover
 * sharpens the hovered question into a large serif display weight while
 * every sibling melts toward the void (opacity .1 + a hair of blur), and
 * opening a question springs its answer in with a true line-by-line mask
 * reveal, measured from the browser's own line breaks — not a fixed
 * character count, so it holds up at any column width.
 *
 * Deliberately monochrome (see the `.pf-faq-kinetic-*` rules in
 * globals.css) — this design does not read `accentColor`/`questionColor`/
 * `answerColor` from the section palette. The contrast-through-whitespace
 * premise is the point; adapting it to an arbitrary accent would dilute it.
 * It does track the site's own Global → Theme light/dark toggle, though —
 * the stage/text tokens resolve from `--pf-palette-fond`/
 * `--pf-palette-texte-fort` in CSS, so no prop is needed here for that.
 */
export function FaqKineticSplitDesign({
  items,
  header,
}: {
  items: FaqItem[];
  header?: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const answerRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rows = itemRefs.current.filter((el): el is HTMLLIElement => Boolean(el));
    if (reducedMotion || rows.length === 0) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(rows, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 0.82, duration: 0.8, ease: 'power3.out', stagger: 0.06 }
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

  const desktopInteractive = () =>
    window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches;

  const handleEnter = (index: number) => {
    if (!desktopInteractive()) return;
    const rows = itemRefs.current;
    const hovered = rows[index];
    if (!hovered) return;
    const text = hovered.querySelector<HTMLElement>('.pf-faq-kinetic-text');
    if (text) gsap.to(text, { x: -14, duration: 0.55, ease: 'power3.out' });
    rows.forEach((row, i) => {
      if (i === index || row?.classList.contains('is-open')) return;
      const trigger = row?.querySelector<HTMLElement>('.pf-faq-kinetic-trigger');
      if (trigger) gsap.to(trigger, { opacity: 0.1, filter: 'blur(1.5px)', duration: 0.5, ease: 'power3.out' });
    });
  };

  const handleLeave = (index: number) => {
    if (!desktopInteractive()) return;
    const rows = itemRefs.current;
    const hovered = rows[index];
    const text = hovered?.querySelector<HTMLElement>('.pf-faq-kinetic-text');
    if (text) gsap.to(text, { x: 0, duration: 0.6, ease: 'power3.out' });
    rows.forEach((row) => {
      if (row?.classList.contains('is-open')) return;
      const trigger = row?.querySelector<HTMLElement>('.pf-faq-kinetic-trigger');
      if (trigger) gsap.to(trigger, { opacity: 0.82, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' });
    });
  };

  const handleToggle = (index: number) => {
    const row = itemRefs.current[index];
    if (!row) return;
    const wasOpen = openIndex === index;

    // Close whichever row is currently open (single-open, like the other
    // ready-made FAQ designs).
    if (openIndex !== null && openIndex !== index) closeRow(openIndex);

    if (wasOpen) {
      closeRow(index);
      setOpenIndex(null);
    } else {
      openRow(index);
      setOpenIndex(index);
    }
  };

  function openRow(index: number) {
    const row = itemRefs.current[index];
    const answerEl = answerRefs.current[index];
    if (!row || !answerEl) return;
    row.classList.add('is-open');
    const trigger = row.querySelector<HTMLElement>('.pf-faq-kinetic-trigger');
    const text = trigger?.querySelector<HTMLElement>('.pf-faq-kinetic-text');
    const panel = row.querySelector<HTMLElement>('.pf-faq-kinetic-panel');
    trigger?.setAttribute('aria-expanded', 'true');
    if (!text || !panel) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      panel.style.height = 'auto';
      text.style.fontSize = '1.9rem';
      return;
    }

    gsap.set(text, { fontSize: '1.9rem' });
    gsap.set(panel, { height: 'auto' });
    const target = panel.offsetHeight;
    gsap.fromTo(panel, { height: 0 }, { height: target, duration: 1, ease: 'elastic.out(1, 0.78)' });

    const lines = buildMaskedLines(answerEl);
    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, { yPercent: 0, duration: 0.85, ease: 'power4.out', stagger: 0.055, delay: 0.18 });
  }

  function closeRow(index: number) {
    const row = itemRefs.current[index];
    if (!row || !row.classList.contains('is-open')) return;
    row.classList.remove('is-open');
    const trigger = row.querySelector<HTMLElement>('.pf-faq-kinetic-trigger');
    const text = trigger?.querySelector<HTMLElement>('.pf-faq-kinetic-text');
    const panel = row.querySelector<HTMLElement>('.pf-faq-kinetic-panel');
    trigger?.setAttribute('aria-expanded', 'false');
    if (text) gsap.to(text, { fontSize: '1.05rem', duration: 0.5, ease: 'power2.out' });
    if (panel) gsap.to(panel, { height: 0, duration: 0.5, ease: 'power3.inOut' });
  }

  if (items.length === 0) return null;

  return (
    <div ref={rootRef} className="pf-faq-kinetic w-full px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
      <div className="pf-faq-kinetic-grid">
        <div className="pf-faq-kinetic-left">{header}</div>
        <ul className="pf-faq-kinetic-list" ref={listRef} role="list">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="pf-faq-kinetic-item"
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
            >
              <button
                type="button"
                className="pf-faq-kinetic-trigger"
                aria-expanded={openIndex === index}
                onMouseEnter={() => handleEnter(index)}
                onMouseLeave={() => handleLeave(index)}
                onClick={() => handleToggle(index)}
              >
                <span className="pf-faq-kinetic-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="pf-faq-kinetic-text" data-pf-no-color-transition="">
                  {item.question}
                </span>
              </button>
              <div className="pf-faq-kinetic-panel">
                <div className="pf-faq-kinetic-panel-inner">
                  <p
                    className="pf-faq-kinetic-answer"
                    ref={(node) => {
                      answerRefs.current[index] = node;
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Line-accurate text reveal: wraps every word, buckets words into their
 * rendered lines by comparing `offsetTop`, then rebuilds the paragraph as
 * one overflow-hidden mask per real line. Adapts to any column width —
 * no fixed character count guessed up front.
 */
function buildMaskedLines(el: HTMLElement): HTMLElement[] {
  const words = el.textContent?.trim().split(/\s+/) ?? [];
  el.innerHTML = words.map((w) => `<span class="pfk-word">${w}</span>`).join(' ');
  const wordEls = Array.from(el.querySelectorAll<HTMLElement>('.pfk-word'));

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
    mask.className = 'pf-faq-kinetic-line-mask';
    const inner = document.createElement('span');
    inner.className = 'pf-faq-kinetic-line-inner';
    inner.textContent = lineWords.join(' ');
    mask.appendChild(inner);
    el.appendChild(mask);
    el.appendChild(document.createTextNode(' '));
  });
  return Array.from(el.querySelectorAll<HTMLElement>('.pf-faq-kinetic-line-inner'));
}
