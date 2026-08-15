/** Popular discovery chips — shortcuts only, not a closed input vocabulary. */
export const PROFILE_SPECIALTIES = [
  'Developer',
  'Design',
  'Marketing',
  'Video editor',
  'UI / UX',
  'Branding',
  'Music',
  'Writing',
  'Illustration',
  '3D',
  'Photography',
  'Data science',
] as const;

export type ProfileSpecialty = (typeof PROFILE_SPECIALTIES)[number];

export const MAX_PROFILE_SPECIALTIES = 3;
export const MAX_SPECIALTY_LENGTH = 80;
export const MAX_SPECIALTY_TAGS = 8;
export const MAX_SPECIALTY_TAG_LENGTH = 40;

const ALIAS_TO_LABEL: Record<string, ProfileSpecialty> = {
  developer: 'Developer',
  development: 'Developer',
  dev: 'Developer',
  'software developer': 'Developer',
  'software engineer': 'Developer',
  programmer: 'Developer',
  design: 'Design',
  designer: 'Design',
  'graphic design': 'Design',
  'graphic designer': 'Design',
  marketing: 'Marketing',
  marketer: 'Marketing',
  'video editor': 'Video editor',
  'video editing': 'Video editor',
  videographer: 'Video editor',
  video: 'Video editor',
  'ui / ux': 'UI / UX',
  'ui/ux': 'UI / UX',
  uiux: 'UI / UX',
  'ui ux': 'UI / UX',
  ux: 'UI / UX',
  ui: 'UI / UX',
  'user experience': 'UI / UX',
  branding: 'Branding',
  brand: 'Branding',
  music: 'Music',
  musician: 'Music',
  writing: 'Writing',
  writer: 'Writing',
  copywriting: 'Writing',
  illustration: 'Illustration',
  illustrator: 'Illustration',
  '3d': '3D',
  photography: 'Photography',
  photographer: 'Photography',
  photo: 'Photography',
  'data science': 'Data science',
  'data scientist': 'Data science',
  datascience: 'Data science',
  'data scien': 'Data science',
};

export function specialtyKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function compactSpecialtyKey(value: string): string {
  return specialtyKey(value).replace(/[\s/]+/g, '');
}

/** Maps Popular-chip aliases. Unknown free-text labels return null. */
export function canonicalizeSpecialty(raw: string | null | undefined): ProfileSpecialty | null {
  if (!raw) return null;
  const key = specialtyKey(raw);
  if (!key) return null;
  const fromAlias = ALIAS_TO_LABEL[key] ?? ALIAS_TO_LABEL[compactSpecialtyKey(raw)];
  if (fromAlias) return fromAlias;
  const exact = PROFILE_SPECIALTIES.find((label) => specialtyKey(label) === key);
  return exact ?? null;
}

export function sanitizeSpecialtyLabel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/\s+/g, ' ').slice(0, MAX_SPECIALTY_LENGTH).trim();
  return trimmed || null;
}

export function parseSpecialtyList(raw: unknown, fallbackPrimary?: string | null): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const push = (value: unknown) => {
    const label = sanitizeSpecialtyLabel(typeof value === 'string' ? value : '');
    if (!label) return;
    const key = specialtyKey(label);
    if (seen.has(key) || result.length >= MAX_PROFILE_SPECIALTIES) return;
    seen.add(key);
    result.push(label);
  };
  if (Array.isArray(raw)) {
    raw.forEach(push);
  }
  if (result.length === 0 && fallbackPrimary) {
    push(fallbackPrimary);
  }
  return result;
}

export function parseSpecialtyTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim().slice(0, MAX_SPECIALTY_TAG_LENGTH);
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
    if (result.length >= MAX_SPECIALTY_TAGS) break;
  }
  return result;
}

export function primarySpecialty(specialties: string[], fallback?: string | null): string | null {
  if (specialties.length > 0) return specialties[0];
  return sanitizeSpecialtyLabel(fallback);
}

export function matchSpecialtyOption(value: string | null | undefined, options: string[]): string {
  if (!value?.trim() || options.length === 0) return '';
  const key = specialtyKey(value);
  return options.find((item) => specialtyKey(item) === key) ?? '';
}

export function specialtyGroupLabel(value: string | null | undefined, options: string[] = []): string {
  return matchSpecialtyOption(value, options) || value?.trim() || 'Other';
}

export function specialtiesMatchFilter(
  specialties: string[],
  primary: string | null,
  filter: string
): boolean {
  const needle = specialtyKey(filter);
  const compactNeedle = compactSpecialtyKey(filter);
  if (!needle) return false;
  const haystacks = [...specialties, primary ?? ''].filter(Boolean);
  return haystacks.some((item) => {
    const key = specialtyKey(item);
    const compact = compactSpecialtyKey(item);
    return key.includes(needle) || (!!compactNeedle && compact.includes(compactNeedle));
  });
}
