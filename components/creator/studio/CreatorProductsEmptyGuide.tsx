'use client';

import { CreatorEmptyGuide } from '@/components/creator/studio/CreatorEmptyGuide';
import { useT } from '@/lib/i18n/I18nProvider';

type CreatorProductsEmptyGuideProps = {
  onCreate: () => void;
  createDisabled?: boolean;
};

export function CreatorProductsEmptyGuide({
  onCreate,
  createDisabled = false,
}: CreatorProductsEmptyGuideProps) {
  const t = useT();
  return (
    <CreatorEmptyGuide
      ariaLabel={t('Getting started with your shop')}
      headline="Your shop is empty."
      description={t('Add a first product, digital or material.')}
      ctaLabel={t('Create a product')}
      onCreate={onCreate}
      createDisabled={createDisabled}
      imageSrc="/images/empty/empty-products.png"
    />
  );
}
