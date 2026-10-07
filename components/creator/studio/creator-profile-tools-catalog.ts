/**
 * Lightweight tool helpers — no built-in logo catalog.
 * Logos: user upload → TechIcons PNG bundle → Simple Icons → letter (see CreatorToolLogo).
 */

type CreatorToolCategoryId =
  | 'video'
  | 'design'
  | 'audio'
  | 'ai'
  | 'social'
  | 'dev'
  | 'other';

const CATEGORY_LABELS: Record<CreatorToolCategoryId, string> = {
  video: 'Video editing',
  design: 'Design',
  audio: 'Audio',
  ai: 'AI',
  social: 'Social',
  dev: 'Development',
  other: 'Other',
};

const CREATOR_TOOL_CATEGORY_LABELS_FR: Record<CreatorToolCategoryId, string> = {
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
