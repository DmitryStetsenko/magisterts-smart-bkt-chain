# Архітектура `M-FSD` (Monorepo Feature-Sliced Design)

Цей документ визначає канонічний архітектурний стандарт **`M-FSD` (*Monorepo Feature-Sliced Design: Shared Foundation + Portal Slices*)** — адаптацію методології Feature-Sliced Design для мультипортальних TypeScript / Next.js монорепозиторіїв у поточному проєкті **«Smart-BKT-Chain»** та наступних системах.

---

## 1. Філософія та Проблема Класичного FSD у Монорепозиторії

Класичний **Feature-Sliced Design (FSD)** спроєктовано під один ізольований SPA-застосунок із 7 шарами (`app → processes → pages → widgets → features → entities → shared`). У мультипортальному монорепозиторії з кількома рольовими фронтендами (`web`, `student`, `teacher`, `study`, `admin`, `docs`) пряме копіювання класичного FSD у кожен `apps/*` створює дві системні проблеми:

*   **Дублювання нижніх шарів між порталами:** `shared/ui`, `shared/api`, `shared/config` та базові моделі `entities/` копіюються між застосунками, через що розходяться дизайн-токени, доступність (WCAG) та контракти даних.
*   **Сповзання в «FSD-lite» та поява монолітів:** замість реальної ізоляції формується формальна папка `features/` поруч із нетипізованою `components/`, а складна логіка накопичується у файлах на 1 000–2 700 рядків.

**Головна ідея `M-FSD`:** винести глобальний фундамент (**`Shared Foundation`**) на рівень спільних пакетів `packages/*`, а всередині кожного порталу (`apps/*/src/`) залишити компактну вертикаль **`Portal Slices`** (`app → views → widgets → features → [entities]`).

---

## 2. Дворівнева Структура `M-FSD`

```text
monorepo/
├── packages/                           # РІВЕНЬ А: Shared Foundation (Міжпортальне Ядро)
│   ├── types/                          # Global shared/model (DTO, BKT/telemetry контракти)
│   ├── contracts/                      # Global shared/api (Web3 ABI, схеми інтеграцій)
│   ├── routes/                         # Global shared/routes (порти, URL-білдери, навігація)
│   └── ui/                             # @sbc/ui: Глобальний UI-Kit + Спільні Віджети
│       └── src/
│           ├── shared/ui/              # Атомарний UI-Kit на токенах --sbc-* (Button, Modal, ConfirmModal, Badge, Tooltip, Select)
│           ├── shell/                  # Opera Shell v2.0 (AppShellLayout)
│           ├── theme/                  # Dark/Light система тем, CSS-змінні, ThemeInitScript
│           ├── code/                   # Спільні кодові компоненти (CodePlayground)
│           └── widgets/                # Міжпортальні композити (GameSkillTreeWidget, AnomalyTreeWidget, UserProfileDrawer)
│
└── apps/<portal>/src/                  # РІВЕНЬ Б: Portal Slices (Локальні шари порталу)
    ├── app/                            # Тільки роутинг Next.js App Router (layout.tsx, page.tsx, metadata, Providers)
    ├── views/                          # Композиція сторінки маршруту (заміна pages/ для Next.js)
    ├── widgets/                        # Самостійні великі UI-блоки (комбінація фіч/секцій екрана)
    ├── features/                       # Конкретні сценарії дій користувача (<slice>/ui, model, api, lib, index.ts)
    └── entities/                       # (Опціонально) Локальні доменні моделі, унікальні для цього порталу
```

### 2.1. Рівень А — `Shared Foundation` (`packages/*`)
*   **`@sbc/types` (`packages/types`):** єдине джерело істини для DTO, контрактів REST/WebSocket та доменних структур (`Global shared/model`).
*   **`@sbc/contracts` (`packages/contracts`):** ABI смарт-контрактів та типи блокчейн-рівня (`Global shared/api`).
*   **`@sbc/routes` (`packages/routes`):** централізований реєстр портів і типізованих міжпортальних посилань (`Global shared/routes`).
*   **`@sbc/ui` (`packages/ui`) — Атомарний `shared/ui/`:** чисті примітиви без бізнес-логіки (`Button`, `Modal`, `ConfirmModal`, `Badge`, `Tooltip`, `DropdownSelect`, `Input`), побудовані **виключно на дизайн-токенах `--sbc-*`** із гарантованою WCAG AA/AAA контрастністю у Dark/Light темах.
*   **`@sbc/ui` (`packages/ui`) — Міжпортальні композити:** складні компоненти та оболонка (`AppShellLayout`, `UserProfileDrawer`, `DrawerSection`, `Breadcrumbs`, `CodePlayground`, `GameSkillTreeWidget`, `AnomalyTreeWidget`, `AuthModal`), які перевикористовуються у 2+ порталах.

### 2.2. Рівень Б — `Portal Slices` (`apps/*/src/`)
*   **`app/`:** відповідає виключно за маршрутизацію Next.js App Router (`layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `generateMetadata`, провайдери тем/авторизації). Не містить бізнес-логіки та масивної верстки.
*   **`views/`:** замінює шар `pages/` (щоб уникати конфлікту з Pages Router у Next.js) і збирає конкретний екран з `widgets/` та `features/`.
*   **`widgets/`:** самостійні великі секції інтерфейсу зі станом і координацією кількох фіч (наприклад, `TaskWorkspace`, `StudentAnalyticsPanel`, `CourseStudio`).
*   **`features/`:** атомарні сценарії дій користувача (наприклад, `practice-mode`, `socratic-hints`, `course-import`, `review-queue`) із сегментами `ui/`, `model/`, `api/`, `lib/`, `config/` та обов'язковим **`index.ts`**.
*   **`entities/` (опціонально):** локальні доменні картки/моделі, що існують лише в межах одного порталу.

---

## 3. Матриця Залежностей та Public API

Головний архітектурний закон `M-FSD`: **імпорти спрямовані суворо згори вниз**, слайси одного шару не імпортують один одного, а портали `apps/*` ніколи не залежать напряму від інших `apps/*`.

| Хто імпортує ↓ \ Що імпортує → | `app/` | `views/` | `widgets/` | `features/` | `entities/` | `@sbc/ui` (widgets) | `@sbc/ui` (shared/ui) | `@sbc/types` / `@sbc/routes` | Інший `apps/*` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`app/`** | — | ✅ | ✅ *(рідко)* | ❌ | ❌ | ✅ *(Layout/Theme)* | ✅ | ✅ | ❌ |
| **`views/`** | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **`widgets/`** | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **`features/`** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **`entities/`** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **`@sbc/ui` (widgets)** | ❌ | ❌ | ❌ | ❌ | ❌ | — | ✅ | ✅ | ❌ |
| **`@sbc/ui` (shared/ui)** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ✅ *(базові типи)* | ❌ |

*   **Правило Public API (`index.ts`):** імпорт із будь-якого локального слайсу (`features/practice-mode`, `widgets/task-workspace`) виконується **тільки через `index.ts`**. Глибокі імпорти у внутрішні файли (`features/practice-mode/ui/ModeToggle`) ззовні слайсу заборонені.
*   **Правило `@sbc/ui`:** імпорти з UI-пакета йдуть виключно через кореневий експорт `@sbc/ui`, без прямих відносних шляхів у `packages/ui/src/...`.

---

## 4. Дерево Прийняття Рішень, Сегменти та Іменування

### 4.1. Куди покласти новий файл?
1.  **Чистий UI-атом без доменної логіки (кнопка, модалка, бейдж, інпут, тултіп, селект):** `packages/ui/src/shared/ui/<kebab-name>/`.
2.  **Складний віджет або сервіс інтерфейсу для 2+ порталів:** `packages/ui/src/...` з публічним експортом у `packages/ui/src/index.ts`.
3.  **DTO, інтерфейси, контракти, маршрути:** `@sbc/types`, `@sbc/contracts` або `@sbc/routes`.
4.  **Сценарій дії користувача в межах 1 порталу:** `apps/<portal>/src/features/<kebab-slice>/`.
5.  **Велика композитна секція сторінки 1 порталу:** `apps/<portal>/src/widgets/<kebab-widget>/`.
6.  **Сторінка URL-маршруту:** `apps/<portal>/src/views/<kebab-view>/` + тонка обгортка в `apps/<portal>/src/app/.../page.tsx`.

### 4.2. Сегменти слайсу та конвенція імен
*   **`ui/`:** React-компоненти у `PascalCase.tsx` (`PracticeModeSwitcher.tsx`, `ConfirmModal.tsx`).
*   **`model/`:** локальний стан, хуки у `useCamelCase.ts` (`useTelemetry.ts`), типи слайсу (`*.types.ts`), стори.
*   **`api/`:** REST/WebSocket виклики (`fetch*`, `update*`) з типізацією з `@sbc/types`; заборонено тримати розлогі `fetch(...)` безпосередньо в JSX-компонентах.
*   **`lib/`:** чисті допоміжні функції (замість безіменних `utils/`).
*   **`config/`:** локальні константи слайсу.
*   **`index.ts`:** обов'язковий Public API реекспорт.
*   **Іменування слайсів:** суворо `kebab-case` (`practice-mode`, `course-import`, `task-workspace`).

---

## 5. Анти-Монолітні Запобіжники, Заборони та Pre-Commit Чеклист

### 5.1. Кількісні пороги декомпозиції
*   **`app/**/page.tsx` та `layout.tsx`:** рекомендовано **≤ 80–100 рядків**, **0 бізнес-логіки** (лише `params`/`searchParams`, `generateMetadata`, провайдери та рендер `<SomeView />`).
*   **`views/<view>/`:** рекомендовано **≤ 250–300 рядків** (координатор віджетів).
*   **`widgets/` та `features/*/ui/`:** при перевищенні **~350–400 рядків** або поєднанні **≥ 2 незалежних підблоків / модалок** компонент підлягає обов'язковій декомпозиції.

### 5.2. Суворі заборони
*   **Заборона `src/components/` та `src/utils/`:** у нових порталах і при створенні нового коду ці директорії суворо заборонені; існуючі підлягають плановому розформуванню.
*   **Zero Local UI Primitives:** заборонено створювати в `apps/*` локальні `fixed inset-0 z-50` модальні оверлеї, саморобні кнопки дій чи статус-бейджі замість `@sbc/ui` (`shared/ui`).
*   **Theme-First (`--sbc-*`):** заборонено хардкодити темні/неконтрастні фони (`bg-slate-900`, `text-white` на нейтральних поверхнях) у примітивах `@sbc/ui` — усі кольори прив'язуються до семантичних CSS-токенів `--sbc-*` із підтримкою Dark/Light (WCAG AA/AAA).
*   **Zero Dead Copies:** при винесенні віджета чи компонента в `@sbc/ui` локальна копія в `apps/*` видаляється в **тому ж комміті**.

### 5.3. Pre-Commit `M-FSD` Чеклист (7 пунктів)
1.  Відсутні нові файли в `components/` або `utils/`.
2.  `app/**/page.tsx` залишається тонким роут-файлом без бізнес-логіки.
3.  У змінах немає нових монолітів 400+ рядків із багатьма незалежними блоками.
4.  Використані `Button`, `Modal`, `ConfirmModal`, `Badge`, `Tooltip`, `DropdownSelect` із `@sbc/ui` замість локальних копій.
5.  Усі імпорти слайсів ідуть через `index.ts` і суворо згори вниз за матрицею залежностей.
6.  Нові UI-елементи коректно працюють у темній і світлій темах через `--sbc-*`.
7.  Усі перенесені в `@sbc/ui` компоненти видалені зі старих локальних шляхів у `apps/*`.

---

## 6. Специфікація Shared UI-Kit (`SBC-315`) та Дорожня Карта Міграції

### 6.1. Базові примітиви у `packages/ui/src/shared/ui/`
*   **`button/Button.tsx`:** варіанти `primary | secondary | accent | danger | outline | ghost`, розміри `xs | sm | md | lg`, стани `isLoading`, `leftIcon`, `rightIcon`, `fullWidth`.
*   **`modal/Modal.tsx` та `modal/ConfirmModal.tsx`:** уніфікований `backdrop-blur-sm`, закриття по `Escape`/бекдропу, слоти `header`/`body`/`footer`, розміри `sm | md | lg | xl`, та спеціалізований `ConfirmModal` (`variant: 'info' | 'warning' | 'danger'`, `warnings?: string[]`, `isConfirming`).
*   **`badge/Badge.tsx`:** варіанти `neutral | info | success | warning | danger | accent`, розміри `xs | sm`, режим `mono` для BKT-відсотків та режимів (`TRAINING`/`GRADED`).
*   **`tooltip/Tooltip.tsx`:** доступний тултіп/поповер на заміну нативних `title` та дубльованих кастомних підказок.
*   **`select/DropdownSelect.tsx`:** доступний тематизований селектор курсів, студентів і політик.

### 6.2. Аудит поточного боргу Smart-BKT-Chain та 3 фази впровадження
*   **Аудит станом на 27.11.2026:** повний FSD має лише `apps/docs`; у `student`/`teacher`/`admin`/`study` присутній гібридний FSD-lite із монолітами (`StudentPortalApp.tsx` 146 KB, `apps/teacher/src/app/page.tsx` ~2 180 рядків, `CourseStudioView.tsx` 103 KB, `MetricsAuditInspector.tsx` 101 KB, `StudyAppClient.tsx` 52 KB), ~20 локальними модалками та застарілими локальними копіями `GameSkillTreeWidget.tsx` / `AnomalyTreeWidget.tsx` у `apps/teacher`.
*   **Фаза 1 (нульовий ризик):** реалізація `packages/ui/src/shared/ui/` на `--sbc-*` токенах та перевірка збірки всіх порталів.
*   **Фаза 2 (точкова міграція):** заміна локальних модалок, кнопок і бейджів по одному порталу з прогоном Playwright E2E після кожного кроку.
*   **Фаза 3 (структурне очищення):** декомпозиція монолітів у `views/` + `widgets/` + `features/`, ліквідація `src/components/` та видалення мертвих дублікатів.
