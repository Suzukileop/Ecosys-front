/** Letter names that start with a vowel sound when read as an acronym (e.g. "M" → "em"). */
const ACRONYM_AN_LETTERS = new Set(['a', 'e', 'f', 'h', 'i', 'l', 'm', 'n', 'o', 'r', 's', 'x']);

/**
 * Picks "a" or "an" for an English noun phrase based on the first word's spoken sound.
 */
export function englishIndefiniteArticle(phrase: string): 'a' | 'an' {
  const raw = phrase.trim();
  if (!raw) return 'a';

  const firstWord = raw.split(/\s+/)[0] ?? '';
  const word = firstWord.toLowerCase();

  if (/^(hour|honest|honou?r|heir)/i.test(word)) return 'an';

  if (/^uni[a-z]/i.test(word)) return 'a';
  if (/^use[rds]/i.test(word)) return 'a';
  if (/^one\b/i.test(word)) return 'a';
  if (/^eu[a-z]/i.test(word)) return 'a';
  if (/^u[bcdfghjklmnpqrstvwxyz]/i.test(word)) return 'a';

  if (/^[A-Z]{2,}$/.test(firstWord)) {
    const letter = firstWord.charAt(0).toLowerCase();
    return ACRONYM_AN_LETTERS.has(letter) ? 'an' : 'a';
  }

  if (/^[aeiou]/i.test(word)) return 'an';

  return 'a';
}

/**
 * Builds a hero headline like "a data scientist" from a specialty label.
 * Skips adding an article when one is already present.
 */
export function formatSpecialiteHeadline(
  specialite: string | null | undefined,
  fallback: string
): string {
  const trimmed = specialite?.trim();
  if (!trimmed) return fallback;
  if (/^(a|an)\s+/i.test(trimmed)) return trimmed;

  const article = englishIndefiniteArticle(trimmed);
  return `${article} ${trimmed}`;
}
