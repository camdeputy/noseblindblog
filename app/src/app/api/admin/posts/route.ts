import { NextRequest, NextResponse } from 'next/server';
import { signedFetch } from '@/lib/aws/signedFetch';
import { enforceRateLimit } from '@/lib/rateLimit';

const AWS_API_URL = process.env.AWS_API_URL ?? '';

export async function GET(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, 'admin_read');
  if (rateLimitResponse) return rateLimitResponse;

  if (!AWS_API_URL) {
    return NextResponse.json({ ok: false, error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await signedFetch(`${AWS_API_URL}/admin/posts`, { cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[admin/posts] GET error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, 'admin_write');
  if (rateLimitResponse) return rateLimitResponse;

  if (!AWS_API_URL) {
    return NextResponse.json({ ok: false, error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await signedFetch(`${AWS_API_URL}/admin/posts`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[admin/posts] POST error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create post' }, { status: 500 });
  }
}
