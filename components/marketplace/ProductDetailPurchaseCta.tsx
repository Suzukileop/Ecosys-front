'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { setPendingProductDraft } from '@/lib/chat-product-draft';

export const PRODUCT_PURCHASE_ANCHOR_ID = 'product-purchase';

type ProductDetailPurchaseCtaProps = {
  isAuthenticated: boolean;
  creatorId: string;
  creatorName?: string | null;
  productId?: string;
  className?: string;
};

export function ProductDetailPurchaseCta({
  isAuthenticated,
  creatorId,
  productId,
  creatorName,
  className = '',
}: ProductDetailPurchaseCtaProps) {
  const { user } = useAuth();
  const isOwner = Boolean(user?.id && user.id === creatorId);
  const discussionPath = `/dashboard/discussions?user=${encodeURIComponent(creatorId)}${
    productId ? `&product=${encodeURIComponent(productId)}` : ''
  }`;
  const messageHref = isAuthenticated ? discussionPath : `/login?redirect=${encodeURIComponent(discussionPath)}`;
  const messageLabel = creatorName?.trim() ? `Discuss with ${creatorName.trim()}` : 'Discuss';

  if (isOwner) return null;

  return (
    <div
      className={`flex flex-col items-start justify-between gap-6 rounded-lg border border-black/[0.06] bg-white px-6 py-8 dark:border-white/[0.08] dark:bg-[#111111] sm:flex-row sm:items-center sm:px-8 ${className}`}
    >
      <div>
        <p className="text-xl font-semibold tracking-[-0.01em] text-[#111111] dark:text-white">Ready to get started?</p>
        <p className="mt-1.5 max-w-lg text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {creatorName?.trim()
            ? `Ask ${creatorName.trim()} anything — details, delivery, or a custom deal.`
            : 'Ask the creator anything — details, delivery, or a custom deal.'}
        </p>
      </div>

      <Link
        href={messageHref}
        onClick={productId ? () => setPendingProductDraft(creatorId, productId) : undefined}
        aria-label={messageLabel}
        className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FF5722] px-8 text-[15px] font-medium text-white transition hover:bg-[#F4511E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111111] sm:w-auto"
      >
        <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" />
        Discuss
      </Link>
    </div>
  );
}
