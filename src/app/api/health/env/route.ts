import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, externalProviders: false });
}

export const runtime = 'nodejs';
