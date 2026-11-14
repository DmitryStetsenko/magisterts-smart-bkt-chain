import { test, expect } from '@playwright/test';

test.describe('Cross-App Dynamic Course Ecosystem Synchronization (SBC-427)', () => {
  test('1. Dynamic Course & Module Theory rendering in Study Portal (apps/study)', async ({ page }) => {
    // 1. Visit /learn/:courseSlug/:moduleSlug
    await page.goto('http://localhost:3006/learn/js-dev/syntax-and-variables', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // 2. Verify redirect to canonical App Router lesson page
    await expect(page).toHaveURL(/.*\/courses\/js-dev\/syntax-and-variables\/syntax-and-variables/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // 3. Verify Header Course Badge & Exact Main Lesson Heading
    await expect(page.locator('header').getByText('JavaScript & Web Engineering')).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('heading', { name: 'Модуль 1: Змінні, Типи та Оператори', exact: true })
    ).toBeVisible({ timeout: 15000 });

    // 4. Verify Sidebar Module Navigation
    await expect(page.getByText('Тематичні модулі')).toBeVisible();
    await expect(page.getByText('Умовні конструкції та Функції')).toBeVisible();

    // 5. Open UserProfileDrawer and verify published courses list
    const profileBtn = page.locator('header button[title*="відкриття профілю"]').first();
    await expect(profileBtn).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);
    await profileBtn.click();

    await expect(page.getByText('Навчальні Курси')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /JavaScript & Web Engineering/i })).toBeVisible();

    // 6. Capture artifact
    await page.screenshot({
      path: 'C:/Users/Dima/.gemini/antigravity/brain/f32616d8-c180-4a3d-9dfd-5caf83629066/cross_app_study_portal.png',
    });
  });

  test('2. Dynamic Course Selection and Module Checkboxes in Teacher Classroom Creator (apps/teacher)', async ({ page }) => {
    // 1. Visit Teacher Dashboard
    await page.goto('http://localhost:3003', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await expect(page.locator('header').getByText('Teacher')).toBeVisible({ timeout: 15000 });

    // 2. Open Classroom tab in Rail
    const classroomRailBtn = page.getByRole('button', { name: 'Навчальні Групи & Інвайт-коди' });
    await expect(classroomRailBtn).toBeVisible({ timeout: 15000 });
    await classroomRailBtn.click();

    // Verify Classroom Manager view is rendered
    await expect(page.getByText('Навчальні Групи & Інвайт-Коди (Classrooms)')).toBeVisible({ timeout: 15000 });

    // 3. Click "Створити групу" button
    const createClassBtn = page.getByRole('button', { name: 'Створити групу' });
    await expect(createClassBtn).toBeVisible({ timeout: 15000 });
    await createClassBtn.click();

    // 4. Verify modal is open and course selector is present
    await expect(page.getByText('Створити навчальну групу (Клас)')).toBeVisible({ timeout: 10000 });
    const courseSelect = page.locator('select').first();
    await expect(courseSelect).toBeVisible();

    // 5. Select "JavaScript & Web Engineering"
    const jsOption = courseSelect.locator('option:has-text("JavaScript & Web Engineering")');
    await expect(jsOption).toBeAttached({ timeout: 10000 });
    const optionValue = await jsOption.getAttribute('value');
    if (optionValue) {
      await courseSelect.selectOption(optionValue);
    }

    // 6. Switch to "Обрані модулі" to reveal checkbox list
    const selectiveBtn = page.getByRole('button', { name: /Обрані модулі/i });
    await expect(selectiveBtn).toBeVisible();
    await selectiveBtn.click();

    // 7. Verify that the modules of js-dev appear as selectable checkboxes
    await expect(page.getByText('Модуль 1: Змінні, Типи та Оператори')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Модуль 2: Умовні конструкції та Функції')).toBeVisible();

    // 8. Capture artifact
    await page.screenshot({
      path: 'C:/Users/Dima/.gemini/antigravity/brain/f32616d8-c180-4a3d-9dfd-5caf83629066/cross_app_teacher_classroom.png',
    });
  });

  test('3. Dynamic Course Switching & Skill Map in Student Portal (apps/student)', async ({ page }) => {
    // 1. Visit Student Portal
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await expect(page.locator('header').getByText('Smart-BKT-Chain')).toBeVisible({ timeout: 15000 });

    // 2. Open UserProfileDrawer
    const profileBtn = page.locator('header button[title*="відкриття профілю"]').first();
    await expect(profileBtn).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);
    await profileBtn.click();

    // 3. Check for Course list in UserProfileDrawer
    await expect(page.getByText('Навчальні Курси')).toBeVisible({ timeout: 10000 });
    const jsCourseCard = page.locator('button:has-text("JavaScript & Web Engineering")').first();
    await expect(jsCourseCard).toBeVisible({ timeout: 10000 });

    // 4. Click course card to switch
    await jsCourseCard.click();

    // 5. If modal confirmation appears, confirm switch
    const confirmSwitchBtn = page.getByRole('button', { name: /Перемкнути курс|Підтвердити/i });
    if (await confirmSwitchBtn.isVisible()) {
      await confirmSwitchBtn.click();
    }

    // 6. Verify that Header now reflects JavaScript course
    await expect(page.locator('header').getByText('JavaScript & Web Engineering')).toBeVisible({ timeout: 15000 });

    // 7. Capture artifact
    await page.screenshot({
      path: 'C:/Users/Dima/.gemini/antigravity/brain/f32616d8-c180-4a3d-9dfd-5caf83629066/cross_app_student_portal.png',
    });
  });
});
