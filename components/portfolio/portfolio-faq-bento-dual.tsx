'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import type { FaqItem } from '@/types/profile';
import type {
  PortfolioFaqBentoDualCardBorder,
  PortfolioFaqBentoDualCardRadius,
} from '@/components/portfolio/portfolio-faq-settings';

const CARD_RADIUS_PX: Record<PortfolioFaqBentoDualCardRadius, string> = {
  sm: '12px', md: '22px', lg: '30px', xl: '40px',
};
const CARD_BORDER_WIDTH_PX: Record<PortfolioFaqBentoDualCardBorder, string> = {
  none: '0px', soft: '1px', solid: '1.5px',
};

/** Two surfaces, one explicit interaction: the question stays visible above its answer. */
export function FaqBentoDualDesign({
  items, header, activeColorMode = 'light', cardColor,
  cardRadius = 'md', cardBorder = 'soft', cardOpacity = 100, fontSizeScale = 1,
}: {
  items: FaqItem[];
  header?: ReactNode;
  activeColorMode?: 'light' | 'dark';
  cardColor?: string;
  cardRadius?: PortfolioFaqBentoDualCardRadius;
  cardBorder?: PortfolioFaqBentoDualCardBorder;
  cardOpacity?: number;
  fontSizeScale?: number;
}) {
  const [openId, setOpenId] = useState<FaqItem['id'] | null>(null);
  const idPrefix = useId();
  if (items.length === 0) return null;
  const opacity = Number.isFinite(cardOpacity) ? Math.min(100, Math.max(0, cardOpacity)) : 100;
  const surface = compositeCardColor(
    cardColor ?? (activeColorMode === 'dark' ? '#6d5ef5' : '#ffe14d'),
    opacity, activeColorMode === 'dark' ? 0 : 255,
  );
  const ink = readableInk(surface);
  const style = {
    '--pfbd-radius': CARD_RADIUS_PX[cardRadius],
    '--pfbd-border-width': CARD_BORDER_WIDTH_PX[cardBorder],
    '--pfbd-border-strength': cardBorder === 'solid' ? '36%' : '16%',
    '--pfbd-surface': surface,
    '--pfbd-card-ink': ink,
    '--pfbd-answer-bg': ink,
    '--pfbd-answer-ink': ink === '#000000' ? '#ffffff' : '#111111',
    '--pf-faq-font-scale': fontSizeScale,
  } as CSSProperties;

  return (
    <div className="pf-faq-bento w-full" data-pf-faq-mode={activeColorMode}
      data-single-card={items.length === 1} style={style}>
      {header && <div className="pf-faq-bento-head">{header}</div>}
      <div className="pf-faq-bento-grid">
        {items.map((item, index) => {
          const open = openId === item.id;
          const questionId = `${idPrefix}-question-${index}`;
          const answerId = `${idPrefix}-answer-${index}`;
          return (
            <div key={item.id} className={`pf-faq-bento-card${open ? ' is-open' : ''}`}
              data-pf-no-color-transition>
              <button id={questionId} type="button" className="pf-faq-bento-trigger"
                aria-expanded={open} aria-controls={answerId}
                onClick={() => setOpenId(current => current === item.id ? null : item.id)}>
                <span className="pf-faq-bento-q" data-pf-no-color-transition>{item.question}</span>
                <span className="pf-faq-bento-icon" aria-hidden="true" data-pf-no-color-transition>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div id={answerId} className="pf-faq-bento-panel" role="region"
                aria-labelledby={questionId} aria-hidden={!open} inert={!open} data-pf-no-color-transition>
                <div className="pf-faq-bento-panel-clip">
                  <div className="pf-faq-bento-panel-inner">
                    <p className="pf-faq-bento-a">{item.answer}</p>
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

/** Resolve the actual opaque surface before choosing ink, including 0% and short hex colours. */
function compositeCardColor(color: string, opacity: number, background: number): string {
  let hex = color.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) hex = [...hex].map(c => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(hex)) hex = background === 0 ? '6d5ef5' : 'ffe14d';
  const channels = [0, 2, 4].map(offset =>
    Math.round(parseInt(hex.slice(offset, offset + 2), 16) * opacity / 100 + background * (1 - opacity / 100)),
  );
  return '#' + channels.map(c => c.toString(16).padStart(2, '0')).join('');
}

function readableInk(surface: string): '#000000' | '#ffffff' {
  const channels = [1, 3, 5].map(offset => {
    const c = parseInt(surface.slice(offset, offset + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#ffffff';
}
