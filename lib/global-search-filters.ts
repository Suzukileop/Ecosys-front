import type {
  GlobalSearchCategory,
  GlobalSearchPageData,
} from '@/lib/global-search';
import type { MarketplaceProductSummary } from '@/types/marketplace';

export type GlobalSearchDateFilter = 'any' | '7d' | '30d' | '90d';
export type GlobalSearchSortFilter = 'newest' | 'oldest' | 'popular';
export type GlobalSearchContentMediaFilter = 'all' | 'photo' | 'video';
/** Same Physical / Virtual split as Products explore. */
export type GlobalSearchProductTypeFilter = 'all' | 'virtual' | 'physical';

export type GlobalSearchFilters = {
  categories: GlobalSearchCategory[];
  dateRange: GlobalSearchDateFilter;
  sort: GlobalSearchSortFilter;
  productType: GlobalSearchProductTypeFilter;
  contentMedia: GlobalSearchContentMediaFilter;
  /** Service Provider — min years of experience (null = any). */
  minYearsExperience: number | null;
  /** Service Provider — ISO nationality code ('' = all). */
  nationality: string;
  /** Service Provider — sort by distance when geolocation is available. */
  closestFirst: boolean;
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
  { value: 'virtual', label: 'Virtual' },
  { value: 'physical', label: 'Physical' },
];

export const GLOBAL_SEARCH_CONTENT_MEDIA_OPTIONS: {
  value: GlobalSearchContentMediaFilter;
  label: string;
}[] = [
  { value: 'all', label: 'All media' },
  { value: 'photo', label: 'Photos only' },
  { value: 'video', label: 'Videos only' },
];

export const GLOBAL_SEARCH_MIN_YEARS_OPTIONS = [
  { value: '', label: 'Any experience' },
  { value: '1', label: '1+ years' },
  { value: '3', label: '3+ years' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
  { value: '15', label: '15+ years' },
] as const;

export const GLOBAL_SEARCH_CATEGORY_OPTIONS: { value: GlobalSearchCategory; label: string }[] = [
  { value: 'creators', label: 'Profiles' },
  { value: 'serviceProviders', label: 'Service Provider' },
  { value: 'products', label: 'Products' },
  { value: 'content', label: 'Content' },
];

export function createDefaultGlobalSearchFilters(_isAuthenticated: boolean): GlobalSearchFilters {
  return {
    categories: ['creators', 'serviceProviders', 'products', 'content'],
    dateRange: 'any',
    sort: 'newest',
    productType: 'all',
    contentMedia: 'all',
    minYearsExperience: null,
    nationality: '',
    closestFirst: false,
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
    filters.contentMedia !== defaults.contentMedia ||
    filters.minYearsExperience !== defaults.minYearsExperience ||
    filters.nationality !== defaults.nationality ||
    filters.closestFirst !== defaults.closestFirst
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
  if (filter === 'video') return isContentVideo(mediaUrl, mediaType);
  if (filter === 'photo') return isContentPhoto(mediaUrl, mediaType);
  return true;
}

function matchesProductFormatFilter(
  productType: string | null | undefined,
  filter: GlobalSearchProductTypeFilter
): boolean {
  if (filter === 'all') return true;
  if (filter === 'physical') return productType === 'PHYSICAL';
  if (filter === 'virtual') return productType !== 'PHYSICAL';
  return true;
}

/** Product text fields only — never match creator name (avoids dumping all of a person's products). */
export function productMatchesSearchQuery(
  product: MarketplaceProductSummary,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    product.title,
    product.description,
    product.genre,
    product.specialite,
    ...(product.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export function applyGlobalSearchFilters(
  data: GlobalSearchPageData,
  filters: GlobalSearchFilters,
  searchQuery?: string
): GlobalSearchPageData {
  const include = (category: GlobalSearchCategory) => filters.categories.includes(category);
  const cutoff = getDateCutoff(filters.dateRange);

  let products = include('products') ? [...data.products] : [];
  let content = include('content') ? [...data.content] : [];
  let creators = include('creators') ? [...data.creators] : [];
  let serviceProviders = include('serviceProviders') ? [...data.serviceProviders] : [];

  if (searchQuery?.trim()) {
    products = products.filter((product) => productMatchesSearchQuery(product, searchQuery));
  }

  if (filters.productType !== 'all') {
    products = products.filter((product) =>
      matchesProductFormatFilter(product.type, filters.productType)
    );
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

  if (filters.minYearsExperience != null) {
    const min = filters.minYearsExperience;
    const matchYears = (years: number | null | undefined) =>
      years != null && Number.isFinite(years) && years >= min;
    creators = creators.filter((c) => matchYears(c.yearsOfExperience));
    serviceProviders = serviceProviders.filter((c) => matchYears(c.yearsOfExperience));
  }

  if (filters.nationality.trim()) {
    const code = filters.nationality.trim().toUpperCase();
    const matchNat = (n: string | null | undefined) =>
      Boolean(n && n.trim().toUpperCase() === code);
    creators = creators.filter((c) => matchNat(c.nationality));
    serviceProviders = serviceProviders.filter((c) => matchNat(c.nationality));
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

  if (filters.closestFirst) {
    const byDistance = (
      a: { distanceKm?: number | null },
      b: { distanceKm?: number | null }
    ) => {
      const da = a.distanceKm;
      const db = b.distanceKm;
      if (da == null && db == null) return 0;
      if (da == null) return 1;
      if (db == null) return -1;
      return da - db;
    };
    creators = [...creators].sort(byDistance);
    serviceProviders = [...serviceProviders].sort(byDistance);
  }

  return {
    users: include('users') ? data.users : [],
    creators,
    serviceProviders,
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
  if (filters.minYearsExperience !== defaults.minYearsExperience) count += 1;
  if (filters.nationality !== defaults.nationality) count += 1;
  if (filters.closestFirst !== defaults.closestFirst) count += 1;
  return count;
}
