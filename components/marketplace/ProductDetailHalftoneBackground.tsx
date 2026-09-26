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
  /**
   * The page tone painted under the pattern. Defaults to the marketplace/news value.
   *
   * It is a prop because the tone is not universal: this layer replaces the shell background
   * wherever it is used, so a page whose surfaces were calibrated against a different base has to
   * say so. The portfolio workspace is the case in point — its cards are `#121212`, which is
   * *darker* than the `neutral-900` default, so keeping that default would have flipped the cards
   * from lifted to sunken.
   */
  baseClassName?: string;
};

/**
 * Full-viewport cellular background — fixed while scrolling.
 * All layers share one mouse parallax via a single wrapper transform.
 */
export function MarketplacePatternBackground({
  variant = 'product',
  baseClassName = 'bg-neutral-100 dark:bg-neutral-900',
}: MarketplacePatternBackgroundProps) {
  const layerRef = useMouseParallax({ x: 36, y: 26, rotate: 0.5 });
  const mask = PATTERN_MASKS[variant];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${baseClassName}`}
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
            className="object-cover opacity-[0.55] saturate-[0.82] dark:opacity-[0.2] dark:saturate-0 dark:[filter:invert(1)_brightness(1.85)_contrast(1)]"
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
