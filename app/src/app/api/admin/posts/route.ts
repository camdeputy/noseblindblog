import { NextRequest, NextResponse } from 'next/server';

const AWS_API_URL = process.env.AWS_API_URL || '';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

export async function GET() {
  if (!AWS_API_URL || !ADMIN_TOKEN) {
    return NextResponse.json(
      { ok: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${AWS_API_URL}/admin/posts`, {
      headers: {
        'x-api-key': ADMIN_TOKEN,
      },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to fetch admin posts:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!AWS_API_URL || !ADMIN_TOKEN) {
    return NextResponse.json(
      { ok: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${AWS_API_URL}/admin/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ADMIN_TOKEN,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
