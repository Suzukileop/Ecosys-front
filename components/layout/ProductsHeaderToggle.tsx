'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { isMyProductNavPath } from '@/components/layout/dashboard/navConfig';
import { HeaderSegmentToggle } from '@/components/layout/HeaderSegmentToggle';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import { creatorCanAccessMyProducts } from '@/lib/creator-app-role';
import { isMarketplaceHubPath } from '@/lib/marketplace-nav';

const EXPLORE_HREF = '/marketplace';
const MY_PRODUCT_HREF = '/marketplace/my-products';

export function ProductsHeaderToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { appRole, ready } = useCreatorAppRole();
  const exploreActive = isMarketplaceHubPath(pathname);
  const myProductActive = isMyProductNavPath(pathname, search);
  const showMyProduct = ready && creatorCanAccessMyProducts(appRole);

  if (!showMyProduct) {
    return null;
  }

  return (
    <HeaderSegmentToggle
      layoutId="products-header-toggle-pill"
      ariaLabel="Products views"
      options={[
        { href: EXPLORE_HREF, label: 'Explore', active: exploreActive },
        { href: MY_PRODUCT_HREF, label: 'My Product', active: myProductActive },
      ]}
    />
  );
}
