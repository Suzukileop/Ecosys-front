/** Product marketplace: catalog, favorites, purchases (hub + detail routes). */
export function isMarketplaceHubPath(pathname: string): boolean {
  if (pathname === '/marketplace') return true;
  if (pathname.startsWith('/marketplace/favorites') || pathname.startsWith('/marketplace/purchases')) {
    return true;
  }
  if (pathname.startsWith('/marketplace/products')) {
    return true;
  }
  return false;
}

const MARKETPLACE_PRODUCT_SECTIONS = new Set([
  'favorites',
  'purchases',
  'products',
  'portfolio',
  'creators',
  'my-services',
  'my-products',
]);

/** Public creator profile: /marketplace/{creatorId} (not list, not content post). */
export function isMarketplaceCreatorProfilePath(pathname: string): boolean {
  if (!pathname.startsWith('/marketplace/')) return false;
  const segment = pathname.slice('/marketplace/'.length).split('/')[0];
  if (!segment || pathname.slice('/marketplace/'.length).includes('/')) return false;
  return !MARKETPLACE_PRODUCT_SECTIONS.has(segment) && segment !== 'content';
}

/**
 * Safe internal path for profile "back" navigation (`from` query).
 * Rejects protocol-relative / external URLs.
 */
export function sanitizeMarketplaceReturnTo(value: string | null | undefined): string | null {
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
  const base = `/marketplace/${encodeURIComponent(creatorId)}`;
  const safe = sanitizeMarketplaceReturnTo(returnTo);
  if (!safe) return base;
  return `${base}?from=${encodeURIComponent(safe)}`;
}

/** Service Provider directory (not a single creator profile). */
export function isServiceProvidersCatalogPath(pathname: string): boolean {
  return pathname === '/marketplace/creators' || pathname.startsWith('/marketplace/creators/');
}

/** Client-facing creator browse: directory, profiles, portfolio posts. */
export function isContentCreatorsPath(pathname: string): boolean {
  if (pathname.startsWith('/marketplace/creators')) {
    return true;
  }
  if (pathname.startsWith('/marketplace/content/')) {
    return true;
  }
  if (!pathname.startsWith('/marketplace/')) {
    return false;
  }
  const segment = pathname.slice('/marketplace/'.length).split('/')[0];
  return segment.length > 0 && !MARKETPLACE_PRODUCT_SECTIONS.has(segment);
}
