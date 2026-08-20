import {
  DEFAULT_HERO_PALETTE,
  HERO_PALETTE_TOKEN_IDS,
  mergeHeroPalette,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';

export type PortfolioTeamPalette = PortfolioHeroPalette;

export type TeamColorSlot =
  | 'sectionBackground'
  | 'sectionGradientFrom'
  | 'sectionGradientTo'
  | 'sectionSplitA'
  | 'sectionSplitB'
  | 'sectionDivider'
  | 'title'
  | 'subtitle'
  | 'cardBackground'
  | 'cardBorder'
  | 'name'
  | 'responsibility'
  | 'socialIcon'
  | 'socialBackground';

export type PortfolioTeamColorBindings = Record<TeamColorSlot, HeroPaletteTokenId>;

export const TEAM_COLOR_SLOT_IDS: TeamColorSlot[] = [
  'sectionBackground',
  'sectionGradientFrom',
  'sectionGradientTo',
  'sectionSplitA',
  'sectionSplitB',
  'sectionDivider',
  'title',
  'subtitle',
  'cardBackground',
  'cardBorder',
  'name',
  'responsibility',
  'socialIcon',
  'socialBackground',
];

export const PORTFOLIO_TEAM_COLOR_SLOT_OPTIONS: {
  value: TeamColorSlot;
  label: string;
}[] = [
  { value: 'sectionBackground', label: 'Fond de section' },
  { value: 'sectionGradientFrom', label: 'Début du dégradé' },
  { value: 'sectionGradientTo', label: 'Fin du dégradé' },
  { value: 'sectionSplitA', label: 'Zone A' },
  { value: 'sectionSplitB', label: 'Zone B' },
  { value: 'sectionDivider', label: 'Séparateur' },
  { value: 'title', label: 'Titre' },
  { value: 'subtitle', label: 'Sous-titre' },
  { value: 'cardBackground', label: 'Fond des cartes' },
  { value: 'cardBorder', label: 'Bordure des cartes' },
  { value: 'name', label: 'Nom' },
  { value: 'responsibility', label: 'Responsabilité' },
  { value: 'socialIcon', label: 'Icônes sociales' },
  { value: 'socialBackground', label: 'Fond des icônes' },
];

export const DEFAULT_TEAM_PALETTE: PortfolioTeamPalette = { ...DEFAULT_HERO_PALETTE };

export const DEFAULT_TEAM_COLOR_BINDINGS: PortfolioTeamColorBindings = {
  sectionBackground: 'fond',
  sectionGradientFrom: 'fond',
  sectionGradientTo: 'neutre',
  sectionSplitA: 'fond',
  sectionSplitB: 'neutre',
  sectionDivider: 'bordure',
  title: 'texteFort',
  subtitle: 'texteMuted',
  cardBackground: 'neutre',
  cardBorder: 'bordure',
  name: 'texteFort',
  responsibility: 'texteMuted',
  socialIcon: 'texteFort',
  socialBackground: 'fond',
};

type TeamPaletteHost = {
  teamPalette?: Partial<PortfolioTeamPalette>;
  teamColorBindings?: Partial<PortfolioTeamColorBindings>;
};

type TeamPalettePatch = Record<string, unknown>;

export function mergeTeamPalette(base: PortfolioTeamPalette, patch: unknown): PortfolioTeamPalette {
  return mergeHeroPalette(base, patch);
}

export function mergeTeamColorBindings(
  base: PortfolioTeamColorBindings,
  patch: unknown
): PortfolioTeamColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of TEAM_COLOR_SLOT_IDS) {
    const token = record[slot];
    if (typeof token === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(token)) {
      next[slot] = token as HeroPaletteTokenId;
    }
  }
  return next;
}

function luminance(hex: string): number {
  const raw = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(raw)) return 0;
  const channel = (offset: number) => {
    const value = parseInt(raw.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function teamCardReadableText(
  surface: string,
  strong: string,
  muted: string
): { strong: string; muted: string } {
  return luminance(surface) > 0.58
    ? { strong: '#171717', muted: '#666666' }
    : { strong, muted };
}

export function applyTeamPaletteToSettings(host: TeamPaletteHost): TeamPalettePatch {
  const teamPalette = mergeTeamPalette(DEFAULT_TEAM_PALETTE, host.teamPalette);
  const bindings = mergeTeamColorBindings(DEFAULT_TEAM_COLOR_BINDINGS, host.teamColorBindings);
  const color = (slot: TeamColorSlot) => resolveHeroPaletteColor(teamPalette, bindings[slot]);
  const cardBackgroundColor = color('cardBackground');
  const readable = teamCardReadableText(
    cardBackgroundColor,
    color('name'),
    color('responsibility')
  );
  return {
    teamPalette,
    teamColorBindings: bindings,
    sectionBackgroundColor: color('sectionBackground'),
    sectionBackgroundGradientFrom: color('sectionGradientFrom'),
    sectionBackgroundGradientTo: color('sectionGradientTo'),
    sectionBackgroundColorA: color('sectionSplitA'),
    sectionBackgroundColorB: color('sectionSplitB'),
    sectionBackgroundDividerColor: color('sectionDivider'),
    titleColor: color('title'),
    subtitleColor: color('subtitle'),
    cardBackgroundColor,
    cardBorderColor: color('cardBorder'),
    nameColor: readable.strong,
    responsibilityColor: readable.muted,
    socialIconColor: color('socialIcon'),
    socialBackgroundColor: color('socialBackground'),
  };
}

export function patchTeamColorBinding(
  host: TeamPaletteHost,
  slot: TeamColorSlot,
  token: HeroPaletteTokenId
): TeamPalettePatch {
  const teamColorBindings = mergeTeamColorBindings(DEFAULT_TEAM_COLOR_BINDINGS, {
    ...host.teamColorBindings,
    [slot]: token,
  });
  return applyTeamPaletteToSettings({ ...host, teamColorBindings });
}

/** Updates the palette token bound to a slot, then reapplies colors. */
export function patchTeamPaletteSlotColor(
  host: TeamPaletteHost,
  slot: TeamColorSlot,
  hex: string
): TeamPalettePatch {
  const teamPalette = mergeTeamPalette(DEFAULT_TEAM_PALETTE, host.teamPalette);
  const bindings = mergeTeamColorBindings(DEFAULT_TEAM_COLOR_BINDINGS, host.teamColorBindings);
  return applyTeamPaletteToSettings({
    ...host,
    teamPalette: { ...teamPalette, [bindings[slot]]: hex },
  });
}
