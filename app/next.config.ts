import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';
const mediaOrigin = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/$/, '');
const s3UploadOrigin =
  process.env.AWS_MEDIA_BUCKET && process.env.AWS_MEDIA_REGION
    ? `https://${process.env.AWS_MEDIA_BUCKET}.s3.${process.env.AWS_MEDIA_REGION}.amazonaws.com`
    : '';

const publicCspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `img-src 'self' data: blob:${mediaOrigin ? ` ${mediaOrigin}` : ''}`,
  `connect-src 'self' https://cm6xvdr4ja.execute-api.us-west-1.amazonaws.com https://vitals.vercel-insights.com https://va.vercel-scripts.com${s3UploadOrigin ? ` ${s3UploadOrigin}` : ''}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  // Gzip all responses
  compress: true,
  // Don't leak the server framework in response headers
  poweredByHeader: false,
  experimental: {
    sri: {
      algorithm: 'sha256',
    },
  },
  images: {
    // Serve modern formats when supported
    formats: ['image/avif', 'image/webp'],
    // Allow any HTTPS image source (fragrance house images, S3, etc.)
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [
      {
        source: '/((?!admin|api/admin).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: publicCspHeader,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'X-Download-Options',
            value: 'noopen',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '0',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
