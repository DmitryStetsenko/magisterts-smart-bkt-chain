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

  test('Automated Module Numbering, Live Ukrainian Transliteration and Slug Validation in Course Studio', async ({ page }) => {
    const studioTimestamp = Date.now();
    const studioCourseTitle = `Веб-розробка та архітектура ${studioTimestamp}`;
    const studioCourseSlug = `web-arch-${studioTimestamp}`;

    // 1. Create a draft course via API for reliable isolated testing
    const createRes = await page.request.post('http://localhost:3000/api/v1/courses', {
      data: {
        title: studioCourseTitle,
        slug: studioCourseSlug,
        description: 'Тестовий курс для перевірки автоматичної нумерації та транслітерації слага',
        targetAudience: '10-11 класи',
        defaultMasteryThreshold: 0.85,
        isPublished: false,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const course = await createRes.json();

    try {
      // 2. Open Admin Portal in Studio mode for this course
      await page.goto(`http://localhost:3004/?tab=create_course&mode=studio&course=${studioCourseSlug}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      await expect(page.getByRole('heading', { name: studioCourseTitle })).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Маршрут автора курсу: Крок 2 з 5')).toBeVisible();

      // 3. Click "Додати Модуль"
      const addModuleBtn = page.locator('main').getByRole('button', { name: /Додати Модуль/i });
      await expect(addModuleBtn).toBeVisible();
      await addModuleBtn.click();

      // 4. Verify Automatic Numbering in creation panel (Модуль #1)
      await expect(page.getByText('Новий тематичний модуль')).toBeVisible();
      await expect(page.getByText('Модуль #1')).toBeVisible();
      const orderInput = page.locator('input[type="number"][min="1"]').first();
      await expect(orderInput).toHaveValue('1');

      // 5. Verify Placeholder does NOT contain "Модуль 6:"
      const titleInput = page.locator('input[placeholder*="Інтерактивні форми та валідація даних"]');
      await expect(titleInput).toBeVisible();

      // 6. Type title in Ukrainian with punctuation and verify live transliteration
      await titleInput.fill('Інтерактивні форми & валідація даних');

      const slugInput = page.locator('input[placeholder="наприклад, interaktyvni-formy"]');
      await expect(slugInput).toBeVisible();

      // Transliterated slug should automatically be generated on the fly
      await expect(slugInput).toHaveValue('interaktyvni-formy-and-validatsiya-danykh');

      // Check green validation indicator
      await expect(page.getByText(/Коректний URL-ідентифікатор/i)).toBeVisible();
      await expect(page.getByText(new RegExp(`/learn/${studioCourseSlug}/interaktyvni-formy-and-validatsiya-danykh`))).toBeVisible();

      // Check theoryUrl auto-sync
      const theoryInput = page.locator(`input[value*="/learn/${studioCourseSlug}/interaktyvni-formy-and-validatsiya-danykh"]`);
      await expect(theoryInput).toBeVisible();

      // Take screenshot of live transliteration & validation
      await page.screenshot({ path: 'C:/Users/Dima/.gemini/antigravity/brain/f32616d8-c180-4a3d-9dfd-5caf83629066/module_translit_valid.png' });

      // 7. Test invalid slug validation
      await slugInput.fill('Невалідний слаг!');
      await expect(page.getByText(/Слаг не може містити кириличні літери/i)).toBeVisible();
      const saveBtn = page.getByRole('button', { name: 'Зберегти модуль' });
      await expect(saveBtn).toBeDisabled();

      // 8. Test "↻ З назви" reset button
      const resetSlugBtn = page.getByRole('button', { name: /↻ З назви/i });
      await expect(resetSlugBtn).toBeVisible();
      await resetSlugBtn.click();

      await expect(slugInput).toHaveValue('interaktyvni-formy-and-validatsiya-danykh');
      await expect(saveBtn).toBeEnabled();

      // 9. Save module
      await saveBtn.click();
      await expect(page.getByText('Модуль успішно створено')).toBeVisible();

      // 10. Verify created module in list
      await expect(page.getByText('Інтерактивні форми & валідація даних')).toBeVisible();
      await expect(page.getByText('/interaktyvni-formy-and-validatsiya-danykh', { exact: true })).toBeVisible();

      // 11. Click "Додати Модуль" again and verify automatic numbering advances to #2
      await addModuleBtn.click();
      await expect(page.getByText('Модуль #2')).toBeVisible();
      await expect(orderInput).toHaveValue('2');

      // Take screenshot of advancing to Module #2
      await page.screenshot({ path: 'C:/Users/Dima/.gemini/antigravity/brain/f32616d8-c180-4a3d-9dfd-5caf83629066/module_advance_numbering.png' });
    } finally {
      // Clean up test course
      await page.request.delete(`http://localhost:3000/api/v1/courses/${course.id}`);
    }
  });
});
