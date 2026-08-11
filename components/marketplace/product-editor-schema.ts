import { z } from 'zod';
import { subtitleItemSchema } from '@/components/creator/studio/profile-form-schema';
import { productWhyBlockSchema } from '@/components/marketplace/product-why-block-schema';
import type { DemoType, ProductType } from '@/types/marketplace';

export const PRODUCT_TYPES = [
  'EBOOK',
  'PDF',
  'VIDEO',
  'AUDIO',
  'TEMPLATE',
  'COURSE',
  'PRESET',
  'SOFTWARE',
  'IMAGE_PACK',
  'FONT',
  'OTHER',
] as const satisfies readonly ProductType[];

export const DEMO_TYPES = ['NONE', 'IMAGE', 'VIDEO', 'FILE_EXTRACT'] as const satisfies readonly DemoType[];

export const productEditorSchema = z.object({
  type: z.enum(PRODUCT_TYPES),
  title: z.string().min(1, 'Title is required.').max(200),
  description: z.string().min(1, 'Description is required.').max(5000),
  priceAmount: z
    .string()
    .min(1, 'Price is required.')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid price.'),
  compareAtPriceAmount: z.string().optional(),
  currency: z.string().min(3).max(3),
  genre: z.string().optional(),
  specialite: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  demoType: z.enum(DEMO_TYPES),
  demoUrl: z.string().optional(),
  demoDescription: z.string().optional(),
  demoSubtitles: z.array(subtitleItemSchema).max(10),
  whyProductBlocks: z.array(productWhyBlockSchema).max(10),
  deliveryMode: z.enum(['STREAM_ONLY', 'DOWNLOAD', 'BOTH']),
  licenseType: z.enum(['PERSONAL', 'COMMERCIAL', 'EXTENDED']),
  compatibleTools: z.array(z.object({ value: z.string().min(1) })).max(10),
  fileFormat: z.string().optional(),
  fileSizeMb: z.string().optional(),
  language: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.object({ value: z.string().min(1) })).max(15),
  videoDuration: z.string().optional(),
  videoResolution: z.string().optional(),
  isBestseller: z.boolean(),
  isPublished: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productEditorSchema>;
