'use client';
import { getHttpUrlFieldError, toAbsoluteHttpUrl, type ProfileMediaBlockForm } from '@/components/creator/studio/profile-form-schema';
import type { ExperienceEmploymentType } from '@/types/profile';

export const MAX_EXPERIENCE_ENTRIES = 7;

export type PortfolioExperienceStatus = 'ONGOING' | 'FINISHED';

export type PortfolioExperienceEmploymentType = ExperienceEmploymentType;

type PortfolioExperienceProofPlatform =
  | 'GITHUB'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'WEBSITE'
  | 'OTHER';

export type PortfolioExperienceProofLink = {
  id: string;
  label: string;
  url: string;
  platform: PortfolioExperienceProofPlatform | null;
  sortOrder: number;
};

type PortfolioExperienceBlock = {
  id: string;
  title: string;
  organization: string;
  period: string;
  text: string;
  status: PortfolioExperienceStatus | null;
  location: string;
  employmentType: PortfolioExperienceEmploymentType | null;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | null;
  tasks: Array<{ value: string }>;
  tools: Array<{ value: string; description?: string; iconUrl?: string | null }>;
  links: PortfolioExperienceProofLink[];
  /** Kept out of the generated CV when true. */
  hideFromCv?: boolean;
};

export type PortfolioExperienceBlockDraft = {
  title: string;
  organization: string;
  period: string;
  text: string;
  status: PortfolioExperienceStatus | null;
  location: string;
  employmentType: PortfolioExperienceEmploymentType | null;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | null;
  tasks: Array<{ value: string }>;
  tools: Array<{ value: string; description?: string; iconUrl?: string | null }>;
  links: PortfolioExperienceProofLink[];
  /** Kept out of the generated CV when true. */
  hideFromCv?: boolean;
};

export const EXPERIENCE_MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov';

export const EMPLOYMENT_OPTIONS: { value: PortfolioExperienceEmploymentType; label: string }[] = [
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

export function toDraft(block: PortfolioExperienceBlock): PortfolioExperienceBlockDraft {
  return {
    title: block.title,
    organization: block.organization,
    period: block.period,
    text: block.text,
    status: block.status,
    location: block.location,
    employmentType: block.employmentType,
    mediaUrl: block.mediaUrl,
    mediaType: block.mediaType,
    tasks: block.tasks.map((item) => ({ value: item.value })),
    tools: block.tools.map((item) => ({
      value: item.value,
      description: item.description ?? '',
      iconUrl: item.iconUrl ?? null,
    })),
    links: block.links.map((link) => ({ ...link })),
    hideFromCv: Boolean(block.hideFromCv),
  };
}

export function mapProfileBlockToExperienceBlock(
  block: ProfileMediaBlockForm
): PortfolioExperienceBlock {
  return {
    id: block.id,
    title: block.title ?? '',
    organization: block.organization ?? '',
    period: block.period ?? '',
    text: block.text ?? '',
    status: block.status ?? null,
    location: block.location ?? '',
    employmentType: block.employmentType ?? null,
    mediaUrl: block.mediaUrl ?? '',
    mediaType: block.mediaType ?? null,
    tasks: (block.tasks ?? []).map((item) => ({ value: item.value ?? '' })),
    tools: (block.tools ?? []).map((item) => ({
      value: item.value ?? '',
      description: item.description ?? '',
      iconUrl: item.iconUrl ?? null,
    })),
    links: (block.links ?? []).map((link, index) => ({
      id: link.id,
      label: link.label ?? '',
      url: link.url ?? '',
      platform: link.platform ?? null,
      sortOrder: link.sortOrder ?? index,
    })),
    hideFromCv: Boolean(block.hideFromCv),
  };
}

function normalizeStringList(items: Array<{ value: string }>): string[] {
  return items.map((item) => item.value.trim()).filter(Boolean);
}

function normalizeTools(
  tools: Array<{ value: string; description?: string; iconUrl?: string | null }>
): Array<{ value: string; description: string; iconUrl: string | null }> {
  return tools
    .map((item) => ({
      value: item.value.trim(),
      description: (item.description ?? '').trim(),
      iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
    }))
    .filter((item) => item.value.length > 0);
}

function normalizeLinks(links: PortfolioExperienceProofLink[]): PortfolioExperienceProofLink[] {
  return links
    .map((link, index) => {
      const raw = link.url.trim();
      return {
        id: link.id,
        label: link.label.trim(),
        url: toAbsoluteHttpUrl(raw) ?? raw,
        platform: link.platform,
        sortOrder: index,
      };
    })
    .filter((link) => link.label.length > 0 || link.url.length > 0);
}

export function collectProofLinkUrlErrors(
  links: PortfolioExperienceProofLink[]
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const link of links) {
    const url = link.url.trim();
    const label = link.label.trim();
    if (!url && !label) continue;
    if (!url) {
      errors[link.id] = 'URL is required.';
      continue;
    }
    const message = getHttpUrlFieldError(url);
    if (message) errors[link.id] = message;
  }
  return errors;
}

export function cleanDraft(draft: PortfolioExperienceBlockDraft): PortfolioExperienceBlockDraft {
  return {
    title: draft.title.trim(),
    organization: draft.organization.trim(),
    period: draft.period.trim(),
    text: draft.text.trim(),
    status: draft.status,
    location: draft.location.trim(),
    employmentType: draft.employmentType,
    mediaUrl: draft.mediaUrl.trim(),
    mediaType: draft.mediaUrl.trim() ? draft.mediaType : null,
    tasks: normalizeStringList(draft.tasks).map((value) => ({ value })),
    tools: normalizeTools(draft.tools),
    links: normalizeLinks(draft.links),
    hideFromCv: Boolean(draft.hideFromCv),
  };
}

export function blockHasContent(block: {
  title: string;
  organization: string;
  period: string;
  text: string;
  status: PortfolioExperienceStatus | null;
  location: string;
  employmentType: PortfolioExperienceEmploymentType | null;
  mediaUrl: string;
  tasks: Array<{ value: string }>;
  tools: Array<{ value: string; description?: string }>;
  links: PortfolioExperienceProofLink[];
}): boolean {
  return (
    Boolean(block.text.trim()) ||
    Boolean(block.title.trim()) ||
    Boolean(block.organization.trim()) ||
    Boolean(block.period.trim()) ||
    Boolean(block.location.trim()) ||
    Boolean(block.mediaUrl.trim()) ||
    block.status != null ||
    block.employmentType != null ||
    block.tasks.some((item) => item.value.trim()) ||
    block.tools.some((item) => item.value.trim() || item.description?.trim()) ||
    block.links.some((item) => item.url.trim() || item.label.trim())
  );
}
