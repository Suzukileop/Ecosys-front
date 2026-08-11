import {
  listPublicContentFeed,
  listPublicProducts,
  searchMarketplaceCreators,
} from '@/lib/marketplace-api';
import { getProductSortParam, type GlobalSearchFilters } from '@/lib/global-search-filters';
import { searchMessagingUsers } from '@/lib/messaging';
import type {
  MarketplaceCreatorSummary,
  MarketplaceProductSummary,
  PublicContentFeedItem,
} from '@/types/marketplace';
import type { MessagingUserSummary } from '@/types/messaging';

export type GlobalSearchCategory = 'users' | 'creators' | 'products' | 'content';

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
  creators: 'Creators',
  products: 'Products',
  content: 'Content',
};

export const GLOBAL_SEARCH_TAB_LABELS: Record<GlobalSearchTab, string> = {
  all: 'All',
  users: 'Users',
  creators: 'Creators',
  products: 'Products',
  content: 'Content',
};

export const GLOBAL_SEARCH_TABS: GlobalSearchTab[] = [
  'all',
  'users',
  'creators',
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
};

export async function fetchGlobalSearch(
  query: string,
  isAuthenticated: boolean,
  options?: FetchGlobalSearchOptions
): Promise<GlobalSearchResults> {
  const q = query.trim();
  const empty: GlobalSearchResults = { users: [], creators: [], products: [], content: [] };
  if (q.length < GLOBAL_SEARCH_MIN_LENGTH) return empty;

  const limit = options?.limit ?? GLOBAL_SEARCH_FULL_PAGE_SIZE;
  const categories = options?.categories ?? ['users', 'creators', 'products', 'content'];
  const include = (category: GlobalSearchCategory) => categories.includes(category);

  const [usersRes, creatorsRes, productsRes, contentRes] = await Promise.allSettled([
    isAuthenticated && include('users')
      ? searchMessagingUsers(q, 0, limit)
      : Promise.resolve([]),
    include('creators') ? searchMarketplaceCreators(q, 0, limit) : Promise.resolve({ content: [] }),
    include('products') ? listPublicProducts({ q, size: limit }) : Promise.resolve({ content: [] }),
    include('content') ? listPublicContentFeed({ q, size: limit }) : Promise.resolve({ content: [] }),
  ]);

  const users =
    usersRes.status === 'fulfilled'
      ? usersRes.value.map((user) => ({
          id: user.id,
          category: 'users' as const,
          title: user.fullName,
          subtitle: 'Member',
          avatarUrl: user.avatarUrl?.trim() || null,
        }))
      : [];

  const creators =
    creatorsRes.status === 'fulfilled' && 'content' in creatorsRes.value
      ? creatorsRes.value.content.map((creator) => {
          const id = creator.userId ?? creator.id ?? '';
          return {
            id,
            category: 'creators' as const,
            title: creator.fullName,
            subtitle: creator.specialite ?? 'Creator profile',
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

  return { users, creators, products, content };
}

export function flattenGlobalSearchResults(results: GlobalSearchResults): GlobalSearchItem[] {
  return [
    ...results.users,
    ...results.creators,
    ...results.products,
    ...results.content,
  ];
}

export function getCategoriesForTab(tab: GlobalSearchTab): GlobalSearchCategory[] | null {
  if (tab === 'all') return null;
  return [tab];
}

export async function fetchGlobalSearchPageData(
  query: string,
  isAuthenticated: boolean,
  options?: FetchGlobalSearchOptions
): Promise<GlobalSearchPageData> {
  const q = query.trim();
  const empty: GlobalSearchPageData = { users: [], creators: [], products: [], content: [] };
  if (q.length < GLOBAL_SEARCH_MIN_LENGTH) return empty;

  const limit = options?.limit ?? GLOBAL_SEARCH_FULL_PAGE_SIZE;
  const categories = options?.categories ?? ['users', 'creators', 'products', 'content'];
  const include = (category: GlobalSearchCategory) => categories.includes(category);
  const filters = options?.filters;
  const productType =
    filters?.productType && filters.productType !== 'all' ? filters.productType : undefined;
  const productSort = filters ? getProductSortParam(filters.sort) : undefined;

  const [usersRes, creatorsRes, productsRes, contentRes] = await Promise.allSettled([
    isAuthenticated && include('users')
      ? searchMessagingUsers(q, 0, limit)
      : Promise.resolve([]),
    include('creators') ? searchMarketplaceCreators(q, 0, limit) : Promise.resolve({ content: [] }),
    include('products')
      ? listPublicProducts({
          q,
          size: limit,
          ...(productType ? { type: productType } : {}),
          ...(productSort ? { sort: productSort } : {}),
        })
      : Promise.resolve({ content: [] }),
    include('content') ? listPublicContentFeed({ q, size: limit }) : Promise.resolve({ content: [] }),
  ]);

  return {
    users: usersRes.status === 'fulfilled' ? usersRes.value : [],
    creators:
      creatorsRes.status === 'fulfilled' && 'content' in creatorsRes.value
        ? creatorsRes.value.content
        : [],
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
  products: 0,
  content: 0,
};

/** Lightweight totals for tab badges (independent of active tab). */
export async function fetchGlobalSearchTabCounts(
  query: string,
  isAuthenticated: boolean
): Promise<GlobalSearchTabCounts> {
  const q = query.trim();
  if (q.length < GLOBAL_SEARCH_MIN_LENGTH) return EMPTY_TAB_COUNTS;

  const [usersRes, creatorsRes, productsRes, contentRes] = await Promise.allSettled([
    isAuthenticated ? searchMessagingUsers(q, 0, 50) : Promise.resolve([]),
    searchMarketplaceCreators(q, 0, 1),
    listPublicProducts({ q, size: 1 }),
    listPublicContentFeed({ q, size: 1 }),
  ]);

  return {
    users: usersRes.status === 'fulfilled' ? usersRes.value.length : 0,
    creators:
      creatorsRes.status === 'fulfilled' ? creatorsRes.value.totalElements : 0,
    products:
      productsRes.status === 'fulfilled' ? productsRes.value.totalElements : 0,
    content:
      contentRes.status === 'fulfilled' ? contentRes.value.totalElements : 0,
  };
}

export function getTabCount(
  tab: GlobalSearchTab,
  counts: GlobalSearchTabCounts,
  isAuthenticated: boolean
): number {
  if (tab === 'all') {
    return (
      counts.creators +
      counts.products +
      counts.content +
      (isAuthenticated ? counts.users : 0)
    );
  }
  return counts[tab];
}
