export function normalizeCoverObjectPositionY(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function coverImageObjectPosition(y?: number | null): string {
  return `center ${normalizeCoverObjectPositionY(y ?? 50)}%`;
}
