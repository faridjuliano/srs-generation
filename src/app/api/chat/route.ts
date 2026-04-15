import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support legacy frontend payload and normalize to reprompt contract.
    const normalizedBody = (() => {
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        const record = body as Record<string, unknown>;
        if (record.content && record.instruction) return record;

        const srsContext = record.srsContext;
        const messages = Array.isArray(record.messages)
          ? (record.messages as Array<{ role?: string; content?: string }>)
          : [];
        const lastUserMessage = [...messages].reverse().find((m) => m?.role === 'user')?.content;

        if (srsContext && typeof lastUserMessage === 'string' && lastUserMessage.trim().length > 0) {
          return {
            content: srsContext,
            instruction: lastUserMessage,
            history: messages.map((m) => ({ role: m.role ?? 'user', content: m.content ?? '' })),
            formData: record.formData ?? {}
          };
        }
      }
      return body;
    })();

    const response = await fetch(`${backendBaseUrl}/api/srs/reprompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedBody)
    });

    const responseBody = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Backend chat failed (${response.status}): ${responseBody || response.statusText}`
        },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(responseBody);
      return NextResponse.json(data, { status: 200 });
    } catch {
      return NextResponse.json({ ok: true, message: responseBody }, { status: 200 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process chat request';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

