# Управління проєктом та інтеграція з Jira «Smart-BKT-Chain»

Цей документ описує методологію управління розробкою, структуру епіків у Jira, правила кодування завдань, регламент роботи з Git та критерії готовності функціоналу (Definition of Done).

---

## 1. Система кодування та компонентів (Jira Components)

Для забезпечення чіткої фільтрації завдань, автоматизації аналітики та зручності розробки в межах монорепозиторію, кожне завдання прив'язується до відповідного архітектурного компонента за допомогою префіксів у назві та вибору поля **Component** у Jira.

| Код (Префікс) | Компонент Jira | Сфера відповідальності (Scope) | Робоча директорія |
| :--- | :--- | :--- | :--- |
| **`INF`** | `DevOps-Infra` | Конфігурація монорепозиторію, Docker, CI/CD, хмарний деплой | `/`, `/.github/`, `/docker/` |
| **`BK`** | `Backend-API` | Ядро NestJS бекенду, авторизація, робота з базою даних | `/apps/api/` |
| **`BKT`** | `BKT-Engine-AI` | Математичний рушій BKT, оцінювання коду (LLM Judge), черги | `/apps/api/src/domain/` |
| **`W3`** | `Web3-Blockchain` | Смарт-контракти Solidity, Hardhat/Foundry, релейєр транзакцій | `/packages/contracts/` |
| **`ST`** | `Student-Frontend` | Кабінет Студента Next.js (Monaco Editor, Skill DAG Map, телеметрія) | `/apps/student/` |
| **`TC`** | `Teacher-Frontend` | Кабінет Викладача Next.js (BKT Heatmap, CRM аналітика, анулювання) | `/apps/teacher/` |
| **`AD`** | `Admin-CMS` | Панель Адміністратора Next.js (Skill DAG Builder, CMS курсів/задач) | `/apps/admin/` |
| **`LD`** | `Landing-Web` | Публічний промо-сайт Next.js (Landing page, Web3 Auth) | `/apps/web/` |
| **`SH`** | `Shared-Packages` | Спільні пакети монорепозиторію (Prisma schema, E2E типи) | `/packages/` |

---

## 2. Реєстр епіків (Jira Epics Registry)

Весь обсяг робіт розділено на **10 ключових епіків**, кожен з яких представляє собою завершений функціональний блок системи:

### `SBC-EP-INF` | [INF] Monorepo & CI/CD Setup
*   **Опис:** Створення інфраструктурного каркаса монорепозиторію, локального середовища розробки, Playwright E2E автоматизації та інструментів документації.
*   **Ключові результати (Deliverables):**
    *   Ініціалізовано Turborepo та npm Workspaces (`apps/*`, `packages/*`).
    *   Створено спільні конфігураційні файли (TSConfig, ESLint, Prettier).
    *   Розгорнуто Docker-compose конфіг (PostgreSQL).
    *   Налаштовано автоматичну валідацію коммітів (Git Hook `commit-msg`).
    *   Запущено Next.js сайт документації `apps/docs` з деплоєм на GitHub Pages та генерацією JSON-артефактів.
    *   Впроваджено Playwright E2E автоматичні тести для критичних шляхів користувача.

### `SBC-EP-SH` | [SH] Database Modeling & Shared Packages
*   **Опис:** Створення єдиної схеми даних, Prisma ORM моделей та спільних фронтенд-пакетів для гарантування E2E Type Safety.
*   **Ключові результати (Deliverables):**
    *   Описано Prisma схему у `packages/database` (користувачі, курси, навички, задачі типів `CODE`, `CHOICE`, `OPEN_TEXT`, таблиці `TelemetryLog`, `BehavioralProfile`, `BktHistory`, `Submission`).
    *   Створено спільний UI-пакет `@sbc/ui` з Storybook, віджетами `GameSkillTreeWidget`, `AnomalyTreeWidget`, `AnomalyRadarWidget` та `CourseOverviewWidget`.
    *   Створено спільний пакет типів `@sbc/types`.

### `SBC-EP-BK` | [BK] Authentication & Core API Services
*   **Опис:** Реалізація безпеки платформи, реєстрації, автентифікації та розмежування ролей (RBAC).
*   **Ключові результати (Deliverables):**
    *   Гібридна автентифікація: SIWE (Sign-In with Ethereum) для верифікації криптогаманців + JWT / OAuth2 для викладачів та адміністраторів.
    *   NestJS `RolesGuard` для захисту ендпоінтів (`Admin`, `Educator`, `Student`, `Employer`).
    *   Swagger OpenAPI документація ендпоінтів.

### `SBC-EP-BKT` | [BKT] Bayesian Knowledge Tracing Core Engine & Behavioral Telemetry
*   **Опис:** Розробка математичного алгоритму оцінювання знань студента в реальному часі з динамічною адаптацією параметрів $P(S)$ та $P(G)$, плануванням індивідуальних навчальних траєкторій (Task Sequencing) та аналізом аномалій.
*   **Ключові результати (Deliverables):**
    *   Реалізовано сервіс розрахунку матриць ймовірностей BKT.
    *   Створено `BehavioralAdjuster` для динамічного коригування $P(Guess)$ та $P(Slip)$ на основі швидкості (WPM), пауз, подій вставки (`pasteEvents`) та видалень (`deletionRatio`).
    *   Впроваджено модульну телеметрію (Per-Module Telemetry), розрахунок курсової медіани та виявлення локальних сплесків несамостійної роботи.
    *   Алгоритм «Холодного старту» (Cold Start) та генерація адаптивного треку на основі графа навичок.

### `SBC-EP-LLM` | [LLM] Automated Code Assessment & Open-Text Evaluation
*   **Опис:** Реалізація системи автоматичної перевірки практичних завдань з програмування та відкритих есе (`OPEN_TEXT`).
*   **Ключові результати (Deliverables):**
    *   Оркестратор багаторівневого семантичного оцінювання `OpenAnswerEvaluatorService` (Tier 1 Heuristics, Tier 2 Cosine Similarity, Tier 3 LLM Rubric Judge).
    *   Модуль `OpenTextHeuristicEvaluator` із захистом від копіпасту запитання, беззмістовного тексту (Gibberish) та тавтологічного спаму.
    *   Інтеграція черги перевірок сумнівних відповідей (`TeacherReviewStatus.PENDING_REVIEW`) для викладача (Human-in-the-Loop).

### `SBC-EP-W3` | [W3] Web3 Infrastructure & Smart Contracts
*   **Опис:** Розробка та деплой смарт-контрактів для верифікації навичок на рівні блокчейну.
*   **Ключові результати (Deliverables):**
    *   Смарт-контракти для dNFT (ERC-721) та Soulbound токенів (ERC-5192).
    *   Система відновлення токенів у разі втрати доступу до гаманця (SBT Recovery).
    *   Релейєр спонсорованих транзакцій (gasless transactions).
    *   Foundry юніт-тести та Fuzzing-тестування.

### `SBC-EP-ST` | [ST] Student Portal & Skill Tree Map
*   **Опис:** Кабінет Студента (`apps/student`) з інтерактивним графом навичок та редактором коду.
*   **Ключові результати (Deliverables):**
    *   Інтерактивний RPG-стилізований віджет дерева знань `GameSkillTreeWidget` з променями сили, рівнями гравця та квест-картками.
    *   Редактор Monaco з фоновим модулем збору телеметрії друку.
    *   Візуалізація семантичних рубрик та фідбеку для відкритих завдань.
    *   Уніфікований 3-стадійний стан навігації сайдбара (`activeTab` + `isDrawerOpen`).

### `SBC-EP-TC` | [TC] Teacher Portal & Analytics CRM
*   **Опис:** Кабінет Викладача (`apps/teacher`) для моніторингу прогресу, аудиту телеметрії та ручної перевірки.
*   **Ключові результати (Deliverables):**
    *   Теплова карта успішності (BKT Heatmap) та аналітика груп.
    *   Human-in-the-Loop черга перевірки сумнівних відкритих відповідей з можливістю підтвердження/корекції балу в один клік.
    *   Інспектор модульної телеметрії та віджет огляду графа курсу `CourseOverviewWidget`.

### `SBC-EP-AD` | [AD] Admin Portal & Knowledge DAG Builder
*   **Опис:** Робоче місце адміністратора (`apps/admin`) для управління структурою курсів та аудиту.
*   **Ключові результати (Deliverables):**
    *   Візуальний конструктор графа навичок (Skill DAG Builder).
    *   CMS інтерфейс управління курсами, модулями, тестовими завданнями та рубриками.
    *   Адміністративна панель моніторингу користувачів та виклику процедури відновлення токенів.

### `SBC-EP-LD` | [LD] Landing Web Page
*   **Опис:** Публічний промо-сайт системи (`apps/web`).
*   **Ключові результати (Deliverables):**
    *   Презентація платформи Smart-BKT-Chain, ключових переваг адаптивного навчання та блокчейн-сертифікації.
    *   Точки входу в кабінети користувачів та Web3 підключення гаманців.

---

## 3. Типи завдань у Jira (Issue Types)

Для ведення розробки використовуються стандартні типи завдань Agile, розширені для потреб R&D проєкту:

*   **`Story` (Користувацька історія):** Опис нової бізнес-фічі з точки зору кінцевого користувача. Має містити Acceptance Criteria (AC).
*   **`Task` (Технічне завдання):** Чисто інженерна робота (налаштування конфігів, баз даних, написання тестів).
*   **`Bug` (Помилка):** Дефект у вже існуючому та протестованому коді.
*   **`Spike` (Дослідження):** Дослідницьке завдання для вивчення нових технологій, алгоритмів або підходів. Завжди завершується написанням текстового документа (ADR) та фіксованим Time-box (наприклад, 4 або 8 годин).

---

## 4. Правила роботи з Git (Git Flow)

### 4.1. Найменування гілок (Branch Naming)
Кожна гілка повинна починатись із префікса напрямку, номера та короткого опису англійською мовою (через дефіс):
*   `feature/CF-12-knowledge-graph`
*   `feature/W3-45-sbt-recovery`
*   `bugfix/BK-99-jwt-expiration`
*   `spike/BKT-5-cold-start-analysis`

### 4.2. Правила оформлення коммітів (Jira Conventional Commits)
Усі повідомлення коммітів повинні відповідати стандарту із обов'язковим зазначенням номера завдання Jira, короткого коду епіку та типу змін:

```text
[<номер_таски>][<код_епіку>] <type>: <опис англійською мовою>
```

**Дозволені коди епіків (`код_епіку`):**
* `[EP-INF]` — Monorepo, CI/CD, Docs, E2E Tooling
* `[EP-SH]` — Database Modeling (Prisma), Shared Packages (`@sbc/ui`, `@sbc/types`)
* `[EP-BK]` — Authentication, RBAC, Core NestJS API
* `[EP-BKT]` — Bayesian Knowledge Tracing Core Engine, Behavioral Telemetry, Anomaly Detection
* `[EP-LLM]` — Automated Code Assessment & Open-Text Evaluation
* `[EP-W3]` — Web3 Infrastructure & Smart Contracts (Foundry/Solidity)
* `[EP-ST]` — Student Portal Next.js (`apps/student`)
* `[EP-TC]` — Teacher Portal Next.js (`apps/teacher`)
* `[EP-AD]` — Admin Portal Next.js (`apps/admin`)
* `[EP-LD]` — Landing Web Page (`apps/web`)

**Дозволені типи (`type`):**
`feat` (нова фіча), `fix` (виправлення дефекту), `docs` (документація), `style` (стилі/форматування), `refactor` (рефакторинг), `test` (тести), `chore` (налаштування білду, конфігів).

**Приклади валідних коммітів:**
* `[SBC-12][EP-ST] feat: add interactive ECharts skill graph to dashboard`
* `[SBC-99][EP-BK] fix: resolve JWT validation crash on expired token`
* `[SBC-45][EP-W3] test: add foundry fuzz tests for SBT recovery logic`
* `[SBC-195][EP-TC] feat: human-in-the-loop review queue for open text answers`
* `[SBC-202][EP-BKT] docs: add full open-text assessment pipeline and anomaly specification`

### 4.3. Автоматичний захист стандарту коммітів (Git Hook & Scripts)
Для гарантування дотримання стандарту та виключення людського фактору впроваджено систему трирівневого контролю:

1. **Git Hook `commit-msg` (`.git/hooks/commit-msg`):**
   - Перехоплює кожен виклик `git commit` локально на рівні робочої станції.
   - Запускає валідатор `scripts/validate_commit_msg.js`.
   - Якщо повідомлення не відповідає шаблону `^[SBC-\d+][EP-(INF|SH|BK|BKT|LLM|W3|ST|TC|AD|LD)] (feat|fix|docs|style|refactor|test|chore): .+`, створення комміту негайно блокується з виведенням кольорової інструкції та прикладів.
2. **Ручна або CI/CD перевірка:**
   - Команда `npm run validate:commit "<commit message>"` дозволяє протестувати будь-який заголовок.
3. **Реєстр завдань та експорт у Jira:**
   - Файл [`docs/tasks/registry.md`](file:///docs/tasks/registry.md) містить структуровану історію за епіками.
   - Скрипт `scripts/generate_jira_artifacts.js` оновлює реєстр та генерує свіжий [`docs/tasks/jira_import.csv`](file:///docs/tasks/jira_import.csv) для автоматичного імпорту в Jira Cloud/Server.

---

## 5. Критерії готовності (Definition of Done - DoD)

Завдання не може бути переведене в статус **Done (Завершено)**, якщо воно не відповідає загальним та специфічним критеріям готовності.

### Загальні критерії:
1.  Код пройшов перевірку лінтера (`npm run lint`) та збірку типів (`npm run typecheck`).
2.  Написано необхідні юніт- та інтеграційні тести (покриття коду новими тестами >80%).
3.  Оновлено відповідні файли документації в директорії `docs/` (якщо функціонал міняє API або архітектуру).
4.  Створено Pull Request, який успішно пройшов автоматичні перевірки в CI/CD (GitHub Actions).

### Специфічні критерії готовності:

*   **Для Frontend (ST, TC, AD, LD):**
    *   Відсутність помилок Hydration Mismatch (елементи Web3 загорнуті в `dynamic` з `ssr: false`).
    *   Інтерфейс повністю адаптивний (перевірено на мобільних роздільних здатностях).
    *   Уніфікований стан навігації `activeTab` + `isDrawerOpen` з підтримкою збереження виділення при згортанні панелей.
    *   Усі текстові ресурси винесені у файли локалізації `next-intl` (UA/EN).
*   **Для Backend (BK, BKT):**
    *   Для всіх нових API-ендпоінтів додано декоратори Swagger (`@ApiOperation`, `@ApiResponse`).
    *   Усі DTO валідуються за допомогою `class-validator`.
    *   Для операцій з БД використано транзакційні блоки та оброблено помилки унікальних ключів.
*   **Для Web3 & Смарт-контрактів (W3):**
    *   Контракти скомпільовані за допомогою Solidity 0.8.20+ без попереджень (warnings).
    *   100% покриття логіки контракту тестами у Foundry.
    *   Виконано аналіз витрат газу (Gas Report) та оптимізовано змінні сховища (storage slots).
    *   Логіку перевірено за допомогою фазінг-тестів (Fuzzing).

