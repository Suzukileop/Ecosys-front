import type { CreatorProfileDto } from '@/types/ecosystem';

export type ProfileReadinessField =
  | 'photo'
  | 'address'
  | 'phone'
  | 'email'
  | 'nationality'
  | 'link'
  | 'name'
  | 'role'
  | 'location'
  | 'specialties';

export const PROFILE_READINESS_LABELS: Record<ProfileReadinessField, string> = {
  photo: 'Photo',
  address: 'Address',
  phone: 'Phone',
  email: 'Email',
  nationality: 'Nationality',
  link: 'Link',
  name: 'Name',
  role: 'Role',
  location: 'Location',
  specialties: 'Specialties',
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

/**
 * Only photos uploaded through the app storage count.
 * CSS/OAuth letter avatars and other external URLs are rejected.
 */
export function isUploadedProfilePhoto(avatarUrl: string | null | undefined): boolean {
  const raw = avatarUrl?.trim() ?? '';
  if (!raw) return false;
  if (raw.startsWith('data:')) return false;
  const normalized = raw.toLowerCase();
  return (
    normalized.includes('/api/storage/profiles/public/') ||
    normalized.startsWith('profiles/public/') ||
    normalized.includes('/profiles/public/')
  );
}

function hasContactEntry(
  legacy: string | null | undefined,
  list: { value?: string | null }[] | null | undefined
): boolean {
  if (hasText(legacy)) return true;
  return (list ?? []).some((entry) => hasText(entry?.value));
}

function hasLink(profile: Pick<CreatorProfileDto, 'websiteUrl' | 'profileLinks' | 'ctaUrl'>): boolean {
  if (hasText(profile.websiteUrl) || hasText(profile.ctaUrl)) return true;
  return (profile.profileLinks ?? []).some((link) => hasText(link?.url));
}

function hasLocation(profile: Pick<
  CreatorProfileDto,
  'locationCity' | 'locationCountry' | 'locationLat' | 'locationLng'
>): boolean {
  if (hasText(profile.locationCity) || hasText(profile.locationCountry)) return true;
  return profile.locationLat != null && profile.locationLng != null;
}

export type ProfileReadinessInput = Pick<
  CreatorProfileDto,
  | 'fullName'
  | 'avatarUrl'
  | 'appRole'
  | 'nationality'
  | 'websiteUrl'
  | 'ctaUrl'
  | 'profileLinks'
  | 'contactEmail'
  | 'contactPhone'
  | 'contactAddress'
  | 'contactEmails'
  | 'contactPhones'
  | 'contactAddresses'
  | 'locationCity'
  | 'locationCountry'
  | 'locationLat'
  | 'locationLng'
  | 'specialties'
  | 'specialite'
>;

const BASE_MISSING: ProfileReadinessField[] = [
  'photo',
  'address',
  'phone',
  'email',
  'nationality',
  'link',
  'name',
  'role',
  'location',
];

export function getMissingProfileReadinessFields(
  profile: ProfileReadinessInput | null | undefined,
  options?: { requireSpecialties?: boolean }
): ProfileReadinessField[] {
  if (!profile) {
    return [...BASE_MISSING];
  }

  const missing: ProfileReadinessField[] = [];
  if (!isUploadedProfilePhoto(profile.avatarUrl)) missing.push('photo');
  if (!hasContactEntry(profile.contactAddress, profile.contactAddresses)) missing.push('address');
  if (!hasContactEntry(profile.contactPhone, profile.contactPhones)) missing.push('phone');
  if (!hasContactEntry(profile.contactEmail, profile.contactEmails)) missing.push('email');
  if (!hasText(profile.nationality)) missing.push('nationality');
  if (!hasLink(profile)) missing.push('link');
  if (!hasText(profile.fullName)) missing.push('name');
  if (!hasText(profile.appRole)) missing.push('role');
  if (!hasLocation(profile)) missing.push('location');

  if (options?.requireSpecialties) {
    const specialties = Array.isArray(profile.specialties)
      ? profile.specialties.filter((item) => hasText(item))
      : [];
    if (specialties.length === 0 && !hasText(profile.specialite)) {
      missing.push('specialties');
    }
  }

  return missing;
}

export function isProfileReadyForPublishing(
  profile: ProfileReadinessInput | null | undefined,
  options?: { requireSpecialties?: boolean }
): boolean {
  return getMissingProfileReadinessFields(profile, options).length === 0;
}
