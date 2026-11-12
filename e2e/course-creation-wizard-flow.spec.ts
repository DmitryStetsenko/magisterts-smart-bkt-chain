import { test, expect } from '@playwright/test';

test.describe('Course Creation Wizard & Draft Status Verification Suite', () => {
  const timestamp = Date.now();
  const testTitle = `Право та Цифрова Безпека ${timestamp}`;
  const testSlug = `civics-law-${timestamp}`;

  test('Step-by-step Course Creation keeps user in creation context and reveals drafts in catalog', async ({ page }) => {
    // 1. Open Admin Portal
    await page.goto('http://localhost:3004', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Admin');
    await expect(page.getByText('Управління Навчальними Курсами')).toBeVisible({ timeout: 15000 });

    // 2. Click "Створення нового курсу" icon in Rail
    const createRailBtn = page.locator('nav button[title*="Створення нового курсу"]');
    await expect(createRailBtn).toBeVisible();
    await createRailBtn.click();

    // 3. Verify we are in create_course mode and Rail is highlighted on create_course
    await expect(page.getByRole('heading', { name: 'Створення Нового Навчального Курсу' })).toBeVisible();
    await expect(page.locator('nav[aria-label="Breadcrumb"]').getByText('Створення нового курсу')).toBeVisible();

    // 4. Fill form metadata
    await page.locator('input[placeholder*="Основи кібербезпеки"]').fill(testTitle);
    const slugInput = page.locator('input[placeholder="cybersecurity-basics"]');
    await slugInput.fill(testSlug);
    await page.locator('textarea').fill('Тестовий курс для перевірки покрокового створення');

    // 5. Select standard 0.85
    const stdBtn = page.locator('form button:has-text("0.85 — Золотий стандарт")');
    if (await stdBtn.isVisible()) {
      await stdBtn.click();
    }

    // Take screenshot of Step 1 form
    await page.screenshot({ path: 'C:/Users/Dima/.gemini/antigravity/brain/f32616d8-c180-4a3d-9dfd-5caf83629066/wizard_step1_ready.png' });

    // 6. Click "Зберегти та перейти до Модулів (Крок 2) →"
    const submitBtn = page.getByRole('button', { name: /Зберегти та перейти до Модулів/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 7. Verify we TRANSITION TO STEP 2 WITHIN "Створення курсу" (NOT Catalog!)
    await expect(page.getByText('Маршрут автора курсу: Крок 2 з 5')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: testTitle })).toBeVisible();
    await expect(page.getByText('● Чернетка').first()).toBeVisible();

    // Verify Rail Icon is STILL "Створення нового курсу"
    const activeRailBtn = page.locator('nav button.bg-slate-800\\/90, nav button[title*="Створення нового курсу"]');
    await expect(createRailBtn).toHaveClass(/bg-slate-800/);

    // Verify Breadcrumbs say: CMS Адміністрування / Створення курсу / {Title} (Крок 2 з 5)
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb.getByText('Створення курсу')).toBeVisible();
    await expect(breadcrumb.getByText(testTitle)).toBeVisible();
    await expect(breadcrumb.getByText('Крок 2 з 5')).toBeVisible();

    // Verify drawer has "Майстер створення курсу"
    await expect(page.locator('aside').getByText('Майстер створення курсу')).toBeVisible();
    await expect(page.locator('aside').getByText(/Готовність курсу/i)).toBeVisible();
    await expect(page.locator('aside').getByText(/Маршрут автора курсу/i)).toBeVisible();

    // Take screenshot of Step 2 in Studio View
    await page.screenshot({ path: 'C:/Users/Dima/.gemini/antigravity/brain/f32616d8-c180-4a3d-9dfd-5caf83629066/wizard_step2_studio.png' });

    // 8. Test navigating back to Step 1 (Metadata) to edit
    const backToStep1Btn = page.getByRole('button', { name: /Назад: Базові метадані \(Крок 1\)/i });
    await expect(backToStep1Btn).toBeVisible();
    await backToStep1Btn.click();

    // Verify Settings tab is active
    await expect(page.getByText('Назва курсу *')).toBeVisible();
    await expect(page.locator('input[value="' + testTitle + '"]')).toBeVisible();

    // Click "Продовжити: Модульна структура (Крок 2) →"
    const continueToStep2Btn = page.getByRole('button', { name: /Продовжити: Модульна структура/i });
    await expect(continueToStep2Btn).toBeVisible();
    await continueToStep2Btn.click();

    // 9. Now navigate to "Каталог курсів" via Rail
    const catalogRailBtn = page.locator('nav button[title*="Каталог курсів"]');
    await expect(catalogRailBtn).toBeVisible();
    await catalogRailBtn.click();

    // Verify Catalog view
    await expect(page.getByText('Управління Навчальними Курсами')).toBeVisible({ timeout: 10000 });

    // Check status filter tabs
    const allTab = page.locator('button:has-text("Всі")').first();
    const publishedTab = page.locator('button:has-text("Опубліковані")').first();
    const draftsTab = page.locator('button:has-text("Чернетки")').first();

    await expect(allTab).toBeVisible();
    await expect(publishedTab).toBeVisible();
    await expect(draftsTab).toBeVisible();

    // In "Всі", our course should be visible with "Чернетка" badge
    await expect(page.getByRole('main').getByText(testTitle)).toBeVisible();
    await expect(page.getByText('● Чернетка').first()).toBeVisible();

    // Click "Чернетки" tab
    await draftsTab.click();
    await expect(page.getByRole('main').getByText(testTitle)).toBeVisible();

    // Click "Опубліковані" tab
    await publishedTab.click();
    // Our test course should NOT be visible in published
    await expect(page.getByRole('main').getByText(testTitle)).not.toBeVisible();

    // Take screenshot of Catalog with status tabs
    await page.screenshot({ path: 'C:/Users/Dima/.gemini/antigravity/brain/f32616d8-c180-4a3d-9dfd-5caf83629066/catalog_drafts_tabs.png' });

    // Clean up created test course
    const allCoursesRes = await page.request.get('http://localhost:3000/api/v1/courses?status=ALL');
    if (allCoursesRes.ok()) {
      const allC = await allCoursesRes.json();
      const match = allC.find((c: any) => c.slug === testSlug);
      if (match) {
        await page.request.delete(`http://localhost:3000/api/v1/courses/${match.id}`);
      }
    }
  });
});
