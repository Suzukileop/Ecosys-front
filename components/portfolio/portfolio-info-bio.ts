export const INFO_BIO_WORD_LIMIT = 1000;
export type InfoBioCase = 'original' | 'sentence' | 'lowercase' | 'uppercase' | 'title';

export function formatInfoBio(text: string, casing: InfoBioCase = 'original'): string {
  if (casing === 'uppercase') return text.toUpperCase();
  if (casing === 'lowercase') return text.toLowerCase();
  if (casing === 'title') return text.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, space: string, letter: string) => space + letter.toUpperCase());
  if (casing === 'sentence') return text.toLowerCase().replace(/(^|[.!?]\s+|\n\s*)(\p{L})/gu, (_, prefix: string, letter: string) => prefix + letter.toUpperCase());
  return text;
}

export function countInfoBioWords(text: string): number {
  return text.match(/\S+/gu)?.length ?? 0;
}

/** Preserve paragraphs and punctuation, including when pasting over the limit. */
export function limitInfoBio(text: string): string {
  const words = [...text.matchAll(/\S+/gu)];
  if (words.length <= INFO_BIO_WORD_LIMIT) return text;
  const last = words[INFO_BIO_WORD_LIMIT - 1];
  return text.slice(0, last.index! + last[0].length);
}
