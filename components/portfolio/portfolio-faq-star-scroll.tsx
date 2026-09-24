'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/ecosystem';

/**
 * Star Scroll — the fifth deliberately un-templated FAQ design (see also
 * `FaqKineticSplitDesign`, `FaqFloatingGalleryDesign`, `FaqEditorialMasonryDesign`,
 * `FaqPrismCardsDesign`). A giant asymmetric title sits top-left, an 8-point
 * geometric star sits top-right and spins continuously and slowly, driven by
 * how far the *whole page* has scrolled (not just this section) — a lazy,
 * ambient rotation rather than a snap-to-scroll-position effect. Below,
 * plain rounded bars almost melt into the stage; hovering one lifts it to a
 * faint highlight while every other bar drops to opacity .15. Opening a
 * question rotates its "+" 45° into a "×", springs the bar's height open,
 * then reveals the answer as real rendered lines rising out of a
 * `translateY` mask, 30ms apart.
 *
 * Like `FaqPrismCardsDesign`, this design follows the section's resolved
 * light/dark mode instead of staying a fixed identity: the neutral
 * stage/card/text tokens swap via `[data-pf-faq-mode]` in globals.css (deep
 * black stage + near-melted-in cards + pure white ink in dark mode; paper
 * white stage + ultra-subtle light-grey cards + deep-black ink in light
 * mode), driven by the `activeColorMode` prop below — which resolves this
 * section's own colorModeOverride pin, not just the Global toggle. Every
 * such color also carries `transition: … .5s ease` so a mode flip
 * crossfades instead of snapping.
 */
export function FaqStarScrollDesign({
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
  const rootRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const answerRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const desktopInteractive = () =>
    window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches;

  // Entrance (scroll-triggered per row) + the star's own continuous,
  // whole-page-scroll-driven rotation.
  useLayoutEffect(() => {
    const list = listRef.current;
    const star = starRef.current;
    if (!list) return;
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rows = rowRefs.current.filter((el): el is HTMLDivElement => Boolean(el));

    let entranceCtx: gsap.Context | undefined;
    if (!reducedMotion && rows.length > 0) {
      entranceCtx = gsap.context(() => {
        ScrollTrigger.batch(rows, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(batch, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 }),
        });
      }, list);
    }

    // Below 768px the star stays static — "disable complex scroll rotation
    // on small screens" per spec — a plain matchMedia gate, not a resize
    // listener, since a phone won't cross that boundary mid-session.
    const wideEnough = window.matchMedia('(min-width: 769px)').matches;
    let starTrigger: ScrollTrigger | undefined;
    if (star && wideEnough && !reducedMotion) {
      starTrigger = ScrollTrigger.create({
        start: 0,
        end: () => Math.max(document.documentElement.scrollHeight - window.innerHeight, 1),
        scrub: 0.6,
        onUpdate: (self) => {
          gsap.set(star, { rotate: self.progress * 900 });
        },
      });
    }

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // See the sibling FAQ designs — a best-effort refresh must never
        // throw past this deferred callback and take down the page.
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      starTrigger?.kill();
      entranceCtx?.revert();
    };
  }, [items.length]);

  const handleEnter = (index: number) => {
    if (!desktopInteractive()) return;
    const rows = rowRefs.current;
    const hovered = rows[index];
    if (!hovered) return;
    gsap.to(hovered, { backgroundColor: 'var(--pfs-card-hover)', duration: 0.4, ease: 'power2.out' });
    rows.forEach((row, i) => {
      if (i === index) return;
      gsap.to(row, { opacity: 0.15, duration: 0.4, ease: 'power2.out' });
    });
  };

  const handleLeave = (index: number) => {
    if (!desktopInteractive()) return;
    const rows = rowRefs.current;
    const hovered = rows[index];
    if (hovered && !hovered.classList.contains('is-open')) {
      gsap.to(hovered, { backgroundColor: 'var(--pfs-card)', duration: 0.45, ease: 'power2.out' });
    }
    rows.forEach((row) => {
      gsap.to(row, { opacity: 1, duration: 0.45, ease: 'power2.out' });
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
    row.querySelector('.pf-faq-star-trigger')?.setAttribute('aria-expanded', 'true');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      if (icon) gsap.set(icon, { rotate: 45 });
      gsap.set(row, { backgroundColor: 'var(--pfs-card-hover)' });
      gsap.set(panel, { height: 'auto' });
      return;
    }

    if (icon) gsap.to(icon, { rotate: 45, duration: 0.5, ease: 'back.out(1.7)' });
    gsap.to(row, { backgroundColor: 'var(--pfs-card-hover)', duration: 0.4, ease: 'power2.out' });

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
    row.querySelector('.pf-faq-star-trigger')?.setAttribute('aria-expanded', 'false');
    const icon = iconRefs.current[index];
    const panel = panelRefs.current[index];
    if (icon) gsap.to(icon, { rotate: 0, duration: 0.4, ease: 'power2.out' });
    gsap.to(row, { backgroundColor: 'var(--pfs-card)', duration: 0.45, ease: 'power2.out' });
    if (panel) gsap.to(panel, { height: 0, duration: 0.45, ease: 'power3.inOut' });
  }

  if (items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="pf-faq-star w-full"
      data-pf-faq-mode={activeColorMode === 'dark' ? 'dark' : 'light'}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}
    >
      <div className="pf-faq-star-head">
        <div className="pf-faq-star-title">{header}</div>
        <div className="pf-faq-star-mark" ref={starRef} aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <polygon points={EIGHT_POINT_STAR} />
          </svg>
        </div>
      </div>
      <div className="pf-faq-star-list" ref={listRef} role="list">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="pf-faq-star-row"
            ref={(node) => {
              rowRefs.current[index] = node;
            }}
          >
            <button
              type="button"
              className="pf-faq-star-trigger"
              aria-expanded={openIndex === index}
              onMouseEnter={() => handleEnter(index)}
              onMouseLeave={() => handleLeave(index)}
              onClick={() => handleToggle(index)}
            >
              <span className="pf-faq-star-q">{item.question}</span>
              <span
                className="pf-faq-star-icon"
                aria-hidden="true"
                ref={(node) => {
                  iconRefs.current[index] = node;
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1v16M1 9h16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div
              className="pf-faq-star-panel"
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
            >
              <div className="pf-faq-star-panel-inner">
                <p
                  className="pf-faq-star-answer"
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

/** 8-point sparkle star as an SVG polygon — 16 vertices alternating outer/inner radius, no icon library. */
function eightPointStarPolygon(cx: number, cy: number, outerR: number, innerR: number): string {
  const points: string[] = [];
  const step = Math.PI / 8;
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + i * step;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(' ');
}
const EIGHT_POINT_STAR = eightPointStarPolygon(50, 50, 48, 19);

/**
 * Line-accurate text reveal: wraps every word, buckets words into their
 * rendered lines by comparing `offsetTop`, then rebuilds the paragraph as
 * one overflow-hidden mask per real line. Same technique as the sibling FAQ
 * designs, duplicated rather than shared — each is a deliberately
 * self-contained file.
 */
function buildMaskedLines(el: HTMLElement): HTMLElement[] {
  const words = el.textContent?.trim().split(/\s+/) ?? [];
  el.innerHTML = words.map((w) => `<span class="pfs-word">${w}</span>`).join(' ');
  const wordEls = Array.from(el.querySelectorAll<HTMLElement>('.pfs-word'));

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
    mask.className = 'pf-faq-star-line-mask';
    const inner = document.createElement('span');
    inner.className = 'pf-faq-star-line-inner';
    inner.textContent = lineWords.join(' ');
    mask.appendChild(inner);
    el.appendChild(mask);
    el.appendChild(document.createTextNode(' '));
  });
  return Array.from(el.querySelectorAll<HTMLElement>('.pf-faq-star-line-inner'));
}
