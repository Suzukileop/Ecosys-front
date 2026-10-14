'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';
import { mediaImageResponsive } from '@/lib/media-image-url';

/**
 * Candidate widths, small card to full-bleed gallery. The ladder used to stop at 828, so any image
 * drawn wider than that (a product's main gallery picture, a full-width portfolio card) was a
 * 640–828px file stretched to fit — the soft, low-pixel look.
 */
const THUMBNAIL_WIDTHS = [256, 384, 640, 828, 1080, 1280, 1920] as const;

/** What a card is assumed to be drawn at until the real width is measured. */
const ASSUMED_WIDTH_PX = 420;

type ProductThumbnailMediaProps = {
  url: string;
  alt?: string;
  className?: string;
  fit?: 'contain' | 'cover';
  /** Loop muted preview when visible in the viewport (catalog cards, galleries). */
  autoPlay?: boolean;
  /** Subtle zoom-in on card hover (catalog cards). */
  zoomOnHover?: boolean;
  loading?: 'lazy' | 'eager';
  /** Rendered width hint for the `srcSet`. Left out, the image's real rendered width is measured. */
  sizes?: string;
};

export function ProductThumbnailMedia({
  url,
  alt = '',
  className = '',
  fit = 'cover',
  autoPlay = false,
  zoomOnHover = false,
  loading = 'lazy',
  sizes,
}: ProductThumbnailMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  /* Almost no caller passes `sizes`, and a guessed 420px is wrong for everything that is not a
     two-column card. Measure what the browser actually drew and tell it that width, so a wide
     picture picks a wide file. Only ever grows the request: shrinking would re-download. */
  const [measuredPx, setMeasuredPx] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (sizes) return undefined;
    const img = imgRef.current;
    if (!img || typeof ResizeObserver === 'undefined') return undefined;
    const read = () => {
      const width = Math.round(img.getBoundingClientRect().width);
      if (width > ASSUMED_WIDTH_PX * 1.1) setMeasuredPx((prev) => (prev && prev >= width ? prev : width));
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(img);
    return () => observer.disconnect();
  }, [sizes, url]);
  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover';
  const sizeClass = fit === 'cover' ? 'min-h-0 min-w-0 max-h-full max-w-full' : '';
  const hoverClass = zoomOnHover
    ? 'transition-transform duration-500 ease-out group-hover:scale-110'
    : '';

  useEffect(() => {
    if (!autoPlay || !isVideoThumbnailUrl(url)) return;

    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== video) continue;
          if (entry.isIntersecting) {
            void video.play().catch(() => undefined);
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [autoPlay, url]);

  if (isVideoThumbnailUrl(url)) {
    return (
      <video
        ref={videoRef}
        src={url}
        className={`${fitClass} ${sizeClass} ${hoverClass} ${className}`.trim()}
        muted
        playsInline
        loop
        preload={autoPlay ? 'metadata' : 'none'}
        aria-label={alt}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      {...mediaImageResponsive(url, THUMBNAIL_WIDTHS)}
      sizes={sizes ?? `${measuredPx ?? ASSUMED_WIDTH_PX}px`}
      alt={alt}
      className={`${fitClass} ${sizeClass} ${hoverClass} ${className}`.trim()}
      loading={loading}
      decoding="async"
    />
  );
}
