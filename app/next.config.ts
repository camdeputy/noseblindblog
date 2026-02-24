import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Gzip all responses
  compress: true,
  // Don't leak the server framework in response headers
  poweredByHeader: false,
  images: {
    // Serve modern formats when supported
    formats: ['image/avif', 'image/webp'],
    // Allow any HTTPS image source (fragrance house images, S3, etc.)
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
