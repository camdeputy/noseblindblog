/**
 * Drop-in replacement for fetch() that authenticates requests to API Gateway.
 *
 * In Vercel: sends the OIDC token as `Authorization: Bearer <token>`.
 *   The Lambda authorizer validates the JWT against Vercel's JWKS endpoint.
 *
 * Locally: falls back to `Authorization: Bearer <ADMIN_API_KEY>`, which the
 *   Lambda authorizer accepts as a static-key fallback for development.
 */
export async function signedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = process.env.VERCEL_OIDC_TOKEN;

  if (!token) {
    throw new Error(
      'VERCEL_OIDC_TOKEN is not set. Admin routes require a Vercel OIDC token. ' +
      'Run `vercel dev` locally instead of `next dev` to have the token injected.',
    );
  }

  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
}
