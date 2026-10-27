# ⚡ Документація Ядра Бекенду «Smart-BKT-Chain API & Engine» (`apps/api`)

Цей документ визначає повну інженерну архітектуру ядра бекенд-сервісу **«Smart-BKT-Chain API & Engine» (`apps/api`)**, що функціонує на порту `3000`.

---

## 🎯 1. Призначення та Архітектурний Патерн

Бекенд побудовано за принципами **Гексагональної Архітектури (Ports & Adapters)** з чітким розділенням на:
1. **Domain Layer:** чиста бізнес-логіка розрахунку Bayesian Knowledge Tracing (`BktEngine`), планувальника завдань (`TaskSequencer`) та аналізатора телеметрії (`TelemetryService`).
2. **Application Layer:** сервіси взаємодії, оцінювання спроб (`EvaluationService`) та черги ручної перевірки робіт (`ReviewQueueService`).
3. **Infrastructure / Adapters:**
   - *HTTP Inbound:* NestJS контролери REST API із Swagger OpenAPI документацією (`/api/v1/*`).
   - *WebSocket Inbound:* шлюзи реального часу Socket.io (`/telemetry`, `/reviews`).
   - *Database Outbound:* Prisma ORM для роботи з реляційною базою даних PostgreSQL.
   - *Blockchain Outbound:* клієнти взаємодії з EVM смарт-контрактами (Hardhat / ethers.js).

---

## ⚙️ 2. Ключові Модулі та REST/WS Ендпоінти

| Модуль | Маршрут | Опис |
| :--- | :--- | :--- |
| **Courses** | `GET /api/v1/courses` | Отримання переліку курсів, структури DAG та вузлів навичок |
| **Tasks** | `GET /api/v1/tasks/recommended` | Адаптивний підбір наступної задачі через секвенсор під поточний стан BKT |
| **Submissions** | `POST /api/v1/tasks/evaluate` | Оцінювання спроби учня, оновлення $P(L_n)$, перевірка тест-кейсів |
| **Reviews** | `GET /api/v1/reviews/queue` | Черга ручної перевірки завдань викладачем |
| **Telemetry** | `WS /telemetry` | Прийом стрімінгу подій клавіатурного вводу в реальному часі |

---

## 🛠️ 3. Технічний Стек та Запуск
- **Стек:** NestJS, TypeScript, Prisma ORM, Socket.io, Jest.
- **Запуск у режимі розробки:**
  ```bash
  npm run dev:api
  ```
  *(Доступно за адресою: [http://localhost:3000](http://localhost:3000), Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs))*.
- **Production-збірка:**
  ```bash
  npm run build:api
  ```
