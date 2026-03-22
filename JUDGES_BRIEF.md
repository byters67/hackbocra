# Judges Brief — Why It's Built This Way

> This document covers the **engineering decisions** behind the BOCRA website redesign: how we monitor it, how it survives failure, and why every architectural choice traces back to a real problem we found in the penetration test or website audit.

---

## 1. Architecture Overview

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full Mermaid diagram. The key insight:

**Every layer has a fallback.** The system is designed so that no single failure — database outage, AI API down, network loss — produces a white screen or lost data.

```
Request Flow (happy path):
  Browser → Service Worker → React SPA → Edge Function → PostgreSQL

Failure Flow (any layer breaks):
  Browser → Service Worker cache (stale data) → ErrorBoundary (graceful UI)
  Edge Function → fetchWithRetry (3 attempts) → circuit breaker (fallback)
  AI API down → complaint still submits (fire-and-forget classification)
```

---

## 2. Health Check & Monitoring Story

### The Problem
The legacy BOCRA website had no visibility into its own health. When the site went down, BOCRA staff found out from citizens calling to complain — sometimes hours later.

### What We Built

**Three layers of observability:**

| Layer | What | How | Where |
|-------|------|-----|-------|
| **Health endpoint** | Real-time system status | Edge Function checks DB connectivity, runtime, memory usage | `GET /functions/v1/health` |
| **Uptime monitor** | Continuous polling | Script hits health endpoint every 60s, logs status + latency | `scripts/uptime-check.js` |
| **Error logging** | Crash telemetry | ErrorBoundary catches React crashes, POSTs stack trace to DB | `error_logs` table (migration 017) |

### How It Works in Practice

```
Every 60 seconds:
  uptime-check.js → GET /functions/v1/health
                   → Response: { status: "healthy", checks: {
                       database: { status: "ok", latency_ms: 45 },
                       runtime:  { status: "ok" },
                       memory:   { status: "ok" }  ← warns if heap > 90%
                     }}
                   → Logs: "[2026-03-22T10:00:00Z] HEALTHY | DB: 45ms | Total: 120ms"

When something breaks:
  → Response: { status: "degraded", checks: { database: { status: "down" } } }
  → HTTP 503 (not 200) — so any monitoring tool (UptimeRobot, Azure Monitor) can alert
  → Logs: "[2026-03-22T10:01:00Z] DEGRADED | DB: timeout | Total: 5000ms"
```

### Production Path
For production deployment, the uptime script is replaced by **Azure Monitor + Application Insights**, which adds:
- SMS/email alerts when health degrades
- Response time dashboards
- Geographic availability checks (Johannesburg + Cape Town)

---

## 3. Incident Response & Failover Narratives

### Scenario 1: Database Goes Down (Supabase Outage)

```
DETECTION (< 60 seconds)
  └─ Health endpoint returns HTTP 503, database check = "down"
  └─ Uptime monitor logs: DEGRADED | DB: timeout

AUTOMATIC RESPONSE
  └─ Public pages: PWA Service Worker serves cached content (up to 1 hour old)
  └─ React Query: offlineFirst mode returns last successful data
  └─ Forms: Submission fails gracefully with "Service temporarily unavailable" message
  └─ Admin portal: Shows error state, no stale writes possible

USER EXPERIENCE
  └─ Citizens browsing public info: NO DISRUPTION (cached)
  └─ Citizens filing complaints: See clear error message, told to retry
  └─ Admin staff: Dashboard shows degraded state, read-only

RECOVERY
  └─ Supabase restores service (typically < 30 min per SLA)
  └─ Health endpoint returns 200, monitor logs: HEALTHY
  └─ React Query automatically refetches stale data
  └─ No manual intervention needed
```

**Why this matters:** BOCRA serves 2.6M citizens. A white screen during a network outage complaint spike would undermine public trust in the regulator.

---

### Scenario 2: AI API Down (Anthropic Outage)

```
DETECTION
  └─ classify-complaint Edge Function: fetchWithRetry fails 3 times
  └─ Circuit breaker: CLOSED → OPEN after 3 consecutive failures

AUTOMATIC RESPONSE
  └─ Complaint STILL SUBMITS SUCCESSFULLY (classification is fire-and-forget)
  └─ Chat widget: Circuit breaker returns fallback message
  └─ Licence review: Returns "manual review required" status

USER EXPERIENCE
  └─ Filing a complaint: Works normally — citizen sees confirmation
  └─ Using chat: "I'm temporarily unavailable. Please check our FAQ or call us."
  └─ No data loss, no blocked workflows

RECOVERY (after 30 seconds)
  └─ Circuit breaker: OPEN → HALF_OPEN → sends one test request
  └─ If Anthropic responds: HALF_OPEN → CLOSED (normal operations resume)
  └─ If still down: HALF_OPEN → OPEN (wait another 30s)
  └─ Unclassified complaints: Can be batch-classified later
```

**Design decision:** We made AI classification *non-blocking* because a citizen's ability to file a complaint should never depend on a third-party API. The complaint is the core action; classification is an enhancement.

---

### Scenario 3: Traffic Spike (National Incident → Complaint Surge)

```
DETECTION
  └─ Rate limit counters rising across all 3 tiers

DEFENSE IN DEPTH (3-tier rate limiting)
  ┌─ Tier 1: Client-side (src/lib/supabase.js)
  │   └─ 30 requests/minute per browser tab
  │   └─ Prevents accidental rapid-fire from UI bugs
  │
  ├─ Tier 2: Nginx reverse proxy (nginx/nginx.conf)
  │   └─ 10 requests/second per IP
  │   └─ Blocks automated abuse before it hits backend
  │
  └─ Tier 3: Database-persistent (migration 015)
      └─ Tracks submissions per IP in rate_limits table
      └─ Survives Edge Function cold starts (not in-memory)
      └─ 429 "Too Many Requests" with retry-after header

USER EXPERIENCE
  └─ Legitimate users: Unaffected (well within limits)
  └─ Abusive scripts: Blocked at Tier 2 (never reach database)
  └─ Public pages: Served from PWA cache (zero DB cost)
```

**Why 3 tiers?** The pentest found the legacy site had zero rate limiting. We didn't just add one — we added defense in depth so that each tier catches what the previous one misses.

---

### Scenario 4: React Component Crash

```
DETECTION
  └─ ErrorBoundary.componentDidCatch() fires
  └─ Error details POSTed to error_logs table (fire-and-forget)

AUTOMATIC RESPONSE
  └─ Crashed section replaced with: "Something went wrong. Your data is safe."
  └─ Rest of the page continues working (ErrorBoundary is scoped per section)
  └─ User offered "Try Again" button to re-render the section

LOGGED DATA (for debugging)
  └─ error_type: "react_crash"
  └─ message: Error description
  └─ stack: First 2000 chars of stack trace
  └─ component: React component tree path
  └─ page_url: Where it happened
  └─ user_agent: Browser info

ADMIN VISIBILITY
  └─ Error logs visible in admin portal
  └─ Auto-purged after 1 year (data retention policy, migration 006)
```

**Why this matters:** The legacy site had pages that crashed entirely with white screens. Our ErrorBoundary ensures a crash in one widget (e.g., the chat) never takes down the complaint form.

---

## 4. The Pentest → Architecture Connection

Every architectural choice traces back to a real finding:

| Pentest Finding | Severity | Architectural Response |
|----------------|----------|----------------------|
| F01: Unauthenticated POST | CRITICAL | RLS on every table — DB rejects unauthorized writes regardless of application code |
| F02: Debug mode in production | CRITICAL | Static SPA has no server runtime to expose debug info |
| F05: Admin panel exposed | HIGH | Auth context + server-side role check from `profiles` table (not JWT claims) |
| F08: Missing security headers | MEDIUM | CSP + HSTS + X-Frame-Options in nginx.conf and \_headers file |
| F11: Broken customer portal | LOW | Complete rebuild with React, proper error states, loading states |

**This is the "why":** We didn't pick these technologies because they're trendy. We picked them because they directly solve the security and reliability problems found in the audit.

---

## 5. Video Walkthrough — Talking Points

> **Core message:** Every feature exists because something was broken. Show the *problem → solution → evidence* arc.

### Opening (30 seconds)
- "BOCRA's current website has 11 security vulnerabilities, including 2 critical ones. Pages crash with white screens. There's no way to file complaints online. We rebuilt it from scratch."

### Demo Flow (show WHY, not just WHAT)

**1. Security (1 minute)**
- Show the pentest findings table
- Open browser DevTools → Network tab → submit a complaint
- Point out: "Notice there's no API key in the request. The database enforces access control via Row Level Security — even if someone bypasses our frontend, the database rejects unauthorized writes."

**2. Fault Tolerance (1 minute)**
- Show the health endpoint response in the browser: `/functions/v1/health`
- "What happens when the AI goes down?" → Show the circuit breaker code → "After 3 failures, we stop calling the API and serve a fallback. The complaint still submits. No data loss."
- Show the ErrorBoundary: "If any part of the page crashes, only that section shows an error. The rest keeps working."

**3. Bilingual Support (30 seconds)**
- Toggle between English and Setswana
- "This isn't Google Translate — critical regulatory content has manually verified translations. The translation service has a fallback dictionary if the API is down."

**4. Admin Portal (1 minute)**
- Show the dashboard with KPI charts
- Show a complaint moving through workflow states
- "Every action is recorded in an immutable audit log. This is a regulatory body — accountability isn't optional."

**5. Performance & Scalability (30 seconds)**
- Show Lighthouse score
- "51 routes, but only the ones you visit get loaded. Public pages are cached by the service worker — returning visitors hit zero database queries."

### Closing (15 seconds)
- "We didn't just build a website. We built a platform that a regulatory authority can trust — one that stays up when services fail, tracks every action, and protects citizen data."

---

## 6. Key Numbers for Judges

| Metric | Value |
|--------|-------|
| Security findings addressed | 11/11 (2 critical, 3 high, 4 medium, 2 low) |
| Database tables with RLS | 100% |
| Indexes for performance | 35+ (including composite) |
| Versioned migrations | 17 |
| Edge Functions | 6 (all with retry logic) |
| Rate limiting tiers | 3 (client → nginx → database) |
| Fault tolerance patterns | 4 (circuit breaker, ErrorBoundary, PWA cache, fetchWithRetry) |
| Languages | 2 (English + Setswana) |
| Lazy-loaded routes | 51 |
| Monthly infrastructure cost | $0 (all free tiers) |
| Production migration estimate | 2-3 weeks → Azure |
