'use client';

import { localeTag } from '@/lib/i18n/active';
import { ProductLikeButton } from '@/components/marketplace/ProductLikeButton';

type ProductCardEngagementStripProps = {
  productId: string;
  initialLikes: number;
  initialLiked?: boolean;
  onLikedChange?: (liked: boolean) => void;
  views: number;
  variant?: 'default' | 'onImage';
  /** Pass false on the product detail page — the purchase panel already has a like button */
  showLikeButton?: boolean;
};

function formatCount(value: number) {
  return new Intl.NumberFormat(localeTag()).format(value);
}

export function ProductCardEngagementStrip({
  productId,
  initialLikes,
  initialLiked,
  onLikedChange,
  views,
  variant = 'default',
  showLikeButton = true,
}: ProductCardEngagementStripProps) {
  const onImage = variant === 'onImage';
  const mutedClass = onImage ? 'text-white/80' : 'text-[#536471] dark:text-[#71767B]';
  const iconClass = onImage ? 'text-white/70' : 'text-[#536471] dark:text-[#71767B]';

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
          {initialLikes > 0 ? formatCount(initialLikes) : null}
        </span>
      )}
      <span
        className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${mutedClass}`}
        title={`${formatCount(views)} views`}
      >
        <svg className={`h-4 w-4 ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        {views > 0 ? formatCount(views) : <span className="sr-only">0</span>}
      </span>
    </div>
  );
}
