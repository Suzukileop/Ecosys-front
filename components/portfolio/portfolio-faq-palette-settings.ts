/**
 * FAQ palette — same 8 semantic tokens as Hero / Work / Services.
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
import type { PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';

/** Local mirrors — avoid importing portfolio-faq-settings (circular TDZ). */
export type FaqElementStyleTarget = 'question' | 'answer' | 'number';

type FaqElementStyles = Record<FaqElementStyleTarget, PortfolioElementTextStyle>;

export type PortfolioFaqPalette = PortfolioHeroPalette;

export type FaqColorSlot =
  | 'sectionBackground'
  | 'sectionGradientFrom'
  | 'sectionGradientTo'
  | 'sectionSplitA'
  | 'sectionSplitB'
  | 'sectionDivider'
  | 'title'
  | 'subtitle'
  | 'accent'
  | 'cardBorder'
  | 'cardBackground'
  | 'cardBackgroundA'
  | 'cardBackgroundB'
  | 'cardDivider'
  | 'question'
  | 'answer'
  | 'number'
  | 'expandIcon'
  | 'answerAccentBorder';

export type PortfolioFaqColorBindings = Record<FaqColorSlot, HeroPaletteTokenId>;

type FaqPresentationColorFields = {
  sectionBackgroundColor?: string;
  sectionBackgroundGradientFrom?: string;
  sectionBackgroundGradientTo?: string;
  sectionBackgroundColorA?: string;
  sectionBackgroundColorB?: string;
  sectionBackgroundDividerColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  cardBorderColor?: string;
  cardBackgroundColor?: string;
  cardBackgroundColorA?: string;
  cardBackgroundColorB?: string;
  cardDividerColor?: string;
  questionColor?: string;
  answerColor?: string;
  numberColor?: string;
  itemMarkerColor?: string;
  expandIconColor?: string;
  answerAccentBorderColor?: string;
  useHeroPalette?: boolean;
  faqPalette?: PortfolioFaqPalette;
  faqColorBindings?: PortfolioFaqColorBindings;
  elementStyles?: FaqElementStyles;
  cardBackgroundEnabled?: boolean;
};

export const FAQ_COLOR_SLOT_IDS: FaqColorSlot[] = [
  'sectionBackground',
  'sectionGradientFrom',
  'sectionGradientTo',
  'sectionSplitA',
  'sectionSplitB',
  'sectionDivider',
  'title',
  'subtitle',
  'accent',
  'cardBorder',
  'cardBackground',
  'cardBackgroundA',
  'cardBackgroundB',
  'cardDivider',
  'question',
  'answer',
  'number',
  'expandIcon',
  'answerAccentBorder',
];

export const PORTFOLIO_FAQ_COLOR_SLOT_OPTIONS: {
  value: FaqColorSlot;
  label: string;
  description: string;
}[] = [
  { value: 'sectionBackground', label: 'Section background', description: 'Solid section fill.' },
  { value: 'sectionGradientFrom', label: 'Gradient start', description: 'Start of the section gradient.' },
  { value: 'sectionGradientTo', label: 'Gradient end', description: 'End of the section gradient.' },
  { value: 'sectionSplitA', label: 'Split zone A', description: 'First split background zone.' },
  { value: 'sectionSplitB', label: 'Split zone B', description: 'Second split background zone.' },
  { value: 'sectionDivider', label: 'Split divider', description: 'Line between split zones.' },
  { value: 'title', label: 'Section title', description: 'FAQ heading.' },
  { value: 'subtitle', label: 'Section subtitle', description: 'Intro under the title.' },
  { value: 'accent', label: 'Accent', description: 'Accent bars and emphasis.' },
  { value: 'cardBorder', label: 'Item border', description: 'Outline around FAQ rows / cards.' },
  { value: 'cardBackground', label: 'Item background', description: 'Fill behind FAQ content.' },
  { value: 'cardBackgroundA', label: 'Item split A', description: 'First split zone on items.' },
  { value: 'cardBackgroundB', label: 'Item split B', description: 'Second split zone on items.' },
  { value: 'cardDivider', label: 'Item divider', description: 'Divider on split items.' },
  { value: 'question', label: 'Question', description: 'Question text in each row.' },
  { value: 'answer', label: 'Answer', description: 'Expanded answer paragraph.' },
  { value: 'number', label: 'Item number', description: 'Numbered label before questions.' },
  { value: 'expandIcon', label: 'Expand icon', description: 'Plus / chevron icon color.' },
  { value: 'answerAccentBorder', label: 'Answer accent border', description: 'Left border on expanded answers.' },
];

export const DARK_FAQ_PALETTE: PortfolioFaqPalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_FAQ_PALETTE: PortfolioFaqPalette = { ...DARK_FAQ_PALETTE };

export function computeLightFaqPalette(dark: Partial<PortfolioFaqPalette>): PortfolioFaqPalette {
  return computeLightPalette(mergeHeroPalette(DARK_FAQ_PALETTE, dark));
}

export const DEFAULT_FAQ_COLOR_BINDINGS: PortfolioFaqColorBindings = {
  sectionBackground: 'fond',
  sectionGradientFrom: 'fond',
  sectionGradientTo: 'neutre',
  sectionSplitA: 'fond',
  sectionSplitB: 'neutre',
  sectionDivider: 'bordure',
  title: 'texteFort',
  subtitle: 'texteMuted',
  accent: 'principal',
  cardBorder: 'bordure',
  cardBackground: 'neutre',
  cardBackgroundA: 'neutre',
  cardBackgroundB: 'fond',
  cardDivider: 'bordure',
  question: 'texteFort',
  answer: 'texteMuted',
  number: 'principal',
  expandIcon: 'texteMuted',
  answerAccentBorder: 'principal',
};

const FAQ_SLOT_TO_FIELD: Record<FaqColorSlot, string> = {
  sectionBackground: 'sectionBackgroundColor',
  sectionGradientFrom: 'sectionBackgroundGradientFrom',
  sectionGradientTo: 'sectionBackgroundGradientTo',
  sectionSplitA: 'sectionBackgroundColorA',
  sectionSplitB: 'sectionBackgroundColorB',
  sectionDivider: 'sectionBackgroundDividerColor',
  title: 'titleColor',
  subtitle: 'subtitleColor',
  accent: 'accentColor',
  cardBorder: 'cardBorderColor',
  cardBackground: 'cardBackgroundColor',
  cardBackgroundA: 'cardBackgroundColorA',
  cardBackgroundB: 'cardBackgroundColorB',
  cardDivider: 'cardDividerColor',
  question: 'questionColor',
  answer: 'answerColor',
  number: 'numberColor',
  expandIcon: 'expandIconColor',
  answerAccentBorder: 'answerAccentBorderColor',
};

const FAQ_ELEMENT_STYLE_SLOT: Partial<Record<FaqColorSlot, FaqElementStyleTarget>> = {
  question: 'question',
  answer: 'answer',
  number: 'number',
};

type FaqPaletteHost = {
  faqPalette?: Partial<PortfolioFaqPalette>;
  faqColorBindings?: Partial<PortfolioFaqColorBindings>;
  elementStyles?: FaqElementStyles;
};

type FaqPalettePatch = FaqPresentationColorFields;

function surfaceLuminance(hex: string): number {
  const raw = hex.replace('#', '').trim();
  if (raw.length !== 6 || !/^[0-9a-fA-F]+$/.test(raw)) return 0;
  const channel = (start: number) => {
    const c = parseInt(raw.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function inkOnCard(surfaceHex: string, strong: string, muted: string): { strong: string; muted: string } {
  if (surfaceLuminance(surfaceHex) > 0.55) {
    return { strong: '#15151a', muted: '#65656d' };
  }
  return { strong, muted };
}

function paintFaqElementColor(
  styles: FaqElementStyles | undefined,
  target: FaqElementStyleTarget,
  color: string
): FaqElementStyles | undefined {
  if (!styles?.[target]) return styles;
  return {
    ...styles,
    [target]: { ...styles[target], color },
  };
}

export function mergeFaqPalette(base: PortfolioFaqPalette, patch: unknown): PortfolioFaqPalette {
  return mergeHeroPalette(base, patch);
}

export function mergeFaqColorBindings(
  base: PortfolioFaqColorBindings,
  patch: unknown
): PortfolioFaqColorBindings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const slot of FAQ_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}

/** Push palette + bindings into every bound concrete FAQ hex field. */
export function applyFaqPaletteToSettings(faq: FaqPaletteHost): FaqPalettePatch {
  const palette = mergeFaqPalette(DEFAULT_FAQ_PALETTE, faq.faqPalette);
  const bindings = mergeFaqColorBindings(DEFAULT_FAQ_COLOR_BINDINGS, faq.faqColorBindings);
  let elementStyles = faq.elementStyles ? { ...faq.elementStyles } : undefined;

  const patch: Record<string, unknown> = {
    faqPalette: palette,
    faqColorBindings: bindings,
    cardBackgroundEnabled: true,
  };

  const resolve = (slot: FaqColorSlot) => resolveHeroPaletteColor(palette, bindings[slot]);
  const cardSurface = resolve('cardBackground');
  const onCard = inkOnCard(cardSurface, resolve('question'), resolve('answer'));

  for (const slot of FAQ_COLOR_SLOT_IDS) {
    const hex = resolve(slot);
    const elementTarget = FAQ_ELEMENT_STYLE_SLOT[slot];
    if (elementTarget) {
      const cardText =
        elementTarget === 'question'
          ? onCard.strong
          : elementTarget === 'number'
            ? hex
            : onCard.muted;
      elementStyles = paintFaqElementColor(elementStyles, elementTarget, cardText);
    } else if (slot === 'expandIcon') {
      patch.expandIconColor = resolve('expandIcon');
    } else {
      patch[FAQ_SLOT_TO_FIELD[slot]] = hex;
    }
  }

  if (elementStyles) {
    patch.elementStyles = elementStyles;
    patch.questionColor = elementStyles.question?.color ?? onCard.strong;
    patch.answerColor = elementStyles.answer?.color ?? onCard.muted;
    patch.numberColor = elementStyles.number?.color ?? resolve('number');
  } else {
    patch.questionColor = onCard.strong;
    patch.answerColor = onCard.muted;
    patch.numberColor = resolve('number');
    patch.expandIconColor = resolve('expandIcon');
  }

  // Keep list-marker color in sync with the Number / principal slot (render prefers itemMarkerColor).
  patch.itemMarkerColor = patch.numberColor ?? resolve('number');

  return patch as FaqPalettePatch;
}

export function patchFaqPalette(
  faq: FaqPaletteHost,
  palettePatch: Partial<PortfolioFaqPalette>
): FaqPalettePatch {
  const palette = mergeFaqPalette(DEFAULT_FAQ_PALETTE, {
    ...faq.faqPalette,
    ...palettePatch,
  });
  return applyFaqPaletteToSettings({ ...faq, faqPalette: palette });
}

export function patchFaqSlotColor(
  faq: FaqPaletteHost,
  slot: FaqColorSlot,
  hex: string
): FaqPalettePatch {
  const bindings = mergeFaqColorBindings(DEFAULT_FAQ_COLOR_BINDINGS, faq.faqColorBindings);
  return patchFaqPalette(faq, { [bindings[slot]]: hex });
}

export function patchFaqColorBinding(
  faq: FaqPaletteHost,
  slot: FaqColorSlot,
  token: HeroPaletteTokenId
): FaqPalettePatch {
  const bindings = mergeFaqColorBindings(DEFAULT_FAQ_COLOR_BINDINGS, {
    ...faq.faqColorBindings,
    [slot]: token,
  });
  return applyFaqPaletteToSettings({ ...faq, faqColorBindings: bindings });
}

export function patchFaqColorFieldManual(
  faq: FaqPaletteHost,
  slot: FaqColorSlot,
  hex: string
): FaqPalettePatch {
  const elementTarget = FAQ_ELEMENT_STYLE_SLOT[slot];
  if (elementTarget) {
    const elementStyles = paintFaqElementColor(faq.elementStyles, elementTarget, hex);
    const patch: FaqPalettePatch = elementStyles ? { elementStyles } : {};
    if (slot === 'question') patch.questionColor = hex;
    if (slot === 'answer') patch.answerColor = hex;
    if (slot === 'number') {
      patch.numberColor = hex;
      patch.itemMarkerColor = hex;
    }
    return patch;
  }
  return { [FAQ_SLOT_TO_FIELD[slot]]: hex } as FaqPalettePatch;
}

export function patchFaqColorField(
  faq: FaqPaletteHost & { useHeroPalette?: boolean },
  slot: FaqColorSlot,
  hex: string
): FaqPalettePatch {
  if (faq.useHeroPalette === false) {
    return patchFaqColorFieldManual(faq, slot, hex);
  }
  return patchFaqSlotColor(faq, slot, hex);
}

export const FAQ_STYLE_TARGET_COLOR_SLOT: Record<FaqElementStyleTarget, FaqColorSlot> = {
  question: 'question',
  answer: 'answer',
  number: 'number',
};
