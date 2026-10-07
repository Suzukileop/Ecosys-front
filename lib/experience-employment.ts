import type { KnownExperienceEmploymentType } from '@/types/profile';

export const MAX_CUSTOM_EMPLOYMENT_LENGTH = 40;

const EMPLOYMENT_TYPE_LABELS: Record<KnownExperienceEmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
};

export function isKnownEmploymentType(value: string | null | undefined): value is KnownExperienceEmploymentType {
  return value != null && Object.prototype.hasOwnProperty.call(EMPLOYMENT_TYPE_LABELS, value);
}

/** Known types come back upper-cased; anything else is kept as the creator's own wording. */
export function parseEmploymentType(raw: unknown): string | null {
  if (raw == null) return null;
  const text = String(raw).trim();
  if (!text) return null;
  const upper = text.toUpperCase();
  if (isKnownEmploymentType(upper)) return upper;
  return text.slice(0, MAX_CUSTOM_EMPLOYMENT_LENGTH);
}

export function employmentTypeLabel(value: string | null | undefined): string {
  if (!value) return '';
  return isKnownEmploymentType(value) ? EMPLOYMENT_TYPE_LABELS[value] : value;
}
