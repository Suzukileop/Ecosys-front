import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  applyNavPaletteToSettings,
  DEFAULT_NAV_COLOR_BINDINGS,
  DEFAULT_NAV_PALETTE,
  mergeNavColorBindings,
  mergeNavPalette,
} from '@/components/portfolio/portfolio-nav-palette-settings';
import type {
  PortfolioNavLayoutDesign,
  PortfolioNavSettings,
} from '@/components/portfolio/portfolio-settings-types';
import {
  DEFAULT_EDITORIAL_BAR_MAIL_CONTACT,
  DEFAULT_EDITORIAL_BAR_PHONE_CONTACT,
  DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES,
} from '@/components/portfolio/portfolio-settings-types';

export type { PortfolioNavLayoutDesign };

const FLOATING_PILL_BAR_FILL = '#ffffff';
const FLOATING_PILL_INK = '#1a1a1a';
const FLOATING_PILL_CONTACT_FILL = '#1a1a1a';
const FLOATING_PILL_CONTACT_INK = '#ffffff';

const TRI_ZONE_BAR_FILL = '#ffffff';
const TRI_ZONE_INK = '#1a1a1a';
const TRI_ZONE_BORDER = '#e5e5e5';
const TRI_ZONE_ICON_FILL = '#ffffff';

const SPLIT_BAR_FILL = 'transparent';
const SPLIT_INK = '#ffffff';
const SPLIT_BORDER = 'rgba(255,255,255,0.2)';

const LOGO_LEFT_BAR_FILL = '#ffffff';
const LOGO_LEFT_INK = '#1a1a1a';
const LOGO_LEFT_BORDER = '#e5e5e5';
const LOGO_LEFT_CONTACT_FILL = '#171717';
const LOGO_LEFT_CONTACT_INK = '#ffffff';

export const PORTFOLIO_NAV_LAYOUT_DESIGN_OPTIONS: {
  value: PortfolioNavLayoutDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Floating bar — placement, width, and extras follow Layout / Extras.',
  },
  {
    value: 'editorial-bar',
    label: '1 — Barre éditoriale',
    description:
      'Pleine largeur : logo ou nom à gauche, liens au centre, bouton contact à droite (gutter global).',
  },
  {
    value: 'floating-pill',
    label: '2 — Capsule flottante',
    description:
      'Pilule flottante neutre : logo à gauche, liens au centre, bouton contact contrasté à droite.',
  },
  {
    value: 'nav-logo-social',
    label: '3 — Nav · logo · social',
    description:
      'Pleine largeur : liens à gauche, logo au centre, icônes sociales à droite (jusqu’à 3).',
  },
  {
    value: 'center-logo-split',
    label: '4 — Logo centré · menus split',
    description:
      'Pleine largeur : liens répartis à gauche et à droite du logo, style barre hero.',
  },
  {
    value: 'logo-left-nav-contact',
    label: '5 — Logo gauche · nav + contact',
    description:
      'Pleine largeur : logo à gauche, liens de section à droite, bouton Contact en bout de barre.',
  },
  {
    value: 'case-overlay',
    label: '6 — Menu plein écran',
    description:
      'Barre minimaliste avec bascule Menu / Close. Overlay éditorial plein écran, numérotation et sous-liens.',
  },
  {
    value: 'duten-panel',
    label: '7 — Panneau Duten',
    description:
      'Panneau clair arrondi avec liens en colonnes, logo en haut à gauche et fermeture en haut à droite.',
  },
  {
    value: 'half-panel-left',
    label: '8 — Demi-panneau droit',
    description:
      'Icône menu en haut à droite — le tiroir éditorial s’ouvre depuis la droite (50 %).',
  },
];

export function portfolioNavLayoutDesignId(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign'>
): PortfolioNavLayoutDesign {
  return settings.navLayoutDesign ?? 'classic';
}

export function portfolioNavUsesEditorialBarLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  return settings.enabled && portfolioNavLayoutDesignId(settings) === 'editorial-bar';
}

export function portfolioNavUsesFloatingPillLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  return settings.enabled && portfolioNavLayoutDesignId(settings) === 'floating-pill';
}

export function portfolioNavFloatingPillShowsLogo(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled' | 'floatingPillShowLogo'>
): boolean {
  return portfolioNavUsesFloatingPillLayout(settings) && (settings.floatingPillShowLogo ?? false);
}

export function portfolioNavFloatingPillShowsContact(
  settings: Pick<
    PortfolioNavSettings,
    'navLayoutDesign' | 'enabled' | 'floatingPillShowContact' | 'contactButtonEnabled'
  >
): boolean {
  if (!portfolioNavUsesFloatingPillLayout(settings)) return false;
  return (settings.floatingPillShowContact ?? true) && (settings.contactButtonEnabled ?? false);
}

export function portfolioNavUsesTriZoneLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  return settings.enabled && portfolioNavLayoutDesignId(settings) === 'nav-logo-social';
}

export function portfolioNavUsesCenterLogoSplitLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  return settings.enabled && portfolioNavLayoutDesignId(settings) === 'center-logo-split';
}

export function portfolioNavUsesLogoLeftNavContactLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  return settings.enabled && portfolioNavLayoutDesignId(settings) === 'logo-left-nav-contact';
}

export function portfolioNavUsesCaseOverlayLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  return settings.enabled && portfolioNavLayoutDesignId(settings) === 'case-overlay';
}

export function portfolioNavUsesDutenPanelLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  return settings.enabled && portfolioNavLayoutDesignId(settings) === 'duten-panel';
}

export function portfolioNavUsesHalfPanelLeftLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  return settings.enabled && portfolioNavLayoutDesignId(settings) === 'half-panel-left';
}

export function portfolioNavUsesOverlayMenuLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  return (
    portfolioNavUsesCaseOverlayLayout(settings) ||
    portfolioNavUsesDutenPanelLayout(settings) ||
    portfolioNavUsesHalfPanelLeftLayout(settings)
  );
}

export function portfolioNavUsesStructuredBarLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  const id = portfolioNavLayoutDesignId(settings);
  return settings.enabled && (id === 'editorial-bar' || id === 'floating-pill');
}

/** Literal brand label shown in structured nav layouts (editorial, pill, tri-zone, split, logo-left). */
export const PORTFOLIO_NAV_IN_BAR_BRAND_LABEL = 'Logo';

export function portfolioNavUsesInBarBrandLayout(
  settings: Pick<PortfolioNavSettings, 'navLayoutDesign' | 'enabled'>
): boolean {
  if (!settings.enabled) return false;
  const id = portfolioNavLayoutDesignId(settings);
  return (
    id === 'editorial-bar' ||
    id === 'floating-pill' ||
    id === 'nav-logo-social' ||
    id === 'center-logo-split' ||
    id === 'logo-left-nav-contact' ||
    id === 'case-overlay' ||
    id === 'duten-panel' ||
    id === 'half-panel-left'
  );
}

function editorialBarBindings(
  navigation?: Pick<PortfolioNavSettings, 'navColorBindings' | 'editorialBarButtonInk'>
) {
  const buttonInk = navigation?.editorialBarButtonInk ?? 'principal';
  return {
    ...mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, navigation?.navColorBindings),
    activeAccent: buttonInk,
    contactBackground: 'fond' as const,
    contactText: buttonInk,
    contactBorder: buttonInk,
  };
}

function floatingPillBindings(
  navigation?: Pick<PortfolioNavSettings, 'navColorBindings'>
) {
  return {
    ...mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, navigation?.navColorBindings),
    barBackground: 'neutre' as const,
    barBorder: 'bordure' as const,
    itemText: 'texteFort' as const,
    itemIcon: 'texteFort' as const,
    itemBackground: 'neutre' as const,
    itemBorder: 'bordure' as const,
    itemHoverText: 'texteFort' as const,
    itemHoverIcon: 'texteFort' as const,
    itemHoverBackground: 'neutre' as const,
    itemHoverBorder: 'bordure' as const,
    activeAccent: 'principal' as const,
    contactBackground: 'texteFort' as const,
    contactText: 'neutre' as const,
    contactBorder: 'texteFort' as const,
    customExtraBackground: 'neutre' as const,
    customExtraText: 'texteFort' as const,
    customExtraBorder: 'bordure' as const,
  };
}

function triZoneBindings(navigation?: Pick<PortfolioNavSettings, 'navColorBindings'>) {
  return {
    ...mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, navigation?.navColorBindings),
    barBackground: 'neutre' as const,
    barBorder: 'bordure' as const,
    itemText: 'texteFort' as const,
    itemIcon: 'texteFort' as const,
    itemBackground: 'neutre' as const,
    itemBorder: 'bordure' as const,
    itemHoverText: 'texteFort' as const,
    itemHoverIcon: 'texteFort' as const,
    itemHoverBackground: 'neutre' as const,
    itemHoverBorder: 'bordure' as const,
    activeAccent: 'texteFort' as const,
    linkIconBackground: 'neutre' as const,
    linkIconColor: 'texteFort' as const,
    linkIconBorder: 'bordure' as const,
    contactBackground: 'neutre' as const,
    contactText: 'texteFort' as const,
    contactBorder: 'bordure' as const,
    customExtraBackground: 'neutre' as const,
    customExtraText: 'texteFort' as const,
    customExtraBorder: 'bordure' as const,
  };
}

function buildEditorialBarPatch(
  brandText: string,
  contactLabel: string,
  navigation?: Pick<
    PortfolioNavSettings,
    | 'navPalette'
    | 'navColorBindings'
    | 'useNavPalette'
    | 'customExtraText'
    | 'contactButtonLabel'
  >
): Partial<PortfolioNavSettings> {
  const structure: Partial<PortfolioNavSettings> = {
    navLayoutDesign: 'editorial-bar',
    placement: 'top-center',
    barWidth: 'full',
    barDesign: 'classic',
    contentMode: 'text',
    buttonDesign: 'clean',
    activeStyle: 'filled-pill',
    itemGap: 'lg',
    barBorderEnabled: false,
    barShadowEnabled: false,
    glassEffect: false,
    barPadding: 'md',
    buttonPadding: 'sm',
    itemBorderEnabled: false,
    presence: 'full',
    displayMode: 'always',
    edgeOffset: 'sm',
    customExtraEnabled: true,
    customExtraLayoutPlacement: 'free-side',
    customExtraSide: 'left',
    customExtraDisplay: 'text',
    customExtraText: brandText,
    customExtraShape: 'soft',
    customExtraBorderEnabled: false,
    customExtraPaddingX: 0,
    customExtraPaddingY: 0,
    customExtraFontSizePx: 15,
    customExtraFontWeight: 'semibold',
    customExtraColorsManual: true,
    customExtraBackgroundColor: 'transparent',
    customExtraTextColor: '#ffffff',
    contactButtonEnabled: true,
    contactButtonDetached: false,
    contactButtonSide: 'right',
    contactExtrasPlacement: 'free-side',
    contactButtonDisplay: 'button',
    contactButtonShape: 'bottom-line',
    contactButtonIcon: 'arrow-up-right',
    contactButtonIconPosition: 'right',
    contactButtonBorderEnabled: true,
    contactButtonGlassEffect: false,
    contactButtonShadowEnabled: false,
    contactButtonLabel: contactLabel,
    linkIconsEnabled: false,
    editorialBarSlotMode: 'contact',
    editorialBarShowSocial: false,
    editorialBarShowPhone: true,
    editorialBarShowMail: false,
    editorialBarContactLink: 'phone',
    editorialBarPhoneContact: {
      label: "Let's Talk",
      display: 'button',
      icon: 'arrow-up-right',
      iconPosition: 'right',
      shape: 'bottom-line',
    },
    editorialBarMailContact: { ...DEFAULT_EDITORIAL_BAR_MAIL_CONTACT },
    editorialBarButtonInk: 'principal',
    extrasPlacement: 'free-side',
    navColorBindings: editorialBarBindings({ ...navigation, editorialBarButtonInk: 'principal' }),
  };

  if (navigation?.useNavPalette === false) {
    return {
      ...structure,
      contactButtonBackgroundColor: 'transparent',
      contactButtonColor: '#ffffff',
      contactButtonBorderColor: '#ffffff',
    };
  }

  const paletteSync = applyNavPaletteToSettings({
    ...navigation,
    navColorBindings: editorialBarBindings({ ...navigation, editorialBarButtonInk: 'principal' }),
    customExtraColorsManual: true,
  });
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation?.navPalette);
  const brandInk = resolveHeroPaletteColor(palette, 'texteFort');

  return {
    ...structure,
    ...paletteSync,
    useNavPalette: true,
    customExtraColorsManual: true,
    customExtraBackgroundColor: 'transparent',
    customExtraTextColor: brandInk,
    contactButtonBackgroundColor: 'transparent',
    contactButtonBorderEnabled: true,
    contactButtonShadowEnabled: false,
  };
}

function buildFloatingPillPatch(
  brandText: string,
  contactLabel: string,
  navigation?: Pick<
    PortfolioNavSettings,
    | 'navPalette'
    | 'navColorBindings'
    | 'useNavPalette'
    | 'customExtraText'
    | 'contactButtonLabel'
  >
): Partial<PortfolioNavSettings> {
  const structure: Partial<PortfolioNavSettings> = {
    navLayoutDesign: 'floating-pill',
    placement: 'top-center',
    barWidth: 'hug',
    barDesign: 'classic',
    contentMode: 'text',
    buttonDesign: 'clean',
    activeStyle: 'accent-text',
    labelCase: 'titlecase',
    itemGap: 'lg',
    barBorderEnabled: false,
    barShadowEnabled: true,
    barShadowStrength: 'md',
    glassEffect: false,
    navBarSurface: 'neutre',
    barPadding: 'md',
    buttonPadding: 'sm',
    itemBorderEnabled: false,
    presence: 'full',
    displayMode: 'always',
    edgeOffset: 'md',
    customExtraEnabled: false,
    customExtraLayoutPlacement: 'free-side',
    customExtraSide: 'left',
    customExtraDisplay: 'text',
    customExtraText: brandText,
    customExtraShape: 'soft',
    customExtraBorderEnabled: false,
    customExtraPaddingX: 0,
    customExtraPaddingY: 0,
    customExtraLogoSizePx: 22,
    customExtraGapPx: 0,
    customExtraFontSizePx: 14,
    customExtraFontWeight: 'semibold',
    customExtraColorsManual: true,
    customExtraBackgroundColor: 'transparent',
    customExtraTextColor: FLOATING_PILL_INK,
    contactButtonEnabled: true,
    contactButtonDetached: false,
    contactButtonSide: 'right',
    contactExtrasPlacement: 'free-side',
    contactButtonDisplay: 'button',
    contactButtonShape: 'pill',
    contactButtonIcon: 'none',
    contactButtonBorderEnabled: false,
    contactButtonGlassEffect: false,
    contactButtonShadowEnabled: false,
    contactButtonLabel: contactLabel,
    linkIconsEnabled: false,
    extrasPlacement: 'free-side',
    floatingPillShowLogo: false,
    floatingPillShowContact: true,
    mobileLayout: 'brand-bar',
    navColorBindings: floatingPillBindings(navigation),
  };

  if (navigation?.useNavPalette === false) {
    return {
      ...structure,
      barBackgroundColor: FLOATING_PILL_BAR_FILL,
      itemTextColor: FLOATING_PILL_INK,
      itemIconColor: FLOATING_PILL_INK,
      itemBackgroundColor: 'transparent',
      itemHoverBackgroundColor: 'transparent',
      activeAccentColor: FLOATING_PILL_INK,
      contactButtonBackgroundColor: FLOATING_PILL_CONTACT_FILL,
      contactButtonColor: FLOATING_PILL_CONTACT_INK,
    };
  }

  const paletteSync = applyNavPaletteToSettings({
    ...navigation,
    navColorBindings: floatingPillBindings(navigation),
    customExtraColorsManual: true,
  });

  return {
    ...structure,
    ...paletteSync,
    useNavPalette: true,
    customExtraColorsManual: true,
    itemBackgroundColor: 'transparent',
    itemHoverBackgroundColor: 'transparent',
    customExtraBackgroundColor: 'transparent',
    contactButtonBorderEnabled: false,
    contactButtonShadowEnabled: false,
  };
}

function splitLogoBindings(navigation?: Pick<PortfolioNavSettings, 'navColorBindings'>) {
  return {
    ...mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, navigation?.navColorBindings),
    barBackground: 'neutre' as const,
    barBorder: 'bordure' as const,
    itemText: 'texteFort' as const,
    itemIcon: 'texteFort' as const,
    itemBackground: 'neutre' as const,
    itemBorder: 'bordure' as const,
    itemHoverText: 'texteFort' as const,
    itemHoverIcon: 'texteFort' as const,
    itemHoverBackground: 'neutre' as const,
    itemHoverBorder: 'bordure' as const,
    activeAccent: 'principal' as const,
    customExtraBackground: 'neutre' as const,
    customExtraText: 'texteFort' as const,
    customExtraBorder: 'bordure' as const,
  };
}

function logoLeftNavContactBindings(
  navigation?: Pick<PortfolioNavSettings, 'navColorBindings'>
) {
  return {
    ...mergeNavColorBindings(DEFAULT_NAV_COLOR_BINDINGS, navigation?.navColorBindings),
    barBackground: 'neutre' as const,
    barBorder: 'bordure' as const,
    itemText: 'texteFort' as const,
    itemIcon: 'texteFort' as const,
    itemBackground: 'neutre' as const,
    itemBorder: 'bordure' as const,
    itemHoverText: 'texteFort' as const,
    itemHoverIcon: 'texteFort' as const,
    itemHoverBackground: 'neutre' as const,
    itemHoverBorder: 'bordure' as const,
    activeAccent: 'principal' as const,
    contactBackground: 'principal' as const,
    contactText: 'texteFort' as const,
    contactBorder: 'principal' as const,
    customExtraBackground: 'neutre' as const,
    customExtraText: 'texteFort' as const,
    customExtraBorder: 'bordure' as const,
  };
}

function buildLogoLeftNavContactPatch(
  brandText: string,
  contactLabel: string,
  navigation?: Pick<
    PortfolioNavSettings,
    | 'navPalette'
    | 'navColorBindings'
    | 'useNavPalette'
    | 'customExtraText'
    | 'contactButtonLabel'
  >
): Partial<PortfolioNavSettings> {
  const structure: Partial<PortfolioNavSettings> = {
    navLayoutDesign: 'logo-left-nav-contact',
    placement: 'top-center',
    barWidth: 'full',
    barDesign: 'classic',
    contentMode: 'text',
    buttonDesign: 'clean',
    activeStyle: 'filled-pill',
    labelCase: 'titlecase',
    itemGap: 'lg',
    barBorderEnabled: false,
    barShadowEnabled: false,
    glassEffect: false,
    barPadding: 'md',
    buttonPadding: 'sm',
    itemBorderEnabled: false,
    presence: 'full',
    displayMode: 'always',
    edgeOffset: 'sm',
    logoLeftNavContactLogoSide: 'left',
    customExtraEnabled: true,
    customExtraLayoutPlacement: 'free-side',
    customExtraSide: 'left',
    customExtraDisplay: 'text',
    customExtraText: brandText,
    customExtraShape: 'soft',
    customExtraBorderEnabled: false,
    customExtraPaddingX: 0,
    customExtraPaddingY: 0,
    customExtraLogoSizePx: 24,
    customExtraGapPx: 0,
    customExtraFontSizePx: 16,
    customExtraFontWeight: 'semibold',
    customExtraColorsManual: true,
    customExtraBackgroundColor: 'transparent',
    customExtraTextColor: LOGO_LEFT_INK,
    contactButtonEnabled: true,
    contactButtonDetached: false,
    contactButtonSide: 'right',
    contactExtrasPlacement: 'free-side',
    contactButtonDisplay: 'button',
    contactButtonShape: 'rounded',
    contactButtonIcon: 'phone',
    contactButtonIconPosition: 'left',
    contactButtonBorderEnabled: false,
    contactButtonGlassEffect: false,
    contactButtonShadowEnabled: false,
    contactButtonLabel: contactLabel,
    linkIconsEnabled: false,
    extrasPlacement: 'free-side',
    navColorBindings: logoLeftNavContactBindings(navigation),
  };

  if (navigation?.useNavPalette === false) {
    return {
      ...structure,
      barBackgroundColor: LOGO_LEFT_BAR_FILL,
      barBorderColor: LOGO_LEFT_BORDER,
      itemTextColor: LOGO_LEFT_INK,
      itemIconColor: LOGO_LEFT_INK,
      itemBackgroundColor: 'transparent',
      itemHoverBackgroundColor: 'transparent',
      activeAccentColor: LOGO_LEFT_CONTACT_FILL,
      contactButtonBackgroundColor: LOGO_LEFT_CONTACT_FILL,
      contactButtonColor: LOGO_LEFT_CONTACT_INK,
      contactButtonBorderColor: LOGO_LEFT_CONTACT_FILL,
      contactButtonIconPosition: 'left',
    };
  }

  const paletteSync = applyNavPaletteToSettings({
    ...navigation,
    navColorBindings: logoLeftNavContactBindings(navigation),
    customExtraColorsManual: true,
  });
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation?.navPalette);
  const brandInk = resolveHeroPaletteColor(palette, 'texteFort');
  const accent = resolveHeroPaletteColor(palette, 'principal');
  const onAccent = resolveHeroPaletteColor(palette, 'neutre');

  return {
    ...structure,
    ...paletteSync,
    useNavPalette: true,
    customExtraColorsManual: true,
    barBackgroundColor: LOGO_LEFT_BAR_FILL,
    barBorderColor: LOGO_LEFT_BORDER,
    itemTextColor: brandInk,
    itemIconColor: brandInk,
    itemBackgroundColor: 'transparent',
    itemHoverBackgroundColor: 'transparent',
    itemHoverTextColor: brandInk,
    itemHoverIconColor: brandInk,
    activeAccentColor: accent,
    customExtraBackgroundColor: 'transparent',
    customExtraTextColor: brandInk,
    contactButtonBackgroundColor: accent,
    contactButtonColor: onAccent,
    contactButtonBorderColor: accent,
    contactButtonBorderEnabled: false,
    contactButtonIconPosition: 'left',
  };
}

function buildCenterLogoSplitPatch(
  brandText: string,
  navigation?: Pick<
    PortfolioNavSettings,
    | 'navPalette'
    | 'navColorBindings'
    | 'useNavPalette'
    | 'customExtraText'
  >
): Partial<PortfolioNavSettings> {
  const structure: Partial<PortfolioNavSettings> = {
    navLayoutDesign: 'center-logo-split',
    placement: 'top-center',
    barWidth: 'full',
    barDesign: 'classic',
    contentMode: 'text',
    buttonDesign: 'clean',
    activeStyle: 'accent-text',
    labelCase: 'titlecase',
    itemGap: 'lg',
    barBorderEnabled: false,
    barShadowEnabled: false,
    glassEffect: false,
    barPadding: 'md',
    buttonPadding: 'sm',
    itemBorderEnabled: false,
    presence: 'full',
    displayMode: 'always',
    edgeOffset: 'sm',
    customExtraEnabled: true,
    customExtraLayoutPlacement: 'free-side',
    customExtraSide: 'left',
    customExtraDisplay: 'text',
    customExtraText: brandText,
    customExtraShape: 'soft',
    customExtraBorderEnabled: false,
    customExtraPaddingX: 0,
    customExtraPaddingY: 0,
    customExtraLogoSizePx: 24,
    customExtraGapPx: 0,
    customExtraFontSizePx: 15,
    customExtraFontWeight: 'semibold',
    customExtraColorsManual: true,
    customExtraBackgroundColor: 'transparent',
    customExtraTextColor: SPLIT_INK,
    contactButtonEnabled: false,
    linkIconsEnabled: false,
    splitNavLeftSectionKeys: [],
    extrasPlacement: 'free-side',
    navColorBindings: splitLogoBindings(navigation),
  };

  if (navigation?.useNavPalette === false) {
    return {
      ...structure,
      barBackgroundColor: SPLIT_BAR_FILL,
      barBorderColor: SPLIT_BORDER,
      itemTextColor: SPLIT_INK,
      itemIconColor: SPLIT_INK,
      itemBackgroundColor: 'transparent',
      itemHoverBackgroundColor: 'transparent',
      activeAccentColor: SPLIT_INK,
      customExtraBackgroundColor: 'transparent',
      customExtraTextColor: SPLIT_INK,
    };
  }

  const paletteSync = applyNavPaletteToSettings({
    ...navigation,
    navColorBindings: splitLogoBindings(navigation),
    customExtraColorsManual: true,
  });
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation?.navPalette);
  const brandInk = resolveHeroPaletteColor(palette, 'texteFort');

  return {
    ...structure,
    ...paletteSync,
    useNavPalette: true,
    customExtraColorsManual: true,
    itemBackgroundColor: 'transparent',
    itemHoverBackgroundColor: 'transparent',
    customExtraBackgroundColor: 'transparent',
    customExtraTextColor: brandInk,
  };
}

function buildTriZonePatch(
  brandText: string,
  navigation?: Pick<
    PortfolioNavSettings,
    | 'navPalette'
    | 'navColorBindings'
    | 'useNavPalette'
    | 'customExtraText'
    | 'contactButtonLabel'
  >
): Partial<PortfolioNavSettings> {
  const structure: Partial<PortfolioNavSettings> = {
    navLayoutDesign: 'nav-logo-social',
    placement: 'top-center',
    barWidth: 'full',
    barDesign: 'classic',
    contentMode: 'text',
    buttonDesign: 'clean',
    activeStyle: 'accent-text',
    labelCase: 'normal',
    itemGap: 'md',
    barBorderEnabled: false,
    barShadowEnabled: false,
    glassEffect: false,
    barPadding: 'md',
    buttonPadding: 'sm',
    navBarHeight: 'sm',
    itemBorderEnabled: false,
    presence: 'full',
    displayMode: 'always',
    edgeOffset: 'sm',
    customExtraEnabled: true,
    customExtraLayoutPlacement: 'free-side',
    customExtraSide: 'left',
    customExtraDisplay: 'text',
    customExtraText: brandText,
    customExtraShape: 'soft',
    customExtraBorderEnabled: false,
    customExtraPaddingX: 0,
    customExtraPaddingY: 0,
    customExtraLogoSizePx: 22,
    customExtraGapPx: 0,
    customExtraFontSizePx: 14,
    customExtraFontWeight: 'semibold',
    customExtraColorsManual: true,
    customExtraBackgroundColor: 'transparent',
    customExtraTextColor: TRI_ZONE_INK,
    contactButtonEnabled: false,
    linkIconsEnabled: true,
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
    editorialBarPhoneContact: { ...DEFAULT_EDITORIAL_BAR_PHONE_CONTACT },
    editorialBarMailContact: { ...DEFAULT_EDITORIAL_BAR_MAIL_CONTACT },
    extrasPlacement: 'free-side',
    navColorBindings: triZoneBindings(navigation),
  };

  if (navigation?.useNavPalette === false) {
    return {
      ...structure,
      barBackgroundColor: TRI_ZONE_BAR_FILL,
      barBorderColor: TRI_ZONE_BORDER,
      itemTextColor: TRI_ZONE_INK,
      itemIconColor: TRI_ZONE_INK,
      itemBackgroundColor: 'transparent',
      itemHoverBackgroundColor: 'transparent',
      activeAccentColor: TRI_ZONE_INK,
      linkIconBackgroundColor: TRI_ZONE_ICON_FILL,
      linkIconColor: TRI_ZONE_INK,
      linkIconBorderColor: TRI_ZONE_BORDER,
      contactButtonBackgroundColor: TRI_ZONE_ICON_FILL,
      contactButtonColor: TRI_ZONE_INK,
      contactButtonBorderColor: TRI_ZONE_BORDER,
      contactButtonBorderEnabled: true,
      contactButtonDisplay: 'icon',
      contactButtonIcon: 'phone',
      contactButtonShape: 'pill',
      contactButtonShadowEnabled: false,
    };
  }

  const paletteSync = applyNavPaletteToSettings({
    ...navigation,
    navColorBindings: triZoneBindings(navigation),
    customExtraColorsManual: true,
  });

  return {
    ...structure,
    ...paletteSync,
    useNavPalette: true,
    customExtraColorsManual: true,
    itemBackgroundColor: 'transparent',
    itemHoverBackgroundColor: 'transparent',
    customExtraBackgroundColor: 'transparent',
    contactButtonBorderEnabled: true,
    contactButtonDisplay: 'icon',
    contactButtonIcon: 'phone',
    contactButtonShape: 'pill',
    contactButtonShadowEnabled: false,
  };
}

/**
 * Apply a layout design preset. Structural chrome only — colors sync from Nav palette when enabled.
 */
function buildCaseOverlayPatch(
  _brandText: string,
  navigation?: Pick<
    PortfolioNavSettings,
    'navPalette' | 'navColorBindings' | 'useNavPalette' | 'customExtraLogoUrl'
  >
): Partial<PortfolioNavSettings> {
  const structure: Partial<PortfolioNavSettings> = {
    navLayoutDesign: 'case-overlay',
    placement: 'top-center',
    barWidth: 'full',
    barDesign: 'classic',
    contentMode: 'text',
    buttonDesign: 'clean',
    activeStyle: 'accent-text',
    labelCase: 'uppercase',
    labelFontSize: 'md',
    itemGap: 'md',
    barBorderEnabled: false,
    barShadowEnabled: false,
    glassEffect: true,
    barPadding: 'sm',
    buttonPadding: 'sm',
    itemBorderEnabled: false,
    presence: 'full',
    displayMode: 'always',
    edgeOffset: 'sm',
    navBarSurface: 'transparent',
    customExtraEnabled: true,
    customExtraLayoutPlacement: 'free-side',
    customExtraSide: 'left',
    customExtraDisplay: 'logo',
    customExtraText: '',
    customExtraLogoUrl: navigation?.customExtraLogoUrl ?? '',
    customExtraShape: 'soft',
    customExtraBorderEnabled: false,
    customExtraPaddingX: 0,
    customExtraPaddingY: 0,
    customExtraLogoSizePx: 28,
    customExtraGapPx: 0,
    customExtraFontSizePx: 14,
    customExtraColorsManual: true,
    contactButtonEnabled: false,
    mobileLayout: 'drawer',
    caseOverlayMenuSide: 'right',
    caseOverlayMenuTrigger: 'text',
    menuControlIcon: 'menu',
  };

  if (navigation?.useNavPalette === false) {
    return {
      ...structure,
      barBackgroundColor: 'rgba(10,10,10,0.78)',
      itemTextColor: '#fafafa',
      itemIconColor: '#fafafa',
      activeAccentColor: '#f29107',
      customExtraTextColor: '#fafafa',
    };
  }

  const paletteSync = applyNavPaletteToSettings({
    ...navigation,
    customExtraColorsManual: true,
  });
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation?.navPalette);
  const brandInk = resolveHeroPaletteColor(palette, 'texteFort');

  return {
    ...structure,
    ...paletteSync,
    useNavPalette: true,
    customExtraColorsManual: true,
    customExtraTextColor: brandInk,
    itemBackgroundColor: 'transparent',
    itemHoverBackgroundColor: 'transparent',
  };
}

function buildDutenPanelPatch(
  _brandText: string,
  navigation?: Pick<
    PortfolioNavSettings,
    'navPalette' | 'navColorBindings' | 'useNavPalette' | 'customExtraLogoUrl'
  >
): Partial<PortfolioNavSettings> {
  const structure: Partial<PortfolioNavSettings> = {
    navLayoutDesign: 'duten-panel',
    placement: 'top-center',
    barWidth: 'full',
    barDesign: 'classic',
    contentMode: 'text',
    buttonDesign: 'clean',
    activeStyle: 'accent-text',
    labelCase: 'titlecase',
    labelFontSize: 'lg',
    itemGap: 'lg',
    barBorderEnabled: false,
    barShadowEnabled: false,
    glassEffect: false,
    barPadding: 'sm',
    buttonPadding: 'sm',
    itemBorderEnabled: false,
    presence: 'full',
    displayMode: 'always',
    edgeOffset: 'sm',
    navBarSurface: 'transparent',
    customExtraEnabled: true,
    customExtraLayoutPlacement: 'free-side',
    customExtraSide: 'left',
    customExtraDisplay: 'logo',
    customExtraText: '',
    customExtraLogoUrl: navigation?.customExtraLogoUrl ?? '',
    customExtraShape: 'soft',
    customExtraBorderEnabled: false,
    customExtraPaddingX: 0,
    customExtraPaddingY: 0,
    customExtraLogoSizePx: 32,
    customExtraGapPx: 0,
    customExtraFontSizePx: 14,
    customExtraColorsManual: true,
    contactButtonEnabled: false,
    mobileLayout: 'drawer',
    caseOverlayMenuSide: 'right',
    caseOverlayMenuTrigger: 'text',
    menuControlIcon: 'menu',
    dutenPanelColumns: 2,
    dutenPanelShowContact: false,
    dutenPanelShowSocial: false,
    dutenPanelSocialLinkIds: [],
    dutenPanelShowHeroWord: false,
    dutenPanelHeroWord: '',
  };

  if (navigation?.useNavPalette === false) {
    return {
      ...structure,
      barBackgroundColor: 'transparent',
      itemTextColor: '#171717',
      itemIconColor: '#171717',
      activeAccentColor: '#171717',
      customExtraTextColor: '#171717',
    };
  }

  const paletteSync = applyNavPaletteToSettings({
    ...navigation,
    customExtraColorsManual: true,
  });
  const palette = mergeNavPalette(DEFAULT_NAV_PALETTE, navigation?.navPalette);
  const brandInk = resolveHeroPaletteColor(palette, 'texteFort');

  return {
    ...structure,
    ...paletteSync,
    useNavPalette: true,
    customExtraColorsManual: true,
    customExtraTextColor: brandInk,
    itemBackgroundColor: 'transparent',
    itemHoverBackgroundColor: 'transparent',
  };
}

const HALF_PANEL_SAGE_NEUTRE = '#C8C9B8';
const HALF_PANEL_SAGE_BORDER = '#B5B6A6';

function buildHalfPanelLeftPatch(
  _brandText: string,
  navigation?: Pick<
    PortfolioNavSettings,
    'navPalette' | 'navColorBindings' | 'useNavPalette' | 'customExtraLogoUrl'
  >
): Partial<PortfolioNavSettings> {
  const structure: Partial<PortfolioNavSettings> = {
    navLayoutDesign: 'half-panel-left',
    placement: 'top-center',
    barWidth: 'full',
    barDesign: 'classic',
    contentMode: 'text',
    buttonDesign: 'clean',
    activeStyle: 'underline',
    labelCase: 'titlecase',
    labelFontSize: 'lg',
    itemGap: 'lg',
    barBorderEnabled: false,
    barShadowEnabled: false,
    glassEffect: false,
    barPadding: 'sm',
    buttonPadding: 'sm',
    itemBorderEnabled: false,
    presence: 'full',
    displayMode: 'always',
    edgeOffset: 'sm',
    navBarSurface: 'transparent',
    customExtraEnabled: true,
    customExtraLayoutPlacement: 'free-side',
    customExtraSide: 'left',
    customExtraDisplay: 'logo',
    customExtraText: '',
    customExtraLogoUrl: navigation?.customExtraLogoUrl ?? '',
    customExtraShape: 'soft',
    customExtraBorderEnabled: false,
    customExtraPaddingX: 0,
    customExtraPaddingY: 0,
    customExtraLogoSizePx: 32,
    customExtraGapPx: 0,
    customExtraFontSizePx: 14,
    customExtraColorsManual: true,
    contactButtonEnabled: false,
    mobileLayout: 'drawer',
    caseOverlayMenuSide: 'right',
    caseOverlayMenuTrigger: 'icon',
    menuControlIcon: 'menu',
    dutenPanelColumns: 2,
    dutenPanelShowContact: true,
    dutenPanelShowSocial: true,
    dutenPanelSocialLinkIds: [],
    halfPanelDiscoverLabel: 'Discover Pages',
  };

  if (navigation?.useNavPalette === false) {
    return {
      ...structure,
      barBackgroundColor: 'transparent',
      itemTextColor: '#1a1a1a',
      itemIconColor: '#1a1a1a',
      activeAccentColor: '#1a1a1a',
      customExtraTextColor: '#1a1a1a',
      navPalette: mergeNavPalette(DEFAULT_NAV_PALETTE, {
        neutre: HALF_PANEL_SAGE_NEUTRE,
        bordure: HALF_PANEL_SAGE_BORDER,
        texteFort: '#1a1a1a',
        texteMuted: '#4a4a44',
        fond: '#1a1a1a',
        principal: '#1a1a1a',
      }),
    };
  }

  const sageBase = mergeNavPalette(DEFAULT_NAV_PALETTE, {
    neutre: HALF_PANEL_SAGE_NEUTRE,
    bordure: HALF_PANEL_SAGE_BORDER,
    texteFort: '#1a1a1a',
    texteMuted: '#5c5c54',
  });
  const paletteSync = applyNavPaletteToSettings({
    ...navigation,
    navPalette: mergeNavPalette(sageBase, navigation?.navPalette),
    customExtraColorsManual: true,
  });
  const palette = mergeNavPalette(sageBase, navigation?.navPalette);
  const brandInk = resolveHeroPaletteColor(palette, 'texteFort');

  return {
    ...structure,
    ...paletteSync,
    useNavPalette: true,
    customExtraColorsManual: true,
    customExtraTextColor: brandInk,
    itemBackgroundColor: 'transparent',
    itemHoverBackgroundColor: 'transparent',
  };
}

export function portfolioNavLayoutDesignPatch(
  design: PortfolioNavLayoutDesign,
  navigation?: Pick<
    PortfolioNavSettings,
    | 'navPalette'
    | 'navColorBindings'
    | 'useNavPalette'
    | 'customExtraText'
    | 'customExtraLogoUrl'
    | 'contactButtonLabel'
  >,
  opts?: { brandText?: string }
): Partial<PortfolioNavSettings> {
  if (design === 'classic') {
    return { navLayoutDesign: 'classic', labelCase: 'normal' };
  }

  const brandText =
    opts?.brandText?.trim() ||
    navigation?.customExtraText?.trim() ||
    'NoProblem';

  if (design === 'floating-pill') {
    const contactLabel =
      (navigation?.contactButtonLabel ?? 'hello@email.com').trim() || 'hello@email.com';
    return buildFloatingPillPatch(brandText, contactLabel, navigation);
  }

  if (design === 'nav-logo-social') {
    return buildTriZonePatch(brandText, navigation);
  }

  if (design === 'center-logo-split') {
    return buildCenterLogoSplitPatch(brandText, navigation);
  }

  if (design === 'logo-left-nav-contact') {
    const contactLabel =
      (navigation?.contactButtonLabel ?? 'Contact').trim() || 'Contact';
    return buildLogoLeftNavContactPatch(brandText, contactLabel, navigation);
  }

  if (design === 'case-overlay') {
    return buildCaseOverlayPatch(brandText, navigation);
  }

  if (design === 'duten-panel') {
    return buildDutenPanelPatch(brandText, navigation);
  }

  if (design === 'half-panel-left') {
    return buildHalfPanelLeftPatch(brandText, navigation);
  }

  const contactLabel = (navigation?.contactButtonLabel ?? "Let's Talk").trim() || "Let's Talk";
  return buildEditorialBarPatch(brandText, contactLabel, navigation);
}
