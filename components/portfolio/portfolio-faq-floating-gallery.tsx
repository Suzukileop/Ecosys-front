'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/ecosystem';

/**
 * Floating Gallery — the second of two deliberately un-templated FAQ
 * designs (the other is `FaqKineticSplitDesign`). A pure vertical list;
 * opening a question surfaces a frosted-glass floating panel over the
 * list while every other row is pushed cleanly toward the nearer viewport
 * edge with a springy, inertial ease — the clearance is measured from the
 * panel's real rendered height, not guessed, so nothing overlaps.
 *
 * Deliberately monochrome (see `.pf-faq-gallery-*` in globals.css) — same
 * reasoning as `FaqKineticSplitDesign`: not adapted to the section's
 * accent palette. It does track the site's own Global → Theme light/dark
 * toggle, though — the stage/text tokens resolve from
 * `--pf-palette-fond`/`--pf-palette-texte-fort` in CSS, so no prop is
 * needed here for that.
 */
export function FaqFloatingGalleryDesign({
  items,
  header,
}: {
  items: FaqItem[];
  header?: ReactNode;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Entrance (scroll-triggered).
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rows = rowRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    let ctx: gsap.Context | undefined;
    if (!reducedMotion && rows.length > 0) {
      ctx = gsap.context(() => {
        ScrollTrigger.batch(rows, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(batch, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.07 }),
        });
      }, list);
    }

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
      ctx?.revert();
    };
  }, [items.length]);

  const handleToggle = (index: number) => {
    const rows = rowRefs.current;
    const row = rows[index];
    if (!row) return;

    if (openIndex === index) {
      closeRow(index);
      setOpenIndex(null);
      return;
    }
    if (openIndex !== null) closeRow(openIndex);
    setOpenIndex(index);
    openRow(index);
  };

  function openRow(index: number) {
    const rows = rowRefs.current;
    const row = rows[index];
    if (!row) return;
    row.classList.add('is-open');
    row.querySelector('.pf-faq-gallery-trigger')?.setAttribute('aria-expanded', 'true');
    const panel = row.querySelector<HTMLElement>('.pf-faq-gallery-glass');
    if (!panel) return;
    panel.classList.add('is-visible');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      gsap.set(panel, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.fromTo(panel, { opacity: 0, y: 14, scale: 0.985 }, { opacity: 1, y: 18, scale: 1, duration: 0.75, ease: 'back.out(1.4)' });

    // The glass panel is absolutely positioned from this row's own top
    // edge downward, so only rows *below* it need real clearance — and
    // exactly as much as the panel is tall, or their text would still
    // peek out from underneath it. Rows above never overlap the panel;
    // they only get a small decorative push for symmetry.
    requestAnimationFrame(() => {
      const clearance = panel.offsetHeight + 32;
      rows.forEach((other, i) => {
        if (!other || i === index) return;
        const isBelow = i > index;
        gsap.to(other, {
          y: isBelow ? clearance : -40,
          opacity: 0.16,
          filter: 'blur(1px)',
          duration: 1.1,
          ease: 'elastic.out(1, 0.65)',
        });
      });
    });
  }

  function closeRow(index: number) {
    const rows = rowRefs.current;
    const row = rows[index];
    if (!row || !row.classList.contains('is-open')) return;
    row.classList.remove('is-open');
    row.querySelector('.pf-faq-gallery-trigger')?.setAttribute('aria-expanded', 'false');
    const panel = row.querySelector<HTMLElement>('.pf-faq-gallery-glass');
    if (panel) {
      gsap.to(panel, {
        opacity: 0,
        y: 10,
        scale: 0.98,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => panel.classList.remove('is-visible'),
      });
    }
    rows.forEach((other) => {
      if (!other) return;
      gsap.to(other, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'elastic.out(1, 0.7)' });
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="pf-faq-gallery w-full px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
      <div className="pf-faq-gallery-head">{header}</div>
      <div className="pf-faq-gallery-list" ref={listRef}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="pf-faq-gallery-row"
            ref={(node) => {
              rowRefs.current[index] = node;
            }}
          >
            <button
              type="button"
              className="pf-faq-gallery-trigger"
              aria-expanded={openIndex === index}
              onClick={() => handleToggle(index)}
            >
              <span className="pf-faq-gallery-q">{item.question}</span>
              <span className="pf-faq-gallery-plus" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div className="pf-faq-gallery-glass">
              <div className="pf-faq-gallery-glass-head">
                <span className="pf-faq-gallery-eyebrow">Answer / {String(index + 1).padStart(2, '0')}</span>
                <button
                  type="button"
                  className="pf-faq-gallery-close"
                  aria-label="Close answer"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeRow(index);
                    setOpenIndex((current) => (current === index ? null : current));
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
