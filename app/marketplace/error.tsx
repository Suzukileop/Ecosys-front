'use client';

import { RouteErrorState } from '@/components/ui/RouteErrorState';

type MarketplaceErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MarketplaceError({ error, reset }: MarketplaceErrorProps) {
  return (
    <RouteErrorState
      error={error}
      reset={reset}
      title="Unable to load the marketplace"
      description="Something went wrong while loading this page. Please try again in a moment."
    />
  );
}
