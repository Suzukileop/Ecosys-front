'use client';

import { RouteErrorState } from '@/components/ui/RouteErrorState';

type ProductPageErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductPageError({ error, reset }: ProductPageErrorProps) {
  return (
    <RouteErrorState
      error={error}
      reset={reset}
      title="Unable to load this product"
      description="This product could not be displayed right now. Please try again in a moment."
    />
  );
}
