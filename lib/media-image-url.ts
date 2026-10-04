/**
 * Routes user-uploaded images through the Next image optimizer instead of serving the original.
 *
 * Originals are stored full-size (a 6 MB avatar PNG is normal), so a raw `<img src={originalUrl}>`
 * downloads megabytes to paint a 36 px circle. Over a tunnel / mobile link that is seconds per
 * image, and the feed paints one picture at a time. `/_next/image` returns an AVIF/WebP derivative
 * at the width actually displayed — same picture, two to three orders of magnitude fewer bytes —
 * and caches it (`images.minimumCacheTTL` in next.config.mjs).
 *
 * Kept as a URL helper rather than a `next/image` wrapper so existing `<img>` call sites (portfolio
 * designs hold refs, drive GSAP, and rely on their own layout) only change their `src`.
 */

/** Must mirror `images.deviceSizes` + `images.imageSizes`: the optimizer rejects any other `w`. */
const ALLOWED_WIDTHS = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
] as const;

/** Must mirror `images.qualities` (default `[75]`): any other `q` is a 400. */
const QUALITY = 75;

/** Must mirror `images.remotePatterns` in next.config.mjs — an unlisted host is a 400. */
const ALLOWED_REMOTE_HOSTS: readonly (string | RegExp)[] = [
  /\.googleusercontent\.com$/i,
  /\.r2\.dev$/i,
  'images.unsplash.com',
  'flagcdn.com',
];

/** Only the backend's own media route is proxied; other paths on that origin are not images. */
const STORAGE_PATH_PREFIX = '/api/storage/';

/**
 * Widths the backend keeps on disk — must mirror `ImageRenditions.DERIVATIVE_WIDTHS`.
 *
 * Asking the backend for a rung makes the optimizer's *upstream* a ~60 KB derivative instead of a
 * multi-megabyte original, so a cold `/_next/image` miss costs milliseconds. An unknown `?w=` is
 * ignored by the backend, so this is safe against a server that predates the rungs.
 *
 * Not applied to R2 public URLs: object storage has no resize endpoint, and rewriting the key to a
 * derivative that an older upload never wrote would 404. Put Cloudflare Image Resizing in front of
 * the bucket (or backfill the derivatives) when `app.r2.enabled` is turned on.
 */
const BACKEND_RENDITION_WIDTHS = [256, 640, 1280, 2048] as const;

/** Mirrors `BACKEND_ORIGINS` in storage-media-url.ts — both are media-bearing in dev. */
function backendOrigins(): string[] {
  const origins = ['http://localhost:8080'];
  try {
    origins.push(new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').origin);
  } catch {
    /* NEXT_PUBLIC_API_URL unset or malformed — the default above still applies. */
  }
  return origins;
}

/** Whether an absolute URL points at the backend, which is the only host that resizes on request. */
function isBackendOrigin(url: string): boolean {
  try {
    return backendOrigins().includes(new URL(url).origin);
  } catch {
    return false;
  }
}

/** Animated and vector formats come back worse (or rejected) from the optimizer. */
function hasUnoptimizableExtension(pathname: string): boolean {
  return /\.(svg|gif|avif|ico)$/i.test(pathname);
}

function isOptimizable(url: string): boolean {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return false;
  if (url.startsWith('/_next/image')) return false;

  if (url.startsWith('/')) {
    return url.startsWith(STORAGE_PATH_PREFIX) && !hasUnoptimizableExtension(url);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  if (hasUnoptimizableExtension(parsed.pathname)) return false;

  if (backendOrigins().includes(parsed.origin)) return parsed.pathname.startsWith(STORAGE_PATH_PREFIX);
  return ALLOWED_REMOTE_HOSTS.some((host) =>
    typeof host === 'string' ? parsed.hostname === host : host.test(parsed.hostname)
  );
}

/** Smallest allowed width that still covers `width` — never upscale past the original request. */
function snapWidth(width: number): number {
  const wanted = Math.max(1, Math.round(width));
  return ALLOWED_WIDTHS.find((allowed) => allowed >= wanted) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
}

/** True when appending a query parameter would invalidate a presigned URL's signature. */
function isSigned(url: string): boolean {
  return /[?&](X-Amz-|Signature=)/i.test(url);
}

/**
 * Same media, asking the backend for the stored rendition that covers `displayWidth`.
 *
 * Exported for the readers that cannot go through `/_next/image` at all — private attachments are
 * fetched from short-lived signed URLs, which would key the optimizer's cache on a URL that
 * expires. Those still get a derivative this way.
 */
export function storageWidthUrl(url: string | null | undefined, displayWidth: number): string {
  const trimmed = url?.trim() ?? '';
  if (!trimmed || isSigned(trimmed)) return trimmed;
  if (!trimmed.startsWith('/') && !isBackendOrigin(trimmed)) return trimmed;
  if (!trimmed.includes(STORAGE_PATH_PREFIX) || trimmed.includes('__w')) return trimmed;
  const rung = BACKEND_RENDITION_WIDTHS.find((width) => width >= Math.round(displayWidth));
  if (!rung) return trimmed;
  return `${trimmed}${trimmed.includes('?') ? '&' : '?'}w=${rung}`;
}

/**
 * Optimized URL for `url` rendered at `displayWidth` CSS pixels.
 * Returns `url` untouched when it cannot be optimized, so every call site stays safe.
 */
export function mediaImageSrc(url: string | null | undefined, displayWidth: number): string {
  const trimmed = url?.trim() ?? '';
  if (!trimmed || !isOptimizable(trimmed)) return trimmed;
  const snapped = snapWidth(displayWidth);
  const upstream = storageWidthUrl(trimmed, snapped);
  return `/_next/image?url=${encodeURIComponent(upstream)}&w=${snapped}&q=${QUALITY}`;
}

/**
 * `srcSet` covering 1x and 2x screens for `displayWidth`. Pair it with `mediaImageSrc` as the `src`
 * fallback; returns `undefined` when the URL is not optimizable so `src` alone is used.
 */
export function mediaImageSrcSet(url: string | null | undefined, displayWidth: number): string | undefined {
  const trimmed = url?.trim() ?? '';
  if (!trimmed || !isOptimizable(trimmed)) return undefined;
  const one = snapWidth(displayWidth);
  const two = snapWidth(displayWidth * 2);
  if (two === one) return `${mediaImageSrc(trimmed, one)} 1x`;
  return `${mediaImageSrc(trimmed, one)} 1x, ${mediaImageSrc(trimmed, two)} 2x`;
}

/**
 * `src` + `srcSet` with `w` descriptors, for images whose rendered width depends on the viewport.
 * Pair with a `sizes` attribute; without one the browser assumes `100vw` and over-fetches.
 */
export function mediaImageResponsive(
  url: string | null | undefined,
  widths: readonly number[]
): { src: string; srcSet?: string } {
  const trimmed = url?.trim() ?? '';
  const snapped = [...new Set(widths.map(snapWidth))].sort((a, b) => a - b);
  const fallbackWidth = snapped[snapped.length - 1] ?? 1080;
  if (!trimmed || !isOptimizable(trimmed)) return { src: trimmed };
  return {
    src: mediaImageSrc(trimmed, fallbackWidth),
    srcSet: snapped.map((width) => `${mediaImageSrc(trimmed, width)} ${width}w`).join(', '),
  };
}
