'use client';

import { RouteErrorState } from '@/components/ui/RouteErrorState';
import { useT } from '@/lib/i18n/I18nProvider';

type ProductPageErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductPageError({ error, reset }: ProductPageErrorProps) {
  const t = useT();
  return (
    <RouteErrorState
      error={error}
      reset={reset}
      title={t('Unable to load this product')}
      description={t('This product could not be displayed right now. Please try again in a moment.')}
    />
  );
}
