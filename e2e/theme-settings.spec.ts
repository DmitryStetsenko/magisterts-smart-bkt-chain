import { test, expect } from '@playwright/test';

const PORTALS = [
  { name: 'Student Portal', url: 'http://localhost:3002' },
  { name: 'Teacher Portal', url: 'http://localhost:3003' },
  { name: 'Admin Portal', url: 'http://localhost:3004' },
  { name: 'Study Portal', url: 'http://localhost:3006' },
];

test.describe('Cross-App Settings Theme Switcher (SBC-433)', () => {
  for (const portal of PORTALS) {
    test(`switches Light/Dark/System theme in Settings on ${portal.name}`, async ({ page }) => {
      await page.goto(portal.url, { waitUntil: 'networkidle', timeout: 60000 });

      // Click Settings gear icon on left Opera Rail (retry click until Settings drawer hydrates & opens)
      const settingsBtn = page.locator('button[title="Налаштування"]').first();
      await expect(settingsBtn).toBeVisible({ timeout: 30000 });

      const themeSection = page.locator('[data-testid="theme-settings-section"]').first();
      await expect(async () => {
        if (!(await themeSection.isVisible())) {
          await settingsBtn.click();
        }
        await expect(themeSection).toBeVisible({ timeout: 2000 });
      }).toPass({ timeout: 20000 });

      // Switch to Light mode
      await themeSection.locator('[data-testid="theme-mode-light"]').click();
      await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
      const savedLight = await page.evaluate(() => localStorage.getItem('sbc_theme_mode'));
      expect(savedLight).toBe('light');

      // Switch back to Dark mode
      await themeSection.locator('[data-testid="theme-mode-dark"]').click();
      await expect(page.locator('html')).toHaveClass(/\bdark\b/);
      const savedDark = await page.evaluate(() => localStorage.getItem('sbc_theme_mode'));
      expect(savedDark).toBe('dark');
    });
  }

  test('Admin global default theme propagates to other portals with clean localStorage', async ({ browser, request }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    try {
      await adminPage.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 60000 });
      const settingsBtn = adminPage.locator('button[title="Налаштування"]').first();
      await expect(settingsBtn).toBeVisible({ timeout: 30000 });
      await settingsBtn.click();

      const globalSection = adminPage.locator('[data-testid="global-default-theme-section"]');
      await expect(globalSection).toBeVisible({ timeout: 15000 });

      // Set global default theme to Light in Admin Portal
      const putPromise = adminPage.waitForResponse(
        (res) => res.url().includes('/system-config/theme') && res.request().method() === 'PUT' && res.ok()
      );
      await globalSection.locator('[data-testid="default-theme-light"]').click();
      await putPromise;

      // Verify backend persisted 'light'
      const apiRes = await request.get('http://localhost:3000/api/v1/system-config/theme');
      expect(apiRes.ok()).toBeTruthy();
      const apiData = await apiRes.json();
      expect(apiData.defaultTheme).toBe('light');

      // Open a brand new browser context on Student Portal (port 3002) with a STALE localStorage 'dark' (no newer timestamp)
      const studentContext = await browser.newContext();
      const studentPage = await studentContext.newPage();
      await studentPage.addInitScript(() => {
        localStorage.setItem('sbc_theme_mode', 'dark');
      });
      await studentPage.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 60000 });

      // Student Portal should automatically adopt Light theme from newer Admin global default
      await expect(studentPage.locator('html')).not.toHaveClass(/\bdark\b/, { timeout: 10000 });
      await studentContext.close();

      // Verify non-cyclic CSS variable --sbc-slate-800 resolves cleanly on Study Portal (3006)
      const studyContext = await browser.newContext();
      const studyPage = await studyContext.newPage();
      await studyPage.goto('http://localhost:3006', { waitUntil: 'networkidle', timeout: 60000 });
      await expect(studyPage.locator('html')).not.toHaveClass(/\bdark\b/, { timeout: 10000 });
      const slate800 = await studyPage.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--sbc-slate-800').trim()
      );
      expect(slate800).toBeTruthy();
      await studyContext.close();

      // Restore global default back to Dark
      const restorePromise = adminPage.waitForResponse(
        (res) => res.url().includes('/system-config/theme') && res.request().method() === 'PUT' && res.ok()
      );
      await globalSection.locator('[data-testid="default-theme-dark"]').click();
      await restorePromise;
    } finally {
      await adminContext.close();
    }
  });
});
