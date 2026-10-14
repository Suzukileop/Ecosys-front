import { msg } from '@/lib/i18n/config';

export const CREATOR_GENDER_VALUES = [msg('Male'), msg('Female')] as const;

type CreatorGender = (typeof CREATOR_GENDER_VALUES)[number];

export function normalizeCreatorGender(raw: unknown): CreatorGender | null {
  if (raw == null) return null;
  const text = String(raw).trim();
  if (!text) return null;
  const key = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (key === 'homme' || key === 'man' || key === 'male' || key === 'm') return 'Male';
  if (key === 'femme' || key === 'woman' || key === 'female' || key === 'f') return 'Female';
  return null;
}
