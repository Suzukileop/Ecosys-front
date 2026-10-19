'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FaqItem } from '@/types/profile';

/** Star Scroll: a section-bound rotating mark above calm, always-readable FAQ rows. */
export function FaqStarScrollDesign({
  items, header, activeColorMode = 'light', fontSizeScale = 1,
}: {
  items: FaqItem[];
  header?: ReactNode;
  activeColorMode?: 'light' | 'dark';
  fontSizeScale?: number;
}) {
  const [openId, setOpenId] = useState<FaqItem['id'] | null>(null);
  const idPrefix = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    const star = starRef.current;
    if (!root || !star) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(star, { rotation: -18 }, {
        rotation: 72, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    });
    return () => media.revert();
  }, [items.length]);
  if (items.length === 0) return null;

  return (
    <div ref={rootRef} className="pf-faq-star w-full" data-pf-faq-mode={activeColorMode}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}>
      <div className="pf-faq-star-head">
        {header && <div className="pf-faq-star-title">{header}</div>}
        <div className="pf-faq-star-mark" ref={starRef} aria-hidden="true" data-pf-no-color-transition>
          <svg viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,2 57,32 84,16 68,43 98,50 68,57 84,84 57,68 50,98 43,68 16,84 32,57 2,50 32,43 16,16 43,32" />
          </svg>
        </div>
      </div>
      <div className="pf-faq-star-list">
        {items.map((item, index) => {
          const open = openId === item.id;
          const questionId = `${idPrefix}-question-${index}`;
          const answerId = `${idPrefix}-answer-${index}`;
          return (
            <div key={item.id} className={`pf-faq-star-row${open ? ' is-open' : ''}`}
              data-pf-no-color-transition>
              <button id={questionId} type="button" className="pf-faq-star-trigger"
                aria-expanded={open} aria-controls={answerId}
                onClick={() => setOpenId(current => current === item.id ? null : item.id)}>
                <span className="pf-faq-star-q" data-pf-no-color-transition>{item.question}</span>
                <span className="pf-faq-star-icon" aria-hidden="true" data-pf-no-color-transition>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div id={answerId} className="pf-faq-star-panel" role="region"
                aria-labelledby={questionId} aria-hidden={!open} inert={!open} data-pf-no-color-transition>
                <div className="pf-faq-star-panel-clip">
                  <div className="pf-faq-star-panel-inner">
                    <p className="pf-faq-star-answer">{item.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
