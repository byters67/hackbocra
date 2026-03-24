# BOCRA Platform — Project Structure

> **Botswana Communications Regulatory Authority** — Website & Admin Portal
> React 18 + Vite + Supabase + Tailwind CSS

---

## Root

```
hackbocra-main/
├── index.html                  # Vite entry HTML (SPA shell)
├── index.css                   # Root stylesheet (imported by index.html)
├── package.json                # Dependencies & scripts (dev/build/preview/lint)
├── vite.config.js              # Vite config (PWA, console-strip, proxy)
├── tailwind.config.js          # Tailwind theme & BOCRA colour tokens
├── postcss.config.js           # PostCSS → Tailwind + Autoprefixer
├── .env                        # Environment vars (Supabase URL/keys, reCAPTCHA)
├── .gitignore
├── TASKS.md                    # Implementation roadmap (8 phases)
├── ARCHITECTURE.md             # High-level architecture overview
├── README.md                   # Project intro & setup instructions
└── ...docs (*.md)              # Guides, proposals, context docs
```

---

## `src/` — Application Source

### Entry Point

```
src/
├── main.jsx                    # React root – mounts <App /> with providers
├── App.jsx                     # Router (react-router-dom v6), route definitions,
│                               #   auth guards, lazy loading, Layout wrapper
└── index.css                   # Tailwind directives + global utility classes
```

### `src/components/` — Reusable Components

```
src/components/
├── admin/                      # Admin-specific components
│   ├── AdminSidebar.jsx        #   Sidebar navigation for admin panel
│   ├── ReportViewer.jsx        #   Embedded report/PDF viewer
│   ├── RichTextEditor.jsx      #   TipTap WYSIWYG editor for CMS
│   └── SLABadge.jsx            #   SLA status indicator badge
│
├── animations/                 # Motion / transition components
│   ├── PageTransition.jsx      #   GSAP-powered route transitions
│   └── SplashScreen.jsx        #   Initial loading animation
│
├── layout/                     # Structural layout components
│   ├── Header.jsx              #   Top nav bar, language toggle, auth links
│   ├── Footer.jsx              #   Site footer, quick links, contact
│   └── Layout.jsx              #   Page shell (Header + main + Footer)
│
└── ui/                         # Shared UI primitives
    ├── AccessibilityWidget.jsx #   A11y toolbar (font size, contrast, etc.)
    ├── BocraLogo.jsx           #   SVG logo component
    ├── Breadcrumb.jsx          #   Breadcrumb navigation
    ├── ChatWidget.jsx          #   AI chatbot (calls Supabase chat function)
    ├── ConsentCheckbox.jsx     #   GDPR/POPIA consent toggle
    ├── CookieConsent.jsx       #   Cookie banner
    ├── ErrorBoundary.jsx       #   React error boundary wrapper
    ├── PageHero.jsx            #   Hero/banner section for pages
    ├── PageLoader.jsx          #   Loading spinner / skeleton
    ├── PageTranslator.jsx      #   Language-aware content renderer
    ├── pageTranslations.js     #   Static translation map for UI chrome
    ├── RecaptchaBadge.jsx      #   reCAPTCHA v3 badge display
    └── VoiceAssistant.jsx      #   Text-to-speech accessibility feature
```

### `src/pages/` — Route Pages

```
src/pages/
├── public/                     # Citizen-facing (no auth required)
│   ├── HomePage.jsx            #   Landing page — hero, stats, quick links
│   ├── FileComplaintPage.jsx   #   Complaint submission form
│   ├── ConsultationsPage.jsx   #   Public consultations list & submissions
│   ├── DocumentsPage.jsx       #   Regulations, reports, publications
│   ├── NewsPage.jsx            #   News articles
│   ├── NewsEventsPage.jsx      #   News & events combined view
│   ├── FAQsPage.jsx            #   Frequently asked questions
│   ├── SearchPage.jsx          #   Site-wide search
│   ├── ContactPage.jsx         #   Contact info & form
│   ├── CareersPage.jsx         #   Job openings
│   ├── TendersPage.jsx         #   Active tenders
│   ├── SpeechesPage.jsx        #   CEO/board speeches
│   │
│   ├── # Sector pages
│   ├── TelecommunicationsPage.jsx
│   ├── BroadcastingPage.jsx
│   ├── PostalPage.jsx
│   ├── InternetPage.jsx
│   ├── CybersecurityHubPage.jsx
│   ├── TelecomStatisticsPage.jsx
│   ├── QoSMonitoringPage.jsx   #   Quality of Service dashboard
│   ├── SpectrumManagementPage.jsx
│   ├── InfrastructureSharingPage.jsx
│   │
│   ├── # Licensing & compliance
│   ├── LicensingHubPage.jsx
│   ├── LicensingFrameworkPage.jsx
│   ├── IctLicensingPage.jsx
│   ├── LicenceVerificationPage.jsx
│   ├── TypeApprovalPage.jsx
│   ├── RegisterBWPage.jsx      #   .BW domain registration info
│   ├── RegistryPortalPage.jsx
│   ├── OperatorPortalPage.jsx
│   │
│   ├── # About BOCRA
│   ├── AboutProfilePage.jsx
│   ├── HistoryPage.jsx
│   ├── BoardOfDirectorsPage.jsx
│   ├── ChiefExecutivePage.jsx
│   ├── ExecutiveManagementPage.jsx
│   ├── OrganogramPage.jsx
│   ├── LegislationPage.jsx
│   │
│   ├── # Consumer protection & data
│   ├── ConsumerEducationPage.jsx
│   ├── DataProtectionPage.jsx
│   ├── DataRequestPage.jsx     #   POPIA data subject requests
│   ├── PrivacyNoticePage.jsx
│   │
│   ├── # Other
│   ├── ContentPage.jsx         #   CMS-driven dynamic pages
│   ├── ApiDocsPage.jsx         #   Public API documentation
│   └── EmailVerifiedPage.jsx   #   Post-email-verification landing
│
├── admin/                      # Admin portal (auth required)
│   ├── AdminLayout.jsx         #   Admin shell with sidebar
│   ├── AdminSidebar.jsx        #   Admin nav sidebar (duplicate — see components)
│   ├── DashboardPage.jsx       #   Admin dashboard — KPIs, charts
│   ├── ComplaintsPage.jsx      #   Complaint management & triage
│   ├── ApplicationsPage.jsx    #   Licence applications list
│   ├── ApplicationReview.jsx   #   Single application detail/review
│   ├── AdminConsultationsPage.jsx # Consultation CRUD
│   ├── DocumentsManagerPage.jsx   # Document upload & management
│   ├── NewsManagerPage.jsx     #   News article CRUD
│   ├── JobsManagerPage.jsx     #   Job posting management
│   ├── TendersManagerPage.jsx  #   Tender management
│   ├── AdminRegistrarsPage.jsx #   Domain registrar management
│   ├── AdminTypeApprovalPage.jsx  # Type approval applications
│   ├── QoSReportsPage.jsx      #   Quality of Service reports
│   ├── DataRequestsPage.jsx    #   POPIA request handling
│   ├── IncidentsPage.jsx       #   Cybersecurity incident tracker
│   ├── ContactPage.jsx         #   Admin contact submissions view
│   ├── AutomationPage.jsx      #   Workflow automation config
│   └── AutomationLogPage.jsx   #   Automation execution logs
│
└── auth/                       # Authentication pages
    ├── LoginPage.jsx           #   Admin login (Supabase Auth)
    └── EmailVerifiedPage.jsx   #   Email verification callback
```

### `src/hooks/` — Custom React Hooks

```
src/hooks/
├── useAnimations.js            # GSAP animation utilities
├── usePageContent.js           # Fetch CMS page content from Supabase
├── useRecaptcha.js             # reCAPTCHA v3 token management
├── useSupabaseQuery.js         # Generic Supabase query wrapper
└── useTranslatedContent.js     # Auto-translate content via language context
```

### `src/lib/` — Shared Libraries & Utilities

```
src/lib/
├── supabase.js                 # Supabase client singleton
├── auth.jsx                    # AuthProvider context + useAuth hook
├── language.jsx                # LanguageProvider (EN/TN) + useLanguage hook
├── translations.js             # Translation strings (English + Setswana)
├── triageConstants.js          # Complaint triage rules (provider → category mapping)
├── complaintAnalysis.js        # AI-assisted complaint classification helpers
├── notifications.jsx           # Toast notification context + provider
├── security.js                 # CSP, CORS, input sanitisation helpers
├── sanitizeHtml.js             # DOMPurify HTML sanitiser wrapper
├── validation.js               # Form validation rules (phone, email, etc.)
├── circuitBreaker.js           # API call circuit breaker pattern
├── sla.js                      # SLA calculation utilities
├── workflow.js                 # Workflow engine state machine
└── translateService.js         # Calls Supabase translate edge function
```

### `src/data/` — Static Data

```
src/data/
└── bocra-knowledge.json        # Knowledge base for the AI chatbot
```

---

## `supabase/` — Backend (Supabase)

### Edge Functions (Deno runtime)

```
supabase/functions/
├── _shared/
│   └── fetchWithRetry.ts       # Shared HTTP fetch with retry + backoff
├── chat/index.ts               # AI chatbot (Claude-powered)
├── classify-complaint/index.ts # AI complaint triage & classification
├── health/index.ts             # Health check endpoint
├── review-application/index.ts # AI-assisted licence application review
├── submit-form/index.ts        # Generic form submission handler
└── translate/index.ts          # Real-time EN↔TN translation (Claude)
```

### Database Migrations (PostgreSQL)

```
supabase/migrations/
├── 001_initial_schema.sql      # Core tables (complaints, profiles, etc.)
├── 002_page_translations.sql   # CMS page translation storage
├── 003_admin_portal.sql        # Admin tables & roles
├── 003_document_chunks.sql     # Document chunking for search/RAG
├── 004_audit_log.sql           # Audit trail table
├── 004_workflow_engine.sql     # Workflow state machine tables
├── 005_rls_hardening.sql       # Row-Level Security policies
├── 006_data_retention_policy.sql # Auto-purge & retention rules
├── 007_data_requests.sql       # POPIA data subject requests
├── 008_ai_licence_review.sql   # AI review scores & history
├── 008_consultations.sql       # Public consultation tables
├── 009_ai_triage.sql           # AI triage results storage
├── 010_cms_content.sql         # CMS content tables
├── 011_job_openings.sql        # Careers/job posting tables
├── 012_tenders.sql             # Tender management tables
├── 013_fix_profile_role_escalation.sql  # Security fix
├── 014_fix_tender_column_types.sql      # Schema fix
├── 015_rate_limiting.sql       # Rate limit tracking table
├── 016_performance_indexes.sql # Query performance indexes
└── 017_error_logs.sql          # Application error logging
```

### Seeds

```
supabase/seeds/
└── page_translations_tn_examples.sql  # Sample Setswana translations
```

---

## `public/` — Static Assets

```
public/
├── 404.html                    # Custom 404 page
├── bocra-logo.png              # Main logo
├── BOCRA LOGO.png              # Alt logo variant
├── favicon.svg                 # Favicon
├── manifest.json               # PWA manifest
├── offline.html                # Offline fallback (service worker)
├── sw.js                       # Service worker (PWA)
├── robots.txt                  # Crawler directives
├── *.jpeg / *.png / *.webp     # Hero images, section banners
├── documents/                  # ~100+ regulatory PDFs, reports, forms
│   ├── *.pdf                   #   Acts, regulations, guidelines, reports
│   └── *.doc                   #   Application forms
├── images/                     # Board member photos, team images
│   └── board/                  #   Board of directors headshots
└── speeches/                   # Speech transcripts & documents
```

---

## `scripts/` — Build & Utility Scripts

```
scripts/
├── extract-pdfs.cjs            # Extract text from PDFs (Node.js)
├── extract-pdfs.py             # Extract text from PDFs (Python)
├── generate-insert-sql.cjs     # Generate SQL INSERT from extracted text
├── insert-chunks.sql           # Bulk insert document chunks
├── upload-chunks.cjs           # Upload chunks to Supabase
├── load-test.js                # API load testing script
├── scan-secrets.sh             # Scan codebase for leaked secrets
└── uptime-check.js             # Endpoint uptime monitoring
```

---

## `nginx/` — Production Server Config

```
nginx/
├── nginx.conf                  # Main Nginx configuration
└── snippets/
    └── security-headers.conf   # Security headers (CSP, HSTS, etc.)
```

---

## Config & CI/CD

```
.github/workflows/
└── deploy.yml                  # GitHub Actions deploy pipeline

.husky/
└── pre-commit                  # Pre-commit hook (lint)

.vscode/
└── extensions.json             # Recommended VS Code extensions

.claude/
├── settings.json               # Claude Code project settings
└── settings.local.json         # Local overrides
```

---

## Tech Stack Summary

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework   | React 18 + Vite 5                    |
| Routing     | React Router v6                      |
| Styling     | Tailwind CSS 3.4                     |
| State       | React Query (TanStack Query v5)      |
| Backend     | Supabase (Postgres + Auth + Storage) |
| Edge Funcs  | Supabase Edge Functions (Deno)       |
| AI          | Claude API (chat, triage, translate) |
| Charts      | Recharts 2.12                        |
| Rich Text   | TipTap (ProseMirror)                 |
| Animation   | GSAP 3.12                            |
| PWA         | vite-plugin-pwa                      |
| A11y        | @axe-core/react (dev)                |
| Icons       | Lucide React                         |
| Deploy      | GitHub Pages / Nginx                 |

---

## Key Architectural Patterns

- **Bilingual-first:** All citizen-facing content supports English and Setswana via `LanguageProvider` context
- **AI-augmented:** Complaint triage, chatbot, licence review, and translation all powered by Claude edge functions
- **CMS-driven:** Content pages are editable via admin portal with TipTap rich text editor
- **RLS-secured:** All Supabase tables use Row-Level Security; admin routes guarded by auth context
- **PWA-enabled:** Offline fallback, service worker caching, installable on mobile
- **Circuit-breaker resilient:** External API calls wrapped in circuit breaker pattern to prevent cascade failures
