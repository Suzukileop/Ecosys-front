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
  productTypeName,
} from '@/lib/marketplace-api';

/** A group's label over its chips ("Compatible tools", "Hashtags"): 15px semibold ink, sentence case. */
const EYEBROW = 'text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)]';
/** Square chips as on News posts: tags a light tone, the type a solid ink label. */
const CHIP =
  'rounded-[2px] bg-[#EFF3F4] px-2 py-0.5 text-[13px] font-medium leading-[18px] text-[color:var(--gn-ink2)] dark:bg-[#202327]';
const ACCENT_CHIP =
  'rounded-[2px] bg-[color:var(--gn-ink)] px-2 py-0.5 text-[13px] font-semibold leading-[18px] text-[color:var(--gn-surface)]';

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
  const typeLabel = productTypeName(product.type, product.typeLabel);
  const productUrl = `/marketplace/products/${product.id}`;
  const reviewCount = product.reviewCount ?? 0;

  const isPhysical = product.type === 'PHYSICAL';
  const hasWhyBlocks = Boolean(product.whyProductBlocks && product.whyProductBlocks.length > 0);
  const hasDemo = Boolean(product.demoUrl && product.demoType !== 'NONE');

  return (
    // News / Products' frame: gutters outside a 1240px column; `news-mono` gives the rail box and type.
    <main className="relative z-10 w-full pb-24 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16 lg:pt-3">
      <div className="news-theme news-feed news-mono mx-auto w-full max-w-[1240px]">
      <MarketplaceBackLink className="group mx-4 inline-flex h-10 items-center gap-1.5 text-[14px] font-medium text-[color:var(--gn-ink2)] transition-colors hover:text-[color:var(--gn-ink)] sm:mx-0" />

      {/* One column for the product — gallery, title, then every section — and the purchase panel
          as the sticky rail (340px, 400px from xl), as on News and Products. */}
      <div className="mt-2 sm:mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
        <div className="flex min-w-0 flex-col gap-6">
        <div className="min-w-0">
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

        <div className="min-w-0 space-y-6 px-4 sm:px-0">
          <header className="space-y-4">
            {!isPhysical && (
              <div className="flex flex-wrap gap-1.5">
                <span className={ACCENT_CHIP}>{typeLabel}</span>
                {product.genre && <span className={`${CHIP} capitalize`}>{product.genre}</span>}
                {product.specialite && <span className={`${CHIP} capitalize`}>{product.specialite}</span>}
              </div>
            )}

            <div className="space-y-2">
              <h1 className="break-words text-[26px] font-extrabold leading-8 tracking-[-0.02em] text-[color:var(--gn-ink)] sm:text-[32px] sm:leading-10">
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
              <p className="max-w-3xl whitespace-pre-wrap text-[15px] leading-[22px] text-[color:var(--gn-ink)]">
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
            <div>
              <p className={EYEBROW}>Compatible tools</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {product.compatibleTools.map((tool) => (
                  <li key={tool} className={CHIP}>
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.tags.length > 0 && (
            <div>
              <p className={EYEBROW}>Hashtags</p>
              <div className="mt-2">
                <ProductHashtagList tags={product.tags} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 px-4 sm:px-0 md:mt-10">
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
        </div>

        <div className="order-first min-w-0 px-4 sm:px-0 lg:order-none lg:self-stretch">
          <div id={PRODUCT_PURCHASE_ANCHOR_ID} className="scroll-mt-28 lg:sticky lg:top-20">
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
      className="group -mx-4 flex items-center gap-3 bg-[color:var(--gn-surface)] px-4 py-4 transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-surface))] sm:mx-0 sm:px-5"
    >
      <MediaImage
        src={creatorAvatarUrl}
        width={48}
        referrerPolicy="no-referrer"
        fallback={
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--gn-inset)] text-sm font-semibold text-[color:var(--gn-ink)]">
            {creatorName.slice(0, 2).toUpperCase()}
          </div>
        }
        className="h-11 w-11 shrink-0 rounded-full bg-[color:var(--gn-inset)] object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-5 text-[color:var(--gn-ink)]">{creatorName}</p>
        <p className="truncate text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
          Seller
          {specialty ? <span className="capitalize"> · {specialty}</span> : null}
        </p>
      </div>
      <span className="shrink-0 text-[14px] font-semibold text-[color:var(--gn-ink)] underline-offset-4 group-hover:underline">
        View profile
      </span>
    </Link>
  );
}
