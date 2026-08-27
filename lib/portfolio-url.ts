/** Public creator portfolio — standalone CV page (not marketplace shell). */

export function resolvePortfolioSlug(creatorId: string, username?: string | null): string {
  const handle = username?.trim();
  return handle || creatorId;
}

export function buildCreatorPortfolioPath(
  creatorId: string,
  username?: string | null
): string {
  return `/portfolio/${encodeURIComponent(resolvePortfolioSlug(creatorId, username))}`;
}

export function buildCreatorPortfolioUrl(
  creatorId: string,
  username?: string | null,
  origin?: string
): string {
  const path = buildCreatorPortfolioPath(creatorId, username);
  if (origin) return `${origin.replace(/\/$/, '')}${path}`;
  if (typeof window !== 'undefined') return `${window.location.origin}${path}`;
  return path;
}

export function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}
