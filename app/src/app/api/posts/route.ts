import { NextRequest, NextResponse } from 'next/server';
import { enforceRateLimit } from '@/lib/rateLimit';

const AWS_API_URL = process.env.AWS_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';

export async function GET(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, 'public_read');
  if (rateLimitResponse) return rateLimitResponse;

  if (!AWS_API_URL) {
    return NextResponse.json({ ok: false, error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await fetch(`${AWS_API_URL}/posts`, {
      next: { revalidate: 300 },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[api/posts] GET error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}
