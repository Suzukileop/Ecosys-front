'use client';

import { CreatorEmptyGuide } from '@/components/creator/studio/CreatorEmptyGuide';

type CreatorProductsEmptyGuideProps = {
  onCreate: () => void;
  createDisabled?: boolean;
};

export function CreatorProductsEmptyGuide({
  onCreate,
  createDisabled = false,
}: CreatorProductsEmptyGuideProps) {
  return (
    <CreatorEmptyGuide
      ariaLabel="Getting started with your shop"
      headline="Your shop is empty."
      description="Add a first product, digital or material."
      ctaLabel="Create a product"
      onCreate={onCreate}
      createDisabled={createDisabled}
      imageSrc="/images/empty/empty-products.png"
    />
  );
}
