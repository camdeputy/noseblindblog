import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockCookiesSet = vi.fn();
const mockCookiesDelete = vi.fn();

vi.mock('next/headers', () => ({
    cookies: vi.fn(async () => ({
        set: mockCookiesSet,
        delete: mockCookiesDelete,
    })),
}));

vi.mock('@/lib/rateLimit', () => ({
    enforceRateLimit: vi.fn(async () => null),
}));

describe('POST /api/admin/auth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.ADMIN_USER;
        delete process.env.ADMIN_PASS;
        delete process.env.SESSION_SECRET;
    });

    it('returns 400 when the request body is invalid JSON', async () => {
        const { POST } = await import('./route');

        const request = new NextRequest('https://example.com/api/admin/auth', {
            method: 'POST',
            body: 'not-json',
            headers: {
                'content-type': 'application/json',
            },
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            error: 'Invalid request',
        });
    });

    it('returns 401 when username or password is missing', async () => {
        const { POST } = await import('./route');

        const request = new NextRequest('https://example.com/api/admin/auth', {
            method: 'POST',
            body: JSON.stringify({ username: '', password: 'secret' }),
            headers: {
                'content-type': 'application/json',
            },
        });

        const response = await POST(request);

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            error: 'Invalid credentials',
        });
    });

    it('returns 500 when required env vars are missing', async () => {
        const { POST } = await import('./route');

        const request = new NextRequest('https://example.com/api/admin/auth', {
            method: 'POST',
            body: JSON.stringify({ username: 'admin', password: 'secret' }),
            headers: {
                'content-type': 'application/json',
            },
        });

        const response = await POST(request);

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            error: 'Server configuration error',
        });
    });

    it('returns 200 and sets the session cookie for valid credentials', async () => {
        process.env.ADMIN_USER = 'admin';
        process.env.ADMIN_PASS = 'super-secret';
        process.env.SESSION_SECRET = 'test-session-secret';

        const { POST } = await import('./route');

        const request = new NextRequest('https://example.com/api/admin/auth', {
            method: 'POST',
            body: JSON.stringify({ username: 'admin', password: 'super-secret' }),
            headers: {
                'content-type': 'application/json',
            },
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });

        expect(mockCookiesSet).toHaveBeenCalledTimes(1);

        const [cookieName, cookieValue, cookieOptions] = mockCookiesSet.mock.calls[0];

        expect(cookieName).toBe('admin_session');
        expect(typeof cookieValue).toBe('string');
        expect(cookieValue.length).toBeGreaterThan(0);

        expect(cookieOptions).toMatchObject({
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
            path: '/',
        });
    });

    it('returns 401 and does not set a cookie for incorrect credentials', async () => {
        process.env.ADMIN_USER = 'admin';
        process.env.ADMIN_PASS = 'super-secret';
        process.env.SESSION_SECRET = 'test-session-secret';

        const { POST } = await import('./route');

        const request = new NextRequest('https://example.com/api/admin/auth', {
            method: 'POST',
            body: JSON.stringify({ username: 'admin', password: 'wrong-password' }),
            headers: {
                'content-type': 'application/json',
            },
        });

        const response = await POST(request);

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            error: 'Invalid credentials',
        });

        expect(mockCookiesSet).not.toHaveBeenCalled();
    });
});