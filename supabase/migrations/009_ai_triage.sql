-- AI-powered complaint triage columns
-- These columns are populated by the classify-complaint edge function

ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS ai_category    TEXT,
  ADD COLUMN IF NOT EXISTS ai_department  TEXT,
  ADD COLUMN IF NOT EXISTS ai_urgency     TEXT,
  ADD COLUMN IF NOT EXISTS ai_summary     TEXT,
  ADD COLUMN IF NOT EXISTS ai_confidence  INTEGER,
  ADD COLUMN IF NOT EXISTS ai_sentiment   TEXT,
  ADD COLUMN IF NOT EXISTS needs_review   BOOLEAN DEFAULT false;
