/**
 * Experience palette — same 8 semantic tokens as Hero / Work / Services.
 * Concrete hex fields still drive render; bindings choose which token paints each slot.
 */

import {
  computeLightPalette,
  DEFAULT_HERO_PALETTE,
  HERO_PALETTE_TOKEN_IDS,
  mergeHeroPalette,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';

/** Local mirrors — avoid importing portfolio-experience-settings (circular TDZ). */
export type ExperienceElementStyleTarget =
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

export const EXPERIENCE_COLOR_SLOT_IDS: ExperienceColorSlot[] = [
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

export const PORTFOLIO_EXPERIENCE_COLOR_SLOT_OPTIONS: {
  value: ExperienceColorSlot;
  label: string;
  description: string;
}[] = [
  { value: 'sectionBackground', label: 'Section background', description: 'Solid section fill.' },
  { value: 'sectionGradientFrom', label: 'Gradient start', description: 'Start of the section gradient.' },
  { value: 'sectionGradientTo', label: 'Gradient end', description: 'End of the section gradient.' },
  { value: 'sectionSplitA', label: 'Split zone A', description: 'First split background zone.' },
  { value: 'sectionSplitB', label: 'Split zone B', description: 'Second split background zone.' },
  { value: 'sectionDivider', label: 'Split divider', description: 'Line between split zones.' },
  { value: 'title', label: 'Section title', description: 'Experience heading.' },
  { value: 'subtitle', label: 'Section subtitle', description: 'Intro under the title.' },
  { value: 'accent', label: 'Accent', description: 'Organization and timeline accents.' },
  { value: 'years', label: 'Years phrase', description: 'Years summary body text.' },
  { value: 'yearsHighlight', label: 'Years highlight', description: 'Emphasized years count.' },
  { value: 'entryBorder', label: 'Entry border', description: 'Outer entry shell outline.' },
  { value: 'entryBackground', label: 'Entry background', description: 'Outer entry shell fill.' },
  { value: 'entryBackgroundA', label: 'Entry split A', description: 'First split on entry shell.' },
  { value: 'entryBackgroundB', label: 'Entry split B', description: 'Second split on entry shell.' },
  { value: 'entryDivider', label: 'Entry divider', description: 'Divider on entry shell.' },
  { value: 'storyBorder', label: 'Story border', description: 'Story card outline.' },
  { value: 'storyBackground', label: 'Story background', description: 'Story card fill.' },
  { value: 'storyBackgroundA', label: 'Story split A', description: 'First split on story card.' },
  { value: 'storyBackgroundB', label: 'Story split B', description: 'Second split on story card.' },
  { value: 'storyDivider', label: 'Story divider', description: 'Divider on story card.' },
  { value: 'detailsBorder', label: 'Details border', description: 'Details card outline.' },
  { value: 'detailsBackground', label: 'Details background', description: 'Details card fill.' },
  { value: 'detailsBackgroundA', label: 'Details split A', description: 'First split on details card.' },
  { value: 'detailsBackgroundB', label: 'Details split B', description: 'Second split on details card.' },
  { value: 'detailsDivider', label: 'Details divider', description: 'Divider on details card.' },
  { value: 'entryTitle', label: 'Job title', description: 'Role title on each entry.' },
  { value: 'entryOrganization', label: 'Organization', description: 'Company / client name.' },
  { value: 'entryMeta', label: 'Meta chips', description: 'Status, employment, location.' },
  { value: 'entryDescription', label: 'Description', description: 'Role summary paragraph.' },
  { value: 'entryBlockLabel', label: 'Block labels', description: 'TASKS / PROOF headings.' },
  { value: 'entryTasks', label: 'Tasks', description: 'Bullet list items.' },
  { value: 'entryProof', label: 'Proof links', description: 'Proof pill labels.' },
  { value: 'entryTools', label: 'Tools text', description: 'Tool chip labels.' },
  {
    value: 'entryChipBackground',
    label: 'Chip background',
    description: 'Fill behind Tools and Proof pills — follows light/dark palette.',
  },
  {
    value: 'entryChipBorder',
    label: 'Chip border',
    description: 'Outline on Tools and Proof pills.',
  },
  {
    value: 'toolsIconBackground',
    label: 'Tools icon background',
    description: 'Fill behind each tool logo chip.',
  },
  {
    value: 'toolsIconBorder',
    label: 'Tools icon border',
    description: 'Ring around tools logos (when border is Soft or Solid).',
  },
  {
    value: 'toolsChromeBackground',
    label: 'Tools group background',
    description: 'Fill behind the tools icons group (Fond des outils).',
  },
  {
    value: 'periodRule',
    label: 'Period rule',
    description: 'Magazine horizontal line beside the year badge.',
  },
  {
    value: 'timelineRail',
    label: 'Timeline rail',
    description: 'Vertical timeline line and node (Classic / Accent / Magazine stripe).',
  },
  {
    value: 'toolsSeparator',
    label: 'Tools separator',
    description: 'Horizontal line above the Tools block.',
  },
];

export const DARK_EXPERIENCE_PALETTE: PortfolioExperiencePalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_EXPERIENCE_PALETTE: PortfolioExperiencePalette = { ...DARK_EXPERIENCE_PALETTE };

export function computeLightExperiencePalette(
  dark: Partial<PortfolioExperiencePalette>
): PortfolioExperiencePalette {
  return computeLightPalette(mergeHeroPalette(DARK_EXPERIENCE_PALETTE, dark));
}

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

export function patchExperiencePalette(
  experience: ExperiencePaletteHost,
  palettePatch: Partial<PortfolioExperiencePalette>
): ExperiencePalettePatch {
  const palette = mergeExperiencePalette(DEFAULT_EXPERIENCE_PALETTE, {
    ...experience.experiencePalette,
    ...palettePatch,
  });
  return applyExperiencePaletteToSettings({ ...experience, experiencePalette: palette });
}

export function patchExperienceSlotColor(
  experience: ExperiencePaletteHost,
  slot: ExperienceColorSlot,
  hex: string
): ExperiencePalettePatch {
  const bindings = mergeExperienceColorBindings(
    DEFAULT_EXPERIENCE_COLOR_BINDINGS,
    experience.experienceColorBindings
  );
  return patchExperiencePalette(experience, { [bindings[slot]]: hex });
}

export function patchExperienceColorBinding(
  experience: ExperiencePaletteHost,
  slot: ExperienceColorSlot,
  token: HeroPaletteTokenId
): ExperiencePalettePatch {
  const bindings = mergeExperienceColorBindings(DEFAULT_EXPERIENCE_COLOR_BINDINGS, {
    ...experience.experienceColorBindings,
    [slot]: token,
  });
  return applyExperiencePaletteToSettings({ ...experience, experienceColorBindings: bindings });
}

export function patchExperienceColorFieldManual(
  experience: ExperiencePaletteHost,
  slot: ExperienceColorSlot,
  hex: string
): ExperiencePalettePatch {
  const elementTarget = (Object.entries(EXPERIENCE_ELEMENT_STYLE_SLOT) as [ExperienceElementStyleTarget, ExperienceColorSlot][]).find(
    ([, value]) => value === slot
  )?.[0];
  if (elementTarget) {
    const elementStyles = paintExperienceElementColor(experience.elementStyles, elementTarget, hex);
    return elementStyles ? { elementStyles } : {};
  }

  const sectionFields: Partial<Record<ExperienceColorSlot, keyof ExperiencePresentationColorFields>> = {
    sectionBackground: 'sectionBackgroundColor',
    sectionGradientFrom: 'sectionBackgroundGradientFrom',
    sectionGradientTo: 'sectionBackgroundGradientTo',
    sectionSplitA: 'sectionBackgroundColorA',
    sectionSplitB: 'sectionBackgroundColorB',
    sectionDivider: 'sectionBackgroundDividerColor',
    title: 'titleColor',
    subtitle: 'subtitleColor',
    accent: 'accentColor',
    years: 'yearsColor',
    yearsHighlight: 'yearsHighlightColor',
    entryChipBackground: 'entryChipBackgroundColor',
    entryChipBorder: 'entryChipBorderColor',
    toolsIconBackground: 'toolsIconBackgroundColor',
    toolsIconBorder: 'toolsIconBorderColor',
    periodRule: 'periodRuleColor',
    timelineRail: 'timelineRailColor',
    toolsSeparator: 'toolsSeparatorColor',
  };
  const sectionField = sectionFields[slot];
  if (sectionField) return { [sectionField]: hex };

  if (slot === 'toolsChromeBackground') {
    return {
      toolsChrome: {
        ...(experience.toolsChrome ?? {}),
        backgroundColor: hex,
      },
    };
  }

  const frameMap: Partial<
    Record<
      ExperienceColorSlot,
      { layer: 'entryFrame' | 'storyFrame' | 'detailsFrame'; field: keyof ExperienceLayerFrame }
    >
  > = {
    entryBorder: { layer: 'entryFrame', field: 'cardBorderColor' },
    entryBackground: { layer: 'entryFrame', field: 'cardBackgroundColor' },
    entryBackgroundA: { layer: 'entryFrame', field: 'cardBackgroundColorA' },
    entryBackgroundB: { layer: 'entryFrame', field: 'cardBackgroundColorB' },
    entryDivider: { layer: 'entryFrame', field: 'cardDividerColor' },
    storyBorder: { layer: 'storyFrame', field: 'cardBorderColor' },
    storyBackground: { layer: 'storyFrame', field: 'cardBackgroundColor' },
    storyBackgroundA: { layer: 'storyFrame', field: 'cardBackgroundColorA' },
    storyBackgroundB: { layer: 'storyFrame', field: 'cardBackgroundColorB' },
    storyDivider: { layer: 'storyFrame', field: 'cardDividerColor' },
    detailsBorder: { layer: 'detailsFrame', field: 'cardBorderColor' },
    detailsBackground: { layer: 'detailsFrame', field: 'cardBackgroundColor' },
    detailsBackgroundA: { layer: 'detailsFrame', field: 'cardBackgroundColorA' },
    detailsBackgroundB: { layer: 'detailsFrame', field: 'cardBackgroundColorB' },
    detailsDivider: { layer: 'detailsFrame', field: 'cardDividerColor' },
  };
  const frameTarget = frameMap[slot];
  if (frameTarget) {
    const frame = experience[frameTarget.layer] ?? {};
    return {
      [frameTarget.layer]: {
        ...frame,
        [frameTarget.field]: hex,
        cardBackgroundEnabled: true,
      },
    };
  }

  return {};
}

export function patchExperienceColorField(
  experience: ExperiencePaletteHost & { useHeroPalette?: boolean },
  slot: ExperienceColorSlot,
  hex: string
): ExperiencePalettePatch {
  if (experience.useHeroPalette === false) {
    return patchExperienceColorFieldManual(experience, slot, hex);
  }
  return patchExperienceSlotColor(experience, slot, hex);
}

export const EXPERIENCE_STYLE_TARGET_COLOR_SLOT: Record<
  ExperienceElementStyleTarget,
  ExperienceColorSlot
> = EXPERIENCE_ELEMENT_STYLE_SLOT;

export const EXPERIENCE_ENTRY_STYLE_TARGETS: ExperienceElementStyleTarget[] = [
  'title',
  'organization',
  'meta',
  'description',
];

export const EXPERIENCE_BLOCK_STYLE_TARGETS: ExperienceElementStyleTarget[] = [
  'blockLabel',
  'tasks',
  'proof',
  'tools',
];
