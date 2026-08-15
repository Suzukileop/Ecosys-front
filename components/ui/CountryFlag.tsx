'use client';

import { useMemo, useState } from 'react';
import { countryFlagImageUrl } from '@/lib/countryDialCodes';

type CountryFlagProps = {
  iso2: string;
  className?: string;
  size?: 'sm' | 'md';
};

const SIZES = {
  sm: { w: 18, h: 13, className: 'h-[13px] w-[18px]' },
  md: { w: 24, h: 18, className: 'h-[18px] w-6' },
} as const;

function flagSources(iso2: string, width: number): string[] {
  const code = iso2.trim().toLowerCase();
  if (!code || code.length !== 2) return [];
  return [
    `https://flagcdn.com/${code}.svg`,
    countryFlagImageUrl(code, width),
    `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/${code}.svg`,
  ];
}

/** Colored country flag image (not emoji — Windows shows ISO letters for emoji flags). */
export function CountryFlag({ iso2, className = '', size = 'md' }: CountryFlagProps) {
  const code = iso2?.trim().toUpperCase();
  const dim = SIZES[size];
  const sources = useMemo(
    () => (code && code.length === 2 ? flagSources(code, dim.w * 2) : []),
    [code, dim.w]
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);

  const src = sources[sourceIndex];
  if (!code || code.length !== 2 || exhausted || !src) return null;

  return (
    // Native img: avoids Next/Image issues and never falls back to ISO letters like "MG".
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      width={dim.w}
      height={dim.h}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={`inline-block shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/15 ${dim.className} ${className}`}
      onError={() => {
        setSourceIndex((prev) => {
          const next = prev + 1;
          if (next >= sources.length) {
            setExhausted(true);
            return prev;
          }
          return next;
        });
      }}
    />
  );
}
