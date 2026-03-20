-- ============================================================
-- 008_consultations.sql
-- Run with: supabase db push (or migrations)
--
-- Creates the consultation_submissions table (Item #19)
-- and a consultations reference table for managing open/closed status.
-- Depends on: profiles table (created in 001_initial_schema.sql)
-- ============================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CONSULTATIONS  (reference — tracks open/closed status, managed by admin)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consultations (
  id              TEXT PRIMARY KEY,         -- e.g. 'BOCRA/CON/2025/001'
  title           TEXT NOT NULL,
  sector          TEXT NOT NULL,            -- 'Telecommunications' | 'Broadcasting' | 'Postal' | 'Internet & ICT'
  summary         TEXT,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at       DATE NOT NULL,
  closes_at       DATE NOT NULL,
  topic_tags      TEXT[] DEFAULT '{}',      -- selectable tags shown in the submission form
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CONSULTATION_SUBMISSIONS  (public INSERT, admin-only SELECT)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consultation_submissions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id             TEXT NOT NULL REFERENCES consultations(id),
  full_name                   TEXT NOT NULL,
  email                       TEXT NOT NULL,
  organisation                TEXT,
  respondent_type             TEXT NOT NULL,  -- from the RESPONDENT_TYPES list
  topic_tags                  TEXT[] DEFAULT '{}',  -- tags the user selected
  response_text               TEXT NOT NULL,
  is_public                   BOOLEAN DEFAULT FALSE,
  notify_on_determination     BOOLEAN DEFAULT FALSE,
  submission_ref              TEXT UNIQUE,    -- auto-generated on insert (trigger below)
  submitted_at                TIMESTAMPTZ DEFAULT now()
);

-- Sequence for submission_ref to avoid collisions (RANDOM() can produce duplicates)
CREATE SEQUENCE IF NOT EXISTS consultation_submission_ref_seq
  START WITH 1000
  INCREMENT BY 1;

-- Auto-generate a human-readable reference number on every insert
CREATE OR REPLACE FUNCTION generate_submission_ref()
RETURNS TRIGGER AS $$
BEGIN
  NEW.submission_ref := 'BOCRA/SUB/' || TO_CHAR(now(), 'YYYY') || '/' ||
                        LPAD(nextval('consultation_submission_ref_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_submission_ref ON consultation_submissions;
CREATE TRIGGER set_submission_ref
  BEFORE INSERT ON consultation_submissions
  FOR EACH ROW EXECUTE FUNCTION generate_submission_ref();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

-- consultations: public can read, only admins can write
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read consultations"
  ON consultations FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage consultations"
  ON consultations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
  );

-- consultation_submissions: public can INSERT, admin/staff can SELECT
ALTER TABLE consultation_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a consultation response"
  ON consultation_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can view all submissions"
  ON consultation_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Public submissions are readable"
  ON consultation_submissions FOR SELECT
  USING (is_public = true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. PUBLIC SUBMISSION COUNT (for stats display — no per-row access)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_consultation_submission_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM consultation_submissions;
$$;

GRANT EXECUTE ON FUNCTION get_consultation_submission_count() TO anon;
GRANT EXECUTE ON FUNCTION get_consultation_submission_count() TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SEED DATA  (mirrors the mock data in ConsultationsPage.jsx)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO consultations (id, title, sector, summary, status, opened_at, closes_at, topic_tags)
VALUES
  (
    'BOCRA/CON/2025/001',
    'National Broadband Strategy 2025–2030 — public review',
    'Telecommunications',
    'BOCRA invites comments on the proposed national broadband strategy, including QoS targets, rural connectivity plans, and spectrum allocation priorities for 5G.',
    'open',
    '2025-03-03',
    '2025-04-30',
    ARRAY['QoS standards', 'Rural connectivity', '5G spectrum', 'Infrastructure investment']
  ),
  (
    'BOCRA/CON/2025/002',
    'Community broadcasting licence framework — proposed amendments',
    'Broadcasting',
    'Proposed changes to the licensing framework for community radio and television services.',
    'open',
    '2025-02-18',
    '2025-04-10',
    ARRAY['Ownership rules', 'Local content quotas', 'Licensing fees', 'Community radio']
  ),
  (
    'BOCRA/CON/2024/003',
    'QoS regulations for mobile voice services — 2024 review',
    'Telecommunications',
    'Review of quality-of-service benchmarks for mobile voice calls.',
    'closed',
    '2024-09-01',
    '2024-12-15',
    ARRAY['Call drop rates', 'Voice quality', 'Operator obligations', 'Penalty framework']
  ),
  (
    'BOCRA/CON/2024/002',
    'Consumer protection code — proposed amendments 2024',
    'Internet & ICT',
    'Amendments to the Consumer Protection Code covering data breach notification requirements and billing transparency obligations.',
    'closed',
    '2024-04-01',
    '2024-06-28',
    ARRAY['Data breach notification', 'Billing transparency', 'Consumer rights']
  )
ON CONFLICT (id) DO NOTHING;
