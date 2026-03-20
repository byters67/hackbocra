-- ═══════════════════════════════════════════════════════════════
-- 008: AI-Powered Licence Application Review
-- Adds AI review columns to licence_applications and creates
-- a document_reviews table for per-document analysis results.
-- ═══════════════════════════════════════════════════════════════

-- 1. Add AI review columns to licence_applications
ALTER TABLE licence_applications ADD COLUMN IF NOT EXISTS ai_review_status TEXT DEFAULT NULL;
ALTER TABLE licence_applications ADD COLUMN IF NOT EXISTS ai_review_result JSONB DEFAULT NULL;
ALTER TABLE licence_applications ADD COLUMN IF NOT EXISTS ai_reviewed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE licence_applications ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC(3,2) DEFAULT NULL;

-- 2. Individual document review results
CREATE TABLE IF NOT EXISTS document_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES licence_applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  ai_verdict TEXT NOT NULL CHECK (ai_verdict IN ('PASS', 'FAIL', 'UNCLEAR')),
  ai_reasoning TEXT NOT NULL,
  extracted_data JSONB DEFAULT '{}',
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS: only admin/staff can access document reviews
-- Uses profiles table lookup to match project convention (see 003_admin_portal.sql)
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read document reviews"
  ON document_reviews FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Staff can insert document reviews"
  ON document_reviews FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY "Staff can delete document reviews"
  ON document_reviews FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- 4. Index for fast lookups by application
CREATE INDEX IF NOT EXISTS idx_document_reviews_application_id
  ON document_reviews(application_id);

-- 5. Storage bucket for application documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT DO NOTHING;

-- 6. Storage policies
-- Authenticated users can upload to their own application folder only
CREATE POLICY "Users can upload application documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'application-documents' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM licence_applications
      WHERE user_id = auth.uid()
    )
  );

-- Admins/staff can read all application documents; service role always has access
CREATE POLICY "Admins can read all application documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'application-documents' AND
    (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
      OR auth.role() = 'service_role'
    )
  );
