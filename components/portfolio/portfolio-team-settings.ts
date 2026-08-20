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

export type PortfolioTeamLayout = 'meet-cards' | 'portrait-rail' | 'spotlight' | 'directory' | 'polaroid' | 'profile-cards' | 'hover-cards' | 'avatar-cards' | 'cover-cards' | 'float-cards';
export type PortfolioTeamGap = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioTeamCardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioTeamCardPadding = 'none' | 'sm' | 'md' | 'lg';
export type PortfolioTeamCardMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type PortfolioTeamListAlign = 'left' | 'center' | 'right';
export type PortfolioTeamAvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioTeamCardShadow = 'none' | 'soft' | 'medium' | 'strong';
export type PortfolioTeamCardBorder = 'none' | 'thin' | 'medium';
export type PortfolioTeamImageAspect = 'square' | 'portrait' | 'landscape' | 'auto';
export type PortfolioTeamImageFit = 'cover' | 'contain';
export type PortfolioTeamImagePosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type PortfolioTeamSocialIconSize = 'sm' | 'md' | 'lg' | 'xl';
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
  cardMaxWidth: PortfolioTeamCardMaxWidth;
  listAlign: PortfolioTeamListAlign;
  avatarSize: PortfolioTeamAvatarSize;
  cardShadow: PortfolioTeamCardShadow;
  cardBorder: PortfolioTeamCardBorder;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderColor: string;
  /** Directory: separate member cards instead of one list frame. */
  directoryDetachedCards: boolean;
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
  { value: 'portrait-rail', label: 'Rail portraits', description: 'Grands portraits dans un rail horizontal tactile.' },
  { value: 'spotlight', label: 'Spotlight', description: 'Un membre à la une avec miniatures interactives.' },
  { value: 'directory', label: 'Annuaire', description: 'Lignes compactes avec avatar et liens à droite.' },
  { value: 'polaroid', label: 'Polaroid', description: 'Cartes décalées avec rotations CSS discrètes.' },
  { value: 'profile-cards', label: 'Cartes profil', description: 'Portrait en haut, nom et réseaux centrés en bas.' },
  { value: 'hover-cards', label: 'Cartes survol', description: 'Portraits seuls ; nom, rôle et liens apparaissent au survol.' },
  { value: 'cover-cards', label: 'Voile survol', description: 'Portrait seul ; un voile sombre révèle nom, rôle et liens au survol.' },
  { value: 'avatar-cards', label: 'Cartes avatar', description: 'Avatar circulaire, nom, rôle et réseaux centrés.' },
  { value: 'float-cards', label: 'Cartes flottantes', description: 'Avatar chevauchant la carte ; nom, rôle et liens toujours visibles.' },
];

export const PORTFOLIO_TEAM_GAP_OPTIONS: {
  value: PortfolioTeamGap;
  label: string;
}[] = [
  { value: 'sm', label: 'Serré' },
  { value: 'md', label: 'Moyen' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Très large' },
];

export const PORTFOLIO_TEAM_TITLE_PRESET_OPTIONS = [
  { value: 'team' as const, label: 'Our team', description: 'Default English title.' },
  { value: 'meet-team' as const, label: 'Meet the team', description: 'A warm invitation.' },
  { value: 'people' as const, label: 'The talent', description: 'Focus on the people.' },
  { value: 'custom' as const, label: 'Custom', description: 'Your own title.' },
];

export const PORTFOLIO_TEAM_SUBTITLE_PRESET_OPTIONS = [
  { value: 'default' as const, label: 'Default', description: 'Uses the section subtitle text.' },
  { value: 'together' as const, label: 'Together', description: 'A line about collaboration.' },
  { value: 'expertise' as const, label: 'Expertise', description: 'Highlights complementary skills.' },
  { value: 'minimal' as const, label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom' as const, label: 'Custom', description: 'Your own subtitle.' },
];

export const PORTFOLIO_TEAM_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioTeamSectionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Stacked',
    description: 'Title above, members below.',
  },
  {
    value: 'aside-left',
    label: 'Title on the left',
    description: 'Title on the left, team grid on the right (side by side).',
  },
  {
    value: 'aside-right',
    label: 'Title on the right',
    description: 'Team grid on the left, title on the right (side by side).',
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
  layout: 'portrait-rail',
  columns: 3,
  gap: 'lg',
  cardRadius: 'xl',
  cardPadding: 'md',
  cardMaxWidth: 'sm',
  listAlign: 'center',
  avatarSize: 'md',
  cardShadow: 'soft',
  cardBorder: 'thin',
  cardBackgroundEnabled: true,
  cardBackgroundColor: '#ffffff',
  cardBorderColor: '#e5e5e5',
  directoryDetachedCards: true,
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

export const DEFAULT_TEAM_TITLE_EN = 'Our team';
export const DEFAULT_TEAM_SUBTITLE_EN = 'The people who bring every project to life.';
const LEGACY_TEAM_TITLES = new Set(['Notre équipe', 'NOTRE ÉQUIPE']);
const LEGACY_TEAM_SUBTITLES = new Set(['Les personnes qui donnent vie à chaque projet.']);

const SUBTITLE_COPY = {
  together: 'Complementary personalities united around a shared ambition.',
  expertise: 'Complementary expertise to bring every project to life.',
};

export function migrateLegacyTeamCopy(title: string, subtitle: string): { title: string; subtitle: string } {
  return {
    title: LEGACY_TEAM_TITLES.has(title.trim()) ? DEFAULT_TEAM_TITLE_EN : title,
    subtitle: LEGACY_TEAM_SUBTITLES.has(subtitle.trim()) ? DEFAULT_TEAM_SUBTITLE_EN : subtitle,
  };
}

export function resolveTeamSectionTitle(
  settings: Pick<PortfolioTeamSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  if (settings.titlePreset === 'meet-team') return 'Meet the team';
  if (settings.titlePreset === 'people') return 'The talent';
  if (settings.titlePreset === 'custom') {
    return settings.titleCustom.trim() || settings.title.trim();
  }
  return DEFAULT_TEAM_TITLE_EN;
}

export function resolveTeamSectionSubtitle(
  settings: Pick<PortfolioTeamSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  if (settings.subtitlePreset === 'minimal') return '';
  if (settings.subtitlePreset === 'together') return SUBTITLE_COPY.together;
  if (settings.subtitlePreset === 'expertise') return SUBTITLE_COPY.expertise;
  if (settings.subtitlePreset === 'custom') return settings.subtitleCustom.trim() || settings.subtitle.trim();
  const stored = settings.subtitle.trim();
  if (!stored || LEGACY_TEAM_SUBTITLES.has(stored)) return DEFAULT_TEAM_SUBTITLE_EN;
  return stored;
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

export function teamGridClass(
  columns: number,
  gap: PortfolioTeamGap,
  align: PortfolioTeamListAlign = 'center',
  layout?: PortfolioTeamLayout
): string {
  const cols =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'sm:grid-cols-2'
        : columns === 4
          ? 'sm:grid-cols-2 xl:grid-cols-4'
          : 'sm:grid-cols-2 lg:grid-cols-3';
  const gaps =
    layout === 'float-cards'
      ? gap === 'sm'
        ? 'gap-x-5 gap-y-10'
        : gap === 'md'
          ? 'gap-x-10 gap-y-20'
          : gap === 'xl'
            ? 'gap-x-24 gap-y-48'
            : 'gap-x-16 gap-y-32'
      : gap === 'sm'
        ? 'gap-4'
        : gap === 'md'
          ? 'gap-10'
          : gap === 'xl'
            ? 'gap-28'
            : 'gap-16';
  const justify =
    align === 'left' ? 'justify-items-start' : align === 'right' ? 'justify-items-end' : 'justify-items-center';
  return `grid items-stretch ${justify} ${cols} ${gaps}`;
}

export function teamListAlignClass(align: PortfolioTeamListAlign | undefined): string {
  if (align === 'left') return 'mr-auto';
  if (align === 'right') return 'ml-auto';
  return 'mx-auto';
}

export function teamAvatarSizeClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'h-16 w-16';
  if (size === 'lg') return 'h-32 w-32';
  if (size === 'xl') return 'h-44 w-44';
  return 'h-24 w-24';
}

export function teamCircleAvatarClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'h-20 w-20';
  if (size === 'lg') return 'h-36 w-36';
  if (size === 'xl') return 'h-48 w-48';
  return 'h-28 w-28';
}

export function teamFloatGridOffsetClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'pt-10';
  if (size === 'lg') return 'pt-[4.5rem]';
  if (size === 'xl') return 'pt-24';
  return 'pt-14';
}

/** Pins the overlapping avatar to the white card’s top edge, inside the article padding. */
export function teamFloatAvatarAnchorClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'top-10';
  if (size === 'lg') return 'top-[4.5rem]';
  if (size === 'xl') return 'top-24';
  return 'top-14';
}

export function teamFloatCardBodyPadClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'px-4 pb-5 pt-12';
  if (size === 'lg') return 'px-6 pb-8 pt-20';
  if (size === 'xl') return 'px-6 pb-9 pt-24';
  return 'px-5 pb-6 pt-16';
}

export function teamFloatCardMinHeightClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'min-h-[10.5rem]';
  if (size === 'lg') return 'min-h-[13.5rem]';
  if (size === 'xl') return 'min-h-[15rem]';
  return 'min-h-[11.5rem]';
}

export function teamFlexAlignClass(align: PortfolioTeamListAlign | undefined): string {
  if (align === 'left') return 'items-start';
  if (align === 'right') return 'items-end';
  return 'items-center';
}

export function teamSocialIconButtonClass(size: PortfolioTeamSocialIconSize | undefined): string {
  if (size === 'sm') return 'h-7 w-7';
  if (size === 'lg') return 'h-12 w-12';
  if (size === 'xl') return 'h-16 w-16';
  return 'h-9 w-9';
}

export function teamSocialIconGlyphClass(size: PortfolioTeamSocialIconSize | undefined): string {
  if (size === 'sm') return 'h-3 w-3';
  if (size === 'lg') return 'h-6 w-6';
  if (size === 'xl') return 'h-8 w-8';
  return 'h-4 w-4';
}

/** Wider max-widths for the directory list (avatar + name + icons in one row). */
export function teamDirectoryMaxWidthClass(width: PortfolioTeamCardMaxWidth | undefined): string {
  if (width === 'xs') return 'max-w-sm';
  if (width === 'sm' || width == null) return 'max-w-xl';
  if (width === 'md') return 'max-w-2xl';
  if (width === 'lg') return 'max-w-4xl';
  if (width === 'xl') return 'max-w-5xl';
  return 'max-w-none';
}

export function teamDirectoryStackGapClass(gap: PortfolioTeamGap | undefined): string {
  if (gap === 'sm') return 'gap-3';
  if (gap === 'md') return 'gap-4';
  if (gap === 'xl') return 'gap-8';
  return 'gap-5';
}

export function teamCardMaxWidthClass(width: PortfolioTeamCardMaxWidth | undefined): string {
  if (width === 'xs') return 'max-w-[14rem]';
  if (width === 'sm' || width == null) return 'max-w-[17.5rem]';
  if (width === 'md') return 'max-w-[21rem]';
  if (width === 'lg') return 'max-w-[26rem]';
  if (width === 'xl') return 'max-w-[32rem]';
  return 'max-w-none';
}

/** Spotlight frame: default `sm` keeps the previous max-w-3xl look. */
export function teamSpotlightMaxWidthClass(width: PortfolioTeamCardMaxWidth | undefined): string {
  if (width === 'xs') return 'max-w-xl';
  if (width === 'sm' || width == null) return 'max-w-3xl';
  if (width === 'md') return 'max-w-4xl';
  if (width === 'lg') return 'max-w-5xl';
  if (width === 'xl') return 'max-w-6xl';
  return 'max-w-none';
}

export function teamSpotlightGridClass(): string {
  return 'md:grid-cols-[auto_minmax(0,1fr)] md:items-stretch md:gap-6';
}

export function teamSpotlightPhotoSizeClass(avatarSize: PortfolioTeamAvatarSize | undefined): string {
  if (avatarSize === 'sm') return 'w-36 sm:w-40';
  if (avatarSize === 'lg') return 'w-72 sm:w-80';
  if (avatarSize === 'xl') return 'w-96 sm:w-[28rem]';
  return 'w-52 sm:w-60';
}

export function teamSpotlightThumbClass(avatarSize: PortfolioTeamAvatarSize | undefined): string {
  if (avatarSize === 'sm') return 'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]';
  if (avatarSize === 'lg') return 'h-24 w-24 sm:h-28 sm:w-28';
  if (avatarSize === 'xl') return 'h-28 w-28 sm:h-32 sm:w-32';
  return 'h-20 w-20 sm:h-24 sm:w-24';
}

export function teamSpotlightNameClass(width: PortfolioTeamCardMaxWidth | undefined): string {
  if (width === 'xs' || width === 'sm' || width == null) {
    return 'font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl';
  }
  if (width === 'md') return 'font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl';
  if (width === 'lg') return 'font-serif text-5xl font-semibold leading-tight tracking-tight';
  return 'font-serif text-5xl font-semibold leading-tight tracking-tight sm:text-6xl';
}

export function teamSpotlightRoleClass(width: PortfolioTeamCardMaxWidth | undefined): string {
  if (width === 'xs' || width === 'sm' || width == null) return 'mt-2 text-sm sm:text-base';
  if (width === 'md' || width === 'lg') return 'mt-3 text-base sm:text-lg';
  return 'mt-3 text-lg sm:text-xl';
}

export function teamContentAlignClass(align: PortfolioTeamListAlign | undefined): string {
  if (align === 'left') return 'text-left';
  if (align === 'right') return 'text-right';
  return 'text-center';
}

export function teamSocialAlignClass(align: PortfolioTeamListAlign | undefined): string {
  if (align === 'left') return 'justify-start';
  if (align === 'right') return 'justify-end';
  return 'justify-center';
}

export function teamProfilePhotoHeightClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'h-44';
  if (size === 'lg') return 'h-72';
  if (size === 'xl') return 'h-96';
  return 'h-56';
}

export function teamHoverPhotoClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'aspect-[4/5] min-h-[16rem]';
  if (size === 'lg') return 'aspect-[4/5] min-h-[24rem]';
  if (size === 'xl') return 'aspect-[4/5] min-h-[28rem]';
  return 'aspect-[4/5] min-h-[20rem]';
}

export function teamHoverOverlayPaddingClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'px-3 py-2.5';
  if (size === 'lg') return 'px-5 py-4';
  if (size === 'xl') return 'px-6 py-5';
  return 'px-4 py-3';
}

export const PORTFOLIO_TEAM_CARD_BORDER_OPTIONS: {
  value: PortfolioTeamCardBorder;
  label: string;
}[] = [
  { value: 'none', label: 'Aucune' },
  { value: 'thin', label: 'Fine' },
  { value: 'medium', label: 'Moyenne' },
];

export function teamCardBorderClass(settings: PortfolioTeamPresentationSettings): string {
  const border = settings.cardBorder ?? 'thin';
  if (border === 'none') return 'border-0';
  if (border === 'medium') return 'border-2';
  return 'border';
}

export function teamCardFrameClass(settings: PortfolioTeamPresentationSettings): string {
  const radius = { none: 'rounded-none', sm: 'rounded-lg', md: 'rounded-2xl', lg: 'rounded-3xl', xl: 'rounded-[2rem]' }[settings.cardRadius];
  const shadow = { none: '', soft: 'shadow-sm', medium: 'shadow-lg shadow-black/10', strong: 'shadow-2xl shadow-black/20' }[settings.cardShadow];
  return `${radius} ${shadow} ${teamCardBorderClass(settings)} overflow-hidden`;
}

export function teamCardFooterPaddingClass(padding: PortfolioTeamCardPadding | undefined): string {
  if (padding === 'none') return 'px-4 py-4';
  if (padding === 'sm') return 'px-4 py-4';
  if (padding === 'lg') return 'px-6 py-8';
  return 'px-5 py-6';
}

export function teamCardClass(settings: PortfolioTeamPresentationSettings): string {
  const radius = { none: 'rounded-none', sm: 'rounded-lg', md: 'rounded-2xl', lg: 'rounded-3xl', xl: 'rounded-[2rem]' }[settings.cardRadius];
  const padding = { none: 'p-0', sm: 'p-3', md: 'p-5', lg: 'p-7' }[settings.cardPadding];
  const shadow = { none: '', soft: 'shadow-sm', medium: 'shadow-lg shadow-black/10', strong: 'shadow-2xl shadow-black/20' }[settings.cardShadow];
  return `${radius} ${padding} ${shadow} ${teamCardBorderClass(settings)} overflow-hidden`;
}

export function teamCardStyle(settings: PortfolioTeamPresentationSettings): CSSProperties {
  const border = settings.cardBorder ?? 'thin';
  const fillOn = settings.cardBackgroundEnabled !== false;
  return {
    backgroundColor: fillOn ? sanitizeHex(settings.cardBackgroundColor, '#ffffff') : 'transparent',
    borderColor: border === 'none' ? 'transparent' : sanitizeHex(settings.cardBorderColor, '#e5e5e5'),
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
  const layout = pick(
    record.layout,
    ['meet-cards', 'portrait-rail', 'spotlight', 'directory', 'polaroid', 'profile-cards', 'hover-cards', 'avatar-cards', 'cover-cards', 'float-cards'],
    base.layout
  );
  const merged: PortfolioTeamPresentationSettings = {
    ...mergeSectionBackground(base, patch),
    layout: layout === 'meet-cards' ? 'portrait-rail' : layout,
    columns: clampColumns(record.columns, base.columns),
    gap: pick(record.gap, ['sm', 'md', 'lg', 'xl'], base.gap),
    cardRadius: pick(record.cardRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    cardMaxWidth: pick(record.cardMaxWidth, ['xs', 'sm', 'md', 'lg', 'xl', 'full'], base.cardMaxWidth ?? 'sm'),
    listAlign: pick(record.listAlign, ['left', 'center', 'right'], base.listAlign ?? 'center'),
    avatarSize: pick(record.avatarSize, ['sm', 'md', 'lg', 'xl'], base.avatarSize ?? 'md'),
    cardShadow: pick(record.cardShadow, ['none', 'soft', 'medium', 'strong'], base.cardShadow),
    cardBorder: pick(record.cardBorder, ['none', 'thin', 'medium'], base.cardBorder ?? 'thin'),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean'
        ? record.cardBackgroundEnabled
        : (base.cardBackgroundEnabled ?? true),
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    directoryDetachedCards:
      typeof record.directoryDetachedCards === 'boolean'
        ? record.directoryDetachedCards
        : (base.directoryDetachedCards ?? true),
    imageAspect: pick(record.imageAspect, ['square', 'portrait', 'landscape', 'auto'], base.imageAspect),
    imageFit: pick(record.imageFit, ['cover', 'contain'], base.imageFit),
    imagePosition: pick(record.imagePosition, ['center', 'top', 'bottom', 'left', 'right'], base.imagePosition),
    showName: typeof record.showName === 'boolean' ? record.showName : base.showName,
    showResponsibility: typeof record.showResponsibility === 'boolean' ? record.showResponsibility : base.showResponsibility,
    showSocials: typeof record.showSocials === 'boolean' ? record.showSocials : base.showSocials,
    showImage: typeof record.showImage === 'boolean' ? record.showImage : base.showImage,
    socialIconSize: pick(record.socialIconSize, ['sm', 'md', 'lg', 'xl'], base.socialIconSize),
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
