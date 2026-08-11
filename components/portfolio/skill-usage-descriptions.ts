import {
  findCreatorToolPreset,
  getCreatorToolCategoryLabel,
  type CreatorToolPreset,
} from '@/components/creator/studio/creator-profile-tools-catalog';
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
  const name = resolveSkillName(skill);
  if (typeof skill !== 'string') {
    const custom = skill.description?.trim();
    if (custom) return custom;
  }
  return getSkillUsageDescription(name);
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
  const preset = findCreatorToolPreset(resolveSkillName(skill));
  return preset ? getCreatorToolCategoryLabel(preset.category) : '';
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

const CATEGORY_USAGE: Record<CreatorToolPreset['category'], string> = {
  video: 'Cutting, pacing, and polishing footage into stories people actually want to watch.',
  design: 'Building visuals that feel cohesive, on-brand, and ready for any platform.',
  audio: 'Cleaning up sound and mixing levels so every project feels professional.',
  ai: 'Speeding up creative workflows while keeping quality and control in your hands.',
  social: 'Shaping content that fits each platform and speaks to the right audience.',
  dev: 'Technical work behind the scenes — reliable setups that keep projects moving.',
  other: 'A trusted part of my day-to-day workflow when quality and speed both matter.',
};

const TOOL_USAGE_OVERRIDES: Record<string, string> = {
  'premiere-pro': 'My main editing suite for narrative cuts, color, and export-ready deliverables.',
  'after-effects': 'Motion graphics, titles, and visual effects that add energy to the story.',
  'photoshop': 'Photo retouching, compositing, and asset prep before anything goes live.',
  'illustrator': 'Vector graphics and brand elements that scale cleanly across formats.',
  'lightroom': 'Color grading and photo consistency across an entire shoot or campaign.',
  capcut: 'Fast social-first edits when turnaround needs to be quick without looking rushed.',
  'davinci-resolve': 'Professional color grading and finishing for a cinematic look.',
  figma: 'UI layouts and design systems I use to align visuals before production starts.',
  canva: 'Quick branded assets and social templates when speed is part of the brief.',
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getSkillUsageDescription(label: string): string {
  const preset = findCreatorToolPreset(label);
  if (preset) {
    const override = TOOL_USAGE_OVERRIDES[preset.id];
    if (override) return override;
    return CATEGORY_USAGE[preset.category];
  }

  const key = normalizeKey(label);
  const aliasMatch = Object.entries(TOOL_USAGE_OVERRIDES).find(([id]) => id === key);
  if (aliasMatch) return aliasMatch[1];

  return 'Part of my everyday toolkit — used to deliver consistent, high-quality results.';
}
