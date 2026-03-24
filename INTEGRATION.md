# Consultations — Integration Checklist

## Files delivered

| File | Goes to |
|---|---|
| `ConsultationsPage.jsx` | `src/pages/public/ConsultationsPage.jsx` |
| `008_consultations.sql` | `supabase/migrations/`. Run via `supabase db push` or in Supabase SQL Editor |

---

## 1. Add the route — src/App.jsx

Add this import near the top with the other page imports:

```jsx
import ConsultationsPage from './pages/public/ConsultationsPage';
```

Add this `<Route>` inside your `<Routes>` block (with the other public routes):

```jsx
<Route path="/consultations" element={<ConsultationsPage />} />
```

---

## 2. Add to navigation — src/components/layout/Header.jsx

Find the nav items array (likely called `navItems` or similar). Add a new entry under
Services or create a "Participate" group:

```js
{ label: 'Public Consultations', path: '/consultations' }
```

---

## 3. Run the database migration (when ready to go live)

1. Go to your Supabase project dashboard (e.g. https://supabase.com/dashboard/project/YOUR_PROJECT_REF)
2. Either run migrations via `supabase db push` (if using Supabase CLI), or:
   - Click **SQL Editor** → **New query**
   - Paste the entire contents of `supabase/migrations/008_consultations.sql`
   - Click **Run**

This creates:
- `consultations` table (admin-managed, public read)
- `consultation_submissions` table (public insert, admin read)
- RLS policies matching the rest of the project
- Seed data matching the mock data in the component

---

## 4. Activate real Supabase submissions

In `ConsultationsPage.jsx`, find the `handleSubmit` function (around line 250).
Uncomment the Supabase block and delete the mock `setTimeout`:

```js
const { data, error } = await supabase
  .from('consultation_submissions')
  .insert({
    consultation_id: form.consultationId,
    full_name: form.fullName,
    email: form.email,
    organisation: form.organisation || null,
    respondent_type: form.respondentType,
    topic_tags: form.selectedTags,
    response_text: form.response,
    is_public: form.makePublic,
    notify_on_determination: form.notifyOnDetermination,
  })
  .select('submission_ref')
  .single();
if (error) { setSubmitting(false); alert('Submission failed. Please try again.'); return; }
setRefNumber(data.submission_ref);
```

This captures the auto-generated `submission_ref` from the database trigger so it can be displayed to the user.

---

## What each hackathon item maps to

| Item | Where it lives |
|---|---|
| **#18** Listing page — title, deadline, status badge, documents | `ConsultationCard` component + `CONSULTATIONS` data array |
| **#19** Comment form — topic tags + user attribution | `SubmitForm` component + `consultation_submissions` SQL table |
| **#20** "What we heard / what changed" | `WhatWeHeard` component inside `ConsultationCard` (shown on closed items with `whatWeHeard` data) |
