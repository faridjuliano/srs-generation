import { NextResponse, NextRequest } from 'next/server';

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest, context: { params: unknown }) {
  try {
    // Next may provide params as a Promise. Await it before use.
    const params = (await context.params) as Record<string, string>;
    const userId = params.userId;
    const projectId = params.projectId;

    const response = await fetch(
      `${backendBaseUrl}/api/projects/${encodeURIComponent(userId)}/${encodeURIComponent(projectId)}`,
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
