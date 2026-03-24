# BOCRA Platform — Implementation Roadmap

> **Last updated:** 2026-03-24
> **Status legend:** `[ ]` Todo · `[~]` In Progress · `[x]` Done

---

## Phase 1: Consumer Protection — Guided Complaint Wizard

**Goal:** Replace the flat complaint form with a step-by-step wizard that walks citizens through filing a complaint, reducing drop-off and improving data quality.

**Why first:** Complaints are BOCRA's core citizen touchpoint. The current form is a wall of dropdowns — a guided wizard dramatically lowers the barrier to participation.

### Tasks

- [ ] Create `ComplaintWizard.jsx` component with multi-step state machine
  - Step 1: "Who is your service provider?" (visual cards: Mascom, BTC, Orange, etc.)
  - Step 2: "What type of problem?" (contextual to provider — e.g., mobile shows billing/network/data; broadcasting shows signal/content)
  - Step 3: "Have you contacted your provider directly?" (yes/no → if no, guide them to provider contact first with provider's actual support number)
  - Step 4: "Describe what happened" (free text with helper prompts: "When did this start?", "What have you tried?")
  - Step 5: "Your details" (name, phone, email — explain why each is needed)
  - Step 6: Review & submit
- [ ] Add progress bar / step indicator showing current position
- [ ] Add "Back" navigation between steps (preserve state)
- [ ] Wire wizard output to existing `complaints` Supabase table + `classify-complaint` edge function
- [ ] Add expected timeline messaging on confirmation screen ("You will receive acknowledgement within 2 business days")
- [ ] Replace current `FileComplaintPage.jsx` with wizard (keep old form as fallback behind feature flag)
- [ ] Add Setswana translations for all wizard steps and prompts in `translations.js`
- [ ] Test mobile responsiveness — wizard must work on low-end Android devices

**Files to modify:**
- `src/pages/public/FileComplaintPage.jsx`
- `src/lib/translations.js`
- `src/lib/triageConstants.js` (provider → complaint type mapping)

**New files:**
- `src/components/complaints/ComplaintWizard.jsx`
- `src/components/complaints/WizardStep.jsx`

---

## Phase 2: SMS Acknowledgement & Tracking

**Goal:** Citizens receive SMS confirmation with a reference number when they file a complaint, and can check status via SMS or the website.

**Why:** Currently complaints vanish into a database. Citizens have no feedback loop — they don't know if anyone is working on their case. This is the #1 reason they give up.

### Tasks

- [ ] Choose SMS gateway provider (options for Botswana: Africa's Talking, Twilio, or local provider like Mascom/Orange bulk SMS API)
- [ ] Create Supabase Edge Function `send-sms/index.ts`
  - Accept: phone number, message body, reference number
  - Validate phone format (Botswana: +267 followed by 7 or 8 digits)
  - Call SMS gateway API
  - Log delivery status to `sms_log` table
  - Rate limit: max 5 SMS per phone per day
- [ ] Generate unique complaint reference numbers (format: `BOCRA-2026-XXXXX`)
  - Add `reference_number` column to `complaints` table
  - Auto-generate on insert via Supabase database trigger or edge function
- [ ] Send acknowledgement SMS on complaint submission
  - Template: "BOCRA Ref: {ref}. Your complaint about {provider} has been received. Expected response within 2 business days. Track at bocra.org.bw/track/{ref}"
- [ ] Create `TrackComplaintPage.jsx` — public page where citizens enter their reference number to see status
  - Show: date filed, current status, assigned department, last update, expected resolution date
  - No login required (reference number = access token)
- [ ] Send status update SMS when complaint status changes (investigating → resolved, etc.)
  - Add Supabase database trigger on `complaints.status` column change
- [ ] Add route `/services/track-complaint` to `App.jsx`
- [ ] Add Setswana translations for SMS templates and tracking page

**New files:**
- `supabase/functions/send-sms/index.ts`
- `src/pages/public/TrackComplaintPage.jsx`
- `supabase/migrations/xxx_add_reference_numbers.sql`
- `supabase/migrations/xxx_create_sms_log.sql`

**Database changes:**
- Add `reference_number TEXT UNIQUE` to `complaints`
- Create `sms_log` table (id, phone_hash, message_type, status, created_at)

---

## Phase 3: Complaint Outcomes Transparency

**Goal:** Publish aggregate complaint data so citizens can see that complaining actually works, and operators face public accountability.

**Why:** If citizens see "83% of billing complaints against Mascom were resolved in the complainant's favour last quarter," they're far more likely to file their own complaint. It also pressures operators to improve.

### Tasks

- [ ] Create `ComplaintOutcomesPage.jsx` — public dashboard showing:
  - Total complaints filed (this quarter / this year)
  - Breakdown by provider (bar chart)
  - Breakdown by category (pie chart)
  - Resolution rate per provider (% upheld, % dismissed, % pending)
  - Average resolution time per provider
  - Remedies offered (refunds, service restored, apologies, etc.)
  - Trend over time (line chart — are complaints going up or down?)
- [ ] Create Supabase Edge Function `complaint-stats/index.ts`
  - Aggregate queries on `complaints` table
  - Cache results (refresh every 24 hours)
  - No PII exposed — only aggregate numbers
- [ ] Add `outcome` and `remedy` columns to `complaints` table if not present
  - outcome: upheld | dismissed | withdrawn | pending
  - remedy: refund | service_restored | apology | compensation | none
- [ ] Add admin UI for recording complaint outcomes in `AdminComplaintsPage.jsx`
  - Dropdown for outcome + remedy when resolving a complaint
- [ ] Add route `/services/complaint-outcomes` to `App.jsx`
- [ ] Add Setswana translations
- [ ] Use Recharts (already installed) for all visualizations

**New files:**
- `src/pages/public/ComplaintOutcomesPage.jsx`
- `supabase/functions/complaint-stats/index.ts`
- `supabase/migrations/xxx_add_complaint_outcomes.sql`

---

## Phase 4: Consultation Improvements

**Goal:** Make public consultations accessible to ordinary citizens, not just lawyers and industry insiders.

### 4A: Plain Language Summaries

- [ ] Add `plain_summary` and `plain_summary_tn` columns to `consultations` table
- [ ] Add summary fields to `AdminConsultationsPage.jsx` editor
  - Guidance text: "Write as if explaining to a neighbour. No legal jargon. 2-3 paragraphs max."
  - Example: "BOCRA is considering new rules about how ISPs can charge for data. Here is what this means for you and have your say."
- [ ] Display plain language summary prominently at top of each consultation on `ConsultationsPage.jsx`
  - Collapsible "Read the full consultation paper" below it
- [ ] Add Setswana summary display when language is `tn`

**Files to modify:**
- `src/pages/public/ConsultationsPage.jsx`
- `src/pages/admin/AdminConsultationsPage.jsx`
- `supabase/migrations/xxx_add_consultation_summaries.sql`

### 4B: Structured Submission Form

- [ ] Replace blank comment textarea with guided prompts:
  - "What is your main concern about this proposal?" (required)
  - "How does this affect you personally?" (optional)
  - "What would you suggest instead?" (optional)
  - "Is there anything else BOCRA should consider?" (optional)
- [ ] Store responses as structured JSON in `consultation_responses` table
  - Columns: consultation_id, respondent_name, respondent_type (citizen/industry/academic/other), main_concern, personal_impact, suggestion, additional_comments, language, created_at
- [ ] Add respondent type selector (citizen, industry representative, academic, other)
- [ ] Keep option for free-form comment for those who prefer it
- [ ] Add Setswana translations for all prompts

**Files to modify:**
- `src/pages/public/ConsultationsPage.jsx`
- `supabase/migrations/xxx_create_consultation_responses.sql`

### 4C: Consultation Analytics (Internal)

- [ ] Create analytics section in `AdminConsultationsPage.jsx`:
  - Total submissions count
  - Demographic breakdown (respondent type pie chart)
  - Sentiment analysis summary (positive/negative/neutral — via Claude edge function)
  - Word cloud or top themes extracted from responses
  - Language breakdown (EN vs TN submissions)
- [ ] Create Supabase Edge Function `analyze-consultation/index.ts`
  - Takes consultation_id
  - Runs Claude summarization on all responses
  - Returns: theme clusters, sentiment breakdown, key concerns, representative quotes
  - Cache results, re-run on demand
- [ ] Add "Generate Report" button that produces a downloadable PDF/CSV summary

**New files:**
- `supabase/functions/analyze-consultation/index.ts`

---

## Phase 5: Semantic Search

**Goal:** Replace keyword matching with meaning-based search so citizens find what they need even when they don't know the right terminology.

**Why:** A citizen typing "my internet was cut off unfairly" should find consumer rights pages and complaint forms, even though those exact words don't appear in any document title.

### Tasks

- [ ] Generate embeddings for all searchable content
  - Pages, documents, FAQs, consultation papers, news articles
  - Use OpenAI `text-embedding-3-small` or Anthropic embeddings (when available)
  - Store in Supabase `pgvector` extension
- [ ] Create `search-semantic/index.ts` Edge Function
  - Accept query string
  - Generate query embedding
  - Cosine similarity search against stored embeddings
  - Return top N results with relevance scores
  - Fallback to keyword search if embedding service is down
- [ ] Enable `pgvector` extension in Supabase
  - Create `search_embeddings` table (id, content_type, content_id, title, chunk_text, embedding vector(1536), metadata jsonb)
- [ ] Create embedding pipeline
  - Script to generate embeddings for existing content
  - Supabase trigger or cron to re-embed on content change
- [ ] Update `SearchPage.jsx` to use semantic search
  - Show relevance indicators
  - Add filters: topic, date, document type, sector (telecoms/broadcasting/postal)
  - "Did you mean?" suggestions for low-confidence results
- [ ] Add search analytics (log queries to improve results over time)

**New files:**
- `supabase/functions/search-semantic/index.ts`
- `supabase/migrations/xxx_enable_pgvector.sql`
- `supabase/migrations/xxx_create_search_embeddings.sql`
- `scripts/generate-embeddings.js`

**Files to modify:**
- `src/pages/public/SearchPage.jsx`

---

## Phase 6: Guided Journeys (Decision Trees)

**Goal:** Step-by-step wizards for common tasks beyond complaints — "I have a problem with my ISP", "I want to apply for a licence", "I need to find a regulation."

### Tasks

- [ ] Design journey data model (tree of nodes: question → options → next question or action)
  ```
  {
    id: "isp-problem",
    title: "I have a problem with my ISP",
    steps: [
      { question: "What kind of problem?", options: ["Billing", "Service quality", "Contract dispute", "Other"] },
      { question: "Have you contacted your ISP?", options: ["Yes", "No"], actions: { "No": "redirect_to_isp_contacts" } },
      ...
    ],
    outcome: "redirect_to_complaint_wizard"
  }
  ```
- [ ] Create `GuidedJourney.jsx` reusable component
  - Renders one step at a time
  - Back/forward navigation
  - Progress indicator
  - Terminal nodes link to actual pages/forms
- [ ] Create `GuidedJourneysPage.jsx` — landing page listing all available journeys
- [ ] Implement initial journeys:
  - "I have a problem with my ISP/operator"
  - "I want to apply for a licence"
  - "I want to find a specific regulation"
  - "I want to participate in a consultation"
  - "I want to register a .BW domain"
- [ ] Add journeys as suggestions on the homepage and in the chatbot
- [ ] Add route `/services/guided-journeys` and `/services/guided-journeys/:journeyId`
- [ ] Add Setswana translations for all journey content

**New files:**
- `src/components/ui/GuidedJourney.jsx`
- `src/pages/public/GuidedJourneysPage.jsx`
- `src/data/journeys.js` (journey definitions)

---

## Phase 7: Subscription Notifications (Regulatory Alerts)

**Goal:** Citizens and licensees subscribe to regulatory areas and get notified (email/SMS) when new documents, consultations, or regulations are published.

### Tasks

- [ ] Create `subscriptions` table in Supabase
  - Columns: id, email, phone, areas (jsonb array of: telecoms, broadcasting, postal, internet_ict, licensing, cybersecurity, all), channel (email/sms/both), verified, created_at
- [ ] Create `SubscribePage.jsx` — public page to manage subscriptions
  - Select areas of interest (checkboxes with descriptions)
  - Enter email and/or phone
  - Email verification flow (send verification link)
  - Unsubscribe link in every notification
- [ ] Create `send-notification/index.ts` Edge Function
  - Triggered when admin publishes new document, consultation, or regulation
  - Query subscribers by area
  - Send email (via Resend, SendGrid, or Supabase email) and/or SMS
  - Templates per notification type
  - Batch sending with rate limiting
- [ ] Add "Notify subscribers" toggle in admin pages:
  - `DocumentsManagerPage.jsx` — on publish
  - `AdminConsultationsPage.jsx` — on new consultation
  - `NewsManagerPage.jsx` — on publish
- [ ] Add "Subscribe to updates" CTA on relevant public pages
- [ ] Add route `/subscribe` to `App.jsx`
- [ ] Add Setswana translations

**New files:**
- `src/pages/public/SubscribePage.jsx`
- `supabase/functions/send-notification/index.ts`
- `supabase/migrations/xxx_create_subscriptions.sql`

**Files to modify:**
- `src/pages/admin/DocumentsManagerPage.jsx`
- `src/pages/admin/AdminConsultationsPage.jsx`
- `src/pages/admin/NewsManagerPage.jsx`

---

## Phase 8: FAQ Driven by Real Data

**Goal:** Surface the questions people are actually asking — derived from complaint data, chatbot queries, and search logs — instead of a static hardcoded list.

### Tasks

- [ ] Create `faq_entries` table in Supabase
  - Columns: id, question, answer, question_tn, answer_tn, category, source (manual/chatbot/complaint), frequency_score, last_updated, published
- [ ] Log chatbot queries to `chat_queries` table (anonymized — no PII)
  - Columns: id, query_text, matched_topic, created_at
- [ ] Log search queries to `search_queries` table
  - Columns: id, query_text, results_count, clicked_result, created_at
- [ ] Create admin tool to review top queries and convert them into FAQ entries
  - Show: top 20 chatbot questions this month, top 20 search queries, top complaint categories
  - One-click "Create FAQ from this query" button
  - AI-assisted answer drafting via Claude
- [ ] Update `FAQsPage.jsx` to fetch from `faq_entries` table instead of hardcoded data
  - Sort by frequency_score (most-asked first)
  - Show "X people asked this" badge
  - Keep category grouping
- [ ] Seed initial data by migrating current hardcoded FAQs into the table

**New files:**
- `supabase/migrations/xxx_create_faq_tables.sql`

**Files to modify:**
- `src/pages/public/FAQsPage.jsx`
- `src/pages/admin/` (new FAQ admin section or extend existing)
- `src/components/ui/ChatWidget.jsx` (add query logging)
- `src/pages/public/SearchPage.jsx` (add query logging)

---

## Implementation Priority & Dependencies

```
Phase 1: Complaint Wizard ──────────────┐
                                         ├──► Phase 2: SMS (needs wizard for best UX)
Phase 3: Complaint Outcomes ─────────────┘         │
                                                    ▼
Phase 4: Consultation Improvements ──── (independent, can parallel with 1-3)

Phase 5: Semantic Search ──────────────► Phase 8: Data-Driven FAQ (needs search logs)
                                    │
Phase 6: Guided Journeys ──────────┘    (uses search to power journey suggestions)

Phase 7: Subscription Notifications ─── (independent, can start anytime)
```

### Suggested Sprint Plan

| Sprint | Phases | Estimated Effort | Impact |
|--------|--------|-----------------|--------|
| Sprint 1 | Phase 1 (Wizard) + Phase 4A (Plain summaries) | Medium | High — immediate citizen UX improvement |
| Sprint 2 | Phase 2 (SMS) + Phase 3 (Outcomes) | High — SMS needs provider setup | High — closes the feedback loop |
| Sprint 3 | Phase 4B-C (Consultation form + analytics) | Medium | Medium — improves consultation participation |
| Sprint 4 | Phase 5 (Semantic Search) | High — infrastructure (pgvector) | High — transforms information access |
| Sprint 5 | Phase 6 (Guided Journeys) + Phase 7 (Subscriptions) | Medium | Medium — proactive citizen engagement |
| Sprint 6 | Phase 8 (Data-Driven FAQ) | Low | Medium — continuous improvement loop |

---

## Notes

- **Mobile first:** >70% of Botswana internet users are on mobile. Every new feature must work on low-end Android + Chrome.
- **Setswana parity:** Every citizen-facing string needs both EN and TN translations before shipping.
- **Offline consideration:** PWA is already enabled. New features should degrade gracefully when offline (show cached data, queue submissions).
- **Security:** All new edge functions need CORS validation, rate limiting, and input sanitization (patterns already established in existing functions).
- **Accessibility:** New components must support the existing accessibility widget (high contrast, font sizing, screen reader labels).
