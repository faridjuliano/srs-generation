import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${backendBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: `Backend login failed (${response.status}): ${text || response.statusText}` },
        { status: response.status }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ ok: true, message: text }, { status: response.status });
    }

    // Extract JWT from backend response
    // The backend should return: { success: true, user: {...}, token: "jwt_token" }
    const jwt = data.token || data.jwt || data.access_token;

    const res = NextResponse.json(data, { status: response.status });

    // Set JWT as httpOnly cookie for security
    if (jwt) {
      res.cookies.set('__session', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
