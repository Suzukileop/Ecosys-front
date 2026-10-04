'use client';

import { CreatorEmptyGuide } from '@/components/creator/studio/CreatorEmptyGuide';

type CreatorServicesEmptyGuideProps = {
  onCreate: () => void;
  createDisabled?: boolean;
};

export function CreatorServicesEmptyGuide({
  onCreate,
  createDisabled = false,
}: CreatorServicesEmptyGuideProps) {
  return (
    <CreatorEmptyGuide
      ariaLabel="Getting started with your services"
      headline="No service yet."
      description="Publish an offer clients can book."
      ctaLabel="Create a service"
      onCreate={onCreate}
      createDisabled={createDisabled}
      imageSrc="/images/empty/empty-services.png"
    />
  );
}
