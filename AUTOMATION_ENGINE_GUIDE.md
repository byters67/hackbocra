# BOCRA Website — Automated Workflow Engine Build Guide

> **For: Georgi (primary), Webster, Leon**
> **Deadline: 27 March 2026, 17:00 CAT**
> **Tasks: #12–#17 from the master task list (Feature 3)**

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [Project Context (Give This to the AI First)](#2-project-context)
3. [Features to Build](#3-features-to-build)
4. [Database Schema](#4-database-schema)
5. [Technical Setup](#5-technical-setup)
6. [Which Files to Upload for Each Task](#6-which-files-to-upload)
7. [Ready-Made Prompts](#7-ready-made-prompts)
8. [Data Flow](#8-data-flow)
9. [Priority Order](#9-priority-order)
10. [Design Guidelines](#10-design-guidelines)
11. [Quick Start](#11-quick-start)
12. [Important Rules](#12-important-rules)

---

## 1. What This Is

The Automated Workflow Engine is the rules-based automation layer that eliminates manual, repetitive admin tasks on the BOCRA platform. It follows an **Event → Condition → Action** pattern:

- A **trigger event** happens (e.g., new complaint submitted, case idle for 3 days)
- A **condition** is evaluated (e.g., case has no assignee, urgency is "high")
- An **action** fires (e.g., escalate priority, send notification, assign to department)

This powers the headline automation features: auto-acknowledgement of submissions, auto-escalation of stale cases, SLA breach monitoring, and scheduled report generation. It ties directly into the Notification System (Feature 2) and the Admin Portal complaints/incidents workflows.

**This is the feature that turns the BOCRA platform from a form-submission tool into an intelligent regulatory operations system.**

---

## 2. Project Context

**Copy-paste this entire block into your AI chat FIRST before asking anything:**

```
I'm working on the BOCRA website (Botswana Communications Regulatory Authority).

TECH STACK:
- React 18 + Vite 5 (JavaScript/JSX)
- Tailwind CSS 3 for styling
- GSAP + ScrollTrigger for scroll animations
- Recharts for data charts
- Supabase for backend (PostgreSQL database + auth + Edge Functions + Realtime)
- GitHub Pages for hosting (auto-deploys on push)

DESIGN SYSTEM:
- Primary colour: BOCRA Blue #00458B
- Four sector dot colours: Cyan #00A6CE (Telecoms), Magenta #C8237B (Broadcasting), Yellow #F7B731 (Postal), Green #6BBE4E (Internet)
- Heading font: DM Serif Display (class: font-display)
- Body font: Plus Jakarta Sans (class: font-sans)
- Cards use: rounded-2xl, p-7, hover:-translate-y-1, shadow on hover
- Dark nav/sidebar: #001A3A
- Status pills: green=resolved, yellow=pending, red=new/critical, blue=in-review, orange=needs-info
- Content is rendered via dangerouslySetInnerHTML using HTML in template strings
- Apostrophes must be \u2019, em-dashes must be \u2014, ampersands must be &amp;

CURRENT CONTEXT:
I'm building the Automated Workflow Engine (Feature 3 of 9 for the BOCRA hackathon).
This feature handles: auto-escalation of stale cases, auto-acknowledgement of new submissions,
SLA monitoring with visual countdowns, scheduled report generation, and an admin UI to manage rules.
It connects to: complaints table, cyber_incidents table, licence_applications table, notifications table.

IMPORTANT RULES:
- Never remove security features (rate limiting, input sanitisation, RLS)
- Never expose the Supabase service_role key
- Keep all accessibility features (48px touch targets, ARIA labels)
- Use BOCRA dot colours when assigning colours to sectors
- Always give me the COMPLETE file back, not just the changed section
```

---

## 3. Features to Build

### Task #12 — Workflow Rules Table (Priority: P0 — MUST SHIP)

**Owner:** Georgi
**Hours:** 2
**Dependencies:** DB setup

Design and create the `workflow_rules` table — the core of the engine. Every automation rule lives here.

**What it stores:**
- **trigger_event** — what starts the rule (e.g., `complaint.created`, `complaint.idle`, `incident.status_changed`)
- **condition** — JSON object defining when the rule applies (e.g., `{"field": "urgency", "operator": "eq", "value": "critical"}`)
- **action** — what happens (e.g., `escalate_priority`, `send_notification`, `assign_to`, `generate_report`)
- **target** — who/what the action targets (e.g., a department ID, a notification channel)
- **delay** — optional delay before action fires (e.g., `3 days` for idle escalation)
- **is_active** — toggle to enable/disable without deleting

---

### Task #13 — Auto-Escalation (Priority: P0 — MUST SHIP)

**Owner:** Georgi
**Hours:** 3
**Dependencies:** Workflow rules + case model (complaints/incidents tables)

**THE headline automation feature.** If a complaint or incident sits untouched for X days:
1. Escalate its priority level (e.g., medium → high, high → critical)
2. Notify the assigned staff member\u2019s supervisor
3. Log the escalation event in `workflow_logs`

**Logic:**
- Run on a schedule (Supabase cron or Edge Function called every hour)
- Query: complaints/incidents WHERE `status NOT IN ('resolved','closed')` AND `updated_at < now() - interval '[delay from rule]'`
- If match found → execute the rule\u2019s action
- Default thresholds: 3 days for complaints, 1 day for critical incidents, 5 days for licence applications

**For the hackathon demo:**
- Use a Supabase DB function (`check_escalations()`) called via `pg_cron` or a simple Edge Function on a timer
- If `pg_cron` isn\u2019t available, use a "Run Escalation Check" button in the admin dashboard as fallback

---

### Task #14 — Auto-Acknowledge (Priority: P0 — MUST SHIP)

**Owner:** Georgi
**Hours:** 2
**Dependencies:** Workflow rules + notifications

When a new submission arrives (complaint, licence application, cyber incident):
1. Immediately generate a reference number (e.g., `BOCRA/CMP/2026/00042`)
2. Send confirmation to the submitter: in-app notification + email (or mailto: for demo)
3. Include: reference number, expected response timeline, link to track status
4. Log the acknowledgement in `workflow_logs`

**Implementation:**
- Supabase Database trigger (`AFTER INSERT`) on `complaints`, `licence_applications`, `cyber_incidents`
- OR: Edge Function webhook triggered by Supabase Realtime subscription
- OR (hackathon fallback): call the acknowledge function directly from the frontend form\u2019s `onSuccess` handler

**Reference number format:**
```
BOCRA/{TYPE}/{YEAR}/{SEQUENCE}
TYPE: CMP (complaint), LIC (licence), CYB (cyber incident)
YEAR: 4-digit year
SEQUENCE: 5-digit zero-padded auto-increment
```

---

### Task #15 — SLA Monitoring (Priority: P1 — HIGH IMPACT)

**Owner:** Georgi
**Hours:** 3
**Dependencies:** Workflow rules + case model

Monitor Service Level Agreement timelines and alert before breach:

**SLA Targets (configurable per rule):**
| Case Type | Target Resolution Time |
|-----------|----------------------|
| Complaint (standard) | 14 days |
| Complaint (urgent) | 3 days |
| Cyber Incident (critical) | 24 hours |
| Cyber Incident (high) | 3 days |
| Licence Application | 30 days |

**What admin needs:**
- **SLA countdown badge** on each case in the admin list — shows days/hours remaining, colour-coded:
  - Green: >50% time remaining
  - Yellow: 25–50% time remaining
  - Orange: <25% time remaining (auto-alert at this threshold)
  - Red: BREACHED (0% — overdue)
- **Auto-alert at 75% elapsed** — notify assigned staff: "Case BOCRA/CMP/2026/00042 has 3 days remaining"
- **Auto-alert at 100% (breach)** — notify supervisor + flag case in dashboard
- **SLA summary widget on admin dashboard** — donut chart: On Track / At Risk / Breached

---

### Task #16 — Scheduled Report Generation (Priority: P1 — HIGH IMPACT)

**Owner:** Georgi
**Hours:** 3
**Dependencies:** Analytics + doc library

Auto-generate periodic summary reports:

**Weekly report includes:**
- Total complaints received / resolved this week
- Open cyber incidents by urgency
- Licence applications by status
- SLA compliance percentage
- Top 3 complained-about providers

**Implementation:**
- Supabase Edge Function (or `pg_cron` DB function) runs on schedule
- Queries aggregate data from complaints, incidents, applications tables
- Generates a JSON summary → stores in `generated_reports` table
- Notifies admins: "Weekly report for 17–23 March 2026 is ready"
- Admin can view the report in the dashboard or (stretch goal) download as PDF

**For the hackathon demo:**
- A "Generate Report Now" button in the admin dashboard is sufficient
- Show one pre-generated example report with real-looking data
- The scheduled cron part can be described in architecture docs even if not wired up

---

### Task #17 — Admin Workflow Config UI (Priority: P2 — DEMO POLISH)

**Owner:** Georgi
**Hours:** 3
**Dependencies:** Workflow rules populated

No-code admin interface to manage automation rules:

**What admin sees at `/admin/automation`:**
- **Rules list** — table showing all workflow rules: name, trigger, action, status (active/paused), last triggered
- **Toggle switch** — enable/disable each rule without editing
- **Edit thresholds** — click a rule → modal/side panel to change delay (e.g., escalation from 3 days → 5 days), condition values, target
- **Activity log** — recent workflow executions: timestamp, rule name, case affected, action taken, result (success/failed)
- **"Run Now" button** — manually trigger any rule for testing/demo

**This is lower priority.** If time runs out, a simple list with toggles is enough. The backend rules engine matters more than a pretty config UI.

---

## 4. Database Schema

### Core Tables

Run this SQL in the **Supabase SQL Editor** (`https://cyalwtuladeexxfsbrcs.supabase.co`):

```sql
-- ============================================================
-- AUTOMATED WORKFLOW ENGINE — Database Migration
-- Run in: Supabase SQL Editor
-- File: supabase/migrations/004_workflow_engine.sql
-- ============================================================

-- 1. Workflow Rules — the rule definitions
CREATE TABLE workflow_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL,
  condition JSONB DEFAULT '{}',
  action TEXT NOT NULL,
  action_params JSONB DEFAULT '{}',
  target TEXT,
  delay_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage workflow rules"
  ON workflow_rules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','staff')
  ));

-- 2. Workflow Logs — audit trail of every automation execution
CREATE TABLE workflow_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES workflow_rules(id),
  rule_name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  case_type TEXT NOT NULL,
  case_id UUID NOT NULL,
  case_reference TEXT,
  action_taken TEXT NOT NULL,
  action_result TEXT DEFAULT 'success',
  details JSONB DEFAULT '{}',
  executed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view workflow logs"
  ON workflow_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','staff')
  ));

CREATE POLICY "System can insert workflow logs"
  ON workflow_logs FOR INSERT WITH CHECK (true);

-- 3. Generated Reports — output of scheduled report generation
CREATE TABLE generated_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL DEFAULT 'weekly',
  title TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  generated_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view reports"
  ON generated_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','staff')
  ));

CREATE POLICY "System can insert reports"
  ON generated_reports FOR INSERT WITH CHECK (true);

-- 4. Reference Number Sequences
CREATE SEQUENCE IF NOT EXISTS complaint_ref_seq START 1;
CREATE SEQUENCE IF NOT EXISTS licence_ref_seq START 1;
CREATE SEQUENCE IF NOT EXISTS cyber_ref_seq START 1;

-- 5. Auto-Acknowledge Function — called on INSERT
CREATE OR REPLACE FUNCTION generate_reference_number(case_type TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  seq_val INTEGER;
BEGIN
  CASE case_type
    WHEN 'complaint' THEN
      prefix := 'CMP';
      seq_val := nextval('complaint_ref_seq');
    WHEN 'licence' THEN
      prefix := 'LIC';
      seq_val := nextval('licence_ref_seq');
    WHEN 'cyber' THEN
      prefix := 'CYB';
      seq_val := nextval('cyber_ref_seq');
    ELSE
      prefix := 'REF';
      seq_val := nextval('complaint_ref_seq');
  END CASE;
  RETURN 'BOCRA/' || prefix || '/' || EXTRACT(YEAR FROM now())::TEXT || '/' || LPAD(seq_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger: Auto-set reference number on new complaint
CREATE OR REPLACE FUNCTION set_complaint_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_reference_number('complaint');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_complaint_reference
  BEFORE INSERT ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION set_complaint_reference();

-- 7. Trigger: Auto-set reference number on new cyber incident
-- (licence_applications already has reference_number from ADMIN_PORTAL_GUIDE)
CREATE OR REPLACE FUNCTION set_cyber_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_reference_number('cyber');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cyber_reference
  BEFORE INSERT ON cyber_incidents
  FOR EACH ROW
  EXECUTE FUNCTION set_cyber_reference();

-- 8. Escalation Check Function — called on schedule or manually
CREATE OR REPLACE FUNCTION check_escalations()
RETURNS JSONB AS $$
DECLARE
  rule RECORD;
  stale_case RECORD;
  escalation_count INTEGER := 0;
  results JSONB := '[]'::JSONB;
BEGIN
  FOR rule IN
    SELECT * FROM workflow_rules
    WHERE is_active = true
      AND trigger_event LIKE '%.idle'
      AND action = 'escalate_priority'
  LOOP
    -- Check complaints
    IF rule.trigger_event = 'complaint.idle' THEN
      FOR stale_case IN
        SELECT id, reference_number, status, updated_at
        FROM complaints
        WHERE status NOT IN ('resolved', 'closed')
          AND updated_at < now() - (rule.delay_minutes || ' minutes')::INTERVAL
      LOOP
        -- Log the escalation
        INSERT INTO workflow_logs (rule_id, rule_name, trigger_event, case_type, case_id, case_reference, action_taken, details)
        VALUES (rule.id, rule.name, rule.trigger_event, 'complaint', stale_case.id, stale_case.reference_number, 'escalate_priority',
                jsonb_build_object('previous_status', stale_case.status, 'idle_since', stale_case.updated_at));

        escalation_count := escalation_count + 1;
      END LOOP;
    END IF;

    -- Check cyber incidents
    IF rule.trigger_event = 'incident.idle' THEN
      FOR stale_case IN
        SELECT id, reference_number, status, updated_at
        FROM cyber_incidents
        WHERE status NOT IN ('resolved', 'closed')
          AND updated_at < now() - (rule.delay_minutes || ' minutes')::INTERVAL
      LOOP
        INSERT INTO workflow_logs (rule_id, rule_name, trigger_event, case_type, case_id, case_reference, action_taken, details)
        VALUES (rule.id, rule.name, rule.trigger_event, 'cyber_incident', stale_case.id, stale_case.reference_number, 'escalate_priority',
                jsonb_build_object('previous_status', stale_case.status, 'idle_since', stale_case.updated_at));

        escalation_count := escalation_count + 1;
      END LOOP;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('escalations', escalation_count, 'checked_at', now());
END;
$$ LANGUAGE plpgsql;

-- 9. Seed Default Rules
INSERT INTO workflow_rules (name, description, trigger_event, condition, action, action_params, delay_minutes) VALUES
  ('Escalate stale complaints', 'Auto-escalate complaints untouched for 3 days', 'complaint.idle', '{"status_not_in": ["resolved","closed"]}', 'escalate_priority', '{"notify_supervisor": true}', 4320),
  ('Escalate critical incidents', 'Auto-escalate critical cyber incidents untouched for 24 hours', 'incident.idle', '{"urgency": "critical", "status_not_in": ["resolved","closed"]}', 'escalate_priority', '{"notify_supervisor": true}', 1440),
  ('Escalate stale applications', 'Auto-escalate licence applications untouched for 5 days', 'application.idle', '{"status_not_in": ["approved","rejected"]}', 'escalate_priority', '{"notify_supervisor": true}', 7200),
  ('Auto-acknowledge complaint', 'Send immediate confirmation on new complaint', 'complaint.created', '{}', 'send_acknowledgement', '{"channels": ["in_app","email"], "include_reference": true, "include_timeline": true}', 0),
  ('Auto-acknowledge incident', 'Send immediate confirmation on new incident report', 'incident.created', '{}', 'send_acknowledgement', '{"channels": ["in_app","email"], "include_reference": true}', 0),
  ('SLA warning at 75%', 'Alert staff when case reaches 75% of SLA target', 'sla.warning', '{"threshold_percent": 75}', 'send_notification', '{"channels": ["in_app"], "urgency": "high"}', 0),
  ('SLA breach alert', 'Alert supervisor when SLA is breached', 'sla.breach', '{"threshold_percent": 100}', 'send_notification', '{"channels": ["in_app","email"], "notify_supervisor": true, "urgency": "critical"}', 0),
  ('Weekly summary report', 'Auto-generate weekly stats report every Monday', 'schedule.weekly', '{"day": "monday", "hour": 8}', 'generate_report', '{"report_type": "weekly"}', 0);

-- 10. Add reference_number column to complaints if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'complaints' AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE complaints ADD COLUMN reference_number TEXT UNIQUE;
  END IF;
END $$;
```

---

## 5. Technical Setup

### File Structure

```
src/
  pages/
    admin/
      AutomationPage.jsx       ← workflow rules list + config UI (Task #17)
      AutomationLogPage.jsx    ← workflow execution log viewer
  components/
    admin/
      SLABadge.jsx             ← SLA countdown pill component (Task #15)
      EscalationBanner.jsx     ← banner shown when case was auto-escalated
      WorkflowRuleCard.jsx     ← single rule card with toggle + edit
      WorkflowLogTable.jsx     ← table of recent workflow executions
      ReportViewer.jsx         ← display generated report data (Task #16)
  lib/
    workflow.js                ← client-side workflow helpers (call Supabase RPCs)
    sla.js                     ← SLA calculation utilities
    referenceNumber.js         ← reference number generation (frontend fallback)
```

### Routes to Add in App.jsx

```jsx
import AdminAutomation from './pages/admin/AutomationPage';
import AdminAutomationLog from './pages/admin/AutomationLogPage';

// Inside the <Route path="/admin" element={<AdminLayout />}> block:
<Route path="automation" element={<AdminAutomation />} />
<Route path="automation/logs" element={<AdminAutomationLog />} />
```

### Sidebar Addition (in AdminLayout.jsx / AdminSidebar)

Add to the navigation items array:
```jsx
{ label: 'Automation', path: '/admin/automation', icon: Zap }  // from lucide-react
```

### Key Supabase Client Calls

```javascript
// lib/workflow.js

import { supabase } from './supabase';

// Fetch all active workflow rules
export async function getWorkflowRules() {
  const { data, error } = await supabase
    .from('workflow_rules')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Toggle a rule on/off
export async function toggleRule(ruleId, isActive) {
  const { data, error } = await supabase
    .from('workflow_rules')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', ruleId)
    .select();
  return { data, error };
}

// Update rule thresholds
export async function updateRule(ruleId, updates) {
  const { data, error } = await supabase
    .from('workflow_rules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', ruleId)
    .select();
  return { data, error };
}

// Manually trigger escalation check
export async function runEscalationCheck() {
  const { data, error } = await supabase.rpc('check_escalations');
  return { data, error };
}

// Fetch workflow logs
export async function getWorkflowLogs(limit = 50) {
  const { data, error } = await supabase
    .from('workflow_logs')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(limit);
  return { data, error };
}

// Generate weekly report on demand
export async function generateWeeklyReport() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  // Fetch aggregated data
  const [complaints, incidents, applications] = await Promise.all([
    supabase.from('complaints').select('*', { count: 'exact' })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString()),
    supabase.from('cyber_incidents').select('*', { count: 'exact' })
      .gte('created_at', startDate.toISOString()),
    supabase.from('licence_applications').select('*', { count: 'exact' })
      .gte('created_at', startDate.toISOString()),
  ]);

  const reportData = {
    period: { start: startDate.toISOString(), end: endDate.toISOString() },
    complaints: { total: complaints.count, data: complaints.data },
    incidents: { total: incidents.count, data: incidents.data },
    applications: { total: applications.count, data: applications.data },
  };

  // Store report
  const { data, error } = await supabase
    .from('generated_reports')
    .insert({
      report_type: 'weekly',
      title: `Weekly Report: ${startDate.toLocaleDateString()} \u2013 ${endDate.toLocaleDateString()}`,
      period_start: startDate.toISOString().split('T')[0],
      period_end: endDate.toISOString().split('T')[0],
      data: reportData,
    })
    .select();

  return { data, error };
}
```

### SLA Calculation Utility

```javascript
// lib/sla.js

const SLA_TARGETS = {
  complaint: { standard: 14 * 24 * 60, urgent: 3 * 24 * 60 },       // minutes
  cyber_incident: { critical: 24 * 60, high: 3 * 24 * 60, medium: 7 * 24 * 60, low: 14 * 24 * 60 },
  licence_application: { default: 30 * 24 * 60 },
};

export function calculateSLA(caseType, urgency, createdAt) {
  const targetMinutes = SLA_TARGETS[caseType]?.[urgency]
    || SLA_TARGETS[caseType]?.standard
    || SLA_TARGETS[caseType]?.default
    || 14 * 24 * 60;

  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 60000;
  const remaining = targetMinutes - elapsed;
  const percentElapsed = Math.min((elapsed / targetMinutes) * 100, 100);

  let status = 'on_track';         // green
  if (percentElapsed >= 100) status = 'breached';    // red
  else if (percentElapsed >= 75) status = 'at_risk';  // orange
  else if (percentElapsed >= 50) status = 'warning';  // yellow

  return {
    targetMinutes,
    elapsedMinutes: Math.round(elapsed),
    remainingMinutes: Math.max(0, Math.round(remaining)),
    percentElapsed: Math.round(percentElapsed),
    status,
    remainingHuman: formatRemaining(remaining),
  };
}

function formatRemaining(minutes) {
  if (minutes <= 0) return 'OVERDUE';
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return `${Math.round(minutes)}m`;
}
```

---

## 6. Which Files to Upload for Each Task

| What you want to do | Upload this file from GitHub |
|---------------------|----------------------------|
| Build the automation rules config page | `src/pages/admin/AutomationPage.jsx` (create new) |
| Build the automation log viewer | `src/pages/admin/AutomationLogPage.jsx` (create new) |
| Add SLA badge to complaint/incident lists | `src/pages/admin/ComplaintsPage.jsx` + `src/components/admin/SLABadge.jsx` (create new) |
| Add workflow helper functions | `src/lib/workflow.js` (create new) |
| Add SLA calculation utility | `src/lib/sla.js` (create new) |
| Add automation route to admin | `src/App.jsx` + `src/pages/admin/AdminLayout.jsx` |
| Add sidebar nav item for automation | `src/pages/admin/AdminLayout.jsx` |
| Build the report viewer component | `src/components/admin/ReportViewer.jsx` (create new) |
| Add SLA donut chart to admin dashboard | `src/pages/admin/DashboardPage.jsx` |
| Run database migration | Copy SQL from Section 4 into Supabase SQL Editor |

**How to download a file from GitHub:**
1. Go to https://github.com/hackathonteamproject/hackathonteamproject
2. Navigate to the file
3. Click the file → click **"Raw"** → right-click → **"Save as"**

---

## 7. Ready-Made Prompts

### 7.1 Create the Automation Rules Page

**Upload:** `AdminLayout.jsx` (for reference on layout patterns)

```
I'm working on the BOCRA website (Botswana Communications Regulatory Authority).
[PASTE THE PROJECT CONTEXT FROM SECTION 2 ABOVE]

Create a new file: src/pages/admin/AutomationPage.jsx

This is the admin page for managing automation rules. It should:
- Fetch all rows from the workflow_rules Supabase table
- Display them in a card list, each card showing: rule name, description, trigger_event, action, delay (human-readable), is_active toggle
- Toggle switch calls supabase update to flip is_active
- Click a card to open an edit modal: change delay_minutes, condition JSON, target
- "Run Escalation Check" button at the top that calls supabase.rpc('check_escalations') and shows the result
- "Generate Report" button that triggers the weekly report function
- Activity log section at the bottom: last 20 rows from workflow_logs table

Use Tailwind CSS. Follow BOCRA design: cards with rounded-2xl, BOCRA blue buttons, status pills.
Use lucide-react icons: Zap for automation, Clock for delay, Play for run, ToggleLeft/ToggleRight for active.

Give me the COMPLETE file.
```

### 7.2 Create the SLA Badge Component

```
I'm working on the BOCRA website.
[PASTE THE PROJECT CONTEXT FROM SECTION 2 ABOVE]

Create a new file: src/components/admin/SLABadge.jsx

This is a small pill/badge component that shows the SLA status of a case. Props:
- caseType: 'complaint' | 'cyber_incident' | 'licence_application'
- urgency: 'standard' | 'urgent' | 'critical' | 'high' | 'medium' | 'low'
- createdAt: ISO date string

It should:
- Calculate time remaining using SLA targets:
  Complaints: 14 days standard, 3 days urgent
  Cyber: 24h critical, 3d high, 7d medium, 14d low
  Licences: 30 days
- Display a pill badge with:
  Green (#6BBE4E): >50% time remaining — text: "12d 4h left"
  Yellow (#F7B731): 25-50% remaining — text: "3d 2h left"
  Orange: <25% remaining — text: "6h left ⚠"
  Red: breached — text: "OVERDUE (2d)"
- Tooltip on hover showing: target time, elapsed time, percentage

Use Tailwind CSS. Keep it small and inline-friendly (for use inside table rows).
Give me the COMPLETE file.
```

### 7.3 Add SLA Badges to the Complaints List

**Upload:** `src/pages/admin/ComplaintsPage.jsx`

```
I've uploaded ComplaintsPage.jsx from the BOCRA website admin portal.
[PASTE THE PROJECT CONTEXT FROM SECTION 2 ABOVE]

Modify this file to:
1. Import SLABadge from '../../components/admin/SLABadge'
2. Add an "SLA" column to the complaints table, after the Status column
3. In each row, render: <SLABadge caseType="complaint" urgency={getUrgency(complaint)} createdAt={complaint.created_at} />
4. For urgency mapping: if complaint.complaint_type includes "urgent" or "network outage", use "urgent", otherwise "standard"
5. Add a filter option: "SLA Status" with options: All, On Track, At Risk, Breached

Don't change any other functionality. Give me the COMPLETE file.
```

### 7.4 Add SLA Summary to the Admin Dashboard

**Upload:** `src/pages/admin/DashboardPage.jsx`

```
I've uploaded DashboardPage.jsx from the BOCRA website admin portal.
[PASTE THE PROJECT CONTEXT FROM SECTION 2 ABOVE]

Add a new section to the dashboard: "SLA Compliance"

Include:
1. A donut chart (Recharts PieChart) showing: On Track (green #6BBE4E), At Risk (yellow #F7B731), Breached (red #C8237B)
2. Calculate by querying all open complaints + incidents, running SLA calculation on each
3. A stat card: "SLA Compliance Rate: X%" (percentage of non-breached cases)
4. Below the chart: "X cases at risk, Y cases breached" with links to filtered views

Also add:
5. A "Recent Automations" card showing last 5 rows from workflow_logs: timestamp, rule name, case reference, action taken
6. A "Run Escalation Check" quick-action button

Use Recharts (already installed). BOCRA colours for the chart.
Give me the COMPLETE file.
```

### 7.5 Create the Workflow Log Viewer

```
I'm working on the BOCRA website.
[PASTE THE PROJECT CONTEXT FROM SECTION 2 ABOVE]

Create a new file: src/pages/admin/AutomationLogPage.jsx

This page shows the full audit trail of all workflow executions. It should:
- Fetch from workflow_logs table, newest first, paginated (20 per page)
- Table columns: Timestamp, Rule Name, Trigger, Case Type, Case Ref (link to case), Action, Result (success/failed badge)
- Filter by: rule name, case type, date range, result
- Search by case reference number
- Summary stats at top: total executions today, success rate, most active rule

Use Tailwind CSS. Clean table with striped rows, sticky header.
Give me the COMPLETE file.
```

### 7.6 Create the Report Viewer

**Upload:** `src/pages/admin/DashboardPage.jsx` (for reference)

```
I'm working on the BOCRA website.
[PASTE THE PROJECT CONTEXT FROM SECTION 2 ABOVE]

Create a new file: src/components/admin/ReportViewer.jsx

This component displays a generated report from the generated_reports table. Props:
- report: object with { title, period_start, period_end, data }

It should render:
1. Report header: title, period dates
2. Summary cards: total complaints, total incidents, total applications, SLA compliance %
3. Charts (Recharts):
   - Complaints by status (pie chart)
   - Complaints by provider (horizontal bar)
   - Incidents by urgency (bar chart)
4. A "Download PDF" button (stretch goal — for demo, just show print-friendly layout)

Use BOCRA colours for all charts. Tailwind CSS. Give me the COMPLETE file.
```

### 7.7 Run the Database Migration

```
I need to run a database migration for the BOCRA website Supabase project.
Project URL: https://cyalwtuladeexxfsbrcs.supabase.co

[PASTE THE ENTIRE SQL FROM SECTION 4 ABOVE]

Review this SQL and:
1. Check for any syntax errors
2. Make sure RLS is enabled on all tables
3. Confirm the trigger functions reference the correct table/column names
4. Give me the final corrected SQL ready to paste into the Supabase SQL Editor

Rules:
- Always enable Row Level Security on new tables
- Only admin/staff roles should be able to manage workflow rules
- System should be able to insert into workflow_logs
- Don't remove or modify any existing tables
```

---

## 8. Data Flow

```
PUBLIC SITE                              WORKFLOW ENGINE                         ADMIN PORTAL
─────────────                            ────────────────                        ─────────────
Submit complaint  ──INSERT──►  complaints table                                 
                                  │                                             
                                  ├──► DB Trigger: set_complaint_reference()    
                                  │     └── Assigns BOCRA/CMP/2026/XXXXX       
                                  │                                             
                                  └──► Workflow Rule: auto-acknowledge          
                                        └── Insert notification ──────────────► Bell icon + email
                                                                                
                              ┌─── Every hour (cron/manual) ───┐                
                              │  check_escalations() runs      │                
                              │  Queries stale cases           │                
                              │  Matches against workflow_rules│                
                              │  Fires actions:                │                
                              │    ├── escalate_priority       │──► Priority badge updates
                              │    ├── send_notification       │──► Supervisor alerted
                              │    └── log to workflow_logs    │──► Activity log
                              └────────────────────────────────┘                
                                                                                
                              ┌─── SLA Monitor (continuous) ───┐                
                              │  Calculate elapsed vs target   │                
                              │  At 75%: alert assigned staff  │──► "3 days left" notification
                              │  At 100%: alert supervisor     │──► "BREACHED" flag on case
                              │  Update SLA badge colour       │──► Dashboard donut chart
                              └────────────────────────────────┘                
                                                                                
                              ┌─── Weekly (cron/manual) ───────┐                
                              │  generate_weekly_report()      │                
                              │  Aggregate stats               │                
                              │  Store in generated_reports    │──► Report viewer in dashboard
                              │  Notify admins                 │──► "Weekly report ready"
                              └────────────────────────────────┘                
```

---

## 9. Priority Order

Build in this exact sequence:

1. **Database migration** (Section 4) — run the SQL first, everything depends on it
2. **`lib/workflow.js` + `lib/sla.js`** — utility functions used by every UI component
3. **Task #14: Auto-acknowledge triggers** — DB triggers are already in the migration; verify they work by inserting a test complaint
4. **Task #13: Auto-escalation function** — `check_escalations()` is in the migration; test via `SELECT check_escalations()` in SQL Editor
5. **Task #15: SLA Badge component** — build `SLABadge.jsx`, then add it to `ComplaintsPage.jsx` and `IncidentsPage.jsx`
6. **SLA summary on Dashboard** — donut chart + compliance percentage
7. **Task #16: Report generation** — `generateWeeklyReport()` function + "Generate Now" button + `ReportViewer.jsx`
8. **Task #17: AutomationPage.jsx** — rules list + toggles + edit modal + activity log
9. **AutomationLogPage.jsx** — full audit trail (only if time allows)

**If you only have 4 hours:** Do steps 1–6. That gives you auto-reference-numbers, escalation logic, SLA badges, and dashboard metrics — enough to demo automation convincingly.

**If you have 8 hours:** Do steps 1–8. Full workflow engine with config UI.

---

## 10. Design Guidelines

- **Automation page layout:** Same as other admin pages — white background, cards for rules, table for logs
- **Rule cards:** White, `rounded-xl`, subtle left border colour based on action type:
  - Escalation rules: left border red `#C8237B`
  - Notification rules: left border cyan `#00A6CE`
  - Report rules: left border green `#6BBE4E`
- **Toggle switch:** Use a custom Tailwind toggle — cyan (`#00A6CE`) when active, grey when paused
- **SLA badges:** Small inline pills, bold text, rounded-full, min-width so they align in tables
- **Activity log:** Compact table, monospace font for timestamps and reference numbers
- **Run buttons:** Primary BOCRA blue (`#00458B`), with a loading spinner during execution
- **Charts:** Use Recharts with BOCRA palette: `['#00A6CE', '#C8237B', '#F7B731', '#6BBE4E', '#00458B']`
- **Responsive:** Stack cards on mobile, horizontal scroll on tables, sidebar collapses

---

## 11. Quick Start

```bash
cd /mnt/c/Users/Leonm/Music/BOCRA-WEB

# 1. Run the database migration
# Copy SQL from Section 4 → paste into Supabase SQL Editor → Run

# 2. Create the automation files
mkdir -p src/lib
mkdir -p src/components/admin
# Create: src/lib/workflow.js, src/lib/sla.js
# Create: src/components/admin/SLABadge.jsx
# Create: src/pages/admin/AutomationPage.jsx

# 3. Add routes in App.jsx (see Section 5)

# 4. Add sidebar item in AdminLayout.jsx (see Section 5)

# 5. Test auto-acknowledge by inserting a test complaint:
# In Supabase SQL Editor:
# INSERT INTO complaints (name, email, provider, complaint_type, complaint_text, status)
# VALUES ('Test User', 'test@example.com', 'Mascom', 'Service Quality', 'Test complaint', 'new');
# Then check: SELECT reference_number FROM complaints ORDER BY created_at DESC LIMIT 1;

# 6. Test escalation check:
# SELECT check_escalations();

# 7. Start dev server
npm run dev

# 8. Visit: http://localhost:5173/hackathonteamproject/admin/automation
```

---

## 12. Important Rules

### Always:
- Upload the **COMPLETE** file to the AI (not a snippet)
- Ask for the **COMPLETE** file back (not just changes)
- Run the database migration **BEFORE** building any UI components
- Test each feature in isolation before connecting them
- Keep RLS enabled on every new table
- Log every automated action to `workflow_logs` — this is your audit trail

### Never:
- Don\u2019t hardcode SLA thresholds — keep them in `workflow_rules.delay_minutes` so they\u2019re configurable
- Don\u2019t expose the Supabase service_role key in frontend code
- Don\u2019t run escalation checks on already-resolved/closed cases
- Don\u2019t skip the reference number generation — it\u2019s core to the auto-acknowledge flow
- Don\u2019t accept partial file responses from the AI

### If something breaks:
1. Go to GitHub → navigate to the file → click **"History"**
2. Find the last working commit
3. Click it → click **"Raw"** → copy the old content
4. Edit the file → paste the old content → commit
5. The site will revert in 2\u20133 minutes
6. For database issues: check the Supabase SQL Editor logs, or drop and recreate the specific table

**Questions? Ask Georgi (automation owner) or Leon (project lead).**
