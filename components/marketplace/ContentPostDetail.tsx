'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewsFeedPostCard } from '@/components/home/NewsFeedPostCard';
import { HomeNewsFeedSkeleton } from '@/components/home/HomeNewsSkeleton';
import { getPublicContentFeedItem } from '@/lib/marketplace-api';
import { mediaImageResponsive } from '@/lib/media-image-url';
import { formatCompactDate } from '@/components/marketplace/product-relative-date';
import type { MarketplaceContentDetail, PublicContentFeedItem } from '@/types/marketplace';
import { useT } from '@/lib/i18n/I18nProvider';

/**
 * Generic "Back": a post is opened from News, a profile, search, a notification or a shared link, so
 * the label never names a destination. Goes back in history when the visitor came from inside the
 * app, otherwise to News (signed in) or the providers directory (visitor).
 */
function PostBackLink({ fallbackHref }: { fallbackHref: string }) {
  const t = useT();
  const router = useRouter();
  return (
    <Link
      href={fallbackHref}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        let sameOrigin = false;
        try {
          sameOrigin = Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
        } catch {
          sameOrigin = false;
        }
        if (sameOrigin && window.history.length > 1) {
          event.preventDefault();
          router.back();
        }
      }}
      className="group inline-flex h-10 items-center gap-1.5 px-4 text-[14px] font-medium text-[color:var(--gn-ink2)] transition-colors hover:text-[color:var(--gn-ink)] sm:px-1"
    >
      <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-0.5">
        ←
      </span>
      {t('Back')}
    </Link>
  );
}

/** Server-rendered summary, shown only when the full post cannot be loaded in the browser. */
function StaticPost({ content }: { content: MarketplaceContentDetail }) {
  const t = useT();
  const name = content.creator?.fullName ?? 'Creator';
  const title = content.title?.trim() || t('Untitled');
  return (
    <article className="gn-card overflow-hidden">
      <header className="flex items-center gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--gn-inset)] text-[13px] font-semibold text-[color:var(--gn-ink)]">
          {name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          {content.creator ? (
            <Link
              href={`/providers/${content.creator.id}`}
              className="block truncate text-[15px] font-bold leading-5 text-[color:var(--gn-ink)] hover:underline"
            >
              {name}
            </Link>
          ) : (
            <p className="truncate text-[15px] font-bold leading-5 text-[color:var(--gn-ink)]">{name}</p>
          )}
          <time dateTime={content.createdAt} className="text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
            {formatCompactDate(content.createdAt)}
          </time>
        </div>
      </header>
      <div className="px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
        <h1 className="gn-editorial-headline !line-clamp-none">{title}</h1>
        {content.description ? (
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[22px] text-[color:var(--gn-ink)]">
            {content.description}
          </p>
        ) : null}
        {content.mediaUrl && content.mediaType !== 'GIF' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...mediaImageResponsive(content.mediaUrl, [640, 828, 1080])}
            sizes="(min-width: 1024px) 680px, 100vw"
            alt=""
            decoding="async"
            className="mt-3 w-full object-cover"
          />
        ) : null}
      </div>
    </article>
  );
}

export function ContentPostDetail({
  contentId,
  content,
  isAuthenticated,
}: {
  contentId: string;
  content: MarketplaceContentDetail;
  isAuthenticated: boolean;
}) {
  const t = useT();
  const [post, setPost] = useState<PublicContentFeedItem | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getPublicContentFeedItem(contentId).then((item) => {
      if (cancelled) return;
      if (item) setPost(item);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  return (
    <div className="news-theme news-feed news-mono w-full pb-24 pt-2 sm:px-6 sm:pt-4 lg:px-8">
      <div className="mx-auto w-full max-w-[600px] xl:max-w-[680px]">
        <PostBackLink fallbackHref={isAuthenticated ? '/feed' : '/providers'} />
        <div className="mt-1 sm:mt-2">
          {post ? (
            <NewsFeedPostCard post={post} priority autoOpenComments />
          ) : failed ? (
            <StaticPost content={content} />
          ) : (
            <HomeNewsFeedSkeleton count={1} />
          )}
        </div>
        {!isAuthenticated ? (
          <p className="px-4 pt-4 text-center text-[14px] leading-5 text-[color:var(--gn-ink2)] sm:px-0">
            <Link
              href={`/login?redirect=${encodeURIComponent(`/marketplace/content/${contentId}`)}`}
              className="font-semibold text-[color:var(--gn-ink)] underline-offset-4 hover:underline"
            >
              {t('Sign in')}
            </Link>{' '}
            {t('to comment, or to contact this creator.')}
          </p>
        ) : null}
      </div>
    </div>
  );
}
