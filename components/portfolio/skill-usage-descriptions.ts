import { getCreatorToolCategoryLabel } from '@/components/creator/studio/creator-profile-tools-catalog';
import type { ProfileStrengthTool, ProfileStrengthToolLevel } from '@/types/ecosystem';
export type PortfolioSkillRef = string | ProfileStrengthTool;

export function resolveSkillName(skill: PortfolioSkillRef): string {
  return typeof skill === 'string' ? skill : skill.name;
}

/** User-uploaded icon only — auto TechIcons/Simple Icons resolution stays in CreatorToolLogo. */
export function resolveSkillIconUrl(skill: PortfolioSkillRef): string | null {
  if (typeof skill !== 'string') {
    const uploaded = skill.iconUrl?.trim();
    if (uploaded) return uploaded;
  }
  return null;
}

export function resolveSkillDescription(skill: PortfolioSkillRef): string {
  if (typeof skill !== 'string') {
    const custom = skill.description?.trim();
    if (custom) return custom;
  }
  return getSkillUsageDescription(resolveSkillName(skill));
}

const LEVEL_LABELS: Record<ProfileStrengthToolLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export function resolveSkillLevel(skill: PortfolioSkillRef): ProfileStrengthToolLevel | null {
  if (typeof skill === 'string') return null;
  return skill.level ?? null;
}

export function resolveSkillLevelLabel(skill: PortfolioSkillRef): string {
  const level = resolveSkillLevel(skill);
  return level ? LEVEL_LABELS[level] : '';
}

export function resolveSkillCategory(skill: PortfolioSkillRef): string {
  if (typeof skill !== 'string') {
    const custom = skill.category?.trim();
    if (custom) return getCreatorToolCategoryLabel(custom);
  }
  return '';
}

/** Sort key for category-grouped portfolio lists (table rows, etc.). */
export function compareSkillsByCategoryThenName(
  a: PortfolioSkillRef,
  b: PortfolioSkillRef
): number {
  const categoryA = resolveSkillCategory(a).toLocaleLowerCase();
  const categoryB = resolveSkillCategory(b).toLocaleLowerCase();
  if (!categoryA && categoryB) return 1;
  if (categoryA && !categoryB) return -1;
  if (categoryA !== categoryB) {
    return categoryA.localeCompare(categoryB, undefined, { sensitivity: 'base' });
  }
  return resolveSkillName(a).localeCompare(resolveSkillName(b), undefined, { sensitivity: 'base' });
}

export type SkillCategoryGroup = {
  category: string;
  tools: PortfolioSkillRef[];
};

const UNCATEGORIZED_GROUP_LABEL = 'Other';

/** Group tools by category label (sorted). Uncategorized items land in "Other". */
export function groupSkillsByCategory(tools: PortfolioSkillRef[]): SkillCategoryGroup[] {
  const order: string[] = [];
  const buckets = new Map<string, PortfolioSkillRef[]>();

  for (const tool of tools) {
    const category = resolveSkillCategory(tool).trim() || UNCATEGORIZED_GROUP_LABEL;
    const key = category.toLocaleLowerCase();
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(tool);
    } else {
      order.push(key);
      buckets.set(key, [tool]);
    }
  }

  return order
    .map((key) => {
      const items = buckets.get(key) ?? [];
      const category =
        items.length > 0
          ? resolveSkillCategory(items[0]).trim() || UNCATEGORIZED_GROUP_LABEL
          : UNCATEGORIZED_GROUP_LABEL;
      return {
        category,
        tools: [...items].sort(compareSkillsByLevelThenName),
      };
    })
    .sort((a, b) => a.category.localeCompare(b.category, undefined, { sensitivity: 'base' }));
}

/** Unique non-empty category labels from a tool list (sorted). */
export function collectSkillCategories(tools: PortfolioSkillRef[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const tool of tools) {
    const category = resolveSkillCategory(tool);
    if (!category) continue;
    const key = category.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    categories.push(category);
  }
  return categories.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

const LEVEL_SORT_RANK: Record<ProfileStrengthToolLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

/** Sort key for level-grouped portfolio lists (table rows, etc.). */
export function compareSkillsByLevelThenName(
  a: PortfolioSkillRef,
  b: PortfolioSkillRef
): number {
  const levelA = resolveSkillLevel(a);
  const levelB = resolveSkillLevel(b);
  const rankA = levelA ? LEVEL_SORT_RANK[levelA] : 0;
  const rankB = levelB ? LEVEL_SORT_RANK[levelB] : 0;
  if (rankA !== rankB) return rankB - rankA;
  return resolveSkillName(a).localeCompare(resolveSkillName(b), undefined, { sensitivity: 'base' });
}

/** Uppercase category line for level-category-rows (prefers raw user label). */
export function resolveSkillCategoryDisplay(skill: PortfolioSkillRef): string {
  if (typeof skill !== 'string') {
    const raw = skill.category?.trim();
    if (raw) return raw.toUpperCase();
  }
  const labeled = resolveSkillCategory(skill);
  return labeled ? labeled.toUpperCase() : '';
}

export function resolveSkillUseCases(skill: PortfolioSkillRef): string[] {
  if (typeof skill === 'string') return [];
  return (skill.useCases ?? []).map((entry) => entry.trim()).filter(Boolean).slice(0, 8);
}

export function resolveSkillExperienceLabel(skill: PortfolioSkillRef): string {
  if (typeof skill === 'string') return '';
  if (typeof skill.experienceYears === 'number' && skill.experienceYears > 0) {
    const years = skill.experienceYears;
    return years === 1 ? '1 year of experience' : `${years} years of experience`;
  }
  if (skill.experienceYears === 0) return 'Less than a year';
  return '';
}

export function resolveSkillCurrentlyUsed(skill: PortfolioSkillRef): boolean | null {
  if (typeof skill === 'string') return null;
  return typeof skill.currentlyUsed === 'boolean' ? skill.currentlyUsed : null;
}

/** Generic fallback — no built-in per-tool catalog copy. */
export function getSkillUsageDescription(_label: string): string {
  return 'Part of my everyday toolkit — used to deliver consistent, high-quality results.';
}
