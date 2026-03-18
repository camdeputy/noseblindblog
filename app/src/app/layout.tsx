import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { connection } from 'next/server';
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

export const dynamic = 'force-dynamic';

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
  // Nonce-based CSP only works when each HTML document is rendered from a
  // live request, not a prerendered shell.
  await connection();
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
