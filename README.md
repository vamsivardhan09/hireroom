# HireRoom

> **Hire by proof, not by resume.**
> Built for startups and lean teams. Post in four questions, candidates apply with one verified profile, and everything happens inside HireRoom: zero external links, 100-point challenge rubrics, and a native Campfire chat room for every listing.

---

## 🎨 UI & UX Design Language (Reverse-Engineered)

HireRoom replicates the layout structure, typography, spacing, and micro-interactions from the reference specification and product plan:

- **Brand Tokens**:
  - Background Canvas: `--bg: #FAF8F9` (warm off-white)
  - Headings & Primary Buttons: `--ink: #1B1420` (deep ink)
  - Accent Color: `--accent: #E11D48` (crimson rose)
  - Soft Radial Glow: `radial-gradient(60% 50% at 50% 45%, var(--glow), var(--bg) 70%)`
  - Corner Radii: `16px` to `24px` rounded cards and pill buttons
- **Display Typography**:
  - Headings: Serif display (`Instrument Serif` / `Georgia`) with an *italic accented keyword* (`How did you hear about *HireRoom*?`).
  - Body: Modern clean sans (`Plus Jakarta Sans` / `Inter`).
- **Signature Patterns**:
  - One question per screen on onboarding and posting flows.
  - Pill-shaped choice chips with instant transition.
  - Thin progress bar indicator.
  - Live listing-card preview that updates in real-time as the company types.
  - 5-stage stepper (`Applied` → `Assignment` → `Interview` → `Offer` → `Hired`).
  - Native Campfire room per listing with pinned host announcements.

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Node.js `v18+` (Tested on `v24.20.0`)
- npm `10+`

### 2. Installation
```bash
git clone https://github.com/vamsivardhan09/hireroom.git
cd hireroom
npm install
```

### 3. Run Locally in Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Environment Configuration (Optional)

HireRoom comes out of the box with an offline-first state store and realistic seed dataset (3 companies, 6 listings including 2 open challenges, 10 candidate profiles, and Campfire chat history).

To connect external cloud services, create a `.env.local` file:

```env
# Optional: Supabase Auth & Postgres Connection
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Real LLM generation (fallback simulator is active by default)
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

---

## 🧭 Key User Journeys & "Done When" Validation

### 1. Candidate Journey (Screens 1 to 9)
1. Navigate to `/onboarding/candidate`:
   - **Step 1**: "How did you hear about *HireRoom*?" with pill chips (Google, LinkedIn, X, Unstop, etc.).
   - **Step 2**: "What are you *looking for*?" (Founder, Full-time, Internship, etc.).
   - **Step 3**: "Drop in your *resume*" (drag-and-drop or click sample resume).
   - **Step 4**: Shimmer loading state: *"Building your profile - Reading what you've done so far so HireRoom can meet you halfway"*.
   - **Step 5**: Editable profile review: Full Name, Headline, Location (`Bengaluru, India`), Phone (`+91`), Experience, Removable skill chips, and Education.
2. Click **Save & continue** to land on **Candidate Dashboard** (`/dashboard`):
   - 4 Stat Cards (*Total applications*, *In review*, *Shortlisted*, *Accepted*).
   - Accelerator pitch promo banner.
   - Applications tracker & 2-column open roles grid.
3. Open an **Open Challenge** (`/challenges/list-1`):
   - Review rewards ($250 Cash, 10% Equity, Claude Code / Cursor / AWS perks).
   - 2-column layout with video walkthrough and 100-point scoring rubric.
   - Click **Enter the challenge** → Connect verified GitHub repository (`/challenges/list-1/build`).
   - Proceed to **Assignment Hub** (`/challenges/list-1/assignment`) with 5-stage stepper, countdown timer, attempt counter (`4/4`), and versioned submission form.

### 2. Company Journey (Posting & Review)
1. Switch to **Company Mode** via the navigation pill or visit `/company/onboarding`:
   - 3 inputs: Website URL (auto-fills name, logo, one-liner), description, city/remote + team size.
2. Open the **4-Question Posting Flow** (`/company/post`):
   - Pick type: **Job**, **Internship**, or **Open challenge**.
   - **Q1**: What are you hiring for?
   - **Q2**: What will they do?
   - **Q3**: What should they be good at? (AI suggested skill chips).
   - **Q4**: Practical bits (Pay, workplace arrangement, deadline, attempts).
   - **Live Listing Card Preview** updates in real-time in the right-hand panel.
   - **AI Listing Writer (Prompt A)** generates the full description, responsibilities, requirements, and 100-point rubric.
   - Click **Publish Listing** with confetti celebration!
3. Open **Applicants Inbox** (`/company/dashboard`):
   - Filter by status (`Live`, `Draft`, `Pending review`, `Closed`).
   - Candidate card with AI match pill (`Strong`, `Possible`, `Weak`) and evidence summary.
   - Instant actions: **Shortlist**, **Hire**, **Reject**, or open **Campfire**.

### 3. Campfire Chat (`/campfire`)
- A dedicated chat room exists for every listing.
- Company hosts have host controls and can post pinned announcements.
- Candidates can ask questions and discuss deliverables with zero WhatsApp groups.

---

## 📁 Project Architecture

```
hireroom/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with fonts & HireRoomProvider
│   │   ├── globals.css                 # Brand design tokens & radial glow hero
│   │   ├── page.tsx                    # Landing page
│   │   ├── dashboard/page.tsx          # Candidate Dashboard (Screen 6)
│   │   ├── roles/page.tsx              # Public directory & One-Tap Apply
│   │   ├── companies/page.tsx          # Verified hiring studios
│   │   ├── campfire/page.tsx           # Listing-native realtime chat rooms
│   │   ├── onboarding/
│   │   │   └── candidate/page.tsx      # 5-step Candidate Onboarding (Screens 1-5)
│   │   ├── company/
│   │   │   ├── onboarding/page.tsx     # 3-input company setup
│   │   │   ├── post/page.tsx           # 4-question posting flow + live preview
│   │   │   └── dashboard/page.tsx      # Applicants inbox (Shortlist/Hire/Reject)
│   │   └── challenges/
│   │       └── [id]/
│   │           ├── page.tsx            # Challenge detail & rubric (Screen 7)
│   │           ├── build/page.tsx      # GitHub repo connect (Screen 8)
│   │           └── assignment/page.tsx # 5-stage stepper & submissions (Screen 9)
│   ├── components/
│   │   ├── Navbar.tsx                  # Header, role switcher, and active links
│   │   └── SearchModal.tsx             # Cmd+K global search dialog
│   ├── lib/
│   │   ├── ai.ts                       # Prompt A & Prompt B AI engines + resume parser
│   │   └── store.tsx                   # Central reactive store & realistic seed dataset
│   └── types/
│       └── index.ts                    # TypeScript data schemas
├── SPEC.md                             # Architectural specification
└── README.md                           # Documentation and setup guide
```

---

## 📜 License
MIT License.
