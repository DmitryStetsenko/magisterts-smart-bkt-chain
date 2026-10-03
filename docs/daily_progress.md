# 📅 Журнал розробки та прогресу проєкту (Daily Progress Log)

Цей документ фіксує щоденний прогрес розробки, архітектурні рішення та планування наступних кроків для системи «Smart-BKT-Chain».

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
2. **Розпочато Крок 6 Master Plan (Панель викладача та адміністратора `apps/admin`):**
   - **Мікро-Крок 6.1 (Ініціалізація та конфігурація Next.js Admin App):**
     - Створено каркас додатка Next.js 16 (App Router, React 19) у папці [apps/admin](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin).
     - Інтегровано TailwindCSS v4 та налаштовано темну тему у [globals.css](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/app/globals.css).
     - Розроблено базовий макет [RootLayout](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/app/layout.tsx) та головну панель викладача [AdminDashboardPage](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/apps/admin/src/app/page.tsx).
     - Додано скрипти `dev:admin` (порт 3003) та `build:admin` у кореневий [package.json](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/package.json), успішно виконано збірку.

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

