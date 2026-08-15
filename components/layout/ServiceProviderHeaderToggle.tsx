'use client';

import { usePathname } from 'next/navigation';
import { isMyServiceNavPath } from '@/components/layout/dashboard/navConfig';
import { HeaderSegmentToggle } from '@/components/layout/HeaderSegmentToggle';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import { creatorCanAccessMyServices } from '@/lib/creator-app-role';
import { isServiceProvidersCatalogPath } from '@/lib/marketplace-nav';

const EXPLORE_HREF = '/marketplace/creators';
const MY_SERVICES_HREF = '/marketplace/my-services';

export function ServiceProviderHeaderToggle() {
  const pathname = usePathname();
  const { appRole, ready } = useCreatorAppRole();
  const exploreActive = isServiceProvidersCatalogPath(pathname);
  const myServicesActive = isMyServiceNavPath(pathname);
  const showMyServices = ready && creatorCanAccessMyServices(appRole);

  if (!showMyServices) {
    return null;
  }

  return (
    <HeaderSegmentToggle
      layoutId="service-provider-header-toggle-pill"
      ariaLabel="Service Provider views"
      options={[
        { href: EXPLORE_HREF, label: 'Explore', active: exploreActive },
        { href: MY_SERVICES_HREF, label: 'My Services', active: myServicesActive },
      ]}
    />
  );
}
