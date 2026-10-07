import type { MarketplaceProductSummary } from '@/types/marketplace';

export const LOW_STOCK_THRESHOLD = 5;
/** A physical product listed without a quantity is a single unit. */
export const DEFAULT_PHYSICAL_STOCK = 1;

type StockTone = 'ok' | 'low' | 'out' | 'neutral';

type StockStatus = {
  tone: StockTone;
  /** Short value for stat strips: "12", "0", "∞". */
  value: string;
  /** Human label: "In stock", "Low stock", "Out of stock"… */
  label: string;
  hint: string;
  quantity: number | null;
  /** False for single-unit physical items and digital products — no stock UI needed. */
  visible: boolean;
};

/** Units on hand for a physical product, defaulting to a single unit. Null for digital products. */
export function physicalStockQuantity(
  product: Pick<MarketplaceProductSummary, 'type' | 'stockQuantity'>
): number | null {
  if (product.type !== 'PHYSICAL') return null;
  return product.stockQuantity ?? DEFAULT_PHYSICAL_STOCK;
}

export function getStockStatus(product: Pick<MarketplaceProductSummary, 'type' | 'stockQuantity'>): StockStatus {
  const quantity = physicalStockQuantity(product);

  if (quantity == null) {
    return {
      tone: 'neutral',
      value: '∞',
      label: 'Unlimited',
      hint: 'Digital product — there is no inventory to manage.',
      quantity: null,
      visible: false,
    };
  }
  if (quantity <= 0) {
    return {
      tone: 'out',
      value: '0',
      label: 'Out of stock',
      hint: 'Buyers can’t order this product until you restock it.',
      quantity: 0,
      visible: true,
    };
  }
  if (quantity <= LOW_STOCK_THRESHOLD) {
    return {
      tone: 'low',
      value: quantity.toLocaleString(),
      label: 'Low stock',
      hint: `Only ${quantity} units left — consider restocking soon.`,
      quantity,
      visible: quantity !== DEFAULT_PHYSICAL_STOCK,
    };
  }
  return {
    tone: 'ok',
    value: quantity.toLocaleString(),
    label: 'In stock',
    hint: `${quantity.toLocaleString()} units available to buyers.`,
    quantity,
    visible: true,
  };
}

export const STOCK_TONE_DOT: Record<StockTone, string> = {
  ok: 'bg-emerald-500',
  low: 'bg-amber-500',
  out: 'bg-[#E0431A] dark:bg-[#FF7A52]',
  neutral: 'bg-neutral-300 dark:bg-neutral-600',
};
