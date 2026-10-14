import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ContentViewTracker } from '@/components/marketplace/ContentViewTracker';
import { ContentPostDetail } from '@/components/marketplace/ContentPostDetail';
import { getPublicContent } from '@/lib/marketplace-api';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const content = await getPublicContent(id);
  if (!content) return { title: 'Post not found — Skraft' };
  return {
    title: `${content.title?.trim() || 'Post'} — Skraft`,
    description: content.description ?? content.title ?? 'A post on Skraft',
  };
}

/**
 * A single post, shown exactly as on News: the same card (header, text, media, action bar) with its
 * comments open, centred in the News column.
 */
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
    <main className="w-full">
      <ContentViewTracker contentId={id} />
      <ContentPostDetail contentId={id} content={content} isAuthenticated={isAuthenticated} />
    </main>
  );
}
