'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';

/**
 * Gallery/Team media. Native img/video (not next/image fill): fill requires a
 * definite parent height, which cinema/grid frames often don't have — lightbox
 * worked because it wraps in 82vh. IntersectionObserver still defers src.
 */
export function PortfolioDeferredMedia({
  src,
  alt,
  className = '',
  style,
  eager = false,
  highPriority = false,
  kind = 'image',
  objectFit = 'cover',
  objectPosition,
  autoPlayVideo = false,
  controls = false,
  showPlayBadge = false,
  fillParent = true,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  eager?: boolean;
  highPriority?: boolean;
  kind?: 'image' | 'video';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  autoPlayVideo?: boolean;
  controls?: boolean;
  showPlayBadge?: boolean;
  fillParent?: boolean;
}) {
  const resolved = resolveStorageMediaUrl(src);
  const mountImmediately = eager || highPriority;
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [inView, setInView] = useState(mountImmediately);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [resolved]);

  useEffect(() => {
    if (mountImmediately) setInView(true);
  }, [mountImmediately]);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setLoaded(true);
  }, [resolved, inView]);

  useEffect(() => {
    if (!resolved || inView) return;
    const node = wrapRef.current;
    if (!node) return;
    const reveal = () => setInView(true);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reveal();
      },
      { rootMargin: '280px 120px', threshold: 0 }
    );
    observer.observe(node);
    const rect = node.getBoundingClientRect();
    if (rect.height < 2 || rect.width < 2) {
      reveal();
    } else {
      const vh = typeof window === 'undefined' ? 0 : window.innerHeight;
      if (rect.bottom >= -280 && rect.top <= vh + 280) reveal();
    }
    return () => observer.disconnect();
  }, [resolved, inView]);

  useEffect(() => {
    if (kind !== 'video' || !autoPlayVideo || !inView) return;
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
          }
        }
      },
      { rootMargin: '80px', threshold: 0.2 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [kind, autoPlayVideo, inView, resolved]);

  const fitStyle: CSSProperties = {
    objectFit,
    objectPosition,
    ...style,
  };
  const mediaClass = fillParent
    ? `absolute inset-0 h-full w-full ${className}`.trim()
    : `relative block h-auto w-full ${className}`.trim();

  if (!resolved) {
    return (
      <div
        className={fillParent ? 'pf-media-skeleton absolute inset-0' : 'pf-media-skeleton min-h-[12rem] w-full'}
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={wrapRef}
      className={fillParent ? 'absolute inset-0 overflow-hidden' : `relative w-full overflow-hidden ${loaded ? '' : 'min-h-[12rem]'}`}
    >
      {kind === 'video' && inView ? (
        <video
          ref={videoRef}
          src={resolved}
          className={mediaClass}
          style={fitStyle}
          muted={!controls}
          loop={autoPlayVideo}
          playsInline
          controls={controls}
          preload={mountImmediately ? 'metadata' : 'none'}
          onLoadedData={() => setLoaded(true)}
        />
      ) : null}
      {kind !== 'video' && inView ? (
        // Native img: next/image `fill` collapsed to 0px in gallery frames (lightbox has explicit 82vh).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imageRef}
          src={resolved}
          alt={alt}
          className={mediaClass}
          style={fitStyle}
          decoding="async"
          fetchPriority={mountImmediately ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
        />
      ) : null}
      {kind === 'video' && showPlayBadge ? (
        <span
          className="pointer-events-none absolute right-3 top-3 z-[2] flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-sm text-white"
          aria-hidden
        >
          ▶
        </span>
      ) : null}
    </div>
  );
}
