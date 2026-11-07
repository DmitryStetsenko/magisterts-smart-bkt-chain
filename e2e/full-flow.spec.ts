import { test, expect } from '@playwright/test';

test.describe('Smart-BKT-Chain Multi-Discipline E2E Suite', () => {
  test('API Health, Course Structure & Shared DTO REST Endpoints', async ({ request }) => {
    // 1. Verify NestJS API Health
    const healthRes = await request.get('http://localhost:3000/api/v1/health');
    expect(healthRes.ok()).toBeTruthy();

    // 2. Verify Multi-Course Endpoint (CourseDto[])
    const coursesRes = await request.get('http://localhost:3000/api/v1/courses');
    expect(coursesRes.ok()).toBeTruthy();
    const courses = await coursesRes.json();
    expect(courses.length).toBeGreaterThanOrEqual(3);

    const slugs = courses.map((c: { slug: string }) => c.slug);
    expect(slugs).toContain('js-dev');
    expect(slugs).toContain('english-b2');
    expect(slugs).toContain('ukraine-law');

    // 3. Verify Recommended Task & Student Analytics DTO contracts
    const recRes = await request.get('http://localhost:3000/api/v1/tasks/recommended?courseSlug=js-dev');
    expect(recRes.ok()).toBeTruthy();
    const recData = await recRes.json();
    expect(recData).toHaveProperty('task');
    expect(recData).toHaveProperty('recommendation');

    const analyticsRes = await request.get('http://localhost:3000/api/v1/bkt/analytics/students?courseSlug=js-dev');
    expect(analyticsRes.ok()).toBeTruthy();
    const students = await analyticsRes.json();
    expect(Array.isArray(students)).toBeTruthy();
  });

  test('Student, Teacher, Admin & Study Portals UI Flow', async ({ page, context }) => {
    // 1. Open Student Portal (3002) — Minimalist Borderless AppShellLayout
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Smart-BKT-Chain');
    await expect(page.locator('h1')).toContainText('Student');

    // 2. Open Profile Drawer in Student Portal and verify course switcher
    const studentProfileBtn = page.locator('header button[title*="профіл"]');
    await expect(studentProfileBtn).toBeVisible();
    await studentProfileBtn.click();
    await expect(page.getByText('JavaScript & Web Dev').first()).toBeVisible();

    // 3. Open Teacher Portal (3003) and verify Review Queue tab
    const teacherPage = await context.newPage();
    await teacherPage.goto('http://localhost:3003', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(teacherPage.locator('h1')).toContainText('Smart-BKT-Chain');
    await expect(teacherPage.locator('h1')).toContainText('Teacher');

    const reviewTabBtn = teacherPage.locator('nav button[title*="Черга Перевірки"]');
    await expect(reviewTabBtn).toBeVisible();
    await reviewTabBtn.click();
    await expect(teacherPage.locator('aside h2')).toContainText('Черга Перевірки', { timeout: 10000 });

    // 4. Open Admin Portal (3004) and verify Skill DAG & Course CMS tabs
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:3004', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(adminPage.locator('h1')).toContainText('Smart-BKT-Chain');
    await expect(adminPage.locator('h1')).toContainText('Admin');
    const coursesTabBtn = adminPage.locator('nav button[title*="Керування Курсами"]');
    await expect(coursesTabBtn).toBeVisible();
    await coursesTabBtn.click();
    await expect(adminPage.getByText('Управління Навчальними Курсами')).toBeVisible();

    // 5. Open Study Portal (3006)
    const studyPage = await context.newPage();
    await studyPage.goto('http://localhost:3006', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(studyPage.locator('header h1')).toContainText('Smart-BKT-Chain');
    await expect(studyPage.locator('header h1')).toContainText('Study');
  });

  test('Just-in-Time Theory Drawer & Misconception Engine E2E Flow', async ({ page, request }) => {
    // 1. Reset demo student state for js-dev so sequence is deterministic
    const recRes = await request.get('http://localhost:3000/api/v1/tasks/recommended?courseSlug=js-dev&userId=demo-student');
    expect(recRes.ok()).toBeTruthy();
    const recData = await recRes.json();
    if (recData?.task?.skillId) {
      await request.post('http://localhost:3000/api/v1/bkt/reset-skill', {
        data: { userId: 'demo-student', skillId: recData.task.skillId },
      });
    }

    // 2. Open Student Portal on js-dev/js-basics
    await page.goto('http://localhost:3002/practice/js-dev/js-basics', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // 3. Verify that Just-in-Time Theory button is initially locked with progressive escalation tooltip
    const openTheoryBtn = page.getByTestId('open-jit-theory-btn');
    await expect(openTheoryBtn).toBeVisible({ timeout: 15000 });
    await expect(openTheoryBtn).toBeDisabled();
    await expect(page.getByTestId('jit-theory-locked-tooltip')).toBeAttached();

    // 4. Select a misconception distractor in QuizTaskEditor and submit (triggers failed attempt)
    const distractorOption = page.getByText('Значення успішно перепишеться на нове');
    await expect(distractorOption).toBeVisible({ timeout: 10000 });
    await distractorOption.click();

    const submitQuizBtn = page.getByRole('button', { name: /Відправити відповідь/i });
    await expect(submitQuizBtn).toBeEnabled();
    await submitQuizBtn.click();

    // 5. Verify personalized cognitive misconception alert & Just-in-Time Theory offer
    const misconceptionAlert = page.getByTestId('misconception-alert');
    await expect(misconceptionAlert).toBeVisible({ timeout: 10000 });
    await expect(misconceptionAlert).toContainText('Ототожнення const із змінною let');

    // 6. After failed attempt, verify that Theory button is now unlocked and functional
    await expect(openTheoryBtn).toBeEnabled();
    await openTheoryBtn.click();

    const theoryDrawer = page.getByTestId('jit-theory-drawer');
    await expect(theoryDrawer).toBeVisible();
    await expect(theoryDrawer).toContainText('Експрес-теорія');
    await expect(theoryDrawer).toContainText('Розбір вашої помилки');
    await page.getByTestId('close-jit-theory-btn').click();
    await expect(theoryDrawer).toBeHidden();

    // 7. Verify opening theory via reactive Just-in-Time offer banner
    const jitOfferBtn = page.getByTestId('jit-theory-offer-btn');
    await expect(jitOfferBtn).toBeVisible();
    await jitOfferBtn.click();

    await expect(theoryDrawer).toBeVisible();
    await expect(theoryDrawer).toContainText('Розбір вашої помилки');
    await page.getByTestId('close-jit-theory-btn').click();
    await expect(theoryDrawer).toBeHidden();
  });
});
