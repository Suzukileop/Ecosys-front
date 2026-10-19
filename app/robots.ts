import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

/** Public pages are crawlable; the signed-in workspace, auth flows and the API are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin',
        '/feed',
        '/studio',
        '/profile',
        '/my-products',
        '/my-services',
        '/messages',
        '/notifications',
        '/search',
        '/settings',
        '/upgrade',
        '/oauth/',
        '/verify-email',
        '/forgot-password',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
