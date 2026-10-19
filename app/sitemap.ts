import type { MetadataRoute } from 'next';
import { serverMarketplaceFetch } from '@/lib/marketplace-api';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

/* Rebuilt at most once an hour: new providers appear without a deploy. */
export const revalidate = 3600;

type CreatorCardPage = { content?: Array<{ userId?: string; username?: string | null }> };

/** Landing, legal pages, the directories and every public provider profile / portfolio. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/providers`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/marketplace`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/legal`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  /* The API serves at most 100 cards per page; 20 pages cover the first 2,000 providers. */
  const listed: NonNullable<CreatorCardPage['content']> = [];
  for (let page = 0; page < 20; page += 1) {
    const batch = await serverMarketplaceFetch<CreatorCardPage & { last?: boolean }>(
      `/api/marketplace/creators?page=${page}&size=100`,
      { revalidate },
    );
    listed.push(...(batch?.content ?? []));
    if (!batch || batch.last !== false) break;
  }
  for (const creator of listed) {
    const slug = creator.username || creator.userId;
    if (!slug) continue;
    const id = encodeURIComponent(slug);
    pages.push(
      { url: `${SITE_URL}/providers/${id}`, changeFrequency: 'weekly', priority: 0.6 },
      { url: `${SITE_URL}/portfolio/${id}`, changeFrequency: 'weekly', priority: 0.6 },
    );
  }
  return pages;
}
