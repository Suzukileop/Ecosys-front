import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  DEFAULT_CONTACT_COLOR_BINDINGS,
  mergeContactColorBindings,
  type PortfolioContactColorBindings,
} from '@/components/portfolio/portfolio-contact-palette-settings';
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

export type PortfolioContactStyleTarget =
  | 'channelValue'
  | 'linksHeading'
  | 'linkLabel'
  | 'linkUrl'
  | 'locationValue'
  | 'ctaLabel';

export type PortfolioContactElementStyles = Record<PortfolioContactStyleTarget, PortfolioElementTextStyle>;

export const CONTACT_STYLE_TARGET_IDS: PortfolioContactStyleTarget[] = [
  'channelValue',
  'linksHeading',
  'linkLabel',
  'linkUrl',
  'locationValue',
  'ctaLabel',
];

export const DEFAULT_CONTACT_CHANNEL_VALUE_COLOR = '#0a0a0a';
export const DEFAULT_CONTACT_LINKS_HEADING_COLOR = '#a3a3a3';
export const DEFAULT_CONTACT_LINK_LABEL_COLOR = '#0a0a0a';
export const DEFAULT_CONTACT_LINK_URL_COLOR = '#737373';
export const DEFAULT_CONTACT_LOCATION_VALUE_COLOR = '#0a0a0a';
export const DEFAULT_CONTACT_CTA_LABEL_COLOR = '#ffffff';

export const DEFAULT_CONTACT_ELEMENT_STYLES: PortfolioContactElementStyles = {
  channelValue: createElementTextStyle({
    color: DEFAULT_CONTACT_CHANNEL_VALUE_COLOR,
    size: 'lg',
    bold: true,
  }),
  linksHeading: createElementTextStyle({
    color: DEFAULT_CONTACT_LINKS_HEADING_COLOR,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  linkLabel: createElementTextStyle({
    color: DEFAULT_CONTACT_LINK_LABEL_COLOR,
    size: 'md',
    bold: true,
  }),
  linkUrl: createElementTextStyle({ color: DEFAULT_CONTACT_LINK_URL_COLOR, size: 'sm' }),
  locationValue: createElementTextStyle({
    color: DEFAULT_CONTACT_LOCATION_VALUE_COLOR,
    size: 'lg',
    bold: true,
  }),
  ctaLabel: createElementTextStyle({
    color: DEFAULT_CONTACT_CTA_LABEL_COLOR,
    size: 'sm',
    bold: true,
  }),
};

export const PORTFOLIO_CONTACT_STYLE_TARGET_OPTIONS: {
  value: PortfolioContactStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'channelValue', label: 'Channel value', description: 'Email and phone display text.' },
  { value: 'locationValue', label: 'Location', description: 'Location line in the contact card.' },
  { value: 'linksHeading', label: 'Links heading', description: '“Links & social” section label.' },
  { value: 'linkLabel', label: 'Link label', description: 'Social row title (Instagram, Website…).' },
  { value: 'linkUrl', label: 'Link URL', description: 'Muted URL under each social row.' },
  { value: 'ctaLabel', label: 'CTA label', description: 'Contact button text typography.' },
];

export function normalizeContactElementStyles(raw: unknown): PortfolioContactElementStyles {
  return normalizeElementStylesRecord(raw, DEFAULT_CONTACT_ELEMENT_STYLES, CONTACT_STYLE_TARGET_IDS);
}

export function patchContactElementStyle(
  styles: PortfolioContactElementStyles,
  target: PortfolioContactStyleTarget,
  patch: Partial<PortfolioElementTextStyle>
): PortfolioContactElementStyles {
  return patchElementStylesRecord(
    styles,
    target,
    patch,
    DEFAULT_CONTACT_ELEMENT_STYLES,
    CONTACT_STYLE_TARGET_IDS
  );
}

export type PortfolioContactTitlePreset = 'contact' | 'get-in-touch' | 'lets-talk' | 'start-a-project' | 'custom';

export type PortfolioContactSubtitlePreset = 'default' | 'short' | 'response-time' | 'minimal' | 'custom';

export type PortfolioContactHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioContactHeaderAlignment = 'left' | 'center';

/** How the section title relates to the contact content. */
export type PortfolioContactSectionLayout = 'stacked' | 'aside-left' | 'aside-right';

/** Decorative contact illustration beside the content block. */
export type PortfolioContactIllustrationVariant =
  | 'none'
  | 'chat'
  | 'question'
  | 'docs'
  | 'support'
  | 'hex';

export type PortfolioContactIllustrationPlacement = 'left' | 'right';

export type PortfolioContactCardDesign =
  | 'editorial'
  | 'directory'
  | 'tiles'
  | 'stacked'
  | 'inquiry'
  | 'inquiry-panel'
  | 'desk'
  | 'info-panel';

/** Either Inquiry layout (illustration or panel). */
export function isContactInquiryFamily(
  design: PortfolioContactCardDesign | undefined
): boolean {
  return design === 'inquiry' || design === 'inquiry-panel';
}

export function isContactInquiryPanelDesign(
  design: PortfolioContactCardDesign | undefined
): boolean {
  return design === 'inquiry-panel';
}

export function isContactDeskDesign(
  design: PortfolioContactCardDesign | undefined
): boolean {
  return design === 'desk';
}

export function isContactInfoPanelDesign(
  design: PortfolioContactCardDesign | undefined
): boolean {
  return design === 'info-panel';
}

/** Layouts that own their chrome and lock the contact form on. */
export function isContactOwnedLayoutDesign(
  design: PortfolioContactCardDesign | undefined
): boolean {
  return (
    isContactInquiryFamily(design) ||
    isContactDeskDesign(design) ||
    isContactInfoPanelDesign(design)
  );
}

export type PortfolioContactCtaDesign = 'pill-dark' | 'pill-outline' | 'pill-accent' | 'full-width';

export type PortfolioContactBlockOrder = 'primary-first' | 'links-first';

export type PortfolioContactCardMaxWidth = 'md' | 'lg' | 'xl' | 'full';

export type PortfolioContactCardPlacement = 'left' | 'center' | 'right';

/** Icon position relative to the label / value text. */
export type PortfolioContactIconPlacement = 'left' | 'top' | 'right';

/** Badge shell size for channel + social icons. */
export type PortfolioContactIconSize = 'sm' | 'md' | 'lg' | 'xl';

/** Corner radius of the icon badge. */
export type PortfolioContactIconRadius = 'md' | 'lg' | 'xl' | 'full';

/** Outline around the icon badge. */
export type PortfolioContactIconBorder = 'none' | 'soft' | 'solid';

export type PortfolioContactItemGap = 'none' | 'sm' | 'md' | 'lg';

export type PortfolioContactFormPlacement = 'side' | 'below';

/**
 * Independent form chrome — decoupled from section `cardDesign`.
 * Existing owned layouts migrate to the matching form design.
 */
export type PortfolioContactFormDesign =
  | 'classic'
  | 'inquiry'
  | 'inquiry-panel'
  | 'desk'
  | 'info-panel'
  | 'project-brief'
  | 'stepped-inquiry'
  | 'workspace-chat'
  | 'minimal-underline';

export const PORTFOLIO_CONTACT_FORM_DESIGN_VALUES: PortfolioContactFormDesign[] = [
  'classic',
  'inquiry',
  'inquiry-panel',
  'desk',
  'info-panel',
  'project-brief',
  'stepped-inquiry',
  'workspace-chat',
  'minimal-underline',
];

/** Map legacy layout-owned chrome onto an explicit form design. */
export function migrateContactFormDesignFromCardDesign(
  cardDesign: PortfolioContactCardDesign | undefined
): PortfolioContactFormDesign {
  switch (cardDesign) {
    case 'inquiry':
      return 'inquiry';
    case 'inquiry-panel':
      return 'inquiry-panel';
    case 'desk':
      return 'desk';
    case 'info-panel':
      return 'info-panel';
    default:
      return 'classic';
  }
}

export function resolveContactFormDesign(p: {
  formDesign?: PortfolioContactFormDesign;
  cardDesign?: PortfolioContactCardDesign;
}): PortfolioContactFormDesign {
  if (
    p.formDesign &&
    (PORTFOLIO_CONTACT_FORM_DESIGN_VALUES as string[]).includes(p.formDesign)
  ) {
    return p.formDesign;
  }
  return migrateContactFormDesignFromCardDesign(p.cardDesign);
}

export function isContactFormDesign(
  value: unknown
): value is PortfolioContactFormDesign {
  return (
    typeof value === 'string' &&
    (PORTFOLIO_CONTACT_FORM_DESIGN_VALUES as string[]).includes(value)
  );
}

/** Active Global color mode for manual (non-palette) light/dark picks. */
export function contactActiveColorMode(p: {
  activeColorMode?: 'light' | 'dark';
}): 'light' | 'dark' {
  return p.activeColorMode === 'light' ? 'light' : 'dark';
}

export type PortfolioContactPresentationSettings = PortfolioSectionBackgroundSettings &
  PortfolioServicesCardBackgroundSettings & {
  titlePreset: PortfolioContactTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioContactSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioContactHeaderFont;
  subtitleFont: PortfolioContactHeaderFont;
  titleColor: string;
  subtitleColor: string;
  subtitleSerif: boolean;
  headerAlignment: PortfolioContactHeaderAlignment;
  /**
   * `stacked` — title above the content (default).
   * `aside-left` / `aside-right` — title beside the content on large screens.
   * Owned layouts (inquiry / inquiry-panel / desk / info-panel) manage their own
   * composition and may keep stacked behavior regardless of this setting.
   */
  sectionLayout: PortfolioContactSectionLayout;
  /**
   * Decorative SVG beside the contact content (`none` hides it).
   * Owned layouts may ignore this in favour of their built-in illustration.
   */
  illustrationVariant: PortfolioContactIllustrationVariant;
  /** Side of the content for the decorative SVG on large screens. */
  illustrationPlacement: PortfolioContactIllustrationPlacement;
  cardDesign: PortfolioContactCardDesign;
  ctaDesign: PortfolioContactCtaDesign;
  ctaLabel: string;
  ctaColor: string;
  blockOrder: PortfolioContactBlockOrder;
  cardMaxWidth: PortfolioContactCardMaxWidth;
  cardPlacement: PortfolioContactCardPlacement;
  /** Icon vs text: left, top, or right of the label. */
  iconPlacement: PortfolioContactIconPlacement;
  /** Badge size for email / phone / location / social icons. */
  iconSize: PortfolioContactIconSize;
  /** Corner radius of the icon badge. */
  iconRadius: PortfolioContactIconRadius;
  /** Outline style around the icon badge. */
  iconBorder: PortfolioContactIconBorder;
  /** Border color when iconBorder is soft or solid. */
  iconBorderColor: string;
  /** Badge fill. Empty = soft accent tint from CTA color. */
  iconBackgroundColor: string;
  /** When false, icon badges have no fill (glyph / border only). */
  iconBackgroundEnabled: boolean;
  /** Glyph color for channel / monochrome icons. Empty = CTA accent. */
  iconColor: string;
  /** When true, social platforms keep their brand badge colors. */
  iconUseBrandColors: boolean;
  /** Vertical spacing between contact rows / tiles. */
  itemGap: PortfolioContactItemGap;
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showSocialLinks: boolean;
  showCta: boolean;
  showResponseTimeInSubtitle: boolean;
  /** Contact message form next to / below the info list. Off by default for existing portfolios. */
  showContactForm: boolean;
  /**
   * Visual / field chrome for the message form — independent from section `cardDesign`.
   */
  formDesign: PortfolioContactFormDesign;
  /**
   * Injected at render from Global color mode — drives `colorDark` when palette is off.
   * Not persisted in settings JSON.
   */
  activeColorMode?: 'light' | 'dark';
  contactFormTitle: string;
  contactFormSubmitLabel: string;
  contactFormPlacement: PortfolioContactFormPlacement;
  /** Extra vertical space between contact list and form when stacked. */
  formStackGap: PortfolioContactItemGap;
  /** Outer border around the message form container (all contact designs). */
  formBorder: PortfolioServicesCardBorder;
  /** Border color when formBorder is soft or solid. */
  formBorderColor: string;
  /** Drop shadow / lift halo around the message form container. */
  formShadow: PortfolioContactFormShadow;
  /** 0–100 — scales formShadow blur strength. */
  formShadowIntensity: number;
  /**
   * Inquiry panel only — left column headline (overrides section title in that layout).
   */
  inquiryHeadline: string;
  /**
   * Inquiry panel only — left column supporting paragraph.
   */
  inquirySupporting: string;
  /**
   * Desk design only — topic chips under the form (one label per line).
   */
  deskTopicOptions: string;
  /**
   * Info panel only — left column title (e.g. Contact Information).
   */
  infoPanelHeadline: string;
  /**
   * Info panel only — left column supporting paragraph.
   */
  infoPanelSupporting: string;
  /** When true, section colors follow the Hero semantic palette. */
  useHeroPalette: boolean;
  /** Which Global palette token paints each Contact color slot (when palette is on). */
  contactColorBindings: PortfolioContactColorBindings;
  /** Unified typography for contact card body text. */
  elementStyles: PortfolioContactElementStyles;
};

export type PortfolioContactFormShadow = 'none' | 'soft' | 'float' | 'deep';

export type PortfolioContactSectionSettings = PortfolioSectionCopy & PortfolioContactPresentationSettings;

export const DEFAULT_CONTACT_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_CONTACT_SUBTITLE_COLOR = '#737373';
export const DEFAULT_CONTACT_CTA_COLOR = '#ea580c';
export const DEFAULT_CONTACT_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_CONTACT_CARD_BACKGROUND_COLOR = '#ffffff';

export const DEFAULT_CONTACT_PRESENTATION: PortfolioContactPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  titlePreset: 'contact',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'serif',
  titleColor: DEFAULT_CONTACT_TITLE_COLOR,
  subtitleColor: DEFAULT_CONTACT_SUBTITLE_COLOR,
  subtitleSerif: true,
  headerAlignment: 'center',
  sectionLayout: 'stacked',
  illustrationVariant: 'none',
  illustrationPlacement: 'right',
  cardDesign: 'editorial',
  ctaDesign: 'pill-dark',
  ctaLabel: 'Start a project',
  ctaColor: DEFAULT_CONTACT_CTA_COLOR,
  blockOrder: 'primary-first',
  cardMaxWidth: 'xl',
  cardPlacement: 'center',
  iconPlacement: 'left',
  iconSize: 'md',
  iconRadius: 'lg',
  iconBorder: 'none',
  iconBorderColor: DEFAULT_CONTACT_CARD_BORDER_COLOR,
  iconBackgroundColor: '',
  iconBackgroundEnabled: true,
  iconColor: '',
  iconUseBrandColors: true,
  itemGap: 'md',
  cardBorder: 'soft',
  cardBorderColor: DEFAULT_CONTACT_CARD_BORDER_COLOR,
  cardBackgroundEnabled: false,
  cardBackgroundColor: DEFAULT_CONTACT_CARD_BACKGROUND_COLOR,
  cardBorderRadius: 'md',
  cardPadding: 'md',
  showEmail: true,
  showPhone: true,
  showLocation: false,
  showSocialLinks: true,
  showCta: true,
  showResponseTimeInSubtitle: true,
  showContactForm: false,
  formDesign: 'classic',
  contactFormTitle: 'Send a message',
  contactFormSubmitLabel: 'Send message',
  contactFormPlacement: 'below',
  formStackGap: 'lg',
  formBorder: 'soft',
  formBorderColor: DEFAULT_CONTACT_CARD_BORDER_COLOR,
  formShadow: 'float',
  formShadowIntensity: 55,
  inquiryHeadline: 'Start your project today!',
  inquirySupporting:
    'Share a short brief about your goals. I will get back to you with next steps.',
  deskTopicOptions: 'Development\nOthers',
  infoPanelHeadline: 'Contact Information',
  infoPanelSupporting:
    'Reach out with a short brief — I typically reply within one business day.',
  useHeroPalette: false,
  contactColorBindings: { ...DEFAULT_CONTACT_COLOR_BINDINGS },
  elementStyles: DEFAULT_CONTACT_ELEMENT_STYLES,
};

export const PORTFOLIO_CONTACT_FORM_SHADOW_OPTIONS: {
  value: PortfolioContactFormShadow;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Flat form — no drop shadow.' },
  { value: 'soft', label: 'Soft', description: 'Light lift around the form.' },
  { value: 'float', label: 'Float', description: 'Soft halo — default for split layouts.' },
  { value: 'deep', label: 'Deep', description: 'Strong shadow for extra depth.' },
];

export const PORTFOLIO_CONTACT_FORM_DESIGN_OPTIONS: {
  value: PortfolioContactFormDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Standard title + name, email, subject, and message.',
  },
  {
    value: 'inquiry',
    label: 'Inquiry',
    description: 'Conversational labels for the split inquiry layout.',
  },
  {
    value: 'inquiry-panel',
    label: 'Inquiry panel',
    description: 'Name, email, phone, and company grid.',
  },
  {
    value: 'desk',
    label: 'Desk',
    description: 'Two-column fields with optional topic chips.',
  },
  {
    value: 'info-panel',
    label: 'Info panel',
    description: 'Accent-filled form with light or dark field chrome.',
  },
  {
    value: 'project-brief',
    label: 'Project brief',
    description: 'Framed brief with header, full-width CTA, and contact footer.',
  },
  {
    value: 'stepped-inquiry',
    label: 'Step inquiry',
    description: 'Four numbered steps — one field group at a time.',
  },
  {
    value: 'workspace-chat',
    label: 'Workspace chat',
    description: 'Message / Quote toggle with numbered identity blocks.',
  },
  {
    value: 'minimal-underline',
    label: 'Minimal underline',
    description: 'Underline-only fields with a compact contact footer.',
  },
];

export const PORTFOLIO_CONTACT_FORM_SHADOW_PRESET_INTENSITY: Record<PortfolioContactFormShadow, number> = {
  none: 0,
  soft: 28,
  float: 55,
  deep: 82,
};

export function clampContactFormShadowIntensity(value: unknown, fallback = 55): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const PORTFOLIO_CONTACT_TITLE_PRESET_OPTIONS: {
  value: PortfolioContactTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'contact', label: 'Contact', description: 'Classic professional label.' },
  { value: 'get-in-touch', label: 'Get in touch', description: 'Friendly and open.' },
  { value: 'lets-talk', label: "Let's talk", description: 'Conversational tone.' },
  { value: 'start-a-project', label: 'Start a project', description: 'Action-oriented CTA feel.' },
  { value: 'custom', label: 'Custom', description: 'Your own section title.' },
];

export const PORTFOLIO_CONTACT_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioContactSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  { value: 'short', label: 'Short', description: 'One concise supporting line.' },
  { value: 'response-time', label: 'Response time', description: 'Mentions typical reply speed.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_CONTACT_HEADER_FONT_OPTIONS: {
  value: PortfolioContactHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_CONTACT_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioContactSectionLayout;
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
    description: 'Titre à gauche, contenu contact à droite (côte à côte).',
  },
  {
    value: 'aside-right',
    label: 'Titre à droite',
    description: 'Contenu contact à gauche, titre à droite (côte à côte).',
  },
];

export function isPortfolioContactSectionLayout(
  value: unknown
): value is PortfolioContactSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

export function contactSectionLayoutIsAside(
  layout: PortfolioContactSectionLayout | undefined
): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

/** Two-column shell for title + contact content (large screens). */
export function contactAsideLayoutClass(layout: PortfolioContactSectionLayout): string {
  if (layout === 'aside-right') {
    return 'grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
  }
  return 'grid w-full gap-10 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
}

export const PORTFOLIO_CONTACT_ILLUSTRATION_OPTIONS: {
  value: PortfolioContactIllustrationVariant;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de SVG décoratif à côté du contenu.' },
  { value: 'chat', label: 'Chat', description: 'Bulles de conversation.' },
  { value: 'question', label: 'Question', description: 'Point d’interrogation graphique.' },
  { value: 'docs', label: 'Docs', description: 'Documents superposés.' },
  { value: 'support', label: 'Support', description: 'Illustration support / casque.' },
  { value: 'hex', label: 'Hex', description: 'Symbole hexagonal.' },
];

export const PORTFOLIO_CONTACT_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioContactIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'SVG à gauche du contenu contact.' },
  { value: 'right', label: 'Droite', description: 'SVG à droite du contenu contact.' },
];

export function isPortfolioContactIllustrationVariant(
  value: unknown
): value is PortfolioContactIllustrationVariant {
  return (
    value === 'none' ||
    value === 'chat' ||
    value === 'question' ||
    value === 'docs' ||
    value === 'support' ||
    value === 'hex'
  );
}

export function isPortfolioContactIllustrationPlacement(
  value: unknown
): value is PortfolioContactIllustrationPlacement {
  return value === 'left' || value === 'right';
}

export const PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS: {
  value: PortfolioContactCardDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'One panel — 2-column grid with hairline dividers.',
  },
  {
    value: 'directory',
    label: 'Directory',
    description: 'Single-column list — every item as the same compact row.',
  },
  {
    value: 'tiles',
    label: 'Tiles',
    description: 'Each item in its own bordered tile — gap grid, no shared dividers.',
  },
  {
    value: 'stacked',
    label: 'Stacked',
    description: 'Full-width cards stacked with space between.',
  },
  {
    value: 'inquiry',
    label: 'Inquiry split',
    description: 'Copy + illustration left, message form card right.',
  },
  {
    value: 'inquiry-panel',
    label: 'Inquiry panel',
    description: 'Headline + email/phone chips left, form on accent block right.',
  },
  {
    value: 'desk',
    label: 'Contact desk',
    description: 'Channel cards on top, two-column form with topic chips below.',
  },
  {
    value: 'info-panel',
    label: 'Info panel',
    description: 'Contact details left, accent form card right — framed shell.',
  },
];

export const PORTFOLIO_CONTACT_ICON_PLACEMENT_OPTIONS: {
  value: PortfolioContactIconPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Icon to the left of the label.' },
  { value: 'top', label: 'Top', description: 'Icon above the label.' },
  { value: 'right', label: 'Right', description: 'Icon to the right of the label.' },
];

export const PORTFOLIO_CONTACT_ICON_SIZE_OPTIONS: {
  value: PortfolioContactIconSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact badges.' },
  { value: 'md', label: 'Medium', description: 'Default size.' },
  { value: 'lg', label: 'Large', description: 'More visible icons.' },
  { value: 'xl', label: 'Extra large', description: 'Hero-sized badges.' },
];

export const PORTFOLIO_CONTACT_ICON_RADIUS_OPTIONS: {
  value: PortfolioContactIconRadius;
  label: string;
  description: string;
}[] = [
  { value: 'md', label: 'Rounded', description: 'Soft corners.' },
  { value: 'lg', label: 'Soft square', description: 'Default rounded-2xl look.' },
  { value: 'xl', label: 'Very soft', description: 'Larger radius.' },
  { value: 'full', label: 'Circle', description: 'Fully round badges.' },
];

export const PORTFOLIO_CONTACT_ICON_BORDER_OPTIONS: {
  value: PortfolioContactIconBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No outline around the badge.' },
  { value: 'soft', label: 'Soft', description: 'Light hairline border.' },
  { value: 'solid', label: 'Solid', description: 'Clear border in the icon border color.' },
];

export const PORTFOLIO_CONTACT_ITEM_GAP_OPTIONS: {
  value: PortfolioContactItemGap;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Flush rows — hairline dividers where the design uses them.' },
  { value: 'sm', label: 'Small', description: 'Tight vertical spacing.' },
  { value: 'md', label: 'Medium', description: 'Balanced spacing — default.' },
  { value: 'lg', label: 'Large', description: 'Airy vertical spacing.' },
];

export const PORTFOLIO_CONTACT_FORM_STACK_GAP_OPTIONS: {
  value: PortfolioContactItemGap;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Compact', description: 'Smaller gap between list and form.' },
  { value: 'sm', label: 'Small', description: 'Light separation.' },
  { value: 'md', label: 'Medium', description: 'Clear separation.' },
  { value: 'lg', label: 'Large', description: 'Wide space — form clearly below the list.' },
];

export const PORTFOLIO_CONTACT_CARD_PADDING_OPTIONS: {
  value: PortfolioServicesCardPadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No frame inset.' },
  { value: 'sm', label: 'Small', description: 'Tight padding inside the card.' },
  { value: 'md', label: 'Medium', description: 'Balanced padding — shared by list + form.' },
  { value: 'lg', label: 'Large', description: 'Roomy padding for both blocks.' },
];

export const PORTFOLIO_CONTACT_CTA_DESIGN_OPTIONS: {
  value: PortfolioContactCtaDesign;
  label: string;
  description: string;
}[] = [
  { value: 'pill-dark', label: 'Dark pill', description: 'Solid Texte fort fill — default.' },
  { value: 'pill-outline', label: 'Outline pill', description: 'Bordered button using Texte fort.' },
  { value: 'pill-accent', label: 'Accent pill', description: 'Principal accent fill.' },
  { value: 'full-width', label: 'Full width', description: 'Wide CTA bar below channels.' },
];

export const PORTFOLIO_CONTACT_BLOCK_ORDER_OPTIONS: {
  value: PortfolioContactBlockOrder;
  label: string;
  description: string;
}[] = [
  { value: 'primary-first', label: 'Channels first', description: 'Email / phone / location appear before social links.' },
  { value: 'links-first', label: 'Links first', description: 'Social links appear before email / phone / location.' },
];

export const PORTFOLIO_CONTACT_CARD_MAX_WIDTH_OPTIONS: {
  value: PortfolioContactCardMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'md', label: 'Medium', description: 'Compact centered card.' },
  { value: 'lg', label: 'Large', description: 'Balanced width.' },
  { value: 'xl', label: 'XL', description: 'Default wide card.' },
  { value: 'full', label: 'Full width', description: 'Stretches to section width.' },
];

/** Desk-focused width labels (same values, clearer copy). */
export const PORTFOLIO_CONTACT_DESK_WIDTH_OPTIONS: {
  value: PortfolioContactCardMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'lg', label: 'Large', description: 'Roomy but compact.' },
  { value: 'xl', label: 'Wide', description: 'Wide with a slight side inset.' },
  { value: 'full', label: 'Full width', description: 'Uses the full section width.' },
];

/** Shared by Desk + Info panel. */
export const PORTFOLIO_CONTACT_WIDE_LAYOUT_WIDTH_OPTIONS = PORTFOLIO_CONTACT_DESK_WIDTH_OPTIONS;

export const PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS: {
  value: PortfolioContactCardPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Align the contact card to the left.' },
  { value: 'center', label: 'Center', description: 'Center the card in the section.' },
  { value: 'right', label: 'Right', description: 'Align the contact card to the right.' },
];

export const PORTFOLIO_CONTACT_FORM_PLACEMENT_OPTIONS: {
  value: PortfolioContactFormPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'side',
    label: 'Side by side',
    description: 'Info and form in two columns on large screens — same Frame padding on both.',
  },
  {
    value: 'below',
    label: 'Vertical stack',
    description: 'One combined card — contact info on top, form pinned at the bottom.',
  },
];

const SUBTITLE_PRESET_COPY: Record<
  Exclude<PortfolioContactSubtitlePreset, 'default' | 'custom' | 'minimal' | 'response-time'>,
  string
> = {
  short: 'Reach out to discuss your project — I would be glad to hear from you.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

export function resolveContactSectionTitle(
  settings: Pick<PortfolioContactSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  switch (settings.titlePreset) {
    case 'get-in-touch':
      return 'GET IN TOUCH';
    case 'lets-talk':
      return "LET'S TALK";
    case 'start-a-project':
      return 'START A PROJECT';
    case 'custom':
      return settings.titleCustom.trim() || settings.title.trim() || 'CONTACT';
    default:
      return 'CONTACT';
  }
}

export function resolveContactSectionSubtitle(
  settings: Pick<PortfolioContactSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>,
  responseTimeLabel?: string | null
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'response-time':
      if (responseTimeLabel?.trim()) {
        return `I typically reply ${responseTimeLabel.toLowerCase()} — share your brief and we can take it from there.`;
      }
      return settings.subtitle.trim() || SUBTITLE_PRESET_COPY.short;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function contactHeaderFontClass(font: PortfolioContactHeaderFont, kind: 'title' | 'subtitle'): string {
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

export function contactHeaderFontStyle(
  font: PortfolioContactHeaderFont,
  subtitleSerif: boolean,
  kind: 'title' | 'subtitle'
): CSSProperties | undefined {
  if (kind === 'subtitle' && subtitleSerif) return { fontFamily: "'Playfair Display', serif" };
  if (kind === 'title' && font === 'serif') return { fontFamily: "'Playfair Display', serif" };
  return undefined;
}

export function contactTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_CONTACT_TITLE_COLOR) };
}

export function contactSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_CONTACT_SUBTITLE_COLOR) };
}

export function contactCardShellClass(design: PortfolioContactCardDesign): string {
  switch (design) {
    case 'stacked':
      return 'flex flex-col gap-3 bg-transparent !border-0 !shadow-none !p-0';
    case 'tiles':
      return 'overflow-visible bg-transparent !border-0 !shadow-none';
    case 'inquiry':
    case 'inquiry-panel':
    case 'desk':
    case 'info-panel':
      return 'overflow-visible bg-transparent !border-0 !shadow-none !p-0';
    case 'directory':
      return 'overflow-hidden';
    default:
      return 'overflow-hidden';
  }
}

export function contactCardPlacementClass(placement: PortfolioContactCardPlacement): string {
  switch (placement) {
    case 'left':
      return 'mr-auto ml-0';
    case 'right':
      return 'ml-auto mr-0';
    default:
      return 'mx-auto';
  }
}

function contactCardBorderWidthClass(border: PortfolioServicesCardBorder): string {
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

export function contactCardFrameClass(p: PortfolioContactPresentationSettings): string {
  // Stacked / tiles / inquiry / desk own their chrome — outer shell stays light.
  if (
    p.cardDesign === 'stacked' ||
    p.cardDesign === 'tiles' ||
    isContactOwnedLayoutDesign(p.cardDesign)
  ) {
    const parts = [servicesCardRadiusClass(p.cardBorderRadius)];
    if (p.cardDesign === 'tiles') {
      parts.push(servicesCardPaddingClass(p.cardPadding === 'none' ? 'sm' : p.cardPadding));
    }
    return parts.filter(Boolean).join(' ');
  }

  const parts = [servicesCardRadiusClass(p.cardBorderRadius), servicesCardPaddingClass(p.cardPadding)];
  if (p.cardBorder !== 'none') {
    parts.push(contactCardBorderWidthClass(p.cardBorder));
    if (p.cardBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function contactCardFrameStyle(p: PortfolioContactPresentationSettings): CSSProperties {
  const style: CSSProperties = {};
  if (p.cardDesign === 'stacked' || isContactOwnedLayoutDesign(p.cardDesign)) return style;

  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_CONTACT_CARD_BACKGROUND_COLOR);
  }

  if (p.cardDesign === 'tiles') return style;

  if (p.cardBorder === 'accent') {
    style.borderColor = sanitizeHex(p.ctaColor, DEFAULT_CONTACT_CTA_COLOR);
  } else if (p.cardBorder === 'soft' || p.cardBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.cardBorderColor, DEFAULT_CONTACT_CARD_BORDER_COLOR);
  }
  return style;
}

/** CSS vars for inner chrome — dividers, accents, hovers — synced to Frame / palette. */
export function contactChromeCssVars(p: PortfolioContactPresentationSettings): CSSProperties {
  const border = sanitizeHex(p.cardBorderColor, DEFAULT_CONTACT_CARD_BORDER_COLOR);
  const accent = sanitizeHex(p.ctaColor, DEFAULT_CONTACT_CTA_COLOR);
  const ink = sanitizeHex(p.titleColor, DEFAULT_CONTACT_TITLE_COLOR);
  const muted = sanitizeHex(p.subtitleColor, DEFAULT_CONTACT_SUBTITLE_COLOR);
  const surface = sanitizeHex(p.cardBackgroundColor, DEFAULT_CONTACT_CARD_BACKGROUND_COLOR);
  return {
    ['--contact-border' as string]: border,
    ['--contact-accent' as string]: accent,
    ['--contact-ink' as string]: ink,
    ['--contact-muted' as string]: muted,
    ['--contact-surface' as string]: surface,
    ['--contact-hover-fill' as string]: `color-mix(in srgb, ${accent} 10%, transparent)`,
    ['--contact-accent-soft' as string]: `color-mix(in srgb, ${accent} 14%, transparent)`,
  };
}

export function contactCardMaxWidthClass(maxWidth: PortfolioContactCardMaxWidth): string {
  switch (maxWidth) {
    case 'md':
      return 'max-w-2xl';
    case 'lg':
      return 'max-w-3xl';
    case 'full':
      return 'max-w-none';
    default:
      return 'max-w-4xl';
  }
}

/** Unified list layout for every contact item (channels + links share the same rows). */
export function contactItemGapClass(gap: PortfolioContactItemGap = 'md'): string {
  switch (gap) {
    case 'none':
      return 'gap-0';
    case 'sm':
      return 'gap-2';
    case 'lg':
      return 'gap-6 sm:gap-7';
    default:
      return 'gap-4 sm:gap-5';
  }
}

export function contactItemsLayoutClass(
  design: PortfolioContactCardDesign,
  itemGap: PortfolioContactItemGap = 'md'
): string {
  const gapClass = contactItemGapClass(itemGap);

  switch (design) {
    case 'directory':
      return itemGap === 'none'
        ? 'flex flex-col divide-y divide-[color:var(--contact-border,#e5e5e5)]'
        : `flex flex-col ${gapClass}`;
    case 'tiles':
      return `grid sm:grid-cols-2 ${gapClass}`;
    case 'stacked':
      return `flex flex-col ${gapClass}`;
    case 'inquiry':
    case 'inquiry-panel':
    case 'desk':
    case 'info-panel':
      return `flex flex-col ${gapClass}`;
    default:
      // Editorial
      return itemGap === 'none'
        ? 'grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[color:var(--contact-border,#e5e5e5)]'
        : `grid sm:grid-cols-2 ${gapClass}`;
  }
}

export function contactItemRowShellClass(
  design: PortfolioContactCardDesign,
  cardPadding: PortfolioServicesCardPadding = 'md'
): string {
  const scale = cardPadding === 'none' ? 'sm' : cardPadding;
  const pad =
    scale === 'lg'
      ? 'px-5 py-5 sm:px-6 sm:py-6'
      : scale === 'sm'
        ? 'px-3 py-3.5 sm:px-4 sm:py-4'
        : 'px-4 py-4 sm:px-5 sm:py-5';

  if (design === 'tiles') {
    return `rounded-[1.25rem] border border-[color:var(--contact-border,#e5e5e5)] bg-transparent ${pad} transition hover:border-[color:var(--contact-accent,#ea580c)]`;
  }
  if (design === 'stacked') {
    return `rounded-[1.35rem] border border-[color:var(--contact-border,#e5e5e5)] bg-transparent ${pad} transition hover:border-[color:var(--contact-accent,#ea580c)]`;
  }
  return `${pad} transition hover:bg-[color:var(--contact-hover-fill,transparent)]`;
}

export function contactIconPlacementClass(placement: PortfolioContactIconPlacement): {
  row: string;
  icon: string;
  text: string;
} {
  switch (placement) {
    case 'top':
      return {
        row: 'flex flex-col items-start gap-3',
        icon: 'shrink-0',
        text: 'min-w-0 w-full',
      };
    case 'right':
      return {
        row: 'flex flex-row items-center gap-4',
        icon: 'shrink-0',
        text: 'min-w-0 flex-1',
      };
    default:
      return {
        row: 'flex flex-row items-center gap-4',
        icon: 'shrink-0',
        text: 'min-w-0 flex-1',
      };
  }
}

export function contactIconShellSizeClass(size: PortfolioContactIconSize = 'md'): string {
  switch (size) {
    case 'sm':
      return 'h-9 w-9';
    case 'lg':
      return 'h-14 w-14';
    case 'xl':
      return 'h-16 w-16';
    default:
      return 'h-12 w-12';
  }
}

export function contactIconGlyphClass(size: PortfolioContactIconSize = 'md'): string {
  switch (size) {
    case 'sm':
      return 'h-4 w-4';
    case 'lg':
      return 'h-7 w-7';
    case 'xl':
      return 'h-8 w-8';
    default:
      return 'h-6 w-6';
  }
}

export function contactIconRadiusClass(radius: PortfolioContactIconRadius = 'lg'): string {
  switch (radius) {
    case 'md':
      return 'rounded-xl';
    case 'xl':
      return 'rounded-3xl';
    case 'full':
      return 'rounded-full';
    default:
      return 'rounded-2xl';
  }
}

export function contactIconBorderClass(border: PortfolioContactIconBorder = 'none'): string {
  switch (border) {
    case 'soft':
      return 'border border-black/10';
    case 'solid':
      return 'border';
    default:
      return 'border border-transparent';
  }
}

/** Resolved badge shell classes from presentation. */
export function contactIconShellClass(
  p: Pick<PortfolioContactPresentationSettings, 'iconSize' | 'iconRadius' | 'iconBorder'>
): string {
  return [
    'flex shrink-0 items-center justify-center',
    contactIconShellSizeClass(p.iconSize ?? 'md'),
    contactIconRadiusClass(p.iconRadius ?? 'lg'),
    contactIconBorderClass(p.iconBorder ?? 'none'),
  ].join(' ');
}

/**
 * Badge surface + glyph color.
 * Empty background/color strings keep the soft accent tint / CTA accent (legacy look).
 * When iconBackgroundEnabled is false, fill is transparent (glyph + optional border only).
 */
export function contactIconShellStyle(
  p: Pick<
    PortfolioContactPresentationSettings,
    | 'iconBackgroundColor'
    | 'iconBackgroundEnabled'
    | 'iconColor'
    | 'iconBorder'
    | 'iconBorderColor'
    | 'ctaColor'
  >
): CSSProperties {
  const accent = sanitizeHex(p.ctaColor, DEFAULT_CONTACT_CTA_COLOR);
  const customBg = typeof p.iconBackgroundColor === 'string' ? p.iconBackgroundColor.trim() : '';
  const customColor = typeof p.iconColor === 'string' ? p.iconColor.trim() : '';
  const style: CSSProperties = {};

  if (p.iconBackgroundEnabled === false) {
    style.backgroundColor = 'transparent';
  } else if (customBg && isValidProfileHexColor(customBg)) {
    style.backgroundColor = customBg;
  } else if (customColor && isValidProfileHexColor(customColor)) {
    style.backgroundColor = `color-mix(in srgb, ${customColor} 14%, transparent)`;
  } else {
    style.backgroundColor = 'var(--contact-accent-soft, rgba(234,88,12,0.12))';
  }

  if (customColor && isValidProfileHexColor(customColor)) {
    style.color = customColor;
  } else {
    style.color = `var(--contact-accent, ${accent})`;
  }

  if (p.iconBorder === 'soft' || p.iconBorder === 'solid') {
    style.borderColor = sanitizeHex(p.iconBorderColor, DEFAULT_CONTACT_CARD_BORDER_COLOR);
  }

  return style;
}

/** @deprecated Prefer contactItemsLayoutClass. */
export function contactChannelGridClass(
  design: PortfolioContactCardDesign,
  _channelCount?: number,
  itemGap: PortfolioContactItemGap = 'md'
): string {
  return contactItemsLayoutClass(design, itemGap);
}

/** @deprecated Prefer contactItemRowShellClass. */
export function contactChannelPaddingClass(
  design: PortfolioContactCardDesign,
  cardPadding: PortfolioServicesCardPadding = 'md'
): string {
  return contactItemRowShellClass(design, cardPadding);
}

/** @deprecated Channels and links share one list. */
export function contactLinksBlockClass(
  _design: PortfolioContactCardDesign,
  _blockOrder: PortfolioContactBlockOrder
): string {
  return 'bg-transparent';
}

/** @deprecated Split layout removed. */
export function contactBodyLayoutClass(_design: PortfolioContactCardDesign): string {
  return '';
}

export function contactStackedChannelShellClass(): string {
  return 'rounded-[1.35rem] border bg-transparent border-[color:var(--contact-border,#e5e5e5)]';
}

/** Spacing between contact list and form when stacked vertically. */
export function contactFormStackGapClass(gap: PortfolioContactItemGap = 'lg'): string {
  switch (gap) {
    case 'none':
      return 'gap-6 sm:gap-7';
    case 'sm':
      return 'gap-8 sm:gap-10';
    case 'md':
      return 'gap-10 sm:gap-12';
    default:
      return 'gap-12 sm:gap-16';
  }
}

/** Soft elevated card for the Inquiry form panel. */
export function contactInquiryFormCardClass(p: PortfolioContactPresentationSettings): string {
  return contactFormFrameClass(p);
}

/** Desk — main form panel under the channel row. */
export function contactDeskFormPanelClass(p: PortfolioContactPresentationSettings): string {
  return contactFormFrameClass(p);
}

function contactFormBorderWidthClass(border: PortfolioServicesCardBorder): string {
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

function contactFormShadowIntensityValue(
  p: Pick<PortfolioContactPresentationSettings, 'formShadow' | 'formShadowIntensity'>
): number {
  if (p.formShadow === 'none') return 0;
  return clampContactFormShadowIntensity(
    p.formShadowIntensity,
    PORTFOLIO_CONTACT_FORM_SHADOW_PRESET_INTENSITY[p.formShadow] ?? 55
  );
}

export function contactFormLiftStyle(
  p: Pick<PortfolioContactPresentationSettings, 'formShadow' | 'formShadowIntensity'>
): CSSProperties | undefined {
  const intensity = contactFormShadowIntensityValue(p);
  if (intensity <= 0) return undefined;
  return {
    ['--pf-card-lift' as string]: String(Number((intensity / 100).toFixed(3))),
  };
}

function contactFormBorderStyle(
  p: Pick<
    PortfolioContactPresentationSettings,
    'formBorder' | 'formBorderColor' | 'ctaColor'
  >
): CSSProperties {
  const style: CSSProperties = {};
  if (p.formBorder === 'accent') {
    style.borderColor = sanitizeHex(p.ctaColor, DEFAULT_CONTACT_CTA_COLOR);
    style.borderStyle = 'solid';
  } else if (p.formBorder === 'soft' || p.formBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.formBorderColor, DEFAULT_CONTACT_CARD_BORDER_COLOR);
  }
  return style;
}

function contactFormFramePaddingClass(
  p: Pick<PortfolioContactPresentationSettings, 'cardPadding' | 'cardDesign' | 'formDesign'>,
  variant: 'default' | 'info-panel' = 'default'
): string {
  const pad = p.cardPadding ?? 'md';
  const formDesign = resolveContactFormDesign(p);
  if (variant === 'info-panel' || formDesign === 'info-panel') {
    return pad === 'lg'
      ? 'p-7 sm:p-9 lg:p-10'
      : pad === 'sm'
        ? 'p-5 sm:p-6'
        : pad === 'none'
          ? 'p-5 sm:p-6'
          : 'p-6 sm:p-8 lg:p-9';
  }
  if (formDesign === 'desk' || p.cardDesign === 'desk') {
    return pad === 'lg'
      ? 'p-6 sm:p-8 lg:p-9'
      : pad === 'sm'
        ? 'p-4 sm:p-5'
        : pad === 'none'
          ? 'p-4 sm:p-5'
          : 'p-5 sm:p-7 lg:p-8';
  }
  if (
    formDesign !== 'classic' ||
    isContactOwnedLayoutDesign(p.cardDesign)
  ) {
    return pad === 'lg'
      ? 'p-7 sm:p-9'
      : pad === 'sm'
        ? 'p-5 sm:p-6'
        : pad === 'none'
          ? 'p-5 sm:p-6'
          : 'p-6 sm:p-8';
  }
  return servicesCardPaddingClass(pad);
}

function contactInfoPanelFormRadiusClass(radius: PortfolioServicesCardRadius = 'md'): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-xl sm:rounded-2xl';
    case 'lg':
      return 'rounded-[1.65rem] sm:rounded-[1.85rem]';
    case 'xl':
      return 'rounded-[1.75rem] sm:rounded-[2rem]';
    default:
      return 'rounded-[1.5rem] sm:rounded-[1.75rem]';
  }
}

/** Shared outer shell for every contact message form design. */
export function contactFormFrameClass(p: PortfolioContactPresentationSettings): string {
  const owned = isContactOwnedLayoutDesign(p.cardDesign);
  const parts = [
    'relative z-[1] overflow-hidden',
    servicesCardRadiusClass(p.cardBorderRadius),
    contactFormFramePaddingClass(p),
  ];

  if (p.formBorder !== 'none') {
    parts.push(contactFormBorderWidthClass(p.formBorder));
    if (owned) {
      parts.push('border-[color:var(--contact-border,#e5e5e5)]');
    }
  } else {
    parts.push('border-0');
  }

  if (owned || (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled)) {
    parts.push('bg-[color:var(--contact-surface,#ffffff)]');
  }

  if (contactFormShadowIntensityValue(p) > 0) {
    parts.push('pf-work-card-lift');
  }

  return parts.filter(Boolean).join(' ');
}

export function contactFormFrameStyle(p: PortfolioContactPresentationSettings): CSSProperties {
  const owned = isContactOwnedLayoutDesign(p.cardDesign);
  const style: CSSProperties = {
    ...contactFormBorderStyle(p),
    ...contactFormLiftStyle(p),
  };

  if (!owned && p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_CONTACT_CARD_BACKGROUND_COLOR);
  }

  return style;
}

/** Info panel — solid accent form card (palette CTA / accent). */
export function contactInfoPanelFormCardClass(p: PortfolioContactPresentationSettings): string {
  const parts = [
    'relative z-[1] flex h-full min-h-full flex-col overflow-hidden',
    contactInfoPanelFormRadiusClass(p.cardBorderRadius),
    contactFormFramePaddingClass(p, 'info-panel'),
  ];

  if (p.formBorder !== 'none') {
    parts.push(contactFormBorderWidthClass(p.formBorder));
  } else {
    parts.push('border-0');
  }

  if (contactFormShadowIntensityValue(p) > 0) {
    parts.push('pf-work-card-lift');
  }

  return parts.filter(Boolean).join(' ');
}

export function contactInfoPanelFormCardStyle(
  p: PortfolioContactPresentationSettings
): CSSProperties {
  return {
    backgroundColor: 'var(--contact-accent, #ea580c)',
    ...contactFormBorderStyle(p),
    ...contactFormLiftStyle(p),
  };
}

/** Accent slab behind the Inquiry form (mock purple block). */
export function contactInquiryAccentBlockClass(): string {
  return 'pointer-events-none absolute -inset-x-3 -inset-y-4 rounded-[1.75rem] sm:-inset-x-5 sm:-inset-y-6 sm:rounded-[2rem] lg:-right-8 lg:left-8';
}

/** Compact email / phone chips under Inquiry copy. */
export function contactInquiryChannelCardClass(): string {
  return 'flex items-center gap-3 rounded-xl border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-surface,#ffffff)] px-3.5 py-3';
}

/** Desk — top channel info cards. */
export function contactDeskChannelCardClass(): string {
  return 'flex min-w-0 items-center gap-3.5 rounded-2xl border border-[color:var(--contact-border,#e5e5e5)] bg-[color:var(--contact-surface,#ffffff)] px-4 py-4 sm:px-5 sm:py-5';
}

/**
 * Desk / Info panel max-width — scaled wider than the default contact card scale
 * so Wide stays usable without always going edge-to-edge.
 */
export function contactDeskMaxWidthClass(maxWidth: PortfolioContactCardMaxWidth = 'xl'): string {
  switch (maxWidth) {
    case 'md':
      return 'max-w-4xl';
    case 'lg':
      return 'max-w-5xl';
    case 'full':
      return 'max-w-none';
    default:
      // xl — wide but slightly restrained
      return 'max-w-6xl';
  }
}

/** Alias — same scale for Info panel and Desk. */
export const contactWideLayoutMaxWidthClass = contactDeskMaxWidthClass;

/** Desk topic chips (one label per line in settings). */
export function parseContactDeskTopicOptions(raw: string | undefined): string[] {
  if (!raw?.trim()) return ['Development', 'Others'];
  const parsed = raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
  return parsed.length > 0 ? parsed : ['Development', 'Others'];
}

/** Info panel — outer framed shell (border + optional card background). */
export function contactInfoPanelShellClass(
  p: Pick<PortfolioContactPresentationSettings, 'cardBorderRadius' | 'cardBorder' | 'cardPadding'>
): string {
  const radius = servicesCardRadiusClass(p.cardBorderRadius);
  const pad =
    p.cardPadding === 'lg'
      ? 'p-5 sm:p-7 lg:p-8'
      : p.cardPadding === 'sm'
        ? 'p-4 sm:p-5'
        : p.cardPadding === 'none'
          ? 'p-4 sm:p-5'
          : 'p-5 sm:p-6 lg:p-7';
  const borderWidth =
    p.cardBorder === 'solid' || p.cardBorder === 'accent'
      ? 'border-2'
      : p.cardBorder === 'none'
        ? 'border-0'
        : 'border';
  return `overflow-hidden ${radius} ${borderWidth} ${pad}`.trim();
}

export function contactInfoPanelShellStyle(
  p: Pick<
    PortfolioContactPresentationSettings,
    | 'cardBackgroundEnabled'
    | 'cardBackgroundColor'
    | 'cardBackgroundFill'
    | 'cardBorder'
    | 'cardBorderColor'
    | 'ctaColor'
    | 'titleColor'
  >
): CSSProperties {
  const ink = sanitizeHex(p.titleColor, DEFAULT_CONTACT_TITLE_COLOR);
  const inkIsLight = isLightContactChromeColor(ink);
  const hasSolidFill = p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled;
  const configuredFill = sanitizeHex(p.cardBackgroundColor, DEFAULT_CONTACT_CARD_BACKGROUND_COLOR);
  const darkSafeShell = 'color-mix(in srgb, #ffffff 7%, #0a0a0a)';

  let backgroundColor: string;
  if (hasSolidFill) {
    // White/light frame fill on a dark portfolio → swap to a dark shell.
    backgroundColor =
      inkIsLight && isLightContactChromeColor(configuredFill) ? darkSafeShell : configuredFill;
  } else {
    backgroundColor = inkIsLight ? darkSafeShell : 'var(--contact-surface, #ffffff)';
  }

  const style: CSSProperties = { backgroundColor };
  if (p.cardBorder === 'accent') {
    style.borderColor = sanitizeHex(p.ctaColor, DEFAULT_CONTACT_CTA_COLOR);
  } else if (p.cardBorder === 'soft' || p.cardBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = inkIsLight
      ? 'color-mix(in srgb, #ffffff 16%, transparent)'
      : sanitizeHex(p.cardBorderColor, DEFAULT_CONTACT_CARD_BORDER_COLOR);
  }
  return style;
}

/** Rough luminance check so Info panel can adapt chrome in dark mode. */
export function isLightContactChromeColor(hex: string): boolean {
  const raw = sanitizeHex(hex, DEFAULT_CONTACT_TITLE_COLOR).replace('#', '');
  if (raw.length !== 6) return false;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  // Perceived brightness — > 160 ≈ light ink (dark theme titles).
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export function resolveContactInfoPanelHeadline(
  p: Pick<PortfolioContactPresentationSettings, 'infoPanelHeadline'>,
  fallbackTitle: string
): string {
  const custom = p.infoPanelHeadline?.trim();
  return custom || fallbackTitle;
}

export function resolveContactInfoPanelSupporting(
  p: Pick<PortfolioContactPresentationSettings, 'infoPanelSupporting'>,
  fallbackSubtitle: string
): string {
  const custom = p.infoPanelSupporting?.trim();
  return custom || fallbackSubtitle;
}

export function resolveContactInquiryHeadline(
  p: Pick<PortfolioContactPresentationSettings, 'inquiryHeadline'>,
  fallbackTitle: string
): string {
  const custom = p.inquiryHeadline?.trim();
  return custom || fallbackTitle;
}

export function resolveContactInquirySupporting(
  p: Pick<PortfolioContactPresentationSettings, 'inquirySupporting'>,
  fallbackSubtitle: string
): string {
  const custom = p.inquirySupporting?.trim();
  return custom || fallbackSubtitle;
}

/** Inner padding for the message form — mirrors Frame `cardPadding` so list + form stay aligned. */
export function contactFormContentPaddingClass(
  cardPadding: PortfolioServicesCardPadding = 'md',
  design: PortfolioContactCardDesign = 'editorial',
  formDesign?: PortfolioContactFormDesign
): string {
  const resolvedForm = resolveContactFormDesign({ formDesign, cardDesign: design });
  // Non-classic form chrome pads itself (panel / brief / stepper / underline / etc.).
  if (resolvedForm !== 'classic') return '';
  // Owned section layouts historically kept fields flush; classic form still gets a light inset.
  if (isContactOwnedLayoutDesign(design) || design === 'tiles' || design === 'stacked') {
    const scale = cardPadding === 'none' ? 'sm' : cardPadding;
    return scale === 'lg'
      ? 'px-5 py-5 sm:px-6 sm:py-6'
      : scale === 'sm'
        ? 'px-3 py-3.5 sm:px-4 sm:py-4'
        : 'px-4 py-4 sm:px-5 sm:py-5';
  }
  // Editorial / directory — Frame already pads the shell; form only needs vertical rhythm.
  return 'py-1';
}

export function contactCtaClassName(design: PortfolioContactCtaDesign): string {
  const base = 'inline-flex items-center justify-center gap-2 font-bold transition';
  switch (design) {
    case 'pill-outline':
      return `${base} rounded-full border-2 px-8 py-3.5 text-sm hover:opacity-90`;
    case 'pill-accent':
      return `${base} rounded-full px-8 py-3.5 text-sm shadow-sm hover:opacity-90`;
    case 'full-width':
      return `${base} w-full rounded-2xl px-8 py-4 text-sm shadow-sm hover:opacity-90`;
    default:
      return `${base} rounded-full px-8 py-3.5 text-sm hover:opacity-90`;
  }
}

export function contactCtaStyle(
  design: PortfolioContactCtaDesign,
  ctaColor: string,
  chrome?: { ink?: string; label?: string }
): CSSProperties {
  const accent = sanitizeHex(ctaColor, DEFAULT_CONTACT_CTA_COLOR);
  const ink = sanitizeHex(chrome?.ink, DEFAULT_CONTACT_TITLE_COLOR);
  const label = sanitizeHex(chrome?.label, DEFAULT_CONTACT_CTA_LABEL_COLOR);

  if (design === 'pill-accent' || design === 'full-width') {
    return { backgroundColor: accent, color: label };
  }
  if (design === 'pill-outline') {
    return { borderColor: ink, color: ink, backgroundColor: 'transparent' };
  }
  // pill-dark — fill with strong ink, label from typography / palette neutre
  return { backgroundColor: ink, color: label };
}

export function pickContactPresentationSettings(contact: unknown): PortfolioContactPresentationSettings {
  return mergeContactPresentation(DEFAULT_CONTACT_PRESENTATION, contact);
}

function migrateContactCardDesign(value: unknown): PortfolioContactCardDesign | null {
  if (typeof value !== 'string') return null;
  if (value === 'minimal') return 'directory';
  if (value === 'split') return 'tiles';
  if (
    value === 'editorial' ||
    value === 'directory' ||
    value === 'tiles' ||
    value === 'stacked' ||
    value === 'inquiry' ||
    value === 'inquiry-panel' ||
    value === 'desk' ||
    value === 'info-panel'
  ) {
    return value;
  }
  return null;
}

export function mergeContactPresentation(
  base: PortfolioContactPresentationSettings,
  patch: unknown
): PortfolioContactPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const background = mergeSectionBackground(base, patch);
  const cardBackground = mergeServicesCardBackgroundSettings(base, patch);
  const ctaColor = sanitizeHex(record.ctaColor, base.ctaColor);

  const elementStyles =
    record.elementStyles !== undefined
      ? normalizeContactElementStyles(record.elementStyles)
      : normalizeContactElementStyles(base.elementStyles);

  const cardDesign =
    migrateContactCardDesign(record.cardDesign) ??
    migrateContactCardDesign(base.cardDesign) ??
    'editorial';

  return {
    ...background,
    ...cardBackground,
    titlePreset: pick(
      record.titlePreset,
      ['contact', 'get-in-touch', 'lets-talk', 'start-a-project', 'custom'],
      base.titlePreset
    ),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['default', 'short', 'response-time', 'minimal', 'custom'],
      base.subtitlePreset
    ),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    subtitleSerif: typeof record.subtitleSerif === 'boolean' ? record.subtitleSerif : base.subtitleSerif,
    headerAlignment: pick(record.headerAlignment, ['left', 'center'], base.headerAlignment),
    sectionLayout: isPortfolioContactSectionLayout(record.sectionLayout)
      ? record.sectionLayout
      : isPortfolioContactSectionLayout(base.sectionLayout)
        ? base.sectionLayout
        : 'stacked',
    illustrationVariant: isPortfolioContactIllustrationVariant(record.illustrationVariant)
      ? record.illustrationVariant
      : isPortfolioContactIllustrationVariant(base.illustrationVariant)
        ? base.illustrationVariant
        : 'none',
    illustrationPlacement: isPortfolioContactIllustrationPlacement(record.illustrationPlacement)
      ? record.illustrationPlacement
      : isPortfolioContactIllustrationPlacement(base.illustrationPlacement)
        ? base.illustrationPlacement
        : 'right',
    cardDesign,
    ctaDesign: pick(record.ctaDesign, ['pill-dark', 'pill-outline', 'pill-accent', 'full-width'], base.ctaDesign),
    ctaLabel: typeof record.ctaLabel === 'string' ? record.ctaLabel : base.ctaLabel,
    ctaColor,
    blockOrder: pick(record.blockOrder, ['primary-first', 'links-first'], base.blockOrder),
    cardMaxWidth: pick(record.cardMaxWidth, ['md', 'lg', 'xl', 'full'], base.cardMaxWidth),
    cardPlacement: pick(record.cardPlacement, ['left', 'center', 'right'], base.cardPlacement),
    iconPlacement: pick(record.iconPlacement, ['left', 'top', 'right'], base.iconPlacement ?? 'left'),
    iconSize: pick(record.iconSize, ['sm', 'md', 'lg', 'xl'], base.iconSize ?? 'md'),
    iconRadius: pick(record.iconRadius, ['md', 'lg', 'xl', 'full'], base.iconRadius ?? 'lg'),
    iconBorder: pick(record.iconBorder, ['none', 'soft', 'solid'], base.iconBorder ?? 'none'),
    iconBorderColor: sanitizeHex(
      record.iconBorderColor,
      base.iconBorderColor ?? DEFAULT_CONTACT_CARD_BORDER_COLOR
    ),
    iconBackgroundColor:
      typeof record.iconBackgroundColor === 'string'
        ? record.iconBackgroundColor.trim() && isValidProfileHexColor(record.iconBackgroundColor.trim())
          ? record.iconBackgroundColor.trim()
          : record.iconBackgroundColor.trim() === ''
            ? ''
            : (base.iconBackgroundColor ?? '')
        : (base.iconBackgroundColor ?? ''),
    iconBackgroundEnabled:
      typeof record.iconBackgroundEnabled === 'boolean'
        ? record.iconBackgroundEnabled
        : (base.iconBackgroundEnabled ?? true),
    iconColor:
      typeof record.iconColor === 'string'
        ? record.iconColor.trim() && isValidProfileHexColor(record.iconColor.trim())
          ? record.iconColor.trim()
          : record.iconColor.trim() === ''
            ? ''
            : (base.iconColor ?? '')
        : (base.iconColor ?? ''),
    iconUseBrandColors:
      typeof record.iconUseBrandColors === 'boolean'
        ? record.iconUseBrandColors
        : (base.iconUseBrandColors ?? true),
    itemGap: pick(record.itemGap, ['none', 'sm', 'md', 'lg'], base.itemGap ?? 'md'),
    cardBorder: pick(record.cardBorder, ['none', 'soft', 'solid', 'accent'], base.cardBorder),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean' ? record.cardBackgroundEnabled : base.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderRadius: pick(record.cardBorderRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardBorderRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    showEmail: typeof record.showEmail === 'boolean' ? record.showEmail : base.showEmail,
    showPhone: typeof record.showPhone === 'boolean' ? record.showPhone : base.showPhone,
    showLocation: typeof record.showLocation === 'boolean' ? record.showLocation : base.showLocation,
    showSocialLinks: typeof record.showSocialLinks === 'boolean' ? record.showSocialLinks : base.showSocialLinks,
    showCta: typeof record.showCta === 'boolean' ? record.showCta : base.showCta,
    showResponseTimeInSubtitle:
      typeof record.showResponseTimeInSubtitle === 'boolean'
        ? record.showResponseTimeInSubtitle
        : base.showResponseTimeInSubtitle,
    showContactForm:
      typeof record.showContactForm === 'boolean' ? record.showContactForm : base.showContactForm,
    formDesign: isContactFormDesign(record.formDesign)
      ? record.formDesign
      : migrateContactFormDesignFromCardDesign(cardDesign),
    contactFormTitle:
      typeof record.contactFormTitle === 'string' ? record.contactFormTitle : base.contactFormTitle,
    contactFormSubmitLabel:
      typeof record.contactFormSubmitLabel === 'string'
        ? record.contactFormSubmitLabel
        : base.contactFormSubmitLabel,
    contactFormPlacement: pick(
      record.contactFormPlacement,
      ['side', 'below'],
      base.contactFormPlacement ?? 'below'
    ),
    formStackGap: pick(record.formStackGap, ['none', 'sm', 'md', 'lg'], base.formStackGap ?? 'lg'),
    formBorder: pick(
      record.formBorder,
      ['none', 'soft', 'solid', 'accent'],
      record.formBorder !== undefined
        ? base.formBorder
        : pick(record.cardBorder, ['none', 'soft', 'solid', 'accent'], base.formBorder)
    ),
    formBorderColor: sanitizeHex(
      record.formBorderColor,
      record.formBorderColor !== undefined
        ? base.formBorderColor
        : sanitizeHex(record.cardBorderColor, base.formBorderColor)
    ),
    formShadow: (() => {
      const shadow = record.formShadow;
      if (
        shadow === 'none' ||
        shadow === 'soft' ||
        shadow === 'float' ||
        shadow === 'deep'
      ) {
        return shadow;
      }
      const migratedCardBorder = pick(
        record.cardBorder,
        ['none', 'soft', 'solid', 'accent'],
        base.cardBorder
      );
      if (isContactOwnedLayoutDesign(cardDesign)) {
        return base.formShadow;
      }
      if (migratedCardBorder === 'none') return 'none';
      if (migratedCardBorder === 'soft') return 'soft';
      return 'none';
    })(),
    formShadowIntensity: clampContactFormShadowIntensity(
      record.formShadowIntensity,
      record.formShadow === 'none' ||
        record.formShadow === 'soft' ||
        record.formShadow === 'float' ||
        record.formShadow === 'deep'
        ? PORTFOLIO_CONTACT_FORM_SHADOW_PRESET_INTENSITY[record.formShadow]
        : isContactOwnedLayoutDesign(cardDesign)
          ? PORTFOLIO_CONTACT_FORM_SHADOW_PRESET_INTENSITY[base.formShadow]
          : (() => {
              const migratedCardBorder = pick(
                record.cardBorder,
                ['none', 'soft', 'solid', 'accent'],
                base.cardBorder
              );
              if (migratedCardBorder === 'none') return 0;
              if (migratedCardBorder === 'soft') {
                return PORTFOLIO_CONTACT_FORM_SHADOW_PRESET_INTENSITY.soft;
              }
              return 0;
            })()
    ),
    inquiryHeadline:
      typeof record.inquiryHeadline === 'string'
        ? record.inquiryHeadline
        : (base.inquiryHeadline ?? DEFAULT_CONTACT_PRESENTATION.inquiryHeadline),
    inquirySupporting:
      typeof record.inquirySupporting === 'string'
        ? record.inquirySupporting
        : (base.inquirySupporting ?? DEFAULT_CONTACT_PRESENTATION.inquirySupporting),
    deskTopicOptions:
      typeof record.deskTopicOptions === 'string'
        ? record.deskTopicOptions
        : (base.deskTopicOptions ?? DEFAULT_CONTACT_PRESENTATION.deskTopicOptions),
    infoPanelHeadline:
      typeof record.infoPanelHeadline === 'string'
        ? record.infoPanelHeadline
        : (base.infoPanelHeadline ?? DEFAULT_CONTACT_PRESENTATION.infoPanelHeadline),
    infoPanelSupporting:
      typeof record.infoPanelSupporting === 'string'
        ? record.infoPanelSupporting
        : (base.infoPanelSupporting ?? DEFAULT_CONTACT_PRESENTATION.infoPanelSupporting),
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    contactColorBindings: mergeContactColorBindings(
      mergeContactColorBindings(DEFAULT_CONTACT_COLOR_BINDINGS, base.contactColorBindings),
      record.contactColorBindings
    ),
    elementStyles,
  };
}
