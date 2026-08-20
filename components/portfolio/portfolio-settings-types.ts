import {
  DEFAULT_HERO_PRESENTATION,
  mergeHeroPresentation,
  type PortfolioHeroPresentationSettings,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  DEFAULT_WORK_PRESENTATION,
  mergeWorkPresentation,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_ABOUT_PRESENTATION,
  isIllegibleDarkAboutStatsCard,
  isLegacyDefaultAboutStatsCard,
  mergeAboutPresentation,
  withDefaultAboutStatsCardColors,
  withNoirReadableAboutStatsColors,
  type PortfolioAboutPresentationSettings,
} from '@/components/portfolio/portfolio-about-settings';
import {
  DEFAULT_SERVICES_PRESENTATION,
  mergeServicesPresentation,
  type PortfolioServicesSectionSettings,
} from '@/components/portfolio/portfolio-services-settings';
import {
  DEFAULT_FAQ_PRESENTATION,
  mergeFaqPresentation,
  type PortfolioFaqSectionSettings,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  DEFAULT_EXPERIENCE_PRESENTATION,
  mergeExperiencePresentation,
  migrateExperienceFromLegacyAbout,
  type PortfolioExperienceSectionSettings,
} from '@/components/portfolio/portfolio-experience-settings';
import {
  DEFAULT_CONTACT_PRESENTATION,
  mergeContactPresentation,
  type PortfolioContactSectionSettings,
} from '@/components/portfolio/portfolio-contact-settings';
import {
  DEFAULT_TEAM_PRESENTATION,
  mergeTeamPresentation,
  migrateLegacyTeamCopy,
  type PortfolioTeamSectionSettings,
} from '@/components/portfolio/portfolio-team-settings';
import {
  DEFAULT_ABOUT_US_PRESENTATION,
  mergeAboutUsPresentation,
  type PortfolioAboutUsSectionSettings,
} from '@/components/portfolio/portfolio-about-us-settings';
import {
  DEFAULT_GALLERY_PRESENTATION,
  mergeGalleryPresentation,
  migrateLegacyGalleryCopy,
  type PortfolioGallerySectionSettings,
} from '@/components/portfolio/portfolio-gallery-settings';
import {
  applyActivePortfolioPalette,
  seedGlobalPalettePairFromHero,
} from '@/components/portfolio/portfolio-color-mode';
import {
  DEFAULT_FOOTER_PRESENTATION,
  mergeFooterPresentation,
  type PortfolioFooterSectionSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import {
  DEFAULT_PORTFOLIO_THEME_ID,
  type PortfolioThemeId,
} from '@/components/portfolio/portfolio-themes';
import {
  mergeCustomThemes,
  resolvePortfolioThemeId,
  type PortfolioCustomTheme,
} from '@/components/portfolio/portfolio-custom-themes';
import {
  DEFAULT_GLOBAL_SETTINGS,
  mergeGlobalSettings,
  type PortfolioGlobalSettings,
} from '@/components/portfolio/portfolio-global-settings';
import {
  DEFAULT_PORTFOLIO_NAV_ITEM_ICONS,
  DEFAULT_PORTFOLIO_NAV_ITEM_LABELS,
  mergeNavItemIcons,
  mergeNavItemLabels,
  type PortfolioNavItemIcons,
  type PortfolioNavItemLabels,
} from '@/components/portfolio/portfolio-nav-items';
import {
  applyNavPaletteToSettings,
  DEFAULT_NAV_COLOR_BINDINGS,
  DEFAULT_NAV_PALETTE,
  mergeNavColorBindings,
  mergeNavPalette,
  type PortfolioNavColorBindings,
  type PortfolioNavPalette,
} from '@/components/portfolio/portfolio-nav-palette-settings';

export type PortfolioSettingsSectionId =
  | 'theme'
  | 'navigation'
  | 'hero'
  | 'work'
  | 'skills'
  | 'services'
  | 'about'
  | 'aboutUs'
  | 'experience'
  | 'team'
  | 'gallery'
  | 'faq'
  | 'contact'
  | 'footer';

export type PortfolioNavPlacement =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-center'
  | 'right-center';

export type PortfolioNavBarDesign = 'classic' | 'rail' | 'dock';

export type PortfolioNavContentMode = 'icons' | 'text' | 'both';

export type PortfolioNavActiveStyle =
  | 'filled-pill'
  | 'accent-fill'
  | 'underline'
  | 'outline'
  | 'soft-badge'
  | 'dot'
  | 'accent-text';

export type PortfolioNavButtonDesign = 'clean' | 'outlined' | 'soft' | 'glow' | 'bottom-line';

export type PortfolioNavDisplayMode = 'always' | 'on-scroll' | 'after-hero';

/**
 * How the bar behaves while it is allowed to show (after displayMode).
 * - full: always opaque
 * - dim: low opacity at rest, full on hover / focus / touch
 * - hover: hidden until hover (tap-to-toggle on touch)
 * - tap: collapsed to a handle until tapped
 */
export type PortfolioNavPresence = 'full' | 'dim' | 'hover' | 'tap';

/** Content of the collapsed Menu handle (reveal on tap / hover). */
export type PortfolioNavMenuHandleContent = 'icon' | 'text' | 'both';

/** Glyph used for the menu handle / close control. */
export type PortfolioNavMenuControlIcon = 'dots-h' | 'dots-v' | 'x' | 'chevron' | 'menu';

/** Where the open/close control sits relative to nav items (or in the mobile drawer top bar). */
export type PortfolioNavMenuControlAlign = 'left' | 'center' | 'right';

export type PortfolioNavLabelCase = 'uppercase' | 'titlecase' | 'normal';

/** How wide the nav background stretches. */
export type PortfolioNavBarWidth = 'hug' | 'full';

/** Padding / height of the nav bar shell and items. */
export type PortfolioNavBarThickness = 'sm' | 'md' | 'lg' | 'xl';

/** Distance from the viewport edge (top/bottom/side depending on placement). */
export type PortfolioNavEdgeOffset = 'sm' | 'md' | 'lg' | 'xl';

/** Spacing between nav items. */
export type PortfolioNavItemGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'spread';

/** Inner padding of the nav bar shell (around items). */
export type PortfolioNavBarPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/** Padding inside each nav button / pill. */
export type PortfolioNavButtonPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/** Intensity for bar glass blur / drop shadow. */
export type PortfolioNavEffectStrength = 'sm' | 'md' | 'lg' | 'xl';

/**
 * How the floating nav adapts below the lg breakpoint so items stay on-screen.
 * Desktop placement / gap / contentMode stay as configured above lg.
 * `drawer` = menu icon opens a sidebar of links (hides the full icon bar).
 */
export type PortfolioNavMobileLayout =
  | 'auto'
  | 'icons-compact'
  | 'scroll'
  | 'wrap'
  | 'drawer'
  | 'off';

/** Optional brand next to the mobile drawer menu icon. */
export type PortfolioNavMobileBrand = 'none' | 'avatar' | 'word';

/** Which edge the mobile nav drawer slides in from. */
export type PortfolioNavMobileDrawerSide = 'left' | 'right';
export type PortfolioNavLinkIconSource =
  | 'mail'
  | 'youtube'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'instagram'
  | 'tiktok'
  | 'other';

/** Where to park Contact + link icons as one cluster in free space. */
export type PortfolioNavExtrasSide = 'auto' | 'left' | 'right';

/**
 * Where the extras cluster (Contact + link icons + custom extra) sits relative to the nav bar.
 * `free-side` keeps the historical detached / free-slot behavior.
 */
export type PortfolioNavExtrasPlacement = 'free-side' | 'before-nav' | 'after-nav';

/** Order of the custom extra relative to Contact + link icons inside the cluster. */
export type PortfolioNavCustomExtraPlacement = 'before' | 'after';

/** What the customizable nav extra shows. */
export type PortfolioNavCustomExtraDisplay = 'logo' | 'text' | 'both';

/** Typography preset for the custom nav extra label. */
export type PortfolioNavCustomExtraFont = 'sans' | 'serif' | 'display';

/** Font weight for the custom nav extra label. */
export type PortfolioNavCustomExtraFontWeight =
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold';

/** How the Contact CTA renders in the extras cluster. */
export type PortfolioNavContactButtonDisplay = 'icon' | 'button';

/** Glyph for the Contact extras CTA — phone variants only. */
export type PortfolioNavContactCtaIcon =
  | 'phone'
  | 'phone-handset'
  | 'smartphone'
  | 'phone-call'
  | 'phone-outgoing'
  | 'phone-incoming';

/** Corner shape of the Contact extras CTA (icon circle or labeled button). */
export type PortfolioNavContactButtonShape = 'square' | 'rounded' | 'soft' | 'pill';

export const PORTFOLIO_NAV_CONTACT_BUTTON_SHAPE_OPTIONS: {
  value: PortfolioNavContactButtonShape;
  label: string;
  description: string;
}[] = [
  { value: 'square', label: 'Square', description: 'Sharp corners.' },
  { value: 'rounded', label: 'Rounded', description: 'Soft square corners.' },
  { value: 'soft', label: 'Soft', description: 'Larger corner radius.' },
  { value: 'pill', label: 'Pill', description: 'Fully rounded ends — circle when icon-only.' },
];

export function normalizePortfolioNavContactButtonShape(
  value: unknown,
  fallback: PortfolioNavContactButtonShape = 'pill'
): PortfolioNavContactButtonShape {
  if (value === 'square' || value === 'rounded' || value === 'soft' || value === 'pill') {
    return value;
  }
  return fallback;
}

export function portfolioNavContactButtonShapeClass(
  shape: PortfolioNavContactButtonShape | undefined
): string {
  switch (normalizePortfolioNavContactButtonShape(shape)) {
    case 'square':
      return 'rounded-none';
    case 'rounded':
      return 'rounded-lg';
    case 'soft':
      return 'rounded-2xl';
    case 'pill':
    default:
      return 'rounded-full';
  }
}

/** Custom extra reuses the same corner-shape tokens as the Contact CTA. */
export type PortfolioNavCustomExtraShape = PortfolioNavContactButtonShape;

export const PORTFOLIO_NAV_EXTRAS_PLACEMENT_OPTIONS: {
  value: PortfolioNavExtrasPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'free-side',
    label: 'Côté libre',
    description: 'Dans l’espace libre (détaché ou dans le créneau gauche/droite) — comportement actuel.',
  },
  {
    value: 'before-nav',
    label: 'Avant la navigation',
    description: 'Juste avant les boutons de section (au-dessus sur rail vertical).',
  },
  {
    value: 'after-nav',
    label: 'Après la navigation',
    description: 'Juste après les boutons de section (en dessous sur rail vertical).',
  },
];

export const PORTFOLIO_NAV_CUSTOM_EXTRA_DISPLAY_OPTIONS: {
  value: PortfolioNavCustomExtraDisplay;
  label: string;
  description: string;
}[] = [
  { value: 'logo', label: 'Logo', description: 'Icône / image seule.' },
  { value: 'text', label: 'Texte', description: 'Libellé seul.' },
  { value: 'both', label: 'Les deux', description: 'Logo et texte côte à côte.' },
];

export const PORTFOLIO_NAV_CUSTOM_EXTRA_FONT_OPTIONS: {
  value: PortfolioNavCustomExtraFont;
  label: string;
  description: string;
  fontFamily: string;
}[] = [
  {
    value: 'sans',
    label: 'Sans',
    description: 'Linéaire, lisible en petit.',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
  {
    value: 'serif',
    label: 'Serif',
    description: 'Empattements élégants.',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  {
    value: 'display',
    label: 'Display',
    description: 'Affiche impactante.',
    fontFamily: "'Bebas Neue', Impact, sans-serif",
  },
];

export const PORTFOLIO_NAV_CUSTOM_EXTRA_FONT_WEIGHT_OPTIONS: {
  value: PortfolioNavCustomExtraFontWeight;
  label: string;
  description: string;
  cssWeight: number;
}[] = [
  { value: 'normal', label: 'Regular', description: 'Poids normal.', cssWeight: 400 },
  { value: 'medium', label: 'Medium', description: 'Légèrement plus fort.', cssWeight: 500 },
  { value: 'semibold', label: 'Semibold', description: 'Accent clair.', cssWeight: 600 },
  { value: 'bold', label: 'Bold', description: 'Plus marqué.', cssWeight: 700 },
];

export function normalizePortfolioNavExtrasPlacement(
  value: unknown,
  fallback: PortfolioNavExtrasPlacement = 'free-side'
): PortfolioNavExtrasPlacement {
  if (value === 'free-side' || value === 'before-nav' || value === 'after-nav') return value;
  return fallback;
}

export function normalizePortfolioNavCustomExtraPlacement(
  value: unknown,
  fallback: PortfolioNavCustomExtraPlacement = 'after'
): PortfolioNavCustomExtraPlacement {
  if (value === 'before' || value === 'after') return value;
  return fallback;
}

export function normalizePortfolioNavCustomExtraDisplay(
  value: unknown,
  fallback: PortfolioNavCustomExtraDisplay = 'both'
): PortfolioNavCustomExtraDisplay {
  if (value === 'logo' || value === 'text' || value === 'both') return value;
  return fallback;
}

export function normalizePortfolioNavCustomExtraFont(
  value: unknown,
  fallback: PortfolioNavCustomExtraFont = 'sans'
): PortfolioNavCustomExtraFont {
  if (value === 'sans' || value === 'serif' || value === 'display') return value;
  return fallback;
}

export function normalizePortfolioNavCustomExtraFontWeight(
  value: unknown,
  fallback: PortfolioNavCustomExtraFontWeight = 'semibold'
): PortfolioNavCustomExtraFontWeight {
  if (
    value === 'normal' ||
    value === 'medium' ||
    value === 'semibold' ||
    value === 'bold'
  ) {
    return value;
  }
  return fallback;
}

export function portfolioNavCustomExtraFontFamily(
  font: PortfolioNavCustomExtraFont | undefined
): string {
  const resolved = normalizePortfolioNavCustomExtraFont(font);
  return (
    PORTFOLIO_NAV_CUSTOM_EXTRA_FONT_OPTIONS.find((option) => option.value === resolved)
      ?.fontFamily ?? 'ui-sans-serif, system-ui, sans-serif'
  );
}

export function portfolioNavCustomExtraFontWeightValue(
  weight: PortfolioNavCustomExtraFontWeight | undefined
): number {
  const resolved = normalizePortfolioNavCustomExtraFontWeight(weight);
  return (
    PORTFOLIO_NAV_CUSTOM_EXTRA_FONT_WEIGHT_OPTIONS.find((option) => option.value === resolved)
      ?.cssWeight ?? 600
  );
}

/**
 * Resolve whether an extra sits before or after the section buttons.
 * Explicit left/right overrides the before-nav / after-nav placement.
 * Returns null when the extra uses free-side mode.
 */
export function resolvePortfolioNavExtraAdjacentPosition(
  placement: PortfolioNavExtrasPlacement | undefined,
  side: PortfolioNavExtrasSide | undefined = 'auto'
): 'before' | 'after' | null {
  const resolved = normalizePortfolioNavExtrasPlacement(placement);
  if (resolved === 'free-side') return null;
  if (side === 'left') return 'before';
  if (side === 'right') return 'after';
  return resolved === 'before-nav' ? 'before' : 'after';
}

/**
 * @deprecated Prefer resolvePortfolioNavExtraAdjacentPosition per-extra.
 * Kept for callers that still read the shared extrasPlacement / extrasSide pair.
 */
export function resolvePortfolioNavAdjacentExtrasPosition(
  settings: Pick<PortfolioNavSettings, 'extrasPlacement' | 'extrasSide'>
): 'before' | 'after' {
  return (
    resolvePortfolioNavExtraAdjacentPosition(
      settings.extrasPlacement,
      settings.extrasSide
    ) ?? 'after'
  );
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function clampPortfolioNavCustomExtraFontSizePx(value: unknown, fallback = 12): number {
  return clampInt(value, 9, 24, fallback);
}

export function clampPortfolioNavCustomExtraLogoSizePx(value: unknown, fallback = 20): number {
  return clampInt(value, 12, 40, fallback);
}

export function clampPortfolioNavCustomExtraGapPx(value: unknown, fallback = 6): number {
  return clampInt(value, 0, 20, fallback);
}

export function clampPortfolioNavCustomExtraPaddingX(value: unknown, fallback = 10): number {
  return clampInt(value, 0, 24, fallback);
}

export function clampPortfolioNavCustomExtraPaddingY(value: unknown, fallback = 6): number {
  return clampInt(value, 0, 16, fallback);
}

/**
 * Allow http(s), mailto, tel, hash, and relative paths. Reject javascript/data/etc.
 * Returns null when the value must not be used as a clickable href.
 */
export function sanitizePortfolioNavCustomHref(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const href = value.trim();
  if (!href) return null;
  const lower = href.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return null;
  }
  if (
    href.startsWith('#') ||
    href.startsWith('/') ||
    href.startsWith('./') ||
    href.startsWith('../') ||
    /^https?:\/\//i.test(href) ||
    /^mailto:/i.test(href) ||
    /^tel:/i.test(href)
  ) {
    return href;
  }
  return null;
}

export const PORTFOLIO_NAV_CONTACT_CTA_ICON_OPTIONS: {
  value: PortfolioNavContactCtaIcon;
  label: string;
  description: string;
}[] = [
  { value: 'phone', label: 'Classic', description: 'Curved handset.' },
  { value: 'phone-handset', label: 'Handset', description: 'Bold telephone receiver.' },
  { value: 'smartphone', label: 'Mobile', description: 'Vertical smartphone.' },
  { value: 'phone-call', label: 'Ringing', description: 'Handset with sound waves.' },
  { value: 'phone-outgoing', label: 'Outgoing', description: 'Handset with outward arrow.' },
  { value: 'phone-incoming', label: 'Incoming', description: 'Handset with inward arrow.' },
];

const LEGACY_CONTACT_CTA_ICON_MAP: Record<string, PortfolioNavContactCtaIcon> = {
  message: 'phone-call',
  mail: 'phone',
  send: 'phone-outgoing',
  heart: 'phone-handset',
  user: 'smartphone',
};

export function normalizePortfolioNavContactCtaIcon(
  value: unknown,
  fallback: PortfolioNavContactCtaIcon = 'phone'
): PortfolioNavContactCtaIcon {
  if (typeof value !== 'string') return fallback;
  if (PORTFOLIO_NAV_CONTACT_CTA_ICON_OPTIONS.some((option) => option.value === value)) {
    return value as PortfolioNavContactCtaIcon;
  }
  return LEGACY_CONTACT_CTA_ICON_MAP[value] ?? fallback;
}

export const DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES: PortfolioNavLinkIconSource[] = [
  'mail',
  'youtube',
  'twitter',
  'linkedin',
  'github',
  'instagram',
  'tiktok',
  'other',
];

export type PortfolioNavSettings = {
  enabled: boolean;
  /** Default = floating + scroll; per-page = dots pager; pages = one section at a time via nav bar only. */
  navMode: 'default' | 'per-page' | 'pages' | 'split';
  placement: PortfolioNavPlacement;
  barDesign: PortfolioNavBarDesign;
  contentMode: PortfolioNavContentMode;
  buttonDesign: PortfolioNavButtonDesign;
  activeStyle: PortfolioNavActiveStyle;
  displayMode: PortfolioNavDisplayMode;
  /** Idle / reveal behavior once the nav is allowed to show. */
  presence: PortfolioNavPresence;
  /** Menu handle content when presence is tap or hover (collapsed). */
  menuHandleContent: PortfolioNavMenuHandleContent;
  /** Icon glyph for the menu handle and the open-bar toggle. */
  menuControlIcon: PortfolioNavMenuControlIcon;
  /** Position of the open/close control relative to section items. */
  menuControlAlign: PortfolioNavMenuControlAlign;
  /** Handle / collapse control background (independent from nav buttons). */
  menuHandleBackgroundColor: string;
  /** Handle / collapse control icon color. */
  menuHandleIconColor: string;
  /** Handle / collapse control border color. */
  menuHandleBorderColor: string;
  /** Show outline on the handle / collapse control. */
  menuHandleBorderEnabled: boolean;
  labelCase: PortfolioNavLabelCase;
  barWidth: PortfolioNavBarWidth;
  barThickness: PortfolioNavBarThickness;
  barPadding: PortfolioNavBarPadding;
  /** Padding inside each nav button (pill / rail cell). */
  buttonPadding: PortfolioNavButtonPadding;
  edgeOffset: PortfolioNavEdgeOffset;
  /**
   * When true (default), Edge offset uses Close (flush) on mobile & tablet;
   * the chosen Edge offset applies from the large breakpoint up.
   */
  edgeOffsetCloseOnMobile: boolean;
  itemGap: PortfolioNavItemGap;
  /** Nav bar shell background (classic / rail). */
  barBackgroundColor: string;
  /** Nav bar shell border color (classic / rail). */
  barBorderColor: string;
  /** Show outline around the navigation bar shell. */
  barBorderEnabled: boolean;
  /** Soft drop shadow / halo around the bar shell. */
  barShadowEnabled: boolean;
  /** Backdrop blur intensity when Glass / blur is on. */
  barBlurStrength: PortfolioNavEffectStrength;
  /** Drop shadow intensity when Bar shadow is on. */
  barShadowStrength: PortfolioNavEffectStrength;
  /** Nav item icon color. */
  itemIconColor: string;
  /** Nav item label text color. */
  itemTextColor: string;
  /** Nav item button background. */
  itemBackgroundColor: string;
  /** Nav item button border. */
  itemBorderColor: string;
  /** Show outline around each nav button / pill. */
  itemBorderEnabled: boolean;
  /** Icon color while hovering an inactive nav item. */
  itemHoverIconColor: string;
  /** Label color while hovering an inactive nav item. */
  itemHoverTextColor: string;
  /** Soft fill color while hovering an inactive nav item. */
  itemHoverBackgroundColor: string;
  /** Border color while hovering an inactive nav item. */
  itemHoverBorderColor: string;
  /** Accent for active link (glow ring, rail highlight, underline, accent text). */
  activeAccentColor: string;
  glassEffect: boolean;
  /** Smaller icon/text padding on narrow screens (combined with mobileLayout). */
  compactOnMobile: boolean;
  /**
   * Mobile overflow strategy for the floating bar.
   * @see PortfolioNavMobileLayout
   */
  mobileLayout: PortfolioNavMobileLayout;
  /**
   * Brand next to the menu icon when `mobileLayout` is `drawer`.
   * @see PortfolioNavMobileBrand
   */
  mobileBrand: PortfolioNavMobileBrand;
  /** Custom word for drawer brand when `mobileBrand` is `word` (empty → first name / "Menu"). */
  mobileBrandWord: string;
  /** Edge the drawer panel slides from when `mobileLayout` is `drawer`. */
  mobileDrawerSide: PortfolioNavMobileDrawerSide;
  hideWhenSingle: boolean;
  /** Dedicated Contact CTA in free left/right space (detached from the nav pill). */
  contactButtonEnabled: boolean;
  contactButtonLabel: string;
  /** Icon circle (distinct from mail) or a labeled pill button. */
  contactButtonDisplay: PortfolioNavContactButtonDisplay;
  /** Glyph inside the Contact CTA. */
  contactButtonIcon: PortfolioNavContactCtaIcon;
  /** Corner shape of the Contact CTA (square / rounded / soft / pill). */
  contactButtonShape: PortfolioNavContactButtonShape;
  /**
   * When true, Contact can leave the link-icons group and occupy another free side
   * (e.g. icons left, Contact right when the menu is centered).
   */
  contactButtonDetached: boolean;
  /**
   * Side for a detached Contact CTA. Auto picks the opposite free side from link icons
   * when both sides are free.
   */
  contactButtonSide: PortfolioNavExtrasSide;
  /** Contact CTA fill (icon circle or labeled button). */
  contactButtonBackgroundColor: string;
  /** Contact CTA glyph / label color. */
  contactButtonColor: string;
  /** Contact CTA outline. */
  contactButtonBorderColor: string;
  contactButtonBorderEnabled: boolean;
  /** Frosted glass on the Contact CTA. */
  contactButtonGlassEffect: boolean;
  /** Soft drop shadow on the Contact CTA. */
  contactButtonShadowEnabled: boolean;
  /** Icon-only profile links in free left/right space, aligned with the nav band. */
  linkIconsEnabled: boolean;
  /** Which link sources to show when URLs/email exist on the profile. */
  linkIconSources: PortfolioNavLinkIconSource[];
  /** Outer circle background for mail / social icon buttons (not Contact). */
  linkIconBackgroundColor: string;
  /** Glyph color for mail / social icon buttons (not Contact). */
  linkIconColor: string;
  /** Outer circle border for mail / social icon buttons (not Contact). */
  linkIconBorderColor: string;
  /**
   * Side for the extras cluster (Contact + icons stay together).
   * Auto picks a free side from the menu placement; Left/Right prefer that side when free.
   * Only applies when `extrasPlacement` is `free-side`.
   */
  extrasSide: PortfolioNavExtrasSide;
  /**
   * Where link icons sit relative to section buttons.
   * Default `free-side` preserves historical free-space / free-slot behavior.
   * Contact and the custom extra each have their own placement fields.
   */
  extrasPlacement: PortfolioNavExtrasPlacement;
  /**
   * Where the Contact CTA sits (independent from link icons / custom extra).
   * When unset in stored settings, falls back to `extrasPlacement` on merge.
   */
  contactExtrasPlacement: PortfolioNavExtrasPlacement;
  /** Optional logo/text chip — placement is independent from Contact / icons. */
  customExtraEnabled: boolean;
  /**
   * Where the custom chip sits (independent from Contact / link icons).
   * When unset in stored settings, falls back to `extrasPlacement` on merge.
   */
  customExtraLayoutPlacement: PortfolioNavExtrasPlacement;
  /** Left / right / auto for the custom chip (free-side or adjacent override). */
  customExtraSide: PortfolioNavExtrasSide;
  /** @deprecated Prefer customExtraLayoutPlacement — kept as in-cluster order when co-located. */
  customExtraPlacement: PortfolioNavCustomExtraPlacement;
  customExtraDisplay: PortfolioNavCustomExtraDisplay;
  customExtraLogoUrl: string;
  customExtraText: string;
  customExtraHref: string;
  customExtraOpenNewTab: boolean;
  /**
   * Keep hand-picked chip colors. When false the three colors below follow the
   * nav palette, so the chip stays readable in both light and dark mode.
   */
  customExtraColorsManual: boolean;
  customExtraTextColor: string;
  customExtraBackgroundColor: string;
  customExtraBorderColor: string;
  customExtraBorderEnabled: boolean;
  customExtraShape: PortfolioNavCustomExtraShape;
  customExtraFont: PortfolioNavCustomExtraFont;
  customExtraFontWeight: PortfolioNavCustomExtraFontWeight;
  customExtraFontSizePx: number;
  customExtraLogoSizePx: number;
  customExtraGapPx: number;
  customExtraPaddingX: number;
  customExtraPaddingY: number;
  itemLabels: PortfolioNavItemLabels;
  itemIcons: PortfolioNavItemIcons;
  /** Semantic color tokens for the navigation (same system as the Hero palette). */
  navPalette?: PortfolioNavPalette;
  /** Which token each nav color slot uses. */
  navColorBindings?: PortfolioNavColorBindings;
  /**
   * When true (default), nav hex fields stay synced from the semantic palette.
   * When false, color pickers edit hex values directly (manual mode).
   */
  useNavPalette: boolean;
};

export type PortfolioSectionCopy = {
  enabled: boolean;
  title: string;
  subtitle: string;
};

export type PortfolioHeroSectionSettings = PortfolioSectionCopy & {
  showTools: boolean;
  showContactCta: boolean;
} & PortfolioHeroPresentationSettings;

export type PortfolioAboutSectionSettings = PortfolioSectionCopy & PortfolioAboutPresentationSettings;

export type PortfolioWorkSectionSettings = PortfolioSectionCopy & PortfolioWorkPresentationSettings;

export type { PortfolioServicesSectionSettings, PortfolioFaqSectionSettings, PortfolioContactSectionSettings, PortfolioExperienceSectionSettings, PortfolioTeamSectionSettings, PortfolioGallerySectionSettings, PortfolioAboutUsSectionSettings };

export type { PortfolioGlobalSettings };

export type PortfolioFooterSettings = PortfolioFooterSectionSettings;

export type PortfolioSettings = {
  themeId: PortfolioThemeId;
  /** User-created themes (draft + saved). Only these can be deleted. */
  customThemes: PortfolioCustomTheme[];
  global: PortfolioGlobalSettings;
  navigation: PortfolioNavSettings;
  hero: PortfolioHeroSectionSettings;
  work: PortfolioWorkSectionSettings;
  services: PortfolioServicesSectionSettings;
  about: PortfolioAboutSectionSettings;
  aboutUs: PortfolioAboutUsSectionSettings;
  experience: PortfolioExperienceSectionSettings;
  team: PortfolioTeamSectionSettings;
  gallery: PortfolioGallerySectionSettings;
  faq: PortfolioFaqSectionSettings;
  contact: PortfolioContactSectionSettings;
  footer: PortfolioFooterSettings;
  /**
   * Marketplace product IDs featured on the public portfolio (ordered).
   * Managed from Portfolio → Products section.
   */
  curatedProductIds?: string[];
  /**
   * ISO timestamp of the last client-side edit.
   * Used to resolve localStorage vs server conflicts without dropping newer drafts.
   */
  updatedAt?: string;
};

export type PortfolioSettingsSectionMeta = {
  id: PortfolioSettingsSectionId;
  label: string;
  description: string;
};

export const PORTFOLIO_SETTINGS_SECTIONS: PortfolioSettingsSectionMeta[] = [
  {
    id: 'theme',
    label: 'Global',
    description: 'Theme palette, page background, section order, title alignment, and layout width.',
  },
  {
    id: 'navigation',
    label: 'Navigation',
    description: 'Floating section menu — placement, bar design, icons vs text, and visibility.',
  },
  {
    id: 'hero',
    label: 'Hero',
    description: 'Opening section — headline, pitch, tools, and primary contact button.',
  },
  {
    id: 'work',
    label: 'Portfolio',
    description: 'Featured projects shown as large editorial work cards.',
  },
  {
    id: 'skills',
    label: 'Skills',
    description: 'Tools & skills section — cards, cadre, typography, and palette.',
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Services & pricing section — cards, CTA Commander, and typography.',
  },
  {
    id: 'about',
    label: 'About',
    description: 'Stats, why work with me, and profile details.',
  },
  {
    id: 'aboutUs',
    label: 'About us',
    description: 'Company story, tasks, images, quote, and founder.',
  },
  {
    id: 'experience',
    label: 'Experience',
    description: 'Career timeline, years summary, and role entries.',
  },
  {
    id: 'team',
    label: 'Team',
    description: 'Members, roles, portraits, and social links.',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    description: 'Images and videos displayed in five advanced layouts.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'Accordion with common questions and answers.',
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Email, phone, social links, and project CTA.',
  },
  {
    id: 'footer',
    label: 'Footer',
    description: 'Copyright, marketplace link, and quick contact links.',
  },
];

export const PORTFOLIO_SETTINGS_STORAGE_KEY = 'portfolio-section-settings-v1';

export function createDefaultPortfolioSettings(): PortfolioSettings {
  return {
    themeId: DEFAULT_PORTFOLIO_THEME_ID,
    customThemes: [],
    global: { ...DEFAULT_GLOBAL_SETTINGS },
    navigation: {
      enabled: true,
      navMode: 'default',
      placement: 'top-center',
      barDesign: 'classic',
      contentMode: 'icons',
      buttonDesign: 'clean',
      activeStyle: 'filled-pill',
      displayMode: 'always',
      presence: 'full',
      menuHandleContent: 'both',
      menuControlIcon: 'dots-h',
      menuControlAlign: 'right',
      menuHandleBackgroundColor: '#ffffff',
      menuHandleIconColor: '#171717',
      menuHandleBorderColor: '#d4d4d4',
      menuHandleBorderEnabled: true,
      labelCase: 'normal',
      barWidth: 'hug',
      barThickness: 'md',
      barPadding: 'md',
      buttonPadding: 'md',
      edgeOffset: 'md',
      edgeOffsetCloseOnMobile: true,
      itemGap: 'sm',
      barBackgroundColor: '#ffffff',
      barBorderColor: '#e5e5e5',
      barBorderEnabled: true,
      barShadowEnabled: true,
      barBlurStrength: 'md',
      barShadowStrength: 'md',
      itemIconColor: '#525252',
      itemTextColor: '#525252',
      itemBackgroundColor: '#ffffff',
      itemBorderColor: '#e5e5e5',
      itemBorderEnabled: true,
      itemHoverIconColor: '#e2572e',
      itemHoverTextColor: '#f4f3ef',
      itemHoverBackgroundColor: '#e2572e',
      itemHoverBorderColor: '#e2572e',
      activeAccentColor: '#f97316',
      glassEffect: true,
      compactOnMobile: false,
      mobileLayout: 'auto',
      mobileBrand: 'none',
      mobileBrandWord: '',
      mobileDrawerSide: 'right',
      hideWhenSingle: true,
      contactButtonEnabled: false,
      contactButtonLabel: 'Contact',
      contactButtonDisplay: 'icon',
      contactButtonIcon: 'phone',
      contactButtonShape: 'pill',
      contactButtonDetached: false,
      contactButtonSide: 'auto',
      contactButtonBackgroundColor: '#171717',
      contactButtonColor: '#ffffff',
      contactButtonBorderColor: '#171717',
      contactButtonBorderEnabled: false,
      contactButtonGlassEffect: false,
      contactButtonShadowEnabled: true,
      linkIconsEnabled: false,
      linkIconSources: [...DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES],
      linkIconBackgroundColor: '#ffffff',
      linkIconColor: '#404040',
      linkIconBorderColor: '#e5e5e5',
      extrasSide: 'auto',
      extrasPlacement: 'free-side',
      contactExtrasPlacement: 'free-side',
      customExtraEnabled: false,
      customExtraLayoutPlacement: 'free-side',
      customExtraSide: 'auto',
      customExtraPlacement: 'after',
      customExtraDisplay: 'both',
      customExtraLogoUrl: '',
      customExtraText: '',
      customExtraHref: '',
      customExtraOpenNewTab: true,
      customExtraColorsManual: false,
      customExtraTextColor: '#171717',
      customExtraBackgroundColor: '#ffffff',
      customExtraBorderColor: '#e5e5e5',
      customExtraBorderEnabled: false,
      customExtraShape: 'soft',
      customExtraFont: 'sans',
      customExtraFontWeight: 'semibold',
      customExtraFontSizePx: 12,
      customExtraLogoSizePx: 20,
      customExtraGapPx: 6,
      customExtraPaddingX: 10,
      customExtraPaddingY: 6,
      itemLabels: { ...DEFAULT_PORTFOLIO_NAV_ITEM_LABELS },
      itemIcons: { ...DEFAULT_PORTFOLIO_NAV_ITEM_ICONS },
      navPalette: { ...DEFAULT_NAV_PALETTE },
      navColorBindings: { ...DEFAULT_NAV_COLOR_BINDINGS },
      useNavPalette: true,
      ...applyNavPaletteToSettings({
        navPalette: DEFAULT_NAV_PALETTE,
        navColorBindings: DEFAULT_NAV_COLOR_BINDINGS,
      }),
    },
    hero: {
      enabled: true,
      title: 'Hero',
      subtitle: '',
      showTools: true,
      showContactCta: true,
      ...DEFAULT_HERO_PRESENTATION,
    },
    work: {
      enabled: true,
      title: 'PORTFOLIO',
      subtitle:
        'A selection of projects that showcase my work, process, and the tools I use to bring ideas to life.',
      ...DEFAULT_WORK_PRESENTATION,
    },
    services: {
      enabled: true,
      title: 'Services',
      subtitle:
        'Tailored services — built to take your ideas from brief to something you\u2019re proud to share.',
      ...DEFAULT_SERVICES_PRESENTATION,
    },
    about: {
      enabled: true,
      title: 'About',
      subtitle: 'Strengths, background, and the practical details behind how I work.',
      ...DEFAULT_ABOUT_PRESENTATION,
    },
    aboutUs: {
      enabled: true,
      title: 'About us',
      subtitle: 'Who we are, what we do, and the people behind the work.',
      ...DEFAULT_ABOUT_US_PRESENTATION,
    },
    experience: {
      enabled: true,
      title: 'Experience',
      subtitle: 'Roles, milestones, and the path that shaped my craft.',
      ...DEFAULT_EXPERIENCE_PRESENTATION,
    },
    team: {
      enabled: true,
      title: 'Team',
      subtitle: 'The people who bring every project to life.',
      ...DEFAULT_TEAM_PRESENTATION,
    },
    gallery: {
      enabled: true,
      title: 'Gallery',
      subtitle: 'Images, films, and chosen moments.',
      ...DEFAULT_GALLERY_PRESENTATION,
    },
    faq: {
      enabled: true,
      title: 'FAQ',
      subtitle: 'Quick answers to common questions before we start working together.',
      ...DEFAULT_FAQ_PRESENTATION,
    },
    contact: {
      enabled: true,
      title: 'Contact',
      subtitle:
        'Should you have a project in mind, I would be pleased to hear from you to discuss your objectives.',
      ...DEFAULT_CONTACT_PRESENTATION,
    },
    footer: {
      enabled: true,
      ...DEFAULT_FOOTER_PRESENTATION,
    },
    curatedProductIds: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mergeSectionCopy(
  base: PortfolioSectionCopy,
  patch: unknown
): PortfolioSectionCopy {
  if (!isRecord(patch)) return base;
  return {
    enabled: typeof patch.enabled === 'boolean' ? patch.enabled : base.enabled,
    title: typeof patch.title === 'string' ? patch.title : base.title,
    subtitle: typeof patch.subtitle === 'string' ? patch.subtitle : base.subtitle,
  };
}

function migrateNavBarDesign(stored: Record<string, unknown>): PortfolioNavBarDesign | undefined {
  if (stored.barDesign === 'classic' || stored.barDesign === 'rail' || stored.barDesign === 'dock') {
    return stored.barDesign;
  }
  const legacy = stored.containerStyle;
  if (legacy === 'pill') return 'classic';
  if (legacy === 'bar') return 'rail';
  if (legacy === 'minimal') return 'dock';
  return undefined;
}

function mergeNavSettings(base: PortfolioNavSettings, patch: unknown): PortfolioNavSettings {
  if (!isRecord(patch)) return base;

  const placement = patch.placement;
  const barDesign = patch.barDesign ?? (isRecord(patch) ? migrateNavBarDesign(patch) : undefined);
  const contentMode = patch.contentMode;
  const buttonDesign = patch.buttonDesign;
  const activeStyle = patch.activeStyle;
  const displayMode = patch.displayMode;
  const labelCase = patch.labelCase;
  const barThickness = patch.barThickness;
  const barPadding = patch.barPadding;
  const edgeOffset = patch.edgeOffset;
  const itemGap = patch.itemGap;

  const merged: PortfolioNavSettings = {
    enabled: typeof patch.enabled === 'boolean' ? patch.enabled : base.enabled,
    navMode:
      patch.navMode === 'default' ||
      patch.navMode === 'per-page' ||
      patch.navMode === 'pages' ||
      patch.navMode === 'split'
        ? patch.navMode
        : base.navMode ?? 'default',
    placement:
      placement === 'top-center' ||
      placement === 'top-left' ||
      placement === 'top-right' ||
      placement === 'bottom-center' ||
      placement === 'bottom-left' ||
      placement === 'bottom-right' ||
      placement === 'left-center' ||
      placement === 'right-center'
        ? placement
        : base.placement,
    barDesign:
      barDesign === 'classic' || barDesign === 'rail' || barDesign === 'dock' ? barDesign : base.barDesign,
    contentMode:
      contentMode === 'icons' || contentMode === 'text' || contentMode === 'both'
        ? contentMode
        : isRecord(patch) && !('contentMode' in patch) && Object.keys(patch).length > 0
          ? 'text'
          : base.contentMode,
    buttonDesign:
      buttonDesign === 'clean' ||
      buttonDesign === 'outlined' ||
      buttonDesign === 'soft' ||
      buttonDesign === 'glow' ||
      buttonDesign === 'bottom-line'
        ? buttonDesign
        : base.buttonDesign,
    activeStyle:
      activeStyle === 'filled-pill' ||
      activeStyle === 'accent-fill' ||
      activeStyle === 'underline' ||
      activeStyle === 'outline' ||
      activeStyle === 'soft-badge' ||
      activeStyle === 'dot' ||
      activeStyle === 'accent-text'
        ? activeStyle
        : base.activeStyle,
    displayMode:
      displayMode === 'always' || displayMode === 'on-scroll' || displayMode === 'after-hero'
        ? displayMode
        : base.displayMode,
    presence:
      patch.presence === 'full' ||
      patch.presence === 'dim' ||
      patch.presence === 'hover' ||
      patch.presence === 'tap'
        ? patch.presence
        : base.presence ?? 'full',
    menuHandleContent:
      patch.menuHandleContent === 'icon' ||
      patch.menuHandleContent === 'text' ||
      patch.menuHandleContent === 'both'
        ? patch.menuHandleContent
        : base.menuHandleContent ?? 'both',
    menuControlIcon:
      patch.menuControlIcon === 'dots-h' ||
      patch.menuControlIcon === 'dots-v' ||
      patch.menuControlIcon === 'x' ||
      patch.menuControlIcon === 'chevron' ||
      patch.menuControlIcon === 'menu'
        ? patch.menuControlIcon
        : base.menuControlIcon ?? 'dots-h',
    menuControlAlign:
      patch.menuControlAlign === 'left' ||
      patch.menuControlAlign === 'center' ||
      patch.menuControlAlign === 'right'
        ? patch.menuControlAlign
        : base.menuControlAlign === 'left' ||
            base.menuControlAlign === 'center' ||
            base.menuControlAlign === 'right'
          ? base.menuControlAlign
          : 'right',
    menuHandleBackgroundColor:
      typeof patch.menuHandleBackgroundColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.menuHandleBackgroundColor.trim())
        ? patch.menuHandleBackgroundColor.trim()
        : base.menuHandleBackgroundColor ?? '#ffffff',
    menuHandleIconColor:
      typeof patch.menuHandleIconColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.menuHandleIconColor.trim())
        ? patch.menuHandleIconColor.trim()
        : base.menuHandleIconColor ?? '#171717',
    menuHandleBorderColor:
      typeof patch.menuHandleBorderColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.menuHandleBorderColor.trim())
        ? patch.menuHandleBorderColor.trim()
        : base.menuHandleBorderColor ?? '#d4d4d4',
    menuHandleBorderEnabled:
      typeof patch.menuHandleBorderEnabled === 'boolean'
        ? patch.menuHandleBorderEnabled
        : base.menuHandleBorderEnabled ?? true,
    labelCase:
      labelCase === 'uppercase' || labelCase === 'titlecase' || labelCase === 'normal'
        ? labelCase
        : base.labelCase,
    barWidth: (() => {
      const raw =
        typeof patch.barWidth === 'string'
          ? patch.barWidth
          : typeof base.barWidth === 'string'
            ? base.barWidth
            : 'hug';
      return raw === 'full' ? 'full' : 'hug';
    })(),
    barThickness:
      barThickness === 'sm' || barThickness === 'md' || barThickness === 'lg' || barThickness === 'xl'
        ? barThickness
        : base.barThickness,
    barPadding:
      barPadding === 'none' ||
      barPadding === 'sm' ||
      barPadding === 'md' ||
      barPadding === 'lg' ||
      barPadding === 'xl'
        ? barPadding
        : base.barPadding,
    buttonPadding: (() => {
      const raw =
        typeof patch.buttonPadding === 'string'
          ? patch.buttonPadding
          : typeof base.buttonPadding === 'string'
            ? base.buttonPadding
            : 'md';
      return raw === 'none' || raw === 'sm' || raw === 'md' || raw === 'lg' || raw === 'xl'
        ? raw
        : 'md';
    })(),
    edgeOffset:
      edgeOffset === 'sm' || edgeOffset === 'md' || edgeOffset === 'lg' || edgeOffset === 'xl'
        ? edgeOffset
        : base.edgeOffset,
    edgeOffsetCloseOnMobile:
      typeof patch.edgeOffsetCloseOnMobile === 'boolean'
        ? patch.edgeOffsetCloseOnMobile
        : (base.edgeOffsetCloseOnMobile ?? true),
    itemGap:
      itemGap === 'none' ||
      itemGap === 'sm' ||
      itemGap === 'md' ||
      itemGap === 'lg' ||
      itemGap === 'xl' ||
      itemGap === 'spread'
        ? itemGap
        : base.itemGap,
    barBackgroundColor:
      typeof patch.barBackgroundColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.barBackgroundColor.trim())
        ? patch.barBackgroundColor.trim()
        : base.barBackgroundColor,
    barBorderColor:
      typeof patch.barBorderColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.barBorderColor.trim())
        ? patch.barBorderColor.trim()
        : base.barBorderColor,
    barBorderEnabled:
      typeof patch.barBorderEnabled === 'boolean'
        ? patch.barBorderEnabled
        : base.barBorderEnabled ?? true,
    barShadowEnabled:
      typeof patch.barShadowEnabled === 'boolean'
        ? patch.barShadowEnabled
        : base.barShadowEnabled ?? true,
    barBlurStrength: (() => {
      const raw =
        typeof patch.barBlurStrength === 'string'
          ? patch.barBlurStrength
          : base.barBlurStrength;
      return raw === 'sm' || raw === 'md' || raw === 'lg' || raw === 'xl' ? raw : 'md';
    })(),
    barShadowStrength: (() => {
      const raw =
        typeof patch.barShadowStrength === 'string'
          ? patch.barShadowStrength
          : base.barShadowStrength;
      return raw === 'sm' || raw === 'md' || raw === 'lg' || raw === 'xl' ? raw : 'md';
    })(),
    itemIconColor:
      typeof patch.itemIconColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.itemIconColor.trim())
        ? patch.itemIconColor.trim()
        : base.itemIconColor,
    itemTextColor:
      typeof patch.itemTextColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.itemTextColor.trim())
        ? patch.itemTextColor.trim()
        : base.itemTextColor,
    itemBackgroundColor:
      typeof patch.itemBackgroundColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.itemBackgroundColor.trim())
        ? patch.itemBackgroundColor.trim()
        : base.itemBackgroundColor,
    itemBorderColor:
      typeof patch.itemBorderColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.itemBorderColor.trim())
        ? patch.itemBorderColor.trim()
        : base.itemBorderColor,
    itemBorderEnabled:
      typeof patch.itemBorderEnabled === 'boolean'
        ? patch.itemBorderEnabled
        : base.itemBorderEnabled ?? true,
    itemHoverIconColor:
      typeof patch.itemHoverIconColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.itemHoverIconColor.trim())
        ? patch.itemHoverIconColor.trim()
        : base.itemHoverIconColor ?? '#e2572e',
    itemHoverTextColor:
      typeof patch.itemHoverTextColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.itemHoverTextColor.trim())
        ? patch.itemHoverTextColor.trim()
        : base.itemHoverTextColor ?? '#f4f3ef',
    itemHoverBackgroundColor:
      typeof patch.itemHoverBackgroundColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.itemHoverBackgroundColor.trim())
        ? patch.itemHoverBackgroundColor.trim()
        : base.itemHoverBackgroundColor ?? '#e2572e',
    itemHoverBorderColor:
      typeof patch.itemHoverBorderColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.itemHoverBorderColor.trim())
        ? patch.itemHoverBorderColor.trim()
        : base.itemHoverBorderColor ?? '#e2572e',
    activeAccentColor:
      typeof patch.activeAccentColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.activeAccentColor.trim())
        ? patch.activeAccentColor.trim()
        : base.activeAccentColor ?? '#f97316',
    glassEffect: typeof patch.glassEffect === 'boolean' ? patch.glassEffect : base.glassEffect,
    compactOnMobile:
      typeof patch.compactOnMobile === 'boolean' ? patch.compactOnMobile : base.compactOnMobile,
    mobileLayout:
      patch.mobileLayout === 'auto' ||
      patch.mobileLayout === 'icons-compact' ||
      patch.mobileLayout === 'scroll' ||
      patch.mobileLayout === 'wrap' ||
      patch.mobileLayout === 'drawer' ||
      patch.mobileLayout === 'off'
        ? patch.mobileLayout
        : base.mobileLayout ?? 'auto',
    mobileBrand:
      patch.mobileBrand === 'none' ||
      patch.mobileBrand === 'avatar' ||
      patch.mobileBrand === 'word'
        ? patch.mobileBrand
        : base.mobileBrand ?? 'none',
    mobileBrandWord:
      typeof patch.mobileBrandWord === 'string'
        ? patch.mobileBrandWord.trim().slice(0, 32)
        : base.mobileBrandWord ?? '',
    mobileDrawerSide:
      patch.mobileDrawerSide === 'left' || patch.mobileDrawerSide === 'right'
        ? patch.mobileDrawerSide
        : base.mobileDrawerSide ?? 'right',
    hideWhenSingle:
      typeof patch.hideWhenSingle === 'boolean' ? patch.hideWhenSingle : base.hideWhenSingle,
    contactButtonEnabled:
      typeof patch.contactButtonEnabled === 'boolean'
        ? patch.contactButtonEnabled
        : base.contactButtonEnabled ?? false,
    contactButtonLabel:
      typeof patch.contactButtonLabel === 'string' && patch.contactButtonLabel.trim()
        ? patch.contactButtonLabel.trim().slice(0, 32)
        : base.contactButtonLabel ?? 'Contact',
    contactButtonDisplay:
      patch.contactButtonDisplay === 'icon' || patch.contactButtonDisplay === 'button'
        ? patch.contactButtonDisplay
        : base.contactButtonDisplay ?? 'icon',
    contactButtonIcon: normalizePortfolioNavContactCtaIcon(
      patch.contactButtonIcon,
      base.contactButtonIcon ?? 'phone'
    ),
    contactButtonShape: normalizePortfolioNavContactButtonShape(
      patch.contactButtonShape,
      base.contactButtonShape ?? 'pill'
    ),
    contactButtonDetached:
      typeof patch.contactButtonDetached === 'boolean'
        ? patch.contactButtonDetached
        : base.contactButtonDetached ?? false,
    contactButtonSide:
      patch.contactButtonSide === 'auto' ||
      patch.contactButtonSide === 'left' ||
      patch.contactButtonSide === 'right'
        ? patch.contactButtonSide
        : base.contactButtonSide ?? 'auto',
    contactButtonBackgroundColor:
      typeof patch.contactButtonBackgroundColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.contactButtonBackgroundColor.trim())
        ? patch.contactButtonBackgroundColor.trim()
        : base.contactButtonBackgroundColor ?? '#171717',
    contactButtonColor:
      typeof patch.contactButtonColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.contactButtonColor.trim())
        ? patch.contactButtonColor.trim()
        : base.contactButtonColor ?? '#ffffff',
    contactButtonBorderColor:
      typeof patch.contactButtonBorderColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.contactButtonBorderColor.trim())
        ? patch.contactButtonBorderColor.trim()
        : base.contactButtonBorderColor ?? '#171717',
    contactButtonBorderEnabled:
      typeof patch.contactButtonBorderEnabled === 'boolean'
        ? patch.contactButtonBorderEnabled
        : base.contactButtonBorderEnabled ?? false,
    contactButtonGlassEffect:
      typeof patch.contactButtonGlassEffect === 'boolean'
        ? patch.contactButtonGlassEffect
        : base.contactButtonGlassEffect ?? false,
    contactButtonShadowEnabled:
      typeof patch.contactButtonShadowEnabled === 'boolean'
        ? patch.contactButtonShadowEnabled
        : base.contactButtonShadowEnabled ?? true,
    linkIconsEnabled:
      typeof patch.linkIconsEnabled === 'boolean'
        ? patch.linkIconsEnabled
        : base.linkIconsEnabled ?? false,
    linkIconSources: mergeNavLinkIconSources(base.linkIconSources, patch.linkIconSources),
    linkIconBackgroundColor:
      typeof patch.linkIconBackgroundColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.linkIconBackgroundColor.trim())
        ? patch.linkIconBackgroundColor.trim()
        : base.linkIconBackgroundColor ?? '#ffffff',
    linkIconColor:
      typeof patch.linkIconColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(patch.linkIconColor.trim())
        ? patch.linkIconColor.trim()
        : base.linkIconColor ?? '#404040',
    linkIconBorderColor:
      typeof patch.linkIconBorderColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.linkIconBorderColor.trim())
        ? patch.linkIconBorderColor.trim()
        : base.linkIconBorderColor ?? '#e5e5e5',
    extrasSide:
      patch.extrasSide === 'auto' || patch.extrasSide === 'left' || patch.extrasSide === 'right'
        ? patch.extrasSide
        : base.extrasSide ?? 'auto',
    extrasPlacement: normalizePortfolioNavExtrasPlacement(
      patch.extrasPlacement,
      base.extrasPlacement ?? 'free-side'
    ),
    contactExtrasPlacement: normalizePortfolioNavExtrasPlacement(
      patch.contactExtrasPlacement,
      base.contactExtrasPlacement ?? 'free-side'
    ),
    customExtraEnabled:
      typeof patch.customExtraEnabled === 'boolean'
        ? patch.customExtraEnabled
        : base.customExtraEnabled ?? false,
    customExtraLayoutPlacement: normalizePortfolioNavExtrasPlacement(
      patch.customExtraLayoutPlacement,
      base.customExtraLayoutPlacement ?? 'free-side'
    ),
    customExtraSide:
      patch.customExtraSide === 'auto' ||
      patch.customExtraSide === 'left' ||
      patch.customExtraSide === 'right'
        ? patch.customExtraSide
        : base.customExtraSide ?? 'auto',
    customExtraPlacement: normalizePortfolioNavCustomExtraPlacement(
      patch.customExtraPlacement,
      base.customExtraPlacement ?? 'after'
    ),
    customExtraDisplay: normalizePortfolioNavCustomExtraDisplay(
      patch.customExtraDisplay,
      base.customExtraDisplay ?? 'both'
    ),
    customExtraLogoUrl:
      typeof patch.customExtraLogoUrl === 'string'
        ? patch.customExtraLogoUrl.trim().slice(0, 2048)
        : base.customExtraLogoUrl ?? '',
    customExtraText:
      typeof patch.customExtraText === 'string'
        ? patch.customExtraText.trim().slice(0, 48)
        : base.customExtraText ?? '',
    customExtraHref:
      typeof patch.customExtraHref === 'string'
        ? patch.customExtraHref.trim().slice(0, 2048)
        : base.customExtraHref ?? '',
    customExtraOpenNewTab:
      typeof patch.customExtraOpenNewTab === 'boolean'
        ? patch.customExtraOpenNewTab
        : base.customExtraOpenNewTab ?? true,
    customExtraColorsManual:
      typeof patch.customExtraColorsManual === 'boolean'
        ? patch.customExtraColorsManual
        : base.customExtraColorsManual ?? false,
    customExtraTextColor:
      typeof patch.customExtraTextColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.customExtraTextColor.trim())
        ? patch.customExtraTextColor.trim()
        : base.customExtraTextColor ?? '#171717',
    customExtraBackgroundColor:
      typeof patch.customExtraBackgroundColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.customExtraBackgroundColor.trim())
        ? patch.customExtraBackgroundColor.trim()
        : base.customExtraBackgroundColor ?? '#ffffff',
    customExtraBorderColor:
      typeof patch.customExtraBorderColor === 'string' &&
      /^#[0-9a-fA-F]{6}$/.test(patch.customExtraBorderColor.trim())
        ? patch.customExtraBorderColor.trim()
        : base.customExtraBorderColor ?? '#e5e5e5',
    customExtraBorderEnabled:
      typeof patch.customExtraBorderEnabled === 'boolean'
        ? patch.customExtraBorderEnabled
        : base.customExtraBorderEnabled ?? false,
    customExtraShape: normalizePortfolioNavContactButtonShape(
      patch.customExtraShape,
      base.customExtraShape ?? 'soft'
    ),
    customExtraFont: normalizePortfolioNavCustomExtraFont(
      patch.customExtraFont,
      base.customExtraFont ?? 'sans'
    ),
    customExtraFontWeight: normalizePortfolioNavCustomExtraFontWeight(
      patch.customExtraFontWeight,
      base.customExtraFontWeight ?? 'semibold'
    ),
    customExtraFontSizePx: clampPortfolioNavCustomExtraFontSizePx(
      patch.customExtraFontSizePx,
      base.customExtraFontSizePx ?? 12
    ),
    customExtraLogoSizePx: clampPortfolioNavCustomExtraLogoSizePx(
      patch.customExtraLogoSizePx,
      base.customExtraLogoSizePx ?? 20
    ),
    customExtraGapPx: clampPortfolioNavCustomExtraGapPx(
      patch.customExtraGapPx,
      base.customExtraGapPx ?? 6
    ),
    customExtraPaddingX: clampPortfolioNavCustomExtraPaddingX(
      patch.customExtraPaddingX,
      base.customExtraPaddingX ?? 10
    ),
    customExtraPaddingY: clampPortfolioNavCustomExtraPaddingY(
      patch.customExtraPaddingY,
      base.customExtraPaddingY ?? 6
    ),
    itemLabels: mergeNavItemLabels(base.itemLabels, patch.itemLabels),
    itemIcons: mergeNavItemIcons(base.itemIcons, patch.itemIcons),
    navPalette: mergeNavPalette(
      mergeNavPalette(DEFAULT_NAV_PALETTE, base.navPalette),
      patch.navPalette
    ),
    navColorBindings: mergeNavColorBindings(
      mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, base.navColorBindings),
      patch.navColorBindings
    ),
    useNavPalette:
      typeof patch.useNavPalette === 'boolean'
        ? patch.useNavPalette
        : (base.useNavPalette ?? true),
  };

  // Manual mode: keep stored hex fields — do not overwrite from palette tokens.
  if (!merged.useNavPalette) {
    return merged;
  }

  // Palette mode: push tokens into every bound hex field.
  return {
    ...merged,
    ...applyNavPaletteToSettings(merged),
    useNavPalette: true,
  };
}

function mergeNavLinkIconSources(
  base: PortfolioNavLinkIconSource[],
  patch: unknown
): PortfolioNavLinkIconSource[] {
  if (!Array.isArray(patch)) {
    return base?.length ? base : [...DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES];
  }
  const allowed = new Set<PortfolioNavLinkIconSource>(DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES);
  const next = patch.filter(
    (value): value is PortfolioNavLinkIconSource =>
      typeof value === 'string' && allowed.has(value as PortfolioNavLinkIconSource)
  );
  return next.length > 0 ? Array.from(new Set(next)) : [...DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES];
}

export function mergePortfolioSettings(stored: unknown): PortfolioSettings {
  const defaults = createDefaultPortfolioSettings();
  if (!isRecord(stored)) return defaults;

  const customThemes = mergeCustomThemes(stored.customThemes).map((theme) => ({
    ...theme,
    // Re-normalize nested snapshot so old drafts stay compatible.
    snapshot: (() => {
      const nested = mergePortfolioSettings({
        ...theme.snapshot,
        themeId: theme.id,
        customThemes: [],
      });
      const { themeId, customThemes, ...rest } = nested;
      void themeId;
      void customThemes;
      return rest;
    })(),
  }));

  const themeId = resolvePortfolioThemeId(stored.themeId, customThemes);
  const merged: PortfolioSettings = {
    themeId,
    customThemes,
    global: (() => {
      const nextGlobal = mergeGlobalSettings(defaults.global, stored.global);
      const storedGlobal = isRecord(stored.global) ? stored.global : null;
      // Legacy: vertical mode saved before per-section picker existed → all sections targeted once.
      if (
        storedGlobal &&
        storedGlobal.titleOrientation === 'vertical' &&
        storedGlobal.titleOrientationTargets == null
      ) {
        return {
          ...nextGlobal,
          titleOrientationTargets: {
            work: true,
            services: true,
            skills: true,
            about: true,
            aboutUs: true,
            experience: true,
            team: true,
            gallery: true,
            faq: true,
            contact: true,
          },
        };
      }
      return nextGlobal;
    })(),
    navigation: mergeNavSettings(
      defaults.navigation,
      (() => {
        if (!isRecord(stored.navigation)) return stored.navigation;
        const shared = normalizePortfolioNavExtrasPlacement(
          stored.navigation.extrasPlacement,
          'free-side'
        );
        const sharedSide =
          stored.navigation.extrasSide === 'auto' ||
          stored.navigation.extrasSide === 'left' ||
          stored.navigation.extrasSide === 'right'
            ? stored.navigation.extrasSide
            : 'auto';
        const navPatch: Record<string, unknown> = { ...stored.navigation };
        // One-shot: pre-split settings inherit the shared placement per extra.
        if (!('contactExtrasPlacement' in navPatch)) {
          navPatch.contactExtrasPlacement = shared;
        }
        if (!('customExtraLayoutPlacement' in navPatch)) {
          navPatch.customExtraLayoutPlacement = shared;
        }
        if (!('customExtraSide' in navPatch)) {
          navPatch.customExtraSide = sharedSide;
        }
        return navPatch;
      })()
    ),
    hero: {
      ...mergeSectionCopy(defaults.hero, stored.hero),
      showTools: isRecord(stored.hero) && typeof stored.hero.showTools === 'boolean'
        ? stored.hero.showTools
        : defaults.hero.showTools,
      showContactCta: isRecord(stored.hero) && typeof stored.hero.showContactCta === 'boolean'
        ? stored.hero.showContactCta
        : defaults.hero.showContactCta,
      ...mergeHeroPresentation(defaults.hero, stored.hero),
    },
    work: {
      ...mergeSectionCopy(defaults.work, stored.work),
      ...mergeWorkPresentation(defaults.work, stored.work),
    },
    services: {
      ...mergeSectionCopy(defaults.services, stored.services),
      ...mergeServicesPresentation(defaults.services, stored.services),
    },
    about: {
      ...mergeSectionCopy(defaults.about, stored.about),
      ...mergeAboutPresentation(defaults.about, stored.about),
    },
    aboutUs: {
      ...mergeSectionCopy(defaults.aboutUs, stored.aboutUs),
      ...mergeAboutUsPresentation(defaults.aboutUs, stored.aboutUs),
    },
    experience: (() => {
      if (isRecord(stored.experience)) {
        return {
          ...mergeSectionCopy(defaults.experience, stored.experience),
          ...mergeExperiencePresentation(defaults.experience, stored.experience),
        };
      }
      return migrateExperienceFromLegacyAbout(stored.about);
    })(),
    team: (() => {
      const merged = {
        ...mergeSectionCopy(defaults.team, stored.team),
        ...mergeTeamPresentation(defaults.team, stored.team),
      };
      return { ...merged, ...migrateLegacyTeamCopy(merged.title, merged.subtitle) };
    })(),
    gallery: (() => {
      const merged = {
        ...mergeSectionCopy(defaults.gallery, stored.gallery),
        ...mergeGalleryPresentation(defaults.gallery, stored.gallery),
      };
      return { ...merged, ...migrateLegacyGalleryCopy(merged.title, merged.subtitle) };
    })(),
    faq: {
      ...mergeSectionCopy(defaults.faq, stored.faq),
      ...mergeFaqPresentation(defaults.faq, stored.faq),
    },
    contact: {
      ...mergeSectionCopy(defaults.contact, stored.contact),
      ...mergeContactPresentation(defaults.contact, stored.contact),
    },
    footer: {
      enabled: isRecord(stored.footer) && typeof stored.footer.enabled === 'boolean'
        ? stored.footer.enabled
        : defaults.footer.enabled,
      ...mergeFooterPresentation(defaults.footer, stored.footer),
    },
    curatedProductIds: Array.isArray(stored.curatedProductIds)
      ? stored.curatedProductIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : [],
  };

  const storedGlobal = isRecord(stored.global) ? stored.global : null;
  const hadStoredPalettePair =
    Boolean(storedGlobal) &&
    (storedGlobal!.paletteDark != null || storedGlobal!.paletteLight != null);
  merged.global = seedGlobalPalettePairFromHero(
    merged.global,
    merged.hero.palette,
    hadStoredPalettePair
  );
  const withActivePalette = applyActivePortfolioPalette(merged);

  // Editorial (and non-mono) portfolios: migrate old black stats cards → gray + black text.
  // Skip Noir / monochrome copies so their ink cards stay intentional.
  if (!withActivePalette.global.monochromeUi && isLegacyDefaultAboutStatsCard(withActivePalette.about)) {
    withActivePalette.about = withDefaultAboutStatsCardColors(withActivePalette.about);
  }

  // Noir / mono: fix dark-on-dark stats (e.g. rating accent #171717 on ink cards).
  if (
    (withActivePalette.global.monochromeUi || themeId === 'noir') &&
    isIllegibleDarkAboutStatsCard(withActivePalette.about)
  ) {
    withActivePalette.about = withNoirReadableAboutStatsColors(withActivePalette.about);
  }

  if (typeof stored.updatedAt === 'string' && Number.isFinite(Date.parse(stored.updatedAt))) {
    withActivePalette.updatedAt = stored.updatedAt;
  }

  return withActivePalette;
}

/** Stamp a fresh `updatedAt` before writing local cache / backend. */
export function stampPortfolioSettingsUpdatedAt(
  settings: PortfolioSettings,
  at: string = new Date().toISOString()
): PortfolioSettings {
  return { ...settings, updatedAt: at };
}

export function portfolioSettingsUpdatedAtMs(settings: PortfolioSettings | null | undefined): number {
  if (!settings?.updatedAt) return 0;
  const ms = Date.parse(settings.updatedAt);
  return Number.isFinite(ms) ? ms : 0;
}

/** True when local draft is strictly newer than the server snapshot. */
export function isPortfolioSettingsLocalNewer(
  local: PortfolioSettings | null,
  server: PortfolioSettings | null
): boolean {
  if (!local) return false;
  const localMs = portfolioSettingsUpdatedAtMs(local);
  if (localMs <= 0) return false;
  const serverMs = portfolioSettingsUpdatedAtMs(server);
  return localMs > serverMs;
}

export function portfolioSettingsStorageKey(creatorId: string): string {
  return `${PORTFOLIO_SETTINGS_STORAGE_KEY}:${creatorId}`;
}
