-- =============================================================================
-- BOCRA Admin Portal — Migration 003
-- =============================================================================
--
-- Creates tables required by the admin portal:
--   complaint_responses  — Admin replies to complaints
--   licence_applications — Licence application submissions
--   cyber_incidents      — Cybersecurity incident reports
--
-- All tables have Row Level Security enabled.
-- Public users can INSERT into submission tables.
-- Only admin/staff can SELECT, UPDATE, DELETE.
-- =============================================================================

-- =============================================================================
-- 1. COMPLAINT RESPONSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS complaint_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE complaint_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read complaint responses"
  ON complaint_responses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Staff can insert complaint responses"
  ON complaint_responses FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Staff can update complaint responses"
  ON complaint_responses FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE INDEX IF NOT EXISTS idx_complaint_responses_complaint
  ON complaint_responses(complaint_id);

-- =============================================================================
-- 2. LICENCE APPLICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS licence_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  licence_type TEXT NOT NULL,
  licence_slug TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  omang TEXT NOT NULL,
  city TEXT,
  address TEXT,
  purpose TEXT NOT NULL,
  experience TEXT,
  additional_info TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'more_info_needed')),
  assigned_to UUID REFERENCES profiles(id),
  reference_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE licence_applications ENABLE ROW LEVEL SECURITY;

-- Public can submit licence applications (restrict to safe default values)
CREATE POLICY "Public can insert applications"
  ON licence_applications FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND assigned_to IS NULL
  );

-- Admin/staff can read all applications
CREATE POLICY "Staff can read applications"
  ON licence_applications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Admin/staff can update applications
CREATE POLICY "Staff can update applications"
  ON licence_applications FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE INDEX IF NOT EXISTS idx_licence_applications_status
  ON licence_applications(status);

CREATE INDEX IF NOT EXISTS idx_licence_applications_type
  ON licence_applications(licence_type);

CREATE INDEX IF NOT EXISTS idx_licence_applications_created
  ON licence_applications(created_at DESC);

-- =============================================================================
-- 3. CYBER INCIDENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS cyber_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE,
  urgency TEXT DEFAULT 'medium'
    CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'received'
    CHECK (status IN ('received', 'investigating', 'resolved', 'closed')),
  reference_number TEXT UNIQUE NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  escalated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cyber_incidents ENABLE ROW LEVEL SECURITY;

-- Public can submit incident reports (restrict to safe default values)
CREATE POLICY "Public can insert incidents"
  ON cyber_incidents FOR INSERT
  WITH CHECK (
    status = 'received'
    AND escalated = false
    AND assigned_to IS NULL
  );

-- Admin/staff can read all incidents
CREATE POLICY "Staff can read incidents"
  ON cyber_incidents FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Admin/staff can update incidents
CREATE POLICY "Staff can update incidents"
  ON cyber_incidents FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE INDEX IF NOT EXISTS idx_cyber_incidents_status
  ON cyber_incidents(status);

CREATE INDEX IF NOT EXISTS idx_cyber_incidents_urgency
  ON cyber_incidents(urgency);

CREATE INDEX IF NOT EXISTS idx_cyber_incidents_created
  ON cyber_incidents(created_at DESC);

-- =============================================================================
-- 4. UPDATE contact_submissions — allow staff to read and update
-- =============================================================================
-- Staff should also be able to read contact submissions (not just admin)
-- and mark them as read/replied
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_submissions' AND policyname = 'Staff can read submissions'
  ) THEN
    CREATE POLICY "Staff can read submissions"
      ON contact_submissions FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contact_submissions' AND policyname = 'Staff can update submissions'
  ) THEN
    CREATE POLICY "Staff can update submissions"
      ON contact_submissions FOR UPDATE
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
      );
  END IF;
END $$;

-- Add replied column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_submissions' AND column_name = 'replied'
  ) THEN
    ALTER TABLE contact_submissions ADD COLUMN replied BOOLEAN DEFAULT false;
  END IF;
END $$;
