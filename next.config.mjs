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

const extraDevOrigins = (process.env.NEXT_DEV_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
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
      'recharts',
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
  async redirects() {
    return [];
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
