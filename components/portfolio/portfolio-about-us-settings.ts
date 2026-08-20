import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import {
  DEFAULT_ABOUT_US_QUOTE_SVG_URLS,
  isAboutUsQuoteSvgId,
  type AboutUsQuoteSvgId,
} from '@/components/portfolio/about-us-quote-svgs';

export type PortfolioAboutUsHeaderAlignment = 'left' | 'center' | 'right';
export type PortfolioAboutUsSectionLayout = 'stacked' | 'aside-left' | 'aside-right';
export type PortfolioAboutUsHeaderFont = 'sans' | 'serif' | 'display';
export type PortfolioAboutUsDesign =
  | 'stacked'
  | 'split-overlap'
  | 'split-founder'
  | 'split-media-left'
  | 'split-card'
  | 'split-quote';
export type PortfolioAboutUsContentPlacement = 'left' | 'center' | 'right';
export type PortfolioAboutUsMediaSide = 'left' | 'right';
export type PortfolioAboutUsImageFrame = 'layered' | 'slab' | 'duo' | 'ring';
export type PortfolioAboutUsCardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioAboutUsCardShadow = 'none' | 'soft' | 'medium' | 'strong';
export type PortfolioAboutUsCardBorder = 'none' | 'thin' | 'medium';
export type PortfolioAboutUsQuoteMedia = 'image' | 'svg';

export type PortfolioAboutUsPresentationSettings = PortfolioSectionBackgroundSettings & {
  design: PortfolioAboutUsDesign;
  headerAlignment: PortfolioAboutUsHeaderAlignment;
  sectionLayout: PortfolioAboutUsSectionLayout;
  contentPlacement: PortfolioAboutUsContentPlacement;
  mediaSide: PortfolioAboutUsMediaSide;
  contentWidthPercent: number;
  imageFrame: PortfolioAboutUsImageFrame;
  cardRadius: PortfolioAboutUsCardRadius;
  cardShadow: PortfolioAboutUsCardShadow;
  cardBorder: PortfolioAboutUsCardBorder;
  cardBorderColor: string;
  cardBackgroundColor: string;
  /** When false, quote/card fill is transparent — border still applies. */
  cardBackgroundEnabled: boolean;
  titleFont: PortfolioAboutUsHeaderFont;
  subtitleFont: PortfolioAboutUsHeaderFont;
  titleColor: string;
  subtitleColor: string;
  descriptionColor: string;
  quoteColor: string;
  taskColor: string;
  founderNameColor: string;
  founderFunctionColor: string;
  accentColor: string;
  showQuote: boolean;
  showFounder: boolean;
  showFounderRating: boolean;
  showTasks: boolean;
  showCta: boolean;
  ctaLabel: string;
  quoteMedia: PortfolioAboutUsQuoteMedia;
  quoteSvgId: AboutUsQuoteSvgId;
  quoteSvgUrls: [string, string, string, string];
  useHeroPalette: boolean;
  activeColorMode?: 'light' | 'dark';
};

export type PortfolioAboutUsSectionSettings = PortfolioSectionCopy & PortfolioAboutUsPresentationSettings;

export const DEFAULT_ABOUT_US_TITLE = 'About us';
export const DEFAULT_ABOUT_US_SUBTITLE = 'Who we are, what we do, and the people behind the work.';

export const DEFAULT_ABOUT_US_PRESENTATION: PortfolioAboutUsPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  design: 'stacked',
  headerAlignment: 'left',
  sectionLayout: 'stacked',
  titleFont: 'sans',
  subtitleFont: 'sans',
  titleColor: '#171717',
  subtitleColor: '#737373',
  descriptionColor: '#737373',
  quoteColor: '#171717',
  taskColor: '#737373',
  founderNameColor: '#171717',
  founderFunctionColor: '#737373',
  contentPlacement: 'left',
  mediaSide: 'right',
  contentWidthPercent: 100,
  imageFrame: 'layered',
  cardRadius: 'lg',
  cardShadow: 'medium',
  cardBorder: 'thin',
  cardBorderColor: '#e5e7eb',
  cardBackgroundColor: '#ffffff',
  cardBackgroundEnabled: true,
  accentColor: '#6d5efc',
  showQuote: true,
  showFounder: true,
  showFounderRating: true,
  showTasks: true,
  showCta: false,
  ctaLabel: 'Contact',
  quoteMedia: 'svg',
  quoteSvgId: 'globe',
  quoteSvgUrls: DEFAULT_ABOUT_US_QUOTE_SVG_URLS,
  useHeroPalette: true,
};

export const PORTFOLIO_ABOUT_US_DESIGN_OPTIONS: {
  value: PortfolioAboutUsDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Classique',
    description: 'Texte, tâches et images empilés. Quote et founder visibles.',
  },
  {
    value: 'split-overlap',
    label: 'Split overlap',
    description: 'Texte et photos côte à côte — une grande, ou deux décalées.',
  },
  {
    value: 'split-founder',
    label: 'Split founder',
    description: 'Texte, bouton et founder d’un côté. Image de l’autre, avec plusieurs cadres.',
  },
  {
    value: 'split-media-left',
    label: 'Split image',
    description: 'Grande photo arrondie d’un côté, texte et liste de l’autre.',
  },
  {
    value: 'split-card',
    label: 'Grand cadre',
    description: 'Tout dans un grand cadre. Photo collée au bord, texte et quote à l’intérieur.',
  },
  {
    value: 'split-quote',
    label: 'Split quote',
    description: 'Texte et carte citation d’un côté, quatre illustrations SVG de l’autre.',
  },
];

export function isPortfolioAboutUsDesign(value: unknown): value is PortfolioAboutUsDesign {
  return (
    value === 'stacked' ||
    value === 'split-overlap' ||
    value === 'split-founder' ||
    value === 'split-media-left' ||
    value === 'split-card' ||
    value === 'split-quote'
  );
}

export function isPortfolioAboutUsMediaSide(value: unknown): value is PortfolioAboutUsMediaSide {
  return value === 'left' || value === 'right';
}

export function isPortfolioAboutUsImageFrame(value: unknown): value is PortfolioAboutUsImageFrame {
  return value === 'layered' || value === 'slab' || value === 'duo' || value === 'ring';
}

export function isPortfolioAboutUsCardRadius(value: unknown): value is PortfolioAboutUsCardRadius {
  return value === 'none' || value === 'sm' || value === 'md' || value === 'lg' || value === 'xl';
}

export function isPortfolioAboutUsCardShadow(value: unknown): value is PortfolioAboutUsCardShadow {
  return value === 'none' || value === 'soft' || value === 'medium' || value === 'strong';
}

export function isPortfolioAboutUsCardBorder(value: unknown): value is PortfolioAboutUsCardBorder {
  return value === 'none' || value === 'thin' || value === 'medium';
}

export function aboutUsDesignEmbedsHeader(design: PortfolioAboutUsDesign | undefined): boolean {
  return (
    design === 'split-overlap' ||
    design === 'split-founder' ||
    design === 'split-media-left' ||
    design === 'split-card' ||
    design === 'split-quote'
  );
}

export function aboutUsDesignUsesSplitChrome(design: PortfolioAboutUsDesign | undefined): boolean {
  return aboutUsDesignEmbedsHeader(design);
}

export function defaultAboutUsMediaSide(design: PortfolioAboutUsDesign | undefined): PortfolioAboutUsMediaSide {
  return design === 'split-media-left' || design === 'split-card' ? 'left' : 'right';
}

export function resolveAboutUsMediaSide(
  design: PortfolioAboutUsDesign | undefined,
  mediaSide: PortfolioAboutUsMediaSide | undefined
): PortfolioAboutUsMediaSide {
  return mediaSide === 'left' || mediaSide === 'right' ? mediaSide : defaultAboutUsMediaSide(design);
}

export function defaultsForAboutUsDesign(
  design: PortfolioAboutUsDesign
): Partial<PortfolioAboutUsPresentationSettings> {
  if (design === 'split-overlap') {
    return {
      design,
      mediaSide: 'right',
      showQuote: false,
      showFounder: false,
      showCta: true,
      ctaLabel: 'Contact',
      showTasks: true,
    };
  }
  if (design === 'split-founder') {
    return {
      design,
      mediaSide: 'right',
      showQuote: false,
      showFounder: true,
      showFounderRating: true,
      showCta: true,
      ctaLabel: 'Contact',
      showTasks: false,
      imageFrame: 'layered',
    };
  }
  if (design === 'split-media-left') {
    return {
      design,
      mediaSide: 'left',
      showQuote: false,
      showFounder: false,
      showCta: true,
      ctaLabel: 'Contact',
      showTasks: true,
    };
  }
  if (design === 'split-card') {
    return {
      design,
      mediaSide: 'left',
      showQuote: true,
      showFounder: false,
      showCta: false,
      showTasks: false,
      cardRadius: 'lg',
      cardShadow: 'medium',
      cardBorder: 'thin',
      cardBorderColor: '#e5e7eb',
      cardBackgroundColor: '#ffffff',
    };
  }
  if (design === 'split-quote') {
    return {
      design,
      mediaSide: 'right',
      showQuote: true,
      showFounder: false,
      showFounderRating: false,
      showCta: false,
      showTasks: false,
      cardRadius: 'xl',
      cardShadow: 'none',
      cardBorder: 'thin',
      cardBorderColor: '#e5e7eb',
      cardBackgroundColor: '#ffffff',
      cardBackgroundEnabled: true,
      quoteMedia: 'svg',
      quoteSvgId: 'globe',
      quoteSvgUrls: DEFAULT_ABOUT_US_QUOTE_SVG_URLS,
    };
  }
  return { design, showQuote: true, showFounder: true, showCta: false, showTasks: true };
}

export const PORTFOLIO_ABOUT_US_QUOTE_MEDIA_OPTIONS: {
  value: PortfolioAboutUsQuoteMedia;
  label: string;
  description: string;
}[] = [
  { value: 'image', label: 'Photo', description: 'Image 1 d’Information → About us.' },
  { value: 'svg', label: 'SVG', description: 'Un visuel à la fois, parmi 4 illustrations.' },
];

export const PORTFOLIO_ABOUT_US_CARD_RADIUS_OPTIONS: {
  value: PortfolioAboutUsCardRadius;
  label: string;
}[] = [
  { value: 'none', label: 'Aucun' },
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'xl', label: 'XL' },
];

export const PORTFOLIO_ABOUT_US_CARD_SHADOW_OPTIONS: {
  value: PortfolioAboutUsCardShadow;
  label: string;
}[] = [
  { value: 'none', label: 'Aucune' },
  { value: 'soft', label: 'Douce' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'strong', label: 'Forte' },
];

export const PORTFOLIO_ABOUT_US_CARD_BORDER_OPTIONS: {
  value: PortfolioAboutUsCardBorder;
  label: string;
}[] = [
  { value: 'none', label: 'Aucune' },
  { value: 'thin', label: 'Fine' },
  { value: 'medium', label: 'Moyenne' },
];

export function aboutUsIsDarkMode(
  presentation: Pick<PortfolioAboutUsPresentationSettings, 'activeColorMode'>
): boolean {
  return presentation.activeColorMode === 'dark';
}

export function aboutUsCardSurfaceColor(
  presentation: Pick<PortfolioAboutUsPresentationSettings, 'cardBackgroundColor' | 'activeColorMode'>
): string {
  const stored = presentation.cardBackgroundColor?.trim();
  if (stored) return stored;
  return aboutUsIsDarkMode(presentation) ? '#1E293B' : '#ffffff';
}

export function aboutUsChrome(dark: boolean) {
  return {
    hairline: dark ? 'border-white/20' : 'border-neutral-200',
    hairlineMuted: dark ? 'border-white/15' : 'border-neutral-300/80',
    slab: dark ? 'bg-white/10' : 'bg-neutral-200/50',
    slabStrong: dark ? 'bg-white/15' : 'bg-neutral-200/80',
    placeholder: dark ? 'bg-white/10' : 'bg-neutral-100',
    avatar: dark ? 'bg-white/10 text-neutral-300' : 'bg-neutral-200 text-neutral-600',
    founderAvatar: dark ? 'bg-white/10 text-neutral-300' : 'bg-neutral-100 text-neutral-500',
    divider: dark ? 'border-white/10' : 'border-neutral-200/80',
    starEmpty: dark ? 'text-neutral-600' : 'text-neutral-200',
  };
}

export function aboutUsCardRadiusClass(radius: PortfolioAboutUsCardRadius | undefined): string {
  if (radius === 'none') return 'rounded-none';
  if (radius === 'sm') return 'rounded-xl';
  if (radius === 'md') return 'rounded-2xl';
  if (radius === 'xl') return 'rounded-[1.75rem] sm:rounded-[2rem]';
  return 'rounded-[1.35rem] sm:rounded-[1.5rem]';
}

export function aboutUsCardShadowClass(
  shadow: PortfolioAboutUsCardShadow | undefined,
  dark = false
): string {
  if (shadow === 'none') return '';
  if (shadow === 'soft') return dark ? 'shadow-sm shadow-black/40' : 'shadow-sm shadow-black/10';
  if (shadow === 'strong') {
    return dark
      ? 'shadow-[0_28px_64px_-16px_rgba(0,0,0,0.65)]'
      : 'shadow-[0_28px_64px_-16px_rgba(15,23,42,0.38)]';
  }
  return dark
    ? 'shadow-[0_22px_50px_-18px_rgba(0,0,0,0.55)]'
    : 'shadow-[0_22px_50px_-18px_rgba(15,23,42,0.28)]';
}

export function aboutUsCardBorderStyle(
  border: PortfolioAboutUsCardBorder | undefined,
  color: string
): CSSProperties | undefined {
  if (border === 'none') return undefined;
  return {
    borderWidth: border === 'medium' ? 2 : 1,
    borderStyle: 'solid',
    borderColor: color || '#e5e7eb',
  };
}

export const PORTFOLIO_ABOUT_US_IMAGE_FRAME_OPTIONS: {
  value: PortfolioAboutUsImageFrame;
  label: string;
  description: string;
}[] = [
  {
    value: 'layered',
    label: 'Calques',
    description: 'Photo, dalle grise décalée et cadre en pointillés.',
  },
  {
    value: 'slab',
    label: 'Dalle',
    description: 'Grande photo sur une dalle pleine décalée.',
  },
  {
    value: 'duo',
    label: 'Duo',
    description: 'Deux photos décalées, ou une photo avec un second plan.',
  },
  {
    value: 'ring',
    label: 'Anneau',
    description: 'Photo dans un cadre arrondi avec un anneau autour.',
  },
];

export const PORTFOLIO_ABOUT_US_CONTENT_PLACEMENT_OPTIONS: {
  value: PortfolioAboutUsContentPlacement;
  label: string;
}[] = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Droite' },
];

export const PORTFOLIO_ABOUT_US_MEDIA_SIDE_OPTIONS: {
  value: PortfolioAboutUsMediaSide;
  label: string;
}[] = [
  { value: 'left', label: 'Image à gauche' },
  { value: 'right', label: 'Image à droite' },
];

export function aboutUsContentPlacementClass(placement: PortfolioAboutUsContentPlacement | undefined): string {
  if (placement === 'right') return 'ml-auto';
  if (placement === 'center') return 'mx-auto';
  return 'mr-auto';
}

export function isPortfolioAboutUsSectionLayout(
  value: unknown
): value is PortfolioAboutUsSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

export function aboutUsSectionLayoutIsAside(
  layout: PortfolioAboutUsSectionLayout | undefined
): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

export function resolveAboutUsSectionTitle(
  settings: Pick<PortfolioAboutUsSectionSettings, 'title'>
): string {
  return settings.title.trim() || DEFAULT_ABOUT_US_TITLE;
}

export function resolveAboutUsSectionSubtitle(
  settings: Pick<PortfolioAboutUsSectionSettings, 'subtitle'>
): string {
  return settings.subtitle.trim();
}

function sanitizeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && isValidProfileHexColor(value) ? value.trim() : fallback;
}

function clampPercent(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function mergeQuoteSvgId(base: AboutUsQuoteSvgId | undefined, record: Record<string, unknown>): AboutUsQuoteSvgId {
  if (isAboutUsQuoteSvgId(record.quoteSvgId)) return record.quoteSvgId;
  if (Array.isArray(record.quoteSvgIds) && isAboutUsQuoteSvgId(record.quoteSvgIds[0])) {
    return record.quoteSvgIds[0];
  }
  return base && isAboutUsQuoteSvgId(base) ? base : 'globe';
}

function mergeQuoteSvgUrls(
  base: PortfolioAboutUsPresentationSettings['quoteSvgUrls'] | undefined,
  patch: unknown
): [string, string, string, string] {
  const fallback = base ?? DEFAULT_ABOUT_US_QUOTE_SVG_URLS;
  if (!Array.isArray(patch)) return [fallback[0], fallback[1], fallback[2], fallback[3]];
  return [0, 1, 2, 3].map((index) =>
    typeof patch[index] === 'string' ? patch[index].trim() : fallback[index]
  ) as [string, string, string, string];
}

function resolveAboutUsCtaLabel(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback || 'Contact';
  const trimmed = value.trim();
  if (!trimmed || /^about us$/i.test(trimmed)) return 'Contact';
  return trimmed;
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function pickAboutUsPresentationSettings(
  aboutUs: unknown
): PortfolioAboutUsPresentationSettings {
  return mergeAboutUsPresentation(DEFAULT_ABOUT_US_PRESENTATION, aboutUs);
}

export function mergeAboutUsPresentation(
  base: PortfolioAboutUsPresentationSettings,
  patch: unknown
): PortfolioAboutUsPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const design = isPortfolioAboutUsDesign(record.design) ? record.design : (base.design ?? 'stacked');
  const mediaSide = isPortfolioAboutUsMediaSide(record.mediaSide)
    ? record.mediaSide
    : isPortfolioAboutUsDesign(record.design) && record.design !== base.design
      ? defaultAboutUsMediaSide(design)
      : isPortfolioAboutUsMediaSide(base.mediaSide)
        ? base.mediaSide
        : defaultAboutUsMediaSide(design);
  return {
    ...mergeSectionBackground(base, patch),
    design,
    headerAlignment: pick(record.headerAlignment, ['left', 'center', 'right'], base.headerAlignment),
    sectionLayout: isPortfolioAboutUsSectionLayout(record.sectionLayout)
      ? record.sectionLayout
      : (base.sectionLayout ?? 'stacked'),
    contentPlacement: pick(record.contentPlacement, ['left', 'center', 'right'], base.contentPlacement),
    mediaSide,
    contentWidthPercent: clampPercent(record.contentWidthPercent, 50, 100, base.contentWidthPercent ?? 100),
    imageFrame: isPortfolioAboutUsImageFrame(record.imageFrame)
      ? record.imageFrame
      : (base.imageFrame ?? 'layered'),
    cardRadius: isPortfolioAboutUsCardRadius(record.cardRadius)
      ? record.cardRadius
      : (base.cardRadius ?? 'lg'),
    cardShadow: isPortfolioAboutUsCardShadow(record.cardShadow)
      ? record.cardShadow
      : (base.cardShadow ?? 'medium'),
    cardBorder: isPortfolioAboutUsCardBorder(record.cardBorder)
      ? record.cardBorder
      : (base.cardBorder ?? 'thin'),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor ?? '#e5e7eb'),
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor ?? '#ffffff'),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean'
        ? record.cardBackgroundEnabled
        : (base.cardBackgroundEnabled ?? true),
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    descriptionColor: sanitizeHex(record.descriptionColor, base.descriptionColor),
    quoteColor: sanitizeHex(record.quoteColor, base.quoteColor),
    taskColor: sanitizeHex(record.taskColor, base.taskColor),
    founderNameColor: sanitizeHex(record.founderNameColor, base.founderNameColor),
    founderFunctionColor: sanitizeHex(record.founderFunctionColor, base.founderFunctionColor),
    accentColor: sanitizeHex(record.accentColor, base.accentColor),
    showQuote: typeof record.showQuote === 'boolean' ? record.showQuote : (base.showQuote ?? true),
    showFounder: typeof record.showFounder === 'boolean' ? record.showFounder : (base.showFounder ?? true),
    showFounderRating:
      typeof record.showFounderRating === 'boolean' ? record.showFounderRating : (base.showFounderRating ?? true),
    showTasks: typeof record.showTasks === 'boolean' ? record.showTasks : (base.showTasks ?? true),
    showCta: typeof record.showCta === 'boolean' ? record.showCta : (base.showCta ?? false),
    ctaLabel: resolveAboutUsCtaLabel(record.ctaLabel, base.ctaLabel),
    quoteMedia: record.quoteMedia === 'image' || record.quoteMedia === 'svg' ? record.quoteMedia : (base.quoteMedia ?? 'svg'),
    quoteSvgId: mergeQuoteSvgId(base.quoteSvgId, record),
    quoteSvgUrls: mergeQuoteSvgUrls(base.quoteSvgUrls, record.quoteSvgUrls),
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    activeColorMode:
      record.activeColorMode === 'dark' || record.activeColorMode === 'light'
        ? record.activeColorMode
        : base.activeColorMode,
  };
}

export const PORTFOLIO_ABOUT_US_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioAboutUsSectionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Empilé',
    description: 'Titre au-dessus, contenu en dessous.',
  },
  {
    value: 'aside-left',
    label: 'Titre à gauche',
    description: 'Titre à gauche, contenu à droite (côte à côte).',
  },
  {
    value: 'aside-right',
    label: 'Titre à droite',
    description: 'Contenu à gauche, titre à droite (côte à côte).',
  },
];

export function aboutUsHeaderFontClass(font: PortfolioAboutUsHeaderFont, kind: 'title' | 'subtitle'): string {
  if (font === 'serif') return kind === 'title' ? 'font-serif font-bold tracking-tight' : 'font-serif';
  if (font === 'display') return 'font-black uppercase tracking-[0.08em]';
  return kind === 'title' ? 'font-sans font-bold tracking-tight' : 'font-sans';
}

export function aboutUsHeaderFontStyle(font: PortfolioAboutUsHeaderFont): CSSProperties | undefined {
  return font === 'display' ? { letterSpacing: '0.08em' } : undefined;
}

export function aboutUsTitleColorStyle(color: string): CSSProperties {
  return { color };
}

export function aboutUsSubtitleColorStyle(color: string): CSSProperties {
  return { color };
}
