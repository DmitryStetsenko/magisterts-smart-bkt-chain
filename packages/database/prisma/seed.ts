import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { PrismaClient, UserRole, TaskDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding for Full JavaScript Course...');

  // 1. Create initial Admin & Student Users
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {
      profile: {
        upsert: {
          create: {
            firstName: 'Дмитро',
            lastName: 'Стеценко',
            bio: 'Студент магістратури, вивчає адаптивні системи',
          },
          update: {
            firstName: 'Дмитро',
            lastName: 'Стеценко',
          },
        },
      },
    },
    create: {
      email: 'student@example.com',
      passwordHash: '$2b$10$Epq9L4.8/aB8xQk/6Qj1yeFw3aEaU5vN1/2v3b4c5d6e7f8g9h0i',
      role: UserRole.STUDENT,
      profile: {
        create: {
          firstName: 'Дмитро',
          lastName: 'Стеценко',
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

  // 2. Create 5 Skill Graph Nodes (Modules)
  const jsBasics = await prisma.skillNode.upsert({
    where: { slug: 'js-basics' },
    update: {
      title: 'Модуль 1: Синтаксис та Базові Конструкції',
      description: 'Типи даних, змінні let/const, арифметичні та логічні оператори, цикли',
    },
    create: {
      slug: 'js-basics',
      title: 'Модуль 1: Синтаксис та Базові Конструкції',
      description: 'Типи даних, змінні let/const, арифметичні та логічні оператори, цикли',
      category: 'Core Fundamentals',
      difficulty: TaskDifficulty.EASY,
    },
  });

  const jsFunctions = await prisma.skillNode.upsert({
    where: { slug: 'js-functions' },
    update: {},
    create: {
      slug: 'js-functions',
      title: 'Модуль 2: Функції та Області Видимості',
      description: 'Arrow functions, замикання (Closures), параметр rest/spread та хойстинг',
      category: 'Core Fundamentals',
      difficulty: TaskDifficulty.EASY,
    },
  });

  const jsCollections = await prisma.skillNode.upsert({
    where: { slug: 'js-collections' },
    update: {},
    create: {
      slug: 'js-collections',
      title: 'Модуль 3: Масиви, Обʼєкти та Методи Обходу',
      description: 'Функціональні методи map, filter, reduce та деструктуризація обʼєктів',
      category: 'Data Structures',
      difficulty: TaskDifficulty.MEDIUM,
    },
  });

  const jsAsync = await prisma.skillNode.upsert({
    where: { slug: 'js-async' },
    update: {
      title: 'Модуль 4: Асинхронне програмування',
      description: 'Event Loop, Promises, async/await та обробка помилок try/catch',
    },
    create: {
      slug: 'js-async',
      title: 'Модуль 4: Асинхронне програмування',
      description: 'Event Loop, Promises, async/await та обробка помилок try/catch',
      category: 'Advanced JS',
      difficulty: TaskDifficulty.HARD,
    },
  });

  const jsOop = await prisma.skillNode.upsert({
    where: { slug: 'js-oop' },
    update: {},
    create: {
      slug: 'js-oop',
      title: 'Модуль 5: ООП та Прототипи',
      description: 'Класи ES6, конструктори, успадкування extends та прототипні звʼязки',
      category: 'Object Oriented',
      difficulty: TaskDifficulty.HARD,
    },
  });

  console.log('🧠 Created 5 skill nodes: js-basics -> js-functions -> js-collections -> js-async -> js-oop');

  // 3. Create Sequential Skill Dependencies (DAG: 1 -> 2 -> 3 -> 4 -> 5)
  const dependencies = [
    { parent: jsBasics, child: jsFunctions },
    { parent: jsFunctions, child: jsCollections },
    { parent: jsCollections, child: jsAsync },
    { parent: jsAsync, child: jsOop },
  ];

  for (const dep of dependencies) {
    await prisma.skillDependency.upsert({
      where: {
        parentSkillId_childSkillId: {
          parentSkillId: dep.parent.id,
          childSkillId: dep.child.id,
        },
      },
      update: {},
      create: {
        parentSkillId: dep.parent.id,
        childSkillId: dep.child.id,
        requiredMastery: 0.95,
      },
    });
  }

  console.log('🔗 Skill graph DAG linked with 0.95 mastery requirement per level!');

  // 4. Create Initial BKT State for Student on first node
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

  // Clean existing tasks for complete fresh course seeding
  await prisma.task.deleteMany({});

  // 5. Create 15 Practical Tasks across 5 Modules

  // ==================== MODULE 1: js-basics ====================
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

  await prisma.task.create({
    data: {
      skillId: jsBasics.id,
      title: 'Обчислення факторіалу',
      description: 'Напишіть функцію `factorial(n)`, яка обчислює факторіал невідʼємного цілого числа $n!$. Наприклад `factorial(5) = 120`.',
      starterCode: 'function factorial(n) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.EASY,
      testCases: {
        create: [
          { input: '[5]', expectedOutput: '120', isSecret: false },
          { input: '[0]', expectedOutput: '1', isSecret: false },
          { input: '[3]', expectedOutput: '6', isSecret: true },
        ],
      },
    },
  });

  // ==================== MODULE 2: js-functions ====================
  await prisma.task.create({
    data: {
      skillId: jsFunctions.id,
      title: 'Піднесення до степеня (Arrow Function)',
      description: 'Напишіть функцію `power(base, exp)`, яка підносить число `base` до степеня `exp`.',
      starterCode: 'const power = (base, exp) => {\n  // Ваш код тут\n};',
      difficulty: TaskDifficulty.EASY,
      testCases: {
        create: [
          { input: '[2, 3]', expectedOutput: '8', isSecret: false },
          { input: '[5, 0]', expectedOutput: '1', isSecret: false },
          { input: '[3, 4]', expectedOutput: '81', isSecret: true },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsFunctions.id,
      title: 'Підрахунок голосних літер',
      description: 'Напишіть функцію `countVowels(str)`, яка підраховує кількість голосних літер (a, e, i, o, u - незалежно від регістру) у рядку.',
      starterCode: 'function countVowels(str) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.EASY,
      testCases: {
        create: [
          { input: '["hello"]', expectedOutput: '2', isSecret: false },
          { input: '["JavaScript"]', expectedOutput: '3', isSecret: false },
          { input: '["bcdfg"]', expectedOutput: '0', isSecret: true },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsFunctions.id,
      title: 'Створення лічильника (Замикання)',
      description: 'Напишіть функцію `createCounter(initial)`, яка повертає нову функцію. Щоразу при виклику повернутої функції вона збільшує значення на 1 та повертає його.',
      starterCode: 'function createCounter(initial) {\n  let count = initial;\n  return function() {\n    // Ваш код тут\n  };\n}',
      difficulty: TaskDifficulty.MEDIUM,
      testCases: {
        create: [
          { input: '[10]', expectedOutput: '11', isSecret: false },
          { input: '[0]', expectedOutput: '1', isSecret: false },
          { input: '[-5]', expectedOutput: '-4', isSecret: true },
        ],
      },
    },
  });

  // ==================== MODULE 3: js-collections ====================
  await prisma.task.create({
    data: {
      skillId: jsCollections.id,
      title: 'Фільтрація парних елементів',
      description: 'Напишіть функцію `filterEvens(numbers)`, яка приймає масив чисел і повертає новий масив тільки з парними числами.',
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
      skillId: jsCollections.id,
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

  await prisma.task.create({
    data: {
      skillId: jsCollections.id,
      title: 'Пошук найдовшого слова',
      description: 'Напишіть функцію `findLongestWord(words)`, яка приймає масив рядків і повертає найдовше слово.',
      starterCode: 'function findLongestWord(words) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.MEDIUM,
      testCases: {
        create: [
          { input: '[["apple", "banana", "kiwi"]]', expectedOutput: '"banana"', isSecret: false },
          { input: '[["a", "ab", "abc"]]', expectedOutput: '"abc"', isSecret: false },
          { input: '[["cat", "dog"]]', expectedOutput: '"cat"', isSecret: true },
        ],
      },
    },
  });

  // ==================== MODULE 4: js-async ====================
  await prisma.task.create({
    data: {
      skillId: jsAsync.id,
      title: 'Асинхронне отримання профілю користувача',
      description: 'Напишіть асинхронну функцію `fetchUser(id)`, яка за допомогою `await` симулює асинхронну затримку через Promise та повертає обʼєкт `{ id, name: "User_" + id }`.',
      starterCode: 'async function fetchUser(id) {\n  await new Promise(r => setTimeout(r, 10));\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.HARD,
      testCases: {
        create: [
          { input: '[1]', expectedOutput: '{"id":1,"name":"User_1"}', isSecret: false },
          { input: '[42]', expectedOutput: '{"id":42,"name":"User_42"}', isSecret: false },
          { input: '[99]', expectedOutput: '{"id":99,"name":"User_99"}', isSecret: true },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsAsync.id,
      title: 'Паралельне завантаження кількох користувачів',
      description: 'Напишіть асинхронну функцію `fetchAllUsers(ids)`, яка приймає масив `ids` і за допомогою `Promise.all` повертає масив імен `["User_1", "User_2", ...]`.',
      starterCode: 'async function fetchAllUsers(ids) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.HARD,
      testCases: {
        create: [
          { input: '[[1, 2]]', expectedOutput: '["User_1","User_2"]', isSecret: false },
          { input: '[[5]]', expectedOutput: '["User_5"]', isSecret: false },
          { input: '[[]]', expectedOutput: '[]', isSecret: true },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsAsync.id,
      title: 'Безпечне оброблення асинхронної помилки',
      description: 'Напишіть асинхронну функцію `safeFetch(shouldFail)`, яка повертає `"success"`, якщо `shouldFail` дорівнює `false`, або повертає `"error"` у блоці `catch`, якщо виникає помилка.',
      starterCode: 'async function safeFetch(shouldFail) {\n  try {\n    if (shouldFail) throw new Error("Failed");\n    return "success";\n  } catch {\n    // Ваш код тут\n  }\n}',
      difficulty: TaskDifficulty.HARD,
      testCases: {
        create: [
          { input: '[false]', expectedOutput: '"success"', isSecret: false },
          { input: '[true]', expectedOutput: '"error"', isSecret: false },
        ],
      },
    },
  });

  // ==================== MODULE 5: js-oop ====================
  await prisma.task.create({
    data: {
      skillId: jsOop.id,
      title: 'Клас Банківського Рахунку (BankAccount)',
      description: 'Напишіть функцію `createAccount(initialBalance)`, яка повертає обʼєкт із методами `deposit(amount)`, `withdraw(amount)` та `getBalance()`.',
      starterCode: 'function createAccount(initialBalance) {\n  let balance = initialBalance;\n  return {\n    deposit(amount) { balance += amount; },\n    withdraw(amount) { balance -= amount; },\n    getBalance() { return balance; }\n  };\n}',
      difficulty: TaskDifficulty.HARD,
      testCases: {
        create: [
          { input: '[100]', expectedOutput: '100', isSecret: false },
          { input: '[0]', expectedOutput: '0', isSecret: false },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsOop.id,
      title: 'Конструктор Користувача з форматуванням',
      description: 'Напишіть функцію `formatUser(firstName, lastName)`, яка повертає обʼєкт з методом `getFullName()`, що повертає `"firstName lastName"`.',
      starterCode: 'function formatUser(firstName, lastName) {\n  return {\n    getFullName() { return `${firstName} ${lastName}`; }\n  };\n}',
      difficulty: TaskDifficulty.HARD,
      testCases: {
        create: [
          { input: '["John", "Doe"]', expectedOutput: '"John Doe"', isSecret: false },
          { input: '["Дмитро", "Стеценко"]', expectedOutput: '"Дмитро Стеценко"', isSecret: false },
        ],
      },
    },
  });

  console.log('📝 Created 14 practical tasks across 5 Modules of Full JavaScript Course!');
  console.log('✅ Full Course seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
