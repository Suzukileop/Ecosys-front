'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PublicServiceCard } from '@/components/creator/studio/CreatorStudioServicesTab';
import { PublicServiceLightbox } from '@/components/marketplace/PublicServiceLightbox';
import { filterActiveServices } from '@/lib/profile-services';
import type { ProfileServiceItem } from '@/types/ecosystem';
import type { MarketplaceCreatorPublicProfile } from '@/types/marketplace';

type CreatorProfileServicesTabProps = {
  creatorId: string;
  profile: MarketplaceCreatorPublicProfile;
};

export function CreatorProfileServicesTab({ creatorId, profile }: CreatorProfileServicesTabProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const deepLinkServiceId = searchParams.get('service');
  const services = filterActiveServices(profile.profileServices ?? []).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  const [activeService, setActiveService] = useState<ProfileServiceItem | null>(null);
  const isOwn = Boolean(user?.id && user.id === creatorId);
  const discussHref = isOwn
    ? null
    : user
      ? `/dashboard/discussions?user=${encodeURIComponent(creatorId)}`
      : `/login?redirect=${encodeURIComponent(`/dashboard/discussions?user=${encodeURIComponent(creatorId)}`)}`;

  useEffect(() => {
    if (!deepLinkServiceId || services.length === 0) return;
    const match = services.find((item) => item.id === deepLinkServiceId);
    if (match) {
      setActiveService(match);
    }
  }, [deepLinkServiceId, services]);

  if (services.length === 0) {
    return (
      <div
        id="services"
        className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900/40"
      >
        <p className="text-base font-semibold text-neutral-900 dark:text-white">
          This provider has not published any services yet
        </p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Contact them directly to discuss your needs.
        </p>
        {discussHref ? (
          <Link
            href={discussHref}
            className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Discuss
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div id="services" className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Services</h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          {services.length} available service{services.length !== 1 ? 's' : ''}.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => setActiveService(service)}
            className="h-full text-left transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50"
          >
            <PublicServiceCard
              service={service}
              discussHref={null}
              discussLabel="Discuss"
            />
          </button>
        ))}
      </div>

      <PublicServiceLightbox
        service={activeService}
        open={Boolean(activeService)}
        onClose={() => setActiveService(null)}
        discussHref={discussHref}
        discussLabel="Discuss"
      />
    </div>
  );
}
