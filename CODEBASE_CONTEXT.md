# BOCRA Website — Codebase Context Document

> Generated from full repository inspection on 2026-03-21.
> Every claim is backed by a file path. Nothing is invented.

---

## 1. Project Overview

**What it does:** A complete website redesign for **BOCRA — Botswana Communications Regulatory Authority**. It is a React single-page application with a public-facing informational website and a protected admin portal. The admin portal includes an automated workflow engine, AI-powered complaint triage, SLA tracking, and case management.

**Who it's for:**
- **Botswana citizens** — file complaints, report cyber incidents, verify licences, register .BW domains, access regulatory documents
- **BOCRA staff/admin** — manage complaints, licence applications, cyber incidents, QoS reports, and run automated workflows
- **Licensed operators** — (intended but partially built) an operator portal for data submissions

**Main problem it solves:** Replaces BOCRA's legacy website (which had 11 penetration test findings including critical security flaws) with a modern, secure, bilingual (English/Setswana) platform that automates regulatory workflows.

**Maturity level:** **Hackathon prototype / MVP**. Built for a hackathon (`hackbocra` in URLs). The codebase is functional and well-structured, but several features are incomplete (operator portal, scheduled workflows, full CMS). Deployed to GitHub Pages at `byters67.github.io/hackbocra/`. Production deployment instructions exist for Nginx but have not been exercised.

---

## 2. Tech Stack

| Technology | Role | File Reference |
|---|---|---|
| **React 18** | UI framework (JSX, hooks, context) | `package.json` |
| **Vite 5** | Build tool, dev server, HMR | `vite.config.js` |
| **React Router DOM 6** | Client-side routing, nested layouts | `src/App.jsx` |
| **Tailwind CSS 3** | Utility-first styling with custom BOCRA theme | `tailwind.config.js` |
| **Supabase** | Backend-as-a-service: PostgreSQL, Auth, RLS, Edge Functions, Realtime | `src/lib/supabase.js`, `supabase/` |
| **Supabase Edge Functions (Deno)** | Serverless functions for AI triage, chat, form submission, licence review | `supabase/functions/` |
| **Claude API (Anthropic)** | AI complaint classification, RAG chat, licence document review | `supabase/functions/classify-complaint/index.ts` |
| **GSAP** | Scroll-triggered animations, page transitions | `src/hooks/useAnimations.js`, `src/pages/public/HomePage.jsx` |
| **Recharts** | Dashboard charts (pie, bar) in admin portal | `src/pages/admin/DashboardPage.jsx` |
| **Lucide React** | Icon library used across all components | Throughout `src/` |
| **DOMPurify** | XSS protection for HTML rendering | `src/lib/sanitizeHtml.js` |
| **React Markdown** | Markdown rendering in chat widget | `src/components/ui/ChatWidget.jsx` |
| **Google reCAPTCHA v3** | Bot protection on public forms | `src/hooks/useRecaptcha.js`, `index.html` |
| **Vite PWA Plugin** | Progressive Web App with service worker | `vite.config.js` |
| **GitHub Actions** | CI/CD: build, secret scan, npm audit, deploy to GitHub Pages | `.github/workflows/deploy.yml` |
| **Nginx** | Production reverse proxy config (not actively deployed) | `nginx/nginx.conf` |
| **PostCSS + Autoprefixer** | CSS processing pipeline | `postcss.config.js` |
| **@tailwindcss/typography** | Prose styling for CMS/document content | `tailwind.config.js` |
| **pdf-parse** (devDep) | PDF text extraction for RAG knowledge base | `scripts/extract-pdfs.cjs` |

---

## 3. Repository Structure

```
hackbocra-main/
├── .github/workflows/deploy.yml    # CI/CD pipeline (build + deploy to GH Pages)
├── .husky/pre-commit               # Git hooks (husky)
├── nginx/                          # Production Nginx config (F07/F08 remediation)
│   ├── nginx.conf                  # Full HTTPS server block with rate limiting
│   └── snippets/security-headers.conf  # Shared security headers snippet
├── public/
│   ├── documents/                  # ~90 real BOCRA PDFs (regulations, forms, reports)
│   │   ├── type-approval/          # Type approval forms
│   │   └── internet/               # Internet/e-commerce regulations
│   ├── images/                     # (not listed but referenced) Hero images, licence banners
│   └── icons/                      # PWA icons
├── scripts/
│   ├── extract-pdfs.cjs            # Node.js: extract text from PDFs for RAG
│   ├── extract-pdfs.py             # Python alternative for same
│   ├── generate-insert-sql.cjs     # Generate SQL INSERT for document chunks
│   ├── insert-chunks.sql           # 122KB of pre-extracted document chunks
│   ├── upload-chunks.cjs           # Upload chunks to Supabase
│   └── scan-secrets.sh             # Pre-commit secret scanner
├── supabase/
│   ├── functions/
│   │   ├── chat/index.ts           # RAG chatbot (Claude + document chunks)
│   │   ├── classify-complaint/index.ts  # AI complaint triage (Claude)
│   │   ├── review-application/index.ts  # AI licence document review (Claude)
│   │   ├── submit-form/index.ts    # Secure form gateway (reCAPTCHA + rate limit)
│   │   └── translate/index.ts      # Google Translate proxy (deprecated)
│   ├── migrations/
│   │   ├── 001_initial_schema.sql  # Core tables: profiles, pages, posts, complaints, etc.
│   │   ├── 002_page_translations.sql
│   │   ├── 003_admin_portal.sql    # complaint_responses, licence_applications, cyber_incidents
│   │   ├── 003_document_chunks.sql # RAG document storage
│   │   ├── 004_audit_log.sql
│   │   ├── 004_workflow_engine.sql # notifications, workflow_rules, workflow_logs, reports
│   │   ├── 005_rls_hardening.sql
│   │   ├── 006_data_retention_policy.sql
│   │   ├── 007_data_requests.sql
│   │   ├── 008_ai_licence_review.sql
│   │   ├── 008_consultations.sql
│   │   └── 009_ai_triage.sql       # AI classification columns on complaints
│   └── seeds/
│       └── page_translations_tn_examples.sql
├── src/
│   ├── App.jsx                     # Root router — all routes defined here
│   ├── main.jsx                    # React DOM mount point
│   ├── index.css                   # Tailwind directives + custom CSS
│   ├── lib/
│   │   ├── supabase.js             # Supabase client init + rate limiter
│   │   ├── auth.jsx                # AuthProvider + ProtectedRoute + useAuth
│   │   ├── security.js             # Input/error sanitization, RBAC, CSP
│   │   ├── language.jsx            # LanguageProvider + useLanguage (en/tn)
│   │   ├── translations.js         # All UI strings in English + Setswana
│   │   ├── notifications.jsx       # NotificationProvider + Bell + Toasts (Realtime)
│   │   ├── workflow.js             # Workflow engine client (rules, logs, reports)
│   │   ├── sla.js                  # SLA calculation (on_track/warning/at_risk/breached)
│   │   ├── complaintAnalysis.js    # Client-side complaint analysis (keyword heuristics)
│   │   ├── sanitizeHtml.js         # DOMPurify wrapper
│   │   ├── translateService.js     # Deprecated: no-op translation stubs
│   │   └── triageConstants.js      # AI categories, departments, urgencies
│   ├── hooks/
│   │   ├── useAnimations.js        # GSAP scroll reveal + count-up hooks
│   │   ├── useRecaptcha.js         # reCAPTCHA v3 token generation
│   │   ├── usePageContent.js       # (inferred) CMS page content fetcher
│   │   └── useTranslatedContent.js # (inferred) Translation hook
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx          # Navigation, language toggle, search
│   │   │   ├── Footer.jsx          # Site footer with links
│   │   │   └── Layout.jsx          # Public layout wrapper (Header + Outlet + Footer)
│   │   ├── ui/
│   │   │   ├── ChatWidget.jsx      # Floating AI chatbot (calls Edge Function)
│   │   │   ├── AccessibilityWidget.jsx  # 9-feature accessibility panel
│   │   │   ├── VoiceAssistant.jsx  # Voice-based interaction
│   │   │   ├── CookieConsent.jsx   # GDPR-style cookie banner
│   │   │   ├── PageTranslator.jsx  # Page-level translation UI
│   │   │   ├── BocraLogo.jsx       # SVG logo component
│   │   │   ├── ConsentCheckbox.jsx # POPIA consent checkbox
│   │   │   ├── PageHero.jsx        # Reusable hero section
│   │   │   └── pageTranslations.js # Page-specific translations
│   │   ├── animations/
│   │   │   ├── SplashScreen.jsx    # First-visit splash animation
│   │   │   └── PageTransition.jsx  # Route transition wrapper
│   │   └── admin/
│   │       ├── AdminSidebar.jsx    # Dark sidebar nav for admin
│   │       ├── SLABadge.jsx        # SLA status badge component
│   │       └── ReportViewer.jsx    # Weekly report viewer
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx       # Email/password login + registration
│   │   │   └── EmailVerifiedPage.jsx  # Post-email-verification landing
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx     # Protected layout (auth + role check)
│   │   │   ├── AdminSidebar.jsx    # (duplicate of components/admin — see risks)
│   │   │   ├── DashboardPage.jsx   # Smart dashboard with charts + AI insights
│   │   │   ├── ComplaintsPage.jsx  # List + detail view, AI classification, reply
│   │   │   ├── ApplicationsPage.jsx # Licence apps: list/detail, assign, PDF export
│   │   │   ├── ApplicationReview.jsx # AI document review component
│   │   │   ├── IncidentsPage.jsx   # Cyber incident management + CSIRT escalation
│   │   │   ├── QoSReportsPage.jsx  # Quality of Service reports
│   │   │   ├── ContactPage.jsx     # Admin view of contact submissions
│   │   │   ├── DataRequestsPage.jsx # Data request management
│   │   │   ├── AdminTypeApprovalPage.jsx # Type approval admin
│   │   │   ├── AdminConsultationsPage.jsx # Public consultations management
│   │   │   ├── AutomationPage.jsx  # Workflow rules + logs + manual triggers
│   │   │   └── AutomationLogPage.jsx # Detailed automation logs
│   │   └── public/                 # ~35 public-facing pages
│   │       ├── HomePage.jsx        # Landing page with hero, sectors, services, stats
│   │       ├── FileComplaintPage.jsx # Multi-step complaint form
│   │       ├── CybersecurityHubPage.jsx # CVE feed, incident reporting, safety quiz
│   │       ├── LicensingHubPage.jsx # 13 licence types with applications
│   │       ├── ContactPage.jsx     # Contact form
│   │       ├── SearchPage.jsx      # Site-wide search
│   │       └── ... (30+ more sector/content pages)
│   └── data/
│       └── bocra-knowledge.json    # RAG knowledge base
├── docs/
│   └── OWASP_Top10_Mapping.md      # Security mapping document
├── index.html                       # HTML entry point with CSP meta tag
├── tailwind.config.js               # BOCRA brand colors + custom animations
├── vite.config.js                   # Vite config with PWA + base path
├── package.json                     # Dependencies + scripts
├── .env.example                     # Required env vars template
├── README.md                        # Project documentation
├── ADMIN_PORTAL_GUIDE.md            # Admin portal user guide
├── AUTOMATION_ENGINE_GUIDE.md       # Workflow engine documentation
├── GUIDE_AI_EDITING.md              # AI features guide
├── GUIDE_AI_LICENCE_REVIEW (1).md   # Licence review AI guide
├── INTEGRATION.md                   # Integration documentation
└── BOCRA_Technical_Proposal.docx    # Original hackathon proposal
```

### Suspicious/Notable Files
- **`src/pages/admin/AdminSidebar.jsx`** and **`src/components/admin/AdminSidebar.jsx`** — Duplicate sidebar component. The one in `components/admin/` is imported by `AdminLayout.jsx`; the one in `pages/admin/` appears unused.
- **`src/pages/public/ChiefExecutivePage.jsx`** exists at both `src/pages/ChiefExecutivePage.jsx` and `src/pages/public/ChiefExecutivePage.jsx`. Only the `public/` version is imported in `App.jsx`.
- **`src/pages/public/EmailVerifiedPage.jsx`** also exists at `src/pages/auth/EmailVerifiedPage.jsx`. The `auth/` version is the one imported.
- **`src/lib/translateService.js`** — Fully deprecated, all functions are no-ops. Kept for backwards compatibility.
- **`index.css`** at root — duplicate of `src/index.css` (the `src/` version is imported by `main.jsx`).
- **Migration numbering conflict** — Two files numbered `003` (`003_admin_portal.sql` and `003_document_chunks.sql`), two numbered `004`, and two numbered `008`. This could cause ordering issues with `supabase db push`.
- **`GUIDE_AI_LICENCE_REVIEW (1).md`** — Space and parens in filename suggests a download artifact.

---

## 4. How the App Works

### Entry Points
- **`index.html`** → loads `src/main.jsx` → renders `<App />` inside `React.StrictMode`
- `App.jsx` wraps everything in `AuthProvider > LanguageProvider > NotificationProvider`
- First visit shows `SplashScreen` (stored in `sessionStorage` to show only once)
- Then `BrowserRouter` with `basename="/hackbocra"` renders routes

### Request/Data Flow
```
User Action → React Component → Supabase Client (src/lib/supabase.js)
                                      │
                                      ├── Direct CRUD → PostgreSQL (with RLS)
                                      ├── Edge Function call → classify-complaint / chat / submit-form / review-application
                                      └── Realtime subscription → notifications table
```

### Frontend Architecture
- **Public site**: `Layout.jsx` wraps all public pages (Header + content + Footer + ChatWidget + AccessibilityWidget)
- **Admin portal**: `AdminLayout.jsx` provides a separate layout with dark sidebar
- **Routing**: All routes defined in `App.jsx`. Admin routes are nested under `/admin` with `<AdminLayout>` as parent
- **Page pattern**: Each page is a self-contained component with local state, fetching data on mount via `useEffect`

### State Management
- **React Context** for global state:
  - `AuthContext` (`src/lib/auth.jsx`) — user session, signIn/signUp/signOut
  - `LanguageContext` (`src/lib/language.jsx`) — en/tn toggle, `t()` translation function
  - `NotificationContext` (`src/lib/notifications.jsx`) — in-app notifications + toasts + realtime
- **Component-local state** for everything else (useState/useEffect)
- **No Redux/Zustand** — context + local state throughout

### API Integration
- All API calls go through the Supabase JS client (`src/lib/supabase.js`)
- Edge Functions called via `fetch()` to `${supabaseUrl}/functions/v1/{name}`
- Rate limiting: client-side (`checkRateLimit()` in `supabase.js`) + server-side (in `submit-form` Edge Function)
- External APIs: NIST NVD API for CVE data (`CybersecurityHubPage.jsx`), Google DNS (`dns.google`)

### Auth/Session Handling
- **Supabase Auth** with email/password
- Session persisted in `localStorage` by Supabase client (`autoRefreshToken: true, persistSession: true`)
- Admin portal requires fresh session each browser session (`sessionStorage` flag in `AdminLayout.jsx`)
- Role stored in `profiles` table (server-side), NOT in JWT `user_metadata` (V-05 remediation)
- Roles: `user`, `operator`, `staff`, `admin` — defined in `profiles.role` column
- Dev bypass: `VITE_DEV_BYPASS_AUTH=true` on `localhost` only (stripped from prod builds)

### Config/Environment
- **Required env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (see `.env.example`)
- **Edge Function secrets**: `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RECAPTCHA_SECRET_KEY`, `GOOGLE_TRANSLATE_API_KEY` (deprecated)
- **Build-time config**: `base: '/hackbocra/'` in `vite.config.js` (GitHub Pages path)
- **reCAPTCHA site key**: Hardcoded in `src/hooks/useRecaptcha.js` and `index.html` (public key, this is normal)

---

## 5. Local Development Setup

### Prerequisites
- Node.js 20+
- npm

### Steps
```bash
# 1. Clone the repository
git clone <repo-url>
cd hackbocra-main

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your Supabase project URL and anon key:
#   VITE_SUPABASE_URL=https://cyalwtuladeexxfsbrcs.supabase.co
#   VITE_SUPABASE_ANON_KEY=your_anon_key_here

# 4. Start dev server
npm run dev
# Opens at http://localhost:5173/hackbocra/

# 5. Build for production
npm run build

# 6. Preview production build
npm run preview
```

### Dev Auth Bypass
To access the admin portal without Supabase auth during local development, add to `.env.local`:
```
VITE_DEV_BYPASS_AUTH=true
```
This only works on `localhost` and is stripped from production builds. See `src/pages/admin/AdminLayout.jsx:23`.

### Missing/Broken Setup Pieces
- **No `.env.local` included** — you must obtain the Supabase anon key separately
- **No Supabase CLI config** (`supabase/config.toml`) — migrations must be run manually via SQL Editor
- **No test suite** — zero test files exist (`npm test` is not defined in `package.json`)
- **No ESLint config file** — `npm run lint` exists but no `.eslintrc` was found
- **Husky pre-commit** exists (`.husky/pre-commit`) but contents not verified

---

## 6. Key Features

### Confirmed Features (implemented in code)

| Feature | Files | Status |
|---|---|---|
| **Public complaint filing** | `src/pages/public/FileComplaintPage.jsx`, `supabase/functions/submit-form/index.ts` | Complete |
| **AI complaint triage** (Claude) | `supabase/functions/classify-complaint/index.ts`, `src/lib/triageConstants.js` | Complete |
| **Admin complaint management** | `src/pages/admin/ComplaintsPage.jsx` | Complete |
| **AI classification correction** | `src/pages/admin/ComplaintsPage.jsx:427` (ClassificationCorrector) | Complete |
| **Licence application forms** (13 types) | `src/pages/public/LicensingHubPage.jsx` | Complete |
| **Admin licence management** | `src/pages/admin/ApplicationsPage.jsx` | Complete |
| **AI licence document review** | `supabase/functions/review-application/index.ts`, `src/pages/admin/ApplicationReview.jsx` | Complete |
| **Cybersecurity incident reporting** | `src/pages/public/CybersecurityHubPage.jsx` | Complete |
| **Admin incident management + CSIRT escalation** | `src/pages/admin/IncidentsPage.jsx` | Complete |
| **RAG chatbot** (Claude + document chunks) | `supabase/functions/chat/index.ts`, `src/components/ui/ChatWidget.jsx` | Complete |
| **Admin dashboard** with charts + AI insights | `src/pages/admin/DashboardPage.jsx` | Complete |
| **Automated workflow engine** | `supabase/migrations/004_workflow_engine.sql`, `src/lib/workflow.js`, `src/pages/admin/AutomationPage.jsx` | Complete |
| **SLA tracking** | `src/lib/sla.js`, `src/components/admin/SLABadge.jsx` | Complete |
| **Weekly report generation** | `src/lib/workflow.js:99` (generateWeeklyReport) | Complete |
| **Bilingual support** (EN/TN) | `src/lib/language.jsx`, `src/lib/translations.js` | Complete |
| **Accessibility widget** (9 features) | `src/components/ui/AccessibilityWidget.jsx` | Complete |
| **PWA** (offline-capable) | `vite.config.js` (VitePWA plugin) | Complete |
| **reCAPTCHA v3** bot protection | `src/hooks/useRecaptcha.js`, `supabase/functions/submit-form/index.ts` | Complete |
| **POPIA consent** | `src/components/ui/ConsentCheckbox.jsx` | Complete |
| **Real CVE feed** | `src/pages/public/CybersecurityHubPage.jsx:44` (fetchCVEs from NVD) | Complete |
| **Realtime notifications** | `src/lib/notifications.jsx` (Supabase Realtime) | Complete |
| **Role-based access control** | `src/lib/auth.jsx` (ProtectedRoute), `src/lib/security.js` (ROLES) | Complete |
| **Security hardening** (11 pentest remediations) | `src/lib/security.js`, `nginx/`, `index.html` CSP | Complete |
| **Contact form** | `src/pages/public/ContactPage.jsx` | Complete |
| **Document library** (90+ real PDFs) | `public/documents/`, `src/pages/public/DocumentsPage.jsx` | Complete |
| **Telecom statistics** | `src/pages/public/TelecomStatisticsPage.jsx` | Complete |
| **Licence verification** | `src/pages/public/LicenceVerificationPage.jsx` | Complete |
| **Type approval search** | `src/pages/public/TypeApprovalPage.jsx` | Complete |
| **Splash screen animation** | `src/components/animations/SplashScreen.jsx` | Complete |
| **Search** | `src/pages/public/SearchPage.jsx` | Complete |

### Assumed/Intended Features (referenced but incomplete)

| Feature | Evidence | Status |
|---|---|---|
| **Operator portal** | Route at `/services/asms-webcp` → `OperatorPortalPage.jsx` | Likely stub/placeholder |
| **CMS content management** | `pages` table in DB, `ContentPage.jsx` used as catch-all | Schema exists, no admin UI for editing |
| **Google Translate integration** | `supabase/functions/translate/index.ts`, `.env.example` mentions it | Deprecated — functions are no-ops |
| **Scheduled workflow execution** | Workflow rules have `schedule.weekly` trigger | Database functions exist, no cron/scheduler configured |
| **Email notifications** | `action_params` reference `"channels": ["in_app","email"]` | Only in-app implemented; email uses `mailto:` links |
| **QoS data ingestion** | `kpi_data` table, `operators` table seeded | Schema exists, no ingestion pipeline |
| **Data retention policy** | `006_data_retention_policy.sql` | Migration exists, enforcement not verified |

---

## 7. Important Business Logic

### AI Complaint Triage Pipeline
1. Citizen submits complaint via `FileComplaintPage.jsx`
2. Frontend calls `submit-form` Edge Function (server-side reCAPTCHA + rate limit)
3. On success, frontend calls `classify-complaint` Edge Function
4. Edge Function sends complaint to Claude API with structured prompt
5. Claude returns: category, department, urgency (1-5), summary, confidence (0-100)
6. Results validated against `VALID_CATEGORIES` / `VALID_DEPARTMENTS` lists
7. Operator name normalized via `OPERATOR_ALIASES` map
8. If confidence < 70%, flagged as `needs_review`
9. Auto-assigned to staff member matching department's sector
10. **File**: `supabase/functions/classify-complaint/index.ts`

### SLA Calculation
- Targets in minutes: complaints (14 days standard, 3 days urgent), cyber incidents (24h critical → 14 days low), licence apps (30 days)
- Status thresholds: on_track (>50% remaining), warning (25-50%), at_risk (<25%), breached (0%)
- **File**: `src/lib/sla.js`

### Automated Escalation (`check_escalations()`)
- PostgreSQL function that scans all open cases
- Escalates complaints idle beyond threshold to "escalated" status
- Bumps cyber incident urgency one level (low→medium→high→critical)
- Creates in-app notifications for all admin/staff users
- Logs all actions to `workflow_logs` table
- **File**: `supabase/migrations/004_workflow_engine.sql:184`

### Reference Number Generation
- Format: `BOCRA/CMP/2026/00001` (complaints), `BOCRA/LIC/...` (licences), `BOCRA/CYB/...` (incidents)
- Generated by PostgreSQL trigger on INSERT using sequences
- **File**: `supabase/migrations/004_workflow_engine.sql:125`

### Client-Side Complaint Analysis (fallback)
- Keyword-based heuristic analysis when AI classification unavailable
- Detects category from 10 keyword lists, urgency from signal words
- Generates summary, identifies core issue, suggests regulatory action
- Cached in `localStorage` per complaint ID
- **File**: `src/lib/complaintAnalysis.js`

### Role-Based Access Control
- 4 roles: `user` (public), `operator` (licensed), `staff` (BOCRA), `admin` (full)
- Frontend: `ProtectedRoute` component fetches role from `profiles` table (not JWT metadata)
- Backend: Supabase RLS policies on every table check `profiles.role`
- Admin portal: `AdminLayout.jsx` verifies `role IN ('admin', 'staff')`
- **Files**: `src/lib/auth.jsx`, `src/lib/security.js`, `supabase/migrations/001_initial_schema.sql`

---

## 8. Risks / Code Smells / Gaps

### Security Concerns
1. **reCAPTCHA site key mismatch**: `index.html:65` uses site key `6LfPP5EsAAA...` but `useRecaptcha.js:12` uses `6LfmO44sAAA...`. These are different keys — one will fail verification.
2. **Supabase URL in `.env.example`**: The actual project URL (`cyalwtuladeexxfsbrcs.supabase.co`) is committed. This is the project identifier (not a secret), but it reveals the backend endpoint.
3. **CSP triplicate sync**: CSP is defined in 3 places (`index.html`, `nginx/snippets/security-headers.conf`, and `src/lib/security.js`). They're already slightly out of sync (the HTML version includes `wss://*.supabase.co`, `api.anthropic.com`, `services.nvd.nist.gov`, `dns.google` which the nginx version doesn't).
4. **Client-side rate limiting is bypassable**: The `checkRateLimit()` in `supabase.js` is defence-in-depth, but the real protection is in the `submit-form` Edge Function. Direct Supabase calls from other pages (e.g. contact form) may not go through the Edge Function.

### Architectural Issues
5. **No test suite**: Zero tests. `package.json` has no test script. This is the single biggest gap.
6. **Migration numbering conflicts**: Two `003_*` files, two `004_*` files, two `008_*` files in `supabase/migrations/`. Supabase CLI orders migrations by filename — collisions will cause problems.
7. **Duplicate components**: `AdminSidebar.jsx` exists in both `src/components/admin/` and `src/pages/admin/`. The pages version appears unused but could cause confusion.
8. **No Supabase config.toml**: Without this, `supabase db push` won't work. Migrations need manual execution.
9. **Hardcoded base path**: `/hackbocra/` is baked into `vite.config.js`, `App.jsx`, and `index.html`. Deploying to a different path requires changes in multiple places.

### Code Quality
10. **Large monolithic page components**: `ComplaintsPage.jsx` (495 lines), `ApplicationsPage.jsx` (641 lines), `IncidentsPage.jsx` (590 lines) each contain list view, detail view, and sub-components in one file.
11. **Inconsistent status enums**: `complaints` table has `CHECK (status IN ('pending', 'investigating', 'resolved', 'closed'))` in migration 001, but migration 004 changes it to include `'new', 'submitted', 'in_review', 'assigned', 'in_progress', 'escalated'`. The frontend `ComplaintsPage.jsx` uses the expanded set.
12. **`alert()` for error handling**: Several admin pages use `alert()` instead of the toast notification system that already exists.
13. **Email replies via `mailto:`**: Admin reply functionality opens the user's email client rather than sending programmatically. This means replies aren't tracked in the system.

### Incomplete Features
14. **Operator Portal**: `OperatorPortalPage.jsx` is routed but likely a placeholder — operators have a DB role but no dedicated functionality.
15. **CMS admin**: The `pages` and `posts` tables exist but there's no admin UI for content management.
16. **Scheduled workflows**: Rules like "Weekly summary report" have `schedule.weekly` trigger but no cron job or pg_cron configured.
17. **QoS data pipeline**: `kpi_data` table exists but no ingestion mechanism or API for operators to submit data.
18. **Voice Assistant**: `VoiceAssistant.jsx` exists but unclear if fully integrated.

### Documentation Gaps
19. **No API documentation**: The `/api-docs` route maps to `ContentPage` (404-like). No actual API docs exist.
20. **No database schema diagram**: The schema is spread across 9+ migration files.
21. **No contribution guide** or code standards document.

---

## 9. Immediate Next Steps (Prioritized)

| # | Action | Impact | Effort | Files |
|---|---|---|---|---|
| 1 | **Add test suite** (Vitest + React Testing Library) | Critical — no confidence in refactoring | Medium | New: `vitest.config.js`, `src/**/*.test.jsx` |
| 2 | **Fix reCAPTCHA key mismatch** | High — one form protection is broken | Low | `index.html:65`, `src/hooks/useRecaptcha.js:12` |
| 3 | **Fix migration numbering** | High — blocks Supabase CLI usage | Low | Rename files in `supabase/migrations/` |
| 4 | **Add Supabase config.toml** | High — enables `supabase db push` | Low | New: `supabase/config.toml` |
| 5 | **Replace `alert()` with toast notifications** | Medium — inconsistent UX | Low | `ComplaintsPage.jsx`, `ApplicationsPage.jsx`, `IncidentsPage.jsx` |
| 6 | **Sync CSP across all 3 locations** | Medium — security inconsistency | Low | `index.html`, `nginx/snippets/security-headers.conf`, `src/lib/security.js` |
| 7 | **Remove duplicate files** | Medium — reduces confusion | Low | Delete `src/pages/admin/AdminSidebar.jsx`, `src/pages/ChiefExecutivePage.jsx`, root `index.css` |
| 8 | **Configure pg_cron for scheduled workflows** | Medium — enables automated escalations and weekly reports | Medium | Supabase dashboard + new migration |
| 9 | **Build programmatic email sending** (via Edge Function) | Medium — currently no email tracking | Medium | New Edge Function |
| 10 | **Extract large page components** into smaller modules | Low (quality) — improves maintainability | Medium | Split list/detail views in admin pages |

---

## 10. AI Handoff Summary

**For another AI assistant picking up this project:**

### Quick Start
```bash
npm install && npm run dev  # Needs .env.local with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
```

### Architecture in 30 Seconds
- React 18 SPA + Tailwind + Supabase (PostgreSQL + Auth + Edge Functions + Realtime)
- All routes in `src/App.jsx`. Public pages under `/`, admin under `/admin`
- Auth via Supabase with role-based access from `profiles` table
- 4 Supabase Edge Functions (Deno/TypeScript) handle AI + form submissions
- Claude API used for: complaint triage, RAG chatbot, licence doc review
- Security-conscious: pentest-remediated, RLS on all tables, CSP, input sanitization

### Key Files to Touch
- **Routing**: `src/App.jsx`
- **Auth**: `src/lib/auth.jsx`
- **Database client**: `src/lib/supabase.js`
- **Database schema**: `supabase/migrations/001_initial_schema.sql` + `003_admin_portal.sql` + `004_workflow_engine.sql`
- **AI integration**: `supabase/functions/classify-complaint/index.ts`
- **Styling**: `tailwind.config.js` (BOCRA brand colors: blue `#00458B`, cyan `#00A6CE`, magenta `#C8237B`, yellow `#F7B731`, green `#6BBE4E`)

### Critical Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- `supabase functions deploy classify-complaint` — deploy AI triage
- `supabase functions deploy chat` — deploy RAG chatbot

### Top Risks
- No tests
- reCAPTCHA key mismatch between HTML and JS
- Migration numbering conflicts
- No cron for scheduled workflows

---

## Executive Summary (1 Page)

The BOCRA hackathon project is a **fully functional prototype** of a government regulatory website for Botswana's communications authority. Built with React, Tailwind CSS, and Supabase, it features a comprehensive public website with bilingual support (English/Setswana) and a sophisticated admin portal.

The standout features are the **AI-powered complaint triage system** (using Claude to automatically classify, route, and summarize consumer complaints), a **RAG chatbot** (answering citizen questions from 90+ real BOCRA documents), and an **automated workflow engine** (with escalation rules, SLA tracking, and report generation).

Security was a first-class concern — the codebase systematically addresses 11 findings from a real penetration test, implementing RLS on all database tables, input sanitization, CSP headers, and server-side rate limiting.

The primary weaknesses are the **complete absence of tests**, some **duplicate/inconsistent files**, and **partially implemented features** (operator portal, CMS admin, scheduled workflows, programmatic email). The project is deployed to GitHub Pages via GitHub Actions CI/CD, with a production-ready Nginx configuration prepared but not deployed.

For a hackathon submission, this is exceptional in scope and quality. To move toward production, the priorities are: adding tests, fixing the reCAPTCHA mismatch, resolving migration conflicts, and implementing scheduled workflow execution.

---

## Critical Files to Read First

1. `src/App.jsx` — All routes, understand the full app structure
2. `src/lib/supabase.js` — How the backend is connected
3. `src/lib/auth.jsx` — Auth flow + role-based protection
4. `supabase/migrations/001_initial_schema.sql` — Core database schema
5. `supabase/migrations/004_workflow_engine.sql` — Workflow engine + escalation logic
6. `supabase/functions/classify-complaint/index.ts` — AI triage pipeline
7. `src/pages/admin/DashboardPage.jsx` — How all data comes together
8. `src/lib/security.js` — Security implementation map
9. `vite.config.js` — Build config, PWA, base path
10. `.github/workflows/deploy.yml` — CI/CD pipeline

---

## Questions That Remain Unanswered from the Codebase

1. **Where is the Supabase anon key?** — Not in the repo (correctly), but `.env.example` shows the project URL. The actual key must be obtained from the Supabase dashboard or team.
2. **Is the `profiles.sector` column used for auto-routing?** — The `classify-complaint` Edge Function queries `profiles?sector=eq.${sector}`, but no migration creates a `sector` column on `profiles`. Was it added manually?
3. **Are the Supabase Edge Functions actually deployed?** — Deploy commands are documented but there's no evidence of deployment status.
4. **What does `usePageContent.js` do exactly?** — Not read in detail; likely fetches CMS content from the `pages` table.
5. **Is the `data_retention_policy` migration (`006`) actually enforcing anything?** — Referenced but contents not fully inspected.
6. **What is `bocra-knowledge.json` in `src/data/`?** — Listed but not read; likely static knowledge for the chatbot.
7. **Is `pg_cron` available on this Supabase plan?** — Needed for scheduled workflows but not mentioned.
8. **Who manages DNS for the production domain `bocra.org.bw`?** — Email security recommendations in `security.js` reference DNS changes that need a DNS admin.
9. **Is the `audit_log` migration (004) actually capturing audit events?** — Table exists but no triggers or application code was observed writing to it.
10. **What is the status of the `.BW` domain registration feature?** — `RegisterBWPage.jsx` exists but unclear if it connects to any real domain registrar API.
