import type { CSSProperties, ReactNode } from 'react';
import type { PortfolioHeroPortraitShape } from '@/components/portfolio/portfolio-hero-banner-settings';

/**
 * Shared "Portrait shape" helpers for the hero banner designs that show a portrait.
 * `auto` keeps the design's own shape; every other value overrides it. The accent decorations
 * (ring, inner frame) are drawn INSIDE the photo box because the entry reveals clip what overflows it;
 * only the offset outline lives outside, in `PortraitOffsetOutline`.
 */

/** Border radius for the shapes that round the box; undefined = leave the design's own radius. */
export function portraitShapeRadius(shape: PortfolioHeroPortraitShape | undefined): string | undefined {
  switch (shape) {
    case 'arch':
      return '9999px 9999px 0 0';
    case 'circle':
      return '50%';
    case 'asymmetric':
      return '4.5rem 0.4rem 4.5rem 0.4rem';
    case 'rectangle':
    case 'frame':
    case 'offset':
      return '0px';
    default:
      return undefined;
  }
}

/** Square box for the circle; undefined = leave the design's own aspect ratio. */
export function portraitShapeAspect(shape: PortfolioHeroPortraitShape | undefined): string | undefined {
  return shape === 'circle' ? '1 / 1' : undefined;
}

/** True when the shape is anything but the design's own. */
export function hasPortraitShapeOverride(shape: PortfolioHeroPortraitShape | undefined): boolean {
  return shape != null && shape !== 'auto';
}

/** Style for an absolutely-positioned, pointer-less overlay inside the photo box (ring / inner frame). */
export function portraitShapeOverlayStyle(
  shape: PortfolioHeroPortraitShape | undefined,
  principal: string,
  fond: string
): CSSProperties | undefined {
  if (shape === 'circle') {
    return {
      borderRadius: '50%',
      boxShadow: `inset 0 0 0 0.45rem color-mix(in srgb, ${fond} 92%, transparent), inset 0 0 0 calc(0.45rem + 1.5px) color-mix(in srgb, ${principal} 80%, transparent)`,
    };
  }
  if (shape === 'frame') {
    return {
      inset: '0.9rem',
      border: `1.5px solid color-mix(in srgb, ${principal} 80%, transparent)`,
    };
  }
  return undefined;
}

/** Wraps the photo box with a fine accent outline set back behind it (shape `offset`). */
export function PortraitOffsetOutline({
  enabled,
  principal,
  className = '',
  children,
}: {
  enabled: boolean;
  principal: string;
  className?: string;
  children: ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <div className={`relative ${className}`.trim()}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          transform: 'translate(0.9rem, 0.9rem)',
          border: `1.5px solid color-mix(in srgb, ${principal} 85%, transparent)`,
        }}
      />
      {children}
    </div>
  );
}
