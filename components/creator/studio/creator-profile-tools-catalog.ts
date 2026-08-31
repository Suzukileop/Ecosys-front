/**
 * Lightweight tool helpers — no built-in logo catalog.
 * Logos: user upload → TechIcons PNG bundle → Simple Icons → letter (see CreatorToolLogo).
 */

export type CreatorToolCategoryId =
  | 'video'
  | 'design'
  | 'audio'
  | 'ai'
  | 'social'
  | 'dev'
  | 'other';

/** @deprecated Presets removed — names only come from the user. Kept for type compatibility. */
export type CreatorToolPreset = {
  id: string;
  name: string;
  category: CreatorToolCategoryId;
  aliases?: string[];
};

const CATEGORY_LABELS: Record<CreatorToolCategoryId, string> = {
  video: 'Video editing',
  design: 'Design',
  audio: 'Audio',
  ai: 'AI',
  social: 'Social',
  dev: 'Development',
  other: 'Other',
};

export const CREATOR_TOOL_CATEGORY_LABELS_FR: Record<CreatorToolCategoryId, string> = {
  video: 'Vidéo',
  design: 'Design',
  audio: 'Audio',
  ai: 'IA',
  social: 'Social',
  dev: 'Développement',
  other: 'Autre',
};

export function getCreatorToolCategoryLabel(
  category: string | null | undefined,
  locale: 'en' | 'fr' = 'fr'
): string {
  if (!category?.trim()) return '';
  const key = category.trim().toLowerCase() as CreatorToolCategoryId;
  const map = locale === 'fr' ? CREATOR_TOOL_CATEGORY_LABELS_FR : CATEGORY_LABELS;
  if (key in map) return map[key];
  return category.trim();
}

export function getCreatorToolCategories(): Array<{ id: CreatorToolCategoryId; label: string }> {
  const ordered: CreatorToolCategoryId[] = [
    'video',
    'design',
    'audio',
    'ai',
    'social',
    'dev',
    'other',
  ];
  return ordered.map((id) => ({ id, label: CREATOR_TOOL_CATEGORY_LABELS_FR[id] }));
}

/** Always empty — preset logo catalog removed. */
export const CREATOR_TOOL_PRESETS: CreatorToolPreset[] = [];

export function findCreatorToolPreset(_value: string): CreatorToolPreset | undefined {
  return undefined;
}

export function getCreatorToolIconCandidates(_preset: CreatorToolPreset): {
  urls: string[];
  monochrome: boolean;
} {
  return { urls: [], monochrome: false };
}

export function resolveCreatorToolBrandHex(_label: string): string | null {
  return null;
}

export function resolveCreatorToolLogoHex(_label: string): string | null {
  return null;
}

/** @deprecated */
export function getCreatorToolIconUrl(_preset: CreatorToolPreset): string | null {
  return null;
}
