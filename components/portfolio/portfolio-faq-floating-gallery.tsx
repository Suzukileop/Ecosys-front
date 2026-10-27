'use client';

import { FaqQuestionMarker } from '@/components/portfolio/portfolio-faq-marker';
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

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
/** Rows other than the open one, while an answer is shown: set back but legible: with the 66% resting colour this stays ≥4.5:1 in light mode (~4.7:1). */
const INACTIVE_ROW_OPACITY = 0.88;

export function FaqFloatingGalleryDesign({
  items,
  header,
  fontSizeScale = 1,
}: {
  items: FaqItem[];
  header?: ReactNode;
  /** Multiplies every font-size in this design via `--pf-faq-font-scale` — see the FAQ
   *  General tab's "Font size" control (`faqPremiumFontScale` in portfolio-faq-settings.ts). */
  fontSizeScale?: number;
}) {
  const t = useT();
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Ties each question button to its answer panel (aria-controls) for screen readers.
  const answerIdPrefix = useId();

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
            // clearProps: a leftover transform on a row would trap the answer's fixed mobile sheet inside it.
            gsap.fromTo(batch, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.07, clearProps: 'transform' }),
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
    // On phones the panel is a fixed bottom sheet: it rests on its own inset (no 18px drop) and
    // nothing in the list needs to move.
    const sheet = getComputedStyle(panel).position === 'fixed';
    const restY = sheet ? 0 : 18;
    if (reducedMotion) gsap.set(panel, { opacity: 1, y: 0, scale: 1 });
    else gsap.fromTo(panel, { opacity: 0, y: restY - 4, scale: 0.985 }, { opacity: 1, y: restY, scale: 1, duration: 0.75, ease: 'back.out(1.4)' });
    if (sheet) return;

    // The glass panel is absolutely positioned from this row's own top
    // edge downward, so only rows *below* it need real clearance — and
    // exactly as much as the panel is tall, or their text would still
    // peek out from underneath it. Rows above never overlap the panel;
    // they only get a small decorative push for symmetry.
    requestAnimationFrame(() => {
      const clearance = panel.offsetHeight + 32;
      const list = listRef.current;
      // Rows are moved with transforms, which take no room: grow the list by the space the open
      // state really uses, or the pushed rows (and a panel opened on the last row) spill past the
      // section and get clipped by whatever follows it.
      if (list) {
        const natural = list.offsetHeight - (parseFloat(list.style.paddingBottom) || 0);
        const pushedBottom = index < rows.length - 1 ? natural + clearance : 0;
        // The row's top inside the list (offsetTop would be relative to a positioned ancestor).
        const rowTop = rows.slice(0, index).reduce((sum, r) => sum + (r?.offsetHeight ?? 0), 0);
        const panelBottom = rowTop + 18 + panel.offsetHeight + 32;
        const extra = Math.max(0, pushedBottom - natural, panelBottom - natural);
        if (reducedMotion) gsap.set(list, { paddingBottom: extra });
        else gsap.to(list, { paddingBottom: extra, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      }
      rows.forEach((other, i) => {
        if (!other || i === index) return;
        const isBelow = i > index;
        // Recede, but stay readable and clickable: no blur, and an opacity that keeps the
        // resting question colour above 4.5:1 (0.16 + blur left them unreadable).
        const to = { y: isBelow ? clearance : reducedMotion ? 0 : -40, opacity: INACTIVE_ROW_OPACITY };
        if (reducedMotion) gsap.set(other, to);
        else gsap.to(other, { ...to, duration: 1.1, ease: 'elastic.out(1, 0.65)' });
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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rows.forEach((other) => {
      if (!other) return;
      if (reducedMotion) gsap.set(other, { y: 0, opacity: 1, clearProps: 'transform' });
      else gsap.to(other, { y: 0, opacity: 1, duration: 0.9, ease: 'elastic.out(1, 0.7)', clearProps: 'transform' });
    });
    const list = listRef.current;
    if (list) {
      if (reducedMotion) gsap.set(list, { paddingBottom: 0 });
      else gsap.to(list, { paddingBottom: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    }
  }

  if (items.length === 0) return null;

  return (
    <div
      className="pf-faq-gallery w-full"
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}
    >
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
              aria-controls={`${answerIdPrefix}-answer-${index}`}
              onClick={() => handleToggle(index)}
            >
              <span className="pf-faq-lead">
                <FaqQuestionMarker index={index} />
                <span className="pf-faq-gallery-q">{item.question}</span>
              </span>
              <span className="pf-faq-gallery-plus" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div id={`${answerIdPrefix}-answer-${index}`} className="pf-faq-gallery-glass">
              <div className="pf-faq-gallery-glass-head">
                <span className="pf-faq-gallery-eyebrow">{t('Answer /')} {String(index + 1).padStart(2, '0')}</span>
                <button
                  type="button"
                  className="pf-faq-gallery-close"
                  aria-label={t('Close answer')}
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
