# BOCRA Admin CMS — Build Plan for Cursor / Claude Code

> **Purpose:** Give this entire document to Cursor or Claude Code as context before you start building. It contains everything the AI needs to know about your existing codebase, database, and exactly what to build.
>
> **Updated 2026-03-22** — Incorporates findings from Claude Code's full codebase exploration.

---

## 1. WHAT WE ARE BUILDING

Two new admin panel sections so non-technical BOCRA staff can manage website content without touching code:

### A. News Manager (`/admin/news`)
- List all news articles (table with title, date, category, status)
- Create new article (form with rich text editor)
- Edit existing article
- Delete article (with confirmation)
- Toggle draft/published status
- Public `NewsPage.jsx` reads from Supabase instead of hardcoded array

### B. Documents Manager (`/admin/documents`)
- List all documents (table with title, category, year, file link)
- Upload new document (PDF/file upload to Supabase Storage + metadata form)
- Edit document metadata (title, category, year)
- Delete document (removes file from Storage + row from DB)
- Public `DocumentsPage.jsx` reads from Supabase instead of hardcoded array

### Editor: TipTap (rich text)
- Simple toolbar: Bold, Italic, Headings (H2, H3), Bullet list, Numbered list, Links
- No code editing. A normal office worker can use it.
- Outputs HTML stored in the database `body` column
- Install: `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link`
- **Do NOT use a Markdown textarea** — the admins have zero technical knowledge. They need a visual toolbar where they click "Bold" to make text bold, not type `**text**`.

---

## 2. EXISTING CODEBASE CONTEXT

### Tech Stack
- React 18 + Vite 5 (JSX, not TypeScript on the frontend)
- Tailwind CSS 3 (utility classes, custom BOCRA theme)
- Supabase (PostgreSQL + Auth + RLS + Edge Functions + Storage)
- React Router DOM 6 (all routes in `src/App.jsx`, admin routes use `lazy()` imports)
- **TanStack React Query v5** — used for server state management
- Lucide React for icons
- GSAP for animations (not needed in admin pages)
- Recharts for charts (admin dashboard only)
- `react-markdown` + `DOMPurify` already installed (used elsewhere, but NOT for the CMS editor)

### Brand / Design System
- Primary: `#00458B` (BOCRA Blue)
- Accent: `#00A6CE` (Cyan)
- Sector colours: Cyan `#00A6CE`, Magenta `#C8237B`, Yellow `#F7B731`, Green `#6BBE4E`
- Dark sidebar colour: `#001A3A`
- Heading font: `font-display` (DM Serif Display)
- Body font: `font-sans` (Plus Jakarta Sans)
- Cards: `rounded-2xl p-7 hover:-translate-y-1 shadow-lg`
- Admin panel uses a dark sidebar layout (see `AdminLayout.jsx`)

### Auth & Roles
- Supabase Auth with email/password
- 4 roles in `profiles` table: `user`, `operator`, `staff`, `admin`
- Admin pages protected by `AdminLayout.jsx` which checks `role IN ('admin', 'staff')`
- Role fetched from `profiles` table (server-side), NOT from JWT metadata
- Auth context: `src/lib/auth.jsx` → `useAuth()` hook gives `{ user, profile, signIn, signUp, signOut }`

### Supabase Client
- Initialised in `src/lib/supabase.js` (includes built-in rate limiting via `checkRateLimit()`)
- Imported as: `import { supabase } from '../../lib/supabase'` (path varies by file depth)
- Project URL is in `.env.local` as `VITE_SUPABASE_URL`
- Anon key is in `.env.local` as `VITE_SUPABASE_ANON_KEY`

### Data Fetching — useSupabaseQuery Hook (IMPORTANT)
- Located at: `src/hooks/useSupabaseQuery.js`
- This is a TanStack React Query wrapper for Supabase queries
- **USE THIS HOOK for all data fetching in admin pages** — it handles caching, loading states, error states, and refetching automatically
- Follow the same usage pattern as `AdminTypeApprovalPage.jsx` and other admin pages that already use it
- Example usage pattern (read the actual hook file for exact API):
```jsx
const { data, isLoading, error, refetch } = useSupabaseQuery(queryKey, queryFn);
```

### Notification System
- Toast notifications available via: `import { useNotification } from '../../lib/notifications'`
- Usage: `const { addNotification } = useNotification()` then `addNotification({ type: 'success', message: 'Saved!' })`
- Types: `success`, `error`, `warning`, `info`
- **Do NOT use `alert()` — use this toast system instead**

---

## 3. EXISTING FILES YOU MUST READ BEFORE CODING

**Read these files IN THIS ORDER before writing any code. Do not skip any.**

### Pattern References (how to build admin pages):

**`src/pages/admin/AdminTypeApprovalPage.jsx`** — **PRIMARY PATTERN REFERENCE.** This is the most complete CRUD admin page in the codebase. It has: list view with search/filters, create/edit form with controlled inputs and validation, delete with confirmation, save with loading state, error handling with try-catch and user-friendly messages. **Copy this pattern exactly for both NewsManagerPage and DocumentsManagerPage.**

**`src/pages/admin/ComplaintsPage.jsx`** — Secondary reference. Shows list + detail view pattern, status badges, and Supabase query patterns.

**`src/pages/admin/QoSReportsPage.jsx`** — Shows the create/form pattern.

### Data Fetching:

**`src/hooks/useSupabaseQuery.js`** — **READ THIS CAREFULLY.** Understand the exact API (parameter names, return values) before writing any data fetching code. All admin pages should use this hook, not raw `supabase.from()` calls.

### Layout & Navigation:

**`src/pages/admin/AdminLayout.jsx`** — The admin shell. Check the import path for AdminSidebar — this tells you which sidebar file is actually used.

**`src/pages/admin/AdminSidebar.jsx`** — **CONFIRMED: This is the active sidebar file** (at `src/pages/admin/`, NOT `src/components/admin/`). It has the full navigation structure with icons and badge counts. Read it to understand the exact link pattern (NavLink vs Link, icon usage, active state styling). Add your new nav items following the identical pattern.

**`src/App.jsx`** — All routes. Admin routes use `lazy()` imports for code splitting. Your new pages must also use `lazy()`:
```jsx
const AdminNews = lazy(() => import('./pages/admin/NewsManagerPage'));
const AdminDocuments = lazy(() => import('./pages/admin/DocumentsManagerPage'));
```
Admin routes are nested under:
```jsx
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="complaints" element={<AdminComplaints />} />
  {/* ... etc */}
</Route>
```

### Database Schema:

**`supabase/migrations/001_initial_schema.sql`** — Contains the existing `posts` table schema and `pages` table schema. **READ THIS to see what columns already exist.** The `posts` table is already defined here — you likely need ALTER TABLE to add missing columns, not CREATE TABLE.

**`supabase/migrations/003_admin_portal.sql`** — Additional table definitions for admin features.

**`supabase/migrations/005_rls_hardening.sql`** — Shows the RLS policy patterns used in this project. Follow the same pattern.

**`supabase/migrations/008_consultations.sql`** — Shows the most recent migration pattern (consultations table with RLS). Good reference for writing new migrations.

### Public Pages to Refactor:

**`src/pages/public/NewsPage.jsx`** — Currently reads from a hardcoded `PLACEHOLDER_NEWS` array. The code already has a comment: "Will fetch from Supabase 'posts' table when populated". Read the exact shape of `PLACEHOLDER_NEWS` objects to know what columns to map. News categories used: `Announcement`, `Consumer`, `Industry`, `Licensing`, `Procurement`, `Publication`.

**`src/pages/public/DocumentsPage.jsx`** — Currently reads from a hardcoded `DOCUMENTS` array with 100+ items across 15 categories. Read the exact object shape and category list.

---

## 4. DATABASE PLAN

### STEP 0: Check what already exists

**Before running ANY SQL, check the current state of your database:**

```sql
-- Run these in Supabase SQL Editor FIRST:

-- Check if posts table exists and what columns it has
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- Check if documents table exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;

-- Check existing RLS policies on posts
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'posts';

-- Check existing storage buckets
SELECT id, name, public FROM storage.buckets;
```

**Based on the results, use the appropriate SQL below:**

### A. `posts` table — ALTER or CREATE

The `001_initial_schema.sql` migration likely created a basic `posts` table. Compare its columns against the target schema below and ALTER to add what's missing.

**Target schema (what the table should look like after migration):**

```sql
-- ============================================
-- OPTION 1: If the posts table ALREADY EXISTS
-- Run only the ALTER statements for columns that are missing
-- ============================================

-- Add columns that may be missing (safe to run — IF NOT EXISTS prevents errors):
DO $$ BEGIN
  -- Core content columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='slug') THEN
    ALTER TABLE posts ADD COLUMN slug TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='summary') THEN
    ALTER TABLE posts ADD COLUMN summary TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='body') THEN
    ALTER TABLE posts ADD COLUMN body TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='category') THEN
    ALTER TABLE posts ADD COLUMN category TEXT DEFAULT 'Announcement';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='featured_image_url') THEN
    ALTER TABLE posts ADD COLUMN featured_image_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='status') THEN
    ALTER TABLE posts ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='published_at') THEN
    ALTER TABLE posts ADD COLUMN published_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='author_id') THEN
    ALTER TABLE posts ADD COLUMN author_id UUID REFERENCES profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='updated_at') THEN
    ALTER TABLE posts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add category constraint (skip if one already exists)
-- Check first: SELECT conname FROM pg_constraint WHERE conrelid = 'posts'::regclass;
-- ALTER TABLE posts ADD CONSTRAINT posts_category_check
--   CHECK (category IN ('Announcement', 'Consumer', 'Industry', 'Licensing', 'Procurement', 'Publication'));

-- Add status constraint
-- ALTER TABLE posts ADD CONSTRAINT posts_status_check
--   CHECK (status IN ('draft', 'published'));


-- ============================================
-- OPTION 2: If the posts table DOES NOT EXIST
-- ============================================

CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  body TEXT,
  category TEXT DEFAULT 'Announcement' CHECK (category IN (
    'Announcement', 'Consumer', 'Industry', 'Licensing', 'Procurement', 'Publication'
  )),
  featured_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Shared: auto-update trigger + RLS (run regardless of Option 1 or 2):**

```sql
-- Auto-update updated_at (CREATE OR REPLACE is safe to re-run)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger first if it exists, then recreate
DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (enable is idempotent, policies use IF NOT EXISTS logic)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Public can read published posts" ON posts;
CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT
  USING (status = 'published');

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
```

### B. `documents` table

```sql
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Report' CHECK (category IN (
    'Legislation', 'Guidelines', 'Report', 'Policy', 'Form',
    'Consultation', 'Standard', 'Annual Report', 'Regulation',
    'Strategic Plan', 'Tariff', 'Gazette', 'Framework',
    'Research', 'Presentation'
  )),
  year INTEGER,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger
DROP TRIGGER IF EXISTS documents_updated_at ON documents;
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read documents" ON documents;
CREATE POLICY "Public can read documents"
  ON documents FOR SELECT
  USING (true);

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
```

**NOTE on document categories:** The hardcoded `DocumentsPage.jsx` uses 15 categories. The CHECK constraint above includes all 15. Read the actual `DOCUMENTS` array to confirm the exact category names match — a mismatch will cause insert failures.

### C. Supabase Storage Bucket

```sql
-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read files
DROP POLICY IF EXISTS "Public can read document files" ON storage.objects;
CREATE POLICY "Public can read document files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Admin/staff can upload
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

-- Admin/staff can delete
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
```

---

## 5. FILES TO CREATE

### `src/components/admin/RichTextEditor.jsx`

A reusable TipTap rich text editor component.

Props:
- `content` (string) — initial HTML content
- `onChange` (function) — called with HTML string on every change
- `placeholder` (string, optional) — placeholder text

Toolbar buttons: Bold, Italic, H2, H3, Bullet List, Ordered List, Link, Undo, Redo

Style the toolbar and editor area with Tailwind to match the admin panel aesthetic:
- Toolbar: `bg-gray-50 border-b border-gray-200 p-2 flex gap-1 flex-wrap`
- Toolbar buttons: `p-2 rounded hover:bg-gray-200` with active state `bg-bocra-blue text-white` or similar
- Editor area: `prose max-w-none p-4 min-h-[300px] focus:outline-none`
- Wrapper: `border border-gray-300 rounded-lg overflow-hidden`

Use Lucide icons for toolbar buttons where possible (Bold, Italic, Heading2, Heading3, List, ListOrdered, Link, Undo2, Redo2).

Dependencies:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```

**Do NOT use react-markdown or a markdown textarea. TipTap is the editor.**

### `src/pages/admin/NewsManagerPage.jsx`

**Follow the `AdminTypeApprovalPage.jsx` pattern exactly** for state management, form structure, loading/error handling, and CRUD flow.

**Use `useSupabaseQuery` hook for data fetching** — read the hook file to understand its exact API.

Admin page with two views (toggled via local state, same as AdminTypeApprovalPage):

**List View (default):**
- "Create New Article" button at top (use `Plus` icon from lucide-react)
- Search input to filter by title
- Category filter buttons/dropdown (Announcement, Consumer, Industry, Licensing, Procurement, Publication)
- Status filter (All, Draft, Published)
- Table: Title | Category | Status (badge) | Published Date | Actions (Edit, Delete)
- Status badges: green `bg-green-100 text-green-800` for published, gray `bg-gray-100 text-gray-800` for draft
- Delete requires confirmation (same pattern as AdminTypeApprovalPage)
- Empty state message when no articles exist

**Create/Edit View:**
- Back button to return to list
- Form fields:
  - Title (text input, required)
  - Slug (auto-generated from title on change, editable, show below title in small text)
  - Category (dropdown select)
  - Summary (textarea, 2-3 lines)
  - Body (RichTextEditor component)
  - Featured Image URL (text input, optional — keep simple for v1)
  - Status toggle or dropdown (draft/published)
- On publish: set `published_at` to `new Date().toISOString()`
- On save draft: leave `published_at` as-is
- Save button with loading spinner
- Use `useAuth()` to set `author_id` to `profile.id`
- After save: show success toast, navigate back to list
- Error handling: show error toast, keep form data intact

**Slug generation helper:**
```jsx
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};
```

### `src/pages/admin/DocumentsManagerPage.jsx`

**Follow the `AdminTypeApprovalPage.jsx` pattern exactly.**

**Use `useSupabaseQuery` hook for data fetching.**

Admin page with:

**List View:**
- "Upload Document" button at top
- Search input to filter by title
- Category filter (all 15 document categories)
- Year filter (dropdown of available years)
- Table: Title | Category | Year | File | Actions (Edit, Delete)
- File column: show filename as a clickable download link (`<a href={file_url} target="_blank">`)
- Delete requires confirmation — removes both the DB row AND the file from Supabase Storage

**Upload/Edit Form (modal or separate view):**
- Title (text input, required)
- Category (dropdown with all 15 categories)
- Year (number input, default to current year)
- Description (textarea, optional)
- File upload:
  - For new: file input (`<input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" />`)
  - For edit: show current filename, allow replacing with new upload
  - Client-side validation: max 20MB, allowed types only
  - Show upload progress if possible

**File upload flow:**
```jsx
const uploadDocument = async (file, metadata) => {
  // 1. Generate unique filename
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const filePath = `uploads/${fileName}`;

  // 2. Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 3. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  // 4. Insert row in documents table
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title: metadata.title,
      category: metadata.category,
      year: metadata.year,
      description: metadata.description,
      file_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      uploaded_by: profile.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

**File delete flow:**
```jsx
const deleteDocument = async (doc) => {
  // 1. Extract storage path from URL
  // URL format: {SUPABASE_URL}/storage/v1/object/public/documents/uploads/filename
  const urlParts = doc.file_url.split('/storage/v1/object/public/documents/');
  const storagePath = urlParts[1]; // "uploads/filename"

  // 2. Delete file from Storage
  if (storagePath) {
    await supabase.storage.from('documents').remove([storagePath]);
  }

  // 3. Delete row from DB
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', doc.id);

  if (error) throw error;
};
```

---

## 6. FILES TO MODIFY

### `src/App.jsx`

Add two lazy imports and two routes inside the admin `<Route>` group:

```jsx
// Add with the other lazy imports at the top:
const AdminNews = lazy(() => import('./pages/admin/NewsManagerPage'));
const AdminDocuments = lazy(() => import('./pages/admin/DocumentsManagerPage'));

// Inside the <Route path="/admin" element={<AdminLayout />}> group:
<Route path="news" element={<AdminNews />} />
<Route path="news/:id" element={<AdminNews />} />
<Route path="documents-manage" element={<AdminDocuments />} />
```

**NOTE:** Use `documents-manage` (not `documents`) for the admin route to avoid potential conflicts with any existing `/admin/documents` route or static file paths. If there's no conflict, `documents` is fine.

**SCOPE-LOCK: Only add these imports and routes. Do not change anything else in this file.**

### `src/pages/admin/AdminSidebar.jsx`

**This is the file at `src/pages/admin/AdminSidebar.jsx`** (confirmed active sidebar).

Add navigation links for "News" and "Documents" in the sidebar. Read the existing file to see the exact pattern for nav links (icon component, label text, path, active state class names).

Add them in a logical group — ideally after the existing operational items (Complaints, Applications, etc.) and before any settings/system items. Or create a "Content" section header if the sidebar uses section groupings.

Suggested icons from lucide-react: `Newspaper` for News, `FolderOpen` for Documents.

**SCOPE-LOCK: Only add the two nav items. Do not change existing items, reorder them, or modify styling.**

### `src/pages/public/NewsPage.jsx`

Current state: reads from hardcoded `PLACEHOLDER_NEWS` array. Code already has a comment: "Will fetch from Supabase 'posts' table when populated".

Change to:
1. Import supabase client
2. Add state: `const [articles, setArticles] = useState(PLACEHOLDER_NEWS)` and `const [loading, setLoading] = useState(true)`
3. Add useEffect to fetch on mount:
```jsx
useEffect(() => {
  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        // Map DB columns to the shape PLACEHOLDER_NEWS uses
        const mapped = data.map(post => ({
          // MAP THESE based on actual PLACEHOLDER_NEWS object shape
          // Read NewsPage.jsx to get the exact field names
          title: post.title,
          date: post.published_at,
          category: post.category,
          excerpt: post.summary,
          slug: post.slug,
          // ... etc
        }));
        setArticles(mapped);
      }
      // If data is empty, articles stays as PLACEHOLDER_NEWS (fallback)
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      // Keep PLACEHOLDER_NEWS as fallback — don't crash the page
    } finally {
      setLoading(false);
    }
  };
  fetchArticles();
}, []);
```
4. Add a loading spinner/skeleton while `loading` is true
5. Replace all references to `PLACEHOLDER_NEWS` in the JSX with `articles`
6. **Keep the `PLACEHOLDER_NEWS` array in the file** as a fallback

**SCOPE-LOCK: Only change the data source. Do not redesign the page layout, change styling, or modify filtering/search/pagination functionality.**

### `src/pages/public/DocumentsPage.jsx`

Same pattern as NewsPage:
1. Import supabase client
2. State with fallback: `const [documents, setDocuments] = useState(DOCUMENTS)`
3. Fetch from Supabase on mount, map columns to match existing `DOCUMENTS` object shape
4. Fall back to hardcoded `DOCUMENTS` array on error or empty result
5. Loading state

**SCOPE-LOCK: Only change the data source.**

---

## 7. EXECUTION ORDER

Do these in order. Each step is independently testable. Do NOT skip ahead.

| Step | What | How to Test |
|------|------|-------------|
| **1** | Run the diagnostic SQL from Section 4 Step 0 | See what tables/columns already exist |
| **2** | Run the appropriate SQL (ALTER or CREATE) for `posts` table + RLS + trigger | Check in Supabase Table Editor that the posts table has all required columns |
| **3** | Run the SQL for `documents` table + RLS + trigger | Check in Supabase Table Editor |
| **4** | Run the SQL for Supabase Storage bucket + policies | Check in Supabase Dashboard → Storage that the "documents" bucket exists |
| **5** | `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link` | `npm run dev` still works with no errors |
| **6** | Build `src/components/admin/RichTextEditor.jsx` | Temporarily import it into any existing admin page, confirm toolbar renders and typing/formatting works |
| **7** | Build `src/pages/admin/NewsManagerPage.jsx` | Import it directly in App.jsx (skip sidebar for now), navigate to `/admin/news`, create a test article, verify row appears in Supabase `posts` table |
| **8** | Build `src/pages/admin/DocumentsManagerPage.jsx` | Same — navigate to `/admin/documents-manage`, upload a test PDF, verify it appears in Supabase Storage + `documents` table |
| **9** | Add lazy imports + routes in `src/App.jsx` | Both admin pages accessible via URL |
| **10** | Add sidebar links in `src/pages/admin/AdminSidebar.jsx` | Click "News" and "Documents" in sidebar, pages load correctly |
| **11** | Refactor `src/pages/public/NewsPage.jsx` to fetch from Supabase | Create a published article in admin → verify it shows on public news page. Delete it → verify fallback to PLACEHOLDER_NEWS works |
| **12** | Refactor `src/pages/public/DocumentsPage.jsx` to fetch from Supabase | Upload a document in admin → verify it shows on public documents page |
| **13** | `npm run build` | Build succeeds with no errors (catch any import/type issues) |

---

## 8. IMPORTANT RULES FOR THE AI

1. **Read `AdminTypeApprovalPage.jsx` first** — this is your pattern template. Copy its state management, form structure, CRUD flow, and error handling exactly.
2. **Use `useSupabaseQuery` hook** from `src/hooks/useSupabaseQuery.js` for data fetching. Read the hook file to understand its API. Do NOT use raw `useEffect` + `supabase.from()` in admin pages — use the hook.
3. **Use `lazy()` imports** in `App.jsx` — all admin pages use lazy loading. Don't use direct imports.
4. **Use JSX, not TypeScript** — the frontend is JavaScript.
5. **Use Tailwind CSS** — no inline styles, no CSS modules, no styled-components.
6. **Use Lucide React icons** — `import { Newspaper, FolderOpen, Plus, Trash2, Edit, Eye, Search, Filter, Upload, X, Check, Loader2 } from 'lucide-react'`
7. **Use the existing toast notification system** — `useNotification()` hook. Never use `alert()`.
8. **RLS is on** — all Supabase queries are filtered by the logged-in user's role. The admin must be logged in with an admin/staff account for writes to work.
9. **Keep hardcoded data as fallback** — don't delete `PLACEHOLDER_NEWS` or `DOCUMENTS` arrays. Use them as fallbacks if the Supabase fetch fails or returns empty.
10. **Apostrophes in content**: use `\u2019` in JSX strings, or the actual character `'` in HTML strings.
11. **SCOPE-LOCK**: Only modify the specific files and sections listed in this plan. Do not refactor, rename, reorder, reformat, or "improve" any code outside the requested changes. Do not change import statements in files you're not modifying. Do not "clean up" unrelated code.

---

## 9. PRE-FLIGHT CHECKS (AI must do these before writing code)

**Do not start coding until you have answered ALL of these by reading the actual files:**

| # | Question | File to Read | Why It Matters |
|---|----------|-------------|----------------|
| 1 | What columns does the existing `posts` table have? | `supabase/migrations/001_initial_schema.sql` | Determines whether to ALTER or CREATE |
| 2 | What is the exact shape of `PLACEHOLDER_NEWS` objects? List all field names. | `src/pages/public/NewsPage.jsx` | Must map DB columns to match this shape |
| 3 | What is the exact shape of `DOCUMENTS` objects? List all field names and all category values. | `src/pages/public/DocumentsPage.jsx` | Must map DB columns to match, and CHECK constraint must include all categories |
| 4 | What is the exact API of `useSupabaseQuery`? What parameters does it take? What does it return? | `src/hooks/useSupabaseQuery.js` | Must use this hook correctly in admin pages |
| 5 | What is the exact nav link pattern in the sidebar? (component, props, classes, icon usage) | `src/pages/admin/AdminSidebar.jsx` | Must match identically |
| 6 | How does `AdminTypeApprovalPage.jsx` structure its state? (List all useState calls and their purposes) | `src/pages/admin/AdminTypeApprovalPage.jsx` | Must follow the same pattern |
| 7 | What import path does `AdminLayout.jsx` use for the sidebar? | `src/pages/admin/AdminLayout.jsx` | Confirms which sidebar file to modify |
| 8 | How are other admin routes imported in `App.jsx`? (lazy or direct?) | `src/App.jsx` | Must use same import pattern |

**Report your findings for each question before proceeding to code.**

---

## 10. POTENTIAL ISSUES TO WATCH FOR

- **Slug generation**: Auto-generate slug from title (lowercase, replace spaces with hyphens, remove special chars). Make it editable. Validate uniqueness before saving — if a duplicate slug exists, append a number.
- **Image uploads for news articles**: The `featured_image_url` field exists but building a full image upload adds complexity. For v1, accept a URL string (paste a link). Image upload can be added as a follow-up.
- **Supabase Storage CORS**: If file uploads fail with CORS errors, configure CORS in Supabase Dashboard → Storage → Settings.
- **Large file uploads**: Supabase free tier has a 50MB limit. Add client-side validation: reject files over 20MB, show a clear error message.
- **Public URL format**: Supabase Storage public URLs: `{SUPABASE_URL}/storage/v1/object/public/documents/{path}`
- **Duplicate filenames**: Prepend timestamp to filename: `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
- **Document categories mismatch**: The CHECK constraint categories MUST exactly match what `DocumentsPage.jsx` uses. Read the hardcoded array to get the exact strings. A single typo in a category name will cause inserts to fail silently.
- **RLS policy conflicts**: If policies already exist on the `posts` table from earlier migrations, the DROP POLICY IF EXISTS + CREATE POLICY pattern in Section 4 handles this safely.
- **Empty database on first load**: When the Supabase tables exist but have no data, the public pages should show the hardcoded fallback content — not a blank page. Test this explicitly.

---

## 11. FUTURE PHASES (do NOT build these now)

After News + Documents are working and tested:

- **Phase 2**: Speeches manager, Tenders manager, FAQs manager
- **Phase 3**: Board members / Executive team manager, Careers page content
- **Phase 4**: Homepage section editor, general static page CMS

Each phase follows the same pattern: create admin CRUD page → refactor public page to fetch from Supabase. The patterns you establish in Phase 1 become the template for everything else.
