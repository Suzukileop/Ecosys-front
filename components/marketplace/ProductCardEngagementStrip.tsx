'use client';

import { ProductLikeButton } from '@/components/marketplace/ProductLikeButton';

type ProductCardEngagementStripProps = {
  productId: string;
  initialLikes: number;
  initialLiked?: boolean;
  onLikedChange?: (liked: boolean) => void;
  views: number;
  salesCount?: number;
  showSales?: boolean;
  variant?: 'default' | 'onImage';
  /** Pass false on the product detail page — the purchase panel already has a like button */
  showLikeButton?: boolean;
};

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function ProductCardEngagementStrip({
  productId,
  initialLikes,
  initialLiked,
  onLikedChange,
  views,
  salesCount = 0,
  showSales = false,
  variant = 'default',
  showLikeButton = true,
}: ProductCardEngagementStripProps) {
  const onImage = variant === 'onImage';
  const mutedClass = onImage ? 'text-white/80' : 'text-gray-500 dark:text-gray-400';
  const iconClass = onImage ? 'text-white/70' : 'text-gray-400';
  const salesClass = onImage
    ? 'border-white/20 text-white/90'
    : 'border-gray-200 text-gray-800 dark:border-neutral-700 dark:text-gray-200';

  return (
    <div
      className="flex items-center gap-3"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {showLikeButton ? (
        <ProductLikeButton
          productId={productId}
          initialLikes={initialLikes}
          initialLiked={initialLiked}
          onLikedChange={onLikedChange}
          variant="compact"
          tone={onImage ? 'light' : 'default'}
        />
      ) : (
        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${mutedClass}`}>
          <svg
            className={`h-4 w-4 ${iconClass}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {formatCount(initialLikes)}
        </span>
      )}
      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${mutedClass}`}>
        <svg className={`h-4 w-4 ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        {formatCount(views)}
      </span>
      {showSales && (
        <span className={`inline-flex items-center gap-1 border-l pl-3 text-xs font-semibold ${salesClass}`}>
          <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {formatCount(salesCount)}
        </span>
      )}
    </div>
  );
}
