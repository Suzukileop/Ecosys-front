import { msg } from '@/lib/i18n/config';
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

export type PortfolioNavItemIcons = Record<PortfolioNavSectionKey, PortfolioNavIconVariant>;

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
  { key: 'info', title: msg('Info'), description: msg('Jumps to profile details below Hero.') },
  { key: 'work', title: msg('Work / Portfolio'), description: msg('Jumps to featured projects.') },
  { key: 'stack', title: msg('Stack'), description: msg('Jumps to your tech stack.') },
  { key: 'tools', title: msg('Tools'), description: msg('Jumps to workflow tools.') },
  { key: 'services', title: msg('Services'), description: msg('Jumps to services and pricing.') },
  { key: 'about', title: msg('About'), description: msg('Jumps to bio, stats, and profile details.') },
  { key: 'aboutUs', title: msg('About us'), description: msg('Jumps to the company story, tasks, and founder.') },
  { key: 'experience', title: msg('Experience'), description: msg('Jumps to career timeline and roles.') },
  { key: 'team', title: msg('Team'), description: msg('Jumps to members and their roles.') },
  { key: 'gallery', title: msg('Gallery'), description: msg('Jumps to the media gallery.') },
  { key: 'faq', title: 'FAQ', description: msg('Jumps to questions and answers.') },
  { key: 'contact', title: msg('Contact'), description: msg('Jumps to email, phone, and links.') },
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
    { value: 'Info', label: msg('Info') },
    { value: 'Details', label: msg('Details') },
    { value: 'Profile', label: msg('Profile') },
  ],
  work: [
    { value: 'Work', label: msg('Work') },
    { value: 'Portfolio', label: msg('Portfolio') },
    { value: 'Projects', label: msg('Projects') },
    { value: 'Creations', label: msg('Creations') },
    { value: 'Gallery', label: msg('Gallery') },
  ],
  services: [
    { value: 'Services', label: msg('Services') },
    { value: 'Skills', label: msg('Skills') },
    { value: 'Expertise', label: msg('Expertise') },
    { value: 'Offers', label: msg('Offers') },
    { value: 'What I do', label: msg('What I do') },
  ],
  about: [
    { value: 'About', label: msg('About') },
    { value: 'Profile', label: msg('Profile') },
    { value: 'Story', label: msg('Story') },
    { value: 'Background', label: msg('Background') },
    { value: 'Who I am', label: msg('Who I am') },
  ],
  aboutUs: [
    { value: 'About us', label: msg('About us') },
    { value: 'Our story', label: msg('Our story') },
    { value: 'The studio', label: msg('The studio') },
    { value: 'Company', label: msg('Company') },
  ],
  experience: [
    { value: 'Experience', label: msg('Experience') },
    { value: 'Career', label: msg('Career') },
    { value: 'History', label: msg('History') },
    { value: 'Journey', label: msg('Journey') },
    { value: 'Roles', label: msg('Roles') },
  ],
  team: [
    { value: 'Team', label: msg('Team') },
    { value: 'Studio', label: msg('Studio') },
  ],
  gallery: [
    { value: 'Gallery', label: msg('Gallery') },
    { value: 'Visual journal', label: msg('Visual journal') },
    { value: 'Photos', label: msg('Photos') },
  ],
  faq: [
    { value: 'FAQ', label: 'FAQ' },
    { value: 'Questions', label: msg('Questions') },
    { value: 'Q&A', label: msg('Q&A') },
    { value: 'Answers', label: msg('Answers') },
    { value: 'Help', label: msg('Help') },
  ],
  contact: [
    { value: 'Contact', label: msg('Contact') },
    { value: 'Hire me', label: msg('Hire me') },
    { value: 'Get in touch', label: msg('Get in touch') },
    { value: 'Reach out', label: msg('Reach out') },
    { value: 'Message', label: msg('Message') },
  ],
  tools: [
    { value: 'Tools', label: msg('Tools') },
    { value: 'Workflow & Tools', label: msg('Workflow & Tools') },
    { value: 'Tech', label: msg('Tech') },
  ],
  stack: [
    { value: 'Stack', label: msg('Stack') },
    { value: 'Tech stack', label: msg('Tech stack') },
    { value: 'Technologies', label: msg('Technologies') },
    { value: 'Skills', label: msg('Skills') },
  ],
};

export const PORTFOLIO_NAV_ICON_OPTIONS: Record<
  PortfolioNavSectionKey,
  { value: PortfolioNavIconVariant; label: string }[]
> = {
  info: [
    { value: 'id-card', label: msg('ID card') },
    { value: 'user', label: msg('Profile') },
    { value: 'heart', label: msg('Heart') },
    { value: 'list', label: msg('List') },
    { value: 'message', label: msg('Message') },
    { value: 'help-circle', label: msg('Help') },
  ],
  work: [
    { value: 'grid', label: msg('Grid') },
    { value: 'briefcase', label: msg('Portfolio') },
    { value: 'image', label: msg('Image') },
    { value: 'star', label: msg('Star') },
    { value: 'sparkles', label: msg('Sparkle') },
    { value: 'list', label: msg('List') },
  ],
  services: [
    { value: 'star', label: msg('Star') },
    { value: 'sparkles', label: msg('Sparkle') },
    { value: 'wrench', label: msg('Wrench') },
    { value: 'grid', label: msg('Grid') },
    { value: 'heart', label: msg('Heart') },
    { value: 'briefcase', label: msg('Portfolio') },
  ],
  about: [
    { value: 'user', label: msg('Profile') },
    { value: 'id-card', label: msg('ID card') },
    { value: 'heart', label: msg('Heart') },
    { value: 'message', label: msg('Message') },
    { value: 'star', label: msg('Star') },
    { value: 'list', label: msg('List') },
  ],
  aboutUs: [
    { value: 'id-card', label: msg('ID card') },
    { value: 'user', label: msg('Profile') },
    { value: 'heart', label: msg('Heart') },
    { value: 'briefcase', label: msg('Portfolio') },
    { value: 'star', label: msg('Star') },
    { value: 'grid', label: msg('Grid') },
  ],
  experience: [
    { value: 'briefcase', label: msg('Portfolio') },
    { value: 'list', label: msg('List') },
    { value: 'id-card', label: msg('ID card') },
    { value: 'grid', label: msg('Grid') },
    { value: 'star', label: msg('Star') },
    { value: 'wrench', label: msg('Wrench') },
  ],
  team: [
    { value: 'user', label: msg('Profile') },
    { value: 'id-card', label: msg('ID card') },
    { value: 'heart', label: msg('Heart') },
    { value: 'star', label: msg('Star') },
    { value: 'message', label: msg('Message') },
    { value: 'grid', label: msg('Grid') },
  ],
  gallery: [
    { value: 'image', label: msg('Image') },
    { value: 'grid', label: msg('Grid') },
    { value: 'briefcase', label: msg('Portfolio') },
    { value: 'star', label: msg('Star') },
    { value: 'sparkles', label: msg('Sparkle') },
    { value: 'heart', label: msg('Heart') },
  ],
  faq: [
    { value: 'help-circle', label: msg('Help') },
    { value: 'message', label: msg('Chat') },
    { value: 'list', label: msg('List') },
    { value: 'mail', label: msg('Mail') },
    { value: 'phone', label: msg('Phone') },
    { value: 'send', label: msg('Send') },
  ],
  contact: [
    { value: 'mail', label: msg('Mail') },
    { value: 'send', label: msg('Send') },
    { value: 'phone', label: msg('Phone') },
    { value: 'message', label: msg('Message') },
    { value: 'help-circle', label: msg('Help') },
    { value: 'user', label: msg('Profile') },
  ],
  stack: [
    { value: 'sparkles', label: msg('Sparkle') },
    { value: 'star', label: msg('Star') },
    { value: 'wrench', label: msg('Wrench') },
    { value: 'grid', label: msg('Grid') },
    { value: 'briefcase', label: msg('Portfolio') },
    { value: 'list', label: msg('List') },
  ],
  tools: [
    { value: 'wrench', label: msg('Wrench') },
    { value: 'sparkles', label: msg('Sparkle') },
    { value: 'star', label: msg('Star') },
    { value: 'grid', label: msg('Grid') },
    { value: 'briefcase', label: msg('Portfolio') },
    { value: 'list', label: msg('List') },
  ],
};

const NAV_ICON_OPTION_VALUES: Record<PortfolioNavSectionKey, Set<PortfolioNavIconVariant>> =
  Object.fromEntries(
    (Object.keys(PORTFOLIO_NAV_ICON_OPTIONS) as PortfolioNavSectionKey[]).map((key) => [
      key,
      new Set(PORTFOLIO_NAV_ICON_OPTIONS[key].map((option) => option.value)),
    ])
  ) as Record<PortfolioNavSectionKey, Set<PortfolioNavIconVariant>>;

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
  const next = { ...base };

  for (const key of Object.keys(base) as PortfolioNavSectionKey[]) {
    const value = record[key];
    if (typeof value === 'string' && NAV_ICON_OPTION_VALUES[key].has(value as PortfolioNavIconVariant)) {
      next[key] = value as PortfolioNavIconVariant;
    }
  }

  return next;
}

export function resolveNavItemLabel(
  section: PortfolioNavSectionKey,
  labels: PortfolioNavItemLabels
): string {
  return labels[section]?.trim() || DEFAULT_PORTFOLIO_NAV_ITEM_LABELS[section];
}
