import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${backendBaseUrl}/api/export/srs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return NextResponse.json(
        {
          error: `Backend export failed (${response.status}): ${errorText || response.statusText}`
        },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const headers = new Headers();
    const contentType = response.headers.get('content-type');
    const contentDisposition = response.headers.get('content-disposition');

    if (contentType) headers.set('content-type', contentType);
    if (contentDisposition) headers.set('content-disposition', contentDisposition);

    return new Response(arrayBuffer, {
      status: response.status,
      headers
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export SRS';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

