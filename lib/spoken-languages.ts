export const SPOKEN_LANGUAGE_PRESETS = [
  'Français',
  'English',
  'Español',
  'Deutsch',
  'Italiano',
  'Português',
  'العربية',
  '中文',
  '日本語',
  '한국어',
  'Русский',
  'Nederlands',
] as const;

/** Case- and accent-insensitive key for deduplication (FRANCAIS ≈ Français). */
export function spokenLanguageMatchKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Deduplicate languages; prefer preset label when the entry matches a known language. */
export function dedupeSpokenLanguages(values: string[]): string[] {
  const presetByKey = new Map(
    SPOKEN_LANGUAGE_PRESETS.map((label) => [spokenLanguageMatchKey(label), label])
  );
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of values) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = spokenLanguageMatchKey(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(presetByKey.get(key) ?? trimmed);
  }

  return result;
}
