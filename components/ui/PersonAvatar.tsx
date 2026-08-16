'use client';

import { initialsFromName } from '@/lib/profile-format';

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

export function avatarColorFromKey(key: string): string {
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

  if (avatarUrl) {
    return (
      <span
        className={`inline-flex shrink-0 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 ${sizeClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${sizeClass} ${className}`}
      style={{ backgroundColor: avatarColorFromKey(displayName) }}
      aria-hidden
    >
      {initialsFromName(displayName)}
    </span>
  );
}
