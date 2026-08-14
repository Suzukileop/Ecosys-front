'use client';

import type { ReactNode } from 'react';
import { ContentMediaPreview } from '@/components/creator/creator-content-media';

/** Air below highlight titles — matches ProductDetailBottom section gaps. */
export const productHighlightTitleGapClass = 'mb-16 sm:mb-20';

/** Use the same value on ProductDetailBottom (`space-y-16 sm:space-y-20`). */
export const productDetailSectionGapClass = 'space-y-16 sm:space-y-20';

export const PRODUCT_DEMO_SECTION_TITLE = 'See it in action';

export function ProductHighlightTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className={`product-why-title ${productHighlightTitleGapClass} text-center text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl`}
    >
      <span className="text-orange-500 dark:text-orange-400">{children}</span>
    </h2>
  );
}

function HighlightLineIcon({ variant }: { variant: 'star' | 'play' }) {
  return (
    <span
      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
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
          <p className="min-w-0 flex-1 text-left text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
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
  return (
    <div className={`min-w-0 w-full flex-1 ${unframed ? '' : 'overflow-hidden rounded-2xl'}`}>
      <ContentMediaPreview locale="en" mediaUrl={mediaUrl} mediaType="FILE" large fluid unframed={unframed} />
    </div>
  );
}
