import type { PagedResponse, SpringPageRaw } from '@/types/profile';

export function normalizeSpringPage<T>(raw: SpringPageRaw<T>): PagedResponse<T> {
  const content = raw.content ?? [];
  const number = raw.number ?? 0;
  const size = raw.size ?? content.length;
  const totalElements = raw.totalElements ?? content.length;
  const totalPages = raw.totalPages ?? (size > 0 ? Math.ceil(totalElements / size) : 0);
  return {
    content,
    page: number,
    size,
    totalElements,
    totalPages,
    last: raw.last ?? (totalPages <= 1 || number >= totalPages - 1),
  };
}
