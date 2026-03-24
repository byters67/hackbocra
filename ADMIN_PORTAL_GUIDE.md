# BOCRA Admin Portal — Build Guide

**For: Georgi, Webster, Jemima**
**Deadline: 27 March 2026, 17:00 CAT**

---

## What This Portal Is

The Admin Portal is where BOCRA staff manage everything that comes in from the public website — complaints, licence applications, cybersecurity incident reports, and more. It's a separate dashboard behind a login, only for BOCRA staff.

**URL:** `/admin` (protected route — only `role: 'admin'` or `role: 'staff'` users)

**Colour scheme:** Use the BOCRA dot colours throughout:
- Primary blue: `#00458B`
- Cyan: `#00A6CE`
- Magenta: `#C8237B`
- Yellow: `#F7B731`
- Green: `#6BBE4E`
- Dark nav: `#001A3A`

---

## Features to Build

### 1. Complaints Management (Priority: HIGH)

**What comes in:** Users submit complaints via `/services/file-complaint` with name, email, phone, provider, complaint type, and description. These go to the `complaints` table in Supabase.

**What admin needs:**
- **Complaints list** — table/list view showing all complaints, sorted newest first
- **Status column** — with pill badges: `New` (red), `In Review` (yellow), `Resolved` (green), `Closed` (grey)
- **Click to open** — full complaint detail view
- **Reply by email** — a text area where admin types a response. On submit, use Supabase Edge Function or `mailto:` link to send email to the complainant's email address. Save the reply in a `complaint_responses` table
- **Change status** — dropdown to update status (New → In Review → Resolved → Closed)
- **Filter/search** — filter by status, provider, complaint type, date range
- **SLA timer** — show how long since the complaint was submitted (e.g., "3 days ago"). Highlight red if over 5 days without response

**Supabase table (already exists):**
```sql
complaints (id, name, company, phone, email, provider, complaint_type, 
            complaint_text, status, created_at, updated_at)
```

**New table to create:**
```sql
CREATE TABLE complaint_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(id),
  admin_id UUID REFERENCES profiles(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 2. Licence Applications Management (Priority: HIGH)

**What comes in:** Users fill in licence application forms on each licence page (e.g., `/licensing/cellular`). The form collects: full name, company, email, phone, Omang number, city, address, purpose, experience, additional info, and which licence type.

**What admin needs:**
- **Applications list** — all licence applications, newest first
- **Status column** — `Pending` (yellow), `Under Review` (blue), `Approved` (green), `Rejected` (red), `More Info Needed` (orange)
- **Click to open** — full application detail with all submitted fields
- **Reply by email** — admin writes a response (approval, rejection, or request for more info). Response goes to the applicant's email
- **Assign to staff** — dropdown to assign application to a specific BOCRA department/person
- **Download as PDF** — generate a summary PDF of the application
- **Filter** — by licence type, status, date

**New Supabase table:**
```sql
CREATE TABLE licence_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  licence_type TEXT NOT NULL,
  licence_slug TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  omang TEXT NOT NULL,
  city TEXT,
  address TEXT,
  purpose TEXT NOT NULL,
  experience TEXT,
  additional_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected','more_info_needed')),
  assigned_to UUID REFERENCES profiles(id),
  reference_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE licence_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage applications"
  ON licence_applications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','staff')));

CREATE POLICY "Public can insert applications"
  ON licence_applications FOR INSERT WITH CHECK (true);
```

---

### 3. Cybersecurity Incident Reports (Priority: MEDIUM)

**What comes in:** Users report incidents via `/cybersecurity` — incident type, description, date, urgency, name, email, phone (or anonymous).

**What admin needs:**
- **Incident list** — with urgency colour coding (Critical=red, High=orange, Medium=yellow, Low=green)
- **Status tracking** — `Received`, `Investigating`, `Resolved`, `Closed`
- **Reply to reporter** — email response to non-anonymous reports
- **Assign to CSIRT team member**
- **Priority escalation** — one-click escalate to National CSIRT

**New Supabase table:**
```sql
CREATE TABLE cyber_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low','medium','high','critical')),
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'received' CHECK (status IN ('received','investigating','resolved','closed')),
  reference_number TEXT UNIQUE NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 4. Dashboard Overview (Priority: HIGH)

The first thing an admin sees after login. Shows key metrics at a glance.

**Cards to show:**
- Total complaints (this month) + trend arrow
- Pending licence applications
- Open cyber incidents
- Average response time (complaints)

**Charts (use Recharts — already installed):**
- Complaints by status (pie/donut chart)
- Complaints over time (line chart, last 30 days)
- Licence applications by type (bar chart)
- Top complaint providers (horizontal bar)

**Quick actions:**
- "View newest complaint" button
- "View pending applications" button
- "Unresolved incidents" count

---

### 5. Contact Form Submissions (Priority: LOW)

**Table:** `contact_submissions` (already exists in schema)

Simple list view — name, email, subject, message, date. Admin can mark as read/replied.

---

### 6. User Management (Priority: LOW)

- List of admin/staff users from `profiles` table
- Ability to change roles (admin, staff, operator, user)
- Only super-admins can manage other admins

---

## Technical Setup

### File Structure
```
src/
  pages/
    admin/
      AdminLayout.jsx      ← sidebar + topbar layout wrapper
      DashboardPage.jsx     ← overview with charts
      ComplaintsPage.jsx    ← complaints list + detail
      ApplicationsPage.jsx  ← licence applications list + detail
      IncidentsPage.jsx     ← cyber incidents list + detail
      ContactPage.jsx       ← contact submissions
      UsersPage.jsx         ← user management
```

### Routes to add in App.jsx
```jsx
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminComplaints from './pages/admin/ComplaintsPage';
import AdminApplications from './pages/admin/ApplicationsPage';
import AdminIncidents from './pages/admin/IncidentsPage';

// Inside <Routes>:
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="complaints" element={<AdminComplaints />} />
  <Route path="complaints/:id" element={<AdminComplaints />} />
  <Route path="applications" element={<AdminApplications />} />
  <Route path="applications/:id" element={<AdminApplications />} />
  <Route path="incidents" element={<AdminIncidents />} />
</Route>
```

### Auth Protection
```jsx
// In AdminLayout.jsx:
import { useAuth } from '../../lib/auth';

export default function AdminLayout() {
  const { user, profile } = useAuth();
  
  if (!user) return <Navigate to="/auth/login" />;
  if (profile?.role !== 'admin' && profile?.role !== 'staff') {
    return <div>Access denied. Admin privileges required.</div>;
  }
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

### AdminSidebar Component
Dark sidebar (`bg-[#001A3A]`) with:
- BOCRA logo at top
- Navigation items with icons:
  - Dashboard (BarChart3 icon)
  - Complaints (AlertCircle icon) + unread badge
  - Licence Applications (FileCheck icon) + pending count
  - Cyber Incidents (Shield icon) + open count
  - Contact Submissions (Mail icon)
  - Users (Users icon)
- Current admin name at bottom
- Logout button

### Email Responses
For the hackathon demo, use `mailto:` links to open the admin's email client:
```jsx
const handleReply = (toEmail, subject, body) => {
  window.open(`mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
};
```

For a production system, you'd use a Supabase Edge Function with an email provider (SendGrid, Resend, etc.).

---

## Design Guidelines

- **Sidebar:** Dark (`#001A3A`), white text, active item highlighted with cyan (`#00A6CE`)
- **Cards:** White background, rounded-xl, subtle border, shadow on hover
- **Status pills:** Use BOCRA colours — green for resolved, yellow for pending, red for new/critical, blue for in-review
- **Tables:** Clean, minimal borders, striped rows, sticky header
- **Charts:** Use Recharts with BOCRA colours: `['#00A6CE', '#C8237B', '#F7B731', '#6BBE4E']`
- **Buttons:** Primary = BOCRA blue (`#00458B`), Secondary = outlined, Danger = red
- **Typography:** Same as main site — system font stack
- **Responsive:** Sidebar collapses to hamburger on mobile

---

## Data Flow

```
PUBLIC SITE                         ADMIN PORTAL
─────────────                       ─────────────
File Complaint form     ──INSERT──►  complaints table  ──READ──►  Complaints list
  └── user email                     └── status: 'new'            └── Admin replies
                                                                   └── Status update

Licence Application     ──INSERT──►  licence_applications  ──READ──►  Applications list
  └── on each licence page           └── status: 'pending'            └── Approve/Reject
                                                                       └── Email response

Cyber Incident Report   ──INSERT──►  cyber_incidents  ──READ──►  Incidents list
  └── /cybersecurity page             └── status: 'received'      └── Investigate
                                                                   └── Assign to CSIRT
```

---

## Priority Order

1. **AdminLayout + Sidebar** — get the shell working first
2. **Dashboard** — key metrics + charts
3. **Complaints list + detail + reply** — this is the most important feature
4. **Licence Applications list + detail** — second most important
5. **Cyber Incidents** — third priority
6. Contact submissions + Users — if time allows

---

## Quick Start

```bash
cd /mnt/c/Users/Leonm/Music/BOCRA-WEB

# 1. Create the admin pages folder
mkdir -p src/pages/admin

# 2. Create the Supabase migration
# Copy the SQL from this guide into:
# supabase/migrations/003_admin_portal.sql

# 3. Start building AdminLayout.jsx first
# Then DashboardPage.jsx, then ComplaintsPage.jsx

# 4. Test at: http://localhost:5173/hackathonteamproject/admin
```

**Questions? Ask Leon or check the existing code patterns in `src/pages/public/` for styling reference.**
