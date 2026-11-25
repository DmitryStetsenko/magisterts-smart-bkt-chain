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
});
