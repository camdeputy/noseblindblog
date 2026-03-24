import { NextRequest, NextResponse } from 'next/server';
import { enforceRateLimit } from '@/lib/rateLimit';

const AWS_API_URL = process.env.AWS_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitResponse = await enforceRateLimit(request, 'public_read');
  if (rateLimitResponse) return rateLimitResponse;

  if (!AWS_API_URL) {
    return NextResponse.json({ ok: false, error: 'Server configuration error' }, { status: 500 });
  }

  const { id } = await params;

  try {
    const response = await fetch(`${AWS_API_URL}/posts/id/${id}`, {
      next: { revalidate: 300, tags: [`post-id-${id}`] },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[api/posts/id] GET error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch post' }, { status: 500 });
  }
}
