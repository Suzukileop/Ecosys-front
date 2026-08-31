import type { ProfileStrengthToolLevel } from '@/types/ecosystem';

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

export type SpokenLanguageLevel = ProfileStrengthToolLevel;

export type SpokenLanguageEntry = {
  value: string;
  level?: SpokenLanguageLevel | null;
};

export const DEFAULT_LANGUAGE_PROFICIENCY_LEVELS: Array<{
  code: SpokenLanguageLevel;
  label: string;
  sortOrder: number;
}> = [
  { code: 'beginner', label: 'Beginner', sortOrder: 1 },
  { code: 'intermediate', label: 'Intermediate', sortOrder: 2 },
  { code: 'advanced', label: 'Advanced', sortOrder: 3 },
  { code: 'expert', label: 'Expert', sortOrder: 4 },
];

const LEVEL_LABELS: Record<SpokenLanguageLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export function resolveSpokenLanguageLevelLabel(
  level: SpokenLanguageLevel | null | undefined,
  options = DEFAULT_LANGUAGE_PROFICIENCY_LEVELS
): string | null {
  if (!level) return null;
  return options.find((item) => item.code === level)?.label ?? LEVEL_LABELS[level] ?? level;
}

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
  return dedupeSpokenLanguageEntries(values.map((value) => ({ value }))).map((item) => item.value);
}

/** Deduplicate spoken-language rows while preserving proficiency when provided. */
export function dedupeSpokenLanguageEntries(values: SpokenLanguageEntry[]): SpokenLanguageEntry[] {
  const presetByKey = new Map(
    SPOKEN_LANGUAGE_PRESETS.map((label) => [spokenLanguageMatchKey(label), label])
  );
  const seen = new Map<string, SpokenLanguageEntry>();

  for (const raw of values) {
    const trimmed = raw.value.trim();
    if (!trimmed) continue;
    const key = spokenLanguageMatchKey(trimmed);
    const canonical = presetByKey.get(key) ?? trimmed;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, { value: canonical, level: raw.level ?? null });
      continue;
    }
    if (!existing.level && raw.level) {
      existing.level = raw.level;
    }
  }

  return Array.from(seen.values());
}

export function spokenLanguageEntriesEqual(
  left: SpokenLanguageEntry[],
  right: SpokenLanguageEntry[]
): boolean {
  const normalize = (items: SpokenLanguageEntry[]) =>
    dedupeSpokenLanguageEntries(items)
      .map((item) => ({
        key: spokenLanguageMatchKey(item.value),
        level: item.level ?? null,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));

  const leftNorm = normalize(left);
  const rightNorm = normalize(right);
  if (leftNorm.length !== rightNorm.length) return false;
  return leftNorm.every(
    (item, index) => item.key === rightNorm[index]?.key && item.level === rightNorm[index]?.level
  );
}

export function parseSpokenLanguageEntries(
  raw: unknown,
  legacyLanguages?: string | null
): SpokenLanguageEntry[] {
  let parsed: SpokenLanguageEntry[] = [];

  if (Array.isArray(raw) && raw.length > 0) {
    const entries: SpokenLanguageEntry[] = [];
    for (const item of raw) {
      if (typeof item === 'string') {
        const value = item.trim();
        if (value) entries.push({ value, level: null });
        continue;
      }
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        const value = String(record.value ?? record.name ?? '').trim();
        if (!value) continue;
        const levelRaw = record.level != null ? String(record.level).trim() : '';
        const level = isSpokenLanguageLevel(levelRaw) ? levelRaw : null;
        entries.push({ value, level });
      }
    }
    parsed = entries;
  } else {
    const legacy = legacyLanguages?.trim();
    if (legacy) {
      parsed = legacy
        .split(/[,;|/]+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((value) => ({ value, level: null }));
    }
  }

  return dedupeSpokenLanguageEntries(parsed);
}

function isSpokenLanguageLevel(value: string): value is SpokenLanguageLevel {
  return value === 'beginner' || value === 'intermediate' || value === 'advanced' || value === 'expert';
}

export function serializeSpokenLanguagesForApi(
  values: SpokenLanguageEntry[]
): Array<{ name: string; level: SpokenLanguageLevel | null }> {
  return dedupeSpokenLanguageEntries(values)
    .map((item) => ({
      name: item.value,
      level: item.level ?? null,
    }))
    .filter((item) => item.name.length > 0);
}
