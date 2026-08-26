/**
 * Section titles always use sentence case: first letter uppercase, rest lowercase.
 * Example: "EXPERTISE" → "Expertise", "What I Offer" → "What i offer".
 */
export function portfolioSectionTitleSentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLocaleLowerCase();
  return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
}

/** Strip CSS uppercase utilities so sentence-cased titles stay visually mixed-case. */
export function portfolioSectionTitleClassWithoutUppercase(className: string): string {
  return className
    .split(/\s+/)
    .filter((token) => token && token !== 'uppercase')
    .join(' ');
}
