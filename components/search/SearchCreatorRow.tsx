'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { listPublicProducts } from '@/lib/marketplace-api';
import type { MarketplaceCreatorSummary, MarketplaceProductSummary } from '@/types/marketplace';

function VerifiedIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-sky-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StatColumn({
  value,
  singular,
  plural,
}: {
  value: number;
  singular: string;
  plural: string;
}) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-neutral-900 dark:text-white">{value}</p>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">{value === 1 ? singular : plural}</p>
    </div>
  );
}

type SearchCreatorRowProps = {
  creator: MarketplaceCreatorSummary;
  productPreviews?: MarketplaceProductSummary[];
};

export function SearchCreatorRow({ creator, productPreviews }: SearchCreatorRowProps) {
  const profileId = creator.userId ?? creator.id ?? '';
  const profileHref = profileId ? `/marketplace/${profileId}` : '/marketplace';
  const subtitle = creator.bio?.trim() || creator.specialite?.trim();

  const [previews, setPreviews] = useState<MarketplaceProductSummary[]>(productPreviews ?? []);

  useEffect(() => {
    if (productPreviews) {
      setPreviews(productPreviews);
      return;
    }
    if (!profileId) return;

    let cancelled = false;
    void listPublicProducts({ creatorId: profileId, size: 3 }).then((page) => {
      if (!cancelled) setPreviews(page.content);
    });

    return () => {
      cancelled = true;
    };
  }, [profileId, productPreviews]);

  return (
    <article className="flex flex-wrap items-center gap-5 rounded-2xl border border-neutral-200 bg-white px-5 py-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 sm:flex-nowrap sm:gap-8 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link href={profileHref} className="shrink-0">
          <Avatar name={creator.fullName} avatarUrl={creator.avatarUrl} size="lg" tone="muted" />
        </Link>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={profileHref}
              className="truncate text-lg font-bold text-neutral-900 dark:text-white"
            >
              {creator.fullName}
            </Link>
            {creator.isVerified ? <VerifiedIcon /> : null}
          </div>
          {subtitle ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-8 lg:flex">
        <StatColumn value={creator.portfolioCount ?? 0} singular="portfolio" plural="portfolios" />
        <StatColumn value={creator.productCount ?? 0} singular="product" plural="products" />
        <StatColumn value={creator.followerCount ?? 0} singular="follower" plural="followers" />
      </div>

      {previews.length > 0 ? (
        <div className="hidden shrink-0 md:flex">
          <div className="flex items-center -space-x-3">
            {previews.slice(0, 3).map((product, index) => (
              <Link
                key={product.id}
                href={`/marketplace/products/${product.id}`}
                className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-neutral-200 dark:border-neutral-900 dark:bg-neutral-700"
                style={{ zIndex: 3 - index }}
                title={product.title}
              >
                {product.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-neutral-200 dark:bg-neutral-700" />
                )}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <Link
        href={profileHref}
        className="ml-auto shrink-0 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
      >
        View profile
      </Link>
    </article>
  );
}
