'use client';

import {
  ProductHighlightLines,
  ProductHighlightMedia,
  ProductHighlightTitle,
} from '@/components/marketplace/product-highlight-ui';
import type { ProductWhyBlock } from '@/types/marketplace';

type ProductWhyHighlightsProps = {
  blocks: ProductWhyBlock[];
  className?: string;
};

export function ProductWhyHighlights({ blocks, className = '' }: ProductWhyHighlightsProps) {
  const items = [...blocks]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((block) => block.mediaUrl?.trim() && block.opinions.length > 0);

  if (items.length === 0) return null;

  return (
    <section className={className}>
      <ProductHighlightTitle>Why this product?</ProductHighlightTitle>
      <div className="space-y-14">
        {items.map((block) => (
          <article
            key={block.id}
            className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-start sm:gap-8 lg:gap-10"
          >
            <ProductHighlightLines lines={block.opinions} idPrefix={block.id} icon="star" />
            <ProductHighlightMedia mediaUrl={block.mediaUrl} />
          </article>
        ))}
      </div>
    </section>
  );
}
