'use client';

import { useState } from 'react';
import Image from 'next/image';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  tone?: 'brand' | 'muted';
}

const sizeClasses = {
  xs: 'w-9 h-9 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-2xl',
};

const sizePx = {
  xs: 36,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 80,
  '2xl': 112,
};

/** Next.js image optimizer blocks private IPs (localhost) unless allowed — skip it for local storage. */
function shouldBypassImageOptimizer(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1';
  } catch {
    return true;
  }
}

function AvatarFallback({
  name,
  size,
  tone,
}: {
  name: string;
  size: keyof typeof sizeClasses;
  tone: 'brand' | 'muted';
}) {
  const safeName = name?.trim() || '?';
  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fallbackClassName =
    tone === 'muted'
      ? 'bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-white'
      : 'bg-[#F97316] text-white';

  return (
    <div
      className={`${sizeClasses[size]} flex flex-shrink-0 items-center justify-center rounded-full font-semibold ${fallbackClassName}`}
      aria-label={safeName}
    >
      {initials}
    </div>
  );
}

export function Avatar({ name, avatarUrl, size = 'md', tone = 'brand' }: AvatarProps) {
  const safeName = name?.trim() || '?';
  const resolved = resolveStorageMediaUrl(avatarUrl);
  const [failed, setFailed] = useState(false);

  if (resolved && !failed) {
    return (
      <Image
        src={resolved}
        alt={safeName}
        width={sizePx[size]}
        height={sizePx[size]}
        unoptimized={shouldBypassImageOptimizer(resolved)}
        onError={() => setFailed(true)}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return <AvatarFallback name={safeName} size={size} tone={tone} />;
}
