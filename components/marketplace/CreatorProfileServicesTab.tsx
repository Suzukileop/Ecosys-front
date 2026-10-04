'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PublicServiceLightbox } from '@/components/marketplace/PublicServiceLightbox';
import {
  filterActiveServices,
  formatServiceDelivery,
  formatServicePrice,
  solidCoverHueFromTitle,
} from '@/lib/profile-services';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';
import type { ProfileServiceItem } from '@/types/ecosystem';
import type { MarketplaceCreatorPublicProfile } from '@/types/marketplace';

type CreatorProfileServicesTabProps = {
  creatorId: string;
  profile: MarketplaceCreatorPublicProfile;
};

function ServiceCard({ service, onOpen }: { service: ProfileServiceItem; onOpen: () => void }) {
  const cover = resolveStorageMediaUrl(service.coverImageUrl) || service.coverImageUrl;
  const deliveryLabel = formatServiceDelivery(service);
  const title = service.title?.trim() || 'Service';
  const hue = solidCoverHueFromTitle(title);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-black/[0.06] bg-white text-left transition-colors duration-300 hover:border-black/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 dark:border-white/[0.08] dark:bg-[#111111] dark:hover:border-white/[0.18] dark:focus-visible:ring-white/25"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- storage-hosted cover
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-4xl font-semibold text-white/90"
            style={{ backgroundColor: `hsl(${hue} 32% 38%)` }}
          >
            {title[0].toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="pb-6">
          {service.specialty ? (
            <p className="mb-2 truncate text-[14px] capitalize text-neutral-600 dark:text-neutral-300">
              {service.specialty.toLowerCase()}
            </p>
          ) : null}
          <h3 className="text-[1.125rem] font-semibold leading-snug tracking-[-0.01em] text-[#111111] dark:text-white">
            {title}
          </h3>
          {service.description ? (
            <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              {service.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-black/[0.06] pt-5 dark:border-white/[0.08]">
          <div className="min-w-0">
            <p className="text-[1.125rem] font-semibold tabular-nums tracking-[-0.01em] text-[#111111] dark:text-white">
              {formatServicePrice(service)}
            </p>
            {deliveryLabel ? (
              <p className="mt-1 text-[14px] text-neutral-600 dark:text-neutral-300">{deliveryLabel}</p>
            ) : null}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-[#111111] dark:text-white">
            Details
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}

export function CreatorProfileServicesTab({ creatorId, profile }: CreatorProfileServicesTabProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const deepLinkServiceId = searchParams.get('service');
  const services = useMemo(
    () =>
      filterActiveServices(profile.profileServices ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
    [profile.profileServices]
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
    if (!match) return;
    const timer = window.setTimeout(() => setActiveService(match), 0);
    return () => window.clearTimeout(timer);
  }, [deepLinkServiceId, services]);

  if (services.length === 0) {
    return (
      <div
        id="services"
        className="rounded-lg border border-black/[0.06] bg-white px-6 py-16 text-center dark:border-white/[0.08] dark:bg-[#111111]"
      >
        <p className="text-[1.0625rem] font-semibold text-[#111111] dark:text-white">
          This provider has not published any services yet
        </p>
        <p className="mt-2 text-[15px] text-neutral-600 dark:text-neutral-300">
          Contact them directly to discuss your needs.
        </p>
        {discussHref ? (
          <Link
            href={discussHref}
            className="mt-5 inline-flex h-11 items-center rounded-lg bg-[#111111] px-5 text-[15px] font-medium text-white transition-colors hover:bg-black dark:bg-white dark:text-[#111111] dark:hover:bg-neutral-200"
          >
            Discuss
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div id="services" className="space-y-10">
      <div>
        <h2 className="text-[1.375rem] font-semibold tracking-[-0.015em] text-[#111111] dark:text-white sm:text-[1.5rem]">
          Services
        </h2>
        <p className="mt-2 text-[1rem] text-neutral-600 dark:text-neutral-300">
          {services.length} available service{services.length !== 1 ? 's' : ''}.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} onOpen={() => setActiveService(service)} />
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
