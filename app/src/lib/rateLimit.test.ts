import { describe, expect, it } from 'vitest';
import { buildRateLimitExceededResponse, getClientIp } from './rateLimit';

describe('getClientIp', () => {
    it('uses the first IP from x-forwarded-for', () => {
        const request = new Request('https://example.com', {
            headers: {
                'x-forwarded-for': '203.0.113.10, 70.41.3.18, 150.172.238.178',
            },
        });

        expect(getClientIp(request)).toBe('203.0.113.10');
    });

    it('falls back to x-real-ip when x-forwarded-for is missing', () => {
        const request = new Request('https://example.com', {
            headers: {
                'x-real-ip': '198.51.100.7',
            },
        });

        expect(getClientIp(request)).toBe('198.51.100.7');
    });

    it('returns unknown when no IP headers are present', () => {
        const request = new Request('https://example.com');

        expect(getClientIp(request)).toBe('unknown');
    });
});

describe('buildRateLimitExceededResponse', () => {
    it('returns a 429 response with the expected JSON body', async () => {
        const reset = Date.now() + 30_000;

        const response = buildRateLimitExceededResponse({
            limit: 120,
            remaining: 0,
            reset,
        });

        expect(response.status).toBe(429);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            error: 'Too many requests. Please try again later.',
        });
    });

    it('includes rate limit headers', () => {
        const reset = Date.now() + 30_000;

        const response = buildRateLimitExceededResponse({
            limit: 120,
            remaining: 0,
            reset,
        });

        expect(response.headers.get('X-RateLimit-Limit')).toBe('120');
        expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
        expect(response.headers.get('X-RateLimit-Reset')).not.toBeNull();
        expect(response.headers.get('Retry-After')).not.toBeNull();
    });
});