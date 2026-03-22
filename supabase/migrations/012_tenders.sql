-- 012_tenders.sql
-- Tenders & Procurement manager
-- Run in Supabase SQL Editor before building frontend.

CREATE TABLE IF NOT EXISTS tenders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ref TEXT NOT NULL,
  title TEXT NOT NULL,
  method TEXT DEFAULT 'Open Domestic Bidding',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'awarded', 'adjudicated')),
  category TEXT DEFAULT 'General',
  closing_date TEXT,
  publish_date TEXT,
  decision_date TEXT,
  awarded_to TEXT,
  amount TEXT,
  decision TEXT,
  file TEXT,
  posted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS tenders_updated_at ON tenders;
CREATE TRIGGER tenders_updated_at
  BEFORE UPDATE ON tenders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;

-- Public can read all tenders
DROP POLICY IF EXISTS "Public can read tenders" ON tenders;
CREATE POLICY "Public can read tenders"
  ON tenders FOR SELECT
  USING (true);

-- Admin/staff full access
DROP POLICY IF EXISTS "Admin/staff full access to tenders" ON tenders;
CREATE POLICY "Admin/staff full access to tenders"
  ON tenders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );
