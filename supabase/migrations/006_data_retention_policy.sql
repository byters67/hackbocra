-- =============================================================================
-- BOCRA Website — Migration 006: Data Retention Policy
-- =============================================================================
--
-- Implements the retention periods defined in the Privacy Notice (Section 6),
-- as required by the Data Protection Act, 2018 (Cap. 53:04).
--
-- Retention periods:
--   Contact enquiries          → 1 year
--   Consumer complaints        → 3 years from resolution
--   Licence applications       → Duration of licence + 2 years (manual)
--   Cybersecurity incidents    → 5 years (Cybersecurity Act, 2025)
--   Audit logs                 → 2 years
--
-- This function should be called via pg_cron (monthly) or a Supabase
-- scheduled Edge Function.
-- =============================================================================

-- Master retention function that handles all table-specific policies
CREATE OR REPLACE FUNCTION enforce_data_retention()
RETURNS TABLE(table_name TEXT, records_deleted INTEGER) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- 1. Contact enquiries: delete after 1 year
  DELETE FROM contact_submissions
  WHERE created_at < now() - interval '1 year';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  table_name := 'contact_submissions';
  records_deleted := v_count;
  RETURN NEXT;

  -- 2. Complaints: anonymise after 3 years from resolution
  --    We anonymise rather than delete to preserve regulatory statistics
  UPDATE complaints
  SET
    name = 'REDACTED',
    email = 'redacted@bocra.org.bw',
    phone = 'REDACTED',
    company = NULL
  WHERE status IN ('resolved', 'closed')
    AND updated_at < now() - interval '3 years'
    AND name != 'REDACTED';  -- Don't re-process
  GET DIAGNOSTICS v_count = ROW_COUNT;
  table_name := 'complaints';
  records_deleted := v_count;
  RETURN NEXT;

  -- 3. Cybersecurity incidents: anonymise after 5 years
  UPDATE cyber_incidents
  SET
    reporter_name = 'REDACTED',
    reporter_email = 'redacted@bocra.org.bw',
    reporter_phone = 'REDACTED'
  WHERE created_at < now() - interval '5 years'
    AND reporter_name IS NOT NULL
    AND reporter_name != 'REDACTED';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  table_name := 'cyber_incidents';
  records_deleted := v_count;
  RETURN NEXT;

  -- 4. Audit logs: purge after 2 years
  DELETE FROM audit_log
  WHERE created_at < now() - interval '2 years';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  table_name := 'audit_log';
  records_deleted := v_count;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Schedule: To run monthly via pg_cron (if enabled on Supabase Pro):
--
--   SELECT cron.schedule(
--     'enforce-data-retention',
--     '0 2 1 * *',  -- 2 AM on the 1st of each month
--     $$SELECT * FROM enforce_data_retention()$$
--   );
--
-- For Supabase free tier, call via a monthly Edge Function or manual SQL.
-- =============================================================================
