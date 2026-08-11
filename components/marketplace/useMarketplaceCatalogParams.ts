'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ProductType } from '@/types/marketplace';

export type MarketplaceSort = 'newest' | 'popular' | 'views' | 'price_asc' | 'price_desc';

export const MARKETPLACE_PAGE_SIZE_OPTIONS = [10, 50, 100, 200, 500, 1000] as const;
export const MARKETPLACE_DEFAULT_PAGE_SIZE = MARKETPLACE_PAGE_SIZE_OPTIONS[0];

export type MarketplaceCatalogParams = {
  q: string;
  genre: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  sort: MarketplaceSort;
  page: number;
  size: number;
};

function parseEuroToCents(value: string): number | undefined {
  const trimmed = value.trim().replace(',', '.');
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0) return undefined;
  return Math.round(num * 100);
}

function parseSort(value: string | null): MarketplaceSort {
  if (
    value === 'newest' ||
    value === 'views' ||
    value === 'price_asc' ||
    value === 'price_desc'
  ) {
    return value;
  }
  return 'popular';
}

function parsePageSize(value: string | null): number {
  const parsed = Number(value);
  if (
    MARKETPLACE_PAGE_SIZE_OPTIONS.includes(
      parsed as (typeof MARKETPLACE_PAGE_SIZE_OPTIONS)[number]
    )
  ) {
    return parsed;
  }
  return MARKETPLACE_DEFAULT_PAGE_SIZE;
}

export function useMarketplaceCatalogParams(basePath = '/marketplace') {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const genre = searchParams.get('genre') ?? '';
  const type = searchParams.get('type') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sort = parseSort(searchParams.get('sort'));
  const page = Math.max(0, Number(searchParams.get('page') ?? '0') || 0);
  const size = parsePageSize(searchParams.get('size'));

  const pushParams = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === '') params.delete(key);
      else params.set(key, value);
    });
    const qs = params.toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath);
  };

  const resetFilters = () => {
    const tab = searchParams.get('tab');
    const params = new URLSearchParams();
    if (tab === 'favorites' || tab === 'purchases') {
      params.set('tab', tab);
    }
    const qs = params.toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath);
  };

  const apiParams = useMemo(
    () => ({
      q: q.trim() || undefined,
      genre: genre || undefined,
      type: (type || undefined) as ProductType | undefined,
      minPriceCents: parseEuroToCents(minPrice),
      maxPriceCents: parseEuroToCents(maxPrice),
      sort: sort === 'popular' ? undefined : sort,
      page,
      size,
    }),
    [q, genre, type, minPrice, maxPrice, sort, page, size]
  );

  const hasActiveFilters = Boolean(
    q.trim() || genre || type || minPrice || maxPrice || sort !== 'popular'
  );

  return {
    q,
    genre,
    type,
    minPrice,
    maxPrice,
    sort,
    page,
    size,
    pushParams,
    resetFilters,
    apiParams,
    hasActiveFilters,
  };
}
