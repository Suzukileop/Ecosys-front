'use client';

import { RouteErrorState } from '@/components/ui/RouteErrorState';

type ProvidersErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProvidersError({ error, reset }: ProvidersErrorProps) {
  return (
    <RouteErrorState
      error={error}
      reset={reset}
      title="Unable to load service providers"
      description="Something went wrong while loading this page. Please try again in a moment."
    />
  );
}
