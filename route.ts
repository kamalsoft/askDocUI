import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(req, params.path);
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handleProxy(req, params.path);
}

async function handleProxy(req: NextRequest, pathSegments: string[]) {
  const targetBase = 'https://switching-paintball-vista-quizzes.trycloudflare.com';
  const targetPath = pathSegments.join('/');
  const targetUrl = `${targetBase}/${targetPath}${req.nextUrl.search}`;

  const body = req.method !== 'GET' ? await req.text() : undefined;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // INJECT CUSTOM HEADERS HERE:
        'X-Internal-Secret': process.env.INTERNAL_SECRET || 'askDocs-local-v1',
        'X-Machine-ID': req.headers.get('x-machine-id') || 'unknown',
      },
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 502 }
    );
  }
}