/**
 * BOCRA Load Test — measures response latency under concurrent load.
 * Run: node scripts/load-test.js
 *
 * Tests health endpoint and form submission at 10, 50, 100 concurrency.
 * Results should be saved to docs/PERFORMANCE_BUDGET.md.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cyalwtuladeexxfsbrcs.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const endpoints = [
  { name: 'health', url: `${SUPABASE_URL}/functions/v1/health`, method: 'GET' },
  {
    name: 'submit-form (contact)',
    url: `${SUPABASE_URL}/functions/v1/submit-form`,
    method: 'POST',
    body: JSON.stringify({
      type: 'contact',
      name: 'Load Test',
      email: 'test@loadtest.com',
      message: 'Load test message',
      recaptchaToken: 'test',
    }),
  },
];

async function runTest(endpoint, concurrency) {
  const times = [];
  let errors = 0;

  const requests = Array.from({ length: concurrency }, async () => {
    const start = Date.now();
    try {
      const res = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: endpoint.body,
      });
      times.push(Date.now() - start);
      if (!res.ok) errors++;
    } catch {
      times.push(Date.now() - start);
      errors++;
    }
  });

  await Promise.all(requests);
  times.sort((a, b) => a - b);

  const percentile = (p) => times[Math.floor(times.length * p)] || 0;
  return { concurrency, total: times.length, errors, p50: percentile(0.5), p95: percentile(0.95), p99: percentile(0.99) };
}

async function main() {
  console.log('BOCRA Load Test Results');
  console.log('='.repeat(65));

  for (const ep of endpoints) {
    console.log(`\n${ep.name}`);
    console.log('Concurrency | Errors | p50 (ms) | p95 (ms) | p99 (ms)');
    console.log('-'.repeat(55));

    for (const c of [10, 50, 100]) {
      const r = await runTest(ep, c);
      console.log(
        `${String(r.concurrency).padStart(11)} | ${String(r.errors).padStart(6)} | ${String(r.p50).padStart(8)} | ${String(r.p95).padStart(8)} | ${String(r.p99).padStart(8)}`,
      );
    }
  }
}

main();
