import { test, expect } from '@playwright/test';

test.describe('Smart-BKT-Chain E2E Flow', () => {
  test('Full student journey: Solve task, collect telemetry, view analytics in admin, and reset state', async ({ page, context }) => {
    // 1. Студент відкриває Кабінет Студента (apps/web на порту 3002)
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Перевірка відображення заголовка та профілю студента
    await expect(page.locator('h1')).toContainText('Smart BKT Student Portal');
    await expect(page.getByText('Дмитро Стеценко')).toBeVisible();

    // 2. Студент взаємодіє з Monaco Editor (введення коду рішення)
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();

    // Симуляція події вставки або введення тексту
    await editor.click();
    
    // Перевірка активності WebSocket з'єднання телеметрії (WPM чи Pauses на плашці)
    const telemetryBar = page.getByText(/WPM|Паузи/i);
    await expect(telemetryBar).toBeVisible();

    // Відправляємо розв'язок задачі (кнопка "Перевірити рішення")
    const submitBtn = page.getByRole('button', { name: /Перевірити рішення/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Чекаємо вердикт перевірки у модальному вікні чи панелі результатів
    await expect(page.getByText(/Рішення вірне|Тест-кеси/i)).toBeVisible({ timeout: 10000 });

    // 3. Відкриваємо Кабінет Викладача у новій вкладці (apps/admin на порту 3001)
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:3001');
    await adminPage.waitForLoadState('networkidle');

    // Перевіряємо наявність студента в таблиці аналітики
    await expect(adminPage.getByText('Дмитро Стеценко')).toBeVisible();
    await expect(adminPage.getByText('student@example.com')).toBeVisible();

    // 4. Тестуємо функціонал анулювання результатів (кнопка "Анулювати")
    const resetButton = adminPage.getByRole('button', { name: /Анулювати/i }).first();
    await expect(resetButton).toBeVisible();
    
    // Натискаємо Анулювати
    await resetButton.click();

    // Перевіряємо, що стан оновився до "Нерозпочато" або 0.0%
    await expect(adminPage.getByText(/Нерозпочато|0\.0%/i)).toBeVisible({ timeout: 5000 });
  });
});
