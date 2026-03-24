import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

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
});