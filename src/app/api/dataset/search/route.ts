import { NextResponse } from 'next/server';
import { searchSimilar } from '@/lib/rag/store';

export async function POST(req: Request) {
  try {
    const { query, topK } = (await req.json()) as { query?: string; topK?: number };
    if (!query || !query.trim()) return NextResponse.json({ ok: false, error: 'Missing query' }, { status: 400 });
    const results = await searchSimilar(query, topK ?? 4);
    return NextResponse.json({ ok: true, results });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

