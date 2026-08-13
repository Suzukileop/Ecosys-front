/** Where the creator opened a product detail/edit screen from. */
export type CreatorProductNavFrom = 'profile' | 'products';

export function parseCreatorProductNavFrom(value: string | null | undefined): CreatorProductNavFrom {
  return value === 'profile' ? 'profile' : 'products';
}

export function creatorProductViewPath(
  productId: string,
  from: CreatorProductNavFrom = 'products'
): string {
  const base = `/dashboard/creator/products/${encodeURIComponent(productId)}`;
  return from === 'profile' ? `${base}?from=profile` : base;
}

export function creatorProductEditPath(
  productId: string,
  from: CreatorProductNavFrom = 'products'
): string {
  const base = `/dashboard/creator/products/${encodeURIComponent(productId)}/edit`;
  return from === 'profile' ? `${base}?from=profile` : base;
}

export function creatorProductBackNav(from: CreatorProductNavFrom): {
  href: string;
  label: string;
} {
  if (from === 'profile') {
    return {
      href: '/dashboard/creator?tab=products',
      label: '← My Profile',
    };
  }
  return {
    href: '/dashboard/products',
    label: '← My products',
  };
}
