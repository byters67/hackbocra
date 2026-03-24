# BOCRA Platform — Implementation Roadmap

> **Last updated:** 2026-03-24  
> **Document owner:** _[Assign]_  
> **Review cadence:** Bi-weekly (every sprint boundary)  
> **Status legend:** `[ ]` Todo · `[~]` In Progress · `[x]` Done · `[!]` Blocked

---

## How to Read This Document

Each phase includes **why it matters**, **what success looks like** (measurable), **what could go wrong** (risks), **what must be true before you start** (prerequisites), and **a concrete task list with effort tags**. Effort tags: `[S]` = < 1 day, `[M]` = 1–3 days, `[L]` = 3–5 days, `[XL]` = 5+ days.

---

## Phase 1: Consumer Protection — Guided Complaint Wizard

**Goal:** Replace the flat complaint form with a step-by-step wizard that walks citizens through filing a complaint, reducing drop-off and improving data quality.

**Why first:** Complaints are BOCRA's core citizen touchpoint. The current form is a wall of dropdowns — a guided wizard dramatically lowers the barrier to participation.

### Success Criteria

| Metric | Baseline (current) | Target (8 weeks post-launch) |
|--------|-------------------|------------------------------|
| Complaint form completion rate | _Measure now_ | +30% improvement |
| Average time to complete form | _Measure now_ | < 4 minutes |
| Incomplete/abandoned submissions | _Measure now_ | -50% |
| Data quality (fields filled correctly) | _Measure now_ | > 90% of submissions have all required fields |

> **Action item before starting:** Instrument the current `FileComplaintPage.jsx` with analytics events to establish baselines. Without this, you can't prove the wizard worked.

### Prerequisites

- [ ] Baseline analytics instrumented on current complaint form
- [ ] Provider → complaint type mapping finalized and reviewed by BOCRA subject matter expert
- [ ] Setswana copy for all wizard steps drafted and reviewed

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Wizard adds friction for power users who knew the old form | Medium | Low | Keep old form behind feature flag; add "Quick file" shortcut for repeat filers |
| Provider list goes stale as market changes | Medium | Medium | Pull provider list from a Supabase table, not hardcoded array |
| Mobile rendering breaks on low-end Android | High | High | Test on BrowserStack with Tecno/Itel devices at 3G speeds before launch |

### Tasks

- [ ] `[S]` Instrument current form with analytics events (start, each field interaction, abandon, submit)
- [ ] `[L]` Create `ComplaintWizard.jsx` component with multi-step state machine
  - Step 1: "Who is your service provider?" — visual cards (Mascom, BTC, Orange, etc.), sourced from `providers` table
  - Step 2: "What type of problem?" — contextual to provider (mobile → billing/network/data; broadcasting → signal/content)
  - Step 3: "Have you contacted your provider directly?" — yes/no gate; if no, show provider's actual support number and encourage direct contact first
  - Step 4: "Describe what happened" — free text with helper prompts ("When did this start?", "What have you tried?")
  - Step 5: "Your details" — name, phone, email with inline explanation of why each is needed
  - Step 6: Review & submit — editable summary of all inputs
- [ ] `[M]` Add progress bar / step indicator showing current position and step names
- [ ] `[S]` Add "Back" navigation between steps with full state preservation
- [ ] `[M]` Wire wizard output to existing `complaints` Supabase table + `classify-complaint` edge function
- [ ] `[S]` Add expected timeline messaging on confirmation screen ("You will receive acknowledgement within 2 business days")
- [ ] `[S]` Replace current `FileComplaintPage.jsx` with wizard; keep old form as fallback behind feature flag (`ENABLE_LEGACY_COMPLAINT_FORM`)
- [ ] `[M]` Add Setswana translations for all wizard steps and prompts in `translations.js`
- [ ] `[M]` Test mobile responsiveness on low-end Android devices (Tecno, Itel) at 3G speeds
- [ ] `[S]` Add analytics events to each wizard step (step_viewed, step_completed, step_abandoned)

**Files to modify:**
- `src/pages/public/FileComplaintPage.jsx`
- `src/lib/translations.js`
- `src/lib/triageConstants.js` (provider → complaint type mapping)

**New files:**
- `src/components/complaints/ComplaintWizard.jsx`
- `src/components/complaints/WizardStep.jsx`

**Estimated total effort:** 2–3 weeks (1 developer)

### Acceptance Criteria

- [ ] Citizen can complete a complaint in ≤ 6 steps with no page reloads
- [ ] Back navigation preserves all entered data
- [ ] Wizard works on Chrome Android with 3G throttling and viewport ≤ 360px
- [ ] All strings available in English and Setswana
- [ ] Old form accessible via feature flag for rollback
- [ ] Submission triggers existing AI triage classification

---

## Phase 2: SMS Acknowledgement & Tracking

**Goal:** Citizens receive SMS confirmation with a reference number when they file a complaint, and can check status via SMS or the website.

**Why:** Currently complaints vanish into a database. Citizens have no feedback loop — they don't know if anyone is working on their case. This is the #1 reason they give up.

### Success Criteria

| Metric | Target |
|--------|--------|
| SMS delivery rate | > 95% within 60 seconds of submission |
| Complaint tracking page usage | > 40% of filers check status at least once |
| Repeat complaint rate (same issue, same person) | -25% (fewer "did you get my complaint?" duplicates) |

### Prerequisites

- [ ] SMS gateway provider selected and contract signed (see decision matrix below)
- [ ] Legal review of SMS data retention and consent requirements
- [ ] Phase 1 wizard deployed (SMS integration hooks into wizard confirmation)

### SMS Gateway Decision Matrix

| Provider | Botswana Coverage | Cost/SMS | API Quality | Local Support | Recommendation |
|----------|------------------|----------|-------------|---------------|----------------|
| Africa's Talking | Direct (preferred) | ~0.02 USD | Good REST API, webhooks | Regional office in Nairobi | **First choice** — best Africa coverage |
| Twilio | Via international routes | ~0.05 USD | Excellent | None local | Backup — higher cost, sometimes delayed delivery via BW carriers |
| Local bulk SMS (Mascom/Orange API) | Native | Cheapest | Varies, often SOAP | Local | Evaluate if AT fails — API quality is the risk |

> **Decision needed before sprint starts:** Which provider? Budget approval for estimated monthly SMS volume (estimate: 500–2,000 SMS/month at current complaint rates).

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SMS delivery failures on specific carriers | Medium | High | Implement delivery status webhooks; retry logic with exponential backoff; fallback to email |
| Phone number format validation edge cases | Medium | Medium | Validate against Botswana numbering plan (+267 7X/8X, 7–8 digits); reject international numbers unless explicitly supported |
| Rate limiting abuse (spam via complaint form) | Low | Medium | Rate limit: max 5 SMS per phone per 24h; reCAPTCHA already on form |
| Reference number collisions | Low | High | Use format `BOCRA-{YEAR}-{RANDOM5}` with unique constraint; retry on collision |

### Tasks

- [ ] `[M]` Select and integrate SMS gateway provider
- [ ] `[L]` Create Supabase Edge Function `send-sms/index.ts`
  - Accept: phone number, message body, reference number
  - Validate phone format (Botswana: `+267` followed by 7 or 8 digits)
  - Call SMS gateway API with retry logic (3 attempts, exponential backoff)
  - Log delivery status to `sms_log` table
  - Rate limit: max 5 SMS per phone per 24 hours
- [ ] `[M]` Implement complaint reference number generation
  - Format: `BOCRA-2026-XXXXX` (5 random alphanumeric characters)
  - Add `reference_number TEXT UNIQUE` column to `complaints` table
  - Auto-generate via Supabase database trigger on insert
- [ ] `[S]` Send acknowledgement SMS on complaint submission
  - Template: `"BOCRA Ref: {ref}. Your complaint about {provider} has been received. Expected response: 2 business days. Track: bocra.org.bw/track/{ref}"`
  - Template (Setswana): _[Draft needed]_
- [ ] `[L]` Create `TrackComplaintPage.jsx` — public status tracking page
  - Input: reference number (no login required — reference number acts as access token)
  - Display: date filed, current status, assigned department, last update, expected resolution date
  - Handle: invalid reference numbers gracefully ("We couldn't find that reference. Check the number and try again.")
- [ ] `[M]` Send status update SMS when complaint status changes
  - Add Supabase database trigger on `complaints.status` column change
  - Templates per status transition (received → investigating → resolved / dismissed)
- [ ] `[S]` Add route `/services/track-complaint` to `App.jsx`
- [ ] `[M]` Add Setswana translations for all SMS templates and tracking page
- [ ] `[S]` Create SMS delivery monitoring dashboard in admin (delivery rates, failures, costs)

**New files:**
- `supabase/functions/send-sms/index.ts`
- `src/pages/public/TrackComplaintPage.jsx`
- `supabase/migrations/xxx_add_reference_numbers.sql`
- `supabase/migrations/xxx_create_sms_log.sql`

**Database changes:**
- Add `reference_number TEXT UNIQUE` to `complaints`
- Create `sms_log` table: `(id UUID, phone_hash TEXT, message_type TEXT, delivery_status TEXT, error_message TEXT, created_at TIMESTAMPTZ)`

**Estimated total effort:** 3–4 weeks (1 developer + SMS provider onboarding)

### Acceptance Criteria

- [ ] Filing a complaint generates a unique reference number and sends SMS within 60 seconds
- [ ] Citizens can enter reference number on tracking page and see current status without logging in
- [ ] Status change triggers SMS notification to complainant
- [ ] SMS delivery failures are logged and visible in admin dashboard
- [ ] Rate limiting prevents abuse (max 5 SMS per phone per 24h)
- [ ] All templates available in English and Setswana

---

## Phase 3: Complaint Outcomes Transparency

**Goal:** Publish aggregate complaint data so citizens can see that complaining actually works, and operators face public accountability.

**Why:** If citizens see "83% of billing complaints against Mascom were resolved in the complainant's favour last quarter," they're far more likely to file their own complaint. It also pressures operators to improve.

### Success Criteria

| Metric | Target |
|--------|--------|
| Page views on outcomes dashboard | > 500/month within first quarter |
| Complaint filing rate after dashboard launch | +15% increase |
| Media/press references to BOCRA complaint data | At least 1 in first quarter |

### Prerequisites

- [ ] BOCRA legal team approves publishing aggregate complaint data by provider name
- [ ] Historical complaint data has `outcome` and `remedy` fields backfilled (or decision made to start from launch date)
- [ ] Admin workflow for recording outcomes is in place

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Operators lobby against being named in public stats | High | High | Pre-brief operators; frame as industry transparency best practice; consult BOCRA legal |
| Insufficient data for meaningful aggregates | Medium | Medium | Set minimum threshold: don't show provider stats with < 10 complaints in period |
| PII leakage through small-sample aggregates | Low | Critical | Never show stats for groupings with < 5 complaints; no individual case details |

### Tasks

- [ ] `[XL]` Create `ComplaintOutcomesPage.jsx` — public dashboard
  - Total complaints filed (this quarter / this year / all time)
  - Breakdown by provider (horizontal bar chart)
  - Breakdown by category (donut chart)
  - Resolution rate per provider (% upheld, % dismissed, % pending)
  - Average resolution time per provider (days)
  - Remedies offered breakdown (refunds, service restored, apologies, compensation)
  - Trend over time (line chart — monthly complaint volume)
  - Minimum display threshold: only show provider data where n ≥ 10 complaints in period
- [ ] `[L]` Create Supabase Edge Function `complaint-stats/index.ts`
  - Aggregate queries on `complaints` table
  - Cache results with 24-hour TTL (refresh on demand from admin)
  - Enforce PII guardrails: no stats for groupings with < 5 records
- [ ] `[M]` Add `outcome` and `remedy` columns to `complaints` table
  - `outcome`: `upheld` | `dismissed` | `withdrawn` | `pending`
  - `remedy`: `refund` | `service_restored` | `apology` | `compensation` | `none` | `other`
- [ ] `[M]` Add outcome recording UI in `AdminComplaintsPage.jsx`
  - Dropdowns for outcome + remedy when resolving a complaint
  - Required fields before marking complaint as resolved
- [ ] `[S]` Add route `/services/complaint-outcomes` to `App.jsx`
- [ ] `[M]` Add Setswana translations
- [ ] `[S]` Use Recharts (already installed) for all visualizations

**New files:**
- `src/pages/public/ComplaintOutcomesPage.jsx`
- `supabase/functions/complaint-stats/index.ts`
- `supabase/migrations/xxx_add_complaint_outcomes.sql`

**Estimated total effort:** 3 weeks (1 developer + legal/comms coordination)

### Acceptance Criteria

- [ ] Dashboard loads in < 3 seconds with cached data
- [ ] No individual complaint details or PII exposed (only aggregates, minimum n=5)
- [ ] Admin can record outcome and remedy when resolving complaints
- [ ] Charts render correctly on mobile (≤ 360px viewport)
- [ ] Data refreshes every 24 hours automatically; admin can force refresh

---

## Phase 4: Consultation Improvements

**Goal:** Make public consultations accessible to ordinary citizens, not just lawyers and industry insiders.

### 4A: Plain Language Summaries

**Effort:** 1 week | **Impact:** High — removes the biggest barrier to citizen participation

#### Tasks

- [ ] `[S]` Add `plain_summary` and `plain_summary_tn` columns to `consultations` table
- [ ] `[M]` Add summary fields to `AdminConsultationsPage.jsx` editor
  - Guidance text for authors: "Write as if explaining to a neighbour. No legal jargon. 2–3 paragraphs max."
  - Character limit: 500 characters
  - Preview toggle showing how it will appear to citizens
- [ ] `[M]` Display plain language summary prominently at top of each consultation on `ConsultationsPage.jsx`
  - Full consultation paper collapsed below ("Read the full document")
- [ ] `[S]` Show Setswana summary when language is set to `tn`

**Files to modify:**
- `src/pages/public/ConsultationsPage.jsx`
- `src/pages/admin/AdminConsultationsPage.jsx`
- `supabase/migrations/xxx_add_consultation_summaries.sql`

### 4B: Structured Submission Form

**Effort:** 1.5 weeks | **Impact:** Medium — improves quality of submissions and enables analysis

#### Tasks

- [ ] `[L]` Replace blank comment textarea with guided prompts:
  - "What is your main concern about this proposal?" _(required)_
  - "How does this affect you personally?" _(optional)_
  - "What would you suggest instead?" _(optional)_
  - "Is there anything else BOCRA should consider?" _(optional)_
- [ ] `[M]` Create `consultation_responses` table with structured columns:
  - `consultation_id`, `respondent_name`, `respondent_type` (citizen / industry / academic / other), `main_concern`, `personal_impact`, `suggestion`, `additional_comments`, `language`, `created_at`
- [ ] `[S]` Add respondent type selector
- [ ] `[S]` Keep "Free-form comment" toggle for users who prefer an open textarea
- [ ] `[M]` Add Setswana translations for all prompts

**Files to modify:**
- `src/pages/public/ConsultationsPage.jsx`
- `supabase/migrations/xxx_create_consultation_responses.sql`

### 4C: Consultation Analytics (Internal)

**Effort:** 2 weeks | **Impact:** Medium — enables evidence-based regulatory decisions

#### Tasks

- [ ] `[L]` Create analytics section in `AdminConsultationsPage.jsx`:
  - Total submissions count with trend indicator
  - Demographic breakdown (respondent type — pie chart)
  - Language breakdown (EN vs TN submissions)
  - Sentiment analysis summary (positive / negative / neutral via Claude edge function)
  - Top themes extracted from responses (word cloud or ranked list)
- [ ] `[L]` Create Supabase Edge Function `analyze-consultation/index.ts`
  - Input: `consultation_id`
  - Process: Claude summarization over all responses
  - Output: theme clusters, sentiment breakdown, key concerns, representative (anonymized) quotes
  - Cache results; manual re-run from admin UI
- [ ] `[M]` Add "Generate Report" button producing downloadable PDF/CSV summary

**New files:**
- `supabase/functions/analyze-consultation/index.ts`

**Estimated total effort (all 4A–4C):** 4–5 weeks (1 developer)

---

## Phase 5: Semantic Search

**Goal:** Replace keyword matching with meaning-based search so citizens find what they need even when they don't know the right terminology.

**Why:** A citizen typing "my internet was cut off unfairly" should find consumer rights pages and complaint forms, even though those exact words don't appear in any document title.

### Success Criteria

| Metric | Baseline (current) | Target |
|--------|-------------------|--------|
| Search-to-click rate | _Measure now_ | +40% improvement |
| "No results" rate | _Measure now_ | < 5% of searches |
| Average results relevance (manual audit) | _Audit now_ | > 80% of top-3 results are relevant |

### Prerequisites

- [ ] `pgvector` extension available on current Supabase plan (check: `SELECT * FROM pg_extension WHERE extname = 'vector';`)
- [ ] Embedding API provider selected (OpenAI `text-embedding-3-small` or alternative)
- [ ] Content audit: inventory of all searchable content types and estimated total chunks

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| pgvector query performance degrades with volume | Low (< 10K docs) | Medium | Index with IVFFlat or HNSW; benchmark at 2x expected volume before launch |
| Embedding API costs exceed budget at scale | Low | Medium | Use `text-embedding-3-small` (cheapest); cache embeddings; re-embed only on content change |
| Embedding API downtime blocks all search | Medium | High | Implement automatic fallback to current keyword search when embedding service is unavailable |
| Bilingual content (EN/TN) degrades embedding quality | Medium | Medium | Embed EN and TN versions separately; detect query language and search appropriate index |

### Tasks

- [ ] `[M]` Enable `pgvector` extension in Supabase
- [ ] `[L]` Create `search_embeddings` table:
  - `id UUID`, `content_type TEXT` (page/document/faq/consultation/news), `content_id TEXT`, `title TEXT`, `chunk_text TEXT`, `language TEXT` (en/tn), `embedding VECTOR(1536)`, `metadata JSONB`, `updated_at TIMESTAMPTZ`
  - Add HNSW index on `embedding` column
- [ ] `[L]` Create embedding generation pipeline (`scripts/generate-embeddings.js`)
  - Chunk content by type (pages → full page; documents → 500-token chunks with overlap; FAQs → question + answer as single chunk)
  - Generate embeddings via API
  - Upsert to `search_embeddings` table
  - Log: total chunks, time taken, cost estimate
- [ ] `[M]` Add Supabase trigger or cron to re-embed on content change
- [ ] `[L]` Create `search-semantic/index.ts` Edge Function
  - Accept: query string, optional filters (content_type, sector, date range)
  - Generate query embedding
  - Cosine similarity search with configurable threshold (default: 0.7)
  - Return top N results with relevance scores
  - Automatic fallback to keyword search if embedding service is unavailable
- [ ] `[L]` Update `SearchPage.jsx`
  - Relevance score indicators (visual bar or percentage)
  - Filters: topic, date range, document type, sector (telecoms / broadcasting / postal)
  - "Did you mean?" suggestions for low-confidence results (similarity < 0.5)
  - Loading state while embedding generates
- [ ] `[M]` Add search analytics logging (query text, results count, clicked result, timestamp)

**New files:**
- `supabase/functions/search-semantic/index.ts`
- `supabase/migrations/xxx_enable_pgvector.sql`
- `supabase/migrations/xxx_create_search_embeddings.sql`
- `scripts/generate-embeddings.js`

**Files to modify:**
- `src/pages/public/SearchPage.jsx`

**Estimated total effort:** 4 weeks (1 developer)

---

## Phase 6: Guided Journeys (Decision Trees)

**Goal:** Step-by-step wizards for common tasks beyond complaints — "I have a problem with my ISP", "I want to apply for a licence", "I need to find a regulation."

### Tasks

- [ ] `[M]` Design journey data model (JSON tree structure):
  ```json
  {
    "id": "isp-problem",
    "title": "I have a problem with my ISP",
    "title_tn": "Ke na le bothata le ISP ya me",
    "steps": [
      {
        "question": "What kind of problem?",
        "question_tn": "Bothata ke eng?",
        "options": [
          { "label": "Billing", "label_tn": "Tuelo", "next": "step_billing" },
          { "label": "Service quality", "label_tn": "Boleng jwa tirelo", "next": "step_quality" }
        ]
      }
    ],
    "outcomes": {
      "file_complaint": { "action": "redirect", "target": "/services/file-complaint" },
      "contact_provider": { "action": "show_info", "content": "provider_contacts" }
    }
  }
  ```
- [ ] `[L]` Create `GuidedJourney.jsx` reusable component
  - Renders one step at a time with animation transitions
  - Back / forward navigation with state preservation
  - Progress indicator
  - Terminal nodes link to actual pages/forms
- [ ] `[M]` Create `GuidedJourneysPage.jsx` — landing page listing all available journeys with icons and descriptions
- [ ] `[L]` Implement initial journeys (5 journeys):
  - "I have a problem with my ISP/operator"
  - "I want to apply for a licence"
  - "I want to find a specific regulation"
  - "I want to participate in a consultation"
  - "I want to register a .BW domain"
- [ ] `[M]` Add journey suggestions on homepage and as chatbot responses
- [ ] `[S]` Add routes: `/services/guided-journeys` and `/services/guided-journeys/:journeyId`
- [ ] `[L]` Add Setswana translations for all journey content

**New files:**
- `src/components/ui/GuidedJourney.jsx`
- `src/pages/public/GuidedJourneysPage.jsx`
- `src/data/journeys.js`

**Estimated total effort:** 3 weeks (1 developer)

---

## Phase 7: Subscription Notifications (Regulatory Alerts)

**Goal:** Citizens and licensees subscribe to regulatory areas and get notified (email/SMS) when new documents, consultations, or regulations are published.

### Prerequisites

- [ ] Phase 2 SMS infrastructure operational (reuse `send-sms` edge function)
- [ ] Email sending provider selected (Resend, SendGrid, or Supabase built-in)
- [ ] Legal review of email/SMS marketing consent requirements under Botswana law

### Tasks

- [ ] `[M]` Create `subscriptions` table:
  - `id UUID`, `email TEXT`, `phone TEXT`, `areas JSONB` (array of: telecoms, broadcasting, postal, internet_ict, licensing, cybersecurity, all), `channel TEXT` (email / sms / both), `verified BOOLEAN DEFAULT false`, `verification_token TEXT`, `created_at TIMESTAMPTZ`
- [ ] `[L]` Create `SubscribePage.jsx` — public subscription management
  - Select areas of interest (checkboxes with plain-language descriptions)
  - Enter email and/or phone
  - Email verification flow (send verification link with token)
  - Unsubscribe link in every notification; also accessible from this page with email/phone lookup
- [ ] `[L]` Create `send-notification/index.ts` Edge Function
  - Triggered when admin publishes new content
  - Query subscribers by matching area
  - Send email and/or SMS based on subscriber preference
  - Per-notification-type templates (new document, new consultation, regulation change)
  - Batch sending with rate limiting (max 50/second)
  - Delivery logging
- [ ] `[M]` Add "Notify subscribers" toggle in admin pages:
  - `DocumentsManagerPage.jsx` — on publish
  - `AdminConsultationsPage.jsx` — on new consultation
  - `NewsManagerPage.jsx` — on publish
- [ ] `[S]` Add "Subscribe to updates" CTA on relevant public pages (documents, consultations, news)
- [ ] `[S]` Add route `/subscribe` to `App.jsx`
- [ ] `[M]` Add Setswana translations

**New files:**
- `src/pages/public/SubscribePage.jsx`
- `supabase/functions/send-notification/index.ts`
- `supabase/migrations/xxx_create_subscriptions.sql`

**Files to modify:**
- `src/pages/admin/DocumentsManagerPage.jsx`
- `src/pages/admin/AdminConsultationsPage.jsx`
- `src/pages/admin/NewsManagerPage.jsx`

**Estimated total effort:** 3 weeks (1 developer)

---

## Phase 8: FAQ Driven by Real Data

**Goal:** Surface the questions people are actually asking — derived from complaint data, chatbot queries, and search logs — instead of a static hardcoded list.

### Prerequisites

- [ ] Phase 5 semantic search deployed (provides search query logs)
- [ ] Chatbot query logging enabled

### Tasks

- [ ] `[M]` Create `faq_entries` table:
  - `id UUID`, `question TEXT`, `answer TEXT`, `question_tn TEXT`, `answer_tn TEXT`, `category TEXT`, `source TEXT` (manual / chatbot / complaint / search), `frequency_score INT DEFAULT 0`, `last_updated TIMESTAMPTZ`, `published BOOLEAN DEFAULT false`
- [ ] `[S]` Add query logging to `ChatWidget.jsx` (anonymized — no PII):
  - Table: `chat_queries` — `id UUID`, `query_text TEXT`, `matched_topic TEXT`, `created_at TIMESTAMPTZ`
- [ ] `[S]` Add query logging to `SearchPage.jsx`:
  - Table: `search_queries` — `id UUID`, `query_text TEXT`, `results_count INT`, `clicked_result TEXT`, `created_at TIMESTAMPTZ`
- [ ] `[L]` Create admin tool to review top queries and convert to FAQ entries
  - Show: top 20 chatbot questions this month, top 20 search queries, top complaint categories
  - One-click "Create FAQ from this query" button
  - AI-assisted answer drafting via Claude edge function
- [ ] `[M]` Update `FAQsPage.jsx` to fetch from `faq_entries` table
  - Sort by `frequency_score` (most-asked first)
  - Show "Frequently asked" badge for high-frequency items
  - Maintain category grouping
- [ ] `[S]` Seed initial data by migrating current hardcoded FAQs into `faq_entries` table

**New files:**
- `supabase/migrations/xxx_create_faq_tables.sql`

**Files to modify:**
- `src/pages/public/FAQsPage.jsx`
- `src/pages/admin/` (new FAQ admin section or extend existing)
- `src/components/ui/ChatWidget.jsx` (add query logging)
- `src/pages/public/SearchPage.jsx` (add query logging)

**Estimated total effort:** 2 weeks (1 developer)

---

## Implementation Priority & Dependencies

```
                    ┌─────────────────────┐
                    │  Phase 1: Wizard    │ ◄── START HERE
                    └────────┬────────────┘
                             │ (wizard confirmation triggers SMS)
                    ┌────────▼────────────┐
                    │  Phase 2: SMS       │
                    └────────┬────────────┘
                             │ (outcomes need SMS infra for notifications)
                    ┌────────▼────────────┐
                    │  Phase 3: Outcomes  │
                    └─────────────────────┘

  ┌─────────────────────────┐       ┌──────────────────────────┐
  │ Phase 4: Consultations  │       │ Phase 7: Subscriptions   │
  │ (independent — can run  │       │ (independent — but reuses │
  │  parallel with 1–3)     │       │  Phase 2 SMS infra)      │
  └─────────────────────────┘       └──────────────────────────┘

  ┌─────────────────────────┐
  │ Phase 5: Semantic Search│ ──────► Phase 8: Data-Driven FAQ
  └────────┬────────────────┘         (needs search query logs)
           │ (search powers journey suggestions)
  ┌────────▼────────────────┐
  │ Phase 6: Guided Journeys│
  └─────────────────────────┘
```

### Sprint Plan

> **Assumptions:** 1 full-time developer, 2-week sprints, no external blockers.  
> **Adjust if:** Team size changes, SMS provider onboarding is delayed, or legal review is slow.

| Sprint | Dates | Phases | Effort | Citizen Impact | Key Dependency |
|--------|-------|--------|--------|----------------|----------------|
| Sprint 1 | Weeks 1–2 | Phase 1 (Wizard) + Phase 4A (Plain summaries) | Medium | **High** — immediate UX improvement | Baseline analytics instrumented |
| Sprint 2 | Weeks 3–4 | Phase 1 (finish) + Phase 2 (SMS) start | Medium–High | **High** — feedback loop begins | SMS provider contract signed |
| Sprint 3 | Weeks 5–6 | Phase 2 (finish) + Phase 3 (Outcomes) | High | **High** — transparency + accountability | Legal approval for publishing provider data |
| Sprint 4 | Weeks 7–8 | Phase 4B–C (Consultation form + analytics) | Medium | **Medium** — better participation | Phase 4A shipped |
| Sprint 5 | Weeks 9–10 | Phase 5 (Semantic Search) | High | **High** — transforms information access | pgvector available; embedding API budget approved |
| Sprint 6 | Weeks 11–12 | Phase 6 (Guided Journeys) + Phase 7 (Subscriptions) | Medium | **Medium** — proactive engagement | Phase 2 SMS infra for subscriptions |
| Sprint 7 | Weeks 13–14 | Phase 8 (Data-Driven FAQ) + polish/bugs | Low | **Medium** — continuous improvement | Phase 5 search logs collecting data |

**Total timeline: ~14 weeks (3.5 months) with 1 developer.**

---

## Cross-Cutting Requirements

These apply to every phase. Violating any of these is a launch blocker.

| Requirement | Standard | Verification |
|-------------|----------|-------------|
| **Mobile first** | Works on Chrome Android, ≤ 360px viewport, 3G speeds | BrowserStack testing on Tecno/Itel devices |
| **Setswana parity** | Every citizen-facing string in EN and TN before shipping | Translation review checklist in PR template |
| **Offline degradation** | PWA already enabled; new features show cached data, queue submissions | Test with DevTools offline mode |
| **Security** | CORS validation, rate limiting, input sanitization on all new edge functions | Security checklist in PR template (patterns established in existing functions) |
| **Accessibility** | Support existing accessibility widget (high contrast, font sizing, screen reader labels) | Manual WCAG 2.1 AA audit per phase |
| **Analytics** | Every new user-facing feature has events for usage, completion, and abandonment | Verify events firing in dev before merge |

---

## Open Decisions

These must be resolved before their respective phases can start. Assign owners and deadlines.

| # | Decision | Needed By | Owner | Options | Status |
|---|----------|-----------|-------|---------|--------|
| 1 | SMS gateway provider selection | Sprint 2 start | _[Assign]_ | Africa's Talking vs. Twilio vs. local | `[ ]` Open |
| 2 | Legal approval to publish complaint stats by provider name | Sprint 3 start | _[Assign]_ | Approve / anonymize providers / aggregate only | `[ ]` Open |
| 3 | Embedding API provider and budget | Sprint 5 start | _[Assign]_ | OpenAI / Anthropic / open-source (e5-small) | `[ ]` Open |
| 4 | Email sending provider for subscriptions | Sprint 6 start | _[Assign]_ | Resend / SendGrid / Supabase built-in | `[ ]` Open |
| 5 | Complaint outcome data: backfill historical or start fresh? | Sprint 3 start | _[Assign]_ | Backfill / fresh start / hybrid | `[ ]` Open |
