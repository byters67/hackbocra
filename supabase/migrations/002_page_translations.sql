-- =============================================================================
-- BOCRA Website — Page Translations Table
-- =============================================================================
--
-- Stores multilingual page content (EN / TN) for the generic ContentPage.
--
-- DESIGN:
--   Row-per-language — each (slug, lang) pair is unique.
--   English fallback is handled in the application layer:
--     1. Query WHERE slug = :slug AND lang = :lang
--     2. If no rows, query WHERE slug = :slug AND lang = 'en'
--     3. If still no rows, fall back to the local PAGE_CONTENT dictionary
--
-- SECURITY:
--   RLS enabled. Public users can SELECT published rows.
--   Only admins can INSERT / UPDATE / DELETE.
-- =============================================================================

CREATE TABLE IF NOT EXISTS page_translations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT NOT NULL,
  lang        TEXT NOT NULL DEFAULT 'en'
              CHECK (lang IN ('en', 'tn')),
  title       TEXT NOT NULL,
  breadcrumb  TEXT[] NOT NULL DEFAULT '{}',
  accent      TEXT,
  content     TEXT NOT NULL DEFAULT '',
  status      TEXT DEFAULT 'published'
              CHECK (status IN ('draft', 'published', 'archived')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),

  UNIQUE (slug, lang)
);

-- Index for the primary lookup pattern
CREATE INDEX IF NOT EXISTS idx_page_translations_slug_lang
  ON page_translations (slug, lang);

-- Enable RLS
ALTER TABLE page_translations ENABLE ROW LEVEL SECURITY;

-- Public can read published translations
CREATE POLICY "Public can read published translations"
  ON page_translations FOR SELECT
  USING (status = 'published');

-- Admins can manage all translations
CREATE POLICY "Admins can manage translations"
  ON page_translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_page_translations_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_page_translations_updated
  BEFORE UPDATE ON page_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_page_translations_timestamp();
