import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'admin_session';

function buildCSP(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';

  return [
    `default-src 'self'`,
    // nonce covers Next.js hydration scripts + our Script tags;
    // strict-dynamic trusts anything loaded by those scripts (e.g. GA sub-scripts);
    // unsafe-eval is required in dev only for React Fast Refresh (never in production)
    `script-src 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com 'self'${isDev ? ` 'unsafe-eval'` : ''}`,
    // unsafe-inline needed for Next.js critical CSS and inline style= attributes
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    // https: covers all remote fragrance images; blob: for Next.js image optimization
    `img-src 'self' https: data: blob:`,
    // GA4 collection endpoints
    `connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://region1.google-analytics.com https://www.googletagmanager.com`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCSP(nonce);

  const { pathname } = request.nextUrl;

  // ── Admin auth guard ──────────────────────────────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (pathname !== '/admin/login' && pathname !== '/api/admin/auth') {
      const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

      if (!sessionCookie?.value) {
        const response = redirectToLogin(request);
        response.headers.set('Content-Security-Policy', csp);
        return response;
      }

      try {
        const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString());
        if (!session.exp || session.exp < Date.now()) {
          const response = redirectToLogin(request);
          response.cookies.delete(SESSION_COOKIE_NAME);
          response.headers.set('Content-Security-Policy', csp);
          return response;
        }
      } catch {
        const response = redirectToLogin(request);
        response.cookies.delete(SESSION_COOKIE_NAME);
        response.headers.set('Content-Security-Policy', csp);
        return response;
      }
    }
  }

  // ── Forward nonce to server components via request header ─────────────────
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', csp);
  return response;
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
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
