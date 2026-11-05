# HireRoom Recovery & Build Progress

**Current Step**: **R0 (Audit Completed)**  
**Last Updated**: 5 November 2026  
**Status**: Audit finished (`docs/AUDIT.md` created). Ready for Prompt R1.

---

## 1. Summary of Current State

- **R0 (Audit)**: ✅ **Completed** (verified by codebase inspection).
- **Core Findings**:
  - The visual system, brand design tokens, and frontend component shells are responsive and aligned with the specification.
  - The application is currently running purely on in-memory React state (`store.tsx`) without real database operations.
  - Resume parsing returns a static JavaScript fixture and ignores uploaded files.
  - Route protection and authentication middleware are unbuilt.
  - Several company names, role titles, and promotional text were copied from reference materials and must be purged.
  - Page widths and navbar visibility during onboarding need standardization.

---

## 2. Ordered Recovery & Fix Plan (R1 to R8)

| Step | Objective | Primary Deliverables | Verification / Done When Criteria | Status |
|---|---|---|---|---|
| **R0** | **Audit first (no new features)** | Read all code, write `docs/AUDIT.md`, catalog mocks, trace resume bug, check env vars, write `docs/PROGRESS.md`. | Every page and route marked real or mocked; exact root causes documented. | **DONE** |
| **R1** | **Access rules and roles** | Setup `@supabase/ssr`, server middleware (`proxy`), server-side `getUser()` checks, remove nav role toggle, hide nav during onboarding, normalize page widths, write Playwright tests. | Every cell in the docs/05 section 3 access table passes with Playwright. | **NEXT** |
| **R2** | **Real resume parsing** | Implement Supabase Storage upload with hash, text extraction (`unpdf`/`pdfjs-dist` for PDF, `mammoth` for DOCX), OCR fallback, Claude API JSON schema extraction, Zod validation, skill normalization, confidence flagging, overwrite prompt, `parse_runs` audit logging. | Uploading an engineer's resume, a designer's resume, and a plain-text file produces three genuinely different profiles. Tested via Playwright/unit test. | **PENDING** |
| **R3** | **Clean data and forms** | Purge all copied names (Persist, Corpvance, Face Search) and replace with fictional demo companies labeled "(Demo)"; rewrite dashboard banner copy; validate phones with `libphonenumber-js` (E.164, no duplicate `+91`, no leading 0); migrate forms to TanStack Form + Zod with auto-save drafts. | Zero reference names in codebase. Phone saved as `+91XXXXXXXXXX`. Forms validate inline. | **PENDING** |
| **R4** | **Auth and emails** | Implement passwordless email sign-in / Google OAuth; build Supabase Send Email hook with React Email + Resend; implement `notify(event, payload)` with `email_outbox` table and cron worker guarded by `CRON_SECRET`; handle retries and unsubscriptions. | All 15 setup guide email events send and are logged in `email_outbox`. | **PENDING** |
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
