import {
  normalizeProductStatusLabels,
  productStatusLabelText,
  type ProductStatusLabel,
} from '@/lib/product-status-labels';

/** Price-led statuses read as a call to action, so they get the one colour; the rest stay ink. */
const SALE_LABELS = new Set<ProductStatusLabel>(['PROMOTION', 'CLEARANCE']);

/**
 * The creator's merchandising badges (On sale, Trending…) over a product image. Solid pills so they
 * stay legible on any photo; renders nothing when the product has none.
 */
export function ProductStatusBadges({ labels }: { labels?: readonly string[] | null }) {
  const values = normalizeProductStatusLabels(labels ?? []);
  if (values.length === 0) return null;
  return (
    <>
      {values.map((value) => (
        <span
          key={value}
          className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold uppercase leading-none tracking-[0.06em] shadow-xs ${
            SALE_LABELS.has(value) ? 'bg-[#E0245E] text-white' : 'bg-black/80 text-white backdrop-blur-xs'
          }`}
        >
          {productStatusLabelText(value)}
        </span>
      ))}
    </>
  );
}
