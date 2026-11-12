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

  test('2. Admin Portal Course CMS, Studio & Breadcrumb Navigation UI Flow', async ({ page }) => {
    await page.goto('http://localhost:3004', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Admin');

    // 2.1 Default primary view is Course CMS
    await expect(page.getByText('Управління Навчальними Курсами')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'JavaScript & Web Engineering' })).toBeVisible();
    await expect(page.getByText('BKT P(L): 0.85').first()).toBeVisible();

    // Verify initial Breadcrumb: CMS Адміністрування / Курси
    await expect(page.getByRole('button', { name: 'CMS Адміністрування' })).toBeVisible();
    await expect(page.locator('nav[aria-label="Breadcrumb"]').getByText(/Курси/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Курси платформи/i })).toBeVisible();

    // 2.2 Full-page Course Creation View with Breadcrumb drill-down
    const createCourseBtn = page.getByRole('button', { name: 'Створити Новий Курс' });
    await expect(createCourseBtn).toBeVisible();
    await createCourseBtn.click();

    // Verify Breadcrumbs updated to: CMS Адміністрування / Курси / Створення нового курсу
    const breadcrumbCoursesBtn = page.locator('nav[aria-label="Breadcrumb"] button:has-text("Курси")');
    await expect(breadcrumbCoursesBtn).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Створення нового курсу')).toBeVisible();

    // Verify Full-Page CourseCreateView elements (no modal popup)
    await expect(page.getByRole('heading', { name: 'Створення Нового Навчального Курсу' })).toBeVisible();
    await expect(page.getByPlaceholder(/наприклад, Основи кібербезпеки/i)).toBeVisible();
    await expect(page.getByText('Опублікувати курс у каталозі')).toBeVisible();

    // Click "Курси" in Breadcrumbs to return back to Course List
    await breadcrumbCoursesBtn.click();
    await expect(page.getByText('Управління Навчальними Курсами')).toBeVisible({ timeout: 10000 });

    // Verify dedicated navigation rail icon for Course Creation
    const createCourseRailBtn = page.locator('nav button[title*="Створення нового курсу"]');
    await expect(createCourseRailBtn).toBeVisible();
    await createCourseRailBtn.click();
    await expect(page.getByRole('heading', { name: 'Створення Нового Навчального Курсу' })).toBeVisible();

    // Verify dedicated navigation rail icon for Course Catalog
    const catalogRailBtn = page.locator('nav button[title*="Каталог курсів"]');
    await expect(catalogRailBtn).toBeVisible();
    await catalogRailBtn.click();
    await expect(page.getByText('Управління Навчальними Курсами')).toBeVisible({ timeout: 10000 });

    // 2.3 Verify Category Filter in sidebar
    await expect(page.getByRole('button', { name: /Предметні категорії/i })).toBeVisible();
    const progCategorySidebarBtn = page.locator('aside button:has-text("Програмування & IT")').first();
    await expect(progCategorySidebarBtn).toBeVisible();
    await progCategorySidebarBtn.click();

    // Verify active filter chip appears
    await expect(page.getByText('Галузь:').first()).toBeVisible();

    // Reset filter
    const resetFilterBtn = page.getByTitle('Скинути фільтр галузі');
    await expect(resetFilterBtn).toBeVisible();
    await resetFilterBtn.click();
    await expect(page.getByTitle('Скинути фільтр галузі')).not.toBeVisible();

    // 2.4 Full-page Course Studio View with Breadcrumbs & Modules
    const moduleStudioBtn = page.locator('button:has-text("Модулі (5)")').first();
    await expect(moduleStudioBtn).toBeVisible();
    await moduleStudioBtn.click();

    // Verify Breadcrumbs updated to: CMS Адміністрування / Курси / JavaScript & Web Engineering
    const studioBreadcrumbCoursesBtn = page.locator('nav[aria-label="Breadcrumb"] button:has-text("Курси")');
    await expect(studioBreadcrumbCoursesBtn).toBeVisible({ timeout: 5000 });
    await expect(page.locator('nav[aria-label="Breadcrumb"]').getByText(/JavaScript & Web Engineering/i)).toBeVisible();

    // Verify Full-Page CourseStudioView elements
    await expect(page.getByText('Тематичні Розділи & Компетенції BKT')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Модуль 1: Змінні, Типи та Оператори/i).first()).toBeVisible();
    await expect(page.getByText(/Модуль 2: Умовні конструкції та Функції/i).first()).toBeVisible();

    // Verify Sidebar Drawer clean navigation (course readiness audit, module test sandbox, courses switcher)
    await expect(page.getByRole('button', { name: /До каталогу курсів/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Курси платформи/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Готовність курсу/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Тестування модуля/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Дії та інструменти/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Живий перегляд/i })).toBeVisible();

    // Click "Курси" in Breadcrumb to return to Course List
    await studioBreadcrumbCoursesBtn.click();
    await expect(page.getByText('Управління Навчальними Курсами')).toBeVisible({ timeout: 10000 });
  });

  test('3. Teacher Portal Modular Course Selection & Allowed Modules UI Flow', async ({ page }) => {
    await page.goto('http://localhost:3003', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Teacher');
    await expect(page.getByText('Середня Майстерність P(L)')).toBeVisible({ timeout: 15000 });

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

    // Ensure page has hydrated by waiting for the active task and skill node to render
    await expect(page.getByText('Синтаксис, змінні let/const та базові типи').first()).toBeVisible({ timeout: 20000 });

    // Switch to Skill DAG / BKT tab on the rail
    const bktRailBtn = page.getByRole('button', { name: /Карта Навичок BKT/i });
    await expect(bktRailBtn).toBeVisible({ timeout: 15000 });
    await bktRailBtn.click();

    // Verify Drawer Section & BKT Gating Header
    await expect(page.getByText('Карта Навичок (Skill DAG)')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Модульний BKT-Гейтинг')).toBeVisible();
    await expect(page.getByText('Поріг: P(L) ≥ 0.85')).toBeVisible();

    // Verify Module 1 is active ("В процесі") and displayed with clean competency title
    await expect(page.getByText('Модуль 1').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Синтаксис, змінні let\/const та базові типи/i })).toBeVisible();

    // Verify Module 2 is locked with BKT threshold gating reason
    await expect(page.getByText('Модуль 2').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Функції, область видимості та замикання/i })).toBeVisible();
    await expect(page.getByText('Опануйте попередній модуль з P(L) ≥ 85%').first()).toBeVisible();
    await expect(page.getByText('Заблоковано').first()).toBeVisible();
  });
});
