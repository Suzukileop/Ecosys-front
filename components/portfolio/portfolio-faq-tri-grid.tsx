'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { FaqItem } from '@/types/profile';

/** All answers stay visible, in source order, across the responsive editorial grid. */
export function FaqTriGridDesign({
  items, header, activeColorMode = 'light', fontSizeScale = 1,
}: {
  items: FaqItem[];
  header?: ReactNode;
  activeColorMode?: 'light' | 'dark';
  fontSizeScale?: number;
}) {
  if (items.length === 0) return null;
  return (
    <div className="pf-faq-tri w-full" data-pf-faq-mode={activeColorMode}
      data-columns={Math.min(items.length, 3)}
      style={{ '--pf-faq-font-scale': fontSizeScale } as CSSProperties}>
      {header && <div className="pf-faq-tri-head">{header}</div>}
      <div className="pf-faq-tri-grid" role="list">
        {items.map(item => (
          <div key={item.id} className="pf-faq-tri-block" role="listitem">
            <h3 className="pf-faq-tri-q">{item.question}</h3>
            <p className="pf-faq-tri-a">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
