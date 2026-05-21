import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: Request, context: { params: unknown }) {
  try {
    // Next's App Router may provide params as a Promise; await it.
    const params = (await context.params) as Record<string, string>;
    const userId = params.userId;
    const projectId = params.projectId;

    const body = await request.json();

    const response = await fetch(
      `${backendBaseUrl}/api/srs/reprompt-fr-nfr-v2/${encodeURIComponent(userId)}/${encodeURIComponent(projectId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const responseBody = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Backend reprompt failed (${response.status}): ${responseBody || response.statusText}`
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
    const message = error instanceof Error ? error.message : 'Failed to process reprompt request';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

