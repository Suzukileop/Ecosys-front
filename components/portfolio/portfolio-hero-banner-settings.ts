export type PortfolioHeroEditorialOverlapWidth = 'medium' | 'large' | 'full';
export type PortfolioHeroEditorialOverlapAlign = 'left' | 'center' | 'right';
export type PortfolioHeroSelectedWorksIdentityLayout = 'split' | 'centered';
export type PortfolioHeroIdentityIndexPortraitRadius = 'none' | 'medium' | 'full';
export type PortfolioHeroBowlIntroMotif = 'bowl' | 'hug' | 'orbs-top' | 'orbs-bottom';
export type PortfolioHeroPortraitIdentityBottomGap = 'tight' | 'medium' | 'large' | 'xlarge';

export const PORTFOLIO_HERO_PORTRAIT_IDENTITY_BOTTOM_GAP_OPTIONS: {
  value: PortfolioHeroPortraitIdentityBottomGap;
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Serré', description: 'Peu d’espace au-dessus du cadre.' },
  { value: 'medium', label: 'Moyenne', description: 'Espacement intermédiaire.' },
  { value: 'large', label: 'Large', description: 'Espace généreux.' },
  { value: 'xlarge', label: 'Très grand', description: 'Très grand espace au-dessus du cadre.' },
];

export const PORTFOLIO_HERO_IDENTITY_INDEX_PORTRAIT_RADIUS_OPTIONS: {
  value: PortfolioHeroIdentityIndexPortraitRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Coins droits, sans arrondi.' },
  { value: 'medium', label: 'Moyenne', description: 'Coins légèrement arrondis.' },
  { value: 'full', label: 'Plein', description: 'Cercle / pill complet.' },
];

export const PORTFOLIO_HERO_BOWL_INTRO_MOTIF_OPTIONS: {
  value: PortfolioHeroBowlIntroMotif;
  label: string;
  description: string;
}[] = [
  {
    value: 'bowl',
    label: 'Bol',
    description: 'Demi-cercle large sous le portrait.',
  },
  {
    value: 'hug',
    label: 'Bordure',
    description: 'Cadre serré collé à l’image, bas arrondi sous le nom.',
  },
  {
    value: 'orbs-top',
    label: 'Ronds haut',
    description: 'Deux cercles décoratifs en haut du portrait.',
  },
  {
    value: 'orbs-bottom',
    label: 'Double cadre',
    description: 'Second cadre d’image décalé à gauche et en bas.',
  },
];

export function isPortfolioHeroBowlIntroMotif(
  value: unknown
): value is PortfolioHeroBowlIntroMotif {
  return (
    value === 'bowl' ||
    value === 'hug' ||
    value === 'orbs-top' ||
    value === 'orbs-bottom'
  );
}

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
  | 'selected-works'
  | 'identity-index'
  | 'studio-split'
  | 'work-duo'
  | 'bowl-intro';

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
  {
    value: 'identity-index',
    label: 'Identity index',
    description:
      'Nom centré ; rail Specialty / Availability / Years au milieu ; bio en bas.',
  },
  {
    value: 'studio-split',
    label: 'Studio split',
    description:
      'Eyebrow + Hi I’m nom / spécialité à gauche ; bio, CTAs et disponibilité à droite ; cadre média arrondi en bas.',
  },
  {
    value: 'work-duo',
    label: 'Work duo',
    description:
      'Disponibilité + Hi I’m nom — spécialité + bio + CTAs + years à gauche ; See all + 2 Selected works à droite.',
  },
  {
    value: 'bowl-intro',
    label: 'Bowl intro',
    description:
      'Badge dispo + portrait + nom à gauche ; spécialité rouge + bio + View my work / Contact me à droite.',
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
    value === 'selected-works' ||
    value === 'identity-index' ||
    value === 'studio-split' ||
    value === 'work-duo' ||
    value === 'bowl-intro'
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
  heroIdentityIndexShowPortrait?: boolean;
  heroIdentityIndexSwapBioPortrait?: boolean;
  heroIdentityIndexPortraitRadius?: PortfolioHeroIdentityIndexPortraitRadius;
  heroIdentityIndexShowBottomMedia?: boolean;
  heroIdentityIndexBottomMediaUrl?: string;
  heroPortraitIdentityBottomText?: string;
  heroPortraitIdentityBottomWidth?: 'medium' | 'large' | 'full';
  heroPortraitIdentityBottomAlign?: 'left' | 'center' | 'right';
  heroPortraitIdentityBottomFontSizePx?: number;
  heroPortraitIdentityBottomLabel?: string;
  heroPortraitIdentityBottomShowBorder?: boolean;
  heroPortraitIdentityBottomBgColor?: string;
  heroPortraitIdentityBottomGap?: PortfolioHeroPortraitIdentityBottomGap;
  heroStudioSplitEyebrow?: string;
  heroStudioSplitMediaUrl?: string;
  heroStudioSplitMediaCaption?: string;
  heroStudioSplitMediaWidth?: 'medium' | 'large' | 'full';
  heroWorkDuoSelectedWorkIds?: string[];
  heroBowlIntroMotif?: PortfolioHeroBowlIntroMotif;
  /** Apply grayscale (noir & blanc) to hero banner images / media. */
  heroImageGrayscale?: boolean;
} {
  switch (design) {
    case 'swiss-editorial':
      return {
        heroBannerDesign: design,
        heroSignatureWord: '',
        heroCurrentlyLabel: 'Currently',
        heroSpecializedInLabel: 'Specialized in',
        showAvailabilityBadge: false,
        heroImageGrayscale: true,
      };
    case 'portrait-identity':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: false,
        showContactCta: true,
        heroImageGrayscale: true,
        heroPortraitIdentityBottomText: '',
        heroPortraitIdentityBottomWidth: 'large',
        heroPortraitIdentityBottomAlign: 'left',
        heroPortraitIdentityBottomFontSizePx: 18,
        heroPortraitIdentityBottomLabel: '',
        heroPortraitIdentityBottomShowBorder: false,
        heroPortraitIdentityBottomBgColor: '',
        heroPortraitIdentityBottomGap: 'medium',
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
        heroImageGrayscale: true,
      };
    case 'statement-cta':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: true,
        showTools: true,
        showContactCta: true,
        heroEditorialRailSelectedTools: [],
        heroStatementCtaCenterPortrait: true,
        heroStatementCtaPortraitRing: false,
        heroStatementCtaPortraitScale: 125,
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
    case 'identity-index':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: false,
        showTools: false,
        showContactCta: false,
        heroIdentityIndexShowPortrait: false,
        heroIdentityIndexSwapBioPortrait: false,
        heroIdentityIndexPortraitRadius: 'none',
        heroIdentityIndexShowBottomMedia: false,
        heroIdentityIndexBottomMediaUrl: '',
      };
    case 'studio-split':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: true,
        showTools: false,
        showContactCta: true,
        heroStudioSplitEyebrow: 'Portfolio',
        heroStudioSplitMediaUrl: '',
        heroStudioSplitMediaCaption: 'Selected work',
        heroStudioSplitMediaWidth: 'full',
      };
    case 'work-duo':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: true,
        showTools: false,
        showContactCta: true,
        heroWorkDuoSelectedWorkIds: [],
      };
    case 'bowl-intro':
      return {
        heroBannerDesign: design,
        showAvailabilityBadge: true,
        showTools: false,
        showContactCta: true,
        heroBowlIntroMotif: 'bowl',
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

/** Tailwind class for hero media when noir & blanc is enabled. */
export function heroImageGrayscaleClass(enabled?: boolean): string {
  return enabled === true ? 'grayscale' : '';
}

/** Merge grayscale into an existing media style (portrait fit/scale, etc.). */
export function withHeroImageGrayscale(
  style: Record<string, unknown> | undefined,
  enabled?: boolean
): Record<string, unknown> | undefined {
  if (enabled !== true) return style;
  const prev = typeof style?.filter === 'string' ? style.filter.trim() : '';
  const filter = prev.includes('grayscale')
    ? prev
    : [prev, 'grayscale(1)'].filter(Boolean).join(' ');
  return { ...(style ?? {}), filter };
}

/** Profile years of experience — short value for identity-index rail. */
export function resolveHeroYearsOfExperienceValue(
  years?: number | null,
  stats?: { value: string; label: string }[] | null
): string {
  if (typeof years === 'number' && Number.isFinite(years) && years > 0) {
    const n = Math.min(99, Math.max(1, Math.round(years)));
    return n === 1 ? '1 year' : `${n} years`;
  }
  const fromStats = stats?.find((stat) => /year/i.test(stat.label))?.value?.trim();
  if (fromStats) return fromStats;
  return '—';
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
