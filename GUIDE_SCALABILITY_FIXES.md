# BOCRA Website — Scalability Fixes Implementation Guide

> Covers all 23 issues from the Scalability Audit **except #6 (i18n)** which is being handled separately.
>
> **Prerequisites:** `CODEBASE_CONTEXT.md`, `BOCRA_Scalability_Audit.md`

---

## Table of Contents

1. [Implementation Phases](#1-implementation-phases)
2. [Phase 1 — Crash Prevention (Issues #3, #12, #9, #18)](#2-phase-1--crash-prevention)
3. [Phase 2 — Security Hardening (Issues #1, #5, #4, #11)](#3-phase-2--security-hardening)
4. [Phase 3 — Performance (Issues #2, #8, #17, #14, #15, #19)](#4-phase-3--performance)
5. [Phase 4 — Data Architecture (Issue #10)](#5-phase-4--data-architecture)
6. [Phase 5 — SEO & Accessibility (Issues #7, #16, #13)](#6-phase-5--seo--accessibility)
7. [Phase 6 — Code Quality (Issues #20, #21, #22, #23)](#7-phase-6--code-quality)
8. [AI-Assisted Prompts](#8-ai-assisted-prompts)
9. [Verification Checklist](#9-verification-checklist)

---

## 1. Implementation Phases

The audit's priority order is mostly right but has a sequencing problem: it puts code splitting (#2) before crash prevention (#3, #9, #12). Code splitting introduces `Suspense` boundaries and lazy loading, which create new async failure points. If you don't have error boundaries and try/catch in place first, code splitting will make your white-screen problem worse, not better.

Corrected order:

| Phase | Issues | Time | What It Fixes |
|-------|--------|------|---------------|
| **1. Crash Prevention** | #3, #12, #9, #18 | 5–6 hrs | White screens, memory leaks, unhandled errors |
| **2. Security** | #1, #5, #4, #11 | 4–5 hrs | XSS, unvalidated forms, spammable endpoints, hardcoded keys |
| **3. Performance** | #2, #8, #17, #14, #15, #19 | 10–12 hrs | Bundle size, caching, re-renders, console noise |
| **4. Data Architecture** | #10 | 1–2 days | Hardcoded content → Supabase |
| **5. SEO & Accessibility** | #7, #16, #13 | 1–1.5 days | Google indexing, screen readers, image sizes |
| **6. Code Quality** | #20, #21, #22, #23 | Ongoing | Dedicated pages, TypeScript, DRY patterns |

**i18n (#6):** Excluded — you are finishing translations first. Slot it in after Phase 2 when ready.

---

## 2. Phase 1 — Crash Prevention

**Goal:** No user action should ever produce a white screen.

### Issue #3 — Error Boundaries

**Create:** `src/components/ui/ErrorBoundary.jsx`

```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // TODO: Send to error reporting service (Sentry, LogRocket, etc.)
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
            <h2 className="text-xl font-display text-red-800 mb-3">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-6">
              This section encountered an error. Your data is safe.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 bg-bocra-blue text-white rounded-xl
                         hover:bg-blue-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Where to add it — three levels:**

1. **App-level** (catch-all) — in `App.jsx`, wrap the entire `<BrowserRouter>`:

```jsx
import ErrorBoundary from './components/ui/ErrorBoundary';

// Outermost wrapper
<ErrorBoundary>
  <BrowserRouter basename="/hackbocra">
    {/* ... */}
  </BrowserRouter>
</ErrorBoundary>
```

2. **Layout-level** — in `Layout.jsx` and `AdminLayout.jsx`, wrap `<Outlet />`:

```jsx
<ErrorBoundary>
  <Outlet />
</ErrorBoundary>
```

This way a page crash doesn't kill the header/footer/sidebar.

3. **Widget-level** — wrap independent widgets that fetch data:

```jsx
// In Layout.jsx
<ErrorBoundary>
  <ChatWidget />
</ErrorBoundary>
<ErrorBoundary>
  <AccessibilityWidget />
</ErrorBoundary>
```

---

### Issue #12 — Unhandled Async Errors (11 of 27 calls)

The audit identifies 11 async Supabase/fetch calls with no try/catch. The pattern to apply everywhere:

**Before (crashes on network error):**
```jsx
useEffect(() => {
  async function load() {
    const { data } = await supabase.from('table').select('*');
    setItems(data);
  }
  load();
}, []);
```

**After:**
```jsx
useEffect(() => {
  async function load() {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('table').select('*');
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load items:', err);
      setError('Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);
```

**Files to fix** (from the audit — check each one):

The audit says 11 of 27 calls are missing try/catch but doesn't list all 11 files. Cross-reference with the codebase context. The most likely offenders based on the architecture are:

- `QoSMonitoringPage.jsx` (fetches QoS data)
- `QoSReportsPage.jsx` (fetches reports)
- `DocumentsPage.jsx` (fetches documents)
- `ConsultationsPage.jsx` (fetches consultations)
- `OperatorPortalPage.jsx` (fetches operator data)
- `DataRequestPage.jsx` (fetches/submits data requests)
- `AdminTypeApprovalPage.jsx` (fetches approvals)
- `TypeApprovalPage.jsx` (fetches equipment)
- `AdminConsultationsPage.jsx` (fetches consultations)
- `CybersecurityHubPage.jsx` (fetches CVE data from NVD API)
- `DashboardPage.jsx` (multiple fetches)

**Action:** Open each file, search for `supabase.from(` and `fetch(`, verify each call is wrapped in try/catch with proper loading/error state. If not, add it.

---

### Issues #9 + #18 — useEffect Cleanup & Timer/Listener Leaks

These are the same class of bug. The audit calls out 14 files for missing useEffect cleanup and separately flags 1 `setInterval` + 3 `addEventListener` leaks.

**The 14 files with missing cleanup (from audit #9):**

AdminLayout, ChatWidget, ConsultationsPage, CybersecurityHubPage, DataRequestPage, DocumentsPage, OperatorPortalPage, QoSMonitoringPage, TypeApprovalPage, and 5 unnamed others.

**What to look for in each file:**

| Pattern | Missing Cleanup | Fix |
|---------|----------------|-----|
| `supabase.channel('x').subscribe()` | No `unsubscribe()` on unmount | `return () => supabase.removeChannel(channel);` |
| `setInterval(fn, ms)` | No `clearInterval` | `const id = setInterval(...); return () => clearInterval(id);` |
| `addEventListener('event', handler)` | No `removeEventListener` | `return () => removeEventListener('event', handler);` |
| `setTimeout(fn, ms)` | No `clearTimeout` | `const id = setTimeout(...); return () => clearTimeout(id);` |
| `fetch()` with state update | No abort controller | See below |

**Fetch abort pattern (prevents state-update-on-unmounted-component):**

```jsx
useEffect(() => {
  const controller = new AbortController();

  async function load() {
    try {
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to load');
      }
    }
  }
  load();

  return () => controller.abort();
}, []);
```

**Action:** Open each of the 14 files. Search for `useEffect`. For every effect that creates a subscription, timer, listener, or async fetch, add a cleanup return. This is tedious but mechanical.

---

## 3. Phase 2 — Security Hardening

### Issue #1 — Hardcoded API Keys

**Files:** `FileComplaintPage.jsx`, `QoSMonitoringPage.jsx`

The codebase already has a central Supabase client in `src/lib/supabase.js` that reads from `import.meta.env`. These two files bypass it and hardcode keys directly.

**Fix:** In both files, replace the hardcoded key/URL with the shared client:

```jsx
// Remove any line like:
// const supabaseUrl = 'https://cyalwtuladeexxfsbrcs.supabase.co';
// const supabaseKey = 'eyJ...';
// const localClient = createClient(supabaseUrl, supabaseKey);

// Replace with:
import { supabase } from '../../lib/supabase';
```

Then replace `localClient.from(...)` with `supabase.from(...)` throughout the file.

**Verify:** Search the entire codebase for any remaining hardcoded Supabase URLs or keys:

```bash
grep -r "eyJ" src/ --include="*.jsx" --include="*.js"
grep -r "cyalwtuladeexxfsbrcs" src/ --include="*.jsx" --include="*.js"
```

Both should return zero results from page components (only `.env.example` and `supabase.js` should reference these).

---

### Issue #5 — Unsanitised dangerouslySetInnerHTML

**Files:** `ContentPage.jsx`, `LicensingHubPage.jsx`

The codebase already has DOMPurify installed and a sanitize wrapper at `src/lib/sanitizeHtml.js`. These two files aren't using it.

**Fix in each file — find:**
```jsx
dangerouslySetInnerHTML={{ __html: content }}
```

**Replace with:**
```jsx
import { sanitizeHtml } from '../../lib/sanitizeHtml';

// Then:
dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
```

If `sanitizeHtml.js` doesn't exist or doesn't export what you need, create/update it:

```jsx
import DOMPurify from 'dompurify';

export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li',
      'strong', 'em', 'br', 'span', 'div', 'table', 'thead',
      'tbody', 'tr', 'th', 'td', 'img', 'blockquote'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'width', 'height'],
  });
}
```

---

### Issue #4 — Five Forms With No Validation

**Files:** `AdminTypeApprovalPage.jsx`, `DataRequestPage.jsx`, `LicensingHubPage.jsx`, `QoSReportsPage.jsx`, `TypeApprovalPage.jsx`

Create a shared validation utility at `src/lib/validation.js`:

```jsx
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateEmail(email) {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validatePhone(phone) {
  if (!phone) return null; // optional field
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) return 'Please enter a valid phone number';
  return null;
}

export function validateMaxLength(value, max, fieldName) {
  if (value && value.length > max) return `${fieldName} must be under ${max} characters`;
  return null;
}

export function validateForm(fields) {
  // fields = [{ value, name, rules: ['required', 'email', ...] }]
  const errors = {};
  for (const { value, name, rules } of fields) {
    for (const rule of rules) {
      let error = null;
      if (rule === 'required') error = validateRequired(value, name);
      if (rule === 'email') error = validateEmail(value);
      if (rule === 'phone') error = validatePhone(value);
      if (typeof rule === 'object' && rule.maxLength) {
        error = validateMaxLength(value, rule.maxLength, name);
      }
      if (error) {
        errors[name] = error;
        break;
      }
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}
```

**In each form's submit handler, add:**

```jsx
import { validateForm } from '../../lib/validation';

// Before the Supabase call:
const { isValid, errors } = validateForm([
  { value: formData.name, name: 'Name', rules: ['required'] },
  { value: formData.email, name: 'Email', rules: ['required', 'email'] },
  { value: formData.description, name: 'Description', rules: ['required', { maxLength: 5000 }] },
]);

if (!isValid) {
  setFormErrors(errors);
  return;
}
```

---

### Issue #11 — Rate Limiting on Only 2 of 8 Forms

The codebase has `checkRateLimit()` in `src/lib/supabase.js`. Apply it to every form submit handler that doesn't already have it.

**Pattern:**
```jsx
import { checkRateLimit } from '../../lib/supabase';

async function handleSubmit(e) {
  e.preventDefault();

  // Rate limit check FIRST
  if (!checkRateLimit('form-name')) {
    setError('Please wait before submitting again.');
    return;
  }

  // Then validation, then Supabase call
}
```

**Forms to add rate limiting to** (check each — the audit says 6 are missing):

- `CybersecurityHubPage.jsx` (incident report form)
- `LicensingHubPage.jsx` (licence application)
- `DataRequestPage.jsx` (data request)
- `ContactPage.jsx` (public contact form)
- `QoSReportsPage.jsx` (QoS submission)
- `TypeApprovalPage.jsx` (type approval application)

---

## 4. Phase 3 — Performance

### Issue #2 — Code Splitting

> Now safe to do because error boundaries are in place from Phase 1.

**Create:** `src/components/ui/PageLoader.jsx`

```jsx
export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4
                      border-bocra-blue border-t-transparent" />
    </div>
  );
}
```

**Modify:** `src/App.jsx`

Convert all page imports to `React.lazy()`. Keep layout/provider/auth imports static.

```jsx
import { lazy, Suspense } from 'react';

// KEEP STATIC — shell components
import Layout from './components/layout/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
// ... auth, providers, splash

// LAZY — all page components
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ContentPage = lazy(() => import('./pages/public/ContentPage'));
const FileComplaintPage = lazy(() => import('./pages/public/FileComplaintPage'));
const CybersecurityHubPage = lazy(() => import('./pages/public/CybersecurityHubPage'));
const LicensingHubPage = lazy(() => import('./pages/public/LicensingHubPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const SearchPage = lazy(() => import('./pages/public/SearchPage'));
const LicenceVerificationPage = lazy(() => import('./pages/public/LicenceVerificationPage'));
const TypeApprovalPage = lazy(() => import('./pages/public/TypeApprovalPage'));
const DocumentsPage = lazy(() => import('./pages/public/DocumentsPage'));
const NewsPage = lazy(() => import('./pages/public/NewsPage'));
const TelecomStatisticsPage = lazy(() => import('./pages/public/TelecomStatisticsPage'));
const HistoryPage = lazy(() => import('./pages/public/HistoryPage'));
const AboutProfilePage = lazy(() => import('./pages/public/AboutProfilePage'));
// ... convert ALL remaining page imports

// Admin pages — lazy loaded separately (never fetched by public visitors)
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ComplaintsPage = lazy(() => import('./pages/admin/ComplaintsPage'));
const ApplicationsPage = lazy(() => import('./pages/admin/ApplicationsPage'));
const IncidentsPage = lazy(() => import('./pages/admin/IncidentsPage'));
// ... all other admin pages
```

**Modify:** `Layout.jsx` and `AdminLayout.jsx`

Wrap `<Outlet />` with `<Suspense>` (inside the existing `<ErrorBoundary>` from Phase 1):

```jsx
import PageLoader from '../ui/PageLoader';

// In render:
<ErrorBoundary>
  <Suspense fallback={<PageLoader />}>
    <Outlet />
  </Suspense>
</ErrorBoundary>
```

**Verify:**
```bash
npm run build
ls -la dist/assets/*.js | wc -l  # Should be many files, not 1-3
```

---

### Issue #8 — Client-Side Caching (TanStack Query)

**Install:**
```bash
npm install @tanstack/react-query
```

**Modify:** `App.jsx` — add provider as outermost wrapper:

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Outermost:
<QueryClientProvider client={queryClient}>
  <ErrorBoundary>
    <AuthProvider>
      {/* ... rest of app */}
    </AuthProvider>
  </ErrorBoundary>
</QueryClientProvider>
```

**Create:** `src/hooks/useSupabaseQuery.js`

```jsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useSupabaseQuery(key, table, options = {}) {
  const {
    select = '*',
    filters = [],
    order = null,
    limit = null,
    enabled = true,
    staleTime,
  } = options;

  return useQuery({
    queryKey: Array.isArray(key) ? key : [key, { table, filters, order, limit }],
    queryFn: async () => {
      let query = supabase.from(table).select(select);

      for (const [col, op, val] of filters) {
        query = query.filter(col, op, val);
      }

      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled,
    ...(staleTime !== undefined && { staleTime }),
  });
}
```

**Adopt incrementally.** Don't try to convert all 43 queries at once. Convert them page by page as you touch each file for other fixes. Priority order for conversion:

1. Pages that fire on every visit (HomePage, Layout-level widgets)
2. Pages with expensive queries (DashboardPage — multiple fetches)
3. Public data pages (DocumentsPage, NewsPage, LicenceVerificationPage)
4. Admin pages (already behind auth, lower traffic)

---

### Issue #17 — React.memo for List Items

Identify card/list-item components that render inside `.map()` loops and receive stable props:

```jsx
// Before
function LicenceCard({ licence }) {
  return <div>...</div>;
}

// After
const LicenceCard = React.memo(function LicenceCard({ licence }) {
  return <div>...</div>;
});
```

Apply to: licence cards, CVE alert cards, registrar cards, consultation items, news cards, document cards, equipment cards — any component rendered in a list.

**Do NOT memo:** components that receive new objects/arrays as props on every render (this makes memo useless). Fix the parent to stabilize props first with `useMemo`.

---

### Issue #14 — 210 Inline Styles

Find `style={{` across the codebase and convert to Tailwind classes. Common conversions:

| Inline Style | Tailwind Class |
|-------------|---------------|
| `style={{ marginTop: '1rem' }}` | `mt-4` |
| `style={{ color: '#00458B' }}` | `text-bocra-blue` |
| `style={{ display: 'flex', gap: '1rem' }}` | `flex gap-4` |
| `style={{ maxWidth: '800px' }}` | `max-w-[800px]` |
| `style={{ backgroundColor: '#00A6CE' }}` | `bg-bocra-cyan` |

**Exception:** Dynamic styles that depend on runtime values (e.g., `style={{ width: `${percentage}%` }}`) should stay as inline styles or use Tailwind's arbitrary value syntax: `w-[${percentage}%]`.

---

### Issue #15 — Console Logs in Production

**Option A (quick):** Add Vite plugin:

```bash
npm install -D vite-plugin-remove-console
```

In `vite.config.js`:
```js
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
  plugins: [
    // ... existing plugins
    removeConsole({ includes: ['log', 'warn'] }), // keep console.error for real errors
  ],
});
```

**Option B (manual):** Search and remove:
```bash
grep -rn "console.log" src/ --include="*.jsx" --include="*.js"
```

Remove all `console.log` and `console.warn` calls. Keep `console.error` only inside catch blocks.

---

### Issue #19 — GSAP Overhead

GSAP is ~33 KB gzipped. It's used in 6 files for scroll-reveal animations.

**Assessment:** If code splitting is done (Issue #2), GSAP only loads for pages that use it — it won't be in the initial bundle unless `HomePage.jsx` imports it. Check if HomePage uses GSAP. If it does, this is worth addressing. If GSAP is only on secondary pages, code splitting already solves the performance problem.

**If you decide to replace:** Use CSS animations + IntersectionObserver:

```jsx
// src/hooks/useScrollReveal.js
import { useEffect, useRef } from 'react';

export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
```

**My recommendation:** Keep GSAP. Code splitting solves the bundle problem. Replacing GSAP with a custom solution is effort with minimal payoff and risks breaking existing animations. Only remove GSAP if you're confident none of the 6 files use timeline features.

---

## 5. Phase 4 — Data Architecture

### Issue #10 — Hardcoded Content → Supabase

This is covered in detail in `GUIDE_PERFORMANCE_FIXES.md` (the previous guide). That document contains:

- Full SQL schema for 8 new tables (`010_content_tables.sql`)
- RLS policies for all tables
- Migration scripts for converting JS arrays to SQL INSERTs
- Component update patterns
- Priority order for migration
- Domain-specific React Query hooks

**Refer to that guide for the complete implementation.** The key addition from this audit is that there are more hardcoded datasets than initially catalogued:

| Additional Data Sets (from audit) | Current Location |
|-----------------------------------|-----------------|
| Registrars (12 items) | Likely `RegisterBWPage.jsx` |
| Complaint types | `FileComplaintPage.jsx` or `triageConstants.js` |
| Service providers | Scattered across sector pages |
| FAQ items | Likely `ContentPage.jsx` or dedicated FAQ sections |

Add these to the migration backlog. The `triageConstants.js` data (AI categories, departments, urgencies) is a special case — it's used by both the frontend and the Edge Function. Keep it in code until you have a shared config mechanism.

---

## 6. Phase 5 — SEO & Accessibility

### Issue #7 — SEO Meta Tags

**Install:**
```bash
npm install react-helmet-async
```

**Add provider in `App.jsx`:**
```jsx
import { HelmetProvider } from 'react-helmet-async';

<HelmetProvider>
  <QueryClientProvider client={queryClient}>
    {/* ... */}
  </QueryClientProvider>
</HelmetProvider>
```

**Add to every page component:**
```jsx
import { Helmet } from 'react-helmet-async';

export default function TypeApprovalPage() {
  return (
    <>
      <Helmet>
        <title>Type Approval — BOCRA</title>
        <meta name="description" content="Search approved telecommunications equipment and apply for type approval certification in Botswana." />
        <link rel="canonical" href="https://bocra.org.bw/services/type-approval" />
      </Helmet>
      {/* ... rest of page */}
    </>
  );
}
```

**SEO data for key pages** (fill these in):

| Page | Title | Description (max 160 chars) |
|------|-------|-----------------------------|
| HomePage | BOCRA — Botswana Communications Regulatory Authority | Regulating telecommunications, broadcasting, postal, and internet services in Botswana. |
| FileComplaintPage | File a Complaint — BOCRA | Report service quality issues with telecoms, broadcasting, postal, or internet providers in Botswana. |
| LicensingHubPage | Licensing — BOCRA | Apply for telecommunications, broadcasting, and postal licences in Botswana. |
| TypeApprovalPage | Type Approval — BOCRA | Search approved equipment and apply for type approval certification. |
| CybersecurityHubPage | Cybersecurity Hub — BOCRA | Report cyber incidents, access safety resources, and view current vulnerability alerts. |
| DocumentsPage | Documents & Publications — BOCRA | Access regulatory documents, guidelines, legislation, and annual reports. |
| NewsPage | News — BOCRA | Latest announcements, industry updates, and regulatory decisions. |
| ContactPage | Contact Us — BOCRA | Get in touch with BOCRA for enquiries, complaints, or licensing questions. |
| TelecomStatisticsPage | Telecom Statistics — BOCRA | Botswana telecommunications market data: subscriptions, broadband, mobile money. |
| LicenceVerificationPage | Licence Verification — BOCRA | Verify the status of licensed telecommunications and broadcasting operators. |

For `ContentPage.jsx` dynamic pages, pull the title from the content data:
```jsx
<Helmet>
  <title>{pageData.title} — BOCRA</title>
  <meta name="description" content={pageData.summary || pageData.title} />
</Helmet>
```

---

### Issue #16 — Accessibility

This is the largest effort in Phase 5. The audit says only 14 `aria-*` attributes and 2 `role` attributes across 54 files.

**Step 1 — Install axe-core for dev-time auditing:**
```bash
npm install -D @axe-core/react
```

In `main.jsx` (development only):
```jsx
if (import.meta.env.DEV) {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

This logs accessibility violations to the console during development.

**Step 2 — Fix the highest-impact items:**

| Fix | Pattern | Where |
|-----|---------|-------|
| Icon buttons need labels | `<button aria-label="Close menu"><X /></button>` | Every icon-only button (Header, ChatWidget, AccessibilityWidget, admin sidebar) |
| Form inputs need labels | `<label htmlFor="email">Email</label><input id="email" ... />` | All 8 form pages |
| Dynamic content announcements | `<div aria-live="polite">{statusMessage}</div>` | Form submission results, search results, loading states |
| Skip navigation link | `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>` | `Layout.jsx`, before Header |
| Main landmark | `<main id="main-content">` | `Layout.jsx`, wrapping Outlet |
| Heading hierarchy | Ensure pages go h1 → h2 → h3 (no skipping) | All pages — many likely jump from h1 to h3 |
| Focus management on navigation | After route change, focus the main content area | `App.jsx` or `Layout.jsx` with a route-change effect |

**Step 3 — Keyboard navigation:**

Verify all interactive elements are reachable via Tab. The existing `AccessibilityWidget.jsx` has 9 features — check that the widget itself is keyboard-accessible (toggle button, panel items).

---

### Issue #13 — Image Optimisation

**Step 1 — Audit images:**
```bash
find public/images -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -exec ls -lh {} \;
```

**Step 2 — Convert to WebP** (keep originals as fallback):
```bash
# Install cwebp (one-time)
# Then for each image:
cwebp -q 80 image.png -o image.webp
```

**Step 3 — Use `<picture>` with responsive sizes:**
```jsx
<picture>
  <source srcSet="/hackbocra/images/hero.webp" type="image/webp" />
  <source srcSet="/hackbocra/images/hero.jpg" type="image/jpeg" />
  <img
    src="/hackbocra/images/hero.jpg"
    alt="BOCRA headquarters"
    width={1200}
    height={600}
    loading="lazy"
    className="w-full h-auto"
  />
</picture>
```

Add `loading="lazy"` to every `<img>` that is below the fold.

---

## 7. Phase 6 — Code Quality

### Issue #20 — 15 Routes on Generic ContentPage

These routes deserve dedicated components. Build them as you need them, not all at once. Priority by traffic:

1. `/complaints` and `/complaints/registering-complaints` — high traffic, user-facing
2. `/privacy-notice` — legal requirement
3. `/tariffs` — frequently accessed
4. `/projects/*` pages — can stay on ContentPage for now

### Issue #21 — TypeScript Migration

Not worth doing during the current sprint. When you do start:

1. Rename one file at a time: `.jsx` → `.tsx`
2. Start with utility files (`lib/validation.js`, `lib/sla.js`) — small, pure functions
3. Add `tsconfig.json` with `strict: false` initially, tighten later
4. Do NOT convert page components until utility/hook layer is typed

### Issue #22 — Duplicate Breadcrumbs

Create `src/components/ui/Breadcrumb.jsx`:

```jsx
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <Link to="/" className="hover:text-bocra-blue" aria-label="Home">
        <Home size={16} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight size={14} />
          {item.href ? (
            <Link to={item.href} className="hover:text-bocra-blue">{item.label}</Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

Usage:
```jsx
<Breadcrumb items={[
  { label: 'Services', href: '/services' },
  { label: 'Type Approval' },
]} />
```

Replace across 36 files. This is a good AI-assisted task (see prompts below).

### Issue #23 — Lucide Icons Audit

```bash
npm run build
# Check output for chunk sizes
# Lucide tree-shakes well — this is likely a non-issue after code splitting
```

Only investigate further if the build shows lucide-react as a large chunk.

---

## 8. AI-Assisted Prompts

> Always paste the project context block from `GUIDE_AI_EDITING.md` first.

### 8.1 Add Error Boundaries + Async Error Handling

**Upload:** `App.jsx` + `Layout.jsx` + `AdminLayout.jsx`

```
I've uploaded App.jsx, Layout.jsx, and AdminLayout.jsx.

Task 1: Create a new ErrorBoundary component (src/components/ui/ErrorBoundary.jsx) that:
- Catches render errors
- Shows a BOCRA-branded error card with a "Try Again" button
- Uses rounded-2xl, bg-red-50, border-red-200, font-display for heading
- Logs errors to console.error

Task 2: Add ErrorBoundary in three places:
- App.jsx: wrap the BrowserRouter
- Layout.jsx: wrap the Outlet, also wrap ChatWidget and AccessibilityWidget individually
- AdminLayout.jsx: wrap the Outlet

SCOPE-LOCK: Only add the ErrorBoundary imports and wrappers. Do not change any other code.

Give me ALL files back plus the new ErrorBoundary.jsx.
```

### 8.2 Fix useEffect Cleanup in a Specific File

**Upload:** One file at a time (e.g., `ChatWidget.jsx`)

```
I've uploaded [FILE NAME].

Task: Find every useEffect that creates subscriptions, timers, event listeners, or async fetches. For each one:
1. Add a cleanup return function (unsubscribe, clearInterval, clearTimeout, removeEventListener, or AbortController)
2. Wrap any async code in try/catch if not already wrapped
3. Add loading and error state if missing

SCOPE-LOCK: Only modify useEffect hooks. Do not change any JSX, styling, or other logic.

Give me the COMPLETE file back.
```

### 8.3 Add Form Validation to a Specific Form

**Upload:** One form file (e.g., `DataRequestPage.jsx`)

```
I've uploaded [FILE NAME].

Task: Add client-side validation to the form submission:
1. Import validateForm from '../../lib/validation'
2. Before the Supabase call, validate all required fields
3. Show field-level error messages below each input (text-red-500 text-sm)
4. Add rate limiting: import checkRateLimit from '../../lib/supabase' and check before submit
5. Disable the submit button while submitting (add isSubmitting state)

Fields to validate: [LIST THE FIELDS AND THEIR RULES — look at the form first]

SCOPE-LOCK: Only modify the form handler and add error display. Do not change layout or styling.

Give me the COMPLETE file back.
```

### 8.4 Replace Breadcrumbs Across Files

**Upload:** Any page file with inline breadcrumbs

```
I've uploaded [FILE NAME].

Task: Replace the inline breadcrumb JSX with the shared Breadcrumb component.

1. Add import: import Breadcrumb from '../../components/ui/Breadcrumb';
2. Find the existing breadcrumb div (usually contains Home icon, ChevronRight, and text links)
3. Replace it with: <Breadcrumb items={[{ label: '[SECTION]', href: '/[path]' }, { label: '[PAGE]' }]} />

SCOPE-LOCK: Only replace the breadcrumb section. Do not change anything else.

Give me the COMPLETE file back.
```

---

## 9. Verification Checklist

### After Phase 1 (Crash Prevention)
- [ ] Trigger a render error (e.g., temporarily throw in a component) — error boundary catches it, shows fallback
- [ ] Disconnect network, navigate to a data page — error message shown, no white screen
- [ ] Open DevTools Console, navigate around — no "state update on unmounted component" warnings
- [ ] Open DevTools Memory tab, navigate repeatedly — memory does not grow unbounded

### After Phase 2 (Security)
- [ ] `grep -r "eyJ" src/` returns nothing from page files
- [ ] View source of ContentPage — HTML is sanitised (no raw script tags possible)
- [ ] Try submitting each form empty — validation errors shown
- [ ] Rapidly click submit 10 times — rate limiter blocks after threshold

### After Phase 3 (Performance)
- [ ] `npm run build` produces 20+ JS chunks in `dist/assets/`
- [ ] Lighthouse Performance score improves (measure before/after)
- [ ] Navigate to a page, navigate away, navigate back — second visit is instant (cached)
- [ ] DevTools Network: only relevant chunks load per route
- [ ] No `console.log` in production build

### After Phase 4 (Data Architecture)
- [ ] All new Supabase tables visible in dashboard
- [ ] RLS enabled on every new table (check Auth → Policies)
- [ ] Public user can SELECT but not INSERT/UPDATE/DELETE content tables
- [ ] Staff/admin can CRUD via Supabase dashboard
- [ ] Page loads data from Supabase, not from hardcoded arrays

### After Phase 5 (SEO & Accessibility)
- [ ] Each page has unique `<title>` (check in browser tab)
- [ ] View page source → `<meta name="description">` present
- [ ] axe-core reports zero critical violations in dev console
- [ ] Tab through entire page — all interactive elements reachable
- [ ] Images below fold have `loading="lazy"`

### After Phase 6 (Code Quality)
- [ ] Breadcrumb component used everywhere (search for old pattern returns 0)
- [ ] No duplicate breadcrumb JSX in page files
