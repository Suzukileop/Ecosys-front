'use client';

import { Avatar } from '@/components/ui/Avatar';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { mediaImageSrc, mediaImageSrcSet } from '@/lib/media-image-url';
import type { GlobalSearchItem } from '@/lib/global-search';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * One quick result in the search overlay, in the News vocabulary: a full-bleed 56px row (20px
 * gutters on phones, 24px from sm), a 40px picture — round for people, square for products and
 * posts, like the square cards they open — then the name in bold and one meta line in secondary ink.
 *
 * What it dropped: the trailing chevron on every row (twelve arrows saying the same thing), the
 * rounded hover pill (the overlay is edge to edge, so the row fills edge to edge) and the badge
 * capsule ("Video" is now plain meta on the subtitle line). Hover and the keyboard highlight are the
 * same single fill tone, `--gn-hover-strong`, so the pointer and the arrow keys never disagree.
 *
 * Rendered inside the overlay's `news-theme news-feed news-mono` scope, so it reads the `--gn-*`
 * tokens.
 */

function HashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 3 8 21M16 3l-2 18M4.5 9h16M3.5 15h16" />
    </svg>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 8h14l-1 12.5H6z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

function isPeopleCategory(category: GlobalSearchItem['category']) {
  return category === 'users' || category === 'creators' || category === 'serviceProviders';
}

function GlobalSearchResultThumbnail({ item }: { item: GlobalSearchItem }) {
  const t = useT();
  if (isPeopleCategory(item.category)) {
    return (
      <AvatarImage
        src={item.avatarUrl}
        className="h-10 w-10 shrink-0 rounded-full bg-[color:var(--gn-surface)] object-cover"
        fallback={
          <div className="shrink-0">
            <Avatar name={item.title} size="md" tone="muted" />
          </div>
        }
      />
    );
  }

  if (item.thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaImageSrc(item.thumbnailUrl, 48)}
        srcSet={mediaImageSrcSet(item.thumbnailUrl, 48)}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-10 w-10 shrink-0 bg-[color:var(--gn-surface)] object-cover"
      />
    );
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[color:var(--gn-surface)] text-[color:var(--gn-ink2)]">
      {item.category === 'products' ? <BagIcon className="h-5 w-5" /> : <HashIcon className="h-5 w-5" />}
    </span>
  );
}

type GlobalSearchResultRowProps = {
  item: GlobalSearchItem;
  onClick: () => void;
  onMouseEnter?: () => void;
  selected?: boolean;
  disabled?: boolean;
  /** Kept for callers; the row has one height now. */
  compact?: boolean;
  /**
   * When set, the row is an option of the overlay's combobox: it carries this id (the input points
   * at it with `aria-activedescendant`) and leaves the tab order — the arrow keys move between rows.
   */
  optionId?: string;
};

export function GlobalSearchResultRow({
  item,
  onClick,
  onMouseEnter,
  selected = false,
  disabled = false,
  optionId,
}: GlobalSearchResultRowProps) {
  const t = useT();
  const meta = [item.subtitle, item.badge].filter(Boolean).join(' · ');
  return (
    <button
      type="button"
      id={optionId}
      role={optionId ? 'option' : undefined}
      aria-selected={optionId ? selected : undefined}
      tabIndex={optionId ? -1 : undefined}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
      data-pf-no-color-transition
      className={`flex min-h-14 w-full items-center gap-3 px-5 py-2 text-left text-[color:var(--gn-ink)] transition-colors duration-100 disabled:opacity-60 sm:px-6 ${
        selected ? 'bg-[color:var(--gn-hover-strong,var(--gn-hover))]' : 'hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
      }`}
    >
      <GlobalSearchResultThumbnail item={item} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold leading-5">{t(item.title)}</span>
        {meta ? (
          <span className="block truncate text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">{meta}</span>
        ) : null}
      </span>
    </button>
  );
}

export function getGlobalSearchItemHref(item: GlobalSearchItem): string {
  switch (item.category) {
    case 'creators':
    case 'serviceProviders':
      return `/providers/${item.id}`;
    case 'products':
      return `/marketplace/products/${item.id}`;
    case 'content':
      return `/marketplace/content/${item.id}`;
    default:
      return '/messages';
  }
}
