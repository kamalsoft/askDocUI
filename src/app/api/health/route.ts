import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// This route handler provides a health check for the Next.js server
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV
  }, { status: 200 });
}