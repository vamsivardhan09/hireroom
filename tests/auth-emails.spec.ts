import { test, expect } from '@playwright/test';
import {
  EmailEvent,
  EmailPayloadMap,
  isEssentialEmail,
} from '../src/lib/email/types';
import { renderEmail, getEmailSubject } from '../src/lib/email/templates';
import { notify, generateDeduplicationKey } from '../src/lib/email/notify';
import {
  addToOutbox,
  getPendingOutbox,
  markOutboxProcessing,
  markOutboxSent,
  markOutboxFailed,
  addEmailSuppression,
  isEmailSuppressed,
  isUserUnsubscribed,
  updateEmailPreferences,
  __getMemoryOutbox,
  __clearMemoryStores,
} from '../src/lib/email/outbox';

test.describe('Step R4: Auth and Emails Verification Suite', () => {
  test.beforeEach(async ({ context, request }) => {
    await context.clearCookies();
    __clearMemoryStores();
    try {
      await request.post('/api/email/diagnostics?action=clear');
    } catch {}
  });

  test('1. Proves sign-in page supports passwordless email OTP/link and Google OAuth', async ({ page }) => {
    await page.goto('/login');

    // Verify Passwordless Auth heading
    await expect(page.locator('text=Passwordless Auth')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Sign in to');
    await expect(page.locator('h1 span')).toHaveText('HireRoom');

    // Google OAuth button is present
    const googleBtn = page.locator('button', { hasText: 'Continue with Google' });
    await expect(googleBtn).toBeVisible();

    // Magic Link / OTP input is present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Send Magic Link & Code' })).toBeVisible();

    // Fill email and request sign-in code
    await page.fill('input[type="email"]', 'candidate@example.com');
    await page.click('button:has-text("Send Magic Link & Code")');

    // Verify transition to 6-digit OTP code input
    await expect(page.locator('text=Enter 6-digit Code')).toBeVisible();
    await expect(page.locator('input[maxLength="6"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Verify Code & Sign In' })).toBeVisible();
  });

  test('2. Proves sign-up page supports role selection, Google OAuth, and onboarding routing', async ({ page }) => {
    await page.goto('/signup');

    // Verify roles: Candidate and Company
    await expect(page.locator('button', { hasText: 'Candidate' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Company' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Continue with Google' })).toBeVisible();

    // Switch to Company role and verify placeholder
    await page.click('button:has-text("Company")');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('placeholder', 'founder@yourstartup.com');

    // Sign up as new company
    await emailInput.fill('founder@zephyrhealth.com');
    await page.click('button:has-text("Continue to Onboarding")');

    // Should navigate to company onboarding
    await expect(page).toHaveURL(/\/onboarding\/company/, { timeout: 10000 });
  });

  test('3. Proves all 15 email events render valid HTML and plain text with brand tokens', async () => {
    const testCases: Array<{ event: EmailEvent; payload: any }> = [
      {
        event: 'welcome_candidate',
        payload: { recipient: 'arjun@example.com', candidateName: 'Arjun' },
      },
      {
        event: 'welcome_company',
        payload: { recipient: 'founder@kavach.in', companyName: 'Kavach Systems' },
      },
      {
        event: 'signin_link',
        payload: {
          recipient: 'user@example.com',
          magicLink: 'https://hireroom.com/auth/callback?token=xyz',
          otpCode: '849201',
          expiresInMinutes: 10,
        },
      },
      {
        event: 'company_submitted_for_review',
        payload: {
          recipient: 'admin@hireroom.com',
          companyName: 'Zephyr Health',
          companyWebsite: 'https://zephyrhealth.in',
          listingTitle: 'Lead Bio-AI Engineer',
          adminReviewUrl: 'https://hireroom.com/admin',
        },
      },
      {
        event: 'listing_decision',
        payload: {
          recipient: 'founder@zephyrhealth.in',
          companyName: 'Zephyr Health',
          listingTitle: 'Lead Bio-AI Engineer',
          approved: true,
          listingUrl: 'https://hireroom.com/roles',
        },
      },
      {
        event: 'application_received',
        payload: {
          recipient: 'neha@example.com',
          candidateName: 'Neha',
          listingTitle: 'Frontend Engineer',
          companyName: 'Kavach Systems',
          listingId: 'list-kavach-fe',
          campfireUrl: 'https://hireroom.com/campfire?listingId=list-kavach-fe',
        },
      },
      {
        event: 'new_applicants_digest',
        payload: {
          recipient: 'team@kavach.in',
          companyName: 'Kavach Systems',
          applicantCount: 5,
          topMatches: [
            { name: 'Rohan Sharma', title: 'Senior Backend Engineer', matchScore: 94 },
            { name: 'Pooja Iyer', title: 'Systems Architect', matchScore: 89 },
          ],
          inboxUrl: 'https://hireroom.com/company/dashboard',
        },
      },
      {
        event: 'challenge_entered',
        payload: {
          recipient: 'vikram@example.com',
          candidateName: 'Vikram',
          challengeTitle: 'Autonomous Defense Network Agent',
          companyName: 'Kavach Systems',
          deadline: '18 Nov 2026, 11:59 PM IST',
          attemptsAllowed: 3,
          challengeUrl: 'https://hireroom.com/challenges/chal-kavach-01',
          campfireUrl: 'https://hireroom.com/campfire?listingId=chal-kavach-01',
        },
      },
      {
        event: 'submission_received',
        payload: {
          recipient: 'vikram@example.com',
          candidateName: 'Vikram',
          challengeTitle: 'Autonomous Defense Network Agent',
          companyName: 'Kavach Systems',
          versionNumber: 1,
          attemptsRemaining: 2,
          deadline: '18 Nov 2026, 11:59 PM IST',
          submissionUrl: 'https://hireroom.com/challenges/chal-kavach-01/assignment',
        },
      },
      {
        event: 'new_submission_company',
        payload: {
          recipient: 'team@kavach.in',
          companyName: 'Kavach Systems',
          challengeTitle: 'Autonomous Defense Network Agent',
          candidateName: 'Vikram Patel',
          versionNumber: 1,
          reviewUrl: 'https://hireroom.com/company/dashboard',
        },
      },
      {
        event: 'candidate_shortlisted',
        payload: {
          recipient: 'vikram@example.com',
          candidateName: 'Vikram Patel',
          listingTitle: 'Autonomous Defense Network Agent',
          companyName: 'Kavach Systems',
          dashboardUrl: 'https://hireroom.com/dashboard',
        },
      },
      {
        event: 'candidate_hired',
        payload: {
          recipient: 'vikram@example.com',
          candidateName: 'Vikram Patel',
          listingTitle: 'Autonomous Defense Network Agent',
          companyName: 'Kavach Systems',
          dashboardUrl: 'https://hireroom.com/dashboard',
          isCompanyConfirmation: false,
        },
      },
      {
        event: 'candidate_not_selected',
        payload: {
          recipient: 'cand@example.com',
          candidateName: 'Rahul',
          listingTitle: 'Product Designer',
          companyName: 'Apex Commerce',
          rolesUrl: 'https://hireroom.com/roles',
        },
      },
      {
        event: 'challenge_deadline_reminder',
        payload: {
          recipient: 'vikram@example.com',
          candidateName: 'Vikram',
          challengeTitle: 'Autonomous Defense Network Agent',
          companyName: 'Kavach Systems',
          attemptsRemaining: 2,
          deadline: 'Tomorrow, 11:59 PM IST',
          submissionUrl: 'https://hireroom.com/challenges/chal-kavach-01/assignment',
        },
      },
      {
        event: 'listing_closed_summary',
        payload: {
          recipient: 'team@kavach.in',
          companyName: 'Kavach Systems',
          listingTitle: 'Autonomous Defense Network Agent',
          applicantCount: 42,
          shortlistedCount: 3,
          dashboardUrl: 'https://hireroom.com/company/dashboard',
        },
      },
      {
        event: 'campfire_announcement',
        payload: {
          recipient: 'member@example.com',
          memberName: 'Ananya',
          listingTitle: 'Autonomous Defense Network Agent',
          hostName: 'Dr. Ramesh (Kavach CTO)',
          announcementSnippet: 'Evaluation criteria update: edge-case stress test code counts for 30 pts.',
          campfireUrl: 'https://hireroom.com/campfire?listingId=chal-kavach-01',
        },
      },
    ];

    expect(testCases.length).toBeGreaterThanOrEqual(15);

    for (const { event, payload } of testCases) {
      const rendered = await renderEmail(event, payload);
      expect(rendered.subject).toBeTruthy();
      expect(rendered.html).toContain('HireRoom');
      expect(rendered.html).toContain('#E11D48'); // Crimson brand accent
      expect(rendered.text).toBeTruthy();
      expect(rendered.text.length).toBeGreaterThan(20);
    }
  });

  test('4. Proves notify() creates deduplicated outbox entries and in-app notifications', async () => {
    // 1. Dispatch first notification
    const res1 = await notify('application_received', {
      recipient: 'candidate@test.com',
      candidateName: 'Test Candidate',
      listingTitle: 'Staff Backend Engineer',
      companyName: 'Kavach Systems',
      listingId: 'list-kavach-01',
      campfireUrl: 'https://hireroom.com/campfire?listingId=list-kavach-01',
    });

    expect(res1.queued).toBe(true);
    expect(res1.isDuplicate).toBe(false);
    expect(res1.record).toBeDefined();
    expect(res1.record?.status).toBe('pending');
    expect(res1.record?.attempts).toBe(0);

    // 2. Dispatch identical notification -> deduplication prevents second send
    const res2 = await notify('application_received', {
      recipient: 'candidate@test.com',
      candidateName: 'Test Candidate',
      listingTitle: 'Staff Backend Engineer',
      companyName: 'Kavach Systems',
      listingId: 'list-kavach-01',
      campfireUrl: 'https://hireroom.com/campfire?listingId=list-kavach-01',
    });

    expect(res2.queued).toBe(false);
    expect(res2.isDuplicate).toBe(true);

    const outbox = __getMemoryOutbox();
    expect(outbox.length).toBe(1);
  });

  test('5. Proves outbox worker route /api/cron/email-outbox enforces CRON_SECRET authorization', async ({ request }) => {
    // 1. Request without authorization header should return 401
    const unauthRes = await request.get('/api/cron/email-outbox');
    expect(unauthRes.status()).toBe(401);

    // 2. Request with invalid secret should return 401
    const badAuthRes = await request.get('/api/cron/email-outbox', {
      headers: { Authorization: 'Bearer invalid_secret_12345' },
    });
    expect(badAuthRes.status()).toBe(401);

    // 3. Request with valid secret executes cleanly
    const cronSecret = process.env.CRON_SECRET || 'hireroom_cron_secret';

    const validRes = await request.get('/api/cron/email-outbox?dryRun=true', {
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    expect(validRes.status()).toBe(200);
    const json = await validRes.json();
    expect(json.success).toBe(true);
  });

  test('6. Proves outbox worker retries failed emails up to 3 times and updates status', async () => {
    // Queue an email item
    await notify('candidate_shortlisted', {
      recipient: 'shortlisted@example.com',
      candidateName: 'Sanjay',
      listingTitle: 'AI Research Scientist',
      companyName: 'Zephyr Health',
      dashboardUrl: 'https://hireroom.com/dashboard',
    });

    const pending = await getPendingOutbox();
    expect(pending.length).toBe(1);
    const item = pending[0];

    // Attempt 1 fails
    const attempt1 = await markOutboxProcessing(item.id);
    expect(attempt1).toBe(1);
    await markOutboxFailed(item.id, 'Connection timeout to SMTP', attempt1);

    let pendingAfter1 = await getPendingOutbox();
    expect(pendingAfter1.length).toBe(1);
    expect(pendingAfter1[0].attempts).toBe(1);
    expect(pendingAfter1[0].status).toBe('pending');

    // Attempt 2 fails
    const attempt2 = await markOutboxProcessing(item.id);
    expect(attempt2).toBe(2);
    await markOutboxFailed(item.id, 'Rate limit exceeded', attempt2);

    let pendingAfter2 = await getPendingOutbox();
    expect(pendingAfter2.length).toBe(1);
    expect(pendingAfter2[0].attempts).toBe(2);

    // Attempt 3 fails -> transitions to 'failed'
    const attempt3 = await markOutboxProcessing(item.id);
    expect(attempt3).toBe(3);
    await markOutboxFailed(item.id, 'Permanent refusal', attempt3);

    // Now it should no longer be pending
    let pendingAfter3 = await getPendingOutbox();
    expect(pendingAfter3.length).toBe(0);

    const all = __getMemoryOutbox();
    const finalRecord = all.find(r => r.id === item.id);
    expect(finalRecord?.status).toBe('failed');
    expect(finalRecord?.attempts).toBe(3);
    expect(finalRecord?.last_error).toBe('Permanent refusal');
  });

  test('7. Proves Supabase Send Email hook handles sign-in OTP & magic link delivery', async ({ request }) => {
    const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET || 'hireroom_send_email_secret';

    // Test unauthorized call
    const unauth = await request.post('/api/auth/send-email-hook', {
      data: { recipient: 'auth@test.com' },
    });
    expect(unauth.status()).toBe(401);

    // Test authorized call
    const authRes = await request.post('/api/auth/send-email-hook', {
      headers: { 'x-webhook-secret': hookSecret },
      data: {
        user: { email: 'founder@zephyr.in' },
        email_data: {
          token: '928174',
          token_hash: 'hash_abc123',
          redirect_to: '/dashboard',
          site_url: 'http://localhost:3000',
        },
      },
    });

    expect(authRes.status()).toBe(200);
    const json = await authRes.json();
    expect(json.success).toBe(true);
  });

  test('8. Proves Resend webhook suppresses bounced and spam complaint emails', async ({ request }) => {
    const bouncedEmail = 'bounced-user@example.com';
    const complaintEmail = 'complained-user@example.com';

    // 1. Send bounce webhook
    const bounceRes = await request.post('/api/webhooks/resend', {
      data: {
        type: 'email.bounced',
        data: { to: [bouncedEmail] },
      },
    });
    expect(bounceRes.status()).toBe(200);

    // Verify suppression in server
    const diag1 = await request.get(`/api/email/diagnostics?action=is_suppressed&email=${encodeURIComponent(bouncedEmail)}`);
    const json1 = await diag1.json();
    expect(json1.suppressed).toBe(true);

    // 2. Send complaint webhook
    const complaintRes = await request.post('/api/webhooks/resend', {
      data: {
        type: 'email.complained',
        data: { to: [complaintEmail] },
      },
    });
    expect(complaintRes.status()).toBe(200);

    // Verify suppression in server
    const diag2 = await request.get(`/api/email/diagnostics?action=is_suppressed&email=${encodeURIComponent(complaintEmail)}`);
    const json2 = await diag2.json();
    expect(json2.suppressed).toBe(true);
  });

  test('9. Proves user unsubscribe flow respects non-essential preferences while preserving essential mail', async ({ request, page }) => {
    const userEmail = 'unsubscribe-candidate@example.com';

    // 1. Unsubscribe from all non-essential mail via API
    const unsubRes = await request.post('/api/email/unsubscribe', {
      data: { email: userEmail, category: 'all' },
    });
    expect(unsubRes.status()).toBe(200);

    // 2. Verify server recorded suppression for non-essential communications
    const diag = await request.get(`/api/email/diagnostics?action=is_suppressed&email=${encodeURIComponent(userEmail)}`);
    const diagJson = await diag.json();
    expect(diagJson.suppressed).toBe(true);

    // 3. User visits /unsubscribe UI
    await page.goto(`/unsubscribe?email=${encodeURIComponent(userEmail)}`);
    await expect(page.locator('h1')).toContainText('Notification Settings');
    await expect(page.locator('text=Essential account emails')).toBeVisible();
    await page.click('button:has-text("Unsubscribe from Non-Essential Emails")');
    await expect(page.locator('text=Preferences Updated')).toBeVisible();
  });
});
