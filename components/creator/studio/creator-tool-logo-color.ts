'use client';

import { useEffect, useMemo, useState } from 'react';
import { resolveCreatorToolSimpleIcon } from '@/components/creator/studio/creator-tool-simple-icons';
import {
  creatorToolHasTechIcon,
  resolveCreatorToolTechIconUrl,
} from '@/components/creator/studio/creator-tool-tech-icons';
import type { ProfileStrengthToolLevel } from '@/types/ecosystem';

const LEVEL_PERCENT: Record<ProfileStrengthToolLevel, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

export function resolveToolLevelPercent(level: ProfileStrengthToolLevel | null | undefined): number {
  if (!level) return 0;
  return LEVEL_PERCENT[level] ?? 0;
}

/** Upload, TechIcons PNG, or Simple Icons match — letter-only tools return false. */
export function hasToolLogoBrandSource(
  label: string,
  iconUrl: string | null | undefined
): boolean {
  if (iconUrl?.trim()) return true;
  if (creatorToolHasTechIcon(label)) return true;
  return resolveCreatorToolSimpleIcon(label) != null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function isNeutralRgb(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return true;
  const saturation = (max - min) / max;
  if (saturation < 0.12) return true;
  if (max - min < 18 && max > 210) return true;
  if (max < 28) return true;
  return false;
}

function rgbSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function quantizeChannel(value: number): number {
  return Math.round(value / 32) * 32;
}

function parseHexColor(hex: string): [number, number, number] | null {
  const raw = hex.replace('#', '').trim();
  const full =
    raw.length === 3 ? raw.split('').map((char) => char + char).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function hexLuminance(hex: string): number {
  const rgb = parseHexColor(hex);
  if (!rgb) return 0.5;
  const linear = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function hexContrastRatio(foreground: string, background: string): number {
  const a = hexLuminance(foreground);
  const b = hexLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Reject registry colors that cannot read on the card / section surface. */
function isUsableLevelBrandHex(
  hex: string | null | undefined,
  surfaceHex: string,
  minContrast = 2
): boolean {
  if (!hex?.trim() || !parseHexColor(hex)) return false;
  if (hexLuminance(hex) < 0.07) return false;
  return hexContrastRatio(hex.trim(), surfaceHex) >= minContrast;
}

/**
 * Pick the best ring / bar tint: saturated logo color when visible,
 * otherwise fall back to label ink.
 */
export function pickToolLevelBrandColor(
  candidates: Array<string | null | undefined>,
  surfaceHex: string,
  fallback: string
): string {
  for (const hex of candidates) {
    if (isUsableLevelBrandHex(hex, surfaceHex)) return hex!.trim();
  }
  for (const hex of candidates) {
    if (!hex?.trim() || !parseHexColor(hex)) continue;
    if (hexLuminance(hex) >= 0.07 && hexContrastRatio(hex, surfaceHex) >= 1.4) {
      return hex.trim();
    }
  }
  return fallback;
}

/** Official brand hex — skip unusable near-black registry colors (e.g. OpenJDK). */
export function resolveCreatorToolBrandHex(label: string): string | null {
  const resolved = resolveCreatorToolSimpleIcon(label);
  if (!resolved) return null;
  if (resolved.matchedName === 'Java' && hexLuminance(resolved.hex) < 0.07) {
    return '#5382A1';
  }
  if (hexLuminance(resolved.hex) < 0.07) return null;
  return resolved.hex;
}

/** Sample uploaded logo pixels and return the most frequent saturated color. */
export async function extractDominantColorFromImageUrl(url: string): Promise<string | null> {
  if (typeof window === 'undefined' || !url.trim()) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';

    img.onload = () => {
      try {
        const size = 40;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const buckets = new Map<string, number>();

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 120) continue;

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (isNeutralRgb(r, g, b)) continue;

          const key = rgbToHex(
            quantizeChannel(r),
            quantizeChannel(g),
            quantizeChannel(b)
          );
          const sat = rgbSaturation(r, g, b);
          const weight = sat * (alpha / 255);
          buckets.set(key, (buckets.get(key) ?? 0) + weight);
        }

        let bestKey: string | null = null;
        let bestScore = 0;
        for (const [key, score] of buckets) {
          if (score > bestScore) {
            bestKey = key;
            bestScore = score;
          }
        }

        resolve(bestKey);
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Bar / % tint: logo dominant color when a logo exists,
 * else label text color (nothing to extract from a letter fallback).
 */
export function useToolLevelBarColor(
  label: string,
  iconUrl: string | null | undefined,
  labelColor: string,
  surfaceColor?: string
): { barColor: string; fromLogo: boolean } {
  const hasLogoBrand = useMemo(
    () => hasToolLogoBrandSource(label, iconUrl),
    [label, iconUrl]
  );

  const registryHex = useMemo(() => resolveCreatorToolBrandHex(label), [label]);
  const surfaceHex = useMemo(() => {
    const candidate = surfaceColor?.trim();
    if (candidate && parseHexColor(candidate)) return candidate;
    return hexLuminance(labelColor) > 0.55 ? '#0a0a0a' : '#f5f5f5';
  }, [surfaceColor, labelColor]);

  const [uploadedHex, setUploadedHex] = useState<string | null>(null);

  useEffect(() => {
    setUploadedHex(null);
    const url = iconUrl?.trim() || resolveCreatorToolTechIconUrl(label);
    if (!url) return;

    let cancelled = false;
    void extractDominantColorFromImageUrl(url).then((extracted) => {
      if (!cancelled) setUploadedHex(extracted);
    });

    return () => {
      cancelled = true;
    };
  }, [iconUrl, label]);

  if (!hasLogoBrand) {
    return { barColor: labelColor, fromLogo: false };
  }

  const logoColor = pickToolLevelBrandColor(
    [uploadedHex, registryHex],
    surfaceHex,
    labelColor
  );
  const fromLogo = logoColor !== labelColor;

  return { barColor: logoColor, fromLogo };
}
