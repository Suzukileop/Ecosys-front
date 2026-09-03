import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  resolveHeroPaletteColor,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';

export type PortfolioInfoDesign =
  | 'about-me'
  | 'about-me-trait'
  | 'about-split'
  | 'about-banner'
  | 'about-feature-panel'
  | 'about-platform'
  | 'about-portrait-skills'
  | 'about-manifesto'
  | 'about-terminal'
  | 'about-value-steps';

/** How spoken-language proficiency is shown next to each language name. */
export type PortfolioInfoLanguageLevelDisplayStyle =
  | 'stars'
  | 'text'
  | 'dots'
  | 'progress-bar';

/** Education layout for About me · trait (Awwwards / Webflow / Framer inspired). */
export type PortfolioInfoEducationDisplayStyle =
  | 'timeline'
  | 'editorial'
  | 'panels'
  | 'cascade';

export type PortfolioInfoAboutValueBlocksLayout = 'split' | 'grid-2';

/** About · value / value steps — how the My Values / skills block is laid out. */
export type PortfolioInfoAboutValueValuesLayout =
  | 'editorial'
  | 'numbered-grid'
  | 'indexed-list'
  | 'value-steps';

/** About · manifesto — 2-col grid or staggered zigzag on large screens. */
export type PortfolioInfoAboutManifestoBlocksLayout = 'grid' | 'zigzag';

/** About · manifesto — portrait frame on the hero column (desktop). */
export type PortfolioInfoAboutManifestoPortraitFrame =
  | 'circle'
  | 'square'
  | 'rectangle'
  | 'instagram';

/** About · split — sticky portrait column on left or right (desktop). */
export type PortfolioInfoAboutSplitPortraitSide = 'left' | 'right';

/** About · split — preset tone for Skills / Strengths / Languages headings. */
export type PortfolioInfoAboutSplitSectionLabelsStyle =
  | 'default'
  | 'conversational'
  | 'professional'
  | 'editorial'
  | 'creative';

/** About · value — list marker before each value / strength / etc. */
export type PortfolioInfoAboutValueListMarkerStyle =
  | 'dot'
  | 'dash'
  | 'arrow'
  | 'chevron'
  | 'none';

export type PortfolioInfoAboutValueBioSize = 'sm' | 'md' | 'lg' | 'xl';

/** Shared compact / standard / large scale for manifesto & trait body copy. */
export type PortfolioInfoContentSize = 'sm' | 'md' | 'lg';

export type PortfolioInfoAboutValueBioWidth = 'full' | 'half';

export type PortfolioInfoAboutValueBioAlign = 'left' | 'center' | 'right';

export type PortfolioInfoAboutValueBioColorToken =
  | 'principal'
  | 'texteFort'
  | 'texteMuted'
  | 'texteFaint';

export type PortfolioInfoPresentationSettings = PortfolioSectionBackgroundSettings & {
  design: PortfolioInfoDesign;
  /** Accent for labels / bullets / trait (bound to hero principal when useHeroPalette). */
  accentColor: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  showEducation: boolean;
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showLanguages: boolean;
  showSystemsTools: boolean;
  /** Show country flags next to language names — default on. */
  showLanguageFlags: boolean;
  /** Languages proficiency indicator — default stars. */
  languageLevelDisplayStyle: PortfolioInfoLanguageLevelDisplayStyle;
  /**
   * About me · trait only — how Education is laid out.
   * Default editorial (magazine bands). Ignored on classic about-me cards.
   */
  educationDisplayStyle: PortfolioInfoEducationDisplayStyle;
  /** About · me trait + cascade — scroll-driven stagger shift (opt-in). */
  educationCascadeScrollShift: boolean;
  /** About · me trait — large headline beside portrait (replaces bio). */
  aboutMeTraitHeadlineEnabled: boolean;
  /** Empty = profile bio from Creator Studio. Use line breaks for multi-line headlines. */
  aboutMeTraitHeadlineCustomText: string;
  /** All Info designs — labels, listes, titres de blocs, education, etc. */
  contentSize: PortfolioInfoContentSize;
  /** @deprecated Use contentSize — kept for saved settings migration. */
  aboutManifestoContentSize: PortfolioInfoContentSize;
  /** @deprecated Use contentSize — kept for saved settings migration. */
  aboutMeTraitContentSize: PortfolioInfoContentSize;
  /**
   * @deprecated About · value removed — kept for saved settings migration.
   * Split (titre gauche / liste droite) or grid-2 for secondary blocks.
   */
  aboutValueBlocksLayout: PortfolioInfoAboutValueBlocksLayout;
  /** About · value (+ steps skills) — editorial, grille, liste indexée ou steps natifs. */
  aboutValueValuesLayout: PortfolioInfoAboutValueValuesLayout;
  /** About · value steps — bullet style for editorial values list. */
  aboutValueListMarkerStyle: PortfolioInfoAboutValueListMarkerStyle;
  /** @deprecated About · value removed — kept for saved settings migration. */
  aboutValueBioEnabled: boolean;
  /** @deprecated About · value removed — kept for saved settings migration. */
  aboutValueBioCustomText: string;
  aboutValueBioSize: PortfolioInfoAboutValueBioSize;
  aboutValueBioWidth: PortfolioInfoAboutValueBioWidth;
  aboutValueBioAlign: PortfolioInfoAboutValueBioAlign;
  aboutValueBioColorToken: PortfolioInfoAboutValueBioColorToken;
  /** About · value steps — intro paragraphs above numbered skills list. */
  aboutValueStepsIntroEnabled: boolean;
  aboutValueStepsIntroParagraph1: string;
  aboutValueStepsIntroParagraph2: string;
  /** Internal — one-time migration for about-value → about-value-steps. */
  aboutValueSettingsRevision?: number;
  /** Internal — one-time migration for about-manifesto block visibility defaults. */
  aboutManifestoSettingsRevision?: number;
  /** Internal — one-time migration for about-value-steps block visibility defaults. */
  aboutValueStepsSettingsRevision?: number;
  /** About · manifesto — grayscale filter on profile portrait (desktop). */
  /** @deprecated Use infoPortraitGrayscale — kept for saved settings migration. */
  aboutManifestoAvatarGrayscale: boolean;
  /** Info designs with portrait — apply grayscale filter on profile photo. */
  infoPortraitGrayscale: boolean;
  /** About · manifesto — circle, square, rectangle, or Instagram-style ring. */
  aboutManifestoPortraitFrame: PortfolioInfoAboutManifestoPortraitFrame;
  /** About · split — portrait column side on large screens. */
  aboutSplitPortraitSide: PortfolioInfoAboutSplitPortraitSide;
  /** About · split — preset labels for Skills / Strengths / Languages blocks. */
  aboutSplitSectionLabelsStyle: PortfolioInfoAboutSplitSectionLabelsStyle;
  /** About · banner — XXL centered headline (independent from about-me-trait). */
  aboutBannerHeadlineEnabled: boolean;
  aboutBannerHeadlineCustomText: string;
  /** About · banner — preset labels for Skills / Strengths blocks. */
  aboutBannerSectionLabelsStyle: PortfolioInfoAboutSplitSectionLabelsStyle;
  /** About · feature panel — intro headline line 1 (strong + muted parts). */
  aboutFeatureIntroLine1Primary: string;
  aboutFeatureIntroLine1Secondary: string;
  /** About · feature panel — intro headline line 2 (strong + muted parts). */
  aboutFeatureIntroLine2Primary: string;
  aboutFeatureIntroLine2Secondary: string;
  /** About · platform — left headline beside bio (supports line breaks). */
  aboutPlatformHeadlineCustomText: string;
  /** About · platform — full-width skills section title. */
  aboutPlatformSkillsSectionTitle: string;
  /** About · platform — strengths split section title (left column). */
  aboutPlatformStrengthsSectionTitle: string;
  /** About · platform — stagger bio + strengths list on the right (zigzag). */
  aboutPlatformStaggerLayout: boolean;
  /** About · portrait skills — lead sentence before interests + languages paragraph. */
  aboutPortraitSkillsMetaLead: string;
  /** About · portrait skills — show interests + languages paragraph at the bottom. */
  aboutPortraitSkillsMetaEnabled: boolean;
  /** About · manifesto — grid 2×2 or zigzag alterné (grand écran). */
  aboutManifestoBlocksLayout: PortfolioInfoAboutManifestoBlocksLayout;
  /** About · manifesto — blur non-centered blocks while scrolling. */
  aboutManifestoBlocksScrollFocus: boolean;
  useHeroPalette: boolean;
  activeColorMode?: 'light' | 'dark';
};

export type PortfolioInfoSectionSettings = PortfolioSectionCopy & PortfolioInfoPresentationSettings;

export const DEFAULT_INFO_TITLE = 'About me';
export const DEFAULT_INFO_VALUE_TITLE = 'My Values';
export const DEFAULT_INFO_SUBTITLE = 'Background, education and how I work.';
export const DEFAULT_ABOUT_ME_TRAIT_HEADLINE =
  'Turning Hard\nProblems Into\nSimple Software';

/** About · banner — default XXL centered headline (3 lines). */
export const DEFAULT_ABOUT_BANNER_HEADLINE = 'Built To Ship\nDesigned To\nScale';

/** About · feature panel — default two-tone intro lines (Apollo-style). */
export const DEFAULT_ABOUT_FEATURE_INTRO_LINE_1_PRIMARY = 'THE BREAKTHROUGH';
export const DEFAULT_ABOUT_FEATURE_INTRO_LINE_1_SECONDARY = 'FOUNDATION MODEL';
export const DEFAULT_ABOUT_FEATURE_INTRO_LINE_2_PRIMARY = 'Built for clarity';
export const DEFAULT_ABOUT_FEATURE_INTRO_LINE_2_SECONDARY = 'and real-world impact';

export const DEFAULT_ABOUT_PLATFORM_HEADLINE = 'Built for clarity\nand real-world impact';
export const DEFAULT_ABOUT_PLATFORM_SKILLS_TITLE = 'Skills I have';
export const DEFAULT_ABOUT_PLATFORM_STRENGTHS_TITLE = 'What I bring';

/** About · portrait skills — lead sentence before interests + languages. */
export const DEFAULT_ABOUT_PORTRAIT_SKILLS_META_LEAD =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit — beyond the craft,';

/** About · platform — headline presets (Jasper-style hero). */
export const PORTFOLIO_INFO_ABOUT_PLATFORM_HEADLINE_PRESETS: {
  id: string;
  label: string;
  description: string;
  text: string;
}[] = [
  {
    id: 'clarity-impact',
    label: 'Clarity & Impact',
    description: 'Clarté produit et impact concret.',
    text: 'Built for clarity\nand real-world impact',
  },
  {
    id: 'marketing-success',
    label: 'Marketing Success',
    description: 'Ton Jasper — succès marketing.',
    text: 'Built for\nmarketing success',
  },
  {
    id: 'ship-scale',
    label: 'Ship & Scale',
    description: 'Produit robuste, pensé pour durer.',
    text: 'Built to ship\nproducts that scale',
  },
  {
    id: 'real-people',
    label: 'Real People',
    description: 'Logiciel utile au quotidien.',
    text: 'Software that works\nfor real people',
  },
];

/** About · feature panel — bicolor intro presets (2 lines × primary + secondary). */
export const PORTFOLIO_INFO_ABOUT_FEATURE_INTRO_PRESETS: {
  id: string;
  label: string;
  description: string;
  line1Primary: string;
  line1Secondary: string;
  line2Primary: string;
  line2Secondary: string;
}[] = [
  {
    id: 'breakthrough',
    label: 'Breakthrough',
    description: 'Apollo-style — foundation model, clarity & impact.',
    line1Primary: 'THE BREAKTHROUGH',
    line1Secondary: 'FOUNDATION MODEL',
    line2Primary: 'Built for clarity',
    line2Secondary: 'and real-world impact',
  },
  {
    id: 'ship-scale',
    label: 'Ship & Scale',
    description: 'Produit robuste, pensé pour durer en production.',
    line1Primary: 'BUILT TO',
    line1Secondary: 'SHIP',
    line2Primary: 'Designed to',
    line2Secondary: 'scale and endure',
  },
  {
    id: 'clear-craft',
    label: 'Clear Craft',
    description: 'Clarté technique et exécution soignée.',
    line1Primary: 'ENGINEERED FOR',
    line1Secondary: 'CLARITY',
    line2Primary: 'Turning ideas',
    line2Secondary: 'into shipped products',
  },
  {
    id: 'real-impact',
    label: 'Real Impact',
    description: 'Logiciel utile, centré sur les vrais besoins.',
    line1Primary: 'SOFTWARE FOR',
    line1Secondary: 'REAL PEOPLE',
    line2Primary: 'Built with care',
    line2Secondary: 'and lasting intent',
  },
  {
    id: 'bold-ideas',
    label: 'Bold Ideas',
    description: 'De la vision au produit concret.',
    line1Primary: 'WHERE BOLD IDEAS',
    line1Secondary: 'TAKE FORM',
    line2Primary: 'From concept',
    line2Secondary: 'to production',
  },
  {
    id: 'quiet-power',
    label: 'Quiet Power',
    description: 'Impact discret, qualité durable.',
    line1Primary: 'QUIET BY DESIGN',
    line1Secondary: 'STRONG BY DEFAULT',
    line2Primary: 'Focused work',
    line2Secondary: 'with lasting results',
  },
];

/** About · feature panel — default two-tone headline above education / languages footer. */
export const DEFAULT_ABOUT_FEATURE_META_LINE_1_PRIMARY = 'SHAPED BY';
export const DEFAULT_ABOUT_FEATURE_META_LINE_1_SECONDARY = 'EXPERIENCE';
export const DEFAULT_ABOUT_FEATURE_META_LINE_2_PRIMARY = 'ROOTED IN';
export const DEFAULT_ABOUT_FEATURE_META_LINE_2_SECONDARY = 'THE WORLD';

/** About · banner — XXL headline presets (hero / manifesto tone). */
export const PORTFOLIO_INFO_ABOUT_BANNER_HEADLINE_PRESETS: {
  id: string;
  label: string;
  description: string;
  text: string;
}[] = [
  {
    id: 'ship-scale',
    label: 'Ship & Scale',
    description: 'Produit robuste, pensé pour durer.',
    text: 'Built To Ship\nDesigned To\nScale',
  },
  {
    id: 'flex-convert',
    label: 'Flex & Convert',
    description: 'Impact éditorial type hero portfolio.',
    text: 'Built To Flex\nDesigned To\nConvert',
  },
  {
    id: 'sketch-production',
    label: 'Sketch → Prod',
    description: 'De la première idée à la prod.',
    text: 'From First Sketch\nTo Production\nWithout Noise',
  },
  {
    id: 'clear-clean',
    label: 'Clear & Clean',
    description: 'Clarté, exécution, produits durables.',
    text: 'Clear Thinking\nClean Builds\nLasting Products',
  },
  {
    id: 'real-people',
    label: 'Real People',
    description: 'Technologie utile au quotidien.',
    text: 'Software That\nWorks For\nReal People',
  },
  {
    id: 'ideas-live',
    label: 'Ideas Live',
    description: 'Des idées aux produits concrets.',
    text: 'Where Bold Ideas\nBecome Real\nWorking Products',
  },
];

export const DEFAULT_ABOUT_VALUE_STEPS_INTRO_PARAGRAPH_1 =
  'I thrive on curiosity, originality, and attention to detail, approaching each project with care and collaboration to create experiences that leave a lasting impression in various markets.';

export const DEFAULT_ABOUT_VALUE_STEPS_INTRO_PARAGRAPH_2 =
  'Guided by creativity, integrity, and collaboration, striving to turn bold ideas into meaningful work while ensuring every project reflects innovation and purpose.';

/** About · value steps — editorial section labels (My Values title stays separate). */
export const ABOUT_VALUE_STEPS_SECTION_LABELS = {
  strengths: 'What I bring',
  education: 'Background',
  interests: 'Also into',
  systemsTools: 'Toolbox',
  languages: 'I speak',
} as const;

/** About · me trait — editorial headline presets (3-line intro phrases). */
export const PORTFOLIO_INFO_ABOUT_ME_TRAIT_HEADLINE_PRESETS: {
  id: string;
  label: string;
  description: string;
  text: string;
}[] = [
  {
    id: 'hard-to-simple',
    label: 'Hard → Simple',
    description: 'Complexité → simplicité logicielle.',
    text: 'Turning Hard\nProblems Into\nSimple Software',
  },
  {
    id: 'effortless-products',
    label: 'Effortless',
    description: 'Produits digitaux fluides et naturels.',
    text: 'Building Digital\nProducts That\nFeel Effortless',
  },
  {
    id: 'ideas-to-products',
    label: 'Ideas → Products',
    description: 'De l’idée au produit concret.',
    text: 'From Complex Ideas\nTo Clear\nWorking Products',
  },
  {
    id: 'clarity-purpose',
    label: 'Clarity & Purpose',
    description: 'Code réfléchi, intention claire.',
    text: 'Crafting Software\nWith Clarity\nAnd Purpose',
  },
  {
    id: 'tech-for-people',
    label: 'Tech for People',
    description: 'Technologie accessible et humaine.',
    text: 'Making Technology\nSimple For\nReal People',
  },
  {
    id: 'real-world-impact',
    label: 'Real Impact',
    description: 'Code utile, impact concret.',
    text: 'Where Thoughtful Code\nMeets Real\nWorld Impact',
  },
];

export const DEFAULT_INFO_PRESENTATION: PortfolioInfoPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  design: 'about-me',
  accentColor: '#e2572e',
  titleColor: '#e2572e',
  subtitleColor: '#f5f5f5',
  bodyColor: '#a3a3a3',
  cardBackgroundColor: '#171717',
  cardBorderColor: '#262626',
  showEducation: true,
  showSkills: true,
  showStrengths: true,
  showInterests: true,
  showLanguages: true,
  showSystemsTools: true,
  showLanguageFlags: true,
  languageLevelDisplayStyle: 'stars',
  educationDisplayStyle: 'editorial',
  educationCascadeScrollShift: false,
  aboutMeTraitHeadlineEnabled: true,
  aboutMeTraitHeadlineCustomText: DEFAULT_ABOUT_ME_TRAIT_HEADLINE,
  contentSize: 'md',
  aboutManifestoContentSize: 'md',
  aboutMeTraitContentSize: 'md',
  aboutValueBlocksLayout: 'split',
  aboutValueValuesLayout: 'editorial',
  aboutValueListMarkerStyle: 'dot',
  aboutValueBioEnabled: true,
  aboutValueBioCustomText: '',
  aboutValueBioSize: 'xl',
  aboutValueBioWidth: 'full',
  aboutValueBioAlign: 'left',
  aboutValueBioColorToken: 'texteMuted',
  aboutValueStepsIntroEnabled: true,
  aboutValueStepsIntroParagraph1: DEFAULT_ABOUT_VALUE_STEPS_INTRO_PARAGRAPH_1,
  aboutValueStepsIntroParagraph2: DEFAULT_ABOUT_VALUE_STEPS_INTRO_PARAGRAPH_2,
  aboutManifestoAvatarGrayscale: false,
  infoPortraitGrayscale: false,
  aboutManifestoPortraitFrame: 'circle',
  aboutSplitPortraitSide: 'left',
  aboutSplitSectionLabelsStyle: 'default',
  aboutBannerHeadlineEnabled: true,
  aboutBannerHeadlineCustomText: DEFAULT_ABOUT_BANNER_HEADLINE,
  aboutBannerSectionLabelsStyle: 'conversational',
  aboutFeatureIntroLine1Primary: DEFAULT_ABOUT_FEATURE_INTRO_LINE_1_PRIMARY,
  aboutFeatureIntroLine1Secondary: DEFAULT_ABOUT_FEATURE_INTRO_LINE_1_SECONDARY,
  aboutFeatureIntroLine2Primary: DEFAULT_ABOUT_FEATURE_INTRO_LINE_2_PRIMARY,
  aboutFeatureIntroLine2Secondary: DEFAULT_ABOUT_FEATURE_INTRO_LINE_2_SECONDARY,
  aboutPlatformHeadlineCustomText: DEFAULT_ABOUT_PLATFORM_HEADLINE,
  aboutPlatformSkillsSectionTitle: DEFAULT_ABOUT_PLATFORM_SKILLS_TITLE,
  aboutPlatformStrengthsSectionTitle: DEFAULT_ABOUT_PLATFORM_STRENGTHS_TITLE,
  aboutPlatformStaggerLayout: true,
  aboutPortraitSkillsMetaLead: DEFAULT_ABOUT_PORTRAIT_SKILLS_META_LEAD,
  aboutPortraitSkillsMetaEnabled: true,
  aboutManifestoBlocksLayout: 'grid',
  aboutManifestoBlocksScrollFocus: false,
  useHeroPalette: true,
};

export const PORTFOLIO_INFO_ABOUT_VALUE_VALUES_LAYOUT_OPTIONS: {
  value: PortfolioInfoAboutValueValuesLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'editorial',
    label: 'Éditorial',
    description: 'Titre à gauche, liste à droite — une value par ligne avec puce.',
  },
  {
    value: 'numbered-grid',
    label: 'Grille numérotée',
    description: 'Titre en haut à gauche ; values en grille 2 colonnes — 01, 02… + titre + texte.',
  },
  {
    value: 'indexed-list',
    label: 'Liste indexée',
    description: 'Titre en haut ; lignes 001 · titre · description — séparateurs fins type témoignages.',
  },
];

export const PORTFOLIO_INFO_ABOUT_VALUE_STEPS_VALUES_LAYOUT_OPTIONS: {
  value: PortfolioInfoAboutValueValuesLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'value-steps',
    label: 'Steps',
    description: 'My Values sticky à droite ; skills numérotés (01…) — layout natif du design.',
  },
  ...PORTFOLIO_INFO_ABOUT_VALUE_VALUES_LAYOUT_OPTIONS,
];

export function isPortfolioInfoAboutValueValuesLayout(
  value: unknown
): value is PortfolioInfoAboutValueValuesLayout {
  return (
    value === 'editorial' ||
    value === 'numbered-grid' ||
    value === 'indexed-list' ||
    value === 'value-steps'
  );
}

export function resolveInfoAboutValueValuesLayout(
  presentation: Pick<PortfolioInfoPresentationSettings, 'design' | 'aboutValueValuesLayout'>
): PortfolioInfoAboutValueValuesLayout {
  if (isPortfolioInfoAboutValueValuesLayout(presentation.aboutValueValuesLayout)) {
    return presentation.aboutValueValuesLayout;
  }
  return presentation.design === 'about-value-steps' ? 'value-steps' : 'editorial';
}

export const PORTFOLIO_INFO_ABOUT_VALUE_BLOCKS_LAYOUT_OPTIONS: {
  value: PortfolioInfoAboutValueBlocksLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'split',
    label: 'Split',
    description: 'Titre à gauche, liste à droite — une section par ligne (grand écran).',
  },
  {
    value: 'grid-2',
    label: 'Grille 2 colonnes',
    description: 'My Values, Strengths, etc. côte à côte — titre en haut, contenu en dessous.',
  },
];

export function isPortfolioInfoAboutValueBlocksLayout(
  value: unknown
): value is PortfolioInfoAboutValueBlocksLayout {
  return value === 'split' || value === 'grid-2';
}

export function resolveInfoAboutValueBlocksLayout(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutValueBlocksLayout'>
): PortfolioInfoAboutValueBlocksLayout {
  return isPortfolioInfoAboutValueBlocksLayout(presentation.aboutValueBlocksLayout)
    ? presentation.aboutValueBlocksLayout
    : 'split';
}

export const PORTFOLIO_INFO_ABOUT_MANIFESTO_BLOCKS_LAYOUT_OPTIONS: {
  value: PortfolioInfoAboutManifestoBlocksLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'grid',
    label: 'Grille',
    description: 'Deux blocs par ligne — alignés en grille (Education | Skills, etc.).',
  },
  {
    value: 'zigzag',
    label: 'Zigzag',
    description: 'Un bloc par ligne — alternance gauche puis droite.',
  },
];

export function isPortfolioInfoAboutManifestoBlocksLayout(
  value: unknown
): value is PortfolioInfoAboutManifestoBlocksLayout {
  return value === 'grid' || value === 'zigzag';
}

export function resolveInfoAboutManifestoBlocksLayout(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutManifestoBlocksLayout'>
): PortfolioInfoAboutManifestoBlocksLayout {
  return isPortfolioInfoAboutManifestoBlocksLayout(presentation.aboutManifestoBlocksLayout)
    ? presentation.aboutManifestoBlocksLayout
    : 'grid';
}

export const PORTFOLIO_INFO_ABOUT_MANIFESTO_PORTRAIT_FRAME_OPTIONS: {
  value: PortfolioInfoAboutManifestoPortraitFrame;
  label: string;
  description: string;
}[] = [
  {
    value: 'circle',
    label: 'Rond',
    description: 'Cercle classique — photo recadrée en rond.',
  },
  {
    value: 'square',
    label: 'Carré',
    description: 'Cadre carré net — angles droits.',
  },
  {
    value: 'rectangle',
    label: 'Rectangle',
    description: 'Format portrait 4:5 — style éditorial.',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    description: 'Anneau unicolore (couleur principale) décollé du portrait.',
  },
];

export function isPortfolioInfoAboutManifestoPortraitFrame(
  value: unknown
): value is PortfolioInfoAboutManifestoPortraitFrame {
  return (
    value === 'circle' ||
    value === 'square' ||
    value === 'rectangle' ||
    value === 'instagram'
  );
}

export function resolveInfoAboutManifestoPortraitFrame(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutManifestoPortraitFrame'>
): PortfolioInfoAboutManifestoPortraitFrame {
  return isPortfolioInfoAboutManifestoPortraitFrame(presentation.aboutManifestoPortraitFrame)
    ? presentation.aboutManifestoPortraitFrame
    : 'circle';
}

export const PORTFOLIO_INFO_ABOUT_SPLIT_PORTRAIT_SIDE_OPTIONS: {
  value: PortfolioInfoAboutSplitPortraitSide;
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Portrait à gauche',
    description: 'Photo sticky à gauche, contenu à droite — disposition par défaut.',
  },
  {
    value: 'right',
    label: 'Portrait à droite',
    description: 'Contenu à gauche, photo sticky à droite.',
  },
];

export function isPortfolioInfoAboutSplitPortraitSide(
  value: unknown
): value is PortfolioInfoAboutSplitPortraitSide {
  return value === 'left' || value === 'right';
}

export function resolveInfoAboutSplitPortraitSide(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutSplitPortraitSide'>
): PortfolioInfoAboutSplitPortraitSide {
  return isPortfolioInfoAboutSplitPortraitSide(presentation.aboutSplitPortraitSide)
    ? presentation.aboutSplitPortraitSide
    : 'left';
}

export type AboutSplitSectionLabels = {
  skills: string;
  strengths: string;
  languages: string;
};

export const ABOUT_SPLIT_SECTION_LABELS_BY_STYLE: Record<
  PortfolioInfoAboutSplitSectionLabelsStyle,
  AboutSplitSectionLabels
> = {
  default: {
    skills: 'Skills',
    strengths: 'Strengths',
    languages: 'Languages',
  },
  conversational: {
    skills: 'What I do',
    strengths: 'What I bring',
    languages: 'I speak',
  },
  professional: {
    skills: 'Core competencies',
    strengths: 'Key strengths',
    languages: 'Languages spoken',
  },
  editorial: {
    skills: 'Expertise',
    strengths: 'Qualities',
    languages: 'Spoken languages',
  },
  creative: {
    skills: 'Capabilities',
    strengths: 'Superpowers',
    languages: 'Languages',
  },
};

export const PORTFOLIO_INFO_ABOUT_SPLIT_SECTION_LABELS_OPTIONS: {
  value: PortfolioInfoAboutSplitSectionLabelsStyle;
  label: string;
  description: string;
  preview: AboutSplitSectionLabels;
}[] = [
  {
    value: 'default',
    label: 'Standard',
    description: 'Skills · Strengths · Languages — titres classiques.',
    preview: ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.default,
  },
  {
    value: 'conversational',
    label: 'Conversationnel',
    description: 'What I do · What I bring · I speak — ton personnel.',
    preview: ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.conversational,
  },
  {
    value: 'professional',
    label: 'Professionnel',
    description: 'Core competencies · Key strengths · Languages spoken.',
    preview: ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.professional,
  },
  {
    value: 'editorial',
    label: 'Éditorial',
    description: 'Expertise · Qualities · Spoken languages — style magazine.',
    preview: ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.editorial,
  },
  {
    value: 'creative',
    label: 'Créatif',
    description: 'Capabilities · Superpowers · Languages — portfolio créatif.',
    preview: ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.creative,
  },
];

export function isPortfolioInfoAboutSplitSectionLabelsStyle(
  value: unknown
): value is PortfolioInfoAboutSplitSectionLabelsStyle {
  return (
    value === 'default' ||
    value === 'conversational' ||
    value === 'professional' ||
    value === 'editorial' ||
    value === 'creative'
  );
}

export function resolveAboutSplitSectionLabels(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutSplitSectionLabelsStyle'>
): AboutSplitSectionLabels {
  const style = isPortfolioInfoAboutSplitSectionLabelsStyle(
    presentation.aboutSplitSectionLabelsStyle
  )
    ? presentation.aboutSplitSectionLabelsStyle
    : 'default';
  return ABOUT_SPLIT_SECTION_LABELS_BY_STYLE[style];
}

export type AboutBannerSectionLabels = Pick<AboutSplitSectionLabels, 'skills' | 'strengths'> & {
  education: string;
  interests: string;
};

const ABOUT_BANNER_META_LABELS_BY_STYLE: Record<
  PortfolioInfoAboutSplitSectionLabelsStyle,
  Pick<AboutBannerSectionLabels, 'education' | 'interests'>
> = {
  default: { education: 'Education', interests: 'Interests' },
  conversational: { education: 'Background', interests: 'Also into' },
  professional: { education: 'Background', interests: 'Personal interests' },
  editorial: { education: 'Background', interests: 'Also into' },
  creative: { education: 'Background', interests: 'Also into' },
};

export function resolveAboutBannerSectionLabels(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutBannerSectionLabelsStyle'>
): AboutBannerSectionLabels {
  const style = isPortfolioInfoAboutSplitSectionLabelsStyle(
    presentation.aboutBannerSectionLabelsStyle
  )
    ? presentation.aboutBannerSectionLabelsStyle
    : 'conversational';
  const labels = ABOUT_SPLIT_SECTION_LABELS_BY_STYLE[style];
  const metaLabels = ABOUT_BANNER_META_LABELS_BY_STYLE[style];
  return {
    skills: labels.skills,
    strengths: labels.strengths,
    education: metaLabels.education,
    interests: metaLabels.interests,
  };
}

export function resolveInfoAboutManifestoBlocksScrollFocus(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutManifestoBlocksScrollFocus'>
): boolean {
  return presentation.aboutManifestoBlocksScrollFocus === true;
}

export const PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS: {
  value: PortfolioInfoAboutValueListMarkerStyle;
  label: string;
  description: string;
  preview: string;
}[] = [
  { value: 'dot', label: 'Point', description: 'Puce ronde pleine — style actuel.', preview: '●' },
  { value: 'dash', label: 'Trait', description: 'Tiret horizontal court.', preview: '—' },
  { value: 'arrow', label: 'Flèche', description: 'Flèche →.', preview: '→' },
  { value: 'chevron', label: 'Chevron', description: 'Chevron ›.', preview: '›' },
  { value: 'none', label: 'Aucun', description: 'Masquer les puces — texte seul.', preview: '∅' },
];

export function isPortfolioInfoAboutValueListMarkerStyle(
  value: unknown
): value is PortfolioInfoAboutValueListMarkerStyle {
  return (
    value === 'dot' ||
    value === 'dash' ||
    value === 'arrow' ||
    value === 'chevron' ||
    value === 'none'
  );
}

export function resolveInfoAboutValueListMarkerStyle(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutValueListMarkerStyle'>
): PortfolioInfoAboutValueListMarkerStyle {
  return isPortfolioInfoAboutValueListMarkerStyle(presentation.aboutValueListMarkerStyle)
    ? presentation.aboutValueListMarkerStyle
    : 'dot';
}

const ABOUT_VALUE_TO_STEPS_REVISION = 1;
const MANIFESTO_VISIBILITY_REVISION = 3;
const ABOUT_VALUE_STEPS_VISIBILITY_REVISION = 6;

/** About · value steps / manifesto — education is opt-in (default off). Other designs opt-out. */
export function resolveInfoShowEducation(
  presentation: Pick<PortfolioInfoPresentationSettings, 'design' | 'showEducation'>
): boolean {
  if (
    presentation.design === 'about-value-steps' ||
    presentation.design === 'about-manifesto'
  ) {
    return presentation.showEducation === true;
  }
  return presentation.showEducation !== false;
}

export function resolveInfoShowSystemsTools(
  presentation: Pick<PortfolioInfoPresentationSettings, 'design' | 'showSystemsTools'>
): boolean {
  if (presentation.design === 'about-value-steps') {
    return presentation.showSystemsTools === true;
  }
  return presentation.showSystemsTools !== false;
}

export function resolveInfoShowInterests(
  presentation: Pick<PortfolioInfoPresentationSettings, 'design' | 'showInterests'>
): boolean {
  return presentation.showInterests !== false;
}

export const PORTFOLIO_INFO_ABOUT_VALUE_BIO_SIZE_OPTIONS: {
  value: PortfolioInfoAboutValueBioSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'S', description: 'Compact — text-2xl / 3xl.' },
  { value: 'md', label: 'M', description: 'Medium — text-3xl / 4xl.' },
  { value: 'lg', label: 'L', description: 'Large — text-4xl / 5xl.' },
  { value: 'xl', label: 'XL', description: 'Statement — text-4xl / 6xl.' },
];

export const PORTFOLIO_INFO_ABOUT_VALUE_BIO_WIDTH_OPTIONS: {
  value: PortfolioInfoAboutValueBioWidth;
  label: string;
  description: string;
}[] = [
  { value: 'full', label: 'Plein largeur', description: 'La bio occupe toute la largeur du conteneur.' },
  {
    value: 'half',
    label: 'Demi largeur',
    description: 'La bio occupe ~50 % — alignement gauche, centre ou droite.',
  },
];

export const PORTFOLIO_INFO_ABOUT_VALUE_BIO_ALIGN_OPTIONS: {
  value: PortfolioInfoAboutValueBioAlign;
  label: string;
}[] = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Droite' },
];

export const PORTFOLIO_INFO_ABOUT_VALUE_BIO_COLOR_OPTIONS: {
  value: PortfolioInfoAboutValueBioColorToken;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: 'Principal', description: 'Accent principal de la palette Hero.' },
  { value: 'texteFort', label: 'Texte', description: 'Texte fort — titres et copy principal.' },
  { value: 'texteMuted', label: 'Muted', description: 'Texte secondaire atténué.' },
  { value: 'texteFaint', label: 'Faint', description: 'Texte discret — hints et labels.' },
];

export function isPortfolioInfoAboutValueBioSize(
  value: unknown
): value is PortfolioInfoAboutValueBioSize {
  return value === 'sm' || value === 'md' || value === 'lg' || value === 'xl';
}

export function isPortfolioInfoAboutValueBioWidth(
  value: unknown
): value is PortfolioInfoAboutValueBioWidth {
  return value === 'full' || value === 'half';
}

export function isPortfolioInfoAboutValueBioAlign(
  value: unknown
): value is PortfolioInfoAboutValueBioAlign {
  return value === 'left' || value === 'center' || value === 'right';
}

export function isPortfolioInfoAboutValueBioColorToken(
  value: unknown
): value is PortfolioInfoAboutValueBioColorToken {
  return (
    value === 'principal' ||
    value === 'texteFort' ||
    value === 'texteMuted' ||
    value === 'texteFaint'
  );
}

export function resolveInfoAboutValueBioSize(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutValueBioSize'>
): PortfolioInfoAboutValueBioSize {
  return isPortfolioInfoAboutValueBioSize(presentation.aboutValueBioSize)
    ? presentation.aboutValueBioSize
    : 'xl';
}

export function resolveInfoAboutValueBioWidth(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutValueBioWidth'>
): PortfolioInfoAboutValueBioWidth {
  return isPortfolioInfoAboutValueBioWidth(presentation.aboutValueBioWidth)
    ? presentation.aboutValueBioWidth
    : 'full';
}

export function resolveInfoAboutValueBioAlign(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutValueBioAlign'>
): PortfolioInfoAboutValueBioAlign {
  return isPortfolioInfoAboutValueBioAlign(presentation.aboutValueBioAlign)
    ? presentation.aboutValueBioAlign
    : 'left';
}

export function resolveInfoAboutValueBioColorToken(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutValueBioColorToken'>
): PortfolioInfoAboutValueBioColorToken {
  return isPortfolioInfoAboutValueBioColorToken(presentation.aboutValueBioColorToken)
    ? presentation.aboutValueBioColorToken
    : 'texteMuted';
}

export function aboutValueBioSizeClass(size: PortfolioInfoAboutValueBioSize): string {
  switch (size) {
    case 'sm':
      return 'text-2xl sm:text-3xl';
    case 'md':
      return 'text-3xl sm:text-4xl';
    case 'lg':
      return 'text-4xl sm:text-5xl';
    case 'xl':
    default:
      return 'text-4xl sm:text-5xl lg:text-6xl';
  }
}

export function resolveAboutValueBioText(
  customText: string | undefined,
  profileBio: string | null | undefined
): string {
  const custom = customText?.trim();
  if (custom) return custom;
  return profileBio?.trim() ?? '';
}

export function resolveAboutValueStepsIntroParagraphs(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    'aboutValueStepsIntroParagraph1' | 'aboutValueStepsIntroParagraph2'
  >
): string[] {
  const paragraph1 =
    presentation.aboutValueStepsIntroParagraph1?.trim() ||
    DEFAULT_ABOUT_VALUE_STEPS_INTRO_PARAGRAPH_1;
  const paragraph2 =
    presentation.aboutValueStepsIntroParagraph2?.trim() ||
    DEFAULT_ABOUT_VALUE_STEPS_INTRO_PARAGRAPH_2;
  return [paragraph1, paragraph2];
}

export function resolveAboutMeTraitHeadlineText(customText: string | undefined): string {
  const custom = customText?.trim();
  if (custom) return custom;
  return DEFAULT_ABOUT_ME_TRAIT_HEADLINE;
}

export function resolveAboutBannerHeadlineText(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    'aboutBannerHeadlineCustomText' | 'aboutMeTraitHeadlineCustomText'
  >
): string {
  const banner = presentation.aboutBannerHeadlineCustomText?.trim();
  if (banner) return banner;
  // Legacy — banner previously reused the trait headline field.
  const legacy = presentation.aboutMeTraitHeadlineCustomText?.trim();
  if (legacy && legacy !== DEFAULT_ABOUT_ME_TRAIT_HEADLINE) return legacy;
  return DEFAULT_ABOUT_BANNER_HEADLINE;
}

export type AboutFeatureIntroLine = { primary: string; secondary: string };

export function resolveAboutFeatureIntroLines(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    | 'aboutFeatureIntroLine1Primary'
    | 'aboutFeatureIntroLine1Secondary'
    | 'aboutFeatureIntroLine2Primary'
    | 'aboutFeatureIntroLine2Secondary'
  >
): { line1: AboutFeatureIntroLine; line2: AboutFeatureIntroLine } {
  return {
    line1: {
      primary:
        presentation.aboutFeatureIntroLine1Primary?.trim() ||
        DEFAULT_ABOUT_FEATURE_INTRO_LINE_1_PRIMARY,
      secondary:
        presentation.aboutFeatureIntroLine1Secondary?.trim() ||
        DEFAULT_ABOUT_FEATURE_INTRO_LINE_1_SECONDARY,
    },
    line2: {
      primary:
        presentation.aboutFeatureIntroLine2Primary?.trim() ||
        DEFAULT_ABOUT_FEATURE_INTRO_LINE_2_PRIMARY,
      secondary:
        presentation.aboutFeatureIntroLine2Secondary?.trim() ||
        DEFAULT_ABOUT_FEATURE_INTRO_LINE_2_SECONDARY,
    },
  };
}

export function isAboutFeatureIntroPresetActive(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    | 'aboutFeatureIntroLine1Primary'
    | 'aboutFeatureIntroLine1Secondary'
    | 'aboutFeatureIntroLine2Primary'
    | 'aboutFeatureIntroLine2Secondary'
  >,
  preset: (typeof PORTFOLIO_INFO_ABOUT_FEATURE_INTRO_PRESETS)[number]
): boolean {
  const lines = resolveAboutFeatureIntroLines(presentation);
  return (
    lines.line1.primary === preset.line1Primary &&
    lines.line1.secondary === preset.line1Secondary &&
    lines.line2.primary === preset.line2Primary &&
    lines.line2.secondary === preset.line2Secondary
  );
}

export function resolveAboutPlatformHeadlineText(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutPlatformHeadlineCustomText'>,
  specialty?: string | null
): string {
  const custom = presentation.aboutPlatformHeadlineCustomText?.trim();
  if (custom) return custom;
  const fromSpecialty = specialty?.trim();
  if (fromSpecialty) return fromSpecialty;
  return DEFAULT_ABOUT_PLATFORM_HEADLINE;
}

export function resolveAboutPlatformSkillsSectionTitle(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutPlatformSkillsSectionTitle'>
): string {
  return (
    presentation.aboutPlatformSkillsSectionTitle?.trim() || DEFAULT_ABOUT_PLATFORM_SKILLS_TITLE
  );
}

export function resolveAboutPlatformStrengthsSectionTitle(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutPlatformStrengthsSectionTitle'>
): string {
  return (
    presentation.aboutPlatformStrengthsSectionTitle?.trim() ||
    DEFAULT_ABOUT_PLATFORM_STRENGTHS_TITLE
  );
}

export function resolveInfoAboutPlatformStaggerLayout(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutPlatformStaggerLayout'>
): boolean {
  return presentation.aboutPlatformStaggerLayout !== false;
}

export function resolveAboutFeatureMetaIntroLines(): {
  line1: AboutFeatureIntroLine;
  line2: AboutFeatureIntroLine;
} {
  return {
    line1: {
      primary: DEFAULT_ABOUT_FEATURE_META_LINE_1_PRIMARY,
      secondary: DEFAULT_ABOUT_FEATURE_META_LINE_1_SECONDARY,
    },
    line2: {
      primary: DEFAULT_ABOUT_FEATURE_META_LINE_2_PRIMARY,
      secondary: DEFAULT_ABOUT_FEATURE_META_LINE_2_SECONDARY,
    },
  };
}

export function resolveAboutValueBioColor(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    | 'aboutValueBioColorToken'
    | 'useHeroPalette'
    | 'titleColor'
    | 'subtitleColor'
    | 'bodyColor'
  >,
  palette?: PortfolioHeroPalette
): string {
  const token = resolveInfoAboutValueBioColorToken(presentation);
  if (presentation.useHeroPalette !== false && palette) {
    return resolveHeroPaletteColor(palette, token);
  }
  switch (token) {
    case 'principal':
      return presentation.titleColor;
    case 'texteFort':
      return presentation.subtitleColor;
    case 'texteFaint':
      return presentation.bodyColor;
    case 'texteMuted':
    default:
      return presentation.bodyColor;
  }
}

export const PORTFOLIO_INFO_EDUCATION_DISPLAY_OPTIONS: {
  value: PortfolioInfoEducationDisplayStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'timeline',
    label: 'Timeline',
    description: 'Spine verticale + points — années empilées, index 01/02 (style actuel).',
  },
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Bandes magazine — année en filigrane, titre XXL, institution en caption.',
  },
  {
    value: 'panels',
    label: 'Panels',
    description: 'Grille 2 colonnes — cartes douces, année discrète, trait accent au survol.',
  },
  {
    value: 'cascade',
    label: 'Cascade',
    description: 'Décalage asymétrique type Awwwards — index géant + pastille année.',
  },
];

export function isPortfolioInfoEducationDisplayStyle(
  value: unknown
): value is PortfolioInfoEducationDisplayStyle {
  return (
    value === 'timeline' ||
    value === 'editorial' ||
    value === 'panels' ||
    value === 'cascade'
  );
}

export function resolveInfoPortraitGrayscale(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    'infoPortraitGrayscale' | 'aboutManifestoAvatarGrayscale'
  >
): boolean {
  if (presentation.infoPortraitGrayscale === true) return true;
  return presentation.aboutManifestoAvatarGrayscale === true;
}

export function portfolioInfoDesignHasPortrait(design: PortfolioInfoDesign | undefined): boolean {
  const resolved = resolveInfoDesign(design);
  return (
    resolved === 'about-me-trait' ||
    resolved === 'about-split' ||
    resolved === 'about-portrait-skills' ||
    resolved === 'about-banner' ||
    resolved === 'about-manifesto' ||
    resolved === 'about-value-steps'
  );
}

export function resolveInfoEducationDisplayStyle(
  presentation: Pick<PortfolioInfoPresentationSettings, 'educationDisplayStyle'>
): PortfolioInfoEducationDisplayStyle {
  return isPortfolioInfoEducationDisplayStyle(presentation.educationDisplayStyle)
    ? presentation.educationDisplayStyle
    : 'editorial';
}

export function resolveInfoShowStrengths(
  presentation: Pick<PortfolioInfoPresentationSettings, 'design' | 'showStrengths'>
): boolean {
  if (presentation.design === 'about-value-steps') {
    return presentation.showStrengths !== false;
  }
  if (presentation.design === 'about-manifesto') {
    return presentation.showStrengths !== false;
  }
  return presentation.showStrengths !== false;
}

export function resolveInfoShowLanguages(
  presentation: Pick<PortfolioInfoPresentationSettings, 'design' | 'showLanguages'>
): boolean {
  if (presentation.design === 'about-value-steps') {
    return presentation.showLanguages === true;
  }
  return presentation.showLanguages !== false;
}

export function resolveInfoEducationCascadeScrollShift(
  presentation: Pick<PortfolioInfoPresentationSettings, 'educationCascadeScrollShift'>
): boolean {
  return presentation.educationCascadeScrollShift === true;
}

export const PORTFOLIO_INFO_CONTENT_SIZE_OPTIONS: {
  value: PortfolioInfoContentSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'S', description: 'Compact — labels et listes plus petits.' },
  { value: 'md', label: 'M', description: 'Standard — équilibre lisibilité / densité.' },
  { value: 'lg', label: 'L', description: 'Large — texte plus confortable à lire.' },
];

export function isPortfolioInfoContentSize(value: unknown): value is PortfolioInfoContentSize {
  return value === 'sm' || value === 'md' || value === 'lg';
}

export function resolveInfoContentSize(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    'contentSize' | 'aboutManifestoContentSize' | 'aboutMeTraitContentSize'
  >
): PortfolioInfoContentSize {
  if (isPortfolioInfoContentSize(presentation.contentSize)) return presentation.contentSize;
  if (isPortfolioInfoContentSize(presentation.aboutManifestoContentSize)) {
    return presentation.aboutManifestoContentSize;
  }
  if (isPortfolioInfoContentSize(presentation.aboutMeTraitContentSize)) {
    return presentation.aboutMeTraitContentSize;
  }
  return 'md';
}

export function resolveInfoAboutManifestoContentSize(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    'contentSize' | 'aboutManifestoContentSize' | 'aboutMeTraitContentSize'
  >
): PortfolioInfoContentSize {
  return resolveInfoContentSize(presentation);
}

export function resolveInfoAboutMeTraitContentSize(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    'contentSize' | 'aboutManifestoContentSize' | 'aboutMeTraitContentSize'
  >
): PortfolioInfoContentSize {
  return resolveInfoContentSize(presentation);
}

export function infoContentLabelSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-[10px] sm:text-xs';
    case 'lg':
      return 'text-sm sm:text-base';
    case 'md':
    default:
      return 'text-xs sm:text-sm';
  }
}

export function infoContentBodySizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-sm sm:text-base';
    case 'lg':
      return 'text-lg sm:text-xl';
    case 'md':
    default:
      return 'text-base sm:text-lg';
  }
}

export function infoContentBlockTitleSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-base sm:text-lg';
    case 'lg':
      return 'text-xl sm:text-2xl';
    case 'md':
    default:
      return 'text-lg sm:text-xl';
  }
}

export function infoContentEducationTitleSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-xl sm:text-2xl';
    case 'lg':
      return 'text-3xl sm:text-4xl';
    case 'md':
    default:
      return 'text-2xl sm:text-3xl';
  }
}

export function infoContentEducationMetaSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-xs sm:text-sm';
    case 'lg':
      return 'text-base sm:text-lg';
    case 'md':
    default:
      return 'text-sm sm:text-base';
  }
}

export function aboutMeTraitSectionTitleSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-xl sm:text-2xl lg:text-[1.75rem]';
    case 'lg':
      return 'text-3xl sm:text-4xl lg:text-[2.25rem]';
    case 'md':
    default:
      return 'text-2xl sm:text-3xl lg:text-[2rem]';
  }
}

/** About · banner — centered XXL headline scale. */
export function aboutBannerHeadlineSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-[clamp(2.75rem,9vw,5.5rem)]';
    case 'lg':
      return 'text-[clamp(3.75rem,12vw,8.5rem)]';
    case 'md':
    default:
      return 'text-[clamp(3.25rem,10.5vw,7rem)]';
  }
}

/** About · portrait skills — large skill rail (title only). */
export function aboutPortraitSkillsListSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-xl leading-[1.16] sm:text-2xl lg:text-3xl';
    case 'lg':
      return 'text-3xl leading-[1.12] sm:text-4xl lg:text-5xl xl:text-[3.25rem]';
    case 'md':
    default:
      return 'text-2xl leading-[1.14] sm:text-3xl lg:text-4xl xl:text-[2.75rem]';
  }
}

/** About · portrait skills — bio lede at bottom-left. */
export function aboutPortraitSkillsBioSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-base sm:text-lg leading-[1.65]';
    case 'lg':
      return 'text-xl sm:text-2xl leading-[1.62]';
    case 'md':
    default:
      return 'text-lg sm:text-xl leading-[1.65]';
  }
}

/** About · portrait skills — centered strengths section title. */
export function aboutPortraitSkillsStrengthsTitleSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-3xl sm:text-4xl';
    case 'lg':
      return 'text-5xl sm:text-6xl lg:text-[4rem]';
    case 'md':
    default:
      return 'text-4xl sm:text-5xl lg:text-[3.5rem]';
  }
}

/** About · portrait skills — centered strengths list items. */
export function aboutPortraitSkillsStrengthsItemSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-lg sm:text-xl';
    case 'lg':
      return 'text-2xl sm:text-[1.75rem]';
    case 'md':
    default:
      return 'text-xl sm:text-2xl';
  }
}

/** About · portrait skills — interests + languages paragraph. */
export function aboutPortraitSkillsMetaSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-lg sm:text-xl leading-[1.55]';
    case 'lg':
      return 'text-2xl sm:text-[1.7rem] leading-[1.5]';
    case 'md':
    default:
      return 'text-xl sm:text-2xl leading-[1.55]';
  }
}

export function resolveAboutPortraitSkillsMetaLead(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutPortraitSkillsMetaLead'>
): string {
  const custom = presentation.aboutPortraitSkillsMetaLead?.trim();
  return custom || DEFAULT_ABOUT_PORTRAIT_SKILLS_META_LEAD;
}

export function resolveAboutPortraitSkillsMetaEnabled(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutPortraitSkillsMetaEnabled'>
): boolean {
  return presentation.aboutPortraitSkillsMetaEnabled !== false;
}

/** About · banner — bio copy beside portrait (smaller than headline). */
export function aboutBannerBioSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-sm sm:text-[0.95rem]';
    case 'lg':
      return 'text-base sm:text-lg';
    case 'md':
    default:
      return 'text-[0.95rem] sm:text-base';
  }
}

/** About · feature panel — two-tone intro headline (regular weight). */
export function aboutFeatureIntroSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-2xl sm:text-3xl';
    case 'lg':
      return 'text-4xl sm:text-5xl lg:text-[3.25rem]';
    case 'md':
    default:
      return 'text-3xl sm:text-4xl lg:text-[2.75rem]';
  }
}

/** About · platform — hero headline beside bio. */
export function aboutPlatformHeadlineSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-3xl sm:text-4xl lg:text-[2.75rem]';
    case 'lg':
      return 'text-5xl sm:text-6xl lg:text-[3.75rem]';
    case 'md':
    default:
      return 'text-4xl sm:text-5xl lg:text-[3.25rem]';
  }
}

/** About · platform — bio + strength lines (below hero headline scale). */
export function aboutPlatformLeadSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-2xl sm:text-[1.75rem]';
    case 'lg':
      return 'text-3xl sm:text-4xl lg:text-[2.5rem]';
    case 'md':
    default:
      return 'text-[1.75rem] sm:text-3xl lg:text-[2.25rem]';
  }
}

/** About · platform — full-width skills section title. */
export function aboutPlatformSkillsTitleSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-4xl sm:text-5xl';
    case 'lg':
      return 'text-6xl sm:text-7xl lg:text-[5rem]';
    case 'md':
    default:
      return 'text-5xl sm:text-6xl lg:text-[4.25rem]';
  }
}

/** About · feature panel — footer meta bicolor headline (larger than section intro). */
export function aboutFeatureMetaIntroSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-4xl sm:text-5xl';
    case 'lg':
      return 'text-6xl sm:text-7xl lg:text-[5rem]';
    case 'md':
    default:
      return 'text-5xl sm:text-6xl lg:text-[4.25rem]';
  }
}

/** About · feature panel — skill title in left rail. */
export function aboutFeatureSkillTitleSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-lg sm:text-xl';
    case 'lg':
      return 'text-2xl sm:text-[1.75rem]';
    case 'md':
    default:
      return 'text-xl sm:text-2xl';
  }
}

/** About · feature panel — blockquote description inside the card. */
export function aboutFeatureQuoteSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-[1.35rem] sm:text-[1.55rem]';
    case 'lg':
      return 'text-[1.85rem] sm:text-[2.2rem] lg:text-[2.5rem]';
    case 'md':
    default:
      return 'text-[1.65rem] sm:text-[1.95rem] lg:text-[2.25rem]';
  }
}

export function aboutMeTraitHeadlineSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-[clamp(2.25rem,6.5vw,5.5rem)]';
    case 'lg':
      return 'text-[clamp(3.25rem,8.8vw,7.25rem)]';
    case 'md':
    default:
      return 'text-[clamp(3rem,8vw,6.75rem)]';
  }
}

export function manifestoStatementSecondarySizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-base sm:text-lg';
    case 'lg':
      return 'text-xl sm:text-2xl';
    case 'md':
    default:
      return 'text-lg sm:text-xl';
  }
}

/** Classic about-me — section subtitle (h2). */
export function infoContentSectionTitleSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-2xl sm:text-3xl lg:text-[2.25rem] lg:leading-[1.15]';
    case 'lg':
      return 'text-4xl sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]';
    case 'md':
    default:
      return 'text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]';
  }
}

/** About · split — large uppercase title. */
export function aboutSplitTitleSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl';
    case 'lg':
      return 'text-5xl sm:text-6xl lg:text-[3.75rem] xl:text-7xl';
    case 'md':
    default:
      return 'text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl';
  }
}

/** About · value steps — skill row title (right column). */
export function aboutValueStepsItemTitleSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-lg sm:text-xl lg:text-2xl';
    case 'lg':
      return 'text-2xl sm:text-3xl lg:text-4xl';
    case 'md':
    default:
      return 'text-xl sm:text-2xl lg:text-3xl';
  }
}

/** About · value steps — skill description under each title. */
export function aboutValueStepsDescriptionSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-base sm:text-lg';
    case 'lg':
      return 'text-xl sm:text-2xl';
    case 'md':
    default:
      return 'text-lg sm:text-xl';
  }
}

/** About · value — large index in numbered values grid (01, 02…). */
export function aboutValueNumberedGridIndexSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-3xl sm:text-4xl';
    case 'lg':
      return 'text-5xl sm:text-6xl lg:text-7xl';
    case 'md':
    default:
      return 'text-4xl sm:text-5xl lg:text-6xl';
  }
}

/** About · value — block headings (My Values, Strengths, …). */
export function aboutValueBlockTitleSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-3xl sm:text-4xl lg:text-5xl';
    case 'lg':
      return 'text-5xl sm:text-6xl lg:text-7xl';
    case 'md':
    default:
      return 'text-4xl sm:text-5xl lg:text-6xl';
  }
}

/** About · terminal — shell base monospace scale. */
export function terminalShellSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-sm leading-relaxed sm:text-[15px]';
    case 'lg':
      return 'text-base leading-relaxed sm:text-lg';
    case 'md':
    default:
      return 'text-[15px] leading-relaxed sm:text-base';
  }
}

/** About · terminal — main heading inside the shell. */
export function terminalHeadingSizeClass(size: PortfolioInfoContentSize): string {
  switch (size) {
    case 'sm':
      return 'text-2xl font-bold tracking-tight sm:text-3xl';
    case 'lg':
      return 'text-4xl font-bold tracking-tight sm:text-[2.75rem]';
    case 'md':
    default:
      return 'text-3xl font-bold tracking-tight sm:text-4xl';
  }
}

export const PORTFOLIO_INFO_LANGUAGE_LEVEL_DISPLAY_OPTIONS: {
  value: PortfolioInfoLanguageLevelDisplayStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'stars',
    label: 'Étoiles',
    description: 'Note sur 5 étoiles — remplies avec la couleur d’accent.',
  },
  {
    value: 'text',
    label: 'Texte',
    description: 'Beginner, Intermediate, Advanced, Expert — libellé textuel.',
  },
  {
    value: 'dots',
    label: 'Points',
    description: '5 points lumineux selon le niveau.',
  },
  {
    value: 'progress-bar',
    label: 'Barre',
    description: 'Barre de progression horizontale (sans libellé de niveau).',
  },
];

export function isPortfolioInfoLanguageLevelDisplayStyle(
  value: unknown
): value is PortfolioInfoLanguageLevelDisplayStyle {
  return (
    value === 'stars' || value === 'text' || value === 'dots' || value === 'progress-bar'
  );
}

export function resolveInfoLanguageLevelDisplayStyle(
  presentation: Pick<PortfolioInfoPresentationSettings, 'design' | 'languageLevelDisplayStyle'>
): PortfolioInfoLanguageLevelDisplayStyle {
  if (isPortfolioInfoLanguageLevelDisplayStyle(presentation.languageLevelDisplayStyle)) {
    return presentation.languageLevelDisplayStyle;
  }
  if (presentation.design === 'about-terminal' || presentation.design === 'about-value-steps') {
    return 'progress-bar';
  }
  if (presentation.design === 'about-split') {
    return 'text';
  }
  return 'stars';
}

export const PORTFOLIO_INFO_DESIGN_OPTIONS: {
  value: PortfolioInfoDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'about-me',
    label: 'About me',
    description:
      'Titre + sous-titre, bio, puis Education et grilles Skills / Strengths / Languages / Systems & tools.',
  },
  {
    value: 'about-me-trait',
    label: 'About me · trait',
    description:
      'ABOUT ME + trait ; portrait / bio ; Skills · Strengths · Languages ; Education en timeline éditoriale.',
  },
  {
    value: 'about-split',
    label: 'About · split',
    description:
      'Split asymétrique type Framer — portrait à gauche, titre expressif, bio, skills chips, strengths, langues compactes.',
  },
  {
    value: 'about-banner',
    label: 'About · banner',
    description:
      'Titre XXL centré — portrait en bas à gauche, bio discrète en bas à droite. Style hero éditorial.',
  },
  {
    value: 'about-feature-panel',
    label: 'About · feature panel',
    description:
      'Titre + intro bicolore — liste de skills à gauche, panneau description au survol/clic, bio en bas.',
  },
  {
    value: 'about-platform',
    label: 'About · platform',
    description:
      'Style Jasper — kicker + titre à gauche, bio à droite ; grille de skills en cartes (4 par ligne).',
  },
  {
    value: 'about-portrait-skills',
    label: 'About · portrait skills',
    description:
      'Portrait grand à droite — petit titre + liste de skills XXL à gauche (titres seuls), bio en bas à gauche.',
  },
  {
    value: 'about-manifesto',
    label: 'About · manifesto',
    description:
      'Déclaration XXL + filet d’accent ; Languages, Skills (Strengths) — éditorial Awwwards.',
  },
  {
    value: 'about-terminal',
    label: 'About · terminal',
    description:
      'Terminal monospace — header, bio, skills //, strengths, interests, langues (étoiles/texte/barre), tools, education.log ; palette Hero.',
  },
  {
    value: 'about-value-steps',
    label: 'About · value steps',
    description:
      'My Values — steps natifs, éditorial, grille numérotée ou liste indexée ; intro, strengths, portrait et blocs meta.',
  },
];

export function isPortfolioInfoDesign(value: unknown): value is PortfolioInfoDesign {
  return (
    value === 'about-me' ||
    value === 'about-me-trait' ||
    value === 'about-split' ||
    value === 'about-banner' ||
    value === 'about-feature-panel' ||
    value === 'about-platform' ||
    value === 'about-portrait-skills' ||
    value === 'about-manifesto' ||
    value === 'about-terminal' ||
    value === 'about-value-steps'
  );
}

const REMOVED_INFO_DESIGNS = new Set([
  'about-serif',
  'about-stack',
  'about-bento',
  'about-marquee',
  'about-cinema',
  'about-value',
]);

/** Map saved design ids — removed layouts fall back to about-me (about-value → about-value-steps). */
export function resolveInfoDesign(
  value: unknown,
  fallback: PortfolioInfoDesign = 'about-me'
): PortfolioInfoDesign {
  if (value === 'about-value') return 'about-value-steps';
  if (isPortfolioInfoDesign(value)) return value;
  if (typeof value === 'string' && REMOVED_INFO_DESIGNS.has(value)) {
    return value === 'about-value' ? 'about-value-steps' : 'about-me';
  }
  return fallback;
}

export function defaultsForInfoDesign(design: PortfolioInfoDesign): Partial<PortfolioInfoSectionSettings> {
  switch (design) {
    case 'about-me-trait':
      return {
        design: 'about-me-trait',
        title: DEFAULT_INFO_TITLE,
        subtitle: '',
        showEducation: true,
        showSkills: true,
        showStrengths: true,
        showLanguages: true,
        showSystemsTools: false,
        educationDisplayStyle: 'editorial',
        educationCascadeScrollShift: false,
        aboutMeTraitHeadlineEnabled: true,
        aboutMeTraitHeadlineCustomText: DEFAULT_ABOUT_ME_TRAIT_HEADLINE,
        contentSize: 'md',
        aboutMeTraitContentSize: 'md',
      };
    case 'about-split':
      return {
        design: 'about-split',
        title: 'About',
        subtitle: '',
        showEducation: false,
        showSkills: true,
        showStrengths: true,
        showLanguages: true,
        showSystemsTools: false,
        languageLevelDisplayStyle: 'text',
        aboutSplitPortraitSide: 'left',
        aboutSplitSectionLabelsStyle: 'default',
      };
    case 'about-banner':
      return {
        design: 'about-banner',
        title: DEFAULT_INFO_TITLE,
        subtitle: '',
        showEducation: true,
        showSkills: true,
        showStrengths: true,
        showInterests: true,
        showLanguages: false,
        showSystemsTools: false,
        aboutBannerHeadlineEnabled: true,
        aboutBannerHeadlineCustomText: DEFAULT_ABOUT_BANNER_HEADLINE,
        aboutBannerSectionLabelsStyle: 'conversational',
        contentSize: 'md',
      };
    case 'about-feature-panel':
      return {
        design: 'about-feature-panel',
        title: DEFAULT_INFO_TITLE,
        subtitle: '',
        showEducation: true,
        showSkills: true,
        showStrengths: true,
        showInterests: false,
        showLanguages: true,
        showSystemsTools: false,
        languageLevelDisplayStyle: 'stars',
        aboutFeatureIntroLine1Primary: DEFAULT_ABOUT_FEATURE_INTRO_LINE_1_PRIMARY,
        aboutFeatureIntroLine1Secondary: DEFAULT_ABOUT_FEATURE_INTRO_LINE_1_SECONDARY,
        aboutFeatureIntroLine2Primary: DEFAULT_ABOUT_FEATURE_INTRO_LINE_2_PRIMARY,
        aboutFeatureIntroLine2Secondary: DEFAULT_ABOUT_FEATURE_INTRO_LINE_2_SECONDARY,
        contentSize: 'md',
      };
    case 'about-platform':
      return {
        design: 'about-platform',
        title: DEFAULT_INFO_TITLE,
        subtitle: '',
        showEducation: true,
        showSkills: true,
        showStrengths: true,
        showInterests: true,
        showLanguages: true,
        showSystemsTools: false,
        languageLevelDisplayStyle: 'stars',
        aboutPlatformHeadlineCustomText: DEFAULT_ABOUT_PLATFORM_HEADLINE,
        aboutPlatformSkillsSectionTitle: DEFAULT_ABOUT_PLATFORM_SKILLS_TITLE,
        aboutPlatformStrengthsSectionTitle: DEFAULT_ABOUT_PLATFORM_STRENGTHS_TITLE,
        aboutPlatformStaggerLayout: true,
        contentSize: 'md',
      };
    case 'about-portrait-skills':
      return {
        design: 'about-portrait-skills',
        title: DEFAULT_INFO_TITLE,
        subtitle: '',
        showEducation: false,
        showSkills: true,
        showStrengths: true,
        showInterests: true,
        showLanguages: true,
        showSystemsTools: false,
        aboutPortraitSkillsMetaLead: DEFAULT_ABOUT_PORTRAIT_SKILLS_META_LEAD,
        aboutPortraitSkillsMetaEnabled: true,
        contentSize: 'md',
      };
    case 'about-manifesto':
      return {
        design: 'about-manifesto',
        title: DEFAULT_INFO_TITLE,
        subtitle: DEFAULT_INFO_SUBTITLE,
        showEducation: false,
        showSkills: true,
        showStrengths: true,
        showLanguages: true,
        showSystemsTools: false,
        aboutManifestoSettingsRevision: MANIFESTO_VISIBILITY_REVISION,
        aboutManifestoAvatarGrayscale: false,
        aboutManifestoPortraitFrame: 'circle',
        aboutManifestoBlocksLayout: 'grid',
        aboutManifestoBlocksScrollFocus: false,
        contentSize: 'md',
        aboutManifestoContentSize: 'md',
      };
    case 'about-terminal':
      return {
        design: 'about-terminal',
        title: DEFAULT_INFO_TITLE,
        subtitle: '',
        showEducation: true,
        showSkills: true,
        showStrengths: true,
        showInterests: true,
        showLanguages: true,
        showSystemsTools: true,
        languageLevelDisplayStyle: 'progress-bar',
      };
    case 'about-value-steps':
      return {
        design: 'about-value-steps',
        title: DEFAULT_INFO_VALUE_TITLE,
        subtitle: '',
        showEducation: false,
        showSkills: true,
        showStrengths: true,
        showInterests: true,
        showLanguages: false,
        showSystemsTools: false,
        languageLevelDisplayStyle: 'progress-bar',
        aboutValueValuesLayout: 'value-steps',
        aboutValueStepsIntroEnabled: true,
        aboutValueStepsIntroParagraph1: DEFAULT_ABOUT_VALUE_STEPS_INTRO_PARAGRAPH_1,
        aboutValueStepsIntroParagraph2: DEFAULT_ABOUT_VALUE_STEPS_INTRO_PARAGRAPH_2,
        aboutValueStepsSettingsRevision: ABOUT_VALUE_STEPS_VISIBILITY_REVISION,
        contentSize: 'md',
      };
    case 'about-me':
    default:
      return {
        design: 'about-me',
        title: DEFAULT_INFO_TITLE,
        subtitle: DEFAULT_INFO_SUBTITLE,
        showEducation: true,
        showSkills: true,
        showStrengths: true,
        showLanguages: true,
        showSystemsTools: true,
      };
  }
}

/** Settings bundled when picking an Info section design — isolates per-design defaults. */
export function infoDesignSettingsPatch(
  design: PortfolioInfoDesign
): Partial<PortfolioInfoSectionSettings> {
  return defaultsForInfoDesign(design);
}

export function resolveInfoSectionTitle(settings: PortfolioInfoSectionSettings): string {
  const custom = settings.title?.trim();
  if (settings.design === 'about-value-steps') {
    if (!custom || custom === DEFAULT_INFO_TITLE) return DEFAULT_INFO_VALUE_TITLE;
    return custom;
  }
  if (custom) return custom;
  return DEFAULT_INFO_TITLE;
}

export function resolveInfoSectionSubtitle(settings: PortfolioInfoSectionSettings): string {
  const custom = settings.subtitle?.trim();
  // About · banner — profile bio drives copy; ignore generic default subtitle
  if (settings.design === 'about-banner') {
    if (custom && custom !== DEFAULT_INFO_SUBTITLE) return custom;
    return '';
  }
  if (settings.design === 'about-feature-panel') {
    if (custom && custom !== DEFAULT_INFO_SUBTITLE) return custom;
    return '';
  }
  if (settings.design === 'about-platform') {
    if (custom && custom !== DEFAULT_INFO_SUBTITLE) return custom;
    return '';
  }
  if (custom) return custom;
  // Designs that intentionally start with an empty subtitle (bio drives copy)
  if (
    settings.design === 'about-me-trait' ||
    settings.design === 'about-split' ||
    settings.design === 'about-terminal' ||
    settings.design === 'about-value-steps'
  ) {
    return '';
  }
  return DEFAULT_INFO_SUBTITLE;
}

export function pickInfoPresentationSettings(
  settings: PortfolioInfoSectionSettings
): PortfolioInfoPresentationSettings {
  const {
    enabled: _enabled,
    title: _title,
    subtitle: _subtitle,
    ...presentation
  } = settings;
  void _enabled;
  void _title;
  void _subtitle;
  return presentation;
}

function sanitizeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && isValidProfileHexColor(value) ? value.trim() : fallback;
}

export function mergeInfoPresentation(
  base: PortfolioInfoPresentationSettings,
  patch: unknown
): PortfolioInfoPresentationSettings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return { ...base };
  }
  const record = patch as Record<string, unknown>;
  const rawDesign =
    typeof record.design === 'string' ? record.design : base.design;
  const aboutValueRevision =
    typeof record.aboutValueSettingsRevision === 'number'
      ? record.aboutValueSettingsRevision
      : typeof base.aboutValueSettingsRevision === 'number'
        ? base.aboutValueSettingsRevision
        : 0;
  const migratingFromAboutValue =
    rawDesign === 'about-value' && aboutValueRevision < ABOUT_VALUE_TO_STEPS_REVISION;
  const design = resolveInfoDesign(record.design, base.design);
  const designDefaults = defaultsForInfoDesign(design);
  const manifestoRevision =
    typeof record.aboutManifestoSettingsRevision === 'number'
      ? record.aboutManifestoSettingsRevision
      : typeof base.aboutManifestoSettingsRevision === 'number'
        ? base.aboutManifestoSettingsRevision
        : 0;
  const aboutValueStepsRevision =
    typeof record.aboutValueStepsSettingsRevision === 'number'
      ? record.aboutValueStepsSettingsRevision
      : typeof base.aboutValueStepsSettingsRevision === 'number'
        ? base.aboutValueStepsSettingsRevision
        : 0;

  let showEducation =
    typeof record.showEducation === 'boolean'
      ? record.showEducation
      : design === 'about-value-steps' || design === 'about-manifesto'
        ? (designDefaults.showEducation ?? false)
        : base.showEducation;

  let showSkills =
    typeof record.showSkills === 'boolean'
      ? record.showSkills
      : design === 'about-manifesto'
        ? (designDefaults.showSkills ?? true)
        : base.showSkills;

  let showStrengths =
    typeof record.showStrengths === 'boolean'
      ? record.showStrengths
      : design === 'about-manifesto'
        ? (designDefaults.showStrengths ?? true)
        : design === 'about-value-steps'
          ? (designDefaults.showStrengths ?? true)
          : base.showStrengths;

  let showInterests =
    typeof record.showInterests === 'boolean'
      ? record.showInterests
      : design === 'about-value-steps'
        ? (designDefaults.showInterests ?? false)
        : base.showInterests;

  let showLanguages =
    typeof record.showLanguages === 'boolean'
      ? record.showLanguages
      : design === 'about-value-steps'
        ? (designDefaults.showLanguages ?? false)
        : base.showLanguages;

  let showSystemsTools =
    typeof record.showSystemsTools === 'boolean'
      ? record.showSystemsTools
      : design === 'about-value-steps'
        ? (designDefaults.showSystemsTools ?? false)
        : base.showSystemsTools;

  let aboutValueSettingsRevision = base.aboutValueSettingsRevision;
  let aboutManifestoSettingsRevision =
    design === 'about-manifesto' ? manifestoRevision : base.aboutManifestoSettingsRevision;
  let aboutValueStepsSettingsRevision =
    design === 'about-value-steps' ? aboutValueStepsRevision : base.aboutValueStepsSettingsRevision;

  let languageLevelDisplayStyle: PortfolioInfoLanguageLevelDisplayStyle =
    isPortfolioInfoLanguageLevelDisplayStyle(record.languageLevelDisplayStyle)
      ? record.languageLevelDisplayStyle
      : base.languageLevelDisplayStyle;

  let aboutValueValuesLayout: PortfolioInfoAboutValueValuesLayout =
    isPortfolioInfoAboutValueValuesLayout(record.aboutValueValuesLayout)
      ? record.aboutValueValuesLayout
      : design === 'about-value-steps'
        ? migratingFromAboutValue
          ? (base.aboutValueValuesLayout ?? 'editorial')
          : (designDefaults.aboutValueValuesLayout ?? 'value-steps')
        : base.aboutValueValuesLayout;

  let aboutValueStepsIntroEnabled =
    typeof record.aboutValueStepsIntroEnabled === 'boolean'
      ? record.aboutValueStepsIntroEnabled
      : base.aboutValueStepsIntroEnabled;

  let aboutValueStepsIntroParagraph1 =
    typeof record.aboutValueStepsIntroParagraph1 === 'string'
      ? record.aboutValueStepsIntroParagraph1
      : base.aboutValueStepsIntroParagraph1;

  let aboutValueStepsIntroParagraph2 =
    typeof record.aboutValueStepsIntroParagraph2 === 'string'
      ? record.aboutValueStepsIntroParagraph2
      : base.aboutValueStepsIntroParagraph2;

  if (migratingFromAboutValue) {
    const bioEnabled =
      typeof record.aboutValueBioEnabled === 'boolean'
        ? record.aboutValueBioEnabled
        : base.aboutValueBioEnabled;
    const bioCustom =
      typeof record.aboutValueBioCustomText === 'string'
        ? record.aboutValueBioCustomText
        : base.aboutValueBioCustomText;
    if (bioCustom?.trim()) {
      aboutValueStepsIntroParagraph1 = bioCustom.trim();
      aboutValueStepsIntroEnabled = bioEnabled !== false;
    } else if (bioEnabled === false) {
      aboutValueStepsIntroEnabled = false;
    }
    aboutValueSettingsRevision = ABOUT_VALUE_TO_STEPS_REVISION;
  }

  if (design === 'about-manifesto' && manifestoRevision < MANIFESTO_VISIBILITY_REVISION) {
    showEducation = designDefaults.showEducation ?? false;
    showSkills = designDefaults.showSkills ?? true;
    showStrengths = true;
    aboutManifestoSettingsRevision = MANIFESTO_VISIBILITY_REVISION;
  }

  if (
    design === 'about-value-steps' &&
    aboutValueStepsRevision < ABOUT_VALUE_STEPS_VISIBILITY_REVISION &&
    !migratingFromAboutValue
  ) {
    showEducation = designDefaults.showEducation ?? false;
    showStrengths = designDefaults.showStrengths ?? true;
    showLanguages = designDefaults.showLanguages ?? false;
    showSystemsTools = designDefaults.showSystemsTools ?? false;
    showInterests = designDefaults.showInterests ?? true;
    languageLevelDisplayStyle = designDefaults.languageLevelDisplayStyle ?? 'progress-bar';
    if (aboutValueStepsRevision < 6) {
      aboutValueValuesLayout = designDefaults.aboutValueValuesLayout ?? 'value-steps';
    }
    aboutValueStepsSettingsRevision = ABOUT_VALUE_STEPS_VISIBILITY_REVISION;
  }

  return {
    ...base,
    ...mergeSectionBackground(base, record),
    design,
    accentColor: sanitizeHex(record.accentColor, base.accentColor),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    bodyColor: sanitizeHex(record.bodyColor, base.bodyColor),
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    showEducation,
    showSkills,
    showStrengths,
    showInterests,
    showLanguages,
    showSystemsTools,
    showLanguageFlags:
      typeof record.showLanguageFlags === 'boolean' ? record.showLanguageFlags : base.showLanguageFlags,
    languageLevelDisplayStyle,
    educationDisplayStyle: isPortfolioInfoEducationDisplayStyle(record.educationDisplayStyle)
      ? record.educationDisplayStyle
      : base.educationDisplayStyle,
    educationCascadeScrollShift:
      typeof record.educationCascadeScrollShift === 'boolean'
        ? record.educationCascadeScrollShift
        : base.educationCascadeScrollShift,
    aboutMeTraitHeadlineEnabled:
      typeof record.aboutMeTraitHeadlineEnabled === 'boolean'
        ? record.aboutMeTraitHeadlineEnabled
        : base.aboutMeTraitHeadlineEnabled,
    aboutMeTraitHeadlineCustomText:
      typeof record.aboutMeTraitHeadlineCustomText === 'string'
        ? record.aboutMeTraitHeadlineCustomText
        : base.aboutMeTraitHeadlineCustomText,
    contentSize: isPortfolioInfoContentSize(record.contentSize)
      ? record.contentSize
      : isPortfolioInfoContentSize(record.aboutManifestoContentSize)
        ? record.aboutManifestoContentSize
        : isPortfolioInfoContentSize(record.aboutMeTraitContentSize)
          ? record.aboutMeTraitContentSize
          : base.contentSize,
    aboutManifestoContentSize: isPortfolioInfoContentSize(record.aboutManifestoContentSize)
      ? record.aboutManifestoContentSize
      : base.aboutManifestoContentSize,
    aboutMeTraitContentSize: isPortfolioInfoContentSize(record.aboutMeTraitContentSize)
      ? record.aboutMeTraitContentSize
      : base.aboutMeTraitContentSize,
    aboutValueBlocksLayout: isPortfolioInfoAboutValueBlocksLayout(record.aboutValueBlocksLayout)
      ? record.aboutValueBlocksLayout
      : base.aboutValueBlocksLayout,
    aboutValueValuesLayout,
    aboutValueListMarkerStyle: isPortfolioInfoAboutValueListMarkerStyle(
      record.aboutValueListMarkerStyle
    )
      ? record.aboutValueListMarkerStyle
      : base.aboutValueListMarkerStyle,
    aboutValueBioEnabled:
      typeof record.aboutValueBioEnabled === 'boolean'
        ? record.aboutValueBioEnabled
        : base.aboutValueBioEnabled,
    aboutValueBioCustomText:
      typeof record.aboutValueBioCustomText === 'string'
        ? record.aboutValueBioCustomText
        : base.aboutValueBioCustomText,
    aboutValueBioSize: isPortfolioInfoAboutValueBioSize(record.aboutValueBioSize)
      ? record.aboutValueBioSize
      : base.aboutValueBioSize,
    aboutValueBioWidth: isPortfolioInfoAboutValueBioWidth(record.aboutValueBioWidth)
      ? record.aboutValueBioWidth
      : base.aboutValueBioWidth,
    aboutValueBioAlign: isPortfolioInfoAboutValueBioAlign(record.aboutValueBioAlign)
      ? record.aboutValueBioAlign
      : base.aboutValueBioAlign,
    aboutValueBioColorToken: isPortfolioInfoAboutValueBioColorToken(record.aboutValueBioColorToken)
      ? record.aboutValueBioColorToken
      : base.aboutValueBioColorToken,
    aboutValueStepsIntroEnabled,
    aboutValueStepsIntroParagraph1,
    aboutValueStepsIntroParagraph2,
    aboutValueSettingsRevision,
    aboutManifestoSettingsRevision,
    aboutValueStepsSettingsRevision,
    aboutManifestoAvatarGrayscale:
      typeof record.aboutManifestoAvatarGrayscale === 'boolean'
        ? record.aboutManifestoAvatarGrayscale
        : base.aboutManifestoAvatarGrayscale,
    infoPortraitGrayscale:
      typeof record.infoPortraitGrayscale === 'boolean'
        ? record.infoPortraitGrayscale
        : typeof record.aboutManifestoAvatarGrayscale === 'boolean' &&
            record.aboutManifestoAvatarGrayscale
          ? true
          : base.infoPortraitGrayscale,
    aboutManifestoPortraitFrame: isPortfolioInfoAboutManifestoPortraitFrame(
      record.aboutManifestoPortraitFrame
    )
      ? record.aboutManifestoPortraitFrame
      : base.aboutManifestoPortraitFrame,
    aboutSplitPortraitSide: isPortfolioInfoAboutSplitPortraitSide(record.aboutSplitPortraitSide)
      ? record.aboutSplitPortraitSide
      : base.aboutSplitPortraitSide,
    aboutSplitSectionLabelsStyle: isPortfolioInfoAboutSplitSectionLabelsStyle(
      record.aboutSplitSectionLabelsStyle
    )
      ? record.aboutSplitSectionLabelsStyle
      : base.aboutSplitSectionLabelsStyle,
    aboutBannerHeadlineEnabled:
      typeof record.aboutBannerHeadlineEnabled === 'boolean'
        ? record.aboutBannerHeadlineEnabled
        : base.aboutBannerHeadlineEnabled,
    aboutBannerHeadlineCustomText:
      typeof record.aboutBannerHeadlineCustomText === 'string'
        ? record.aboutBannerHeadlineCustomText
        : base.aboutBannerHeadlineCustomText,
    aboutBannerSectionLabelsStyle: isPortfolioInfoAboutSplitSectionLabelsStyle(
      record.aboutBannerSectionLabelsStyle
    )
      ? record.aboutBannerSectionLabelsStyle
      : base.aboutBannerSectionLabelsStyle,
    aboutFeatureIntroLine1Primary:
      typeof record.aboutFeatureIntroLine1Primary === 'string'
        ? record.aboutFeatureIntroLine1Primary
        : base.aboutFeatureIntroLine1Primary,
    aboutFeatureIntroLine1Secondary:
      typeof record.aboutFeatureIntroLine1Secondary === 'string'
        ? record.aboutFeatureIntroLine1Secondary
        : base.aboutFeatureIntroLine1Secondary,
    aboutFeatureIntroLine2Primary:
      typeof record.aboutFeatureIntroLine2Primary === 'string'
        ? record.aboutFeatureIntroLine2Primary
        : base.aboutFeatureIntroLine2Primary,
    aboutFeatureIntroLine2Secondary:
      typeof record.aboutFeatureIntroLine2Secondary === 'string'
        ? record.aboutFeatureIntroLine2Secondary
        : base.aboutFeatureIntroLine2Secondary,
    aboutPlatformHeadlineCustomText:
      typeof record.aboutPlatformHeadlineCustomText === 'string'
        ? record.aboutPlatformHeadlineCustomText
        : base.aboutPlatformHeadlineCustomText,
    aboutPlatformSkillsSectionTitle:
      typeof record.aboutPlatformSkillsSectionTitle === 'string'
        ? record.aboutPlatformSkillsSectionTitle
        : base.aboutPlatformSkillsSectionTitle,
    aboutPlatformStrengthsSectionTitle:
      typeof record.aboutPlatformStrengthsSectionTitle === 'string'
        ? record.aboutPlatformStrengthsSectionTitle
        : base.aboutPlatformStrengthsSectionTitle,
    aboutPlatformStaggerLayout:
      typeof record.aboutPlatformStaggerLayout === 'boolean'
        ? record.aboutPlatformStaggerLayout
        : base.aboutPlatformStaggerLayout,
    aboutPortraitSkillsMetaLead:
      typeof record.aboutPortraitSkillsMetaLead === 'string'
        ? record.aboutPortraitSkillsMetaLead
        : base.aboutPortraitSkillsMetaLead,
    aboutPortraitSkillsMetaEnabled:
      typeof record.aboutPortraitSkillsMetaEnabled === 'boolean'
        ? record.aboutPortraitSkillsMetaEnabled
        : base.aboutPortraitSkillsMetaEnabled,
    aboutManifestoBlocksLayout: isPortfolioInfoAboutManifestoBlocksLayout(
      record.aboutManifestoBlocksLayout
    )
      ? record.aboutManifestoBlocksLayout
      : base.aboutManifestoBlocksLayout,
    aboutManifestoBlocksScrollFocus:
      typeof record.aboutManifestoBlocksScrollFocus === 'boolean'
        ? record.aboutManifestoBlocksScrollFocus
        : base.aboutManifestoBlocksScrollFocus,
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
  };
}
