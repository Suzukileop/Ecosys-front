import type { CSSProperties } from 'react';
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
  DEFAULT_INFO_PRESENTATION,
  mergeInfoPresentation,
  type PortfolioInfoSectionSettings,
} from '@/components/portfolio/portfolio-info-settings';
import {
  DEFAULT_TOOLS_PRESENTATION,
  mergeToolsPresentation,
  type PortfolioToolsSectionSettings,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  DEFAULT_STACK_PRESENTATION,
  mergeStackPresentation,
  type PortfolioStackSectionSettings,
} from '@/components/portfolio/portfolio-stack-settings';
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
  type PortfolioNavSectionKey,
} from '@/components/portfolio/portfolio-nav-items';
import {
  normalizeSplitNavLeftSectionKeys,
} from '@/components/portfolio/portfolio-nav-split-layout';
import {
  normalizePortfolioNavMenuGroups,
  type PortfolioNavMenuGroup,
} from '@/components/portfolio/portfolio-nav-menu-groups';
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
  | 'info'
  | 'work'
  | 'services'
  | 'aboutUs'
  | 'experience'
  | 'team'
  | 'gallery'
  | 'faq'
  | 'contact'
  | 'stack'
  | 'tools'
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

export type PortfolioNavLayoutDesign =
  | 'classic'
  | 'editorial-bar'
  | 'floating-pill'
  | 'nav-logo-social'
  | 'center-logo-split'
  | 'logo-left-nav-contact'
  | 'case-overlay'
  | 'duten-panel'
  | 'half-panel-left';

export type PortfolioNavDutenPanelColumns = 1 | 2;

export type PortfolioNavDutenPanelInset = 'sm' | 'md' | 'lg';

export type PortfolioNavBarDesign = 'classic' | 'rail' | 'dock';

export type PortfolioNavContentMode = 'icons' | 'text' | 'both';

export type PortfolioNavActiveStyle =
  | 'filled-pill'
  | 'accent-fill'
  | 'underline'
  | 'underline-animated'
  | 'outline'
  | 'soft-badge'
  | 'dot'
  | 'dot-left'
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

export type PortfolioNavCaseOverlayMenuSide = 'left' | 'right';

export type PortfolioNavCaseOverlayMenuTrigger = 'text' | 'icon';

export type PortfolioNavLabelCase = 'uppercase' | 'titlecase' | 'normal';
/** Menu labels and contact/link button text — shared size scale. */
export type PortfolioNavLabelFontSize = 'xs' | 'sm' | 'md' | 'lg';

/** How wide the nav background stretches. */
export type PortfolioNavBarWidth = 'hug' | 'full';

/** Padding / height of the nav bar shell and items. */
export type PortfolioNavBarThickness = 'sm' | 'md' | 'lg' | 'xl';

/** Distance from the viewport edge (top/bottom/side depending on placement). */
export type PortfolioNavEdgeOffset = 'sm' | 'md' | 'lg' | 'xl';

/** Spacing between nav items. */
export type PortfolioNavItemGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'spread';

/** Bar shell fill — palette token or transparent (General → Navigation). */
export type PortfolioNavBarSurface = 'neutre' | 'fond' | 'transparent';

/** Inner padding of the nav bar shell (around items). */
export type PortfolioNavBarPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/** Vertical height of the nav bar shell and menu hit area (General → Navigation). */
export type PortfolioNavBarHeight = 'sm' | 'md' | 'lg';

/** Padding inside each nav button / pill. */
export type PortfolioNavButtonPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/** Intensity for bar glass blur / drop shadow. */
export type PortfolioNavEffectStrength = 'sm' | 'md' | 'lg' | 'xl';

/**
 * How the floating nav adapts below the lg breakpoint so items stay on-screen.
 * Desktop placement / gap / contentMode stay as configured above lg.
 * `drawer` = menu icon opens a sidebar of links (minimal top trigger).
 * `brand-bar` = full-width top bar with logo left and menu icon right (opens the same drawer).
 */
export type PortfolioNavMobileLayout = 'drawer' | 'brand-bar';

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
export type PortfolioNavTriZoneSlotMode = 'social' | 'contact';
export type PortfolioNavTriZoneContactSide = 'left' | 'right';
/** editorial-bar: same mutual exclusion as tri-zone — social links or contact CTA on the right. */
export type PortfolioNavEditorialBarSlotMode = PortfolioNavTriZoneSlotMode;
/** editorial-bar contact mode: tel: or mailto: from profile. */
export type PortfolioNavEditorialBarContactLink = 'phone' | 'mail';
/** editorial-bar: ink for active menu labels + contact / mail CTAs. */
export type PortfolioNavEditorialBarButtonInk = 'principal' | 'texteFort';

export const PORTFOLIO_NAV_EDITORIAL_BAR_BUTTON_INK_OPTIONS: {
  value: PortfolioNavEditorialBarButtonInk;
  label: string;
  description: string;
}[] = [
  {
    value: 'principal',
    label: 'Principal',
    description:
      'Pilule active en couleur principale (texte contrasté) · Contact / e-mail en principal.',
  },
  {
    value: 'texteFort',
    label: 'Texte fort',
    description: 'Texte fort partout — aucune trace de la couleur principale sur le menu.',
  },
];

export function normalizePortfolioNavEditorialBarButtonInk(
  value: unknown,
  fallback: PortfolioNavEditorialBarButtonInk = 'principal'
): PortfolioNavEditorialBarButtonInk {
  if (value === 'principal' || value === 'texteFort') return value;
  return fallback;
}

/** Per-channel contact button chrome for editorial bar (phone vs e-mail). */
export type PortfolioNavEditorialBarContactChannelSettings = {
  label: string;
  display: PortfolioNavContactButtonDisplay;
  icon: PortfolioNavContactCtaIcon;
  iconPosition: PortfolioNavContactButtonIconPosition;
  shape: PortfolioNavContactButtonShape;
};

export const DEFAULT_EDITORIAL_BAR_PHONE_CONTACT: PortfolioNavEditorialBarContactChannelSettings =
  {
    label: "Let's Talk",
    display: 'button',
    icon: 'arrow-up-right',
    iconPosition: 'right',
    shape: 'bottom-line',
  };

export const DEFAULT_EDITORIAL_BAR_MAIL_CONTACT: PortfolioNavEditorialBarContactChannelSettings =
  {
    label: "Let's talk",
    display: 'button',
    icon: 'arrow-up-right',
    iconPosition: 'right',
    shape: 'bottom-line',
  };
/** Icon placement inside a labeled contact button. */
export type PortfolioNavContactButtonIconPosition = 'left' | 'right' | 'none';
/** nav-logo-social: rendered size of profile link brand icons (max 3). */
export type PortfolioNavTriZoneSocialLinkSize = 'xs' | 'sm' | 'md' | 'lg';
/** nav-logo-social: horizontal gap between link brand icons. */
export type PortfolioNavTriZoneSocialLinkGap = 'sm' | 'md' | 'lg' | 'xl';
/** logo-left-nav-contact: logo on the left rail (default) or swapped to the right. */
export type PortfolioNavLogoLeftContactLogoSide = 'left' | 'right';

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

/** Glyph for the Contact extras CTA. */
export type PortfolioNavContactCtaIcon =
  | 'none'
  | 'phone'
  | 'smartphone'
  | 'phone-call'
  | 'mail'
  | 'chat'
  | 'at'
  | 'calendar'
  | 'send'
  | 'user'
  | 'arrow-up-right'
  | 'arrow-right'
  | 'arrow-up'
  /** @deprecated Saved settings — mapped to `phone` on read. */
  | 'phone-handset'
  /** @deprecated Saved settings — mapped to `phone` on read. */
  | 'phone-incoming'
  /** @deprecated Saved settings — mapped to `send` on read. */
  | 'phone-outgoing';

/** Corner / frame style of the Contact extras CTA. */
export type PortfolioNavContactButtonShape =
  | 'square'
  | 'rounded'
  | 'soft'
  | 'pill'
  | 'frameless'
  | 'bottom-line';

export const PORTFOLIO_NAV_CONTACT_BUTTON_SHAPE_OPTIONS: {
  value: PortfolioNavContactButtonShape;
  label: string;
  description: string;
}[] = [
  { value: 'frameless', label: 'Sans cadre', description: 'Texte ou icône seule, sans fond ni bordure.' },
  { value: 'bottom-line', label: 'Trait en bas', description: 'Soulignement discret sous le libellé.' },
  { value: 'square', label: 'Carré', description: 'Angles droits.' },
  { value: 'rounded', label: 'Arrondi', description: 'Coins légèrement arrondis.' },
  { value: 'soft', label: 'Soft', description: 'Grand rayon de coin.' },
  { value: 'pill', label: 'Pill', description: 'Bords entièrement arrondis — cercle en mode icône.' },
];

export function normalizePortfolioNavContactButtonIconPosition(
  value: unknown,
  fallback: PortfolioNavContactButtonIconPosition = 'left'
): PortfolioNavContactButtonIconPosition {
  if (value === 'left' || value === 'right' || value === 'none') return value;
  return fallback;
}

export function normalizePortfolioNavEditorialBarContactLink(
  value: unknown,
  fallback: PortfolioNavEditorialBarContactLink = 'phone'
): PortfolioNavEditorialBarContactLink {
  if (value === 'phone' || value === 'mail') return value;
  if (value === 'section') return 'phone';
  return fallback;
}

export const PORTFOLIO_NAV_EDITORIAL_BAR_CONTACT_LINK_OPTIONS: {
  value: PortfolioNavEditorialBarContactLink;
  label: string;
  description: string;
}[] = [
  {
    value: 'phone',
    label: 'Téléphone',
    description: 'Bouton qui ouvre le numéro du profil (tel:).',
  },
  {
    value: 'mail',
    label: 'E-mail',
    description: 'Bouton qui ouvre l’adresse e-mail du profil (mailto:).',
  },
];

export const PORTFOLIO_NAV_CONTACT_BUTTON_ICON_POSITION_OPTIONS: {
  value: PortfolioNavContactButtonIconPosition;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Icône avant le libellé.' },
  { value: 'right', label: 'Droite', description: 'Icône après le libellé.' },
  { value: 'none', label: 'Sans icône', description: 'Libellé seul.' },
];

export function normalizePortfolioNavContactButtonShape(
  value: unknown,
  fallback: PortfolioNavContactButtonShape = 'pill'
): PortfolioNavContactButtonShape {
  if (
    value === 'square' ||
    value === 'rounded' ||
    value === 'soft' ||
    value === 'pill' ||
    value === 'frameless' ||
    value === 'bottom-line'
  ) {
    return value;
  }
  return fallback;
}

export function portfolioNavContactButtonShapeClass(
  shape: PortfolioNavContactButtonShape | undefined
): string {
  switch (normalizePortfolioNavContactButtonShape(shape)) {
    case 'frameless':
    case 'bottom-line':
      return 'rounded-none';
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

export type PortfolioNavContactButtonChromeInput = {
  background: string;
  color: string;
  border: string;
  borderEnabled: boolean;
};

function portfolioNavContactButtonBackgroundIsTransparent(background: string): boolean {
  const normalized = background.trim().toLowerCase();
  return (
    normalized === 'transparent' ||
    normalized === 'rgba(0,0,0,0)' ||
    normalized === 'rgba(0, 0, 0, 0)'
  );
}

/** Longhand-only borders — avoids React warnings when switching contact button shapes. */
function portfolioNavContactButtonBorderStyle(
  width: number,
  color: string
): Pick<
  CSSProperties,
  | 'borderTopWidth'
  | 'borderRightWidth'
  | 'borderBottomWidth'
  | 'borderLeftWidth'
  | 'borderTopColor'
  | 'borderRightColor'
  | 'borderBottomColor'
  | 'borderLeftColor'
  | 'borderStyle'
> {
  return {
    borderTopWidth: width,
    borderRightWidth: width,
    borderBottomWidth: width,
    borderLeftWidth: width,
    borderTopColor: color,
    borderRightColor: color,
    borderBottomColor: color,
    borderLeftColor: color,
    borderStyle: 'solid',
  };
}

function portfolioNavContactButtonBottomLineBorderStyle(color: string): Pick<
  CSSProperties,
  | 'borderTopWidth'
  | 'borderRightWidth'
  | 'borderBottomWidth'
  | 'borderLeftWidth'
  | 'borderTopColor'
  | 'borderRightColor'
  | 'borderBottomColor'
  | 'borderLeftColor'
  | 'borderStyle'
> {
  return {
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: color,
    borderLeftColor: 'transparent',
    borderStyle: 'solid',
  };
}

/** Framed contact shapes (square / rounded / soft / pill) that need a visible outline on transparent shells. */
export function portfolioNavContactButtonShapeUsesOutline(
  shape: PortfolioNavContactButtonShape | undefined
): boolean {
  const normalized = normalizePortfolioNavContactButtonShape(shape);
  return (
    normalized === 'square' ||
    normalized === 'rounded' ||
    normalized === 'soft' ||
    normalized === 'pill'
  );
}

/** Shell paint for contact CTA — handles frameless / bottom-line variants. */
export function portfolioNavContactButtonShellPresentation(
  shape: PortfolioNavContactButtonShape | undefined,
  chrome: PortfolioNavContactButtonChromeInput
): { className: string; style: CSSProperties; useShadow: boolean; useGlass: boolean } {
  const normalized = normalizePortfolioNavContactButtonShape(shape);
  const baseClass = portfolioNavContactButtonShapeClass(normalized);
  const transparentBackground = portfolioNavContactButtonBackgroundIsTransparent(chrome.background);

  if (normalized === 'frameless') {
    return {
      className: `${baseClass} shadow-none`,
      style: {
        backgroundColor: 'transparent',
        color: chrome.color,
        ...portfolioNavContactButtonBorderStyle(0, 'transparent'),
      },
      useShadow: false,
      useGlass: false,
    };
  }

  if (normalized === 'bottom-line') {
    const lineColor = chrome.borderEnabled ? chrome.border : chrome.color;
    return {
      className: `${baseClass} shadow-none`,
      style: {
        backgroundColor: 'transparent',
        color: chrome.color,
        ...portfolioNavContactButtonBottomLineBorderStyle(lineColor),
        paddingBottom: 2,
      },
      useShadow: false,
      useGlass: false,
    };
  }

  const showOutline = transparentBackground || chrome.borderEnabled;
  const outlineColor = chrome.borderEnabled ? chrome.border : chrome.color;

  return {
    className: `${baseClass} box-border`,
    style: {
      backgroundColor: chrome.background,
      color: chrome.color,
      ...portfolioNavContactButtonBorderStyle(showOutline ? 1 : 0, showOutline ? outlineColor : 'transparent'),
    },
    useShadow: true,
    useGlass: true,
  };
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
  { value: 'phone', label: 'Téléphone', description: 'Combiné classique.' },
  { value: 'smartphone', label: 'Mobile', description: 'Smartphone vertical.' },
  { value: 'phone-call', label: 'Sonnerie', description: 'Combiné avec ondes.' },
  { value: 'mail', label: 'E-mail', description: 'Enveloppe.' },
  { value: 'chat', label: 'Message', description: 'Bulle de discussion.' },
  { value: 'at', label: '@', description: 'Symbole arobase.' },
  { value: 'calendar', label: 'Agenda', description: 'Prise de rendez-vous.' },
  { value: 'send', label: 'Envoyer', description: 'Avion en papier.' },
  { value: 'arrow-up-right', label: 'Flèche ↗', description: 'Diagonale haut-droite.' },
  { value: 'arrow-right', label: 'Flèche →', description: 'Vers la droite.' },
  { value: 'arrow-up', label: 'Flèche ↑', description: 'Vers le haut.' },
  { value: 'user', label: 'Profil', description: 'Silhouette utilisateur.' },
];

export const PORTFOLIO_NAV_CONTACT_CTA_DIRECTION_ICONS: PortfolioNavContactCtaIcon[] = [
  'arrow-up-right',
  'arrow-right',
  'arrow-up',
];

const PORTFOLIO_NAV_CONTACT_CTA_PHONE_ICONS: PortfolioNavContactCtaIcon[] = [
  'phone',
  'smartphone',
  'phone-call',
  ...PORTFOLIO_NAV_CONTACT_CTA_DIRECTION_ICONS,
];

const PORTFOLIO_NAV_CONTACT_CTA_MAIL_ICONS: PortfolioNavContactCtaIcon[] = [
  'mail',
  'at',
  'chat',
  'send',
  ...PORTFOLIO_NAV_CONTACT_CTA_DIRECTION_ICONS,
];

/** Editorial bar — phone channel icon picker (no mail / mixed glyphs). */
export function portfolioNavContactCtaIconOptionsForEditorialChannel(
  channel: PortfolioNavEditorialBarContactLink
) {
  const allowed = new Set(
    channel === 'phone' ? PORTFOLIO_NAV_CONTACT_CTA_PHONE_ICONS : PORTFOLIO_NAV_CONTACT_CTA_MAIL_ICONS
  );
  return PORTFOLIO_NAV_CONTACT_CTA_ICON_OPTIONS.filter((option) => allowed.has(option.value));
}

const DEPRECATED_CONTACT_CTA_ICON_MAP: Record<string, PortfolioNavContactCtaIcon> = {
  'phone-handset': 'phone',
  'phone-incoming': 'phone',
  'phone-outgoing': 'arrow-up-right',
};

const LEGACY_CONTACT_CTA_ICON_MAP: Record<string, PortfolioNavContactCtaIcon> = {
  message: 'chat',
  send: 'send',
  heart: 'user',
  user: 'user',
  ...DEPRECATED_CONTACT_CTA_ICON_MAP,
};

export function normalizePortfolioNavContactCtaIcon(
  value: unknown,
  fallback: PortfolioNavContactCtaIcon = 'phone'
): PortfolioNavContactCtaIcon {
  if (value === 'none') return 'none';
  if (typeof value !== 'string') return fallback;
  if (DEPRECATED_CONTACT_CTA_ICON_MAP[value]) {
    return DEPRECATED_CONTACT_CTA_ICON_MAP[value];
  }
  if (PORTFOLIO_NAV_CONTACT_CTA_ICON_OPTIONS.some((option) => option.value === value)) {
    return value as PortfolioNavContactCtaIcon;
  }
  return LEGACY_CONTACT_CTA_ICON_MAP[value] ?? fallback;
}

export function mergeEditorialBarContactChannelSettings(
  base: PortfolioNavEditorialBarContactChannelSettings | undefined,
  patch: Partial<PortfolioNavEditorialBarContactChannelSettings> | unknown,
  fallback: PortfolioNavEditorialBarContactChannelSettings
): PortfolioNavEditorialBarContactChannelSettings {
  const patchRecord =
    patch && typeof patch === 'object' && !Array.isArray(patch)
      ? (patch as Record<string, unknown>)
      : null;
  const patchPartial: Partial<PortfolioNavEditorialBarContactChannelSettings> | undefined = patchRecord
    ? {
        ...(typeof patchRecord.label === 'string' ? { label: patchRecord.label } : null),
        ...(patchRecord.display === 'icon' || patchRecord.display === 'button'
          ? { display: patchRecord.display }
          : null),
        ...(typeof patchRecord.icon === 'string' || patchRecord.icon === 'none'
          ? { icon: normalizePortfolioNavContactCtaIcon(patchRecord.icon, fallback.icon) }
          : null),
        ...(typeof patchRecord.iconPosition === 'string'
          ? {
              iconPosition: normalizePortfolioNavContactButtonIconPosition(
                patchRecord.iconPosition,
                fallback.iconPosition
              ),
            }
          : null),
        ...(typeof patchRecord.shape === 'string'
          ? {
              shape: normalizePortfolioNavContactButtonShape(
                patchRecord.shape,
                fallback.shape
              ),
            }
          : null),
      }
    : undefined;
  const merged = { ...fallback, ...base, ...patchPartial };
  return {
    label:
      typeof merged.label === 'string' && merged.label.trim()
        ? merged.label.trim().slice(0, 32)
        : fallback.label,
    display:
      merged.display === 'icon' || merged.display === 'button'
        ? merged.display
        : fallback.display,
    icon: normalizePortfolioNavContactCtaIcon(merged.icon, fallback.icon),
    iconPosition: normalizePortfolioNavContactButtonIconPosition(
      merged.iconPosition,
      fallback.iconPosition
    ),
    shape: normalizePortfolioNavContactButtonShape(merged.shape, fallback.shape),
  };
}

export function seedEditorialBarPhoneContactFromLegacy(settings: {
  contactButtonLabel?: string;
  contactButtonDisplay?: PortfolioNavContactButtonDisplay;
  contactButtonIcon?: PortfolioNavContactCtaIcon;
  contactButtonIconPosition?: PortfolioNavContactButtonIconPosition;
  contactButtonShape?: PortfolioNavContactButtonShape;
}): PortfolioNavEditorialBarContactChannelSettings {
  return mergeEditorialBarContactChannelSettings(
    undefined,
    {
      label: settings.contactButtonLabel,
      display: settings.contactButtonDisplay,
      icon: settings.contactButtonIcon,
      iconPosition: settings.contactButtonIconPosition,
      shape: settings.contactButtonShape,
    },
    DEFAULT_EDITORIAL_BAR_PHONE_CONTACT
  );
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
  /** Ready-made bar structure (logo / links / contact). */
  navLayoutDesign: PortfolioNavLayoutDesign;
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
  /** Case overlay — menu on the left or right; logo moves to the opposite edge. */
  caseOverlayMenuSide: PortfolioNavCaseOverlayMenuSide;
  /** Case overlay — Menu/Close text or icon trigger. */
  caseOverlayMenuTrigger: PortfolioNavCaseOverlayMenuTrigger;
  /** Duten panel — number of link columns inside the rounded panel. */
  dutenPanelColumns: PortfolioNavDutenPanelColumns;
  /** Duten panel — outer margin between panel and viewport edges. */
  dutenPanelInset: PortfolioNavDutenPanelInset;
  /** Duten panel — show email / phone row inside the open menu. */
  dutenPanelShowContact: boolean;
  /** Duten panel — show social icons inside the open menu. */
  dutenPanelShowSocial: boolean;
  /** Duten panel — profile link ids for the social row (empty = first links). */
  dutenPanelSocialLinkIds: string[];
  /** Duten panel — large display word below the link grid when open. */
  dutenPanelShowHeroWord: boolean;
  /** Duten panel — customizable text for the large bottom word (e.g. brand acronym). */
  dutenPanelHeroWord: string;
  /** Half panel — small heading above the link grid (e.g. Discover Pages). */
  halfPanelDiscoverLabel: string;
  /** Handle / collapse control background (independent from nav buttons). */
  menuHandleBackgroundColor: string;
  /** Handle / collapse control icon color. */
  menuHandleIconColor: string;
  /** Handle / collapse control border color. */
  menuHandleBorderColor: string;
  /** Show outline on the handle / collapse control. */
  menuHandleBorderEnabled: boolean;
  labelCase: PortfolioNavLabelCase;
  /** Shared font size for nav menu labels and link/contact button text. */
  labelFontSize: PortfolioNavLabelFontSize;
  barWidth: PortfolioNavBarWidth;
  barThickness: PortfolioNavBarThickness;
  barPadding: PortfolioNavBarPadding;
  /** Vertical padding of the bar shell and menu hit area. */
  navBarHeight: PortfolioNavBarHeight;
  /** Padding inside each nav button (pill / rail cell). */
  buttonPadding: PortfolioNavButtonPadding;
  edgeOffset: PortfolioNavEdgeOffset;
  /**
   * When true (default), Edge offset uses Close (flush) on mobile & tablet;
   * the chosen Edge offset applies from the large breakpoint up.
   */
  edgeOffsetCloseOnMobile: boolean;
  itemGap: PortfolioNavItemGap;
  /**
   * Bar shell surface when palette is on: neutre (card), fond (page), or transparent.
   * Default neutre preserves current structured layout presets.
   */
  navBarSurface: PortfolioNavBarSurface;
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
  /** Labeled button: icon before/after label, or text-only. */
  contactButtonIconPosition: PortfolioNavContactButtonIconPosition;
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
  /** nav-logo-social: ordered link ids to show (max 3). Empty = first available links. */
  triZoneSocialLinkIds: string[];
  /** @deprecated Use triZoneShowSocial — kept for saved settings migration. */
  triZoneSlotMode: PortfolioNavTriZoneSlotMode;
  /** @deprecated Contact rails are grouped on the right — kept for migration. */
  triZoneContactSide: PortfolioNavTriZoneContactSide;
  /** nav-logo-social: brand icon size when showing social links. */
  triZoneSocialLinkSize: PortfolioNavTriZoneSocialLinkSize;
  /** nav-logo-social: grayscale brand icons (no platform colors). */
  triZoneSocialLinkMonochrome: boolean;
  /** nav-logo-social: spacing between brand link icons. */
  triZoneSocialLinkGap: PortfolioNavTriZoneSocialLinkGap;
  /** nav-logo-social: show social link icons (can combine with phone + mail). */
  triZoneShowSocial: boolean;
  /** nav-logo-social: show phone contact CTA. */
  triZoneShowPhone: boolean;
  /** nav-logo-social: show e-mail contact CTA. */
  triZoneShowMail: boolean;
  /** editorial-bar: show social link icons on the right (can combine with phone + mail). */
  editorialBarShowSocial: boolean;
  /** editorial-bar: show phone contact CTA on the right. */
  editorialBarShowPhone: boolean;
  /** editorial-bar: show e-mail contact CTA on the right. */
  editorialBarShowMail: boolean;
  /** @deprecated Use editorialBarShowSocial — kept for saved settings migration. */
  editorialBarSlotMode: PortfolioNavEditorialBarSlotMode;
  /** @deprecated Use editorialBarShowPhone / editorialBarShowMail — kept for migration. */
  editorialBarContactLink: PortfolioNavEditorialBarContactLink;
  /** editorial-bar: phone channel label, icon, frame, etc. */
  editorialBarPhoneContact: PortfolioNavEditorialBarContactChannelSettings;
  /** editorial-bar: e-mail channel label, icon, frame, etc. */
  editorialBarMailContact: PortfolioNavEditorialBarContactChannelSettings;
  /** editorial-bar: text color token for active menu + contact CTAs. */
  editorialBarButtonInk: PortfolioNavEditorialBarButtonInk;
  /** floating-pill: show brand name / logo in the left capsule column. */
  floatingPillShowLogo: boolean;
  /** floating-pill: show contact CTA in the right capsule column. */
  floatingPillShowContact: boolean;
  /** center-logo-split: section keys pinned to the left rail (empty = auto half/half). */
  splitNavLeftSectionKeys: PortfolioNavSectionKey[];
  /** logo-left-nav-contact: logo rail — left (nav+contact right) or right (nav+contact left). */
  logoLeftNavContactLogoSide: PortfolioNavLogoLeftContactLogoSide;
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
  /** Dropdown groups — each groups 2+ section links under a custom label. */
  navMenuGroups: PortfolioNavMenuGroup[];
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
  info: PortfolioInfoSectionSettings;
  work: PortfolioWorkSectionSettings;
  services: PortfolioServicesSectionSettings;
  about: PortfolioAboutSectionSettings;
  aboutUs: PortfolioAboutUsSectionSettings;
  experience: PortfolioExperienceSectionSettings;
  team: PortfolioTeamSectionSettings;
  gallery: PortfolioGallerySectionSettings;
  faq: PortfolioFaqSectionSettings;
  contact: PortfolioContactSectionSettings;
  stack: PortfolioStackSectionSettings;
  tools: PortfolioToolsSectionSettings;
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

export type { PortfolioNavMenuGroup } from '@/components/portfolio/portfolio-nav-menu-groups';

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
    id: 'stack',
    label: 'Stack',
    description: 'Tech stack — workflow rail with logo tiles and labels.',
  },
  {
    id: 'info',
    label: 'Info',
    description: 'About me — titre, bio, education, skills and more.',
  },
  {
    id: 'work',
    label: 'Portfolio',
    description: 'Featured projects shown as large editorial work cards.',
  },
  {
    id: 'tools',
    label: 'Tools',
    description: 'Workflow & tools — logo tiles and labels.',
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Services & pricing section — cards, CTA Commander, and typography.',
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
      navLayoutDesign: 'classic',
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
      caseOverlayMenuSide: 'right',
      caseOverlayMenuTrigger: 'text',
      dutenPanelColumns: 2,
      dutenPanelInset: 'md',
      dutenPanelShowContact: false,
      dutenPanelShowSocial: false,
      dutenPanelSocialLinkIds: [],
      dutenPanelShowHeroWord: false,
      dutenPanelHeroWord: '',
      halfPanelDiscoverLabel: 'Discover Pages',
      menuHandleBackgroundColor: '#ffffff',
      menuHandleIconColor: '#171717',
      menuHandleBorderColor: '#d4d4d4',
      menuHandleBorderEnabled: true,
      labelCase: 'normal',
      labelFontSize: 'sm',
      barWidth: 'hug',
      barThickness: 'md',
      barPadding: 'md',
      navBarHeight: 'md',
      buttonPadding: 'md',
      edgeOffset: 'md',
      edgeOffsetCloseOnMobile: true,
      itemGap: 'sm',
      navBarSurface: 'neutre',
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
      mobileLayout: 'brand-bar',
      mobileBrand: 'none',
      mobileBrandWord: '',
      mobileDrawerSide: 'right',
      hideWhenSingle: true,
      contactButtonEnabled: false,
      contactButtonLabel: 'Contact',
      contactButtonDisplay: 'icon',
      contactButtonIcon: 'phone',
      contactButtonIconPosition: 'left',
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
      triZoneSocialLinkIds: [],
      triZoneSlotMode: 'social',
      triZoneContactSide: 'right',
      triZoneSocialLinkSize: 'sm',
      triZoneSocialLinkMonochrome: false,
      triZoneSocialLinkGap: 'md',
      triZoneShowSocial: true,
      triZoneShowPhone: false,
      triZoneShowMail: false,
      editorialBarSlotMode: 'contact',
      editorialBarShowSocial: false,
      editorialBarShowPhone: true,
      editorialBarShowMail: false,
      editorialBarContactLink: 'phone',
      editorialBarPhoneContact: { ...DEFAULT_EDITORIAL_BAR_PHONE_CONTACT },
      editorialBarMailContact: { ...DEFAULT_EDITORIAL_BAR_MAIL_CONTACT },
      editorialBarButtonInk: 'principal',
      floatingPillShowLogo: false,
      floatingPillShowContact: true,
      splitNavLeftSectionKeys: [],
      logoLeftNavContactLogoSide: 'left',
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
      navMenuGroups: [],
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
    info: {
      enabled: true,
      title: 'About me',
      subtitle: 'Background, education and how I work.',
      ...DEFAULT_INFO_PRESENTATION,
    },
    work: {
      enabled: true,
      title: 'PORTFOLIO',
      subtitle: 'Selected projects.',
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
      enabled: false,
      title: 'About',
      subtitle: '',
      ...DEFAULT_ABOUT_PRESENTATION,
      showSidePanel: false,
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
    tools: {
      enabled: true,
      title: 'Workflow & Tools',
      subtitle: '',
      ...DEFAULT_TOOLS_PRESENTATION,
    },
    stack: {
      enabled: true,
      title: 'Core Stack',
      subtitle: '',
      ...DEFAULT_STACK_PRESENTATION,
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

function migratePortfolioNavActiveStyle(value: unknown): PortfolioNavActiveStyle | undefined {
  if (value === 'filled-pill') return 'filled-pill';
  if (value === 'accent-fill') return 'accent-fill';
  if (value === 'underline') return 'underline';
  if (value === 'underline-animated') return 'underline-animated';
  if (value === 'outline') return 'outline';
  if (value === 'soft-badge') return 'soft-badge';
  if (value === 'dot') return 'dot';
  if (value === 'dot-left') return 'dot-left';
  if (value === 'accent-text') return 'accent-text';
  if (value === 'icons-stacked') return 'filled-pill';
  return undefined;
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
  const navBarHeight = patch.navBarHeight;
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
    navLayoutDesign:
      patch.navLayoutDesign === 'classic' ||
      patch.navLayoutDesign === 'editorial-bar' ||
      patch.navLayoutDesign === 'floating-pill' ||
      patch.navLayoutDesign === 'nav-logo-social' ||
      patch.navLayoutDesign === 'center-logo-split' ||
      patch.navLayoutDesign === 'logo-left-nav-contact' ||
      patch.navLayoutDesign === 'case-overlay' ||
      patch.navLayoutDesign === 'duten-panel' ||
      patch.navLayoutDesign === 'half-panel-left'
        ? patch.navLayoutDesign
        : base.navLayoutDesign ?? 'classic',
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
    buttonDesign: (() => {
      const resolved =
        buttonDesign === 'clean' ||
        buttonDesign === 'outlined' ||
        buttonDesign === 'soft' ||
        buttonDesign === 'glow' ||
        buttonDesign === 'bottom-line'
          ? buttonDesign
          : base.buttonDesign;
      // Legacy generic underline trait — activeStyle indicators replace it.
      return resolved === 'bottom-line' ? 'clean' : resolved;
    })(),
    activeStyle:
      migratePortfolioNavActiveStyle(activeStyle) ??
      migratePortfolioNavActiveStyle(base.activeStyle) ??
      base.activeStyle,
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
    caseOverlayMenuSide:
      patch.caseOverlayMenuSide === 'left' || patch.caseOverlayMenuSide === 'right'
        ? patch.caseOverlayMenuSide
        : base.caseOverlayMenuSide ?? 'right',
    caseOverlayMenuTrigger:
      patch.caseOverlayMenuTrigger === 'text' || patch.caseOverlayMenuTrigger === 'icon'
        ? patch.caseOverlayMenuTrigger
        : base.caseOverlayMenuTrigger ?? 'text',
    dutenPanelColumns:
      patch.dutenPanelColumns === 1 || patch.dutenPanelColumns === 2
        ? patch.dutenPanelColumns
        : base.dutenPanelColumns ?? 2,
    dutenPanelInset:
      patch.dutenPanelInset === 'sm' || patch.dutenPanelInset === 'md' || patch.dutenPanelInset === 'lg'
        ? patch.dutenPanelInset
        : base.dutenPanelInset ?? 'md',
    dutenPanelShowContact:
      typeof patch.dutenPanelShowContact === 'boolean'
        ? patch.dutenPanelShowContact
        : base.dutenPanelShowContact ?? false,
    dutenPanelShowSocial:
      typeof patch.dutenPanelShowSocial === 'boolean'
        ? patch.dutenPanelShowSocial
        : base.dutenPanelShowSocial ?? false,
    dutenPanelSocialLinkIds: Array.isArray(patch.dutenPanelSocialLinkIds)
      ? patch.dutenPanelSocialLinkIds
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
          .slice(0, 5)
      : base.dutenPanelSocialLinkIds ?? [],
    dutenPanelShowHeroWord:
      typeof patch.dutenPanelShowHeroWord === 'boolean'
        ? patch.dutenPanelShowHeroWord
        : base.dutenPanelShowHeroWord ?? false,
    dutenPanelHeroWord:
      typeof patch.dutenPanelHeroWord === 'string'
        ? patch.dutenPanelHeroWord.slice(0, 32)
        : base.dutenPanelHeroWord ?? '',
    halfPanelDiscoverLabel:
      typeof patch.halfPanelDiscoverLabel === 'string'
        ? patch.halfPanelDiscoverLabel
        : base.halfPanelDiscoverLabel ?? 'Discover Pages',
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
    labelFontSize: (() => {
      const raw =
        typeof patch.labelFontSize === 'string'
          ? patch.labelFontSize
          : typeof base.labelFontSize === 'string'
            ? base.labelFontSize
            : 'sm';
      return raw === 'xs' || raw === 'sm' || raw === 'md' || raw === 'lg' ? raw : 'sm';
    })(),
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
    navBarHeight:
      navBarHeight === 'sm' || navBarHeight === 'md' || navBarHeight === 'lg'
        ? navBarHeight
        : base.navBarHeight ?? 'md',
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
    navBarSurface:
      patch.navBarSurface === 'neutre' ||
      patch.navBarSurface === 'fond' ||
      patch.navBarSurface === 'transparent'
        ? patch.navBarSurface
        : base.navBarSurface ?? 'neutre',
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
    mobileLayout: (() => {
      const raw = patch.mobileLayout ?? base.mobileLayout ?? 'brand-bar';
      if (raw === 'drawer' || raw === 'brand-bar') return raw;
      return 'brand-bar';
    })(),
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
    contactButtonIconPosition: normalizePortfolioNavContactButtonIconPosition(
      patch.contactButtonIconPosition,
      base.contactButtonIconPosition ?? 'left'
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
    triZoneSocialLinkIds: Array.isArray(patch.triZoneSocialLinkIds)
      ? patch.triZoneSocialLinkIds
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
          .slice(0, 3)
      : base.triZoneSocialLinkIds ?? [],
    triZoneSlotMode:
      patch.triZoneSlotMode === 'contact' || patch.triZoneSlotMode === 'social'
        ? patch.triZoneSlotMode
        : base.triZoneSlotMode ?? 'social',
    triZoneContactSide:
      patch.triZoneContactSide === 'left' || patch.triZoneContactSide === 'right'
        ? patch.triZoneContactSide
        : base.triZoneContactSide ?? 'right',
    triZoneSocialLinkSize:
      patch.triZoneSocialLinkSize === 'xs' ||
      patch.triZoneSocialLinkSize === 'sm' ||
      patch.triZoneSocialLinkSize === 'md' ||
      patch.triZoneSocialLinkSize === 'lg'
        ? patch.triZoneSocialLinkSize
        : base.triZoneSocialLinkSize ?? 'sm',
    triZoneSocialLinkMonochrome:
      typeof patch.triZoneSocialLinkMonochrome === 'boolean'
        ? patch.triZoneSocialLinkMonochrome
        : base.triZoneSocialLinkMonochrome ?? false,
    triZoneSocialLinkGap:
      patch.triZoneSocialLinkGap === 'sm' ||
      patch.triZoneSocialLinkGap === 'md' ||
      patch.triZoneSocialLinkGap === 'lg' ||
      patch.triZoneSocialLinkGap === 'xl'
        ? patch.triZoneSocialLinkGap
        : base.triZoneSocialLinkGap ?? 'md',
    triZoneShowSocial:
      typeof patch.triZoneShowSocial === 'boolean'
        ? patch.triZoneShowSocial
        : typeof base.triZoneShowSocial === 'boolean'
          ? base.triZoneShowSocial
          : (base.triZoneSlotMode ?? 'social') === 'social',
    triZoneShowPhone:
      typeof patch.triZoneShowPhone === 'boolean'
        ? patch.triZoneShowPhone
        : typeof base.triZoneShowPhone === 'boolean'
          ? base.triZoneShowPhone
          : (base.triZoneSlotMode ?? 'social') === 'contact',
    triZoneShowMail:
      typeof patch.triZoneShowMail === 'boolean'
        ? patch.triZoneShowMail
        : typeof base.triZoneShowMail === 'boolean'
          ? base.triZoneShowMail
          : false,
    editorialBarSlotMode:
      patch.editorialBarSlotMode === 'contact' || patch.editorialBarSlotMode === 'social'
        ? patch.editorialBarSlotMode
        : base.editorialBarSlotMode ?? 'contact',
    editorialBarShowSocial:
      typeof patch.editorialBarShowSocial === 'boolean'
        ? patch.editorialBarShowSocial
        : typeof base.editorialBarShowSocial === 'boolean'
          ? base.editorialBarShowSocial
          : (base.editorialBarSlotMode ?? 'contact') === 'social',
    editorialBarShowPhone:
      typeof patch.editorialBarShowPhone === 'boolean'
        ? patch.editorialBarShowPhone
        : typeof base.editorialBarShowPhone === 'boolean'
          ? base.editorialBarShowPhone
          : (base.editorialBarSlotMode ?? 'contact') === 'contact' &&
            normalizePortfolioNavEditorialBarContactLink(base.editorialBarContactLink, 'phone') !==
              'mail',
    editorialBarShowMail:
      typeof patch.editorialBarShowMail === 'boolean'
        ? patch.editorialBarShowMail
        : typeof base.editorialBarShowMail === 'boolean'
          ? base.editorialBarShowMail
          : (base.editorialBarSlotMode ?? 'contact') === 'contact' &&
            normalizePortfolioNavEditorialBarContactLink(base.editorialBarContactLink, 'phone') ===
              'mail',
    floatingPillShowLogo:
      typeof patch.floatingPillShowLogo === 'boolean'
        ? patch.floatingPillShowLogo
        : typeof base.floatingPillShowLogo === 'boolean'
          ? base.floatingPillShowLogo
          : false,
    floatingPillShowContact:
      typeof patch.floatingPillShowContact === 'boolean'
        ? patch.floatingPillShowContact
        : typeof base.floatingPillShowContact === 'boolean'
          ? base.floatingPillShowContact
          : true,
    editorialBarContactLink: normalizePortfolioNavEditorialBarContactLink(
      patch.editorialBarContactLink,
      base.editorialBarContactLink ?? 'phone'
    ),
    editorialBarPhoneContact: mergeEditorialBarContactChannelSettings(
      base.editorialBarPhoneContact ??
        seedEditorialBarPhoneContactFromLegacy({
          contactButtonLabel: base.contactButtonLabel,
          contactButtonDisplay: base.contactButtonDisplay,
          contactButtonIcon: base.contactButtonIcon,
          contactButtonIconPosition: base.contactButtonIconPosition,
          contactButtonShape: base.contactButtonShape,
        }),
      patch.editorialBarPhoneContact,
      DEFAULT_EDITORIAL_BAR_PHONE_CONTACT
    ),
    editorialBarMailContact: mergeEditorialBarContactChannelSettings(
      base.editorialBarMailContact,
      patch.editorialBarMailContact,
      DEFAULT_EDITORIAL_BAR_MAIL_CONTACT
    ),
    editorialBarButtonInk: normalizePortfolioNavEditorialBarButtonInk(
      patch.editorialBarButtonInk,
      base.editorialBarButtonInk ?? 'principal'
    ),
    splitNavLeftSectionKeys:
      patch.splitNavLeftSectionKeys !== undefined
        ? normalizeSplitNavLeftSectionKeys(patch.splitNavLeftSectionKeys)
        : base.splitNavLeftSectionKeys ?? [],
    logoLeftNavContactLogoSide:
      patch.logoLeftNavContactLogoSide === 'left' || patch.logoLeftNavContactLogoSide === 'right'
        ? patch.logoLeftNavContactLogoSide
        : base.logoLeftNavContactLogoSide ?? 'left',
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
    navMenuGroups:
      patch.navMenuGroups !== undefined
        ? normalizePortfolioNavMenuGroups(patch.navMenuGroups)
        : base.navMenuGroups ?? [],
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
            info: false,
            work: true,
            services: true,
            about: true,
            aboutUs: true,
            experience: true,
            team: true,
            gallery: true,
            faq: true,
            contact: true,
            stack: true,
            tools: true,
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
        // logo-left-nav-contact: icon before label (distinct from editorial-bar default).
        if (
          navPatch.navLayoutDesign === 'logo-left-nav-contact' &&
          !('contactButtonIconPosition' in stored.navigation)
        ) {
          navPatch.contactButtonIconPosition = 'left';
        }
        if (navPatch.navLayoutDesign === 'editorial-bar') {
          const buttonInk = normalizePortfolioNavEditorialBarButtonInk(
            navPatch.editorialBarButtonInk,
            'principal'
          );
          const bindings = mergeNavColorBindings(
            DEFAULT_NAV_COLOR_BINDINGS,
            navPatch.navColorBindings
          );
          navPatch.editorialBarButtonInk = buttonInk;
          navPatch.navColorBindings = {
            ...bindings,
            activeAccent: buttonInk,
            contactText: buttonInk,
            contactBorder: buttonInk,
          };
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
    info: {
      ...mergeSectionCopy(defaults.info, stored.info),
      ...mergeInfoPresentation(defaults.info, stored.info),
    },
    work: (() => {
      const copy = mergeSectionCopy(defaults.work, stored.work);
      const legacyLongSubtitle =
        'A selection of projects that showcase my work, process, and the tools I use to bring ideas to life.';
      return {
        ...copy,
        subtitle:
          copy.subtitle.trim() === legacyLongSubtitle ? defaults.work.subtitle : copy.subtitle,
        ...mergeWorkPresentation(defaults.work, stored.work),
      };
    })(),
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
    tools: {
      ...mergeSectionCopy(defaults.tools, stored.tools),
      ...mergeToolsPresentation(defaults.tools, stored.tools),
    },
    stack: (() => {
      const copy = mergeSectionCopy(defaults.stack, stored.stack);
      const presentation = mergeStackPresentation(defaults.stack, stored.stack);
      const legacyTitle = copy.title.trim().toLocaleLowerCase() === 'stack';
      const title =
        presentation.titlePreset === 'tech-stack'
          ? 'Tech Stack'
          : presentation.titlePreset === 'core-stack' || legacyTitle
            ? 'Core Stack'
            : copy.title;
      const subtitle =
        presentation.design === 'brand-cards'
          ? presentation.subtitleCustom?.trim() ||
            copy.subtitle.trim() ||
            'Languages, frameworks, and platforms I use to ship reliable products.'
          : copy.subtitle;
      return {
        ...copy,
        ...presentation,
        title,
        subtitle,
      };
    })(),
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

  // Legacy Infos section removed from the portfolio.
  withActivePalette.about = {
    ...withActivePalette.about,
    enabled: false,
    showSidePanel: false,
  };

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
