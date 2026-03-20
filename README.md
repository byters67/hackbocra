# BOCRA Website Redesign

> **Botswana Communications Regulatory Authority** — Modern website built with React, Supabase, and GitHub Pages.

**Live Site:** [https://hackathonteamproject.github.io/hackathonteamproject/](https://hackathonteamproject.github.io/hackathonteamproject/)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Deployment](#deployment)
6. [Supabase Setup](#supabase-setup)
7. [Security](#security)
8. [Pages & Routes](#pages--routes)
9. [Design System](#design-system)
10. [Contributing](#contributing)

---

## Project Overview

This is a complete redesign of the BOCRA website ([www.bocra.org.bw](https://www.bocra.org.bw)), built for the **BOCRA Youth Hackathon (March 2026)**. The redesign addresses:

- **Usability issues** identified in the website audit (broken pages, outdated content, poor navigation)
- **Security vulnerabilities** found in the penetration test (11 findings, 2 critical)
- **Modern UX** with smooth GSAP animations, responsive design, and accessibility
- **Content management** via Supabase backend for easy updates without developer help

### Key Features

- Smooth scroll-triggered animations (GSAP + ScrollTrigger)
- Fully responsive (mobile-first, tested on all screen sizes)
- Accessible design (WCAG 2.1 AA, keyboard navigation, screen reader support)
- Online complaint filing system
- Document library with search and filtering
- News & events with category filtering
- Contact form with Supabase backend
- Authentication system for portal access
- Secure by design (RLS, no debug mode, no exposed API keys)

---

## Tech Stack

| Layer       | Technology        | Purpose                          |
|-------------|-------------------|----------------------------------|
| Frontend    | React 18 + Vite   | UI framework + build tool        |
| Styling     | Tailwind CSS 3    | Utility-first CSS                |
| Animation   | GSAP 3 + ScrollTrigger | Scroll-driven animations   |
| Icons       | Lucide React      | Clean, consistent iconography    |
| Charts      | Recharts          | Data visualisation               |
| Backend     | Supabase          | Auth, Database (PostgreSQL), Storage |
| Hosting     | GitHub Pages      | Static site hosting with CDN     |
| CI/CD       | GitHub Actions    | Automated build and deploy       |

**Total infrastructure cost: $0/month** (all free tiers)

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- npm 9+
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/hackathonteamproject/hackathonteamproject.git
cd hackathonteamproject

# 2. Install dependencies
npm install

# 3. Create environment file (optional - defaults are set in code)
cp .env.example .env.local

# 4. Start development server
npm run dev
```

The dev server runs at `http://localhost:5173/hackathonteamproject/`

### Environment Variables

Create a `.env.local` file (optional, defaults are hardcoded for hackathon):

```env
VITE_SUPABASE_URL=https://cyalwtuladeexxfsbrcs.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Project Structure

```
bocra-web/
├── public/
│   ├── 404.html                 # GitHub Pages SPA fallback
│   └── _headers                 # Security headers
├── src/
│   ├── main.jsx                 # Entry point
│   ├── App.jsx                  # Router + route definitions
│   ├── index.css                # Global styles + Tailwind
│   ├── lib/
│   │   ├── supabase.js          # Supabase client init
│   │   └── auth.jsx             # Auth context + hooks
│   ├── hooks/
│   │   └── useAnimations.js     # GSAP animation hooks
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx       # Navigation bar
│   │   │   ├── Footer.jsx       # Site footer
│   │   │   └── Layout.jsx       # Page wrapper
│   │   └── ui/
│   │       └── BocraLogo.jsx    # SVG logo component
│   └── pages/
│       ├── public/
│       │   ├── HomePage.jsx     # Landing page
│       │   ├── AboutProfilePage.jsx
│       │   ├── ContactPage.jsx
│       │   ├── FileComplaintPage.jsx
│       │   ├── NewsPage.jsx
│       │   ├── DocumentsPage.jsx
│       │   └── ContentPage.jsx  # Generic content template
│       └── auth/
│           └── LoginPage.jsx    # Portal login
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema + RLS
├── .github/workflows/
│   └── deploy.yml               # CI/CD pipeline
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Deployment

### Automatic Deployment (Recommended)

The site deploys automatically via GitHub Actions when you push to `main`:

1. Push your changes to the `main` branch
2. GitHub Actions builds the site and deploys to GitHub Pages
3. Live at: https://hackathonteamproject.github.io/hackathonteamproject/

### GitHub Repository Setup

1. Go to **Settings → Pages**
2. Set Source to **"GitHub Actions"**
3. Go to **Settings → Secrets and variables → Actions**
4. Add these secrets:
   - `VITE_SUPABASE_URL` = `https://cyalwtuladeexxfsbrcs.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon key)

### Manual Build

```bash
npm run build    # Creates dist/ folder
npm run preview  # Preview the production build locally
```

---

## Supabase Setup

### Project Details

- **Project:** cyalwtuladeexxfsbrcs
- **URL:** https://cyalwtuladeexxfsbrcs.supabase.co

### Running Migrations

1. Go to your Supabase dashboard → SQL Editor
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click "Run"

This creates all tables with Row Level Security (RLS) enabled.

### Key Security Rules

- **Public read** for published pages, posts, documents, operators, KPI data
- **Insert-only** for complaints and contact forms (anyone can submit)
- **Admin-only** for all write operations on content tables
- **User-only** for viewing own type approval applications

---

## Security

This redesign directly addresses the 11 security findings from the penetration test:

| Finding | Severity | How We Fixed It |
|---------|----------|-----------------|
| F01: Unauth POST endpoint | CRITICAL | RLS on all tables; no unauthenticated writes |
| F02: Debug mode in prod | CRITICAL | Static SPA has no backend/debug mode |
| F03: Route map exposed | HIGH | No Ziggy; client-side routes are public by design |
| F04: Unauth API data | HIGH | RLS policies control all data access |
| F05: Admin panel exposed | HIGH | Admin routes behind auth + role check |
| F06: Verbose errors | MEDIUM | No server-side error messages |
| F07: Version disclosure | MEDIUM | GitHub Pages doesn't expose versions |
| F08: Missing headers | MEDIUM | Security headers in `_headers` file |
| F09: QA env exposed | MEDIUM | Single unified deployment |
| F10: Email SPF/DMARC | LOW | Documented recommendation for DNS update |
| F11: Broken portal | LOW | Fully rebuilt customer portal |

---

## Pages & Routes

### Public Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, sectors, services, stats |
| `/about/profile` | About BOCRA | Mission, vision, values, core business |
| `/about/chief-executive` | Chief Executive | Message from the CE |
| `/about/board` | Board of Directors | Board member profiles |
| `/about/executive-management` | Executive Team | Management profiles |
| `/mandate/telecommunications` | Telecoms | Telecoms regulation overview |
| `/mandate/broadcasting` | Broadcasting | Broadcasting regulation |
| `/mandate/postal` | Postal | Postal services regulation |
| `/mandate/internet` | Internet | Internet & ICT regulation |
| `/mandate/legislation` | Legislation | Governing legislation |
| `/mandate/licensing` | Licensing | Licensing framework |
| `/services/file-complaint` | File Complaint | Online complaint form |
| `/services/licence-verification` | Licence Check | Verify a licence |
| `/services/type-approval` | Type Approval | Equipment approval |
| `/services/register-bw` | .BW Domain | Domain registration |
| `/services/qos-monitoring` | QoS Dashboard | Network quality data |
| `/documents/drafts` | Documents | Document library |
| `/media/news` | News & Events | Latest news |
| `/contact` | Contact | Contact form + details |

### Auth Pages
| Route | Page |
|-------|------|
| `/auth/login` | Portal login (admin/staff only) |

---

## Design System

### Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| BOCRA Blue | `#00458B` | Primary brand color |
| Cyan | `#00A6CE` | Telecommunications |
| Magenta | `#C8237B` | Broadcasting |
| Yellow | `#F7B731` | Postal |
| Green | `#6BBE4E` | Internet |

### Typography

- **Headings:** DM Serif Display (serif, elegant)
- **Body:** Plus Jakarta Sans (sans-serif, readable)
- **Code:** JetBrains Mono (monospace)

### Animation Hooks

```jsx
import { useScrollReveal, useStaggerReveal, useParallax, useCountUp } from './hooks/useAnimations';

// Fade up on scroll
const ref = useScrollReveal();
return <div ref={ref}>Animates in!</div>

// Stagger children
const ref = useStaggerReveal({ stagger: 0.1 });
return <div ref={ref}><Card /><Card /><Card /></div>

// Parallax depth
const ref = useParallax(0.3);

// Count up number
const ref = useCountUp(4200000, '+');
```

---

## Contributing

### For Team Members

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally: `npm run dev`
4. Commit: `git commit -m "feat: add your feature"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request on GitHub
7. After merge to `main`, the site auto-deploys

### Code Style

- Use functional components with hooks
- Document every component with JSDoc comments
- Use Tailwind utility classes for styling
- Keep components small and reusable
- Use GSAP hooks for animations (not CSS animations for complex effects)

---

## License

Built for the BOCRA Youth Hackathon 2026. All rights reserved.
