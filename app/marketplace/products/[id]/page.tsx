import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductDemoSection } from '@/components/marketplace/ProductDemoSection';
import { ProductDetailGallery } from '@/components/marketplace/ProductDetailGallery';
import { ProductDetailMediaEngagement } from '@/components/marketplace/ProductDetailMediaEngagement';
import { ProductDetailBottom } from '@/components/marketplace/ProductDetailBottom';
import { ProductWhyHighlights } from '@/components/marketplace/ProductWhyHighlights';
import { ProductDetailPurchasePanel } from '@/components/marketplace/ProductDetailPurchasePanel';
import { PRODUCT_PURCHASE_ANCHOR_ID } from '@/components/marketplace/ProductDetailPurchaseCta';
import { ProductDetailRatingBadge } from '@/components/marketplace/ProductDetailRatingBadge';
import {
  formatPrice,
  getPublicProduct,
  PRODUCT_TYPE_LABELS,
} from '@/lib/marketplace-api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getPublicProduct(id);
  if (!product) return { title: 'Product not found — NoProbleme' };
  return {
    title: `${product.title} — NoProbleme Marketplace`,
    description: product.description ?? product.title,
  };
}

export default async function MarketplaceProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getPublicProduct(id);
  if (!product) notFound();

  const isAuthenticated = Boolean((await cookies()).get('refresh_token'));
  const priceLabel = formatPrice(product.priceCents, product.currency);
  const hasDiscount =
    product.compareAtPriceCents != null && product.compareAtPriceCents > product.priceCents;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.priceCents / product.compareAtPriceCents!) * 100)
    : null;
  const typeLabel = PRODUCT_TYPE_LABELS[product.type] ?? product.type;
  const productUrl = `/marketplace/products/${product.id}`;
  const deliveryLabel = product.deliveryMode.replace(/_/g, ' ');
  const licenseLabel = product.licenseType.replace(/_/g, ' ');
  const salesCount = product.salesCount ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <>
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 lg:py-10">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 transition hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
      >
        ← Back to marketplace
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="order-1 lg:col-span-5">
          <ProductDetailGallery
            title={product.title}
            thumbnailUrl={product.thumbnailUrl}
            videoDurationSeconds={product.videoDurationSeconds}
            videoResolution={product.videoResolution}
            isBestseller={product.isBestseller}
          />

          <div className="mt-4 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <ProductDetailRatingBadge
                productId={product.id}
                initialRating={product.averageRating ?? null}
                initialReviewCount={reviewCount}
              />
              <ProductDetailMediaEngagement
                productId={product.id}
                initialViews={product.views}
                initialLikes={product.likes}
                salesCount={salesCount}
              />
            </div>

            {product.creatorName && (
              <ProductDetailCreatorCard
                creatorId={product.creatorId}
                creatorName={product.creatorName}
                creatorAvatarUrl={product.creatorAvatarUrl}
              />
            )}
          </div>
        </div>

        <div className="order-3 space-y-6 lg:order-2 lg:col-span-4">
          <header className="space-y-4">
            <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white md:text-3xl">
              {product.title}
            </h1>

            {product.description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {product.description}
              </p>
            )}

            {(product.compatibleTools.length > 0 ||
              product.tags.length > 0 ||
              typeLabel ||
              product.genre ||
              product.specialite) && (
              <div className="space-y-3">
                {/* Type / genre / specialite — moved above compatible tools */}
                {(typeLabel || product.genre || product.specialite) && (
                  <div className="flex flex-wrap gap-2">
                    {typeLabel && (
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-500/10 dark:text-orange-200">
                        {typeLabel}
                      </span>
                    )}
                    {product.genre && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
                        {product.genre}
                      </span>
                    )}
                    {product.specialite && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
                        {product.specialite}
                      </span>
                    )}
                  </div>
                )}

                {product.compatibleTools.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Compatible tools
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {product.compatibleTools.map((tool) => (
                        <li
                          key={tool}
                          className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300"
                        >
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.tags.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Tags
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800 dark:bg-orange-500/10 dark:text-orange-200"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </header>

        </div>

        <div className="order-2 lg:order-3 lg:col-span-3">
          <div id={PRODUCT_PURCHASE_ANCHOR_ID} className="scroll-mt-28 lg:sticky lg:top-24">
            <ProductDetailPurchasePanel
              productId={product.id}
              priceCents={product.priceCents}
              priceLabel={priceLabel}
              comparePriceLabel={
                hasDiscount
                  ? formatPrice(product.compareAtPriceCents!, product.currency)
                  : null
              }
              discountPercent={discountPercent}
              deliveryMode={product.deliveryMode}
              isAuthenticated={isAuthenticated}
              loginRedirect={productUrl}
              shareUrl={productUrl}
              shareTitle={product.title}
              targetType="PRODUCT"
            />
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-200 pt-10 dark:border-neutral-800">
        <ProductDetailBottom
          product={product}
          deliveryLabel={deliveryLabel}
          licenseLabel={licenseLabel}
          reviewCount={reviewCount}
          loginRedirect={productUrl}
          purchaseCta={{
            priceCents: product.priceCents,
            priceLabel,
            isAuthenticated,
            productTitle: product.title,
          }}
          middle={
            <>
              {product.whyProductBlocks && product.whyProductBlocks.length > 0 && (
                <ProductWhyHighlights blocks={product.whyProductBlocks} />
              )}

              {product.demoUrl && product.demoType !== 'NONE' && (
                <ProductDemoSection
                  demoUrl={product.demoUrl}
                  demoType={product.demoType}
                  demoSubtitles={product.demoSubtitles}
                  demoDescription={product.demoDescription}
                />
              )}
            </>
          }
        />
      </div>
    </main>
    </>
  );
}

function ProductDetailCreatorCard({
  creatorId,
  creatorName,
  creatorAvatarUrl,
}: {
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string | null;
}) {
  return (
    <Link
      href={`/marketplace/${creatorId}`}
      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-orange-200 hover:bg-orange-50/40 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/5"
    >
      {creatorAvatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={creatorAvatarUrl}
          alt=""
          className="h-14 w-14 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-base font-bold text-orange-800 dark:bg-orange-500/20 dark:text-orange-200">
          {creatorName.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Creator
        </p>
        <p className="text-base font-semibold text-gray-900 dark:text-white">{creatorName}</p>
      </div>
    </Link>
  );
}
