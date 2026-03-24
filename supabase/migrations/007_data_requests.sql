-- =============================================================================
-- BOCRA Website — Migration 007: Data Subject Requests
-- =============================================================================
--
-- Implements the right-to-access / rectification / erasure request pathway
-- required by the Data Protection Act, 2018 (Sections 23-27).
--
-- Users submit requests via the My BOCRA portal. Admins review, process,
-- and close them within the 30-day statutory deadline.
-- =============================================================================

CREATE TABLE IF NOT EXISTS data_requests (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id     UUID REFERENCES auth.users(id),
  requester_name   TEXT NOT NULL,
  requester_email  TEXT NOT NULL,
  request_type     TEXT NOT NULL CHECK (request_type IN (
    'access',        -- Right to access personal data held
    'correction',    -- Right to rectify inaccurate data
    'deletion',      -- Right to erasure
    'restriction',   -- Right to restrict processing
    'portability',   -- Right to data portability
    'withdraw_consent' -- Withdraw previously given consent
  )),
  description      TEXT NOT NULL,            -- What data / what correction
  data_categories  TEXT[] DEFAULT '{}',      -- Which data types: complaints, licences, etc.
  status           TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted',
    'verified',      -- Identity confirmed
    'in_progress',   -- Being processed
    'completed',     -- Request fulfilled
    'rejected'       -- Rejected with reason
  )),
  admin_notes      TEXT,                     -- Internal processing notes
  response         TEXT,                     -- Response sent to requester
  processed_by     UUID REFERENCES profiles(id),
  reference_number TEXT UNIQUE NOT NULL,
  submitted_at     TIMESTAMPTZ DEFAULT now(),
  due_by           TIMESTAMPTZ DEFAULT now() + interval '30 days',  -- Statutory deadline
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  consent_given_at TIMESTAMPTZ              -- When the user ticked the DPA consent checkbox
);

ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;

-- Users can submit requests (must be authenticated)
CREATE POLICY "Users can submit data requests"
  ON data_requests FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND requester_id = auth.uid()
    AND status = 'submitted'
  );

-- Users can view their own requests
CREATE POLICY "Users can view own data requests"
  ON data_requests FOR SELECT
  USING (requester_id = auth.uid());

-- Admins and staff can view all requests
CREATE POLICY "Staff can view all data requests"
  ON data_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Admins and staff can update requests (process, respond, close)
CREATE POLICY "Staff can update data requests"
  ON data_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_data_requests_requester ON data_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_status    ON data_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_requests_due       ON data_requests(due_by);
CREATE INDEX IF NOT EXISTS idx_data_requests_created   ON data_requests(created_at DESC);

-- Audit trigger (reuse existing log_admin_action from 004)
CREATE OR REPLACE TRIGGER audit_data_requests_admin
  AFTER INSERT OR UPDATE OR DELETE ON data_requests
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- Status change trigger
CREATE OR REPLACE TRIGGER audit_data_requests_status
  AFTER UPDATE ON data_requests
  FOR EACH ROW EXECUTE FUNCTION log_status_change();
