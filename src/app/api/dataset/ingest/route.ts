import { NextResponse } from 'next/server';
import { ingestText } from '@/lib/rag/store';

export async function POST(req: Request) {
  try {
    const { text, source } = (await req.json()) as { text?: string; source?: string };
    if (!text || !text.trim()) {
      return NextResponse.json({ ok: false, error: 'Missing text' }, { status: 400 });
    }
    const n = await ingestText(text, source);
    return NextResponse.json({ ok: true, chunks: n });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

