export type PortfolioNavSectionKey =
  | 'info'
  | 'work'
  | 'services'
  | 'about'
  | 'aboutUs'
  | 'experience'
  | 'team'
  | 'gallery'
  | 'faq'
  | 'contact'
  | 'stack'
  | 'tools';

export type PortfolioNavWorkIcon = 'grid' | 'briefcase' | 'image';
export type PortfolioNavServicesIcon = 'star' | 'sparkles' | 'wrench';
export type PortfolioNavAboutIcon = 'user' | 'id-card' | 'heart';
export type PortfolioNavExperienceIcon = 'briefcase' | 'list' | 'id-card';
export type PortfolioNavFaqIcon = 'help-circle' | 'message' | 'list';
export type PortfolioNavContactIcon = 'mail' | 'send' | 'phone';

export type PortfolioNavItemIcons = {
  info: PortfolioNavAboutIcon;
  work: PortfolioNavWorkIcon;
  services: PortfolioNavServicesIcon;
  about: PortfolioNavAboutIcon;
  aboutUs: PortfolioNavAboutIcon;
  experience: PortfolioNavExperienceIcon;
  team: PortfolioNavAboutIcon;
  gallery: PortfolioNavWorkIcon;
  faq: PortfolioNavFaqIcon;
  contact: PortfolioNavContactIcon;
  stack: PortfolioNavServicesIcon;
  tools: PortfolioNavServicesIcon;
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
  { key: 'info', title: 'Info', description: 'Jumps to profile details below Hero.' },
  { key: 'work', title: 'Work / Portfolio', description: 'Jumps to featured projects.' },
  { key: 'stack', title: 'Stack', description: 'Jumps to your tech stack.' },
  { key: 'tools', title: 'Tools', description: 'Jumps to workflow tools.' },
  { key: 'services', title: 'Services', description: 'Jumps to services and pricing.' },
  { key: 'about', title: 'About', description: 'Jumps to bio, stats, and profile details.' },
  { key: 'aboutUs', title: 'About us', description: 'Jumps to the company story, tasks, and founder.' },
  { key: 'experience', title: 'Experience', description: 'Jumps to career timeline and roles.' },
  { key: 'team', title: 'Team', description: 'Jumps to members and their roles.' },
  { key: 'gallery', title: 'Gallery', description: 'Jumps to the media gallery.' },
  { key: 'faq', title: 'FAQ', description: 'Jumps to questions and answers.' },
  { key: 'contact', title: 'Contact', description: 'Jumps to email, phone, and links.' },
];

export const DEFAULT_PORTFOLIO_NAV_ITEM_LABELS: PortfolioNavItemLabels = {
  info: 'Info',
  work: 'Work',
  services: 'Services',
  about: 'About',
  aboutUs: 'About us',
  experience: 'Experience',
  team: 'Team',
  gallery: 'Gallery',
  faq: 'FAQ',
  contact: 'Contact',
  stack: 'Stack',
  tools: 'Tools',
};

export const DEFAULT_PORTFOLIO_NAV_ITEM_ICONS: PortfolioNavItemIcons = {
  info: 'id-card',
  work: 'grid',
  services: 'star',
  about: 'user',
  aboutUs: 'id-card',
  experience: 'briefcase',
  team: 'user',
  gallery: 'image',
  faq: 'help-circle',
  contact: 'mail',
  stack: 'sparkles',
  tools: 'wrench',
};

export const PORTFOLIO_NAV_LABEL_PRESETS: Record<
  PortfolioNavSectionKey,
  { value: string; label: string }[]
> = {
  info: [
    { value: 'Info', label: 'Info' },
    { value: 'Details', label: 'Details' },
    { value: 'Profile', label: 'Profile' },
  ],
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
  about: [
    { value: 'About', label: 'About' },
    { value: 'Profile', label: 'Profile' },
    { value: 'Story', label: 'Story' },
    { value: 'Background', label: 'Background' },
    { value: 'Who I am', label: 'Who I am' },
  ],
  aboutUs: [
    { value: 'About us', label: 'About us' },
    { value: 'Our story', label: 'Our story' },
    { value: 'The studio', label: 'The studio' },
    { value: 'Company', label: 'Company' },
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
  tools: [
    { value: 'Tools', label: 'Tools' },
    { value: 'Workflow & Tools', label: 'Workflow & Tools' },
    { value: 'Tech', label: 'Tech' },
  ],
  stack: [
    { value: 'Stack', label: 'Stack' },
    { value: 'Tech stack', label: 'Tech stack' },
    { value: 'Technologies', label: 'Technologies' },
    { value: 'Skills', label: 'Skills' },
  ],
};

export const PORTFOLIO_NAV_ICON_OPTIONS: Record<
  PortfolioNavSectionKey,
  { value: PortfolioNavIconVariant; label: string }[]
> = {
  info: [
    { value: 'id-card', label: 'ID card' },
    { value: 'user', label: 'User' },
    { value: 'list', label: 'List' },
  ],
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
  about: [
    { value: 'user', label: 'User' },
    { value: 'id-card', label: 'ID card' },
    { value: 'heart', label: 'Heart' },
  ],
  aboutUs: [
    { value: 'id-card', label: 'ID card' },
    { value: 'user', label: 'User' },
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
  stack: [
    { value: 'sparkles', label: 'Sparkles' },
    { value: 'star', label: 'Star' },
    { value: 'wrench', label: 'Wrench' },
  ],
  tools: [
    { value: 'wrench', label: 'Wrench' },
    { value: 'sparkles', label: 'Sparkles' },
    { value: 'star', label: 'Star' },
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
    info: ABOUT_ICONS.has(record.info as PortfolioNavAboutIcon)
      ? (record.info as PortfolioNavAboutIcon)
      : base.info,
    work: WORK_ICONS.has(record.work as PortfolioNavWorkIcon)
      ? (record.work as PortfolioNavWorkIcon)
      : base.work,
    services: SERVICES_ICONS.has(record.services as PortfolioNavServicesIcon)
      ? (record.services as PortfolioNavServicesIcon)
      : base.services,
    about: ABOUT_ICONS.has(record.about as PortfolioNavAboutIcon)
      ? (record.about as PortfolioNavAboutIcon)
      : base.about,
    aboutUs: ABOUT_ICONS.has(record.aboutUs as PortfolioNavAboutIcon)
      ? (record.aboutUs as PortfolioNavAboutIcon)
      : base.aboutUs,
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
    stack: SERVICES_ICONS.has(record.stack as PortfolioNavServicesIcon)
      ? (record.stack as PortfolioNavServicesIcon)
      : base.stack ?? base.tools,
    tools: SERVICES_ICONS.has(record.tools as PortfolioNavServicesIcon)
      ? (record.tools as PortfolioNavServicesIcon)
      : base.tools ?? base.services,
  };
}

export function resolveNavItemLabel(
  section: PortfolioNavSectionKey,
  labels: PortfolioNavItemLabels
): string {
  return labels[section]?.trim() || DEFAULT_PORTFOLIO_NAV_ITEM_LABELS[section];
}
