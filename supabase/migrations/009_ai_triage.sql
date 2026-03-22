-- =============================================================================
-- BOCRA Website — Migration 009: AI-Powered Complaint Triage
-- =============================================================================
--
-- Adds columns to the complaints table for AI classification results.
-- These columns are populated automatically by the classify-complaint
-- Edge Function (supabase/functions/classify-complaint/index.ts) which:
--   1. Sends complaint text to Claude for analysis
--   2. Classifies into BOCRA regulatory categories (Telecom, Broadcasting, etc.)
--   3. Assigns urgency level and suggested department
--   4. Flags low-confidence classifications for manual review
--
-- The AI fields are advisory — human staff make final decisions.
-- See src/lib/triageConstants.js for the shared category/department taxonomy.
-- =============================================================================

ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS ai_category    TEXT,
  ADD COLUMN IF NOT EXISTS ai_department  TEXT,
  ADD COLUMN IF NOT EXISTS ai_urgency     TEXT,
  ADD COLUMN IF NOT EXISTS ai_summary     TEXT,
  ADD COLUMN IF NOT EXISTS ai_confidence  INTEGER,
  ADD COLUMN IF NOT EXISTS ai_sentiment   TEXT,
  ADD COLUMN IF NOT EXISTS needs_review   BOOLEAN DEFAULT false;
