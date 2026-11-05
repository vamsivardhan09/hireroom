# HireRoom: prompts to paste into the agent

Use one prompt per conversation. Start each with `/plan`, approve the plan, then let it run. Fill `.env.local` yourself when it asks for keys.

The build already exists (about 30 to 40 percent done), so start at **R0**.

---

## Hands-off goal (paste once, after R0 is reviewed)

```
Goal: take HireRoom from its current state to a working product.
Read AGENTS.md and docs/AUDIT.md and docs/PROGRESS.md first.
Work through prompts R1 to R8 from PROMPTS.md in order. For each one: plan, implement, test, update docs/PROGRESS.md, commit, then continue to the next.
Pause only to ask me for env keys (name exactly which and where to get them) or a decision that blocks you.
Never fake or mock anything to keep moving. If something cannot work yet, say so in docs/PROGRESS.md.
```

---

## R0: Audit first (no new features)

```
Read AGENTS.md and docs/05-hireroom-status-and-fix-plan.pdf. Do NOT add features yet.
Audit the existing project and write docs/AUDIT.md with:
1. Every page and API route, and whether it is real (reads and writes the database) or mocked or hard-coded.
2. Every place data is hard-coded, faked, or falls back to a sample. Search for fixtures, constants, "mock", "sample", "demo", seed files, and try/catch blocks that return static data.
3. The route access table from the plan versus what the app does today.
4. Why uploading a different resume gives the same profile. Trace upload, storage, parse, save and form prefill, with file names and line numbers.
5. The env vars the code reads versus .env.example.
6. Any copied names, listings or copy from Startupathon, Persist Ventures, Corpvance or Face Search AI.
Then create docs/PROGRESS.md with the ordered fix list R1 to R8 and stop for my review.
```

## R1: Access rules and roles

```
Implement the access rules in AGENTS.md rule 5 and the table in docs/05 section 3.
Use @supabase/ssr and server-side middleware (named proxy in newer Next.js; check the docs for the installed version) plus server checks in pages and API routes, and row-level security on every table.
Roles come from the account, chosen at sign-up. Remove the Candidate/Company switch from the nav. Hide the main nav during onboarding. Preserve the "next" URL through login. Fix the inconsistent page widths between dashboard, roles and Campfire.
Write a Playwright test for every cell of the access table and make them pass.
```

## R2: Real resume parsing

```
Replace the current resume parsing with the pipeline in docs/05 section 2, following AGENTS.md rule 6.
Steps: validate the file (PDF or DOCX, max 10 MB) and store it in Supabase Storage with a hash; extract text (unpdf or pdfjs-dist for PDFs, mammoth for DOCX; check licenses in the lockfile); if the extracted text is very short treat it as scanned and use OCR (a Docling server at DOCLING_URL if set) or send page images to Claude; call Claude with a JSON schema and "only what is written, null if missing, never invent skills"; validate with Zod; re-check email and phone with regex; normalize skills with an alias map and cap at 25; flag low-confidence fields; save to the profile.
A new upload must replace the previously parsed fields after a confirmation prompt. Log each parse run. No sample-data fallback: on failure show an error and let the user fill the form by hand.
Test with three very different resumes (an engineer, a designer, a plain-text file) and one scanned PDF. The output must be different for each. Add these as Playwright or unit tests.
```

## R3: Clean data and forms

```
Remove all copied or fake data (AGENTS.md rules 1, 2 and 3). Replace the seed with 3 fictional companies labeled "Demo", 6 listings (2 challenges) and 10 candidates, in one clearly labeled seed script.
Rewrite the dashboard banner copy so it only promises things HireRoom really offers.
Fix the phone field with libphonenumber-js: country picker, no duplicate +91, no leading 0, stored as E.164.
Move all forms to TanStack Form + Zod with inline errors and autosaved drafts. Show INR first on Indian listings.
```

## R4: Auth and emails

```
Implement sign-in (email link or code, plus Google) and the 15 emails from docs/02-hireroom-setup-guide.pdf sections 3 and 4: Supabase Send Email hook to an Edge Function with React Email and Resend for sign-in emails, and notify() with an email_outbox table and a worker guarded by CRON_SECRET for event emails.
Include plain-text versions, retries up to 3 times, bounce handling through the Resend webhook, and unsubscribe for non-essential mail.
Ask me for RESEND_API_KEY, EMAIL_FROM and SEND_EMAIL_HOOK_SECRET when you need them. Test each event end to end and show me the emails that were sent.
```

## R5: Campfire for real

```
Make Campfire real. One room per listing, created automatically. Applicants and challenge entrants join automatically; company members are hosts.
Use the Supabase Realtime Chat block with a messages table so history persists. Pinned host announcements, Q&A, report, mute and remove tools. The room is read-only when the listing closes. Unread counts must come from the database.
Remove the "Logged in as ..." debug line and all seeded conversations from the product.
Prove it with a Playwright test using two browser sessions that see each other's messages live and keep them after a reload.
```

## R6: Company side

```
Build the company side from docs/01 sections 3 and 5: company onboarding in 3 inputs (website URL prefill, one-line description, city or remote and team size), the 4-question posting flow with a live preview and AI-written listing (Prompt A in the plan), My listings, the applicants inbox (shortlist, hire, reject, message), and the company page.
Test: a company can sign up and post a job in under two minutes.
```

## R7: Challenges and submissions

```
Build challenges from docs/01: brief, deliverables, scoring checklist (points add up to 100), prize, deadline and max attempts. Submissions with versions: file or zip upload, notes, screenshots, and a GitHub repo picker through a GitHub App (the user connects once and picks from a list; never ask them to paste a URL).
Add the AI applicant summary (Prompt B in the plan) for companies only.
Test: a candidate enters a challenge, submits twice, and the company sees both versions with scores.
```

## R8: Admin, QA and deploy

```
Build the admin console (approve companies and listings, handle reports) and company verification (work email domain must match the website; free mail domains go to manual review).
Run a row-level security audit: for each table, prove a user cannot read or write another user's data.
Run the full 12-line end-to-end test from docs/02 section 5 with Playwright and report each line pass or fail with evidence. Fix failures and repeat.
Prepare deployment (Vercel): list every env var to set, and confirm the build passes.
```

---

## Final check (use any time)

```
Read AGENTS.md. Without changing anything, check the product against the definition of done: run the access-table tests and the 12-line end-to-end test, search the code for mock data and copied names, and list env vars read versus .env.example. Report pass or fail per item with evidence.
```
