# HireRoom Codebase Audit (R0)

**Date**: 5 November 2026  
**Auditor**: Antigravity Coding Agent  
**Status**: Comprehensive forensic audit completed. Zero new features added.

---

## 1. Inventory of Pages and API Routes

### Pages (`src/app`)

| Route | File Path | Implementation Status | Data Source / Real vs Mocked |
|---|---|---|---|
| `/` | `src/app/page.tsx` | UI complete | **Mocked**: Reads listings and companies from in-memory React state (`store.tsx`). |
| `/onboarding/candidate` | `src/app/onboarding/candidate/page.tsx` | UI complete (Screens 1–5) | **Mocked / Hard-coded**: Holds form in React state, saves to in-memory store. Uses hard-coded resume parser fixture. Nav bar is incorrectly visible. |
| `/dashboard` | `src/app/dashboard/page.tsx` | UI complete (Screen 6) | **Mocked**: Reads applications and listings from in-memory React state. Page width is `max-w-6xl` (inconsistent). |
| `/roles` | `src/app/roles/page.tsx` | UI complete | **Mocked**: Reads and filters in-memory listings. "One-Tap Apply" modifies in-memory state without auth. Page width is `max-w-7xl`. |
| `/companies` | `src/app/companies/page.tsx` | UI complete | **Mocked**: Reads in-memory companies list. |
| `/challenges/[id]` | `src/app/challenges/[id]/page.tsx` | UI complete (Screen 7) | **Mocked**: Reads in-memory challenge data. Width is `max-w-6xl`. |
| `/challenges/[id]/build` | `src/app/challenges/[id]/build/page.tsx` | UI complete (Screen 8) | **Mocked**: Reads hardcoded candidate repos from `store.tsx`. |
| `/challenges/[id]/assignment` | `src/app/challenges/[id]/assignment/page.tsx` | UI complete (Screen 9) | **Mocked**: Reads in-memory challenge. Form submission writes to in-memory state with a `setTimeout` evaluation. |
| `/company/onboarding` | `src/app/company/onboarding/page.tsx` | UI complete | **Mocked**: Simulated enricher with `setTimeout`. Appends to in-memory company state. |
| `/company/post` | `src/app/company/post/page.tsx` | UI complete | **Mocked / Simulated**: Form writes to in-memory store. AI writer generates static template strings. |
| `/company/dashboard` | `src/app/company/dashboard/page.tsx` | UI complete | **Mocked**: Reads applications from in-memory store. Shortlist/Hire/Reject update client memory only. |
| `/campfire` | `src/app/campfire/page.tsx` | UI complete | **Mocked**: Reads seeded messages and rooms from memory. Debug text `"Logged in as ..."` visible. No Supabase Realtime. |
| `/login` | Missing | **Unbuilt** | Missing page required by AGENTS.md rule 5 and docs/05 section 3. |
| `/signup` | Missing | **Unbuilt** | Missing page required by AGENTS.md rule 5 and docs/05 section 3. |
| `/admin/*` | Missing | **Unbuilt** | Missing page required by AGENTS.md rule 5 and docs/05 section 3. |

### API Routes (`src/app/api`)

- **Current Status**: **None exist** (`src/app/api` directory does not exist).
- **Missing Required Endpoints**:
  - Auth callbacks (`/api/auth/callback`)
  - Resume upload and parse pipeline (`/api/resume/parse`)
  - Campfire chat realtime synchronization / messages persistence
  - Email webhook & worker routes (`/api/email/worker`, `/api/webhooks/resend`)
  - GitHub App OAuth / repository fetcher (`/api/github/repos`)

---

## 2. Hard-Coded, Faked, and Sample Data Catalog

Forensic audit of static fixtures and simulation timers across the codebase:

### 2.1 Central Mock Store (`src/lib/store.tsx`)
- **Lines 52–129 (`defaultCandidateProfile`)**:
  Hardcoded candidate profile for `"Vamsi Vardhan Mukku"`, including fake phone `'+91 093463 89857'`, hard-coded education (`SV College of Engineering, Tirupati`), and hard-coded GitHub repos (`fanbase-operating-system`, `fintech-etl-automation`, `hireroom-client`).
- **Lines 131–168 (`initialCompanies`)**:
  Hardcodes three real companies copied from Startupathon:
  - `"Persist Ventures"` (`comp-1`, marked `verified: true`)
  - `"Corpvance"` (`comp-2`, marked `verified: true`)
  - `"Face Search AI"` (`comp-3`, marked `verified: true`)
- **Lines 170–391 (`initialListings`)**:
  Hardcodes 6 listings directly copying Startupathon titles and text:
  - `"Build the Operating System for Fanbases"`
  - `"AI Product Engineer"`
  - `"Marketing & Growth Intern"`
  - `"Motion Graphic Designer"`
  - `"Full-Stack Engineer (Next.js & Supabase)"`
  - `"Autonomous Document Intelligence Challenge"`
- **Lines 393–467 (`initialApplications`)**:
  Hardcodes 4 fake applications for Vamsi Vardhan Mukku, Rahul Nair, Priya Sharma, and Ananya Sen with pre-baked scores (`85`, `78`, `92`, `70`).
- **Lines 469–499 (`initialCampfireRooms`)**:
  Hardcodes 3 chat rooms.
- **Lines 501–549 (`initialMessages`)**:
  Hardcodes 4 simulated messages between "Persist Team", "Rahul Nair", and "Vamsi Vardhan Mukku".
- **Lines 553–564 (`currentUser`)**:
  Hardcodes default authenticated user as candidate `vamsi@hireroom.dev`.
- **Lines 573–596 (`switchRole`)**:
  Client-side toggle granting arbitrary admin/company/candidate roles without server verification.

### 2.2 Artificial AI and Parsers (`src/lib/ai.ts`)
- **Lines 16–106 (`generateListingWithAI`)**:
  Uses hard-coded static string concatenation and pre-baked rubric arrays instead of calling Claude or an LLM API.
- **Lines 129–207 (`generateApplicantSummaryPromptB`)**:
  Uses hard-coded math multipliers (`rubric.points * 0.9`) and static template strings rather than genuine applicant evaluation.
- **Lines 213–268 (`parseResumeFile`)**:
  Uses an artificial `setTimeout(..., 1400)` and returns a hardcoded fixture for "Vamsi Vardhan Mukku", completely ignoring the uploaded file content.

### 2.3 Hardcoded Page Inputs & Timers
- **`src/app/onboarding/candidate/page.tsx`**:
  - Line 50: `uploadedFileName` initialized to `'vamsi_vardhan_resume.pdf'`.
  - Line 55: `githubUrl` initialized to `'https://github.com/vamsivardhan09'`.
  - Lines 70–87: Hard-coded artificial timers simulating profile extraction (700ms, 1400ms, 2100ms).
  - Line 333: Button `"Or click here to load sample verified resume"` triggering hardcoded fixture.
  - Lines 452–458: Static education block hardcoding SV College of Engineering & Nuzvid Polytechnic.
  - Line 440: Double country code bug: `<span className="mr-1.5">🇮🇳</span> +91` placed before an input pre-filled with `+91 093463 89857`.
- **`src/app/challenges/[id]/assignment/page.tsx`**:
  - Line 37: `demoUrl` initialized to `'https://fanbase-os-demo.vercel.app'`.
  - Line 38: `repoUrl` initialized to `'https://github.com/vamsivardhan09/fanbase-operating-system'`.
  - Line 41: `videoUrl` initialized to `'https://loom.com/share/fanbase-os-v1-walkthrough'`.
  - Line 43: `notes` initialized to `'Built Next.js 15 app with Supabase auth and AI inbox triage. Test account: demo@creator.com / pass: creator123'`.
  - Line 60: `handleSubmit` uses artificial `setTimeout(..., 900)`.
- **`src/app/company/onboarding/page.tsx`**:
  - Lines 25–39: `handleWebsiteBlur` simulates company enrichment with artificial `setTimeout(..., 600)`.
  - Line 108: Placeholder hardcodes `'e.g. Persist Ventures'`.
- **`src/app/dashboard/page.tsx`**:
  - Lines 68–87: Accelerator banner promises non-dilutive grants, compute credits, and venture studios that HireRoom does not offer.

---

## 3. Route Access Table: Plan vs. Current App

| Area | Plan: Logged Out | Plan: Signed in, onboarding not done | Plan: Signed in and onboarded | Current App Behavior | Violation / Risk |
|---|---|---|---|---|---|
| **Landing (`/`), `/login`, `/signup`** | Allowed | Redirect to onboarding | Redirect to dashboard | Allowed for all users at all times. Landing page remains accessible regardless of auth state. `/login` and `/signup` do not exist. | **Critical**: No redirects; landing page doesn't check session. Missing login/signup routes. |
| **Browse roles, challenges, companies** | Allowed, read-only. Apply asks to sign in and returns to the same page | Redirect to onboarding | Allowed | Publicly accessible to anyone. Clicking "One-Tap Apply" immediately completes application without sign-in or session. | **Critical**: Unauthenticated users can apply and create applications. |
| **Onboarding (`/onboarding/*`)** | Redirect to login | Allowed, only the user's own role flow | Redirect to dashboard. Edits go through Update Profile | Allowed for anyone at any time. Main nav is completely visible during onboarding. No redirection to dashboard if already onboarded. | **Critical**: No auth gate; main nav exposed; completed users can re-enter onboarding arbitrarily. |
| **Dashboard, Campfire, applications** | Redirect to login | Redirect to onboarding | Allowed | Fully accessible to unauthenticated users. Loads hardcoded candidate "Vamsi" by default. | **Critical**: No access control or session check. |
| **Company area (`/company/*`)** | Redirect to login | Redirect to onboarding | Company role only | Accessible to anyone. Navbar contains an unauthenticated toggle switch that flips roles in client memory. | **Critical**: Anyone can switch to company or view company inboxes. |
| **Admin area (`/admin/*`)** | Redirect to login | Redirect to onboarding | Emails in `ADMIN_EMAILS` only | Routes do not exist. Role switcher in client can set `role: 'admin'`. | **Critical**: Admin pages unbuilt; client-side role spoofing. |

---

## 4. Why Uploading a Different Resume Gives the Same Profile

A forensic trace of the resume upload, storage, parsing, and form prefill:

1. **Upload Trigger (`src/app/onboarding/candidate/page.tsx:130–141`)**:
   ```ts
   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       setUploadedFileName(file.name);
       setCurrentStep(4);
       const parsed = await parseResumeFile(file.name, name);
       if (parsed.name) setName(parsed.name);
       if (parsed.headline) setHeadline(parsed.headline);
       if (parsed.about) setAbout(parsed.about);
       if (parsed.skills) setSkills(parsed.skills);
     }
   };
   ```
   - **Root Cause 1**: The actual binary content of `file` is **never read** (no `FileReader`, no `ArrayBuffer`, no text extraction). Only the string `file.name` is forwarded.
   - **Root Cause 2**: The file is **never uploaded** to Supabase Storage or any server endpoint. No file hash is computed.

2. **Parsing Function (`src/lib/ai.ts:213–268`)**:
   ```ts
   export async function parseResumeFile(fileName: string, candidateNameHint?: string): Promise<Partial<CandidateProfile>> {
     await new Promise(res => setTimeout(res, 1400));
     const name = candidateNameHint || 'Vamsi Vardhan Mukku';
     return {
       name,
       headline: 'Product & Data Analyst specializing in fintech analytics and AI-driven automation',
       location: 'Bengaluru, India',
       phone: '093463 89857',
       ...
     };
   }
   ```
   - **Root Cause 3**: `parseResumeFile` is a static mock. Regardless of what file is uploaded (an engineer's resume, a designer's resume, or a blank file), it waits 1400ms and returns the exact same hardcoded JavaScript object.

3. **Form State Prefill (`src/app/onboarding/candidate/page.tsx:47–56`)**:
   - The form initial state does not start empty; it is initialized from `candidateProfile` in `store.tsx`, which already contains the hardcoded "Vamsi Vardhan Mukku" profile.
   - When the user lands on the page, the form is already pre-filled with the mock data before any upload occurs.

4. **Phone Formatting Defect (`src/app/onboarding/candidate/page.tsx:437–447`)**:
   - In `store.tsx` line 56, `phone` is stored as `'+91 093463 89857'`.
   - The UI prefixes the input field with a static badge: `<span className="mr-1.5">🇮🇳</span> +91`.
   - The input renders `value={phone}`, producing `+91 +91 093463 89857` (double country code) and keeps the invalid leading `0`. No `libphonenumber-js` parsing or E.164 normalization exists.

---

## 5. Environment Variables: Code vs. `.env.example`

| Variable Name in `.env.example` | Read in Code (`src/`)? | Status | Notes / Requirement |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **No** | Missing | Needed for redirects, emails, and OAuth. |
| `ADMIN_EMAILS` | **No** | Missing | Required to guard `/admin/*` server-side. |
| `CRON_SECRET` | **No** | Missing | Required to protect the email outbox worker. |
| `NEXT_PUBLIC_SUPABASE_URL` | **No** | Missing | Required for `@supabase/ssr` client and server auth. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **No** | Missing | Required for `@supabase/ssr` client and server auth. |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Missing | Server-only. Required for admin tasks & email outbox. |
| `ANTHROPIC_API_KEY` | **No** | Missing | Required for Claude JSON resume parsing & Prompt A/B. |
| `ANTHROPIC_MODEL` | **No** | Missing | Specifies Claude model version. |
| `RESEND_API_KEY` | **No** | Missing | Required for sending transactional emails. |
| `EMAIL_FROM` | **No** | Missing | Sender header for transactional emails. |
| `SEND_EMAIL_HOOK_SECRET` | **No** | Missing | Validates Supabase Auth Send Email webhook. |
| `GITHUB_APP_ID` | **No** | Missing | Required for challenge repo picker integration. |
| `GITHUB_APP_CLIENT_ID` | **No** | Missing | Required for challenge repo picker integration. |
| `GITHUB_APP_CLIENT_SECRET` | **No** | Missing | Required for challenge repo picker integration. |
| `DOCLING_URL` | **No** | Missing | Optional OCR endpoint for scanned PDFs. |

**Audit finding**: The application currently references `process.env` in **zero places**. All configuration is absent from the runtime code.

---

## 6. Copied Names, Listings, and Copy Identified

In accordance with AGENTS.md rules 2 & 3 ("Original content only"):

1. **Copied Company Names**:
   - `"Persist Ventures"` (`src/lib/store.tsx:134`, `src/app/company/post/page.tsx:59`, `src/app/company/onboarding/page.tsx:108`)
   - `"Persist Media"` (`src/lib/store.tsx:290`)
   - `"Corpvance"` (`src/lib/store.tsx:147, 228, 348, 384, 446`)
   - `"Face Search AI"` (`src/lib/store.tsx:160, 259, 461`)
   - *Fix needed*: Replace all with original, clearly fictional companies labeled `"Demo"` (e.g. `Kavach Systems (Demo)`, `Zephyr Health (Demo)`, `Apex Commerce (Demo)`).

2. **Copied Listings**:
   - `"Build the Operating System for Fanbases"` (`src/lib/store.tsx:175`)
   - `"AI Product Engineer"` (`src/lib/store.tsx:232`)
   - `"Marketing & Growth Intern"` (`src/lib/store.tsx:263`)
   - `"Motion Graphic Designer"` (`src/lib/store.tsx:294`)
   - `"Full-Stack Engineer (Next.js & Supabase)"` (`src/lib/store.tsx:321`)
   - `"Autonomous Document Intelligence Challenge"` (`src/lib/store.tsx:352`)
   - *Fix needed*: Replace all with realistic, fictional, original role postings.

3. **Copied Copy & Text**:
   - `src/app/dashboard/page.tsx:68–87`:
     `"Building something extraordinary? Pitch your idea directly to venture studios. Get technical guidance, compute credits, and non-dilutive grant resources."`
     *Violation*: Direct paraphrase of Startupathon accelerator copy, promising things HireRoom does not offer.
   - `src/lib/store.tsx:178–185`:
     `"Creators with big followings have overflowing inboxes, and 'pay to message me' wastes the value sitting in them..."`
     *Violation*: Word-for-word copy from Startupathon challenge screen.
   - `src/app/challenges/[id]/page.tsx:124` & `src/app/challenges/[id]/assignment/page.tsx:176`:
     `"Watch This to Understand the Idea Behind the Challenge"`
     *Violation*: Copied section header from Startupathon.

4. **Layout Discrepancies**:
   - Page container widths:
     - Dashboard (`src/app/dashboard/page.tsx`): `max-w-6xl`
     - Roles directory (`src/app/roles/page.tsx`): `max-w-7xl`
     - Campfire (`src/app/campfire/page.tsx`): `max-w-7xl`
     - Challenge page (`src/app/challenges/[id]/page.tsx`): `max-w-6xl`
     *Fix needed*: Standardize on one consistent page container width across the entire app.
   - Navigation on Onboarding:
     - The main navigation bar (`Navbar.tsx`) is rendered across the entire onboarding flow (`/onboarding/candidate`), allowing users to navigate away before completing onboarding.
     *Fix needed*: Hide main nav during onboarding as mandated by AGENTS.md rule 5.

---

## Conclusion of Audit
The frontend shell, typography, and visual design tokens are high quality and closely reflect the intended UX. However, the data layer is 100% mocked in client state, authentication/middleware is unbuilt, resume parsing returns a static mock, and several names and copy blocks were directly copied from reference materials. 

The audit is complete. No new features have been added. The recovery plan is documented in `docs/PROGRESS.md`.
