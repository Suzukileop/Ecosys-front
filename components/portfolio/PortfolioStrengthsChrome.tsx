'use client';
import type { StrengthToolLevel } from '@/components/creator/studio/profile-form-schema';

export const MAX_DESCRIPTION = 280;
const MAX_USE_CASES = 8;

export const LEVEL_OPTIONS: { value: StrengthToolLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export type PortfolioStrengthDraft = {
  value: string;
  description: string;
  category: string;
  level: StrengthToolLevel | null;
  useCases: string[];
  experienceYears: number | null;
  experienceLabel: string;
  currentlyUsed: boolean | null;
  iconUrl?: string | null;
};

export function toStrengthDraft(item: {
  value?: string | null;
  description?: string | null;
  category?: string | null;
  level?: StrengthToolLevel | null;
  useCases?: string[] | null;
  experienceYears?: number | null;
  experienceLabel?: string | null;
  currentlyUsed?: boolean | null;
  iconUrl?: string | null;
}): PortfolioStrengthDraft {
  return {
    value: item.value ?? '',
    description: item.description ?? '',
    category: item.category ?? '',
    level: item.level ?? null,
    useCases: item.useCases ?? [],
    experienceYears: item.experienceYears ?? null,
    experienceLabel: item.experienceLabel ?? '',
    currentlyUsed: item.currentlyUsed ?? null,
    iconUrl: item.iconUrl ?? null,
  };
}

function normalizeUseCases(useCases: string[]): string[] {
  return useCases.map((entry) => entry.trim()).filter(Boolean).slice(0, MAX_USE_CASES);
}

export function cleanDraft(
  draft: PortfolioStrengthDraft,
  options?: { stripUseCases?: boolean }
): PortfolioStrengthDraft {
  return {
    value: draft.value.trim(),
    description: draft.description.trim().slice(0, MAX_DESCRIPTION),
    category: draft.category.trim().slice(0, 80),
    level: draft.level ?? null,
    useCases: options?.stripUseCases ? [] : normalizeUseCases(draft.useCases),
    experienceYears: null,
    experienceLabel: '',
    currentlyUsed: null,
    iconUrl: draft.iconUrl?.trim() ? draft.iconUrl.trim() : null,
  };
}
