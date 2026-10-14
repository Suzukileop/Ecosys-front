'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listSimilarProducts } from '@/lib/marketplace-api';
import { getApiErrorMessage } from '@/lib/api-error';
import type { MarketplaceProductSummary } from '@/types/marketplace';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { useT } from '@/lib/i18n/I18nProvider';

/** The catalogue's cards, sized to the product page's column: two to a row on phones, three from lg. */
const SIMILAR_GRID = 'grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3';

type ProductSimilarListProps = {
  productId: string;
  genre?: string | null;
};

const SKELETON = 'animate-pulse bg-[color:var(--gn-inset)]';

export function ProductSimilarList({ productId, genre }: ProductSimilarListProps) {
  const t = useT();
  const [products, setProducts] = useState<MarketplaceProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await listSimilarProducts(productId, 6);
        if (!cancelled) {
          setProducts(items);
        }
      } catch (e) {
        if (!cancelled) {
          setError(getApiErrorMessage(e, t('Unable to load similar products.')));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, t]);

  // The catalogue lives on /marketplace (there is no /marketplace/products index page).
  const browseHref = genre
    ? `/marketplace?format=virtual&genre=${encodeURIComponent(genre)}`
    : '/marketplace';

  return (
    <aside>
      <div className="flex items-center justify-between gap-3 px-4 sm:px-0">
        <h2 className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]">
          {t('Similar products')}
        </h2>
        <Link
          href={browseHref}
          className="group inline-flex h-10 items-center gap-1 text-[14px] font-semibold text-[color:var(--gn-ink)] underline-offset-4 hover:underline"
        >
          {t('See all')}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      {loading ? (
        <div className={`mt-3 sm:mt-4 ${SIMILAR_GRID}`} aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="bg-[color:var(--gn-surface)]">
              <div className={`aspect-[4/3] ${SKELETON}`} />
              <div className="space-y-2.5 p-4">
                <div className={`h-4 w-3/4 ${SKELETON}`} />
                <div className={`h-4 w-1/3 ${SKELETON}`} />
              </div>
            </div>
          ))}
        </div>
      ) : error || products.length === 0 ? (
        <p className="mt-3 bg-[color:var(--gn-surface)] px-5 py-10 text-center text-[15px] text-[color:var(--gn-ink2)] sm:mt-4">
          {error ?? t('No similar products found yet.')}
        </p>
      ) : (
        <div className={`mt-3 sm:mt-4 ${SIMILAR_GRID}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} flushOnMobile />
          ))}
        </div>
      )}
    </aside>
  );
}
