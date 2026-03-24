-- =============================================================================
-- BOCRA Website — Migration 020: Search Analytics
-- =============================================================================
--
-- Phase 5: Logs anonymized search events for measuring search quality.
-- No PII stored — only query text and interaction data.
--
-- Used to:
--   1. Measure search-to-click rate (success metric)
--   2. Track "no results" queries (content gap detection)
--   3. Compare semantic vs keyword search performance
--   4. Feed Phase 8 (Data-Driven FAQ) with real query data
-- =============================================================================

CREATE TABLE IF NOT EXISTS search_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'search_executed', 'search_result_clicked', 'search_no_results'
  )),
  query_text TEXT NOT NULL,
  results_count INT,
  clicked_result_title TEXT,
  clicked_result_position INT,
  search_mode TEXT DEFAULT 'keyword' CHECK (search_mode IN ('keyword', 'semantic', 'fallback')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX idx_search_events_created ON search_events (created_at DESC);
CREATE INDEX idx_search_events_type ON search_events (event_type);

-- RLS: Public can insert (log events), only admin/staff can read
ALTER TABLE search_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can log search events"
  ON search_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only admin can read search events"
  ON search_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );
