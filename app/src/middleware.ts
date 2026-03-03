import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'admin_session';

function hexToUint8Array(hex: string): Uint8Array<ArrayBuffer> {
  if (hex.length % 2 !== 0) return new Uint8Array(new ArrayBuffer(0));
  const buf = new ArrayBuffer(hex.length / 2);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

async function verifySessionToken(
  token: string,
  secret: string,
): Promise<{ valid: boolean; session?: { exp: number } }> {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return { valid: false };

  const payloadB64 = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  if (!payloadB64 || !sig) return { valid: false };

  const encoder = new TextEncoder();
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
  } catch {
    return { valid: false };
  }

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    hexToUint8Array(sig),
    encoder.encode(payloadB64),
  );

  if (!valid) return { valid: false };

  try {
    const session = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    return { valid: true, session };
  } catch {
    return { valid: false };
  }
}

function buildCSP(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';

  return [
    `default-src 'self'`,
    // unsafe-eval required in dev for React Fast Refresh; never present in production
    `script-src 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com 'self'${isDev ? ` 'unsafe-eval'` : ''}`,
    // unsafe-inline needed for Next.js critical CSS and inline style= attributes
    `style-src 'self' 'unsafe-inline'`,
    `font-src 'self'`,
    `img-src 'self'`,
    `connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://region1.google-analytics.com https://www.googletagmanager.com https://cm6xvdr4ja.execute-api.us-west-1.amazonaws.com`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

function applySecurityHeaders(
  response: NextResponse,
  csp: string,
  pathname: string,
): NextResponse {
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Set to 0 to disable the legacy XSS auditor — enabling it introduces its own vulnerabilities
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  );

  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCSP(nonce);

  const { pathname } = request.nextUrl;

  // ── Admin auth guard ──────────────────────────────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (pathname !== '/admin/login' && pathname !== '/api/admin/auth') {
      const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
      const sessionSecret = process.env.SESSION_SECRET;

      if (!sessionCookie?.value || !sessionSecret) {
        return applySecurityHeaders(redirectToLogin(request), csp, pathname);
      }

      const { valid, session } = await verifySessionToken(sessionCookie.value, sessionSecret);

      if (!valid || !session?.exp || session.exp < Date.now()) {
        const response = redirectToLogin(request);
        response.cookies.delete(SESSION_COOKIE_NAME);
        return applySecurityHeaders(response, csp, pathname);
      }
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  return applySecurityHeaders(response, csp, pathname);
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/admin/login', request.url);

  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
