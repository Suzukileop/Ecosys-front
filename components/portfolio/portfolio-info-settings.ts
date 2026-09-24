import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  resolveHeroPaletteColor,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  createElementTextStyle,
  normalizeElementTextStyle,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import {
  mergeSectionColorMode,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import {
  INFO_HEADER_ACCENT_COUNT_ALIGNMENTS,
  INFO_HEADER_BILLBOARD_WORD_STYLES,
  INFO_HEADER_DESIGNS,
  INFO_HEADER_MARGIN_BOTTOM_STEPS,
  INFO_HEADER_PALETTE_TOKENS,
  INFO_HEADER_TITLE_SIZES,
  INFO_HEADER_TITLE_WEIGHTS,
  type PortfolioInfoHeaderAccentCountAlignment,
  type PortfolioInfoHeaderBillboardWordStyle,
  type PortfolioInfoHeaderDesign,
  type PortfolioInfoHeaderDesignAlignment,
  type PortfolioInfoHeaderMarginBottom,
  type PortfolioInfoHeaderPaletteToken,
  type PortfolioInfoHeaderTitleSize,
  type PortfolioInfoHeaderTitleWeight,
} from '@/components/portfolio/portfolio-info-header-settings';

export type PortfolioInfoDesign =
  | 'about-me'
  | 'about-me-trait'
  | 'about-split'
  | 'about-banner'
  | 'about-platform'
  | 'about-portrait-skills'
  | 'about-manifesto'
  | 'about-terminal'
  | 'about-index'
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
  | 'instagram'
  | 'monogram';

/** About · split — sticky portrait column on left or right (desktop). */
export type PortfolioInfoAboutSplitPortraitSide = 'left' | 'right';

/** About · split — preset tone for Skills / Strengths / Languages headings. */
export type PortfolioInfoAboutSplitSectionLabelsStyle =
  | 'default'
  | 'conversational'
  | 'professional'
  | 'editorial'
  | 'creative';

/** About · split / banner — Standard (fixed wording) or Custom (free text per label). */
export type PortfolioInfoLabelsMode = 'standard' | 'custom';

/** About · value — list marker before each value / strength / etc. */
export type PortfolioInfoAboutValueListMarkerStyle =
  | 'dot'
  | 'dash'
  | 'arrow'
  | 'chevron'
  | 'none';

export type PortfolioInfoAboutValueBioSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Global type-size control for every Info design — same standardized-shared-value
 * architecture as the Experience/Footer/FAQ sections' "Font size" control (same 5 tiers,
 * same labels). `medium` is each design's own current baseline size.
 */
export type PortfolioInfoPremiumFontSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

export type PortfolioInfoAboutValueBioWidth = 'full' | 'half';

export type PortfolioInfoAboutValueBioAlign = 'left' | 'center' | 'right';

export type PortfolioInfoAboutValueBioColorToken =
  | 'principal'
  | 'texteFort'
  | 'texteMuted'
  | 'texteFaint';

export type PortfolioInfoHeaderFont = 'sans' | 'serif' | 'display';

export {
  PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS,
  INFO_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  INFO_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  INFO_HEADER_PALETTE_TOKEN_OPTIONS,
  infoHeaderDesignFontClass,
  infoHeaderDesignFontStyle,
  infoHeaderPaletteTokenColor,
  type PortfolioInfoHeaderAccentCountAlignment,
  type PortfolioInfoHeaderBillboardWordStyle,
  type PortfolioInfoHeaderDesign,
  type PortfolioInfoHeaderDesignAlignment,
  type PortfolioInfoHeaderMarginBottom,
  type PortfolioInfoHeaderPaletteToken,
  type PortfolioInfoHeaderTitleSize,
  type PortfolioInfoHeaderTitleWeight,
} from '@/components/portfolio/portfolio-info-header-settings';

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
  /** All Info designs — labels, lists, block titles, education, etc. */
  premiumFontSize: PortfolioInfoPremiumFontSize;
  /**
   * @deprecated About · value removed — kept for saved settings migration.
   * Split (title left / list right) or grid-2 for secondary blocks.
   */
  aboutValueBlocksLayout: PortfolioInfoAboutValueBlocksLayout;
  /** About · value (+ steps skills) — editorial, grid, indexed list, or native steps. */
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
  /** @deprecated Use aboutSplitLabelsMode + aboutSplitCustom*Label — kept for saved settings migration. */
  aboutSplitSectionLabelsStyle: PortfolioInfoAboutSplitSectionLabelsStyle;
  /** About · split — Standard wording, or Custom free text per label (below). */
  aboutSplitLabelsMode: PortfolioInfoLabelsMode;
  aboutSplitCustomSkillsLabel: string;
  aboutSplitCustomStrengthsLabel: string;
  aboutSplitCustomLanguagesLabel: string;
  /** About · banner — XXL centered headline (independent from about-me-trait). */
  aboutBannerHeadlineEnabled: boolean;
  aboutBannerHeadlineCustomText: string;
  /** @deprecated Use aboutBannerLabelsMode + aboutBannerCustom*Label — kept for saved settings migration. */
  aboutBannerSectionLabelsStyle: PortfolioInfoAboutSplitSectionLabelsStyle;
  /** About · banner — Standard wording, or Custom free text per label (below). */
  aboutBannerLabelsMode: PortfolioInfoLabelsMode;
  aboutBannerCustomSkillsLabel: string;
  aboutBannerCustomStrengthsLabel: string;
  /** About · platform — left headline beside bio (supports line breaks). */
  aboutPlatformHeadlineCustomText: string;
  /** About · platform — full-width skills section title. */
  aboutPlatformSkillsSectionTitle: string;
  /** About · platform — strengths split section title (left column). */
  aboutPlatformStrengthsSectionTitle: string;
  /** About · portrait skills — intro label above the languages list. */
  aboutPortraitSkillsMetaLead: string;
  /** About · portrait skills — show interests + languages paragraph at the bottom. */
  aboutPortraitSkillsMetaEnabled: boolean;
  /** About · manifesto — grid 2×2 or alternating zigzag (desktop). */
  aboutManifestoBlocksLayout: PortfolioInfoAboutManifestoBlocksLayout;
  /** About · manifesto — blur non-centered blocks while scrolling. */
  aboutManifestoBlocksScrollFocus: boolean;
  /** About · manifesto — optional typography override for the big statement line. */
  aboutManifestoStatementStyleEnabled: boolean;
  aboutManifestoStatementStyle: PortfolioElementTextStyle;
  /** About · terminal — keep the console shell dark even when the section/global mode is light. */
  aboutTerminalAlwaysDark: boolean;
  titleFont: PortfolioInfoHeaderFont;
  subtitleFont: PortfolioInfoHeaderFont;
  /**
   * Header — one shared, GSAP-animated header mounted above the Info section, copied
   * from the Portfolio/Work section's Header mechanism (info-portfolio-header-designs/*).
   * Independent of Design's per-design layout (about-me, about-split, etc.).
   */
  headerDesign: PortfolioInfoHeaderDesign;
  /** Master switch for the header's GSAP entrance/scroll motion (respects prefers-reduced-motion regardless). */
  headerAnimationEnabled: boolean;
  headerDesignAlignment: PortfolioInfoHeaderDesignAlignment;
  /** Bottom spacing under every header design — shared across all of them. */
  headerMarginBottom: PortfolioInfoHeaderMarginBottom;
  /** Title size/weight — shared across every header design. */
  headerTitleSize: PortfolioInfoHeaderTitleSize;
  headerTitleWeight: PortfolioInfoHeaderTitleWeight;
  /** Header accent count — badge text supports a {count} token for the visible info highlights. */
  headerAccentCountBadgeText: string;
  headerAccentCountLeadText: string;
  /** Header accent count — badge and lead bound to a palette token, independently. */
  headerAccentCountBadgeColor: PortfolioInfoHeaderPaletteToken;
  headerAccentCountLeadColor: PortfolioInfoHeaderPaletteToken;
  /** Header accent count — one size/weight for the whole line (badge + lead flow together). */
  headerAccentCountSize: PortfolioInfoHeaderTitleSize;
  headerAccentCountWeight: PortfolioInfoHeaderTitleWeight;
  /** Header accent count — its own 3-way alignment (adds "right", unlike the shared control). */
  headerAccentCountAlignment: PortfolioInfoHeaderAccentCountAlignment;
  /** Header serif lead — small label above the large serif title. */
  headerSerifLeadLabelText: string;
  /** Header serif lead — the large serif title itself, independent of the section title. */
  headerSerifLeadTitleText: string;
  /** Header serif lead — each element bound to a palette token, independently. */
  headerSerifLeadLabelColor: PortfolioInfoHeaderPaletteToken;
  headerSerifLeadTitleColor: PortfolioInfoHeaderPaletteToken;
  headerSerifLeadSubtitleColor: PortfolioInfoHeaderPaletteToken;
  /** Header serif lead — each element sized/weighted independently. */
  headerSerifLeadLabelSize: PortfolioInfoHeaderTitleSize;
  headerSerifLeadTitleSize: PortfolioInfoHeaderTitleSize;
  headerSerifLeadSubtitleSize: PortfolioInfoHeaderTitleSize;
  headerSerifLeadLabelWeight: PortfolioInfoHeaderTitleWeight;
  headerSerifLeadTitleWeight: PortfolioInfoHeaderTitleWeight;
  headerSerifLeadSubtitleWeight: PortfolioInfoHeaderTitleWeight;
  /** Header billboard — big faint background word + a {count}-token line. */
  headerBillboardBigWord: string;
  headerBillboardCountText: string;
  /** Header billboard — the editorial split title beneath the big word, independent of the section title. */
  headerBillboardTitleText: string;
  /** Header billboard — outline (stroke only) or fill (solid) big word. */
  headerBillboardWordStyle: PortfolioInfoHeaderBillboardWordStyle;
  /** Header billboard — each element bound to a palette token, independently. */
  headerBillboardWordColor: PortfolioInfoHeaderPaletteToken;
  headerBillboardTitleColor: PortfolioInfoHeaderPaletteToken;
  headerBillboardMetaColor: PortfolioInfoHeaderPaletteToken;
  /** Header split heading — small label on the side opposite the narrative title. */
  headerSplitHeadingLabelText: string;
  /** Header split heading — the narrative title itself, independent of the section title. */
  headerSplitHeadingTitleText: string;
  /** Header split heading — each element bound to a palette token, independently. */
  headerSplitHeadingTitleColor: PortfolioInfoHeaderPaletteToken;
  headerSplitHeadingLabelColor: PortfolioInfoHeaderPaletteToken;
  /** Header split heading — each element sized/weighted independently. */
  headerSplitHeadingTitleSize: PortfolioInfoHeaderTitleSize;
  headerSplitHeadingTitleWeight: PortfolioInfoHeaderTitleWeight;
  headerSplitHeadingLabelSize: PortfolioInfoHeaderTitleSize;
  headerSplitHeadingLabelWeight: PortfolioInfoHeaderTitleWeight;
  /** Header masthead — up to 3 independent lines, monumental headline text, one shared color/size/weight. */
  headerMastheadLine1Text: string;
  headerMastheadLine2Text: string;
  headerMastheadLine3Text: string;
  /** Header masthead — one color for the whole headline, across every line. */
  headerMastheadHeadlineColor: PortfolioInfoHeaderPaletteToken;
  /** Header masthead — one size/weight for the whole headline, across every line. */
  headerMastheadHeadlineSize: PortfolioInfoHeaderTitleSize;
  headerMastheadHeadlineWeight: PortfolioInfoHeaderTitleWeight;
  /** Header index — small label on the top divider rule (e.g. "Index", "Info"). */
  headerIndexLabelText: string;
  /** Header index — the title beside the counting numeral, independent of the section title. */
  headerIndexTitleText: string;
  /** Header index — caption under the counter (e.g. "Highlights"). Empty falls back to automatic pluralization. */
  headerIndexCountLabelText: string;
  /** Header index — the small subtitle under the title, independent of the section subtitle. */
  headerIndexSubtitleText: string;
  /** Header index — each element bound to a palette token, independently. */
  headerIndexLabelColor: PortfolioInfoHeaderPaletteToken;
  headerIndexNumberColor: PortfolioInfoHeaderPaletteToken;
  headerIndexTitleColor: PortfolioInfoHeaderPaletteToken;
  headerIndexSubtitleColor: PortfolioInfoHeaderPaletteToken;
  /** Header index — each element sized/weighted independently. */
  headerIndexLabelSize: PortfolioInfoHeaderTitleSize;
  headerIndexLabelWeight: PortfolioInfoHeaderTitleWeight;
  headerIndexTitleSize: PortfolioInfoHeaderTitleSize;
  headerIndexTitleWeight: PortfolioInfoHeaderTitleWeight;
  headerIndexSubtitleSize: PortfolioInfoHeaderTitleSize;
  headerIndexSubtitleWeight: PortfolioInfoHeaderTitleWeight;
  /** Header marquee — up to 4 independent words in the repeating band, each its own field (empty slots are dropped). */
  headerMarqueeWord1Text: string;
  headerMarqueeWord2Text: string;
  headerMarqueeWord3Text: string;
  headerMarqueeWord4Text: string;
  /** Header marquee — alternating fill/outline words bound to one palette token. */
  headerMarqueeWordColor: PortfolioInfoHeaderPaletteToken;
  /** Header marquee — scales the repeating word band. */
  headerMarqueeSize: PortfolioInfoHeaderTitleSize;
  /** Header chapter — an italic index tag (e.g. "02 /") inline with the title, independent of the section title. */
  headerChapterIndexText: string;
  headerChapterTitleText: string;
  /** Header chapter — index/title/rule each bound to a palette token, independently. */
  headerChapterIndexColor: PortfolioInfoHeaderPaletteToken;
  headerChapterTitleColor: PortfolioInfoHeaderPaletteToken;
  /** Header chapter — one size/weight for the whole title line. */
  headerChapterTitleSize: PortfolioInfoHeaderTitleSize;
  headerChapterTitleWeight: PortfolioInfoHeaderTitleWeight;
  /** Header cover — up to 3 independent centered lines, each its own field (empty slots are dropped). */
  headerCoverLine1Text: string;
  headerCoverLine2Text: string;
  headerCoverLine3Text: string;
  /** Header cover — one color for the whole headline, across every line. */
  headerCoverHeadlineColor: PortfolioInfoHeaderPaletteToken;
  /** Header cover — one size/weight for the whole headline, across every line. */
  headerCoverHeadlineSize: PortfolioInfoHeaderTitleSize;
  headerCoverHeadlineWeight: PortfolioInfoHeaderTitleWeight;
  useHeroPalette: boolean;
  activeColorMode?: 'light' | 'dark';
  /** User override — 'auto' (default) follows Global → Theme's site-wide mode. */
  colorModeOverride: PortfolioSectionColorMode;
};

export type PortfolioInfoSectionSettings = PortfolioSectionCopy & PortfolioInfoPresentationSettings;

export const DEFAULT_INFO_TITLE = 'About me';
export const DEFAULT_INFO_VALUE_TITLE = 'My Values';
export const DEFAULT_INFO_SUBTITLE = 'Background, education and how I work.';
export const DEFAULT_ABOUT_ME_TRAIT_HEADLINE =
  'Turning Hard\nProblems Into\nSimple Software';

/** About · banner — default XXL centered headline (3 lines). */
export const DEFAULT_ABOUT_BANNER_HEADLINE = 'Built To Ship\nDesigned To\nScale';

export const DEFAULT_ABOUT_PLATFORM_HEADLINE = 'Built for clarity\nand real-world impact';
export const DEFAULT_ABOUT_PLATFORM_SKILLS_TITLE = 'Skills I have';
export const DEFAULT_ABOUT_PLATFORM_STRENGTHS_TITLE = 'What I bring';

/** About · portrait skills — intro label above the languages list. */
export const DEFAULT_ABOUT_PORTRAIT_SKILLS_META_LEAD = 'I speak';

const LEGACY_ABOUT_PORTRAIT_SKILLS_META_LEAD =
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
    description: 'Product clarity and real-world impact.',
    text: 'Built for clarity\nand real-world impact',
  },
  {
    id: 'marketing-success',
    label: 'Marketing Success',
    description: 'Jasper-style tone — marketing success.',
    text: 'Built for\nmarketing success',
  },
  {
    id: 'ship-scale',
    label: 'Ship & Scale',
    description: 'Sturdy product, built to last.',
    text: 'Built to ship\nproducts that scale',
  },
  {
    id: 'real-people',
    label: 'Real People',
    description: 'Software that helps every day.',
    text: 'Software that works\nfor real people',
  },
];

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
    description: 'Sturdy product, built to last.',
    text: 'Built To Ship\nDesigned To\nScale',
  },
  {
    id: 'flex-convert',
    label: 'Flex & Convert',
    description: 'Editorial impact, portfolio-hero style.',
    text: 'Built To Flex\nDesigned To\nConvert',
  },
  {
    id: 'sketch-production',
    label: 'Sketch → Prod',
    description: 'From first sketch to production.',
    text: 'From First Sketch\nTo Production\nWithout Noise',
  },
  {
    id: 'clear-clean',
    label: 'Clear & Clean',
    description: 'Clarity, execution, lasting products.',
    text: 'Clear Thinking\nClean Builds\nLasting Products',
  },
  {
    id: 'real-people',
    label: 'Real People',
    description: 'Technology that helps every day.',
    text: 'Software That\nWorks For\nReal People',
  },
  {
    id: 'ideas-live',
    label: 'Ideas Live',
    description: 'From ideas to real products.',
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
    description: 'Complexity turned into simple software.',
    text: 'Turning Hard\nProblems Into\nSimple Software',
  },
  {
    id: 'effortless-products',
    label: 'Effortless',
    description: 'Digital products that feel fluid and natural.',
    text: 'Building Digital\nProducts That\nFeel Effortless',
  },
  {
    id: 'ideas-to-products',
    label: 'Ideas → Products',
    description: 'From idea to real product.',
    text: 'From Complex Ideas\nTo Clear\nWorking Products',
  },
  {
    id: 'clarity-purpose',
    label: 'Clarity & Purpose',
    description: 'Thoughtful code, clear intent.',
    text: 'Crafting Software\nWith Clarity\nAnd Purpose',
  },
  {
    id: 'tech-for-people',
    label: 'Tech for People',
    description: 'Accessible, human-centered technology.',
    text: 'Making Technology\nSimple For\nReal People',
  },
  {
    id: 'real-world-impact',
    label: 'Real Impact',
    description: 'Useful code, real-world impact.',
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
  educationDisplayStyle: 'editorial',
  educationCascadeScrollShift: false,
  aboutMeTraitHeadlineEnabled: true,
  aboutMeTraitHeadlineCustomText: DEFAULT_ABOUT_ME_TRAIT_HEADLINE,
  premiumFontSize: 'medium',
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
  aboutManifestoPortraitFrame: 'square',
  aboutSplitPortraitSide: 'left',
  aboutSplitSectionLabelsStyle: 'default',
  aboutSplitLabelsMode: 'standard',
  aboutSplitCustomSkillsLabel: '',
  aboutSplitCustomStrengthsLabel: '',
  aboutSplitCustomLanguagesLabel: '',
  aboutBannerHeadlineEnabled: true,
  aboutBannerHeadlineCustomText: DEFAULT_ABOUT_BANNER_HEADLINE,
  aboutBannerSectionLabelsStyle: 'conversational',
  aboutBannerLabelsMode: 'standard',
  aboutBannerCustomSkillsLabel: '',
  aboutBannerCustomStrengthsLabel: '',
  aboutPlatformHeadlineCustomText: DEFAULT_ABOUT_PLATFORM_HEADLINE,
  aboutPlatformSkillsSectionTitle: DEFAULT_ABOUT_PLATFORM_SKILLS_TITLE,
  aboutPlatformStrengthsSectionTitle: DEFAULT_ABOUT_PLATFORM_STRENGTHS_TITLE,
  aboutPortraitSkillsMetaLead: DEFAULT_ABOUT_PORTRAIT_SKILLS_META_LEAD,
  aboutPortraitSkillsMetaEnabled: true,
  aboutManifestoBlocksLayout: 'grid',
  aboutManifestoBlocksScrollFocus: false,
  aboutManifestoStatementStyleEnabled: false,
  aboutManifestoStatementStyle: createElementTextStyle({
    color: '',
    size: 'lg',
    weight: 'medium',
    italic: true,
  }),
  aboutTerminalAlwaysDark: false,
  titleFont: 'sans',
  subtitleFont: 'serif',
  headerDesign: 'editorial',
  headerAnimationEnabled: true,
  headerDesignAlignment: 'left',
  headerMarginBottom: 'md',
  headerTitleSize: 'md',
  headerTitleWeight: 'regular',
  headerAccentCountBadgeText: '',
  headerAccentCountLeadText: '',
  headerAccentCountBadgeColor: 'principal',
  headerAccentCountLeadColor: 'secondaire',
  headerAccentCountSize: 'md',
  headerAccentCountWeight: 'regular',
  headerAccentCountAlignment: 'left',
  headerSerifLeadLabelText: '',
  headerSerifLeadTitleText: '',
  headerSerifLeadLabelColor: 'texteFort',
  headerSerifLeadTitleColor: 'texteFort',
  headerSerifLeadSubtitleColor: 'texteFort',
  headerSerifLeadLabelSize: 'md',
  headerSerifLeadTitleSize: 'md',
  headerSerifLeadSubtitleSize: 'md',
  headerSerifLeadLabelWeight: 'regular',
  headerSerifLeadTitleWeight: 'regular',
  headerSerifLeadSubtitleWeight: 'regular',
  headerBillboardBigWord: '',
  headerBillboardCountText: '',
  headerBillboardTitleText: '',
  headerBillboardWordStyle: 'outline',
  headerBillboardWordColor: 'principal',
  headerBillboardTitleColor: 'principal',
  headerBillboardMetaColor: 'secondaire',
  headerSplitHeadingLabelText: '',
  headerSplitHeadingTitleText: '',
  headerSplitHeadingTitleColor: 'principal',
  headerSplitHeadingLabelColor: 'secondaire',
  headerSplitHeadingTitleSize: 'md',
  headerSplitHeadingTitleWeight: 'regular',
  headerSplitHeadingLabelSize: 'md',
  headerSplitHeadingLabelWeight: 'regular',
  headerMastheadLine1Text: '',
  headerMastheadLine2Text: '',
  headerMastheadLine3Text: '',
  headerMastheadHeadlineColor: 'principal',
  headerMastheadHeadlineSize: 'md',
  headerMastheadHeadlineWeight: 'regular',
  headerIndexLabelText: '',
  headerIndexTitleText: '',
  headerIndexCountLabelText: '',
  headerIndexSubtitleText: '',
  headerIndexLabelColor: 'texteFort',
  headerIndexNumberColor: 'principal',
  headerIndexTitleColor: 'texteFort',
  headerIndexSubtitleColor: 'texteFort',
  headerIndexLabelSize: 'md',
  headerIndexLabelWeight: 'regular',
  headerIndexTitleSize: 'md',
  headerIndexTitleWeight: 'regular',
  headerIndexSubtitleSize: 'md',
  headerIndexSubtitleWeight: 'regular',
  headerMarqueeWord1Text: '',
  headerMarqueeWord2Text: '',
  headerMarqueeWord3Text: '',
  headerMarqueeWord4Text: '',
  headerMarqueeWordColor: 'principal',
  headerMarqueeSize: 'md',
  headerChapterIndexText: '',
  headerChapterTitleText: '',
  headerChapterIndexColor: 'principal',
  headerChapterTitleColor: 'texteFort',
  headerChapterTitleSize: 'md',
  headerChapterTitleWeight: 'regular',
  headerCoverLine1Text: '',
  headerCoverLine2Text: '',
  headerCoverLine3Text: '',
  headerCoverHeadlineColor: 'texteFort',
  headerCoverHeadlineSize: 'md',
  headerCoverHeadlineWeight: 'regular',
  useHeroPalette: true,
  colorModeOverride: 'auto',
};

export const PORTFOLIO_INFO_ABOUT_VALUE_VALUES_LAYOUT_OPTIONS: {
  value: PortfolioInfoAboutValueValuesLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Title on the left, list on the right — one value per line with a bullet.',
  },
  {
    value: 'numbered-grid',
    label: 'Numbered grid',
    description: 'Title top-left; values in a 2-column grid — 01, 02… + title + text.',
  },
  {
    value: 'indexed-list',
    label: 'Indexed list',
    description: 'Title at top; rows 001 · title · description — thin dividers, testimonial style.',
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
    description: 'My Values sticky on the right; numbered skills (01…) — the design’s native layout.',
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
    description: 'Title on the left, list on the right — one section per row (desktop).',
  },
  {
    value: 'grid-2',
    label: '2-column grid',
    description: 'My Values, Strengths, etc. side by side — title on top, content below.',
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
    label: 'Grid',
    description: 'Two blocks per row — aligned in a grid (Education | Skills, etc.).',
  },
  {
    value: 'zigzag',
    label: 'Zigzag',
    description: 'One block per row — alternating left then right.',
  },
];

export function isPortfolioInfoAboutManifestoBlocksLayout(
  value: unknown
): value is PortfolioInfoAboutManifestoBlocksLayout {
  return value === 'grid' || value === 'zigzag';
}

/** Block layout picker was removed from Settings — always grid now, regardless of any stored value. */
export function resolveInfoAboutManifestoBlocksLayout(
  _presentation: Pick<PortfolioInfoPresentationSettings, 'aboutManifestoBlocksLayout'>
): PortfolioInfoAboutManifestoBlocksLayout {
  return 'grid';
}

export const PORTFOLIO_INFO_ABOUT_MANIFESTO_PORTRAIT_FRAME_OPTIONS: {
  value: PortfolioInfoAboutManifestoPortraitFrame;
  label: string;
  description: string;
}[] = [
  {
    value: 'circle',
    label: 'Circle',
    description: 'Classic circle — photo cropped round.',
  },
  {
    value: 'square',
    label: 'Square',
    description: 'Clean square frame — sharp corners.',
  },
  {
    value: 'rectangle',
    label: 'Rectangle',
    description: '4:5 portrait format — editorial style.',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    description: 'Single-color ring (accent color), offset from the portrait.',
  },
  {
    value: 'monogram',
    label: 'Monogram',
    description: 'Typographic monogram — serif initials, no photo.',
  },
];

export function isPortfolioInfoAboutManifestoPortraitFrame(
  value: unknown
): value is PortfolioInfoAboutManifestoPortraitFrame {
  return (
    value === 'circle' ||
    value === 'square' ||
    value === 'rectangle' ||
    value === 'instagram' ||
    value === 'monogram'
  );
}

export function resolveInfoAboutManifestoPortraitFrame(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutManifestoPortraitFrame'>
): PortfolioInfoAboutManifestoPortraitFrame {
  return isPortfolioInfoAboutManifestoPortraitFrame(presentation.aboutManifestoPortraitFrame)
    ? presentation.aboutManifestoPortraitFrame
    : 'square';
}

export const PORTFOLIO_INFO_ABOUT_SPLIT_PORTRAIT_SIDE_OPTIONS: {
  value: PortfolioInfoAboutSplitPortraitSide;
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Portrait on the left',
    description: 'Sticky photo on the left, content on the right — default layout.',
  },
  {
    value: 'right',
    label: 'Portrait on the right',
    description: 'Content on the left, sticky photo on the right.',
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
    description: 'Skills · Strengths · Languages — classic titles.',
    preview: ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.default,
  },
  {
    value: 'conversational',
    label: 'Conversational',
    description: 'What I do · What I bring · I speak — personal tone.',
    preview: ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.conversational,
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Core competencies · Key strengths · Languages spoken.',
    preview: ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.professional,
  },
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Expertise · Qualities · Spoken languages — magazine style.',
    preview: ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.editorial,
  },
  {
    value: 'creative',
    label: 'Creative',
    description: 'Capabilities · Superpowers · Languages — creative portfolio.',
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

export function isPortfolioInfoLabelsMode(value: unknown): value is PortfolioInfoLabelsMode {
  return value === 'standard' || value === 'custom';
}

export function resolveAboutSplitSectionLabels(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    | 'aboutSplitLabelsMode'
    | 'aboutSplitCustomSkillsLabel'
    | 'aboutSplitCustomStrengthsLabel'
    | 'aboutSplitCustomLanguagesLabel'
  >
): AboutSplitSectionLabels {
  const standard = ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.default;
  if (presentation.aboutSplitLabelsMode !== 'custom') return standard;
  return {
    skills: presentation.aboutSplitCustomSkillsLabel?.trim() || standard.skills,
    strengths: presentation.aboutSplitCustomStrengthsLabel?.trim() || standard.strengths,
    languages: presentation.aboutSplitCustomLanguagesLabel?.trim() || standard.languages,
  };
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
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    'aboutBannerLabelsMode' | 'aboutBannerCustomSkillsLabel' | 'aboutBannerCustomStrengthsLabel'
  >
): AboutBannerSectionLabels {
  const labels = ABOUT_SPLIT_SECTION_LABELS_BY_STYLE.default;
  const metaLabels = ABOUT_BANNER_META_LABELS_BY_STYLE.default;
  if (presentation.aboutBannerLabelsMode !== 'custom') {
    return {
      skills: labels.skills,
      strengths: labels.strengths,
      education: metaLabels.education,
      interests: metaLabels.interests,
    };
  }
  return {
    skills: presentation.aboutBannerCustomSkillsLabel?.trim() || labels.skills,
    strengths: presentation.aboutBannerCustomStrengthsLabel?.trim() || labels.strengths,
    education: metaLabels.education,
    interests: metaLabels.interests,
  };
}

export function resolveInfoAboutManifestoBlocksScrollFocus(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutManifestoBlocksScrollFocus'>
): boolean {
  return presentation.aboutManifestoBlocksScrollFocus === true;
}

/** About · manifesto — statement typography override, or null when the toggle is off. */
export function resolveInfoAboutManifestoStatementStyle(
  presentation: Pick<
    PortfolioInfoPresentationSettings,
    'aboutManifestoStatementStyleEnabled' | 'aboutManifestoStatementStyle'
  >
): PortfolioElementTextStyle | null {
  return presentation.aboutManifestoStatementStyleEnabled === true
    ? presentation.aboutManifestoStatementStyle
    : null;
}

/** About · terminal — the console shell's own dark-mode pin, independent of the section/global mode. */
export function resolveInfoAboutTerminalColorMode(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutTerminalAlwaysDark' | 'activeColorMode'>
): 'light' | 'dark' {
  if (presentation.aboutTerminalAlwaysDark === true) return 'dark';
  return presentation.activeColorMode === 'light' ? 'light' : 'dark';
}

export const PORTFOLIO_INFO_ABOUT_VALUE_LIST_MARKER_STYLE_OPTIONS: {
  value: PortfolioInfoAboutValueListMarkerStyle;
  label: string;
  description: string;
  preview: string;
}[] = [
  { value: 'dot', label: 'Dot', description: 'Solid round bullet — current style.', preview: '●' },
  { value: 'dash', label: 'Dash', description: 'Short horizontal dash.', preview: '—' },
  { value: 'arrow', label: 'Arrow', description: 'Arrow →.', preview: '→' },
  { value: 'chevron', label: 'Chevron', description: 'Chevron ›.', preview: '›' },
  { value: 'none', label: 'None', description: 'Hide bullets — text only.', preview: '∅' },
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
const MANIFESTO_VISIBILITY_REVISION = 5;
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
  { value: 'full', label: 'Full width', description: 'The bio fills the full width of the container.' },
  {
    value: 'half',
    label: 'Half width',
    description: 'The bio takes up ~50% — left, center, or right aligned.',
  },
];

export const PORTFOLIO_INFO_ABOUT_VALUE_BIO_ALIGN_OPTIONS: {
  value: PortfolioInfoAboutValueBioAlign;
  label: string;
}[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export const PORTFOLIO_INFO_ABOUT_VALUE_BIO_COLOR_OPTIONS: {
  value: PortfolioInfoAboutValueBioColorToken;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: 'Principal', description: 'Main accent from the Hero palette.' },
  { value: 'texteFort', label: 'Text', description: 'Strong text — titles and main copy.' },
  { value: 'texteMuted', label: 'Muted', description: 'Muted secondary text.' },
  { value: 'texteFaint', label: 'Faint', description: 'Subtle text — hints and labels.' },
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
    description: 'Vertical spine + dots — stacked years, 01/02 index (current style).',
  },
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Magazine bands — watermark year, XXL title, institution as caption.',
  },
  {
    value: 'panels',
    label: 'Panels',
    description: '2-column grid — soft cards, subtle year, accent line on hover.',
  },
  {
    value: 'cascade',
    label: 'Cascade',
    description: 'Asymmetric Awwwards-style stagger — giant index + year badge.',
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

export const INFO_PREMIUM_FONT_SIZES: PortfolioInfoPremiumFontSize[] = [
  'small',
  'medium',
  'large',
  'xlarge',
  'xxlarge',
];

export const PORTFOLIO_INFO_PREMIUM_FONT_SIZE_OPTIONS: {
  value: PortfolioInfoPremiumFontSize;
  label: string;
  description: string;
}[] = [
  { value: 'small', label: 'Small', description: 'Compact type across every Info design.' },
  { value: 'medium', label: 'Medium', description: 'Default, balanced type size.' },
  { value: 'large', label: 'Large', description: 'Bigger type for maximum readability.' },
  { value: 'xlarge', label: 'Extra Large', description: 'Extra large type for a bold, high-impact look.' },
  {
    value: 'xxlarge',
    label: 'Super Extra Large',
    description: 'Maximum type size for the most dramatic, oversized look.',
  },
];

export function isPortfolioInfoPremiumFontSize(value: unknown): value is PortfolioInfoPremiumFontSize {
  return (
    value === 'small' ||
    value === 'medium' ||
    value === 'large' ||
    value === 'xlarge' ||
    value === 'xxlarge'
  );
}

/** Maps a legacy `'sm'|'md'|'lg'` value (from the old `contentSize`/`aboutManifestoContentSize`/
 *  `aboutMeTraitContentSize` fields, retired in favor of `premiumFontSize`) onto its new
 *  equivalent, for one-time migration of already-saved settings records. */
function migrateLegacyInfoContentSize(value: unknown): PortfolioInfoPremiumFontSize | undefined {
  if (value === 'sm') return 'small';
  if (value === 'md') return 'medium';
  if (value === 'lg') return 'large';
  return undefined;
}

export function resolveInfoPremiumFontSize(
  presentation: Pick<PortfolioInfoPresentationSettings, 'premiumFontSize'>
): PortfolioInfoPremiumFontSize {
  return isPortfolioInfoPremiumFontSize(presentation.premiumFontSize)
    ? presentation.premiumFontSize
    : 'medium';
}

export function infoContentLabelSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-[10px] sm:text-xs';
    case 'large':
      return 'text-sm sm:text-base';
    case 'xlarge':
      return 'text-base sm:text-lg';
    case 'xxlarge':
      return 'text-lg sm:text-xl';
    case 'medium':
    default:
      return 'text-xs sm:text-sm';
  }
}

export function infoContentBodySizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-sm sm:text-base';
    case 'large':
      return 'text-lg sm:text-xl';
    case 'xlarge':
      return 'text-xl sm:text-2xl';
    case 'xxlarge':
      return 'text-2xl sm:text-3xl';
    case 'medium':
    default:
      return 'text-base sm:text-lg';
  }
}

export function infoContentBlockTitleSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-base sm:text-lg';
    case 'large':
      return 'text-xl sm:text-2xl';
    case 'xlarge':
      return 'text-2xl sm:text-3xl';
    case 'xxlarge':
      return 'text-3xl sm:text-4xl';
    case 'medium':
    default:
      return 'text-lg sm:text-xl';
  }
}

export function infoContentEducationTitleSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-xl sm:text-2xl';
    case 'large':
      return 'text-3xl sm:text-4xl';
    case 'xlarge':
      return 'text-4xl sm:text-5xl';
    case 'xxlarge':
      return 'text-5xl sm:text-6xl';
    case 'medium':
    default:
      return 'text-2xl sm:text-3xl';
  }
}

export function infoContentEducationMetaSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-xs sm:text-sm';
    case 'large':
      return 'text-base sm:text-lg';
    case 'xlarge':
      return 'text-lg sm:text-xl';
    case 'xxlarge':
      return 'text-xl sm:text-2xl';
    case 'medium':
    default:
      return 'text-sm sm:text-base';
  }
}

export function aboutMeTraitSectionTitleSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-xl sm:text-2xl lg:text-[1.75rem]';
    case 'large':
      return 'text-3xl sm:text-4xl lg:text-[2.25rem]';
    case 'xlarge':
      return 'text-4xl sm:text-5xl lg:text-[2.5rem]';
    case 'xxlarge':
      return 'text-5xl sm:text-6xl lg:text-[2.75rem]';
    case 'medium':
    default:
      return 'text-2xl sm:text-3xl lg:text-[2rem]';
  }
}

/** About · banner — centered XXL headline scale. */
export function aboutBannerHeadlineSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-[clamp(2.75rem,9vw,5.5rem)]';
    case 'large':
      return 'text-[clamp(3.75rem,12vw,8.5rem)]';
    case 'xlarge':
      return 'text-[clamp(4.25rem,13.5vw,10rem)]';
    case 'xxlarge':
      return 'text-[clamp(4.75rem,15vw,11.5rem)]';
    case 'medium':
    default:
      return 'text-[clamp(3.25rem,10.5vw,7rem)]';
  }
}

/** About · portrait skills — large skill rail (title only). */
export function aboutPortraitSkillsListSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-xl leading-[1.16] sm:text-2xl lg:text-3xl';
    case 'large':
      return 'text-3xl leading-[1.12] sm:text-4xl lg:text-5xl xl:text-[3.25rem]';
    case 'xlarge':
      return 'text-4xl leading-[1.10] sm:text-5xl lg:text-6xl xl:text-[3.75rem]';
    case 'xxlarge':
      return 'text-5xl leading-[1.08] sm:text-6xl lg:text-7xl xl:text-[4.25rem]';
    case 'medium':
    default:
      return 'text-2xl leading-[1.14] sm:text-3xl lg:text-4xl xl:text-[2.75rem]';
  }
}

/** About · portrait skills — bio lede at bottom-left. */
export function aboutPortraitSkillsBioSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-base sm:text-lg leading-[1.65]';
    case 'large':
      return 'text-xl sm:text-2xl leading-[1.62]';
    case 'xlarge':
      return 'text-2xl sm:text-3xl leading-[1.6]';
    case 'xxlarge':
      return 'text-3xl sm:text-4xl leading-[1.58]';
    case 'medium':
    default:
      return 'text-lg sm:text-xl leading-[1.65]';
  }
}

/** About · portrait skills — centered strengths section title. */
export function aboutPortraitSkillsStrengthsTitleSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-3xl sm:text-4xl';
    case 'large':
      return 'text-5xl sm:text-6xl lg:text-[4rem]';
    case 'xlarge':
      return 'text-6xl sm:text-7xl lg:text-[4.5rem]';
    case 'xxlarge':
      return 'text-7xl sm:text-8xl lg:text-[5rem]';
    case 'medium':
    default:
      return 'text-4xl sm:text-5xl lg:text-[3.5rem]';
  }
}

/** About · portrait skills — centered strengths list items. */
export function aboutPortraitSkillsStrengthsItemSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-lg sm:text-xl';
    case 'large':
      return 'text-2xl sm:text-[1.75rem]';
    case 'xlarge':
      return 'text-3xl sm:text-[2rem]';
    case 'xxlarge':
      return 'text-4xl sm:text-[2.25rem]';
    case 'medium':
    default:
      return 'text-xl sm:text-2xl';
  }
}

/** About · portrait skills — interests + languages paragraph. */
export function aboutPortraitSkillsMetaSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-lg sm:text-xl leading-[1.55]';
    case 'large':
      return 'text-2xl sm:text-[1.7rem] leading-[1.5]';
    case 'xlarge':
      return 'text-3xl sm:text-[1.95rem] leading-[1.48]';
    case 'xxlarge':
      return 'text-4xl sm:text-[2.2rem] leading-[1.46]';
    case 'medium':
    default:
      return 'text-xl sm:text-2xl leading-[1.55]';
  }
}

export function resolveAboutPortraitSkillsMetaLead(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutPortraitSkillsMetaLead'>
): string {
  const custom = presentation.aboutPortraitSkillsMetaLead?.trim();
  if (!custom || custom === LEGACY_ABOUT_PORTRAIT_SKILLS_META_LEAD) {
    return DEFAULT_ABOUT_PORTRAIT_SKILLS_META_LEAD;
  }
  return custom;
}

export function resolveAboutPortraitSkillsMetaEnabled(
  presentation: Pick<PortfolioInfoPresentationSettings, 'aboutPortraitSkillsMetaEnabled'>
): boolean {
  return presentation.aboutPortraitSkillsMetaEnabled !== false;
}

/** About · banner — bio copy beside portrait (smaller than headline). */
export function aboutBannerBioSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-xl sm:text-2xl';
    case 'large':
      return 'text-3xl sm:text-4xl';
    case 'xlarge':
      return 'text-4xl sm:text-5xl';
    case 'xxlarge':
      return 'text-5xl sm:text-6xl';
    case 'medium':
    default:
      return 'text-2xl sm:text-3xl';
  }
}

/** About · banner — skills/strengths folio copy, bigger than the shared editorial scale. */
export function aboutBannerContentSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-base sm:text-lg';
    case 'large':
      return 'text-xl sm:text-2xl';
    case 'xlarge':
      return 'text-2xl sm:text-3xl';
    case 'xxlarge':
      return 'text-3xl sm:text-4xl';
    case 'medium':
    default:
      return 'text-lg sm:text-xl';
  }
}

/** About · banner — education/interests meta copy, bigger than the shared editorial scale. */
export function aboutBannerMetaSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-sm sm:text-base';
    case 'large':
      return 'text-lg sm:text-xl';
    case 'xlarge':
      return 'text-xl sm:text-2xl';
    case 'xxlarge':
      return 'text-2xl sm:text-3xl';
    case 'medium':
    default:
      return 'text-base sm:text-lg';
  }
}

/** About · platform — hero headline beside bio. */
export function aboutPlatformHeadlineSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-3xl sm:text-4xl lg:text-[2.75rem]';
    case 'large':
      return 'text-5xl sm:text-6xl lg:text-[3.75rem]';
    case 'xlarge':
      return 'text-6xl sm:text-7xl lg:text-[4.25rem]';
    case 'xxlarge':
      return 'text-7xl sm:text-8xl lg:text-[4.75rem]';
    case 'medium':
    default:
      return 'text-4xl sm:text-5xl lg:text-[3.25rem]';
  }
}

/** About · platform — bio + strength lines (below hero headline scale). */
export function aboutPlatformLeadSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-[1.5rem] sm:text-[1.75rem]';
    case 'large':
      return 'text-[1.875rem] sm:text-[2.25rem] lg:text-[2.5rem]';
    case 'xlarge':
      return 'text-[2.125rem] sm:text-[2.5rem] lg:text-[2.75rem]';
    case 'xxlarge':
      return 'text-[2.375rem] sm:text-[2.75rem] lg:text-[3rem]';
    case 'medium':
    default:
      return 'text-[1.75rem] sm:text-[1.875rem] lg:text-[2.25rem]';
  }
}

/** About · platform — full-width skills section title. */
export function aboutPlatformSkillsTitleSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-4xl sm:text-5xl';
    case 'large':
      return 'text-6xl sm:text-7xl lg:text-[5rem]';
    case 'xlarge':
      return 'text-7xl sm:text-8xl lg:text-[5.75rem]';
    case 'xxlarge':
      return 'text-8xl sm:text-9xl lg:text-[6.5rem]';
    case 'medium':
    default:
      return 'text-5xl sm:text-6xl lg:text-[4.25rem]';
  }
}

export function aboutMeTraitHeadlineSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-[clamp(2.25rem,6.5vw,5.5rem)]';
    case 'large':
      return 'text-[clamp(3.25rem,8.8vw,7.25rem)]';
    case 'xlarge':
      return 'text-[clamp(3.5rem,9.4vw,7.6rem)]';
    case 'xxlarge':
      return 'text-[clamp(3.75rem,10vw,8rem)]';
    case 'medium':
    default:
      return 'text-[clamp(3rem,8vw,6.75rem)]';
  }
}

export function manifestoStatementSecondarySizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-base sm:text-lg';
    case 'large':
      return 'text-xl sm:text-2xl';
    case 'xlarge':
      return 'text-2xl sm:text-3xl';
    case 'xxlarge':
      return 'text-3xl sm:text-4xl';
    case 'medium':
    default:
      return 'text-lg sm:text-xl';
  }
}

/** Classic about-me — section subtitle (h2). */
export function infoContentSectionTitleSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-2xl sm:text-3xl lg:text-[2.25rem] lg:leading-[1.15]';
    case 'large':
      return 'text-4xl sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]';
    case 'xlarge':
      return 'text-5xl sm:text-6xl lg:text-[3.75rem] lg:leading-[1.1]';
    case 'xxlarge':
      return 'text-6xl sm:text-7xl lg:text-[4.25rem] lg:leading-[1.08]';
    case 'medium':
    default:
      return 'text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]';
  }
}

/** About · split — large uppercase title. */
export function aboutSplitTitleSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl';
    case 'large':
      return 'text-5xl sm:text-6xl lg:text-[3.75rem] xl:text-7xl';
    case 'xlarge':
      return 'text-6xl sm:text-7xl lg:text-[4.25rem] xl:text-8xl';
    case 'xxlarge':
      return 'text-7xl sm:text-8xl lg:text-[4.75rem] xl:text-9xl';
    case 'medium':
    default:
      return 'text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl';
  }
}

/** About · value steps — skill row title (right column). */
export function aboutValueStepsItemTitleSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-lg sm:text-xl lg:text-2xl';
    case 'large':
      return 'text-2xl sm:text-3xl lg:text-4xl';
    case 'xlarge':
      return 'text-3xl sm:text-4xl lg:text-5xl';
    case 'xxlarge':
      return 'text-4xl sm:text-5xl lg:text-6xl';
    case 'medium':
    default:
      return 'text-xl sm:text-2xl lg:text-3xl';
  }
}

/** About · value steps — skill description under each title. */
export function aboutValueStepsDescriptionSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-base sm:text-lg';
    case 'large':
      return 'text-xl sm:text-2xl';
    case 'xlarge':
      return 'text-2xl sm:text-3xl';
    case 'xxlarge':
      return 'text-3xl sm:text-4xl';
    case 'medium':
    default:
      return 'text-lg sm:text-xl';
  }
}

/** About · value steps — "I speak" language acronym (EN, ES, FR…), Display scale. */
export function aboutValueStepsLanguageCodeSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-4xl sm:text-5xl';
    case 'large':
      return 'text-6xl sm:text-7xl';
    case 'xlarge':
      return 'text-7xl sm:text-8xl';
    case 'xxlarge':
      return 'text-8xl sm:text-9xl';
    case 'medium':
    default:
      return 'text-5xl sm:text-6xl';
  }
}

/** About · value steps — proficiency label (Beginner/Advanced/Expert) under the acronym. */
export function aboutValueStepsLanguageLevelSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-xs sm:text-sm';
    case 'large':
      return 'text-sm sm:text-base';
    case 'xlarge':
      return 'text-base sm:text-lg';
    case 'xxlarge':
      return 'text-lg sm:text-xl';
    case 'medium':
    default:
      return 'text-xs sm:text-sm';
  }
}

/** About · value — large index in numbered values grid (01, 02…). */
export function aboutValueNumberedGridIndexSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-3xl sm:text-4xl';
    case 'large':
      return 'text-5xl sm:text-6xl lg:text-7xl';
    case 'xlarge':
      return 'text-6xl sm:text-7xl lg:text-8xl';
    case 'xxlarge':
      return 'text-7xl sm:text-8xl lg:text-9xl';
    case 'medium':
    default:
      return 'text-4xl sm:text-5xl lg:text-6xl';
  }
}

/** About · value — block headings (My Values, Strengths, …). */
export function aboutValueBlockTitleSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-3xl sm:text-4xl lg:text-5xl';
    case 'large':
      return 'text-5xl sm:text-6xl lg:text-7xl';
    case 'xlarge':
      return 'text-6xl sm:text-7xl lg:text-8xl';
    case 'xxlarge':
      return 'text-7xl sm:text-8xl lg:text-9xl';
    case 'medium':
    default:
      return 'text-4xl sm:text-5xl lg:text-6xl';
  }
}

/** About · terminal — shell base monospace scale. */
export function terminalShellSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-sm leading-relaxed sm:text-[15px]';
    case 'large':
      return 'text-base leading-relaxed sm:text-lg';
    case 'xlarge':
      return 'text-lg leading-relaxed sm:text-xl';
    case 'xxlarge':
      return 'text-xl leading-relaxed sm:text-2xl';
    case 'medium':
    default:
      return 'text-[15px] leading-relaxed sm:text-base';
  }
}

/** About · terminal — main heading inside the shell. */
export function terminalHeadingSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-2xl font-bold tracking-tight sm:text-3xl';
    case 'large':
      return 'text-4xl font-bold tracking-tight sm:text-[2.75rem]';
    case 'xlarge':
      return 'text-5xl font-bold tracking-tight sm:text-[3.25rem]';
    case 'xxlarge':
      return 'text-6xl font-bold tracking-tight sm:text-[3.75rem]';
    case 'medium':
    default:
      return 'text-3xl font-bold tracking-tight sm:text-4xl';
  }
}

/** About · noir — header name / bio heading size. */
export function noirHeadingSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-xl leading-snug sm:text-2xl md:text-3xl';
    case 'large':
      return 'text-2xl leading-snug sm:text-3xl md:text-5xl';
    case 'xlarge':
      return 'text-2xl leading-snug sm:text-3xl md:text-6xl';
    case 'xxlarge':
      return 'text-3xl leading-snug sm:text-4xl md:text-7xl';
    case 'medium':
    default:
      return 'text-2xl leading-snug sm:text-3xl md:text-4xl';
  }
}

/** About · noir — bio paragraph size. */
export function noirBodySizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-lg leading-relaxed sm:text-xl md:text-2xl';
    case 'large':
      return 'text-xl leading-relaxed sm:text-2xl md:text-4xl';
    case 'xlarge':
      return 'text-xl leading-relaxed sm:text-2xl md:text-5xl';
    case 'xxlarge':
      return 'text-2xl leading-relaxed sm:text-3xl md:text-6xl';
    case 'medium':
    default:
      return 'text-xl leading-relaxed sm:text-2xl md:text-3xl';
  }
}

/** About · noir — massive language acronym size. */
export function noirLanguageAcronymSizeClass(size: PortfolioInfoPremiumFontSize): string {
  switch (size) {
    case 'small':
      return 'text-4xl sm:text-5xl';
    case 'large':
      return 'text-5xl sm:text-6xl md:text-7xl';
    case 'xlarge':
      return 'text-5xl sm:text-6xl md:text-8xl';
    case 'xxlarge':
      return 'text-6xl sm:text-7xl md:text-9xl';
    case 'medium':
    default:
      return 'text-5xl sm:text-6xl';
  }
}

export function resolveInfoLanguageLevelDisplayStyle(
  presentation: Pick<PortfolioInfoPresentationSettings, 'design'>
): PortfolioInfoLanguageLevelDisplayStyle {
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
      'Title + subtitle, bio, then Education and Skills / Strengths / Languages / Systems & tools grids.',
  },
  {
    value: 'about-me-trait',
    label: 'About me · trait',
    description:
      'ABOUT ME + trait; portrait / bio; Skills · Strengths · Languages; Education as an editorial timeline.',
  },
  {
    value: 'about-split',
    label: 'About · split',
    description:
      'Framer-style asymmetric split — portrait on the left, expressive title, bio, skill chips, strengths, compact languages.',
  },
  {
    value: 'about-banner',
    label: 'About · banner',
    description:
      'Centered XXL title — portrait bottom-left, discreet bio bottom-right. Editorial hero style.',
  },
  {
    value: 'about-platform',
    label: 'About · platform',
    description:
      'Jasper style — kicker + title on the left, bio on the right; skills grid in cards (4 per row).',
  },
  {
    value: 'about-portrait-skills',
    label: 'About · portrait skills',
    description:
      'Fixed-portrait feature panel — XXL skills rail on the left, pinned photo on the right, ghost badges, and an Interests & languages block.',
  },
  {
    value: 'about-manifesto',
    label: 'About · manifesto',
    description:
      'XXL statement + accent underline; Languages, Skills (Strengths) — Awwwards-style editorial.',
  },
  {
    value: 'about-terminal',
    label: 'About · terminal',
    description:
      'Monospace terminal — header, bio, skills //, strengths, interests, languages (stars/text/bar), tools, education.log; Hero palette.',
  },
  {
    value: 'about-index',
    label: 'About · index',
    description:
      'Brutalist-chic Swiss editorial — asymmetric 12-col grid, index-numbered sections, hover-focus keywords, no cards.',
  },
  {
    value: 'about-value-steps',
    label: 'About · value steps',
    description:
      'My Values — native steps, editorial, numbered grid, or indexed list; intro, strengths, portrait, and meta blocks.',
  },
];

export function isPortfolioInfoDesign(value: unknown): value is PortfolioInfoDesign {
  return (
    value === 'about-me' ||
    value === 'about-me-trait' ||
    value === 'about-split' ||
    value === 'about-banner' ||
    value === 'about-platform' ||
    value === 'about-portrait-skills' ||
    value === 'about-manifesto' ||
    value === 'about-terminal' ||
    value === 'about-index' ||
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
  'about-feature-panel',
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
        premiumFontSize: 'medium',
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
        premiumFontSize: 'medium',
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
        aboutPlatformHeadlineCustomText: DEFAULT_ABOUT_PLATFORM_HEADLINE,
        aboutPlatformSkillsSectionTitle: DEFAULT_ABOUT_PLATFORM_SKILLS_TITLE,
        aboutPlatformStrengthsSectionTitle: DEFAULT_ABOUT_PLATFORM_STRENGTHS_TITLE,
        premiumFontSize: 'medium',
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
        premiumFontSize: 'medium',
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
        aboutManifestoPortraitFrame: 'square',
        aboutManifestoBlocksLayout: 'grid',
        aboutManifestoBlocksScrollFocus: false,
        aboutManifestoStatementStyleEnabled: false,
        premiumFontSize: 'medium',
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
        aboutTerminalAlwaysDark: false,
      };
    case 'about-index':
      return {
        design: 'about-index',
        title: DEFAULT_INFO_TITLE,
        subtitle: '',
        showEducation: true,
        showSkills: true,
        showStrengths: true,
        showInterests: true,
        showLanguages: true,
        showSystemsTools: true,
        premiumFontSize: 'medium',
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
        aboutValueValuesLayout: 'value-steps',
        aboutValueStepsIntroEnabled: true,
        aboutValueStepsIntroParagraph1: DEFAULT_ABOUT_VALUE_STEPS_INTRO_PARAGRAPH_1,
        aboutValueStepsIntroParagraph2: DEFAULT_ABOUT_VALUE_STEPS_INTRO_PARAGRAPH_2,
        aboutValueStepsSettingsRevision: ABOUT_VALUE_STEPS_VISIBILITY_REVISION,
        premiumFontSize: 'medium',
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
  // A subtitle equal to the generic "About me" default is treated as "unset" for
  // these designs — the backend drops an empty-string subtitle entirely, so the
  // client re-fills it from the shared default (portfolio-settings-types.ts) on
  // every reload instead of actually staying blank. Comparing against
  // DEFAULT_INFO_SUBTITLE (not just truthiness) is what keeps that leaked default
  // from being mistaken for real user copy.
  const hasRealCustomSubtitle = Boolean(custom) && custom !== DEFAULT_INFO_SUBTITLE;
  if (
    settings.design === 'about-banner' ||
    settings.design === 'about-platform' ||
    settings.design === 'about-me-trait' ||
    settings.design === 'about-split' ||
    settings.design === 'about-terminal' ||
    settings.design === 'about-value-steps' ||
    settings.design === 'about-portrait-skills' ||
    settings.design === 'about-index'
  ) {
    return hasRealCustomSubtitle ? (custom as string) : '';
  }
  if (custom) return custom;
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

const DEFAULT_INFO_HEADER_TITLE_COLOR = '#e2572e';
const DEFAULT_INFO_HEADER_SUBTITLE_COLOR = '#f5f5f5';

export function infoHeaderFontClass(font: PortfolioInfoHeaderFont, kind: 'title' | 'subtitle'): string {
  if (kind === 'title') {
    switch (font) {
      case 'serif':
        return 'font-serif font-bold tracking-[-0.03em]';
      case 'display':
        return 'font-black tracking-[-0.02em]';
      default:
        return 'font-extrabold tracking-[-0.04em]';
    }
  }
  switch (font) {
    case 'serif':
      return 'font-serif leading-relaxed';
    case 'display':
      return 'font-bold leading-relaxed tracking-[-0.01em]';
    default:
      return 'leading-relaxed';
  }
}

export function infoHeaderFontStyle(
  _font: PortfolioInfoHeaderFont,
  _subtitleSerif: boolean,
  _kind: 'title' | 'subtitle'
): CSSProperties | undefined {
  // Font family is controlled only by Global → Police principale.
  return undefined;
}

export function infoTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_INFO_HEADER_TITLE_COLOR) };
}

export function infoSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_INFO_HEADER_SUBTITLE_COLOR) };
}

export function mergeInfoPresentation(
  base: PortfolioInfoPresentationSettings,
  patch: unknown
): PortfolioInfoPresentationSettings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return { ...base };
  }
  const record = patch as Record<string, unknown>;
  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
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

  const aboutValueStepsIntroParagraph2 =
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

  let aboutManifestoPortraitFrame: PortfolioInfoAboutManifestoPortraitFrame =
    isPortfolioInfoAboutManifestoPortraitFrame(record.aboutManifestoPortraitFrame)
      ? record.aboutManifestoPortraitFrame
      : isPortfolioInfoAboutManifestoPortraitFrame(base.aboutManifestoPortraitFrame)
        ? base.aboutManifestoPortraitFrame
        : 'square';

  if (manifestoRevision < MANIFESTO_VISIBILITY_REVISION) {
    if (aboutManifestoPortraitFrame === 'monogram') {
      aboutManifestoPortraitFrame = 'square';
    }
    if (design === 'about-manifesto') {
      showEducation = designDefaults.showEducation ?? false;
      showSkills = designDefaults.showSkills ?? true;
      showStrengths = true;
    }
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
    premiumFontSize: pick(
      record.premiumFontSize,
      INFO_PREMIUM_FONT_SIZES,
      migrateLegacyInfoContentSize(record.contentSize) ??
        migrateLegacyInfoContentSize(record.aboutManifestoContentSize) ??
        migrateLegacyInfoContentSize(record.aboutMeTraitContentSize) ??
        base.premiumFontSize ??
        'medium'
    ),
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
    aboutManifestoPortraitFrame,
    aboutSplitPortraitSide: isPortfolioInfoAboutSplitPortraitSide(record.aboutSplitPortraitSide)
      ? record.aboutSplitPortraitSide
      : base.aboutSplitPortraitSide,
    aboutSplitSectionLabelsStyle: isPortfolioInfoAboutSplitSectionLabelsStyle(
      record.aboutSplitSectionLabelsStyle
    )
      ? record.aboutSplitSectionLabelsStyle
      : base.aboutSplitSectionLabelsStyle,
    aboutSplitLabelsMode: isPortfolioInfoLabelsMode(record.aboutSplitLabelsMode)
      ? record.aboutSplitLabelsMode
      : base.aboutSplitLabelsMode,
    aboutSplitCustomSkillsLabel:
      typeof record.aboutSplitCustomSkillsLabel === 'string'
        ? record.aboutSplitCustomSkillsLabel
        : base.aboutSplitCustomSkillsLabel,
    aboutSplitCustomStrengthsLabel:
      typeof record.aboutSplitCustomStrengthsLabel === 'string'
        ? record.aboutSplitCustomStrengthsLabel
        : base.aboutSplitCustomStrengthsLabel,
    aboutSplitCustomLanguagesLabel:
      typeof record.aboutSplitCustomLanguagesLabel === 'string'
        ? record.aboutSplitCustomLanguagesLabel
        : base.aboutSplitCustomLanguagesLabel,
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
    aboutBannerLabelsMode: isPortfolioInfoLabelsMode(record.aboutBannerLabelsMode)
      ? record.aboutBannerLabelsMode
      : base.aboutBannerLabelsMode,
    aboutBannerCustomSkillsLabel:
      typeof record.aboutBannerCustomSkillsLabel === 'string'
        ? record.aboutBannerCustomSkillsLabel
        : base.aboutBannerCustomSkillsLabel,
    aboutBannerCustomStrengthsLabel:
      typeof record.aboutBannerCustomStrengthsLabel === 'string'
        ? record.aboutBannerCustomStrengthsLabel
        : base.aboutBannerCustomStrengthsLabel,
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
    aboutManifestoStatementStyleEnabled:
      typeof record.aboutManifestoStatementStyleEnabled === 'boolean'
        ? record.aboutManifestoStatementStyleEnabled
        : base.aboutManifestoStatementStyleEnabled,
    aboutManifestoStatementStyle: normalizeElementTextStyle(
      record.aboutManifestoStatementStyle,
      base.aboutManifestoStatementStyle
    ),
    aboutTerminalAlwaysDark:
      typeof record.aboutTerminalAlwaysDark === 'boolean'
        ? record.aboutTerminalAlwaysDark
        : base.aboutTerminalAlwaysDark,
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    headerDesign: pick(record.headerDesign, INFO_HEADER_DESIGNS, base.headerDesign ?? 'editorial'),
    headerAnimationEnabled:
      typeof record.headerAnimationEnabled === 'boolean'
        ? record.headerAnimationEnabled
        : (base.headerAnimationEnabled ?? true),
    headerDesignAlignment: pick(
      record.headerDesignAlignment,
      ['left', 'center', 'right'],
      base.headerDesignAlignment ?? 'left'
    ),
    headerMarginBottom: pick(
      record.headerMarginBottom,
      INFO_HEADER_MARGIN_BOTTOM_STEPS,
      base.headerMarginBottom ?? 'md'
    ),
    headerTitleSize: pick(record.headerTitleSize, INFO_HEADER_TITLE_SIZES, base.headerTitleSize ?? 'md'),
    headerTitleWeight: pick(
      record.headerTitleWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerTitleWeight ?? 'regular'
    ),
    headerAccentCountBadgeText:
      typeof record.headerAccentCountBadgeText === 'string'
        ? record.headerAccentCountBadgeText
        : (base.headerAccentCountBadgeText ?? ''),
    headerAccentCountLeadText:
      typeof record.headerAccentCountLeadText === 'string'
        ? record.headerAccentCountLeadText
        : (base.headerAccentCountLeadText ?? ''),
    headerAccentCountBadgeColor: pick(
      record.headerAccentCountBadgeColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerAccentCountBadgeColor ?? 'principal'
    ),
    headerAccentCountLeadColor: pick(
      record.headerAccentCountLeadColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerAccentCountLeadColor ?? 'secondaire'
    ),
    headerAccentCountSize: pick(
      record.headerAccentCountSize,
      INFO_HEADER_TITLE_SIZES,
      base.headerAccentCountSize ?? 'md'
    ),
    headerAccentCountWeight: pick(
      record.headerAccentCountWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerAccentCountWeight ?? 'regular'
    ),
    headerAccentCountAlignment: pick(
      record.headerAccentCountAlignment,
      INFO_HEADER_ACCENT_COUNT_ALIGNMENTS,
      base.headerAccentCountAlignment ?? 'left'
    ),
    headerSerifLeadLabelText:
      typeof record.headerSerifLeadLabelText === 'string'
        ? record.headerSerifLeadLabelText
        : (base.headerSerifLeadLabelText ?? ''),
    headerSerifLeadTitleText:
      typeof record.headerSerifLeadTitleText === 'string'
        ? record.headerSerifLeadTitleText
        : (base.headerSerifLeadTitleText ?? ''),
    headerSerifLeadLabelColor: pick(
      record.headerSerifLeadLabelColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadLabelColor ?? 'texteFort'
    ),
    headerSerifLeadTitleColor: pick(
      record.headerSerifLeadTitleColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadTitleColor ?? 'texteFort'
    ),
    headerSerifLeadSubtitleColor: pick(
      record.headerSerifLeadSubtitleColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadSubtitleColor ?? 'texteFort'
    ),
    headerSerifLeadLabelSize: pick(
      record.headerSerifLeadLabelSize,
      INFO_HEADER_TITLE_SIZES,
      base.headerSerifLeadLabelSize ?? 'md'
    ),
    headerSerifLeadTitleSize: pick(
      record.headerSerifLeadTitleSize,
      INFO_HEADER_TITLE_SIZES,
      base.headerSerifLeadTitleSize ?? 'md'
    ),
    headerSerifLeadSubtitleSize: pick(
      record.headerSerifLeadSubtitleSize,
      INFO_HEADER_TITLE_SIZES,
      base.headerSerifLeadSubtitleSize ?? 'md'
    ),
    headerSerifLeadLabelWeight: pick(
      record.headerSerifLeadLabelWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadLabelWeight ?? 'regular'
    ),
    headerSerifLeadTitleWeight: pick(
      record.headerSerifLeadTitleWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadTitleWeight ?? 'regular'
    ),
    headerSerifLeadSubtitleWeight: pick(
      record.headerSerifLeadSubtitleWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadSubtitleWeight ?? 'regular'
    ),
    headerBillboardBigWord:
      typeof record.headerBillboardBigWord === 'string'
        ? record.headerBillboardBigWord
        : (base.headerBillboardBigWord ?? ''),
    headerBillboardCountText:
      typeof record.headerBillboardCountText === 'string'
        ? record.headerBillboardCountText
        : (base.headerBillboardCountText ?? ''),
    headerBillboardTitleText:
      typeof record.headerBillboardTitleText === 'string'
        ? record.headerBillboardTitleText
        : (base.headerBillboardTitleText ?? ''),
    headerBillboardWordStyle: pick(
      record.headerBillboardWordStyle,
      INFO_HEADER_BILLBOARD_WORD_STYLES,
      base.headerBillboardWordStyle ?? 'outline'
    ),
    headerBillboardWordColor: pick(
      record.headerBillboardWordColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerBillboardWordColor ?? 'principal'
    ),
    headerBillboardTitleColor: pick(
      record.headerBillboardTitleColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerBillboardTitleColor ?? 'principal'
    ),
    headerBillboardMetaColor: pick(
      record.headerBillboardMetaColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerBillboardMetaColor ?? 'secondaire'
    ),
    headerSplitHeadingLabelText:
      typeof record.headerSplitHeadingLabelText === 'string'
        ? record.headerSplitHeadingLabelText
        : (base.headerSplitHeadingLabelText ?? ''),
    headerSplitHeadingTitleText:
      typeof record.headerSplitHeadingTitleText === 'string'
        ? record.headerSplitHeadingTitleText
        : (base.headerSplitHeadingTitleText ?? ''),
    headerSplitHeadingTitleColor: pick(
      record.headerSplitHeadingTitleColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingTitleColor ?? 'principal'
    ),
    headerSplitHeadingLabelColor: pick(
      record.headerSplitHeadingLabelColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingLabelColor ?? 'secondaire'
    ),
    headerSplitHeadingTitleSize: pick(
      record.headerSplitHeadingTitleSize,
      INFO_HEADER_TITLE_SIZES,
      base.headerSplitHeadingTitleSize ?? 'md'
    ),
    headerSplitHeadingTitleWeight: pick(
      record.headerSplitHeadingTitleWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerSplitHeadingTitleWeight ?? 'regular'
    ),
    headerSplitHeadingLabelSize: pick(
      record.headerSplitHeadingLabelSize,
      INFO_HEADER_TITLE_SIZES,
      base.headerSplitHeadingLabelSize ?? 'md'
    ),
    headerSplitHeadingLabelWeight: pick(
      record.headerSplitHeadingLabelWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerSplitHeadingLabelWeight ?? 'regular'
    ),
    headerMastheadLine1Text:
      typeof record.headerMastheadLine1Text === 'string'
        ? record.headerMastheadLine1Text
        : (base.headerMastheadLine1Text ?? ''),
    headerMastheadLine2Text:
      typeof record.headerMastheadLine2Text === 'string'
        ? record.headerMastheadLine2Text
        : (base.headerMastheadLine2Text ?? ''),
    headerMastheadLine3Text:
      typeof record.headerMastheadLine3Text === 'string'
        ? record.headerMastheadLine3Text
        : (base.headerMastheadLine3Text ?? ''),
    headerMastheadHeadlineColor: pick(
      record.headerMastheadHeadlineColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerMastheadHeadlineColor ?? 'principal'
    ),
    headerMastheadHeadlineSize: pick(
      record.headerMastheadHeadlineSize,
      INFO_HEADER_TITLE_SIZES,
      base.headerMastheadHeadlineSize ?? 'md'
    ),
    headerMastheadHeadlineWeight: pick(
      record.headerMastheadHeadlineWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerMastheadHeadlineWeight ?? 'regular'
    ),
    headerIndexLabelText:
      typeof record.headerIndexLabelText === 'string' ? record.headerIndexLabelText : (base.headerIndexLabelText ?? ''),
    headerIndexTitleText:
      typeof record.headerIndexTitleText === 'string' ? record.headerIndexTitleText : (base.headerIndexTitleText ?? ''),
    headerIndexCountLabelText:
      typeof record.headerIndexCountLabelText === 'string'
        ? record.headerIndexCountLabelText
        : (base.headerIndexCountLabelText ?? ''),
    headerIndexSubtitleText:
      typeof record.headerIndexSubtitleText === 'string'
        ? record.headerIndexSubtitleText
        : (base.headerIndexSubtitleText ?? ''),
    headerIndexLabelColor: pick(
      record.headerIndexLabelColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerIndexLabelColor ?? 'texteFort'
    ),
    headerIndexNumberColor: pick(
      record.headerIndexNumberColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerIndexNumberColor ?? 'principal'
    ),
    headerIndexTitleColor: pick(
      record.headerIndexTitleColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerIndexTitleColor ?? 'texteFort'
    ),
    headerIndexSubtitleColor: pick(
      record.headerIndexSubtitleColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerIndexSubtitleColor ?? 'texteFort'
    ),
    headerIndexLabelSize: pick(record.headerIndexLabelSize, INFO_HEADER_TITLE_SIZES, base.headerIndexLabelSize ?? 'md'),
    headerIndexLabelWeight: pick(
      record.headerIndexLabelWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerIndexLabelWeight ?? 'regular'
    ),
    headerIndexTitleSize: pick(record.headerIndexTitleSize, INFO_HEADER_TITLE_SIZES, base.headerIndexTitleSize ?? 'md'),
    headerIndexTitleWeight: pick(
      record.headerIndexTitleWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerIndexTitleWeight ?? 'regular'
    ),
    headerIndexSubtitleSize: pick(
      record.headerIndexSubtitleSize,
      INFO_HEADER_TITLE_SIZES,
      base.headerIndexSubtitleSize ?? 'md'
    ),
    headerIndexSubtitleWeight: pick(
      record.headerIndexSubtitleWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerIndexSubtitleWeight ?? 'regular'
    ),
    headerMarqueeWord1Text:
      typeof record.headerMarqueeWord1Text === 'string'
        ? record.headerMarqueeWord1Text
        : (base.headerMarqueeWord1Text ?? ''),
    headerMarqueeWord2Text:
      typeof record.headerMarqueeWord2Text === 'string'
        ? record.headerMarqueeWord2Text
        : (base.headerMarqueeWord2Text ?? ''),
    headerMarqueeWord3Text:
      typeof record.headerMarqueeWord3Text === 'string'
        ? record.headerMarqueeWord3Text
        : (base.headerMarqueeWord3Text ?? ''),
    headerMarqueeWord4Text:
      typeof record.headerMarqueeWord4Text === 'string'
        ? record.headerMarqueeWord4Text
        : (base.headerMarqueeWord4Text ?? ''),
    headerMarqueeWordColor: pick(
      record.headerMarqueeWordColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerMarqueeWordColor ?? 'principal'
    ),
    headerMarqueeSize: pick(record.headerMarqueeSize, INFO_HEADER_TITLE_SIZES, base.headerMarqueeSize ?? 'md'),
    headerChapterIndexText:
      typeof record.headerChapterIndexText === 'string'
        ? record.headerChapterIndexText
        : (base.headerChapterIndexText ?? ''),
    headerChapterTitleText:
      typeof record.headerChapterTitleText === 'string'
        ? record.headerChapterTitleText
        : (base.headerChapterTitleText ?? ''),
    headerChapterIndexColor: pick(
      record.headerChapterIndexColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerChapterIndexColor ?? 'principal'
    ),
    headerChapterTitleColor: pick(
      record.headerChapterTitleColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerChapterTitleColor ?? 'texteFort'
    ),
    headerChapterTitleSize: pick(
      record.headerChapterTitleSize,
      INFO_HEADER_TITLE_SIZES,
      base.headerChapterTitleSize ?? 'md'
    ),
    headerChapterTitleWeight: pick(
      record.headerChapterTitleWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerChapterTitleWeight ?? 'regular'
    ),
    headerCoverLine1Text:
      typeof record.headerCoverLine1Text === 'string'
        ? record.headerCoverLine1Text
        : (base.headerCoverLine1Text ?? ''),
    headerCoverLine2Text:
      typeof record.headerCoverLine2Text === 'string'
        ? record.headerCoverLine2Text
        : (base.headerCoverLine2Text ?? ''),
    headerCoverLine3Text:
      typeof record.headerCoverLine3Text === 'string'
        ? record.headerCoverLine3Text
        : (base.headerCoverLine3Text ?? ''),
    headerCoverHeadlineColor: pick(
      record.headerCoverHeadlineColor,
      INFO_HEADER_PALETTE_TOKENS,
      base.headerCoverHeadlineColor ?? 'texteFort'
    ),
    headerCoverHeadlineSize: pick(
      record.headerCoverHeadlineSize,
      INFO_HEADER_TITLE_SIZES,
      base.headerCoverHeadlineSize ?? 'md'
    ),
    headerCoverHeadlineWeight: pick(
      record.headerCoverHeadlineWeight,
      INFO_HEADER_TITLE_WEIGHTS,
      base.headerCoverHeadlineWeight ?? 'regular'
    ),
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    colorModeOverride: mergeSectionColorMode(record.colorModeOverride, base.colorModeOverride),
  };
}
