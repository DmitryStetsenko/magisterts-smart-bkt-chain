# 23. Архітектура `M-FSD` (Monorepo Feature-Sliced Design: Shared Foundation + Portal Slices) та Канонічний Shared UI-Kit (`SBC-315`)

**Дата:** 27 листопада 2026  
**Офіційна назва підходу:** **`M-FSD` (Monorepo Feature-Sliced Design)** — принцип **«Спільний Фундамент + Слайси Порталів» (*Shared Foundation + Portal Slices*)**  
**Статус:** Канонічний архітектурний стандарт проєкту та майбутніх мультипортальних монорепозиторіїв (`Правило 15` у [`.agents/AGENTS.md`](file:///.agents/AGENTS.md))  
**Пов'язані задачі:** `SBC-315` (`[BACKLOG-10]`), `SBC-312`, `SBC-433`, `SBC-434`

---

## 1. Назва, Філософія та Проблема Класичного FSD у Монорепозиторії

**`M-FSD` (Monorepo Feature-Sliced Design)** — це еволюційна адаптація класичної методології Feature-Sliced Design спеціально для мультипортальних Next.js / TypeScript монорепозиторіїв.

Класичний FSD проєктовано під один SPA-застосунок із 7 шарами (`app → processes → pages → widgets → features → entities → shared`). У монорепозиторії з кількома рольовими порталами (у **Smart-BKT-Chain** це 6 фронтендів: `web`, `student`, `teacher`, `study`, `admin`, `docs` + `packages/*`) сліпе копіювання класичного FSD у кожен `apps/*` створює дві системні проблеми:

1. **Дублювання нижніх шарів між порталами:** `shared/ui`, `shared/api`, `shared/config` та базові `entities/` копіюються між апками і розходяться в дизайні, доступності та типах.
2. **Оверхед і сповзання в «FSD-lite»:** замість реальної ізоляції виникає формалізм порожніх папок або гібрид `app/ + features/ + components/`, де вся складна логіка осідає у гігантських файлах-монолітах.

**Ключова ідея `M-FSD`:** винести глобальний фундамент (`shared/*` та міжпортальні `widgets/*`) на рівень **Workspace Packages (`packages/*`)**, а всередині кожного застосунку (`apps/*/src/`) залишити компактні вертикальні шари **Portal Slices** (`app → views → widgets → features → [entities]`).

---

## 2. Аудит Поточного Стану Платформи (Baseline станом на 27.11.2026)

| Застосунок / Пакет | Поточна структура | Відповідність FSD | Ключові прогалини та технічний борг |
| :--- | :--- | :--- | :--- |
| **`apps/docs`** | `app/`, `views/`, `widgets/`, `features/`, `entities/`, `shared/` | Повний класичний FSD | Еталонна шарувата структура, але локальний `shared/ui` ізольований від `@sbc/ui`. |
| **`apps/student`** | `app/`, `features/`, `components/` | Гібридний FSD-lite | Неканонічна папка `components/`; моноліт `StudentPortalApp.tsx` (~146 KB, ~2 740 рядків) поєднує `view`, `widget`, WebSocket, BKT і 3 inline-модалки. |
| **`apps/teacher`** | `app/`, `features/` | Гібридний FSD-lite | Моноліт `app/page.tsx` (~2 180 рядків, 3 inline-модалки) лежить у роутинговому шарі `app/`; `MetricsAuditInspector.tsx` (~101 KB); збереглися мертві копії `GameSkillTreeWidget.tsx` та `AnomalyTreeWidget.tsx` після винесення в `@sbc/ui`. |
| **`apps/admin`** | `app/`, `features/` | Гібридний FSD-lite | Відсутні `views/` і `widgets/`; моноліт `CourseStudioView.tsx` (~103 KB); понад 9 окремих `*Modal.tsx` із дублюванням бекдропу, анімацій та кнопок. |
| **`apps/study`** | `app/`, `components/`, `features/` | Гібридний FSD-lite | Неканонічна папка `components/`; моноліт `StudyAppClient.tsx` (~52 KB); локальна модалка виходу/блокування. |
| **`packages/ui` (`@sbc/ui`)** | `shell/`, `drawer/`, `breadcrumbs/`, `theme/`, `code/`, `skill-graph/`, `analytics/`, `auth/`, `Button.tsx` | Композитні віджети без UI-Kit | Є потужний шар макро-композитів (`AppShellLayout`, `UserProfileDrawer`, `GameSkillTreeWidget`, `CodePlayground`), але немає атомарного `shared/ui/` (`Modal`, `ConfirmModal`, `Badge`, `Tooltip`, `DropdownSelect`); `Button.tsx` — застарілий 20-рядковий компонент із `bg-blue-600` без підтримки токенів `--sbc-*`. |

---

## 3. Дворівнева Архітектура `M-FSD`

### 3.1. Рівень А — `Shared Foundation` (`packages/*` як Міжпортальне Ядро)
Усе, що перевикористовується більш ніж в одному застосунку або задає єдину дизайн-систему й контракти, розміщується в workspace-пакетах:

| Пакет | Роль у `M-FSD` | Вміст |
| :--- | :--- | :--- |
| **`packages/types` (`@sbc/types`)** | Global `shared/model` | Єдині DTO, інтерфейси BKT, завдань, телеметрії, курсів і класів. |
| **`packages/contracts` (`@sbc/contracts`)** | Global `shared/api` | ABI смарт-контрактів і контракти блокчейн-взаємодії. |
| **`packages/routes` (`@sbc/routes`)** | Global `shared/routes` | Єдиний типізований реєстр портів і міжпортальних URL (`resolveStudyUrl` тощо). |
| **`packages/ui` (`@sbc/ui`) → `shared/ui/`** | Global `shared/ui` (UI-Kit) | Атомарні UI-примітиви без бізнес-логіки на дизайн-токенах `--sbc-*`: `Button`, `Modal`, `ConfirmModal`, `Badge`, `Tooltip`, `DropdownSelect`, `Input`. |
| **`packages/ui` (`@sbc/ui`) → `widgets/` (+ `shell/`, `theme/`, `code/`)** | Global `widgets` & `shared/lib` | Міжпортальні композити: `AppShellLayout`, `UserProfileDrawer`, `DrawerSection`, `Breadcrumbs`, `CodePlayground`, `GameSkillTreeWidget`, `AnomalyTreeWidget`, `AuthModal`, `ThemeProvider`. |

### 3.2. Рівень Б — `Portal Slices` (`apps/*/src/` як Локальні Шари Порталу)
Кожен фронтенд-портал будується на компактній 4-шаровій ієрархії (+ опціональний `entities/`):

```text
apps/<portal>/src/
├── app/              # Тільки Next.js App Router (layout.tsx, page.tsx, loading/error, SEO metadata, Providers)
├── views/            # Композиція сторінки маршруту (заміна pages/ для сумісності з Next.js App Router)
├── widgets/          # Самостійні великі UI-блоки, що об'єднують 1+ features або формують секцію екрана
├── features/         # Конкретні сценарії дій користувача (<slice>/ui, model, api, lib, index.ts)
└── entities/         # (Опціонально) Локальні доменні картки/моделі, унікальні виключно для цього порталу
```

---

## 4. Детальний Регламент Правил `M-FSD`

### 4.1. Матриця Дозволених Залежностей (Import Matrix)
Ключове правило `M-FSD`: **залежності напрямлені суворо згори вниз**. Жоден нижчий шар не знає про існування вищого, а слайси одного шару ізольовані один від одного.

| Хто імпортує ↓ \ Що імпортує → | `app/` | `views/` | `widgets/` | `features/` | `entities/` | `@sbc/ui/widgets` | `@sbc/ui/shared/ui` | `@sbc/types` / `@sbc/routes` | Інший `apps/*` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`app/`** | — | ✅ | ✅ *(рідко)* | ❌ | ❌ | ✅ *(Layout/Theme)* | ✅ | ✅ | ❌ |
| **`views/`** | ❌ | ❌ *(між views)* | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **`widgets/`** | ❌ | ❌ | ❌ *(інші widgets)* | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **`features/`** | ❌ | ❌ | ❌ | ❌ *(сусідній слайс)* | ✅ | ❌ | ✅ | ✅ | ❌ |
| **`entities/`** | ❌ | ❌ | ❌ | ❌ | ❌ *(сусідній слайс)* | ❌ | ✅ | ✅ | ❌ |
| **`@sbc/ui/widgets`** | ❌ | ❌ | ❌ | ❌ | ❌ | — | ✅ | ✅ | ❌ |
| **`@sbc/ui/shared/ui`** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ✅ *(тільки базові типи)* | ❌ |

- **Правило Public API (`index.ts`):** імпорт із будь-якого слайсу (`features/practice-mode`, `widgets/task-workspace`, `entities/skill`) дозволяється **виключно через корінь слайсу (`index.ts`)**. Глибокі імпорти на кшталт `features/practice-mode/ui/ModeToggle` ззовні слайсу **заборонені**.
- **Правило `packages/ui`:** імпорт із `@sbc/ui` іде виключно через публічну точку входу пакета (`import { Button, ConfirmModal, AppShellLayout } from '@sbc/ui'`), без прямих шляхів у `packages/ui/src/...`.

### 4.2. Дерево Прийняття Рішень («Куди Покласти Новий Код?»)
1. **Це чистий UI-атом без знання про курси/BKT (кнопка, модалка, бейдж, інпут, тултіп, селект)?** → `packages/ui/src/shared/ui/<component>/`.
2. **Це складний компонент чи віджет, що використовується в 2+ порталах?** → `packages/ui/src/widgets/<widget-name>/` (або тематичний підкаталог `@sbc/ui`) з обов'язковим експортом у `packages/ui/src/index.ts`.
3. **Це тип даних, схема DTO, маршрут або URL-білдер?** → `@sbc/types` або `@sbc/routes`.
4. **Це конкретна користувацька дія/сценарій одного порталу** (перемикач режиму, форма інвайт-коду, інспектор черги перевірки, картка підказок)? → `apps/<portal>/src/features/<kebab-slice>/`.
5. **Це самостійна секція сторінки, яка комбінує кілька фіч або складну панель** (робоча зона завдання, панель аналітики студента, редактор курсу)? → `apps/<portal>/src/widgets/<kebab-widget>/`.
6. **Це екран конкретного URL-маршруту?** → `apps/<portal>/src/views/<kebab-view>/`, а `app/**/page.tsx` залишається тонкою обгорткою.

### 4.3. Правила Сегментів та Іменування
Усередині кожного слайсу (`features/<slice>/`, `widgets/<widget>/`, `entities/<entity>/`) використовуються лише стандартні сегменти FSD:
- `ui/` — React-компоненти (`PascalCase.tsx`), стилі (якщо не вистачає Tailwind + токенів);
- `model/` — локальний стан, хуки (`use*.ts`), типи слайсу (`*.types.ts`), стори Zustand;
- `api/` — функції запитів до REST/WebSocket (`fetch*`, `update*`) із типізацією з `@sbc/types` (заборонено писати сирі `fetch(...)` усередині великих JSX-компонентів без винесення в `api/` або `model/`);
- `lib/` — чисті допоміжні утиліти та трансформації (замість безіменних `utils/`);
- `config/` — локальні константи слайсу;
- `index.ts` — **обов'язковий Public API** реекспорт лише того, що потрібно зовнішнім споживачам.

**Конвенція іменування:**
- Папки слайсів і назви пакетів: **`kebab-case`** (`practice-mode`, `course-import`, `task-workspace`).
- React-компоненти: **`PascalCase.tsx`** (`PracticeModeSwitcher.tsx`, `ConfirmModal.tsx`).
- Хуки: **`useCamelCase.ts`** (`useTelemetry.ts`).

### 4.4. Кількісні Пороги та Анти-Монолітні Запобіжники (De-Monolithization Guards)
Щоб запобігти появі «файлів-богів» на 1 500–2 700 рядків, у `M-FSD` діють чіткі орієнтири декомпозиції:
- **`app/**/page.tsx` та `layout.tsx`:** рекомендовано **≤ 80–100 рядків**, **0 бізнес-логіки** (тільки зчитування `params`/`searchParams`, `generateMetadata`, провайдери та рендер `<SomeView />`).
- **`views/<view>/`:** рекомендовано **≤ 250–300 рядків** — це координатор віджетів, а не місце верстки всіх таблиць і модалок.
- **`widgets/` та `features/*/ui/`:** якщо компонент перевищує **~350–400 рядків** або поєднує **≥ 2 незалежних підблоків / вкладених модалок**, його обов'язково розбивають на менші слайси або підкомпоненти в сегменті.

### 4.5. Заборонені Анти-Патерни (Strict Prohibitions)
1. **Заборона `src/components/` та `src/utils/`:** у нових порталах і при створенні нового коду ці папки суворо заборонені (існуючі в `student`/`study` підлягають поетапному розформуванню у `views/`, `widgets/`, `features/` та `@sbc/ui`).
2. **Zero Local UI Primitives:** заборонено створювати в `apps/*` локальні `fixed inset-0 z-50` модальні оверлеї, саморобні кнопки або статус-бейджі замість `@sbc/ui` (`shared/ui`).
3. **Заборона хардкоду кольорів у `shared/ui`:** усі примітиви UI-Kit будуються виключно на семантичних токенах `--sbc-*` (`--sbc-bg-surface`, `--sbc-bg-subtle`, `--sbc-text-primary`, `--sbc-text-muted`, `--sbc-border-subtle`) із гарантованою контрастністю WCAG AA/AAA у Dark та Light темах.
4. **Zero Dead Copies:** при перенесенні компонента чи віджета в `@sbc/ui` локальна копія в `apps/*` видаляється в **тому ж комміті**.
5. **Заборона крос-портальних імпортів:** `apps/student` ніколи не імпортує напряму з `apps/teacher` чи `apps/study` — тільки через `packages/*`.

### 4.6. Pre-Commit `M-FSD` Audit Checklist
Перед кожним коммітом (або завершенням фічі) перевіряється 7 пунктів:
1. Чи не з'явилася нова папка `components/` або `utils/`?
2. Чи залишився `app/**/page.tsx` тонким роут-обгортником без бізнес-логіки?
3. Чи немає в змінах нового файлу на 400+ рядків із багатьма незалежними блоками?
4. Чи використані `Button`, `Modal`, `ConfirmModal`, `Badge`, `Tooltip`, `DropdownSelect` із `@sbc/ui` замість локальних копій?
5. Чи всі імпорти слайсів ідуть через `index.ts` і строго згори вниз за матрицею?
6. Чи працюють усі нові UI-елементи коректно в обох темах (Dark / Light) через `--sbc-*`?
7. Якщо щось перенесено в `@sbc/ui`, чи видалено старий дубль із `apps/*`?

---

## 5. Специфікація Shared UI-Kit (`SBC-315` у `packages/ui/src/shared/ui/`)

1. **`button/Button.tsx`:** варіанти `primary | secondary | accent | danger | outline | ghost`, розміри `xs | sm | md | lg`, пропси `isLoading`, `leftIcon`, `rightIcon`, `fullWidth`.
2. **`modal/Modal.tsx` & `modal/ConfirmModal.tsx`:** базовий `Modal` (`backdrop-blur-sm`, закриття по `Escape` і кліку на бекдроп, слоти `header` / `body` / `footer`, розміри `sm | md | lg | xl`) та `ConfirmModal` (`variant: 'info' | 'warning' | 'danger'`, `warnings?: string[]`, `isConfirming`, `confirmDisabled`).
3. **`badge/Badge.tsx`:** варіанти `neutral | info | success | warning | danger | accent`, розміри `xs | sm`, режим `mono` для BKT-показників (`85%`), рівнів складності та режимів (`TRAINING`/`GRADED`).
4. **`tooltip/Tooltip.tsx`:** доступний тултіп/поповер на заміну нативних `title` та дубльованих поповерів.
5. **`select/DropdownSelect.tsx`:** тематизований доступний селектор для курсів, студентів і політик.

---

## 6. Безпечна 3-Фазна Стратегія Впровадження (Zero-Regression Rollout)

1. **Фаза 1 — Побудова `packages/ui/src/shared/ui/` (нульовий ризик):** реалізувати `Button`, `Modal`, `ConfirmModal`, `Badge`, `Tooltip`, `DropdownSelect` на базі `--sbc-*`, експортувати через `packages/ui/src/index.ts`, перевірити збірку всіх порталів.
2. **Фаза 2 — Точкова міграція примітивів (по одному порталу з E2E):** замінити локальні `fixed inset-0 z-50` модалки, кнопки та бейджі на `@sbc/ui/shared/ui` із прогоном Playwright E2E після кожного порталу.
3. **Фаза 3 — Декомпозиція монолітів і зачистка спадщини:** розбити `StudentPortalApp.tsx`, `apps/teacher/src/app/page.tsx`, `CourseStudioView.tsx`, `MetricsAuditInspector.tsx` та `StudyAppClient.tsx` на `views/` + `widgets/` + `features/`, ліквідувати `src/components/` та видалити мертві дублікати (зокрема в `apps/teacher/src/features/`).
