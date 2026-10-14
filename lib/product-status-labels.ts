import { msg } from '@/lib/i18n/config';
/**
 * Merchandising status a creator attaches to a product (mirrors the backend `ProductStatusLabel`
 * enum and its max of 3). Shown as badges on the product cards.
 */
export type ProductStatusLabel =
  | 'NEW'
  | 'PROMOTION'
  | 'CLEARANCE'
  | 'POPULAR'
  | 'TRENDING'
  | 'LIMITED_EDITION'
  | 'LAST_UNITS'
  | 'EXCLUSIVE';

export const MAX_PRODUCT_STATUS_LABELS = 3;

export const PRODUCT_STATUS_LABEL_OPTIONS: { value: ProductStatusLabel; label: string; hint: string }[] = [
  { value: 'NEW', label: msg('New'), hint: msg('Just released') },
  { value: 'PROMOTION', label: msg('On sale'), hint: msg('Temporary discounted price') },
  { value: 'CLEARANCE', label: msg('Clearance'), hint: msg('Sold at a loss to clear stock') },
  { value: 'POPULAR', label: msg('Popular'), hint: msg('A customer favourite') },
  { value: 'TRENDING', label: msg('Trending'), hint: msg('Selling fast right now') },
  { value: 'LIMITED_EDITION', label: msg('Limited edition'), hint: msg('Only a set number made') },
  { value: 'LAST_UNITS', label: msg('Last units'), hint: msg('Almost sold out') },
  { value: 'EXCLUSIVE', label: msg('Exclusive'), hint: msg('Only available here') },
];

const KNOWN = new Set<string>(PRODUCT_STATUS_LABEL_OPTIONS.map((option) => option.value));

export function productStatusLabelText(value: ProductStatusLabel): string {
  return PRODUCT_STATUS_LABEL_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

/** Known values only, de-duplicated, in order, capped at the backend maximum. */
export function normalizeProductStatusLabels(raw: unknown): ProductStatusLabel[] {
  if (!Array.isArray(raw)) return [];
  const out: ProductStatusLabel[] = [];
  for (const item of raw) {
    const value = String(item ?? '').trim().toUpperCase();
    if (KNOWN.has(value) && !out.includes(value as ProductStatusLabel)) out.push(value as ProductStatusLabel);
    if (out.length === MAX_PRODUCT_STATUS_LABELS) break;
  }
  return out;
}
