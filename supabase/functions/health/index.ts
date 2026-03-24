/**
 * Supabase Edge Function — System Health Check
 *
 * Returns real-time health status of all system components:
 *   - Database connectivity and latency
 *   - Runtime status
 *   - Memory usage
 *
 * GET /functions/v1/health → { status: "healthy"|"degraded", checks: {...} }
 *
 * Deploy:
 *   supabase functions deploy health
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function corsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  const checks: Record<string, { status: string; latency_ms: number }> = {};
  let healthy = true;

  // Database connectivity
  const dbStart = Date.now();
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=count&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );
    checks.database = {
      status: res.ok ? 'ok' : 'degraded',
      latency_ms: Date.now() - dbStart,
    };
    if (!res.ok) healthy = false;
  } catch {
    checks.database = { status: 'down', latency_ms: Date.now() - dbStart };
    healthy = false;
  }

  // Runtime check
  checks.runtime = { status: 'ok', latency_ms: 0 };

  // Memory
  const mem = Deno.memoryUsage();
  checks.memory = {
    status: mem.heapUsed / mem.heapTotal > 0.9 ? 'warning' : 'ok',
    latency_ms: 0,
  };

  return new Response(
    JSON.stringify({
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks,
      uptime_seconds: Math.floor(performance.now() / 1000),
    }),
    {
      status: healthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...corsHeaders(req),
      },
    },
  );
});
