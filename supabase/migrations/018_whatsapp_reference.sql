-- =============================================================================
-- Migration 018: WhatsApp notifications + complaint reference numbers
-- Phase 2 of BOCRA Implementation Roadmap
-- =============================================================================

-- ─── 1. ADD REFERENCE NUMBER TO COMPLAINTS ───────────────────────────────────
ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS reference_number TEXT UNIQUE;

-- Auto-generate reference numbers: BOCRA-2026-XXXXX
CREATE OR REPLACE FUNCTION generate_complaint_reference()
RETURNS TRIGGER AS $$
DECLARE
  ref TEXT;
  attempts INT := 0;
BEGIN
  IF NEW.reference_number IS NOT NULL AND NEW.reference_number <> '' THEN
    RETURN NEW;
  END IF;
  LOOP
    ref := 'BOCRA-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
           UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 5));
    BEGIN
      NEW.reference_number := ref;
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      attempts := attempts + 1;
      IF attempts > 10 THEN
        RAISE EXCEPTION 'Could not generate unique reference number after 10 attempts';
      END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_complaint_reference ON complaints;
CREATE TRIGGER set_complaint_reference
  BEFORE INSERT ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION generate_complaint_reference();

-- Backfill any existing rows that have no reference number
UPDATE complaints
SET reference_number = 'BOCRA-' || TO_CHAR(created_at, 'YYYY') || '-' ||
                       UPPER(SUBSTRING(MD5(id::TEXT) FROM 1 FOR 5))
WHERE reference_number IS NULL OR reference_number = '';

-- ─── 2. WHATSAPP DELIVERY LOG ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id     UUID REFERENCES complaints(id) ON DELETE CASCADE,
  phone_last4      TEXT NOT NULL,           -- last 4 digits only (privacy)
  message_type     TEXT NOT NULL,           -- 'acknowledgement' | 'status_update'
  twilio_sid       TEXT,                    -- Twilio message SID
  delivery_status  TEXT NOT NULL DEFAULT 'sent', -- 'sent' | 'failed'
  error_message    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin dashboard lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_complaint_id ON whatsapp_log(complaint_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_created_at ON whatsapp_log(created_at DESC);

-- RLS: admins can read, edge functions (service role) can insert
ALTER TABLE whatsapp_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view whatsapp_log"
  ON whatsapp_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Edge functions use service_role key which bypasses RLS
