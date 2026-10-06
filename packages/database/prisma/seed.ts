import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { PrismaClient, UserRole, TaskDifficulty, TaskType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Multi-Discipline Database Seeding (JS, English B2, Law)...');

  // 1. Create Users
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
          bio: 'Викладач адаптивних систем та Web3',
        },
      },
    },
  });

  console.log(`👤 Users seeded: Student (${student.email}), Teacher (${teacher.email})`);

  // Clean old data for fresh multi-course initialization
  await prisma.submission.deleteMany({});
  await prisma.bktHistory.deleteMany({});
  await prisma.bktState.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.skillDependency.deleteMany({});
  await prisma.skillNode.deleteMany({});
  await prisma.course.deleteMany({});

  // ==================== COURSE 1: JAVASCRIPT PROGRAMMING ====================
  const courseJs = await prisma.course.create({
    data: {
      slug: 'js-dev',
      title: 'JavaScript & Web Engineering',
      description: 'Повний курс розробки на JS: від синтаксису до асинхронності та ООП',
      icon: 'code',
    },
  });

  const jsBasics = await prisma.skillNode.create({
    data: {
      courseId: courseJs.id,
      slug: 'js-basics',
      title: 'Модуль 1: Синтаксис та База',
      description: 'Типи даних, змінні let/const, логічні оператори та цикли',
      category: 'Core Programming',
      difficulty: TaskDifficulty.EASY,
    },
  });

  const jsFunctions = await prisma.skillNode.create({
    data: {
      courseId: courseJs.id,
      slug: 'js-functions',
      title: 'Модуль 2: Функції & Closures',
      description: 'Arrow functions, замикання, rest/spread та хойстинг',
      category: 'Core Programming',
      difficulty: TaskDifficulty.EASY,
    },
  });

  const jsCollections = await prisma.skillNode.create({
    data: {
      courseId: courseJs.id,
      slug: 'js-collections',
      title: 'Модуль 3: Масиви & Обʼєкти',
      description: 'Функціональні методи map, filter, reduce та обхід обʼєктів',
      category: 'Data Structures',
      difficulty: TaskDifficulty.MEDIUM,
    },
  });

  const jsAsync = await prisma.skillNode.create({
    data: {
      courseId: courseJs.id,
      slug: 'js-async',
      title: 'Модуль 4: Асинхронність JS',
      description: 'Event Loop, Promises, async/await та try/catch',
      category: 'Advanced JS',
      difficulty: TaskDifficulty.HARD,
    },
  });

  const jsOop = await prisma.skillNode.create({
    data: {
      courseId: courseJs.id,
      slug: 'js-oop',
      title: 'Модуль 5: ООП & Прототипи',
      description: 'Класи ES6, extends, прототипи та інкапсуляція',
      category: 'Object Oriented',
      difficulty: TaskDifficulty.HARD,
    },
  });

  // JS Dependencies
  const jsDeps = [
    { parent: jsBasics, child: jsFunctions },
    { parent: jsFunctions, child: jsCollections },
    { parent: jsCollections, child: jsAsync },
    { parent: jsAsync, child: jsOop },
  ];
  for (const dep of jsDeps) {
    await prisma.skillDependency.create({
      data: { parentSkillId: dep.parent.id, childSkillId: dep.child.id, requiredMastery: 0.95 },
    });
  }

  // JS Tasks
  await prisma.task.create({
    data: {
      skillId: jsBasics.id,
      taskType: TaskType.CODE,
      title: 'Сума двох чисел',
      description: 'Напишіть функцію `sum(a, b)`, яка повертає суму двох чисел.',
      starterCode: 'function sum(a, b) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.EASY,
      testCases: {
        create: [
          { input: '[2, 3]', expectedOutput: '5', isSecret: false },
          { input: '[-1, 1]', expectedOutput: '0', isSecret: false },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsBasics.id,
      taskType: TaskType.CODE,
      title: 'Перевірка парності числа',
      description: 'Напишіть функцію `isEven(n)`, яка повертає `true`, якщо число парне, та `false` якщо ні.',
      starterCode: 'function isEven(n) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.EASY,
      testCases: {
        create: [
          { input: '[4]', expectedOutput: 'true', isSecret: false },
          { input: '[7]', expectedOutput: 'false', isSecret: false },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsFunctions.id,
      taskType: TaskType.CODE,
      title: 'Піднесення до степеня (Arrow Function)',
      description: 'Напишіть функцію `power(base, exp)`, яка підносить число `base` до степеня `exp`.',
      starterCode: 'const power = (base, exp) => {\n  // Ваш код тут\n};',
      difficulty: TaskDifficulty.EASY,
      testCases: {
        create: [
          { input: '[2, 3]', expectedOutput: '8', isSecret: false },
          { input: '[3, 4]', expectedOutput: '81', isSecret: true },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsCollections.id,
      taskType: TaskType.CODE,
      title: 'Фільтрація парних елементів',
      description: 'Напишіть функцію `filterEvens(numbers)`, яка приймає масив чисел і повертає новий масив тільки з парними числами.',
      starterCode: 'function filterEvens(numbers) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.MEDIUM,
      testCases: {
        create: [
          { input: '[[1, 2, 3, 4, 5, 6]]', expectedOutput: '[2,4,6]', isSecret: false },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      skillId: jsAsync.id,
      taskType: TaskType.CODE,
      title: 'Асинхронне отримання профілю користувача',
      description: 'Напишіть асинхронну функцію `fetchUser(id)`, яка за допомогою `await` повертає обʼєкт `{ id, name: "User_" + id }`.',
      starterCode: 'async function fetchUser(id) {\n  await new Promise(r => setTimeout(r, 10));\n  return { id, name: "User_" + id };\n}',
      difficulty: TaskDifficulty.HARD,
      testCases: {
        create: [
          { input: '[1]', expectedOutput: '{"id":1,"name":"User_1"}', isSecret: false },
        ],
      },
    },
  });


  // ==================== COURSE 2: ENGLISH LANGUAGE B2 ====================
  const courseEng = await prisma.course.create({
    data: {
      slug: 'english-b2',
      title: 'Business & Tech English (B2)',
      description: 'Практична англійська для IT та бізнесу: граматика, лексика та ділове листування',
      icon: 'languages',
    },
  });

  const engGrammar = await prisma.skillNode.create({
    data: {
      courseId: courseEng.id,
      slug: 'eng-grammar',
      title: 'Grammar: Advanced Tenses & Conditionals',
      description: 'Past Perfect, Passive Voice, Conditionals Type 2 & 3',
      category: 'Grammar',
      difficulty: TaskDifficulty.EASY,
    },
  });

  const engVocab = await prisma.skillNode.create({
    data: {
      courseId: courseEng.id,
      slug: 'eng-vocab',
      title: 'Tech & Business Vocabulary',
      description: 'Термінологія Agile, API, Cloud та ділові ідіоми',
      category: 'Vocabulary',
      difficulty: TaskDifficulty.MEDIUM,
    },
  });

  const engWriting = await prisma.skillNode.create({
    data: {
      courseId: courseEng.id,
      slug: 'eng-writing',
      title: 'Professional Technical Writing',
      description: 'Складання ділових листувань, специфікацій та рішень проблем',
      category: 'Writing & Communication',
      difficulty: TaskDifficulty.HARD,
    },
  });

  // Eng Dependencies
  await prisma.skillDependency.create({
    data: { parentSkillId: engGrammar.id, childSkillId: engVocab.id, requiredMastery: 0.95 },
  });
  await prisma.skillDependency.create({
    data: { parentSkillId: engVocab.id, childSkillId: engWriting.id, requiredMastery: 0.95 },
  });

  // Eng Tasks
  await prisma.task.create({
    data: {
      skillId: engGrammar.id,
      taskType: TaskType.SINGLE_CHOICE,
      title: 'Past Perfect vs Past Simple',
      description: 'Choose the correct verb form: "By the time the server crashed, the database ____ completely backed up."',
      difficulty: TaskDifficulty.EASY,
      options: [
        { id: 'a', text: 'had been', isCorrect: true },
        { id: 'b', text: 'has been', isCorrect: false },
        { id: 'c', text: 'was being', isCorrect: false },
        { id: 'd', text: 'is', isCorrect: false },
      ],
    },
  });

  await prisma.task.create({
    data: {
      skillId: engGrammar.id,
      taskType: TaskType.SINGLE_CHOICE,
      title: 'Third Conditional Syntax',
      description: 'Complete the sentence: "If we had refactored the legacy code earlier, the deployment ____ smoother."',
      difficulty: TaskDifficulty.MEDIUM,
      options: [
        { id: 'a', text: 'would have been', isCorrect: true },
        { id: 'b', text: 'will be', isCorrect: false },
        { id: 'c', text: 'would be', isCorrect: false },
        { id: 'd', text: 'had been', isCorrect: false },
      ],
    },
  });

  await prisma.task.create({
    data: {
      skillId: engVocab.id,
      taskType: TaskType.MULTIPLE_CHOICE,
      title: 'Agile & DevOps Terminology',
      description: 'Select ALL terms that directly relate to continuous software integration and testing:',
      difficulty: TaskDifficulty.MEDIUM,
      options: [
        { id: 'a', text: 'CI/CD Pipeline', isCorrect: true },
        { id: 'b', text: 'Automated Regression Suite', isCorrect: true },
        { id: 'c', text: 'Water-fall Sign-off', isCorrect: false },
        { id: 'd', text: 'Canary Deployment', isCorrect: true },
      ],
    },
  });

  await prisma.task.create({
    data: {
      skillId: engWriting.id,
      taskType: TaskType.TEXT_ESSAY,
      title: 'Drafting an API Request Email',
      description: 'Write a professional 2-3 sentence email to a Lead Architect requesting access credentials for the Staging REST API endpoint.',
      difficulty: TaskDifficulty.HARD,
      options: {
        keywords: ['api', 'staging', 'credentials', 'access', 'request', 'regards'],
        minWords: 15,
      },
    },
  });


  // ==================== COURSE 3: JURISPRUDENCE OF UKRAINE ====================
  const courseLaw = await prisma.course.create({
    data: {
      slug: 'ukraine-law',
      title: 'Правознавство & Конституційне Право України',
      description: 'Основи держави і права, Конституція України та правовий аналіз реальних юридичних кейсів',
      icon: 'scale',
    },
  });

  const lawBasics = await prisma.skillNode.create({
    data: {
      courseId: courseLaw.id,
      slug: 'law-basics',
      title: 'Модуль 1: Основи Теорії Держави і Права',
      description: 'Поняття права, норми права, джерела та класифікація юридичних фактів',
      category: 'Legal Theory',
      difficulty: TaskDifficulty.EASY,
    },
  });

  const lawConstitutional = await prisma.skillNode.create({
    data: {
      courseId: courseLaw.id,
      slug: 'law-constitutional',
      title: 'Модуль 2: Конституційне Право України',
      description: 'Основи конституційного ладу, права і свободи людини, гілки державної влади',
      category: 'Constitutional Law',
      difficulty: TaskDifficulty.MEDIUM,
    },
  });

  const lawCaseAnalysis = await prisma.skillNode.create({
    data: {
      courseId: courseLaw.id,
      slug: 'law-case-analysis',
      title: 'Модуль 3: Юридичний Аналіз Кейсів',
      description: 'Аналіз правомірності дій, кваліфікація правопорушень та складання висновків',
      category: 'Legal Practice',
      difficulty: TaskDifficulty.HARD,
    },
  });

  // Law Dependencies
  await prisma.skillDependency.create({
    data: { parentSkillId: lawBasics.id, childSkillId: lawConstitutional.id, requiredMastery: 0.95 },
  });
  await prisma.skillDependency.create({
    data: { parentSkillId: lawConstitutional.id, childSkillId: lawCaseAnalysis.id, requiredMastery: 0.95 },
  });

  // Law Tasks
  await prisma.task.create({
    data: {
      skillId: lawBasics.id,
      taskType: TaskType.SINGLE_CHOICE,
      title: 'Найвища юридична сила в Україні',
      description: 'Який нормативно-правовий акт має найвищу юридичну силу на території України?',
      difficulty: TaskDifficulty.EASY,
      options: [
        { id: 'a', text: 'Конституція України', isCorrect: true },
        { id: 'b', text: 'Закони України', isCorrect: false },
        { id: 'c', text: 'Укази Президента України', isCorrect: false },
        { id: 'd', text: 'Постанови Кабінету Міністрів України', isCorrect: false },
      ],
    },
  });

  await prisma.task.create({
    data: {
      skillId: lawConstitutional.id,
      taskType: TaskType.MULTIPLE_CHOICE,
      title: 'Обов’язки громадянина за Конституцією України',
      description: 'Оберіть УСІ конституційні обов’язки громадянина України (ст. 65-68 КУ):',
      difficulty: TaskDifficulty.MEDIUM,
      options: [
        { id: 'a', text: 'Захист Вітчизни, незалежності та територіальної цілісності', isCorrect: true },
        { id: 'b', text: 'Сплата податків і зборів у порядку і розмірах, встановлених законом', isCorrect: true },
        { id: 'c', text: 'Обов’язковий вступ до політичних партій', isCorrect: false },
        { id: 'd', text: 'Шанування державних символів України', isCorrect: true },
      ],
    },
  });

  await prisma.task.create({
    data: {
      skillId: lawCaseAnalysis.id,
      taskType: TaskType.TEXT_ESSAY,
      title: 'Аналіз правомірності звільнення працівника',
      description: 'Опишіть юридичний висновок щодо правомірності звільнення працівника під час тимчасової непрацездатності (лікарняного) за ініціативою роботодавця (ст. 40 КЗпП України).',
      difficulty: TaskDifficulty.HARD,
      options: {
        keywords: ['неправомірне', 'кзпп', 'лікарняний', 'заборона', 'поновлення'],
        minWords: 20,
      },
    },
  });

  // Initial BKT State for JS
  await prisma.bktState.create({
    data: {
      userId: student.id,
      skillId: jsBasics.id,
      pMastery: 0.5,
      pTransit: 0.2,
      pSlip: 0.1,
      pGuess: 0.2,
    },
  });

  console.log('✅ Multi-discipline seeding completed: 3 Courses (JS, English B2, Law), 11 Nodes, 12 Tasks!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
