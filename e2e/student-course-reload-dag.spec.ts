import { test, expect } from '@playwright/test';

test.describe('Student Portal Course Reload & Non-Linear DAG Sync', () => {
  test('reloading with web-algorithms-school saved loads school course and non-linear DAG by default', async ({ page }) => {
    // 1. Встановлюємо збережений курс у localStorage до завантаження
    await page.addInitScript(() => {
      window.localStorage.setItem('sbc_student_active_course', 'web-algorithms-school');
    });

    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

    // 2. Перевіряємо, що заголовок показує шкільний курс, а НЕ JavaScript
    const header = page.locator('header');
    await expect(header).toContainText('Вебтехнології та алгоритмізація', { timeout: 15000 });
    await expect(header).not.toContainText('JavaScript');

    // 3. Відкриваємо Дерево знань
    await page.getByRole('button', { name: /Дерево знань/i }).first().click();

    // 4. Перевіряємо, що у студента немає зайвої галочки, а вузли 3 та 4 одразу стоять на одному шарі (розгалуження!)
    await expect(page.locator('label', { hasText: 'Метрики графа' })).toHaveCount(0);
    await expect(page.locator('label', { hasText: 'Граф DAG' })).toHaveCount(0);

    const loopsNode = page.locator('text=Циклічні алгоритми').first();
    const funcsNode = page.locator('text=Функції та модульна').first();
    await expect(loopsNode).toBeVisible();
    await expect(funcsNode).toBeVisible();

    const loopsBox = await loopsNode.boundingBox();
    const funcsBox = await funcsNode.boundingBox();
    expect(loopsBox).not.toBeNull();
    expect(funcsBox).not.toBeNull();

    // На одному рівні (Y майже однакові) та розведені горизонтально (X різні > 150px)
    expect(Math.abs(loopsBox!.y - funcsBox!.y)).toBeLessThan(20);
    expect(Math.abs(loopsBox!.x - funcsBox!.x)).toBeGreaterThan(150);

    // 5. Робимо повне перезавантаження (F5) і перевіряємо, що курс і Дерево Знань НЕ злетіли
    await page.reload({ waitUntil: 'networkidle' });
    await expect(header).toContainText('Вебтехнології та алгоритмізація', { timeout: 15000 });
    await page.getByRole('button', { name: /Дерево знань/i }).first().click();
    await expect(page.locator('text=Циклічні алгоритми').first()).toBeVisible();
    await expect(page.locator('text=Функції та модульна').first()).toBeVisible();
  });
});
