'use client';

import Image from 'next/image';
import { useMouseParallax } from '@/lib/useMouseParallax';

export type MarketplacePatternVariant = 'hub' | 'product';

const PATTERN_MASKS: Record<MarketplacePatternVariant, string> = {
  /** Catalog hub — header + Products / Favorites / Purchases tabs */
  hub: 'linear-gradient(to bottom, #000 0%, #000 20%, transparent 36%)',
  /** Product detail — fades out above characteristics */
  product: 'linear-gradient(to bottom, #000 0%, #000 34%, transparent 57%)',
};

type MarketplacePatternBackgroundProps = {
  variant?: MarketplacePatternVariant;
};

/**
 * Full-viewport cellular background — fixed while scrolling.
 * All layers share one mouse parallax via a single wrapper transform.
 */
export function MarketplacePatternBackground({
  variant = 'product',
}: MarketplacePatternBackgroundProps) {
  const layerRef = useMouseParallax({ x: 36, y: 26, rotate: 0.5 });
  const mask = PATTERN_MASKS[variant];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-white dark:bg-neutral-950"
      style={{ perspective: '1400px' }}
    >
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        <div
          ref={layerRef}
          className="absolute -inset-[10%] will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Image
            src="/patterns/cellular-voronoi.png"
            alt=""
            fill
            priority
            className="object-cover opacity-[0.62] saturate-[0.82] dark:opacity-[0.32] dark:saturate-0 dark:[filter:invert(1)_brightness(1.85)_contrast(1)]"
            sizes="100vw"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use MarketplacePatternBackground */
export const ProductDetailHalftoneBackground = MarketplacePatternBackground;
