'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/ecosystem';

/**
 * Editorial Masonry — the third deliberately un-templated FAQ design (see
 * also `FaqKineticSplitDesign` and `FaqFloatingGalleryDesign`). An
 * asymmetric two-column editorial grid: the right column starts lower than
 * the left to break the linear grid, hairline dividers only, numbers
 * ticking 01→N across both columns. Hovering a question pulls its text 8px
 * right and to pure ink while every sibling — both columns — sinks to
 * opacity .12 with a hair of blur, radically isolating the active row.
 * Opening a question morphs the "+" into a "×" by rotating it 45°, springs
 * the answer panel open by its own measured height, then reveals the
 * answer line-by-line from a translateY mask, fastest first.
 *
 * Paper/ink stage (see the `.pf-faq-masonry-*` rules in globals.css) that,
 * unlike its two siblings, tracks the site's own Global → Theme light/dark
 * toggle — `--pfm-paper`/`--pfm-ink` resolve from the same
 * `--pf-palette-fond`/`--pf-palette-texte-fort` tokens every other section
 * reads, so it inverts cleanly on mode change instead of staying a fixed
 * white card. It still never reads the section's accent hue — only those
 * two neutral tokens.
 */
export function FaqEditorialMasonryDesign({
  items,
  header,
}: {
  items: FaqItem[];
  header?: ReactNode;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answerRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const desktopInteractive = () =>
    window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches;

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rows = rowRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (reducedMotion || rows.length === 0) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(rows, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(batch, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', stagger: 0.05 }),
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
    }, grid);

    return () => ctx.revert();
  }, [items.length]);

  const handleEnter = (index: number) => {
    if (!desktopInteractive()) return;
    const rows = rowRefs.current;
    const hovered = rows[index];
    if (!hovered) return;
    const text = hovered.querySelector<HTMLElement>('.pf-faq-masonry-q');
    if (text) gsap.to(text, { x: 8, color: 'var(--pfm-ink)', duration: 0.45, ease: 'power3.out' });
    rows.forEach((row, i) => {
      if (i === index) return;
      gsap.to(row, { opacity: 0.12, filter: 'blur(1px)', duration: 0.45, ease: 'power3.out' });
    });
  };

  const handleLeave = (index: number) => {
    if (!desktopInteractive()) return;
    const rows = rowRefs.current;
    const hovered = rows[index];
    const text = hovered?.querySelector<HTMLElement>('.pf-faq-masonry-q');
    if (text) gsap.to(text, { x: 0, color: 'var(--pfm-slate)', duration: 0.5, ease: 'power3.out' });
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
    row.querySelector('.pf-faq-masonry-trigger')?.setAttribute('aria-expanded', 'true');

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
    row.querySelector('.pf-faq-masonry-trigger')?.setAttribute('aria-expanded', 'false');
    const icon = iconRefs.current[index];
    const panel = panelRefs.current[index];
    if (icon) gsap.to(icon, { rotate: 0, duration: 0.4, ease: 'power2.out' });
    if (panel) gsap.to(panel, { height: 0, duration: 0.45, ease: 'power3.inOut' });
  }

  if (items.length === 0) return null;

  const half = Math.ceil(items.length / 2);
  const columns: { item: FaqItem; index: number }[][] = [
    items.slice(0, half).map((item, i) => ({ item, index: i })),
    items.slice(half).map((item, i) => ({ item, index: half + i })),
  ];

  const renderRow = ({ item, index }: { item: FaqItem; index: number }) => (
    <div
      key={item.id}
      className="pf-faq-masonry-row"
      ref={(node) => {
        rowRefs.current[index] = node;
      }}
    >
      <button
        type="button"
        className="pf-faq-masonry-trigger"
        aria-expanded={openIndex === index}
        onMouseEnter={() => handleEnter(index)}
        onMouseLeave={() => handleLeave(index)}
        onClick={() => handleToggle(index)}
      >
        <span className="pf-faq-masonry-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="pf-faq-masonry-q">{item.question}</span>
        <span
          className="pf-faq-masonry-icon"
          aria-hidden="true"
          ref={(node) => {
            iconRefs.current[index] = node;
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <div
        className="pf-faq-masonry-panel"
        ref={(node) => {
          panelRefs.current[index] = node;
        }}
      >
        <div className="pf-faq-masonry-panel-inner">
          <p
            className="pf-faq-masonry-answer"
            ref={(node) => {
              answerRefs.current[index] = node;
            }}
          >
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pf-faq-masonry w-full px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
      <div className="pf-faq-masonry-head">{header}</div>
      <div className="pf-faq-masonry-grid" ref={gridRef}>
        <div className="pf-faq-masonry-col">{columns[0].map(renderRow)}</div>
        <div className="pf-faq-masonry-col pf-faq-masonry-col--right">{columns[1].map(renderRow)}</div>
      </div>
    </div>
  );
}

/**
 * Line-accurate text reveal: wraps every word, buckets words into their
 * rendered lines by comparing `offsetTop`, then rebuilds the paragraph as
 * one overflow-hidden mask per real line — adapts to any column width
 * instead of guessing a fixed character count. Same technique as
 * `FaqKineticSplitDesign`, duplicated rather than shared since each of
 * these three FAQ designs is a deliberately self-contained file.
 */
function buildMaskedLines(el: HTMLElement): HTMLElement[] {
  const words = el.textContent?.trim().split(/\s+/) ?? [];
  el.innerHTML = words.map((w) => `<span class="pfm-word">${w}</span>`).join(' ');
  const wordEls = Array.from(el.querySelectorAll<HTMLElement>('.pfm-word'));

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
    mask.className = 'pf-faq-masonry-line-mask';
    const inner = document.createElement('span');
    inner.className = 'pf-faq-masonry-line-inner';
    inner.textContent = lineWords.join(' ');
    mask.appendChild(inner);
    el.appendChild(mask);
    el.appendChild(document.createTextNode(' '));
  });
  return Array.from(el.querySelectorAll<HTMLElement>('.pf-faq-masonry-line-inner'));
}
