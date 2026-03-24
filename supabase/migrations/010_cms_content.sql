-- =============================================================================
-- BOCRA CMS Content Migration
-- =============================================================================
-- Adds CMS capabilities: extends posts table, extends documents table,
-- creates storage bucket for file uploads.
-- Run this in Supabase SQL Editor.
-- =============================================================================

-- =============================================================================
-- 1. POSTS TABLE — Add missing column
-- =============================================================================
-- The posts table already exists (001_initial_schema.sql) with:
--   id, title, slug, body, excerpt, category, author_id, status, published_at, created_at, updated_at
-- We only need to add featured_image_url.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='featured_image_url') THEN
    ALTER TABLE posts ADD COLUMN featured_image_url TEXT;
  END IF;
END $$;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS — update to include staff role (original only had admin)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published posts" ON posts;
CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage posts" ON posts;
DROP POLICY IF EXISTS "Admin/staff full access to posts" ON posts;
CREATE POLICY "Admin/staff full access to posts"
  ON posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- =============================================================================
-- 2. DOCUMENTS TABLE — Add missing columns
-- =============================================================================
-- The documents table already exists (001_initial_schema.sql) with:
--   id, title, file_path, file_url, category, year, file_type, downloads, published_at, created_at
-- We need to add: description, file_name, file_size, uploaded_by, updated_at

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='description') THEN
    ALTER TABLE documents ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='file_name') THEN
    ALTER TABLE documents ADD COLUMN file_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='file_size') THEN
    ALTER TABLE documents ADD COLUMN file_size INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='uploaded_by') THEN
    ALTER TABLE documents ADD COLUMN uploaded_by UUID REFERENCES profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='updated_at') THEN
    ALTER TABLE documents ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

DROP TRIGGER IF EXISTS documents_updated_at ON documents;
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS — update to include staff role
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read documents" ON documents;
CREATE POLICY "Public can read documents"
  ON documents FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage documents" ON documents;
DROP POLICY IF EXISTS "Admin/staff full access to documents" ON documents;
CREATE POLICY "Admin/staff full access to documents"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- =============================================================================
-- 3. SUPABASE STORAGE — Documents bucket
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "Public can read document files" ON storage.objects;
CREATE POLICY "Public can read document files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Admin/staff upload
DROP POLICY IF EXISTS "Admin/staff can upload document files" ON storage.objects;
CREATE POLICY "Admin/staff can upload document files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Admin/staff delete
DROP POLICY IF EXISTS "Admin/staff can delete document files" ON storage.objects;
CREATE POLICY "Admin/staff can delete document files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Admin/staff update (replace files)
DROP POLICY IF EXISTS "Admin/staff can update document files" ON storage.objects;
CREATE POLICY "Admin/staff can update document files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );
