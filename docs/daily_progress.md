# 📅 Журнал розробки та прогресу проєкту (Daily Progress Log)

Цей документ фіксує щоденний прогрес розробки, архітектурні рішення та планування наступних кроків для системи «Smart-BKT-Chain».

## 📅 09 жовтня 2026 року

### ✅ Що зроблено за день:
1. **Реалізація WebSocket-Синхронізації Скидання BKT-Прогресу у Реальному Часі:**
   - **Бізнес-контекст:** Викладачам та адміністраторам надано можливість точково або повністю скидати BKT-прогрес студента. За умови закритого або відкритого інтерфейсу студента стан мав синхронізуватися без перезавантаження сторінки.
   - **Бекенд WebSocket (`TelemetryGateway.ts` & `BktController.ts`):** 
     - Додано вхід клієнтів у персональні WebSocket кімнати (`user_${userId}` та `user_demo-student`).
     - Розроблено метод `notifyBktReset(userId, skillId)` для миттєвого відправлення події `bkt_state_reset` під час виклику ендпоінтів `POST /api/v1/bkt/reset-skill` та `POST /api/v1/bkt/reset`.
   - **Фронтенд Студента (`apps/student/src/app/page.tsx` & `useTelemetry.ts`):**
     - Налаштовано підписку на подію `bkt_state_reset`.
     - При отриманні сигналу кабінет студента автоматично оновлює граф навичок (`fetchCourseStructureAndState`) та без перезавантаження завантажує актуальну рекомендовану задачу (`fetchRecommendedTask`).
   - **Перевірка:** Проведено статичну збірку `build:api` та `build:student` — 100% успішно.
2. **Розробка та Інтеграція Автономного Віджета Інспекції Курсу (`CourseOverviewWidget`):**
   - **Бізнес-контекст:** Викладачам та методистам потрібен зручний інструмент для швидкого перегляду повної ієрархії курсів, модулів (DAG) та прив'язаних запитань і тест-кейсів без перехода в CMS.
   - **Фронтенд Component (`apps/teacher/src/features/course-map/ui/CourseOverviewWidget.tsx`):**
     - Створено модульний компонент `CourseOverviewWidget` з можливістю розгортання дерева модулів, відображення типів завдань (`CODE`, `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TEXT_ESSAY`), складності та підказками правильних відповідей.
     - Додано живе текстове пошукове поле для миттєвої фільтрації завдань за ключовими словами.
   - **Інтеграція у Кабінет Викладача (`apps/teacher/src/app/page.tsx`):** Вбудовано віджет під підсумковою BKT Heatmap таблицею студентів з прив'язкою до активного селектора курсу.
   - **Перевірка:** Виконано збірку `build:teacher` (100% pass).

---

## 📅 08 жовтня 2026 року

### ✅ Що зроблено за день:
1. **Діагностика та усунення збою запуску Кабінету Студента (`apps/student`):**
   - **Виявлення проблеми:** Запуск dev-сервера Next.js у `apps/student` падав з панікою Turbopack worker thread (`Every task must have a task type TaskGuard...`) через пошкоджений кеш `.next`.
   - **Рішення:** Очищено пошкоджену директорію `apps/student/.next`, налаштовано прапор `--webpack` у `apps/student/package.json` для стабільного запуску без збоїв Turbopack.
2. **Інтеграція кнопки «Наступне завдання» поряд з кнопкою відправки відповіді (`apps/student`):**
   - **Дизайн та UX:** Кнопку «Наступне завдання ➔» додано в один ряд безпосередньо поряд із кнопкою «Відправити Відповідь» у компонентах `QuizTaskEditor`, `EssayTaskEditor` та `MonacoCodeEditor`.
   - **Динамічний стан:** До розв'язання завдання кнопка залишається максимально непримітною, темною та неактивною (`disabled`, `opacity-50`). Після правильної відповіді (`evalResult.isPassed === true`) кнопка миттєво розблоковується та стає яскраво-зеленою акцентною кнопкою.
3. **Виправлення алгоритму Task Sequencing та суворого дотримання заблокованих модулів DAG:**
   - **Виявлення проблеми:** За наявності невиконаних завдань у заблокованих downstream модулях (наприклад Модуль 3), `TaskSequencer` раніше передчасно висував завдання із заблокованого модуля, навіть коли поточний активний модуль (Модуль 2) ще не досяг порогу засвоєння $P(L) \ge 0.95$.
   - **Рішення (`apps/api/src/domain/sequencing/task-sequencer.ts`):** Оновлено алгоритм вибору: `TaskSequencer` гарантовано тримає студента у поточному розблокованому модулі (`currentActiveSkill`) до моменту досягнення порогу $P(L_t) \ge 0.95$ (циклічно пропонуючи задачі модуля для закріплення), повністю блокуючи витік задач із downstream-модулів.
4. **Усунення зависання BKT-прогресу при повторному проходженні практичних завдань (`apps/api/src/adapters/inbound/http/bkt.controller.ts`):**
   - **Виявлення проблеми:** За наявності 1 завдання у модулі або повторному вирішенні задач модуля `bkt.controller.ts` раніше заморожував рівень $P(L_t)$ за прапором `isAlreadyPassedBefore`. Через це рівень засвоєння назавжди залишався на рівні $85.5\%$ (нижче $95\%$), а `TaskSequencer` не міг перевести студента у наступний модуль, зациклюючи видачу одного й того ж завдання.
5. **Механізм опрацювання вичерпаних завдань модуля та Попап Анулювання Прогресу:**
   - **Бізнес-логіка (`TaskSequencer.ts`):** Якщо всі завдання активного модуля вже виконані, але $P(L_t) < 0.95$, `TaskSequencer` повертає статус `MODULE_TASKS_EXHAUSTED` (`isExhausted: true`).
   - **REST API (`bkt.controller.ts`):** Розроблено ендпоінт `POST /api/v1/bkt/reset-skill` для точкового анулювання BKT-стану та логів конкретного модуля.
   - **Інтерфейс Студента (`apps/student/src/app/page.tsx`):** Реалізовано модальне вікно (Popup) з попередженням: *«Завдання даного модуля закінчилися, і ви не набрали необхідну кількість балів (>=95%). Ваш прогрес на цьому модулі буде анульований для повторної спроби.»* та кнопкою підтвердження **«ОК, анулювати прогрес модуля»**.
   - **Тестування:** Виконано збірку `build:student` та прогонка unit-тестів бекенду (100% pass).

---

## 📅 06 жовтня 2026 року

### ✅ Що зроведено за день:
1. **Перенесення Конструктора Графа Навичок (Skill DAG Editor) в Адмін-панель (`apps/admin`):**
   - Перенесено модуль `skill-editor` із `apps/teacher` у `apps/admin/src/features/skill-editor`.
   - Інтегровано інтерактивний [SkillDagEditor.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/features/skill-editor/ui/SkillDagEditor.tsx) у вкладку «Skill DAG Builder» системи `apps/admin`.
   - Очищено `apps/teacher`: тепер Кабінет Викладача повністю сфокусовано на аналітиці студентів, телеметрії, BKT Heatmap та скиданні результатів.
   - Оновлено навігацію та посилання між додаткам. Успішно пройшли статичні збірки `build:teacher` та `build:admin`.

2. **Розробка Мультидисциплінарної Архітектури та Мультиформатного Двигуна Перевірки:**
   - **Prisma Schema (`packages/database/prisma/schema.prisma`):** Створено модель `Course`, перерахування `TaskType` (`CODE`, `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TEXT_ESSAY`), зв'язки `courseId` у `SkillNode` & `Task`, додаткове JSON-поле `options`. Проведено міграцію та автогенерацію Prisma Client (`v6.19.3`).
   - **Мультидисциплінарне Сидування (`seed.ts`):** Сформовано 3 реалістичні навчальні курси (`js-dev` JavaScript, `english-b2` Business & Tech English, `ukraine-law` Правознавство України) з 11 вузлами графа знань та 12 різнотипними завданнями.
   - **Polyglot Evaluation Engine (`apps/api`):** Створено `CourseController` (`/api/v1/courses`), розширено `TaskController` з фільтрацією за `courseSlug`, інтегровано єдиний універсальний механізм оцінювання BKT у `BktController` (з підрахунком штрафів за імпульсивне вгадування $<2.0\text{с}$ $P(G_{\text{dyn}}) \to 0.85$, частковим балом для чекбокс-тестів та аналізом WPM/пауз для есе).
   - **Інтерфейси Студента та Викладача (`apps/student`, `apps/teacher`):** Реалізовано шапку перемикання курсів (**[ 💻 JavaScript ] [ 🇬🇧 English B2 ] [ ⚖️ Правознавство ]**), компоненти `QuizTaskEditor.tsx` та `EssayTaskEditor.tsx` для візуалізації опитувальників і текстових есе з відстеженням телеметрії, а також мультикурсну фільтрацію аналітики у Кабінеті Викладача.
   - **Playwright E2E Скрізна Верифікація (`playwright.config.ts`, `e2e/full-flow.spec.ts`):** Проведено скрізне тестування REST API та UI-потоків у Кабінеті Студента та Викладача (2 passed у 3.9с).

3. **Розробка Модуля Динамічного Управління Курсами (Dynamic Course CMS):**
   - **`apps/api` (`CourseController.ts`):** Додано ендпоінт `POST /api/v1/courses` для створення нових курсів з генерацією унікального `slug`, опису та іконки.
   - **`apps/teacher` (`page.tsx`):** Переведено завантаження курсів у Кабінеті Викладача з дефолтного масиву на динамічний виклик `GET /api/v1/courses`.
5. **Виправлення Синхронізації Активного Модуля та Резолвінгу Студента у BKT State:**
   - **Виявлення проблеми:** На UI показувався Модуль 1 як active/0.0% в графі, проте картка завдання завантажувала Модуль 2. Причина полягала в тому, що `GET /api/v1/bkt/state/demo-student` шукав literal-рядок `'demo-student'`, повертав порожній масив BKT стану, тому граф показував 0% для Модуля 1, тоді як `TaskSequencer` на бекенді вже отримував реальний BKT стан для `student.id` (де Модуль 1 було засвоєно) та пропонував завдання з Модуля 2.
   - **Рішення (`bkt.controller.ts`, `task.controller.ts`, `SkillDagMap.tsx`):**
     - Реалізовано універсальний резолвінг ID студента у `getStudentBktState`, `getRecommendedTask` та `resetStudentState` (якщо за запитом `'demo-student'` або переданим ID не знайдено запис, автоматично вибирається актуальний UUID користувача з роллю `STUDENT`).
     - Оновлено пріоритет стилів у [SkillDagMap.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/student/src/features/skill-graph/ui/SkillDagMap.tsx): прапор `isActive` має найвищий пріоритет та додає акцентну рамку `ring-2 ring-indigo-500/50`.

6. **Виправлення Повторного Видачі та Багаторазового Зарахування Одного й Того ж Завдання:**
   - **Виявлення проблеми:** За наявності 1 завдання у модулі (або розв'язанні всіх задач модуля) `TaskSequencer` повторно пропонував єдине доступне завдання, а `evaluateSubmission` під час кожного повторного здавання нарощував $P(L_t)$, дозволяючи штучно накрутити 100% засвоєння повторним кліком.
   - **Рішення (`task-sequencer.ts`, `bkt.controller.ts`):**
     - Впроваджено пошук незавершених задач серед усіх розблокованих модулів та курсу в цілому у `TaskSequencer`.
     - У `bkt.controller.ts` додано перевірку `previousAcceptedCount`: якщо завдання вже було успішно зараховане раніше (`ACCEPTED`), повторне виконання зберігає лог здачі, але не інфлює $P(L_t)$ додатково.



---

## 📅 05 жовтня 2026 року

### ✅ Що зроблено за день:
1. **Налаштування та конфігурація Playwright E2E тестування:**
   - Встановлено пакети `@playwright/test` та завантажено Chrome/Chromium Headless браузер.
   - Створено конфігураційний файл [playwright.config.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/playwright.config.ts) для налаштування базової URL-адреси (`http://localhost:3002`), таймаутів та звітів.
   - Створено файл наскрізного інтеграційного тесту [e2e/full-flow.spec.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/e2e/full-flow.spec.ts), що покриває повний сценарій взаємодії: Студент (`apps/web`) $\rightarrow$ Monaco Editor $\rightarrow$ WebSocket телеметрія $\rightarrow$ Викладач (`apps/admin`) $\rightarrow$ Анулювання BKT-стану.
   - Додано команду `"test:e2e": "playwright test"` у кореневий [package.json](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/package.json).
2. **Скрізна перевірка та успішний запуск E2E тестів у реальному Headless Chromium:**
   - Піднято локальні мікросервіси та PostgreSQL 16 через Docker Compose.
   - Проведено успішний прогін `npm run test:e2e`: повністю підтверджено працездатність наскрізного ланцюжка передачі телеметрії, оцінювання VM runner та швидкого анулювання BKT-результатів у кабінеті викладача (1 passed у 10.5с).
3. **Створення специфікації аналітичних показників та телеметрії:**
   - Створено деталізовану технічну специфікацію у файлі [docs/telemetry_analytics.md](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/telemetry_analytics.md), яка описує формули та роль BKT-параметрів ($P(L_0), P(T), P(S), P(G), P(L_t)$), клієнтської телеметрії (WPM, pauses, deletes, copy-paste ratio) та поведінкових профілів (Trust Coefficient, Fatigue Index).
   - Оновлено скрипт `scripts/compile_docs.py` для автоматичної компіляції специфікації у JSON-структури порталу документації.
4. **Розгортання Повноцінного Курсу з JavaScript (5 Модулів, 14 Завдань):**
   - Розширено структуру навчального курсу у [seed.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/packages/database/prisma/seed.ts) до 5 модулів із суворими DAG залежностями ($P(L_t) \ge 0.95$): `js-basics` $\rightarrow$ `js-functions` $\rightarrow$ `js-collections` $\rightarrow$ `js-async` $\rightarrow$ `js-oop`.
   - Наповнено базу 14 практичними задачами із відкритими та прихованими тест-кейсами.
   - Оновлено відображення графа навичок у Кабінеті Студента та Викладача.
   - Виконано збірку веб-додатків без жодної помилки.
5. **Архітектурний Рефакторинг Монорепозиторію за Ролями у Гілці `dev`:**
   - Створено окрему Git-гілку `dev`.
   - **`apps/student` (порт 3002):** Перейменовано `apps/web` на `apps/student` (Кабінет Студента з Monaco Editor).
   - **`apps/teacher` (порт 3003):** Виділено аналітику студентів та BKT Heatmap в окремий веб-застосунок `apps/teacher`.
   - **`apps/admin` (порт 3004):** Сформовано системну CMS панель для управління графом знань Skill DAG та курсами.
   - **`apps/landing` (порт 3001):** Створено публічний промо-сайт для візуальної презентації платформи.
   - Усі 4 веб-додатки успішно скомпільовано (`build:student`, `build:teacher`, `build:admin`, `build:landing`), а Playwright E2E тест пройшов на 100%.
6. **Інтеграція Асинхронних Черг BullMQ & Redis у `apps/api` (Мікро-Крок 3.1):**
   - Встановлено пакети `@nestjs/bullmq` та `bullmq` у бекенд NestJS.
   - Створено модуль [EvaluationQueueModule](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/outbound/queue/evaluation-queue.module.ts) з конфігурацією Redis `code-evaluation`.
   - Реалізовано фоновий процесор [EvaluationProcessor](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/outbound/queue/evaluation.processor.ts) для опрацювання черги оцінювання.
   - Написано юніт-тест [evaluation.processor.spec.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/outbound/queue/evaluation.processor.spec.ts) та успішно пройдено 100% тестів бекенду (11 passed).
7. **Оптимізація Телеметрії та Концепція Мультимодальної Нейромережі:**
   - Оновлено `useTelemetry.ts` для виправлення WebSocket з'єднання під час React StrictMode.
   - Розроблено концепції [telemetry_weighted_bkt.md](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/concepts/telemetry_weighted_bkt.md) та [neural_telemetry_ai.md](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/concepts/neural_telemetry_ai.md) для мультимодальної нейромережі (1D-CNN + BiLSTM, Speech, Reaction Latency, ViT).
   - Перекомпільовано JSON документацію через `python scripts/compile_docs.py`.

---

## 📅 04 жовтня 2026 року

### ✅ Що зроблено за день:
1. **Розширення можливостей VM ізольованого виконання та розв'язання асинхронних завдань (`apps/api`):**
   - Додано підтримку асинхронних функцій (`Promise`, `async/await`, `setTimeout`, `clearTimeout`) у контекс у Node.js VM для модуля `js-async`.
   - Налаштовано автоматичне очікування резолву промісів `await result` під час виконання тест-кейсів у [bkt.controller.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts).
   - Створено тестовий скрипт `scripts/test_async_eval.py` для перевірки асинхронного оцінювання рішення `fetchUser(id)`.
2. **Анулювання стану BKT та підтримка відображення нерозпочатого стану в `apps/web` та `apps/admin`:**
   - Модифіковано `POST /api/v1/bkt/reset/:studentId` у [bkt.controller.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts): видалено каскадні записи `BktState`, `Submission`, `BktHistory` та `TelemetrySession`.
   - Впроваджено підтримку нерозпочатого стану ($P(L_t) = 0.0\%$, статус `UNSTARTED`) у [SkillDagMap.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/skill-graph/ui/SkillDagMap.tsx) та [page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/page.tsx) для виправлення введеного в оману $50.0\%$ (Bayesian prior) при анулюванні результатів.
3. **Відображення інформації активного студента у Порталі Студента:**
   - Додано відображення профілю студента `👤 Дмитро Стеценко (student@example.com)` у шапку веб-кабінету у [page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/page.tsx).
4. **Виправлення відображення масивів у відкритих тест-кейсах:**
   - Оновлено структури даних тест-кейсів у [seed.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/packages/database/prisma/seed.ts) та парсер аргументів бекенду VM Runner у [bkt.controller.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts).
   - Тепер якщо функція `filterEvens(numbers)` приймає масив як 1 аргумент, у тест-кейсі показується саме масив `[1, 2, 3, 4, 5, 6]`, а для банальних змінних (наприклад `isEven(n)`) — скалярне значення `4`.
5. **Вимкнення автоматичного переходу на нове завдання після перевірки:**
   - Видалено виклик `fetchRecommendedTask()` після проходження тесту у [page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/page.tsx). Студент залишається на поточному завданні для перегляду результатів перевірки, деталізації тест-кейсів та оновленого балансу BKT, а перехід на нове завдання здійснюється лише за його бажанням (кнопка «Оновити рекомендоване»).
6. **Інтеграція реальної аналітики студентів в Кабінеті Викладача (`apps/admin`):**
   - Створено REST ендпоінт `GET /api/v1/bkt/analytics/students` у [bkt.controller.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts) для зведення реального BKT-прогресу $P(L_t)$ та телеметричних показників (WPM, Copy-Paste Ratio, Fatigue Index).
   - Підключено фетчинг аналітики у [page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/app/page.tsx) для синхронізації показників Heatmap та телеметрії з базою даних у режимі реального часу.
7. **Синхронізація імені студента у БД та виправлення моргання демо-даних:**
   - Оновлено `seed.ts` для автоматичного оновлення профілю `student@example.com` ім'ям `Дмитро Стеценко` у базі даних PostgreSQL.
   - Видалено початковий hardcoded масив студентів у `apps/admin/src/app/page.tsx`, усунено короткочасне миготіння 3 демо-студентів при завантаженні сторінки.
8. **Виправлення виявлення Copy-Paste в аналітиці викладача:**
   - Налаштовано миттєве випромінювання WebSocket-пакета `telemetry_data` при події `onDidPaste` у [useTelemetry.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/lib/useTelemetry.ts).
   - Оновлено зчитування поля `pasteEvents` у [bkt.controller.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts), завдяки чому при вставці коду `Copy-Paste Ratio` тепер виставляється у `100%`.
9. **Обнулення показників телеметрії після анулювання результатів:**
   - Оновлено дефолтні значення у [bkt.controller.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts): за відсутності логів аналітика видає `WPM = 0`, `Copy-Paste Ratio = 0%`, `Індекс втоми = 0%` та стан `Нерозпочато`.
   - Впроваджено миттєве оновлення аналітики у [page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/app/page.tsx) після натискання кнопки «Анулювати».
10. **Гарантоване перехоплення подій вставки коду у Monaco Editor:**
   - Інтегровано багаторівневе перехоплення вставок у [MonacoCodeEditor.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/ui/MonacoCodeEditor.tsx): через `onDidPaste`, прямий DOM-слухач `paste` на DOM-вузлі Monaco Editor та поріг `onDidChangeModelContent` (> 3 символів у зміні замість 10). Це гарантує фіксацію вставок через контекстне меню миші, Ctrl+V / Cmd+V та перетягування.
11. **100% Покриття Unit-Тестами розробленої аналітики та телеметрії:**
   - Створено специфікацію [bkt.controller.spec.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.spec.ts) для перевірки зведення `Copy-Paste Ratio = 1.0` при події вставки та обнулення телеметрії при анулюванні `getStudentsAnalytics()`.
   - Усі 9 юніт-тестів проєкту успішно пройдені (0 помилок).
12. **Стратегія впровадження Playwright E2E тестування у правила розробки:**
   - Модифіковано обов'язкові правила проєкту у [.agents/AGENTS.md](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/.agents/AGENTS.md) (Додано розділ 4: «Обов'язкова скрізна перевірка E2E»).
   - Сформовано план автоматизованого E2E тестування наскрізного ланцюжка: Monaco Editor (`apps/web`) $\rightarrow$ WebSockets $\rightarrow$ NestJS API $\rightarrow$ Admin Dashboard (`apps/admin`).

---

## 📅 03 жовтня 2026 року

### ✅ Що зроблено за день:
1. **Розпочато Крок 5 Master Plan (Фронтенд кабінету студента `apps/web`):**
   - **Мікро-Крок 5.1 (Ініціалізація та конфігурація Next.js):**
     - Розгорнуто каркас Next.js 16 у [apps/web](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web) (з `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`).
     - Інтегровано TailwindCSS v4 та підключено кастомну темну кольорову гаму у [globals.css](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/globals.css).
     - Створено початковий макет [RootLayout](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/layout.tsx) та головну сторінку кабінету [HomePage](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/page.tsx).
     - Додано команди `dev:web` (порт 3002) та `build:web` у кореневий [package.json](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/package.json), успішно виконано статичну збірку проекту.
   - **Мікро-Крок 5.2 (Monaco Editor & Поведінкова телеметрія):**
     - Розроблено інтерактивний компонент [MonacoCodeEditor.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/ui/MonacoCodeEditor.tsx) з підсвіткою синтаксису JS та плашкою показників телеметрії у реальному часі.
     - Написано кастомний хук [useTelemetry.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/lib/useTelemetry.ts) для вимірювання пауз (KeystrokePauseMs), темпу набору (WPM), підрахунку видалень та copy-paste подій.
     - Інтегровано `socket.io-client` для трансляції телеметрії по WebSockets (`ws://localhost:3000/telemetry`).
     - Налаштовано з'єднання з REST API (`GET /api/v1/tasks/recommended` та `POST /api/v1/bkt/evaluate`) у [StudentPortalPage](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/page.tsx).
   - **Усунено баг передачі аргументів у NestJS VM (`BktController`):**
     - Виправлено неоднозначність відображення подвійних дужок `Input: [[...]]` у тест-кейсах завдань.
     - Додано коректне визначення arity функції `fn.length` у `bkt.controller.ts` для прозорої підтримки одномірних та багатовимірних масивів.
     - Оновлено `packages/database/prisma/seed.ts` та проведено повторний сидинг БД (`npm run db:seed`).
   - **Інтегровано експериментальну можливість анулювання BKT результатів в `apps/admin`:**
     - Реалізовано REST ендпоінт `POST /api/v1/bkt/reset/:studentId` у `bkt.controller.ts` для скидання прогресу $P(L_0) = 0.5$ та очищення історії спроб/телеметрії.
     - Додано кнопку «Анулювати» у таблицю аналітики студентів `StudentAnalyticsTable.tsx`.

---

## 📅 02 жовтня 2026 року

### ✅ Що зроблено за день:
1. **Завершено Крок 2 Master Plan (Ініціалізація NestJS бекенду `apps/api`):**
   - **Каркас NestJS:** Налаштовано додаток NestJS v10 у [apps/api](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api) (з `tsconfig.json`, `nest-cli.json` та глобальним префіксом `/api/v1`).
   - **Гексагональна архітектура:** Створено структуру директорій та шар знань (`src/domain/bkt`), шари портів (`src/ports`) та адаптерів (`src/adapters`).
   - **Інтеграція Prisma ORM:** Реалізовано `PrismaService` та `DatabaseModule` у [src/adapters/outbound/persistence/prisma.service.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/outbound/persistence/prisma.service.ts), що імпортують Prisma Client з `@sbc/database`.
   - **Healthcheck REST ендпоінт:** Додано [HealthController](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/health.controller.ts) (`GET /api/v1/health`) для перевірки готовності сервера та активного з'єднання з PostgreSQL.
   - **Скрипти розробки:** У кореневий [package.json](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/package.json) додано команди `dev:api` та `build:api`. успішно виконано збірку проекту.
2. **Завершено Крок 3 Master Plan (BKT Core Engine & Task Sequencing):**
   - **Наповнення Міні-Курсом ([seed.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/packages/database/prisma/seed.ts)):** Розширено базу даних 3 модулями (`js-basics` -> `js-arrays` -> `js-async`) та 5 практичними завданнями із відкритими й прихованими тест-кейсами.
   - **BKT Math Engine ([bkt-engine.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/domain/bkt/bkt-engine.ts)):** Написано чисту бізнес-логіку обчислення $P(L_t | \text{obs})$ при правильній/неправильній відповіді та оновлення переходу $P(L_t)$ з обмеженням діапазону $[0.0001, 0.9999]$.
   - **Task Sequencing Engine ([task-sequencer.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/domain/sequencing/task-sequencer.ts)):** Реалізовано алгоритм адаптивного вибору наступного завдання на основі порогу $P(L_t) \ge 0.95$ та структури графа знань (DAG).
   - **100% Покриття Unit-Тестами ([bkt-engine.spec.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/domain/bkt/bkt-engine.spec.ts), [task-sequencer.spec.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/domain/sequencing/task-sequencer.spec.ts)):** Створено та успішно виконано 7 юніт-тестів для перевірки динаміки $P(L_t)$ та логіки переходу між модулями курсу.
3. **Завершено Крок 4 Master Plan (REST API, WebSockets та збір телеметрії):**
   - **REST API Контролери:** Реалізовано [TaskController](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/task.controller.ts) (`/api/v1/tasks/recommended`) та [BktController](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts) (`POST /api/v1/bkt/evaluate`).
   - **Ізольоване виконання коду:** Налаштовано оцінювання в Node.js VM context з порівнянням результатів тест-кейсів та оновленням $P(L_t)$ у БД.
   - **WebSocket Telemetry Gateway:** Створено [TelemetryGateway](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/websocket/telemetry.gateway.ts) (`ws://localhost:3000/telemetry`) для збору темпу (WPM), пауз та дельт коду в реальному часі.
   - **Створено детальний технічний журнал:** Створено документ [docs/detailed_implementation_log.md](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/detailed_implementation_log.md) для збереження розширених технічних специфікацій проєкту.

---

## 📅 01 жовтня 2026 року

### ✅ Що зроблено за день:
1. **Завершено Крок 1 Master Plan (Проєктування бази даних та локальне оточення):**
   - **Docker & локальне середовище:** Розгорнуто `docker-compose.yml` з інстансами **PostgreSQL 16** (`sbc-postgres`, порт 5432) та **Redis 7** (`sbc-redis`, порт 6379) з автоматичними healthcheck перевірками.
   - **Схема бази даних ([schema.prisma](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/packages/database/prisma/schema.prisma)):** Спроєктовано та реалізовано 14 моделей даних (`User`, `UserProfile`, `SkillNode`, `SkillDependency`, `Task`, `TestCase`, `BktState`, `BktHistory`, `TelemetrySession`, `TelemetryLog`, `BehavioralProfile`, `Submission`, `EvaluationResult`, `Credential`).
   - **Міграція та генерація типізованого клієнта:** Виконано початкову міграцію `20261001091705_init` та згенеровано тип-безпечний Prisma Client v6.
   - **Початкові дані (Seeding):** Створено скрипт `seed.ts` для автозаповнення тестовими користувачами, орієнтованим графом навичок (DAG), початковим BKT-станом та практичним завданням.
   - **Усунено конфлікти конфігурацій та IDE:** Виправлено помилки підключення до Prisma Studio, налаштовано типізацію у `packages/database/tsconfig.json` та додано команду `npm run db:studio`.

---

## 📅 17 червня 2026 року

### ✅ Що зроблено за день:
1. **Інтеграція алгоритму адаптивного вибору контенту (Task Sequencing / Recommendation):**
   - Додано теоретичний опис та архітектурну роль алгоритму автопланування індивідуального навчального треку на основі $P(L_t)$ до [tech_stack.source.md](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/tech_stack.source.md).
   - Відображено відповідні задачі у плані розробки епіку `SBC-EP-BKT` (Bayesian Knowledge Tracing Core Engine) у [project_management.md](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/project_management.md) та дорожній карті [roadmap.md](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/roadmap.md).
   - Скомпільовано оновлені Markdown-файли у структуровані JSON-файли документації за допомогою `npm run compile:docs`.
2. **Оновлення концептуального дизайну головної сторінки докс-сайту:**
   - Змінено порядок відображення блоків у [LandingPage.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/docs/src/views/landing/ui/LandingPage.tsx): блок «Концепція та Філософія Проєкту» піднято нагору, перед списком технічних можливостей.
   - Першу картку можливостей розширено до «Адаптивний BKT & Sequencing» для акценту на плануванні навчального треку.
   - Змінено та збалансовано розміри шрифтів заголовків та описів карток (зменшено сітку можливостей для компактності, збільшено текстові описи концепцій для читабельності).
3. **Коригування тональності та академічної точності описів:**
   - Опис «Багатофакторної адаптивності» переписано з акцентом на синергію BKT, телеметрії та перевірки рішень.
   - Опис «Гібридного оцінювання» переформульовано з категоріального на допоміжне («людина в циклі» / Human-in-the-Loop), зазначивши, що викладач залучається лише для вирішення спірних оцінок та фінального верифікаційного контролю.
4. **Головна сторінка репозиторію:**
   - Додано пункт «Адаптивне планування траєкторій (Task Sequencing / Recommendation)» до переліку ключових можливостей у [README.md](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/README.md).

### 📝 Стратегічний план дій (Master Plan):

1. **🧱 Крок 1: Проектування бази даних (Prisma Schema) та локальне оточення**
   - Розгортання Docker-контейнера з PostgreSQL.
   - Написання `schema.prisma` у пакеті `packages/database` з моделями: `User`/`Student` (профілі), `SkillNode` (вузли графа знань), `Task`/`Assessment` (практичні завдання), `BktState` (актуальний стан знань $P(L_t)$), `TelemetryLog` (збір сирих пауз та темпу) та `BehavioralProfile` (профілі поведінки).
   - Підготовка та перевірка початкових міграцій.

2. **⚙️ Крок 2: Ініціалізація NestJS бекенду (`apps/api`)**
   - Ініціалізація NestJS каркаса в `apps/api` за допомогою CLI.
   - Підключення Prisma ORM (`@smart-bkt/database`) як модуля.
   - Створення базової структури згідно з Гексагональною архітектурою (папки `domain`, `ports`, `adapters`).

3. **🧮 Крок 3: Реалізація BKT Core & Task Sequencing (Чисте ядро)**
   - Написання математичного сервісу BKT, який оновлює $P(L_t)$ на основі попереднього стану та результату відповіді.
   - Реалізація алгоритму **Task Sequencing** (вибір наступного завдання на основі порогу $P(L_t) \ge 0.95$).
   - Стовідсоткове покриття математичного ядра юніт-тестами (Jest) в ізоляції.

4. **📡 Крок 4: REST API, WebSockets та збір телеметрії**
   - Створення REST-ендпоінтів для отримання списку завдань та відправки відповідей.
   - Налаштування WebSocket-з'єднання (Socket.io) для трансляції телеметрії вводу в реальному часі.

5. **🎨 Крок 5: Фронтенд кабінету студента та Monaco Editor (`apps/web`)**
   - Ініціалізація Next.js додатка.
   - Інтеграція редактора коду Monaco з кастомним перехоплювачем подій (key-up, key-down, copy-paste) для збору телеметрії.
   - Візуалізація графа знань (ECharts або D3).

