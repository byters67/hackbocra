# BOCRA Platform — System Architecture

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite + Tailwind CSS | SPA with lazy loading, PWA offline support |
| Backend | Supabase (Postgres + Auth + Edge Functions) | Managed, auto-scaling, built-in RLS |
| AI | Anthropic Claude API | Complaint triage, licence review, chat assistant |
| Hosting | GitHub Pages (demo) → Azure (production) | CDN-ready static deployment |
| i18n | Ternary-based bilingual (EN/Setswana) | Co-located with components for code splitting |

## Architecture Diagram

```mermaid
graph TD
    subgraph Client["Client (Browser / Mobile)"]
        SW["PWA Service Worker<br/>CacheFirst · StaleWhileRevalidate · NetworkOnly"]
        SPA["React SPA<br/>51 lazy-loaded routes"]
        RQ["React Query<br/>staleTime 5 min · retry 3 · exponential backoff"]
        CB["Circuit Breaker<br/>CLOSED → OPEN → HALF_OPEN"]
        EB["ErrorBoundary<br/>catches crashes · logs to DB"]
        RL_C["Client Rate Limit<br/>30 req/min"]
    end

    subgraph Edge["Supabase Edge Functions (Deno)"]
        SF["submit-form<br/>reCAPTCHA · persistent rate limit"]
        CC["classify-complaint<br/>AI triage · fire-and-forget"]
        RA["review-application<br/>AI licence review"]
        CH["chat<br/>RAG + Claude · retry logic"]
        TR["translate<br/>Setswana · fallback dictionary"]
        HE["health<br/>DB · runtime · memory checks"]
    end

    subgraph External["External APIs"]
        AI["Anthropic Claude API"]
        GT["Google Translate API"]
        RC["reCAPTCHA v3"]
    end

    subgraph Database["PostgreSQL (Supabase Managed)"]
        PG["PgBouncer<br/>transaction mode · 200 connections"]
        DB["17 migrations · RLS on every table<br/>35+ indexes · audit log triggers<br/>persistent rate limits · error logs<br/>data retention policy"]
    end

    subgraph Monitoring["Observability"]
        HC["Health Endpoint<br/>GET /functions/v1/health"]
        UM["Uptime Monitor<br/>60 s polling · logs status"]
        EL["Error Logs Table<br/>react crashes · stack traces"]
        AL["Audit Log<br/>append-only · 9 event types"]
    end

    Client -->|HTTPS| Edge
    SPA --> RQ
    RQ --> CB
    CB -->|fallback on failure| SPA
    EB -->|fire-and-forget POST| EL

    SF --> RC
    CC --> AI
    RA --> AI
    CH --> AI
    TR --> GT
    CB -.->|wraps| AI
    CB -.->|wraps| GT

    Edge --> PG --> DB

    HE --> HC
    UM -->|polls| HC
    DB --> AL

    style Client fill:#e8f4fd,stroke:#00458B
    style Edge fill:#fff3e0,stroke:#F7B731
    style Database fill:#e8f5e9,stroke:#6BBE4E
    style External fill:#fce4ec,stroke:#C8237B
    style Monitoring fill:#f3e5f5,stroke:#7B1FA2
```

> **How to read this:** Requests flow top-down from Client → Edge Functions → Database. The circuit breaker (dashed lines) wraps external API calls so that when Anthropic or Google are down, the app serves fallbacks immediately instead of hanging. The Monitoring subgraph shows how errors and health data flow into observable stores.

## Security (Pentest-Driven)

| Layer | Measure | Evidence |
|-------|---------|----------|
| Network | TLS 1.2+1.3, CSP, HSTS (1yr preload) | nginx.conf |
| Input | 3-layer XSS prevention (DOMPurify + HTML strip + server sanitize) | src/lib/security.js, Edge Functions |
| Auth | Server-side role verification from DB (NOT JWT metadata) | src/lib/auth.jsx |
| Data | RLS on every table, sector-scoped access | 17 migrations |
| Rate Limit | 3 tiers: client → nginx → DB-persistent | src/lib/supabase.js, nginx.conf, migration 015 |
| Audit | Immutable append-only log, 5 indexes | migration 004 |
| Privacy | DPA §18 consent on every form, data retention enforcement | ConsentCheckbox.jsx, migration 006 |

## Fault Tolerance

| Failure Scenario | Response |
|-----------------|----------|
| Supabase API down | Public pages serve stale cached data via Service Worker |
| AI API down | Complaints still submit (fire-and-forget classification) |
| Translation API down | Falls back to hardcoded Setswana dictionary |
| React component crash | ErrorBoundary catches, logs to DB, offers retry |
| Network failure | PWA offline mode, offlineFirst query strategy |
| Rate limit exceeded | 429 response at all 3 tiers, persistent DB tracking |
| External API transient error | fetchWithRetry with exponential backoff (3 attempts) |
| Repeated API failures | Circuit breaker opens, serves fallback immediately |

## Scalability

| Layer | Strategy | Capacity |
|-------|----------|----------|
| Frontend | Lazy-loaded routes, PWA cache, CDN-ready | Unlimited (static) |
| Data layer | React Query staleTime 5min, gcTime 30min | ~80% reduction in DB hits |
| Edge Functions | Serverless, auto-scale, independent per function | Scales to zero and up automatically |
| Database | PgBouncer transaction mode, 35+ indexes, composite indexes | 200 pooled connections |
| Rate limiting | 3-tier protection | Survives abuse without degradation |

## Production Migration Path

| Current (Hackathon) | Phase 2 (Production) |
|---------------------|---------------------|
| GitHub Pages | Azure Static Web Apps + Front Door CDN |
| Supabase Edge Functions | Azure Functions (Deno runtime, 1:1 mapping) |
| Supabase Postgres | Azure Database for PostgreSQL Flexible Server |
| PgBouncer (Supabase built-in) | PgBouncer (Azure Flexible Server built-in) |
| Single region | Azure geo-redundant (JHB + CPT) |
| Custom uptime script | Azure Monitor + Application Insights |
| PWA cache | Azure Front Door edge caching |
| ~$25/mo | ~$200-400/mo |
| Estimated migration: 2-3 weeks |
