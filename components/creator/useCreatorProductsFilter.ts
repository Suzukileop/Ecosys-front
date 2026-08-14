'use client';

import { useEffect, useMemo, useState } from 'react';
import { collectProductLabels } from '@/lib/marketplace-api';
import type { MarketplaceProductSummary, ProductType } from '@/types/marketplace';

export type CreatorProductStatusFilter = 'all' | 'published' | 'draft';

export type CreatorProductFormatFilter = 'all' | 'virtual' | 'physical';

export type CreatorProductSort =
  | 'newest'
  | 'oldest'
  | 'title'
  | 'price_asc'
  | 'price_desc'
  | 'views'
  | 'bestseller';

export function useCreatorProductsFilter(products: MarketplaceProductSummary[]) {
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<CreatorProductStatusFilter>('published');
  const [format, setFormat] = useState<CreatorProductFormatFilter>('all');
  const [type, setType] = useState<ProductType | ''>('');
  const [sort, setSort] = useState<CreatorProductSort>('newest');

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(queryInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [queryInput]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();

    let list = products.filter((product) => {
      if (status === 'published' && !product.isPublished) return false;
      if (status === 'draft' && product.isPublished) return false;
      if (format === 'physical' && product.type !== 'PHYSICAL') return false;
      if (format === 'virtual' && product.type === 'PHYSICAL') return false;
      if (type && product.type !== type) return false;
      if (sort === 'bestseller' && !product.isBestseller) return false;

      if (!needle) return true;

      const { genre, tags } = collectProductLabels(product);
      const haystack = [
        product.title,
        product.description ?? '',
        product.genre ?? '',
        product.specialite ?? '',
        genre ?? '',
        ...tags,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });

    list = [...list].sort((a, b) => {
      const rank = (product: MarketplaceProductSummary) => {
        if (product.isPinned) return 0;
        if (product.isBestseller) return 1;
        return 2;
      };
      const rankDiff = rank(a) - rank(b);
      if (rankDiff !== 0) return rankDiff;

      switch (sort) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        case 'price_asc':
          return a.priceCents - b.priceCents;
        case 'price_desc':
          return b.priceCents - a.priceCents;
        case 'views':
          return (b.views ?? 0) - (a.views ?? 0);
        case 'bestseller':
          return (b.salesCount ?? 0) - (a.salesCount ?? 0) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return list;
  }, [products, query, status, format, type, sort]);

  // Default view is published — only draft (and other non-default filters) count as active.
  const hasActiveFilters =
    query !== '' || status === 'draft' || format !== 'all' || type !== '' || sort !== 'newest';

  const resetFilters = () => {
    setQueryInput('');
    setQuery('');
    setStatus('published');
    setFormat('all');
    setType('');
    setSort('newest');
  };

  return {
    query: queryInput,
    setQuery: setQueryInput,
    status,
    setStatus,
    format,
    setFormat,
    type,
    setType,
    sort,
    setSort,
    filtered,
    hasActiveFilters,
    resetFilters,
  };
}
