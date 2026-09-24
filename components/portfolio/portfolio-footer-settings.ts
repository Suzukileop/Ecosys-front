import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  mergeSectionColorMode,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';
import {
  DEFAULT_FOOTER_COLOR_BINDINGS,
  DEFAULT_FOOTER_PALETTE,
  mergeFooterColorBindings,
  mergeFooterPalette,
  type PortfolioFooterColorBindings,
  type PortfolioFooterPalette,
} from '@/components/portfolio/portfolio-footer-palette-settings';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';
import {
  createElementTextStyle,
  normalizeElementStylesRecord,
  patchElementStylesRecord,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import {
  FOOTER_HEADER_BILLBOARD_WORD_STYLES,
  FOOTER_HEADER_DESIGNS,
  FOOTER_HEADER_MARGIN_BOTTOM_STEPS,
  FOOTER_HEADER_PADDING_STEPS,
  FOOTER_HEADER_PALETTE_TOKENS,
  FOOTER_HEADER_TITLE_SIZES,
  FOOTER_HEADER_TITLE_WEIGHTS,
  type PortfolioFooterHeaderBillboardWordStyle,
  type PortfolioFooterHeaderDesign,
  type PortfolioFooterHeaderDesignAlignment,
  type PortfolioFooterHeaderMarginBottom,
  type PortfolioFooterHeaderPaddingStep,
  type PortfolioFooterHeaderPaletteToken,
  type PortfolioFooterHeaderTitleSize,
  type PortfolioFooterHeaderTitleWeight,
} from '@/components/portfolio/portfolio-footer-header-settings';

export type PortfolioFooterStyleTarget =
  | 'brand'
  | 'description'
  | 'columnHeading'
  | 'contactLine'
  | 'socialLabel'
  | 'meta'
  | 'marketplaceLink'
  | 'ctaTitle'
  | 'ctaSubtitle'
  | 'ctaButton';

export type PortfolioFooterElementStyles = Record<PortfolioFooterStyleTarget, PortfolioElementTextStyle>;

export const FOOTER_STYLE_TARGET_IDS: PortfolioFooterStyleTarget[] = [
  'brand',
  'description',
  'columnHeading',
  'contactLine',
  'socialLabel',
  'meta',
  'marketplaceLink',
  'ctaTitle',
  'ctaSubtitle',
  'ctaButton',
];

export const PORTFOLIO_FOOTER_STYLE_TARGET_OPTIONS: {
  value: PortfolioFooterStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'brand', label: 'Brand name', description: 'Creator name in compact and centered footers.' },
  { value: 'description', label: 'Description', description: 'Bio or why-me blurb under the brand.' },
  { value: 'columnHeading', label: 'Column heading', description: '“Contact” or link-column titles.' },
  { value: 'contactLine', label: 'Contact / link line', description: 'Phone, email, and landing-style column links.' },
  { value: 'socialLabel', label: 'Social label', description: 'Text labels beside social icons.' },
  { value: 'meta', label: 'Meta / copyright', description: 'Copyright label and design credit.' },
  { value: 'marketplaceLink', label: 'Marketplace CTA', description: 'Label color for text-arrow marketplace CTA.' },
  { value: 'ctaTitle', label: 'CTA title', description: 'Minimal design band headline.' },
  { value: 'ctaSubtitle', label: 'CTA subtitle', description: 'Availability line under the CTA title.' },
  { value: 'ctaButton', label: 'CTA button', description: 'Contact me button label typography.' },
];

export const DEFAULT_FOOTER_ELEMENT_STYLES: PortfolioFooterElementStyles = {
  brand: createElementTextStyle({ color: '#0a0a0a', size: 'xl', bold: true }),
  description: createElementTextStyle({ color: '#a3a3a3', size: 'md' }),
  columnHeading: createElementTextStyle({
    color: '#a3a3a3',
    size: 'md',
    bold: true,
    uppercase: true,
  }),
  contactLine: createElementTextStyle({ color: '#0a0a0a', size: 'md', bold: true }),
  socialLabel: createElementTextStyle({ color: '#0a0a0a', size: 'lg', bold: true }),
  meta: createElementTextStyle({ color: '#a3a3a3', size: 'md', bold: true }),
  marketplaceLink: createElementTextStyle({
    color: '#ea580c',
    size: 'lg',
    bold: true,
  }),
  ctaTitle: createElementTextStyle({ color: '#ffffff', size: 'xl', bold: true }),
  ctaSubtitle: createElementTextStyle({ color: '#ffffff', size: 'md' }),
  ctaButton: createElementTextStyle({
    color: '#0a0a0a',
    size: 'md',
    bold: true,
  }),
};

/** Footer typeface always inherits Global → Police principale (no per-element serif/display). */
function inheritGlobalFooterFonts(
  styles: PortfolioFooterElementStyles
): PortfolioFooterElementStyles {
  let next: PortfolioFooterElementStyles | null = null;
  for (const id of FOOTER_STYLE_TARGET_IDS) {
    if (styles[id].font === 'sans') continue;
    if (!next) next = { ...styles };
    next[id] = { ...styles[id], font: 'sans' };
  }
  return next ?? styles;
}

export function buildFooterElementStyleDefaults(
  presentation: Pick<
    PortfolioFooterPresentationSettings,
    | 'primaryColor'
    | 'textColor'
    | 'ctaTitleColor'
    | 'ctaSubtitleColor'
    | 'ctaButtonTextColor'
    | 'accentColor'
  >
): PortfolioFooterElementStyles {
  return {
    ...DEFAULT_FOOTER_ELEMENT_STYLES,
    brand: createElementTextStyle({
      color: presentation.primaryColor,
      size: 'xl',
      bold: true,
    }),
    description: createElementTextStyle({
      color: presentation.textColor,
      size: 'md',
    }),
    columnHeading: createElementTextStyle({
      color: presentation.textColor,
      size: 'md',
      bold: true,
      uppercase: true,
    }),
    contactLine: createElementTextStyle({
      color: presentation.primaryColor,
      size: 'md',
      bold: true,
    }),
    socialLabel: createElementTextStyle({
      color: presentation.primaryColor,
      size: 'lg',
      bold: true,
    }),
    meta: createElementTextStyle({
      color: presentation.textColor,
      size: 'md',
      bold: true,
    }),
    marketplaceLink: createElementTextStyle({
      color: presentation.accentColor,
      size: 'lg',
      bold: true,
    }),
    ctaTitle: createElementTextStyle({
      color: presentation.ctaTitleColor,
      size: 'xl',
      bold: true,
    }),
    ctaSubtitle: createElementTextStyle({
      color: presentation.ctaSubtitleColor,
      size: 'md',
    }),
    ctaButton: createElementTextStyle({
      color: presentation.ctaButtonTextColor,
      size: 'md',
      bold: true,
    }),
  };
}

export function normalizeFooterElementStyles(
  raw: unknown,
  presentation: Pick<
    PortfolioFooterPresentationSettings,
    | 'primaryColor'
    | 'textColor'
    | 'ctaTitleColor'
    | 'ctaSubtitleColor'
    | 'ctaButtonTextColor'
    | 'accentColor'
  >
): PortfolioFooterElementStyles {
  const defaults = buildFooterElementStyleDefaults(presentation);
  // Do not re-migrate sizes on every normalize — that treated intentional `sm`
  // as the old default and forced it back to `md`, so Small looked unclickable.
  return inheritGlobalFooterFonts(
    normalizeElementStylesRecord(raw, defaults, FOOTER_STYLE_TARGET_IDS)
  );
}

export function patchFooterElementStyle(
  styles: PortfolioFooterElementStyles,
  target: PortfolioFooterStyleTarget,
  patch: Partial<PortfolioElementTextStyle>,
  presentation: Pick<
    PortfolioFooterPresentationSettings,
    | 'primaryColor'
    | 'textColor'
    | 'ctaTitleColor'
    | 'ctaSubtitleColor'
    | 'ctaButtonTextColor'
    | 'accentColor'
  >
): PortfolioFooterElementStyles {
  const defaults = buildFooterElementStyleDefaults(presentation);
  return inheritGlobalFooterFonts(
    patchElementStylesRecord(
      styles,
      target,
      { ...patch, font: 'sans' },
      defaults,
      FOOTER_STYLE_TARGET_IDS
    )
  );
}

export function syncFooterLegacyTypographyFromElementStyles(
  styles: PortfolioFooterElementStyles
): Pick<
  PortfolioFooterPresentationSettings,
  'primaryColor' | 'textColor' | 'ctaTitleColor' | 'ctaSubtitleColor' | 'ctaButtonTextColor'
> {
  return {
    primaryColor: styles.brand.color,
    textColor: styles.meta.color,
    ctaTitleColor: styles.ctaTitle.color,
    ctaSubtitleColor: styles.ctaSubtitle.color,
    ctaButtonTextColor: styles.ctaButton.color,
  };
}

export function syncFooterElementStylesFromLegacyPatch(
  styles: PortfolioFooterElementStyles,
  patch: unknown,
  presentation: PortfolioFooterPresentationSettings
): PortfolioFooterElementStyles {
  if (!patch || typeof patch !== 'object') return styles;
  const record = patch as Record<string, unknown>;
  const defaults = buildFooterElementStyleDefaults(presentation);
  let next: PortfolioFooterElementStyles = { ...styles };

  if ('primaryColor' in record) {
    next = {
      ...next,
      brand: defaults.brand,
      contactLine: defaults.contactLine,
      socialLabel: defaults.socialLabel,
    };
  }
  if ('textColor' in record) {
    next = {
      ...next,
      description: defaults.description,
      columnHeading: defaults.columnHeading,
      meta: defaults.meta,
    };
  }
  if ('accentColor' in record) {
    next = { ...next, marketplaceLink: defaults.marketplaceLink };
  }
  if ('ctaTitleColor' in record) {
    next = { ...next, ctaTitle: defaults.ctaTitle };
  }
  if ('ctaSubtitleColor' in record) {
    next = { ...next, ctaSubtitle: defaults.ctaSubtitle };
  }
  if ('ctaButtonTextColor' in record) {
    next = { ...next, ctaButton: defaults.ctaButton };
  }

  return normalizeFooterElementStyles(next, presentation);
}

/**
 * Footer layouts:
 * - centered-minimal: centered identity, internal navigation, bare (borderless) social + contact
 *   icons, theatrical spring-lift hover focus, native light/dark — the default
 * - compact: SaaS utility bar — brand + icons, contact line, bottom meta
 * - minimal: contact CTA band + bottom utility row
 * - contact-card: accent card (name + location + phone/email) + one Links column
 * - landing: borderless three-column Swiss grid (identity+bio+socials / Contact / Links),
 *   theatrical spring-lift hover focus, native light/dark
 */
export type PortfolioFooterDesign =
  | 'minimal'
  | 'compact'
  | 'landing'
  | 'centered-minimal'
  | 'contact-card'
  | 'monumental'
  | 'hero-columns'
  | 'split-form'
  | 'timezone-editorial'
  | 'inverted-wordmark'
  | 'services-reveal'
  | 'editorial-grid'
  | 'headline-reveal';

/**
 * Global type-size control for every Footer design — same mechanism as the FAQ section's
 * `PortfolioFaqPremiumFontSize`/`faqPremiumFontScale`. A shared `--pf-footer-font-scale`
 * CSS custom property (set on the `footer#footer` root by every design, via a
 * `fontSizeScale` number prop resolved from this field) multiplies TWO standardized base
 * sizes shared by every design's own body-level text (`--pf-footer-body-size`, for
 * description/nav-links/contact-info) and small caption text (`--pf-footer-label-size`,
 * for copyright/column-headings/tiny field labels) — see the shared `footer#footer { ... }`
 * rule near the top of the Footer CSS block in globals.css. Brand names / giant wordmark
 * headlines are NOT held to a shared absolute size (too varied by design intent — some are
 * full-bleed display typography), but still scale proportionally with this same multiplier.
 */
export type PortfolioFooterPremiumFontSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

/** Contact card design — which palette token fills the left info card's background.
 *  Resolved to a concrete hex at render time via `resolveHeroPaletteColor` (the card also
 *  needs a real color, not a CSS var reference, to compute its own text-ink contrast). */
export type PortfolioFooterContactCardColorToken = 'principal' | 'secondaire' | 'texteMuted' | 'neutre';

export const FOOTER_CONTACT_CARD_COLOR_TOKENS: PortfolioFooterContactCardColorToken[] = [
  'principal',
  'secondaire',
  'texteMuted',
  'neutre',
];

export const FOOTER_CONTACT_CARD_COLOR_TOKEN_OPTIONS: {
  value: PortfolioFooterContactCardColorToken;
  label: string;
}[] = [
  { value: 'principal', label: 'Principal' },
  { value: 'secondaire', label: 'Secondary' },
  { value: 'texteMuted', label: 'Muted' },
  { value: 'neutre', label: 'Neutral' },
];

/** Which of the "Mini bottom bar" variants renders below the Footer section (see
 *  `showMiniBar`) — independent of `PortfolioFooterDesign` above, since the bar layers
 *  under whichever main Footer design is active rather than replacing it.
 *  `landing`/`contact-cta`/`hero-columns`/`inverted-wordmark`/`services-reveal` were
 *  originally hardcoded, always-on sub-footer bars baked into those 5 Footer designs;
 *  each was extracted verbatim into its own catalog entry here (so it can now be used
 *  under ANY Footer design, not just its design of origin) and removed from the design
 *  itself — see footer-minibar-catalog-extraction memory. */
export type PortfolioFooterMiniBarDesign =
  | 'minimal'
  | 'kinetic'
  | 'split-caps'
  | 'landing'
  | 'contact-cta'
  | 'hero-columns'
  | 'inverted-wordmark'
  | 'services-reveal';

export const FOOTER_MINI_BAR_DESIGNS: PortfolioFooterMiniBarDesign[] = [
  'minimal',
  'kinetic',
  'split-caps',
  'landing',
  'contact-cta',
  'hero-columns',
  'inverted-wordmark',
  'services-reveal',
];

export type PortfolioFooterCenteredIdentity = 'avatar' | 'name' | 'custom';

export type PortfolioFooterLinkItem = {
  id: string;
  label: string;
  href: string;
};

export type PortfolioFooterLinkColumn = {
  id: string;
  title: string;
  links: PortfolioFooterLinkItem[];
};

/** One per-design override of a configurable element (see `FOOTER_DESIGN_LAYOUT_SPECS` in
 *  portfolio-footer-design-layout.ts). Every field is optional: an absent field means "use
 *  that design's own default", so an empty store renders exactly like before it existed. */
export type PortfolioFooterLayoutElementOverride = {
  visible?: boolean;
  text?: string;
  source?: PortfolioFooterDescriptionSource;
  /** Value of an `option` element (e.g. wordmark orientation / color token). */
  choice?: string;
};

export type PortfolioFooterDesignLayout = {
  /** Selected section ids (`hero` + nav section keys). Absent → the design's default set.
   *  Ids of currently hidden sections are kept so they reappear when the section returns. */
  sectionLinks?: string[];
  elements?: Record<string, PortfolioFooterLayoutElementOverride>;
};

export type PortfolioFooterDesignLayouts = Partial<Record<PortfolioFooterDesign, PortfolioFooterDesignLayout>>;

export type PortfolioFooterAlignment = 'split' | 'center' | 'left';

export type PortfolioFooterDescriptionSource = 'bio' | 'custom';

export type PortfolioFooterPattern = 'none' | 'dots' | 'grid' | 'diagonal' | 'crosshatch';

export type PortfolioFooterCtaButtonBorder = 'none' | 'soft' | 'solid';

export type PortfolioFooterCtaButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type PortfolioFooterCtaButtonPadding = 'sm' | 'md' | 'lg';

/** Horizontal align for Contact CTA + Marketplace buttons (minimal design, large screens). */
export type PortfolioFooterCtaButtonsAlign = 'left' | 'center' | 'right';

/** Contact-line icon size (phone / email / pin / clock). */
export type PortfolioFooterContactIconSize = 'sm' | 'md' | 'lg';

/**
 * Shared pill / text presets for Contact me + Marketplace CTAs.
 * Same chrome family so the pair can match exactly.
 */
export type PortfolioFooterCtaDesign =
  | 'pill-dark'
  | 'pill-outline'
  | 'pill-accent'
  | 'text-arrow';

/** @deprecated Use PortfolioFooterCtaDesign — kept as alias for older imports. */
export type PortfolioFooterMarketplaceCtaDesign = PortfolioFooterCtaDesign;

/** Padding inside the footer content area (presets or custom per-side). */
export type PortfolioFooterPadding = 'compact' | 'standard' | 'comfortable' | 'spacious' | 'custom';

/** Space above the footer (between last section and footer). */
export type PortfolioFooterMarginTop =
  | 'none'
  | 'compact'
  | 'standard'
  | 'comfortable'
  | 'spacious'
  | 'custom';

export type PortfolioFooterPresentationSettings = PortfolioSectionBackgroundSettings & {
  design: PortfolioFooterDesign;
  alignment: PortfolioFooterAlignment;
  /** Padding preset — choosing a preset syncs the four side px fields. */
  padding: PortfolioFooterPadding;
  /** Per-side content padding (px). */
  paddingTopPx: number;
  paddingBottomPx: number;
  paddingLeftPx: number;
  paddingRightPx: number;
  /** Margin above the footer (gap after the last page section). */
  marginTop: PortfolioFooterMarginTop;
  /** Exact top margin in px when `marginTop` is `custom` (also synced from presets). */
  marginTopPx: number;
  /**
   * Landing design — vertical gap (px) between brand / bio / socials / CTAs
   * in the left column.
   */
  landingBrandGapPx: number;
  /**
   * Shared space below Contact / Links column titles before the list items — landing columns.
   */
  columnHeadingGapPx: number;
  showBrand: boolean;
  showAvatar: boolean;
  showDescription: boolean;
  descriptionSource: PortfolioFooterDescriptionSource;
  descriptionCustom: string;
  centeredIdentity: PortfolioFooterCenteredIdentity;
  centeredCustomText: string;
  centeredCustomLogoUrl: string;
  centeredLinks: PortfolioFooterLinkItem[];
  /**
   * Landing design — link columns (default Product / Creators / Legal).
   * Empty columns are hidden at render time.
   */
  linkColumns: PortfolioFooterLinkColumn[];
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showHours: boolean;
  /** Phone / email / location / hours glyphs beside contact lines. */
  showContactIcons: boolean;
  /** Size of contact-line glyphs (phone, email, pin, clock). */
  contactIconSize: PortfolioFooterContactIconSize;
  /** Envelope glyph on the Contact me button (Contact CTA design). */
  showCtaIcon: boolean;
  showCopyright: boolean;
  /**
   * Custom copyright / meta line label.
   * Supports `{year}` and `{name}`. Empty → `© {year} {name}`.
   */
  copyrightLabel: string;
  showMarketplaceLink: boolean;
  /** CTA label under the brand (landing) / meta row — default “Marketplace profile”. */
  marketplaceCtaLabel: string;
  /**
   * Redirect URL. Empty → `/marketplace/{creatorId}`.
   * Accepts absolute URLs, paths, and `#anchors`.
   */
  marketplaceCtaHref: string;
  marketplaceCtaDesign: PortfolioFooterMarketplaceCtaDesign;
  marketplaceCtaBackgroundColor: string;
  marketplaceCtaTextColor: string;
  marketplaceCtaBorderColor: string;
  /** Show ↗ beside the label (especially useful for text-arrow). */
  marketplaceCtaShowArrow: boolean;
  /** Landing column — Marketplace profile CTA under the brand. Off by default. */
  showLandingMarketplaceLink: boolean;
  /** Landing Links column — Marketplace row. Off by default. */
  showMarketplaceColumnLink: boolean;
  /** Landing Links column — NoProbleme profile row. Off by default. */
  showNopbProfileLink: boolean;
  showProfileVisits: boolean;
  showContactLinks: boolean;
  showDesignCredit: boolean;
  showTopBorder: boolean;
  /**
   * Thin rule between major info blocks (Networks | Contact | meta, brand | contact, …)
   * — vertical on large screens, horizontal when stacked.
   */
  showContentDivider: boolean;
  /** Empty → auto (white/black hairline from footer background). */
  contentDividerColor: string;
  /** 0–100 opacity for the content divider. */
  contentDividerOpacity: number;
  /** Ultra-minimal, edge-to-edge bottom bar rendered below the Footer section regardless of
   *  its `design` — copyright, a live local clock + location, and a "Back to top" control.
   *  Off by default (opt-in), same convention as every other new structural toggle here. */
  showMiniBar: boolean;
  /** Which of the 3 Mini bottom bar variants renders when `showMiniBar` is on. */
  miniBarDesign: PortfolioFooterMiniBarDesign;
  /** Design 3 — CTA band (“Have a project in mind?”). */
  showContactCta: boolean;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonLabel: string;
  /** Contact me predefined chrome (same set as Marketplace). */
  ctaDesign: PortfolioFooterCtaDesign;
  /** CTA band title color (minimal design). */
  ctaTitleColor: string;
  /** CTA band subtitle color (minimal design). */
  ctaSubtitleColor: string;
  /** Contact me button fill. */
  ctaButtonBackgroundColor: string;
  /** Contact me button label color. */
  ctaButtonTextColor: string;
  ctaButtonBorder: PortfolioFooterCtaButtonBorder;
  ctaButtonBorderColor: string;
  ctaButtonRadius: PortfolioFooterCtaButtonRadius;
  ctaButtonPadding: PortfolioFooterCtaButtonPadding;
  /** Contact me + Marketplace row align (minimal / Contact CTA design). */
  ctaButtonsAlign: PortfolioFooterCtaButtonsAlign;
  /** Muted labels / meta (NETWORKS, copyright, hours). */
  textColor: string;
  /** Primary values (contact lines, social labels, brand). */
  primaryColor: string;
  /** Contact row icons (phone, email, pin, clock). */
  iconColor: string;
  /** Marketplace profile link + CTA band fill. */
  accentColor: string;
  pattern: PortfolioFooterPattern;
  patternColor: string;
  patternOpacity: number;
  /** When true, section colors follow the Hero semantic palette. */
  useHeroPalette: boolean;
  /** User override — 'auto' (default) follows Global → Theme's site-wide mode. */
  colorModeOverride: PortfolioSectionColorMode;
  /** Type-size scale applied uniformly across every Footer design (General tab) — same
   *  mechanism as the FAQ section's own "Font size" control. */
  premiumFontSize: PortfolioFooterPremiumFontSize;
  /**
   * When true (and palette is on), keep the snapshotted footer palette colors
   * even if Global switches between dark / light mode.
   */
  lockPaletteAcrossColorModes: boolean;
  /** Optional local override of the global palette tokens (rare — usually Global → Theme). */
  footerPalette?: PortfolioFooterPalette;
  /** Which Global token paints each footer color slot. */
  footerColorBindings?: PortfolioFooterColorBindings;
  /** Unified typography for footer text elements. */
  elementStyles: PortfolioFooterElementStyles;
  /** Monumental design — giant asymmetric editorial headline above the contact form. */
  monumentalHeadline: string;
  /** Hero columns design — acknowledgement/manifesto paragraph in the right column. */
  heroColumnsManifesto: string;
  /** Split form design — giant "START A PROJECT." style headline. */
  splitFormHeadline: string;
  /** Split form design — short paragraph under the headline. */
  splitFormDescription: string;
  /** Split form design — short personal-review quote line. */
  splitFormQuote: string;
  /** Inverted wordmark design — "Site by ..." style sub-footer credit line. */
  invertedWordmarkCredit: string;
  /** Editorial grid design — poetic accroche inside the suspended bento card. */
  editorialGridTagline: string;
  /** Contact card design — background fill for the left info card (see
   *  PortfolioFooterContactCardColorToken above). */
  contactCardColorToken: PortfolioFooterContactCardColorToken;
  /** Design tab → Layout settings, stored per design so each layout keeps its own choices. */
  designLayouts: PortfolioFooterDesignLayouts;
  /** General → Photo: replaces the profile photo in every Footer design. Empty → profile photo. */
  photoUrl: string;
  /**
   * Header — one shared, static (non-animated) header mounted above the Footer section,
   * copied from the same mechanism used by Info/Work/Team/etc. (footer-portfolio-header-designs/*).
   * Independent of `design` (which of Footer's own layouts renders the content below).
   */
  headerDesign: PortfolioFooterHeaderDesign;
  headerDesignAlignment: PortfolioFooterHeaderDesignAlignment;
  /** Bottom spacing under every header design — shared across all of them. */
  headerMarginBottom: PortfolioFooterHeaderMarginBottom;
  /** Title size/weight — shared across every header design. */
  headerTitleSize: PortfolioFooterHeaderTitleSize;
  headerTitleWeight: PortfolioFooterHeaderTitleWeight;
  /**
   * When true, the header block above the Footer paints the SAME background configured
   * in the Footer's own Background tab (`sectionBackground*` fields) instead of staying
   * transparent over the global page wallpaper. Off by default — the header and the
   * Footer body keep separate backgrounds, matching current behavior.
   */
  headerBackgroundUnified: boolean;
  /**
   * Header's own internal top/bottom padding — independent of `headerMarginBottom` (the
   * gap AFTER the header). `none` by default so existing portfolios render unchanged.
   */
  headerPaddingTop: PortfolioFooterHeaderPaddingStep;
  headerPaddingBottom: PortfolioFooterHeaderPaddingStep;
  /** Header editorial — own dedicated title/subtitle text (Footer has no pre-existing
   *  title/subtitle concept to borrow, unlike sections that had one already). */
  headerEditorialTitleText: string;
  headerEditorialSubtitleText: string;
  headerEditorialTitleColor: PortfolioFooterHeaderPaletteToken;
  headerSerifLeadLabelText: string;
  headerSerifLeadTitleText: string;
  headerSerifLeadLabelColor: PortfolioFooterHeaderPaletteToken;
  headerSerifLeadTitleColor: PortfolioFooterHeaderPaletteToken;
  headerSerifLeadSubtitleColor: PortfolioFooterHeaderPaletteToken;
  headerSerifLeadLabelSize: PortfolioFooterHeaderTitleSize;
  headerSerifLeadTitleSize: PortfolioFooterHeaderTitleSize;
  headerSerifLeadSubtitleSize: PortfolioFooterHeaderTitleSize;
  headerSerifLeadLabelWeight: PortfolioFooterHeaderTitleWeight;
  headerSerifLeadTitleWeight: PortfolioFooterHeaderTitleWeight;
  headerSerifLeadSubtitleWeight: PortfolioFooterHeaderTitleWeight;
  headerBillboardBigWord: string;
  headerBillboardWordStyle: PortfolioFooterHeaderBillboardWordStyle;
  headerBillboardWordColor: PortfolioFooterHeaderPaletteToken;
  headerMastheadLine1Text: string;
  headerMastheadLine2Text: string;
  headerMastheadLine3Text: string;
  headerMastheadHeadlineColor: PortfolioFooterHeaderPaletteToken;
  headerMastheadHeadlineSize: PortfolioFooterHeaderTitleSize;
  headerMastheadHeadlineWeight: PortfolioFooterHeaderTitleWeight;
  headerIndexLabelText: string;
  headerIndexTitleText: string;
  headerIndexCountLabelText: string;
  headerIndexSubtitleText: string;
  headerIndexLabelColor: PortfolioFooterHeaderPaletteToken;
  headerIndexNumberColor: PortfolioFooterHeaderPaletteToken;
  headerIndexTitleColor: PortfolioFooterHeaderPaletteToken;
  headerIndexSubtitleColor: PortfolioFooterHeaderPaletteToken;
  headerIndexLabelSize: PortfolioFooterHeaderTitleSize;
  headerIndexLabelWeight: PortfolioFooterHeaderTitleWeight;
  headerIndexTitleSize: PortfolioFooterHeaderTitleSize;
  headerIndexTitleWeight: PortfolioFooterHeaderTitleWeight;
  headerIndexSubtitleSize: PortfolioFooterHeaderTitleSize;
  headerIndexSubtitleWeight: PortfolioFooterHeaderTitleWeight;
  /** Header hero — Footer-local design (centered monumental headline + CTA pill). */
  headerHeroTitleText: string;
  headerHeroCtaLabel: string;
  headerHeroTitleColor: PortfolioFooterHeaderPaletteToken;
  /** Header name — Footer-local 10th design (just the creator's name, no text field). */
  headerNameColor: PortfolioFooterHeaderPaletteToken;
  /** Header timezone — Footer-local 11th design (kicker + 2-line title + description,
   *  live clock + location on the right — those two come from real profile data, no field). */
  headerTimezoneKickerText: string;
  headerTimezoneTitleText: string;
  headerTimezoneDescriptionText: string;
  headerTimezoneTitleColor: PortfolioFooterHeaderPaletteToken;
};

const LEGACY_FR_CTA_TITLES = new Set(['Un projet en tête ?', 'Un projet en tete ?']);
const LEGACY_FR_CTA_BUTTONS = new Set(['Me contacter']);
const LEGACY_FR_CTA_SUBTITLES = new Set([
  'Disponible cette semaine · réponse sous 24h',
  'Disponible cette semaine · reponse sous 24h',
]);

export type PortfolioFooterSectionSettings = {
  enabled: boolean;
} & PortfolioFooterPresentationSettings;

export const DEFAULT_FOOTER_TEXT_COLOR = '#a3a3a3';
export const DEFAULT_FOOTER_PRIMARY_COLOR = '#fafafa';
export const DEFAULT_FOOTER_PRIMARY_ON_LIGHT = '#0a0a0a';
export const DEFAULT_FOOTER_ICON_COLOR = '#737373';
export const DEFAULT_FOOTER_ACCENT_COLOR = '#ea580c';
export const DEFAULT_FOOTER_BACKGROUND_COLOR = '#0a0a0a';
export const DEFAULT_FOOTER_PATTERN_COLOR = '#a3a3a3';
export const DEFAULT_FOOTER_CTA_TITLE = 'Have a project in mind?';
export const DEFAULT_FOOTER_CTA_SUBTITLE = 'Available this week · response within 24h';
export const DEFAULT_FOOTER_CTA_BUTTON = 'Contact me';
export const DEFAULT_FOOTER_CTA_TITLE_COLOR = '#ffffff';
export const DEFAULT_FOOTER_CTA_SUBTITLE_COLOR = '#ffffff';
export const DEFAULT_FOOTER_CTA_BUTTON_BG = '#ffffff';
export const DEFAULT_FOOTER_CTA_BUTTON_TEXT = '#0a0a0a';
export const DEFAULT_FOOTER_CTA_BUTTON_BORDER = '#e5e5e5';
export const DEFAULT_FOOTER_COPYRIGHT_LABEL = '© {year} {name}';
export const DEFAULT_FOOTER_MONUMENTAL_HEADLINE = "Let's build\nsomething remarkable";
export const DEFAULT_FOOTER_HERO_COLUMNS_MANIFESTO =
  'A short note on how we work: thoughtful collaboration, careful craft, and a bias for clarity over noise.';
export const DEFAULT_FOOTER_SPLIT_FORM_HEADLINE = 'Start a\nproject.';
export const DEFAULT_FOOTER_SPLIT_FORM_DESCRIPTION =
  "Tell us a little about what you're building — we'll get back to you within a day or two.";
export const DEFAULT_FOOTER_SPLIT_FORM_QUOTE =
  "I'll personally review your project and respond within 24 hours.";
export const DEFAULT_FOOTER_INVERTED_WORDMARK_CREDIT = 'Designed & built with care.';
export const DEFAULT_FOOTER_EDITORIAL_GRID_TAGLINE = 'Feel the fear,\ndo it anyway.';

export function resolveFooterCopyrightLabel(
  label: string | undefined,
  creatorName: string,
  year = new Date().getFullYear()
): string {
  const template =
    typeof label === 'string' && label.trim() ? label.trim() : DEFAULT_FOOTER_COPYRIGHT_LABEL;
  return template
    .replaceAll('{year}', String(year))
    .replaceAll('{name}', creatorName)
    .replaceAll('{{year}}', String(year))
    .replaceAll('{{name}}', creatorName);
}

export const DEFAULT_FOOTER_MARKETPLACE_CTA_LABEL = 'Marketplace profile';
export const DEFAULT_FOOTER_MARKETPLACE_CTA_BG = '#0a0a0a';
export const DEFAULT_FOOTER_MARKETPLACE_CTA_TEXT = '#fafafa';
export const DEFAULT_FOOTER_MARKETPLACE_CTA_BORDER = '#0a0a0a';

export const PORTFOLIO_FOOTER_MARKETPLACE_CTA_DESIGN_OPTIONS: {
  value: PortfolioFooterCtaDesign;
  label: string;
  description: string;
}[] = [
  { value: 'pill-dark', label: 'Dark pill', description: 'Solid dark capsule — primary CTA.' },
  { value: 'pill-outline', label: 'Outline pill', description: 'Bordered capsule — light fill.' },
  { value: 'pill-accent', label: 'Accent pill', description: 'Filled with the footer accent color.' },
  { value: 'text-arrow', label: 'Text + arrow', description: 'Minimal linked text with ↗.' },
];

/** Same presets for Contact me (Contact CTA design). */
export const PORTFOLIO_FOOTER_CONTACT_CTA_DESIGN_OPTIONS = PORTFOLIO_FOOTER_MARKETPLACE_CTA_DESIGN_OPTIONS;

/** Landing columns — Contact + useful creator links (not Product/Creators/Legal). */
export const DEFAULT_FOOTER_LINK_COLUMNS: PortfolioFooterLinkColumn[] = [
  {
    id: 'contact',
    title: 'Contact',
    /** Filled at render from email / phone / location / hours toggles. */
    links: [],
  },
  {
    id: 'links',
    title: 'Links',
    links: [
      { id: 'services', label: 'Services', href: '#services' },
      { id: 'work', label: 'Work', href: '#work' },
    ],
  },
];

export const DEFAULT_FOOTER_CENTERED_LINKS: PortfolioFooterLinkItem[] = [
  { id: 'centered-home', label: 'Home', href: '#hero' },
  { id: 'centered-about', label: 'About', href: '#about' },
  { id: 'centered-portfolio', label: 'Portfolio', href: '#work' },
  { id: 'centered-services', label: 'Services', href: '#services' },
  { id: 'centered-contact', label: 'Contact', href: '#contact' },
];

/** True when saved columns are still the old landing Product / Creators / Legal set. */
export function isLegacyLandingMarketingColumns(columns: PortfolioFooterLinkColumn[]): boolean {
  if (columns.length !== 3) return false;
  const ids = columns.map((col) => col.id.toLowerCase());
  return ids.includes('product') && ids.includes('creators') && ids.includes('legal');
}

export function resolveFooterLinkHref(href: string, creatorId: string): string {
  const raw = href.trim();
  if (raw === '__profile__' || raw === '{{profile}}') {
    return `/marketplace/${creatorId}`;
  }
  return raw || '#';
}

export function isFooterNopbProfileLink(link: Pick<PortfolioFooterLinkItem, 'id' | 'label' | 'href'>): boolean {
  const href = link.href.trim();
  const id = link.id.trim().toLowerCase();
  const label = link.label.trim().toLowerCase();
  return (
    id === 'profile' ||
    href === '__profile__' ||
    href === '{{profile}}' ||
    label === 'noprobleme profile' ||
    label === 'noproblème profile'
  );
}

export function isFooterMarketplaceColumnLink(
  link: Pick<PortfolioFooterLinkItem, 'id' | 'label' | 'href'>
): boolean {
  const href = link.href.trim().toLowerCase().replace(/\/$/, '');
  const id = link.id.trim().toLowerCase();
  const label = link.label.trim().toLowerCase();
  return (
    id === 'marketplace' ||
    label === 'marketplace' ||
    href === '/marketplace' ||
    href === 'marketplace'
  );
}

export type PortfolioFooterAutoSectionKey = 'aboutUs' | 'team' | 'gallery' | 'services' | 'work';

export const FOOTER_AUTO_SECTION_LINKS: {
  section: PortfolioFooterAutoSectionKey;
  id: string;
  label: string;
  href: string;
}[] = [
  { section: 'gallery', id: 'gallery', label: 'Gallery', href: '#gallery' },
  { section: 'aboutUs', id: 'about-us', label: 'About us', href: '#aboutUs' },
  { section: 'team', id: 'team', label: 'Team', href: '#team' },
  { section: 'services', id: 'services', label: 'Services', href: '#services' },
  { section: 'work', id: 'work', label: 'Work', href: '#work' },
];

function isFooterAutoSectionLink(
  link: Pick<PortfolioFooterLinkItem, 'id' | 'label' | 'href'>,
  auto: (typeof FOOTER_AUTO_SECTION_LINKS)[number]
): boolean {
  const href = link.href.trim();
  const id = link.id.trim().toLowerCase();
  const label = link.label.trim().toLowerCase();
  return id === auto.id || href === auto.href || label === auto.label.toLowerCase();
}

/** Landing Links — section anchors, only when that portfolio section is visible. */
export function resolveFooterLandingSectionLinks(
  stored: PortfolioFooterLinkItem[],
  visible?: Partial<Record<PortfolioFooterAutoSectionKey, boolean>>
): PortfolioFooterLinkItem[] {
  if (!visible) return stored;
  const custom = stored.filter(
    (link) => !FOOTER_AUTO_SECTION_LINKS.some((auto) => isFooterAutoSectionLink(link, auto))
  );
  const autoLinks = FOOTER_AUTO_SECTION_LINKS.filter((auto) => visible[auto.section] === true).map(
    (auto) => {
      const existing = stored.find((link) => isFooterAutoSectionLink(link, auto));
      return existing ?? { id: auto.id, label: auto.label, href: auto.href };
    }
  );
  return [...autoLinks, ...custom];
}

export const DEFAULT_FOOTER_CONNECT_LABEL = 'Connect';

/** Links column only (internal section anchors) — used by Landing and Contact card. */
export function resolveFooterInternalLinksColumn(
  presentation: Pick<
    PortfolioFooterPresentationSettings,
    'linkColumns' | 'showMarketplaceColumnLink' | 'showNopbProfileLink'
  >,
  visible?: Partial<Record<PortfolioFooterAutoSectionKey, boolean>>
): { title: string; links: PortfolioFooterLinkItem[] } {
  const raw = presentation.linkColumns ?? [];
  const col =
    raw.find((item) => item.id === 'links' || item.title.trim().toLowerCase() === 'links') ??
    DEFAULT_FOOTER_LINK_COLUMNS.find((item) => item.id === 'links')!;
  let links = (col.links ?? []).filter((link) => link.label.trim() || link.href.trim());
  if (presentation.showMarketplaceColumnLink === true) {
    if (!links.some((link) => isFooterMarketplaceColumnLink(link))) {
      links = [{ id: 'marketplace', label: 'Marketplace', href: '/marketplace' }, ...links];
    }
  } else {
    links = links.filter((link) => !isFooterMarketplaceColumnLink(link));
  }
  if (presentation.showNopbProfileLink === true) {
    if (!links.some((link) => isFooterNopbProfileLink(link))) {
      const insertAt = Math.min(
        links.some((link) => isFooterMarketplaceColumnLink(link)) ? 1 : 0,
        links.length
      );
      links = [
        ...links.slice(0, insertAt),
        { id: 'profile', label: 'NoProbleme profile', href: '__profile__' },
        ...links.slice(insertAt),
      ];
    }
  } else {
    links = links.filter((link) => !isFooterNopbProfileLink(link));
  }
  links = resolveFooterLandingSectionLinks(links, visible);
  return { title: col.title.trim() || 'Links', links };
}

function newFooterLinkId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createFooterLinkItem(
  partial?: Partial<PortfolioFooterLinkItem>
): PortfolioFooterLinkItem {
  return {
    id: typeof partial?.id === 'string' && partial.id.trim() ? partial.id.trim() : newFooterLinkId('link'),
    label: typeof partial?.label === 'string' ? partial.label : 'Link',
    href: typeof partial?.href === 'string' ? partial.href : '#',
  };
}

export function createFooterLinkColumn(
  partial?: Partial<PortfolioFooterLinkColumn>
): PortfolioFooterLinkColumn {
  return {
    id:
      typeof partial?.id === 'string' && partial.id.trim()
        ? partial.id.trim()
        : newFooterLinkId('col'),
    title: typeof partial?.title === 'string' ? partial.title : 'Column',
    links: Array.isArray(partial?.links)
      ? partial!.links.map((link) => createFooterLinkItem(link))
      : [createFooterLinkItem()],
  };
}

export function normalizeFooterLinkColumns(
  value: unknown,
  fallback: PortfolioFooterLinkColumn[] = DEFAULT_FOOTER_LINK_COLUMNS
): PortfolioFooterLinkColumn[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback.map((col) => ({
      ...col,
      links: col.links.map((link) => ({ ...link })),
    }));
  }
  const columns = value
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const record = raw as Record<string, unknown>;
      const title = typeof record.title === 'string' ? record.title.trim() : '';
      const linksRaw = Array.isArray(record.links) ? record.links : [];
      const links = linksRaw
        .map((link) => {
          if (!link || typeof link !== 'object') return null;
          const item = link as Record<string, unknown>;
          const label = typeof item.label === 'string' ? item.label.trim() : '';
          const href = typeof item.href === 'string' ? item.href.trim() : '';
          if (!label && !href) return null;
          return createFooterLinkItem({
            id: typeof item.id === 'string' ? item.id : undefined,
            label: label || 'Link',
            href: href || '#',
          });
        })
        .filter((link): link is PortfolioFooterLinkItem => Boolean(link));
      if (!title && links.length === 0) return null;
      return createFooterLinkColumn({
        id: typeof record.id === 'string' ? record.id : undefined,
        title: title || 'Column',
        links,
      });
    })
    .filter((col): col is PortfolioFooterLinkColumn => Boolean(col));

  if (columns.length === 0) {
    return fallback.map((col) => ({
      ...col,
      links: col.links.map((link) => ({ ...link })),
    }));
  }

  // Migrate old Product / Creators / Legal marketing columns → Contact + Links.
  if (isLegacyLandingMarketingColumns(columns)) {
    return DEFAULT_FOOTER_LINK_COLUMNS.map((col) => ({
      ...col,
      links: col.links.map((link) => ({ ...link })),
    }));
  }

  return columns;
}

export function normalizeFooterCenteredLinks(
  value: unknown,
  fallback: PortfolioFooterLinkItem[] = DEFAULT_FOOTER_CENTERED_LINKS
): PortfolioFooterLinkItem[] {
  const cloneFallback = () => fallback.map((link) => ({ ...link }));
  if (!Array.isArray(value) || value.length === 0) return cloneFallback();

  const links = value
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const record = raw as Record<string, unknown>;
      const label = typeof record.label === 'string' ? record.label.trim() : '';
      const href = typeof record.href === 'string' ? record.href.trim() : '';
      if (!label || !href) return null;
      return createFooterLinkItem({
        id: typeof record.id === 'string' ? record.id : undefined,
        label,
        href,
      });
    })
    .filter((link): link is PortfolioFooterLinkItem => Boolean(link));

  return links.length > 0 ? links : cloneFallback();
}

const FOOTER_LAYOUT_KEY_MAX = 40;
const FOOTER_LAYOUT_TEXT_MAX = 600;
const FOOTER_LAYOUT_SECTION_LINKS_MAX = 24;

export function normalizeFooterDesignLayouts(value: unknown): PortfolioFooterDesignLayouts {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const designs = new Set<string>(PORTFOLIO_FOOTER_DESIGN_OPTIONS.map((option) => option.value));
  const result: PortfolioFooterDesignLayouts = {};

  for (const [design, rawLayout] of Object.entries(value as Record<string, unknown>)) {
    if (!designs.has(design) || !rawLayout || typeof rawLayout !== 'object') continue;
    const layoutRecord = rawLayout as Record<string, unknown>;
    const layout: PortfolioFooterDesignLayout = {};

    if (Array.isArray(layoutRecord.sectionLinks)) {
      const ids = layoutRecord.sectionLinks.filter(
        (id): id is string => typeof id === 'string' && id.length > 0 && id.length <= FOOTER_LAYOUT_KEY_MAX
      );
      layout.sectionLinks = Array.from(new Set(ids)).slice(0, FOOTER_LAYOUT_SECTION_LINKS_MAX);
    }

    if (layoutRecord.elements && typeof layoutRecord.elements === 'object') {
      const elements: Record<string, PortfolioFooterLayoutElementOverride> = {};
      for (const [key, rawOverride] of Object.entries(layoutRecord.elements as Record<string, unknown>)) {
        if (key.length > FOOTER_LAYOUT_KEY_MAX || !rawOverride || typeof rawOverride !== 'object') continue;
        const overrideRecord = rawOverride as Record<string, unknown>;
        const override: PortfolioFooterLayoutElementOverride = {};
        if (typeof overrideRecord.visible === 'boolean') override.visible = overrideRecord.visible;
        if (typeof overrideRecord.text === 'string') {
          override.text = overrideRecord.text.slice(0, FOOTER_LAYOUT_TEXT_MAX);
        }
        if (overrideRecord.source === 'bio' || overrideRecord.source === 'custom') {
          override.source = overrideRecord.source;
        }
        if (
          typeof overrideRecord.choice === 'string' &&
          overrideRecord.choice.length > 0 &&
          overrideRecord.choice.length <= FOOTER_LAYOUT_KEY_MAX
        ) {
          override.choice = overrideRecord.choice;
        }
        if (Object.keys(override).length > 0) elements[key] = override;
      }
      if (Object.keys(elements).length > 0) layout.elements = elements;
    }

    if (layout.sectionLinks || layout.elements) {
      result[design as PortfolioFooterDesign] = layout;
    }
  }

  return result;
}

export const DEFAULT_FOOTER_PRESENTATION: PortfolioFooterPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  sectionBackgroundEnabled: true,
  sectionBackgroundFill: 'solid',
  sectionBackgroundColor: DEFAULT_FOOTER_BACKGROUND_COLOR,
  sectionBackgroundOpacity: 100,
  design: 'centered-minimal',
  alignment: 'split',
  padding: 'standard',
  paddingTopPx: 40,
  paddingBottomPx: 12,
  paddingLeftPx: 40,
  paddingRightPx: 40,
  marginTop: 'none',
  marginTopPx: 0,
  landingBrandGapPx: 28,
  columnHeadingGapPx: 16,
  showBrand: true,
  showAvatar: false,
  showDescription: false,
  descriptionSource: 'bio',
  descriptionCustom: '',
  centeredIdentity: 'name',
  centeredCustomText: 'Logo',
  centeredCustomLogoUrl: '',
  centeredLinks: DEFAULT_FOOTER_CENTERED_LINKS.map((link) => ({ ...link })),
  linkColumns: DEFAULT_FOOTER_LINK_COLUMNS,
  showEmail: true,
  showPhone: true,
  showLocation: false,
  showHours: false,
  showContactIcons: true,
  contactIconSize: 'md',
  showCtaIcon: true,
  showCopyright: true,
  copyrightLabel: DEFAULT_FOOTER_COPYRIGHT_LABEL,
  showMarketplaceLink: false,
  marketplaceCtaLabel: DEFAULT_FOOTER_MARKETPLACE_CTA_LABEL,
  marketplaceCtaHref: '',
  marketplaceCtaDesign: 'pill-outline',
  marketplaceCtaBackgroundColor: DEFAULT_FOOTER_MARKETPLACE_CTA_BG,
  marketplaceCtaTextColor: DEFAULT_FOOTER_MARKETPLACE_CTA_TEXT,
  marketplaceCtaBorderColor: DEFAULT_FOOTER_MARKETPLACE_CTA_BORDER,
  marketplaceCtaShowArrow: true,
  showLandingMarketplaceLink: false,
  showMarketplaceColumnLink: false,
  showNopbProfileLink: false,
  showProfileVisits: false,
  showContactLinks: true,
  showDesignCredit: false,
  showTopBorder: false,
  showContentDivider: true,
  contentDividerColor: '',
  contentDividerOpacity: 40,
  showMiniBar: false,
  miniBarDesign: 'minimal',
  showContactCta: false,
  ctaTitle: DEFAULT_FOOTER_CTA_TITLE,
  ctaSubtitle: DEFAULT_FOOTER_CTA_SUBTITLE,
  ctaButtonLabel: DEFAULT_FOOTER_CTA_BUTTON,
  ctaDesign: 'pill-outline',
  ctaTitleColor: DEFAULT_FOOTER_CTA_TITLE_COLOR,
  ctaSubtitleColor: DEFAULT_FOOTER_CTA_SUBTITLE_COLOR,
  ctaButtonBackgroundColor: DEFAULT_FOOTER_CTA_BUTTON_BG,
  ctaButtonTextColor: DEFAULT_FOOTER_CTA_BUTTON_TEXT,
  ctaButtonBorder: 'none',
  ctaButtonBorderColor: DEFAULT_FOOTER_CTA_BUTTON_BORDER,
  ctaButtonRadius: 'md',
  ctaButtonPadding: 'md',
  ctaButtonsAlign: 'center',
  textColor: DEFAULT_FOOTER_TEXT_COLOR,
  primaryColor: DEFAULT_FOOTER_PRIMARY_COLOR,
  iconColor: DEFAULT_FOOTER_ICON_COLOR,
  accentColor: DEFAULT_FOOTER_ACCENT_COLOR,
  pattern: 'none',
  patternColor: DEFAULT_FOOTER_PATTERN_COLOR,
  patternOpacity: 18,
  useHeroPalette: false,
  colorModeOverride: 'auto',
  premiumFontSize: 'medium',
  lockPaletteAcrossColorModes: false,
  footerPalette: DEFAULT_FOOTER_PALETTE,
  footerColorBindings: DEFAULT_FOOTER_COLOR_BINDINGS,
  elementStyles: DEFAULT_FOOTER_ELEMENT_STYLES,
  monumentalHeadline: DEFAULT_FOOTER_MONUMENTAL_HEADLINE,
  heroColumnsManifesto: DEFAULT_FOOTER_HERO_COLUMNS_MANIFESTO,
  splitFormHeadline: DEFAULT_FOOTER_SPLIT_FORM_HEADLINE,
  splitFormDescription: DEFAULT_FOOTER_SPLIT_FORM_DESCRIPTION,
  splitFormQuote: DEFAULT_FOOTER_SPLIT_FORM_QUOTE,
  invertedWordmarkCredit: DEFAULT_FOOTER_INVERTED_WORDMARK_CREDIT,
  editorialGridTagline: DEFAULT_FOOTER_EDITORIAL_GRID_TAGLINE,
  contactCardColorToken: 'principal',
  designLayouts: {},
  photoUrl: '',
  headerDesign: 'editorial',
  headerDesignAlignment: 'left',
  headerMarginBottom: 'md',
  headerTitleSize: 'xl',
  headerTitleWeight: 'bold',
  headerBackgroundUnified: false,
  headerPaddingTop: 'none',
  headerPaddingBottom: 'none',
  headerEditorialTitleText: '',
  headerEditorialSubtitleText: '',
  headerEditorialTitleColor: 'texteFort',
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
  headerBillboardWordStyle: 'outline',
  headerBillboardWordColor: 'principal',
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
  headerHeroTitleText: '',
  headerHeroCtaLabel: '',
  headerHeroTitleColor: 'texteFort',
  headerNameColor: 'texteFort',
  headerTimezoneKickerText: '',
  headerTimezoneTitleText: '',
  headerTimezoneDescriptionText: '',
  headerTimezoneTitleColor: 'texteFort',
};

export const PORTFOLIO_FOOTER_PATTERN_OPTIONS: {
  value: PortfolioFooterPattern;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Solid or gradient fill only.' },
  { value: 'dots', label: 'Dots', description: 'Soft dotted texture.' },
  { value: 'grid', label: 'Grid', description: 'Fine editorial grid lines.' },
  { value: 'diagonal', label: 'Diagonal', description: '45° stripe hatching.' },
  { value: 'crosshatch', label: 'Crosshatch', description: 'Intersecting diagonal weave.' },
];

export const PORTFOLIO_FOOTER_MINI_BAR_DESIGN_OPTIONS: {
  value: PortfolioFooterMiniBarDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Copyright, live clock + location, magnetic "Back to top".',
  },
  {
    value: 'kinetic',
    label: 'Kinetic line',
    description: 'Accent scroll-progress hairline, bolder type, continuous looping arrow bounce.',
  },
  {
    value: 'split-caps',
    label: 'Split caps',
    description: 'Borderless Swiss caps in the far corners, GSAP letter-spacing hover, no divider line.',
  },
  {
    value: 'landing',
    label: 'Landing',
    description: 'A single quiet copyright line, left-aligned, on a thin top hairline.',
  },
  {
    value: 'contact-cta',
    label: 'Contact CTA',
    description: 'A single centered copyright line on a thin top hairline.',
  },
  {
    value: 'hero-columns',
    label: 'Hero columns',
    description: 'Copyright on the left, availability status + hours on the right.',
  },
  {
    value: 'inverted-wordmark',
    label: 'Inverted wordmark',
    description: 'Solid opposite-contrast fill — copyright, a centered credit line, and "Back to top".',
  },
  {
    value: 'services-reveal',
    label: 'Services reveal',
    description: 'A single centered copyright line on a thin top hairline.',
  },
];

export const FOOTER_PREMIUM_FONT_SIZES: PortfolioFooterPremiumFontSize[] = [
  'small',
  'medium',
  'large',
  'xlarge',
  'xxlarge',
];

export const PORTFOLIO_FOOTER_PREMIUM_FONT_SIZE_OPTIONS: {
  value: PortfolioFooterPremiumFontSize;
  label: string;
  description: string;
}[] = [
  { value: 'small', label: 'Small', description: 'Compact type across every Footer design.' },
  { value: 'medium', label: 'Medium', description: 'Default, balanced type size.' },
  { value: 'large', label: 'Large', description: 'Bigger type for maximum readability.' },
  { value: 'xlarge', label: 'Extra Large', description: 'Extra large type for a bold, high-impact look.' },
  {
    value: 'xxlarge',
    label: 'Super Extra Large',
    description: 'Maximum type size for the most dramatic, oversized look.',
  },
];

/** Multiplier every Footer design's own standardized body/label text sizes are scaled by,
 *  via `calc(<base> * var(--pf-footer-font-scale, 1))` in globals.css — same values as
 *  `faqPremiumFontScale` for the FAQ section, kept in sync deliberately. */
const FOOTER_PREMIUM_FONT_SCALE: Record<PortfolioFooterPremiumFontSize, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
  xlarge: 1.3,
  xxlarge: 1.45,
};

export function footerPremiumFontScale(size: PortfolioFooterPremiumFontSize): number {
  return FOOTER_PREMIUM_FONT_SCALE[size] ?? 1;
}

export const PORTFOLIO_FOOTER_DESIGN_OPTIONS: {
  value: PortfolioFooterDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'centered-minimal',
    label: 'Centered minimal',
    description: 'Centered identity, bare social/contact icons, spring-lift hover focus. Light/dark aware.',
  },
  {
    value: 'landing',
    label: 'Landing columns',
    description: 'Borderless three-column Swiss grid, bare icons, spring-lift hover focus. Light/dark aware.',
  },
  {
    value: 'compact',
    label: 'Compact SaaS',
    description: 'Monumental headline reveal, borderless contact line, theatrical hover focus. Light/dark aware.',
  },
  {
    value: 'minimal',
    label: 'Contact CTA',
    description: 'Name + bio + CTA | location, contact, socials — copyright below.',
  },
  {
    value: 'contact-card',
    label: 'Contact card',
    description: 'Accent card (name, location, phone, email) + Links — grouped toward the center.',
  },
  {
    value: 'monumental',
    label: 'Monumental',
    description: 'Asymmetric editorial grid — giant headline, borderless contact form, kinetic watermark.',
  },
  {
    value: 'hero-columns',
    label: 'Hero columns',
    description: 'Monumental hero + pill CTA, then a 3-column grid — parallax portrait, navigation, acknowledgement & info.',
  },
  {
    value: 'split-form',
    label: 'Split project form',
    description: 'Asymmetric split screen — identity card and quote on the left, borderless floating-label contact form on the right.',
  },
  {
    value: 'timezone-editorial',
    label: 'Timezone editorial',
    description: 'Editorial two-column layout — headline and contact pill left, live local time and arrow-led socials pinned right.',
  },
  {
    value: 'inverted-wordmark',
    label: 'Inverted wordmark',
    description: 'Three-column Swiss editorial grid landing on a mirrored, upside-down giant wordmark on a solid sub-footer bar.',
  },
  {
    value: 'services-reveal',
    label: 'Services grid reveal',
    description: 'Classic services/contact/address grid, elevated with a scroll-revealed monumental headline and magnetic social icons.',
  },
  {
    value: 'editorial-grid',
    label: 'Editorial grid',
    description: 'Edge-to-edge monumental name, a suspended bento card with a magnetic arrow button, and a color-shift hover on every link.',
  },
  {
    value: 'headline-reveal',
    label: 'Headline reveal',
    description: 'Borderless — no dividers, no icon chips. A monumental CTA masks in on scroll, with a simple hover accent on each coordinate.',
  },
];

export const PORTFOLIO_FOOTER_CTA_BUTTON_BORDER_OPTIONS: {
  value: PortfolioFooterCtaButtonBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No outline around the button.' },
  { value: 'soft', label: 'Soft', description: 'Light 1px border.' },
  { value: 'solid', label: 'Solid', description: 'Clear 1.5px border.' },
];

export const PORTFOLIO_FOOTER_CTA_BUTTON_RADIUS_OPTIONS: {
  value: PortfolioFooterCtaButtonRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Square', description: 'No rounding.' },
  { value: 'sm', label: 'S', description: 'Slightly rounded.' },
  { value: 'md', label: 'M', description: 'Default rounded rectangle.' },
  { value: 'lg', label: 'L', description: 'Softer corners.' },
  { value: 'full', label: 'Pill', description: 'Fully rounded capsule.' },
];

export const PORTFOLIO_FOOTER_CTA_BUTTON_PADDING_OPTIONS: {
  value: PortfolioFooterCtaButtonPadding;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Compact', description: 'Tighter hit area.' },
  { value: 'md', label: 'Medium', description: 'Balanced padding.' },
  { value: 'lg', label: 'Large', description: 'Roomier button.' },
];

export const PORTFOLIO_FOOTER_CTA_BUTTONS_ALIGN_OPTIONS: {
  value: PortfolioFooterCtaButtonsAlign;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Flush left on large screens.' },
  { value: 'center', label: 'Center', description: 'Centered (default).' },
  { value: 'right', label: 'Right', description: 'Flush right on large screens.' },
];

export const PORTFOLIO_FOOTER_CONTACT_ICON_SIZE_OPTIONS: {
  value: PortfolioFooterContactIconSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'S', description: 'Compact glyphs.' },
  { value: 'md', label: 'M', description: 'Default size.' },
  { value: 'lg', label: 'L', description: 'Larger contact icons.' },
];

export function footerContactIconSizeClass(size: PortfolioFooterContactIconSize = 'md'): string {
  switch (size) {
    case 'sm':
      return 'h-3.5 w-3.5';
    case 'lg':
      return 'h-5 w-5';
    default:
      return 'h-4 w-4';
  }
}

export function footerContactIconSizeClassCompact(size: PortfolioFooterContactIconSize = 'md'): string {
  switch (size) {
    case 'sm':
      return 'h-3 w-3';
    case 'lg':
      return 'h-4 w-4';
    default:
      return 'h-3.5 w-3.5';
  }
}

export function footerCtaButtonsAlignClass(align: PortfolioFooterCtaButtonsAlign = 'center'): string {
  switch (align) {
    case 'left':
      return 'justify-center lg:justify-start';
    case 'right':
      return 'justify-center lg:justify-end';
    default:
      return 'justify-center';
  }
}

export const PORTFOLIO_FOOTER_PADDING_OPTIONS: {
  value: Exclude<PortfolioFooterPadding, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'compact', label: 'Compact', description: 'Tighter space on all sides inside the footer.' },
  { value: 'standard', label: 'Standard', description: 'Default balanced padding on every side.' },
  { value: 'comfortable', label: 'Comfortable', description: 'More breathing room on all sides.' },
  { value: 'spacious', label: 'Spacious', description: 'Maximum padding on all sides.' },
];

export const FOOTER_PADDING_PX_MIN = 0;
export const FOOTER_PADDING_PX_MAX = 120;

export const FOOTER_PADDING_PRESET_PX: Record<
  Exclude<PortfolioFooterPadding, 'custom'>,
  { top: number; bottom: number; left: number; right: number }
> = {
  compact: { top: 24, bottom: 12, left: 24, right: 24 },
  standard: { top: 40, bottom: 12, left: 40, right: 40 },
  comfortable: { top: 48, bottom: 16, left: 48, right: 48 },
  spacious: { top: 64, bottom: 20, left: 64, right: 64 },
};

export function clampFooterPaddingPx(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(FOOTER_PADDING_PX_MAX, Math.max(FOOTER_PADDING_PX_MIN, n)));
}

export function resolveFooterPaddingSides(
  settings: Pick<
    PortfolioFooterPresentationSettings,
    | 'padding'
    | 'paddingTopPx'
    | 'paddingBottomPx'
    | 'paddingLeftPx'
    | 'paddingRightPx'
  >
): { top: number; bottom: number; left: number; right: number } {
  const preset = settings.padding ?? 'standard';
  if (preset !== 'custom' && FOOTER_PADDING_PRESET_PX[preset]) {
    return FOOTER_PADDING_PRESET_PX[preset];
  }
  const fallback = FOOTER_PADDING_PRESET_PX.standard;
  return {
    top: clampFooterPaddingPx(settings.paddingTopPx, fallback.top),
    bottom: clampFooterPaddingPx(settings.paddingBottomPx, fallback.bottom),
    left: clampFooterPaddingPx(settings.paddingLeftPx, fallback.left),
    right: clampFooterPaddingPx(settings.paddingRightPx, fallback.right),
  };
}

/** Mobile floors — always restore safe inset even if custom padding is 0. */
export const FOOTER_PADDING_MOBILE_MIN_X_PX = 20;
export const FOOTER_PADDING_MOBILE_MIN_TOP_PX = 24;
export const FOOTER_PADDING_MOBILE_MIN_BOTTOM_PX = 16;

/**
 * CSS variables for `.pf-footer-content-pad`.
 * Mobile media query enforces minimum padding (custom desktop values still apply from sm+).
 */
export function footerContentPaddingStyle(
  settings: Pick<
    PortfolioFooterPresentationSettings,
    | 'design'
    | 'padding'
    | 'paddingTopPx'
    | 'paddingBottomPx'
    | 'paddingLeftPx'
    | 'paddingRightPx'
  >
): CSSProperties {
  const sides = resolveFooterPaddingSides(settings);
  const extraX = settings.design === 'landing' || settings.design === 'compact' ? 72 : 0;
  // "Contact CTA" (minimal) is a full-width design whose left/right inset should come
  // purely from the site-wide editorial gutter (the outer shell it's nested in already
  // applies that) — not a second, independent layer of padding on top of it.
  const padX = settings.design === 'minimal' ? 0 : extraX;
  return {
    ['--pf-footer-pad-t' as string]: `${sides.top}px`,
    ['--pf-footer-pad-b' as string]: `${sides.bottom}px`,
    ['--pf-footer-pad-l' as string]: `${settings.design === 'minimal' ? 0 : sides.left + padX}px`,
    ['--pf-footer-pad-r' as string]: `${settings.design === 'minimal' ? 0 : sides.right + padX}px`,
  };
}

export function footerContentPaddingClassName(): string {
  return 'pf-footer-content-pad';
}

export const PORTFOLIO_FOOTER_MARGIN_TOP_OPTIONS: {
  value: Exclude<PortfolioFooterMarginTop, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Flush with the section above.' },
  { value: 'compact', label: 'Compact', description: 'Small gap above the footer.' },
  { value: 'standard', label: 'Standard', description: 'Balanced margin above the footer.' },
  { value: 'comfortable', label: 'Comfortable', description: 'More space above the footer.' },
  { value: 'spacious', label: 'Spacious', description: 'Large gap above the footer.' },
];

export const FOOTER_MARGIN_TOP_PX_MIN = 0;
export const FOOTER_MARGIN_TOP_PX_MAX = 160;
export const FOOTER_MARGIN_TOP_PRESET_PX: Record<
  Exclude<PortfolioFooterMarginTop, 'custom'>,
  number
> = {
  none: 0,
  compact: 32,
  standard: 48,
  comfortable: 64,
  spacious: 80,
};

export const FOOTER_LANDING_BRAND_GAP_PX_MIN = 0;
export const FOOTER_LANDING_BRAND_GAP_PX_MAX = 64;
export const DEFAULT_FOOTER_LANDING_BRAND_GAP_PX = 28;

export function clampFooterMarginTopPx(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(
    Math.min(FOOTER_MARGIN_TOP_PX_MAX, Math.max(FOOTER_MARGIN_TOP_PX_MIN, n))
  );
}

export function resolveFooterMarginTopPx(
  settings: Pick<PortfolioFooterPresentationSettings, 'marginTop' | 'marginTopPx'>
): number {
  const preset = settings.marginTop ?? 'none';
  if (preset === 'custom') {
    return clampFooterMarginTopPx(settings.marginTopPx, 0);
  }
  return FOOTER_MARGIN_TOP_PRESET_PX[preset] ?? 0;
}

export function footerTopMarginStyle(
  settings: Pick<PortfolioFooterPresentationSettings, 'marginTop' | 'marginTopPx'>
): CSSProperties {
  if ((settings.marginTop ?? 'none') !== 'custom') return {};
  const px = resolveFooterMarginTopPx(settings);
  return px > 0 ? { marginTop: px } : { marginTop: 0 };
}

export function clampFooterLandingBrandGapPx(
  value: unknown,
  fallback = DEFAULT_FOOTER_LANDING_BRAND_GAP_PX
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(
    Math.min(FOOTER_LANDING_BRAND_GAP_PX_MAX, Math.max(FOOTER_LANDING_BRAND_GAP_PX_MIN, n))
  );
}

export function footerLandingBrandGapStyle(
  settings: Pick<PortfolioFooterPresentationSettings, 'landingBrandGapPx'>
): CSSProperties {
  return {
    gap: `${clampFooterLandingBrandGapPx(settings.landingBrandGapPx)}px`,
  };
}

export const FOOTER_COLUMN_HEADING_GAP_PX_MIN = 0;
export const FOOTER_COLUMN_HEADING_GAP_PX_MAX = 64;
export const DEFAULT_FOOTER_COLUMN_HEADING_GAP_PX = 16;

export function clampFooterColumnHeadingGapPx(
  value: unknown,
  fallback = DEFAULT_FOOTER_COLUMN_HEADING_GAP_PX
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(
    Math.min(FOOTER_COLUMN_HEADING_GAP_PX_MAX, Math.max(FOOTER_COLUMN_HEADING_GAP_PX_MIN, n))
  );
}

/** Margin under Contact / Links / Networks titles before list items. */
export function footerColumnHeadingGapStyle(
  settings: Pick<PortfolioFooterPresentationSettings, 'columnHeadingGapPx'>
): CSSProperties {
  return {
    marginBottom: `${clampFooterColumnHeadingGapPx(settings.columnHeadingGapPx)}px`,
  };
}

export const PORTFOLIO_FOOTER_ALIGNMENT_OPTIONS: {
  value: PortfolioFooterAlignment;
  label: string;
  description: string;
}[] = [
  {
    value: 'split',
    label: 'Spread',
    description: 'Three equal columns across the full width — no empty side.',
  },
  {
    value: 'center',
    label: 'Center',
    description: 'Columns centered; content centered inside each column.',
  },
  {
    value: 'left',
    label: 'Left pack',
    description: 'Columns grouped toward the left with a max width.',
  },
];

export const PORTFOLIO_FOOTER_DESCRIPTION_SOURCE_OPTIONS: {
  value: PortfolioFooterDescriptionSource;
  label: string;
  description: string;
}[] = [
  { value: 'bio', label: 'Bio', description: 'Uses your profile bio.' },
  { value: 'custom', label: 'Custom', description: 'Write a short footer blurb.' },
];

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Relative luminance 0–1 (WCAG). */
export function footerColorLuminance(hex: string): number {
  const rgb = parseHexRgb(hex);
  if (!rgb) return 0;
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLin(rgb.r) + 0.7152 * toLin(rgb.g) + 0.0722 * toLin(rgb.b);
}

export function isFooterBackgroundLight(
  settings: Pick<
    PortfolioSectionBackgroundSettings,
    | 'sectionBackgroundEnabled'
    | 'sectionBackgroundFill'
    | 'sectionBackgroundColor'
    | 'sectionBackgroundGradientFrom'
  > &
    Partial<Pick<PortfolioSectionBackgroundSettings, 'sectionBackgroundColorA'>>
): boolean {
  if (!settings.sectionBackgroundEnabled) return true;
  const sample =
    settings.sectionBackgroundFill === 'gradient'
      ? settings.sectionBackgroundGradientFrom
      : settings.sectionBackgroundFill === 'split'
        ? settings.sectionBackgroundColorA || settings.sectionBackgroundColor
        : settings.sectionBackgroundColor;
  return footerColorLuminance(sample) > 0.55;
}

export function footerContrastingPrimary(settings: PortfolioSectionBackgroundSettings): string {
  return isFooterBackgroundLight(settings)
    ? DEFAULT_FOOTER_PRIMARY_ON_LIGHT
    : DEFAULT_FOOTER_PRIMARY_COLOR;
}

function isNearWhite(hex: string): boolean {
  return footerColorLuminance(hex) > 0.85;
}

function isNearBlack(hex: string): boolean {
  return footerColorLuminance(hex) < 0.12;
}

/** Keep primary text readable when the section fill is light/dark. */
export function resolveFooterPrimaryColor(
  settings: Pick<
    PortfolioFooterPresentationSettings,
    | 'primaryColor'
    | 'sectionBackgroundEnabled'
    | 'sectionBackgroundFill'
    | 'sectionBackgroundColor'
    | 'sectionBackgroundGradientFrom'
  >
): string {
  const primary = sanitizeHex(settings.primaryColor, DEFAULT_FOOTER_PRIMARY_COLOR);
  const light = isFooterBackgroundLight(settings);
  if (light && isNearWhite(primary)) return DEFAULT_FOOTER_PRIMARY_ON_LIGHT;
  if (!light && isNearBlack(primary)) return DEFAULT_FOOTER_PRIMARY_COLOR;
  return primary;
}

export function footerShellClass(
  design: PortfolioFooterDesign,
  showTopBorder: boolean,
  lightBackground = false
): string {
  if (design === 'centered-minimal') return '';
  const border = showTopBorder
    ? lightBackground
      ? 'border-t border-neutral-200/90'
      : 'border-t border-white/10'
    : '';
  return border;
}

/**
 * Bottom inset under the footer. Keep this tight — a large reserved nav void
 * read as empty black space under the copyright on every design.
 * Floating nav can sit over the footer edge; only the device safe-area is required.
 */
export function portfolioFooterNavClearanceClass(
  placement: PortfolioNavSettings['placement'],
  opts?: { navMode?: PortfolioNavSettings['navMode']; enabled?: boolean }
): string {
  void placement;
  const enabled = opts?.enabled !== false;
  if (!enabled) {
    return 'pb-[env(safe-area-inset-bottom,0px)]';
  }
  return 'pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]';
}

export function footerTopMarginClass(
  marginTop: PortfolioFooterMarginTop = 'none'
): string {
  // Custom uses inline style via footerTopMarginStyle — no utility class.
  if (marginTop === 'custom') return '';
  switch (marginTop) {
    case 'compact':
      return 'mt-6 sm:mt-8';
    case 'standard':
      return 'mt-10 sm:mt-12';
    case 'comfortable':
      return 'mt-14 sm:mt-16';
    case 'spacious':
      return 'mt-16 sm:mt-20';
    default:
      return 'mt-0';
  }
}

export function footerLayoutClass(
  design: PortfolioFooterDesign,
  alignment: PortfolioFooterAlignment,
  options?: { contentDivider?: boolean }
): string {
  void alignment;
  const withDivider = options?.contentDivider === true;
  switch (design) {
    case 'centered-minimal':
      return 'flex w-full flex-col items-center justify-center gap-7 text-center sm:gap-8';
    case 'landing':
      return withDivider
        ? 'flex w-full flex-col gap-8 sm:gap-10'
        : 'flex w-full flex-col gap-10 sm:gap-12';
    case 'compact':
      return 'flex w-full flex-col gap-8 sm:gap-9';
    case 'minimal':
      return withDivider
        ? 'flex w-full flex-col gap-8 sm:gap-10'
        : 'flex w-full flex-col gap-10 sm:gap-12';
    case 'contact-card':
      return 'flex w-full flex-col items-center gap-10 sm:gap-12';
    default:
      return 'flex w-full flex-col items-center gap-8 sm:gap-10';
  }
}

/** @deprecated Prefer {@link footerContentPaddingStyle}. */
export function footerContentPaddingClass(padding: PortfolioFooterPadding = 'standard'): string {
  const key = padding === 'custom' ? 'standard' : padding;
  switch (key) {
    case 'compact':
      return 'px-6 pt-6 pb-3 sm:px-8 sm:pt-8 sm:pb-4';
    case 'comfortable':
      return 'px-12 pt-12 pb-4 sm:px-16 sm:pt-16 sm:pb-5 lg:px-20 lg:pt-20 lg:pb-5';
    case 'spacious':
      return 'px-16 pt-16 pb-5 sm:px-20 sm:pt-20 sm:pb-6 lg:px-24 lg:pt-24 lg:pb-6';
    default:
      return 'px-10 pt-10 pb-3 sm:px-12 sm:pt-12 sm:pb-4 lg:px-14 lg:pt-14 lg:pb-4';
  }
}

/** @deprecated Prefer {@link footerContentPaddingStyle}. Kept for older call sites. */
export function footerInnerInsetClass(design: PortfolioFooterDesign): string {
  void design;
  return footerContentPaddingClass('standard');
}

export function footerTextStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FOOTER_TEXT_COLOR) };
}

export function footerPrimaryStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FOOTER_PRIMARY_COLOR) };
}

export function footerCtaTitleStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FOOTER_CTA_TITLE_COLOR) };
}

export function footerCtaSubtitleStyle(color: string): CSSProperties {
  const hex = sanitizeHex(color, DEFAULT_FOOTER_CTA_SUBTITLE_COLOR);
  return { color: hex === DEFAULT_FOOTER_CTA_SUBTITLE_COLOR ? 'rgba(255,255,255,0.85)' : hex };
}

export function footerCtaButtonRadiusClass(radius: PortfolioFooterCtaButtonRadius): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-lg';
    case 'lg':
      return 'rounded-2xl';
    case 'full':
      return 'rounded-full';
    default:
      return 'rounded-xl';
  }
}

export function footerCtaButtonPaddingClass(padding: PortfolioFooterCtaButtonPadding): string {
  switch (padding) {
    case 'sm':
      return 'px-4 py-2 text-xs';
    case 'lg':
      return 'px-8 py-3.5 text-sm';
    default:
      return 'px-6 py-3 text-sm';
  }
}

export function footerCtaButtonClass(
  border: PortfolioFooterCtaButtonBorder,
  radius: PortfolioFooterCtaButtonRadius,
  padding: PortfolioFooterCtaButtonPadding
): string {
  const borderClass =
    border === 'soft' ? 'border' : border === 'solid' ? 'border-[1.5px]' : 'border border-transparent';
  return `inline-flex shrink-0 items-center justify-center font-bold transition ${borderClass} ${footerCtaButtonRadiusClass(radius)} ${footerCtaButtonPaddingClass(padding)}`;
}

export function footerCtaButtonStyle(
  backgroundColor: string,
  textColor: string,
  border: PortfolioFooterCtaButtonBorder,
  borderColor: string
): CSSProperties {
  const style: CSSProperties = {
    backgroundColor: sanitizeHex(backgroundColor, DEFAULT_FOOTER_CTA_BUTTON_BG),
    color: sanitizeHex(textColor, DEFAULT_FOOTER_CTA_BUTTON_TEXT),
  };
  if (border !== 'none') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(borderColor, DEFAULT_FOOTER_CTA_BUTTON_BORDER);
  }
  return style;
}

export function footerPresetCtaClass(design: PortfolioFooterCtaDesign = 'pill-outline'): string {
  /** Shared size so Contact me + Marketplace match exactly. */
  const base =
    'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition hover:opacity-90';
  switch (design) {
    case 'pill-dark':
    case 'pill-accent':
      return base;
    case 'pill-outline':
      return `${base} border-2 bg-transparent`;
    default:
      return 'inline-flex h-11 shrink-0 items-center justify-center gap-2 text-sm font-semibold transition hover:opacity-80';
  }
}

/** Keep CTA ink readable on the current footer background (dark vs light). */
export function footerReadableOnBackground(hex: string, lightBackground: boolean): string {
  const sample = sanitizeHex(hex, lightBackground ? DEFAULT_FOOTER_PRIMARY_ON_LIGHT : DEFAULT_FOOTER_PRIMARY_COLOR);
  const lum = footerColorLuminance(sample);
  if (lightBackground) {
    return lum > 0.72 ? DEFAULT_FOOTER_PRIMARY_ON_LIGHT : sample;
  }
  return lum < 0.38 ? DEFAULT_FOOTER_PRIMARY_COLOR : sample;
}

export function footerPresetCtaStyle(
  design: PortfolioFooterCtaDesign,
  colors: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    accentColor: string;
  },
  options?: { lightBackground?: boolean }
): CSSProperties {
  const lightBackground = options?.lightBackground ?? false;
  const accent = sanitizeHex(colors.accentColor, DEFAULT_FOOTER_ACCENT_COLOR);
  let bg = sanitizeHex(colors.backgroundColor, DEFAULT_FOOTER_CTA_BUTTON_BG);
  let text = sanitizeHex(colors.textColor, DEFAULT_FOOTER_CTA_BUTTON_TEXT);
  let border = sanitizeHex(colors.borderColor, DEFAULT_FOOTER_CTA_BUTTON_BORDER);

  switch (design) {
    case 'pill-dark': {
      // Dark pill on dark footer → flip to light capsule so the control stays visible.
      if (!lightBackground && footerColorLuminance(bg) < 0.22) {
        bg = '#fafafa';
        if (footerColorLuminance(text) > 0.65) text = '#0a0a0a';
      }
      return { backgroundColor: bg, color: text, borderColor: 'transparent' };
    }
    case 'pill-accent':
      return {
        backgroundColor: accent,
        color: footerReadableOnBackground(text, footerColorLuminance(accent) > 0.55),
        borderColor: 'transparent',
      };
    case 'pill-outline': {
      const ink = footerReadableOnBackground(border, lightBackground);
      return {
        backgroundColor: 'transparent',
        color: ink,
        borderColor: ink,
        borderStyle: 'solid',
      };
    }
    default:
      return {
        color: footerReadableOnBackground(accent, lightBackground),
        backgroundColor: 'transparent',
      };
  }
}

export function footerContactCtaStyle(
  presentation: Pick<
    PortfolioFooterPresentationSettings,
    | 'ctaDesign'
    | 'ctaButtonBackgroundColor'
    | 'ctaButtonTextColor'
    | 'ctaButtonBorderColor'
    | 'accentColor'
  >,
  options?: { lightBackground?: boolean }
): CSSProperties {
  const design = presentation.ctaDesign ?? 'pill-outline';
  const lightBackground = options?.lightBackground ?? false;
  const fallbackInk = lightBackground ? DEFAULT_FOOTER_PRIMARY_ON_LIGHT : DEFAULT_FOOTER_PRIMARY_COLOR;
  return footerPresetCtaStyle(
    design,
    {
      backgroundColor: presentation.ctaButtonBackgroundColor || DEFAULT_FOOTER_CTA_BUTTON_BG,
      textColor: presentation.ctaButtonTextColor || fallbackInk,
      borderColor:
        presentation.ctaButtonBorderColor ||
        presentation.ctaButtonTextColor ||
        presentation.accentColor ||
        fallbackInk,
      accentColor: presentation.accentColor || DEFAULT_FOOTER_ACCENT_COLOR,
    },
    { lightBackground }
  );
}

export function resolveFooterMarketplaceCtaHref(href: string | undefined, creatorId: string): string {
  const raw = typeof href === 'string' ? href.trim() : '';
  if (!raw) return `/marketplace/${creatorId}`;
  return resolveFooterLinkHref(raw, creatorId);
}

export function footerMarketplaceCtaClass(
  design: PortfolioFooterCtaDesign = 'pill-outline'
): string {
  return footerPresetCtaClass(design);
}

export function footerMarketplaceCtaStyle(
  presentation: Pick<
    PortfolioFooterPresentationSettings,
    | 'marketplaceCtaDesign'
    | 'marketplaceCtaBackgroundColor'
    | 'marketplaceCtaTextColor'
    | 'marketplaceCtaBorderColor'
    | 'accentColor'
  >,
  options?: { lightBackground?: boolean }
): CSSProperties {
  const design = presentation.marketplaceCtaDesign ?? 'pill-outline';
  const lightBackground = options?.lightBackground ?? false;
  const fallbackBorder = lightBackground
    ? DEFAULT_FOOTER_MARKETPLACE_CTA_BORDER
    : DEFAULT_FOOTER_PRIMARY_COLOR;
  return footerPresetCtaStyle(
    design,
    {
      backgroundColor: presentation.marketplaceCtaBackgroundColor || DEFAULT_FOOTER_MARKETPLACE_CTA_BG,
      textColor: presentation.marketplaceCtaTextColor || DEFAULT_FOOTER_MARKETPLACE_CTA_TEXT,
      borderColor: presentation.marketplaceCtaBorderColor || fallbackBorder,
      accentColor: presentation.accentColor || DEFAULT_FOOTER_ACCENT_COLOR,
    },
    { lightBackground }
  );
}

export function footerIconStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FOOTER_ICON_COLOR) };
}

export function footerAccentStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_FOOTER_ACCENT_COLOR) };
}

export function footerDividerClass(lightBackground: boolean): string {
  return lightBackground ? 'border-neutral-200/90' : 'border-white/10';
}

export function footerContentDividerColor(
  settings: Pick<
    PortfolioFooterPresentationSettings,
    'contentDividerColor' | 'contentDividerOpacity'
  >,
  lightBackground: boolean
): string {
  const opacity = Math.min(100, Math.max(0, settings.contentDividerOpacity ?? 40)) / 100;
  const custom = settings.contentDividerColor?.trim();
  if (custom && isValidProfileHexColor(custom)) {
    const hex = custom.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }
  return lightBackground
    ? `rgba(0,0,0,${Math.min(0.22, opacity * 0.55)})`
    : `rgba(255,255,255,${Math.min(0.28, opacity * 0.7)})`;
}

export function footerContentDividerStyle(
  settings: Pick<
    PortfolioFooterPresentationSettings,
    'contentDividerColor' | 'contentDividerOpacity'
  >,
  lightBackground: boolean
): CSSProperties {
  return { backgroundColor: footerContentDividerColor(settings, lightBackground) };
}

function svgDataUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function buildFooterPatternSvg(pattern: Exclude<PortfolioFooterPattern, 'none'>, color: string): string {
  switch (pattern) {
    case 'grid':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M32 0H0V32" fill="none" stroke="${color}" stroke-width="1"/></svg>`;
    case 'diagonal':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M-2 14L14 -2M2 18L18 2M6 22L22 6" fill="none" stroke="${color}" stroke-width="1.2"/></svg>`;
    case 'crosshatch':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M0 20L20 0M-2 2L2 -2M18 22L22 18" fill="none" stroke="${color}" stroke-width="1"/></svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="4" cy="4" r="2.5" fill="${color}"/></svg>`;
  }
}

export function footerPatternStyle(
  settings: Pick<PortfolioFooterPresentationSettings, 'pattern' | 'patternColor' | 'patternOpacity'>
): CSSProperties | undefined {
  if (settings.pattern === 'none') return undefined;
  const color = sanitizeHex(settings.patternColor, DEFAULT_FOOTER_PATTERN_COLOR);
  const opacity = Math.min(100, Math.max(0, settings.patternOpacity)) / 100;
  const size =
    settings.pattern === 'grid'
      ? '32px 32px'
      : settings.pattern === 'diagonal' || settings.pattern === 'crosshatch'
        ? '20px 20px'
        : '24px 24px';
  return {
    backgroundImage: svgDataUrl(buildFooterPatternSvg(settings.pattern, color)),
    backgroundSize: size,
    backgroundRepeat: 'repeat',
    opacity,
  };
}

export function resolveFooterDescription(options: {
  source: PortfolioFooterDescriptionSource;
  custom: string;
  bio?: string | null;
  maxLength?: number;
}): string | null {
  const max = options.maxLength ?? 220;
  const raw =
    options.source === 'custom'
      ? options.custom.trim()
      : (options.bio ?? '').trim();
  if (!raw) return null;
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1).trimEnd()}…`;
}

export function resolveFooterCtaSubtitle(options: {
  custom: string;
  isAvailable?: boolean | null;
  responseTimeLabel?: string | null;
  hoursLabel?: string | null;
}): string {
  if (options.custom.trim()) {
    const custom = options.custom.trim();
    if (LEGACY_FR_CTA_SUBTITLES.has(custom)) return DEFAULT_FOOTER_CTA_SUBTITLE;
    return custom;
  }
  const parts: string[] = [];
  if (options.isAvailable !== false) {
    parts.push('Available this week');
  } else {
    parts.push('Currently unavailable');
  }
  if (options.responseTimeLabel?.trim()) {
    parts.push(`response ${options.responseTimeLabel.trim().toLowerCase()}`);
  } else if (options.hoursLabel?.trim()) {
    parts.push(options.hoursLabel.trim());
  } else {
    parts.push('response within 24h');
  }
  return parts.join(' · ');
}

function migrateFooterCtaCopy(value: unknown, legacy: Set<string>, fallback: string): string {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const trimmed = value.trim();
  if (legacy.has(trimmed)) return fallback;
  return trimmed;
}

export function pickFooterPresentationSettings(footer: unknown): PortfolioFooterPresentationSettings {
  return mergeFooterPresentation(DEFAULT_FOOTER_PRESENTATION, footer);
}

export function mergeFooterPresentation(
  base: PortfolioFooterPresentationSettings,
  patch: unknown
): PortfolioFooterPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const background = mergeSectionBackground(base, patch);

  // Old saves had no design + background off — migrate once to the dark mockup look.
  const needsDarkMigration =
    typeof record.design !== 'string' &&
    (typeof record.sectionBackgroundEnabled !== 'boolean' ||
      record.sectionBackgroundEnabled === false);

  const mergedBackground = {
    ...background,
    ...(needsDarkMigration
      ? {
          sectionBackgroundEnabled: true,
          sectionBackgroundFill: 'solid' as const,
          sectionBackgroundColor: DEFAULT_FOOTER_BACKGROUND_COLOR,
          sectionBackgroundOpacity: 100,
        }
      : {}),
  };

  const hasExplicitPrimary =
    typeof record.primaryColor === 'string' && isValidProfileHexColor(record.primaryColor);
  const rawPrimary = hasExplicitPrimary
    ? sanitizeHex(record.primaryColor, base.primaryColor)
    : footerContrastingPrimary(mergedBackground);
  const primaryColor = resolveFooterPrimaryColor({
    ...mergedBackground,
    primaryColor: rawPrimary,
  });

  const hasExplicitIcon =
    typeof record.iconColor === 'string' && isValidProfileHexColor(record.iconColor);
  const iconColor = hasExplicitIcon
    ? sanitizeHex(record.iconColor, base.iconColor)
    : isFooterBackgroundLight(mergedBackground)
      ? '#525252'
      : DEFAULT_FOOTER_ICON_COLOR;

  const hasExplicitMuted =
    typeof record.textColor === 'string' && isValidProfileHexColor(record.textColor);
  const textColor = hasExplicitMuted
    ? sanitizeHex(record.textColor, base.textColor)
    : isFooterBackgroundLight(mergedBackground)
      ? '#737373'
      : DEFAULT_FOOTER_TEXT_COLOR;

  const ctaTitleColor = sanitizeHex(record.ctaTitleColor, base.ctaTitleColor);
  const ctaSubtitleColor = sanitizeHex(record.ctaSubtitleColor, base.ctaSubtitleColor);
  const ctaButtonTextColor = sanitizeHex(record.ctaButtonTextColor, base.ctaButtonTextColor);
  const accentColor = sanitizeHex(record.accentColor, base.accentColor);

  const typographyContext = {
    primaryColor,
    textColor,
    ctaTitleColor,
    ctaSubtitleColor,
    ctaButtonTextColor,
    accentColor,
  };

  const hasElementStylesPatch = record.elementStyles !== undefined;
  const hasLegacyTypographyPatch =
    'primaryColor' in record ||
    'textColor' in record ||
    'ctaTitleColor' in record ||
    'ctaSubtitleColor' in record ||
    'ctaButtonTextColor' in record ||
    'accentColor' in record;

  let elementStyles = normalizeFooterElementStyles(
    hasElementStylesPatch ? record.elementStyles : base.elementStyles,
    typographyContext
  );

  if (hasLegacyTypographyPatch && !hasElementStylesPatch) {
    elementStyles = syncFooterElementStylesFromLegacyPatch(elementStyles, patch, {
      ...base,
      ...mergedBackground,
      ...typographyContext,
      elementStyles,
    });
  }

  const typographyLegacySync: Partial<
    Pick<
      PortfolioFooterPresentationSettings,
      'primaryColor' | 'textColor' | 'ctaTitleColor' | 'ctaSubtitleColor' | 'ctaButtonTextColor'
    >
  > = hasElementStylesPatch ? syncFooterLegacyTypographyFromElementStyles(elementStyles) : {};

  const resolvedPrimaryColor = typographyLegacySync.primaryColor ?? primaryColor;
  const resolvedTextColor = typographyLegacySync.textColor ?? textColor;
  const resolvedCtaTitleColor = typographyLegacySync.ctaTitleColor ?? ctaTitleColor;
  const resolvedCtaSubtitleColor = typographyLegacySync.ctaSubtitleColor ?? ctaSubtitleColor;
  const resolvedCtaButtonTextColor = typographyLegacySync.ctaButtonTextColor ?? ctaButtonTextColor;

  return {
    ...mergedBackground,
    design: pick(
      record.design,
      [
        'minimal',
        'compact',
        'landing',
        'centered-minimal',
        'contact-card',
        'monumental',
        'hero-columns',
        'split-form',
        'timezone-editorial',
        'inverted-wordmark',
        'services-reveal',
        'editorial-grid',
        'headline-reveal',
      ],
      base.design
    ),
    alignment: pick(record.alignment, ['split', 'center', 'left'], base.alignment),
    padding: pick(
      record.padding,
      ['compact', 'standard', 'comfortable', 'spacious', 'custom'],
      base.padding ?? 'standard'
    ),
    paddingTopPx: clampFooterPaddingPx(
      record.paddingTopPx,
      base.paddingTopPx ?? FOOTER_PADDING_PRESET_PX.standard.top
    ),
    paddingBottomPx: clampFooterPaddingPx(
      record.paddingBottomPx,
      base.paddingBottomPx ?? FOOTER_PADDING_PRESET_PX.standard.bottom
    ),
    paddingLeftPx: clampFooterPaddingPx(
      record.paddingLeftPx,
      base.paddingLeftPx ?? FOOTER_PADDING_PRESET_PX.standard.left
    ),
    paddingRightPx: clampFooterPaddingPx(
      record.paddingRightPx,
      base.paddingRightPx ?? FOOTER_PADDING_PRESET_PX.standard.right
    ),
    marginTop: pick(
      record.marginTop,
      ['none', 'compact', 'standard', 'comfortable', 'spacious', 'custom'],
      base.marginTop ?? 'none'
    ),
    marginTopPx: clampFooterMarginTopPx(
      record.marginTopPx,
      record.marginTop === 'compact'
        ? FOOTER_MARGIN_TOP_PRESET_PX.compact
        : record.marginTop === 'standard'
          ? FOOTER_MARGIN_TOP_PRESET_PX.standard
          : record.marginTop === 'comfortable'
            ? FOOTER_MARGIN_TOP_PRESET_PX.comfortable
            : record.marginTop === 'spacious'
              ? FOOTER_MARGIN_TOP_PRESET_PX.spacious
              : base.marginTopPx ?? 0
    ),
    landingBrandGapPx: clampFooterLandingBrandGapPx(
      record.landingBrandGapPx === 16 ? DEFAULT_FOOTER_LANDING_BRAND_GAP_PX : record.landingBrandGapPx,
      base.landingBrandGapPx ?? DEFAULT_FOOTER_LANDING_BRAND_GAP_PX
    ),
    columnHeadingGapPx: clampFooterColumnHeadingGapPx(
      record.columnHeadingGapPx,
      base.columnHeadingGapPx ?? DEFAULT_FOOTER_COLUMN_HEADING_GAP_PX
    ),
    showBrand: typeof record.showBrand === 'boolean' ? record.showBrand : base.showBrand,
    showAvatar: typeof record.showAvatar === 'boolean' ? record.showAvatar : base.showAvatar,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    descriptionSource: pick(record.descriptionSource, ['bio', 'custom'], base.descriptionSource),
    descriptionCustom:
      typeof record.descriptionCustom === 'string' ? record.descriptionCustom : base.descriptionCustom,
    centeredIdentity: pick(
      record.centeredIdentity,
      ['avatar', 'name', 'custom'],
      base.centeredIdentity ?? 'name'
    ),
    centeredCustomText:
      typeof record.centeredCustomText === 'string'
        ? record.centeredCustomText.trim()
        : base.centeredCustomText ?? 'Logo',
    centeredCustomLogoUrl:
      typeof record.centeredCustomLogoUrl === 'string'
        ? record.centeredCustomLogoUrl.trim()
        : base.centeredCustomLogoUrl ?? '',
    centeredLinks: normalizeFooterCenteredLinks(
      record.centeredLinks,
      base.centeredLinks ?? DEFAULT_FOOTER_CENTERED_LINKS
    ),
    linkColumns: normalizeFooterLinkColumns(record.linkColumns, base.linkColumns ?? DEFAULT_FOOTER_LINK_COLUMNS),
    showEmail: typeof record.showEmail === 'boolean' ? record.showEmail : base.showEmail,
    showPhone: typeof record.showPhone === 'boolean' ? record.showPhone : base.showPhone,
    showLocation: typeof record.showLocation === 'boolean' ? record.showLocation : base.showLocation,
    showHours: typeof record.showHours === 'boolean' ? record.showHours : base.showHours,
    showContactIcons:
      typeof record.showContactIcons === 'boolean' ? record.showContactIcons : base.showContactIcons ?? true,
    contactIconSize: pick(record.contactIconSize, ['sm', 'md', 'lg'], base.contactIconSize ?? 'md'),
    showCtaIcon: typeof record.showCtaIcon === 'boolean' ? record.showCtaIcon : base.showCtaIcon ?? true,
    showCopyright: typeof record.showCopyright === 'boolean' ? record.showCopyright : base.showCopyright,
    copyrightLabel:
      typeof record.copyrightLabel === 'string'
        ? record.copyrightLabel
        : base.copyrightLabel ?? DEFAULT_FOOTER_COPYRIGHT_LABEL,
    showMarketplaceLink:
      typeof record.showMarketplaceLink === 'boolean' ? record.showMarketplaceLink : base.showMarketplaceLink,
    marketplaceCtaLabel:
      typeof record.marketplaceCtaLabel === 'string' && record.marketplaceCtaLabel.trim()
        ? record.marketplaceCtaLabel.trim()
        : base.marketplaceCtaLabel ?? DEFAULT_FOOTER_MARKETPLACE_CTA_LABEL,
    marketplaceCtaHref:
      typeof record.marketplaceCtaHref === 'string'
        ? record.marketplaceCtaHref.trim()
        : base.marketplaceCtaHref ?? '',
    marketplaceCtaDesign: pick(
      record.marketplaceCtaDesign,
      ['pill-dark', 'pill-outline', 'pill-accent', 'text-arrow'],
      base.marketplaceCtaDesign ?? 'pill-outline'
    ),
    marketplaceCtaBackgroundColor: sanitizeHex(
      record.marketplaceCtaBackgroundColor,
      base.marketplaceCtaBackgroundColor ?? DEFAULT_FOOTER_MARKETPLACE_CTA_BG
    ),
    marketplaceCtaTextColor: sanitizeHex(
      record.marketplaceCtaTextColor,
      base.marketplaceCtaTextColor ?? DEFAULT_FOOTER_MARKETPLACE_CTA_TEXT
    ),
    marketplaceCtaBorderColor: sanitizeHex(
      record.marketplaceCtaBorderColor,
      base.marketplaceCtaBorderColor ?? DEFAULT_FOOTER_MARKETPLACE_CTA_BORDER
    ),
    marketplaceCtaShowArrow:
      typeof record.marketplaceCtaShowArrow === 'boolean'
        ? record.marketplaceCtaShowArrow
        : base.marketplaceCtaShowArrow ?? true,
    showLandingMarketplaceLink:
      typeof record.showLandingMarketplaceLink === 'boolean'
        ? record.showLandingMarketplaceLink
        : (base.showLandingMarketplaceLink ?? false),
    showMarketplaceColumnLink:
      typeof record.showMarketplaceColumnLink === 'boolean'
        ? record.showMarketplaceColumnLink
        : (base.showMarketplaceColumnLink ?? false),
    showNopbProfileLink:
      typeof record.showNopbProfileLink === 'boolean'
        ? record.showNopbProfileLink
        : (base.showNopbProfileLink ?? false),
    showProfileVisits: false,
    showContactLinks:
      typeof record.showContactLinks === 'boolean' ? record.showContactLinks : base.showContactLinks,
    showDesignCredit:
      typeof record.showDesignCredit === 'boolean' ? record.showDesignCredit : base.showDesignCredit,
    showTopBorder: typeof record.showTopBorder === 'boolean' ? record.showTopBorder : base.showTopBorder,
    showContentDivider:
      typeof record.showContentDivider === 'boolean'
        ? record.showContentDivider
        : (base.showContentDivider ?? true),
    contentDividerColor:
      typeof record.contentDividerColor === 'string'
        ? record.contentDividerColor
        : (base.contentDividerColor ?? ''),
    contentDividerOpacity: (() => {
      const n =
        typeof record.contentDividerOpacity === 'number'
          ? record.contentDividerOpacity
          : Number(record.contentDividerOpacity);
      if (Number.isFinite(n)) return Math.round(Math.min(100, Math.max(0, n)));
      return base.contentDividerOpacity ?? 40;
    })(),
    showMiniBar:
      typeof record.showMiniBar === 'boolean' ? record.showMiniBar : (base.showMiniBar ?? false),
    miniBarDesign: pick(record.miniBarDesign, FOOTER_MINI_BAR_DESIGNS, base.miniBarDesign ?? 'minimal'),
    showContactCta:
      typeof record.showContactCta === 'boolean' ? record.showContactCta : base.showContactCta,
    ctaTitle: migrateFooterCtaCopy(record.ctaTitle, LEGACY_FR_CTA_TITLES, base.ctaTitle),
    ctaSubtitle:
      typeof record.ctaSubtitle === 'string'
        ? migrateFooterCtaCopy(record.ctaSubtitle, LEGACY_FR_CTA_SUBTITLES, '')
        : base.ctaSubtitle,
    ctaButtonLabel: migrateFooterCtaCopy(
      record.ctaButtonLabel,
      LEGACY_FR_CTA_BUTTONS,
      base.ctaButtonLabel
    ),
    ctaDesign: pick(
      record.ctaDesign,
      ['pill-dark', 'pill-outline', 'pill-accent', 'text-arrow'],
      base.ctaDesign ?? 'pill-outline'
    ),
    ctaTitleColor: resolvedCtaTitleColor,
    ctaSubtitleColor: resolvedCtaSubtitleColor,
    ctaButtonBackgroundColor: sanitizeHex(
      record.ctaButtonBackgroundColor,
      base.ctaButtonBackgroundColor
    ),
    ctaButtonTextColor: resolvedCtaButtonTextColor,
    ctaButtonBorder: pick(record.ctaButtonBorder, ['none', 'soft', 'solid'], base.ctaButtonBorder),
    ctaButtonBorderColor: sanitizeHex(record.ctaButtonBorderColor, base.ctaButtonBorderColor),
    ctaButtonRadius: pick(
      record.ctaButtonRadius,
      ['none', 'sm', 'md', 'lg', 'full'],
      base.ctaButtonRadius
    ),
    ctaButtonPadding: pick(record.ctaButtonPadding, ['sm', 'md', 'lg'], base.ctaButtonPadding),
    ctaButtonsAlign: pick(record.ctaButtonsAlign, ['left', 'center', 'right'], base.ctaButtonsAlign ?? 'center'),
    textColor: resolvedTextColor,
    primaryColor: resolvedPrimaryColor,
    iconColor,
    accentColor,
    pattern: pick(record.pattern, ['none', 'dots', 'grid', 'diagonal', 'crosshatch'], base.pattern),
    patternColor: sanitizeHex(record.patternColor, base.patternColor),
    patternOpacity:
      typeof record.patternOpacity === 'number' && Number.isFinite(record.patternOpacity)
        ? Math.min(100, Math.max(0, record.patternOpacity))
        : base.patternOpacity,
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    colorModeOverride: mergeSectionColorMode(record.colorModeOverride, base.colorModeOverride),
    premiumFontSize: pick(record.premiumFontSize, FOOTER_PREMIUM_FONT_SIZES, base.premiumFontSize ?? 'medium'),
    lockPaletteAcrossColorModes:
      typeof record.lockPaletteAcrossColorModes === 'boolean'
        ? record.lockPaletteAcrossColorModes
        : base.lockPaletteAcrossColorModes ?? false,
    footerPalette: mergeFooterPalette(DEFAULT_FOOTER_PALETTE, record.footerPalette ?? base.footerPalette),
    footerColorBindings: mergeFooterColorBindings(
      DEFAULT_FOOTER_COLOR_BINDINGS,
      record.footerColorBindings ?? base.footerColorBindings
    ),
    elementStyles,
    monumentalHeadline:
      typeof record.monumentalHeadline === 'string'
        ? record.monumentalHeadline
        : base.monumentalHeadline ?? DEFAULT_FOOTER_MONUMENTAL_HEADLINE,
    heroColumnsManifesto:
      typeof record.heroColumnsManifesto === 'string'
        ? record.heroColumnsManifesto
        : base.heroColumnsManifesto ?? DEFAULT_FOOTER_HERO_COLUMNS_MANIFESTO,
    splitFormHeadline:
      typeof record.splitFormHeadline === 'string'
        ? record.splitFormHeadline
        : base.splitFormHeadline ?? DEFAULT_FOOTER_SPLIT_FORM_HEADLINE,
    splitFormDescription:
      typeof record.splitFormDescription === 'string'
        ? record.splitFormDescription
        : base.splitFormDescription ?? DEFAULT_FOOTER_SPLIT_FORM_DESCRIPTION,
    splitFormQuote:
      typeof record.splitFormQuote === 'string'
        ? record.splitFormQuote
        : base.splitFormQuote ?? DEFAULT_FOOTER_SPLIT_FORM_QUOTE,
    invertedWordmarkCredit:
      typeof record.invertedWordmarkCredit === 'string'
        ? record.invertedWordmarkCredit
        : base.invertedWordmarkCredit ?? DEFAULT_FOOTER_INVERTED_WORDMARK_CREDIT,
    editorialGridTagline:
      typeof record.editorialGridTagline === 'string'
        ? record.editorialGridTagline
        : base.editorialGridTagline ?? DEFAULT_FOOTER_EDITORIAL_GRID_TAGLINE,
    contactCardColorToken: pick(
      record.contactCardColorToken,
      FOOTER_CONTACT_CARD_COLOR_TOKENS,
      base.contactCardColorToken ?? 'principal'
    ),
    designLayouts: normalizeFooterDesignLayouts(
      record.designLayouts !== undefined ? record.designLayouts : base.designLayouts
    ),
    photoUrl:
      typeof record.photoUrl === 'string' ? record.photoUrl.trim().slice(0, 2048) : (base.photoUrl ?? ''),
    headerDesign: pick(record.headerDesign, FOOTER_HEADER_DESIGNS, base.headerDesign ?? 'editorial'),
    headerDesignAlignment: pick(
      record.headerDesignAlignment,
      ['left', 'center', 'right'],
      base.headerDesignAlignment ?? 'left'
    ),
    headerMarginBottom: pick(
      record.headerMarginBottom,
      FOOTER_HEADER_MARGIN_BOTTOM_STEPS,
      base.headerMarginBottom ?? 'md'
    ),
    headerTitleSize: pick(record.headerTitleSize, FOOTER_HEADER_TITLE_SIZES, base.headerTitleSize ?? 'xl'),
    headerTitleWeight: pick(
      record.headerTitleWeight,
      FOOTER_HEADER_TITLE_WEIGHTS,
      base.headerTitleWeight ?? 'bold'
    ),
    headerBackgroundUnified:
      typeof record.headerBackgroundUnified === 'boolean'
        ? record.headerBackgroundUnified
        : (base.headerBackgroundUnified ?? false),
    headerPaddingTop: pick(record.headerPaddingTop, FOOTER_HEADER_PADDING_STEPS, base.headerPaddingTop ?? 'none'),
    headerPaddingBottom: pick(
      record.headerPaddingBottom,
      FOOTER_HEADER_PADDING_STEPS,
      base.headerPaddingBottom ?? 'none'
    ),
    headerEditorialTitleText:
      typeof record.headerEditorialTitleText === 'string'
        ? record.headerEditorialTitleText
        : (base.headerEditorialTitleText ?? ''),
    headerEditorialSubtitleText:
      typeof record.headerEditorialSubtitleText === 'string'
        ? record.headerEditorialSubtitleText
        : (base.headerEditorialSubtitleText ?? ''),
    headerEditorialTitleColor: pick(
      record.headerEditorialTitleColor,
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerEditorialTitleColor ?? 'texteFort'
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
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadLabelColor ?? 'texteFort'
    ),
    headerSerifLeadTitleColor: pick(
      record.headerSerifLeadTitleColor,
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadTitleColor ?? 'texteFort'
    ),
    headerSerifLeadSubtitleColor: pick(
      record.headerSerifLeadSubtitleColor,
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadSubtitleColor ?? 'texteFort'
    ),
    headerSerifLeadLabelSize: pick(
      record.headerSerifLeadLabelSize,
      FOOTER_HEADER_TITLE_SIZES,
      base.headerSerifLeadLabelSize ?? 'md'
    ),
    headerSerifLeadTitleSize: pick(
      record.headerSerifLeadTitleSize,
      FOOTER_HEADER_TITLE_SIZES,
      base.headerSerifLeadTitleSize ?? 'md'
    ),
    headerSerifLeadSubtitleSize: pick(
      record.headerSerifLeadSubtitleSize,
      FOOTER_HEADER_TITLE_SIZES,
      base.headerSerifLeadSubtitleSize ?? 'md'
    ),
    headerSerifLeadLabelWeight: pick(
      record.headerSerifLeadLabelWeight,
      FOOTER_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadLabelWeight ?? 'regular'
    ),
    headerSerifLeadTitleWeight: pick(
      record.headerSerifLeadTitleWeight,
      FOOTER_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadTitleWeight ?? 'regular'
    ),
    headerSerifLeadSubtitleWeight: pick(
      record.headerSerifLeadSubtitleWeight,
      FOOTER_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadSubtitleWeight ?? 'regular'
    ),
    headerBillboardBigWord:
      typeof record.headerBillboardBigWord === 'string'
        ? record.headerBillboardBigWord
        : (base.headerBillboardBigWord ?? ''),
    headerBillboardWordStyle: pick(
      record.headerBillboardWordStyle,
      FOOTER_HEADER_BILLBOARD_WORD_STYLES,
      base.headerBillboardWordStyle ?? 'outline'
    ),
    headerBillboardWordColor: pick(
      record.headerBillboardWordColor,
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerBillboardWordColor ?? 'principal'
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
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerMastheadHeadlineColor ?? 'principal'
    ),
    headerMastheadHeadlineSize: pick(
      record.headerMastheadHeadlineSize,
      FOOTER_HEADER_TITLE_SIZES,
      base.headerMastheadHeadlineSize ?? 'md'
    ),
    headerMastheadHeadlineWeight: pick(
      record.headerMastheadHeadlineWeight,
      FOOTER_HEADER_TITLE_WEIGHTS,
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
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerIndexLabelColor ?? 'texteFort'
    ),
    headerIndexNumberColor: pick(
      record.headerIndexNumberColor,
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerIndexNumberColor ?? 'principal'
    ),
    headerIndexTitleColor: pick(
      record.headerIndexTitleColor,
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerIndexTitleColor ?? 'texteFort'
    ),
    headerIndexSubtitleColor: pick(
      record.headerIndexSubtitleColor,
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerIndexSubtitleColor ?? 'texteFort'
    ),
    headerIndexLabelSize: pick(
      record.headerIndexLabelSize,
      FOOTER_HEADER_TITLE_SIZES,
      base.headerIndexLabelSize ?? 'md'
    ),
    headerIndexLabelWeight: pick(
      record.headerIndexLabelWeight,
      FOOTER_HEADER_TITLE_WEIGHTS,
      base.headerIndexLabelWeight ?? 'regular'
    ),
    headerIndexTitleSize: pick(
      record.headerIndexTitleSize,
      FOOTER_HEADER_TITLE_SIZES,
      base.headerIndexTitleSize ?? 'md'
    ),
    headerIndexTitleWeight: pick(
      record.headerIndexTitleWeight,
      FOOTER_HEADER_TITLE_WEIGHTS,
      base.headerIndexTitleWeight ?? 'regular'
    ),
    headerIndexSubtitleSize: pick(
      record.headerIndexSubtitleSize,
      FOOTER_HEADER_TITLE_SIZES,
      base.headerIndexSubtitleSize ?? 'md'
    ),
    headerIndexSubtitleWeight: pick(
      record.headerIndexSubtitleWeight,
      FOOTER_HEADER_TITLE_WEIGHTS,
      base.headerIndexSubtitleWeight ?? 'regular'
    ),
    headerHeroTitleText:
      typeof record.headerHeroTitleText === 'string'
        ? record.headerHeroTitleText
        : (base.headerHeroTitleText ?? ''),
    headerHeroCtaLabel:
      typeof record.headerHeroCtaLabel === 'string'
        ? record.headerHeroCtaLabel
        : (base.headerHeroCtaLabel ?? ''),
    headerHeroTitleColor: pick(
      record.headerHeroTitleColor,
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerHeroTitleColor ?? 'texteFort'
    ),
    headerNameColor: pick(
      record.headerNameColor,
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerNameColor ?? 'texteFort'
    ),
    headerTimezoneKickerText:
      typeof record.headerTimezoneKickerText === 'string'
        ? record.headerTimezoneKickerText
        : (base.headerTimezoneKickerText ?? ''),
    headerTimezoneTitleText:
      typeof record.headerTimezoneTitleText === 'string'
        ? record.headerTimezoneTitleText
        : (base.headerTimezoneTitleText ?? ''),
    headerTimezoneDescriptionText:
      typeof record.headerTimezoneDescriptionText === 'string'
        ? record.headerTimezoneDescriptionText
        : (base.headerTimezoneDescriptionText ?? ''),
    headerTimezoneTitleColor: pick(
      record.headerTimezoneTitleColor,
      FOOTER_HEADER_PALETTE_TOKENS,
      base.headerTimezoneTitleColor ?? 'texteFort'
    ),
  };
}
