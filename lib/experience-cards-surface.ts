function rgb(hex: string): number[] | null {
  const value = hex.trim().replace(/^#/, '');
  const full = value.length === 3 ? value.split('').map(c => c + c).join('') : value;
  return /^[0-9a-f]{6}$/i.test(full) ? [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16)) : null;
}
/** Precompose the tint: stacked cards stay opaque and contrast remains deterministic. */
export function experienceCardsSurface(tint: string, background: string, opacity: number): string {
  const base = rgb(background) ?? [16, 16, 16];
  const color = rgb(tint) ?? base;
  const alpha = Math.max(0, Math.min(100, opacity)) / 100;
  return '#' + color.map((value, i) => Math.round(value * alpha + base[i] * (1 - alpha)).toString(16).padStart(2, '0')).join('');
}
