'use client';

import { resolveCreatorToolSimpleIcon } from '@/components/creator/studio/creator-tool-simple-icons';
import { resolveCreatorToolTechIconUrl } from '@/components/creator/studio/creator-tool-tech-icons';

/**
 * Tool mark priority:
 * 1. User-uploaded `iconUrl`
 * 2. Bundled TechIcons PNG (public/tool-icons/png-512)
 * 3. Auto Simple Icons match from tool name / keywords
 * 4. First letter fallback
 */
type CreatorToolLogoProps = {
  label: string;
  size?: number;
  className?: string;
  /** Optional solid surface behind the mark (chip / card). */
  bgColor?: string;
  /** Explicit glyph color override (letter / auto icon). */
  brandColor?: string;
  /** Page color mode for contrast when bg is dark/light. */
  colorMode?: 'light' | 'dark';
  /** User-uploaded logo URL — always wins over auto detection. */
  iconUrl?: string | null;
  /** Disable bundled PNG + Simple Icons auto-match (letter only if no upload). */
  disableAutoIcon?: boolean;
  /** Apply grayscale (noir & blanc) to the mark. */
  grayscale?: boolean;
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

function isDarkSurface(bgColor: string | undefined, colorMode?: 'light' | 'dark'): boolean {
  if (bgColor && /^#?[0-9a-fA-F]{3,6}$/.test(bgColor.trim()) && !/^transparent$/i.test(bgColor)) {
    return hexLuminance(bgColor) < 0.4;
  }
  return colorMode === 'dark';
}

function contrastSafeBrand(brand: string, darkSurface: boolean): string {
  const lum = hexLuminance(brand);
  if (lum < 0.14 && darkSurface) return '#f4f3ef';
  if (lum > 0.85 && !darkSurface) return '#17171b';
  return brand.startsWith('#') ? brand : `#${brand}`;
}

export function CreatorToolLogo({
  label,
  size = 20,
  className = '',
  bgColor,
  brandColor,
  colorMode,
  iconUrl,
  disableAutoIcon = false,
  grayscale = false,
}: CreatorToolLogoProps) {
  const uploadedUrl = iconUrl?.trim() || null;
  const shell = `pf-tool-logo flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-transparent ${className}`;
  const dark = isDarkSurface(bgColor, colorMode);
  const markFilter = grayscale ? { filter: 'grayscale(1)' } : undefined;

  if (uploadedUrl) {
    return (
      <span className={shell} style={{ width: size, height: size, ...markFilter }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={uploadedUrl}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  if (!disableAutoIcon) {
    const techUrl = resolveCreatorToolTechIconUrl(label);
    if (techUrl) {
      return (
        <span className={shell} style={{ width: size, height: size, ...markFilter }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={techUrl}
            alt=""
            width={size}
            height={size}
            className="h-full w-full object-contain"
          />
        </span>
      );
    }

    const auto = resolveCreatorToolSimpleIcon(label);
    if (auto) {
      const color = contrastSafeBrand(brandColor?.trim() || auto.hex, dark);
      const Icon = auto.Icon;
      return (
        <span
          className={shell}
          style={{ width: size, height: size, ...markFilter }}
          title={auto.matchedName}
        >
          <Icon size={size} color={color} title="" aria-hidden />
        </span>
      );
    }
  }

  const letterColor =
    brandColor?.trim() || (dark ? '#f4f3ef' : '#17171b');
  /** Cap height reads smaller than SVG logos — use ~84% of the tile for visual parity. */
  const letterPx = Math.max(16, Math.round(size * 0.84));

  return (
    <span
      className={`${shell} font-bold uppercase leading-none tracking-tight`}
      style={{
        width: size,
        height: size,
        fontSize: letterPx,
        color: letterColor,
        ...markFilter,
      }}
      aria-hidden
    >
      {label.trim().charAt(0) || '?'}
    </span>
  );
}
