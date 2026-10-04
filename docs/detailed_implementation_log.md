# 📚 Детальний Технічний Журнал Реалізації (Detailed Technical Implementation Log)

Документ містить максимально деталізований опис усіх виконаних технічних робіт, розроблених модулів, математичних алгоритмів, схем даних та архітектурних рішень у проєкті **«Smart-BKT-Chain»**.

---

## 🏗️ 0. Загальна Архітектура Монорепозиторію

Проєкт побудовано за принципами монорепозиторію (npm workspaces):
- `apps/api` — NestJS бекенд (Гексагональна архітектура Ports & Adapters, Swagger OpenAPI, WebSockets, REST).
- `apps/docs` — Документаційний портал (Next.js 16, React 19, TailwindCSS 4).
- `apps/web` — Студентський кабінет з інтеграцією Monaco Editor (Next.js).
- `packages/database` — Ізольований пакет роботи з БД (Prisma ORM, PostgreSQL schema, міграції, сидинг).
### 0.1 Правила Проєкту та Регламент AI-Агента ([`.agents/AGENTS.md`](file:///.agents/AGENTS.md))
Регламент розробки проєкту Smart-BKT-Chain закріплено у файлі [`.agents/AGENTS.md`](file:///.agents/AGENTS.md). Він встановлює обов'язковий порядок дій:
1. **Обов'язковий трьохкомпонентний лог прогресу:** Після виконання кожного мікро-кроку оновлюються [`daily_progress.md`](file:///docs/daily_progress.md), [`detailed_implementation_log.md`](file:///docs/detailed_implementation_log.md) та виконується компіляція `python scripts/compile_docs.py`.
2. **Покрокова розробка (Micro-Steps):** Розбиття задач на малі ітерації із обов'язковим `npm run build:*` / `npm run test:*` та окремим `git commit`.
3. **Захист від припущень:** Перевірка повних трасувань помилок перед виправленням коду.

---

## 🧱 Крок 1: Проєктування бази даних (Prisma Schema) та локальне оточення

### 1.1 Docker & Локальні Сервіси
У файлі `docker-compose.yml` розгорнуто та сконфігуровано 2 контейнери:
- **`sbc-postgres`**: PostgreSQL 16 Alpine (порт `5432:5432`), база даних `smart_bkt_chain`.
- **`sbc-redis`**: Redis 7 Alpine (порт `6379:6379`), призначений для квешування телеметрії та сесій.
- Додано автоматичні перевірки стану (Healthchecks) з інтервалом 10с.

### 1.2 Схема даних Prisma (`packages/database/prisma/schema.prisma`)
Спроєктовано **14 моделей даних**:
1. `User` — Базова сутність користувача (Email, PasswordHash, Role: STUDENT/TEACHER/ADMIN).
2. `UserProfile` — Профіль (FirstName, LastName, Bio, Avatar).
3. `SkillNode` — Вузол графа знань (Title, Slug, Category, Difficulty).
4. `SkillDependency` — Ребра орієнтованого графа (ParentSkillId, ChildSkillId, RequiredMastery = 0.95).
5. `Task` — Практичне завдання (SkillId, Title, Description, StarterCode, Difficulty).
6. `TestCase` — Тест-кейси до задач (Input, ExpectedOutput, IsSecret).
7. `BktState` — Актуальний стан знань $P(L_t)$, $P(T)$, $P(S)$, $P(G)$ для пари (UserId, SkillId).
8. `BktHistory` — Хронологічний лог змін $P(L_t)$ після кожного виконання завдання.
9. `TelemetrySession` — Сесія збору телеметрії вводу коду (UserId, TaskId, StartedAt, EndedAt).
10. `TelemetryLog` — Сирі події телеметрії (KeystrokePauseMs, Wpm, DeleteCount, PasteEvents).
11. `BehavioralProfile` — Поведінковий профіль студента (FatigueIndex, CopyPasteRatio, AvgPauseTime).
12. `Submission` — Спроба вирішення завдання (UserId, TaskId, SourceCode, Status).
13. `EvaluationResult` — Результат перевірки коду (PassedTestsCount, TotalTestsCount, ExecutionTimeMs).
14. `Credential` — Специфікація Web3 NFT-сертифіката засвоєння навичок.

---

## ⚙️ Крок 2: Ініціалізація NestJS бекенду (`apps/api`) & Swagger UI

### 2.1 Налаштування модуля `@sbc/api`
- Ініціалізовано NestJS v10 у папці `apps/api`.
- Додано глобальний префікс всіх REST-запитів `/api/v1`.
- Налаштовано CORS для підтримки взаємодії з клієнтськими веб-додатками.

### 2.2 Гексагональна архітектура (Ports & Adapters)
Організовано структуру директорій:
- **`src/domain/`**: Чиста бізнес-логіка (BKT моделі, Task Sequencing).
- **`src/ports/`**: Інтерфейси вхідних use-cases та вихідних репозиторіїв.
- **`src/adapters/`**:
  - `adapters/outbound/persistence/`: `PrismaService` та `DatabaseModule` для з'єднання з PostgreSQL.
  - `adapters/inbound/http/`: REST контролери (`HealthController`).

### 2.3 Свагер Документація (OpenAPI 3.0)
- Інтегровано `@nestjs/swagger` та `swagger-ui-express`.
- Swagger UI доступний за адресою: **`http://localhost:3000/api/v1/docs`**.
- Створено анотації для `HealthController` (`GET /api/v1/health`), що повертає статус сервера та перевіряє стан БД через `SELECT 1`.

### 2.4 Усунення сумісності з Node.js v22
- Оновлено `packages/database/tsconfig.json` (`rootDir: "src"`) для коректної збірки в `dist/index.js`.
- Замінено синтаксис `declare global` у `packages/database/src/index.ts` на тип-безпечне приведення `globalThis as unknown as ...`.

---

## 🧮 Крок 3: BKT Core Engine, Task Sequencing & Наповнення Міні-Курсом

### 3.1 Контент Міні-Курсу («JavaScript: від синтаксису до асинхронності»)
У скрипті `packages/database/prisma/seed.ts` реалізовано автозаповнення БД:
- **Вузол 1 (`js-basics`):** «Основи JavaScript та Синтаксис»
  - Задача 1: `sum(a, b)` — Сума двох чисел (EASY)
  - Задача 2: `isEven(n)` — Перевірка парності (EASY)
- **Вузол 2 (`js-arrays`):** «Масиви та Методи обходу»
  - Задача 3: `filterEvens(numbers)` — Фільтрація парних елементів (MEDIUM)
  - Задача 4: `calcTotal(items)` — Сума об'єктів кошика (MEDIUM)
- **Вузол 3 (`js-async`):** «Асинхронне програмування»
  - Задача 5: `fetchUser(id)` — Асинхронний запит профілю (HARD)
- **Зв'язки DAG:** `js-basics` ($0.95$) $\rightarrow$ `js-arrays` ($0.95$) $\rightarrow$ `js-async`.

### 3.2 BKT Core Engine ([`apps/api/src/domain/bkt/bkt-engine.ts`](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/domain/bkt/bkt-engine.ts))
Математичний рушій обчислення $P(L_t)$ на основі Байєсівської адаптації:
- При правильній відповіді:
  $$P(L_t | \text{correct}) = \frac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)}$$
- При помилці:
  $$P(L_t | \text{incorrect}) = \frac{P(L_{t-1}) \cdot P(S)}{P(L_{t-1}) \cdot P(S) + (1 - P(L_{t-1})) \cdot (1 - P(G))}$$
- Оновлення переходу знань:
  $$P(L_t) = P(L_t | \text{obs}) + (1 - P(L_t | \text{obs})) \cdot P(T)$$
- Обмеження діапазону $[0.0001, 0.9999]$ для числової стабільності.

### 3.3 Task Sequencing Engine ([`apps/api/src/domain/sequencing/task-sequencer.ts`](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/domain/sequencing/task-sequencer.ts))
- Автоматичний аналіз графа знань (DAG).
- Якщо $P(L_t) < 0.95$ — підбір наступного незавершеного завдання з поточного вузла.
- Якщо $P(L_t) \ge 0.95$ — автоматичне розблокування та перехід до наступного зв'язаного вузла у графі.

### 3.4 Юніт-тести (Jest)
- Написано 7 комплексних тестів у `bkt-engine.spec.ts` та `task-sequencer.spec.ts`.
- **Результат:** 100% тестів пройдено успішно (`7 passed, 7 total`).

---

## 📡 Крок 4: REST API, WebSockets та Збір Телеметрії

### 4.1 REST Контролери та Ендпоінти (`apps/api/src/adapters/inbound/http/`)
1. **`TaskController` (`/api/v1/tasks`):**
   - `GET /api/v1/tasks` — Отримання списку всіх доступних практичних завдань згрупованих за вузлами графа навичок.
   - `GET /api/v1/tasks/recommended` — Запит адаптивного рекомендованого завдання для студента на основі стану $P(L_t)$ у BKT.
   - `GET /api/v1/tasks/:id` — Отримання детальної інформації про завдання (початковий код та відкриті тест-кейси).
2. **`BktController` (`/api/v1/bkt`):**
   - `POST /api/v1/bkt/evaluate` — Відправка студентського рішення на ізольоване виконання в Node.js VM context:
     - Безпечна перевірка рішень проти відкритих і прихованих тест-кейсів.
     - Автоматичний розрахунок нового $P(L_t)$ через `BktEngine`.
     - Збереження спроби `Submission` (статус `ACCEPTED` / `REJECTED`), результату `EvaluationResult` та хронології `BktHistory`.
   - `GET /api/v1/bkt/state/:userId` — Перегляд актуального стану $P(L_t)$ студента за всіма вузлами графа навичок.

### 4.2 WebSocket Gateway Телеметрії (`TelemetryGateway`)
- Шлях WebSocket: **`ws://localhost:3000/telemetry`** (Socket.io).
- Події в реальному часі:
  - `join_session` — Приєднання до кімнати телеметрії (`session_{userId}_{taskId}`) та автоматичне створення `TelemetrySession` у PostgreSQL.
  - `telemetry_data` — Збір показників динамики пауз (KeystrokePauseMs), швидкості набору (WPM), видалень (DeleteCount) та вставок (PasteEvents).
  - Автоматична фіксація сирих логів у таблиці `TelemetryLog`.

### 4.3 Інтеграційне Тестування (End-to-End Verification)
- Проведено успішну перевірку ланцюжка через PowerShell HTTP запити:
  - `GET /api/v1/tasks/recommended` $\rightarrow$ повернено рекомендовану задачу `sum(a, b)` ($P(L_t) = 0.5$).
  - `POST /api/v1/bkt/evaluate` $\rightarrow$ успішне виконання 3/3 тест-кейсів, оновлення $P(L_t) \rightarrow 0.8545$, фіксація `SubmissionStatus.ACCEPTED` в БД.

---

## 🎨 Крок 5: Фронтенд кабінету студента та Monaco Editor (`apps/web`)

### 5.1 Ініціалізація та конфігурація Next.js (Мікро-Крок 5.1)
- **Фреймворк:** Створено додаток Next.js 16 (з App Router) та React 19 у директорії [`apps/web`](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web).
- **Стилізація:** Інтегровано TailwindCSS v4 з кастомними CSS-змінними темного інтерфейсу (`#090d16` background, `#6366f1` primary indigo, `#10b981` emerald accent).
- **Структура:**
  - `src/app/globals.css` — імпорт Tailwind v4 та змінні теми.
  - `src/app/layout.tsx` — `RootLayout` з метаданими та системними шрифтами.
  - `src/app/page.tsx` — початкова головна сторінка студентського кабінету з картками Monaco Editor та BKT Graph.
- **Порт розробки:** Налаштовано запуск локального веб-сервера на порту `3002` (`npm run dev:web`). Успішно проведено статичну збірку `npm run build:web`.

### 5.2 Monaco Editor з перехопленням телеметрії (Мікро-Крок 5.2)
- **Компонент Monaco Editor ([MonacoCodeEditor.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/ui/MonacoCodeEditor.tsx)):**
  - Інтегровано повнофункціональний веб-редактор коду у темній темі (`vs-dark`).
  - Плашка live-телеметрії у верхній частині панелі: WPM, тривалість пауз (ms), кількість видалень (Deletes) та вставок з буфера (Pastes).
  - Кнопка автоматичної відправки коду на оцінювання («Перевірити код»).
- **Кастомний React-хук Телеметрії ([useTelemetry.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/lib/useTelemetry.ts)):**
  - Аналіз динаміки написання коду: вимірювання часу між натисканням клавіш (`lastKeyTime`), підрахунок загальних символів та алгоритмічне обчислення WPM:
    $$\text{WPM} = \frac{\text{Кількість символів} / 5}{\text{Минулий час у хвилинах}}$$
  - WebSocket клієнт `socket.io-client`: підключення до `ws://localhost:3000/telemetry`, відправка подій `join_session` та трансляція сирих пакетів `telemetry_data`.
- **Інтеграція REST API у Студентський Портал ([page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/page.tsx)):**
  - Автоматичне отримання адаптивного завдання з `GET /api/v1/tasks/recommended`.
  - Відправка коду на оцінювання `POST /api/v1/bkt/evaluate` та миттєве відображення результату перевірки (Passed/Failed, деталі тест-кейсів) і оновленої ймовірності засвоєння навички $P(L_t)$.

### 5.3 Візуалізація Графа Знань Skill DAG (Мікро-Крок 5.3)
- **Компонент Skill DAG Graph ([SkillDagMap.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/skill-graph/ui/SkillDagMap.tsx)):**
  - Наочне відображення зв'язків орієнтованого графа навчального курсу у форматі прогресивних карток (`js-basics` $\rightarrow$ `js-arrays` $\rightarrow$ `js-async`).
  - Статусна індикація вузлів:
    - 🟢 **Засвоєно (`MASTERED`):** $P(L_t) \ge 0.95$, плашка з іконкою перевірки та зелене світіння.
    - 🟡 **В процесі (`IN_PROGRESS`):** відкритий доступ для тренування.
    - 🔒 **Заблоковано (`LOCKED`):** очікує засвоєння попередників у графі.
  - Анімований progress-bar поточної ймовірності знань $P(L_t)$ під кожним вузлом.
### 5.4 Демонстрація виконання та верифікація рішень в реальному часі (Мікро-Крок 5.4)
- **Жива перевірка BKT-оцінювання:**
  - Надіслано рішення `function sum(a, b) { return a + b; }` для рекомендованого завдання `sum(a, b)` через REST API `POST /api/v1/bkt/evaluate`.
  - Всі 3 тест-кейси успішно пройдено (`status: "ACCEPTED"`, 3/3 passed).
  - Математичний рушій BKT перерахував ймовірність засвоєння навички `js-basics`:
    - **Prior $P(L_{t-1})$:** `0.6752`
    - **Posterior $P(L_t)$:** `0.9227`
  - Інтегровано передачу телеметричних параметрів: темп набору WPM = 52, натискання клавіш = 28.

---

## 🛡️ Крок 6: Панель викладача та адміністратора (`apps/admin`)

### 6.1 Ініціалізація та конфігурація Next.js Admin App (Мікро-Крок 6.1)
- **Фреймворк & Інструменти:** Розгорнуто додаток Next.js 16 (React 19, Turbopack) у директорії [`apps/admin`](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin).
- **Стилізація:** Інтегровано TailwindCSS v4 та налаштовано темну тему у [globals.css](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/app/globals.css).
- **Конфігурація:**
  - `package.json` — визначено пакет `@sbc/admin` з портами запуску `3003`.
  - `tsconfig.json` — підключено аліаси `@/*` та строгий режим TypeScript.
  - `next.config.ts` — вимкнено індикатори розробника та підключено транспіляцію.
- **Початкові сторінки:**
  - `src/app/layout.tsx` — `RootLayout` із метаданими панелі адміністратора Smart-BKT-Chain.
  - `src/app/page.tsx` — `AdminDashboardPage` з оглядовими картками стану графа знань та BKT показників студентів.
### 6.2 Інтерактивний Конструктор Графа Знань Skill DAG (Мікро-Крок 6.2)
- **Компонент SkillDagEditor ([SkillDagEditor.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/features/skill-editor/ui/SkillDagEditor.tsx)):**
  - **Візуальний полотно графа (DAG Canvas):** відображення списку всіх вузлів графа навичок із підсвічуванням вибраного елемента, їх рівня складності (EASY/MEDIUM/HARD) та батьківських зв'язків.
  - **Плашка BKT параметрів:** швидке інформування про початковий рівень $P(L_0)$, ймовірність вивчення $P(T)$, помилки $P(S)$ та вгадування $P(G)$.
  - **Інтерактивна форма редагування:** можливість тонкого налаштування параметрів кожного вузла з миттєвим оновленням стану та валідацією числових меж $[0, 1]$.
  - **Створення та видалення:** підтримка інтерактивного створення нових вузлів навичок та видалення застарілих елементів.
### 6.3 Аналітичний Дашборд Студентів & BKT Heatmap (Мікро-Крок 6.3)
- **Компонент StudentAnalyticsTable ([StudentAnalyticsTable.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/features/analytics/ui/StudentAnalyticsTable.tsx)):**
  - **Теплова карта засвоєння (BKT Heatmap):** відображення матриці рівнів засвоєння $P(L_t)$ за кожним вузлом навичок для кожного студента з динамічною колірною схемою (зелений $\ge 95\%$, жовтий $\ge 50\%$, червоний $< 50\%$).
  - **Поведінкова телеметрія (Behavioral Telemetry):** візуалізація темпу написання коду (WPM), коефіцієнта копіювання коду (Copy-Paste Ratio) та обчисленого індексу втоми (Fatigue Index) з іконками сповіщення про можливе аномальне списування чи виснаження.
  - **Типізація ([analytics.types.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/features/analytics/model/analytics.types.ts)):** інтерфейс `StudentAnalyticsItem` для зведення аналітики BKT та телеметрії.
- **Збірка:** Протестовано збірку через `npm run build:admin` (0 помилок).

### 6.4 Експериментальний Функціонал Анулювання Прогресу Студентів (Мікро-Крок 6.4)
- **REST API Ендпоінт Reset (`POST /api/v1/bkt/reset/:studentId`):**
  - Видалення всіх активних записів `BktState`, спроб розв'язання `Submission`, логів `BktHistory` та сесій телеметрії `TelemetrySession` у [bkt.controller.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts).
  - Повне каскадне скидання дозволяє повернути студента до початкового стану без збереження застарілих апріорних ймовірностей.
- **Відображення Нерозпочатого Стан ("UNSTARTED"):**
  - Оновлено адаптацію порожніх відповідей `getStudentState` у [SkillDagMap.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/skill-graph/ui/SkillDagMap.tsx) та [page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/page.tsx).
  - При відсутності запису $P(L_t)$ у БД відображається точний показник `0.0%` зі статусом `UNSTARTED` (замість введеного в оману 50.0%), що забезпечує прозорість після анулювання.
- **Автоматична Повторна Запит-Секвенсація після Успіху:**
  - Оновлено [page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/page.tsx): після відправки та успішної перевірки рішення (`status === 'ACCEPTED'`) фронтенд автоматично робить виклик `fetchRecommendedTask()`.
  - Завдяки цьому студент відразу переходить до наступного нерозв'язаного завдання або до наступного модуля графа знань без потреби натискання кнопки «Оновити рекомендоване».

### 6.5 Жива Інтеграція Аналітики Студентів & BKT Heatmap (Мікро-Крок 6.5)
- **REST API Ендпоінт `GET /api/v1/bkt/analytics/students`:**
  - Розроблено метод `getStudentsAnalytics` у [bkt.controller.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts).
  - Здійснюється агрегація реальних BKT-станів $P(L_t)$ з БД для кожного студента за кожною навичкою, а також обчислення живих показників телеметрії (середній WPM, Copy-Paste Ratio, Fatigue Index).
- **Підключення Кабінету Викладача (`apps/admin`):**
  - Оновлено головну сторінку [page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/app/page.tsx): додано автоматичний фетчинг аналітики з бекенду при завантаженні та синхронізацію даних Heatmap.
  - Видалено початковий mock-масив студентів зі стану React `useState`, що повністю усунуло миготіння 3 демо-студентів при перезавантаженні сторінки.
  - Синхронізовано `seed.ts` для підтягування імені `Дмитро Стеценко` для тестового облікового запису `student@example.com` у БД PostgreSQL.
- **Точне Виявлення Копіювання (Copy-Paste Ratio):**
  - Додано миттєву трансляцію пакета `telemetry_data` при події `onDidPaste` у [useTelemetry.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/lib/useTelemetry.ts).
  - Налаштовано коректне читання поля `pasteEvents` у [bkt.controller.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts), що гарантує показник `Copy-Paste Ratio = 100%` при суцільній вставці рішень.






