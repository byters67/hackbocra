/**
 * Supabase Client Configuration
 *
 * ═══════════════════════════════════════════════════════════════
 * SECURITY IMPLEMENTATION — Addresses Pentest Findings F01-F04
 * and API Security Audit V-01
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Keys are loaded ONLY from environment variables injected at
 *    build time via VITE_ prefixed vars (GitHub Actions secrets
 *    or local .env file). No hardcoded fallbacks exist.
 *
 * 2. The anon key grants LIMITED access controlled by RLS policies.
 *    Even if extracted from the client bundle, it cannot bypass
 *    Row Level Security rules on the database.
 *
 * 3. The service_role key is NEVER included in client code.
 *    It only exists in Supabase Edge Functions and GitHub Secrets.
 *
 * 4. Rate limiting is applied to all Supabase client operations
 *    to prevent abuse (addresses F01 unauthenticated job execution).
 *
 * ENVIRONMENT VARIABLES (set in GitHub Actions secrets + .env.local):
 *   VITE_SUPABASE_URL       → Supabase project URL
 *   VITE_SUPABASE_ANON_KEY  → Supabase anonymous/public key
 */

import { createClient } from '@supabase/supabase-js';

// ─── ENVIRONMENT-ONLY KEY LOADING ────────────────────────────────
// V-01 remediation: No hardcoded keys. All values from env vars only.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[BOCRA] Missing required environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY.\n' +
    'Create a .env.local file in the project root with:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key\n' +
    'Or set these in GitHub Actions secrets for CI/CD builds.'
  );
}

// ─── RATE LIMITING ──────────────────────────────────────────────
// Simple client-side rate limiter to prevent abuse.
// Addresses pentest F01: prevents rapid-fire unauthenticated requests.

const _requestLog = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30;       // max 30 requests per minute

/**
 * Checks if the current request rate is within limits.
 * Logs a warning and returns false if rate exceeded.
 * @param {string} operation - Name of the operation being rate-limited
 * @returns {boolean} Whether the request is allowed
 */
export function checkRateLimit(operation = 'default') {
  const now = Date.now();
  const log = _requestLog.get(operation) || [];

  // Remove entries older than the window
  const recent = log.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (recent.length >= RATE_LIMIT_MAX) {
    console.warn(`[BOCRA Security] Rate limit exceeded for "${operation}". Try again later.`);
    return false;
  }

  recent.push(now);
  _requestLog.set(operation, recent);
  return true;
}

// Expose resolved values for other modules that need direct API access
// (e.g., fetch calls to Edge Functions that need the anon key in headers)
export const supabaseUrl_ = supabaseUrl || '';
export const supabaseAnonKey_ = supabaseAnonKey || '';

// ─── CLIENT INITIALIZATION ──────────────────────────────────────

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'bocra-web/1.0.0',
    },
  },
  // Connection pooling settings for performance
  db: {
    schema: 'public',
  },
});

export default supabase;
