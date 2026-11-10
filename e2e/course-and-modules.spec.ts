import { test, expect } from '@playwright/test';

test.describe('Course Architecture, Modular Curriculum & BKT Mastery Gating E2E Suite', () => {
  const courseSlug = 'js-dev';

  test('1. Courses & Modules REST API Full Contract Verification', async ({ request }) => {
    // 1.1 Verify GET /api/v1/courses returns list of courses with modules
    const coursesRes = await request.get('http://localhost:3000/api/v1/courses');
    expect(coursesRes.ok()).toBeTruthy();
    const courses = await coursesRes.json();
    expect(Array.isArray(courses)).toBe(true);

    const jsCourse = courses.find((c: any) => c.slug === courseSlug);
    expect(jsCourse).toBeDefined();
    expect(jsCourse.title).toContain('JavaScript');
    expect(jsCourse.defaultMasteryThreshold).toBe(0.85);
    expect(Array.isArray(jsCourse.modules)).toBe(true);
    expect(jsCourse.modules.length).toBeGreaterThanOrEqual(1);

    // 1.2 Verify GET /api/v1/courses/:slug returns full hierarchy
    const courseDetailRes = await request.get(`http://localhost:3000/api/v1/courses/${courseSlug}`);
    expect(courseDetailRes.ok()).toBeTruthy();
    const courseDetail = await courseDetailRes.json();
    expect(courseDetail.slug).toBe(courseSlug);
    expect(Array.isArray(courseDetail.modules)).toBe(true);
    expect(courseDetail.modules.length).toBeGreaterThanOrEqual(5);

    // Check module properties
    const mod1 = courseDetail.modules[0];
    expect(mod1).toHaveProperty('id');
    expect(mod1).toHaveProperty('title');
    expect(mod1).toHaveProperty('minMasteryThreshold');
    expect(mod1.minMasteryThreshold).toBe(0.85);

    // 1.3 Verify GET /api/v1/courses/:courseId/modules
    const modulesRes = await request.get(`http://localhost:3000/api/v1/courses/${jsCourse.id}/modules`);
    expect(modulesRes.ok()).toBeTruthy();
    const modulesList = await modulesRes.json();
    expect(Array.isArray(modulesList)).toBe(true);
    expect(modulesList.length).toBe(courseDetail.modules.length);

    // 1.4 Verify Dynamic Course & Module Lifecycle (Create -> Update -> Delete)
    const newCourseRes = await request.post('http://localhost:3000/api/v1/courses', {
      data: {
        title: 'E2E Test Course Automation',
        slug: 'e2e-test-course',
        description: 'Temporary course created by Playwright E2E suite',
        targetAudience: '10-11 класи',
        defaultMasteryThreshold: 0.88,
      },
    });
    expect(newCourseRes.ok()).toBeTruthy();
    const createdCourse = await newCourseRes.json();
    expect(createdCourse.id).toBeDefined();
    expect(createdCourse.defaultMasteryThreshold).toBe(0.88);

    // Create a module for this course
    const newModuleRes = await request.post(`http://localhost:3000/api/v1/courses/${createdCourse.id}/modules`, {
      data: {
        title: 'Вступний модуль E2E',
        slug: 'e2e-intro-module',
        description: 'Опис першого модуля',
        theoryUrl: '/lesson/e2e-intro',
        minMasteryThreshold: 0.85,
      },
    });
    expect(newModuleRes.ok()).toBeTruthy();
    const createdModule = await newModuleRes.json();
    expect(createdModule.id).toBeDefined();
    expect(createdModule.courseId).toBe(createdCourse.id);

    // Clean up created test course
    const delRes = await request.delete(`http://localhost:3000/api/v1/courses/${createdCourse.id}`);
    expect(delRes.ok()).toBeTruthy();
  });

  test('2. Admin Portal Course CMS & Module Manager Modal UI Flow', async ({ page }) => {
    await page.goto('http://localhost:3004', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Admin');

    // Open Courses CMS tab
    const coursesTabBtn = page.locator('nav button[title*="Керування Курсами"]');
    await expect(coursesTabBtn).toBeVisible({ timeout: 15000 });
    await coursesTabBtn.click();

    // Verify Course Manager Center
    await expect(page.getByText('Управління Навчальними Курсами')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'JavaScript & Web Engineering' })).toBeVisible();
    await expect(page.getByText('BKT P(L): 0.85').first()).toBeVisible();

    // Verify dynamic sidebar has 4 courses
    await expect(page.getByRole('button', { name: /Доступні курси \(4\)/i })).toBeVisible();

    // Find and click the Module Manager button for JavaScript course
    const moduleManagerBtn = page.locator('button:has-text("Модулі (5)")').first();
    await expect(moduleManagerBtn).toBeVisible();
    await moduleManagerBtn.click();

    // Verify Module Manager Modal opened
    await expect(page.getByText('Модульний Конструктор Курсу')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Модуль 1/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Модуль 2/i })).toBeVisible();

    // Close Modal via Escape
    await page.keyboard.press('Escape');
  });

  test('3. Teacher Portal Modular Course Selection & Allowed Modules UI Flow', async ({ page }) => {
    await page.goto('http://localhost:3003', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Teacher');

    // Open Classrooms Tab on the rail
    const classroomsRailBtn = page.locator('nav button[title*="Навчальні Групи"]');
    await expect(classroomsRailBtn).toBeVisible({ timeout: 15000 });
    await classroomsRailBtn.click();

    // Verify Classroom Manager Header
    await expect(page.getByText('Навчальні Групи & Інвайт-коди')).toBeVisible({ timeout: 15000 });

    // Open Create Classroom Modal
    const createClassBtn = page.getByRole('button', { name: /Створити групу/i });
    await expect(createClassBtn).toBeVisible();
    await createClassBtn.click();

    // Verify Modal
    await expect(page.getByText('Створити навчальну групу (Клас)')).toBeVisible({ timeout: 10000 });

    // Click [Обрані модулі] segmented button
    const selectiveModulesBtn = page.getByRole('button', { name: /Обрані модулі/i });
    await expect(selectiveModulesBtn).toBeVisible();
    await selectiveModulesBtn.click();

    // Verify modules checkboxes appear with exact titles
    await expect(page.getByText('Модуль 1: Змінні, Типи та Оператори')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Модуль 2: Умовні конструкції та Функції')).toBeVisible();

    // Close Modal
    await page.keyboard.press('Escape');
  });

  test('4. Student Portal Modular Skill Drawer & BKT Mastery Gating UI Flow', async ({ page }) => {
    await page.goto(`http://localhost:3002/practice/${courseSlug}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Check Header and student presence
    await expect(page.locator('header h1')).toContainText('Student');

    // Ensure page has hydrated by waiting for the active task to render
    await expect(page.getByText('Модуль 1: Змінні, Типи та Оператори').first()).toBeVisible({ timeout: 20000 });

    // Switch to Skill DAG / BKT tab on the rail
    const bktRailBtn = page.getByRole('button', { name: /Карта Навичок BKT/i });
    await expect(bktRailBtn).toBeVisible({ timeout: 15000 });
    await bktRailBtn.click();

    // Verify Drawer Section & BKT Gating Header
    await expect(page.getByText('Карта Навичок (Skill DAG)')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Модульний BKT-Гейтинг')).toBeVisible();
    await expect(page.getByText('Поріг: P(L) ≥ 0.85')).toBeVisible();

    // Verify Module 1 is active ("В процесі") and displayed
    await expect(page.getByRole('heading', { name: /Модуль 1: Змінні, Типи та Оператори/i })).toBeVisible({ timeout: 10000 });

    // Verify Module 2 is locked with BKT threshold gating reason
    await expect(page.getByRole('heading', { name: /Модуль 2: Умовні конструкції та Функції/i })).toBeVisible();
    await expect(page.getByText('Опануйте попередній модуль з P(L) ≥ 85%').first()).toBeVisible();
    await expect(page.getByText('Заблоковано').first()).toBeVisible();
  });
});
