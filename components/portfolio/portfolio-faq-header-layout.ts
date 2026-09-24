import type { PortfolioFaqPresentationSettings } from '@/components/portfolio/portfolio-faq-settings';
import {
  faqHeaderPaletteTokenColor,
  type PortfolioFaqHeaderDesignSelectable,
} from '@/components/portfolio/portfolio-faq-header-settings';
import type { DesignLayoutElementOverride } from '@/components/portfolio/portfolio-design-layout-core';

type Presentation = PortfolioFaqPresentationSettings;

/** this → settings owned by the selected header design · all → shared by every header design
 *  (Settings design standard, rule 5: "This [element]" vs "All [elements]"). */
export type FaqHeaderLayoutGroup = 'this' | 'all';

export const FAQ_HEADER_LAYOUT_GROUP_TITLES: Record<FaqHeaderLayoutGroup, string> = {
  this: 'This header',
  all: 'All headers',
};

type SpecBase = {
  key: string;
  label: string;
  group: FaqHeaderLayoutGroup;
  showWhen?: (p: Presentation) => boolean;
};

export type FaqHeaderLayoutToggleSpec = SpecBase & { kind: 'toggle'; defaultVisible: boolean };

export type FaqHeaderLayoutTextSpec = SpecBase & {
  kind: 'text';
  defaultText: string;
  /** Panel hint when the default is computed by the design (e.g. "questions" plural). */
  placeholder?: string;
  hideable?: boolean;
};

export type FaqHeaderLayoutOptionSpec = SpecBase & {
  kind: 'option';
  options: { value: string; label: string; swatch?: string }[];
  defaultValue: string;
};

type FaqHeaderField = 'headerTitleSize' | 'headerMarginBottom' | 'headerDesignAlignment' | 'headerTitleWeight';

/** Writes a shared presentation field directly (not the per-design store). `fontPx` renders the
 *  options as a progressive letter-size pill (standard rule 1e). */
export type FaqHeaderLayoutFieldOptionSpec = SpecBase & {
  kind: 'fieldOption';
  field: FaqHeaderField;
  options: { value: string; label: string; fontPx?: number; fontWeight?: number }[];
};

export type FaqHeaderLayoutFieldToggleSpec = SpecBase & { kind: 'fieldToggle'; field: 'headerAnimationEnabled' };

export type FaqHeaderLayoutElementSpec =
  | FaqHeaderLayoutToggleSpec
  | FaqHeaderLayoutTextSpec
  | FaqHeaderLayoutOptionSpec
  | FaqHeaderLayoutFieldOptionSpec
  | FaqHeaderLayoutFieldToggleSpec;

const visibleWhen =
  (design: PortfolioFaqHeaderDesignSelectable, ...keys: string[]) =>
  (p: Presentation) =>
    keys.every((key) => resolveFaqHeaderLayoutVisible(p, design, key));

const toggle = (key: string, label: string, extra: Partial<FaqHeaderLayoutToggleSpec> = {}): FaqHeaderLayoutToggleSpec => ({
  kind: 'toggle',
  key,
  label,
  group: 'this',
  defaultVisible: true,
  ...extra,
});

const text = (key: string, label: string, defaultText: string, extra: Partial<FaqHeaderLayoutTextSpec> = {}): FaqHeaderLayoutTextSpec => ({
  kind: 'text',
  key,
  label,
  group: 'this',
  defaultText,
  ...extra,
});

/** Shared by every header design — same fields the old frozen Header tab used, now surfaced. */
const ALL_HEADERS: FaqHeaderLayoutElementSpec[] = [
  {
    kind: 'fieldOption',
    key: 'titleSize',
    label: 'Title size',
    group: 'all',
    field: 'headerTitleSize',
    options: [
      { value: 'sm', label: 'S', fontPx: 12 },
      { value: 'md', label: 'M', fontPx: 15 },
      { value: 'lg', label: 'L', fontPx: 18 },
      { value: 'xl', label: 'XL', fontPx: 22 },
    ],
  },
  {
    kind: 'fieldOption',
    key: 'spacing',
    label: 'Space below',
    group: 'all',
    field: 'headerMarginBottom',
    options: [
      { value: 'sm', label: 'Small' },
      { value: 'md', label: 'Medium' },
      { value: 'lg', label: 'Large' },
      { value: 'xl', label: 'XL' },
    ],
  },
  { kind: 'fieldToggle', key: 'animation', label: 'Entrance animation', group: 'all', field: 'headerAnimationEnabled' },
];

export const FAQ_HEADER_INK_OPTIONS = [
  { value: 'principal', label: 'Principal', swatch: faqHeaderPaletteTokenColor('principal') },
  { value: 'secondaire', label: 'Secondary', swatch: faqHeaderPaletteTokenColor('secondaire') },
  { value: 'texteFort', label: 'Strong text', swatch: faqHeaderPaletteTokenColor('texteFort') },
];

export const FAQ_HEADER_LAYOUT_SPECS: Record<PortfolioFaqHeaderDesignSelectable, FaqHeaderLayoutElementSpec[]> = {
  editorial: [
    text('kicker', 'Kicker', 'FAQ'),
    {
      kind: 'fieldOption',
      key: 'alignment',
      label: 'Alignment',
      group: 'this',
      field: 'headerDesignAlignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
      ],
    },
    {
      kind: 'fieldOption',
      key: 'titleWeight',
      label: 'Title weight',
      group: 'this',
      field: 'headerTitleWeight',
      // Each label is drawn in the weight it stands for (the weight counterpart of rule 1e).
      options: [
        { value: 'light', label: 'Thin', fontWeight: 100 },
        { value: 'regular', label: 'Light', fontWeight: 300 },
        { value: 'semibold', label: 'Medium', fontWeight: 500 },
        { value: 'bold', label: 'Semibold', fontWeight: 600 },
        { value: 'extrabold', label: 'Bold', fontWeight: 700 },
      ],
    },
    ...ALL_HEADERS,
  ],
  signal: [
    toggle('pill', 'Status pill'),
    text('pillLabel', 'Pill label', 'FAQ', { showWhen: visibleWhen('signal', 'pill') }),
    toggle('count', 'Question count', { showWhen: visibleWhen('signal', 'pill') }),
    text('countLabel', 'Count label', '', {
      placeholder: 'questions',
      hideable: false,
      showWhen: visibleWhen('signal', 'pill', 'count'),
    }),
    {
      kind: 'option',
      key: 'dotColor',
      label: 'Dot color',
      group: 'this',
      options: FAQ_HEADER_INK_OPTIONS,
      defaultValue: 'principal',
      showWhen: visibleWhen('signal', 'pill'),
    },
    {
      kind: 'option',
      key: 'subtitlePlacement',
      label: 'Subtitle position',
      group: 'this',
      options: [
        { value: 'side', label: 'Side' },
        { value: 'below', label: 'Below' },
      ],
      defaultValue: 'side',
    },
    ...ALL_HEADERS,
  ],
  query: [
    toggle('glyph', 'Watermark glyph'),
    text('glyphChar', 'Glyph', '?', { hideable: false, showWhen: visibleWhen('query', 'glyph') }),
    {
      kind: 'option',
      key: 'glyphIntensity',
      label: 'Glyph intensity',
      group: 'this',
      options: [
        { value: 'subtle', label: 'Subtle' },
        { value: 'medium', label: 'Medium' },
        { value: 'bold', label: 'Bold' },
      ],
      defaultValue: 'medium',
      showWhen: visibleWhen('query', 'glyph'),
    },
    text('kicker', 'Side label', 'FAQ'),
    ...ALL_HEADERS,
  ],
  dialogue: [
    text('tag', 'Tag', '(FAQ)'),
    toggle('alternate', 'Alternating words'),
    toggle('badge', 'Count badge'),
    text('badgeLabel', 'Badge label', '', {
      placeholder: 'questions',
      hideable: false,
      showWhen: visibleWhen('dialogue', 'badge'),
    }),
    toggle('rule', 'Divider line'),
    ...ALL_HEADERS,
  ],
};

function findSpec(design: PortfolioFaqHeaderDesignSelectable, key: string): FaqHeaderLayoutElementSpec | undefined {
  return FAQ_HEADER_LAYOUT_SPECS[design]?.find((spec) => spec.key === key);
}

export function faqHeaderLayoutOverride(
  p: Presentation,
  design: PortfolioFaqHeaderDesignSelectable,
  key: string
): DesignLayoutElementOverride | undefined {
  return p.headerLayouts?.[design]?.elements?.[key];
}

export function resolveFaqHeaderLayoutVisible(p: Presentation, design: PortfolioFaqHeaderDesignSelectable, key: string): boolean {
  const spec = findSpec(design, key);
  if (!spec || (spec.kind !== 'toggle' && spec.kind !== 'text')) return true;
  if (spec.kind === 'text' && spec.hideable === false) return true;
  const override = faqHeaderLayoutOverride(p, design, key);
  if (typeof override?.visible === 'boolean') return override.visible;
  return spec.kind === 'toggle' ? spec.defaultVisible : true;
}

/** Override, else the design default; `null` when hidden or empty (caller then uses its own
 *  computed fallback, e.g. an automatic singular/plural). */
export function resolveFaqHeaderLayoutText(p: Presentation, design: PortfolioFaqHeaderDesignSelectable, key: string): string | null {
  if (!resolveFaqHeaderLayoutVisible(p, design, key)) return null;
  const spec = findSpec(design, key);
  const defaultText = spec?.kind === 'text' ? spec.defaultText : '';
  return faqHeaderLayoutOverride(p, design, key)?.text?.trim() || defaultText.trim() || null;
}

export function resolveFaqHeaderLayoutOption(p: Presentation, design: PortfolioFaqHeaderDesignSelectable, key: string): string {
  const spec = findSpec(design, key);
  if (spec?.kind !== 'option') return '';
  const choice = faqHeaderLayoutOverride(p, design, key)?.choice;
  return choice && spec.options.some((option) => option.value === choice) ? choice : spec.defaultValue;
}

export type FaqHeaderLayoutResolver = {
  isVisible: (key: string) => boolean;
  text: (key: string) => string | null;
  option: (key: string) => string;
};

export function createFaqHeaderLayoutResolver(
  p: Presentation,
  design: PortfolioFaqHeaderDesignSelectable
): FaqHeaderLayoutResolver {
  return {
    isVisible: (key) => resolveFaqHeaderLayoutVisible(p, design, key),
    text: (key) => resolveFaqHeaderLayoutText(p, design, key),
    option: (key) => resolveFaqHeaderLayoutOption(p, design, key),
  };
}

export function patchFaqHeaderLayoutElement(
  p: Presentation,
  design: PortfolioFaqHeaderDesignSelectable,
  key: string,
  patch: DesignLayoutElementOverride
): Pick<Presentation, 'headerLayouts'> {
  const layout = p.headerLayouts?.[design] ?? {};
  return {
    headerLayouts: {
      ...(p.headerLayouts ?? {}),
      [design]: {
        ...layout,
        elements: { ...(layout.elements ?? {}), [key]: { ...(layout.elements?.[key] ?? {}), ...patch } },
      },
    },
  };
}

/** Shared title-size scale — 'md' matches the fixed size Signal/Query/Dialogue shipped with. */
export const FAQ_HEADER_TITLE_SIZE_CLASS: Record<string, string> = {
  sm: 'text-4xl sm:text-5xl lg:text-6xl',
  md: 'text-5xl sm:text-6xl lg:text-7xl',
  lg: 'text-6xl sm:text-7xl lg:text-8xl',
  xl: 'text-7xl sm:text-8xl lg:text-9xl',
};

/** "N questions" — a custom label replaces the word, the default keeps singular/plural right. */
export function faqHeaderCountLabel(count: number, customLabel: string | null): string {
  if (customLabel) return `${count} ${customLabel}`;
  return count === 1 ? '1 question' : `${count} questions`;
}
