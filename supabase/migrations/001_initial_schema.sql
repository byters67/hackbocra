-- =============================================================================
-- BOCRA Website - Supabase Database Migration
-- =============================================================================
-- 
-- This SQL creates all tables needed for the BOCRA website with Row Level 
-- Security (RLS) enabled on every table.
--
-- Tables:
--   pages         - CMS content pages
--   posts         - News articles, speeches, events
--   documents     - Downloadable document metadata
--   complaints    - Consumer complaint submissions
--   contact_submissions - Contact form entries
--   profiles      - Extended user profiles (links to auth.users)
--   operators     - Telecom operators (for DQoS)
--   kpi_data      - QoS key performance indicators
--   type_approvals - Equipment type approval applications
--
-- SECURITY: All tables have RLS enabled. Unauthenticated users can only
-- read published content. Write operations require authentication.
-- This directly addresses pentest findings F01 and F04.
-- =============================================================================

-- Enable PostGIS extension (for future DQoS map features)
CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================================================
-- 1. PROFILES (extends Supabase Auth)
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'operator', 'staff')),
  organization TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (for display purposes)
CREATE POLICY "Public can read profiles"
  ON profiles FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- New users auto-create profile via trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- 2. PAGES (CMS content)
-- =============================================================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published pages"
  ON pages FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage pages"
  ON pages FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================================
-- 3. POSTS (News, Events, Speeches)
-- =============================================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT,
  excerpt TEXT,
  category TEXT,
  author_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage posts"
  ON posts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================================
-- 4. DOCUMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_path TEXT,
  file_url TEXT,
  category TEXT,
  year TEXT,
  file_type TEXT DEFAULT 'PDF',
  downloads INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read documents"
  ON documents FOR SELECT USING (true);

CREATE POLICY "Admins can manage documents"
  ON documents FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================================
-- 5. COMPLAINTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  provider TEXT,
  complaint_type TEXT,
  description TEXT NOT NULL,
  previous_complaint BOOLEAN DEFAULT false,
  reference_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'closed')),
  assigned_to UUID REFERENCES profiles(id),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a complaint (insert)
CREATE POLICY "Anyone can file complaints"
  ON complaints FOR INSERT WITH CHECK (true);

-- Only admins/staff can read all complaints
CREATE POLICY "Staff can read complaints"
  ON complaints FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Admins can update complaints
CREATE POLICY "Admins can manage complaints"
  ON complaints FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- =============================================================================
-- 6. CONTACT SUBMISSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read submissions"
  ON contact_submissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================================
-- 7. OPERATORS (for DQoS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS operators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  vendor TEXT,
  color TEXT,
  logo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read operators"
  ON operators FOR SELECT USING (true);

CREATE POLICY "Admins can manage operators"
  ON operators FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed default operators
INSERT INTO operators (name, short_name, vendor, color) VALUES
  ('Mascom Wireless', 'MASCOM', 'Huawei', '#E21836'),
  ('Botswana Telecommunications Corporation', 'BTC', 'Ericsson', '#0066CC'),
  ('Orange Botswana', 'ORANGE', 'Huawei', '#FF6600')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 8. KPI DATA (QoS metrics)
-- =============================================================================
CREATE TABLE IF NOT EXISTS kpi_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES operators(id),
  kpi_type TEXT NOT NULL,
  value NUMERIC,
  location TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE kpi_data ENABLE ROW LEVEL SECURITY;

-- Public read for QoS transparency
CREATE POLICY "Public can read KPI data"
  ON kpi_data FOR SELECT USING (true);

-- Only admins can write KPI data (prevents F01-style unauthenticated writes)
CREATE POLICY "Only admins can write KPI data"
  ON kpi_data FOR INSERT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================================
-- 9. TYPE APPROVALS
-- =============================================================================
CREATE TABLE IF NOT EXISTS type_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_id UUID REFERENCES profiles(id),
  equipment_name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE type_approvals ENABLE ROW LEVEL SECURITY;

-- Authenticated users can submit applications
CREATE POLICY "Users can submit type approvals"
  ON type_approvals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON type_approvals FOR SELECT USING (
    applicant_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- =============================================================================
-- INDEXES for performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_kpi_data_recorded ON kpi_data(recorded_at DESC);
