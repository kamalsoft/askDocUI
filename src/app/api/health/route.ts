import { NextResponse } from 'next/server';
import config from '../../../config.json';

export const dynamic = 'force-dynamic';

// This route handler provides a health check for the Next.js server
export async function GET() {
  const BASE_URL = config.apiBaseUrl.replace(/\/$/, '');
  console.log(`\x1b[34m[Health Check]\x1b[0m Checking backend at ${BASE_URL}...`);
  let backendStatus = 'unknown';
  let latency = '0';
  let backendPayload: any = null;

  try {
    const start = performance.now();
    console.log(`\x1b[34m[Health Check]\x1b[0m Pinging ${BASE_URL}/health...`);
    // Ping a known-good endpoint (/health) to verify the engine is alive
    const res = await fetch(`${BASE_URL}/health`, { 
      method: 'GET',
      headers: { 
        'X-Tunnel-Skip-Bypass': 'true',
        ...(process.env.INTERNAL_SECRET ? { 'X-Internal-Secret': process.env.INTERNAL_SECRET } : {})
      },
      signal: AbortSignal.timeout(5000) // 5s timeout for dev tunnels
    });
    latency = (performance.now() - start).toFixed(2);
   
    console.log(`\x1b[34m[Health Check]\x1b[0m Backend responded in ${latency}ms with status ${res.status}`);
    console.log(res);

    if (res.ok) {
      try {
        backendPayload = await res.json();
      } catch (e) { /* ignore non-json */ }
    }

    backendStatus = res.ok ? 'online' : `degraded (${res.status})`;
  } catch (e) {
    backendStatus = e instanceof Error && e.name === 'TimeoutError' ? 'timeout' : 'offline';
    console.error(`\x1b[31m[Health Error]\x1b[0m Failed to reach engine:`, e instanceof Error ? e.message : e);
  }

  const statusMap: Record<string, 'UP' | 'DEGRADED' | 'DOWN'> = {
    'UP': 'UP',
    'DEGRADED': 'DEGRADED',
    'DOWN': 'DOWN',
    'online': 'UP',
    'offline': 'DOWN',
    'timeout': 'DOWN'
  };

  const responseStatus = backendPayload?.status || statusMap[backendStatus] || 'DOWN';

  const data = {
    status: responseStatus,
    vector_store: backendPayload?.checks?.vectorStore || 'None',
    transformers_loaded: backendPayload?.checks?.models === 'loaded' || false,
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    engine: {
      status: backendStatus,
      latency: backendStatus === 'online' ? `${latency}ms` : undefined,
      target: config.apiBaseUrl
    }
  };

  console.log(`\x1b[32m[Health Check]\x1b[0m Node: ok, Engine: ${backendStatus} (${latency}ms)`);
  if (backendPayload) {
    console.log(`\x1b[32m[Backend Payload]\x1b[0m`, JSON.stringify(backendPayload, null, 2));
  }
  console.log(`\x1b[32m[Health Payload]\x1b[0m`, JSON.stringify(data, null, 2));

  return NextResponse.json(data, { status: 200 });
}