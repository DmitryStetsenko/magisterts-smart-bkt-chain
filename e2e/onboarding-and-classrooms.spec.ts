import { test, expect } from '@playwright/test';

test.describe('User Onboarding, Google Auth & Classroom Management E2E Suite', () => {
  const testInviteCode = 'KOD-KN21';

  test('1. Auth & Classroom REST API Contract Verification', async ({ request }) => {
    // 1.1 Verify Auth System Configuration
    const configRes = await request.get('http://localhost:3000/api/v1/auth/config');
    expect(configRes.ok()).toBeTruthy();
    const configData = await configRes.json();
    expect(configData).toHaveProperty('testModeEnabled');
    expect(configData.testModeEnabled).toBe(true);

    // 1.2 Verify Mock Login
    const loginRes = await request.post('http://localhost:3000/api/v1/auth/mock-login', {
      data: { userIdOrEmail: 'demo-student' },
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginData = await loginRes.json();
    expect(loginData).toHaveProperty('token');
    expect(loginData).toHaveProperty('user');
    expect(loginData.user.role).toBe('STUDENT');

    const token = loginData.token;
    const studentId = loginData.user.id;

    // 1.3 Verify JWT Session via /auth/me
    const meRes = await request.get('http://localhost:3000/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(meRes.ok()).toBeTruthy();
    const meData = await meRes.json();
    expect(meData.user.id).toBe(studentId);

    // 1.4 Verify Google Auth Token Simulation
    const googleRes = await request.post('http://localhost:3000/api/v1/auth/google', {
      data: { credential: 'mock-google-token-e2etest' },
    });
    expect(googleRes.ok()).toBeTruthy();
    const googleData = await googleRes.json();
    expect(googleData.user.authProvider).toBe('GOOGLE');
    expect(googleData.user.email).toBe('e2etest@example.com');

    // 1.5 Verify Classroom Join Preview
    const joinPreviewRes = await request.get(`http://localhost:3000/api/v1/classrooms/join/${testInviteCode}`);
    expect(joinPreviewRes.ok()).toBeTruthy();
    const joinPreviewData = await joinPreviewRes.json();
    expect(joinPreviewData.success).toBe(true);
    expect(joinPreviewData.classroom.code).toBe(testInviteCode);
    expect(joinPreviewData.classroom.course).toBeDefined();

    // 1.6 Verify Joining Classroom
    const joinRes = await request.post(`http://localhost:3000/api/v1/classrooms/join/${testInviteCode}`, {
      data: { userId: googleData.user.id },
    });
    expect(joinRes.ok()).toBeTruthy();
    const joinData = await joinRes.json();
    expect(joinData.success).toBe(true);
    expect(joinData.enrollment).toBeDefined();
    expect(joinData.enrollment.mode).toBe('FULL_CYCLE');

    // 1.7 Verify Student Enrollments
    const enrollmentsRes = await request.get(`http://localhost:3000/api/v1/classrooms/student/${googleData.user.id}`);
    expect(enrollmentsRes.ok()).toBeTruthy();
    const enrollmentsData = await enrollmentsRes.json();
    expect(enrollmentsData.success).toBe(true);
    expect(Array.isArray(enrollmentsData.enrollments)).toBe(true);
    expect(enrollmentsData.enrollments.some((e: any) => e.classroom?.code === testInviteCode)).toBe(true);
  });

  test('2. Teacher Portal Classroom Management & Invite Codes UI Flow', async ({ page }) => {
    await page.goto('http://localhost:3003', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Teacher');
    await expect(page.getByText('Середня Майстерність P(L)')).toBeVisible({ timeout: 15000 });

    // Open Classrooms Tab on the rail
    const classroomsRailBtn = page.locator('nav button[title*="Навчальні Групи"]');
    await expect(classroomsRailBtn).toBeVisible({ timeout: 15000 });
    await classroomsRailBtn.click();

    // Verify Classroom Manager Header
    await expect(page.getByText('Навчальні Групи & Інвайт-коди')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('KOD-KN21')).toBeVisible();

    // Verify Create Classroom Modal
    const createClassBtn = page.getByRole('button', { name: /Створити групу/i });
    await expect(createClassBtn).toBeVisible();
    await createClassBtn.click();

    // Verify Modal fields
    await expect(page.getByText('Створити навчальну групу (Клас)')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Повний цикл (Теорія + BKT тренажер)')).toBeVisible();
    await expect(page.getByText('Чисте тестування (Діагностика без конспекту)')).toBeVisible();

    // Close Modal
    await page.keyboard.press('Escape');
  });

  test('3. Student Portal /join/:code Route & 1-Click Auth Flow', async ({ page }) => {
    // Open Student Join Route
    await page.goto(`http://localhost:3002/join/${testInviteCode}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Verify Classroom Card loaded
    await expect(page.getByText(`Інвайт-код: ${testInviteCode}`)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Група КН-21 (Інформатика)')).toBeVisible();
    await expect(page.getByText('JavaScript & Web Engineering')).toBeVisible();

    // Click 1-Click Mock Login
    const mockLoginBtn = page.getByRole('button', { name: /Вхід як Дмитро Стеценко/i });
    if (await mockLoginBtn.isVisible()) {
      await mockLoginBtn.click();

      // Verify Success State
      await expect(page.getByText('Ви успішно зараховані до групи!')).toBeVisible({ timeout: 15000 });

      // Click Go to Practice
      const goToPracticeBtn = page.getByRole('button', { name: /Перейти до Тренажера/i });
      await expect(goToPracticeBtn).toBeVisible();
      await goToPracticeBtn.click();
    } else {
      // If already logged in
      const confirmJoinBtn = page.getByRole('button', { name: /Підтвердити та приєднатися/i });
      if (await confirmJoinBtn.isVisible()) {
        await confirmJoinBtn.click();
        await expect(page.getByText('Ви успішно зараховані до групи!')).toBeVisible({ timeout: 15000 });
      }
    }

    // Verify student arrived at practice page
    await expect(page).toHaveURL(/practice\/js-dev/);
    await expect(page.locator('header h1')).toContainText('Student');
  });

  test('4. Admin Portal Users CMS & RBAC Management Flow', async ({ page }) => {
    await page.goto('http://localhost:3004', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Admin');

    // Click Users Tab
    const usersTabBtn = page.locator('nav button[title*="Керування Користувачами"]');
    await expect(usersTabBtn).toBeVisible({ timeout: 15000 });
    await usersTabBtn.click();

    // Verify User Management Center
    await expect(page.getByText('Центр Керування Користувачами')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Тестовий режим: УВІМКНЕНО')).toBeVisible();

    // Verify Users List renders
    await expect(page.getByText('student@example.com')).toBeVisible();
    await expect(page.getByText('teacher@example.com')).toBeVisible();
  });

  test('5. Admin Portal Audit Log & AI Datasets with User Filtering Flow', async ({ page }) => {
    await page.goto('http://localhost:3004', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Admin');

    // Click Datasets & Audit Tab
    const datasetsTabBtn = page.locator('nav button[title*="Експорт Датасетів для ШІ & Аудит-Логи"]');
    await expect(datasetsTabBtn).toBeVisible({ timeout: 15000 });
    await datasetsTabBtn.click();

    // Verify Dataset Export Center renders
    await expect(page.getByText('Центр Експорту Датасетів для ШІ & Незмінний Аудит-Лог')).toBeVisible({ timeout: 15000 });

    // Verify user display in audit table
    const tableUserBtn = page.locator('table button[title*="Натисніть для фільтрації подій користувача"]').first();
    await expect(tableUserBtn).toBeVisible({ timeout: 15000 });

    // Verify Drawer section "Фільтрація Подій" contains user filters
    await expect(page.getByRole('button', { name: /Всі користувачі/i })).toBeVisible();

    // Filter by clicking on the first user in the table
    await tableUserBtn.click();

    // Verify user active chip or filter indicator appears
    await expect(page.locator('text=Користувач:').first()).toBeVisible({ timeout: 10000 });

    // Clear filter via active chip
    const clearChipBtn = page.getByTitle('Скинути фільтр за користувачем');
    if (await clearChipBtn.isVisible()) {
      await clearChipBtn.click();
    }
  });
});
