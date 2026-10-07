/**
 * FAQ palette — same 8 semantic tokens as Hero / Work / Services.
 * Concrete hex fields still drive render; bindings choose which token paints each slot.
 */

import { DEFAULT_HERO_PALETTE, HERO_PALETTE_TOKEN_IDS, mergeHeroPalette, resolveHeroPaletteColor, type HeroPaletteTokenId, type PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';

/** Local mirrors — avoid importing portfolio-faq-settings (circular TDZ). */
type FaqElementStyleTarget = 'question' | 'answer' | 'number';

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

const FAQ_COLOR_SLOT_IDS: FaqColorSlot[] = [
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

const DARK_FAQ_PALETTE: PortfolioFaqPalette = { ...DEFAULT_HERO_PALETTE };
export const DEFAULT_FAQ_PALETTE: PortfolioFaqPalette = { ...DARK_FAQ_PALETTE };

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
