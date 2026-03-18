import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Cormorant_Garamond, Source_Sans_3 } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { siteName, siteDescription, siteUrl } from '@/lib/siteConfig';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-garamond',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reading headers opts this layout into dynamic rendering on every request.
  // This ensures the per-request CSP nonce from proxy.ts matches the nonce
  // embedded in the rendered HTML. Without this, revalidate on edge runtime
  // pages can cause cached HTML (with a stale nonce) to be served while
  // the proxy issues a fresh nonce in the CSP header — blocking all scripts.
  await headers();

  return (
    <html lang="en" className={`${cormorant.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="grow">{children}</main>
        <Footer />
        {/* Cookieless — no consent gate needed */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
