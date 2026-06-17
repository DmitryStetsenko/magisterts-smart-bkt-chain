# Smart-BKT-Chain (AlgoProof.org / KnowLedger.org)

> Децентралізована система адаптивного навчання та автоматизованого підтвердження компетенцій на базі Bayesian Knowledge Tracing (BKT) та Blockchain.

---

## 🌟 Основні можливості

- **BKT Engine (Bayesian Knowledge Tracing):** Адаптивна математична модель для оцінки та прогнозування ймовірності засвоєння навичок студентами ($P(L_t)$).
- **LLM Judge & AST-тестування:** Каскадна перевірка практичних завдань (від статичного аналізу коду до семантичного оцінювання за допомогою штучного інтелекту).
- **Децентралізований рівень довіри (Blockchain Layer):**
  - **ERC-721 (dNFT):** Динамічні цифрові дипломи з оновлюваними метаданими (Proof of Maintenance).
  - **ERC-5192 (Soulbound Tokens):** Soulbound-угоди ISA (Income Share Agreement) із механізмом відновлення у разі втрати гаманця.
- **End-to-End Type Safety:** Наскрізна типізація між базою даних (Prisma), смарт-контрактами (Foundry/Hardhat) та фронтендом/бекендом.

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
