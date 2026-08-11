/** Public creator portfolio — standalone CV page (not marketplace shell). */
export function buildCreatorPortfolioPath(creatorId: string): string {
  return `/portfolio/${encodeURIComponent(creatorId)}`;
}

export function buildCreatorPortfolioUrl(creatorId: string, origin?: string): string {
  const path = buildCreatorPortfolioPath(creatorId);
  if (origin) return `${origin.replace(/\/$/, '')}${path}`;
  if (typeof window !== 'undefined') return `${window.location.origin}${path}`;
  return path;
}
