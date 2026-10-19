'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import type { FaqItem } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

/** A compact index rail beside readable, fluid accordion rows. */
export function FaqSplitIndexDesign({
  items, header, activeColorMode = 'light', fontSizeScale = 1,
}: {
  items: FaqItem[];
  header?: ReactNode;
  activeColorMode?: 'light' | 'dark';
  fontSizeScale?: number;
}) {
  const t = useT();
  const [openId, setOpenId] = useState<FaqItem['id'] | null>(null);
  const idPrefix = useId();
  if (items.length === 0) return null;

  return (
    <div className="pf-faq-split w-full" data-pf-faq-mode={activeColorMode}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}>
      {header && <div className="pf-faq-split-head">{header}</div>}
      <div className="pf-faq-split-row">
        <div className="pf-faq-split-rail" aria-hidden="true">
          <span className="pf-faq-split-rail-label">{t('Index')}</span>
          <span className="pf-faq-split-rail-count">01 — {String(items.length).padStart(2, '0')}</span>
        </div>
        <div className="pf-faq-split-list">
          {items.map((item, index) => {
            const open = openId === item.id;
            const questionId = `${idPrefix}-question-${index}`;
            const answerId = `${idPrefix}-answer-${index}`;
            return (
              <div key={item.id} className={`pf-faq-split-item${open ? ' is-open' : ''}`}>
                <button id={questionId} type="button" className="pf-faq-split-trigger"
                  aria-expanded={open} aria-controls={answerId}
                  onClick={() => setOpenId(current => current === item.id ? null : item.id)}>
                  <span className="pf-faq-split-badge" aria-hidden="true" data-pf-no-color-transition>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="pf-faq-split-q" data-pf-no-color-transition>{item.question}</span>
                  <span className="pf-faq-split-icon" aria-hidden="true" data-pf-no-color-transition>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <div id={answerId} className="pf-faq-split-panel" role="region"
                  aria-labelledby={questionId} aria-hidden={!open} inert={!open} data-pf-no-color-transition>
                  <div className="pf-faq-split-panel-clip">
                    <div className="pf-faq-split-panel-inner">
                      <p className="pf-faq-split-answer">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
