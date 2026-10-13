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
3. **Захист від припущення:** Перевірка повних трасувань помилок перед виправленням коду.

### 0.2 Модуль Візуальної Інспекції Графу Курсу (`CourseOverviewWidget`)
- **Концепція:** Перевикористовуваний автономний віджет `CourseOverviewWidget` (`apps/teacher/src/features/course-map/ui/CourseOverviewWidget.tsx`), призначений для повного огляду ієрархії курсів, модулів (DAG) та прив'язаних запитань/завдань.
- **Особливості:**
  - Візуалізація DAG-вузлів із розгортанням списку питань.
  - Відображення типів завдань (`CODE`, `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TEXT_ESSAY`), складності та правильних відповідей для викладацького аудиту.
  - Швидкий пошук та фільтрація завдань у реальному часі.

### 0.6 Глобальний Стандарт Уніфікованого Стану Навігації (`activeTab` + `isDrawerOpen`)
- **Проблематика:** Раніше у кабінетах стан навігації спирався на тимчасовий `activeDrawer = null`, через що при згортанні сайдбара або закритті хрестиком `✕` втрачався фокус обраної вкладки та скидався до першого елемента списку.
- **Архітектурний стандарт для всіх порталів (`apps/student`, `apps/teacher`, `apps/admin`):**
  ```typescript
  // Приклад реалізації (Student, Teacher, Admin):
  type PortalTab = 'analytics' | 'coursemap' | 'settings'; // або 'task' | 'bkt' | 'tree'
  const [activeTab, setActiveTab] = useState<PortalTab>('analytics');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const handleTabClick = (tab: PortalTab) => {
    if (activeTab === tab) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };
  ```
- **Уніфіковані стани інтерфейсу:**
  1. `activeTab === tab && isDrawerOpen`: Повне активне підсвічування кнопки + розгорнута бічна панель відповідного розділу (`w-[380px]`).
  2. `activeTab === tab && !isDrawerOpen`: Тоноване підсвічування кнопки з міні-індикатором `h-2`, сайдбар прихований, центральний холст автоматично розтягнуто на 100% ширини (`flex-1`).
  3. Повторний клік по активній кнопці або `✕` в сайдбарі: `setIsDrawerOpen(prev => !prev)` без зміни `activeTab`.
  4. Клік по іншій іконці: перемикає `activeTab` та гарантовано встановлює `isDrawerOpen(true)`.

### 0.7 База Архітектурних Дискусій та Мозкових Штурмів (`docs/brainstorm/`)
- **Концепція:** Централізоване сховище для накопичення теоретичних, алгоритмічних та бізнес-ідей проекту.
- **Сесія 01 (`docs/brainstorm/01_evaluating_mastery_across_task_types.md`):**
  - **Динамічний BKT ($P(G) / P(S)$):** Введення залежності $P(G)$ від часу здачі завдання $T_{\text{submit}}$: якщо $T < 3.0\text{ с}$, ймовірність вгадування $P(G)$ зростає до $0.85$, мінімізуючи ріст знання від випадкового вибору в тестах.
  - **Когнітивна достовірність ($\alpha$-Score):** Мультиплікатор достовірності $\alpha = (1 - CopyPasteRatio) \cdot \text{Penalty}(WPM)$ як коригувальний коефіцієнт BKT.
  - **Мульти-критеріальна триангуляція статусу `MASTERED`:** Опанування теми вимагає зв'язки «Теоретичний тест + Практичний код + Автентична телеметрія».

### 0.3 Модульний Opera-Style UI Shell, Компактні DAG-Вузли та Патерн «List-in-Drawer / Detail-on-Canvas»
- **Уніфікація UI Shell (`apps/student`, `apps/teacher`, `apps/admin`):**
  - Верхня фіксована навігаційна панель (`h-14 bg-slate-900 border-b border-slate-800`).
  - Вузький вертикальний рейл іконок (`w-14 bg-slate-900`) з блоком `Settings` у найнижчій позиції.
  - Висувні бічні панелі (Drawers) з **фіксованою нерухомою шапкою** (`shrink-0 bg-slate-900/90 backdrop-blur-md`) та скрольованим контентним блоком (`flex-1 overflow-y-auto`).
- **Компактний `SkillDagMap` (`apps/student/src/features/skill-graph/ui/SkillDagMap.tsx`):**
  - Об'єднання заголовка модуля та відсотка $P(L)$ в один рядок для зменшення висоти плашок.
  - Накладання круглих стрілок-з'єднувачів `ArrowDown` з від'ємними маржинами (`-my-2.5 z-20`) над картками модулів.
  - Усунення дубльованих заголовків у внутрішньому суб-барі віджета.
- **Кабінет Викладача (`apps/teacher/src/app/page.tsx`):**
  - **Бокове висувне меню:** Виводить список студентів курсу (з живим текстовим пошуком за ім'ям/email) та структуроване дерево модулів DAG.
  - **Центральний екран (Main Canvas):** При виборі студента показує детальну аналітичну картку (WPM, Copy-Paste, Fatigue Index), BKT Heatmap по модулях та кнопку скидання. При виборі модуля/завдання показує повний інспектор умови завдання, тест-кейсів та ключів відповідей.

### 0.4 Концепт та Архітектура Модульної Телеметрії (Per-Module Telemetry & Course-Level Median)
- **Проблематика:** При загальному підрахунку телеметрії (WPM, Copy-Paste Ratio, Fatigue Index) по всьому курсу списування чи когнітивне перевантаження на окремому модулі "змащується" середніми значеннями.
- **Концепція та Практична Реалізація Модульної Телеметрії:**
  1. **Модульний рівень ($WPM_{skill}, CopyPaste_{skill}, Fatigue_{skill}$):** Кожен вузол графа $Skill_i$ зберігає власні параметри телеметрії. Якщо студент вставив 90% коду під час проходження складного Модуля 3, цей показник зберігається суворо у контексті Модуля 3.
  2. **Курсовий рівень (Медіана + Peak Anomaly):** На верхніх картках загальної аналітики студента розраховується **Медіана ($\text{Median}$)** для виключення спотворень, а поруч виводиться індикатор **Пікової Аномалії (Peak Anomaly)** з вказівкою проблемного модуля.
- **Математична модель агрегації:**
  $$\text{Course } CopyPaste_{\text{median}} = \text{Median}\Big( \big\{ CopyPaste_{skill_1}, CopyPaste_{skill_2}, \dots, CopyPaste_{skill_N} \big\} \Big)$$
  $$\text{Peak Anomaly} = \max_{i} \Big( CopyPaste_{skill_i} \Big) \quad \text{при } CopyPaste_{skill_i} \ge 0.60$$
### 0.5 Автономний RPG-Віджет «Дерево Знань» (`GameSkillTreeWidget`)
- **Концепція та Гейміфікація:** Перетворення класичного орієнтованого графа залежностей навичок DAG у повноцінне інтерактивне RPG Дерево Прокачування (Skill Tree / Skyrim & Path of Exile visual design).
- **Архітектурні складові (`apps/student/src/features/skill-graph/ui/GameSkillTreeWidget.tsx`):**
  1. **Ігрове поле з неоновою кіберпанк-сіткою:** Органічний зигзагоподібний лейаут сузір'їв знань з векторними Bezier-кривими (Power Rays), що з'єднують навички.
  2. **Стани вузлів-рунічних кристалів:**
     - 🔒 **Locked:** Напівпрозорий, контур замка, неактивний до виконання пререквізитів ($P(L) \ge 0.95$).
     - ⚔️ **In Progress:** Пульсуюче синє сяйво, живий відсоток майстерності $P(L_t)$, кнопка «Розпочати квест».
     - ✨ **Mastered:** Золотисто-смарагдовий ореол (`bg-emerald-950/60 border-emerald-400`), позначка засвоєння та розблокування енергетичного променя до наступного рівня.
  3. **RPG Інспектор Навички (Side Quest Card):** Картка модуля з умовами квесту, пререквізитами та прогрес-баром BKT.
  4. **Гейміфікована прогресія:** Підрахунок рівня гравця (`LVL`), очок досвіду (`EXP`) та загального відсотка відкриття дерева знань курсу.
- **Інтеграція в Кабінет Студента:**
  - Акцентна іконка `Network` у лівому вертикальному навігаційному рейлі (`w-14`).
  - Перемикач режимів `[ 📜 Список Модулів | 🌳 RPG Дерево ]` у бічній панелі.
  - Повноекранне модальне вікно огляду та взаємодії з деревом знань.

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
- **Контрольована Навігація Завдань:**
  - Оновлено [page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/app/page.tsx): видалено автоматичну зміну завдання після проходження перевірки (`ACCEPTED`).
  - Студент зберігає можливість ознайомитися із зеленою плашкою успіху, розібрати деталізацію пройдених тестів та оцінити підйоми $P(L_t)$ до переходу до наступного завдання.

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
- **Обнулення Аналітики після Анулювання:**
  - При очищенні історії спроб ендпоінт `GET /api/v1/bkt/analytics/students` повертає точні нулі (`WPM = 0`, `Copy-Paste Ratio = 0%`, `Індекс втоми = 0%`) та статус `Нерозпочато` замість припустимих дефолтів.
- **Подвійний Детектор Вставки Коду в Monaco Editor:**
  - У [MonacoCodeEditor.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/ui/MonacoCodeEditor.tsx) підключено розпізнавання одномоментних стрибків розміру тексту (`onDidChangeModelContent > 10 chars`), що гарантує фіксацію телеметрії `onPaste` навіть при драг-енд-дропі коду або вставці гарячими клавішами OS.
- **Покриття Юніт-Тестами (`bkt.controller.spec.ts`):**
  - Написано юніт-тести для перевірки зведення аналітики: підтверджено розрахунок `copyPasteRatio = 1.0` при подіях вставки та гарантовано точне обнулення показників (`0 WPM`, `0% Ratio`, `0% Fatigue`, `Нерозпочато`) при анулюванні прогресу. Усі 9 тестів проєкту пройдено (100% success).
- **Стратегія Скрізного E2E Тестування (Playwright Framework):**
  - Оновлено загальні правила розробки проєкту у [.agents/AGENTS.md](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/.agents/AGENTS.md) з вимогою обов'язкової прогонки E2E тестів для наскрізних сценаріїв.
  - Спроєктовано структуру автоматизованих Playwright тестів у папці `e2e/`:
    1. **Сценарій 1 (Копіювання коду та виявлення спіралі):** Відкриття `localhost:3002`, вставка коду `isEven` у Monaco Editor, натискання «Перевірити код», перехід на `localhost:3003` та автоматична валідація наявності `COPY-PASTE RATIO: 100%`.
    2. **Сценарій 2 (BKT Прогрес & Анулювання):** Виконання завдання, перевірка переходу $P(L_t)$ у $97.1\%$, натискання кнопки «Анулювати» в адмінці та валідація повернення у статус `UNSTARTED` ($0.0\%$).

### 6.6 Усунення Хибних Показників Телеметрії та Дедуплікація (Мікро-Крок 6.6)
- **Кастомне Tailwind Модальне Вікно Анулювання ([StudentAnalyticsTable.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/features/analytics/ui/StudentAnalyticsTable.tsx)):**
  - Замінено стандартний `window.confirm()` на компонент діалогового вікна підтвердження з анімацією `animate-in fade-in zoom-in-95`.
  - Усунено проблему відхилення діалогів у браузерних автотестах Playwright та блокування спливаючих вікон.
- **Точне Обнулення WPM при Копіюванні ([useTelemetry.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/lib/useTelemetry.ts) & [bkt.controller.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/api/src/adapters/inbound/http/bkt.controller.ts)):**
  - Видалено штучну фіксацію `wpm: 180` при події вставки `handlePaste`.
  - У бекенд-контролері додано правило: якщо `copyPasteRatio === 1.0` (тобто 100% коду було вставлено), агрегований `avgWpm` автоматично приймається рівним `0 WPM`.
- **Дедуплікація Подій Вставки (300ms Deduplication Threshold):**
  - У [useTelemetry.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/lib/useTelemetry.ts) впроваджено лічильник `lastPasteTimeRef`. Повторні сигнали вставок від Monaco API, DOM `paste` та `onDidChangeModelContent`, що виникають протягом 300 мс, ігноруються, що гарантує лічильник `Pastes: 1` за один Ctrl+V.
- **Фільтрація Системних Комбінацій Клавіш (Ctrl+V / Cmd+V / Alt):**
  - Оновлено метод `handleKeyDown` у [useTelemetry.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/web/src/features/code-editor/lib/useTelemetry.ts) з перевіркою прапорців `ctrlKey`, `metaKey`, `altKey` та підтримкою `e.browserEvent` з Monaco Editor. Натискання гарячих клавіш копіювання/вставки більше не нарощують `keystrokeCountRef`.

### 6.7 Інтеграція та Конфігурація Playwright E2E Тестування (Мікро-Крок 6.7)
- **Інсталяція Playwright Test Environment:**
  - Встановлено залежність `@playwright/test` v1.63.0 та завантажено Chromium Headless браузер.
  - Додано команду `"test:e2e": "playwright test"` у кореневий `package.json`.
- **Файл Конфігурації ([playwright.config.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/playwright.config.ts)):**
  - Налаштовано запуск Headless Chrome з baseURL `http://localhost:3002`.
- **Інтеграційний Сценарій ([e2e/full-flow.spec.ts](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/e2e/full-flow.spec.ts)):**
  - Реалізовано наскрізний тест, який відкриває Кабінет Студента (`http://localhost:3002`), перевіряє роботу Monaco Editor, надсилає розв'язок, переходить у Кабінет Викладача (`http://localhost:3001`), перевіряє аналітику та тестує анулювання BKT-стану.

---

## 🤖 Крок 7: Фаза 3 — ШІ-оцінювання та Асинхронний Пайплайн (LLM Judge, BullMQ & Telemetry Trust)

### 7.1 Архітектурна Концепція Фази 3
Фаза 3 розширює базове BKT-оцінювання двома ключовими інтелектуальними інструментами:
1. **Асинхронний фоновий воркер BullMQ + Redis:** Вирішення проблеми масштабованості при одночасному надсиланні сотень студентських розв'язків. Замість блокуючого виконання у Node.js VM під час HTTP-запиту, завдання постановляється у чергу `code-evaluation`.
2. **LLM-Judge на базі Google Gemini API (`gemini-2.5-flash`):** Семантична перевірка коду, визначення дотримування патернів та генерування асистентських підказок.
3. **Розрахунок Коефіцієнта Довіри ($C_{\text{trust}}$) та Коригування $P(S)$ / $P(G)$:**
   - Інтеграція телеметрії у математичне ядро BKT:
     $$C_{\text{trust}} = 1.0 - (0.5 \cdot \text{CopyPasteRatio} + 0.3 \cdot \text{FatigueIndex} + 0.2 \cdot \text{WpmAnomaly})$$
   - Якщо $C_{\text{trust}} < 0.5$, параметри помилки $P(S)$ та вгадування $P(G)$ тимчасово коригуються для зниження довіри до поточного результату:
     $$P(G') = P(G) + (1 - C_{\text{trust}}) \cdot 0.3$$

### 7.2 Схема Асинхронного Пайплайну Оцінювання
```mermaid
sequenceDiagram
    autonumber
    actor Student as Студент (apps/student)
    participant API as NestJS REST API
    participant Queue as Redis (BullMQ Queue)
    participant Worker as Evaluation Processor
    participant Gemini as Google Gemini API
    participant WS as WebSocket Gateway
    participant DB as PostgreSQL (Prisma)

    Student->>API: POST /api/v1/bkt/evaluate (SourceCode, TaskId)
    API->>DB: Створення Submission (Status: IN_PROGRESS)
    API->>Queue: Push Job (submissionId, code, tests)
    API-->>Student: 202 Accepted (jobId, status: IN_PROGRESS)
    
    Queue->>Worker: Pop Job
    Worker->>Worker: 1. VM Test Execution (Pass/Fail)
    Worker->>Gemini: 2. Semantic Analysis (prompt: code + task)
    Gemini-->>Worker: JSON (qualityScore, hint, refactoringTip)
    Worker->>Worker: 3. Calculate C_trust from Telemetry
    Worker->>Worker: 4. BKT Update P(L_t) with adjusted P(S)/P(G)
    Worker->>DB: Save EvaluationResult, BktState, Submission Status
    Worker->>WS: Emit 'evaluation_completed' (jobId, P(L_t), feedback)
    WS-->>Student: Live Toast / UI Update
```

---

## 🏛️ Крок 8: Розділення відповідальностей порталів та міграція Skill DAG Editor в Адмін-панель (`apps/admin`)

### 8.1 Архітектурне розмежування ролей
У рамках рефакторингу ролей користувачів виконано розмежування функцій між додатками:
1. **`apps/admin` (Системне управління & CMS):**
   - Управління структурою курсу та графа знань Skill DAG (додавання, редагування назв, опису, складності та параметрів $P(L_0), P(T), P(S), P(G)$).
   - Модулі задач, відкритих та прихованих тест-кейси, конфігурація Web3 релейєра.
2. **`apps/teacher` (Аналітика & Педагогічний контроль):**
   - Візуалізація живого BKT Heatmap усіх студентів.
   - Телеметричні метрики (WPM, Copy-Paste ratio, Fatigue Index, Keystroke Pauses).
   - Швидке анулювання стану $P(L_0) = 0.0$ для проведения повторного зрізу знань.

### 8.2 Зміни у файловій структурі
- Модуль `features/skill-editor` перенесено з `apps/teacher/src/features/skill-editor` у [apps/admin/src/features/skill-editor](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/features/skill-editor).
- Компонент [SkillDagEditor.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/features/skill-editor/ui/SkillDagEditor.tsx) інтегровано у головну сторінку [apps/admin/src/app/page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/app/page.tsx) у вкладці «Skill DAG Builder».
- Оновлено [apps/teacher/src/app/page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/teacher/src/app/page.tsx) з повним фокусом на студентську аналітику та BKT Heatmap.

---

## 🌐 Крок 9: Розгортання Мультидисциплінарної Архітектури та Polyglot Evaluation Engine

### 9.1 Схема даних та розширення сутностей (`packages/database/prisma/schema.prisma`)
- **Створено модель `Course`**: `id`, `slug` (унікальний ключ `js-dev`, `english-b2`, `ukraine-law`), `title`, `description`, `icon`, `category`, `createdAt`.
- **Додано перерахування `TaskType`**: `CODE` (виконання JS коду у VM), `SINGLE_CHOICE` (радіо-тести), `MULTIPLE_CHOICE` (чекбокс-тести з частковим балом), `TEXT_ESSAY` (відкриті есе з підрахунком WPM, пауз та збігу ключових слів).
- **Оновлено `SkillNode` та `Task`**: додано обов'язкове посилання `courseId` та зв'язок з `Course`, а також опціональне JSON-поле `options` у `Task` для переліку варіантів відповідей (з полями `id`, `text`, `isCorrect`).

### 9.2 Дисципліни та сидування даних (`packages/database/prisma/seed.ts`)
1. **`js-dev` (JavaScript & Web Development)**: 5 модулів (`js-basics`, `js-functions`, `js-collections`, `js-async`, `js-oop`), 5 `CODE` задач.
2. **`english-b2` (Business & Tech English B2)**: 3 модулі (`eng-vocabulary`, `eng-grammar`, `eng-essay`), 4 завдання (`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TEXT_ESSAY`).
3. **`ukraine-law` (Правознавство України)**: 3 модулі (`law-const`, `law-civil`, `law-labor`), 3 завдання (`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TEXT_ESSAY`).

### 9.3 Поліглотний двигун оцінювання (`apps/api`)
- **`CourseController` (`/api/v1/courses`)**: розроблено REST-ендпоінти отримання переліку курсів та деталей конкретного курсу за `slug`.
- **`TaskController` (`/api/v1/tasks/recommended`)**: впроваджено query-фільтрацію `courseSlug` для ізольованої рекомендації задач.
- **`BktController` (`POST /api/v1/bkt/evaluate`)**:
  - `SINGLE_CHOICE`: Динамічна оцінка вгадування $P(G_{\text{dyn}})$. Якщо час відповіді `reactionLatencyMs < 2000`, $P(G_{\text{dyn}}) = 0.85$ (штраф за швидкий вгад).
  - `MULTIPLE_CHOICE`: Частковий бал (Partial scoring) $S = \max(0, \frac{N_{\text{correct}} - N_{\text{wrong}}}{N_{\text{total\_correct}}})$.
  - `TEXT_ESSAY`: Оцінка за мінімальну довжину слів (>= 25 слів) та перевірку наявності не менше 50% ключових понять курсу.
  - `CODE`: Перевірка набору відкритих та прихованих тест-кейсах у Node.js VM context.

### 9.4 Фронтенд кабінети (`apps/student`, `apps/teacher`)
- **Кабінет Студента (`apps/student`)**: додано шапку вибору курсу, розроблено UI компоненти `QuizTaskEditor.tsx` (радіо/чекбокси з точним вимірюванням часу реакції в ms) та `EssayTaskEditor.tsx` (текстове поле з підрахунком слів, пауз у наборі та WPM).
- **Кабінет Викладача (`apps/teacher`)**: додано вкладочне перемикання предметів для фільтрації BKT Heatmap та студентської аналітики за курсом.

### 9.5 Стабілізація локального оточення та усунення збоїв Turbopack (`apps/student`)
- **Проблема**: Під час виконання `npm run dev:student` Next.js v16 за замовчуванням активував Turbopack engine, який викликав сбій воркерів `tokio-runtime-worker` з панікою Rust `Every task must have a task type TaskGuard` через пошкоджений дисковий кеш `.next`.
- **Конфігурація**: 
  - Видалено пошкоджений кеш `apps/student/.next`.
  - У `apps/student/package.json` оновлено dev-скрипт на `"dev": "npx next dev --webpack --port 3002"`.
### 9.7 Виправлення Алгоритму TaskSequencer & Ізоляція Заблокованих Модулів (`apps/api/src/domain/sequencing/task-sequencer.ts`)
- **Проблема**: За наявності 1 або кількох завдань у модулі, коли студент виконував усі завдання модуля, але ще не досяг порогу засвоєння $P(L_t) \ge 0.95$, `TaskSequencer` здійснював передчасний пошук по всьому курсу (`tasks.find(...)`) та видавав завдання з наступних заблокованих модулів. У результаті студент отримував задачі з заблокованого Модуля 3, хоча на UI активним вважався Модуль 2.
- **Модифікація бізнес-логіки**:
  - `TaskSequencer.recommendNextTask` спрощено та ізольовано: визначення `currentActiveSkill` відбувається серед розблокованих вузлів (`unlockedSkills`), де $P(L_t) < 0.95$.
  - Якщо `currentActiveSkill` визначено, система гарантовано видає невиконане завдання з цього модуля, а у разі якщо всі завдання модуля вже спробовано один раз — повертає перше завдання цього ж модуля `activeSkillTasks[0]` для повторного практикування до моменту досягнення $P(L_t) \ge 0.95$.
### 9.8 Динамічне Нарощування BKT P(L_t) при Повторній Практиці Завдань (`apps/api/src/adapters/inbound/http/bkt.controller.ts`)
### 9.9 Механізм Завершення Завдань Модуля & Модальне Вікно Анулювання Прогресу
- **Концептуальне рішення**: Якщо у поточному розблокованому модулі закінчилися всі доступні завдання, а студент ще не здобув рівень $P(L_t) \ge 0.95$, система повертає `isExhausted: true` та виводить модальний попап для підтвердженого анулювання прогресу саме цього модуля.
- **Реалізація**:
  - `TaskSequencer` повертає статус `MODULE_TASKS_EXHAUSTED` та `isExhausted: true` коли `uncompletedInActive` відсутній.
  - `BktController` розширено REST ендпоінтом `POST /api/v1/bkt/reset-skill` (приймає `userId` та `skillId`), який видаляє записи `Submission`, `BktHistory` та `BktState` виключно для вказаного модуля.
  - [page.tsx](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/student/src/app/page.tsx) показує модальне вікно (Popup) з повідомленням *«Завдання даного модуля закінчилися, і ви не набрали необхідну кількість балів (>=95%). Ваш прогрес на цьому модулі буде анульований для повторної спроби.»* та кнопкою підтвердження **«ОК, анулювати прогрес модуля»**.

### 9.10 Концептуальне Проєктування Повноцінної EdTech-Екосистеми (`docs/brainstorm/02_edtech_ecosystem_vision.md`)
- **Проблематика та Візія:** Перехід від вузького фокусу «тестувальника знань» до самодостатньої персоналізованої навчальної платформи (EdTech Ecosystem).
- **5 Ключових Архітектурних Векторів:**
  1. **Dynamic Adaptive Pathways & Just-in-Time Theory:** Інтерактивні інтервенції (45-секундні візуалізатори пам'яті/Event Loop, flash-картки) у момент фіксації високого $P(Slip)$ або падіння $P(L_t)$. Модель забування за Еббінгаузом $P(L_{t+\Delta t}) = P(L_t) \cdot e^{-\lambda \Delta t}$.
  2. **Socratic AI-Scaffolding:** Заборона прямої генерації коду тьютором. Аналіз коду та помилок студента з наданням навідних запитань і багаторівневою підтримкою (Fading Assistance).
  3. **RPG Skill Tree & Boss Fights:** Повноцінне інтегрування дерева талантів з різними спеціалізаціями розробника та комплексними завданнями підвищеної складності (виправлення memory leak, аудит безпеки).
  4. **Teacher Co-Pilot:** Теплова карта когнітивного навантаження групи в реальному часі на основі WebSocket телеметрії для виявлення кластерів нерозуміння теми.
  5. **Proof-of-Competence:** Валідація авторства розв'язку на основі телеметрії набору (WPM, паузи, відсутність аномального копіпасту) з формуванням Soulbound токенів навичок (SBT).

### 9.11 Суто Технічна Архітектура Платформи у Монорепозиторії (`docs/brainstorm/03_technical_edtech_platform_architecture.md`)
- **Hexagonal Backend Core (`apps/api`):**
  - `LearningSessionEngine`: Кінцевий автомат (FSM) сесії: $\text{DIAGNOSTIC} \to \text{PRACTICE} \to \text{INTERVENTION} \to \text{SCAFFOLDED} \to \text{MASTERY}$.
  - `InterventionRouter`: Реактивний тригер інтервенцій ($\Delta t_{\text{idle}} > 45\text{ с} \land P(Slip) > 0.65 \land \text{failedRuns} \ge 2$) без очікування сабміту.
  - `SocraticScaffoldingService`: LLM-агент з забороною прямого коду та ін'єкцією AST контексту та телеметрії.
  - `TelemetryIntegrityEngine`: Обчислення $WPM_{\text{instant}}$, $\text{Burstiness}$ та $\alpha$-Score проти читерства.
- **Розширення Моделі Даних (`packages/database`):**
  - `TheorySnippet` (інтерактивна мікро-теорія, visualizers, 45-сек читання).
  - `SocraticDialogue` (історія запитань/відповідей, tier рівень підказок).
  - `CompetenceCredential` (верифіковані $P(L) \ge 0.95$ та $\alpha$-Score для Soulbound NFT).
- **Клієнтські Інтерфейси (`apps/student`, `apps/teacher`):**
  - `apps/student`: Split-Screen Workspace (Code IDE + Micro-Theory + AST Call Stack Visualizer) та Socratic Drawer.
  - `apps/teacher`: Підписка на кімнату WebSocket `ws://api/telemetry/classroom/:courseId` для живої теплової карти когнітивного стану групи (Flow, Pause, Cognitive Block).

### 10.1 Phase 2 · `BehavioralAdjuster` — динамічна корекція Slip/Guess (`apps/api/src/domain/bkt/behavioral-adjuster.ts`)
- **Призначення:** чистий доменний модуль (без NestJS/Prisma), що повертає скориговані $P(S)$, $P(G)$ **лише для однієї відповіді**; базові параметри в `bkt_states` не змінюються.
- **API:** `BehavioralAdjuster.adjust(base: {pSlip, pGuess}, signals: BehavioralSignals) → {pSlip, pGuess, reasons[]}`.
- **Сигнали:** `taskType`, `isCorrect`, `currentMastery`, `reactionLatencyMs`, `deletionRatio`, `pauseCount`, `passedTestsRatio`.
- **Правила (`ADJUSTER_CONFIG`):**
  - Guess: правильна відповідь у `SINGLE_CHOICE`/`MULTIPLE_CHOICE` за $< 2000$ мс → $P(G) = \max(P(G), 0.85)$.
  - Slip (лише для неправильних відповідей):
    - хаотичні правки (`deletionRatio` ≥ 0.4 або `pauseCount` ≥ 5) при $P(L) \le 0.3$ → $P(S) = 0.05$ (справжнє незнання); при вищому $P(L)$ — базовий $P(S)$;
    - `CODE` з $0.7 \le$ `passedTestsRatio` $< 1$ → $P(S) = 0.25$ (промах на граничному випадку);
    - $P(L) \ge 0.7$ і `deletionRatio` ≤ 0.15 → $P(S) = 0.3$ (ймовірна описка).
  - Результат обмежується діапазоном $[0.01, 0.9]$.
- **Ефект:** сильний студент ($P(L)=0.9$) з опискою: при $S=0.1$ $P(L)$ падає до ≈0.50, при $S=0.3$ — лише до ≈0.79.
- **Тести:** `behavioral-adjuster.spec.ts` (8 тестів, включно з інтеграцією з `BktEngine`).

### 10.2 Phase 2 · Інтеграція `BehavioralAdjuster` у `POST /api/v1/bkt/evaluate`
- **Потік:** оцінювання відповіді → `BehavioralAdjuster.adjust({pSlip, pGuess} з bkt_states, signals)` → `BktEngine.calculateNextState(...)` зі скоригованими $S, G$ → оновлення лише `pMastery` у `bkt_states`.
- **Bugfix:** раніше при створенні `bkt_states` писалось `pGuess: customPGuess || 0.2` — швидка перша відповідь назавжди фіксувала $P(G)=0.85$. Тепер базове значення завжди 0.2.
- **Схема (`bkt_histories`):** `pSlipUsed Float?`, `pGuessUsed Float?`, `adjustReasons String[] @default([])` (застосовано через `prisma db push`, адитивно, без втрати даних).
- **DTO `SubmitTaskDto`:** нові необов'язкові поля `deletionRatio` (0..1), `pauseCount`.
- **Відповідь API:** `bktUpdate.pSlipUsed`, `bktUpdate.pGuessUsed`, `bktUpdate.adjustReasons[]`; до `feedback` додається «⚡ можливе вгадування» (G↑) або «🛡️ схоже на випадкову помилку» (S↑).
