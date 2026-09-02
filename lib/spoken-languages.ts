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

/**
 * Representative ISO 3166-1 alpha-2 for a spoken language (for {@link CountryFlag}).
 * Keys are accent/case-insensitive match keys from {@link spokenLanguageMatchKey}.
 */
const SPOKEN_LANGUAGE_FLAG_ISO2: Record<string, string> = {
  // Presets
  francais: 'FR',
  english: 'GB',
  espanol: 'ES',
  deutsch: 'DE',
  italiano: 'IT',
  portugues: 'PT',
  العربية: 'SA',
  中文: 'CN',
  日本語: 'JP',
  한국어: 'KR',
  русский: 'RU',
  nederlands: 'NL',
  // Common FR / EN / aliases
  french: 'FR',
  fr: 'FR',
  en: 'GB',
  anglais: 'GB',
  spanish: 'ES',
  es: 'ES',
  castillan: 'ES',
  castilian: 'ES',
  german: 'DE',
  allemand: 'DE',
  de: 'DE',
  italian: 'IT',
  italien: 'IT',
  it: 'IT',
  portuguese: 'PT',
  portugais: 'PT',
  pt: 'PT',
  brazilian: 'BR',
  bresilien: 'BR',
  'brazilian portuguese': 'BR',
  'portugais bresilien': 'BR',
  arabic: 'SA',
  arabe: 'SA',
  ar: 'SA',
  chinese: 'CN',
  chinois: 'CN',
  mandarin: 'CN',
  zh: 'CN',
  japanese: 'JP',
  japonais: 'JP',
  ja: 'JP',
  korean: 'KR',
  coreen: 'KR',
  ko: 'KR',
  russian: 'RU',
  russe: 'RU',
  ru: 'RU',
  dutch: 'NL',
  neerlandais: 'NL',
  hollandais: 'NL',
  nl: 'NL',
  // Extra frequent languages
  catalan: 'ES',
  catala: 'ES',
  basque: 'ES',
  euskara: 'ES',
  galician: 'ES',
  galego: 'ES',
  polish: 'PL',
  polonais: 'PL',
  pl: 'PL',
  turkish: 'TR',
  turc: 'TR',
  tr: 'TR',
  swedish: 'SE',
  suedois: 'SE',
  sv: 'SE',
  norwegian: 'NO',
  norvegien: 'NO',
  no: 'NO',
  danish: 'DK',
  danois: 'DK',
  da: 'DK',
  finnish: 'FI',
  finnois: 'FI',
  fi: 'FI',
  greek: 'GR',
  grec: 'GR',
  el: 'GR',
  hebrew: 'IL',
  hebreu: 'IL',
  he: 'IL',
  hindi: 'IN',
  hi: 'IN',
  vietnamese: 'VN',
  vietnamien: 'VN',
  vi: 'VN',
  thai: 'TH',
  th: 'TH',
  czech: 'CZ',
  tcheque: 'CZ',
  cs: 'CZ',
  romanian: 'RO',
  roumain: 'RO',
  ro: 'RO',
  hungarian: 'HU',
  hongrois: 'HU',
  hu: 'HU',
  ukrainian: 'UA',
  ukrainien: 'UA',
  uk: 'UA',
  croatian: 'HR',
  croate: 'HR',
  hr: 'HR',
  serbian: 'RS',
  serbe: 'RS',
  sr: 'RS',
  bulgarian: 'BG',
  bulgare: 'BG',
  bg: 'BG',
  slovak: 'SK',
  slovaque: 'SK',
  sk: 'SK',
  slovene: 'SI',
  slovenian: 'SI',
  sl: 'SI',
  lithuanian: 'LT',
  lituanien: 'LT',
  lt: 'LT',
  latvian: 'LV',
  letton: 'LV',
  lv: 'LV',
  estonian: 'EE',
  estonien: 'EE',
  et: 'EE',
  indonesian: 'ID',
  indonesien: 'ID',
  id: 'ID',
  malay: 'MY',
  malais: 'MY',
  ms: 'MY',
  tagalog: 'PH',
  filipino: 'PH',
  tl: 'PH',
  swahili: 'KE',
  sw: 'KE',
  persian: 'IR',
  farsi: 'IR',
  persan: 'IR',
  fa: 'IR',
  urdu: 'PK',
  ur: 'PK',
  bengali: 'BD',
  bn: 'BD',
  amharic: 'ET',
  amharique: 'ET',
  am: 'ET',
  albanian: 'AL',
  albanais: 'AL',
  sq: 'AL',
  georgian: 'GE',
  georgien: 'GE',
  ka: 'GE',
  armenian: 'AM',
  armenien: 'AM',
  hy: 'AM',
  azerbaijani: 'AZ',
  azeri: 'AZ',
  az: 'AZ',
  kazakh: 'KZ',
  kk: 'KZ',
  icelandic: 'IS',
  islandais: 'IS',
  is: 'IS',
  irish: 'IE',
  irlandais: 'IE',
  ga: 'IE',
  welsh: 'GB',
  gallois: 'GB',
  cy: 'GB',
  maltese: 'MT',
  maltais: 'MT',
  mt: 'MT',
  luxembourgish: 'LU',
  luxembourgeois: 'LU',
  lb: 'LU',
  american: 'US',
  'american english': 'US',
  'anglais americain': 'US',
  'british english': 'GB',
  'anglais britannique': 'GB',
};

/** ISO 639-1 → representative country for CountryFlag. */
const ISO639_TO_FLAG: Record<string, string> = {
  aa: 'DJ',
  af: 'ZA',
  am: 'ET',
  ar: 'SA',
  az: 'AZ',
  be: 'BY',
  bg: 'BG',
  bn: 'BD',
  bs: 'BA',
  ca: 'ES',
  cs: 'CZ',
  cy: 'GB',
  da: 'DK',
  de: 'DE',
  el: 'GR',
  en: 'GB',
  es: 'ES',
  et: 'EE',
  eu: 'ES',
  fa: 'IR',
  fi: 'FI',
  fr: 'FR',
  ga: 'IE',
  gl: 'ES',
  gu: 'IN',
  he: 'IL',
  hi: 'IN',
  hr: 'HR',
  hu: 'HU',
  hy: 'AM',
  id: 'ID',
  is: 'IS',
  it: 'IT',
  ja: 'JP',
  ka: 'GE',
  kk: 'KZ',
  km: 'KH',
  kn: 'IN',
  ko: 'KR',
  ku: 'IQ',
  ky: 'KG',
  lb: 'LU',
  lo: 'LA',
  lt: 'LT',
  lv: 'LV',
  mk: 'MK',
  ml: 'IN',
  mn: 'MN',
  mr: 'IN',
  ms: 'MY',
  mt: 'MT',
  my: 'MM',
  ne: 'NP',
  nl: 'NL',
  no: 'NO',
  pa: 'IN',
  pl: 'PL',
  ps: 'AF',
  pt: 'PT',
  ro: 'RO',
  ru: 'RU',
  si: 'LK',
  sk: 'SK',
  sl: 'SI',
  so: 'SO',
  sq: 'AL',
  sr: 'RS',
  sv: 'SE',
  sw: 'KE',
  ta: 'IN',
  te: 'IN',
  th: 'TH',
  tl: 'PH',
  tr: 'TR',
  uk: 'UA',
  ur: 'PK',
  uz: 'UZ',
  vi: 'VN',
  zh: 'CN',
};

let displayNameFlagLookup: Map<string, string> | null = null;

function buildDisplayNameFlagLookup(): Map<string, string> {
  const map = new Map<string, string>();
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') {
    return map;
  }
  const locales = ['en', 'fr', 'es', 'de', 'it', 'pt', 'nl', 'ru', 'ar', 'zh', 'ja', 'ko'];
  for (const [langCode, flagIso] of Object.entries(ISO639_TO_FLAG)) {
    for (const locale of locales) {
      try {
        const dn = new Intl.DisplayNames([locale], { type: 'language' });
        const label = dn.of(langCode);
        if (label) map.set(spokenLanguageMatchKey(label), flagIso);
      } catch {
        // Ignore unsupported locale / language pairs.
      }
    }
  }
  return map;
}

/**
 * Resolve a spoken-language label (or ISO code) to a country ISO2 for flag display.
 * Returns null when no confident match exists.
 */
export function resolveSpokenLanguageFlagIso2(language: string | null | undefined): string | null {
  const trimmed = language?.trim();
  if (!trimmed) return null;

  const key = spokenLanguageMatchKey(trimmed);
  const curated = SPOKEN_LANGUAGE_FLAG_ISO2[key];
  if (curated) return curated;

  if (/^[a-z]{2}$/i.test(trimmed)) {
    const fromIso = ISO639_TO_FLAG[trimmed.toLowerCase()];
    if (fromIso) return fromIso;
  }

  // "en-US", "fr_FR", "pt-BR"
  const localeMatch = trimmed.match(/^([a-z]{2})[-_]([a-z]{2})$/i);
  if (localeMatch) {
    const region = localeMatch[2].toUpperCase();
    if (region.length === 2) return region;
    const fromLang = ISO639_TO_FLAG[localeMatch[1].toLowerCase()];
    if (fromLang) return fromLang;
  }

  if (!displayNameFlagLookup) {
    displayNameFlagLookup = buildDisplayNameFlagLookup();
  }
  return displayNameFlagLookup.get(key) ?? null;
}
