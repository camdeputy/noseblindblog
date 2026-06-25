import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Keep admin pages request-rendered so Next can nonce its inline scripts from the CSP header.
  await headers();
  return <>{children}</>;
}
