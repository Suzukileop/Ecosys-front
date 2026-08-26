export type PortfolioHeroEditorialOverlapWidth = 'medium' | 'large' | 'full';
export type PortfolioHeroEditorialOverlapAlign = 'left' | 'center' | 'right';
export type PortfolioHeroSelectedWorksIdentityLayout = 'split' | 'centered';

export const PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS: {
  value: PortfolioHeroEditorialOverlapWidth;
  label: string;
  description: string;
}[] = [
  { value: 'medium', label: 'Moyen', description: 'Largeur intermédiaire.' },
  { value: 'large', label: 'Large', description: 'Cadre généreux.' },
  { value: 'full', label: 'Plein', description: 'Pleine largeur du hero.' },
];

export const PORTFOLIO_HERO_EDITORIAL_OVERLAP_ALIGN_OPTIONS: {
  value: PortfolioHeroEditorialOverlapAlign;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Collé à gauche.' },
  { value: 'center', label: 'Centre', description: 'Centré horizontalement.' },
  { value: 'right', label: 'Droite', description: 'Collé à droite.' },
];

export const PORTFOLIO_HERO_SELECTED_WORKS_IDENTITY_LAYOUT_OPTIONS: {
  value: PortfolioHeroSelectedWorksIdentityLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'split',
    label: 'Split',
    description: 'Nom / spécialité à gauche, bio à droite.',
  },
  {
    value: 'centered',
    label: 'Centré',
    description: 'Nom / spécialité centrés, trait fin, sans bio.',
  },
];

/**
 * Hero Banner designs — full-section layouts (Classic, Swiss paper, Portrait identity, …).
 * Settings live under Hero → Banner.
 */

export type PortfolioHeroBannerDesign =
  | 'classic'
  | 'swiss-editorial'
  | 'portrait-identity'
  | 'editorial-rail'
  | 'statement-cta'
  | 'portrait-balance'
  | 'left-portrait'
  | 'circle-portrait'
  | 'experience-split'
  | 'editorial-overlap'
  | 'selected-works';

export const PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS: {
  value: PortfolioHeroBannerDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Disposition Hero actuelle — copy, portrait, outils et CTA.',
  },
  {
    value: 'swiss-editorial',
    label: 'Swiss editorial',
    description:
      'Papier éditorial : statement + portrait, rail Currently / Specialized in, signature géante.',
  },
  {
    value: 'portrait-identity',
    label: 'Portrait identity',
    description:
      'Bio + disponibilité en haut ; portrait à gauche, nom (2 mots) + spécialité + Contact à droite.',
  },
  {
    value: 'editorial-rail',
    label: 'Editorial rail',
    description:
      'Disponibilité + headline (nom/spécialité) + bio à gauche, portrait à droite, rail de 4 outils en bas.',
  },
  {
    value: 'statement-cta',
    label: 'Statement CTA',
    description:
      'Salutation + nom/spécialité à gauche, disponibilité à droite, CTAs + bio, trait, tools en bandeau.',
  },
  {
    value: 'portrait-balance',
    label: 'Portrait balance',
    description:
      'Spécialité (principal) au-dessus du portrait ; titre centré sur l’image ; bio en bas à gauche.',
  },
  {
    value: 'left-portrait',
    label: 'Left portrait',
    description:
      'Portrait à gauche ; disponibilité + Hello I’m nom + spécialité en haut ; bio + CTAs centrés en bas.',
  },
  {
    value: 'circle-portrait',
    label: 'Circle portrait',
    description:
      'Portrait circulaire à gauche, centré verticalement ; infos à droite, centrées verticalement.',
  },
  {
    value: 'experience-split',
    label: 'Experience split',
    description:
      'Deux colonnes : titre + CTAs à gauche ; portrait + years/bio à droite (trait Principal).',
  },
  {
    value: 'editorial-overlap',
    label: 'Editorial overlap',
    description:
      'Collage éditorial : grande photo paysage + panneau texte qui chevauche le bas-gauche (coin scoopé).',
  },
  {
    value: 'selected-works',
    label: 'Selected works',
    description:
      'Nom / spécialité + bio à gauche ; miniatures Selected work + See all en bas.',
  },
];

export function isPortfolioHeroBannerDesign(value: unknown): value is PortfolioHeroBannerDesign {
  return (
    value === 'classic' ||
    value === 'swiss-editorial' ||
    value === 'portrait-identity' ||
    value === 'editorial-rail' ||
    value === 'statement-cta' ||
    value === 'portrait-balance' ||
    value === 'left-portrait' ||
    value === 'circle-portrait' ||
    value === 'experience-split' ||
    value === 'editorial-overlap' ||
    value === 'selected-works'
  );
}

/** Defaults applied when picking a banner design. */
export function heroBannerDesignSettingsPatch(design: PortfolioHeroBannerDesign): {
  heroBannerDesign: PortfolioHeroBannerDesign;
  heroSignatureWord?: string;
  heroCurrentlyLabel?: string;
  heroSpecializedInLabel?: string;
  showAvailabilityBadge?: boolean;
  showContactCta?: boolean;
  showTools?: boolean;
  heroEditorialRailBioUnderPortrait?: boolean;
  heroEditorialRailIdentityUnderPortrait?: boolean;
  heroEditorialRailSelectedTools?: string[];
  heroEditorialRailShowCta?: boolean;
  heroStatementCtaCenterPortrait?: boolean;
  heroStatementCtaPortraitRing?: boolean;
  heroStatementCtaPortraitScale?: number;
  heroStatementCtaCenterCover?: boolean;
  heroStatementCtaCoverImageUrl?: string;
  heroLeftPortraitSpecialtyMark?: boolean;
  heroCirclePortraitSpecialtyMark?: boolean;
  heroCirclePortraitTitleBottom?: boolean;
  heroExperienceSplitBioRight?: boolean;
  heroExperienceSplitGlobalFrame?: boolean;
  heroEditorialOverlapImageUrl?: string;
  heroEditorialOverlapHeadline?: string;
  heroEditorialOverlapWidth?: 'medium' | 'large' | 'full';
  heroEditorialOverlapAlign?: 'left' | 'center' | 'right';
  heroSelectedWorksDimIntensity?: number;
  heroSelectedWorksIdentityLayout?: PortfolioHeroSelectedWorksIdentityLayout;
} {
  switch (design) {
    case 'swiss-editorial':
      return {
        heroBannerDesign: design,
        heroSignatureWord: '',
        heroCurrentlyLabel: 'Currently',
        heroSpecializedInLabel: 'Specialized in',
        showAvailabilityBadge: false,
      };
    case 'portrait-identity':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: false,
        showContactCta: true,
      };
    case 'editorial-rail':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: true,
        showTools: true,
        showContactCta: false,
        heroEditorialRailBioUnderPortrait: false,
        heroEditorialRailIdentityUnderPortrait: false,
        heroEditorialRailSelectedTools: [],
        heroEditorialRailShowCta: false,
      };
    case 'statement-cta':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: true,
        showTools: true,
        showContactCta: true,
        heroEditorialRailSelectedTools: [],
        heroStatementCtaCenterPortrait: false,
        heroStatementCtaPortraitRing: false,
        heroStatementCtaPortraitScale: 100,
        heroStatementCtaCenterCover: false,
        heroStatementCtaCoverImageUrl: '',
      };
    case 'portrait-balance':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: true,
        showTools: true,
        showContactCta: false,
        heroEditorialRailSelectedTools: [],
      };
    case 'left-portrait':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: true,
        showTools: false,
        showContactCta: true,
        heroLeftPortraitSpecialtyMark: false,
      };
    case 'circle-portrait':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: true,
        showTools: false,
        showContactCta: true,
        heroCirclePortraitSpecialtyMark: false,
        heroCirclePortraitTitleBottom: true,
      };
    case 'experience-split':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: true,
        showTools: false,
        showContactCta: true,
        heroExperienceSplitBioRight: true,
        heroExperienceSplitGlobalFrame: false,
      };
    case 'editorial-overlap':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: false,
        showTools: false,
        showContactCta: false,
        heroEditorialOverlapImageUrl: '',
        heroEditorialOverlapHeadline: '',
        heroEditorialOverlapWidth: 'full',
        heroEditorialOverlapAlign: 'left',
      };
    case 'selected-works':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: false,
        showTools: false,
        showContactCta: false,
        heroSelectedWorksDimIntensity: 40,
        heroSelectedWorksIdentityLayout: 'split',
      };
    default:
      return { heroBannerDesign: design };
  }
}

export function resolveHeroSignatureWord(
  settings: { heroSignatureWord?: string },
  fallbackName: string
): string {
  const custom = settings.heroSignatureWord?.trim();
  if (custom) return custom.toUpperCase();
  const lead = fallbackName.trim().split(/\s+/)[0] || 'LOREM';
  return lead.toUpperCase();
}

/**
 * Display name for Portrait identity: max 2 words (e.g. "Leopard Julio Cesar" → "LEOPARD JULIO").
 */
export function resolveHeroTwoWordDisplayName(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return 'LOREM IPSUM';
  return parts.join(' ').toUpperCase();
}

export function resolveHeroCurrentlyLabel(settings: {
  heroCurrentlyLabel?: string;
}): string {
  return settings.heroCurrentlyLabel?.trim() || 'Currently';
}

export function resolveHeroSpecializedInLabel(settings: {
  heroSpecializedInLabel?: string;
}): string {
  return settings.heroSpecializedInLabel?.trim() || 'Specialized in';
}

export function resolveHeroAvailabilityValue(
  isAvailable: boolean | undefined,
  availableLabel: string,
  unavailableLabel: string
): string {
  if (isAvailable === false) return unavailableLabel.trim() || 'Currently unavailable';
  return availableLabel.trim() || 'Available for new projects';
}

export function resolveHeroSpecialtyValue(specialite?: string | null): string {
  const value = specialite?.trim();
  return value || 'UI/UX, Websites, Branding';
}

/** Up to `max` tool labels — explicit selection only when provided. */
export function resolveHeroBannerTools(
  allTools?: string[] | null,
  selectedTools?: string[] | null,
  max = 4
): string[] {
  const limit = Math.max(1, max);
  const normalized = Array.from(
    new Set((allTools ?? []).map((tool) => tool.trim()).filter(Boolean))
  );
  if (normalized.length === 0) return [];

  const selected = (selectedTools ?? [])
    .map((tool) => tool.trim())
    .filter(Boolean)
    .map((tool) => normalized.find((item) => item.toLowerCase() === tool.toLowerCase()))
    .filter((tool): tool is string => Boolean(tool));

  // Explicit picks only — do not auto-fill with the rest of the profile list.
  if (selected.length > 0) {
    const out: string[] = [];
    for (const tool of selected) {
      if (out.length >= limit) break;
      if (!out.some((item) => item.toLowerCase() === tool.toLowerCase())) out.push(tool);
    }
    return out;
  }

  return normalized.slice(0, limit);
}

/** Up to four tool labels for Editorial rail — explicit selection only when provided. */
export function resolveHeroEditorialRailTools(
  allTools?: string[] | null,
  selectedTools?: string[] | null
): string[] {
  return resolveHeroBannerTools(allTools, selectedTools, 4);
}

/** Up to five tool labels for Statement CTA — matches the mock tool row. */
export function resolveHeroStatementCtaTools(
  allTools?: string[] | null,
  selectedTools?: string[] | null
): string[] {
  return resolveHeroBannerTools(allTools, selectedTools, 5);
}

/** Up to twelve tool tags for Portrait balance — wrap chip row above the bio. */
export function resolveHeroPortraitBalanceTools(
  allTools?: string[] | null,
  selectedTools?: string[] | null
): string[] {
  return resolveHeroBannerTools(allTools, selectedTools, 12);
}
