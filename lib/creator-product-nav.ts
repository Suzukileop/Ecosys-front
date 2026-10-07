import { ROUTES, myProductEditPath, myProductPath } from '@/lib/routes';

/** Where the creator opened a product detail/edit screen from. */
export type CreatorProductNavFrom = 'profile' | 'products';

export function parseCreatorProductNavFrom(value: string | null | undefined): CreatorProductNavFrom {
  return value === 'profile' ? 'profile' : 'products';
}

export function creatorProductViewPath(
  productId: string,
  from: CreatorProductNavFrom = 'products'
): string {
  const base = myProductPath(productId);
  return from === 'profile' ? `${base}?from=profile` : base;
}

export function creatorProductEditPath(
  productId: string,
  from: CreatorProductNavFrom = 'products'
): string {
  const base = myProductEditPath(productId);
  return from === 'profile' ? `${base}?from=profile` : base;
}

export function creatorProductBackNav(from: CreatorProductNavFrom): {
  href: string;
  label: string;
} {
  if (from === 'profile') {
    return {
      href: `${ROUTES.profile}?tab=products`,
      label: '← My Profile',
    };
  }
  return {
    href: ROUTES.myProducts,
    label: '← My products',
  };
}
