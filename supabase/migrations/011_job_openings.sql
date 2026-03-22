-- 011_job_openings.sql
-- Jobs / Careers manager — Phase 1.5
-- Run in Supabase SQL Editor before building frontend.

CREATE TABLE IF NOT EXISTS job_openings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT DEFAULT 'Gaborone, Botswana',
  employment_type TEXT DEFAULT 'Full-time' CHECK (employment_type IN (
    'Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'
  )),
  description TEXT NOT NULL,
  requirements TEXT,
  qualifications TEXT,
  salary_range TEXT,
  closing_date DATE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  posted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at (function already exists from posts migration)
DROP TRIGGER IF EXISTS job_openings_updated_at ON job_openings;
CREATE TRIGGER job_openings_updated_at
  BEFORE UPDATE ON job_openings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;

-- Public can read open jobs
DROP POLICY IF EXISTS "Public can read open jobs" ON job_openings;
CREATE POLICY "Public can read open jobs"
  ON job_openings FOR SELECT
  USING (status = 'open');

-- Admin/staff full access
DROP POLICY IF EXISTS "Admin/staff full access to jobs" ON job_openings;
CREATE POLICY "Admin/staff full access to jobs"
  ON job_openings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );
