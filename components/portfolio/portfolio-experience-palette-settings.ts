/**
 * Experience palette — same 8 semantic tokens as Hero / Work / Services.
 * Concrete hex fields still drive render; bindings choose which token paints each slot.
 */

import { DEFAULT_HERO_PALETTE, HERO_PALETTE_TOKEN_IDS, mergeHeroPalette, resolveHeroPaletteColor, type HeroPaletteTokenId, type PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';

/** Local mirrors — avoid importing portfolio-experience-settings (circular TDZ). */
type ExperienceElementStyleTarget =
  | 'title'
  | 'organization'
  | 'meta'
  | 'description'
  | 'blockLabel'
  | 'tasks'
  | 'proof'
  | 'tools';

type ExperienceTextStyle = {
  color: string;
  font: 'sans' | 'serif' | 'display';
  size: 'sm' | 'md' | 'lg' | 'xl';
  italic: boolean;
  bold: boolean;
  uppercase: boolean;
};

type ExperienceElementStyles = Record<ExperienceElementStyleTarget, ExperienceTextStyle>;

type ExperienceLayerFrame = {
  enabled?: boolean;
  cardBorderColor?: string;
  cardBackgroundColor?: string;
  cardBackgroundColorA?: string;
  cardBackgroundColorB?: string;
  cardDividerColor?: string;
  cardBackgroundEnabled?: boolean;
};

export type PortfolioExperiencePalette = PortfolioHeroPalette;

export type ExperienceColorSlot =
  | 'sectionBackground'
  | 'sectionGradientFrom'
  | 'sectionGradientTo'
  | 'sectionSplitA'
  | 'sectionSplitB'
  | 'sectionDivider'
  | 'title'
  | 'subtitle'
  | 'accent'
  | 'years'
  | 'yearsHighlight'
  | 'entryBorder'
  | 'entryBackground'
  | 'entryBackgroundA'
  | 'entryBackgroundB'
  | 'entryDivider'
  | 'storyBorder'
  | 'storyBackground'
  | 'storyBackgroundA'
  | 'storyBackgroundB'
  | 'storyDivider'
  | 'detailsBorder'
  | 'detailsBackground'
  | 'detailsBackgroundA'
  | 'detailsBackgroundB'
  | 'detailsDivider'
  | 'entryTitle'
  | 'entryOrganization'
  | 'entryMeta'
  | 'entryDescription'
  | 'entryBlockLabel'
  | 'entryTasks'
  | 'entryProof'
  | 'entryTools'
  | 'entryChipBackground'
  | 'entryChipBorder'
  | 'toolsIconBackground'
  | 'toolsIconBorder'
  | 'toolsChromeBackground'
  | 'periodRule'
  | 'timelineRail'
  | 'toolsSeparator';

export type PortfolioExperienceColorBindings = Record<ExperienceColorSlot, HeroPaletteTokenId>;

type ExperiencePresentationColorFields = {
  sectionBackgroundColor?: string;
  sectionBackgroundGradientFrom?: string;
  sectionBackgroundGradientTo?: string;
  sectionBackgroundColorA?: string;
  sectionBackgroundColorB?: string;
  sectionBackgroundDividerColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  yearsColor?: string;
  yearsHighlightColor?: string;
  taskBulletColor?: string;
  entryChipBackgroundColor?: string;
  entryChipBorderColor?: string;
  toolsIconBackgroundColor?: string;
  toolsIconBorderColor?: string;
  toolsChrome?: { backgroundColor?: string };
  periodRuleColor?: string;
  timelineRailColor?: string;
  toolsSeparatorColor?: string;
  useHeroPalette?: boolean;
  experiencePalette?: PortfolioExperiencePalette;
  experienceColorBindings?: PortfolioExperienceColorBindings;
  elementStyles?: ExperienceElementStyles;
  entryFrame?: ExperienceLayerFrame;
  storyFrame?: ExperienceLayerFrame;
  detailsFrame?: ExperienceLayerFrame;
  detailsSecondaryFrame?: ExperienceLayerFrame;
};

const EXPERIENCE_COLOR_SLOT_IDS: ExperienceColorSlot[] = [
  'sectionBackground',
  'sectionGradientFrom',
  'sectionGradientTo',
  'sectionSplitA',
  'sectionSplitB',
  'sectionDivider',
  'title',
  'subtitle',
  'accent',
  'years',
  'yearsHighlight',
  'entryBorder',
  'entryBackground',
  'entryBackgroundA',
  'entryBackgroundB',
  'entryDivider',
  'storyBorder',
  'storyBackground',
  'storyBackgroundA',
  'storyBackgroundB',
  'storyDivider',
  'detailsBorder',
  'detailsBackground',
  'detailsBackgroundA',
  'detailsBackgroundB',
  'detailsDivider',
  'entryTitle',
  'entryOrganization',
  'entryMeta',
  'entryDescription',
  'entryBlockLabel',
  'entryTasks',
  'entryProof',
  'entryTools',
  'entryChipBackground',
  'entryChipBorder',
  'toolsIconBackground',
  'toolsIconBorder',
  'toolsChromeBackground',
  'periodRule',
  'timelineRail',
  'toolsSeparator',
];

const DARK_EXPERIENCE_PALETTE: PortfolioExperiencePalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_EXPERIENCE_PALETTE: PortfolioExperiencePalette = { ...DARK_EXPERIENCE_PALETTE };

export const DEFAULT_EXPERIENCE_COLOR_BINDINGS: PortfolioExperienceColorBindings = {
  sectionBackground: 'fond',
  sectionGradientFrom: 'fond',
  sectionGradientTo: 'neutre',
  sectionSplitA: 'fond',
  sectionSplitB: 'neutre',
  sectionDivider: 'bordure',
  title: 'texteFort',
  subtitle: 'texteMuted',
  accent: 'principal',
  years: 'texteFort',
  yearsHighlight: 'principal',
  entryBorder: 'bordure',
  entryBackground: 'neutre',
  entryBackgroundA: 'neutre',
  entryBackgroundB: 'fond',
  entryDivider: 'bordure',
  storyBorder: 'bordure',
  storyBackground: 'neutre',
  storyBackgroundA: 'neutre',
  storyBackgroundB: 'fond',
  storyDivider: 'bordure',
  detailsBorder: 'bordure',
  detailsBackground: 'neutre',
  detailsBackgroundA: 'neutre',
  detailsBackgroundB: 'fond',
  detailsDivider: 'bordure',
  entryTitle: 'texteFort',
  entryOrganization: 'principal',
  entryMeta: 'texteMuted',
  entryDescription: 'texteMuted',
  entryBlockLabel: 'texteFaint',
  entryTasks: 'texteMuted',
  entryProof: 'texteMuted',
  entryTools: 'texteMuted',
  /** Slightly recessed vs details surface so chips read in dark and light. */
  entryChipBackground: 'fond',
  entryChipBorder: 'bordure',
  toolsIconBackground: 'neutre',
  toolsIconBorder: 'bordure',
  toolsChromeBackground: 'neutre',
  periodRule: 'bordure',
  timelineRail: 'bordure',
  toolsSeparator: 'bordure',
};

const EXPERIENCE_ELEMENT_STYLE_SLOT: Record<
  ExperienceElementStyleTarget,
  ExperienceColorSlot
> = {
  title: 'entryTitle',
  organization: 'entryOrganization',
  meta: 'entryMeta',
  description: 'entryDescription',
  blockLabel: 'entryBlockLabel',
  tasks: 'entryTasks',
  proof: 'entryProof',
  tools: 'entryTools',
};

type ExperiencePaletteHost = {
  experiencePalette?: Partial<PortfolioExperiencePalette>;
  experienceColorBindings?: Partial<PortfolioExperienceColorBindings>;
  elementStyles?: ExperienceElementStyles;
  entryFrame?: ExperienceLayerFrame;
  storyFrame?: ExperienceLayerFrame;
  detailsFrame?: ExperienceLayerFrame;
  detailsSecondaryFrame?: ExperienceLayerFrame;
  toolsChrome?: { backgroundColor?: string };
  /** When false, palette apply must not overwrite periodRuleColor / periodRuleColorDark. */
  periodRuleFollowPalette?: boolean;
  periodRuleColor?: string;
  periodRuleColorDark?: string;
};

type ExperiencePalettePatch = ExperiencePresentationColorFields;

function paintExperienceElementColor(
  styles: ExperienceElementStyles | undefined,
  target: ExperienceElementStyleTarget,
  color: string
): ExperienceElementStyles | undefined {
  if (!styles?.[target]) return styles;
  return {
    ...styles,
    [target]: { ...styles[target], color },
  };
}

function paintFrameChrome(
  frame: ExperienceLayerFrame | undefined,
  border: string,
  background: string,
  backgroundA: string,
  backgroundB: string,
  divider: string
): ExperienceLayerFrame | undefined {
  if (!frame) return frame;
  return {
    ...frame,
    cardBorderColor: border,
    cardBackgroundColor: background,
    cardBackgroundColorA: backgroundA,
    cardBackgroundColorB: backgroundB,
    cardDividerColor: divider,
    // Preserve the user's fill toggle — palette only refreshes hex tokens.
  };
}

export function mergeExperiencePalette(
  base: PortfolioExperiencePalette,
  patch: unknown
): PortfolioExperiencePalette {
  return mergeHeroPalette(base, patch);
}

/**
 * The theme's "secondaire" token, straight from the active palette — used to color the
 * Finished status across every design (Ongoing keeps accent / "principal").
 */
export function experienceSecondaryStatusColor(presentation: {
  experiencePalette?: PortfolioExperiencePalette;
}): string {
  const palette = mergeExperiencePalette(DEFAULT_EXPERIENCE_PALETTE, presentation.experiencePalette);
  return resolveHeroPaletteColor(palette, 'secondaire');
}

export function mergeExperienceColorBindings(
  base: PortfolioExperienceColorBindings,
  patch: unknown
): PortfolioExperienceColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of EXPERIENCE_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

/** Push palette + bindings into every bound concrete experience hex field. */
export function applyExperiencePaletteToSettings(
  experience: ExperiencePaletteHost
): ExperiencePalettePatch {
  const palette = mergeExperiencePalette(DEFAULT_EXPERIENCE_PALETTE, experience.experiencePalette);
  const bindings = mergeExperienceColorBindings(
    DEFAULT_EXPERIENCE_COLOR_BINDINGS,
    experience.experienceColorBindings
  );
  let elementStyles = experience.elementStyles ? { ...experience.elementStyles } : undefined;

  const resolve = (slot: ExperienceColorSlot) => resolveHeroPaletteColor(palette, bindings[slot]);
  const followPeriodRule = experience.periodRuleFollowPalette !== false;

  const patch: ExperiencePalettePatch = {
    experiencePalette: palette,
    experienceColorBindings: bindings,
    sectionBackgroundColor: resolve('sectionBackground'),
    sectionBackgroundGradientFrom: resolve('sectionGradientFrom'),
    sectionBackgroundGradientTo: resolve('sectionGradientTo'),
    sectionBackgroundColorA: resolve('sectionSplitA'),
    sectionBackgroundColorB: resolve('sectionSplitB'),
    sectionBackgroundDividerColor: resolve('sectionDivider'),
    titleColor: resolve('title'),
    subtitleColor: resolve('subtitle'),
    accentColor: resolve('accent'),
    // Task list puces follow accent / principal (same role as FAQ numbers).
    taskBulletColor: resolve('accent'),
    yearsColor: resolve('years'),
    yearsHighlightColor: resolve('yearsHighlight'),
    entryChipBackgroundColor: resolve('entryChipBackground'),
    entryChipBorderColor: resolve('entryChipBorder'),
    toolsIconBackgroundColor: resolve('toolsIconBackground'),
    toolsIconBorderColor: resolve('toolsIconBorder'),
    toolsChrome: {
      ...(experience.toolsChrome ?? {}),
      backgroundColor: resolve('toolsChromeBackground'),
    },
    ...(followPeriodRule ? { periodRuleColor: resolve('periodRule') } : {}),
    timelineRailColor: resolve('timelineRail'),
    toolsSeparatorColor: resolve('toolsSeparator'),
    entryFrame: paintFrameChrome(
      experience.entryFrame,
      resolve('entryBorder'),
      resolve('entryBackground'),
      resolve('entryBackgroundA'),
      resolve('entryBackgroundB'),
      resolve('entryDivider')
    ),
    storyFrame: paintFrameChrome(
      experience.storyFrame,
      resolve('storyBorder'),
      resolve('storyBackground'),
      resolve('storyBackgroundA'),
      resolve('storyBackgroundB'),
      resolve('storyDivider')
    ),
    detailsFrame: paintFrameChrome(
      experience.detailsFrame,
      resolve('detailsBorder'),
      resolve('detailsBackground'),
      resolve('detailsBackgroundA'),
      resolve('detailsBackgroundB'),
      resolve('detailsDivider')
    ),
    // Proof card reuses the details palette tokens until it has its own slots.
    detailsSecondaryFrame: paintFrameChrome(
      experience.detailsSecondaryFrame,
      resolve('detailsBorder'),
      resolve('detailsBackground'),
      resolve('detailsBackgroundA'),
      resolve('detailsBackgroundB'),
      resolve('detailsDivider')
    ),
  };

  // Honor each element's binding — do not collapse slots onto a single muted ink.
  for (const [target, slot] of Object.entries(EXPERIENCE_ELEMENT_STYLE_SLOT) as [
    ExperienceElementStyleTarget,
    ExperienceColorSlot,
  ][]) {
    elementStyles = paintExperienceElementColor(elementStyles, target, resolve(slot));
  }

  if (elementStyles) patch.elementStyles = elementStyles;

  return patch;
}

/**
 * Sync period-rule light + dark hex from the Global palette pair (bound token).
 * Returns null when the user opted out of palette follow for this hairline.
 */
export function syncExperiencePeriodRulePair(
  experience: Pick<ExperiencePaletteHost, 'experienceColorBindings' | 'periodRuleFollowPalette'>,
  lightPalette: PortfolioHeroPalette,
  darkPalette: PortfolioHeroPalette
): { periodRuleColor: string; periodRuleColorDark: string } | null {
  if (experience.periodRuleFollowPalette === false) return null;
  const bindings = mergeExperienceColorBindings(
    DEFAULT_EXPERIENCE_COLOR_BINDINGS,
    experience.experienceColorBindings
  );
  const token = bindings.periodRule;
  return {
    periodRuleColor: resolveHeroPaletteColor(lightPalette, token),
    periodRuleColorDark: resolveHeroPaletteColor(darkPalette, token),
  };
}
