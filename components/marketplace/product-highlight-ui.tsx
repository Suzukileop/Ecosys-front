'use client';

import type { ReactNode } from 'react';
import { ContentMediaPreview, contentMediaKind } from '@/components/creator/creator-content-media';
import { ProductVideoPlayer } from '@/components/marketplace/ProductVideoPlayer';

/** Air below highlight titles — matches ProductDetailBottom section gaps. */
const productHighlightTitleGapClass = 'mb-6 sm:mb-10';

export const PRODUCT_DEMO_SECTION_TITLE = 'See it in action';

export function ProductHighlightTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className={`product-why-title ${productHighlightTitleGapClass} px-4 text-center text-[24px] font-extrabold leading-8 tracking-[-0.02em] sm:text-[28px] sm:leading-9`}
    >
      <span className="text-[#0F1419] dark:text-[#E7E9EA]">{children}</span>
    </h2>
  );
}

function HighlightLineIcon({ variant }: { variant: 'star' | 'play' }) {
  return (
    <span
      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF3F4] text-[#0F1419] dark:bg-[#202327] dark:text-[#E7E9EA]"
      aria-hidden
    >
      {variant === 'play' ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
        </svg>
      )}
    </span>
  );
}

type ProductHighlightLinesProps = {
  lines: string[];
  idPrefix: string;
  icon?: 'star' | 'play';
  animationClass?: string;
};

export function ProductHighlightLines({
  lines,
  idPrefix,
  icon = 'star',
  animationClass = 'product-why-opinion',
}: ProductHighlightLinesProps) {
  const items = lines.map((line) => line.trim()).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <ul className="w-full shrink-0 space-y-1 sm:w-80 lg:w-96">
      {items.map((line, index) => (
        <li
          key={`${idPrefix}-${index}`}
          className={`${animationClass} flex gap-3 py-3`}
          style={{ animationDelay: `${120 + index * 70}ms` }}
        >
          <HighlightLineIcon variant={icon} />
          <p className="min-w-0 flex-1 pt-2 text-left text-[15px] leading-[22px] text-[#0F1419] sm:text-[17px] sm:leading-6 dark:text-[#E7E9EA]">
            {line}
          </p>
        </li>
      ))}
    </ul>
  );
}

type ProductHighlightMediaProps = {
  mediaUrl: string;
  unframed?: boolean;
};

export function ProductHighlightMedia({ mediaUrl, unframed = false }: ProductHighlightMediaProps) {
  if (contentMediaKind(mediaUrl, null, 'FILE') === 'video') {
    return (
      <div className="min-w-0 w-full flex-1">
        <ProductVideoPlayer src={mediaUrl} />
      </div>
    );
  }
  return (
    <div className={`min-w-0 w-full flex-1 ${unframed ? '' : 'overflow-hidden rounded-2xl'}`}>
      <ContentMediaPreview locale="en" mediaUrl={mediaUrl} mediaType="FILE" large fluid unframed={unframed} />
    </div>
  );
}
