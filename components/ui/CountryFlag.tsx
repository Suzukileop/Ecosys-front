'use client';

import Image from 'next/image';
import { useState } from 'react';
import { countryFlagImageUrl } from '@/lib/countryDialCodes';

type CountryFlagProps = {
  iso2: string;
  className?: string;
  size?: 'sm' | 'md';
};

const SIZES = {
  sm: { w: 20, h: 15, className: 'h-[15px] w-5' },
  md: { w: 24, h: 18, className: 'h-[18px] w-6' },
} as const;

export function CountryFlag({ iso2, className = '', size = 'md' }: CountryFlagProps) {
  const [failed, setFailed] = useState(false);
  const code = iso2?.trim().toUpperCase();
  const dim = SIZES[size];

  if (!code || code.length !== 2 || failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-neutral-200 text-[9px] font-bold uppercase text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 ${dim.className} ${className}`}
        aria-hidden
      >
        {code?.slice(0, 2) ?? '?'}
      </span>
    );
  }

  return (
    <Image
      src={countryFlagImageUrl(code, dim.w * 2)}
      width={dim.w}
      height={dim.h}
      alt=""
      loading="lazy"
      unoptimized
      className={`shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-black/10 ${dim.className} ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
