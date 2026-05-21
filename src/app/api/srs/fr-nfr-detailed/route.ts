import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${backendBaseUrl}/api/srs/fr-nfr-detailed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const responseBody = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Backend FR/NFR detailed generation failed (${response.status}): ${responseBody || response.statusText}`
        },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(responseBody);
      return NextResponse.json(data, { status: 200 });
    } catch {
      return NextResponse.json({ success: true, message: responseBody }, { status: 200 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process FR/NFR detailed request';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

