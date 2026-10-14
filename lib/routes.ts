/**
 * Single source of truth for app URLs. Pages, links, the auth proxy and path predicates import
 * from here so a route rename is a one-line change.
 *
 * Map:
 * - Public site: `/`, `/privacy`, `/terms`, `/upgrade`, auth (`/login`, `/register`, `/oauth/*`).
 * - Product marketplace: `/marketplace`, `/marketplace/products/[id]`, `/marketplace/content/[id]`.
 * - Service providers: `/providers` (directory), `/providers/[id]` (profile), `/providers/[id]/shop`.
 * - Public portfolio: `/portfolio/[slug]`.
 * - Signed-in workspace (route group `(app)`, no URL prefix): `/feed`, `/studio`, `/profile`,
 *   `/my-products`, `/my-services`, `/messages`, `/notifications`, `/search`,
 *   `/settings`, `/cv`.
 * - Back office: `/admin/users`, `/admin/reports`.
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',

  feed: '/feed',
  studio: '/studio',
  profile: '/profile',
  myProducts: '/my-products',
  myServices: '/my-services',
  messages: '/messages',
  notifications: '/notifications',
  search: '/search',
  settings: '/settings',
  cv: '/cv',

  marketplace: '/marketplace',
  providers: '/providers',

  adminUsers: '/admin/users',
  adminReports: '/admin/reports',
} as const;

/** Where a signed-in user lands (after login, or when opening `/`). */
export const SIGNED_IN_HOME = ROUTES.feed;

/** Sections that require a session; the proxy sends anonymous visitors to `/login`. */
export const PROTECTED_ROUTE_PREFIXES = [
  ROUTES.feed,
  ROUTES.studio,
  ROUTES.profile,
  ROUTES.myProducts,
  ROUTES.myServices,
  ROUTES.messages,
  ROUTES.notifications,
  ROUTES.search,
  ROUTES.settings,
  ROUTES.cv,
  '/admin',
] as const;

/** `pathname` is `base` itself or a sub-path of it (`/feed` matches `/feed/x`, not `/feedback`). */
export function isPathWithin(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * Routes drawn on the News design system's ground: neutral-100 page under white cards in light,
 * zinc-950 under zinc-900 cards in dark (DashboardShell + the header surface follow it).
 */
export function isNewsGroundPath(pathname: string): boolean {
  return (
    isPathWithin(pathname, ROUTES.feed) ||
    isPathWithin(pathname, ROUTES.profile) ||
    // My Portfolio: the studio workspace and its live preview chrome.
    isPathWithin(pathname, ROUTES.studio) ||
    // My Services, Explore products (the marketplace hub) and My Products (list + consult page).
    isPathWithin(pathname, ROUTES.myServices) ||
    pathname === ROUTES.marketplace ||
    pathname === `${ROUTES.marketplace}/` ||
    pathname === ROUTES.myProducts ||
    pathname === `${ROUTES.myProducts}/` ||
    /^\/my-products\/[^/]+\/?$/.test(pathname) ||
    // The providers directory itself.
    pathname === ROUTES.providers ||
    pathname === `${ROUTES.providers}/` ||
    // Public creator profile and shop, product / content detail pages, the product edit workspace.
    /^\/providers\/[^/]+(\/shop)?\/?$/.test(pathname) ||
    /^\/marketplace\/(products|content)\/[^/]+\/?$/.test(pathname) ||
    /^\/my-products\/[^/]+\/edit\/?$/.test(pathname)
  );
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => isPathWithin(pathname, prefix));
}

const segment = (value: string) => encodeURIComponent(value);

export const providerPath = (creatorId: string) => `${ROUTES.providers}/${segment(creatorId)}`;

export const providerShopPath = (creatorId: string) => `${providerPath(creatorId)}/shop`;

export const marketplaceProductPath = (productId: string) =>
  `${ROUTES.marketplace}/products/${segment(productId)}`;

export const marketplaceContentPath = (contentId: string) =>
  `${ROUTES.marketplace}/content/${segment(contentId)}`;

export const myProductPath = (productId: string) => `${ROUTES.myProducts}/${segment(productId)}`;

export const myProductEditPath = (productId: string) => `${myProductPath(productId)}/edit`;
