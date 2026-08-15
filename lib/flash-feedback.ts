export type FlashVariant = 'success' | 'error' | 'info' | 'neutral';

export type FlashToast = {
  id: string;
  variant: FlashVariant;
  title: string;
  description?: string;
  durationMs?: number;
  /** Toast position. Default is top center. */
  placement?: 'top' | 'bottom';
  /** Optional CTA (e.g. upgrade). */
  actionHref?: string;
  actionLabel?: string;
};

export const CREATOR_PRODUCT_FLASH = {
  created: 'product-created',
  updated: 'product-updated',
  deleted: 'product-deleted',
} as const;

export type CreatorProductFlashKey = keyof typeof CREATOR_PRODUCT_FLASH;

const CREATOR_PRODUCT_MESSAGES: Record<
  CreatorProductFlashKey,
  { title: string; description: (title?: string) => string }
> = {
  created: {
    title: 'Product created',
    description: (title) =>
      title
        ? `"${title}" is saved and listed in your catalog.`
        : 'Your product was saved and added to your catalog.',
  },
  updated: {
    title: 'Changes saved',
    description: (title) =>
      title ? `"${title}" was updated successfully.` : 'Your product was updated successfully.',
  },
  deleted: {
    title: 'Product deleted',
    description: (title) =>
      title
        ? `"${title}" was permanently removed from your catalog.`
        : 'The product was permanently removed from your catalog.',
  },
};

export function buildCreatorProductFlash(
  action: CreatorProductFlashKey,
  productTitle?: string
): Omit<FlashToast, 'id'> {
  const copy = CREATOR_PRODUCT_MESSAGES[action];
  const trimmed = productTitle?.trim();
  return {
    variant: 'success',
    title: copy.title,
    description: copy.description(trimmed),
    durationMs: 5000,
  };
}

export function creatorProductsListPath(options?: {
  flash?: CreatorProductFlashKey;
  productTitle?: string;
}): string {
  const params = new URLSearchParams();
  if (options?.flash) {
    params.set('flash', CREATOR_PRODUCT_FLASH[options.flash]);
  }
  const title = options?.productTitle?.trim();
  if (title) {
    params.set('flashTitle', title);
  }
  const qs = params.toString();
  return qs ? `/marketplace/my-products?${qs}` : '/marketplace/my-products';
}

export function parseCreatorProductFlash(
  flash: string | null,
  flashTitle: string | null
): Omit<FlashToast, 'id'> | null {
  const entry = Object.entries(CREATOR_PRODUCT_FLASH).find(([, value]) => value === flash);
  if (!entry) return null;
  const action = entry[0] as CreatorProductFlashKey;
  const title = flashTitle?.trim() || undefined;
  return buildCreatorProductFlash(action, title);
}
