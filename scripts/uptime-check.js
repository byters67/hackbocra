/**
 * Simple uptime monitor — hits health endpoint every 60 seconds.
 * Run: node scripts/uptime-check.js
 *
 * Production: replace with Azure Monitor / UptimeRobot.
 */

const HEALTH_URL =
  process.env.HEALTH_URL ||
  'https://cyalwtuladeexxfsbrcs.supabase.co/functions/v1/health';

async function check() {
  const start = Date.now();
  try {
    const res = await fetch(HEALTH_URL);
    const data = await res.json();
    const latency = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${data.status.toUpperCase()} | ` +
        `DB: ${data.checks?.database?.latency_ms}ms | ` +
        `Total: ${latency}ms`,
    );
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] DOWN | Error: ${err.message}`,
    );
  }
}

check();
setInterval(check, 60000);
console.log('Uptime monitor started. Checking every 60 seconds...');
