'use client';

import { CreatorEmptyGuide } from '@/components/creator/studio/CreatorEmptyGuide';
import { useT } from '@/lib/i18n/I18nProvider';

type CreatorServicesEmptyGuideProps = {
  onCreate: () => void;
  createDisabled?: boolean;
};

export function CreatorServicesEmptyGuide({
  onCreate,
  createDisabled = false,
}: CreatorServicesEmptyGuideProps) {
  const t = useT();
  return (
    <CreatorEmptyGuide
      ariaLabel={t('Getting started with your services')}
      headline="No service yet."
      description={t('Publish an offer clients can book.')}
      ctaLabel={t('Create a service')}
      onCreate={onCreate}
      createDisabled={createDisabled}
      imageSrc="/images/empty/empty-services.png"
    />
  );
}
