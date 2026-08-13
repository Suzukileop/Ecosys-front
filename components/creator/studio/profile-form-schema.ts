import { z } from 'zod';
import type { ContactVisibilitySettings } from '@/lib/contact-visibility';
import { dedupeSpokenLanguages } from '@/lib/spoken-languages';
import { CREATOR_GENDER_VALUES } from '@/lib/creator-gender';
import { toStoredPhoneNumber } from '@/lib/phone';

export const platformEnum = z.enum([
  'INSTAGRAM',
  'YOUTUBE',
  'TIKTOK',
  'TWITTER',
  'LINKEDIN',
  'GITHUB',
  'OTHER',
]);

export const linkTypeEnum = z.enum(['WEBSITE', 'CTA', 'CUSTOM', 'SOCIAL']);

/** Accepts absolute http(s) URLs, or bare hostnames / paths (normalized with https://). */
export function toAbsoluteHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/\s/.test(trimmed)) return null;
  try {
    const hasProtocol = /^https?:\/\//i.test(trimmed);
    if (!hasProtocol) {
      const hostPart = trimmed.split(/[/?#]/)[0] ?? '';
      const isLocalhost = /^localhost(:\d+)?$/i.test(hostPart);
      if (!isLocalhost && !hostPart.includes('.')) return null;
    }
    const withProtocol = hasProtocol ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (!parsed.hostname) return null;
    return withProtocol;
  } catch {
    return null;
  }
}

function isHttpUrl(value: string): boolean {
  return toAbsoluteHttpUrl(value) != null;
}

/** Field-level message for optional HTTP URLs (empty is valid). */
export function getHttpUrlFieldError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!isHttpUrl(trimmed)) return 'Invalid URL.';
  return null;
}

/** Field-level message for team social rows (empty is valid). */
export function getTeamSocialUrlFieldError(value: string, platform?: string | null): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const isEmail =
    platform === 'EMAIL' ||
    trimmed.toLowerCase().startsWith('mailto:') ||
    (!trimmed.includes('://') && trimmed.includes('@'));
  if (isEmail) {
    if (trimmed.toLowerCase().startsWith('mailto:')) {
      return trimmed.length > 'mailto:'.length ? null : 'Invalid email.';
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? null : 'Invalid email.';
  }
  return getHttpUrlFieldError(trimmed);
}

/** Hostname (or "Link") used when the UI no longer collects a label. */
export function deriveProfileLinkLabel(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return 'Link';
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const hostname = new URL(withProtocol).hostname.replace(/^www\./i, '');
    return hostname || 'Link';
  } catch {
    return 'Link';
  }
}

/** Empty draft rows are allowed; filled = non-empty URL (label is auto-derived on save). */
export const profileLinkSchema = z
  .object({
    id: z.string().uuid(),
    type: linkTypeEnum.or(z.string()),
    label: z.string().max(100),
    url: z.string().max(500),
    sortOrder: z.number().int().min(0),
    platform: platformEnum.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const url = data.url.trim();
    if (!url) return;
    if (!isHttpUrl(url)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid URL.', path: ['url'] });
    }
  });

export const profileServiceSchema = z
  .object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
    title: z.string().max(100),
    description: z.string().max(500).optional().or(z.literal('')),
    basePriceCents: z.number().int().min(0).nullable().optional(),
    deadline: z.string().max(100).optional().or(z.literal('')).nullable(),
    tasks: z.array(z.object({ value: z.string().max(120) })).max(12),
  })
  .superRefine((data, ctx) => {
    const title = data.title.trim();
    const description = data.description?.trim() ?? '';
    const deadline = data.deadline?.trim() ?? '';
    const hasPrice = data.basePriceCents != null;
    const hasTasks = data.tasks?.some((item) => item.value.trim()) ?? false;
    if (!title && !description && !deadline && !hasPrice && !hasTasks) return;
    if (!title) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Title is required.', path: ['title'] });
    }
  });

export const faqItemSchema = z
  .object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
    question: z.string().max(200),
    answer: z.string().max(1000),
  })
  .superRefine((data, ctx) => {
    const question = data.question.trim();
    const answer = data.answer.trim();
    if (!question && !answer) return;
    if (!question) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Question is required.',
        path: ['question'],
      });
    }
    if (!answer) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Answer is required.', path: ['answer'] });
    }
  });

export const contactEntrySchema = z.object({
  id: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  value: z.string().max(300),
});

export const teamSocialPlatformEnum = z.enum([
  'FACEBOOK',
  'X',
  'TWITTER',
  'LINKEDIN',
  'INSTAGRAM',
  'YOUTUBE',
  'GITHUB',
  'WEBSITE',
  'EMAIL',
  'OTHER',
]);

/** Detect team social platform from a URL or email. */
export function inferTeamSocialPlatform(
  url: string
): z.infer<typeof teamSocialPlatformEnum> {
  const trimmed = url.trim();
  if (!trimmed) return 'WEBSITE';

  if (
    trimmed.toLowerCase().startsWith('mailto:') ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  ) {
    return 'EMAIL';
  }

  let host = '';
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    host = new URL(withProtocol).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'OTHER';
  }

  if (host.includes('youtube') || host === 'youtu.be') return 'YOUTUBE';
  if (host.includes('instagram')) return 'INSTAGRAM';
  if (host.includes('linkedin')) return 'LINKEDIN';
  if (host.includes('github')) return 'GITHUB';
  if (host.includes('twitter') || host === 'x.com' || host.endsWith('.x.com')) return 'X';
  if (host.includes('facebook') || host.includes('fb.com') || host.includes('fb.me')) {
    return 'FACEBOOK';
  }
  return 'WEBSITE';
}

export const teamSocialLinkSchema = z
  .object({
    id: z.string().uuid(),
    platform: teamSocialPlatformEnum,
    label: z.string().max(80).optional().or(z.literal('')).nullable(),
    url: z.string().max(500),
    sortOrder: z.number().int().min(0),
  })
  .superRefine((data, ctx) => {
    const url = data.url.trim();
    const label = data.label?.trim() ?? '';
    if (!url && !label) return;
    if (!url) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'URL is required.', path: ['url'] });
      return;
    }
    const fieldError = getTeamSocialUrlFieldError(url, data.platform);
    if (fieldError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: fieldError,
        path: ['url'],
      });
    }
  });

export const teamMemberSchema = z
  .object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
    name: z.string().max(100),
    responsibility: z.string().max(120),
    imageUrl: z.string().optional().or(z.literal('')).nullable(),
    socialLinks: z.array(teamSocialLinkSchema).max(6),
  })
  .superRefine((data, ctx) => {
    const name = data.name.trim();
    const responsibility = data.responsibility.trim();
    const hasImage = Boolean(data.imageUrl?.trim());
    const hasSocial = data.socialLinks?.some(
      (link) => link.url.trim() || (link.label?.trim() ?? '')
    );
    if (!name && !responsibility && !hasImage && !hasSocial) return;
    if (!name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nom requis.', path: ['name'] });
    }
    if (!responsibility) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Responsabilité requise.',
        path: ['responsibility'],
      });
    }
  });

export const galleryItemSchema = z
  .object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
    title: z.string().max(120),
    mediaUrl: z.string().max(2000),
    mediaType: z.enum(['IMAGE', 'VIDEO']).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const title = data.title.trim();
    const mediaUrl = data.mediaUrl.trim();
    if (!title && !mediaUrl) return;
    if (!mediaUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Média requis.', path: ['mediaUrl'] });
    }
  });

export const subtitleItemSchema = z.object({
  value: z.string().max(500),
});

export const taskItemSchema = z.object({
  value: z.string().max(300),
});

export const strengthToolLevelEnum = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

export type StrengthToolLevel = z.infer<typeof strengthToolLevelEnum>;

export const strengthItemSchema = z
  .object({
    value: z.string().max(80),
    /** Optional portfolio card blurb — empty keeps the auto-generated description. */
    description: z.string().max(280).optional().or(z.literal('')),
    category: z.string().max(80).optional().or(z.literal('')),
    level: strengthToolLevelEnum.nullable().optional(),
    useCases: z.array(z.string().max(60)).max(8).optional(),
    experienceYears: z.number().int().min(0).max(40).nullable().optional(),
    experienceLabel: z.string().max(80).optional().or(z.literal('')),
    currentlyUsed: z.boolean().nullable().optional(),
    /** Optional uploaded logo for custom tools (owned media URL). */
    iconUrl: z.string().max(500).optional().or(z.literal('')).nullable(),
  })
  .superRefine((data, ctx) => {
    const value = data.value.trim();
    const description = data.description?.trim() ?? '';
    if (!value && !description) return;
    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Strength is required.',
        path: ['value'],
      });
    }
  });

export type StrengthFormItem = z.infer<typeof strengthItemSchema>;

export const experienceStatusEnum = z.enum(['ONGOING', 'FINISHED']);

export const experienceEmploymentTypeEnum = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'FREELANCE',
  'INTERNSHIP',
]);

export const experienceProofPlatformEnum = z.enum([
  'GITHUB',
  'FACEBOOK',
  'LINKEDIN',
  'INSTAGRAM',
  'YOUTUBE',
  'WEBSITE',
  'OTHER',
]);

export const experienceProofLinkSchema = z
  .object({
    id: z.string().uuid(),
    label: z.string().max(100),
    url: z.string().max(500),
    platform: experienceProofPlatformEnum.nullable().optional(),
    sortOrder: z.number().int().min(0),
  })
  .superRefine((data, ctx) => {
    const url = data.url.trim();
    const label = data.label.trim();
    if (!url && !label) return;
    if (!url) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'URL is required.', path: ['url'] });
      return;
    }
    const fieldError = getHttpUrlFieldError(url);
    if (fieldError) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: fieldError, path: ['url'] });
    }
  });

export const profileMediaBlockSchema = z
  .object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
    text: z.string().max(4000),
    mediaUrl: z.string().optional().or(z.literal('')),
    mediaType: z.enum(['IMAGE', 'VIDEO']).nullable().optional(),
    title: z.string().max(200).optional().or(z.literal('')),
    organization: z.string().max(120).optional().or(z.literal('')),
    period: z.string().max(80).optional().or(z.literal('')),
    subtitles: z.array(subtitleItemSchema).max(10),
    status: experienceStatusEnum.nullable().optional(),
    tasks: z.array(taskItemSchema).max(12),
    tools: z.array(strengthItemSchema).max(8),
    links: z.array(experienceProofLinkSchema).max(5),
    remarks: z.string().max(500).optional().or(z.literal('')),
    location: z.string().max(120).optional().or(z.literal('')),
    employmentType: experienceEmploymentTypeEnum.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const text = data.text.trim();
    const hasOtherContent =
      Boolean(data.mediaUrl?.trim()) ||
      Boolean(data.title?.trim()) ||
      Boolean(data.organization?.trim()) ||
      Boolean(data.period?.trim()) ||
      Boolean(data.remarks?.trim()) ||
      Boolean(data.location?.trim()) ||
      (data.subtitles?.some((item) => item.value.trim()) ?? false) ||
      (data.tasks?.some((item) => item.value.trim()) ?? false) ||
      (data.tools?.some((item) => item.value.trim() || item.description?.trim()) ?? false) ||
      (data.links?.some((item) => item.url.trim() || item.label.trim()) ?? false) ||
      data.status != null ||
      data.employmentType != null;
    if (!text && !hasOtherContent) return;
    if (!text) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Text is required.', path: ['text'] });
    }
  });

export const spokenLanguageSchema = z
  .object({
    value: z.string().max(50),
  })
  .superRefine((data, ctx) => {
    // Empty draft language rows are ignored on serialize; only reject whitespace-only.
    if (data.value.length > 0 && !data.value.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Language is required.',
        path: ['value'],
      });
    }
  });

export const profileSchema = z
  .object({
    fullName: z.string().min(1, 'Name is required.').max(150),
    bio: z.string().max(8000).optional(),
    specialite: z.string().max(150).optional(),
    gender: z.enum(CREATOR_GENDER_VALUES).optional().or(z.literal('')),
    spokenLanguages: z.array(spokenLanguageSchema).max(10),
    locationCity: z.string().optional(),
    locationCountry: z.string().optional(),
    locationLat: z.number().nullable().optional(),
    locationLng: z.number().nullable().optional(),
    timezoneId: z.string().optional(),
    contactAddress: z.string().max(300).optional(),
    contactPhone: z.string().max(50).optional(),
    contactEmail: z.string().email('Invalid email.').optional().or(z.literal('')),
    contactAddresses: z.array(contactEntrySchema).max(8),
    contactPhones: z.array(contactEntrySchema).max(8),
    contactEmails: z.array(contactEntrySchema).max(8),
    availabilityHours: z.string().max(200).optional(),
    isAvailable: z.boolean(),
    profileLinks: z.array(profileLinkSchema).max(10),
    serviceOffers: z.array(profileServiceSchema).max(8),
    faqItems: z.array(faqItemSchema).max(8),
    teamMembers: z.array(teamMemberSchema).max(12),
    galleryItems: z.array(galleryItemSchema).max(24),
    whyMeBlocks: z.array(profileMediaBlockSchema).max(50),
    experienceBlocks: z.array(profileMediaBlockSchema).max(50),
    yearsOfExperience: z.number().int().min(0).max(80).nullable().optional(),
    strengthsTools: z.array(strengthItemSchema).max(12),
  })
  .superRefine((data, ctx) => {
    // Only require complete geolocation when the user started filling location fields.
    const anyCoords =
      data.locationLat != null || data.locationLng != null || Boolean(data.timezoneId?.trim());
    if (anyCoords) {
      if (data.locationLat == null || data.locationLng == null || !data.timezoneId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enable device location — required for city and timezone detection.',
          path: ['timezoneId'],
        });
      }
    }

    data.contactEmails.forEach((entry, index) => {
      const value = entry.value.trim();
      if (!value) return;
      if (!z.string().email().safeParse(value).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid email.',
          path: ['contactEmails', index, 'value'],
        });
      }
    });

    data.contactPhones.forEach((entry, index) => {
      const stored = toStoredPhoneNumber(entry.value);
      if (entry.value.trim() && !stored) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid phone number.',
          path: ['contactPhones', index, 'value'],
        });
      }
      if (stored.length > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Phone number is too long.',
          path: ['contactPhones', index, 'value'],
        });
      }
    });
  });

/** Map a react-hook-form error path to the Information sidebar section. */
export function profileErrorPathToSection(path: string): ProfileSectionIdForErrors {
  if (path.startsWith('faqItems')) return 'faq';
  if (path.startsWith('teamMembers')) return 'team';
  if (path.startsWith('galleryItems')) return 'gallery';
  if (path.startsWith('profileLinks')) return 'links';
  if (path.startsWith('serviceOffers')) return 'services';
  if (path.startsWith('whyMeBlocks')) return 'whyMe';
  if (path.startsWith('experienceBlocks') || path === 'yearsOfExperience') return 'experience';
  if (path.startsWith('strengthsTools')) return 'strengths';
  if (
    path.startsWith('location') ||
    path === 'timezoneId' ||
    path === 'locationCity' ||
    path === 'locationCountry' ||
    path === 'locationLat' ||
    path === 'locationLng'
  ) {
    return 'about';
  }
  if (
    path.startsWith('contact') ||
    path === 'availabilityHours' ||
    path === 'isAvailable'
  ) {
    return 'contact';
  }
  return 'about';
}

export type ProfileSectionIdForErrors =
  | 'about'
  | 'whyMe'
  | 'experience'
  | 'strengths'
  | 'services'
  | 'faq'
  | 'team'
  | 'gallery'
  | 'links'
  | 'location'
  | 'contact';

export function firstProfileErrorMessage(
  errors: Record<string, unknown>,
  prefix = ''
): { path: string; message: string } | null {
  for (const [key, value] of Object.entries(errors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (!value || typeof value !== 'object') continue;
    const record = value as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message) {
      return { path, message: record.message };
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item || typeof item !== 'object') continue;
        const nested = firstProfileErrorMessage(item as Record<string, unknown>, `${path}.${i}`);
        if (nested) return nested;
      }
      continue;
    }
    const nested = firstProfileErrorMessage(record, path);
    if (nested) return nested;
  }
  return null;
}

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ProfileMediaBlockForm = z.infer<typeof profileMediaBlockSchema>;
export type ProfileLinkForm = z.infer<typeof profileLinkSchema>;
export type ProfileServiceForm = z.infer<typeof profileServiceSchema>;
export type FaqItemForm = z.infer<typeof faqItemSchema>;
export type ContactEntryForm = z.infer<typeof contactEntrySchema>;
export type TeamSocialLinkForm = z.infer<typeof teamSocialLinkSchema>;
export type TeamMemberForm = z.infer<typeof teamMemberSchema>;
export type GalleryItemForm = z.infer<typeof galleryItemSchema>;

export function createEmptyProfileBlock(sortOrder: number): ProfileMediaBlockForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    text: '',
    mediaUrl: '',
    mediaType: null,
    title: '',
    organization: '',
    period: '',
    subtitles: [],
    status: null,
    tasks: [],
    tools: [],
    links: [],
    remarks: '',
    location: '',
    employmentType: null,
  };
}

export function createEmptyExperienceProofLink(sortOrder: number) {
  return {
    id: crypto.randomUUID(),
    label: '',
    url: '',
    platform: null as z.infer<typeof experienceProofPlatformEnum> | null,
    sortOrder,
  };
}

export function createEmptyProfileLink(sortOrder: number): ProfileLinkForm {
  return {
    id: crypto.randomUUID(),
    type: 'CUSTOM',
    label: '',
    url: '',
    sortOrder,
    platform: null,
  };
}

export function createEmptyProfileService(sortOrder: number): ProfileServiceForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    title: '',
    description: '',
    basePriceCents: null,
    deadline: '',
    tasks: [],
  };
}

export function createEmptyFaqItem(sortOrder: number): FaqItemForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    question: '',
    answer: '',
  };
}

export function createEmptyContactEntry(sortOrder: number): ContactEntryForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    value: '',
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseContactEntryId(raw: unknown): string {
  if (typeof raw === 'string' && UUID_RE.test(raw)) return raw;
  return crypto.randomUUID();
}

/** Parse contact entry arrays; if empty, fall back to a single legacy string entry. */
export function parseContactEntries(
  raw: unknown,
  legacyString?: string | null
): ContactEntryForm[] {
  if (Array.isArray(raw) && raw.length > 0) {
    const entries: ContactEntryForm[] = [];
    raw.forEach((item, index) => {
      if (typeof item === 'string') {
        const value = item.trim();
        if (!value) return;
        entries.push({
          id: crypto.randomUUID(),
          sortOrder: index,
          value,
        });
        return;
      }
      if (!item || typeof item !== 'object') return;
      const entry = item as Record<string, unknown>;
      entries.push({
        id: parseContactEntryId(entry.id),
        sortOrder: typeof entry.sortOrder === 'number' ? entry.sortOrder : index,
        value: entry.value != null ? String(entry.value) : '',
      });
    });
    return entries.sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 8);
  }

  const legacy = legacyString?.trim();
  if (legacy) {
    return [{ id: crypto.randomUUID(), sortOrder: 0, value: legacy }];
  }
  return [];
}

export type ContactEntrySerializeKind = 'address' | 'phone' | 'email';

/** Filter empty values; phones use E.164 storage; emails are trimmed. */
export function serializeContactEntries(
  items: ContactEntryForm[],
  kind: ContactEntrySerializeKind = 'address'
): Array<{ id: string; sortOrder: number; value: string }> {
  return items
    .map((item, index) => {
      let value = item.value.trim();
      if (kind === 'phone') {
        value = toStoredPhoneNumber(item.value);
      } else if (kind === 'email') {
        value = value;
      }
      return {
        id: item.id,
        sortOrder: index,
        value,
      };
    })
    .filter((item) => item.value.length > 0)
    .map((item, index) => ({ ...item, sortOrder: index }));
}

/** Primary / first non-empty value for legacy scalar fields and public display. */
export function primaryContactValue(
  entries: Array<{ value?: string | null }> | null | undefined,
  legacy?: string | null
): string {
  const fromList = entries?.map((entry) => entry.value?.trim() ?? '').find(Boolean);
  if (fromList) return fromList;
  return legacy?.trim() ?? '';
}

/** Keep legacy scalars in sync with list primaries before API parse/save. */
export function syncContactLegacyFields(values: {
  contactAddresses: ContactEntryForm[];
  contactPhones: ContactEntryForm[];
  contactEmails: ContactEntryForm[];
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
}): {
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
} {
  return {
    contactAddress: primaryContactValue(values.contactAddresses, values.contactAddress),
    contactPhone: primaryContactValue(values.contactPhones, values.contactPhone),
    contactEmail: primaryContactValue(values.contactEmails, values.contactEmail),
  };
}

export function createEmptyTeamSocialLink(sortOrder: number): TeamSocialLinkForm {
  return {
    id: crypto.randomUUID(),
    platform: 'WEBSITE',
    label: '',
    url: '',
    sortOrder,
  };
}

export function createEmptyTeamMember(sortOrder: number): TeamMemberForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    name: '',
    responsibility: '',
    imageUrl: '',
    socialLinks: [],
  };
}

export function createEmptyGalleryItem(sortOrder: number): GalleryItemForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    title: '',
    mediaUrl: '',
    mediaType: null,
  };
}

export function parseSubtitleItems(raw: unknown): Array<{ value: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return { value: item.trim() };
      if (item && typeof item === 'object' && 'value' in item) {
        return { value: String((item as { value: unknown }).value).trim() };
      }
      return null;
    })
    .filter((item): item is { value: string } => Boolean(item?.value));
}

export function parseSpokenLanguages(raw: unknown, legacyLanguages?: string | null): Array<{ value: string }> {
  let parsed: string[] = [];

  if (Array.isArray(raw) && raw.length > 0) {
    parsed = raw
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object' && 'value' in item) {
          return String((item as { value: unknown }).value).trim();
        }
        return '';
      })
      .filter(Boolean);
  } else {
    const legacy = legacyLanguages?.trim();
    if (legacy) {
      parsed = legacy
        .split(/[,;|/]+/)
        .map((part) => part.trim())
        .filter(Boolean);
    }
  }

  return dedupeSpokenLanguages(parsed).map((value) => ({ value }));
}

export function parseProfileLinks(raw: unknown): ProfileLinkForm[] {
  if (!Array.isArray(raw)) return [];
  const links: ProfileLinkForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const link = item as Record<string, unknown>;
    const typeRaw = link.type != null ? String(link.type).toUpperCase() : 'CUSTOM';
    const typeParsed = linkTypeEnum.safeParse(typeRaw);
    const platformRaw = link.platform != null ? String(link.platform).toUpperCase() : null;
    const platformParsed = platformRaw ? platformEnum.safeParse(platformRaw) : null;
    links.push({
      id: link.id != null ? String(link.id) : crypto.randomUUID(),
      type: typeParsed.success ? typeParsed.data : 'CUSTOM',
      label: link.label != null ? String(link.label) : '',
      url: link.url != null ? String(link.url) : '',
      sortOrder: typeof link.sortOrder === 'number' ? link.sortOrder : index,
      platform: platformParsed?.success ? platformParsed.data : null,
    });
  });
  return links.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function parseProfileServices(raw: unknown): ProfileServiceForm[] {
  if (!Array.isArray(raw)) return [];
  const services: ProfileServiceForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const service = item as Record<string, unknown>;
    services.push({
      id: service.id != null ? String(service.id) : crypto.randomUUID(),
      sortOrder: typeof service.sortOrder === 'number' ? service.sortOrder : index,
      title: service.title != null ? String(service.title) : '',
      description: service.description != null ? String(service.description) : '',
      basePriceCents:
        service.basePriceCents != null && service.basePriceCents !== ''
          ? Number(service.basePriceCents)
          : null,
      deadline: service.deadline != null ? String(service.deadline) : '',
      tasks: parseSubtitleItems(service.tasks),
    });
  });
  return services.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function parseFaqItems(raw: unknown): FaqItemForm[] {
  if (!Array.isArray(raw)) return [];
  const faqItems: FaqItemForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const faq = item as Record<string, unknown>;
    faqItems.push({
      id: faq.id != null ? String(faq.id) : crypto.randomUUID(),
      sortOrder: typeof faq.sortOrder === 'number' ? faq.sortOrder : index,
      question: faq.question != null ? String(faq.question) : '',
      answer: faq.answer != null ? String(faq.answer) : '',
    });
  });
  return faqItems.sort((a, b) => a.sortOrder - b.sortOrder);
}

function parseTeamSocialLinks(raw: unknown): TeamSocialLinkForm[] {
  if (!Array.isArray(raw)) return [];
  const links: TeamSocialLinkForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const link = item as Record<string, unknown>;
    const platformRaw = link.platform != null ? String(link.platform).toUpperCase() : 'OTHER';
    const platformParsed = teamSocialPlatformEnum.safeParse(platformRaw);
    links.push({
      id: link.id != null ? String(link.id) : crypto.randomUUID(),
      platform: platformParsed.success ? platformParsed.data : 'OTHER',
      label: link.label != null ? String(link.label) : '',
      url: link.url != null ? String(link.url) : '',
      sortOrder: typeof link.sortOrder === 'number' ? link.sortOrder : index,
    });
  });
  return links.sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 8);
}

export function parseTeamMembers(raw: unknown): TeamMemberForm[] {
  if (!Array.isArray(raw)) return [];
  const members: TeamMemberForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const member = item as Record<string, unknown>;
    members.push({
      id: member.id != null ? String(member.id) : crypto.randomUUID(),
      sortOrder: typeof member.sortOrder === 'number' ? member.sortOrder : index,
      name: member.name != null ? String(member.name) : '',
      responsibility: member.responsibility != null ? String(member.responsibility) : '',
      imageUrl: member.imageUrl != null ? String(member.imageUrl) : '',
      socialLinks: parseTeamSocialLinks(member.socialLinks),
    });
  });
  return members.sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 12);
}

export function parseGalleryItems(raw: unknown): GalleryItemForm[] {
  if (!Array.isArray(raw)) return [];
  const items: GalleryItemForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const gallery = item as Record<string, unknown>;
    const mediaUrl = gallery.mediaUrl != null ? String(gallery.mediaUrl) : '';
    const mediaTypeRaw = gallery.mediaType != null ? String(gallery.mediaType).toUpperCase() : null;
    const mediaType =
      mediaTypeRaw === 'VIDEO' ? 'VIDEO' : mediaTypeRaw === 'IMAGE' ? 'IMAGE' : null;
    items.push({
      id: gallery.id != null ? String(gallery.id) : crypto.randomUUID(),
      sortOrder: typeof gallery.sortOrder === 'number' ? gallery.sortOrder : index,
      title: gallery.title != null ? String(gallery.title) : '',
      mediaUrl,
      mediaType: mediaUrl ? mediaType ?? inferProfileMediaType(mediaUrl) : null,
    });
  });
  return items.sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 24);
}

export function buildProfileLinksFromLegacy(p: {
  profileLinks?: Array<{
    id: string;
    type: string;
    label: string;
    url: string;
    sortOrder: number;
    platform?: string | null;
  }> | null;
  websiteUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  socialLinks?: Record<string, string> | string | null;
}): ProfileLinkForm[] {
  const fromApi = parseProfileLinks(p.profileLinks);
  if (fromApi.length > 0) return fromApi;

  const links: ProfileLinkForm[] = [];
  let order = 0;

  const website = p.websiteUrl?.trim();
  if (website) {
    links.push({
      id: crypto.randomUUID(),
      type: 'WEBSITE',
      label: 'Site web',
      url: website,
      sortOrder: order++,
      platform: null,
    });
  }

  const ctaUrl = p.ctaUrl?.trim();
  if (ctaUrl) {
    links.push({
      id: crypto.randomUUID(),
      type: 'CTA',
      label: p.ctaLabel?.trim() || 'En savoir plus',
      url: ctaUrl,
      sortOrder: order++,
      platform: null,
    });
  }

  let socialRecord: Record<string, string> | null = null;
  if (p.socialLinks) {
    if (typeof p.socialLinks === 'string') {
      try {
        socialRecord = JSON.parse(p.socialLinks) as Record<string, string>;
      } catch {
        socialRecord = null;
      }
    } else {
      socialRecord = p.socialLinks;
    }
  }

  if (socialRecord) {
    for (const [platform, url] of Object.entries(socialRecord)) {
      if (!url.trim()) continue;
      const platformParsed = platformEnum.safeParse(platform.toUpperCase());
      links.push({
        id: crypto.randomUUID(),
        type: 'SOCIAL',
        label: platform,
        url,
        sortOrder: order++,
        platform: platformParsed.success ? platformParsed.data : 'OTHER',
      });
    }
  }

  return links;
}

export function parseDemoSubtitles(
  subtitles?: string[] | null,
  legacyDescription?: string | null
): Array<{ value: string }> {
  const parsed = parseSubtitleItems(subtitles);
  if (parsed.length > 0) return parsed;
  const legacy = legacyDescription?.trim();
  return legacy ? [{ value: legacy }] : [];
}

export function parseProfileBlocks(raw: unknown): ProfileMediaBlockForm[] {
  if (!Array.isArray(raw)) return [];
  const blocks: ProfileMediaBlockForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const block = item as Record<string, unknown>;
    const mediaUrl = block.mediaUrl != null ? String(block.mediaUrl) : '';
    const mediaTypeRaw = block.mediaType != null ? String(block.mediaType).toUpperCase() : null;
    const mediaType = mediaTypeRaw === 'VIDEO' ? 'VIDEO' : mediaTypeRaw === 'IMAGE' ? 'IMAGE' : null;
    const statusRaw = block.status != null ? String(block.status).toUpperCase() : null;
    const status =
      statusRaw === 'ONGOING' || statusRaw === 'FINISHED' ? statusRaw : null;
    const employmentRaw =
      block.employmentType != null ? String(block.employmentType).toUpperCase() : null;
    const employmentType =
      employmentRaw === 'FULL_TIME' ||
      employmentRaw === 'PART_TIME' ||
      employmentRaw === 'CONTRACT' ||
      employmentRaw === 'FREELANCE' ||
      employmentRaw === 'INTERNSHIP'
        ? employmentRaw
        : null;
    blocks.push({
      id: block.id != null ? String(block.id) : crypto.randomUUID(),
      sortOrder: typeof block.sortOrder === 'number' ? block.sortOrder : index,
      title: block.title != null ? String(block.title) : '',
      organization: block.organization != null ? String(block.organization) : '',
      text: block.text != null ? String(block.text) : '',
      mediaUrl,
      mediaType: mediaUrl ? mediaType ?? inferProfileMediaType(mediaUrl) : null,
      period: block.period != null ? String(block.period) : '',
      subtitles: parseSubtitleItems(block.subtitles),
      status,
      tasks: parseSubtitleItems(block.tasks).map((item) => ({
        value: item.value.slice(0, 300),
      })),
      tools: parseStrengthsTools(block.tools).slice(0, 8),
      links: parseExperienceProofLinks(block.links),
      remarks: block.remarks != null ? String(block.remarks) : '',
      location: block.location != null ? String(block.location) : '',
      employmentType,
    });
  });
  return blocks.sort((a, b) => a.sortOrder - b.sortOrder);
}

function parseExperienceProofLinks(raw: unknown): z.infer<typeof experienceProofLinkSchema>[] {
  if (!Array.isArray(raw)) return [];
  const links: z.infer<typeof experienceProofLinkSchema>[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const link = item as Record<string, unknown>;
    const url = link.url != null ? String(link.url).trim() : '';
    const label = link.label != null ? String(link.label).trim() : '';
    if (!url && !label) return;
    const platformRaw = link.platform != null ? String(link.platform).toUpperCase() : null;
    const platform =
      platformRaw === 'GITHUB' ||
      platformRaw === 'FACEBOOK' ||
      platformRaw === 'LINKEDIN' ||
      platformRaw === 'INSTAGRAM' ||
      platformRaw === 'YOUTUBE' ||
      platformRaw === 'WEBSITE' ||
      platformRaw === 'OTHER'
        ? platformRaw
        : null;
    links.push({
      id: link.id != null ? String(link.id) : crypto.randomUUID(),
      label,
      url,
      platform,
      sortOrder: typeof link.sortOrder === 'number' ? link.sortOrder : index,
    });
  });
  return links.sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 5);
}

/** Experience blocks: migrate legacy data into dedicated fields. */
export function parseExperienceBlocks(raw: unknown): ProfileMediaBlockForm[] {
  return parseProfileBlocks(raw).map((block) => {
    let period = block.period?.trim() ?? '';
    let title = block.title?.trim() ?? '';
    const organization = block.organization?.trim() ?? '';
    let text = block.text?.trim() ?? '';
    let subtitles = [...block.subtitles];

    if (!period && subtitles[0]?.value?.trim()) {
      period = subtitles[0].value.trim();
      subtitles = subtitles.slice(1);
    }

    if (!title && text.includes('\n')) {
      const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length > 1) {
        title = lines[0];
        text = lines.slice(1).join('\n');
      }
    }

    return {
      ...block,
      period,
      title,
      organization,
      text,
      subtitles,
    };
  });
}

const STRENGTH_LEVELS = new Set<StrengthToolLevel>([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

function parseStrengthLevel(raw: unknown): StrengthToolLevel | null {
  if (typeof raw !== 'string') return null;
  const level = raw.trim().toLowerCase();
  return STRENGTH_LEVELS.has(level as StrengthToolLevel) ? (level as StrengthToolLevel) : null;
}

export function parseStrengthsTools(raw: unknown): StrengthFormItem[] {
  if (!Array.isArray(raw)) return [];
  const parsed: StrengthFormItem[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      const value = item.trim();
      if (value) parsed.push({ value, description: '' });
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const value = String(record.value ?? record.name ?? '').trim();
    if (!value) continue;
    const description =
      typeof record.description === 'string' ? record.description.trim() : '';
    const category = typeof record.category === 'string' ? record.category.trim() : '';
    const useCases = Array.isArray(record.useCases)
      ? record.useCases
          .map((entry) => (typeof entry === 'string' ? entry.trim().slice(0, 60) : ''))
          .filter(Boolean)
          .slice(0, 8)
      : [];
    const experienceYears =
      typeof record.experienceYears === 'number' && Number.isFinite(record.experienceYears)
        ? Math.max(0, Math.min(40, Math.round(record.experienceYears)))
        : null;
    const experienceLabel =
      typeof record.experienceLabel === 'string' ? record.experienceLabel.trim() : '';
    const currentlyUsed = typeof record.currentlyUsed === 'boolean' ? record.currentlyUsed : null;
    const iconUrl =
      typeof record.iconUrl === 'string' && record.iconUrl.trim() ? record.iconUrl.trim() : null;
    parsed.push({
      value,
      description,
      category,
      level: parseStrengthLevel(record.level),
      useCases,
      experienceYears,
      experienceLabel,
      currentlyUsed,
      iconUrl,
    });
  }
  return parsed;
}

export function inferProfileMediaType(url: string): 'IMAGE' | 'VIDEO' {
  const probe = url.toLowerCase();
  if (/\.(mp4|webm|mov)(\?|$)/i.test(probe) || probe.includes('video/')) {
    return 'VIDEO';
  }
  return 'IMAGE';
}

export function serializeProfileBlocks(
  blocks: ProfileMediaBlockForm[],
  options?: { stripMedia?: boolean }
) {
  const stripMedia = options?.stripMedia === true;
  return blocks
    .filter((block) => block.text.trim().length > 0)
    .map((block, index) => {
      const mediaUrl = stripMedia ? null : block.mediaUrl?.trim() || null;
      const title = block.title?.trim() || null;
      const organization = block.organization?.trim() || null;
      const period = block.period?.trim() || null;
      const remarks = block.remarks?.trim() || null;
      const location = block.location?.trim() || null;
      return {
        id: block.id,
        sortOrder: index,
        title,
        organization,
        text: block.text.trim(),
        mediaUrl,
        mediaType: mediaUrl ? block.mediaType ?? inferProfileMediaType(mediaUrl) : null,
        period,
        subtitles: block.subtitles?.map((item) => item.value.trim()).filter(Boolean) ?? [],
        status: block.status ?? null,
        tasks: block.tasks?.map((item) => item.value.trim()).filter(Boolean) ?? [],
        tools:
          block.tools
            ?.map((item) => {
              const name = item.value.trim();
              if (!name) return null;
              const iconUrl = item.iconUrl?.trim() || null;
              return iconUrl ? { name, iconUrl } : { name };
            })
            .filter((item): item is { name: string; iconUrl?: string } => item != null) ?? [],
        links: (block.links ?? [])
          .filter((link) => link.url.trim().length > 0 && link.label.trim().length > 0)
          .map((link, linkIndex) => {
            const raw = link.url.trim();
            return {
              id: link.id,
              label: link.label.trim(),
              url: toAbsoluteHttpUrl(raw) ?? raw,
              platform: link.platform ?? null,
              sortOrder: linkIndex,
            };
          }),
        remarks,
        location,
        employmentType: block.employmentType ?? null,
      };
    });
}

export function serializeProfileLinks(links: ProfileLinkForm[]) {
  return links
    .filter((link) => link.url.trim().length > 0)
    .map((link, index) => {
      const url = toAbsoluteHttpUrl(link.url) ?? link.url.trim();
      const label = link.label.trim() || deriveProfileLinkLabel(url);
      return {
        id: link.id,
        type: link.type || 'CUSTOM',
        label,
        url,
        sortOrder: index,
        platform: link.type === 'SOCIAL' ? link.platform ?? null : null,
      };
    });
}

export function serializeProfileServices(services: ProfileServiceForm[]) {
  return services
    .filter((service) => service.title.trim().length > 0)
    .map((service, index) => ({
      id: service.id,
      sortOrder: index,
      title: service.title.trim(),
      description: service.description?.trim() ?? '',
      basePriceCents: service.basePriceCents ?? null,
      deadline: service.deadline?.trim() ? service.deadline.trim() : null,
      tasks: service.tasks?.map((item) => item.value.trim()).filter(Boolean) ?? [],
    }));
}

export function serializeFaqItems(items: FaqItemForm[]) {
  return items
    .filter((item) => item.question.trim().length > 0 && item.answer.trim().length > 0)
    .map((item, index) => ({
      id: item.id,
      sortOrder: index,
      question: item.question.trim(),
      answer: item.answer.trim(),
    }));
}

export function serializeTeamMembers(members: TeamMemberForm[]) {
  return members
    .filter((member) => member.name.trim().length > 0 && member.responsibility.trim().length > 0)
    .map((member, index) => {
      const imageUrl = member.imageUrl?.trim() || null;
      return {
        id: member.id,
        sortOrder: index,
        name: member.name.trim(),
        responsibility: member.responsibility.trim(),
        imageUrl,
        socialLinks: (member.socialLinks ?? [])
          .filter((link) => link.url.trim().length > 0)
          .map((link, linkIndex) => {
            const raw = link.url.trim();
            const platform = inferTeamSocialPlatform(raw);
            const url =
              platform === 'EMAIL' || raw.includes('@')
                ? raw
                : (toAbsoluteHttpUrl(raw) ?? raw);
            return {
              id: link.id,
              platform,
              label: link.label?.trim() ? link.label.trim() : null,
              url,
              sortOrder: linkIndex,
            };
          }),
      };
    });
}

export function serializeGalleryItems(items: GalleryItemForm[]) {
  return items
    .filter((item) => item.mediaUrl.trim().length > 0)
    .map((item, index) => {
      const mediaUrl = item.mediaUrl.trim();
      return {
        id: item.id,
        sortOrder: index,
        title: item.title.trim(),
        mediaUrl,
        mediaType: item.mediaType ?? inferProfileMediaType(mediaUrl),
      };
    });
}

function trimOptional(value?: string | null): string {
  return value?.trim() ?? '';
}

function normalizeProfileComparable(values: ProfileFormValues, availabilityHours: string) {
  return {
    fullName: trimOptional(values.fullName),
    bio: trimOptional(values.bio),
    specialite: trimOptional(values.specialite),
    gender: trimOptional(values.gender),
    spokenLanguages: dedupeSpokenLanguages(
      values.spokenLanguages.map((item) => trimOptional(item.value)).filter(Boolean)
    ).sort(),
    locationCity: trimOptional(values.locationCity),
    locationCountry: trimOptional(values.locationCountry),
    locationLat: values.locationLat ?? null,
    locationLng: values.locationLng ?? null,
    timezoneId: trimOptional(values.timezoneId),
    contactAddress: trimOptional(values.contactAddress),
    contactPhone: toStoredPhoneNumber(values.contactPhone),
    contactEmail: trimOptional(values.contactEmail),
    contactAddresses: serializeContactEntries(values.contactAddresses, 'address'),
    contactPhones: serializeContactEntries(values.contactPhones, 'phone'),
    contactEmails: serializeContactEntries(values.contactEmails, 'email'),
    availabilityHours: trimOptional(availabilityHours),
    isAvailable: values.isAvailable,
    profileLinks: serializeProfileLinks(values.profileLinks),
    serviceOffers: serializeProfileServices(values.serviceOffers),
    faqItems: serializeFaqItems(values.faqItems),
    teamMembers: serializeTeamMembers(values.teamMembers),
    galleryItems: serializeGalleryItems(values.galleryItems),
    whyMeBlocks: serializeProfileBlocks(values.whyMeBlocks),
    experienceBlocks: serializeProfileBlocks(values.experienceBlocks),
    yearsOfExperience: values.yearsOfExperience ?? null,
    strengthsTools: values.strengthsTools
      .map((item) => ({
        value: trimOptional(item.value),
        description: trimOptional(item.description ?? ''),
        category: trimOptional(item.category ?? ''),
        level: item.level ?? null,
        useCases: (item.useCases ?? []).map((entry) => entry.trim()).filter(Boolean).slice(0, 8),
        experienceYears: item.experienceYears ?? null,
        experienceLabel: null,
        currentlyUsed: item.currentlyUsed ?? null,
        iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
      }))
      .filter((item) => Boolean(item.value))
      .sort((a, b) => a.value.localeCompare(b.value)),
  };
}

/** Comparable payload for skills — order preserved (portfolio list order). */
export function normalizeStrengthsToolsComparable(
  items: Array<{
    value?: string | null;
    description?: string | null;
    category?: string | null;
    level?: StrengthToolLevel | null;
    useCases?: string[] | null;
    experienceYears?: number | null;
    currentlyUsed?: boolean | null;
    iconUrl?: string | null;
  }>
) {
  return items
    .map((item) => ({
      value: trimOptional(item.value),
      description: trimOptional(item.description ?? ''),
      category: trimOptional(item.category ?? ''),
      level: item.level ?? null,
      useCases: (item.useCases ?? []).map((entry) => entry.trim()).filter(Boolean).slice(0, 8),
      experienceYears:
        typeof item.experienceYears === 'number' && Number.isFinite(item.experienceYears)
          ? Math.max(0, Math.min(40, Math.round(item.experienceYears)))
          : null,
      currentlyUsed: typeof item.currentlyUsed === 'boolean' ? item.currentlyUsed : null,
      iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
    }))
    .filter((item) => Boolean(item.value));
}

export function areStrengthsToolsEqual(
  a: Parameters<typeof normalizeStrengthsToolsComparable>[0],
  b: Parameters<typeof normalizeStrengthsToolsComparable>[0]
): boolean {
  return (
    JSON.stringify(normalizeStrengthsToolsComparable(a)) ===
    JSON.stringify(normalizeStrengthsToolsComparable(b))
  );
}

export function hasProfileFormChanges(
  current: ProfileFormValues,
  saved: ProfileFormValues,
  currentAvailabilityHours: string,
  savedAvailabilityHours: string,
  currentVisibility: ContactVisibilitySettings,
  savedVisibility: ContactVisibilitySettings
): boolean {
  if (JSON.stringify(currentVisibility) !== JSON.stringify(savedVisibility)) {
    return true;
  }
  return (
    JSON.stringify(normalizeProfileComparable(current, currentAvailabilityHours)) !==
    JSON.stringify(normalizeProfileComparable(saved, savedAvailabilityHours))
  );
}
