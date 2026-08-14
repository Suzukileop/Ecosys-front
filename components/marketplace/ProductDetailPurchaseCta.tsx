'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';

export const PRODUCT_PURCHASE_ANCHOR_ID = 'product-purchase';

type ProductDetailPurchaseCtaProps = {
  isAuthenticated: boolean;
  creatorId: string;
  creatorName?: string | null;
  className?: string;
};

export function ProductDetailPurchaseCta({
  isAuthenticated,
  creatorId,
  creatorName,
  className = '',
}: ProductDetailPurchaseCtaProps) {
  const { user } = useAuth();
  const isOwner = Boolean(user?.id && user.id === creatorId);
  const messageHref = isAuthenticated
    ? `/dashboard/discussions?user=${encodeURIComponent(creatorId)}`
    : `/login?redirect=${encodeURIComponent(`/dashboard/discussions?user=${encodeURIComponent(creatorId)}`)}`;
  const messageLabel = creatorName?.trim() ? `Discuss with ${creatorName.trim()}` : 'Discuss';

  if (isOwner) return null;

  const buttonClass =
    'inline-flex min-w-[200px] items-center justify-center gap-2.5 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98]';

  return (
    <div className={`flex flex-col items-center gap-6 py-8 text-center sm:py-10 ${className}`}>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">Ready to get started?</p>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Let&apos;s talk
        </p>
      </div>

      <Link href={messageHref} className={buttonClass} aria-label={messageLabel}>
        <FontAwesomeIcon icon={faComment} className="h-4 w-4" />
        Discuss
      </Link>
    </div>
  );
}
