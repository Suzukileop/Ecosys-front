import { inferProfileMediaType } from '@/lib/profile-media-type';
import type { ProductWhyBlock } from '@/types/marketplace';

/*
 * "Why this product" blocks: form shape, parsing from the API and serializing back. No zod here —
 * lib/marketplace-api imports these, and through it every page that touches the marketplace API
 * (public portfolios included). The zod schema for the product editor is in product-why-block-schema.
 */
export type ProductWhyBlockForm = {
  id: string;
  sortOrder: number;
  /** media = photo/video + captions; text = text catalog only */
  kind: 'media' | 'text';
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | null;
  opinions: Array<{ value: string }>;
};

export function createEmptyProductWhyBlock(
  sortOrder: number,
  kind: 'media' | 'text' = 'media'
): ProductWhyBlockForm {
  return {
    id: crypto.randomUUID(),
    sortOrder,
    kind,
    mediaUrl: '',
    mediaType: null,
    opinions: [{ value: '' }],
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
    const kindRaw = block.kind != null ? String(block.kind).toLowerCase() : null;
    const kind: 'media' | 'text' =
      kindRaw === 'text' ? 'text' : kindRaw === 'media' ? 'media' : mediaUrl.trim() ? 'media' : 'text';

    blocks.push({
      id: block.id != null ? String(block.id) : crypto.randomUUID(),
      sortOrder: typeof block.sortOrder === 'number' ? block.sortOrder : index,
      kind,
      mediaUrl,
      mediaType: mediaUrl ? mediaType ?? inferProfileMediaType(mediaUrl) : null,
      opinions: mergeLegacyIntoOpinions(block),
    });
  });

  return blocks.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function serializeProductWhyBlocks(blocks: ProductWhyBlockForm[]): ProductWhyBlock[] {
  const result: ProductWhyBlock[] = [];

  for (const block of blocks) {
    const opinions = block.opinions.map((item) => item.value.trim()).filter(Boolean);
    const mediaUrl = block.mediaUrl?.trim() ?? '';
    const kind = block.kind === 'text' || !mediaUrl ? 'text' : 'media';

    if (opinions.length === 0) continue;
    if (kind === 'media' && !mediaUrl) continue;

    if (kind === 'text') {
      result.push({
        id: block.id,
        sortOrder: result.length,
        opinions,
      });
      continue;
    }

    result.push({
      id: block.id,
      sortOrder: result.length,
      mediaUrl,
      mediaType: block.mediaType ?? inferProfileMediaType(mediaUrl),
      opinions,
    });
  }

  return result;
}
