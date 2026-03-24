import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

type PolicyName =
  | 'auth'
  | 'admin_read'
  | 'admin_write'
  | 'presign'
  | 'public_search'
  | 'public_read';

type RateLimitPolicy = {
  name: PolicyName;
  limit: number;
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`;
  prefix: string;
};

type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending?: Promise<unknown>;
  reason?: string;
};

const redis = Redis.fromEnv();
const RATE_LIMIT_ANALYTICS_ENABLED = process.env.UPSTASH_RATE_LIMIT_ANALYTICS === 'true';

const POLICIES: Record<PolicyName, RateLimitPolicy> = {
  auth: { name: 'auth', limit: 5, window: '15 m', prefix: 'admin_auth' },
  admin_read: { name: 'admin_read', limit: 120, window: '1 m', prefix: 'admin_read' },
  admin_write: { name: 'admin_write', limit: 30, window: '10 m', prefix: 'admin_write' },
  presign: { name: 'presign', limit: 10, window: '10 m', prefix: 'admin_presign' },
  public_search: { name: 'public_search', limit: 30, window: '1 m', prefix: 'public_search' },
  public_read: { name: 'public_read', limit: 120, window: '1 m', prefix: 'public_read' },
};

const ratelimiters = Object.fromEntries(
  Object.values(POLICIES).map((policy) => [
    policy.name,
    new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
      prefix: policy.prefix,
      analytics: RATE_LIMIT_ANALYTICS_ENABLED,
    }),
  ]),
) as Record<PolicyName, Ratelimit>;

function getHeader(headers: Headers, key: string): string | null {
  const value = headers.get(key);
  return value?.trim() ? value.trim() : null;
}

export function getClientIp(request: Request): string {
  const forwardedFor = getHeader(request.headers, 'x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0]?.trim();
    if (ip) return ip;
  }

  const directIp =
    getHeader(request.headers, 'x-real-ip') ??
    getHeader(request.headers, 'cf-connecting-ip') ??
    getHeader(request.headers, 'x-vercel-forwarded-for');

  return directIp ?? 'unknown';
}

function buildRateLimitHeaders(result: Pick<LimitResult, 'limit' | 'remaining' | 'reset'>) {
  const retryAfter = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000));

  return {
    'Retry-After': String(retryAfter),
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
    'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
  };
}

export function buildRateLimitExceededResponse(result: Pick<LimitResult, 'limit' | 'remaining' | 'reset'>) {
  return NextResponse.json(
    {
      ok: false,
      error: 'Too many requests. Please try again later.',
    },
    {
      status: 429,
      headers: buildRateLimitHeaders(result),
    },
  );
}

export async function enforceRateLimit(
  request: Request,
  policyName: PolicyName,
  suffix = '',
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const identifier = suffix ? `${ip}:${suffix}` : ip;
  let result: LimitResult;

  try {
    result = (await ratelimiters[policyName].limit(identifier)) as LimitResult;
  } catch (error) {
    console.error(`[rate-limit] failed for policy=${policyName}`, error);
    return null;
  }

  void result.pending;

  if (result.success) {
    return null;
  }

  return buildRateLimitExceededResponse(result);
}
