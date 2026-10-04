import { parseSpecialtyList } from '@/lib/specialties';
import { nationalityLabel } from '@/lib/countries';
import type { CreatorProfileDto, ContactEntry } from '@/types/ecosystem';

export type CvTemplateId = 'ats' | 'modern' | 'editorial';

export const CV_TEMPLATES: ReadonlyArray<{
  id: CvTemplateId;
  label: string;
  blurb: string;
}> = [
  {
    id: 'ats',
    label: 'ATS friendly',
    blurb: 'Single column, standard headings, plain text. Parsed cleanly by applicant tracking systems.',
  },
  {
    id: 'modern',
    label: 'Modern',
    blurb: 'Two columns with a side panel for contact, skills and languages. Photo included.',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    blurb: 'Large name, generous whitespace and an accent rule. Made to stand out when read by people.',
  },
];

export function parseCvTemplate(raw: string | null | undefined): CvTemplateId {
  return CV_TEMPLATES.some((template) => template.id === raw) ? (raw as CvTemplateId) : 'ats';
}

/**
 * ATS layouts. All of them stay single-column, real text, no tables, icons or images, with standard fonts,
 * 12–18 mm margins, ~10–10.5 pt body and tight vertical rhythm so a typical profile fits one A4 page.
 */
export type AtsVariantId = 'classic' | 'compact' | 'harvard' | 'banded' | 'signature';

export const ATS_VARIANTS: ReadonlyArray<{
  id: AtsVariantId;
  label: string;
  blurb: string;
}> = [
  {
    id: 'classic',
    label: 'Classic',
    blurb: 'Clean sans-serif, ruled headings, dates on the right.',
  },
  {
    id: 'compact',
    label: 'Compact',
    blurb: 'Narrow margins and dense spacing to keep everything on one page.',
  },
  {
    id: 'harvard',
    label: 'Harvard',
    blurb: 'Centered header, serif type, organization first — the career-office standard.',
  },
  {
    id: 'banded',
    label: 'Banded',
    blurb: 'Centered headings on soft color bands, pipe-separated lists, dense and easy to scan.',
  },
  {
    id: 'signature',
    label: 'Signature',
    blurb: 'Spaced serif name, contact bar, education first and skills in columns — refined but still parseable.',
  },
];

/** Vertical rhythm applied on top of any ATS variant; `medium` keeps the variant's own spacing. */
export type AtsDensity = 'tight' | 'medium' | 'airy' | 'spacious';

export const DEFAULT_ATS_DENSITY: AtsDensity = 'airy';

export const ATS_DENSITIES: ReadonlyArray<{ id: AtsDensity; label: string }> = [
  { id: 'tight', label: 'Tight' },
  { id: 'medium', label: 'Medium' },
  { id: 'airy', label: 'Airy' },
  { id: 'spacious', label: 'Spacious' },
];

export function parseAtsDensity(raw: string | null | undefined): AtsDensity {
  return ATS_DENSITIES.some((density) => density.id === raw) ? (raw as AtsDensity) : DEFAULT_ATS_DENSITY;
}

export function parseAtsVariant(raw: string | null | undefined): AtsVariantId {
  return ATS_VARIANTS.some((variant) => variant.id === raw) ? (raw as AtsVariantId) : 'classic';
}

export type CvSectionId = 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'interests' | 'contact';

/** Sections whose heading can be renamed, in CV order. */
export const CV_SECTIONS: ReadonlyArray<{ id: CvSectionId; name: string }> = [
  { id: 'summary', name: 'Summary' },
  { id: 'experience', name: 'Experience' },
  { id: 'education', name: 'Education' },
  { id: 'skills', name: 'Skills' },
  { id: 'languages', name: 'Languages' },
  { id: 'interests', name: 'Interests' },
  { id: 'contact', name: 'Contact' },
];

/** User overrides; a missing or blank entry falls back to the layout default. */
export type CvSectionLabels = Partial<Record<CvSectionId, string>>;

const BASE_LABELS: Record<CvSectionId, string> = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  languages: 'Languages',
  interests: 'Interests',
  contact: 'Contact',
};

const LAYOUT_LABELS: Record<string, Partial<Record<CvSectionId, string>>> = {
  'ats:banded': {
    summary: 'Career Summary',
    skills: 'Expertise',
    experience: 'Professional Experience',
  },
  'ats:harvard': { skills: 'Skills & Interests' },
  'ats:signature': {
    summary: 'Professional Profile',
    experience: 'Work Experience',
  },
  editorial: { summary: 'Profile', skills: 'Expertise' },
};

export function cvDefaultLabel(template: CvTemplateId, variant: AtsVariantId, id: CvSectionId): string {
  const key = template === 'ats' ? `ats:${variant}` : template;
  return LAYOUT_LABELS[key]?.[id] ?? BASE_LABELS[id];
}

export function resolveCvLabel(
  labels: CvSectionLabels,
  template: CvTemplateId,
  variant: AtsVariantId,
  id: CvSectionId,
): string {
  return labels[id]?.trim() || cvDefaultLabel(template, variant, id);
}

export type CvExperience = {
  title: string;
  organization: string;
  period: string;
  location: string;
  summary: string;
  tasks: string[];
};

export type CvEducation = {
  period: string;
  title: string;
  institution: string;
};
export type CvLanguage = { name: string; level: string };
export type CvLink = { label: string; url: string };

export type CvData = {
  fullName: string;
  headline: string;
  avatarUrl: string | null;
  summary: string;
  email: string;
  phone: string;
  location: string;
  nationality: string;
  yearsOfExperience: number | null;
  links: CvLink[];
  experiences: CvExperience[];
  education: CvEducation[];
  skills: string[];
  languages: CvLanguage[];
  interests: string[];
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Native / Expert',
};

const clean = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim();

function uniq(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = clean(raw);
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function firstContact(entries: ContactEntry[] | null | undefined, fallback: string | null | undefined): string {
  const sorted = [...(entries ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  return clean(sorted.find((entry) => clean(entry.value))?.value) || clean(fallback);
}

function bySortOrder<T extends { sortOrder: number }>(items: T[] | null | undefined): T[] {
  return [...(items ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
}

function displayUrl(url: string): string {
  return url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
}

function collectLinks(profile: CreatorProfileDto): CvLink[] {
  const links: CvLink[] = [];
  // Legacy website / social fields can repeat a profile link, so hidden URLs are dropped from every source.
  const hidden = new Set(
    (profile.profileLinks ?? [])
      .filter((link) => link.hideFromCv === true && clean(link.url))
      .map((link) => displayUrl(clean(link.url)).toLowerCase()),
  );
  if (profile.websiteUrl) links.push({ label: 'Website', url: profile.websiteUrl });
  for (const link of bySortOrder(profile.profileLinks)) {
    if (!clean(link.url) || link.type === 'CTA' || link.hideFromCv === true) continue;
    links.push({
      label: clean(link.label) || clean(link.platform) || 'Link',
      url: link.url,
    });
  }
  if (profile.socialLinks && typeof profile.socialLinks === 'object') {
    for (const [platform, url] of Object.entries(profile.socialLinks)) {
      if (clean(url)) links.push({ label: platform, url });
    }
  }
  const seen = new Set<string>();
  return links
    .filter((link) => {
      const key = displayUrl(clean(link.url)).toLowerCase();
      if (hidden.has(key)) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5)
    .map((link) => ({ ...link, url: displayUrl(link.url) }));
}

/** Turns the creator profile into CV sections; empty sections come back as empty arrays / strings. */
export function buildCvData(
  profile: CreatorProfileDto,
  account: { fullName?: string | null; email?: string | null } = {},
): CvData {
  const specialties = parseSpecialtyList(profile.specialties, profile.specialite);
  const location = [clean(profile.locationCity), clean(profile.locationCountry)].filter(Boolean).join(', ');

  const experiences = bySortOrder(profile.experienceBlocks)
    .filter((block) => !block.hideFromCv)
    .map((block) => ({
      title: clean(block.title),
      organization: clean(block.organization),
      period: clean(block.period),
      location: clean(block.location),
      summary: clean(block.text),
      tasks: uniq(block.tasks ?? []),
    }))
    .filter((entry) => entry.title || entry.organization || entry.summary);

  const education = bySortOrder(profile.aboutEducation)
    .map((entry) => ({
      period: clean(entry.schoolYear),
      title: clean(entry.title),
      institution: clean(entry.institution),
    }))
    .filter((entry) => entry.title || entry.institution);

  const languages: CvLanguage[] = (profile.spokenLanguages ?? [])
    .filter((language) => clean(language.name))
    .map((language) => ({
      name: clean(language.name),
      level: language.level ? (LEVEL_LABELS[language.level] ?? '') : '',
    }));
  if (languages.length === 0 && profile.languages) {
    for (const name of uniq(profile.languages.split(/[,;/]/))) languages.push({ name, level: '' });
  }

  return {
    fullName: clean(profile.fullName) || clean(account.fullName) || 'Your name',
    headline: specialties.slice(0, 3).join(' · '),
    avatarUrl: profile.avatarUrl ?? null,
    summary: clean(profile.bio),
    email: firstContact(profile.contactEmails, profile.contactEmail) || clean(account.email),
    phone: firstContact(profile.contactPhones, profile.contactPhone),
    location,
    nationality: nationalityLabel(profile.nationality),
    yearsOfExperience: profile.yearsOfExperience ?? null,
    links: collectLinks(profile),
    experiences,
    education,
    skills: uniq((profile.aboutSkills ?? []).map((skill) => skill.title)).slice(0, 16),
    languages,
    interests: uniq(profile.aboutInterests ?? []).slice(0, 8),
  };
}

/** Sections worth flagging as missing before generating. */
export function cvMissingSections(data: CvData): string[] {
  const missing: string[] = [];
  if (!data.summary) missing.push('Bio');
  if (data.experiences.length === 0) missing.push('Experience');
  if (data.education.length === 0) missing.push('Education');
  if (data.skills.length === 0) missing.push('Skills');
  if (!data.email && !data.phone) missing.push('Contact');
  return missing;
}
