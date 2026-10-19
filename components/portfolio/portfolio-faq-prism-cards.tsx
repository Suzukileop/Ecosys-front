'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import type { FaqItem } from '@/types/profile';

/** Prism surfaces keep all questions readable; colour is a small identity accent. */
export function FaqPrismCardsDesign({
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
    <div className="pf-faq-prism w-full" data-pf-faq-mode={activeColorMode}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}>
      {header && <div className="pf-faq-prism-head">{header}</div>}
      <div className="pf-faq-prism-list">
        {items.map((item, index) => {
          const open = openId === item.id;
          const questionId = `${idPrefix}-question-${index}`;
          const answerId = `${idPrefix}-answer-${index}`;
          return (
            <div key={item.id} className={`pf-faq-prism-card${open ? ' is-open' : ''}`}
              data-pf-no-color-transition>
              <span className="pf-faq-prism-fill" aria-hidden="true" data-pf-no-color-transition />
              <button id={questionId} type="button" className="pf-faq-prism-trigger"
                aria-expanded={open} aria-controls={answerId}
                onClick={() => setOpenId(current => current === item.id ? null : item.id)}>
                <span className="pf-faq-prism-q" data-pf-no-color-transition>{item.question}</span>
                <span className="pf-faq-prism-icon" aria-hidden="true" data-pf-no-color-transition>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <line className="pf-faq-prism-icon-bar" x1="9" y1="2.5" x2="9" y2="15.5"
                      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" data-pf-no-color-transition />
                    <line x1="2.5" y1="9" x2="15.5" y2="9" stroke="currentColor"
                      strokeWidth={1.6} strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div id={answerId} className="pf-faq-prism-panel" role="region"
                aria-labelledby={questionId} aria-hidden={!open} inert={!open} data-pf-no-color-transition>
                <div className="pf-faq-prism-panel-clip">
                  <div className="pf-faq-prism-panel-inner">
                    <p className="pf-faq-prism-answer">{item.answer}</p>
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
