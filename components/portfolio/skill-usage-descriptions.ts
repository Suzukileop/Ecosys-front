import { getCreatorToolCategoryLabel } from '@/components/creator/studio/creator-profile-tools-catalog';
import type { ProfileStrengthTool, ProfileStrengthToolLevel } from '@/types/ecosystem';

export type PortfolioSkillRef = string | ProfileStrengthTool;

export function resolveSkillName(skill: PortfolioSkillRef): string {
  return typeof skill === 'string' ? skill : skill.name;
}

export function resolveSkillIconUrl(skill: PortfolioSkillRef): string | null {
  if (typeof skill === 'string') return null;
  const url = skill.iconUrl?.trim();
  return url || null;
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
