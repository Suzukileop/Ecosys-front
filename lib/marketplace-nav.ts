import { ROUTES, isPathWithin, providerPath } from '@/lib/routes';

/** Product marketplace: catalogue, product pages and the buyer's purchases. */
export function isMarketplaceHubPath(pathname: string): boolean {
  return (
    pathname === ROUTES.marketplace ||
    isPathWithin(pathname, `${ROUTES.marketplace}/products`) ||
    isPathWithin(pathname, ROUTES.purchases)
  );
}

const CREATOR_PROFILE_PATTERN = /^\/providers\/[^/]+\/?$/;
const CREATOR_SHOP_PATTERN = /^\/providers\/[^/]+\/shop\/?$/;

/** Public creator profile: `/providers/{creatorId}`. */
export function isMarketplaceCreatorProfilePath(pathname: string): boolean {
  return CREATOR_PROFILE_PATTERN.test(pathname);
}

/** `/providers/{creatorId}/shop` — a creator's product shop. */
export function isCreatorShopPath(pathname: string): boolean {
  return CREATOR_SHOP_PATTERN.test(pathname);
}

/**
 * Safe internal path for profile "back" navigation (`from` query).
 * Rejects protocol-relative / external URLs.
 */
function sanitizeMarketplaceReturnTo(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  return trimmed;
}

/** Public profile URL, optionally carrying a return path for the header back button. */
export function marketplaceCreatorProfileHref(
  creatorId: string,
  returnTo?: string | null
): string {
  const base = providerPath(creatorId);
  const safe = sanitizeMarketplaceReturnTo(returnTo);
  if (!safe) return base;
  return `${base}?from=${encodeURIComponent(safe)}`;
}

/** Service Provider directory itself (not a single creator profile). */
export function isServiceProvidersCatalogPath(pathname: string): boolean {
  return pathname === ROUTES.providers || pathname === `${ROUTES.providers}/`;
}

/** Client-facing creator browse: directory, profiles, shops, portfolio posts. */
export function isContentCreatorsPath(pathname: string): boolean {
  return (
    isPathWithin(pathname, ROUTES.providers) ||
    pathname.startsWith(`${ROUTES.marketplace}/content/`)
  );
}
