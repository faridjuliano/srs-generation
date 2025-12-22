import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchPure } from '@/lib/pureSearch';

const schema = z.object({
  query: z.string(),
  topK: z.number().int().positive().max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }
    const { query, topK } = parsed.data;
    const results = await searchPure(query, topK ?? 8);
    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

