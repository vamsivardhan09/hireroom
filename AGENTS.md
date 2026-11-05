# HireRoom: standing rules for the coding agent

Read this file first in every conversation. Then read `docs/PROGRESS.md` (create it if missing) so you know where things stand.

## Goal

HireRoom is a hiring platform. A company posts a job, an internship or an open challenge in under two minutes. Candidates apply or enter with one profile. Everything after that happens inside HireRoom: no pasted links, no spreadsheets, no outside chat groups. There are no Round 1/2/3 stages: a listing has applicants, and the company shortlists and hires. Every listing gets its own Campfire room (chat).

The end goal is a working product that real companies and candidates can use, not a set of good-looking screens.

## Source of truth (in `docs/`)

- `01-hireroom-product-plan.pdf`: flows, data model, repos, AI prompts.
- `02-hireroom-setup-guide.pdf`: keys, sign-in, the 15 emails, and the end-to-end test.
- `03-startupathon-screens.pdf`: visual reference only. Take structure and feel, never names, copy, colors or images.
- `04-hiring-platform-repo-research.pdf`: repo notes.
- `05-hireroom-status-and-fix-plan.pdf`: current state of the build, what is wrong, resume parsing design, access rules, fix order.

## Stack

Next.js (App Router) + TypeScript, Tailwind v4, shadcn/ui, Supabase (auth, Postgres, storage, realtime) with `@supabase/ssr`, TanStack Form + Zod, Claude API with structured JSON output, React Email + Resend, Playwright for end-to-end tests.

## Brand

Keep the colors and fonts already in the app (dark ink, crimson accent, serif display headings with one italic accent word, sans body). Move them into one tokens file (CSS variables) so a re-theme is a one-line change. Friendly, plain language, short sentences. INR first for Indian listings.

## Non-negotiable rules

1. **No mock data in the product.** Fixtures and samples are allowed only in tests and in one clearly labeled demo seed script. If a service fails (resume parser, email, AI), show a clear error and let the user continue manually. Never silently fall back to sample data.
2. **Original content only.** Do not use the names, listings or copy of Startupathon, Persist Ventures, Persist Media, Corpvance or Face Search AI anywhere, including seed data and banners. Demo companies are fictional and labeled "Demo".
3. **The Verified badge** appears only when `companies.verified` is true in the database.
4. **Nothing required sends the user outside HireRoom.** Links may be optional fields only.
5. **Access rules** (enforce on the server with middleware, in server components and API routes, and with row-level security; hiding things in the client is not security):
   - Logged out: landing, login, sign-up and read-only browsing of listings and companies. Apply, Campfire and dashboards ask for sign-in and return the user to the page they wanted.
   - Signed in but onboarding not finished: everything redirects to the onboarding flow for their role. The main nav is hidden during onboarding.
   - Signed in and onboarded: landing, login, sign-up and onboarding redirect to the dashboard. Profile edits happen from "Update Profile".
   - Role comes from the account, chosen at sign-up. There is no free Candidate/Company switch in the nav. Company pages need a company role. Admin pages need an email in `ADMIN_EMAILS`.
   - On the server use `getUser()` (verifies the token), not only `getSession()`.
6. **Resume parsing** must read the uploaded file, extract text (PDF or DOCX; use OCR or page images for scanned files), send it to Claude with a JSON schema, validate with Zod, normalize skills with an alias map, mark low-confidence fields, and let the user edit before saving. Parse only what is written; never invent skills. A new upload must replace the previously parsed fields, with a "Replace your profile with this resume?" prompt if the profile already has data. Log every parse run (file hash, status, time).
7. **Phone numbers** are validated with libphonenumber-js (check its license in the lockfile) and stored as E.164. The country code is never typed twice and a leading 0 is dropped.
8. **Emails** follow the 15 events in the setup guide: one `notify(event, payload)` function, an `email_outbox` table with a unique key per email, a worker guarded by `CRON_SECRET`, React Email templates with plain-text versions, retries, bounce handling, and unsubscribe for non-essential mail.
9. **Secrets.** Keys live in `.env.local` only. Keep `.env.example` complete. The service-role key is used only in server code. If a key is missing, show a clear message listing exactly which ones. Never print or commit secrets.
10. **AI fairness.** AI summaries and scores are company-only, always give reasons, never use or infer gender, age, caste, religion, region, college tier, name origin or photo, and never make the hiring decision.
11. **Licenses.** Do not copy code from AGPL or source-available projects (OpenResume, Formbricks, Typebot). Reference projects (CTFd, Bordful, Campfire, OpenCATS, Resume-Matcher) are for ideas and data models unless a license check says otherwise.
12. **Quality.** Mobile-first. Keyboard-friendly forms, visible focus, enough contrast. Consistent page width across pages.

## How to work

- Work in small steps with a task list. After each step, run lint, typecheck, build and the relevant Playwright test before saying it is done.
- Update `docs/PROGRESS.md` at the end of every step: done, in progress, next, blockers, how to run. Say "verified by test" or "not tested". Never claim a feature works because the screen renders.
- Commit after each working feature with a clear message.
- Ask the user only for env keys (name exactly which keys and where to get them) or for a decision that truly blocks you. Otherwise pick the default in the plan and note it.
- Keep conversations short. For a big step, run `/plan` first and finish one prompt from `PROMPTS.md` per conversation.

## Definition of done

The 12-line end-to-end test in section 5 of `docs/02-hireroom-setup-guide.pdf` passes with Playwright, the access table passes, and no mock data remains in the product.
