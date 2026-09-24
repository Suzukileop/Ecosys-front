'use client';

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/ecosystem';

/**
 * Tri Grid — the sixth deliberately un-templated FAQ design (see also
 * `FaqKineticSplitDesign`, `FaqFloatingGalleryDesign`, `FaqEditorialMasonryDesign`,
 * `FaqPrismCardsDesign`, `FaqStarScrollDesign`). No icons, no boxes, no
 * borders — three columns of plain question/answer pairs separated only by
 * whitespace, the center column offset down to break the grid's symmetry.
 * On scroll the three columns drift at slightly different parallax speeds
 * (the center column laziest), and every block fades in through a
 * translateY mask on entrance, 50ms apart. There is no accordion here — the
 * answer sits directly under its question; the only interaction is the
 * hover-driven depth-of-field focus.
 *
 * Follows the section's resolved light/dark mode (like `FaqPrismCardsDesign`
 * / `FaqStarScrollDesign`) via `[data-pf-faq-mode]` in globals.css — a pure
 * `#ffffff` stage in light mode, pure `#000000` in dark mode, with every
 * color transitioning `.5s ease` so a mode flip crossfades.
 */
export function FaqTriGridDesign({
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
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const maskRefs = useRef<(HTMLDivElement | null)[]>([]);

  const desktopInteractive = () =>
    window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)').matches;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const blocks = blockRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const masks = maskRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    // Animate the mask's *inner* content, never the mask wrapper itself —
    // the wrapper's own box defines this block's height in normal flow, so
    // transforming it (instead of its child) would permanently displace it
    // from where document flow expects it, overlapping the block after it.
    const innerEls = masks
      .map((mask) => mask.querySelector<HTMLElement>('.pf-faq-tri-mask-inner'))
      .filter((el): el is HTMLElement => Boolean(el));

    let entranceCtx: gsap.Context | undefined;
    if (!reducedMotion && blocks.length > 0) {
      entranceCtx = gsap.context(() => {
        gsap.set(innerEls, { yPercent: 100 });
        ScrollTrigger.batch(blocks, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => {
            const targets = batch
              .map((el) => el.querySelector<HTMLElement>('.pf-faq-tri-mask-inner'))
              .filter((el): el is HTMLElement => Boolean(el));
            gsap.to(targets, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.05 });
          },
        });
      }, root);
    } else {
      gsap.set(innerEls, { yPercent: 0 });
    }

    // Asymmetric parallax — the center column drifts slower than the two
    // side columns, giving a lightly three-dimensional floating feel.
    // Disabled below 768px per spec ("désactive … le parallaxe").
    const wideEnough = window.matchMedia('(min-width: 769px)').matches;
    const parallaxTriggers: ScrollTrigger[] = [];
    if (wideEnough && !reducedMotion) {
      const speeds = [-60, -30, -60];
      colRefs.current.forEach((col, i) => {
        if (!col) return;
        const trigger = ScrollTrigger.create({
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
          onUpdate: (self) => {
            gsap.set(col, { y: self.progress * speeds[i % speeds.length] });
          },
        });
        parallaxTriggers.push(trigger);
      });
    }

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      parallaxTriggers.forEach((t) => t.kill());
      entranceCtx?.revert();
    };
  }, [items.length]);

  const handleEnter = (index: number) => {
    if (!desktopInteractive()) return;
    const blocks = blockRefs.current;
    const hovered = blocks[index];
    if (!hovered) return;
    gsap.to(hovered, { opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' });
    const q = hovered.querySelector<HTMLElement>('.pf-faq-tri-q');
    if (q) gsap.to(q, { color: 'var(--pft-ink)', duration: 0.35, ease: 'power2.out' });
    blocks.forEach((block, i) => {
      if (i === index || !block) return;
      gsap.to(block, { opacity: 0.1, filter: 'blur(2px)', duration: 0.4, ease: 'power2.out' });
    });
  };

  const handleLeave = () => {
    if (!desktopInteractive()) return;
    blockRefs.current.forEach((block) => {
      if (!block) return;
      gsap.to(block, { opacity: 0.78, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' });
      const q = block.querySelector<HTMLElement>('.pf-faq-tri-q');
      if (q) gsap.to(q, { color: 'var(--pft-muted)', duration: 0.4, ease: 'power2.out' });
    });
  };

  if (items.length === 0) return null;

  const columns: { item: FaqItem; index: number }[][] = [[], [], []];
  items.forEach((item, index) => columns[index % 3].push({ item, index }));

  return (
    <div
      ref={rootRef}
      className="pf-faq-tri w-full"
      data-pf-faq-mode={activeColorMode === 'dark' ? 'dark' : 'light'}
      onMouseLeave={handleLeave}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}
    >
      <div className="pf-faq-tri-head">{header}</div>
      <div className="pf-faq-tri-grid">
        {columns.map((col, colIndex) => (
          <div
            key={colIndex}
            className={`pf-faq-tri-col${colIndex === 1 ? ' pf-faq-tri-col--offset' : ''}`}
            ref={(node) => {
              colRefs.current[colIndex] = node;
            }}
          >
            {col.map(({ item, index }) => (
              <div
                key={item.id}
                className="pf-faq-tri-block"
                ref={(node) => {
                  blockRefs.current[index] = node;
                }}
                onMouseEnter={() => handleEnter(index)}
              >
                <div
                  className="pf-faq-tri-mask"
                  ref={(node) => {
                    maskRefs.current[index] = node;
                  }}
                >
                  <div className="pf-faq-tri-mask-inner">
                    <p className="pf-faq-tri-q">{item.question}</p>
                    <p className="pf-faq-tri-a">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
