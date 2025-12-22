import { NextResponse } from 'next/server';

// This route has been deprecated. External providers removed.
export async function POST() {
  return NextResponse.json({ ok: false, error: 'Gemini route has been removed. No external providers in use.' }, { status: 410 });
}

export const runtime = 'nodejs';

