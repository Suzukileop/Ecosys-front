import type { ProductType } from '@/types/marketplace';
import type {
  GlobalSearchCategory,
  GlobalSearchPageData,
} from '@/lib/global-search';

export type GlobalSearchDateFilter = 'any' | '7d' | '30d' | '90d';
export type GlobalSearchSortFilter = 'newest' | 'oldest' | 'popular';
export type GlobalSearchContentMediaFilter = 'all' | 'photo' | 'video' | 'gif';
export type GlobalSearchProductTypeFilter = 'all' | ProductType;

export type GlobalSearchFilters = {
  categories: GlobalSearchCategory[];
  dateRange: GlobalSearchDateFilter;
  sort: GlobalSearchSortFilter;
  productType: GlobalSearchProductTypeFilter;
  contentMedia: GlobalSearchContentMediaFilter;
};

export const GLOBAL_SEARCH_DATE_OPTIONS: { value: GlobalSearchDateFilter; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export const GLOBAL_SEARCH_SORT_OPTIONS: { value: GlobalSearchSortFilter; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'popular', label: 'Most popular' },
];

export const GLOBAL_SEARCH_PRODUCT_TYPE_OPTIONS: {
  value: GlobalSearchProductTypeFilter;
  label: string;
}[] = [
  { value: 'all', label: 'All products' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'IMAGE_PACK', label: 'Photos / images' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'EBOOK', label: 'eBook' },
  { value: 'PDF', label: 'PDF' },
  { value: 'TEMPLATE', label: 'Template' },
  { value: 'COURSE', label: 'Course' },
  { value: 'OTHER', label: 'Other' },
];

export const GLOBAL_SEARCH_CONTENT_MEDIA_OPTIONS: {
  value: GlobalSearchContentMediaFilter;
  label: string;
}[] = [
  { value: 'all', label: 'All media' },
  { value: 'photo', label: 'Photos only' },
  { value: 'video', label: 'Videos only' },
  { value: 'gif', label: 'GIFs only' },
];

export const GLOBAL_SEARCH_CATEGORY_OPTIONS: { value: GlobalSearchCategory; label: string }[] = [
  { value: 'users', label: 'Users' },
  { value: 'creators', label: 'Creators' },
  { value: 'products', label: 'Products' },
  { value: 'content', label: 'Content' },
];

export function createDefaultGlobalSearchFilters(isAuthenticated: boolean): GlobalSearchFilters {
  return {
    categories: isAuthenticated
      ? ['users', 'creators', 'products', 'content']
      : ['creators', 'products', 'content'],
    dateRange: 'any',
    sort: 'newest',
    productType: 'all',
    contentMedia: 'all',
  };
}

export function isGlobalSearchFiltersActive(
  filters: GlobalSearchFilters,
  isAuthenticated: boolean
): boolean {
  const defaults = createDefaultGlobalSearchFilters(isAuthenticated);
  if (filters.categories.length !== defaults.categories.length) return true;
  if (!defaults.categories.every((category) => filters.categories.includes(category))) return true;
  return (
    filters.dateRange !== defaults.dateRange ||
    filters.sort !== defaults.sort ||
    filters.productType !== defaults.productType ||
    filters.contentMedia !== defaults.contentMedia
  );
}

function getDateCutoff(dateRange: GlobalSearchDateFilter): Date | null {
  if (dateRange === 'any') return null;
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

function isContentVideo(mediaUrl: string | null | undefined, mediaType?: string | null): boolean {
  if (mediaType === 'GIF') return false;
  const url = mediaUrl?.toLowerCase() ?? '';
  return /\.(mp4|webm|mov|m4v|avi)(\?|$)/.test(url);
}

function isContentPhoto(mediaUrl: string | null | undefined, mediaType?: string | null): boolean {
  if (mediaType === 'GIF') return false;
  if (isContentVideo(mediaUrl, mediaType)) return false;
  const url = mediaUrl?.toLowerCase() ?? '';
  return /\.(jpg|jpeg|png|webp|gif|avif|bmp)(\?|$)/.test(url) || Boolean(mediaUrl);
}

export function matchesContentMediaFilter(
  mediaUrl: string | null | undefined,
  mediaType: string | null | undefined,
  filter: GlobalSearchContentMediaFilter
): boolean {
  if (filter === 'all') return true;
  if (filter === 'gif') return mediaType === 'GIF';
  if (filter === 'video') return isContentVideo(mediaUrl, mediaType);
  if (filter === 'photo') return isContentPhoto(mediaUrl, mediaType);
  return true;
}

export function applyGlobalSearchFilters(
  data: GlobalSearchPageData,
  filters: GlobalSearchFilters
): GlobalSearchPageData {
  const include = (category: GlobalSearchCategory) => filters.categories.includes(category);
  const cutoff = getDateCutoff(filters.dateRange);

  let products = include('products') ? [...data.products] : [];
  let content = include('content') ? [...data.content] : [];

  if (filters.productType !== 'all') {
    products = products.filter((product) => product.type === filters.productType);
  }

  if (cutoff) {
    products = products.filter((product) => new Date(product.createdAt) >= cutoff);
    content = content.filter((item) => new Date(item.createdAt) >= cutoff);
  }

  if (filters.contentMedia !== 'all') {
    content = content.filter((item) =>
      matchesContentMediaFilter(item.mediaUrl, item.mediaType, filters.contentMedia)
    );
  }

  const sortByDate = (a: string, b: string) =>
    new Date(a).getTime() - new Date(b).getTime();

  if (filters.sort === 'oldest') {
    products.sort((a, b) => sortByDate(a.createdAt, b.createdAt));
    content.sort((a, b) => sortByDate(a.createdAt, b.createdAt));
  } else if (filters.sort === 'newest') {
    products.sort((a, b) => sortByDate(b.createdAt, a.createdAt));
    content.sort((a, b) => sortByDate(b.createdAt, a.createdAt));
  } else if (filters.sort === 'popular') {
    products.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0) || sortByDate(b.createdAt, a.createdAt));
    content.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0) || sortByDate(b.createdAt, a.createdAt));
  }

  return {
    users: include('users') ? data.users : [],
    creators: include('creators') ? data.creators : [],
    products,
    content,
  };
}

export function getProductSortParam(sort: GlobalSearchSortFilter): string | undefined {
  if (sort === 'popular') return 'popular';
  return undefined;
}

export function countActiveGlobalSearchFilters(
  filters: GlobalSearchFilters,
  isAuthenticated: boolean
): number {
  const defaults = createDefaultGlobalSearchFilters(isAuthenticated);
  let count = 0;
  if (filters.categories.length !== defaults.categories.length) count += 1;
  else if (!defaults.categories.every((category) => filters.categories.includes(category))) count += 1;
  if (filters.dateRange !== defaults.dateRange) count += 1;
  if (filters.sort !== defaults.sort) count += 1;
  if (filters.productType !== defaults.productType) count += 1;
  if (filters.contentMedia !== defaults.contentMedia) count += 1;
  return count;
}
