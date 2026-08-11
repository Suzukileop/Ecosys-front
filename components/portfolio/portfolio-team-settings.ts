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
  applyTeamPaletteToSettings,
  DEFAULT_TEAM_COLOR_BINDINGS,
  DEFAULT_TEAM_PALETTE,
  mergeTeamColorBindings,
  mergeTeamPalette,
  teamCardReadableText,
  type PortfolioTeamColorBindings,
  type PortfolioTeamPalette,
} from '@/components/portfolio/portfolio-team-palette-settings';

export type PortfolioTeamLayout = 'meet-cards' | 'portrait-rail' | 'spotlight' | 'directory' | 'polaroid';
export type PortfolioTeamGap = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioTeamCardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioTeamCardPadding = 'none' | 'sm' | 'md' | 'lg';
export type PortfolioTeamCardShadow = 'none' | 'soft' | 'medium' | 'strong';
export type PortfolioTeamImageAspect = 'square' | 'portrait' | 'landscape' | 'auto';
export type PortfolioTeamImageFit = 'cover' | 'contain';
export type PortfolioTeamImagePosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type PortfolioTeamSocialIconSize = 'sm' | 'md' | 'lg';
export type PortfolioTeamSocialIconStyle = 'circle' | 'soft' | 'outline' | 'minimal';
export type PortfolioTeamHeaderAlignment = 'left' | 'center' | 'right';
export type PortfolioTeamHeaderFont = 'sans' | 'serif' | 'display';
export type PortfolioTeamTitlePreset = 'team' | 'meet-team' | 'people' | 'custom';
export type PortfolioTeamSubtitlePreset = 'default' | 'together' | 'expertise' | 'minimal' | 'custom';

/** How the section title relates to the team member grid. */
export type PortfolioTeamSectionLayout = 'stacked' | 'aside-left' | 'aside-right';

/** Decorative SVG beside the team content (`none` hides it). */
export type PortfolioTeamIllustrationVariant =
  | 'none'
  | 'chat'
  | 'question'
  | 'docs'
  | 'support'
  | 'hex';

export type PortfolioTeamIllustrationPlacement = 'left' | 'right';

export const PORTFOLIO_TEAM_SECTION_LAYOUTS = [
  'stacked',
  'aside-left',
  'aside-right',
] as const satisfies readonly PortfolioTeamSectionLayout[];

export const PORTFOLIO_TEAM_ILLUSTRATION_VARIANTS = [
  'none',
  'chat',
  'question',
  'docs',
  'support',
  'hex',
] as const satisfies readonly PortfolioTeamIllustrationVariant[];

export const PORTFOLIO_TEAM_ILLUSTRATION_PLACEMENTS = [
  'left',
  'right',
] as const satisfies readonly PortfolioTeamIllustrationPlacement[];

export type PortfolioTeamPresentationSettings = PortfolioSectionBackgroundSettings & {
  layout: PortfolioTeamLayout;
  columns: 1 | 2 | 3 | 4;
  gap: PortfolioTeamGap;
  cardRadius: PortfolioTeamCardRadius;
  cardPadding: PortfolioTeamCardPadding;
  cardShadow: PortfolioTeamCardShadow;
  cardBackgroundColor: string;
  cardBorderColor: string;
  imageAspect: PortfolioTeamImageAspect;
  imageFit: PortfolioTeamImageFit;
  imagePosition: PortfolioTeamImagePosition;
  showName: boolean;
  showResponsibility: boolean;
  showSocials: boolean;
  showImage: boolean;
  socialIconSize: PortfolioTeamSocialIconSize;
  socialIconStyle: PortfolioTeamSocialIconStyle;
  socialIconColor: string;
  socialBackgroundColor: string;
  nameColor: string;
  responsibilityColor: string;
  titlePreset: PortfolioTeamTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioTeamSubtitlePreset;
  subtitleCustom: string;
  headerAlignment: PortfolioTeamHeaderAlignment;
  /**
   * `stacked` — title above the team grid (default).
   * `aside-left` / `aside-right` — title beside the grid on large screens.
   */
  sectionLayout: PortfolioTeamSectionLayout;
  /** Decorative SVG beside the team content (`none` hides it). */
  illustrationVariant: PortfolioTeamIllustrationVariant;
  /** Side of the content for the decorative SVG on large screens. */
  illustrationPlacement: PortfolioTeamIllustrationPlacement;
  titleFont: PortfolioTeamHeaderFont;
  subtitleFont: PortfolioTeamHeaderFont;
  titleColor: string;
  subtitleColor: string;
  useHeroPalette: boolean;
  teamPalette?: PortfolioTeamPalette;
  teamColorBindings?: PortfolioTeamColorBindings;
  activeColorMode?: 'light' | 'dark';
};

export type PortfolioTeamSectionSettings = PortfolioSectionCopy & PortfolioTeamPresentationSettings;

export const PORTFOLIO_TEAM_LAYOUT_OPTIONS: {
  value: PortfolioTeamLayout;
  label: string;
  description: string;
}[] = [
  { value: 'meet-cards', label: 'Cartes centrées', description: 'Photos arrondies, ombre douce et icônes circulaires.' },
  { value: 'portrait-rail', label: 'Rail portraits', description: 'Grands portraits dans un rail horizontal tactile.' },
  { value: 'spotlight', label: 'Spotlight', description: 'Un membre à la une avec miniatures interactives.' },
  { value: 'directory', label: 'Annuaire', description: 'Lignes compactes avec avatar et liens à droite.' },
  { value: 'polaroid', label: 'Polaroid', description: 'Cartes décalées avec rotations CSS discrètes.' },
];

export const PORTFOLIO_TEAM_TITLE_PRESET_OPTIONS = [
  { value: 'team' as const, label: 'Notre équipe', description: 'Titre français par défaut.' },
  { value: 'meet-team' as const, label: 'Rencontrez l’équipe', description: 'Invitation chaleureuse.' },
  { value: 'people' as const, label: 'Les talents', description: 'Accent sur les personnes.' },
  { value: 'custom' as const, label: 'Personnalisé', description: 'Votre propre titre.' },
];

export const PORTFOLIO_TEAM_SUBTITLE_PRESET_OPTIONS = [
  { value: 'default' as const, label: 'Par défaut', description: 'Utilise le texte de section.' },
  { value: 'together' as const, label: 'Collectif', description: 'Une phrase sur la collaboration.' },
  { value: 'expertise' as const, label: 'Expertise', description: 'Met en avant les expertises complémentaires.' },
  { value: 'minimal' as const, label: 'Aucun', description: 'Masque le sous-titre.' },
  { value: 'custom' as const, label: 'Personnalisé', description: 'Votre propre sous-titre.' },
];

export const PORTFOLIO_TEAM_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioTeamSectionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Empilé',
    description: 'Titre au-dessus, membres en dessous.',
  },
  {
    value: 'aside-left',
    label: 'Titre à gauche',
    description: 'Titre à gauche, grille d’équipe à droite (côte à côte).',
  },
  {
    value: 'aside-right',
    label: 'Titre à droite',
    description: 'Grille d’équipe à gauche, titre à droite (côte à côte).',
  },
];

export const PORTFOLIO_TEAM_ILLUSTRATION_OPTIONS: {
  value: PortfolioTeamIllustrationVariant;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de SVG décoratif à côté du contenu.' },
  { value: 'chat', label: 'Chat', description: 'Bulles de conversation.' },
  { value: 'question', label: 'Question', description: 'Point d’interrogation graphique.' },
  { value: 'docs', label: 'Docs', description: 'Documents superposés.' },
  { value: 'support', label: 'Support', description: 'Illustration support.' },
  { value: 'hex', label: 'Hex', description: 'Symbole hexagonal.' },
];

export const PORTFOLIO_TEAM_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioTeamIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'SVG à gauche du contenu équipe.' },
  { value: 'right', label: 'Droite', description: 'SVG à droite du contenu équipe.' },
];

export function isPortfolioTeamSectionLayout(value: unknown): value is PortfolioTeamSectionLayout {
  return (
    typeof value === 'string' &&
    (PORTFOLIO_TEAM_SECTION_LAYOUTS as readonly string[]).includes(value)
  );
}

export function isPortfolioTeamIllustrationVariant(
  value: unknown
): value is PortfolioTeamIllustrationVariant {
  return (
    typeof value === 'string' &&
    (PORTFOLIO_TEAM_ILLUSTRATION_VARIANTS as readonly string[]).includes(value)
  );
}

export function isPortfolioTeamIllustrationPlacement(
  value: unknown
): value is PortfolioTeamIllustrationPlacement {
  return (
    typeof value === 'string' &&
    (PORTFOLIO_TEAM_ILLUSTRATION_PLACEMENTS as readonly string[]).includes(value)
  );
}

export function teamSectionLayoutIsAside(layout: PortfolioTeamSectionLayout | undefined): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

/** Two-column shell for title + team grid (large screens). */
export function teamAsideLayoutClass(layout: PortfolioTeamSectionLayout): string {
  if (layout === 'aside-right') {
    return 'grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
  }
  return 'grid w-full gap-10 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
}

export const DEFAULT_TEAM_PRESENTATION: PortfolioTeamPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  layout: 'meet-cards',
  columns: 3,
  gap: 'lg',
  cardRadius: 'xl',
  cardPadding: 'md',
  cardShadow: 'soft',
  cardBackgroundColor: '#ffffff',
  cardBorderColor: '#e5e5e5',
  imageAspect: 'portrait',
  imageFit: 'cover',
  imagePosition: 'center',
  showName: true,
  showResponsibility: true,
  showSocials: true,
  showImage: true,
  socialIconSize: 'md',
  socialIconStyle: 'circle',
  socialIconColor: '#171717',
  socialBackgroundColor: '#f5f5f5',
  nameColor: '#171717',
  responsibilityColor: '#737373',
  titlePreset: 'team',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  headerAlignment: 'center',
  sectionLayout: 'stacked',
  illustrationVariant: 'none',
  illustrationPlacement: 'right',
  titleFont: 'sans',
  subtitleFont: 'sans',
  titleColor: '#171717',
  subtitleColor: '#737373',
  useHeroPalette: true,
  teamPalette: { ...DEFAULT_TEAM_PALETTE },
  teamColorBindings: { ...DEFAULT_TEAM_COLOR_BINDINGS },
  activeColorMode: 'light',
};

Object.assign(DEFAULT_TEAM_PRESENTATION, applyTeamPaletteToSettings(DEFAULT_TEAM_PRESENTATION));

const SUBTITLE_COPY = {
  together: 'Des personnalités complémentaires réunies autour d’une même ambition.',
  expertise: 'Des expertises complémentaires pour donner vie à chaque projet.',
};

export function resolveTeamSectionTitle(
  settings: Pick<PortfolioTeamSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  if (settings.titlePreset === 'meet-team') return 'Rencontrez l’équipe';
  if (settings.titlePreset === 'people') return 'Les talents';
  if (settings.titlePreset === 'custom') return settings.titleCustom.trim() || settings.title.trim() || 'Notre équipe';
  return 'Notre équipe';
}

export function resolveTeamSectionSubtitle(
  settings: Pick<PortfolioTeamSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  if (settings.subtitlePreset === 'minimal') return '';
  if (settings.subtitlePreset === 'together') return SUBTITLE_COPY.together;
  if (settings.subtitlePreset === 'expertise') return SUBTITLE_COPY.expertise;
  if (settings.subtitlePreset === 'custom') return settings.subtitleCustom.trim() || settings.subtitle.trim();
  return settings.subtitle.trim();
}

export function teamHeaderFontClass(font: PortfolioTeamHeaderFont, kind: 'title' | 'subtitle'): string {
  if (font === 'serif') return kind === 'title' ? 'font-serif font-bold tracking-tight' : 'font-serif';
  if (font === 'display') return 'font-black uppercase tracking-[0.08em]';
  return kind === 'title' ? 'font-extrabold tracking-tight' : 'font-sans';
}

export function teamHeaderFontStyle(font: PortfolioTeamHeaderFont): CSSProperties | undefined {
  return font === 'serif' ? { fontFamily: "'Playfair Display', serif" } : undefined;
}

export function teamTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, '#171717') };
}

export function teamSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, '#737373') };
}

export function teamGridClass(columns: number, gap: PortfolioTeamGap): string {
  const cols = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'sm:grid-cols-2' : columns === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3';
  const gaps = gap === 'sm' ? 'gap-3' : gap === 'md' ? 'gap-5' : gap === 'xl' ? 'gap-10' : 'gap-7';
  return `grid ${cols} ${gaps}`;
}

export function teamCardClass(settings: PortfolioTeamPresentationSettings): string {
  const radius = { none: 'rounded-none', sm: 'rounded-lg', md: 'rounded-2xl', lg: 'rounded-3xl', xl: 'rounded-[2rem]' }[settings.cardRadius];
  const padding = { none: 'p-0', sm: 'p-3', md: 'p-5', lg: 'p-7' }[settings.cardPadding];
  const shadow = { none: '', soft: 'shadow-sm', medium: 'shadow-lg shadow-black/10', strong: 'shadow-2xl shadow-black/20' }[settings.cardShadow];
  return `${radius} ${padding} ${shadow} border overflow-hidden`;
}

export function teamCardStyle(settings: PortfolioTeamPresentationSettings): CSSProperties {
  return {
    backgroundColor: sanitizeHex(settings.cardBackgroundColor, '#ffffff'),
    borderColor: sanitizeHex(settings.cardBorderColor, '#e5e5e5'),
  };
}

export function teamReadableCardText(settings: PortfolioTeamPresentationSettings) {
  return teamCardReadableText(
    settings.cardBackgroundColor,
    sanitizeHex(settings.nameColor, '#171717'),
    sanitizeHex(settings.responsibilityColor, '#737373')
  );
}

function sanitizeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && isValidProfileHexColor(value) ? value.trim() : fallback;
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? value as T : fallback;
}

function clampColumns(value: unknown, fallback: 1 | 2 | 3 | 4): 1 | 2 | 3 | 4 {
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : fallback;
}

export function pickTeamPresentationSettings(team: unknown): PortfolioTeamPresentationSettings {
  return mergeTeamPresentation(DEFAULT_TEAM_PRESENTATION, team);
}

export function mergeTeamPresentation(
  base: PortfolioTeamPresentationSettings,
  patch: unknown
): PortfolioTeamPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const merged: PortfolioTeamPresentationSettings = {
    ...mergeSectionBackground(base, patch),
    layout: pick(record.layout, ['meet-cards', 'portrait-rail', 'spotlight', 'directory', 'polaroid'], base.layout),
    columns: clampColumns(record.columns, base.columns),
    gap: pick(record.gap, ['sm', 'md', 'lg', 'xl'], base.gap),
    cardRadius: pick(record.cardRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    cardShadow: pick(record.cardShadow, ['none', 'soft', 'medium', 'strong'], base.cardShadow),
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    imageAspect: pick(record.imageAspect, ['square', 'portrait', 'landscape', 'auto'], base.imageAspect),
    imageFit: pick(record.imageFit, ['cover', 'contain'], base.imageFit),
    imagePosition: pick(record.imagePosition, ['center', 'top', 'bottom', 'left', 'right'], base.imagePosition),
    showName: typeof record.showName === 'boolean' ? record.showName : base.showName,
    showResponsibility: typeof record.showResponsibility === 'boolean' ? record.showResponsibility : base.showResponsibility,
    showSocials: typeof record.showSocials === 'boolean' ? record.showSocials : base.showSocials,
    showImage: typeof record.showImage === 'boolean' ? record.showImage : base.showImage,
    socialIconSize: pick(record.socialIconSize, ['sm', 'md', 'lg'], base.socialIconSize),
    socialIconStyle: pick(record.socialIconStyle, ['circle', 'soft', 'outline', 'minimal'], base.socialIconStyle),
    socialIconColor: sanitizeHex(record.socialIconColor, base.socialIconColor),
    socialBackgroundColor: sanitizeHex(record.socialBackgroundColor, base.socialBackgroundColor),
    nameColor: sanitizeHex(record.nameColor, base.nameColor),
    responsibilityColor: sanitizeHex(record.responsibilityColor, base.responsibilityColor),
    titlePreset: pick(record.titlePreset, ['team', 'meet-team', 'people', 'custom'], base.titlePreset),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(record.subtitlePreset, ['default', 'together', 'expertise', 'minimal', 'custom'], base.subtitlePreset),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    headerAlignment: pick(record.headerAlignment, ['left', 'center', 'right'], base.headerAlignment),
    sectionLayout: isPortfolioTeamSectionLayout(record.sectionLayout)
      ? record.sectionLayout
      : (base.sectionLayout ?? 'stacked'),
    illustrationVariant: pick(
      record.illustrationVariant,
      PORTFOLIO_TEAM_ILLUSTRATION_VARIANTS,
      base.illustrationVariant ?? 'none'
    ),
    illustrationPlacement: pick(
      record.illustrationPlacement,
      PORTFOLIO_TEAM_ILLUSTRATION_PLACEMENTS,
      base.illustrationPlacement ?? 'right'
    ),
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    teamPalette: mergeTeamPalette(mergeTeamPalette(DEFAULT_TEAM_PALETTE, base.teamPalette), record.teamPalette),
    teamColorBindings: mergeTeamColorBindings(
      mergeTeamColorBindings(DEFAULT_TEAM_COLOR_BINDINGS, base.teamColorBindings),
      record.teamColorBindings
    ),
    activeColorMode: record.activeColorMode === 'dark' || record.activeColorMode === 'light' ? record.activeColorMode : base.activeColorMode,
  };
  return merged.useHeroPalette === false
    ? merged
    : { ...merged, ...applyTeamPaletteToSettings(merged), useHeroPalette: true };
}
