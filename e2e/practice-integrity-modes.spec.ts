import { test, expect } from '@playwright/test';

/**
 * E2E-тест режимів проходження (TRAINING vs GRADED), крос-портального блокування підручника
 * (Study Lock Overlay в apps/study) та Zero-Mix перемикання (SBC-439 / Brainstorm #22).
 */
test.describe('Practice Integrity Modes & Cross-App Study Lock', () => {
  test('switches between TRAINING and GRADED, locks open Study tab in GRADED, and unlocks on abandon', async ({
    context,
  }) => {
    const studentPage = await context.newPage();
    const studyPage = await context.newPage();

    // 0. Очищуємо активну сувору сесію та стан навички для demo-student
    await studentPage.request
      .post('http://localhost:3000/api/v1/bkt/active-session', {
        data: { userId: 'demo-student', mode: 'TRAINING', active: false },
      })
      .catch(() => {});

    // 1. Відкриваємо одночасно Підручник (3006) і Тренажер (3002)
    await studyPage.goto('http://localhost:3006/courses/web-algorithms-school', {
      waitUntil: 'domcontentloaded',
    });
    await studentPage.goto('http://localhost:3002/practice/web-algorithms-school', {
      waitUntil: 'domcontentloaded',
    });

    // Чекаємо появи перемикача режимів у тренажері
    const trainingBtn = studentPage.getByTestId('mode-btn-training');
    const gradedBtn = studentPage.getByTestId('mode-btn-graded');
    await expect(trainingBtn).toBeVisible({ timeout: 20000 });
    await expect(gradedBtn).toBeVisible({ timeout: 20000 });

    // Гарантуємо, що спочатку увімкнено Тренувальний режим
    await trainingBtn.click();
    const confirmModal = studentPage.getByTestId('switch-mode-confirm-modal');
    if (await confirmModal.isVisible({ timeout: 1500 }).catch(() => false)) {
      await studentPage.getByTestId('confirm-switch-mode-btn').click();
      await expect(confirmModal).toBeHidden({ timeout: 10000 });
    }

    // 2. У режимі TRAINING вкладка підручника НЕ заблокована
    await studyPage.bringToFront();
    await expect(studyPage.getByTestId('study-lock-overlay')).toBeHidden({ timeout: 8000 });

    // 3. Перемикаємося в Суворий режим «На оцінку» (GRADED) у тренажері
    await studentPage.bringToFront();
    await gradedBtn.click();
    if (await confirmModal.isVisible({ timeout: 1500 }).catch(() => false)) {
      await studentPage.getByTestId('confirm-switch-mode-btn').click();
      await expect(confirmModal).toBeHidden({ timeout: 10000 });
    }

    // Перевіряємо через API, що серверна строга сесія активна
    await expect
      .poll(
        async () => {
          const res = await studentPage.request.get(
            'http://localhost:3000/api/v1/bkt/active-session/demo-student',
          );
          if (!res.ok()) return false;
          const data = await res.json();
          return Boolean(data?.active && data?.mode === 'GRADED');
        },
        { timeout: 10000 },
      )
      .toBe(true);

    // 4. Переходимо на ВЖЕ ВІДКРИТУ вкладку підручника — має з'явитися Study Lock Overlay
    await studyPage.bringToFront();
    await studyPage.evaluate(() => window.dispatchEvent(new Event('focus')));
    const lockOverlay = studyPage.getByTestId('study-lock-overlay');
    await expect(lockOverlay).toBeVisible({ timeout: 10000 });

    // 4.5. Регресійна перевірка стрілок браузера (Назад/Вперед + bfcache):
    // Переходимо з підручника на іншу сторінку й повертаємося стрілкою «Назад» — блокування має зберегтися!
    await studyPage.goto('http://localhost:3003', { waitUntil: 'domcontentloaded' });
    await studyPage.goBack({ waitUntil: 'domcontentloaded' });
    await expect(studyPage.getByTestId('study-lock-overlay')).toBeVisible({ timeout: 10000 });

    // 5. Натискаємо «Перервати спробу і відкрити урок» прямо в оверлеї підручника
    await studyPage.getByTestId('study-lock-abandon-btn').click();
    await expect(lockOverlay).toBeHidden({ timeout: 10000 });

    // 6. Повертаємо тренажер у TRAINING для чистого стану після тесту
    await studentPage.request
      .post('http://localhost:3000/api/v1/bkt/active-session', {
        data: { userId: 'demo-student', mode: 'TRAINING', active: false },
      })
      .catch(() => {});

    await studentPage.close();
    await studyPage.close();
  });
});
