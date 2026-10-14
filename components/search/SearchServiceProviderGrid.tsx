'use client';

import { CreatorCard } from '@/components/CreatorCard';
import type { MarketplaceCreatorSummary } from '@/types/marketplace';

/** Same provider cards as `/providers`: one per line, edge to edge 8px apart on phones, 20px from sm
    (the News rhythm). The page root carries `providers-x`, so the card takes the Providers re-colouring. */
export function SearchServiceProviderGrid({
  creators,
}: {
  creators: MarketplaceCreatorSummary[];
}) {
  return (
    <div className="provider-spotlight-grid flex flex-col gap-2 sm:gap-5">
      {creators.map((c) => (
        <CreatorCard
          key={c.id ?? c.userId ?? c.fullName}
          id={c.id}
          userId={c.userId}
          username={c.username}
          fullName={c.fullName}
          avatarUrl={c.avatarUrl}
          specialite={c.specialite}
          specialties={c.specialties}
          specialtyTags={c.specialtyTags}
          bio={c.bio}
          isVerified={c.isVerified}
          isAvailable={c.isAvailable}
          serviceCount={c.serviceCount}
          starCount={c.starCount}
          nationality={c.nationality}
          yearsOfExperience={c.yearsOfExperience}
          distanceKm={c.distanceKm}
          locationCity={c.locationCity}
          locationCountry={c.locationCountry}
          services={c.profileServices}
          hourlyRateCents={c.hourlyRateCents}
          hourlyRateCurrency={c.hourlyRateCurrency}
          flushOnMobile
        />
      ))}
    </div>
  );
}
