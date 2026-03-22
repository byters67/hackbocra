-- =============================================================================
-- BOCRA Website — Migration 015: Persistent Rate Limiting
-- =============================================================================
--
-- PROBLEM: The Edge Function's in-memory rate limiter (Map<string, number[]>)
-- resets every time the function cold-starts, allowing burst abuse after restarts.
--
-- SOLUTION: This table provides a persistent, database-backed rate limiting layer.
-- Edge Functions (using service_role) record each submission's IP hash + form type.
-- Before processing a new submission, they check how many rows exist within
-- the time window. This survives cold starts and scales across function instances.
--
-- SECURITY:
--   - RLS enabled with NO policies = zero public access
--   - Edge Functions use service_role key which bypasses RLS entirely
--   - IP addresses are hashed (not stored in plaintext) for privacy
--   - Auto-cleanup function removes entries older than 1 hour
--
-- PRIVACY (Data Protection Act compliance):
--   - Only IP hashes are stored (one-way, not reversible)
--   - Entries auto-expire after 1 hour via cleanup_rate_limits()
--   - No personal data is retained in this table
-- =============================================================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash TEXT NOT NULL,            -- SHA-256 hash of client IP (privacy-safe)
  form_type TEXT NOT NULL,          -- 'complaint' | 'contact' — identifies which form was submitted
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()  -- timestamp for sliding window checks
);

-- RLS enabled but no policies = no public access
-- Edge Functions use service_role which bypasses RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Composite index for the primary query pattern:
-- SELECT count(*) FROM rate_limits WHERE ip_hash = ? AND form_type = ? AND submitted_at > ?
-- DESC on submitted_at enables efficient range scans for the sliding window check
CREATE INDEX idx_rate_limits_lookup ON rate_limits (ip_hash, form_type, submitted_at DESC);

-- Auto-cleanup function: delete entries older than 1 hour.
-- Should be called periodically via pg_cron or a scheduled Edge Function.
-- Example with pg_cron: SELECT cron.schedule('cleanup-rate-limits', '*/15 * * * *', 'SELECT cleanup_rate_limits()');
-- SECURITY DEFINER ensures this runs with elevated privileges regardless of caller.
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE submitted_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
