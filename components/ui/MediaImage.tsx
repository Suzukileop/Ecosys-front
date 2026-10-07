'use client';

import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';
import {
  mediaImageResponsive,
  mediaImageSrc,
  mediaImageSrcSet,
  storageWidthUrl,
} from '@/lib/media-image-url';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';

type SizingProps =
  /** Fixed rendered width in CSS px (thumbnails, avatars): 1x/2x `srcSet`. */
  | { width: number; widths?: never; sizes?: never }
  /** Viewport-dependent width (cards, galleries): `w` descriptors, which need `sizes`. */
  | { widths: readonly number[]; sizes: string; width?: never };

type MediaImageProps = SizingProps &
  Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'width' | 'loading'> & {
    src: string | null | undefined;
    /** Above the fold only (first card, open lightbox): eager, high fetch priority. */
    priority?: boolean;
    /** Rendered instead of the image when `src` is empty or fails to load. */
    fallback?: ReactNode;
    /**
     * Short-lived signed URL (message attachments): `/_next/image` would cache it under a key that
     * expires, so the backend's stored rendition is requested instead.
     */
    privateMedia?: boolean;
  };

function resolveMediaSrc(src: string | null | undefined): string {
  const trimmed = src?.trim() ?? '';
  if (/^(blob|data):/i.test(trimmed)) return trimmed;
  return resolveStorageMediaUrl(trimmed);
}

/**
 * The one way to paint user media. It downloads the derivative that matches the rendered size
 * (never the multi-megabyte original), defers off-screen images, decodes off the main thread and
 * reveals the picture once it is complete — the container's background shows until then, so an
 * image never paints top-to-bottom as its bytes arrive.
 *
 * The caller owns the box: give the container its size or aspect ratio and a placeholder
 * background so nothing shifts when the image lands.
 */
export function MediaImage({
  src,
  width,
  widths,
  sizes,
  priority = false,
  fallback = null,
  privateMedia = false,
  alt = '',
  className = '',
  onLoad,
  onError,
  ...rest
}: MediaImageProps) {
  const resolved = resolveMediaSrc(src);
  const [status, setStatus] = useState({ src: resolved, loaded: false, failed: false });
  if (status.src !== resolved) {
    setStatus({ src: resolved, loaded: false, failed: false });
  }

  if (!resolved || status.failed) return <>{fallback}</>;

  const sources = privateMedia
    ? { src: storageWidthUrl(resolved, widths != null ? Math.max(...widths) : (width ?? 256) * 2) }
    : widths != null
      ? { ...mediaImageResponsive(resolved, widths), sizes }
      : { src: mediaImageSrc(resolved, width ?? 256), srcSet: mediaImageSrcSet(resolved, width ?? 256) };

  const markLoaded = () =>
    setStatus((prev) => (prev.src === resolved && !prev.loaded ? { ...prev, loaded: true } : prev));

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      {...sources}
      ref={(img) => {
        /* Cached images can finish before React attaches `onLoad`. */
        if (img?.complete && img.naturalWidth > 0) markLoaded();
      }}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onLoad={(event) => {
        markLoaded();
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus((prev) => (prev.src === resolved ? { ...prev, failed: true } : prev));
        onError?.(event);
      }}
      className={`${status.loaded ? 'media-reveal' : 'opacity-0'} ${className}`.trim()}
    />
  );
}
