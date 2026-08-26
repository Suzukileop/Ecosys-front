import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
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
import {
  createElementTextStyle,
  normalizeElementStylesRecord,
  patchElementStylesRecord,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';

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
export type PortfolioFaqDesign = 'two-column' | 'panel' | 'split' | 'cta-split';

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
export type PortfolioFaqStyleTarget = 'question' | 'answer' | 'number';

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
  /** FAQ-owned palette copy (same 8 tokens as Hero). */
  faqPalette?: PortfolioFaqPalette;
  /** Which token each FAQ color slot uses. */
  faqColorBindings?: PortfolioFaqColorBindings;
  /** Per-element color, font, size, and weight for question, answer, and item number. */
  elementStyles: PortfolioFaqElementStyles;
};

export type PortfolioFaqSectionSettings = PortfolioSectionCopy & PortfolioFaqPresentationSettings;

export const DEFAULT_FAQ_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_FAQ_SUBTITLE_COLOR = '#737373';
export const DEFAULT_FAQ_ACCENT_COLOR = '#f97316';
export const DEFAULT_FAQ_QUESTION_COLOR = '#0a0a0a';
export const DEFAULT_FAQ_ANSWER_COLOR = '#525252';
export const DEFAULT_FAQ_NUMBER_COLOR = '#f97316';
export const DEFAULT_FAQ_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_FAQ_CARD_BACKGROUND_COLOR = '#ffffff';

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

const FAQ_DESIGNS = ['two-column', 'panel', 'split', 'cta-split'] as const;

export const FAQ_STYLE_TARGET_IDS: PortfolioFaqStyleTarget[] = ['question', 'answer', 'number'];

export const DEFAULT_FAQ_ELEMENT_STYLES: PortfolioFaqElementStyles = {
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

export const PORTFOLIO_FAQ_STYLE_TARGET_OPTIONS: {
  value: PortfolioFaqStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'question', label: 'Question', description: 'The question text in each FAQ row.' },
  { value: 'answer', label: 'Answer', description: 'The expanded answer paragraph.' },
  { value: 'number', label: 'Item number', description: 'The numbered label before each question.' },
];

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
  headerAlignment: 'center',
  sectionLayout: 'stacked',
  design: 'two-column',
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
  faqPalette: { ...DEFAULT_FAQ_PALETTE },
  faqColorBindings: { ...DEFAULT_FAQ_COLOR_BINDINGS },
  elementStyles: DEFAULT_FAQ_ELEMENT_STYLES,
};

Object.assign(
  DEFAULT_FAQ_PRESENTATION,
  applyFaqPaletteToSettings({
    faqPalette: DEFAULT_FAQ_PALETTE,
    faqColorBindings: DEFAULT_FAQ_COLOR_BINDINGS,
    elementStyles: DEFAULT_FAQ_ELEMENT_STYLES,
  })
);

export const PORTFOLIO_FAQ_TITLE_PRESET_OPTIONS: {
  value: PortfolioFaqTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'faq', label: 'FAQ', description: 'Classic short label.' },
  {
    value: 'frequently-asked',
    label: 'Frequently asked',
    description: 'Frequently Asked Questions — default for Two columns.',
  },
  { value: 'questions', label: 'Questions', description: 'Simple and direct.' },
  { value: 'common-questions', label: 'Common questions', description: 'Client-friendly wording.' },
  { value: 'q-and-a', label: 'Q & A', description: 'Compact editorial style.' },
  { value: 'custom', label: 'Custom', description: 'Your own section title.' },
];

export const PORTFOLIO_FAQ_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioFaqSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  { value: 'short', label: 'Short', description: 'One concise supporting line.' },
  { value: 'reassurance', label: 'Reassurance', description: 'Builds trust before contact.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_FAQ_HEADER_FONT_OPTIONS: {
  value: PortfolioFaqHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_FAQ_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioFaqSectionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Empilé',
    description: 'Titre au-dessus, questions en dessous.',
  },
  {
    value: 'aside-left',
    label: 'Titre à gauche',
    description: 'Titre à gauche, liste FAQ à droite (côte à côte).',
  },
  {
    value: 'aside-right',
    label: 'Titre à droite',
    description: 'Liste FAQ à gauche, titre à droite (côte à côte).',
  },
];

export function isPortfolioFaqSectionLayout(value: unknown): value is PortfolioFaqSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

export const PORTFOLIO_FAQ_DESIGN_OPTIONS: {
  value: PortfolioFaqDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'two-column',
    label: 'Two columns',
    description: 'Centered title, rounded accordion cards in two columns — default.',
  },
  {
    value: 'panel',
    label: 'Panel card',
    description: 'One rounded card: centered title, divided rows, controllable outer shadow.',
  },
  {
    value: 'split',
    label: 'Title + SVG',
    description: 'Title and SVG centered on one side, FAQ items on the other — reversible.',
  },
  {
    value: 'cta-split',
    label: 'Title + chat CTA',
    description: 'Centered title on top, chat SVG with Contact CTA below, questions on the other side.',
  },
];

export function isPortfolioFaqDesign(value: unknown): value is PortfolioFaqDesign {
  return (FAQ_DESIGNS as readonly string[]).includes(String(value));
}

export function faqDesignIsSplit(design: PortfolioFaqDesign | undefined): boolean {
  return design === 'split';
}

export function faqDesignIsCtaSplit(design: PortfolioFaqDesign | undefined): boolean {
  return design === 'cta-split';
}

export const PORTFOLIO_FAQ_SPLIT_SIDE_OPTIONS: {
  value: PortfolioFaqIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Titre à gauche',
    description: 'Titre + SVG centrés à gauche, questions à droite.',
  },
  {
    value: 'right',
    label: 'Titre à droite',
    description: 'Questions à gauche, titre + SVG centrés à droite.',
  },
];

export const PORTFOLIO_FAQ_CTA_SPLIT_SIDE_OPTIONS: {
  value: PortfolioFaqIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'right',
    label: 'SVG à droite',
    description: 'Questions à gauche, SVG + Contact à droite.',
  },
  {
    value: 'left',
    label: 'SVG à gauche',
    description: 'SVG + Contact à gauche, questions à droite.',
  },
];

export function faqDesignShowsTitleKicker(design: PortfolioFaqDesign | undefined): boolean {
  const value = design ?? 'two-column';
  return value === 'two-column' || value === 'panel' || value === 'split' || value === 'cta-split';
}

export const PORTFOLIO_FAQ_PANEL_SHADOW_OPTIONS: {
  value: PortfolioFaqPanelShadow;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Pas d’ombre autour de la carte.' },
  { value: 'soft', label: 'Douce', description: 'Halo léger.' },
  { value: 'medium', label: 'Moyenne', description: 'Ombre diffuse — défaut.' },
  { value: 'strong', label: 'Forte', description: 'Relief marqué.' },
];

export const PORTFOLIO_FAQ_PANEL_SHADOW_PRESET_INTENSITY: Record<PortfolioFaqPanelShadow, number> = {
  none: 0,
  soft: 28,
  medium: 55,
  strong: 82,
};

export function isPortfolioFaqPanelShadow(value: unknown): value is PortfolioFaqPanelShadow {
  return value === 'none' || value === 'soft' || value === 'medium' || value === 'strong';
}

export function clampFaqPanelShadowIntensity(value: unknown, fallback = 55): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function faqPanelShadowStyle(
  shadow: PortfolioFaqPanelShadow | undefined,
  intensity: number | undefined
): CSSProperties | undefined {
  const kind = shadow ?? 'medium';
  if (kind === 'none') return undefined;
  const amount = clampFaqPanelShadowIntensity(
    intensity,
    PORTFOLIO_FAQ_PANEL_SHADOW_PRESET_INTENSITY[kind]
  );
  if (amount <= 0) return undefined;
  const t = amount / 100;
  const y = Math.round(10 + t * 22);
  const blur = Math.round(28 + t * 48);
  const spread = Math.round(-12 - t * 8);
  const alpha = (0.06 + t * 0.2).toFixed(3);
  return { boxShadow: `0 ${y}px ${blur}px ${spread}px rgba(15, 23, 42, ${alpha})` };
}

export function defaultsForFaqDesign(design: PortfolioFaqDesign): Partial<PortfolioFaqPresentationSettings> {
  if (design === 'two-column') {
    return {
      design,
      headerAlignment: 'center',
      sectionLayout: 'stacked',
      itemDesign: 'two-column',
      itemGap: 'md',
      listMaxWidth: 'wide',
      listPlacement: 'center',
      itemAlign: 'left',
      showItemNumbers: false,
      showExpandIcon: true,
      expandIconStyle: 'plus',
      expandable: true,
      accordionExclusive: true,
      showAnswerAccentBorder: false,
      illustrationVariant: 'none',
      cardBorder: 'soft',
      cardBorderRadius: 'xl',
      cardPadding: 'lg',
      titlePreset: 'frequently-asked',
      titleUppercase: false,
      subtitlePreset: 'default',
    };
  }
  if (design === 'panel') {
    return {
      design,
      headerAlignment: 'center',
      sectionLayout: 'stacked',
      itemDesign: 'minimal',
      itemGap: 'md',
      listMaxWidth: 'default',
      listPlacement: 'center',
      itemAlign: 'left',
      showItemNumbers: false,
      showExpandIcon: true,
      expandIconStyle: 'plus',
      expandable: true,
      accordionExclusive: true,
      showAnswerAccentBorder: false,
      illustrationVariant: 'none',
      cardBorder: 'none',
      cardBorderRadius: 'lg',
      cardPadding: 'lg',
      panelShadow: 'medium',
      panelShadowIntensity: PORTFOLIO_FAQ_PANEL_SHADOW_PRESET_INTENSITY.medium,
      titlePreset: 'frequently-asked',
      titleUppercase: false,
      subtitlePreset: 'minimal',
    };
  }
  if (design === 'split') {
    return {
      design,
      headerAlignment: 'center',
      sectionLayout: 'stacked',
      itemDesign: 'bordered',
      itemGap: 'md',
      listMaxWidth: 'full',
      listPlacement: 'center',
      itemAlign: 'left',
      showItemNumbers: false,
      showExpandIcon: true,
      expandIconStyle: 'plus',
      expandable: true,
      accordionExclusive: true,
      showAnswerAccentBorder: false,
      illustrationVariant: 'question',
      illustrationPlacement: 'left',
      cardBorder: 'soft',
      cardBorderRadius: 'xl',
      cardPadding: 'md',
      titlePreset: 'frequently-asked',
      titleUppercase: false,
      subtitlePreset: 'short',
    };
  }
  if (design === 'cta-split') {
    return {
      design,
      headerAlignment: 'center',
      sectionLayout: 'stacked',
      itemDesign: 'bordered',
      itemGap: 'md',
      listMaxWidth: 'full',
      listPlacement: 'center',
      itemAlign: 'left',
      showItemNumbers: false,
      showExpandIcon: true,
      expandIconStyle: 'plus',
      expandable: true,
      accordionExclusive: true,
      showAnswerAccentBorder: false,
      illustrationVariant: 'chat',
      illustrationPlacement: 'right',
      cardBorder: 'soft',
      cardBorderRadius: 'xl',
      cardPadding: 'md',
      titlePreset: 'frequently-asked',
      titleUppercase: false,
      subtitlePreset: 'short',
    };
  }
  return { design };
}

export function faqSectionLayoutIsAside(layout: PortfolioFaqSectionLayout | undefined): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

/** Two-column shell for title + FAQ list (large screens). */
export function faqAsideLayoutClass(layout: PortfolioFaqSectionLayout): string {
  if (layout === 'aside-right') {
    return 'grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
  }
  return 'grid w-full gap-10 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
}

export const PORTFOLIO_FAQ_ITEM_DESIGN_OPTIONS: {
  value: PortfolioFaqItemDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'raised',
    label: 'Raised cards',
    description: 'Soft elevated cards with Q. labels.',
  },
  { value: 'editorial', label: 'Editorial', description: 'Framed list with soft panel.' },
  { value: 'pill', label: 'Soft pills', description: 'Standalone rounded rows with light fill.' },
  { value: 'minimal', label: 'Minimal', description: 'Clean dividers, no outer frame.' },
  { value: 'bordered', label: 'Bordered cards', description: 'Separate cards with controllable gap.' },
  { value: 'accent', label: 'Accent edge', description: 'Warm left border on each item.' },
  { value: 'numbered-rail', label: 'Numbered rail', description: 'Accent step numbers with connector line.' },
  { value: 'two-column', label: 'Two columns', description: 'Grid layout on large screens — default for this design.' },
  { value: 'compact', label: 'Compact', description: 'Dense spacing and smaller type.' },
];

export const PORTFOLIO_FAQ_ITEM_GAP_OPTIONS: {
  value: PortfolioFaqItemGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Tight', description: 'Minimal vertical gap (hairline dividers).' },
  { value: 'md', label: 'Standard', description: 'Balanced space between every question (default).' },
  { value: 'lg', label: 'Relaxed', description: 'Generous vertical gap between items.' },
  { value: 'xl', label: 'Airy', description: 'Maximum vertical separation.' },
];

export const PORTFOLIO_FAQ_LIST_MAX_WIDTH_OPTIONS: {
  value: PortfolioFaqListMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'narrow', label: 'Narrow', description: 'Compact reading column.' },
  { value: 'default', label: 'Default', description: 'Standard FAQ width.' },
  { value: 'wide', label: 'Wide', description: 'Roomier layout.' },
  { value: 'full', label: 'Full', description: 'Use the full section width.' },
];

export const PORTFOLIO_FAQ_LIST_PLACEMENT_OPTIONS: {
  value: PortfolioFaqListPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Align FAQ block to the left.' },
  { value: 'center', label: 'Center', description: 'Center FAQ block (default).' },
  { value: 'right', label: 'Right', description: 'Align FAQ block to the right.' },
];

export const PORTFOLIO_FAQ_TEXT_SIZE_OPTIONS: {
  value: PortfolioFaqTextSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

export const PORTFOLIO_FAQ_CONTENT_ALIGN_OPTIONS: {
  value: PortfolioFaqContentAlign;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Default left alignment for rows and answers.' },
  { value: 'center', label: 'Center', description: 'Center question, icon, and answer content.' },
  { value: 'right', label: 'Right', description: 'Right-aligned FAQ content.' },
];

export const PORTFOLIO_FAQ_EXPAND_ICON_OPTIONS: {
  value: PortfolioFaqExpandIconStyle;
  label: string;
  description: string;
}[] = [
  { value: 'plus', label: 'Plus', description: 'Rotates 45° when open.' },
  { value: 'chevron', label: 'Chevron', description: 'Rotates downward when open.' },
];

export const PORTFOLIO_FAQ_ILLUSTRATION_OPTIONS: {
  value: PortfolioFaqIllustrationVariant;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No decorative SVG beside the list.' },
  { value: 'chat', label: 'Chat', description: 'Speech bubbles — conversation feel.' },
  { value: 'question', label: 'Question', description: 'Bold question mark badge.' },
  { value: 'docs', label: 'Docs', description: 'Stacked documents with tip.' },
  { value: 'support', label: 'Support', description: 'Headset support character.' },
  { value: 'hex', label: 'Hex', description: 'Geometric hexagon mark.' },
];

export const PORTFOLIO_FAQ_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioFaqIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Illustration to the left of the FAQ list.' },
  { value: 'right', label: 'Right', description: 'Illustration to the right of the FAQ list.' },
];

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

/** Matches About us split heading: size + semibold, without the narrow left-column max-width. */
export const FAQ_READY_TITLE_CLASS =
  'font-semibold leading-[1.14] tracking-tight text-[2.05rem] sm:text-[2.55rem] lg:text-[2.95rem]';

export function faqHeaderFontStyle(_font: PortfolioFaqHeaderFont): CSSProperties | undefined {
  return undefined;
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

export function faqItemGapClass(gap: PortfolioFaqItemGap): string {
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

export function faqPanelInnerClass(p: PortfolioFaqPresentationSettings): string {
  const radius = servicesCardRadiusClass(p.cardBorderRadius);
  const pad =
    p.cardPadding === 'sm'
      ? 'px-6 py-8 sm:px-8 sm:py-10'
      : p.cardPadding === 'lg'
        ? 'px-8 py-10 sm:px-12 sm:py-14'
        : 'px-7 py-9 sm:px-10 sm:py-12';
  return `${radius} ${pad} relative overflow-x-hidden`;
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
  gap: PortfolioFaqItemGap = 'md',
  sectionDesign?: PortfolioFaqDesign
): string {
  const gapClass = faqItemGapClass(gap);
  const panelRows =
    sectionDesign === 'panel' &&
    (design === 'minimal' || design === 'editorial' || design === 'compact');

  if (design === 'two-column') {
    return `grid lg:grid-cols-2 ${gapClass} lg:gap-x-6`;
  }
  if (panelRows) return 'flex flex-col';
  return `flex flex-col ${gapClass}`;
}

export function faqItemShellClass(
  design: PortfolioFaqItemDesign,
  gap: PortfolioFaqItemGap = 'md',
  sectionDesign?: PortfolioFaqDesign
): string {
  const panelRows =
    sectionDesign === 'panel' &&
    (design === 'minimal' || design === 'editorial' || design === 'compact');
  const dividers = gap === 'sm' || panelRows;

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

export function faqQuestionClass(size: PortfolioFaqTextSize, font: PortfolioFaqHeaderFont): string {
  const parts = ['min-w-0 flex-1 font-semibold leading-snug', faqHeaderFontClass(font, 'title')];

  switch (size) {
    case 'sm':
      parts.push('text-sm sm:text-base');
      break;
    case 'lg':
      parts.push('text-lg sm:text-xl');
      break;
    default:
      parts.push('text-base sm:text-lg');
  }

  return parts.join(' ');
}

export function faqQuestionStyle(
  color: string,
  font: PortfolioFaqHeaderFont
): CSSProperties {
  return {
    color: sanitizeHex(color, DEFAULT_FAQ_QUESTION_COLOR),
    ...faqHeaderFontStyle(font),
  };
}

export function faqAnswerClass(size: PortfolioFaqTextSize, font: PortfolioFaqHeaderFont): string {
  const parts = ['whitespace-pre-line leading-relaxed', faqHeaderFontClass(font, 'subtitle')];

  switch (size) {
    case 'sm':
      parts.push('text-sm');
      break;
    case 'lg':
      parts.push('text-base sm:text-lg');
      break;
    default:
      parts.push('text-base');
  }

  return parts.join(' ');
}

export function faqAnswerStyle(color: string, font: PortfolioFaqHeaderFont): CSSProperties {
  return {
    color: sanitizeHex(color, DEFAULT_FAQ_ANSWER_COLOR),
    ...faqHeaderFontStyle(font),
  };
}

export function faqNumberStyle(numberColor: string): CSSProperties {
  return { color: sanitizeHex(numberColor, DEFAULT_FAQ_NUMBER_COLOR) };
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
    design: isPortfolioFaqDesign(record.design) ? record.design : (base.design ?? 'two-column'),
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
    faqPalette: mergeFaqPalette(
      mergeFaqPalette(DEFAULT_FAQ_PALETTE, base.faqPalette),
      record.faqPalette
    ),
    faqColorBindings: mergeFaqColorBindings(
      mergeFaqColorBindings(DEFAULT_FAQ_COLOR_BINDINGS, base.faqColorBindings),
      record.faqColorBindings
    ),
    elementStyles,
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

export function patchFaqElementStyle(
  styles: PortfolioFaqElementStyles,
  target: PortfolioFaqStyleTarget,
  patch: Partial<PortfolioElementTextStyle>
): PortfolioFaqElementStyles {
  return patchElementStylesRecord(styles, target, patch, DEFAULT_FAQ_ELEMENT_STYLES, FAQ_STYLE_TARGET_IDS);
}
