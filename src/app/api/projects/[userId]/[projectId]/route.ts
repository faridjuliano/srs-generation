import { NextResponse } from 'next/server';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  _request: Request,
  { params }: { params: { userId: string; projectId: string } }
) {
  try {
    // In newer Next.js versions `params` can be a Promise. Await it before use.
    const resolvedParams = await (params as any);
    const response = await fetch(
      `${backendBaseUrl}/api/projects/${encodeURIComponent(resolvedParams.userId)}/${encodeURIComponent(resolvedParams.projectId)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const responseBody = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Backend project fetch failed (${response.status}): ${responseBody || response.statusText}`
        },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(responseBody);
      return NextResponse.json(data, { status: 200 });
    } catch {
      return NextResponse.json({ data: responseBody }, { status: 200 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load project details';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';

