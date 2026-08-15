import api from '@/lib/api';
import type { CreatorContentItemDto } from '@/types/creator-content';
import type { CreatorProfileDto, CreatorProfileUpdateBody } from '@/types/ecosystem';

export async function getCreatorPortfolio(): Promise<CreatorContentItemDto[]> {
  const res = await api.get<CreatorContentItemDto[]>('/api/creator/profile/portfolio');
  return res.data;
}

export async function updateCreatorPortfolio(contentPostIds: string[]): Promise<CreatorContentItemDto[]> {
  const res = await api.put<CreatorContentItemDto[]>('/api/creator/profile/portfolio', { contentPostIds });
  return res.data;
}

function asProductIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string' && id.length > 0);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Estimate UTF-8 JSON size without throwing on circular structures. */
function estimateJsonBytes(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/**
 * Drop embedded data-URL images that bloat portfolio settings (backgrounds, themes).
 * Keeps remote URLs intact. Used only as a salvage path when PUT exceeds 512 KB.
 */
function stripEmbeddedDataUrls(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.startsWith('data:image') || value.startsWith('data:video') ? null : value;
  }
  if (Array.isArray(value)) {
    return value.map(stripEmbeddedDataUrls);
  }
  if (isPlainRecord(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = stripEmbeddedDataUrls(entry);
    }
    return out;
  }
  return value;
}

const PORTFOLIO_SETTINGS_SOFT_LIMIT = 480_000;

/** Featured marketplace products curated for the public portfolio page. */
export async function getCuratedProductIds(): Promise<string[]> {
  const res = await api.get<Record<string, unknown>>('/api/creator/profile/portfolio-settings');
  return asProductIdList(res.data?.curatedProductIds);
}

/**
 * Persist product showcase order without expanding the full settings document
 * (mergePortfolioSettings would inflate defaults and blow past 512 KB).
 */
export async function updateCuratedProductIds(productIds: string[]): Promise<string[]> {
  const unique = Array.from(new Set(productIds.filter((id) => typeof id === 'string' && id.length > 0)));
  const current = await api.get<Record<string, unknown>>('/api/creator/profile/portfolio-settings');
  const raw = isPlainRecord(current.data) ? { ...current.data } : {};

  let payload: Record<string, unknown> = {
    ...raw,
    curatedProductIds: unique,
    updatedAt: new Date().toISOString(),
  };

  // Never re-expand via merge — only patch. If the saved blob is already huge
  // (embedded backgrounds/themes), strip data: URLs so product curation can still save.
  if (estimateJsonBytes(payload) > PORTFOLIO_SETTINGS_SOFT_LIMIT) {
    payload = stripEmbeddedDataUrls(payload) as Record<string, unknown>;
    payload.curatedProductIds = unique;
    payload.updatedAt = new Date().toISOString();
  }

  const res = await api.put<Record<string, unknown>>(
    '/api/creator/profile/portfolio-settings',
    payload
  );
  return asProductIdList(res.data?.curatedProductIds) ?? unique;
}

export async function updateCreatorProfile(body: CreatorProfileUpdateBody): Promise<CreatorProfileDto> {
  const res = await api.put<CreatorProfileDto>('/api/creator/profile', body);
  return res.data;
}

export async function suggestSpecialties(q: string): Promise<string[]> {
  const query = q.trim();
  if (!query) return [];
  const res = await api.get<string[]>('/api/marketplace/creators/specialties', { params: { q: query } });
  return Array.isArray(res.data) ? res.data.filter((item) => typeof item === 'string' && item.trim()) : [];
}
