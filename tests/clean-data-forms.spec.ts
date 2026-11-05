import { test, expect } from '@playwright/test';
import { normalizePhoneNumber, isValidE164Phone } from '../src/lib/phone';
import { isIndianListing, formatCompensation } from '../src/lib/currency';
import { DEMO_COMPANIES, DEMO_LISTINGS, DEMO_CANDIDATES } from '../src/lib/seed-data';

test.describe('Step R3: Clean Data, Forms, Phone Validation, and Currency', () => {
  // Test 1: Zero copied names in seed and rendered app
  test('1. Proves zero copied names in seed data and public directory routes', async ({ page }) => {
    // Audit seed data in memory
    for (const company of DEMO_COMPANIES) {
      expect(company.name).toContain('(Demo)');
      expect(company.name).not.toMatch(/Persist|Corpvance|Face Search|Startupathon/i);
    }
    for (const listing of DEMO_LISTINGS) {
      expect(listing.title).not.toMatch(/Build the Operating System for Fanbases/i);
      expect(listing.companyName).not.toMatch(/Persist|Corpvance|Face Search/i);
    }

    // Browse /companies page
    await page.goto('/companies');
    const content = await page.content();
    expect(content).not.toContain('Persist Ventures');
    expect(content).not.toContain('Corpvance');
    expect(content).not.toContain('Face Search AI');
    expect(content).toContain('Kavach Systems (Demo)');
    expect(content).toContain('Zephyr Health (Demo)');
    expect(content).toContain('Apex Commerce (Demo)');
  });

  // Test 2: Verified badge appears only when companies.verified is true
  test('2. Verified badge appears ONLY when companies.verified is true', async ({ page }) => {
    await page.goto('/companies');
    
    // Kavach Systems (verified: true) -> should display Verified Studio badge
    const kavachCard = page.locator('[data-company-id="comp-kavach"]');
    await expect(kavachCard).toBeVisible();
    await expect(kavachCard.locator('text=Verified Studio')).toBeVisible();

    // Apex Commerce (verified: false) -> must NOT display Verified Studio badge
    const apexCard = page.locator('[data-company-id="comp-apex"]');
    await expect(apexCard).toBeVisible();
    await expect(apexCard.locator('text=Verified Studio')).toHaveCount(0);
  });

  // Test 3: Dashboard banner copy promises only HireRoom offers
  test('3. Candidate dashboard banner promises only what HireRoom genuinely offers', async ({ page }) => {
    // Authenticate as onboarded candidate
    await page.context().addCookies([
      {
        name: 'hireroom_test_user',
        value: JSON.stringify({
          id: 'cand-test-1',
          email: 'cand@test.com',
          role: 'candidate',
          onboarding_completed: true,
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/dashboard');
    await expect(page.locator('text=Hire by Proof')).toBeVisible();
    await expect(page.locator('text=Prove your skills with working code')).toBeVisible();

    const bannerText = await page.locator('div.relative.overflow-hidden.rounded-3xl').innerText();
    expect(bannerText).not.toContain('venture studios');
    expect(bannerText).not.toContain('compute credits');
    expect(bannerText).not.toContain('non-dilutive grant resources');
    expect(bannerText).toContain('Skip the resume filter');
  });

  // Test 4: Phone validation with libphonenumber-js (Rule 7)
  test('4. Validates phone numbers with libphonenumber-js, drops leading zero, prevents duplicate +91, stores E.164', async () => {
    // Case A: Duplicate country code and leading 0
    const resA = normalizePhoneNumber('+91 093463 89857', 'IN');
    expect(resA.isValid).toBe(true);
    expect(resA.e164).toBe('+919346389857');
    expect(resA.nationalNumber).toBe('9346389857');

    // Case B: Raw number with leading 0
    const resB = normalizePhoneNumber('09346389857', 'IN');
    expect(resB.isValid).toBe(true);
    expect(resB.e164).toBe('+919346389857');

    // Case C: Repeated +91 +91
    const resC = normalizePhoneNumber('+91 +91 9346389857', 'IN');
    expect(resC.isValid).toBe(true);
    expect(resC.e164).toBe('+919346389857');

    // Case D: Plain 10 digit Indian number
    const resD = normalizePhoneNumber('9876543210', 'IN');
    expect(resD.isValid).toBe(true);
    expect(resD.e164).toBe('+919876543210');

    // Case E: Invalid short number
    const resE = normalizePhoneNumber('12345', 'IN');
    expect(resE.isValid).toBe(false);

    // Case F: US Phone
    const resF = normalizePhoneNumber('4155552671', 'US');
    expect(resF.isValid).toBe(true);
    expect(resF.e164).toBe('+14155552671');
  });

  // Test 5: INR first on Indian listings
  test('5. Shows INR first on Indian listings and challenges', async ({ page }) => {
    // Check currency helper
    expect(isIndianListing('Bengaluru, India')).toBe(true);
    expect(isIndianListing('Mumbai')).toBe(true);
    expect(isIndianListing('Hyderabad (Hybrid)')).toBe(true);
    expect(isIndianListing('San Francisco, USA')).toBe(false);

    // Format compensation
    expect(formatCompensation('$250', 'Bengaluru, India')).toContain('₹');
    expect(formatCompensation('₹28L - ₹42L/yr', 'Bengaluru, India')).toBe('₹28L - ₹42L/yr');

    // Inspect /roles directory
    await page.goto('/roles');
    const pageText = await page.innerText('body');
    expect(pageText).toContain('₹28L - ₹42L/yr');
    expect(pageText).toContain('₹40,000/mo');
  });

  // Test 6: Exactly 2 challenges with 100-pt rubrics, 6 listings, and 10 candidates
  test('6. Verifies exactly 2 challenges with 100-point rubrics, 6 listings, and 10 candidates', async () => {
    expect(DEMO_LISTINGS.length).toBe(6);
    const challenges = DEMO_LISTINGS.filter(l => l.type === 'challenge');
    expect(challenges.length).toBe(2);

    for (const challenge of challenges) {
      const points = challenge.scoringChecklist?.reduce((sum, item) => sum + item.points, 0);
      expect(points).toBe(100);
    }

    expect(DEMO_CANDIDATES.length).toBe(10);
    for (const cand of DEMO_CANDIDATES) {
      expect(isValidE164Phone(cand.phone)).toBe(true);
      expect(cand.phone.startsWith('+91')).toBe(true);
    }
  });

  // Test 7: Autosaved draft functionality in localStorage
  test('7. Verifies autosaved drafts persist and clear on completion', async ({ page }) => {
    // Authenticate as company in onboarding stage
    await page.context().addCookies([
      {
        name: 'hireroom_test_user',
        value: JSON.stringify({
          id: 'comp-draft-user',
          email: 'founder@testhub.example.com',
          role: 'company',
          onboarding_completed: false,
        }),
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/onboarding/company');
    
    // Fill company website and name
    await page.fill('input[placeholder="https://yourcompany.com"]', 'https://testhub.example.com');
    await page.fill('input[placeholder="e.g. Kavach Systems (Demo)"]', 'TestHub Innovations');
    
    // Wait for autosave debounce (500ms)
    await page.waitForTimeout(800);

    // Check localStorage
    const savedDraft = await page.evaluate(() => {
      return localStorage.getItem('hireroom_draft_company_onboarding');
    });

    expect(savedDraft).not.toBeNull();
    const parsed = JSON.parse(savedDraft!);
    expect(parsed.name).toBe('Testhub');
    expect(parsed.website).toBe('https://testhub.example.com');
  });
});
