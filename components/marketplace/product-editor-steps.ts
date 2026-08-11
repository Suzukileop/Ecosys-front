import type { ProductType } from '@/types/marketplace';

export const PRODUCT_EDITOR_STEPS = [
  {
    id: 'file',
    label: 'Product file',
    description: 'Upload the file buyers receive after purchase.',
  },
  {
    id: 'details',
    label: 'Product details',
    description: 'Title, type, genre and description shown on your public profile.',
  },
  {
    id: 'pricing',
    label: 'Pricing',
    description: 'Set a sale price, mark as free, or show a discount.',
  },
  {
    id: 'media',
    label: 'Media & demo',
    description: 'Thumbnail, demo media and product highlights.',
  },
  {
    id: 'settings',
    label: 'Delivery & publish',
    description: 'License, delivery mode, tags and catalog visibility.',
  },
] as const;

export type ProductEditorStepId = (typeof PRODUCT_EDITOR_STEPS)[number]['id'];

const STEP_FIELDS: Record<ProductEditorStepId, readonly string[]> = {
  file: [],
  details: ['title', 'type', 'genre', 'description'],
  pricing: ['priceAmount', 'currency', 'compareAtPriceAmount'],
  media: ['thumbnailUrl', 'demoUrl', 'demoSubtitles', 'whyProductBlocks', 'videoDuration', 'videoResolution'],
  settings: [
    'deliveryMode',
    'licenseType',
    'fileFormat',
    'fileSizeMb',
    'language',
    'version',
    'isBestseller',
    'isPublished',
  ],
};

export function fieldsForStep(stepId: ProductEditorStepId, productType: ProductType): readonly string[] {
  const fields = STEP_FIELDS[stepId];
  if (stepId === 'media' && productType !== 'VIDEO') {
    return fields.filter((f) => f !== 'videoDuration' && f !== 'videoResolution');
  }
  return fields;
}
