'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { initialsFromName } from '@/lib/profile-format';
import { mediaImageSrc, mediaImageSrcSet } from '@/lib/media-image-url';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';

/**
 * Avatar `<img>` that renders `fallback` when the URL is empty or fails to load.
 * `no-referrer` is required for Google profile photos (lh3.googleusercontent.com),
 * which reject cross-site requests carrying a Referer header.
 */
export function AvatarImage({
  src,
  className = '',
  fallback = null,
  displayWidth = 48,
}: {
  src?: string | null;
  className?: string;
  fallback?: ReactNode;
  /** Rendered size in CSS px — picks the derivative to download (see `mediaImageSrc`). */
  displayWidth?: number;
}) {
  const resolved = resolveStorageMediaUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaImageSrc(resolved, displayWidth)}
      srcSet={mediaImageSrcSet(resolved, displayWidth)}
      alt=""
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

const AVATAR_PALETTE = [
  '#059669',
  '#2563EB',
  '#D97706',
  '#DB2777',
  '#7C3AED',
  '#0D9488',
  '#DC2626',
  '#4F46E5',
] as const;

function avatarColorFromKey(key: string): string {
  const seed = key.trim().toLowerCase() || '?';
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function PersonAvatar({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}: {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const displayName = name.trim() || 'User';
  const sizeClass =
    size === 'sm' ? 'h-8 w-8 text-[10px]' : size === 'lg' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs';

  const initials = (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${sizeClass} ${className}`}
      style={{ backgroundColor: avatarColorFromKey(displayName) }}
      aria-hidden
    >
      {initialsFromName(displayName)}
    </span>
  );

  if (!avatarUrl) return initials;

  return (
    <AvatarImage
      src={avatarUrl}
      fallback={initials}
      className={`inline-block shrink-0 rounded-full bg-neutral-200 object-cover dark:bg-neutral-800 ${sizeClass} ${className}`}
    />
  );
}
