'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  formatPrice,
  getCreatorProduct,
  isFreeProduct,
  PRODUCT_TYPE_LABELS,
  publishProduct,
  recordProductSale,
  undoProductSale,
  unpublishProduct,
} from '@/lib/marketplace-api';
import { CreatorSaleToast, type SaleToast } from '@/components/creator/CreatorSaleToast';
import { getApiErrorMessage } from '@/lib/api-error';
import { creatorProductsRedirectAfterAction } from '@/lib/creator-product-feedback';
import {
  creatorProductBackNav,
  creatorProductViewPath,
  parseCreatorProductNavFrom,
} from '@/lib/creator-product-nav';
import { CreatorProductDetailBottom } from '@/components/creator/CreatorProductDetailBottom';
import { CreatorProductManagePanel } from '@/components/creator/CreatorProductManagePanel';
import { ProductDemoSection } from '@/components/marketplace/ProductDemoSection';
import { ProductHashtagList } from '@/components/marketplace/ProductHashtagList';
import { ProductDetailGallery } from '@/components/marketplace/ProductDetailGallery';
import { CreatorPhysicalProductGallery } from '@/components/creator/CreatorPhysicalProductGallery';
import { ProductDetailRatingBadge } from '@/components/marketplace/ProductDetailRatingBadge';
import { ProductWhyHighlights } from '@/components/marketplace/ProductWhyHighlights';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioProductViewSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import type { MarketplaceProductDetail } from '@/types/marketplace';

type CreatorProductViewContentProps = {
  productId: string;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SALE_LOCK_MS = 5000;
const SALE_UNDO_MS = 8000;
const EYEBROW = 'text-sm font-medium text-neutral-500 dark:text-neutral-400';
const CHIP =
  'rounded-full border border-black/[0.08] px-3.5 py-1.5 text-[13px] font-medium text-neutral-700 dark:border-white/[0.12] dark:text-neutral-200';
const ACCENT_CHIP =
  'rounded-full bg-[#FF5722]/10 px-3.5 py-1.5 text-[13px] font-medium text-[#FF5722] dark:bg-[#FF5722]/15';

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  };
}

export function CreatorProductViewContent({ productId }: CreatorProductViewContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navFrom = parseCreatorProductNavFrom(searchParams.get('from'));
  const backNav = creatorProductBackNav(navFrom);
  const [loaded, setLoaded] = useState<{
    id: string;
    product: MarketplaceProductDetail | null;
    error: string | null;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [recordingSale, setRecordingSale] = useState(false);
  const [saleLocked, setSaleLocked] = useState(false);
  const [saleToast, setSaleToast] = useState<SaleToast | null>(null);
  const saleBusyRef = useRef(false);
  const lockTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    getCreatorProduct(productId).then(
      (data) => {
        if (!cancelled) setLoaded({ id: productId, product: data, error: null });
      },
      (e) => {
        if (!cancelled) {
          setLoaded({ id: productId, product: null, error: getApiErrorMessage(e, 'Unable to load this product.') });
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const current = loaded?.id === productId ? loaded : null;
  const loading = current === null;
  const product = current?.product ?? null;
  const loadError = current?.error ?? null;
  const setProduct = (next: MarketplaceProductDetail) => setLoaded({ id: productId, product: next, error: null });

  const togglePublish = async () => {
    if (!product) return;
    setActionError(null);
    setPublishing(true);
    try {
      if (product.isPublished) {
        await unpublishProduct(product.id);
      } else {
        await publishProduct(product.id);
      }
      const fresh = await getCreatorProduct(product.id);
      setProduct(fresh);
    } catch (e) {
      setActionError(getApiErrorMessage(e, 'Could not update publication status.'));
    } finally {
      setPublishing(false);
    }
  };

  const showSaleToast = (next: Omit<SaleToast, 'id'>, ttl: number) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setSaleToast({ ...next, id: Date.now() });
    toastTimerRef.current = window.setTimeout(() => setSaleToast(null), ttl);
  };

  const dismissSaleToast = () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setSaleToast(null);
  };

  const undoSale = async (productIdToUndo: string, quantity: number) => {
    if (saleBusyRef.current) return;
    saleBusyRef.current = true;
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setSaleToast((t) => (t ? { ...t, undoing: true } : t));
    try {
      await undoProductSale(productIdToUndo, quantity);
      const fresh = await getCreatorProduct(productIdToUndo);
      setProduct(fresh);
      if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
      setSaleLocked(false);
      showSaleToast(
        {
          tone: 'info',
          title: 'Sale undone',
          detail:
            fresh.type === 'PHYSICAL'
              ? `${quantity === 1 ? '1 unit is' : `${quantity} units are`} back in stock.`
              : `${quantity === 1 ? '1 sale' : `${quantity} sales`} removed from your stats.`,
        },
        4000
      );
    } catch (e) {
      showSaleToast({ tone: 'error', title: 'Could not undo this sale', detail: getApiErrorMessage(e, 'Please try again.') }, 5000);
    } finally {
      saleBusyRef.current = false;
    }
  };

  const restoreRemovedSale = async (productIdToRestore: string) => {
    if (saleBusyRef.current) return;
    saleBusyRef.current = true;
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setSaleToast((t) => (t ? { ...t, undoing: true } : t));
    try {
      await recordProductSale(productIdToRestore, 1);
      setProduct(await getCreatorProduct(productIdToRestore));
      showSaleToast({ tone: 'info', title: 'Sale restored' }, 3000);
    } catch (e) {
      showSaleToast({ tone: 'error', title: 'Could not restore this sale', detail: getApiErrorMessage(e, 'Please try again.') }, 5000);
    } finally {
      saleBusyRef.current = false;
    }
  };

  const removeSale = async () => {
    if (!product || saleBusyRef.current) return;
    saleBusyRef.current = true;
    setRecordingSale(true);
    try {
      await undoProductSale(product.id, 1);
      const fresh = await getCreatorProduct(product.id);
      setProduct(fresh);
      if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
      setSaleLocked(false);
      showSaleToast(
        {
          tone: 'info',
          title: 'Sale removed',
          detail:
            fresh.type === 'PHYSICAL'
              ? `1 unit is back in stock · ${(fresh.stockQuantity ?? 0).toLocaleString()} available`
              : `${(fresh.salesCount ?? 0).toLocaleString()} ${fresh.salesCount === 1 ? 'sale' : 'sales'} in total`,
          onUndo: () => void restoreRemovedSale(fresh.id),
        },
        SALE_UNDO_MS
      );
    } catch (e) {
      showSaleToast({ tone: 'error', title: 'Could not remove this sale', detail: getApiErrorMessage(e, 'Please try again.') }, 5000);
    } finally {
      setRecordingSale(false);
      saleBusyRef.current = false;
    }
  };

  const recordSale = async (quantity: number) => {
    if (!product || saleBusyRef.current) return;
    saleBusyRef.current = true;
    setActionError(null);
    setRecordingSale(true);
    try {
      await recordProductSale(product.id, quantity);
      const fresh = await getCreatorProduct(product.id);
      setProduct(fresh);
      setSaleLocked(true);
      if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = window.setTimeout(() => setSaleLocked(false), SALE_LOCK_MS);

      const earned = isFreeProduct(fresh.priceCents)
        ? null
        : formatPrice(fresh.priceCents * quantity, fresh.currency);
      const physical = fresh.type === 'PHYSICAL';
      const left = physical ? (fresh.stockQuantity ?? 0) : null;
      const soldOut = left != null && left <= 0;
      const units = physical
        ? quantity === 1 ? '1 unit' : `${quantity} units`
        : quantity === 1 ? '1 copy' : `${quantity} copies`;
      const totalSales = fresh.salesCount ?? 0;
      showSaleToast(
        {
          tone: 'success',
          title: soldOut ? 'Sold out — great job!' : quantity > 1 ? 'Great sales!' : 'Nice sale!',
          detail: [
            earned ? `${units} sold · ${earned} earned` : `${units} sold`,
            left == null
              ? `${totalSales.toLocaleString()} ${totalSales === 1 ? 'sale' : 'sales'} in total`
              : soldOut
                ? 'Time to restock'
                : `${left.toLocaleString()} left in stock`,
          ].join(' · '),
          onUndo: () => void undoSale(fresh.id, quantity),
        },
        SALE_UNDO_MS
      );
    } catch (e) {
      showSaleToast({ tone: 'error', title: 'Could not record this sale', detail: getApiErrorMessage(e, 'Please try again.') }, 5000);
    } finally {
      setRecordingSale(false);
      saleBusyRef.current = false;
    }
  };

  if (loading) {
    return <CreatorStudioProductViewSkeleton />;
  }

  if (loadError || !product) {
    return <ErrorAlert message={loadError ?? 'Product not found.'} />;
  }

  const isPhysical = product.type === 'PHYSICAL';
  const typeLabel = PRODUCT_TYPE_LABELS[product.type] ?? product.type;
  const reviewCount = product.reviewCount ?? 0;
  const consultUrl = creatorProductViewPath(product.id, navFrom);
  const hasWhy = !isPhysical && Boolean(product.whyProductBlocks && product.whyProductBlocks.length > 0);
  const hasDemo = !isPhysical && Boolean(product.demoUrl && product.demoType !== 'NONE');

  const handleDeleted = () => {
    router.replace(creatorProductsRedirectAfterAction('deleted', product.title));
    router.refresh();
  };

  const storySections =
    hasWhy || hasDemo ? (
      <div className="space-y-16 border-t border-black/[0.06] pt-16 dark:border-white/[0.08] md:space-y-20 md:pt-20">
        {hasWhy ? <ProductWhyHighlights blocks={product.whyProductBlocks!} /> : null}
        {hasDemo ? (
          <ProductDemoSection
            demoUrl={product.demoUrl!}
            demoType={product.demoType}
            demoSubtitles={product.demoSubtitles}
            demoDescription={product.demoDescription}
          />
        ) : null}
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-20">
      <motion.div {...fadeUp()} className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backNav.href}
          className="group inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white"
        >
          <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-0.5">
            ←
          </span>
          {backNav.label.replace(/^←\s*/, '')}
        </Link>
        {!product.isPublished && (
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] px-3.5 py-1.5 text-[13px] font-medium text-neutral-700 dark:border-white/[0.12] dark:text-neutral-200">
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
            Draft — not visible on the public marketplace
          </span>
        )}
      </motion.div>

      {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-10">
        <motion.div {...fadeUp(0.05)} className="order-1 min-w-0 lg:col-span-8 lg:row-start-1">
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
            />
          )}
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="order-3 min-w-0 space-y-8 lg:col-span-8 lg:row-start-2">
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
              <ProductDetailRatingBadge
                productId={product.id}
                initialRating={product.averageRating ?? null}
                initialReviewCount={reviewCount}
              />
            </div>

            {product.description ? (
              <p className="max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
                {product.description}
              </p>
            ) : (
              <p className="text-base text-neutral-500 dark:text-neutral-400">
                No description yet — a short description helps buyers decide.
              </p>
            )}
          </header>

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
        </motion.div>

        <motion.div
          {...fadeUp(0.15)}
          className="order-2 min-w-0 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1"
        >
          <div>
            <CreatorProductManagePanel
              product={product}
              publishing={publishing}
              onTogglePublish={() => void togglePublish()}
              recordingSale={recordingSale}
              saleLocked={saleLocked}
              onRecordSale={(quantity) => void recordSale(quantity)}
              onRemoveSale={() => void removeSale()}
              from={navFrom}
            />
          </div>
        </motion.div>
      </div>

      <div className="!mt-16 border-t border-black/[0.06] pt-16 dark:border-white/[0.08] md:!mt-20 md:pt-20">
        <CreatorProductDetailBottom
          product={product}
          reviewCount={reviewCount}
          loginRedirect={consultUrl}
          onDeleted={handleDeleted}
          middle={storySections}
        />
      </div>

      <CreatorSaleToast toast={saleToast} onDismiss={dismissSaleToast} />
    </div>
  );
}
