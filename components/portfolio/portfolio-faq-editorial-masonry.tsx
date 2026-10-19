'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import type { FaqItem } from '@/types/profile';

/** Editorial FAQ: interaction never dims neighbouring questions or answers. */
export function FaqEditorialMasonryDesign({
  items, header, fontSizeScale = 1,
}: {
  items: FaqItem[];
  header?: ReactNode;
  fontSizeScale?: number;
}) {
  const [openId, setOpenId] = useState<FaqItem['id'] | null>(null);
  const idPrefix = useId();
  if (items.length === 0) return null;

  const singleColumn = items.length < 4;
  const half = singleColumn ? items.length : Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)];

  return (
    <div className="pf-faq-masonry w-full" data-single-column={singleColumn}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}>
      {header && <div className="pf-faq-masonry-head">{header}</div>}
      <div className="pf-faq-masonry-grid">
        {columns.map((column, columnIndex) => column.length > 0 && (
          <div key={columnIndex}
            className={`pf-faq-masonry-col${columnIndex === 1 ? ' pf-faq-masonry-col--right' : ''}`}>
            {column.map((item, rowIndex) => {
              const index = columnIndex * half + rowIndex;
              const open = openId === item.id;
              const questionId = `${idPrefix}-question-${index}`;
              const answerId = `${idPrefix}-answer-${index}`;
              return (
                <div key={item.id} className={`pf-faq-masonry-row${open ? ' is-open' : ''}`}>
                  <button id={questionId} type="button" className="pf-faq-masonry-trigger"
                    aria-expanded={open} aria-controls={answerId}
                    onClick={() => setOpenId((current) => current === item.id ? null : item.id)}>
                    <span className="pf-faq-masonry-index" aria-hidden="true" data-pf-no-color-transition>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="pf-faq-masonry-q" data-pf-no-color-transition>{item.question}</span>
                    <span className="pf-faq-masonry-icon" aria-hidden="true" data-pf-no-color-transition>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <div id={answerId} className="pf-faq-masonry-panel" role="region"
                    data-pf-no-color-transition
                    aria-labelledby={questionId} aria-hidden={!open} inert={!open}>
                    <div className="pf-faq-masonry-panel-clip">
                      <div className="pf-faq-masonry-panel-inner">
                        <p className="pf-faq-masonry-answer">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
