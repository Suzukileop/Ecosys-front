/** Detects a bio that is the same text pasted twice back-to-back (exact half duplication). */
export function isRepeatedBioContent(bio: string | null | undefined): boolean {
  const trimmed = bio?.trim() ?? '';
  if (trimmed.length < 40 || trimmed.length % 2 !== 0) return false;
  const half = trimmed.length / 2;
  return trimmed.slice(0, half) === trimmed.slice(half);
}

/** Collapses an exact half-duplicated bio to a single copy; otherwise returns trimmed input. */
export function collapseRepeatedBio(bio: string | null | undefined): string {
  const trimmed = bio?.trim() ?? '';
  if (!isRepeatedBioContent(trimmed)) return trimmed;
  return trimmed.slice(0, trimmed.length / 2).trim();
}
