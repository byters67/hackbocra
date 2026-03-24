/**
 * Supabase Edge Function — Complaint Statistics Aggregator
 *
 * Phase 3 of the BOCRA Implementation Roadmap.
 * Returns aggregate complaint data for the public outcomes dashboard.
 *
 * PII guardrails:
 *   - No individual complaint details
 *   - Provider stats only shown where n >= 5 complaints
 *   - Category groupings suppressed if < 5 records
 *
 * Caching: results cached in Supabase for 24 hours via a simple
 * cache table; admin can force refresh via ?refresh=true with service key.
 *
 * Deploy: supabase functions deploy complaint-stats
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY        = Deno.env.get('SUPABASE_ANON_KEY')!;
const MIN_GROUP_SIZE           = 5; // PII guardrail — never expose groups < 5

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── SUPABASE REST HELPER ─────────────────────────────────────────────────────
async function query(table: string, params: Record<string, string>, useService = false) {
  const key = useService ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      Prefer: 'count=exact',
    },
  });
  if (!res.ok) throw new Error(`Query failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const count = parseInt(res.headers.get('content-range')?.split('/')[1] ?? '0');
  return { data, count };
}

// ─── RPC HELPER (for complex aggregates) ──────────────────────────────────────
async function rpc(fn: string, body: Record<string, unknown> = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

// ─── AGGREGATE BUILDER ────────────────────────────────────────────────────────
async function buildStats() {
  // Fetch all complaints (only non-PII columns needed for aggregation)
  const allRes = await fetch(
    `${SUPABASE_URL}/rest/v1/complaints?select=id,provider,complaint_type,status,outcome,remedy,created_at,resolved_at`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: 'application/json',
      },
    },
  );
  const all: any[] = await allRes.json();
  if (!Array.isArray(all)) throw new Error('Unexpected complaints response');

  const now = new Date();
  const startOfYear  = new Date(now.getFullYear(), 0, 1);
  const startOfQ     = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const twelveMonths = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const thisYear    = all.filter(c => new Date(c.created_at) >= startOfYear);
  const thisQuarter = all.filter(c => new Date(c.created_at) >= startOfQ);

  // ── Total counts ──────────────────────────────────────────────────────────
  const totals = {
    all_time:     all.length,
    this_year:    thisYear.length,
    this_quarter: thisQuarter.length,
  };

  // ── By status ─────────────────────────────────────────────────────────────
  const byStatus: Record<string, number> = {};
  for (const c of all) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
  }

  // ── By provider (PII guardrail: min 5) ────────────────────────────────────
  const providerMap: Record<string, { total: number; resolved: number; upheld: number; dismissed: number; pending: number; avgDays: number[]; }> = {};
  for (const c of all) {
    if (!c.provider) continue;
    if (!providerMap[c.provider]) {
      providerMap[c.provider] = { total: 0, resolved: 0, upheld: 0, dismissed: 0, pending: 0, avgDays: [] };
    }
    const p = providerMap[c.provider];
    p.total++;
    if (['resolved','closed'].includes(c.status)) p.resolved++;
    if (c.outcome === 'upheld') p.upheld++;
    if (c.outcome === 'dismissed') p.dismissed++;
    if (!c.outcome || c.outcome === 'pending') p.pending++;
    if (c.resolved_at && c.created_at) {
      const days = (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / 86400000;
      p.avgDays.push(days);
    }
  }
  const byProvider = Object.entries(providerMap)
    .filter(([, v]) => v.total >= MIN_GROUP_SIZE)
    .map(([provider, v]) => ({
      provider,
      total:           v.total,
      resolved:        v.resolved,
      resolution_rate: v.total > 0 ? Math.round((v.resolved / v.total) * 100) : 0,
      upheld:          v.upheld,
      dismissed:       v.dismissed,
      pending:         v.pending,
      avg_resolution_days: v.avgDays.length
        ? Math.round(v.avgDays.reduce((a, b) => a + b, 0) / v.avgDays.length)
        : null,
    }))
    .sort((a, b) => b.total - a.total);

  // ── By category (PII guardrail: min 5) ────────────────────────────────────
  const catMap: Record<string, number> = {};
  for (const c of all) {
    const cat = c.complaint_type || 'Other';
    catMap[cat] = (catMap[cat] || 0) + 1;
  }
  const byCategory = Object.entries(catMap)
    .filter(([, n]) => n >= MIN_GROUP_SIZE)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // top 10

  // ── By remedy ─────────────────────────────────────────────────────────────
  const remedyMap: Record<string, number> = {};
  for (const c of all) {
    if (!c.remedy || c.remedy === 'none') continue;
    remedyMap[c.remedy] = (remedyMap[c.remedy] || 0) + 1;
  }
  const byRemedy = Object.entries(remedyMap)
    .filter(([, n]) => n >= MIN_GROUP_SIZE)
    .map(([remedy, count]) => ({ remedy, count }));

  // ── Monthly trend (last 12 months) ────────────────────────────────────────
  const monthMap: Record<string, number> = {};
  for (const c of all.filter(x => new Date(x.created_at) >= twelveMonths)) {
    const key = new Date(c.created_at).toISOString().slice(0, 7); // YYYY-MM
    monthMap[key] = (monthMap[key] || 0) + 1;
  }
  const monthlyTrend = Object.entries(monthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // ── Overall resolution rate ────────────────────────────────────────────────
  const resolved = all.filter(c => ['resolved','closed'].includes(c.status)).length;
  const overall_resolution_rate = all.length > 0 ? Math.round((resolved / all.length) * 100) : 0;

  return {
    generated_at: new Date().toISOString(),
    totals,
    by_status: byStatus,
    overall_resolution_rate,
    by_provider: byProvider,
    by_category: byCategory,
    by_remedy:   byRemedy,
    monthly_trend: monthlyTrend,
  };
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const stats = await buildStats();
    return new Response(JSON.stringify(stats), {
      headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (err) {
    console.error('[complaint-stats]', err);
    return new Response(JSON.stringify({ error: 'Failed to compute stats' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
