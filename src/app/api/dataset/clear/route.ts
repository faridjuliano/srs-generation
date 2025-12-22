import { NextResponse } from 'next/server';
import { clearStore } from '@/lib/rag/store';

export async function POST() {
  try {
    await clearStore();
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

