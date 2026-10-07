import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  mergeSectionColorMode,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';
import {
  isPortfolioListMarkerSize,
  isPortfolioListMarkerSource,
  isPortfolioListMarkerStyle,
  isPortfolioListMarkerWeight,
  clampListMarkerSizePx,
  clampListMarkerWeightAmount,
  LIST_MARKER_SIZE_PRESET_PX,
  LIST_MARKER_WEIGHT_PRESET_AMOUNT,
  type PortfolioListMarkerSize,
  type PortfolioListMarkerSource,
  type PortfolioListMarkerStyle,
  type PortfolioListMarkerWeight,
} from '@/components/portfolio/portfolio-list-marker';
import {
  DEFAULT_FAQ_COLOR_BINDINGS,
  DEFAULT_FAQ_PALETTE,
  applyFaqPaletteToSettings,
  mergeFaqColorBindings,
  mergeFaqPalette,
  type PortfolioFaqColorBindings,
  type PortfolioFaqPalette,
} from '@/components/portfolio/portfolio-faq-palette-settings';
import {
  DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  mergeServicesCardBackgroundSettings,
  type PortfolioServicesCardBackgroundSettings,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  servicesCardPaddingClass,
  servicesCardRadiusClass,
  type PortfolioServicesCardBorder,
  type PortfolioServicesCardPadding,
  type PortfolioServicesCardRadius,
} from '@/components/portfolio/portfolio-services-settings';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import { createElementTextStyle, normalizeElementStylesRecord, type PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';
import { normalizeDesignLayouts, type DesignLayout } from '@/components/portfolio/portfolio-design-layout-core';
import {
  DEFAULT_FAQ_FRAME,
  normalizeFaqFrame,
  type PortfolioFaqFrameSettings,
} from '@/components/portfolio/portfolio-faq-frame';
import {
  FAQ_HEADER_DESIGNS,
  FAQ_HEADER_DESIGNS_SELECTABLE,
  type PortfolioFaqHeaderDesignSelectable,
  FAQ_HEADER_MARGIN_BOTTOM_STEPS,
  FAQ_HEADER_TITLE_SIZES,
  FAQ_HEADER_TITLE_WEIGHTS,
  FAQ_HEADER_EDITORIAL_TITLE_WEIGHTS,
  FAQ_HEADER_PALETTE_TOKENS,
  FAQ_HEADER_ACCENT_COUNT_ALIGNMENTS,
  FAQ_HEADER_BILLBOARD_WORD_STYLES,
  faqHeaderPaletteTokenColor,
  type PortfolioFaqHeaderDesign,
  type PortfolioFaqHeaderDesignAlignment,
  type PortfolioFaqHeaderMarginBottom,
  type PortfolioFaqHeaderTitleSize,
  type PortfolioFaqHeaderTitleWeight,
  type PortfolioFaqHeaderEditorialTitleWeight,
  type PortfolioFaqHeaderPaletteToken,
  type PortfolioFaqHeaderAccentCountAlignment,
  type PortfolioFaqHeaderBillboardWordStyle,
} from '@/components/portfolio/portfolio-faq-header-settings';

export {
  type PortfolioFaqHeaderDesign,
  type PortfolioFaqHeaderDesignAlignment,
  type PortfolioFaqHeaderMarginBottom,
  type PortfolioFaqHeaderTitleSize,
  type PortfolioFaqHeaderTitleWeight,
  type PortfolioFaqHeaderPaletteToken,
  type PortfolioFaqHeaderAccentCountAlignment,
  type PortfolioFaqHeaderBillboardWordStyle,
} from '@/components/portfolio/portfolio-faq-header-settings';

export type PortfolioFaqTitlePreset =
  | 'faq'
  | 'frequently-asked'
  | 'questions'
  | 'common-questions'
  | 'q-and-a'
  | 'custom';

export type PortfolioFaqSubtitlePreset = 'default' | 'short' | 'reassurance' | 'minimal' | 'custom';

export type PortfolioFaqHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioFaqHeaderAlignment = 'left' | 'center' | 'right';

/** How the section title relates to the FAQ list. */
export type PortfolioFaqSectionLayout = 'stacked' | 'aside-left' | 'aside-right';

/** Ready-to-use FAQ section layouts. Item design stays independently switchable. */
export type PortfolioFaqDesign =
  | 'kinetic-split'
  | 'floating-gallery'
  | 'editorial-masonry'
  | 'prism-cards'
  | 'star-scroll'
  | 'tri-grid'
  | 'split-index'
  | 'centered-focus'
  | 'bento-dual';

/** Bento Dual design — palette token driving the card fill, replacing the old
 *  hardcoded/"raw" Secondary-only color. */
export type PortfolioFaqBentoDualCardColorToken = 'principal' | 'secondaire' | 'neutre' | 'texteMuted';
export type PortfolioFaqBentoDualCardRadius = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioFaqBentoDualCardBorder = 'none' | 'soft' | 'solid';

export const PORTFOLIO_FAQ_BENTO_DUAL_CARD_COLOR_OPTIONS: {
  value: PortfolioFaqBentoDualCardColorToken;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: 'Principal', description: 'Primary accent token.' },
  { value: 'secondaire', label: 'Secondary', description: 'Secondary accent token (previous default).' },
  { value: 'neutre', label: 'Neutral', description: 'Neutral surface token.' },
  { value: 'texteMuted', label: 'Muted', description: 'Muted text token, softened.' },
];

export const PORTFOLIO_FAQ_BENTO_DUAL_CARD_RADIUS_OPTIONS: {
  value: PortfolioFaqBentoDualCardRadius;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'S', description: 'Light rounding.' },
  { value: 'md', label: 'M', description: 'Default rounding.' },
  { value: 'lg', label: 'L', description: 'Generous rounding.' },
  { value: 'xl', label: 'XL', description: 'Very rounded.' },
];

export const PORTFOLIO_FAQ_BENTO_DUAL_CARD_BORDER_OPTIONS: {
  value: PortfolioFaqBentoDualCardBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No border.' },
  { value: 'soft', label: 'Soft', description: 'Thin hairline, blended into the card color (default).' },
  { value: 'solid', label: 'Solid', description: 'Crisper, more visible line.' },
];

const PORTFOLIO_FAQ_BENTO_DUAL_CARD_COLOR_TOKENS: PortfolioFaqBentoDualCardColorToken[] = [
  'principal',
  'secondaire',
  'neutre',
  'texteMuted',
];
const PORTFOLIO_FAQ_BENTO_DUAL_CARD_RADII: PortfolioFaqBentoDualCardRadius[] = ['sm', 'md', 'lg', 'xl'];
const PORTFOLIO_FAQ_BENTO_DUAL_CARD_BORDERS: PortfolioFaqBentoDualCardBorder[] = ['none', 'soft', 'solid'];

export type PortfolioFaqPanelShadow = 'none' | 'soft' | 'medium' | 'strong';

export type PortfolioFaqItemDesign =
  | 'editorial'
  | 'minimal'
  | 'bordered'
  | 'accent'
  | 'pill'
  | 'compact'
  | 'two-column'
  | 'numbered-rail'
  | 'raised';

export type PortfolioFaqItemGap = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioFaqListMaxWidth = 'narrow' | 'default' | 'wide' | 'full';
export type PortfolioFaqListPlacement = 'left' | 'center' | 'right';

export type PortfolioFaqTextSize = 'sm' | 'md' | 'lg';

/**
 * Global type-size control for all 9 "fixed-identity" premium FAQ designs (Kinetic Split,
 * Floating Gallery, Editorial Masonry, Prism Cards, Star Scroll, Tri Grid, Split Index,
 * Centered Focus, Bento Dual) — unlike `questionSize`/`answerSize` above (a legacy
 * per-element pair from the old non-premium item-style system, currently unused by any
 * renderer), this is ONE unified scale every premium design reads together, via a single
 * `--pf-faq-font-scale` CSS custom property each design sets on its own root from
 * `faqPremiumFontScale(presentation.premiumFontSize)`, multiplying every one of its own
 * font-size declarations in `globals.css` (`calc(<base> * var(--pf-faq-font-scale, 1))`).
 * `medium` is each design's own current baseline size — `small`/`large` scale relative to
 * that, not to some other absolute reference.
 */
export type PortfolioFaqPremiumFontSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

/**
 * General → Text colors: one palette token for the questions and one for the answers of every
 * FAQ design. `auto` (default) keeps each design's own tuned colors, so nothing changes until a
 * creator picks one; the three tokens are FAQ's palette-token set (Principal / Secondary /
 * Strong text), resolved live through `--pf-palette-*` like the Header and Frame colors.
 */
export type PortfolioFaqTextColorToken = 'auto' | PortfolioFaqHeaderPaletteToken;

export type PortfolioFaqExpandIconStyle = 'plus' | 'chevron';

export type PortfolioFaqContentAlign = 'left' | 'center' | 'right';

/** Decorative FAQ illustration beside the list. */
export type PortfolioFaqIllustrationVariant =
  | 'none'
  | 'chat'
  | 'question'
  | 'docs'
  | 'support'
  | 'hex';

export type PortfolioFaqIllustrationPlacement = 'left' | 'right';

/** Which FAQ text element can be styled independently (color, font, size, weight). */
type PortfolioFaqStyleTarget = 'question' | 'answer' | 'number';

export type PortfolioFaqElementStyles = Record<PortfolioFaqStyleTarget, PortfolioElementTextStyle>;

export type PortfolioFaqPresentationSettings = PortfolioSectionBackgroundSettings &
  PortfolioServicesCardBackgroundSettings & {
  titlePreset: PortfolioFaqTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioFaqSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioFaqHeaderFont;
  subtitleFont: PortfolioFaqHeaderFont;
  titleColor: string;
  subtitleColor: string;
  titleUppercase: boolean;
  subtitleUppercase: boolean;
  headerAlignment: PortfolioFaqHeaderAlignment;
  /**
   * `stacked` — title above the list (default).
   * `aside-left` / `aside-right` — title beside the list on large screens.
   */
  sectionLayout: PortfolioFaqSectionLayout;
  /** Ready-to-use section layout (header + default item arrangement). */
  design: PortfolioFaqDesign;
  itemDesign: PortfolioFaqItemDesign;
  itemGap: PortfolioFaqItemGap;
  listMaxWidth: PortfolioFaqListMaxWidth;
  listPlacement: PortfolioFaqListPlacement;
  itemAlign: PortfolioFaqContentAlign;
  panelShadow: PortfolioFaqPanelShadow;
  panelShadowIntensity: number;
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
  accentColor: string;
  questionFont: PortfolioFaqHeaderFont;
  answerFont: PortfolioFaqHeaderFont;
  questionColor: string;
  answerColor: string;
  questionSize: PortfolioFaqTextSize;
  answerSize: PortfolioFaqTextSize;
  numberColor: string;
  expandIconStyle: PortfolioFaqExpandIconStyle;
  expandIconColor: string;
  answerAccentBorderColor: string;
  showItemNumbers: boolean;
  /** Global task bullets vs FAQ-only override (same system as Experience / Services). */
  itemMarkerSource: PortfolioListMarkerSource;
  itemMarkerStyle: PortfolioListMarkerStyle;
  itemMarkerColor: string;
  itemMarkerSize: PortfolioListMarkerSize;
  itemMarkerSizePx: number;
  itemMarkerWeight: PortfolioListMarkerWeight;
  itemMarkerWeightAmount: number;
  showAnswerAccentBorder: boolean;
  showExpandIcon: boolean;
  /**
   * When false, every question stays open and cannot collapse
   * (static Q&A list instead of accordion).
   */
  expandable: boolean;
  /**
   * When true (and expandable), opening one answer closes any other open item.
   */
  accordionExclusive: boolean;
  /**
   * Decorative SVG beside the FAQ list (`none` hides it).
   */
  illustrationVariant: PortfolioFaqIllustrationVariant;
  /** Side of the list for the decorative SVG on large screens. */
  illustrationPlacement: PortfolioFaqIllustrationPlacement;
  /**
   * When true, answers share the same left edge as the question text
   * (no extra indent under the row).
   */
  answerFlushWithQuestion: boolean;
  /** When true, section colors follow the Hero semantic palette. */
  useHeroPalette: boolean;
  /** User override — 'auto' (default) follows Global → Theme's site-wide mode. */
  colorModeOverride: PortfolioSectionColorMode;
  /** Type-size scale applied uniformly across every premium FAQ design (General tab). */
  premiumFontSize: PortfolioFaqPremiumFontSize;
  /** General tab → Text colors: question ink for every design (`auto` = the design's own). */
  questionColorToken: PortfolioFaqTextColorToken;
  /** General tab → Text colors: answer ink for every design (`auto` = the design's own). */
  answerColorToken: PortfolioFaqTextColorToken;
  /** General tab → Frame: opt-in outer frame around whichever design is active
   *  (see portfolio-faq-frame.ts — the designs themselves draw no stage). */
  designFrame: PortfolioFaqFrameSettings;
  /** FAQ-owned palette copy (same 8 tokens as Hero). */
  faqPalette?: PortfolioFaqPalette;
  /** Which token each FAQ color slot uses. */
  faqColorBindings?: PortfolioFaqColorBindings;
  /** Per-element color, font, size, and weight for question, answer, and item number. */
  elementStyles: PortfolioFaqElementStyles;

  // ---- Header — one shared, GSAP-animated header design mounted above the
  // section (Editorial/Marquee/Index/Accent count/Serif lead/Billboard/
  // Masthead/Split heading), independent of the Design tab's own layout. ----
  headerDesign: PortfolioFaqHeaderDesign;
  /** Respects reduced-motion preference regardless of this toggle. */
  headerAnimationEnabled: boolean;
  headerDesignAlignment: PortfolioFaqHeaderDesignAlignment;
  headerMarginBottom: PortfolioFaqHeaderMarginBottom;
  headerTitleSize: PortfolioFaqHeaderTitleSize;
  /** Only Editorial reads this — hence its 5-step scale (see FAQ_HEADER_EDITORIAL_TITLE_WEIGHTS). */
  headerTitleWeight: PortfolioFaqHeaderEditorialTitleWeight;
  /** Header tab → Layout settings, stored per selectable header design
   *  (see portfolio-faq-header-layout.ts). */
  headerLayouts: Partial<Record<PortfolioFaqHeaderDesignSelectable, DesignLayout>>;

  headerAccentCountBadgeText: string;
  headerAccentCountLeadText: string;
  headerAccentCountBadgeColor: PortfolioFaqHeaderPaletteToken;
  headerAccentCountLeadColor: PortfolioFaqHeaderPaletteToken;
  headerAccentCountSize: PortfolioFaqHeaderTitleSize;
  headerAccentCountWeight: PortfolioFaqHeaderTitleWeight;
  headerAccentCountAlignment: PortfolioFaqHeaderAccentCountAlignment;

  headerSerifLeadLabelText: string;
  headerSerifLeadTitleText: string;
  headerSerifLeadLabelColor: PortfolioFaqHeaderPaletteToken;
  headerSerifLeadTitleColor: PortfolioFaqHeaderPaletteToken;
  headerSerifLeadSubtitleColor: PortfolioFaqHeaderPaletteToken;
  headerSerifLeadLabelSize: PortfolioFaqHeaderTitleSize;
  headerSerifLeadTitleSize: PortfolioFaqHeaderTitleSize;
  headerSerifLeadSubtitleSize: PortfolioFaqHeaderTitleSize;
  headerSerifLeadLabelWeight: PortfolioFaqHeaderTitleWeight;
  headerSerifLeadTitleWeight: PortfolioFaqHeaderTitleWeight;
  headerSerifLeadSubtitleWeight: PortfolioFaqHeaderTitleWeight;

  headerBillboardBigWord: string;
  headerBillboardCountText: string;
  headerBillboardTitleText: string;
  headerBillboardWordStyle: PortfolioFaqHeaderBillboardWordStyle;
  headerBillboardWordColor: PortfolioFaqHeaderPaletteToken;
  headerBillboardTitleColor: PortfolioFaqHeaderPaletteToken;
  headerBillboardMetaColor: PortfolioFaqHeaderPaletteToken;

  headerSplitHeadingLabelText: string;
  headerSplitHeadingTitleText: string;
  headerSplitHeadingTitleColor: PortfolioFaqHeaderPaletteToken;
  headerSplitHeadingLabelColor: PortfolioFaqHeaderPaletteToken;
  headerSplitHeadingTitleSize: PortfolioFaqHeaderTitleSize;
  headerSplitHeadingTitleWeight: PortfolioFaqHeaderTitleWeight;
  headerSplitHeadingLabelSize: PortfolioFaqHeaderTitleSize;
  headerSplitHeadingLabelWeight: PortfolioFaqHeaderTitleWeight;

  headerMastheadLine1Text: string;
  headerMastheadLine2Text: string;
  headerMastheadLine3Text: string;
  headerMastheadHeadlineColor: PortfolioFaqHeaderPaletteToken;
  headerMastheadHeadlineSize: PortfolioFaqHeaderTitleSize;
  headerMastheadHeadlineWeight: PortfolioFaqHeaderTitleWeight;

  headerIndexLabelText: string;
  headerIndexTitleText: string;
  headerIndexCountLabelText: string;
  headerIndexSubtitleText: string;
  headerIndexLabelColor: PortfolioFaqHeaderPaletteToken;
  headerIndexNumberColor: PortfolioFaqHeaderPaletteToken;
  headerIndexTitleColor: PortfolioFaqHeaderPaletteToken;
  headerIndexSubtitleColor: PortfolioFaqHeaderPaletteToken;
  headerIndexLabelSize: PortfolioFaqHeaderTitleSize;
  headerIndexLabelWeight: PortfolioFaqHeaderTitleWeight;
  headerIndexTitleSize: PortfolioFaqHeaderTitleSize;
  headerIndexTitleWeight: PortfolioFaqHeaderTitleWeight;
  headerIndexSubtitleSize: PortfolioFaqHeaderTitleSize;
  headerIndexSubtitleWeight: PortfolioFaqHeaderTitleWeight;

  headerMarqueeWord1Text: string;
  headerMarqueeWord2Text: string;
  headerMarqueeWord3Text: string;
  headerMarqueeWord4Text: string;
  headerMarqueeWordColor: PortfolioFaqHeaderPaletteToken;
  headerMarqueeSize: PortfolioFaqHeaderTitleSize;

  /** Bento Dual design — which palette token fills the card (replaces the old
   *  hardcoded/"raw" Secondary-only fill). */
  bentoDualCardColorToken: PortfolioFaqBentoDualCardColorToken;
  bentoDualCardRadius: PortfolioFaqBentoDualCardRadius;
  bentoDualCardBorder: PortfolioFaqBentoDualCardBorder;
  /** 0–100 — how much of the card's fill color shows through against the section
   *  background (blended via `color-mix`, not raw CSS `opacity`, so the question/
   *  answer text layers stay fully legible regardless of this value). */
  bentoDualCardOpacity: number;
};

export type PortfolioFaqSectionSettings = PortfolioSectionCopy & PortfolioFaqPresentationSettings;

const DEFAULT_FAQ_TITLE_COLOR = '#0a0a0a';
const DEFAULT_FAQ_SUBTITLE_COLOR = '#737373';
const DEFAULT_FAQ_ACCENT_COLOR = '#f97316';
const DEFAULT_FAQ_QUESTION_COLOR = '#0a0a0a';
const DEFAULT_FAQ_ANSWER_COLOR = '#525252';
const DEFAULT_FAQ_NUMBER_COLOR = '#f97316';
const DEFAULT_FAQ_CARD_BORDER_COLOR = '#e5e5e5';
const DEFAULT_FAQ_CARD_BACKGROUND_COLOR = '#ffffff';

const FAQ_ITEM_DESIGNS = [
  'editorial',
  'minimal',
  'bordered',
  'accent',
  'pill',
  'compact',
  'two-column',
  'numbered-rail',
  'raised',
] as const;

const FAQ_DESIGNS = [
  'kinetic-split',
  'floating-gallery',
  'editorial-masonry',
  'prism-cards',
  'star-scroll',
  'tri-grid',
  'split-index',
  'centered-focus',
  'bento-dual',
] as const;

const FAQ_STYLE_TARGET_IDS: PortfolioFaqStyleTarget[] = ['question', 'answer', 'number'];

const DEFAULT_FAQ_ELEMENT_STYLES: PortfolioFaqElementStyles = {
  question: createElementTextStyle({
    color: DEFAULT_FAQ_QUESTION_COLOR,
    font: 'sans',
    size: 'md',
    weight: 'semibold',
  }),
  answer: createElementTextStyle({
    color: DEFAULT_FAQ_ANSWER_COLOR,
    font: 'sans',
    size: 'md',
  }),
  number: createElementTextStyle({
    color: DEFAULT_FAQ_NUMBER_COLOR,
    font: 'sans',
    size: 'sm',
    bold: true,
  }),
};

export const DEFAULT_FAQ_PRESENTATION: PortfolioFaqPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  titlePreset: 'frequently-asked',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'sans',
  titleColor: DEFAULT_FAQ_TITLE_COLOR,
  subtitleColor: DEFAULT_FAQ_SUBTITLE_COLOR,
  titleUppercase: false,
  subtitleUppercase: false,
  headerAlignment: 'left',
  sectionLayout: 'stacked',
  design: 'kinetic-split',
  itemDesign: 'two-column',
  itemGap: 'md',
  listMaxWidth: 'wide',
  listPlacement: 'center',
  itemAlign: 'left',
  panelShadow: 'medium',
  panelShadowIntensity: 55,
  cardBorder: 'soft',
  cardBorderColor: DEFAULT_FAQ_CARD_BORDER_COLOR,
  cardBackgroundEnabled: true,
  cardBackgroundColor: DEFAULT_FAQ_CARD_BACKGROUND_COLOR,
  cardBorderRadius: 'xl',
  cardPadding: 'lg',
  accentColor: DEFAULT_FAQ_ACCENT_COLOR,
  questionFont: 'sans',
  answerFont: 'sans',
  questionColor: DEFAULT_FAQ_QUESTION_COLOR,
  answerColor: DEFAULT_FAQ_ANSWER_COLOR,
  questionSize: 'md',
  answerSize: 'md',
  numberColor: DEFAULT_FAQ_NUMBER_COLOR,
  expandIconStyle: 'plus',
  expandIconColor: '#737373',
  answerAccentBorderColor: DEFAULT_FAQ_ACCENT_COLOR,
  showItemNumbers: false,
  itemMarkerSource: 'section',
  itemMarkerStyle: 'number',
  itemMarkerColor: DEFAULT_FAQ_NUMBER_COLOR,
  itemMarkerSize: 'md',
  itemMarkerSizePx: LIST_MARKER_SIZE_PRESET_PX.md,
  itemMarkerWeight: 'bold',
  itemMarkerWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.bold,
  showAnswerAccentBorder: false,
  showExpandIcon: true,
  expandable: true,
  accordionExclusive: true,
  illustrationVariant: 'none',
  illustrationPlacement: 'right',
  answerFlushWithQuestion: true,
  useHeroPalette: true,
  colorModeOverride: 'auto',
  premiumFontSize: 'medium',
  questionColorToken: 'auto',
  answerColorToken: 'auto',
  designFrame: { ...DEFAULT_FAQ_FRAME },
  faqPalette: { ...DEFAULT_FAQ_PALETTE },
  faqColorBindings: { ...DEFAULT_FAQ_COLOR_BINDINGS },
  elementStyles: DEFAULT_FAQ_ELEMENT_STYLES,

  headerDesign: 'editorial',
  headerAnimationEnabled: true,
  headerDesignAlignment: 'left',
  headerMarginBottom: 'md',
  headerTitleSize: 'md',
  headerTitleWeight: 'regular',
  headerLayouts: {},

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

  bentoDualCardColorToken: 'secondaire',
  bentoDualCardRadius: 'md',
  bentoDualCardBorder: 'soft',
  bentoDualCardOpacity: 100,
};

Object.assign(
  DEFAULT_FAQ_PRESENTATION,
  applyFaqPaletteToSettings({
    faqPalette: DEFAULT_FAQ_PALETTE,
    faqColorBindings: DEFAULT_FAQ_COLOR_BINDINGS,
    elementStyles: DEFAULT_FAQ_ELEMENT_STYLES,
  })
);

function isPortfolioFaqSectionLayout(value: unknown): value is PortfolioFaqSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

const FAQ_PREMIUM_FONT_SIZES: PortfolioFaqPremiumFontSize[] = [
  'small',
  'medium',
  'large',
  'xlarge',
  'xxlarge',
];

export const PORTFOLIO_FAQ_PREMIUM_FONT_SIZE_OPTIONS: {
  value: PortfolioFaqPremiumFontSize;
  label: string;
  description: string;
}[] = [
  { value: 'small', label: 'Small', description: 'Compact type across every FAQ design.' },
  { value: 'medium', label: 'Medium', description: 'Default, balanced type size.' },
  { value: 'large', label: 'Large', description: 'Bigger type for maximum readability.' },
  { value: 'xlarge', label: 'Extra Large', description: 'Extra large type for a bold, high-impact look.' },
  {
    value: 'xxlarge',
    label: 'Super Extra Large',
    description: 'Maximum type size for the most dramatic, oversized look.',
  },
];

/** Multiplier each premium FAQ design's own base font-size (its `medium` value) is scaled
 *  by, via `calc(<base> * var(--pf-faq-font-scale, 1))` in globals.css. */
const FAQ_PREMIUM_FONT_SCALE: Record<PortfolioFaqPremiumFontSize, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
  xlarge: 1.3,
  xxlarge: 1.45,
};

export function faqPremiumFontScale(size: PortfolioFaqPremiumFontSize): number {
  return FAQ_PREMIUM_FONT_SCALE[size] ?? 1;
}

export const FAQ_TEXT_COLOR_TOKENS: PortfolioFaqTextColorToken[] = ['auto', ...FAQ_HEADER_PALETTE_TOKENS];

/**
 * CSS custom properties for General → Text colors, set once on the wrapper around whichever
 * design is active. Every design's question/answer rule reads `var(--pf-faq-q-color, <its own>)`
 * / `var(--pf-faq-a-color, <its own>)`, so `auto` (nothing set) leaves each design untouched.
 */
export function faqTextColorVars(
  presentation: Pick<PortfolioFaqPresentationSettings, 'questionColorToken' | 'answerColorToken'>
): CSSProperties | undefined {
  const question = presentation.questionColorToken ?? 'auto';
  const answer = presentation.answerColorToken ?? 'auto';
  if (question === 'auto' && answer === 'auto') return undefined;
  const vars: Record<string, string> = {};
  if (question !== 'auto') vars['--pf-faq-q-color'] = faqHeaderPaletteTokenColor(question);
  if (answer !== 'auto') {
    vars['--pf-faq-a-color'] = faqHeaderPaletteTokenColor(answer);
    // Bento Dual prints its answers on an inverted face. A palette text color is only
    // guaranteed to read on the palette's own background, so that face follows it.
    vars['--pf-faq-a-surface'] = 'var(--pf-palette-fond, #0a0a0a)';
  }
  return vars as CSSProperties;
}

export const PORTFOLIO_FAQ_DESIGN_OPTIONS: {
  value: PortfolioFaqDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'kinetic-split',
    label: 'Kinetic split',
    description: 'Boxless, monochrome: fixed title left, questions right — hover sharpens one, fades the rest.',
  },
  {
    value: 'floating-gallery',
    label: 'Floating gallery',
    description: 'Boxless, monochrome: a cursor-borne shape and a frosted glass panel replace every card.',
  },
  {
    value: 'editorial-masonry',
    label: 'Editorial masonry',
    description: 'Paper-white, boxless: an asymmetric offset two-column grid — hover isolates one question, blurs the rest.',
  },
  {
    value: 'prism-cards',
    label: 'Prism cards',
    description: 'Big white accordion cards — the open card liquid-fades to a violet-electric fill from the click point.',
  },
  {
    value: 'star-scroll',
    label: 'Star scroll',
    description: 'Giant title left, an 8-point star right that spins with page scroll — bars melt into the stage until hovered.',
  },
  {
    value: 'tri-grid',
    label: 'Tri grid',
    description: 'Iconless, borderless: three parallax columns (center offset and slower) — hover isolates one block, blurs the rest.',
  },
  {
    value: 'split-index',
    label: 'Split index',
    description: 'Giant title, a narrow index rail beside a hairline-divided list with filled 01/02/03 badges.',
  },
  {
    value: 'centered-focus',
    label: 'Centered focus',
    description: 'Borderless, centered list resting at low opacity — hover snaps one question into focus and a soft zoom.',
  },
  {
    value: 'bento-dual',
    label: 'Bento dual',
    description: 'Vivid bento cards that flip on hover — the question slides away as a contrasting answer panel rises in.',
  },
];

function isPortfolioFaqDesign(value: unknown): value is PortfolioFaqDesign {
  return (FAQ_DESIGNS as readonly string[]).includes(String(value));
}

const PORTFOLIO_FAQ_PANEL_SHADOW_PRESET_INTENSITY: Record<PortfolioFaqPanelShadow, number> = {
  none: 0,
  soft: 28,
  medium: 55,
  strong: 82,
};

function isPortfolioFaqPanelShadow(value: unknown): value is PortfolioFaqPanelShadow {
  return value === 'none' || value === 'soft' || value === 'medium' || value === 'strong';
}

function clampFaqPanelShadowIntensity(value: unknown, fallback = 55): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function defaultsForFaqDesign(design: PortfolioFaqDesign): Partial<PortfolioFaqPresentationSettings> {
  // All nine designs are bespoke, self-contained (see each component's own
  // portfolio-faq-*.tsx file) that render their own canvas and ignore the generic
  // itemDesign/card/illustration fields entirely — only the shared Header block
  // (title/subtitle text) and section layout still apply.
  return {
    design,
    sectionLayout: 'stacked',
    headerAlignment:
      design === 'floating-gallery' || design === 'prism-cards' || design === 'centered-focus'
        ? 'center'
        : 'left',
    titlePreset: 'frequently-asked',
    titleUppercase: false,
    subtitlePreset: 'default',
    expandable: true,
    accordionExclusive: true,
  };
}

export function faqSectionLayoutIsAside(layout: PortfolioFaqSectionLayout | undefined): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

const SUBTITLE_PRESET_COPY: Record<
  Exclude<PortfolioFaqSubtitlePreset, 'default' | 'custom' | 'minimal'>,
  string
> = {
  short: 'Quick answers to common questions before we start working together.',
  reassurance: 'Everything you need to know — clear, honest, and upfront.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

export function resolveFaqSectionTitle(
  settings: Pick<PortfolioFaqSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  const raw = (() => {
    switch (settings.titlePreset) {
      case 'frequently-asked':
        return 'Frequently Asked Questions';
      case 'questions':
        return 'QUESTIONS';
      case 'common-questions':
        return 'COMMON QUESTIONS';
      case 'q-and-a':
        return 'Q & A';
      case 'custom':
        return settings.titleCustom.trim() || settings.title.trim() || 'FAQ';
      default:
        return 'FAQ';
    }
  })();
  return portfolioSectionTitleSentenceCase(raw);
}

export function resolveFaqSectionSubtitle(
  settings: Pick<PortfolioFaqSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'reassurance':
      return SUBTITLE_PRESET_COPY.reassurance;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function faqHeaderFontClass(font: PortfolioFaqHeaderFont, kind: 'title' | 'subtitle'): string {
  if (kind === 'title') {
    switch (font) {
      case 'serif':
        return 'font-serif font-bold tracking-[-0.03em]';
      case 'display':
        return 'font-black uppercase tracking-[0.08em]';
      default:
        return 'font-extrabold tracking-[-0.04em]';
    }
  }
  switch (font) {
    case 'serif':
      return 'font-serif leading-relaxed';
    case 'display':
      return 'font-bold uppercase tracking-[0.1em]';
    default:
      return 'leading-relaxed';
  }
}

export function faqTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FAQ_TITLE_COLOR) };
}

export function faqSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FAQ_SUBTITLE_COLOR) };
}

export function faqListMaxWidthClass(width: PortfolioFaqListMaxWidth): string {
  switch (width) {
    case 'narrow':
      return 'max-w-2xl';
    case 'wide':
      return 'max-w-5xl';
    case 'full':
      return 'max-w-none';
    default:
      return 'max-w-3xl';
  }
}

export function faqListPlacementClass(placement: PortfolioFaqListPlacement): string {
  switch (placement) {
    case 'left':
      return 'mr-auto ml-0';
    case 'right':
      return 'ml-auto mr-0';
    default:
      return 'mx-auto';
  }
}

function faqItemGapClass(gap: PortfolioFaqItemGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-2';
    case 'lg':
      return 'gap-7 sm:gap-9';
    case 'xl':
      return 'gap-10 sm:gap-14';
    default:
      return 'gap-4 sm:gap-5';
  }
}

function faqCardBorderWidthClass(border: PortfolioServicesCardBorder): string {
  switch (border) {
    case 'soft':
      return 'border';
    case 'solid':
    case 'accent':
      return 'border-2';
    default:
      return 'border-0';
  }
}

export function faqFrameClass(p: PortfolioFaqPresentationSettings): string {
  const parts = [servicesCardRadiusClass(p.cardBorderRadius), servicesCardPaddingClass(p.cardPadding)];
  if (p.cardBorder !== 'none') {
    parts.push(faqCardBorderWidthClass(p.cardBorder));
    if (p.cardBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

/**
 * Per-item chrome for card designs (bordered / pill / accent / two-column).
 * No padding — each item keeps its own summary padding so cards stay separate.
 */
export function faqSeparatedCardFrameClass(
  p: PortfolioFaqPresentationSettings,
  design: PortfolioFaqItemDesign
): string {
  const radius =
    design === 'pill'
      ? 'rounded-[1.75rem]'
      : design === 'raised'
        ? 'rounded-[1.15rem] sm:rounded-[1.35rem]'
        : servicesCardRadiusClass(p.cardBorderRadius);
  const parts = [radius, 'relative overflow-x-hidden'];
  if (design === 'raised') {
    parts.push(
      'border border-transparent bg-white shadow-[0_4px_16px_-8px_rgba(15,23,42,0.08)] transition-[border-color,box-shadow] duration-200 hover:border-[#F97316]/30 hover:shadow-[0_6px_20px_-10px_rgba(15,23,42,0.1)] dark:bg-[#0a0a0a] dark:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.35)] dark:hover:border-[#F97316]/30'
    );
  } else if (p.cardBorder !== 'none') {
    parts.push(faqCardBorderWidthClass(p.cardBorder));
    if (p.cardBorder === 'soft') {
      parts.push(
        design === 'two-column'
          ? ''
          : design === 'bordered' || design === 'accent'
            ? 'shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]'
            : 'shadow-sm'
      );
    }
  }
  if (design === 'two-column') {
    parts.push('h-fit transition-[background-color,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]');
  }
  return parts.filter(Boolean).join(' ');
}

/** Longhands only — mixing `borderColor` with `borderLeftColor` warns on React rerenders. */
function cssSideBorderColors(color: string): Pick<
  CSSProperties,
  'borderTopColor' | 'borderRightColor' | 'borderBottomColor' | 'borderLeftColor'
> {
  return {
    borderTopColor: color,
    borderRightColor: color,
    borderBottomColor: color,
    borderLeftColor: color,
  };
}

export function faqFrameStyle(
  p: PortfolioFaqPresentationSettings,
  design?: PortfolioFaqItemDesign
): CSSProperties {
  const style: CSSProperties = {};
  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_FAQ_CARD_BACKGROUND_COLOR);
  }
  if (design === 'raised') {
    // Raised cards own their border via hover/active classes — keep fill only.
    return style;
  }
  if (p.cardBorder === 'accent') {
    style.borderStyle = 'solid';
    Object.assign(style, cssSideBorderColors(sanitizeHex(p.accentColor, DEFAULT_FAQ_ACCENT_COLOR)));
  } else if (p.cardBorder === 'soft' || p.cardBorder === 'solid') {
    style.borderStyle = 'solid';
    Object.assign(
      style,
      cssSideBorderColors(sanitizeHex(p.cardBorderColor, DEFAULT_FAQ_CARD_BORDER_COLOR))
    );
  }
  return style;
}

export function faqContentAlignClass(align: PortfolioFaqContentAlign): {
  text: string;
  row: string;
  items: string;
} {
  switch (align) {
    case 'center':
      return { text: 'text-center', row: 'justify-center', items: 'items-center' };
    case 'right':
      return { text: 'text-right', row: 'justify-end', items: 'items-end' };
    default:
      return { text: 'text-left', row: 'justify-start', items: 'items-start' };
  }
}

export function faqListShellClass(
  design: PortfolioFaqItemDesign,
  gap: PortfolioFaqItemGap = 'md'
): string {
  const gapClass = faqItemGapClass(gap);

  if (design === 'two-column') {
    return `grid lg:grid-cols-2 ${gapClass} lg:gap-x-6`;
  }
  return `flex flex-col ${gapClass}`;
}

export function faqItemShellClass(
  design: PortfolioFaqItemDesign,
  gap: PortfolioFaqItemGap = 'md'
): string {
  const dividers = gap === 'sm';

  switch (design) {
    case 'bordered':
      return 'overflow-hidden rounded-[1.25rem] border bg-transparent shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] border-[color:var(--faq-item-border,#e5e5e5)]';
    case 'accent':
      return 'overflow-hidden rounded-[1.25rem] border bg-transparent shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] border-[color:var(--faq-item-border,#e5e5e5)]';
    case 'raised':
      return '';
    case 'pill':
      return 'overflow-hidden rounded-[1.75rem] bg-transparent';
    case 'numbered-rail':
      return '';
    case 'minimal':
      return dividers
        ? 'border-b border-[color:var(--faq-item-border,#e5e5e5)] last:border-b-0'
        : '';
    case 'compact':
      return dividers
        ? 'border-b border-[color:var(--faq-item-border,#e5e5e5)] last:border-b-0'
        : '';
    case 'two-column':
      return 'overflow-hidden rounded-[1.25rem] border bg-transparent shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] h-fit border-[color:var(--faq-item-border,#e5e5e5)]';
    default:
      // Editorial
      return dividers
        ? 'border-b border-[color:var(--faq-item-border,#e5e5e5)] last:border-b-0'
        : '';
  }
}

/** CSS var for item dividers / outlines — synced to Frame border / palette `bordure`. */
export function faqItemBorderCssVars(
  borderColor: string
): CSSProperties {
  return {
    ['--faq-item-border' as string]: sanitizeHex(borderColor, DEFAULT_FAQ_CARD_BORDER_COLOR),
  };
}

export function faqItemAccentStyle(
  design: PortfolioFaqItemDesign,
  accentColor: string
): CSSProperties | undefined {
  if (design !== 'accent') return undefined;
  const accent = sanitizeHex(accentColor, DEFAULT_FAQ_ACCENT_COLOR);
  return {
    borderLeftWidth: '4px',
    borderLeftColor: accent,
    backgroundImage: `linear-gradient(90deg, ${accent}10 0%, transparent 40%)`,
  };
}

export function faqAnswerBorderStyle(borderColor: string): CSSProperties {
  return {
    borderLeftWidth: '2px',
    borderLeftStyle: 'solid',
    borderLeftColor: sanitizeHex(borderColor, DEFAULT_FAQ_ACCENT_COLOR),
  };
}

export function faqExpandIconStyle(
  iconColor: string,
  accentColor: string,
  chrome?: { fill?: string; border?: string }
): { base: CSSProperties; open: CSSProperties } {
  const muted = sanitizeHex(iconColor, '#737373');
  const accent = sanitizeHex(accentColor, DEFAULT_FAQ_ACCENT_COLOR);
  const fill = sanitizeHex(chrome?.fill, DEFAULT_FAQ_CARD_BACKGROUND_COLOR);
  const border = sanitizeHex(chrome?.border, DEFAULT_FAQ_CARD_BORDER_COLOR);
  return {
    base: {
      color: muted,
      borderColor: border,
      backgroundColor: fill,
    },
    open: {
      color: accent,
      borderColor: `${accent}66`,
      backgroundColor: `${accent}22`,
    },
  };
}

/**
 * Row / card summary padding — same Frame `cardPadding` scale for every design.
 * `none` keeps a compact but usable default so rows never collapse.
 */
export function faqSummaryPaddingClass(
  design: PortfolioFaqItemDesign,
  cardPadding: PortfolioServicesCardPadding = 'md'
): string {
  const scale = cardPadding === 'none' ? 'sm' : cardPadding;

  const presets: Record<
    'sm' | 'md' | 'lg',
    { row: string; card: string; rail: string; compact: string; pill: string }
  > = {
    sm: {
      row: 'px-4 py-4 sm:px-5 sm:py-5',
      card: 'px-4 py-4 sm:px-5 sm:py-5',
      rail: 'py-1.5',
      compact: 'px-3 py-3 sm:px-4 sm:py-4',
      pill: 'px-4 py-3.5 sm:px-5 sm:py-4',
    },
    md: {
      row: 'px-5 py-6 sm:px-6 sm:py-7',
      card: 'px-5 py-5 sm:px-6 sm:py-6',
      rail: 'py-2',
      compact: 'px-4 py-4 sm:px-5 sm:py-5',
      pill: 'px-5 py-4 sm:px-6 sm:py-5',
    },
    lg: {
      row: 'px-6 py-7 sm:px-7 sm:py-8',
      card: 'px-6 py-6 sm:px-7 sm:py-7',
      rail: 'py-3',
      compact: 'px-5 py-5 sm:px-6 sm:py-6',
      pill: 'px-6 py-5 sm:px-7 sm:py-6',
    },
  };

  const pad = presets[scale];
  if (design === 'compact') return pad.compact;
  if (design === 'pill') return pad.pill;
  if (design === 'bordered' || design === 'accent' || design === 'two-column') return pad.card;
  if (design === 'numbered-rail') return pad.rail;
  return pad.row;
}

/** Horizontal padding only — mirrors {@link faqSummaryPaddingClass} so flush answers share the question edge. */
export function faqSummaryHorizontalPaddingClass(
  design: PortfolioFaqItemDesign,
  cardPadding: PortfolioServicesCardPadding = 'md'
): string {
  const scale = cardPadding === 'none' ? 'sm' : cardPadding;
  const presets: Record<'sm' | 'md' | 'lg', Record<string, string>> = {
    sm: {
      row: 'px-4 sm:px-5',
      card: 'px-4 sm:px-5',
      rail: 'px-0',
      compact: 'px-3 sm:px-4',
      pill: 'px-4 sm:px-5',
    },
    md: {
      row: 'px-5 sm:px-6',
      card: 'px-5 sm:px-6',
      rail: 'px-0',
      compact: 'px-4 sm:px-5',
      pill: 'px-5 sm:px-6',
    },
    lg: {
      row: 'px-6 sm:px-7',
      card: 'px-6 sm:px-7',
      rail: 'px-0',
      compact: 'px-5 sm:px-6',
      pill: 'px-6 sm:px-7',
    },
  };
  const pad = presets[scale];
  if (design === 'compact') return pad.compact;
  if (design === 'pill') return pad.pill;
  if (design === 'bordered' || design === 'accent' || design === 'two-column') return pad.card;
  if (design === 'numbered-rail') return pad.rail;
  return pad.row;
}

/** Answer block bottom / indent padding — follows the same cardPadding scale. */
export function faqAnswerPaddingClass(
  design: PortfolioFaqItemDesign,
  cardPadding: PortfolioServicesCardPadding = 'md',
  showInlineNumber = false,
  flushWithQuestion = false
): string {
  const scale = cardPadding === 'none' ? 'sm' : cardPadding;
  const bottom =
    design === 'compact'
      ? 'pb-4 sm:pb-5'
      : scale === 'lg'
        ? 'pb-7 sm:pb-8'
        : scale === 'sm'
          ? 'pb-4 sm:pb-5'
          : 'pb-5 sm:pb-7';
  if (flushWithQuestion) {
    // Horizontal padding is applied via the mirrored summary row in the renderer.
    return bottom;
  }
  const indent = showInlineNumber ? 'pl-10 sm:pl-[4.25rem]' : 'pl-1 sm:pl-4';
  return `${bottom} pr-1 sm:pr-2 ${indent}`;
}

export function faqIsCardDesign(design: PortfolioFaqItemDesign): boolean {
  return (
    design === 'bordered' ||
    design === 'accent' ||
    design === 'pill' ||
    design === 'two-column' ||
    design === 'raised'
  );
}

export function pickFaqPresentationSettings(faq: unknown): PortfolioFaqPresentationSettings {
  return mergeFaqPresentation(DEFAULT_FAQ_PRESENTATION, faq);
}

export function mergeFaqPresentation(
  base: PortfolioFaqPresentationSettings,
  patch: unknown
): PortfolioFaqPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const background = mergeSectionBackground(base, patch);
  const frameBackground = mergeServicesCardBackgroundSettings(base, patch);
  // FAQ must stay solid — never inherit the skills/services diagonal split.
  const faqFrameBackground =
    frameBackground.cardBackgroundFill === 'split'
      ? { ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS }
      : frameBackground;

  const questionFont = pick(record.questionFont, ['sans', 'serif', 'display'], base.questionFont);
  const answerFont = pick(record.answerFont, ['sans', 'serif', 'display'], base.answerFont);
  const questionColor = sanitizeHex(record.questionColor, base.questionColor);
  const answerColor = sanitizeHex(record.answerColor, base.answerColor);
  const questionSize = pick(record.questionSize, ['sm', 'md', 'lg'], base.questionSize);
  const answerSize = pick(record.answerSize, ['sm', 'md', 'lg'], base.answerSize);
  const numberColor = sanitizeHex(record.numberColor, base.numberColor);

  const elementStyles =
    record.elementStyles !== undefined
      ? normalizeElementStylesRecord(record.elementStyles, DEFAULT_FAQ_ELEMENT_STYLES, FAQ_STYLE_TARGET_IDS)
      : // Backward compat: no elementStyles saved yet — seed from the legacy per-field settings.
        normalizeElementStylesRecord(
          {
            question: createElementTextStyle({
              color: questionColor,
              font: questionFont,
              size: questionSize,
              weight: 'semibold',
            }),
            answer: createElementTextStyle({ color: answerColor, font: answerFont, size: answerSize }),
            number: createElementTextStyle({ color: numberColor, font: 'sans', size: 'sm', bold: true }),
          },
          DEFAULT_FAQ_ELEMENT_STYLES,
          FAQ_STYLE_TARGET_IDS
        );

  const merged: PortfolioFaqPresentationSettings = {
    ...background,
    ...faqFrameBackground,
    titlePreset: pick(
      record.titlePreset,
      ['faq', 'frequently-asked', 'questions', 'common-questions', 'q-and-a', 'custom'],
      base.titlePreset
    ),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['default', 'short', 'reassurance', 'minimal', 'custom'],
      base.subtitlePreset
    ),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    titleUppercase: typeof record.titleUppercase === 'boolean' ? record.titleUppercase : base.titleUppercase,
    subtitleUppercase:
      typeof record.subtitleUppercase === 'boolean' ? record.subtitleUppercase : base.subtitleUppercase,
    headerAlignment: pick(record.headerAlignment, ['left', 'center', 'right'], base.headerAlignment),
    sectionLayout: isPortfolioFaqSectionLayout(record.sectionLayout)
      ? record.sectionLayout
      : (base.sectionLayout ?? 'stacked'),
    design: isPortfolioFaqDesign(record.design) ? record.design : (base.design ?? 'kinetic-split'),
    itemDesign: pick(record.itemDesign, FAQ_ITEM_DESIGNS, base.itemDesign),
    itemGap: pick(record.itemGap, ['sm', 'md', 'lg', 'xl'], base.itemGap),
    listMaxWidth: pick(record.listMaxWidth, ['narrow', 'default', 'wide', 'full'], base.listMaxWidth),
    listPlacement: pick(record.listPlacement, ['left', 'center', 'right'], base.listPlacement),
    itemAlign: pick(record.itemAlign, ['left', 'center', 'right'], base.itemAlign),
    panelShadow: isPortfolioFaqPanelShadow(record.panelShadow)
      ? record.panelShadow
      : (base.panelShadow ?? 'medium'),
    panelShadowIntensity: clampFaqPanelShadowIntensity(
      record.panelShadowIntensity,
      base.panelShadowIntensity ?? PORTFOLIO_FAQ_PANEL_SHADOW_PRESET_INTENSITY.medium
    ),
    cardBorder: pick(record.cardBorder, ['none', 'soft', 'solid', 'accent'], base.cardBorder),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean' ? record.cardBackgroundEnabled : base.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderRadius: pick(record.cardBorderRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardBorderRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    accentColor: sanitizeHex(record.accentColor, base.accentColor),
    questionFont,
    answerFont,
    questionColor,
    answerColor,
    questionSize,
    answerSize,
    numberColor,
    expandIconStyle: pick(record.expandIconStyle, ['plus', 'chevron'], base.expandIconStyle),
    expandIconColor: sanitizeHex(record.expandIconColor, base.expandIconColor),
    answerAccentBorderColor: sanitizeHex(record.answerAccentBorderColor, base.answerAccentBorderColor),
    showItemNumbers: typeof record.showItemNumbers === 'boolean' ? record.showItemNumbers : base.showItemNumbers,
    itemMarkerSource: isPortfolioListMarkerSource(record.itemMarkerSource)
      ? record.itemMarkerSource
      : base.itemMarkerSource ?? 'section',
    itemMarkerStyle: isPortfolioListMarkerStyle(record.itemMarkerStyle)
      ? record.itemMarkerStyle
      : base.itemMarkerStyle ?? 'number',
    itemMarkerColor: sanitizeHex(
      record.itemMarkerColor,
      base.itemMarkerColor ?? base.numberColor ?? DEFAULT_FAQ_NUMBER_COLOR
    ),
    itemMarkerSize: isPortfolioListMarkerSize(record.itemMarkerSize)
      ? record.itemMarkerSize
      : base.itemMarkerSize ?? 'md',
    itemMarkerSizePx: clampListMarkerSizePx(
      record.itemMarkerSizePx,
      base.itemMarkerSizePx ?? LIST_MARKER_SIZE_PRESET_PX.md
    ),
    itemMarkerWeight: isPortfolioListMarkerWeight(record.itemMarkerWeight)
      ? record.itemMarkerWeight
      : base.itemMarkerWeight ?? 'regular',
    itemMarkerWeightAmount: clampListMarkerWeightAmount(
      record.itemMarkerWeightAmount,
      base.itemMarkerWeightAmount ?? LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular
    ),
    showAnswerAccentBorder:
      typeof record.showAnswerAccentBorder === 'boolean'
        ? record.showAnswerAccentBorder
        : base.showAnswerAccentBorder,
    showExpandIcon: typeof record.showExpandIcon === 'boolean' ? record.showExpandIcon : base.showExpandIcon,
    expandable: typeof record.expandable === 'boolean' ? record.expandable : base.expandable ?? true,
    accordionExclusive:
      typeof record.accordionExclusive === 'boolean'
        ? record.accordionExclusive
        : base.accordionExclusive ?? true,
    illustrationVariant: pick(
      record.illustrationVariant,
      ['none', 'chat', 'question', 'docs', 'support', 'hex'],
      base.illustrationVariant ?? 'none'
    ),
    illustrationPlacement: pick(
      record.illustrationPlacement,
      ['left', 'right'],
      base.illustrationPlacement ?? 'right'
    ),
    answerFlushWithQuestion:
      typeof record.answerFlushWithQuestion === 'boolean'
        ? record.answerFlushWithQuestion
        : base.answerFlushWithQuestion ?? false,
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    colorModeOverride: mergeSectionColorMode(record.colorModeOverride, base.colorModeOverride),
    premiumFontSize: pick(record.premiumFontSize, FAQ_PREMIUM_FONT_SIZES, base.premiumFontSize ?? 'medium'),
    questionColorToken: pick(record.questionColorToken, FAQ_TEXT_COLOR_TOKENS, base.questionColorToken ?? 'auto'),
    answerColorToken: pick(record.answerColorToken, FAQ_TEXT_COLOR_TOKENS, base.answerColorToken ?? 'auto'),
    designFrame: normalizeFaqFrame(record.designFrame, normalizeFaqFrame(base.designFrame)),
    faqPalette: mergeFaqPalette(
      mergeFaqPalette(DEFAULT_FAQ_PALETTE, base.faqPalette),
      record.faqPalette
    ),
    faqColorBindings: mergeFaqColorBindings(
      mergeFaqColorBindings(DEFAULT_FAQ_COLOR_BINDINGS, base.faqColorBindings),
      record.faqColorBindings
    ),
    elementStyles,

    headerDesign: pick(record.headerDesign, FAQ_HEADER_DESIGNS, base.headerDesign ?? 'editorial'),
    // The header motion switch was removed from the UI — always on (reduced-motion is still honoured).
    headerAnimationEnabled: true,
    headerDesignAlignment: pick(
      record.headerDesignAlignment,
      ['left', 'center', 'right'] as const,
      base.headerDesignAlignment ?? 'left'
    ),
    headerMarginBottom: pick(
      record.headerMarginBottom,
      FAQ_HEADER_MARGIN_BOTTOM_STEPS,
      base.headerMarginBottom ?? 'md'
    ),
    headerTitleSize: pick(record.headerTitleSize, FAQ_HEADER_TITLE_SIZES, base.headerTitleSize ?? 'md'),
    headerTitleWeight: pick(
      record.headerTitleWeight,
      FAQ_HEADER_EDITORIAL_TITLE_WEIGHTS,
      base.headerTitleWeight ?? 'regular'
    ),
    headerLayouts: normalizeDesignLayouts(
      record.headerLayouts !== undefined ? record.headerLayouts : base.headerLayouts,
      FAQ_HEADER_DESIGNS_SELECTABLE
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
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerAccentCountBadgeColor ?? 'principal'
    ),
    headerAccentCountLeadColor: pick(
      record.headerAccentCountLeadColor,
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerAccentCountLeadColor ?? 'secondaire'
    ),
    headerAccentCountSize: pick(
      record.headerAccentCountSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerAccentCountSize ?? 'md'
    ),
    headerAccentCountWeight: pick(
      record.headerAccentCountWeight,
      FAQ_HEADER_TITLE_WEIGHTS,
      base.headerAccentCountWeight ?? 'regular'
    ),
    headerAccentCountAlignment: pick(
      record.headerAccentCountAlignment,
      FAQ_HEADER_ACCENT_COUNT_ALIGNMENTS,
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
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadLabelColor ?? 'texteFort'
    ),
    headerSerifLeadTitleColor: pick(
      record.headerSerifLeadTitleColor,
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadTitleColor ?? 'texteFort'
    ),
    headerSerifLeadSubtitleColor: pick(
      record.headerSerifLeadSubtitleColor,
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadSubtitleColor ?? 'texteFort'
    ),
    headerSerifLeadLabelSize: pick(
      record.headerSerifLeadLabelSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerSerifLeadLabelSize ?? 'md'
    ),
    headerSerifLeadTitleSize: pick(
      record.headerSerifLeadTitleSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerSerifLeadTitleSize ?? 'md'
    ),
    headerSerifLeadSubtitleSize: pick(
      record.headerSerifLeadSubtitleSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerSerifLeadSubtitleSize ?? 'md'
    ),
    headerSerifLeadLabelWeight: pick(
      record.headerSerifLeadLabelWeight,
      FAQ_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadLabelWeight ?? 'regular'
    ),
    headerSerifLeadTitleWeight: pick(
      record.headerSerifLeadTitleWeight,
      FAQ_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadTitleWeight ?? 'regular'
    ),
    headerSerifLeadSubtitleWeight: pick(
      record.headerSerifLeadSubtitleWeight,
      FAQ_HEADER_TITLE_WEIGHTS,
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
      FAQ_HEADER_BILLBOARD_WORD_STYLES,
      base.headerBillboardWordStyle ?? 'outline'
    ),
    headerBillboardWordColor: pick(
      record.headerBillboardWordColor,
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerBillboardWordColor ?? 'principal'
    ),
    headerBillboardTitleColor: pick(
      record.headerBillboardTitleColor,
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerBillboardTitleColor ?? 'principal'
    ),
    headerBillboardMetaColor: pick(
      record.headerBillboardMetaColor,
      FAQ_HEADER_PALETTE_TOKENS,
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
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingTitleColor ?? 'principal'
    ),
    headerSplitHeadingLabelColor: pick(
      record.headerSplitHeadingLabelColor,
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingLabelColor ?? 'secondaire'
    ),
    headerSplitHeadingTitleSize: pick(
      record.headerSplitHeadingTitleSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerSplitHeadingTitleSize ?? 'md'
    ),
    headerSplitHeadingTitleWeight: pick(
      record.headerSplitHeadingTitleWeight,
      FAQ_HEADER_TITLE_WEIGHTS,
      base.headerSplitHeadingTitleWeight ?? 'regular'
    ),
    headerSplitHeadingLabelSize: pick(
      record.headerSplitHeadingLabelSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerSplitHeadingLabelSize ?? 'md'
    ),
    headerSplitHeadingLabelWeight: pick(
      record.headerSplitHeadingLabelWeight,
      FAQ_HEADER_TITLE_WEIGHTS,
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
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerMastheadHeadlineColor ?? 'principal'
    ),
    headerMastheadHeadlineSize: pick(
      record.headerMastheadHeadlineSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerMastheadHeadlineSize ?? 'md'
    ),
    headerMastheadHeadlineWeight: pick(
      record.headerMastheadHeadlineWeight,
      FAQ_HEADER_TITLE_WEIGHTS,
      base.headerMastheadHeadlineWeight ?? 'regular'
    ),
    headerIndexLabelText:
      typeof record.headerIndexLabelText === 'string'
        ? record.headerIndexLabelText
        : (base.headerIndexLabelText ?? ''),
    headerIndexTitleText:
      typeof record.headerIndexTitleText === 'string'
        ? record.headerIndexTitleText
        : (base.headerIndexTitleText ?? ''),
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
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerIndexLabelColor ?? 'texteFort'
    ),
    headerIndexNumberColor: pick(
      record.headerIndexNumberColor,
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerIndexNumberColor ?? 'principal'
    ),
    headerIndexTitleColor: pick(
      record.headerIndexTitleColor,
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerIndexTitleColor ?? 'texteFort'
    ),
    headerIndexSubtitleColor: pick(
      record.headerIndexSubtitleColor,
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerIndexSubtitleColor ?? 'texteFort'
    ),
    headerIndexLabelSize: pick(
      record.headerIndexLabelSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerIndexLabelSize ?? 'md'
    ),
    headerIndexLabelWeight: pick(
      record.headerIndexLabelWeight,
      FAQ_HEADER_TITLE_WEIGHTS,
      base.headerIndexLabelWeight ?? 'regular'
    ),
    headerIndexTitleSize: pick(
      record.headerIndexTitleSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerIndexTitleSize ?? 'md'
    ),
    headerIndexTitleWeight: pick(
      record.headerIndexTitleWeight,
      FAQ_HEADER_TITLE_WEIGHTS,
      base.headerIndexTitleWeight ?? 'regular'
    ),
    headerIndexSubtitleSize: pick(
      record.headerIndexSubtitleSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerIndexSubtitleSize ?? 'md'
    ),
    headerIndexSubtitleWeight: pick(
      record.headerIndexSubtitleWeight,
      FAQ_HEADER_TITLE_WEIGHTS,
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
      FAQ_HEADER_PALETTE_TOKENS,
      base.headerMarqueeWordColor ?? 'principal'
    ),
    headerMarqueeSize: pick(
      record.headerMarqueeSize,
      FAQ_HEADER_TITLE_SIZES,
      base.headerMarqueeSize ?? 'md'
    ),
    bentoDualCardColorToken: pick(
      record.bentoDualCardColorToken,
      PORTFOLIO_FAQ_BENTO_DUAL_CARD_COLOR_TOKENS,
      base.bentoDualCardColorToken ?? 'secondaire'
    ),
    bentoDualCardRadius: pick(
      record.bentoDualCardRadius,
      PORTFOLIO_FAQ_BENTO_DUAL_CARD_RADII,
      base.bentoDualCardRadius ?? 'md'
    ),
    bentoDualCardBorder: pick(
      record.bentoDualCardBorder,
      PORTFOLIO_FAQ_BENTO_DUAL_CARD_BORDERS,
      base.bentoDualCardBorder ?? 'soft'
    ),
    bentoDualCardOpacity:
      typeof record.bentoDualCardOpacity === 'number' && Number.isFinite(record.bentoDualCardOpacity)
        ? Math.min(100, Math.max(0, record.bentoDualCardOpacity))
        : (base.bentoDualCardOpacity ?? 100),
  };

  if (merged.useHeroPalette === false) {
    return merged;
  }

  return {
    ...merged,
    ...(applyFaqPaletteToSettings(merged) as Partial<PortfolioFaqPresentationSettings>),
    useHeroPalette: true,
  };
}
