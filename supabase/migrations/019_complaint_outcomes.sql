-- =============================================================================
-- Migration 019: Complaint outcome and remedy fields
-- Phase 3 — Complaint Outcomes Transparency
-- =============================================================================

ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS outcome TEXT
    CHECK (outcome IN ('upheld','dismissed','withdrawn','pending') OR outcome IS NULL),
  ADD COLUMN IF NOT EXISTS remedy TEXT
    CHECK (remedy IN ('refund','service_restored','apology','compensation','none','other') OR remedy IS NULL),
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Index for aggregate queries on the public dashboard
CREATE INDEX IF NOT EXISTS idx_complaints_outcome   ON complaints(outcome) WHERE outcome IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_complaints_provider   ON complaints(provider);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_resolved_at ON complaints(resolved_at) WHERE resolved_at IS NOT NULL;

-- Auto-set resolved_at when status changes to resolved/closed
CREATE OR REPLACE FUNCTION set_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('resolved','closed') AND OLD.status NOT IN ('resolved','closed') THEN
    NEW.resolved_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_resolved_at ON complaints;
CREATE TRIGGER trg_set_resolved_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION set_resolved_at();
