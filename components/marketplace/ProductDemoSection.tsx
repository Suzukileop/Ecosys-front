'use client';

import {
  ProductHighlightLines,
  ProductHighlightMedia,
  ProductHighlightTitle,
  PRODUCT_DEMO_SECTION_TITLE,
} from '@/components/marketplace/product-highlight-ui';
import type { DemoType } from '@/types/marketplace';

type ProductDemoSectionProps = {
  demoUrl: string;
  demoType: DemoType;
  demoSubtitles?: string[] | null;
  /** @deprecated use demoSubtitles */
  demoDescription?: string | null;
  className?: string;
};

export function ProductDemoSection({
  demoUrl,
  demoType,
  demoSubtitles,
  demoDescription,
  className = '',
}: ProductDemoSectionProps) {
  if (!demoUrl?.trim() || demoType === 'NONE') return null;

  const lines =
    demoSubtitles && demoSubtitles.length > 0
      ? demoSubtitles
      : demoDescription?.trim()
        ? [demoDescription.trim()]
        : [];

  return (
    <section className={className}>
      <ProductHighlightTitle>{PRODUCT_DEMO_SECTION_TITLE}</ProductHighlightTitle>
      <article className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-start sm:gap-8 lg:gap-10">
        <ProductHighlightMedia mediaUrl={demoUrl} />
        {lines.length > 0 ? (
          <ProductHighlightLines lines={lines} idPrefix="demo" icon="play" animationClass="product-demo-opinion" />
        ) : null}
      </article>
    </section>
  );
}
