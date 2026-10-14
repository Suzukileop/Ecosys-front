'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { creatorProductEditPath, creatorProductViewPath, type CreatorProductNavFrom } from '@/lib/creator-product-nav';
import type { MarketplaceProductSummary } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

const ITEM =
  'block w-full px-4 py-2.5 text-left text-[15px] font-medium text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] disabled:opacity-40';

/**
 * A product's management actions behind one ⋮ (My services' row menu): Edit, View, Pin, profile
 * visibility, then publication last — the card keeps only the one action its state calls for
 * (Publish, on a draft), so thirty "Unpublish" buttons no longer shout over the catalogue.
 */
export function CreatorProductActionsMenu({
  product,
  from = 'products',
  busy = false,
  onTogglePublish,
  onTogglePin,
  onToggleProfileVisibility,
}: {
  product: MarketplaceProductSummary;
  from?: CreatorProductNavFrom;
  busy?: boolean;
  onTogglePublish?: (product: MarketplaceProductSummary) => void;
  onTogglePin?: (product: MarketplaceProductSummary) => void;
  onToggleProfileVisibility?: (product: MarketplaceProductSummary) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hiddenFromProfile = product.showOnProfile === false;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const run = (action?: (product: MarketplaceProductSummary) => void) => {
    setOpen(false);
    action?.(product);
  };

  return (
    <div ref={rootRef} className={`relative ${open ? 'z-40' : 'z-10'}`}>
      <button
        type="button"
        onClick={() => setOpen((next) => !next)}
        disabled={busy}
        aria-label={t('Actions for {title}', { title: product.title })}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] disabled:opacity-40 ${
          open ? 'bg-[color:var(--gn-hover)] text-[color:var(--gn-ink)]' : ''
        }`}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-50 mb-2 w-56 overflow-hidden rounded-2xl bg-white py-1.5 shadow-[0_0_0_1px_#E1E8ED,0_8px_20px_-14px_rgba(15,20,25,0.18)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336]"
          style={STUDIO_FLOAT_IN_STYLE}
        >
          <Link role="menuitem" href={creatorProductEditPath(product.id, from)} className={ITEM} onClick={() => setOpen(false)}>
            {t('Edit')}
          </Link>
          <Link role="menuitem" href={creatorProductViewPath(product.id, from)} className={ITEM} onClick={() => setOpen(false)}>
            {t('View details')}
          </Link>
          {onTogglePin ? (
            <button type="button" role="menuitem" className={ITEM} onClick={() => run(onTogglePin)}>
              {product.isPinned ? t('Unpin') : t('Pin to top')}
            </button>
          ) : null}
          {onToggleProfileVisibility ? (
            <button type="button" role="menuitem" className={ITEM} onClick={() => run(onToggleProfileVisibility)}>
              {hiddenFromProfile ? t('Show on profile') : t('Hide from profile')}
            </button>
          ) : null}
          {onTogglePublish ? (
            <>
              <div className="my-1 h-px bg-[color:var(--gn-line)]" aria-hidden />
              <button type="button" role="menuitem" className={ITEM} onClick={() => run(onTogglePublish)}>
                {product.isPublished ? t('Unpublish') : t('Publish')}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
