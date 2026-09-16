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
    { value: 'Studio', label: 'Studio' },
  ],
  gallery: [
    { value: 'Gallery', label: 'Gallery' },
    { value: 'Visual journal', label: 'Visual journal' },
    { value: 'Photos', label: 'Photos' },
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
    { value: 'user', label: 'Profile' },
    { value: 'heart', label: 'Heart' },
    { value: 'list', label: 'List' },
    { value: 'message', label: 'Message' },
    { value: 'help-circle', label: 'Help' },
  ],
  work: [
    { value: 'grid', label: 'Grid' },
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'image', label: 'Image' },
    { value: 'star', label: 'Star' },
    { value: 'sparkles', label: 'Sparkle' },
    { value: 'list', label: 'List' },
  ],
  services: [
    { value: 'star', label: 'Star' },
    { value: 'sparkles', label: 'Sparkle' },
    { value: 'wrench', label: 'Wrench' },
    { value: 'grid', label: 'Grid' },
    { value: 'heart', label: 'Heart' },
    { value: 'briefcase', label: 'Portfolio' },
  ],
  about: [
    { value: 'user', label: 'Profile' },
    { value: 'id-card', label: 'ID card' },
    { value: 'heart', label: 'Heart' },
    { value: 'message', label: 'Message' },
    { value: 'star', label: 'Star' },
    { value: 'list', label: 'List' },
  ],
  aboutUs: [
    { value: 'id-card', label: 'ID card' },
    { value: 'user', label: 'Profile' },
    { value: 'heart', label: 'Heart' },
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'star', label: 'Star' },
    { value: 'grid', label: 'Grid' },
  ],
  experience: [
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'list', label: 'List' },
    { value: 'id-card', label: 'ID card' },
    { value: 'grid', label: 'Grid' },
    { value: 'star', label: 'Star' },
    { value: 'wrench', label: 'Wrench' },
  ],
  team: [
    { value: 'user', label: 'Profile' },
    { value: 'id-card', label: 'ID card' },
    { value: 'heart', label: 'Heart' },
    { value: 'star', label: 'Star' },
    { value: 'message', label: 'Message' },
    { value: 'grid', label: 'Grid' },
  ],
  gallery: [
    { value: 'image', label: 'Image' },
    { value: 'grid', label: 'Grid' },
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'star', label: 'Star' },
    { value: 'sparkles', label: 'Sparkle' },
    { value: 'heart', label: 'Heart' },
  ],
  faq: [
    { value: 'help-circle', label: 'Help' },
    { value: 'message', label: 'Chat' },
    { value: 'list', label: 'List' },
    { value: 'mail', label: 'Mail' },
    { value: 'phone', label: 'Phone' },
    { value: 'send', label: 'Send' },
  ],
  contact: [
    { value: 'mail', label: 'Mail' },
    { value: 'send', label: 'Send' },
    { value: 'phone', label: 'Phone' },
    { value: 'message', label: 'Message' },
    { value: 'help-circle', label: 'Help' },
    { value: 'user', label: 'Profile' },
  ],
  stack: [
    { value: 'sparkles', label: 'Sparkle' },
    { value: 'star', label: 'Star' },
    { value: 'wrench', label: 'Wrench' },
    { value: 'grid', label: 'Grid' },
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'list', label: 'List' },
  ],
  tools: [
    { value: 'wrench', label: 'Wrench' },
    { value: 'sparkles', label: 'Sparkle' },
    { value: 'star', label: 'Star' },
    { value: 'grid', label: 'Grid' },
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'list', label: 'List' },
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
