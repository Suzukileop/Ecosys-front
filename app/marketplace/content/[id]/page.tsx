import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ContentViewTracker } from '@/components/marketplace/ContentViewTracker';
import { ContentPostMetaLine } from '@/components/creator/ContentPostMetaLine';
import { getPublicContent } from '@/lib/marketplace-api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const content = await getPublicContent(id);
  if (!content) return { title: 'Content not found — NoProbleme' };
  return {
    title: `${content.title?.trim() || 'Untitled'} — NoProbleme Marketplace`,
    description: content.description ?? content.title ?? 'Portfolio content',
  };
}

export default async function MarketplaceContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await getPublicContent(id);
  if (!content) notFound();

  const isAuthenticated = Boolean((await cookies()).get('refresh_token'));

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <ContentViewTracker contentId={id} />

      <Link href="/marketplace/creators" className="text-sm font-medium text-orange-600 hover:text-orange-700">
        ← Back to creators
      </Link>

      <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="relative aspect-video bg-gray-100">
          {content.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.mediaUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No preview available
            </div>
          )}
        </div>

        <div className="space-y-6 p-6 md:p-8">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {content.genre && (
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                  {content.genre}
                </span>
              )}
              {content.priceInfo && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800" title="Price to recreate this edit">
                  {content.priceInfo}
                </span>
              )}
            </div>
            <ContentPostMetaLine
              creatorName={content.creator?.fullName ?? 'Creator'}
              moodLabel={content.moodLabel}
              moodEmoji={content.moodEmoji}
              taggedUsers={content.taggedUsers}
            />
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {content.title?.trim() || 'Untitled'}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>{content.views} views</span>
              <span>{content.likes} likes</span>
              <time dateTime={content.createdAt}>
                {new Date(content.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </header>

          {content.creator && (
            <Link
              href={`/marketplace/${content.creator.id}`}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/50"
            >
              {content.creator.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={content.creator.avatarUrl}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800">
                  {content.creator.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">{content.creator.fullName}</p>
                <p className="text-xs text-orange-600">View creator profile</p>
              </div>
            </Link>
          )}

          {content.description && (
            <section>
              <h2 className="text-sm font-semibold text-gray-900">Description</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {content.description}
              </p>
            </section>
          )}

          {(content.tags?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-900">Tags</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {content.tags!.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content.toolsUsed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-900">Tools used</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {content.toolsUsed.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {content.mediaUrl && (
            <section>
              <h2 className="text-sm font-semibold text-gray-900">Media</h2>
              <a
                href={content.mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Open full media ↗
              </a>
            </section>
          )}

          {!isAuthenticated && (
            <p className="rounded-xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-3 text-sm text-gray-700">
              <Link
                href={`/login?redirect=${encodeURIComponent(`/marketplace/content/${id}`)}`}
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Sign in
              </Link>{' '}
              to contact this creator or order custom work.
            </p>
          )}
        </div>
      </article>
    </main>
  );
}
