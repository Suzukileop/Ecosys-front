import { z } from 'zod';
import { inferProfileMediaType } from '@/components/creator/studio/profile-form-schema';
import type { ProductWhyBlock } from '@/types/marketplace';

export const opinionItemSchema = z.object({
  value: z.string().max(500),
});

export const productWhyBlockSchema = z.object({
  id: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  mediaUrl: z.string().optional().or(z.literal('')),
  mediaType: z.enum(['IMAGE', 'VIDEO']).nullable().optional(),
  opinions: z.array(opinionItemSchema).max(10),
});

export type ProductWhyBlockForm = z.infer<typeof productWhyBlockSchema>;

export function createEmptyProductWhyBlock(sortOrder: number): ProductWhyBlockForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    mediaUrl: '',
    mediaType: null,
    opinions: [],
  };
}

function parseOpinionStrings(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && 'value' in item) {
        return String((item as { value: unknown }).value).trim();
      }
      return '';
    })
    .filter(Boolean);
}

function mergeLegacyIntoOpinions(block: Record<string, unknown>): Array<{ value: string }> {
  const merged: string[] = [];

  for (const opinion of parseOpinionStrings(block.opinions)) {
    merged.push(opinion);
  }

  const legacyText = block.text != null ? String(block.text).trim() : '';
  if (legacyText) {
    merged.push(legacyText);
  }

  for (const subtitle of parseOpinionStrings(block.subtitles)) {
    merged.push(subtitle);
  }

  return merged.map((value) => ({ value }));
}

export function parseProductWhyBlocks(raw: unknown): ProductWhyBlockForm[] {
  if (!Array.isArray(raw)) return [];

  const blocks: ProductWhyBlockForm[] = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const block = item as Record<string, unknown>;
    const mediaUrl = block.mediaUrl != null ? String(block.mediaUrl) : '';
    const mediaTypeRaw = block.mediaType != null ? String(block.mediaType).toUpperCase() : null;
    const mediaType = mediaTypeRaw === 'VIDEO' ? 'VIDEO' : mediaTypeRaw === 'IMAGE' ? 'IMAGE' : null;

    blocks.push({
      id: block.id != null ? String(block.id) : crypto.randomUUID(),
      sortOrder: typeof block.sortOrder === 'number' ? block.sortOrder : index,
      mediaUrl,
      mediaType: mediaUrl ? mediaType ?? inferProfileMediaType(mediaUrl) : null,
      opinions: mergeLegacyIntoOpinions(block),
    });
  });

  return blocks.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function serializeProductWhyBlocks(blocks: ProductWhyBlockForm[]): ProductWhyBlock[] {
  return blocks
    .filter((block) => {
      const mediaUrl = block.mediaUrl?.trim();
      const opinions = block.opinions.map((item) => item.value.trim()).filter(Boolean);
      return Boolean(mediaUrl) && opinions.length > 0;
    })
    .map((block, index) => {
      const mediaUrl = block.mediaUrl!.trim();
      return {
        id: block.id,
        sortOrder: index,
        mediaUrl,
        mediaType: block.mediaType ?? inferProfileMediaType(mediaUrl),
        opinions: block.opinions.map((item) => item.value.trim()).filter(Boolean),
      };
    });
}
