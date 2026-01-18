export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication is handled by Next.js middleware with HTTP Basic Auth
  // If we reach this point, the user is already authenticated
  return <>{children}</>;
}
