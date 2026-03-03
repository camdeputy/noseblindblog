import { getVercelOidcToken } from '@vercel/oidc';

/**
 * Drop-in replacement for fetch() that authenticates requests to API Gateway.
 * Uses Vercel's OIDC token, validated by the Lambda authorizer against
 * Vercel's JWKS endpoint. Only works when running on Vercel (use `vercel dev` locally).
 */
export async function signedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getVercelOidcToken();

  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
}
