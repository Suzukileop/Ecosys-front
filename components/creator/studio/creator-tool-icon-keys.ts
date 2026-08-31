/** Shared normalization + lookup tokens for tool icon matching (PNG bundle & Simple Icons). */

export function normalizeCreatorToolIconKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * Candidate keys for a user-typed tool label — exact token matches only (no substring fuzzy).
 * Longest winning match should be chosen by the caller.
 */
export function buildCreatorToolIconLookupKeys(label: string): string[] {
  const trimmed = label.trim();
  if (!trimmed) return [];

  const keys: string[] = [];
  const seen = new Set<string>();

  const push = (raw: string) => {
    const key = normalizeCreatorToolIconKey(raw);
    if (key.length < 2 || seen.has(key)) return;
    seen.add(key);
    keys.push(key);
  };

  push(trimmed);

  const segments = trimmed
    .split(/[\s_\-/+.]+/)
    .flatMap((part) => part.split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/));

  for (const segment of segments) {
    push(segment);
  }

  return keys;
}
