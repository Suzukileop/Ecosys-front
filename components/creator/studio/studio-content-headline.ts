/** Default Content-tab hero line in Creator Studio. */
export const DEFAULT_STUDIO_CONTENT_HEADLINE = 'Show them what you are capable of.';

export function resolveStudioContentHeadline(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : DEFAULT_STUDIO_CONTENT_HEADLINE;
}
