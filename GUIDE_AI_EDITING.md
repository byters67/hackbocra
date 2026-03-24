# BOCRA Website — AI-Assisted Editing Guide

> **For team members who want to use AI (ChatGPT, Claude, etc.) to make changes without writing code.**

---

## Table of Contents

1. [How This Works](#1-how-this-works)
2. [Project Context (Give This to the AI First)](#2-project-context)
3. [Which Files to Upload for Each Task](#3-which-files-to-upload)
4. [Ready-Made Prompts](#4-ready-made-prompts)
5. [How to Upload Changed Files to GitHub](#5-how-to-upload-to-github)
6. [Important Rules](#6-important-rules)

---

## 1. How This Works

1. **Download** the file you want to change from GitHub
2. **Upload** it to an AI chat (Claude, ChatGPT)
3. **Tell** the AI what to change using the prompts below
4. **Download** the modified file the AI gives back
5. **Upload** the modified file to GitHub (the site auto-deploys)

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
- Supabase for backend (PostgreSQL database + auth)
- GitHub Pages for hosting (auto-deploys on push)

DESIGN SYSTEM:
- Primary colour: BOCRA Blue #00458B
- Four sector dot colours: Cyan #00A6CE (Telecoms), Magenta #C8237B (Broadcasting), Yellow #F7B731 (Postal), Green #6BBE4E (Internet)
- Heading font: DM Serif Display (class: font-display)
- Body font: Plus Jakarta Sans (class: font-sans)
- Cards use: rounded-2xl, p-7, hover:-translate-y-1, shadow on hover
- Content is rendered via dangerouslySetInnerHTML using HTML in template strings
- Apostrophes must be \u2019, em-dashes must be \u2014, ampersands must be &amp;

IMPORTANT RULES:
- Never remove security features (rate limiting, input sanitisation, RLS)
- Never expose the Supabase service_role key
- Keep all accessibility features (48px touch targets, ARIA labels)
- Use BOCRA dot colours when assigning colours to sectors
- Always give me the COMPLETE file back, not just the changed section

SCOPE-LOCK (CRITICAL — READ THIS CAREFULLY):
- ONLY modify the specific section, component, function, or data I ask you to change
- Do NOT refactor, rename, reformat, reorder, or "improve" any code outside the requested change
- Do NOT change import statements unless the task requires a new dependency
- Do NOT rename variables, functions, or CSS classes that already work
- Do NOT re-order array items, object keys, or JSX elements unless I explicitly ask
- Do NOT "clean up" or "optimise" unrelated code — even if you think it's better
- Do NOT change whitespace, indentation style, or formatting in lines you didn't need to touch
- If you are unsure whether something is in scope, leave it exactly as-is
- Before returning the file, mentally diff your output against the original — the ONLY differences should be the change I requested
```

---

## 3. Which Files to Upload

| What you want to do | Upload this file from GitHub |
|---------------------|----------------------------|
| Edit any content page (Telecoms, Broadcasting, Postal, etc.) | `src/pages/public/ContentPage.jsx` |
| Edit the home page (hero, cards, stats, news) | `src/pages/public/HomePage.jsx` |
| Edit navigation menu | `src/components/layout/Header.jsx` |
| Edit footer links | `src/components/layout/Footer.jsx` |
| Edit complaint form | `src/pages/public/FileComplaintPage.jsx` |
| Edit contact form | `src/pages/public/ContactPage.jsx` |
| Edit news articles | `src/pages/public/NewsPage.jsx` |
| Edit document library | `src/pages/public/DocumentsPage.jsx` |
| Edit statistics charts | `src/pages/public/TelecomStatisticsPage.jsx` |
| Edit licence search data | `src/pages/public/LicenceVerificationPage.jsx` |
| Edit equipment database | `src/pages/public/TypeApprovalPage.jsx` |
| Edit the history timeline | `src/pages/public/HistoryPage.jsx` |
| Edit about page (mission/values) | `src/pages/public/AboutProfilePage.jsx` |
| Change colours/fonts | `tailwind.config.js` |
| Change page routes/URLs | `src/App.jsx` |
| Edit animations | `src/hooks/useAnimations.js` |
| Edit site search index | `src/pages/public/SearchPage.jsx` |
| Edit accessibility features | `src/components/ui/AccessibilityWidget.jsx` |
| Edit the logo | `src/components/ui/BocraLogo.jsx` |
| Edit splash screen | `src/components/animations/SplashScreen.jsx` |
| Edit global CSS styles | `src/index.css` |

**How to download a file from GitHub:**
1. Go to https://github.com/hackathonteamproject/hackathonteamproject
2. Navigate to the file
3. Click the file → click **"Raw"** → right-click → **"Save as"**

---

## 4. Ready-Made Prompts

> **⚠️ Add this line to the end of EVERY prompt you send to the AI:**
> `"SCOPE-LOCK: Only change what I asked for. Do not refactor, rename, reorder, reformat, or clean up anything else in the file."`

### 4.1 Update Page Content

**Upload:** `src/pages/public/ContentPage.jsx`

```
I've uploaded ContentPage.jsx from the BOCRA website.

Update the [PAGE NAME] page content. Here is the new text:

[PASTE YOUR NEW TEXT HERE]

Rules:
- Keep the same slug, title, breadcrumb
- Use \u2019 for apostrophes, \u2014 for em-dashes
- Use HTML: <h2> headings, <h3> sub-headings, <p> paragraphs, <ul><li> for lists
- Don't change any other pages
- Give me the COMPLETE file back
```

### 4.2 Add a New Page

**Upload:** `ContentPage.jsx` + `App.jsx` + `Header.jsx`

```
I've uploaded three files from the BOCRA website.

Add a new page:
- Title: [PAGE TITLE]
- URL: /[section]/[slug]
- Put it under [About/Mandate/Services/etc.] in the navigation
- Content: [PASTE CONTENT]

You need to:
1. Add content entry in ContentPage.jsx
2. Add a <Route> in App.jsx
3. Add a nav link in Header.jsx

Give me all three COMPLETE files back.
```

### 4.3 Add News Articles

**Upload:** `src/pages/public/NewsPage.jsx`

```
I've uploaded NewsPage.jsx. Add these news articles at the TOP of PLACEHOLDER_NEWS:

1. Title: [TITLE]
   Date: [YYYY-MM-DD]
   Category: [Announcement/Consumer/Industry/Licensing/Procurement]
   Summary: [BRIEF TEXT]

Give me the COMPLETE file back.
```

### 4.4 Update Statistics

**Upload:** `src/pages/public/TelecomStatisticsPage.jsx`

```
I've uploaded TelecomStatisticsPage.jsx. Add 2025 data:

Mobile Subscriptions: Mascom [X], BTC [X], Orange [X]
Mobile Money: [X] thousand
Mobile Broadband: [X] thousand
Market Share: Mascom [X]%, BTC [X]%, Orange [X]%

Give me the COMPLETE file back.
```

### 4.5 Change Navigation

**Upload:** `src/components/layout/Header.jsx`

```
I've uploaded Header.jsx. Make these nav changes:
- [Add/Remove/Rename items as needed]
- For external links, add: external: true

Give me the COMPLETE file back.
```

### 4.6 Add Documents

**Upload:** `src/pages/public/DocumentsPage.jsx`

```
I've uploaded DocumentsPage.jsx. Add these documents to the DOCUMENTS array:

1. Title: [TITLE], Category: [Legislation/Guidelines/Report/Policy], Year: [YEAR]

Give me the COMPLETE file back.
```

### 4.7 Add Licence Data

**Upload:** `src/pages/public/LicenceVerificationPage.jsx`

```
I've uploaded LicenceVerificationPage.jsx. Add these operators to SAMPLE_LICENCES:

1. Name: [FULL NAME]
   Type: [NFP/SAP/CSP/Broadcasting/DPO/CPO]
   Number: BOCRA/[TYPE]/[NUM]
   Status: Active
   Issued: [YYYY-MM-DD]
   Expires: [YYYY-MM-DD]

Give me the COMPLETE file back.
```

### 4.8 Change Colours or Design

**Upload:** `tailwind.config.js`

```
I've uploaded tailwind.config.js from the BOCRA website.
Change [describe what you want].
Current BOCRA colours: Blue #00458B, Cyan #00A6CE, Magenta #C8237B, Yellow #F7B731, Green #6BBE4E.
Give me the COMPLETE file back.
```

### 4.9 Redesign a Page Section

**Upload:** The relevant page file + `src/index.css`

```
I've uploaded [FILE NAME] and index.css from the BOCRA website.
This is a React + Tailwind CSS project with GSAP animations.

I want to [describe your redesign].

Keep:
- BOCRA brand colours (Blue #00458B, Cyan #00A6CE, Magenta #C8237B, Yellow #F7B731, Green #6BBE4E)
- Accessibility (48px touch targets, ARIA labels)
- Mobile responsive (Tailwind sm: md: lg: breakpoints)
- GSAP scroll animations

Give me all COMPLETE modified files.
```

### 4.10 Supabase Database Changes

```
I need to make changes to a Supabase PostgreSQL database for the BOCRA website.
Project URL: https://cyalwtuladeexxfsbrcs.supabase.co

I want to [describe what you need]:
- Add a new table
- Add a column to an existing table
- Change RLS policies
- Write a query to [get/update/delete] data

Give me the SQL to run in the Supabase SQL Editor.

Rules:
- Always enable Row Level Security on new tables
- Public users should only be able to INSERT into form tables (complaints, contact_submissions)
- Only admin role should be able to UPDATE/DELETE
```

---

## 5. How to Upload to GitHub

After the AI gives you the modified file:

### Step-by-step:

1. Go to https://github.com/hackathonteamproject/hackathonteamproject
2. Navigate to the **exact file path** (e.g., `src/pages/public/ContentPage.jsx`)
3. Click the **pencil icon** (Edit this file)
4. Press **Ctrl+A** to select all existing content
5. Press **Delete** to remove it
6. **Paste** the AI's complete output
7. Scroll down, type a commit message (e.g., "Updated telecoms page content")
8. Click **"Commit changes"**
9. Wait **2-3 minutes** — the site auto-builds and deploys

### For new files:

1. Navigate to the target folder
2. Click **"Add file"** → **"Create new file"**
3. Type the filename in the path box
4. Paste content → Commit

### For images:

1. Navigate to `public/images/`
2. Click **"Add file"** → **"Upload files"**
3. Drag your image → Commit

### Verify it worked:

1. Go to https://github.com/hackathonteamproject/hackathonteamproject/actions
2. Check that the latest workflow run is green (success)
3. Visit https://hackathonteamproject.github.io/hackathonteamproject/
4. Hard refresh: **Ctrl+Shift+R**

---

## 6. How To Test Locally (Before Pushing to GitHub)

Want to see your changes before pushing them live? You can run the site on your own computer.

### What you need

**Node.js** (version 18+) — download from https://nodejs.org/ (pick the LTS version).

### Steps

**1. Download the project from GitHub:**

Go to https://github.com/hackathonteamproject/hackathonteamproject → click green **"Code"** button → **"Download ZIP"** → extract it.

Or with git:
```bash
git clone https://github.com/hackathonteamproject/hackathonteamproject.git
cd hackathonteamproject
```

**2. Install dependencies** (only needed once):
```bash
npm install
```

**3. Start the local server:**
```bash
npm run dev
```

**4. Open in browser:**

It will show a URL like `http://localhost:5173/hackathonteamproject/` — open that. The site updates live as you edit files.

**5. Make changes, test, then stop:**

Press `Ctrl + C` to stop the server when done.

**6. Check for build errors before pushing:**
```bash
npm run build
```

If it succeeds, your code is safe to push to GitHub.

---

## 7. Important Rules

### Always:
- Upload the **COMPLETE** file to the AI (not a snippet)
- Ask for the **COMPLETE** file back (not just changes)
- Test the live site after uploading to GitHub
- Keep a backup (GitHub has full history — you can always revert)

### Never:
- Don't remove security features
- Don't paste real passwords into AI chat
- Don't disable Row Level Security in Supabase
- Don't accept partial file responses

### Prevent the AI from breaking unrelated code:
AI models often "helpfully" refactor, rename, or reorder things you didn't ask them to touch — and this silently breaks other parts of the site. To prevent this:

- **One task per prompt.** Don't combine "update the telecoms content AND fix the nav menu" in one message. Each change = one prompt.
- **Add this line to every prompt:** `"Only change what I asked for. Do not refactor, rename, reorder, or clean up anything else."`
- **Spot-check the output before committing.** Quickly scan the file the AI returns — look for unexpected changes in sections you didn't ask about (renamed functions, reordered arrays, deleted comments, changed imports).
- **Use GitHub's diff view.** After pasting the AI's file into GitHub's editor, click **"Preview changes"** before committing. Scroll through the red/green diff. If you see changes in areas you didn't request, **don't commit** — go back and tell the AI to redo it without those changes.
- **If in doubt, test locally first.** Run `npm run dev` and `npm run build` (see Section 6) before pushing to GitHub.

### If something breaks:
1. Go to GitHub → navigate to the file → click **"History"**
2. Find the last working commit
3. Click it → click **"Raw"** → copy the old content
4. Edit the file → paste the old content → commit
5. The site will revert in 2-3 minutes
