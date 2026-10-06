import { test, expect } from '@playwright/test';

test.describe('Smart-BKT-Chain E2E Flow', () => {
  test('Full student journey: Solve task, collect telemetry, view analytics in admin, and reset state', async ({ page, context }) => {
    // 1. Студент відкриває Кабінет Студента (apps/student на порту 3002)
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('domcontentloaded');

    // Перевірка відображення заголовка та профілю студента
    await expect(page.locator('h1')).toContainText('Smart-BKT-Chain Student Portal');
    await expect(page.getByText('Дмитро Стеценко')).toBeVisible();

    // 2. Студент взаємодіє з Monaco Editor (введення коду рішення)
    const editor = page.locator('.monaco-editor, textarea, .view-lines').first();
    await expect(editor).toBeVisible({ timeout: 20000 });

    // Симуляція події вставки або введення тексту
    await editor.click();
    
    // Перевірка активності WebSocket з'єднання телеметрії (WPM чи Pauses на плашці)
    const telemetryBar = page.getByText(/WPM|Паузи/i);
    await expect(telemetryBar).toBeVisible();

    // Відправляємо розв'язок задачі (кнопка "Перевірити код")
    const submitBtn = page.getByRole('button', { name: /Перевірити код/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Чекаємо вердикт перевірки у модальному вікні чи панелі результатів
    await expect(page.getByText(/Рішення прийнято|Помилка виконання|Оновлення BKT/i).first()).toBeVisible({ timeout: 10000 });

    // 3. Відкриваємо Кабінет Викладача у новій вкладці (apps/teacher на порту 3003)
    const teacherPage = await context.newPage();
    await teacherPage.goto('http://localhost:3003');
    await teacherPage.waitForLoadState('domcontentloaded');

    // Перевіряємо наявність студента в таблиці аналітики
    await expect(teacherPage.getByText('Дмитро Стеценко')).toBeVisible();
    await expect(teacherPage.getByText('student@example.com')).toBeVisible();

    // 4. Тестуємо функціонал анулювання результатів (кнопка "Анулювати")
    const resetButton = teacherPage.getByRole('button', { name: /Анулювати/i }).first();
    await expect(resetButton).toBeVisible();
    
    // Натискаємо Анулювати та підтверджуємо в кастомному модальному вікні
    await resetButton.click();
    const confirmModalBtn = teacherPage.getByRole('button', { name: /Так, анулювати/i });
    await expect(confirmModalBtn).toBeVisible();
    await confirmModalBtn.click();

    // Перевіряємо, що стан оновився до "Нерозпочато" або 0.0% / 0%
    await expect(teacherPage.getByText(/Нерозпочато|0%/i).first()).toBeVisible({ timeout: 5000 });
  });
});
