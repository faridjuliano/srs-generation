import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(_req: NextRequest) {
  try {
    const res = NextResponse.json({ success: true });
    
    // Clear the session cookie from backend
    res.cookies.set('__session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    // Clear the token cookie set by client
    res.cookies.set('token', '', {
      maxAge: 0,
      path: '/'
    });
    
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

