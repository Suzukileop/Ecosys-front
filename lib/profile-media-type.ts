/**
 * IMAGE or VIDEO from a media URL's extension. Kept apart from profile-form-schema (which builds zod
 * schemas at import time) so read-only code — the marketplace API client, public pages — can use it
 * without pulling zod into their bundle.
 */
export function inferProfileMediaType(url: string): 'IMAGE' | 'VIDEO' {
  const probe = url.toLowerCase();
  if (/\.(mp4|webm|mov)(\?|$)/i.test(probe) || probe.includes('video/')) {
    return 'VIDEO';
  }
  return 'IMAGE';
}
