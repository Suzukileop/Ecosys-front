import { z } from 'zod';
import type { ProductWhyBlockForm } from '@/components/marketplace/product-why-blocks';

const opinionItemSchema = z.object({
  value: z.string().max(500),
});

export const productWhyBlockSchema = z.object({
  id: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  /** media = photo/video + captions; text = text catalog only */
  kind: z.enum(['media', 'text']),
  mediaUrl: z.string().optional().or(z.literal('')),
  mediaType: z.enum(['IMAGE', 'VIDEO']).nullable().optional(),
  opinions: z.array(opinionItemSchema).max(10),
});

/* The form type lives with the zod-free helpers; this keeps the schema in step with it. */
const schemaMatchesForm: z.ZodType<ProductWhyBlockForm> = productWhyBlockSchema;
void schemaMatchesForm;

export {
  createEmptyProductWhyBlock,
  parseProductWhyBlocks,
  serializeProductWhyBlocks,
  type ProductWhyBlockForm,
} from '@/components/marketplace/product-why-blocks';

