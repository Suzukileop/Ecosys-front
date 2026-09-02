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
    { value: 'Équipe', label: 'Équipe' },
    { value: 'Studio', label: 'Studio' },
  ],
  gallery: [
    { value: 'Gallery', label: 'Gallery' },
    { value: 'Galerie', label: 'Galerie' },
    { value: 'Journal', label: 'Journal visuel' },
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
    { value: 'id-card', label: 'Carte ID' },
    { value: 'user', label: 'Profil' },
    { value: 'heart', label: 'Cœur' },
    { value: 'list', label: 'Liste' },
    { value: 'message', label: 'Message' },
    { value: 'help-circle', label: 'Aide' },
  ],
  work: [
    { value: 'grid', label: 'Grille' },
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'image', label: 'Image' },
    { value: 'star', label: 'Étoile' },
    { value: 'sparkles', label: 'Éclat' },
    { value: 'list', label: 'Liste' },
  ],
  services: [
    { value: 'star', label: 'Étoile' },
    { value: 'sparkles', label: 'Éclat' },
    { value: 'wrench', label: 'Clé' },
    { value: 'grid', label: 'Grille' },
    { value: 'heart', label: 'Cœur' },
    { value: 'briefcase', label: 'Portfolio' },
  ],
  about: [
    { value: 'user', label: 'Profil' },
    { value: 'id-card', label: 'Carte ID' },
    { value: 'heart', label: 'Cœur' },
    { value: 'message', label: 'Message' },
    { value: 'star', label: 'Étoile' },
    { value: 'list', label: 'Liste' },
  ],
  aboutUs: [
    { value: 'id-card', label: 'Carte ID' },
    { value: 'user', label: 'Profil' },
    { value: 'heart', label: 'Cœur' },
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'star', label: 'Étoile' },
    { value: 'grid', label: 'Grille' },
  ],
  experience: [
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'list', label: 'Liste' },
    { value: 'id-card', label: 'Carte ID' },
    { value: 'grid', label: 'Grille' },
    { value: 'star', label: 'Étoile' },
    { value: 'wrench', label: 'Clé' },
  ],
  team: [
    { value: 'user', label: 'Profil' },
    { value: 'id-card', label: 'Carte ID' },
    { value: 'heart', label: 'Cœur' },
    { value: 'star', label: 'Étoile' },
    { value: 'message', label: 'Message' },
    { value: 'grid', label: 'Grille' },
  ],
  gallery: [
    { value: 'image', label: 'Image' },
    { value: 'grid', label: 'Grille' },
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'star', label: 'Étoile' },
    { value: 'sparkles', label: 'Éclat' },
    { value: 'heart', label: 'Cœur' },
  ],
  faq: [
    { value: 'help-circle', label: 'Aide' },
    { value: 'message', label: 'Chat' },
    { value: 'list', label: 'Liste' },
    { value: 'mail', label: 'Mail' },
    { value: 'phone', label: 'Téléphone' },
    { value: 'send', label: 'Envoi' },
  ],
  contact: [
    { value: 'mail', label: 'Mail' },
    { value: 'send', label: 'Envoi' },
    { value: 'phone', label: 'Téléphone' },
    { value: 'message', label: 'Message' },
    { value: 'help-circle', label: 'Aide' },
    { value: 'user', label: 'Profil' },
  ],
  stack: [
    { value: 'sparkles', label: 'Éclat' },
    { value: 'star', label: 'Étoile' },
    { value: 'wrench', label: 'Clé' },
    { value: 'grid', label: 'Grille' },
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'list', label: 'Liste' },
  ],
  tools: [
    { value: 'wrench', label: 'Clé' },
    { value: 'sparkles', label: 'Éclat' },
    { value: 'star', label: 'Étoile' },
    { value: 'grid', label: 'Grille' },
    { value: 'briefcase', label: 'Portfolio' },
    { value: 'list', label: 'Liste' },
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
