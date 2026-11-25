import { test, expect } from '@playwright/test';

/**
 * Регресійний E2E тест синхронності BKT-гейтингу в apps/study (3006)
 *
 * Гарантує відсутність захардкоджених відсотків (на кшталт 92%) та
 * виключає ситуацію, коли пізніші модулі відкриті після заблокованих.
 */
test.describe('Study Portal BKT Gating & Zero-State Consistency', () => {
  test('fresh student sees 0% on Module 1 and no unlocked modules after a locked module', async ({ page }) => {
    // 1. Гарантуємо чистий стан для demo-student (скидаємо BKT-стан, якщо API доступний)
    await page.request.post('http://localhost:3000/api/v1/bkt/reset-skill', {
      data: { userId: 'demo-student', resetAll: true },
    }).catch(() => {});

    // 2. Відкриваємо шкільний курс у apps/study
    await page.goto('http://localhost:3006/courses/web-algorithms-school', {
      waitUntil: 'networkidle',
    });

    // Чекаємо завантаження списку тематичних модулів
    const modulesSection = page.locator('text=Тематичні модулі');
    await expect(modulesSection).toBeVisible({ timeout: 15000 });

    // 3. Збираємо всі кнопки модулів саме в бічній панелі (aside), виключаючи хлібні крихти
    const moduleButtons = page.locator('aside button', { hasText: /Модуль \d+/ }).filter({
      hasText: /%|Заблоковано/,
    });
    const count = await moduleButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // 4. Перевіряємо інваріант: жодних фейкових 92% для нульового студента
    const firstModuleText = await moduleButtons.nth(0).innerText();
    expect(firstModuleText).not.toContain('92%');
    expect(firstModuleText).toContain('0%');

    // 5. Інваріант монотонності гейтингу: після першого заблокованого модуля
    //    не може бути жодного відкритого модуля
    let seenLocked = false;
    for (let i = 0; i < count; i++) {
      const text = await moduleButtons.nth(i).innerText();
      const isLocked = text.includes('Заблоковано');
      if (isLocked) {
        seenLocked = true;
      } else if (seenLocked) {
        throw new Error(
          `Порушення інваріанту BKT-гейтингу: модуль #${i + 1} ("${text.replace(/\s+/g, ' ').trim()}") відкритий після заблокованого модуля!`
        );
      }
    }
    expect(seenLocked).toBe(true);
  });
});
