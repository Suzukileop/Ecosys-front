'use client';

import { FaqQuestionMarker } from '@/components/portfolio/portfolio-faq-marker';
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import type { FaqItem } from '@/types/profile';

/** Centered questions with a clear opening affordance and stable, readable neighbours. */
export function FaqCenteredFocusDesign({
  items, header, activeColorMode = 'light', fontSizeScale = 1,
}: {
  items: FaqItem[];
  header?: ReactNode;
  activeColorMode?: 'light' | 'dark';
  fontSizeScale?: number;
}) {
  const [openId, setOpenId] = useState<FaqItem['id'] | null>(null);
  const idPrefix = useId();
  if (items.length === 0) return null;

  return (
    <div className="pf-faq-focus w-full" data-pf-faq-mode={activeColorMode}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}>
      {header && <div className="pf-faq-focus-head">{header}</div>}
      <div className="pf-faq-focus-list">
        {items.map((item, index) => {
          const open = openId === item.id;
          const questionId = `${idPrefix}-question-${index}`;
          const answerId = `${idPrefix}-answer-${index}`;
          return (
            <div key={item.id} className={`pf-faq-focus-row${open ? ' is-open' : ''}`}
              data-pf-no-color-transition>
              <button id={questionId} type="button" className="pf-faq-focus-trigger"
                aria-expanded={open} aria-controls={answerId}
                onClick={() => setOpenId(current => current === item.id ? null : item.id)}>
                <span className="pf-faq-focus-spacer" aria-hidden="true">
                  <FaqQuestionMarker index={index} />
                </span>
                <span className="pf-faq-focus-q" data-pf-no-color-transition>{item.question}</span>
                <span className="pf-faq-focus-icon" aria-hidden="true" data-pf-no-color-transition>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div id={answerId} className="pf-faq-focus-panel" role="region"
                aria-labelledby={questionId} aria-hidden={!open} inert={!open} data-pf-no-color-transition>
                <div className="pf-faq-focus-panel-clip">
                  <div className="pf-faq-focus-panel-inner">
                    <p className="pf-faq-focus-answer">{item.answer}</p>
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
