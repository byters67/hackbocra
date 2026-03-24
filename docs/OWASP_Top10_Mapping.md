# BOCRA Website — OWASP Top 10 (2021) Compliance Mapping

**Project:** BOCRA Website Redesign | **Team:** Hackathon Team Project
**Date:** 18 March 2026 | **Framework:** OWASP Top 10:2021

This document maps each OWASP Top 10 risk category to the specific controls
implemented in the BOCRA website codebase.

---

## Summary

| # | OWASP Category | Risk | Status | Key Control |
|---|----------------|------|--------|-------------|
| A01 | Broken Access Control | CRITICAL | **Mitigated** | RLS on every table + RBAC + sector scoping |
| A02 | Cryptographic Failures | HIGH | **Mitigated** | TLS enforced, HSTS preload, no plaintext secrets |
| A03 | Injection | HIGH | **Mitigated** | Input sanitisation + parameterised queries (Supabase) |
| A04 | Insecure Design | MEDIUM | **Mitigated** | Threat model from pentest, defence-in-depth |
| A05 | Security Misconfiguration | MEDIUM | **Mitigated** | CSP + security headers + server_tokens off |
| A06 | Vulnerable Components | MEDIUM | **Monitored** | npm audit, pinned dependencies, minimal surface |
| A07 | Auth Failures | HIGH | **Mitigated** | Supabase Auth (bcrypt + JWT) + rate limiting |
| A08 | Data Integrity Failures | MEDIUM | **Mitigated** | CSP blocks inline injection, RLS prevents tampering |
| A09 | Logging & Monitoring | HIGH | **Mitigated** | Immutable audit_log table with triggers on all tables |
| A10 | SSRF | LOW | **N/A** | Static SPA — no server-side request capability |

---

## Detailed Mapping

### A01: Broken Access Control

**Risk:** Users acting outside intended permissions.

**Controls implemented:**
- Row Level Security (RLS) enabled on **every** database table (`001_initial_schema.sql`, `003_admin_portal.sql`)
- Users can only SELECT their own data; staff scoped by sector (`005_rls_hardening.sql`)
- Role-based access: `user → operator → staff → admin` hierarchy (`src/lib/security.js`)
- `AdminLayout` component enforces auth + role on all `/admin/*` routes
- INSERT policies restrict field values (e.g., status must be `'pending'`, assigned_to must be `NULL`)
- Sector-scoped access: `staff_can_access_sector()` limits staff to their assigned regulatory domain

**Pentest findings addressed:** F01 (Unauth POST), F04 (Unauth API data), F05 (Admin panel exposure)

---

### A02: Cryptographic Failures

**Risk:** Exposure of sensitive data due to weak or missing encryption.

**Controls implemented:**
- HSTS header with 1-year max-age + includeSubDomains + preload (`nginx/nginx.conf`, `public/_headers`)
- TLS 1.2+ only; SSLv3, TLS 1.0, TLS 1.1 disabled (`nginx/nginx.conf`)
- Passwords hashed with bcrypt via Supabase Auth (never stored in plaintext)
- API keys base64-obfuscated in client code; service role key only in Edge Functions
- Environment variables injected at build time via GitHub Actions secrets

**Pentest findings addressed:** F08 (HSTS was only 300s on the old site)

---

### A03: Injection

**Risk:** SQL injection, XSS, command injection via untrusted input.

**Controls implemented:**
- `sanitizeInput()` strips HTML tags and SQL metacharacters (`src/lib/security.js`)
- `validateEmail()` and `validatePhone()` enforce format constraints
- Supabase client uses **parameterised queries** — no raw SQL from the frontend
- Content Security Policy restricts script origins (`index.html` meta tag). Note: `'unsafe-inline'` is currently required for the GitHub Pages SPA redirect handler and reCAPTCHA; `eval()` is blocked by default since it is not listed in script-src
- `object-src 'none'` prevents plugin-based injection vectors
- reCAPTCHA v3 on all public-facing forms (`src/hooks/useRecaptcha.js`)

---

### A04: Insecure Design

**Risk:** Architecture-level flaws that cannot be fixed by implementation alone.

**Controls implemented:**
- Threat model derived from **real penetration test** (14 March 2026) with 11 findings
- Defence-in-depth: access control enforced at both frontend (ProtectedRoute) and database (RLS) layers
- Public forms are insert-only — no read-back of other users' data
- Anonymous incident reporting by design (reporters cannot be identified if they opt out)
- Consent-by-design: every data-collecting form requires explicit DPA consent before submission
- Audit trail captures full before/after state for all data mutations

---

### A05: Security Misconfiguration

**Risk:** Default configs, verbose errors, missing headers, unnecessary features.

**Controls implemented:**
- Full security header suite: CSP, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CORP, COOP, COEP (`nginx/nginx.conf`, `public/_headers`, `index.html`)
- `server_tokens off` hides Nginx version (`nginx/nginx.conf`)
- `sanitizeError()` maps internal errors to user-friendly messages — no stack traces, SQL, or file paths leak (`src/lib/security.js`)
- `.env`, `.git`, `.map` files blocked from serving (`nginx/nginx.conf`)
- No debug mode — static SPA has no server-side debug toggle
- Source maps disabled in production (`vite.config.js: sourcemap: false`)

**Pentest findings addressed:** F06 (Verbose errors), F07 (Version disclosure), F08 (Missing headers), F09 (QA exposed)

---

### A06: Vulnerable and Outdated Components

**Risk:** Using libraries with known CVEs.

**Controls implemented:**
- Minimal dependency surface: 9 production dependencies (React, Vite, Tailwind, Supabase, GSAP, Recharts, Lucide, react-markdown, pdf-parse)
- All dependencies pinned in `package-lock.json`
- `npm audit` run as part of CI/CD pipeline (`.github/workflows/deploy.yml`)
- No jQuery, no legacy frameworks, no server-side dependencies
- Edge Functions use Deno runtime with URL imports (always latest)

---

### A07: Identification and Authentication Failures

**Risk:** Weak authentication, credential stuffing, session hijacking.

**Controls implemented:**
- Supabase Auth: bcrypt password hashing, JWT tokens with automatic refresh
- Email verification required before account activation
- Rate limiting: 5 req/min on auth endpoints (`nginx/nginx.conf`), 30 req/min general
- Client-side rate limiting per operation (`src/lib/supabase.js`)
- Session tokens stored in `localStorage` by Supabase JS v2 (not httpOnly cookies — this is a known Supabase client-side SDK limitation; mitigated by CSP and XSS controls)
- No password stored in localStorage or client-side state
- reCAPTCHA v3 on public forms to prevent automated abuse

---

### A08: Software and Data Integrity Failures

**Risk:** Code/data integrity assumptions without verification.

**Controls implemented:**
- CSP prevents loading scripts from unauthorised origins
- RLS INSERT policies enforce safe default values (e.g., status='pending', assigned_to=NULL)
- Immutable audit log — no UPDATE or DELETE policies, append-only
- GitHub Actions CI/CD: code reviewed via PR before merge to main
- Supabase Edge Functions deployed from version-controlled source

---

### A09: Security Logging and Monitoring Failures

**Risk:** Breaches go undetected due to insufficient logging.

**Controls implemented:**
- `audit_log` table with structured JSONB records (`004_audit_log.sql`)
- Database triggers on **every table** capture: auth events, status changes, admin actions, public submissions
- Each log entry records: `event_type`, `actor_id`, `actor_role`, `old_values`, `new_values`, `timestamp`
- `audit_log_view` enriches logs with actor names for the admin dashboard
- Retention: 2 years, auto-purged via `enforce_data_retention()` (`006_data_retention_policy.sql`)
- Admin-only access to audit logs (RLS enforced)
- Nginx access and error logs in production (`nginx/nginx.conf`)

---

### A10: Server-Side Request Forgery (SSRF)

**Risk:** Attacker forces server to make requests to unintended destinations.

**Controls implemented:**
- **Not applicable** — BOCRA website is a static SPA served from a CDN (GitHub Pages)
- No server-side request capability in the frontend
- Edge Functions (chat, translate) make requests only to hardcoded API endpoints (Anthropic, Google Translate) — no user-controlled URLs
- CORS restricted to known deployment origins in Edge Functions

---

## Files Reference

| File | Security Controls |
|------|-------------------|
| `src/lib/security.js` | Sanitisation, RBAC, CSP directives, error handling |
| `src/lib/auth.jsx` | Auth context, session management |
| `src/lib/supabase.js` | Client config, rate limiting |
| `index.html` | CSP meta tag |
| `public/_headers` | Security headers (Netlify/reference format) |
| `nginx/nginx.conf` | Production security headers, TLS, rate limiting |
| `supabase/migrations/001_initial_schema.sql` | Core RLS policies |
| `supabase/migrations/003_admin_portal.sql` | Admin RLS policies |
| `supabase/migrations/004_audit_log.sql` | Security audit logging |
| `supabase/migrations/005_rls_hardening.sql` | RLS gap fixes + sector scoping |
| `supabase/migrations/006_data_retention_policy.sql` | DPA retention enforcement |
| `src/components/ui/ConsentCheckbox.jsx` | DPA consent on all forms |
| `src/components/ui/CookieConsent.jsx` | Cookie consent banner |

---

*Prepared for BOCRA Youth Hackathon 2026 submission.*
