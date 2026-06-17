# Smart-BKT-Chain

> Децентралізована система адаптивного навчання та автоматизованого підтвердження компетенцій на базі Bayesian Knowledge Tracing (BKT) та Blockchain.

---

## 🌟 Основні можливості

- **Adaptive BKT Engine (Адаптивний BKT):** Математична модель моделювання знань на основі Bayesian Knowledge Tracing, де ймовірності випадкової помилки $P(S)$ (Slip) та вгадування $P(G)$ (Guess) динамічно адаптуються під історію успішності та поведінковий профіль конкретного студента.
- **Поведінкова телеметрія та верифікація (Behavioral Analytics):** Перехоплення та аналіз процесу написання коду в реальному часі (динаміка натискання клавіш, логічні паузи, обсяги copy-paste). Розрахунок коефіцієнта довіри (Trust Coefficient) для запобігання академічній нечесності та використання ШІ-генераторів.
- **LLM Judge & AST-тестування:** Каскадна перевірка практичних завдань з програмування: від швидкого статичного аналізу структури коду (AST) та виконання unit-тестів до глибокого семантичного аудиту та детального текстового фідбеку за допомогою Gemini API.
- **Децентралізований рівень довіри (Blockchain Layer):**
  - **ERC-721 (dNFT):** Динамічні цифрові дипломи зі змінними метаданими (динамічний рендеринг прогресу навичок — Proof of Maintenance) та безгазовими транзакціями (gasless meta-transactions).
  - **ERC-5192 (Soulbound Tokens):** Непередавані цифрові сертифікати та угоди ISA (Income Share Agreement) зі смарт-контрактом відновлення (SBT Recovery) у разі компрометації чи втрати гаманця.
- **End-to-End Type Safety:** Наскрізна типізація між базою даних (Prisma), смарт-контрактами (Solidity ABI/Viem) та API (NestJS/Next.js) для мінімізації помилок на етапі компіляції.

---

## 🏗️ Структура монорепозиторію

Репозиторій організований як монорепозиторій на базі **npm Workspaces / Turborepo**:

```text
smart-bkt-chain/
├── apps/
│   ├── web/                  # Next.js Frontend (Портал студента, викладача, рекрутера)
│   ├── admin/                # Next.js Admin Panel (CRM та конструктор графів знань)
│   ├── api/                  # NestJS Backend (Ядро BKT, Auth, Web3 релейєри)
│   └── docs/                 # Next.js Docs (Цей сайт документації)
├── packages/
│   ├── ui/                   # Спільні UI-компоненти та Storybook (Tailwind + shadcn/ui)
│   ├── database/             # Prisma Schema та клієнт PostgreSQL
│   ├── contracts/            # Solidity смарт-контракти (Hardhat/Foundry)
│   └── types/                # Спільні інтерфейси та DTO
```

---

## 🛠️ Технологічний стек

- **Frontend:** Next.js 16 (React 19), Tailwind CSS, shadcn/ui, TanStack Query, Zustand, RainbowKit & Wagmi (Web3).
- **Backend:** NestJS, CQRS, BullMQ/Redis (черги), Prisma ORM, PostgreSQL.
- **Blockchain:** Solidity, Arbitrum/Optimism Sepolia, Foundry, Viem.
- **Тестування та ізоляція:** Storybook 8 (Component-Driven Development), Jest, Foundry Fuzzing.

---

## 🚀 Швидкий запуск розробника

1. **Клонування репозиторію:**
   ```bash
   git clone https://github.com/DmitryStetsenko/magisterts-smart-bkt-chain.git
   cd smart-bkt-chain
   ```

2. **Запуск локальної бази даних (PostgreSQL):**
   ```bash
   docker-compose up -d
   ```

3. **Встановлення залежностей та налаштування Prisma:**
   ```bash
   npm install
   npx prisma migrate dev
   ```

4. **Запуск усіх додатків у режимі розробки:**
   ```bash
   npm run dev
   ```

---

## 📄 Ліцензія

Цей проєкт є частиною науково-практичного дослідження магістранта. Усі права захищено.
