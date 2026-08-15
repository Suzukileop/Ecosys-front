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

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
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
    remotePatterns: buildImageRemotePatterns(),
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;
