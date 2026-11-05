import { test, expect } from '@playwright/test';

// Helpers to set authentication states via cookie
const setLoggedOut = async (context: any) => {
  await context.clearCookies();
};

const setSignedInOnboardingNotDone = async (context: any, role: 'candidate' | 'company' = 'candidate') => {
  await context.clearCookies();
  await context.addCookies([
    {
      name: 'hireroom_test_user',
      value: encodeURIComponent(
        JSON.stringify({
          id: 'test-user-new',
          email: `${role}-new@test.com`,
          role,
          onboarding_completed: false,
        })
      ),
      domain: 'localhost',
      path: '/',
    },
  ]);
};

const setSignedInOnboardedCandidate = async (context: any) => {
  await context.clearCookies();
  await context.addCookies([
    {
      name: 'hireroom_test_user',
      value: encodeURIComponent(
        JSON.stringify({
          id: 'test-cand-onboarded',
          email: 'candidate@test.com',
          role: 'candidate',
          onboarding_completed: true,
        })
      ),
      domain: 'localhost',
      path: '/',
    },
  ]);
};

const setSignedInOnboardedCompany = async (context: any) => {
  await context.clearCookies();
  await context.addCookies([
    {
      name: 'hireroom_test_user',
      value: encodeURIComponent(
        JSON.stringify({
          id: 'test-comp-onboarded',
          email: 'founder@company.com',
          role: 'company',
          onboarding_completed: true,
        })
      ),
      domain: 'localhost',
      path: '/',
    },
  ]);
};

const setSignedInOnboardedAdmin = async (context: any) => {
  await context.clearCookies();
  await context.addCookies([
    {
      name: 'hireroom_test_user',
      value: encodeURIComponent(
        JSON.stringify({
          id: 'test-admin-onboarded',
          email: 'admin@hireroom.dev',
          role: 'admin',
          onboarding_completed: true,
        })
      ),
      domain: 'localhost',
      path: '/',
    },
  ]);
};

test.describe('Section 3: Access Rules Matrix', () => {
  // --- ROW 1: Landing, /login, /signup ---
  test('Cell 1: Logged out -> Landing, /login, /signup are ALLOWED', async ({ page, context }) => {
    await setLoggedOut(context);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(page.url()).toBe('http://localhost:3000/');

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    expect(page.url()).toContain('/login');

    await page.goto('/signup', { waitUntil: 'domcontentloaded' });
    expect(page.url()).toContain('/signup');
  });

  test('Cell 2: Signed in, onboarding not done -> Landing, /login, /signup REDIRECT to onboarding', async ({ page, context }) => {
    await setSignedInOnboardingNotDone(context, 'candidate');

    await page.goto('/');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);

    await page.goto('/login');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);

    await page.goto('/signup');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);
  });

  test('Cell 3: Signed in and onboarded -> Landing, /login, /signup REDIRECT to dashboard', async ({ page, context }) => {
    // Candidate
    await setSignedInOnboardedCandidate(context);
    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/);

    // Company
    await setSignedInOnboardedCompany(context);
    await page.goto('/');
    await expect(page).toHaveURL(/\/company\/dashboard/);
  });

  // --- ROW 2: Browse roles, challenges, companies ---
  test('Cell 4: Logged out -> Browse roles, challenges, companies are ALLOWED (read-only)', async ({ page, context }) => {
    await setLoggedOut(context);

    await page.goto('/roles');
    expect(page.url()).toContain('/roles');

    await page.goto('/companies');
    expect(page.url()).toContain('/companies');
  });

  test('Cell 5: Signed in, onboarding not done -> Browse pages REDIRECT to onboarding', async ({ page, context }) => {
    await setSignedInOnboardingNotDone(context, 'candidate');

    await page.goto('/roles');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);

    await page.goto('/companies');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);
  });

  test('Cell 6: Signed in and onboarded -> Browse pages are ALLOWED', async ({ page, context }) => {
    await setSignedInOnboardedCandidate(context);

    await page.goto('/roles');
    expect(page.url()).toContain('/roles');

    await page.goto('/companies');
    expect(page.url()).toContain('/companies');
  });

  // --- ROW 3: Onboarding ---
  test('Cell 7: Logged out -> Onboarding REDIRECTS to login', async ({ page, context }) => {
    await setLoggedOut(context);

    await page.goto('/onboarding/candidate');
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain('next=');
  });

  test('Cell 8: Signed in, onboarding not done -> Onboarding is ALLOWED for own role only', async ({ page, context }) => {
    // Candidate accessing candidate onboarding -> allowed
    await setSignedInOnboardingNotDone(context, 'candidate');
    await page.goto('/onboarding/candidate');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);

    // Candidate attempting to access company onboarding -> redirected to candidate onboarding
    await page.goto('/onboarding/company');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);

    // Company attempting to access candidate onboarding -> redirected to company onboarding
    await setSignedInOnboardingNotDone(context, 'company');
    await page.goto('/onboarding/candidate');
    await expect(page).toHaveURL(/\/onboarding\/company/);
  });

  test('Cell 9: Signed in and onboarded -> Onboarding REDIRECTS to dashboard', async ({ page, context }) => {
    await setSignedInOnboardedCandidate(context);
    await page.goto('/onboarding/candidate');
    await expect(page).toHaveURL(/\/dashboard/);

    await setSignedInOnboardedCompany(context);
    await page.goto('/onboarding/company');
    await expect(page).toHaveURL(/\/company\/dashboard/);
  });

  // --- ROW 4: Dashboard, Campfire, applications, profile ---
  test('Cell 10: Logged out -> Dashboard, Campfire, profile REDIRECT to login', async ({ page, context }) => {
    await setLoggedOut(context);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain('next=');

    await page.goto('/campfire');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Cell 11: Signed in, onboarding not done -> Dashboard, Campfire, profile REDIRECT to onboarding', async ({ page, context }) => {
    await setSignedInOnboardingNotDone(context, 'candidate');

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);

    await page.goto('/campfire');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);

    await page.goto('/profile');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);
  });

  test('Cell 12: Signed in and onboarded -> Dashboard, Campfire, profile are ALLOWED', async ({ page, context }) => {
    await setSignedInOnboardedCandidate(context);

    await page.goto('/dashboard');
    expect(page.url()).toContain('/dashboard');

    await page.goto('/campfire');
    expect(page.url()).toContain('/campfire');

    await page.goto('/profile');
    expect(page.url()).toContain('/profile');
  });

  // --- ROW 5: Company area (/company/*) ---
  test('Cell 13: Logged out -> /company/* REDIRECTS to login', async ({ page, context }) => {
    await setLoggedOut(context);

    await page.goto('/company/dashboard');
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain('next=');

    await page.goto('/company/post');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Cell 14: Signed in, onboarding not done -> /company/* REDIRECTS to onboarding', async ({ page, context }) => {
    await setSignedInOnboardingNotDone(context, 'company');

    await page.goto('/company/dashboard');
    await expect(page).toHaveURL(/\/onboarding\/company/);

    await page.goto('/company/post');
    await expect(page).toHaveURL(/\/onboarding\/company/);
  });

  test('Cell 15: Signed in and onboarded -> /company/* ALLOWED for company role only', async ({ page, context }) => {
    // Company role is allowed
    await setSignedInOnboardedCompany(context);
    await page.goto('/company/dashboard');
    expect(page.url()).toContain('/company/dashboard');

    await page.goto('/company/post');
    expect(page.url()).toContain('/company/post');

    // Candidate role is redirected away to candidate dashboard
    await setSignedInOnboardedCandidate(context);
    await page.goto('/company/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // --- ROW 6: Admin area (/admin/*) ---
  test('Cell 16: Logged out -> /admin/* REDIRECTS to login', async ({ page, context }) => {
    await setLoggedOut(context);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain('next=');
  });

  test('Cell 17: Signed in, onboarding not done -> /admin/* REDIRECTS to onboarding', async ({ page, context }) => {
    await setSignedInOnboardingNotDone(context, 'candidate');

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/onboarding\/candidate/);
  });

  test('Cell 18: Signed in and onboarded -> /admin/* ALLOWED for ADMIN_EMAILS only', async ({ page, context }) => {
    // Admin user is allowed
    await setSignedInOnboardedAdmin(context);
    await page.goto('/admin');
    expect(page.url()).toContain('/admin');

    // Non-admin user is redirected to dashboard
    await setSignedInOnboardedCandidate(context);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
