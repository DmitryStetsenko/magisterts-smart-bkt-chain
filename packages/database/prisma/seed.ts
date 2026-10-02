import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { PrismaClient, UserRole, TaskDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Mini-Course...');

  // 1. Create initial Admin & Student Users
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      passwordHash: '$2b$10$Epq9L4.8/aB8xQk/6Qj1yeFw3aEaU5vN1/2v3b4c5d6e7f8g9h0i', // mock hash
      role: UserRole.STUDENT,
      profile: {
        create: {
          firstName: 'Олександр',
          lastName: 'Коваленко',
          bio: 'Студент магістратури, вивчає адаптивні системи',
        },
      },
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      passwordHash: '$2b$10$Epq9L4.8/aB8xQk/6Qj1yeFw3aEaU5vN1/2v3b4c5d6e7f8g9h0i',
      role: UserRole.TEACHER,
      profile: {
        create: {
          firstName: 'Дмитро',
          lastName: 'Стеценко',
          bio: 'Викладач курсу Адаптивних систем та Web3',
        },
      },
    },
  });

  console.log(`👤 Users seeded: Student (${student.email}), Teacher (${teacher.email})`);

  // 2. Create Skill Graph Nodes (Mini-Course)
  const jsBasics = await prisma.skillNode.upsert({
    where: { slug: 'js-basics' },
    update: {},
    create: {
      slug: 'js-basics',
      title: 'Модуль 1: Основи JavaScript та Синтаксис',
      description: 'Базові типи даних, змінні let/const, арифметичні оператори та функції',
      category: 'Programming Languages',
      difficulty: TaskDifficulty.EASY,
    },
  });

  const jsArrays = await prisma.skillNode.upsert({
    where: { slug: 'js-arrays' },
    update: {},
    create: {
      slug: 'js-arrays',
      title: 'Модуль 2: Масиви та Методи обходу (map/filter/reduce)',
      description: 'Робота з масивами та функціями вищого порядку у функціональному стилі',
      category: 'Data Structures',
      difficulty: TaskDifficulty.MEDIUM,
    },
  });

  const jsAsync = await prisma.skillNode.upsert({
    where: { slug: 'js-async' },
    update: {},
    create: {
      slug: 'js-async',
      title: 'Модуль 3: Асинхронне програмування (Promises & async/await)',
      description: 'Обробка асинхронних подій, обгортки Promises та HTTP-запитів в JS',
      category: 'Advanced JS',
      difficulty: TaskDifficulty.HARD,
    },
  });

  console.log('🧠 Created mini-course skill nodes: js-basics -> js-arrays -> js-async');

  // 3. Create Skill Dependencies (DAG)
  await prisma.skillDependency.upsert({
    where: {
      parentSkillId_childSkillId: {
        parentSkillId: jsBasics.id,
        childSkillId: jsArrays.id,
      },
    },
    update: {},
    create: {
      parentSkillId: jsBasics.id,
      childSkillId: jsArrays.id,
      requiredMastery: 0.95,
    },
  });

  await prisma.skillDependency.upsert({
    where: {
      parentSkillId_childSkillId: {
        parentSkillId: jsArrays.id,
        childSkillId: jsAsync.id,
      },
    },
    update: {},
    create: {
      parentSkillId: jsArrays.id,
      childSkillId: jsAsync.id,
      requiredMastery: 0.95,
    },
  });

  console.log('🔗 Skill graph DAG linked: js-basics (0.95) -> js-arrays (0.95) -> js-async');

  // 4. Create Initial BKT State for Student
  await prisma.bktState.upsert({
    where: {
      userId_skillId: {
        userId: student.id,
        skillId: jsBasics.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      skillId: jsBasics.id,
      pMastery: 0.5,
      pTransit: 0.2,
      pSlip: 0.1,
      pGuess: 0.2,
    },
  });

  // Clean existing tasks for idempotency
  await prisma.task.deleteMany({ where: {} });

  // 5. Create Mini-Course Practical Tasks & Test Cases
  // Module 1 Tasks
  await prisma.task.create({
    data: {
      skillId: jsBasics.id,
      title: 'Сума двох чисел',
      description: 'Напишіть функцію `sum(a, b)`, яка повертає суму двох чисел.',
      starterCode: 'function sum(a, b) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.EASY,
      testCases: {
        create: [
          { input: '[2, 3]', expectedOutput: '5', isSecret: false },
          { input: '[-1, 1]', expectedOutput: '0', isSecret: false },
          { input: '[100, 200]', expectedOutput: '300', isSecret: true },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsBasics.id,
      title: 'Перевірка парності числа',
      description: 'Напишіть функцію `isEven(n)`, яка повертає `true`, якщо число парне, і `false` у протилежному випадку.',
      starterCode: 'function isEven(n) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.EASY,
      testCases: {
        create: [
          { input: '[4]', expectedOutput: 'true', isSecret: false },
          { input: '[7]', expectedOutput: 'false', isSecret: false },
          { input: '[0]', expectedOutput: 'true', isSecret: true },
        ],
      },
    },
  });

  // Module 2 Tasks
  await prisma.task.create({
    data: {
      skillId: jsArrays.id,
      title: 'Фільтрація парних елементів',
      description: 'Напишіть функцію `filterEvens(numbers)`, яка приймає масив чисел і повертає масив тільки з парними числами.',
      starterCode: 'function filterEvens(numbers) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.MEDIUM,
      testCases: {
        create: [
          { input: '[[1, 2, 3, 4, 5, 6]]', expectedOutput: '[2,4,6]', isSecret: false },
          { input: '[[1, 3, 5]]', expectedOutput: '[]', isSecret: false },
          { input: '[[10, 21, 32]]', expectedOutput: '[10,32]', isSecret: true },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsArrays.id,
      title: 'Розрахунок загальної вартості кошика',
      description: 'Напишіть функцію `calcTotal(items)`, яка обчислює суму властивостей `price` у масиві обʼєктів.',
      starterCode: 'function calcTotal(items) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.MEDIUM,
      testCases: {
        create: [
          { input: '[[{"price": 10}, {"price": 20}]]', expectedOutput: '30', isSecret: false },
          { input: '[[]]', expectedOutput: '0', isSecret: false },
          { input: '[[{"price": 100}]]', expectedOutput: '100', isSecret: true },
        ],
      },
    },
  });

  // Module 3 Tasks
  await prisma.task.create({
    data: {
      skillId: jsAsync.id,
      title: 'Отримання профілю користувача (Async)',
      description: 'Напишіть асинхронну функцію `fetchUser(id)`, яка повертає простій обʼєкт `{ id, name: "User_" + id }`.',
      starterCode: 'async function fetchUser(id) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.HARD,
      testCases: {
        create: [
          { input: '[1]', expectedOutput: '{"id":1,"name":"User_1"}', isSecret: false },
          { input: '[42]', expectedOutput: '{"id":42,"name":"User_42"}', isSecret: false },
        ],
      },
    },
  });

  console.log('📝 Created 5 practical tasks across all 3 modules of the Mini-Course!');
  console.log('✅ Mini-Course seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
