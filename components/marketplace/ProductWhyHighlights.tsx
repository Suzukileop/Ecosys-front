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

function isTextBlock(block: ProductWhyBlock): boolean {
  if (block.kind === 'text') return true;
  if (block.kind === 'media') return false;
  return !block.mediaUrl?.trim();
}

export function ProductWhyHighlights({ blocks, className = '' }: ProductWhyHighlightsProps) {
  const items = [...blocks]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((block) => block.opinions.some((line) => line.trim()));

  if (items.length === 0) return null;

  return (
    <section className={className}>
      <ProductHighlightTitle>Why this product?</ProductHighlightTitle>
      <div className="space-y-14">
        {items.map((block) => {
          const lines = block.opinions.map((line) => line.trim()).filter(Boolean);
          if (isTextBlock(block)) {
            return (
              <article key={block.id} className="mx-auto max-w-2xl">
                <ProductHighlightLines lines={lines} idPrefix={block.id} icon="star" />
              </article>
            );
          }

          return (
            <article
              key={block.id}
              className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-start sm:gap-8 lg:gap-10"
            >
              <ProductHighlightLines lines={lines} idPrefix={block.id} icon="star" />
              {block.mediaUrl?.trim() ? <ProductHighlightMedia mediaUrl={block.mediaUrl.trim()} /> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
