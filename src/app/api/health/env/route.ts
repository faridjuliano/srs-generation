import { NextResponse } from 'next/server';

export async function GET() {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0);
  const hasGemini = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY.length > 0);
  return NextResponse.json({ ok: true, hasOpenAI, hasGemini });
}

export const runtime = 'nodejs';

