import type { CreatorProfileDto } from '@/types/profile';
import { normalizeCreatorAppRole, type CreatorAppRole } from '@/lib/creator-app-role';
import { filterActiveServices } from '@/lib/profile-services';
import { parseSpecialtyList } from '@/lib/specialties';

/*
 * "Profile strength" (LinkedIn) for My Profile: a weighted checklist over data the studio page already
 * loads (GET /api/creator/profile, the product count and one page of posts). Pure — no fetching, no React.
 *
 * Not named "profile strength" in code: `ProfileStrengthTool` already means a stack entry.
 */

/** What the meter's "next step" does when clicked. */
export type ProfileCompletenessAction =
  /** Opens the "Edit intro" dialog (name, specialties, bio, location, status). */
  | { kind: 'intro' }
  /** Opens the profile photo picker. */
  | { kind: 'photo' }
  /** Opens the post composer on the Content tab. */
  | { kind: 'publish' }
  | { kind: 'link'; href: string };

export type ProfileCompletenessCriterionId =
  | 'photo'
  | 'bio'
  | 'specialties'
  | 'location'
  | 'offer'
  | 'post'
  | 'stack'
  | 'links'
  | 'faq';

export type ProfileCompletenessCriterion = {
  id: ProfileCompletenessCriterionId;
  /** Call to action shown when missing, e.g. "Add a bio". */
  label: string;
  weight: number;
  done: boolean;
  action: ProfileCompletenessAction;
};

export type ProfileCompleteness = {
  /** 0–100, rounded. */
  percent: number;
  /** The criteria that apply to this account's role, in priority order. */
  criteria: ProfileCompletenessCriterion[];
  /** The single most valuable missing item (highest weight; ties keep list order) — null at 100%. */
  next: ProfileCompletenessCriterion | null;
  /** Percentage points `next` is worth once done. */
  nextGain: number;
};

export type ProfileCompletenessInput = {
  profile: CreatorProfileDto;
  /** The avatar the header shows (profile photo, else the account's). */
  avatarUrl: string | null;
  productCount: number;
  /** Active posts — null when unknown (the "first post" criterion is then left out, not counted missing). */
  postCount: number | null;
};

const PROFILE_SECTION_HREF = (section: string) => `/profile?tab=profile&section=${section}`;

/* Information sections the Profile tab hides per role (profile-section-nav.tsx) — a criterion pointing
   at a hidden section would be impossible to complete. */
const ROLES_WITHOUT_STACK: readonly CreatorAppRole[] = ['SELLER', 'RH_RECRUITER'];
const ROLES_WITHOUT_FAQ: readonly CreatorAppRole[] = ['RH_RECRUITER'];
/* A recruiter / client hires; they have nothing to sell. */
const ROLES_WITHOUT_OFFER: readonly CreatorAppRole[] = ['RH_RECRUITER'];

const hasText = (value: string | null | undefined) => Boolean(value?.trim());

function hasPhoto(avatarUrl: string | null): boolean {
  const raw = avatarUrl?.trim() ?? '';
  return raw.length > 0 && !raw.startsWith('data:');
}

function hasLocation(profile: CreatorProfileDto): boolean {
  // City / country only — the header's location label falls back to nationality, which is not a place.
  return hasText(profile.locationCity) || hasText(profile.locationCountry);
}

function hasSocialLink(raw: CreatorProfileDto['socialLinks']): boolean {
  if (!raw) return false;
  let record: unknown = raw;
  if (typeof raw === 'string') {
    try {
      record = JSON.parse(raw);
    } catch {
      return hasText(raw);
    }
  }
  if (!record || typeof record !== 'object') return false;
  return Object.values(record as Record<string, unknown>).some((v) => typeof v === 'string' && hasText(v));
}

function hasLinks(profile: CreatorProfileDto): boolean {
  if (hasText(profile.websiteUrl) || hasText(profile.ctaUrl)) return true;
  if ((profile.profileLinks ?? []).some((link) => hasText(link?.url))) return true;
  return hasSocialLink(profile.socialLinks);
}

function hasStack(profile: CreatorProfileDto): boolean {
  return (
    (profile.profileStack ?? []).some((tool) => hasText(tool?.name)) ||
    (profile.strengthsToolsMastered ?? []).some((tool) => hasText(tool?.name)) ||
    (profile.aboutSystemsTools ?? []).some((item) => hasText(item))
  );
}

function hasFaq(profile: CreatorProfileDto): boolean {
  return (profile.faqItems ?? []).some((item) => hasText(item?.question) && hasText(item?.answer));
}

/**
 * The weighted criteria, in priority order. Weights add up to 100 for a freelancer / service provider /
 * member; criteria that do not apply to a role are dropped and the rest are re-scaled, so every role can
 * reach 100%.
 *
 *   photo        15  a profile photo                      → photo picker
 *   bio          15  a non-empty bio                      → Edit intro
 *   offer        15  ≥1 active service or product         → Services tab / new product (sellers)
 *   specialties  10  ≥1 specialty (the header subtitle)   → Edit intro
 *   location     10  city or country                      → Edit intro
 *   post         10  ≥1 published post                    → composer
 *   stack        10  ≥1 stack / tools entry               → Profile › Stack
 *   links        10  a website, CTA, profile or social link → Profile › Links
 *   faq           5  ≥1 answered question                 → Profile › FAQ
 *
 * Availability is not a criterion: `isAvailable` is a boolean that defaults to true, so it cannot tell a
 * finished profile from an untouched one.
 */
export function computeProfileCompleteness(input: ProfileCompletenessInput): ProfileCompleteness {
  const { profile, avatarUrl, productCount, postCount } = input;
  const role = normalizeCreatorAppRole(profile.appRole);
  const serviceCount = filterActiveServices(profile.profileServices ?? []).length;
  const isSeller = role === 'SELLER';

  const all: Array<ProfileCompletenessCriterion | null> = [
    { id: 'photo', label: 'Add a profile photo', weight: 15, done: hasPhoto(avatarUrl), action: { kind: 'photo' } },
    { id: 'bio', label: 'Add a bio', weight: 15, done: hasText(profile.bio), action: { kind: 'intro' } },
    ROLES_WITHOUT_OFFER.includes(role)
      ? null
      : {
          id: 'offer',
          label: isSeller ? 'Add your first product' : 'Add a service',
          weight: 15,
          done: serviceCount > 0 || productCount > 0,
          action: { kind: 'link', href: isSeller ? '/my-products?create=1' : '/profile?tab=services' },
        },
    {
      id: 'specialties',
      label: 'Add your specialties',
      weight: 10,
      done: parseSpecialtyList(profile.specialties, profile.specialite).length > 0,
      action: { kind: 'intro' },
    },
    { id: 'location', label: 'Add your location', weight: 10, done: hasLocation(profile), action: { kind: 'intro' } },
    postCount == null
      ? null
      : { id: 'post', label: 'Publish your first post', weight: 10, done: postCount > 0, action: { kind: 'publish' } },
    ROLES_WITHOUT_STACK.includes(role)
      ? null
      : {
          id: 'stack',
          label: 'Add your stack',
          weight: 10,
          done: hasStack(profile),
          action: { kind: 'link', href: PROFILE_SECTION_HREF('strengths') },
        },
    {
      id: 'links',
      label: 'Add a link',
      weight: 10,
      done: hasLinks(profile),
      action: { kind: 'link', href: PROFILE_SECTION_HREF('links') },
    },
    ROLES_WITHOUT_FAQ.includes(role)
      ? null
      : {
          id: 'faq',
          label: 'Answer a FAQ',
          weight: 5,
          done: hasFaq(profile),
          action: { kind: 'link', href: PROFILE_SECTION_HREF('faq') },
        },
  ];

  const criteria = all.filter((item): item is ProfileCompletenessCriterion => item !== null);
  const total = criteria.reduce((sum, item) => sum + item.weight, 0);
  const earned = criteria.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
  // Floor, not round: 99.6% must not read "100%" while something is still missing.
  const percent = total > 0 ? (earned === total ? 100 : Math.floor((earned / total) * 100)) : 100;

  let next: ProfileCompletenessCriterion | null = null;
  for (const item of criteria) {
    if (!item.done && (!next || item.weight > next.weight)) next = item;
  }

  return {
    percent,
    criteria,
    next,
    nextGain: next && total > 0 ? Math.round((next.weight / total) * 100) : 0,
  };
}
