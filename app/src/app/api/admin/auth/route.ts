import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

function createSignedToken(payload: object, secret: string): string {
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', secret).update(payloadB64).digest('hex');
  return `${payloadB64}.${sig}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  const aLen = Buffer.byteLength(a);
  const bLen = Buffer.byteLength(b);
  const len = Math.max(aLen, bLen);
  const aBuf = Buffer.alloc(len);
  const bBuf = Buffer.alloc(len);
  aBuf.write(a);
  bBuf.write(b);
  return aLen === bLen && crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  const { username, password } = body as Record<string, unknown>;

  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  }

  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASS;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!validUser || !validPass || !sessionSecret) {
    return NextResponse.json({ ok: false, error: 'Server configuration error' }, { status: 500 });
  }

  const userMatch = timingSafeEqual(username, validUser);
  const passMatch = timingSafeEqual(password, validPass);

  if (userMatch && passMatch) {
    const sessionToken = createSignedToken(
      { exp: Date.now() + SESSION_MAX_AGE * 1000 },
      sessionSecret,
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
