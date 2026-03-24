-- =============================================================================
-- BOCRA Website — Migration 021: Data-Driven FAQ System
-- =============================================================================
--
-- Phase 8: Creates faq_entries table for admin-managed FAQs (supplements the
-- hardcoded public FAQ page) and chat_queries for anonymized chatbot logging.
--
-- Phase 5 is deployed — search_events table already exists for search analytics.
-- No search_queries table needed.
-- =============================================================================

-- ─── TABLE 1: faq_entries ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS faq_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content (English)
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  -- Content (Setswana)
  question_tn TEXT,
  answer_tn TEXT,

  -- Organization
  category TEXT NOT NULL,
  sort_order INT DEFAULT 0,

  -- Source tracking
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN (
    'manual', 'chatbot', 'complaint', 'search'
  )),
  source_query TEXT,

  -- Metrics
  frequency_score INT DEFAULT 0,
  view_count INT DEFAULT 0,

  -- Publishing
  published BOOLEAN DEFAULT false,

  -- Links (JSON array of {label, labelTn, path})
  links JSONB DEFAULT '[]'::jsonb,

  -- Housekeeping
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_faq_entries_category ON faq_entries (category);
CREATE INDEX idx_faq_entries_published ON faq_entries (published) WHERE published = true;
CREATE INDEX idx_faq_entries_frequency ON faq_entries (frequency_score DESC);

ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published FAQs"
  ON faq_entries FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admin can manage all FAQs"
  ON faq_entries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE OR REPLACE FUNCTION update_faq_entries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_faq_entries_updated_at
  BEFORE UPDATE ON faq_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_entries_timestamp();

-- ─── TABLE 2: chat_queries ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_text TEXT NOT NULL,
  matched_topic TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'tn')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_queries_created ON chat_queries (created_at DESC);

ALTER TABLE chat_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can log chat queries"
  ON chat_queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can read chat queries"
  ON chat_queries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- No seed data — public FAQ page keeps hardcoded data in FAQsPage.jsx.
-- Admins can create new FAQ entries via the admin portal at /admin/faq.
