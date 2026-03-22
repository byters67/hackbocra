-- =============================================================
-- 017: Application error logging
-- =============================================================

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  component TEXT,
  page_url TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_type ON error_logs(error_type, created_at DESC);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read error logs
CREATE POLICY "Admins can read error logs"
  ON error_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Anyone can insert (needed for anonymous error reporting)
CREATE POLICY "Anyone can log errors"
  ON error_logs FOR INSERT
  WITH CHECK (true);
