-- =============================================================================
-- BOCRA Website — Migration 022: Subscription Notifications
-- =============================================================================
--
-- Phase 7: Public subscription system for regulatory alerts.
-- Citizens subscribe to areas of interest and receive email notifications
-- when new documents, consultations, or news are published.
-- =============================================================================

-- ─── TABLE 1: subscriptions ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact
  email TEXT NOT NULL,
  phone TEXT,

  -- Areas of interest (JSONB array of area slugs)
  areas JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Preferences
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'tn')),

  -- Verification
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT UNIQUE,
  verification_sent_at TIMESTAMPTZ,

  -- Unsubscribe
  unsubscribe_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  active BOOLEAN NOT NULL DEFAULT true,

  -- Housekeeping
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(email)
);

CREATE INDEX idx_subscriptions_email ON subscriptions (email);
CREATE INDEX idx_subscriptions_verified_active ON subscriptions (verified, active)
  WHERE verified = true AND active = true;
CREATE INDEX idx_subscriptions_areas ON subscriptions USING gin (areas);
CREATE INDEX idx_subscriptions_verification_token ON subscriptions (verification_token)
  WHERE verification_token IS NOT NULL;
CREATE INDEX idx_subscriptions_unsubscribe_token ON subscriptions (unsubscribe_token);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can subscribe"
  ON subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access"
  ON subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can view subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE OR REPLACE FUNCTION update_subscriptions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_timestamp();

-- ─── TABLE 2: notification_log ───────────────────────────────────

CREATE TABLE IF NOT EXISTS notification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('document', 'consultation', 'news')),
  content_title TEXT NOT NULL,
  area TEXT NOT NULL,
  recipients_count INT NOT NULL DEFAULT 0,
  sent_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage notification log"
  ON notification_log FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Service role can insert notification log"
  ON notification_log FOR INSERT
  TO service_role
  WITH CHECK (true);
