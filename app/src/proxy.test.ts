import crypto from 'crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

const originalSessionSecret = process.env.SESSION_SECRET;

function createSessionToken(payload: object, secret: string): string {
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const sig = crypto.createHmac('sha256', secret).update(payloadB64).digest('hex');
    return `${payloadB64}.${sig}`;
}

afterEach(() => {
    if (originalSessionSecret === undefined) {
        delete process.env.SESSION_SECRET;
    } else {
        process.env.SESSION_SECRET = originalSessionSecret;
    }
});

describe('proxy', () => {
    it('redirects unauthenticated admin page requests to /admin/login', async () => {
        const request = new NextRequest('https://example.com/admin');

        const response = await proxy(request);

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('/admin/login');
    });

    it('returns 401 for unauthenticated admin API requests', async () => {
        const request = new NextRequest('https://example.com/api/admin/posts');

        const response = await proxy(request);

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            error: 'Unauthorized',
        });
    });

    it('adds security headers to protected responses', async () => {
        const request = new NextRequest('https://example.com/admin');

        const response = await proxy(request);

        expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('allows authenticated admin requests through without redirecting', async () => {
        process.env.SESSION_SECRET = 'test-session-secret';
        const sessionToken = createSessionToken(
            { exp: Date.now() + 60_000 },
            process.env.SESSION_SECRET
        );

        const request = new NextRequest('https://example.com/admin', {
            headers: {
                cookie: `admin_session=${sessionToken}`,
            },
        });

        const response = await proxy(request);

        expect(response.status).toBe(200);
        expect(response.headers.get('location')).toBeNull();
        expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
    });

    it('clears an expired session cookie before redirecting', async () => {
        process.env.SESSION_SECRET = 'test-session-secret';
        const expiredToken = createSessionToken(
            { exp: Date.now() - 60_000 },
            process.env.SESSION_SECRET
        );

        const request = new NextRequest('https://example.com/admin', {
            headers: {
                cookie: `admin_session=${expiredToken}`,
            },
        });

        const response = await proxy(request);

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('/admin/login');
        expect(response.cookies.get('admin_session')?.value).toBe('');
        expect(response.headers.get('set-cookie')).toContain('admin_session=;');
    });
});
