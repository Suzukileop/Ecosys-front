'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  findCreatorToolPreset,
  getCreatorToolIconCandidates,
  type CreatorToolPreset,
} from '@/components/creator/studio/creator-profile-tools-catalog';

type CreatorToolLogoProps = {
  label: string;
  preset?: CreatorToolPreset | null;
  size?: number;
  className?: string;
  /** Hex background the chip / bar sits on — used for contrast. */
  bgColor?: string;
  /**
   * Catalog brand tint. On dark surfaces, dark brands (CapCut, VS Code blue,
   * Unreal…) are lifted to a light glyph so they stay readable.
   */
  brandColor?: string;
  /** Uploaded custom logo URL — takes priority over catalog icons. */
  iconUrl?: string | null;
};

function hexLuminance(hex: string): number {
  const raw = hex.replace('#', '');
  const full =
    raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return 0.5;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function normalizeHex(hex: string): string {
  return hex.replace('#', '').trim();
}

function parseBrandHex(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!/^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/.test(raw.trim())) return null;
  const cleaned = raw.trim().replace('#', '');
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  return `#${full}`;
}

/**
 * Keep catalog brand colors. Only lift near-black marks (CapCut, Notion…) on
 * dark chips so they stay visible — never flatten yellow/blue/etc. to black
 * on light surfaces.
 */
function contrastSafeTint(
  brand: string,
  bg: string | undefined
): { tint: string; lifted: boolean } {
  const brandLum = hexLuminance(brand);
  const bgLum = bg ? hexLuminance(bg) : null;
  const nearBlack = brandLum < 0.14;
  const onDark = bgLum != null && bgLum < 0.45;

  if (nearBlack && (onDark || bgLum == null)) {
    return { tint: '#f4f3ef', lifted: true };
  }
  return { tint: brand, lifted: false };
}

/** Swap the color segment in a simpleicons.org URL. */
function recolorSimpleIcon(url: string, hex: string): string {
  const clean = normalizeHex(hex);
  return url.replace(
    /simpleicons\.org\/([^/]+)\/[0-9a-fA-F]{3,8}($|\?)/,
    `simpleicons.org/$1/${clean}$2`
  );
}

export function CreatorToolLogo({
  label,
  preset,
  size = 20,
  className = '',
  bgColor,
  brandColor,
  iconUrl: customIconUrl,
}: CreatorToolLogoProps) {
  const resolvedPreset = preset ?? findCreatorToolPreset(label);
  const { urls, monochrome } = useMemo(() => {
    if (customIconUrl?.trim()) {
      return { urls: [customIconUrl.trim()], monochrome: false };
    }
    return resolvedPreset
      ? getCreatorToolIconCandidates(resolvedPreset)
      : { urls: [], monochrome: true };
  }, [customIconUrl, resolvedPreset]);
  const [urlIndex, setUrlIndex] = useState(0);

  useEffect(() => {
    setUrlIndex(0);
  }, [resolvedPreset?.id, label, customIconUrl]);

  const rawBrand = parseBrandHex(brandColor);
  const { tint: safeBrand, lifted: brandLifted } = rawBrand
    ? contrastSafeTint(rawBrand, bgColor)
    : { tint: null as string | null, lifted: false };

  const brandTint = safeBrand;
  const isDarkBg = bgColor ? hexLuminance(bgColor) < 0.4 : false;

  const iconUrl = useMemo(() => {
    const raw = urls[urlIndex] ?? null;
    if (!raw) return raw;
    if (raw.includes('simpleicons.org')) {
      if (brandTint) return recolorSimpleIcon(raw, brandTint);
      if (bgColor) return recolorSimpleIcon(raw, isDarkBg ? 'f4f3ef' : '17171b');
    }
    return raw;
  }, [urls, urlIndex, bgColor, isDarkBg, brandTint]);

  const canRecolorUrl = Boolean(iconUrl?.includes('simpleicons.org'));

  // Local CapCut / jsdelivr fallbacks cannot be recolored via URL — invert instead.
  const forceInvert =
    isDarkBg &&
    !canRecolorUrl &&
    (brandLifted || monochrome || (rawBrand != null && hexLuminance(rawBrand) < 0.35));

  const needsInvert = monochrome && !bgColor && !brandTint && !forceInvert;
  const forceBright = monochrome && !!bgColor && !isDarkBg && !brandTint && !forceInvert;

  const shell = `pf-tool-logo flex shrink-0 items-center justify-center overflow-hidden rounded-md ${
    !bgColor && monochrome && !brandTint ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-transparent'
  } ${className}`;

  const imageClass = [
    'h-full w-full object-contain',
    monochrome || forceInvert ? 'p-0.5' : 'p-0',
    needsInvert ? 'dark:invert dark:brightness-200' : '',
    forceInvert ? 'invert brightness-200' : '',
    forceBright ? '' : '',
  ]
    .join(' ')
    .trim();

  if (iconUrl && urlIndex < urls.length) {
    return (
      <span className={shell} style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconUrl}
          alt=""
          width={size}
          height={size}
          className={imageClass}
          onError={() => setUrlIndex((current) => current + 1)}
        />
      </span>
    );
  }

  return (
    <span
      className={`${shell} text-[10px] font-bold uppercase`}
      style={{
        width: size,
        height: size,
        color: brandTint
          ? brandTint
          : bgColor
            ? isDarkBg
              ? '#f4f3ef'
              : '#17171b'
            : undefined,
      }}
      aria-hidden
    >
      {label.trim().charAt(0) || '?'}
    </span>
  );
}
