import { NextRequest, NextResponse } from 'next/server';
import { signedFetch } from '@/lib/aws/signedFetch';

const AWS_API_URL = process.env.AWS_API_URL ?? '';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  if (!AWS_API_URL) {
    return NextResponse.json({ ok: false, error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await signedFetch(`${AWS_API_URL}/admin/posts/${slug}`, { cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[admin/posts/slug] GET error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  if (!AWS_API_URL) {
    return NextResponse.json({ ok: false, error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await signedFetch(`${AWS_API_URL}/admin/posts/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[admin/posts/slug] PUT error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  if (!AWS_API_URL) {
    return NextResponse.json({ ok: false, error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await signedFetch(`${AWS_API_URL}/admin/posts/${slug}`, { method: 'DELETE' });

    if (response.status === 204 || response.ok) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(
      { ok: false, error: data.error || 'Failed to delete post' },
      { status: response.status },
    );
  } catch (error) {
    console.error('[admin/posts/slug] DELETE error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to delete post' }, { status: 500 });
  }
}
