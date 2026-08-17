import {
  listPublicContentFeed,
  listPublicProducts,
  searchMarketplaceCreators,
} from '@/lib/marketplace-api';
import { getProductSortParam, type GlobalSearchFilters } from '@/lib/global-search-filters';
import type {
  MarketplaceCreatorSummary,
  MarketplaceProductSummary,
  PublicContentFeedItem,
} from '@/types/marketplace';
import type { MessagingUserSummary } from '@/types/messaging';

export type GlobalSearchCategory =
  | 'users'
  | 'creators'
  | 'serviceProviders'
  | 'products'
  | 'content';

export type GlobalSearchTab = 'all' | GlobalSearchCategory;

export type GlobalSearchItem = {
  id: string;
  category: GlobalSearchCategory;
  title: string;
  subtitle?: string;
  avatarUrl?: string | null;
  thumbnailUrl?: string | null;
  badge?: string;
};

export type GlobalSearchResults = Record<GlobalSearchCategory, GlobalSearchItem[]>;

export type GlobalSearchPageData = {
  users: MessagingUserSummary[];
  creators: MarketplaceCreatorSummary[];
  /** Same marketplace creator search — rendered as Service Provider catalog cards. */
  serviceProviders: MarketplaceCreatorSummary[];
  products: MarketplaceProductSummary[];
  content: PublicContentFeedItem[];
};

export type GlobalSearchTabCounts = Record<GlobalSearchCategory, number>;

export const GLOBAL_SEARCH_MIN_LENGTH = 2;
/** Quick preview in the command palette modal */
export const GLOBAL_SEARCH_MODAL_PREVIEW_SIZE = 4;
/** Full results on the dedicated search page */
export const GLOBAL_SEARCH_FULL_PAGE_SIZE = 20;
/** Preview per section when the "All" tab is active */
export const GLOBAL_SEARCH_ALL_TAB_SECTION_SIZE = 6;

export const GLOBAL_SEARCH_CATEGORY_LABELS: Record<GlobalSearchCategory, string> = {
  users: 'Users',
  creators: 'Profiles',
  serviceProviders: 'Service Provider',
  products: 'Products',
  content: 'Content',
};

export const GLOBAL_SEARCH_TAB_LABELS: Record<GlobalSearchTab, string> = {
  all: 'All',
  users: 'Users',
  creators: 'Profiles',
  serviceProviders: 'Service Provider',
  products: 'Products',
  content: 'Content',
};

export const GLOBAL_SEARCH_TABS: GlobalSearchTab[] = [
  'all',
  'creators',
  'serviceProviders',
  'products',
  'content',
];

export function buildGlobalSearchPageUrl(query: string, tab: GlobalSearchTab = 'all'): string {
  const q = query.trim();
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (tab !== 'all') params.set('tab', tab);
  const qs = params.toString();
  return qs ? `/dashboard/search?${qs}` : '/dashboard/search';
}

function contentMediaBadge(item: PublicContentFeedItem): string {
  if (item.mediaType === 'GIF') return 'GIF';
  const url = item.mediaUrl?.toLowerCase() ?? '';
  if (/\.(mp4|webm|mov|m4v|avi)(\?|$)/.test(url)) return 'Video';
  if (/\.(jpg|jpeg|png|webp|gif|avif|bmp)(\?|$)/.test(url)) return 'Photo';
  return 'Media';
}

function buildContentSubtitle(item: PublicContentFeedItem): string {
  const parts: string[] = [];
  if (item.creator?.fullName) parts.push(item.creator.fullName);
  const tags = item.tags?.filter(Boolean).slice(0, 2);
  if (tags?.length) parts.push(tags.join(', '));
  return parts.join(' · ') || item.genre || 'Public content';
}

type FetchGlobalSearchOptions = {
  limit?: number;
  categories?: GlobalSearchCategory[];
  filters?: GlobalSearchFilters;
  viewerCoords?: { lat: number; lng: number } | null;
};

function emptyResults(): GlobalSearchResults {
  return { users: [], creators: [], serviceProviders: [], products: [], content: [] };
}

function emptyPageData(): GlobalSearchPageData {
  return { users: [], creators: [], serviceProviders: [], products: [], content: [] };
}

export async function fetchGlobalSearch(
  query: string,
  _isAuthenticated: boolean,
  options?: FetchGlobalSearchOptions
): Promise<GlobalSearchResults> {
  const q = query.trim();
  if (q.length < GLOBAL_SEARCH_MIN_LENGTH) return emptyResults();

  const limit = options?.limit ?? GLOBAL_SEARCH_FULL_PAGE_SIZE;
  const categories =
    options?.categories ?? ['creators', 'serviceProviders', 'products', 'content'];
  const include = (category: GlobalSearchCategory) => categories.includes(category);
  const needCreators = include('creators') || include('serviceProviders');

  const [creatorsRes, productsRes, contentRes] = await Promise.allSettled([
    needCreators ? searchMarketplaceCreators(q, 0, limit) : Promise.resolve({ content: [] }),
    include('products') ? listPublicProducts({ q, size: limit }) : Promise.resolve({ content: [] }),
    include('content') ? listPublicContentFeed({ q, size: limit }) : Promise.resolve({ content: [] }),
  ]);

  const creatorRows =
    creatorsRes.status === 'fulfilled' && 'content' in creatorsRes.value
      ? creatorsRes.value.content
      : [];

  const creators = include('creators')
    ? creatorRows.map((creator) => {
        const id = creator.userId ?? creator.id ?? '';
        return {
          id,
          category: 'creators' as const,
          title: creator.fullName,
          subtitle: creator.specialite ?? 'Profile',
          avatarUrl: creator.avatarUrl?.trim() || null,
        };
      })
    : [];

  const serviceProviders = include('serviceProviders')
    ? creatorRows.map((creator) => {
        const id = creator.userId ?? creator.id ?? '';
        return {
          id,
          category: 'serviceProviders' as const,
          title: creator.fullName,
          subtitle: creator.specialite ?? 'Service provider',
          avatarUrl: creator.avatarUrl?.trim() || null,
        };
      })
    : [];

  const products =
    productsRes.status === 'fulfilled' && 'content' in productsRes.value
      ? productsRes.value.content.map((product) => ({
          id: product.id,
          category: 'products' as const,
          title: product.title,
          subtitle: product.genre ?? product.type,
          thumbnailUrl: product.thumbnailUrl ?? null,
        }))
      : [];

  const content =
    contentRes.status === 'fulfilled' && 'content' in contentRes.value
      ? contentRes.value.content.map((item) => ({
          id: item.id,
          category: 'content' as const,
          title: item.title?.trim() || item.description?.slice(0, 60) || 'Untitled content',
          subtitle: buildContentSubtitle(item),
          thumbnailUrl: item.mediaUrl,
          badge: contentMediaBadge(item),
        }))
      : [];

  return { users: [], creators, serviceProviders, products, content };
}

export function flattenGlobalSearchResults(results: GlobalSearchResults): GlobalSearchItem[] {
  return [...results.creators, ...results.products, ...results.content];
}

export function getCategoriesForTab(tab: GlobalSearchTab): GlobalSearchCategory[] | null {
  if (tab === 'all') return null;
  return [tab];
}

export async function fetchGlobalSearchPageData(
  query: string,
  _isAuthenticated: boolean,
  options?: FetchGlobalSearchOptions
): Promise<GlobalSearchPageData> {
  const q = query.trim();
  if (q.length < GLOBAL_SEARCH_MIN_LENGTH) return emptyPageData();

  const limit = options?.limit ?? GLOBAL_SEARCH_FULL_PAGE_SIZE;
  const categories =
    options?.categories ?? ['creators', 'serviceProviders', 'products', 'content'];
  const include = (category: GlobalSearchCategory) => categories.includes(category);
  const needCreators = include('creators') || include('serviceProviders');
  const filters = options?.filters;
  const productFormat =
    filters?.productType && filters.productType !== 'all' ? filters.productType : undefined;
  const productSort = filters ? getProductSortParam(filters.sort) : undefined;
  const creatorSearchFilters = {
    ...(filters?.nationality?.trim() ? { nationality: filters.nationality.trim() } : {}),
    ...(filters?.minYearsExperience != null
      ? { minYearsExperience: filters.minYearsExperience }
      : {}),
    ...(options?.viewerCoords
      ? {
          lat: options.viewerCoords.lat,
          lng: options.viewerCoords.lng,
          ...(filters?.closestFirst ? { sort: 'distance' } : {}),
        }
      : {}),
  };

  const [creatorsRes, productsRes, contentRes] = await Promise.allSettled([
    needCreators
      ? searchMarketplaceCreators(q, 0, limit, creatorSearchFilters)
      : Promise.resolve({ content: [] }),
    include('products')
      ? listPublicProducts({
          q,
          size: limit,
          ...(productFormat ? { format: productFormat } : {}),
          ...(productSort ? { sort: productSort } : {}),
        })
      : Promise.resolve({ content: [] }),
    include('content') ? listPublicContentFeed({ q, size: limit }) : Promise.resolve({ content: [] }),
  ]);

  const creatorRows =
    creatorsRes.status === 'fulfilled' && 'content' in creatorsRes.value
      ? creatorsRes.value.content
      : [];

  return {
    users: [],
    creators: include('creators') ? creatorRows : [],
    serviceProviders: include('serviceProviders') ? creatorRows : [],
    products:
      productsRes.status === 'fulfilled' && 'content' in productsRes.value
        ? productsRes.value.content
        : [],
    content:
      contentRes.status === 'fulfilled' && 'content' in contentRes.value
        ? contentRes.value.content
        : [],
  };
}

const EMPTY_TAB_COUNTS: GlobalSearchTabCounts = {
  users: 0,
  creators: 0,
  serviceProviders: 0,
  products: 0,
  content: 0,
};

/** Lightweight totals for tab badges (independent of active tab). */
export async function fetchGlobalSearchTabCounts(
  query: string,
  _isAuthenticated: boolean
): Promise<GlobalSearchTabCounts> {
  const q = query.trim();
  if (q.length < GLOBAL_SEARCH_MIN_LENGTH) return EMPTY_TAB_COUNTS;

  const [creatorsRes, productsRes, contentRes] = await Promise.allSettled([
    searchMarketplaceCreators(q, 0, 1),
    listPublicProducts({ q, size: 1 }),
    listPublicContentFeed({ q, size: 1 }),
  ]);

  const creatorTotal =
    creatorsRes.status === 'fulfilled' ? creatorsRes.value.totalElements : 0;

  return {
    users: 0,
    creators: creatorTotal,
    serviceProviders: creatorTotal,
    products: productsRes.status === 'fulfilled' ? productsRes.value.totalElements : 0,
    content: contentRes.status === 'fulfilled' ? contentRes.value.totalElements : 0,
  };
}

export function getTabCount(
  tab: GlobalSearchTab,
  counts: GlobalSearchTabCounts,
  _isAuthenticated: boolean
): number {
  if (tab === 'all') {
    // Profiles + Service Provider share the same people — count once
    return counts.creators + counts.products + counts.content;
  }
  if (tab === 'users') return 0;
  return counts[tab];
}
