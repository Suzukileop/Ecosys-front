'use client';

import { RouteErrorState } from '@/components/ui/RouteErrorState';
import { useT } from '@/lib/i18n/I18nProvider';

type ProvidersErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProvidersError({ error, reset }: ProvidersErrorProps) {
  const t = useT();
  return (
    <RouteErrorState
      error={error}
      reset={reset}
      title={t('Unable to load service providers')}
      description={t('Something went wrong while loading this page. Please try again in a moment.')}
    />
  );
}
