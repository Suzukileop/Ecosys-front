export type PortfolioNavSectionKey = 'work' | 'services' | 'skills' | 'about' | 'experience' | 'team' | 'gallery' | 'faq' | 'contact';

export type PortfolioNavWorkIcon = 'grid' | 'briefcase' | 'image';
export type PortfolioNavServicesIcon = 'star' | 'sparkles' | 'wrench';
export type PortfolioNavAboutIcon = 'user' | 'id-card' | 'heart';
export type PortfolioNavExperienceIcon = 'briefcase' | 'list' | 'id-card';
export type PortfolioNavFaqIcon = 'help-circle' | 'message' | 'list';
export type PortfolioNavContactIcon = 'mail' | 'send' | 'phone';

export type PortfolioNavItemIcons = {
  work: PortfolioNavWorkIcon;
  services: PortfolioNavServicesIcon;
  skills: PortfolioNavServicesIcon;
  about: PortfolioNavAboutIcon;
  experience: PortfolioNavExperienceIcon;
  team: PortfolioNavAboutIcon;
  gallery: PortfolioNavWorkIcon;
  faq: PortfolioNavFaqIcon;
  contact: PortfolioNavContactIcon;
};

export type PortfolioNavItemLabels = Record<PortfolioNavSectionKey, string>;

export type PortfolioNavIconVariant =
  | 'home'
  | PortfolioNavWorkIcon
  | PortfolioNavServicesIcon
  | PortfolioNavAboutIcon
  | PortfolioNavExperienceIcon
  | PortfolioNavFaqIcon
  | PortfolioNavContactIcon;

export const PORTFOLIO_NAV_SECTION_META: {
  key: PortfolioNavSectionKey;
  title: string;
  description: string;
}[] = [
  { key: 'work', title: 'Work / Portfolio', description: 'Jumps to featured projects.' },
  { key: 'skills', title: 'Skills', description: 'Jumps to tools and skills.' },
  { key: 'services', title: 'Services', description: 'Jumps to services and pricing.' },
  { key: 'about', title: 'About', description: 'Jumps to bio, stats, and profile details.' },
  { key: 'experience', title: 'Experience', description: 'Jumps to career timeline and roles.' },
  { key: 'team', title: 'Team', description: 'Jumps to members and their roles.' },
  { key: 'gallery', title: 'Gallery', description: 'Jumps to the media gallery.' },
  { key: 'faq', title: 'FAQ', description: 'Jumps to questions and answers.' },
  { key: 'contact', title: 'Contact', description: 'Jumps to email, phone, and links.' },
];

export const DEFAULT_PORTFOLIO_NAV_ITEM_LABELS: PortfolioNavItemLabels = {
  work: 'Work',
  services: 'Services',
  skills: 'Skills',
  about: 'About',
  experience: 'Experience',
  team: 'Team',
  gallery: 'Gallery',
  faq: 'FAQ',
  contact: 'Contact',
};

export const DEFAULT_PORTFOLIO_NAV_ITEM_ICONS: PortfolioNavItemIcons = {
  work: 'grid',
  services: 'star',
  skills: 'sparkles',
  about: 'user',
  experience: 'briefcase',
  team: 'user',
  gallery: 'image',
  faq: 'help-circle',
  contact: 'mail',
};

export const PORTFOLIO_NAV_LABEL_PRESETS: Record<
  PortfolioNavSectionKey,
  { value: string; label: string }[]
> = {
  work: [
    { value: 'Work', label: 'Work' },
    { value: 'Portfolio', label: 'Portfolio' },
    { value: 'Projects', label: 'Projects' },
    { value: 'Creations', label: 'Creations' },
    { value: 'Gallery', label: 'Gallery' },
  ],
  services: [
    { value: 'Services', label: 'Services' },
    { value: 'Skills', label: 'Skills' },
    { value: 'Expertise', label: 'Expertise' },
    { value: 'Offers', label: 'Offers' },
    { value: 'What I do', label: 'What I do' },
  ],
  skills: [
    { value: 'Skills', label: 'Skills' },
    { value: 'Tools', label: 'Tools' },
    { value: 'Stack', label: 'Stack' },
    { value: 'Expertise', label: 'Expertise' },
    { value: 'Tech', label: 'Tech' },
  ],
  about: [
    { value: 'About', label: 'About' },
    { value: 'Profile', label: 'Profile' },
    { value: 'Story', label: 'Story' },
    { value: 'Background', label: 'Background' },
    { value: 'Who I am', label: 'Who I am' },
  ],
  experience: [
    { value: 'Experience', label: 'Experience' },
    { value: 'Career', label: 'Career' },
    { value: 'History', label: 'History' },
    { value: 'Journey', label: 'Journey' },
    { value: 'Roles', label: 'Roles' },
  ],
  team: [
    { value: 'Team', label: 'Team' },
    { value: 'Équipe', label: 'Équipe' },
    { value: 'Studio', label: 'Studio' },
  ],
  gallery: [
    { value: 'Gallery', label: 'Gallery' },
    { value: 'Galerie', label: 'Galerie' },
    { value: 'Gallery', label: 'Gallery' },
    { value: 'Journal', label: 'Journal visuel' },
  ],
  faq: [
    { value: 'FAQ', label: 'FAQ' },
    { value: 'Questions', label: 'Questions' },
    { value: 'Q&A', label: 'Q&A' },
    { value: 'Answers', label: 'Answers' },
    { value: 'Help', label: 'Help' },
  ],
  contact: [
    { value: 'Contact', label: 'Contact' },
    { value: 'Hire me', label: 'Hire me' },
    { value: 'Get in touch', label: 'Get in touch' },
    { value: 'Reach out', label: 'Reach out' },
    { value: 'Message', label: 'Message' },
  ],
};

export const PORTFOLIO_NAV_ICON_OPTIONS: Record<
  PortfolioNavSectionKey,
  { value: PortfolioNavIconVariant; label: string }[]
> = {
  work: [
    { value: 'grid', label: 'Grid' },
    { value: 'briefcase', label: 'Briefcase' },
    { value: 'image', label: 'Image' },
  ],
  services: [
    { value: 'star', label: 'Star' },
    { value: 'sparkles', label: 'Sparkles' },
    { value: 'wrench', label: 'Wrench' },
  ],
  skills: [
    { value: 'sparkles', label: 'Sparkles' },
    { value: 'star', label: 'Star' },
    { value: 'wrench', label: 'Wrench' },
  ],
  about: [
    { value: 'user', label: 'User' },
    { value: 'id-card', label: 'ID card' },
    { value: 'heart', label: 'Heart' },
  ],
  experience: [
    { value: 'briefcase', label: 'Briefcase' },
    { value: 'list', label: 'List' },
    { value: 'id-card', label: 'ID card' },
  ],
  team: [
    { value: 'user', label: 'User' },
    { value: 'id-card', label: 'ID card' },
    { value: 'heart', label: 'Heart' },
  ],
  gallery: [
    { value: 'image', label: 'Image' },
    { value: 'grid', label: 'Grid' },
    { value: 'briefcase', label: 'Portfolio' },
  ],
  faq: [
    { value: 'help-circle', label: 'Help' },
    { value: 'message', label: 'Chat' },
    { value: 'list', label: 'List' },
  ],
  contact: [
    { value: 'mail', label: 'Mail' },
    { value: 'send', label: 'Send' },
    { value: 'phone', label: 'Phone' },
  ],
};

const WORK_ICONS = new Set<PortfolioNavWorkIcon>(['grid', 'briefcase', 'image']);
const SERVICES_ICONS = new Set<PortfolioNavServicesIcon>(['star', 'sparkles', 'wrench']);
const ABOUT_ICONS = new Set<PortfolioNavAboutIcon>(['user', 'id-card', 'heart']);
const EXPERIENCE_ICONS = new Set<PortfolioNavExperienceIcon>(['briefcase', 'list', 'id-card']);
const FAQ_ICONS = new Set<PortfolioNavFaqIcon>(['help-circle', 'message', 'list']);
const CONTACT_ICONS = new Set<PortfolioNavContactIcon>(['mail', 'send', 'phone']);

const LEGACY_NAV_LABELS: Partial<Record<PortfolioNavSectionKey, Record<string, string>>> = {
  team: { Équipe: 'Team' },
  gallery: { Galerie: 'Gallery' },
};

export function mergeNavItemLabels(
  base: PortfolioNavItemLabels,
  patch: unknown
): PortfolioNavItemLabels {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const next = { ...base };

  for (const key of Object.keys(base) as PortfolioNavSectionKey[]) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      const trimmed = value.trim();
      next[key] = LEGACY_NAV_LABELS[key]?.[trimmed] ?? trimmed;
    }
  }

  return next;
}

export function mergeNavItemIcons(base: PortfolioNavItemIcons, patch: unknown): PortfolioNavItemIcons {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  return {
    work: WORK_ICONS.has(record.work as PortfolioNavWorkIcon)
      ? (record.work as PortfolioNavWorkIcon)
      : base.work,
    services: SERVICES_ICONS.has(record.services as PortfolioNavServicesIcon)
      ? (record.services as PortfolioNavServicesIcon)
      : base.services,
    skills: SERVICES_ICONS.has(record.skills as PortfolioNavServicesIcon)
      ? (record.skills as PortfolioNavServicesIcon)
      : base.skills ?? base.services,
    about: ABOUT_ICONS.has(record.about as PortfolioNavAboutIcon)
      ? (record.about as PortfolioNavAboutIcon)
      : base.about,
    experience: EXPERIENCE_ICONS.has(record.experience as PortfolioNavExperienceIcon)
      ? (record.experience as PortfolioNavExperienceIcon)
      : base.experience,
    team: ABOUT_ICONS.has(record.team as PortfolioNavAboutIcon)
      ? (record.team as PortfolioNavAboutIcon)
      : base.team,
    gallery: WORK_ICONS.has(record.gallery as PortfolioNavWorkIcon)
      ? (record.gallery as PortfolioNavWorkIcon)
      : base.gallery,
    faq: FAQ_ICONS.has(record.faq as PortfolioNavFaqIcon)
      ? (record.faq as PortfolioNavFaqIcon)
      : base.faq,
    contact: CONTACT_ICONS.has(record.contact as PortfolioNavContactIcon)
      ? (record.contact as PortfolioNavContactIcon)
      : base.contact,
  };
}

export function resolveNavItemLabel(
  section: PortfolioNavSectionKey,
  labels: PortfolioNavItemLabels
): string {
  return labels[section]?.trim() || DEFAULT_PORTFOLIO_NAV_ITEM_LABELS[section];
}
