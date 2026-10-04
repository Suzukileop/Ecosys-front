import type { ProductType } from '@/types/marketplace';

export type ProductFormat = 'virtual' | 'physical';

export const PRODUCT_EDITOR_STEPS_VIRTUAL = [
  {
    id: 'basics',
    label: 'Basics',
    description: 'Name your product and set a price. Everything else can come later.',
  },
  {
    id: 'media',
    label: 'Cover & demo',
    description: 'Show buyers what they get: a cover, plus an optional preview.',
  },
  {
    id: 'highlights',
    label: 'Highlights',
    description: 'Give buyers a few clear reasons to choose your product.',
  },
  {
    id: 'settings',
    label: 'Details',
    description: 'Technical details help the right buyers find it.',
  },
] as const;

export const PRODUCT_EDITOR_STEPS_PHYSICAL = [
  {
    id: 'basics',
    label: 'Basics',
    description: 'Name your product and set a price. Everything else can come later.',
  },
  {
    id: 'media',
    label: 'Photos',
    description: 'A sharp cover sells the product. Add more angles if you have them.',
  },
] as const;

export const PRODUCT_EDITOR_STEPS = PRODUCT_EDITOR_STEPS_VIRTUAL;

export type ProductEditorStepId =
  | (typeof PRODUCT_EDITOR_STEPS_VIRTUAL)[number]['id']
  | (typeof PRODUCT_EDITOR_STEPS_PHYSICAL)[number]['id'];

export function stepsForFormat(format: ProductFormat) {
  return format === 'physical' ? PRODUCT_EDITOR_STEPS_PHYSICAL : PRODUCT_EDITOR_STEPS_VIRTUAL;
}

const STEP_FIELDS_VIRTUAL: Record<ProductEditorStepId, readonly string[]> = {
  basics: ['title', 'type', 'genre', 'description', 'tags', 'priceAmount', 'currency', 'compareAtPriceAmount'],
  media: ['thumbnailUrl', 'demoUrl', 'demoSubtitles', 'videoDuration', 'videoResolution'],
  highlights: ['whyProductBlocks'],
  settings: ['fileFormat', 'fileSizeMb', 'language', 'version'],
};

const STEP_FIELDS_PHYSICAL: Record<'basics' | 'media', readonly string[]> = {
  basics: ['title', 'description', 'tags', 'priceAmount', 'currency', 'compareAtPriceAmount', 'stockQuantity'],
  media: ['thumbnailUrl', 'galleryImages'],
};

export function fieldsForStep(
  stepId: ProductEditorStepId,
  productType: ProductType,
  format: ProductFormat = 'virtual'
): readonly string[] {
  if (format === 'physical') {
    if (stepId === 'basics' || stepId === 'media') {
      return STEP_FIELDS_PHYSICAL[stepId];
    }
    return [];
  }
  const fields = STEP_FIELDS_VIRTUAL[stepId] ?? [];
  if (stepId === 'media' && productType !== 'VIDEO') {
    return fields.filter((f) => f !== 'videoDuration' && f !== 'videoResolution');
  }
  return fields;
}
