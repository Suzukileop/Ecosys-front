'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  formatPrice,
  getCreatorProduct,
  isFreeProduct,
  productTypeName,
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
import { useT } from '@/lib/i18n/I18nProvider';

type CreatorProductViewContentProps = {
  productId: string;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SALE_LOCK_MS = 5000;
const SALE_UNDO_MS = 8000;
const EYEBROW = 'text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[color:var(--gn-ink2)]';
const CHIP =
  'rounded-[2px] bg-[#EFF3F4] px-2 py-0.5 text-[13px] font-medium leading-[18px] text-[color:var(--gn-ink2)] dark:bg-[#202327]';
const ACCENT_CHIP =
  'rounded-[2px] bg-[color:var(--gn-ink)] px-2 py-0.5 text-[13px] font-semibold leading-[18px] text-[color:var(--gn-surface)]';

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  };
}

export function CreatorProductViewContent({ productId }: CreatorProductViewContentProps) {
  const t = useT();
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
          setLoaded({ id: productId, product: null, error: getApiErrorMessage(e, t('Unable to load this product.')) });
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [productId, t]);

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
      setActionError(getApiErrorMessage(e, t('Could not update publication status.')));
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
          title: t('Sale undone'),
          detail:
            fresh.type === 'PHYSICAL'
              ? t.plural(quantity, '{count} unit is back in stock.', '{count} units are back in stock.')
              : t.plural(quantity, '{count} sale removed from your stats.', '{count} sales removed from your stats.'),
        },
        4000
      );
    } catch (e) {
      showSaleToast({ tone: 'error', title: t('Could not undo this sale'), detail: getApiErrorMessage(e, t('Please try again.')) }, 5000);
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
      showSaleToast({ tone: 'info', title: t('Sale restored') }, 3000);
    } catch (e) {
      showSaleToast({ tone: 'error', title: t('Could not restore this sale'), detail: getApiErrorMessage(e, t('Please try again.')) }, 5000);
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
          title: t('Sale removed'),
          detail:
            fresh.type === 'PHYSICAL'
              ? t('1 unit is back in stock · {count} available', { count: t.number(fresh.stockQuantity ?? 0) })
              : t.plural(fresh.salesCount ?? 0, '{count} sale in total', '{count} sales in total', { count: t.number(fresh.salesCount ?? 0) }),
          onUndo: () => void restoreRemovedSale(fresh.id),
        },
        SALE_UNDO_MS
      );
    } catch (e) {
      showSaleToast({ tone: 'error', title: t('Could not remove this sale'), detail: getApiErrorMessage(e, t('Please try again.')) }, 5000);
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
        ? quantity === 1 ? t('1 unit') : `${quantity} units`
        : quantity === 1 ? t('1 copy') : `${quantity} copies`;
      const totalSales = fresh.salesCount ?? 0;
      showSaleToast(
        {
          tone: 'success',
          title: soldOut ? t('Sold out — great job!') : quantity > 1 ? t('Great sales!') : t('Nice sale!'),
          detail: [
            earned ? t('{units} sold · {earned} earned', { units, earned }) : t('{units} sold', { units }),
            left == null
              ? t.plural(totalSales, '{count} sale in total', '{count} sales in total', { count: t.number(totalSales) })
              : soldOut
                ? t('Time to restock')
                : t('{count} left in stock', { count: t.number(left) }),
          ].join(' · '),
          onUndo: () => void undoSale(fresh.id, quantity),
        },
        SALE_UNDO_MS
      );
    } catch (e) {
      showSaleToast({ tone: 'error', title: t('Could not record this sale'), detail: getApiErrorMessage(e, t('Please try again.')) }, 5000);
    } finally {
      setRecordingSale(false);
      saleBusyRef.current = false;
    }
  };

  if (loading) {
    return <CreatorStudioProductViewSkeleton />;
  }

  if (loadError || !product) {
    return <ErrorAlert message={loadError ?? t('Product not found.')} />;
  }

  const isPhysical = product.type === 'PHYSICAL';
  const typeLabel = productTypeName(product.type, product.typeLabel);
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
      <div className="space-y-10 md:space-y-14">
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
    // `x-product-view` scopes the X-palette overrides (globals.css, PRODUCTS block) for the shared
    // manage panel / details / delete zone rendered below.
    <div className="x-product-view space-y-4 pb-24 sm:space-y-6">
      <motion.div {...fadeUp()} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 sm:px-0">
        <Link
          href={backNav.href}
          className="group inline-flex h-10 items-center gap-1.5 text-[14px] font-medium text-[color:var(--gn-ink2)] transition-colors hover:text-[color:var(--gn-ink)]"
        >
          <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-0.5">
            ←
          </span>
          {backNav.label.replace(/^←\s*/, '')}
        </Link>
        {!product.isPublished && (
          <span className="inline-flex items-center gap-2 bg-[color:var(--gn-surface)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--gn-ink2)]">
            <span className="font-semibold text-[color:var(--gn-ink)]">{t('Draft')}</span>
            {t('Not visible on the marketplace')}
          </span>
        )}
      </motion.div>

      {actionError && <ErrorAlert message={actionError} onDismiss={() => setActionError(null)} />}

      {/* The News / Products layout: the product in one column — gallery, title, then every
          section — and the manage panel as the sticky 340px rail (400px from xl). */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
        <div className="flex min-w-0 flex-col gap-6">
        <motion.div {...fadeUp(0.05)} className="min-w-0">
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

        <motion.div {...fadeUp(0.1)} className="min-w-0 space-y-6 px-4 sm:px-0">
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
              <ProductDetailRatingBadge
                productId={product.id}
                initialRating={product.averageRating ?? null}
                initialReviewCount={reviewCount}
              />
            </div>

            {product.description ? (
              <p className="max-w-3xl whitespace-pre-wrap text-[15px] leading-[22px] text-[color:var(--gn-ink)]">
                {product.description}
              </p>
            ) : (
              <p className="text-[15px] leading-5 text-[color:var(--gn-ink2)]">
                {t('No description yet — a short description helps buyers decide.')}
              </p>
            )}
          </header>

          {!isPhysical && product.compatibleTools.length > 0 && (
            <div>
              <p className={EYEBROW}>{t('Compatible tools')}</p>
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
              <p className={EYEBROW}>{t('Hashtags')}</p>
              <div className="mt-2">
                <ProductHashtagList tags={product.tags} />
              </div>
            </div>
          )}
        </motion.div>

        <div className="mt-6 px-4 sm:px-0 md:mt-10">
          <CreatorProductDetailBottom
            product={product}
            reviewCount={reviewCount}
            loginRedirect={consultUrl}
            onDeleted={handleDeleted}
            middle={storySections}
          />
        </div>
        </div>

        <motion.div {...fadeUp(0.15)} className="order-first min-w-0 px-4 sm:px-0 lg:order-none lg:self-stretch">
          <div className="lg:sticky lg:top-20">
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

      <CreatorSaleToast toast={saleToast} onDismiss={dismissSaleToast} />
    </div>
  );
}
