'use client';

import { CreatorCard } from '@/components/CreatorCard';
import type { MarketplaceCreatorSummary } from '@/types/marketplace';

/** Same card as `/providers` — one provider per row in search. */
export function SearchServiceProviderGrid({
  creators,
}: {
  creators: MarketplaceCreatorSummary[];
}) {
  return (
    <div className="provider-spotlight-grid grid grid-cols-1 items-stretch gap-6">
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
          comfortable
        />
      ))}
    </div>
  );
}
