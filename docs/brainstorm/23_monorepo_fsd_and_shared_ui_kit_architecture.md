# 23. Адаптація Feature-Sliced Design (FSD) до Монорепозиторію та Канонічний Shared UI-Kit (`SBC-315`)

**Дата:** 27 листопада 2026  
**Статус:** Архітектурний стандарт проєкту та майбутніх мультипортальних систем (`Rule 15` у [`.agents/AGENTS.md`](file:///.agents/AGENTS.md))  
**Пов'язані задачі:** `SBC-315` (`[BACKLOG-10]`), `SBC-312`, `SBC-433`, `SBC-434`

---

## 1. Контекст і Чому Класичний FSD не Працює «в Лоб» у Монорепозиторії

Класичний **Feature-Sliced Design (FSD)** спроєктовано під один ізольований фронтенд-застосунок із 7 шарами (`app → processes → pages → widgets → features → entities → shared`). У мультипортальному монорепозиторії на кшталт **Smart-BKT-Chain** (6 Next.js застосунків: `web`, `student`, `teacher`, `study`, `admin`, `docs` + спільні `packages/*`) механічне копіювання класичного FSD у кожен `apps/*` створює дві системні проблеми:

1. **Дублювання нижніх шарів між порталами:** `shared/ui`, `shared/api`, `shared/config` та базові `entities/` починають копіюватися з однієї апки в іншу або розбігаються в стилях/типах.
2. **Оверхед і «роздування» порожніх шарів:** замість реальної модульності з'являється формалізм або, навпаки, «гібридний FSD-lite» (`app/` + `features/` + `components/`), у якому вся логіка накопичується у гігантських файлах-монолітах.

---

## 2. Аудит Поточного Стану Платформи (Baseline станом на 27.11.2026)

| Застосунок / Пакет | Поточна структура | Відповідність FSD | Ключові прогалини та борг |
| :--- | :--- | :--- | :--- |
| **`apps/docs`** | `app/`, `views/`, `widgets/`, `features/`, `entities/`, `shared/` | Повний класичний FSD | Еталонна шарувата структура, але локальний `shared/ui` ізольований від `@sbc/ui`. |
| **`apps/student`** | `app/`, `features/`, `components/` | Гібридний FSD-lite | Неканонічна папка `components/`; моноліт `StudentPortalApp.tsx` (~146 KB, ~2 740 рядків) поєднує `view`, `widget`, WebSocket, BKT і 3 inline-модалки. |
| **`apps/teacher`** | `app/`, `features/` | Гібридний FSD-lite | Моноліт `app/page.tsx` (~2 180 рядків, 3 inline-модалки) лежить у роутинговому шарі `app/`; `MetricsAuditInspector.tsx` (~101 KB); збереглися мертві копії `GameSkillTreeWidget.tsx` та `AnomalyTreeWidget.tsx` після винесення в `@sbc/ui`. |
| **`apps/admin`** | `app/`, `features/` | Гібридний FSD-lite | Відсутні `views/` і `widgets/`; моноліт `CourseStudioView.tsx` (~103 KB); понад 9 окремих `*Modal.tsx` із дублюванням бекдропу, анімацій та кнопок. |
| **`apps/study`** | `app/`, `components/`, `features/` | Гібридний FSD-lite | Неканонічна папка `components/`; моноліт `StudyAppClient.tsx` (~52 KB); локальна модалка виходу/блокування. |
| **`packages/ui` (`@sbc/ui`)** | `shell/`, `drawer/`, `breadcrumbs/`, `theme/`, `code/`, `skill-graph/`, `analytics/`, `auth/`, `Button.tsx` | Композитні віджети без UI-Kit | Є потужний шар макро-композитів (`AppShellLayout`, `UserProfileDrawer`, `GameSkillTreeWidget`, `CodePlayground`), але немає атомарного `shared/ui/` (`Modal`, `ConfirmModal`, `Badge`, `Tooltip`, `DropdownSelect`); `Button.tsx` — застарілий 20-рядковий компонент із `bg-blue-600` без підтримки токенів `--sbc-*`. |

---

## 3. Цільова Модель: Дворівневий Монорепозиторний FSD (Monorepo-Adapted FSD)

Замість дублювання 6–7 шарів у кожному порталі, архітектура поділяється на **два взаємодоповнювальні рівні**:

### 3.1. Рівень А — Міжпортальний Фундамент (`packages/*` як Global Foundation)
Усе, що використовується більш ніж у одному застосунку або визначає єдину дизайн-систему екосистеми, піднімається в workspace-пакети:

- **`packages/types` (`@sbc/types`) + `packages/contracts`** → **Global `shared/model` & `shared/api`** (єдині DTO, доменні типи, схеми API та Web3 ABI).
- **`packages/routes` (`@sbc/routes`)** → **Global `shared/routes` & `shared/config`** (типізовані міжпортальні посилання, порти, константи маршрутів).
- **`packages/ui` (`@sbc/ui`)** → розділяється на два чіткі публічні підрівні:
  1. **`packages/ui/src/shared/ui/` (Атомарний UI-Kit):** чисті UI-примітиви без бізнес-логіки (`Button`, `Modal`, `ConfirmModal`, `Badge`, `Tooltip`, `DropdownSelect`, `Input`), побудовані **виключно на семантичних дизайн-токенах** (`--sbc-*`) із гарантованою сумісністю з Dark/Light темами та WCAG AA/AAA.
  2. **`packages/ui/src/widgets/` + `shared/theme/`, `shared/code/`, `shell/`:** міжпортальні композитні віджети (`AppShellLayout`, `UserProfileDrawer`, `DrawerSection`, `Breadcrumbs`, `CodePlayground`, `GameSkillTreeWidget`, `AnomalyTreeWidget`, `AuthModal`).

### 3.2. Рівень Б — Локальні Шари Застосунку (`apps/*/src/`)
Усередині кожного Next.js застосунку (`student`, `teacher`, `study`, `admin`, `web`, `docs`) використовується компактна **4-шарова структура** (+ опціональний `entities/` для суто локальних моделей):

```text
apps/<portal>/src/
├── app/              # Лише Next.js App Router (layout.tsx, page.tsx, metadata, Providers)
├── views/            # Композиція сторінок/екранів (заміна Next.js pages/, щоб уникнути конфлікту маршрутів)
├── widgets/          # Самостійні великі UI-блоки зі станом/координацією фіч (TaskWorkspace, StudentAnalyticsPanel)
├── features/         # Конкретні сценарії дій (ui/, model/, lib/, api/, обов'язковий index.ts)
└── entities/         # (Опціонально) Локальні доменні картки/моделі, унікальні тільки для цього порталу
```

---

## 4. Чотири Жорсткі Архітектурні Інваріанти

1. **Заборона папки `src/components/`:**
   - У FSD не існує безликої папки `components/` як звалища файлів без ролі.
   - Атомарний UI-елемент → у `packages/ui/src/shared/ui/`.
   - Складний блок сторінки → у `widgets/`.
   - Конкретна бізнес-дія → у `features/<slice>/ui/`.

2. **Однонаправлений потік залежностей (Strict Top-Down Imports & Public API):**
   - Дозволений напрямок імпортів: `app → views → widgets → features → entities → shared (@sbc/ui, @sbc/types, @sbc/routes)`.
   - Заборонено перехресні імпорти між слайсами одного шару (`features/A` не імпортує `features/B`; їх поєднує `widgets/` або `views/`).
   - Усі імпорти зі слайсу (`features/*`, `widgets/*`, `entities/*`) виконуються через **Public API (`index.ts`)** без глибоких шляхів у внутрішню реалізацію.

3. **Zero Local UI Primitives (Єдиний UI-Kit у `@sbc/ui`):**
   - Заборонено створювати в `apps/*` локальні `fixed inset-0 z-50` модальні оверлеї, саморобні кнопки підтвердження чи статус-бейджі з дублюванням Tailwind-класів.
   - Усі нові діалоги, бейджі, тултіпи та селектори використовуються з `@sbc/ui` (`shared/ui`), що гарантує візуальну цілісність та автоматичну підтримку тем.

4. **Тонкий `app/` + Декомпозиція Монолітів + Zero Dead Copies:**
   - Файли `app/**/page.tsx` залишаються тонкими (орієнтовно до 50–100 рядків) і лише передають параметри у `views/*`.
   - Файл у `views/` чи `widgets/` не перетворюється на «божественний компонент» на 1 000+ рядків: поява 2+ незалежних зон відповідальності вимагає декомпозиції у `widgets/` та `features/`.
   - При винесенні компонента або віджета у `@sbc/ui` локальна копія в `apps/*` видаляється в тому ж комміті.

---

## 5. Специфікація Shared UI-Kit (`SBC-315` у `packages/ui/src/shared/ui/`)

Усі компоненти будуються на CSS-змінних `--sbc-bg-surface`, `--sbc-bg-subtle`, `--sbc-text-primary`, `--sbc-text-muted`, `--sbc-border-subtle` (з автоматичною інверсією у `light-theme.css`) без хардкодних `bg-slate-900` або `text-white` на нейтральних поверхнях:

1. **`button/Button.tsx`:**
   - Варіанти: `primary | secondary | accent | danger | outline | ghost`.
   - Розміри: `xs | sm | md | lg`.
   - Пропси: `isLoading`, `leftIcon`, `rightIcon`, `fullWidth`, повне проксі `ButtonHTMLAttributes`.
2. **`modal/Modal.tsx` & `modal/ConfirmModal.tsx`:**
   - Базовий `Modal`: React Portal (за потреби), єдиний backdrop (`backdrop-blur-sm`), закриття по `Escape` та кліку по бекдропу (`closeOnOverlayClick`), слоти `header` / `body` / `footer`, розміри `sm | md | lg | xl`.
   - `ConfirmModal`: типова обгортка для небезпечних/критичних дій (`variant: 'info' | 'warning' | 'danger'`, масив застережень `warnings?: string[]`, стани `isConfirming`, `confirmDisabled`). Одразу закриває потребу в саморобних модалках у `student`, `teacher`, `study`, `admin`.
3. **`badge/Badge.tsx`:**
   - Семантичні варіанти: `neutral | info | success | warning | danger | accent`.
   - Розміри (`xs | sm`) та компактний режим `mono` для BKT-відсотків (`85%`), складності (`EASY`/`MEDIUM`/`HARD`) і режимів (`TRAINING`/`GRADED`).
4. **`tooltip/Tooltip.tsx`:**
   - Доступний тултіп/поповер для метрик, формул BKT і заблокованих кнопок (усуває нативні `title` та дублювання кастомних поповерів).
5. **`select/DropdownSelect.tsx`:**
   - Стилізований під тему доступний селектор для вибору курсу, студента, політики чи фільтрів без нативних браузерних стрибків стилю.

---

## 6. Безпечна 3-Фазна Стратегія Впровадження (Zero-Regression Rollout)

1. **Фаза 1 — Створення `packages/ui/src/shared/ui/` (нульовий ризик для робочих порталів):**
   - Розробити `Button`, `Modal`, `ConfirmModal`, `Badge`, `Tooltip`, `DropdownSelect` на базі `--sbc-*` токенів.
   - Експортувати їх із `packages/ui/src/index.ts`, зберігаючи тимчасову зворотну сумісність.
   - Перевірити збірку `@sbc/ui` та всіх порталів (`build:student`, `build:teacher`, `build:study`, `build:admin`, `build:docs`).
2. **Фаза 2 — Точкова міграція примітивів (по одному порталу з E2E-перевіркою):**
   - Замінити локальні `fixed inset-0 z-50` модалки підтвердження на `ConfirmModal` з `@sbc/ui` (спочатку `apps/study` та `apps/student`, потім `apps/teacher` та `apps/admin`).
   - Уніфікувати статус-бейджі та основні кнопки дій, проганяючи Playwright E2E після кожного порталу.
3. **Фаза 3 — Декомпозиція монолітів і зачистка спадщини:**
   - Розбити `StudentPortalApp.tsx`, `apps/teacher/src/app/page.tsx`, `CourseStudioView.tsx`, `MetricsAuditInspector.tsx` та `StudyAppClient.tsx` на `views/` + `widgets/` + `features/`.
   - Ліквідувати папки `src/components/` та видалити мертві локальні дублікати (на кшталт `apps/teacher/src/features/skill-graph/ui/GameSkillTreeWidget.tsx` і `AnomalyTreeWidget.tsx`).
