import { test, expect } from '@playwright/test';

test.describe('Smart-BKT-Chain Multi-Discipline E2E Suite', () => {
  test('API Health & Course Structure REST Endpoints', async ({ request }) => {
    // 1. Verify NestJS API Health
    const healthRes = await request.get('http://localhost:3000/api/v1/health');
    expect(healthRes.ok()).toBeTruthy();

    // 2. Verify Multi-Course Endpoint
    const coursesRes = await request.get('http://localhost:3000/api/v1/courses');
    expect(coursesRes.ok()).toBeTruthy();
    const courses = await coursesRes.json();
    expect(courses.length).toBeGreaterThanOrEqual(3);

    const slugs = courses.map((c: any) => c.slug);
    expect(slugs).toContain('js-dev');
    expect(slugs).toContain('english-b2');
    expect(slugs).toContain('ukraine-law');
  });

  test('Student & Teacher Multi-Discipline UI Flow', async ({ page, context }) => {
    // 1. Open Student Portal
    await page.goto('http://127.0.0.1:3002', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Smart-BKT-Chain');
    await expect(page.locator('h1')).toContainText('v2.0 Shell');

    // 2. Verify Dynamic Course Switcher Dropdown
    await expect(page.locator('#student-course-select')).toBeVisible();
    await expect(page.locator('#student-course-select')).toHaveValue('js-dev');

    // 3. Open Teacher Portal
    const teacherPage = await context.newPage();
    await teacherPage.goto('http://localhost:3003', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(teacherPage.locator('h1')).toContainText('Smart-BKT-Chain');
    await expect(teacherPage.locator('h1')).toContainText('Teacher Portal');
    await expect(teacherPage.locator('#teacher-course-select')).toBeVisible();

    // 4. Verify Review Queue tab and inspector
    const reviewTabBtn = teacherPage.locator('#teacher-tab-reviews');
    await expect(reviewTabBtn).toBeVisible();
    await reviewTabBtn.click();
    await expect(teacherPage.locator('aside h2')).toContainText('Черга Перевірки', { timeout: 10000 });
  });
});
