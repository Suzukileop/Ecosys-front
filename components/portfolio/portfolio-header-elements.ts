import { msg } from '@/lib/i18n/config';
/**
 * Which pieces of a section Header are shown. Every Header design is made of a few named elements
 * (a label, a title, a counter…); the owner can hide any of them from the section's Header tab.
 *
 * Stored on each section's presentation settings as `headerHiddenElements`: a list of
 * `"<design>.<element>"` keys. Empty (the default) = everything shown, so existing portfolios are
 * unchanged. Keys are design-scoped so switching design never leaks a hidden state across designs.
 */

export type HeaderElementOption = { key: string; label: string };

export const HEADER_ELEMENT_OPTIONS: Record<string, readonly HeaderElementOption[]> = {
  editorial: [
    { key: 'label', label: msg('Label') },
    { key: 'title', label: msg('Title') },
    { key: 'subtitle', label: msg('Subtitle') },
  ],
  index: [
    { key: 'label', label: msg('Rule label') },
    { key: 'number', label: msg('Counter') },
    { key: 'countLabel', label: msg('Count label') },
    { key: 'title', label: msg('Title') },
    { key: 'subtitle', label: msg('Subtitle') },
  ],
  marquee: [{ key: 'words', label: msg('Scrolling words') }],
  'accent-count': [
    { key: 'badge', label: msg('Badge') },
    { key: 'lead', label: msg('Lead') },
  ],
  'serif-lead': [
    { key: 'label', label: msg('Label') },
    { key: 'title', label: msg('Title') },
    { key: 'subtitle', label: msg('Subtitle') },
  ],
  billboard: [
    { key: 'word', label: msg('Big background word') },
    { key: 'title', label: msg('Title') },
    { key: 'count', label: msg('Count line') },
  ],
  masthead: [
    { key: 'line1', label: msg('Line 1') },
    { key: 'line2', label: msg('Line 2') },
    { key: 'line3', label: msg('Line 3') },
  ],
  'split-heading': [
    { key: 'title', label: msg('Title') },
    { key: 'label', label: msg('Label') },
  ],
  // Footer — its own set of eight, same design names but different pieces
  'footer-editorial': [
    { key: 'title', label: msg('Title') },
    { key: 'subtitle', label: msg('Subtitle') },
  ],
  'footer-serif-lead': [
    { key: 'label', label: msg('Label') },
    { key: 'title', label: msg('Title') },
    { key: 'subtitle', label: msg('Subtitle') },
  ],
  'footer-billboard': [{ key: 'word', label: msg('Big background word') }],
  'footer-index': [
    { key: 'label', label: msg('Rule label') },
    { key: 'number', label: msg('Counter') },
    { key: 'countLabel', label: msg('Count label') },
    { key: 'title', label: msg('Title') },
    { key: 'subtitle', label: msg('Subtitle') },
  ],
  'footer-masthead': [
    { key: 'line1', label: msg('Line 1') },
    { key: 'line2', label: msg('Line 2') },
    { key: 'line3', label: msg('Line 3') },
  ],
  'footer-hero': [
    { key: 'title', label: msg('Title') },
    { key: 'cta', label: msg('Button') },
  ],
  'footer-name': [{ key: 'name', label: msg('Name') }],
  'footer-timezone': [
    { key: 'kicker', label: msg('Kicker') },
    { key: 'title', label: msg('Title') },
    { key: 'description', label: msg('Description') },
    { key: 'clock', label: msg('Local time') },
    { key: 'location', label: msg('Location') },
  ],
  // Experience — only the pieces without a switch of their own (kicker, big title, role count… already have one)
  'experience-milestone': [
    { key: 'title', label: msg('Title') },
    { key: 'lead', label: msg('Lead') },
  ],
  'experience-table': [
    { key: 'label', label: msg('Label') },
    { key: 'lead', label: msg('Lead') },
  ],
  'experience-reel': [
    { key: 'title', label: msg('Title') },
    { key: 'subtitle', label: msg('Subtitle') },
  ],
  'experience-gallery': [{ key: 'title', label: msg('Title') }],
  'experience-legacy': [
    { key: 'heading', label: msg('Heading') },
    { key: 'accent', label: msg('Accent word') },
    { key: 'subtitle', label: msg('Subtitle') },
  ],
  'experience-loft': [
    { key: 'title', label: msg('Title') },
    { key: 'label', label: msg('Label') },
  ],
  // Info only
  chapter: [
    { key: 'index', label: msg('Index tag') },
    { key: 'title', label: msg('Title') },
    { key: 'rule', label: msg('Accent rule') },
  ],
  cover: [
    { key: 'line1', label: msg('Line 1') },
    { key: 'line2', label: msg('Line 2') },
    { key: 'line3', label: msg('Line 3') },
  ],
};

const VALID_KEYS: ReadonlySet<string> = new Set(
  Object.entries(HEADER_ELEMENT_OPTIONS).flatMap(([design, options]) =>
    options.map((option) => `${design}.${option.key}`)
  )
);

export function headerElementKey(design: string, element: string): string {
  return `${design}.${element}`;
}

/** `show('label')` — false when the owner hid that element of this design. */
export type HeaderElementVisibility = (element: string) => boolean;

export function headerElementVisibility(
  hidden: readonly string[] | undefined,
  design: string
): HeaderElementVisibility {
  if (!hidden || hidden.length === 0) return () => true;
  const set = new Set(hidden);
  return (element) => !set.has(headerElementKey(design, element));
}

/** Storage merge: keep only known `design.element` strings, de-duplicated; anything else falls back. */
export function mergeHeaderHiddenElements(raw: unknown, fallback: readonly string[] | undefined): string[] {
  if (!Array.isArray(raw)) return [...(fallback ?? [])];
  const seen = new Set<string>();
  for (const item of raw) {
    if (typeof item === 'string' && VALID_KEYS.has(item)) seen.add(item);
  }
  return [...seen];
}

/** The list after flipping one element of one design. */
export function toggleHeaderElement(
  hidden: readonly string[] | undefined,
  design: string,
  element: string,
  visible: boolean
): string[] {
  const key = headerElementKey(design, element);
  const without = (hidden ?? []).filter((item) => item !== key);
  return visible ? without : [...without, key];
}
