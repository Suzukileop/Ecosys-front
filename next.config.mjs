function buildImageRemotePatterns() {
  const patterns = [
    {
      protocol: 'https',
      hostname: '**.googleusercontent.com',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
    {
      protocol: 'https',
      hostname: 'flagcdn.com',
    },
    {
      protocol: 'https',
      hostname: '**.r2.dev',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8080',
      pathname: '/api/storage/**',
    },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      const protocol = parsed.protocol.replace(':', '');
      if (protocol === 'http' || protocol === 'https') {
        patterns.push({
          protocol,
          hostname: parsed.hostname,
          ...(parsed.port ? { port: parsed.port } : {}),
          pathname: '/api/storage/**',
        });
      }
    } catch {
      // ignore invalid NEXT_PUBLIC_API_URL
    }
  }

  return patterns;
}

/** Where the Next server forwards /api/* it doesn't handle itself (single-origin tunnel setup). */
const BACKEND_INTERNAL_URL = (process.env.BACKEND_INTERNAL_URL || 'http://localhost:8080').replace(/\/$/, '');

/** A `/marketplace/<segment>` that is not one of the catalogue's own sections. */
const LEGACY_CREATOR_SEGMENT = '(?!(?:creators|products|content)(?:/|$))[^/]+';

const extraDevOrigins = (process.env.NEXT_DEV_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a production build run beside `next dev` without overwriting its .next folder.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // LAN preview (phone / autre PC) : HMR is blocked unless the Origin is listed.
  // Whole home subnet — DHCP hands the phone / other PC a different address from time to time.
  allowedDevOrigins: ['192.168.1.*', '*.trycloudflare.com', ...extraDevOrigins],
  experimental: {
    // Uploads through the /api rewrite: match spring.servlet.multipart.max-request-size (520MB).
    proxyClientMaxBodySize: '520mb',
    proxyTimeout: 10 * 60 * 1000,
    optimizePackageImports: [
      'framer-motion',
      '@hookform/resolvers',
      'react-hook-form',
      'react-markdown',
    ],
  },
  images: {
    // Dev: backend media is on localhost — Next 16 blocks private IPs by default (SSRF guard).
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: buildImageRemotePatterns(),
    // Next 16 defaults to `[{ pathname: '/**', search: '' }]`, which rejects any local upstream
    // carrying a query string. /api/storage takes `?w=` to pick a stored rendition, so the
    // optimizer resizes a ~60 KB derivative instead of a multi-megabyte original. The first entry
    // keeps the default hardening everywhere else; omitting `search` allows any on the second.
    localPatterns: [{ pathname: '/**', search: '' }, { pathname: '/api/storage/**' }],
  },
  // Legacy URLs (bookmarks, shared links, sent e-mails) → current routes. See lib/routes.ts.
  async redirects() {
    return [
      { source: '/dashboard', destination: '/feed', permanent: true },
      { source: '/dashboard/home', destination: '/feed', permanent: true },
      { source: '/dashboard/portfolio', destination: '/studio', permanent: true },
      { source: '/dashboard/creator', destination: '/profile', permanent: true },
      { source: '/dashboard/creator/profile', destination: '/profile?tab=profile', permanent: true },
      { source: '/dashboard/creator/visitors', destination: '/profile?tab=visitors', permanent: true },
      { source: '/dashboard/creator/content/new', destination: '/profile?tab=content&publish=1', permanent: true },
      { source: '/dashboard/creator/content/:path*', destination: '/profile?tab=content', permanent: true },
      { source: '/dashboard/creator/products/new', destination: '/my-products?create=1', permanent: true },
      { source: '/dashboard/creator/products/:path*', destination: '/my-products/:path*', permanent: true },
      { source: '/dashboard/products', destination: '/my-products', permanent: true },
      { source: '/dashboard/services', destination: '/my-services', permanent: true },
      { source: '/dashboard/purchases/:path*', destination: '/purchases', permanent: true },
      { source: '/dashboard/favorites', destination: '/marketplace?tab=favorites', permanent: true },
      { source: '/dashboard/discussions/:path*', destination: '/messages/:path*', permanent: true },
      { source: '/dashboard/:section(notifications|search|settings)', destination: '/:section', permanent: true },
      { source: '/marketplace/my-products', destination: '/my-products', permanent: true },
      { source: '/marketplace/my-services', destination: '/my-services', permanent: true },
      { source: '/marketplace/purchases/:path*', destination: '/purchases', permanent: true },
      { source: '/marketplace/favorites', destination: '/marketplace?tab=favorites', permanent: true },
      { source: '/marketplace/portfolio', destination: '/providers', permanent: true },
      { source: '/marketplace/creators', destination: '/providers', permanent: true },
      { source: '/marketplace/creators/:path*', destination: '/providers/:path*', permanent: true },
      { source: '/marketplace/products', destination: '/marketplace', permanent: true },
      { source: '/users', destination: '/admin/users', permanent: true },
      { source: '/reports', destination: '/admin/reports', permanent: true },
      // Creator profiles used to sit directly under /marketplace, beside its static sections.
      {
        source: `/marketplace/:creatorId(${LEGACY_CREATOR_SEGMENT})`,
        destination: '/providers/:creatorId',
        permanent: true,
      },
      {
        source: `/marketplace/:creatorId(${LEGACY_CREATOR_SEGMENT})/shop`,
        destination: '/providers/:creatorId/shop',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // afterFiles: app/api route handlers (refresh-cookie helpers) still win over the proxy.
    return {
      afterFiles: [
        { source: '/api/:path*', destination: `${BACKEND_INTERNAL_URL}/api/:path*` },
        { source: '/ws/:path*', destination: `${BACKEND_INTERNAL_URL}/ws/:path*` },
      ],
    };
  },
  async headers() {
    return [
      {
        // Versioned emoji spritesheet — rename the file when upgrading emoji-mart data.
        source: '/emoji/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
