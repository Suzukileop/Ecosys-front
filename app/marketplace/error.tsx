'use client';

import { RouteErrorState } from '@/components/ui/RouteErrorState';
import { useT } from '@/lib/i18n/I18nProvider';

type MarketplaceErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MarketplaceError({ error, reset }: MarketplaceErrorProps) {
  const t = useT();
  return (
    <RouteErrorState
      error={error}
      reset={reset}
      title={t('Unable to load the marketplace')}
      description={t('Something went wrong while loading this page. Please try again in a moment.')}
    />
  );
}
