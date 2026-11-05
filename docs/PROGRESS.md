# HireRoom Recovery & Build Progress

**Current Step**: **R4 (Auth and Emails)**  
**Last Updated**: 5 November 2026  
**Status**: Step R3 complete (verified by Playwright test `tests/clean-data-forms.spec.ts`: 7/7 tests passed; total suite 31/31 tests passed). Ready for Step R4.

---

## 1. Summary of Current State

- **R0 (Audit)**: ✅ **Completed** (verified by codebase inspection and `docs/AUDIT.md`).
- **R1 (Access Rules & Roles)**: ✅ **Completed** (verified by Playwright test: all 18 cells of the Section 3 access matrix pass in `tests/access-rules.spec.ts`).
  - Built `@supabase/ssr` server and middleware clients with `getUser()`.
  - Implemented `src/middleware.ts` enforcing the exact access matrix and preserving `next` query params.
  - Removed candidate/company switcher from nav bar.
  - Hid main nav during onboarding.
  - Created `/login` and `/signup` with role selection.
  - Standardized page container widths to `max-w-7xl` across Dashboard, Roles, Campfire, Challenges, and Companies.
  - Created `/admin` operations console guarded by `ADMIN_EMAILS`.
  - Created `/profile` for onboarded candidate profile updates.
- **R2 (Real Resume Parsing)**: ✅ **Completed** (verified by Playwright test: 6/6 tests in `tests/resume-parser.spec.ts` pass, total 24/24 tests pass).
  - Built schema and skill normalization map in `src/lib/resume/schema.ts` (capped at 25 skills, canonical alias mapping).
  - Built parsing engine in `src/lib/resume/parser.ts` using `unpdf` and `mammoth` for text extraction, scan detection, Claude API structured JSON schema extraction, SHA-256 hashing, and `parse_runs` audit logging.
  - Built API route `src/app/api/resume/parse/route.ts` with 10 MB limit and MIME validation.
  - Updated candidate onboarding (`src/app/onboarding/candidate/page.tsx`) with file upload, overwrite confirmation modal (*"Replace your profile with this resume?"*), low-confidence flags ("check this"), and phone formatting without duplicate prefix.
  - Verified 3 distinct resumes return 3 genuinely different profiles, scanned PDF throws clear error without falling back to mock data, and `parse_runs` audit log records all parsing operations.
- **R3 (Clean Data and Forms)**: ✅ **Completed** (verified by Playwright test: 7/7 tests in `tests/clean-data-forms.spec.ts` pass, total suite 31/31 tests pass).
  - Purged all copied names (Persist, Corpvance, Face Search AI) across codebase.
  - Created fictional demo seed dataset in `src/lib/seed-data.ts` and runner `scripts/seed.ts` featuring 3 companies labeled "(Demo)" (Kavach Systems, Zephyr Health, and unverified Apex Commerce), 6 listings (2 challenges with exact 100-pt rubrics, 3 jobs, 1 internship), and 10 realistic candidates.
  - Enforced Verified badge display *strictly* when `companies.verified === true`.
  - Rewrote candidate dashboard banner copy to reflect genuine HireRoom features (*"Hire by Proof"*, 100-pt rubrics, Campfires).
  - Validated phone inputs with `libphonenumber-js` (MIT) via `src/lib/phone.ts` and `src/components/PhoneInputField.tsx`: country code selector, strips leading zero, prevents duplicate +91 prefixes, stores canonical E.164.
  - Implemented INR first currency display (`src/lib/currency.ts`) formatting Indian listings as `₹28L - ₹42L/yr`, `₹40,000/mo`, and `₹1,00,000 prize`.
  - Implemented draft auto-saving with TanStack Form + Zod across candidate onboarding, profile editing, company onboarding, job posting, and challenge submissions with `hireroom_draft_*` storage keys.
- **R4 (Auth and Emails)**: 🟡 **IN PROGRESS**.

---

## 2. Ordered Recovery & Fix Plan (R1 to R8)

| Step | Objective | Primary Deliverables | Verification / Done When Criteria | Status |
|---|---|---|---|---|
| **R0** | **Audit first (no new features)** | Read all code, write `docs/AUDIT.md`, catalog mocks, trace resume bug, check env vars, write `docs/PROGRESS.md`. | Every page and route marked real or mocked; exact root causes documented. | **DONE** |
| **R1** | **Access rules and roles** | Setup `@supabase/ssr`, server middleware (`proxy`), server-side `getUser()` checks, remove nav role toggle, hide nav during onboarding, normalize page widths, write Playwright tests. | Every cell in the docs/05 section 3 access table passes with Playwright. | **DONE (verified by test)** |
| **R2** | **Real resume parsing** | Implement Supabase Storage upload with hash, text extraction (`unpdf` for PDF, `mammoth` for DOCX), scan detection/OCR fallback, Claude API JSON schema extraction, Zod validation, skill normalization, confidence flagging, overwrite prompt, `parse_runs` audit logging. | Uploading an engineer's resume, a designer's resume, and a plain-text file produces three genuinely different profiles. Tested via Playwright/unit test. | **DONE (verified by test)** |
| **R3** | **Clean data and forms** | Purge all copied names (Persist, Corpvance, Face Search) and replace with fictional demo companies labeled "(Demo)"; rewrite dashboard banner copy; validate phones with `libphonenumber-js` (E.164, no duplicate `+91`, no leading 0); migrate forms to TanStack Form + Zod with auto-save drafts. | Zero reference names in codebase. Phone saved as `+91XXXXXXXXXX`. Forms validate inline. | **DONE (verified by test)** |
| **R4** | **Auth and emails** | Implement passwordless email sign-in / Google OAuth; build Supabase Send Email hook with React Email + Resend; implement `notify(event, payload)` with `email_outbox` table and cron worker guarded by `CRON_SECRET`; handle retries and unsubscriptions. | All 15 setup guide email events send and are logged in `email_outbox`. | **IN PROGRESS** |
| **R5** | **Campfire for real** | Supabase Realtime Chat block with Postgres `messages` table; automatic room per listing; host controls (pinned announcements, mute, moderation); archive to read-only when listing closes. | Two separate browser contexts see live messages and history persists across page reloads. Verified via Playwright. | **PENDING** |
| **R6** | **Company side** | Real 3-input company onboarding, 4-question posting flow with live preview and Claude Prompt A listing generator, company dashboard (`My listings`, applicant inbox with Shortlist/Hire/Reject), public company microsite. | A company can sign up and post a live job in under 2 minutes, and shortlist an applicant in the database. | **PENDING** |
| **R7** | **Challenges & submissions** | Challenge listings with 100-pt rubric; GitHub App repo picker; multi-version submission handling (demo URL, notes, repo, files); Prompt B applicant summary with strengths, gaps, and rubric scoring. | A candidate submits twice and the company inbox displays both versioned submissions with rubrics. | **PENDING** |
| **R8** | **Admin, security & deploy** | Admin moderation console; company domain verification check; Row-Level Security (RLS) policies audited on every table; 12-line end-to-end test execution; Vercel deployment readiness. | Full 12-line end-to-end test from docs/02 passes with Playwright; zero RLS leaks. | **PENDING** |

---

## 3. Blockers and Environment Keys

- **Current Blockers**: None for starting R1.
- **Keys Required for Upcoming Steps**:
  - **For R1**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. (Obtainable from Supabase Dashboard -> Project Settings -> API).
  - **For R2**: `ANTHROPIC_API_KEY` (Anthropic Console) and `ANTHROPIC_MODEL`.
  - **For R4**: `RESEND_API_KEY`, `EMAIL_FROM`, `SEND_EMAIL_HOOK_SECRET`, `CRON_SECRET`.
  - **For R7**: `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`.

*(The user will fill `.env.local` directly; no secrets are to be requested or pasted in chat).*

---

## 4. How to Run & Verify

```bash
# Check audit files
cat docs/AUDIT.md
cat docs/PROGRESS.md

# Verify current build passes
npm run build
```
