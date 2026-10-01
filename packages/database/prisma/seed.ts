import { PrismaClient, UserRole, TaskDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

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

  console.log(`👤 Created users: Student (${student.email}), Teacher (${teacher.email})`);

  // 2. Create Skill Graph Nodes
  const jsBasics = await prisma.skillNode.upsert({
    where: { slug: 'js-basics' },
    update: {},
    create: {
      slug: 'js-basics',
      title: 'Основи JavaScript та Синтаксис',
      description: 'Базові типи даних, змінні let/const та оператори',
      category: 'Programming Languages',
      difficulty: TaskDifficulty.EASY,
    },
  });

  const jsArrays = await prisma.skillNode.upsert({
    where: { slug: 'js-arrays' },
    update: {},
    create: {
      slug: 'js-arrays',
      title: 'Масиви та Методи обходу (map/filter/reduce)',
      description: 'Робота з масивами та функціями вищого порядку',
      category: 'Data Structures',
      difficulty: TaskDifficulty.EASY,
    },
  });

  const jsAsync = await prisma.skillNode.upsert({
    where: { slug: 'js-async' },
    update: {},
    create: {
      slug: 'js-async',
      title: 'Асинхронне програмування (Promises & async/await)',
      description: 'Обробка асинхронних подій та HTTP-запитів в JS',
      category: 'Advanced JS',
      difficulty: TaskDifficulty.MEDIUM,
    },
  });

  console.log('🧠 Created skill nodes: js-basics, js-arrays, js-async');

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

  console.log('🔗 Created skill graph dependencies (js-basics -> js-arrays -> js-async)');

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

  // 5. Create Sample Practical Task
  const sumTask = await prisma.task.create({
    data: {
      skillId: jsBasics.id,
      title: 'Сума двох чисел',
      description: 'Напишіть функцію `sum(a, b)`, яка повертає суму двох чисел.',
      starterCode: 'function sum(a, b) {\n  // Ваш код тут\n}',
      difficulty: TaskDifficulty.EASY,
      testCases: {
        create: [
          { input: '2, 3', expectedOutput: '5', isSecret: false },
          { input: '-1, 1', expectedOutput: '0', isSecret: false },
          { input: '100, 200', expectedOutput: '300', isSecret: true },
        ],
      },
    },
  });

  console.log(`📝 Created sample task: ${sumTask.title}`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
