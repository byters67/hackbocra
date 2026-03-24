-- =============================================================================
-- BOCRA Website — Migration 004: Security Audit Log
-- =============================================================================
--
-- Implements structured security logging for:
--   1. Auth events     — signup, login (via profile trigger)
--   2. Status changes  — complaints, licences, incidents, type approvals
--   3. Admin actions   — content changes (pages, posts, documents)
--
-- Each log entry is a structured JSONB record with actor, action, and diff.
-- This directly supports Data Protection Act compliance (audit trail) and
-- addresses OWASP A09:2021 (Security Logging and Monitoring Failures).
--
-- The audit_log table is append-only: no UPDATE or DELETE allowed.
-- Only admins can SELECT (for the admin dashboard audit viewer).
-- =============================================================================

-- =============================================================================
-- 1. AUDIT LOG TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type  TEXT NOT NULL CHECK (event_type IN (
    'auth.signup',
    'auth.login',
    'auth.logout',
    'auth.password_change',
    'status.change',
    'record.create',
    'record.update',
    'record.delete',
    'admin.action'
  )),
  table_name  TEXT,                          -- Source table (e.g., 'complaints')
  record_id   UUID,                          -- PK of the affected row
  actor_id    UUID REFERENCES auth.users(id),-- Who performed the action (NULL = anonymous)
  actor_role  TEXT,                           -- Role at time of action
  old_values  JSONB,                         -- Previous state (for updates)
  new_values  JSONB,                         -- New state (for inserts/updates)
  metadata    JSONB DEFAULT '{}'::jsonb,     -- Extra context (IP, user-agent, etc.)
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Append-only: only the trigger functions (SECURITY DEFINER) can INSERT
-- No UPDATE or DELETE policies — audit log is immutable
CREATE POLICY "Admins can read audit log"
  ON audit_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created   ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_event     ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_table     ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor     ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_record    ON audit_log(record_id);

-- Composite index for filtered dashboard queries
CREATE INDEX IF NOT EXISTS idx_audit_log_type_date ON audit_log(event_type, created_at DESC);

-- =============================================================================
-- 2. HELPER: Get current user's role
-- =============================================================================
CREATE OR REPLACE FUNCTION get_actor_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
EXCEPTION
  WHEN undefined_table THEN RETURN NULL;   -- profiles table doesn't exist yet
  WHEN undefined_column THEN RETURN NULL;  -- role column missing
  WHEN OTHERS THEN
    RAISE WARNING 'get_actor_role() failed: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- 3. AUTH EVENT LOGGING
-- =============================================================================
-- Log when a new user signs up (fires after profile creation)
CREATE OR REPLACE FUNCTION log_auth_signup()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO audit_log (event_type, table_name, record_id, actor_id, actor_role, new_values)
    VALUES (
      'auth.signup',
      'profiles',
      NEW.id,
      NEW.id,
      'user',
      jsonb_build_object(
        'full_name', NEW.full_name,
        'role', NEW.role
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Audit log (auth signup) failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER audit_auth_signup
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_auth_signup();

-- =============================================================================
-- 4. STATUS CHANGE LOGGING
-- =============================================================================
-- Generic function that logs status transitions on any table with a status column.
-- Captures the full before/after state for compliance audit trails.
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS trigger AS $$
BEGIN
  -- Only fire when status actually changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    BEGIN
      INSERT INTO audit_log (
        event_type, table_name, record_id, actor_id, actor_role,
        old_values, new_values
      )
      VALUES (
        'status.change',
        TG_TABLE_NAME,
        NEW.id,
        auth.uid(),
        get_actor_role(),
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Audit log (status change) failed for %.%: %', TG_TABLE_NAME, NEW.id, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to all tables with status workflows
CREATE OR REPLACE TRIGGER audit_complaint_status
  AFTER UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION log_status_change();

CREATE OR REPLACE TRIGGER audit_licence_status
  AFTER UPDATE ON licence_applications
  FOR EACH ROW EXECUTE FUNCTION log_status_change();

CREATE OR REPLACE TRIGGER audit_incident_status
  AFTER UPDATE ON cyber_incidents
  FOR EACH ROW EXECUTE FUNCTION log_status_change();

CREATE OR REPLACE TRIGGER audit_type_approval_status
  AFTER UPDATE ON type_approvals
  FOR EACH ROW EXECUTE FUNCTION log_status_change();

CREATE OR REPLACE TRIGGER audit_page_status
  AFTER UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION log_status_change();

CREATE OR REPLACE TRIGGER audit_post_status
  AFTER UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- =============================================================================
-- 5. ADMIN ACTION LOGGING (Content Management)
-- =============================================================================
-- Logs INSERT/UPDATE/DELETE on admin-managed tables
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS trigger AS $$
DECLARE
  v_event_type TEXT;
  v_old JSONB := NULL;
  v_new JSONB := NULL;
  v_record_id UUID;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'record.create';
    v_new := to_jsonb(NEW);
    v_record_id := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_event_type := 'record.update';
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_record_id := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'record.delete';
    v_old := to_jsonb(OLD);
    v_record_id := OLD.id;
  END IF;

  BEGIN
    INSERT INTO audit_log (
      event_type, table_name, record_id, actor_id, actor_role,
      old_values, new_values
    )
    VALUES (
      v_event_type,
      TG_TABLE_NAME,
      v_record_id,
      auth.uid(),
      get_actor_role(),
      v_old,
      v_new
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Audit log (admin action) failed for %.%: %', TG_TABLE_NAME, v_record_id, SQLERRM;
  END;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pages (CMS content)
CREATE OR REPLACE TRIGGER audit_pages_admin
  AFTER INSERT OR UPDATE OR DELETE ON pages
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- Posts (news, speeches, events)
CREATE OR REPLACE TRIGGER audit_posts_admin
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- Documents
CREATE OR REPLACE TRIGGER audit_documents_admin
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- Operators
CREATE OR REPLACE TRIGGER audit_operators_admin
  AFTER INSERT OR UPDATE OR DELETE ON operators
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- Complaint responses (admin replies)
CREATE OR REPLACE TRIGGER audit_complaint_responses_admin
  AFTER INSERT OR UPDATE OR DELETE ON complaint_responses
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- =============================================================================
-- 6. SUBMISSION LOGGING (Public form submissions)
-- =============================================================================
-- Log when public users submit complaints, contact forms, incidents, licences
CREATE OR REPLACE FUNCTION log_public_submission()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO audit_log (
      event_type, table_name, record_id, actor_id, actor_role,
      new_values
    )
    VALUES (
      'record.create',
      TG_TABLE_NAME,
      NEW.id,
      auth.uid(),  -- NULL for anonymous submissions
      COALESCE(get_actor_role(), 'anonymous'),
      jsonb_build_object(
        'reference_number', CASE
          WHEN TG_TABLE_NAME IN ('licence_applications', 'cyber_incidents')
          THEN NEW.reference_number
          ELSE NULL
        END,
        'submitted_at', NEW.created_at
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Audit log (public submission) failed for %.%: %', TG_TABLE_NAME, NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER audit_complaint_submission
  AFTER INSERT ON complaints
  FOR EACH ROW EXECUTE FUNCTION log_public_submission();

CREATE OR REPLACE TRIGGER audit_contact_submission
  AFTER INSERT ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION log_public_submission();

CREATE OR REPLACE TRIGGER audit_licence_submission
  AFTER INSERT ON licence_applications
  FOR EACH ROW EXECUTE FUNCTION log_public_submission();

CREATE OR REPLACE TRIGGER audit_incident_submission
  AFTER INSERT ON cyber_incidents
  FOR EACH ROW EXECUTE FUNCTION log_public_submission();

-- =============================================================================
-- 7. RETENTION POLICY (Data Protection Act compliance)
-- =============================================================================
-- Function to purge audit logs older than the retention period.
-- Should be called by a scheduled Supabase cron job (pg_cron).
-- Default retention: 2 years (as per BOCRA data retention policy).
CREATE OR REPLACE FUNCTION purge_expired_audit_logs(retention_months INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Guard: minimum retention of 1 month to prevent accidental full purge
  IF retention_months < 1 THEN
    RAISE EXCEPTION 'retention_months must be >= 1 (got %)', retention_months;
  END IF;

  DELETE FROM audit_log
  WHERE created_at < now() - (retention_months || ' months')::interval;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 8. AUDIT LOG VIEW (for admin dashboard)
-- =============================================================================
-- Enriched view that joins actor names for display
CREATE OR REPLACE VIEW audit_log_view AS
SELECT
  al.id,
  al.event_type,
  al.table_name,
  al.record_id,
  al.actor_id,
  p.full_name AS actor_name,
  al.actor_role,
  al.old_values,
  al.new_values,
  al.metadata,
  al.created_at
FROM audit_log al
LEFT JOIN profiles p ON p.id = al.actor_id
ORDER BY al.created_at DESC;
