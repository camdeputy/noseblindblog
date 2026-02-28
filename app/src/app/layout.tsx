import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Noseblind Blog',
    template: '%s | Noseblind Blog',
  },
  description: 'A modern blog about things that matter.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        <CookieConsentBanner nonce={nonce} />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
