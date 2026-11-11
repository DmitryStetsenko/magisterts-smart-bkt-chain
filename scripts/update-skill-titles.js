const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const updates = [
  // JS
  {
    slug: 'js-basics',
    title: 'Синтаксис, змінні let/const та базові типи',
    description: 'Оголошення змінних (var/let/const), примітиви, явне й неявне приведення типів та базові оператори',
  },
  {
    slug: 'js-functions',
    title: 'Функції, область видимості та замикання',
    description: 'Стрілочні та іменовані функції, параметри, lexical scope, closures та логічні розгалуження',
  },
  {
    slug: 'js-collections',
    title: 'Масиви, обʼєкти та методи вищого порядку',
    description: 'Колекції, методи map/filter/reduce, деструктуризація та глибинний доступ до властивостей',
  },
  {
    slug: 'js-async',
    title: 'Асинхронний JS, Promises та async/await',
    description: 'Асинхронний стек, мікротаски Event Loop, ланцюжки промісів та обробка помилок try/catch',
  },
  {
    slug: 'js-oop',
    title: 'ООП, класи ES6 та ланцюжок прототипів',
    description: 'Класи, конструктори, наслідування extends, super, інкапсуляція та prototype chain',
  },
  // Law
  {
    slug: 'law-basics',
    title: 'Теорія держави і права та юридичні факти',
    description: 'Поняття права, норми права, система джерел права та класифікація юридичних фактів',
  },
  {
    slug: 'law-constitutional',
    title: 'Конституційний лад та фундаментальні права',
    description: 'Основи конституційного устрою України, права і свободи людини та поділ влади',
  },
  {
    slug: 'law-case-analysis',
    title: 'Юридичний аналіз та кваліфікація кейсів',
    description: 'Оцінка правомірності дій, кваліфікація юридичних правопорушень та процесуальні висновки',
  },
  // School
  {
    slug: 'school-alg-basics',
    title: 'Змінні, базові типи та лінійні вирази',
    description: 'Оголошення let/const, числові та рядкові типи, лінійні формули та конвертери величин',
  },
  {
    slug: 'school-alg-branching',
    title: 'Умовні конструкції та логічні розгалуження',
    description: 'Оператори порівняння, логічні зв’язки && та ||, ланцюжки розгалуження if / else if',
  },
  {
    slug: 'school-alg-loops',
    title: 'Циклічні алгоритми та ітератори',
    description: 'Цикли for та while, накопичення суми, фільтрація залишку від ділення та підрахунок символів',
  },
  {
    slug: 'school-alg-functions',
    title: 'Функції та модульна декомпозиція',
    description: 'Параметри, повернення значень return, локальні змінні та декомпозиція задач на підпрограми',
  },
  {
    slug: 'school-alg-arrays',
    title: 'Масиви та обробка колекцій даних',
    description: 'Індексація елементів, обхід масиву, пошук максимуму/мінімуму та агрегація середнього балу',
  },
  {
    slug: 'school-web-dom-events',
    title: 'Інтерактивний DOM та події браузера',
    description: 'Доступ до елементів за id, безпечне виведення тексту, генерація списків та стан лічильника',
  },
  {
    slug: 'school-web-applied-projects',
    title: 'Прикладна алгоритмізація та проєкти',
    description: 'Валідація форм, живий пошук у списку та сортування турнірних таблиць',
  },
];

async function run() {
  console.log('Updating skill titles in database...');
  for (const item of updates) {
    const updated = await prisma.skillNode.updateMany({
      where: { slug: item.slug },
      data: {
        title: item.title,
        description: item.description,
      },
    });
    console.log(`Updated ${item.slug}: ${updated.count} record(s)`);
  }
  console.log('Skill titles update completed successfully.');
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
