'use client';

import { useEffect, useRef } from 'react';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';

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
};

export function ProductThumbnailMedia({
  url,
  alt = '',
  className = '',
  fit = 'cover',
  autoPlay = false,
  zoomOnHover = false,
  loading = 'lazy',
}: ProductThumbnailMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
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
      src={url}
      alt={alt}
      className={`${fitClass} ${sizeClass} ${hoverClass} ${className}`.trim()}
      loading={loading}
      decoding="async"
    />
  );
}
