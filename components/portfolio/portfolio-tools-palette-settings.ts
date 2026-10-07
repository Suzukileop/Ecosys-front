import {
  DEFAULT_HERO_PALETTE,
  HERO_PALETTE_TOKEN_IDS,
  mergeHeroPalette,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';

export type PortfolioToolsPalette = PortfolioHeroPalette;

export type ToolsColorSlot =
  | 'sectionBackground'
  | 'sectionGradientFrom'
  | 'sectionGradientTo'
  | 'sectionSplitA'
  | 'sectionSplitB'
  | 'sectionDivider'
  | 'title'
  | 'tileBackground'
  | 'label'
  | 'description'
  | 'cardBackground'
  | 'cardBorder'
  | 'chipBackground'
  | 'chipText'
  | 'levelAccent';

export type PortfolioToolsColorBindings = Record<ToolsColorSlot, HeroPaletteTokenId>;

const TOOLS_COLOR_SLOT_IDS: ToolsColorSlot[] = [
  'sectionBackground',
  'sectionGradientFrom',
  'sectionGradientTo',
  'sectionSplitA',
  'sectionSplitB',
  'sectionDivider',
  'title',
  'tileBackground',
  'label',
  'description',
  'cardBackground',
  'cardBorder',
  'chipBackground',
  'chipText',
  'levelAccent',
];

export const DEFAULT_TOOLS_PALETTE: PortfolioToolsPalette = { ...DEFAULT_HERO_PALETTE };

export const DEFAULT_TOOLS_COLOR_BINDINGS: PortfolioToolsColorBindings = {
  sectionBackground: 'fond',
  sectionGradientFrom: 'fond',
  sectionGradientTo: 'neutre',
  sectionSplitA: 'fond',
  sectionSplitB: 'neutre',
  sectionDivider: 'bordure',
  title: 'texteFort',
  tileBackground: 'neutre',
  label: 'texteFort',
  description: 'texteMuted',
  cardBackground: 'neutre',
  cardBorder: 'bordure',
  chipBackground: 'neutre',
  chipText: 'texteMuted',
  levelAccent: 'principal',
};

type ToolsPaletteHost = {
  toolsPalette?: Partial<PortfolioToolsPalette>;
  toolsColorBindings?: Partial<PortfolioToolsColorBindings>;
};

type ToolsPalettePatch = Record<string, unknown>;

export function mergeToolsPalette(base: PortfolioToolsPalette, patch: unknown): PortfolioToolsPalette {
  return mergeHeroPalette(base, patch);
}

export function mergeToolsColorBindings(
  base: PortfolioToolsColorBindings,
  patch: unknown
): PortfolioToolsColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of TOOLS_COLOR_SLOT_IDS) {
    const token = record[slot];
    if (typeof token === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(token)) {
      next[slot] = token as HeroPaletteTokenId;
    }
  }
  return next;
}

export function applyToolsPaletteToSettings(host: ToolsPaletteHost): ToolsPalettePatch {
  const toolsPalette = mergeToolsPalette(DEFAULT_TOOLS_PALETTE, host.toolsPalette);
  const bindings = mergeToolsColorBindings(DEFAULT_TOOLS_COLOR_BINDINGS, host.toolsColorBindings);
  const color = (slot: ToolsColorSlot) => resolveHeroPaletteColor(toolsPalette, bindings[slot]);
  return {
    toolsPalette,
    toolsColorBindings: bindings,
    sectionBackgroundColor: color('sectionBackground'),
    sectionBackgroundGradientFrom: color('sectionGradientFrom'),
    sectionBackgroundGradientTo: color('sectionGradientTo'),
    sectionBackgroundColorA: color('sectionSplitA'),
    sectionBackgroundColorB: color('sectionSplitB'),
    sectionBackgroundDividerColor: color('sectionDivider'),
    titleColor: color('title'),
    tileBackgroundColor: color('tileBackground'),
    labelColor: color('label'),
    descriptionColor: color('description'),
    cardBackgroundColor: color('cardBackground'),
    cardBorderColor: color('cardBorder'),
    chipBackgroundColor: color('chipBackground'),
    chipTextColor: color('chipText'),
    levelAccentColor: color('levelAccent'),
  };
}

export function patchToolsColorBinding(
  host: ToolsPaletteHost,
  slot: ToolsColorSlot,
  token: HeroPaletteTokenId
): ToolsPalettePatch {
  const toolsColorBindings = mergeToolsColorBindings(DEFAULT_TOOLS_COLOR_BINDINGS, {
    ...host.toolsColorBindings,
    [slot]: token,
  });
  return applyToolsPaletteToSettings({ ...host, toolsColorBindings });
}
