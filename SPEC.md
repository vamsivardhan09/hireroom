# HireRoom: System Specification & Architecture (SPEC.md)

> **Core Philosophy**: Hire by proof, not by resume. Zero external links, 4-question posting flow, one-tap apply, and an integrated Campfire room for every listing.

---

## 1. Brand Tokens & Visual Design Language

HireRoom uses an intentional, warm, and confident aesthetic designed to stand apart from generic enterprise ATS dashboards and spam-heavy job boards.

### 1.1 Design Tokens (CSS Variables)

```css
:root {
  /* Brand Colors */
  --bg: #FAF8F9;                  /* Warm off-white canvas */
  --surface: #FFFFFF;             /* Pure white card backgrounds */
  --surface-subtle: #F4F1F2;      /* Subtle muted background for pills and secondary cards */
  --ink: #1B1420;                 /* Deep ink for display headings and primary buttons */
  --ink-muted: #5C5464;           /* Secondary body text and labels */
  --ink-faint: #988F9E;           /* Placeholder text, subtle borders, metadata */
  --accent: #E11D48;              /* Vibrant crimson/rose brand accent */
  --accent-light: #FFE4E6;        /* Light rose tint for active pills & tags */
  --glow: color-mix(in srgb, var(--accent) 18%, transparent); /* Soft radial glow */

  /* Status Colors */
  --status-pending: #F59E0B;
  --status-shortlist: #8B5CF6;
  --status-hired: #10B981;
  --status-rejected: #EF4444;

  /* Geometry & Elevation */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  --shadow-soft: 0 4px 20px -2px rgba(27, 20, 32, 0.05), 0 2px 6px -1px rgba(27, 20, 32, 0.03);
  --shadow-card: 0 10px 30px -4px rgba(27, 20, 32, 0.08);

  /* Typography */
  --font-serif: "Instrument Serif", "Playfair Display", "Georgia", serif;
  --font-sans: "Inter", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
}
```

### 1.2 Signature Visual Details (from Reference Screens)
1. **Hero Gradient**:
   `background: radial-gradient(60% 50% at 50% 45%, var(--glow), var(--bg) 70%);`
2. **Headlines**:
   Serif display font (`font-serif`) for page titles and onboarding queries, with an *italic accented keyword* (e.g., `How did you hear about *HireRoom*?`).
3. **Pill-shaped Choice Chips**:
   Rounded full chips with subtle borders that invert into dark `--ink` or colored `--accent` states when active.
4. **Thin Progress Bar**:
   2-4px high, soft neutral track with dark `--ink` animated fill.
5. **No External Links**:
   Everything happens in-app. Resumes, code repos, notes, and communications remain natively inside HireRoom.

---

## 2. Information Architecture & Key Flows

### 2.1 Candidate Experience (Reverse-Engineered from Screens 1–9)
- **Screen 1 (Source)**: "How did you hear about *HireRoom*?" with single-tap platform chips (Google, LinkedIn, X, YouTube, Unstop, University, Friend, Event, etc.) and top-right "Skip for now".
- **Screen 2 (Intent)**: "What are you *looking for*?" (Founder role, Co-founder, Full-time employment, Part-time/contract, Internship, Just exploring).
- **Screen 3 (Drop in your resume)**: Clean card with drag & drop upload, supporting PDF and DOCX, instant preview.
- **Screen 4 (Building your profile)**: Animated shimmer/skeleton card displaying: *"Building your profile - Reading what you've done so far so HireRoom can meet you halfway. Pulling out your experience..."*
- **Screen 5 (Profile Review)**: *"Here's what we found, [Name]"*. Stacked labeled fields:
  - Full Name, Headline, Location (city, India default), Phone (+91 with flag)
  - Experience level (0–1 yrs, 1–3 yrs, etc.), Availability
  - About (Markdown-friendly bio)
  - Skills (Removable chips with `x`, inline quick-add input with Enter)
  - Education history
  - External links (GitHub, LinkedIn, Portfolio)
  - Actions: "Save & continue ->", "Re-upload"
- **Screen 6 (Candidate Dashboard)**:
  - Top Nav: HireRoom logo, Dashboard, Campfire, Open roles, Challenges, Companies, Search (`Ctrl+K`), Profile avatar.
  - 4 Stat Cards: Total applications, In review, Shortlisted, Accepted.
  - Promo Banner: Gradient image card ("Accelerator: Building something? Pitch your idea. Get resources to build ->").
  - Your Applications: Empty state with CTA or active tracker cards.
  - Open Roles Grid: 2-column cards showing company logo, title, salary/equity, remote/city, "View role ->".
- **Screen 7 (Challenge Detail Page)**:
  - Breadcrumb `<- All challenges`.
  - Title, Host company badge with verification check, location tag, reward chips (Cash prize in ₹/$, Equity %, Developer perks like Claude Code/Cursor/AWS credits).
  - Two-column layout:
    - Left: "About this challenge", video walkthrough player, "What to build" checklist, "Who should enter", "How it works" (1-2-3), "Challenge task" detailed specification, locked "Resources" card, deadline/attempts counter badge, "How we evaluate" rubric breakdown.
    - Right: Sticky "Enter the challenge" card with reward badges and primary dark button.
- **Screen 8 (Welcome to the Build)**:
  - Post-entry screen: *"Welcome to the build. You're in. First, connect the GitHub repo you'll build in. That's how we see your progress and step in when you're stuck, so you never build alone."*
  - 1-click GitHub connection & repository picker.
- **Screen 9 (Challenge Assignment & Submission Hub)**:
  - 5-stage stepper: `[Applied] -> [Assignment] -> [Interview] -> [Offer] -> [Hired]`.
  - Badges: Status ("Assignment pending"), Campfire room launcher ("🔥 Campfire (3+)"), Attempts left ("4/4 attempts"), Countdown timer ("25d 10h 35m").
  - Left column: Embedded intro video player.
  - Right column: "Submit version 1" form: Live demo URL, Repository selector, Walkthrough video embed/upload, Notes textarea (5,000 char counter), Submit button.

---

### 2.2 Company Experience
- **Company Onboarding (3 Inputs)**:
  1. Website URL (HireRoom auto-fetches title, logo, and one-liner).
  2. "What do you do, in one line?".
  3. City or Remote pill + Team size selector (1-10, 11-50, 51-200, 200+).
- **The 4-Question Posting Flow (with Live Preview)**:
  - Select Type: **Job**, **Internship**, or **Open challenge**.
  - **Screen 1**: *"What are you hiring for?"* (Role title, auto-suggests roles).
  - **Screen 2**: *"What will they do?"* (2 lines is plenty; for challenge: *"What should they build or solve?"*).
  - **Screen 3**: *"What should they be good at?"* (AI-suggested skill chips based on role title, tap to add/remove).
  - **Screen 4**: *"The practical bits"* (Pay range in ₹/month or LPA, Remote / On-site / Hybrid, Application deadline. For Challenges: prize/stipend, max attempts).
  - **AI Listing Writer (Prompt A)**: Automatically generates the complete listing (About the role, What you will do, What you need, and for challenges, the 100-point Scoring Rubric). Inline editable with live preview card.
- **Company Applicants Inbox**:
  - Listing selector (Draft, Pending Review, Live, Closed).
  - Candidate cards showing: Candidate name, headline, AI match pill (`Strong`, `Possible`, `Weak`), AI summary, highlighted skills, submitted code repo/demo links, challenge score.
  - Quick action buttons: **Shortlist**, **Hire**, **Reject**, **Message in Campfire**.
- **Admin Console**:
  - Company verification review (verifies domain vs email).
  - First listing approval before going live.
  - Spam and moderation reports.

---

### 2.3 The Campfire Chat Room
- **Automatic Room Creation**: Each listing has its own dedicated room.
- **Access Control**: Candidates who apply or enter the challenge are automatically added. Company team members are Hosts (`Host` badge).
- **Features**:
  - Pinned announcements by the company host.
  - Q&A threaded discussions.
  - Report / Mute / Delete moderation tools.
  - Read-only archiving when the listing closes.

---

## 3. Data Model (PostgreSQL / Supabase Schema)

```sql
-- Users & Roles
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null check (role in ('candidate', 'company', 'admin')),
  created_at timestamptz default now()
);

-- Candidate Profiles
create table candidate_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  name text not null,
  headline text,
  location text default 'Bengaluru, India',
  phone text,
  experience text,
  availability text,
  about text,
  skills text[] default '{}',
  education jsonb default '[]',
  resume_url text,
  github_connected boolean default false,
  github_username text,
  github_repos jsonb default '[]',
  portfolio_url text,
  linkedin_url text,
  updated_at timestamptz default now()
);

-- Companies
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  logo text,
  one_liner text,
  city text default 'Bengaluru',
  is_remote boolean default true,
  size text,
  verified boolean default false,
  status text default 'active' check (status in ('pending', 'active', 'suspended')),
  created_at timestamptz default now()
);

-- Company Members
create table company_members (
  company_id uuid references companies(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text default 'admin' check (role in ('owner', 'admin', 'recruiter')),
  primary key (company_id, user_id)
);

-- Listings (Jobs, Internships, Challenges)
create table listings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  type text not null check (type in ('job', 'internship', 'challenge')),
  title text not null,
  summary text,
  about_the_role text,
  what_you_will_do text[] default '{}',
  what_you_need text[] default '{}',
  skills text[] default '{}',
  pay text,
  location text default 'Remote',
  deadline timestamptz,
  status text default 'live' check (status in ('draft', 'pending_review', 'live', 'closed')),
  
  -- Challenge Specific Fields
  challenge_brief text,
  deliverables text[] default '{}',
  scoring_checklist jsonb default '[]', -- array of { item: text, points: number }
  max_attempts integer default 4,
  prize text,
  perks text[] default '{}',
  video_url text,
  
  views_count integer default 0,
  created_at timestamptz default now()
);

-- Applications
create table applications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  candidate_id uuid references candidate_profiles(user_id) on delete cascade,
  status text default 'new' check (status in ('new', 'assignment_pending', 'shortlisted', 'hired', 'rejected')),
  screening_answers jsonb default '{}',
  ai_summary text,
  ai_match text check (ai_match in ('strong', 'possible', 'weak')),
  ai_strengths jsonb default '[]',
  ai_gaps jsonb default '[]',
  created_at timestamptz default now()
);

-- Submissions (For Challenges)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  version integer default 1,
  repo_url text,
  demo_url text,
  video_url text,
  notes text,
  files text[] default '{}',
  checklist_scores jsonb default '[]', -- array of { item: text, score: number, reason: text }
  total_score integer default 0,
  created_at timestamptz default now()
);

-- Campfire Rooms & Messages
create table rooms (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid unique references listings(id) on delete cascade,
  name text not null,
  is_closed boolean default false,
  created_at timestamptz default now()
);

create table room_members (
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  is_host boolean default false,
  primary key (room_id, user_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  user_name text not null,
  user_role text not null,
  body text not null,
  is_pinned boolean default false,
  created_at timestamptz default now()
);

-- Moderation Reports
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references users(id),
  target_type text check (target_type in ('message', 'listing', 'candidate')),
  target_id uuid not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);
```

---

## 4. AI Engine Specifications

### 4.1 Prompt A: Listing Writer
- **Goal**: Takes 3–4 short inputs from the company and produces a well-structured job, internship, or open challenge listing with a 100-point scoring rubric for challenges.
- **Constraints**: No hallucinated compensation or location. Friendly, concise Indian startup tone.

### 4.2 Prompt B: Applicant Summarizer
- **Goal**: Summarizes candidate profile & challenge submissions against listing requirements.
- **Ethical Safeguards**: Strict exclusion of age, gender, caste, religion, college tier, photo, or origin. Highlights only verifiable technical skills, project proof, and rubric deliverables.

---

## 5. Technology Stack & Architectural Decisions

- **Framework**: Next.js 15+ (App Router) + React 19 + TypeScript.
- **Styling**: Tailwind CSS with custom HireRoom design tokens, custom fonts (Instrument Serif + Plus Jakarta Sans).
- **Icons**: Lucide React.
- **Animations & Transitions**: Motion (Framer Motion) for question-by-question slides and interactive chip selections.
- **State & Storage**:
  - Unified local + Supabase-ready adapter layer with mock database pre-seeded with 3 verified companies, 6 active listings (including 2 high-value challenges), 10 candidates with rich proof-of-work profiles, and active Campfire chat rooms.
  - Seamless toggle between offline demo store (localStorage/in-memory) and Supabase client when environment variables are supplied.
- **Form Management**: TanStack Form + Zod schema validation.
- **AI Engine**: Client/Server AI pipeline supporting real AI calls (Claude / Gemini API) with robust rule-based intelligent fallbacks so the application functions flawlessly offline and online.

---

## 6. Implementation Task List

### Phase 1: Foundation (Core Engine & Flows)
- [x] **Task 1.1**: Initialize Next.js 15 TypeScript project with Tailwind CSS, Lucide icons, and Motion.
- [ ] **Task 1.2**: Configure HireRoom design tokens (`globals.css`, fonts, color tokens, radial glow hero).
- [ ] **Task 1.3**: Build Navigation Shell (Candidate & Company modes, Cmd+K search dialog, user switcher).
- [ ] **Task 1.4**: Implement Candidate Onboarding 5-step flow:
  - Step 1: Source question with pill chips (`How did you hear about *HireRoom*?`).
  - Step 2: Role target selection (`What are you *looking for*?`).
  - Step 3: Resume upload card (`Drop in your resume`).
  - Step 4: Shimmer loading screen (`Building your profile...`).
  - Step 5: Profile review with stacked editable fields, skill chips, and Indian phone code.
- [ ] **Task 1.5**: Candidate Dashboard:
  - 4 Stat cards (Total applications, In review, Shortlisted, Accepted).
  - Promo banner (Accelerator / pitch CTA).
  - Applications list & empty state.
  - Open roles 2-column grid.
- [ ] **Task 1.6**: Company Onboarding (3 inputs: website auto-enrichment, one-liner, team size/city).
- [ ] **Task 1.7**: Company 4-Question Posting Flow:
  - Role type selector (Job, Internship, Challenge).
  - 4 interactive screens with live listing card preview.
  - AI Listing Writer integration (Prompt A).
- [ ] **Task 1.8**: Public Listings page with instant search, category filters, and detail drawer/view.
- [ ] **Task 1.9**: One-Tap Application flow with optional screening questions.
- [ ] **Task 1.10**: Company Applicants Inbox with Shortlist, Hire, Reject, and AI Match scores.

### Phase 2: Open Challenges & Campfire Chat
- [ ] **Task 2.1**: Challenge Detail Page (Reward chips: cash, equity, perks; video embed; rubric checklist; sticky enter card).
- [ ] **Task 2.2**: "Welcome to the Build" GitHub connection screen and repo picker.
- [ ] **Task 2.3**: Challenge Assignment Hub (5-stage stepper, countdown, attempts counter, versioned submission form).
- [ ] **Task 2.4**: Campfire Realtime Chat (Room per listing, pinned host announcements, candidate discussions, Q&A).
- [ ] **Task 2.5**: Seed Data (3 companies, 6 listings including 2 challenges, 10 candidates with realistic submissions and chat history).

### Phase 3: Verification, Polish & Verification Testing
- [ ] **Task 3.1**: Company verification badge and admin approval moderation console.
- [ ] **Task 3.2**: AI Applicant Summary modal (Prompt B output with strengths, gaps, rubric scores).
- [ ] **Task 3.3**: End-to-end testing of "Done When" criteria.
- [ ] **Task 3.4**: Comprehensive `README.md` with setup instructions and environment flags.
