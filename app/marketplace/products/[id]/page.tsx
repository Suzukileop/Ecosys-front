import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarketplaceBackLink } from '@/components/marketplace/MarketplaceBackLink';
import { ProductDemoSection } from '@/components/marketplace/ProductDemoSection';
import { ProductHashtagList } from '@/components/marketplace/ProductHashtagList';
import { ProductDetailGallery } from '@/components/marketplace/ProductDetailGallery';
import { ProductDetailMediaEngagement } from '@/components/marketplace/ProductDetailMediaEngagement';
import { ProductDetailBottom } from '@/components/marketplace/ProductDetailBottom';
import { ProductWhyHighlights } from '@/components/marketplace/ProductWhyHighlights';
import { ProductDetailPurchasePanel } from '@/components/marketplace/ProductDetailPurchasePanel';
import { PRODUCT_PURCHASE_ANCHOR_ID } from '@/components/marketplace/ProductDetailPurchaseCta';
import { ProductDetailRatingBadge } from '@/components/marketplace/ProductDetailRatingBadge';
import { CreatorPhysicalProductGallery } from '@/components/creator/CreatorPhysicalProductGallery';
import { MediaImage } from '@/components/ui/MediaImage';
import {
  formatPrice,
  getPublicProduct,
  PRODUCT_TYPE_LABELS,
} from '@/lib/marketplace-api';

const EYEBROW = 'text-sm font-medium text-neutral-500 dark:text-neutral-400';
const CHIP =
  'rounded-full border border-black/[0.08] px-3.5 py-1.5 text-[13px] font-medium text-neutral-700 dark:border-white/[0.12] dark:text-neutral-200';
const ACCENT_CHIP =
  'rounded-full bg-[#FF5722]/10 px-3.5 py-1.5 text-[13px] font-medium text-[#FF5722] dark:bg-[#FF5722]/15';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getPublicProduct(id);
  if (!product) return { title: 'Product not found — Skraft' };
  return {
    title: `${product.title} — Skraft Marketplace`,
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
  const reviewCount = product.reviewCount ?? 0;

  const isPhysical = product.type === 'PHYSICAL';
  const hasWhyBlocks = Boolean(product.whyProductBlocks && product.whyProductBlocks.length > 0);
  const hasDemo = Boolean(product.demoUrl && product.demoType !== 'NONE');

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      <MarketplaceBackLink className="group inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white" />

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-10">
        <div className="order-1 min-w-0 lg:col-span-8 lg:row-start-1">
          {isPhysical ? (
            <CreatorPhysicalProductGallery
              title={product.title}
              thumbnailUrl={product.thumbnailUrl}
              galleryImageUrls={product.galleryImageUrls}
              isBestseller={product.isBestseller}
            />
          ) : (
            <ProductDetailGallery
              title={product.title}
              thumbnailUrl={product.thumbnailUrl}
              videoDurationSeconds={product.videoDurationSeconds}
              videoResolution={product.videoResolution}
              isBestseller={product.isBestseller}
              galleryImageUrls={product.galleryImageUrls}
            />
          )}
        </div>

        <div className="order-3 min-w-0 space-y-8 lg:col-span-8 lg:row-start-2">
          <header className="space-y-5">
            {!isPhysical && (
              <div className="flex flex-wrap gap-2">
                <span className={ACCENT_CHIP}>{typeLabel}</span>
                {product.genre && <span className={`${CHIP} capitalize`}>{product.genre}</span>}
                {product.specialite && <span className={`${CHIP} capitalize`}>{product.specialite}</span>}
              </div>
            )}

            <div className="space-y-3">
              <h1 className="break-words text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-[#111111] dark:text-white md:text-[40px]">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                <ProductDetailRatingBadge
                  productId={product.id}
                  initialRating={product.averageRating ?? null}
                  initialReviewCount={reviewCount}
                />
                <ProductDetailMediaEngagement
                  productId={product.id}
                  initialViews={product.views}
                  initialLikes={product.likes}
                />
              </div>
            </div>

            {product.description && (
              <p className="max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
                {product.description}
              </p>
            )}
          </header>

          {product.creatorName && (
            <ProductDetailCreatorCard
              creatorId={product.creatorId}
              creatorName={product.creatorName}
              creatorAvatarUrl={product.creatorAvatarUrl}
              specialite={product.specialite}
            />
          )}

          {!isPhysical && product.compatibleTools.length > 0 && (
            <div className="border-t border-black/[0.06] pt-6 dark:border-white/[0.08]">
              <p className={EYEBROW}>Compatible tools</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.compatibleTools.map((tool) => (
                  <li key={tool} className={CHIP}>
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.tags.length > 0 && (
            <div className="border-t border-black/[0.06] pt-6 dark:border-white/[0.08]">
              <p className={EYEBROW}>Hashtags</p>
              <div className="mt-3">
                <ProductHashtagList tags={product.tags} />
              </div>
            </div>
          )}
        </div>

        <div className="order-2 min-w-0 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1">
          <div id={PRODUCT_PURCHASE_ANCHOR_ID} className="scroll-mt-28">
            <ProductDetailPurchasePanel
              productId={product.id}
              productType={product.type}
              stockQuantity={product.stockQuantity}
              creatorId={product.creatorId}
              creatorName={product.creatorName}
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

      <div className="mt-16 border-t border-black/[0.06] pt-16 dark:border-white/[0.08] md:mt-20 md:pt-20">
        <ProductDetailBottom
          product={product}
          reviewCount={reviewCount}
          loginRedirect={productUrl}
          middle={
            hasWhyBlocks || hasDemo ? (
            <>
              {hasWhyBlocks && <ProductWhyHighlights blocks={product.whyProductBlocks!} />}

              {hasDemo && (
                <ProductDemoSection
                  demoUrl={product.demoUrl!}
                  demoType={product.demoType}
                  demoSubtitles={product.demoSubtitles}
                  demoDescription={product.demoDescription}
                />
              )}
            </>
            ) : null
          }
        />
      </div>
    </main>
  );
}

function ProductDetailCreatorCard({
  creatorId,
  creatorName,
  creatorAvatarUrl,
  specialite,
}: {
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl: string | null;
  specialite?: string | null;
}) {
  const specialty = specialite?.trim() || null;
  return (
    <Link
      href={`/providers/${creatorId}`}
      className="group flex items-center gap-4 rounded-lg border border-black/[0.06] bg-white px-5 py-4 transition hover:border-black/[0.14] dark:border-white/[0.08] dark:bg-[#111111] dark:hover:border-white/[0.16]"
    >
      <MediaImage
        src={creatorAvatarUrl}
        width={48}
        referrerPolicy="no-referrer"
        fallback={
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-sm font-semibold text-[#111111] dark:bg-white/[0.08] dark:text-white">
            {creatorName.slice(0, 2).toUpperCase()}
          </div>
        }
        className="h-12 w-12 shrink-0 rounded-full bg-black/[0.05] object-cover dark:bg-white/[0.08]"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400">Sold by</p>
        <p className="truncate text-[15px] font-semibold text-[#111111] dark:text-white">
          {creatorName}
          {specialty ? (
            <span className="font-normal capitalize text-neutral-500 dark:text-neutral-400"> · {specialty}</span>
          ) : null}
        </p>
      </div>
      <span className="shrink-0 text-sm font-medium text-[#111111] dark:text-white">
        View profile
        <span aria-hidden className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
