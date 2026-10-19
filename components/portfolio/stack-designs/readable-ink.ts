/**
 * Contrast-safe ink for Tools designs whose colours come from the creator's palette.
 * Everything works on hex colours; anything else (currentColor, rgba…) falls back
 * to a plain `color-mix`, since it can't be measured here.
 */
export function mixInk(color: string, percent: number, surface: string): string {
  return `color-mix(in srgb, ${color} ${percent}%, ${surface})`;
}

type Rgb = { r: number; g: number; b: number };

function parseHex(color: string): Rgb | null {
  const hex = color.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function luminance({ r, g, b }: Rgb): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrast(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function blend(ink: Rgb, surface: Rgb, percent: number): Rgb {
  const t = percent / 100;
  return {
    r: Math.round(ink.r * t + surface.r * (1 - t)),
    g: Math.round(ink.g * t + surface.g * (1 - t)),
    b: Math.round(ink.b * t + surface.b * (1 - t)),
  };
}

/**
 * Softened ink that still clears `minRatio` on the card surface: starts at the
 * design's tint (`percent`) and moves toward full ink until WCAG passes, so custom
 * palettes can't push secondary text below AA. Non-hex colours keep the plain
 * `color-mix` (they can't be measured here).
 */
export function readableMix(ink: string, percent: number, surface: string, minRatio = 4.5): string {
  const inkRgb = parseHex(ink);
  const surfaceRgb = parseHex(surface);
  if (!inkRgb || !surfaceRgb) return mixInk(ink, percent, surface);
  for (let p = percent; p <= 100; p += 4) {
    const mixed = blend(inkRgb, surfaceRgb, Math.min(p, 100));
    if (contrast(mixed, surfaceRgb) >= minRatio) {
      return `rgb(${mixed.r}, ${mixed.g}, ${mixed.b})`;
    }
  }
  // Even the full ink is too faint on this surface: push it toward black (light
  // card) or white (dark card) — keeps the hue's warmth while reaching AA.
  const extreme = luminance(surfaceRgb) > 0.18 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  for (let p = 8; p <= 100; p += 8) {
    const pushed = blend(extreme, inkRgb, p);
    if (contrast(pushed, surfaceRgb) >= minRatio) {
      return `rgb(${pushed.r}, ${pushed.g}, ${pushed.b})`;
    }
  }
  return `rgb(${extreme.r}, ${extreme.g}, ${extreme.b})`;
}

/**
 * The creator's accent when it reads on the card, else the ink pushed to the same
 * ratio. Default 3:1 suits bars and indicators; pass 4.5 when the accent colours text.
 */
export function readableAccent(accent: string, ink: string, surface: string, minRatio = 3): string {
  const a = parseHex(accent);
  const s = parseHex(surface);
  if (!a || !s) return accent;
  return contrast(a, s) >= minRatio ? accent : readableMix(ink, 100, surface, minRatio);
}
