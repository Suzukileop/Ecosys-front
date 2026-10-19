'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PublicServiceLightbox } from '@/components/marketplace/PublicServiceLightbox';
import {
  filterActiveServices,
  formatHourlyRateAmount,
  formatServiceDelivery,
  formatServicePrice,
  solidCoverHueFromTitle,
} from '@/lib/profile-services';
import { MediaImage } from '@/components/ui/MediaImage';
import type { ProfileServiceItem } from '@/types/profile';
import type { MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

type CreatorProfileServicesTabProps = {
  creatorId: string;
  profile: MarketplaceCreatorPublicProfile;
};

export function ServiceCard({
  service,
  onOpen,
  compact = false,
}: {
  service: ProfileServiceItem;
  /** Omit for a non-interactive render — the service editor's live preview. */
  onOpen?: () => void;
  /** A narrower cover and tighter padding, to fit the editor panel (same anatomy). */
  compact?: boolean;
}) {
  const t = useT();
  const deliveryLabel = formatServiceDelivery(service);
  const title = service.title?.trim() || t('Service');
  const hue = solidCoverHueFromTitle(title);
  const solidCover = (
    <div
      className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-white/90"
      style={{ backgroundColor: `hsl(${hue} 32% 38%)` }}
    >
      {title[0].toUpperCase()}
    </div>
  );

  /*
   * One service per row, read like a listing: the cover on the left (16rem wide from sm, as tall as
   * the card), and on the right the specialty, the title and the full description — nothing
   * truncated, the card grows with its text — then a footer row: price · delivery on the left,
   * "Details →" on the right. Phones stack the cover on top.
   */
  const body = (
    <>
      <div
        className={`relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-[#EFF3F4] dark:bg-[#202327] sm:aspect-auto ${
          compact ? 'sm:min-h-[11rem] sm:w-48' : 'sm:min-h-[15rem] sm:w-60 md:w-64'
        }`}
      >
        <MediaImage
          src={service.coverImageUrl}
          widths={[384, 640, 828]}
          sizes="(min-width: 640px) 256px, 100vw"
          fallback={solidCover}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${compact ? 'p-4 sm:px-5 sm:py-5' : 'p-5 sm:px-8 sm:py-7'}`}>
        {service.specialty ? (
          <p className="mb-1.5 text-[13px] capitalize leading-[18px] text-[#536471] dark:text-[#71767B]">
            {service.specialty.toLowerCase()}
          </p>
        ) : null}
        <h3 className="text-[19px] font-bold leading-6 tracking-[-0.01em] text-[#0F1419] dark:text-[#E7E9EA]">
          {title}
        </h3>
        {service.description ? (
          <p className="mt-2.5 whitespace-pre-line break-words text-[15px] leading-[23px] text-[#536471] dark:text-[#71767B]">
            {service.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[17px] font-bold tabular-nums tracking-[-0.01em] text-[#0F1419] dark:text-[#E7E9EA]">
              {formatServicePrice(service)}
            </span>
            {deliveryLabel ? (
              <span className="text-[13px] text-[#536471] dark:text-[#71767B]">· {deliveryLabel}</span>
            ) : null}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-[#0F1419] underline-offset-4 group-hover:underline dark:text-[#E7E9EA]">
            {t('Details')}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </div>
    </>
  );

  if (!onOpen) {
    return (
      <div className="flex w-full flex-col overflow-hidden bg-[#F7F9F9] text-left dark:bg-[#16181C] sm:flex-row">
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full flex-col overflow-hidden rounded-none bg-[#F7F9F9] text-left transition-colors duration-200 hover:bg-[#EFF3F4] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black/15 dark:bg-[#16181C] dark:hover:bg-[#1D1F23] dark:focus-visible:ring-white/25 max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] sm:flex-row"
    >
      {body}
    </button>
  );
}

export function CreatorProfileServicesTab({ creatorId, profile }: CreatorProfileServicesTabProps) {
  const t = useT();
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
      ? `/messages?user=${encodeURIComponent(creatorId)}`
      : `/login?redirect=${encodeURIComponent(`/messages?user=${encodeURIComponent(creatorId)}`)}`;

  useEffect(() => {
    if (!deepLinkServiceId || services.length === 0) return;
    const match = services.find((item) => item.id === deepLinkServiceId);
    if (!match) return;
    const timer = window.setTimeout(() => setActiveService(match), 0);
    return () => window.clearTimeout(timer);
  }, [deepLinkServiceId, services]);

  const hourlyRate = formatHourlyRateAmount(profile.hourlyRateCents, profile.hourlyRateCurrency);
  const hourlyRateBlock = hourlyRate ? (
    <p className="flex shrink-0 items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0.5">
      <span className="text-[13px] text-[#536471] dark:text-[#71767B]">{t('Hourly rate')}</span>
      <span className="text-[17px] font-bold tabular-nums tracking-[-0.01em] text-[#0F1419] dark:text-[#E7E9EA]">
        {hourlyRate}
        <span className="text-[14px] font-normal text-[#536471] dark:text-[#71767B]"> {t('/ hour')}</span>
      </span>
    </p>
  ) : null;

  if (services.length === 0) {
    return (
      <div id="services" className="space-y-4 sm:space-y-6">
        {hourlyRateBlock}
        <div className="gn-card -mx-4 rounded-none bg-[#F7F9F9] dark:bg-[#16181C] px-6 py-16 text-center sm:mx-0">
          <p className="text-[17px] font-bold text-[#0F1419] dark:text-[#E7E9EA]">{t('No services published yet')}</p>
          {discussHref ? (
            <p className="mt-1 text-[15px] text-[#536471] dark:text-[#71767B]">{t('Use Discuss above to talk about your project.')}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div id="services" className="space-y-4 sm:space-y-6">
      {/* Phones: the active tab ("Services 3") already names the section; only the hourly rate shows. */}
      <div className={`flex items-end justify-between gap-6 ${hourlyRateBlock ? '' : 'max-sm:hidden'}`}>
        <div className="max-sm:hidden">
          <h2 className="text-[20px] font-extrabold tracking-[-0.015em] text-[#0F1419] dark:text-[#E7E9EA]">{t('Services')}</h2>
          <p className="mt-1 text-[15px] text-[#536471] dark:text-[#71767B]">
            {services.length} {t('available service')}{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        {hourlyRateBlock}
      </div>
      <div className="flex flex-col gap-2 sm:gap-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} onOpen={() => setActiveService(service)} />
        ))}
      </div>

      <PublicServiceLightbox
        service={activeService}
        open={Boolean(activeService)}
        onClose={() => setActiveService(null)}
        discussHref={discussHref}
        discussLabel={t('Discuss')}
      />
    </div>
  );
}
