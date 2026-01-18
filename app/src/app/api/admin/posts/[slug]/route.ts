import { NextRequest, NextResponse } from 'next/server';

const AWS_API_URL = process.env.AWS_API_URL || '';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  if (!AWS_API_URL || !ADMIN_TOKEN) {
    return NextResponse.json(
      { ok: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${AWS_API_URL}/admin/posts/${slug}`, {
      headers: {
        'x-api-key': ADMIN_TOKEN,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  if (!AWS_API_URL || !ADMIN_TOKEN) {
    return NextResponse.json(
      { ok: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${AWS_API_URL}/admin/posts/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ADMIN_TOKEN,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  if (!AWS_API_URL || !ADMIN_TOKEN) {
    return NextResponse.json(
      { ok: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${AWS_API_URL}/admin/posts/${slug}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': ADMIN_TOKEN,
      },
    });

    if (response.status === 204 || response.ok) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(
      { ok: false, error: data.error || 'Failed to delete post' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
